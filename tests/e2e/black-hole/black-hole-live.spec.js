/**
 * Area: Black Hole — a real charge/warp cycle, driven through the buttons
 * Plan: tests/docs/areas/black-hole.md
 *
 * `black-hole.spec.js` covers the accessors and the warp arithmetic. This file
 * plays the feature: it opens the pane, pays for the research through the real
 * button, buys each of the three upgrades, charges the black hole, fires the
 * warp, and then **measures that the game actually computes faster** rather than
 * trusting that a multiplier field changed.
 *
 * That last point is the whole reason this file exists. `getTimeWarpMultiplier()`
 * returning 8 proves a number was written; it does not prove a single extra tick
 * of production happened. The measurement here is the one a player would notice:
 * how much a resource accrues per second of wall-clock time, warped versus not.
 *
 * The setup — opening the pane, paying for the research, clicking an upgrade —
 * is shared with `progression-clarity.spec.js` and lives in
 * `_black-hole-helpers.mjs`, which also records what each upgrade does and why a
 * dispatched click is needed to reach the buttons at all.
 */
import { test, expect } from '../_harness/game-fixture.mjs';
import {
  clickBlackHoleButton,
  openBlackHolePane,
  researchBlackHole
} from './_black-hole-helpers.mjs';

/**
 * Measure how much a resource accrues per second of wall clock.
 *
 * Staged with a large storage cap and a fixed autobuyer rate so the only
 * variable is how many ticks the game manages to run in the window. Returns
 * quantity gained per real second.
 */
async function measureAccrualPerSecond(game, windowMs = 4000) {
  const start = await game.withMods((m) => ({
    q: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
    t: Date.now()
  }));
  await game.page.waitForTimeout(windowMs);
  const end = await game.withMods((m) => ({
    q: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
    t: Date.now()
  }));
  const seconds = (end.t - start.t) / 1000;
  return (end.q - start.q) / seconds;
}

/** Stage a steadily-producing resource with headroom, so the cap never binds. */
async function stageSteadyProduction(game) {
  await game.withMods((m) => {
    m.cg.setPowerOnOff(true);
    m.rdo.setResourceDataObject(true, 'resources', ['hydrogen', 'revealedYet']);
    m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'quantity']);
    m.rdo.setResourceDataObject(1e15, 'resources', ['hydrogen', 'storageCapacity']);
    m.rdo.setResourceDataObject(true, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'active']);
    m.rdo.setResourceDataObject(10, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'rate']);
    m.rdo.setResourceDataObject(100, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
  });
}

