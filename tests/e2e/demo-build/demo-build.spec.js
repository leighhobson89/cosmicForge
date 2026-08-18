/**
 * Area: Demo Build Lockdowns
 * Plan: tests/docs/areas/demo-build.md
 *
 * setDemoBuild() is exported directly, so most gates (save/export, autosave) are
 * exercised by flipping it and calling the real gated functions. The interstellar
 * sidebar dimming is only ever applied inside initialiseStaticButtonLabels(),
 * which re-derives demoBuild itself from navigator.userAgent
 * (`setDemoBuild(isElectron ? window.__DEMO_BUILD__ === true : false)`), so
 * that one test spoofs navigator.userAgent to look like Electron and re-runs
 * that function, rather than rebooting the page — Object.defineProperty works
 * immediately in the live page, no reload needed. The Galactic tab's own demo
 * lock (showTabsUponUnlock) re-reads getDemoBuild() every gameLoop tick, so it
 * needs nothing beyond setDemoBuild(true) and a short wait.
 */
import { test, expect } from '../_harness/game-fixture.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..', '..');

test.describe('Demo Build Lockdowns', () => {
  test.describe('gated functions (setDemoBuild toggled directly)', () => {
    test.beforeEach(async ({ game }) => {
      await game.boot();
    });

    test('saveGame() discards the save instead of writing it', async ({ game }) => {
      const result = await game.withMods((m) => {
        m.cg.setDemoBuild(true);
        m.cg.setSaveData('should not survive');
        m.saveLoad.saveGame('manual');
        const afterDemo = m.cg.getSaveData();

        m.cg.setDemoBuild(false);
        return { afterDemo };
      });

      expect(result.afterDemo).toBeNull();
    });

    test('a full build lets saveGame() populate save data normally', async ({ game }) => {
      // 'initialise' is one of the types saveGame() always writes saveData for
      // (the others additionally need a rendered #exportSaveArea element, which
      // is only created once the Save/Load pane has been opened).
      const result = await game.withMods((m) => {
        m.cg.setDemoBuild(false);
        m.cg.setSaveData(null);
        m.saveLoad.saveGame('initialise');
        return m.cg.getSaveData();
      });

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    test('downloadSaveStringToComputer() is blocked with an explanatory notification', async ({ game }) => {
      // The 'loadSave' classification's queue is serialized: boot can leave an
      // unrelated notification (e.g. a cloud-load attempt) already showing or
      // queued ahead of this one, which delays when it actually renders. Poll
      // rather than use a single fixed wait, so this isn't a race under load.
      await game.withMods((m) => m.cg.setDemoBuild(true));
      await game.withMods((m) => m.saveLoad.downloadSaveStringToComputer());

      await expect
        .poll(() => game.notifications('loadSave'), { timeout: 8000 })
        .toEqual(expect.arrayContaining([expect.stringMatching(/disabled in the demo build/i)]));

      await game.withMods((m) => m.cg.setDemoBuild(false));
    });

    test('copySaveStringToClipBoard() is blocked with an explanatory notification', async ({ game }) => {
      await game.withMods((m) => m.cg.setDemoBuild(true));
      await game.withMods((m) => m.saveLoad.copySaveStringToClipBoard());

      await expect
        .poll(() => game.notifications('loadSave'), { timeout: 8000 })
        .toEqual(expect.arrayContaining([expect.stringMatching(/disabled in the demo build/i)]));

      await game.withMods((m) => m.cg.setDemoBuild(false));
    });

    test('autosave never schedules a timer while the demo flag is set', async ({ game }) => {
      // isElectronDemoBuild() inside initializeAutoSave() forwards straight to
      // getDemoBuild(), with no Electron check, so this is testable directly.
      // Spy on setTimeout for the duration of the call: a real build always
      // schedules one, a demo build must schedule none.
      const result = await game.withMods((m) => {
        const originalSetTimeout = window.setTimeout;
        let scheduledCalls = 0;
        window.setTimeout = (...args) => {
          scheduledCalls++;
          return originalSetTimeout(...args);
        };

        try {
          m.cg.setDemoBuild(true);
          m.saveLoad.stopAutoSave();
          m.saveLoad.initializeAutoSave();
          const demoCalls = scheduledCalls;

          scheduledCalls = 0;
          m.cg.setDemoBuild(false);
          m.saveLoad.stopAutoSave();
          m.saveLoad.initializeAutoSave();
          const fullCalls = scheduledCalls;

          m.saveLoad.stopAutoSave();
          return { demoCalls, fullCalls };
        } finally {
          window.setTimeout = originalSetTimeout;
        }
      });

      expect(result.demoCalls).toBe(0);
      expect(result.fullCalls).toBeGreaterThan(0);
    });
  });

});

test.describe('Demo Build Lockdowns — debugger reachability', () => {
  test('the debug hotkeys are unreachable for a non-Test1981 pioneer once demoBuild is true', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#pioneerCodeName', { timeout: 60000 });
    await page.fill('#pioneerCodeName', `RegularPlayer_${Date.now()}`);
    await page.click('#modalConfirm');
    await page.waitForSelector('#fullScreenCheckBox', { timeout: 60000 });
    await page.click('#fullScreenCheckBox');
    await page.click('#modalConfirm');
    await page.waitForSelector('#tab1', { timeout: 60000 });

    const cancel = page.locator('#modalCancel');
    if (await cancel.isVisible({ timeout: 3000 }).catch(() => false)) {
      if ((await cancel.textContent())?.trim() === 'NO') await cancel.click();
    }

    await page.evaluate(async () => {
      globalThis.__mods = { cg: await import('/constantsAndGlobalVars.js') };
    });

    // Control: with demoBuild false, __VARIABLE_DEBUGGER_AND_CHEATS__ true
    // (the default dev buildFlags.js) and no Electron detected, the hotkeys
    // still open for a plain pioneer.
    await page.evaluate(() => globalThis.__mods.cg.setDemoBuild(false));
    await page.keyboard.press('NumpadSubtract');
    await page.waitForTimeout(150);
    const openedWithoutDemo = await page.evaluate(
      () => document.getElementById('debugWindow')?.style.display === 'block'
    );
    await page.keyboard.press('NumpadSubtract'); // close it again
    await page.waitForTimeout(150);

    // With demoBuild true, the same hotkey must not open the window for this
    // pioneer (only the Test1981 backdoor bypasses the demo gate).
    await page.evaluate(() => globalThis.__mods.cg.setDemoBuild(true));
    await page.keyboard.press('NumpadSubtract');
    await page.waitForTimeout(150);
    const openedWithDemo = await page.evaluate(
      () => document.getElementById('debugWindow')?.style.display === 'block'
    );

    await page.evaluate(() => globalThis.__mods.cg.setDemoBuild(false));

    expect(openedWithoutDemo).toBe(true);
    expect(openedWithDemo).toBe(false);
  });

  test('the variable debugger hotkey is likewise gated by demoBuild for a non-Test1981 pioneer', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#pioneerCodeName', { timeout: 60000 });
    await page.fill('#pioneerCodeName', `RegularPlayer_${Date.now()}`);
    await page.click('#modalConfirm');
    await page.waitForSelector('#fullScreenCheckBox', { timeout: 60000 });
    await page.click('#fullScreenCheckBox');
    await page.click('#modalConfirm');
    await page.waitForSelector('#tab1', { timeout: 60000 });

    const cancel = page.locator('#modalCancel');
    if (await cancel.isVisible({ timeout: 3000 }).catch(() => false)) {
      if ((await cancel.textContent())?.trim() === 'NO') await cancel.click();
    }

    await page.evaluate(async () => {
      globalThis.__mods = { cg: await import('/constantsAndGlobalVars.js') };
    });

    await page.evaluate(() => globalThis.__mods.cg.setDemoBuild(true));
    await page.keyboard.press('NumpadMultiply');
    await page.waitForTimeout(150);
    const opened = await page.evaluate(
      () => document.getElementById('variableDebuggerWindow')?.style.display === 'block'
    );
    await page.evaluate(() => globalThis.__mods.cg.setDemoBuild(false));

    expect(opened).toBe(false);
  });

  test('the Test1981 backdoor still opens the debugger even when demoBuild is true', async ({ game }) => {
    await game.boot(); // pioneer name contains Test1981
    await game.withMods((m) => m.cg.setDemoBuild(true));

    const opened = await game.openDebugMenu();
    await game.withMods((m) => m.cg.setDemoBuild(false));

    expect(opened).toBe(true);
  });
});

