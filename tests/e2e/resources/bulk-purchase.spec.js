/**
 * Area: Resources — Buy Max
 * Plan: docs/player-feedback-improvement-plan.md (P1)
 *
 * A Max button sits beside the Buy button on every repeatable purchase in the
 * game, once the player has bought the `bulkPurchasing` ascendency perk.
 * Pressing it buys as many as the player can currently afford.
 *
 * The implementation owns no pricing logic of its own. `buyMaxForRow` in game.js
 * drives the row's existing single-purchase handler and then re-runs the game's
 * own per-frame condition pass over that row, stopping when the Buy button goes
 * red — which is the same verdict the player sees. So the assertion that matters
 * most here is the equivalence one: **Buy Max must land on exactly the state that
 * clicking Buy until it greys out lands on.** It is written as a comparison
 * between two runs of the same staged row rather than against a re-derived cost
 * curve, because a re-derived curve would only prove that the test and the game
 * agree on maths they both took from the same place.
 *
 * The second thing worth pinning is that **every unit is paid for**. A purchase
 * in this game does not settle when it is made: `gain()` queues the cost into
 * `itemsToDeduct` / `itemsToIncreasePrice` and the frame loop settles both on its
 * next pass. Those are keyed maps, not accumulators, so a loop that called the
 * handler N times inside one frame would collapse into a single deduction and a
 * single price rise — N units for the price of one, at the opening price. The
 * price-curve test below is what would catch that regression.
 *
 * Affordability is never tested by clicking a red button and checking nothing
 * happened. The gate in this game is the `red-disabled-text` class, whose CSS is
 * `pointer-events: none`, and the dispatched clicks these specs use go straight
 * through it by design. The class is the assertion.
 */
import { test, expect } from '../_harness/game-fixture.mjs';


// ------------------------------------------------------------------- utilities

/** Open a side-menu option by id, revealing its row first. */
async function openOptionById(game, optionId, tab = null) {
  if (tab !== null) await game.openTab(tab);
  await game.page.evaluate((id) => {
    const el = document.getElementById(id);
    el?.closest('.row-side-menu')?.classList.remove('invisible');
    el?.classList.remove('invisible');
    el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, optionId);
  await game.page.waitForTimeout(650);
}

/**
 * Dispatch a click straight at an element.
 *
 * Used rather than `locator.click()` because several of these controls sit under
 * the row's description container and a real click at their coordinates lands on
 * the coverer. It also bypasses `pointer-events: none`, which is why nothing here
 * infers "the purchase was refused" from a dispatched click.
 */
async function clickSelector(game, selector) {
  const fired = await game.page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, selector);
  if (!fired) throw new Error(`Nothing matched ${selector}`);
  await game.page.waitForTimeout(120);
}

/** Grant the perk the way a player does: AP from the debug menu, then the pane. */
async function unlockBulkPurchasing(game) {
  // Tab 7 is locked on a fresh run, and its perk buttons render into a hidden
  // pane until it is opened — waiting on them by visibility would time out.
  await game.openDebugMenu();
  await game.debugClick('unlockAllTabsButton');
  await game.debugClick('add100ApButton');
  await game.page.waitForTimeout(250);

  await openOptionById(game, 'ascendencyOption', 7);
  await game.page.waitForSelector('button.ascendency-buff-button', { timeout: 15000 });
  await game.page.waitForTimeout(500);

  const before = await game.withMods((m) => ({
    ap: m.cg.getAscendencyPoints(),
    // Read the price from the catalogue rather than hard-coding it. What this
    // spec is about is the gate - that the perk is bought through the real
    // button and that owning it is what puts Max buttons on rows. Whether the
    // price charged matches the price quoted is the ascendency area's job, and
    // it is asserted there for every perk; pinning the number again here would
    // only mean this file breaks whenever the perk is retuned.
    price: m.rdo.getAscendencyBuffDataObject().bulkPurchasing?.baseCostAp
  }));
  await clickSelector(game, 'button.ascendency-buff-button.buff-class-bulk-purchasing');
  await game.page.waitForTimeout(500);

  const after = await game.withMods((m) => ({
    ap: m.cg.getAscendencyPoints(),
    boughtYet: m.rdo.getAscendencyBuffDataObject().bulkPurchasing?.boughtYet
  }));

  expect(after.boughtYet, 'the perk should be owned after one press').toBe(1);
  expect(before.ap - after.ap, 'the perk should charge the price its catalogue entry quotes')
    .toBe(before.price);
}

