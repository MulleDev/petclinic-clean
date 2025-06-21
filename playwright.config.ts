import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'playwright/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'https://petclinic-playwright-copilot-213a6b602332.herokuapp.com/',
    testIdAttribute: 'data-pw',
    trace: 'on-first-retry',
    headless: false,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        launchOptions: {
          slowMo: 500,
        },
      },
    },
  ],
});
