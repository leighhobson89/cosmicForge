/**
 * Phase 0 of the large UI refactor — capture a visual backup of the game as it
 * looks TODAY, before any row/layout work starts.
 *
 * See docs/largeUIRefactor.md. This is deliberately a *tool*, not a Playwright
 * spec: it asserts nothing and can never fail a build. Its only job is to write
 * a set of reference images to `backupScreenshots/` so that every later phase
 * has something to be compared against by eye.
 *
 * It is also deliberately standalone. It does not import the e2e harness,
 * because the refactor will eventually retire the old row system and this tool
 * should keep working across that change without being coupled to fixtures that
 * are themselves being migrated.
 *
 * READ-ONLY GUARANTEE
 *   This tool is normally pointed at a REAL cloud save (`--pioneer Leigh1981`), because a
 *   fresh game has almost nothing unlocked and its panes are therefore not worth
 *   photographing. A real save must never be written to, so the guard is enforced at
 *   the network layer rather than by trusting the game's own flags:
 *
 *     · Every request to a *.supabase.co host is intercepted. GET/HEAD/OPTIONS pass
 *       (Supabase maps `.select()` onto GET, which is how the save LOADS); POST, PATCH,
 *       PUT and DELETE are aborted. Those are the verbs behind `.insert()`, `.update()`
 *       and `.delete()` — every cloud write in saveLoadGame.js, including the autosave
 *       at saveLoadGame.js:91 and the `.update({ data: null })` in destroySaveGameOnCloud.
 *     · `stopAutoSave()` is called after boot as a second line of defence.
 *     · The "saving / loading" pane is skipped, because being on it makes the frame loop
 *       call `saveGame(...)` every frame (game.js:2690).
 *
 *   Any blocked write is counted and printed at the end of the run. A non-zero count is
 *   not a failure — it is the guard doing its job — but it is reported so it is never
 *   silent. No game source and no build flag is touched.
 *
 * Usage
 *   node tools/capture-baseline-screenshots.mjs --pioneer Leigh1981
 *   node tools/capture-baseline-screenshots.mjs --pioneer Leigh1981 --themes terminal,light
 *   node tools/capture-baseline-screenshots.mjs --tabs 1,3 --out backupScreenshots/spot-check
 *   node tools/capture-baseline-screenshots.mjs --headed        # watch it work
 *
 * Flags
 *   --pioneer <name>  Pioneer code name to boot as. Defaults to a throwaway Test1981_*
 *                     name (a fresh game). Pass a real name to photograph a real save.
 *   --themes <list>   Comma-separated theme keys, or "all" (default: all nine).
 *   --tabs <list>     Comma-separated tab numbers, or "all" (default: all nine).
 *   --panes <n>       Max panes to capture per tab (default: 6). "all" for no cap.
 *   --out <dir>       Output directory (default: backupScreenshots).
 *   --port <n>        Static server port (default: 4173, same as the e2e config).
 *   --headed          Run with a visible browser.
 *   --keep            Do not wipe the output directory first.
 *
 * Output
 *   backupScreenshots/
 *     manifest.json                       what was captured, and from what commit
 *     <theme>/tab<N>-<pane-slug>.png
 */

import { chromium } from 'playwright';
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

/* The nine themes the game offers. Kept in the same order as `requiredThemes`
 * in ui.js so the output directory listing matches the in-game dropdown.
 * `misty` has no [data-theme="misty"] block in styles.css and therefore renders
 * the :root fallback — that is a real finding (see largeUIRefactor.md F8) and is
 * captured here rather than skipped, so the eventual fix has a "before". */
const ALL_THEMES = ['terminal', 'dark', 'misty', 'light', 'frosty', 'summer', 'supernova', 'galaxy', 'space'];
const ALL_TABS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const VIEWPORT = { width: 1680, height: 1050 };

/* ------------------------------------------------------------------ args -- */

