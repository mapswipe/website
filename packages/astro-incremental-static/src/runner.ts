/**
 * astro-incremental-static — build orchestration (`runIncrementalBuild`).
 *
 * `astro build` (output: 'static') re-renders every path returned by every
 * getStaticPaths on every build. The runner avoids that:
 *   1. compute a global `codeHash` over the configured code/content inputs
 *      (NOT the data axis),
 *   2. move the previous build's dist aside (e.g. restored from a CI cache),
 *   3. run the optional prefetch command + the build command with
 *      ASTRO_INCREMENTAL=1 — getStaticPaths (via this package's selectPaths)
 *      reads the codeHash + previous manifest and returns ONLY the pages
 *      whose code or data changed,
 *   4. merge the previous dist *under* the fresh one (fresh wins),
 *   5. prune page dirs (matching the configured prunable route patterns)
 *      whose record no longer exists,
 *   6. regenerate the sitemap over the MERGED tree (the fresh build's sitemap
 *      only covers the pages rendered this run),
 *   7. sweep _astro/ files nothing in the final tree references,
 *   8. persist the new manifest for the next run.
 *
 * codeHash unchanged + data unchanged => ~0 pages rendered (compile only).
 * codeHash changed                    => everything rebuilt (fresh authoritative).
 *
 * ASTRO_INCREMENTAL=1 is the ONLY thing that activates the per-page
 * selection: a plain `astro build` (which never sets it) is always a full
 * build, even with a stale state dir on disk.
 *
 * Always-full pages: routes WITHOUT a selectPaths-wired getStaticPaths are
 * (cheaply) re-emitted on every run — including static file endpoints, which
 * therefore always stay in sync with whatever data change triggered the run.
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
import {
    isAbsolute,
    join,
    relative,
    resolve,
    sep,
} from 'node:path';

export interface CommandSpec {
    cmd: string;
    args: string[];
}

export interface SitemapConfig {
    /** Default true when the object is provided. */
    enabled?: boolean;
    /** Site origin, e.g. `https://example.org` (no trailing slash). */
    site: string;
    /** Locale path prefixes used to group hreflang alternates, e.g. ['en','de']. */
    locales: string[];
    /** Locale attributed to unprefixed paths (e.g. the root `/`). */
    defaultLocale: string;
}

export interface IncrementalBuildConfig {
    /** App root the build runs from. Default `process.cwd()`. */
    root?: string;
    /** Build output dir, relative to root. Default `dist`. */
    distDir?: string;
    /** State dir (manifest, code hash, shards), relative to root. Gitignore it. Default `.astro-incremental`. */
    stateDir?: string;
    /**
     * The code/content inputs whose change must trigger a FULL rebuild:
     * root-relative globs (`**` crosses `/`; `../` prefixes allowed) plus
     * optional excludes. Include everything that affects rendered output
     * EXCEPT the data axis (which selectPaths tracks per page via propsHash)
     * and build artifacts.
     */
    codeHash: { include: string[]; exclude?: string[] };
    /**
     * Dist-relative dir patterns whose child dirs are per-record pages that
     * may be deleted between builds — e.g. star, "projects", star (every
     * locale's per-project dirs; see the README for the literal spelling).
     * Segments may contain `*` and `?`; `**` is unsupported here. A matched
     * dir whose dist-relative path is not a manifest key is removed after
     * the merge. Omit to skip pruning.
     */
    prune?: { routes: string[] };
    /**
     * Regenerate the sitemap over the merged tree — REQUIRED when the site
     * uses @astrojs/sitemap, otherwise the fresh build's sliver of a sitemap
     * clobbers the cached full one. `false` to skip.
     */
    sitemap?: SitemapConfig | false;
    /** Build command. Default `{ cmd: 'astro', args: ['build'] }` (resolved via node_modules/.bin). */
    buildCommand?: CommandSpec;
    /** Optional command to run before the build (e.g. an image-prefetch script). */
    prefetch?: CommandSpec;
}

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

const hasGlobChars = (s: string) => /[*?]/.test(s);