/** Stage hydrogen so its tier 1 autobuyer has a long affordable run ahead of it. */
async function stageHydrogen(game, quantity = 1000000) {
  await game.withMods((m, qty) => {
    m.rdo.setResourceDataObject(1e12, 'resources', ['hydrogen', 'storageCapacity']);
    m.rdo.setResourceDataObject(qty, 'resources', ['hydrogen', 'quantity']);
    m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
    m.rdo.setResourceDataObject(50, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'price']);
    // Tier 1 produces hydrogen, which would keep topping the balance up mid-run
    // and make "what could you afford" a moving target. Switched off, the only
    // thing changing the balance is the purchase itself.
    m.rdo.setResourceDataObject(false, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'active']);
  }, quantity);
}

/** The state a hydrogen tier 1 purchase run is judged by. */
function hydrogenState(game) {
  return game.withMods((m) => ({
    autobuyers: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']),
    hydrogen: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
    price: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'price'])
  }));
}

/** Is the row's ordinary Buy button currently greyed out? */
function buyIsBlocked(game, rowId) {
  return game.page.evaluate((id) => {
    const button = document.querySelector('#' + id + ' .input-container button:not(.buy-max-button)');
    return !!button?.classList.contains('red-disabled-text');
  }, rowId);
}

/** How many Max buttons a given row is showing. */
function maxButtonCount(game, rowId) {
  return game.page.evaluate(
    (id) => document.querySelectorAll('#' + id + ' .buy-max-button').length,
    rowId
  );
}

// ============================================================ the perk gate

test.describe('Buy Max — the ascendency perk that unlocks it', () => {
  test('rows carry no Max button until the perk is bought, and one press buys it at its quoted price', async ({ game }) => {
    await game.boot();
    await stageHydrogen(game);

    await openOptionById(game, 'hydrogenOption', 1);
    expect(await maxButtonCount(game, 'hydrogenAutoBuyer1Row'),
      'a run without the perk shows no Max button').toBe(0);

    await unlockBulkPurchasing(game);

    // The pane is rebuilt on navigation, which is when the button appears.
    await openOptionById(game, 'hydrogenOption', 1);
    expect(await maxButtonCount(game, 'hydrogenAutoBuyer1Row'),
      'buying the perk puts a Max button on the row').toBe(1);
  });
});

// ================================================= what one press actually buys

