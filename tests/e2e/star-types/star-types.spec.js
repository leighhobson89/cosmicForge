/**
 * Area: Star Type Bonuses — the three types that do something, and the six that do not
 * Plan: tests/docs/areas/star-types.md
 *
 * Every star in the game carries a spectral type, from a fixed table in
 * `descriptions.js`. Three of those types change the economy, and the game's own
 * help text publishes exactly what each one does:
 *
 * | Type | What it does | Conditional on |
 * |---|---|---|
 * | **B** | a flat rate added to every *resource* autobuyer tier: +2/s, +8/s, +25/s, +80/s | being **in** the system |
 * | **F** | antimatter extraction multiplied by 1.5 | being **in** the system |
 * | **O** | one power-plant type amplified 8x, and a hostile system to conquer | having **settled** that star |
 *
 * The difference in the last column is the thing most easily got wrong, and each
 * type has a spec for it: B and F are properties of *where the run currently is*
 * and vanish on leaving, while O is a property of *what the run owns* and is
 * carried between systems. `getOTypePowerPlantBoostMultiplierForCurrentSystem` is
 * named as though it were the former; it reads `getSettledStars()`, which is the
 * latter, and matches what the help text promises.
 *
 * ## Every other type grants nothing, and that is asserted
 *
 * A, G, K and M have no mechanic anywhere in the source. That is worth pinning
 * rather than leaving unsaid: the alternative to a spec here is a future bonus
 * being wired to the wrong letter and nobody noticing. Each inert type is put
 * through the same three measurements the live types are measured with —
 * resource throughput, antimatter throughput and grid output — and has to come
 * back identical to the neutral baseline.
 *
 * ## Everything here is measured, not read
 *
 * A bonus that is written into a field but never reaches production is the exact
 * failure this suite exists to catch, so no spec below asserts a multiplier. Each
 * one runs the real delta timers for a known span of game time in one system,
 * runs the same span in another, and compares what the stores actually gained.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** Ticks per displayed second — TIMER_RATE_RATIO. */
const RATE_RATIO = 100;

/** The flat per-unit, per-tick addition a B-type system makes, by tier. */
const B_TYPE_BOOST_PER_TIER = { 1: 0.02, 2: 0.08, 3: 0.25, 4: 0.8 };

/** A representative star of each type, from the table in descriptions.js. */
const STAR_OF_TYPE = {
  A: 'sirius',
  B: 'rigel',
  F: 'canopus',
  G: 'capella',
  K: 'arcturus',
  M: 'betelgeuse',
  O: 'regulus'
};

/** The types with no mechanic of their own. */
const INERT_TYPES = ['A', 'G', 'K', 'M'];

/**
 * What a complexity-1 rock gives up over one driven 100,000ms window with no
 * star-type bonus: `NORMAL_MAX_ANTIMATTER_RATE` of 0.004 a tick over 10,000 ticks.
 *
 * Every extraction measurement below is compared against this rather than against
 * another measurement. The frame loop keeps mining between the driven spans, so
 * dividing one window by another turns that shared overhead into an apparent
 * shortfall in whatever multiplier is under test.
 */
const EXPECTED_EXTRACTION_AT_EASE_1 = 0.004 * 10_000;

// Each measurement runs the delta timers over a long span of game time, and
// several cases do it once per system.
test.describe.configure({ timeout: 300_000 });

// ---------------------------------------------------------------------- helpers

/** Move the run into a named system, the way arriving there leaves it. */
async function enterSystem(game, starName) {
  await game.withMods((m, name) => {
    m.cg.setCurrentStarSystem(name);
    // Weather is per system and is re-drawn from the new system's table on
    // arrival; without this the old system's efficiency would follow the run.
    m.game.forceClearWeather();
  }, starName);
  await game.page.waitForTimeout(400);
}

/**
 * Stage one resource autobuyer tier and nothing else, so what the stores gain is
 * that tier's output alone.
 *
 * Tier 1 is deliberately usable without power and tiers 2-4 are not, which is a
 * rule of the game rather than an accident — the staged tier is passed in so each
 * spec can say which half of that rule it is exercising.
 */
