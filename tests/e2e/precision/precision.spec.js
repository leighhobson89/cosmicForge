/**
 * Area: Precision — rounding, affordability and display consistency
 * Plan: docs/player-feedback-improvement-plan.md (P7)
 *
 * Every quantity in this game is a float and every price is an integer, so the
 * game is permanently asking a float whether it has reached an integer. Before
 * P7 it asked that question in three different places with three different
 * answers: the frame loop decided the Buy button's colour with a bare `>=`, the
 * charge settled with a bare `>`, and the display rounded — upward — with
 * `toFixed` and `Math.round`. The player's report was the visible consequence:
 * a balance that reads as enough on screen, on a button the game refuses.
 *
 * `precision.js` replaces all three with one rule: **round holdings down, round
 * costs up, and share one tolerance between every comparison.** Because prices
 * are integral, that rule makes an equivalence hold exactly —
 *
 *     canAfford(quantity, cost)  <=>  displayQuantity(quantity) >= displayCost(cost)
 *
 * — and that equivalence is what these specs are really about. It is asserted
 * three ways: directly against the module, through the rendered stat bar and
 * button classes of a real purchase row, and through a Buy Max run.
 *
 * Two conventions from the area's neighbours carry over here and matter:
 *
 *  - Affordability in this game is enforced *only* by the `red-disabled-text`
 *    class, whose CSS is `pointer-events: none`. Nothing below infers "the
 *    purchase was refused" from dispatching a click at a red button — a
 *    dispatched click goes straight through that gate by design. The class is
 *    the assertion, and a click is only ever used to prove a purchase that
 *    *should* succeed does.
 *  - Nothing here calls a formatter and checks its return value in isolation and
 *    stops there. Where a defect was player-visible, the assertion reads the
 *    rendered DOM the player would have been looking at.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** One frame is ~10ms; several give the loop time to reclassify a row. */
const FRAME_SETTLE_MS = 700;

// ------------------------------------------------------------------- utilities

/** Open a side-menu option by id, revealing its row first. */
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

/**
 * Dispatch a click straight at an element.
 *
 * Several of these controls sit under their row's description container, where a
 * real click lands on the coverer. Note this also bypasses `pointer-events:
 * none`, which is why it is only ever used on controls the test has already
 * asserted are enabled.
 */
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

/** The text the player is actually reading in the cash slot of the stat bar. */
function cashStatText(game) {
  return game.page.evaluate(() => document.getElementById('cashStat')?.textContent?.trim() ?? '');
}

/** Pull the number out of a rendered stat, whatever currency symbol wraps it. */
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
 * Stop every automatic flow that would move a balance mid-assertion.
 *
 * `prepareRunForStarshipLaunch` staffs the whole autobuyer ladder and switches
 * autosell on, so a spec that stages "exactly the price" and then reads it back
 * a frame later is racing production into the store and sales out of it. Every
 * assertion below is about a balance sitting on a boundary, so the boundary has
 * to hold still.
 */
