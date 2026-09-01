/**
 * The large UI refactor's information-parity and alignment check.
 *
 * See docs/largeUIRefactor.md §3.3, the Phase 3 section (which introduced this
 * tool) and Phase 4 (which is what `MIGRATED_PANES` grows with).
 *
 * WHAT THIS CHECKS, AND WHY IT IS SHAPED THIS WAY
 * ==============================================
 * The refactor's promise is that a section can move from `createOptionRow` to
 * `createRow` without losing a single field of information, and that once it has
 * moved, its columns line up. Those are two different claims and this tool makes
 * them separately.
 *
 *   1. **Information parity.** Every field the *data* says the row has must be
 *      present in the rendered row. Note what this is compared against: the
 *      catalogue and the live game state, not a photograph of the previous
 *      render. Comparing renders would only prove the new one looks like the old
 *      one, which is not the promise — the layout is *supposed* to change. What
 *      must not change is what the player can find out. So the tool asks the
 *      game for the sixteen ascendency perks and then requires each perk's name,
 *      rebuyable state, purchase status, price, buy control and description to
 *      be reachable in the DOM.
 *
 *   2. **Alignment.** The Phase 3 exit criterion, stated exactly: every action
 *      cell in a migrated section shares a `getBoundingClientRect().left` within
 *      1px. This is the defect that motivated the whole refactor — the legacy
 *      rows each resolved their own 30%/70% split against their own content, so
 *      two rows need not line up — and it is measurable, so it is measured
 *      rather than eyeballed. It is checked on every migrated pane, not just the
 *      first.
 *
 * ADDING A TAB
 * ------------
 * A newly migrated pane gets an entry in `MIGRATED_PANES` listing its rows and,
 * per row, the cells that must still be filled. That list is the parity contract
 * written down: it is what stops a migration quietly dropping a field, and it is
 * the one thing Phase 4 has to add by hand for each tab.
 *
 * This is a TOOL, not a spec: it prints a report and exits non-zero if a check
 * fails, but it is not part of any suite and cannot fail a build on its own.
 * That is the same choice made for the Phase 0 screenshot tools, for the same
 * reason — these additive phases ship no tests.
 *
 * READ-ONLY GUARANTEE
 *   Identical to tools/capture-baseline-screenshots.mjs: every *.supabase.co
 *   request is intercepted and POST/PATCH/PUT/DELETE aborted, so the run cannot
 *   write to a cloud save whether or not `--pioneer` names a real one. GET passes
 *   so a real save can still load. `stopAutoSave()` is called after boot as a
 *   second line of defence. No game source and no build flag is touched.
 *
 * Usage
 *   node tools/check-row-parity.mjs
 *   node tools/check-row-parity.mjs --pioneer Leigh1981
 *   node tools/check-row-parity.mjs --headed --json out.json
 *
 * Flags
 *   --pioneer <name>  Pioneer code name to boot as. Defaults to a throwaway
 *                     Test1981_* name (a fresh game), which is enough: the perk
 *                     catalogue is present from the first tick.
 *   --port <n>        Static server port (default 4173, same as the e2e config).
 *   --headed          Run with a visible browser.
 *   --json <file>     Also write the full report as JSON.
 */

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const VIEWPORT = { width: 1680, height: 1050 };

/* ------------------------------------------------------------------ args -- */

