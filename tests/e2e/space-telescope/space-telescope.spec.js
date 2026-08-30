/**
 * Area: Space Telescope — built, aimed and run through its own pane
 * Plan: tests/docs/areas/space-telescope.md
 *
 * The telescope is one building with three jobs, and the three cannot run at
 * once. `setAsteroidTimerCanContinue`, `setStarInvestigationTimerCanContinue` and
 * `setPillageVoidTimerCanContinue` are re-derived on **every frame** from the
 * same three facts — the grid is up, and neither of the other two actions is
 * running — so the interlock is not a property of any one handler. It only
 * exists while the frame loop is turning, which is why it has to be tested by
 * playing rather than by calling the timer functions.
 *
 * What this file covers, in the order a run meets it:
 *
 * | Stage | What is pinned |
 * |---|---|
 * | Building it | the four prices — cash, iron, glass, silicon — come off the board, and the two action rows appear only once it is bought |
 * | Scanning for asteroids | a scan run to completion adds a real asteroid record and reveals the Asteroids pane |
 * | The cost of success | every asteroid found makes the *next* search longer, by a flat 7% of the base each time |
 * | Studying stars | a study run to completion extends the vision range, and the star map redraws with stars that were out of reach before |
 * | One telescope | with a scan running, a study cannot start; with the grid down, neither advances |
 * | Void Seers | the Voidborn special ability adds a third job, and it takes the same lock as the other two |
 * | The auto-telescope | the Ascendency perk's row repeats the selected mode without a press |
 *
 * ## Two things shape how these specs are written
 *
 * **A search can legitimately fail.** `discoverAsteroid` rolls a 7% miss for any
 * non-debug discovery, so "press the button once, expect an asteroid" is a spec
 * that fails one run in fourteen. Everything here that needs a discovery either
 * scans until one lands or measures against the number of asteroids that were
 * actually added, never against the number of scans performed.
 *
 * **Durations are randomised by ±20%.** `getAsteroidSearchDuration` and
 * `getStarInvestigationDuration` both add a random offset to the base, so the
 * assertions are about the *base* duration — the number the game raises after a
 * find — and the timers are driven to completion by advancing the delta manager
 * well past the widest possible roll.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** Building the telescope, then running minute-long timers out, is not quick. */
test.describe.configure({ timeout: 180_000 });

/** `ASTEROID_COST_MULTIPLIER` — the rise applied to the base search after a find. */
const ASTEROID_COST_MULTIPLIER = 1.07;

/** Longer than the widest star-study roll (400s + 20%), so any action completes. */
const RUN_ANY_ACTION_TO_COMPLETION_MS = 600_000;

// --------------------------------------------------------------------- helpers

/** Close whatever modal is currently up, whichever of the two buttons it uses. */
async function dismissAnyOpenModal(page) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const closed = await page.evaluate(() => {
      const cancel = document.getElementById('modalCancel');
      if (cancel?.offsetParent) { cancel.click(); return true; }
      const confirm = document.getElementById('modalConfirm');
      if (confirm?.offsetParent) { confirm.click(); return true; }
      return false;
    });
    if (!closed) return;
    await page.waitForTimeout(400);
  }
}

/**
 * Open the Space Telescope pane.
 *
 * The pane is bounced off the Launch Pad first so that `drawTab6Content` runs
 * again from the top: the rows are built once per open and their visibility is
 * decided at build time from `spaceTelescopeBoughtYet` and the philosophy, so a
 * pane left open across a purchase shows the state it was drawn in.
 */
async function openTelescopePane(game, page) {
  await dismissAnyOpenModal(page);
  await game.openTab(6);
  await page.evaluate(() => {
    document.getElementById('launchPadOption')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const option = document.getElementById('spaceTelescopeOption');
    option?.classList.remove('invisible');
    option?.closest('.row-side-menu')?.classList.remove('invisible');
    option?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await page.waitForTimeout(700);
}

/** Which telescope rows the pane is currently showing. */
async function telescopeRows(page) {
  return page.evaluate(() => {
    const state = (id) => {
      const row = document.getElementById(id);
      return { present: Boolean(row), visible: Boolean(row) && !row.classList.contains('invisible') };
    };
    // `present` is deliberately "on the pane", not "somewhere in the document":
    // `createOptionRow` builds a row whether or not the pane appends it, so a row
    // the pane left out can still be reachable by id.
    const onPane = (id) => {
      const row = document.getElementById(id);
      const pane = document.getElementById('optionContentTab6');
      return Boolean(row) && Boolean(pane) && pane.contains(row);
    };
    return {
      build: state('spaceBuildTelescopeRow'),
      searchAsteroid: state('spaceTelescopeSearchAsteroidRow'),
      investigateStar: state('spaceTelescopeInvestigateStarRow'),
      pillageVoid: state('spaceTelescopePhilosophyBoostResourcesAndCompoundsRow'),
      auto: { ...state('spaceTelescopeAutoRow'), present: onPane('spaceTelescopeAutoRow') }
    };
  });
}

/** Press one of the telescope's action buttons by the row it lives in. */
async function pressTelescopeAction(page, rowId) {
  const pressed = await page.evaluate((id) => {
    const button = document.getElementById(id)?.querySelector('button');
    if (!button) return false;
    // Dispatched rather than clicked: these buttons carry `red-disabled-text`
    // (`pointer-events: none`) whenever the action is unavailable, and that CSS
    // gate is asserted on its own where it matters. Dispatching exercises the
    // handler; the class is what the specs read for the gate itself.
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, rowId);
  if (!pressed) throw new Error(`No button in telescope row: ${rowId}`);
  await page.waitForTimeout(250);
}

/** Everything the three actions share, read in one hop. */
async function readTelescopeState(game) {
  return game.withMods((m) => ({
    built: m.rdo.getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'spaceTelescopeBoughtYet']),
    searching: m.cg.getCurrentlySearchingAsteroid(),
    investigating: m.cg.getCurrentlyInvestigatingStar(),
    pillaging: m.cg.getCurrentlyPillagingVoid(),
    asteroidTimeLeft: m.cg.getTimeLeftUntilAsteroidScannerTimerFinishes(),
    starTimeLeft: m.cg.getTimeLeftUntilStarInvestigationTimerFinishes(),
    baseAsteroidDuration: m.cg.getBaseSearchAsteroidTimerDuration(),
    baseStarDuration: m.cg.getBaseInvestigateStarTimerDuration(),
    asteroidCount: (m.cg.getAsteroidArray() ?? []).length,
    starVisionDistance: m.cg.getStarVisionDistance(),
    starVisionIncrement: m.cg.getStarVisionIncrement(),
    powerOn: m.cg.getPowerOnOff(),
    canSearch: m.cg.getAsteroidTimerCanContinue(),
    canStudy: m.cg.getStarInvestigationTimerCanContinue(),
    canPillage: m.cg.getPillageVoidTimerCanContinue()
  }));
}

/**
 * The setup for buying the Space Telescope or the Launch Pad: money, materials,
 * techs, and nothing else.
 *
 * This is exactly the sequence a developer uses by hand — *Give $1B*, *Give 1M of
 * all Resources and Compounds*, *Grant All Techs*, then straight to the Space
 * Mining tab — and it is deliberately the whole of it. Reaching for a heavier
 * scenario puts the run in a state the purchase was never meant to be made from:
 * `prepareRunForStarshipLaunch` chains *Build Launch Pad, Scanner and All
 * Rockets*, which builds the telescope outright, and *Add 10 Asteroids*, which
 * reveals the Asteroids pane and raises the base search duration ten times over.
 * Both are precisely what these specs exist to watch happen.
 */
async function stockRunForPurchase(game, page) {
  await game.debugClick('give1BButton');
  await game.debugClick('give1MAllResourcesAndCompounds');
  await game.debugClick('grantAllTechsButton');
  await page.waitForTimeout(600);
  await dismissAnyOpenModal(page);
}

/**
 * The purchase setup, plus the two things only the *action* specs need.
 *
 * Kept separate so the build specs stay on the minimal setup above: if a build
 * spec ever fails, the staging is small enough to rule out as the cause.
 */
async function stockRunWithoutTelescope(game, page) {
  await stockRunForPurchase(game, page);
  await game.debugClick('unlockAllTabsButton');
  await page.waitForTimeout(300);
  await game.withMods((m) => {
    // The telescope draws power for every action, and a fresh run has none.
    m.cg.setInfinitePower(true);
    m.cg.setPowerOnOff(true);
    // A completed star study offers the philosophy choice while none is set,
    // and that modal would sit over every later click. Run 1's own default is
    // what the debug scenario picks, so this matches it.
    if (!m.cg.getPlayerPhilosophy()) m.cg.setPlayerPhilosophy('voidborn');
  });
  await page.waitForTimeout(300);
}

/**
 * Put a built telescope on the board through the debug menu.
 *
 * The purchase itself is played through the pane's own button by the one spec
 * that is about buying it. Everywhere else the telescope is a precondition, and
 * `buildLaunchPadScannerAndAllRocketsButton` is the game's own route to it: it
 * calls `buildSpaceMiningBuilding('spaceTelescope', true)`, so the board ends up
 * in the same state without the purchase's own UI tidy-up running.
 *
 * Keeping the played purchase in one spec means the rest of the file is not
 * re-testing it, and a failure there points at the purchase rather than at
 * whatever the failing spec was really about.
 */
async function buildTelescopeThroughDebugMenu(game, page) {
  await game.debugClick('buildLaunchPadScannerAndAllRocketsButton');
  await page.waitForTimeout(400);
  await dismissAnyOpenModal(page);
  const built = await game.withMods((m) =>
    m.rdo.getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'spaceTelescopeBoughtYet']));
  expect(built, 'the telescope should be on the board').toBe(true);
  await openTelescopePane(game, page);
}

