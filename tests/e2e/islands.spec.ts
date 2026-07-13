// Do the React islands actually hydrate in a real browser? The hydration
// runtimes load from the deduped external script (not inline), so these
// tests are the proof that rewrite preserved execution — a static grep can't
// show that. Selectors come from the components, not the DOM by accident.
import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const data = JSON.parse(readFileSync('fullData/staticData.json', 'utf8'));
const project = data.publicProjects.results[0];
const projectPath = `/en/projects/${project.firebaseId}/`;

test('project page: map island mounts, chart island hydrates', async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on('pageerror', (e) => pageErrors.push(e));

  const hydrationScript = page.waitForResponse(
    (r) => r.url().includes('/_astro/dedup-') && r.ok(),
  );
  await page.goto(projectPath);
  await hydrationScript;

  // client:only island — the leaflet container exists ONLY after hydration
  await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15_000 });

  // client:visible island — scroll it in, then it either draws the SVG chart
  // or renders its empty-state text (its CSV fetch hits the live backend, so
  // both outcomes prove React mounted and ran)
  const chart = page.locator('astro-island[component-url*="ProjectHistoryChart"]');
  await chart.scrollIntoViewIfNeeded();
  await expect(
    chart.locator('svg').or(chart.getByText('Not enough data points')),
  ).toBeVisible({ timeout: 15_000 });

  expect(pageErrors, pageErrors.map(String).join('\n')).toHaveLength(0);
});

test('data explorer: SSR cards visible, search filters the list', async ({ page }) => {
  await page.goto('/en/data/');

  // SSR'd initial cards are in the HTML before any JS
  const cards = page.locator('article.de-card');
  await expect(cards.first()).toBeVisible();

  // hydration + dataset fetch: search narrows the list to a known project
  const search = page.getByPlaceholder(/search/i).first();
  await expect(search).toBeEnabled({ timeout: 15_000 });
  await search.fill(project.name.slice(0, 30));
  await expect(page.locator('article.de-card', { hasText: project.name.slice(0, 30) }).first())
    .toBeVisible({ timeout: 10_000 });
});

test('blog post: optimized images load', async ({ page }) => {
  await page.goto('/en/blogs/');
  const firstPost = page.locator('a[href*="/blogs/"][href*="20"]').first();
  await firstPost.click();
  await page.waitForLoadState('load');

  const imgs = page.locator('main img, article img');
  const count = await imgs.count();
  expect(count).toBeGreaterThan(0);
  // every rendered image actually decoded (naturalWidth > 0 = the /_astro
  // asset resolved — guards broken fingerprinted paths)
  for (let i = 0; i < count; i++) {
    // loading=lazy images never decode unless scrolled into view
    await imgs.nth(i).scrollIntoViewIfNeeded();
    await expect
      .poll(async () => imgs.nth(i).evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0);
  }
});