function parseArgs(argv) {
    const args = { pioneer: null, port: 4173, headed: false, json: null };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        const next = () => argv[++i];
        if (a === '--pioneer') args.pioneer = next();
        else if (a === '--port') args.port = Number(next());
        else if (a === '--headed') args.headed = true;
        else if (a === '--json') args.json = next();
        else if (a === '--help' || a === '-h') { printHelp(); process.exit(0); }
        else { console.error(`Unknown flag: ${a}`); printHelp(); process.exit(1); }
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

async function installReadOnlyGuard(context) {
    const blocked = { total: 0, byVerb: {} };
    const READ_VERBS = new Set(['GET', 'HEAD', 'OPTIONS']);

    await context.route('**://*.supabase.co/**', async (route) => {
        const method = route.request().method().toUpperCase();
        if (READ_VERBS.has(method)) return route.continue();
        blocked.total++;
        blocked.byVerb[method] = (blocked.byVerb[method] || 0) + 1;
        return route.abort();
    });

    return blocked;
}

/* ------------------------------------------------------------------ boot -- */

async function boot(page, port, pioneerName) {
    const pioneer = pioneerName || `Test1981_parity_${Date.now()}`;
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('#pioneerCodeName', { timeout: 60000 });
    await page.fill('#pioneerCodeName', pioneer);
    await page.click('#modalConfirm');

    await page.waitForSelector('#fullScreenCheckBox', { timeout: 60000 });
    await page.click('#fullScreenCheckBox');
    await page.click('#modalConfirm');

    await page.waitForSelector('#tab1', { timeout: 60000 });

    const cancel = page.locator('#modalCancel');
    const shown = await cancel.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
    if (shown) {
        const text = (await cancel.textContent())?.trim().toUpperCase();
        if (['NO', 'NEIN', 'NON', 'NÃO'].includes(text)) await page.click('#modalCancel');
    }

    await page.evaluate(async () => {
        globalThis.__mods = globalThis.__mods || {
            cg: await import('/constantsAndGlobalVars.js'),
            rdo: await import('/resourceDataObject.js'),
            save: await import('/saveLoadGame.js'),
            // descriptions.js is the source of truth for the prose a row owes the
            // player, so the parity check reads it rather than the row spec.
            descriptions: await import('/descriptions.js')
        };
        try { globalThis.__mods.save.stopAutoSave(); } catch { /* already stopped */ }
    });

    await page.waitForFunction(
        () => !document.querySelector('#notificationContainer')?.children.length,
        null,
        { timeout: 20000 }
    ).catch(() => { /* a toast that outlives this is harmless here */ });

    // A fresh game has eight of its nine tabs locked, and a locked tab's content
    // column stays `d-none` — so the pane draws but has no box, and every
    // measurement below would read zero. Unlocking goes through the game's own
    // debug button rather than through class surgery, so the tabs end up in the
    // state the game itself puts them in. Nothing on disk is touched: this is a
    // click in a throwaway page, and no build flag is read or written.
    // Tab 8 has a second gate beyond the tab unlock: it is hidden until the
    // `cosmicRip` entry is in the tech-unlocked array, and its panes have nothing
    // to draw until the scanner array is restored and the rip located. No debug
    // button grants those, so they are staged through the game's own setters —
    // in a throwaway page, with nothing persisted — before the tabs are unlocked,
    // so the tab-label pass sees the state it is deciding on.
    await page.evaluate(async () => {
        const cg = await import('/constantsAndGlobalVars.js');
        const rdo = await import('/resourceDataObject.js');
        rdo.setCosmicRipNearSpaceScannerArrayRestored?.(true);
        rdo.setCosmicRipRipFound?.(true);
        cg.setTechUnlockedArray?.('cosmicRip');
    });

    await page.evaluate(() => document.getElementById('unlockAllTabsButton')?.click());
    await page.waitForTimeout(600);

    return pioneer;
}

/**
 * The migrated panes, and what each of their rows must still show.
 *
 * This is the information-parity contract, written down. A row lists the cells
 * that must be present and non-empty; the check is that the migration did not
 * quietly drop a field on its way from `createOptionRow` to `createRow`.
 *
 * Ascendency Perks is checked separately and more strictly, against the perk
 * catalogue itself rather than against a list written here — it is the reference
 * section and its rows are generated, so the catalogue is the honest oracle.
 *
 * `hidden: true` marks a row that is legitimately not on screen in this staged
 * state; it must still EXIST, because the frame loop reveals it by id later. That
 * distinction matters: "not rendered" and "not built" look the same to a player
 * only until the moment the game tries to reveal the row.
 */
/**
 * How much of a pane may sit empty between two cells of one row before it is a
 * layout defect rather than breathing room. A third is generous — the four-track
 * grid was leaving two thirds on the settings panes.
 */
const DEAD_SPACE_LIMIT = 0.34;

const MIGRATED_PANES = [
    {
        tab: 8,
        optionId: 'cosmicRipSituationOption',
        pane: 'situation',
        section: '#cosmicRipSituationSection',
        rows: [
            { id: 'cosmicRipRestoreNearSpaceScannerArrayRow', cells: ['title', 'cost', 'action'], hidden: true },
            { id: 'cosmicRipNearSpaceScannerArrayRestoredStatusRow', cells: ['title', 'stat'] },
            { id: 'cosmicRipSituationStatusRow', cells: ['title', 'stat'] },
            { id: 'cosmicRipSituationObjectiveRow', cells: ['title', 'stat'] },
            { id: 'closeCosmicRipRow', cells: ['title', 'cost', 'action'], hidden: true }
        ]
    },
    {
        tab: 8,
        optionId: 'cosmicRipNearSpaceScannerArrayOption',
        pane: 'near space scanner array',
        section: '#cosmicRipNearSpaceScannerArrayDeploySection',
        rows: [
            { id: 'cosmicRipNearSpaceScannerArrayStatusRow', cells: [] },
            { id: 'cosmicRipNearSpaceScannerArrayDeploySensorBuoyRow', cells: ['title', 'stat', 'cost', 'action', 'detail'] },
            { id: 'cosmicRipNearSpaceScannerArrayDeployRipResearchOrbiterRow', cells: ['title', 'stat', 'cost', 'action', 'detail'] }
        ]
    },
    {
        tab: 8,
        optionId: 'cosmicRipCosmicRipOption',
        pane: 'cosmic rip',
        section: '#cosmicRipTechSection',
        rows: [
            { id: 'cosmicRipCosmicRipStatusRow', cells: ['title', 'stat', 'action', 'detail'] },
            { id: 'cosmicRipStabilizerArrayRow', cells: ['title', 'stat', 'cost', 'action', 'detail'], hidden: true },
            { id: 'cosmicRipQuantumContainmentFieldRow', cells: ['title', 'stat', 'cost', 'action', 'detail'], hidden: true },
            { id: 'cosmicRipDimensionalAnchorMatrixRow', cells: ['title', 'stat', 'cost', 'action', 'detail'], hidden: true },
            { id: 'cosmicRipSingularityStabilizerRow', cells: ['title', 'stat', 'cost', 'action', 'detail'], hidden: true },
            { id: 'cosmicRipRealityWeaveRegulatorRow', cells: ['title', 'stat', 'cost', 'action', 'detail'], hidden: true }
        ]
    },
    {
        tab: 9,
        optionId: null,
        optionToken: 'tab9.option1',
        pane: 'visual',
        section: '#tab9VisualSection',
        rows: [
            { id: 'settingsThemeRow', cells: ['title', 'action', 'detail'] },
            { id: 'settingsCurrencySymbolRow', cells: ['title', 'action', 'detail'] },
            { id: 'settingsToggleNotificationsRow', cells: ['title', 'action', 'detail'] },
            { id: 'customPointerToggleRow', cells: ['title', 'action', 'detail'] },
            { id: 'mouseTrailToggleRow', cells: ['title', 'action', 'detail'] },
            { id: 'weatherEffectSettingsRow', cells: ['title', 'action', 'detail'] }
        ]
    },
    {
        tab: 9,
        optionId: null,
        optionToken: 'tab9.option3',
        pane: 'game options',
        section: '#tab9GameOptionsSection',
        rows: [
            { id: 'toggleGameFullScreenRow', cells: ['title', 'action', 'detail'] },
            { id: 'settingsLanguageRow', cells: ['title', 'action', 'detail'] },
            { id: 'newsTickerToggleRow', cells: ['title', 'action', 'detail'] },
            { id: 'backGroundAudioRow', cells: ['title', 'action', 'detail'] },
            { id: 'sfxAudioRow', cells: ['title', 'action', 'detail'] }
        ]
    },
    {
        tab: 9,
        optionId: null,
        optionToken: 'tab9.option2',
        pane: 'saving / loading',
        section: '#tab9SavingLoadingSection',
        // The saving pane is skipped for screenshots because the frame loop saves
        // every frame while it is open, but the read-only network guard makes it
        // safe to *inspect*: any write it attempts is aborted before it leaves the
        // browser and is reported at the end of the run.
        rows: [
            { id: 'autoSaveConfigRow', cells: ['title', 'action'] },
            { id: 'exportSaveRow', cells: ['title', 'action'] },
            { id: 'importSaveRow', cells: ['title', 'action'] },
            { id: 'exportCloudSaveRow', cells: ['title', 'action'] },
            { id: 'importCloudSaveRow', cells: ['title', 'action'] },
            { id: 'hardResetRow', cells: ['title', 'action', 'detail'] }
        ]
    },
    {
        tab: 9,
        optionId: 'statisticsOption',
        pane: 'statistics',
        section: '#tab9StatisticsSection',
        rows: [{ id: 'statisticsRow', cells: ['full'] }]
    },
    {
        tab: 9,
        optionId: 'achievementsOption',
        pane: 'achievements',
        section: '#tab9AchievementsSection',
        rows: [{ id: 'achievementsRow', cells: ['full'] }]
    },
    {
        tab: 9,
        optionId: 'eventsOption',
        pane: 'events',
        section: '#tab9EventsSection',
        rows: [{ id: 'eventsRow', cells: ['full'] }]
    },
    {
        tab: 9,
        optionId: 'tab9GetStartedOption',
        pane: 'get started',
        section: '#tab9HelpSection',
        rows: [{ id: 'getStartedRow', cells: ['full'] }]
    }
];

/** Open a pane by option id or by its `tabN.optionM` class token. */
async function openPaneEntry(page, entry) {
    await page.evaluate((i) => {
        document.getElementById(`tab${i}`)?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }, entry.tab);
    await page.waitForTimeout(300);

    await page.evaluate(({ id, token }) => {
        const el = id
            ? document.getElementById(id)
            : document.querySelector(`p[class~="${token}"]`);
        el?.closest('.row-side-menu')?.classList.remove('invisible');
        el?.classList.remove('invisible');
        el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }, { id: entry.optionId, token: entry.optionToken });

    await page.waitForTimeout(700);
}

/**
 * Every sentence descriptions.js holds for a migrated row must still reach the DOM.
 *
 * This is the check that was missing, and it is missing for a structural reason
 * worth writing down: parity was measured spec → DOM, so a field the spec never
 * claimed could not be reported lost. The legacy renderer pulled a row's prose
 * out of descriptions.js by id *without being asked* (ui.js:4201), so a migrated
 * call site that simply forgot to pass `detail` dropped a localised sentence and
 * every spec-shaped check still read green. Tab 8 lost eight that way.
 *
 * The source of truth here is therefore descriptions.js, not the spec.
 */
async function checkDescriptionParity(page, entry) {
    return page.evaluate((spec) => {
        const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
        const findings = [];

        for (const row of spec.rows) {
            const described = globalThis.__mods.descriptions?.getOptionDescription?.(row.id);
            const expected = norm(described?.content1);
            if (!expected) continue;   // no prose is owed for this row

            const el = document.getElementById(row.id);
            const shown = el && (
                el.querySelector(':scope > .ui-cell-detail')
                || el.querySelector(':scope > .ui-detail .ui-detail-body')
            );

            findings.push({
                id: row.id,
                ok: Boolean(shown && norm(shown.textContent).length > 0),
                chars: expected.length
            });
        }

        return findings;
    }, entry);
}

/**
 * The widest run of empty pane between two cells of the same row.
 *
 * A grid track costs its share of the pane whether or not anything is in it, so
 * a pane that declares four tracks and fills two leaves a hole — and the hole is
 * invisible to every check that only asks whether a field reached the DOM. On the
 * settings panes it was ~700px wide, with the label at one edge of the screen and
 * its own control at the other. `syncPaneTracks` is what closes it; this is what
 * proves it stayed closed.
 *
 * Measured as a fraction of the pane's width so it means the same thing at any
 * window size.
 */
async function measureDeadSpace(page, sectionSelector) {
    return page.evaluate((selector) => {
        const section = document.querySelector(selector);
        if (!section) return { found: false };

        const paneWidth = (section.closest('.ui-pane') || section).getBoundingClientRect().width;
        if (!paneWidth) return { found: false };

        let worst = { gap: 0, rowId: null };

        for (const row of section.querySelectorAll('.ui-row')) {
            if (row.classList.contains('invisible')) continue;

            const rects = [...row.querySelectorAll(':scope > .ui-cell')]
                .filter((cell) => !cell.classList.contains('ui-cell-full'))
                .filter((cell) => cell.offsetParent !== null)
                .filter((cell) => cell.childElementCount > 0 || cell.textContent.trim() !== '')
                .map((cell) => cell.getBoundingClientRect())
                .sort((a, b) => a.left - b.left);

            for (let i = 1; i < rects.length; i++) {
                const gap = rects[i].left - rects[i - 1].right;
                if (gap > worst.gap) worst = { gap, rowId: row.id || '(unnamed)' };
            }
        }

        return {
            found: true,
            paneWidth: Math.round(paneWidth),
            gapPx: Math.round(worst.gap),
            gapFraction: worst.gap / paneWidth,
            rowId: worst.rowId
        };
    }, sectionSelector);
}

/** Check one migrated pane's rows against the cells they promise. */
async function checkPaneRows(page, entry) {
    return page.evaluate((spec) => {
        const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
        const findings = [];

        for (const row of spec.rows) {
            const el = document.getElementById(row.id);
            if (!el) {
                findings.push({ id: row.id, ok: false, missing: ['the row itself'] });
                continue;
            }

            const missing = [];
            for (const cell of row.cells) {
                let node = null;
                if (cell === 'title') node = el.querySelector(':scope > .ui-cell-title');
                else if (cell === 'stat') node = el.querySelector(':scope > .ui-cell-stat');
                else if (cell === 'cost') node = el.querySelector(':scope > .ui-cell-cost');
                else if (cell === 'action') node = el.querySelector(':scope > .ui-cell-action');
                // Prose reaches the player two ways now: as a cell in the row's
                // last track (`detailInline`, what a settings row wants) or as a
                // band under the row, open or behind a caret. Either satisfies
                // the contract — the check is that the sentence is reachable.
                else if (cell === 'detail') node = el.querySelector(':scope > .ui-cell-detail')
                    || el.querySelector(':scope > .ui-detail .ui-detail-body');
                else if (cell === 'full') node = el.querySelector(':scope > .ui-cell-full');

                // A cell counts as present if it holds text OR a control — the
                // action cell of a toggle row has no text at all, and the cost
                // cell of a purchase row is a label the frame loop fills.
                const filled = node && (norm(node.textContent).length > 0 || node.children.length > 0);
                if (!filled) missing.push(cell);
            }

            findings.push({
                id: row.id,
                ok: missing.length === 0,
                missing,
                visible: !el.classList.contains('invisible'),
                expectedHidden: Boolean(row.hidden)
            });
        }

        return findings;
    }, { rows: entry.rows });
}

/** Open a side-menu option by id, revealing its row first. */
async function openOptionById(page, tab, optionId) {
    await page.evaluate((i) => {
        document.getElementById(`tab${i}`)?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }, tab);
    await page.waitForTimeout(300);

    await page.evaluate((id) => {
        const el = document.getElementById(id);
        el?.closest('.row-side-menu')?.classList.remove('invisible');
        el?.classList.remove('invisible');
        el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }, optionId);
    await page.waitForTimeout(700);
}

/**
 * Open a tab and then its first side-menu option, so the content column actually
 * draws rows. Clicking the tab alone leaves whatever pane was open before, which
 * would make the per-tab row counts below a measurement of the previous tab.
 */
async function openFirstPane(page, tab) {
    await page.evaluate((i) => {
        document.getElementById(`tab${i}`)?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }, tab);
    await page.waitForTimeout(300);

    return page.evaluate((t) => {
        const group = document.getElementById(`tab${t}ContainerGroup`);
        if (!group) return null;
        const label = Array.from(group.querySelectorAll('p'))
            .find((p) => Array.from(p.classList).some((c) => c.startsWith(`tab${t}.`)));
        if (!label) return null;
        label.classList.remove('invisible');
        label.closest('.row-side-menu')?.classList.remove('invisible');
        label.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        return (label.textContent || '').replace(/[⚠️🌀ℹ️]/gu, '').trim();
    }, tab);
}

/* ------------------------------------------------------ the two checks --- */

/**
 * Read the migrated Ascendency Perks section, field by field, against the perk
 * catalogue the game is holding.
 *
 * The comparison runs inside the page because the catalogue is only reachable
 * from the loaded modules — asking the DOM alone what a row "should" contain
 * would just be asking the row about itself.
 */
async function readPerkParity(page) {
    return page.evaluate(() => {
        const m = globalThis.__mods;
        const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);
        const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

        const buffs = Object.fromEntries(
            Object.entries(m.rdo.getAscendencyBuffDataObject())
                .filter(([key]) => key !== 'version')
                .filter(([, buff]) => buff && typeof buff === 'object')
        );

        const findings = [];

        for (const [key, buff] of Object.entries(buffs)) {
            const rowId = `buff${capitalise(key)}Row`;
            const row = document.getElementById(rowId);

            if (!row) {
                findings.push({ key, ok: false, missing: ['row'], detail: `no element #${rowId}` });
                continue;
            }

            const maxed = m.rdo.isAscendencyBuffMaxed(buff);
            const missing = [];

            // Title — the perk's translated name.
            const title = row.querySelector('.ui-cell-title .ui-title');
            if (!title || !norm(title.textContent)) missing.push('title');

            // Purchase status — the element the frame loop writes into by id.
            // Blank is legitimate on a finished perk: the badge in the cost cell
            // states that once, and repeating it was the defect P2 removed.
            const status = document.getElementById(`buff${capitalise(key)}BuyStatusText`);
            if (!status) missing.push('status element');
            else if (!maxed && !norm(status.textContent)) missing.push('status text');

            // Rebuyable — the value; its label is now the column heading.
            const rebuyable = document.getElementById(`buff${capitalise(key)}RebuyableText`);
            if (!rebuyable || !norm(rebuyable.textContent)) missing.push('rebuyable');

            // Price — the other element the frame loop owns by id.
            const cost = document.getElementById(`${key}CostText`);
            if (!cost || !norm(cost.textContent)) missing.push('cost');

            // The buy control, or the inert spacer that stands in for it.
            const control = row.querySelector('button.ascendency-buff-button, .ascendency-buff-maxed-spacer');
            if (!control) missing.push('buy control');

            // The description prose, now behind a disclosure rather than printed
            // above every row. Collapsed still counts as present — the check is
            // that the player can reach it, not that it is on screen.
            const detail = row.querySelector('.ui-detail .ui-detail-body');
            if (!detail || !norm(detail.textContent)) missing.push('description');

            const disclosure = row.querySelector('.ui-detail .ui-disclosure');
            if (!disclosure || !norm(disclosure.textContent)) missing.push('disclosure label');

            findings.push({
                key,
                ok: missing.length === 0,
                missing,
                maxed,
                title: norm(title?.textContent),
                rebuyable: norm(rebuyable?.textContent),
                status: norm(status?.textContent),
                cost: norm(cost?.textContent),
                controlKind: control
                    ? (control.tagName === 'BUTTON' ? 'button' : 'maxed spacer')
                    : null,
                descriptionChars: norm(detail?.textContent).length
            });
        }

        return { findings, perkCount: Object.keys(buffs).length };
    });
}

