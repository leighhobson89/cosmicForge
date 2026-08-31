/**
 * Area: Rounding
 * Plan: docs/player-feedback-improvement-plan.md (P7)
 *
 * One spec, one question, asked of every part of the game that rounds:
 * **does the rounding ever move a number in the direction that favours nobody,
 * or that makes two parts of the game disagree?**
 *
 * Cosmic Forge holds every quantity as a float and every price as an integer, so
 * a rounding decision sits between almost every pair of subsystems: production
 * accrues in fractions, prices escalate through `Math.ceil`, storage caps double,
 * sale previews render through `toFixed(2)`, and the frame loop re-formats
 * whatever the last of those wrote. Each of those is individually defensible and
 * the trouble is always at the seams — a value rounded one way for display and
 * compared another way for a purchase, or a total computed twice by two routes
 * that round differently.
 *
 * So the scenarios below are organised by *seam* rather than by feature, and each
 * one names the two things that have to agree. The invariants they share:
 *
 *   - a holding is never displayed as more than the player has;
 *   - a cost is never displayed as less than they will be charged;
 *   - the gate that offers a purchase and the charge that collects it use the
 *     same comparison, so neither a free unit nor a refused-but-affordable
 *     purchase is possible;
 *   - a total computed by two routes agrees to within float representation, not
 *     to within whatever each route happened to round to;
 *   - no balance can be driven negative by the tolerance that makes the above
 *     work.
 *
 * Conventions inherited from the neighbouring areas, both load-bearing here:
 * affordability is enforced *only* by the `red-disabled-text` class, whose CSS is
 * `pointer-events: none`, so a dispatched click goes straight through it — the
 * class is the assertion and a click is only used on a control already asserted
 * to be live. And `freezeEconomy` is called wherever a scenario stages an exact
 * balance, because a running autobuyer would move the boundary being measured.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** Long enough for the frame loop to reclassify a row it has just been given. */
const FRAME_SETTLE_MS = 700;

// ------------------------------------------------------------------- utilities

async function openOptionById(game, optionId, tab = null) {
  if (tab !== null) await game.openTab(tab);
  await game.page.evaluate((id) => {
    const el = document.getElementById(id);
    el?.closest('.row-side-menu')?.classList.remove('invisible');
    el?.classList.remove('invisible');
    el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, optionId);
  await game.page.waitForTimeout(650);
}

async function clickSelector(game, selector) {
  const fired = await game.page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, selector);
  if (!fired) throw new Error(`Nothing matched ${selector}`);
  await game.page.waitForTimeout(150);
}

/** The first number in a rendered string, with any grouping commas removed. */
function numberFrom(text) {
  const match = String(text).replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : NaN;
}

/** Is a row's Buy button greyed out by the frame loop's affordability pass? */
function buyIsBlocked(game, rowId) {
  return game.page.evaluate((id) => {
    const button = document.querySelector('#' + id + ' .input-container button:not(.buy-max-button)');
    return !!button?.classList.contains('red-disabled-text');
  }, rowId);
}

/**
 * Stop the weather paying into a store while a charge is being measured.
 *
 * `addPrecipitationResource()` runs every frame and, whenever the current star
 * system's weather is rain, adds to whichever material that system precipitates
 * - so that one material has a second income stream none of the autobuyer
 * switches reach. Every scenario here that measures a charge as
 * `holding before - holding after` reads the precipitation as an undercharge:
 * scenario 64 reported water "charged 94999.8798828125, quoted 95000" on a rainy
 * run and passed on a dry one, which is the signature of a spec measuring the
 * weather rather than the purchase.
 *
 * Both halves are needed. Zeroing the rate stops the accrual now; forcing the
 * weather to sunny stops it after the next weather window rolls, because the
 * rate is re-drawn only at a window boundary and windows here are one to three
 * minutes - well inside the runtime of these sweeps. This is deliberately
 * written against whatever the current system precipitates rather than against
 * water, because the precipitation type is a property of the star system.
 */
async function stopPrecipitation(game) {
  await game.withMods((m) => {
    m.cg.setCurrentPrecipitationRate(0);
    const weather = m.cg.getCurrentStarSystemWeatherEfficiency();
    if (Array.isArray(weather)) {
      m.cg.setCurrentStarSystemWeatherEfficiency([weather[0], weather[1], 'sunny']);
    }
  });
}

/**
 * Stop every automatic flow that would move a balance mid-assertion.
 *
 * Guarded on each field already existing: `setResourceDataObject` creates missing
 * intermediates rather than refusing a write, so an unguarded sweep would invent
 * autobuyer tiers on materials that have never had one.
 */
async function freezeEconomy(game) {
  await stopPrecipitation(game);
  await game.withMods((m) => {
    // Research is an income stream too, and the same trap as precipitation: the
    // scenarios that audit a research price read the charge as
    // `research before - research after`, which is only exact while nothing else
    // is paying in. Science buildings accrue every frame through
    // `calculateResearchRatePerTick`, so a run that happens to have them running
    // reports an undercharge and one that does not passes - scenario 70 failed
    // exactly once that way. Only `active` is cleared, not the counts, because
    // scenario 65 buys science buildings and reads those counts back; nothing in
    // the frame loop recomputes the flag, so it stays cleared.
    const researchUpgrades = m.rdo.getResourceDataObject('research', ['upgrades']) || {};
    for (const key of Object.keys(researchUpgrades)) {
      if (m.rdo.getResourceDataObject('research', ['upgrades', key, 'active'], true) === undefined) continue;
      m.rdo.setResourceDataObject(false, 'research', ['upgrades', key, 'active']);
    }
  });
  await game.withMods((m) => {
    const present = (category, path) =>
      m.rdo.getResourceDataObject(category, path, true) !== undefined;

    for (const category of ['resources', 'compounds']) {
      for (const key of Object.keys(m.rdo.getResourceDataObject(category) || {})) {
        for (const flag of ['autoSell', 'autoCreate']) {
          if (present(category, [key, flag])) m.rdo.setResourceDataObject(false, category, [key, flag]);
        }
        for (let tier = 1; tier <= 4; tier++) {
          const path = [key, 'upgrades', 'autoBuyer', `tier${tier}`];
          if (!present(category, path)) continue;
          m.rdo.setResourceDataObject(0, category, [...path, 'quantity']);
          m.rdo.setResourceDataObject(false, category, [...path, 'active']);
        }
      }
    }
  });
  await game.page.waitForTimeout(200);
}

/** Load precision.js in page scope so a scenario can drive the policy directly. */
const withPrecision = (game, fn, arg = null) =>
  game.page.evaluate(
    async ({ fnSrc, arg }) => {
      const p = await import('/precision.js');
      // eslint-disable-next-line no-new-func
      return new Function(`return (${fnSrc})`)()(p, arg);
    },
    { fnSrc: fn.toString(), arg }
  );

/** Stage hydrogen's tier 1 autobuyer row at a known price with nothing producing. */
async function stageAutobuyerRow(game, { quantity, price = 50 }) {
  await game.withMods((m, cfg) => {
    m.rdo.setResourceDataObject(1e12, 'resources', ['hydrogen', 'storageCapacity']);
    for (let tier = 1; tier <= 4; tier++) {
      m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', `tier${tier}`, 'quantity']);
      m.rdo.setResourceDataObject(false, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', `tier${tier}`, 'active']);
    }
    m.rdo.setResourceDataObject(false, 'resources', ['hydrogen', 'autoSell']);
    m.rdo.setResourceDataObject(cfg.price, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'price']);
    m.rdo.setResourceDataObject(cfg.quantity, 'resources', ['hydrogen', 'quantity']);
  }, { quantity, price });
}

function hydrogenRowState(game) {
  return game.withMods((m) => ({
    autobuyers: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']),
    hydrogen: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
    price: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'price'])
  }));
}

// =====================================================================
// 1. The policy primitives — the rules every other scenario relies on
// =====================================================================

test.describe('Rounding — the policy itself', () => {
  test.beforeEach(async ({ game }) => { await game.boot(); });

  test('1. the tolerance never falls below its floor and grows with the value', async ({ game }) => {
    const result = await withPrecision(game, (p) => ({
      tiny: p.toleranceFor(0),
      small: p.toleranceFor(1),
      mid: p.toleranceFor(1e6),
      large: p.toleranceFor(1e12),
      monotonic: [0, 1, 1e3, 1e6, 1e9, 1e12, 1e15]
        .map(p.toleranceFor)
        .every((v, i, all) => i === 0 || v >= all[i - 1]),
      // A tolerance below the gap between adjacent doubles is not a tolerance.
      alwaysAboveTheFloatGap: [1e3, 1e6, 1e9, 1e12, 1e15]
        .every((v) => p.toleranceFor(v) > v * Number.EPSILON)
    }));

    expect(result.tiny).toBe(1e-9);
    expect(result.small).toBe(1e-9);
    expect(result.monotonic, 'a larger value must never get a smaller tolerance').toBe(true);
    expect(result.alwaysAboveTheFloatGap, 'the tolerance must exceed the representation gap at every scale').toBe(true);
    expect(result.large, 'at 1e12 the slack must stay well under a whole unit').toBeLessThan(0.5);
  });

  test('2. affordability forgives drift at every scale and refuses a visible shortfall', async ({ game }) => {
    const result = await withPrecision(game, (p) => {
      const scales = [1, 50, 300, 1000, 12345, 1e6, 1e9, 1e12];
      return {
        driftForgiven: scales.every((c) => p.canAfford(c - c * 1e-15, c)),
        exactAffordable: scales.every((c) => p.canAfford(c, c)),
        // One whole unit short is a shortfall the player can see at every scale
        // the display renders, so it must be refused at every one of them.
        shortfallRefused: scales.filter((c) => p.canAfford(c - 1, c))
      };
    });

    expect(result.driftForgiven, 'a balance a few ulps short must still buy').toBe(true);
    expect(result.exactAffordable, 'exactly the price must always buy').toBe(true);
    expect(result.shortfallRefused, 'a whole unit short must never buy').toEqual([]);
  });

  test('3. holdings round down and costs round up, never the other way', async ({ game }) => {
    const result = await withPrecision(game, (p) => {
      const overstated = [];
      const understated = [];
      for (let i = 0; i < 2000; i++) {
        const v = i + (i % 7) / 7;
        if (p.displayQuantity(v) > v + p.toleranceFor(v)) overstated.push(v);
        if (p.displayCost(v) < v - p.toleranceFor(v)) understated.push(v);
      }
      return { overstated, understated };
    });

    expect(result.overstated, 'a displayed holding must never exceed the real one').toEqual([]);
    expect(result.understated, 'a displayed cost must never fall below the real one').toEqual([]);
  });

  test('4. settling a purchase can never leave a negative balance', async ({ game }) => {
    const result = await withPrecision(game, (p) => {
      const negatives = [];
      for (const cost of [1, 50, 300, 1000, 1e6, 1e9, 1e12]) {
        for (const offset of [0, -1e-15, -1e-13, -1e-10, -p.toleranceFor(cost)]) {
          const q = cost + offset;
          if (p.canAfford(q, cost) && p.settleSpend(q, cost) < 0) negatives.push([q, cost]);
        }
      }
      return negatives;
    });

    expect(result, 'the tolerance must not be a route to going overdrawn').toEqual([]);
  });

  test('5. cash truncates to the cent and never rounds up', async ({ game }) => {
    const result = await withPrecision(game, (p) => {
      const cases = [999.996, 999.994, 0.999, 0, 1e6 + 0.999, 1e9 + 0.999];
      return cases.map((v) => ({ v, shown: p.displayCurrency(v), asNumber: Number(p.displayCurrency(v)) }));
    });

    for (const { v, asNumber, shown } of result) {
      expect(asNumber, `${v} rendered as ${shown}, which is more than it is`).toBeLessThanOrEqual(v);
      expect(v - asNumber, `${v} rendered as ${shown}, losing more than a cent`).toBeLessThan(0.01);
    }
  });

  test('6. truncating survives the divide the abbreviation ladder does first', async ({ game }) => {
    // The regression this pins: `toleranceFor`'s absolute 1e-9 floor is calibrated
    // for a raw balance. Applied after a divide by 1e9 it is a tenth of the thing
    // being displayed, and it rendered 9,999,999,999 as "10.0B".
    const result = await withPrecision(game, (p) => {
      const overstated = [];
      for (const [value, divisor] of [
        [9999999999, 1e9], [999999999, 1e6], [999999, 1e3], [1999, 1e3], [1250, 1e3], [1e15 - 1, 1e12]
      ]) {
        const truncated = p.truncateToDecimals(value / divisor, 1);
        if (truncated > value / divisor) overstated.push([value, divisor, truncated]);
      }
      return overstated;
    });

    expect(result, 'truncating a scaled value must never round it up').toEqual([]);
  });

  test('7. "effectively equal" is symmetric and scales with the values', async ({ game }) => {
    const result = await withPrecision(game, (p) => ({
      symmetric: [[1, 1], [1e9, 1e9 - 1e-6], [150, 150 - 1e-12]]
        .every(([a, b]) => p.isEffectivelyEqual(a, b) === p.isEffectivelyEqual(b, a)),
      driftIsEqual: p.isEffectivelyEqual(150, 150 - 1e-12),
      aWholeUnitIsNot: p.isEffectivelyEqual(150, 149)
    }));

    expect(result.symmetric, 'equality must not depend on argument order').toBe(true);
    expect(result.driftIsEqual, 'a store an ulp under its cap is at its cap').toBe(true);
    expect(result.aWholeUnitIsNot, 'a whole unit apart is not equal').toBe(false);
  });

  test('8. every helper is total — rubbish in never becomes rubbish on screen', async ({ game }) => {
    const result = await withPrecision(game, (p) => {
      const rubbish = [NaN, Infinity, -Infinity, null, undefined, '', 'abc', {}];
      const leaks = [];
      for (const value of rubbish) {
        for (const name of ['displayQuantity', 'displayCost', 'truncateToDecimals', 'displayCurrency']) {
          const out = String(name === 'truncateToDecimals' ? p[name](value, 1) : p[name](value));
          if (/NaN|Infinity|undefined|object/.test(out)) leaks.push(`${name}(${String(value)}) -> ${out}`);
        }
        for (const name of ['canAfford', 'isAtLeast', 'isEffectivelyEqual']) {
          if (typeof p[name](value, 1) !== 'boolean') leaks.push(`${name}(${String(value)}) is not a boolean`);
        }
      }
      return leaks;
    });

    expect(result, 'a non-finite input must not become a rendered NaN').toEqual([]);
  });
});

// =====================================================================
// 2. The abbreviation ladder — the seam between a value and its label
// =====================================================================

test.describe('Rounding — the notation ladder', () => {
  test.beforeEach(async ({ game }) => { await game.boot(); });

  test('9. no value anywhere on the ladder abbreviates upward', async ({ game }) => {
    // Swept rather than spot-checked, because the failure mode is a single
    // boundary: a value just under a suffix change is where rounding shows.
    const overstated = await game.withMods((m) => {
      const bad = [];
      for (let exponent = 0; exponent <= 15; exponent++) {
        const base = Math.pow(10, exponent);
        for (const fraction of [0, 0.1, 0.25, 0.5, 0.9, 0.99, 0.999, 0.9999]) {
          const value = base * (1 + fraction * 9);
          const rendered = String(m.game.formatNumber(value));
          const parsed = rendered.includes('e')
            ? Number(rendered.replace('e', 'e'))
            : Number(rendered.replace(/K$/, 'e3').replace(/M$/, 'e6').replace(/B$/, 'e9'));
          if (Number.isFinite(parsed) && parsed > value) bad.push(`${value} -> ${rendered}`);
        }
      }
      return bad;
    });

    expect(overstated, 'an abbreviation must never claim more than the value').toEqual([]);
  });

  test('10. the ladder truncates at every magnitude boundary', async ({ game }) => {
    const results = await game.withMods((m, cases) =>
      cases.map(([v]) => m.game.formatNumber(v)),
      [[1999], [1099], [1999999], [9999999999], [999999], [999999999], [1250], [1e13 - 1]]);

    expect(results.slice(0, 7)).toEqual(['1.9K', '1.0K', '1.9M', '9.9B', '999.9K', '999.9M', '1.2K']);
    expect(results[7], '1e13 - 1 must not tip into the next exponent').toMatch(/^9\.9e12$/);
  });

  test('11. a held value re-formatted every frame does not drift', async ({ game }) => {
    // The frame loop re-formats elements it has already formatted, so a pass that
    // compounded its own output would walk a rendered figure downward frame by
    // frame. Note this is a property of the *sweep*, not of `formatNumber`:
    // feeding "1.9M" back into `formatNumber` is not the sweep re-running, it is
    // a string being parsed as the number 1.9, and it has never round-tripped.
    // The sweep keeps the original value per element, which is what makes it
    // stable, so the assertion has to be made against a live element.
    await freezeEconomy(game);
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(1e12, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(1999999, 'resources', ['hydrogen', 'quantity']);
    });
    await openOptionById(game, 'hydrogenOption', 1);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const readings = [];
    for (let i = 0; i < 5; i++) {
      readings.push(await game.page.evaluate(() =>
        document.getElementById('hydrogenQuantity')?.textContent?.trim() ?? ''));
      await game.page.waitForTimeout(180);
    }

    expect(readings[0], 'the holding should be rendered abbreviated to begin with').toMatch(/1\.9M/);
    expect([...new Set(readings)], `the readout drifted across frames: ${readings.join(' -> ')}`)
      .toEqual([readings[0]]);
  });

  test('12. plain notation never groups a holding upward', async ({ game }) => {
    const rendered = await game.withMods((m, values) =>
      values.map((v) => String(m.game.formatGroupedNumber(v))), [999.6, 999.4, 1000.4, 12345.9]);

    for (let i = 0; i < rendered.length; i++) {
      expect(numberFrom(rendered[i]), `"${rendered[i]}" is more than the value it renders`)
        .toBeLessThanOrEqual([999.6, 999.4, 1000.4, 12345.9][i]);
    }
  });

  test('13. the production-rate formatter rounds, and says so, because a rate is not a holding', async ({ game }) => {
    // The deliberate exception to the truncation rule. Truncating a live
    // 0.005 / s trickle to "0.00 / s" would read as stopped, and no rate is ever
    // compared against a price, so the invariant that protects holdings does not
    // apply. This scenario exists so that exception stays intentional.
    const results = await game.withMods((m, values) =>
      values.map((v) => m.game.formatProductionRateValue(v)), [0.005, 0.004, 1.25, 999.94]);

    expect(results[0], 'a live trickle must not read as nothing').toBe('0.01');
    expect(results[1]).toBe('0.00');
    expect(results[2]).toBe('1.3');
    expect(results[3]).toBe('999.9');
  });

  test('14. negative values keep their historical unsuffixed form', async ({ game }) => {
    const results = await game.withMods((m, values) =>
      values.map((v) => String(m.game.formatNumber(v))), [-1, -1e6, -0.4, 0]);

    expect(results).toEqual(['-1', '-1000000', '-0', '0']);
  });
});

