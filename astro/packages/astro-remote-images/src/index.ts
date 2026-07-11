// astro-remote-images — build-time, per-image, fail-soft remote image
// optimizer for Astro static builds, with an on-disk cache, a bounded
// concurrent prefetch pool, a two-tier negative cache, and a configurable
// per-image error policy (error image / passthrough / fail).
//
// UPSTREAM: no existing Astro issue covers a per-image error policy (verified
// 2026-07-10). Closest existing refs:
//   https://github.com/withastro/roadmap/discussions/523 (global error handling)
//   https://github.com/withastro/astro/issues/15920 (remote revalidation, adjacent)
// Delete this package when an upstream error policy lands.
//
// Why this exists (and why it bypasses Astro's <Image>/astro:assets):
// Astro's optimize phase is all-or-nothing — a single malformed remote image
// (e.g. a broken SVG mislabeled as raster) makes sharp throw fatally and
// aborts the entire build (rc=1), uncatchable per-image. Here we own the
// fetch + sharp pipeline so each image is wrapped in try/catch and fails soft
// per the configured policy while the good ones are optimized + cached.
//
// Runs at build time only (Node). Not for client bundles.
import { createHash } from 'node:crypto';
import {
    access,
    copyFile,
    mkdir,
    readFile,
    readdir,
    stat,
    writeFile,
} from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

export type ErrorPolicy = 'error-image' | 'passthrough' | 'fail';
export type ImageFormat = 'webp' | 'avif' | 'jpeg' | 'png';

export interface RemoteImagesOptions {
    /** Default render/prefetch width (px, never upscaled). Default 640. */
    width?: number;
    /** Widths the prefetch pool warms per URL. Default `[width]`. */
    widths?: number[];
    /** Encoder quality. Default 80. NOTE: not part of the cache key — changing it requires wiping `cacheDir`. */
    quality?: number;
    /** Output format. Default `'webp'`. Part of the cache key. */
    format?: ImageFormat;
    /**
     * Anchor for all relative paths. Default `process.cwd()` — the app root
     * the build runs from (deliberately NOT import.meta.url: after Vite
     * bundles this module the emitted file's location is meaningless).
     */
    root?: string;
    /** Persistent on-disk cache dir (persist across CI builds). Default `.image-cache`. */
    cacheDir?: string;
    /** Astro build output dir the optimized files are published into. Default `dist`. */
    distDir?: string;
    /** Public URL prefix the browser requests (also the folder under distDir). Default `/_img`. */
    publicPrefix?: string;
    /** Prefetch pool size (concurrent in-flight fetches). Default 24. */
    concurrency?: number;
    /** Per-image fetch timeout. Prevents one hung origin from stalling the build. Default 15000. */
    fetchTimeoutMs?: number;
    /**
     * Retry-after TTL for TRANSIENT failures (timeout / network / 5xx),
     * recorded as `.slow` markers: the URL is not refetched until the TTL
     * elapses. Default 6 h. Without it a chronically-slow origin re-pays the
     * full fetch timeout on EVERY build.
     */
    transientRetryAfterMs?: number;
    /**
     * TTL for PERMANENT failures (corrupt data / 4xx), recorded as `.miss`
     * markers. Default `Infinity` (never refetched until the cache dir is
     * wiped).
     */
    permanentTtlMs?: number;
    /** Optional allow-list of URL hosts. A URL on another host is treated as a permanent failure (no fetch). */
    allowedHosts?: string[];
    /** Policy for PERMANENT failures (corrupt data, 4xx). Default `'error-image'`. */
    onError?: ErrorPolicy;
    /**
     * Policy for TRANSIENT failures (timeout / network / 5xx). Default
     * `'passthrough'` — the original remote URL is served, so the browser may
     * still load it even though the build-time fetch failed. Set
     * `'error-image'` for deterministic output at the cost of hiding images
     * from merely-slow origins.
     */
    onTransientError?: ErrorPolicy;
    /**
     * Public URL path of a custom error image you ship yourself (e.g. under
     * `public/`). Default: a bundled neutral SVG placeholder published once
     * into `<distDir><publicPrefix>/image-error.svg`.
     */
    errorImage?: string;
}

export interface ResolveOptions {
    width?: number;
}

