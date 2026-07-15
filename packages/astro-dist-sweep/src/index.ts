/**
 * astro-dist-sweep — delete hashed assets nothing references.
 *
 * Astro's static output accumulates unreferenced files under the hashed
 * assets dir (`_astro/` by default):
 *   - astro:assets emits the ORIGINAL of every processed image whose `src`
 *     is touched at build time (e.g. change-detection signatures reading
 *     `coverImage.src`, or markdown-body images) — pages only reference the
 *     derived variants, so the originals ship as dead weight in EVERY build;
 *   - a merged incremental tree (see astro-incremental-static) can retain
 *     superseded hashed variants: a rebuilt page references newly-hashed
 *     files while the merge keeps the old ones for the pages it skipped.
 *
 * Mark-and-sweep over the final tree: roots are all text files outside the
 * assets dir (absolute `/_astro/<name>` references — page HTML, astro-island
 * props, JSON endpoints, the sitemap); marked js/css files are then scanned
 * transitively for the relative specifiers vite emits between chunks
 * ("./chunk-x.js") and inside css url()s — this is what keeps lazily
 * imported chunks (reachable only from other chunks, never from HTML) alive.
 * Anything in the assets dir never marked is deleted.
 */
import {
    readFileSync,
    readdirSync,
    rmSync,
    statSync,
} from 'node:fs';
import { join, sep } from 'node:path';

export interface SweepOptions {
    /** Hashed-assets dir name inside the dist dir. Default '_astro'. */
    assetsDir?: string;
}

export interface SweepResult {
    removed: number;
    bytes: number;
}

// Files that can carry /_astro/ references (everything else — images,
// fonts, videos — is a leaf and cannot reference further assets).
const TEXT_ROOT = /\.(html|css|js|mjs|json|xml|svg|txt|webmanifest)$/;
const REL_SCAN = /\.(js|mjs|css)$/;
const ABS_REF = /\/_astro\/([\w.@~-]+\.\w+)/g;
const REL_REF = /["'(]\.\/([\w.@~-]+\.\w+)/g;

function isDir(p: string): boolean {
    try {
        return statSync(p).isDirectory();
    } catch {
        return false;
    }
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

export function sweepSupersededAssets(
    distDir: string,
    options: SweepOptions = {},
): SweepResult {
    const assetsDirName = options.assetsDir ?? '_astro';
    const assetsDir = join(distDir, assetsDirName);
    if (!isDir(assetsDir)) {
        return { removed: 0, bytes: 0 };
    }

    const assets = new Set(
        readdirSync(assetsDir).filter((name) => !isDir(join(assetsDir, name))),
    );
    const referenced = new Set<string>();
    const queue: string[] = [];
    const mark = (name: string) => {
        if (assets.has(name) && !referenced.has(name)) {
            referenced.add(name);
            queue.push(name);
        }
    };

    const assetsPathMarker = `${sep}${assetsDirName}${sep}`;
    for (const file of collectFiles(distDir, [])) {
        if (file.includes(assetsPathMarker) || !TEXT_ROOT.test(file)) {
            continue;
        }
        for (const m of readFileSync(file, 'utf8').matchAll(ABS_REF)) {
            mark(m[1]);
        }
    }
    while (queue.length > 0) {
        const name = queue.pop()!;
        if (!REL_SCAN.test(name)) {
            continue;
        }
        const text = readFileSync(join(assetsDir, name), 'utf8');
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
            bytes += statSync(join(assetsDir, name)).size;
            rmSync(join(assetsDir, name), { force: true });
            removed += 1;
        }
    }
    return { removed, bytes };
}
