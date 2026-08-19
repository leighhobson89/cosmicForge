/**
 * Area: Localization
 * Plan: tests/docs/areas/localization.md
 * Feature status: docs/localization/status.md (items 4, 5 and 9)
 *
 * The whole UI, in every language, at a late-game state.
 *
 * The debug menu's `Prepare run for Starship Launch` chain is used to unlock all
 * nine tabs and populate them with real late-game content — star systems, fleets,
 * antimatter, the cosmic rip — because most of the catalogue only renders once
 * the game is deep enough to show it. Sweeping a fresh save would assert almost
 * nothing about the panels most likely to carry an untranslated string.
 */
import { test, expect } from '../_harness/game-fixture.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const CATALOGUE = JSON.parse(fs.readFileSync(path.join(ROOT, 'localization.json'), 'utf8'));

const LANGUAGES = ['en', 'es', 'pt', 'de', 'it', 'fr'];
const TABS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * Keys whose shape can never be mistaken for prose: a lowercase word followed by
 * an uppercase letter. Single-word keys like `pause` or `begin` are excluded,
 * because those are also legitimate English UI text and would false-positive on
 * every English sweep.
 */
const CAMEL_CASE_KEYS = Object.keys(CATALOGUE.en).filter((k) => /^[a-z][A-Za-z0-9]*[A-Z]/.test(k));

const RESOURCES = ['hydrogen', 'helium', 'carbon', 'neon', 'oxygen', 'sodium', 'silicon', 'iron'];
const COMPOUNDS = ['diesel', 'glass', 'concrete', 'steel', 'water', 'titanium'];

const TAB_HEADERS = [
  { id: 'tab1Intro', key: 'tabHeaderResources' },
  { id: 'tab2Intro', key: 'tabHeaderEnergy' },
  { id: 'tab3Intro', key: 'tabHeaderResearch' },
  { id: 'tab4Intro', key: 'tabHeaderCompounds' },
  { id: 'tab5Intro', key: 'tabHeaderInterstellar' },
  { id: 'tab6Intro', key: 'tabHeaderSpaceMining' },
  { id: 'tab7Intro', key: 'tabHeaderGalactic' },
  { id: 'tab8Intro', key: 'tabHeaderCosmicRip' },
  // The tab *button* for settings is the ☰ glyph (`tabHeaderSettings`), but the
  // sidebar heading is a word. It used to render the glyph, because both were
  // wired to the same key.
  { id: 'tab9Intro', key: 'headerMainSettings' }
];

/**
 * Controls allowed to be clipped by their translated label. **This list is now
 * empty, and that is the assertion** — the ratchet became an absolute when the
 * five entries it used to hold were fixed rather than tolerated:
 *
 *  - `sellAllResourcesButton` / `sellAllCompoundsButton` were pinned to a hard
 *    20% of their header row — 81px against the 135px "Alles Verkaufen" needs.
 *    The button now takes the width its label needs and the heading beside it
 *    takes the remainder.
 *  - `energyOption`, `powerPlant2Option` and `powerPlant3Option` sat in a
 *    side-menu column that was an even third of the panel while carrying the
 *    only real text in the row. The name column now takes 44% to the numbers'
 *    28%, and `fitSideMenuLabels()` shrinks the few labels that still do not fit
 *    — German supplies single unbreakable words ("Energiespeicher") that no
 *    amount of column width makes wrap.
 *
 * Anything appearing here again is a regression, not a backlog item. See
 * docs/localization/status.md item 9 and tests/docs/known-issues.md #7.
 *
 * `activateGridButton` is deliberately *not* here: it clips in English too, so
 * the language-relative diff this spec performs never attributes it to
 * translation.
 */
const KNOWN_TRANSLATION_OVERFLOW = [];

const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Open the first real pane in a tab's side menu.
 *
 * A tab with no pane selected renders an empty content area, so sweeping without
 * this would assert against a blank panel on most tabs. Matching is on the
 * language-independent `tabN.optionM` class token rather than the visible label,
 * which is itself translated.
 */