test.describe('Buy Max — what one press buys', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await unlockBulkPurchasing(game);
  });

  test('bulk max equals clicking buy until it greys out', async ({ game }) => {
    // Run A: press Buy over and over, exactly as a player without the perk must,
    // and record where that leaves the run.
    await stageHydrogen(game);
    await openOptionById(game, 'hydrogenOption', 1);
    await game.page.waitForTimeout(500);

    let clicks = 0;
    while (clicks < 500) {
      if (await buyIsBlocked(game, 'hydrogenAutoBuyer1Row')) break;
      await clickSelector(game, '#hydrogenAutoBuyer1Row .input-container button:not(.buy-max-button)');
      // One frame, so the purchase settles and the button is re-classified —
      // that wait is the whole cost of doing this by hand.
      await game.page.waitForTimeout(220);
      clicks++;
    }
    const byHand = await hydrogenState(game);
    expect(clicks, 'the manual run should take many clicks, or it proves nothing').toBeGreaterThan(3);

    // Run B: the same staged row, one press of Max.
    await stageHydrogen(game);
    await openOptionById(game, 'hydrogenOption', 1);
    await game.page.waitForTimeout(500);
    await clickSelector(game, '#hydrogenAutoBuyer1Row .buy-max-button');
    await game.page.waitForTimeout(500);
    const byMax = await hydrogenState(game);

    // The plan asks for the click saving to be recorded in the test report, so
    // the count the manual run needed is attached to the result rather than
    // being visible only when the test fails.
    test.info().annotations.push({
      type: 'clicks saved',
      description: `${byHand.autobuyers} autobuyers: ${clicks} clicks by hand -> 1 press of Max`
    });

    expect(byMax.autobuyers, `one press should buy what ${clicks} clicks bought`).toBe(byHand.autobuyers);
    expect(byMax.hydrogen, 'and should spend exactly the same').toBeCloseTo(byHand.hydrogen, 4);
    expect(byMax.price, 'and should leave the price curve at the same point').toBe(byHand.price);
  });

  test('the run stops at the last unit the player can afford, not one beyond it', async ({ game }) => {
    await stageHydrogen(game);
    await openOptionById(game, 'hydrogenOption', 1);
    await game.page.waitForTimeout(500);

    await clickSelector(game, '#hydrogenAutoBuyer1Row .buy-max-button');
    await game.page.waitForTimeout(600);

    const after = await hydrogenState(game);
    expect(after.autobuyers, 'a million hydrogen should buy a good many').toBeGreaterThan(3);
    expect(after.hydrogen, 'the balance may not go negative').toBeGreaterThanOrEqual(0);
    expect(after.hydrogen,
      `${after.hydrogen} left with the next one costing ${after.price} — one more was affordable`)
      .toBeLessThan(after.price);
    expect(await buyIsBlocked(game, 'hydrogenAutoBuyer1Row'),
      'the game should agree that nothing further is affordable').toBe(true);
  });

  test('every unit is charged at its own price, not all of them at the opening price', async ({ game }) => {
    // The regression this guards: a purchase queues its cost for the frame loop
    // to settle, into keyed maps that overwrite rather than accumulate. A loop
    // that did not settle each purchase before making the next would deduct once
    // and raise the price once, however many units it handed out.
    await stageHydrogen(game);
    await openOptionById(game, 'hydrogenOption', 1);
    await game.page.waitForTimeout(500);

    const before = await hydrogenState(game);
    await clickSelector(game, '#hydrogenAutoBuyer1Row .buy-max-button');
    await game.page.waitForTimeout(600);
    const after = await hydrogenState(game);

    const bought = after.autobuyers - before.autobuyers;
    const spent = before.hydrogen - after.hydrogen;

    expect(bought, 'several units, or the test cannot tell the two behaviours apart').toBeGreaterThan(3);
    expect(spent,
      `${bought} units all charged at the opening price of ${before.price} would cost ${bought * before.price}`)
      .toBeGreaterThan(bought * before.price);
    expect(after.price, 'the price should have climbed once per unit').toBeGreaterThan(before.price);
  });

  test('a press with nothing affordable buys nothing and costs nothing', async ({ game }) => {
    await stageHydrogen(game, 0);
    await openOptionById(game, 'hydrogenOption', 1);
    await game.page.waitForTimeout(700);

    const before = await hydrogenState(game);
    expect(await buyIsBlocked(game, 'hydrogenAutoBuyer1Row'),
      'precondition: the row is unaffordable').toBe(true);

    await clickSelector(game, '#hydrogenAutoBuyer1Row .buy-max-button');
    await game.page.waitForTimeout(500);

    const after = await hydrogenState(game);
    expect(after.autobuyers, 'nothing should have been bought').toBe(before.autobuyers);
    expect(after.price, 'and the price should not have moved').toBe(before.price);
  });
});

// ============================================================ where it appears

