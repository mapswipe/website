// Post-build verification: every invariant we shipped a bug against, as one
// script. Run after a FULL build (CI fails the deploy on any regression).
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const DIST = 'build/out';
const failures = [];
const check = (name, ok, detail = '') => {
    console.log(`${ok ? '  ok ' : 'FAIL '} ${name}${detail ? ` — ${detail}` : ''}`);
    if (!ok) failures.push(name);
};

const data = JSON.parse(readFileSync('full-data/staticData.json', 'utf8'));
const projects = data.publicProjects.results.length;
const locales = ['en', 'ne', 'hu', 'de', 'cs', 'pt'];

const htmlCount = Number(execSync(`find ${DIST} -name index.html -o -name '*.html' | wc -l`).toString());
// per locale: projects + home + data + get-involved + privacy + blogs list
// + blog posts; plus 404 + redirect stubs. Lower bound guards mass page loss
// without needing to model every stub exactly.
const expectedMin = locales.length * (projects + 5);
check('page count', htmlCount >= expectedMin, `${htmlCount} html (≥ ${expectedMin} expected for ${projects} projects)`);

const sitemap = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
const locs = (sitemap.match(/<loc>/g) ?? []).length;
check('sitemap present + full', locs >= expectedMin, `${locs} <loc> entries`);
check('sitemap not partial', locs > 1000, `${locs} (a partial-merge sitemap would be tiny)`);

const dataJson = JSON.parse(readFileSync(join(DIST, 'data-explorer.json'), 'utf8'));
check('data-explorer.json matches data', dataJson.miniProjects.length === projects,
    `${dataJson.miniProjects.length} vs ${projects}`);

const sampleProject = execSync(
    `find ${DIST}/en/projects -mindepth 2 -name index.html | head -1`).toString().trim();
const page = readFileSync(sampleProject, 'utf8');
const hydrationSrc = page.match(/src="(\/_astro\/dedup-[^"]+\.js)"/);
check('hydration script referenced', !!hydrationSrc);
check('hydration script exists', !!hydrationSrc && existsSync(join(DIST, hydrationSrc[1])));

check('no unoptimized blog-image refs',
    execSync(`grep -rl "/img/blogImages" ${DIST} --include='*.html' | wc -l`).toString().trim() === '0');
check('error-image asset shipped', existsSync(join(DIST, '_img/image-error.svg')));

const animated = execSync(
    `for f in ${DIST}/_astro/*.webp; do grep -lq ANMF "$f" 2>/dev/null && echo "$f"; done | wc -l`,
    { shell: '/bin/bash' }).toString().trim();
check('animated webp survives (GIF regression guard)', Number(animated) >= 1, `${animated} animated`);

check('German content renders', readFileSync(join(DIST, 'de/index.html'), 'utf8').includes('Projekt'));
check('Nepali content renders', /[ऀ-ॿ]/.test(readFileSync(join(DIST, 'ne/index.html'), 'utf8')));
check('dist/locales not shipped', !existsSync(join(DIST, 'locales')));

const distMB = Number(execSync(`du -sm ${DIST}`).toString().split('\t')[0]);
check('dist under 900 MB (1 GB Pages limit early warning)', distMB < 900, `${distMB} MB`);

if (failures.length) {
    console.error(`\n${failures.length} check(s) failed: ${failures.join(', ')}`);
    process.exit(1);
}
console.log(`\nall checks passed (dist ${distMB} MB, ${htmlCount} pages)`);