function toPosix(p: string): string {
    return p.split(sep).join('/');
}

function collectFiles(dir: string, acc: string[]): string[] {
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

function isDir(p: string): boolean {
    try {
        return statSync(p).isDirectory();
    } catch {
        return false;
    }
}

export function runIncrementalBuild(config: IncrementalBuildConfig): void {
    const ROOT = resolve(config.root ?? process.cwd());
    const DIST = join(ROOT, config.distDir ?? 'dist');
    const DIST_CACHE = `${DIST}-cache`;
    const INCR_DIR = isAbsolute(config.stateDir ?? '')
        ? (config.stateDir as string)
        : join(ROOT, config.stateDir ?? '.astro-incremental');
    const SHARD_DIR = join(INCR_DIR, 'shards');
    const MANIFEST_PATH = join(INCR_DIR, 'manifest.json');
    const CODE_HASH_PATH = join(INCR_DIR, 'code-hash.txt');
    const buildCommand = config.buildCommand ?? { cmd: 'astro', args: ['build'] };
    const sitemapConfig = config.sitemap === false || config.sitemap === undefined
        ? undefined
        : config.sitemap;
    const sitemapEnabled = sitemapConfig !== undefined && (sitemapConfig.enabled ?? true);

    const startTime = process.hrtime.bigint();
    const elapsed = () => `${(Number(process.hrtime.bigint() - startTime) / 1e9).toFixed(1)}s`;
    const log = (msg: string) => process.stdout.write(`[incremental-build +${elapsed()}] ${msg}\n`);

    function bin(name: string): string {
        const local = join(ROOT, 'node_modules', '.bin', name);
        return existsSync(local) ? local : name;
    }

    function run(command: CommandSpec, extraEnv: Record<string, string> = {}): void {
        const resolved = command.cmd === 'node' ? 'node' : bin(command.cmd);
        log(`$ ${command.cmd} ${command.args.join(' ')}`);
        const before = process.hrtime.bigint();
        const result = spawnSync(resolved, command.args, {
            cwd: ROOT,
            stdio: 'inherit',
            env: { ...process.env, ...extraEnv },
            shell: false,
        });
        log(`  └ ${command.cmd} took ${(Number(process.hrtime.bigint() - before) / 1e9).toFixed(1)}s`);
        if (result.status !== 0) {
            throw new Error(`${command.cmd} exited with ${result.status ?? result.signal}`);
        }
    }

    // -----------------------------------------------------------------------
    // codeHash — hash of every configured code/content input. Files are
    // labelled with their ROOT-relative posix path so the hash is
    // machine-independent (and stable for `../`-reaching inputs).
    // -----------------------------------------------------------------------
    function computeCodeHash(): string {
        const excludeRes = (config.codeHash.exclude ?? []).map(globToRegExp);
        const files = new Set<string>();
        for (const pattern of config.codeHash.include) {
            const segments = pattern.split('/');
            const staticSegs: string[] = [];
            for (const seg of segments) {
                if (hasGlobChars(seg)) {
                    break;
                }
                staticSegs.push(seg);
            }
            if (staticSegs.length === segments.length) {
                // No glob chars: a literal file or directory.
                const literal = join(ROOT, ...segments);
                if (isDir(literal)) {
                    collectFiles(literal, []).forEach((f) => files.add(f));
                } else if (existsSync(literal)) {
                    files.add(literal);
                }
                continue;
            }
            const base = join(ROOT, ...staticSegs);
            if (!isDir(base)) {
                continue;
            }
            const re = globToRegExp(pattern);
            for (const file of collectFiles(base, [])) {
                if (re.test(toPosix(relative(ROOT, file)))) {
                    files.add(file);
                }
            }
        }

        const sorted = [...files]
            .filter((f) => !excludeRes.some((re) => re.test(toPosix(relative(ROOT, f)))))
            .sort();
        const hash = createHash('sha1');
        for (const file of sorted) {
            hash.update(toPosix(relative(ROOT, file)));
            hash.update('\0');
            hash.update(readFileSync(file));
            hash.update('\0');
        }
        return hash.digest('hex');
    }

    // -----------------------------------------------------------------------
    // helpers for merge + prune
    // -----------------------------------------------------------------------
    function readShards(): Record<string, string> {
        const merged: Record<string, string> = {};
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

    /** Expand one prunable-route pattern into existing dist dirs (dist-relative keys). */
    function expandRoutePattern(pattern: string): string[] {
        const segments = pattern.split('/').filter(Boolean);
        let level: string[] = [''];
        for (const seg of segments) {
            const re = globToRegExp(seg);
            const nextLevel: string[] = [];
            for (const relDir of level) {
                const abs = join(DIST, relDir);
                if (!isDir(abs)) {
                    continue;
                }
                for (const entry of readdirSync(abs, { withFileTypes: true })) {
                    if (entry.isDirectory() && re.test(entry.name)) {
                        nextLevel.push(relDir === '' ? entry.name : `${relDir}/${entry.name}`);
                    }
                }
            }
            level = nextLevel;
        }
        return level;
    }

    /**
     * Remove per-record page directories (matching the configured prunable
     * route patterns) that are no longer in the current path set (deleted
     * records). Keys match selectPaths candidate keys, e.g.
     * `en/projects/<id>`. Anything outside the patterns is never touched.
     */
    function pruneDeletions(validKeys: Set<string>): number {
        if (!isDir(DIST) || !config.prune) {
            return 0;
        }
        let removed = 0;
        for (const pattern of config.prune.routes) {
            for (const key of expandRoutePattern(pattern)) {
                if (!validKeys.has(key)) {
                    rmSync(join(DIST, ...key.split('/')), { recursive: true, force: true });
                    removed += 1;
                }
            }
        }
        return removed;
    }

    // -----------------------------------------------------------------------
    // sitemap regeneration over the MERGED tree
    //
    // On the merge path the fresh build's sitemap-0.xml covers ONLY the pages
    // rendered this run (e.g. 13 URLs after a 1-record change) and, having
    // been copied over the cached full sitemap, would silently shrink the
    // published one to a sliver. So after merging we regenerate it from the
    // merged dist itself, emitting the exact structure @astrojs/sitemap
    // produces with its i18n option (verified structurally identical):
    //   - one <url> per page dir's index.html,
    //   - pages grouped by path-minus-locale-prefix; every member of a group
    //     carries the SAME <xhtml:link rel="alternate" hreflang=...> list
    //     (all members, href-sorted; no x-default),
    //   - locale-less pages (the root /) count as the default locale — the
    //     root group then has hreflang "<default>" twice, matching
    //     @astrojs/sitemap,
    //   - meta-refresh redirect stubs are EXCLUDED (astro excludes redirect
    //     routes); the root / — also a meta-refresh page but a real page
    //     route — is INCLUDED, again matching astro,
    //   - 404.html is naturally excluded (not an index.html).
    // -----------------------------------------------------------------------

    /** True when the file starts as a meta-refresh redirect page. */
    function isMetaRefreshStub(filePath: string): boolean {
        const fd = openSync(filePath, 'r');
        try {
            const buf = Buffer.alloc(512);
            const n = readSync(fd, buf, 0, 512, 0);
            return buf.toString('utf8', 0, n).includes('http-equiv="refresh"');
        } finally {
            closeSync(fd);
        }
    }

    function regenerateSitemap({ site, locales, defaultLocale }: SitemapConfig): number {
        // 1. Collect every page URL from the merged dist.
        const urlPaths: string[] = [];
        for (const entry of readdirSync(DIST, { recursive: true })) {
            const rel = String(entry);
            if (rel !== 'index.html' && !rel.endsWith(`${sep}index.html`)) {
                continue;
            }
            const dir = rel === 'index.html' ? '' : rel.slice(0, -`${sep}index.html`.length);
            const urlPath = dir === '' ? '/' : `/${toPosix(dir)}/`;
            // Redirect stubs are excluded from the sitemap; the root '/'
            // (also a meta-refresh page, but a page route) is included.
            if (urlPath !== '/' && isMetaRefreshStub(join(DIST, rel))) {
                continue;
            }
            urlPaths.push(urlPath);
        }
        urlPaths.sort();

        // 2. Group by path-minus-locale-prefix; hreflang from the prefix (or
        //    the default locale for unprefixed paths like '/').
        const groups = new Map<string, { urlPath: string; hreflang: string }[]>();
        for (const urlPath of urlPaths) {
            const [first, ...rest] = urlPath.slice(1).split('/');
            const isLocale = locales.includes(first);
            const groupKey = isLocale ? `/${rest.join('/')}` : urlPath;
            const hreflang = isLocale ? first : defaultLocale;
            if (!groups.has(groupKey)) {
                groups.set(groupKey, []);
            }
            groups.get(groupKey)!.push({ urlPath, hreflang });
        }

        // 3. Emit (single line, same as @astrojs/sitemap).
        const loc = (urlPath: string) => `${site}${urlPath}`;
        const parts: string[] = [];
        for (const urlPath of urlPaths) {
            const [first, ...rest] = urlPath.slice(1).split('/');
            const groupKey = locales.includes(first) ? `/${rest.join('/')}` : urlPath;
            const group = groups.get(groupKey)!;
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
            + `<sitemap><loc>${site}/sitemap-0.xml</loc></sitemap></sitemapindex>`,
        );
        return urlPaths.length;
    }

    // -----------------------------------------------------------------------
    // superseded-asset sweep
    //
    // Two things leave unreferenced files under _astro/:
    //   - astro:assets emits the ORIGINAL of every processed image whose
    //     `src` is touched at build time (the propsData change-detection
    //     signatures do exactly that) — pages only reference the derived
    //     variants, so the originals ship as dead weight in EVERY build;
    //   - on the merge path, a rebuilt page can reference newly-hashed
    //     variants while the merge keeps the superseded ones from the
    //     cached tree.
    // Mark-and-sweep over the final tree: roots are all text files outside
    // _astro/ (absolute /_astro/<name> references — page HTML, astro-island
    // props, JSON endpoints); marked js/css files are scanned transitively
    // for the relative specifiers vite emits between chunks ("./chunk-x.js")
    // and inside css url()s. Anything in _astro/ never marked is deleted.
    // -----------------------------------------------------------------------

    const TEXT_ROOT = /\.(html|css|js|mjs|json|xml|svg|txt|webmanifest)$/;
    const ABS_REF = /\/_astro\/([\w.@~-]+\.\w+)/g;
    const REL_REF = /["'(]\.\/([\w.@~-]+\.\w+)/g;

    function sweepSupersededAssets(): { removed: number; bytes: number } {
        const astroDir = join(DIST, '_astro');
        if (!isDir(astroDir)) {
            return { removed: 0, bytes: 0 };
        }
        const assets = new Set(
            readdirSync(astroDir).filter((name) => !isDir(join(astroDir, name))),
        );
        const referenced = new Set<string>();
        const queue: string[] = [];
        const mark = (name: string) => {
            if (assets.has(name) && !referenced.has(name)) {
                referenced.add(name);
                queue.push(name);
            }
        };
        for (const file of collectFiles(DIST, [])) {
            if (toPosix(file).includes('/_astro/') || !TEXT_ROOT.test(file)) {
                continue;
            }
            for (const m of readFileSync(file, 'utf8').matchAll(ABS_REF)) {
                mark(m[1]);
            }
        }
        while (queue.length > 0) {
            const name = queue.pop()!;
            if (!/\.(js|mjs|css)$/.test(name)) {
                continue;
            }
            const text = readFileSync(join(astroDir, name), 'utf8');
            for (const m of text.matchAll(ABS_REF)) {
                mark(m[1]);
            }
            for (const m of text.matchAll(REL_REF)) {
                mark(m[1]);
            }
        }
        let removed = 0;
        let bytes = 0;
        for (const name of assets) {
            if (!referenced.has(name)) {
                bytes += statSync(join(astroDir, name)).size;
                rmSync(join(astroDir, name), { force: true });
                removed += 1;
            }
        }
        return { removed, bytes };
    }

    // -----------------------------------------------------------------------
    // main
    // -----------------------------------------------------------------------

    // 1. codeHash → file (read by getStaticPaths via selectPaths).
    mkdirSync(INCR_DIR, { recursive: true });
    rmSync(SHARD_DIR, { recursive: true, force: true });
    const codeHash = computeCodeHash();
    writeFileSync(CODE_HASH_PATH, codeHash);

    let prevManifest: { codeHash: string; paths: Record<string, string> } = { codeHash: '', paths: {} };
    try {
        prevManifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
    } catch {
        // cold build
    }
    const codeChanged = prevManifest.codeHash !== codeHash;
    log(`codeHash ${codeHash}${codeChanged ? ' (changed → full rebuild)' : ' (unchanged → data-only)'}`);

    // 2. Move the restored previous dist aside so the build starts clean.
    rmSync(DIST_CACHE, { recursive: true, force: true });
    if (existsSync(DIST)) {
        renameSync(DIST, DIST_CACHE);
        log(`moved previous ${config.distDir ?? 'dist'}/ → ${config.distDir ?? 'dist'}-cache/`);
    } else {
        log(`no previous ${config.distDir ?? 'dist'}/ (cold build)`);
    }

    // 3. Optional prefetch, then build only the changed/new paths.
    //    ASTRO_INCREMENTAL=1 is what arms selectPaths — without it (any plain
    //    `astro build`) every getStaticPaths returns all its candidates.
    if (config.prefetch) {
        run(config.prefetch);
    }
    run(buildCommand, {
        ASTRO_INCREMENTAL: '1',
        ASTRO_INCREMENTAL_STATE_DIR: INCR_DIR,
    });

    // 4. Merge. On a full rebuild (codeChanged) the fresh tree already
    //    contains every current page — just discard the cache. On a data-only
    //    build the fresh tree is small while the cache holds ~every page, so
    //    overlay the SMALL fresh tree onto the LARGE cached one (fresh wins)
    //    via a copy into the cache, then rename the merged cache back —
    //    keeping the unchanged files in place.
    const manifestPaths = readShards();
    if (codeChanged) {
        rmSync(DIST_CACHE, { recursive: true, force: true });
        log('full rebuild — fresh dist is authoritative, skipped merge/prune/sitemap');
    } else if (existsSync(DIST_CACHE)) {
        cpSync(DIST, DIST_CACHE, { recursive: true, force: true });
        rmSync(DIST, { recursive: true, force: true });
        renameSync(DIST_CACHE, DIST);
        log('merged fresh dist onto cached tree');

        // 5. Prune deleted records from the merged tree.
        const validKeys = new Set(Object.keys(manifestPaths));
        const prunedCount = pruneDeletions(validKeys);
        log(`pruned ${prunedCount} deleted page dir(s); ${validKeys.size} tracked pages`);

        // 6. The fresh build's sitemap only lists the pages rendered THIS run
        //    and just clobbered the cached full one — regenerate it over the
        //    merged tree.
        if (sitemapEnabled && sitemapConfig) {
            const urlCount = regenerateSitemap(sitemapConfig);
            log(`regenerated sitemap over merged tree (${urlCount} URLs)`);
        }
    } else {
        log('no cached dist — fresh dist kept as-is (cold build)');
    }

    // 7. Sweep _astro files nothing references — on every path: even a fresh
    //    full build carries the always-emitted image originals.
    const swept = sweepSupersededAssets();
    log(`swept ${swept.removed} unreferenced _astro asset(s) (${(swept.bytes / 1e6).toFixed(1)} MB)`);

    // 8. Persist the new manifest for the next run.
    writeFileSync(MANIFEST_PATH, JSON.stringify({ codeHash, paths: manifestPaths }));
    rmSync(DIST_CACHE, { recursive: true, force: true });
    log('done');
}
