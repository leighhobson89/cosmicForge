/**
 * Area: Star Data — the six columns, their sorting, and how each star is coloured
 * Plan: tests/docs/areas/star-map.md
 *
 * The Star Data pane is the table a player plans a run from. It has one row per
 * star the run knows about and six sortable columns:
 *
 *   Distance   light years, ascending
 *   Type       spectral class, alphabetical
 *   Weather    the star's tendency, ordered ☀ ☁ ☂ ⛰ then by probability descending
 *   Precipitation   the compound that falls there, alphabetical
 *   Fuel       antimatter the trip costs, ascending
 *   AP         ascendency points the trip is worth, ascending
 *
 * ## Colour is the whole information channel here
 *
 * The star's *name* carries the state, and the precedence is strict — the first
 * of these that applies wins:
 *
 *   can't afford the fuel  `red-disabled-text`
 *   already settled        `settled-star-text`, row dimmed, sorted to the bottom
 *   megastructure star     `factory-star-text`, plus its own icon
 *   O-type                 `o-star-text`
 *   otherwise              `green-ready-text`
 *
 * Affordability outranking everything else is the part worth pinning: a
 * megastructure star the run cannot reach is drawn as unreachable rather than as
 * a prize, which is the honest thing to show and the easy thing to regress.
 *
 * ## Two rows that are deliberately different
 *
 * A **settled** star has its distance, weather, precipitation and AP cells blanked
 * and reads "Settled" instead — there is nothing left to plan about it. An
 * **unreported megastructure star** is not in the table at all, the same rule the
 * map and the search box apply, so that the reward for finding the manuscript is
 * still a discovery.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** The six columns, in the order the legend builds them. */
const COLUMNS = ['distance', 'type', 'weather', 'precipitationType', 'fuel', 'ascendencyPoints'];

/** The legend element for each sort method. */
const LEGEND_IDS = {
  distance: 'starLegendDistance',
  type: 'starLegendType',
  weather: 'starLegendWeatherProb',
  precipitationType: 'starLegendPrecipitationType',
  fuel: 'starLegendFuel',
  ascendencyPoints: 'starLegendAscendencyPoints'
};

/** The weather tendency order the table sorts by. */
const WEATHER_PRIORITY = { '☀': 1, '☁': 2, '☂': 3, '⛰': 4 };

test.describe.configure({ timeout: 300_000 });

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
async function populateStarData(game, lightYears = 40) {
  await game.withMods((m, target) => m.cg.setStarVisionDistance(target), lightYears);
  await game.openTab(5);
  await openOptionById(game, 'starMapOption');
  await game.page.waitForTimeout(600);
}

/** Draw the Star Data table. */
async function openStarData(game) {
  await game.openTab(5);
  const opened = await openOptionById(game, 'starDataOption');
  if (!opened) throw new Error('The Star Data row was not in the side menu');
  await game.page.waitForTimeout(600);
}

/**
 * Every row the table is showing, in display order.
 *
 * `.option-row` matters: `createOptionRow` gives a row's flavour container the
 * row id with `Description` appended, so a bare id-prefix selector matches each
 * star twice and doubles every index.
 */
async function starRows(page) {
  return page.evaluate(() => Array.from(document.querySelectorAll('.option-row[id^="starRow_"]')).map((row) => {
    const cells = Array.from(row.querySelectorAll('.value-star'));
    const label = row.querySelector('.label-container');
    const text = (el) => (el?.textContent ?? '').trim();
    return {
      id: row.id,
      name: row.id.replace('starRow_', ''),
      labelText: text(label),
      labelClasses: Array.from(label?.classList ?? []),
      hasMegaIcon: Boolean(row.querySelector('.star-data-mega-icon')),
      opacity: row.style.opacity,
      distance: text(cells[0]),
      distanceClasses: cells[0] ? Array.from(cells[0].classList) : [],
      type: text(cells[1]),
      weather: text(cells[2]),
      precipitation: text(cells[3]),
      fuel: text(cells[4]),
      ap: text(cells[5])
    };
  }));
}

