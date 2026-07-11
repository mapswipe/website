# astro-incremental-static

Incremental static builds for Astro (`output: 'static'`): a per-page
`propsHash` **render-skip** wired into `getStaticPaths`, plus a build
orchestration that merges the previous `dist`, prunes deleted pages, and
regenerates the sitemap over the merged tree.

Nothing in the ecosystem does render-skip: Astro re-renders every page every
build (so do Next stable and canary — measured). On a ~14.7k-page site this
package turns a one-record data change into a ~6 s build instead of ~33 s.

## ⚠️ Correctness contract (read this first)

1. **`propsData` completeness is YOUR responsibility.** For every candidate
   path you pass to `selectPaths`, `propsData` must cover *everything* that
   can change the rendered page apart from code (the runner's `codeHash`
   covers code/content inputs). Any data you render but leave out of
   `propsData` produces **silently stale pages** — the page won't rebuild
   when only that data changes. Aggregate pages (lists, stats) must hash the
   whole payload they summarize, not just the visible slice.
2. **The stale-page footgun compounds silently.** A missed dependency isn't an
   error — the build succeeds and the page is simply old until an unrelated
   change happens to rebuild it. Audit every `selectPaths` call site when the
   page's data sources change.
3. **Activation is explicit.** Selection only happens when the runner sets
   `ASTRO_INCREMENTAL=1` in the spawned build's environment. A plain
   `astro build` is ALWAYS a full build, even with a stale state dir on disk
   (file presence is stale state, not intent).

## Install

In-repo workspace package (`private: true`, not published). From an app in the
same npm workspace:

```jsonc
// package.json
{
  "workspaces": ["packages/*"],
  "dependencies": { "astro-incremental-static": "*" },
  "scripts": { "build:incremental": "node scripts/incremental-build.mjs" }
}
```

Zero dependencies. Requires Node ≥ 22.18 (TypeScript source, loaded via
Node's built-in type stripping; Vite transforms it for page-side imports).

## Usage

**1. Page side** — wrap each `getStaticPaths` result in `selectPaths`:

```ts
import { selectPaths } from 'astro-incremental-static';

export const getStaticPaths = (() => {
  const candidates = records.flatMap((record) => LOCALES.map((locale) => ({
    key: `${locale}/projects/${record.id}`, // canonical dist out-path, no slashes at ends
    params: { locale, id: record.id },
    propsData: record, // SAME reference across the record's locales -> hashed once
  })));
  return selectPaths('projects', candidates);
});
```

Outside the runner this returns every candidate and touches no state — the
normal build path is completely unaffected.

**2. Orchestration** — a small script (`scripts/incremental-build.mjs`):

```js
import { runIncrementalBuild } from 'astro-incremental-static/runner';

runIncrementalBuild({
  codeHash: {
    include: ['src/**', 'astro.config.mjs', 'package.json'],
  },
  prune: { routes: ['*/projects/*', '*/blogs/*'] },
  sitemap: {
    site: 'https://example.org',
    locales: ['en', 'de'],
    defaultLocale: 'en',
  },
  prefetch: { cmd: 'node', args: ['scripts/prefetch-images.mjs'] }, // optional
});
```

Restore `dist/` and the state dir from your CI cache before running; persist
both afterward.

## API

```ts
// 'astro-incremental-static'
selectPaths(pageId, candidates, opts?)  // the render-skip gate (memoised hashing)
isIncrementalBuild()                    // ASTRO_INCREMENTAL === '1'
hashProps(propsData)                    // sha1 of data minus volatile buildDate
readCodeHash(stateDir?) / readManifest(stateDir?)

// 'astro-incremental-static/runner'
runIncrementalBuild(config)             // the whole orchestration (throws on child failure)
```

`Candidate<Params, Props>`: `{ key, params, propsData, props? }` — unchanged
contract from the original in-app implementation.

## Config (`runIncrementalBuild`)

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `root` | `string` | `process.cwd()` | App root the build runs from. |
| `distDir` | `string` | `'dist'` | Build output dir (root-relative). The merge staging dir is `<distDir>-cache`. |
| `stateDir` | `string` | `'.astro-incremental'` | Manifest + code hash + shards. Gitignore it; persist in CI. Exported to the build via `ASTRO_INCREMENTAL_STATE_DIR`. |
| `codeHash.include` | `string[]` | — (required) | Root-relative globs (`**` crosses `/`, `../` allowed) of every code/content input that affects rendered output — EXCLUDING the data axis (tracked per page via `propsData`) and build artifacts. |
| `codeHash.exclude` | `string[]` | `[]` | Globs subtracted from the include set. |
| `prune.routes` | `string[]` | off | Dist-relative dir patterns whose children are per-record pages (e.g. `*/projects/*`). Matched dirs not present as manifest keys are removed after the merge. Segments may use `*`/`?`; `**` unsupported here. |
| `sitemap` | object \| `false` | `false` | `{ enabled?, site, locales, defaultLocale }`. Required when using @astrojs/sitemap — regenerates `sitemap-0.xml`/`sitemap-index.xml` over the MERGED tree (structurally identical to @astrojs/sitemap's i18n output: hreflang alternate groups, redirect stubs excluded, root `/` included as the default locale). |
| `buildCommand` | `{cmd, args}` | `astro build` | Resolved via `<root>/node_modules/.bin` when present. Spawned with `ASTRO_INCREMENTAL=1`. |
| `prefetch` | `{cmd, args}` | off | Command run before the build (cache warm etc.). |

## How a run proceeds

1. Compute `codeHash` over the configured inputs; write it to the state dir.
2. Move the previous `dist` aside.
3. Run `prefetch` (if any), then `buildCommand` with `ASTRO_INCREMENTAL=1` —
   every `selectPaths` returns only changed/new paths and writes its manifest
   shard.
4. `codeHash` changed → the fresh (full) dist is authoritative; done.
   Otherwise merge: copy the small fresh tree over the cached full tree.
5. Prune deleted record dirs (`prune.routes` minus manifest keys).
6. Regenerate the sitemap over the merged tree.
7. Persist the merged manifest for the next run.

Routes *without* a `selectPaths`-wired `getStaticPaths` (the 404, static file
endpoints, redirect stubs) are cheaply re-emitted every run and therefore
always fresh.

## Both historical bugs are fixed inside the package

- **Env-var gating**: selection is armed ONLY by `ASTRO_INCREMENTAL=1`, never
  by state-dir presence — a plain `astro build` after an incremental run is a
  full build, not a silent partial one.
- **Merged-tree sitemap regen**: the runner rebuilds the full sitemap from the
  merged dist, so an incremental run can't silently shrink the published
  sitemap to just the pages it rendered.


---
*In this repo: the evidence for the numbers above, the decision record, and the exit path for this package live in [`docs/ownership-map.md`](../../../docs/ownership-map.md) and [`docs/upstream/`](../../../docs/upstream/).*
