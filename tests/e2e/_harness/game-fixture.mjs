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
  async boot({
    pioneer = `Test1981_e2e_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
    acceptOnboarding = false,
    language = null
  } = {}) {
    const { page } = this;

    // The language is read from localStorage before the first frame is drawn, so
    // it has to be seeded ahead of the navigation to be picked up for boot text.
    if (language) {
      await page.addInitScript((lang) => {
        try { window.localStorage.setItem('cosmicForgeLanguage', lang); } catch { /* storage blocked */ }
      }, language);
    }

    // The first navigation is retried once.
    //
    // Under parallel workers a first load is occasionally lost outright — the
    // static server or the machine is saturated — and the failure that produces
    // is a 60s timeout waiting for #pioneerCodeName, which is indistinguishable
    // from the app being broken. One retry separates the two: a genuinely broken
    // app fails the second attempt as well, while a dropped load recovers. The
    // retry is deliberately confined to the pioneer prompt, the very first thing
    // the page paints; nothing later in boot is retried, so a real fault further
    // in still fails as it should.
    let promptShownAfterNavigation = false;
    for (let attempt = 0; attempt < 2; attempt++) {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      promptShownAfterNavigation = await page
        .waitForSelector('#pioneerCodeName', { timeout: attempt === 0 ? 30000 : 60000 })
        .then(() => true)
        .catch(() => false);
      if (promptShownAfterNavigation) break;
    }
    if (!promptShownAfterNavigation) {
      throw new Error('The pioneer prompt never appeared, across two navigations');
    }
    await page.fill('#pioneerCodeName', pioneer);
    await page.click('#modalConfirm');

    await page.waitForSelector('#fullScreenCheckBox', { timeout: 60000 });
    await page.click('#fullScreenCheckBox');
    await page.click('#modalConfirm');

    await page.waitForSelector('#tab1', { timeout: 60000 });

    // Decline onboarding so the tutorial overlay does not intercept pointer
    // events. The label is localized, so match against every shipped form of
    // "no" rather than the English one — a boot in German would otherwise leave
    // the tutorial running and swallow every subsequent click.
    //
    // The onboarding specs pass acceptOnboarding to take the other branch, which
    // is the only way to reach the tutorial through its real prompt.
    // The onboarding prompt is identified by its *cancel* button reading "no" in
    // some language. #modalConfirm is reused by the two earlier boot modals and
    // is already on screen, so waiting on that would click the wrong dialog.
    //
    // This has to be waitFor, not isVisible: `locator.isVisible()` resolves
    // against the current DOM and does not wait, whatever timeout is passed, so
    // an immediate check races the prompt that appears once loadGameFromCloud()
    // has settled and often misses it.
    const cancel = page.locator('#modalCancel');
    let promptShown = await cancel
      .waitFor({ state: 'visible', timeout: 10000 })
      .then(() => true)
      .catch(() => false);

    if (promptShown) {
      const text = (await cancel.textContent())?.trim().toUpperCase();
      promptShown = ['NO', 'NEIN', 'NON', 'NÃO'].includes(text);
    }

    if (promptShown) {
      await page.click(acceptOnboarding ? '#modalConfirm' : '#modalCancel');
    } else if (acceptOnboarding) {
      throw new Error('Onboarding prompt did not appear, so it could not be accepted');
    }

    if (!acceptOnboarding) await this.waitForOverlayClear();
    await this.exposeModules();

    this.pioneer = pioneer;
    this.language = language;
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
        // Shared string/number helpers. `capitaliseWordsWithRomanNumerals` in
        // particular is how the game turns a star data key back into the DOM id
        // the map drew it with, and multi-word names make naive capitalisation
        // wrong.
        util: await import('/utilityFunctions.js'),
        timers: await import('/timerManagerDelta.js'),
        // The non-delta timerManager schedules wall-clock work such as the news
        // ticker, and is a different instance from `timers` above.
        clockTimers: await import('/timerManager.js'),
        ui: await import('/ui.js'),
        rip: await import('/cosmicRip.js'),
        saveLoad: await import('/saveLoadGame.js'),
        casino: await import('/casino.js'),
        onboarding: await import('/onboarding.js'),
        events: await import('/events.js'),
        // The save-version migration chain. Exposed for the specs that have
        // to prove an old save is carried forward correctly, which cannot be
        // asserted from the loaded game state alone.
        patches: await import('/patches.js')
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
   * Set a variable through the real variable-debugger UI (Numpad *).
   *
   * Drives the same path a developer uses: search for the variable, click its
   * value to open the inline editor, type the new value, submit.
   *
   * Two things force the shape of this helper. First, `populateVariableDebugger()`
   * rebuilds every row on every frame while the window is open, so a resolved
   * element handle is detached before a normal Playwright click can land — the
   * click therefore goes to a screen coordinate, where whichever freshly built
   * row occupies that spot carries the same handler. Second, the click must be a
   * real one rather than a dispatched PointerEvent, because the handlers call
   * `setPointerCapture(e.pointerId)`, which throws NotFoundError for a synthetic
   * pointer id and would abort the handler before it opened the editor.
   *
   * The inline editor row itself is deliberately preserved across repaints by
   * the game (so typing is possible at all), so it can be driven normally.
   */
  async setDebugVariable(label, value) {
    const { page } = this;

    const alreadyOpen = await page.evaluate(() =>
      document.getElementById('variableDebuggerWindow')?.style.display === 'block');
    if (!alreadyOpen) {
      const opened = await this.openVariableDebugger();
      if (!opened) throw new Error('Variable debugger did not open');
    }

    // Use the debugger's own search bar to bring the row into view; the
    // scrolling container is an ancestor of the rebuilt rows, so the scroll
    // position survives the repaint.
    await page.fill('#variableDebuggerSearch', label);
    await page.waitForTimeout(250);

    // The value is the last child of the row; take its centre as a coordinate.
    const point = await page.evaluate((label) => {
      const row = document.querySelector(`[data-variable-debugger-label="${label}"]`);
      const valueEl = row?.lastElementChild;
      if (!valueEl) return null;
      const r = valueEl.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return null;
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }, label);
    if (!point) throw new Error(`Variable debugger row not visible: ${label}`);

    await page.mouse.click(point.x, point.y);

    const editor = page.locator('.variable-debugger-inline-editor-row').first();
    await editor.waitFor({ state: 'visible', timeout: 15000 });
    await editor.locator('textarea').fill(String(value));
    await editor.locator('button.variable-debugger-inline-editor-button').first().click();
    await page.waitForTimeout(200);
  }

  /** Close the variable debugger if it is open, so it stops repainting each frame. */
  async closeVariableDebugger() {
    const open = await this.page.evaluate(() =>
      document.getElementById('variableDebuggerWindow')?.style.display === 'block');
    if (open) await this.openVariableDebugger();
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
    await this.debugClick('prepareRunForStarshipLaunchButton');
    // The handler is async and chains ~9 clicks with internal sleeps.
    await this.page.waitForTimeout(settleMs);
    await this.debugClick('unlockAllTabsButton').catch(() => {});
    await this.page.waitForTimeout(300);
  }

  /** Trigger the debug time warp at a given duration/multiplier. */
  async debugTimeWarp({ durationMs = 5000, multiplier = 50 } = {}) {
    await this.debugSelect('debugTimeWarpDurationSelect', durationMs);
    await this.debugSelect('debugTimeWarpMultiplierSelect', multiplier);
    await this.debugClick('debugTimeWarpButton');
  }
}

/** Per-step delay in ms, set by tests/run-e2e.mjs from `--slow --headed`. */
const SLOW_MS = Number(process.env.E2E_SLOWMO) || 0;

/**
 * Pace the steps `launchOptions.slowMo` does not reach.
 *
 * Playwright's own slowMo pauses before each *input* operation — clicks, fills,
 * key presses, locator waits — and that is genuinely useful, so it stays on. But
 * it does nothing for `page.evaluate`, and this suite is mostly `page.evaluate`:
 * every `withMods` call, every class-list read, every dispatched click goes
 * through it. That is why slow mode looked like it barely did anything.
 *
 * Overriding `evaluate` once, here, gives the remaining steps the same pacing,
 * so a `--slow` run advances at a followable rate whichever style a spec uses.
 */
function paceEvaluate(page) {
  if (!SLOW_MS) return;

  for (const method of ['evaluate', 'evaluateHandle']) {
    const original = page[method].bind(page);
    page[method] = async (...args) => {
      const result = await original(...args);
      await new Promise((resolve) => setTimeout(resolve, SLOW_MS));
      return result;
    };
  }
}

export const test = base.extend({
  game: async ({ page }, use, testInfo) => {
    // Slow mode pauses before every Playwright operation, so a spec that runs in
    // 30 seconds can take several minutes. Specs set their own budgets with
    // `test.setTimeout(...)` at describe level, which would otherwise override
    // the config and cut a slow run short — clearing it here wins, because
    // fixture setup runs after that value has been applied. A slow run is being
    // watched by hand, so there is nothing useful for a timeout to protect.
    if (SLOW_MS) testInfo.setTimeout(0);
    paceEvaluate(page);

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
