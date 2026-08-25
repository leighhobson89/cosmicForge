/**
 * Area: Weather — the cycle, the solar penalty, the particles and the sound
 * Plan: tests/docs/areas/weather.md
 *
 * Weather is a background simulation with four visible consequences, and every
 * one of them is measurable:
 *
 * | Consequence | Where it lands |
 * |---|---|
 * | Solar output | `powerPlant2.purchasedRate` is multiplied by the state's efficiency, once per window |
 * | Precipitation | while it rains, the system's own compound accrues at a rolled rate |
 * | Launches | a fuelled rocket will not leave the pad in rain or under a volcano |
 * | Presentation | a particle overlay, an ambience loop, the system stat and a warning |
 *
 * ## How the cycle actually works
 *
 * `changeWeather()` picks a state from the **current star system's own weather
 * table** by weighted draw, writes `[system, efficiency, type]` into
 * `currentStarSystemWeatherEfficiency`, and arms a one-second `setInterval` that
 * counts down a window of one to three minutes. That interval is also what starts
 * the particle effect and rolls the precipitation rate — neither happens at the
 * instant the state is chosen — so every spec below gives the cycle a beat of
 * real time after forcing a state rather than asserting immediately.
 *
 * When the window runs out the interval calls `changeWeather()` again, so the
 * cycle is self-perpetuating and there is no separate scheduler to test.
 *
 * The one exception to the one-to-three minute window is the severe-weather
 * relief window. Rain and volcanoes both ground a fuelled rocket, and a star's
 * table can legitimately be weighted almost entirely towards them, so the cycle
 * counts consecutive severe windows: three may run, and the draw after them is
 * turned into a cloudy window of a fixed one minute. That streak is per star
 * system and is saved state — see the block of specs under "the severe-weather
 * streak".
 *
 * ## Forcing a state without faking one
 *
 * The draw is weighted by the numbers in the star's table, so a state is forced
 * the way the game itself would land on it: rewrite that star's *probabilities*
 * so only the state under test can be drawn, then run the game's own
 * `forceWeatherCycle()`. The efficiencies, symbols and colour classes are left
 * exactly as the star published them — those are the contract being tested, and
 * a spec that wrote them would be asserting its own input.
 *
 * The efficiencies every generated star carries, from
 * `generateStarDataAndAddToDataObject`:
 *
 *   sunny    ☀  1.0
 *   cloudy   ☁  0.6
 *   rain     ☂  0.4
 *   volcano  ⛰  0.05
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** The four states every star publishes, and the efficiency each one carries. */
const WEATHER_EFFICIENCY = {
  sunny: 1,
  cloudy: 0.6,
  rain: 0.4,
  volcano: 0.05
};

/** The two states that run a particle overlay and an ambience loop. */
const SEVERE_STATES = ['rain', 'volcano'];

/** The solar plant's per-unit rate, from resourceDataObject. */
const SOLAR_RATE_PER_UNIT = 0.2;

// Several cases buy a row of power plants and then run four weather windows
// through them.
test.describe.configure({ timeout: 240_000 });

// ---------------------------------------------------------------------- helpers

/** Open a side-menu row by id, the way a player clicks it. */
async function openOptionById(game, optionId) {
  const found = await game.page.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el) return false;
    el.classList.remove('invisible');
    el.closest('.row-side-menu')?.classList.remove('invisible');
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, optionId);
  await game.page.waitForTimeout(600);
  return found;
}

/**
 * Copy the run's save code out of the real Saving / Loading pane.
 *
 * The export box is not filled by opening the pane: `gameLoop` notices the pane
 * is open and calls `saveGame('onSaveScreen')` once, and that is what writes the
 * value - so the wait is on the value appearing, not on the pane rendering.
 */
async function exportSaveCode(game) {
  await game.openTab(9);
  const opened = await game.page.evaluate(() => {
    const row = document.querySelector('p.inset-paragraph[class~="tab9.option2"]');
    if (!row) return false;
    row.closest('.row-side-menu')?.classList.remove('invisible');
    row.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  });
  if (!opened) throw new Error('No Saving / Loading row in the tab 9 side menu');

  await game.page.waitForFunction(
    () => {
      const area = document.getElementById('exportSaveArea');
      return !!area && typeof area.value === 'string' && area.value.length > 50;
    },
    null,
    { timeout: 30000 }
  );

  return game.page.evaluate(() => document.getElementById('exportSaveArea')?.value ?? '');
}

