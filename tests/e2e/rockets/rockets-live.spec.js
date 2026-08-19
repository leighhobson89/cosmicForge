/**
 * Area: Rockets & Launch Pad — the pad, the four airframes, the tanks and the run
 * Plan: tests/docs/areas/rockets.md
 *
 * `rockets.spec.js` covers the catalogue and the accessors. This file builds the
 * thing: it buys the launch pad through its own button, fits every part of all
 * four rockets by hand, renames them in the header field, fills a tank by
 * pressing Fuel, launches, picks a rock out of the dropdown, flies there and
 * brings the rocket home again — then does it a second time with the same
 * rocket, which is the only way to prove the reset actually resets.
 *
 * ## The division of labour with Space Mining
 *
 * `space-mining/space-mining-live.spec.js` already owns the *journey as a mining
 * operation*: that a rocket parks on the rock it was sent to, that a rock worked
 * dry turns its rocket round, that the return leg leaves the run's state clean,
 * and that a claimed or spent rock drops out of the dropdown. None of that is
 * repeated here. What this file owns is the *machine*: what it costs, what it is
 * called, what the pad and the panes say while it is doing all that, and whether
 * a rocket can be flown twice.
 *
 * ## The numbers, from resourceDataObject
 *
 * | | rocket1 | rocket2 | rocket3 | rocket4 |
 * |---|---|---|---|---|
 * | parts to build | 12 | 17 | 22 | 27 |
 * | tank capacity | 10,000 | 12,000 | 14,000 | 16,000 |
 * | fuel pump price | $5,000 | $6,000 | $7,000 | $8,000 |
 * | pump energy draw | 0.7 | 0.8 | 0.9 | 1.0 |
 *
 * Every part costs the same four prices to begin with — $1,000, 1,000 glass,
 * 700 titanium, 3,000 steel — and each purchase multiplies all four by
 * `GAME_COST_MULTIPLIER` (1.13, rounded up). Rockets therefore differ in price
 * only because they differ in part count, and the difference compounds: 27 parts
 * on a 1.13 curve costs far more than twice what 12 parts cost.
 *
 * ## Two mechanics that shape how these specs are written
 *
 * **Purchases are deferred.** A rocket part calls `gain()`, which does not spend
 * anything — it files the bill with `setItemsToDeduct` and the price rise with
 * `setItemsToIncreasePrice`, and the *frame loop* settles both on its next pass.
 * So every purchase here is followed by real time, not by an immediate read. The
 * launch pad is the exception: `buildSpaceMiningBuilding` spends on the spot.
 *
 * **Fuel is a rate, not a payment.** `handleRocketFuelTick` adds
 * `rate x (deltaMs / 10) x TIMER_RATE_RATIO` per driven tick while the grid is
 * up, which at 0.02 is 0.2 units per millisecond of driven time — 50,000ms to
 * fill rocket1's 10,000-unit tank. The specs drive the timer rather than waiting.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** Parts needed to complete each airframe, from resourceDataObject. */
const PARTS_NEEDED = { rocket1: 12, rocket2: 17, rocket3: 22, rocket4: 27 };

/** Tank capacity per rocket. */
const TANK_CAPACITY = { rocket1: 10_000, rocket2: 12_000, rocket3: 14_000, rocket4: 16_000 };

/** Fuel pump price and energy draw per rocket. */
const PUMP_PRICE = { rocket1: 5000, rocket2: 6000, rocket3: 7000, rocket4: 8000 };
const PUMP_ENERGY = { rocket1: 0.7, rocket2: 0.8, rocket3: 0.9, rocket4: 1.0 };

/** The four prices a rocket part costs before any escalation. */
const PART_BASE_PRICE = { cash: 1000, glass: 1000, titanium: 700, steel: 3000 };

/** The launch pad's four prices. */
const PAD_BASE_PRICE = { cash: 40_000, iron: 1000, titanium: 700, concrete: 12_000 };

/** GAME_COST_MULTIPLIER — every purchase multiplies every price by this. */
const COST_MULTIPLIER = 1.13;

/** Fuel added per millisecond of driven time at the shipped pump rate of 0.02. */
const FUEL_PER_MS = 0.2;

// Fitting 78 rocket parts one frame at a time, and flying two round trips, is
// minutes of wall-clock even with the delta manager driven rather than waited on.
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

const openLaunchPadPane = (game) => openTab6Option(game, 'launchPadOption');
const openRocketPane = (game, rocket = 'rocket1') => openTab6Option(game, rocket);

/**
 * A run with money, materials, every ordinary tech and a grid that never fails —
 * but *no* launch pad and no rockets, because building those is what this file
 * is for.
 *
 * `prepareRunForStarshipLaunch` is deliberately not used: its chain includes
 * `buildLaunchPadScannerAndAllRocketsButton`, which would hand the run the very
 * purchases under test.
 */
async function stockedRun(game) {
  await game.debugClick('give1BButton');
  await game.debugClick('give1MAllResourcesAndCompounds');
  await game.debugClick('grantAllTechsButton');
  await game.debugClick('unlockAllTabsButton');
  await game.page.waitForTimeout(600);
  await game.withMods((m) => {
    // Every pump draws power and a fresh run generates none of its own.
    m.cg.setInfinitePower(true);
    m.cg.setPowerOnOff(true);
  });
  await game.page.waitForTimeout(300);
}

/** Everything the four price paths hold for one space upgrade. */
async function prices(game, upgrade) {
  return game.withMods((m, key) => ({
    cash: m.rdo.getResourceDataObject('space', ['upgrades', key, 'price']),
    resource1: m.rdo.getResourceDataObject('space', ['upgrades', key, 'resource1Price']),
    resource2: m.rdo.getResourceDataObject('space', ['upgrades', key, 'resource2Price']),
    resource3: m.rdo.getResourceDataObject('space', ['upgrades', key, 'resource3Price'])
  }), upgrade);
}

/** The player's purse and the three stockpiles a rocket part is paid from. */
async function wallet(game) {
  return game.withMods((m) => ({
    cash: m.rdo.getResourceDataObject('currency', ['cash']),
    glass: m.rdo.getResourceDataObject('compounds', ['glass', 'quantity']),
    titanium: m.rdo.getResourceDataObject('compounds', ['titanium', 'quantity']),
    steel: m.rdo.getResourceDataObject('compounds', ['steel', 'quantity']),
    iron: m.rdo.getResourceDataObject('resources', ['iron', 'quantity']),
    concrete: m.rdo.getResourceDataObject('compounds', ['concrete', 'quantity'])
  }));
}

/**
 * Press a button by CSS selector, the way a click lands on it.
 *
 * Dispatched rather than driven through the mouse because several of these
 * controls sit under the pane's own scroll container. That deliberately bypasses
 * the `pointer-events: none` the colour class carries, which is why the
 * affordability gate is asserted as a *class* in its own spec rather than by
 * clicking and hoping for a refusal.
 */
async function press(page, selector, { times = 1, settleMs = 250 } = {}) {
  for (let i = 0; i < times; i++) {
    const hit = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    }, selector);
    if (!hit) throw new Error(`Nothing matched ${selector}`);
    await page.waitForTimeout(settleMs);
  }
}