async function openFirstPane(game, tab) {
  return game.page.evaluate((t) => {
    const group = document.getElementById(`tab${t}ContainerGroup`);
    if (!group) return null;
    const target = Array.from(group.querySelectorAll('p'))
      .find((el) => Array.from(el.classList).some((c) => c.startsWith(`tab${t}.option`)) && el.textContent.trim());
    if (!target) return null;
    target.classList.remove('invisible');
    target.closest('.row-side-menu')?.classList.remove('invisible');
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return target.id || target.className;
  }, tab);
}

/** Walk every tab in one language, opening a pane on each, and measure it. */
async function surveyAllTabs(game, language) {
  const survey = {};

  for (const tab of TABS) {
    await game.openTab(tab);
    await openFirstPane(game, tab);
    await game.page.waitForTimeout(300);
    await game.withMods((m, l) => m.ui.relocalizeAll(l), language);
    await game.page.waitForTimeout(350);

    survey[tab] = await game.page.evaluate((keys) => {
      const keySet = new Set(keys);
      const tokens = (document.body.innerText || '').match(/\b[A-Za-z][A-Za-z0-9]*\b/g) || [];

      const clipped = [];
      document.querySelectorAll('.main-container [id]').forEach((el) => {
        if (!el.id || el.clientWidth <= 0) return;
        if (el.scrollWidth - el.clientWidth > 2) clipped.push(el.id);
      });

      return {
        rawKeys: [...new Set(tokens.filter((t) => keySet.has(t)))],
        horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
        clipped: clipped.sort()
      };
    }, CAMEL_CASE_KEYS);
  }

  return survey;
}

