import { defineConfig, devices } from "@playwright/test";
import os from "os";

// Check if the current platform is Windows
const isWindows = os.platform() === "win32";

// Global variables
const dimensions = { width: 1366, height: 720 };
const isHeadless =  true;
const baseURL = "https://v2.sell.do";
const screenshot = "only-on-failure";  // >> //on // off // only-on-failure
const trace = "on";     // >> // on // off // retain-on-failure
const video = "retain-on-failure";     // >> // on // off // retain-on-failure // on-first-retry

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* Test directory */
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !isWindows, //!!process.env.CI,
  /* Retry on CI only */
  retries: !isWindows ? 2 : 0,//process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: !isWindows ? 5 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    ['allure-playwright'],
    ['html', { open: 'never' }],
  ],

  // Each test is given 2 minutes. (2 minutes)
  timeout: 2 * 60 * 1000,

  expect: {
    toMatchSnapshot: {
      threshold: 0.2,
      maxDiffPixelRatio: 0.1,
    },
    // Exceptional timeout for long running tests (2 minutes)
    timeout: 2 * 60 * 1000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        baseURL: baseURL,
        browserName: "chromium",// chromium // firefox // webkit
        trace: trace,// on // off // only on-failure
        viewport: dimensions,
        screenshot: screenshot,
        headless: isHeadless,
      },
    },

    {
      name: 'firefox',
      use: {
        baseURL: baseURL,
        browserName: "firefox",// chromium // firefox // webkit
        trace: trace,// on // off // only on-failure
        viewport: dimensions,
        screenshot: screenshot,
        headless: isHeadless,
      },
    },

    {
      name: 'webkit',
      use: {
        baseURL: baseURL,
        browserName: "webkit",// chromium // firefox // webkit
        trace: trace,// on // off // only on-failure
        video: video, 
        viewport: dimensions,
        screenshot: screenshot,
        headless: isHeadless,

        permissions: ['geolocation'],
        geolocation: { latitude: 18.5246, longitude: 73.8786 },

        isMobile: false,
        hasTouch: false,

        acceptDownloads: true,
        javaScriptEnabled: true,

        colorScheme: 'dark',

        ignoreHTTPSErrors: false,
        locale: 'en-IN',
        timezoneId: 'Asia/Kolkata',

        //...devices['iPhone 12']
      },
      //grep: /@web|@mobile/,
      //grepInvert: /@web/,
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // }, 
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
