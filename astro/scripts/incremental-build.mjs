#!/usr/bin/env node
/**
 * Incremental static-build orchestration for the Astro app.
 *
 * `astro build` (output: 'static') re-renders every path returned by every
 * getStaticPaths on every build. To avoid that we:
 *   1. compute a global `codeHash` over code/content inputs (NOT the data),
 *   2. move the previous build's `dist/` aside (restored from CI cache),
 *   3. run the image prefetch + `astro build` with ASTRO_INCREMENTAL=1 —
 *      getStaticPaths (via src/lib/incremental.ts) reads the codeHash +
 *      previous manifest and returns ONLY the pages whose code or data
 *      changed,
 *   4. merge the previous `dist/` *under* the fresh one (fresh wins),
 *   5. prune project/blog page dirs whose record no longer exists,
 *   6. regenerate the sitemap over the MERGED tree (the fresh build's sitemap
 *      only covers the pages rendered this run),
 *   7. persist the new manifest for the next run.
 *
 * codeHash unchanged + data unchanged => ~0 pages rendered (compile only).
 * codeHash changed                    => everything rebuilt (fresh authoritative).
 *
 * ASTRO_INCREMENTAL=1 is the ONLY thing that activates the per-page selection:
 * a plain `npm run build` (which never sets it) is always a full build, even
 * with a stale `.astro-incremental/` on disk.
 *
 * Always-full pages: routes WITHOUT a selectPaths-wired getStaticPaths are
 * (cheaply) re-emitted on every run — the root/locale-less redirect stubs, the
 * root index.astro, 404.astro, and the /data-explorer.json static endpoint.
 * That last one matters: the endpoint has no getStaticPaths, so the JSON
 * dataset regenerates on every incremental build and stays in sync with
 * whatever data change triggered the run.
 *
 * This mirrors the Next app's scripts/incremental-build.mjs; the orchestration
 * (manifest, move-aside, merge, prune, codeHash, sitemap) is framework-
 * agnostic. The per-page selection lives in getStaticPaths via
 * src/lib/incremental.ts.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
    closeSync,
    cpSync,
    existsSync,
    mkdirSync,
    openSync,
    readFileSync,
    readSync,
    readdirSync,
    renameSync,
    rmSync,
    statSync,
    writeFileSync,
} from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const DIST_CACHE = join(ROOT, 'dist-cache');
const INCR_DIR = join(ROOT, '.astro-incremental');
const SHARD_DIR = join(INCR_DIR, 'shards');
const MANIFEST_PATH = join(INCR_DIR, 'manifest.json');
const CODE_HASH_PATH = join(INCR_DIR, 'code-hash.txt');

// Keep in sync with astro.config.mjs (site + i18n.locales + i18n.defaultLocale).
// Not imported from there: astro.config.mjs pulls in integrations (a .ts file
// among them), which plain Node can't load.
const SITE = 'https://mapswipe.org';
const LOCALES = ['en', 'ne', 'hu', 'de', 'cs', 'pt'];
const DEFAULT_LOCALE = 'en';

const startTime = process.hrtime.bigint();
const elapsed = () => `${(Number(process.hrtime.bigint() - startTime) / 1e9).toFixed(1)}s`;
const log = (msg) => process.stdout.write(`[incremental-build +${elapsed()}] ${msg}\n`);

function bin(name) {
    const local = join(ROOT, 'node_modules', '.bin', name);
    return existsSync(local) ? local : name;
}

function run(command, args, extraEnv = {}) {
    const resolved = command === 'node' ? 'node' : bin(command);
    log(`$ ${command} ${args.join(' ')}`);
    const before = process.hrtime.bigint();
    const result = spawnSync(resolved, args, {
        stdio: 'inherit',
        env: { ...process.env, ...extraEnv },
        shell: false,
    });
    log(`  └ ${command} took ${(Number(process.hrtime.bigint() - before) / 1e9).toFixed(1)}s`);
    if (result.status !== 0) {
        throw new Error(`${command} exited with ${result.status ?? result.signal}`);
    }
}

// ---------------------------------------------------------------------------
// 1. codeHash — hash of every code/content input that affects rendered output.
//    Includes src/, astro.config.mjs, package.json, and the repo-root
//    public/locales (the i18next glob in src/i18n reads ../public/locales —
//    there is no astro/public/locales copy or symlink).
//    EXCLUDES the data axis (fullData/ and blogs/ are tracked per-page via
//    propsHash) and all build artifacts (dist/, .astro/, .image-cache/,
//    .astro-incremental/) plus the generated optimized images (public/_img/).
// ---------------------------------------------------------------------------
function collectFiles(dir, acc) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            collectFiles(full, acc);
        } else if (entry.isFile()) {
            acc.push(full);
        }
    }
    return acc;
}

function computeCodeHash() {
    const files = [];

    // Recurse src/.
    const srcDir = join(ROOT, 'src');
    if (existsSync(srcDir)) {
        collectFiles(srcDir, files);
    }

    // Translations affect output. They live at the REPO ROOT's public/locales
    // (shared with the Next app; read via the ../../../public/locales glob in
    // src/i18n/index.ts). Skip astro/public/ entirely — public/_img/ is
    // generated per-build and other static assets are copied verbatim, so they
    // never change what getStaticPaths returns.
    const localesDir = join(ROOT, '..', 'public', 'locales');
    if (existsSync(localesDir)) {
        collectFiles(localesDir, files);
    }

    // Named root config/manifest files.
    for (const name of ['astro.config.mjs', 'package.json']) {
        const p = join(ROOT, name);
        if (existsSync(p)) {
            files.push(p);
        }
    }

    files.sort();
    const hash = createHash('sha1');
    for (const file of files) {
        // Label with the ROOT-relative path (e.g. `../public/locales/...` for
        // the repo-root translations) so the hash is machine-independent.
        hash.update(relative(ROOT, file));
        hash.update('\0');
        hash.update(readFileSync(file));
        hash.update('\0');
    }
    return hash.digest('hex');
}

// ---------------------------------------------------------------------------
// helpers for merge + prune
// ---------------------------------------------------------------------------
function readShards() {
    const merged = {};
    if (!existsSync(SHARD_DIR)) {
        return merged;
    }
    for (const name of readdirSync(SHARD_DIR)) {
        if (!name.endsWith('.json')) {
            continue;
        }
        const shard = JSON.parse(readFileSync(join(SHARD_DIR, name), 'utf8'));
        Object.assign(merged, shard);
    }
    return merged;
}

function isDir(p) {
    try {
        return statSync(p).isDirectory();
    } catch {
        return false;
    }
}

/**
 * Remove project/blog page directories that are no longer in the current path
 * set (deleted projects/blogs). Static/aggregate pages are never tracked as a
 * project/blog dir here, so they are never pruned. Orphaned optimised images
 * for deleted projects are left behind (unreferenced, harmless).
 *
 * key format matches selectPaths: `${locale}/projects/${id}` and
 * `${locale}/blogs/${slug}`.
 */
