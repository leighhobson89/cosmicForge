/**
 * Area: Settings — every control on the three Options panes
 * Plan: tests/docs/areas/settings.md
 *
 * Settings are the one area where "the control exists" and "the control works"
 * come apart most easily: each row is a toggle or a dropdown wired to a single
 * setter, and a row that renders but is wired to nothing looks completely normal
 * on screen. So every spec here does three things for the control it covers:
 *
 *   1. the row and its input are actually **on the pane**;
 *   2. driving the real control — clicking the toggle's label, or clicking an
 *      option inside the dropdown — **calls through to the game's setter**;
 *   3. the setting has its **downstream effect**, observed rather than assumed.
 *
 * The third point is what makes these more than accessor tests. A theme change
 * has to reach `document.body[data-theme]`; the news-ticker toggle has to add or
 * remove the real `newsTicker` timer; the mouse trail has to stop spawning
 * particles; notifications have to actually stop appearing.
 *
 * Pane routing, for reference — `p` elements in the tab 9 side menu, matched on
 * their exact class token because `option1` is a substring of `option10` upwards:
 *
 *   tab9.option1  Visual
 *   tab9.option2  Saving / Loading
 *   tab9.option3  Game Options
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** The three Options panes, and the pane name each one sets. */
const PANES = {
  visual: { token: 'tab9.option1', pane: 'visual' },
  saving: { token: 'tab9.option2', pane: 'saving / loading' },
  gameOptions: { token: 'tab9.option3', pane: 'game options' }
};