/** Paste a save code into the import box and press the pane's real Import button. */
async function importSaveCode(game, code) {
  await game.openTab(9);
  await game.page.evaluate(() => {
    const row = document.querySelector('p.inset-paragraph[class~="tab9.option2"]');
    row?.closest('.row-side-menu')?.classList.remove('invisible');
    row?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await game.page.waitForSelector('#importSaveArea', { timeout: 30000 });
  await game.page.evaluate((c) => {
    const area = document.getElementById('importSaveArea');
    if (area) area.value = c;
  }, code);
  await game.page.click('#importSaveRow button.save-load-button');
}

/**
 * Weight the current system's own weather table so only `type` can be drawn.
 *
 * Only the probabilities are touched. The efficiency, the symbol and the colour
 * class stay exactly as the star published them, because those are what the
 * specs are checking — a spec that wrote them would be asserting its own input.
 */
async function weightTableTo(game, type) {
  await game.withMods((m, weatherType) => {
    const system = m.cg.getCurrentStarSystem();
    const table = m.rdo.getStarSystemWeather(system);
    const rewritten = {};
    for (const [key, entry] of Object.entries(table)) {
      rewritten[key] = [key === weatherType ? 100 : 0, entry[1], entry[2], entry[3]];
    }
    m.rdo.setStarSystemWeather(system, rewritten);
  }, type);
}

/**
 * Let one weather window run out so the game re-rolls the next one itself.
 *
 * `setWeatherCycleSecondsRemaining` is the game's own hook — Endless Summer uses
 * it to cut the running window short — so seeding a one-second remainder and
 * waiting is the weather cycle turning over for real, rather than a spec
 * reaching in and calling the draw. That distinction matters here: the relief
 * window is only ever granted against weather the cycle drew for itself.
 *
 * The wait is on the *new* window being armed. A full window is one to three
 * minutes and the relief window is a fixed one minute, so anything at 60 seconds
 * or more means the countdown expired and `changeWeather()` has already run.
 */
async function runOneWeatherWindow(game) {
  await game.withMods((m) => m.game.setWeatherCycleSecondsRemaining(1));
  await game.page.waitForFunction(
    () => globalThis.__mods.game.getCurrentWeatherWindowSeconds() >= 60,
    null,
    { timeout: 20000 }
  );
  // The one-second interval is what starts the particles and rolls the
  // precipitation rate, so give the new window a beat of real time to turn.
  await game.page.waitForTimeout(1200);

  return game.withMods((m) => {
    const live = m.cg.getCurrentStarSystemWeatherEfficiency();
    return {
      type: live?.[2],
      efficiency: live?.[1],
      windowSeconds: m.game.getCurrentWeatherWindowSeconds(),
      streak: m.cg.getConsecutiveSevereWeatherPeriods(),
      streakSystem: m.cg.getConsecutiveSevereWeatherSystem()
    };
  });
}

/**
 * Put the run on a clean footing: one fair-weather window, so whatever the boot
 * happened to roll is not still counted against the severe-weather streak.
 */
async function settleOnFairWeather(game) {
  await weightTableTo(game, 'sunny');
  const settled = await runOneWeatherWindow(game);
  expect(settled.type, 'the run should be starting from fair weather').toBe('sunny');
  expect(settled.streak, 'with no severe-weather streak standing').toBe(0);
}

/**
 * Land the current system on a named weather state through the game's own draw.
 *
 * Only the probabilities are rewritten — the efficiency, the symbol and the
 * colour class stay exactly as the star published them, because those are what
 * the specs below are checking.
 */
async function forceWeather(game, type) {
  await weightTableTo(game, type);

  await game.withMods((m) => m.game.forceWeatherCycle());
  // The one-second interval is what starts the particles and rolls the
  // precipitation rate, so give the cycle a beat of real time to turn.
  await game.page.waitForTimeout(1500);
}

/**
 * The Fuel row's status label on a rocket's pane.
 *
 * Addressed through the row rather than by a short id. `createOptionRow` derives
 * the label's id from the row id, and gives the row's flavour container the very
 * same name — so `getElementById` returns the wrong element even when the id
 * looks right. The row id is the only unambiguous handle.
 */
async function fuelRowStatus(page, rocket = 'rocket1') {
  return page.evaluate((rocketKey) => {
    const rowId = `space${rocketKey.charAt(0).toUpperCase()}${rocketKey.slice(1)}AutoBuyerRow`;
    const label = document.querySelector(`#${rowId} .description-container .notation`);
    const launch = document.querySelector(`.${rocketKey}-launch-button`);
    return {
      present: Boolean(label),
      text: label?.textContent?.trim(),
      classes: Array.from(label?.classList ?? []),
      launchClasses: Array.from(launch?.classList ?? [])
    };
  }, rocket);
}

/**
 * Fuel a rocket to full through its own **Fuel Rocket** button.
 *
 * Pushing `<rocket>FuelledUp` into the fueller array by hand is not equivalent:
 * `fuelRockets()` runs every frame over the rockets that are *not* yet marked
 * fuelled, and if the tank is still empty it puts the Launch button back into its
 * "NN% loaded" state — `no-interaction`, neither red nor green — which masks the
 * bad-weather gate this file is here to check. Filling the tank for real leaves
 * the run in the state a player would be in.
 *
 * The fuel autobuyer adds `rate x 100` per 10ms of driven time, so 10,000 units
 * at 0.02 needs 50,000ms; 100,000 is comfortably past full.
 */
async function fuelRocketReadyForLaunch(game, rocket = 'rocket1') {
  await game.openTab(6);
  await openOptionById(game, rocket);

  const pressed = await game.page.evaluate((key) => {
    const button = document.querySelector(`button.${key}`);
    if (!button) return false;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, rocket);
  if (!pressed) throw new Error(`No Fuel button on the ${rocket} pane`);

  await game.page.waitForTimeout(300);
  await game.advanceTimers(100_000);
  await game.page.waitForTimeout(900);

  const fuelled = await game.withMods((m, key) => ({
    quantity: m.rdo.getResourceDataObject('space', ['upgrades', key, 'fuelQuantity']),
    capacity: m.rdo.getResourceDataObject('space', ['upgrades', key, 'fuelQuantityToLaunch']),
    markedFuelled: m.cg.getRocketsFuellerStartedArray().includes(`${key}FuelledUp`)
  }), rocket);

  expect(fuelled.quantity, `${rocket} should have filled its tank`).toBe(fuelled.capacity);
  expect(fuelled.markedFuelled, `${rocket} should be marked ready for launch`).toBe(true);
}

/** Everything the weather system currently reports, in one round trip. */
async function weatherState(game) {
  return game.withMods((m) => {
    const live = m.cg.getCurrentStarSystemWeatherEfficiency();
    return {
      raw: live,
      system: live?.[0],
      efficiency: live?.[1],
      type: live?.[2],
      effectOn: m.cg.getWeatherEffectOn(),
      effectSetting: m.cg.getWeatherEffectSetting(),
      efficiencyApplied: m.cg.getWeatherEfficiencyApplied(),
      precipitationRate: m.cg.getCurrentPrecipitationRate()
    };
  });
}

/** What the weather overlay is currently drawing. */
async function overlayState(page) {
  return page.evaluate(() => {
    const overlay = document.getElementById('weatherEffectOverlay');
    return {
      present: Boolean(overlay),
      display: overlay?.style.display,
      raindrops: overlay ? overlay.querySelectorAll('.raindrop').length : 0,
      lavadrops: overlay ? overlay.querySelectorAll('.lavadrop').length : 0
    };
  });
}

/**
 * Reach a run with every tech granted, cash in the bank and the grid available.
 *
 * `prepareRunForStarshipLaunch` is the game's own chain and grants
 * `solarPowerGeneration`, which is what reveals the solar plant at all.
 */
async function prepareWeatherRun(game) {
  await game.prepareRunForStarshipLaunch();
  await game.page.waitForTimeout(800);
  await game.withMods((m) => {
    m.rdo.setResourceDataObject(1e12, 'currency', ['cash']);
    m.cg.setInfinitePower(false);
    m.cg.setPowerOnOff(true);
  });
}

/**
 * Buy `count` solar plants through the plant's own purchase button, and leave it
 * the only generator running.
 *
 * The other two plants are switched off so that `buildings.energy.rate` — which
 * the energy tick sets to pure generation — is the solar plant's output and
 * nothing else.
 */
async function buySolarPlants(game, count = 10) {
  await game.withMods((m) => {
    m.rdo.setResourceDataObject(1e12, 'currency', ['cash']);
    for (const [category, materials] of Object.entries({
      resources: ['carbon', 'iron', 'silicon', 'hydrogen', 'helium'],
      compounds: ['glass', 'steel', 'diesel']
    })) {
      for (const material of materials) {
        m.rdo.setResourceDataObject(1e9, category, [material, 'storageCapacity']);
        m.rdo.setResourceDataObject(1e9, category, [material, 'quantity']);
      }
    }
    m.rdo.setResourceDataObject(true, 'buildings', ['energy', 'upgrades', 'powerPlant2', 'revealed']);
  });

  await game.openTab(2);
  await openOptionById(game, 'powerPlant2Option');

  for (let i = 0; i < count; i++) {
    const bought = await game.page.evaluate(() => {
      const button = [...document.querySelectorAll('button.building-purchase-button')]
        .find((b) => b.offsetParent !== null);
      if (!button) return false;
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    });
    if (!bought) throw new Error('No solar plant purchase button on screen');
    await game.page.waitForTimeout(150);
  }

  await game.withMods((m) => {
    m.game.toggleBuildingTypeOnOff('powerPlant1', false);
    m.game.toggleBuildingTypeOnOff('powerPlant3', false);
    m.game.toggleBuildingTypeOnOff('powerPlant2', true);
    m.cg.setPowerOnOff(true);
  });
  await game.page.waitForTimeout(600);

  return game.withMods((m) =>
    m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'quantity']));
}

/** The grid's generation rate, once the energy tick has run at least once. */
async function solarGeneration(game) {
  await game.advanceTimers(200);
  await game.page.waitForTimeout(400);
  return game.withMods((m) => ({
    rate: m.rdo.getResourceDataObject('buildings', ['energy', 'rate']),
    purchasedRate: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'purchasedRate']),
    quantity: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'quantity']),
    oTypeMultiplier: m.game.getOTypePowerPlantBoostMultiplierForCurrentSystem('powerPlant2'),
    powerOn: m.cg.getPowerOnOff()
  }));
}