/**
 * Boot the game as the packaged Electron demo (or full) app would present itself.
 *
 * Two things have to be true *before* the first script runs, which is why this
 * is an addInitScript plus a route rather than a call after boot:
 *
 *  - `navigator.userAgent` has to look like Electron, because
 *    `initialiseStaticButtonLabels()` derives the flag itself with
 *    `setDemoBuild(isElectron ? window.__DEMO_BUILD__ === true : false)` — in a
 *    plain browser the demo flag is ignored entirely.
 *  - `buildFlags.js` has to already carry the flavour, because that same line
 *    reads `window.__DEMO_BUILD__` once, at DOMContentLoaded.
 *
 * That matters far beyond the sidebar. Nearly every lockdown in the game is
 * applied at *draw* time — `drawTab2Content` and friends read `getDemoBuild()`
 * as they build each option row and bake `electron-purple-demo-button` into the
 * class list there and then. Flipping `setDemoBuild(true)` on a running page
 * therefore locks nothing that has already been drawn, and a spec that did so
 * would pass while proving nothing about a real demo build. Booting the variant
 * is the only honest way to test them.
 *
 * The pioneer name keeps the `Test1981` backdoor so the debug menu is still
 * reachable — a demo build gates the hotkeys on `getDemoBuild()`, and there is a
 * test above proving the backdoor is the single exception to that.
 */
