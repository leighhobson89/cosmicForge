import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT || 4173);

// When AREA is set, only that area's specs run and its HTML report is written to
// its own folder. tests/run-e2e.mjs uses this to produce one report per area.
const AREA = process.env.E2E_AREA;

// Per-step delay in milliseconds. tests/run-e2e.mjs sets this from `--slow`, and
// only ever alongside `--headed` — a slowed headless run just wastes time, since
// there is nothing to watch.
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
  // Slow mode inserts a real delay before every Playwright step, so a spec that
  // takes 30s normally can take many minutes. Without lifting the budgets the
  // whole run would simply time out, which is what made --slow unusable before.
  timeout: SLOW_MS ? 0 : 90_000,
  expect: { timeout: SLOW_MS ? 120_000 : 10_000 },

  reporter: [
    // Live per-test progress: area, index against the area's total, and the
    // outcome as each test settles. Replaces the built-in `list` reporter, which
    // never says how many tests there are.
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
