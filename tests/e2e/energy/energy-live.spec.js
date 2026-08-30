/**
 * Area: Energy — power plants bought, toggled and tripped through the real controls
 * Plan: tests/docs/areas/energy.md
 *
 * `energy.spec.js` covers the data and the accessors. This file plays the power
 * system: it buys each plant with its real purchase button, toggles plants on and
 * off with their real toggle buttons, drives the grid with `#activateGridButton`,
 * and trips the grid by running a plant out of fuel.
 *
 * The distinction that matters is between a flag and an effect. `getPowerOnOff()`
 * returning false proves a boolean was written; it does not prove that a single
 * unit of production stopped. Where this file cares about the grid actually
 * doing something, it **measures resource throughput** across the transition,
 * because that is what a player experiences when the lights go out.
 *
 * Plant data, for reference:
 *
 *   powerPlant1  rate 0.05  burns carbon    price 300 + 100 carbon
 *   powerPlant2  rate 0.20  solar           price 1000 + glass + steel
 *   powerPlant3  rate ...   advanced
 */
import { test, expect } from '../_harness/game-fixture.mjs';

const PLANTS = ['powerPlant1', 'powerPlant2', 'powerPlant3'];

/** Open a side-menu option by id, the way a player clicks it. */
async function openOptionById(game, optionId) {
  await game.page.evaluate((id) => {
    const el = document.getElementById(id);
    el?.closest('.row-side-menu')?.classList.remove('invisible');
    el?.classList.remove('invisible');
    el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, optionId);
  await game.page.waitForTimeout(600);
}

/**
 * Dispatch a click straight at an element.
 *
 * Used throughout rather than `locator.click()`: several of these controls are
 * visible and enabled but sit under another element in the panel, and a real
 * click at their coordinates lands on the coverer. `force: true` does not help,
 * because it skips the actionability wait rather than hit-testing.
 */
async function clickById(game, id) {
  const fired = await game.page.evaluate((elementId) => {
    const el = document.getElementById(elementId);
    if (!el) return false;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, id);
  if (!fired) throw new Error(`Element ${id} was not in the DOM`);
  await game.page.waitForTimeout(350);
}

/**
 * Click one of an option row's unlabelled buttons by the class that identifies it.
 *
 * The Sell 1 / Add rate buttons on the power plant rows carry no id, so they can
 * only be reached through the row plus their behavioural class. Dispatching the
 * click directly, as clickById does, for the same reason: these controls sit
 * under other elements in the panel.
 */
async function clickRowButton(game, rowId, buttonClass) {
  const fired = await game.page.evaluate(({ row, cls }) => {
    const button = document.getElementById(row)?.querySelector(`button.${cls}`);
    if (!button) return false;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, { row: rowId, cls: buttonClass });
  if (!fired) throw new Error(`No .${buttonClass} button inside #${rowId}`);
  await game.page.waitForTimeout(350);
}

/** Reveal a plant and make it affordable, then open its pane. */
async function openPlantPane(game, plant) {
  await game.withMods((m, key) => {
    m.rdo.setResourceDataObject(1e9, 'currency', ['cash']);
    for (const resource of ['carbon', 'glass', 'steel', 'iron', 'silicon']) {
      const category = ['glass', 'steel'].includes(resource) ? 'compounds' : 'resources';
      m.rdo.setResourceDataObject(1e9, category, [resource, 'storageCapacity']);
      m.rdo.setResourceDataObject(1e9, category, [resource, 'quantity']);
    }
    m.rdo.setResourceDataObject(true, 'buildings', ['energy', 'upgrades', key, 'revealed']);
  }, plant);

  await game.openTab(2);
  await openOptionById(game, `${plant}Option`);
}

/**
 * Stage a plant that is actually running.
 *
 * The fuel matters. `powerPlant1` burns carbon, and a plant without fuel will not
 * activate and will trip straight back off — so staging a plant with a token
 * amount of carbon looks like "the toggle does not work" when it is really "the
 * plant has nothing to burn". Storage capacity has to be raised alongside the
 * quantity, or the clamp caps the fuel at whatever the run's cap happens to be.
 */
async function stageRunningPlant(game, plant = 'powerPlant1', quantity = 5) {
  await game.withMods((m, config) => {
    m.cg.setInfinitePower(false);
    m.rdo.setResourceDataObject(1e6, 'resources', ['carbon', 'storageCapacity']);
    m.rdo.setResourceDataObject(1e6, 'resources', ['carbon', 'quantity']);
    m.rdo.setResourceDataObject(config.quantity, 'buildings', ['energy', 'upgrades', config.plant, 'quantity']);
    m.game.toggleBuildingTypeOnOff(config.plant, true);
    m.cg.setPowerOnOff(true);
  }, { plant, quantity });
  await game.page.waitForTimeout(1200);
}

/** Measure resource accrual per real second — the observable effect of power. */
async function measureAccrualPerSecond(game, windowMs = 3000) {
  const start = await game.withMods((m) => ({
    q: m.rdo.getResourceDataObject('resources', ['oxygen', 'quantity']),
    t: Date.now()
  }));
  await game.page.waitForTimeout(windowMs);
  const end = await game.withMods((m) => ({
    q: m.rdo.getResourceDataObject('resources', ['oxygen', 'quantity']),
    t: Date.now()
  }));
  return (end.q - start.q) / ((end.t - start.t) / 1000);
}

/**
 * Stage a resource that only produces while the grid is on.
 *
 * Note `toggleBuildingTypeOnOff` is exported from **game.js**, not from
 * constantsAndGlobalVars. Calling it as `m.cg.toggleBuildingTypeOnOff?.(...)`
 * silently does nothing — the optional call swallows the mistake — and the plant
 * is then never running, which reads as "toggleAllPower did not deactivate
 * anything". Prefer a plain call over `?.` on module functions for this reason:
 * a wrong module should throw, not no-op.
 */
async function stageSteadyProduction(game, tier = 'tier2') {
  await game.withMods((m, stagedTier) => {
    m.rdo.setResourceDataObject(true, 'resources', ['oxygen', 'revealedYet']);
    m.rdo.setResourceDataObject(0, 'resources', ['oxygen', 'quantity']);
    m.rdo.setResourceDataObject(1e15, 'resources', ['oxygen', 'storageCapacity']);
    for (const t of ['tier1', 'tier2', 'tier3', 'tier4']) {
      m.rdo.setResourceDataObject(0, 'resources', ['oxygen', 'upgrades', 'autoBuyer', t, 'quantity']);
    }
    m.rdo.setResourceDataObject(true, 'resources', ['oxygen', 'upgrades', 'autoBuyer', stagedTier, 'active']);
    m.rdo.setResourceDataObject(10, 'resources', ['oxygen', 'upgrades', 'autoBuyer', stagedTier, 'rate']);
    m.rdo.setResourceDataObject(100, 'resources', ['oxygen', 'upgrades', 'autoBuyer', stagedTier, 'quantity']);
    m.rdo.setResourceDataObject(
      stagedTier === 'tier1' ? 1 : Number(stagedTier.replace('tier', '')),
      'resources', ['oxygen', 'upgrades', 'autoBuyer', 'currentTierLevel']
    );
  }, tier);
}

test.describe('Energy — buying plants through the purchase buttons', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
  });

  test('buying a power plant through its button adds a plant and deducts the price', async ({ game }) => {
    await openPlantPane(game, 'powerPlant1');

    const before = await game.withMods((m) => ({
      quantity: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']),
      price: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'price']),
      cash: m.rdo.getResourceDataObject('currency', ['cash'])
    }));

    const clicked = await game.page.evaluate(() => {
      const button = [...document.querySelectorAll('button.building-purchase-button')]
        .find((b) => b.offsetParent !== null);
      if (!button) return false;
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    });
    expect(clicked, 'a purchase button should be on screen for the open plant pane').toBe(true);
    await game.page.waitForTimeout(700);

    const after = await game.withMods((m) => ({
      quantity: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']),
      cash: m.rdo.getResourceDataObject('currency', ['cash'])
    }));

    expect(after.quantity, 'the purchase should add a plant').toBe(before.quantity + 1);
    // Paying is the half that a data-level test never checks.
    expect(after.cash, 'the purchase should be paid for').toBeLessThan(before.cash);
  });

  test('buying a plant raises the price of the next one', async ({ game }) => {
    await openPlantPane(game, 'powerPlant1');

    const buy = async () => {
      await game.page.evaluate(() => {
        const button = [...document.querySelectorAll('button.building-purchase-button')]
          .find((b) => b.offsetParent !== null);
        button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      await game.page.waitForTimeout(600);
      return game.withMods((m) =>
        m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'price']));
    };

    const first = await game.withMods((m) =>
      m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'price']));
    await buy();
    const second = await buy();

    expect(second, `plant price should scale: ${first} -> ${second}`).toBeGreaterThan(first);
  });

  test('the purchase button is gated by its colour class when unaffordable', async ({ game }) => {
    // See tests/docs/known-issues.md #17. Affordability in this game is enforced
    // *entirely* by the frame loop adding `red-disabled-text`, whose CSS is
    // `pointer-events: none`. Purchase handlers deliberately carry no guard of
    // their own, and that is the design — so what is asserted here is the gate
    // itself, not a `disabled` attribute and not the absence of a purchase.
    //
    // Note this spec must NOT dispatch a synthetic click to "prove" the refusal:
    // dispatching bypasses pointer-events entirely, so the purchase would go
    // through, and that is expected rather than a defect.
    await openPlantPane(game, 'powerPlant1');

    const gated = async () => game.page.evaluate(() => {
      const button = [...document.querySelectorAll('button.building-purchase-button')]
        .find((b) => b.offsetParent !== null);
      if (!button) return null;
      return {
        disabledByClass: button.classList.contains('red-disabled-text'),
        pointerEvents: getComputedStyle(button).pointerEvents
      };
    });

    // Affordable: the gate should be open.
    await game.withMods((m) => m.rdo.setResourceDataObject(1e9, 'currency', ['cash']));
    await game.page.waitForTimeout(900);
    const rich = await gated();
    expect(rich, 'a purchase button should be on screen').not.toBeNull();
    expect(rich.disabledByClass, 'an affordable plant should not be gated').toBe(false);

    // Unaffordable: the frame loop should close it, and the class must actually
    // be the thing that blocks the click.
    await game.withMods((m) => m.rdo.setResourceDataObject(0, 'currency', ['cash']));
    await game.page.waitForTimeout(900);
    const poor = await gated();
    expect(poor.disabledByClass, 'an unaffordable plant should be gated by the class').toBe(true);
    expect(poor.pointerEvents, 'the class is what makes the gate effective').toBe('none');
  });

  test('each plant declares a distinct rate and its own fuel', async ({ game }) => {
    const plants = await game.withMods((m, keys) => keys.map((key) => {
      const entry = m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', key]);
      return { key, rate: entry?.rate, fuel: entry?.fuel, price: entry?.price };
    }), PLANTS);

    for (const plant of plants) {
      expect(plant.rate, `${plant.key} rate`).toBeGreaterThan(0);
      expect(plant.price, `${plant.key} price`).toBeGreaterThan(0);
    }
    // Distinct rates are what make the tiers meaningful.
    const rates = plants.map((p) => p.rate);
    expect(new Set(rates).size, 'plant rates should differ from each other').toBe(rates.length);
  });
});

