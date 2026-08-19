/**
 * Area: Achievements — earned by playing, granted by the frame loop
 * Plan: tests/docs/areas/achievements.md
 *
 * `achievement-catalogue.spec.js` sweeps all seventy achievements against the
 * trigger surface this area owns. This file is the other half: it *plays* the
 * scenarios the real UI and the real debug menu can reach, and never calls
 * `checkForAchievements()` at all. Nothing here grants anything — the running
 * `gameLoop` does, exactly as it does for a player, and the spec waits for it.
 *
 * That distinction is the whole point. An achievement can be perfectly correct
 * in `achievements.js` and still never fire, because the thing that was supposed
 * to raise its flag does not, or because the frame loop is not calling the
 * checker at all. Both are invisible to a test that calls the checker itself.
 *
 * What is played here, and what each one proves:
 *
 * | Played | Reaches |
 * |---|---|
 * | buying a tier 1 hydrogen autobuyer and letting it extract | `collect50Hydrogen`, from real production crossing the threshold |
 * | buying a power plant through its purchase button | `buildPowerPlant`, a `buildings` requirement |
 * | researching Knowledge Sharing from its row in the Technology pane | `researchTechnology`, a `tech` requirement |
 * | the debug menu's "Give $1B" | all four `cash` thresholds at once, and their compounding sale-value multipliers |
 * | the debug menu's "Add 10 Asteroids" | `discoverAsteroid`, a flag raised by `discoverAsteroid()` in game.js |
 * | the debug menu's "Study a Star" | the `studyStar` family, driven by `starVisionDistance` |
 * | the debug menu's "Grant All Techs" | `researchAllTechnologies` and `achieve100FusionEfficiency` |
 * | choosing all nine themes in the Settings dropdown | `tryAllThemes`, whose flag `selectTheme()` raises only on the ninth |
 *
 * The reward is checked in every case, because "the tile lit up" is only half of
 * what an achievement is.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe.configure({ timeout: 240_000 });

// --------------------------------------------------------------------- helpers

/** Open a side-menu pane by its option id, the way a player clicks it. */
async function openPaneById(game, optionId) {
  const found = await game.page.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el) return false;
    el.classList.remove('invisible');
    el.closest('.row-side-menu')?.classList.remove('invisible');
    el.closest('.collapsible')?.classList.remove('invisible');
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, optionId);
  if (!found) throw new Error(`No side-menu row with id ${optionId}`);
  await game.page.waitForTimeout(700);
}

/**
 * Dispatch a click at a button inside an option row.
 *
 * Dispatched rather than driven through the mouse because these controls sit
 * under other elements in the panel. Note this also bypasses the CSS
 * affordability gate (known-issues.md #17), which is fine here — affordability
 * is staged before every press, and the gate itself is asserted in the areas
 * that own those buttons.
 */
async function clickRowButton(game, rowId, selector = 'button') {
  const fired = await game.page.evaluate(({ row, sel }) => {
    const button = document.getElementById(row)?.querySelector(sel);
    if (!button) return false;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, { row: rowId, sel: selector });
  if (!fired) throw new Error(`No ${selector} inside #${rowId}`);
  await game.page.waitForTimeout(500);
}

/** Choose an option from one of the game's custom dropdowns. */
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
  await game.page.waitForTimeout(400);
}

/**
 * Wait for the *frame loop* to turn an achievement on.
 *
 * Deliberately polls the data object rather than calling the checker: what is
 * under test is that `gameLoop` notices, so anything that reaches into
 * `achievements.js` here would defeat the file.
 */
async function waitForAchievement(game, id, timeout = 20000) {
  await game.page.waitForFunction(
    (key) => globalThis.__mods.rdo.getAchievementDataObject(key, ['active'], true) === true,
    id,
    { timeout }
  ).catch(() => { /* the assertion that follows reports it properly */ });
  return game.withMods((m, key) => m.rdo.getAchievementDataObject(key, ['active'], true), id);
}

