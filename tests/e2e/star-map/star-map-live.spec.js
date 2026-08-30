/**
 * Area: Star Map — the field, the modes, the search, the lines and the travel gate
 * Plan: tests/docs/areas/star-map.md
 *
 * `star-data-weather.spec.js` covers what a star *records*. This file covers the
 * map itself: what gets drawn, what it is drawn like, and what a click on it does.
 *
 * ## The map is a pure function of a constant seed
 *
 * `generateStarfield` places every star with `getSeededRandomInRange(seed + i, …)`
 * over `STAR_FIELD_SEED = 80` and `NUMBER_OF_STARS = 100`, and it takes the names
 * from a fresh copy of the name table each call. That makes the field
 * **reproducible**: the same star is in the same place on every draw, in every
 * run, forever. Several specs below lean on that — a map that quietly re-rolled
 * would move a player's studied stars around between visits, and the first spec
 * is there to catch exactly that.
 *
 * Distances are 3D — `sqrt(dx² + dy² + dz²) / 1000`, with z drawn from a 10..100000
 * range — so two stars that look adjacent on screen can be far apart, and the
 * distance is what everything downstream (fuel, AP, whether a star is "studied")
 * is computed from.
 *
 * ## What decides how a star is drawn
 *
 * In order of precedence, from `generateStarfield`:
 *
 *   Miaplacidus       `home-star`, or `home-star-accessible` at milestone 4
 *   revealed factory  `factory-star`, and tagged in its title
 *   settled           id `settledStar<Name>`, class `settled-star`
 *   in study range    class `star`, plus `o-star` for an O-type
 *   out of range      id `noneInterestingStar<Name>`, class `star-uninteresting`
 *
 * and an *unrevealed* factory star is not appended to the map at all.
 *
 * ## Four modes, and they draw differently
 *
 *   normal     every star visible, no recolouring
 *   distance   every star tinted white → red by how far it is
 *   in range   only reachable stars shown, tinted by whether the antimatter covers the fuel
 *   studied    only studied stars shown
 *
 * The search box is deliberately live only in `normal` and `distance`, and says so
 * in the other two.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** The map's fixed shape, from constantsAndGlobalVars. */
const NUMBER_OF_STARS = 100;

/** Every map mode, in the order the buttons are built. */
const MAP_MODES = ['normal', 'distance', 'studied', 'in range'];

/** The modes in which the search box is live. */
const SEARCHABLE_MODES = ['normal', 'distance'];

// Drawing the map repeatedly, and studying stars out to a usable range, is not
// quick.
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

/**
 * Draw the Star Map pane, from the Interstellar tab.
 *
 * The tab is selected by its `data-name` rather than by `#tab5`, because several
 * frame-loop gates test `getCurrentTab()[1].includes('Interstellar')` — the orbit
 * circle is one of them — and the tab order is rearranged at runtime by
 * `checkOrderOfTabs`. Opening the pane without the tab behind it leaves those
 * gates shut and the drawings they own missing.
 */
async function openInterstellarTab(game) {
  const clicked = await game.page.evaluate(() => {
    const tab = document.querySelector('[data-name="Interstellar"]');
    if (!tab) return false;
    tab.classList.remove('tab-not-yet');
    tab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  });
  if (!clicked) throw new Error('No Interstellar tab in the tab bar');
  await game.page.waitForTimeout(500);

  const current = await game.withMods((m) => m.cg.getCurrentTab());
  if (!String(current?.[1] ?? '').includes('Interstellar')) {
    throw new Error(`Interstellar tab did not take: current tab is ${JSON.stringify(current)}`);
  }
}

/** Draw the Star Map pane. */
async function openStarMap(game) {
  await openInterstellarTab(game);
  const opened = await openOptionById(game, 'starMapOption');
  if (!opened) throw new Error('The Star Map row was not in the side menu');
  await game.page.waitForTimeout(600);
}

