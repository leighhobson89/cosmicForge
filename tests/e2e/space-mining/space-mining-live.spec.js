/**
 * Area: Space Mining & Asteroids — the survey, the two panels and the drill
 * Plan: tests/docs/areas/space-mining.md
 *
 * `antimatter/antimatter.spec.js` owns the *arithmetic* of extraction: the
 * ease-of-extraction formula, conservation between rock and store, the F-type and
 * Enhanced Mining multipliers. This file owns everything around it — the objects
 * the telescope creates, the two panels that display them, the boost control the
 * player actually holds down, and the end of a rocket's journey.
 *
 * ## What the Space Mining tab is made of
 *
 * Four surfaces, and the specs below are grouped the same way:
 *
 * | Surface | Where it lives | What it is |
 * |---|---|---|
 * | The survey | `discoverAsteroid` / `generateAsteroidData` | the record every other surface reads |
 * | Asteroids pane | `drawTab6Content('Asteroids')` | one row per rock, four sortable columns |
 * | Mining pane | `drawAntimatterFlowDiagram` | one SVG box per rocket, plus the rate bar |
 * | The rocket panes | `createRocketUI` | fuel, destination, Travel |
 *
 * ## Two things that shape how these specs are written
 *
 * **Asteroid generation is a roll, not a value.** Rarity, distance, complexity and
 * quantity are all randomised, and the bands they fall into are the contract. So
 * the survey specs discover *many* asteroids through the game's own discovery
 * path and assert that every one of them lands inside its documented band — that
 * catches a broken band in a way one sample never could.
 *
 * **The boost is a mouse gesture, not a function.** `boostAntimatterRate` is
 * wired to `mousedown`/`mouseup`/`mouseleave` listeners on `document` that filter
 * on `e.target.id === 'svgRateBarOuter'`, and they refuse to do anything at all
 * while `antimatter.rate` is zero. Every boost spec below therefore dispatches
 * the real gesture at the real element with a rocket genuinely mining, rather
 * than calling the exported function.
 *
 * ## Numbers this file pins, from constantsAndGlobalVars
 *
 *   TIMER_UPDATE_INTERVAL             10ms per tick
 *   TIMER_RATE_RATIO                  100 ticks per displayed second
 *   NORMAL_MAX_ANTIMATTER_RATE        0.004 per tick, at complexity 1
 *   BOOST_ANTIMATTER_RATE_MULTIPLIER  2
 *   ASTEROID_COST_MULTIPLIER          1.07 on the base scan per find
 *   rocketTravelSpeed                 0.2 distance units per ms
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** Per-tick extraction bounds, from constantsAndGlobalVars. */
const MAX_RATE = 0.004;
const MIN_RATE = 0.0001;

/** Ticks per displayed second — TIMER_RATE_RATIO. */
const RATE_RATIO = 100;

/** The base per-tick extraction rate for a rock of the given complexity. */
const baseRateForEase = (ease) => MAX_RATE - (((ease - 1) / 9) * (MAX_RATE - MIN_RATE));

/** The survey keeps at most this many asteroids nobody has interacted with. */
const UNINTERACTED_CAP = 100;

/** Antimatter bands by rarity, from `generateAsteroidData`. */
const QUANTITY_BANDS = {
  Common: [700, 1200],
  Uncommon: [1200, 2000],
  Rare: [2000, 4000],
  Legendary: [4000, 10000]
};

/** The distance window every asteroid is drawn from. */
const DISTANCE_MIN = 30_000;
const DISTANCE_MAX = 570_000;

// A full journey — fuel, launch, fly out, mine dry, fly home — is minutes of
// game time even when the delta manager is driven rather than waited on.
test.describe.configure({ timeout: 300_000 });

// ---------------------------------------------------------------------- helpers

/** Open a Space Mining side-menu row by id, the way a player clicks it. */
async function openTab6Option(game, optionId) {
  await game.openTab(6);
  const found = await game.page.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el) return false;
    el.classList.remove('invisible');
    el.closest('.row-side-menu')?.classList.remove('invisible');
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, optionId);
  if (!found) throw new Error(`No Space Mining side-menu row with id ${optionId}`);
  await game.page.waitForTimeout(700);
  return found;
}

const openAsteroidsPane = (game) => openTab6Option(game, 'asteroidsOption');
const openMiningPane = (game) => openTab6Option(game, 'miningOption');
const openRocketPane = (game, rocket = 'rocket1') => openTab6Option(game, rocket);

/**
 * Reach a run with the telescope, the launch pad, four rockets and ten
 * asteroids — the game's own scenario chain, not a hand-built fiction.
 *
 * Antimatter is zeroed afterwards so every "did the pile grow" assertion starts
 * from a known floor, and the megastructure contribution is cancelled so that
 * what the rockets produce is the whole of what arrives.
 */
async function prepareMiningRun(game) {
  await game.prepareRunForStarshipLaunch();
  await game.page.waitForTimeout(800);
  await game.withMods((m) => {
    m.rdo.setResourceDataObject(0, 'antimatter', ['quantity']);
    m.rdo.setResourceDataObject(1e12, 'antimatter', ['storageCapacity']);
    m.cg.setAntimatterUnlocked(true);
    m.cg.setMegaStructureAntimatterAmount(0);
    // Every telescope action and every fuel pump draws power, and a fresh run
    // has none of its own.
    m.cg.setInfinitePower(true);
    m.cg.setPowerOnOff(true);
  });
}

/** Empty the survey so a discovery test counts its own finds and nobody else's. */
async function clearSurvey(game) {
  await game.withMods((m) => {
    // The accessor hands back the live array and the setter only pushes, so the
    // only way to empty it is in place.
    m.cg.getAsteroidArray().length = 0;
    for (const rocket of ['rocket1', 'rocket2', 'rocket3', 'rocket4']) {
      m.cg.setMiningObject(rocket, null);
      m.cg.setDestinationAsteroid(rocket, null);
    }
  });
}

/** Discover asteroids through the debug menu's own Add 10 Asteroids button. */
async function discoverAsteroids(game, batchesOfTen = 1) {
  await game.debugClick('add10AsteroidsButton', { times: batchesOfTen, delayMs: 150 });
}

/** Every asteroid record, flattened for assertion. */
async function surveyRecords(game) {
  return game.withMods((m) => m.cg.getAsteroidArray().map((entry) => {
    const key = Object.keys(entry)[0];
    return { key, ...entry[key] };
  }));
}