async function bootVariant(game, { demo }) {
  await game.page.addInitScript(() => {
    Object.defineProperty(window.navigator, 'userAgent', {
      get: () => 'CosmicForgeElectronTestHarness/1.0 Electron/30.0.0',
      configurable: true
    });
  });
  await game.page.route('**/buildFlags.js', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: `window.__DEMO_BUILD__ = ${demo};\n\nwindow.__COSMIC_RIP_ENABLED__ = true;\n\nwindow.__VARIABLE_DEBUGGER_AND_CHEATS__ = true;\n`
    })
  );

  await game.boot({ pioneer: `Test1981_e2e_${demo ? 'demo' : 'full'}_${Date.now()}` });

  // The lockdowns key off getDemoBuild(), not off the raw window flag, and the
  // two only agree because the user-agent spoof took. Asserting the derived
  // value here means a broken spoof fails at the cause rather than as a puzzling
  // "nothing was locked" further down.
  expect(await game.withMods((m) => m.cg.getDemoBuild())).toBe(demo);

  await game.debugClick('grantAllTechsButton');
  await game.page.waitForTimeout(1200);
  await game.debugClick('unlockAllTabsButton');
  await game.page.waitForTimeout(800);
}

/** Open a side-menu pane by its option id, revealing the row if it is still gated. */
async function openOption(game, tab, optionId) {
  await game.openTab(tab);
  await game.page.waitForTimeout(300);
  const opened = await game.page.evaluate((key) => {
    const option = document.getElementById(key);
    if (!option) return false;
    option.classList.remove('invisible');
    option.closest('.row-side-menu')?.classList.remove('invisible');
    option.closest('.collapsible')?.classList.remove('invisible');
    option.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, optionId);
  if (!opened) throw new Error(`No side-menu option #${optionId}`);
  await game.page.waitForTimeout(700);
}

/**
 * Whether a row is locked, meaning it carries the demo class or contains a
 * control that does.
 *
 * Rows are wrappers, and which of the two gets the class varies by call site:
 * `createOptionRow` spreads `demoExtraClasses` into the button it builds, while
 * the sidebar and tab locks are applied to the element itself. Asking "is
 * anything in here locked" is the question that survives that difference.
 */
async function rowLocked(game, rowId) {
  return game.page.evaluate((id) => {
    const row = document.getElementById(id);
    if (!row) return 'missing';
    if (row.classList.contains('electron-purple-demo-button')) return true;
    return Boolean(row.querySelector('.electron-purple-demo-button'));
  }, rowId);
}

/**
 * Walk every pane that carries a demo lockdown and report what is locked.
 *
 * Collected in one pass so that the demo and the full build can be compared as
 * whole objects. Rows that must stay open in the demo are surveyed alongside the
 * locked ones, because "the demo locks everything" would be just as broken as
 * "the demo locks nothing" — the build has to remain playable up to its wall.
 */
async function surveyLockdowns(game) {
  const survey = {};

  await openOption(game, 2, 'energyOption');
  survey.energyBattery1Row = await rowLocked(game, 'energyBattery1Row');
  survey.energyBattery2Row = await rowLocked(game, 'energyBattery2Row');
  survey.energyBattery3Row = await rowLocked(game, 'energyBattery3Row');

  await openOption(game, 2, 'powerPlant1Option');
  // The basic power plant is deliberately *not* locked: it is the only generator
  // the demo gets, and locking it would leave the build unplayable.
  survey.energyPowerPlant1Row = await rowLocked(game, 'energyPowerPlant1Row');

  await openOption(game, 2, 'powerPlant2Option');
  survey.energyPowerPlant2Row = await rowLocked(game, 'energyPowerPlant2Row');
  await openOption(game, 2, 'powerPlant3Option');
  survey.energyPowerPlant3Row = await rowLocked(game, 'energyPowerPlant3Row');

  await openOption(game, 3, 'researchOption');
  survey.researchScienceKitRow = await rowLocked(game, 'researchScienceKitRow');
  survey.researchScienceLabRow = await rowLocked(game, 'researchScienceLabRow');

  await openOption(game, 3, 'technologyOption');
  survey.techOrbitalConstructionRow = await rowLocked(game, 'techOrbitalConstructionRow');
  // A neighbouring tech, to show the lock is aimed at one row rather than laid
  // over the whole technology pane.
  survey.techAntimatterEnginesRow = await rowLocked(game, 'techAntimatterEnginesRow');

  await openOption(game, 6, 'spaceTelescopeOption');
  survey.spaceTelescopeInvestigateStarRow = await rowLocked(game, 'spaceTelescopeInvestigateStarRow');

  await openOption(game, 6, 'launchPadOption');
  survey.spaceRocket1BuildRow = await rowLocked(game, 'spaceRocket1BuildRow');
  survey.spaceRocket2BuildRow = await rowLocked(game, 'spaceRocket2BuildRow');
  survey.spaceRocket3BuildRow = await rowLocked(game, 'spaceRocket3BuildRow');
  survey.spaceRocket4BuildRow = await rowLocked(game, 'spaceRocket4BuildRow');

  await game.openTab(9);
  await game.openPane('Saving / Loading');
  await game.page.waitForTimeout(500);
  survey.autoSaveConfigRow = await rowLocked(game, 'autoSaveConfigRow');
  survey.exportSaveRow = await rowLocked(game, 'exportSaveRow');
  survey.autoSaveToggle = await game.page.evaluate(() =>
    Boolean(document.getElementById('autoSaveToggle')?.classList.contains('electron-purple-demo-button')));

  survey.galacticTab = await game.page.evaluate(() =>
    Boolean(document.getElementById('tab7')?.classList.contains('electron-purple-demo-button')));
  survey.interstellarSidebar = await game.page.evaluate(() =>
    ['starDataOption', 'starShipOption', 'fleetHangarOption', 'coloniseOption', 'galacticCasinoOption']
      .every((id) => document.getElementById(id)?.classList.contains('electron-purple-demo-button') === true));

  return survey;
}

/**
 * The interstellar-sidebar dimming (applyInterstellarSidebarDemoLockdownUi)
 * runs exactly once, from inside a `document.addEventListener('DOMContentLoaded', ...)`
 * handler in ui.js — it is not reachable through any exported, re-callable
 * function. That handler also derives demoBuild itself, from
 * navigator.userAgent, before applying it: `setDemoBuild(isElectron ?
 * window.__DEMO_BUILD__ === true : false)`. Exercising it for real therefore
 * means booting a fresh page that already looks like Electron with a demo
 * buildFlags.js before DOMContentLoaded fires — an addInitScript (which runs
 * before any page script) spoofs the user agent, and a route intercepts
 * buildFlags.js so window.__DEMO_BUILD__ is already true when that listener
 * runs, exactly as the packaged Electron demo app would present.
 */
async function bootAsElectronVariant(page, { demo, pioneer }) {
  await page.addInitScript(() => {
    Object.defineProperty(window.navigator, 'userAgent', {
      get: () => 'CosmicForgeElectronTestHarness/1.0 Electron/30.0.0',
      configurable: true
    });
  });
  await page.route('**/buildFlags.js', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: `window.__DEMO_BUILD__ = ${demo};\n\nwindow.__COSMIC_RIP_ENABLED__ = true;\n\nwindow.__VARIABLE_DEBUGGER_AND_CHEATS__ = true;\n`
    })
  );

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#pioneerCodeName', { timeout: 60000 });
  await page.fill('#pioneerCodeName', pioneer);
  await page.click('#modalConfirm');
  await page.waitForSelector('#fullScreenCheckBox', { timeout: 60000 });
  await page.click('#fullScreenCheckBox');
  await page.click('#modalConfirm');
  await page.waitForSelector('#tab1', { timeout: 60000 });

  const cancel = page.locator('#modalCancel');
  if (await cancel.isVisible({ timeout: 3000 }).catch(() => false)) {
    if ((await cancel.textContent())?.trim() === 'NO') await cancel.click();
  }
  await page.waitForTimeout(400);
}