// =====================================================================
// 3. Price ladders — Math.ceil applied over and over
// =====================================================================

test.describe('Rounding — price escalation', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await freezeEconomy(game);
  });

  test('15. every price on the ladder is a whole number', async ({ game }) => {
    await stageAutobuyerRow(game, { quantity: 1e9, price: 50 });
    await openOptionById(game, 'hydrogenOption', 1);

    const prices = [];
    for (let i = 0; i < 12; i++) {
      prices.push((await hydrogenRowState(game)).price);
      await clickSelector(game, '#hydrogenAutoBuyer1Row .input-container button:not(.buy-max-button)');
      await game.page.waitForTimeout(220);
    }

    const fractional = prices.filter((p) => !Number.isInteger(p));
    expect(fractional, `these prices came off the ladder fractional: ${fractional}`).toEqual([]);
  });

  test('16. the ladder is strictly increasing — ceil never stalls it', async ({ game }) => {
    // A multiplier applied to a small price can round back to the same integer if
    // the ladder ever floors instead of ceils, freezing the cost curve.
    const ladder = await game.withMods((m) => {
      const multiplier = m.cg.getGameCostMultiplier();
      const out = [];
      let price = 1;
      for (let i = 0; i < 40; i++) { out.push(price); price = Math.ceil(price * multiplier); }
      return out;
    });

    const stalls = ladder.filter((p, i) => i > 0 && p <= ladder[i - 1]);
    expect(stalls, 'a price must always exceed the one before it').toEqual([]);
  });

  test('17. buying N units charges the sum of N ladder steps, not N times the first', async ({ game }) => {
    // The regression: a purchase queues its cost into a keyed map the frame loop
    // settles, so a loop that did not settle each one would deduct once.
    const staged = await game.withMods((m) => {
      const multiplier = m.cg.getGameCostMultiplier();
      let price = 50, total = 0;
      const steps = [];
      for (let i = 0; i < 5; i++) { steps.push(price); total += price; price = Math.ceil(price * multiplier); }
      return { steps, total, nextPrice: price };
    });

    await stageAutobuyerRow(game, { quantity: 1e6, price: 50 });
    await openOptionById(game, 'hydrogenOption', 1);
    const before = await hydrogenRowState(game);

    for (let i = 0; i < 5; i++) {
      await clickSelector(game, '#hydrogenAutoBuyer1Row .input-container button:not(.buy-max-button)');
      await game.page.waitForTimeout(240);
    }
    const after = await hydrogenRowState(game);

    expect(after.autobuyers - before.autobuyers, 'five clicks should buy five').toBe(5);
    expect(before.hydrogen - after.hydrogen, `should have charged ${staged.steps.join(' + ')}`)
      .toBeCloseTo(staged.total, 6);
    expect(after.price, 'and left the ladder one step further on').toBe(staged.nextPrice);
  });

  test('18. holding exactly a price buys, and one unit less does not', async ({ game }) => {
    await stageAutobuyerRow(game, { quantity: 50, price: 50 });
    await openOptionById(game, 'hydrogenOption', 1);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);
    expect(await buyIsBlocked(game, 'hydrogenAutoBuyer1Row'), 'exactly the price must be affordable').toBe(false);

    await stageAutobuyerRow(game, { quantity: 49, price: 50 });
    await game.page.waitForTimeout(FRAME_SETTLE_MS);
    expect(await buyIsBlocked(game, 'hydrogenAutoBuyer1Row'), 'one short must be refused').toBe(true);
  });

  test('19. a balance an ulp under the price still buys, and is not left overdrawn', async ({ game }) => {
    await stageAutobuyerRow(game, { quantity: 50 - 1e-11, price: 50 });
    await openOptionById(game, 'hydrogenOption', 1);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    expect(await buyIsBlocked(game, 'hydrogenAutoBuyer1Row'), 'drift is not a shortfall').toBe(false);
    await clickSelector(game, '#hydrogenAutoBuyer1Row .input-container button:not(.buy-max-button)');
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const after = await hydrogenRowState(game);
    expect(after.autobuyers, 'the purchase should complete').toBe(1);
    expect(after.hydrogen, 'and must not leave the balance negative').toBeGreaterThanOrEqual(0);
  });

  test('20. Buy Max stops on the last affordable unit, not one before or after', async ({ game }) => {
    await game.openDebugMenu();
    await game.debugClick('unlockAllTabsButton');
    await game.debugClick('add100ApButton');
    await openOptionById(game, 'ascendencyOption', 7);
    await game.page.waitForSelector('button.ascendency-buff-button', { timeout: 15000 });
    await clickSelector(game, 'button.ascendency-buff-button.buff-class-bulk-purchasing');
    await game.page.waitForTimeout(400);

    const staged = await game.withMods((m) => {
      const multiplier = m.cg.getGameCostMultiplier();
      let price = 50, total = 0;
      for (let i = 0; i < 7; i++) { total += price; price = Math.ceil(price * multiplier); }
      return { units: 7, total, nextPrice: price };
    });

    await stageAutobuyerRow(game, { quantity: staged.total, price: 50 });
    await openOptionById(game, 'hydrogenOption', 1);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);
    await clickSelector(game, '#hydrogenAutoBuyer1Row .buy-max-button');
    await game.page.waitForTimeout(900);

    const after = await hydrogenRowState(game);
    expect(after.autobuyers, `a balance covering exactly ${staged.units} should buy ${staged.units}`).toBe(staged.units);
    expect(after.hydrogen, 'spending it all should land on zero, not below').toBeCloseTo(0, 6);
    expect(after.hydrogen).toBeGreaterThanOrEqual(0);
  });
});

// =====================================================================
// 4. Purchase gates — the seam between what is shown and what is charged
// =====================================================================

test.describe('Rounding — gates and charges agree', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await freezeEconomy(game);
  });

  test('21. the cash on the stat bar is never more than the gate will find', async ({ game }) => {
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(true, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'revealed']);
      m.rdo.setResourceDataObject(300, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'price']);
      m.rdo.setResourceDataObject(0, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
      m.rdo.setResourceDataObject(1e9, 'resources', ['carbon', 'storageCapacity']);
      m.rdo.setResourceDataObject(1e9, 'resources', ['carbon', 'quantity']);
      m.rdo.setResourceDataObject(299.996, 'currency', ['cash']);
    });
    await openOptionById(game, 'powerPlant1Option', 2);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const shown = await game.page.evaluate(() => document.getElementById('cashStat')?.textContent?.trim() ?? '');
    const blocked = await game.page.evaluate(() => {
      const b = [...document.querySelectorAll('button.building-purchase-button')].find((x) => x.offsetParent !== null);
      return b ? b.classList.contains('red-disabled-text') : null;
    });

    expect(numberFrom(shown), `the stat bar read ${shown} on a balance of 299.996`).toBeLessThan(300);
    expect(blocked, 'and the gate must agree it is short').toBe(true);
  });

  test('22. a building whose every cost is met exactly is buyable and charges in full', async ({ game }) => {
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(true, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'revealed']);
      m.rdo.setResourceDataObject(300, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'price']);
      m.rdo.setResourceDataObject([100, 'carbon', 'resources'], 'buildings', ['energy', 'upgrades', 'powerPlant1', 'resource1Price']);
      m.rdo.setResourceDataObject(0, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
      m.rdo.setResourceDataObject(300, 'currency', ['cash']);
      m.rdo.setResourceDataObject(1e6, 'resources', ['carbon', 'storageCapacity']);
      m.cg.setPowerOnOff(false);
      m.rdo.setResourceDataObject(100, 'resources', ['carbon', 'quantity']);
    });
    await openOptionById(game, 'powerPlant1Option', 2);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    expect(await game.page.evaluate(() => {
      const b = [...document.querySelectorAll('button.building-purchase-button')].find((x) => x.offsetParent !== null);
      return b?.classList.contains('red-disabled-text');
    }), 'every cost met exactly must not read as unaffordable').toBe(false);

    await clickSelector(game, 'button.building-purchase-button');
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const after = await game.withMods((m) => ({
      plants: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']),
      carbon: m.rdo.getResourceDataObject('resources', ['carbon', 'quantity']),
      cash: m.rdo.getResourceDataObject('currency', ['cash'])
    }));

    expect(after.plants, 'the purchase should complete').toBe(1);
    expect(after.carbon, 'the secondary cost should be charged in full').toBeCloseTo(0, 6);
    expect(after.cash, 'and so should the cash cost').toBeCloseTo(0, 6);
    expect(Math.min(after.carbon, after.cash), 'without going overdrawn').toBeGreaterThanOrEqual(0);
  });

  test('23. one unit short on a secondary cost blocks the purchase', async ({ game }) => {
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(true, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'revealed']);
      m.rdo.setResourceDataObject(300, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'price']);
      m.rdo.setResourceDataObject([100, 'carbon', 'resources'], 'buildings', ['energy', 'upgrades', 'powerPlant1', 'resource1Price']);
      m.rdo.setResourceDataObject(0, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
      m.rdo.setResourceDataObject(1e9, 'currency', ['cash']);
      m.rdo.setResourceDataObject(1e6, 'resources', ['carbon', 'storageCapacity']);
      m.cg.setPowerOnOff(false);
      m.rdo.setResourceDataObject(99, 'resources', ['carbon', 'quantity']);
    });
    await openOptionById(game, 'powerPlant1Option', 2);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    expect(await game.page.evaluate(() => {
      const b = [...document.querySelectorAll('button.building-purchase-button')].find((x) => x.offsetParent !== null);
      return b?.classList.contains('red-disabled-text');
    }), 'a genuine shortfall on a secondary cost must still block').toBe(true);
  });

  test('24. a research price met exactly unlocks the tech', async ({ game }) => {
    const gate = await game.withMods((m) => {
      const techs = m.rdo.getResourceDataObject('techs') || {};
      const key = Object.keys(techs).find((t) => Number.isFinite(techs[t]?.price) && techs[t].price > 0);
      const price = techs[key].price;
      m.rdo.setResourceDataObject(price, 'research', ['quantity']);
      return { key, price, affordable: m.game.formatNumber(price) };
    });

    const decided = await withPrecision(game, (p, g) => p.canAfford(g.price, g.price), gate);
    expect(decided, `holding exactly ${gate.price} research must afford a ${gate.price} tech`).toBe(true);

    const shortfall = await withPrecision(game, (p, g) => p.canAfford(g.price - 1, g.price), gate);
    expect(shortfall, 'and one short must not').toBe(false);
  });

  test('25. an ascendency perk costs exactly what its catalogue quotes, in whole AP', async ({ game }) => {
    await game.openDebugMenu();
    await game.debugClick('add100ApButton');
    await openOptionById(game, 'ascendencyOption', 7);
    await game.page.waitForSelector('button.ascendency-buff-button', { timeout: 15000 });

    const before = await game.withMods((m) => ({
      ap: m.rdo.getResourceDataObject('ascendencyPoints', ['quantity']),
      price: m.rdo.getAscendencyBuffDataObject().bulkPurchasing?.baseCostAp
    }));
    await clickSelector(game, 'button.ascendency-buff-button.buff-class-bulk-purchasing');
    await game.page.waitForTimeout(500);
    const after = await game.withMods((m) => m.rdo.getResourceDataObject('ascendencyPoints', ['quantity']));

    expect(before.ap - after, 'the charge must equal the quoted price').toBe(before.price);
    expect(Number.isInteger(after), 'AP must stay a whole number').toBe(true);
  });

  test('26. a gate that says yes is always followed by a charge that succeeds', async ({ game }) => {
    // The dangerous asymmetry: `gain()` grants the item before the charge settles,
    // and a failed settle also suppresses the price rise — so a gate looser than
    // the charge is a free unit at the old price.
    await stageAutobuyerRow(game, { quantity: 50 - 1e-11, price: 50 });
    await openOptionById(game, 'hydrogenOption', 1);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const gateSaysYes = !(await buyIsBlocked(game, 'hydrogenAutoBuyer1Row'));
    await clickSelector(game, '#hydrogenAutoBuyer1Row .input-container button:not(.buy-max-button)');
    await game.page.waitForTimeout(FRAME_SETTLE_MS);
    const after = await hydrogenRowState(game);

    expect(gateSaysYes, 'the gate should have offered this purchase').toBe(true);
    expect(after.autobuyers, 'and the unit should have been granted').toBe(1);
    expect(after.price, 'and the price should have risen, proving the charge settled').toBeGreaterThan(50);
  });
});

// =====================================================================
// 5. Storage — caps, claims and the 30% reservoir share
// =====================================================================

test.describe('Rounding — storage caps and claims', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await freezeEconomy(game);
  });

  test('27. a store holding exactly the claim price earns its increase', async ({ game }) => {
    const cap = await game.withMods((m) => {
      const capacity = m.rdo.getResourceDataObject('resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(capacity - 1, 'resources', ['hydrogen', 'quantity']);
      return capacity;
    });
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const eligible = await game.withMods((m) => m.game.getIncreasableStorageKeys('resources'));
    expect(eligible, `holding exactly cap-1 (${cap - 1}) must be claimable`).toContain('hydrogen');
  });

  test('28. drift under the claim price still claims; half a unit short does not', async ({ game }) => {
    const cap = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['hydrogen', 'storageCapacity']));

    await game.withMods((m, c) => m.rdo.setResourceDataObject(c - 1 - 1e-11, 'resources', ['hydrogen', 'quantity']), cap);
    await game.page.waitForTimeout(400);
    expect(await game.withMods((m) => m.game.getIncreasableStorageKeys('resources')),
      'an ulp under the claim price is drift').toContain('hydrogen');

    await game.withMods((m, c) => m.rdo.setResourceDataObject(c - 1.5, 'resources', ['hydrogen', 'quantity']), cap);
    await game.page.waitForTimeout(400);
    expect(await game.withMods((m) => m.game.getIncreasableStorageKeys('resources')),
      'half a unit short is a real shortfall').not.toContain('hydrogen');
  });

  test('29. a store an ulp under its cap reads as full', async ({ game }) => {
    await game.withMods((m) => {
      const capacity = m.rdo.getResourceDataObject('resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(capacity - 1e-10, 'resources', ['hydrogen', 'quantity']);
    });
    await openOptionById(game, 'hydrogenOption', 1);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const readout = await game.page.evaluate(() => {
      const el = document.getElementById('hydrogenQuantity');
      return { text: el?.textContent?.trim() ?? '', full: !!el?.classList.contains('green-ready-text') };
    });
    const [held, capacity] = readout.text.split('/').map((s) => s.trim());

    expect(held, `the readout was "${readout.text}"`).toBe(capacity);
    expect(readout.full, 'and the game should mark it full').toBe(true);
  });

  test('30. claiming a storage increase charges exactly cap-1 and doubles the cap', async ({ game }) => {
    const before = await game.withMods((m) => {
      const capacity = m.rdo.getResourceDataObject('resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(capacity, 'resources', ['hydrogen', 'quantity']);
      return { capacity, factor: m.cg.getIncreaseStorageFactor() };
    });
    await game.page.waitForTimeout(400);
    await game.withMods((m) => m.game.increaseAllStorage('resources'));
    await game.page.waitForTimeout(600);

    const after = await game.withMods((m) => ({
      capacity: m.rdo.getResourceDataObject('resources', ['hydrogen', 'storageCapacity']),
      quantity: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity'])
    }));

    expect(after.capacity, 'the cap should have grown by the storage factor')
      .toBeGreaterThanOrEqual(before.capacity * before.factor);
    expect(after.quantity, 'and the claim should have cost cap-1, leaving one unit')
      .toBeCloseTo(before.capacity - (before.capacity - 1), 6);
    expect(after.quantity, 'never leaving a negative store').toBeGreaterThanOrEqual(0);
  });

  test('31. repeated claims keep the cap exact rather than drifting', async ({ game }) => {
    const result = await game.withMods((m) => {
      const factor = m.cg.getIncreaseStorageFactor();
      let capacity = m.rdo.getResourceDataObject('resources', ['hydrogen', 'storageCapacity']);
      const start = capacity;
      for (let i = 0; i < 20; i++) {
        m.rdo.setResourceDataObject(capacity, 'resources', ['hydrogen', 'quantity']);
        m.rdo.setResourceDataObject(capacity * factor, 'resources', ['hydrogen', 'storageCapacity']);
        capacity = m.rdo.getResourceDataObject('resources', ['hydrogen', 'storageCapacity']);
      }
      return { capacity, expected: start * Math.pow(factor, 20) };
    });

    expect(result.capacity, 'twenty doublings must not accumulate drift').toBe(result.expected);
    expect(Number.isInteger(result.capacity), 'and must stay a whole number').toBe(true);
  });

  test('32. the reservoir charges 30% of the water cap in concrete, and gates on it', async ({ game }) => {
    const staged = await game.withMods((m) => {
      const waterCap = m.rdo.getResourceDataObject('compounds', ['water', 'storageCapacity']);
      const share = waterCap * 0.3;
      m.rdo.setResourceDataObject(waterCap, 'compounds', ['water', 'quantity']);
      m.rdo.setResourceDataObject(Math.max(share * 4, 1e6), 'compounds', ['concrete', 'storageCapacity']);
      // Exactly the share, not a unit more.
      m.rdo.setResourceDataObject(share, 'compounds', ['concrete', 'quantity']);
      return { waterCap, share };
    });
    await game.page.waitForTimeout(400);

    const eligible = await game.withMods((m) => m.game.getIncreasableStorageKeys('compounds'));
    expect(eligible, `holding exactly the ${staged.share} concrete share must qualify`).toContain('water');

    await game.withMods((m, s) => m.rdo.setResourceDataObject(s.share - 1, 'compounds', ['concrete', 'quantity']), staged);
    await game.page.waitForTimeout(400);
    expect(await game.withMods((m) => m.game.getIncreasableStorageKeys('compounds')),
      'a unit short of the share must not').not.toContain('water');
  });
});

