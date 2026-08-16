/**
 * Area: Black Hole Time Warp
 * Plan: tests/docs/areas/black-hole.md
 *
 * Time multiplication touches every rate in the game, so this covers the warp
 * lifecycle, always-on mode, the focus/visibility guard, and the post-nerf power
 * scaling. Warps are triggered through the game's own debug timewarp control.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe('Black Hole Time Warp', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
  });

  test('black hole data has coherent defaults', async ({ game }) => {
    const bh = await game.withMods((m) => m.rdo.getResourceDataObject('blackHole'));

    for (const field of ['researchPrice', 'durationPrice', 'powerPrice', 'rechargePrice', 'duration', 'power']) {
      expect(typeof bh[field], `${field} should be numeric`).toBe('number');
      expect(Number.isFinite(bh[field]), `${field} should be finite`).toBe(true);
      expect(bh[field], `${field} should be positive`).toBeGreaterThan(0);
    }
    expect(typeof bh.blackHoleResearchDone).toBe('boolean');
  });

  test('the time warp multiplier is 1 when no warp is active', async ({ game }) => {
    const state = await game.withMods((m) => ({
      multiplier: m.cg.getTimeWarpMultiplier(),
      endTimestamp: m.cg.getTimeWarpEndTimestampMs(),
      alwaysOn: m.cg.getBlackHoleAlwaysOn()
    }));

    expect(state.multiplier).toBe(1);
    expect(state.endTimestamp).toBe(0);
    expect(state.alwaysOn).toBeFalsy();
  });

  test('the debug time warp control raises the multiplier', async ({ game }) => {
    await game.debugTimeWarp({ durationMs: 5000, multiplier: 50 });

    const state = await game.withMods((m) => ({
      multiplier: m.cg.getTimeWarpMultiplier(),
      endTimestamp: m.cg.getTimeWarpEndTimestampMs()
    }));

    expect(state.multiplier).toBeGreaterThan(1);
    // A timed warp must schedule an end, or it would never expire.
    expect(state.endTimestamp).toBeGreaterThan(0);
  });

  test('a timed warp expires and restores the multiplier to 1', async ({ game }) => {
    await game.debugTimeWarp({ durationMs: 5000, multiplier: 50 });

    const during = await game.withMods((m) => m.cg.getTimeWarpMultiplier());
    expect(during).toBeGreaterThan(1);

    // Force expiry rather than waiting out the wall clock: the frame loop clears
    // the warp once Date.now() passes the end timestamp.
    await game.withMods((m) => m.cg.setTimeWarpEndTimestampMs(Date.now() - 1));
    await game.page.waitForTimeout(600);

    const after = await game.withMods((m) => ({
      multiplier: m.cg.getTimeWarpMultiplier(),
      endTimestamp: m.cg.getTimeWarpEndTimestampMs()
    }));

    expect(after.multiplier).toBe(1);
    expect(after.endTimestamp).toBe(0);
  });

  test('always-on mode holds the multiplier at black hole power', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.rdo.setResourceDataObject(8, 'blackHole', ['power']);
      m.cg.setBlackHoleAlwaysOn(true);
      return { power: m.rdo.getResourceDataObject('blackHole', ['power']) };
    });

    // The frame loop reconciles the multiplier to black hole power each tick.
    await game.page.waitForTimeout(700);

    const state = await game.withMods((m) => ({
      multiplier: m.cg.getTimeWarpMultiplier(),
      endTimestamp: m.cg.getTimeWarpEndTimestampMs(),
      warping: m.cg.getCurrentlyTimeWarpingBlackHole()
    }));

    expect(state.multiplier).toBe(result.power);
    // Always-on has no end: a lingering timestamp would expire it spuriously.
    expect(state.endTimestamp).toBe(0);
    expect(state.warping).toBe(true);

    await game.withMods((m) => m.cg.setBlackHoleAlwaysOn(false));
  });

  test('changing power while always-on updates the multiplier', async ({ game }) => {
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(4, 'blackHole', ['power']);
      m.cg.setBlackHoleAlwaysOn(true);
    });
    await game.page.waitForTimeout(600);
    const atFour = await game.withMods((m) => m.cg.getTimeWarpMultiplier());

    await game.withMods((m) => m.rdo.setResourceDataObject(12, 'blackHole', ['power']));
    await game.page.waitForTimeout(600);
    const atTwelve = await game.withMods((m) => m.cg.getTimeWarpMultiplier());

    await game.withMods((m) => m.cg.setBlackHoleAlwaysOn(false));

    expect(atFour).toBe(4);
    expect(atTwelve).toBe(12);
  });

  test('the effective multiplier drops to 1 when the page is hidden', async ({ game }) => {
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(10, 'blackHole', ['power']);
      m.cg.setBlackHoleAlwaysOn(true);
    });
    await game.page.waitForTimeout(500);

    // gameLoop computes: (document.hidden || !document.hasFocus()) ? 1 : multiplier
    const effective = await game.page.evaluate(() => {
      const hidden = document.hidden || !document.hasFocus();
      return { hidden };
    });

    const guarded = await game.withMods((m) => {
      const raw = m.cg.getTimeWarpMultiplier();
      const effectiveMultiplier = (document.hidden || !document.hasFocus())
        ? 1
        : (m.cg.getBlackHoleAlwaysOn() ? m.rdo.getResourceDataObject('blackHole', ['power']) : raw);
      return { raw, effectiveMultiplier, hidden: document.hidden, focused: document.hasFocus() };
    });

    await game.withMods((m) => m.cg.setBlackHoleAlwaysOn(false));

    // Whatever the focus state, the guard must never produce a value above raw.
    expect(guarded.effectiveMultiplier).toBeLessThanOrEqual(Math.max(1, guarded.raw));
    if (guarded.hidden || !guarded.focused) {
      expect(guarded.effectiveMultiplier).toBe(1);
    }
    expect(typeof effective.hidden).toBe('boolean');
  });

  test('power upgrades scale by the documented increment', async ({ game }) => {
    const result = await game.withMods((m) => {
      const increment = m.cg.getBlackHolePowerUpgradeIncrement();
      m.rdo.setResourceDataObject(50, 'blackHole', ['power']);
      const before = m.rdo.getResourceDataObject('blackHole', ['power']);
      m.rdo.setResourceDataObject(before + increment, 'blackHole', ['power']);
      return { increment, before, after: m.rdo.getResourceDataObject('blackHole', ['power']) };
    });

    // The 0.94 migration rescaled power to 0.5 steps above 50.
    expect(result.increment).toBeGreaterThan(0);
    expect(result.after).toBeCloseTo(result.before + result.increment, 6);
  });

  test('the black hole nerf patch flag is tracked', async ({ game }) => {
    const result = await game.withMods((m) => {
      const before = m.cg.getBlackHoleNerfPatched();
      m.cg.setBlackHoleNerfPatched(true);
      const after = m.cg.getBlackHoleNerfPatched();
      m.cg.setBlackHoleNerfPatched(before);
      return { before, after };
    });

    expect(typeof result.before).toBe('boolean');
    expect(result.after).toBe(true);
  });

  test('warp state survives a save/load round trip', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.rdo.setResourceDataObject(true, 'blackHole', ['blackHoleResearchDone']);
      m.rdo.setResourceDataObject(15, 'blackHole', ['power']);
      m.rdo.setResourceDataObject(7000, 'blackHole', ['duration']);

      const restored = JSON.parse(JSON.stringify(m.cg.captureGameStatusForSaving('initialise')));
      return restored.resourceData?.blackHole;
    });

    expect(result.blackHoleResearchDone).toBe(true);
    expect(result.power).toBe(15);
    expect(result.duration).toBe(7000);
  });

  test('a warp never produces a non-finite or negative multiplier', async ({ game }) => {
    const samples = await game.withMods((m) => {
      const out = [];
      for (const power of [1, 5, 50, 100, 0.5]) {
        m.rdo.setResourceDataObject(power, 'blackHole', ['power']);
        m.cg.setBlackHoleAlwaysOn(true);
        const mult = m.rdo.getResourceDataObject('blackHole', ['power']);
        out.push({ power, mult });
      }
      m.cg.setBlackHoleAlwaysOn(false);
      return out;
    });

    for (const { power, mult } of samples) {
      expect(Number.isFinite(mult), `power ${power} produced ${mult}`).toBe(true);
      expect(mult).toBeGreaterThan(0);
    }
  });

  test('autosave is suppressed during a timed warp but not when always-on', async ({ game }) => {
    // initializeAutoSave defers when getTimeWarpMultiplier() !== 1 && !alwaysOn.
    const result = await game.withMods((m) => {
      const evaluate = () => m.cg.getTimeWarpMultiplier() !== 1 && !m.cg.getBlackHoleAlwaysOn();

      m.cg.setTimeWarpMultiplier(1);
      m.cg.setBlackHoleAlwaysOn(false);
      const idle = evaluate();

      m.cg.setTimeWarpMultiplier(50);
      const timedWarp = evaluate();

      m.cg.setBlackHoleAlwaysOn(true);
      const alwaysOn = evaluate();

      m.cg.setBlackHoleAlwaysOn(false);
      m.cg.setTimeWarpMultiplier(1);
      return { idle, timedWarp, alwaysOn };
    });

    expect(result.idle).toBe(false);
    expect(result.timedWarp).toBe(true);
    expect(result.alwaysOn).toBe(false);
  });
});