/** Press one of the four map-mode buttons by its localized label. */
async function pressMapMode(game, mode) {
  const label = await game.withMods((m, key) => m.loc.localize(key, m.cg.getLanguage()), {
    normal: 'starMapModeNormal',
    distance: 'starMapModeDistance',
    studied: 'starMapModeStudied',
    'in range': 'starMapModeInRange'
  }[mode]);

  const pressed = await game.page.evaluate((text) => {
    const button = Array.from(document.querySelectorAll('.star-option-button'))
      .find((b) => (b.textContent || '').trim() === text);
    if (!button) return false;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, label);
  if (!pressed) throw new Error(`No map-mode button labelled "${label}"`);
  await game.page.waitForTimeout(900);
  return label;
}

/** Every star element the map is currently showing. */
async function drawnStars(page) {
  return page.evaluate(() => Array.from(document.querySelectorAll('#optionContentTab5 > div')).map((el) => ({
    id: el.id,
    classes: Array.from(el.classList),
    left: el.style.left,
    top: el.style.top,
    width: el.style.width,
    height: el.style.height,
    background: el.style.backgroundColor,
    invisible: el.classList.contains('invisible'),
    title: el.getAttribute('titler')
  })));
}

/** The distance the map computes from the current system to every star. */
async function starDistances(game) {
  return game.withMods((m) =>
    m.ui.getStarDataAndDistancesToAllStarsFromSettledStar(m.cg.getCurrentStarSystem()).starDistanceData);
}

/** Reach a run with a starship, techs, antimatter and a handful of stars studied. */
async function prepareMapRun(game) {
  await game.prepareRunForStarshipLaunch();
  await game.page.waitForTimeout(800);
  await game.withMods((m) => {
    m.cg.setStarShipBuilt(true);
    m.cg.setStarShipTravelling(false);
    m.cg.setStarShipStatus(['readyForTravel', null]);
    m.rdo.setResourceDataObject(1e15, 'antimatter', ['storageCapacity']);
  });
}

/**
 * Study far enough out that a good number of stars are in range.
 *
 * `extendStarDataRange` is the same call the telescope's completed study makes;
 * it is used here rather than running five-minute studies for their own sake.
 */
async function studyOutTo(game, lightYears) {
  await game.withMods((m, target) => {
    m.cg.setStarVisionDistance(target);
  }, lightYears);
}

/** The name of a star that is inside the current study range, with its data. */
async function pickStudiedStar(game) {
  return game.withMods((m) => {
    const stars = m.rdo.getStarSystemDataObject('stars') || {};
    const current = String(m.cg.getCurrentStarSystem() || '').toLowerCase();
    const settled = new Set((m.cg.getSettledStars() || []).map((n) => String(n).toLowerCase()));
    const factory = new Set((m.cg.getFactoryStarsArray() || []).map((n) => String(n).toLowerCase()));
    const entry = Object.entries(stars).find(([name, data]) =>
      name !== 'destinationStar'
      && name !== current
      && name !== 'miaplacidus'
      && !settled.has(name)
      && !factory.has(name)
      && data && typeof data.fuel === 'number' && Number.isFinite(data.fuel));
    if (!entry) return null;
    return { name: entry[0], fuel: entry[1].fuel, distance: entry[1].distance, ascendencyPoints: entry[1].ascendencyPoints };
  });
}

/**
 * The display form of a star's data key.
 *
 * Star data is keyed lower case and the map draws ids in the game's own display
 * capitalisation, which handles multi-word names ("Kaus Australis") and roman
 * numerals. Capitalising only the first letter would miss both, so the game's own
 * helper is used.
 */
async function displayName(game, starName) {
  return game.withMods((m, name) => m.util.capitaliseWordsWithRomanNumerals(name), starName);
}

/** Click a star on the map by its data name. */
async function clickStar(game, starName) {
  const capitalised = await displayName(game, starName);
  const clicked = await game.page.evaluate((name) => {
    const candidates = [name, `settledStar${name}`, `noneInterestingStar${name}`];
    for (const id of candidates) {
      const el = document.getElementById(id);
      if (el) {
        el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        return id;
      }
    }
    return null;
  }, capitalised);
  await game.page.waitForTimeout(600);
  return clicked;
}

/** The connection drawings currently on screen. */
async function connectionDrawings(page) {
  return page.evaluate(() => {
    const line = document.getElementById('star-connection-line');
    const label = document.getElementById('star-connection-label');
    const arrow = document.getElementById('arrowheadStarship');
    const orbit = document.getElementById('orbit-circle');
    return {
      line: line ? {
        width: parseFloat(line.style.width),
        transform: line.style.transform,
        left: parseFloat(line.style.left),
        top: parseFloat(line.style.top),
        borderTop: line.style.borderTop,
        background: line.style.background
      } : null,
      label: label ? { text: label.textContent.trim(), colour: label.style.color, left: parseFloat(label.style.left), top: parseFloat(label.style.top) } : null,
      arrow: arrow ? { left: parseFloat(arrow.style.left), top: parseFloat(arrow.style.top), transform: arrow.style.transform } : null,
      orbit: orbit ? { left: parseFloat(orbit.style.left), top: parseFloat(orbit.style.top), width: parseFloat(orbit.style.width) } : null
    };
  });
}

// =========================================================== the seeded field

test.describe('Star Map — the seeded starfield', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareMapRun(game);
    await openStarMap(game);
  });

  test('the map draws the whole galaxy, and the current system among it', async ({ game }) => {
    const stars = await drawnStars(game.page);
    const current = await game.withMods((m) => m.cg.getCurrentStarSystem());

    // Unrevealed megastructure stars are deliberately withheld, so the count is
    // at most the full field rather than exactly it.
    expect(stars.length).toBeGreaterThan(NUMBER_OF_STARS - 6);
    expect(stars.length).toBeLessThanOrEqual(NUMBER_OF_STARS);

    const currentElement = stars.find((s) => s.classes.includes('current-star'));
    expect(currentElement, 'the current system is marked on the map').toBeTruthy();
    expect(currentElement.id.toLowerCase(), 'and it is the system the run is in')
      .toBe(String(current).toLowerCase());
  });

  test('the same seed puts every star in the same place on every draw', async ({ game }) => {
    const fingerprint = (stars) => stars
      .map((s) => `${s.id}@${s.left},${s.top}:${s.width}x${s.height}`)
      .sort()
      .join('|');

    const first = fingerprint(await drawnStars(game.page));

    for (let redraw = 0; redraw < 3; redraw++) {
      await openOptionById(game, 'starDataOption');
      await openOptionById(game, 'starMapOption');
    }
    await game.page.waitForTimeout(300);

    const later = fingerprint(await drawnStars(game.page));
    expect(later, 'the starfield is a pure function of its seed').toBe(first);
  });

  test('every drawn star is one the game knows by name', async ({ game }) => {
    const stars = await drawnStars(game.page);
    const known = await game.withMods((m) => m.desc.getStarNames().map((n) => n.toLowerCase()));

    for (const star of stars) {
      const name = star.id.replace(/^settledStar/, '').replace(/^noneInterestingStar/, '').toLowerCase();
      expect(known, `${star.id} is not a star in the name table`).toContain(name);
    }

    const names = stars.map((s) => s.id);
    expect(new Set(names).size, 'and no star is drawn twice').toBe(names.length);
  });

  test('distance is measured in three dimensions from the current system', async ({ game }) => {
    const distances = await starDistances(game);
    const current = await game.withMods((m) => m.cg.getCurrentStarSystem());
    const currentKey = Object.keys(distances).find((k) => k.toLowerCase() === String(current).toLowerCase());

    expect(currentKey, 'the current system is in the distance table').toBeTruthy();
    expect(distances[currentKey], 'and is zero light years from itself').toBe(0);

    const others = Object.entries(distances).filter(([k]) => k !== currentKey);
    expect(others.length).toBeGreaterThan(50);
    for (const [name, distance] of others) {
      expect(Number.isFinite(distance), `${name} distance`).toBe(true);
      expect(distance, `${name} is at the current system`).toBeGreaterThan(0);
    }

    // The z axis spreads stars far beyond the screen, so the field is genuinely
    // three-dimensional rather than a flat plane rendered in pixels.
    const spread = Math.max(...others.map(([, d]) => d)) - Math.min(...others.map(([, d]) => d));
    expect(spread, 'the field has real depth to it').toBeGreaterThan(10);
  });

  test('a star is the same distance away whichever code path asks', async ({ game }) => {
    // A star has exactly one distance. Two code paths compute it:
    //
    //   the drawn map      writes it into the star's record, and it is what the
    //                      fuel and AP the player pays are derived from;
    //   calculationMode    `getStarDataAndDistancesToAllStarsFromSettledStar`,
    //                      which the search colouring, manuscript eligibility,
    //                      rapid expansion and the O-star achievement all read.
    //
    // They have to agree, or a star can be inside the study range for one and
    // outside it for the other. See known-issues.md.
    const distances = await starDistances(game);
    const recorded = await game.withMods((m) => {
      const stars = m.rdo.getStarSystemDataObject('stars') || {};
      return Object.fromEntries(Object.entries(stars)
        .filter(([name, data]) => name !== 'destinationStar' && data && typeof data.distance === 'number')
        .map(([name, data]) => [name, data.distance]));
    });

    const compared = Object.entries(recorded).filter(([name]) =>
      Object.keys(distances).some((k) => k.toLowerCase() === name));
    expect(compared.length, 'there should be studied stars to compare').toBeGreaterThan(0);

    const disagreements = [];
    for (const [name, distance] of compared) {
      const key = Object.keys(distances).find((k) => k.toLowerCase() === name);
      if (Math.abs(distances[key] - distance) > 0.005) {
        disagreements.push(`${name}: record ${distance}, calculation ${distances[key]}`);
      }
    }

    expect(disagreements, 'the two paths disagree about how far these stars are')
      .toEqual([]);
  });
});

