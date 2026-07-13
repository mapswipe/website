// astro-hydration-dedup — Astro integration that deduplicates byte-identical
// inline classic <script> blocks (Astro's island-hydration runtimes) across
// statically built pages into external, content-hashed, cacheable files.
// A `astro:build:done` post-process.
//
// UPSTREAM: force-inlining is documented, unconfigurable behavior. References:
//   https://github.com/withastro/docs/issues/2150 (inlined even with assetsInlineLimit: 0)
//   https://github.com/withastro/roadmap/discussions/36 (the decision that inlined them)
//   https://github.com/withastro/astro/issues/6247 (related cross-page inlining heuristic)
// Delete this package when an external-hydration-scripts option lands.
//
// Why: Astro hard-inlines its directive runtimes (the ~130 B `Astro.only`
// loader, the ~3.5 KB <astro-island> custom-element runtime, the ~370 B
// `client:visible` loader) into EVERY island-bearing page. With ~14.6k island
// pages that is ~55–57 MB of byte-identical duplication (~12% of dist).
// `vite.build.assetsInlineLimit: 0` has no effect on these (verified
// empirically) — hence this post-process.
//
// How (fully generic — no app-specific paths):
//   1. DISCOVER: scan every built HTML page (subject to include/exclude) for
//      inline attribute-less classic <script>…</script> blocks and tally, per
//      distinct EXACT byte sequence, how many pages carry it. Pages that
//      already reference a previously emitted file for the same content (a
//      merged, already-rewritten dist) count toward the same tally.
//   2. EMIT one external content-hashed file PER distinct script whose page
//      count reaches `minOccurrences` — e.g. `_astro/dedup-<hash8>.js`.
//   3. REWRITE every occurrence in place: each qualifying inline block becomes
//      `<script src="…"></script>` (a classic BLOCKING script) at the exact
//      position the inline block occupied. Per-script in-place replacement
//      preserves execution position and order for ARBITRARY directive
//      combinations across pages — no assumptions about which scripts co-occur.
//      Pages carrying none of the qualifying blocks are left untouched.
//
// Idempotency: a page whose inline block was already externalized simply has
// no inline block left to match — re-running the integration over a merged,
// previously rewritten dist is a natural no-op for those pages.
//
// Fail-soft: any anomaly logs a warning and leaves dist as-is; the build never
// fails over an optimization.
//
// Ordering: register LAST in astro.config.mjs so it runs after other
// build:done hooks (e.g. @astrojs/sitemap).
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

export interface HydrationDedupOptions {
    /**
     * A distinct inline script is externalized only when it appears verbatim
     * on at least this many pages. This is also the safety guard against
     * externalizing page-specific scripts: anything rarer stays inline.
     * Default 10 — e.g. an island runtime shared by only 6 sibling pages
     * stays inline at the default; lower the threshold to catch it.
     */
    minOccurrences?: number;
    /** Directory under the build output to emit the shared files into. Default `_astro`. */
    outDir?: string;
    /** Emitted filename prefix: `<filenamePrefix>-<hash8>.js`. Default `dedup`. */
    filenamePrefix?: string;
    /**
     * Page globs (relative to the build output, `/`-separated, `**`/`*`/`?`)
     * to consider. Default: every `** /*.html`.
     */
    include?: string[];
    /** Page globs to skip. Applied after `include`. Default none. */
    exclude?: string[];
    /** Master switch. Default true. */
    enabled?: boolean;
}

// Inline classic scripts exactly as Astro emits its directive runtimes: an
// attribute-less <script> tag (no src, no type). Anything with attributes is
// intentionally NOT matched.
const INLINE_SCRIPT_RE = /<script>[\s\S]*?<\/script>/g;

// Concurrent file reads/rewrites — tens of thousands of small files; keep
// wall-time low without exhausting file descriptors.
const POOL_SIZE = 16;

/** Minimal glob → RegExp: `**` crosses `/`, `*` and `?` don't. */
function globToRegExp(glob: string): RegExp {
    let out = '';
    let i = 0;
    while (i < glob.length) {
        const c = glob[i];
        if (c === '*') {
            if (glob[i + 1] === '*') {
                if (glob[i + 2] === '/') {
                    out += '(?:.*/)?';
                    i += 3;
                } else {
                    out += '.*';
                    i += 2;
                }
            } else {
                out += '[^/]*';
                i += 1;
            }
        } else if (c === '?') {
            out += '[^/]';
            i += 1;
        } else {
            out += c.replace(/[.+^${}()|[\]\\]/, '\\$&');
            i += 1;
        }
    }
    return new RegExp(`^${out}$`);
}

async function listHtmlFiles(root: string): Promise<string[]> {
    const entries = await readdir(root, { recursive: true });
    return entries.filter((e) => e.endsWith('.html'));
}

// Run `fn` over `items` with at most `size` in flight.
async function asyncPool<T, R>(
    size: number,
    items: readonly T[],
    fn: (item: T) => Promise<R>,
): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let next = 0;
    const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
        while (next < items.length) {
            const i = next;
            next += 1;
            results[i] = await fn(items[i]);
        }
    });
    await Promise.all(workers);
    return results;
}

function contentHash(body: string): string {
    return createHash('sha256').update(body).digest('hex').slice(0, 8);
}