/** Buy the launch pad through its own Build button. */
async function buyLaunchPad(game) {
  await openLaunchPadPane(game);
  await press(game.page, 'button.launchPad', { settleMs: 500 });
  const bought = await game.withMods((m) =>
    m.rdo.getResourceDataObject('space', ['upgrades', 'launchPad', 'launchPadBoughtYet']));
  if (!bought) throw new Error('The launch pad did not register as built');
}

/**
 * Fit every part of a rocket through its own Build Rocket Part button.
 *
 * One press per part, each followed by a beat of real time, because the bill and
 * the price rise are both settled by the frame loop rather than by the click.
 */
async function buildRocket(game, rocket) {
  await openLaunchPadPane(game);
  const rowId = `space${rocket.charAt(0).toUpperCase()}${rocket.slice(1)}BuildRow`;
  await press(game.page, `#${rowId} button`, { times: PARTS_NEEDED[rocket], settleMs: 130 });
  await game.page.waitForTimeout(500);
  const built = await game.withMods((m, key) => m.cg.getRocketsBuilt().includes(key), rocket);
  if (!built) throw new Error(`${rocket} did not finish building`);
}

/**
 * The Fuel row's status label and the Launch button, on a rocket's own pane.
 *
 * The live fuel level is read here too, in the same round trip as the controls
 * that display it. The pump keeps running in real time, so a level fetched in a
 * separate call is a different reading from the one the button was written with,
 * and the two disagree by a percentage point often enough to matter.
 */
async function fuelRow(page, rocket = 'rocket1') {
  return page.evaluate((key) => {
    const rowId = `space${key.charAt(0).toUpperCase()}${key.slice(1)}AutoBuyerRow`;
    const label = document.querySelector(`#${rowId} .description-container .notation`);
    const launch = document.querySelector(`.${key}-launch-button`);
    const bar = document.getElementById(`${key}FuellingProgressBar`);
    const fuelButton = document.querySelector(`button.${key}`);
    return {
      rowPresent: Boolean(document.getElementById(rowId)),
      rowClasses: Array.from(document.getElementById(rowId)?.classList ?? []),
      label: label?.textContent?.trim(),
      labelClasses: Array.from(label?.classList ?? []),
      launchText: launch?.textContent?.trim(),
      launchClasses: Array.from(launch?.classList ?? []),
      barWidth: bar?.style.width,
      fuelButtonClasses: Array.from(fuelButton?.classList ?? []),
      level: globalThis.__mods.game.getFuelLevel(key)
    };
  }, rocket);
}

/**
 * The Travel row's status label and its progress bar.
 *
 * The timer the label is drawn from is read here too. The journey keeps running
 * in real time, so a remaining-time figure fetched in a separate call is a later
 * reading than the one the label was written with, and the countdown they imply
 * differs by a second often enough to matter.
 */
async function travelRow(page, rocket = 'rocket1') {
  return page.evaluate((key) => {
    const capitalised = key.charAt(0).toUpperCase() + key.slice(1);
    const rowId = `space${capitalised}TravelRow`;
    const label = document.querySelector(`#${rowId} .description-container .notation`);
    const bar = document.getElementById(`spaceTravelToAsteroidProgressBar${capitalised}`);
    const destination = document.getElementById(`${key}DestinationAsteroid`);
    return {
      label: label?.textContent?.trim(),
      labelClasses: Array.from(label?.classList ?? []),
      barWidth: bar?.style.width,
      destinationText: destination?.textContent?.trim(),
      destinationClasses: Array.from(destination?.classList ?? []),
      remaining: globalThis.__mods.cg.getTimeLeftUntilRocketTravelToAsteroidTimerFinishes(key),
      duration: globalThis.__mods.cg.getRocketTravelDuration()[key]
    };
  }, rocket);
}

/**
 * The countdown a status label should be showing, allowing for the second that
 * may have elapsed between the frame that painted it and the frame that read it.
 */
function countdownCandidates(template, remaining) {
  const seconds = Math.max(Math.floor(remaining / 1000), 0);
  return [seconds, seconds + 1].map((value) => template.replace('{seconds}', String(value)));
}

/** Press Fuel on the open rocket pane and drive the pump for a given span. */
async function fuelFor(game, rocket, ms) {
  await press(game.page, `button.${rocket}`, { settleMs: 300 });
  await game.advanceTimers(ms);
  await game.page.waitForTimeout(700);
}

/**
 * Fill a rocket's tank to the brim and confirm it is marked ready.
 *
 * The weather is cleared to sunny through the game's own debug control before
 * the tank is read. Rain and a volcano both hold a fuelled rocket on the pad —
 * correctly, and the Weather area proves that — so a run that happened to roll
 * one would leave the Launch button reading "Bad Weather!" and every readiness
 * assertion here measuring the wrong hold. Weather is a rolled state, not a
 * fixed one, so it is set deliberately rather than hoped for.
 */
async function fuelToFull(game, rocket = 'rocket1') {
  await fuelFor(game, rocket, (TANK_CAPACITY[rocket] / FUEL_PER_MS) + 20_000);
  await game.debugClick('clearWeatherButton');
  await game.page.waitForTimeout(900);
  const state = await game.withMods((m, key) => ({
    quantity: m.rdo.getResourceDataObject('space', ['upgrades', key, 'fuelQuantity']),
    capacity: m.rdo.getResourceDataObject('space', ['upgrades', key, 'fuelQuantityToLaunch']),
    ready: m.cg.getRocketsFuellerStartedArray().includes(`${key}FuelledUp`)
  }), rocket);
  expect(state.quantity, `${rocket} should have filled its tank`).toBe(state.capacity);
  expect(state.ready, `${rocket} should be marked ready for launch`).toBe(true);
}

/** Choose the first rock the dropdown offers, the way a player picks one. */
async function chooseFirstDestination(game, rocket = 'rocket1') {
  const chosen = await game.page.evaluate((key) => {
    const dropdown = document.getElementById(`${key}TravelDropdown`);
    const option = dropdown?.querySelector('div.dropdown-option');
    if (!option) return null;
    dropdown.querySelector('div.dropdown')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    option.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return option.getAttribute('data-value');
  }, rocket);
  await game.page.waitForTimeout(300);
  return chosen;
}

/** A localized string, resolved the way the game resolves it. */
const say = (game, key) => game.withMods((m, k) => m.loc.localize(k, m.cg.getLanguage()), key);

/**
 * Wait for a notification carrying the given text.
 *
 * `showNotification` queues by classification and shows one entry at a time for
 * its full duration, so the message a spec is looking for is routinely sitting
 * behind another one at the moment the action that raised it returns. Reading
 * the container once therefore misses it, which is not a defect in the game.
 */
async function expectNotification(game, text, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  let seen = '';
  while (Date.now() < deadline) {
    seen = (await game.notifications()).join(' | ');
    if (seen.includes(text)) return;
    await game.page.waitForTimeout(400);
  }
  expect(seen, `no notification carrying "${text}" appeared within ${timeoutMs}ms`).toContain(text);
}

/**
 * Strip thousands separators from a rendered figure.
 *
 * The Travel row's status label carries the `notation` class, so the frame loop
 * formats every number inside it. Under the default abbreviated notation a
 * countdown of 1,579 seconds renders as `1.5K`, which no template comparison can
 * survive; the specs below set plain notation and strip its separators so the
 * sentence can be matched against the catalogue string it came from.
 */
