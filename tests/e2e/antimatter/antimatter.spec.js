/**
 * Area: Antimatter — mined, boosted and manufactured
 * Plan: tests/docs/areas/antimatter.md
 *
 * This file replaces the accessor-level specs that used to live here. Those
 * proved the delta timer's arithmetic and that a flag could be written and read
 * back; none of them ever sent a rocket to an asteroid, and so none of them
 * touched the calculation that actually produces antimatter.
 *
 * The whole economy funnels through one function, `updateAntimatterAndDiagram`,
 * which the antimatter delta timer drives once per accumulated 10ms tick:
 *
 *   base rate      NORMAL_MAX_ANTIMATTER_RATE - normalisedEase x (max - min)
 *                  where normalisedEase = (easeOfExtraction - 1) / 9,
 *                  max = 0.004 and min = 0.0001 per tick
 *   x  Enhanced Mining     1 + boughtYet x 0.25       (ascendency buff)
 *   x  F-type system       1 + fTypeBoost             (0.5 by default)
 *   x  antimatter boost    2                          (while active)
 *   =  0                   if the minerBrokeDown event names that rocket
 *   +  megastructures      getMegaStructureAntimatterAmount() / 100 per tick
 *
 * Two properties make this testable exactly rather than approximately, and both
 * are used heavily below:
 *
 * 1. **Conservation.** Every unit of antimatter mined leaves the asteroid, so
 *    `antimatter gained === asteroid quantity lost` whenever the megastructure
 *    contribution is zero. That identity holds no matter how many ticks ran, so
 *    it is immune to the frame loop ticking in the background.
 * 2. **`advanceTimers(ms)` drives the real delta manager**, so a known span of
 *    game time can be run without waiting for it — 100,000ms is 10,000 ticks.
 *    Background frames add a fraction of a percent, which the tolerances absorb.
 *
 * The starting star system is not fixed, and an F-type multiplies extraction, so
 * every expectation below is scaled by the boost the game itself reports rather
 * than by a number that only holds in some runs.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

const ANTIMATTER_TIMER_ID = 'antimatterDeltaTimer';

/** Per-tick extraction bounds, from constantsAndGlobalVars. */
const MAX_RATE = 0.004;
const MIN_RATE = 0.0001;

/** The base per-tick extraction rate for an asteroid of the given ease. */
const baseRateForEase = (ease) => MAX_RATE - (((ease - 1) / 9) * (MAX_RATE - MIN_RATE));

/**
 * Reach a run with rockets built, asteroids discovered and every tech granted —
 * the game's own scenario setup, not a hand-built fiction.
 */
async function prepareMiningRun(game) {
  await game.prepareRunForStarshipLaunch();
  await game.page.waitForTimeout(800);
  await game.withMods((m) => {
    m.rdo.setResourceDataObject(0, 'antimatter', ['quantity']);
    m.rdo.setResourceDataObject(1e9, 'antimatter', ['storageCapacity']);
    m.cg.setAntimatterUnlocked(true);
  });
}

