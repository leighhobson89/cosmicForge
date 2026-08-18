/**
 * Area: Statistics
 * Plan: tests/docs/areas/statistics.md
 *
 * The statistics page is the game's own record of what a player has done, and it
 * is written from exactly one place: `addToResourceAllTimeStat(amount, item)`,
 * which looks `item` up in `statFunctionsSets` and calls both the all-time setter
 * and — where one exists — the `…ThisRun` setter. The page then renders every
 * entry of `statFunctionsGets` into a `#stat_<key>` cell each frame, but only
 * while the Statistics pane is the open one.
 *
 * That shape is what these specs test, and it decides how they are written:
 *
 *   - **Every claim is a delta.** A statistic is asserted by doing the thing that
 *     is supposed to move it — buying the building, gaining the resource, running
 *     the grid out of fuel — and measuring the change. Absolute values would pass
 *     just as happily against a counter nothing ever touches.
 *   - **The amount matters, not just the fact.** Where a statistic counts a
 *     quantity rather than an event, the delta is compared against the quantity
 *     the run actually gained, so a stat that counts the *attempt* rather than
 *     the *gain* fails.
 *   - **Both columns are checked.** Nearly every statistic is rendered twice, as
 *     "Current Run" and "All Time", and the pair are meant to diverge only across
 *     a rebirth.
 *
 * The pane itself is driven through its real side-menu option, because
 * `getStats()` is called from the frame loop only when `getCurrentOptionPane()`
 * is `'statistics'` — a spec that read the cells without opening the pane would
 * be reading whatever the markup was built with.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe.configure({ timeout: 240_000 });

// --------------------------------------------------------------------- helpers

/** Open a side-menu pane by its option id, the way a player clicks it. */
async function openPaneById(game, optionId) {
  await game.page.evaluate((id) => {
    const el = document.getElementById(id);
    el?.closest('.row-side-menu')?.classList.remove('invisible');
    el?.classList.remove('invisible');
    el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, optionId);
  await game.page.waitForTimeout(600);
}

async function openStatisticsPane(game) {
  await game.openTab(9);
  await openPaneById(game, 'statisticsOption');
  await game.page.waitForTimeout(1000);
}

/** Dispatch a click at a button inside an option row. */
async function clickRowButton(game, rowId, selector = 'button') {
  const fired = await game.page.evaluate(({ id, sel }) => {
    const button = document.querySelector(`#${id} ${sel}`);
    if (!button) return false;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, { id: rowId, sel: selector });
  if (!fired) throw new Error(`No ${selector} inside row ${rowId}`);
  await game.page.waitForTimeout(250);
}

/** Dismiss the run-1 popup several techs raise, which would swallow later clicks. */
async function dismissPopup(game) {
  await game.page.evaluate(() => {
    const confirm = document.getElementById('modalConfirm');
    if (confirm?.offsetParent) confirm.click();
  });
  await game.page.waitForTimeout(400);
}

/**
 * Read named statistics straight from the getter table the page renders from.
 *
 * `statFunctionsGets` is the same object `getStats()` iterates, so this reads
 * exactly what the pane would show — without needing the pane open, which keeps
 * the delta measurements from being at the mercy of pane switching.
 */
async function readStats(game, keys) {
  return game.withMods((m, wanted) => {
    const out = {};
    for (const key of wanted) {
      const fn = m.cg.statFunctionsGets[key];
      out[key] = typeof fn === 'function' ? fn() : undefined;
    }
    return out;
  }, keys);
}

/** Every `#stat_…` cell currently on the page, with its rendered text. */
async function readStatCells(game) {
  return game.page.evaluate(() =>
    Array.from(document.querySelectorAll('[id^="stat_"]'))
      .map((cell) => ({ id: cell.id, text: (cell.textContent || '').trim() })));
}

/**
 * Read statistics and a resource quantity in the *same* evaluation.
 *
 * These specs compare a statistic's delta against the quantity the run actually
 * gained, and at a few hundred units a second the frame loop moves the board
 * measurably between two round trips into the page. Sampling both sides in one
 * evaluation removes that skew, so a failure means the statistic really has
 * drifted from the thing it counts.
 */
async function readStatsAndQuantity(game, keys, path) {
  return game.withMods((m, { wanted, where }) => {
    const stats = {};
    for (const key of wanted) {
      const fn = m.cg.statFunctionsGets[key];
      stats[key] = typeof fn === 'function' ? fn() : undefined;
    }
    return { stats, quantity: m.rdo.getResourceDataObject(where[0], where.slice(1)) };
  }, { wanted: keys, where: path });
}

// ------------------------------------------------------------- the page itself

test.describe('Statistics — the page', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('every statistic on the page renders a real value', async ({ game }) => {
    await openStatisticsPane(game);

    const cells = await readStatCells(game);
    expect(cells.length, 'the statistics table should be populated').toBeGreaterThan(100);

    // "NoData" is the placeholder every cell is built with; a cell still showing
    // it after a frame means no getter ever wrote to that id, so that statistic
    // is dead on the page however faithfully the game tracks it underneath.
    const unwritten = cells.filter((c) => /NoData|NaN|undefined/.test(c.text));
    expect(unwritten.map((c) => c.id),
      'these cells have no getter writing to them and show the raw placeholder')
      .toEqual([]);
  });

  test('the page refreshes while it is open', async ({ game }) => {
    await openStatisticsPane(game);

    const first = await game.page.locator('#stat_runTime').textContent();
    await game.page.waitForTimeout(2500);
    const second = await game.page.locator('#stat_runTime').textContent();

    expect(first).toBeTruthy();
    expect(second).toBeTruthy();
    // The run clock is the cheapest proof that getStats() is being called each
    // frame rather than once when the pane was drawn.
    expect(second, 'the run timer should have moved on').not.toBe(first);
    expect(second).toMatch(/\d+\s*[smhd]/);
  });

  test('opening and re-opening the page writes nothing to the console', async ({ game }) => {
    await openStatisticsPane(game);
    await game.openTab(1);
    await game.page.waitForTimeout(400);
    await openStatisticsPane(game);
    await game.page.waitForTimeout(1500);

    expect(game.significantErrors()).toEqual([]);
  });
});

// -------------------------------------------------------- research statistics

test.describe('Statistics — research and technology', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.debugClick('give1BButton');
  });

  test('each research building bought adds exactly one to its own statistic', async ({ game }) => {
    await game.debugClick('grantAllTechsButton');
    await game.page.waitForTimeout(1200);
    await dismissPopup(game);
    await game.openTab(3);
    await openPaneById(game, 'researchOption');

    const keys = ['stat_scienceKits', 'stat_scienceKitsThisRun', 'stat_scienceClubs', 'stat_scienceClubsThisRun'];
    const before = await readStats(game, keys);

    await clickRowButton(game, 'researchScienceKitRow');
    await clickRowButton(game, 'researchScienceKitRow');
    await clickRowButton(game, 'researchScienceKitRow');
    await clickRowButton(game, 'researchScienceClubRow');
    await game.page.waitForTimeout(500);

    const after = await readStats(game, keys);

    expect(after.stat_scienceKits - before.stat_scienceKits, 'three kits bought').toBe(3);
    expect(after.stat_scienceKitsThisRun - before.stat_scienceKitsThisRun).toBe(3);
    expect(after.stat_scienceClubs - before.stat_scienceClubs, 'one club bought').toBe(1);
    expect(after.stat_scienceClubsThisRun - before.stat_scienceClubsThisRun).toBe(1);
  });

  test('research produced is added to the research statistic, to the point earned', async ({ game }) => {
    await game.openTab(3);
    await openPaneById(game, 'researchOption');
    for (let i = 0; i < 20; i++) await clickRowButton(game, 'researchScienceKitRow');

    const keys = ['stat_researchPoints', 'stat_researchPointsThisRun'];
    const pool = ['research', 'quantity'];
    const before = await readStatsAndQuantity(game, keys, pool);

    await game.page.waitForTimeout(4000);

    const after = await readStatsAndQuantity(game, keys, pool);

    const earned = after.quantity - before.quantity;
    expect(earned, 'twenty science kits should have produced something').toBeGreaterThan(5);

    // The statistic counts research *earned*, so it must match what the pool
    // gained — a statistic that drifted from the pool would be silently wrong
    // for the whole rest of the run.
    expect(after.stats.stat_researchPoints - before.stats.stat_researchPoints).toBeCloseTo(earned, 1);
    expect(after.stats.stat_researchPointsThisRun - before.stats.stat_researchPointsThisRun).toBeCloseTo(earned, 1);
  });

  test('researching a tech adds one to the techs-unlocked statistic', async ({ game }) => {
    await game.debugClick('give1MResearch');
    await game.openTab(3);
    await openPaneById(game, 'technologyOption');

    const keys = ['stat_techsUnlocked', 'stat_techsUnlockedThisRun'];
    const before = await readStats(game, keys);

    await clickRowButton(game, 'techKnowledgeSharingRow');
    await game.page.waitForTimeout(600);

    const after = await readStats(game, keys);

    expect(after.stat_techsUnlockedThisRun - before.stat_techsUnlockedThisRun).toBe(1);
    expect(after.stat_techsUnlocked - before.stat_techsUnlocked).toBe(1);
  });
});