/**
 * Put a named asteroid under a rocket's drill without flying there, and give it a
 * known complexity so the rate is an exact figure rather than a roll.
 *
 * Staging, not the behaviour under test — the journey itself is flown for real in
 * the "turning for home" group below.
 */
async function stageMining(game, { rocket = 'rocket1', ease = 1, quantity = 5000, index = 0 } = {}) {
  return game.withMods((m, config) => {
    const entry = m.cg.getAsteroidArray()[config.index];
    const name = Object.keys(entry)[0];

    m.cg.changeAsteroidArray(name, 'easeOfExtraction', [config.ease, 'green-ready-text']);
    m.cg.changeAsteroidArray(name, 'quantity', [config.quantity, 'green-ready-text']);
    entry[name].originalQuantity = config.quantity;

    m.cg.setDestinationAsteroid(config.rocket, name);
    m.cg.setRocketDirection(config.rocket, false);
    m.cg.setCurrentlyTravellingToAsteroid(config.rocket, false);
    m.cg.setLaunchedRockets(config.rocket, 'add');
    m.cg.setMiningObject(config.rocket, name);
    return name;
  }, { rocket, ease, quantity, index });
}

/** The live quantity on one asteroid, plus the total antimatter held. */
async function readMining(game, asteroidName) {
  return game.withMods((m, name) => {
    const entry = m.cg.getAsteroidArray().find((a) => a[name]);
    return {
      antimatter: m.rdo.getResourceDataObject('antimatter', ['quantity']),
      rate: m.rdo.getResourceDataObject('antimatter', ['rate']),
      asteroid: entry ? entry[name].quantity[0] : null,
      asteroidClass: entry ? entry[name].quantity[1] : null,
      original: entry ? entry[name].originalQuantity : null,
      beingMined: entry ? entry[name].beingMined : null
    };
  }, asteroidName);
}

/** The multiplier this run's star system applies to extraction, whatever it is. */
async function starSystemMultiplier(game) {
  return game.withMods((m) => {
    const system = m.cg.getCurrentStarSystem?.();
    const type = system ? m.desc.getStarTypeByName?.(system) : null;
    return type === 'F' ? 1 + m.cg.getFTypeAntimatterMiningBoostMultiplier() : 1;
  });
}

/**
 * Every row the Asteroids pane is currently showing, in display order.
 *
 * The `.option-row` class token is load-bearing. `createOptionRow` gives a row's
 * flavour-text container the row id with `Description` appended, so a bare
 * `[id^="asteroidRow_"]` selector matches each asteroid twice — once for the row
 * and once for its empty description container — which silently doubles every
 * count and every index.
 */
async function asteroidRows(page) {
  return page.evaluate(() => Array.from(document.querySelectorAll('.option-row[id^="asteroidRow_"]')).map((row) => {
    // The four cells are appended in a fixed order: rarity, distance,
    // complexity, antimatter. They share ids across rows, so they are read
    // positionally by class rather than by id.
    const cells = Array.from(row.querySelectorAll('.value-asteroid'));
    const text = (el) => (el?.textContent ?? '').trim();
    return {
      name: row.id.replace('asteroidRow_', ''),
      rarity: text(cells[0]),
      rarityClasses: cells[0] ? Array.from(cells[0].classList) : [],
      distance: text(cells[1]),
      distanceClasses: cells[1] ? Array.from(cells[1].classList) : [],
      ease: text(cells[2]),
      quantity: text(cells[3]),
      quantityClasses: cells[3] ? Array.from(cells[3].classList) : [],
      opacity: row.style.opacity
    };
  }));
}

/** Dispatch one mouse gesture straight at an element by id. */
async function mouseGesture(page, elementId, type) {
  const fired = await page.evaluate(({ id, eventType }) => {
    const el = document.getElementById(id);
    if (!el) return false;
    el.dispatchEvent(new MouseEvent(eventType, { bubbles: true }));
    return true;
  }, { id: elementId, eventType: type });
  if (!fired) throw new Error(`Element ${elementId} was not in the DOM for a ${type}`);
  await page.waitForTimeout(150);
}

// ============================================================ the survey itself

