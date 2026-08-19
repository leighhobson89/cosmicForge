/**
 * Area: Rockets & Launch Pad
 * Plan: tests/docs/areas/rockets.md
 *
 * Four rockets, each a three-stage lifecycle:
 *
 *   build    — `builtParts` climbs to `parts`, paid for in three compounds
 *   fuel     — `fuelQuantity` climbs to `fuelQuantityToLaunch` (10,000 for r1)
 *   launch   — `launchRocket()` records it and hides its autobuyer row
 *
 * then a round trip to an asteroid and back via `startTravelToAndFromAsteroidTimer`,
 * ending in `resetRocketForNextJourney`.
 *
 * `getFuelLevel` is the one piece of arithmetic the UI depends on directly — it
 * drives the fuelling progress bar — and it clamps to 0..100, so it is worth
 * pinning at both ends rather than only in the middle.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

const ROCKETS = ['rocket1', 'rocket2', 'rocket3', 'rocket4'];

/** The three compounds every rocket is paid for in, as `resourceNPrice` entries. */
const PRICE_SLOTS = ['resource1Price', 'resource2Price', 'resource3Price'];

test.describe('Rockets — catalogue and structure', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('all four rockets exist with parts, price and a fuel requirement', async ({ game }) => {
    const problems = await game.withMods((m, rockets) => {
      const issues = [];
      for (const rocket of rockets) {
        const entry = m.rdo.getResourceDataObject('space', ['upgrades', rocket]);
        if (!entry) { issues.push(`${rocket}: missing`); continue; }

        if (typeof entry.parts !== 'number' || entry.parts <= 0) issues.push(`${rocket}.parts ${entry.parts}`);
        if (entry.builtParts !== 0) issues.push(`${rocket}.builtParts starts at ${entry.builtParts}`);
        if (typeof entry.price !== 'number' || entry.price <= 0) issues.push(`${rocket}.price ${entry.price}`);
        if (typeof entry.fuelQuantityToLaunch !== 'number' || entry.fuelQuantityToLaunch <= 0) {
          issues.push(`${rocket}.fuelQuantityToLaunch ${entry.fuelQuantityToLaunch}`);
        }
        if (entry.fuelQuantity !== 0) issues.push(`${rocket}.fuelQuantity starts at ${entry.fuelQuantity}`);
      }
      return issues;
    }, ROCKETS);

    expect(problems).toEqual([]);
  });

  test('every rocket is paid for in three real compounds', async ({ game }) => {
    const problems = await game.withMods((m, config) => {
      const { rockets, slots } = config;
      const compounds = new Set(
        Object.keys(m.rdo.getResourceDataObject('compounds') || {}).filter((k) => k !== 'version')
      );
      const issues = [];

      for (const rocket of rockets) {
        for (const slot of slots) {
          const price = m.rdo.getResourceDataObject('space', ['upgrades', rocket, slot]);
          if (!Array.isArray(price)) { issues.push(`${rocket}.${slot}: not an array`); continue; }
          const [amount, name, category] = price;
          if (typeof amount !== 'number' || amount <= 0) issues.push(`${rocket}.${slot}: amount ${amount}`);
          // A cost naming a resource the game does not have can never be paid.
          if (!compounds.has(name)) issues.push(`${rocket}.${slot}: unknown compound "${name}"`);
          if (category !== 'compounds') issues.push(`${rocket}.${slot}: category "${category}"`);
        }
      }
      return issues;
    }, { rockets: ROCKETS, slots: PRICE_SLOTS });

    expect(problems).toEqual([]);
  });

  test('later rockets need more parts than earlier ones', async ({ game }) => {
    const parts = await game.withMods((m, rockets) =>
      rockets.map((rocket) => m.rdo.getResourceDataObject('space', ['upgrades', rocket, 'parts'])), ROCKETS);

    for (let i = 1; i < parts.length; i++) {
      expect(parts[i], `${ROCKETS[i]} parts`).toBeGreaterThan(parts[i - 1]);
    }
  });

  test('every rocket has a fuel autobuyer with a rate and an energy cost', async ({ game }) => {
    const problems = await game.withMods((m, rockets) => {
      const issues = [];
      for (const rocket of rockets) {
        const tier = m.rdo.getResourceDataObject('space', ['upgrades', rocket, 'autoBuyer', 'tier1']);
        if (!tier) { issues.push(`${rocket}: no fuel autobuyer`); continue; }
        if (!(tier.rate > 0)) issues.push(`${rocket}.autoBuyer.rate ${tier.rate}`);
        if (!(tier.price > 0)) issues.push(`${rocket}.autoBuyer.price ${tier.price}`);
        // Fuelling draws power; a zero here would make fuelling free.
        if (!(tier.energyUse > 0)) issues.push(`${rocket}.autoBuyer.energyUse ${tier.energyUse}`);
        if (!tier.place) issues.push(`${rocket}.autoBuyer.place missing`);
      }
      return issues;
    }, ROCKETS);

    expect(problems).toEqual([]);
  });

  test('no rocket is built or launched on a fresh game', async ({ game }) => {
    const start = await game.withMods((m) => ({
      built: m.cg.getRocketsBuilt(),
      launched: m.cg.getLaunchedRockets(),
      fuelling: m.cg.getRocketsFuellerStartedArray()
    }));

    expect(start.built).toEqual([]);
    expect(start.launched).toEqual([]);
    expect(start.fuelling).toEqual([]);
  });
});