/** Read the reward-bearing parts of the economy in one round trip. */
async function readEconomy(game) {
  return game.withMods((m) => {
    const rates = {};
    for (const key of Object.keys(m.rdo.getResourceDataObject('resources') || {})) {
      if (key === 'version') continue;
      rates[key] = [1, 2, 3, 4].map((tier) =>
        m.rdo.getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', `tier${tier}`, 'rate'], true));
    }
    const saleValues = {};
    for (const key of Object.keys(m.rdo.getResourceDataObject('resources') || {})) {
      if (key === 'version') continue;
      saleValues[key] = m.rdo.getResourceDataObject('resources', [key, 'saleValue'], true);
    }
    const ratios = {};
    for (const key of Object.keys(m.rdo.getResourceDataObject('compounds') || {})) {
      if (key === 'version') continue;
      ratios[key] = [1, 2, 3, 4].map((i) =>
        m.rdo.getResourceDataObject('compounds', [key, `createsFromRatio${i}`], true));
    }
    return {
      cash: m.rdo.getResourceDataObject('currency', ['cash'], true),
      ascendencyPoints: m.rdo.getResourceDataObject('ascendencyPoints', ['quantity'], true),
      rates,
      saleValues,
      ratios
    };
  });
}

/**
 * Poll the visible notifications for a piece of text.
 *
 * Achievement notifications are written with `<br>` separators and rendered as
 * HTML, and `<br>` contributes *no* whitespace to `textContent` — so
 * `ACHIEVEMENT:<br>You have…` reads back as `ACHIEVEMENT:You have…`. Both sides
 * are stripped of tags and of all whitespace so the comparison holds either way.
 */
function compactText(value) {
  return String(value ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, '');
}

async function waitForNotification(game, text, timeout = 12000) {
  const wanted = compactText(text);
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const seen = await game.notifications();
    if (seen.some((entry) => compactText(entry).includes(wanted))) return true;
    await game.page.waitForTimeout(400);
  }
  return false;
}

// ------------------------------------------------------------------ the specs