// --------------------------------------------------------- resource statistics

test.describe('Statistics — resources', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.openTab(1);
    await openPaneById(game, 'hydrogenOption');
  });

  test('gaining a resource by hand adds exactly what was gained', async ({ game }) => {
    const keys = ['stat_hydrogen', 'stat_hydrogenThisRun'];
    const before = await readStats(game, keys);
    const quantityBefore = await game.withMods((m) =>
      m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']));

    for (let i = 0; i < 5; i++) await clickRowButton(game, 'hydrogenGainRow');
    await game.page.waitForTimeout(400);

    const after = await readStats(game, keys);
    const quantityAfter = await game.withMods((m) =>
      m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']));

    expect(quantityAfter - quantityBefore, 'five presses of the gain button').toBe(5);
    expect(after.stat_hydrogen - before.stat_hydrogen).toBe(5);
    expect(after.stat_hydrogenThisRun - before.stat_hydrogenThisRun).toBe(5);
  });

  test('a gain refused because the store is full is not counted', async ({ game }) => {
    // `gain()` clamps at storage capacity and returns without touching the
    // statistic. A statistic that counted the press rather than the gain would
    // over-report every resource in a capped run.
    await game.withMods((m) => {
      const capacity = m.rdo.getResourceDataObject('resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(capacity, 'resources', ['hydrogen', 'quantity']);
    });
    await game.page.waitForTimeout(400);

    const keys = ['stat_hydrogen', 'stat_hydrogenThisRun'];
    const before = await readStats(game, keys);

    for (let i = 0; i < 5; i++) await clickRowButton(game, 'hydrogenGainRow');
    await game.page.waitForTimeout(400);

    const after = await readStats(game, keys);

    expect(after.stat_hydrogen - before.stat_hydrogen, 'nothing was gained, so nothing is counted').toBe(0);
    expect(after.stat_hydrogenThisRun - before.stat_hydrogenThisRun).toBe(0);
  });

  test('resources an autobuyer produces are counted as they accrue', async ({ game }) => {
    // The manual button and the autobuyer are different code paths into the same
    // statistic, and the autobuyer is the one that produces almost everything a
    // real run ever counts.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(1e12, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'quantity']);
      m.rdo.setResourceDataObject(true, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'active']);
      m.rdo.setResourceDataObject(50, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      m.rdo.setResourceDataObject(1, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'currentTierLevel']);
    });
    await game.page.waitForTimeout(800);

    const keys = ['stat_hydrogen', 'stat_hydrogenThisRun'];
    const store = ['resources', 'hydrogen', 'quantity'];
    const before = await readStatsAndQuantity(game, keys, store);

    await game.page.waitForTimeout(4000);

    const after = await readStatsAndQuantity(game, keys, store);

    const produced = after.quantity - before.quantity;
    expect(produced, 'a tier 1 autobuyer should have produced something').toBeGreaterThan(0);
    expect(after.stats.stat_hydrogen - before.stats.stat_hydrogen).toBeCloseTo(produced, 1);
    expect(after.stats.stat_hydrogenThisRun - before.stats.stat_hydrogenThisRun).toBeCloseTo(produced, 1);
  });
});