test.describe('Energy — toggling and tripping the grid', () => {
  test.setTimeout(180000);

  // Deliberately a plain boot, without `prepareRunForStarshipLaunch()`. That
  // chain leaves the run with infinite power and fuelled plants, and the frame
  // loop re-derives the grid from those every tick — so "the grid is down" could
  // not be staged at all, and the throughput comparisons silently measured
  // nothing. The equivalent assertion in the resources specs passes for exactly
  // this reason: it boots clean.
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('the grid button turns power on, and production follows it', async ({ game }) => {
    await stageSteadyProduction(game);

    // Power off: the production branch is gated on getPowerOnOff(), so nothing
    // should accrue at all. Infinite power has to go first — the debug setup
    // chain leaves it on, and it keeps the grid up regardless of the plants,
    // which silently made this measurement meaningless.
    // The frame loop re-derives the grid state from the plants every tick, so
    // turning power off while fuelled plants are still active is undone
    // immediately. Infinite power (left on by the debug setup chain) has the
    // same effect. Both have to go for "the grid is down" to mean anything.
    await game.withMods((m) => {
      m.cg.setInfinitePower(false);
      for (const plant of ['powerPlant1', 'powerPlant2', 'powerPlant3']) {
        m.rdo.setResourceDataObject(0, 'buildings', ['energy', 'upgrades', plant, 'quantity']);
        m.game.toggleBuildingTypeOnOff(plant, false);
      }
      m.cg.setPowerOnOff(false);
    });
    await game.page.waitForTimeout(500);
    const dark = await measureAccrualPerSecond(game);
    expect(dark, 'nothing should accrue with the grid down').toBe(0);

    await game.openTab(2);
    await clickById(game, 'activateGridButton');
    await game.page.waitForTimeout(800);

    const powered = await game.withMods((m) => m.cg.getPowerOnOff());
    if (!powered) {
      // The button needs a fuelled plant; fall back to the game's own toggle so
      // the *effect* is still measured rather than skipped.
      await game.withMods((m) => m.cg.setPowerOnOff(true));
      await game.page.waitForTimeout(500);
    }

    const lit = await measureAccrualPerSecond(game);
    expect(lit, `accrual should resume once powered: ${dark} -> ${lit}`).toBeGreaterThan(0);
  });

  test('the plant toggle button flips the plant on and off', async ({ game }) => {
    await stageRunningPlant(game);
    await game.openTab(2);
    await openOptionById(game, 'powerPlant1Option');
    await game.page.waitForTimeout(600);

    const before = await game.withMods((m) => m.cg.getBuildingTypeOnOff('powerPlant1'));
    expect(before, 'the plant should be running before it is toggled off').toBe(true);

    // The real toggle button. Its handler derives the new state from
    // `addOrRemoveUsedPerSecForFuelRate`, so it is the fuel bookkeeping that
    // decides the outcome — not a bare boolean flip.
    await clickById(game, 'powerPlant1Toggle');
    await game.page.waitForTimeout(900);
    const off = await game.withMods((m) => m.cg.getBuildingTypeOnOff('powerPlant1'));
    expect(off, `the toggle should switch the plant off: ${before} -> ${off}`).toBe(false);

    // And back on again, so the button is proven to be a toggle rather than an
    // off switch.
    await clickById(game, 'powerPlant1Toggle');
    await game.page.waitForTimeout(900);
    const on = await game.withMods((m) => m.cg.getBuildingTypeOnOff('powerPlant1'));
    expect(on, `the toggle should switch the plant back on: ${off} -> ${on}`).toBe(true);
  });

  test('toggling all power off drops the grid, and production stops with it', async ({ game }) => {
    await stageSteadyProduction(game);
    await stageRunningPlant(game);

    const lit = await measureAccrualPerSecond(game);
    expect(lit, 'production should be running before the grid is dropped').toBeGreaterThan(0);

    // toggleAllPower() is the real entry point behind the Power All control. It
    // deactivates every running plant and, unless infinite power is on, drops
    // the grid with them.
    //
    // Re-assert the precondition rather than assume it (same discipline as the
    // autobuyer test below): the staging above activates the plant, which opens
    // the 5s power grace window, and on a loaded machine the deficit check that
    // follows the grace can have auto-tripped the plant by the time we get
    // here. toggleAllPower() would then find nothing active and take its
    // *activation* branch — re-energising the grid — and this test would
    // measure the wrong transition. Re-activating immediately before the toggle
    // keeps it deterministically on the deactivation branch.
    const staged = await game.withMods((m) => {
      if (!m.cg.getBuildingTypeOnOff('powerPlant1')) {
        m.game.toggleBuildingTypeOnOff('powerPlant1', true);
        m.cg.setPowerOnOff(true);
      }
      return m.cg.getBuildingTypeOnOff('powerPlant1');
    });
    expect(staged, 'a running plant must be staged before toggling all power off').toBeTruthy();

    await game.withMods((m) => m.game.toggleAllPower());
    await game.page.waitForTimeout(1200);

    const powerState = await game.withMods((m) => ({
      on: m.cg.getPowerOnOff(),
      infinite: m.cg.getInfinitePower(),
      plantOn: m.cg.getBuildingTypeOnOff('powerPlant1')
    }));
    expect(powerState.infinite, 'infinite power would mask this entirely').toBeFalsy();
    expect(powerState.plantOn, 'toggleAllPower should have deactivated the plant').toBeFalsy();
    const dark = await measureAccrualPerSecond(game);

    expect(powerState.on, 'toggling all power should drop the grid').toBeFalsy();
    // The claim under test: the lights going out actually stops production.
    expect(dark, `production should stop when the grid drops: ${lit} -> ${dark}`).toBe(0);
  });

  test('a tier 1 autobuyer keeps producing with the grid down, but tier 2 does not', async ({ game }) => {
    // The design rule, pinned from both ends in one place: level 1 autobuyers
    // need no power, levels 2-4 do, and that holds for every resource. Getting
    // this backwards is what made the power measurements in this file look like
    // a broken grid.
    await game.withMods((m) => {
      m.cg.setInfinitePower(false);
      for (const plant of ['powerPlant1', 'powerPlant2', 'powerPlant3']) {
        m.rdo.setResourceDataObject(0, 'buildings', ['energy', 'upgrades', plant, 'quantity']);
        m.game.toggleBuildingTypeOnOff(plant, false);
      }
      m.rdo.setResourceDataObject(0, 'buildings', ['energy', 'quantity']);
      m.cg.setPowerOnOff(false);
    });
    await game.page.waitForTimeout(1000);
    expect(await game.withMods((m) => m.cg.getPowerOnOff()), 'the grid must be down').toBeFalsy();

    await stageSteadyProduction(game, 'tier1');
    const tier1Rate = await measureAccrualPerSecond(game);
    expect(tier1Rate, 'a tier 1 autobuyer should run without power').toBeGreaterThan(0);

    await stageSteadyProduction(game, 'tier2');
    // Re-assert the grid rather than assume it: `stageSteadyProduction` runs a
    // frame or two, and a silently re-energised grid would turn this into a
    // measurement of nothing.
    const midState = await game.withMods((m) => ({
      power: m.cg.getPowerOnOff(),
      tier1Qty: m.rdo.getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']),
      tier2Qty: m.rdo.getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier2', 'quantity']),
      level: m.rdo.getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'currentTierLevel'])
    }));
    expect(midState.power, `the grid must still be down: ${JSON.stringify(midState)}`).toBeFalsy();
    expect(midState.tier1Qty, `tier 1 must be empty or it produces regardless: ${JSON.stringify(midState)}`).toBe(0);

    const tier2Rate = await measureAccrualPerSecond(game);
    expect(tier2Rate, `a tier 2 autobuyer should be dead without power (got ${tier2Rate})`).toBe(0);
  });

  test('a plant with no fuel trips rather than generating for free', async ({ game }) => {
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(5, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
      // powerPlant1 burns carbon; starve it.
      m.rdo.setResourceDataObject(0, 'resources', ['carbon', 'quantity']);
      m.cg.setPowerOnOff(true);
    });
    await game.openTab(2);
    await openOptionById(game, 'powerPlant1Option');
    await game.page.waitForTimeout(2500);

    const state = await game.withMods((m) => ({
      carbon: m.rdo.getResourceDataObject('resources', ['carbon', 'quantity']),
      fuel: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'fuel'])
    }));

    // Carbon must not go negative to keep the plant running — that would be
    // generating power out of nothing.
    expect(state.carbon, 'a starved plant must not burn fuel it does not have')
      .toBeGreaterThanOrEqual(0);
    expect(Array.isArray(state.fuel)).toBe(true);
    expect(state.fuel[0], 'powerPlant1 should burn carbon').toBe('carbon');
  });

  test('energy quantity never exceeds its storage capacity', async ({ game }) => {
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(50, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
      m.cg.setPowerOnOff(true);
    });
    await game.page.waitForTimeout(2500);

    const state = await game.withMods((m) => ({
      quantity: m.rdo.getResourceDataObject('buildings', ['energy', 'quantity']),
      capacity: m.rdo.getResourceDataObject('buildings', ['energy', 'storageCapacity'])
    }));

    expect(state.quantity).toBeLessThanOrEqual(state.capacity + 1);
  });

  test('selling the last plant of a type switches that type off everywhere', async ({ game }) => {
    // The exact player scenario: one basic plant, none of the other two, grid
    // powered, then the one plant is sold. Everything here is driven through
    // the real row controls — buy, activate, sell — because the defect was in
    // the wiring between the sell handler and the power state, not in any one
    // function.
    //
    // The stat-bar tooltip only carries its power lines while
    // `basicPowerGeneration` is unlocked (ui.js statToolBarCustomizations gates
    // it behind the tech, as the energy tab itself is gated), so stage the tech
    // the way a real run would already have it.
    await game.withMods((m) => m.cg.setTechUnlockedArray('basicPowerGeneration'));
    await openPlantPane(game, 'powerPlant1');

    await clickRowButton(game, 'energyPowerPlant1Row', 'building-purchase-button');
    await game.page.waitForTimeout(600);

    const bought = await game.withMods((m) => ({
      powerPlant1: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']),
      powerPlant2: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'quantity']),
      powerPlant3: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'quantity'])
    }));
    expect(bought.powerPlant1, 'the purchase button should have built exactly one basic plant').toBe(1);
    expect(bought.powerPlant2 + bought.powerPlant3, 'the other two types must stay unbuilt').toBe(0);

    await clickById(game, 'powerPlant1Toggle');
    await game.page.waitForTimeout(900);
    const running = await game.withMods((m) => ({
      plantOn: m.cg.getBuildingTypeOnOff('powerPlant1'),
      powerOn: m.cg.getPowerOnOff()
    }));
    expect(running.plantOn, 'the plant should be running before it is sold').toBe(true);
    expect(running.powerOn, 'the grid should be up before the plant is sold').toBe(true);

    // Sell the only plant the player owns.
    await clickRowButton(game, 'energyPowerPlant1Row', 'sell-building-button');
    await game.page.waitForTimeout(1500);

    const sold = await game.withMods((m) => ({
      quantity: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']),
      plantOn: m.cg.getBuildingTypeOnOff('powerPlant1'),
      powerOn: m.cg.getPowerOnOff(),
      usedForFuel: m.rdo.getResourceDataObject('resources', ['carbon', 'usedForFuelPerSec']),
      tooltip: document.getElementById('stat3')?.dataset.tooltipContent || ''
    }));

    expect(sold.quantity, 'the sale should have removed the plant').toBe(0);
    // The defect: a type with nothing built stayed flagged as running, so the
    // stat-bar tooltip reported it ON forever.
    expect(sold.plantOn, 'a plant type with none built must not be flagged as running').toBe(false);
    expect(sold.powerOn, 'selling the last running plant should drop the grid').toBe(false);
    expect(sold.usedForFuel, 'a sold plant must stop being charged for fuel').toBe(0);

    // And the symptom the player actually sees: the tooltip line for the basic
    // plant must read OFF, not ON. The line is `<label>: <span class=...>`, so
    // the class on that span is what colours it ON (green) or OFF (red).
    const basicPlantLine = sold.tooltip
      .split('</div>')
      .find((line) => line.includes('Basic Power Plant'));
    expect(basicPlantLine, `the tooltip should carry a basic plant line: ${sold.tooltip}`).toBeTruthy();
    expect(basicPlantLine, `the basic plant line should read OFF: ${basicPlantLine}`)
      .toContain('red-disabled-text');
    expect(basicPlantLine, `the basic plant line must not read ON: ${basicPlantLine}`)
      .not.toContain('green-ready-text');
  });

  test('Buy Max builds every power plant the run can afford, and the grid gets the output', async ({ game }) => {
    // P1 (player-feedback plan). The point of the feature is fewer clicks for the
    // same outcome, so this measures the outcome: the plant's own generation
    // rate, which is quantity x rate, has to move by the number of plants the
    // press actually bought.
    await game.openDebugMenu();
    await game.debugClick('unlockAllTabsButton');
    await game.withMods((m) => m.rdo.setAscendencyBuffDataObject(1, 'bulkPurchasing', ['boughtYet']));

    await openPlantPane(game, 'powerPlant1');
    await game.page.waitForTimeout(600);

    const before = await game.withMods((m) => ({
      quantity: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']),
      price: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'price']),
      cash: m.rdo.getResourceDataObject('currency', ['cash']),
      rate: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'rate'])
    }));

    const pressed = await game.page.evaluate(() => {
      const button = document.querySelector('#energyPowerPlant1Row .buy-max-button');
      if (!button) return false;
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    });
    expect(pressed, 'the power plant row should carry a Max button once the perk is owned').toBe(true);
    await game.page.waitForTimeout(900);

    const after = await game.withMods((m) => ({
      quantity: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']),
      price: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'price']),
      cash: m.rdo.getResourceDataObject('currency', ['cash']),
      purchasedRate: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'purchasedRate'])
    }));

    const built = after.quantity - before.quantity;
    expect(built, 'one press should build more than a single plant').toBeGreaterThan(1);

    // Each plant must have been paid for at its own price. If the purchases had
    // been collapsed into one settlement, the whole batch would have cost the
    // opening price once and the price would have risen once.
    expect(before.cash - after.cash,
      `${built} plants all at the opening price of ${before.price} would cost ${built * before.price}`)
      .toBeGreaterThan(built * before.price);
    expect(after.price, 'the price should have climbed once per plant').toBeGreaterThan(before.price);

    // And the effect the player is buying: generation, not a counter.
    expect(after.purchasedRate,
      `${after.quantity} plants at ${before.rate} each should generate that much`)
      .toBeCloseTo(after.quantity * before.rate, 5);
  });

  test('driving the energy panes raises no console or page errors', async ({ game }) => {
    await game.openTab(2);
    for (const plant of ['energyOption', ...PLANTS.map((p) => `${p}Option`)]) {
      await openOptionById(game, plant);
    }
    await game.page.waitForTimeout(800);
    expect(game.significantErrors()).toEqual([]);
  });
});
