import { defineConfig, devices } from '@playwright/test';

/**
 * Railway and other CI hosts have no display server — browsers must run headless.
 * @see https://docs.railway.com/develop/variables
 */
const isRailway = !!(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY);
const isCiLike = !!process.env.CI || isRailway;

/** Force full suite (ignores smoke-only mode). */
const runAllTests =
  process.env.PW_ALL_TESTS === '1' || process.env.PW_ALL_TESTS === 'true';

/** Opt-in: only tests whose title matches @smoke. Default is run all tests (needed for Railway when no @smoke titles exist). */
const smokeOnly =
  process.env.PW_SMOKE_ONLY === '1' || process.env.PW_SMOKE_ONLY === 'true';

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
 * Local: Chromium, Firefox, WebKit.
 * Railway (after deploy): WebKit only, headless + serial (see workers / fullyParallel below).
 */
const projects = isRailway
  ? [desktopWebkit]
  : [desktopChromium, desktopFirefox, desktopWebkit];

export default defineConfig({
  testDir: './tests',
  /**
   * @smoke filter only when PW_SMOKE_ONLY=1 (e.g. `npm run test:smoke`).
   * https://playwright.dev/docs/test-cli#grep
   */
  ...(!runAllTests && smokeOnly ? { grep: /@smoke/ } : {}),
  /* Strictly serial: one test at a time (equivalent to --workers=1, no in-file parallelism). */
  fullyParallel: false,
  forbidOnly: isCiLike,
  retries: isCiLike ? 2 : 0,
  workers: 1,
  reporter: isRailway
    ? [
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
      ]
    : 'html',
  use: {
    /* Railway / CI: always headless. Local: default headless; use --headed to override. */
    headless: isCiLike ? true : undefined,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    /* Slightly more tolerant on shared cloud CPUs */
    actionTimeout: isRailway ? 20_000 : undefined,
    navigationTimeout: isRailway ? 45_000 : undefined,
  },
  projects,
});