const plainNumbers = (text) => String(text ?? '').replace(/,/g, '');

/** Give the run rocks to fly to. */
async function surveyAsteroids(game, batches = 1) {
  await game.debugClick('add10AsteroidsButton', { times: batches, delayMs: 200 });
}

// =========================================================== the launch pad

test.describe('Rockets — the launch pad', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await stockedRun(game);
  });

  test('the pad quotes four prices and is not built on a fresh run', async ({ game }) => {
    await openLaunchPadPane(game);

    const padPrices = await prices(game, 'launchPad');
    expect(padPrices.cash).toBe(PAD_BASE_PRICE.cash);
    expect(padPrices.resource1).toEqual([PAD_BASE_PRICE.iron, 'iron', 'resources']);
    expect(padPrices.resource2).toEqual([PAD_BASE_PRICE.titanium, 'titanium', 'compounds']);
    expect(padPrices.resource3).toEqual([PAD_BASE_PRICE.concrete, 'concrete', 'compounds']);

    const bought = await game.withMods((m) =>
      m.rdo.getResourceDataObject('space', ['upgrades', 'launchPad', 'launchPadBoughtYet']));
    expect(bought, 'nothing is built before the player builds it').toBe(false);

    const rowVisible = await game.page.evaluate(() =>
      !document.getElementById('spaceBuildLaunchPadRow')?.classList.contains('invisible'));
    expect(rowVisible, 'and the row offering it is on screen').toBe(true);
  });

  test('building it pays all four prices out of the run', async ({ game }) => {
    await openLaunchPadPane(game);
    const before = await wallet(game);

    await buyLaunchPad(game);

    const after = await wallet(game);
    expect(before.cash - after.cash, 'cash').toBe(PAD_BASE_PRICE.cash);
    expect(before.iron - after.iron, 'iron').toBe(PAD_BASE_PRICE.iron);
    expect(before.titanium - after.titanium, 'titanium').toBe(PAD_BASE_PRICE.titanium);
    expect(before.concrete - after.concrete, 'concrete').toBe(PAD_BASE_PRICE.concrete);
  });

  test('a built pad marks itself bought, hides its offer and says so', async ({ game }) => {
    await buyLaunchPad(game);
    await game.page.waitForTimeout(600);

    const state = await game.page.evaluate(() => ({
      rowHidden: document.getElementById('spaceBuildLaunchPadRow')?.classList.contains('invisible'),
      boughtTextHidden: document.getElementById('launchPadAlreadyBoughtText')?.classList.contains('invisible'),
      boughtText: document.getElementById('launchPadAlreadyBoughtText')?.textContent?.trim()
    }));

    expect(state.rowHidden, 'the offer is withdrawn once taken').toBe(true);
    expect(state.boughtTextHidden, 'and the row reports the purchase').toBe(false);
    expect(state.boughtText).toBe(await say(game, 'textBought'));
  });

  test('building it announces itself by the notification the pad owns', async ({ game }) => {
    await buyLaunchPad(game);
    await expectNotification(game, await say(game, 'notificationLaunchPadBuilt'));
  });

  test('the Build button is colour-gated while the pad is out of reach', async ({ game }) => {
    // The whole affordability mechanism in this game is the colour class, whose
    // CSS is `pointer-events: none`. Asserting the class is asserting the design;
    // clicking and expecting a refusal would assert something the game never
    // promised, because a dispatched click ignores pointer-events entirely.
    await game.debugClick('give100Button');
    await openLaunchPadPane(game);
    await game.page.waitForTimeout(900);

    const poor = await game.page.evaluate(() =>
      Array.from(document.querySelector('button.launchPad')?.classList ?? []));
    expect(poor, 'a hundred dollars does not buy a launch pad').toContain('red-disabled-text');

    await game.debugClick('give1BButton');
    await game.page.waitForTimeout(900);

    const rich = await game.page.evaluate(() =>
      Array.from(document.querySelector('button.launchPad')?.classList ?? []));
    expect(rich, 'and the gate lifts the moment the money is there')
      .not.toContain('red-disabled-text');
  });

  test('the pad is what puts the four airframes on the workbench', async ({ game }) => {
    await buyLaunchPad(game);
    await game.page.waitForTimeout(600);

    const rows = await game.page.evaluate(() =>
      ['Rocket1', 'Rocket2', 'Rocket3', 'Rocket4'].map((key) => {
        const row = document.getElementById(`space${key}BuildRow`);
        return { id: `space${key}BuildRow`, present: Boolean(row), hidden: row?.classList.contains('invisible') };
      }));

    for (const row of rows) {
      expect(row.present, `${row.id} should be drawn`).toBe(true);
      expect(row.hidden, `${row.id} should be offered once the pad exists`).toBe(false);
    }
  });
});

// ================================================== modules, prices, assembly