async function freezeEconomy(game) {
  await game.withMods((m) => {
    // Every write is guarded on the field already existing. `setResourceDataObject`
    // creates missing intermediate objects rather than refusing the write, so an
    // unguarded sweep would invent an `upgrades.autoBuyer.tier4` on materials
    // that have never had one — a test-shaped fiction the rest of the game would
    // then read back as real.
    const present = (category, path) =>
      m.rdo.getResourceDataObject(category, path, true) !== undefined;

    for (const category of ['resources', 'compounds']) {
      for (const key of Object.keys(m.rdo.getResourceDataObject(category) || {})) {
        for (const flag of ['autoSell', 'autoCreate']) {
          if (present(category, [key, flag])) {
            m.rdo.setResourceDataObject(false, category, [key, flag]);
          }
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
  await game.page.waitForTimeout(250);
}

/**
 * Stage hydrogen with a huge cap and nothing producing into it.
 *
 * Every tier is emptied, not just tier 1: `prepareRunForStarshipLaunch` staffs
 * the whole ladder, and a tier still running would keep topping the balance up
 * mid-test, so an assertion about an exact holding would race the frame loop.
 * Tier 1 in particular needs no power, so switching the grid off would not stop
 * it.
 */
async function stageHydrogen(game, { quantity = 1000, price = 1000 } = {}) {
  await game.withMods((m, cfg) => {
    m.rdo.setResourceDataObject(1e12, 'resources', ['hydrogen', 'storageCapacity']);
    for (let tier = 1; tier <= 4; tier++) {
      m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', `tier${tier}`, 'quantity']);
      m.rdo.setResourceDataObject(false, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', `tier${tier}`, 'active']);
    }
    m.rdo.setResourceDataObject(cfg.price, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'price']);
    m.rdo.setResourceDataObject(false, 'resources', ['hydrogen', 'autoSell']);
    // Last, so nothing above can clamp or overwrite it.
    m.rdo.setResourceDataObject(cfg.quantity, 'resources', ['hydrogen', 'quantity']);
  }, { quantity, price });
}

// ===================================================== the policy, on its own

test.describe('Precision — the one rounding policy', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('affordability and the displayed figures cannot disagree, at any scale', async ({ game }) => {
    // The property the whole item exists to establish, swept over the boundary
    // cases that produced the bug reports: a balance a few ulps short of a round
    // price, a balance a whole fraction short of it, and a balance exactly on it.
    //
    // Swept against the real module in page scope rather than re-implemented
    // here, because a re-implementation would only prove the test and the game
    // agree on arithmetic they both took from the same place.
    const result = await game.withMods(async () => {
      const p = await import('/precision.js');
      const offsets = [-0.5, -0.004, -1e-6, -1e-10, -1e-13, 0, 1e-13, 1e-10, 0.004, 0.5];
      const costs = [1, 2, 50, 300, 999, 1000, 12345, 1e6, 1e9, 1e12];

      const mismatches = [];
      let checked = 0;

      for (const cost of costs) {
        for (const offset of offsets) {
          const quantity = cost + offset;
          const affordable = p.canAfford(quantity, cost);
          const looksAffordable = p.displayQuantity(quantity) >= p.displayCost(cost);
          checked++;
          if (affordable !== looksAffordable) {
            mismatches.push({ cost, offset, affordable, looksAffordable });
          }
        }
      }

      return {
        checked,
        mismatches,
        // The two directions the policy is *supposed* to round, spelled out so a
        // regression that inverted one is named rather than merely counted.
        holdingNeverOverstated: p.displayQuantity(999.6) === 999,
        costNeverUnderstated: p.displayCost(299.4) === 300,
        driftForgiven: p.canAfford(1000 - 1e-13, 1000),
        // The tolerance must forgive drift and nothing larger: 0.1 short is a
        // shortfall the player can see, and forgiving it would be a free unit.
        realShortfallRefused: p.canAfford(999.9, 1000) === false,
        overdraftImpossible: p.settleSpend(1000 - 1e-13, 1000) >= 0
      };
    });

    test.info().annotations.push({
      type: 'accounting error',
      description: `${result.mismatches.length} display/affordability disagreements across ${result.checked} boundary cases`
    });

    expect(result.mismatches, 'what is displayed and what is charged must agree everywhere').toEqual([]);
    expect(result.holdingNeverOverstated, '999.6 held must never read as 1000').toBe(true);
    expect(result.costNeverUnderstated, 'a cost of 299.4 must never read as 299').toBe(true);
    expect(result.driftForgiven, 'a balance an ulp under the price must still buy').toBe(true);
    expect(result.realShortfallRefused, 'being 0.1 short is a real shortfall, not drift').toBe(true);
    expect(result.overdraftImpossible, 'the tolerance must not be a route to a negative balance').toBe(true);
  });
});

// ================================== the stat bar against a real purchase gate

test.describe('Precision — "it looks affordable but the button is red"', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await freezeEconomy(game);
  });

  test('the cash the stat bar shows is never more than the purchase gate will find', async ({ game }) => {
    // 299.996 is the exact shape of the player's report: `toFixed(2)` rounded it
    // to "300.00" and printed it beside a 300 price the game then refused. The
    // row is a real one — powerPlant1 costs 300 cash and 100 carbon — and its
    // button state is read from the class the frame loop puts on it.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(true, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'revealed']);
      m.rdo.setResourceDataObject(1e9, 'resources', ['carbon', 'storageCapacity']);
      m.rdo.setResourceDataObject(1e9, 'resources', ['carbon', 'quantity']);
      m.rdo.setResourceDataObject(300, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'price']);
      m.rdo.setResourceDataObject(0, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
    });
    await openOptionById(game, 'powerPlant1Option', 2);

    const readGate = async () => {
      await game.page.waitForTimeout(FRAME_SETTLE_MS);
      return {
        shown: await cashStatText(game),
        blocked: await game.page.evaluate(() => {
          const button = [...document.querySelectorAll('button.building-purchase-button')]
            .find((b) => b.offsetParent !== null);
          return button ? button.classList.contains('red-disabled-text') : null;
        })
      };
    };

    await game.withMods((m) => m.rdo.setResourceDataObject(299.996, 'currency', ['cash']));
    const short = await readGate();

    expect(numberFrom(short.shown),
      `the stat bar read ${short.shown} on a balance of 299.996 — it must not round up to the price`)
      .toBeLessThan(300);
    expect(short.blocked, 'and the button must indeed be refusing the purchase').toBe(true);

    // The other half of the equivalence: on exactly the price, the figure shown
    // reaches it and the button opens.
    await game.withMods((m) => m.rdo.setResourceDataObject(300, 'currency', ['cash']));
    const exact = await readGate();

    expect(numberFrom(exact.shown), 'exactly the price must read as exactly the price')
      .toBeGreaterThanOrEqual(300);
    expect(exact.blocked, 'and the button must open on it').toBe(false);

    test.info().annotations.push({
      type: 'accounting error',
      description: `stat bar at 299.996 now reads ${short.shown} (was "$300.00" beside a refused 300 purchase)`
    });
  });

  test('a building whose secondary resource is held at exactly its price is buyable', async ({ game }) => {
    // The strict `>` defect. The frame loop coloured a building's secondary
    // resource costs with `quantity > price` while the charge settles on `>=`,
    // so holding exactly the 100 carbon powerPlant1 asks for showed carbon in
    // red and killed the button — on a purchase the game would have honoured.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(true, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'revealed']);
      m.rdo.setResourceDataObject(300, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'price']);
      m.rdo.setResourceDataObject([100, 'carbon', 'resources'], 'buildings', ['energy', 'upgrades', 'powerPlant1', 'resource1Price']);
      m.rdo.setResourceDataObject(0, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
      m.rdo.setResourceDataObject(1e9, 'currency', ['cash']);
      m.rdo.setResourceDataObject(1e6, 'resources', ['carbon', 'storageCapacity']);
      // The grid off as well as the autobuyers idle, because powerPlant1 burns
      // carbon: a plant already running would draw the staged balance down
      // between staging it and reading the row back.
      m.cg.setPowerOnOff(false);
      // Exactly the quoted price of the secondary resource, not one more.
      m.rdo.setResourceDataObject(100, 'resources', ['carbon', 'quantity']);
    });
    await openOptionById(game, 'powerPlant1Option', 2);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const gate = await game.page.evaluate(() => {
      const button = [...document.querySelectorAll('button.building-purchase-button')]
        .find((b) => b.offsetParent !== null);
      const row = button?.closest('.option-row') || button?.parentElement?.parentElement;
      const spans = [...(row?.querySelectorAll('.description-container span') || [])];
      return {
        blocked: button ? button.classList.contains('red-disabled-text') : null,
        spanClasses: spans.map((s) => ({
          text: s.textContent.trim(),
          red: s.classList.contains('red-disabled-text')
        }))
      };
    });

    expect(gate.blocked,
      `holding exactly the quoted carbon price must not read as unaffordable (spans: ${JSON.stringify(gate.spanClasses)})`)
      .toBe(false);
    expect(gate.spanClasses.filter((s) => s.red),
      'no cost in the row should be showing red when every one of them is exactly met')
      .toEqual([]);

    // And the purchase it was blocking really does go through and really is paid
    // for — the point of the fix is a purchase gained, not just a colour changed.
    await clickSelector(game, 'button.building-purchase-button');
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const after = await game.withMods((m) => ({
      plants: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']),
      carbon: m.rdo.getResourceDataObject('resources', ['carbon', 'quantity'])
    }));

    expect(after.plants, 'the purchase the old gate refused should now complete').toBe(1);
    expect(after.carbon, 'and be charged in full').toBeCloseTo(0, 6);
    expect(after.carbon, 'without going overdrawn').toBeGreaterThanOrEqual(0);
  });

  test('a store an ulp under its cap reads as full and still earns its storage increase', async ({ game }) => {
    // Production clamps with Math.min, so a store filled by the tick lands on the
    // cap exactly — but one filled by any other route (an offline gain, a rebirth
    // grant) can sit a fraction of an ulp short. A plain `Math.floor` then showed
    // it one unit below its cap, and the eligibility sweep's bare `<` refused the
    // increase the player had plainly earned.
    const cap = await game.withMods((m) => {
      const capacity = m.rdo.getResourceDataObject('resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(capacity - 1e-10, 'resources', ['hydrogen', 'quantity']);
      return capacity;
    });

    await openOptionById(game, 'hydrogenOption', 1);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    // The readout is "quantity/capacity" and both halves go through the notation
    // pass, so at a cap of 1e9 it renders "1.0B/1.0B". Pulling a number back out
    // of that would be re-deriving the formatter rather than asserting anything,
    // so what is asserted is the thing the player actually reads: the two halves
    // match, and the game has marked the store full with its own class.
    const readout = await game.page.evaluate(() => {
      const el = document.getElementById('hydrogenQuantity');
      return {
        text: el?.textContent?.trim() ?? '',
        markedFull: !!el?.classList.contains('green-ready-text')
      };
    });
    const [held, capacity] = readout.text.split('/').map((half) => half.trim());

    expect(held, `the readout was "${readout.text}" on a store holding cap - 1e-10 (cap ${cap})`)
      .toBe(capacity);
    expect(readout.markedFull, 'and the game should have marked it full').toBe(true);

    // The eligibility half needs its own staging to be worth anything. A claim
    // costs the cap less one - the game leaves a single unit behind so an
    // upgrade cannot black out the grid - so the balance that actually sits on
    // the sweep's boundary is `cap - 1`, and drift below it is what the bare `<`
    // used to refuse.
    await game.withMods((m, capacity) =>
      m.rdo.setResourceDataObject(capacity - 1 - 1e-10, 'resources', ['hydrogen', 'quantity']), cap);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const eligible = await game.withMods((m) => m.game.getIncreasableStorageKeys('resources'));
    expect(eligible,
      'a balance an ulp under the claim price is drift, not a shortfall - the increase is earned')
      .toContain('hydrogen');

    // And a balance genuinely short of it is still refused, so the tolerance has
    // not simply become "always yes".
    await game.withMods((m, capacity) =>
      m.rdo.setResourceDataObject(capacity - 1.5, 'resources', ['hydrogen', 'quantity']), cap);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const shortOfIt = await game.withMods((m) => m.game.getIncreasableStorageKeys('resources'));
    expect(shortOfIt, 'half a unit short is a real shortfall and must still be refused')
      .not.toContain('hydrogen');
  });
});

