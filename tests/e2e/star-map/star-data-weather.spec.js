/**
 * Area: Star Map & Star Data — the weather each star carries, and whether it lasts
 * Plan: tests/docs/areas/star-map.md
 *
 * A star's weather is not decided when you arrive. It is decided the first time
 * the star map draws that star: `generateStarDataAndAddToDataObject` rolls four
 * probabilities, scales them to 100, picks the most likely one as the star's
 * *tendency*, rolls a precipitation compound, and writes the whole lot into the
 * star data object. From then on, `changeWeather()` draws every weather window
 * for that system out of exactly that table.
 *
 * That makes the star data the **source** of the weather, and it makes one
 * property matter more than any other: **a star's weather data has to survive
 * being looked at again.** The star map is redrawn constantly — every time the
 * pane is opened, every time the map mode changes, every time a study completes —
 * and a redraw that re-rolls the table would silently rewrite the forecast a
 * player has already read, change the compound their system precipitates, and
 * move the solar output they planned their power grid around.
 *
 * `generateStarfield` has two branches that create star data, and only one of
 * them guards against that:
 *
 *   interesting star   `if (!checkIfInterestingStarIsInStarDataAlready(id))` → generate
 *   factory star       generate, unconditionally
 *
 * The specs below assert the property, not the branch: whatever kind of star it
 * is, looking at the map again must not change what the star said last time.
 *
 * See `tests/e2e/weather/weather-live.spec.js` for what the table then *does* —
 * this file is only about where the numbers come from and whether they hold.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** The four states every generated star publishes, and the efficiency of each. */
const PUBLISHED_EFFICIENCY = {
  sunny: 1,
  cloudy: 0.6,
  rain: 0.4,
  volcano: 0.05
};

/** The symbol each state is drawn with. */
const PUBLISHED_SYMBOL = {
  sunny: '☀',
  cloudy: '☁',
  rain: '☂',
  volcano: '⛰'
};

/** Every compound `calculatePrecipitationType` can select. */
const PRECIPITATION_TYPES = ['titanium', 'water', 'glass', 'diesel', 'concrete', 'steel'];

// Manuscript generation walks the star vision range out in increments, and the
// star map is redrawn several times per case.
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
  await game.page.waitForTimeout(800);
  return found;
}

/** Draw the star map, which is what populates the star data object. */
async function drawStarMap(game) {
  await game.openTab(5);
  const opened = await openOptionById(game, 'starMapOption');
  if (!opened) throw new Error('The Star Map row was not in the side menu');
  await game.page.waitForTimeout(600);
}

/** Draw the Star Data table, which reads what the map wrote. */
async function drawStarData(game) {
  await game.openTab(5);
  const opened = await openOptionById(game, 'starDataOption');
  if (!opened) throw new Error('The Star Data row was not in the side menu');
  await game.page.waitForTimeout(600);
}

/**
 * Every star the data object holds, minus the two entries that are not stars:
 * `destinationStar` is a working copy, and the current system's own record is
 * seeded rather than generated.
 */
async function starRecords(game) {
  return game.withMods((m) => {
    const stars = m.rdo.getStarSystemDataObject('stars') || {};
    const current = String(m.cg.getCurrentStarSystem() || '').toLowerCase();
    return Object.entries(stars)
      .filter(([name]) => name !== 'destinationStar' && name !== 'version' && name !== current)
      .map(([name, data]) => ({
        name,
        weather: data?.weather ?? null,
        weatherTendency: data?.weatherTendency ?? null,
        precipitationType: data?.precipitationType ?? null,
        precipitationResourceCategory: data?.precipitationResourceCategory ?? null,
        starType: data?.starType ?? null,
        distance: data?.distance ?? null,
        factoryStar: data?.factoryStar ?? false
      }));
  });
}

