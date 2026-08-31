/**
 * Area: Autosell — production allocation, the core model
 * Plan: docs/player-feedback-improvement-plan.md, P9
 *
 * From a player reviewer, on why autosell was unusable:
 *
 *   "I want autosell to never prevent me from increasing my resources, with rare
 *    exceptions. The need, I feel, is to choose the ratio of resource spending, so
 *    basically I want 90% of future gains to go make $, and 10% increasing
 *    resources so that I don't have anything to do until it reaches max. I just
 *    choose how to prioritize, not lose one to get the other."
 *
 * ## What was actually wrong
 *
 * Autosell did not sell production. It sold *stock*, down to a hardcoded 100
 * units, every frame, forever:
 *
 *     if (updatedQuantity > 100) {
 *         setResourceDataObject(100, 'resources', [resource, 'quantity']);
 *         processAutoSell(resource, updatedQuantity - 100, 'resources');
 *     }
 *
 * So switching it on did not divert a share of income — it liquidated the store
 * and pinned it at a hundred units. Autosell and accumulation were mutually
 * exclusive, with no dial between them, which is exactly the complaint.
 *
 * ## The model these specs pin
 *
 * A material's gross production for the tick, less what the power plants burned
 * of it, is its **allocatable** amount. That is divided in one order and one
 * order only:
 *
 *   1. fuel comes off the top, so a cash setting can never black out the grid;
 *   2. `cashShare` % of what is left is sold — out of the flow, never the store;
 *   3. `compoundShare` % is offered to auto-creating compounds as a **ceiling**;
 *   4. everything else accumulates.
 *
 * ## What would regress first
 *
 * Two things, and they are specs 2 and 3 below:
 *
 * - **Stock must never be drained.** This is the whole complaint in one
 *   assertion, and any reimplementation that reaches for `quantity` instead of
 *   the tick's production will fail it.
 * - **Cash keeps flowing at the cap.** At a full store the bar stops moving but
 *   the money does not, which is the behaviour agreed with the player. The naive
 *   fix — allocate only what the store could accept — silently stops paying the
 *   moment a resource fills, and nothing else here would catch it.
 *
 * Every spec drives the game's own controls where a control exists, and stages
 * state directly only to set preconditions and read results back.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe.configure({ timeout: 300_000 });

/** Nano Brokers level 2: autosell, plus the compound band on the line. */
async function buyAllocationCapability(game, levels = 2) {
  await game.debugClick('add100ApButton');
  await game.page.waitForTimeout(200);
  for (let i = 0; i < levels; i++) {
    await game.withMods((m) => m.game.purchaseBuff('nanoBrokers'));
    await game.page.waitForTimeout(150);
  }
  // Level 2 raises a first-run modal announcing the compound panes; it would sit
  // over anything a later step tries to click.
  await game.page.evaluate(() => {
    const confirm = document.getElementById('modalConfirm');
    const modal = document.getElementById('modal');
    if (confirm && modal && getComputedStyle(modal).display !== 'none') confirm.click();
  });
  await game.page.waitForTimeout(200);
}

/**
 * Give a resource a known, steady production rate and an empty store with room.
 *
 * A tier 1 autobuyer is used deliberately: it runs without power, so a spec
 * about allocation is not also a spec about the grid.
 */