// ----------------------------------------------------------- energy statistics

test.describe('Statistics — energy', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.debugClick('give1BButton');
    await game.debugClick('grantAllTechsButton');
    await game.page.waitForTimeout(1200);
    await dismissPopup(game);
  });

  test('buying a power plant adds one to the basic power plant statistic', async ({ game }) => {
    await game.openTab(2);
    await openPaneById(game, 'powerPlant1Option');

    const keys = ['stat_basicPowerPlants', 'stat_basicPowerPlantsThisRun'];
    const before = await readStats(game, keys);

    // The row carries a Sell button first and the purchase button second, so the
    // purchase has to be addressed by its own class.
    await clickRowButton(game, 'energyPowerPlant1Row', '.building-purchase-button');
    await clickRowButton(game, 'energyPowerPlant1Row', '.building-purchase-button');
    await game.page.waitForTimeout(500);

    const after = await readStats(game, keys);
    const built = await game.withMods((m) =>
      m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']));

    expect(built, 'two plants bought through the purchase button').toBe(2);
    expect(after.stat_basicPowerPlants - before.stat_basicPowerPlants).toBe(2);
    expect(after.stat_basicPowerPlantsThisRun - before.stat_basicPowerPlantsThisRun).toBe(2);
  });

  test('overloading the grid trips it, and the trip is counted', async ({ game }) => {
    // Buy one small power plant, then hang ten Science Labs off it. One plant
    // makes 0.05; ten labs draw 3.5. With no battery in the run, the frame loop
    // sees a negative net rate and cuts the power — which is the moment the
    // times-tripped statistic is written.
    await game.openTab(2);
    await openPaneById(game, 'powerPlant1Option');
    await clickRowButton(game, 'energyPowerPlant1Row', '.building-purchase-button');
    await game.withMods((m) => {
      m.cg.setInfinitePower(false);
      m.game.toggleBuildingTypeOnOff('powerPlant1', true);
      m.rdo.setResourceDataObject(1e6, 'resources', ['carbon', 'storageCapacity']);
      m.rdo.setResourceDataObject(1e6, 'resources', ['carbon', 'quantity']);
      m.cg.setPowerOnOff(true);
    });
    await game.page.waitForTimeout(1200);

    const keys = ['stat_timesTripped', 'stat_timesTrippedThisRun'];
    const before = await readStats(game, keys);
    expect(await game.withMods((m) => m.cg.getPowerOnOff()),
      'the grid should be up before it is overloaded').toBe(true);

    await game.openTab(3);
    await openPaneById(game, 'researchOption');
    for (let i = 0; i < 10; i++) await clickRowButton(game, 'researchScienceLabRow');
    await game.page.waitForTimeout(3000);

    const after = await readStats(game, keys);
    const state = await game.withMods((m) => ({
      powerOn: m.cg.getPowerOnOff(),
      use: m.cg.getTotalEnergyUse(),
      rate: m.rdo.getResourceDataObject('buildings', ['energy', 'rate'])
    }));

    expect(state.use, 'ten Science Labs draw 3.5').toBeGreaterThan(state.rate);
    expect(state.powerOn, 'a grid drawing more than it makes should trip').toBe(false);
    expect(after.stat_timesTripped - before.stat_timesTripped,
      'the trip should be counted').toBeGreaterThanOrEqual(1);
    expect(after.stat_timesTrippedThisRun - before.stat_timesTrippedThisRun).toBeGreaterThanOrEqual(1);
  });
});