test.describe('Space Mining — the asteroids the telescope creates', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareMiningRun(game);
  });

  test('a real telescope scan run to completion adds a complete asteroid record', async ({ game }) => {
    await clearSurvey(game);

    // The scan's progress bar lives in the telescope pane and the timer writes to
    // it every frame, so that pane has to be the one on screen.
    await openTab6Option(game, 'spaceTelescopeOption');

    // discoverAsteroid rolls a 7% miss for any non-debug find, so scan until one
    // lands rather than assuming a single press produces a rock.
    let found = 0;
    for (let attempt = 0; attempt < 8 && found === 0; attempt++) {
      await game.page.evaluate(() => {
        document.getElementById('spaceTelescopeSearchAsteroidRow')
          ?.querySelector('button')
          ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      await game.page.waitForTimeout(200);
      // Longer than the widest roll of the base duration plus its 20% variance.
      await game.advanceTimers(600_000);
      await game.page.waitForTimeout(300);
      found = (await surveyRecords(game)).length;
    }

    expect(found, 'eight scans should land at least one asteroid').toBeGreaterThan(0);

    const [asteroid] = await surveyRecords(game);
    expect(asteroid.name, 'the record is keyed by its own name').toBe(asteroid.key);
    expect(Array.isArray(asteroid.distance), 'distance carries its colour class').toBe(true);
    expect(Array.isArray(asteroid.rarity)).toBe(true);
    expect(Array.isArray(asteroid.easeOfExtraction)).toBe(true);
    expect(Array.isArray(asteroid.quantity)).toBe(true);
    expect(asteroid.beingMined, 'a newly found rock has nobody on it').toBe(false);
    expect(asteroid.quantity[0], 'a fresh rock is full').toBe(asteroid.originalQuantity);
    expect(typeof asteroid.specialName).toBe('boolean');
  });

  test('an ordinary asteroid is named for the star system that found it', async ({ game }) => {
    await clearSurvey(game);
    await discoverAsteroids(game, 3);

    const starCode = await game.withMods((m) =>
      m.rdo.getStarSystemDataObject('stars', [m.cg.getCurrentStarSystem(), 'starCode']));
    const records = await surveyRecords(game);

    expect(records.length).toBeGreaterThan(0);
    for (const record of records) {
      if (record.specialName) continue; // legendaries are named for the commander
      expect(record.name, `${record.name} should carry the ${starCode} prefix`)
        .toMatch(new RegExp(`^${starCode.toUpperCase()}-\\d{4}[A-Z]$`));
    }
  });

  test('a legendary asteroid is named after the commander rather than the system', async ({ game }) => {
    await clearSurvey(game);
    // Legendaries are ~2% of ordinary rolls. The second Asteroid Scanner Boost
    // stack narrows the table to Rare and Legendary only, which is the game's own
    // way of making them common enough to observe.
    await game.withMods((m) => { m.rdo.getBuffAsteroidScannerBoostData().boughtYet = 2; });
    await discoverAsteroids(game, 6);

    const records = await surveyRecords(game);
    const legendaries = records.filter((r) => r.rarity[0] === 'Legendary');
    expect(legendaries.length, '60 rolls on the boosted table should include a legendary')
      .toBeGreaterThan(0);

    const pioneer = await game.withMods((m) => m.cg.getSaveName());
    const commander = pioneer.replace(/[0-9]/g, '');
    for (const legendary of legendaries) {
      expect(legendary.specialName, 'legendaries are flagged as specially named').toBe(true);
      expect(legendary.name.toLowerCase(), `${legendary.name} should carry the commander's name`)
        .toContain(commander.toLowerCase().slice(0, 6));
    }
  });

  test('every asteroid holds antimatter inside the band its rarity promises', async ({ game }) => {
    await clearSurvey(game);
    await discoverAsteroids(game, 6);

    const records = await surveyRecords(game);
    expect(records.length).toBeGreaterThan(20);

    for (const record of records) {
      const [rarity] = record.rarity;
      const [low, high] = QUANTITY_BANDS[rarity];
      expect(record.quantity[0], `${record.name} is ${rarity} and holds ${record.quantity[0]}`)
        .toBeGreaterThanOrEqual(low);
      expect(record.quantity[0], `${record.name} is ${rarity} and holds ${record.quantity[0]}`)
        .toBeLessThanOrEqual(high);
      expect(record.originalQuantity, 'the original is recorded for the percentage bands')
        .toBe(record.quantity[0]);
    }

    // The bands have to be reachable, or the loop above passes vacuously.
    const seen = new Set(records.map((r) => r.rarity[0]));
    expect(seen.size, `60 rolls produced only ${[...seen].join(', ')}`).toBeGreaterThan(1);
  });

  test('complexity is drawn from one to six and coloured by how hard it is', async ({ game }) => {
    await clearSurvey(game);
    await discoverAsteroids(game, 5);

    const expectedClass = (ease) => {
      if (ease === 1) return 'green-ready-text';
      if (ease <= 3) return 'none';
      if (ease <= 5) return 'warning-orange-text';
      return 'red-disabled-text';
    };

    for (const record of await surveyRecords(game)) {
      const [ease, easeClass] = record.easeOfExtraction;
      expect(Number.isInteger(ease), `${record.name} complexity ${ease}`).toBe(true);
      expect(ease).toBeGreaterThanOrEqual(1);
      expect(ease).toBeLessThanOrEqual(6);
      expect(easeClass, `${record.name} complexity ${ease} colour`).toBe(expectedClass(ease));
    }
  });

  test('distance is drawn from the published window and coloured by percentile', async ({ game }) => {
    await clearSurvey(game);
    await discoverAsteroids(game, 5);

    for (const record of await surveyRecords(game)) {
      const [distance, distanceClass] = record.distance;
      expect(distance).toBeGreaterThanOrEqual(DISTANCE_MIN);
      expect(distance).toBeLessThanOrEqual(DISTANCE_MAX);

      const percentile = (distance - DISTANCE_MIN) / (DISTANCE_MAX - DISTANCE_MIN);
      const expected = percentile >= 0.76 ? 'red-disabled-text'
        : percentile >= 0.51 ? 'orange-warning-text'
          : percentile >= 0.26 ? 'none' : 'green-ready-text';
      expect(distanceClass, `${record.name} at ${distance}`).toBe(expected);
    }
  });

  test('the antimatter colour never promises more than the rarity can deliver', async ({ game }) => {
    await clearSurvey(game);
    await discoverAsteroids(game, 6);

    for (const record of await surveyRecords(game)) {
      const rarity = record.rarity[0];
      const quantityClass = record.quantity[1];
      if (rarity === 'Common' || rarity === 'Uncommon') {
        expect(quantityClass, `a ${rarity} rock should never read as a good haul`)
          .not.toBe('green-ready-text');
      }
    }
  });

  test('the Asteroid Scanner Boost raises the floor of what a scan can find', async ({ game }) => {
    await clearSurvey(game);
    await game.withMods((m) => { m.rdo.getBuffAsteroidScannerBoostData().boughtYet = 1; });
    await discoverAsteroids(game, 5);
    const oneStack = (await surveyRecords(game)).map((r) => r.rarity[0]);

    await clearSurvey(game);
    await game.withMods((m) => { m.rdo.getBuffAsteroidScannerBoostData().boughtYet = 2; });
    await discoverAsteroids(game, 5);
    const twoStacks = (await surveyRecords(game)).map((r) => r.rarity[0]);

    expect(oneStack.length).toBeGreaterThan(20);
    expect(twoStacks.length).toBeGreaterThan(20);
    // One stack removes Common from the table; two removes Uncommon as well.
    expect(oneStack, 'one stack should never roll Common').not.toContain('Common');
    expect(twoStacks, 'two stacks should never roll Common').not.toContain('Common');
    expect(twoStacks, 'two stacks should never roll Uncommon').not.toContain('Uncommon');
  });

  test('every find makes the next scan longer', async ({ game }) => {
    await clearSurvey(game);
    const before = await game.withMods((m) => m.cg.getBaseSearchAsteroidTimerDuration());
    await discoverAsteroids(game, 1);
    const after = await game.withMods((m) => m.cg.getBaseSearchAsteroidTimerDuration());

    const multiplier = await game.withMods((m) => m.cg.getAsteroidCostMultiplier());
    expect(after / before, 'ten finds compound the base search duration ten times')
      .toBeCloseTo(Math.pow(multiplier, 10), 3);
  });

  test('the survey stops hoarding rocks nobody has touched', async ({ game }) => {
    await clearSurvey(game);
    await discoverAsteroids(game, 15);

    const records = await surveyRecords(game);
    expect(records.length, 'the uninteracted survey is capped')
      .toBeLessThanOrEqual(UNINTERACTED_CAP);
    expect(records.length, 'and it is allowed to fill right up to the cap')
      .toBe(UNINTERACTED_CAP);
  });

  test('an asteroid being mined is never pruned to make room for a new find', async ({ game }) => {
    await clearSurvey(game);
    await discoverAsteroids(game, 1);
    const mined = await stageMining(game, { ease: 1, quantity: 5000 });

    await discoverAsteroids(game, 15);

    const names = (await surveyRecords(game)).map((r) => r.key);
    expect(names, 'the rock under the drill survives the cull').toContain(mined);
  });

  test('discovering the first asteroid reveals the Asteroids pane', async ({ game }) => {
    await clearSurvey(game);
    await game.openTab(6);
    await game.page.evaluate(() => {
      // Put the row back to its pre-discovery state so the reveal is observable.
      document.getElementById('asteroidsOption')?.parentElement?.parentElement?.classList.add('invisible');
    });
    await game.page.waitForTimeout(300);

    await discoverAsteroids(game, 1);
    await game.page.waitForTimeout(400);

    const visible = await game.page.evaluate(() =>
      !document.getElementById('asteroidsOption')?.parentElement?.parentElement?.classList.contains('invisible'));
    expect(visible, 'the first find opens the Asteroids pane up').toBe(true);
  });
});

