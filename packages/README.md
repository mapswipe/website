# packages/ — deliberately-owned build infrastructure

Three reusable Astro packages (npm workspaces, `private: true`, publish-ready).
Each exists because Astro measurably cannot do the job via config or an
existing integration — the full evidence trail is in
[`docs/ownership-map.md`](../docs/ownership-map.md) (what's platform vs.
ours, and why), [`docs/adr/0002-migrate-to-astro.md`](../docs/adr/0002-migrate-to-astro.md)
(the migration decisions), and [`docs/benchmarks.md`](../docs/benchmarks.md)
(every number cited below).

| Package | One-liner | Configured in this app at |
| --- | --- | --- |
| [`astro-hydration-dedup`](astro-hydration-dedup/) | Externalizes Astro's force-inlined island hydration runtimes (was 57 MB / 12% of dist duplicated across 14.6k pages) into per-script cached files | `astro.config.mjs` (`hydrationDedup({ minOccurrences: 10 })`) |
| [`astro-remote-images`](astro-remote-images/) | Build-time remote-image optimization that cannot kill the build: per-image error policy (error-image/passthrough/fail), bounded concurrent prefetch, negative caching (production data contained 8 build-fatal images) | `src/lib/remoteImages.ts` (instance + policies), `scripts/prefetch-images.mjs` (URL collector) |
| [`astro-incremental-static`](astro-incremental-static/) | Render-skip incremental builds for `output: 'static'` — nothing else does this (verified vs Astro & Next stable/canary); one-project change 6 s vs 33 s full | `scripts/incremental-build.mjs` (runner config); pages import `selectPaths` |

Two of the three are stopgaps we *want* to delete: ready-to-file upstream
feature requests live in [`docs/upstream/`](../docs/upstream/). If either
lands in Astro, delete the corresponding package (see each README's caveats).

Rules for adding a fourth: see "Rules of thumb" in the ownership map —
config → official integration → maintained community integration → only then
hand-roll, with a measured why and an exit path.