/**
 * Run one asteroid search to completion and report whether it found anything.
 *
 * The seven-percent miss is by design, so the caller is told which happened
 * rather than being handed a failure.
 */
async function runOneAsteroidSearch(game, page) {
  const before = await readTelescopeState(game);
  await pressTelescopeAction(page, 'spaceTelescopeSearchAsteroidRow');
  const started = await readTelescopeState(game);
  await game.advanceTimers(RUN_ANY_ACTION_TO_COMPLETION_MS);
  await page.waitForTimeout(400);
  await dismissAnyOpenModal(page);
  const after = await readTelescopeState(game);
  return {
    started: started.searching,
    found: after.asteroidCount > before.asteroidCount,
    before,
    after
  };
}

// ------------------------------------------------------ building the telescope

test.describe('Space Telescope — building it', () => {
  test('the build button charges cash, iron, glass and silicon, and opens the two actions', async ({ game, page }) => {
    await game.boot();
    await stockRunForPurchase(game, page);
    await openTelescopePane(game, page);

    // Before the purchase the pane is a shop and nothing else: the two action
    // rows are built every time but `drawTab6Content` hides them while
    // `spaceTelescopeBoughtYet` is false.
    const before = await telescopeRows(page);
    expect(before.build.visible, 'an unbuilt telescope shows its build row').toBe(true);
    expect(before.searchAsteroid.present).toBe(true);
    expect(before.searchAsteroid.visible, 'no telescope, no asteroid scanning').toBe(false);
    expect(before.investigateStar.visible, 'no telescope, no star study').toBe(false);

    const prices = await game.withMods((m) => {
      const at = (key) => m.rdo.getResourceDataObject('space', ['upgrades', 'spaceTelescope', key]);
      return {
        cash: at('price'),
        resource1: at('resource1Price'),
        resource2: at('resource2Price'),
        resource3: at('resource3Price')
      };
    });
    // The three material prices are `[quantity, name, category]` triples, and
    // the categories differ — iron and silicon are resources, glass a compound.
    // Reading them from the data object rather than hard-coding them means the
    // spec still measures the right stores if the recipe is retuned.
    expect(prices.resource1[1]).toBe('iron');
    expect(prices.resource2[1]).toBe('glass');
    expect(prices.resource3[1]).toBe('silicon');

    const readStores = () => game.withMods((m, p) => ({
      cash: m.rdo.getResourceDataObject('currency', ['cash']),
      r1: m.rdo.getResourceDataObject(p.resource1[2], [p.resource1[1], 'quantity']),
      r2: m.rdo.getResourceDataObject(p.resource2[2], [p.resource2[1], 'quantity']),
      r3: m.rdo.getResourceDataObject(p.resource3[2], [p.resource3[1], 'quantity'])
    }), prices);

    const storesBefore = await readStores();

    // The real button, on the real row. This is the one place in the file that
    // buys the telescope rather than staging it.
    await page.evaluate(() => {
      document.querySelector('#spaceBuildTelescopeRow button.spaceTelescope')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await page.waitForTimeout(800);
    await dismissAnyOpenModal(page);

    const storesAfter = await readStores();
    expect(await game.withMods((m) =>
      m.rdo.getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'spaceTelescopeBoughtYet'])))
      .toBe(true);

    expect(storesAfter.cash).toBe(Math.floor(storesBefore.cash - prices.cash));
    expect(storesAfter.r1).toBe(Math.floor(storesBefore.r1 - prices.resource1[0]));
    expect(storesAfter.r2).toBe(Math.floor(storesBefore.r2 - prices.resource2[0]));
    expect(storesAfter.r3).toBe(Math.floor(storesBefore.r3 - prices.resource3[0]));

    // The pane is deliberately *not* reopened first. Buying the telescope is
    // supposed to change the pane the player is standing on: the build row goes,
    // the "Bought" text takes its place and the two action rows appear, all from
    // inside the click handler. Reading it after a redraw would measure
    // `drawTab6Content` rebuilding the pane from `spaceTelescopeBoughtYet`
    // instead, which is a different claim and one that holds either way.
    const after = await telescopeRows(page);
    const boughtText = await page.evaluate(() =>
      !document.getElementById('spaceTelescopeAlreadyBoughtText')?.classList.contains('invisible'));

    expect(after.searchAsteroid.visible, 'buying it should open asteroid scanning at once').toBe(true);
    expect(after.investigateStar.visible, 'and star study with it').toBe(true);
    expect(after.build.visible, 'a built telescope is not for sale twice').toBe(false);
    expect(boughtText, 'the row should report itself bought').toBe(true);

    expect(game.significantErrors()).toEqual([]);
  });

  test('an unaffordable telescope is gated by its colour class', async ({ game, page }) => {
    await game.boot();
    await stockRunForPurchase(game, page);

    // Affordability in this game is enforced by `red-disabled-text`, whose CSS
    // is `pointer-events: none`. What has to hold is that the frame loop keeps
    // the class in step with the purse, because that class is the whole gate.
    await game.debugClick('give100Button');
    await openTelescopePane(game, page);
    await page.waitForTimeout(700);

    const broke = await page.evaluate(() => {
      const button = document.querySelector('#spaceBuildTelescopeRow button.spaceTelescope');
      return {
        disabledClass: button.classList.contains('red-disabled-text'),
        pointerEvents: getComputedStyle(button).pointerEvents
      };
    });
    expect(broke.disabledClass, '$100 does not buy a telescope').toBe(true);
    expect(broke.pointerEvents).toBe('none');

    await game.debugClick('give1BButton');
    await page.waitForTimeout(700);
    const rich = await page.evaluate(() => {
      const button = document.querySelector('#spaceBuildTelescopeRow button.spaceTelescope');
      return {
        disabledClass: button.classList.contains('red-disabled-text'),
        pointerEvents: getComputedStyle(button).pointerEvents
      };
    });
    // `checkIfHaveEnoughResourceForUpgradeAndSetState` only ever adds and
    // removes `red-disabled-text` on a one-off purchase button — it does not
    // paint it green the way the tech and philosophy rows are painted — so the
    // affordable state is the *absence* of the gate, not a second class.
    expect(rich.disabledClass).toBe(false);
    expect(rich.pointerEvents).toBe('auto');
  });
});