/** Press one legend column and let the table redraw. */
async function sortBy(game, method) {
  await game.page.evaluate((id) => {
    document.getElementById(id)?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, LEGEND_IDS[method]);
  await game.page.waitForTimeout(600);
}

/** The star records behind the table. */
async function starRecords(game) {
  return game.withMods((m) => {
    const stars = m.rdo.getStarSystemDataObject('stars') || {};
    const current = String(m.cg.getCurrentStarSystem() || '').toLowerCase();
    return Object.entries(stars)
      .filter(([name, data]) => name !== 'destinationStar' && name !== current && data && typeof data === 'object')
      .map(([name, data]) => ({
        name,
        distance: data.distance,
        starType: data.starType,
        weatherTendency: data.weatherTendency,
        precipitationType: data.precipitationType,
        fuel: data.fuel,
        ascendencyPoints: data.ascendencyPoints
      }));
  });
}

/** Reach a run with stars studied and antimatter to spend. */
async function prepareTableRun(game) {
  await game.prepareRunForStarshipLaunch();
  await game.page.waitForTimeout(800);
  await game.withMods((m) => {
    m.rdo.setResourceDataObject(1e15, 'antimatter', ['storageCapacity']);
    m.rdo.setResourceDataObject(1e9, 'antimatter', ['quantity']);
    // The fuel and AP cells carry the `notation` class, so the frame loop
    // abbreviates them — "5000" is rendered "5K". Plain notation is one of the
    // two settings a player can choose, and it is the one that lets a cell be
    // compared against the record behind it. The abbreviations themselves are
    // the notation area's business.
    m.cg.setNotationType('normal');
  });
  await game.page.waitForTimeout(400);
}

/** Reveal one megastructure star the way arriving at its manuscript does. */
async function revealAFactoryStar(game) {
  return game.withMods((m) => {
    m.cg.getStarsWithAncientManuscripts().length = 0;
    m.cg.setFactoryStarsArray([], true);
    m.cg.setStarVisionDistance(0);
    for (let i = 0; i < 80 && m.cg.getStarsWithAncientManuscripts().length < 2; i++) {
      m.game.extendStarDataRange(true);
    }
    const entries = m.cg.getStarsWithAncientManuscripts();
    if (entries.length < 2) return null;
    m.cg.activateFactoryStar(entries[0]);
    return { revealed: entries[0][1], unrevealed: entries[1][1] };
  });
}

// ================================================================ the columns

test.describe('Star Data — the six columns', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareTableRun(game);
    await populateStarData(game);
    await openStarData(game);
  });

  test('the table lists the stars the run knows about, one row each', async ({ game }) => {
    const rows = await starRows(game.page);
    const records = await starRecords(game);

    expect(rows.length, 'the table has rows in it').toBeGreaterThan(0);
    expect(rows.length, 'and no more than the run has stars')
      .toBeLessThanOrEqual(records.length);

    const known = new Set(records.map((r) => r.name.toLowerCase()));
    for (const row of rows) {
      expect(known, `${row.name} is in the table but not in the star data`)
        .toContain(row.name.toLowerCase());
    }

    const ids = rows.map((r) => r.id);
    expect(new Set(ids).size, 'no star is listed twice').toBe(ids.length);
  });

  test('every cell carries the figure its own record holds', async ({ game }) => {
    const rows = await starRows(game.page);
    const records = new Map((await starRecords(game)).map((r) => [r.name.toLowerCase(), r]));

    const compared = rows.filter((row) => records.has(row.name.toLowerCase())
      && row.distance !== '' && !row.distance.toLowerCase().includes('settle'));
    expect(compared.length, 'there should be unsettled rows to compare').toBeGreaterThan(0);

    for (const row of compared) {
      const record = records.get(row.name.toLowerCase());
      expect(row.distance, `${row.name} distance`).toBe(`${record.distance.toFixed(2)} ly`);
      expect(row.type, `${row.name} type`).toBe(record.starType);
      expect(row.precipitation.toLowerCase(), `${row.name} precipitation`)
        .toContain(record.precipitationType.toLowerCase());
      // Plain notation still groups thousands ("5,000"), so the separators are
      // stripped before the figure is compared with the record behind it.
      expect(row.fuel.replace(/,/g, ''), `${row.name} fuel`).toBe(String(record.fuel));
      expect(row.weather, `${row.name} weather`)
        .toBe(`${record.weatherTendency[0]} (${record.weatherTendency[1]}%)`);
    }
  });

  test('the AP column shows the points the trip is actually worth', async ({ game }) => {
    const rows = await starRows(game.page);
    const records = new Map((await starRecords(game)).map((r) => [r.name.toLowerCase(), r]));

    const sample = rows.find((row) => records.has(row.name.toLowerCase()) && row.ap !== '');
    expect(sample, 'a row with an AP figure').toBeTruthy();

    const record = records.get(sample.name.toLowerCase());
    const expected = await game.withMods((m, base) =>
      m.game.getAscendencyPointsWithRepeatableBonus(base), record.ascendencyPoints);

    expect(sample.ap, `${sample.name} AP`).toBe(String(expected));
  });

  test('the type column agrees with the name table for every listed star', async ({ game }) => {
    const rows = await starRows(game.page);
    const types = await game.withMods((m, names) =>
      names.map((n) => m.desc.getStarTypeByName(n)), rows.map((r) => r.name));

    rows.forEach((row, index) => {
      if (row.type === '') return; // settled rows blank their cells
      expect(row.type, `${row.name} should be a ${types[index]}`).toBe(types[index]);
    });
  });
});

