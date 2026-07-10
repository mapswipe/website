// Concurrent image-prefetch step. Runs BEFORE `astro build` (see the npm
// `build` script) to warm the on-disk .image-cache/ with a bounded concurrency
// pool, so the per-page render pass hits pure cache and does NOT serialize
// thousands of remote fetches.
//
// Why: project cover images are fetched at render time. Every project renders
// across all 6 locales, so a naive render pass would fetch each cover ~6×
// serially. Deduping to unique URLs and fetching them in parallel here turns a
// ~27-min fetch-bound cold build into a short prefetch + fast render.
//
// This shares the SAME optimizer + cache as the per-page resolver: it calls
// prefetchRemoteImage() from src/lib/optimizeImage.ts (imported directly via
// Node's native TS type-stripping). The cache key is (url|width|webp), and we
// warm at COVER_WIDTH — the exact width the page renders — so the render pass
// finds a hit. No logic is forked.
//
// Fail-soft: prefetchRemoteImage never throws; a bad/slow image logs a
// passthrough warning and the pool moves on. rc stays 0.
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { prefetchRemoteImage, COVER_WIDTH } from '../src/lib/optimizeImage.ts';

const require = createRequire(import.meta.url);

// Bounded concurrency. Fetch-bound work: ~24 in-flight remote fetches saturates
// the link without exhausting sockets/RAM. Tunable via env for measurement.
const CONCURRENCY = Number(process.env.PREFETCH_CONCURRENCY ?? 24);

// Collect the unique cover URLs the build will actually render. This mirrors
// src/lib/data.ts (same staticData path + same BAD_IMAGE_TEST / SLICE_LIMIT
// knobs) so the warmed set matches the render set exactly.
function collectCoverUrls() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = require(process.env.MAPSWIPE_DATA_FILE ?? join(process.cwd(), '..', 'fullData', 'staticData.json'));
  let projects = (data?.publicProjects?.results ?? []);

  const limit = Number(process.env.SLICE_LIMIT ?? 0);
  if (limit > 0) projects = projects.slice(0, limit);

  // Match data.ts's BAD_IMAGE_TEST knob: inject the bad URL into the first
  // image-bearing project so the prefetch exercises the same (bad) cover the
  // render will, proving fail-soft end to end.
  if (process.env.BAD_IMAGE_TEST) {
    const badUrl = process.env.BAD_IMAGE_TEST;
    const target = projects.find((p) => p?.image?.file?.url);
    if (target?.image?.file) target.image.file.url = badUrl;
  }

  const urls = projects.map((p) => p?.image?.file?.url).filter(Boolean);
  return [...new Set(urls)];
}

// Bounded pool: N workers drain a shared cursor over the URL list.
async function run() {
  const start = Date.now();
  const urls = collectCoverUrls();
  const total = urls.length;
  console.log(
    `[prefetch] ${total} unique cover URLs, concurrency=${CONCURRENCY}, width=${COVER_WIDTH}`,
  );

  let optimized = 0;
  let passthrough = 0;
  let next = 0;

  async function worker() {
    for (;;) {
      const i = next++;
      if (i >= total) return;
      const ok = await prefetchRemoteImage(urls[i], { width: COVER_WIDTH });
      if (ok) optimized++;
      else passthrough++;
      const done = optimized + passthrough;
      if (done % 250 === 0 || done === total) {
        console.log(`[prefetch] ${done}/${total} (optimized=${optimized} passthrough=${passthrough})`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, total) }, worker));

  const secs = ((Date.now() - start) / 1000).toFixed(1);
  console.log(
    `[prefetch] done: ${optimized} optimized / ${passthrough} passthrough / ${total} total in ${secs}s`,
  );
}

// Fail-soft at the top level too: prefetch is a cache warm, never a build
// blocker. Any unexpected error still exits 0 so `astro build` runs.
run().catch((err) => {
  console.warn('[prefetch] non-fatal error, continuing to build:', err);
  process.exit(0);
});