// ================================================== how each star is drawn

test.describe('Star Map — how a star is drawn', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareMapRun(game);
  });

  test('a star inside the study range is drawn solid; one outside only twinkles', async ({ game }) => {
    await studyOutTo(game, 0);
    await openStarMap(game);
    const near = await drawnStars(game.page);
    const solidNear = near.filter((s) => s.classes.includes('star')).length;

    await studyOutTo(game, 60);
    await openStarMap(game);
    const far = await drawnStars(game.page);
    const solidFar = far.filter((s) => s.classes.includes('star')).length;

    expect(solidFar, 'studying further makes more stars real').toBeGreaterThan(solidNear);

    const uninteresting = far.filter((s) => s.classes.includes('star-uninteresting'));
    for (const star of uninteresting) {
      expect(star.id, 'an unstudied star carries the unstudied id prefix')
        .toMatch(/^noneInterestingStar/);
      expect(star.classes, 'and is not drawn as a real star').not.toContain('star');
    }
  });

  test('a studied O-type star is marked out from the rest', async ({ game }) => {
    await studyOutTo(game, 100);
    await openStarMap(game);

    const stars = await drawnStars(game.page);
    const oStars = stars.filter((s) => s.classes.includes('o-star'));
    expect(oStars.length, 'the galaxy has O-type stars and some are in range').toBeGreaterThan(0);

    const types = await game.withMods((m, ids) =>
      ids.map((id) => m.desc.getStarTypeByName(id)), oStars.map((s) => s.id));
    for (let i = 0; i < oStars.length; i++) {
      expect(types[i], `${oStars[i].id} is marked as an O-type`).toBe('O');
    }

    // And nothing else is wearing the marker.
    const marked = new Set(oStars.map((s) => s.id.toLowerCase()));
    const wronglyPlain = [];
    const allTypes = await game.withMods((m, ids) =>
      ids.map((id) => m.desc.getStarTypeByName(id.replace(/^settledStar/, '').replace(/^noneInterestingStar/, ''))),
    stars.map((s) => s.id));
    stars.forEach((star, index) => {
      const isInRange = star.classes.includes('star') && !star.classes.includes('settled-star')
        && !star.classes.includes('factory-star') && !star.classes.includes('home-star')
        && !star.classes.includes('home-star-accessible') && !star.classes.includes('current-star');
      if (allTypes[index] === 'O' && isInRange && !marked.has(star.id.toLowerCase())) {
        wronglyPlain.push(star.id);
      }
    });
    expect(wronglyPlain, 'every studied O-type in range should be marked').toEqual([]);
  });

  test('a settled star gets its own id, colour and tag', async ({ game }) => {
    const settled = await game.withMods((m) => {
      const names = m.desc.getStarNames();
      const current = String(m.cg.getCurrentStarSystem() || '').toLowerCase();
      const pick = names.find((n) => n.toLowerCase() !== current && n !== 'Miaplacidus');
      m.cg.setSettledStars(pick);
      return pick;
    });

    await openStarMap(game);
    const stars = await drawnStars(game.page);
    const element = stars.find((s) => s.id === `settledStar${settled}`);

    expect(element, `${settled} should be drawn as a settled star`).toBeTruthy();
    expect(element.classes, 'with the settled colour').toContain('settled-star');

    const tag = await game.withMods((m) => m.loc.localize('textStarTagSettled', m.cg.getLanguage()));
    expect(element.title, 'and its tooltip says so').toContain(tag);
  });

  test('a revealed megastructure star is drawn as one, and an unrevealed one is not drawn at all', async ({ game }) => {
    const revealed = await game.withMods((m) => {
      m.cg.getStarsWithAncientManuscripts().length = 0;
      m.cg.setFactoryStarsArray([], true);
      m.cg.setStarVisionDistance(0);
      for (let i = 0; i < 80 && m.cg.getStarsWithAncientManuscripts().length < 2; i++) {
        m.game.extendStarDataRange(true);
      }
      const entries = m.cg.getStarsWithAncientManuscripts();
      if (entries.length < 2) return null;
      m.cg.activateFactoryStar(entries[0]);
      return { shown: entries[0][1], hidden: entries[1][1] };
    });
    expect(revealed, 'two manuscripts should be reachable in the vision range').toBeTruthy();

    await openStarMap(game);
    const stars = await drawnStars(game.page);
    const byId = new Map(stars.map((s) => [s.id.toLowerCase(), s]));

    const shown = byId.get(revealed.shown.toLowerCase());
    expect(shown, `${revealed.shown} should be on the map`).toBeTruthy();
    expect(shown.classes, 'drawn as a megastructure star').toContain('factory-star');

    const hidden = stars.find((s) => s.id.toLowerCase().includes(revealed.hidden.toLowerCase()));
    expect(hidden, `${revealed.hidden} has no reported manuscript and should not be drawn`)
      .toBeFalsy();
  });

  test('Miaplacidus is drawn in the locked colour and refuses selection', async ({ game }) => {
    await game.withMods((m) => m.cg.setMiaplacidusMilestoneLevel(0));
    await studyOutTo(game, 100);
    await openStarMap(game);

    const home = (await drawnStars(game.page)).find((s) => s.id === 'Miaplacidus');
    expect(home, 'the home star is always on the map').toBeTruthy();
    expect(home.classes, 'and is locked').toContain('home-star');
    expect(home.classes).not.toContain('home-star-accessible');

    await game.page.evaluate(() => {
      document.getElementById('descriptionContentTab5').innerHTML = '';
      document.getElementById('Miaplacidus')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(500);

    const row = await game.page.evaluate(() =>
      Boolean(document.getElementById('starDestinationName')));
    expect(row, 'clicking a locked Miaplacidus does nothing at all').toBe(false);
  });

  test('at the final milestone Miaplacidus turns ready and can be chosen', async ({ game }) => {
    await game.withMods((m) => m.cg.setMiaplacidusMilestoneLevel(4));
    await studyOutTo(game, 100);
    await openStarMap(game);

    const home = (await drawnStars(game.page)).find((s) => s.id === 'Miaplacidus');
    expect(home.classes, 'the home star is unlocked').toContain('home-star-accessible');
    expect(home.classes).not.toContain('home-star');

    await game.page.evaluate(() => {
      document.getElementById('Miaplacidus')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(600);

    const name = await game.page.evaluate(() =>
      document.getElementById('starDestinationName')?.textContent?.trim());
    expect(name, 'and now it can be picked as a destination').toContain('Miaplacidus');
  });
});

// ==================================================================== the modes

test.describe('Star Map — the four modes', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareMapRun(game);
    await studyOutTo(game, 40);
    await openStarMap(game);
  });

  test('pressing a mode lights that button and dims the other three', async ({ game }) => {
    for (const mode of MAP_MODES) {
      const label = await pressMapMode(game, mode);

      const lit = await game.page.evaluate(() =>
        Array.from(document.querySelectorAll('.star-option-button'))
          .filter((b) => b.classList.contains('green-ready-text'))
          .map((b) => (b.textContent || '').trim()));

      expect(lit, `only ${mode} should be lit`).toEqual([label]);
      expect(await game.withMods((m) => m.cg.getStarMapMode()), 'and the mode is stored').toBe(mode);
    }
  });

  test('distance mode tints every star by how far away it is', async ({ game }) => {
    await pressMapMode(game, 'normal');
    const plain = await drawnStars(game.page);
    expect(plain.every((s) => !s.background), 'normal mode does not recolour').toBe(true);

    await pressMapMode(game, 'distance');
    const tinted = await drawnStars(game.page);
    const coloured = tinted.filter((s) => s.background);

    expect(coloured.length, 'distance mode colours the stars it can place').toBeGreaterThan(0);
    // The published ramp is white at zero, through red, yellow and orange at the
    // far end — every tint is a full-red rgb triple.
    for (const star of coloured) {
      expect(star.background, `${star.id} tint`).toMatch(/^rgb\(255,/);
    }

    // Near stars keep more blue than far ones: the ramp drains blue first.
    const distances = await starDistances(game);
    const withDistance = coloured
      .map((s) => ({ ...s, distance: distances[s.id.replace(/^settledStar|^noneInterestingStar/, '')] }))
      .filter((s) => typeof s.distance === 'number');
    const blueOf = (rgb) => Number(rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)?.[3] ?? -1);

    const nearest = withDistance.reduce((a, b) => (a.distance <= b.distance ? a : b));
    const furthest = withDistance.reduce((a, b) => (a.distance >= b.distance ? a : b));
    expect(blueOf(nearest.background), `nearest ${nearest.id} at ${nearest.distance}`)
      .toBeGreaterThan(blueOf(furthest.background));
  });

  test('in-range mode colours stars by whether the antimatter on hand covers the fuel', async ({ game }) => {
    await game.withMods((m) => m.rdo.setResourceDataObject(0, 'antimatter', ['quantity']));
    await pressMapMode(game, 'in range');
    const broke = (await drawnStars(game.page)).filter((s) => s.background);
    expect(broke.length, 'in-range mode colours the studied stars').toBeGreaterThan(0);
    const brokeColours = new Set(broke.map((s) => s.background));

    await game.withMods((m) => m.rdo.setResourceDataObject(1e9, 'antimatter', ['quantity']));
    await pressMapMode(game, 'normal');
    await pressMapMode(game, 'in range');
    const rich = (await drawnStars(game.page)).filter((s) => s.background);
    const richColours = new Set(rich.map((s) => s.background));

    expect(rich.length).toBeGreaterThan(0);
    expect([...richColours][0], 'a run that can afford the trip is coloured differently')
      .not.toBe([...brokeColours][0]);
  });

  test('studied and in-range modes hide the stars out of reach; normal shows them again', async ({ game }) => {
    await pressMapMode(game, 'normal');
    const normal = await drawnStars(game.page);
    const hiddenInNormal = normal.filter((s) => s.classes.includes('star-uninteresting') && s.invisible);
    expect(hiddenInNormal.length, 'normal mode hides nothing').toBe(0);

    for (const mode of ['studied', 'in range']) {
      await pressMapMode(game, mode);
      const stars = await drawnStars(game.page);
      const unstudied = stars.filter((s) => s.classes.includes('star-uninteresting'));
      expect(unstudied.length, `${mode} mode should still have unstudied stars in the DOM`)
        .toBeGreaterThan(0);
      for (const star of unstudied) {
        expect(star.invisible, `${star.id} should be hidden in ${mode} mode`).toBe(true);
      }
    }

    await pressMapMode(game, 'normal');
    const back = await drawnStars(game.page);
    const stillHidden = back.filter((s) => s.classes.includes('star-uninteresting') && s.invisible);
    expect(stillHidden.length, 'returning to normal shows them again').toBe(0);
  });

  test('changing mode clears any connection drawing left on screen', async ({ game }) => {
    const target = await pickStudiedStar(game);
    expect(target, 'a studied star should be available').toBeTruthy();

    await pressMapMode(game, 'normal');
    await clickStar(game, target.name);
    expect((await connectionDrawings(game.page)).line, 'a line is drawn').not.toBeNull();

    await pressMapMode(game, 'distance');
    expect((await connectionDrawings(game.page)).line, 'and cleared on a mode change').toBeNull();
  });
});

