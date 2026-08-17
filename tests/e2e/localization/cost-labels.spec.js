/**
 * Area: Localization
 * Plan: tests/docs/areas/localization.md
 * Feature status: docs/localization/status.md (item 5)
 *
 * The purchase-row cost labels the frame loop rewrites every tick.
 *
 * These labels are the one place where three concerns meet: `game.js` has to
 * find the label at all, the material names it writes have to come from the
 * catalogue, and the notation formatter has to reach the spans it writes. All
 * three broke together and silently, because the first one failing makes the
 * other two unobservable:
 *
 * `createOptionRow` gives a row's *flavour text* container the id
 * `<labelId>Description`, and `generateElementId` gives the row's *cost label*
 * the very same id. The flavour container is appended first, so
 * `getElementById('<labelId>Description')` always returns the wrong element.
 * Every builder in `game.js` addressed its label that way, so none of them
 * resolved, the labels were never rewritten, they never gained the spans
 * `complexPurchaseBuildingFormatter` formats, and their prices rendered raw:
 * `8100` where `normalCondensed` owes `8.1K`. Labels are now reached through
 * their row, whose id is unique.
 *
 * The panes below are the ones whose rows carry `rowCategory: 'fleetPurchase'`,
 * `'building'`, `'starShipPurchase'` or `'science'` — the four that produce a
 * `building-purchase` label.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/**
 * Rows whose cost label the frame loop owns, by the pane that draws them.
 *
 * `rows` is every row the pane draws; `priced` is the subset that still shows a
 * price at the state `prepareRunForStarshipLaunch` leaves behind. A completed
 * purchase replaces its cost line with the *Built!* marker and legitimately
 * carries no priced spans, so the star ship modules — all finished by the time
 * the ship can launch — are checked for address resolution only.
 */
const PANES = [
  {
    tab: 5,
    paneId: 'fleetHangarOption',
    rows: [
      'spaceFleetEnvoyBuildRow',
      'spaceFleetScoutBuildRow',
      'spaceFleetMarauderBuildRow',
      'spaceFleetLandStalkerBuildRow',
      'spaceFleetNavalStraferBuildRow'
    ],
    priced: [
      'spaceFleetScoutBuildRow',
      'spaceFleetMarauderBuildRow',
      'spaceFleetLandStalkerBuildRow',
      'spaceFleetNavalStraferBuildRow'
    ]
  },
  {
    tab: 2,
    paneId: 'powerPlant1Option',
    rows: ['energyPowerPlant1Row'],
    priced: ['energyPowerPlant1Row']
  },
  {
    tab: 5,
    paneId: 'starShipOption',
    rows: [
      'spaceSsStructuralBuildRow',
      'spaceSsLifeSupportBuildRow',
      'spaceSsAntimatterEngineBuildRow'
    ],
    priced: []
  }
];

/**
 * A material name that is spelled differently in German, so a label that still
 * reads the English word is distinguishable from one that translated.
 */
const ENGLISH_ONLY_MATERIALS = ['Hydrogen', 'Silicon', 'Titanium', 'Carbon'];

async function openPaneById(game, tab, paneId) {
  await game.openTab(tab);
  await game.page.waitForTimeout(250);
  const opened = await game.page.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el) return false;
    el.classList.remove('invisible');
    el.closest('.row-side-menu')?.classList.remove('invisible');
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, paneId);
  // The label is written by the frame loop, not by the draw call, so the read
  // has to happen a few frames after the pane is built.
  await game.page.waitForTimeout(1200);
  return opened;
}

/** The cost label of a row, reached the way `game.js` reaches it. */
const readCostLabels = (game, rowIds) => game.page.evaluate((ids) => ids.map((id) => {
  const row = document.getElementById(id);
  const label = row?.querySelector('.description-container .notation');
  return {
    row: id,
    found: !!label,
    isFlavourContainer: !!label && label.classList.contains('option-row-description'),
    spans: label ? label.querySelectorAll('span').length : 0,
    text: label ? label.textContent.replace(/\s+/g, ' ').trim() : null
  };
}), rowIds);

test.describe('Localization — frame-loop cost labels', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await game.withMods((m) => m.cg.setNotationType?.('normalCondensed'));
  });

  test('every cost label resolves to the label, not the flavour-text container', async ({ game }) => {
    const unresolved = [];

    for (const pane of PANES) {
      expect(await openPaneById(game, pane.tab, pane.paneId), `pane ${pane.paneId} should exist`).toBe(true);
      for (const label of await readCostLabels(game, pane.rows)) {
        if (!label.found || label.isFlavourContainer) unresolved.push(label);
      }
    }

    expect(unresolved, 'cost labels that game.js cannot address').toEqual([]);
  });

  test('the frame loop rewrites each cost label into its priced spans', async ({ game }) => {
    const unwritten = [];

    for (const pane of PANES) {
      if (pane.priced.length === 0) continue;
      await openPaneById(game, pane.tab, pane.paneId);
      for (const label of await readCostLabels(game, pane.priced)) {
        // A rewritten label always carries at least the currency span; a label
        // the loop never reached still holds the draw function's plain string.
        if (label.spans === 0) unwritten.push(label);
      }
    }

    expect(unwritten, 'cost labels the frame loop never rewrote').toEqual([]);
  });

  test('normalCondensed reaches every cost label', async ({ game }) => {
    const unformatted = [];

    for (const pane of PANES) {
      if (pane.priced.length === 0) continue;
      await openPaneById(game, pane.tab, pane.paneId);
      for (const label of await readCostLabels(game, pane.priced)) {
        // Four or more consecutive digits means the raw price survived: every
        // value at or above 1000 condenses to a K/M/B/e form.
        if (label.text && /\d{4,}/.test(label.text)) unformatted.push(label);
      }
    }

    expect(unformatted, 'cost labels still showing a raw thousands figure').toEqual([]);
  });

  test('material names in cost labels follow a language change', async ({ game }) => {
    const pane = PANES[0];
    await openPaneById(game, pane.tab, pane.paneId);

    const english = await readCostLabels(game, pane.priced);
    expect(english.some((l) => ENGLISH_ONLY_MATERIALS.some((m) => l.text?.includes(m)))).toBe(true);

    await game.withMods((m) => m.ui.relocalizeAll('de'));
    await openPaneById(game, pane.tab, pane.paneId);

    const german = await readCostLabels(game, pane.priced);
    const stillEnglish = german.filter((l) => ENGLISH_ONLY_MATERIALS.some((m) => l.text?.includes(m)));

    expect(stillEnglish, 'cost labels still naming their materials in English').toEqual([]);
    expect(german.some((l) => l.text?.includes('Wasserstoff') || l.text?.includes('Silizium') || l.text?.includes('Titan'))).toBe(true);
  });
});
