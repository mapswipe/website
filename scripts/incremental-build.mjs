#!/usr/bin/env node
// Incremental static-build orchestration — thin wrapper over
// astro-incremental-static (see packages/astro-incremental-static/README.md,
// incl. the propsData correctness contract). This file only holds THIS app's
// config; all mechanics (codeHash, dist merge, prune, merged-tree sitemap
// regen, manifest persistence) live in the package.
//
// Keep sitemap site/locales in sync with astro.config.mjs (not imported from
// there: the config pulls in integrations plain Node shouldn't load here).
import { runIncrementalBuild } from '../packages/astro-incremental-static/src/runner.ts';

runIncrementalBuild({
    codeHash: {
        // Everything that affects rendered output EXCEPT the data axis
        // (fullData/ + blogs/ are tracked per page via propsHash) and build
        // artifacts. Repo-root locales/ is read by src/i18n's glob.
        include: [
            'src/**',
            'locales/**',
            'astro.config.mjs',
            'package.json',
        ],
    },
    // Per-record page dirs that may disappear between builds (deleted
    // projects/blogs). Keys match the selectPaths candidates.
    prune: { routes: ['*/projects/*', '*/blogs/*'] },
    sitemap: {
        site: 'https://mapswipe.org',
        locales: ['en', 'ne', 'hu', 'de', 'cs', 'pt'],
        defaultLocale: 'en',
    },
    prefetch: { cmd: 'node', args: ['scripts/prefetch-images.mjs'] },
    buildCommand: { cmd: 'astro', args: ['build'] },
});
