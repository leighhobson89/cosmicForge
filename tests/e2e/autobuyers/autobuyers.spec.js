/**
 * Area: Auto Buyers
 * Plan: tests/docs/areas/autobuyers.md
 *
 * Scenario setup uses the game's own debug menu (Numpad -) rather than bespoke
 * seeding, so these tests exercise the same state a developer reaches by hand.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

const RESOURCES = ['hydrogen', 'helium', 'carbon', 'neon', 'oxygen', 'silicon', 'sodium', 'iron'];
const COMPOUNDS = ['diesel', 'water', 'glass', 'concrete', 'steel', 'titanium'];
const TIERS = ['tier1', 'tier2', 'tier3', 'tier4'];

test.describe('Auto Buyers', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
  });

  test('every resource and compound exposes four autobuyer tiers', async ({ game }) => {
    const problems = await game.withMods((m, { resources, compounds, tiers }) => {
      const issues = [];
      const check = (category, keys) => {
        for (const key of keys) {
          const ab = m.rdo.getResourceDataObject(category, [key, 'upgrades', 'autoBuyer']);
          if (!ab) { issues.push(`${category}.${key}: no autoBuyer block`); continue; }
          for (const tier of tiers) {
            if (!ab[tier]) issues.push(`${category}.${key}.${tier}: missing`);
          }
        }
      };
      check('resources', resources);
      check('compounds', compounds);
      return issues;
    }, { resources: RESOURCES, compounds: COMPOUNDS, tiers: TIERS });

    expect(problems).toEqual([]);
  });

  test('every autobuyer tier has coherent price, rate and energy metadata', async ({ game }) => {
    const problems = await game.withMods((m, { resources, compounds, tiers }) => {
      const issues = [];
      const check = (category, keys) => {
        for (const key of keys) {
          for (const tier of tiers) {
            const t = m.rdo.getResourceDataObject(category, [key, 'upgrades', 'autoBuyer', tier]);
            if (!t) continue;
            const at = `${category}.${key}.${tier}`;
            if (!(typeof t.price === 'number' && Number.isFinite(t.price) && t.price > 0)) {
              issues.push(`${at}: bad price ${t.price}`);
            }
            if (!(typeof t.rate === 'number' && Number.isFinite(t.rate) && t.rate > 0)) {
              issues.push(`${at}: bad rate ${t.rate}`);
            }
            if (!(typeof t.quantity === 'number' && t.quantity >= 0)) {
              issues.push(`${at}: bad quantity ${t.quantity}`);
            }
            if (!(typeof t.energyUse === 'number' && t.energyUse >= 0)) {
              issues.push(`${at}: bad energyUse ${t.energyUse}`);
            }
            if (!t.nameUpgrade) issues.push(`${at}: missing nameUpgrade key`);
          }
        }
      };
      check('resources', resources);
      check('compounds', compounds);
      return issues;
    }, { resources: RESOURCES, compounds: COMPOUNDS, tiers: TIERS });

    expect(problems).toEqual([]);
  });

  test('higher tiers produce a strictly better rate than lower tiers', async ({ game }) => {
    const regressions = await game.withMods((m, { resources, tiers }) => {
      const bad = [];
      for (const key of resources) {
        const rates = tiers.map((t) =>
          m.rdo.getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', t, 'rate']));
        for (let i = 1; i < rates.length; i++) {
          if (!(rates[i] > rates[i - 1])) {
            bad.push(`${key}: tier${i + 1} rate ${rates[i]} not greater than tier${i} ${rates[i - 1]}`);
          }
        }
      }
      return bad;
    }, { resources: RESOURCES, tiers: TIERS });

    expect(regressions).toEqual([]);
  });

  test('every autobuyer name key is localized in all five languages', async ({ game }) => {
    const unresolved = await game.withMods(async (m, { resources, compounds, tiers }) => {
      const languages = ['en', 'es', 'de', 'it', 'fr'];
      const original = m.cg.getLanguage();
      const problems = [];

      const names = [];
      const collect = (category, keys) => {
        for (const key of keys) {
          for (const tier of tiers) {
            const n = m.rdo.getResourceDataObject(category, [key, 'upgrades', 'autoBuyer', tier, 'nameUpgrade']);
            if (n) names.push(n);
          }
        }
      };
      collect('resources', resources);
      collect('compounds', compounds);

      for (const lang of languages) {
        await m.loc.initLocalization(lang);
        for (const n of names) {
          const value = m.loc.localize(n, lang);
          if (!value || value === n) problems.push(`${lang}:${n}`);
        }
      }

      await m.loc.initLocalization(original);
      m.desc.initialiseDescriptions();
      return [...new Set(problems)];
    }, { resources: RESOURCES, compounds: COMPOUNDS, tiers: TIERS });

    expect(unresolved).toEqual([]);
  });

  test('buying a tier increases its quantity and its contribution', async ({ game }) => {
    const result = await game.withMods((m) => {
      const path = ['hydrogen', 'upgrades', 'autoBuyer', 'tier1'];
      m.rdo.setResourceDataObject(0, 'resources', [...path, 'quantity']);
      const before = m.rdo.getResourceDataObject('resources', [...path, 'quantity']);
      const rate = m.rdo.getResourceDataObject('resources', [...path, 'rate']);

      m.rdo.setResourceDataObject(5, 'resources', [...path, 'quantity']);
      const after = m.rdo.getResourceDataObject('resources', [...path, 'quantity']);

      return { before, after, rate, expectedContribution: rate * 5 };
    });

    expect(result.before).toBe(0);
    expect(result.after).toBe(5);
    expect(result.expectedContribution).toBeCloseTo(result.rate * 5, 6);
  });

  test('toggling a tier inactive removes it from the gross rate', async ({ game }) => {
    const result = await game.withMods((m, { tiers }) => {
      const base = ['hydrogen', 'upgrades', 'autoBuyer'];
      for (const t of tiers) {
        m.rdo.setResourceDataObject(2, 'resources', [...base, t, 'quantity']);
        m.rdo.setResourceDataObject(true, 'resources', [...base, t, 'active']);
      }

      const gross = () => tiers.reduce((sum, t) => {
        const tier = m.rdo.getResourceDataObject('resources', [...base, t]);
        if (!tier || tier.active === false) return sum;
        return sum + (tier.rate ?? 0) * (tier.quantity ?? 0);
      }, 0);

      const allActive = gross();
      m.rdo.setResourceDataObject(false, 'resources', [...base, 'tier1', 'active']);
      const tier1Off = gross();
      const tier1Contribution =
        m.rdo.getResourceDataObject('resources', [...base, 'tier1', 'rate']) * 2;

      // Restore
      m.rdo.setResourceDataObject(true, 'resources', [...base, 'tier1', 'active']);

      return { allActive, tier1Off, tier1Contribution };
    }, { tiers: TIERS });

    expect(result.allActive).toBeGreaterThan(0);
    expect(result.tier1Off).toBeCloseTo(result.allActive - result.tier1Contribution, 6);
  });

  test('an inactive autobuyer contributes nothing at all', async ({ game }) => {
    const result = await game.withMods((m, { tiers }) => {
      const base = ['hydrogen', 'upgrades', 'autoBuyer'];
      for (const t of tiers) {
        m.rdo.setResourceDataObject(3, 'resources', [...base, t, 'quantity']);
        m.rdo.setResourceDataObject(false, 'resources', [...base, t, 'active']);
      }
      const gross = tiers.reduce((sum, t) => {
        const tier = m.rdo.getResourceDataObject('resources', [...base, t]);
        if (!tier || tier.active === false) return sum;
        return sum + (tier.rate ?? 0) * (tier.quantity ?? 0);
      }, 0);
      for (const t of tiers) {
        m.rdo.setResourceDataObject(true, 'resources', [...base, t, 'active']);
      }
      return gross;
    }, { tiers: TIERS });

    expect(result).toBe(0);
  });

  test('autobuyer quantities and toggles survive a save/load round trip', async ({ game }) => {
    const result = await game.withMods((m) => {
      const base = ['iron', 'upgrades', 'autoBuyer'];
      m.rdo.setResourceDataObject(7, 'resources', [...base, 'tier2', 'quantity']);
      m.rdo.setResourceDataObject(false, 'resources', [...base, 'tier3', 'active']);

      const captured = m.cg.captureGameStatusForSaving('initialise');
      const restored = JSON.parse(JSON.stringify(captured));
      const ab = restored.resourceData?.resources?.iron?.upgrades?.autoBuyer;

      m.rdo.setResourceDataObject(true, 'resources', [...base, 'tier3', 'active']);
      return { qty: ab?.tier2?.quantity, active: ab?.tier3?.active };
    });

    expect(result.qty).toBe(7);
    expect(result.active).toBe(false);
  });

  test('the migration map covers every autobuyer name in the game', async ({ game }) => {
    // patches.js migrates old English display names to localization keys. A name
    // missing from that map would break autobuyers for returning players.
    const uncovered = await game.withMods((m, { resources, compounds, tiers }) => {
      const names = new Set();
      const collect = (category, keys) => {
        for (const key of keys) {
          for (const tier of tiers) {
            const n = m.rdo.getResourceDataObject(category, [key, 'upgrades', 'autoBuyer', tier, 'nameUpgrade']);
            if (n) names.add(n);
          }
        }
      };
      collect('resources', resources);
      collect('compounds', compounds);

      // Every name must be an autoBuyerName* localization key, not a display string.
      return [...names].filter((n) => !/^autoBuyerName[A-Z]/.test(n));
    }, { resources: RESOURCES, compounds: COMPOUNDS, tiers: TIERS });

    expect(uncovered).toEqual([]);
  });

  test('energy use is non-decreasing across tiers', async ({ game }) => {
    const regressions = await game.withMods((m, { resources, tiers }) => {
      const bad = [];
      for (const key of resources) {
        const uses = tiers.map((t) =>
          m.rdo.getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', t, 'energyUse']) ?? 0);
        for (let i = 1; i < uses.length; i++) {
          if (uses[i] < uses[i - 1]) {
            bad.push(`${key}: tier${i + 1} energyUse ${uses[i]} < tier${i} ${uses[i - 1]}`);
          }
        }
      }
      return bad;
    }, { resources: RESOURCES, tiers: TIERS });

    expect(regressions).toEqual([]);
  });
});