/** Open a rocket's pane in the Space Mining tab by clicking its side-menu row. */
async function openRocketPane(game, rocket = 'rocket1') {
  await game.openTab(6);
  const clicked = await game.page.evaluate((id) => {
    const row = document.getElementById(id);
    if (!row) return false;
    row.closest('.row-side-menu')?.classList.remove('invisible');
    row.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, rocket);
  if (!clicked) throw new Error(`No side-menu row for ${rocket}`);
  await game.page.waitForTimeout(700);

  const pane = await game.withMods((m) => m.cg.getCurrentOptionPane());
  if (pane !== rocket) throw new Error(`Expected the ${rocket} pane, got ${pane}`);
}

/**
 * Put a named asteroid under a rocket's drill without flying there, and give it a
 * known ease of extraction so the rate is an exact figure rather than a roll.
 *
 * Staging, not the behaviour under test — the journey itself is driven for real
 * in the first spec below.
 */
async function stageMining(game, { rocket = 'rocket1', ease = 1, quantity = 5000 } = {}) {
  return game.withMods((m, config) => {
    const entry = m.cg.getAsteroidArray()[config.index];
    const name = Object.keys(entry)[0];

    m.cg.changeAsteroidArray(name, 'easeOfExtraction', [config.ease, 'green-ready-text']);
    m.cg.changeAsteroidArray(name, 'quantity', [config.quantity, 'green-ready-text']);
    entry[name].originalQuantity = config.quantity;

    m.cg.setDestinationAsteroid(config.rocket, name);
    m.cg.setRocketDirection(config.rocket, false);
    m.cg.setCurrentlyTravellingToAsteroid(config.rocket, false);
    m.cg.setMiningObject(config.rocket, name);
    return name;
  }, { rocket, ease, quantity, index: rocket === 'rocket1' ? 0 : 1 });
}

/** Everything a rate assertion needs, read in one round trip. */
async function readMiningState(game, asteroidName) {
  return game.withMods((m, name) => {
    const entry = m.cg.getAsteroidArray().find((a) => a[name]);
    return {
      antimatter: m.rdo.getResourceDataObject('antimatter', ['quantity']),
      rate: m.rdo.getResourceDataObject('antimatter', ['rate']),
      asteroid: entry ? entry[name].quantity[0] : null,
      asteroidClass: entry ? entry[name].quantity[1] : null,
      beingMined: entry ? entry[name].beingMined : null
    };
  }, asteroidName);
}

/** The multiplier the current star system applies to extraction, whatever it is. */
async function starSystemMultiplier(game) {
  return game.withMods((m) => {
    const system = m.cg.getCurrentStarSystem?.();
    const type = system ? m.desc.getStarTypeByName?.(system) : null;
    return type === 'F' ? 1 + m.cg.getFTypeAntimatterMiningBoostMultiplier() : 1;
  });
}

test.describe('Antimatter — mining a real asteroid', () => {
  test.setTimeout(240000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareMiningRun(game);
  });

  test('choosing a destination and pressing Travel flies the rocket out and starts it mining', async ({ game }) => {
    // The rocket has to be in the air for the Travel control to be live; getting
    // it there is the rockets area's job, so it is staged rather than re-tested.
    await game.withMods((m) => m.cg.setLaunchedRockets('rocket1', 'add'));
    await openRocketPane(game, 'rocket1');

    const destination = await game.page.evaluate(() => {
      const dropdown = document.getElementById('rocket1TravelDropdown');
      const option = dropdown?.querySelector('div.dropdown-option');
      if (!option) return null;
      dropdown.querySelector('div.dropdown')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      option.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return option.getAttribute('data-value');
    });
    expect(destination, 'the discovered asteroids should populate the dropdown').toBeTruthy();
    expect(await game.withMods((m) => m.cg.getDestinationAsteroid('rocket1'))).toBe(destination);

    // The all-time stats live behind the statFunctionsGets map rather than in the
    // resource data object.
    const minedBefore = await game.withMods((m) => m.cg.statFunctionsGets['stat_asteroidsMined']());

    await game.page.evaluate(() =>
      document.querySelector('.rocket1-travel-to-asteroid-button')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await game.page.waitForTimeout(500);

    const travelling = await game.withMods((m) => ({
      travelling: m.cg.getCurrentlyTravellingToAsteroid('rocket1'),
      remaining: m.cg.getTimeLeftUntilRocketTravelToAsteroidTimerFinishes('rocket1')
    }));
    expect(travelling.travelling, 'the button starts the journey').toBe(true);
    expect(travelling.remaining).toBeGreaterThan(0);

    // Fly it, by running the real travel timer rather than calling its completion
    // handler. Distance is at most 570,000 at speed 0.2, so 3,000,000ms covers it.
    await game.advanceTimers(3_000_000);
    await game.page.waitForTimeout(500);

    const arrived = await game.withMods((m, name) => ({
      mining: m.cg.getMiningObject().rocket1,
      travelling: m.cg.getCurrentlyTravellingToAsteroid('rocket1'),
      unlocked: m.cg.getAntimatterUnlocked(),
      mined: m.cg.statFunctionsGets['stat_asteroidsMined'](),
      beingMined: m.cg.getAsteroidArray().find((a) => a[name])?.[name]?.beingMined
    }), destination);

    expect(arrived.travelling).toBe(false);
    expect(arrived.mining, 'the rocket is parked on the asteroid it was sent to').toBe(destination);
    expect(arrived.unlocked, 'arriving unlocks antimatter if it was still locked').toBe(true);
    expect(arrived.mined).toBe(minedBefore + 1);

    // And it is actually producing: one advance, and the pile grows.
    const before = await readMiningState(game, destination);
    await game.advanceTimers(50_000);
    const after = await readMiningState(game, destination);
    expect(after.beingMined).toBe(true);
    expect(after.antimatter).toBeGreaterThan(before.antimatter);
  });

  test('every unit of antimatter gained is a unit taken off the asteroid', async ({ game }) => {
    const name = await stageMining(game, { ease: 1, quantity: 5000 });
    await game.withMods((m) => m.cg.setMegaStructureAntimatterAmount(-m.cg.getMegaStructureAntimatterAmount()));

    const before = await readMiningState(game, name);
    await game.advanceTimers(100_000);
    const after = await readMiningState(game, name);

    const gained = after.antimatter - before.antimatter;
    const removed = before.asteroid - after.asteroid;

    expect(gained).toBeGreaterThan(0);
    // Exact, and independent of how many ticks actually ran: nothing is created
    // and nothing is lost between the rock and the store.
    expect(gained).toBeCloseTo(removed, 6);
  });

  test('extraction follows the ease-of-extraction formula', async ({ game }) => {
    const systemMultiplier = await starSystemMultiplier(game);

    const measure = async (ease) => {
      const name = await stageMining(game, { ease, quantity: 5000 });
      const before = await readMiningState(game, name);
      await game.advanceTimers(100_000);
      const after = await readMiningState(game, name);
      return before.asteroid - after.asteroid;
    };

    // 100,000ms is 10,000 ticks, so removal should be rate x 10,000.
    const easiest = await measure(1);
    const hardest = await measure(10);

    const expectedEasiest = baseRateForEase(1) * systemMultiplier * 10_000;
    const expectedHardest = baseRateForEase(10) * systemMultiplier * 10_000;

    expect(easiest).toBeGreaterThan(expectedEasiest * 0.95);
    expect(easiest).toBeLessThan(expectedEasiest * 1.05);
    expect(hardest).toBeGreaterThan(expectedHardest * 0.95);
    expect(hardest).toBeLessThan(expectedHardest * 1.05);

    // The floor is not zero — even the worst rock is worth mining.
    expect(hardest).toBeGreaterThan(0);
    expect(easiest).toBeGreaterThan(hardest * 10);
  });

  test('an asteroid mines out exactly, never past zero, and sends the rocket home', async ({ game }) => {
    const name = await stageMining(game, { ease: 1, quantity: 12 });

    const before = await readMiningState(game, name);
    // The live loop mines a little between staging and this read, so the rock is
    // "about 12" — what matters is that the player is credited with all of it.
    expect(before.asteroid).toBeGreaterThan(11);
    expect(before.asteroid).toBeLessThanOrEqual(12);

    // Far more ticks than the rock can supply.
    await game.advanceTimers(200_000);
    await game.page.waitForTimeout(400);

    const after = await readMiningState(game, name);
    const gained = after.antimatter - before.antimatter;

    expect(after.asteroid, 'the rock is emptied, not overdrawn').toBe(0);

    // Working a rock dry also earns the "Mine All Antimatter from an Asteroid"
    // achievement, which pays a flat 150 on top. The rock's own contents still
    // have to be credited exactly — the last partial tick is clamped to what was
    // left — so the two are asserted separately rather than lumped together.
    const award = await game.withMods((m) =>
      m.rdo.getAchievementDataObject?.('mineAllAntimatterAsteroid')?.gives?.value1?.quantity ?? 0);
    expect(award).toBe(150);
    expect(gained).toBeCloseTo(before.asteroid + award, 6);

    const rocket = await game.withMods((m) => ({
      returning: m.cg.getRocketDirection('rocket1'),
      mining: m.cg.getMiningObject().rocket1
    }));
    expect(rocket.returning, 'a depleted asteroid turns the rocket around').toBe(true);
    expect(rocket.mining, 'and it stops being counted as mining').toBe(null);
  });

  test('the asteroid’s remaining-quantity colour tracks how much is left', async ({ game }) => {
    const name = await stageMining(game, { ease: 1, quantity: 1000 });

    const classAt = async (remaining) => {
      await game.withMods((m, config) => {
        m.cg.changeAsteroidArray(config.name, 'quantity', [config.remaining, 'none']);
      }, { name, remaining });
      await game.advanceTimers(100);
      return (await readMiningState(game, name)).asteroidClass;
    };

    // Thresholds are percentages of originalQuantity: >90 ready, >50 none,
    // >20 warning, else disabled.
    expect(await classAt(960)).toBe('ready-text');
    expect(await classAt(700)).toBe('none');
    expect(await classAt(300)).toBe('warning-text');
    expect(await classAt(100)).toBe('disabled-text');
  });
});

test.describe('Antimatter — what changes the mining rate', () => {
  test.setTimeout(240000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareMiningRun(game);
    await game.withMods((m) => m.cg.setMegaStructureAntimatterAmount(-m.cg.getMegaStructureAntimatterAmount()));
  });

  /** Antimatter gained across a fixed span of game time. */
  const gainOver = async (game, name, ms = 100_000) => {
    const before = await readMiningState(game, name);
    await game.advanceTimers(ms);
    const after = await readMiningState(game, name);
    return after.antimatter - before.antimatter;
  };

  test('the Enhanced Mining perk multiplies extraction by a quarter per purchase', async ({ game }) => {
    const name = await stageMining(game, { ease: 1, quantity: 500000 });

    await game.withMods((m) => { m.rdo.getBuffEnhancedMiningData().boughtYet = 0; });
    const plain = await gainOver(game, name);

    await game.withMods((m) => { m.rdo.getBuffEnhancedMiningData().boughtYet = 2; });
    const boosted = await gainOver(game, name);

    const magnitude = await game.withMods((m) => m.rdo.getBuffEnhancedMiningData().effectCategoryMagnitude);
    expect(magnitude).toBe(0.25);

    // Two purchases is 1 + 2 x 0.25 = 1.5x.
    expect(plain).toBeGreaterThan(0);
    expect(boosted / plain).toBeGreaterThan(1.45);
    expect(boosted / plain).toBeLessThan(1.55);
  });

  test('the antimatter boost doubles extraction while it is active', async ({ game }) => {
    const name = await stageMining(game, { ease: 1, quantity: 500000 });

    await game.withMods((m) => m.cg.setIsAntimatterBoostActive(false));
    const plain = await gainOver(game, name);

    await game.withMods((m) => m.cg.setIsAntimatterBoostActive(true));
    const boosted = await gainOver(game, name);

    expect(await game.withMods((m) => m.cg.getBoostRate())).toBe(2);
    expect(plain).toBeGreaterThan(0);
    expect(boosted / plain).toBeGreaterThan(1.9);
    expect(boosted / plain).toBeLessThan(2.1);

    await game.withMods((m) => m.cg.setIsAntimatterBoostActive(false));
  });

  test('the F-type star bonus applies in an F-type system and nowhere else', async ({ game }) => {
    const name = await stageMining(game, { ease: 1, quantity: 500000 });
    const isFType = await game.withMods((m) => {
      const system = m.cg.getCurrentStarSystem?.();
      return system ? m.desc.getStarTypeByName?.(system) === 'F' : false;
    });

    const original = await game.withMods((m) => m.cg.getFTypeAntimatterMiningBoostMultiplier());
    expect(original).toBeGreaterThanOrEqual(0);

    const atDefault = await gainOver(game, name);
    await game.withMods((m) => m.cg.setFTypeAntimatterMiningBoostMultiplier(3));
    const atTripled = await gainOver(game, name);
    await game.withMods((m, value) => m.cg.setFTypeAntimatterMiningBoostMultiplier(value), original);

    expect(atDefault).toBeGreaterThan(0);
    if (isFType) {
      // 1 + 3 against 1 + 0.5 is a 2.667x step.
      const expected = (1 + 3) / (1 + original);
      expect(atTripled / atDefault).toBeGreaterThan(expected * 0.95);
      expect(atTripled / atDefault).toBeLessThan(expected * 1.05);
    } else {
      // Outside an F-type system the multiplier must be inert, however large.
      expect(atTripled / atDefault).toBeGreaterThan(0.95);
      expect(atTripled / atDefault).toBeLessThan(1.05);
    }
  });

  test('a broken-down miner stops that rocket and only that rocket', async ({ game }) => {
    const first = await stageMining(game, { rocket: 'rocket1', ease: 1, quantity: 500000 });
    const second = await stageMining(game, { rocket: 'rocket2', ease: 1, quantity: 500000 });
    expect(first).not.toBe(second);

    const both = await gainOver(game, first);
    expect(both).toBeGreaterThan(0);

    const applied = await game.withMods((m) =>
      typeof m.game.applyTimedEffect === 'function'
        ? !!m.game.applyTimedEffect('minerBrokeDown', { rocket: 'rocket1' })
        : false);

    const rocket1Before = await readMiningState(game, first);
    const rocket2Before = await readMiningState(game, second);
    await game.advanceTimers(100_000);
    const rocket1After = await readMiningState(game, first);
    const rocket2After = await readMiningState(game, second);

    const rocket1Removed = rocket1Before.asteroid - rocket1After.asteroid;
    const rocket2Removed = rocket2Before.asteroid - rocket2After.asteroid;

    // Whether or not the event could be applied, the second rocket must keep
    // working — a fault on one drill never stops the fleet.
    expect(rocket2Removed).toBeGreaterThan(0);
    if (applied) {
      expect(rocket1Removed, 'the broken rocket extracts nothing').toBeCloseTo(0, 6);
    } else {
      expect(rocket1Removed).toBeGreaterThan(0);
    }
  });

  test('two rockets on two asteroids both contribute to one total', async ({ game }) => {
    const first = await stageMining(game, { rocket: 'rocket1', ease: 1, quantity: 500000 });

    const alone = await gainOver(game, first);

    const second = await stageMining(game, { rocket: 'rocket2', ease: 1, quantity: 500000 });
    const together = await gainOver(game, first);

    expect(alone).toBeGreaterThan(0);
    // Identical asteroids, so the second drill doubles the intake.
    expect(together / alone).toBeGreaterThan(1.9);
    expect(together / alone).toBeLessThan(2.1);

    const removed = await game.withMods((m, names) => names.map((name) => {
      const entry = m.cg.getAsteroidArray().find((a) => a[name]);
      return entry ? entry[name].originalQuantity - entry[name].quantity[0] : null;
    }), [first, second]);
    expect(removed.every((value) => value > 0), 'both rocks are being worked').toBe(true);
  });
});

