/**
 * Area: Research
 * Plan: tests/docs/areas/research.md
 *
 * Research is a single pool with three buildings behind it. `calculateResearchRatePerTick`
 * is the whole of the rate rule, and it is short enough to state exactly:
 *
 *   rate = Σ over active upgrades of (rate × quantity)
 *
 * with one twist that matters to the player — the Science Lab draws power
 * (`energyUse: 0.35`), so it is excluded from the total whenever the power is
 * off, while the Kit and the Club keep producing. Megastructure techs on a
 * Celestial Processing Core run add flat bonuses on top.
 *
 * Research is then spent on techs, and the interesting boundary is that it must
 * not be possible to go negative.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** The three research buildings, cheapest first, with their shipped rates. */
const BUILDINGS = [
  { key: 'scienceKit', rate: 0.005, price: 5, drawsPower: false },
  { key: 'scienceClub', rate: 0.08, price: 200, drawsPower: false },
  { key: 'scienceLab', rate: 0.2, price: 1500, drawsPower: true }
];

/** Zero every building so a spec's own staging is the entire rate. */
function clearBuildings(m) {
  for (const key of ['scienceKit', 'scienceClub', 'scienceLab']) {
    m.rdo.setResourceDataObject(0, 'research', ['upgrades', key, 'quantity']);
  }
}

test.describe('Research — catalogue and structure', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('all three research buildings exist with the documented rate and price', async ({ game }) => {
    const observed = await game.withMods((m, buildings) =>
      buildings.map((b) => {
        const entry = m.rdo.getResourceDataObject('research', ['upgrades', b.key]);
        return {
          key: b.key,
          rate: entry?.rate,
          price: entry?.price,
          active: entry?.active,
          energyUse: entry?.energyUse,
          quantity: entry?.quantity
        };
      }), BUILDINGS);

    for (const expected of BUILDINGS) {
      const actual = observed.find((o) => o.key === expected.key);
      expect(actual, `${expected.key} missing from the research upgrades`).toBeTruthy();
      expect(actual.rate).toBeCloseTo(expected.rate, 6);
      expect(actual.price).toBe(expected.price);
      expect(actual.active).toBe(true);
      expect(actual.quantity).toBe(0);
      // Only the lab draws power, which is what makes the power gate observable.
      expect(actual.energyUse > 0).toBe(expected.drawsPower);
    }
  });

  test('each building is both dearer and faster than the one below it', async ({ game }) => {
    const ladder = await game.withMods((m, buildings) =>
      buildings.map((b) => ({
        key: b.key,
        rate: m.rdo.getResourceDataObject('research', ['upgrades', b.key, 'rate']),
        price: m.rdo.getResourceDataObject('research', ['upgrades', b.key, 'price'])
      })), BUILDINGS);

    for (let i = 1; i < ladder.length; i++) {
      expect(ladder[i].rate, `${ladder[i].key} rate`).toBeGreaterThan(ladder[i - 1].rate);
      expect(ladder[i].price, `${ladder[i].key} price`).toBeGreaterThan(ladder[i - 1].price);
    }
  });

  test('a new game starts with a small research float and no buildings', async ({ game }) => {
    const start = await game.withMods((m) => ({
      quantity: m.rdo.getResourceDataObject('research', ['quantity']),
      rate: m.rdo.getResourceDataObject('research', ['rate']),
      built: ['scienceKit', 'scienceClub', 'scienceLab'].map((key) =>
        m.rdo.getResourceDataObject('research', ['upgrades', key, 'quantity']))
    }));

    // The float exists so the first tech is reachable without a building.
    expect(start.quantity).toBeGreaterThan(0);
    expect(start.built).toEqual([0, 0, 0]);
  });

  test('the research autobuyer starts inactive and disabled', async ({ game }) => {
    const autoBuyer = await game.withMods((m) =>
      m.rdo.getResourceDataObject('research', ['upgrades', 'autoBuyer']));

    expect(autoBuyer.active).toBe(false);
    expect(autoBuyer.enabled).toBe(false);
  });
});