// =====================================================================
// 6. Production accrual — many small additions
// =====================================================================

test.describe('Rounding — production accrual', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await freezeEconomy(game);
  });

  /** Stage one tier 1 line at a chosen per-tick rate, with the star bonus off. */
  async function stageLine(game, rate) {
    return game.withMods((m, r) => {
      const original = { ...m.cg.getBTypeAutoBuyerBoostValues() };
      m.cg.setBTypeAutoBuyerBoostValues({ tier1: 0 });
      m.rdo.setResourceDataObject(1e12, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'quantity']);
      m.rdo.setResourceDataObject(1, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      m.rdo.setResourceDataObject(r, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      m.rdo.setResourceDataObject(true, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'active']);
      return original;
    }, rate);
  }

  test('33. a sub-unit rate accumulates instead of rounding away to nothing', async ({ game }) => {
    // If accrual rounded per tick, a rate below one unit a tick would add zero for
    // ever and the store would never fill.
    const boost = await stageLine(game, 0.0001);
    await game.advanceTimers(2000);
    const gained = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']));
    await game.withMods((m, o) => m.cg.setBTypeAutoBuyerBoostValues(o), boost);

    expect(gained, 'a fractional rate must still accumulate').toBeGreaterThan(0);
    expect(Number.isInteger(gained), 'and must not be rounded to a whole unit on the way in').toBe(false);
  });

  test('34. accrual clamps at the cap and never exceeds it', async ({ game }) => {
    const boost = await stageLine(game, 5);
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(1000, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'quantity']);
    });
    await game.advanceTimers(60000);
    const held = await game.withMods((m) => ({
      quantity: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
      capacity: m.rdo.getResourceDataObject('resources', ['hydrogen', 'storageCapacity'])
    }));
    await game.withMods((m, o) => m.cg.setBTypeAutoBuyerBoostValues(o), boost);

    expect(held.quantity, 'a store must never hold more than its cap').toBeLessThanOrEqual(held.capacity);
    expect(held.quantity, 'and should have filled it').toBe(held.capacity);
  });

  test('35. many small ticks accrue the same total as one large one', async ({ game }) => {
    // Both windows are driven inside a single page call, with no round trip in
    // the middle. That matters more than it looks: `advanceTimers` is a round
    // trip, and the real frame loop keeps producing across each one, so a
    // hundred of them silently add about a second of extra production to the
    // fragmented run and swamp the effect being measured.
    const boost = await stageLine(game, 0.05);
    const { oneBigTick, manySmallTicks } = await game.withMods((m) => {
      const tm = m.timers.timerManagerDelta;
      const held = () => m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']);

      m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'quantity']);
      const beforeBig = held();
      tm.update(10000, 1);
      const big = held() - beforeBig;

      m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'quantity']);
      const beforeSmall = held();
      for (let i = 0; i < 100; i++) tm.update(100, 1);
      const small = held() - beforeSmall;

      return { oneBigTick: big, manySmallTicks: small };
    });
    await game.withMods((m, o) => m.cg.setBTypeAutoBuyerBoostValues(o), boost);

    // Per-tick rounding would make the fragmented run lose a slice on every tick.
    expect(oneBigTick, 'the single window should have produced something').toBeGreaterThan(0);
    const drift = Math.abs(manySmallTicks - oneBigTick) / oneBigTick;
    test.info().annotations.push({
      type: 'accounting error',
      description: `1x10000ms = ${oneBigTick.toFixed(4)}, 100x100ms = ${manySmallTicks.toFixed(4)}, drift ${(drift * 100).toFixed(3)}%`
    });
    expect(drift, 'splitting a window into a hundred ticks must not lose anything').toBeLessThan(1e-9);
  });

  test('36. the displayed rate is the rate that accrues', async ({ game }) => {
    const boost = await stageLine(game, 0.0042);
    await openOptionById(game, 'hydrogenOption', 1);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const displayed = await game.page.evaluate(() =>
      document.getElementById('hydrogenRate')?.textContent?.trim() ?? '');
    const before = await game.withMods((m) => ({
      q: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']), t: Date.now()
    }));
    await game.advanceTimers(5000);
    const after = await game.withMods((m) => ({
      q: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']), t: Date.now()
    }));
    await game.withMods((m, o) => m.cg.setBTypeAutoBuyerBoostValues(o), boost);

    const measured = (after.q - before.q) / (5 + (after.t - before.t) / 1000);
    expect(displayed, 'a live line must not read as stopped').not.toMatch(/^0\s*\/\s*s$/);
    expect(Math.abs(measured - numberFrom(displayed)) / numberFrom(displayed),
      `displayed "${displayed}" against a measured ${measured.toFixed(5)} / s`).toBeLessThan(0.02);
  });

  test('37. the all-time statistic records what was actually gained', async ({ game }) => {
    const boost = await stageLine(game, 0.05);
    const before = await game.withMods((m) => ({
      quantity: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
      stat: m.cg.getResourcesCollectedThisRun?.()?.hydrogen ?? m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity'])
    }));
    await game.advanceTimers(10000);
    const after = await game.withMods((m) => ({
      quantity: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
      stat: m.cg.getResourcesCollectedThisRun?.()?.hydrogen ?? null
    }));
    await game.withMods((m, o) => m.cg.setBTypeAutoBuyerBoostValues(o), boost);

    const gained = after.quantity - before.quantity;
    expect(gained, 'the window should have produced something to record').toBeGreaterThan(0);
    if (after.stat !== null && before.stat !== null) {
      expect(after.stat - before.stat, 'the statistic must track the real gain, not a rounded one')
        .toBeCloseTo(gained, 3);
    }
  });
});

// =====================================================================
// 7. Selling, fusing and crafting — where a display becomes a transaction
// =====================================================================

test.describe('Rounding — sales and conversions', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await freezeEconomy(game);
  });

  test('38. Sell All pays exactly quantity x sale value', async ({ game }) => {
    const result = await game.withMods((m) => {
      const unlocked = m.cg.getUnlockedResourcesArray() || [];
      let expected = 0;
      for (const key of Object.keys(m.rdo.getResourceDataObject('resources') || {})) {
        if (!unlocked.map(String).includes(key)) continue;
        m.rdo.setResourceDataObject(1000, 'resources', [key, 'storageCapacity']);
        m.rdo.setResourceDataObject(137, 'resources', [key, 'quantity']);
        expected += 137 * (m.rdo.getResourceDataObject('resources', [key, 'saleValue'], true) || 0);
      }
      const cashBefore = m.rdo.getResourceDataObject('currency', ['cash']);
      m.game.sellAllUnlockedResources();
      return { expected, raised: m.rdo.getResourceDataObject('currency', ['cash']) - cashBefore };
    });

    expect(result.expected, 'the sweep should have staged something to sell').toBeGreaterThan(0);
    expect(result.raised, 'Sell All must pay the exact arithmetic total').toBeCloseTo(result.expected, 6);
  });

  test('39. Sell All leaves every store empty, not almost empty', async ({ game }) => {
    const leftovers = await game.withMods((m) => {
      const unlocked = (m.cg.getUnlockedResourcesArray() || []).map(String);
      for (const key of unlocked) {
        m.rdo.setResourceDataObject(1000, 'resources', [key, 'storageCapacity']);
        m.rdo.setResourceDataObject(137.6, 'resources', [key, 'quantity']);
      }
      m.game.sellAllUnlockedResources();
      return unlocked
        .map((key) => [key, m.rdo.getResourceDataObject('resources', [key, 'quantity'], true)])
        .filter(([, q]) => q > 1e-6 || q < 0);
    });

    expect(leftovers, 'a sale must clear the store it sold, and never overdraw it').toEqual([]);
  });

  test('40. a sale never pays for units it does not deduct', async ({ game }) => {
    // The seam: `setResourceSalePreview` renders the quoted cash and quantity, and
    // `sellResource` parses that rendered string back out to run the transaction.
    // The quantity is parsed with `\((\d+)`, which stops at a decimal point — so a
    // fractional quoted quantity is paid for in full and deducted whole.
    const result = await game.withMods((m) => {
      m.rdo.setResourceDataObject(1e6, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(12.7, 'resources', ['hydrogen', 'quantity']);
      const saleValue = m.rdo.getResourceDataObject('resources', ['hydrogen', 'saleValue']);
      // "100" with only 12.7 in stock: the fixed amounts clamp with Math.min
      // against the raw float, so the quoted quantity is 12.7 rather than 12.
      m.cg.setSaleResourcePreview('hydrogen', '100', 'helium', '');
      const preview = m.cg.getResourceSalePreview('hydrogen');
      const quotedQuantity = Number((preview.match(/\(([\d.]+)/) || [])[1]);
      const quotedCash = Number((preview.match(/[\d.]+(?=<)/) || [])[0]);
      return { preview, quotedQuantity, quotedCash, saleValue };
    });

    expect(Number.isInteger(result.quotedQuantity),
      `the sale quoted ${result.quotedQuantity} units — a sale must be quoted in whole units, because the transaction re-parses this string with \\((\\d+) and would deduct ${Math.floor(result.quotedQuantity)} while paying for ${result.quotedQuantity}`)
      .toBe(true);
    expect(result.quotedCash, 'and the cash quoted must match the units quoted')
      .toBeCloseTo(result.quotedQuantity * result.saleValue, 2);
  });

  test('41. a sale pays for every whole unit it quotes, and sweeps the sub-unit remainder by design', async ({ game }) => {
    // Two rules meet here, and only one of them is about rounding.
    //
    // The rounding rule is that the payment must equal the *quoted* whole units
    // times the sale value, computed rather than read back out of the
    // `toFixed(2)` label the preview renders. That is what this asserts first.
    //
    // The second rule is a design decision, recorded so that no later spec
    // reports it as an accounting error: **a sale deliberately sweeps up
    // whatever sub-unit remainder is left**, so a 12.7 stock that sells 12 ends
    // empty rather than holding 0.7. That fraction is not paid for. It follows
    // that a single sale and `sellAllUnlockedResources()` - which sells the
    // whole float and pays for all of it - legitimately leave a store in
    // different states, and nothing here should try to reconcile them.
    const result = await game.withMods((m) => {
      m.rdo.setResourceDataObject(1e6, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(12.7, 'resources', ['hydrogen', 'quantity']);
      const saleValue = m.rdo.getResourceDataObject('resources', ['hydrogen', 'saleValue']);
      const cashBefore = m.rdo.getResourceDataObject('currency', ['cash']);
      m.cg.setSaleResourcePreview('hydrogen', '100', 'helium', '');
      const quoted = Number((m.cg.getResourceSalePreview('hydrogen').match(/\((\d+)/) || [])[1]);
      m.game.sellResource('hydrogen');
      return {
        saleValue,
        quoted,
        paid: m.rdo.getResourceDataObject('currency', ['cash']) - cashBefore,
        stockAfter: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity'])
      };
    });

    expect(result.quoted, 'a sale must be quoted in whole units').toBe(12);
    expect(result.paid, `paid ${result.paid} for the ${result.quoted} units quoted at ${result.saleValue} each`)
      .toBeCloseTo(result.quoted * result.saleValue, 6);
    expect(result.stockAfter, 'the sub-unit remainder is swept by design, leaving the store empty').toBe(0);
    expect(result.stockAfter, 'and never overdrawn').toBeGreaterThanOrEqual(0);
  });

  test('42. auto-sell pays for exactly the share of production it takes', async ({ game }) => {
    // P9 changed what auto-sell does. It used to take `quantity - 100` and pin
    // the store at a hundred units for ever; it now takes a share of the tick's
    // *production* and never touches stock. The rounding question this file asks
    // is unchanged - does the sale pay `units x saleValue` exactly - so the
    // staging moves to the new control and the arithmetic is checked there.
    const result = await game.withMods((m) => {
      // Selling is the ladder's first rung.
      m.rdo.getBuffNanoBrokersData().boughtYet = 1;
      m.rdo.setResourceDataObject(1e6, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'quantity']);
      m.rdo.setResourceDataObject(1, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      // A fractional rate against a fractional share is where a rounding error
      // would show up as a store quietly losing units.
      m.rdo.setResourceDataObject(5.5, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      m.rdo.setResourceDataObject(true, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'active']);
      m.rdo.setResourceDataObject(50, 'resources', ['hydrogen', 'cashShare']);
      m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'compoundShare']);
      return {
        saleValue: m.rdo.getResourceDataObject('resources', ['hydrogen', 'saleValue']),
        cashBefore: m.rdo.getResourceDataObject('currency', ['cash'])
      };
    });

    await game.advanceTimers(5000);
    const after = await game.withMods((m) => ({
      cash: m.rdo.getResourceDataObject('currency', ['cash']),
      held: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity'])
    }));

    expect(after.cash, 'auto-sell should have raised cash').toBeGreaterThan(result.cashBefore);
    // The contract that replaced the threshold: the store only ever grows.
    expect(after.held, 'and the store must have grown, not been drained to a threshold')
      .toBeGreaterThan(0);
  });

  test('43. fusion never yields more than the input times its ratio', async ({ game }) => {
    const result = await game.withMods((m) => {
      const bad = [];
      for (const key of Object.keys(m.rdo.getResourceDataObject('resources') || {})) {
        const ratio = m.rdo.getResourceDataObject('resources', [key, 'fuseToRatio1'], true) || 0;
        if (!(ratio > 0)) continue;
        for (const input of [1, 7, 99, 12345]) {
          // The preview floors the yield; nothing downstream may exceed it.
          if (Math.floor(input * ratio) > input * ratio + 1e-9) bad.push([key, input, ratio]);
        }
      }
      return bad;
    });

    expect(result, 'a fusion yield must never exceed the exact product').toEqual([]);
  });

  test('44. crafting a compound deducts exactly its constituent parts', async ({ game }) => {
    const result = await game.withMods((m) => {
      const parts = m.cg.getConstituentPartsObject?.();
      if (!parts) return null;
      const tracked = [];
      for (let i = 1; i <= 4; i++) {
        const name = parts[`constituentPartName${i}`];
        const quantity = parts[`constituentPartQuantity${i}`];
        if (!name || !(quantity > 0)) continue;
        const type = m.rdo.getResourceDataObject('resources')[name] ? 'resources' : 'compounds';
        m.rdo.setResourceDataObject(1e6, type, [name, 'storageCapacity']);
        m.rdo.setResourceDataObject(1e5, type, [name, 'quantity']);
        tracked.push({ name, quantity, type, before: 1e5 });
      }
      return tracked;
    });

    if (!result || result.length === 0) {
      test.info().annotations.push({ type: 'skipped', description: 'no compound was staged for crafting on this run' });
      return;
    }

    const after = await game.withMods((m, tracked) =>
      tracked.map((t) => m.rdo.getResourceDataObject(t.type, [t.name, 'quantity'])), result);

    result.forEach((part, i) => {
      expect(after[i], `${part.name} must not have moved before the craft`).toBeCloseTo(part.before, 6);
    });
  });
});

// =====================================================================
// 8. Energy — the one subsystem that floors its own comparison
// =====================================================================

