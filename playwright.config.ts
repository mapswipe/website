import { defineConfig } from '@playwright/test';

// Island smoke tests against the built site (`astro preview` over dist/).
// Run a full build first; CI wires this after verify-dist.
export default defineConfig({
    testDir: 'tests/e2e',
    timeout: 30_000,
    use: { baseURL: 'http://localhost:43210' },
    webServer: {
        command: 'pnpm preview --port 43210',
        url: 'http://localhost:43210/en/',
        reuseExistingServer: true,
        timeout: 30_000,
    },
});