// ========================================================= the Asteroids panel

test.describe('Space Mining — the Asteroids panel', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareMiningRun(game);
  });

  test('the panel shows one row per asteroid, with the numbers the record holds', async ({ game }) => {
    await openAsteroidsPane(game);

    const records = await surveyRecords(game);
    const rows = await asteroidRows(game.page);

    expect(rows.length, 'every asteroid in the survey gets a row').toBe(records.length);

    const byName = new Map(records.map((r) => [r.key, r]));
    for (const row of rows) {
      const record = byName.get(row.name);
      expect(record, `row ${row.name} should correspond to a real asteroid`).toBeTruthy();
      expect(row.distance).toBe(String(record.distance[0]));
      expect(row.ease).toBe(String(record.easeOfExtraction[0]));
      // The panel floors the antimatter figure — a player is never shown a
      // fractional rock.
      expect(row.quantity).toBe(String(Math.floor(record.quantity[0])));
    }
  });

  test('the four legend columns are all sortable, and only one sorts at a time', async ({ game }) => {
    await openAsteroidsPane(game);

    const legendIds = {
      rarity: 'asteroidLegendRarity',
      distance: 'asteroidLegendDistance',
      eoe: 'asteroidLegendEOE',
      quantity: 'asteroidLegendQuantity'
    };

    for (const [method, id] of Object.entries(legendIds)) {
      await game.page.evaluate((legendId) => {
        document.getElementById(legendId)?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }, id);
      await game.page.waitForTimeout(400);

      const state = await game.page.evaluate((ids) => Object.fromEntries(
        Object.entries(ids).map(([key, elementId]) => {
          const el = document.getElementById(elementId);
          return [key, {
            sortBy: !!el?.classList.contains('sort-by'),
            noSort: !!el?.classList.contains('no-sort')
          }];
        })
      ), legendIds);

      expect(state[method].sortBy, `${method} should be the active sort`).toBe(true);
      for (const other of Object.keys(legendIds)) {
        if (other === method) continue;
        expect(state[other].noSort, `${other} should be marked as not sorting`).toBe(true);
      }

      const stored = await game.withMods((m) => m.cg.getSortAsteroidMethod());
      expect(stored, 'the chosen sort is remembered').toBe(method);
    }
  });

  test('sorting by distance puts the nearest rock at the top', async ({ game }) => {
    await openAsteroidsPane(game);
    await game.page.evaluate(() => {
      document.getElementById('asteroidLegendDistance')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(500);

    const distances = (await asteroidRows(game.page)).map((row) => Number(row.distance));
    const sorted = [...distances].sort((a, b) => a - b);
    expect(distances, 'the table is ordered nearest first').toEqual(sorted);
  });

  test('sorting by antimatter puts the richest rock at the top', async ({ game }) => {
    await openAsteroidsPane(game);
    await game.page.evaluate(() => {
      document.getElementById('asteroidLegendQuantity')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(500);

    const quantities = (await asteroidRows(game.page)).map((row) => Number(row.quantity));
    const sorted = [...quantities].sort((a, b) => b - a);
    expect(quantities, 'the table is ordered richest first').toEqual(sorted);
  });

  test('a rock under the drill is labelled as such and sinks below the untouched ones', async ({ game }) => {
    const mined = await stageMining(game, { ease: 1, quantity: 5000 });
    await game.advanceTimers(100);
    await openAsteroidsPane(game);

    const rows = await asteroidRows(game.page);
    const row = rows.find((r) => r.name === mined);
    expect(row, 'the mined rock still has a row').toBeTruthy();
    expect(row.rarityClasses, 'a rock being mined is coloured as active')
      .toContain('green-ready-text');
    expect(row.rarityClasses, 'and is not showing a rarity any more')
      .not.toContain('rarity-asteroid');

    const position = rows.findIndex((r) => r.name === mined);
    expect(position, 'a rock being mined sorts below the ones still free')
      .toBe(rows.length - 1);
  });

  test('an exhausted rock is greyed out, marked spent and sorted last', async ({ game }) => {
    const name = await stageMining(game, { ease: 1, quantity: 5000 });
    await game.withMods((m, asteroid) => {
      m.cg.changeAsteroidArray(asteroid, 'quantity', [0, 'red-disabled-text']);
      m.cg.setMiningObject('rocket1', null);
    }, name);
    await game.advanceTimers(100);
    await openAsteroidsPane(game);

    const rows = await asteroidRows(game.page);
    const row = rows.find((r) => r.name === name);
    expect(row).toBeTruthy();
    expect(row.opacity, 'a spent rock is dimmed').toBe('0.5');
    expect(row.rarityClasses).toContain('red-disabled-text');
    expect(row.distanceClasses, 'every column on a spent row is greyed')
      .toContain('red-disabled-text');
    expect(rows[rows.length - 1].name, 'spent rocks sort to the bottom').toBe(name);
  });

  test('the antimatter column follows the rock down as it is mined out', async ({ game }) => {
    const name = await stageMining(game, { ease: 1, quantity: 5000 });
    await openAsteroidsPane(game);
    const before = (await asteroidRows(game.page)).find((r) => r.name === name);

    await game.advanceTimers(200_000);
    await openAsteroidsPane(game);
    const after = (await asteroidRows(game.page)).find((r) => r.name === name);

    expect(Number(after.quantity), 'the displayed figure falls as the rock empties')
      .toBeLessThan(Number(before.quantity));

    // The rock is still being mined between the pane being read and the record
    // being read, so the two can legitimately differ by the tick that landed in
    // between. What must hold is that the panel is showing this rock's real
    // remaining quantity rather than a stale or unrelated figure.
    const live = await readMining(game, name);
    expect(Math.abs(Number(after.quantity) - Math.floor(live.asteroid)),
      `panel showed ${after.quantity}, record holds ${live.asteroid}`).toBeLessThanOrEqual(2);
  });

  test('the panel draws nothing at all before the first asteroid is found', async ({ game }) => {
    await clearSurvey(game);
    await openAsteroidsPane(game);

    const rows = await asteroidRows(game.page);
    expect(rows.length, 'an empty survey draws no rows').toBe(0);

    const legend = await game.page.evaluate(() => Boolean(document.getElementById('asteroidLegendRow')));
    expect(legend, 'and no legend either — the pane returns before building it').toBe(false);
  });
});

// ============================================================ the Mining panel

test.describe('Space Mining — the Mining panel', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareMiningRun(game);
  });

  test('the panel draws a box per rocket and an arrow labelled with its rate', async ({ game }) => {
    const name = await stageMining(game, { ease: 1, quantity: 5000 });
    await openMiningPane(game);
    await game.advanceTimers(1000);
    await game.page.waitForTimeout(500);

    const svg = await game.page.evaluate(() => {
      const element = document.getElementById('antimatterSvg');
      if (!element) return null;
      return {
        boxes: element.querySelectorAll('foreignObject').length,
        labels: Array.from(element.querySelectorAll('text')).map((t) => t.textContent.trim()),
        hasRateBar: Boolean(document.getElementById('svgRateBar')),
        hasRateBarOuter: Boolean(document.getElementById('svgRateBarOuter')),
        hasRateBarInner: Boolean(document.getElementById('svgRateBarInner')),
        hasBoostText: Boolean(document.getElementById('boostTextContainer'))
      };
    });

    expect(svg, 'the mining pane draws its diagram').not.toBeNull();
    // One box per rocket, plus the title, the rate bar and its scale.
    expect(svg.boxes).toBeGreaterThanOrEqual(5);
    expect(svg.labels.length, 'each of the four rockets gets a rate label').toBe(4);
    expect(svg.hasRateBar).toBe(true);
    expect(svg.hasRateBarOuter).toBe(true);
    expect(svg.hasRateBarInner).toBe(true);
    expect(svg.hasBoostText).toBe(true);

    // Three rockets are idle, and an idle rocket contributes nothing.
    expect(svg.labels.filter((l) => l === '0 / s').length).toBe(3);
    expect(name).toBeTruthy();
  });

  test('the rate on a rocket’s arrow is the rate its rock’s complexity implies', async ({ game }) => {
    const systemMultiplier = await starSystemMultiplier(game);

    for (const ease of [1, 4, 6]) {
      await stageMining(game, { ease, quantity: 500_000 });
      await openMiningPane(game);
      await game.advanceTimers(1000);
      await game.page.waitForTimeout(400);

      const labels = await game.page.evaluate(() =>
        Array.from(document.getElementById('antimatterSvg').querySelectorAll('text'))
          .map((t) => t.textContent.trim()));
      const working = labels.filter((l) => l !== '0 / s');

      expect(working.length, `complexity ${ease} should light exactly one arrow`).toBe(1);
      const expected = baseRateForEase(ease) * RATE_RATIO * systemMultiplier;
      expect(Number(working[0].replace(' / s', '')), `complexity ${ease}`)
        .toBeCloseTo(expected, 1);
    }
  });

  test('the box for a working rocket names its rock and counts down its contents', async ({ game }) => {
    const name = await stageMining(game, { ease: 1, quantity: 5000 });
    await openMiningPane(game);
    await game.advanceTimers(1000);
    await game.page.waitForTimeout(400);

    const boxText = await game.page.evaluate(() =>
      Array.from(document.getElementById('antimatterSvg').querySelectorAll('foreignObject table'))
        .map((t) => t.textContent.replace(/\s+/g, ' ').trim()));

    // The diagram truncates long names, so match on the leading portion the box
    // is guaranteed to show.
    const working = boxText.find((t) => t.includes(name.slice(0, 8)));
    expect(working, `the diagram should name ${name}`).toBeTruthy();

    // The figure in the box is floored at the moment the diagram was drawn and
    // the rock has been mined a little since, so the box is parsed and compared
    // with a tolerance rather than matched as a string.
    const live = await readMining(game, name);
    const shown = Number((working.match(/(\d+)\s*$/) ?? [])[1]);
    expect(Number.isFinite(shown), `no antimatter figure in "${working}"`).toBe(true);
    expect(Math.abs(shown - Math.floor(live.asteroid)),
      `box showed ${shown}, record holds ${live.asteroid}`).toBeLessThanOrEqual(2);
  });

  test('an idle rocket’s box says so rather than showing a rock', async ({ game }) => {
    await game.withMods((m) => {
      for (const rocket of ['rocket1', 'rocket2', 'rocket3', 'rocket4']) m.cg.setMiningObject(rocket, null);
    });
    await openMiningPane(game);
    await game.advanceTimers(1000);
    await game.page.waitForTimeout(400);

    const labels = await game.page.evaluate(() =>
      Array.from(document.getElementById('antimatterSvg').querySelectorAll('text'))
        .map((t) => t.textContent.trim()));
    expect(labels.every((l) => l === '0 / s'), 'nothing is mining, so nothing flows').toBe(true);
  });

  test('the side-menu readouts report the live rate per second and the whole stock', async ({ game }) => {
    const name = await stageMining(game, { ease: 1, quantity: 500_000 });
    await game.openTab(6);
    await game.advanceTimers(1000);
    await game.page.waitForTimeout(500);

    const readouts = await game.page.evaluate(() => ({
      rate: document.getElementById('miningRate')?.innerText?.trim(),
      rateClasses: Array.from(document.getElementById('miningRate')?.classList ?? []),
      quantity: document.getElementById('miningQuantity')?.innerText?.trim()
    }));
    const live = await readMining(game, name);

    expect(readouts.rate, 'the rate is shown per second, not per tick')
      .toBe(`${(live.rate * RATE_RATIO).toFixed(2)} / s`);
    expect(readouts.rateClasses, 'a producing mine reads as healthy').toContain('green-ready-text');
    // Whole, not fractional — and within the tick that landed between the two
    // reads, because the mine does not stop while the spec looks at it.
    expect(readouts.quantity).toMatch(/^\d+$/);
    expect(Math.abs(Number(readouts.quantity) - Math.floor(live.antimatter)),
      `readout ${readouts.quantity}, store holds ${live.antimatter}`).toBeLessThanOrEqual(2);
  });

  test('the rate readout turns orange the moment nothing is being mined', async ({ game }) => {
    await stageMining(game, { ease: 1, quantity: 500_000 });
    await game.openTab(6);
    await game.advanceTimers(1000);
    await game.page.waitForTimeout(400);

    await game.withMods((m) => m.cg.setMiningObject('rocket1', null));
    await game.advanceTimers(1000);
    await game.page.waitForTimeout(500);

    const classes = await game.page.evaluate(() =>
      Array.from(document.getElementById('miningRate')?.classList ?? []));
    expect(classes, 'an idle mine warns rather than reassures').toContain('warning-orange-text');
    expect(classes).not.toContain('green-ready-text');
  });
});