test.describe('Rockets — buying the four airframes', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await stockedRun(game);
    await buyLaunchPad(game);
  });

  test('each airframe needs its own number of parts, and its row says so', async ({ game }) => {
    await openLaunchPadPane(game);

    const counters = await game.page.evaluate(() =>
      ['rocket1', 'rocket2', 'rocket3', 'rocket4'].map((key) => ({
        key,
        built: document.getElementById(`${key}BuiltPartsQuantity`)?.textContent?.trim(),
        total: document.getElementById(`${key}TotalPartsQuantity`)?.textContent?.trim()
      })));

    for (const counter of counters) {
      expect(Number(counter.total), `${counter.key} part count`).toBe(PARTS_NEEDED[counter.key]);
      expect(Number(counter.built), `${counter.key} starts unbuilt`).toBe(0);
    }

    // The four are strictly ascending, which is what makes each one a bigger
    // commitment than the last rather than four of the same rocket.
    const totals = counters.map((c) => Number(c.total));
    for (let i = 1; i < totals.length; i++) {
      expect(totals[i], 'each rocket is larger than the one before').toBeGreaterThan(totals[i - 1]);
    }
  });

  test('every part is paid for in cash and three real compounds', async ({ game }) => {
    await openLaunchPadPane(game);

    const quoted = await prices(game, 'rocket1');
    expect(quoted.cash).toBe(PART_BASE_PRICE.cash);
    expect(quoted.resource1).toEqual([PART_BASE_PRICE.glass, 'glass', 'compounds']);
    expect(quoted.resource2).toEqual([PART_BASE_PRICE.titanium, 'titanium', 'compounds']);
    expect(quoted.resource3).toEqual([PART_BASE_PRICE.steel, 'steel', 'compounds']);

    const before = await wallet(game);
    await press(game.page, '#spaceRocket1BuildRow button', { settleMs: 700 });
    const after = await wallet(game);

    expect(before.cash - after.cash, 'cash').toBe(PART_BASE_PRICE.cash);
    expect(before.glass - after.glass, 'glass').toBe(PART_BASE_PRICE.glass);
    expect(before.titanium - after.titanium, 'titanium').toBe(PART_BASE_PRICE.titanium);
    expect(before.steel - after.steel, 'steel').toBe(PART_BASE_PRICE.steel);
  });

  test('each part fitted makes the next one dearer, in all four currencies', async ({ game }) => {
    await openLaunchPadPane(game);
    await press(game.page, '#spaceRocket1BuildRow button', { settleMs: 700 });

    const afterOne = await prices(game, 'rocket1');
    expect(afterOne.cash).toBe(Math.ceil(PART_BASE_PRICE.cash * COST_MULTIPLIER));
    expect(afterOne.resource1[0]).toBe(Math.ceil(PART_BASE_PRICE.glass * COST_MULTIPLIER));
    expect(afterOne.resource2[0]).toBe(Math.ceil(PART_BASE_PRICE.titanium * COST_MULTIPLIER));
    expect(afterOne.resource3[0]).toBe(Math.ceil(PART_BASE_PRICE.steel * COST_MULTIPLIER));

    await press(game.page, '#spaceRocket1BuildRow button', { settleMs: 700 });

    const afterTwo = await prices(game, 'rocket1');
    expect(afterTwo.cash, 'the curve compounds rather than adding a flat step')
      .toBe(Math.ceil(afterOne.cash * COST_MULTIPLIER));
    expect(afterTwo.resource3[0]).toBe(Math.ceil(afterOne.resource3[0] * COST_MULTIPLIER));

    // And the compound names never drift as the numbers climb.
    expect(afterTwo.resource1[1]).toBe('glass');
    expect(afterTwo.resource2[1]).toBe('titanium');
    expect(afterTwo.resource3[1]).toBe('steel');
  });

  test('one rocket getting dearer leaves the other three at their opening price', async ({ game }) => {
    await openLaunchPadPane(game);
    await press(game.page, '#spaceRocket1BuildRow button', { times: 3, settleMs: 400 });
    await game.page.waitForTimeout(600);

    const first = await prices(game, 'rocket1');
    expect(first.cash).toBeGreaterThan(PART_BASE_PRICE.cash);

    for (const other of ['rocket2', 'rocket3', 'rocket4']) {
      const quoted = await prices(game, other);
      expect(quoted.cash, `${other} has its own price curve`).toBe(PART_BASE_PRICE.cash);
      expect(quoted.resource3[0], `${other} compounds untouched`).toBe(PART_BASE_PRICE.steel);
    }
  });

  test('the built counter climbs with each part fitted', async ({ game }) => {
    await openLaunchPadPane(game);
    await press(game.page, '#spaceRocket1BuildRow button', { times: 4, settleMs: 300 });
    await game.page.waitForTimeout(600);

    const shown = await game.page.evaluate(() =>
      Number(document.getElementById('rocket1BuiltPartsQuantity')?.textContent?.trim()));
    const recorded = await game.withMods((m) =>
      m.rdo.getResourceDataObject('space', ['upgrades', 'rocket1', 'builtParts']));

    expect(recorded, 'four parts fitted').toBe(4);
    expect(shown, 'and the counter agrees with the record').toBe(recorded);
  });

  test('fitting the last part completes the rocket and closes the row', async ({ game }) => {
    await buildRocket(game, 'rocket1');
    await game.page.waitForTimeout(900);

    const state = await game.page.evaluate(() => {
      const label = document.querySelector('#spaceRocket1BuildRow .description-container .notation');
      const button = document.querySelector('#spaceRocket1BuildRow button');
      return {
        labelText: label?.textContent?.trim(),
        labelClasses: Array.from(label?.classList ?? []),
        buttonClasses: Array.from(button?.classList ?? []),
        builtSpanClasses: Array.from(document.getElementById('rocket1BuiltPartsQuantity')?.classList ?? [])
      };
    });

    const builtExclaim = await say(game, 'textBuiltExclaim');
    expect(state.labelText, 'the row stops quoting a price and reports completion').toBe(builtExclaim);
    expect(state.labelClasses).toContain('green-ready-text');
    expect(state.buttonClasses, 'and there is nothing left to buy').toContain('red-disabled-text');
    expect(state.builtSpanClasses).toContain('green-ready-text');

    const registered = await game.withMods((m) => m.cg.getRocketsBuilt());
    expect(registered, 'the rocket joins the fleet').toContain('rocket1');
  });

  test('a rocket cannot be built past its part count', async ({ game }) => {
    await buildRocket(game, 'rocket1');
    await openLaunchPadPane(game);

    const cashBefore = await game.withMods((m) => m.rdo.getResourceDataObject('currency', ['cash']));
    await press(game.page, '#spaceRocket1BuildRow button', { times: 3, settleMs: 300 });
    await game.page.waitForTimeout(600);

    const parts = await game.withMods((m) =>
      m.rdo.getResourceDataObject('space', ['upgrades', 'rocket1', 'builtParts']));
    expect(parts, 'a finished rocket stays finished').toBe(PARTS_NEEDED.rocket1);

    const built = await game.withMods((m) => m.cg.getRocketsBuilt());
    expect(built.filter((entry) => entry === 'rocket1'), 'and is registered once, not four times')
      .toHaveLength(1);

    // The clicks still land — the gate is the colour class, which a dispatched
    // event ignores — so what is asserted is that the parts are capped, not that
    // the handler refused.
    expect(cashBefore).toBeGreaterThan(0);
  });

  test('a finished rocket gets a side-menu row of its own; an unfinished one does not', async ({ game }) => {
    await openLaunchPadPane(game);
    await game.page.waitForTimeout(900);

    const beforeBuild = await game.page.evaluate(() =>
      ['rocket1', 'rocket2', 'rocket3', 'rocket4'].map((key) =>
        document.getElementById(key)?.parentElement?.parentElement?.classList.contains('invisible')));
    expect(beforeBuild.every(Boolean), 'no rocket has a pane before it exists').toBe(true);

    await buildRocket(game, 'rocket1');
    await openLaunchPadPane(game);
    await game.page.waitForTimeout(900);

    const afterBuild = await game.page.evaluate(() =>
      ['rocket1', 'rocket2', 'rocket3', 'rocket4'].map((key) =>
        document.getElementById(key)?.parentElement?.parentElement?.classList.contains('invisible')));
    expect(afterBuild[0], 'the finished one gets its pane').toBe(false);
    expect(afterBuild.slice(1).every(Boolean), 'the unfinished ones do not').toBe(true);
  });

  test('all four can be built, and the later ones cost far more than the earlier', async ({ game }) => {
    const spent = {};
    for (const rocket of ['rocket1', 'rocket2', 'rocket3', 'rocket4']) {
      const before = await wallet(game);
      await buildRocket(game, rocket);
      const after = await wallet(game);
      spent[rocket] = before.cash - after.cash;
    }

    const built = await game.withMods((m) => m.cg.getRocketsBuilt());
    for (const rocket of ['rocket1', 'rocket2', 'rocket3', 'rocket4']) {
      expect(built, `${rocket} finished`).toContain(rocket);
    }

    // Each part costs 1.13x the last, so a rocket's total is a geometric series
    // over its own part count: 1000 x (1.13^n - 1) / 0.13, allowing for the
    // per-purchase rounding up.
    const seriesTotal = (parts) => {
      let price = PART_BASE_PRICE.cash;
      let total = 0;
      for (let i = 0; i < parts; i++) {
        total += price;
        price = Math.ceil(price * COST_MULTIPLIER);
      }
      return total;
    };

    for (const rocket of ['rocket1', 'rocket2', 'rocket3', 'rocket4']) {
      const expected = seriesTotal(PARTS_NEEDED[rocket]);
      expect(spent[rocket], `${rocket} cost ${spent[rocket]}, expected about ${expected}`)
        .toBeGreaterThan(expected * 0.99);
      expect(spent[rocket]).toBeLessThan(expected * 1.01);
    }

    expect(spent.rocket2, 'rocket 2 costs more than rocket 1').toBeGreaterThan(spent.rocket1);
    expect(spent.rocket3).toBeGreaterThan(spent.rocket2);
    expect(spent.rocket4).toBeGreaterThan(spent.rocket3);
    expect(spent.rocket4, 'and the curve makes the gap far wider than the part count alone')
      .toBeGreaterThan(spent.rocket1 * 4);
  });
});

