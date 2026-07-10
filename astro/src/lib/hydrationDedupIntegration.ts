// Astro integration: deduplicate the inline island-hydration runtimes into ONE
// external, cacheable file — a build:done post-process.
//
// UPSTREAM: force-inlining is documented, unconfigurable behavior. References:
//   https://github.com/withastro/docs/issues/2150 (inlined even with assetsInlineLimit: 0 — we verified)
//   https://github.com/withastro/roadmap/discussions/36 (the decision that inlined them)
//   https://github.com/withastro/astro/issues/6247 (related cross-page inlining heuristic)
// Draft feature request ready to file: docs/upstream/astro-hydration-script-dedup.md.
// Delete this file when an external-hydration-scripts option lands.
// build:done post-process pattern.
//
// Why: Astro hard-inlines its directive runtimes (the ~130 B `Astro.only`
// loader, the ~3.5 KB <astro-island> custom-element runtime, the ~370 B
// `client:visible` loader) into EVERY island-bearing page. With ~14.6k island
// pages that is ~55–57 MB of byte-identical duplication (~12% of dist).
// `vite.build.assetsInlineLimit: 0` has no effect on these (verified
// empirically) — hence this post-process.
//
// How:
//   1. DISCOVER (don't hardcode): read one project page from dist, extract its
//      inline attribute-less classic <script> blocks, and confirm each block
//      appears verbatim on several other project pages (guards against ever
//      grabbing a page-specific script if one appears in a future Astro
//      upgrade). Fail-soft: any anomaly logs a warning and leaves dist as-is.
//   2. EMIT dist/_astro/hydration.<contenthash8>.js — the scripts concatenated
//      in their original document order. Content-hashing busts caches across
//      Astro upgrades while keeping the URL stable when the content hasn't
//      changed.
//   3. REWRITE every HTML file: the FIRST matched inline script (in document
//      order) becomes <script src="/_astro/hydration.<hash>.js"></script> (a
//      classic BLOCKING script — synchronous execution at the same position
//      preserves semantics); the other matched inline scripts are removed.
//      This is safe because the runtimes only define globals / register the
//      custom element and dispatch readiness events — they are
//      position-independent among themselves, and running all of them at the
//      first script's position (always before the first <astro-island>)
//      matches Astro's own ordering guarantees. Exact byte-sequence string
//      replacement — the blocks are identical everywhere, no HTML parsing
//      needed. Pages containing none of the blocks (zero-JS pages) are left
//      untouched.
//
// Idempotency: a page already referencing "/_astro/hydration." is skipped.
//
// Ordering: registered LAST in astro.config.mjs so it runs after the other
// build:done hooks (sitemap).
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, sep } from 'node:path';
import type { AstroIntegration } from 'astro';

const DIST = 'dist';
const BUNDLE_URL_PREFIX = '/_astro/hydration.';
// How many sibling project pages each extracted script must appear on
// verbatim before we trust it as a shared hydration runtime.
const SANITY_SAMPLE = 8;
const SANITY_MIN_MATCHES = 5;
// Concurrent file rewrites — 14.6k small files, keep the wall-time low
// without exhausting file descriptors.
const POOL_SIZE = 16;

// Inline classic scripts exactly as Astro emits its directive runtimes: an
// attribute-less <script> tag (no src, no type). Anything with attributes is
// intentionally NOT matched.
const INLINE_SCRIPT_RE = /<script>[\s\S]*?<\/script>/g;

async function listHtmlFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { recursive: true });
  return entries
    .filter((e) => e.endsWith('.html'))
    .map((e) => join(root, e));
}

