import { defineConfig, devices } from '@playwright/test';

/**
 * Railway sets RAILWAY_ENVIRONMENT; CI is set on most CI hosts.
 * Use PLAYWRIGHT_FULL_MATRIX=1 locally (or on a large runner) to run all browsers.
 */
const useFullBrowserMatrix =
  process.env.PLAYWRIGHT_FULL_MATRIX === '1' ||
  (!process.env.CI &&
    !process.env.RAILWAY_ENVIRONMENT &&
    process.env.PLAYWRIGHT_SLIM_MATRIX !== '1');

const isAutomatedEnv = !!(process.env.CI || process.env.RAILWAY_ENVIRONMENT);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isAutomatedEnv,
  retries: isAutomatedEnv ? 0 : 0,
  workers: isAutomatedEnv ? 1 : undefined,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://railway.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: 45_000,
    actionTimeout: 15_000,
  },

  projects: useFullBrowserMatrix
    ? [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      ]
    : [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
