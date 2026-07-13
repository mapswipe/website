// App-wide configured astro-remote-images instance (build-time only, Node).
// This module MUST be imported before the package's <RemoteImage /> component
// renders (the component uses the default = last-created instance); every
// consumer here imports it directly, which guarantees the ordering.
import { createRemoteImages } from '../../packages/astro-remote-images/src/index.ts';

// The render width used for project cover images (projects/[id].astro, the
// data page cards, the data-explorer imageMap). The prefetch pool warms the
// cache under the SAME width/key the per-page resolver looks up.
export const COVER_WIDTH = 640;

export const remoteImages = createRemoteImages({
    width: COVER_WIDTH,
    quality: 80,
    format: 'webp',
    cacheDir: '.image-cache', // persisted in CI so warm builds reuse encodes
    publicPrefix: '/_img',
    // Fetch-bound work: ~24 in-flight fetches saturates the link without
    // exhausting sockets/RAM. Tunable via env for measurement.
    concurrency: Number(process.env.PREFETCH_CONCURRENCY ?? 24),
    fetchTimeoutMs: 15000,
    // Chronically-slow origins are skipped (not refetched) within this window
    // so warm builds stay fast; a genuinely-transient blip still retries.
    transientRetryAfterMs: Number(process.env.IMAGE_RETRY_AFTER_MS ?? 6 * 60 * 60 * 1000),
    // Broken covers (corrupt data / 4xx) AND transiently unreachable ones
    // (timeout / 5xx) both render the bundled error image
    // (/_img/image-error.svg) instead of passing the remote URL through —
    // deterministic output over covers that may or may not load.
    onError: 'error-image',
    onTransientError: 'error-image',
});

export const resolveRemoteImage = remoteImages.resolve;