// =========================================================== the cycle itself

test.describe('Weather — the cycle', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareWeatherRun(game);
  });

  test('a run always has a live weather state drawn from its own system', async ({ game }) => {
    const state = await weatherState(game);
    const system = await game.withMods((m) => m.cg.getCurrentStarSystem());

    expect(Array.isArray(state.raw), 'weather is held as [system, efficiency, type]').toBe(true);
    expect(state.raw.length).toBe(3);
    expect(state.system, 'and it is tagged with the system it belongs to').toBe(system);
    expect(Object.keys(WEATHER_EFFICIENCY)).toContain(state.type);
  });

  test('each state carries the efficiency its own star publishes', async ({ game }) => {
    for (const type of Object.keys(WEATHER_EFFICIENCY)) {
      await forceWeather(game, type);
      const state = await weatherState(game);
      const published = await game.withMods((m, weatherType) =>
        m.rdo.getStarSystemWeather(m.cg.getCurrentStarSystem())[weatherType][2], type);

      expect(state.type, `the draw should land on ${type}`).toBe(type);
      expect(state.efficiency, `${type} efficiency`).toBe(published);
      expect(published, `${type} should publish the documented efficiency`)
        .toBe(WEATHER_EFFICIENCY[type]);
    }
  });

  test('a window that runs out rolls the next state by itself', async ({ game }) => {
    await forceWeather(game, 'volcano');
    expect((await weatherState(game)).type).toBe('volcano');

    // Make every state but sunny impossible, then cut the window short and let
    // the game's own countdown expire.
    await game.withMods((m) => {
      const system = m.cg.getCurrentStarSystem();
      const table = m.rdo.getStarSystemWeather(system);
      const rewritten = {};
      for (const [key, entry] of Object.entries(table)) {
        rewritten[key] = [key === 'sunny' ? 100 : 0, entry[1], entry[2], entry[3]];
      }
      m.rdo.setStarSystemWeather(system, rewritten);
      m.game.setWeatherCycleSecondsRemaining(2);
    });

    await game.page.waitForTimeout(5000);

    const after = await weatherState(game);
    expect(after.type, 'the countdown re-rolled the weather without being asked').toBe('sunny');
    expect(after.effectOn, 'and cleared the effect the old state was running').toBe(false);
  });

  // ------------------------------------------------ the severe-weather streak
  //
  // A climate weighted heavily towards rain and volcanoes could otherwise ground
  // a fuelled rocket indefinitely, so the cycle counts how many severe windows
  // have run back to back. Three are allowed; the draw straight after them is
  // never severe again. It is turned into a cloudy window of a fixed one minute
  // - long enough to launch, short enough that the climate is not neutered - and
  // the streak restarts from there.
  //
  // The counter belongs to the star system it was accrued in, and is a piece of
  // saved state: moving away from the keyboard or reloading a save must not hand
  // the player a fresh three windows of grace, nor throw away the ones already
  // served.

  test('three severe windows may run back to back, and the fourth is a fixed one-minute cloudy launch window', async ({ game }) => {
    await settleOnFairWeather(game);
    await weightTableTo(game, 'rain');

    // Five windows: three severe, the relief window, and the one after it that
    // shows severe weather is allowed straight back once the streak has reset.
    const windows = [];
    for (let i = 0; i < 5; i++) {
      windows.push(await runOneWeatherWindow(game));
    }

    expect(
      windows.slice(0, 3).map((w) => w.type),
      'three severe windows in a row are allowed to run'
    ).toEqual(['rain', 'rain', 'rain']);
    expect(
      windows.slice(0, 3).map((w) => w.streak),
      'and each one is counted'
    ).toEqual([1, 2, 3]);

    for (const window of windows.slice(0, 3)) {
      expect(
        [60, 120, 180],
        'an ordinary window is still the usual one-to-three minute draw'
      ).toContain(window.windowSeconds);
    }

    expect(windows[3].type, 'the fourth severe draw is granted as a launch window instead')
      .toBe('cloudy');
    expect(windows[3].efficiency, 'carrying the efficiency the star publishes for cloudy')
      .toBe(WEATHER_EFFICIENCY.cloudy);
    expect(windows[3].windowSeconds, 'and lasting a fixed minute, not a one-to-three minute draw')
      .toBe(60);
    expect(windows[3].streak, 'the streak restarts once the launch window has been granted')
      .toBe(0);

    expect(windows[4].type, 'after which severe weather is free to run again').toBe('rain');
    expect(windows[4].streak, 'counting from one').toBe(1);
  });

  test('the severe-weather streak is not thrown away when the player clicks away and back', async ({ game }) => {
    await settleOnFairWeather(game);
    await weightTableTo(game, 'rain');

    for (let i = 0; i < 3; i++) {
      await runOneWeatherWindow(game);
    }
    expect(await game.withMods((m) => m.cg.getConsecutiveSevereWeatherPeriods()))
      .toBe(3);

    // Click away and come back. A headless browser never gives a page real
    // window focus - `page.bringToFront()` leaves the game's handlers untouched,
    // which was checked - so the round trip is driven by firing the very events
    // the browser would deliver, at the very targets the game listens on:
    // `blur` and `visibilitychange` on the way out, `visibilitychange` and
    // `focus` on the way back. The assertion below is what keeps that honest: it
    // fails if the game's own focus handler did not actually run.
    const focusBefore = await game.withMods((m) => m.cg.getLastFocusOfflineGainsAppliedAt());

    await game.page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
      window.dispatchEvent(new Event('blur'));
    });
    await game.page.waitForTimeout(1500);
    await game.page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
      document.dispatchEvent(new Event('visibilitychange'));
      window.dispatchEvent(new Event('focus'));
    });
    await game.page.waitForTimeout(1500);

    const focusAfter = await game.withMods((m) => m.cg.getLastFocusOfflineGainsAppliedAt());
    expect(focusAfter, 'the game should have run its focus handler on the way back')
      .toBeGreaterThan(focusBefore);

    const streak = await game.withMods((m) => ({
      periods: m.cg.getConsecutiveSevereWeatherPeriods(),
      system: m.cg.getConsecutiveSevereWeatherSystem(),
      currentSystem: m.cg.getCurrentStarSystem()
    }));
    expect(streak.periods, 'the three windows already served still count').toBe(3);
    expect(streak.system, 'and are still attributed to the system they ran in')
      .toBe(streak.currentSystem);

    // The proof that matters is not the number but what it does next.
    const relief = await runOneWeatherWindow(game);
    expect(relief.type, 'so the very next severe draw is still the promised launch window')
      .toBe('cloudy');
    expect(relief.windowSeconds, 'of the promised fixed minute').toBe(60);
  });

  test('the severe-weather streak comes back with a saved game', async ({ game }) => {
    await settleOnFairWeather(game);
    await weightTableTo(game, 'rain');

    for (let i = 0; i < 3; i++) {
      await runOneWeatherWindow(game);
    }
    expect(await game.withMods((m) => m.cg.getConsecutiveSevereWeatherPeriods()))
      .toBe(3);

    // Take the save the way a player does - the Saving / Loading pane's export
    // box, which the frame loop fills by calling saveGame('onSaveScreen').
    const code = await exportSaveCode(game);
    expect(code.length, 'the export box should hold a real save code').toBeGreaterThan(50);

    // Boot a completely different run over the top. Loading into the same
    // session would pass even if the streak were never saved at all. The fresh
    // run rolls its own weather while it boots, so settle it on fair weather
    // first - that is the run's streak genuinely standing at zero, not a spec
    // assuming a boot never draws rain.
    await game.boot();
    await settleOnFairWeather(game);

    await importSaveCode(game, code);
    await game.page.waitForFunction(
      () => globalThis.__mods.cg.getConsecutiveSevereWeatherPeriods() === 3,
      null,
      { timeout: 20000 }
    );

    const restored = await game.withMods((m) => ({
      periods: m.cg.getConsecutiveSevereWeatherPeriods(),
      system: m.cg.getConsecutiveSevereWeatherSystem(),
      currentSystem: m.cg.getCurrentStarSystem()
    }));
    expect(restored.periods, 'the loaded run carries on from three windows served').toBe(3);
    expect(restored.system, 'in the system they were served in').toBe(restored.currentSystem);

    const relief = await runOneWeatherWindow(game);
    expect(relief.type, 'so the next severe draw is the launch window the save was owed')
      .toBe('cloudy');
    expect(relief.windowSeconds, 'of the promised fixed minute').toBe(60);
  });

  test('the debug menu’s Clear Weather button puts the system back to full sun', async ({ game }) => {
    await forceWeather(game, 'rain');
    expect((await weatherState(game)).type).toBe('rain');

    await game.debugClick('clearWeatherButton');
    await game.page.waitForTimeout(600);

    const state = await weatherState(game);
    expect(state.type, 'clearing the weather forces sunny').toBe('sunny');
    expect(state.efficiency, 'which is full solar output').toBe(1);
    expect(state.precipitationRate, 'and nothing falling').toBe(0);
    expect(state.effectOn, 'with no particles running').toBe(false);
  });

  test('Endless Summer pins the system to sunny however the table is weighted', async ({ game }) => {
    // Weight the table so a fair draw could only ever produce a volcano.
    await game.withMods((m) => {
      const system = m.cg.getCurrentStarSystem();
      const table = m.rdo.getStarSystemWeather(system);
      const rewritten = {};
      for (const [key, entry] of Object.entries(table)) {
        rewritten[key] = [key === 'volcano' ? 100 : 0, entry[1], entry[2], entry[3]];
      }
      m.rdo.setStarSystemWeather(system, rewritten);
    });

    await game.debugSelect('debugRandomEventSelect', 'endlessSummer');
    await game.debugClick('triggerRandomEventButton');
    await game.page.waitForTimeout(600);

    const active = await game.withMods((m) => m.events.isTimedEffectActive('endlessSummer'));
    expect(active, 'the event should be running').toBe(true);

    // The event shortens the current window to ten seconds; force the re-roll now
    // rather than waiting it out.
    await game.withMods((m) => m.game.forceWeatherCycle());
    await game.page.waitForTimeout(1200);

    const state = await weatherState(game);
    expect(state.type, 'Endless Summer overrides the draw entirely').toBe('sunny');
    expect(state.efficiency).toBe(1);
  });

  test('the system stat shows the solar output and the state’s own symbol', async ({ game }) => {
    for (const type of Object.keys(WEATHER_EFFICIENCY)) {
      await forceWeather(game, type);

      const published = await game.withMods((m, weatherType) => {
        const entry = m.rdo.getStarSystemWeather(m.cg.getCurrentStarSystem())[weatherType];
        return { symbol: entry[1], efficiency: entry[2] };
      }, type);

      const stat = await game.page.evaluate(() => {
        const el = document.getElementById('stat7');
        return {
          text: el?.textContent?.trim(),
          classes: Array.from(el?.classList ?? [])
        };
      });

      expect(stat.text, `${type} stat readout`)
        .toBe(`${Math.floor(published.efficiency * 100)}% ${published.symbol}`);

      const expectedClass = type === 'sunny' ? 'green-ready-text'
        : type === 'volcano' ? 'red-disabled-text' : 'warning-orange-text';
      expect(stat.classes, `${type} stat colour`).toContain(expectedClass);
    }
  });

  test('the system label beside the stat names the system the weather belongs to', async ({ game }) => {
    await forceWeather(game, 'sunny');

    const label = await game.page.evaluate(() =>
      document.getElementById('stat7')?.previousElementSibling?.textContent?.trim());
    const system = await game.withMods((m) => m.cg.getCurrentStarSystem());

    expect(label?.toLowerCase(), 'the stat is labelled with the current system')
      .toBe(`${system.toLowerCase()}:`);
  });
});