async function stageResourceAutoBuyer(game, { resource = 'oxygen', tier = 1, quantity = 10, rate = 0 } = {}) {
  await game.withMods((m, config) => {
    m.rdo.setResourceDataObject(true, 'resources', [config.resource, 'revealedYet']);
    m.rdo.setResourceDataObject(0, 'resources', [config.resource, 'quantity']);
    m.rdo.setResourceDataObject(1e15, 'resources', [config.resource, 'storageCapacity']);
    for (const t of ['tier1', 'tier2', 'tier3', 'tier4']) {
      m.rdo.setResourceDataObject(0, 'resources', [config.resource, 'upgrades', 'autoBuyer', t, 'quantity']);
      m.rdo.setResourceDataObject(false, 'resources', [config.resource, 'upgrades', 'autoBuyer', t, 'active']);
    }
    const tierKey = `tier${config.tier}`;
    m.rdo.setResourceDataObject(true, 'resources', [config.resource, 'upgrades', 'autoBuyer', tierKey, 'active']);
    m.rdo.setResourceDataObject(config.rate, 'resources', [config.resource, 'upgrades', 'autoBuyer', tierKey, 'rate']);
    m.rdo.setResourceDataObject(config.quantity, 'resources', [config.resource, 'upgrades', 'autoBuyer', tierKey, 'quantity']);
    m.rdo.setResourceDataObject(config.tier, 'resources', [config.resource, 'upgrades', 'autoBuyer', 'currentTierLevel']);
    m.cg.setInfinitePower(true);
    m.cg.setPowerOnOff(true);
  }, { resource, tier, quantity, rate });
}

/** What one resource gained across a driven span of game time. */
async function measureResourceGain(game, resource, ms = 100_000) {
  const before = await game.withMods((m, key) =>
    m.rdo.getResourceDataObject('resources', [key, 'quantity']), resource);
  await game.advanceTimers(ms);
  const after = await game.withMods((m, key) =>
    m.rdo.getResourceDataObject('resources', [key, 'quantity']), resource);
  return after - before;
}

/** What one compound gained across a driven span of game time. */
async function measureCompoundGain(game, compound, ms = 100_000) {
  const before = await game.withMods((m, key) =>
    m.rdo.getResourceDataObject('compounds', [key, 'quantity']), compound);
  await game.advanceTimers(ms);
  const after = await game.withMods((m, key) =>
    m.rdo.getResourceDataObject('compounds', [key, 'quantity']), compound);
  return after - before;
}

/**
 * Put a rocket on a rock of known complexity so extraction is an exact figure.
 *
 * The journey itself belongs to the space-mining area; here it is staging, and
 * the megastructure contribution is cancelled so the rockets are the whole story.
 */
async function stageMining(game, { ease = 1, quantity = 1e7 } = {}) {
  return game.withMods((m, config) => {
    m.cg.setMegaStructureAntimatterAmount(0);
    m.cg.setAntimatterUnlocked(true);
    m.rdo.setResourceDataObject(0, 'antimatter', ['quantity']);
    m.rdo.setResourceDataObject(1e15, 'antimatter', ['storageCapacity']);

    const entry = m.cg.getAsteroidArray()[0];
    const name = Object.keys(entry)[0];
    m.cg.changeAsteroidArray(name, 'easeOfExtraction', [config.ease, 'green-ready-text']);
    m.cg.changeAsteroidArray(name, 'quantity', [config.quantity, 'green-ready-text']);
    entry[name].originalQuantity = config.quantity;
    m.cg.setDestinationAsteroid('rocket1', name);
    m.cg.setRocketDirection('rocket1', false);
    m.cg.setCurrentlyTravellingToAsteroid('rocket1', false);
    m.cg.setMiningObject('rocket1', name);
    return name;
  }, { ease, quantity });
}

/** What one asteroid gave up across a driven span of game time. */
async function measureExtraction(game, asteroidName, ms = 100_000) {
  const read = () => game.withMods((m, name) => {
    const entry = m.cg.getAsteroidArray().find((a) => a[name]);
    return entry[name].quantity[0];
  }, asteroidName);

  const before = await read();
  await game.advanceTimers(ms);
  const after = await read();
  return before - after;
}

/** Stage one power plant type and leave it the only generator running. */
async function stagePowerPlant(game, plant = 'powerPlant1', quantity = 10) {
  await game.withMods((m, config) => {
    m.cg.setInfinitePower(false);
    for (const [category, materials] of Object.entries({
      resources: ['carbon'],
      compounds: ['diesel']
    })) {
      for (const material of materials) {
        m.rdo.setResourceDataObject(1e9, category, [material, 'storageCapacity']);
        m.rdo.setResourceDataObject(1e9, category, [material, 'quantity']);
      }
    }
    for (const key of ['powerPlant1', 'powerPlant2', 'powerPlant3']) {
      m.rdo.setResourceDataObject(key === config.plant ? config.quantity : 0,
        'buildings', ['energy', 'upgrades', key, 'quantity']);
      m.game.addBuildingPotentialRate(key);
      m.game.toggleBuildingTypeOnOff(key, key === config.plant);
    }
    m.cg.setPowerOnOff(true);
  }, { plant, quantity });
  await game.page.waitForTimeout(500);
}