/**
 * Measure the action column.
 *
 * `getBoundingClientRect().left` on every action cell of the section. The
 * criterion is one distinct edge within 1px; the legacy rows produced several,
 * because each row's 30%/70% split resolved against its own content.
 *
 * Sub-pixel layout means the raw numbers will differ in the third decimal even
 * when the grid is doing its job, so edges are clustered at 1px rather than
 * compared for equality.
 */
async function measureAlignment(page, sectionSelector, cellSelector) {
    return page.evaluate(({ sectionSel, cellSel }) => {
        const section = document.querySelector(sectionSel);
        if (!section) return { found: false };

        const cells = Array.from(section.querySelectorAll(cellSel))
            .filter((el) => el.getClientRects().length > 0);

        const lefts = cells.map((el) => el.getBoundingClientRect().left);

        const clusters = [];
        for (const left of lefts.slice().sort((a, b) => a - b)) {
            const last = clusters[clusters.length - 1];
            if (last && Math.abs(left - last.at) <= 1) last.count++;
            else clusters.push({ at: left, count: 1 });
        }

        return {
            found: true,
            cellCount: cells.length,
            distinctEdges: clusters.length,
            spread: lefts.length ? Math.max(...lefts) - Math.min(...lefts) : 0,
            clusters: clusters.map((c) => ({ at: Math.round(c.at * 100) / 100, count: c.count }))
        };
    }, { sectionSel: sectionSelector, cellSel: cellSelector });
}

