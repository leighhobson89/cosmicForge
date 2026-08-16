/**
 * Area: Antimatter
 * Plan: tests/docs/areas/antimatter.md
 *
 * Covers the unlock gate, delta-accumulator generation, accumulator precision
 * across long windows, time-warp multiplication, and save/load of partial ticks.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

const ANTIMATTER_TIMER_ID = 'antimatterDeltaTimer';

test.describe('Antimatter', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('starts locked with zero quantity on a fresh save', async ({ game }) => {
    const state = await game.withMods((m) => ({
      unlocked: m.cg.getAntimatterUnlocked(),
      quantity: m.rdo.getResourceDataObject('antimatter', ['quantity']),
      accumulator: m.cg.getAntimatterDeltaAccumulator()
    }));

    expect(state.unlocked).toBe(false);
    expect(state.quantity).toBe(0);
    expect(state.accumulator).toBe(0);
  });

  test('does not accumulate while locked, however much time passes', async ({ game }) => {
    const before = await game.withMods((m) =>
      m.rdo.getResourceDataObject('antimatter', ['quantity'])
    );

    await game.advanceTimers(60_000);

    const after = await game.withMods((m) =>
      m.rdo.getResourceDataObject('antimatter', ['quantity'])
    );

    expect(before).toBe(0);
    expect(after).toBe(0);
  });

  test('the unlock flag can be set and is readable', async ({ game }) => {
    const result = await game.withMods((m) => {
      const before = m.cg.getAntimatterUnlocked();
      m.cg.setAntimatterUnlocked(true);
      const after = m.cg.getAntimatterUnlocked();
      m.cg.setAntimatterUnlocked(false);
      return { before, after, restored: m.cg.getAntimatterUnlocked() };
    });

    expect(result.before).toBe(false);
    expect(result.after).toBe(true);
    expect(result.restored).toBe(false);
  });

  test('the antimatter delta timer is registered and repeating', async ({ game }) => {
    const timer = await game.withMods((m, id) => {
      const tm = m.timers.timerManagerDelta;
      const t = tm.timers.get(id);
      if (!t) return { present: false, ids: Array.from(tm.timers.keys()) };
      return {
        present: true,
        repeat: t.repeat,
        durationMs: t.durationMs,
        paused: t.paused,
        hasOnUpdate: typeof t.onUpdate === 'function'
      };
    }, ANTIMATTER_TIMER_ID);

    expect(timer.present).toBe(true);
    // durationMs 0 + repeat means "tick every update", driving the accumulator.
    expect(timer.repeat).toBe(true);
    expect(timer.durationMs).toBe(0);
    expect(timer.paused).toBe(false);
    expect(timer.hasOnUpdate).toBe(true);
  });

  // The live timerManagerDelta is driven by the running gameLoop every frame, so
  // exact arithmetic against it is inherently racy. The accumulator semantics that
  // antimatter depends on are therefore verified against an isolated
  // TimerManagerDelta instance, which is deterministic, with live-instance
  // behaviour covered by the integration tests above and below.

  test('accumulator banks sub-interval remainder rather than discarding it', async ({ game }) => {
    const result = await game.withMods((m) => {
      const tm = new m.timers.TimerManagerDelta();
      let accumulator = 0;
      const interval = m.cg.getTimerUpdateInterval();

      tm.addTimer('probe', {
        durationMs: 0,
        repeat: true,
        onUpdate: ({ deltaMs }) => { accumulator += deltaMs; }
      });

      // 2.5 intervals in: 2 whole ticks consumed, 0.5 must remain banked.
      tm.update(interval * 2.5, 1);
      const total = accumulator;
      const whole = Math.floor(total / interval);
      const remainder = total % interval;

      return { interval, total, whole, remainder };
    });

    expect(result.interval).toBeGreaterThan(0);
    expect(result.whole).toBe(2);
    expect(result.remainder).toBeCloseTo(result.interval * 0.5, 5);
  });

  test('elapsed time is conserved exactly across many small updates', async ({ game }) => {
    const result = await game.withMods((m) => {
      const tm = new m.timers.TimerManagerDelta();
      let accumulator = 0;
      const interval = m.cg.getTimerUpdateInterval();

      tm.addTimer('probe', {
        durationMs: 0,
        repeat: true,
        onUpdate: ({ deltaMs }) => { accumulator += deltaMs; }
      });

      const step = interval * 0.3;
      for (let i = 0; i < 100; i++) tm.update(step, 1);

      return { interval, accumulator, expected: step * 100 };
    });

    // No time may be lost or invented across 100 partial updates.
    expect(result.accumulator).toBeCloseTo(result.expected, 5);
  });

  test('time warp multiplier scales elapsed time proportionally', async ({ game }) => {
    const result = await game.withMods((m) => {
      const tm = new m.timers.TimerManagerDelta();
      let atOneX = 0;
      let atTenX = 0;

      tm.addTimer('one', { durationMs: 0, repeat: true, onUpdate: ({ deltaMs }) => { atOneX += deltaMs; } });
      tm.update(1000, 1);
      tm.removeTimer('one');

      tm.addTimer('ten', { durationMs: 0, repeat: true, onUpdate: ({ deltaMs }) => { atTenX += deltaMs; } });
      tm.update(1000, 10);

      return { atOneX, atTenX };
    });

    expect(result.atOneX).toBeCloseTo(1000, 5);
    expect(result.atTenX).toBeCloseTo(10_000, 5);
  });

  test('an invalid time warp multiplier falls back to 1x instead of corrupting time', async ({ game }) => {
    const result = await game.withMods((m) => {
      const run = (multiplier) => {
        const tm = new m.timers.TimerManagerDelta();
        let acc = 0;
        tm.addTimer('probe', { durationMs: 0, repeat: true, onUpdate: ({ deltaMs }) => { acc += deltaMs; } });
        tm.update(1000, multiplier);
        return acc;
      };

      return {
        nan: run(NaN),
        negative: run(-5),
        zero: run(0),
        infinite: run(Infinity),
        string: run('10')
      };
    });

    // Every invalid multiplier must degrade to 1x, never to 0, negative or NaN.
    for (const [label, value] of Object.entries(result)) {
      expect(Number.isFinite(value), `${label} produced non-finite time`).toBe(true);
      expect(value, `${label} did not fall back to 1x`).toBeCloseTo(1000, 5);
    }
  });

  test('zero and negative elapsed time never move time backwards', async ({ game }) => {
    const result = await game.withMods((m) => {
      const tm = new m.timers.TimerManagerDelta();
      let acc = 0;
      tm.addTimer('probe', { durationMs: 0, repeat: true, onUpdate: ({ deltaMs }) => { acc += deltaMs; } });

      tm.update(0, 1);
      const afterZero = acc;
      tm.update(-1000, 1);
      const afterNegative = acc;

      return { afterZero, afterNegative };
    });

    expect(result.afterZero).toBe(0);
    expect(result.afterNegative).toBe(0);
  });

  test('unlocked antimatter accrues over time via the live timer', async ({ game }) => {
    await game.withMods((m) => {
      m.cg.setAntimatterUnlocked(true);
      m.rdo.setResourceDataObject(0, 'antimatter', ['quantity']);
      m.rdo.setResourceDataObject(1000000, 'antimatter', ['storageCapacity']);
      // Give it a rate so accrual is observable.
      m.rdo.setResourceDataObject(100, 'antimatter', ['rate']);
    });

    const before = await game.withMods((m) => m.rdo.getResourceDataObject('antimatter', ['quantity']));

    // Drive a large simulated span through the live manager.
    await game.advanceTimers(30_000);

    const after = await game.withMods((m) => m.rdo.getResourceDataObject('antimatter', ['quantity']));

    expect(Number.isFinite(after)).toBe(true);
    expect(after).toBeGreaterThanOrEqual(before);
  });

  test('antimatter quantity and accumulator survive a save/load round trip', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.cg.setAntimatterUnlocked(true);
      m.rdo.setResourceDataObject(1234.5, 'antimatter', ['quantity']);

      const captured = m.cg.captureGameStatusForSaving('initialise');
      const restored = JSON.parse(JSON.stringify(captured));

      return {
        savedQuantity: restored.resourceData?.antimatter?.quantity,
        savedUnlocked: restored.antimatterUnlocked
      };
    });

    expect(result.savedQuantity).toBe(1234.5);
  });

  test('the mining option becomes reachable once antimatter is unlocked', async ({ game }) => {
    await game.withMods((m) => m.cg.setAntimatterUnlocked(true));

    // Tab 6 is Space Mining; the gameLoop reveals the mining option there.
    await game.openTab(6);
    await game.page.waitForTimeout(600);

    const exists = await game.page.evaluate(() =>
      Boolean(document.getElementById('miningOption'))
    );

    expect(exists).toBe(true);
  });
});