// ================================================================= the sorting

test.describe('Star Data — sorting', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareTableRun(game);
    await populateStarData(game);
    await openStarData(game);
  });

  test('every column sorts, and exactly one sorts at a time', async ({ game }) => {
    for (const method of COLUMNS) {
      await sortBy(game, method);

      const state = await game.page.evaluate((ids) => Object.fromEntries(
        Object.entries(ids).map(([key, id]) => {
          const el = document.getElementById(id);
          return [key, {
            present: Boolean(el),
            sortBy: !!el?.classList.contains('sort-by'),
            noSort: !!el?.classList.contains('no-sort')
          }];
        })
      ), LEGEND_IDS);

      expect(state[method].present, `${method} column should be in the legend`).toBe(true);
      expect(state[method].sortBy, `${method} should be the active sort`).toBe(true);
      for (const other of COLUMNS) {
        if (other === method) continue;
        expect(state[other].noSort, `${other} should be marked as not sorting`).toBe(true);
      }

      expect(await game.withMods((m) => m.cg.getSortStarMethod()), 'the choice is remembered')
        .toBe(method);
    }
  });

  test('distance, fuel and AP all sort smallest first', async ({ game }) => {
    const records = new Map((await starRecords(game)).map((r) => [r.name.toLowerCase(), r]));

    for (const [method, read] of [
      ['distance', (record) => record.distance],
      ['fuel', (record) => record.fuel],
      ['ascendencyPoints', (record) => record.ascendencyPoints]
    ]) {
      await sortBy(game, method);
      const rows = await starRows(game.page);
      // Read the row order off the table, but take the value from the record the
      // sort itself reads — the rendered cell is abbreviated by the notation
      // setting and is checked separately.
      const settled = new Set((await game.withMods((m) => m.cg.getSettledStars()))
        .map((n) => String(n).toLowerCase()));
      const values = rows
        .filter((row) => !settled.has(row.name.toLowerCase()))
        .map((row) => records.get(row.name.toLowerCase()))
        .filter(Boolean)
        .map(read)
        .filter((v) => Number.isFinite(v));

      expect(values.length, `${method} should produce comparable rows`).toBeGreaterThan(1);
      const sorted = [...values].sort((a, b) => a - b);
      expect(values, `${method} should be ascending`).toEqual(sorted);
    }
  });

  test('type sorts alphabetically by spectral class', async ({ game }) => {
    await sortBy(game, 'type');
    const types = (await starRows(game.page)).map((r) => r.type).filter(Boolean);

    expect(types.length).toBeGreaterThan(1);
    const sorted = [...types].sort((a, b) => a.localeCompare(b));
    expect(types, 'ordered O, B, A, F, G, K, M by letter').toEqual(sorted);
  });

  test('precipitation sorts alphabetically by what falls there', async ({ game }) => {
    await sortBy(game, 'precipitationType');
    const rows = await starRows(game.page);
    const records = new Map((await starRecords(game)).map((r) => [r.name.toLowerCase(), r]));

    // The cell is localized, so the order is checked against the underlying key
    // the sort actually reads.
    const keys = rows
      .map((row) => records.get(row.name.toLowerCase())?.precipitationType)
      .filter(Boolean);

    expect(keys.length).toBeGreaterThan(1);
    const sorted = [...keys].sort((a, b) => a.localeCompare(b));
    expect(keys, 'ordered by the compound that precipitates').toEqual(sorted);
  });

  test('weather sorts by how good the forecast is, then by how likely', async ({ game }) => {
    await sortBy(game, 'weather');
    const rows = await starRows(game.page);
    const records = new Map((await starRecords(game)).map((r) => [r.name.toLowerCase(), r]));

    const tendencies = rows
      .map((row) => records.get(row.name.toLowerCase())?.weatherTendency)
      .filter((t) => Array.isArray(t));

    expect(tendencies.length).toBeGreaterThan(1);

    for (let i = 1; i < tendencies.length; i++) {
      const previous = tendencies[i - 1];
      const current = tendencies[i];
      const priorityPrevious = WEATHER_PRIORITY[previous[0]] ?? 999;
      const priorityCurrent = WEATHER_PRIORITY[current[0]] ?? 999;

      expect(priorityPrevious, `${previous[0]} should not sort after ${current[0]}`)
        .toBeLessThanOrEqual(priorityCurrent);
      if (priorityPrevious === priorityCurrent) {
        expect(Number(previous[1]), 'within a forecast, the likelier star comes first')
          .toBeGreaterThanOrEqual(Number(current[1]));
      }
    }
  });

  test('a settled star sinks to the bottom whatever the table is sorted by', async ({ game }) => {
    const settled = await game.withMods((m) => {
      const stars = m.rdo.getStarSystemDataObject('stars') || {};
      const current = String(m.cg.getCurrentStarSystem() || '').toLowerCase();
      const picks = Object.keys(stars)
        .filter((n) => n !== 'destinationStar' && n !== current)
        .slice(0, 2);
      picks.forEach((name) => m.cg.setSettledStars(name));
      return picks;
    });
    expect(settled.length, 'two stars to settle').toBe(2);

    await openStarData(game);

    for (const method of ['distance', 'fuel', 'type']) {
      await sortBy(game, method);
      const rows = await starRows(game.page);
      const names = rows.map((r) => r.name.toLowerCase());
      const settledPositions = settled.map((n) => names.indexOf(n)).filter((i) => i >= 0);

      expect(settledPositions.length, `settled stars should still be listed under ${method}`)
        .toBe(settled.length);
      for (const position of settledPositions) {
        expect(position, `a settled star sorted above an unsettled one under ${method}`)
          .toBeGreaterThanOrEqual(names.length - settled.length);
      }
    }
  });
});