// --------------------------------------------------------- overview statistics

test.describe('Statistics — the overview and run figures', () => {
  test('the overview reports this run\'s own pioneer, run number and system', async ({ game }) => {
    await game.boot();
    await openStatisticsPane(game);

    const shown = await game.page.evaluate(() => ({
      pioneer: document.getElementById('stat_pioneer')?.textContent?.trim(),
      run: document.getElementById('stat_run')?.textContent?.trim(),
      system: document.getElementById('stat_starSystem')?.textContent?.trim(),
      theme: document.getElementById('stat_theme')?.textContent?.trim()
    }));

    const truth = await game.withMods((m) => ({
      pioneer: m.cg.getSaveName(),
      run: m.cg.getStatRun(),
      system: m.cg.getCurrentStarSystem()
    }));

    expect(shown.pioneer).toBe(truth.pioneer);
    expect(shown.run).toBe(String(truth.run));
    expect(shown.system.toLowerCase()).toBe(String(truth.system).toLowerCase());
    expect(shown.theme, 'the theme cell should name a theme, not a key').toBeTruthy();
    expect(shown.theme).not.toMatch(/^stat/);
  });

  test('the cash figure follows the run\'s actual cash', async ({ game }) => {
    await game.boot();
    await openStatisticsPane(game);

    const before = await game.page.locator('#stat_cash').textContent();
    await game.debugClick('give1BButton');
    await game.page.waitForTimeout(1200);
    const after = await game.page.locator('#stat_cash').textContent();

    const asNumber = (text) => Number(String(text).replace(/[^\d.]/g, ''));

    expect(after).not.toBe(before);
    expect(asNumber(after), 'a billion granted should show as a bigger figure')
      .toBeGreaterThan(asNumber(before));
    expect(after).not.toContain('NaN');
  });

  test('the elapsed time figures are formatted durations, not raw milliseconds', async ({ game }) => {
    await game.boot();
    await game.page.waitForTimeout(2000);
    await openStatisticsPane(game);

    const times = await game.page.evaluate(() => ({
      played: document.getElementById('stat_timePlayed')?.textContent?.trim(),
      run: document.getElementById('stat_runTime')?.textContent?.trim()
    }));

    // `formatTime()` produces "1d 2h 3m 4s"-style strings; a bare millisecond
    // count would be an unreadable six-figure number with no unit.
    expect(times.played).toMatch(/^\d+[dhms]( \d+[dhms])*$/);
    expect(times.run).toMatch(/^\d+[dhms]( \d+[dhms])*$/);
  });
});

