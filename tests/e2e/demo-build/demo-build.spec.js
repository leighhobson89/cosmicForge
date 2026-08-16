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