// ============================================== Buy Max at the affordability edge

test.describe('Precision — Buy Max stops on exactly the right unit', () => {
  test.setTimeout(180000);

  test('one press buys every unit the balance covers and leaves no phantom remainder', async ({ game }) => {
    await game.boot();
    await freezeEconomy(game);

    // Buy the perk that puts Max buttons on rows, the way a player does.
    await game.openDebugMenu();
    await game.debugClick('unlockAllTabsButton');
    await game.debugClick('add100ApButton');
    await game.page.waitForTimeout(250);
    await openOptionById(game, 'ascendencyOption', 7);
    await game.page.waitForSelector('button.ascendency-buff-button', { timeout: 15000 });
    await game.page.waitForTimeout(400);
    await clickSelector(game, 'button.ascendency-buff-button.buff-class-bulk-purchasing');
    await game.page.waitForTimeout(400);

    // Stage a balance that is exactly the sum of the first few prices along the
    // row's own cost curve, minus a hair of float drift. The exact answer is
    // therefore known: every one of those units is affordable and none beyond
    // them is, and the drift must not cost the player the last one.
    const staged = await game.withMods((m) => {
      const multiplier = m.cg.getGameCostMultiplier();
      let price = 50;
      let total = 0;
      const units = 6;
      for (let i = 0; i < units; i++) {
        total += price;
        price = Math.ceil(price * multiplier);
      }
      m.rdo.setResourceDataObject(1e12, 'resources', ['hydrogen', 'storageCapacity']);
      for (let tier = 1; tier <= 4; tier++) {
        m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', `tier${tier}`, 'quantity']);
        m.rdo.setResourceDataObject(false, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', `tier${tier}`, 'active']);
      }
      m.rdo.setResourceDataObject(false, 'resources', ['hydrogen', 'autoSell']);
      m.rdo.setResourceDataObject(50, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'price']);
      m.rdo.setResourceDataObject(total - 1e-10, 'resources', ['hydrogen', 'quantity']);
      return { units, total, nextPrice: price };
    });

    await openOptionById(game, 'hydrogenOption', 1);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);
    await clickSelector(game, '#hydrogenAutoBuyer1Row .buy-max-button');
    await game.page.waitForTimeout(900);

    const after = await game.withMods((m) => ({
      autobuyers: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']),
      hydrogen: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
      price: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'price'])
    }));

    test.info().annotations.push({
      type: 'accounting error',
      description: `staged ${staged.total} - 1e-10 for exactly ${staged.units} units: bought ${after.autobuyers}, ${after.hydrogen} left`
    });

    expect(after.autobuyers,
      `a balance covering exactly ${staged.units} units should buy ${staged.units}, not ${staged.units - 1}`)
      .toBe(staged.units);
    expect(after.hydrogen, 'the run must not go overdrawn').toBeGreaterThanOrEqual(0);
    expect(after.hydrogen, 'and must not leave a phantom fraction behind').toBeCloseTo(0, 6);
    expect(after.price, 'the price curve should have advanced once per unit').toBe(staged.nextPrice);
    expect(await buyIsBlocked(game, 'hydrogenAutoBuyer1Row'),
      'and the game should agree nothing further is affordable').toBe(true);
  });
});

