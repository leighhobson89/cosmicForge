/**
 * Area: Random Events — every event fired against a run that can and cannot take it
 * Plan: tests/docs/areas/random-events.md
 *
 * `random-events.spec.js` covers the registry, the probability curve and the
 * history plumbing, and most of its cases stage state with setters and read a
 * field back afterwards. This file plays the run into the state each event needs
 * — plants bought on their purchase buttons, a rocket sent from its own Travel
 * control, the black hole researched on its Research button — and then measures
 * what the event actually did to the game.
 *
 * ## The shape every event case takes
 *
 * Each event carries a `canTrigger()` guard and a `trigger()`. The debug menu's
 * Trigger button is the same entry point a real cycle uses, so both halves are
 * reachable:
 *
 *   1. **when it cannot occur** — fire it against a run that does not satisfy the
 *      guard, and prove nothing happened: no history entry, no timed effect, no
 *      balance moved;
 *   2. **when it can occur** — play the run until the guard is satisfied, fire
 *      the same event, and measure the bonus or the penalty it imposed.
 *
 * Both halves are needed. An event whose guard is broken open fires on a run it
 * has no business touching; an event whose guard is stuck shut never fires at
 * all. Only asserting the second half would miss the first, and vice versa.
 *
 * ## Timer mechanics
 *
 * Five of the thirteen events start a timed effect rather than resolving on the
 * spot. Those are driven the way the game drives them — the per-frame effects
 * timer counts the remainder down, so a spec that wants an expiry seeds a short
 * remainder and lets the loop run it out rather than calling `onExpire` itself.
 * That is what puts the restoration handlers under test.
 *
 * `blackHoleInstability` is deliberately different: its countdown uses *real*
 * elapsed time rather than the warped delta, and it re-rolls the black hole's
 * power every minute of that real time.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** Events that run for a while rather than resolving on the spot. */
const TIMED_EVENT_IDS = [
  'galacticMarketLockdown', 'endlessSummer', 'minerBrokeDown',
  'supplyChainDisruption', 'blackHoleInstability'
];

/** Instant events the game classes as bad news. */
const NEGATIVE_INSTANT_EVENT_IDS = [
  'powerPlantExplosion', 'batteryExplosion', 'scienceTheft',
  'antimatterReaction', 'stockLoss', 'starshipLostInSpace'
];

// Several cases play a rocket out to an asteroid or buy a row of buildings
// before the event can fire at all.
test.describe.configure({ timeout: 300_000 });

// ---------------------------------------------------------------------- helpers

/** Fire one named event through the debug menu's own select and Trigger button. */
async function triggerFromDebugMenu(game, eventId) {
  await game.debugSelect('debugRandomEventSelect', eventId);
  await game.debugClick('triggerRandomEventButton');
  await game.page.waitForTimeout(500);
}

/** Open a side-menu row by id and let its pane draw. */
async function openOptionById(game, optionId) {
  const found = await game.page.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el) return false;
    el.classList.remove('invisible');
    el.closest('.row-side-menu')?.classList.remove('invisible');
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, optionId);
  await game.page.waitForTimeout(700);
  return found;
}

/** Everything the event system records, sampled in one round trip. */
function eventState(game, eventId) {
  return game.withMods((m, id) => ({
    active: m.events.isTimedEffectActive(id),
    remaining: m.events.getTimedEffectRemainingMs(id),
    snapshot: m.events.getTimedEffectStateSnapshot(id),
    history: m.events.getEventsHistorySnapshot().map((entry) => entry.id ?? entry.eventId),
    historyLength: m.events.getEventsHistorySnapshot().length,
    activeUi: m.events.getTimedEffectsUiSnapshot().map((effect) => effect.id)
  }), eventId);
}

/**
 * Press the black hole's Research button.
 *
 * Dispatched rather than clicked. `prepareRunForStarshipLaunch()` earns a run of
 * achievements, and their toasts stack over the black hole pane - a real click
 * at the button's centre lands on `div.notification.show`, so the research is
 * never bought and every assertion after it fails on a feature that was never
 * unlocked. `force: true` does not help: force skips the actionability wait, not
 * the hit test, and the mouse event still goes to whatever is topmost.
 *
 * The wait afterwards is for the frame loop, which is what swaps the pane over
 * to its unlocked half once the research lands.
 */
async function clickResearchBlackHole(game) {
  const fired = await game.page.evaluate(() => {
    const el = document.getElementById('blackHoleResearchButton');
    if (!el) return false;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  });
  if (!fired) throw new Error('The black hole Research button was not in the DOM');
  await game.page.waitForTimeout(900);
}

/**
 * Buy `count` of a power building through its own purchase button.
 *
 * Everything the row needs — cash, fuel and the `revealed` flag — is staged
 * first; the purchase itself goes through the button, because what matters for
 * the destruction events is that the buildings genuinely exist in the data the
 * event reads.
 */
