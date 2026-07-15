import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';

import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import remarkGfm from 'remark-gfm';
// Deduplicates the byte-identical inline island-hydration runtimes (~3.9 KB on
// each of ~14.6k pages, ~56 MB total) into external cached, content-hashed
// /_astro/dedup-<hash8>.js files at build:done. Registered LAST so it
// post-processes the final HTML after the other build:done hooks.
import hydrationDedup from './packages/astro-hydration-dedup/src/index.ts';

const SITE = 'https://mapswipe.org';

const CLASS_ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CLASS_ALNUM = `${CLASS_ALPHA}0123456789-_`;
const assignedClassNames = new Map();
// Debug aid: CLASS_MAP_OUT=<path> dumps {shortName -> source} after the build,
// so two builds' HTML can be compared structurally when class hashes shift
// (e.g. after moving a CSS module).
if (process.env.CLASS_MAP_OUT) {
    process.on('exit', () => {
        try {
            writeFileSync(process.env.CLASS_MAP_OUT, JSON.stringify(Object.fromEntries(assignedClassNames)));
        } catch { /* best-effort */ }
    });
}
function shortClassName(name, filename) {
    const rel = filename.includes('website-astro') || filename.startsWith(process.cwd())
        ? filename.slice(process.cwd().length)
        : filename;
    const digest = createHash('sha1').update(`${rel}:${name}`).digest();
    let out = CLASS_ALPHA[digest[0] % CLASS_ALPHA.length];
    for (let i = 1; i < 4; i += 1) {
        out += CLASS_ALNUM[digest[i] % CLASS_ALNUM.length];
    }
    const source = `${rel}:${name}`;
    const existing = assignedClassNames.get(out);
    if (existing && existing !== source) {
        throw new Error(`css module class-name collision: '${out}' (${existing} vs ${source}) — widen the hash`);
    }
    assignedClassNames.set(out, source);
    return out;
}

export default defineConfig({
    site: SITE,
    vite: {
        css: {
            modules: {
                // dev keeps readable names; prod ships 4-char names (class
                // attributes were ~22% of every page with the default
                // pattern). Content-hashed so names are stable across builds
                // (the incremental merge relies on that); first char forced
                // alphabetic (leading digits get CSS-escaped, which grows
                // output); collisions fail the build instead of silently
                // merging two components' styles.
                generateScopedName: process.env.NODE_ENV === 'production'
                    ? shortClassName
                    : '[local]_[hash:base64:4]',
            },
        },
    },
    output: 'static',
    trailingSlash: 'always',
    build: {
        format: 'directory',
        // Pages rendered concurrently. Rendering is single-threaded JS —
        // concurrency only overlaps the async waits — so gains saturate
        // fast: measured 55s/48s/45s at 1/4/8 (peak RSS 1.8/2.0/2.4 GiB),
        // byte-identical output. 4 is the balance; override per-run via env.
        concurrency: Number(process.env.ASTRO_BUILD_CONCURRENCY ?? 4),
        // 'auto' inlines small stylesheets into EVERY page — ~10 KB of
        // identical CSS duplicated across 14.6k pages (~150 MB of dist).
        // External files are fetched once and cached.
        inlineStylesheets: 'never',
    },
    // Root/locale-less redirect stubs (parity with the Next app's src/pages/*.tsx
    // Redirect stubs). Next did client-side language detection; for a static
    // export we redirect the locale-less path to the default-locale (en) variant.
    // Emitted as meta-refresh HTML pages in dist. `/` is handled by
    // src/pages/index.astro.
    redirects: {
        '/blogs': '/en/blogs/',
        '/data': '/en/data/',
        '/get-involved': '/en/get-involved/',
        '/privacy': '/en/privacy/',
        '/projects': '/en/projects/',
    },
    integrations: [
        react(),
        // Emit a sitemap with per-locale alternate links (hreflang). The i18n option
        // groups the 6 locale-prefixed variants of each page and cross-links them,
        // matching the hreflang alternates we emit in <head>.
        sitemap({
            i18n: {
                defaultLocale: 'en',
                locales: { en: 'en', ne: 'ne', hu: 'hu', de: 'de', cs: 'cs', pt: 'pt' },
            },
        }),
        // Default minOccurrences (10): the 3 sitewide runtimes are externalized;
        // the data pages' 6-page client:load loader stays inline by design.
        hydrationDedup({ minOccurrences: 10 }),
    ],
    // Blog markdown is rendered by Astro's built-in pipeline. Next used remark-gfm
    // (remark().use(remarkGfm) in its Pages-Router detail page), so we enable it
    // here for GFM parity (tables, strikethrough, autolinks, etc.).
    // In-body relative images (./images/*) are optimized natively by astro:assets.
    markdown: {
        remarkPlugins: [remarkGfm],
    },
    i18n: {
        defaultLocale: 'en',
        locales: ['en', 'ne', 'hu', 'de', 'cs', 'pt'],
        routing: { prefixDefaultLocale: true },
    },
    // NOTE: Remote project cover images are optimized by our build-time,
    // fail-soft resolver (the astro-remote-images workspace package, configured
    // in src/lib/remoteImages.ts + wrapped by components/RemoteImage.astro),
    // NOT by Astro's astro:assets pipeline — its optimize phase is all-or-nothing
    // and one malformed remote image aborts the whole build. LOCAL blog images
    // (blogs/images/*, a small trusted set) DO go through astro:assets (default
    // sharp service): covers via the image() schema helper + <Image>, in-body
    // relative markdown images natively. We don't declare remotePatterns, so
    // astro:assets never touches a remote URL.
});