// ============================================================ the boost control

test.describe('Space Mining — the boost', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareMiningRun(game);
  });

  /** Stage a rock, open the Mining pane and let the diagram draw with a live rate. */
  async function stageBoostableMine(game, { ease = 1, quantity = 1e7 } = {}) {
    const name = await stageMining(game, { ease, quantity });
    await openMiningPane(game);
    await game.advanceTimers(1000);
    await game.page.waitForTimeout(600);
    return name;
  }

  test('holding the rate bar doubles what comes off the rock, releasing it stops', async ({ game }) => {
    const name = await stageBoostableMine(game);

    const plain0 = await readMining(game, name);
    await game.advanceTimers(100_000);
    const plain1 = await readMining(game, name);
    const unboosted = plain0.asteroid - plain1.asteroid;

    await mouseGesture(game.page, 'svgRateBarOuter', 'mousedown');
    expect(await game.withMods((m) => m.cg.getIsAntimatterBoostActive()),
      'pressing the bar starts the boost').toBe(true);

    const boosted0 = await readMining(game, name);
    await game.advanceTimers(100_000);
    const boosted1 = await readMining(game, name);
    const boosted = boosted0.asteroid - boosted1.asteroid;

    await mouseGesture(game.page, 'svgRateBarOuter', 'mouseup');
    expect(await game.withMods((m) => m.cg.getIsAntimatterBoostActive()),
      'letting go stops it').toBe(false);

    expect(unboosted).toBeGreaterThan(0);
    expect(boosted / unboosted, `boosted ${boosted} vs plain ${unboosted}`)
      .toBeGreaterThan(1.9);
    expect(boosted / unboosted).toBeLessThan(2.1);

    // And the effect really is temporary.
    const after0 = await readMining(game, name);
    await game.advanceTimers(100_000);
    const after1 = await readMining(game, name);
    expect((after0.asteroid - after1.asteroid) / unboosted, 'the rate returns to normal')
      .toBeLessThan(1.1);
  });

  test('the bar shows the boost while it is held', async ({ game }) => {
    await stageBoostableMine(game);

    const before = await game.page.evaluate(() => ({
      height: document.getElementById('svgRateBarInner')?.style.height,
      boostColour: document.getElementById('boostTextContainer')?.style.color
    }));

    await mouseGesture(game.page, 'svgRateBarOuter', 'mousedown');

    const during = await game.page.evaluate(() => ({
      height: document.getElementById('svgRateBarInner')?.style.height,
      innerColour: document.getElementById('svgRateBarInner')?.style.backgroundColor,
      boostColour: document.getElementById('boostTextContainer')?.style.color
    }));

    expect(parseFloat(during.height), 'the fill doubles while boosting')
      .toBeCloseTo(parseFloat(before.height) * 2, 4);
    expect(during.innerColour, 'and turns the ready colour').toContain('--ready-text');
    expect(during.boostColour, 'as does the BOOST caption').toContain('--ready-text');
    expect(before.boostColour).not.toBe(during.boostColour);

    await mouseGesture(game.page, 'svgRateBarOuter', 'mouseup');
  });

  test('sliding off the bar ends the boost as surely as releasing it', async ({ game }) => {
    await stageBoostableMine(game);

    await mouseGesture(game.page, 'svgRateBarOuter', 'mousedown');
    expect(await game.withMods((m) => m.cg.getIsAntimatterBoostActive())).toBe(true);

    await mouseGesture(game.page, 'svgRateBarOuter', 'mouseleave');
    expect(await game.withMods((m) => m.cg.getIsAntimatterBoostActive()),
      'the pointer leaving the bar releases the boost').toBe(false);
  });

  test('hovering the bar reveals the BOOST caption', async ({ game }) => {
    await stageBoostableMine(game);

    const hidden = await game.page.evaluate(() =>
      document.getElementById('boostTextContainer')?.style.visibility);
    expect(hidden, 'the caption starts hidden').toBe('hidden');

    await mouseGesture(game.page, 'svgRateBarOuter', 'mouseenter');

    const shown = await game.page.evaluate(() => ({
      visibility: document.getElementById('boostTextContainer')?.style.visibility,
      opacity: document.getElementById('boostTextContainer')?.style.opacity
    }));
    expect(shown.visibility, 'hovering reveals it').toBe('visible');
    expect(shown.opacity).toBe('1');
  });

  test('the bar cannot be boosted while nothing is being mined', async ({ game }) => {
    await stageBoostableMine(game);
    await mouseGesture(game.page, 'svgRateBarOuter', 'mouseup');

    // Take the rocket off the rock and let the rate fall to zero.
    await game.withMods((m) => m.cg.setMiningObject('rocket1', null));
    await game.advanceTimers(1000);
    await game.page.waitForTimeout(400);
    expect(await game.withMods((m) => m.rdo.getResourceDataObject('antimatter', ['rate']))).toBe(0);

    await mouseGesture(game.page, 'svgRateBarOuter', 'mousedown');
    expect(await game.withMods((m) => m.cg.getIsAntimatterBoostActive()),
      'there is nothing to boost, so the gesture does nothing').toBe(false);
  });

  test('the boost sound loops while the boost is held and stops when it ends', async ({ game }) => {
    await game.withMods((m) => m.cg.setSfx(true));
    await stageBoostableMine(game);

    await mouseGesture(game.page, 'svgRateBarOuter', 'mousedown');
    const during = await game.withMods((m) => m.audio.boostSoundManager.boostSoundStarted);
    expect(during, 'the boost loop runs while the bar is held').toBe(true);

    await mouseGesture(game.page, 'svgRateBarOuter', 'mouseup');
    const after = await game.withMods((m) => ({
      started: m.audio.boostSoundManager.boostSoundStarted,
      queued: m.audio.boostSoundManager.boostSounds.size
    }));
    expect(after.started, 'and stops with it').toBe(false);
    expect(after.queued, 'leaving nothing playing').toBe(0);
  });

  test('the boost stays silent when sound effects are turned off', async ({ game }) => {
    await game.withMods((m) => m.cg.setSfx(false));
    await stageBoostableMine(game);

    await mouseGesture(game.page, 'svgRateBarOuter', 'mousedown');
    const state = await game.withMods((m) => ({
      boosting: m.cg.getIsAntimatterBoostActive(),
      sound: m.audio.boostSoundManager.boostSoundStarted
    }));

    expect(state.boosting, 'the boost itself still applies').toBe(true);
    expect(state.sound, 'but it makes no noise').toBe(false);

    await mouseGesture(game.page, 'svgRateBarOuter', 'mouseup');
  });
});