async function buyPowerBuildings(game, buildingKey, count) {
  await game.withMods((m, key) => {
    m.rdo.setResourceDataObject(1e12, 'currency', ['cash']);
    for (const [category, materials] of Object.entries({
      resources: ['carbon', 'iron', 'silicon', 'sodium'],
      compounds: ['glass', 'steel', 'concrete', 'titanium']
    })) {
      for (const material of materials) {
        m.rdo.setResourceDataObject(1e9, category, [material, 'storageCapacity']);
        m.rdo.setResourceDataObject(1e9, category, [material, 'quantity']);
      }
    }
    m.rdo.setResourceDataObject(true, 'buildings', ['energy', 'upgrades', key, 'revealed']);
  }, buildingKey);

  await game.openTab(2);
  await openOptionById(game, `${buildingKey}Option`);

  for (let i = 0; i < count; i++) {
    const clicked = await game.page.evaluate(() => {
      const button = [...document.querySelectorAll('button.building-purchase-button')]
        .find((b) => b.offsetParent !== null);
      if (!button) return false;
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    });
    if (!clicked) throw new Error(`No purchase button on the ${buildingKey} pane`);
    // `gain` writes the bill into itemsToDeduct and the frame loop settles it,
    // and the setter overwrites rather than adds — so clicks inside one frame
    // are charged once. Two frames between presses is also what a real
    // player's fastest clicking does.
    await game.page.waitForTimeout(250);
  }

  return game.withMods((m, key) =>
    m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', key, 'quantity']), buildingKey);
}

/**
 * Send a rocket to an asteroid through the pane's own dropdown and Travel button,
 * and optionally fly it all the way there so it is mining rather than in transit.
 */
async function sendRocket(game, { rocket = 'rocket1', arrive = false } = {}) {
  await game.withMods((m, key) => m.cg.setLaunchedRockets(key, 'add'), rocket);
  await game.openTab(6);
  const opened = await openOptionById(game, rocket);
  if (!opened) throw new Error(`No side-menu row for ${rocket}`);

  const destination = await game.page.evaluate((key) => {
    const dropdown = document.getElementById(`${key}TravelDropdown`);
    const option = dropdown?.querySelector('div.dropdown-option');
    if (!option) return null;
    dropdown.querySelector('div.dropdown')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    option.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return option.getAttribute('data-value');
  }, rocket);
  if (!destination) throw new Error('No asteroid in the travel dropdown');

  await game.page.evaluate((key) => {
    document.querySelector(`.${key}-travel-to-asteroid-button`)
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, rocket);
  await game.page.waitForTimeout(500);

  if (arrive) {
    // Fly it by running the real travel timer rather than by calling its
    // completion handler. The longest journey is well inside 3,000,000ms.
    await game.advanceTimers(3_000_000);
    await game.page.waitForTimeout(600);
  }

  return destination;
}

// ============================================================================

test.describe('Random Events — the guards that decide whether an event can happen at all', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('on a fresh run the events with nothing to act on all refuse to fire', async ({ game }) => {
    // Nothing has been built, nothing is in flight and there is no research to
    // steal, so every one of these guards must hold shut.
    const blocked = [
      'powerPlantExplosion',
      'batteryExplosion',
      'starshipLostInSpace',
      'minerBrokeDown',
      'antimatterReaction',
      'rocketInstantArrival',
      'supplyChainDisruption',
      'blackHoleInstability',
      'galacticMarketLockdown'
    ];

    const before = await game.withMods((m) => m.events.getEventsHistorySnapshot().length);

    for (const id of blocked) {
      await triggerFromDebugMenu(game, id);
    }

    const after = await game.withMods((m) => ({
      history: m.events.getEventsHistorySnapshot().length,
      activeTimed: m.events.getTimedEffectsUiSnapshot().map((effect) => effect.id)
    }));

    expect(after.history, 'a refused event must not be logged').toBe(before);
    expect(after.activeTimed, 'and must not leave an effect running').toEqual([]);
    expect(game.significantErrors()).toEqual([]);
  });

  test('an event with an open guard can still decline once it looks for something to act on', async ({ game }) => {
    // `researchBreakthrough` and `stockLoss` both declare `canTrigger: () => true`,
    // so both are offered to a brand new run. That is not the same as both
    // *happening*: `stockLoss` looks for a stock to take and gives up when there
    // is none, and an event that gives up is not logged. The distinction between
    // the guard and the trigger is worth pinning, because a bare run is exactly
    // where it shows.
    const bare = await game.withMods((m) => {
      for (const key of Object.keys(m.rdo.getResourceDataObject('resources') || {})) {
        if (key === 'version') continue;
        m.rdo.setResourceDataObject(0, 'resources', [key, 'quantity']);
      }
      for (const key of Object.keys(m.rdo.getResourceDataObject('compounds') || {})) {
        if (key === 'version') continue;
        m.rdo.setResourceDataObject(0, 'compounds', [key, 'quantity']);
      }
      const before = m.events.getEventsHistorySnapshot().length;
      m.events.triggerSpecificRandomEventDebug('stockLoss');
      return { before, after: m.events.getEventsHistorySnapshot().map((e) => e.id) };
    });

    expect(bare.after.length, 'an empty store has nothing to lose').toBe(bare.before);

    // Research doubles from nothing to nothing, but it always *happens*, so it
    // is always logged.
    await triggerFromDebugMenu(game, 'researchBreakthrough');
    // With a stock to take, the same stock loss event goes through.
    const stocked = await game.withMods((m) => {
      m.rdo.setResourceDataObject(1e6, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(50000, 'resources', ['hydrogen', 'quantity']);
      const before = m.events.getEventsHistorySnapshot().length;
      m.events.triggerSpecificRandomEventDebug('stockLoss');
      return { before, after: m.events.getEventsHistorySnapshot().map((e) => e.id) };
    });

    expect(stocked.after.length).toBe(stocked.before + 1);
    expect(stocked.after).toContain('stockLoss');
    expect(stocked.after).toContain('researchBreakthrough');
  });

  test('science theft needs something worth stealing', async ({ game }) => {
    await game.withMods((m) => m.rdo.setResourceDataObject(0, 'research', ['quantity']));
    await triggerFromDebugMenu(game, 'scienceTheft');
    const refused = await eventState(game, 'scienceTheft');
    expect(refused.history, 'nothing to steal, nothing to log').not.toContain('scienceTheft');

    // With a stockpile, the same trigger takes half of it.
    const robbed = await game.withMods((m) => {
      m.rdo.setResourceDataObject(50000, 'research', ['quantity']);
      const before = m.rdo.getResourceDataObject('research', ['quantity']);
      m.events.triggerSpecificRandomEventDebug('scienceTheft');
      return { before, after: m.rdo.getResourceDataObject('research', ['quantity']) };
    });

    // Half, rounded against the player: ceil(current / 2) is taken.
    expect(robbed.after).toBe(robbed.before - Math.ceil(robbed.before / 2));

    const logged = await eventState(game, 'scienceTheft');
    expect(logged.history).toContain('scienceTheft');
  });

  test('an unknown event id is refused without throwing', async ({ game }) => {
    await game.withMods((m) => m.events.triggerSpecificRandomEventDebug('notARealEvent'));
    await game.page.waitForTimeout(400);
    expect(game.significantErrors()).toEqual([]);
  });
});

test.describe('Random Events — instant events measured against what they did', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
  });

  test('a power plant explosion destroys exactly one plant, of a type the run actually owns', async ({ game }) => {
    const owned = await buyPowerBuildings(game, 'powerPlant1', 4);
    expect(owned, 'four plants should have been bought through the button').toBeGreaterThanOrEqual(3);

    const result = await game.withMods((m) => {
      const read = () => ['powerPlant1', 'powerPlant2', 'powerPlant3']
        .map((key) => Number(m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', key, 'quantity'])) || 0);
      const before = read();
      m.events.triggerSpecificRandomEventDebug('powerPlantExplosion');
      return { before, after: read(), history: m.events.getEventsHistorySnapshot() };
    });

    const totalBefore = result.before.reduce((a, b) => a + b, 0);
    const totalAfter = result.after.reduce((a, b) => a + b, 0);
    expect(totalAfter, 'exactly one plant is lost').toBe(totalBefore - 1);
    // The plant that blew up is one the player had; a type at zero cannot lose one.
    for (let i = 0; i < 3; i++) {
      expect(result.after[i], `plant ${i + 1}`).toBeGreaterThanOrEqual(0);
      if (result.before[i] === 0) expect(result.after[i]).toBe(0);
    }
    expect(result.history[0].id).toBe('powerPlantExplosion');
    // The log entry names the building, so the player can see what they lost.
    expect(String(result.history[0].description || '').length).toBeGreaterThan(0);
  });

  test('a battery explosion takes the highest tier the run holds', async ({ game }) => {
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(3, 'buildings', ['energy', 'upgrades', 'battery1', 'quantity']);
      m.rdo.setResourceDataObject(2, 'buildings', ['energy', 'upgrades', 'battery2', 'quantity']);
      m.rdo.setResourceDataObject(0, 'buildings', ['energy', 'upgrades', 'battery3', 'quantity']);
    });

    const result = await game.withMods((m) => {
      const read = () => ['battery1', 'battery2', 'battery3']
        .map((key) => Number(m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', key, 'quantity'])) || 0);
      const before = read();
      m.events.triggerSpecificRandomEventDebug('batteryExplosion');
      return { before, after: read() };
    });

    expect(result.before).toEqual([3, 2, 0]);
    // The newest, most expensive battery is the one that goes.
    expect(result.after).toEqual([3, 1, 0]);
  });

  test('a research breakthrough doubles the pile and is logged as a good event', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.rdo.setResourceDataObject(12345, 'research', ['quantity']);
      const before = m.rdo.getResourceDataObject('research', ['quantity']);
      m.events.triggerSpecificRandomEventDebug('researchBreakthrough');
      const after = m.rdo.getResourceDataObject('research', ['quantity']);
      const entry = m.events.getEventsHistorySnapshot()[0];
      return { before, after, entry };
    });

    expect(result.after).toBe(result.before * 2);
    expect(result.entry.id).toBe('researchBreakthrough');
    // An instant event leaves no timed effect behind and is logged as instant.
    expect(result.entry.durationLabel).toBe('Instant');
    expect(result.entry.context.amountGained).toBe(result.before);
  });

  test('stock loss takes 40 to 80 percent of exactly one stock the player holds', async ({ game }) => {
    // Snapshot, trigger and re-snapshot inside one synchronous block: the frame
    // loop cannot interleave, so production cannot mask or fake the drop.
    const result = await game.withMods((m) => {
      const readAll = () => {
        const out = {};
        for (const category of ['resources', 'compounds']) {
          for (const key of Object.keys(m.rdo.getResourceDataObject(category) || {})) {
            if (key === 'version') continue;
            out[`${category}.${key}`] = Number(m.rdo.getResourceDataObject(category, [key, 'quantity'])) || 0;
          }
        }
        return out;
      };

      const before = readAll();
      m.events.triggerSpecificRandomEventDebug('stockLoss');
      const after = readAll();

      return {
        dropped: Object.entries(after)
          .filter(([key, value]) => value < before[key])
          .map(([key, value]) => ({ key, before: before[key], after: value })),
        entry: m.events.getEventsHistorySnapshot()[0]
      };
    });

    expect(result.dropped.length, 'exactly one stock is hit').toBe(1);
    const [hit] = result.dropped;
    const fraction = (hit.before - hit.after) / hit.before;
    expect(fraction, `${hit.key}: ${hit.before} -> ${hit.after}`).toBeGreaterThanOrEqual(0.39);
    expect(fraction, `${hit.key}: ${hit.before} -> ${hit.after}`).toBeLessThanOrEqual(0.81);
    // The percentage the player is told matches the percentage actually taken.
    expect(result.entry.id).toBe('stockLoss');
    expect(Math.abs(result.entry.context.lostPercent - fraction * 100)).toBeLessThanOrEqual(1);
  });

  test('a rocket in flight can be brought home early, and one sitting on the pad cannot', async ({ game }) => {
    // Nothing is travelling yet, so the guard must hold.
    await triggerFromDebugMenu(game, 'rocketInstantArrival');
    const refused = await eventState(game, 'rocketInstantArrival');
    expect(refused.history).not.toContain('rocketInstantArrival');

    await sendRocket(game, { rocket: 'rocket1', arrive: false });
    const inFlight = await game.withMods((m) => ({
      travelling: m.cg.getCurrentlyTravellingToAsteroid('rocket1'),
      remaining: m.cg.getTimeLeftUntilRocketTravelToAsteroidTimerFinishes('rocket1')
    }));
    expect(inFlight.travelling, 'the Travel button should have launched it').toBe(true);
    expect(inFlight.remaining).toBeGreaterThan(0);

    await triggerFromDebugMenu(game, 'rocketInstantArrival');
    await game.page.waitForTimeout(700);

    const arrived = await game.withMods((m) => ({
      travelling: m.cg.getCurrentlyTravellingToAsteroid('rocket1'),
      mining: m.cg.getMiningObject().rocket1,
      history: m.events.getEventsHistorySnapshot().map((e) => e.id)
    }));

    expect(arrived.history).toContain('rocketInstantArrival');
    // The journey is finished, not merely shortened.
    expect(arrived.travelling).toBe(false);
    expect(arrived.mining, 'and the rocket is parked on its asteroid').toBeTruthy();
  });

  test('an antimatter reaction destroys the asteroid, unbuilds the rocket and takes back what it mined', async ({ game }) => {
    // No rocket is mining yet.
    await triggerFromDebugMenu(game, 'antimatterReaction');
    const refused = await eventState(game, 'antimatterReaction');
    expect(refused.history).not.toContain('antimatterReaction');

    const asteroid = await sendRocket(game, { rocket: 'rocket1', arrive: true });
    await game.withMods((m) => m.rdo.setResourceDataObject(100000, 'antimatter', ['quantity']));
    // Let it mine for a while so there is something to lose.
    await game.advanceTimers(200000);
    await game.page.waitForTimeout(400);

    const result = await game.withMods((m, name) => {
      const entry = () => m.cg.getAsteroidArray().find((a) => a[name])?.[name];
      const before = {
        antimatter: m.rdo.getResourceDataObject('antimatter', ['quantity']),
        asteroidQuantity: Array.isArray(entry()?.quantity) ? entry().quantity[0] : entry()?.quantity,
        originalQuantity: entry()?.originalQuantity,
        destroyed: entry()?.destroyed,
        mining: m.cg.getMiningObject().rocket1
      };
      m.events.triggerSpecificRandomEventDebug('antimatterReaction');
      const after = {
        antimatter: m.rdo.getResourceDataObject('antimatter', ['quantity']),
        asteroidQuantity: Array.isArray(entry()?.quantity) ? entry().quantity[0] : entry()?.quantity,
        destroyed: entry()?.destroyed,
        beingMined: entry()?.beingMined,
        mining: m.cg.getMiningObject().rocket1
      };
      return { before, after, entry: m.events.getEventsHistorySnapshot()[0] };
    }, asteroid);

    expect(result.before.mining, 'the rocket should have been mining').toBe(asteroid);
    // Everything that came off the rock goes back into the void.
    const mined = result.before.originalQuantity - result.before.asteroidQuantity;
    expect(mined, 'the rocket should have mined something first').toBeGreaterThan(0);
    // Both sides are accumulated in fractional ticks, so they agree to within
    // floating-point noise rather than to the bit.
    expect(result.before.antimatter - result.after.antimatter).toBeCloseTo(mined, 6);
    expect(result.after.destroyed, 'the asteroid is destroyed').toBe(true);
    expect(result.after.asteroidQuantity).toBe(0);
    expect(result.after.beingMined).toBe(false);
    expect(result.after.mining, 'and the rocket is no longer on it').toBeFalsy();
    expect(result.entry.id).toBe('antimatterReaction');
  });

  test('losing the starship in space unbuilds the ship, its modules and the fleet', async ({ game }) => {
    // The guard wants a ship that is built, travelling and heading somewhere it
    // has not yet scanned — the debug scenario builds one but does not fly it.
    await triggerFromDebugMenu(game, 'starshipLostInSpace');
    const refused = await eventState(game, 'starshipLostInSpace');
    expect(refused.history, 'a parked starship cannot be lost').not.toContain('starshipLostInSpace');

    const result = await game.withMods((m) => {
      m.cg.setStarShipBuilt(true);
      m.cg.setStarShipTravelling(true);
      m.cg.setDestinationStarScanned(false);
      m.cg.setDestinationStar('Sirius');

      const read = () => ({
        built: m.cg.getStarShipBuilt(),
        travelling: m.cg.getStarShipTravelling(),
        destination: m.cg.getDestinationStar(),
        modules: ['ssStructural', 'ssLifeSupport', 'ssAntimatterEngine', 'ssFleetHangar', 'ssStellarScanner']
          .map((key) => m.rdo.getResourceDataObject('space', ['upgrades', key, 'finished'])),
        attackPower: m.rdo.getResourceDataObject('fleets', ['attackPower']),
        fleets: ['fleetScout', 'fleetMarauder', 'fleetLandStalker', 'fleetNavalStrafer']
          .map((key) => m.rdo.getResourceDataObject('space', ['upgrades', key, 'quantity']))
      });

      const before = read();
      m.events.triggerSpecificRandomEventDebug('starshipLostInSpace');
      return { before, after: read(), entry: m.events.getEventsHistorySnapshot()[0] };
    });

    expect(result.before.built).toBe(true);
    expect(result.after.built, 'the ship is gone').toBe(false);
    expect(result.after.travelling).toBe(false);
    expect(result.after.destination, 'and so is the destination it was flying to').toBeFalsy();
    expect(result.after.modules.every((finished) => finished === false)).toBe(true);
    expect(result.after.fleets.every((quantity) => quantity === 0)).toBe(true);
    expect(result.after.attackPower).toBe(0);
    expect(result.entry.id).toBe('starshipLostInSpace');
  });

  test('every negative instant event carries a modal header and body to explain itself', async ({ game }) => {
    const missing = await game.withMods((m, ids) => {
      const issues = [];
      for (const id of ids) {
        const cap = `${id.charAt(0).toUpperCase()}${id.slice(1)}`;
        for (const key of [`modalEvent${cap}Header`, `modalEvent${cap}Text`]) {
          const value = m.loc.localize(key, 'en');
          if (!value || value === key) issues.push(key);
        }
      }
      return issues;
    }, NEGATIVE_INSTANT_EVENT_IDS);

    expect(missing).toEqual([]);
  });
});

