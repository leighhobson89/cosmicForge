/**
 * Area: Starship — built module by module, fuelled with antimatter, and flown
 * Plan: tests/docs/areas/starship.md
 *
 * The starship is the run's exit. It is built out of five modules, four of which
 * are mandatory; it is fuelled with antimatter, which is the only thing in the
 * game that cannot be bought; and it flies to one star, once, on a clock derived
 * from that star's distance. Getting any of it wrong strands the run.
 *
 * | Stage | What is pinned |
 * |---|---|
 * | Building the modules | every part is bought one at a time, charges its own materials, and gets dearer; the four mandatory modules finishing is what makes the ship exist |
 * | The optional scanner | the fifth module is not needed to fly, and is the whole difference between knowing what is waiting at the destination and seeing `???` |
 * | Choosing a destination | a star's fuel and flight time are both functions of its distance, and nothing else |
 * | Launching | the launch is gated on holding the fuel, and spends exactly that much antimatter |
 * | The flight | the clock runs down at the rate the distance set, and arrival puts the ship in orbit |
 * | Arriving | orbit is what opens the system scan, and on run 1 what unlocks the Galactic tab |
 *
 * ## Three things shape how these specs are written
 *
 * **Parts must be bought one frame apart.** `gain` does not deduct anything: it
 * writes the bill into `itemsToDeduct`, which the frame loop settles on its next
 * pass — and `setItemsToDeduct` *overwrites* the entry for a given resource
 * rather than adding to it. Twenty clicks inside one frame would therefore be
 * charged once. Every build loop here waits a frame between presses, which is
 * also what a real player's fastest clicking does.
 *
 * **A module is `finished` by the pane, not by the purchase.** Nothing in the
 * click handler sets `finished`; `handleSpaceUpgradeResourceType` does it on the
 * frame loop, and only for rows that are currently rendered. So the Star Ship
 * pane has to stay open while a module is completed, which is exactly the wiring
 * a spec that called `gain()` directly would never exercise.
 *
 * **Production has to be stopped before materials are measured.** The debug
 * scenario leaves every autobuyer at tier 4 with a billion units of headroom, so
 * a store measured before and after a purchase moves for two reasons at once.
 * `stopAllProduction` empties the autobuyers so the only thing changing a store
 * is the thing under test.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** Building 55 parts a frame apart, then flying, is not quick. */
test.describe.configure({ timeout: 240_000 });

/** The four modules a ship cannot fly without, and the one it can. */
const MANDATORY_MODULES = [
  { id: 'ssStructural', rowId: 'spaceSsStructuralBuildRow' },
  { id: 'ssLifeSupport', rowId: 'spaceSsLifeSupportBuildRow' },
  { id: 'ssAntimatterEngine', rowId: 'spaceSsAntimatterEngineBuildRow' },
  { id: 'ssFleetHangar', rowId: 'spaceSsFleetHangarBuildRow' }
];
const SCANNER_MODULE = { id: 'ssStellarScanner', rowId: 'spaceSsStellarScannerBuildRow' };

/** `GAME_COST_MULTIPLIER` — every part bought makes the next one dearer. */
const COST_MULTIPLIER = 1.13;

/** Comfortably past the longest flight these specs set up. */
const RUN_FLIGHT_TO_COMPLETION_MS = 60_000_000;

// --------------------------------------------------------------------- helpers

