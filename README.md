# MapSwipe website

Static, SEO-driven, 6-locale site (~14,700 pages: 2,400+ projects × en/ne/hu/
de/cs/pt + blogs + static pages), deployed to GitHub Pages. Astro 5 with React
islands — most pages ship zero JS.

**Why Astro / how it's built:** [docs/adr/0002-migrate-to-astro.md](docs/adr/0002-migrate-to-astro.md)
(decisions), [docs/ownership-map.md](docs/ownership-map.md) (what's platform
vs. ours), [docs/benchmarks.md](docs/benchmarks.md) (measurements),
[docs/PLAN.md](docs/PLAN.md) (path to cutover), [TODO.md](TODO.md) (live tasks).

## Setup

```sh
# Node 22+ (packages/* and scripts/fetchData.ts are .ts consumed via Node's type stripping)
npm ci                      # installs the app + the packages/ workspaces

# Fetch site data (writes fullData/staticData.json — gitignored):
MAPSWIPE_API_ENDPOINT=https://backend.mapswipe.org/ \
MAPSWIPE_REFERER_ENDPOINT=https://mapswipe.org/ \
APP_ENVIRONMENT=PROD \
npm run fetch-data
```

`fetch-data` is **incremental**: it scans `{id, modifiedAt, lastContributionDate}`
and refetches only changed projects, merging with the previous
`staticData.json` (which IS the cache — persist it in CI). `FORCE_FULL_FETCH=1`
forces a full refetch (~50 s; run weekly as a safety net).

## Commands

| Command | What |
| --- | --- |
| `npm run dev` | dev server |
| `npm run build` | **full** static build → `dist/` (always renders every page) |
| `npm run build:incremental` | render-skip build: only pages whose data changed, merged over the previous `dist/` (~5–6 s vs ~33 s warm). See the [package README](packages/astro-incremental-static/README.md) — correctness contract applies |
| `npm run preview` | serve `dist/` locally |

A full warm build ≈ 33 s / 1.6 GB RAM; cold (empty image cache) ≈ 90–105 s
because 2,375 remote project covers are fetched + optimized. `dist/` ≈ 430 MB
(GitHub Pages limit is 1 GB).

## Caches & state (all gitignored; persist the first two in CI)

| Path | What | Cold cost if lost |
| --- | --- | --- |
| `.image-cache/` | optimized remote covers + negative cache (`.miss`/`.slow` markers) | ~70 s refetch/re-encode |
| `fullData/staticData.json` | the site data AND the incremental-fetch cache | ~50 s full refetch |
| `.astro-incremental/` | manifest for `build:incremental` (`ASTRO_INCREMENTAL=1` runs only) | one full render |
| `node_modules/.astro/`, `.astro/` | Astro/Vite caches | a few seconds |

## Env knobs

| Var | Effect |
| --- | --- |
| `SLICE_LIMIT=N` | build only N projects — fast smoke builds / PR CI |
| `BAD_IMAGE_TEST=1` | inject a broken cover URL (tests the error-image path) |
| `MAPSWIPE_DATA_FILE=/path` | point the build at an alternate data file (perturbation tests) |
| `PREFETCH_CONCURRENCY=N` | image prefetch pool size (default 24) |
| `FORCE_FULL_FETCH=1` | fetch-data: ignore the incremental cache |
| `ASTRO_INCREMENTAL=1` | internal — set by the incremental runner; never set manually |

## Structure

- `src/pages/[locale]/…` — routes (exact URL parity with the old Next site)
- `src/components/` — `.astro` (static) + `.tsx` (React islands: data explorer,
  project map, history chart)
- `src/lib/` — app/domain logic (data slimming, chart math) + thin package config
- `src/i18n/` — i18next over the repo-root `locales/*.json` (verbatim; kept out
  of `public/` so translations never ship in `dist/`)
- `packages/` — reusable build infrastructure ([index](packages/README.md)):
  hydration-script dedup, fail-soft remote images (error-image policy),
  incremental static builds
- Blogs: markdown in repo-root `blogs/` (Content Collections; images co-located
  in `blogs/images/`, optimized natively by `astro:assets`)

## Gotchas

- One malformed remote cover **cannot** break the build: it renders
  `/_img/image-error.svg` and warns (`[remote-images] …`). Policy per failure
  class is configured in `src/lib/remoteImages.ts`.
- Translations are build-time only — nothing under `/locales/` ships in `dist/`.
- The sitemap is authoritative from `@astrojs/sitemap` on full builds; the
  incremental runner regenerates it over the merged tree.