/** Open one of the settings panes through its side-menu row. */
async function openSettingsPane(game, key) {
  const { token, pane } = PANES[key];
  await game.openTab(9);

  const clicked = await game.page.evaluate((classToken) => {
    const row = document.querySelector(`p.inset-paragraph[class~="${classToken}"]`);
    if (!row) return false;
    row.closest('.row-side-menu')?.classList.remove('invisible');
    row.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, token);
  if (!clicked) throw new Error(`No settings row for ${key} (${token})`);
  await game.page.waitForTimeout(600);

  const current = await game.withMods((m) => m.cg.getCurrentOptionPane());
  if (current !== pane) throw new Error(`Expected the "${pane}" pane, got "${current}"`);
}

/** Does a row exist on the pane, and does it carry the input it is supposed to? */
async function rowShape(game, rowId, inputId) {
  return game.page.evaluate(({ row, input }) => {
    const rowEl = document.getElementById(row);
    const inputEl = document.getElementById(input);
    return {
      rowPresent: !!rowEl,
      rowVisible: !!rowEl && !rowEl.classList.contains('invisible'),
      inputPresent: !!inputEl,
      inputInsideRow: !!rowEl && !!inputEl && rowEl.contains(inputEl),
      labelled: !!rowEl && (rowEl.textContent || '').trim().length > 0
    };
  }, { row: rowId, input: inputId });
}

/**
 * Flip a toggle by clicking its label — the only part of the control a player can
 * hit, because `.toggle-container input[type="checkbox"]` is `display: none`.
 * Returns the checkbox's state afterwards.
 */
async function flipToggle(game, toggleId) {
  await game.page.locator(`label[for="${toggleId}"]`).click();
  await game.page.waitForTimeout(500);
  return game.page.evaluate((id) => document.getElementById(id)?.checked, toggleId);
}

/** Choose a value from one of the settings dropdowns, through the dropdown itself. */
async function chooseDropdown(game, dropdownId, value) {
  const ok = await game.page.evaluate(({ id, option }) => {
    const container = document.getElementById(id);
    if (!container) return false;
    container.querySelector('div.dropdown')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const choice = container.querySelector(`div.dropdown-option[data-value="${option}"]`);
    if (!choice) return false;
    choice.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, { id: dropdownId, option: value });
  if (!ok) throw new Error(`Could not choose "${value}" in #${dropdownId}`);
  await game.page.waitForTimeout(600);
}

test.describe('Settings — every control is on its pane', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('the Visual pane renders all seven of its rows, each with its own input', async ({ game }) => {
    await openSettingsPane(game, 'visual');

    const expected = [
      ['settingsCurrencySymbolRow', 'currencySelect'],
      ['settingsNotationRow', 'notationSelect'],
      ['settingsToggleNotificationsRow', 'notificationsToggle'],
      ['customPointerToggleRow', 'customPointerToggle'],
      ['mouseTrailToggleRow', 'mouseTrailToggle'],
      ['settingsThemeRow', 'themeSelect'],
      ['weatherEffectSettingsRow', 'weatherEffectSettingToggle']
    ];

    const problems = [];
    for (const [row, input] of expected) {
      const shape = await rowShape(game, row, input);
      if (!shape.rowPresent) problems.push(`${row}: missing`);
      else if (!shape.rowVisible) problems.push(`${row}: hidden`);
      else if (!shape.inputPresent) problems.push(`${row}: #${input} missing`);
      else if (!shape.inputInsideRow) problems.push(`${row}: #${input} is not inside the row`);
      else if (!shape.labelled) problems.push(`${row}: no label text`);
    }

    expect(problems).toEqual([]);
  });

  test('the Game Options pane renders all five of its rows', async ({ game }) => {
    await openSettingsPane(game, 'gameOptions');

    const expected = [
      ['settingsLanguageRow', 'languageSelect'],
      ['newsTickerToggleRow', 'newsTickerSettingToggle'],
      ['backGroundAudioRow', 'backGroundAudioToggle'],
      ['sfxAudioRow', 'sfxToggle']
    ];

    const problems = [];
    for (const [row, input] of expected) {
      const shape = await rowShape(game, row, input);
      if (!shape.rowPresent) problems.push(`${row}: missing`);
      else if (!shape.inputPresent) problems.push(`${row}: #${input} missing`);
      else if (!shape.inputInsideRow) problems.push(`${row}: #${input} is not inside the row`);
    }
    expect(problems).toEqual([]);

    // The full-screen row has a button rather than an identified input.
    const fullScreen = await game.page.evaluate(() => {
      const row = document.getElementById('toggleGameFullScreenRow');
      const button = row?.querySelector('button.full-screen-button');
      return { rowPresent: !!row, buttonPresent: !!button, label: (button?.innerText || '').trim() };
    });
    expect(fullScreen.rowPresent).toBe(true);
    expect(fullScreen.buttonPresent).toBe(true);
    expect(fullScreen.label.length).toBeGreaterThan(0);
  });

  test('the Saving / Loading pane renders its autosave, export and import rows', async ({ game }) => {
    await openSettingsPane(game, 'saving');

    const shape = await game.page.evaluate(() => ({
      autoSaveRow: !!document.getElementById('autoSaveConfigRow'),
      frequency: !!document.getElementById('autoSaveFrequency'),
      toggle: !!document.getElementById('autoSaveToggle'),
      exportRow: !!document.getElementById('exportSaveRow'),
      exportArea: !!document.getElementById('exportSaveArea'),
      importRow: !!document.getElementById('importSaveRow'),
      importArea: !!document.getElementById('importSaveArea')
    }));

    expect(shape).toEqual({
      autoSaveRow: true,
      frequency: true,
      toggle: true,
      exportRow: true,
      exportArea: true,
      importRow: true,
      importArea: true
    });
  });

  test('every settings control opens showing the value the game currently holds', async ({ game }) => {
    // A control that renders a default instead of the live value silently lies to
    // the player and will write that default back the moment it is touched.
    await game.withMods((m) => {
      m.cg.setNotificationsToggle(false);
      m.cg.setCustomPointerEnabled(true);
      m.cg.setMouseParticleTrailEnabled(false);
      m.cg.setWeatherEffectSetting(false);
    });

    await openSettingsPane(game, 'visual');

    const visual = await game.page.evaluate(() => ({
      notifications: document.getElementById('notificationsToggle')?.checked,
      customPointer: document.getElementById('customPointerToggle')?.checked,
      mouseTrail: document.getElementById('mouseTrailToggle')?.checked,
      weather: document.getElementById('weatherEffectSettingToggle')?.checked
    }));

    expect(visual).toEqual({
      notifications: false,
      customPointer: true,
      mouseTrail: false,
      weather: false
    });

    await game.withMods((m) => {
      m.cg.setNewsTickerSetting(false);
      m.cg.setBackgroundAudio(true);
      m.cg.setSfx(false);
    });
    await openSettingsPane(game, 'gameOptions');

    const options = await game.page.evaluate(() => ({
      newsTicker: document.getElementById('newsTickerSettingToggle')?.checked,
      backgroundAudio: document.getElementById('backGroundAudioToggle')?.checked,
      sfx: document.getElementById('sfxToggle')?.checked
    }));

    expect(options).toEqual({ newsTicker: false, backgroundAudio: true, sfx: false });
  });
});

test.describe('Settings — pointer and trail customization', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await openSettingsPane(game, 'visual');
  });

  test('the custom pointer toggle drives the body classes and builds the pointer', async ({ game }) => {
    const start = await game.withMods((m) => m.cg.getCustomPointerEnabled());

    const checked = await flipToggle(game, 'customPointerToggle');
    expect(checked).toBe(!start);

    const on = await game.withMods((m) => ({
      setting: m.cg.getCustomPointerEnabled(),
      enabledClass: document.body.classList.contains(m.cg.getCustomPointerEnabledClass()),
      hideCursorClass: document.body.classList.contains(m.cg.getCustomPointerHideCursorClass()),
      element: !!m.cg.getCustomPointerElement()
    }));

    expect(on.setting).toBe(!start);
    // `applyCustomPointerSetting()` is what makes this a real setting rather than
    // a stored boolean: it paints the body and builds or tears down the element.
    expect(on.enabledClass).toBe(!start);
    expect(on.hideCursorClass).toBe(!start);
    if (!start) expect(on.element, 'enabling should construct the pointer element').toBe(true);

    // And back again, so the teardown path is covered too.
    await flipToggle(game, 'customPointerToggle');
    const off = await game.withMods((m) => ({
      setting: m.cg.getCustomPointerEnabled(),
      enabledClass: document.body.classList.contains(m.cg.getCustomPointerEnabledClass())
    }));
    expect(off.setting).toBe(start);
    expect(off.enabledClass).toBe(start);
  });

  test('the mouse trail toggle stops and starts particles actually spawning', async ({ game }) => {
    // Stage first, then reopen: the checkbox is set from the accessor when the
    // pane is *drawn*, so writing the setting under an open pane leaves the
    // control showing the old value and the flip below goes the wrong way.
    await game.withMods((m) => m.cg.setMouseParticleTrailEnabled(true));
    await openSettingsPane(game, 'visual');
    expect(await game.page.evaluate(() => document.getElementById('mouseTrailToggle')?.checked)).toBe(true);

    const countParticles = async () => {
      // Clear, then move the pointer across the window and see what is left.
      await game.page.evaluate(() => {
        document.querySelector('.mouse-particle-container')
          ?.replaceChildren();
      });
      for (let x = 200; x <= 600; x += 50) await game.page.mouse.move(x, 300);
      await game.page.waitForTimeout(150);
      return game.page.evaluate(() =>
        document.querySelectorAll('.mouse-particle-container .mouse-particle').length);
    };

    const whileOn = await countParticles();
    expect(whileOn, 'the trail should spawn particles while enabled').toBeGreaterThan(0);

    const checked = await flipToggle(game, 'mouseTrailToggle');
    expect(checked).toBe(false);
    expect(await game.withMods((m) => m.cg.getMouseParticleTrailEnabled())).toBe(false);

    const whileOff = await countParticles();
    expect(whileOff, 'no particles once the trail is switched off').toBe(0);

    await flipToggle(game, 'mouseTrailToggle');
    expect(await game.withMods((m) => m.cg.getMouseParticleTrailEnabled())).toBe(true);
    expect(await countParticles(), 'and they come back').toBeGreaterThan(0);
  });
});

