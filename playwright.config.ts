import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({
    path: `./env/.env.${process.env.ENVIRONMENT ?? 'dev'}`,
    quiet: true,
});

if (!process.env.APP_URL) {
    throw new Error(
        'APP_URL is not set. Copy env/.env.example to env/.env.dev and set it.'
    );
}

// ROW=random (TC-11, TC-12): pick the seed once, so every worker runs the same case.
if (process.env.ROW === 'random') {
    process.env.ROW_SEED ??= String(Math.floor(Math.random() * 1000000));
}

const API_SPECS = '**/api/**/*.spec.ts';
const JSON_REPORT = { outputFile: 'reports/results.json' };

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,

    // One retry because the QA host fails requests on purpose.
    retries: 1,
    // A full run takes about 15 minutes, on CI and locally.
    workers: 3,

    // The JSON file feeds the results summary (scripts/ci-summary.js).
    reporter: process.env.CI
        ? [['list'], ['html', { open: 'never' }], ['json', JSON_REPORT]]
        : [
              ['html', { open: 'on-failure' }],
              ['json', JSON_REPORT],
          ],

    timeout: 60000,
    expect: { timeout: 10000 },

    use: {
        testIdAttribute: 'data-testid',
        actionTimeout: 10000,
        navigationTimeout: 30000,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },

    projects: [
        // Adds fixed items to the main (exploration) account through the API.
        // Safe to repeat. Skip it with SEED_MAIN=0.
        { name: 'seed-main', testMatch: '**/seed-main.setup.ts' },

        // Runs after the tests: deletes the worker accounts and anything a
        // crashed run left behind.
        { name: 'cleanup-accounts', testMatch: '**/cleanup-accounts.setup.ts' },

        // No browser. Each test creates its own users through the API.
        {
            name: 'api',
            testMatch: API_SPECS,
            teardown: 'cleanup-accounts',
        },

        // Tests start signed out and sign in as their own API-created user.
        {
            name: 'chromium',
            testIgnore: API_SPECS,
            dependencies: ['seed-main'],
            teardown: 'cleanup-accounts',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 },
            },
        },
    ],
});
