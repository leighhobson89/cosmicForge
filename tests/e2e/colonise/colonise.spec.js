/**
 * Area: Colonisation
 * Plan: tests/docs/areas/colonise.md
 *
 * Settlement is the state transition that drives cosmic rip galactic points and
 * the galactic tab unlock, so the bookkeeping around settledStars matters more
 * than the UI flow.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe('Colonisation', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
  });

  test('a run starts with exactly one settled star: the home system', async ({ game }) => {
    const state = await game.withMods((m) => ({
      settled: m.cg.getSettledStars(),
      current: m.cg.getCurrentStarSystem()
    }));

    expect(Array.isArray(state.settled)).toBe(true);
    expect(state.settled.length).toBe(1);
    expect(state.settled[0].toLowerCase()).toBe(String(state.current).toLowerCase());
  });

  test('settling a system appends it to settledStars', async ({ game }) => {
    const result = await game.withMods((m) => {
      const before = [...m.cg.getSettledStars()];
      m.cg.setSettledStars('sirius');
      const after = [...m.cg.getSettledStars()];
      return { before, after };
    });

    expect(result.after.length).toBe(result.before.length + 1);
    expect(result.after.map((s) => s.toLowerCase())).toContain('sirius');
  });

  test('the settled-systems list holds no duplicates in real game state', async ({ game }) => {
    // setSettledStars() is an unguarded push — deduplication is the caller's
    // responsibility (game.js lowercases before settling). What must hold is that
    // the list the game actually maintains contains no repeats, because galactic
    // points are derived from its length.
    const result = await game.withMods((m) => {
      const settled = m.cg.getSettledStars().map((s) => String(s).toLowerCase());
      const counts = {};
      for (const s of settled) counts[s] = (counts[s] || 0) + 1;
      return {
        settled,
        duplicates: Object.entries(counts).filter(([, n]) => n > 1).map(([s, n]) => `${s} x${n}`)
      };
    });

    expect(result.settled.length).toBeGreaterThan(0);
    expect(result.duplicates).toEqual([]);
  });

  test('galactic points derive from settled systems minus points spent', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.cg.setGalacticPointsSpent(0);
      ['sirius', 'vega', 'rigel'].forEach((s) => m.cg.setSettledStars(s));

      const settledCount = m.cg.getSettledStars().length - 1; // home system excluded
      const spent = Number(m.cg.getGalacticPointsSpent()) || 0;
      const expected = Math.max(0, settledCount - spent);

      return { settledCount, spent, expected };
    });

    // The frame loop reconciles cosmicRipGalacticPoints to this formula.
    await game.page.waitForTimeout(700);

    const actual = await game.withMods((m) => Number(m.rdo.getCosmicRipGalacticPoints()) || 0);

    expect(result.settledCount).toBeGreaterThan(0);
    expect(actual).toBe(result.expected);
  });

  test('galactic points never go negative when more is spent than earned', async ({ game }) => {
    await game.withMods((m) => {
      m.cg.setGalacticPointsSpent(999);
    });
    await game.page.waitForTimeout(700);

    const points = await game.withMods((m) => Number(m.rdo.getCosmicRipGalacticPoints()) || 0);
    expect(points).toBeGreaterThanOrEqual(0);
  });

  test('spending galactic points reduces the available balance', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.cg.setGalacticPointsSpent(0);
      ['sirius', 'vega', 'rigel', 'altair'].forEach((s) => m.cg.setSettledStars(s));
      const settledCount = m.cg.getSettledStars().length - 1;
      return { settledCount };
    });

    await game.page.waitForTimeout(600);
    const before = await game.withMods((m) => Number(m.rdo.getCosmicRipGalacticPoints()) || 0);

    await game.withMods((m) => m.cg.setGalacticPointsSpent(2));
    await game.page.waitForTimeout(600);
    const after = await game.withMods((m) => Number(m.rdo.getCosmicRipGalacticPoints()) || 0);

    expect(result.settledCount).toBeGreaterThanOrEqual(4);
    expect(after).toBe(before - 2);
  });

  test('settled systems survive a save/load round trip', async ({ game }) => {
    const result = await game.withMods((m) => {
      ['sirius', 'vega'].forEach((s) => m.cg.setSettledStars(s));
      const live = [...m.cg.getSettledStars()];
      const restored = JSON.parse(JSON.stringify(m.cg.captureGameStatusForSaving('initialise')));
      return { live, persisted: restored.settledStars };
    });

    expect(Array.isArray(result.persisted)).toBe(true);
    expect(result.persisted.length).toBe(result.live.length);
    for (const star of result.live) {
      expect(result.persisted).toContain(star);
    }
  });

  test('the current star system is always among the settled systems', async ({ game }) => {
    const consistent = await game.withMods((m) => {
      const current = String(m.cg.getCurrentStarSystem()).toLowerCase();
      const settled = m.cg.getSettledStars().map((s) => String(s).toLowerCase());
      return settled.includes(current);
    });

    expect(consistent).toBe(true);
  });

  test('settled systems the game itself recorded are lowercase', async ({ game }) => {
    // The settlement paths in game.js lowercase before pushing, and the gating
    // checks use includes() against lowercase names — so any uppercase entry that
    // reached the list would silently fail those checks.
    const offenders = await game.withMods((m) =>
      m.cg.getSettledStars().filter((s) => String(s) !== String(s).toLowerCase()));

    expect(offenders).toEqual([]);
  });

  test('AP awarded this run round-trips through its accessor', async ({ game }) => {
    const result = await game.withMods((m) => {
      const before = m.cg.getApAwardedThisRun();
      m.cg.setApAwardedThisRun(5);
      const after = m.cg.getApAwardedThisRun();
      m.cg.setApAwardedThisRun(0);
      const reset = m.cg.getApAwardedThisRun();
      return { before, after, reset };
    });

    expect(result.after).toBe(5);
    expect(result.reset).toBe(0);
  });

  test('settling additional systems increases galactic points monotonically', async ({ game }) => {
    await game.withMods((m) => m.cg.setGalacticPointsSpent(0));

    const readings = [];
    for (const star of ['sirius', 'vega', 'rigel']) {
      await game.withMods((m, s) => m.cg.setSettledStars(s), star);
      await game.page.waitForTimeout(500);
      readings.push(await game.withMods((m) => Number(m.rdo.getCosmicRipGalacticPoints()) || 0));
    }

    for (let i = 1; i < readings.length; i++) {
      expect(readings[i], `reading ${i} should not decrease`).toBeGreaterThanOrEqual(readings[i - 1]);
    }
    expect(readings[readings.length - 1]).toBeGreaterThan(0);
  });
});