// =================================================================== the search

test.describe('Star Map — the search', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareMapRun(game);
    await studyOutTo(game, 40);
    await openStarMap(game);
    await pressMapMode(game, 'normal');
  });

  /** Type into the search box and let it filter. */
  async function search(game, query) {
    await game.page.evaluate((value) => {
      const input = document.getElementById('starMapSearchInput');
      if (!input) return;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, query);
    await game.page.waitForTimeout(400);
    return game.page.evaluate(() => {
      const results = document.getElementById('starMapSearchResults');
      return {
        open: results ? !results.classList.contains('invisible') : false,
        items: Array.from(results?.querySelectorAll('.star-map-search-item') ?? [])
          .map((el) => ({ text: el.textContent.trim(), classes: Array.from(el.classList) }))
      };
    });
  }

  test('one character is not enough; two starts matching', async ({ game }) => {
    const short = await search(game, 'S');
    expect(short.open, 'a single character does not open the list').toBe(false);

    const long = await search(game, 'Si');
    expect(long.open, 'two characters do').toBe(true);
    expect(long.items.length).toBeGreaterThan(0);
    for (const item of long.items) {
      expect(item.text.toLowerCase(), `${item.text} does not match the query`).toContain('si');
    }
  });

  test('a query that matches nothing says so rather than showing an empty list', async ({ game }) => {
    const none = await search(game, 'zzzzq');
    const noMatches = await game.withMods((m) => m.loc.localize('textNoMatches', m.cg.getLanguage()));

    expect(none.open, 'the list still opens').toBe(true);
    expect(none.items.length).toBe(1);
    expect(none.items[0].text, 'to say there is nothing').toBe(noMatches);
    expect(none.items[0].classes).toContain('red-disabled-text');
  });

  test('choosing a result selects that star and pings it on the map', async ({ game }) => {
    const target = await pickStudiedStar(game);
    expect(target).toBeTruthy();
    const capitalised = await displayName(game, target.name);

    await search(game, capitalised.slice(0, 4));
    const chosen = await game.page.evaluate((name) => {
      const item = Array.from(document.querySelectorAll('.star-map-search-item'))
        .find((el) => el.textContent.trim() === name);
      if (!item) return false;
      item.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      return true;
    }, capitalised);
    expect(chosen, `${capitalised} should be in the results`).toBe(true);
    await game.page.waitForTimeout(500);

    const pings = await game.page.evaluate(() =>
      document.querySelectorAll('.star-map-search-selection-ping').length);
    expect(pings, 'the chosen star is pinged').toBeGreaterThan(0);

    const selected = await game.withMods((m) => m.cg.getDestinationStar());
    expect(String(selected).toLowerCase(), 'and it is selected as the destination')
      .toBe(target.name);
  });

  test('the ping clears itself rather than piling up', async ({ game }) => {
    const target = await pickStudiedStar(game);
    const capitalised = await displayName(game, target.name);

    await search(game, capitalised.slice(0, 4));
    await game.page.evaluate((name) => {
      Array.from(document.querySelectorAll('.star-map-search-item'))
        .find((el) => el.textContent.trim() === name)
        ?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }, capitalised);
    await game.page.waitForTimeout(400);
    expect(await game.page.evaluate(() =>
      document.querySelectorAll('.star-map-search-selection-ping').length)).toBeGreaterThan(0);

    // The ping removes itself after 4.1 seconds.
    await game.page.waitForTimeout(4600);
    expect(await game.page.evaluate(() =>
      document.querySelectorAll('.star-map-search-selection-ping').length),
    'the ping is temporary').toBe(0);
  });

  test('the ping does not outlive the map it is drawn over', async ({ game }) => {
    // The mark is a viewport-positioned element on `document.body`, so nothing
    // about the map going away removes it. It repeats for four seconds, which is
    // easily long enough to still be flashing over a pane that has no star map on
    // it at all.
    const target = await pickStudiedStar(game);
    const capitalised = await displayName(game, target.name);

    await search(game, capitalised.slice(0, 4));
    await game.page.evaluate((name) => {
      Array.from(document.querySelectorAll('.star-map-search-item'))
        .find((el) => el.textContent.trim() === name)
        ?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }, capitalised);
    await game.page.waitForTimeout(400);
    expect(await game.page.evaluate(() =>
      document.querySelectorAll('.star-map-search-selection-ping').length),
    'the ping is up').toBeGreaterThan(0);

    await openOptionById(game, 'starDataOption');

    expect(await game.page.evaluate(() =>
      document.querySelectorAll('.star-map-search-selection-ping').length),
    'and is gone the moment the player leaves the map').toBe(0);
  });

  test('the results colour a studied star, an O-type and the home star differently', async ({ game }) => {
    await studyOutTo(game, 100);
    await openStarMap(game);
    await pressMapMode(game, 'normal');

    const oStar = await game.withMods((m) => {
      const names = m.desc.getStarNames();
      return names.find((n) => m.desc.getStarTypeByName(n) === 'O');
    });

    const oResults = await search(game, oStar.slice(0, 4));
    const oItem = oResults.items.find((i) => i.text === oStar);
    expect(oItem, `${oStar} should be searchable`).toBeTruthy();
    expect(oItem.classes, 'an O-type is coloured as one').toContain('o-star-text');

    await game.withMods((m) => m.cg.setMiaplacidusMilestoneLevel(0));
    const homeLocked = await search(game, 'Miap');
    const lockedItem = homeLocked.items.find((i) => i.text === 'Miaplacidus');
    expect(lockedItem, 'the home star is searchable').toBeTruthy();
    expect(lockedItem.classes, 'and is bold').toContain('star-map-search-bold');
    expect(lockedItem.classes, 'and locked').toContain('red-disabled-text');

    await game.withMods((m) => m.cg.setMiaplacidusMilestoneLevel(4));
    const homeOpen = await search(game, 'Miap');
    const openItem = homeOpen.items.find((i) => i.text === 'Miaplacidus');
    expect(openItem.classes, 'unlocked, it is no longer struck out').not.toContain('red-disabled-text');
  });

  test('the search is switched off in the two modes it cannot work in', async ({ game }) => {
    const unavailable = await game.withMods((m) =>
      m.loc.localize('placeholderSearchModeUnavailable', m.cg.getLanguage()));
    const available = await game.withMods((m) =>
      m.loc.localize('placeholderSearchStar', m.cg.getLanguage()));

    for (const mode of MAP_MODES) {
      await pressMapMode(game, mode);
      const state = await game.page.evaluate(() => {
        const row = document.getElementById('starMapSearchRow');
        const text = document.querySelector('#starMapSearchOverlay .star-map-search-overlay-text');
        return {
          pointerEvents: row?.style.pointerEvents,
          disabled: row?.classList.contains('red-disabled-text'),
          overlay: text?.textContent?.trim()
        };
      });

      if (SEARCHABLE_MODES.includes(mode)) {
        expect(state.pointerEvents, `${mode} should allow searching`).toBe('auto');
        expect(state.disabled, `${mode} should not be greyed`).toBe(false);
        expect(state.overlay, `${mode} prompt`).toBe(available);
      } else {
        expect(state.pointerEvents, `${mode} should refuse the pointer`).toBe('none');
        expect(state.disabled, `${mode} should be greyed`).toBe(true);
        expect(state.overlay, `${mode} should say why`).toBe(unavailable);
      }
    }
  });

  test('an unrevealed megastructure star is kept out of the results', async ({ game }) => {
    const hidden = await game.withMods((m) => {
      m.cg.getStarsWithAncientManuscripts().length = 0;
      m.cg.setFactoryStarsArray([], true);
      m.cg.setStarVisionDistance(0);
      for (let i = 0; i < 80 && m.cg.getStarsWithAncientManuscripts().length < 1; i++) {
        m.game.extendStarDataRange(true);
      }
      const entry = m.cg.getStarsWithAncientManuscripts()[0];
      return entry ? entry[1] : null;
    });
    expect(hidden, 'a manuscript should have been generated').toBeTruthy();

    await studyOutTo(game, 100);
    await openStarMap(game);
    await pressMapMode(game, 'normal');

    const capitalised = await displayName(game, hidden);
    const results = await search(game, capitalised.slice(0, 4));
    expect(results.items.map((i) => i.text.toLowerCase()),
      'a megastructure star nobody has reported is not offered').not.toContain(hidden);

    // Once it is reported it becomes searchable, which is what makes the filter
    // a gate rather than a permanent exclusion.
    await game.withMods((m) => m.cg.activateFactoryStar(m.cg.getStarsWithAncientManuscripts()[0]));
    await openStarMap(game);
    await pressMapMode(game, 'normal');
    const afterReveal = await search(game, capitalised.slice(0, 4));
    expect(afterReveal.items.map((i) => i.text.toLowerCase()),
      'once reported it is').toContain(hidden);
  });
});

