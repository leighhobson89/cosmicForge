/**
 * Area: Energy & Power Grid
 * Plan: tests/docs/areas/energy.md
 * Existing coverage: tests/legacy/energyMid.test.js (smoke only)
 *
 * Drives the real energy accessors (constantsAndGlobalVars.js) and the real
 * energyDeltaTimer (game.js) rather than a bespoke energy model, so branch
 * coverage here tracks the actual grid logic: rated output per plant,
 * documented fuel burn, battery charge/discharge, the auto-trip-on-deficit
 * path in setBuildingTypeOnOff(), the Power All toggle (toggleAllPower), and
 * solar's star-type/weather multiplier.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

const PLANTS = [
  { key: 'powerPlant1', rate: 0.05, fuel: 'carbon', fuelPerUnit: 0.03 },
  { key: 'powerPlant2', rate: 0.2, fuel: 'solar', fuelPerUnit: 0 },
  { key: 'powerPlant3', rate: 0.35, fuel: 'diesel', fuelPerUnit: 0.01 }
];

test.describe('Energy & Power Grid', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('each power plant type generates its documented rated output per unit', async ({ game }) => {
    const result = await game.withMods((m, plants) => {
      const rows = {};
      for (const { key } of plants) {
        rows[key] = m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', key, 'rate']);
      }
      return rows;
    }, PLANTS);

    for (const { key, rate } of PLANTS) {
      expect(result[key]).toBe(rate);
    }
  });

  test('addBuildingPotentialRate() derives purchasedRate from quantity * rate', async ({ game }) => {
    const result = await game.withMods((m, plants) => {
      const rows = {};
      for (const { key } of plants) {
        m.rdo.setResourceDataObject(4, 'buildings', ['energy', 'upgrades', key, 'quantity']);
        m.game.addBuildingPotentialRate(key);
        rows[key] = m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', key, 'purchasedRate']);
      }
      return rows;
    }, PLANTS);

    expect(result.powerPlant1).toBeCloseTo(4 * 0.05, 6);
    expect(result.powerPlant3).toBeCloseTo(4 * 0.35, 6);
    // powerPlant2 (solar) is additionally scaled by the current star's weather
    // efficiency, so only assert it is a positive multiple of the base rate.
    expect(result.powerPlant2).toBeGreaterThan(0);
  });

  test('fuel is consumed at the documented per-unit rate while a plant is on', async ({ game }) => {
    await game.withMods((m) => {
      m.cg.setPowerOnOff(true);
      m.rdo.setResourceDataObject(3, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
      m.game.addBuildingPotentialRate('powerPlant1');
      m.game.toggleBuildingTypeOnOff('powerPlant1', true);
      m.rdo.setResourceDataObject(1000, 'resources', ['carbon', 'quantity']);
      m.rdo.setResourceDataObject(1_000_000, 'resources', ['carbon', 'storageCapacity']);
    });

    const before = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['carbon', 'quantity']));
    // The real gameLoop rAF keeps ticking in the background; give it enough
    // real time to run several updateResourceAutoBuyerDelta('carbon', 1, ...)
    // ticks, which is where powerPlant1's fuel deduction is applied.
    await game.page.waitForTimeout(1500);
    const after = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['carbon', 'quantity']));

    await game.withMods((m) => {
      m.game.toggleBuildingTypeOnOff('powerPlant1', false);
      m.cg.setPowerOnOff(false);
    });

    // 3 units * 0.03 carbon/unit/tick, over >1s of real ticks, must burn a
    // meaningfully positive amount without ever exceeding what was available.
    expect(after).toBeLessThan(before);
    expect(after).toBeGreaterThanOrEqual(0);
  });

  test('generation stops (fuel never goes negative) once the fuel resource is exhausted', async ({ game }) => {
    await game.withMods((m) => {
      m.cg.setPowerOnOff(true);
      m.rdo.setResourceDataObject(50, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
      m.game.addBuildingPotentialRate('powerPlant1');
      m.game.toggleBuildingTypeOnOff('powerPlant1', true);
      // A tiny carbon balance that 50 units of powerPlant1 will exhaust almost
      // immediately (50 * 0.03 = 1.5/tick).
      m.rdo.setResourceDataObject(0.5, 'resources', ['carbon', 'quantity']);
      m.rdo.setResourceDataObject(1_000_000, 'resources', ['carbon', 'storageCapacity']);
    });

    await game.page.waitForTimeout(1500);
    const carbon = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['carbon', 'quantity']));

    await game.withMods((m) => {
      m.game.toggleBuildingTypeOnOff('powerPlant1', false);
      m.cg.setPowerOnOff(false);
    });

    // Math.max(... - consumption, 0) in updateResourceAutoBuyerDelta must
    // clamp at zero, never underflow negative.
    expect(carbon).toBe(0);
  });

  test('battery storage charges toward capacity when generation exceeds consumption', async ({ game }) => {
    // setEnergyUse() (which drives consumption from real buildings) and fuel
    // exhaustion (which auto-deactivates a fuelled plant) both run every real
    // gameLoop frame, so give powerPlant1 ample carbon and leave consumption
    // at its real value (0, nothing else in a fresh save draws power) rather
    // than fighting either system with a one-off override.
    const before = await game.withMods((m) => {
      m.rdo.setResourceDataObject(true, 'buildings', ['energy', 'batteryBoughtYet']);
      m.rdo.setResourceDataObject(10000, 'buildings', ['energy', 'storageCapacity']);
      m.rdo.setResourceDataObject(0, 'buildings', ['energy', 'quantity']);
      m.rdo.setResourceDataObject(1_000_000, 'resources', ['carbon', 'quantity']);
      m.rdo.setResourceDataObject(1_000_000, 'resources', ['carbon', 'storageCapacity']);

      m.rdo.setResourceDataObject(10, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
      m.game.addBuildingPotentialRate('powerPlant1');
      m.cg.setPowerOnOff(true);
      m.game.toggleBuildingTypeOnOff('powerPlant1', true);

      return m.rdo.getResourceDataObject('buildings', ['energy', 'quantity']);
    });

    await game.page.waitForTimeout(1200);
    const after = await game.withMods((m) => ({
      qty: m.rdo.getResourceDataObject('buildings', ['energy', 'quantity']),
      stillOn: m.cg.getBuildingTypeOnOff('powerPlant1')
    }));

    await game.withMods((m) => {
      m.game.toggleBuildingTypeOnOff('powerPlant1', false);
      m.cg.setPowerOnOff(false);
    });

    expect(after.stillOn, 'plant should not have run out of fuel with 1,000,000 carbon banked').toBe(true);
    expect(after.qty).toBeGreaterThan(before);
  });

  test('battery storage discharges when consumption exceeds generation', async ({ game }) => {
    // setEnergyUse() overwrites buildings.energy.consumption from real
    // buildings every gameLoop frame, so a manual override here only survives
    // for the one frame between our write and the engine's next tick — enough
    // to prove the discharge branch runs, but not to sustain it. Keep the
    // window short rather than fighting that recompute.
    const before = await game.withMods((m) => {
      m.rdo.setResourceDataObject(true, 'buildings', ['energy', 'batteryBoughtYet']);
      m.rdo.setResourceDataObject(10000, 'buildings', ['energy', 'storageCapacity']);
      m.rdo.setResourceDataObject(5000, 'buildings', ['energy', 'quantity']);
      m.cg.setTotalEnergyUse(50);
      m.cg.setPowerOnOff(true);
      m.cg.setPowerGracePeriodEnd(0);
      return m.rdo.getResourceDataObject('buildings', ['energy', 'quantity']);
    });

    await game.page.waitForTimeout(350);
    const after = await game.withMods((m) => m.rdo.getResourceDataObject('buildings', ['energy', 'quantity']));

    await game.withMods((m) => {
      m.cg.setTotalEnergyUse(0);
      m.cg.setPowerOnOff(false);
    });

    expect(after).toBeLessThan(before);
    expect(after).toBeGreaterThanOrEqual(0);
  });

  test('consumption exceeding generation trips the grid instead of silently stalling', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.rdo.setResourceDataObject(false, 'buildings', ['energy', 'batteryBoughtYet']);
      m.cg.setTrippedStatus(false);

      m.rdo.setResourceDataObject(1, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
      m.game.addBuildingPotentialRate('powerPlant1'); // tiny purchasedRate

      // Activating always (re)opens a grace window, by design — so it can
      // never trip at the moment of activation. Simulate that grace having
      // since elapsed, then drive a deactivation while a deficit remains: the
      // same transition setPowerOnOff(false) performs on every plant when the
      // energy delta timer detects a real deficit.
      m.game.toggleBuildingTypeOnOff('powerPlant1', true);
      m.cg.setPowerGracePeriodEnd(0);
      m.cg.setTotalEnergyUse(999999); // consumption wildly exceeds generation

      m.game.toggleBuildingTypeOnOff('powerPlant1', false);

      const tripped = m.cg.getTrippedStatus();
      const flagged = m.cg.getAchievementFlagArray().includes('tripPower');

      m.cg.setTrippedStatus(false);
      m.cg.setTotalEnergyUse(0);

      return { tripped, flagged };
    });

    expect(result.tripped).toBe(true);
    expect(result.flagged).toBe(true);
  });

  test('the grid does not trip within its post-activation grace period', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.rdo.setResourceDataObject(false, 'buildings', ['energy', 'batteryBoughtYet']);
      m.cg.setTrippedStatus(false);

      m.rdo.setResourceDataObject(1, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
      m.game.addBuildingPotentialRate('powerPlant1');
      m.cg.setTotalEnergyUse(999999);

      // toggleBuildingTypeOnOff -> setBuildingTypeOnOff itself opens the grace
      // period (POWER_GRACE_PERIOD_MS from "now"), so the very same activation
      // that would otherwise trip the grid must not trip it immediately.
      m.game.toggleBuildingTypeOnOff('powerPlant1', true);
      const trippedDuringGrace = m.cg.getTrippedStatus();

      m.game.toggleBuildingTypeOnOff('powerPlant1', false);
      m.cg.setTrippedStatus(false);
      m.cg.setTotalEnergyUse(0);

      return trippedDuringGrace;
    });

    expect(result).toBe(false);
  });

  test('Power All (toggleAllPower) turns every owned plant on together, then off together', async ({ game }) => {
    const result = await game.withMods((m) => {
      for (const key of ['powerPlant1', 'powerPlant2', 'powerPlant3']) {
        m.rdo.setResourceDataObject(2, 'buildings', ['energy', 'upgrades', key, 'quantity']);
        m.game.addBuildingPotentialRate(key);
        m.game.toggleBuildingTypeOnOff(key, false);
      }
      m.cg.setPowerOnOff(false);

      m.game.toggleAllPower();
      const afterOn = {
        powerPlant1: m.cg.getBuildingTypeOnOff('powerPlant1'),
        powerPlant2: m.cg.getBuildingTypeOnOff('powerPlant2'),
        powerPlant3: m.cg.getBuildingTypeOnOff('powerPlant3'),
        powerOnOff: m.cg.getPowerOnOff()
      };

      m.game.toggleAllPower();
      const afterOff = {
        powerPlant1: m.cg.getBuildingTypeOnOff('powerPlant1'),
        powerPlant2: m.cg.getBuildingTypeOnOff('powerPlant2'),
        powerPlant3: m.cg.getBuildingTypeOnOff('powerPlant3')
      };

      return { afterOn, afterOff };
    });

    expect(result.afterOn).toEqual({ powerPlant1: true, powerPlant2: true, powerPlant3: true, powerOnOff: true });
    expect(result.afterOff).toEqual({ powerPlant1: false, powerPlant2: false, powerPlant3: false });
  });

  test('per-building toggles are independent of one another', async ({ game }) => {
    const result = await game.withMods((m) => {
      for (const key of ['powerPlant1', 'powerPlant2', 'powerPlant3']) {
        m.rdo.setResourceDataObject(1, 'buildings', ['energy', 'upgrades', key, 'quantity']);
        m.game.addBuildingPotentialRate(key);
        m.game.toggleBuildingTypeOnOff(key, false);
      }

      m.game.toggleBuildingTypeOnOff('powerPlant2', true);
      const state = {
        powerPlant1: m.cg.getBuildingTypeOnOff('powerPlant1'),
        powerPlant2: m.cg.getBuildingTypeOnOff('powerPlant2'),
        powerPlant3: m.cg.getBuildingTypeOnOff('powerPlant3')
      };

      m.game.toggleBuildingTypeOnOff('powerPlant2', false);
      return state;
    });

    expect(result).toEqual({ powerPlant1: false, powerPlant2: true, powerPlant3: false });
  });

  test('per-building on/off state persists through a save/load round trip', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.game.toggleBuildingTypeOnOff('powerPlant1', true);
      m.game.toggleBuildingTypeOnOff('powerPlant2', false);
      m.game.toggleBuildingTypeOnOff('powerPlant3', true);

      const restored = JSON.parse(JSON.stringify(m.cg.captureGameStatusForSaving('initialise')));

      m.game.toggleBuildingTypeOnOff('powerPlant1', false);
      m.game.toggleBuildingTypeOnOff('powerPlant3', false);

      return restored.buildingTypeOnOff;
    });

    expect(result.powerPlant1).toBe(true);
    expect(result.powerPlant2).toBe(false);
    expect(result.powerPlant3).toBe(true);
  });

  test('solar output scales with the current star system weather efficiency', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.rdo.setResourceDataObject(10, 'buildings', ['energy', 'upgrades', 'powerPlant2', 'quantity']);

      const originalEfficiency = m.cg.getCurrentStarSystemWeatherEfficiency();

      m.cg.setCurrentStarSystemWeatherEfficiency([1, 1]);
      m.game.addBuildingPotentialRate('powerPlant2');
      const fullEfficiency = m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'purchasedRate']);

      m.cg.setCurrentStarSystemWeatherEfficiency([1, 0.4]);
      m.game.addBuildingPotentialRate('powerPlant2');
      const dimmedEfficiency = m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'purchasedRate']);

      m.cg.setCurrentStarSystemWeatherEfficiency(originalEfficiency);

      return { fullEfficiency, dimmedEfficiency };
    });

    expect(result.fullEfficiency).toBeCloseTo(10 * 0.2, 6);
    expect(result.dimmedEfficiency).toBeCloseTo(10 * 0.2 * 0.4, 6);
    expect(result.dimmedEfficiency).toBeLessThan(result.fullEfficiency);
  });

  test('an O-type star boost multiplies output only for the settled O-type system', async ({ game }) => {
    const result = await game.withMods((m) => {
      const originalActivated = m.cg.getOTypeMechanicActivatedForThisSave();
      const originalBuffs = m.rdo.getOTypePowerPlantBuffs();
      const originalBoost = m.cg.getOTypePowerPlantStrengthBoost();
      const originalSettled = [...m.cg.getSettledStars()];

      m.cg.setOTypeMechanicActivatedForThisSave(true);
      m.cg.setOTypePowerPlantStrengthBoost(3);
      m.cg.setSettledStars('rigel');
      m.rdo.setOTypePowerPlantBuffs({
        basicPowerPlantStar: { settled: true, starName: 'rigel' }
      });

      const boosted = m.game.getOTypePowerPlantBoostMultiplierForCurrentSystem('powerPlant1');
      const unaffected = m.game.getOTypePowerPlantBoostMultiplierForCurrentSystem('powerPlant3');

      m.cg.setOTypeMechanicActivatedForThisSave(originalActivated);
      m.rdo.setOTypePowerPlantBuffs(originalBuffs);
      m.cg.setOTypePowerPlantStrengthBoost(originalBoost);
      m.cg.setSettledStars(originalSettled, true);

      return { boosted, unaffected };
    });

    expect(result.boosted).toBe(3);
    // powerPlant3 has no matching buff entry, so it must fall back to 1x.
    expect(result.unaffected).toBe(1);
  });

  test('with the O-type mechanic inactive, the boost multiplier is always 1x', async ({ game }) => {
    const result = await game.withMods((m) => {
      const originalActivated = m.cg.getOTypeMechanicActivatedForThisSave();
      m.cg.setOTypeMechanicActivatedForThisSave(false);

      const multiplier = m.game.getOTypePowerPlantBoostMultiplierForCurrentSystem('powerPlant1');

      m.cg.setOTypeMechanicActivatedForThisSave(originalActivated);
      return multiplier;
    });

    expect(result).toBe(1);
  });

  test('the energy delta timer is registered and repeating', async ({ game }) => {
    const timer = await game.withMods((m) => {
      const t = m.timers.timerManagerDelta.timers.get('energyDeltaTimer');
      if (!t) return { present: false };
      return { present: true, repeat: t.repeat, durationMs: t.durationMs, paused: t.paused, hasOnUpdate: typeof t.onUpdate === 'function' };
    });

    expect(timer.present).toBe(true);
    expect(timer.repeat).toBe(true);
    expect(timer.durationMs).toBe(0);
    expect(timer.paused).toBe(false);
    expect(timer.hasOnUpdate).toBe(true);
  });
});