// Run `fn` over `items` with at most `size` in flight.
async function asyncPool<T, R>(
  size: number,
  items: readonly T[],
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      const i = next;
      next += 1;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

export default function hydrationDedup(): AstroIntegration {
  return {
    name: 'hydration-dedup',
    hooks: {
      'astro:build:done': async ({ logger }) => {
        try {
          const htmlFiles = await listHtmlFiles(DIST);
          if (htmlFiles.length === 0) {
            logger.warn('hydration dedup skipped: no HTML files in dist');
            return;
          }

          // -- 1. Discover the hydration scripts from one project page. -----
          const projectPages = htmlFiles.filter((f) =>
            f.includes(`${sep}projects${sep}`) && f.endsWith(`${sep}index.html`));
          const reference = projectPages[0];
          if (!reference) {
            logger.warn('hydration dedup skipped: no project page found in dist');
            return;
          }
          const refHtml = await readFile(reference, 'utf8');
          const scripts = refHtml.match(INLINE_SCRIPT_RE) ?? [];
          if (scripts.length === 0) {
            logger.warn(
              `hydration dedup skipped: no inline scripts on ${reference}`,
            );
            return;
          }

          // Sanity-guard: every extracted block must recur verbatim on other
          // project pages, otherwise we might have grabbed page-specific JS.
          const sample = projectPages
            .filter((f) => f !== reference)
            .filter((_, i, all) => i % Math.max(1, Math.floor(all.length / SANITY_SAMPLE)) === 0)
            .slice(0, SANITY_SAMPLE);
          const sampleHtml = await Promise.all(sample.map((f) => readFile(f, 'utf8')));
          for (const script of scripts) {
            const matches = sampleHtml.filter((h) => h.includes(script)).length;
            if (matches < Math.min(SANITY_MIN_MATCHES, sampleHtml.length)) {
              logger.warn(
                `hydration dedup skipped: a ${script.length}-byte inline script from `
                + `${reference} only recurs on ${matches}/${sampleHtml.length} sampled `
                + 'project pages — refusing to externalize a possibly page-specific script',
              );
              return;
            }
          }

          // -- 2. Emit the external bundle. ---------------------------------
          const bodies = scripts.map((s) =>
            s.replace(/^<script>/, '').replace(/<\/script>$/, ''));
          const bundle = bodies.join('\n;\n');
          const hash = createHash('sha256').update(bundle).digest('hex').slice(0, 8);
          const bundleName = `hydration.${hash}.js`;
          await writeFile(join(DIST, '_astro', bundleName), bundle);
          const srcTag = `<script src="${BUNDLE_URL_PREFIX}${hash}.js"></script>`;

          // -- 3. Rewrite every HTML file. ----------------------------------
          let rewritten = 0;
          let skipped = 0;
          await asyncPool(POOL_SIZE, htmlFiles, async (file) => {
            const html = await readFile(file, 'utf8');
            // Idempotent: already externalized (e.g. merged from a cached,
            // previously-rewritten dist).
            if (html.includes(BUNDLE_URL_PREFIX)) {
              skipped += 1;
              return;
            }
            // Find which of the discovered blocks this page carries, in
            // document order. (Data pages carry a subset — the shared island
            // runtime but a different directive loader — so match per-block.)
            const present = scripts
              .map((s) => ({ s, at: html.indexOf(s) }))
              .filter((x) => x.at !== -1)
              .sort((a, b) => a.at - b.at);
            if (present.length === 0) {
              skipped += 1; // zero-JS page — leave untouched
              return;
            }
            // Replace the FIRST matched block with the src tag, drop the rest.
            let out = html.replace(present[0].s, srcTag);
            for (const { s } of present.slice(1)) {
              out = out.replace(s, '');
            }
            await writeFile(file, out);
            rewritten += 1;
          });

          logger.info(
            `hydration dedup: ${rewritten} page(s) rewritten, ${skipped} skipped, `
            + `bundle _astro/${bundleName} (${bundle.length} B, ${scripts.length} scripts)`,
          );
        } catch (err) {
          // Fail-soft: never break the build over an optimization.
          const reason = err instanceof Error ? err.message : String(err);
          logger.warn(`hydration dedup skipped: ${reason}`);
        }
      },
    },
  };
}
