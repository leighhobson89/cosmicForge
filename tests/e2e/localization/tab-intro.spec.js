/**
 * Area: Localization
 * Plan: tests/docs/areas/localization.md
 * Feature status: docs/localization/status.md (item 10)
 *
 * Tab identity and the first-open intro page.
 *
 * A tab is identified downstream by its canonical English `data-name`, not by its
 * rendered label. The label is translated and carries attention indicators, while
 * the frame-loop gates, the `headerDescriptions` table and the intro ASCII-art
 * table are all keyed by the English name. When the click handler stored the
 * label instead, every one of those lookups missed outside English: the intro
 * page rendered the literal string "undefined" for both its description and its
 * artwork, and roughly nineteen per-frame gates went permanently false.
 *
 * Each language boots its own session with the preference already stored, because
 * the intro page only renders the *first* time a tab is opened — switching
 * language inside one session would leave every tab already registered as seen.
 */
import { test, expect } from '../_harness/game-fixture.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const CATALOGUE = JSON.parse(fs.readFileSync(path.join(ROOT, 'localization.json'), 'utf8'));

const STORAGE_KEY = 'cosmicForgeLanguage';
const LANGUAGES = ['en', 'es', 'pt', 'de', 'it', 'fr'];

/** Canonical `data-name` per tab, and the key its heading is localized from. */
const TABS = [
  { index: 1, name: 'Resources', headingKey: 'tabHeaderResources' },
  { index: 2, name: 'Energy', headingKey: 'tabHeaderEnergy' },
  { index: 3, name: 'Research', headingKey: 'headerMainResearch' },
  { index: 4, name: 'Compounds', headingKey: 'tabHeaderCompounds' },
  { index: 5, name: 'Interstellar', headingKey: 'tabHeaderInterstellar' },
  { index: 6, name: 'Space Mining', headingKey: 'tabHeaderSpaceMining' },
  { index: 7, name: 'Galactic', headingKey: 'tabHeaderGalactic' },
  { index: 8, name: 'Cosmic Rip', headingKey: 'headerMainCosmicRipTab' },
  // Tab 9's label is the ☰ glyph; its intro heading comes from a separate key.
  { index: 9, name: '☰', heading: 'Settings', headingKey: 'headerMainSettings' }
];

async function bootInLanguage(game, language) {
  await game.page.addInitScript(
    ([key, value]) => {
      try { window.localStorage.setItem(key, value); } catch { /* not this spec's concern */ }
    },
    [STORAGE_KEY, language]
  );
  await game.boot();
  // Unlock the tab bar without touching any pane: opening a pane would register
  // the tab as seen and suppress the intro page this spec exists to check.
  await game.debugClick('unlockAllTabsButton');
  // `unlockAllTabsButton` unlocks the five techs behind tabs 2 and 4-7 but not
  // `cosmicRip`, so tab 8 would stay at ???. showTabsUponUnlock reveals it on
  // the next frame once the tech is present.
  await game.withMods((m) => {
    if (!m.cg.getTechUnlockedArray().includes('cosmicRip')) m.cg.setTechUnlockedArray('cosmicRip');
  });
  await game.page.waitForTimeout(400);
}

/** Click a tab and read back everything the intro path produced. */
async function openTabAndInspect(game, index) {
  await game.openTab(index);
  await game.page.waitForTimeout(350);

  return game.page.evaluate((i) => ({
    heading: document.getElementById(`headerContentTab${i}`)?.innerText?.trim() ?? null,
    description: document.getElementById(`descriptionContentTab${i}`)?.innerText?.trim() ?? '',
    art: document.querySelector(`#optionContentTab${i} .intro-image-container`)?.textContent ?? ''
  }), index);
}

test.describe('Localization — tab identity and intro pages', () => {
  for (const language of LANGUAGES) {
    test(`every tab renders a real intro page on first open in ${language}`, async ({ game }) => {
      test.setTimeout(180_000);

      await bootInLanguage(game, language);
      expect(await game.withMods((m) => m.cg.getLanguage())).toBe(language);

      const problems = [];
      for (const tab of TABS) {
        const seen = await openTabAndInspect(game, tab.index);

        // The exact symptom being guarded: `innerHTML = undefined` renders the
        // four-letter word rather than nothing at all.
        if (seen.description.includes('undefined')) {
          problems.push(`${language} tab${tab.index}: description reads "${seen.description.slice(0, 60)}"`);
        }
        if (seen.art.includes('undefined')) {
          problems.push(`${language} tab${tab.index}: ASCII art reads "${seen.art.slice(0, 40)}"`);
        }

        // ...and the positive case, so an empty-string guard cannot pass for a
        // page that renders nothing.
        if (!seen.description) problems.push(`${language} tab${tab.index}: empty description`);
        if (!seen.art.trim()) problems.push(`${language} tab${tab.index}: empty ASCII art`);

        const expectedHeading = CATALOGUE[language][tab.headingKey];
        if (seen.heading !== expectedHeading) {
          problems.push(`${language} tab${tab.index}: heading "${seen.heading}" (expected "${expectedHeading}")`);
        }
      }

      expect(problems).toEqual([]);
      expect(game.significantErrors()).toEqual([]);
    });
  }

  test('the stored tab identity is the canonical English name in every language', async ({ game }) => {
    test.setTimeout(180_000);

    // ~19 frame-loop gates compare `getCurrentTab()[1]` against an English name.
    // Storing the translated label made all of them false outside English, which
    // silently stopped price formatting, affordability colouring, star-map
    // updates and the market and casino refreshes.
    await bootInLanguage(game, 'de');

    const observed = [];
    for (const tab of TABS) {
      await game.openTab(tab.index);
      await game.page.waitForTimeout(250);
      observed.push({
        expected: tab.name,
        actual: await game.withMods((m) => m.cg.getCurrentTab())
      });
    }

    const wrong = observed.filter(({ expected, actual }) => actual[1] !== expected);
    expect(wrong.map((w) => `expected "${w.expected}", stored "${w.actual[1]}"`)).toEqual([]);
  });

  test('the rendered tab label stays translated even though identity does not', async ({ game, page }) => {
    // The canonical name is an internal identifier. What the player reads must
    // still come from the catalogue.
    await bootInLanguage(game, 'de');

    const labels = await page.evaluate(() =>
      Array.from(document.querySelectorAll('#tabsContainer .tab')).map((el) => ({
        id: el.id,
        name: el.getAttribute('data-name'),
        text: el.textContent.trim()
      })));

    const compounds = labels.find((l) => l.id === 'tab4');
    expect(compounds.name).toBe('Compounds');
    expect(compounds.text).toContain('Verbindungen');

    const settings = labels.find((l) => l.id === 'tab9');
    expect(settings.name).toBe('☰');
    expect(settings.text).toBe('☰');
  });

  test('a locked tab still reports itself as ??? rather than its name', async ({ game }) => {
    // `manageTabSpecificUi` bails on `getCurrentTab().includes('???')`. The
    // canonical-name change must not erase that marker, or a locked tab would
    // start being treated as a real one.
    await game.boot();

    const lockedIndex = await game.page.evaluate(() => {
      const locked = Array.from(document.querySelectorAll('#tabsContainer .tab'))
        .find((el) => el.textContent.trim() === '???');
      return locked ? Number(locked.id.replace('tab', '')) : null;
    });

    expect(lockedIndex, 'expected at least one locked tab on a fresh save').not.toBeNull();

    await game.openTab(lockedIndex);
    await game.page.waitForTimeout(250);

    const stored = await game.withMods((m) => m.cg.getCurrentTab());
    expect(stored[1]).toBe('???');
  });
});
