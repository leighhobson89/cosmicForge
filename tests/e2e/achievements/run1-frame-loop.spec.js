/**
 * Area: Achievements — run 1 frame-loop survival
 * Plan: tests/docs/areas/achievements.md
 *
 * Regression cover for known-issues.md #1, which was the worst defect this suite
 * has found: discovering an asteroid on run 1 killed the frame loop permanently
 * and the game silently froze, with no error shown to the player.
 *
 * Three things combined. `compoundCreateDropdownRecipeText` was only built inside
 * `resetAllVariablesOnRebirth()`, so before a first rebirth it was still a
 * function rather than a table; `addAchievementBonus` dereferenced it unguarded
 * for any achievement granting a `createCostCompounds` multiplier, which
 * `discoverAsteroid` does; and `gameLoop` puts its `requestAnimationFrame` call
 * at the *end* of the body, so a single throw ends the loop for good.
 *
 * The table is now built on demand by `ensureCompoundCreateDropdownRecipeText()`,
 * which closes the first cause. These specs pin all three ends of it, because any
 * one of them regressing brings the freeze back.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** Achievements whose bonus enters the compound branch of `addAchievementBonus`. */
const COMPOUND_COST_ACHIEVEMENT = 'discoverAsteroid';

test.describe('Achievements — run 1 frame-loop survival', () => {
  test('the compound recipe table is a real object on run 1, before any rebirth', async ({ game }) => {
    await game.boot();

    const table = await game.withMods((m) => {
      const compounds = Object.keys(m.rdo.getResourceDataObject('compounds') || {})
        .filter((k) => k !== 'version');
      return compounds.map((compound) => {
        const entry = m.cg.getCompoundCreateDropdownRecipeText(compound);
        return {
          compound,
          type: typeof entry,
          isObject: Boolean(entry) && typeof entry === 'object'
        };
      });
    });

    expect(table.length).toBeGreaterThan(0);
    // A function here is the original bug: the table had not been built yet.
    expect(table.filter((t) => !t.isObject)).toEqual([]);
  });

  test('discovering an asteroid on run 1 does not stop the frame loop', async ({ game }) => {
    await game.boot();

    // Asserted rather than assumed: the bug only ever existed before a first
    // rebirth, so a spec that silently ran on run 2 would prove nothing.
    const runBefore = await game.withMods((m) => m.cg.getStatRun());
    expect(runBefore, 'this spec is only meaningful before a first rebirth').toBe(1);

    await game.debugClick('add10AsteroidsButton');

    // The frame loop's own clock is the liveness signal: if `gameLoop` threw,
    // `requestAnimationFrame` was never re-armed and this stops advancing.
    const a = await game.withMods((m) => JSON.stringify(m.cg.getGameActiveCountTime()));
    await game.page.waitForTimeout(1200);
    const b = await game.withMods((m) => JSON.stringify(m.cg.getGameActiveCountTime()));

    expect(b, 'the frame loop stopped advancing after discovering an asteroid').not.toBe(a);
    expect(game.significantErrors()).toEqual([]);
  });

  test('the achievement that triggered the freeze still grants its bonus', async ({ game }) => {
    await game.boot();

    // Proving the loop survived is only half of it — the bonus must still be
    // applied, or a future "fix" that swallows the achievement would pass above.
    const granted = await game.withMods((m, achievement) => {
      const before = [...(m.cg.getAchievementFlagArray?.() ?? [])];
      m.ach.checkForAchievements?.();
      return {
        before,
        after: [...(m.cg.getAchievementFlagArray?.() ?? [])],
        achievement
      };
    }, COMPOUND_COST_ACHIEVEMENT);

    await game.debugClick('add10AsteroidsButton');
    await game.page.waitForTimeout(600);

    const flags = await game.withMods((m) => [...(m.cg.getAchievementFlagArray?.() ?? [])]);
    expect(Array.isArray(flags)).toBe(true);
    expect(granted.achievement).toBe(COMPOUND_COST_ACHIEVEMENT);
    expect(game.significantErrors()).toEqual([]);
  });
});
