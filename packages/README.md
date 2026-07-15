# packages/ — deliberately-owned build infrastructure

Four reusable Astro packages — plain directories imported by relative path
(no workspace linking); each keeps its own `package.json`/README so it can be
published later.
Each exists because Astro measurably cannot do the job via config or an
existing integration — every number cited below was
measured during the migration.

| Package | One-liner | Configured in this app at |
| --- | --- | --- |
| [`astro-hydration-dedup`](astro-hydration-dedup/) | Externalizes Astro's force-inlined island hydration runtimes (was 57 MB / 12% of dist duplicated across 14.6k pages) into per-script cached files | `astro.config.mjs` (`hydrationDedup({ minOccurrences: 10 })`) |
| [`astro-remote-images`](astro-remote-images/) | Build-time remote-image optimization that cannot kill the build: per-image error policy (error-image/passthrough/fail), bounded concurrent prefetch, negative caching (production data contained 8 build-fatal images) | `src/lib/remoteImages.ts` (instance + policies), `scripts/prefetch-images.mjs` (URL collector) |
| [`astro-incremental-static`](astro-incremental-static/) | Render-skip incremental builds for `output: 'static'` — nothing else does this (verified vs Astro & Next stable/canary); one-project change 6 s vs 33 s full | `scripts/incremental-build.mjs` (runner config); pages import `selectPaths` |
| [`astro-dist-sweep`](astro-dist-sweep/) | Mark-and-sweep for `dist/_astro/`: deletes assets nothing references (astro:assets ships image *originals* that only exist in optimized variants — 35 files / 28.7 MB here; merged incremental trees retain superseded variants) | `scripts/sweep-dist.mjs` (after plain builds); the incremental runner calls it itself |

Two of the three are stopgaps we *want* to delete: if Astro ever ships the
equivalent capability upstream, delete the corresponding package (see each
README's caveats and the issue links in the source headers).

Rules for adding a fourth: config → official integration → maintained
community integration → only then hand-roll, with a measured why and an
exit path documented in the package README.
