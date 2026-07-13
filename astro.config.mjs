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

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
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