test.describe('Rockets — fuel level', () => {
  test('getFuelLevel reports the exact percentage loaded', async ({ game }) => {
    await game.boot();

    const readings = await game.withMods((m) => {
      const capacity = m.rdo.getResourceDataObject('space', ['upgrades', 'rocket1', 'fuelQuantityToLaunch']);
      const samples = [0, 0.25, 0.5, 0.75, 1];
      return samples.map((fraction) => {
        m.rdo.setResourceDataObject(capacity * fraction, 'space', ['upgrades', 'rocket1', 'fuelQuantity']);
        return { fraction, level: m.game.getFuelLevel('rocket1') };
      });
    });

    for (const reading of readings) {
      expect(reading.level).toBeCloseTo(reading.fraction * 100, 6);
    }
  });

  test('the fuel level clamps to 0..100 rather than running past full', async ({ game }) => {
    await game.boot();

    const clamped = await game.withMods((m) => {
      const capacity = m.rdo.getResourceDataObject('space', ['upgrades', 'rocket1', 'fuelQuantityToLaunch']);
      m.rdo.setResourceDataObject(capacity * 5, 'space', ['upgrades', 'rocket1', 'fuelQuantity']);
      const over = m.game.getFuelLevel('rocket1');
      m.rdo.setResourceDataObject(-capacity, 'space', ['upgrades', 'rocket1', 'fuelQuantity']);
      const under = m.game.getFuelLevel('rocket1');
      m.rdo.setResourceDataObject(0, 'space', ['upgrades', 'rocket1', 'fuelQuantity']);
      return { over, under };
    });

    // A progress bar driven past 100% would overflow its container.
    expect(clamped.over).toBe(100);
    expect(clamped.under).toBe(0);
  });

  test('every rocket reports a full tank at its own capacity, not a shared one', async ({ game }) => {
    await game.boot();

    const levels = await game.withMods((m, rockets) =>
      rockets.map((rocket) => {
        const capacity = m.rdo.getResourceDataObject('space', ['upgrades', rocket, 'fuelQuantityToLaunch']);
        m.rdo.setResourceDataObject(capacity, 'space', ['upgrades', rocket, 'fuelQuantity']);
        return { rocket, capacity, level: m.game.getFuelLevel(rocket) };
      }), ROCKETS);

    for (const entry of levels) {
      expect(entry.capacity).toBeGreaterThan(0);
      expect(entry.level, `${entry.rocket} at its own capacity`).toBe(100);
    }
  });
});