// ====================================================== solar power generation

test.describe('Weather — what it does to solar power', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareWeatherRun(game);
  });

  test('each state scales the solar plant’s output by its own efficiency', async ({ game }) => {
    const plants = await buySolarPlants(game, 10);
    expect(plants, 'ten presses of the purchase button should buy ten plants').toBe(10);

    const measured = {};
    for (const type of Object.keys(WEATHER_EFFICIENCY)) {
      await forceWeather(game, type);
      const reading = await solarGeneration(game);
      expect(reading.powerOn, `the grid should still be up in ${type}`).toBe(true);
      measured[type] = reading;

      const expectedRate = plants * SOLAR_RATE_PER_UNIT
        * WEATHER_EFFICIENCY[type] * reading.oTypeMultiplier;
      expect(reading.rate, `${type} generation`).toBeCloseTo(expectedRate, 6);
    }

    // And the relationship between them is the one the star publishes.
    expect(measured.cloudy.rate / measured.sunny.rate).toBeCloseTo(0.6, 6);
    expect(measured.rain.rate / measured.sunny.rate).toBeCloseTo(0.4, 6);
    expect(measured.volcano.rate / measured.sunny.rate).toBeCloseTo(0.05, 6);
  });

  test('the efficiency is applied once per window, not compounded every frame', async ({ game }) => {
    await buySolarPlants(game, 10);
    await forceWeather(game, 'rain');

    const first = await solarGeneration(game);
    expect(first.rate).toBeGreaterThan(0);
    expect(await game.withMods((m) => m.cg.getWeatherEfficiencyApplied()),
      'the tick marks the penalty as spent').toBe(true);

    // Many more frames in the same window must not shave the rate again.
    await game.advanceTimers(60_000);
    await game.page.waitForTimeout(1200);

    const later = await solarGeneration(game);
    expect(later.rate, 'a rainy minute costs the same as a rainy tick')
      .toBeCloseTo(first.rate, 8);
  });

  test('only the solar plant is affected — the carbon plant burns on regardless', async ({ game }) => {
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(1e9, 'resources', ['carbon', 'storageCapacity']);
      m.rdo.setResourceDataObject(1e9, 'resources', ['carbon', 'quantity']);
      m.rdo.setResourceDataObject(10, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
      m.game.addBuildingPotentialRate('powerPlant1');
      m.game.toggleBuildingTypeOnOff('powerPlant1', true);
      m.game.toggleBuildingTypeOnOff('powerPlant2', false);
      m.game.toggleBuildingTypeOnOff('powerPlant3', false);
      m.cg.setPowerOnOff(true);
    });

    await forceWeather(game, 'sunny');
    const sunny = await solarGeneration(game);

    await forceWeather(game, 'volcano');
    const volcano = await solarGeneration(game);

    expect(sunny.rate, 'the carbon plant is producing').toBeGreaterThan(0);
    expect(volcano.rate, 'and a volcano does not touch it').toBeCloseTo(sunny.rate, 8);
  });

  test('the solar row reports the efficiency as a percentage and the state’s symbol', async ({ game }) => {
    await buySolarPlants(game, 5);

    for (const type of Object.keys(WEATHER_EFFICIENCY)) {
      await forceWeather(game, type);
      await game.openTab(2);
      await openOptionById(game, 'powerPlant2Option');
      await game.page.waitForTimeout(900);

      const published = await game.withMods((m, weatherType) => {
        const entry = m.rdo.getStarSystemWeather(m.cg.getCurrentStarSystem())[weatherType];
        return { symbol: entry[1], efficiency: entry[2] };
      }, type);

      const row = await game.page.evaluate(() => {
        const quantity = document.getElementById('powerPlant2FuelQuantity');
        const fuelType = document.getElementById('powerPlant2FuelType');
        return {
          quantityText: quantity?.textContent?.trim(),
          quantityClasses: Array.from(quantity?.classList ?? []),
          typeClasses: Array.from(fuelType?.classList ?? [])
        };
      });

      expect(row.quantityText, `${type} solar row readout`)
        .toBe(`${Math.floor(published.efficiency * 100)}% ${published.symbol}`);

      const expectedClass = type === 'sunny' ? 'green-ready-text'
        : type === 'volcano' ? 'red-disabled-text' : 'warning-orange-text';
      expect(row.quantityClasses, `${type} solar figure colour`).toContain(expectedClass);
      expect(row.typeClasses, `${type} solar label colour`).toContain(expectedClass);
    }
  });

  test('buying more solar plants during bad weather does not escape the penalty', async ({ game }) => {
    await buySolarPlants(game, 5);
    await forceWeather(game, 'rain');
    const before = await solarGeneration(game);

    // Buy five more without waiting for the window to turn over.
    await game.openTab(2);
    await openOptionById(game, 'powerPlant2Option');
    for (let i = 0; i < 5; i++) {
      await game.page.evaluate(() => {
        [...document.querySelectorAll('button.building-purchase-button')]
          .find((b) => b.offsetParent !== null)
          ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      await game.page.waitForTimeout(150);
    }

    const after = await solarGeneration(game);
    expect(after.quantity, 'the plants were bought').toBe(before.quantity + 5);
    expect(after.rate, 'and the new ones are rained on like the old ones')
      .toBeCloseTo(after.quantity * SOLAR_RATE_PER_UNIT * WEATHER_EFFICIENCY.rain * after.oTypeMultiplier, 6);
  });
});