// ==================================================================== naming

test.describe('Rockets — naming', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await stockedRun(game);
    await game.debugClick('buildLaunchPadScannerAndAllRocketsButton');
    await game.page.waitForTimeout(1200);
  });

  test('a rocket pane is headed by an editable name field and a Rename button', async ({ game }) => {
    await openRocketPane(game, 'rocket1');

    const header = await game.page.evaluate(() => {
      const field = document.getElementById('rocket1NameField');
      const button = document.querySelector('#rocket1-rename-btn button');
      return {
        editable: field?.getAttribute('contenteditable'),
        text: field?.textContent?.trim(),
        buttonText: button?.textContent?.trim()
      };
    });

    expect(header.editable, 'the name is typed into, not chosen from a list').toBe('true');
    expect(header.text).toBe(await game.withMods((m) => m.cg.getRocketUserName('rocket1')));
    expect(header.buttonText).toBe(await say(game, 'buttonRename'));
  });

  test('renaming through the button takes everywhere the name is shown', async ({ game }) => {
    await openRocketPane(game, 'rocket1');

    await game.page.evaluate(() => {
      const field = document.getElementById('rocket1NameField');
      field.textContent = 'Hopeful';
      field.dispatchEvent(new InputEvent('input', { bubbles: true }));
    });
    await press(game.page, '#rocket1-rename-btn button', { settleMs: 600 });

    const stored = await game.withMods((m) => m.cg.getRocketUserName('rocket1'));
    expect(stored, 'the name the player typed is the name the game keeps').toBe('Hopeful');

    // The frame loop is what carries the new name out to the side menu.
    await game.page.waitForTimeout(900);
    const sideMenu = await game.page.evaluate(() =>
      document.getElementById('rocket1')?.textContent?.trim());
    expect(sideMenu, 'and the side-menu row follows it').toBe('Hopeful');

    // Re-opening the pane must find it too: the pane is drawn by matching the
    // heading against the rocket's user name, so a rename that did not reach the
    // draw path would open an empty pane.
    await openRocketPane(game, 'rocket1');
    const reopened = await game.page.evaluate(() => ({
      field: document.getElementById('rocket1NameField')?.textContent?.trim(),
      fuelRow: Boolean(document.getElementById('spaceRocket1AutoBuyerRow'))
    }));
    expect(reopened.field).toBe('Hopeful');
    expect(reopened.fuelRow, 'the renamed rocket still draws its own controls').toBe(true);
  });

  test('the name field stops at twelve characters', async ({ game }) => {
    await openRocketPane(game, 'rocket1');

    await game.page.evaluate(() => {
      const field = document.getElementById('rocket1NameField');
      field.textContent = 'AbsurdlyLongRocketName';
      field.dispatchEvent(new InputEvent('input', { bubbles: true }));
    });
    await game.page.waitForTimeout(200);

    const shown = await game.page.evaluate(() =>
      document.getElementById('rocket1NameField')?.textContent);
    expect(shown, 'the field truncates rather than accepting a name it cannot draw')
      .toBe('AbsurdlyLong');
    expect(shown.length).toBe(12);
  });

  test('Enter commits the rename without touching the button', async ({ game }) => {
    await openRocketPane(game, 'rocket1');

    await game.page.evaluate(() => {
      const field = document.getElementById('rocket1NameField');
      field.textContent = 'Enterprise';
      field.dispatchEvent(new InputEvent('input', { bubbles: true }));
      field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    await game.page.waitForTimeout(400);

    expect(await game.withMods((m) => m.cg.getRocketUserName('rocket1'))).toBe('Enterprise');
  });

  test('renaming one rocket leaves the other three alone', async ({ game }) => {
    const before = await game.withMods((m) =>
      ['rocket1', 'rocket2', 'rocket3', 'rocket4'].map((key) => m.cg.getRocketUserName(key)));

    await openRocketPane(game, 'rocket2');
    await game.page.evaluate(() => {
      const field = document.getElementById('rocket2NameField');
      field.textContent = 'Solo';
      field.dispatchEvent(new InputEvent('input', { bubbles: true }));
    });
    await press(game.page, '#rocket2-rename-btn button', { settleMs: 500 });

    const after = await game.withMods((m) =>
      ['rocket1', 'rocket2', 'rocket3', 'rocket4'].map((key) => m.cg.getRocketUserName(key)));

    expect(after[1]).toBe('Solo');
    expect(after[0]).toBe(before[0]);
    expect(after[2]).toBe(before[2]);
    expect(after[3]).toBe(before[3]);
  });
});

// ============================================================ fuel and launch

