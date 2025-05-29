import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

/**
 * Read environment variables from file.
 * Load test environment variables if they exist
 */
dotenv.config({ path: ".env.test" });
dotenv.config({ path: ".env.local" });
dotenv.config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Global setup for shared authentication - temporarily disabled */
  // globalSetup: require.resolve("./tests/global-setup.ts"),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["line"],
    [
      "html",
      {
        outputFolder: "playwright-report",
        open: "never", // Never auto-open HTML reports
      },
    ],
    ["json", { outputFile: "test-results/results.json" }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3000", // Using standard port 3000

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /*
     * UI Testing Strategy: We primarily use ARIA snapshots for semantic UI validation
     * instead of visual regression testing. This provides more reliable and accessible
     * testing that focuses on the semantic structure rather than visual appearance.
     * See tests/utils/aria-snapshots.ts for utilities.
     */

    /* Screenshot on failure for debugging (minimal usage - we prefer ARIA snapshots) */
    screenshot: process.env.DEBUG ? "on" : "only-on-failure",

    /* Video recording for failed tests (minimal usage for debugging only) */
    video: process.env.DEBUG ? "on" : "retain-on-failure",

    /* Enable headed mode for debugging when DEBUG env var is set */
    headless: process.env.DEBUG ? false : true,

    /* Slow down operations for debugging when DEBUG env var is set */
    launchOptions: {
      slowMo: process.env.DEBUG ? 500 : 0,
    },

    /* Use shared authentication state by default - temporarily disabled */
    // storageState: "./playwright/.auth/user.json",
  },

  /* Global test timeout */
  timeout: 30000,

  /* Expect timeout for assertions */
  expect: {
    timeout: 10000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "no-setup",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      // No dependencies - assumes auth is already set up
    },
    {
      name: "auth-tests",
      use: {
        ...devices["Desktop Chrome"],
        // No storageState - starts fresh for auth testing
      },
      testMatch: /.*auth.*\.spec\.ts/,
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

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
  webServer: {
    command: "npm run dev", // Use standard development server
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes timeout for server startup
    stdout: "ignore",
    stderr: "pipe",
    env: {
      // Ensure tests always use local Supabase
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
      SUPABASE_SERVICE_ROLE_KEY:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
    },
  },
});