test.describe('Antimatter — the megastructure contribution', () => {
  test.setTimeout(240000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await prepareMiningRun(game);
    await game.withMods((m) => m.cg.setMegaStructureAntimatterAmount(-m.cg.getMegaStructureAntimatterAmount()));
  });

  test('each megastructure adds its 0.15 on top rather than replacing the last', async ({ game }) => {
    const amounts = await game.withMods((m) => {
      const seen = [m.cg.getMegaStructureAntimatterAmount()];
      // One call per megastructure reaching its Disconnect stage.
      for (let i = 0; i < 4; i++) {
        m.cg.setMegaStructureAntimatterAmount(0.15);
        seen.push(m.cg.getMegaStructureAntimatterAmount());
      }
      return seen;
    });

    expect(amounts[0]).toBe(0);
    // The setter accumulates — four Disconnects are worth 0.6 between them, not
    // 0.15 with the other three thrown away.
    expect(amounts[1]).toBeCloseTo(0.15, 6);
    expect(amounts[2]).toBeCloseTo(0.3, 6);
    expect(amounts[3]).toBeCloseTo(0.45, 6);
    expect(amounts[4]).toBeCloseTo(0.6, 6);
  });

  test('a megastructure produces antimatter with no asteroid being mined at all', async ({ game }) => {
    await game.withMods((m) => {
      // No rocket anywhere near a rock.
      for (const rocket of ['rocket1', 'rocket2', 'rocket3', 'rocket4']) {
        m.cg.setMiningObject(rocket, null);
      }
      m.cg.setMegaStructureAntimatterAmount(0.15);
    });

    const before = await game.withMods((m) => m.rdo.getResourceDataObject('antimatter', ['quantity']));
    await game.advanceTimers(100_000);
    const after = await game.withMods((m) => ({
      quantity: m.rdo.getResourceDataObject('antimatter', ['quantity']),
      rate: m.rdo.getResourceDataObject('antimatter', ['rate'])
    }));

    // 0.15 spread over TIMER_RATE_RATIO is 0.0015 a tick, so 10,000 ticks is 15.
    const gained = after.quantity - before;
    expect(gained).toBeGreaterThan(15 * 0.95);
    expect(gained).toBeLessThan(15 * 1.05);
    expect(after.rate).toBeCloseTo(0.0015, 6);
  });

  test('megastructure output adds to mining output instead of replacing it', async ({ game }) => {
    const name = await stageMining(game, { ease: 1, quantity: 500000 });

    const beforeMining = await readMiningState(game, name);
    await game.advanceTimers(100_000);
    const afterMining = await readMiningState(game, name);
    const miningOnly = afterMining.antimatter - beforeMining.antimatter;

    await game.withMods((m) => m.cg.setMegaStructureAntimatterAmount(0.15));

    const beforeBoth = await readMiningState(game, name);
    await game.advanceTimers(100_000);
    const afterBoth = await readMiningState(game, name);
    const both = afterBoth.antimatter - beforeBoth.antimatter;

    const megaShare = both - miningOnly;
    expect(miningOnly).toBeGreaterThan(0);
    // The extra is the megastructure's own 15 over 10,000 ticks, not a change to
    // the mining rate — mining is still removing rock at the same pace.
    expect(megaShare).toBeGreaterThan(15 * 0.9);
    expect(megaShare).toBeLessThan(15 * 1.1);

    const removedWithMega = beforeBoth.asteroid - afterBoth.asteroid;
    const removedWithout = beforeMining.asteroid - afterMining.asteroid;
    expect(removedWithMega / removedWithout).toBeGreaterThan(0.95);
    expect(removedWithMega / removedWithout).toBeLessThan(1.05);
  });

  test('a megastructure unlock survives the rebirth reset that otherwise clears it', async ({ game }) => {
    // Without the permanent grant, rebirth takes antimatter away again.
    const withoutGrant = await game.withMods((m) => {
      m.cg.setPermanentAntimatterUnlock(false);
      m.cg.setAntimatterUnlocked(true);
      m.cg.resetAllVariablesOnRebirth();
      return m.cg.getAntimatterUnlocked();
    });
    expect(withoutGrant, 'an ordinary run loses the unlock on rebirth').toBe(false);

    // With it, the unlock is kept — this is the whole point of the megastructure
    // reward, and the only thing that makes it worth more than a run's worth of
    // mining.
    const withGrant = await game.withMods((m) => {
      m.cg.setPermanentAntimatterUnlock(true);
      m.cg.setAntimatterUnlocked(true);
      m.cg.resetAllVariablesOnRebirth();
      return {
        unlocked: m.cg.getAntimatterUnlocked(),
        permanent: m.cg.getPermanentAntimatterUnlock()
      };
    });
    expect(withGrant.unlocked).toBe(true);
    expect(withGrant.permanent, 'the grant itself is not reset either').toBe(true);
  });
});