test.describe('Demo Build Lockdowns — boot-time UI lockdowns', () => {
  test('demo build dims the whole Galactic tab once the frame loop picks up the flag', async ({ game }) => {
    // showTabsUponUnlock() re-applies this every gameLoop tick, keyed only off
    // getDemoBuild() — the galactic market lives inside tab7, so the whole tab
    // is dimmed rather than a single option row. Unlike the sidebar dimming
    // below, this one is testable live, no reboot required.
    await game.boot();
    await game.prepareRunForStarshipLaunch();

    await game.withMods((m) => m.cg.setDemoBuild(false));
    await game.page.waitForTimeout(400);
    const before = await game.page.evaluate(() =>
      document.getElementById('tab7')?.classList.contains('electron-purple-demo-button')
    );

    await game.withMods((m) => m.cg.setDemoBuild(true));
    await game.page.waitForTimeout(400);
    const after = await game.page.evaluate(() =>
      document.getElementById('tab7')?.classList.contains('electron-purple-demo-button')
    );

    await game.withMods((m) => m.cg.setDemoBuild(false));

    expect(before).toBeFalsy();
    expect(after).toBe(true);
  });

  test('a demo Electron boot dims the interstellar sidebar options and installs the demo tooltip', async ({ page }) => {
    await bootAsElectronVariant(page, { demo: true, pioneer: `Test1981_e2e_demo_${Date.now()}` });

    const state = await page.evaluate(() => ({
      demoBuildFlag: window.__DEMO_BUILD__,
      starDataLocked: document.getElementById('starDataOption')?.classList.contains('electron-purple-demo-button'),
      starShipLocked: document.getElementById('starShipOption')?.classList.contains('electron-purple-demo-button'),
      fleetHangarLocked: document
        .getElementById('fleetHangarOption')
        ?.classList.contains('electron-purple-demo-button'),
      coloniseLocked: document.getElementById('coloniseOption')?.classList.contains('electron-purple-demo-button'),
      galacticCasinoLocked: document
        .getElementById('galacticCasinoOption')
        ?.classList.contains('electron-purple-demo-button'),
      demoTooltipExists: Boolean(document.getElementById('demo-tooltip'))
    }));

    expect(state.demoBuildFlag).toBe(true);
    expect(state.starDataLocked).toBe(true);
    expect(state.starShipLocked).toBe(true);
    expect(state.fleetHangarLocked).toBe(true);
    expect(state.coloniseLocked).toBe(true);
    expect(state.galacticCasinoLocked).toBe(true);
    expect(state.demoTooltipExists).toBe(true);
  });

  test('a full (non-demo) Electron boot applies none of the interstellar sidebar lockdowns', async ({ page }) => {
    await bootAsElectronVariant(page, { demo: false, pioneer: `Test1981_e2e_full_${Date.now()}` });

    const state = await page.evaluate(() => ({
      demoBuildFlag: window.__DEMO_BUILD__,
      starDataLocked: document.getElementById('starDataOption')?.classList.contains('electron-purple-demo-button'),
      coloniseLocked: document.getElementById('coloniseOption')?.classList.contains('electron-purple-demo-button')
    }));

    expect(state.demoBuildFlag).toBe(false);
    expect(state.starDataLocked).toBeFalsy();
    expect(state.coloniseLocked).toBeFalsy();
  });
});