// ============================================== lines, labels, arrows, orbits

test.describe('Star Map — connection drawings', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareMapRun(game);
    await studyOutTo(game, 40);
    await openStarMap(game);
  });

  test('selecting a studied star draws a line and a label with its real costs', async ({ game }) => {
    const target = await pickStudiedStar(game);
    expect(target).toBeTruthy();

    await game.withMods((m) => m.rdo.setResourceDataObject(1e9, 'antimatter', ['quantity']));
    await clickStar(game, target.name);

    const drawn = await connectionDrawings(game.page);
    expect(drawn.line, 'a line is drawn to the star').not.toBeNull();
    expect(drawn.label, 'and a label with the cost of the trip').not.toBeNull();
    expect(drawn.label.text, `label should carry the ${target.fuel} antimatter cost`)
      .toContain(String(target.fuel));

    const ap = await game.withMods((m, base) =>
      m.game.getAscendencyPointsWithRepeatableBonus(base), target.ascendencyPoints);
    expect(drawn.label.text, 'and the AP the trip is worth').toContain(String(ap));
  });

  test('the line runs between the two stars it connects', async ({ game }) => {
    const target = await pickStudiedStar(game);
    await clickStar(game, target.name);

    const geometry = await game.page.evaluate((capitalised) => {
      const centre = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      };
      const current = document.querySelector('.current-star');
      const to = document.getElementById(capitalised);
      const line = document.getElementById('star-connection-line');
      return {
        from: centre(current),
        to: centre(to),
        width: line ? parseFloat(line.style.width) : null,
        rotation: line ? parseFloat((line.style.transform.match(/rotate\(([-\d.]+)deg\)/) ?? [])[1]) : null,
        left: line ? parseFloat(line.style.left) : null,
        top: line ? parseFloat(line.style.top) : null
      };
    }, await displayName(game, target.name));

    expect(geometry.from, 'the current star is on screen').toBeTruthy();
    expect(geometry.to, 'so is the destination').toBeTruthy();

    const dx = geometry.to.x - geometry.from.x;
    const dy = geometry.to.y - geometry.from.y;
    const expectedLength = Math.sqrt(dx * dx + dy * dy);
    const expectedAngle = Math.atan2(dy, dx) * (180 / Math.PI);

    expect(geometry.width, 'the line is as long as the gap').toBeCloseTo(expectedLength, 0);
    expect(geometry.rotation, 'and points at the destination').toBeCloseTo(expectedAngle, 0);
    expect(geometry.left, 'starting at the current star').toBeCloseTo(geometry.from.x, 0);
    expect(geometry.top).toBeCloseTo(geometry.from.y, 0);
  });

  test('the line and label are coloured by whether the trip is affordable', async ({ game }) => {
    const target = await pickStudiedStar(game);

    await game.withMods((m, fuel) =>
      m.rdo.setResourceDataObject(Math.max(0, fuel - 1), 'antimatter', ['quantity']), target.fuel);
    await clickStar(game, target.name);
    const broke = await connectionDrawings(game.page);

    await game.withMods((m, fuel) =>
      m.rdo.setResourceDataObject(fuel + 1000, 'antimatter', ['quantity']), target.fuel);
    await clickStar(game, target.name);
    const rich = await connectionDrawings(game.page);

    expect(broke.label.colour, 'an unaffordable trip is drawn in the disabled colour')
      .not.toBe(rich.label.colour);
    expect(rich.label.colour, 'and an affordable one is not blank').toBeTruthy();
  });

  test('selecting an unstudied star draws the line with no figures on it', async ({ game }) => {
    const unstudied = await game.page.evaluate(() => {
      const el = document.querySelector('[id^="noneInterestingStar"]');
      if (!el) return null;
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return el.id.replace('noneInterestingStar', '');
    });
    expect(unstudied, 'there should be unstudied stars on the map').toBeTruthy();
    await game.page.waitForTimeout(500);

    const drawn = await connectionDrawings(game.page);
    expect(drawn.line, 'the line is still drawn').not.toBeNull();
    expect(drawn.label.text, 'but the costs are unknown').toContain('???');

    const row = await game.page.evaluate(() => ({
      distance: document.getElementById('starDestinationDistance')?.textContent,
      fuel: document.getElementById('starDestinationFuel')?.textContent
    }));
    expect(row.distance, 'and the destination row says so too').toContain('???');
    expect(row.fuel).toContain('???');
  });

  test('selecting a settled star draws nothing at all', async ({ game }) => {
    const settled = await game.withMods((m) => {
      const stars = m.rdo.getStarSystemDataObject('stars') || {};
      const current = String(m.cg.getCurrentStarSystem() || '').toLowerCase();
      const pick = Object.keys(stars).find((n) => n !== 'destinationStar' && n !== current);
      if (pick) m.cg.setSettledStars(pick);
      return pick;
    });
    expect(settled).toBeTruthy();

    await openStarMap(game);
    await game.page.evaluate(() => {
      document.getElementById('star-connection-line')?.remove();
      document.getElementById('star-connection-label')?.remove();
    });
    await clickStar(game, settled);

    const drawn = await connectionDrawings(game.page);
    expect(drawn.line, 'a settled star is not a destination').toBeNull();
    expect(drawn.label).toBeNull();
  });

  test('a travelling starship draws a dashed line and an arrowhead that moves along it', async ({ game }) => {
    const target = await pickStudiedStar(game);
    await clickStar(game, target.name);

    const readArrowAt = async (position) => {
      await game.withMods((m, config) => {
        m.cg.setStarShipTravelling(true);
        m.cg.setStarShipStatus(['travelling', config.name]);
        m.cg.setDestinationStar(config.name);
        m.cg.setStarShipArrowPosition(config.position);
        m.ui.drawStarConnectionDrawings(m.cg.getCurrentStarSystem(), config.name, 'travelling');
      }, { name: target.name, position });
      await game.page.waitForTimeout(400);
      return connectionDrawings(game.page);
    };

    const quarter = await readArrowAt(0.25);
    expect(quarter.line, 'the route is drawn').not.toBeNull();
    expect(quarter.line.borderTop, 'as a dashed line while under way').toContain('dashed');
    expect(quarter.label, 'and the cost label is put away').toBeNull();
    expect(quarter.arrow, 'with the ship shown on it').not.toBeNull();

    const threeQuarters = await readArrowAt(0.75);
    expect(threeQuarters.arrow, 'the ship is still drawn').not.toBeNull();

    const moved = Math.hypot(
      threeQuarters.arrow.left - quarter.arrow.left,
      threeQuarters.arrow.top - quarter.arrow.top
    );
    expect(moved, 'and it has moved along the route').toBeGreaterThan(5);
  });

  test('an orbiting starship is drawn circling its destination', async ({ game }) => {
    const target = await pickStudiedStar(game);
    await clickStar(game, target.name);

    // A ship in orbit is still flagged as travelling — nothing ever clears that
    // flag — and that is what stops `starShipUiChecks` forcing the status back to
    // `readyForTravel` on the next frame. Staging orbit without it is a state the
    // game cannot hold for even one frame.
    await game.withMods((m, name) => {
      m.cg.setStarShipTravelling(true);
      m.cg.setStarShipStatus(['orbiting', name]);
      m.cg.setDestinationStar(name);
      m.ui.drawStarConnectionDrawings(m.cg.getCurrentStarSystem(), name, 'orbiting');
    }, target.name);
    await game.page.waitForTimeout(600);

    expect(await game.withMods((m) => m.cg.getStarShipStatus()[0]),
      'the run should still be in orbit a frame later').toBe('orbiting');

    const drawn = await connectionDrawings(game.page);
    expect(drawn.orbit, 'an orbit circle is drawn').not.toBeNull();
    expect(drawn.arrow, 'with the ship parked on it').not.toBeNull();

    const star = await game.page.evaluate((capitalised) => {
      const el = document.getElementById(capitalised);
      if (!el) return null;
      return { left: el.offsetLeft, top: el.offsetTop, size: el.offsetWidth };
    }, await displayName(game, target.name));

    expect(star, 'the destination star is on screen').toBeTruthy();
    // The circle is three times the star's width, centred on it.
    expect(drawn.orbit.width, 'the orbit is three star-widths across')
      .toBeCloseTo(star.size * 3, 0);
    expect(drawn.orbit.left + drawn.orbit.width / 2, 'and is centred on the star')
      .toBeCloseTo(star.left + star.size / 2, 0);
  });
});