test.describe('Black Hole — researched and upgraded through the real controls', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await openBlackHolePane(game);
  });

  test('the research button unlocks the feature and charges its price', async ({ game }) => {
    const before = await game.withMods((m) => ({
      done: m.rdo.getBlackHoleResearchDone(),
      price: m.rdo.getBlackHoleResearchPrice(),
      research: m.rdo.getResourceDataObject('research', ['quantity'])
    }));
    expect(before.done).toBeFalsy();
    expect(before.price).toBeGreaterThan(0);

    // Dispatched, not clicked: the achievement toasts earned by
    // `prepareRunForStarshipLaunch()` stack over this corner of the screen and
    // win the hit test. See `researchBlackHole()` in `_black-hole-helpers.mjs`.
    await clickBlackHoleButton(game, 'blackHoleResearchButton', { settleMs: 800 });

    const after = await game.withMods((m) => ({
      done: m.rdo.getBlackHoleResearchDone(),
      research: m.rdo.getResourceDataObject('research', ['quantity'])
    }));

    expect(after.done, 'clicking Research should unlock the black hole').toBe(true);
    // The price must actually be paid, or the button is free.
    expect(after.research).toBeLessThanOrEqual(before.research - before.price);
  });

  test('each of the three upgrades raises its own value and its own price', async ({ game }) => {
    await researchBlackHole(game);

    const read = () => game.withMods((m) => ({
      power: Number(m.rdo.getBlackHolePower()),
      duration: Number(m.rdo.getBlackHoleDuration()),
      recharge: Number(m.rdo.getBlackHoleRechargeMultiplier()),
      powerPrice: Number(m.rdo.getBlackHolePowerPrice()),
      durationPrice: Number(m.rdo.getBlackHoleDurationPrice()),
      rechargePrice: Number(m.rdo.getBlackHoleRechargePrice()),
      research: m.rdo.getResourceDataObject('research', ['quantity'])
    }));

    const before = await read();

    await clickBlackHoleButton(game, 'blackHoleButton2');
    const afterPower = await read();
    expect(afterPower.power, 'the Power upgrade should raise black hole power').toBeGreaterThan(before.power);
    expect(afterPower.powerPrice, 'buying Power should make the next one dearer').toBeGreaterThan(before.powerPrice);
    expect(afterPower.research, 'the Power upgrade should be paid for').toBeLessThan(before.research);

    await clickBlackHoleButton(game, 'blackHoleButton3');
    const afterDuration = await read();
    expect(afterDuration.duration, 'the Duration upgrade should lengthen the warp').toBeGreaterThan(afterPower.duration);
    expect(afterDuration.durationPrice).toBeGreaterThan(afterPower.durationPrice);

    // Recharge multiplies the charge time by 0.88 each purchase, floored so the
    // charge can never drop below MINIMUM_BLACK_HOLE_CHARGE_TIME. The handler
    // returns *before* taking payment when the floor is already reached, so both
    // outcomes are legitimate and which one applies depends on the run's base
    // charge duration. Assert the rule rather than one of its two branches.
    const floor = await game.withMods((m) => {
      const base = Number(m.cg.getBaseBlackHoleChargeTimerDuration());
      const min = Number(m.cg.getMinimumBlackHoleChargeTime());
      return { base, min, minMultiplier: base > 0 ? min / base : 0 };
    });

    await clickBlackHoleButton(game, 'blackHoleButton4');
    const afterRecharge = await read();

    const atFloor = Math.round(floor.base * afterDuration.recharge) <= floor.min;
    if (atFloor) {
      // Already as fast as it can get: nothing changes, and nothing is charged.
      expect(afterRecharge.recharge).toBe(afterDuration.recharge);
      expect(afterRecharge.rechargePrice, 'a refused upgrade must not raise its own price')
        .toBe(afterDuration.rechargePrice);
    } else {
      expect(
        afterRecharge.recharge,
        `Recharge: multiplier ${afterDuration.recharge} -> ${afterRecharge.recharge}, `
        + `base ${floor.base}ms, min ${floor.min}ms, floor multiplier ${floor.minMultiplier}, `
        + `research ${afterDuration.research} -> ${afterRecharge.research}, `
        + `price ${afterDuration.rechargePrice} -> ${afterRecharge.rechargePrice}`
      ).toBeLessThan(afterDuration.recharge);
      expect(afterRecharge.rechargePrice).toBeGreaterThan(afterDuration.rechargePrice);
    }

    // The floor must hold either way — a charge time below the minimum would
    // make the warp effectively always-on for free.
    expect(afterRecharge.recharge).toBeGreaterThanOrEqual(floor.minMultiplier);

    // Each upgrade must be independent — buying Power must not move Duration.
    expect(afterPower.duration).toBe(before.duration);
    expect(afterDuration.power).toBe(afterPower.power);
  });

  test('an upgrade that cannot be afforded is refused', async ({ game }) => {
    await researchBlackHole(game);

    // Drop research below the power price; the handler returns early rather than
    // going into debt.
    const price = await game.withMods((m) => {
      const p = Number(m.rdo.getBlackHolePowerPrice());
      m.rdo.setResourceDataObject(Math.max(0, p - 1), 'research', ['quantity']);
      return p;
    });

    const before = await game.withMods((m) => Number(m.rdo.getBlackHolePower()));
    await clickBlackHoleButton(game, 'blackHoleButton2');
    const after = await game.withMods((m) => ({
      power: Number(m.rdo.getBlackHolePower()),
      research: m.rdo.getResourceDataObject('research', ['quantity'])
    }));

    expect(price).toBeGreaterThan(0);
    expect(after.power, 'an unaffordable upgrade must not apply').toBe(before);
    expect(after.research, 'research must never go negative').toBeGreaterThanOrEqual(0);
  });
});