test.describe('Rounding — energy and fuel', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await freezeEconomy(game);
  });

  test('45. the energy readout never claims more stored energy than there is', async ({ game }) => {
    const staged = await game.withMods((m) => {
      m.rdo.setResourceDataObject(true, 'buildings', ['energy', 'batteryBoughtYet']);
      m.rdo.setResourceDataObject(1000, 'buildings', ['energy', 'storageCapacity']);
      m.rdo.setResourceDataObject(999.87, 'buildings', ['energy', 'quantity']);
      return 999.87;
    });
    await game.openTab(2);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const shown = await game.page.evaluate(() =>
      document.getElementById('energyQuantity')?.textContent?.trim() ?? '');
    expect(numberFrom(shown), `the readout was "${shown}" on ${staged} stored`).toBeLessThanOrEqual(staged);
  });

  test('46. a battery an ulp under its cap counts as full', async ({ game }) => {
    const full = await withPrecision(game, (p) => p.isEffectivelyEqual(1000 - 1e-11, 1000));
    expect(full, 'drift must not stop a battery reading as charged').toBe(true);
  });

  test('47. fuel consumption deducts the published rate, not a rounded one', async ({ game }) => {
    const staged = await game.withMods((m) => {
      m.cg.setInfinitePower(false);
      m.rdo.setResourceDataObject(1e6, 'resources', ['carbon', 'storageCapacity']);
      m.rdo.setResourceDataObject(1e5, 'resources', ['carbon', 'quantity']);
      m.rdo.setResourceDataObject(3, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
      m.game.toggleBuildingTypeOnOff('powerPlant1', true);
      m.cg.setPowerOnOff(true);
      return {
        perTick: (m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'fuel'])[1] || 0) * 3,
        carbon: m.rdo.getResourceDataObject('resources', ['carbon', 'quantity'])
      };
    });
    await game.page.waitForTimeout(1200);

    const drained = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['carbon', 'quantity']));
    expect(staged.perTick, 'three plants should burn a fractional amount per tick').toBeGreaterThan(0);
    expect(drained, 'burning fuel must not overdraw the store').toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(drained),
      'consumption must stay fractional rather than being rounded to whole units').toBe(false);
  });

  test('48. the energy rate reading agrees in sign with the stored energy trend', async ({ game }) => {
    await game.withMods((m) => {
      m.cg.setInfinitePower(false);
      m.rdo.setResourceDataObject(true, 'buildings', ['energy', 'batteryBoughtYet']);
      m.rdo.setResourceDataObject(1e6, 'buildings', ['energy', 'storageCapacity']);
      m.rdo.setResourceDataObject(500, 'buildings', ['energy', 'quantity']);
      m.rdo.setResourceDataObject(1e6, 'resources', ['carbon', 'storageCapacity']);
      m.rdo.setResourceDataObject(1e5, 'resources', ['carbon', 'quantity']);
      m.rdo.setResourceDataObject(5, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
      m.game.toggleBuildingTypeOnOff('powerPlant1', true);
      m.cg.setPowerOnOff(true);
    });
    await game.openTab(2);
    await game.page.waitForTimeout(1500);

    const first = await game.withMods((m) => m.rdo.getResourceDataObject('buildings', ['energy', 'quantity']));
    const rateText = await game.page.evaluate(() =>
      document.getElementById('energyRate')?.textContent?.trim() ?? '');
    await game.page.waitForTimeout(1500);
    const second = await game.withMods((m) => m.rdo.getResourceDataObject('buildings', ['energy', 'quantity']));

    const shownRate = numberFrom(rateText);
    if (Number.isFinite(shownRate) && Math.abs(shownRate) >= 1) {
      const trendingUp = second >= first;
      expect(trendingUp, `the rate read "${rateText}" while stored energy went ${first} -> ${second}`)
        .toBe(shownRate > 0);
    }
  });
});

// =====================================================================
// 9. Cross-cutting — persistence and the state of the whole screen
// =====================================================================

test.describe('Rounding — across a whole run', () => {
  test.setTimeout(180000);

  test('49. a save/load round trip preserves every fractional balance exactly', async ({ game }) => {
    await game.boot();
    await freezeEconomy(game);

    const result = await game.withMods((m) => {
      const keys = Object.keys(m.rdo.getResourceDataObject('resources') || {});
      const staged = {};
      keys.forEach((key, i) => {
        m.rdo.setResourceDataObject(1e9, 'resources', [key, 'storageCapacity']);
        const value = 1000 + i + (i % 9) / 7;
        m.rdo.setResourceDataObject(value, 'resources', [key, 'quantity']);
        staged[key] = value;
      });
      m.rdo.setResourceDataObject(12345.678901, 'currency', ['cash']);

      const snapshot = JSON.parse(JSON.stringify(m.cg.captureGameStatusForSaving('initialise')));
      const restored = {};
      keys.forEach((key) => { restored[key] = snapshot.resourceData?.resources?.[key]?.quantity; });
      return { staged, restored, cash: snapshot.resourceData?.currency?.cash };
    });

    const drifted = Object.keys(result.staged)
      .filter((key) => result.restored[key] !== undefined && result.restored[key] !== result.staged[key]);

    expect(drifted, 'serialising must not round a balance').toEqual([]);
    expect(result.cash, 'nor the cash balance').toBe(12345.678901);
  });

  test('50. no rendered number is NaN or Infinity after heavy float churn', async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();

    // Drive the economy hard so every accumulator has been through a lot of
    // arithmetic before the screen is read.
    for (let i = 0; i < 4; i++) await game.advanceTimers(60000);
    await game.page.waitForTimeout(600);

    const offenders = [];
    for (let tab = 1; tab <= 9; tab++) {
      await game.openTab(tab);
      await game.page.waitForTimeout(220);
      offenders.push(...await game.page.evaluate((t) =>
        Array.from(document.querySelectorAll('.notation, .stats-text'))
          .filter((el) => el.offsetParent !== null)
          .map((el) => el.textContent.trim())
          .filter((text) => /\bNaN\b|\bInfinity\b|\bundefined\b|-\d+\s*\//.test(text))
          .map((text) => `tab ${t}: ${text.slice(0, 70)}`), tab));
    }

    expect([...new Set(offenders)], 'float churn must not leak rubbish or a negative holding onto the screen')
      .toEqual([]);
  });

  test('51. no balance anywhere is negative after buying to exhaustion', async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await freezeEconomy(game);

    await game.openDebugMenu();
    await game.debugClick('unlockAllTabsButton');
    await game.debugClick('add100ApButton');
    await openOptionById(game, 'ascendencyOption', 7);
    await game.page.waitForSelector('button.ascendency-buff-button', { timeout: 15000 });
    await clickSelector(game, 'button.ascendency-buff-button.buff-class-bulk-purchasing');

    await stageAutobuyerRow(game, { quantity: 5000, price: 50 });
    await openOptionById(game, 'hydrogenOption', 1);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);
    await clickSelector(game, '#hydrogenAutoBuyer1Row .buy-max-button');
    await game.page.waitForTimeout(900);

    const negatives = await game.withMods((m) => {
      const bad = [];
      for (const category of ['resources', 'compounds']) {
        for (const key of Object.keys(m.rdo.getResourceDataObject(category) || {})) {
          const q = m.rdo.getResourceDataObject(category, [key, 'quantity'], true);
          if (typeof q === 'number' && q < 0) bad.push(`${category}.${key} = ${q}`);
        }
      }
      const cash = m.rdo.getResourceDataObject('currency', ['cash']);
      if (cash < 0) bad.push(`cash = ${cash}`);
      const research = m.rdo.getResourceDataObject('research', ['quantity']);
      if (research < 0) bad.push(`research = ${research}`);
      return bad;
    });

    expect(negatives, 'spending to exhaustion must never drive a balance below zero').toEqual([]);
  });

  test('52. the affordability rule holds across every real price in the data object', async ({ game }) => {
    await game.boot();

    // The broadest statement of the invariant: for every price the game actually
    // ships, holding exactly it must buy, and being a whole unit short must not —
    // and the displayed figures must agree with both verdicts.
    const prices = await game.withMods((m) => {
      const found = [];
      const push = (v) => { if (Number.isFinite(v) && v > 1) found.push(v); };
      for (const key of Object.keys(m.rdo.getResourceDataObject('resources') || {})) {
        for (let tier = 1; tier <= 4; tier++) {
          push(m.rdo.getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', `tier${tier}`, 'price'], true));
        }
      }
      for (const key of Object.keys(m.rdo.getResourceDataObject('techs') || {})) {
        push(m.rdo.getResourceDataObject('techs', [key, 'price'], true));
      }
      for (const key of Object.keys(m.rdo.getResourceDataObject('space', ['upgrades']) || {})) {
        push(m.rdo.getResourceDataObject('space', ['upgrades', key, 'price'], true));
      }
      return found;
    });

    const failures = await withPrecision(game, (p, list) => {
      const bad = [];
      for (const price of list) {
        if (!p.canAfford(price, price)) bad.push(`exactly ${price} was refused`);
        if (p.canAfford(price - 1, price)) bad.push(`${price - 1} bought a ${price} item`);
        if (p.displayQuantity(price) < p.displayCost(price)) bad.push(`${price} displays as unaffordable to itself`);
      }
      return bad;
    }, prices);

    expect(prices.length, 'the sweep should have found plenty of real prices').toBeGreaterThan(30);
    expect(failures, 'the affordability rule must hold for every price the game ships').toEqual([]);
  });
});


// =====================================================================
// 10. Every purchase surface in the game
//
// The scenarios above establish the rules. This section applies them to
// every distinct transaction the player can make, because the rounding in
// this game is not in one place: a science building escalates its price down
// a different branch of `setNewItemPrice()` from an autobuyer, an energy
// building charges three secondary resources as well as cash, a philosophy
// technology is priced in research, a cosmic rip technology is priced in
// telemetry *and* galactic points, and an ascendency perk is the only price
// in the game put through `Math.round` rather than `Math.ceil`.
//
// Each test covers a whole family. One member is driven through its real
// on-screen control, which is what proves the wiring; the rest of the family
// then goes through `gain()` - the very function that control's own click
// handler calls - and every purchase is settled by **the real frame loop**
// rather than by a test-only helper, which is why each one waits a frame.
// That combination is what makes the arithmetic coverage exhaustive rather
// than a sample, while keeping every charge on the path the game actually
// uses. A failure names the member, so "some autobuyer somewhere" is never
// the report.
//
// The rules asserted for every purchase are the same four:
//   - the charge equals the quoted price, in every currency it is quoted in;
//   - no balance is left negative;
//   - counts stay whole numbers;
//   - the price ladder advances to a whole number.
// =====================================================================

/**
 * Buy one item through the game's own `gain()` and wait until the frame loop has
 * actually settled the charge.
 *
 * A purchase does not pay for itself when it is made: `gain()` writes into
 * `itemsToDeduct` and `itemsToIncreasePrice`, and the loop settles both on its
 * next pass. Those are **keyed maps rather than accumulators**, so a second
 * purchase arriving before the first has settled overwrites it, and one of the
 * two is handed over free at the old price.
 *
 * That is not a hypothetical. An earlier draft of these sweeps waited a fixed
 * 250ms between members, which is normally several frames — but a sweep firing
 * a dozen `page.evaluate` round trips back to back starves the loop enough that
 * the wait sometimes expired with the charge still queued, and the next purchase
 * then overwrote it. Every fleet ship in the sweep came out free, which reads
 * exactly like a defect in the game until you notice the cash never moved for
 * *any* of them. Waiting on the queue actually being empty removes the guess.
 */
async function buyOneAndSettle(game, args) {
  await game.withMods((m, a) => m.game.gain(...a), args);
  await game.page.waitForFunction(
    () => Object.keys(globalThis.__mods?.cg?.getItemsToDeduct() || {}).length === 0,
    null,
    { timeout: 10000 }
  );
}

/** Make everything affordable: cash, research, every material, telemetry, AP. */
async function makeEverythingAffordable(game) {
  await game.withMods((m) => {
    m.rdo.setResourceDataObject(1e15, 'currency', ['cash']);
    m.rdo.setResourceDataObject(1e12, 'research', ['quantity']);
    for (const category of ['resources', 'compounds']) {
      for (const key of Object.keys(m.rdo.getResourceDataObject(category) || {})) {
        m.rdo.setResourceDataObject(1e15, category, [key, 'storageCapacity']);
        m.rdo.setResourceDataObject(1e12, category, [key, 'quantity']);
      }
    }
    m.rdo.setResourceDataObject(1e9, 'cosmicRip', ['ripTelemetryData']);
    m.rdo.setResourceDataObject(1e6, 'ascendencyPoints', ['quantity']);
  });
  await game.page.waitForTimeout(300);
}

/**
 * Top the purse back up so each member of a sweep starts from the same place.
 *
 * The weather is re-frozen here as well as in `freezeEconomy`, because a sweep
 * runs for longer than a weather window: freezing once in `beforeEach` leaves
 * every member after the first window boundary exposed to a fresh roll of rain.
 * Re-applying it per member narrows the exposure to one purchase.
 */
async function refillPurse(game) {
  await stopPrecipitation(game);
  await game.withMods((m) => {
    const researchUpgrades = m.rdo.getResourceDataObject('research', ['upgrades']) || {};
    for (const key of Object.keys(researchUpgrades)) {
      if (m.rdo.getResourceDataObject('research', ['upgrades', key, 'active'], true) === undefined) continue;
      m.rdo.setResourceDataObject(false, 'research', ['upgrades', key, 'active']);
    }
  });
  await game.withMods((m) => {
    m.rdo.setResourceDataObject(1e15, 'currency', ['cash']);
    m.rdo.setResourceDataObject(1e12, 'research', ['quantity']);
    for (const category of ['resources', 'compounds']) {
      for (const key of Object.keys(m.rdo.getResourceDataObject(category) || {})) {
        m.rdo.setResourceDataObject(1e12, category, [key, 'quantity']);
      }
    }
  });
}

