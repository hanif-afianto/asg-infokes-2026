import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';
import { baseURL } from './config/env';

export default defineConfig({
  timeout: 60000,
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list', { printSteps: true }],
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    trace: 'on-first-retry',
    baseURL: baseURL,
    screenshot: 'only-on-failure',
    headless: true,
    actionTimeout: 30000,
  },

  expect: {
    timeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