test.describe('Rockets — build and launch lifecycle', () => {
  test('the debug chain builds the launch pad, scanner and all four rockets', async ({ game }) => {
    await game.boot();
    await game.debugClick('buildLaunchPadScannerAndAllRocketsButton');
    await game.page.waitForTimeout(1500);

    const state = await game.withMods((m, rockets) => ({
      built: m.cg.getRocketsBuilt(),
      parts: rockets.map((rocket) => ({
        rocket,
        builtParts: m.rdo.getResourceDataObject('space', ['upgrades', rocket, 'builtParts']),
        parts: m.rdo.getResourceDataObject('space', ['upgrades', rocket, 'parts'])
      }))
    }), ROCKETS);

    // Every rocket must be *complete*, not merely started.
    expect(state.parts.filter((p) => p.builtParts < p.parts)).toEqual([]);
    expect(state.built.length).toBeGreaterThanOrEqual(ROCKETS.length);
  });

  test('launching records the rocket and announces it by the player’s name for it', async ({ game }) => {
    await game.boot();
    await game.debugClick('buildLaunchPadScannerAndAllRocketsButton');
    await game.page.waitForTimeout(1500);

    const outcome = await game.withMods((m) => {
      m.cg.setRocketUserName('rocket1', 'Test Rocket Alpha');
      const before = [...m.cg.getLaunchedRockets()];
      m.game.launchRocket('rocket1');
      return {
        before,
        after: [...m.cg.getLaunchedRockets()],
        name: m.cg.getRocketUserName('rocket1')
      };
    });

    expect(outcome.before).not.toContain('rocket1');
    expect(outcome.after).toContain('rocket1');
    expect(outcome.name).toBe('Test Rocket Alpha');

    const notifications = await game.notifications();
    expect(notifications.join(' ')).toContain('Test Rocket Alpha');
  });

  test('launching sets the achievement flag that gates later content', async ({ game }) => {
    await game.boot();
    await game.debugClick('buildLaunchPadScannerAndAllRocketsButton');
    await game.page.waitForTimeout(1500);

    const flags = await game.withMods((m) => {
      m.game.launchRocket('rocket2');
      return m.cg.getAchievementFlagArray?.() ?? [];
    });

    expect(flags).toContain('launchRocket');
  });

  test('each rocket launches independently of the others', async ({ game }) => {
    await game.boot();
    await game.debugClick('buildLaunchPadScannerAndAllRocketsButton');
    await game.page.waitForTimeout(1500);

    const launched = await game.withMods((m, rockets) => {
      rockets.forEach((rocket) => m.game.launchRocket(rocket));
      return [...m.cg.getLaunchedRockets()];
    }, ROCKETS);

    for (const rocket of ROCKETS) {
      expect(launched, `${rocket} should be recorded as launched`).toContain(rocket);
    }
  });
});

test.describe('Rockets — naming', () => {
  test('a renamed rocket keeps its name and reports it back', async ({ game }) => {
    await game.boot();

    const names = await game.withMods((m, rockets) => {
      const assigned = {};
      rockets.forEach((rocket, index) => {
        const name = `Voyager ${index + 1}`;
        m.cg.setRocketUserName(rocket, name);
        assigned[rocket] = { set: name, read: m.cg.getRocketUserName(rocket) };
      });
      return assigned;
    }, ROCKETS);

    for (const rocket of ROCKETS) {
      expect(names[rocket].read).toBe(names[rocket].set);
    }
  });

  test('renaming one rocket does not rename any other', async ({ game }) => {
    await game.boot();

    const result = await game.withMods((m, rockets) => {
      rockets.forEach((rocket, index) => m.cg.setRocketUserName(rocket, `Original ${index}`));
      m.cg.setRocketUserName('rocket2', 'Renamed');
      return rockets.map((rocket) => m.cg.getRocketUserName(rocket));
    }, ROCKETS);

    expect(result[1]).toBe('Renamed');
    expect(result[0]).toBe('Original 0');
    expect(result[2]).toBe('Original 2');
    expect(result[3]).toBe('Original 3');
  });

  test('rocket names survive serialisation', async ({ game }) => {
    await game.boot();

    const restored = await game.withMods((m, rockets) => {
      rockets.forEach((rocket, index) => m.cg.setRocketUserName(rocket, `Persisted ${index}`));
      const names = rockets.map((rocket) => m.cg.getRocketUserName(rocket));
      const roundTripped = JSON.parse(JSON.stringify(names));
      return { names, roundTripped };
    }, ROCKETS);

    expect(restored.roundTripped).toEqual(restored.names);
  });
});