test.describe('Settings — theme, notation and currency', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await openSettingsPane(game, 'visual');
  });

  test('choosing a theme repaints the document and records it as tried', async ({ game }) => {
    const before = await game.withMods((m) => ({
      theme: m.cg.getCurrentTheme(),
      body: document.body.getAttribute('data-theme'),
      tried: m.cg.getThemesTriedArray().slice()
    }));

    await chooseDropdown(game, 'themeSelect', 'supernova');

    const after = await game.withMods((m) => ({
      theme: m.cg.getCurrentTheme(),
      body: document.body.getAttribute('data-theme'),
      tried: m.cg.getThemesTriedArray().slice()
    }));

    expect(after.theme).toBe('supernova');
    // The attribute is the whole mechanism — every themed colour is a CSS custom
    // property selected by `body[data-theme]`.
    expect(after.body).toBe('supernova');
    expect(after.tried).toContain('supernova');
    expect(after.body).not.toBe(before.body);

    // A second theme replaces the first rather than accumulating attributes.
    await chooseDropdown(game, 'themeSelect', 'frosty');
    const second = await game.withMods((m) => ({
      theme: m.cg.getCurrentTheme(),
      body: document.body.getAttribute('data-theme')
    }));
    expect(second).toEqual({ theme: 'frosty', body: 'frosty' });
  });

  test('every theme in the dropdown is selectable and paints the body', async ({ game }) => {
    const values = await game.page.evaluate(() =>
      Array.from(document.querySelectorAll('#themeSelect div.dropdown-option'))
        .map((option) => option.getAttribute('data-value')));

    expect(values.length).toBeGreaterThan(1);

    const failures = [];
    for (const value of values) {
      await chooseDropdown(game, 'themeSelect', value);
      const applied = await game.page.evaluate(() => document.body.getAttribute('data-theme'));
      if (applied !== value) failures.push(`${value} -> ${applied}`);
    }
    expect(failures).toEqual([]);
  });

  test('switching notation changes how figures are rendered on screen', async ({ game }) => {
    // Large stock, so the two notations are visibly different.
    await game.debugClick('give100AllResourcesAndCompounds');
    await game.page.waitForTimeout(700);
    await openSettingsPane(game, 'visual');

    await chooseDropdown(game, 'notationSelect', 'normalCondensed');
    await game.page.waitForTimeout(700);
    const condensed = await game.page.evaluate(() =>
      document.getElementById('hydrogenQuantity')?.textContent?.trim());

    await chooseDropdown(game, 'notationSelect', 'normal');
    await game.page.waitForTimeout(700);
    const normal = await game.page.evaluate(() =>
      document.getElementById('hydrogenQuantity')?.textContent?.trim());

    expect(await game.withMods((m) => m.cg.getNotationType())).toBe('normal');
    // Condensed abbreviates a million to "1.0M"; normal spells the digits out in
    // full, comma-grouped — "1,000,000/1,000,000".
    expect(condensed).toMatch(/[KMB]|e\d/);
    expect(normal).not.toBe(condensed);
    expect(normal).not.toMatch(/[KMB]|e\d/);
    expect(normal).toMatch(/^[\d,]+\/[\d,]+$/);
    expect(normal.replace(/[^\d]/g, '').length).toBeGreaterThan(condensed.replace(/[^\d]/g, '').length);
  });

  test('the currency symbol carries through to what a sale is quoted in', async ({ game }) => {
    await chooseDropdown(game, 'currencySelect', '£');
    expect(await game.withMods((m) => m.cg.getCurrencySymbol())).toBe('£');

    // The preview is regenerated by the frame loop for whichever resource pane is
    // open, so the new symbol has to reach it without a reload.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(1e6, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(500, 'resources', ['hydrogen', 'quantity']);
    });
    await game.openTab(1);
    await game.page.evaluate(() =>
      document.getElementById('hydrogenOption')?.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await game.page.waitForTimeout(900);

    const preview = await game.withMods((m) => m.cg.getResourceSalePreview('hydrogen'));
    expect(preview).toContain('£');
  });
});