async function stageProduction(game, resource, ratePerTick, { quantity = 0, capacity = 1e9 } = {}) {
  await game.withMods((m, cfg) => {
    m.rdo.setResourceDataObject(cfg.capacity, 'resources', [cfg.resource, 'storageCapacity']);
    m.rdo.setResourceDataObject(cfg.quantity, 'resources', [cfg.resource, 'quantity']);
    m.rdo.setResourceDataObject(1, 'resources', [cfg.resource, 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
    m.rdo.setResourceDataObject(cfg.ratePerTick, 'resources', [cfg.resource, 'upgrades', 'autoBuyer', 'tier1', 'rate']);
    m.rdo.setResourceDataObject(true, 'resources', [cfg.resource, 'upgrades', 'autoBuyer', 'tier1', 'active']);
  }, { resource, ratePerTick, quantity, capacity });
}

async function setAllocation(game, category, key, { cash = 0, compound = 0 }) {
  await game.withMods((m, cfg) => {
    m.rdo.setResourceDataObject(cfg.cash, cfg.category, [cfg.key, 'cashShare']);
    m.rdo.setResourceDataObject(cfg.compound, cfg.category, [cfg.key, 'compoundShare']);
  }, { category, key, ...{ cash, compound } });
}

const read = (game, category, key) => game.withMods((m, cfg) => ({
  quantity: m.rdo.getResourceDataObject(cfg.category, [cfg.key, 'quantity']),
  cash: m.rdo.getResourceDataObject('currency', ['cash']),
  saleValue: m.rdo.getResourceDataObject(cfg.category, [cfg.key, 'saleValue'])
}), { category, key });

test.describe('Autosell — the allocation split', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await buyAllocationCapability(game);
  });

  test('1. the split holds: 10% to cash leaves 90% accumulating', async ({ game }) => {
    await stageProduction(game, 'iron', 100);
    await setAllocation(game, 'resources', 'iron', { cash: 10, compound: 0 });

    // A control leg first: the same resource, nothing sold, so the measurement
    // has a "what would have accumulated anyway" to divide by. Comparing the two
    // legs cancels out both the frame count and any price movement - the market
    // moves `saleValue` during a run, so recovering units sold by dividing cash
    // by the end price silently misreports the split.
    await setAllocation(game, 'resources', 'iron', { cash: 0, compound: 0 });
    const controlBefore = await read(game, 'resources', 'iron');
    await game.advanceTimers(6_000);
    const controlAfter = await read(game, 'resources', 'iron');
    const controlGain = controlAfter.quantity - controlBefore.quantity;

    await setAllocation(game, 'resources', 'iron', { cash: 10, compound: 0 });
    const before = await read(game, 'resources', 'iron');
    await game.advanceTimers(6_000);
    const after = await read(game, 'resources', 'iron');

    const gained = after.quantity - before.quantity;

    expect(controlGain, 'the control leg accumulates').toBeGreaterThan(0);
    expect(gained, 'and so does the measured leg').toBeGreaterThan(0);
    expect(after.cash, 'while cash arrives only on the measured leg').toBeGreaterThan(before.cash);

    // 10% sold leaves 90% accumulating, so the measured leg gains nine tenths of
    // what the control did over the same span.
    expect(gained / controlGain, 'the store keeps 90% of what it would have kept')
      .toBeCloseTo(0.9, 1);
  });

  test('2. stored stock is never drained — the regression test for the whole complaint', async ({ game }) => {
    await stageProduction(game, 'iron', 100, { quantity: 5000 });
    await setAllocation(game, 'resources', 'iron', { cash: 50, compound: 0 });

    // Sampled rather than compared end to end: the old implementation dropped
    // the store to 100 on its first frame and then climbed again from there, so
    // a before/after check alone could be satisfied by the broken behaviour.
    const samples = [];
    for (let i = 0; i < 10; i++) {
      await game.advanceTimers(500);
      samples.push((await read(game, 'resources', 'iron')).quantity);
    }

    const drops = samples.filter((value, i) => i > 0 && value < samples[i - 1] - 1e-6);
    expect(drops, `iron fell during the run: ${JSON.stringify(samples)}`).toEqual([]);
    expect(samples[samples.length - 1], 'and it must be higher than it started').toBeGreaterThan(5000);
  });

  test('3. cash keeps flowing once the store is full', async ({ game }) => {
    // At the cap the bar stops moving and the money does not - the behaviour
    // agreed with the player. An implementation that allocates only what the
    // store could accept passes every other spec here and fails this one.
    await stageProduction(game, 'iron', 100, { quantity: 10_000, capacity: 10_000 });
    await setAllocation(game, 'resources', 'iron', { cash: 30, compound: 0 });

    const before = await read(game, 'resources', 'iron');
    await game.advanceTimers(5_000);
    const after = await read(game, 'resources', 'iron');

    expect(after.quantity, 'the store stays pinned at its cap').toBeCloseTo(10_000, 0);
    // The engine used to allocate against what *fitted* rather than what was
    // produced, so a full store earned nothing while the pane went on quoting a
    // cash rate. Paying on production is what the player was promised.
    expect(after.cash, 'and cash still arrives').toBeGreaterThan(before.cash);
  });

  test('4. fuel comes off the top, so a cash setting cannot black out the grid', async ({ game }) => {
    // Power plant 1 burns **carbon** - `powerPlant1FuelType` in the tick, and
    // the `fuel` tuple on the building. This spec used to stage hydrogen and so
    // never exercised the fuel path at all; it passed because nothing was being
    // burned. With 90% of production going to cash, the burn must still be met
    // in full - the shares divide what is left after fuel, not the gross.
    await stageProduction(game, 'carbon', 500, { quantity: 100_000 });
    await game.withMods((m) => {
      m.cg.setInfinitePower(false);
      m.rdo.setResourceDataObject(2, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
      m.game.toggleBuildingTypeOnOff('powerPlant1', true);
      m.cg.setPowerOnOff(true);
    });
    await setAllocation(game, 'resources', 'carbon', { cash: 90, compound: 0 });

    await game.advanceTimers(5_000);

    const state = await game.withMods((m) => ({
      powerOn: m.cg.getPowerOnOff(),
      carbon: m.rdo.getResourceDataObject('resources', ['carbon', 'quantity']),
      fuel: m.game.getAllocationBreakdown('resources', 'carbon').fuel
    }));

    expect(state.fuel, 'the burn is real, so the test is exercising the fuel path').toBeGreaterThan(0);
    expect(state.powerOn, 'the grid must still be up').toBe(true);
    expect(state.carbon, 'and carbon must not have been sold out from under it').toBeGreaterThan(0);
  });

  test('5. dragging the cash handle back to zero is a true bypass', async ({ game }) => {
    // There is no autosell toggle any more: the slider is always live once the
    // perk is owned, and the storage end of the bar is how a player turns
    // selling off. That has to be a *complete* bypass - not merely a small
    // share - or the control the game now offers as "off" would not be one.
    await stageProduction(game, 'iron', 100);

    // Leg 1: selling half. Leg 2: the same resource with the handle back at
    // zero. Using one resource for both legs means the comparison cannot be
    // thrown off by two materials having different rates or prices.
    await setAllocation(game, 'resources', 'iron', { cash: 50, compound: 0 });
    const onBefore = await read(game, 'resources', 'iron');
    await game.advanceTimers(6_000);
    const onAfter = await read(game, 'resources', 'iron');
    const gainWhileSelling = onAfter.quantity - onBefore.quantity;

    await setAllocation(game, 'resources', 'iron', { cash: 0, compound: 0 });
    const offBefore = await read(game, 'resources', 'iron');
    const incomeBefore = await game.withMods((m) => m.game.getAutoSellIncomePerSecond());
    await game.advanceTimers(6_000);
    const offAfter = await read(game, 'resources', 'iron');
    const gainWhileOff = offAfter.quantity - offBefore.quantity;
    const incomeAfter = await game.withMods((m) => m.game.getAutoSellIncomePerSecond());

    expect(incomeBefore, 'autosell was earning while the handle was at 50%').toBeGreaterThan(0);
    expect(incomeAfter, 'and earns nothing once it is dragged back to zero').toBeCloseTo(0, 3);

    // Everything produced is now kept, so the store gains about twice what it
    // gained while half of production was being sold.
    expect(gainWhileOff / gainWhileSelling, 'the full production rate is restored')
      .toBeCloseTo(2, 0);
  });

  test('6. the shares are a partition — cash and compounds can never exceed 100%', async ({ game }) => {
    // The slider cannot produce this, but a save could, and the engine must not
    // hand out more of a material than exists.
    await stageProduction(game, 'iron', 100);
    await setAllocation(game, 'resources', 'iron', { cash: 80, compound: 80 });

    const before = await read(game, 'resources', 'iron');
    await game.advanceTimers(3_000);
    const after = await read(game, 'resources', 'iron');

    expect(after.quantity, 'iron must not go negative').toBeGreaterThanOrEqual(0);
    expect(after.quantity, 'nor be drained below where it started').toBeGreaterThanOrEqual(before.quantity - 1e-6);
  });
});