// ================================================================ the colouring

test.describe('Star Data — how each star is coloured', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareTableRun(game);
    await populateStarData(game);
  });

  test('a star the run can reach is named in the ready colour', async ({ game }) => {
    await game.withMods((m) => m.rdo.setResourceDataObject(1e9, 'antimatter', ['quantity']));
    await openStarData(game);

    const rows = await starRows(game.page);
    const ordinary = rows.filter((row) => !row.hasMegaIcon
      && !row.labelClasses.includes('settled-star-text')
      && !row.labelClasses.includes('o-star-text'));

    expect(ordinary.length, 'there should be ordinary reachable stars').toBeGreaterThan(0);
    for (const row of ordinary) {
      expect(row.labelClasses, `${row.name} should read as reachable`)
        .toContain('green-ready-text');
    }
  });

  test('a star the run cannot fuel is named in red, whatever else it is', async ({ game }) => {
    await game.withMods((m) => m.rdo.setResourceDataObject(0, 'antimatter', ['quantity']));
    await openStarData(game);

    const rows = await starRows(game.page);
    const unsettled = rows.filter((row) => !row.labelClasses.includes('settled-star-text'));

    expect(unsettled.length).toBeGreaterThan(0);
    for (const row of unsettled) {
      expect(row.labelClasses, `${row.name} is unaffordable and should read as such`)
        .toContain('red-disabled-text');
      expect(row.labelClasses, 'and must not also read as reachable')
        .not.toContain('green-ready-text');
    }
  });

  test('affordability outranks the O-type colour', async ({ game }) => {
    const oStar = await game.withMods((m) => {
      const stars = m.rdo.getStarSystemDataObject('stars') || {};
      const current = String(m.cg.getCurrentStarSystem() || '').toLowerCase();
      return Object.keys(stars).find((n) => n !== 'destinationStar' && n !== current
        && m.desc.getStarTypeByName(n) === 'O');
    });
    test.skip(!oStar, 'no O-type star is inside the studied range for this run');

    await game.withMods((m) => m.rdo.setResourceDataObject(1e9, 'antimatter', ['quantity']));
    await openStarData(game);
    const rich = (await starRows(game.page)).find((r) => r.name.toLowerCase() === oStar);
    expect(rich, `${oStar} should be listed`).toBeTruthy();
    expect(rich.labelClasses, 'an affordable O-type is drawn as one').toContain('o-star-text');

    await game.withMods((m) => m.rdo.setResourceDataObject(0, 'antimatter', ['quantity']));
    await openStarData(game);
    const broke = (await starRows(game.page)).find((r) => r.name.toLowerCase() === oStar);
    expect(broke.labelClasses, 'an unreachable one is drawn as unreachable first')
      .toContain('red-disabled-text');
    expect(broke.labelClasses).not.toContain('o-star-text');
  });

  test('a settled star is dimmed, named in the settled colour and says so in every cell', async ({ game }) => {
    const settled = await game.withMods((m) => {
      const stars = m.rdo.getStarSystemDataObject('stars') || {};
      const current = String(m.cg.getCurrentStarSystem() || '').toLowerCase();
      const pick = Object.keys(stars).find((n) => n !== 'destinationStar' && n !== current);
      if (pick) m.cg.setSettledStars(pick);
      return pick;
    });
    expect(settled).toBeTruthy();

    await game.withMods((m) => m.rdo.setResourceDataObject(1e9, 'antimatter', ['quantity']));
    await openStarData(game);

    const row = (await starRows(game.page)).find((r) => r.name.toLowerCase() === settled);
    expect(row, `${settled} should still be listed`).toBeTruthy();
    expect(row.labelClasses, 'named in the settled colour').toContain('settled-star-text');
    expect(row.opacity, 'and dimmed').toBe('0.5');

    const settledText = await game.withMods((m) => m.loc.localize('textSettled', m.cg.getLanguage()));
    expect(row.distance, 'distance is replaced by the settled marker').toBe(settledText);
    expect(row.fuel, 'as is the fuel').toBe(settledText);
    expect(row.weather, 'and there is nothing left to forecast').toBe('');
    expect(row.precipitation).toBe('');
    expect(row.ap, 'nor any points left to earn').toBe('');
  });

  test('a reported megastructure star is named in its own colour and carries its icon', async ({ game }) => {
    const revealed = await revealAFactoryStar(game);
    expect(revealed, 'two manuscripts should be reachable').toBeTruthy();

    await populateStarData(game, 100);
    await game.withMods((m) => m.rdo.setResourceDataObject(1e9, 'antimatter', ['quantity']));
    await openStarData(game);

    const row = (await starRows(game.page)).find((r) => r.name.toLowerCase() === revealed.revealed);
    expect(row, `${revealed.revealed} should be listed`).toBeTruthy();
    expect(row.labelClasses, 'named as a megastructure star').toContain('factory-star-text');
    expect(row.hasMegaIcon, 'and carrying its icon').toBe(true);
  });

  test('an unreported megastructure star is kept out of the table entirely', async ({ game }) => {
    const revealed = await revealAFactoryStar(game);
    expect(revealed).toBeTruthy();

    await populateStarData(game, 100);
    await openStarData(game);

    const names = (await starRows(game.page)).map((r) => r.name.toLowerCase());
    expect(names, 'the reported one is listed').toContain(revealed.revealed);
    expect(names, 'the unreported one is not').not.toContain(revealed.unrevealed);
  });

  test('no ordinary star wears a megastructure icon', async ({ game }) => {
    await openStarData(game);
    const rows = await starRows(game.page);
    const factoryStars = await game.withMods((m) => m.cg.getFactoryStarsArray());

    for (const row of rows) {
      if (row.hasMegaIcon) {
        expect(factoryStars, `${row.name} carries the icon without being a megastructure star`)
          .toContain(row.name.toLowerCase());
      }
    }
  });
});