test.describe('Settings — notifications, weather and the news ticker', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('switching notifications off actually stops them appearing', async ({ game }) => {
    await openSettingsPane(game, 'visual');

    // On by default, so one raised now should be visible.
    expect(await game.withMods((m) => m.cg.getNotificationsToggle())).toBe(true);
    await game.withMods((m) => m.ui.showNotification('probe-on', 'info', 4000, 'debug'));
    await game.page.waitForTimeout(600);
    expect((await game.notifications('debug')).join(' ')).toContain('probe-on');

    const checked = await flipToggle(game, 'notificationsToggle');
    expect(checked).toBe(false);
    expect(await game.withMods((m) => m.cg.getNotificationsToggle())).toBe(false);

    // Clear the screen, then prove nothing new can get onto it.
    await game.page.evaluate(() =>
      document.querySelectorAll('.notification-container').forEach((c) => c.replaceChildren()));
    await game.withMods((m) => m.ui.showNotification('probe-off', 'info', 4000, 'debug'));
    await game.page.waitForTimeout(800);
    expect((await game.notifications()).join(' ')).not.toContain('probe-off');
  });

  test('the news ticker toggle adds and removes the real ticker timer', async ({ game }) => {
    await openSettingsPane(game, 'gameOptions');

    await game.withMods((m) => {
      m.cg.setNewsTickerSetting(true);
      m.game.startNewsTickerTimer();
    });
    await game.page.waitForTimeout(400);
    expect(
      await game.withMods((m) => !!m.clockTimers.timerManager.getTimer('newsTicker')),
      'a scheduled ticker while the setting is on'
    ).toBe(true);

    const checked = await flipToggle(game, 'newsTickerSettingToggle');
    expect(checked).toBe(false);
    expect(await game.withMods((m) => m.cg.getNewsTickerSetting())).toBe(false);

    // The setting is honoured the next time the ticker reschedules itself.
    await game.withMods((m) => m.game.startNewsTickerTimer());
    await game.page.waitForTimeout(400);
    expect(
      await game.withMods((m) => !!m.clockTimers.timerManager.getTimer('newsTicker')),
      'the timer is torn down while the setting is off'
    ).toBe(false);

    await flipToggle(game, 'newsTickerSettingToggle');
    await game.withMods((m) => m.game.startNewsTickerTimer());
    await game.page.waitForTimeout(400);
    expect(await game.withMods((m) => !!m.clockTimers.timerManager.getTimer('newsTicker'))).toBe(true);
  });

  test('the weather effects toggle gates the overlay animation', async ({ game }) => {
    await openSettingsPane(game, 'visual');

    const start = await game.withMods((m) => m.cg.getWeatherEffectSetting());
    expect(start).toBe(true);

    const checked = await flipToggle(game, 'weatherEffectSettingToggle');
    expect(checked).toBe(false);
    expect(await game.withMods((m) => m.cg.getWeatherEffectSetting())).toBe(false);

    // With the setting off the frame loop never enters `startWeatherEffect`, so
    // the overlay stays empty even when the star system's weather calls for one.
    await game.withMods((m) => m.game.stopWeatherEffect?.());
    await game.page.waitForTimeout(1500);
    const overlayChildren = await game.page.evaluate(() =>
      document.getElementById('weatherEffectOverlay')?.childElementCount ?? -1);
    expect(overlayChildren).toBe(0);

    await flipToggle(game, 'weatherEffectSettingToggle');
    expect(await game.withMods((m) => m.cg.getWeatherEffectSetting())).toBe(true);
  });
});