// ------------------------------------------------------ searching for asteroids

test.describe('Space Telescope — searching for asteroids', () => {
  test.beforeEach(async ({ game, page }) => {
    await game.boot();
    await stockRunWithoutTelescope(game, page);
    await buildTelescopeThroughDebugMenu(game, page);
  });

  test('a search run to completion discovers a real asteroid and reveals the Asteroids pane', async ({ game, page }) => {
    const start = await readTelescopeState(game);
    expect(start.asteroidCount, 'this run has found nothing yet').toBe(0);

    const asteroidsPaneHidden = await page.evaluate(() =>
      document.getElementById('asteroidsOption')?.parentElement?.parentElement?.classList.contains('invisible'));
    expect(asteroidsPaneHidden, 'the Asteroids pane arrives with the first find').toBe(true);

    // A search finds nothing 7% of the time by design, so the discovery is
    // played for rather than demanded of one press.
    let found = false;
    for (let attempt = 0; attempt < 6 && !found; attempt++) {
      const run = await runOneAsteroidSearch(game, page);
      expect(run.started, 'pressing Scan Asteroids should start the search').toBe(true);
      found = run.found;
    }
    expect(found, 'six searches should not all miss a 7% roll').toBe(true);

    const discovered = await game.withMods((m) => {
      const asteroids = m.cg.getAsteroidArray() ?? [];
      const record = asteroids[asteroids.length - 1];
      const key = Object.keys(record)[0];
      return {
        count: asteroids.length,
        key,
        data: record[key],
        starCode: m.rdo.getStarSystemDataObject('stars', [m.cg.getCurrentStarSystem(), 'starCode']),
        // The flag `discoverAsteroid` raises is transient: `checkForAchievements`
        // consumes it on the next frame and removes it again, so the durable
        // record is the achievement itself being marked active.
        achievementActive: m.rdo.getAchievementDataObject('discoverAsteroid', ['active'])
      };
    });

    expect(discovered.count).toBeGreaterThan(0);
    // The name is the current system's three-letter code, four digits and a
    // letter — unless the roll came up Legendary, which renames it after the
    // commander instead.
    const ordinaryName = new RegExp(`^${discovered.starCode.toUpperCase()}-\\d{4}[A-Z]$`);
    const isLegendary = discovered.data.rarity[0] === 'Legendary';
    expect(isLegendary || ordinaryName.test(discovered.key),
      `unexpected asteroid name: ${discovered.key}`).toBe(true);
    expect(discovered.data.specialName).toBe(isLegendary);

    // The record has to be complete enough to mine: a distance for the rocket
    // journey, a quantity to extract, and an untouched flag.
    expect(discovered.data.distance[0]).toBeGreaterThanOrEqual(30000);
    expect(discovered.data.distance[0]).toBeLessThanOrEqual(570000);
    expect(discovered.data.quantity[0]).toBeGreaterThan(0);
    expect(discovered.data.originalQuantity).toBe(discovered.data.quantity[0]);
    expect(discovered.data.beingMined).toBe(false);
    expect(['Common', 'Uncommon', 'Rare', 'Legendary']).toContain(discovered.data.rarity[0]);

    expect(discovered.achievementActive, 'finding one is an achievement').toBe(true);

    const asteroidsPaneShown = await page.evaluate(() =>
      document.getElementById('asteroidsOption')?.parentElement?.parentElement?.classList.contains('invisible'));
    expect(asteroidsPaneShown, 'the first find opens the Asteroids pane').toBe(false);

    expect(game.significantErrors()).toEqual([]);
  });

  test('every asteroid found makes the next search longer, and a miss costs nothing', async ({ game, page }) => {
    // `discoverAsteroid` raises the base duration by 7% on its way out, and only
    // on a successful find — which is why this is measured against the number of
    // asteroids that actually appeared rather than the number of scans run.
    const initial = await readTelescopeState(game);
    expect(initial.asteroidCount).toBe(0);

    let searches = 0;
    for (let i = 0; i < 5; i++) {
      const run = await runOneAsteroidSearch(game, page);
      expect(run.started).toBe(true);
      searches++;
    }

    const end = await readTelescopeState(game);
    expect(searches).toBe(5);
    expect(end.asteroidCount, 'five searches should land at least one find').toBeGreaterThan(0);

    const expected = initial.baseAsteroidDuration * Math.pow(ASTEROID_COST_MULTIPLIER, end.asteroidCount);
    expect(end.baseAsteroidDuration).toBeCloseTo(expected, 3);
    // Stated the other way round, because this is the part a player feels: the
    // search is strictly slower than it was, and by less than if every scan had
    // counted.
    expect(end.baseAsteroidDuration).toBeGreaterThan(initial.baseAsteroidDuration);
    expect(end.baseAsteroidDuration)
      .toBeLessThanOrEqual(initial.baseAsteroidDuration * Math.pow(ASTEROID_COST_MULTIPLIER, searches));

    // The star study shares the pane but not the ledger.
    expect(end.baseStarDuration).toBe(initial.baseStarDuration);
  });

  test('a search in flight does not advance while the grid is down', async ({ game, page }) => {
    await pressTelescopeAction(page, 'spaceTelescopeSearchAsteroidRow');
    expect((await readTelescopeState(game)).searching).toBe(true);

    // The frame loop re-derives the grid from the plants every tick, so turning
    // the power off while fuelled plants are still running is undone at once.
    // Infinite power has the same effect, and `stockRunWithoutTelescope` turns
    // it on. Both have to go for "the grid is down" to mean anything.
    await game.withMods((m) => {
      m.cg.setInfinitePower(false);
      for (const plant of ['powerPlant1', 'powerPlant2', 'powerPlant3']) {
        m.rdo.setResourceDataObject(0, 'buildings', ['energy', 'upgrades', plant, 'quantity']);
        m.game.toggleBuildingTypeOnOff(plant, false);
      }
      m.cg.setPowerOnOff(false);
    });
    await page.waitForTimeout(600);

    const dark = await readTelescopeState(game);
    expect(dark.powerOn).toBe(false);
    expect(dark.canSearch, 'the frame loop should have closed the search gate').toBe(false);

    await game.advanceTimers(200_000);
    await page.waitForTimeout(300);
    const stillDark = await readTelescopeState(game);
    expect(stillDark.asteroidTimeLeft, 'an unpowered telescope makes no progress')
      .toBe(dark.asteroidTimeLeft);
    expect(stillDark.searching, 'and the search is still held open, not cancelled').toBe(true);

    await game.withMods((m) => {
      m.cg.setInfinitePower(true);
      m.cg.setPowerOnOff(true);
    });
    await page.waitForTimeout(600);
    expect((await readTelescopeState(game)).canSearch).toBe(true);

    await game.advanceTimers(20_000);
    await page.waitForTimeout(300);
    const lit = await readTelescopeState(game);
    expect(lit.asteroidTimeLeft, 'power restored, the countdown resumes')
      .toBeLessThan(stillDark.asteroidTimeLeft);
  });
});