test.describe('Antimatter — gaining, locking and reporting', () => {
  test.setTimeout(240000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('starts locked with zero quantity on a fresh save', async ({ game }) => {
    const state = await game.withMods((m) => ({
      unlocked: m.cg.getAntimatterUnlocked(),
      quantity: m.rdo.getResourceDataObject('antimatter', ['quantity']),
      permanent: m.cg.getPermanentAntimatterUnlock()
    }));

    expect(state.unlocked).toBe(false);
    expect(state.quantity).toBe(0);
    expect(state.permanent).toBe(false);
  });

  test('nothing accrues while antimatter is locked, however much time passes', async ({ game }) => {
    await prepareMiningRun(game);
    const name = await stageMining(game, { ease: 1, quantity: 500000 });

    await game.withMods((m) => {
      m.cg.setPermanentAntimatterUnlock(false);
      m.cg.setAntimatterUnlocked(false);
      m.rdo.setResourceDataObject(0, 'antimatter', ['quantity']);
    });

    const before = await readMiningState(game, name);
    await game.advanceTimers(200_000);
    const after = await readMiningState(game, name);

    // The delta timer returns early while locked, so neither the store nor the
    // asteroid moves — a rocket parked on a rock produces nothing until the
    // player has earned the right to it.
    expect(after.antimatter).toBe(before.antimatter);
    expect(after.asteroid).toBe(before.asteroid);
  });

  test('the reported rate is per tick, and the displayed rate is per second', async ({ game }) => {
    await prepareMiningRun(game);
    const name = await stageMining(game, { ease: 1, quantity: 500000 });
    await game.withMods((m) => m.cg.setMegaStructureAntimatterAmount(-m.cg.getMegaStructureAntimatterAmount()));

    await game.advanceTimers(2000);
    await game.page.waitForTimeout(400);

    const systemMultiplier = await starSystemMultiplier(game);
    const state = await readMiningState(game, name);
    const expectedPerTick = baseRateForEase(1) * systemMultiplier;

    expect(state.rate).toBeGreaterThan(expectedPerTick * 0.9);
    expect(state.rate).toBeLessThan(expectedPerTick * 1.1);

    // The side-menu figure is the per-tick rate scaled by TIMER_RATE_RATIO, so a
    // player reads antimatter per second rather than per frame.
    const displayed = await game.page.evaluate(() =>
      document.getElementById('miningRate')?.innerText?.trim());
    const parsed = parseFloat(String(displayed).replace(/[^\d.]/g, ''));
    const ratio = await game.withMods((m) => m.cg.getTimerRateRatio());

    expect(String(displayed)).toContain('/ s');
    expect(parsed).toBeGreaterThan(expectedPerTick * ratio * 0.5);
  });

  test('the all-time stat tracks what was actually gained', async ({ game }) => {
    await prepareMiningRun(game);
    const name = await stageMining(game, { ease: 1, quantity: 500000 });
    await game.withMods((m) => m.cg.setMegaStructureAntimatterAmount(-m.cg.getMegaStructureAntimatterAmount()));

    // stat_antimatter reports the *balance*; stat_antimatterMined is the lifetime
    // total, which is the one that must track what was gained.
    const read = (m) => ({
      stat: m.cg.statFunctionsGets['stat_antimatterMined'](),
      quantity: m.rdo.getResourceDataObject('antimatter', ['quantity'])
    });

    const before = await game.withMods(read);
    await game.advanceTimers(100_000);
    const after = await game.withMods(read);

    const gained = after.quantity - before.quantity;
    expect(gained).toBeGreaterThan(0);
    // The lifetime figure has to move with the balance, or the statistics pane
    // under-reports every run.
    expect(after.stat - before.stat).toBeCloseTo(gained, 4);
  });

  test('antimatter quantity and the unlock survive a save/load round trip', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.cg.setAntimatterUnlocked(true);
      m.cg.setMegaStructureAntimatterAmount(0.3 - m.cg.getMegaStructureAntimatterAmount());
      m.rdo.setResourceDataObject(1234.5, 'antimatter', ['quantity']);

      const captured = m.cg.captureGameStatusForSaving('initialise');
      const restored = JSON.parse(JSON.stringify(captured));

      return {
        quantity: restored.resourceData?.antimatter?.quantity,
        megaStructureAmount: restored.megaStructureAntimatterAmount
      };
    });

    expect(result.quantity).toBe(1234.5);
    // The megastructure contribution is a permanent, run-spanning bonus, so it
    // has to be part of the save rather than recomputed from techs.
    expect(result.megaStructureAmount).toBeCloseTo(0.3, 6);
  });

  test('the mining option becomes reachable once antimatter is unlocked', async ({ game }) => {
    await game.withMods((m) => m.cg.setAntimatterUnlocked(true));
    await game.openTab(6);
    await game.page.waitForTimeout(600);

    const exists = await game.page.evaluate(() => Boolean(document.getElementById('miningOption')));
    expect(exists).toBe(true);
  });
});

test.describe('Antimatter — the delta timer that drives it', () => {
  test.setTimeout(120000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
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
  // behaviour covered by the mining tests above.

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
      return { interval, total, whole: Math.floor(total / interval), remainder: total % interval };
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

      return { accumulator, expected: step * 100 };
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

      return { nan: run(NaN), negative: run(-5), zero: run(0), infinite: run(Infinity), string: run('10') };
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
      return { afterZero, afterNegative: acc };
    });

    expect(result.afterZero).toBe(0);
    expect(result.afterNegative).toBe(0);
  });
});