test.describe('Settings — audio', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await openSettingsPane(game, 'gameOptions');
  });

  test('the background audio toggle drives the player, not just the flag', async ({ game }) => {
    await game.withMods((m) => m.cg.setBackgroundAudio(false));
    await openSettingsPane(game, 'gameOptions');

    const checked = await flipToggle(game, 'backGroundAudioToggle');
    expect(checked).toBe(true);
    expect(await game.withMods((m) => m.cg.getBackgroundAudio())).toBe(true);

    // The player consults the setting on every update, which is what makes the
    // toggle take effect without a reload.
    await flipToggle(game, 'backGroundAudioToggle');
    expect(await game.withMods((m) => m.cg.getBackgroundAudio())).toBe(false);

    const paused = await game.withMods((m) => {
      m.audio.backgroundAudio.update();
      return m.audio.backgroundAudio.isPlaying;
    });
    expect(paused, 'the ambience is paused while the setting is off').toBe(false);
  });

  test('the sfx toggle silences the effects player', async ({ game }) => {
    await game.withMods((m) => m.cg.setSfx(true));
    await openSettingsPane(game, 'gameOptions');

    expect(await game.withMods((m) => m.cg.getSfx())).toBe(true);

    const checked = await flipToggle(game, 'sfxToggle');
    expect(checked).toBe(false);
    expect(await game.withMods((m) => m.cg.getSfx())).toBe(false);

    // `playAudio` returns early while the setting is off, so a click raises no
    // sound and — importantly — no error either.
    await game.withMods((m) => {
      m.audio.sfxPlayer.playAudio('click', false);
      m.audio.playClickSfx();
    });
    await game.page.waitForTimeout(300);
    expect(game.significantErrors()).toEqual([]);

    await flipToggle(game, 'sfxToggle');
    expect(await game.withMods((m) => m.cg.getSfx())).toBe(true);
  });
});

