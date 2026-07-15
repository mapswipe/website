# Mapswipe Website

Astro application for [Mapswipe community website](https://mapswipe.org).

## Development

Get all the submodules

```bash
git submodule update --init --recursive
```

Before you start, create `.env.local` file:

```bash
touch .env.local
```

Set these environment variables:

```env
APP_ENVIRONMENT=PROD  # Use DEV if you are running your own server instance
MAPSWIPE_API_ENDPOINT=https://backend.mapswipe.org/
MAPSWIPE_REFERER_ENDPOINT=https://mapswipe.org/
```

### Running

```bash
# Install dependencies
pnpm install

# Generate typescript types from graphql schema
pnpm generate:type

# Fetch latest data from MapSwipe database for projects
pnpm fetch-data:local

# Run
pnpm dev
```

> [!NOTE]
> Requires node >= 22.18 (TypeScript files run under node's type stripping).

Translation keys live directly in [locales/en](locales/en); add new keys
there (and their uses via `t('key')`) — no generation step.

Before creating a pull request, all lint and type issues must be fixed.
To check for issues:

```bash
pnpm lint
pnpm css-lint
pnpm typecheck
pnpm check-unused
pnpm test:e2e   # needs a built build/out/ (see Building)
```

### Building

```bash
pnpm build         # full static build -> build/out/
pnpm verify-dist   # post-build invariant checks
```

For data-only refreshes there is also `pnpm build:incremental`, which
re-renders just the pages whose data changed and merges the rest from the
previous `build/out/` (see packages/astro-incremental-static).

### Staging Deployment

The **staging environment** is used to test new changes before they are deployed to production.
You can view the live staging site here:
🔗 [https://website-stage.mapswipe.org/](https://website-stage.mapswipe.org/)

### Steps to Deploy to Staging

1. **Rebase your branch onto the staging branch:**

```bash
git checkout deploy-stage
git rebase <branch-you-want-to-deploy>
git push
```

This rebases your feature branch onto the `stage` branch and pushes the updated staging branch.

2. **Trigger the staging deployment:**

The staging deployment is managed through this repository:
🔗 [https://github.com/mapswipe/stage-website/](https://github.com/mapswipe/stage-website/)

You can manually trigger the deployment workflow here:
🔗 [Staging Workflow – stage.yml](https://github.com/mapswipe/stage-website/actions/workflows/stage.yml)

> **Note:** The staging environment also auto-deploys every day at **01:00 UTC**.

### Production Deployment

Deployments will be triggered in 2 ways:

1. Anything pushed to `deploy-prod` branch will trigger immediate deployment
to configured github io page.
2. Every day at UTC 00:01, deployment will be triggered with
latest data from MapSwipe database.

## Edit Website Texts

### Edit Source Strings
- Pull the latest changes from the `main` branch
- Checkout to a new branch
- Navigate to the source string files [here](https://github.com/mapswipe/website/tree/main/locales/en)
- Open appropriate file(s) and edit string(s) as per requirement
- Push the changes to the local branch
- Create a pull request to the main branch

### Translate Strings
#### As Translator
- Go to Transifex project
- Click on the language you are looking to translate the source into
- Open the file to translate the string
- Translate individual string and save changes

#### As Reviewer
- Open individual strings, make sure they are correct, and click the 'Review' button
- Continue translating and reviewing the strings until all the strings are translated and approved
- **_NOTE: Reviewers must have appropriate permission_**

### Update The Website
- After all the strings are 100% translated in Transifex, a pull request will be sent to the main branch
- Each resource (file) will be committed in the same PR (if not merged) as soon as it is 100% translated
- Merging the pull request will trigger a latest build and the same will be deployed in production
- **IF LANGUAGE IS NOT PRESENT IN THE WEBSITE**
- Add the supported language as per the [supported languages](https://github.com/mapswipe/website#supported-languages) guide below

## Supported Languages

Supported languages are defined in two places that must agree:
[astro.config.mjs](astro.config.mjs) (`i18n.locales` — drives routing) and
[src/i18n/index.ts](src/i18n/index.ts) (`LOCALES` — drives translation
loading). To add a language, add its
[ISO_639-1](https://en.wikipedia.org/wiki/ISO_639-1) code to both, add the
language name to the switcher in
[src/components/Navbar.astro](src/components/Navbar.astro), and add its
translation files under `locales/<code>/`.

## Adding 'News & Updates' or Blogs

MapSwipe website supports 'News & Updates' or blogs in the form of markdown.
To add a new post, you can add a markdown file inside
[blogs](https://github.com/mapswipe/community-website/tree/main/blogs) folder.

The name of the file will determine the url for that post.
For example: `this-is-a-blog.md` file will be routed to
`https://mapswipe.org/en/blogs/this-is-a-blog`.

The markdown should follow the following template:

### Post Template

```md
---
title: This is a blog
publishedDate: 2022-08-17
author: John Doe
description: Lorem Ipsum
coverImage: ./images/example-image.png
featured: true
---

# Markdown Content

Lorem Ipsum is simply dummy text of the printing and typesetting industry.
Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
when an unknown printer took a galley of type and scrambled it to make a
type specimen book. It has survived not only five centuries, but also the leap into
electronic typesetting, remaining essentially unchanged.
It was popularised in the 1960s with the release of Letraset sheets containing
Lorem Ipsum passages, and more recently with desktop publishing software like
Aldus PageMaker including versions of Lorem Ipsum.
```

### Metadata

- We are using YAML frontmatter to set markdown metadata in posts
- The metadata inside '---' must be filled and is required
- The metadata renders in the card view of the Home or the posts listing page

#### Rules

- `publishedDate` should be in `YYYY-MM-DD` format. Any other format is not supported.
- Post images (`coverImage` and in-body) should be added to the
[blogs/images](https://github.com/mapswipe/community-website/tree/main/blogs/images)
folder and referenced relatively (`./images/<name>`), so they are optimized
at build time.
- The value for `featured` determines whether to highlight the posts on
News & Updates section of home page

## Build Internals

| Cache / state (gitignored) | What | Cold cost if lost |
| --- | --- | --- |
| `build/image-cache/` | optimized remote project covers + negative cache | ~70 s refetch/re-encode |
| `full-data/staticData.json` | site data AND the incremental-fetch cache | ~50 s full refetch |
| `build/incremental/` | manifest for `pnpm build:incremental` (cache with `build/out/`) | one full render |

| Env knob | Effect |
| --- | --- |
| `SLICE_LIMIT=N` | build only N projects (fast smoke builds) |
| `FORCE_FULL_FETCH=1` | fetch-data: ignore the incremental cache |
| `MAPSWIPE_DATA_FILE=/path` | build against an alternate data file |
| `PREFETCH_CONCURRENCY=N` | image prefetch pool size (default 24) |
| `BAD_IMAGE_TEST=1` | inject a broken cover URL (tests the error-image path) |

A failed remote cover can never break the build: it renders
`/_img/image-error.svg` and warns (`[remote-images] ...`).
