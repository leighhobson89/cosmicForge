/**
 * Area: Localization
 * Plan: tests/docs/areas/localization.md
 * Feature status: docs/localization/status.md (items 3 and 4)
 *
 * Runtime language switching: the player-facing selector in Settings, the debug
 * panel switcher, and the single `relocalizeAll()` redraw path both of them go
 * through.
 *
 * These specs drive the real custom dropdown rather than calling `relocalizeAll`
 * directly wherever the point is the player's path — a switcher that is wired to
 * nothing looks identical to a working one from the module side.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

const STORAGE_KEY = 'cosmicForgeLanguage';

const LANGUAGE_OPTIONS = [
  { value: 'en', text: 'English', label: 'Language:', resources: 'Resources' },
  { value: 'es', text: 'Español', label: 'Idioma:', resources: 'Recursos' },
  { value: 'de', text: 'Deutsch', label: 'Sprache:', resources: 'Ressourcen' },
  { value: 'it', text: 'Italiano', label: 'Lingua:', resources: 'Risorse' },
  { value: 'fr', text: 'Français', label: 'Langue :', resources: 'Ressources' }
];

/**
 * Open a side-menu pane by its stable class token.
 *
 * The visible label is localized, so matching on text would only work in
 * English — precisely the language these specs spend most of their time out of.
 * The `tabN.optionM` class token is language-independent and is what the game's
 * own listeners bind to.
 */