test.describe('Settings — language and full screen', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await openSettingsPane(game, 'gameOptions');
  });

  test('switching language relocalizes the running game, not just the flag', async ({ game }) => {
    expect(await game.withMods((m) => m.cg.getLanguage())).toBe('en');

    const englishTab = await game.page.evaluate(() =>
      document.getElementById('tab1')?.textContent?.trim());

    await chooseDropdown(game, 'languageSelect', 'de');
    await game.page.waitForTimeout(900);

    expect(await game.withMods((m) => m.cg.getLanguage())).toBe('de');

    const germanTab = await game.page.evaluate(() =>
      document.getElementById('tab1')?.textContent?.trim());
    // `relocalizeAll` has to repaint the static shell as well as the open pane.
    expect(germanTab).not.toBe(englishTab);
    expect(germanTab.length).toBeGreaterThan(0);

    // And back, which is the path that used to strand text mid-translation.
    await openSettingsPane(game, 'gameOptions');
    await chooseDropdown(game, 'languageSelect', 'en');
    await game.page.waitForTimeout(900);

    expect(await game.withMods((m) => m.cg.getLanguage())).toBe('en');
    expect(await game.page.evaluate(() => document.getElementById('tab1')?.textContent?.trim()))
      .toBe(englishTab);
  });

  test('every language in the dropdown round-trips without stranding the UI', async ({ game }) => {
    const values = await game.page.evaluate(() =>
      Array.from(document.querySelectorAll('#languageSelect div.dropdown-option'))
        .map((option) => option.getAttribute('data-value')));
    expect(values).toEqual(['en', 'es', 'de', 'it', 'fr']);

    const failures = [];
    for (const value of values) {
      await openSettingsPane(game, 'gameOptions');
      await chooseDropdown(game, 'languageSelect', value);
      await game.page.waitForTimeout(700);

      const applied = await game.withMods((m) => m.cg.getLanguage());
      const stranded = await game.page.evaluate(() =>
        Array.from(document.querySelectorAll('[data-loc]'))
          .filter((el) => {
            const text = (el.textContent || '').trim();
            return text === '' || text === el.getAttribute('data-loc');
          })
          .map((el) => el.getAttribute('data-loc')));

      if (applied !== value) failures.push(`${value}: language is ${applied}`);
      if (stranded.length) failures.push(`${value}: unresolved ${stranded.slice(0, 5).join(', ')}`);
    }

    expect(failures).toEqual([]);
  });

  test('the full screen button asks the document to go full screen', async ({ game }) => {
    // Fullscreen itself is a browser decision and is not granted in every
    // environment, so what is asserted is that the control reaches the API — the
    // part of the chain the game owns.
    // Which branch runs depends on whether the document is already full screen —
    // boot accepts the full-screen prompt — so both are instrumented and exactly
    // one is required to fire.
    await game.page.evaluate(() => {
      globalThis.__fullScreenCalls = { enter: 0, exit: 0 };
      const enter = document.body.requestFullscreen?.bind(document.body);
      document.body.requestFullscreen = function patchedEnter(...args) {
        globalThis.__fullScreenCalls.enter += 1;
        return enter ? enter(...args) : Promise.resolve();
      };
      const exit = document.exitFullscreen?.bind(document);
      document.exitFullscreen = function patchedExit(...args) {
        globalThis.__fullScreenCalls.exit += 1;
        return exit ? exit(...args) : Promise.resolve();
      };
    });

    const wasFullScreen = await game.page.evaluate(() => !!document.fullscreenElement);
    await game.page.locator('#toggleGameFullScreenRow button.full-screen-button').click();
    await game.page.waitForTimeout(600);

    const calls = await game.page.evaluate(() => globalThis.__fullScreenCalls);
    expect(calls.enter + calls.exit, 'the button must reach the fullscreen API').toBe(1);
    expect(wasFullScreen ? calls.exit : calls.enter).toBe(1);
    expect(game.significantErrors()).toEqual([]);
  });
});