// ================================================ antimatter in, asteroid out

test.describe('Space Mining — what goes into the store comes off a rock', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareMiningRun(game);
  });

  test('two rockets on two rocks add up to one total, and each rock pays its own share', async ({ game }) => {
    const first = await stageMining(game, { rocket: 'rocket1', ease: 1, quantity: 50_000, index: 0 });
    const second = await stageMining(game, { rocket: 'rocket2', ease: 6, quantity: 50_000, index: 1 });

    // One round trip per sample: reading the store and the two rocks in separate
    // evaluates lets the frame loop mine in between, and that drift reads as
    // antimatter appearing from nowhere.
    const sample = () => game.withMods((m, names) => {
      const quantityOf = (name) => m.cg.getAsteroidArray().find((a) => a[name])?.[name]?.quantity[0];
      return {
        antimatter: m.rdo.getResourceDataObject('antimatter', ['quantity']),
        first: quantityOf(names.first),
        second: quantityOf(names.second)
      };
    }, { first, second });

    const start = await sample();
    await game.advanceTimers(100_000);
    const end = await sample();

    const firstRemoved = start.first - end.first;
    const secondRemoved = start.second - end.second;
    const gained = end.antimatter - start.antimatter;

    expect(firstRemoved, 'the easy rock gives up more').toBeGreaterThan(secondRemoved);
    expect(secondRemoved, 'and the hard one still gives up something').toBeGreaterThan(0);
    expect(gained, 'every unit off both rocks lands in the same store')
      .toBeCloseTo(firstRemoved + secondRemoved, 3);
  });

  test('the last tick is clamped to what is left rather than overdrawing the rock', async ({ game }) => {
    const name = await stageMining(game, { ease: 1, quantity: 7 });
    const before = await readMining(game, name);

    // Far more ticks than seven units can supply.
    await game.advanceTimers(200_000);
    await game.page.waitForTimeout(400);

    const after = await readMining(game, name);
    expect(after.asteroid, 'the rock empties exactly, never past zero').toBe(0);
    expect(before.asteroid).toBeLessThanOrEqual(7);
  });

  test('mining never touches the original quantity the bands are measured against', async ({ game }) => {
    const name = await stageMining(game, { ease: 1, quantity: 5000 });
    const before = await readMining(game, name);

    await game.advanceTimers(300_000);

    const after = await readMining(game, name);
    expect(after.asteroid, 'the rock is being worked').toBeLessThan(before.asteroid);
    expect(after.original, 'but the figure the percentage is measured against holds still')
      .toBe(before.original);
  });

  test('the megastructure contribution adds to mining rather than replacing it', async ({ game }) => {
    const name = await stageMining(game, { ease: 1, quantity: 500_000 });

    const sample = async () => {
      const a = await readMining(game, name);
      await game.advanceTimers(100_000);
      const b = await readMining(game, name);
      return { gained: b.antimatter - a.antimatter, removed: a.asteroid - b.asteroid };
    };

    const mineOnly = await sample();
    await game.withMods((m) => m.cg.setMegaStructureAntimatterAmount(0.15));
    const withStructure = await sample();

    expect(withStructure.removed, 'the rock is worked at the same rate either way')
      .toBeCloseTo(mineOnly.removed, 0);
    expect(withStructure.gained, 'but more antimatter arrives')
      .toBeGreaterThan(mineOnly.gained);
    // 0.15 per second across 10,000 ticks, which is 100 seconds of game time.
    expect(withStructure.gained - mineOnly.gained).toBeCloseTo(15, 0);
  });
});

