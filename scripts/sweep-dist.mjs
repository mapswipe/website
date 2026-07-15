#!/usr/bin/env node
// Sweep build/out/_astro assets nothing references, after a plain `astro build` —
// astro:assets emits image originals that only exist in optimized variants
// (see packages/astro-dist-sweep/README.md). The incremental runner performs
// the same sweep itself over the merged tree.
import { resolve } from 'node:path';
import { sweepSupersededAssets } from '../packages/astro-dist-sweep/src/index.ts';

const { removed, bytes } = sweepSupersededAssets(resolve('build/out'));
console.log(`[dist-sweep] removed ${removed} unreferenced _astro asset(s) (${(bytes / 1e6).toFixed(1)} MB)`);