/** The grid's generation rate, once the energy tick has run. */
async function gridRate(game) {
  await game.advanceTimers(200);
  await game.page.waitForTimeout(400);
  return game.withMods((m) => m.rdo.getResourceDataObject('buildings', ['energy', 'rate']));
}

/** Reach a run with techs, rockets, asteroids and cash. */
async function prepareRun(game) {
  await game.prepareRunForStarshipLaunch();
  await game.page.waitForTimeout(800);
}

// ============================================================= the type table

test.describe('Star Types — the table itself', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('every star in the galaxy carries a type from the published set', async ({ game }) => {
    const types = await game.withMods((m) => {
      const names = m.desc.getStarNames();
      return names.map((name) => [name, m.desc.getStarTypeByName(name)]);
    });

    expect(types.length, 'the galaxy should have stars in it').toBeGreaterThan(50);
    const allowed = ['O', 'B', 'A', 'F', 'G', 'K', 'M'];
    for (const [name, type] of types) {
      expect(allowed, `${name} is type ${type}`).toContain(type);
    }

    // Every type this file exercises has to actually exist in the table, or the
    // specs below are measuring a system the game cannot produce.
    const present = new Set(types.map(([, type]) => type));
    for (const type of Object.keys(STAR_OF_TYPE)) {
      expect(present, `no ${type}-type star exists in the table`).toContain(type);
    }
  });

  test('the representative star of each type really is that type', async ({ game }) => {
    const actual = await game.withMods((m, table) => Object.fromEntries(
      Object.entries(table).map(([type, name]) => [type, m.desc.getStarTypeByName(name)])
    ), STAR_OF_TYPE);

    for (const [type, name] of Object.entries(STAR_OF_TYPE)) {
      expect(actual[type], `${name} should be type ${type}`).toBe(type);
    }
  });

  test('an unknown name falls back to type A rather than throwing', async ({ game }) => {
    const fallbacks = await game.withMods((m) => [
      m.desc.getStarTypeByName('not-a-star'),
      m.desc.getStarTypeByName(''),
      m.desc.getStarTypeByName(null),
      m.desc.getStarTypeByName(undefined)
    ]);
    for (const type of fallbacks) expect(type).toBe('A');
  });

  test('a star studied into the data object records the type its name carries', async ({ game }) => {
    await prepareRun(game);
    await game.openTab(5);
    await game.page.evaluate(() => {
      const el = document.getElementById('starMapOption');
      el?.closest('.row-side-menu')?.classList.remove('invisible');
      el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(1200);

    const mismatches = await game.withMods((m) => {
      const stars = m.rdo.getStarSystemDataObject('stars') || {};
      return Object.entries(stars)
        .filter(([name, data]) => name !== 'destinationStar' && data && data.starType)
        .filter(([name, data]) => data.starType !== m.desc.getStarTypeByName(name))
        .map(([name, data]) => `${name}: recorded ${data.starType}, table says ${m.desc.getStarTypeByName(name)}`);
    });

    expect(mismatches, 'a studied star must record the type its name carries').toEqual([]);
  });
});

// ================================================================ B-type stars

test.describe('Star Types — B-type stars and the autobuyers', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareRun(game);
  });

  test('every autobuyer tier gains the flat rate the help text publishes', async ({ game }) => {
    for (const tier of [1, 2, 3, 4]) {
      // A rate of zero isolates the bonus: whatever the store gains in a B-type
      // system is the bonus and nothing else.
      await stageResourceAutoBuyer(game, { tier, quantity: 10, rate: 0 });

      await enterSystem(game, STAR_OF_TYPE.A);
      const neutral = await measureResourceGain(game, 'oxygen');

      await enterSystem(game, STAR_OF_TYPE.B);
      await game.withMods((m) => m.rdo.setResourceDataObject(0, 'resources', ['oxygen', 'quantity']));
      const boosted = await measureResourceGain(game, 'oxygen');

      expect(neutral, `tier ${tier} produces nothing at rate zero outside a B system`)
        .toBeCloseTo(0, 6);
      // 10 units x the tier's boost x 10,000 ticks.
      const expected = 10 * B_TYPE_BOOST_PER_TIER[tier] * 10_000;
      expect(boosted, `tier ${tier} in a B system`).toBeGreaterThan(expected * 0.98);
      expect(boosted, `tier ${tier} in a B system`).toBeLessThan(expected * 1.02);
    }
  });

  test('the bonus is added per autobuyer owned, not once per tier', async ({ game }) => {
    // Each holding is measured against its own expected total rather than the two
    // being divided by each other: the frame loop keeps producing between the
    // driven windows, and a ratio turns that shared overhead into an apparent
    // non-linearity while an absolute simply absorbs it.
    const measureAt = async (quantity) => {
      await stageResourceAutoBuyer(game, { tier: 2, quantity, rate: 0 });
      await enterSystem(game, STAR_OF_TYPE.B);
      await game.withMods((m) => m.rdo.setResourceDataObject(0, 'resources', ['oxygen', 'quantity']));
      const gained = await measureResourceGain(game, 'oxygen');
      const staged = await game.withMods((m) =>
        m.rdo.getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier2', 'quantity']));
      return { gained, staged };
    };

    for (const quantity of [5, 20]) {
      const { gained, staged } = await measureAt(quantity);
      expect(staged, `${quantity} autobuyers should have been staged`).toBe(quantity);
      const expected = quantity * B_TYPE_BOOST_PER_TIER[2] * 10_000;
      expect(gained, `${quantity} autobuyers gained ${gained}, expected about ${expected}`)
        .toBeGreaterThan(expected * 0.97);
      expect(gained, `${quantity} autobuyers gained ${gained}, expected about ${expected}`)
        .toBeLessThan(expected * 1.03);
    }
  });

  test('the bonus is added on top of the tier’s own rate rather than replacing it', async ({ game }) => {
    // A tier-1 bonus is 0.02 a tick against a base rate of 0.5 — a twenty-fifth of
    // the signal. Subtracting one measured window from another to isolate it puts
    // the answer inside the noise the frame loop adds to both, so each window is
    // instead compared against its own expected total over a span long enough for
    // the driven ticks to dominate. "Added" and "replaced" are 4% apart at these
    // figures, which a 1% band separates cleanly.
    const window = 1_000_000;
    const ticks = window / 10;
    await stageResourceAutoBuyer(game, { tier: 1, quantity: 10, rate: 0.5 });

    await enterSystem(game, STAR_OF_TYPE.A);
    const plain = await measureResourceGain(game, 'oxygen', window);

    await enterSystem(game, STAR_OF_TYPE.B);
    await game.withMods((m) => m.rdo.setResourceDataObject(0, 'resources', ['oxygen', 'quantity']));
    const boosted = await measureResourceGain(game, 'oxygen', window);

    const expectedPlain = 10 * 0.5 * ticks;
    const expectedBoosted = 10 * (0.5 + B_TYPE_BOOST_PER_TIER[1]) * ticks;

    expect(plain, `outside a B system it produced ${plain}, expected about ${expectedPlain}`)
      .toBeGreaterThan(expectedPlain * 0.99);
    expect(plain).toBeLessThan(expectedPlain * 1.01);

    expect(boosted, `in a B system it produced ${boosted}, expected about ${expectedBoosted}`)
      .toBeGreaterThan(expectedBoosted * 0.99);
    expect(boosted).toBeLessThan(expectedBoosted * 1.01);

    // If the bonus replaced the rate rather than adding to it, the B-type figure
    // would be a fraction of the plain one instead of slightly above it.
    expect(boosted, 'the bonus sits on top of the base rate').toBeGreaterThan(plain);
  });

  test('compounds are not boosted — the bonus is for resources only', async ({ game }) => {
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(0, 'compounds', ['water', 'quantity']);
      m.rdo.setResourceDataObject(1e15, 'compounds', ['water', 'storageCapacity']);
      for (const t of ['tier1', 'tier2', 'tier3', 'tier4']) {
        m.rdo.setResourceDataObject(0, 'compounds', ['water', 'upgrades', 'autoBuyer', t, 'quantity']);
        m.rdo.setResourceDataObject(false, 'compounds', ['water', 'upgrades', 'autoBuyer', t, 'active']);
      }
      m.rdo.setResourceDataObject(true, 'compounds', ['water', 'upgrades', 'autoBuyer', 'tier1', 'active']);
      m.rdo.setResourceDataObject(0, 'compounds', ['water', 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      m.rdo.setResourceDataObject(10, 'compounds', ['water', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      m.cg.setInfinitePower(true);
      m.cg.setPowerOnOff(true);
    });

    // The precipitation path also feeds this compound, so the sky is cleared
    // first — otherwise rain would look like a B-type bonus.
    await enterSystem(game, STAR_OF_TYPE.B);
    await game.withMods((m) => m.rdo.setResourceDataObject(0, 'compounds', ['water', 'quantity']));
    const gained = await measureCompoundGain(game, 'water');

    expect(gained, 'a compound at rate zero gains nothing, B-type system or not')
      .toBeCloseTo(0, 4);
  });

  test('leaving the B-type system takes the bonus with it', async ({ game }) => {
    await stageResourceAutoBuyer(game, { tier: 3, quantity: 10, rate: 0 });

    await enterSystem(game, STAR_OF_TYPE.B);
    const inside = await measureResourceGain(game, 'oxygen');

    await enterSystem(game, STAR_OF_TYPE.K);
    await game.withMods((m) => m.rdo.setResourceDataObject(0, 'resources', ['oxygen', 'quantity']));
    const outside = await measureResourceGain(game, 'oxygen');

    expect(inside).toBeGreaterThan(0);
    expect(outside, 'the bonus does not travel with the run').toBeCloseTo(0, 4);
  });

  test('the production tooltip names the B-type contribution as its own line', async ({ game }) => {
    await stageResourceAutoBuyer(game, { tier: 1, quantity: 10, rate: 0.5 });
    await enterSystem(game, STAR_OF_TYPE.B);
    await game.openTab(1);
    await game.advanceTimers(2000);
    await game.page.waitForTimeout(700);

    // The tooltip is built on mouseenter over the resource's rate readout, so it
    // is hovered rather than called: what is asserted is the text a player sees.
    const hover = async () => {
      await game.page.evaluate(() => {
        document.getElementById('oxygenRate')
          ?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, clientX: 10, clientY: 10 }));
      });
      await game.page.waitForTimeout(300);
      return game.page.evaluate(() => {
        const tooltip = document.getElementById('production-rate-tooltip');
        return { shown: tooltip?.style.display, html: tooltip?.innerHTML ?? '' };
      });
    };

    const suffixTemplate = await game.withMods((m) =>
      m.loc.localize('tooltipBTypeBoostSuffix', m.cg.getLanguage()));
    // "( {amount}/s from Type B star)" -> the fixed tail either side of the value.
    const marker = suffixTemplate.split('{amount}').pop().replace(/^[/\s]*s/, '').trim().replace(/\)$/, '').trim();

    const inB = await hover();
    expect(inB.shown, 'hovering the rate should raise the tooltip').toBe('block');
    expect(inB.html, `tooltip did not mention the B-type share: ${inB.html}`).toContain(marker);

    await enterSystem(game, STAR_OF_TYPE.A);
    await game.advanceTimers(2000);
    await game.page.waitForTimeout(500);

    const inA = await hover();
    expect(inA.html, 'and says nothing about it outside a B-type system').not.toContain(marker);
  });

  test('the published tier values are the ones the game actually holds', async ({ game }) => {
    const values = await game.withMods((m) => m.cg.getBTypeAutoBuyerBoostValues());
    expect(values.tier1 * RATE_RATIO, 'tier 1 is +2/s').toBeCloseTo(2, 6);
    expect(values.tier2 * RATE_RATIO, 'tier 2 is +8/s').toBeCloseTo(8, 6);
    expect(values.tier3 * RATE_RATIO, 'tier 3 is +25/s').toBeCloseTo(25, 6);
    expect(values.tier4 * RATE_RATIO, 'tier 4 is +80/s').toBeCloseTo(80, 6);
  });
});