// ========================================================== turning for home

test.describe('Space Mining — a rocket flown out, mined dry and brought home', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareMiningRun(game);
  });

  test('a rocket flies out on its own Travel button and starts mining where it lands', async ({ game }) => {
    await game.withMods((m) => m.cg.setLaunchedRockets('rocket1', 'add'));
    await openRocketPane(game, 'rocket1');

    const destination = await game.page.evaluate(() => {
      const dropdown = document.getElementById('rocket1TravelDropdown');
      const option = dropdown?.querySelector('div.dropdown-option');
      if (!option) return null;
      dropdown.querySelector('div.dropdown')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      option.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return option.getAttribute('data-value');
    });
    expect(destination, 'the survey should populate the destination dropdown').toBeTruthy();

    await game.page.evaluate(() =>
      document.querySelector('.rocket1-travel-to-asteroid-button')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await game.page.waitForTimeout(400);

    const outbound = await game.withMods((m) => ({
      travelling: m.cg.getCurrentlyTravellingToAsteroid('rocket1'),
      duration: m.cg.getRocketTravelDuration().rocket1,
      remaining: m.cg.getTimeLeftUntilRocketTravelToAsteroidTimerFinishes('rocket1')
    }));
    expect(outbound.travelling, 'pressing Travel launches the journey').toBe(true);
    expect(outbound.remaining).toBeGreaterThan(0);

    // The flight is as long as the distance makes it: distance / speed.
    const expectedDuration = await game.withMods((m, name) => {
      const entry = m.cg.getAsteroidArray().find((a) => a[name]);
      return Math.floor(entry[name].distance[0] / m.cg.getRocketTravelSpeed());
    }, destination);
    expect(outbound.duration).toBe(expectedDuration);

    await game.advanceTimers(3_000_000);
    await game.page.waitForTimeout(400);

    const arrived = await game.withMods((m) => ({
      mining: m.cg.getMiningObject().rocket1,
      travelling: m.cg.getCurrentlyTravellingToAsteroid('rocket1')
    }));
    expect(arrived.travelling).toBe(false);
    expect(arrived.mining, 'the rocket parks on the rock it was sent to').toBe(destination);
  });

  test('a rock worked dry turns its rocket round without being asked', async ({ game }) => {
    const name = await stageMining(game, { ease: 1, quantity: 15 });

    await game.advanceTimers(200_000);
    await game.page.waitForTimeout(400);

    const state = await game.withMods((m, asteroid) => ({
      quantity: m.cg.getAsteroidArray().find((a) => a[asteroid])?.[asteroid]?.quantity[0],
      returning: m.cg.getRocketDirection('rocket1'),
      mining: m.cg.getMiningObject().rocket1,
      travelling: m.cg.getCurrentlyTravellingToAsteroid('rocket1'),
      hasReturnTimer: m.timers.timerManagerDelta.hasTimer('rocket1TravelReturnTimer'),
      remaining: m.cg.getTimeLeftUntilRocketTravelToAsteroidTimerFinishes('rocket1')
    }), name);

    expect(state.quantity, 'the rock is spent').toBe(0);
    expect(state.returning, 'the rocket is pointed home').toBe(true);
    expect(state.mining, 'and is no longer counted as mining').toBe(null);
    expect(state.travelling, 'the return leg is under way').toBe(true);
    expect(state.hasReturnTimer, 'driven by a real return timer').toBe(true);
    expect(state.remaining).toBeGreaterThan(0);
  });

  test('the boost is dropped when the rocket turns for home', async ({ game }) => {
    const name = await stageMining(game, { ease: 1, quantity: 40 });
    await openMiningPane(game);
    await game.advanceTimers(1000);
    await game.page.waitForTimeout(500);

    await mouseGesture(game.page, 'svgRateBarOuter', 'mousedown');
    expect(await game.withMods((m) => m.cg.getIsAntimatterBoostActive())).toBe(true);

    await game.advanceTimers(200_000);
    await game.page.waitForTimeout(400);

    const state = await game.withMods((m, asteroid) => ({
      boosting: m.cg.getIsAntimatterBoostActive(),
      quantity: m.cg.getAsteroidArray().find((a) => a[asteroid])?.[asteroid]?.quantity[0]
    }), name);

    expect(state.quantity).toBe(0);
    expect(state.boosting, 'a rock that runs out cancels the boost with it').toBe(false);
  });

  test('the return leg ends with the rocket empty, unlaunched and ready to fly again', async ({ game }) => {
    await stageMining(game, { ease: 1, quantity: 15 });
    await game.withMods((m) =>
      m.rdo.setResourceDataObject(500, 'space', ['upgrades', 'rocket1', 'fuelQuantity']));

    await game.advanceTimers(200_000);
    await game.page.waitForTimeout(400);
    expect(await game.withMods((m) => m.cg.getRocketDirection('rocket1'))).toBe(true);

    // Fly the return leg out, rather than calling the completion handler.
    await game.advanceTimers(3_000_000);
    await game.page.waitForTimeout(500);

    const home = await game.withMods((m) => ({
      fuel: m.rdo.getResourceDataObject('space', ['upgrades', 'rocket1', 'fuelQuantity']),
      launched: m.cg.getLaunchedRockets().includes('rocket1'),
      destination: m.cg.getDestinationAsteroid('rocket1'),
      direction: m.cg.getRocketDirection('rocket1'),
      readyToTravel: m.cg.getRocketReadyToTravel('rocket1'),
      travelling: m.cg.getCurrentlyTravellingToAsteroid('rocket1'),
      hasReturnTimer: m.timers.timerManagerDelta.hasTimer('rocket1TravelReturnTimer'),
      duration: m.cg.getRocketTravelDuration().rocket1
    }));

    expect(home.travelling, 'the journey is over').toBe(false);
    expect(home.hasReturnTimer, 'and its timer has been torn down').toBe(false);
    expect(home.fuel, 'the tank is empty again').toBe(0);
    expect(home.launched, 'the rocket is back on the pad').toBe(false);
    expect(home.destination, 'with no destination held over').toBe(null);
    expect(home.direction, 'and pointing outward for the next trip').toBe(false);
    expect(home.readyToTravel).toBe(true);
    expect(home.duration).toBe(0);
  });

  test('working a rock dry sets the achievement that gates later content', async ({ game }) => {
    await stageMining(game, { ease: 1, quantity: 15 });
    await game.advanceTimers(200_000);
    await game.page.waitForTimeout(400);

    // `checkForAchievements` clears the flag in the same frame it grants the
    // achievement, so the flag is transient and the grant is what lasts.
    const granted = await game.withMods((m) =>
      m.rdo.getAchievementDataObject('mineAllAntimatterAsteroid', ['active']));
    expect(granted, 'mining a rock out is an achievement in its own right').toBe(true);
  });

  test('a spent rock can no longer be chosen as a destination', async ({ game }) => {
    const name = await stageMining(game, { ease: 1, quantity: 15 });
    await game.advanceTimers(200_000);
    await game.page.waitForTimeout(400);
    // Bring the rocket home so its own pane offers the dropdown again.
    await game.advanceTimers(3_000_000);
    await game.page.waitForTimeout(400);

    await game.withMods((m) => m.cg.setLaunchedRockets('rocket1', 'add'));
    await openRocketPane(game, 'rocket1');

    const offered = await game.page.evaluate(() =>
      Array.from(document.querySelectorAll('#rocket1TravelDropdown div.dropdown-option'))
        .map((option) => option.getAttribute('data-value')));

    expect(offered.length, 'the other rocks are still on offer').toBeGreaterThan(0);
    expect(offered, 'but an emptied rock is not').not.toContain(name);
  });

  test('a rock another rocket is already flying to is not offered twice', async ({ game }) => {
    await game.withMods((m) => {
      m.cg.setLaunchedRockets('rocket1', 'add');
      m.cg.setLaunchedRockets('rocket2', 'add');
    });

    await openRocketPane(game, 'rocket2');
    const claimed = await game.page.evaluate(() => {
      const dropdown = document.getElementById('rocket2TravelDropdown');
      const option = dropdown?.querySelector('div.dropdown-option');
      dropdown?.querySelector('div.dropdown')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      option?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return option?.getAttribute('data-value');
    });
    expect(claimed).toBeTruthy();

    await openRocketPane(game, 'rocket1');
    const offered = await game.page.evaluate(() =>
      Array.from(document.querySelectorAll('#rocket1TravelDropdown div.dropdown-option'))
        .map((option) => option.getAttribute('data-value')));

    expect(offered, 'another rocket has already claimed it').not.toContain(claimed);
  });
});