// ================================================================== rain

test.describe('Weather — rain', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareWeatherRun(game);
  });

  test('rain runs the raindrop overlay and nothing else', async ({ game }) => {
    await forceWeather(game, 'rain');
    // The particle interval emits a drop every 20ms, so a moment of real time is
    // all it takes to be sure it is running.
    await game.page.waitForTimeout(600);

    const overlay = await overlayState(game.page);
    const state = await weatherState(game);

    expect(state.effectOn, 'the effect is flagged as running').toBe(true);
    expect(overlay.display, 'the overlay is shown').toBe('block');
    expect(overlay.raindrops, 'and it is raining').toBeGreaterThan(0);
    expect(overlay.lavadrops, 'with no lava in it').toBe(0);
  });

  test('rain plays the rain ambience and nothing else', async ({ game }) => {
    await game.withMods((m) => m.cg.setBackgroundAudio(true));
    await forceWeather(game, 'rain');
    await game.withMods((m) => m.audio.weatherAmbienceManager.update());
    await game.page.waitForTimeout(400);

    const tracks = await game.withMods((m) => {
      const manager = m.audio.weatherAmbienceManager;
      return Object.entries(manager.tracks).map(([key, audio]) => ({ key, paused: audio.paused }));
    });

    const rain = tracks.find((t) => t.key === 'rain');
    expect(rain, 'a rain track is loaded').toBeTruthy();
    expect(rain.paused, 'and it is playing').toBe(false);
    for (const track of tracks) {
      if (track.key === 'rain') continue;
      expect(track.paused, `${track.key} should be paused while it rains`).toBe(true);
    }
  });

  test('rain accrues the system’s own precipitation compound', async ({ game }) => {
    // The compound that falls is a property of the star system, never a fixed
    // material, so it is read rather than assumed.
    const precipitation = await game.withMods((m) => {
      const system = m.cg.getCurrentStarSystem();
      return {
        type: m.rdo.getStarSystemDataObject('stars', [system, 'precipitationType']),
        category: m.rdo.getStarSystemDataObject('stars', [system, 'precipitationResourceCategory'])
      };
    });

    await game.withMods((m, target) => {
      m.rdo.setResourceDataObject(1e9, target.category, [target.type, 'storageCapacity']);
      m.rdo.setResourceDataObject(0, target.category, [target.type, 'quantity']);
    }, precipitation);

    await forceWeather(game, 'rain');

    const rate = (await weatherState(game)).precipitationRate;
    expect(rate, 'the shower rolls a rate for itself').toBeGreaterThan(0);
    // (1..4) divided by the 100-tick ratio.
    expect(rate).toBeGreaterThanOrEqual(0.01);
    expect(rate).toBeLessThanOrEqual(0.04);

    const before = await game.withMods((m, target) =>
      m.rdo.getResourceDataObject(target.category, [target.type, 'quantity']), precipitation);
    await game.page.waitForTimeout(2500);
    const after = await game.withMods((m, target) =>
      m.rdo.getResourceDataObject(target.category, [target.type, 'quantity']), precipitation);

    expect(after, `${precipitation.type} should be collecting while it rains`)
      .toBeGreaterThan(before);
  });

  test('nothing precipitates when the sky is clear', async ({ game }) => {
    const precipitation = await game.withMods((m) => {
      const system = m.cg.getCurrentStarSystem();
      return {
        type: m.rdo.getStarSystemDataObject('stars', [system, 'precipitationType']),
        category: m.rdo.getStarSystemDataObject('stars', [system, 'precipitationResourceCategory'])
      };
    });

    await forceWeather(game, 'sunny');
    await game.withMods((m, target) => {
      m.rdo.setResourceDataObject(1e9, target.category, [target.type, 'storageCapacity']);
      m.rdo.setResourceDataObject(0, target.category, [target.type, 'quantity']);
    }, precipitation);

    expect((await weatherState(game)).precipitationRate, 'a clear sky has no rate').toBe(0);

    await game.page.waitForTimeout(2500);
    const after = await game.withMods((m, target) =>
      m.rdo.getResourceDataObject(target.category, [target.type, 'quantity']), precipitation);
    expect(after, 'and drops nothing').toBe(0);
  });

  test('rain grounds a fuelled rocket and says why', async ({ game }) => {
    await fuelRocketReadyForLaunch(game);

    await forceWeather(game, 'rain');
    await game.openTab(6);
    await openOptionById(game, 'rocket1');
    await game.page.waitForTimeout(900);

    const pad = await fuelRowStatus(game.page);
    const badWeather = await game.withMods((m) => m.loc.localize('textBadWeather', m.cg.getLanguage()));

    expect(pad.present, 'the Fuel row should have a status label').toBe(true);
    expect(pad.text, 'the pad explains the hold').toBe(badWeather);
    expect(pad.classes).toContain('red-disabled-text');
    expect(pad.launchClasses, 'and the Launch button is gated by its colour class')
      .toContain('red-disabled-text');
    expect(pad.launchClasses).not.toContain('green-ready-text');
  });

  test('the same rocket is cleared for launch the moment the sky clears', async ({ game }) => {
    await fuelRocketReadyForLaunch(game);

    await forceWeather(game, 'rain');
    await game.openTab(6);
    await openOptionById(game, 'rocket1');
    await game.page.waitForTimeout(700);

    await forceWeather(game, 'sunny');
    await openOptionById(game, 'rocket1');
    await game.page.waitForTimeout(900);

    const pad = await fuelRowStatus(game.page);
    const ready = await game.withMods((m) => m.loc.localize('textReadyForLaunch', m.cg.getLanguage()));

    expect(pad.text, 'the pad reports the rocket ready').toBe(ready);
    expect(pad.launchClasses, 'and the gate is open').toContain('green-ready-text');
    expect(pad.launchClasses).not.toContain('red-disabled-text');
  });

  test('a shower announces itself', async ({ game }) => {
    await forceWeather(game, 'sunny');
    await game.page.waitForTimeout(3500); // let any earlier notification clear
    await forceWeather(game, 'rain');

    const notifications = await game.notifications('weather');
    expect(notifications.length, 'the player is warned when the rain starts')
      .toBeGreaterThan(0);
  });
});