/** A comparable fingerprint of everything weather-related a star holds. */
const weatherFingerprint = (record) => JSON.stringify({
  weather: record.weather,
  weatherTendency: record.weatherTendency,
  precipitationType: record.precipitationType,
  precipitationResourceCategory: record.precipitationResourceCategory
});

/** Reach a run with a launch-ready scenario and a handful of stars studied. */
async function prepareStarRun(game) {
  await game.prepareRunForStarshipLaunch();
  await game.page.waitForTimeout(800);
}

/**
 * Walk the star vision range out until a manuscript is generated, then activate
 * it the way arriving at the manuscript star does.
 *
 * `activateFactoryStar` is the game's own function — the one the arrival handler
 * calls — so this stages the precondition without inventing a state the game
 * cannot itself reach. Flying a starship to the manuscript star to trigger it
 * belongs to the starship area, not here.
 */
async function revealAFactoryStar(game) {
  return game.withMods((m) => {
    m.cg.getStarsWithAncientManuscripts().length = 0;
    m.cg.setFactoryStarsArray([], true);
    m.cg.setStarVisionDistance(0);

    for (let i = 0; i < 60 && m.cg.getStarsWithAncientManuscripts().length < 1; i++) {
      m.game.extendStarDataRange(true);
    }

    const entry = m.cg.getStarsWithAncientManuscripts()[0];
    if (!entry) return null;
    m.cg.activateFactoryStar(entry);
    return { manuscriptStar: entry[0], factoryStar: entry[1] };
  });
}

// ================================================ what a studied star records