// ----------------------------------------------------------- studying stars

test.describe('Space Telescope — studying stars', () => {
  test.beforeEach(async ({ game, page }) => {
    await game.boot();
    await stockRunWithoutTelescope(game, page);
    await buildTelescopeThroughDebugMenu(game, page);
  });

  test('a study run to completion extends the vision range and reveals more of the star map', async ({ game, page }) => {
    const before = await readTelescopeState(game);
    expect(before.starVisionDistance, 'a fresh run sees nothing beyond its own system').toBe(0);

    /** Count how much of the star map is in reach, as the map itself draws it. */
    const countRevealedStars = async () => {
      await game.openTab(5);
      await page.evaluate(() => {
        const option = document.getElementById('starMapOption');
        option?.classList.remove('invisible');
        option?.closest('.row-side-menu')?.classList.remove('invisible');
        option?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      await page.waitForTimeout(900);
      return page.evaluate(() => {
        // The map is drawn into `#optionContentTab5`, and the counts are scoped
        // to it so nothing else on the page with a `star` class is counted.
        // `star` is what an in-range system is drawn as; `star-uninteresting`
        // is the same system before the telescope has reached it.
        const map = document.getElementById('optionContentTab5');
        return {
          revealed: map ? map.querySelectorAll('.star').length : 0,
          outOfReach: map ? map.querySelectorAll('.star-uninteresting').length : 0
        };
      });
    };

    const mapBefore = await countRevealedStars();
    expect(mapBefore.outOfReach, 'most of the field starts out of reach').toBeGreaterThan(0);

    await openTelescopePane(game, page);
    await pressTelescopeAction(page, 'spaceTelescopeInvestigateStarRow');
    const running = await readTelescopeState(game);
    expect(running.investigating, 'pressing Study Stars should start the study').toBe(true);
    expect(running.starTimeLeft, 'and set a countdown to run down').toBeGreaterThan(0);

    await game.advanceTimers(RUN_ANY_ACTION_TO_COMPLETION_MS);
    await page.waitForTimeout(500);
    await dismissAnyOpenModal(page);

    const after = await readTelescopeState(game);
    expect(after.investigating, 'the study should have finished').toBe(false);
    expect(after.starTimeLeft).toBe(0);
    // `extendStarDataRange` adds one increment per study, scaled by the Deeper
    // Star Study perk — which nothing here has bought, so it is one increment.
    expect(after.starVisionDistance).toBe(before.starVisionDistance + before.starVisionIncrement);

    const mapAfter = await countRevealedStars();
    expect(mapAfter.revealed, 'a wider range puts more systems on the map')
      .toBeGreaterThan(mapBefore.revealed);
    expect(mapAfter.outOfReach).toBeLessThan(mapBefore.outOfReach);

    // Studying does not get dearer the way searching does: the star base is the
    // one the philosophy repeatable moves, and nothing else touches it.
    expect(after.baseStarDuration).toBe(before.baseStarDuration);

    expect(game.significantErrors()).toEqual([]);
  });

  test('the range keeps extending, one increment per study', async ({ game, page }) => {
    const start = await readTelescopeState(game);

    for (let study = 1; study <= 3; study++) {
      await openTelescopePane(game, page);
      await pressTelescopeAction(page, 'spaceTelescopeInvestigateStarRow');
      await game.advanceTimers(RUN_ANY_ACTION_TO_COMPLETION_MS);
      await page.waitForTimeout(400);
      await dismissAnyOpenModal(page);

      const now = await readTelescopeState(game);
      expect(now.starVisionDistance, `after study ${study}`)
        .toBe(start.starVisionDistance + start.starVisionIncrement * study);
      expect(now.investigating, `study ${study} should have closed out`).toBe(false);
    }

    expect(game.significantErrors()).toEqual([]);
  });
});

// --------------------------------------------------- one telescope, three jobs

test.describe('Space Telescope — one telescope, three jobs', () => {
  test.beforeEach(async ({ game, page }) => {
    await game.boot();
    await stockRunWithoutTelescope(game, page);
    await buildTelescopeThroughDebugMenu(game, page);
  });

  test('a star study cannot start while a search is running, and vice versa', async ({ game, page }) => {
    await pressTelescopeAction(page, 'spaceTelescopeSearchAsteroidRow');
    await page.waitForTimeout(600);

    const searching = await readTelescopeState(game);
    expect(searching.searching).toBe(true);
    expect(searching.canStudy, 'the frame loop closes the study gate while a search runs').toBe(false);

    // Press Study Stars anyway. `startInvestigateStarTimer` returns immediately
    // when its gate is shut, so the press must be a no-op rather than a second
    // action sharing the same instrument.
    await pressTelescopeAction(page, 'spaceTelescopeInvestigateStarRow');
    await page.waitForTimeout(400);
    const stillOnlySearching = await readTelescopeState(game);
    expect(stillOnlySearching.investigating, 'the telescope cannot do two jobs at once').toBe(false);
    expect(stillOnlySearching.searching).toBe(true);

    // Run the search out and the instrument frees up again.
    await game.advanceTimers(RUN_ANY_ACTION_TO_COMPLETION_MS);
    await page.waitForTimeout(500);
    await dismissAnyOpenModal(page);
    const free = await readTelescopeState(game);
    expect(free.searching).toBe(false);
    expect(free.canStudy, 'with the search done the study gate reopens').toBe(true);

    await openTelescopePane(game, page);
    await pressTelescopeAction(page, 'spaceTelescopeInvestigateStarRow');
    await page.waitForTimeout(400);
    const studying = await readTelescopeState(game);
    expect(studying.investigating).toBe(true);
    expect(studying.canSearch, 'and now the search gate is the one that is shut').toBe(false);

    await pressTelescopeAction(page, 'spaceTelescopeSearchAsteroidRow');
    await page.waitForTimeout(400);
    expect((await readTelescopeState(game)).searching).toBe(false);

    expect(game.significantErrors()).toEqual([]);
  });
});

// ------------------------------------------- the Voidborn ability's third job

test.describe('Space Telescope — Void Seers adds a third job', () => {
  /**
   * Reach run 2 as a Voidborn with the ability held.
   *
   * The pillage row is gated on three facts at once — the philosophy, the
   * ability flag and `getStatRun() > 1` — and `drawTab6Content` reads all three
   * when it builds the row. Run 2 is reached by playing run 1 out and rebirthing
   * through the Rebirth pane, because that is the only thing that moves the run
   * counter.
   */
  async function reachRunTwoAsVoidbornWithTheAbility(game, page) {
    await game.prepareRunForStarshipLaunch();
    await dismissAnyOpenModal(page);
    await game.withMods((m) => {
      m.cg.setPlayerPhilosophy('voidborn');
      m.game.generateStarDataAndAddToDataObject({ id: 'vega' }, 12);
      m.cg.setDestinationStar('vega');
      m.rdo.copyStarDataToDestinationStarField('vega');
      m.cg.setDestinationStarScanned(true);
      m.cg.setBattleResolved(true, 'player');
    });

    await dismissAnyOpenModal(page);
    await game.openTab(7);
    await page.evaluate(() => {
      const el = document.getElementById('rebirthOption');
      el?.closest('.row-side-menu')?.classList.remove('invisible');
      el?.classList.remove('invisible');
      el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await page.waitForTimeout(800);

    const confirmLabel = await game.withMods((m) =>
      m.loc.localize('modalRebirthConfirmLabel', m.cg.getLanguage()));
    await page.evaluate(() => document.querySelector('.rebirth-check')?.click());
    await page.waitForFunction(
      (label) => document.getElementById('modalConfirm')?.innerText?.trim() === label,
      confirmLabel,
      { timeout: 20000 }
    );
    await page.evaluate(() => document.getElementById('modalConfirm').click());
    await page.waitForFunction(() => globalThis.__mods.cg.getStatRun() === 2, null, { timeout: 30000 });
    await page.waitForTimeout(800);

    // The ability itself is bought on the Philosophy pane, which
    // `philosophies-live.spec.js` covers in full; here it is a precondition.
    await game.withMods((m) => m.cg.setPhilosophyAbilityActive(true));
  }

  test('the pillage row appears only with the ability, and takes the same lock as the other two', async ({ game, page }) => {
    test.setTimeout(300_000);

    await game.boot();
    await reachRunTwoAsVoidbornWithTheAbility(game, page);
    await stockRunWithoutTelescope(game, page);
    await buildTelescopeThroughDebugMenu(game, page);

    const withAbility = await telescopeRows(page);
    expect(withAbility.pillageVoid.present).toBe(true);
    expect(withAbility.pillageVoid.visible, 'Void Seers is what puts the pillage row on the pane').toBe(true);

    // Turning the ability off and redrawing is the control: the same run, the
    // same philosophy, the row gone.
    await game.withMods((m) => m.cg.setPhilosophyAbilityActive(false));
    await openTelescopePane(game, page);
    const withoutAbility = await telescopeRows(page);
    expect(withoutAbility.pillageVoid.visible, 'without the ability the row stays hidden').toBe(false);
    expect(withoutAbility.searchAsteroid.visible, 'the other two are unaffected').toBe(true);

    await game.withMods((m) => m.cg.setPhilosophyAbilityActive(true));
    await openTelescopePane(game, page);

    // The third job shares the one instrument. This is the part that belongs to
    // the telescope rather than to the philosophy: `setAsteroidTimerCanContinue`
    // and `setStarInvestigationTimerCanContinue` both subtract
    // `getCurrentlyPillagingVoid()`, so starting a pillage must shut both.
    await page.evaluate(() => {
      document.getElementById('spaceTelescopePhilosophyBoostResourcesAndCompoundsRow')
        ?.querySelector('button.pillageVoid')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await page.waitForTimeout(700);

    const pillaging = await readTelescopeState(game);
    expect(pillaging.pillaging, 'the pillage should have started').toBe(true);
    expect(pillaging.canSearch, 'a pillage locks out asteroid searching').toBe(false);
    expect(pillaging.canStudy, 'and star study too').toBe(false);

    await pressTelescopeAction(page, 'spaceTelescopeSearchAsteroidRow');
    await pressTelescopeAction(page, 'spaceTelescopeInvestigateStarRow');
    await page.waitForTimeout(400);
    const stillOnlyPillaging = await readTelescopeState(game);
    expect(stillOnlyPillaging.searching).toBe(false);
    expect(stillOnlyPillaging.investigating).toBe(false);
    expect(stillOnlyPillaging.pillaging).toBe(true);

    // And the instrument comes back when the pillage finishes.
    await game.advanceTimers(RUN_ANY_ACTION_TO_COMPLETION_MS);
    await page.waitForTimeout(600);
    await dismissAnyOpenModal(page);
    const done = await readTelescopeState(game);
    expect(done.pillaging).toBe(false);
    expect(done.canSearch).toBe(true);
    expect(done.canStudy).toBe(true);

    expect(game.significantErrors()).toEqual([]);
  });
});

// --------------------------------------------------------- the auto-telescope

test.describe('Space Telescope — the auto-telescope', () => {
  test.beforeEach(async ({ game, page }) => {
    await game.boot();
    await stockRunWithoutTelescope(game, page);
    // The auto row is built only once the `autoSpaceTelescope` perk has enabled
    // it, and `purchaseBuff` is the function the Ascendency pane's own buttons
    // call — so this is the perk being bought, not the flag being forced.
    await game.debugClick('add100ApButton');
    await game.withMods((m) => m.game.purchaseBuff('autoSpaceTelescope'));
    await buildTelescopeThroughDebugMenu(game, page);
  });

  test('the perk adds the auto row, and the selected mode repeats without a press', async ({ game, page }) => {
    const rows = await telescopeRows(page);
    expect(rows.auto.visible, 'the perk is what puts the auto row on the pane').toBe(true);

    const modes = await page.evaluate(() =>
      Array.from(document.querySelectorAll('#autoSpaceTelescopeModeDropdown div.dropdown-option'))
        .map((el) => el.dataset.value));
    // The third mode belongs to Voidborn's ability and is covered above; a run
    // without it gets exactly the two ordinary jobs.
    expect(modes).toEqual(['studyAsteroid', 'studyStars']);

    // Point it at the star study, which has no random failure to reason about.
    await page.evaluate(() => {
      const option = Array.from(document.querySelectorAll('#autoSpaceTelescopeModeDropdown div.dropdown-option'))
        .find((el) => el.dataset.value === 'studyStars');
      option?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await page.waitForTimeout(400);
    // The toggle is a real checkbox listening for `change`, so it is switched
    // by clicking its label — dispatching at the input would not flip it.
    await page.click('label[for="autoTelescopeToggle"]');
    await page.waitForTimeout(600);

    const enabled = await game.withMods((m) => ({
      mode: m.rdo.getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'autoSpaceTelescopeMode']),
      on: m.rdo.getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'autoSpaceTelescopeEnabled']),
      rowEnabled: m.rdo.getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'autoSpaceTelescopeRowEnabled'])
    }));
    expect(enabled.mode, 'the dropdown should have recorded the choice').toBe('studyStars');
    expect(enabled.rowEnabled).toBe(true);
    expect(enabled.on, 'the toggle should have switched the automation on').toBe(true);

    const before = await readTelescopeState(game);

    // Nothing is pressed from here on. `checkAndStartAutoTelescopeAction` runs
    // on the frame loop and starts the selected action whenever no telescope
    // timer is live, so two studies should complete on their own.
    for (let cycle = 1; cycle <= 2; cycle++) {
      await page.waitForFunction(() => globalThis.__mods.cg.getCurrentlyInvestigatingStar() === true,
        null, { timeout: 15000 });
      await game.advanceTimers(RUN_ANY_ACTION_TO_COMPLETION_MS);
      await page.waitForTimeout(500);
      await dismissAnyOpenModal(page);
      const now = await readTelescopeState(game);
      expect(now.starVisionDistance, `automation should have completed cycle ${cycle}`)
        .toBe(before.starVisionDistance + before.starVisionIncrement * cycle);
    }

    expect(game.significantErrors()).toEqual([]);
  });
});

// ------------------------ what the pane says while one of the jobs is running

/** The status line of a telescope row, as the player reads it. */
async function rowStatusText(page, rowId) {
  return page.evaluate((id) => document.getElementById(id)
    ?.querySelector('.description-container .notation')?.innerText?.trim(), rowId);
}

/** Localised copy, read from the game rather than hard-coded in English. */
async function telescopeCopy(game) {
  return game.withMods((m) => {
    const lang = m.cg.getLanguage();
    return {
      readyToSearch: m.loc.localize('textReadyToSearch', lang),
      readyToStudy: m.loc.localize('textReadyToStudy', lang),
      busyStudying: m.loc.localize('textCurrentlyInvestigatingStars', lang),
      busySearching: m.loc.localize('textCurrentlySearchingAsteroids', lang),
      requiresPower: m.loc.localize('textRequiresPower', lang)
    };
  });
}

/** Which control each row is currently showing: its button, or its progress bar. */
async function rowControls(page) {
  return page.evaluate(() => {
    const vis = (el) => Boolean(el) && !el.classList.contains('invisible');
    const of = (rowId, barId) => ({
      buttonVisible: vis(document.getElementById(rowId)?.querySelector('button')),
      progressBarVisible: vis(document.getElementById(barId))
    });
    return {
      searchAsteroid: of('spaceTelescopeSearchAsteroidRow', 'spaceTelescopeSearchAsteroidProgressBarContainer'),
      investigateStar: of('spaceTelescopeInvestigateStarRow', 'spaceTelescopeInvestigateStarProgressBarContainer')
    };
  });
}

test.describe('Space Telescope — the pane while a job is running', () => {
  test('the idle row reports the telescope busy instead of ready, and the running row shows its bar', async ({ game, page }) => {
    await game.boot();
    await stockRunWithoutTelescope(game, page);
    await buildTelescopeThroughDebugMenu(game, page);
    const copy = await telescopeCopy(game);

    // Both jobs are offered while the instrument is idle.
    const idle = await rowControls(page);
    expect(idle.searchAsteroid.buttonVisible, 'an idle telescope offers the scan').toBe(true);
    expect(idle.investigateStar.buttonVisible, 'and the study').toBe(true);
    expect(await rowStatusText(page, 'spaceTelescopeSearchAsteroidRow')).toBe(copy.readyToSearch);

    await pressTelescopeAction(page, 'spaceTelescopeInvestigateStarRow');
    await page.waitForTimeout(700);
    expect((await readTelescopeState(game)).investigating, 'the study should have started').toBe(true);

    // The running row hands its button over to the progress bar...
    const running = await rowControls(page);
    expect(running.investigateStar.progressBarVisible, 'the running job shows its progress bar').toBe(true);
    expect(running.investigateStar.buttonVisible, 'and not its button').toBe(false);

    // ...and so does the other one, because the two share one instrument. The
    // status line is the part that has to say *why*: a row still reading "ready
    // to search" beside a running study is telling the player something untrue.
    expect(running.searchAsteroid.buttonVisible, 'the other job cannot be started either').toBe(false);
    expect(running.searchAsteroid.progressBarVisible, 'and nothing of its own is running').toBe(false);
    expect(await rowStatusText(page, 'spaceTelescopeSearchAsteroidRow'),
      'the idle row should name the job that is holding the telescope')
      .toBe(copy.busyStudying);

    // And the gate is real, not only visual: pressing the hidden button - which
    // is what a stale pane would leave a player able to do - starts nothing.
    const before = await readTelescopeState(game);
    await pressTelescopeAction(page, 'spaceTelescopeSearchAsteroidRow');
    await page.waitForTimeout(600);
    const after = await readTelescopeState(game);
    expect(after.searching, 'no second job on top of the running one').toBe(false);
    expect(after.investigating, 'and the study is still the one that was running').toBe(true);
    expect(after.starTimeLeft).toBeLessThanOrEqual(before.starTimeLeft);

    expect(game.significantErrors()).toEqual([]);
  });

  test('with the grid down the rows say so rather than offering a job that cannot run', async ({ game, page }) => {
    await game.boot();
    await stockRunWithoutTelescope(game, page);
    await buildTelescopeThroughDebugMenu(game, page);
    const copy = await telescopeCopy(game);

    await game.withMods((m) => {
      m.cg.setInfinitePower(false);
      m.cg.setPowerOnOff(false);
    });
    await page.waitForTimeout(900);

    expect(await rowStatusText(page, 'spaceTelescopeSearchAsteroidRow'),
      'a telescope with no power should say so, not "ready"').toBe(copy.requiresPower);
    expect(await rowStatusText(page, 'spaceTelescopeInvestigateStarRow')).toBe(copy.requiresPower);

    expect(game.significantErrors()).toEqual([]);
  });
});

// -------------------- the auto-telescope on a telescope rebuilt after rebirth

/** Open a side-menu option by id, revealing its row first. */
async function openOptionById(game, page, optionId, tab = null) {
  if (tab !== null) await game.openTab(tab);
  const found = await page.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el) return false;
    el.closest('.row-side-menu')?.classList.remove('invisible');
    el.classList.remove('invisible');
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, optionId);
  if (!found) throw new Error(`No side-menu row with id ${optionId}`);
  await page.waitForTimeout(700);
}

