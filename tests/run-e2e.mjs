#!/usr/bin/env node
/**
 * Cosmic Forge E2E runner.
 *
 * Runs each functional area as its own Playwright invocation so every area gets a
 * self-contained HTML report, then writes an index page linking them all together
 * with pass/fail totals.
 *
 *   node tests/run-e2e.mjs                          run every area that has specs
 *   node tests/run-e2e.mjs audio app-boot           run only the named areas
 *   node tests/run-e2e.mjs --headed                 run headed (visible browser)
 *   node tests/run-e2e.mjs audio -- -g "some title"  extra args after -- go straight to
 *                                                     `playwright test` for each area run
 *   node tests/run-e2e.mjs --list                   show which areas have specs
 *
 * Full usage guide: tests/docs/running-tests.md
 *
 * Reports:
 *   test-reports/e2e/<area>/index.html   per-area Playwright HTML report
 *   test-reports/e2e/index.html          summary index across all areas
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const E2E_DIR = path.join(ROOT, 'tests', 'e2e');
const REPORT_ROOT = path.join(ROOT, 'test-reports', 'e2e');

/** Areas that actually contain at least one .spec.js file. */
function discoverAreas() {
  return fs
    .readdirSync(E2E_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
    .map((d) => d.name)
    .filter((name) =>
      fs.readdirSync(path.join(E2E_DIR, name)).some((f) => f.endsWith('.spec.js'))
    )
    .sort();
}

function runArea(area, { headed = false, slow = false, extraArgs = [] } = {}) {
  const started = Date.now();
  process.stdout.write(`\n=== ${area}${headed ? ' (headed)' : ''} ===\n`);

  // Reporters are configured in playwright.config.js and keyed off E2E_AREA, so
  // they write into this area's own folder. Passing --reporter here would
  // override that and send JSON to stdout instead of results.json.
  const cliArgs = [
    path.join(ROOT, 'node_modules', '@playwright', 'test', 'cli.js'),
    'test', `tests/e2e/${area}`,
    // Headed runs open a real browser window per worker, so force a single
    // worker to keep windows from stacking on top of each other.
    ...(headed ? ['--headed', '--workers=1'] : []),
    ...extraArgs
  ];

  const result = spawnSync(process.execPath, cliArgs, {
    cwd: ROOT,
    stdio: 'inherit',
    env: {
      ...process.env,
      E2E_AREA: area,
      PLAYWRIGHT_HTML_OPEN: 'never',
      // Read by playwright.config.js to set launchOptions.slowMo.
      ...(slow ? { E2E_SLOWMO: '500' } : {})
    }
  });

  const durationMs = Date.now() - started;
  const jsonPath = path.join(REPORT_ROOT, area, 'results.json');

  let stats = { passed: 0, failed: 0, skipped: 0, flaky: 0, total: 0, titles: [] };
  if (fs.existsSync(jsonPath)) {
    try {
      const payload = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const walk = (suites = []) => {
        for (const suite of suites) {
          for (const spec of suite.specs ?? []) {
            const test = spec.tests?.[0];
            const status = test?.status ?? (spec.ok ? 'expected' : 'unexpected');
            stats.total++;
            if (status === 'skipped') stats.skipped++;
            else if (status === 'flaky') stats.flaky++;
            else if (spec.ok) stats.passed++;
            else stats.failed++;
            stats.titles.push({ title: spec.title, ok: Boolean(spec.ok), status });
          }
          walk(suite.suites);
        }
      };
      walk(payload.suites);
    } catch (err) {
      console.warn(`  [warn] could not parse results.json for ${area}: ${err.message}`);
    }
  }

  return { area, exitCode: result.status ?? 1, durationMs, ...stats };
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function writeIndex(results) {
  const totals = results.reduce(
    (acc, r) => ({
      passed: acc.passed + r.passed,
      failed: acc.failed + r.failed,
      skipped: acc.skipped + r.skipped,
      total: acc.total + r.total
    }),
    { passed: 0, failed: 0, skipped: 0, total: 0 }
  );

  const generated = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const pct = totals.total ? Math.round((totals.passed / totals.total) * 100) : 0;

  const rows = results
    .map((r) => {
      const status = r.failed > 0 ? 'fail' : r.total === 0 ? 'none' : 'pass';
      const label = status === 'fail' ? 'FAILED' : status === 'none' ? 'NO TESTS' : 'PASSED';
      const cases = r.titles
        .map((t) => `<li class="${t.ok ? 'ok' : 'bad'}">${t.ok ? '✓' : '✕'} ${esc(t.title)}</li>`)
        .join('');
      return `
      <tr class="area ${status}">
        <td><button class="toggle" aria-expanded="false">▸</button> <a href="${esc(r.area)}/index.html">${esc(r.area)}</a></td>
        <td><span class="badge ${status}">${label}</span></td>
        <td class="num">${r.passed}</td>
        <td class="num">${r.failed}</td>
        <td class="num">${r.total}</td>
        <td class="num">${(r.durationMs / 1000).toFixed(1)}s</td>
      </tr>
      <tr class="detail"><td colspan="6"><ul>${cases}</ul></td></tr>`;
    })
    .join('');

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cosmic Forge — E2E Report</title>
<style>
  :root { --bg:#0f1218; --card:#171b23; --line:#272d38; --ink:#e6e9ef; --mut:#98a2b3;
          --ok:#4ade80; --bad:#f87171; --warn:#fbbf24; --accent:#e5a44a; }
  * { box-sizing:border-box }
  body { margin:0; padding:32px; background:var(--bg); color:var(--ink);
         font:15px/1.55 ui-sans-serif,system-ui,"Segoe UI",Roboto,sans-serif }
  .wrap { max-width:1000px; margin:0 auto }
  h1 { font:700 26px/1.1 ui-monospace,Consolas,monospace; letter-spacing:-.02em; margin:0 0 6px }
  .meta { color:var(--mut); font:12px ui-monospace,Consolas,monospace; margin-bottom:28px }
  .cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; margin-bottom:28px }
  .card { background:var(--card); border:1px solid var(--line); border-radius:8px; padding:16px }
  .card b { display:block; font:700 28px/1 ui-monospace,Consolas,monospace; margin-bottom:4px }
  .card span { color:var(--mut); font-size:11px; letter-spacing:.12em; text-transform:uppercase }
  .card.ok b { color:var(--ok) } .card.bad b { color:var(--bad) }
  table { width:100%; border-collapse:collapse; background:var(--card);
          border:1px solid var(--line); border-radius:8px; overflow:hidden }
  th { text-align:left; font:500 11px ui-monospace,Consolas,monospace; letter-spacing:.12em;
       text-transform:uppercase; color:var(--mut); padding:12px 16px; border-bottom:1px solid var(--line) }
  td { padding:12px 16px; border-bottom:1px solid var(--line) }
  td.num { font-family:ui-monospace,Consolas,monospace; text-align:right }
  a { color:var(--accent) }
  .badge { font:700 10px ui-monospace,Consolas,monospace; letter-spacing:.1em;
           padding:3px 8px; border-radius:3px }
  .badge.pass { background:rgba(74,222,128,.15); color:var(--ok) }
  .badge.fail { background:rgba(248,113,113,.15); color:var(--bad) }
  .badge.none { background:rgba(152,162,179,.15); color:var(--mut) }
  .toggle { background:none; border:none; color:var(--mut); cursor:pointer; font-size:13px; padding:0 4px }
  tr.detail { display:none }
  tr.detail.open { display:table-row }
  tr.detail ul { margin:0; padding-left:20px; columns:1 }
  tr.detail li { list-style:none; font:13px ui-monospace,Consolas,monospace; padding:2px 0 }
  tr.detail li.ok { color:var(--ok) } tr.detail li.bad { color:var(--bad) }
  footer { margin-top:24px; color:var(--mut); font:12px ui-monospace,Consolas,monospace }
</style></head><body><div class="wrap">
  <h1>Cosmic Forge — E2E Report</h1>
  <div class="meta">Generated ${generated} · ${results.length} areas</div>
  <div class="cards">
    <div class="card ok"><b>${totals.passed}</b><span>Passed</span></div>
    <div class="card ${totals.failed ? 'bad' : ''}"><b>${totals.failed}</b><span>Failed</span></div>
    <div class="card"><b>${totals.total}</b><span>Total cases</span></div>
    <div class="card"><b>${pct}%</b><span>Pass rate</span></div>
  </div>
  <table>
    <thead><tr><th>Area</th><th>Status</th><th>Pass</th><th>Fail</th><th>Total</th><th>Time</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <footer>Each area links to its own full Playwright report with traces, screenshots and video on failure.</footer>
</div>
<script>
  document.querySelectorAll('.toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const row = btn.closest('tr');
      const detail = row.nextElementSibling;
      const open = detail.classList.toggle('open');
      btn.textContent = open ? '▾' : '▸';
      btn.setAttribute('aria-expanded', String(open));
    });
  });