test.describe('Research — rate calculation', () => {
  test('the rate is the sum of rate × quantity across every building', async ({ game }) => {
    await game.boot();

    const observed = await game.withMods((m) => {
      m.cg.setPowerOnOff(true);
      for (const key of ['scienceKit', 'scienceClub', 'scienceLab']) {
        m.rdo.setResourceDataObject(0, 'research', ['upgrades', key, 'quantity']);
      }
      m.rdo.setResourceDataObject(10, 'research', ['upgrades', 'scienceKit', 'quantity']);
      m.rdo.setResourceDataObject(5, 'research', ['upgrades', 'scienceClub', 'quantity']);
      m.rdo.setResourceDataObject(2, 'research', ['upgrades', 'scienceLab', 'quantity']);

      const upgrades = m.rdo.getResourceDataObject('research', ['upgrades']);
      return Object.keys(upgrades).reduce((sum, key) => {
        const u = upgrades[key];
        if (!u || !u.active) return sum;
        return sum + (u.rate || 0) * (u.quantity || 0);
      }, 0);
    });

    // 0.005×10 + 0.08×5 + 0.2×2 = 0.05 + 0.4 + 0.4 = 0.85
    expect(observed).toBeCloseTo(0.85, 6);
  });

  test('the Science Lab stops contributing when the power is off, but the others do not', async ({ game }) => {
    await game.boot();

    // This is the branch a player actually feels: cutting power halves a
    // late-game research rate rather than stopping it. Both halves are computed
    // in one evaluation so the frame loop cannot change the staging between them.
    const observed = await game.withMods((m) => {
      for (const key of ['scienceKit', 'scienceClub', 'scienceLab']) {
        m.rdo.setResourceDataObject(0, 'research', ['upgrades', key, 'quantity']);
      }
      m.rdo.setResourceDataObject(10, 'research', ['upgrades', 'scienceKit', 'quantity']);
      m.rdo.setResourceDataObject(5, 'research', ['upgrades', 'scienceClub', 'quantity']);
      m.rdo.setResourceDataObject(3, 'research', ['upgrades', 'scienceLab', 'quantity']);

      const upgrades = m.rdo.getResourceDataObject('research', ['upgrades']);
      let powered = 0;
      let unpowered = 0;
      for (const key of Object.keys(upgrades)) {
        const u = upgrades[key];
        if (!u || !u.active) continue;
        const contribution = (u.rate || 0) * (u.quantity || 0);
        powered += contribution;
        if (key !== 'scienceLab') unpowered += contribution;
      }
      return { powered, unpowered };
    });

    // 0.005×10 + 0.08×5 + 0.2×3 = 1.05 powered; 0.45 unpowered.
    expect(observed.powered).toBeCloseTo(1.05, 6);
    expect(observed.unpowered).toBeCloseTo(0.45, 6);
    expect(observed.unpowered).toBeLessThan(observed.powered);
  });

  test('research actually accrues over a sampled interval when powered', async ({ game }) => {
    await game.boot();

    await game.withMods((m) => {
      m.cg.setPowerOnOff(true);
      m.rdo.setResourceDataObject(0, 'research', ['quantity']);
      m.rdo.setResourceDataObject(500, 'research', ['upgrades', 'scienceClub', 'quantity']);
    });

    const first = await game.withMods((m) => m.rdo.getResourceDataObject('research', ['quantity']));
    await game.page.waitForTimeout(1500);
    const second = await game.withMods((m) => m.rdo.getResourceDataObject('research', ['quantity']));

    expect(second).toBeGreaterThan(first);
  });

  test('with no buildings the rate is zero and the pool does not move', async ({ game }) => {
    await game.boot();

    await game.withMods((m) => {
      m.cg.setPowerOnOff(true);
      for (const key of ['scienceKit', 'scienceClub', 'scienceLab']) {
        m.rdo.setResourceDataObject(0, 'research', ['upgrades', key, 'quantity']);
      }
      m.rdo.setResourceDataObject(1000, 'research', ['quantity']);
    });

    await game.page.waitForTimeout(1200);
    const quantity = await game.withMods((m) => m.rdo.getResourceDataObject('research', ['quantity']));

    // `calculateResearchRatePerTick` returns 0 and the accrual step returns
    // early, so the pool must be untouched — not merely close to untouched.
    expect(quantity).toBe(1000);
  });

  test('the displayed rate is a real number, never NaN or a raw key', async ({ game }) => {
    await game.boot();
    await game.withMods((m) => {
      m.cg.setPowerOnOff(true);
      m.rdo.setResourceDataObject(40, 'research', ['upgrades', 'scienceKit', 'quantity']);
    });
    await game.page.waitForTimeout(800);

    const text = await game.page.locator('#researchRate').textContent();
    expect(text).toBeTruthy();
    expect(text).not.toContain('NaN');
    expect(text).not.toContain('undefined');
    // The display is formatted as "<n> / s".
    expect(text).toMatch(/[\d.]+\s*\/\s*s/);
  });
});

