// Shared Playwright fixtures for Cosmic Forge E2E specs.
//
// Provides a `game` fixture that boots a clean new game, declines onboarding, and
// exposes helpers for reading and mutating game state through the real modules.
//
// Deliberately does NOT use the cloud-save fixtures the legacy suites rely on:
// those fixtures are stale (resourceData.version below MINIMUM_GAME_VERSION_FOR_SAVES)
// and are rejected by restoreGameStatus, and they also make every test depend on a
// live Supabase round trip. Booting fresh and seeding state directly is faster,
// hermetic, and does not touch production data.

import { test as base, expect } from '@playwright/test';

/** Console/page errors we tolerate: unrelated to the behaviour under test. */
const IGNORABLE_ERRORS = [
  'Failed to load resource',
  'net::ERR_',
  'favicon'
];

class GameHarness {
  constructor(page, errors) {
    this.page = page;
    this.errors = errors;
  }

  /**
   * Boot a fresh game and dismiss the onboarding prompt.
   *
   * The pioneer name always contains `Test1981`, which is the game's own
   * sanctioned test backdoor: both debug hotkeys check
   * `getSaveName()?.includes('Test1981')` as an alternative to the
   * non-Electron + non-demo + cheats-enabled gate. Using it means the debug
   * tooling is reachable regardless of how buildFlags.js is currently set.
   */
  async boot({ pioneer = `Test1981_e2e_${Date.now()}_${Math.floor(Math.random() * 1e6)}` } = {}) {
    const { page } = this;

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('#pioneerCodeName', { timeout: 60000 });
    await page.fill('#pioneerCodeName', pioneer);
    await page.click('#modalConfirm');

    await page.waitForSelector('#fullScreenCheckBox', { timeout: 60000 });
    await page.click('#fullScreenCheckBox');
    await page.click('#modalConfirm');

    await page.waitForSelector('#tab1', { timeout: 60000 });

    // Decline onboarding so the tutorial overlay does not intercept pointer events.
    const cancel = page.locator('#modalCancel');
    if (await cancel.isVisible({ timeout: 3000 }).catch(() => false)) {
      const text = (await cancel.textContent())?.trim();
      if (text === 'NO') await cancel.click();
    }

    await this.waitForOverlayClear();
    await this.exposeModules();

    this.pioneer = pioneer;
    return this;
  }

  /** Wait until no full-screen overlay is intercepting clicks. */
  async waitForOverlayClear(timeout = 15000) {
    await this.page
      .waitForFunction(() => {
        const overlay = document.getElementById('overlay');
        if (!overlay) return true;
        const style = window.getComputedStyle(overlay);
        return style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0;
      }, null, { timeout })
      .catch(() => { /* some panes legitimately keep an overlay; specs assert their own state */ });
  }

  /** Import the game's real modules into page scope as globalThis.__mods. */
  async exposeModules() {
    await this.page.evaluate(async () => {
      if (globalThis.__mods) return;
      globalThis.__mods = {
        cg: await import('/constantsAndGlobalVars.js'),
        rdo: await import('/resourceDataObject.js'),
        game: await import('/game.js'),
        ach: await import('/achievements.js'),
        audio: await import('/audioManager.js'),
        loc: await import('/localization.js'),
        desc: await import('/descriptions.js'),
        timers: await import('/timerManagerDelta.js'),
        ui: await import('/ui.js')
      };
    });
  }

  /** Run a function in page context with the modules bound as the first argument. */
  async withMods(fn, arg = null) {
    return this.page.evaluate(
      ({ fnSrc, arg }) => {
        // eslint-disable-next-line no-new-func
        const f = new Function(`return (${fnSrc})`)();
        return f(globalThis.__mods, arg);
      },
      { fnSrc: fn.toString(), arg }
    );
  }

  /** Open a tab by its numeric index. */
  async openTab(index) {
    await this.page.evaluate((i) => {
      document.getElementById(`tab${i}`)?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }, index);
    await this.page.waitForTimeout(250);
  }

  /**
   * Open a side-menu pane by its visible label. Panes are gated behind unlock
   * state, so reveal the row first — specs assert unlock rules explicitly rather
   * than relying on visibility here.
   */
  async openPane(label) {
    const opened = await this.page.evaluate((label) => {
      const target = Array.from(document.querySelectorAll('p.inset-paragraph'))
        .find((el) => (el.textContent || '').trim().toLowerCase() === label.toLowerCase());
      if (!target) return false;
      target.classList.remove('invisible');
      target.closest('.row-side-menu')?.classList.remove('invisible');
      target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    }, label);
    await this.page.waitForTimeout(400);
    return opened;
  }

  /** Text of all currently visible notifications, optionally filtered by classification. */
  async notifications(classification = null) {
    return this.page.evaluate((cls) => {
      const sel = cls
        ? `.notification-container.classification-${cls}`
        : '.notification-container';
      return Array.from(document.querySelectorAll(sel))
        .map((el) => (el.textContent || '').trim())
        .filter(Boolean);
    }, classification);
  }

  /**
   * Advance the delta-timer system by a simulated duration, without real waiting.
   * Drives timerManagerDelta directly so rate maths is deterministic.
   */
  async advanceTimers(ms, multiplier = 1) {
    return this.withMods((mods, { ms, multiplier }) => {
      const tm = mods.timers?.timerManagerDelta;
      if (!tm) return { advanced: false, reason: 'timerManagerDelta not reachable' };
      tm.update(ms, multiplier);
      return { advanced: true, timerCount: tm.timers.size };
    }, { ms, multiplier });
  }