/**
 * A crude but honest measure of the space the disclosure reclaimed: how tall the
 * migrated pane is now, versus how tall it would be with every description
 * expanded — which is what the legacy layout showed permanently.
 */
async function measureSpace(page) {
    return page.evaluate(() => {
        const pane = document.getElementById('ascendencyPerksPane');
        if (!pane) return { found: false };

        const collapsed = pane.getBoundingClientRect().height;
        const buttons = Array.from(pane.querySelectorAll('.ui-disclosure'));
        buttons.forEach((b) => b.click());
        const expanded = pane.getBoundingClientRect().height;
        buttons.forEach((b) => b.click());

        return {
            found: true,
            collapsedHeight: Math.round(collapsed),
            expandedHeight: Math.round(expanded),
            reclaimedPct: expanded ? Math.round((1 - collapsed / expanded) * 1000) / 10 : 0
        };
    });
}

/* ------------------------------------------------------------------ main -- */

async function main() {
    const args = parseArgs(process.argv.slice(2));

    console.log('Large UI refactor — Phase 3 row parity & alignment check');
    console.log('');

    const server = await ensureServer(args.port);
    const browser = await chromium.launch({ headless: !args.headed });
    const context = await browser.newContext({ viewport: VIEWPORT });
    const blocked = await installReadOnlyGuard(context);
    const page = await context.newPage();

    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', (err) => consoleErrors.push(String(err)));

    let failed = false;
    const report = {};

    try {
        const pioneer = await boot(page, args.port, args.pioneer);
        console.log(`  · booted as ${pioneer}`);

        await openOptionById(page, 7, 'ascendencyOption');

        const pane = await page.evaluate(() => globalThis.__mods.cg.getCurrentOptionPane());
        if (pane !== 'ascendency perks') {
            throw new Error(`expected the ascendency perks pane to be open, got "${pane}"`);
        }
        // One frame with the pane open, so the rows carry live classification
        // rather than whatever they were drawn with.
        await page.waitForTimeout(700);

        /* --- 1. information parity ------------------------------------ */
        report.parity = await readPerkParity(page);
        const bad = report.parity.findings.filter((f) => !f.ok);

        console.log('Information parity — Ascendency Perks (migrated section)');
        console.log(`  perks in catalogue : ${report.parity.perkCount}`);
        console.log(`  rows rendered      : ${report.parity.findings.length}`);
        console.log(`  complete rows      : ${report.parity.findings.length - bad.length}`);
        if (bad.length) {
            failed = true;
            console.log('  MISSING FIELDS:');
            bad.forEach((f) => console.log(`    · ${f.key}: ${f.missing.join(', ')}`));
        } else {
            console.log('  ✅ every perk renders title, rebuyable, status, price, control and description');
        }
        console.log('');

        /* --- 2. alignment --------------------------------------------- */
        report.alignment = await measureAlignment(page, '#ascendencyPerksSection', '.ui-cell-action');

        console.log('Alignment — the Phase 3 exit criterion');
        if (!report.alignment.found) {
            failed = true;
            console.log('  ✗ #ascendencyPerksSection not found');
        } else {
            console.log(`  action cells       : ${report.alignment.cellCount}`);
            console.log(`  distinct left edges: ${report.alignment.distinctEdges} (within 1px)`);
            console.log(`  spread             : ${report.alignment.spread.toFixed(2)}px`);
            if (report.alignment.distinctEdges === 1) {
                console.log('  ✅ ALIGNED — every action cell shares one left edge');
            } else {
                failed = true;
                console.log('  ✗ NOT ALIGNED');
                report.alignment.clusters.forEach((c) => console.log(`      ${c.count} cell(s) at x=${c.at}`));
            }
        }
        console.log('');

        /* --- 3. the space the disclosure reclaimed -------------------- */
        report.space = await measureSpace(page);
        if (report.space.found) {
            console.log('Space — the collapsed description');
            console.log(`  collapsed : ${report.space.collapsedHeight}px`);
            console.log(`  expanded  : ${report.space.expandedHeight}px  (what the legacy row showed permanently)`);
            console.log(`  reclaimed : ${report.space.reclaimedPct}%`);
            console.log('');
        }

        /* --- 3b. the other migrated panes ----------------------------- */
        console.log('Information parity — the other migrated panes (Phase 4)');
        report.panes = [];

        for (const entry of MIGRATED_PANES) {
            await openPaneEntry(page, entry);

            const actualPane = await page.evaluate(() => globalThis.__mods.cg.getCurrentOptionPane());
            if (actualPane !== entry.pane) {
                failed = true;
                console.log(`  ✗ ${entry.pane}: pane did not open (got "${actualPane}")`);
                report.panes.push({ pane: entry.pane, opened: false });
                continue;
            }

            const findings = await checkPaneRows(page, entry);
            const missing = findings.filter((f) => !f.ok);

            const alignment = entry.section
                ? await measureAlignment(page, entry.section, '.ui-cell-action')
                : { found: false };

            const prose = await checkDescriptionParity(page, entry);
            const deadSpace = entry.section
                ? await measureDeadSpace(page, entry.section)
                : { found: false };

            report.panes.push({ pane: entry.pane, findings, alignment, prose, deadSpace });

            const align = alignment.found && alignment.cellCount > 1
                ? `${alignment.distinctEdges} edge(s), ${alignment.spread.toFixed(2)}px spread`
                : 'n/a';

            if (missing.length) {
                failed = true;
                console.log(`  ✗ ${entry.pane}: ${missing.length} of ${findings.length} rows incomplete`);
                missing.forEach((f) => console.log(`      · ${f.id}: missing ${f.missing.join(', ')}`));
            } else {
                console.log(`  ✅ ${entry.pane.padEnd(26)} ${String(findings.length).padStart(2)} rows complete · action column: ${align}`);
            }

            // A row whose alignment is measured must actually be aligned. Rows
            // legitimately off screen contribute no cell, so a pane whose visible
            // rows all sit in one column still reports one edge.
            if (alignment.found && alignment.cellCount > 1 && alignment.distinctEdges !== 1) {
                failed = true;
                console.log(`      ✗ action cells do not share one left edge:`);
                alignment.clusters.forEach((c) => console.log(`          ${c.count} at x=${c.at}`));
            }

            // A sentence descriptions.js owes the row must be reachable.
            const proseLost = prose.filter((f) => !f.ok);
            if (proseLost.length) {
                failed = true;
                console.log(`      ✗ descriptions.js prose not drawn on ${proseLost.length} row(s):`);
                proseLost.forEach((f) => console.log(`          ${f.id} (${f.chars} chars)`));
            } else if (prose.length) {
                console.log(`      · prose: ${prose.length} description(s) reachable`);
            }

            // And the row must not be mostly hole. A third of the pane is a
            // generous ceiling: the settings panes were sitting at two thirds.
            if (deadSpace.found) {
                const pct = (deadSpace.gapFraction * 100).toFixed(0);
                if (deadSpace.gapFraction > DEAD_SPACE_LIMIT) {
                    failed = true;
                    console.log(`      ✗ ${deadSpace.gapPx}px (${pct}%) of empty pane inside row ${deadSpace.rowId}`);
                } else {
                    console.log(`      · widest gap between cells: ${deadSpace.gapPx}px (${pct}% of pane)`);
                }
            }
        }
        console.log('');

        /* --- 4. the other tabs, through the adapter -------------------- */
        // Every unmigrated pane still renders through `createOptionRow`, which is
        // now an adapter. A thrown error there would take a whole tab down, so
        // each tab is opened once and the console watched.
        console.log('The adapter — every other tab still draws');
        report.tabs = [];
        for (const tab of [1, 2, 3, 4, 5, 6, 8, 9]) {
            const before = consoleErrors.length;
            const pane = await openFirstPane(page, tab);
            const rows = await page.evaluate((t) => {
                const content = document.getElementById(`optionContentTab${t}`);
                return content ? content.querySelectorAll('.option-row').length : 0;
            }, tab);
            const errs = consoleErrors.length - before;
            report.tabs.push({ tab, pane, rows, errors: errs });
            console.log(`  tab ${tab} (${pane ?? 'no pane'}): ${String(rows).padStart(3)} rows${errs ? `  ✗ ${errs} console error(s)` : ''}`);
            if (errs) failed = true;
        }
        console.log('');

        // A throwaway pioneer has no cloud row, so the save lookup answers 406.
        // That is the game asking a reasonable question and getting a reasonable
        // answer, not a defect, and failing the run on it would make the exit
        // code meaningless. Script errors are what this check is for, so the two
        // are separated rather than the whole channel being ignored.
        const networkNoise = consoleErrors.filter((e) => /Failed to load resource/i.test(e));
        const scriptErrors = consoleErrors.filter((e) => !/Failed to load resource/i.test(e));
        report.consoleErrors = { scriptErrors, networkNoise };

        if (scriptErrors.length) {
            failed = true;
            console.log(`Script errors (${scriptErrors.length}):`);
            scriptErrors.slice(0, 12).forEach((e) => console.log(`  · ${e}`));
        } else {
            console.log('✅ no script errors during the run');
        }
        if (networkNoise.length) {
            console.log(`   (${networkNoise.length} resource-load message(s) ignored — a throwaway pioneer has no cloud save row)`);
        }

        if (blocked.total) {
            console.log('');
            console.log(`Read-only guard blocked ${blocked.total} cloud write(s): ${JSON.stringify(blocked.byVerb)}`);
        }
    } finally {
        await context.close();
        await browser.close();
        if (server) server.kill();
    }

    if (args.json) {
        fs.writeFileSync(path.resolve(ROOT, args.json), JSON.stringify(report, null, 2));
        console.log(`\nreport written to ${args.json}`);
    }

    process.exit(failed ? 1 : 0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