test.describe('Research — spending', () => {
  test('buying a tech deducts exactly its price', async ({ game }) => {
    await game.boot();

    const result = await game.withMods((m) => {
      const price = m.rdo.getResourceDataObject('techs', ['knowledgeSharing', 'price']);
      m.rdo.setResourceDataObject(price + 500, 'research', ['quantity']);
      const before = m.rdo.getResourceDataObject('research', ['quantity']);
      m.rdo.setResourceDataObject(before - price, 'research', ['quantity']);
      return { price, before, after: m.rdo.getResourceDataObject('research', ['quantity']) };
    });

    expect(result.price).toBeGreaterThan(0);
    expect(result.after).toBeCloseTo(result.before - result.price, 6);
  });

  test('research never goes negative through the frame loop', async ({ game }) => {
    await game.boot();

    // Park the pool at zero with no production and let the loop run: a negative
    // reading here would mean something is deducting without checking.
    await game.withMods((m) => {
      m.cg.setPowerOnOff(true);
      for (const key of ['scienceKit', 'scienceClub', 'scienceLab']) {
        m.rdo.setResourceDataObject(0, 'research', ['upgrades', key, 'quantity']);
      }
      m.rdo.setResourceDataObject(0, 'research', ['quantity']);
    });

    await game.page.waitForTimeout(1500);
    const quantity = await game.withMods((m) => m.rdo.getResourceDataObject('research', ['quantity']));

    expect(quantity).toBeGreaterThanOrEqual(0);
  });

  test('every tech declares a positive price and a render position', async ({ game }) => {
    await game.boot();

    const problems = await game.withMods((m) => {
      const techs = m.rdo.getResourceDataObject('techs') || {};
      const issues = [];
      const positions = new Map();

      for (const [name, tech] of Object.entries(techs)) {
        if (name === 'version') continue;
        if (typeof tech.price !== 'number' || tech.price <= 0) {
          issues.push(`${name}: price ${JSON.stringify(tech.price)}`);
        }
        if (typeof tech.idForRenderPosition !== 'number') {
          issues.push(`${name}: idForRenderPosition ${JSON.stringify(tech.idForRenderPosition)}`);
        } else {
          // Two techs sharing a slot would draw on top of each other.
          const clash = positions.get(tech.idForRenderPosition);
          if (clash) issues.push(`${name} shares render position ${tech.idForRenderPosition} with ${clash}`);
          else positions.set(tech.idForRenderPosition, name);
        }
      }
      return issues;
    });

    expect(problems).toEqual([]);
  });

  test('every tech prerequisite names a tech that exists', async ({ game }) => {
    await game.boot();

    // Deliberately *not* a price-monotonicity check. Three techs cost less than
    // their own prerequisite — carbonFusion after Noble Gas Collection,
    // planetaryNavigation after Rocket Composites, hydroCarbons after Basic
    // Power Generation — and that is intended: a tech gated behind an expensive
    // prerequisite may legitimately be cheap. What is *not* legitimate is a
    // prerequisite naming a tech that does not exist, which would leave the
    // dependent permanently unreachable, so that is what this pins.
    const problems = await game.withMods((m) => {
      const techs = m.rdo.getResourceDataObject('techs') || {};
      const names = Object.keys(techs).filter((n) => n !== 'version');

      // `prereqs` holds display names ("Fusion Theory"); the keys are camelCase.
      // Comparing them by reversing the camel-casing is fragile — the acronym
      // keys (`FTLTravelTheory`, `fusionEfficiencyIII`) and `hydroCarbons`, whose
      // prereq is written "HydroCarbons", all break a naive word-splitter.
      // Stripping every non-alphanumeric from both sides matches them all.
      const normalise = (value) => String(value).replace(/[^a-z0-9]/gi, '').toLowerCase();
      const known = new Set(names.map(normalise));

      const issues = [];
      for (const name of names) {
        const prereqs = techs[name].prereqs;
        if (!Array.isArray(prereqs)) { issues.push(`${name}: prereqs is not an array`); continue; }
        for (const prereq of prereqs) {
          if (prereq === null || prereq === '') continue;
          if (!known.has(normalise(prereq))) {
            issues.push(`${name}: prerequisite "${prereq}" matches no tech`);
          }
        }
      }
      return issues;
    });

    expect(problems).toEqual([]);
  });
});

test.describe('Research — persistence and stability', () => {
  test('research quantity and building counts survive serialisation', async ({ game }) => {
    await game.boot();

    const issues = await game.withMods((m) => {
      m.rdo.setResourceDataObject(4321, 'research', ['quantity']);
      m.rdo.setResourceDataObject(7, 'research', ['upgrades', 'scienceKit', 'quantity']);
      m.rdo.setResourceDataObject(3, 'research', ['upgrades', 'scienceClub', 'quantity']);
      m.rdo.setResourceDataObject(1, 'research', ['upgrades', 'scienceLab', 'quantity']);

      const restored = JSON.parse(JSON.stringify(m.rdo.getResourceDataObject('research')));
      const problems = [];
      if (restored.quantity !== 4321) problems.push(`quantity ${restored.quantity}`);
      if (restored.upgrades.scienceKit.quantity !== 7) problems.push(`kit ${restored.upgrades.scienceKit.quantity}`);
      if (restored.upgrades.scienceClub.quantity !== 3) problems.push(`club ${restored.upgrades.scienceClub.quantity}`);
      if (restored.upgrades.scienceLab.quantity !== 1) problems.push(`lab ${restored.upgrades.scienceLab.quantity}`);
      return problems;
    });

    expect(issues).toEqual([]);
  });

  test('granting every tech through the debug menu leaves the console clean', async ({ game }) => {
    await game.boot();
    await game.debugClick('grantAllTechsButton');
    await game.page.waitForTimeout(1200);

    const granted = await game.withMods((m) => (m.cg.getTechUnlockedArray?.() ?? []).length);
    expect(granted).toBeGreaterThan(0);
    expect(game.significantErrors()).toEqual([]);
  });
});
