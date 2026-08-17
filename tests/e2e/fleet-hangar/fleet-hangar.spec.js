/**
 * Area: Fleet Hangar
 * Plan: tests/docs/areas/fleet-hangar.md
 *
 * The debug menu's full starship-launch scenario (Numpad -) yields 30 of each
 * combat class plus an envoy, $1B and 1M of every material, so every case here
 * starts from real, game-produced fleet state rather than hand-seeded numbers.
 * Builds go through the actual Build button in the Fleet Hangar pane so the
 * cost deduction, the aggregate-power update and the diplomacy flag are all
 * exercised by the same click a player makes.
 *
 * The "ascendency fleet buffs" in the original plan are in fact the Supremacist
 * philosophy repeatables — there is no fleet entry in `ascendencyBuffs`. They
 * are covered here under their real names: hangarAutomation (fleetCosts),
 * syntheticPlating (fleetHealth), antimatterEngineMinaturization (fleetSpeed)
 * and laserIntensityResearch (fleetAttackPower).
 */
import { test, expect } from '../_harness/game-fixture.mjs';

const COMBAT_FLEETS = ['fleetScout', 'fleetMarauder', 'fleetLandStalker', 'fleetNavalStrafer'];
const ALL_FLEETS = ['fleetEnvoy', ...COMBAT_FLEETS];

/** Open tab 5 and select the Fleet Hangar pane through its real side-menu row. */
async function openFleetHangar(game) {
  await game.openTab(5);
  const clicked = await game.page.evaluate(() => {
    const el = document.getElementById('fleetHangarOption');
    if (!el) return false;
    // The row is gated behind unlock state; unlock rules are asserted by the
    // ui-navigation area, so reveal it here rather than re-testing it.
    el.closest('.row-side-menu')?.classList.remove('invisible');
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  });
  await game.page.waitForTimeout(600);
  return clicked;
}

/** Click a fleet class's real Build button in the Fleet Hangar pane. */
async function clickBuild(game, fleetId) {
  const rowId = `space${fleetId.charAt(0).toUpperCase()}${fleetId.slice(1)}BuildRow`;
  const found = await game.page.evaluate((id) => {
    const button = document.querySelector(`#${id} button.building-purchase-button`);
    if (!button) return false;
    button.click();
    return true;
  }, rowId);
  if (!found) throw new Error(`Build button not found for ${fleetId} (row ${rowId})`);
  await game.page.waitForTimeout(250);
}

async function fleetSnapshot(game) {
  return game.withMods((m, fleets) => {
    const quantities = {};
    for (const f of fleets) {
      quantities[f] = m.rdo.getResourceDataObject('space', ['upgrades', f, 'quantity']);
    }
    return {
      quantities,
      attackPower: m.rdo.getResourceDataObject('fleets', ['attackPower']),
      defensePower: m.rdo.getResourceDataObject('fleets', ['defensePower']),
      cash: m.rdo.getResourceDataObject('currency', ['cash'])
    };
  }, ALL_FLEETS);
}