test.describe('Achievements — earned through the game', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('real hydrogen production crosses the threshold and the frame loop grants the achievement', async ({ game }) => {
    await game.openTab(1);
    await openPaneById(game, 'hydrogenOption');

    // Enough stock to afford one tier 1 autobuyer and nothing like fifty
    // hydrogen left over, so the achievement can only be reached by extraction.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(1e6, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(20, 'resources', ['hydrogen', 'quantity']);
    });

    const before = await game.withMods((m) => ({
      cash: m.rdo.getResourceDataObject('currency', ['cash'], true),
      active: m.rdo.getAchievementDataObject('collect50Hydrogen', ['active'], true),
      hydrogen: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity'], true)
    }));
    expect(before.active, 'twenty hydrogen is not fifty').toBe(false);
    expect(before.hydrogen).toBeLessThan(50);

    await clickRowButton(game, 'hydrogenAutoBuyer1Row');

    // No further intervention: the autobuyer extracts, the stock passes fifty,
    // and `gameLoop` -> `checkForAchievements()` is what notices.
    expect(await waitForAchievement(game, 'collect50Hydrogen', 40000)).toBe(true);

    const after = await game.withMods((m) => ({
      cash: m.rdo.getResourceDataObject('currency', ['cash'], true),
      hydrogen: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity'], true)
    }));
    expect(after.hydrogen).toBeGreaterThanOrEqual(50);
    // The documented reward. Buying the autobuyer costs hydrogen, not cash, so
    // the ten is the only thing that should have moved the balance.
    expect(after.cash).toBe(before.cash + 10);

    const expectedText = await game.withMods((m) =>
      m.desc.getAchievementNotification('collect50HydrogenNotification'));
    expect(await waitForNotification(game, expectedText)).toBe(true);
  });

  test('buying a power plant through its own button earns the achievement and its resource multiplier', async ({ game }) => {
    // Tab 2 is locked on a fresh run, and a pane on a locked tab draws with no
    // layout — its purchase button has no `offsetParent` and cannot be found.
    // This is the debug menu's own unlock, which also grants Basic Power
    // Generation, the tech that reveals the plant.
    await game.debugClick('unlockAllTabsButton');
    await game.debugClick('give1BButton');
    await game.withMods((m) => {
      for (const resource of ['carbon', 'iron', 'silicon']) {
        m.rdo.setResourceDataObject(1e9, 'resources', [resource, 'storageCapacity']);
        m.rdo.setResourceDataObject(1e9, 'resources', [resource, 'quantity']);
      }
      m.rdo.setResourceDataObject(true, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'revealed']);
      // The multiplier acts on autobuyer rates, so there has to be a rate for
      // it to act on — otherwise every `0 * 1.1 === 0` check passes vacuously.
      for (const key of Object.keys(m.rdo.getResourceDataObject('resources') || {})) {
        if (key === 'version' || key === 'solar') continue;
        for (const tier of ['tier1', 'tier2', 'tier3', 'tier4']) {
          m.rdo.setResourceDataObject(0.5, 'resources', [key, 'upgrades', 'autoBuyer', tier, 'rate']);
        }
      }
    });

    await game.openTab(2);
    await openPaneById(game, 'powerPlant1Option');

    const before = await readEconomy(game);
    expect(await game.withMods((m) => m.rdo.getAchievementDataObject('buildPowerPlant', ['active'], true))).toBe(false);

    const clicked = await game.page.evaluate(() => {
      const button = [...document.querySelectorAll('button.building-purchase-button')]
        .find((b) => b.offsetParent !== null);
      if (!button) return false;
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    });
    expect(clicked, 'the power plant pane should offer a purchase button').toBe(true);

    expect(await waitForAchievement(game, 'buildPowerPlant')).toBe(true);

    const after = await readEconomy(game);
    // `buildPowerPlant` gives `multiplier / allResources / 1.1`.
    const problems = [];
    for (const [key, tiers] of Object.entries(before.rates)) {
      if (key === 'solar') {
        if (JSON.stringify(after.rates.solar) !== JSON.stringify(tiers)) problems.push('solar was multiplied');
        continue;
      }
      tiers.forEach((rate, index) => {
        const expected = rate * 1.1;
        if (Math.abs(after.rates[key][index] - expected) > Math.max(1e-9, expected * 1e-9)) {
          problems.push(`${key} tier${index + 1}: ${rate} -> ${after.rates[key][index]}, expected ${expected}`);
        }
      });
    }
    expect(problems).toEqual([]);
  });

  test('researching a technology from its row earns the achievement and its cash reward', async ({ game }) => {
    await game.debugClick('give1MResearch');
    await game.openTab(3);
    await openPaneById(game, 'technologyOption');

    const before = await game.withMods((m) => ({
      cash: m.rdo.getResourceDataObject('currency', ['cash'], true),
      active: m.rdo.getAchievementDataObject('researchTechnology', ['active'], true)
    }));
    expect(before.active).toBe(false);

    await clickRowButton(game, 'techKnowledgeSharingRow');

    const unlocked = await game.withMods((m) => m.cg.getTechUnlockedArray().includes('knowledgeSharing'));
    expect(unlocked, 'the tech row should have bought Knowledge Sharing').toBe(true);

    expect(await waitForAchievement(game, 'researchTechnology')).toBe(true);
    const after = await game.withMods((m) => m.rdo.getResourceDataObject('currency', ['cash'], true));
    expect(after).toBe(before.cash + 30);
  });

  test('a billion in cash trips all four cash thresholds, and each pays its own sale multiplier', async ({ game }) => {
    const before = await readEconomy(game);

    await game.debugClick('give1BButton');

    for (const id of ['gain100Cash', 'gain10000Cash', 'gain100000Cash', 'gain1000000Cash']) {
      expect(await waitForAchievement(game, id), `${id} should be granted by a billion in cash`).toBe(true);
    }

    const after = await readEconomy(game);

    // The four rewards are `multiplier / cash` of 1.1, 1.2, 1.2 and 1.5, and
    // they compound — every one of them multiplies every sale value.
    const expectedFactor = 1.1 * 1.2 * 1.2 * 1.5;
    const problems = [];
    for (const [key, value] of Object.entries(before.saleValues)) {
      if (!(value > 0)) continue;
      const expected = value * expectedFactor;
      if (Math.abs(after.saleValues[key] - expected) > Math.max(1e-9, expected * 1e-6)) {
        problems.push(`${key} sale value: ${value} -> ${after.saleValues[key]}, expected ${expected}`);
      }
    }
    expect(problems, 'each cash achievement multiplies every sale value, and the four compound').toEqual([]);
  });

  test('discovering asteroids through the debug menu earns the asteroid achievement and discounts every compound', async ({ game }) => {
    const before = await readEconomy(game);
    expect(await game.withMods((m) => m.rdo.getAchievementDataObject('discoverAsteroid', ['active'], true))).toBe(false);

    await game.debugClick('add10AsteroidsButton');

    expect(await waitForAchievement(game, 'discoverAsteroid')).toBe(true);

    const after = await readEconomy(game);
    // `multiplier / createCostCompounds / 0.95`, applied to every recipe ratio.
    const problems = [];
    let reduced = 0;
    for (const [key, ratios] of Object.entries(before.ratios)) {
      ratios.forEach((ratio, index) => {
        if (!(ratio > 0)) return;
        const expected = Math.max(1, Math.round(ratio * 0.95));
        if (after.ratios[key][index] !== expected) {
          problems.push(`${key} createsFromRatio${index + 1}: ${ratio} -> ${after.ratios[key][index]}, expected ${expected}`);
        }
        if (after.ratios[key][index] < ratio) reduced++;
      });
    }
    expect(problems).toEqual([]);
    expect(reduced, 'at least one recipe should genuinely have got cheaper').toBeGreaterThan(0);

    // Regression cover for known-issues.md #1: this is the achievement whose
    // bonus used to dereference an unbuilt recipe table and kill the frame loop.
    expect(game.significantErrors()).toEqual([]);
  });

  test('studying a star through the debug menu earns the study achievement', async ({ game }) => {
    expect(await game.withMods((m) => m.rdo.getAchievementDataObject('studyStar', ['active'], true))).toBe(false);

    await game.debugClick('addStarButton');

    const vision = await game.withMods((m) => m.cg.getStarVisionDistance());
    expect(vision, 'studying a star should give the run some star vision').toBeGreaterThanOrEqual(0.5);

    expect(await waitForAchievement(game, 'studyStar')).toBe(true);

    // The two longer-range variants follow the same vision distance, so whether
    // they fire is decided by how far the star the debug menu picked actually is.
    const family = await game.withMods((m) => ({
      vision: m.cg.getStarVisionDistance(),
      fiveLY: m.rdo.getAchievementDataObject('studyStarMoreThan5LYAway', ['active'], true),
      twentyLY: m.rdo.getAchievementDataObject('studyStarMoreThan20LYAway', ['active'], true)
    }));
    expect(family.fiveLY, 'the 5 ly achievement should track the vision distance').toBe(family.vision >= 5);
    expect(family.twentyLY, 'the 20 ly achievement should track the vision distance').toBe(family.vision >= 20);
  });

  test('the tech achievements are earned by the ordinary tree, but "all technologies" waits for the megastructures', async ({ game }) => {
    const before = await game.withMods((m) => ({
      cash: m.rdo.getResourceDataObject('currency', ['cash'], true),
      ascendencyPoints: m.rdo.getResourceDataObject('ascendencyPoints', ['quantity'], true)
    }));

    await game.debugClick('grantAllTechsButton');

    // Three achievements ride on the ordinary tree: Knowledge Sharing,
    // Compounds and Fusion Efficiency III are all in it.
    expect(await waitForAchievement(game, 'researchTechnology')).toBe(true);
    expect(await waitForAchievement(game, 'unlockCompounds')).toBe(true);
    expect(await waitForAchievement(game, 'achieve100FusionEfficiency')).toBe(true);

    const afterTree = await game.withMods((m) => ({
      cash: m.rdo.getResourceDataObject('currency', ['cash'], true),
      ascendencyPoints: m.rdo.getResourceDataObject('ascendencyPoints', ['quantity'], true),
      // `grantAllTechsButton` deliberately skips the megastructure techs, so
      // this list should not be empty — and the claim below would be vacuous if
      // it were.
      outstanding: Object.keys(m.rdo.getResourceDataObject('techs') || {})
        .filter((tech) => !m.cg.getTechUnlockedArray().includes(tech)),
      allTechs: m.rdo.getAchievementDataObject('researchAllTechnologies', ['active'], true)
    }));

    expect(afterTree.cash, 'Fusion Efficiency III pays 500, Compounds 200 and Knowledge Sharing 30')
      .toBe(before.cash + 500 + 200 + 30);
    expect(afterTree.outstanding.length, 'the ordinary tree grant should leave the megastructure techs outstanding')
      .toBeGreaterThan(0);
    expect(afterTree.allTechs, 'Research All Technologies must mean *all* of them').toBe(false);
    expect(afterTree.ascendencyPoints).toBe(before.ascendencyPoints);

    // Finish the tree, and the last achievement follows.
    await game.withMods((m) => {
      for (const tech of Object.keys(m.rdo.getResourceDataObject('techs') || {})) {
        if (!m.cg.getTechUnlockedArray().includes(tech)) m.cg.setTechUnlockedArray(tech);
      }
    });

    expect(await waitForAchievement(game, 'researchAllTechnologies')).toBe(true);

    const afterAll = await game.withMods((m) =>
      m.rdo.getResourceDataObject('ascendencyPoints', ['quantity'], true));
    expect(afterAll, 'researching every technology pays one ascendency point')
      .toBe(before.ascendencyPoints + 1);
  });

  test('trying every theme in the Settings dropdown earns Try All Themes, and only on the last one', async ({ game }) => {
    const themes = ['terminal', 'dark', 'misty', 'light', 'frosty', 'summer', 'supernova', 'galaxy', 'space'];

    await game.openTab(9);
    await game.page.evaluate(() => {
      const row = document.querySelector('p.inset-paragraph[class~="tab9.option1"]');
      row?.closest('.row-side-menu')?.classList.remove('invisible');
      row?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(700);

    for (let i = 0; i < themes.length; i++) {
      await chooseDropdown(game, 'themeSelect', themes[i]);

      const painted = await game.page.evaluate(() => document.body.getAttribute('data-theme'));
      expect(painted, `choosing ${themes[i]} should repaint the document`).toBe(themes[i]);

      if (i < themes.length - 1) {
        // Not yet: the flag is only raised once every theme has been tried, and
        // an achievement that fired on the second theme would be a real defect.
        const active = await game.withMods((m) => m.rdo.getAchievementDataObject('tryAllThemes', ['active'], true));
        expect(active, `tryAllThemes fired after only ${i + 1} themes`).toBe(false);
      }
    }

    expect(await waitForAchievement(game, 'tryAllThemes')).toBe(true);
  });
});
