import { defineConfig, devices } from '@playwright/test';

/**
 * Railway and other CI hosts have no display server — browsers must run headless.
 * @see https://docs.railway.com/develop/variables
 */
const isRailway = !!(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY);
const isCiLike = !!process.env.CI || isRailway;

const desktopChromium = {
  name: 'chromium',
  use: { ...devices['Desktop Chrome'] },
};

const desktopFirefox = {
  name: 'firefox',
  use: { ...devices['Desktop Firefox'] },
};

const desktopWebkit = {
  name: 'webkit',
  use: { ...devices['Desktop Safari'] },
};

/**
 * Local / full matrix: Chromium, Firefox, WebKit.
 * Railway: Chromium only (lower memory and faster cold start on small instances).
 */
const projects = isRailway
  ? [desktopChromium]
  : [desktopChromium, desktopFirefox, desktopWebkit];

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCiLike,
  retries: isCiLike ? 2 : 0,
  workers: isCiLike ? 1 : undefined,
  reporter: isRailway
    ? [
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
      ]
    : 'html',
  use: {
    /* Headless is required on Railway; keep headed available locally via --headed */
    headless: isCiLike ? true : undefined,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    /* Slightly more tolerant on shared cloud CPUs */
    actionTimeout: isRailway ? 20_000 : undefined,
    navigationTimeout: isRailway ? 45_000 : undefined,
  },
  projects,
});