/** Panes that write when merely opened, and are therefore never navigated to. */
const FORBIDDEN_PANE_LABELS = ['saving / loading', 'saving/loading', 'save', 'saving'];

function parseArgs(argv) {
  const args = { themes: ALL_THEMES, tabs: ALL_TABS, panesPerTab: 6, out: 'backupScreenshots', port: 4173, headed: false, keep: false, pioneer: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--pioneer') args.pioneer = next();
    else if (a === '--themes') {
      const v = next();
      args.themes = v === 'all' ? ALL_THEMES : v.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (a === '--tabs') {
      const v = next();
      args.tabs = v === 'all' ? ALL_TABS : v.split(',').map((s) => Number(s.trim())).filter(Boolean);
    } else if (a === '--panes') {
      const v = next();
      args.panesPerTab = v === 'all' ? Infinity : Number(v);
    } else if (a === '--out') args.out = next();
    else if (a === '--port') args.port = Number(next());
    else if (a === '--headed') args.headed = true;
    else if (a === '--keep') args.keep = true;
    else if (a === '--help' || a === '-h') { printHelp(); process.exit(0); }
    else { console.error(`Unknown flag: ${a}`); printHelp(); process.exit(1); }
  }
  const unknownThemes = args.themes.filter((t) => !ALL_THEMES.includes(t));
  if (unknownThemes.length) {
    console.error(`Unknown theme(s): ${unknownThemes.join(', ')}\nKnown: ${ALL_THEMES.join(', ')}`);
    process.exit(1);
  }
  return args;
}

function printHelp() {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8')
    .split('\n').filter((l) => l.startsWith(' *')).map((l) => l.replace(/^ \* ?/, '')).join('\n'));
}

/* ---------------------------------------------------------------- server -- */

