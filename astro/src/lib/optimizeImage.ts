// Build-time, per-image, fail-soft remote image optimizer with an on-disk cache.
//
// UPSTREAM: no existing Astro issue covers a per-image error policy (verified
// 2026-07-10). Draft feature request ready to file: docs/upstream/
// astro-remote-image-fail-soft.md. Closest existing refs:
//   https://github.com/withastro/roadmap/discussions/523 (global error handling)
//   https://github.com/withastro/astro/issues/15920 (remote revalidation, adjacent)
// Delete this file when an upstream error policy lands.
//
// Why this exists (and why we bypass Astro's <Image>/astro:assets):
// Astro's optimize phase is all-or-nothing — a single malformed remote image
// (e.g. a broken SVG mislabeled as raster) makes sharp throw fatally and aborts
// the entire 14k-page build (rc=1), uncatchable per-image. Here we own the
// fetch + sharp pipeline so we can wrap each image in try/catch and fail-soft to
// passthrough (serve the original remote URL) while still optimizing + caching
// the good ones.
//
// Runs at build time only (Node). Not for client bundles.
import { createHash } from 'node:crypto';
import { mkdir, readdir, copyFile, writeFile, access, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

// Anchor at the build's working directory (astro/) rather than import.meta.url:
// after Vite bundles this module into dist/pages/, an import.meta.url-relative
// path resolves from the emitted file's location and lands in the wrong place.
// The build always runs from astro/, so cwd is the stable anchor.
export const ROOT = process.cwd();

// Persistent cache: survives across builds. In CI this directory should be
// restored/saved as a build cache (see report) so warm builds reuse encodes.
export const CACHE_DIR = join(ROOT, '.image-cache');
// Final output dir. We emit directly into dist/ because the public/ -> dist/
// copy phase runs BEFORE static route generation (when these images are
// produced), so writing into public/ would be too late to ship.
export const OUT_IMG_DIR = join(ROOT, 'dist', '_img');
// The public URL path the browser requests.
export const PUBLIC_IMG_URL = '/_img';
// Per-image fetch timeout. Prevents a single slow/hung remote from stalling the
// build; on timeout we fail soft to passthrough.
const FETCH_TIMEOUT_MS = 15000;

// Retry-after window for TRANSIENT failures (timeout / network / 5xx). We
// record the failure time in a .slow marker and skip refetching that URL until
// this window elapses. Without it, a chronically-slow origin image is refetched
// (and re-times-out at 15s) on EVERY build — 9 such covers cost ~135s per build
// in this dataset. With it, warm builds skip them and stay fast, while a
// genuinely-transient blip still retries after the window. Tunable via env.
const RETRY_AFTER_MS = Number(process.env.IMAGE_RETRY_AFTER_MS ?? 6 * 60 * 60 * 1000);

// The render width used for project cover images (see projects/[id].astro).
// Exported so the prefetch pool warms the cache under the SAME width/key the
// per-page resolver will look up — otherwise prefetch would be a no-op.
export const COVER_WIDTH = 640;

let dirsReady: Promise<void> | null = null;
export function ensureDirs(): Promise<void> {
  if (!dirsReady) {
    dirsReady = (async () => {
      await mkdir(CACHE_DIR, { recursive: true });
      await mkdir(OUT_IMG_DIR, { recursive: true });
    })();
  }
  return dirsReady;
}

// Track keys already emitted into dist/ this process, so concurrent page
// renders don't redundantly copy.
const published = new Set<string>();

// In-process negative cache for keys that failed this process. Covers the
// TRANSIENT failures (timeouts/network) that we deliberately don't persist to
// disk: within a single build a URL renders across 6 locales, and without this
// each locale would re-pay the full 15s fetch timeout. Process-scoped only, so
// a transient failure is retried on the next build (correct).
const failedThisProcess = new Set<string>();

export interface ResolveOptions {
  width: number;
}

export interface ResolvedImage {
  // URL to render in <img src>. Either a local optimized path or, on any
  // failure, the original remote URL (passthrough).
  src: string;
  // True when we shipped a locally optimized webp; false when passthrough.
  optimized: boolean;
}

function cacheKey(url: string, width: number): string {
  return createHash('sha1').update(`${url}|w=${width}|webp`).digest('hex');
}

// Negative cache. Two tiers of marker file sit next to the would-be .webp:
//   .miss  — PERMANENT: the URL failed deterministically (corrupt/empty image
//            data or HTTP 4xx). Never refetched (until the cache dir is wiped).
//   .slow  — TRANSIENT with retry-after: the URL failed for a network reason
//            (timeout / connection / 5xx). Skipped until RETRY_AFTER_MS elapses
//            (judged by the marker's mtime), then retried. This is what stops a
//            chronically-slow origin image from being refetched — and re-timing
//            out at 15s — on every build, while still eventually retrying.
// Both let the render pass short-circuit to passthrough WITHOUT a refetch,
// keeping post-prefetch renders as pure cache hits.
async function writeMarker(key: string, ext: 'miss' | 'slow'): Promise<void> {
  await writeFile(join(CACHE_DIR, `${key}.${ext}`), '');
}

// True for failures that are the image's fault, not the network's — a corrupt
// or empty buffer, or a 4xx. sharp throws these with recognizable messages.
function isDeterministicFailure(reason: string): boolean {
  return (
    reason.startsWith('HTTP 4') ||
    reason.includes('Input buffer') ||
    reason.includes('Input Buffer') ||
    reason.includes('unsupported image format') ||
    reason.includes('VipsForeignLoad')
  );
}

// Shared negative-cache lookup used by BOTH the prefetch pool and the per-page
// resolver. Returns whether we should skip fetching this key (and why).
async function negativeCacheHit(key: string): Promise<boolean> {
  // Permanent bad -> always skip.
  try {
    await access(join(CACHE_DIR, `${key}.miss`));
    return true;
  } catch {
    // not permanently bad
  }
  // Transient slow -> skip only while the retry-after window is still open.
  try {
    const st = await stat(join(CACHE_DIR, `${key}.slow`));
    return Date.now() - st.mtimeMs < RETRY_AFTER_MS;
  } catch {
    return false;
  }
}

// Shared sharp encode: resize to `width` (never upscale) + webp. This is the
// SINGLE source of truth for the encode rules for remote covers. `input` may
// be a Buffer (remote) or a file path. Animated inputs (GIF pages>1) are decoded with
// { animated: true } and re-encoded as an animated webp so animation survives
// the resize (applied to every frame). Returns the encoded webp buffer.
export async function encodeImageBuffer(
  input: Buffer | string,
  width: number,
): Promise<Buffer> {
  // Probe for animation. A multi-page (animated) source must be opened with
  // { animated: true } or sharp collapses it to the first frame.
  let animated = false;
  try {
    const meta = await sharp(input).metadata();
    animated = (meta.pages ?? 1) > 1 || meta.format === 'gif';
  } catch {
    // If probing fails, treat as a normal static image; the encode below will
    // surface any real decode error to the caller (fail-soft at that layer).
  }
  return sharp(input, animated ? { animated: true } : undefined)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}

// Cold path shared by both the per-page resolver and the prefetch pool: fetch
// the remote image, resize + encode to webp, and write it into the on-disk
// cache. NEVER throws — on any failure it logs a concise warning and returns
// false (caller falls back to passthrough). This is the single source of truth
// for the fetch+sharp+cache logic; do NOT duplicate it in the prefetch script.
async function encodeToCache(url: string, width: number, key: string): Promise<boolean> {
  const cacheFile = join(CACHE_DIR, `${key}.webp`);
  try {
    await ensureDirs();

    // A hard timeout prevents one slow/hung remote server from stalling the
    // build indefinitely (fetch has no default timeout) — on abort we fail
    // soft to passthrough like any other error.
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const input = Buffer.from(await res.arrayBuffer());

    // Explicit width (no inferSize) so there is no render-time dimension fetch.
    const output = await encodeImageBuffer(input, width);

    await writeFile(cacheFile, output);
    return true;
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.warn(`[optimizeImage] passthrough (${reason}): ${url}`);
    // Negative-cache the failure so it isn't refetched: permanent for bad data,
    // retry-after for transient network failures. Best-effort — a failed marker
    // write just means we retry next time (still safe).
    try {
      await writeMarker(key, isDeterministicFailure(reason) ? 'miss' : 'slow');
    } catch {
      // ignore
    }
    return false;
  }
}

/**
 * Warm the on-disk cache for a single URL/width WITHOUT publishing into dist/
 * (dist is written per-page at render time). Cache hit -> no-op. Used by the
 * prefetch pool. Returns whether an optimized webp exists in cache afterward.
 * NEVER throws.
 */
export async function prefetchRemoteImage(
  url: string,
  { width }: ResolveOptions,
): Promise<boolean> {
  const key = cacheKey(url, width);
  const cacheFile = join(CACHE_DIR, `${key}.webp`);
  try {
    await access(cacheFile);
    return true; // already cached
  } catch {
    // not cached; check negative cache before spending a fetch
  }
  if (await negativeCacheHit(key)) return false; // known-bad / recently-slow
  return encodeToCache(url, width, key);
}

export async function publishFromCache(key: string): Promise<void> {
  if (published.has(key)) return;
  const from = join(CACHE_DIR, `${key}.webp`);
  const to = join(OUT_IMG_DIR, `${key}.webp`);
  await ensureDirs();
  if (!existsSync(to)) {
    await copyFile(from, to);
  }
  published.add(key);
}

/**
 * Resolve a remote image URL to a build-time optimized local webp, with an
 * on-disk cache. NEVER throws: on any failure it logs a concise warning and
 * returns the original remote URL (passthrough).
 */
export async function resolveRemoteImage(
  url: string | null | undefined,
  { width }: ResolveOptions,
): Promise<ResolvedImage> {
  if (!url) return { src: '', optimized: false };

  const key = cacheKey(url, width);
  const cacheFile = join(CACHE_DIR, `${key}.webp`);

  await ensureDirs();

  // Warm path: cached optimized file exists (prefetch pool or a prior build/
  // page already encoded it) -> publish into dist/ + return immediately.
  try {
    await access(cacheFile);
    await publishFromCache(key);
    return { src: `${PUBLIC_IMG_URL}/${key}.webp`, optimized: true };
  } catch {
    // not cached; fall through
  }

  // Persistent negative cache (shared with the prefetch pool): a prior attempt
  // marked this URL permanently bad (.miss) or recently-slow within the
  // retry-after window (.slow). Passthrough WITHOUT refetching — this stops the
  // known-bad / chronically-slow covers being refetched once per locale.
  if (failedThisProcess.has(key) || (await negativeCacheHit(key))) {
    return { src: url, optimized: false };
  }

  // Cold path: encode via the SAME implementation the prefetch pool uses.
  // encodeToCache is fail-soft (never throws); false -> passthrough.
  const ok = await encodeToCache(url, width, key);
  if (!ok) {
    failedThisProcess.add(key);
    return { src: url, optimized: false };
  }
  await publishFromCache(key);
  return { src: `${PUBLIC_IMG_URL}/${key}.webp`, optimized: true };
}

/** Number of cached optimized images (diagnostic; safe if dir absent). */
export async function cacheSize(): Promise<number> {
  try {
    const files = await readdir(CACHE_DIR);
    return files.filter((f) => f.endsWith('.webp')).length;
  } catch {
    return 0;
  }
}
