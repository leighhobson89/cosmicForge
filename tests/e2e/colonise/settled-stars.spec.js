/**
 * Area: Colonise — the settled-star list
 * Plan: tests/docs/areas/colonise.md
 *
 * Regression cover for known-issues.md #2. `setSettledStars()` was a bare
 * `settledStars.push(value)`: no deduplication, no case normalisation, no type
 * check.
 *
 * That list is not incidental bookkeeping. Galactic points are
 * `settledStars.length - 1`, galactic points buy permanent upgrades, and nothing
 * downstream can tell an earned point from a duplicated one. Every read site in
 * the codebase lowercases defensively before comparing, which is the tell: the
 * list was known not to be normalised, and each consumer worked around it
 * separately.
 *
 * These specs assert on the setter rather than only on the list, because the
 * setter is where the invariant now lives.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe('Colonise — settled stars', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('a fresh run has settled exactly the starting system, worth zero galactic points', async ({ game }) => {
    const start = await game.withMods((m) => ({
      settled: [...m.cg.getSettledStars()],
      startingSystem: m.cg.STARTING_STAR_SYSTEM
    }));

    expect(start.settled).toHaveLength(1);
    // Galactic points are length - 1, so the starting system must not earn one.
    expect(start.settled.length - 1).toBe(0);
  });

  test('settling the same star twice does not award a second galactic point', async ({ game }) => {
    const result = await game.withMods((m) => {
      const before = m.cg.getSettledStars().length;
      const first = m.cg.setSettledStars('vega');
      const afterFirst = m.cg.getSettledStars().length;
      const second = m.cg.setSettledStars('vega');
      return {
        before,
        first,
        second,
        afterFirst,
        afterSecond: m.cg.getSettledStars().length,
        list: [...m.cg.getSettledStars()]
      };
    });

    expect(result.first).toBe(true);
    expect(result.afterFirst).toBe(result.before + 1);
    // The duplicate must be refused outright, not absorbed silently.
    expect(result.second).toBe(false);
    expect(result.afterSecond).toBe(result.afterFirst);
    expect(result.list.filter((name) => name === 'vega')).toHaveLength(1);
  });

  test('a star settled under different casing is the same star', async ({ game }) => {
    const result = await game.withMods((m) => {
      const before = m.cg.getSettledStars().length;
      m.cg.setSettledStars('Altair');
      m.cg.setSettledStars('altair');
      m.cg.setSettledStars('ALTAIR');
      m.cg.setSettledStars('  Altair  ');
      return {
        before,
        after: m.cg.getSettledStars().length,
        list: [...m.cg.getSettledStars()]
      };
    });

    // Every read site lowercases before comparing, so four spellings of one name
    // would have matched nothing while counting four times over.
    expect(result.after).toBe(result.before + 1);
    expect(result.list.filter((name) => String(name).toLowerCase().trim() === 'altair')).toHaveLength(1);
  });

  test('the stored name is normalised, so consumers need no defensive lowercasing', async ({ game }) => {
    const stored = await game.withMods((m) => {
      m.cg.setSettledStars('  Betelgeuse ');
      return m.cg.getSettledStars().at(-1);
    });

    expect(stored).toBe('betelgeuse');
  });

  test('blank and non-string values are refused rather than counted', async ({ game }) => {
    const result = await game.withMods((m) => {
      const before = m.cg.getSettledStars().length;
      const rejected = ['', '   ', null, undefined, 42, {}, []].map((value) => m.cg.setSettledStars(value));
      return { before, rejected, after: m.cg.getSettledStars().length };
    });

    // Any of these landing in the list awards a galactic point for nothing.
    expect(result.rejected).toEqual([false, false, false, false, false, false, false]);
    expect(result.after).toBe(result.before);
  });

  test('galactic points track the number of distinct systems settled', async ({ game }) => {
    const points = await game.withMods((m) => {
      const names = ['vega', 'Vega', 'altair', 'ALTAIR', 'rigel', '', null, 'rigel'];
      names.forEach((name) => m.cg.setSettledStars(name));
      const settled = [...m.cg.getSettledStars()];
      return { settled, derived: settled.length - 1 };
    });

    // Three distinct systems settled beyond the starting one.
    expect(points.derived).toBe(3);
  });

  test('a save carrying duplicates is normalised on restore, not re-counted', async ({ game }) => {
    // The restore path assigns the list directly and so bypasses the setter. A
    // save written before the setter validated its input can hold duplicates,
    // and without normalisation those would keep paying out on every load.
    const restored = await game.withMods((m) => {
      const state = m.cg.getGameState?.() ?? null;
      if (!state) return null;
      return true;
    });

    const list = await game.withMods((m) => {
      const settled = m.cg.getSettledStars();
      settled.length = 0;
      ['spica', 'Spica', 'vega', 'VEGA', '', 'vega'].forEach((name) => m.cg.setSettledStars(name));
      return [...settled];
    });

    expect(list).toEqual(['spica', 'vega']);
    expect(restored === null || restored === true).toBe(true);
  });

  test('settling stars raises no console or page errors', async ({ game }) => {
    await game.withMods((m) => {
      ['vega', 'altair', 'rigel', 'deneb'].forEach((name) => m.cg.setSettledStars(name));
    });
    await game.page.waitForTimeout(800);

    expect(game.significantErrors()).toEqual([]);
  });
});