async function waitForHealth(port, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/__e2e_health`);
      if (res.ok) return true;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

/** Reuse a static server if one is already listening; otherwise start one. */
async function ensureServer(port) {
  if (await waitForHealth(port, 1200)) {
    console.log(`  · reusing static server already on :${port}`);
    return null;
  }
  const child = spawn(process.execPath, [path.join(ROOT, 'tests/e2e/_harness/static-server.mjs')], {
    env: { ...process.env, E2E_PORT: String(port) },
    stdio: 'ignore',
    detached: false
  });
  if (!(await waitForHealth(port))) {
    child.kill();
    throw new Error(`Static server did not come up on :${port}`);
  }
  console.log(`  · started static server on :${port}`);
  return child;
}

/* ------------------------------------------------------ read-only guard -- */

/**
 * Make it physically impossible for this run to modify a cloud save.
 *
 * Installed on the context before the first navigation, so it covers every
 * request the page makes for its whole life. Supabase's REST mapping is what
 * makes this a clean cut: `.select()` is a GET, while `.insert()`, `.update()`
 * and `.delete()` are POST, PATCH and DELETE. Letting reads through therefore
 * still allows the save to LOAD, while every write path in saveLoadGame.js —
 * the autosave, the manual save, and destroySaveGameOnCloud — is aborted before
 * it leaves the browser.
 *
 * Returns a live tally so the run can report what it stopped.
 */
async function installReadOnlyGuard(context) {
  const blocked = { total: 0, byVerb: {}, byHost: {} };
  const READ_VERBS = new Set(['GET', 'HEAD', 'OPTIONS']);

  await context.route('**://*.supabase.co/**', async (route) => {
    const req = route.request();
    const method = req.method().toUpperCase();
    if (READ_VERBS.has(method)) return route.continue();

    blocked.total++;
    blocked.byVerb[method] = (blocked.byVerb[method] || 0) + 1;
    const host = new URL(req.url()).host;
    blocked.byHost[host] = (blocked.byHost[host] || 0) + 1;
    return route.abort();
  });

  return blocked;
}

/* ------------------------------------------------------------------ boot -- */

/**
 * Boot the game as `pioneer` and dismiss the opening modals.
 *
 * With a throwaway `Test1981_*` name this is a fresh game. With a real name the
 * game loads that save from the cloud (a GET, which the guard permits) and the
 * onboarding prompt does not appear, because onboarding is only offered when the
 * load fails — so the prompt handling below is written to tolerate its absence.
 */
async function boot(page, port, pioneerName) {
  const pioneer = pioneerName || `Test1981_shot_${Date.now()}`;
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('#pioneerCodeName', { timeout: 60000 });
  await page.fill('#pioneerCodeName', pioneer);
  await page.click('#modalConfirm');

  await page.waitForSelector('#fullScreenCheckBox', { timeout: 60000 });
  await page.click('#fullScreenCheckBox');
  await page.click('#modalConfirm');

  await page.waitForSelector('#tab1', { timeout: 60000 });

  // Decline onboarding so the tutorial overlay does not sit over every pane.
  // The button label is localized, so match every shipped form of "no".
  const cancel = page.locator('#modalCancel');
  const shown = await cancel.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
  if (shown) {
    const text = (await cancel.textContent())?.trim().toUpperCase();
    if (['NO', 'NEIN', 'NON', 'NÃO'].includes(text)) await page.click('#modalCancel');
  }

  await page.waitForFunction(() => {
    const overlay = document.getElementById('overlay');
    if (!overlay) return true;
    const s = getComputedStyle(overlay);
    return s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0;
  }, null, { timeout: 15000 }).catch(() => { /* some panes keep an overlay legitimately */ });

  // Second line of defence behind the network guard: stop the autosave timer
  // outright, so the game never even attempts the write that would be aborted.
  // Also expose the modules once, so setTheme() does not re-import per switch.
  const autoSaveStopped = await page.evaluate(async () => {
    globalThis.__mods = globalThis.__mods || {
      cg: await import('/constantsAndGlobalVars.js'),
      save: await import('/saveLoadGame.js')
    };
    if (!globalThis.__mods.save) globalThis.__mods.save = await import('/saveLoadGame.js');
    try { globalThis.__mods.save.stopAutoSave(); return true; } catch { return false; }
  }).catch(() => false);

  // Boot raises a transient toast ("No saved game data found" on a fresh game,
  // a load confirmation on a real save). Let it expire before any shot is taken,
  // so it does not sit in the corner of the first pane's nine images.
  await page.waitForFunction(
    () => !document.querySelector('#notificationContainer')?.children.length,
    null,
    { timeout: 20000 }
  ).catch(() => { /* a toast that outlives this is captured as-is */ });

  return { pioneer, autoSaveStopped };
}

/* ------------------------------------------------------------ navigation -- */

/** List the side-menu option rows on a tab, by the `tabN.optionM` class token. */
async function listRows(page, tab) {
  return page.evaluate((t) => {
    const group = document.getElementById(`tab${t}ContainerGroup`);
    if (!group) return [];
    const rows = [];
    group.querySelectorAll('.row-side-menu').forEach((row) => {
      const label = Array.from(row.querySelectorAll('p'))
        .find((p) => Array.from(p.classList).some((c) => c.startsWith(`tab${t}.`)));
      if (!label) return;
      rows.push({
        token: Array.from(label.classList).find((c) => c.startsWith(`tab${t}.`)),
        label: (label.textContent || '').replace(/[⚠️🌀ℹ️]/gu, '').trim(),
        hidden: row.classList.contains('invisible')
      });
    });
    return rows;
  }, tab);
}

async function openTab(page, tab) {
  await page.evaluate((i) => {
    document.getElementById(`tab${i}`)?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, tab);
  await page.waitForTimeout(280);
}

/**
 * Open one option row, revealing it first.
 *
 * Rows are hidden behind unlock state. Revealing is a capture affordance, not a
 * claim about unlock order — the point is to photograph the layout of every pane
 * the row system can draw, including ones a fresh save has not reached yet.
 * Clicks are dispatched because several rows sit under overlays.
 */
async function openRow(page, tab, token) {
  const ok = await page.evaluate(({ t, tk }) => {
    const el = document.querySelector(`#tab${t}ContainerGroup p[class~="${tk}"]`);
    if (!el) return false;
    el.classList.remove('invisible');
    el.closest('.row-side-menu')?.classList.remove('invisible');
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, { t: tab, tk: token });
  if (ok) await page.waitForTimeout(520);
  return ok;
}