test.describe('Rockets — the tanks', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await stockedRun(game);
    await game.debugClick('buildLaunchPadScannerAndAllRocketsButton');
    await game.page.waitForTimeout(1200);
    await surveyAsteroids(game);
  });

  test('each rocket has its own tank, its own pump price and its own power draw', async ({ game }) => {
    const pumps = await game.withMods((m) =>
      ['rocket1', 'rocket2', 'rocket3', 'rocket4'].map((key) => ({
        key,
        capacity: m.rdo.getResourceDataObject('space', ['upgrades', key, 'fuelQuantityToLaunch']),
        price: m.rdo.getResourceDataObject('space', ['upgrades', key, 'autoBuyer', 'tier1', 'price']),
        rate: m.rdo.getResourceDataObject('space', ['upgrades', key, 'autoBuyer', 'tier1', 'rate']),
        energy: m.rdo.getResourceDataObject('space', ['upgrades', key, 'autoBuyer', 'tier1', 'energyUse'])
      })));

    for (const pump of pumps) {
      expect(pump.capacity, `${pump.key} tank`).toBe(TANK_CAPACITY[pump.key]);
      expect(pump.price, `${pump.key} pump price`).toBe(PUMP_PRICE[pump.key]);
      expect(pump.energy, `${pump.key} pump draw`).toBeCloseTo(PUMP_ENERGY[pump.key], 6);
      expect(pump.rate, `${pump.key} pump rate`).toBeCloseTo(0.02, 6);
    }

    // A bigger rocket is a longer wait, not just a bigger bill: same rate, more
    // to fill.
    for (let i = 1; i < pumps.length; i++) {
      expect(pumps[i].capacity).toBeGreaterThan(pumps[i - 1].capacity);
      expect(pumps[i].price).toBeGreaterThan(pumps[i - 1].price);
    }
  });

  test('pressing Fuel starts the pump and the Launch button reports the level', async ({ game }) => {
    await openRocketPane(game, 'rocket1');
    await fuelFor(game, 'rocket1', 20_000);

    const row = await fuelRow(game.page, 'rocket1');

    // 20,000ms of driven time at 0.2 a millisecond is 4,000 of a 10,000 tank.
    // The frame loop keeps pumping in real time either side of the driven span,
    // so the band is wide on purpose: what matters is that the tank is partly
    // full, and that the button and the gauge both report the level the record
    // holds rather than a figure of their own.
    expect(row.level, 'the pump has put fuel in but not filled the tank').toBeGreaterThan(35);
    expect(row.level).toBeLessThan(70);
    expect(row.launchClasses, 'a part-filled rocket cannot be launched')
      .toContain('no-interaction');
    expect(row.launchClasses).not.toContain('green-ready-text');

    // The button and the gauge are painted a frame apart from each other, so
    // each is checked against the level rather than against an exact string.
    const shownPercent = Number(String(row.launchText).replace('%', ''));
    expect(shownPercent, `the button read ${row.launchText} against a level of ${row.level}`)
      .toBeGreaterThan(Math.floor(row.level) - 2);
    expect(shownPercent).toBeLessThan(Math.floor(row.level) + 2);

    const barPercent = Number(String(row.barWidth).replace('%', ''));
    expect(barPercent, `the gauge read ${row.barWidth} against a level of ${row.level}`)
      .toBeGreaterThan(row.level - 5);
    expect(barPercent).toBeLessThan(row.level + 5);
  });

  test('the Fuel button hides itself and the row says it is fuelling', async ({ game }) => {
    await openRocketPane(game, 'rocket1');
    await fuelFor(game, 'rocket1', 5_000);

    const row = await fuelRow(game.page, 'rocket1');
    expect(row.fuelButtonClasses, 'a pump already running cannot be started twice')
      .toContain('invisible');
    expect(row.label).toBe(await say(game, 'textFuelling'));
    expect(row.labelClasses).toContain('green-ready-text');
  });

  test('a full tank turns the Launch button green and says so', async ({ game }) => {
    await openRocketPane(game, 'rocket1');
    await fuelToFull(game, 'rocket1');

    const row = await fuelRow(game.page, 'rocket1');
    expect(row.label).toBe(await say(game, 'textReadyForLaunch'));
    expect(row.labelClasses).toContain('green-ready-text');
    expect(row.launchText).toBe(await say(game, 'buttonLaunch'));
    expect(row.launchClasses).toContain('green-ready-text');
    expect(row.launchClasses).not.toContain('no-interaction');
    expect(row.barWidth).toBe('100%');
  });

  test('the pump is colour-gated on holding its price in cash', async ({ game }) => {
    // The pump's price is a *gate*, not a bill: `setPriceForAllPurchases` reads
    // it to decide whether the button is lit, and the Fuel button's own handler
    // spends nothing. So what is asserted here is the gate — cash on hand at or
    // above the pump's price — which is what the game actually promises.
    await game.debugClick('give100Button');
    await openRocketPane(game, 'rocket1');
    await game.page.waitForTimeout(900);

    const poor = await fuelRow(game.page, 'rocket1');
    expect(poor.fuelButtonClasses, 'a hundred dollars does not run a five-thousand pump')
      .toContain('red-disabled-text');

    await game.debugClick('give1BButton');
    await game.page.waitForTimeout(900);

    const rich = await fuelRow(game.page, 'rocket1');
    expect(rich.fuelButtonClasses, 'and the gate lifts once the money is there')
      .not.toContain('red-disabled-text');
  });

  test('the pump stops when the grid goes down, and says why', async ({ game }) => {
    await openRocketPane(game, 'rocket1');
    await fuelFor(game, 'rocket1', 5_000);

    await game.withMods((m) => {
      m.cg.setInfinitePower(false);
      m.cg.setPowerOnOff(false);
    });
    await game.page.waitForTimeout(900);

    const held = await game.withMods((m) =>
      m.rdo.getResourceDataObject('space', ['upgrades', 'rocket1', 'fuelQuantity']));
    await game.advanceTimers(30_000);
    await game.page.waitForTimeout(700);
    const still = await game.withMods((m) =>
      m.rdo.getResourceDataObject('space', ['upgrades', 'rocket1', 'fuelQuantity']));

    expect(still, 'no power, no fuel').toBe(held);

    const row = await fuelRow(game.page, 'rocket1');
    expect(row.label).toBe(await say(game, 'textRequiresPower'));
    expect(row.launchClasses).toContain('red-disabled-text');
  });

  test('the tank fills to its own capacity and no further', async ({ game }) => {
    await openRocketPane(game, 'rocket2');
    await fuelToFull(game, 'rocket2');

    await game.advanceTimers(100_000);
    await game.page.waitForTimeout(500);

    const state = await game.withMods((m) => ({
      quantity: m.rdo.getResourceDataObject('space', ['upgrades', 'rocket2', 'fuelQuantity']),
      level: m.game.getFuelLevel('rocket2')
    }));

    expect(state.quantity, 'rocket 2 holds twelve thousand, not ten').toBe(TANK_CAPACITY.rocket2);
    expect(state.level).toBe(100);
  });

  test('launching hides the fuel row, records the flight and names the rocket', async ({ game }) => {
    await openRocketPane(game, 'rocket1');

    // Rename first, so the announcement is proved to use the player's name for
    // the rocket rather than the built-in one.
    await game.page.evaluate(() => {
      const field = document.getElementById('rocket1NameField');
      field.textContent = 'Bluebird';
      field.dispatchEvent(new InputEvent('input', { bubbles: true }));
    });
    await press(game.page, '#rocket1-rename-btn button', { settleMs: 500 });

    await openRocketPane(game, 'rocket1');
    await fuelToFull(game, 'rocket1');
    await press(game.page, '.rocket1-launch-button', { settleMs: 800 });

    const launched = await game.withMods((m) => m.cg.getLaunchedRockets());
    expect(launched, 'the launch is on the record').toContain('rocket1');

    const template = await say(game, 'notificationRocketLaunched');
    await expectNotification(game, template.replace('{rocketName}', 'Bluebird'));

    const row = await fuelRow(game.page, 'rocket1');
    expect(row.rowClasses, 'and the pump is put away for the trip').toContain('invisible');
  });

  test('each rocket is fuelled and launched on its own, not as a fleet', async ({ game }) => {
    await openRocketPane(game, 'rocket1');
    await fuelToFull(game, 'rocket1');

    const state = await game.withMods((m) =>
      ['rocket1', 'rocket2', 'rocket3', 'rocket4'].map((key) => ({
        key,
        fuel: m.rdo.getResourceDataObject('space', ['upgrades', key, 'fuelQuantity']),
        ready: m.cg.getRocketsFuellerStartedArray().includes(`${key}FuelledUp`)
      })));

    expect(state[0].fuel).toBe(TANK_CAPACITY.rocket1);
    expect(state[0].ready).toBe(true);
    for (const other of state.slice(1)) {
      expect(other.fuel, `${other.key} has its own tank`).toBe(0);
      expect(other.ready, `${other.key} is not carried along`).toBe(false);
    }
  });
});

// ================================================= destination and the flight