function escapeRe(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function hydrationDedup(options: HydrationDedupOptions = {}): AstroIntegration {
    const {
        minOccurrences = 10,
        outDir = '_astro',
        filenamePrefix = 'dedup',
        include,
        exclude,
        enabled = true,
    } = options;

    const includeRes = include?.map(globToRegExp);
    const excludeRes = exclude?.map(globToRegExp);

    return {
        name: 'astro-hydration-dedup',
        hooks: {
            'astro:build:done': async ({ dir, logger }) => {
                if (!enabled) {
                    logger.info('disabled via options — skipped');
                    return;
                }
                try {
                    const dist = fileURLToPath(dir);
                    const allHtml = await listHtmlFiles(dist);
                    // Normalized (posix) dist-relative paths for glob matching.
                    const pages = allHtml
                        .map((rel) => ({ rel, url: rel.split(sep).join('/') }))
                        .filter(({ url }) => (includeRes ? includeRes.some((re) => re.test(url)) : true))
                        .filter(({ url }) => (excludeRes ? !excludeRes.some((re) => re.test(url)) : true));
                    if (pages.length === 0) {
                        logger.warn('skipped: no HTML pages matched in the build output');
                        return;
                    }

                    // -- 1. Discover: tally distinct inline blocks across pages.
                    interface BlockInfo {
                        pages: number; // pages carrying the block inline
                        refPages: number; // pages already referencing its emitted file
                    }
                    const blocks = new Map<string, BlockInfo>();
                    // Per page: the distinct inline blocks it carries.
                    const pageBlocks = new Map<string, string[]>();
                    // Pages already referencing an emitted file (idempotency
                    // across merged, previously-rewritten trees): tally the
                    // hash8 they reference so counts stay stable.
                    const refCounts = new Map<string, number>();
                    const REF_RE = new RegExp(
                        `<script src="/${escapeRe(outDir)}/${escapeRe(filenamePrefix)}-([0-9a-f]{8})\\.js"></script>`,
                        'g',
                    );
                    await asyncPool(POOL_SIZE, pages, async ({ rel }) => {
                        const html = await readFile(join(dist, rel), 'utf8');
                        const found = html.match(INLINE_SCRIPT_RE) ?? [];
                        if (found.length > 0) {
                            const distinct = [...new Set(found)];
                            pageBlocks.set(rel, distinct);
                            for (const block of distinct) {
                                const info = blocks.get(block);
                                if (info) {
                                    info.pages += 1;
                                } else {
                                    blocks.set(block, { pages: 1, refPages: 0 });
                                }
                            }
                        }
                        for (const m of html.matchAll(REF_RE)) {
                            refCounts.set(m[1], (refCounts.get(m[1]) ?? 0) + 1);
                        }
                    });
                    if (blocks.size === 0) {
                        logger.info(`no inline classic scripts found across ${pages.length} page(s) — nothing to do`);
                        return;
                    }

                    // -- 2. Select + emit: one file per qualifying block.
                    interface Emitted {
                        block: string;
                        srcTag: string;
                        fileName: string;
                        bytes: number;
                        pages: number;
                    }
                    const emitted: Emitted[] = [];
                    for (const [block, info] of blocks) {
                        const body = block.replace(/^<script>/, '').replace(/<\/script>$/, '');
                        const hash = contentHash(body);
                        const total = info.pages + (refCounts.get(hash) ?? 0);
                        if (total < minOccurrences) {
                            continue;
                        }
                        const fileName = `${filenamePrefix}-${hash}.js`;
                        await mkdir(join(dist, outDir), { recursive: true });
                        await writeFile(join(dist, outDir, fileName), body);
                        emitted.push({
                            block,
                            srcTag: `<script src="/${outDir}/${fileName}"></script>`,
                            fileName,
                            bytes: body.length,
                            pages: info.pages,
                        });
                    }
                    if (emitted.length === 0) {
                        logger.info(
                            `no inline script recurs on >= ${minOccurrences} page(s) `
                            + `(${blocks.size} distinct found) — nothing externalized`,
                        );
                        return;
                    }

                    // -- 3. Rewrite in place, only on pages known to carry a block.
                    let rewritten = 0;
                    const carriers = [...pageBlocks.entries()]
                        .filter(([, list]) => list.some((b) => emitted.some((e) => e.block === b)))
                        .map(([rel]) => rel);
                    await asyncPool(POOL_SIZE, carriers, async (rel) => {
                        const file = join(dist, rel);
                        const html = await readFile(file, 'utf8');
                        let out = html;
                        for (const e of emitted) {
                            // Replace EVERY occurrence at its own position —
                            // preserves execution position/order per page.
                            out = out.split(e.block).join(e.srcTag);
                        }
                        if (out !== html) {
                            await writeFile(file, out);
                            rewritten += 1;
                        }
                    });

                    const saved = emitted.reduce((acc, e) => acc + e.bytes * Math.max(0, e.pages - 1), 0);
                    logger.info(
                        `${emitted.length} shared script(s) externalized, ${rewritten} page(s) rewritten `
                        + `(${pages.length} scanned, ${blocks.size} distinct inline blocks, `
                        + `~${(saved / 1024 / 1024).toFixed(1)} MB deduplicated): `
                        + emitted.map((e) => `${outDir}/${e.fileName} (${e.bytes} B × ${e.pages} pages)`).join(', '),
                    );
                } catch (err) {
                    // Fail-soft: never break the build over an optimization.
                    const reason = err instanceof Error ? err.message : String(err);
                    logger.warn(`skipped: ${reason}`);
                }
            },
        },
    };
}
