/**
 * Area: Rebirth — what the reset keeps and what it clears
 * Plan: tests/docs/areas/rebirth.md
 *
 * `rebirth.spec.js` covers the refusal path and the button's honesty. This file
 * covers the other half of the plan: that a *successful* rebirth resets exactly
 * what it should and nothing more.
 *
 * The distinction that matters to a player is between run state and meta state.
 * Resources, techs, buildings and the star system belong to the run and must go.
 * Ascendency points, achievements, perks and the chosen philosophy are earned
 * across runs and must survive — losing any of them silently is unrecoverable,
 * because there is no undo and the autosave writes immediately afterwards.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/**
 * Put the run in the state a player reaches by travelling to a system and
 * scanning it — the precondition `rebirth()` refuses without.
 */
async function scanDestinationSystem(game, starName = 'altair') {
  return game.withMods((m, name) => {
    m.game.generateStarDataAndAddToDataObject({ id: name }, 12);
    m.cg.setDestinationStar(name);
    m.rdo.copyStarDataToDestinationStarField(name);
    m.cg.setDestinationStarScanned(true);
    return Boolean(m.rdo.getStarSystemDataObject('stars', ['destinationStar'], true));
  }, starName);
}

async function dismissAnyOpenModal(page) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const closed = await page.evaluate(() => {
      const cancel = document.getElementById('modalCancel');
      if (cancel?.offsetParent) { cancel.click(); return true; }
      const confirm = document.getElementById('modalConfirm');
      if (confirm?.offsetParent) { confirm.click(); return true; }
      return false;
    });
    if (!closed) return;
    await page.waitForTimeout(500);
  }
}

test.describe('Rebirth — run state is cleared', () => {
  test.beforeEach(async ({ game, page }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await dismissAnyOpenModal(page);
  });

  test('the run counter increments by exactly one', async ({ game }) => {
    await scanDestinationSystem(game);

    const runs = await game.withMods((m) => {
      const before = m.cg.getStatRun();
      const completed = m.game.rebirth();
      return { before, completed, after: m.cg.getStatRun() };
    });

    expect(runs.completed).not.toBe(false);
    expect(runs.after).toBe(runs.before + 1);
  });

  test('resources and compounds are emptied back to their starting stock', async ({ game }) => {
    await scanDestinationSystem(game);

    // `prepareRunForStarshipLaunch` gives 1B of everything, so anything still
    // holding a late-game quantity afterwards was not reset.
    const result = await game.withMods((m) => {
      const sample = ['hydrogen', 'carbon', 'iron'];
      const before = sample.map((key) => m.rdo.getResourceDataObject('resources', [key, 'quantity']));
      m.game.rebirth();
      const after = sample.map((key) => m.rdo.getResourceDataObject('resources', [key, 'quantity']));
      return { sample, before, after };
    });

    for (let i = 0; i < result.sample.length; i++) {
      expect(result.before[i], `${result.sample[i]} should be stocked before rebirth`).toBeGreaterThan(1000);
      expect(result.after[i], `${result.sample[i]} should be reset by rebirth`).toBeLessThan(result.before[i]);
    }
  });

  test('the star system is rebuilt around the scanned destination', async ({ game }) => {
    await scanDestinationSystem(game, 'altair');

    const system = await game.withMods((m) => {
      const before = m.cg.getCurrentStarSystem();
      m.game.rebirth();
      return { before, after: m.cg.getCurrentStarSystem() };
    });

    expect(String(system.after).toLowerCase()).toContain('altair');
    expect(system.after).not.toBe(system.before);
  });

  test('the destination record is consumed, so a second rebirth is refused', async ({ game }) => {
    await scanDestinationSystem(game);

    // This is the exact shape of known-issues.md #10: the record that `rebirth()`
    // builds from is deleted by the rebirth itself, so a second one without a
    // fresh scan has nothing to work from and must be refused rather than
    // tearing the run down part-way.
    const outcome = await game.withMods((m) => {
      const first = m.game.rebirth();
      const recordAfterFirst = m.rdo.getStarSystemDataObject('stars', ['destinationStar'], true);
      const second = m.game.rebirth();
      return { first, second, recordAfterFirst: Boolean(recordAfterFirst) };
    });

    expect(outcome.first).not.toBe(false);
    expect(outcome.recordAfterFirst).toBe(false);
    expect(outcome.second).toBe(false);
    expect(game.significantErrors()).toEqual([]);
  });
});

