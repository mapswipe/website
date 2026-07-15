# astro-dist-sweep

Mark-and-sweep for Astro static builds: deletes files in the hashed-assets
dir (`dist/_astro/`) that nothing in the final tree references.

## Why

Two things leave unreferenced files there:

- **Always-emitted image originals.** astro:assets emits the *original* of
  every processed image whose `src` is touched at build time — markdown-body
  images, and any code reading `image().src` (this app's incremental
  change-detection signatures do). Pages only reference the derived
  variants, so the originals ship as dead weight in every build
  (35 files / 28.7 MB measured on this site).
- **Merged incremental trees.** astro-incremental-static overlays the fresh
  partial build onto the previous dist; a rebuilt page can reference
  newly-hashed variants while the merge keeps the superseded ones.

## How

Roots are all text files outside `_astro/` (page HTML — including
astro-island props — JSON endpoints, the sitemap), scanned for absolute
`/_astro/<name>` references. Marked js/css files are then scanned
transitively for vite's relative inter-chunk specifiers (`"./chunk-x.js"`)
and css `url()`s — that transitive step is what keeps lazily imported chunks
alive (e.g. a leaflet island chunk reachable *only* via `import()` from
another chunk, never from HTML). Everything never marked is deleted.

## Usage

```js
import { sweepSupersededAssets } from './packages/astro-dist-sweep/src/index.ts';

const { removed, bytes } = sweepSupersededAssets('dist');
```

Wired into this app in two places:

- `scripts/sweep-dist.mjs` — runs after every plain `astro build`
  (`pnpm build`),
- `packages/astro-incremental-static` runner — step 7, over the merged tree.

## Caveats

- Reference detection is textual. Dynamically *computed* asset URLs
  (`import('/_astro/' + name)`) would be missed — vite does not emit such
  patterns for its own chunks/assets.
- Only files directly inside `_astro/` are swept; page dirs and other
  top-level assets (`_img/`, `img/`) are never touched (`_img/` is managed
  by astro-remote-images).