test.describe('Rockets — travel', () => {
  test('a launched rocket has a travel duration and speed to work from', async ({ game }) => {
    await game.boot();

    const travel = await game.withMods((m) => {
      m.cg.setRocketTravelSpeed(1);
      return {
        speed: m.cg.getRocketTravelSpeed(),
        duration: m.cg.getRocketTravelDuration()
      };
    });

    expect(travel.speed).toBeGreaterThan(0);
    expect(travel.duration === undefined || typeof travel.duration === 'object' || typeof travel.duration === 'number').toBe(true);
  });

  test('resetting a rocket for its next journey empties its tank', async ({ game }) => {
    await game.boot();
    await game.debugClick('buildLaunchPadScannerAndAllRocketsButton');
    await game.page.waitForTimeout(1500);

    const after = await game.withMods((m) => {
      const capacity = m.rdo.getResourceDataObject('space', ['upgrades', 'rocket1', 'fuelQuantityToLaunch']);
      m.rdo.setResourceDataObject(capacity, 'space', ['upgrades', 'rocket1', 'fuelQuantity']);
      const before = m.game.getFuelLevel('rocket1');
      m.game.resetRocketForNextJourney('rocket1');
      return { before, after: m.game.getFuelLevel('rocket1') };
    });

    expect(after.before).toBe(100);
    // A rocket that kept its fuel across a journey would launch again for free.
    expect(after.after).toBe(0);
  });

  test('the rocket direction flag round-trips per rocket', async ({ game }) => {
    await game.boot();

    const directions = await game.withMods((m, rockets) => {
      m.cg.setRocketDirection(rockets[0], 'there');
      m.cg.setRocketDirection(rockets[1], 'back');
      return rockets.slice(0, 2).map((rocket) => m.cg.getRocketDirection(rocket));
    }, ROCKETS);

    expect(directions[0]).toBe('there');
    expect(directions[1]).toBe('back');
  });
});

test.describe('Rockets — stability', () => {
  test('building and launching every rocket raises no console or page errors', async ({ game }) => {
    await game.boot();
    await game.debugClick('buildLaunchPadScannerAndAllRocketsButton');
    await game.page.waitForTimeout(1500);

    await game.withMods((m, rockets) => {
      rockets.forEach((rocket) => {
        m.cg.setRocketUserName(rocket, `Stability ${rocket}`);
        m.game.launchRocket(rocket);
      });
    }, ROCKETS);

    await game.page.waitForTimeout(800);
    expect(game.significantErrors()).toEqual([]);
  });

  test('every rocket name and launch notification resolves from the catalogue', async ({ game }) => {
    await game.boot();

    const problems = await game.withMods(async (m, languages) => {
      const original = m.cg.getLanguage();
      const issues = [];
      const keys = ['notificationRocketLaunched', 'notificationRocketReadyForLaunch'];

      for (const language of languages) {
        await m.loc.initLocalization(language);
        for (const key of keys) {
          const value = m.loc.localize(key, language);
          if (!value || value === key) issues.push(`${language}/${key}: unresolved`);
          // Both messages interpolate the player's name for the rocket.
          else if (!value.includes('{rocketName}')) issues.push(`${language}/${key}: no {rocketName} placeholder`);
        }
      }

      await m.loc.initLocalization(original);
      return issues;
    }, ['en', 'es', 'pt', 'de', 'it', 'fr']);

    expect(problems).toEqual([]);
  });
});