// =============================================================== volcano

test.describe('Weather — volcano', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareWeatherRun(game);
  });

  test('a volcano runs the lava overlay rather than the rain one', async ({ game }) => {
    await forceWeather(game, 'volcano');
    await game.page.waitForTimeout(600);

    const overlay = await overlayState(game.page);
    const state = await weatherState(game);

    expect(state.effectOn).toBe(true);
    expect(overlay.display).toBe('block');
    expect(overlay.lavadrops, 'lava is falling').toBeGreaterThan(0);
    expect(overlay.raindrops, 'and no rain with it').toBe(0);
  });

  test('a volcano plays the eruption ambience and nothing else', async ({ game }) => {
    await game.withMods((m) => m.cg.setBackgroundAudio(true));
    await forceWeather(game, 'volcano');
    await game.withMods((m) => m.audio.weatherAmbienceManager.update());
    await game.page.waitForTimeout(400);

    const tracks = await game.withMods((m) =>
      Object.entries(m.audio.weatherAmbienceManager.tracks)
        .map(([key, audio]) => ({ key, paused: audio.paused })));

    const volcano = tracks.find((t) => t.key === 'volcano');
    expect(volcano, 'an eruption track is loaded').toBeTruthy();
    expect(volcano.paused, 'and it is playing').toBe(false);
    for (const track of tracks) {
      if (track.key === 'volcano') continue;
      expect(track.paused, `${track.key} should be paused under a volcano`).toBe(true);
    }
  });

  test('a volcano all but shuts the solar plant down', async ({ game }) => {
    const plants = await buySolarPlants(game, 10);

    await forceWeather(game, 'sunny');
    const sunny = await solarGeneration(game);

    await forceWeather(game, 'volcano');
    const volcano = await solarGeneration(game);

    expect(volcano.rate, 'output collapses to a twentieth')
      .toBeCloseTo(plants * SOLAR_RATE_PER_UNIT * 0.05 * volcano.oTypeMultiplier, 6);
    expect(volcano.rate, 'which is far below a clear day').toBeLessThan(sunny.rate * 0.1);
    expect(volcano.rate, 'but is not nothing at all').toBeGreaterThan(0);
  });

  test('a volcano grounds a fuelled rocket just as rain does', async ({ game }) => {
    await fuelRocketReadyForLaunch(game);

    await forceWeather(game, 'volcano');
    await game.openTab(6);
    await openOptionById(game, 'rocket1');
    await game.page.waitForTimeout(900);

    const pad = await fuelRowStatus(game.page);
    const badWeather = await game.withMods((m) => m.loc.localize('textBadWeather', m.cg.getLanguage()));

    expect(pad.text).toBe(badWeather);
    expect(pad.launchClasses).toContain('red-disabled-text');
  });

  test('a volcano drops no precipitation', async ({ game }) => {
    await forceWeather(game, 'volcano');
    expect((await weatherState(game)).precipitationRate, 'ash is not rain').toBe(0);
  });

  test('an eruption announces itself', async ({ game }) => {
    await forceWeather(game, 'sunny');
    await game.page.waitForTimeout(3500);
    await forceWeather(game, 'volcano');

    const notifications = await game.notifications('weather');
    expect(notifications.length, 'the player is warned when a volcano starts')
      .toBeGreaterThan(0);
  });
});