// ================================================================ F-type stars

test.describe('Star Types — F-type stars and antimatter mining', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareRun(game);
  });

  test('an F-type system multiplies extraction by half as much again', async ({ game }) => {
    const asteroid = await stageMining(game, { ease: 1 });
    const multiplier = await game.withMods((m) => 1 + m.cg.getFTypeAntimatterMiningBoostMultiplier());
    expect(multiplier, 'the published bonus is 50%').toBeCloseTo(1.5, 6);

    await enterSystem(game, STAR_OF_TYPE.A);
    const plain = await measureExtraction(game, asteroid);

    await enterSystem(game, STAR_OF_TYPE.F);
    const boosted = await measureExtraction(game, asteroid);

    expect(plain, `plain extraction was ${plain}`)
      .toBeGreaterThan(EXPECTED_EXTRACTION_AT_EASE_1 * 0.97);
    expect(plain).toBeLessThan(EXPECTED_EXTRACTION_AT_EASE_1 * 1.05);
    expect(boosted, `boosted extraction was ${boosted}`)
      .toBeGreaterThan(EXPECTED_EXTRACTION_AT_EASE_1 * multiplier * 0.97);
    expect(boosted).toBeLessThan(EXPECTED_EXTRACTION_AT_EASE_1 * multiplier * 1.05);
  });

  test('the bonus is gone in every other system', async ({ game }) => {
    const asteroid = await stageMining(game, { ease: 1 });

    await enterSystem(game, STAR_OF_TYPE.F);
    const inF = await measureExtraction(game, asteroid);

    const elsewhere = {};
    for (const type of ['A', 'B', 'G', 'K', 'M', 'O']) {
      await enterSystem(game, STAR_OF_TYPE[type]);
      elsewhere[type] = await measureExtraction(game, asteroid);
    }

    for (const [type, gained] of Object.entries(elsewhere)) {
      expect(gained, `${type} mined ${gained}, expected the plain rate`)
        .toBeGreaterThan(EXPECTED_EXTRACTION_AT_EASE_1 * 0.97);
      expect(gained, `${type} mined ${gained}, expected the plain rate`)
        .toBeLessThan(EXPECTED_EXTRACTION_AT_EASE_1 * 1.05);
    }
    expect(inF, 'and only F is faster')
      .toBeGreaterThan(EXPECTED_EXTRACTION_AT_EASE_1 * 1.4);
  });

  test('the F-type bonus does not touch resource production', async ({ game }) => {
    await stageResourceAutoBuyer(game, { tier: 1, quantity: 10, rate: 0.5 });

    await enterSystem(game, STAR_OF_TYPE.A);
    const plain = await measureResourceGain(game, 'oxygen');

    await enterSystem(game, STAR_OF_TYPE.F);
    await game.withMods((m) => m.rdo.setResourceDataObject(0, 'resources', ['oxygen', 'quantity']));
    const inF = await measureResourceGain(game, 'oxygen');

    // Ten tier-1 autobuyers at 0.5 a tick over 10,000 ticks, in both systems:
    // a mining bonus has no business reaching resource production.
    const expected = 10 * 0.5 * 10_000;
    for (const [label, gained] of [['outside', plain], ['in an F-type system', inF]]) {
      expect(gained, `${label} produced ${gained}, expected about ${expected}`)
        .toBeGreaterThan(expected * 0.97);
      expect(gained, `${label} produced ${gained}, expected about ${expected}`)
        .toBeLessThan(expected * 1.05);
    }
  });
});