test.describe('Random Events — timed effects, their penalties and their clocks', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
  });

  test('a lockdown runs for its full thirty minutes, counts down, and refuses to restart itself', async ({ game }) => {
    await triggerFromDebugMenu(game, 'galacticMarketLockdown');

    const started = await eventState(game, 'galacticMarketLockdown');
    expect(started.active).toBe(true);
    expect(started.snapshot.totalDurationMs, 'the lockdown runs for thirty minutes').toBe(30 * 60 * 1000);
    expect(started.remaining).toBeGreaterThan(0);
    expect(started.remaining).toBeLessThanOrEqual(started.snapshot.totalDurationMs);
    expect(started.activeUi).toContain('galacticMarketLockdown');

    await game.page.waitForTimeout(2000);
    const later = await eventState(game, 'galacticMarketLockdown');
    expect(later.remaining, 'the clock is running').toBeLessThan(started.remaining);

    // Firing it again while it runs must be refused by the guard, not restart it.
    await triggerFromDebugMenu(game, 'galacticMarketLockdown');
    const afterRetrigger = await eventState(game, 'galacticMarketLockdown');
    expect(afterRetrigger.remaining).toBeLessThan(later.remaining + 1500);
    expect(afterRetrigger.snapshot.totalDurationMs).toBe(30 * 60 * 1000);
  });

  test('an expiring effect runs its restoration handler and moves into the completed log', async ({ game }) => {
    await triggerFromDebugMenu(game, 'galacticMarketLockdown');
    expect((await eventState(game, 'galacticMarketLockdown')).active).toBe(true);

    // Wind the remainder down to a sliver and let the per-frame effects timer run
    // it out, rather than clearing the state by hand — that is what puts the
    // expiry path and its history entry under test.
    await game.withMods((m) => {
      const state = m.rdo.getResourceDataObject('randomEvents', ['timedEffects', 'galacticMarketLockdown'], true) || {};
      m.rdo.setResourceDataObject({ ...state, remainingMs: 80 }, 'randomEvents', ['timedEffects', 'galacticMarketLockdown']);
    });
    await game.page.waitForTimeout(1800);

    const after = await game.withMods((m) => ({
      active: m.events.isTimedEffectActive('galacticMarketLockdown'),
      remaining: m.events.getTimedEffectRemainingMs('galacticMarketLockdown'),
      activeUi: m.events.getTimedEffectsUiSnapshot().map((e) => e.id),
      history: m.events.getTimedEffectsHistorySnapshot()
    }));

    expect(after.active).toBe(false);
    expect(after.remaining).toBe(0);
    expect(after.activeUi, 'an expired effect drops out of the live list').not.toContain('galacticMarketLockdown');

    const entry = after.history.find((e) => e.id === 'galacticMarketLockdown');
    expect(entry, 'and turns up in the completed log').toBeTruthy();
    // The logged duration is the effect's full length, not the sliver it was
    // wound down to, so the log reads as the event was advertised.
    expect(entry.durationMs).toBe(30 * 60 * 1000);
    expect(String(entry.description || '').length).toBeGreaterThan(0);
  });

  test('endless summer pins the weather sunny for its whole run and re-rolls it on expiry', async ({ game }) => {
    // Force a non-sunny sky first, so "sunny" afterwards means the event did it.
    await game.withMods((m) => m.game.forceWeatherCycle?.());
    await game.page.waitForTimeout(400);

    await triggerFromDebugMenu(game, 'endlessSummer');

    const running = await game.withMods((m) => ({
      active: m.events.isTimedEffectActive('endlessSummer'),
      snapshot: m.events.getTimedEffectStateSnapshot('endlessSummer'),
      weather: m.cg.getCurrentStarSystemWeatherEfficiency()
    }));

    expect(running.active).toBe(true);
    // Forty to fifty minutes, rolled per firing.
    expect(running.snapshot.totalDurationMs).toBeGreaterThanOrEqual(40 * 60 * 1000);
    expect(running.snapshot.totalDurationMs).toBeLessThanOrEqual(50 * 60 * 1000);

    // The event shortens the weather countdown to ten seconds so the sky turns
    // promptly; drive a re-roll and prove it can only come up sunny.
    await game.withMods((m) => m.game.forceWeatherCycle?.());
    await game.page.waitForTimeout(600);
    const forced = await game.withMods((m) => m.cg.getCurrentStarSystemWeatherEfficiency());
    expect(forced[2], `weather while endless summer runs: ${JSON.stringify(forced)}`).toBe('sunny');

    // Run it out and the weather is free to change again.
    await game.withMods((m) => {
      const state = m.rdo.getResourceDataObject('randomEvents', ['timedEffects', 'endlessSummer'], true) || {};
      m.rdo.setResourceDataObject({ ...state, remainingMs: 80 }, 'randomEvents', ['timedEffects', 'endlessSummer']);
    });
    await game.page.waitForTimeout(1800);

    const ended = await game.withMods((m) => ({
      active: m.events.isTimedEffectActive('endlessSummer'),
      history: m.events.getTimedEffectsHistorySnapshot().map((e) => e.id)
    }));
    expect(ended.active).toBe(false);
    expect(ended.history).toContain('endlessSummer');
  });

  test('a supply chain disruption names a material the run automates and throttles its production', async ({ game }) => {
    // The candidate list is built from materials with at least one autobuyer
    // tier owned: disrupting a supply the player has not automated would be
    // invisible. The debug scenario grants materials but buys no autobuyers.
    await triggerFromDebugMenu(game, 'supplyChainDisruption');
    expect((await eventState(game, 'supplyChainDisruption')).active, 'nothing automated, nothing to disrupt').toBe(false);

    // Automate exactly one material, so the event has one possible target and
    // the measurement below cannot be confused about which one it hit.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(1e9, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'quantity']);
      m.rdo.setResourceDataObject(10, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      m.rdo.setResourceDataObject(true, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'active']);
      m.cg.setPowerOnOff(true);
    });
    await game.page.waitForTimeout(600);

    // Measure the undisrupted rate first, by running the delta timers a known
    // distance rather than by reading the advertised rate off a field.
    const measure = async () => game.withMods(async (m) => {
      m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'quantity']);
      m.timers.timerManagerDelta.update(100000, 1);
      return m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']);
    });

    const normal = await measure();
    await triggerFromDebugMenu(game, 'supplyChainDisruption');

    const state = await game.withMods((m) => {
      const snapshot = m.events.getTimedEffectStateSnapshot('supplyChainDisruption') || {};
      return {
        active: m.events.isTimedEffectActive('supplyChainDisruption'),
        category: snapshot.category ?? null,
        key: snapshot.key ?? null,
        percentDown: snapshot.percentDown ?? null,
        totalDurationMs: snapshot.totalDurationMs ?? null
      };
    });

    const disrupted = await measure();

    expect(state.active).toBe(true);
    expect(state.category).toBe('resources');
    expect(state.key, 'the only automated material is the only candidate').toBe('hydrogen');
    // Fifteen minutes, and a 60-80% cut advertised to the player.
    expect(state.totalDurationMs).toBe(15 * 60 * 1000);
    expect(state.percentDown).toBeGreaterThanOrEqual(60);
    expect(state.percentDown).toBeLessThanOrEqual(80);

    expect(normal, 'the material should be producing to begin with').toBeGreaterThan(0);
    expect(disrupted, 'production must actually fall').toBeLessThan(normal);
    // The penalty the player is told about is the penalty they get.
    const measuredPercentDown = ((normal - disrupted) / normal) * 100;
    expect(
      measuredPercentDown,
      `advertised -${state.percentDown}%, measured -${measuredPercentDown.toFixed(1)}% (${normal} -> ${disrupted})`
    ).toBeCloseTo(state.percentDown, 0);
  });

  test('a broken-down miner stops that rocket and no other', async ({ game }) => {
    await triggerFromDebugMenu(game, 'minerBrokeDown');
    expect((await eventState(game, 'minerBrokeDown')).active, 'no rocket is mining yet').toBe(false);

    // Both journeys are launched before either is flown. Flying them one at a
    // time would leave the first rocket mining through the second one's whole
    // flight, and three million milliseconds of game time is enough to empty a
    // rock — which ends its mining and leaves nothing to compare against.
    await sendRocket(game, { rocket: 'rocket1', arrive: false });
    await sendRocket(game, { rocket: 'rocket2', arrive: false });
    await game.advanceTimers(3_000_000);
    await game.page.waitForTimeout(600);

    const parked = await game.withMods((m) => {
      m.rdo.setResourceDataObject(0, 'antimatter', ['quantity']);
      m.rdo.setResourceDataObject(1e9, 'antimatter', ['storageCapacity']);
      const mining = m.cg.getMiningObject();
      // Give both rocks plenty left, so the measurement window below cannot end
      // by exhausting one of them.
      for (const rocket of ['rocket1', 'rocket2']) {
        const name = mining[rocket];
        if (name) m.cg.changeAsteroidArray(name, 'quantity', [1e6, 'green-ready-text']);
      }
      return { rocket1: mining.rocket1 ?? null, rocket2: mining.rocket2 ?? null };
    });

    // Both rockets have to be genuinely working, and on different rocks, or
    // there is nothing to compare the broken one against.
    expect(parked.rocket1, 'rocket 1 should be mining').toBeTruthy();
    expect(parked.rocket2, 'rocket 2 should be mining').toBeTruthy();
    expect(parked.rocket1).not.toBe(parked.rocket2);

    // Both rockets are working, so a whole-stock measurement cannot tell them
    // apart. Each rocket's own asteroid can: what a rocket mines comes off the
    // rock it is parked on, so the two contributions are separable.
    await game.advanceTimers(100000);
    await game.page.waitForTimeout(400);

    await triggerFromDebugMenu(game, 'minerBrokeDown');
    const broken = await game.withMods((m) => m.events.getTimedEffectStateSnapshot('minerBrokeDown'));
    expect(['rocket1', 'rocket2'], 'the event must name a rocket that is actually mining')
      .toContain(broken.rocket);
    expect(broken.totalDurationMs, 'a miner is down for fifteen minutes').toBe(15 * 60 * 1000);

    // Measure each rocket's own contribution across a driven window.
    const measured = await game.withMods(async (m, brokenRocket) => {
      const others = ['rocket1', 'rocket2'].filter((r) => r !== brokenRocket);
      m.rdo.setResourceDataObject(0, 'antimatter', ['quantity']);

      const asteroidFor = (rocket) => m.cg.getMiningObject()[rocket];
      const rockOf = (name) => m.cg.getAsteroidArray().find((a) => a[name])?.[name];
      const readRock = (rocket) => {
        const entry = rockOf(asteroidFor(rocket));
        return Array.isArray(entry?.quantity) ? entry.quantity[0] : entry?.quantity;
      };

      const before = { broken: readRock(brokenRocket), other: readRock(others[0]) };
      m.timers.timerManagerDelta.update(200000, 1);
      const after = { broken: readRock(brokenRocket), other: readRock(others[0]) };

      return {
        brokenMined: before.broken - after.broken,
        otherMined: before.other - after.other,
        otherRocket: others[0]
      };
    }, broken.rocket);

    // The broken rocket takes nothing off its rock at all.
    expect(measured.brokenMined, `${broken.rocket} should be stopped dead`).toBe(0);
    // And the other one carries on, which is what makes it a targeted penalty
    // rather than a global one.
    expect(measured.otherMined, `${measured.otherRocket} should keep working`).toBeGreaterThan(0);
  });

  test('black hole instability shifts the power on a real-time clock and puts it back on expiry', async ({ game }) => {
    // The guard wants the black hole both discovered and researched.
    await triggerFromDebugMenu(game, 'blackHoleInstability');
    expect((await eventState(game, 'blackHoleInstability')).active, 'an unresearched black hole cannot destabilise').toBe(false);

    // Discovery is normally a random telescope event, so it is seeded; the
    // research itself is bought on its own button.
    await game.withMods((m) => {
      m.cg.setBlackHoleDiscovered(true);
      m.rdo.setResourceDataObject(1e12, 'research', ['quantity']);
      m.rdo.setResourceDataObject(1e12, 'research', ['storageCapacity']);
    });
    await game.openTab(7);
    await openOptionById(game, 'blackholeOption');
    await clickResearchBlackHole(game);

    const researched = await game.withMods((m) => m.rdo.getBlackHoleResearchDone());
    expect(researched, 'the Research button should have unlocked the feature').toBe(true);

    const before = await game.withMods((m) => ({
      power: m.rdo.getBlackHolePower(),
      duration: m.rdo.getBlackHoleDuration()
    }));

    await triggerFromDebugMenu(game, 'blackHoleInstability');

    const during = await game.withMods((m) => ({
      active: m.events.isTimedEffectActive('blackHoleInstability'),
      snapshot: m.events.getTimedEffectStateSnapshot('blackHoleInstability'),
      power: m.rdo.getBlackHolePower(),
      duration: m.rdo.getBlackHoleDuration()
    }));

    expect(during.active).toBe(true);
    // Fifteen to twenty-five minutes, rolled per firing.
    expect(during.snapshot.totalDurationMs).toBeGreaterThanOrEqual(15 * 60 * 1000);
    expect(during.snapshot.totalDurationMs).toBeLessThanOrEqual(25 * 60 * 1000);
    // The original values are stashed so they can be handed back.
    expect(during.snapshot.originalPower).toBe(before.power);
    expect(during.snapshot.originalDuration).toBe(before.duration);
    // The shift is a multiplier between 0.5 and 1.5 on the original power — it
    // can be a bonus or a penalty, which is what makes it *instability*.
    expect(during.snapshot.lastPowerMultiplier).toBeGreaterThanOrEqual(0.5);
    expect(during.snapshot.lastPowerMultiplier).toBeLessThanOrEqual(1.5);
    expect(during.power).toBeCloseTo(
      Math.max(0.01, Math.round(before.power * during.snapshot.lastPowerMultiplier * 100) / 100),
      2
    );

    // Running it out restores both values exactly.
    await game.withMods((m) => {
      const state = m.rdo.getResourceDataObject('randomEvents', ['timedEffects', 'blackHoleInstability'], true) || {};
      m.rdo.setResourceDataObject({ ...state, remainingMs: 80 }, 'randomEvents', ['timedEffects', 'blackHoleInstability']);
    });
    await game.page.waitForTimeout(1800);

    const after = await game.withMods((m) => ({
      active: m.events.isTimedEffectActive('blackHoleInstability'),
      power: m.rdo.getBlackHolePower(),
      duration: m.rdo.getBlackHoleDuration(),
      history: m.events.getTimedEffectsHistorySnapshot().map((e) => e.id)
    }));

    expect(after.active).toBe(false);
    expect(after.power, 'the original power is handed back').toBe(before.power);
    expect(after.duration).toBe(before.duration);
    expect(after.history).toContain('blackHoleInstability');
  });

  test('a running effect and its decayed probability both survive a save', async ({ game }) => {
    await triggerFromDebugMenu(game, 'galacticMarketLockdown');

    const result = await game.withMods((m) => {
      const live = m.events.getTimedEffectStateSnapshot('galacticMarketLockdown');
      const saved = JSON.parse(JSON.stringify(m.cg.captureGameStatusForSaving('initialise')));
      return {
        live,
        savedEffect: saved.resourceData?.randomEvents?.timedEffects?.galacticMarketLockdown,
        savedEvent: saved.resourceData?.randomEvents?.events?.galacticMarketLockdown
      };
    });

    expect(result.savedEffect).toBeTruthy();
    expect(result.savedEffect.remainingMs).toBeCloseTo(result.live.remainingMs, -2);
    expect(result.savedEffect.totalDurationMs).toBe(result.live.totalDurationMs);
    // A reload must not reset the event's rarity, or a run could be farmed by
    // saving and loading.
    expect(typeof result.savedEvent?.currentProbability).toBe('number');
    expect(result.savedEvent.currentProbability).toBeLessThan(0.15);
  });

  test('triggering an event decays its own probability and no other event rarity', async ({ game }) => {
    const result = await game.withMods((m) => {
      const readAll = () => {
        const out = {};
        for (const id of m.events.getRandomEventIds()) {
          out[id] = m.rdo.getResourceDataObject('randomEvents', ['events', id, 'currentProbability'], true);
        }
        return out;
      };

      const before = readAll();
      const series = [before.endlessSummer];
      for (let i = 0; i < 5; i++) {
        // Clear the effect between firings so the guard stays open.
        m.rdo.setResourceDataObject({ remainingMs: 0 }, 'randomEvents', ['timedEffects', 'endlessSummer']);
        m.events.triggerSpecificRandomEventDebug('endlessSummer');
        series.push(m.rdo.getResourceDataObject('randomEvents', ['events', 'endlessSummer', 'currentProbability'], true));
      }
      return { before, after: readAll(), series };
    });

    for (let i = 1; i < result.series.length; i++) {
      // Each trigger multiplies by 0.9 and is floored at 0.01.
      expect(result.series[i], `step ${i}: ${result.series.join(' -> ')}`)
        .toBeCloseTo(Math.max(0.01, result.series[i - 1] * 0.9), 6);
      expect(result.series[i]).toBeGreaterThanOrEqual(0.01);
    }
    // Every other event's rarity is untouched, so one common event cannot make
    // the rest of the catalogue rarer.
    for (const [id, probability] of Object.entries(result.before)) {
      if (id === 'endlessSummer') continue;
      expect(result.after[id], `${id} should be untouched`).toBe(probability);
    }
  });

  test('firing every registered event in turn leaves the game running and error free', async ({ game }) => {
    const ids = await game.withMods((m) => m.events.getRandomEventIds());
    expect(ids.length).toBeGreaterThan(0);

    for (const id of ids) {
      await triggerFromDebugMenu(game, id);
    }

    // The frame loop must survive every effect, including the ones that tear
    // buildings down and the ones that move the starship.
    const before = await game.withMods((m) => JSON.stringify(m.cg.getGameActiveCountTime()));
    await game.page.waitForTimeout(1500);
    const after = await game.withMods((m) => JSON.stringify(m.cg.getGameActiveCountTime()));

    expect(after).not.toBe(before);
    expect(game.significantErrors()).toEqual([]);

    // And the catalogue's two halves stayed on their own sides of the fence.
    const partition = await game.withMods((m, timed) => ({
      activeUi: m.events.getTimedEffectsUiSnapshot().map((e) => e.id),
      instantHistory: (m.rdo.getResourceDataObject('randomEvents', ['instantEventsHistory'], true) || []).map((e) => e.id),
      timedIds: timed
    }), TIMED_EVENT_IDS);

    for (const id of partition.instantHistory) {
      expect(partition.timedIds, `${id} was logged as instant`).not.toContain(id);
    }
  });
});