test.describe('Buy Max — where the button appears', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await unlockBulkPurchasing(game);
    await game.prepareRunForStarshipLaunch();
    await game.withMods((m) => {
      for (const battery of ['battery1', 'battery2', 'battery3']) {
        m.rdo.setResourceDataObject(true, 'buildings', ['energy', 'upgrades', battery, 'revealed']);
      }
    });
    await game.debugClick('give1MAllResourcesAndCompounds');
    await game.page.waitForTimeout(600);
  });

  test('every purchase the plan names carries a Max button', async ({ game }) => {
    const expectations = [
      { tab: 1, option: 'hydrogenOption', rows: ['hydrogenAutoBuyer1Row', 'hydrogenAutoBuyer4Row'] },
      { tab: 2, option: 'energyOption', rows: ['energyBattery1Row', 'energyBattery3Row'] },
      { tab: 2, option: 'powerPlant1Option', rows: ['energyPowerPlant1Row'] },
      { tab: 3, option: 'researchOption', rows: ['researchScienceKitRow', 'researchScienceLabRow'] },
      { tab: 4, option: 'dieselOption', rows: ['dieselAutoBuyer1Row', 'dieselAutoBuyer4Row'] },
      { tab: 6, option: 'launchPadOption', rows: ['spaceRocket1BuildRow', 'spaceRocket4BuildRow'] },
      { tab: 5, option: 'starShipOption', rows: ['spaceSsStructuralBuildRow', 'spaceSsStellarScannerBuildRow'] },
      { tab: 5, option: 'fleetHangarOption', rows: ['spaceFleetScoutBuildRow', 'spaceFleetNavalStraferBuildRow'] }
    ];

    const missing = [];
    for (const { tab, option, rows } of expectations) {
      await openOptionById(game, option, tab);
      for (const rowId of rows) {
        const found = await maxButtonCount(game, rowId);
        if (found !== 1) missing.push(`${option}/${rowId}: ${found}`);
      }
    }

    expect(missing, 'these rows should each carry exactly one Max button').toEqual([]);
  });

  test('the repeatable philosophy technologies carry one, and the special ability does not', async ({ game }) => {
    await openOptionById(game, 'philosophyOption', 3);

    const rows = await game.page.evaluate(() =>
      Array.from(document.querySelectorAll('.option-row[id^="techPhilosophy"]')).map((row) => ({
        id: row.id,
        // The special ability is the row whose button is flagged as one.
        specialAbility: !!row.querySelector('button.special-ability'),
        hasMax: !!row.querySelector('.buy-max-button')
      }))
    );

    expect(rows.length, 'the philosophy pane should have rendered its rows').toBeGreaterThan(1);
    for (const row of rows) {
      expect(row.hasMax, `${row.id} (special ability: ${row.specialAbility})`).toBe(!row.specialAbility);
    }
  });

  test('nothing that is bought once carries a Max button', async ({ game }) => {
    // The exclusions are as deliberate as the inclusions: selling, manual
    // gathering, storage upgrades, compound creation, and the fleet envoy, which
    // is capped at one.
    //
    // Manual gathering no longer has a row of its own — P14 moved the resource's
    // "Gain 1" button into the pane header — so it is checked where it now lives,
    // below.
    const excluded = [
      { tab: 1, option: 'hydrogenOption', rows: ['hydrogenSellRow', 'hydrogenIncreaseStorageRow'] },
      { tab: 4, option: 'dieselOption', rows: ['dieselCreateRow', 'dieselSellRow', 'dieselIncreaseStorageRow'] },
      { tab: 5, option: 'fleetHangarOption', rows: ['spaceFleetEnvoyBuildRow'] }
    ];

    const unexpected = [];
    for (const { tab, option, rows } of excluded) {
      await openOptionById(game, option, tab);
      for (const rowId of rows) {
        if (await maxButtonCount(game, rowId) !== 0) unexpected.push(`${option}/${rowId}`);
      }
    }

    expect(unexpected, 'these rows must not offer a Max button').toEqual([]);

    await openOptionById(game, 'hydrogenOption', 1);
    const header = await game.page.evaluate(() => {
      const actions = document.getElementById('headerActionsTab1');
      return {
        gainButton: !!document.getElementById('hydrogenGainButton'),
        maxButtons: actions ? actions.querySelectorAll('.buy-max-button').length : -1
      };
    });
    expect(header, 'the header Gain button must be there, and must not offer Max')
      .toEqual({ gainButton: true, maxButtons: 0 });
  });

  test('Max is a narrow button to the right of an unchanged Buy button', async ({ game }) => {
    // The shape asked for: the purchase button is left exactly as it was, and Max
    // sits immediately to its right, labelled only "Max" and about half as wide.
    // Width is the point - purchase buttons carry a 120px minimum through
    // `.option-button.resource-cost-sell-check`, and Max opts out of it rather
    // than that minimum being lowered for every button in the app.
    await openOptionById(game, 'hydrogenOption', 1);
    await game.page.waitForTimeout(600);

    const pair = await game.page.evaluate(() => {
      const container = document.querySelector('#hydrogenAutoBuyer1Row .input-container');
      const buttons = [...container.querySelectorAll('button')];
      const buy = buttons.find((b) => !b.classList.contains('buy-max-button'));
      const max = container.querySelector('.buy-max-button');
      return {
        order: buttons.indexOf(max) - buttons.indexOf(buy),
        buyWidth: buy.getBoundingClientRect().width,
        maxWidth: max.getBoundingClientRect().width,
        maxLabel: max.textContent.trim(),
        // `red-disabled-text` is owned by the frame loop and comes and goes with
        // affordability, so the check is that the injection neither added a class
        // of its own nor took one of the row's away - not that the class list
        // reads some fixed string.
        buyKeptItsOwnClasses: ['option-button', 'resource-cost-sell-check'].every((c) => buy.classList.contains(c)),
        buyPickedUpNothingExtra: !buy.classList.contains('buy-max-button'),
        buyClassList: buy.className
      };
    });

    expect(pair.order, 'Max should be the next control after Buy, not before it').toBe(1);
    expect(pair.maxLabel, 'the label is just the one word').toBe('Max');
    expect(pair.buyKeptItsOwnClasses,
      `the purchase button must keep its own classes: ${pair.buyClassList}`).toBe(true);
    expect(pair.buyPickedUpNothingExtra,
      `the purchase button must gain nothing from the injection: ${pair.buyClassList}`).toBe(true);
    test.info().annotations.push({
      type: 'button widths',
      description: `Max ${Math.round(pair.maxWidth)}px against Buy ${Math.round(pair.buyWidth)}px`
    });

    expect(pair.maxWidth / pair.buyWidth,
      `Max is ${Math.round(pair.maxWidth)}px against Buy at ${Math.round(pair.buyWidth)}px`)
      .toBeLessThan(0.6);
  });

  test('the extra button does not push any row out of its container', async ({ game }) => {
    // The plan allows the buttons to shrink if the layout needs it. This is the
    // check that says whether it does: the input container is only half the row
    // wide, and several of these rows already hold a quantity label and a toggle
    // beside their Buy button.
    const panes = [
      { tab: 1, option: 'hydrogenOption' },
      { tab: 2, option: 'energyOption' },
      { tab: 2, option: 'powerPlant1Option' },
      { tab: 3, option: 'researchOption' },
      { tab: 4, option: 'dieselOption' },
      { tab: 6, option: 'launchPadOption' },
      { tab: 5, option: 'fleetHangarOption' }
    ];

    const overflowing = [];
    for (const { tab, option } of panes) {
      await openOptionById(game, option, tab);
      const rows = await game.page.evaluate(() =>
        Array.from(document.querySelectorAll('.option-row'))
          .filter((row) => !row.classList.contains('invisible') && row.querySelector('.buy-max-button'))
          .map((row) => {
            const container = row.querySelector('.input-container');
            return { id: row.id, overflow: container.scrollWidth - container.clientWidth };
          })
          .filter((row) => row.overflow > 0)
      );
      overflowing.push(...rows.map((row) => `${option}/${row.id} by ${row.overflow}px`));
    }

    expect(overflowing, 'a row with a Max button must still fit its container').toEqual([]);
  });
});