test.describe('Demo Build Lockdowns — build-stamp.mjs template', () => {
  test('build-stamp.mjs writes the flags each variant expects, and always forces the debugger off', async () => {
    // This intentionally does NOT invoke tools/build-stamp.mjs as a subprocess:
    // doing so would run a real `bun run build:*`, which downloads/builds the
    // packaged Electron app. Instead this pins the exact template the script
    // writes to buildFlags.js, keeping the guarantee under test without the
    // side effects of a real build.
    const source = fs.readFileSync(path.join(REPO_ROOT, 'tools', 'build-stamp.mjs'), 'utf8');

    const templateMatch = source.match(
      /fs\.writeFileSync\(\s*buildFlagsPath,\s*`([^`]+)`/s
    );
    expect(templateMatch, 'expected a template literal written to buildFlagsPath').toBeTruthy();

    const template = templateMatch[1];

    // eslint-disable-next-line no-new-func
    const render = (isDemo, cosmicRipEnabled) =>
      new Function('isDemo', 'cosmicRipEnabled', `return \`${template}\`;`)(isDemo, cosmicRipEnabled);

    const demoFlags = render(true, true);
    const fullFlags = render(false, true);

    expect(demoFlags).toContain('window.__DEMO_BUILD__ = true;');
    expect(fullFlags).toContain('window.__DEMO_BUILD__ = false;');

    // The build script must never ship a build with cheats reachable via the
    // normal (non-Test1981) gate, regardless of flavor.
    expect(demoFlags).toContain('window.__VARIABLE_DEBUGGER_AND_CHEATS__ = false;');
    expect(fullFlags).toContain('window.__VARIABLE_DEBUGGER_AND_CHEATS__ = false;');

    expect(demoFlags).toContain('window.__COSMIC_RIP_ENABLED__ = true;');
    expect(fullFlags).toContain('window.__COSMIC_RIP_ENABLED__ = true;');
  });

  test('the artifact names differ between demo and full for both platforms', async () => {
    const source = fs.readFileSync(path.join(REPO_ROOT, 'tools', 'build-stamp.mjs'), 'utf8');

    expect(source).toContain('`Cosmic Forge ${suffix}.exe`');
    expect(source).toContain('`Cosmic Forge ${suffix}.${\'${ext}\'}`');
    expect(source).toContain("const suffix = isDemo ? 'Demo' : 'Full';");
  });
});

