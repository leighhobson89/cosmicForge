/**
 * Area: Autosell — sharing a resource between competing compounds
 * Plan: docs/player-feedback-improvement-plan.md, P9
 *
 * ## The bug this replaces
 *
 * Compound auto-create drew from ingredient **stock**, with a zero buffer,
 * inside each compound's own delta timer:
 *
 *     const amountToCreateArray = calculateCreatableCompoundAmount(compound, { buffer: 0 });
 *
 * Six of the eight resources feed more than one recipe — hydrogen feeds diesel,
 * concrete and water; sodium feeds glass, concrete and titanium; iron feeds steel
 * and titanium. Whichever compound's timer fired first emptied the shared
 * ingredient to zero, and the ones after it created nothing. There was no
 * arbitration anywhere in the code, so which compound won was decided by timer
 * registration order.
 *
 * It also force-disabled autosell on every ingredient, every frame:
 *
 *     resources.forEach(resourceName => {
 *         setResourceDataObject(false, 'resources', [resourceName, 'autoSell']);
 *     });
 *
 * — so a player's click on those toggles was reverted within a frame, with no
 * explanation, and the two automations were hard-exclusive.
 *
 * ## The rule these specs pin
 *
 * A resource's compound allocation is split **equally** between however many
 * auto-creating compounds draw on it, and a compound that cannot use its whole
 * share **does not pass the surplus on** — it falls through to the resource's own
 * store.
 *
 * Equal-with-fall-through was chosen over demand-proportional deliberately, and
 * spec 3 is the one that pins the choice: a compound's throughput depends only on
 * its own settings and the resource sliders, never on what an unrelated compound
 * is doing. A proportional implementation passes specs 1, 2, 4 and 5 and fails 3.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe.configure({ timeout: 300_000 });

async function buyAllocationCapability(game) {
  await game.debugClick('add100ApButton');
  await game.page.waitForTimeout(200);
  await game.withMods((m) => m.game.purchaseBuff('nanoBrokers'));
  await game.page.waitForTimeout(150);
  await game.withMods((m) => m.game.purchaseBuff('nanoBrokers'));
  await game.page.waitForTimeout(300);
  await game.page.evaluate(() => {
    const confirm = document.getElementById('modalConfirm');
    const modal = document.getElementById('modal');
    if (confirm && modal && getComputedStyle(modal).display !== 'none') confirm.click();
  });
  await game.page.waitForTimeout(200);
}

/**
 * Stage the shared-ingredient scenario: iron feeding both steel and titanium.
 *
 * Every other ingredient is made deliberately abundant so that the only scarce
 * thing in the system is the one under test. A spec that leaves two bottlenecks
 * in play cannot tell you which one it measured.
 */