test.describe('Localization — translated UI at a late-game state', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
  });

  test('no raw localization key is visible on any tab, in any language', async ({ game }) => {
    test.setTimeout(240_000);

    // The precise check: a token on screen that is literally a catalogue key.
    // localize() returns the key unchanged when it cannot resolve, so this is
    // exactly what a missing or misspelled key looks like to a player.
    const leaks = [];
    for (const language of LANGUAGES) {
      const survey = await surveyAllTabs(game, language);
      for (const [tab, result] of Object.entries(survey)) {
        if (result.rawKeys.length) leaks.push(`${language} tab${tab}: ${result.rawKeys.join(', ')}`);
      }
    }

    expect(leaks).toEqual([]);
  });

  test('no tab overflows the viewport horizontally in any language', async ({ game }) => {
    test.setTimeout(240_000);

    // The failure mode that makes a translated build unusable rather than merely
    // ugly: content pushing the page itself wider than the window.
    const overflowing = [];
    for (const language of LANGUAGES) {
      const survey = await surveyAllTabs(game, language);
      for (const [tab, result] of Object.entries(survey)) {
        if (result.horizontalOverflow > 0) {
          overflowing.push(`${language} tab${tab}: ${result.horizontalOverflow}px`);
        }
      }
    }

    expect(overflowing).toEqual([]);
  });

  test('translation clips no control that English does not already clip', async ({ game }) => {
    test.setTimeout(240_000);

    // status.md item 9. Measured as a diff against English on the same tab in
    // the same run, so pre-existing clipping and layout noise cancel out and
    // only translation-caused overflow is left.
    //
    // Tab 5 is excluded: the star map is a field of absolutely positioned star
    // labels whose placement is randomised per draw, so its clipped set differs
    // between two consecutive draws of the *same* language. Nothing on it is a
    // translated control.
    const measurable = TABS.filter((t) => t !== 5);

    const english = await surveyAllTabs(game, 'en');
    const regressions = [];

    for (const language of LANGUAGES.filter((l) => l !== 'en')) {
      const survey = await surveyAllTabs(game, language);
      for (const tab of measurable) {
        const baseline = new Set(english[tab].clipped);
        const added = survey[tab].clipped
          .filter((id) => !baseline.has(id))
          .filter((id) => !KNOWN_TRANSLATION_OVERFLOW.includes(id));

        if (added.length) regressions.push(`${language} tab${tab}: ${added.join(', ')}`);
      }
    }

    expect(regressions).toEqual([]);
  });

  test('every tab header is translated from the catalogue', async ({ game, page }) => {
    // A pane must be open before relocalizeAll — see tests/docs/known-issues.md #5.
    await game.openTab(1);
    await openFirstPane(game, 1);

    const wrong = [];

    for (const language of LANGUAGES) {
      await game.withMods((m, l) => m.ui.relocalizeAll(l), language);
      await page.waitForTimeout(300);

      const rendered = await page.evaluate((headers) =>
        Object.fromEntries(headers.map(({ id }) => [id, document.getElementById(id)?.innerText?.trim() ?? null])),
      TAB_HEADERS);

      for (const { id, key } of TAB_HEADERS) {
        const expected = CATALOGUE[language][key];
        if (rendered[id] !== expected) {
          wrong.push(`${language} #${id}: "${rendered[id]}" (expected "${expected}")`);
        }
      }
    }

    expect(wrong).toEqual([]);
  });

  test('resource and compound side-menu labels resolve their constructed keys', async ({ game, page }) => {
    // `resource${Name}` and `compound${Name}` are built by concatenation, so the
    // parity checker is blind to them. This asserts the rendered label, which is
    // the only place a broken construction actually shows up.
    await game.openTab(1);
    await openFirstPane(game, 1);

    const wrong = [];

    for (const language of LANGUAGES) {
      await game.withMods((m, l) => m.ui.relocalizeAll(l), language);
      await page.waitForTimeout(300);

      const rendered = await page.evaluate((ids) =>
        Object.fromEntries(ids.map((id) => {
          const el = document.getElementById(`${id}Option`);
          if (!el) return [id, null];
          // The label carries an appended `span.attention-indicator` (⚠️) when
          // the pane has something new in it. That marker is not localized and
          // is not part of the name under test.
          const clone = el.cloneNode(true);
          clone.querySelectorAll('span.attention-indicator').forEach((s) => s.remove());
          return [id, clone.textContent.trim()];
        })),
      [...RESOURCES, ...COMPOUNDS]);

      for (const name of RESOURCES) {
        const expected = CATALOGUE[language][`resource${capitalise(name)}`];
        if (rendered[name] !== expected) wrong.push(`${language} ${name}: "${rendered[name]}" (expected "${expected}")`);
      }
      for (const name of COMPOUNDS) {
        const expected = CATALOGUE[language][`compound${capitalise(name)}`];
        if (rendered[name] !== expected) wrong.push(`${language} ${name}: "${rendered[name]}" (expected "${expected}")`);
      }
    }

    expect(wrong).toEqual([]);
  });

  test('switching language in a late-game state raises no console errors', async ({ game, page }) => {
    test.setTimeout(180_000);

    // Late-game panes read far more of the data object than an early save does,
    // so this is where a relocalize-triggered redraw is most likely to throw.
    for (const tab of TABS) {
      await game.openTab(tab);
      await openFirstPane(game, tab);
      await page.waitForTimeout(250);
      for (const language of ['de', 'fr', 'en']) {
        await game.withMods((m, l) => m.ui.relocalizeAll(l), language);
        await page.waitForTimeout(250);
      }
    }

    expect(game.significantErrors()).toEqual([]);
  });

  test('the frame loop keeps running through a language change', async ({ game, page }) => {
    // relocalizeAll rebuilds the element cache the frame loop iterates. If it
    // leaves a stale or null entry behind, gameLoop throws and never reschedules
    // itself — the game silently freezes with no error visible to the player.
    await game.openTab(4);
    await openFirstPane(game, 4);
    await game.withMods((m) => m.ui.relocalizeAll('de'));
    await page.waitForTimeout(400);

    const frames = await page.evaluate(async () => {
      let count = 0;
      const start = performance.now();
      return new Promise((resolve) => {
        const tick = () => {
          count++;
          if (performance.now() - start >= 600) resolve(count);
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    });

    expect(frames).toBeGreaterThan(5);
    expect(game.significantErrors()).toEqual([]);
  });
});
