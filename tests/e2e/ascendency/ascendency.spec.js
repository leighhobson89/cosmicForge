/**
 * Area: Ascendency Points & Perks — the catalogue behind the pane
 * Plan: tests/docs/areas/ascendency.md
 *
 * What is left in this file is the part of the area with no UI to drive: the
 * shape of the perk catalogue, whether every perk's copy resolves in every
 * shipped language, and the two structural rules that let perks survive a
 * rebirth at all.
 *
 * Everything a player *does* — reading a price, seeing which perks the balance
 * can pay for, pressing Buy, watching the effect land, and finding it all still
 * there on the next run — lives in `ascendency-perks-live.spec.js`, driven
 * through the real pane.
 *
 * The purchase cases that used to be here have been removed rather than kept
 * alongside it. They settled purchases by hand — deducting the cost and setting
 * `boughtYet` in the same `withMods` block that then asserted on them — so they
 * would have passed with `purchaseBuff` deleted from the game.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe('Ascendency Points & Perks', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
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

  test('every buff description resolves to real copy in every shipped language', async ({ game }) => {
    // A buff's `description` is a key into optionDescriptions in descriptions.js,
    // which is rebuilt per language — not a localization.json key itself.
    const unresolved = await game.withMods(async (m) => {
      const buffs = m.rdo.getAscendencyBuffDataObject() || {};
      // Taken from the game rather than written out, so adding a language to
      // localization.js brings it under this check automatically.
      const languages = m.loc.getSupportedLanguages();
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

  // The full rebirth reset is exercised for real in
  // `ascendency-perks-live.spec.js`, which buys a basket of perks, presses the
  // Rebirth button and checks each one was re-applied to the new run. What is
  // asserted here is only the structural precondition that makes that possible:
  // AP and perks live outside per-run state.

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
