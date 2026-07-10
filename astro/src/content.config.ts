import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Blog Content Collection.
//
// Replaces the Next app's getBlogs.ts (gray-matter + remark/remark-html). A
// glob() loader points DIRECTLY at the repo-root `blogs/` dir (../blogs from
// astro/) — NO files are moved. Astro renders each entry's markdown body via
// entry.render() using the project's markdown pipeline (remark-gfm is enabled
// in astro.config.mjs, matching Next).
//
// The entry `id` MUST equal Next's slug: path.parse(filename).name (case
// PRESERVED). The glob loader's DEFAULT id lowercases + slugifies the filename,
// which would break parity for e.g. "2022-08-15-Madagascar-change-detection"
// (Next kept the capital M/M). So we override generateId to return the raw
// basename-without-extension, matching Next exactly. URLs `/<locale>/blogs/<id>/`
// then match Next 1:1.
//
// Schema mirrors the frontmatter fields getBlogs.ts read:
//   title, publishedDate, author, description, coverImage, featured
// (name/markdownContent in the Next Blog interface are the loader-derived id +
// body, not frontmatter — Astro provides those separately.)
const blogs = defineCollection({
  loader: glob({
    pattern: '*.md',
    base: '../blogs',
    // Preserve Next's slug exactly: filename without extension, case intact.
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: ({ image }) => z.object({
    title: z.string().optional(),
    // Frontmatter dates are plain YYYY-MM-DD; zod coerces to a Date. Next stored
    // this as a ms timestamp (new Date(...).getTime()); we derive that from the
    // Date at use-site to keep i18next datetime formatting identical.
    publishedDate: z.coerce.date().optional(),
    author: z.string().optional(),
    description: z.string().optional(),
    // Relative path (./images/*) next to the content, resolved + optimized by
    // astro:assets — render with <Image> from the pages.
    coverImage: image().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { blogs };