// ============================================== the effect setting and clearing

test.describe('Weather — the particle effect setting', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareWeatherRun(game);
  });

  test('turning the effect off stops the particles at once, and back on restarts them', async ({ game }) => {
    await forceWeather(game, 'rain');
    await game.page.waitForTimeout(600);
    expect((await overlayState(game.page)).raindrops).toBeGreaterThan(0);

    await game.withMods((m) => m.cg.setWeatherEffectSetting(false));
    await game.page.waitForTimeout(400);

    const off = await overlayState(game.page);
    expect(off.display, 'the overlay is hidden').toBe('none');
    expect(off.raindrops, 'and emptied').toBe(0);
    expect((await weatherState(game)).effectOn).toBe(false);

    await game.withMods((m) => m.cg.setWeatherEffectSetting(true));
    await game.page.waitForTimeout(600);

    const on = await overlayState(game.page);
    expect(on.display, 'switching it back on resumes the shower').toBe('block');
    expect(on.raindrops).toBeGreaterThan(0);
    expect((await weatherState(game)).effectOn).toBe(true);
  });

  test('turning the effect off does not stop the weather itself', async ({ game }) => {
    const plants = await buySolarPlants(game, 10);
    await forceWeather(game, 'rain');
    await game.withMods((m) => m.cg.setWeatherEffectSetting(false));
    await game.page.waitForTimeout(500);

    const reading = await solarGeneration(game);
    const state = await weatherState(game);

    expect(state.type, 'it is still raining').toBe('rain');
    expect(state.precipitationRate, 'and still collecting').toBeGreaterThan(0);
    expect(reading.rate, 'and the solar penalty still applies')
      .toBeCloseTo(plants * SOLAR_RATE_PER_UNIT * WEATHER_EFFICIENCY.rain * reading.oTypeMultiplier, 6);
  });

  test('the overlay is emptied when the weather turns fair', async ({ game }) => {
    await forceWeather(game, 'rain');
    await game.page.waitForTimeout(600);
    expect((await overlayState(game.page)).raindrops).toBeGreaterThan(0);

    await forceWeather(game, 'cloudy');
    await game.page.waitForTimeout(800);

    const overlay = await overlayState(game.page);
    expect(overlay.display, 'a cloudy sky has no particles').toBe('none');
    expect(overlay.raindrops).toBe(0);
    expect(overlay.lavadrops).toBe(0);
    expect((await weatherState(game)).effectOn).toBe(false);
  });

  test('no ambience plays at all when background audio is off', async ({ game }) => {
    await game.withMods((m) => m.cg.setBackgroundAudio(false));
    await forceWeather(game, 'rain');
    await game.withMods((m) => m.audio.weatherAmbienceManager.update());
    await game.page.waitForTimeout(400);

    const tracks = await game.withMods((m) =>
      Object.entries(m.audio.weatherAmbienceManager.tracks)
        .map(([key, audio]) => ({ key, paused: audio.paused })));

    for (const track of tracks) {
      expect(track.paused, `${track.key} should be silent with audio off`).toBe(true);
    }
  });

  test('switching between the two severe states swaps the particles rather than mixing them', async ({ game }) => {
    for (const type of SEVERE_STATES) {
      await forceWeather(game, type);
      await game.page.waitForTimeout(700);

      const overlay = await overlayState(game.page);
      if (type === 'rain') {
        expect(overlay.raindrops).toBeGreaterThan(0);
        expect(overlay.lavadrops).toBe(0);
      } else {
        expect(overlay.lavadrops).toBeGreaterThan(0);
        expect(overlay.raindrops).toBe(0);
      }
    }
  });
});

// ================================================ the debugger's own weather row

test.describe('Weather — the variable debugger', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareWeatherRun(game);
  });

  test('editing the live weather through the debugger keeps it a usable triple', async ({ game }) => {
    await forceWeather(game, 'rain');
    const before = await weatherState(game);
    expect(before.type).toBe('rain');

    // Write the row straight back at the same value it is already showing. A
    // no-op edit is the weakest possible thing to ask of an editor, and the row
    // must survive it — anything else corrupts the live weather from the debug
    // menu.
    const shown = await game.withMods((m) => String(m.cg.getCurrentStarSystemWeatherEfficiency()));
    await game.setDebugVariable('currentStarSystemWeatherEfficiency', shown);
    await game.closeVariableDebugger();

    const after = await weatherState(game);
    expect(Array.isArray(after.raw), 'weather is still [system, efficiency, type]').toBe(true);
    expect(after.type, 'and still names a state').toBe(before.type);
    expect(after.efficiency, 'with the efficiency the solar plant reads').toBe(before.efficiency);
  });
});
