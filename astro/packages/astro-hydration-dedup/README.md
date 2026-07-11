# astro-hydration-dedup

Astro integration that deduplicates **byte-identical inline classic
`<script>` blocks** — in practice, Astro's force-inlined island-hydration
runtimes — across a statically built site into external, content-hashed,
cacheable files.

## Why

Astro hard-inlines its client-directive runtimes (the `<astro-island>`
custom-element runtime, the `client:only` / `client:visible` loaders, …) into
*every* island-bearing page, and there is no config to externalize them
(`vite.build.assetsInlineLimit: 0` has no effect — verified; see
[withastro/docs#2150](https://github.com/withastro/docs/issues/2150),
[withastro/roadmap#36](https://github.com/withastro/roadmap/discussions/36),
[withastro/astro#6247](https://github.com/withastro/astro/issues/6247)).
On a ~14.6k-page site that is ~56 MB (~12% of dist) of byte-identical
duplication. This integration removes it as an `astro:build:done`
post-process. Delete it when an upstream external-hydration-scripts option
lands.

## How it works

1. **Discover** — scans every built HTML page (subject to `include`/`exclude`)
   for inline attribute-less classic `<script>…</script>` blocks and tallies,
   per distinct exact byte sequence, how many pages carry it. No hardcoded
   paths, no assumptions about which scripts exist.
2. **Emit** — every block that recurs on ≥ `minOccurrences` pages is written
   once as `<outDir>/<filenamePrefix>-<hash8>.js` (content-hashed: the URL is
   stable while the content is, and busts caches across Astro upgrades).
3. **Rewrite in place** — every inline occurrence is replaced *at its own
   position* with `<script src="…"></script>` (a classic **blocking** script,
   so synchronous execution at the same document position preserves
   semantics). Per-script in-place replacement preserves execution position
   and order for arbitrary directive combinations across pages.

Safety properties:

- **Threshold as guard** — a script must recur verbatim on `minOccurrences`
  pages before it is externalized, so page-specific inline scripts are never
  touched.
- **Idempotent** — pages already rewritten (e.g. merged from a cached,
  previously post-processed dist) carry no inline block anymore and are left
  alone; already-externalized pages still count toward the threshold via
  their `<script src>` references, so incremental/merged trees don't starve
  the tally.
- **Fail-soft** — any anomaly logs a warning and leaves the build output
  untouched; the build never fails over an optimization.
- **Pooled rewrites** — bounded-concurrency file IO (16 in flight) keeps
  wall-time low on tens of thousands of pages.

## Install

In-repo workspace package (`private: true`, not published). From an app in
the same npm workspace:

```jsonc
// package.json
{
  "workspaces": ["packages/*"],
  "dependencies": { "astro-hydration-dedup": "*" }
}
```

For a third-party project, copy the package into your workspace (or publish
it) — it has no dependencies beyond an `astro >= 4` peer. Requires Node
≥ 22.18 (the entry point is TypeScript, loaded via Node's built-in type
stripping; any bundler-based consumer, incl. Astro's config loader, also
handles it natively).

## Usage

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import hydrationDedup from 'astro-hydration-dedup';

export default defineConfig({
  integrations: [
    // ... other integrations ...
    // Register LAST so it post-processes the final HTML after other
    // build:done hooks (e.g. @astrojs/sitemap).
    hydrationDedup({ minOccurrences: 10 }),
  ],
});
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `minOccurrences` | `number` | `10` | Externalize a distinct inline script only when it appears verbatim on at least this many pages. Doubles as the safety guard against grabbing page-specific scripts. Note: a runtime shared by only a handful of pages (e.g. a `client:load` loader on 6 sibling pages) stays inline at the default — lower the threshold to catch it, at the cost of a weaker guard. |
| `outDir` | `string` | `'_astro'` | Directory under the build output to emit shared files into. |
| `filenamePrefix` | `string` | `'dedup'` | Emitted files are named `<filenamePrefix>-<hash8>.js`. |
| `include` | `string[]` | all `.html` | Page globs (relative to the build output, `/`-separated; `**` crosses `/`, `*`/`?` don't) to consider. |
| `exclude` | `string[]` | none | Page globs to skip (applied after `include`). |
| `enabled` | `boolean` | `true` | Master switch (e.g. disable in dev-ish builds). |

## Output

One summary line per build:

```
[astro-hydration-dedup] 3 shared script(s) externalized, 14580 page(s) rewritten
(14680 scanned, 5 distinct inline blocks, ~55.9 MB deduplicated):
_astro/dedup-1a2b3c4d.js (3542 B × 14574 pages), …
```

## Caveats

- Only **attribute-less classic** `<script>` blocks are considered (exactly
  how Astro emits its directive runtimes). `<script type="module">`, scripts
  with `src`, or any attribute are intentionally ignored.
- The emitted tag is a blocking classic script — identical execution
  semantics to the inline original at the same position, at the cost of one
  extra (immutable, shared, cached) request per distinct runtime.
- Run it after any other integration that writes HTML.


---
*In this repo: the evidence for the numbers above, the decision record, and the exit path for this package live in [`docs/ownership-map.md`](../../../docs/ownership-map.md) and [`docs/upstream/`](../../../docs/upstream/).*
