import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT || 4173);
const AREA = process.env.E2E_AREA;
const SLOW_MS = Number(process.env.E2E_SLOWMO) || 0;

const htmlOutputFolder = AREA
  ? `test-reports/e2e/${AREA}`
  : 'test-reports/e2e/_all';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.js',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: SLOW_MS ? 0 : 90_000,
  expect: { timeout: SLOW_MS ? 120_000 : 10_000 },

  reporter: [
    ['./tests/e2e/_harness/progress-reporter.mjs'],
    ['html', { outputFolder: htmlOutputFolder, open: 'never' }],
    ['json', { outputFile: `${htmlOutputFolder}/results.json` }]
  ],

  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: SLOW_MS ? 120_000 : 15_000,
    navigationTimeout: SLOW_MS ? 120_000 : 30_000,
    // `slowMo` pauses before every Playwright operation — click, fill, evaluate,
    // waitForSelector — which is what makes a headed run followable by eye.
    launchOptions: SLOW_MS ? { slowMo: SLOW_MS } : {}
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],

  webServer: {
    command: 'node tests/e2e/_harness/static-server.mjs',
    url: `http://127.0.0.1:${PORT}/__e2e_health`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    stdout: 'ignore',
    stderr: 'pipe'
  }
});
