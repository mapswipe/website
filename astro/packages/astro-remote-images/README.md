# astro-remote-images

Build-time, **per-image, fail-soft** remote image optimizer for Astro static
builds. Owns the fetch + [sharp](https://sharp.pixelplumbing.com/) pipeline so
that every image is individually try/caught: one malformed or unreachable
remote image can never abort your 14k-page build. Comes with an on-disk cache,
a bounded concurrent prefetch pool, a two-tier negative cache, and a
configurable per-image **error policy** (error image / passthrough / fail).

## Why not `astro:assets` / `<Image>`?

Astro's optimize phase is all-or-nothing for remote images: a single corrupt
image (e.g. a broken SVG mislabeled as raster) makes sharp throw fatally and
aborts the entire build, uncatchable per-image (verified against production
data containing 8 such images). And naive render-time fetching serializes
thousands of downloads (measured: 27 min cold vs ~90 s with this package's
prefetch pool). No upstream issue covers a per-image error policy (closest:
[withastro/roadmap#523](https://github.com/withastro/roadmap/discussions/523),
[withastro/astro#15920](https://github.com/withastro/astro/issues/15920)).
Delete this package when an upstream error policy lands.

## Install

In-repo workspace package (`private: true`, not published). From an app in the
same npm workspace:

```jsonc
// package.json
{
  "workspaces": ["packages/*"],
  "dependencies": { "astro-remote-images": "*" }
}
```

For a third-party project, copy the package into your workspace (or publish
it). Only dependency: `sharp`. Requires Node ≥ 22.18 (TypeScript entry point,
loaded via Node's built-in type stripping; Vite-based consumers transform it
natively).

## Usage

**1. Configure one instance for your app** (a small module both your pages and
your prefetch script import):

```ts
// src/lib/remoteImages.ts
import { createRemoteImages } from 'astro-remote-images';

export const COVER_WIDTH = 640;

export const remoteImages = createRemoteImages({
  width: COVER_WIDTH,
  onError: 'error-image',          // permanent failures (corrupt / 4xx)
  onTransientError: 'error-image', // timeouts / 5xx / network
});
```

The **last** `createRemoteImages()` call also becomes the *default instance*
used by the bundled `<RemoteImage />` component — make sure your config module
is imported before the component renders (importing it from the same file
that imports the component is enough).

**2. Render images** — either through the bundled component:

```astro
---
import '../lib/remoteImages';                              // config first
import RemoteImage from 'astro-remote-images/RemoteImage.astro';
---
<RemoteImage src={remoteUrl} alt="…" width={640} height={420} />
```

or by calling `resolve()` directly (e.g. to build a URL map inside an
endpoint):

```ts
const { src, optimized } = await remoteImages.resolve(url, { width: 640 });
```

**3. Prefetch before the build** so renders are pure cache hits
(`node scripts/prefetch-images.mjs && astro build`):

```js
// scripts/prefetch-images.mjs
import { remoteImages } from '../src/lib/remoteImages.ts';

// You own the collector: return every remote URL the build will render.
async function collectUrls() { /* read your data source */ }

remoteImages.prefetch(collectUrls).catch((err) => {
  console.warn('[prefetch] non-fatal error, continuing to build:', err);
  process.exit(0); // prefetch is a cache warm, never a build blocker
});
```

## API

```ts
createRemoteImages(options?): RemoteImages
// -> { options, resolve(url, {width?}), prefetch(urls | () => urls, {width?}), cacheSize() }
getDefaultRemoteImages(): RemoteImages   // last created (or lazy bare-defaults)
encodeImageBuffer(input, width, format?, quality?)  // the raw sharp encode rule
```

`resolve()` returns `{ src, optimized, error? }` — `src` is the local
optimized path, the error image, or the original remote URL depending on
outcome and policy. It never throws unless the matching policy is `'fail'`.
`prefetch()` never throws (a `'fail'` policy fires at resolve time, not
during the warm).

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `width` | `number` | `640` | Default render/prefetch width (px, never upscaled). |
| `widths` | `number[]` | `[width]` | Widths the prefetch pool warms per URL. |
| `quality` | `number` | `80` | Encoder quality. **Not part of the cache key** — wipe `cacheDir` when changing it. |
| `format` | `'webp' \| 'avif' \| 'jpeg' \| 'png'` | `'webp'` | Output format (part of the cache key). |
| `root` | `string` | `process.cwd()` | Anchor for all relative paths (the app dir the build runs from). |
| `cacheDir` | `string` | `'.image-cache'` | Persistent on-disk cache. Persist across CI builds (see below). |
| `distDir` | `string` | `'dist'` | Astro build output dir optimized files are published into. |
| `publicPrefix` | `string` | `'/_img'` | Public URL prefix (and folder under `distDir`). |
| `concurrency` | `number` | `24` | Prefetch pool size. |
| `fetchTimeoutMs` | `number` | `15000` | Per-image fetch timeout. |
| `transientRetryAfterMs` | `number` | 6 h | Retry-after TTL for transient failures (`.slow` markers). |
| `permanentTtlMs` | `number` | `Infinity` | TTL for permanent failures (`.miss` markers). |
| `allowedHosts` | `string[]` | off | Optional URL-host allow-list; other hosts are treated as permanent failures without fetching. |
| `onError` | `'error-image' \| 'passthrough' \| 'fail'` | `'error-image'` | Policy for **permanent** failures (corrupt data, 4xx). |
| `onTransientError` | same | `'passthrough'` | Policy for **transient** failures (timeout / 5xx / network). Default passthrough: the browser may still load a merely-slow origin. Set `'error-image'` for deterministic output — but then a chronically slow origin shows the placeholder even though the image exists. |
| `errorImage` | `string` | bundled SVG | Public URL path of a custom error image you ship yourself (e.g. under `public/`). The bundled default is a neutral, text-free "image unavailable" SVG published once as `<publicPrefix>/image-error.svg`. |

Every substitution (error image or passthrough) logs
`[remote-images] <policy> (<reason>): <url>` — once per image per process.

## Caching model

- **Positive cache**: `<cacheDir>/<sha1(url|w=WIDTH|FORMAT)>.<format>` — the
  encoded output; publish into `dist` is a cheap copy. Persist this directory
  in CI (e.g. `actions/cache`) so warm builds skip every fetch+encode.
  **CI cache key implication:** the key contains url+width+format, so
  changing `width`/`format` (or `quality`, which is keyless) starts a full
  re-encode; the old entries are dead weight until the CI cache is rotated.
- **Negative cache**, two tiers of marker next to the would-be output, each
  storing the failure reason:
  - `.miss` — permanent (corrupt data / 4xx). Skipped for `permanentTtlMs`
    (default: forever, until the cache dir is wiped).
  - `.slow` — transient (timeout / network / 5xx). Skipped until
    `transientRetryAfterMs` elapses, then retried — a chronically-slow origin
    stops costing a fetch timeout on every build while a genuine blip still
    recovers.
- **In-process negative cache** on top, so one bad URL doesn't re-pay the
  timeout once per locale within a single build.

## Notes

- Animated GIFs are re-encoded as **animated** webp (every frame resized).
- Build-time only (Node). Never import from client/island code.
- The error-image SVG is inlined in the module (not read from a file) so it
  survives Vite bundling into the SSR build.


---
*In this repo: the evidence for the numbers above, the decision record, and the exit path for this package live in [`docs/ownership-map.md`](../../../docs/ownership-map.md) and [`docs/upstream/`](../../../docs/upstream/).*