// ================================================================ O-type stars

test.describe('Star Types — O-type stars and power generation', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareRun(game);
    // Start every case from a survey with no O-type buff already granted.
    await game.withMods((m) => {
      m.cg.setOTypeMechanicActivatedForThisSave(true);
      m.rdo.setOTypePowerPlantBuffs({
        basicPowerPlantStar: { starName: null, settled: false },
        solarPowerPlantStar: { starName: null, settled: false },
        advancedPowerPlantStar: { starName: null, settled: false }
      });
      m.cg.getSettledStars().length = 0;
    });
  });

  /** Grant the O-type buff for one plant the way settling that star does. */
  async function settleOTypeStarFor(game, buffKey) {
    await game.withMods((m, config) => {
      const buffs = JSON.parse(JSON.stringify(m.rdo.getOTypePowerPlantBuffs()));
      buffs[config.buffKey] = { starName: config.star, settled: true };
      m.rdo.setOTypePowerPlantBuffs(buffs);
      m.cg.setSettledStars(config.star);
    }, { buffKey, star: STAR_OF_TYPE.O });
  }

  test('settling an O-type star amplifies exactly one power plant type', async ({ game }) => {
    await stagePowerPlant(game, 'powerPlant1', 10);
    const plain = await gridRate(game);
    expect(plain, 'the plant is generating to begin with').toBeGreaterThan(0);

    await settleOTypeStarFor(game, 'basicPowerPlantStar');
    const boosted = await gridRate(game);

    const strength = await game.withMods((m) => m.cg.getOTypePowerPlantStrengthBoost());
    expect(strength, 'the published amplification').toBe(8);
    expect(boosted / plain, `plain ${plain}, boosted ${boosted}`).toBeCloseTo(strength, 4);
  });

  test('the amplified type is the one the star was granted for, and no other', async ({ game }) => {
    await settleOTypeStarFor(game, 'advancedPowerPlantStar');

    await stagePowerPlant(game, 'powerPlant1', 10);
    const basic = await gridRate(game);
    await stagePowerPlant(game, 'powerPlant3', 10);
    const advanced = await gridRate(game);

    const multipliers = await game.withMods((m) => ({
      plant1: m.game.getOTypePowerPlantBoostMultiplierForCurrentSystem('powerPlant1'),
      plant2: m.game.getOTypePowerPlantBoostMultiplierForCurrentSystem('powerPlant2'),
      plant3: m.game.getOTypePowerPlantBoostMultiplierForCurrentSystem('powerPlant3')
    }));

    expect(multipliers.plant3, 'the granted type is amplified').toBe(8);
    expect(multipliers.plant1, 'the other types are not').toBe(1);
    expect(multipliers.plant2, 'the other types are not').toBe(1);
    expect(basic).toBeGreaterThan(0);
    expect(advanced).toBeGreaterThan(basic);
  });

  test('the boost needs the star settled, not merely recorded', async ({ game }) => {
    await stagePowerPlant(game, 'powerPlant1', 10);
    const plain = await gridRate(game);

    // The buff names the star but the run has not taken it.
    await game.withMods((m, star) => {
      const buffs = JSON.parse(JSON.stringify(m.rdo.getOTypePowerPlantBuffs()));
      buffs.basicPowerPlantStar = { starName: star, settled: true };
      m.rdo.setOTypePowerPlantBuffs(buffs);
      m.cg.getSettledStars().length = 0;
    }, STAR_OF_TYPE.O);

    const unsettled = await gridRate(game);
    expect(unsettled, 'a star the run has not settled grants nothing').toBeCloseTo(plain, 6);

    await game.withMods((m, star) => m.cg.setSettledStars(star), STAR_OF_TYPE.O);
    const settled = await gridRate(game);
    expect(settled / plain, 'taking the star turns the boost on').toBeCloseTo(8, 4);
  });

  test('the boost is carried between systems rather than left behind', async ({ game }) => {
    await stagePowerPlant(game, 'powerPlant1', 10);
    await settleOTypeStarFor(game, 'basicPowerPlantStar');

    const rates = {};
    for (const type of ['A', 'B', 'F', 'K', 'O']) {
      await enterSystem(game, STAR_OF_TYPE[type]);
      rates[type] = await gridRate(game);
    }

    const baseline = rates.A;
    expect(baseline).toBeGreaterThan(0);
    for (const [type, rate] of Object.entries(rates)) {
      expect(rate, `the O-type boost should still apply in a ${type} system`)
        .toBeCloseTo(baseline, 6);
    }
  });

  test('the boost does nothing while the O-type mechanic is switched off for the save', async ({ game }) => {
    await stagePowerPlant(game, 'powerPlant1', 10);
    await settleOTypeStarFor(game, 'basicPowerPlantStar');
    const on = await gridRate(game);

    await game.withMods((m) => m.cg.setOTypeMechanicActivatedForThisSave(false));
    const off = await gridRate(game);

    expect(on / off, 'switching the mechanic off returns the plant to plain output')
      .toBeCloseTo(8, 4);
  });

  test('an O-type destination is hard mode: life is certain and the traits are the hostile set', async ({ game }) => {
    // `generateDestinationStarData` is what the Stellar Scanner button runs, and
    // it is the only exported way into the life/trait generators — so the hard
    // mode gate is exercised through the same call the game makes.
    const survey = (star, samples) => game.withMods((m, config) => {
      m.cg.setDestinationStar(config.star);
      const results = [];
      for (let i = 0; i < config.samples; i++) {
        m.game.generateDestinationStarData();
        const data = m.rdo.getStarSystemDataObject('stars', ['destinationStar']);
        results.push({
          lifeDetected: data.lifeDetected,
          traits: (data.lifeformTraits || []).map((trait) => trait[0])
        });
      }
      return results;
    }, { star, samples });

    const hostile = ['Aggressive', 'Mechanized', 'Armored'];

    const oStar = await survey(STAR_OF_TYPE.O, 20);
    expect(oStar.every((r) => r.lifeDetected === true),
      'an O-type system always has life in it').toBe(true);
    for (const result of oStar) {
      expect(result.traits, 'and always the hostile trait set').toEqual(hostile);
    }

    const ordinary = await survey(STAR_OF_TYPE.K, 20);
    expect(ordinary.some((r) => JSON.stringify(r.traits) !== JSON.stringify(hostile)),
      'an ordinary system is not locked to the hostile set').toBe(true);
  });

  test('O-type stars are never chosen as manuscript or expansion targets', async ({ game }) => {
    const manuscriptStars = await game.withMods((m) => {
      m.cg.getStarsWithAncientManuscripts().length = 0;
      m.cg.setFactoryStarsArray([], true);
      m.cg.setStarVisionDistance(0);
      for (let i = 0; i < 120 && m.cg.getStarsWithAncientManuscripts().length < 4; i++) {
        m.game.extendStarDataRange(true);
      }
      return m.cg.getStarsWithAncientManuscripts().map((entry) => entry[0]);
    });

    expect(manuscriptStars.length, 'the survey should have produced manuscripts').toBeGreaterThan(0);
    const types = await game.withMods((m, names) => names.map((n) => m.desc.getStarTypeByName(n)), manuscriptStars);
    for (let i = 0; i < manuscriptStars.length; i++) {
      expect(types[i], `${manuscriptStars[i]} is an O-type and should not hold a manuscript`).not.toBe('O');
    }
  });
});