// ==================================================== state, caps and restraint

test.describe('Buy Max — the state it takes from the row beside it', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await unlockBulkPurchasing(game);
  });

  test('Max is greyed out exactly when Buy is', async ({ game }) => {
    // The Max button carries no affordability dataset of its own; the frame loop
    // mirrors the Buy button's state onto it, which is what keeps the two in step
    // through every row's own way of deciding that state.
    await stageHydrogen(game, 1000000);
    await openOptionById(game, 'hydrogenOption', 1);
    await game.page.waitForTimeout(700);

    const readPair = () => game.page.evaluate(() => {
      const row = document.getElementById('hydrogenAutoBuyer1Row');
      return {
        buy: !!row.querySelector('.input-container button:not(.buy-max-button)')
          ?.classList.contains('red-disabled-text'),
        max: !!row.querySelector('.buy-max-button')?.classList.contains('red-disabled-text')
      };
    });

    const affordable = await readPair();
    expect(affordable.buy, 'precondition: the row is affordable').toBe(false);
    expect(affordable.max, 'with a million hydrogen both should be live').toBe(affordable.buy);

    await game.withMods((m) => m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'quantity']));
    await game.page.waitForTimeout(700);

    const broke = await readPair();
    expect(broke.buy, 'the row should now be unaffordable').toBe(true);
    expect(broke.max, 'and Max should have followed it').toBe(true);
  });

  test('a completed rocket offers no further purchases through Max', async ({ game }) => {
    await game.prepareRunForStarshipLaunch();
    await game.debugClick('give1MAllResourcesAndCompounds');
    await game.page.waitForTimeout(600);
    await openOptionById(game, 'launchPadOption', 6);
    await game.page.waitForTimeout(700);

    const state = await game.withMods((m) => ({
      built: m.rdo.getResourceDataObject('space', ['upgrades', 'rocket1', 'builtParts']),
      total: m.rdo.getResourceDataObject('space', ['upgrades', 'rocket1', 'parts'])
    }));
    expect(state.built, 'precondition: this run has rocket 1 finished').toBe(state.total);

    // The completion cap is the game's own: handleSpaceUpgradeResourceType()
    // greys the Buy button once every part is built, and Max mirrors it.
    expect(await buyIsBlocked(game, 'spaceRocket1BuildRow'),
      'a finished rocket should not be buyable').toBe(true);

    await clickSelector(game, '#spaceRocket1BuildRow .buy-max-button');
    await game.page.waitForTimeout(500);

    const after = await game.withMods(
      (m) => m.rdo.getResourceDataObject('space', ['upgrades', 'rocket1', 'builtParts'])
    );
    expect(after, 'a finished rocket must not gain parts beyond its total').toBe(state.total);
  });

  test('a compound autobuyer bulk-buys through its own cost path', async ({ game }) => {
    // Worth its own spec because compound rows are checked by a different
    // function from resource rows (compoundCostSellCreateChecks rather than
    // resourceCostSellChecks), and because diesel tier 1 is the row that is
    // patched after createOptionRow returns: it stamps a cashOverride onto
    // `button[data-auto-buyer-tier="tier1"]`, so it is charged in cash while the
    // rest of the pane is charged in diesel. That patch is the reason the Max
    // button carries no dataset of its own.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(true, 'compounds', ['diesel', 'revealedYet']);
      m.rdo.setResourceDataObject(1e12, 'currency', ['cash']);
      m.rdo.setResourceDataObject(0, 'compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      m.rdo.setResourceDataObject(false, 'compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier1', 'active']);
    });
    await openOptionById(game, 'dieselOption', 4);
    await game.page.waitForTimeout(700);

    const before = await game.withMods((m) => ({
      quantity: m.rdo.getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier1', 'quantity']),
      price: m.rdo.getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier1', 'price']),
      cash: m.rdo.getResourceDataObject('currency', ['cash'])
    }));

    await clickSelector(game, '#dieselAutoBuyer1Row .buy-max-button');
    await game.page.waitForTimeout(800);

    const after = await game.withMods((m) => ({
      quantity: m.rdo.getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier1', 'quantity']),
      price: m.rdo.getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier1', 'price']),
      cash: m.rdo.getResourceDataObject('currency', ['cash'])
    }));

    const bought = after.quantity - before.quantity;
    expect(bought, 'a trillion in cash should buy a good many diesel autobuyers').toBeGreaterThan(3);
    expect(before.cash - after.cash, 'and it should have been paid for in cash').toBeGreaterThan(0);
    expect(after.price, 'with the price climbing once per unit').toBeGreaterThan(before.price);
  });

  test('a part-built rocket is finished exactly, and not one part further', async ({ game }) => {
    // The cap that matters is the one reached *during* the run rather than
    // before it: gain() clamps builtParts at the total but still queues the cost,
    // so a loop that kept going past the cap would charge for parts it could not
    // add. The stopping condition is the game's own - handleSpaceUpgradeResourceType
    // greys the Buy button the moment the last part lands.
    await game.prepareRunForStarshipLaunch();
    await game.debugClick('give1MAllResourcesAndCompounds');
    await game.page.waitForTimeout(600);

    const total = await game.withMods((m) => {
      const parts = m.rdo.getResourceDataObject('space', ['upgrades', 'rocket2', 'parts']);
      // Wind the rocket back so there is a real run of parts left to build.
      m.rdo.setResourceDataObject(Math.max(0, parts - 5), 'space', ['upgrades', 'rocket2', 'builtParts']);
      return parts;
    });

    await openOptionById(game, 'launchPadOption', 6);
    await game.page.waitForTimeout(700);

    const before = await game.withMods((m) => ({
      built: m.rdo.getResourceDataObject('space', ['upgrades', 'rocket2', 'builtParts']),
      cash: m.rdo.getResourceDataObject('currency', ['cash'])
    }));
    expect(total - before.built, 'precondition: parts left to build').toBeGreaterThan(1);

    await clickSelector(game, '#spaceRocket2BuildRow .buy-max-button');
    await game.page.waitForTimeout(900);

    const after = await game.withMods((m) => ({
      built: m.rdo.getResourceDataObject('space', ['upgrades', 'rocket2', 'builtParts']),
      cash: m.rdo.getResourceDataObject('currency', ['cash'])
    }));

    expect(after.built, 'the rocket should be finished, and stop there').toBe(total);
    expect(before.cash - after.cash, 'and the parts it built should have been paid for').toBeGreaterThan(0);

    // Pressing again must be a no-op rather than charging for nothing.
    const cashAtCap = after.cash;
    await clickSelector(game, '#spaceRocket2BuildRow .buy-max-button');
    await game.page.waitForTimeout(600);
    const atCap = await game.withMods((m) => ({
      built: m.rdo.getResourceDataObject('space', ['upgrades', 'rocket2', 'builtParts']),
      cash: m.rdo.getResourceDataObject('currency', ['cash'])
    }));
    expect(atCap.built, 'a finished rocket gains nothing').toBe(total);
    expect(atCap.cash, 'and a finished rocket costs nothing').toBe(cashAtCap);
  });

  test('a bulk run does not bury the screen in one notification per unit', async ({ game }) => {
    // Several purchase handlers announce themselves. One toast per click is
    // right; one per unit from a single press is not, so repeats are collapsed
    // for the duration of the run.
    await game.prepareRunForStarshipLaunch();
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(5000000, 'research', ['quantity']);
    });
    await openOptionById(game, 'philosophyOption', 3);
    await game.page.waitForTimeout(700);

    const rowId = await game.page.evaluate(() => {
      const row = Array.from(document.querySelectorAll('.option-row[id^="techPhilosophy"]'))
        .find((candidate) => {
          const max = candidate.querySelector('.buy-max-button');
          return max && !max.classList.contains('red-disabled-text');
        });
      return row?.id ?? null;
    });
    expect(rowId, 'a repeatable philosophy technology should be affordable with 5M research')
      .toBeTruthy();

    await clickSelector(game, `#${rowId} .buy-max-button`);
    await game.page.waitForTimeout(900);

    const toasts = await game.notifications();
    const duplicated = toasts.filter(
      (text) => text && toasts.filter((other) => other === text).length > 1
    );

    expect(duplicated, 'a bulk run must not raise the same toast more than once').toEqual([]);
  });
});