export interface ResolvedImage {
    /** URL to render in <img src>: local optimized path, error image, or original remote URL. */
    src: string;
    /** True when a locally optimized file is served. */
    optimized: boolean;
    /** Failure reason when the image could not be optimized. */
    error?: string;
}

export interface PrefetchSummary {
    total: number;
    optimized: number;
    failed: number;
    seconds: number;
}

export interface RemoteImages {
    /** Resolved options (defaults applied). */
    options: Required<Omit<RemoteImagesOptions, 'allowedHosts' | 'errorImage'>>
        & Pick<RemoteImagesOptions, 'allowedHosts' | 'errorImage'>;
    /**
     * Resolve a remote URL to a build-time optimized local file, applying the
     * configured error policy on failure. Never throws unless the matching
     * policy is `'fail'`.
     */
    resolve(url: string | null | undefined, opts?: ResolveOptions): Promise<ResolvedImage>;
    /**
     * Warm the on-disk cache for many URLs with a bounded pool, WITHOUT
     * publishing into the build output (that happens per-page at render
     * time). Never throws — prefetch is a cache warm, not a build gate; a
     * `'fail'` policy only fires at resolve time.
     */
    prefetch(urls: string[] | (() => string[] | Promise<string[]>), opts?: ResolveOptions): Promise<PrefetchSummary>;
    /** Number of cached optimized images (diagnostic; safe if dir absent). */
    cacheSize(): Promise<number>;
}