// ============================================ what the notation pass does to a rate

test.describe('Precision — the displayed rate matches the rate that accrues', () => {
  test.setTimeout(180000);

  // A fresh boot deliberately, with no `prepareRunForStarshipLaunch`. A prepared
  // run carries star-type autobuyer boosts, warp multipliers and perks that all
  // scale the rate, and this block needs the rate to land in a *known* band -
  // below 1 / s, which is where the old notation pass flattened it to zero. A
  // tier 1 autobuyer exists from the first minute of the game and needs no
  // power, so nothing here requires a prepared run to begin with.
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await freezeEconomy(game);
  });

  test('a live production line never reads as stopped, and the figure matches the delta', async ({ game }) => {
    // The condensed notation pass used to re-parse the rendered rate text as a
    // bare number and round it: "0.42 / s" became "0 / s", so a running line read
    // as stopped, and "1.2K / s" became "1K / s". The rate elements are now
    // marked as already carrying the player's notation and the sweep skips them.
    //
    // A tier 1 autobuyer needs no power, so this measures production, not the grid.
    // The home star is a B type, and a B type adds a flat +0.02 per tick to every
    // tier 1 autobuyer (`getBTypeAutoBuyerBoostForTier`). That boost alone is
    // 2.0 / s, which puts the smallest rate a single autobuyer can produce above
    // the sub-1 band this test is about — so it is switched off for the duration
    // and put back at the end, leaving the staged rate as the only variable.
    const boostBefore = await game.withMods((m) => {
      const original = { ...m.cg.getBTypeAutoBuyerBoostValues() };
      m.cg.setBTypeAutoBuyerBoostValues({ tier1: 0 });
      m.rdo.setResourceDataObject(1e12, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'quantity']);
      m.rdo.setResourceDataObject(1, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      // 0.0042 per tick x the 100 ticks-per-second ratio = 0.42 / s, squarely in
      // the range the old pass flattened to zero.
      m.rdo.setResourceDataObject(0.0042, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      m.rdo.setResourceDataObject(true, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'active']);
      for (let tier = 2; tier <= 4; tier++) {
        m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', `tier${tier}`, 'quantity']);
      }
      return original;
    });

    await openOptionById(game, 'hydrogenOption', 1);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const displayed = await game.page.evaluate(() =>
      document.getElementById('hydrogenRate')?.textContent?.trim() ?? '');

    // The expectation comes from the rate the game itself settled on rather than
    // from the number staged above, so a boost or a warp multiplier changes what
    // is expected instead of failing the test for the wrong reason. What is being
    // asserted is that the *display* is faithful to the model, whatever the model
    // decided.
    const perSecond = await game.withMods((m) =>
      (m.rdo.getResourceDataObject('resources', ['hydrogen', 'rate']) || 0) * m.cg.getTimerRateRatio());

    expect(perSecond,
      `this test is only meaningful below 1 / s - that is the band the old pass flattened to zero - but the run settled on ${perSecond}`)
      .toBeLessThan(1);
    expect(perSecond, 'and the line has to actually be producing').toBeGreaterThan(0);

    expect(displayed, `a line producing ${perSecond} / s must not read as stopped`)
      .not.toMatch(/^0\s*\/\s*s$/);
    expect(numberFrom(displayed), `the rate element read "${displayed}" for a modelled ${perSecond} / s`)
      .toBeCloseTo(perSecond, 2);

    // And the figure is the one that actually accrues.
    //
    // The window is 5s of *driven* time plus however long the two round trips
    // took, because the real frame loop keeps ticking throughout at the same
    // multiplier - a naive `delta / 5` reads about 4% high, which is the round
    // trips' own contribution rather than any drift in the rate. Bracketing with
    // `Date.now()` inside the page and adding the elapsed wall time accounts for
    // them, and what is left is the accrual itself.
    const before = await game.withMods((m) => ({
      q: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
      t: Date.now()
    }));
    await game.advanceTimers(5000);
    const after = await game.withMods((m) => ({
      q: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
      t: Date.now()
    }));

    const windowSeconds = 5 + ((after.t - before.t) / 1000);
    const measured = (after.q - before.q) / windowSeconds;

    test.info().annotations.push({
      type: 'accounting error',
      description: `displayed ${displayed}, measured ${measured.toFixed(4)} / s over ${windowSeconds.toFixed(3)}s`
    });

    // Compared as a share rather than an absolute, because the residual noise is
    // whole frames landing just outside the bracket and that scales with the
    // rate. 2% of a 0.42 / s line is a fortieth of a unit per second - orders of
    // magnitude below the "0 / s" and "1K vs 1.2K" errors this is guarding.
    const drift = Math.abs(measured - numberFrom(displayed)) / numberFrom(displayed);
    expect(drift,
      `displayed "${displayed}" against a measured ${measured.toFixed(4)} / s over ${windowSeconds.toFixed(3)}s`)
      .toBeLessThan(0.02);

    await game.withMods((m, original) => m.cg.setBTypeAutoBuyerBoostValues(original), boostBefore);
  });

  test('an abbreviated rate keeps the decimal that distinguishes 1.2K from 1.9K', async ({ game }) => {
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(1e12, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'quantity']);
      m.rdo.setResourceDataObject(1, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      // 19 per tick x 100 = 1900 / s, which abbreviates to 1.9K.
      m.rdo.setResourceDataObject(19, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      m.rdo.setResourceDataObject(true, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'active']);
      for (let tier = 2; tier <= 4; tier++) {
        m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', `tier${tier}`, 'quantity']);
      }
    });

    await openOptionById(game, 'hydrogenOption', 1);
    await game.page.waitForTimeout(FRAME_SETTLE_MS);

    const displayed = await game.page.evaluate(() =>
      document.getElementById('hydrogenRate')?.textContent?.trim() ?? '');

    expect(displayed, `the rate element read "${displayed}" — the notation sweep has eaten the decimal`)
      .toMatch(/1\.9K/);
  });
});