test.describe('Rebirth — meta state survives', () => {
  test.beforeEach(async ({ game, page }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await dismissAnyOpenModal(page);
  });

  test('ascendency points carry over and are increased, never reduced', async ({ game }) => {
    await scanDestinationSystem(game);

    const points = await game.withMods((m) => {
      m.cg.setAscendencyPoints(500);
      const before = m.cg.getAscendencyPoints();
      m.game.rebirth();
      return { before, after: m.cg.getAscendencyPoints() };
    });

    // A rebirth grants AP; the one thing it must never do is take any away.
    expect(points.after).toBeGreaterThanOrEqual(points.before);
  });

  test('achievements earned in the run survive the reset', async ({ game }) => {
    await scanDestinationSystem(game);

    const flags = await game.withMods((m) => {
      m.cg.setAchievementFlagArray('launchRocket', 'add');
      const before = [...(m.cg.getAchievementFlagArray() ?? [])];
      m.game.rebirth();
      return { before, after: [...(m.cg.getAchievementFlagArray() ?? [])] };
    });

    expect(flags.before).toContain('launchRocket');
    expect(flags.after).toContain('launchRocket');
  });

  test('the chosen philosophy survives the reset', async ({ game }) => {
    await scanDestinationSystem(game);

    const philosophy = await game.withMods((m) => {
      m.cg.setPlayerPhilosophy('supremacist');
      const before = m.cg.getPlayerPhilosophy();
      m.game.rebirth();
      return { before, after: m.cg.getPlayerPhilosophy() };
    });

    expect(philosophy.before).toBe('supremacist');
    expect(philosophy.after).toBe('supremacist');
  });

  test('settled stars accumulate rather than resetting each run', async ({ game }) => {
    await scanDestinationSystem(game);

    const settled = await game.withMods((m) => {
      const before = [...(m.cg.getSettledStars() ?? [])];
      m.game.rebirth();
      return { before, after: [...(m.cg.getSettledStars() ?? [])] };
    });

    // Galactic points are derived from this list's length, so a reset here would
    // silently take points away from the player.
    expect(settled.after.length).toBeGreaterThanOrEqual(settled.before.length);
  });
});

test.describe('Rebirth — the run is playable afterwards', () => {
  test.beforeEach(async ({ game, page }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await dismissAnyOpenModal(page);
  });

  test('the frame loop is still running after a rebirth', async ({ game }) => {
    await scanDestinationSystem(game);
    await game.withMods((m) => m.game.rebirth());
    await game.page.waitForTimeout(600);

    const a = await game.withMods((m) => JSON.stringify(m.cg.getGameActiveCountTime()));
    await game.page.waitForTimeout(1200);
    const b = await game.withMods((m) => JSON.stringify(m.cg.getGameActiveCountTime()));

    // known-issues.md #1 showed how a dead frame loop presents: no error, no
    // visible change, and the game simply stops.
    expect(b).not.toBe(a);
  });

  test('a rebirth writes nothing to the console', async ({ game }) => {
    await scanDestinationSystem(game);
    await game.withMods((m) => m.game.rebirth());
    await game.page.waitForTimeout(1500);

    // The reported symptom was thousands of `Missing subKey: undefined` warnings
    // streaming from the frame loop after a half-completed reset.
    expect(game.significantErrors()).toEqual([]);
  });

  test('resources keep producing after a rebirth', async ({ game }) => {
    await scanDestinationSystem(game);
    await game.withMods((m) => m.game.rebirth());
    await game.page.waitForTimeout(600);

    await game.withMods((m) => {
      m.cg.setPowerOnOff(true);
      m.rdo.setResourceDataObject(true, 'resources', ['hydrogen', 'revealedYet']);
      m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'quantity']);
      m.rdo.setResourceDataObject(1e9, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(1, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      m.rdo.setResourceDataObject(100, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      m.rdo.setResourceDataObject(true, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'active']);
    });

    const first = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']));
    await game.page.waitForTimeout(1500);
    const second = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']));

    expect(second).toBeGreaterThan(first);
  });

  test('the tab the player is left on is a real, drawable tab', async ({ game }) => {
    await scanDestinationSystem(game);
    await game.withMods((m) => m.game.rebirth());
    await game.page.waitForTimeout(1000);

    const tab = await game.withMods((m) => m.cg.getCurrentTab());
    expect(Array.isArray(tab)).toBe(true);
    expect(typeof tab[0]).toBe('number');
    expect(tab[0]).toBeGreaterThanOrEqual(1);
  });
});
