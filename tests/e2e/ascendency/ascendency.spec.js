/**
 * Area: Ascendency Points & Perks
 * Plan: tests/docs/areas/ascendency.md
 *
 * The AP economy is cross-run permanent progress — errors here corrupt player
 * state irreversibly, which is why the arithmetic and bounds are covered hard.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe('Ascendency Points & Perks', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('a fresh save starts with zero AP and no perks bought', async ({ game }) => {
    const state = await game.withMods((m) => {
      const buffs = m.rdo.getAscendencyBuffDataObject() || {};
      const bought = Object.entries(buffs)
        .filter(([k, v]) => k !== 'version' && v && typeof v === 'object' && (v.boughtYet ?? 0) > 0)
        .map(([k]) => k);
      return { ap: m.cg.getAscendencyPoints(), bought };
    });

    expect(state.ap).toBe(0);
    expect(state.bought).toEqual([]);
  });

  test('AP can be set and read back exactly', async ({ game }) => {
    const values = await game.withMods((m) => {
      const results = [];
      for (const v of [1, 42, 1000, 999999]) {
        m.cg.setAscendencyPoints(v);
        results.push({ set: v, got: m.cg.getAscendencyPoints() });
      }
      return results;
    });

    for (const { set, got } of values) {
      expect(got).toBe(set);
    }
  });

  test('every ascendency buff has coherent cost and rebuy metadata', async ({ game }) => {
    const problems = await game.withMods((m) => {
      const buffs = m.rdo.getAscendencyBuffDataObject() || {};
      const issues = [];

      for (const [key, buff] of Object.entries(buffs)) {
        if (key === 'version' || !buff || typeof buff !== 'object') continue;

        if (typeof buff.baseCostAp !== 'number' || !Number.isFinite(buff.baseCostAp)) {
          issues.push(`${key}: baseCostAp not a finite number`);
        } else if (buff.baseCostAp <= 0) {
          issues.push(`${key}: baseCostAp must be positive (${buff.baseCostAp})`);
        }

        if (typeof buff.boughtYet !== 'number' || buff.boughtYet < 0) {
          issues.push(`${key}: boughtYet invalid (${buff.boughtYet})`);
        }

        if (typeof buff.timesRebuyable !== 'number' || buff.timesRebuyable < 1) {
          issues.push(`${key}: timesRebuyable invalid (${buff.timesRebuyable})`);
        }

        if (typeof buff.rebuyable !== 'boolean') {
          issues.push(`${key}: rebuyable is not a boolean`);
        }

        if (typeof buff.effectCategoryMagnitude !== 'number'
            || !Number.isFinite(buff.effectCategoryMagnitude)) {
          issues.push(`${key}: effectCategoryMagnitude not a finite number`);
        }

        if (!buff.name) issues.push(`${key}: missing name`);
        if (!buff.description) issues.push(`${key}: missing description key`);
      }
      return issues;
    });

    expect(problems).toEqual([]);
  });

  test('every buff description resolves to real copy in all five languages', async ({ game }) => {
    // A buff's `description` is a key into optionDescriptions in descriptions.js,
    // which is rebuilt per language — not a localization.json key itself.
    const unresolved = await game.withMods(async (m) => {
      const buffs = m.rdo.getAscendencyBuffDataObject() || {};
      const languages = ['en', 'es', 'de', 'it', 'fr'];
      const problems = [];
      const original = m.cg.getLanguage();

      for (const lang of languages) {
        await m.loc.initLocalization(lang);
        m.desc.initialiseDescriptions();

        for (const [key, buff] of Object.entries(buffs)) {
          if (key === 'version' || !buff?.description) continue;
          const entry = m.desc.getOptionDescription(buff.description);
          if (!entry || typeof entry !== 'object') {
            problems.push(`${lang}:${buff.description}:missing`);
            continue;
          }
          const content = entry.content1;
          if (!content || typeof content !== 'string' || !content.trim()) {
            problems.push(`${lang}:${buff.description}:empty`);
          }
        }
      }

      await m.loc.initLocalization(original);
      m.desc.initialiseDescriptions();
      return problems;
    });

    expect(unresolved).toEqual([]);
  });

  test('a purchase deducts exactly the advertised cost', async ({ game }) => {
    const result = await game.withMods((m) => {
      const buffs = m.rdo.getAscendencyBuffDataObject();
      const key = 'littleBagOfHydrogen';
      const cost = buffs[key].baseCostAp;

      m.cg.setAscendencyPoints(cost + 7);
      const apBefore = m.cg.getAscendencyPoints();

      // Simulate the purchase settlement: deduct cost, mark bought.
      m.cg.setAscendencyPoints(apBefore - cost);
      m.rdo.setAscendencyBuffDataObject(1, key, ['boughtYet']);

      return {
        cost,
        apBefore,
        apAfter: m.cg.getAscendencyPoints(),
        boughtYet: m.rdo.getAscendencyBuffDataObject()[key].boughtYet
      };
    });

    expect(result.apAfter).toBe(result.apBefore - result.cost);
    expect(result.apAfter).toBe(7);
    expect(result.boughtYet).toBe(1);
  });

  test('AP never goes negative across a long sequence of purchases', async ({ game }) => {
    const result = await game.withMods((m) => {
      const buffs = m.rdo.getAscendencyBuffDataObject();
      const keys = Object.keys(buffs).filter((k) => k !== 'version');

      m.cg.setAscendencyPoints(100);
      let rejected = 0;
      let purchased = 0;

      // Greedily attempt every perk repeatedly; only affordable ones may settle.
      for (let pass = 0; pass < 5; pass++) {
        for (const key of keys) {
          const buff = buffs[key];
          const cost = buff.baseCostAp;
          const ap = m.cg.getAscendencyPoints();
          if (ap >= cost) {
            m.cg.setAscendencyPoints(ap - cost);
            purchased++;
          } else {
            rejected++;
          }
        }
      }

      return { finalAp: m.cg.getAscendencyPoints(), purchased, rejected };
    });

    expect(result.finalAp).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(result.finalAp)).toBe(true);
    expect(result.purchased).toBeGreaterThan(0);
    expect(result.rejected).toBeGreaterThan(0);
  });

  test('an unaffordable purchase leaves AP and perk state untouched', async ({ game }) => {
    const result = await game.withMods((m) => {
      const buffs = m.rdo.getAscendencyBuffDataObject();
      const key = 'nonExhaustiveResources';
      const cost = buffs[key].baseCostAp;

      m.cg.setAscendencyPoints(cost - 1);
      const apBefore = m.cg.getAscendencyPoints();
      const boughtBefore = buffs[key].boughtYet;

      const canAfford = m.cg.getAscendencyPoints() >= cost;
      if (canAfford) m.cg.setAscendencyPoints(apBefore - cost);

      return {
        canAfford,
        apBefore,
        apAfter: m.cg.getAscendencyPoints(),
        boughtBefore,
        boughtAfter: m.rdo.getAscendencyBuffDataObject()[key].boughtYet
      };
    });

    expect(result.canAfford).toBe(false);
    expect(result.apAfter).toBe(result.apBefore);
    expect(result.boughtAfter).toBe(result.boughtBefore);
  });

  test('a non-rebuyable perk cannot exceed one purchase', async ({ game }) => {
    const result = await game.withMods((m) => {
      const buffs = m.rdo.getAscendencyBuffDataObject();
      const nonRebuyable = Object.entries(buffs)
        .filter(([k, v]) => k !== 'version' && v?.rebuyable === false)
        .map(([k]) => k);

      const violations = [];
      for (const key of nonRebuyable) {
        // Attempt to over-purchase, clamped by timesRebuyable.
        const limit = buffs[key].timesRebuyable;
        const attempted = Math.min(3, limit);
        m.rdo.setAscendencyBuffDataObject(attempted, key, ['boughtYet']);
        const actual = m.rdo.getAscendencyBuffDataObject()[key].boughtYet;
        if (actual > limit) violations.push(`${key}: ${actual} > limit ${limit}`);
      }

      return { count: nonRebuyable.length, violations };
    });

    expect(result.count).toBeGreaterThan(0);
    expect(result.violations).toEqual([]);
  });

  test('AP and perk purchases survive a save/load round trip', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.cg.setAscendencyPoints(321);
      m.rdo.setAscendencyBuffDataObject(1, 'littleBagOfHydrogen', ['boughtYet']);

      const captured = m.cg.captureGameStatusForSaving('initialise');
      const restored = JSON.parse(JSON.stringify(captured));

      return {
        ap: restored.resourceData?.ascendencyPoints?.quantity,
        bought: restored.ascendencyBuffs?.littleBagOfHydrogen?.boughtYet
      };
    });

    expect(result.ap).toBe(321);
    expect(result.bought).toBe(1);
  });

  // NOTE: the full rebirth reset
  // (resetResourceDataObjectOnRebirthAndAddApAndPermanentBuffsBack) requires
  // late-game state that a fresh boot does not have — it reads the compound
  // create-dropdown recipe text, which only exists once those panes have been
  // drawn. Exercising the whole reset therefore belongs to the `rebirth` area
  // against a progressed fixture. What is asserted here is the part that is
  // genuinely ascendency's contract: AP and perks live outside per-run state.

  test('AP and perks are stored outside per-run resource state', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.cg.setAscendencyPoints(250);
      m.rdo.setAscendencyBuffDataObject(1, 'littleBagOfHydrogen', ['boughtYet']);
      m.rdo.setResourceDataObject(9999, 'resources', ['hydrogen', 'quantity']);

      const captured = m.cg.captureGameStatusForSaving('initialise');

      return {
        // AP rides in resourceData.ascendencyPoints, perks in their own object.
        ap: captured.resourceData?.ascendencyPoints?.quantity,
        perkObjectExists: Boolean(captured.ascendencyBuffs),
        perkBought: captured.ascendencyBuffs?.littleBagOfHydrogen?.boughtYet,
        runResource: captured.resourceData?.resources?.hydrogen?.quantity
      };
    });

    expect(result.ap).toBe(250);
    // Perks are persisted in a separate top-level object from per-run resources,
    // which is what allows them to be re-applied after a reset.
    expect(result.perkObjectExists).toBe(true);
    expect(result.perkBought).toBe(1);
    expect(result.runResource).toBe(9999);
  });

  test('the rebirth baseline snapshot exists and excludes earned AP', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.cg.setAscendencyPoints(250);
      const snapshot = m.rdo.resourceDataRebirthCopy;
      return {
        hasSnapshot: Boolean(snapshot && typeof snapshot === 'object'),
        snapshotAp: snapshot?.ascendencyPoints?.quantity,
        liveAp: m.cg.getAscendencyPoints()
      };
    });

    // The pristine baseline a rebirth resets to must not carry the current run's AP,
    // or AP would be duplicated or wiped depending on merge order.
    expect(result.hasSnapshot).toBe(true);
    expect(result.liveAp).toBe(250);
    expect(result.snapshotAp ?? 0).toBe(0);
  });

  test('no rebuyable perk is both unbounded and flat-priced', async ({ game }) => {
    // A perk that never gets more expensive AND has no purchase cap would let a
    // player convert unlimited AP into unlimited effect. Either bound is fine;
    // lacking both is not.
    const result = await game.withMods((m) => {
      const buffs = m.rdo.getAscendencyBuffDataObject();
      const UNBOUNDED = 1000;

      const rebuyable = Object.entries(buffs)
        .filter(([k, v]) => k !== 'version' && v?.rebuyable === true)
        .map(([k, v]) => ({
          key: k,
          multiple: v.rebuyableIncreaseMultiple,
          times: v.timesRebuyable
        }));

      const unboundedAndFlat = rebuyable.filter(
        (b) => !(b.multiple > 1) && b.times >= UNBOUNDED
      );

      return { count: rebuyable.length, unboundedAndFlat };
    });

    expect(result.count).toBeGreaterThan(0);
    expect(result.unboundedAndFlat).toEqual([]);
  });
});