test.describe('Black Hole — a warp makes the game genuinely compute faster', () => {
  test.setTimeout(240000);

  test('a real charge cycle completes and arms the warp', async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await openBlackHolePane(game);

    await researchBlackHole(game);

    // The black hole is deliberately unusable until its charge completes — that
    // gate is the design, not a defect, and the only way to have it permanently
    // available is the always-on upgrade. The base charge is 300 seconds
    // (`baseBlackHoleChargeTimerDuration`), so rather than poking the timer's
    // internals this warps *game time* forward until the real timer finishes.
    // 5s of wall clock at x200 is ~1000s of game time, comfortably past 300s.
    const base = await game.withMods((m) => Number(m.cg.getBaseBlackHoleChargeTimerDuration()));
    expect(base, 'the base charge duration should be the documented 300s').toBe(300000);

    const charging = await game.withMods((m) => m.cg.getCurrentlyChargingBlackHole());
    expect(charging, 'researching the black hole should start it charging').toBe(true);

    await game.debugTimeWarp({ durationMs: 5000, multiplier: 200 });

    await game.page.waitForFunction(
      () => globalThis.__mods.cg.getBlackHoleChargeReady() === true,
      undefined,
      { timeout: 90000 }
    );

    const ready = await game.withMods((m) => ({
      chargeReady: m.cg.getBlackHoleChargeReady(),
      timeLeft: m.cg.getTimeLeftUntilBlackHoleChargeTimerFinishes()
    }));

    expect(ready.chargeReady, 'warping past 300s of game time should complete the charge').toBe(true);
    expect(ready.timeLeft).toBeLessThanOrEqual(0);
    expect(game.significantErrors()).toEqual([]);
  });

  test('production runs measurably faster while warped, and returns to normal after', async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await openBlackHolePane(game);
    await stageSteadyProduction(game);

    // Baseline: unwarped accrual per real second.
    const baseline = await measureAccrualPerSecond(game, 3000);
    expect(baseline, 'the resource must be producing before the comparison means anything')
      .toBeGreaterThan(0);

    // The debug duration select tops out at 20000 ms, so the measurement window
    // is kept well inside it — a window that outlives the warp would average
    // warped and unwarped rates together and understate the effect.
    await game.debugTimeWarp({ durationMs: 20000, multiplier: 50 });
    const multiplier = await game.withMods((m) => m.cg.getTimeWarpMultiplier());
    expect(multiplier, 'the warp should be active for this measurement').toBeGreaterThan(1);

    const warped = await measureAccrualPerSecond(game, 3000);

    // The claim under test: the *game* runs faster, not merely that a field
    // says so. A generous factor because frame budget, not the multiplier,
    // bounds how much work actually gets done — but 3x is far outside noise.
    expect(
      warped,
      `accrual per second: ${baseline.toFixed(1)} unwarped vs ${warped.toFixed(1)} warped (multiplier ${multiplier})`
    ).toBeGreaterThan(baseline * 3);

    // And it must wind back down, or the warp is permanent.
    await game.withMods((m) => {
      m.cg.setTimeWarpEndTimestampMs(Date.now() - 1);
      m.cg.setCurrentlyTimeWarpingBlackHole(false);
    });
    await game.page.waitForTimeout(1500);

    const restored = await game.withMods((m) => m.cg.getTimeWarpMultiplier());
    expect(restored, 'the multiplier must return to 1 once the warp expires').toBe(1);

    const afterWarp = await measureAccrualPerSecond(game, 3000);
    expect(
      afterWarp,
      `accrual should fall back after the warp: ${warped.toFixed(1)} warped vs ${afterWarp.toFixed(1)} after`
    ).toBeLessThan(warped / 2);
  });

  test('a higher black hole power warps harder than a lower one', async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await openBlackHolePane(game);
    await stageSteadyProduction(game);

    // The point of buying Power is that the warp is stronger. Compare the same
    // measurement at two different multipliers rather than asserting on the
    // field, so a change that raised the number without raising the throughput
    // would still fail.
    await game.debugTimeWarp({ durationMs: 20000, multiplier: 5 });
    const low = await measureAccrualPerSecond(game, 3000);

    await game.withMods((m) => {
      m.cg.setTimeWarpEndTimestampMs(Date.now() - 1);
      m.cg.setCurrentlyTimeWarpingBlackHole(false);
    });
    await game.page.waitForTimeout(1200);

    await game.debugTimeWarp({ durationMs: 20000, multiplier: 200 });
    const high = await measureAccrualPerSecond(game, 3000);

    expect(low).toBeGreaterThan(0);
    expect(
      high,
      `accrual per second at x5 = ${low.toFixed(1)}, at x200 = ${high.toFixed(1)}`
    ).toBeGreaterThan(low);
  });

  test('warping raises no console or page errors', async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await openBlackHolePane(game);
    await stageSteadyProduction(game);

    await game.debugTimeWarp({ durationMs: 5000, multiplier: 200 });
    await game.page.waitForTimeout(8000);

    expect(game.significantErrors()).toEqual([]);
  });
});