</script>
</body></html>`;

  fs.mkdirSync(REPORT_ROOT, { recursive: true });
  fs.writeFileSync(path.join(REPORT_ROOT, 'index.html'), html, 'utf8');
}

// ------------------------------------------------------------------------ main

const args = process.argv.slice(2);
const available = discoverAreas();

if (args.includes('--list')) {
  console.log('Areas with specs:\n' + available.map((a) => '  ' + a).join('\n'));
  process.exit(0);
}

// Everything after a literal `--` is forwarded verbatim to `playwright test`
// for each area run (e.g. `-g "some title"`, `--debug`) — the standard
// separator convention, needed because flags like -g take a value that does
// not itself start with '-' and so cannot be told apart from an area name.
const sepIndex = args.indexOf('--');
const ownArgs = sepIndex === -1 ? args : args.slice(0, sepIndex);
const extraArgs = sepIndex === -1 ? [] : args.slice(sepIndex + 1);

const headed = ownArgs.includes('--headed');
const slow = ownArgs.includes('--slow');
const requested = ownArgs.filter((a) => a !== '--headed' && a !== '--slow' && a !== '--list');
const areas = requested.length ? requested : available;

const unknown = areas.filter((a) => !available.includes(a));
if (unknown.length) {
  console.error(`No specs found for: ${unknown.join(', ')}`);
  console.error(`Available: ${available.join(', ')}`);
  process.exit(1);
}

const results = areas.map((area) => runArea(area, { headed, slow, extraArgs }));
writeIndex(results);

const totalFailed = results.reduce((n, r) => n + r.failed, 0);
const totalPassed = results.reduce((n, r) => n + r.passed, 0);

console.log('\n' + '='.repeat(60));
for (const r of results) {
  const flag = r.failed > 0 ? 'FAIL' : 'PASS';
  console.log(`  ${flag}  ${r.area.padEnd(18)} ${r.passed} passed, ${r.failed} failed  (${(r.durationMs / 1000).toFixed(1)}s)`);
}
console.log('='.repeat(60));
console.log(`  ${totalPassed} passed, ${totalFailed} failed across ${results.length} areas`);
console.log(`  Report: test-reports/e2e/index.html`);

process.exit(totalFailed > 0 ? 1 : 0);