/**
 * The lockdowns that are baked in at draw time, swept in one pass per flavour.
 *
 * These are the ones a spec cannot reach by toggling `setDemoBuild()` on a live
 * page — see `bootVariant` above — and between them they are most of what the
 * demo actually withholds: batteries, the two better power plants, the science
 * lab, orbital construction, three of the four rockets, autosave and the save
 * export, plus the Galactic tab and the interstellar sidebar.
 */
test.describe('Demo Build Lockdowns — what a packaged demo withholds', () => {
  test.setTimeout(240000);

  test('a demo Electron boot locks every gated purchase and leaves the rest playable', async ({ game }) => {
    await bootVariant(game, { demo: true });
    const survey = await surveyLockdowns(game);

    expect(survey).toEqual({
      // Energy storage is entirely off-limits, all three battery tiers.
      energyBattery1Row: true,
      energyBattery2Row: true,
      energyBattery3Row: true,
      // …but the basic power plant is not, or the demo could not generate at all.
      energyPowerPlant1Row: false,
      energyPowerPlant2Row: true,
      energyPowerPlant3Row: true,
      // The science kit is the demo's research; the lab is the paid upgrade.
      researchScienceKitRow: false,
      researchScienceLabRow: true,
      // Orbital construction is the gate to the starship, so it is the wall the
      // demo stops at — the techs either side of it stay researchable.
      techOrbitalConstructionRow: true,
      techAntimatterEnginesRow: false,
      // Studying stars is how a run finds somewhere to go next, so the demo
      // stops there too.
      spaceTelescopeInvestigateStarRow: true,
      // Rocket 1 flies in the demo; the three larger rockets do not.
      spaceRocket1BuildRow: false,
      spaceRocket2BuildRow: true,
      spaceRocket3BuildRow: true,
      spaceRocket4BuildRow: true,
      // Saving is withheld in the UI as well as in the functions tested above.
      autoSaveConfigRow: true,
      autoSaveToggle: true,
      exportSaveRow: true,
      galacticTab: true,
      interstellarSidebar: true
    });
  });

  test('a full Electron boot locks none of them', async ({ game }) => {
    await bootVariant(game, { demo: false });
    const survey = await surveyLockdowns(game);

    // Every single row, including the ones the demo locks: a full build has to
    // be entirely free of the class, not merely mostly free of it.
    expect(Object.entries(survey).filter(([, locked]) => locked !== false)).toEqual([]);
  });

  test('the autobuyer tiers the demo withholds are tier 3 and tier 4, and only those', async ({ game }) => {
    await bootVariant(game, { demo: true });
    await openOption(game, 1, 'hydrogenOption');

    const tiers = await game.page.evaluate(() => {
      const counts = {};
      for (const button of document.querySelectorAll('button')) {
        const tier = button.dataset?.autoBuyerTier;
        if (!tier || tier === 'null') continue;
        counts[tier] = counts[tier] || { total: 0, locked: 0 };
        counts[tier].total++;
        if (button.classList.contains('electron-purple-demo-button')) counts[tier].locked++;
      }
      return counts;
    });

    // Tiers 1 and 2 are the demo's economy and stay buyable; 3 and 4 are the
    // ones the full game sells, and every button of theirs carries the lock.
    expect(tiers.tier1.locked).toBe(0);
    expect(tiers.tier2.locked).toBe(0);
    expect(tiers.tier3.locked).toBe(tiers.tier3.total);
    expect(tiers.tier4.locked).toBe(tiers.tier4.total);
    expect(tiers.tier3.total).toBeGreaterThan(0);
    expect(tiers.tier4.total).toBeGreaterThan(0);
  });

  test('the lock is enforced by the stylesheet, not merely coloured by it', async ({ game }) => {
    await bootVariant(game, { demo: true });
    await openOption(game, 2, 'energyOption');

    // `.electron-purple-demo-button { pointer-events: none }` is the whole
    // enforcement mechanism — the click handler behind a locked button is still
    // attached and would still fire, so if this rule ever stopped applying, every
    // lockdown in the game would become cosmetic at once. Read the computed value
    // rather than the class, because the class is what the other tests assert and
    // this one has to prove the class still means something.
    const enforcement = await game.page.evaluate(() => {
      const locked = Array.from(document.querySelectorAll('.electron-purple-demo-button'));
      return {
        count: locked.length,
        allInert: locked.every((el) => getComputedStyle(el).pointerEvents === 'none')
      };
    });

    expect(enforcement.count).toBeGreaterThan(0);
    expect(enforcement.allInert).toBe(true);
  });

  test('hovering a locked control explains why it is locked, in the player’s language', async ({ game }) => {
    await bootVariant(game, { demo: true });
    await openOption(game, 2, 'energyOption');

    const expected = await game.withMods((m) => m.loc.localize('notificationNotAvailableInDemo', m.cg.getLanguage()));
    expect(expected).not.toBe('notificationNotAvailableInDemo');

    // `setupDemoTooltips()` watches document mousemove and looks up whatever sits
    // under the cursor, temporarily restoring pointer-events so `elementFromPoint`
    // can see through the very rule that makes the control inert. Move a real
    // mouse over a locked button to exercise that, rather than dispatching an
    // event with made-up coordinates.
    const box = await game.page.locator('#energyBattery1Row .electron-purple-demo-button').first().boundingBox();
    expect(box).toBeTruthy();
    await game.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await game.page.waitForTimeout(300);

    const tooltip = await game.page.evaluate(() => {
      const el = document.getElementById('demo-tooltip');
      return el ? { display: el.style.display, text: el.textContent.trim() } : null;
    });
    expect(tooltip.display).toBe('block');
    expect(tooltip.text).toBe(expected);

    // …and it goes away again once the cursor leaves.
    await game.page.mouse.move(2, 2);
    await game.page.waitForTimeout(300);
    expect(await game.page.evaluate(() => document.getElementById('demo-tooltip').style.display)).toBe('none');
  });

  test('a demo build never contacts the cloud while booting', async ({ game }) => {
    // The name prompt branches on getDemoBuild(): a full build calls
    // loadGameFromCloud() and only offers onboarding if that fails, while a demo
    // build sets the onboarding flag and never reaches the network. The branch
    // has no accessor to read, but it is observable from outside — count the
    // requests the page makes to the save backend.
    const cloudRequests = [];
    game.page.on('request', (request) => {
      if (request.url().includes('supabase.co')) cloudRequests.push(request.url());
    });

    await bootVariant(game, { demo: true });
    await game.page.waitForTimeout(1500);

    expect(cloudRequests).toEqual([]);
  });
});
