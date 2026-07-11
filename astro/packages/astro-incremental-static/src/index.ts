/**
 * astro-incremental-static — page-side API.
 *
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
 * Unbuilt pages are supplied by merging the previous build's dist over the
 * fresh partial dist — see ./runner.ts (`runIncrementalBuild`).
 *
 * ACTIVATION: all of this happens ONLY when `ASTRO_INCREMENTAL=1` is set in
 * the environment — which only the runner does when it spawns `astro build`.
 * A plain `astro build` is ALWAYS a full build, even when a stale state dir
 * (code-hash + manifest from an earlier incremental run) is sitting on disk.
 * Gating on the env var rather than on the presence of the code-hash file is
 * deliberate: file presence is stale state, not intent.
 *
 * CORRECTNESS CONTRACT (yours to uphold): `candidate.propsData` must cover
 * EVERYTHING that can change the rendered page apart from code (which the
 * runner's codeHash covers). Data you render but leave out of propsData
 * silently produces STALE pages — the page won't rebuild when only that data
 * changes.
 *
 * Everything here runs only inside `getStaticPaths` (build time, Node). The
 * Node `fs`/`crypto` imports are tree-shaken out of any client/island bundle
 * because they are unreachable from a page component.
 */
import { createHash } from 'node:crypto';
import {
    mkdirSync,
    readFileSync,
    writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

/**
 * State dir shared with the runner. The runner exports its configured
 * `stateDir` to the spawned build via ASTRO_INCREMENTAL_STATE_DIR; outside
 * the runner the default matches the runner's default.
 */
function stateDirPath(override?: string): string {
    return override
        ?? process.env.ASTRO_INCREMENTAL_STATE_DIR
        ?? join(process.cwd(), '.astro-incremental');
}

export interface Manifest {
    codeHash: string;
    paths: Record<string, string>;
}

/**
 * True ONLY when running under the incremental runner, which sets
 * ASTRO_INCREMENTAL=1 in the `astro build` child's environment. `process.env`
 * is the real Node env here (getStaticPaths runs server-side at build time),
 * not a Vite compile-time replacement.
 */
export function isIncrementalBuild(): boolean {
    return process.env.ASTRO_INCREMENTAL === '1';
}

/**
 * Hash a page's data. Volatile fields that change every build without
 * representing a real content change are stripped first (otherwise every page
 * would re-invalidate on each run) — currently the conventional `buildDate`
 * top-level key.
 *
 * No key-sorting/canonicalisation: values are expected to come from a data
 * snapshot (written once at fetch time) via fixed code paths, so JSON key
 * order is already deterministic across builds. Keeping this cheap matters —
 * it runs for every candidate path (potentially 10k+).
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

export function readCodeHash(stateDir?: string): string {
    try {
        return readFileSync(join(stateDirPath(stateDir), 'code-hash.txt'), 'utf8').trim();
    } catch {
        return '';
    }
}

let cachedManifest: Manifest | undefined;
export function readManifest(stateDir?: string): Manifest {
    if (!cachedManifest) {
        try {
            cachedManifest = JSON.parse(
                readFileSync(join(stateDirPath(stateDir), 'manifest.json'), 'utf8'),
            ) as Manifest;
        } catch {
            cachedManifest = { codeHash: '', paths: {} };
        }
    }
    return cachedManifest;
}

export interface Candidate<Params, Props = undefined> {
    /**
     * Canonical dist out-path key, e.g. `en/projects/<id>` — no leading or
     * trailing slash. Used to correlate with the prior manifest and to drive
     * pruning of deleted pages in the runner.
     */
    key: string;
    /** getStaticPaths params for this path. */
    params: Params;
    /**
     * The data whose change should trigger a rebuild. Pages that share one
     * logical record (e.g. a record's per-locale variants) SHOULD pass the
     * SAME object reference here so the hash is memoised once across them.
     * MUST be complete — see the correctness contract in the module header.
     */
    propsData: unknown;
    /** Optional getStaticPaths props to forward for selected paths. */
    props?: Props;
}

export interface SelectPathsOptions {
    /** Override the state dir (default: ASTRO_INCREMENTAL_STATE_DIR env or `<cwd>/.astro-incremental`). */
    stateDir?: string;
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
 * the manifest (the full candidate set with hashes — used by the runner to
 * rebuild the merged manifest and to prune deleted pages).
 *
 * Outside the runner (no ASTRO_INCREMENTAL=1 → a normal full `astro build`)
 * EVERY candidate is returned and NO state is read or written — the normal
 * build path is completely unaffected, regardless of what a previous
 * incremental run may have left in the state dir.
 *
 * Under the runner, a changed (or unreadable) codeHash also returns every
 * candidate (full rebuild), and shards are always written so the runner can
 * persist the complete current manifest.
 */
export function selectPaths<Params, Props = undefined>(
    pageId: string,
    candidates: Candidate<Params, Props>[],
    opts: SelectPathsOptions = {},
): { params: Params; props?: Props }[] {
    if (!isIncrementalBuild()) {
        return candidates.map(toPath);
    }

    const stateDir = stateDirPath(opts.stateDir);
    const codeHash = readCodeHash(opts.stateDir);
    const prev = readManifest(opts.stateDir);
    // Empty/unreadable codeHash (defensive — the runner always writes it
    // before spawning the build) or a changed codeHash => full rebuild.
    const codeChanged = codeHash === '' || prev.codeHash !== codeHash;

    // propsData is often the SAME object reference for pages sharing data
    // (a record's per-locale variants), so memoise the hash by identity to
    // avoid re-serialising the same data once per locale.
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

    const shardDir = join(stateDir, 'shards');
    mkdirSync(shardDir, { recursive: true });
    writeFileSync(join(shardDir, `${pageId}.json`), JSON.stringify(shard));

    return toBuild;
}