test.describe('Star Data — the weather a star is born with', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareStarRun(game);
    await drawStarMap(game);
  });

  test('every star in range carries a complete four-state weather table', async ({ game }) => {
    const records = await starRecords(game);
    const generated = records.filter((r) => r.weather);

    expect(generated.length, 'studying stars should populate the star data object')
      .toBeGreaterThan(0);

    for (const record of generated) {
      expect(Object.keys(record.weather).sort(), `${record.name} states`)
        .toEqual(['cloudy', 'rain', 'sunny', 'volcano']);

      for (const [state, entry] of Object.entries(record.weather)) {
        expect(entry.length, `${record.name} ${state} entry`).toBe(4);
        expect(entry[1], `${record.name} ${state} symbol`).toBe(PUBLISHED_SYMBOL[state]);
        expect(entry[2], `${record.name} ${state} efficiency`).toBe(PUBLISHED_EFFICIENCY[state]);
        expect(typeof entry[3], `${record.name} ${state} colour class`).toBe('string');
      }
    }
  });

  test('a star’s weather probabilities always total exactly one hundred', async ({ game }) => {
    const records = (await starRecords(game)).filter((r) => r.weather);
    expect(records.length).toBeGreaterThan(0);

    for (const record of records) {
      const total = Object.values(record.weather).reduce((sum, entry) => sum + entry[0], 0);
      expect(total, `${record.name} probabilities ${JSON.stringify(
        Object.fromEntries(Object.entries(record.weather).map(([k, v]) => [k, v[0]]))
      )}`).toBe(100);

      for (const [state, entry] of Object.entries(record.weather)) {
        expect(entry[0], `${record.name} ${state} probability`).toBeGreaterThanOrEqual(0);
        expect(entry[0], `${record.name} ${state} probability`).toBeLessThanOrEqual(100);
      }
    }
  });

  test('an all-zero weather roll becomes a valid neutral forecast', async ({ game }) => {
    const weather = await game.withMods((m) => {
      const originalRandom = Math.random;
      try {
        Math.random = () => 0;
        m.game.generateStarDataAndAddToDataObject({ id: 'weather-zero-test' }, 12);
        return m.rdo.getStarSystemDataObject('stars', ['weather-zero-test'])?.weather;
      } finally {
        Math.random = originalRandom;
      }
    });

    expect(Object.fromEntries(Object.entries(weather).map(([state, entry]) => [state, entry[0]])))
      .toEqual({ sunny: 25, cloudy: 25, rain: 25, volcano: 25 });
  });

  test('the tendency a star advertises is its most likely state', async ({ game }) => {
    const records = (await starRecords(game)).filter((r) => r.weather && r.weatherTendency);
    expect(records.length).toBeGreaterThan(0);

    for (const record of records) {
      const [symbol, probability, colourClass] = record.weatherTendency;
      const highest = Object.entries(record.weather)
        .reduce((best, entry) => (entry[1][0] > best[1][0] ? entry : best));

      expect(symbol, `${record.name} tendency symbol`).toBe(PUBLISHED_SYMBOL[highest[0]]);
      expect(probability, `${record.name} tendency probability`).toBe(highest[1][0]);
      expect(colourClass, `${record.name} tendency colour`).toBe(highest[1][3]);
    }
  });

  test('every star precipitates something the game actually has a recipe for', async ({ game }) => {
    const records = (await starRecords(game)).filter((r) => r.weather);
    const compounds = await game.withMods((m) => Object.keys(m.rdo.getResourceDataObject('compounds')));

    for (const record of records) {
      expect(PRECIPITATION_TYPES, `${record.name} precipitates ${record.precipitationType}`)
        .toContain(record.precipitationType);
      expect(compounds, `${record.name} precipitates a real compound`)
        .toContain(record.precipitationType);
      expect(record.precipitationResourceCategory).toBe('compounds');
    }
  });

  test('the Star Data table reports the tendency each star recorded', async ({ game }) => {
    await drawStarData(game);

    const shown = await game.page.evaluate(() =>
      Array.from(document.querySelectorAll('#starInfoContainerWeatherTendency'))
        .map((el) => el.textContent.trim())
        .filter((text) => text.length > 0));

    expect(shown.length, 'the table lists the studied stars').toBeGreaterThan(0);

    const tendencies = (await starRecords(game))
      .filter((r) => r.weatherTendency)
      .map((r) => `${r.weatherTendency[0]} (${r.weatherTendency[1]}%)`);

    for (const text of shown) {
      expect(tendencies, `the table shows "${text}", which no star recorded`).toContain(text);
    }
  });

  test('the live weather of the current system is drawn from that system’s own table', async ({ game }) => {
    const live = await game.withMods((m) => {
      const system = m.cg.getCurrentStarSystem();
      return {
        system,
        state: m.cg.getCurrentStarSystemWeatherEfficiency(),
        table: m.rdo.getStarSystemWeather(system)
      };
    });

    expect(live.state[0], 'the state names the system it belongs to').toBe(live.system);
    expect(Object.keys(live.table), 'and the state is one the system publishes')
      .toContain(live.state[2]);
    expect(live.state[1], 'carrying that table’s efficiency')
      .toBe(live.table[live.state[2]][2]);
  });
});

// ========================================= star data must survive being redrawn

