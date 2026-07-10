/**
 * Incremental static-build support for Astro (`output: 'static'`).
 *
 * A plain `astro build` renders every path returned by every `getStaticPaths`
 * on every build. To skip unchanged pages we compute, per candidate path, a
 * `propsHash` of the page's *data* and compare it against the manifest
 * persisted by the previous build. A page is (re)built only when:
 *   - the global `codeHash` changed (any code/content input changed), or
 *   - its `propsHash` changed (its data changed), or
 *   - it is new (no manifest entry).
 *
 * Unbuilt pages are supplied by merging the previous build's `dist/` over the
 * fresh partial `dist/` in `scripts/incremental-build.mjs`.
 *
 * ACTIVATION: all of this happens ONLY when `ASTRO_INCREMENTAL=1` is set in the
 * environment — which only `scripts/incremental-build.mjs` does when it spawns
 * `astro build`. A plain `npm run build` is ALWAYS a full build, even when a
 * stale `.astro-incremental/` (code-hash + manifest from an earlier incremental
 * run) is sitting on disk. Gating on the env var rather than on the presence of
 * the code-hash file is deliberate: file presence is stale state, not intent.
 *
 * Everything here runs only inside `getStaticPaths` (build time, Node). The
 * Node `fs`/`crypto` imports are tree-shaken out of any client/island bundle
 * because they are unreachable from a page component.
 *
 * This is the Astro port of the Next app's src/utils/incrementalBuild.ts; the
 * design (per-path propsHash, per-page manifest shards, code-hash gate) is
 * identical — only the integration point differs (getStaticPaths vs
 * getStaticProps, static-export vs static-export).
 */
import { createHash } from 'node:crypto';
import {
    mkdirSync,
    readFileSync,
    writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

/** Gitignored dir shared with scripts/incremental-build.mjs. */
const INCR_DIR = join(process.cwd(), '.astro-incremental');
const SHARD_DIR = join(INCR_DIR, 'shards');
const MANIFEST_PATH = join(INCR_DIR, 'manifest.json');
const CODE_HASH_PATH = join(INCR_DIR, 'code-hash.txt');

export interface Manifest {
    codeHash: string;
    paths: Record<string, string>;
}

/**
 * True ONLY when running under scripts/incremental-build.mjs, which sets
 * ASTRO_INCREMENTAL=1 in the `astro build` child's environment. `process.env`
 * is the real Node env here (getStaticPaths runs server-side at build time —
 * same mechanism src/lib/data.ts uses for MAPSWIPE_DATA_FILE), not a Vite
 * compile-time replacement.
 */
export function isIncrementalBuild(): boolean {
    return process.env.ASTRO_INCREMENTAL === '1';
}

/**
 * Hash a page's data. Volatile fields that change every build without
 * representing a real content change are stripped first (otherwise every page
 * would re-invalidate on each run). `buildDate` is the Astro equivalent of the
 * Next `buildDate` prop.
 *
 * No key-sorting/canonicalisation: values come from staticData.json (written
 * once at fetch time) via fixed code paths, so JSON key order is already
 * deterministic across builds. Keeping this cheap matters — it runs for every
 * candidate path (14k+).
 */
export function hashProps(propsData: unknown): string {
    let payload = propsData;
    if (propsData && typeof propsData === 'object' && !Array.isArray(propsData)) {
        const rest = { ...(propsData as Record<string, unknown>) };
        delete rest.buildDate;
        payload = rest;
    }
    return createHash('sha1').update(JSON.stringify(payload)).digest('hex');
}

export function readCodeHash(): string {
    try {
        return readFileSync(CODE_HASH_PATH, 'utf8').trim();
    } catch {
        return '';
    }
}

let cachedManifest: Manifest | undefined;
export function readManifest(): Manifest {
    if (!cachedManifest) {
        try {
            cachedManifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as Manifest;
        } catch {
            cachedManifest = { codeHash: '', paths: {} };
        }
    }
    return cachedManifest;
}

export interface Candidate<Params, Props = undefined> {
    /**
     * Canonical dist/ out-path key, e.g. `en/projects/<id>` — no leading or
     * trailing slash. Used to correlate with the prior manifest and to drive
     * pruning of deleted pages in the orchestration.
     */
    key: string;
    /** getStaticPaths params for this path. */
    params: Params;
    /**
     * The data whose change should trigger a rebuild. Pages that share one
     * logical record (e.g. a project's 6 locale variants) SHOULD pass the SAME
     * object reference here so the hash is memoised once across them.
     */
    propsData: unknown;
    /** Optional getStaticPaths props to forward for selected paths. */
    props?: Props;
}

function toPath<Params, Props>(
    candidate: Candidate<Params, Props>,
): { params: Params; props?: Props } {
    return candidate.props === undefined
        ? { params: candidate.params }
        : { params: candidate.params, props: candidate.props };
}

/**
 * Decide which candidate paths to (re)build and persist this page's shard of
 * the manifest (the full candidate set with hashes — used by the orchestration
 * to rebuild the merged manifest and to prune deleted pages).
 *
 * Outside the orchestration (no ASTRO_INCREMENTAL=1 → a normal full
 * `astro build`) EVERY candidate is returned and NO state is read or written —
 * the normal build path is completely unaffected, regardless of what a
 * previous incremental run may have left in `.astro-incremental/`.
 *
 * Under the orchestration, a changed (or unreadable) codeHash also returns
 * every candidate (full rebuild), and shards are always written so the
 * orchestration can persist the complete current manifest.
 *
 * `computeProps` is not needed as a separate arg here (unlike the Next impl)
 * because Astro's getStaticPaths already computes the data up front; the caller
 * passes it in as `candidate.propsData`. Memoisation across shared references
 * is still applied so the 6 locale variants of one project hash once.
 */
export function selectPaths<Params, Props = undefined>(
    pageId: string,
    candidates: Candidate<Params, Props>[],
): { params: Params; props?: Props }[] {
    if (!isIncrementalBuild()) {
        return candidates.map(toPath);
    }

    const codeHash = readCodeHash();
    const prev = readManifest();
    // Empty/unreadable codeHash (defensive — the orchestration always writes it
    // before spawning the build) or a changed codeHash => full rebuild.
    const codeChanged = codeHash === '' || prev.codeHash !== codeHash;

    // propsData is often the SAME object reference for pages sharing data (a
    // project's 6 locale variants), so memoise the hash by identity to avoid
    // re-serialising the same data once per locale.
    const hashByRef = new WeakMap<object, string>();
    const memoHash = (propsData: unknown): string => {
        if (propsData && typeof propsData === 'object') {
            const cached = hashByRef.get(propsData);
            if (cached !== undefined) {
                return cached;
            }
            const computed = hashProps(propsData);
            hashByRef.set(propsData, computed);
            return computed;
        }
        return hashProps(propsData);
    };

    const shard: Record<string, string> = {};
    const toBuild: { params: Params; props?: Props }[] = [];
    for (const candidate of candidates) {
        const propsHash = memoHash(candidate.propsData);
        shard[candidate.key] = propsHash;
        if (codeChanged || prev.paths[candidate.key] !== propsHash) {
            toBuild.push(toPath(candidate));
        }
    }

    mkdirSync(SHARD_DIR, { recursive: true });
    writeFileSync(join(SHARD_DIR, `${pageId}.json`), JSON.stringify(shard));

    return toBuild;
}
