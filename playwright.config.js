import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT || 4173);

// When AREA is set, only that area's specs run and its HTML report is written to
// its own folder. tests/run-e2e.mjs uses this to produce one report per area.
const AREA = process.env.E2E_AREA;

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
  timeout: 90_000,
  expect: { timeout: 10_000 },

  reporter: [
    ['list'],
    ['html', { outputFolder: htmlOutputFolder, open: 'never' }],
    ['json', { outputFile: `${htmlOutputFolder}/results.json` }]
  ],

  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    // tests/run-e2e.mjs sets this when --slow is passed, to slow down each
    // Playwright action so a headed run is easier to watch.
    launchOptions: process.env.E2E_SLOWMO
      ? { slowMo: Number(process.env.E2E_SLOWMO) }
      : {}
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