test.describe('Star Data — a redraw of the map must not rewrite the forecast', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareStarRun(game);
  });

  test('an ordinary studied star keeps its weather across repeated redraws', async ({ game }) => {
    await drawStarMap(game);

    const before = new Map((await starRecords(game))
      .filter((r) => r.weather && !r.factoryStar)
      .map((r) => [r.name, weatherFingerprint(r)]));
    expect(before.size, 'there should be studied stars to compare').toBeGreaterThan(0);

    for (let redraw = 0; redraw < 3; redraw++) {
      await drawStarData(game);
      await drawStarMap(game);
    }

    const after = new Map((await starRecords(game))
      .filter((r) => r.weather && !r.factoryStar)
      .map((r) => [r.name, weatherFingerprint(r)]));

    for (const [name, fingerprint] of before) {
      expect(after.get(name), `${name} was re-rolled by looking at the map again`)
        .toBe(fingerprint);
    }
  });

  test('a revealed megastructure star keeps its weather across repeated redraws', async ({ game }) => {
    const revealed = await revealAFactoryStar(game);
    expect(revealed, 'a manuscript should be reachable within the vision range').toBeTruthy();

    // The first draw is what creates the record; everything after it is a redraw.
    await drawStarMap(game);
    const before = (await starRecords(game)).find((r) => r.name === revealed.factoryStar);
    expect(before, `${revealed.factoryStar} should be in the star data`).toBeTruthy();
    expect(before.weather, 'with a weather table of its own').toBeTruthy();

    for (let redraw = 0; redraw < 3; redraw++) {
      await drawStarData(game);
      await drawStarMap(game);
    }

    const after = (await starRecords(game)).find((r) => r.name === revealed.factoryStar);

    // A megastructure star is the one a player studies hardest and plans around,
    // so its forecast is the last one that should move under them.
    expect(weatherFingerprint(after), `${revealed.factoryStar} was re-rolled by looking at the map again`)
      .toBe(weatherFingerprint(before));
  });

  test('a redraw never changes what a system precipitates', async ({ game }) => {
    const revealed = await revealAFactoryStar(game);
    expect(revealed).toBeTruthy();
    await drawStarMap(game);

    const before = Object.fromEntries((await starRecords(game))
      .filter((r) => r.precipitationType)
      .map((r) => [r.name, r.precipitationType]));
    expect(Object.keys(before).length).toBeGreaterThan(0);

    for (let redraw = 0; redraw < 3; redraw++) {
      await drawStarMap(game);
    }

    const after = Object.fromEntries((await starRecords(game))
      .filter((r) => r.precipitationType)
      .map((r) => [r.name, r.precipitationType]));

    for (const [name, type] of Object.entries(before)) {
      expect(after[name], `${name} changed what it precipitates on a redraw`).toBe(type);
    }
  });

  test('studying further stars leaves the already-studied ones alone', async ({ game }) => {
    await drawStarMap(game);

    const before = new Map((await starRecords(game))
      .filter((r) => r.weather)
      .map((r) => [r.name, weatherFingerprint(r)]));
    expect(before.size).toBeGreaterThan(0);

    // Push the vision range out, which brings new stars in and redraws the map.
    await game.withMods((m) => {
      for (let i = 0; i < 5; i++) m.game.extendStarDataRange(true);
    });
    await drawStarMap(game);

    const after = await starRecords(game);
    const afterByName = new Map(after.filter((r) => r.weather).map((r) => [r.name, weatherFingerprint(r)]));

    expect(afterByName.size, 'more stars should now be in range').toBeGreaterThan(before.size);
    for (const [name, fingerprint] of before) {
      expect(afterByName.get(name), `${name} was re-rolled when new stars came into range`)
        .toBe(fingerprint);
    }
  });

  test('a star that is already recorded is not regenerated at all', async ({ game }) => {
    await drawStarMap(game);

    // Stamp every recorded star with a marker the generator does not write. If a
    // record is regenerated, the marker goes with it — which is a sharper signal
    // than comparing randomised numbers that could in principle repeat.
    const stamped = await game.withMods((m) => {
      const stars = m.rdo.getStarSystemDataObject('stars') || {};
      const current = String(m.cg.getCurrentStarSystem() || '').toLowerCase();
      const names = [];
      for (const [name, data] of Object.entries(stars)) {
        if (name === 'destinationStar' || name === 'version' || name === current) continue;
        if (!data || typeof data !== 'object' || !data.weather) continue;
        data.e2eSurveyStamp = 'kept';
        names.push(name);
      }
      return names;
    });
    expect(stamped.length).toBeGreaterThan(0);

    await drawStarMap(game);
    await drawStarMap(game);

    const survivors = await game.withMods((m, names) => {
      const stars = m.rdo.getStarSystemDataObject('stars') || {};
      return names.filter((name) => stars[name]?.e2eSurveyStamp === 'kept');
    }, stamped);

    expect(survivors.sort(), 'a redraw regenerated a star record that already existed')
      .toEqual([...stamped].sort());
  });
});
