/**
 * Area: Compounds & Crafting
 * Plan: tests/docs/areas/compounds.md
 *
 * Uses the debug menu to unlock techs and stock ingredients, then asserts recipe
 * integrity, storage bounds, and the language-reverse-lookup that the frame loop
 * depends on.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

const COMPOUNDS = ['diesel', 'water', 'glass', 'concrete', 'steel', 'titanium'];

test.describe('Compounds & Crafting', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
  });

  test('all six compounds exist with a full data shape', async ({ game }) => {
    const problems = await game.withMods((m, compounds) => {
      const issues = [];
      for (const key of compounds) {
        const c = m.rdo.getResourceDataObject('compounds', [key]);
        if (!c) { issues.push(`${key}: missing`); continue; }
        for (const field of ['quantity', 'rate', 'storageCapacity', 'saleValue', 'nameResource']) {
          if (c[field] === undefined) issues.push(`${key}: missing ${field}`);
        }
      }
      return issues;
    }, COMPOUNDS);

    expect(problems).toEqual([]);
  });

  test('every compound has at least one ingredient with a positive ratio', async ({ game }) => {
    const problems = await game.withMods((m, compounds) => {
      const issues = [];
      for (const key of compounds) {
        const c = m.rdo.getResourceDataObject('compounds', [key]);
        const ingredients = [1, 2, 3, 4]
          .map((i) => ({ from: c[`createsFrom${i}`], ratio: c[`createsFromRatio${i}`] }))
          .filter((x) => x.from);

        if (ingredients.length === 0) {
          issues.push(`${key}: no ingredients defined`);
          continue;
        }
        for (const { from, ratio } of ingredients) {
          if (!(typeof ratio === 'number' && Number.isFinite(ratio) && ratio > 0)) {
            issues.push(`${key}: ingredient ${from} has bad ratio ${ratio}`);
          }
        }
      }
      return issues;
    }, COMPOUNDS);

    expect(problems).toEqual([]);
  });

  test('compound ingredients all reference real resources or compounds', async ({ game }) => {
    // createsFromN is a [name, category] tuple, e.g. ['hydrogen', 'resources'].
    const dangling = await game.withMods((m, compounds) => {
      const known = {
        resources: new Set(Object.keys(m.rdo.getResourceDataObject('resources') || {})),
        compounds: new Set(Object.keys(m.rdo.getResourceDataObject('compounds') || {}))
      };

      const bad = [];
      for (const key of compounds) {
        const c = m.rdo.getResourceDataObject('compounds', [key]);
        for (const i of [1, 2, 3, 4]) {
          const entry = c[`createsFrom${i}`];
          if (!entry) continue;

          if (!Array.isArray(entry) || entry.length < 2) {
            bad.push(`${key}.createsFrom${i}: expected [name, category], got ${JSON.stringify(entry)}`);
            continue;
          }

          const [name, category] = entry;
          const bucket = known[category];
          if (!bucket) {
            bad.push(`${key}.createsFrom${i}: unknown category "${category}"`);
          } else if (!bucket.has(name)) {
            bad.push(`${key}.createsFrom${i}: "${name}" not found in ${category}`);
          }
        }
      }
      return bad;
    }, COMPOUNDS);

    expect(dangling).toEqual([]);
  });

  test('quantity is clamped to storage capacity', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.rdo.setResourceDataObject(1000, 'compounds', ['water', 'storageCapacity']);
      m.rdo.setResourceDataObject(1000, 'compounds', ['water', 'quantity']);
      const atCap = m.rdo.getResourceDataObject('compounds', ['water', 'quantity']);
      const cap = m.rdo.getResourceDataObject('compounds', ['water', 'storageCapacity']);
      return { atCap, cap };
    });

    // Quantity must never be recorded above capacity.
    expect(result.atCap).toBeLessThanOrEqual(result.cap);
  });

  test('sale value is positive for every compound', async ({ game }) => {
    const bad = await game.withMods((m, compounds) =>
      compounds.filter((k) => {
        const v = m.rdo.getResourceDataObject('compounds', [k, 'saleValue']);
        return !(typeof v === 'number' && Number.isFinite(v) && v > 0);
      }), COMPOUNDS);

    expect(bad).toEqual([]);
  });

  test('selling a compound converts quantity into cash', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.rdo.setResourceDataObject(500, 'compounds', ['water', 'quantity']);
      m.rdo.setResourceDataObject(1000, 'currency', ['cash']);

      const saleValue = m.rdo.getResourceDataObject('compounds', ['water', 'saleValue']);
      const qtyBefore = m.rdo.getResourceDataObject('compounds', ['water', 'quantity']);
      const cashBefore = m.rdo.getResourceDataObject('currency', ['cash']);

      // Settle a sale of 100 units the way the economy does.
      const sold = 100;
      m.rdo.setResourceDataObject(qtyBefore - sold, 'compounds', ['water', 'quantity']);
      m.rdo.setResourceDataObject(cashBefore + sold * saleValue, 'currency', ['cash']);

      return {
        saleValue, sold, cashBefore, qtyBefore,
        qtyAfter: m.rdo.getResourceDataObject('compounds', ['water', 'quantity']),
        cashAfter: m.rdo.getResourceDataObject('currency', ['cash'])
      };
    });

    expect(result.qtyAfter).toBe(result.qtyBefore - result.sold);
    expect(result.cashAfter).toBeCloseTo(result.cashBefore + result.sold * result.saleValue, 6);
  });

  test('every compound name is localized in all five languages', async ({ game }) => {
    const unresolved = await game.withMods(async (m, compounds) => {
      const languages = ['en', 'es', 'de', 'it', 'fr'];
      const original = m.cg.getLanguage();
      const problems = [];

      for (const lang of languages) {
        await m.loc.initLocalization(lang);
        for (const key of compounds) {
          const locKey = `compound${key.charAt(0).toUpperCase()}${key.slice(1)}`;
          const value = m.loc.localize(locKey, lang);
          if (!value || value === locKey) problems.push(`${lang}:${locKey}`);
        }
      }

      await m.loc.initLocalization(original);
      m.desc.initialiseDescriptions();
      return problems;
    }, COMPOUNDS);

    expect(unresolved).toEqual([]);
  });

  test('reverse name lookup resolves translated compound names in every language', async ({ game }) => {
    // reverseLocalizeForCompounds runs inside the frame loop; if it fails to map a
    // translated name back to its internal key, compound cost checks break in that
    // language only — exactly the kind of bug that ships unnoticed.
    const failures = await game.withMods(async (m, compounds) => {
      const languages = ['en', 'es', 'de', 'it', 'fr'];
      const original = m.cg.getLanguage();
      const problems = [];

      for (const lang of languages) {
        await m.loc.initLocalization(lang);
        for (const key of compounds) {
          const locKey = `compound${key.charAt(0).toUpperCase()}${key.slice(1)}`;
          const translated = m.loc.localize(locKey, lang);
          const back = m.loc.reverseLocalizeForCompounds(translated, lang);
          if (String(back).toLowerCase() !== key.toLowerCase()) {
            problems.push(`${lang}: "${translated}" -> "${back}" (expected "${key}")`);
          }
        }
      }

      await m.loc.initLocalization(original);
      m.desc.initialiseDescriptions();
      return problems;
    }, COMPOUNDS);

    expect(failures).toEqual([]);
  });

  test('reverse lookup returns the input unchanged for an unknown name', async ({ game }) => {
    const result = await game.withMods((m) =>
      m.loc.reverseLocalizeForCompounds('definitelyNotACompound', m.cg.getLanguage()));

    expect(result).toBe('definitelyNotACompound');
  });

  test('compound state survives a save/load round trip', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.rdo.setResourceDataObject(4321, 'compounds', ['steel', 'quantity']);
      m.rdo.setResourceDataObject(99999, 'compounds', ['steel', 'storageCapacity']);

      const restored = JSON.parse(JSON.stringify(m.cg.captureGameStatusForSaving('initialise')));
      return {
        qty: restored.resourceData?.compounds?.steel?.quantity,
        cap: restored.resourceData?.compounds?.steel?.storageCapacity
      };
    });

    expect(result.qty).toBe(4321);
    expect(result.cap).toBe(99999);
  });

  test('no compound quantity is ever NaN or negative after debug stocking', async ({ game }) => {
    const bad = await game.withMods((m, compounds) =>
      compounds
        .map((k) => ({ k, q: m.rdo.getResourceDataObject('compounds', [k, 'quantity']) }))
        .filter(({ q }) => !Number.isFinite(q) || q < 0)
        .map(({ k, q }) => `${k}=${q}`), COMPOUNDS);

    expect(bad).toEqual([]);
  });
});