// Bundled default error image: a neutral "image unavailable" placeholder
// (broken-frame iconography, no locale-dependent text). Inlined as a string —
// NOT read from a file next to this module — so it survives Vite bundling
// (import.meta.url-relative paths break once the module is emitted into the
// SSR bundle).
export const ERROR_IMAGE_FILENAME = 'image-error.svg';
const ERROR_IMAGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420" role="img" aria-label="image unavailable">
<rect width="640" height="420" fill="#eceff1"/>
<g stroke="#90a4ae" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round">
<rect x="200" y="130" width="240" height="160" rx="14"/>
<circle cx="262" cy="182" r="16"/>
<path d="M212 278l72-72 46 46 34-34 64 60"/>
<path d="M180 330L460 90"/>
</g>
</svg>
`;

const MARKER_EXTS = ['miss', 'slow'] as const;
type MarkerExt = (typeof MARKER_EXTS)[number];

// True for failures that are the image's fault, not the network's — a corrupt
// or empty buffer, or a 4xx. sharp throws these with recognizable messages.
function isDeterministicFailure(reason: string): boolean {
    return (
        reason.startsWith('HTTP 4')
        || reason.includes('Input buffer')
        || reason.includes('Input Buffer')
        || reason.includes('unsupported image format')
        || reason.includes('VipsForeignLoad')
        || reason.includes('host not allowed')
    );
}

/**
 * Shared sharp encode: resize to `width` (never upscale) + encode. `input`
 * may be a Buffer (remote) or a file path. Animated inputs (GIF, multi-page)
 * are decoded with { animated: true } and re-encoded animated (webp) so
 * animation survives the resize. Returns the encoded buffer.
 */
export async function encodeImageBuffer(
    input: Buffer | string,
    width: number,
    format: ImageFormat = 'webp',
    quality = 80,
): Promise<Buffer> {
    // Probe for animation. A multi-page (animated) source must be opened with
    // { animated: true } or sharp collapses it to the first frame.
    let animated = false;
    try {
        const meta = await sharp(input).metadata();
        animated = (meta.pages ?? 1) > 1 || meta.format === 'gif';
    } catch {
        // If probing fails, treat as a normal static image; the encode below
        // will surface any real decode error to the caller (fail-soft there).
    }
    return sharp(input, animated ? { animated: true } : undefined)
        .resize({ width, withoutEnlargement: true })
        .toFormat(format, { quality })
        .toBuffer();
}

export function createRemoteImages(userOptions: RemoteImagesOptions = {}): RemoteImages {
    const width = userOptions.width ?? 640;
    const options: RemoteImages['options'] = {
        width,
        widths: userOptions.widths ?? [width],
        quality: userOptions.quality ?? 80,
        format: userOptions.format ?? 'webp',
        root: userOptions.root ?? process.cwd(),
        cacheDir: userOptions.cacheDir ?? '.image-cache',
        distDir: userOptions.distDir ?? 'dist',
        publicPrefix: userOptions.publicPrefix ?? '/_img',
        concurrency: userOptions.concurrency ?? 24,
        fetchTimeoutMs: userOptions.fetchTimeoutMs ?? 15000,
        transientRetryAfterMs: userOptions.transientRetryAfterMs ?? 6 * 60 * 60 * 1000,
        permanentTtlMs: userOptions.permanentTtlMs ?? Infinity,
        onError: userOptions.onError ?? 'error-image',
        onTransientError: userOptions.onTransientError ?? 'passthrough',
        allowedHosts: userOptions.allowedHosts,
        errorImage: userOptions.errorImage,
    };

    const CACHE_DIR = join(options.root, options.cacheDir);
    // Published directly into distDir (public/ would be copied BEFORE static
    // route generation, too early for render-time-produced files).
    const OUT_IMG_DIR = join(options.root, options.distDir, ...options.publicPrefix.split('/').filter(Boolean));
    const PUBLIC_URL = options.publicPrefix.replace(/\/$/, '');
    const ext = options.format;

    let dirsReady: Promise<void> | null = null;
    function ensureDirs(): Promise<void> {
        if (!dirsReady) {
            dirsReady = (async () => {
                await mkdir(CACHE_DIR, { recursive: true });
                await mkdir(OUT_IMG_DIR, { recursive: true });
            })();
        }
        return dirsReady;
    }

    // Cache key: sha1 of url|width|format. Quality is deliberately NOT part
    // of the key (changing it requires a cache wipe — documented) so the
    // layout stays byte-compatible with pre-package caches (url|w=N|webp).
    function cacheKey(url: string, w: number): string {
        return createHash('sha1').update(`${url}|w=${w}|${options.format}`).digest('hex');
    }

    // Track keys already published into dist/ this process, so concurrent
    // page renders don't redundantly copy.
    const published = new Set<string>();
    // In-process negative cache: keys that failed THIS process. Within one
    // build a URL renders across every locale — without this each locale
    // would re-pay the full fetch timeout. Process-scoped, so a transient
    // failure is retried on the next build. Maps key -> { reason, permanent }.
    const failedThisProcess = new Map<string, { reason: string; permanent: boolean }>();
    // Warn exactly once per key per process (a URL substitutes identically
    // across locales — one line is signal, six are noise).
    const warned = new Set<string>();

    // Two-tier persistent negative cache, marker files next to the would-be
    // encoded file:
    //   .miss — PERMANENT (corrupt data / 4xx): skipped for permanentTtlMs
    //           (default forever, until the cache dir is wiped).
    //   .slow — TRANSIENT (timeout / network / 5xx): skipped until
    //           transientRetryAfterMs elapses (marker mtime), then retried.
    // Both let render passes short-circuit WITHOUT a refetch. The marker body
    // stores the original failure reason for later warnings.
    async function writeMarker(key: string, kind: MarkerExt, reason: string): Promise<void> {
        await writeFile(join(CACHE_DIR, `${key}.${kind}`), reason);
    }

    async function readNegativeCache(
        key: string,
    ): Promise<{ reason: string; permanent: boolean } | undefined> {
        for (const kind of MARKER_EXTS) {
            const marker = join(CACHE_DIR, `${key}.${kind}`);
            try {
                const st = await stat(marker);
                const ttl = kind === 'miss' ? options.permanentTtlMs : options.transientRetryAfterMs;
                if (Date.now() - st.mtimeMs < ttl) {
                    let reason = '';
                    try {
                        reason = (await readFile(marker, 'utf8')).trim();
                    } catch {
                        // legacy empty marker
                    }
                    return {
                        reason: reason || `previous ${kind === 'miss' ? 'permanent' : 'transient'} failure (cached)`,
                        permanent: kind === 'miss',
                    };
                }
            } catch {
                // no marker of this kind
            }
        }
        return undefined;
    }

    let errorImageReady: Promise<string> | null = null;
    // Publish the bundled error image once into the build output and return
    // its public URL. A user-supplied errorImage path is returned as-is (the
    // user ships that file, e.g. from public/).
    function ensureErrorImage(): Promise<string> {
        if (options.errorImage) {
            return Promise.resolve(options.errorImage);
        }
        if (!errorImageReady) {
            errorImageReady = (async () => {
                await ensureDirs();
                const out = join(OUT_IMG_DIR, ERROR_IMAGE_FILENAME);
                if (!existsSync(out)) {
                    await writeFile(out, ERROR_IMAGE_SVG);
                }
                return `${PUBLIC_URL}/${ERROR_IMAGE_FILENAME}`;
            })();
        }
        return errorImageReady;
    }

    // Apply the configured error policy for a failed image. ALWAYS warns
    // (once per key per process) with URL + reason before substituting.
    async function applyFailurePolicy(
        url: string,
        key: string,
        reason: string,
        permanent: boolean,
    ): Promise<ResolvedImage> {
        const policy = permanent ? options.onError : options.onTransientError;
        if (!warned.has(key)) {
            warned.add(key);
            // eslint-disable-next-line no-console
            console.warn(`[remote-images] ${policy} (${reason}): ${url}`);
        }
        if (policy === 'fail') {
            throw new Error(`[remote-images] failed to optimize ${url}: ${reason}`);
        }
        if (policy === 'error-image') {
            const src = await ensureErrorImage();
            return { src, optimized: false, error: reason };
        }
        return { src: url, optimized: false, error: reason };
    }

    // Cold path shared by the per-page resolver and the prefetch pool: fetch
    // the remote image, resize + encode, write into the on-disk cache. NEVER
    // throws — on failure it records the negative-cache marker and returns
    // the classified failure. Single source of truth for fetch+sharp+cache.
    async function encodeToCache(
        url: string,
        w: number,
        key: string,
    ): Promise<{ ok: true } | { ok: false; reason: string; permanent: boolean }> {
        const cacheFile = join(CACHE_DIR, `${key}.${ext}`);
        try {
            await ensureDirs();
            if (options.allowedHosts) {
                const host = new URL(url).host;
                if (!options.allowedHosts.includes(host)) {
                    throw new Error(`host not allowed: ${host}`);
                }
            }
            // Hard timeout: one slow/hung origin must not stall the build
            // (fetch has no default timeout).
            const res = await fetch(url, { signal: AbortSignal.timeout(options.fetchTimeoutMs) });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const input = Buffer.from(await res.arrayBuffer());
            // Explicit width (no inferSize): no render-time dimension fetch.
            const output = await encodeImageBuffer(input, w, options.format, options.quality);
            await writeFile(cacheFile, output);
            return { ok: true };
        } catch (err) {
            const reason = err instanceof Error ? err.message : String(err);
            const permanent = isDeterministicFailure(reason);
            // Best-effort marker write — a failed write just means a retry
            // next build (still safe).
            try {
                await writeMarker(key, permanent ? 'miss' : 'slow', reason);
            } catch {
                // ignore
            }
            failedThisProcess.set(key, { reason, permanent });
            return { ok: false, reason, permanent };
        }
    }

    async function publishFromCache(key: string): Promise<void> {
        if (published.has(key)) {
            return;
        }
        const from = join(CACHE_DIR, `${key}.${ext}`);
        const to = join(OUT_IMG_DIR, `${key}.${ext}`);
        await ensureDirs();
        if (!existsSync(to)) {
            await copyFile(from, to);
        }
        published.add(key);
    }

    async function resolve(
        url: string | null | undefined,
        opts: ResolveOptions = {},
    ): Promise<ResolvedImage> {
        if (!url) {
            return { src: '', optimized: false };
        }
        const w = opts.width ?? options.width;
        const key = cacheKey(url, w);
        const cacheFile = join(CACHE_DIR, `${key}.${ext}`);

        await ensureDirs();

        // Warm path: cached file exists (prefetch pool or a prior build/page
        // encoded it) -> publish into the build output + return.
        try {
            await access(cacheFile);
            await publishFromCache(key);
            return { src: `${PUBLIC_URL}/${key}.${ext}`, optimized: true };
        } catch {
            // not cached; fall through
        }

        // Negative caches (in-process, then persistent): a prior attempt
        // failed — apply the policy WITHOUT refetching.
        const processFailure = failedThisProcess.get(key);
        if (processFailure) {
            return applyFailurePolicy(url, key, processFailure.reason, processFailure.permanent);
        }
        const diskFailure = await readNegativeCache(key);
        if (diskFailure) {
            return applyFailurePolicy(url, key, diskFailure.reason, diskFailure.permanent);
        }

        // Cold path: same implementation the prefetch pool uses.
        const result = await encodeToCache(url, w, key);
        if (!result.ok) {
            return applyFailurePolicy(url, key, result.reason, result.permanent);
        }
        await publishFromCache(key);
        return { src: `${PUBLIC_URL}/${key}.${ext}`, optimized: true };
    }

    /** Cache warm for one url/width. Cache hit -> no-op. Never throws. */
    async function prefetchOne(url: string, w: number): Promise<boolean> {
        const key = cacheKey(url, w);
        try {
            await access(join(CACHE_DIR, `${key}.${ext}`));
            return true; // already cached
        } catch {
            // not cached; consult negative cache before spending a fetch
        }
        if (failedThisProcess.has(key) || (await readNegativeCache(key)) !== undefined) {
            return false; // known-bad / recently-slow
        }
        const result = await encodeToCache(url, w, key);
        if (!result.ok && !warned.has(key)) {
            warned.add(key);
            // eslint-disable-next-line no-console
            console.warn(`[remote-images] prefetch failed (${result.reason}): ${url}`);
        }
        return result.ok;
    }

    async function prefetch(
        urlsOrFn: string[] | (() => string[] | Promise<string[]>),
        opts: ResolveOptions = {},
    ): Promise<PrefetchSummary> {
        const start = Date.now();
        const raw = typeof urlsOrFn === 'function' ? await urlsOrFn() : urlsOrFn;
        const urls = [...new Set(raw.filter(Boolean))];
        const widths = opts.width !== undefined ? [opts.width] : options.widths;
        const jobs = urls.flatMap((url) => widths.map((w) => ({ url, w })));
        const total = jobs.length;
        // eslint-disable-next-line no-console
        console.log(
            `[remote-images] prefetch: ${urls.length} unique URLs × ${widths.length} width(s), `
            + `concurrency=${options.concurrency}`,
        );

        let optimized = 0;
        let failed = 0;
        let next = 0;
        async function worker() {
            for (;;) {
                const i = next;
                next += 1;
                if (i >= total) {
                    return;
                }
                const ok = await prefetchOne(jobs[i].url, jobs[i].w);
                if (ok) {
                    optimized += 1;
                } else {
                    failed += 1;
                }
                const done = optimized + failed;
                if (done % 250 === 0 || done === total) {
                    // eslint-disable-next-line no-console
                    console.log(`[remote-images] prefetch ${done}/${total} (optimized=${optimized} failed=${failed})`);
                }
            }
        }
        await Promise.all(Array.from({ length: Math.min(options.concurrency, total) }, worker));

        const seconds = (Date.now() - start) / 1000;
        // eslint-disable-next-line no-console
        console.log(
            `[remote-images] prefetch done: ${optimized} optimized / ${failed} failed / ${total} total `
            + `in ${seconds.toFixed(1)}s`,
        );
        return { total, optimized, failed, seconds };
    }

    async function cacheSize(): Promise<number> {
        try {
            const files = await readdir(CACHE_DIR);
            return files.filter((f) => f.endsWith(`.${ext}`)).length;
        } catch {
            return 0;
        }
    }

    const instance: RemoteImages = { options, resolve, prefetch, cacheSize };
    defaultInstance = instance; // last created instance is the component default
    return instance;
}

// Default-instance registry for the <RemoteImage /> component: the component
// can't receive the factory instance as a prop ergonomically, so the LAST
// createRemoteImages() call becomes the default. Apps should create their
// configured instance in a module the component's consumers import (import
// order then guarantees configuration happens first). If no instance was ever
// created, a bare-defaults one is created lazily.
let defaultInstance: RemoteImages | undefined;

export function getDefaultRemoteImages(): RemoteImages {
    if (!defaultInstance) {
        defaultInstance = createRemoteImages();
    }
    return defaultInstance;
}
