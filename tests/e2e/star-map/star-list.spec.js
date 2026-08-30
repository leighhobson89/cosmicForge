/**
 * Area: Star Data — the Name column and the globe that shows a star on the map
 * Plan: tests/docs/areas/star-map.md
 *
 * P4 of the player-feedback plan. Two complaints, one row.
 *
 * ## The name was the one column you could not sort by
 *
 * The Star Data table has always sorted on six things — distance, type, weather,
 * precipitation, fuel and AP — and the leftmost slot, the one holding the star's
 * name, was a static "Sort By:" caption. A player who knows the name of the star
 * they want had no way to find its row except by eye. That slot is now the Name
 * header, it sorts alphabetically like the other six, and it carries an info icon
 * explaining both that and the globe.
 *
 * ## Reading a row told you nothing about where the star actually is
 *
 * The table is where a run is planned, but the map is where a star is *seen*, and
 * nothing joined them: you read a promising row, then went to the map and hunted
 * for the star by hand. Each unsettled row now carries a globe at the head of the
 * name which takes the player to the map in normal mode and pings the star, the
 * same ping the map's own search box drops.
 *
 * ## What is worth pinning here
 *
 * The globe **shows**, it does not choose. It leaves the destination exactly as
 * the player left it, and it has no opinion about whether the ship is in flight or
 * whether the trip is affordable — picking a destination stays the map's own job,
 * one click away once the player can see where the star is. Several specs below
 * exist only to hold that line, because the obvious implementation (reuse the
 * search box wholesale) quietly retargets.
 *
 * The one thing that genuinely can switch the button off is CSS it does not own:
 * `createOptionRow` puts the star's colour class on the whole name column, and
 * for an unaffordable star that class is `red-disabled-text`, whose CSS is
 * `pointer-events: none`. That is why the globe opts back into pointer events and
 * why a spec here checks it on a star the run cannot fuel.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** The seven headers, Name first, in the order the legend builds them. */
const LEGEND_IDS = {
  name: 'starLegendName',
  distance: 'starLegendDistance',
  type: 'starLegendType',
  weather: 'starLegendWeatherProb',
  precipitationType: 'starLegendPrecipitationType',
  fuel: 'starLegendFuel',
  ascendencyPoints: 'starLegendAscendencyPoints'
};

// Studying stars out to a usable range, and redrawing the map, is not quick.
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

/** Draw the star map once, which is what populates the star data object. */
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

/** Reach a run with stars studied and antimatter to spend. */
async function prepareTableRun(game) {
  await game.prepareRunForStarshipLaunch();
  await game.page.waitForTimeout(800);
  await game.withMods((m) => {
    m.rdo.setResourceDataObject(1e15, 'antimatter', ['storageCapacity']);
    m.rdo.setResourceDataObject(1e9, 'antimatter', ['quantity']);
  });
  await game.page.waitForTimeout(400);
}

/**
 * Every row the table is showing, in display order, with what P4 added.
 *
 * `.option-row` matters: `createOptionRow` gives a row's flavour container the
 * row id with `Description` appended, so a bare id-prefix selector matches each
 * star twice and doubles every index.
 */
async function starRows(page) {
  return page.evaluate(() => Array.from(document.querySelectorAll('.option-row[id^="starRow_"]')).map((row) => {
    const globe = row.querySelector('.star-target-button');
    const label = row.querySelector('.label-container');
    return {
      id: row.id,
      name: row.id.replace('starRow_', ''),
      labelText: (label?.textContent ?? '').trim(),
      hasGlobe: Boolean(globe),
      globeClasses: globe ? Array.from(globe.classList) : [],
      globeTitle: globe?.title ?? '',
      globeStar: globe?.dataset.star ?? '',
      globeSvgs: globe ? globe.querySelectorAll('svg').length : 0
    };
  }));
}