async function stageIronContention(game, { ironRate = 1000, ironShare = 50 } = {}) {
  await game.withMods((m, cfg) => {
    m.cg.setPowerOnOff(true);
    m.cg.setInfinitePower(true);

    for (const resource of ['iron', 'carbon', 'sodium', 'neon']) {
      m.rdo.setResourceDataObject(1e9, 'resources', [resource, 'storageCapacity']);
      m.rdo.setResourceDataObject(resource === 'iron' ? 0 : 1e8, 'resources', [resource, 'quantity']);
      m.rdo.setResourceDataObject(1, 'resources', [resource, 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      m.rdo.setResourceDataObject(resource === 'iron' ? cfg.ironRate : 1e6, 'resources', [resource, 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      m.rdo.setResourceDataObject(true, 'resources', [resource, 'upgrades', 'autoBuyer', 'tier1', 'active']);
      m.rdo.setResourceDataObject(0, 'resources', [resource, 'cashShare']);
      m.rdo.setResourceDataObject(resource === 'iron' ? cfg.ironShare : 100, 'resources', [resource, 'compoundShare']);
    }

    for (const compound of ['steel', 'titanium']) {
      m.rdo.setResourceDataObject(1e9, 'compounds', [compound, 'storageCapacity']);
      m.rdo.setResourceDataObject(0, 'compounds', [compound, 'quantity']);
      m.rdo.setResourceDataObject(true, 'compounds', [compound, 'autoCreate']);
      // A compound gains quantity two ways - its own autobuyer tiers, and
      // auto-creation from ingredients. Only the second is under test, so the
      // tiers are silenced; leaving them running puts a trickle of unrelated
      // production into every figure this file measures.
      for (const tier of ['tier1', 'tier2', 'tier3', 'tier4']) {
        m.rdo.setResourceDataObject(0, 'compounds', [compound, 'upgrades', 'autoBuyer', tier, 'quantity']);
        m.rdo.setResourceDataObject(false, 'compounds', [compound, 'upgrades', 'autoBuyer', tier, 'active']);
      }
    }
  }, { ironRate, ironShare });
}

const compoundQuantities = (game, compounds) => game.withMods((m, keys) =>
  Object.fromEntries(keys.map(key => [key, m.rdo.getResourceDataObject('compounds', [key, 'quantity'])])),
  compounds);

test.describe('Autosell — compounds sharing an ingredient', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await buyAllocationCapability(game);
  });

  test('1. both compounds create — neither is starved by the other', async ({ game }) => {
    // Against the pre-P9 build one of these two is exactly zero, decided by
    // which timer fired first. That is the baseline this spec records.
    await stageIronContention(game);

    const before = await compoundQuantities(game, ['steel', 'titanium']);
    await game.advanceTimers(6_000);
    const after = await compoundQuantities(game, ['steel', 'titanium']);

    expect(after.steel - before.steel, 'steel must be creating').toBeGreaterThan(0);
    expect(after.titanium - before.titanium, 'and titanium must be creating too').toBeGreaterThan(0);
  });

  test('2. the split is equal, not proportional to what each recipe wants', async ({ game }) => {
    // Steel wants 4 iron per unit, titanium 22. An equal split gives each half
    // of iron's compound allocation regardless, so steel makes 22/4 = 5.5 times
    // as many units as titanium does. A demand-proportional split would instead
    // equalise their *rates*, and fails here.
    await stageIronContention(game);

    const before = await compoundQuantities(game, ['steel', 'titanium']);
    await game.advanceTimers(8_000);
    const after = await compoundQuantities(game, ['steel', 'titanium']);

    const steelMade = after.steel - before.steel;
    const titaniumMade = after.titanium - before.titanium;

    expect(steelMade, 'steel is creating').toBeGreaterThan(0);
    expect(titaniumMade, 'titanium is creating').toBeGreaterThan(0);
    expect(steelMade / titaniumMade, 'equal iron, so unit counts follow the inverse ratio of the recipes')
      .toBeCloseTo(22 / 4, 0);
  });

  test('3. a surplus falls through to storage, and does NOT reach the other compound', async ({ game }) => {
    // The defining property of the equal-split choice. Steel is capped so it can
    // take almost nothing of its half; titanium's rate must be unchanged by that,
    // and the iron steel did not use must be sitting in the iron store.
    await stageIronContention(game);

    const withBothHungry = await (async () => {
      const before = await compoundQuantities(game, ['titanium']);
      await game.advanceTimers(6_000);
      const after = await compoundQuantities(game, ['titanium']);
      return after.titanium - before.titanium;
    })();

    // Now leave steel with essentially no room, so its half of the iron goes
    // unspent. Under a redistributing split titanium would speed up.
    await game.withMods((m) => {
      const steel = m.rdo.getResourceDataObject('compounds', ['steel', 'quantity']);
      m.rdo.setResourceDataObject(steel, 'compounds', ['steel', 'storageCapacity']);
    });

    const ironBefore = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['iron', 'quantity']));
    const before = await compoundQuantities(game, ['titanium']);
    await game.advanceTimers(6_000);
    const after = await compoundQuantities(game, ['titanium']);
    const ironAfter = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['iron', 'quantity']));

    const withSteelFull = after.titanium - before.titanium;

    expect(withSteelFull / withBothHungry, "titanium's rate must not change because steel stopped")
      .toBeCloseTo(1, 1);
    expect(ironAfter, "and steel's unused half must be accumulating as iron").toBeGreaterThan(ironBefore);
  });

  test('4. the compound share is a ceiling the draw never exceeds', async ({ game }) => {
    await stageIronContention(game, { ironShare: 30 });

    const before = await game.withMods((m) => ({
      iron: m.rdo.getResourceDataObject('resources', ['iron', 'quantity'])
    }));
    await game.advanceTimers(6_000);
    const after = await game.withMods((m) => ({
      iron: m.rdo.getResourceDataObject('resources', ['iron', 'quantity']),
      breakdown: m.game.getAllocationBreakdown('resources', 'iron')
    }));

    expect(after.breakdown.toCompounds, 'the draw never exceeds the ceiling')
      .toBeLessThanOrEqual(after.breakdown.compoundCeiling + 1e-6);
    // 70% is not on offer to compounds, so iron must be climbing regardless of
    // how hungry the two recipes are.
    expect(after.iron, 'the unoffered 70% accumulates').toBeGreaterThan(before.iron);
  });

  test('5. an unused ceiling becomes storage, never cash', async ({ game }) => {
    await stageIronContention(game, { ironShare: 50 });
    await game.withMods((m) => {
      // Nothing is drawing on iron at all now.
      m.rdo.setResourceDataObject(false, 'compounds', ['steel', 'autoCreate']);
      m.rdo.setResourceDataObject(false, 'compounds', ['titanium', 'autoCreate']);
    });

    const before = await game.withMods((m) => ({
      iron: m.rdo.getResourceDataObject('resources', ['iron', 'quantity'])
    }));
    await game.advanceTimers(5_000);
    const after = await game.withMods((m) => ({
      iron: m.rdo.getResourceDataObject('resources', ['iron', 'quantity']),
      // The claim is about autosell, not about the player's balance - other
      // systems in the game move cash too, and asserting on the total would make
      // this spec fail for reasons that have nothing to do with allocation.
      autoSellIncome: m.game.getAutoSellIncomePerSecond()
    }));

    expect(after.iron, 'the whole ceiling falls through to storage').toBeGreaterThan(before.iron);
    expect(after.autoSellIncome, 'and none of it is quietly turned into money').toBeCloseTo(0, 3);
  });

  test('6. a compound bottlenecked elsewhere returns the ingredients it cannot use', async ({ game }) => {
    // Titanium needs iron, sodium and neon. Starve its neon: it must throttle to
    // the neon bound, and the iron and sodium it could not use must stay in
    // their own stores rather than being consumed and lost.
    await stageIronContention(game);
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(false, 'compounds', ['steel', 'autoCreate']);
      m.rdo.setResourceDataObject(0, 'resources', ['neon', 'quantity']);
      // The autobuyer has to be switched off, not merely set to a zero rate: a
      // B-type star adds a flat per-tier boost on top of the rate, so a machine
      // that is still owned and active goes on producing a trickle from nothing.
      m.rdo.setResourceDataObject(0, 'resources', ['neon', 'upgrades', 'autoBuyer', 'tier1', 'rate']);
      m.rdo.setResourceDataObject(0, 'resources', ['neon', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      m.rdo.setResourceDataObject(false, 'resources', ['neon', 'upgrades', 'autoBuyer', 'tier1', 'active']);
    });

    const before = await game.withMods((m) => ({
      iron: m.rdo.getResourceDataObject('resources', ['iron', 'quantity']),
      sodium: m.rdo.getResourceDataObject('resources', ['sodium', 'quantity']),
      titanium: m.rdo.getResourceDataObject('compounds', ['titanium', 'quantity'])
    }));
    await game.advanceTimers(5_000);
    const after = await game.withMods((m) => ({
      iron: m.rdo.getResourceDataObject('resources', ['iron', 'quantity']),
      sodium: m.rdo.getResourceDataObject('resources', ['sodium', 'quantity']),
      titanium: m.rdo.getResourceDataObject('compounds', ['titanium', 'quantity']),
      createRate: m.rdo.getResourceDataObject('compounds', ['titanium', 'autoCreateRatePerSecondSmoothed'], true),
      throttledBy: m.rdo.getResourceDataObject('compounds', ['titanium', 'autoCreateThrottledBy'], true)
    }));

    expect(after.createRate, 'with no neon, auto-creation stops').toBeCloseTo(0, 3);
    expect(after.titanium - before.titanium, 'so no titanium is created').toBeCloseTo(0, 3);
    expect(after.iron, 'so the iron it could not use keeps accumulating').toBeGreaterThan(before.iron);
    expect(after.sodium, 'and so does the sodium').toBeGreaterThan(before.sodium);
    expect(after.throttledBy, 'and the game records which ingredient stopped it').toBe('neon');
  });

  test('7. auto-create no longer overwrites an ingredient’s allocation', async ({ game }) => {
    // The direct regression test for the every-frame `autoSell = false` loop:
    // set an ingredient's share while its consumer is auto-creating, and it must
    // still be exactly that several seconds later. The on/off flag the old loop
    // stamped on is gone with the toggle, so the share itself is the thing that
    // has to survive.
    await stageIronContention(game);
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(25, 'resources', ['carbon', 'cashShare']);
    });

    await game.advanceTimers(4_000);

    const after = await game.withMods((m) => ({
      cash: m.rdo.getResourceDataObject('resources', ['carbon', 'cashShare'], true),
      compound: m.rdo.getResourceDataObject('resources', ['carbon', 'compoundShare'], true)
    }));

    expect(after.cash, 'auto-creating steel must not reset the share the player chose').toBe(25);
    expect(after.compound, 'nor the compound band beside it').toBe(100);
  });

  test('8. the outcome does not depend on which timer fired first', async ({ game }) => {
    // Run the same contention twice from a clean stage. Under the old model the
    // winner was whichever compound's timer was registered first; under one
    // arbitrated pass the ratio is a property of the recipes and is stable.
    const measure = async () => {
      await stageIronContention(game);
      const before = await compoundQuantities(game, ['steel', 'titanium']);
      await game.advanceTimers(6_000);
      const after = await compoundQuantities(game, ['steel', 'titanium']);
      return (after.steel - before.steel) / (after.titanium - before.titanium);
    };

    const first = await measure();
    const second = await measure();

    expect(second / first, 'the same scenario must give the same answer twice').toBeCloseTo(1, 1);
  });
});