/** Close whatever modal is currently up, whichever of the two buttons it uses. */
async function dismissAnyOpenModal(page) {
  for (let attempt = 0; attempt < 6; attempt++) {
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

/** Open one of the Interstellar tab's panes by its side-menu row id. */
async function openInterstellarPane(game, page, optionId) {
  await dismissAnyOpenModal(page);
  await game.openTab(5);
  await page.evaluate((id) => {
    const el = document.getElementById(id);
    el?.classList.remove('invisible');
    el?.closest('.row-side-menu')?.classList.remove('invisible');
    el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, optionId);
  await page.waitForTimeout(800);
}

const openStarShipPane = (game, page) => openInterstellarPane(game, page, 'starShipOption');
const openStarMapPane = (game, page) => openInterstellarPane(game, page, 'starMapOption');

/**
 * Empty every autobuyer so the only thing moving a store is the purchase under
 * test. The debug scenario leaves them all at tier 4 with a billion units of
 * headroom, which is enough to swamp a module's bill between two reads.
 */
async function stopAllProduction(game) {
  await game.withMods((m) => {
    for (const category of ['resources', 'compounds']) {
      const all = m.rdo.getResourceDataObject(category) ?? {};
      for (const key of Object.keys(all)) {
        const autoBuyer = all[key]?.upgrades?.autoBuyer;
        if (!autoBuyer) continue;
        for (const tier of Object.keys(autoBuyer)) {
          const slot = autoBuyer[tier];
          if (slot && typeof slot === 'object' && 'quantity' in slot) {
            slot.quantity = 0;
            slot.active = false;
          }
        }
      }
    }
  });
}

/** Stock a run with money and materials but no starship of any kind. */
async function stockRunWithoutStarship(game, page) {
  await game.debugClick('unlockAllTabsButton');
  await game.debugClick('give1BButton');
  await game.debugClick('give1MAllResourcesAndCompounds');
  await game.debugClick('grantAllTechsButton');
  await page.waitForTimeout(600);
  await dismissAnyOpenModal(page);
  await game.withMods((m) => {
    m.cg.setInfinitePower(true);
    m.cg.setPowerOnOff(true);
    // A star study completing with no philosophy set raises the choice modal,
    // and it would sit over every later click. Run 1's own default matches what
    // the debug scenario picks.
    if (!m.cg.getPlayerPhilosophy()) m.cg.setPlayerPhilosophy('voidborn');
  });
  await stopAllProduction(game);
  await page.waitForTimeout(300);
}

/** One module's ledger. */
async function readModule(game, id) {
  return game.withMods((m, key) => {
    const at = (field) => m.rdo.getResourceDataObject('space', ['upgrades', key, field]);
    return {
      builtParts: at('builtParts'),
      parts: at('parts'),
      finished: at('finished'),
      price: at('price'),
      resource1Price: at('resource1Price'),
      resource2Price: at('resource2Price'),
      resource3Price: at('resource3Price')
    };
  }, id);
}

/**
 * Which compound the current system rains, and from which category.
 *
 * Precipitation is drawn per star system and accrues on its own whenever it is
 * raining, entirely outside the autobuyers. That makes exactly one of a module's
 * material bills unmeasurable to the unit — so it is identified here and given a
 * window instead of an equality, rather than every bill being loosened.
 */
async function readPrecipitation(game) {
  return game.withMods((m) => {
    const star = m.cg.getCurrentStarSystem();
    return {
      type: m.rdo.getStarSystemDataObject('stars', [star, 'precipitationType']),
      category: m.rdo.getStarSystemDataObject('stars', [star, 'precipitationResourceCategory'])
    };
  });
}

/** Read the stores a module's bill is drawn from. */
async function readStoresFor(game, module) {
  return game.withMods((m, mod) => ({
    cash: m.rdo.getResourceDataObject('currency', ['cash']),
    r1: m.rdo.getResourceDataObject(mod.resource1Price[2], [mod.resource1Price[1], 'quantity']),
    r2: m.rdo.getResourceDataObject(mod.resource2Price[2], [mod.resource2Price[1], 'quantity']),
    r3: m.rdo.getResourceDataObject(mod.resource3Price[2], [mod.resource3Price[1], 'quantity'])
  }), module);
}

/**
 * Press a module's Build button `times` times, one frame apart.
 *
 * The wait is not padding. `gain` queues the bill and the frame loop settles it,
 * and the queue holds one entry per resource — so two presses in the same frame
 * are charged once. Two `requestAnimationFrame` hops guarantee the loop has run
 * between them.
 */
async function buildParts(page, rowId, times) {
  const pressed = await page.evaluate(async ({ id, count }) => {
    const button = document.getElementById(id)?.querySelector('button');
    if (!button) return 0;
    let done = 0;
    for (let i = 0; i < count; i++) {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      done++;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
    return done;
  }, { id: rowId, count: times });
  if (pressed !== times) throw new Error(`Only pressed ${pressed}/${times} on ${rowId}`);
  await page.waitForTimeout(300);
}

/** The ship's own state, as the Star Ship pane and the travel timer see it. */
async function readShipState(game) {
  return game.withMods((m) => ({
    built: m.cg.getStarShipBuilt(),
    scanner: m.cg.getStellarScannerBuilt(),
    status: [...(m.cg.getStarShipStatus() ?? [])],
    travelling: m.cg.getStarShipTravelling(),
    modulesBuilt: [...(m.cg.getStarShipModulesBuilt() ?? [])].sort(),
    destination: m.cg.getDestinationStar(),
    destinationScanned: m.cg.getDestinationStarScanned(),
    antimatter: m.rdo.getResourceDataObject('antimatter', ['quantity']),
    travelDuration: m.cg.getStarTravelDuration(),
    travelTimeLeft: m.cg.getTimeLeftUntilTravelToDestinationStarTimerFinishes(),
    travelSpeed: m.cg.getStarShipTravelSpeed(),
    run: m.cg.getStatRun(),
    techs: [...(m.cg.getTechUnlockedArray() ?? [])]
  }));
}

/**
 * Pick a destination the way a player does: open the star map and click a star
 * that is in range, is not the system the run is in, and has not been settled.
 *
 * The click handler only sets a destination for an *interesting* star — one the
 * telescope has brought inside `starVisionDistance` — which is why the debug
 * scenario's five star studies are a precondition for every flight here.
 */
async function chooseDestinationOnTheStarMap(game, page) {
  await openStarMapPane(game, page);

  const chosen = await page.evaluate(() => {
    const map = document.getElementById('optionContentTab5');
    if (!map) return null;
    const candidates = Array.from(map.querySelectorAll('.star'))
      .filter((el) => !el.classList.contains('current-star')
        && !el.id.startsWith('settledStar')
        && !el.id.startsWith('noneInterestingStar')
        && el.id !== 'Miaplacidus');
    const target = candidates[0];
    if (!target) return null;
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return target.id;
  });
  expect(chosen, 'the star map should offer a reachable star to travel to').not.toBeNull();
  await page.waitForTimeout(700);

  const destination = await game.withMods((m) => m.cg.getDestinationStar());
  expect(destination, 'clicking a star should record it as the destination').toBeTruthy();
  return destination;
}

/** The Travel button's state, as the frame loop leaves it. */
async function travelButtonState(page) {
  return page.evaluate(() => {
    const button = document.querySelector('button.travel-starship-button');
    if (!button) return null;
    return {
      ready: button.classList.contains('green-ready-text'),
      blocked: button.classList.contains('red-disabled-text')
    };
  });
}

/** Press Travel and confirm the launch warning modal. */
async function launchThroughTheUI(game, page) {
  const confirmLabel = await game.withMods((m) => m.loc.localize('buttonLaunchUpper', m.cg.getLanguage()));

  await page.evaluate(() => {
    document.querySelector('button.travel-starship-button')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  // The launch warning is matched on its own confirm label, so this cannot pass
  // by confirming whatever other dialog happens to be up.
  await page.waitForFunction(
    (label) => document.getElementById('modalConfirm')?.innerText?.trim() === label,
    confirmLabel,
    { timeout: 20000 }
  );
  await page.evaluate(() => document.getElementById('modalConfirm').click());
  await page.waitForTimeout(800);
}

// ------------------------------------------------------- building the modules

test.describe('Starship — building the modules', () => {
  test('every part is bought and charged on its own, and the four mandatory modules finish the ship', async ({ game, page }) => {
    await game.boot();
    await stockRunWithoutStarship(game, page);
    await openStarShipPane(game, page);

    const beforeAnything = await readShipState(game);
    expect(beforeAnything.built, 'a fresh run has no starship').toBe(false);
    expect(beforeAnything.modulesBuilt).toEqual([]);

    const precipitation = await readPrecipitation(game);

    for (const module of MANDATORY_MODULES) {
      const spec = await readModule(game, module.id);
      expect(spec.builtParts, `${module.id} starts unbuilt`).toBe(0);
      expect(spec.parts, `${module.id} should declare how many parts it needs`).toBeGreaterThan(0);
      expect(spec.finished).toBe(false);

      // The first part, measured exactly: cash and all three materials come off
      // at the prices the row advertises.
      const storesBefore = await readStoresFor(game, spec);
      await buildParts(page, module.rowId, 1);
      const storesAfterOne = await readStoresFor(game, spec);

      expect(storesAfterOne.cash, `${module.id} should charge its cash price`)
        .toBe(Math.floor(storesBefore.cash - spec.price));
      for (const [slot, price] of [
        ['r1', spec.resource1Price], ['r2', spec.resource2Price], ['r3', spec.resource3Price]
      ]) {
        const label = `${module.id} should charge its ${price[1]}`;
        if (price[1] === precipitation.type) {
          // Rain adds to this one store while the purchase takes from it, so
          // the charge can only be bounded: never more than the price, and
          // never so much less that the bill was not paid.
          const charged = storesBefore[slot] - storesAfterOne[slot];
          expect(charged, `${label} (allowing for ${price[1]} falling as rain)`)
            .toBeLessThanOrEqual(price[0]);
          expect(charged).toBeGreaterThan(price[0] - 1000);
        } else {
          expect(storesAfterOne[slot], label).toBe(storesBefore[slot] - price[0]);
        }
      }

      const afterOne = await readModule(game, module.id);
      expect(afterOne.builtParts).toBe(1);
      // Every part makes the next one dearer, in cash and in materials alike.
      expect(afterOne.price).toBe(Math.ceil(spec.price * COST_MULTIPLIER));
      expect(afterOne.resource1Price[0]).toBeGreaterThan(spec.resource1Price[0]);

      // A module with parts still owing is not finished, however many are built.
      if (spec.parts > 1) {
        expect(afterOne.finished, `${module.id} is not finished at 1 of ${spec.parts}`).toBe(false);
        await buildParts(page, module.rowId, spec.parts - 1);
      }

      // `finished` is written by the frame loop from the rendered row, so it
      // takes a few frames after the last part rather than landing on the click.
      await page.waitForFunction(
        (key) => globalThis.__mods.rdo.getResourceDataObject('space', ['upgrades', key, 'finished']) === true,
        module.id,
        { timeout: 15000 }
      );

      const complete = await readModule(game, module.id);
      expect(complete.builtParts, `${module.id} should stop at its part count`).toBe(spec.parts);
      expect(complete.finished).toBe(true);
    }

    // With the four mandatory modules done the ship exists, and the pane moves
    // itself to `readyForTravel` — the scanner is not part of that decision.
    await page.waitForFunction(() => globalThis.__mods.cg.getStarShipBuilt() === true, null, { timeout: 15000 });
    const built = await readShipState(game);
    expect(built.built).toBe(true);
    expect(built.modulesBuilt).toEqual(MANDATORY_MODULES.map((m) => m.id).sort());
    expect(built.scanner, 'the scanner is optional and has not been built').toBe(false);
    await page.waitForFunction(() => globalThis.__mods.cg.getStarShipStatus()[0] === 'readyForTravel',
      null, { timeout: 15000 });

    expect(game.significantErrors()).toEqual([]);
  });

  test('building a part with no room left is refused rather than overshooting', async ({ game, page }) => {
    await game.boot();
    await stockRunWithoutStarship(game, page);
    await openStarShipPane(game, page);

    // The Fleet Hangar is the one-part module, so it reaches its cap in a single
    // press and any extra press has to be absorbed rather than counted.
    const spec = await readModule(game, 'ssFleetHangar');
    expect(spec.parts).toBe(1);

    await buildParts(page, 'spaceSsFleetHangarBuildRow', 1);
    await page.waitForFunction(
      () => globalThis.__mods.rdo.getResourceDataObject('space', ['upgrades', 'ssFleetHangar', 'finished']) === true,
      null, { timeout: 15000 });

    const full = await readModule(game, 'ssFleetHangar');
    expect(full.builtParts).toBe(1);

    await buildParts(page, 'spaceSsFleetHangarBuildRow', 3);
    const stillFull = await readModule(game, 'ssFleetHangar');
    // `gain` clamps to `parts`, so the count cannot run past the module's size.
    expect(stillFull.builtParts, 'a finished module cannot be built past its size').toBe(1);
  });
});

// ---------------------------------------------------------- the optional scanner

test.describe('Starship — the optional Stellar Scanner', () => {
  /**
   * Put a flying-ready ship at a scanned destination, with or without the fifth
   * module. `buildStarshipDebugButton` finishes every `ss` module including the
   * scanner, so the without-scanner case unbuilds it again — which is the state
   * of a player who launched without it.
   */
  async function arriveAtAScannedStar(game, page, { withScanner }) {
    await game.prepareRunForStarshipLaunch();
    await dismissAnyOpenModal(page);

    if (!withScanner) {
      await game.withMods((m, key) => {
        m.rdo.setResourceDataObject(false, 'space', ['upgrades', key, 'finished']);
        m.rdo.setResourceDataObject(0, 'space', ['upgrades', key, 'builtParts']);
        m.cg.setStellarScannerBuilt(false);
      }, SCANNER_MODULE.id);
    }

    const destination = await chooseDestinationOnTheStarMap(game, page);
    await launchThroughTheUI(game, page);
    await game.advanceTimers(RUN_FLIGHT_TO_COMPLETION_MS);
    await page.waitForTimeout(700);
    await dismissAnyOpenModal(page);

    await openStarShipPane(game, page);
    // The scan row only appears once the ship is in orbit (or within the
    // scanner's range of it), which is the point of the journey.
    await page.waitForFunction(() => {
      const row = document.getElementById('spaceStarShipStellarScannerRow');
      return Boolean(row) && !row.classList.contains('invisible');
    }, null, { timeout: 20000 });

    await page.evaluate(() => {
      document.getElementById('spaceStarShipStellarScannerRow')?.querySelector('button')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await page.waitForTimeout(900);
    await dismissAnyOpenModal(page);
    return destination;
  }

  /** What the destination's lifeform panel is actually showing. */
  async function lifeformPanel(page) {
    return page.evaluate(() => {
      const text = (id) => document.getElementById(id)?.innerText ?? null;
      return {
        starName: text('starNameRow'),
        civilization: text('civilizationLevelRow'),
        population: text('populationRow'),
        summary: document.getElementById('descriptionContentTab5')?.innerText ?? null
      };
    });
  }

  test('with the scanner, the scan names what is waiting at the destination', async ({ game, page }) => {
    await game.boot();
    await arriveAtAScannedStar(game, page, { withScanner: true });

    const state = await readShipState(game);
    expect(state.scanner).toBe(true);
    expect(state.destinationScanned, 'the scan should have recorded itself').toBe(true);

    const panel = await lifeformPanel(page);
    expect(panel.civilization, 'the civilization row should be drawn').not.toBeNull();
    expect(panel.civilization, 'a scanned system reports its civilization level').not.toContain('???');
    expect(panel.population, 'and its population estimate').not.toContain('???');

    // The scan results header is the game's own statement of which of the two
    // outcomes the player got.
    const analysed = await game.withMods((m) => m.loc.localize('tab5ScanResultsAnalyse', m.cg.getLanguage()));
    expect(panel.summary?.replace(/\s+/g, ' ').trim())
      .toContain(analysed.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());

    expect(game.significantErrors()).toEqual([]);
  });

  test('without the scanner the ship still flies and still scans, but learns nothing about the aliens', async ({ game, page }) => {
    await game.boot();
    await arriveAtAScannedStar(game, page, { withScanner: false });

    const state = await readShipState(game);
    // The whole point of the module being optional: its absence never stopped
    // the journey.
    expect(state.built, 'the four mandatory modules are what make the ship fly').toBe(true);
    expect(state.scanner).toBe(false);
    expect(state.status[0]).toBe('orbiting');
    expect(state.destinationScanned).toBe(true);

    const panel = await lifeformPanel(page);
    expect(panel.civilization, 'without the scanner the civilization level is unknown').toContain('???');
    expect(panel.population, 'and so is the population').toContain('???');

    const noScanner = await game.withMods((m) => m.loc.localize('tab5ScanResultsNoScanner', m.cg.getLanguage()));
    expect(panel.summary?.replace(/\s+/g, ' ').trim())
      .toContain(noScanner.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());

    expect(game.significantErrors()).toEqual([]);
  });
});

// -------------------------------------------------- distance, fuel and flight

test.describe('Starship — distance, fuel and flight', () => {
  test.beforeEach(async ({ game, page }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await dismissAnyOpenModal(page);
  });

  test('a star\'s fuel and flight time are both functions of its distance and nothing else', async ({ game, page }) => {
    const destination = await chooseDestinationOnTheStarMap(game, page);

    const star = await game.withMods((m, name) => {
      const data = m.rdo.getStarSystemDataObject('stars', [name]);
      return {
        distance: data.distance,
        fuel: data.fuel,
        ascendencyPoints: data.ascendencyPoints,
        // The same two functions the star's record was generated from, re-run
        // here: if the record ever drifts from the formula, this is where it
        // shows.
        fuelFromDistance: m.game.calculateAntimatterRequired(data.distance),
        apFromDistance: m.game.calculateAscendencyPoints(data.distance),
        flightMs: m.game.calculateStarTravelDuration(name),
        flightWithModifiers: m.game.calculateStarTravelDurationWithModifiers(name),
        speed: m.cg.getStarShipTravelSpeed()
      };
    }, destination);

    expect(star.distance).toBeGreaterThan(0);
    expect(star.fuel).toBe(star.fuelFromDistance);
    expect(star.ascendencyPoints).toBe(star.apFromDistance);

    // Flight time is distance times the travel speed constant — 360,000 ms per
    // light year, i.e. six real minutes.
    expect(star.flightMs).toBe(star.distance * star.speed);
    // Quantum Engines halve it per purchase, and nothing here has bought any.
    expect(star.flightWithModifiers).toBe(star.flightMs);

    // The pricing curve is the thing a player plans around: farther is dearer,
    // and steeply so, but it is bounded at both ends.
    const curve = await game.withMods((m) => [1, 10, 25, 50, 75, 100]
      .map((d) => ({ d, fuel: m.game.calculateAntimatterRequired(d), ap: m.game.calculateAscendencyPoints(d) })));
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].fuel, `${curve[i].d}ly should cost more than ${curve[i - 1].d}ly`)
        .toBeGreaterThan(curve[i - 1].fuel);
      expect(curve[i].ap, `${curve[i].d}ly should be worth more than ${curve[i - 1].d}ly`)
        .toBeGreaterThanOrEqual(curve[i - 1].ap);
    }
    expect(curve[0].fuel, 'the nearest star costs the floor').toBe(5000);
    expect(curve[curve.length - 1].fuel, 'and the farthest the ceiling').toBe(155000);
    expect(curve[curve.length - 1].ap).toBe(50);
  });

  test('the launch is lit only while the antimatter is on hand, and spends exactly the star\'s fuel', async ({ game, page }) => {
    const destination = await chooseDestinationOnTheStarMap(game, page);
    const fuel = await game.withMods((m, name) =>
      m.rdo.getStarSystemDataObject('stars', [name, 'fuel']), destination);

    // One unit short is short. Antimatter is the one resource that cannot be
    // bought, so this gate is the real constraint on where a run can reach.
    await game.withMods((m, amount) => m.rdo.setResourceDataObject(amount, 'antimatter', ['quantity']), fuel - 1);
    await page.waitForTimeout(900);
    const short = await travelButtonState(page);
    expect(short, 'the destination row should carry a Travel button').not.toBeNull();
    expect(short.ready, 'one unit short of the fuel is not enough').toBe(false);
    expect(short.blocked).toBe(true);

    await game.withMods((m, amount) => m.rdo.setResourceDataObject(amount, 'antimatter', ['quantity']), fuel);
    await page.waitForTimeout(900);
    const exact = await travelButtonState(page);
    expect(exact.ready, 'exactly the fuel is enough').toBe(true);
    expect(exact.blocked).toBe(false);

    await launchThroughTheUI(game, page);

    const flying = await readShipState(game);
    expect(flying.travelling, 'confirming the warning should launch the ship').toBe(true);
    expect(flying.status).toEqual(['travelling', destination]);
    // Exactly the fuel, and not a unit more: the tank is empty on arrival.
    expect(flying.antimatter).toBe(0);
    expect(flying.techs, 'launching is an achievement the run records').toBeDefined();
    expect(await game.withMods((m) => m.rdo.getAchievementDataObject('launchStarship', ['active'])))
      .toBe(true);

    expect(game.significantErrors()).toEqual([]);
  });

  test('cancelling the launch warning spends nothing and leaves the ship on the pad', async ({ game, page }) => {
    await chooseDestinationOnTheStarMap(game, page);
    const before = await readShipState(game);

    const cancelLabel = await game.withMods((m) => m.loc.localize('buttonCancelUpper', m.cg.getLanguage()));
    await page.evaluate(() => {
      document.querySelector('button.travel-starship-button')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await page.waitForFunction(
      (label) => document.getElementById('modalCancel')?.innerText?.trim() === label,
      cancelLabel,
      { timeout: 20000 }
    );
    await page.evaluate(() => document.getElementById('modalCancel').click());
    await page.waitForTimeout(900);

    const after = await readShipState(game);
    expect(after.travelling).toBe(false);
    expect(after.antimatter, 'a cancelled launch burns no fuel').toBe(before.antimatter);
    expect(after.status[0]).toBe(before.status[0]);
  });

  test('the flight runs down at the rate the distance set, and arrival puts the ship in orbit', async ({ game, page }) => {
    const destination = await chooseDestinationOnTheStarMap(game, page);
    const expectedDuration = await game.withMods((m, name) =>
      m.game.calculateStarTravelDurationWithModifiers(name), destination);

    await launchThroughTheUI(game, page);

    const launched = await readShipState(game);
    expect(launched.travelDuration, 'the clock is set from the distance, not from a constant')
      .toBe(expectedDuration);
    expect(launched.travelTimeLeft).toBeGreaterThan(0);
    expect(launched.travelTimeLeft).toBeLessThanOrEqual(expectedDuration);

    // A tenth of the way there. The flight has no random component, so the
    // remaining time has to fall by at least what was advanced — and by a little
    // more, because the page's own frame loop is still driving the same timer in
    // real time while the reads happen.
    const step = Math.floor(expectedDuration / 10);
    await game.advanceTimers(step);
    await page.waitForTimeout(400);
    const partWay = await readShipState(game);
    const dropped = launched.travelTimeLeft - partWay.travelTimeLeft;
    expect(dropped, 'the advance should have been applied in full').toBeGreaterThanOrEqual(step);
    expect(dropped, 'and nothing beyond it but the real seconds that passed')
      .toBeLessThan(step + 10_000);
    expect(partWay.status[0], 'still in flight').toBe('travelling');
    expect(await game.withMods((m) => m.cg.getStarShipArrowPosition()),
      'the map arrow tracks the elapsed fraction').toBeGreaterThan(0);

    await game.advanceTimers(expectedDuration);
    await page.waitForTimeout(800);
    await dismissAnyOpenModal(page);

    const arrived = await readShipState(game);
    expect(arrived.status).toEqual(['orbiting', destination]);
    expect(arrived.travelTimeLeft).toBe(0);
    // On run 1 the arrival is what unlocks the Galactic tab, and it says so with
    // a modal and a tech.
    expect(arrived.run).toBe(1);
    expect(arrived.techs, 'arriving on run 1 grants the AP-awarding tech').toContain('apAwardedThisRun');

    // Orbit is what opens the system scan, and closes the travel row behind it.
    await openStarShipPane(game, page);
    const rows = await page.evaluate(() => {
      const state = (id) => {
        const row = document.getElementById(id);
        return { present: Boolean(row), visible: Boolean(row) && !row.classList.contains('invisible') };
      };
      return { travel: state('spaceStarShipTravelRow'), scan: state('spaceStarShipStellarScannerRow') };
    });
    expect(rows.scan.visible, 'in orbit, the system can be scanned').toBe(true);
    expect(rows.travel.visible, 'and the journey row is done with').toBe(false);

    expect(game.significantErrors()).toEqual([]);
  });
});