/** Press one legend header and let the table redraw. */
async function sortBy(game, method) {
  const pressed = await game.page.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el) return false;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, LEGEND_IDS[method]);
  if (!pressed) throw new Error(`No legend header with id ${LEGEND_IDS[method]}`);
  await game.page.waitForTimeout(600);
}

/** The stars the table can list, as the data object holds them. */
async function listableStars(game) {
  return game.withMods((m) => {
    const stars = m.rdo.getStarSystemDataObject('stars') || {};
    const current = String(m.cg.getCurrentStarSystem() || '').toLowerCase();
    const settled = new Set((m.cg.getSettledStars() || []).map((n) => String(n).toLowerCase()));
    return Object.entries(stars)
      .filter(([key, data]) => key !== 'destinationStar' && key !== current && data && typeof data === 'object')
      .map(([key, data]) => ({ key, name: String(data.name ?? key), settled: settled.has(key) }));
  });
}

/** Click one row's globe, the way a player would. */
async function pressGlobe(game, starKey) {
  const pressed = await game.page.evaluate((key) => {
    const row = document.getElementById(`starRow_${key}`);
    const globe = row?.querySelector('.star-target-button');
    if (!globe) return false;
    globe.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, starKey);
  if (!pressed) throw new Error(`No globe button on the row for ${starKey}`);
  await game.page.waitForTimeout(900);
  return pressed;
}

/** A star the table lists that is neither settled nor the home star. */
function pickTravelCandidate(stars) {
  return stars.find((s) => !s.settled && s.key !== 'miaplacidus') ?? null;
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

/** What the name column of one row actually contains, in painting order. */
async function labelColumn(page, starKey) {
  return page.evaluate((key) => {
    const label = document.getElementById(`starRow_${key}`)?.querySelector('.label-container');
    if (!label) return null;
    return {
      classes: Array.from(label.classList),
      children: Array.from(label.children).map((el) => ({
        tag: el.tagName.toLowerCase(),
        classes: Array.from(el.classList)
      })),
      megaIconIndex: Array.from(label.querySelectorAll('*'))
        .findIndex((el) => el.classList.contains('star-data-mega-icon')),
      globeIndex: Array.from(label.querySelectorAll('*'))
        .findIndex((el) => el.classList.contains('star-target-button'))
    };
  }, starKey);
}

// ============================================================ the Name column

test.describe('Star Data — the Name column', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareTableRun(game);
    await populateStarData(game);
    await openStarData(game);
  });

  test('the leftmost header is the star name, and it is a sort control', async ({ game }) => {
    const header = await game.page.evaluate(() => {
      const el = document.getElementById('starLegendName');
      if (!el) return null;
      // The header holds the word and the info icon, so the icon is taken out
      // before the word is read rather than trusting `textContent`.
      const copy = el.cloneNode(true);
      copy.querySelectorAll('.info-emoji').forEach((icon) => icon.remove());
      const word = (copy.textContent ?? '').trim();
      return {
        word,
        classes: Array.from(el.classList),
        inLabel: Boolean(el.closest('#starLegendRow .label-container'))
      };
    });

    expect(header, 'the legend should carry a Name header').toBeTruthy();
    expect(header.inLabel, 'and it should sit in the name column, not among the six values').toBe(true);

    const expected = await game.withMods((m) => m.loc.localize('textStarName', m.cg.getLanguage()));
    expect(header.word, 'labelled in the language the player chose').toBe(expected);

    const stale = await game.withMods((m) => m.loc.localize('tab6SortByRowLabel', m.cg.getLanguage()));
    expect(header.word, 'and no longer the old "Sort By" caption').not.toBe(stale);
  });

  test('pressing Name sorts the stars alphabetically', async ({ game }) => {
    await sortBy(game, 'name');

    expect(await game.withMods((m) => m.cg.getSortStarMethod()), 'the choice is remembered')
      .toBe('name');

    const settled = new Set((await game.withMods((m) => m.cg.getSettledStars()))
      .map((n) => String(n).toLowerCase()));
    const rows = await starRows(game.page);
    const unsettled = rows.filter((row) => !settled.has(row.name.toLowerCase())).map((row) => row.name);

    expect(unsettled.length, 'there should be several rows to order').toBeGreaterThan(1);

    const sorted = [...unsettled].sort((a, b) => a.localeCompare(b));
    expect(unsettled, 'the rows should be in alphabetical order').toEqual(sorted);
  });

  test('Name takes the sort marker from the column that had it, and gives it back', async ({ game }) => {
    // Distance is the default, so the marker starts there and has somewhere to
    // return to — which is the half a comparator-only change would miss.
    const markers = async () => game.page.evaluate((ids) => Object.fromEntries(
      Object.entries(ids).map(([key, id]) => {
        const el = document.getElementById(id);
        return [key, {
          present: Boolean(el),
          sortBy: !!el?.classList.contains('sort-by'),
          noSort: !!el?.classList.contains('no-sort')
        }];
      })
    ), LEGEND_IDS);

    await sortBy(game, 'name');
    const onName = await markers();
    expect(onName.name.sortBy, 'Name should be the active sort').toBe(true);
    for (const other of Object.keys(LEGEND_IDS)) {
      if (other === 'name') continue;
      expect(onName[other].present, `${other} should still be in the legend`).toBe(true);
      expect(onName[other].noSort, `${other} should be marked as not sorting`).toBe(true);
    }

    await sortBy(game, 'distance');
    const onDistance = await markers();
    expect(onDistance.distance.sortBy, 'distance should take the marker back').toBe(true);
    expect(onDistance.name.sortBy, 'and Name should give it up').toBe(false);
    expect(onDistance.name.noSort, 'and be marked as not sorting').toBe(true);
  });

  test('sorting by name does not change which stars are listed', async ({ game }) => {
    const before = (await starRows(game.page)).map((row) => row.name).sort();
    await sortBy(game, 'name');
    const after = (await starRows(game.page)).map((row) => row.name).sort();

    expect(after, 'the same stars, in a different order').toEqual(before);
  });

  test('the header carries a tip explaining both things this column now does', async ({ game }) => {
    const icon = await game.page.evaluate(() => {
      const el = document.getElementById('info_starLegendName');
      if (!el) return null;
      return {
        insideHeader: Boolean(el.closest('#starLegendName')),
        isInfoEmoji: el.classList.contains('info-emoji'),
        // `setupInfoTooltips` marks each icon it has bound to the shared tooltip.
        bound: el.dataset.sharedTooltipAttached === 'true'
      };
    });

    expect(icon, 'the Name header should carry an info icon').toBeTruthy();
    expect(icon.insideHeader, 'sitting in the header beside the word').toBe(true);
    expect(icon.isInfoEmoji, 'drawn as the info icon the other headers use').toBe(true);
    expect(icon.bound, 'and wired to the shared tooltip').toBe(true);

    // The tip has to name both halves, because a globe glyph explains neither.
    const tip = await game.withMods((m) => m.desc.infoTooltipDescriptions.info_starLegendName);
    const expected = await game.withMods((m) =>
      m.loc.localize('infoTooltipStarLegendName', m.cg.getLanguage()));
    expect(tip, 'the registered tip is the localized one').toBe(expected);
    expect(tip.length, 'and it says something').toBeGreaterThan(0);
  });

  test('reading the tip does not re-sort the table under the player', async ({ game }) => {
    await sortBy(game, 'distance');
    const before = (await starRows(game.page)).map((row) => row.name);

    await game.page.evaluate(() => {
      document.getElementById('info_starLegendName')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(500);

    expect(await game.withMods((m) => m.cg.getSortStarMethod()), 'the sort is unchanged')
      .toBe('distance');
    expect((await starRows(game.page)).map((row) => row.name), 'and so is the order')
      .toEqual(before);
  });
});

// ========================================================== the globe button

test.describe('Star Data — showing a star on the map from its row', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareTableRun(game);
    await populateStarData(game);
    await openStarData(game);
  });

  test('every star still worth travelling to carries a globe', async ({ game }) => {
    const rows = await starRows(game.page);
    const settled = new Set((await game.withMods((m) => m.cg.getSettledStars()))
      .map((n) => String(n).toLowerCase()));

    expect(rows.length, 'the table has rows in it').toBeGreaterThan(0);

    const unsettled = rows.filter((row) => !settled.has(row.name.toLowerCase()));
    expect(unsettled.length, 'and unsettled ones among them').toBeGreaterThan(0);

    for (const row of unsettled) {
      expect(row.hasGlobe, `${row.name} should offer a globe`).toBe(true);
      expect(row.globeSvgs, `${row.name}'s globe should be drawn once`).toBe(1);
      expect(row.globeStar, `${row.name}'s globe should know its own star`).toBe(row.name);
    }

    for (const row of rows.filter((r) => settled.has(r.name.toLowerCase()))) {
      expect(row.hasGlobe, `${row.name} is settled and should not offer a globe`).toBe(false);
    }
  });

  test('the globe leads the name, and reads as something to press', async ({ game }) => {
    const target = pickTravelCandidate(await listableStars(game));
    const column = await labelColumn(game.page, target.key);

    expect(column, 'the row should have a name column').toBeTruthy();
    expect(column.children[0]?.classes, 'the globe comes first in the column')
      .toContain('star-target-button');

    // The name column is a fixed fraction of the row and a long star name
    // overflows it, so a trailing globe is painted over by the value cells that
    // follow. At the head of the column it is always inside its own box.
    expect(column.globeIndex, 'ahead of everything else in the column').toBe(0);

    const style = await game.page.evaluate((key) => {
      const globe = document.getElementById(`starRow_${key}`)?.querySelector('.star-target-button');
      // Resolve `--ready-text` through the same theme the globe is painted by,
      // so the two are compared as the browser's own rgb() strings.
      const probe = document.createElement('span');
      probe.style.color = 'var(--ready-text)';
      globe.parentElement.appendChild(probe);
      const readyText = getComputedStyle(probe).color;
      probe.remove();

      const computed = getComputedStyle(globe);
      return { color: computed.color, readyText, filter: computed.filter };
    }, target.key);

    // The game hides the real cursor behind a custom pointer, so the glow is the
    // only affordance available: it has to be there.
    expect(style.filter, 'the globe glows the way a live control does').toContain('drop-shadow');
    expect(style.color, 'in the ready colour').toBe(style.readyText);
  });

  test('a megastructure star keeps its icon, on the far side of the globe', async ({ game }) => {
    const revealed = await revealAFactoryStar(game);
    test.skip(!revealed, 'no megastructure star was reported in this run');

    await populateStarData(game);
    await openStarData(game);

    const column = await labelColumn(game.page, revealed.revealed);
    expect(column, `${revealed.revealed} should be in the table`).toBeTruthy();
    expect(column.globeIndex, 'the globe still leads the column').toBe(0);
    expect(column.megaIconIndex, 'and the megastructure icon is still drawn')
      .toBeGreaterThan(-1);
    expect(column.megaIconIndex, 'to the right of the globe, after the name')
      .toBeGreaterThan(column.globeIndex);

    // And it still works: the icon is inside the label, the globe is not, so a
    // change to either must not swallow the other.
    await pressGlobe(game, revealed.revealed);
    expect(String(await game.withMods((m) => m.cg.getCurrentOptionPane())).toLowerCase())
      .toBe('star map');
  });

  test('no star name in the column is written with a trailing colon', async ({ game }) => {
    const rows = await starRows(game.page);
    expect(rows.length, 'there should be names to read').toBeGreaterThan(0);

    for (const row of rows) {
      expect(row.labelText, `${row.name} should not be punctuated`).not.toContain(':');
    }
  });

  test('the globe works on a star the run cannot yet fuel', async ({ game }) => {
    // The star's own colour class is put on the whole name column by
    // `createOptionRow`, and for an unaffordable star that class is
    // `red-disabled-text` — `pointer-events: none`. Without the button opting
    // back in, every globe is dead early in a run, which is exactly when a player
    // is deciding where to go. Affordability is the Travel button's gate, not
    // this one's.
    await game.withMods((m) => m.rdo.setResourceDataObject(0, 'antimatter', ['quantity']));
    await openStarData(game);

    const target = pickTravelCandidate(await listableStars(game));
    const column = await labelColumn(game.page, target.key);
    expect(column.classes, 'the column should be marked unaffordable')
      .toContain('red-disabled-text');

    const pointerEvents = await game.page.evaluate((key) => {
      const globe = document.getElementById(`starRow_${key}`)?.querySelector('.star-target-button');
      return globe ? getComputedStyle(globe).pointerEvents : null;
    }, target.key);
    expect(pointerEvents, 'but the globe must still take a click').not.toBe('none');

    await pressGlobe(game, target.key);
    expect(String(await game.withMods((m) => m.cg.getCurrentOptionPane())).toLowerCase(),
      'and still opens the map').toBe('star map');
    expect(await game.page.evaluate(() =>
      document.querySelectorAll('.star-map-search-selection-ping').length),
    'and still pings the star').toBeGreaterThan(0);
  });

  test('the globe says what it does, in the language the player chose', async ({ game }) => {
    const expected = await game.withMods((m) => m.loc.localize('tooltipShowStarOnMap', m.cg.getLanguage()));
    const rows = (await starRows(game.page)).filter((row) => row.hasGlobe);

    expect(rows.length, 'there should be globes to inspect').toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.globeTitle, `${row.name}'s globe tooltip`).toBe(expected);
    }
  });

  test('pressing the globe opens the map in normal mode and pings the star', async ({ game }) => {
    const target = pickTravelCandidate(await listableStars(game));
    expect(target, 'a star to show').toBeTruthy();

    // Leave the map in a mode that cannot place a ping, so that arriving in
    // `normal` is something the button did rather than something it inherited.
    await game.withMods((m) => m.cg.setStarMapMode('studied'));

    await pressGlobe(game, target.key);

    const state = await game.withMods((m) => ({
      pane: m.cg.getCurrentOptionPane(),
      mode: m.cg.getStarMapMode()
    }));

    expect(String(state.pane).toLowerCase(), 'the player is taken to the star map').toBe('star map');
    expect(String(state.mode).toLowerCase(), 'in normal mode').toBe('normal');

    const drawn = await game.page.evaluate(() =>
      Boolean(document.querySelector('#optionContentTab5 [id]')));
    expect(drawn, 'and the starfield actually drawn').toBe(true);

    const ping = await game.page.evaluate((name) => {
      const pings = Array.from(document.querySelectorAll('.star-map-search-selection-ping'));
      const star = document.getElementById(name);
      if (!pings.length || !star) return null;
      const rect = star.getBoundingClientRect();
      const placed = pings.map((el) => ({
        left: parseFloat(el.style.left),
        top: parseFloat(el.style.top)
      }));
      return {
        count: pings.length,
        onStar: placed.some((p) =>
          Math.abs(p.left - (rect.left + rect.width / 2)) < 2 &&
          Math.abs(p.top - (rect.top + rect.height / 2)) < 2)
      };
    }, await game.withMods((m, key) => m.util.capitaliseWordsWithRomanNumerals(key), target.key));

    expect(ping, 'the star should be on the map to ping').toBeTruthy();
    expect(ping.count, 'and the star pinged, the way the search pings it').toBeGreaterThan(0);
    expect(ping.onStar, 'over that star and not some other speck').toBe(true);
  });

  test('the globe shows a star without choosing it', async ({ game }) => {
    // The obvious implementation reuses the search box wholesale, and the search
    // box *selects*: it clicks the star, which draws the connection line, builds
    // the destination row and calls setDestinationStar. Pressing a globe must do
    // none of that — a player looking up where a star is has not asked to change
    // where they are going.
    const stars = await listableStars(game);
    const chosen = pickTravelCandidate(stars);
    const looked = stars.find((s) => !s.settled && s.key !== chosen.key && s.key !== 'miaplacidus');
    expect(chosen && looked, 'two stars to tell apart').toBeTruthy();

    await game.withMods((m, key) => m.cg.setDestinationStar(key), chosen.key);
    await openStarData(game);
    await pressGlobe(game, looked.key);

    expect(String(await game.withMods((m) => m.cg.getDestinationStar())).toLowerCase(),
      'the destination is the one the player already picked').toBe(chosen.key.toLowerCase());

    const drewALine = await game.page.evaluate(() =>
      Boolean(document.getElementById('starDestinationButton')));
    expect(drewALine, 'and no destination row was built for the star merely looked at').toBe(false);
  });

  test('the ping clears itself rather than piling up', async ({ game }) => {
    const target = pickTravelCandidate(await listableStars(game));
    await pressGlobe(game, target.key);

    expect(await game.page.evaluate(() =>
      document.querySelectorAll('.star-map-search-selection-ping').length)).toBeGreaterThan(0);

    // The ping removes itself after 4.1 seconds.
    await game.page.waitForTimeout(4600);
    expect(await game.page.evaluate(() =>
      document.querySelectorAll('.star-map-search-selection-ping').length),
    'the ping is temporary').toBe(0);
  });

  test('the globe pings exactly where the search box pings', async ({ game }) => {
    // The ping is the one thing the two entry points share, so it is the one
    // thing worth comparing directly. Both are asked for the same star and the
    // marks must land in the same place.
    const target = pickTravelCandidate(await listableStars(game));
    const displayName = await game.withMods((m, key) =>
      m.util.capitaliseWordsWithRomanNumerals(key), target.key);

    const readPing = () => game.page.evaluate(() => {
      const el = document.querySelector('.star-map-search-selection-ping');
      return el ? { left: el.style.left, top: el.style.top, classes: Array.from(el.classList) } : null;
    });

    await pressGlobe(game, target.key);
    const viaGlobe = await readPing();
    expect(viaGlobe, 'the globe should drop a ping').toBeTruthy();

    await game.page.waitForTimeout(4600); // let it clear so the next one is unambiguous

    await game.page.evaluate((name) => {
      const input = document.getElementById('starMapSearchInput');
      input.value = name.slice(0, 4);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, displayName);
    await game.page.waitForTimeout(400);
    const chosen = await game.page.evaluate((name) => {
      const item = Array.from(document.querySelectorAll('.star-map-search-item'))
        .find((el) => el.textContent.trim() === name);
      if (!item) return false;
      item.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      return true;
    }, displayName);
    expect(chosen, `${displayName} should be in the search results`).toBe(true);
    await game.page.waitForTimeout(600);

    const viaSearch = await readPing();
    expect(viaSearch, 'and so should the search').toBeTruthy();
    expect(viaGlobe, 'the same mark, in the same place').toEqual(viaSearch);
  });

  test('leaving the star map takes the ping with it', async ({ game }) => {
    // The mark lives on `document.body` in viewport coordinates, so nothing about
    // the map going away removes it on its own. It runs for four seconds, which is
    // long enough to still be flashing over another pane entirely.
    const target = pickTravelCandidate(await listableStars(game));
    await pressGlobe(game, target.key);

    expect(await game.page.evaluate(() =>
      document.querySelectorAll('.star-map-search-selection-ping').length),
    'the ping is up').toBeGreaterThan(0);

    await openStarData(game);

    expect(await game.page.evaluate(() =>
      document.querySelectorAll('.star-map-search-selection-ping').length),
    'and gone the moment the player leaves the map').toBe(0);
  });

  test('changing map mode takes the ping with it', async ({ game }) => {
    // Two of the four modes do not draw every star, and all four throw the field
    // away and rebuild it, so a mark left behind points at nothing.
    const target = pickTravelCandidate(await listableStars(game));
    await pressGlobe(game, target.key);
    expect(await game.page.evaluate(() =>
      document.querySelectorAll('.star-map-search-selection-ping').length)).toBeGreaterThan(0);

    const label = await game.withMods((m) => m.loc.localize('starMapModeStudied', m.cg.getLanguage()));
    await game.page.evaluate((text) => {
      Array.from(document.querySelectorAll('.star-option-button'))
        .find((b) => (b.textContent || '').trim() === text)
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }, label);
    await game.page.waitForTimeout(700);

    expect(await game.page.evaluate(() =>
      document.querySelectorAll('.star-map-search-selection-ping').length),
    'the mark does not outlive the field it was drawn over').toBe(0);
  });

  test('a star the map is not drawing is reported, not silently ignored', async ({ game }) => {
    // A star the table lists but the seeded field never drew has no element to
    // click. The globe must say so rather than navigate to nothing, which is the
    // same thing the search box does with a name it cannot place.
    const ghost = 'notarealstarname';
    await game.withMods((m, name) => {
      m.rdo.setStarSystemDataObject({
        name,
        distance: 12,
        fuel: 1,
        ascendencyPoints: 1,
        starType: 'G',
        weatherTendency: ['☀', 50, 'green-ready-text'],
        weather: null,
        precipitationType: 'Water'
      }, 'stars', [name]);
    }, ghost);

    await openStarData(game);
    await pressGlobe(game, ghost);

    const messages = await game.notifications();
    expect(messages.join(' | ').toLowerCase(), 'the player is told the star is not on the map')
      .toContain(ghost);
  });
});