// ========================================================== the inert types

test.describe('Star Types — the types that grant nothing', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareRun(game);
  });

  test('A, G, K and M change resource production not at all', async ({ game }) => {
    await stageResourceAutoBuyer(game, { tier: 2, quantity: 10, rate: 0.5 });

    const gains = {};
    for (const type of INERT_TYPES) {
      await enterSystem(game, STAR_OF_TYPE[type]);
      await game.withMods((m) => m.rdo.setResourceDataObject(0, 'resources', ['oxygen', 'quantity']));
      gains[type] = await measureResourceGain(game, 'oxygen');
    }

    // Ten tier-2 autobuyers at 0.5 a tick over 10,000 ticks, with no type bonus.
    const expected = 10 * 0.5 * 10_000;
    for (const type of INERT_TYPES) {
      expect(gains[type], `${type} produced ${gains[type]}, expected about ${expected}`)
        .toBeGreaterThan(expected * 0.97);
      expect(gains[type], `${type} produced ${gains[type]}, expected about ${expected}`)
        .toBeLessThan(expected * 1.05);
    }

    // And the contrast that gives the assertion its teeth: a B-type system adds
    // 10 x 0.08 x 10,000 on top, which is far outside that band.
    await enterSystem(game, STAR_OF_TYPE.B);
    await game.withMods((m) => m.rdo.setResourceDataObject(0, 'resources', ['oxygen', 'quantity']));
    const inB = await measureResourceGain(game, 'oxygen');
    expect(inB, 'a B-type system is measurably different')
      .toBeGreaterThan(expected + (10 * B_TYPE_BOOST_PER_TIER[2] * 10_000) * 0.9);
  });

  test('A, G, K and M change antimatter extraction not at all', async ({ game }) => {
    const asteroid = await stageMining(game, { ease: 1 });

    const gains = {};
    for (const type of INERT_TYPES) {
      await enterSystem(game, STAR_OF_TYPE[type]);
      gains[type] = await measureExtraction(game, asteroid);
    }

    for (const type of INERT_TYPES) {
      expect(gains[type], `${type} mined ${gains[type]}, expected the plain rate`)
        .toBeGreaterThan(EXPECTED_EXTRACTION_AT_EASE_1 * 0.97);
      expect(gains[type], `${type} mined ${gains[type]}, expected the plain rate`)
        .toBeLessThan(EXPECTED_EXTRACTION_AT_EASE_1 * 1.05);
    }
  });

  test('A, G, K and M change power generation not at all', async ({ game }) => {
    await stagePowerPlant(game, 'powerPlant1', 10);

    const rates = {};
    for (const type of INERT_TYPES) {
      await enterSystem(game, STAR_OF_TYPE[type]);
      rates[type] = await gridRate(game);
    }

    const baseline = rates.A;
    expect(baseline).toBeGreaterThan(0);
    for (const type of INERT_TYPES) {
      expect(rates[type], `${type} should be neutral for power`).toBeCloseTo(baseline, 6);
    }
  });

  test('being in an O-type system is not the same as owning one', async ({ game }) => {
    await stagePowerPlant(game, 'powerPlant1', 10);
    await game.withMods((m) => {
      m.rdo.setOTypePowerPlantBuffs({
        basicPowerPlantStar: { starName: null, settled: false },
        solarPowerPlantStar: { starName: null, settled: false },
        advancedPowerPlantStar: { starName: null, settled: false }
      });
      m.cg.getSettledStars().length = 0;
    });

    await enterSystem(game, STAR_OF_TYPE.A);
    const elsewhere = await gridRate(game);

    await enterSystem(game, STAR_OF_TYPE.O);
    const standingInOne = await gridRate(game);

    expect(elsewhere).toBeGreaterThan(0);
    expect(standingInOne, 'standing in an O-type system grants nothing on its own')
      .toBeCloseTo(elsewhere, 6);
  });
});