// ============================================================== the travel gate

test.describe('Star Map — the Travel button', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareMapRun(game);
    await studyOutTo(game, 40);
    await openStarMap(game);
  });

  /** The Travel button's current gate state. */
  async function travelButton(page) {
    return page.evaluate(() => {
      const button = document.querySelector('.travel-starship-button');
      if (!button) return null;
      return {
        classes: Array.from(button.classList),
        pointerEvents: getComputedStyle(button).pointerEvents
      };
    });
  }

  test('the button is dead until the run holds the antimatter the trip needs', async ({ game }) => {
    const target = await pickStudiedStar(game);
    expect(target).toBeTruthy();

    await game.withMods((m, fuel) =>
      m.rdo.setResourceDataObject(Math.max(0, fuel - 1), 'antimatter', ['quantity']), target.fuel);
    await clickStar(game, target.name);
    await game.page.waitForTimeout(900);

    const broke = await travelButton(game.page);
    expect(broke, 'the Travel button is on the destination row').not.toBeNull();
    expect(broke.classes, 'one unit short and the trip is refused').toContain('red-disabled-text');
    expect(broke.pointerEvents, 'and the colour class is what refuses it').toBe('none');

    await game.withMods((m, fuel) =>
      m.rdo.setResourceDataObject(fuel, 'antimatter', ['quantity']), target.fuel);
    await game.page.waitForTimeout(900);

    const exact = await travelButton(game.page);
    expect(exact.classes, 'exactly enough is enough').toContain('green-ready-text');
    expect(exact.classes).not.toContain('red-disabled-text');
  });

  test('the button also needs the FTL tech, however much antimatter is on hand', async ({ game }) => {
    const target = await pickStudiedStar(game);
    await game.withMods((m, fuel) =>
      m.rdo.setResourceDataObject(fuel * 100, 'antimatter', ['quantity']), target.fuel);
    await clickStar(game, target.name);
    await game.page.waitForTimeout(900);
    expect((await travelButton(game.page)).classes, 'rich and researched').toContain('green-ready-text');

    await game.withMods((m) => {
      const techs = m.cg.getTechUnlockedArray();
      const index = techs.indexOf('FTLTravelTheory');
      if (index >= 0) techs.splice(index, 1);
    });
    await game.page.waitForTimeout(900);

    const gated = await travelButton(game.page);
    expect(gated.classes, 'without FTL Travel Theory there is no trip').toContain('red-disabled-text');
    expect(gated.classes).not.toContain('green-ready-text');
  });

  test('the destination row reports the star, its distance and its fuel', async ({ game }) => {
    const target = await pickStudiedStar(game);
    await game.withMods((m, fuel) =>
      m.rdo.setResourceDataObject(fuel * 2, 'antimatter', ['quantity']), target.fuel);
    await clickStar(game, target.name);

    const row = await game.page.evaluate(() => ({
      name: document.getElementById('starDestinationName')?.textContent?.trim(),
      distance: document.getElementById('starDestinationDistance')?.textContent?.trim(),
      fuel: document.getElementById('starDestinationFuel')?.textContent?.trim()
    }));

    const capitalised = await displayName(game, target.name);
    expect(row.name, 'the row names the star chosen').toContain(capitalised);
    expect(row.distance, 'and reports its distance in light years')
      .toContain(target.distance.toFixed(2));
    expect(row.fuel, 'and the antimatter the trip costs').toContain(String(target.fuel));
  });

  test('the distance and fuel are greyed while the trip is out of reach', async ({ game }) => {
    const target = await pickStudiedStar(game);

    const colours = async () => game.page.evaluate(() => ({
      distance: document.querySelector('#starDestinationDistance span')?.style.color,
      fuel: document.querySelector('#starDestinationFuel span')?.style.color
    }));

    await game.withMods((m) => m.rdo.setResourceDataObject(0, 'antimatter', ['quantity']));
    await clickStar(game, target.name);
    const broke = await colours();

    await game.withMods((m, fuel) =>
      m.rdo.setResourceDataObject(fuel * 2, 'antimatter', ['quantity']), target.fuel);
    await clickStar(game, target.name);
    const rich = await colours();

    expect(broke.distance, 'an unaffordable trip is greyed').toBeTruthy();
    expect(rich.distance, 'and an affordable one is not the same colour')
      .not.toBe(broke.distance);
    expect(rich.fuel).not.toBe(broke.fuel);
  });
});