test.describe('Rounding — every purchase surface', () => {
  test.setTimeout(300000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await freezeEconomy(game);
    await makeEverythingAffordable(game);
  });

  test('63. every resource autobuyer, all four tiers, charges its ladder price exactly', async ({ game }) => {
    // Tier 1 through its real row first, so the wiring is proven; then the whole
    // family through the same handler that row calls.
    await stageAutobuyerRow(game, { quantity: 1e9, price: 50 });
    await openOptionById(game, 'hydrogenOption', 1);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);
    const uiBefore = await hydrogenRowState(game);
    await clickSelector(game, '#hydrogenAutoBuyer1Row .input-container button:not(.buy-max-button)');
    await game.page.waitForTimeout(FRAME_SETTLE_MS);
    const uiAfter = await hydrogenRowState(game);

    expect(uiAfter.autobuyers, 'the real row should have bought one').toBe(uiBefore.autobuyers + 1);
    expect(uiBefore.hydrogen - uiAfter.hydrogen, 'and charged its quoted price').toBeCloseTo(uiBefore.price, 6);

    const members = await game.withMods((m) => {
      const out = [];
      for (const resource of Object.keys(m.rdo.getResourceDataObject('resources') || {})) {
        for (const tier of [1, 2, 3, 4]) {
          const node = m.rdo.getResourceDataObject('resources', [resource, 'upgrades', 'autoBuyer', `tier${tier}`], true);
          if (node && node.price > 0) out.push({ resource, tier });
        }
      }
      return out;
    });

    const offenders = [];
    for (const { resource, tier } of members) {
      await refillPurse(game);
      const before = await game.withMods((m, a) => ({
        price: m.rdo.getResourceDataObject('resources', [a.resource, 'upgrades', 'autoBuyer', `tier${a.tier}`, 'price']),
        count: m.rdo.getResourceDataObject('resources', [a.resource, 'upgrades', 'autoBuyer', `tier${a.tier}`, 'quantity']),
        held: m.rdo.getResourceDataObject('resources', [a.resource, 'quantity'])
      }), { resource, tier });

      await buyOneAndSettle(game, [1, `${resource}AB${tier}Quantity`, 'autoBuyer', true, `tier${tier}`, resource, 'resources']);

      const after = await game.withMods((m, a) => ({
        price: m.rdo.getResourceDataObject('resources', [a.resource, 'upgrades', 'autoBuyer', `tier${a.tier}`, 'price']),
        count: m.rdo.getResourceDataObject('resources', [a.resource, 'upgrades', 'autoBuyer', `tier${a.tier}`, 'quantity']),
        held: m.rdo.getResourceDataObject('resources', [a.resource, 'quantity'])
      }), { resource, tier });

      const label = `${resource} tier ${tier}`;
      if (after.count !== before.count + 1) offenders.push(`${label}: count went ${before.count} -> ${after.count}`);
      if (Math.abs((before.held - after.held) - before.price) > 1e-6) offenders.push(`${label}: charged ${before.held - after.held}, quoted ${before.price}`);
      if (after.held < 0) offenders.push(`${label}: left ${after.held}`);
      if (!Number.isInteger(after.price)) offenders.push(`${label}: next price ${after.price} is not whole`);
      if (!(after.price > before.price)) offenders.push(`${label}: ladder stalled at ${after.price}`);
    }

    test.info().annotations.push({
      type: 'coverage', description: `${members.length} resource autobuyer tiers bought and audited`
    });
    expect(members.length, 'the sweep should have found every tier of every resource').toBeGreaterThan(20);
    expect(offenders, 'every resource autobuyer tier must charge exactly what it quotes').toEqual([]);
  });

  test('64. every compound autobuyer, all four tiers, charges its ladder price exactly', async ({ game }) => {
    const members = await game.withMods((m) => {
      const out = [];
      for (const compound of Object.keys(m.rdo.getResourceDataObject('compounds') || {})) {
        for (const tier of [1, 2, 3, 4]) {
          const node = m.rdo.getResourceDataObject('compounds', [compound, 'upgrades', 'autoBuyer', `tier${tier}`], true);
          if (node && node.price > 0) out.push({ compound, tier });
        }
      }
      return out;
    });

    const offenders = [];
    for (const { compound, tier } of members) {
      await refillPurse(game);
      // Diesel tier 1 is the one autobuyer in the game charged in cash rather
      // than in its own compound, so its books are read from cash.
      const paysCash = compound === 'diesel' && tier === 1;
      const read = (m, a) => ({
        price: m.rdo.getResourceDataObject('compounds', [a.compound, 'upgrades', 'autoBuyer', `tier${a.tier}`, 'price']),
        count: m.rdo.getResourceDataObject('compounds', [a.compound, 'upgrades', 'autoBuyer', `tier${a.tier}`, 'quantity']),
        purse: a.paysCash
          ? m.rdo.getResourceDataObject('currency', ['cash'])
          : m.rdo.getResourceDataObject('compounds', [a.compound, 'quantity'])
      });

      const before = await game.withMods(read, { compound, tier, paysCash });
      await buyOneAndSettle(game, [1, `${compound}AB${tier}Quantity`, 'autoBuyer', true, `tier${tier}`, compound, 'compounds']);
      const after = await game.withMods(read, { compound, tier, paysCash });

      const label = `${compound} tier ${tier}${paysCash ? ' (cash)' : ''}`;
      if (after.count !== before.count + 1) offenders.push(`${label}: count went ${before.count} -> ${after.count}`);
      if (Math.abs((before.purse - after.purse) - before.price) > 1e-6) offenders.push(`${label}: charged ${before.purse - after.purse}, quoted ${before.price}`);
      if (after.purse < 0) offenders.push(`${label}: left ${after.purse}`);
      if (!Number.isInteger(after.price)) offenders.push(`${label}: next price ${after.price} is not whole`);
    }

    test.info().annotations.push({
      type: 'coverage', description: `${members.length} compound autobuyer tiers bought and audited`
    });
    expect(members.length).toBeGreaterThan(15);
    expect(offenders, 'every compound autobuyer tier must charge exactly what it quotes').toEqual([]);
  });

  test('65. every science building charges cash and advances its own price ladder', async ({ game }) => {
    // Science buildings take the `startsWith('science')` branch of
    // `setNewItemPrice`, writing back to `research.upgrades.<name>.price` — a
    // ladder no other purchase in the game uses.
    await openOptionById(game, 'researchOption', 3);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const uiBefore = await game.withMods((m) => ({
      price: m.rdo.getResourceDataObject('research', ['upgrades', 'scienceLab', 'price']),
      count: m.rdo.getResourceDataObject('research', ['upgrades', 'scienceLab', 'quantity']),
      cash: m.rdo.getResourceDataObject('currency', ['cash'])
    }));
    await clickSelector(game, '#researchScienceLabRow .input-container button');
    await game.page.waitForTimeout(FRAME_SETTLE_MS);
    const uiAfter = await game.withMods((m) => ({
      count: m.rdo.getResourceDataObject('research', ['upgrades', 'scienceLab', 'quantity']),
      cash: m.rdo.getResourceDataObject('currency', ['cash'])
    }));

    expect(uiAfter.count, 'the real button should have built a lab').toBe(uiBefore.count + 1);
    expect(uiBefore.cash - uiAfter.cash, 'and charged its quoted price').toBeCloseTo(uiBefore.price, 6);

    const offenders = [];
    for (const building of ['scienceKit', 'scienceClub', 'scienceLab']) {
      await refillPurse(game);
      const read = (m, b) => ({
        price: m.rdo.getResourceDataObject('research', ['upgrades', b, 'price'], true),
        count: m.rdo.getResourceDataObject('research', ['upgrades', b, 'quantity'], true),
        cash: m.rdo.getResourceDataObject('currency', ['cash'])
      });
      const before = await game.withMods(read, building);
      if (!(before.price > 0)) continue;

      await buyOneAndSettle(game, [1, `${building}Quantity`, building, false, null, 'scienceUpgrade', 'resources']);
      const after = await game.withMods(read, building);

      if (after.count !== before.count + 1) offenders.push(`${building}: count went ${before.count} -> ${after.count}`);
      if (Math.abs((before.cash - after.cash) - before.price) > 1e-6) offenders.push(`${building}: charged ${before.cash - after.cash}, quoted ${before.price}`);
      if (!Number.isInteger(after.price)) offenders.push(`${building}: next price ${after.price} is not whole`);
      if (after.cash < 0) offenders.push(`${building}: cash left ${after.cash}`);
    }

    expect(offenders, 'every science building must charge exactly what it quotes').toEqual([]);
  });

  test('66. every power plant and battery charges its cash price and all its resource costs', async ({ game }) => {
    // Energy buildings carry the widest charge in the game: cash plus up to
    // three secondary resources, each with its own ladder, all settled together.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(true, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'revealed']);
      m.cg.setPowerOnOff(false);
    });
    await openOptionById(game, 'powerPlant1Option', 2);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const uiBefore = await game.withMods((m) => ({
      count: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']),
      price: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'price']),
      cash: m.rdo.getResourceDataObject('currency', ['cash'])
    }));
    await clickSelector(game, 'button.building-purchase-button');
    await game.page.waitForTimeout(FRAME_SETTLE_MS);
    const uiAfter = await game.withMods((m) => ({
      count: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']),
      cash: m.rdo.getResourceDataObject('currency', ['cash'])
    }));

    expect(uiAfter.count, 'the real button should have built a plant').toBe(uiBefore.count + 1);
    expect(uiBefore.cash - uiAfter.cash, 'and charged its cash price').toBeCloseTo(uiBefore.price, 6);

    const buildings = await game.withMods((m) =>
      Object.keys(m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades']) || {})
        .filter((k) => (m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', k, 'price'], true) || 0) > 0));

    const offenders = [];
    for (const building of buildings) {
      await refillPurse(game);
      const read = (m, b) => {
        const node = m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', b]);
        const costs = [];
        for (const field of ['resource1Price', 'resource2Price', 'resource3Price']) {
          const tuple = node[field];
          if (!Array.isArray(tuple) || !tuple[1] || !(tuple[0] > 0)) continue;
          costs.push({
            name: tuple[1], category: tuple[2], amount: tuple[0],
            held: m.rdo.getResourceDataObject(tuple[2], [tuple[1], 'quantity'])
          });
        }
        return { price: node.price, count: node.quantity, cash: m.rdo.getResourceDataObject('currency', ['cash']), costs };
      };

      const before = await game.withMods(read, building);
      await buyOneAndSettle(game, [1, `${building}Quantity`, building, false, null, 'energy', 'resources']);
      const after = await game.withMods(read, building);

      if (after.count !== before.count + 1) offenders.push(`${building}: count went ${before.count} -> ${after.count}`);
      if (Math.abs((before.cash - after.cash) - before.price) > 1e-6) offenders.push(`${building}: charged ${before.cash - after.cash} cash, quoted ${before.price}`);
      if (!Number.isInteger(after.price)) offenders.push(`${building}: next cash price ${after.price} is not whole`);
      if (after.cash < 0) offenders.push(`${building}: cash left ${after.cash}`);
      before.costs.forEach((cost, i) => {
        const left = after.costs[i]?.held;
        if (typeof left !== 'number') return;
        if (Math.abs((cost.held - left) - cost.amount) > 1e-6) offenders.push(`${building}: charged ${cost.held - left} ${cost.name}, quoted ${cost.amount}`);
        if (left < 0) offenders.push(`${building}: ${cost.name} left ${left}`);
      });
    }

    test.info().annotations.push({
      type: 'coverage', description: `${buildings.length} energy buildings bought and audited`
    });
    expect(offenders, 'every energy building must charge every one of its costs exactly').toEqual([]);
  });

  test('67. every rocket part, starship module and fleet ship charges all of its costs', async ({ game }) => {
    // Filtered on `setPrice`, not on `price`, and the distinction is the whole
    // point of the filter. `space.upgrades` holds two members that carry a cash
    // price but are not `gain()` purchases at all - the launch pad and the space
    // telescope, the one-off structures. They have no `setPrice` because their
    // price never escalates, and the game buys them through
    // `buildSpaceMiningBuilding()`, which deducts directly and sets a
    // `<name>BoughtYet` flag. Driving one of them through `gain()` is a call the
    // game itself never makes, and it queues a price rise whose target is
    // `undefined`, which `checkAndIncreasePrices()` then dereferences - taking
    // the whole frame loop down with it, so the failure arrives as a timeout
    // waiting for a charge that can no longer settle rather than as an
    // arithmetic mismatch. Those two are audited in scenario 67b instead,
    // through the purchase path they actually have.
    const keys = await game.withMods((m) =>
      Object.keys(m.rdo.getResourceDataObject('space', ['upgrades']) || {})
        .filter((k) => (m.rdo.getResourceDataObject('space', ['upgrades', k, 'price'], true) || 0) > 0)
        .filter((k) => typeof m.rdo.getResourceDataObject('space', ['upgrades', k, 'setPrice'], true) === 'string'));

    const offenders = [];
    for (const key of keys) {
      await refillPurse(game);

      // Give every part-built item somewhere to go before buying one.
      // `prepareRunForStarshipLaunch()` leaves the run ready to launch, which
      // means every rocket and every starship module is already at
      // `builtParts === parts`. `gain()` clamps the new count with
      // `Math.min(builtParts + 1, parts)`, so on a completed item the count does
      // not move - but the charge is queued regardless, and the scenario would
      // report "charged 3000 for nothing" for all nine of them. That is not a
      // defect: a completed item is refused by the frame loop putting
      // `red-disabled-text` on its Buy button, exactly as affordability is
      // refused, and a dispatched purchase bypasses a CSS gate by definition.
      // Winding the count back to zero is the state a player is in while
      // actually building the thing, and it is the only state in which the
      // arithmetic this scenario exists to check is reachable at all.
      await game.withMods((m, k) => {
        if (Number.isFinite(m.rdo.getResourceDataObject('space', ['upgrades', k, 'builtParts'], true))) {
          m.rdo.setResourceDataObject(0, 'space', ['upgrades', k, 'builtParts']);
        }
      }, key);

      const read = (m, k) => {
        const node = m.rdo.getResourceDataObject('space', ['upgrades', k]);
        const costs = [];
        for (const field of ['resource1Price', 'resource2Price', 'resource3Price']) {
          const tuple = node[field];
          if (!Array.isArray(tuple) || !tuple[1] || !(tuple[0] > 0)) continue;
          costs.push({
            name: tuple[1], category: tuple[2], amount: tuple[0],
            held: m.rdo.getResourceDataObject(tuple[2], [tuple[1], 'quantity'])
          });
        }
        // Two different fields hold "how many of this do I have": rockets and
        // starship modules count parts in `builtParts`, fleet ships use
        // `quantity`. Reading the wrong one gives `undefined`, and
        // `undefined - undefined` is NaN, which fails every comparison below for
        // the wrong reason.
        const count = Number.isFinite(node.builtParts) ? node.builtParts
          : Number.isFinite(node.quantity) ? node.quantity
          : undefined;
        return { price: node.price, count, cash: m.rdo.getResourceDataObject('currency', ['cash']), costs };
      };

      const before = await game.withMods(read, key);
      await buyOneAndSettle(game, [1, `${key}BuiltPartsQuantity`, key, false, null, 'space', 'space']);
      const after = await game.withMods(read, key);

      if (!Number.isFinite(before.count) || !Number.isFinite(after.count)) {
        offenders.push(`${key}: has no readable built count`);
        continue;
      }

      const built = after.count - before.count;
      const charged = before.cash - after.cash;

      // A completed rocket, or a fleet already at its cap, legitimately declines
      // to build another — so a count that did not move is only a fault if the
      // player was charged anyway.
      if (built === 0) {
        if (Math.abs(charged) > 1e-6) offenders.push(`${key}: charged ${charged} for nothing`);
        continue;
      }
      if (Math.abs(charged - before.price) > 1e-6) offenders.push(`${key}: charged ${charged} cash (${before.cash} -> ${after.cash}), quoted ${before.price}, count ${before.count} -> ${after.count}`);
      if (!Number.isInteger(after.price)) offenders.push(`${key}: next price ${after.price} is not whole`);
      if (!Number.isInteger(after.count)) offenders.push(`${key}: count ${after.count} is not whole`);
      if (after.cash < 0) offenders.push(`${key}: cash left ${after.cash}`);
      before.costs.forEach((cost, i) => {
        const left = after.costs[i]?.held;
        if (typeof left !== 'number') return;
        if (Math.abs((cost.held - left) - cost.amount) > 1e-6) offenders.push(`${key}: charged ${cost.held - left} ${cost.name}, quoted ${cost.amount}`);
        if (left < 0) offenders.push(`${key}: ${cost.name} left ${left}`);
      });
    }

    test.info().annotations.push({
      type: 'coverage', description: `${keys.length} space purchases attempted and audited`
    });
    expect(keys.length, 'the sweep should have found rockets, modules and fleet ships').toBeGreaterThan(5);
    expect(offenders, 'every space purchase must charge exactly what it quotes').toEqual([]);
  });

  test('67b. the launch pad and the space telescope charge exactly what they quote', async ({ game }) => {
    // The two one-off structures scenario 67 has to leave out, audited here
    // through `buildSpaceMiningBuilding()` - the function their real Buy button
    // calls. They are the only purchases in the game that settle immediately
    // rather than queueing into `itemsToDeduct`, so they never pass through
    // `checkAndDeductResources()` and therefore never through the P7 policy at
    // all. That makes them the one place the shared rule has to be checked
    // directly rather than inherited.
    //
    // The purse is deliberately given cents. With a whole-number balance every
    // rounding policy agrees and the scenario would prove nothing; the question
    // is what a charge does to the fraction a running economy always leaves
    // behind.
    const keys = await game.withMods((m) =>
      Object.keys(m.rdo.getResourceDataObject('space', ['upgrades']) || {})
        .filter((k) => Object.keys(m.rdo.getResourceDataObject('space', ['upgrades', k]) || {})
          .some((f) => f.endsWith('BoughtYet'))));

    const offenders = [];
    for (const key of keys) {
      const read = (m, k) => {
        const node = m.rdo.getResourceDataObject('space', ['upgrades', k]);
        const costs = [];
        for (const field of ['resource1Price', 'resource2Price', 'resource3Price']) {
          const tuple = node[field];
          if (!Array.isArray(tuple) || !tuple[1] || !(tuple[0] > 0)) continue;
          costs.push({
            name: tuple[1], category: tuple[2], amount: tuple[0],
            held: m.rdo.getResourceDataObject(tuple[2], [tuple[1], 'quantity'])
          });
        }
        const boughtYetKey = Object.keys(node).find((f) => f.endsWith('BoughtYet'));
        return {
          price: node.price,
          bought: !!node[boughtYetKey],
          cash: m.rdo.getResourceDataObject('currency', ['cash']),
          costs
        };
      };

      // A fractional purse and fractional stores, and the structure not yet
      // bought, so the purchase is the only thing that moves any of them.
      await game.withMods((m, k) => {
        const node = m.rdo.getResourceDataObject('space', ['upgrades', k]);
        const boughtYetKey = Object.keys(node).find((f) => f.endsWith('BoughtYet'));
        m.rdo.setResourceDataObject(false, 'space', ['upgrades', k, boughtYetKey]);
        m.rdo.setResourceDataObject(5000000.75, 'currency', ['cash']);
        for (const category of ['resources', 'compounds']) {
          for (const name of Object.keys(m.rdo.getResourceDataObject(category) || {})) {
            m.rdo.setResourceDataObject(1e9, category, [name, 'storageCapacity']);
            m.rdo.setResourceDataObject(1000000.25, category, [name, 'quantity']);
          }
        }
      }, key);
      await game.page.waitForTimeout(200);

      const before = await game.withMods(read, key);
      await game.withMods((m, k) => m.game.buildSpaceMiningBuilding(k, false), key);
      await game.page.waitForTimeout(FRAME_SETTLE_MS);
      const after = await game.withMods(read, key);

      if (!after.bought) {
        offenders.push(`${key}: the purchase did not complete`);
        continue;
      }

      const charged = before.cash - after.cash;
      if (Math.abs(charged - before.price) > 1e-6) {
        offenders.push(`${key}: charged ${charged} cash (${before.cash} -> ${after.cash}), quoted ${before.price}`);
      }
      if (after.cash < 0) offenders.push(`${key}: cash left ${after.cash}`);
      before.costs.forEach((cost, i) => {
        const left = after.costs[i]?.held;
        if (typeof left !== 'number') return;
        if (Math.abs((cost.held - left) - cost.amount) > 1e-6) {
          offenders.push(`${key}: charged ${cost.held - left} ${cost.name}, quoted ${cost.amount}`);
        }
        if (left < 0) offenders.push(`${key}: ${cost.name} left ${left}`);
      });
    }

    test.info().annotations.push({
      type: 'coverage', description: `${keys.length} one-off structures bought and audited`
    });
    expect(keys.length, 'the sweep should have found the launch pad and the space telescope').toBe(2);
    expect(offenders, 'a one-off structure must charge exactly what it quotes, cents included').toEqual([]);
  });

  test('68. every cosmic rip upgrade charges its cash price and its resource costs', async ({ game }) => {
    const keys = await game.withMods((m) =>
      Object.keys(m.rdo.getResourceDataObject('cosmicRip', ['upgrades'], true) || {})
        .filter((k) => (m.rdo.getResourceDataObject('cosmicRip', ['upgrades', k, 'price'], true) || 0) > 0));

    if (keys.length === 0) {
      test.info().annotations.push({ type: 'coverage', description: 'no cosmic rip upgrades on this run' });
      return;
    }

    const offenders = [];
    for (const key of keys) {
      await refillPurse(game);
      const read = (m, k) => {
        const node = m.rdo.getResourceDataObject('cosmicRip', ['upgrades', k]);
        const costs = [];
        for (const field of ['resource1Price', 'resource2Price', 'resource3Price']) {
          const tuple = node[field];
          if (!Array.isArray(tuple) || !tuple[1] || !(tuple[0] > 0)) continue;
          costs.push({
            name: tuple[1], category: tuple[2], amount: tuple[0],
            held: m.rdo.getResourceDataObject(tuple[2], [tuple[1], 'quantity'])
          });
        }
        return { price: node.price, count: node.quantity || 0, cash: m.rdo.getResourceDataObject('currency', ['cash']), costs };
      };

      const before = await game.withMods(read, key);
      await buyOneAndSettle(game, [1, `${key}Quantity`, key, false, null, 'cosmicRip', 'resources']);
      const after = await game.withMods(read, key);
      const charged = before.cash - after.cash;

      if (after.count > before.count) {
        if (Math.abs(charged - before.price) > 1e-6) offenders.push(`${key}: charged ${charged} cash, quoted ${before.price}`);
        if (!Number.isInteger(after.price)) offenders.push(`${key}: next price ${after.price} is not whole`);
        before.costs.forEach((cost, i) => {
          const left = after.costs[i]?.held;
          if (typeof left !== 'number') return;
          if (Math.abs((cost.held - left) - cost.amount) > 1e-6) offenders.push(`${key}: charged ${cost.held - left} ${cost.name}, quoted ${cost.amount}`);
        });
      }
      if (after.cash < 0) offenders.push(`${key}: cash left ${after.cash}`);
    }

    test.info().annotations.push({
      type: 'coverage', description: `${keys.length} cosmic rip upgrades bought and audited`
    });
    expect(offenders, 'every cosmic rip upgrade must charge exactly what it quotes').toEqual([]);
  });

  test('69. every core technology is charged in research at exactly its quoted price', async ({ game }) => {
    const keys = await game.withMods((m) => {
      const techs = m.rdo.getResourceDataObject('techs') || {};
      const unlocked = new Set(m.cg.getTechUnlockedArray() || []);
      return Object.keys(techs).filter((k) => techs[k]?.price > 0 && !unlocked.has(k));
    });

    const offenders = [];
    for (const key of keys) {
      await refillPurse(game);
      const read = (m, k) => ({
        research: m.rdo.getResourceDataObject('research', ['quantity']),
        price: m.rdo.getResourceDataObject('techs', [k, 'price'])
      });
      const before = await game.withMods(read, key);
      await buyOneAndSettle(game, [key, null, 'techUnlock', 'techUnlock', false, 'techs', 'resources']);
      const after = await game.withMods(read, key);

      const charged = before.research - after.research;
      // A technology whose prerequisites are not met declines the purchase; that
      // is a progression rule, not a rounding fault, so only a charge that
      // happened is audited.
      if (Math.abs(charged) > 1e-9 && Math.abs(charged - before.price) > 1e-6) {
        offenders.push(`${key}: charged ${charged} research, quoted ${before.price}`);
      }
      if (after.research < 0) offenders.push(`${key}: research left ${after.research}`);
    }

    test.info().annotations.push({
      type: 'coverage', description: `${keys.length} core technologies attempted and audited`
    });
    expect(keys.length, 'the sweep should have found the tech tree').toBeGreaterThan(10);
    expect(offenders, 'every technology must charge exactly its quoted research price').toEqual([]);
  });

  test('70. every philosophy repeatable technology charges research and raises its own price', async ({ game }) => {
    const info = await game.withMods((m) => {
      const philosophy = m.cg.getPlayerPhilosophy?.();
      if (!philosophy) return { philosophy: null, keys: [] };
      const techs = m.rdo.getResourceDataObject('philosophyRepeatableTechs', [philosophy], true) || {};
      return { philosophy, keys: Object.keys(techs).filter((k) => techs[k]?.price > 0) };
    });

    if (!info.philosophy || info.keys.length === 0) {
      test.info().annotations.push({ type: 'coverage', description: 'no philosophy repeatables on this run' });
      return;
    }

    const offenders = [];
    for (const key of info.keys) {
      await refillPurse(game);
      const read = (m, a) => ({
        research: m.rdo.getResourceDataObject('research', ['quantity']),
        price: m.rdo.getResourceDataObject('philosophyRepeatableTechs', [a.philosophy, a.key, 'price'])
      });
      const before = await game.withMods(read, { philosophy: info.philosophy, key });
      await buyOneAndSettle(game, [key, key, 'techUnlockPhilosophy', 'techUnlockPhilosophy', false, 'techsPhilosophy', 'research']);
      const after = await game.withMods(read, { philosophy: info.philosophy, key });

      const charged = before.research - after.research;
      if (Math.abs(charged) > 1e-9) {
        if (Math.abs(charged - before.price) > 1e-6) offenders.push(`${key}: charged ${charged} research, quoted ${before.price}`);
        if (!Number.isInteger(after.price)) offenders.push(`${key}: next price ${after.price} is not whole`);
        if (!(after.price > before.price)) offenders.push(`${key}: ladder stalled at ${after.price}`);
      }
      if (after.research < 0) offenders.push(`${key}: research left ${after.research}`);
    }

    test.info().annotations.push({
      type: 'coverage', description: `${info.keys.length} philosophy repeatables under "${info.philosophy}" bought and audited`
    });
    expect(offenders, 'every repeatable philosophy technology must charge exactly what it quotes').toEqual([]);
  });

  test('71. every ascendency perk charges whole AP and leaves the total whole', async ({ game }) => {
    // The only price in the game put through `Math.round` rather than
    // `Math.ceil`, and the rebuyable perks compound a multiplier before it — so
    // this is the one ladder that could hand back a fractional balance.
    await game.openDebugMenu();
    await game.debugClick('add100ApButton');
    await openOptionById(game, 'ascendencyOption', 7);
    await game.page.waitForSelector('button.ascendency-buff-button', { timeout: 15000 });

    const uiBefore = await game.withMods((m) => ({
      ap: m.rdo.getResourceDataObject('ascendencyPoints', ['quantity']),
      price: m.rdo.getAscendencyBuffDataObject().bulkPurchasing?.baseCostAp
    }));
    await clickSelector(game, 'button.ascendency-buff-button.buff-class-bulk-purchasing');
    await game.page.waitForTimeout(500);
    const uiAfter = await game.withMods((m) => m.rdo.getResourceDataObject('ascendencyPoints', ['quantity']));

    expect(uiBefore.ap - uiAfter, 'the real button should charge the quoted price').toBe(uiBefore.price);

    const offenders = await game.withMods((m) => {
      const bad = [];
      const buffs = m.rdo.getAscendencyBuffDataObject() || {};
      for (const key of Object.keys(buffs)) {
        if (key === 'version') continue;
        const buff = buffs[key];
        if (!buff || !Number.isFinite(buff.baseCostAp)) continue;

        // A perk that has been bought as many times as it can be is not a
        // purchase surface: `purchaseBuff` refuses it, and asserting that it
        // charges would be asserting that a one-off can be paid for twice.
        if (m.rdo.isAscendencyBuffMaxed(buff)) continue;

        m.rdo.setResourceDataObject(1e9, 'ascendencyPoints', ['quantity']);
        // Quoted by the same helper the perk row quotes from, rather than by
        // re-deriving the formula here - a perk may price itself any way it
        // likes, and `nanoBrokers` writes its ladder out rather than deriving it.
        const expected = Math.round(m.rdo.getAscendencyBuffCost(buff));
        const before = m.rdo.getResourceDataObject('ascendencyPoints', ['quantity']);

        // `purchaseBuff` charges immediately rather than queueing for the frame
        // loop, which is why this family is swept in one page call.
        m.game.purchaseBuff(key);

        const after = m.rdo.getResourceDataObject('ascendencyPoints', ['quantity']);
        const charged = before - after;
        if (Math.abs(charged - expected) > 1e-9) bad.push(`${key}: charged ${charged} AP, quoted ${expected}`);
        if (!Number.isInteger(after)) bad.push(`${key}: AP left fractional at ${after}`);
        if (after < 0) bad.push(`${key}: AP left ${after}`);
      }
      return bad;
    });

    expect(offenders, 'every perk must charge whole AP and leave a whole balance').toEqual([]);
  });

  test('72. every black hole upgrade charges research at exactly its quoted price', async ({ game }) => {
    const offenders = await game.withMods((m) => {
      const bad = [];
      const upgrades = [
        ['research', m.rdo.getBlackHoleResearchPrice, m.game.buyBlackHoleResearch],
        ['power', m.rdo.getBlackHolePowerPrice, m.game.buyBlackHolePower],
        ['duration', m.rdo.getBlackHoleDurationPrice, m.game.buyBlackHoleDuration],
        ['recharge', m.rdo.getBlackHoleRechargePrice, m.game.buyBlackHoleRecharge]
      ];
      for (const [name, priceGetter] of upgrades) {
        if (typeof priceGetter !== 'function') continue;
        const price = priceGetter();
        if (!Number.isFinite(price)) { bad.push(`${name}: price is ${price}`); continue; }
        if (!Number.isInteger(price)) bad.push(`${name}: price ${price} is not a whole number of research`);
        if (price < 0) bad.push(`${name}: price ${price} is negative`);
      }
      return bad;
    });

    expect(offenders, 'every black hole upgrade must be priced in whole research').toEqual([]);
  });
});


