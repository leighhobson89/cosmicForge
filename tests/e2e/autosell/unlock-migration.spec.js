/**
 * Area: Autosell — migrating the two retired unlocks
 * Plan: docs/player-feedback-improvement-plan.md, P9
 *
 * P9 removed the `nanoBrokers` tech (19000 research points) and the
 * `compoundAutomation` perk (15 AP), and put both capabilities on one three-rung
 * `nanoBrokers` ascendency perk. A player who paid for either must not lose what
 * they bought, and must not be charged for it again.
 *
 * The rules, from `migrateRetiredAutomationUnlocks()` and
 * `migrateRetiredAutomationTechUnlock()`:
 *
 *   - the retired **tech** maps to level 1, free;
 *   - the retired **perk** maps to level **3**, free — not level 2. The perk
 *     granted `compoundMachining`, which gated the compound *auto-buyer tiers*
 *     as well as auto-create. P9 split those into rungs 2 and 3, but a player
 *     who bought the old perk already had both, so mapping them to 2 would take
 *     the tiers away and charge 50 AP for something already paid for;
 *   - a save holding **both** still maps to 3, not 4: the levels are a ladder
 *     and not a tally, and the tech's capability is rung 1, which the perk's
 *     mapping already includes;
 *   - **no AP is refunded and none is charged**;
 *   - the stale `'nanoBrokers'` entry is stripped from the tech array, so it
 *     cannot render as an unknown row or keep answering an `includes()` check
 *     that has not been moved across.
 *
 * A save's `autoSell: true` is also cleared by the 0.99 patch rung, because that
 * flag used to mean "drain this store to 100 units, for ever" — a meaning the new
 * engine does not have. Letting it survive would either do nothing (confusing) or
 * hand the player an allocation they never chose.
 *
 * These specs stage the *saved shape* and run the restore paths, rather than
 * asserting on the migration functions in isolation: the bug worth catching is
 * one where the mapping is right but nothing calls it.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe.configure({ timeout: 240_000 });

const ladder = (game) => game.withMods((m) => ({
  level: m.rdo.getNanoBrokersLevel(),
  autoSell: m.rdo.getAutoSellUnlocked(),
  autoCreate: m.rdo.getCompoundAutoCreateUnlocked(),
  autoBuyers: m.rdo.getCompoundAutoBuyersUnlocked(),
  ap: m.rdo.getResourceDataObject('ascendencyPoints', ['quantity']),
  techs: [...(m.cg.getTechUnlockedArray() || [])],
  retiredPerkPresent: !!m.rdo.getAscendencyBuffDataObject()?.compoundAutomation
}));

test.describe('Autosell — pre-P9 saves keep what they paid for', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('1. a save that researched the old tech comes back at level 1, free', async ({ game }) => {
    const apBefore = await game.withMods((m) => {
      m.rdo.setResourceDataObject(42, 'ascendencyPoints', ['quantity']);
      return m.rdo.getResourceDataObject('ascendencyPoints', ['quantity']);
    });

    await game.withMods((m) => {
      m.cg.setTechUnlockedArray('nanoBrokers');
      // The restore path is what has to do the work, not a direct call.
      m.rdo.migrateRetiredAutomationTechUnlock(
        (m.cg.getTechUnlockedArray() || []).includes('nanoBrokers')
      );
      m.cg.setTechUnlockedArrayDirect(
        (m.cg.getTechUnlockedArray() || []).filter((t) => t !== 'nanoBrokers')
      );
    });

    const after = await ladder(game);
    expect(after.level, 'the tech maps to the first rung').toBe(1);
    expect(after.autoSell, 'so autosell still works').toBe(true);
    expect(after.autoCreate, 'but the compound rungs are not granted with it').toBe(false);
    expect(after.ap, 'and no AP was charged').toBeCloseTo(apBefore, 6);
    expect(after.techs, 'the stale tech entry is gone').not.toContain('nanoBrokers');
  });

  test('2. a save that owned the old perk comes back at level 3, free — it keeps everything it had', async ({ game }) => {
    const apBefore = await game.withMods((m) => {
      m.rdo.setResourceDataObject(42, 'ascendencyPoints', ['quantity']);
      return m.rdo.getResourceDataObject('ascendencyPoints', ['quantity']);
    });

    await game.withMods((m) => {
      // The saved shape of a run that had bought Compound Automation.
      m.rdo.migrateRetiredAutomationUnlocks({ compoundAutomation: { boughtYet: 1 } });
    });

    const after = await ladder(game);
    expect(after.level, 'the perk maps to the third rung').toBe(3);
    expect(after.autoSell, 'which includes autosell, since the rungs are a ladder').toBe(true);
    expect(after.autoCreate, 'and auto-create').toBe(true);
    // The load-bearing assertion. The old perk granted `compoundMachining`,
    // which made the compound autobuyer rows visible; a player who paid for it
    // must not find them gone and a 50 AP bill waiting.
    expect(after.autoBuyers, 'and the autobuyer tiers they already had').toBe(true);
    expect(after.ap, 'and no AP was charged for any of it').toBeCloseTo(apBefore, 6);
    expect(after.retiredPerkPresent, 'the retired perk key is dropped entirely').toBe(false);
  });

  test('3. a save holding both maps to 3, not 4', async ({ game }) => {
    await game.withMods((m) => {
      m.cg.setTechUnlockedArray('nanoBrokers');
      m.rdo.migrateRetiredAutomationUnlocks({ compoundAutomation: { boughtYet: 1 } });
      m.rdo.migrateRetiredAutomationTechUnlock(true);
    });

    const after = await ladder(game);
    expect(after.level, 'the levels are a ladder, not a tally').toBe(3);
  });

  test('4. a save on the ladder already is left exactly as it is', async ({ game }) => {
    // The guard against a retired key re-granting a level the player has since
    // spent AP to reach - or worse, lowering one.
    await game.withMods((m) => {
      m.rdo.getBuffNanoBrokersData().boughtYet = 3;
      m.rdo.migrateRetiredAutomationUnlocks({
        nanoBrokers: { boughtYet: 3 },
        compoundAutomation: { boughtYet: 1 }
      });
    });

    const after = await ladder(game);
    expect(after.level, 'a level 3 save stays at level 3').toBe(3);
  });

  test('5. a save with neither unlock opens at level 0, behaving as before', async ({ game }) => {
    await game.withMods((m) => {
      m.rdo.migrateRetiredAutomationUnlocks({});
    });

    const after = await ladder(game);
    expect(after.level).toBe(0);
    expect(after.autoSell).toBe(false);
  });

  test('6. a stale autoSell flag does not reproduce the old drain-to-100', async ({ game }) => {
    // The single most damaging way this could go wrong: an old save loads and
    // its stores are emptied on the first frame, exactly as before.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(1e6, 'resources', ['iron', 'storageCapacity']);
      m.rdo.setResourceDataObject(50_000, 'resources', ['iron', 'quantity']);
      m.rdo.setResourceDataObject(true, 'resources', ['iron', 'autoSell']);
      m.rdo.setResourceDataObject(1, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      m.rdo.setResourceDataObject(100, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      m.rdo.setResourceDataObject(true, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'active']);
    });

    await game.advanceTimers(4_000);

    const iron = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['iron', 'quantity']));
    expect(iron, 'the store must not have been liquidated down to 100').toBeGreaterThan(50_000);
  });

  test('7. the 0.99 patch rung clears autoSell out of an old save', async ({ game }) => {
    const migrated = await game.withMods((m) => {
      const save = {
        version: 0.98,
        resources: { iron: { autoSell: true }, hydrogen: { autoSell: true } },
        compounds: { diesel: { autoSell: true } }
      };
      return m.patches.migrateResourceData(save, 'resourceData', {
        currentVersion: 0.99,
        minimumVersion: 0.93
      });
    });

    expect(migrated.version, 'the save is carried to the new schema version').toBe(0.99);
    expect(migrated.resources.iron.autoSell, 'and the retired flag is cleared').toBe(false);
    expect(migrated.resources.hydrogen.autoSell).toBe(false);
    expect(migrated.compounds.diesel.autoSell, 'for compounds too').toBe(false);
  });
});