async function openPaneByToken(game, tabIndex, optionToken) {
  await game.openTab(tabIndex);
  const clicked = await game.page.evaluate((token) => {
    const target = document.querySelector(`[class~="${token}"]`);
    if (!target) return false;
    target.classList.remove('invisible');
    target.closest('.row-side-menu')?.classList.remove('invisible');
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, optionToken);
  await game.page.waitForTimeout(400);
  return clicked;
}

/** Open Settings → Game Options, where the language selector lives. */
async function openGameOptions(game) {
  const opened = await openPaneByToken(game, 9, 'tab9.option3');
  expect(opened, 'Game Options pane not found in the tab 9 side menu').toBe(true);
  await game.page.waitForSelector('#languageSelect', { timeout: 10000 });
}

/**
 * Select a pane before calling `relocalizeAll` directly.
 *
 * `getCurrentOptionPane()` is `null` until the player opens their first pane,
 * and every `drawTabNContent()` dereferences it without a guard, so a bare
 * `relocalizeAll()` on a freshly booted tab 1 throws inside the redraw — see
 * tests/docs/known-issues.md #5. Nothing a player can do reaches that state (the
 * Settings selector always runs with `game options` active), so these specs open
 * a pane first, which is what any real language change does.
 */
async function openHydrogenPane(game) {
  const opened = await openPaneByToken(game, 1, 'tab1.option1');
  expect(opened, 'Hydrogen pane not found in the tab 1 side menu').toBe(true);
}

/** Pick a language through the real dropdown component the player uses. */
async function selectLanguageInUi(game, value) {
  await game.page.evaluate((val) => {
    const option = document.querySelector(`#languageSelect .dropdown-option[data-value="${val}"]`);
    if (!option) throw new Error(`language option "${val}" not present in the dropdown`);
    option.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, value);
  // relocalizeAll is async and redraws the pane it was clicked in.
  await game.page.waitForTimeout(700);
}

test.describe('Localization — runtime language switching', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('Game Options offers all five languages, each named in its own language', async ({ game }) => {
    await openGameOptions(game);

    const dropdown = await game.page.evaluate(() => {
      const container = document.getElementById('languageSelect');
      return {
        present: Boolean(container),
        current: container?.querySelector('.dropdown-text')?.textContent?.trim(),
        options: Array.from(container?.querySelectorAll('.dropdown-option') ?? []).map((el) => ({
          value: el.getAttribute('data-value'),
          text: el.textContent.trim()
        }))
      };
    });

    expect(dropdown.present).toBe(true);
    expect(dropdown.options).toEqual(LANGUAGE_OPTIONS.map(({ value, text }) => ({ value, text })));
    // The control must open showing what is actually active, not a fixed default.
    const active = await game.withMods((m) => m.cg.getLanguage());
    expect(dropdown.current).toBe(LANGUAGE_OPTIONS.find((o) => o.value === active).text);
  });

  test('the language row is labelled and described from the catalogue', async ({ game }) => {
    await openGameOptions(game);

    const row = await game.page.evaluate(() => {
      const container = document.getElementById('languageSelect');
      const mainRow = container?.closest('.main-row') ?? container?.parentElement?.parentElement;
      return {
        text: (mainRow?.parentElement?.innerText ?? '').trim()
      };
    });

    const active = await game.withMods((m) => m.cg.getLanguage());
    const expected = LANGUAGE_OPTIONS.find((o) => o.value === active);
    expect(row.text).toContain(expected.label);
  });

  test('selecting German through the dropdown applies immediately', async ({ game, page }) => {
    await openGameOptions(game);
    await selectLanguageInUi(game, 'de');

    const state = await page.evaluate((key) => ({
      dropdownText: document.querySelector('#languageSelect .dropdown-text')?.textContent?.trim(),
      paneText: document.getElementById('optionContentTab9')?.innerText ?? '',
      tabLabel: document.getElementById('tab1Intro')?.innerText?.trim(),
      stored: localStorage.getItem(key)
    }), STORAGE_KEY);

    const active = await game.withMods((m) => m.cg.getLanguage());

    expect(active).toBe('de');
    expect(state.dropdownText).toBe('Deutsch');
    // The pane redraws itself, so its own label must come back in German.
    expect(state.paneText).toContain('Sprache:');
    // ...and a label outside the redrawn pane must change too, or only the
    // active subtree is being relocalized.
    expect(state.tabLabel).toBe('Ressourcen');
    expect(state.stored).toBe('de');
  });

  test('every language can be selected and reports the right labels', async ({ game, page }) => {
    await openGameOptions(game);

    const observed = [];
    for (const option of LANGUAGE_OPTIONS) {
      await selectLanguageInUi(game, option.value);
      observed.push(await page.evaluate(() => ({
        dropdownText: document.querySelector('#languageSelect .dropdown-text')?.textContent?.trim(),
        paneText: document.getElementById('optionContentTab9')?.innerText ?? '',
        tabLabel: document.getElementById('tab1Intro')?.innerText?.trim()
      })));
    }

    const problems = [];
    LANGUAGE_OPTIONS.forEach((option, i) => {
      if (observed[i].dropdownText !== option.text) {
        problems.push(`${option.value}: dropdown showed "${observed[i].dropdownText}"`);
      }
      if (!observed[i].paneText.includes(option.label)) {
        problems.push(`${option.value}: pane missing label "${option.label}"`);
      }
      if (observed[i].tabLabel !== option.resources) {
        problems.push(`${option.value}: tab 1 header showed "${observed[i].tabLabel}"`);
      }
    });

    expect(problems).toEqual([]);
  });

  test('a language chosen in Settings survives a full restart', async ({ game, page }) => {
    await openGameOptions(game);
    await selectLanguageInUi(game, 'it');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#pioneerCodeName', { timeout: 60000 });
    await game.exposeModules();

    const after = await game.withMods((m) => m.cg.getLanguage());
    const stored = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);

    expect(after).toBe('it');
    expect(stored).toBe('it');
  });

  test('relocalizeAll reports the resolved language and that it redrew', async ({ game }) => {
    await openHydrogenPane(game);
    const result = await game.withMods((m) => m.ui.relocalizeAll('fr'));

    expect(result.resolved).toBe('fr');
    // A false here means the content container was missing, which would leave
    // the player looking at the previous language's pane.
    expect(result.redrew).toBe(true);
  });

  test('relocalizeAll normalises a regional tag before applying it', async ({ game }) => {
    await openHydrogenPane(game);
    const result = await game.withMods((m) => m.ui.relocalizeAll('es-419'));
    const active = await game.withMods((m) => m.cg.getLanguage());

    expect(result.resolved).toBe('es');
    expect(active).toBe('es');
  });

  test('relocalizeAll with an unsupported tag leaves the current language in place', async ({ game }) => {
    await openHydrogenPane(game);
    await game.withMods((m) => m.ui.relocalizeAll('de'));
    const result = await game.withMods((m) => m.ui.relocalizeAll('klingon'));
    const active = await game.withMods((m) => m.cg.getLanguage());

    // Falls through to the stored preference, which the previous call just set.
    expect(result.resolved).toBe('de');
    expect(active).toBe('de');
  });

  test('a round trip through every language lands back exactly where it started', async ({ game, page }) => {
    await openHydrogenPane(game);
    const before = await page.evaluate(() => ({
      tab1: document.getElementById('tab1Intro')?.innerText?.trim(),
      tab2: document.getElementById('tab2Intro')?.innerText?.trim(),
      tab3: document.getElementById('tab3Intro')?.innerText?.trim(),
      tab4: document.getElementById('tab4Intro')?.innerText?.trim()
    }));

    for (const lang of ['es', 'de', 'it', 'fr', 'en']) {
      await game.withMods((m, l) => m.ui.relocalizeAll(l), lang);
    }

    const after = await page.evaluate(() => ({
      tab1: document.getElementById('tab1Intro')?.innerText?.trim(),
      tab2: document.getElementById('tab2Intro')?.innerText?.trim(),
      tab3: document.getElementById('tab3Intro')?.innerText?.trim(),
      tab4: document.getElementById('tab4Intro')?.innerText?.trim()
    }));

    // Nothing may be left stranded in an intermediate language.
    expect(after).toEqual(before);
  });

  test('the debug panel switcher routes through the same redraw path', async ({ game, page }) => {
    // status.md item 3: the debug switcher used to duplicate the redraw logic.
    // Driving it must now be indistinguishable from using Settings.
    await openHydrogenPane(game);
    expect(await game.openVariableDebugger()).toBe(true);

    await page.evaluate(() => {
      const select = document.getElementById('debugLanguageSelect');
      select.value = 'fr';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      document.getElementById('debugSetLanguageButton').click();
    });
    await page.waitForTimeout(700);

    const state = await page.evaluate((key) => ({
      tabLabel: document.getElementById('tab1Intro')?.innerText?.trim(),
      stored: localStorage.getItem(key)
    }), STORAGE_KEY);
    const active = await game.withMods((m) => m.cg.getLanguage());

    expect(active).toBe('fr');
    expect(state.tabLabel).toBe('Ressources');
    // Persistence is owned by initLocalization, so the debug path gets it too.
    expect(state.stored).toBe('fr');
    // The redraw must complete, not bail out part-way through with a throw the
    // click handler swallows — that would still update the static labels above.
    expect(game.significantErrors()).toEqual([]);
  });

  test('the debug switcher asks for a selection instead of resolving to nothing', async ({ game, page }) => {
    expect(await game.openVariableDebugger()).toBe(true);

    const before = await game.withMods((m) => m.cg.getLanguage());

    await page.evaluate(() => {
      const select = document.getElementById('debugLanguageSelect');
      select.value = '';
      document.getElementById('debugSetLanguageButton').click();
    });
    await page.waitForTimeout(400);

    const after = await game.withMods((m) => m.cg.getLanguage());
    // An empty selection must be a no-op, not a silent fall-through to the
    // browser locale.
    expect(after).toBe(before);
    await expect
      .poll(() => game.notifications('debug'), { timeout: 6000 })
      .toEqual(expect.arrayContaining([expect.stringMatching(/select a language/i)]));
  });

  test('the current pane header and description are rewritten on switch', async ({ game, page }) => {
    await openGameOptions(game);

    const englishDescription = await page.evaluate(() =>
      document.getElementById('descriptionContentTab9')?.innerText?.trim() ?? '');

    await selectLanguageInUi(game, 'de');

    const germanDescription = await page.evaluate(() =>
      document.getElementById('descriptionContentTab9')?.innerText?.trim() ?? '');

    expect(englishDescription).not.toBe('');
    expect(germanDescription).not.toBe('');
    expect(germanDescription).not.toBe(englishDescription);
  });

  test('the category headers follow every one of the twenty language transitions', async ({ game, page }) => {
    // These three headers used to be relocalized by matching their *current
    // text* against a hardcoded list of previously-seen translations, so any
    // form missing from that list stranded the header permanently: after one
    // visit to German "Flüssigkeiten" never changed again, and after one visit
    // to French all three were stuck. A sweep of all twenty ordered pairs left
    // 43 stranded headers.
    //
    // They are now keyed by `data-loc` on the element, so text has nothing to do
    // with it. Walking every ordered pair is the regression guard for that.
    test.setTimeout(180_000);
    await openHydrogenPane(game);

    const stranded = [];
    for (const from of LANGUAGE_OPTIONS) {
      for (const to of LANGUAGE_OPTIONS) {
        if (from.value === to.value) continue;

        await game.withMods((m, l) => m.ui.relocalizeAll(l), from.value);
        await game.withMods((m, l) => m.ui.relocalizeAll(l), to.value);
        await page.waitForTimeout(100);

        const headers = await page.evaluate(() =>
          Array.from(document.querySelectorAll('.main-category-text')).map((el) => el.innerText.trim()));

        const expected = await game.withMods((m, lang) => ({
          gases: m.loc.localize('categoryGases', lang),
          liquids: m.loc.localize('categoryLiquids', lang),
          solids: m.loc.localize('categorySolids', lang)
        }), to.value);

        for (const wanted of Object.values(expected)) {
          if (!headers.includes(wanted)) {
            stranded.push(`${from.value} -> ${to.value}: expected "${wanted}", saw [${headers.join(', ')}]`);
          }
        }
      }
    }

    expect(stranded).toEqual([]);
  });

  test('every side-menu label in the static shell is translated', async ({ game, page }) => {
    // Around twenty ids in the old hand-written relocalization block did not
    // match index.html, so those labels silently stayed in English forever —
    // every tab-9 entry among them. The `data-loc` sweep is only worth anything
    // if it actually reaches them, so this asserts the rendered text against the
    // catalogue for every annotated element.
    await openHydrogenPane(game);
    await game.withMods((m) => m.ui.relocalizeAll('de'));
    await page.waitForTimeout(300);

    const mismatches = await page.evaluate(async () => {
      const { localize } = await import('/localization.js');
      const { getLanguage } = await import('/constantsAndGlobalVars.js');
      const bad = [];
      document.querySelectorAll('[data-loc]').forEach((el) => {
        const expected = localize(el.dataset.loc, getLanguage());
        const actual = (el.innerText || '').trim();
        if (actual !== expected.trim()) bad.push(`${el.dataset.loc}: "${actual}" != "${expected}"`);
      });
      return bad;
    });

    expect(mismatches).toEqual([]);

    // And a concrete spot check on labels the old block never reached at all.
    const spotChecks = await page.evaluate(() => ({
      contact: document.getElementById('tab9ContactDevOption')?.innerText?.trim(),
      energyStorage: document.getElementById('energyOption')?.innerText?.trim(),
      ascendency: document.getElementById('ascendencyOption')?.innerText?.trim()
    }));

    expect(spotChecks.contact).toBe('Kontakt');
    expect(spotChecks.energyStorage).toBe('Energiespeicher');
    expect(spotChecks.ascendency).toBe('Aufstiegsboni');
  });

  test('switching language produces no raw keys and no console errors', async ({ game, page }) => {
    await openGameOptions(game);

    const leaked = [];
    for (const lang of ['es', 'de', 'it', 'fr', 'en']) {
      await selectLanguageInUi(game, lang);
      const suspects = await page.evaluate(() => {
        const text = document.body.innerText || '';
        return [...new Set(text.match(/\b[a-z]+[A-Z][A-Za-z0-9]{6,}\b/g) || [])];
      });
      if (suspects.length) leaked.push(`${lang}: ${suspects.join(', ')}`);
    }

    expect(leaked).toEqual([]);
    expect(game.significantErrors()).toEqual([]);
  });
});