function pruneDeletions(validKeys) {
    if (!isDir(DIST)) {
        return 0;
    }
    let removed = 0;
    const ASSET_DIRS = new Set(['_astro', '_img', 'img', 'locales']);
    for (const localeEntry of readdirSync(DIST, { withFileTypes: true })) {
        if (!localeEntry.isDirectory() || ASSET_DIRS.has(localeEntry.name)) {
            continue;
        }
        const locale = localeEntry.name;
        for (const section of ['projects', 'blogs']) {
            const sectionDir = join(DIST, locale, section);
            if (!isDir(sectionDir)) {
                continue;
            }
            for (const child of readdirSync(sectionDir, { withFileTypes: true })) {
                if (!child.isDirectory()) {
                    continue; // e.g. blogs/index.html (the list page)
                }
                const key = `${locale}/${section}/${child.name}`;
                if (!validKeys.has(key)) {
                    rmSync(join(sectionDir, child.name), { recursive: true, force: true });
                    removed += 1;
                }
            }
        }
    }
    return removed;
}

// ---------------------------------------------------------------------------
// sitemap regeneration over the MERGED tree
//
// On the merge path the fresh build's sitemap-0.xml covers ONLY the pages
// rendered this run (e.g. 13 URLs after a 1-project change) and, having been
// copied over the cached full sitemap, would silently shrink the published one
// to a sliver. So after merging we regenerate it from the merged dist itself,
// emitting the exact structure @astrojs/sitemap produces with our i18n config
// (verified structurally identical to a full build's sitemap):
//   - one <url> per page dir's index.html,
//   - pages grouped by path-minus-locale-prefix; every member of a group
//     carries the SAME <xhtml:link rel="alternate" hreflang=...> list (all
//     members, href-sorted; no x-default — our config doesn't set one),
//   - locale-less pages (the root /) count as DEFAULT_LOCALE, which is why the
//     root group has 7 alternates (/, /en/, + 5 others) with hreflang "en"
//     twice — @astrojs/sitemap does the same,
//   - the config-redirect stubs (/blogs/, /data/, ... meta-refresh pages) are
//     EXCLUDED, as astro excludes redirect routes; the root / — also a
//     meta-refresh page but a real page route (src/pages/index.astro) — is
//     INCLUDED, again matching astro,
//   - 404.html is naturally excluded (not an index.html).
// ---------------------------------------------------------------------------