/** Buy one perk by pressing its own Buy button on the Ascendency Perks pane. */
async function buyPerkThroughItsPane(game, page, key) {
  await openOptionById(game, page, 'ascendencyOption', 7);
  await page.waitForTimeout(500);
  const token = key.replace(/([A-Z])/g, '-$1').toLowerCase();
  const pressed = await page.evaluate((selector) => {
    const button = document.querySelector(selector);
    if (!button) return false;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, `button.ascendency-buff-button.buff-class-${token}`);
  if (!pressed) throw new Error(`No Buy button for the ${key} perk`);
  await page.waitForTimeout(700);
  await dismissAnyOpenModal(page);
  const owned = await game.withMods((m, k) => m.rdo.getAscendencyBuffDataObject()[k].boughtYet, key);
  expect(owned, `${key} should have been bought`).toBeGreaterThan(0);
}

/** Press Rebirth and confirm — the player's own route through the reset. */
async function rebirthThroughTheUI(game, page) {
  await dismissAnyOpenModal(page);
  await openOptionById(game, page, 'rebirthOption', 7);
  const runBefore = await game.withMods((m) => m.cg.getStatRun());
  const confirmLabel = await game.withMods((m) =>
    m.loc.localize('modalRebirthConfirmLabel', m.cg.getLanguage()));
  await page.evaluate(() => document.querySelector('.rebirth-check')?.click());
  await page.waitForFunction(
    (label) => document.getElementById('modalConfirm')?.innerText?.trim() === label,
    confirmLabel, { timeout: 20000 });
  await page.evaluate(() => document.getElementById('modalConfirm').click());
  await page.waitForFunction((before) => globalThis.__mods.cg.getStatRun() === before + 1,
    runBefore, { timeout: 30000 });
  await page.waitForTimeout(1500);
  await dismissAnyOpenModal(page);
}

test.describe('Space Telescope — the auto-telescope on a telescope rebuilt after a rebirth', () => {
  /**
   * The whole of the reported scenario, played end to end.
   *
   * A rebirth keeps the perk and the settings but takes the telescope away, so
   * the next run reaches a state no other spec covers: the automation is armed
   * before the instrument it drives exists. The moment the player buys the
   * telescope the frame loop starts the saved job — and everything the pane
   * shows about that job is decided when the pane is *drawn*, which last
   * happened while there was no telescope at all.
   */
  test('building it redraws the pane, and the saved automation runs as soon as the grid is up', async ({ game, page }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await dismissAnyOpenModal(page);

    // What `rebirth()` needs to be completable: a scanned destination and a
    // resolved battle. `rebirthChecks()` turns those into `rebirthPossible`.
    await game.withMods((m) => {
      m.game.generateStarDataAndAddToDataObject({ id: 'vega' }, 12);
      m.cg.setDestinationStar('vega');
      m.rdo.copyStarDataToDestinationStarField('vega');
      m.cg.setDestinationStarScanned(true);
      m.cg.setBattleResolved(true, 'player');
    });
    await page.waitForTimeout(600);

    // Run 1 needs a working telescope, and the telescope needs the grid. The
    // rebirth puts `infinitePower` back to false on its own, so this does not
    // leak into the grid-down leg of run 2 below.
    await game.withMods((m) => {
      m.cg.setInfinitePower(true);
      m.cg.setPowerOnOff(true);
    });

    // Run 1: buy the perk on its own pane, then set the automation up through
    // the telescope's own dropdown and toggle.
    await game.openDebugMenu();
    await game.debugClick('add100ApButton');
    await page.waitForTimeout(300);
    await buyPerkThroughItsPane(game, page, 'autoSpaceTelescope');
    await openOptionById(game, page, 'spaceTelescopeOption', 6);
    await page.evaluate(() => {
      document.querySelector('#autoSpaceTelescopeModeDropdown .dropdown-option[data-value="studyStars"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await page.waitForTimeout(400);
    await page.evaluate(() => {
      const toggle = document.querySelector('#spaceTelescopeAutoRow #autoTelescopeToggle');
      if (toggle && !toggle.checked) toggle.click();
    });
    await page.waitForTimeout(400);
    const armed = await game.withMods((m) => ({
      on: m.rdo.getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'autoSpaceTelescopeEnabled']),
      mode: m.rdo.getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'autoSpaceTelescopeMode'])
    }));
    expect(armed, 'run 1 should end with the automation armed at the stars')
      .toMatchObject({ on: true, mode: 'studyStars' });

    // The rebirth is deliberately taken with a study *in flight*, which is the
    // ordinary case for an automated telescope and the one that breaks: the
    // reset clears the flags but the delta timer is owned by timerManagerDelta
    // and outlives them.
    await page.waitForFunction(() => globalThis.__mods.cg.getCurrentlyInvestigatingStar() === true,
      null, { timeout: 20000 });

    await rebirthThroughTheUI(game, page);

    // Nothing of the previous run's job may cross the rebirth. A surviving timer
    // is not merely untidy: `checkAndStartAutoTelescopeAction` returns early
    // while any telescope timer is live, so the automation would be dead for the
    // whole run, and the ghost would hand its reward to a run that never began it.
    const carriedOver = await game.withMods((m) => ({
      star: m.timers.timerManagerDelta.hasTimer('investigateStarTimer'),
      asteroid: m.timers.timerManagerDelta.hasTimer('searchAsteroidTimer'),
      pillage: m.timers.timerManagerDelta.hasTimer('pillageVoidTimer'),
      starTimeLeft: m.cg.getTimeLeftUntilStarInvestigationTimerFinishes(),
      investigating: m.cg.getCurrentlyInvestigatingStar()
    }));
    expect(carriedOver, 'the rebirth should have taken the running job with it').toEqual({
      star: false, asteroid: false, pillage: false, starTimeLeft: 0, investigating: false
    });

    // Run 2, exactly as reported: the debug grants, then straight to the pane.
    await game.openDebugMenu();
    await game.debugClick('give1BButton');
    await game.debugClick('give1MAllResourcesAndCompounds');
    await game.debugClick('grantAllTechsButton');
    await game.debugClick('unlockAllTabsButton');
    await page.waitForTimeout(600);
    await dismissAnyOpenModal(page);
    // The grid is deliberately left as the rebirth left it: down. A fresh run has
    // generated no power, and every telescope job is gated on it.
    await openOptionById(game, page, 'spaceTelescopeOption', 6);

    const beforeBuild = await telescopeRows(page);
    expect(beforeBuild.build.visible, 'the rebirth took the telescope away').toBe(true);
    expect(beforeBuild.auto.present, 'and with no telescope there is no auto row yet').toBe(false);

    // The build button, on the pane the player is standing on. Nothing below
    // this line reopens the pane — that reopen is the workaround this spec
    // exists to make unnecessary.
    await page.evaluate(() => {
      document.querySelector('#spaceBuildTelescopeRow button.spaceTelescope')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await page.waitForTimeout(500);
    await dismissAnyOpenModal(page);

    // The perk survived the rebirth, so the row it pays for has to be on the
    // rebuilt pane, still set as the player left it in the previous run.
    const rows = await telescopeRows(page);
    expect(rows.auto.present, 'the auto row belongs on the pane as soon as the telescope is built').toBe(true);
    expect(rows.auto.visible).toBe(true);
    expect(rows.build.visible, 'a built telescope is not for sale twice').toBe(false);
    const toggleDrawnOn = await page.evaluate(() =>
      document.querySelector('#spaceTelescopeAutoRow #autoTelescopeToggle')?.checked);
    expect(toggleDrawnOn, 'the toggle the player left on is drawn on').toBe(true);

    // Nothing starts yet, and this is the part that is easily read as the perk
    // having been lost in the rebirth: the automation is armed and correct, but
    // `startInvestigateStarTimer` returns at `getStarInvestigationTimerCanContinue()`
    // while the grid is down. What the pane owes the player here is the reason,
    // on both rows, rather than a pair of buttons that look ready.
    await page.waitForTimeout(2500);
    const darkGrid = await readTelescopeState(game);
    expect(darkGrid.powerOn, 'the run has generated no power yet').toBe(false);
    expect(darkGrid.investigating, 'so the automation cannot have started anything').toBe(false);
    const copy = await telescopeCopy(game);
    expect(await rowStatusText(page, 'spaceTelescopeInvestigateStarRow'),
      'the study row should say why it is idle').toBe(copy.requiresPower);
    expect(await rowStatusText(page, 'spaceTelescopeSearchAsteroidRow')).toBe(copy.requiresPower);
    expect(await page.evaluate(() => document.getElementById('spaceTelescopeInvestigateStarRow')
      ?.querySelector('button')?.classList.contains('red-disabled-text')),
    'and its button should be gated by the colour class while the grid is down').toBe(true);

    // Power the grid, press nothing. The automation is what starts the job.
    await game.withMods((m) => {
      m.cg.setInfinitePower(true);
      m.cg.setPowerOnOff(true);
    });
    await page.waitForFunction(() => globalThis.__mods.cg.getCurrentlyInvestigatingStar() === true,
      null, { timeout: 20000 });
    await page.waitForTimeout(700);

    // Both rows must now show the running job rather than an offer to start one.
    const controls = await rowControls(page);
    expect(controls.investigateStar.progressBarVisible, 'the running study shows its bar').toBe(true);
    expect(controls.investigateStar.buttonVisible, 'not a button to start it again').toBe(false);
    expect(controls.searchAsteroid.buttonVisible, 'and the shared instrument is not offered twice').toBe(false);

    expect(await rowStatusText(page, 'spaceTelescopeSearchAsteroidRow'),
      'the scan row should name the job holding the telescope').toBe(copy.busyStudying);

    // The job cannot be doubled up on, even by reaching the hidden buttons.
    const before = await readTelescopeState(game);
    await pressTelescopeAction(page, 'spaceTelescopeSearchAsteroidRow');
    await pressTelescopeAction(page, 'spaceTelescopeInvestigateStarRow');
    await page.waitForTimeout(600);
    const after = await readTelescopeState(game);
    expect(after.searching, 'no asteroid scan on top of the automation study').toBe(false);
    expect(after.investigating).toBe(true);
    expect(after.starTimeLeft, 'and the running study was not restarted')
      .toBeLessThanOrEqual(before.starTimeLeft);

    expect(game.significantErrors()).toEqual([]);
  });
});

// ------------------------------ the auto row on a telescope built while open

test.describe('Space Telescope — the auto row on a freshly built telescope', () => {
  test('owning the perk puts the auto row on the pane the moment the build button is pressed', async ({ game, page }) => {
    await game.boot();
    await stockRunWithoutTelescope(game, page);

    // The perk owned while the telescope is not is the state a rebirth leaves
    // behind, and it is the whole of what this spec needs; the played rebirth
    // that produces it is covered above.
    await game.debugClick('add100ApButton');
    await game.withMods((m) => m.game.purchaseBuff('autoSpaceTelescope'));
    await openTelescopePane(game, page);

    const before = await telescopeRows(page);
    expect(before.build.visible, 'the telescope is not built yet').toBe(true);
    expect(before.auto.present, 'and with no telescope there is nothing for the auto row to drive').toBe(false);

    // Built through the pane's own button, and the pane deliberately not
    // reopened afterwards: the claim is that the purchase redraws the pane it
    // was made on, not that the next open would have drawn it correctly.
    await page.evaluate(() => {
      document.querySelector('#spaceBuildTelescopeRow button.spaceTelescope')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await page.waitForTimeout(800);
    await dismissAnyOpenModal(page);

    const after = await telescopeRows(page);
    expect(after.auto.present, 'the auto row should appear as soon as the telescope is built').toBe(true);
    expect(after.auto.visible).toBe(true);
    expect(after.searchAsteroid.visible, 'the two jobs open with it').toBe(true);
    expect(after.investigateStar.visible).toBe(true);
    expect(after.build.visible, 'and the build row goes').toBe(false);

    // It is a working row, not an orphan: the toggle still writes through.
    await page.click('label[for="autoTelescopeToggle"]');
    await page.waitForTimeout(400);
    expect(await game.withMods((m) =>
      m.rdo.getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'autoSpaceTelescopeEnabled'])),
    'the toggle on the redrawn row should be wired up').toBe(true);

    // And it sits where the pane draws it — under the build row, above the jobs.
    const order = await page.evaluate(() => Array.from(
      document.getElementById('spaceTelescopeAutoRow')?.parentElement?.children ?? [])
      .map((el) => el.id).filter(Boolean));
    expect(order.indexOf('spaceTelescopeAutoRow'))
      .toBeLessThan(order.indexOf('spaceTelescopeSearchAsteroidRow'));

    expect(game.significantErrors()).toEqual([]);
  });
});