test.describe('Rockets — choosing a rock and flying to it', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await stockedRun(game);
    await game.debugClick('buildLaunchPadScannerAndAllRocketsButton');
    await game.page.waitForTimeout(1200);
    await surveyAsteroids(game);
    await game.withMods((m) => {
      m.cg.setAntimatterUnlocked(true);
      m.rdo.setResourceDataObject(1e12, 'antimatter', ['storageCapacity']);
      m.cg.setMegaStructureAntimatterAmount(0);
      // The Travel row's countdown is a `notation` element, so an abbreviated
      // figure would be compared against a raw one. Plain notation keeps the
      // number legible; `plainNumbers` removes the separators it adds.
      m.cg.setNotationType('normal');
    });
  });

  test('the dropdown offers the surveyed rocks nearest first, with their figures', async ({ game }) => {
    await game.withMods((m) => m.cg.setLaunchedRockets('rocket1', 'add'));
    await openRocketPane(game, 'rocket1');

    const offered = await game.page.evaluate(() =>
      Array.from(document.querySelectorAll('#rocket1TravelDropdown div.dropdown-option')).map((option) => ({
        value: option.getAttribute('data-value'),
        text: option.textContent?.trim(),
        distance: Number(option.querySelector('.dropDownDistanceValue')?.textContent?.trim()),
        rarity: option.querySelector('.dropDownRarityValue')?.textContent?.trim(),
        rarityClasses: Array.from(option.querySelector('.dropDownRarityValue')?.classList ?? []),
        quantity: Number(option.querySelector('.dropDownQuantityValue')?.textContent?.trim())
      })));

    expect(offered.length, 'the survey should have stocked the dropdown').toBeGreaterThan(1);

    for (let i = 1; i < offered.length; i++) {
      expect(offered[i].distance, 'the nearest rock is offered first')
        .toBeGreaterThanOrEqual(offered[i - 1].distance);
    }

    // Every option carries the three figures a player chooses on, taken from the
    // rock's own record rather than made up for the dropdown.
    const records = await game.withMods((m) => Object.fromEntries(
      m.cg.getAsteroidArray().map((entry) => {
        const key = Object.keys(entry)[0];
        return [key, {
          distance: entry[key].distance[0],
          rarity: entry[key].rarity[0],
          quantity: entry[key].quantity[0]
        }];
      })));

    for (const option of offered) {
      const record = records[option.value];
      expect(record, `${option.value} should be a real rock`).toBeTruthy();
      expect(option.distance).toBe(record.distance);
      expect(Math.round(option.quantity)).toBe(Math.round(record.quantity));
      expect(option.rarityClasses.length, 'rarity is coloured, not just written')
        .toBeGreaterThan(0);
    }
  });

  test('choosing a rock records it and puts it on the row', async ({ game }) => {
    await game.withMods((m) => m.cg.setLaunchedRockets('rocket1', 'add'));
    await openRocketPane(game, 'rocket1');

    const chosen = await chooseFirstDestination(game, 'rocket1');
    expect(chosen, 'the dropdown should offer something to choose').toBeTruthy();

    const recorded = await game.withMods((m) => m.cg.getDestinationAsteroid('rocket1'));
    expect(recorded, 'the choice is the rocket’s destination').toBe(chosen);
  });

  test('the flight is timed by the distance, and the row counts it down', async ({ game }) => {
    await game.withMods((m) => m.cg.setLaunchedRockets('rocket1', 'add'));
    await openRocketPane(game, 'rocket1');

    const destination = await chooseFirstDestination(game, 'rocket1');
    await press(game.page, '.rocket1-travel-to-asteroid-button', { settleMs: 600 });

    const expectedDuration = await game.withMods((m, name) => {
      const entry = m.cg.getAsteroidArray().find((a) => a[name]);
      return Math.floor(entry[name].distance[0] / m.cg.getRocketTravelSpeed());
    }, destination);

    const started = await game.withMods((m) => ({
      duration: m.cg.getRocketTravelDuration().rocket1,
      remaining: m.cg.getTimeLeftUntilRocketTravelToAsteroidTimerFinishes('rocket1'),
      travelling: m.cg.getCurrentlyTravellingToAsteroid('rocket1')
    }));

    expect(started.travelling).toBe(true);
    expect(started.duration, 'distance divided by speed, floored').toBe(expectedDuration);

    // Fly a measured slice of the way and read the row rather than the record:
    // the countdown and the bar are what the player actually sees.
    const flown = Math.floor(expectedDuration * 0.4);
    await game.advanceTimers(flown);
    await game.page.waitForTimeout(500);

    const row = await travelRow(game.page, 'rocket1');
    const template = await say(game, 'textTravellingProgress');

    expect(countdownCandidates(template, row.remaining),
      'the row counts the flight down in whole seconds')
      .toContain(plainNumbers(row.label));
    expect(row.labelClasses).toContain('green-ready-text');

    const barPercent = Number(String(row.barWidth).replace('%', ''));
    const remaining = row.remaining;
    const expectedPercent = ((expectedDuration - remaining) / expectedDuration) * 100;
    expect(barPercent, `the bar was at ${row.barWidth}, expected about ${expectedPercent}%`)
      .toBeGreaterThan(expectedPercent - 2);
    expect(barPercent).toBeLessThan(expectedPercent + 2);
  });

  test('arriving names the rock in the row and starts the drill', async ({ game }) => {
    await game.withMods((m) => m.cg.setLaunchedRockets('rocket1', 'add'));
    await openRocketPane(game, 'rocket1');

    const destination = await chooseFirstDestination(game, 'rocket1');
    await press(game.page, '.rocket1-travel-to-asteroid-button', { settleMs: 600 });

    await game.advanceTimers(3_000_000);
    await game.page.waitForTimeout(700);

    const template = await say(game, 'textMiningAntimatterAt');

    // The arrival announcement is checked first: it lives for three seconds, so
    // anything done before looking for it risks outlasting it.
    const arrivalTemplate = await say(game, 'notificationRocketReachedAsteroid');
    const name = await game.withMods((m) => m.cg.getRocketUserName('rocket1'));
    await expectNotification(game, arrivalTemplate
      .replace('{rocketName}', name)
      .replace('{destination}', destination));

    // The row is then read under both notation modes, because the asteroid's
    // name is not a number and must survive whichever one the player has chosen.
    // Names are minted as `<system>-<digits><letter>`, so a formatter that
    // rewrites every digit run inside the label would rewrite the rock's name
    // with it — which is exactly what known-issues #36 was.
    for (const mode of ['normal', 'normalCondensed']) {
      await game.withMods((m, notation) => m.cg.setNotationType(notation), mode);
      await game.page.waitForTimeout(700);

      const row = await travelRow(game.page, 'rocket1');
      expect(row.label, `under ${mode} notation the row switches from a countdown to a job`)
        .toBe(template.replace('{asteroid}', destination));
    }

    await game.withMods((m) => m.cg.setNotationType('normal'));
  });

  test('the return leg reports itself differently from the outbound one', async ({ game }) => {
    // A near-empty rock so the drill finishes it inside one driven window.
    const destination = await game.withMods((m) => {
      const entry = m.cg.getAsteroidArray()[0];
      const name = Object.keys(entry)[0];
      m.cg.changeAsteroidArray(name, 'easeOfExtraction', [1, 'green-ready-text']);
      m.cg.changeAsteroidArray(name, 'quantity', [15, 'green-ready-text']);
      entry[name].originalQuantity = 15;
      m.cg.setDestinationAsteroid('rocket1', name);
      m.cg.setLaunchedRockets('rocket1', 'add');
      m.cg.setMiningObject('rocket1', name);
      return name;
    });
    expect(destination).toBeTruthy();

    await openRocketPane(game, 'rocket1');
    await game.advanceTimers(200_000);
    await game.page.waitForTimeout(600);

    const returning = await game.withMods((m) => m.cg.getRocketDirection('rocket1'));
    expect(returning, 'a spent rock turns the rocket round').toBe(true);

    // Part of the way home, so the label is a countdown rather than an arrival.
    await game.advanceTimers(500);
    await game.page.waitForTimeout(500);

    const row = await travelRow(game.page, 'rocket1');
    const returningTemplate = await say(game, 'textReturningProgress');
    const travellingTemplate = await say(game, 'textTravellingProgress');

    expect(countdownCandidates(returningTemplate, row.remaining),
      'coming home reads differently from going out')
      .toContain(plainNumbers(row.label));
    expect(returningTemplate).not.toBe(travellingTemplate);
  });

  test('landing announces the rocket home and empties its tank', async ({ game }) => {
    await game.withMods((m) => {
      const entry = m.cg.getAsteroidArray()[0];
      const name = Object.keys(entry)[0];
      m.cg.changeAsteroidArray(name, 'easeOfExtraction', [1, 'green-ready-text']);
      m.cg.changeAsteroidArray(name, 'quantity', [15, 'green-ready-text']);
      entry[name].originalQuantity = 15;
      m.cg.setDestinationAsteroid('rocket1', name);
      m.cg.setLaunchedRockets('rocket1', 'add');
      m.cg.setMiningObject('rocket1', name);
      m.rdo.setResourceDataObject(5000, 'space', ['upgrades', 'rocket1', 'fuelQuantity']);
      m.cg.setRocketsFuellerStartedArray('rocket1FuelledUp', 'add');
    });

    await openRocketPane(game, 'rocket1');
    await game.advanceTimers(200_000);
    await game.page.waitForTimeout(500);
    await game.advanceTimers(3_000_000);
    await game.page.waitForTimeout(800);

    const name = await game.withMods((m) => m.cg.getRocketUserName('rocket1'));
    const template = await say(game, 'notificationRocketReturnedToRefuel');
    await expectNotification(game, template.replace('{rocketName}', name));

    const home = await game.withMods((m) => ({
      fuel: m.rdo.getResourceDataObject('space', ['upgrades', 'rocket1', 'fuelQuantity']),
      fueller: [...m.cg.getRocketsFuellerStartedArray()],
      launched: m.cg.getLaunchedRockets().includes('rocket1')
    }));

    expect(home.fuel, 'the tank is drained by the trip').toBe(0);
    expect(home.fueller, 'and the pump forgets the rocket entirely')
      .not.toContain('rocket1FuelledUp');
    expect(home.launched).toBe(false);
  });

  test('a rocket that has come home can be fuelled and flown out a second time', async ({ game }) => {
    // The reset is only worth anything if the next journey works, and nothing
    // else in the suite flies the same rocket twice.
    const firstRock = await game.withMods((m) => {
      const entry = m.cg.getAsteroidArray()[0];
      const name = Object.keys(entry)[0];
      m.cg.changeAsteroidArray(name, 'easeOfExtraction', [1, 'green-ready-text']);
      m.cg.changeAsteroidArray(name, 'quantity', [15, 'green-ready-text']);
      entry[name].originalQuantity = 15;
      m.cg.setDestinationAsteroid('rocket1', name);
      m.cg.setLaunchedRockets('rocket1', 'add');
      m.cg.setMiningObject('rocket1', name);
      return name;
    });

    await openRocketPane(game, 'rocket1');
    await game.advanceTimers(200_000);
    await game.page.waitForTimeout(500);
    await game.advanceTimers(3_000_000);
    await game.page.waitForTimeout(800);

    expect(await game.withMods((m) => m.cg.getRocketReadyToTravel('rocket1'))).toBe(true);

    // Second journey, driven exactly as the first one would be by a player.
    await openRocketPane(game, 'rocket1');
    await fuelToFull(game, 'rocket1');
    await press(game.page, '.rocket1-launch-button', { settleMs: 800 });

    await openRocketPane(game, 'rocket1');
    const secondRock = await chooseFirstDestination(game, 'rocket1');
    expect(secondRock, 'there are other rocks to fly to').toBeTruthy();
    expect(secondRock, 'and the spent one is not offered again').not.toBe(firstRock);

    await press(game.page, '.rocket1-travel-to-asteroid-button', { settleMs: 600 });

    const secondTrip = await game.withMods((m) => ({
      travelling: m.cg.getCurrentlyTravellingToAsteroid('rocket1'),
      duration: m.cg.getRocketTravelDuration().rocket1,
      direction: m.cg.getRocketDirection('rocket1')
    }));
    expect(secondTrip.travelling, 'the second flight starts like the first').toBe(true);
    expect(secondTrip.duration).toBeGreaterThan(0);
    expect(secondTrip.direction, 'and it is pointed outward, not home').toBe(false);

    await game.advanceTimers(3_000_000);
    await game.page.waitForTimeout(700);

    const arrived = await game.withMods((m) => m.cg.getMiningObject().rocket1);
    expect(arrived, 'and it lands on the rock it was sent to the second time too')
      .toBe(secondRock);
  });

  test('two rockets fly their own journeys, with their own timers', async ({ game }) => {
    await game.withMods((m) => {
      m.cg.setLaunchedRockets('rocket1', 'add');
      m.cg.setLaunchedRockets('rocket2', 'add');
    });

    await openRocketPane(game, 'rocket1');
    const firstRock = await chooseFirstDestination(game, 'rocket1');
    await press(game.page, '.rocket1-travel-to-asteroid-button', { settleMs: 500 });

    await openRocketPane(game, 'rocket2');
    const secondRock = await chooseFirstDestination(game, 'rocket2');
    await press(game.page, '.rocket2-travel-to-asteroid-button', { settleMs: 500 });

    expect(secondRock, 'the second rocket is not offered the first one’s rock')
      .not.toBe(firstRock);

    const timers = await game.withMods((m) => ({
      one: m.timers.timerManagerDelta.hasTimer('rocket1TravelToAsteroidTimer'),
      two: m.timers.timerManagerDelta.hasTimer('rocket2TravelToAsteroidTimer'),
      durations: m.cg.getRocketTravelDuration(),
      destinations: {
        one: m.cg.getDestinationAsteroid('rocket1'),
        two: m.cg.getDestinationAsteroid('rocket2')
      }
    }));

    expect(timers.one, 'each journey has a timer of its own').toBe(true);
    expect(timers.two).toBe(true);
    expect(timers.durations.rocket1).toBeGreaterThan(0);
    expect(timers.durations.rocket2).toBeGreaterThan(0);
    expect(timers.destinations.one).toBe(firstRock);
    expect(timers.destinations.two).toBe(secondRock);

    await game.advanceTimers(3_000_000);
    await game.page.waitForTimeout(700);

    const landed = await game.withMods((m) => m.cg.getMiningObject());
    expect(landed.rocket1, 'both arrive at their own rock').toBe(firstRock);
    expect(landed.rocket2).toBe(secondRock);
  });
});
