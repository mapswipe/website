// Concurrent image-prefetch step — thin wrapper over the app's configured
// astro-remote-images instance. Runs BEFORE `astro build` (see the npm
// `build` script) to warm the on-disk build/image-cache/ with a bounded pool, so
// the per-page render pass hits pure cache and does NOT serialize thousands
// of remote fetches.
//
// The app owns only the URL COLLECTOR below; the fetch+sharp+cache pipeline,
// pool, and negative caches live in the package (same instance = same cache
// keys the render pass looks up, warmed at COVER_WIDTH).
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { remoteImages, COVER_WIDTH } from '../src/lib/remoteImages.ts';

const require = createRequire(import.meta.url);

// Collect the unique cover URLs the build will actually render. Mirrors
// src/lib/data.ts (same staticData path + same BAD_IMAGE_TEST / SLICE_LIMIT
// knobs) so the warmed set matches the render set exactly.
function collectCoverUrls() {
    const data = require(process.env.MAPSWIPE_DATA_FILE ?? join(process.cwd(), 'build', 'full-data', 'staticData.json'));
    let projects = (data?.publicProjects?.results ?? []);

    const limit = Number(process.env.SLICE_LIMIT ?? 0);
    if (limit > 0) projects = projects.slice(0, limit);

    // Match data.ts's BAD_IMAGE_TEST knob: inject the bad URL into the first
    // image-bearing project so the prefetch exercises the same (bad) cover
    // the render will, proving fail-soft end to end.
    if (process.env.BAD_IMAGE_TEST) {
        const badUrl = process.env.BAD_IMAGE_TEST;
        const target = projects.find((p) => p?.image?.file?.url);
        if (target?.image?.file) target.image.file.url = badUrl;
    }

    return projects.map((p) => p?.image?.file?.url).filter(Boolean);
}

// Fail-soft at the top level too: prefetch is a cache warm, never a build
// blocker (the package's prefetch never throws; this guards the collector).
remoteImages.prefetch(collectCoverUrls, { width: COVER_WIDTH }).catch((err) => {
    console.warn('[prefetch] non-fatal error, continuing to build:', err);
    process.exit(0);
});