  /** Console/page errors captured so far, excluding known-noisy entries. */
  significantErrors() {
    return this.errors.filter((e) => !IGNORABLE_ERRORS.some((ig) => e.includes(ig)));
  }

  // ---------------------------------------------------------------- debug tools
  //
  // The game ships two in-built debug surfaces, both reachable because boot()
  // uses a `Test1981` pioneer name:
  //   Numpad -  (NumpadSubtract) -> #debugWindow, the scenario-setup menu
  //   Numpad *  (NumpadMultiply) -> #variableDebuggerWindow, the variable editor
  //
  // Prefer these over hand-seeding state: they set up scenarios the way the game
  // itself does, so a test exercises real wiring rather than a test-only fiction.

  /** Open the scenario-setup debug menu via its real hotkey. */
  async openDebugMenu() {
    await this.page.keyboard.press('NumpadSubtract');
    await this.page.waitForTimeout(150);
    return this.page.evaluate(() =>
      document.getElementById('debugWindow')?.style.display === 'block');
  }

  /** Open the variable editor via its real hotkey. */
  async openVariableDebugger() {
    await this.page.keyboard.press('NumpadMultiply');
    await this.page.waitForTimeout(150);
    return this.page.evaluate(() =>
      document.getElementById('variableDebuggerWindow')?.style.display === 'block');
  }

  /**
   * Click a debug-menu button by id. The handlers are bound at module load, so
   * the button works whether or not the window is visible.
   */
  async debugClick(buttonId, { times = 1, delayMs = 120 } = {}) {
    for (let i = 0; i < times; i++) {
      const found = await this.page.evaluate((id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        el.click();
        return true;
      }, buttonId);
      if (!found) throw new Error(`Debug button not found: ${buttonId}`);
      await this.page.waitForTimeout(delayMs);
    }
  }

  /** Set a debug <select> and click its associated action button. */
  async debugSelect(selectId, value) {
    const ok = await this.page.evaluate(({ selectId, value }) => {
      const sel = document.getElementById(selectId);
      if (!sel) return false;
      sel.value = String(value);
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      return sel.value === String(value);
    }, { selectId, value });
    if (!ok) throw new Error(`Could not set debug select ${selectId} to ${value}`);
  }

  /**
   * Run the game's own full scenario setup: cash, every resource and compound,
   * all techs, launch pad + scanner + rockets, asteroids, five studied stars,
   * antimatter, a built starship, and 30 fleets + envoy. Also sets a default
   * philosophy on run 1.
   *
   * This is the intended way to reach late-game state — it is the same chain a
   * developer triggers from the debug menu, so it keeps tests off bespoke setup.
   */
  async prepareRunForStarshipLaunch({ settleMs = 2500 } = {}) {
    await this.ensureCompoundRecipeTextInitialised();
    await this.debugClick('prepareRunForStarshipLaunchButton');
    // The handler is async and chains ~9 clicks with internal sleeps.
    await this.page.waitForTimeout(settleMs);
    await this.debugClick('unlockAllTabsButton').catch(() => {});
    await this.page.waitForTimeout(300);
  }

  /**
   * Works around a live game bug (see tests/docs/known-issues.md).
   *
   * `compoundCreateDropdownRecipeText` is declared as an arrow function and is
   * only replaced with a real object inside `resetAllVariablesOnRebirth()`, which
   * only runs from `rebirth()`. On run 1 it is therefore still a function, so
   * `getCompoundCreateDropdownRecipeText(key)` returns undefined.
   *
   * `addAchievementBonus` dereferences that result without a guard for any
   * achievement giving a `createCostCompounds` multiplier — `discoverAsteroid` is
   * one. The resulting TypeError is thrown inside `checkForAchievements()` within
   * `gameLoop()`, *before* its trailing `requestAnimationFrame(gameLoop)`, so the
   * frame loop dies permanently and the game silently freezes.
   *
   * Seeding the structure here is exactly what a rebirth would have done, and
   * keeps that bug from masking the behaviour each spec is actually testing.
   */
  async ensureCompoundRecipeTextInitialised() {
    await this.withMods((m) => {
      const compounds = Object.keys(m.rdo.getResourceDataObject('compounds') || {})
        .filter((k) => k !== 'version');
      const optionKeys = ['fillToCapacity', 'max', 'threeQuarters', 'twoThirds', 'half', 'oneThird'];

      for (const compound of compounds) {
        if (m.cg.getCompoundCreateDropdownRecipeText(compound)) continue;
        const seeded = {};
        for (const key of optionKeys) seeded[key] = { value: key, text: key };
        m.cg.setCompoundCreateDropdownRecipeText(compound, seeded);
      }
    });
  }

  /** Trigger the debug time warp at a given duration/multiplier. */
  async debugTimeWarp({ durationMs = 5000, multiplier = 50 } = {}) {
    await this.debugSelect('debugTimeWarpDurationSelect', durationMs);
    await this.debugSelect('debugTimeWarpMultiplierSelect', multiplier);
    await this.debugClick('debugTimeWarpButton');
  }
}

export const test = base.extend({
  game: async ({ page }, use, testInfo) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(`PAGEERROR: ${err.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`CONSOLE: ${msg.text()}`);
    });

    const harness = new GameHarness(page, errors);
    await use(harness);

    // Surface unexpected runtime errors as an attachment rather than failing the
    // test outright — specs that care assert on significantErrors() directly.
    const significant = harness.significantErrors();
    if (significant.length) {
      await testInfo.attach('console-errors.txt', {
        body: significant.join('\n'),
        contentType: 'text/plain'
      });
    }
  }
});

export { expect };
