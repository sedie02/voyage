import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration voor Voyage E2E Tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory: search the whole tests folder so nested e2e tests are discovered
  testDir: './tests',
  // Only pick up Playwright-style e2e files
  testMatch: '**/*.e2e.ts',

  // Maximum time one test can run
  timeout: 30 * 1000,

  // Test execution
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuratie
  reporter: [['html'], ['list'], ...(process.env.CI ? [['github'] as const] : [])],

  // Shared settings voor alle tests
  use: {
    // Base URL voor de applicatie
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Screenshot en video opties
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',

    // Browser context opties
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // Locale en timezone
    locale: 'nl-NL',
    timezoneId: 'Europe/Amsterdam',
  },

  // Projects voor verschillende browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Optioneel: andere browsers (uitgecommentarieerd voor snellere test runs)
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // Mobile viewports
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 13'] },
    // },
  ],

  // Web server configuratie voor development tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