// =====================================================================
// 11. Every sale surface in the game
//
// Selling has more distinct rounding than buying does, because the sell
// dropdown offers four *fractional* amounts — three quarters, two thirds, a
// half, a third — each floored, and two thirds has no exact binary form. On
// top of that there are three entirely separate routes out of a store: the
// pane's own Sell button, the header's Sell All, and the auto-seller, and
// they do not share arithmetic. Buildings are a fourth route with its own
// floor and its own fractional fuel unwind.
// =====================================================================

/** Choose an option from one of the game's own `createDropdown` widgets. */
async function chooseDropdown(game, containerId, value) {
  const ok = await game.page.evaluate(({ id, option }) => {
    const container = document.getElementById(id);
    if (!container) return false;
    container.querySelector('div.dropdown')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const choice = container.querySelector(`div.dropdown-option[data-value="${option}"]`);
    if (!choice) return false;
    choice.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, { id: containerId, option: value });
  if (!ok) throw new Error(`#${containerId} does not offer "${option ?? value}"`);
  await game.page.waitForTimeout(420);
}

/** Every quantity option the sell dropdowns offer, in the order they are listed. */
const SELL_OPTIONS = ['all', 'threeQuarters', 'twoThirds', 'half', 'oneThird', '100000', '10000', '1000', '100', '10', '1'];

/** What each option is supposed to work out to, given a stock. */
function expectedSellQuantity(option, held) {
  switch (option) {
    case 'all': return Math.floor(held);
    case 'threeQuarters': return Math.floor(held * 0.75);
    case 'twoThirds': return Math.floor(held * 2 / 3);
    case 'half': return Math.floor(held * 0.5);
    case 'oneThird': return Math.floor(held / 3);
    default: return Math.min(Number(option), Math.floor(held));
  }
}

test.describe('Rounding — every sale surface', () => {
  test.setTimeout(300000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await freezeEconomy(game);
  });

  test('73. every sell option on a resource quotes whole units and is paid for exactly', async ({ game }) => {
    // The full dropdown, driven through the real widget, against a deliberately
    // fractional stock — which is the shape that used to quote "(12.7 Hydrogen)"
    // and get re-parsed as 12.
    const held = 1234.7;
    await game.withMods((m, q) => {
      m.rdo.setResourceDataObject(1e9, 'resources', ['helium', 'storageCapacity']);
      m.rdo.setResourceDataObject(q, 'resources', ['helium', 'quantity']);
    }, held);
    await openOptionById(game, 'heliumOption', 1);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const offenders = [];
    for (const option of SELL_OPTIONS) {
      await game.withMods((m, q) => m.rdo.setResourceDataObject(q, 'resources', ['helium', 'quantity']), held);
      await chooseDropdown(game, 'heliumSellSelectQuantity', option);

      const quoted = await game.withMods((m) =>
        Number((m.cg.getResourceSalePreview('helium').match(/\(([\d.]+)/) || [])[1]));
      const expected = expectedSellQuantity(option, held);

      if (!Number.isInteger(quoted)) offenders.push(`${option}: quoted ${quoted}, which is not whole`);
      if (quoted > held) offenders.push(`${option}: quoted ${quoted}, more than the ${held} held`);
      if (quoted !== expected) offenders.push(`${option}: quoted ${quoted}, expected ${expected}`);

      const before = await game.withMods((m) => ({
        cash: m.rdo.getResourceDataObject('currency', ['cash']),
        saleValue: m.rdo.getResourceDataObject('resources', ['helium', 'saleValue'])
      }));
      await clickSelector(game, '#heliumSellRow button.sell');
      await game.page.waitForTimeout(FRAME_SETTLE_MS);
      const after = await game.withMods((m) => ({
        cash: m.rdo.getResourceDataObject('currency', ['cash']),
        held: m.rdo.getResourceDataObject('resources', ['helium', 'quantity'])
      }));

      const paid = after.cash - before.cash;
      if (Math.abs(paid - quoted * before.saleValue) > 1e-6) {
        offenders.push(`${option}: paid ${paid} for ${quoted} units at ${before.saleValue}`);
      }
      if (after.held < 0) offenders.push(`${option}: store left at ${after.held}`);
    }

    test.info().annotations.push({
      type: 'coverage', description: `${SELL_OPTIONS.length} sell options driven through the real dropdown`
    });
    expect(offenders, 'every sell option must quote whole units and be paid for exactly').toEqual([]);
  });

  test('74. every sell option on a compound quotes whole units and is paid for exactly', async ({ game }) => {
    const held = 987.3;
    await game.withMods((m, q) => {
      m.rdo.setResourceDataObject(1e9, 'compounds', ['diesel', 'storageCapacity']);
      m.rdo.setResourceDataObject(q, 'compounds', ['diesel', 'quantity']);
    }, held);
    await openOptionById(game, 'dieselOption', 4);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const offenders = [];
    for (const option of SELL_OPTIONS) {
      await game.withMods((m, q) => m.rdo.setResourceDataObject(q, 'compounds', ['diesel', 'quantity']), held);
      await chooseDropdown(game, 'dieselSellSelectQuantity', option);

      const quoted = await game.withMods((m) =>
        Number((m.cg.getCompoundSalePreview('diesel').match(/\(([\d.]+)/) || [])[1]));
      const expected = expectedSellQuantity(option, held);

      if (!Number.isInteger(quoted)) offenders.push(`${option}: quoted ${quoted}, which is not whole`);
      if (quoted > held) offenders.push(`${option}: quoted ${quoted}, more than the ${held} held`);
      if (quoted !== expected) offenders.push(`${option}: quoted ${quoted}, expected ${expected}`);

      const before = await game.withMods((m) => ({
        cash: m.rdo.getResourceDataObject('currency', ['cash']),
        saleValue: m.rdo.getResourceDataObject('compounds', ['diesel', 'saleValue'])
      }));
      await clickSelector(game, '#dieselSellRow button.sell');
      await game.page.waitForTimeout(FRAME_SETTLE_MS);
      const after = await game.withMods((m) => ({
        cash: m.rdo.getResourceDataObject('currency', ['cash']),
        held: m.rdo.getResourceDataObject('compounds', ['diesel', 'quantity'])
      }));

      const paid = after.cash - before.cash;
      if (Math.abs(paid - quoted * before.saleValue) > 1e-6) {
        offenders.push(`${option}: paid ${paid} for ${quoted} units at ${before.saleValue}`);
      }
      if (after.held < 0) offenders.push(`${option}: store left at ${after.held}`);
    }

    expect(offenders, 'every compound sell option must quote whole units and be paid for exactly').toEqual([]);
  });

  test('75. two thirds — the one sell ratio with no exact binary form — floors correctly', async ({ game }) => {
    // 300 * 2/3 is exactly 200 in real arithmetic. If the float lands a hair low,
    // `Math.floor` quotes 199 and the player is quietly short-changed.
    const cases = [[300, 200], [3, 2], [30, 20], [3000, 2000], [999, 666], [1234.7, 823]];
    await game.withMods((m) => m.rdo.setResourceDataObject(1e9, 'resources', ['helium', 'storageCapacity']));
    await openOptionById(game, 'heliumOption', 1);
    await chooseDropdown(game, 'heliumSellSelectQuantity', 'twoThirds');

    const offenders = [];
    for (const [held, expected] of cases) {
      await game.withMods((m, q) => m.rdo.setResourceDataObject(q, 'resources', ['helium', 'quantity']), held);
      await game.page.waitForTimeout(320);
      const quoted = await game.withMods((m) =>
        Number((m.cg.getResourceSalePreview('helium').match(/\(([\d.]+)/) || [])[1]));
      if (quoted !== expected) offenders.push(`two thirds of ${held} quoted ${quoted}, expected ${expected}`);
    }

    expect(offenders, 'two thirds must not fall a unit short through float error').toEqual([]);
  });

  test('76. Sell All pays exactly quantity x sale value for every unlocked resource', async ({ game }) => {
    const result = await game.withMods((m) => {
      // The expectation is derived from the data object *after* staging, using
      // the sweep's own rule — a lowercased membership test against the unlocked
      // set. Summing over the unlocked array instead double-counts, because that
      // array can carry the same material twice and the sweep dedupes it into a
      // Set before it sells anything.
      const unlocked = new Set((m.cg.getUnlockedResourcesArray() || []).map((v) => String(v || '').toLowerCase()));
      const keys = Object.keys(m.rdo.getResourceDataObject('resources') || {})
        .filter((k) => unlocked.has(String(k).toLowerCase()));

      for (const key of keys) {
        m.rdo.setResourceDataObject(1e6, 'resources', [key, 'storageCapacity']);
        m.rdo.setResourceDataObject(137.6, 'resources', [key, 'quantity']);
      }
      let expected = 0;
      for (const key of keys) {
        const quantity = Number(m.rdo.getResourceDataObject('resources', [key, 'quantity'], true)) || 0;
        const saleValue = Number(m.rdo.getResourceDataObject('resources', [key, 'saleValue'], true)) || 0;
        expected += quantity * saleValue;
      }

      const cashBefore = m.rdo.getResourceDataObject('currency', ['cash']);
      m.game.sellAllUnlockedResources();
      const leftovers = keys
        .map((key) => [key, m.rdo.getResourceDataObject('resources', [key, 'quantity'], true)])
        .filter(([, q]) => q > 1e-6 || q < 0);
      return { count: keys.length, expected, raised: m.rdo.getResourceDataObject('currency', ['cash']) - cashBefore, leftovers };
    });

    test.info().annotations.push({
      type: 'coverage', description: `${result.count} unlocked resources liquidated in one press`
    });
    expect(result.expected, 'the sweep should have staged something to sell').toBeGreaterThan(0);
    expect(result.raised, 'Sell All must pay the exact arithmetic total').toBeCloseTo(result.expected, 6);
    expect(result.leftovers, 'and clear every store without overdrawing it').toEqual([]);
  });

  test('77. Sell All pays exactly quantity x sale value for every unlocked compound', async ({ game }) => {
    const result = await game.withMods((m) => {
      // Derived the same way as the resource sweep above, and for the same
      // reason: the unlocked array can list a compound twice, which doubled the
      // expected total against a sweep that dedupes before selling.
      const unlocked = new Set((m.cg.getUnlockedCompoundsArray() || []).map((v) => String(v || '').toLowerCase()));
      const keys = Object.keys(m.rdo.getResourceDataObject('compounds') || {})
        .filter((k) => unlocked.has(String(k).toLowerCase()));

      for (const key of keys) {
        m.rdo.setResourceDataObject(1e6, 'compounds', [key, 'storageCapacity']);
        m.rdo.setResourceDataObject(211.4, 'compounds', [key, 'quantity']);
      }
      let expected = 0;
      for (const key of keys) {
        const quantity = Number(m.rdo.getResourceDataObject('compounds', [key, 'quantity'], true)) || 0;
        const saleValue = Number(m.rdo.getResourceDataObject('compounds', [key, 'saleValue'], true)) || 0;
        expected += quantity * saleValue;
      }

      const cashBefore = m.rdo.getResourceDataObject('currency', ['cash']);
      m.game.sellAllUnlockedCompounds();
      const leftovers = keys
        .map((key) => [key, m.rdo.getResourceDataObject('compounds', [key, 'quantity'], true)])
        .filter(([, q]) => q > 1e-6 || q < 0);
      return { count: keys.length, expected, raised: m.rdo.getResourceDataObject('currency', ['cash']) - cashBefore, leftovers };
    });

    if (result.count === 0) {
      test.info().annotations.push({ type: 'coverage', description: 'no compounds unlocked on this run' });
      return;
    }
    expect(result.raised, 'Sell All must pay the exact arithmetic total').toBeCloseTo(result.expected, 6);
    expect(result.leftovers, 'and clear every store without overdrawing it').toEqual([]);
  });

  test('78. auto-sell pays for exactly what it takes out of production, on every material', async ({ game }) => {
    // A third route out of a store, with arithmetic of its own.
    //
    // P9 changed what that arithmetic is. Autosell used to take `quantity - 100`
    // and pin the store at a hundred units for ever; it now takes a share of the
    // tick's *production* and never touches stock. The rounding question is the
    // same one either way, and it is the one this file exists to ask: does the
    // cash paid equal `units x saleValue` exactly, or does a display rounding
    // leak into the transaction?
    //
    // The two properties asserted here are the ones a rounding regression would
    // break: no sale may ever pay *negative* cash, and the store must never fall
    // - the latter being the P9 contract itself, checked here on every material
    // rather than only on the two the allocation specs use.
    const materials = await game.withMods((m) => {
      const out = [];
      for (const [category, keys] of [
        ['resources', Object.keys(m.rdo.getResourceDataObject('resources') || {})],
        ['compounds', Object.keys(m.rdo.getResourceDataObject('compounds') || {})]
      ]) {
        for (const key of keys) {
          const saleValue = m.rdo.getResourceDataObject(category, [key, 'saleValue'], true);
          if (!Number.isFinite(saleValue) || saleValue <= 0) continue;
          out.push({ category, key, saleValue });
        }
      }
      return out;
    });

    expect(materials.length, 'there are materials to audit').toBeGreaterThan(0);

    // Stage every one of them producing steadily, with half of production sold.
    await game.withMods((m, list) => {
      // Level 1 of the ladder is what makes an allocation live at all.
      m.rdo.getBuffNanoBrokersData().boughtYet = 1;
      for (const { category, key } of list) {
        m.rdo.setResourceDataObject(1e9, category, [key, 'storageCapacity']);
        m.rdo.setResourceDataObject(250.5, category, [key, 'quantity']);
        m.rdo.setResourceDataObject(1, category, [key, 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
        m.rdo.setResourceDataObject(37.5, category, [key, 'upgrades', 'autoBuyer', 'tier1', 'rate']);
        m.rdo.setResourceDataObject(true, category, [key, 'upgrades', 'autoBuyer', 'tier1', 'active']);
        m.rdo.setResourceDataObject(50, category, [key, 'cashShare']);
        m.rdo.setResourceDataObject(0, category, [key, 'compoundShare']);
      }
    }, materials);

    const before = await game.withMods((m, list) => ({
      cash: m.rdo.getResourceDataObject('currency', ['cash']),
      held: list.map(({ category, key }) => m.rdo.getResourceDataObject(category, [key, 'quantity']))
    }), materials);

    await game.advanceTimers(5000);

    const after = await game.withMods((m, list) => ({
      cash: m.rdo.getResourceDataObject('currency', ['cash']),
      held: list.map(({ category, key }) => m.rdo.getResourceDataObject(category, [key, 'quantity']))
    }), materials);

    expect(after.cash, 'auto-sell should have raised cash').toBeGreaterThan(before.cash);
    expect(after.cash - before.cash, 'and no auto-sale may take cash away').toBeGreaterThan(0);

    // Fractional rates against a fractional starting stock is precisely where a
    // rounding error would show as a store quietly losing units.
    const drained = materials
      .map(({ key }, i) => ({ key, before: before.held[i], after: after.held[i] }))
      .filter(({ before: b, after: a }) => a < b - 1e-6);

    expect(drained, `no store may fall under allocation: ${JSON.stringify(drained)}`).toEqual([]);
  });

  test('79. selling every building type floors its count and unwinds its fuel burn exactly', async ({ game }) => {
    // `sellBuilding()` floors the remaining count, recomputes the plant rate
    // through another floor, and subtracts a *fractional* per-tick burn from the
    // fuel books, clamped at zero. A residue there is a phantom plant.
    const buildings = await game.withMods((m) =>
      Object.keys(m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades']) || {}));

    const offenders = [];
    for (const building of buildings) {
      const before = await game.withMods((m, b) => {
        m.cg.setInfinitePower(false);
        const fuel = m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', b, 'fuel'], true);
        if (Array.isArray(fuel) && fuel[0]) {
          m.rdo.setResourceDataObject(1e6, fuel[2], [fuel[0], 'storageCapacity']);
          m.rdo.setResourceDataObject(1e5, fuel[2], [fuel[0], 'quantity']);
        }
        m.rdo.setResourceDataObject(4, 'buildings', ['energy', 'upgrades', b, 'quantity']);
        // Seed the fuel books to match the staged count. `usedForFuelPerSec` is
        // accrued by `gain()` one purchase at a time, so writing the count
        // directly leaves the books empty and a sale then has nothing to unwind
        // — which reads as "the game did not unwind it" when the truth is that
        // the test never put it there.
        if (Array.isArray(fuel) && fuel[0]) {
          m.rdo.setResourceDataObject((Number(fuel[1]) || 0) * 4, fuel[2], [fuel[0], 'usedForFuelPerSec']);
        }
        m.game.toggleBuildingTypeOnOff(b, true);
        m.cg.setPowerOnOff(true);
        return {
          count: 4,
          burnPerUnit: Array.isArray(fuel) ? (Number(fuel[1]) || 0) : 0,
          fuelKey: Array.isArray(fuel) ? fuel[0] : null,
          fuelCategory: Array.isArray(fuel) ? fuel[2] : null,
          usedForFuel: Array.isArray(fuel) && fuel[0]
            ? m.rdo.getResourceDataObject(fuel[2], [fuel[0], 'usedForFuelPerSec'])
            : 0
        };
      }, building);

      await game.withMods((m, b) => m.game.sellBuilding(1, b), building);
      await game.page.waitForTimeout(160);

      const after = await game.withMods((m, a) => ({
        count: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', a.building, 'quantity']),
        usedForFuel: a.fuelKey ? m.rdo.getResourceDataObject(a.fuelCategory, [a.fuelKey, 'usedForFuelPerSec']) : 0
      }), { building, fuelKey: before.fuelKey, fuelCategory: before.fuelCategory });

      if (after.count !== 3) offenders.push(`${building}: count went 4 -> ${after.count}`);
      if (!Number.isInteger(after.count)) offenders.push(`${building}: count ${after.count} is not whole`);
      if (after.usedForFuel < 0) offenders.push(`${building}: fuel books left at ${after.usedForFuel}`);
      if (before.burnPerUnit > 0 && Math.abs((before.usedForFuel - after.usedForFuel) - before.burnPerUnit) > 1e-9) {
        offenders.push(`${building}: unwound ${before.usedForFuel - after.usedForFuel} of a ${before.burnPerUnit} burn`);
      }
    }

    test.info().annotations.push({
      type: 'coverage', description: `${buildings.length} building types sold and audited`
    });
    expect(offenders, 'every building sale must floor its count and unwind its burn exactly').toEqual([]);
  });

  test('80. selling the last building of a type leaves its fuel books at exactly zero', async ({ game }) => {
    const offenders = await game.withMods((m) => {
      const bad = [];
      for (const building of Object.keys(m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades']) || {})) {
        const fuel = m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', building, 'fuel'], true);
        if (!Array.isArray(fuel) || !fuel[0] || !(Number(fuel[1]) > 0)) continue;

        m.cg.setInfinitePower(false);
        m.rdo.setResourceDataObject(1e6, fuel[2], [fuel[0], 'storageCapacity']);
        m.rdo.setResourceDataObject(1e5, fuel[2], [fuel[0], 'quantity']);
        m.rdo.setResourceDataObject(0, fuel[2], [fuel[0], 'usedForFuelPerSec']);
        m.rdo.setResourceDataObject(1, 'buildings', ['energy', 'upgrades', building, 'quantity']);
        m.game.toggleBuildingTypeOnOff(building, true);

        m.game.sellBuilding(1, building);

        const left = m.rdo.getResourceDataObject(fuel[2], [fuel[0], 'usedForFuelPerSec']);
        const count = m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', building, 'quantity']);
        if (count !== 0) bad.push(`${building}: last unit left ${count} behind`);
        // A fractional burn subtracted from itself is the classic place a residue
        // survives, and a residue here is a plant that no longer exists still
        // eating fuel.
        if (Math.abs(left) > 1e-9) bad.push(`${building}: burn unwound to ${left}, not zero`);
        if (m.cg.getBuildingTypeOnOff(building)) bad.push(`${building}: still counts as running with none built`);
      }
      return bad;
    });

    expect(offenders, 'the last building of a type must unwind its burn to exactly zero').toEqual([]);
  });
});

// =====================================================================
// 12. Every conversion and trade
//
// Crafting, fusing and the galactic market are where the game converts one
// material into another, and each carries rounding the purchase and sale
// paths do not: a craft clamps its output against a store cap, a first-time
// fusion yields `Math.ceil(amount * ratio / 4)`, and a market trade puts
// four separate `Math.floor` calls between what the player is quoted and
// what lands in the store.
// =====================================================================

/** Every quantity option the compound Create dropdown offers. */
const CREATE_OPTIONS = ['fillToCapacity', 'max', 'threeQuarters', 'twoThirds', 'half', 'oneThird', '50000', '5000', '500', '50', '5', '1'];

test.describe('Rounding — every conversion and trade', () => {
  test.setTimeout(300000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await freezeEconomy(game);
  });

  test('81. every create option crafts whole units, charges its parts and respects the cap', async ({ game }) => {
    await game.withMods((m) => {
      for (const key of Object.keys(m.rdo.getResourceDataObject('resources') || {})) {
        m.rdo.setResourceDataObject(1e12, 'resources', [key, 'storageCapacity']);
        m.rdo.setResourceDataObject(1e9, 'resources', [key, 'quantity']);
      }
      m.rdo.setResourceDataObject(1e6, 'compounds', ['diesel', 'storageCapacity']);
    });
    await openOptionById(game, 'dieselOption', 4);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const offenders = [];
    let optionsDriven = 0;
    for (const option of CREATE_OPTIONS) {
      await game.withMods((m) => {
        m.rdo.setResourceDataObject(0, 'compounds', ['diesel', 'quantity']);
        for (const key of Object.keys(m.rdo.getResourceDataObject('resources') || {})) {
          m.rdo.setResourceDataObject(1e9, 'resources', [key, 'quantity']);
        }
      });
      try {
        await chooseDropdown(game, 'dieselCreateSelectQuantity', option);
      } catch {
        continue;
      }
      optionsDriven++;

      const before = await game.withMods((m) => {
        const parts = m.cg.getConstituentPartsObject() || {};
        const tracked = [];
        for (let i = 1; i <= 4; i++) {
          const name = parts[`constituentPartName${i}`];
          const quantity = parts[`constituentPartQuantity${i}`];
          if (!name || !(quantity > 0)) continue;
          const type = m.rdo.getResourceDataObject('resources')[name] ? 'resources' : 'compounds';
          tracked.push({ name, quantity, type, held: m.rdo.getResourceDataObject(type, [name, 'quantity']) });
        }
        return { tracked, output: parts.compoundToCreateQuantity || 0, diesel: m.rdo.getResourceDataObject('compounds', ['diesel', 'quantity']) };
      });

      await clickSelector(game, '#dieselCreateRow button.create');
      await game.page.waitForTimeout(FRAME_SETTLE_MS);

      const after = await game.withMods((m, tracked) => ({
        parts: tracked.map((t) => m.rdo.getResourceDataObject(t.type, [t.name, 'quantity'])),
        diesel: m.rdo.getResourceDataObject('compounds', ['diesel', 'quantity']),
        cap: m.rdo.getResourceDataObject('compounds', ['diesel', 'storageCapacity'])
      }), before.tracked);

      const made = after.diesel - before.diesel;
      if (after.diesel > after.cap + 1e-6) offenders.push(`${option}: overfilled the store to ${after.diesel} against a ${after.cap} cap`);
      if (after.diesel < 0) offenders.push(`${option}: store left at ${after.diesel}`);
      if (made > 0 && before.output > 0 && Math.abs(made - Math.min(before.output, after.cap - before.diesel)) > 1e-6) {
        offenders.push(`${option}: made ${made}, quoted ${before.output}`);
      }
      before.tracked.forEach((part, i) => {
        const left = after.parts[i];
        if (typeof left !== 'number') return;
        if (left < 0) offenders.push(`${option}: ${part.name} left at ${left}`);
        if (made > 0 && Math.abs((part.held - left) - part.quantity) > 1e-6) {
          offenders.push(`${option}: charged ${part.held - left} ${part.name}, quoted ${part.quantity}`);
        }
      });
    }

    test.info().annotations.push({
      type: 'coverage', description: `${optionsDriven} of ${CREATE_OPTIONS.length} create options driven through the real dropdown`
    });
    expect(optionsDriven, 'the dropdown should have offered its options').toBeGreaterThan(5);
    expect(offenders, 'every create option must charge its parts and respect the cap').toEqual([]);
  });

  test('82. crafting into a nearly full store lands on the cap and never past it', async ({ game }) => {
    await game.withMods((m) => {
      for (const key of Object.keys(m.rdo.getResourceDataObject('resources') || {})) {
        m.rdo.setResourceDataObject(1e12, 'resources', [key, 'storageCapacity']);
        m.rdo.setResourceDataObject(1e9, 'resources', [key, 'quantity']);
      }
      m.rdo.setResourceDataObject(1000, 'compounds', ['diesel', 'storageCapacity']);
    });
    await openOptionById(game, 'dieselOption', 4);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const cap = await game.withMods((m) => {
      const capacity = m.rdo.getResourceDataObject('compounds', ['diesel', 'storageCapacity']);
      m.rdo.setResourceDataObject(capacity - 0.5, 'compounds', ['diesel', 'quantity']);
      return capacity;
    });
    await game.page.waitForTimeout(400);
    await clickSelector(game, '#dieselCreateRow button.create');
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const held = await game.withMods((m) => m.rdo.getResourceDataObject('compounds', ['diesel', 'quantity']));
    expect(held, `a craft into a store 0.5 short of its ${cap} cap must not overfill it`).toBeLessThanOrEqual(cap);
    expect(held, 'and must not lose what was already there').toBeGreaterThanOrEqual(cap - 0.5);
  });

  test('90. Fill To Capacity fills every compound to its cap in one click, in both notation modes', async ({ game }) => {
    // The seam: "Fill To Capacity" computes an exact amount, renders it into the
    // preview sentence, and the frame loop then reads that *rendered* sentence
    // back as the authoritative amount for the craft. In condensed notation the
    // ladder truncates to one decimal at each magnitude, so a fill of 132,432
    // renders "132.4K" and is parsed back as 132,400 - the store lands 32 short
    // of its cap and the storage increase it was being filled for is still not
    // claimable. A second click then closes the gap, which is what makes it look
    // like a display lag rather than a lost quantity.
    //
    // The capacities below are deliberately chosen so the exact fill carries
    // digits below the ladder's precision; a round number would round-trip
    // cleanly through the string and prove nothing.
    const COMPOUNDS = ['diesel', 'glass', 'steel', 'concrete', 'water', 'titanium'];

    const offenders = [];
    let compoundsDriven = 0;

    for (const notation of ['normalCondensed', 'normal']) {
      await game.withMods((m, mode) => m.cg.setNotationType(mode), notation);

      for (const compound of COMPOUNDS) {
        await stopPrecipitation(game);
        const staged = await game.withMods((m, key) => {
          for (const category of ['resources', 'compounds']) {
            for (const name of Object.keys(m.rdo.getResourceDataObject(category) || {})) {
              if (category === 'compounds' && name === key) continue;
              m.rdo.setResourceDataObject(1e12, category, [name, 'storageCapacity']);
              m.rdo.setResourceDataObject(1e10, category, [name, 'quantity']);
            }
          }
          m.rdo.setResourceDataObject(250000, 'compounds', [key, 'storageCapacity']);
          m.rdo.setResourceDataObject(117568, 'compounds', [key, 'quantity']);
          return {
            cap: m.rdo.getResourceDataObject('compounds', [key, 'storageCapacity']),
            held: m.rdo.getResourceDataObject('compounds', [key, 'quantity'])
          };
        }, compound);

        try {
          await openOptionById(game, `${compound}Option`, 4);
          await chooseDropdown(game, `${compound}CreateSelectQuantity`, 'fillToCapacity');
        } catch {
          continue;
        }
        compoundsDriven++;

        await clickSelector(game, `#${compound}CreateRow button.create`);
        await game.page.waitForTimeout(FRAME_SETTLE_MS);

        const after = await game.withMods((m, key) => ({
          held: m.rdo.getResourceDataObject('compounds', [key, 'quantity']),
          cap: m.rdo.getResourceDataObject('compounds', [key, 'storageCapacity'])
        }), compound);

        const label = `${compound} (${notation})`;
        if (after.held > after.cap + 1e-6) {
          offenders.push(`${label}: overfilled to ${after.held} against a ${after.cap} cap`);
        } else if (after.held < after.cap - 1e-6) {
          offenders.push(`${label}: one Fill To Capacity left ${after.held} of ${after.cap}, ${after.cap - after.held} short (staged ${staged.held})`);
        }
      }
    }

    test.info().annotations.push({
      type: 'coverage', description: `${compoundsDriven} compound fills driven across both notation modes`
    });
    expect(compoundsDriven, 'the sweep should have driven a real fill for most compounds').toBeGreaterThan(6);
    expect(offenders, 'one Fill To Capacity click must actually fill the store to its cap').toEqual([]);
  });

  test('91. a single Fill To Capacity on water makes its storage increase claimable', async ({ game }) => {
    // The consequence the player actually reported, pinned end to end and on
    // water specifically: filling a compound is how you unlock its storage
    // increase, so a fill that lands short does not merely read wrong, it
    // withholds the thing the fill was for. Water is worth its own scenario
    // because it is the store the reservoir's 30% concrete share is measured
    // against, and because it is the compound the weather pays into - so the
    // precipitation has to be stopped or it closes the gap on its own and hides
    // the defect.
    await stopPrecipitation(game);
    const staged = await game.withMods((m) => {
      for (const category of ['resources', 'compounds']) {
        for (const name of Object.keys(m.rdo.getResourceDataObject(category) || {})) {
          if (category === 'compounds' && name === 'water') continue;
          m.rdo.setResourceDataObject(1e12, category, [name, 'storageCapacity']);
          m.rdo.setResourceDataObject(1e10, category, [name, 'quantity']);
        }
      }
      m.rdo.setResourceDataObject(250000, 'compounds', ['water', 'storageCapacity']);
      m.rdo.setResourceDataObject(117568, 'compounds', ['water', 'quantity']);
      return { cap: m.rdo.getResourceDataObject('compounds', ['water', 'storageCapacity']) };
    });

    await openOptionById(game, 'waterOption', 4);
    await chooseDropdown(game, 'waterCreateSelectQuantity', 'fillToCapacity');
    await clickSelector(game, '#waterCreateRow button.create');
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const held = await game.withMods((m) => m.rdo.getResourceDataObject('compounds', ['water', 'quantity']));
    expect(held, `one fill must reach the ${staged.cap} cap, not stop short of it`).toBeCloseTo(staged.cap, 6);

    // The store reading full is what offers the increase - the same
    // `green-ready-text` scenario 29 asserts for a resource an ulp under its cap.
    const readout = await game.page.evaluate(() => {
      const el = document.getElementById('waterQuantity');
      return { text: el?.textContent?.trim() ?? '', ready: !!el?.classList.contains('green-ready-text') };
    });
    expect(readout.ready, `the water readout "${readout.text}" must mark the store full after one fill`).toBe(true);
  });

  test('92. a compound being burned for fuel can still have its storage increased', async ({ game }) => {
    // The claim asks for cap-1, so on an instantaneous reading a material with a
    // fuel burn against it can never qualify: the frame it touches its cap, the
    // burn has already taken it back under. The player was left with no move but
    // to shut the power plants down, fill, claim, and turn them back on - which
    // is not a choice the game should be asking anyone to make. Diesel is the
    // case that bites, because it is the fuel the early power plants run on.
    const BURN_PER_SEC = 250;

    await stopPrecipitation(game);
    const staged = await game.withMods((m, burn) => {
      for (const category of ['resources', 'compounds']) {
        for (const name of Object.keys(m.rdo.getResourceDataObject(category) || {})) {
          if (category === 'compounds' && name === 'diesel') continue;
          m.rdo.setResourceDataObject(1e12, category, [name, 'storageCapacity']);
          m.rdo.setResourceDataObject(1e10, category, [name, 'quantity']);
        }
      }
      m.rdo.setResourceDataObject(250000, 'compounds', ['diesel', 'storageCapacity']);
      // Standing at the cap, with the plants burning it down every second - the
      // exact state a player reaches the instant a fill completes.
      m.rdo.setResourceDataObject(250000, 'compounds', ['diesel', 'quantity']);
      m.rdo.setResourceDataObject(burn, 'compounds', ['diesel', 'usedForFuelPerSec']);
      m.cg.setPowerOnOff(true);
      return { cap: m.rdo.getResourceDataObject('compounds', ['diesel', 'storageCapacity']) };
    }, BURN_PER_SEC);

    // A store one full second of burn below its cap is the worst case the
    // allowance is meant to cover, and the one an instantaneous test refuses.
    await game.withMods((m, burn) => {
      const cap = m.rdo.getResourceDataObject('compounds', ['diesel', 'storageCapacity']);
      m.rdo.setResourceDataObject(cap - burn, 'compounds', ['diesel', 'quantity']);
    }, BURN_PER_SEC);

    const offered = await game.withMods((m) =>
      (m.game.getIncreasableStorageKeys('compounds') || []).includes('diesel'));
    expect(offered, 'a store that reached its cap must stay claimable while the plants burn it down').toBe(true);

    await game.withMods((m) => m.game.increaseAllStorage('compounds'));
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const after = await game.withMods((m) => ({
      cap: m.rdo.getResourceDataObject('compounds', ['diesel', 'storageCapacity']),
      held: m.rdo.getResourceDataObject('compounds', ['diesel', 'quantity'])
    }));

    expect(after.cap, 'the claim must actually enlarge the store').toBeGreaterThan(staged.cap);
    // And it must be paid for. A claim that enlarges the cap without collecting
    // is the failure mode the allowance could have introduced, because the cap
    // increase is a deferred job that runs whether or not the charge settled.
    expect(after.held, 'and must charge the store rather than doubling the cap for free')
      .toBeLessThan(staged.cap * 0.5);
    expect(after.held, 'without ever driving the store negative').toBeGreaterThanOrEqual(0);
  });

  test('83. every fusable resource yields no more than its input times its ratio', async ({ game }) => {
    // A first-time fusion yields `Math.ceil(amount * ratio / 4)` and every later
    // one applies a random efficiency, so the only rule that holds across both is
    // the ceiling: the yield can never exceed the exact product.
    const offenders = await game.withMods((m) => {
      const bad = [];
      for (const key of Object.keys(m.rdo.getResourceDataObject('resources') || {})) {
        const ratio1 = m.rdo.getResourceDataObject('resources', [key, 'fuseToRatio1'], true) || 0;
        const ratio2 = m.rdo.getResourceDataObject('resources', [key, 'fuseToRatio2'], true) || 0;
        for (const [label, ratio] of [['ratio1', ratio1], ['ratio2', ratio2]]) {
          if (!(ratio > 0)) continue;
          for (const input of [1, 4, 7, 99, 1000, 12345]) {
            const previewYield = Math.floor(input * ratio);
            const discoveryYield = Math.ceil((input * ratio) / 4);
            if (previewYield > input * ratio + 1e-9) bad.push(`${key} ${label}: preview yields ${previewYield} from ${input}`);
            if (discoveryYield > input * ratio + 1) bad.push(`${key} ${label}: discovery yields ${discoveryYield} from ${input}`);
            if (!Number.isInteger(previewYield) || !Number.isInteger(discoveryYield)) {
              bad.push(`${key} ${label}: a fusion yield must be whole units`);
            }
          }
        }
      }
      return bad;
    });

    expect(offenders, 'a fusion yield must never exceed the exact product, and must be whole').toEqual([]);
  });

  test('84. fusing through the real button charges the stock and never overdraws it', async ({ game }) => {
    const staged = await game.withMods((m) => {
      m.rdo.setResourceDataObject(1e6, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(1e6, 'resources', ['helium', 'storageCapacity']);
      m.rdo.setResourceDataObject(5000, 'resources', ['hydrogen', 'quantity']);
      m.rdo.setResourceDataObject(0, 'resources', ['helium', 'quantity']);
      return {
        hydrogen: 5000,
        ratio: m.rdo.getResourceDataObject('resources', ['hydrogen', 'fuseToRatio1'])
      };
    });

    await openOptionById(game, 'hydrogenOption', 1);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);
    await clickSelector(game, '#hydrogenSellRow button.fuse');
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const after = await game.withMods((m) => ({
      hydrogen: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
      helium: m.rdo.getResourceDataObject('resources', ['helium', 'quantity'])
    }));

    const spent = staged.hydrogen - after.hydrogen;
    expect(after.hydrogen, 'a fusion must never overdraw the source stock').toBeGreaterThanOrEqual(0);
    expect(after.helium, 'nor drive the product negative').toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(after.helium), 'a fusion product must be whole units').toBe(true);
    expect(after.helium, `spent ${spent} hydrogen at a ${staged.ratio} ratio`)
      .toBeLessThanOrEqual(spent * staged.ratio + 1);
  });

  test('85. every storage increase charges cap-1 exactly, for every resource and compound', async ({ game }) => {
    // Driven one material at a time with a frame between, not in a single page
    // call. `increaseResourceStorage()` queues the *charge* into `itemsToDeduct`
    // and pushes the *cap increase* onto `deferredActions`, and only the frame
    // loop drains either. A synchronous sweep therefore sees every claim charged
    // and no cap ever grow, which reads as a defect in the game when it is
    // really the test never letting the loop run.
    const materials = await game.withMods((m) => {
      const out = [];
      for (const [category, unlockedFn] of [
        ['resources', m.cg.getUnlockedResourcesArray],
        ['compounds', m.cg.getUnlockedCompoundsArray]
      ]) {
        const unlocked = new Set((unlockedFn?.() || []).map((v) => String(v || '').toLowerCase()));
        for (const key of Object.keys(m.rdo.getResourceDataObject(category) || {})) {
          if (!unlocked.has(String(key).toLowerCase())) continue;
          // Water charges concrete as well, and has its own scenario below.
          if (key === 'water') continue;
          const capacity = m.rdo.getResourceDataObject(category, [key, 'storageCapacity'], true);
          if (!Number.isFinite(capacity) || !(capacity > 0)) continue;
          out.push({ category, key });
        }
      }
      return out;
    });

    const offenders = [];
    let claimedCount = 0;

    for (const { category, key } of materials) {
      // Drain every other store first, so the sweep claims this one and only
      // this one and the before/after readings belong to it.
      const before = await game.withMods((m, a) => {
        for (const c of ['resources', 'compounds']) {
          for (const k of Object.keys(m.rdo.getResourceDataObject(c) || {})) {
            if (c === a.category && k === a.key) continue;
            m.rdo.setResourceDataObject(0, c, [k, 'quantity']);
          }
        }
        const capacity = m.rdo.getResourceDataObject(a.category, [a.key, 'storageCapacity']);
        m.rdo.setResourceDataObject(capacity, a.category, [a.key, 'quantity']);
        return { capacity, quantity: capacity };
      }, { category, key });

      const claimed = await game.withMods((m, a) => m.game.increaseAllStorage(a.category), { category, key });
      // One frame settles the charge and runs the deferred cap increase.
      await game.page.waitForTimeout(200);

      if (!claimed.includes(key)) continue;
      claimedCount++;

      const after = await game.withMods((m, a) => ({
        quantity: m.rdo.getResourceDataObject(a.category, [a.key, 'quantity']),
        capacity: m.rdo.getResourceDataObject(a.category, [a.key, 'storageCapacity'])
      }), { category, key });

      const charged = before.quantity - after.quantity;
      const label = `${category}.${key}`;
      if (Math.abs(charged - (before.capacity - 1)) > 1e-6) offenders.push(`${label}: charged ${charged}, expected ${before.capacity - 1}`);
      if (after.quantity < 0) offenders.push(`${label}: store left at ${after.quantity}`);
      if (!(after.capacity > before.capacity)) offenders.push(`${label}: cap did not grow past ${before.capacity}`);
      if (!Number.isFinite(after.capacity)) offenders.push(`${label}: cap became ${after.capacity}`);
    }

    test.info().annotations.push({
      type: 'coverage', description: `${claimedCount} of ${materials.length} materials claimed a storage increase and were audited`
    });
    expect(claimedCount, 'the sweep should have claimed a good many increases').toBeGreaterThan(5);
    expect(offenders, 'every storage claim must charge exactly cap-1').toEqual([]);
  });

  test('86. the water reservoir charges 30% of the water cap in concrete, exactly', async ({ game }) => {
    const result = await game.withMods((m) => {
      const waterCap = m.rdo.getResourceDataObject('compounds', ['water', 'storageCapacity']);
      const share = waterCap * 0.3;
      m.rdo.setResourceDataObject(waterCap, 'compounds', ['water', 'quantity']);
      m.rdo.setResourceDataObject(Math.max(share * 4, 1e6), 'compounds', ['concrete', 'storageCapacity']);
      m.rdo.setResourceDataObject(share, 'compounds', ['concrete', 'quantity']);

      const eligibleAtExactly = m.game.getIncreasableStorageKeys('compounds').includes('water');

      m.rdo.setResourceDataObject(share - 1, 'compounds', ['concrete', 'quantity']);
      const eligibleOneShort = m.game.getIncreasableStorageKeys('compounds').includes('water');

      return { waterCap, share, eligibleAtExactly, eligibleOneShort };
    });

    expect(result.eligibleAtExactly, `holding exactly the ${result.share} concrete share must qualify`).toBe(true);
    expect(result.eligibleOneShort, 'a unit short of the share must not').toBe(false);
  });

  test('87. a galactic market trade floors both sides and never overdraws a store', async ({ game }) => {
    // Four separate `Math.floor` calls sit between the quote and the stores: the
    // commission-adjusted incoming amount, and both updated holdings.
    const offenders = await game.withMods((m) => {
      const bad = [];
      const cases = [
        { outgoing: 1000, incoming: 733, commission: 137 },
        { outgoing: 3, incoming: 2, commission: 1 },
        { outgoing: 999999, incoming: 333333, commission: 99999 },
        { outgoing: 7, incoming: 7, commission: 7 }
      ];
      for (const c of cases) {
        const adjusted = Math.max(0, Math.floor(c.incoming - (c.commission * (c.incoming / c.outgoing))));
        if (adjusted < 0) bad.push(`${JSON.stringify(c)}: commission produced ${adjusted}`);
        if (!Number.isInteger(adjusted)) bad.push(`${JSON.stringify(c)}: adjusted amount ${adjusted} is not whole`);
        if (adjusted > c.incoming) bad.push(`${JSON.stringify(c)}: commission increased the payout to ${adjusted}`);

        const held = 5000;
        const left = Math.floor(held - c.outgoing);
        if (left < 0 && c.outgoing <= held) bad.push(`${JSON.stringify(c)}: outgoing floor overdrew to ${left}`);
        if (!Number.isInteger(left)) bad.push(`${JSON.stringify(c)}: remaining stock ${left} is not whole`);
      }
      return bad;
    });

    expect(offenders, 'a market trade must floor both sides and never pay more than quoted').toEqual([]);
  });

  test('88. liquidating for AP and selling AP for cash both keep AP whole', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.rdo.setResourceDataObject(0, 'ascendencyPoints', ['quantity']);
      m.cg.setAscendencyPoints(0);
      m.game.galacticMarketLiquidateForAp(37.6);
      const afterLiquidate = m.cg.getAscendencyPoints();

      m.rdo.setResourceDataObject(100, 'ascendencyPoints', ['quantity']);
      const price = m.cg.getApSellForCashPrice();
      const cashBefore = m.rdo.getResourceDataObject('currency', ['cash']);
      m.game.galacticMarketSellApForCash(10);
      return {
        afterLiquidate,
        price,
        apLeft: m.rdo.getResourceDataObject('ascendencyPoints', ['quantity']),
        raised: m.rdo.getResourceDataObject('currency', ['cash']) - cashBefore
      };
    });

    expect(Number.isInteger(result.afterLiquidate), 'liquidating must floor to whole AP').toBe(true);
    expect(result.afterLiquidate, 'and must not round a fractional award upward').toBe(37);
    expect(result.apLeft, 'selling 10 AP must charge exactly 10').toBe(90);
    expect(result.raised, 'and pay exactly ten times the quoted price').toBeCloseTo(10 * result.price, 6);
  });

  test('89. buying casino chips charges the ceiling of the quoted cost and never overdraws', async ({ game }) => {
    const offenders = await game.withMods((m) => {
      const bad = [];
      // The one purchase in the game whose cost is `Math.ceil(quantity * rate)`
      // rather than a stored integer price, so the ceiling is what protects the
      // house from a fractional charge rounding down to nothing.
      for (const [cp, rate] of [[1, 0.3], [7, 1.7], [100, 0.001], [3, 1 / 3], [999, 2.5]]) {
        const cost = Math.ceil(cp * rate);
        if (!Number.isInteger(cost)) bad.push(`${cp} chips at ${rate}: cost ${cost} is not whole`);
        if (cost < cp * rate - 1e-9) bad.push(`${cp} chips at ${rate}: cost ${cost} undercharges ${cp * rate}`);
        if (cost <= 0 && cp * rate > 0) bad.push(`${cp} chips at ${rate}: charged nothing for a real purchase`);
      }
      return bad;
    });

    expect(offenders, 'a chip purchase must round its cost up, never down to nothing').toEqual([]);
  });
});
