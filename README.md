# Mapswipe Website

NextJs application for [Mapswipe community website](https://mapswipe.org).

## Development

Before you start, create `.env.local` file:

```bash
touch .env.local
```

Set these environment variables:

```env
MAPSWIPE_API_ENDPOINT=https://apps.mapswipe.org/api/
MAPSWIPE_COMMUNITY_API_ENDPOINT=https://api.mapswipe.org/graphql/
NEXT_PUBLIC_POSTHOG_KEY=<posthog-key>
NEXT_PUBLIC_POSTHOG_HOST_API=<posthog-host-api>
```

### Running

```bash
yarn install
# This fetches latest data from MapSwipe database for projects
yarn fetch-data
yarn dev
```

Whenever new texts for translation are added, translation files need to be generated.

```bash
yarn generate:i18n
```

Before creating a pull request, all lint and type issues must be fixed.
To check for issues:

```bash
yarn lint
yarn css-lint
yarn typecheck
yarn unimported
```

### Building

```bash
yarn build
```

### Automatic Deployment

Deployments will be triggered in 2 ways:

1. Anything pushed to `main` branch will trigger immediate deployment
to configured github io page.
2. Every day at UTC 00:01, deployment will be triggered with
latest data from MapSwipe database.

## Edit Website Texts

### Edit Source Strings
- Pull the latest changes from the `main` branch
- Checkout to a new branch
- Navigate to the source string files [here](https://github.com/mapswipe/website/tree/main/public/locales/en)
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

Languages listed in [i18next-parser.config.js](https://github.com/mapswipe/community-website/blob/main/i18next-parser.config.js)
are listed as options to view the website in that particular language.

To add a new language option, user should add [ISO_639-1](https://en.wikipedia.org/wiki/ISO_639-1)
code of that language to the list.

```js
module.exports = {
    locales: ['en', 'ne'] // NOTE: add ISO code in this list,
};
```

Language's title and abbreviation in the selected language, needs to be added
in [languages.ts](https://github.com/mapswipe/community-website/blob/main/src/utils/languages.ts).

After the language settings are added, user should generate the language files.

```bash
yarn generate:i18n
```

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
coverImage: /img/blogImages/example-image.png
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
- Project images `coverImage` should be uploaded in the [/img/blogImages](https://github.com/mapswipe/community-website/tree/main/public/img/blogImages)
folder.
- The value for `featured` determines whether to highlight the posts on
News & Updates section of home page