// ================================================== the star ship in flight

test.describe('Star Data — showing a star while the star ship is in flight', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareTableRun(game);
    await populateStarData(game);
  });

  test('a ship in flight is no reason not to look at a star', async ({ game }) => {
    // The map refuses to *retarget* mid-flight, and reusing its click handler
    // would have made the globe inherit that refusal. It does not need to: it
    // only shows the player where a star is, which is safe at any moment, and is
    // arguably most useful while the ship is already on its way somewhere.
    const stars = await listableStars(game);
    const enRoute = pickTravelCandidate(stars);
    const looked = stars.find((s) => !s.settled && s.key !== enRoute.key && s.key !== 'miaplacidus');
    expect(enRoute && looked, 'two stars to tell apart').toBeTruthy();

    await game.withMods((m, key) => m.cg.setDestinationStar(key), enRoute.key);
    const travelling = await game.withMods((m) => {
      m.cg.setStarShipTravelling(true);
      return m.cg.getStarShipTravelling();
    });
    expect(travelling, 'the ship is in flight').toBe(true);

    try {
      await openStarData(game);

      const row = (await starRows(game.page)).find((r) => r.name === looked.key);
      expect(row?.hasGlobe, 'the globe is drawn as usual').toBe(true);
      expect(row.globeClasses, 'and is not marked as disabled')
        .not.toContain('red-disabled-text');

      await pressGlobe(game, looked.key);

      expect(String(await game.withMods((m) => m.cg.getCurrentOptionPane())).toLowerCase(),
        'pressing it opens the map as it always does').toBe('star map');
      expect(await game.page.evaluate(() =>
        document.querySelectorAll('.star-map-search-selection-ping').length),
      'and pings the star that was asked for').toBeGreaterThan(0);
      expect(String(await game.withMods((m) => m.cg.getDestinationStar())).toLowerCase(),
        'while the trip already under way is untouched').toBe(enRoute.key.toLowerCase());
    } finally {
      await game.withMods((m) => m.cg.setStarShipTravelling(false));
    }
  });
});