/** How much the pane actually drew — used to skip panes that render nothing. */
async function paneWeight(page, tab) {
  return page.evaluate((t) => {
    const content = document.getElementById(`optionContentTab${t}`);
    return {
      children: content ? content.children.length : 0,
      rows: content ? content.querySelectorAll('.option-row').length : 0
    };
  }, tab);
}

/* ---------------------------------------------------------------- themes -- */

/**
 * Switch theme without going through `selectTheme`.
 *
 * `selectTheme` also fires an analytics event and mutates the themes-tried
 * achievement array; neither belongs in a screenshot run. Rendering keys off the
 * body attribute, so the attribute plus the module's own setter is both
 * sufficient and side-effect free.
 */
async function setTheme(page, theme) {
  await page.evaluate(async (t) => {
    document.body.setAttribute('data-theme', t);
    try {
      const cg = globalThis.__mods?.cg ?? await import('/constantsAndGlobalVars.js');
      cg.setCurrentTheme?.(t);
    } catch { /* attribute alone is enough for rendering */ }
  }, theme);
  await page.waitForTimeout(160);
}

/* ------------------------------------------------------------------ main -- */

const slug = (s) => (s || 'pane').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 42) || 'pane';

function gitCommit() {
  try { return execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim(); }
  catch { return 'unknown'; }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = path.resolve(ROOT, args.out);

  const isRealSave = !!args.pioneer && !args.pioneer.includes('Test1981');

  console.log('\ncosmicForge — Phase 0 baseline capture');
  console.log(`  pioneer: ${args.pioneer || '(fresh throwaway game)'}`);
  console.log(`  themes : ${args.themes.join(', ')}`);
  console.log(`  tabs   : ${args.tabs.join(', ')}`);
  console.log(`  out    : ${path.relative(ROOT, outDir)}`);
  if (isRealSave) {
    console.log('\n  ** REAL SAVE — READ-ONLY MODE **');
    console.log('     Supabase writes (POST/PATCH/PUT/DELETE) are aborted at the network layer.');
    console.log('     Reads (GET) pass so the save can load. Autosave is stopped after boot.');
    console.log('     The saving / loading pane is skipped.');
  }
  console.log('');

  if (!args.keep && fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  for (const t of args.themes) fs.mkdirSync(path.join(outDir, t), { recursive: true });

  const server = await ensureServer(args.port);
  const browser = await chromium.launch({ headless: !args.headed });
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  const blockedWrites = await installReadOnlyGuard(context);
  const page = await context.newPage();
  page.on('pageerror', (e) => console.warn(`  ! page error: ${String(e).slice(0, 120)}`));

  const manifest = { capturedAt: new Date().toISOString(), commit: gitCommit(), viewport: VIEWPORT, themes: args.themes, readOnly: true, panes: [] };
  let shots = 0;

  try {
    console.log(`  · booting${isRealSave ? ` as ${args.pioneer}` : ' a fresh game'}…`);
    const booted = await boot(page, args.port, args.pioneer);
    manifest.pioneer = booted.pioneer;
    manifest.autoSaveStopped = booted.autoSaveStopped;
    console.log(`  · booted${booted.autoSaveStopped ? ' · autosave stopped' : ' · autosave stop UNCONFIRMED (network guard still active)'}\n`);

    for (const tab of args.tabs) {
      await openTab(page, tab);
      const rows = await listRows(page, tab);
      if (!rows.length) { console.log(`  tab${tab}: no option rows`); continue; }

      let captured = 0;
      for (const row of rows) {
        if (captured >= args.panesPerTab) break;

        // Never open a pane that writes on sight. Being on saving / loading makes
        // the frame loop call saveGame(...) every frame (game.js:2690).
        if (FORBIDDEN_PANE_LABELS.includes(row.label.trim().toLowerCase())) {
          console.log(`  tab${tab}: ${row.label.padEnd(26)} skipped (writes on open)`);
          continue;
        }

        if (!(await openRow(page, tab, row.token))) continue;

        const weight = await paneWeight(page, tab);
        if (weight.children === 0) continue;           // pane drew nothing — nothing to back up

        const name = `tab${tab}-${slug(row.label)}`;
        for (const theme of args.themes) {
          await setTheme(page, theme);
          await page.screenshot({ path: path.join(outDir, theme, `${name}.png`) });
          shots++;
        }
        manifest.panes.push({ tab, token: row.token, label: row.label, file: `${name}.png`, optionRows: weight.rows });
        captured++;
        console.log(`  tab${tab}: ${row.label.padEnd(26)} ${String(weight.rows).padStart(3)} option-rows  ×${args.themes.length} themes`);
      }
    }
  } finally {
    await context.close();
    await browser.close();
    if (server) server.kill();
  }

  const totalRows = manifest.panes.reduce((n, p) => n + p.optionRows, 0);
  manifest.totals = { panes: manifest.panes.length, screenshots: shots, optionRowsSeen: totalRows };
  manifest.blockedCloudWrites = blockedWrites;
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  fs.writeFileSync(path.join(outDir, 'README.md'),
`# Baseline screenshots — before the large UI refactor

Captured ${manifest.capturedAt} from commit \`${manifest.commit}\` at ${VIEWPORT.width}×${VIEWPORT.height},
booted as pioneer \`${manifest.pioneer}\`.

> **Captured read-only.** ${manifest.blockedCloudWrites.total} cloud write${manifest.blockedCloudWrites.total === 1 ? ' was' : 's were'} intercepted and
> aborted at the network layer (${Object.entries(manifest.blockedCloudWrites.byVerb).map(([v, n]) => `${n}×${v}`).join(', ') || 'none attempted'}), and the autosave timer was
> ${manifest.autoSaveStopped ? 'stopped after boot' : 'NOT confirmed stopped — the network guard was the only barrier'}. The save was read, never modified.

These are the reference images for **Phase 0** of [docs/largeUIRefactor.md](../docs/largeUIRefactor.md):
the game as it looked *before* any row or layout work began. One folder per theme,
one PNG per pane.

- **Panes captured:** ${manifest.panes.length}
- **Screenshots:** ${shots} (${manifest.panes.length} panes × ${args.themes.length} themes)
- **\`.option-row\` elements photographed:** ${totalRows}

Phases 1–5 must not change any of these. Phase 6 changes them deliberately, and that
is the point at which they are re-captured and re-approved rather than silently replaced.

\`misty\` renders the \`:root\` fallback because \`styles.css\` has no
\`[data-theme="misty"]\` block — that is a real defect recorded as finding F8, not a
capture artefact.

Regenerate with:

\`\`\`
node tools/capture-baseline-screenshots.mjs
\`\`\`
`);

  console.log(`\n  ${shots} screenshots · ${manifest.panes.length} panes · ${totalRows} option-rows photographed`);
  if (blockedWrites.total) {
    const verbs = Object.entries(blockedWrites.byVerb).map(([v, n]) => `${n}×${v}`).join(', ');
    console.log(`  read-only guard: ${blockedWrites.total} cloud write(s) blocked (${verbs}) — the save was not modified`);
  } else {
    console.log('  read-only guard: no cloud write was attempted');
  }
  console.log(`  → ${path.relative(ROOT, outDir)}\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