test.describe('Fleet Hangar', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
  });

  test('every fleet class exposes coherent build and combat metadata', async ({ game }) => {
    const problems = await game.withMods((m, fleets) => {
      const issues = [];
      for (const id of fleets) {
        const unit = m.rdo.getResourceDataObject('space', ['upgrades', id]);
        if (!unit) { issues.push(`${id}: missing`); continue; }

        if (!(Number.isFinite(unit.price) && unit.price > 0)) issues.push(`${id}: bad price ${unit.price}`);
        for (const key of ['resource1Price', 'resource2Price', 'resource3Price']) {
          const entry = unit[key];
          if (!Array.isArray(entry) || entry.length !== 3) { issues.push(`${id}.${key}: not a [amount, material, category] triple`); continue; }
          if (!(Number.isFinite(entry[0]) && entry[0] > 0)) issues.push(`${id}.${key}: bad amount ${entry[0]}`);
          if (!['resources', 'compounds'].includes(entry[2])) issues.push(`${id}.${key}: bad category ${entry[2]}`);
          if (m.rdo.getResourceDataObject(entry[2], [entry[1]]) === undefined) issues.push(`${id}.${key}: unknown material ${entry[1]}`);
        }

        if (!(Number.isFinite(unit.baseAttackStrength) && unit.baseAttackStrength >= 0)) issues.push(`${id}: bad baseAttackStrength`);
        if (!(Number.isFinite(unit.defenseStrength) && unit.defenseStrength >= 0)) issues.push(`${id}: bad defenseStrength`);
        if (!(Number.isFinite(unit.maxCanBuild) && unit.maxCanBuild > 0)) issues.push(`${id}: bad maxCanBuild`);
      }
      return issues;
    }, ALL_FLEETS);

    expect(problems).toEqual([]);
  });

  test('only the combat classes join attack and defense; the envoy does not', async ({ game }) => {
    const roles = await game.withMods((m, fleets) => {
      const out = {};
      for (const id of fleets) {
        const unit = m.rdo.getResourceDataObject('space', ['upgrades', id]);
        out[id] = {
          joins: unit.joinsAttackDefense,
          attack: unit.baseAttackStrength,
          against: unit.bonusGivenAgainstType ?? null,
          speed: unit.speed ?? null
        };
      }
      return out;
    }, ALL_FLEETS);

    expect(roles.fleetEnvoy.joins).toBe(false);
    expect(roles.fleetEnvoy.attack).toBe(0);
    for (const id of COMBAT_FLEETS) {
      expect(roles[id].joins, `${id} should join combat`).toBe(true);
      expect(roles[id].attack).toBeGreaterThan(0);
      expect(['air', 'land', 'sea']).toContain(roles[id].against);
      expect(roles[id].speed).toBeGreaterThan(0);
    }
  });

  test('the Fleet Hangar pane renders a build row for every ship class', async ({ game }) => {
    expect(await openFleetHangar(game)).toBe(true);

    const rows = await game.page.evaluate((fleets) => fleets.map((id) => {
      const rowId = `space${id.charAt(0).toUpperCase()}${id.slice(1)}BuildRow`;
      const row = document.getElementById(rowId);
      return {
        id,
        present: !!row,
        hasBuildButton: !!row?.querySelector('button.building-purchase-button'),
        hasQuantityReadout: !!document.getElementById(`${id}BuiltQuantity`)
      };
    }), ALL_FLEETS);

    for (const row of rows) {
      expect(row.present, `${row.id} row missing`).toBe(true);
      expect(row.hasBuildButton, `${row.id} build button missing`).toBe(true);
      expect(row.hasQuantityReadout, `${row.id} quantity readout missing`).toBe(true);
    }
  });

  test('building a ship charges its cash cost and adds its strength to the aggregate', async ({ game }) => {
    await openFleetHangar(game);

    const before = await fleetSnapshot(game);
    const stats = await game.withMods((m) => ({
      price: m.rdo.getResourceDataObject('space', ['upgrades', 'fleetMarauder', 'price']),
      attack: m.rdo.getResourceDataObject('space', ['upgrades', 'fleetMarauder', 'baseAttackStrength']),
      defense: m.rdo.getResourceDataObject('space', ['upgrades', 'fleetMarauder', 'defenseStrength'])
    }));

    await clickBuild(game, 'fleetMarauder');
    const after = await fleetSnapshot(game);

    expect(after.quantities.fleetMarauder).toBe(before.quantities.fleetMarauder + 1);
    expect(after.attackPower).toBeCloseTo(before.attackPower + stats.attack, 6);
    expect(after.defensePower).toBeCloseTo(before.defensePower + stats.defense, 6);
    expect(after.cash).toBe(before.cash - stats.price);
  });

  test('building a ship flags the fleet as changed for diplomacy', async ({ game }) => {
    await openFleetHangar(game);
    await game.withMods((m) => m.cg.setFleetChangedSinceLastDiplomacy(false));

    await clickBuild(game, 'fleetScout');

    // A fleet that grew since the last negotiation is what lets diplomacy
    // re-evaluate the power ratio instead of reusing a stale one.
    expect(await game.withMods((m) => m.cg.getFleetChangedSinceLastDiplomacy())).toBe(true);
  });

  test('the envoy is capped at one and adds nothing to combat power', async ({ game }) => {
    await openFleetHangar(game);

    const before = await fleetSnapshot(game);
    const max = await game.withMods((m) => m.rdo.getMaxFleetShip('fleetEnvoy'));
    expect(max).toBe(1);
    expect(before.quantities.fleetEnvoy).toBe(1);

    // increaseAttackAndDefensePower() short-circuits on fleetEnvoy, so even if a
    // second envoy were somehow built it would contribute no power.
    await game.withMods((m) => m.game.increaseAttackAndDefensePower('fleetEnvoy'));
    const after = await fleetSnapshot(game);

    expect(after.attackPower).toBe(before.attackPower);
    expect(after.defensePower).toBe(before.defensePower);
  });

  test('aggregate fleet power equals the sum of every class quantity times its per-unit strength', async ({ game }) => {
    // Build one extra of two classes so the composition is genuinely mixed
    // rather than the debug scenario's uniform 30-of-each.
    await openFleetHangar(game);
    await clickBuild(game, 'fleetScout');
    await clickBuild(game, 'fleetNavalStrafer');
    await clickBuild(game, 'fleetNavalStrafer');

    const result = await game.withMods((m, fleets) => {
      let attack = 0;
      let defense = 0;
      const composition = {};
      for (const id of fleets) {
        const qty = m.rdo.getResourceDataObject('space', ['upgrades', id, 'quantity']);
        composition[id] = qty;
        attack += qty * m.rdo.getResourceDataObject('space', ['upgrades', id, 'baseAttackStrength']);
        defense += qty * m.rdo.getResourceDataObject('space', ['upgrades', id, 'defenseStrength']);
      }
      return {
        composition,
        expectedAttack: attack,
        expectedDefense: defense,
        actualAttack: m.rdo.getResourceDataObject('fleets', ['attackPower']),
        actualDefense: m.rdo.getResourceDataObject('fleets', ['defensePower'])
      };
    }, COMBAT_FLEETS);

    expect(result.composition.fleetScout).toBe(31);
    expect(result.composition.fleetNavalStrafer).toBe(32);
    expect(result.actualAttack).toBeCloseTo(result.expectedAttack, 6);
    expect(result.actualDefense).toBeCloseTo(result.expectedDefense, 6);
  });

  test('losing a unit in battle removes it and its strength from the aggregate', async ({ game }) => {
    // updateFleetsAfterDestroyingAUnit() repaints the battle header, which reads
    // the destination star's enemy fleet power, so a real destination is needed.
    const result = await game.withMods((m) => {
      m.cg.setDestinationStar('sirius');
      m.game.generateDestinationStarData();

      const before = {
        qty: m.rdo.getResourceDataObject('space', ['upgrades', 'fleetScout', 'quantity']),
        attack: m.rdo.getResourceDataObject('fleets', ['attackPower']),
        defense: m.rdo.getResourceDataObject('fleets', ['defensePower'])
      };
      const scoutAttack = m.rdo.getResourceDataObject('space', ['upgrades', 'fleetScout', 'baseAttackStrength']);

      m.game.updateFleetsAfterDestroyingAUnit({ id: 'player_1_scout', owner: 'player' });

      return {
        before,
        scoutAttack,
        after: {
          qty: m.rdo.getResourceDataObject('space', ['upgrades', 'fleetScout', 'quantity']),
          attack: m.rdo.getResourceDataObject('fleets', ['attackPower']),
          defense: m.rdo.getResourceDataObject('fleets', ['defensePower'])
        }
      };
    });

    expect(result.after.qty).toBe(result.before.qty - 1);
    expect(result.after.attack).toBeCloseTo(result.before.attack - result.scoutAttack, 6);
    // A destroyed unit subtracts its *attack* strength from both pools — the
    // defense pool is reduced by the same figure, not by defenseStrength.
    expect(result.after.defense).toBeCloseTo(result.before.defense - result.scoutAttack, 6);
  });

  test('Supremacist hangar automation cuts every fleet cost by 5% and leaves other space upgrades alone', async ({ game }) => {
    const result = await game.withMods((m, fleets) => {
      const capture = () => {
        const out = {};
        for (const id of fleets) {
          out[id] = {
            price: m.rdo.getResourceDataObject('space', ['upgrades', id, 'price']),
            r1: m.rdo.getResourceDataObject('space', ['upgrades', id, 'resource1Price'])[0],
            r2: m.rdo.getResourceDataObject('space', ['upgrades', id, 'resource2Price'])[0],
            r3: m.rdo.getResourceDataObject('space', ['upgrades', id, 'resource3Price'])[0]
          };
        }
        out.launchPad = m.rdo.getResourceDataObject('space', ['upgrades', 'launchPad', 'price']);
        return out;
      };

      const before = capture();
      m.game.setFleetPricesAfterRepeatables();
      const after = capture();
      return { before, after };
    }, ALL_FLEETS);

    for (const id of ALL_FLEETS) {
      for (const key of ['price', 'r1', 'r2', 'r3']) {
        expect(result.after[id][key], `${id}.${key}`).toBeCloseTo(result.before[id][key] * 0.95, 6);
      }
    }
    // The reduction is scoped to keys starting with "fleet"; nothing else in the
    // space upgrade tree may move.
    expect(result.after.launchPad).toBe(result.before.launchPad);
  });

  test('Supremacist laser intensity research raises attack damage 5% for combat classes only', async ({ game }) => {
    const result = await game.withMods((m, fleets) => {
      const capture = () => Object.fromEntries(fleets.map((id) => [
        id, m.rdo.getResourceDataObject('space', ['upgrades', id, 'baseAttackStrength'])
      ]));
      const before = capture();
      m.game.setFleetAttackDamageAfterRepeatables();
      const afterOnce = capture();
      m.game.setFleetAttackDamageAfterRepeatables();
      const afterTwice = capture();
      return { before, afterOnce, afterTwice };
    }, ALL_FLEETS);

    for (const id of COMBAT_FLEETS) {
      expect(result.afterOnce[id], id).toBeCloseTo(result.before[id] * 1.05, 6);
      // Repeatables compound rather than adding a flat 5% of the base.
      expect(result.afterTwice[id], id).toBeCloseTo(result.before[id] * 1.05 * 1.05, 6);
    }
    expect(result.afterTwice.fleetEnvoy).toBe(result.before.fleetEnvoy);
  });

  test('Supremacist engine miniaturization raises fleet speed 5% and synthetic plating raises unit health 5%', async ({ game }) => {
    const result = await game.withMods((m, fleets) => {
      const speeds = () => Object.fromEntries(fleets.map((id) => [
        id, m.rdo.getResourceDataObject('space', ['upgrades', id, 'speed'])
      ]));

      const speedBefore = speeds();
      m.game.setFleetSpeedsAfterRepeatables();
      const speedAfter = speeds();

      const healthBefore = m.cg.getPlayerStartingUnitHealth();
      m.game.setFleetArmorBuffsAfterRepeatables();
      const healthAfter = m.cg.getPlayerStartingUnitHealth();

      return { speedBefore, speedAfter, healthBefore, healthAfter };
    }, COMBAT_FLEETS);

    for (const id of COMBAT_FLEETS) {
      expect(result.speedAfter[id], id).toBeCloseTo(result.speedBefore[id] * 1.05, 6);
    }
    expect(result.healthBefore).toBe(100);
    expect(result.healthAfter).toBeCloseTo(105, 6);
  });

  test('an attack-damage buff applies only to ships built after it', async ({ game }) => {
    await openFleetHangar(game);

    const before = await game.withMods((m) => ({
      attackPower: m.rdo.getResourceDataObject('fleets', ['attackPower']),
      perUnit: m.rdo.getResourceDataObject('space', ['upgrades', 'fleetScout', 'baseAttackStrength'])
    }));

    const buffed = await game.withMods((m) => {
      m.game.setFleetAttackDamageAfterRepeatables();
      return {
        attackPower: m.rdo.getResourceDataObject('fleets', ['attackPower']),
        perUnit: m.rdo.getResourceDataObject('space', ['upgrades', 'fleetScout', 'baseAttackStrength'])
      };
    });

    // The aggregate is a running total accumulated at build time, so raising the
    // per-unit figure does not retro-fit the 30 scouts already in the hangar.
    expect(buffed.perUnit).toBeCloseTo(before.perUnit * 1.05, 6);
    expect(buffed.attackPower).toBe(before.attackPower);

    await clickBuild(game, 'fleetScout');
    const after = await game.withMods((m) => m.rdo.getResourceDataObject('fleets', ['attackPower']));

    // The newly built scout contributes the *buffed* strength.
    expect(after).toBeCloseTo(before.attackPower + buffed.perUnit, 6);
  });

  test('fleet composition and aggregate power survive a save/load round trip', async ({ game }) => {
    const result = await game.withMods((m, fleets) => {
      const saved = JSON.parse(JSON.stringify(m.cg.captureGameStatusForSaving('initialise')));
      const live = {};
      for (const id of fleets) {
        live[id] = m.rdo.getResourceDataObject('space', ['upgrades', id, 'quantity']);
      }
      return {
        live,
        liveAttack: m.rdo.getResourceDataObject('fleets', ['attackPower']),
        liveDefense: m.rdo.getResourceDataObject('fleets', ['defensePower']),
        savedUpgrades: saved.resourceData?.space?.upgrades,
        savedFleets: saved.resourceData?.fleets
      };
    }, ALL_FLEETS);

    for (const id of ALL_FLEETS) {
      expect(result.savedUpgrades?.[id]?.quantity, id).toBe(result.live[id]);
    }
    expect(result.savedFleets?.attackPower).toBe(result.liveAttack);
    expect(result.savedFleets?.defensePower).toBe(result.liveDefense);
    expect(result.savedUpgrades?.fleetEnvoy?.envoyBuiltYet).toBe(true);
  });

  test('the hangar produces no console or page errors while building', async ({ game }) => {
    await openFleetHangar(game);
    for (const id of COMBAT_FLEETS) {
      await clickBuild(game, id);
    }
    expect(game.significantErrors()).toEqual([]);
  });
});