// ======================================================= holdings in both modes

test.describe('Precision — neither notation ever overstates a holding', () => {
  test.setTimeout(180000);

  test('a store holding 999.6 never reads as 1000, in condensed or plain notation', async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await freezeEconomy(game);
    await stageHydrogen(game, { quantity: 999.6 });
    await openOptionById(game, 'hydrogenOption', 1);

    const readings = {};
    for (const mode of ['normalCondensed', 'normal']) {
      await game.withMods((m, notation) => m.cg.setNotationType(notation), mode);
      await game.page.waitForTimeout(FRAME_SETTLE_MS);
      readings[mode] = await game.page.evaluate(() =>
        document.getElementById('hydrogenQuantity')?.textContent?.trim() ?? '');
    }
    await game.withMods((m) => m.cg.setNotationType('normalCondensed'));

    for (const [mode, text] of Object.entries(readings)) {
      // The readout is "quantity/capacity", so only the first figure is the
      // holding — the cap is staged far above it and is not what is under test.
      expect(numberFrom(text), `${mode} rendered "${text}" for a store holding 999.6`)
        .toBeLessThanOrEqual(999);
    }

    test.info().annotations.push({
      type: 'accounting error',
      description: `999.6 held renders as ${JSON.stringify(readings)} (both modes previously rounded to 1000)`
    });
  });
});