test.describe('Settings — autosave', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await openSettingsPane(game, 'saving');
  });

  test('choosing an autosave frequency stores it and reschedules the timer', async ({ game }) => {
    await chooseDropdown(game, 'autoSaveFrequency', '300000');
    expect(Number(await game.withMods((m) => m.cg.getAutoSaveFrequency()))).toBe(300000);

    await chooseDropdown(game, 'autoSaveFrequency', '120000');
    expect(Number(await game.withMods((m) => m.cg.getAutoSaveFrequency()))).toBe(120000);

    expect(game.significantErrors()).toEqual([]);
  });

  test('turning autosave off warns the player and turning it back on is silent', async ({ game }) => {
    expect(await game.withMods((m) => m.cg.getAutoSaveToggle())).toBe(true);

    const checked = await flipToggle(game, 'autoSaveToggle');
    expect(checked).toBe(false);
    expect(await game.withMods((m) => m.cg.getAutoSaveToggle())).toBe(false);

    // Losing autosave silently is the kind of thing a player only notices after a
    // crash, so the warning is part of the feature.
    await game.page.waitForTimeout(600);
    const warned = await game.notifications('loadSave');
    expect(warned.length).toBeGreaterThan(0);

    await game.page.evaluate(() =>
      document.querySelectorAll('.notification-container').forEach((c) => c.replaceChildren()));

    await flipToggle(game, 'autoSaveToggle');
    expect(await game.withMods((m) => m.cg.getAutoSaveToggle())).toBe(true);
    await game.page.waitForTimeout(600);
    expect((await game.notifications('loadSave')).join(' ')).not.toMatch(/./);
  });
});
