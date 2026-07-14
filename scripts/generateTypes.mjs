// graphql-codegen wrapper: the typescript + typescript-operations plugin pair
// emits the operation-referenced enums twice (identical blocks), which is a
// TS "duplicate identifier" error. Run codegen, then drop exact-duplicate
// top-level `export type X = ...` blocks.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

execSync('pnpm exec graphql-codegen --config codegen.yml', { stdio: 'inherit' });

const path = 'generated/types.ts';
const src = readFileSync(path, 'utf8');
const blocks = src.split(/\n\n(?=export |\/\*\*)/);
const seenName = new Set();
const seenBody = new Set();
const out = blocks.filter((block) => {
    const m = block.match(/^export type (\w+)/);
    if (!m) return true;
    const name = m[1];
    const body = block.trim();
    if (seenName.has(name)) {
        if (seenBody.has(body)) return false; // identical duplicate — drop
        throw new Error(`conflicting duplicate type: ${name}`);
    }
    seenName.add(name);
    seenBody.add(body);
    return true;
});
writeFileSync(path, out.join('\n\n'));
console.log(`generated/types.ts: ${blocks.length - out.length} duplicate block(s) removed`);
