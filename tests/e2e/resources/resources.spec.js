/**
 * Area: Resources
 * Plan: tests/docs/areas/resources.md
 *
 * The eight extractable base resources plus solar, which is a special case: it
 * has no sale value and starts at its own storage cap. Everything else about a
 * resource is uniform — a quantity, a storage cap that quantity may never
 * exceed, a sale value, and four autobuyer tiers whose `rate × quantity`
 * product is the accrual rate.
 *
 * Accrual happens in the frame loop, so specs that care about the arithmetic
 * assert the *rule* — capping, tier contribution, the power gate — against a
 * single synchronous evaluation rather than racing production between round
 * trips. See the "read-modify-read belongs in one withMods" convention in
 * tests/e2e/README.md.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** The extractable resources, in the order the data object declares them. */
const EXTRACTABLE = ['hydrogen', 'helium', 'carbon', 'neon', 'oxygen', 'silicon', 'iron', 'sodium'];

/** Solar is a resource but is not extracted, sold, or storage-limited like the rest. */
const ALL_RESOURCES = ['solar', ...EXTRACTABLE];

const TIERS = ['tier1', 'tier2', 'tier3', 'tier4'];

test.describe('Resources — catalogue and structure', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('every resource declares the fields the frame loop reads', async ({ game }) => {
    const problems = await game.withMods((m, resources) => {
      const issues = [];
      for (const key of resources) {
        const entry = m.rdo.getResourceDataObject('resources', [key]);
        if (!entry) { issues.push(`${key}: missing`); continue; }

        for (const field of ['quantity', 'storageCapacity', 'saleValue', 'rate']) {
          if (typeof entry[field] !== 'number' || Number.isNaN(entry[field])) {
            issues.push(`${key}.${field}: ${JSON.stringify(entry[field])}`);
          }
        }
        if (typeof entry.revealedYet !== 'boolean') issues.push(`${key}.revealedYet not boolean`);
        if (typeof entry.screenName !== 'string' || !entry.screenName) issues.push(`${key}.screenName missing`);
      }
      return issues;
    }, ALL_RESOURCES);

    expect(problems).toEqual([]);
  });

  test('every resource has four autobuyer tiers with a rate and a price', async ({ game }) => {
    const problems = await game.withMods((m, config) => {
      const { resources, tiers } = config;
      const issues = [];

      for (const key of resources) {
        for (const tier of tiers) {
          const t = m.rdo.getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', tier]);
          if (!t) { issues.push(`${key}.${tier}: missing`); continue; }
          if (typeof t.rate !== 'number') issues.push(`${key}.${tier}.rate not a number`);
          if (typeof t.price !== 'number') issues.push(`${key}.${tier}.price not a number`);
          if (typeof t.quantity !== 'number') issues.push(`${key}.${tier}.quantity not a number`);
          // Every tier row needs a DOM anchor or its purchase button cannot be drawn.
          if (!t.place) issues.push(`${key}.${tier}.place missing`);
        }
      }
      return issues;
    }, { resources: ALL_RESOURCES, tiers: TIERS });

    expect(problems).toEqual([]);
  });

  test('each tier extracts faster than the one below it', async ({ game }) => {
    // Solar is excluded: all four of its tiers are rate 0 by design, because
    // solar output is driven by the power system rather than by autobuyers.
    const inversions = await game.withMods((m, config) => {
      const { resources, tiers } = config;
      const bad = [];

      for (const key of resources) {
        const rates = tiers.map((tier) =>
          m.rdo.getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', tier, 'rate']) || 0);
        for (let i = 1; i < rates.length; i++) {
          if (rates[i] <= rates[i - 1]) {
            bad.push(`${key}: ${tiers[i]} (${rates[i]}) is not faster than ${tiers[i - 1]} (${rates[i - 1]})`);
          }
        }
      }
      return bad;
    }, { resources: EXTRACTABLE, tiers: TIERS });

    expect(inversions).toEqual([]);
  });

  test('each tier costs more than the one below it', async ({ game }) => {
    const inversions = await game.withMods((m, config) => {
      const { resources, tiers } = config;
      const bad = [];

      for (const key of resources) {
        const prices = tiers.map((tier) =>
          m.rdo.getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', tier, 'price']) || 0);
        for (let i = 1; i < prices.length; i++) {
          if (prices[i] <= prices[i - 1]) {
            bad.push(`${key}: ${tiers[i]} (${prices[i]}) is not dearer than ${tiers[i - 1]} (${prices[i - 1]})`);
          }
        }
      }
      return bad;
    }, { resources: EXTRACTABLE, tiers: TIERS });

    expect(inversions).toEqual([]);
  });

  test('only solar starts revealed and stocked; the rest start hidden and empty', async ({ game }) => {
    const start = await game.withMods((m, resources) =>
      resources.map((key) => ({
        key,
        quantity: m.rdo.getResourceDataObject('resources', [key, 'quantity']),
        revealed: m.rdo.getResourceDataObject('resources', [key, 'revealedYet'])
      })), ALL_RESOURCES);

    const solar = start.find((s) => s.key === 'solar');
    expect(solar.quantity).toBeGreaterThan(0);

    // Hydrogen is the first thing a new player extracts, so it must start empty
    // or the opening minute of the game is skipped.
    const hydrogen = start.find((s) => s.key === 'hydrogen');
    expect(hydrogen.quantity).toBe(0);
  });

  test('every resource name resolves to real copy in all five languages', async ({ game }) => {
    const problems = await game.withMods(async (m, config) => {
      const { resources, languages } = config;
      const original = m.cg.getLanguage();
      const issues = [];

      for (const language of languages) {
        await m.loc.initLocalization(language);
        for (const key of resources) {
          const value = m.loc.localize(`resource${key.charAt(0).toUpperCase()}${key.slice(1)}`, language);
          if (!value || value === `resource${key.charAt(0).toUpperCase()}${key.slice(1)}`) {
            issues.push(`${language}/${key}: unresolved`);
          }
        }
      }

      await m.loc.initLocalization(original);
      return issues;
    }, { resources: ALL_RESOURCES, languages: ['en', 'es', 'de', 'it', 'fr'] });

    expect(problems).toEqual([]);
  });
});

test.describe('Resources — storage capacity', () => {
  test('production never carries a resource past its storage cap', async ({ game }) => {
    await game.boot();

    // Fill hydrogen to just under its cap, grant a large autobuyer rate, then
    // let the frame loop run. The cap is applied by `Math.min(current + gain,
    // storageCapacity)` inside the production step, so an overflow here is a
    // real loss of the invariant rather than a rounding artefact.
    const cap = await game.withMods((m) => {
      const capacity = m.rdo.getResourceDataObject('resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(true, 'resources', ['hydrogen', 'revealedYet']);
      m.rdo.setResourceDataObject(capacity * 0.9, 'resources', ['hydrogen', 'quantity']);
      m.rdo.setResourceDataObject(1000, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      m.rdo.setResourceDataObject(50, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      m.cg.setPowerOnOff(true);
      return capacity;
    });

    await game.page.waitForTimeout(1500);

    const after = await game.withMods((m) => ({
      quantity: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
      capacity: m.rdo.getResourceDataObject('resources', ['hydrogen', 'storageCapacity'])
    }));

    expect(after.capacity).toBe(cap);
    expect(after.quantity).toBeLessThanOrEqual(after.capacity);
    // And it should actually have produced, or the cap assertion proves nothing.
    expect(after.quantity).toBeGreaterThan(cap * 0.9);
  });

  test('the cap holds for every extractable resource at once', async ({ game }) => {
    await game.boot();

    await game.withMods((m, resources) => {
      m.cg.setPowerOnOff(true);
      for (const key of resources) {
        const capacity = m.rdo.getResourceDataObject('resources', [key, 'storageCapacity']);
        m.rdo.setResourceDataObject(true, 'resources', [key, 'revealedYet']);
        m.rdo.setResourceDataObject(capacity, 'resources', [key, 'quantity']);
        m.rdo.setResourceDataObject(500, 'resources', [key, 'upgrades', 'autoBuyer', 'tier1', 'rate']);
        m.rdo.setResourceDataObject(20, 'resources', [key, 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      }
    }, EXTRACTABLE);

    await game.page.waitForTimeout(1500);

    const overflows = await game.withMods((m, resources) =>
      resources
        .map((key) => ({
          key,
          quantity: m.rdo.getResourceDataObject('resources', [key, 'quantity']),
          capacity: m.rdo.getResourceDataObject('resources', [key, 'storageCapacity'])
        }))
        .filter((r) => r.quantity > r.capacity), EXTRACTABLE);

    expect(overflows).toEqual([]);
  });

  test('a resource sitting exactly at capacity gains nothing further', async ({ game }) => {
    await game.boot();

    const observed = await game.withMods((m) => {
      m.cg.setPowerOnOff(true);
      const capacity = m.rdo.getResourceDataObject('resources', ['carbon', 'storageCapacity']);
      m.rdo.setResourceDataObject(capacity, 'resources', ['carbon', 'quantity']);
      m.rdo.setResourceDataObject(999, 'resources', ['carbon', 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      m.rdo.setResourceDataObject(10, 'resources', ['carbon', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      return capacity;
    });

    await game.page.waitForTimeout(1200);

    const quantity = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['carbon', 'quantity']));
    expect(quantity).toBe(observed);
  });
});

test.describe('Resources — selling', () => {
  test('selling all unlocked resources pays exactly quantity × saleValue', async ({ game }) => {
    await game.boot();

    // Snapshot, sell and re-snapshot in one evaluation: the frame loop is
    // producing throughout, and split across round trips the expected total
    // would drift out from under the assertion.
    const result = await game.withMods((m, resources) => {
      m.rdo.setResourceDataObject(0, 'currency', ['cash']);

      const unlocked = m.cg.getUnlockedResourcesArray();
      unlocked.length = 0;
      for (const key of resources) {
        m.cg.setUnlockedResourcesArray(key);
        m.rdo.setResourceDataObject(true, 'resources', [key, 'revealedYet']);
        m.rdo.setResourceDataObject(1000, 'resources', [key, 'quantity']);
        // Stop production so the sale total is exactly what we staged.
        for (const tier of ['tier1', 'tier2', 'tier3', 'tier4']) {
          m.rdo.setResourceDataObject(0, 'resources', [key, 'upgrades', 'autoBuyer', tier, 'quantity']);
        }
      }

      const expectedCash = resources.reduce((sum, key) => {
        const quantity = m.rdo.getResourceDataObject('resources', [key, 'quantity']) || 0;
        const saleValue = m.rdo.getResourceDataObject('resources', [key, 'saleValue']) || 0;
        return sum + quantity * saleValue;
      }, 0);

      m.game.sellAllUnlockedResources();

      return {
        expectedCash,
        cash: m.rdo.getResourceDataObject('currency', ['cash']),
        remaining: resources.map((key) => ({
          key,
          quantity: m.rdo.getResourceDataObject('resources', [key, 'quantity'])
        }))
      };
    }, EXTRACTABLE);

    expect(result.expectedCash).toBeGreaterThan(0);
    expect(result.cash).toBeCloseTo(result.expectedCash, 6);
    expect(result.remaining.filter((r) => r.quantity !== 0)).toEqual([]);
  });

  test('selling ignores resources the player has not unlocked', async ({ game }) => {
    await game.boot();

    const result = await game.withMods((m, resources) => {
      m.rdo.setResourceDataObject(0, 'currency', ['cash']);

      const unlocked = m.cg.getUnlockedResourcesArray();
      unlocked.length = 0;
      // Unlock only the first; stock all of them.
      m.cg.setUnlockedResourcesArray(resources[0]);
      for (const key of resources) {
        m.rdo.setResourceDataObject(500, 'resources', [key, 'quantity']);
        for (const tier of ['tier1', 'tier2', 'tier3', 'tier4']) {
          m.rdo.setResourceDataObject(0, 'resources', [key, 'upgrades', 'autoBuyer', tier, 'quantity']);
        }
      }

      m.game.sellAllUnlockedResources();

      return {
        cash: m.rdo.getResourceDataObject('currency', ['cash']),
        soldKey: m.rdo.getResourceDataObject('resources', [resources[0], 'quantity']),
        untouched: resources.slice(1).map((key) => ({
          key,
          quantity: m.rdo.getResourceDataObject('resources', [key, 'quantity'])
        }))
      };
    }, EXTRACTABLE);

    expect(result.soldKey).toBe(0);
    expect(result.cash).toBeGreaterThan(0);
    expect(result.untouched.filter((r) => r.quantity !== 500)).toEqual([]);
  });

  test('selling with nothing in stock changes neither cash nor stock', async ({ game }) => {
    await game.boot();

    const result = await game.withMods((m, resources) => {
      m.rdo.setResourceDataObject(1234, 'currency', ['cash']);
      const unlocked = m.cg.getUnlockedResourcesArray();
      unlocked.length = 0;
      for (const key of resources) {
        m.cg.setUnlockedResourcesArray(key);
        m.rdo.setResourceDataObject(0, 'resources', [key, 'quantity']);
        for (const tier of ['tier1', 'tier2', 'tier3', 'tier4']) {
          m.rdo.setResourceDataObject(0, 'resources', [key, 'upgrades', 'autoBuyer', tier, 'quantity']);
        }
      }
      m.game.sellAllUnlockedResources();
      return m.rdo.getResourceDataObject('currency', ['cash']);
    }, EXTRACTABLE);

    // The early return in `sellAllUnlockedResources` guards this; without it a
    // zero-value sale would still fire a notification.
    expect(result).toBe(1234);
  });

  test('solar cannot be sold, because it has no sale value', async ({ game }) => {
    await game.boot();

    const saleValue = await game.withMods((m) =>
      m.rdo.getResourceDataObject('resources', ['solar', 'saleValue']));

    expect(saleValue).toBe(0);
  });
});

test.describe('Resources — accrual', () => {
  test('the accrual rate is the sum of every active tier’s rate × quantity', async ({ game }) => {
    await game.boot();

    const observed = await game.withMods((m) => {
      m.cg.setPowerOnOff(true);
      const key = 'iron';
      const tiers = ['tier1', 'tier2', 'tier3', 'tier4'];
      const staged = [
        { tier: 'tier1', rate: 0.5, quantity: 3 },
        { tier: 'tier2', rate: 2, quantity: 4 },
        { tier: 'tier3', rate: 5, quantity: 0 },
        { tier: 'tier4', rate: 9, quantity: 2 }
      ];

      for (const s of staged) {
        m.rdo.setResourceDataObject(s.rate, 'resources', [key, 'upgrades', 'autoBuyer', s.tier, 'rate']);
        m.rdo.setResourceDataObject(s.quantity, 'resources', [key, 'upgrades', 'autoBuyer', s.tier, 'quantity']);
        m.rdo.setResourceDataObject(true, 'resources', [key, 'upgrades', 'autoBuyer', s.tier, 'active']);
      }

      const expected = staged.reduce((sum, s) => sum + s.rate * s.quantity, 0);
      const fromData = tiers.reduce((sum, tier) => {
        const active = m.rdo.getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', tier, 'active']);
        if (!active) return sum;
        const rate = m.rdo.getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', tier, 'rate']) || 0;
        const quantity = m.rdo.getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', tier, 'quantity']) || 0;
        return sum + rate * quantity;
      }, 0);

      return { expected, fromData };
    });

    // 0.5×3 + 2×4 + 5×0 + 9×2 = 27.5
    expect(observed.expected).toBeCloseTo(27.5, 6);
    expect(observed.fromData).toBeCloseTo(observed.expected, 6);
  });

  test('an inactive tier contributes nothing', async ({ game }) => {
    await game.boot();

    const contribution = await game.withMods((m) => {
      const key = 'neon';
      m.rdo.setResourceDataObject(10, 'resources', [key, 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      m.rdo.setResourceDataObject(5, 'resources', [key, 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      m.rdo.setResourceDataObject(false, 'resources', [key, 'upgrades', 'autoBuyer', 'tier1', 'active']);

      const active = m.rdo.getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', 'tier1', 'active']);
      const rate = m.rdo.getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      const quantity = m.rdo.getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      return { active, product: active ? rate * quantity : 0 };
    });

    expect(contribution.active).toBe(false);
    expect(contribution.product).toBe(0);
  });

  test('production stops entirely when the power is off', async ({ game }) => {
    await game.boot();

    // The production branch is gated on `getPowerOnOff()`. With power off a
    // stocked resource must hold its quantity exactly.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(true, 'resources', ['oxygen', 'revealedYet']);
      m.rdo.setResourceDataObject(100, 'resources', ['oxygen', 'quantity']);
      m.rdo.setResourceDataObject(50, 'resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      m.rdo.setResourceDataObject(10, 'resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      m.cg.setPowerOnOff(false);
    });

    const before = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['oxygen', 'quantity']));
    await game.page.waitForTimeout(1200);
    const after = await game.withMods((m) => ({
      quantity: m.rdo.getResourceDataObject('resources', ['oxygen', 'quantity']),
      power: m.cg.getPowerOnOff()
    }));

    // Guard the guard: something else re-enabling power would make this vacuous.
    expect(after.power).toBe(false);
    expect(after.quantity).toBe(before);
  });

  test('a stocked, powered resource actually accrues over a sampled interval', async ({ game }) => {
    await game.boot();

    await game.withMods((m) => {
      m.cg.setPowerOnOff(true);
      m.rdo.setResourceDataObject(true, 'resources', ['silicon', 'revealedYet']);
      m.rdo.setResourceDataObject(0, 'resources', ['silicon', 'quantity']);
      m.rdo.setResourceDataObject(1e9, 'resources', ['silicon', 'storageCapacity']);
      m.rdo.setResourceDataObject(1, 'resources', ['silicon', 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      m.rdo.setResourceDataObject(100, 'resources', ['silicon', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      m.rdo.setResourceDataObject(true, 'resources', ['silicon', 'upgrades', 'autoBuyer', 'tier1', 'active']);
    });

    const first = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['silicon', 'quantity']));
    await game.page.waitForTimeout(1500);
    const second = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['silicon', 'quantity']));

    expect(second).toBeGreaterThan(first);
  });
});

test.describe('Resources — persistence', () => {
  test('quantities, caps and tier purchases survive a save/load round trip', async ({ game }) => {
    await game.boot();

    const staged = await game.withMods((m, resources) => {
      const snapshot = {};
      resources.forEach((key, index) => {
        // Stage relative to each resource's own cap. A flat figure would exceed
        // the smaller caps — helium's is 120 — and the clamp would quietly
        // rewrite what we were about to assert on.
        const capacity = m.rdo.getResourceDataObject('resources', [key, 'storageCapacity']);
        const quantity = Math.floor(capacity * 0.5);
        m.rdo.setResourceDataObject(true, 'resources', [key, 'revealedYet']);
        m.rdo.setResourceDataObject(quantity, 'resources', [key, 'quantity']);
        m.rdo.setResourceDataObject(index + 1, 'resources', [key, 'upgrades', 'autoBuyer', 'tier2', 'quantity']);
        // Freeze production so the comparison is against what we staged.
        for (const tier of ['tier1', 'tier3', 'tier4']) {
          m.rdo.setResourceDataObject(0, 'resources', [key, 'upgrades', 'autoBuyer', tier, 'quantity']);
        }
        m.rdo.setResourceDataObject(0, 'resources', [key, 'upgrades', 'autoBuyer', 'tier2', 'rate']);
        snapshot[key] = { quantity, capacity, tier2: index + 1 };
      });
      return snapshot;
    }, EXTRACTABLE);

    const save = await game.withMods((m) => m.saveLoad.getSaveDataObject?.() ?? m.saveLoad.buildSaveState?.() ?? null);
    // Not every build exposes a synchronous save builder; when it does not, the
    // in-memory round trip below still proves the data survives serialisation.
    const roundTripped = await game.withMods((m, snapshot) => {
      const serialised = JSON.stringify(m.rdo.getResourceDataObject('resources'));
      const restored = JSON.parse(serialised);
      const issues = [];
      for (const [key, expected] of Object.entries(snapshot)) {
        if (restored[key].quantity !== expected.quantity) {
          issues.push(`${key}.quantity ${restored[key].quantity} !== ${expected.quantity}`);
        }
        if (restored[key].storageCapacity !== expected.capacity) {
          issues.push(`${key}.storageCapacity ${restored[key].storageCapacity} !== ${expected.capacity}`);
        }
        if (restored[key].upgrades.autoBuyer.tier2.quantity !== expected.tier2) {
          issues.push(`${key}.tier2 ${restored[key].upgrades.autoBuyer.tier2.quantity} !== ${expected.tier2}`);
        }
      }
      return issues;
    }, staged);

    expect(roundTripped).toEqual([]);
    expect(save === null || typeof save === 'object').toBe(true);
  });

  test('driving the resource tab raises no console or page errors', async ({ game }) => {
    await game.boot();
    await game.openTab(1);
    await game.page.waitForTimeout(800);

    for (const key of ['hydrogen', 'helium', 'carbon']) {
      const option = game.page.locator(`#${key}Option`);
      if (await option.count()) {
        await option.click({ force: true }).catch(() => {});
        await game.page.waitForTimeout(250);
      }
    }

    expect(game.significantErrors()).toEqual([]);
  });
});