/** True when the file starts as one of our meta-refresh redirect pages. */
function isMetaRefreshStub(filePath) {
    const fd = openSync(filePath, 'r');
    try {
        const buf = Buffer.alloc(512);
        const n = readSync(fd, buf, 0, 512, 0);
        return buf.toString('utf8', 0, n).includes('http-equiv="refresh"');
    } finally {
        closeSync(fd);
    }
}

function regenerateSitemap() {
    // 1. Collect every page URL from the merged dist.
    const urlPaths = [];
    for (const entry of readdirSync(DIST, { recursive: true })) {
        const rel = String(entry);
        if (rel !== 'index.html' && !rel.endsWith(`${sep}index.html`)) {
            continue;
        }
        const dir = rel === 'index.html' ? '' : rel.slice(0, -`${sep}index.html`.length);
        const urlPath = dir === '' ? '/' : `/${dir.split(sep).join('/')}/`;
        // Config-redirect stubs are excluded from the sitemap; the root '/'
        // (also a meta-refresh page, but a page route) is included.
        if (urlPath !== '/' && isMetaRefreshStub(join(DIST, rel))) {
            continue;
        }
        urlPaths.push(urlPath);
    }
    urlPaths.sort();

    // 2. Group by path-minus-locale-prefix; hreflang from the prefix (or the
    //    default locale for unprefixed paths like '/').
    const groups = new Map(); // groupKey -> [{ urlPath, hreflang }]
    for (const urlPath of urlPaths) {
        const [first, ...rest] = urlPath.slice(1).split('/');
        const isLocale = LOCALES.includes(first);
        const groupKey = isLocale ? `/${rest.join('/')}` : urlPath;
        const hreflang = isLocale ? first : DEFAULT_LOCALE;
        if (!groups.has(groupKey)) {
            groups.set(groupKey, []);
        }
        groups.get(groupKey).push({ urlPath, hreflang });
    }

    // 3. Emit (single line, same as @astrojs/sitemap).
    const loc = (urlPath) => `${SITE}${urlPath}`;
    const parts = [];
    for (const urlPath of urlPaths) {
        const [first, ...rest] = urlPath.slice(1).split('/');
        const groupKey = LOCALES.includes(first) ? `/${rest.join('/')}` : urlPath;
        const group = groups.get(groupKey);
        const alternates = group.length > 1
            ? group
                .map(({ urlPath: p, hreflang }) => (
                    `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${loc(p)}"/>`
                ))
                .join('')
            : '';
        parts.push(`<url><loc>${loc(urlPath)}</loc>${alternates}</url>`);
    }
    const urlset = '<?xml version="1.0" encoding="UTF-8"?>'
        + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
        + ' xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"'
        + ' xmlns:xhtml="http://www.w3.org/1999/xhtml"'
        + ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
        + ' xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">'
        + `${parts.join('')}</urlset>`;
    writeFileSync(join(DIST, 'sitemap-0.xml'), urlset);
    writeFileSync(
        join(DIST, 'sitemap-index.xml'),
        '<?xml version="1.0" encoding="UTF-8"?>'
        + '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        + `<sitemap><loc>${SITE}/sitemap-0.xml</loc></sitemap></sitemapindex>`,
    );
    return urlPaths.length;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
function main() {
    // 1. codeHash → file (read by getStaticPaths via src/lib/incremental.ts).
    mkdirSync(INCR_DIR, { recursive: true });
    rmSync(SHARD_DIR, { recursive: true, force: true });
    const codeHash = computeCodeHash();
    writeFileSync(CODE_HASH_PATH, codeHash);

    let prevManifest = { codeHash: '', paths: {} };
    try {
        prevManifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
    } catch {
        // cold build
    }
    const codeChanged = prevManifest.codeHash !== codeHash;
    log(`codeHash ${codeHash}${codeChanged ? ' (changed → full rebuild)' : ' (unchanged → data-only)'}`);

    // 2. Move the restored previous dist/ aside so astro build starts clean.
    rmSync(DIST_CACHE, { recursive: true, force: true });
    if (existsSync(DIST)) {
        renameSync(DIST, DIST_CACHE);
        log('moved previous dist/ → dist-cache/');
    } else {
        log('no previous dist/ (cold build)');
    }

    // 3. Prefetch images, then build only the changed/new paths.
    //    ASTRO_INCREMENTAL=1 is what arms selectPaths — without it (any plain
    //    `astro build`) every getStaticPaths returns all its candidates.
    run('node', ['scripts/prefetch-images.mjs']);
    run('astro', ['build'], { ASTRO_INCREMENTAL: '1' });

    // 4. Merge. On a full rebuild (codeChanged) the fresh tree already contains
    //    every current page, so there is nothing to merge and no stale page to
    //    prune — just discard the cache. On a data-only build the fresh tree is
    //    small (the changed pages + re-emitted images + shared JS/CSS) while the
    //    cache holds ~all 14.7k HTML, so overlay the SMALL fresh tree onto the
    //    LARGE cached one (fresh wins) via a copy into the cache, then rename the
    //    merged cache back to dist/ — keeping the 14.7k unchanged files in place.
    const manifestPaths = readShards();
    if (codeChanged) {
        rmSync(DIST_CACHE, { recursive: true, force: true });
        log('full rebuild — fresh dist/ is authoritative, skipped merge/prune/sitemap');
    } else if (existsSync(DIST_CACHE)) {
        cpSync(DIST, DIST_CACHE, { recursive: true, force: true });
        rmSync(DIST, { recursive: true, force: true });
        renameSync(DIST_CACHE, DIST);
        log('merged fresh dist/ onto cached tree');

        // 5. Prune deleted projects/blogs from the merged tree.
        const validKeys = new Set(Object.keys(manifestPaths));
        const prunedCount = pruneDeletions(validKeys);
        log(`pruned ${prunedCount} deleted page dir(s); ${validKeys.size} tracked pages`);

        // 6. The fresh build's sitemap only lists the pages rendered THIS run
        //    and just clobbered the cached full one — regenerate it over the
        //    merged tree.
        const urlCount = regenerateSitemap();
        log(`regenerated sitemap over merged tree (${urlCount} URLs)`);
    } else {
        log('no cached dist/ — fresh dist/ kept as-is (cold build)');
    }

    // 7. Persist the new manifest for the next run.
    writeFileSync(MANIFEST_PATH, JSON.stringify({ codeHash, paths: manifestPaths }));
    rmSync(DIST_CACHE, { recursive: true, force: true });
    log('done');
}

main();