// ------------------------------------------------- this run versus all time

test.describe('Statistics — this run versus all time', () => {
  test('within one run the two columns move together', async ({ game }) => {
    await game.boot();
    await game.debugClick('give1BButton');
    await game.openTab(3);
    await openPaneById(game, 'researchOption');

    const keys = ['stat_scienceKits', 'stat_scienceKitsThisRun', 'stat_researchPoints', 'stat_researchPointsThisRun'];
    const before = await readStats(game, keys);

    for (let i = 0; i < 6; i++) await clickRowButton(game, 'researchScienceKitRow');
    await game.page.waitForTimeout(2500);

    const after = await readStats(game, keys);

    expect(after.stat_scienceKits - before.stat_scienceKits)
      .toBe(after.stat_scienceKitsThisRun - before.stat_scienceKitsThisRun);
    expect(after.stat_researchPoints - before.stat_researchPoints)
      .toBeCloseTo(after.stat_researchPointsThisRun - before.stat_researchPointsThisRun, 3);
  });

  test('a rebirth clears the run column and leaves the all-time column standing', async ({ game, page }) => {
    // The contract the statistics page advertises with its two headings: the
    // run column is about this run, the all-time column is about the save. A
    // lifetime total that a rebirth zeroes is a number the player watched go up
    // and then silently lost.
    await game.boot();
    await game.debugClick('give1BButton');
    await game.debugClick('grantAllTechsButton');
    await page.waitForTimeout(1200);
    await dismissPopup(game);

    // Earn something in each of the families the page tracks.
    await game.openTab(1);
    await openPaneById(game, 'hydrogenOption');
    for (let i = 0; i < 5; i++) await clickRowButton(game, 'hydrogenGainRow');
    await game.openTab(3);
    await openPaneById(game, 'researchOption');
    for (let i = 0; i < 5; i++) await clickRowButton(game, 'researchScienceKitRow');
    await game.openTab(2);
    await openPaneById(game, 'powerPlant1Option');
    await clickRowButton(game, 'energyPowerPlant1Row', '.building-purchase-button');
    await clickRowButton(game, 'energyPowerPlant1Row', '.building-purchase-button');

    await game.prepareRunForStarshipLaunch();
    await dismissPopup(game);
    await page.waitForTimeout(1500);

    const allTimeKeys = [
      'stat_researchPoints', 'stat_scienceKits', 'stat_hydrogen',
      'stat_basicPowerPlants', 'stat_totalAsteroidsDiscovered'
    ];
    const runKeys = [
      'stat_researchPointsThisRun', 'stat_scienceKitsThisRun', 'stat_hydrogenThisRun',
      'stat_basicPowerPlantsThisRun', 'stat_asteroidsDiscoveredThisRun'
    ];

    const before = await readStats(game, [...allTimeKeys, ...runKeys]);
    for (const key of allTimeKeys) {
      expect(before[key], `${key} should have been earned before the rebirth`).toBeGreaterThan(0);
    }

    // Take the rebirth through its own button, the way a player does.
    await game.withMods((m) => {
      m.game.generateStarDataAndAddToDataObject({ id: 'vega' }, 12);
      m.cg.setDestinationStar('vega');
      m.rdo.copyStarDataToDestinationStarField('vega');
      m.cg.setDestinationStarScanned(true);
      m.cg.setBattleResolved(true, 'player');
    });
    await dismissPopup(game);
    await game.openTab(7);
    await openPaneById(game, 'rebirthOption');

    const runBefore = await game.withMods((m) => m.cg.getStatRun());
    await page.evaluate(() => document.querySelector('.rebirth-check')?.click());
    await page.waitForTimeout(800);
    await page.evaluate(() => document.getElementById('modalConfirm')?.click());
    await page.waitForFunction(
      (previous) => globalThis.__mods.cg.getStatRun() === previous + 1,
      runBefore,
      { timeout: 30000 }
    );
    await page.waitForTimeout(1500);

    const after = await readStats(game, [...allTimeKeys, ...runKeys]);

    const runNotCleared = runKeys.filter((key) => after[key] !== 0);
    expect(runNotCleared, 'every run statistic should be back to zero').toEqual([]);

    const lifetimeLost = allTimeKeys.filter((key) => after[key] < before[key]);
    expect(lifetimeLost, 'no all-time statistic may go down across a rebirth').toEqual([]);
  });
});
