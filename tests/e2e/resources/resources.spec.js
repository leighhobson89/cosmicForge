/**
 * Area: Resources — played through the Resources tab
 * Plan: tests/docs/areas/resources.md
 *
 * This file replaces the accessor-level specs that used to live here. Those set
 * autobuyer fields directly and read them back; not one of them ever pressed a
 * button on the Resources tab, so they would all have passed with every control
 * in `drawTab1Content.js` deleted.
 *
 * Everything a player does to a resource happens on one pane, and each of those
 * controls is driven here for real:
 *
 *   Sell             #<resource>SellRow button.sell
 *   Fuse             #<resource>SellRow button.fuse       (hidden without the tech)
 *   quantity         #<resource>SellSelectQuantity        (feeds BOTH of the above)
 *   Increase Storage #<resource>IncreaseStorageRow button
 *   Autobuyers       #<resource>AutoBuyer<N>Row button    (rows gated by tech)
 *   Sell All         #sellAllResourcesButton
 *
 * Two pieces of wiring make the pane worth testing through the DOM at all, and
 * neither is reachable from a function-level test:
 *
 * 1. **The sale/fusion preview is only recomputed for the pane that is open.**
 *    `updateAllSalePricePreviews()` runs `if (resource === currentScreen)`, and
 *    both `sellResource()` and `fuseResource()` then *parse that string* to
 *    decide how much to move. The quantity dropdown is therefore not a display
 *    detail — it is the input to both transactions.
 * 2. **Autobuyer tier rows are shown or hidden every frame** from
 *    `getAutoBuyerTierLevel()`, which techs raise: `quantumComputing` to 2 and
 *    `rocketComposites` to 4.
 *
 * Tick arithmetic used below: `TIMER_UPDATE_INTERVAL` is 10ms, so a tier rate of
 * `r` produces `r * 100` per second. Hydrogen's tier 1 rate of 0.02 is therefore
 * 2 hydrogen/second per autobuyer owned.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** The extractable resources, in the order the data object declares them. */
const EXTRACTABLE = ['hydrogen', 'helium', 'carbon', 'neon', 'oxygen', 'silicon', 'iron', 'sodium'];

/** Solar is a resource but is not extracted, sold, or storage-limited like the rest. */
const ALL_RESOURCES = ['solar', ...EXTRACTABLE];

const TIERS = ['tier1', 'tier2', 'tier3', 'tier4'];

/**
 * Open a resource's pane the way a player does — by clicking its side-menu row.
 *
 * Rows for resources the player has not discovered start `invisible`, as do the
 * category collapsibles around them, so those are cleared first. That is a
 * visibility precondition, not the behaviour under test; the specs that care
 * about discovery assert it explicitly.
 */
async function openResource(game, key) {
  const opened = await game.page.evaluate((resource) => {
    const option = document.getElementById(`${resource}Option`);
    if (!option) return false;
    option.classList.remove('invisible');
    option.closest('.row-side-menu')?.classList.remove('invisible');
    option.closest('.collapsible')?.classList.remove('invisible');
    option.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, key);
  if (!opened) throw new Error(`No side-menu row for ${key}`);
  await game.page.waitForTimeout(700);

  const pane = await game.withMods((m) => m.cg.getCurrentOptionPane());
  if (pane !== key) throw new Error(`Expected the ${key} pane to be current, got ${pane}`);
}

/**
 * Choose an amount from a resource's quantity dropdown, through the dropdown.
 *
 * The game reads this back as `#<key>SellSelectQuantity div.dropdown` innerText
 * and matches it against the localized option labels, so the selection has to
 * travel through the option's own click handler to take effect — writing the
 * data attribute would leave the text stale and the preview unchanged.
 */
async function selectQuantity(game, key, value) {
  const ok = await game.page.evaluate(({ resource, option }) => {
    const container = document.getElementById(`${resource}SellSelectQuantity`);
    if (!container) return false;
    container.querySelector('div.dropdown')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const choice = container.querySelector(`div.dropdown-option[data-value="${option}"]`);
    if (!choice) return false;
    choice.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, { resource: key, option: value });
  if (!ok) throw new Error(`Could not choose "${value}" in the ${key} quantity dropdown`);
  // The preview is rebuilt by the frame loop, not by the dropdown handler.
  await game.page.waitForTimeout(500);
}

/** Press a button inside one of the pane's option rows. */
async function clickRowButton(game, rowId, selector = 'button') {
  const clicked = await game.page.evaluate(({ row, sel }) => {
    const button = document.getElementById(row)?.querySelector(sel);
    if (!button) return false;
    // Dispatched rather than clicked: several of these controls carry
    // `red-disabled-text` (pointer-events: none) at some point in a run, and a
    // real click would be swallowed by the CSS gate rather than reaching the
    // handler under test. Specs that care about the gate assert the class.
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, { row: rowId, sel: selector });
  if (!clicked) throw new Error(`No ${selector} inside #${rowId}`);
  await game.page.waitForTimeout(600);
}

/** Stock a resource and freeze its production, so a transaction is the only thing moving. */
async function stageStock(game, key, { quantity, capacity = 1e6 } = {}) {
  await game.withMods((m, config) => {
    m.rdo.setResourceDataObject(true, 'resources', [config.key, 'revealedYet']);
    m.rdo.setResourceDataObject(config.capacity, 'resources', [config.key, 'storageCapacity']);
    m.rdo.setResourceDataObject(config.quantity, 'resources', [config.key, 'quantity']);
    for (const tier of ['tier1', 'tier2', 'tier3', 'tier4']) {
      m.rdo.setResourceDataObject(0, 'resources', [config.key, 'upgrades', 'autoBuyer', tier, 'quantity']);
    }
  }, { key, quantity, capacity });
}

/** Read one resource's quantity, capacity, the cash balance and the live preview. */
async function readState(game, key) {
  return game.withMods((m, resource) => ({
    quantity: m.rdo.getResourceDataObject('resources', [resource, 'quantity']),
    capacity: m.rdo.getResourceDataObject('resources', [resource, 'storageCapacity']),
    cash: m.rdo.getResourceDataObject('currency', ['cash']),
    preview: m.cg.getResourceSalePreview(resource)
  }), key);
}

/** Grant every tech through the debug menu — the game's own route to a fully teched run. */
async function grantAllTechs(game) {
  await game.debugClick('grantAllTechsButton');
  await game.page.waitForTimeout(700);
}

/** Quantity gained per real second — the only honest evidence extraction is running. */
async function measureAccrualPerSecond(game, key, windowMs = 2500) {
  const read = () => game.withMods((m, resource) => ({
    q: m.rdo.getResourceDataObject('resources', [resource, 'quantity']),
    t: Date.now()
  }), key);

  const start = await read();
  await game.page.waitForTimeout(windowMs);
  const end = await read();
  return (end.q - start.q) / ((end.t - start.t) / 1000);
}

test.describe('Resources — storage limits', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('the Increase Storage button multiplies the cap and charges the old cap', async ({ game }) => {
    await openResource(game, 'hydrogen');

    const before = await readState(game, 'hydrogen');
    // Shipped cap; asserted so a data change makes this spec say so rather than
    // silently testing different arithmetic.
    expect(before.capacity).toBe(150);

    await stageStock(game, 'hydrogen', { quantity: 150, capacity: 150 });
    await clickRowButton(game, 'hydrogenIncreaseStorageRow');
    await game.page.waitForTimeout(600);

    const after = await readState(game, 'hydrogen');
    // increaseStorageFactor is 2, scaled by the efficient-storage buff (unbought
    // on a fresh run, so x1).
    expect(after.capacity).toBe(300);
    // The charge is the cap that was just outgrown, less one — the game leaves a
    // single unit behind deliberately so an upgrade cannot black out the grid.
    expect(after.quantity).toBe(1);
  });

  test('a second increase costs the new, larger cap', async ({ game }) => {
    await openResource(game, 'hydrogen');
    await stageStock(game, 'hydrogen', { quantity: 150, capacity: 150 });

    await clickRowButton(game, 'hydrogenIncreaseStorageRow');
    await game.page.waitForTimeout(600);
    const afterFirst = await readState(game, 'hydrogen');
    expect(afterFirst.capacity).toBe(300);

    // Restock to the new cap and buy again. If the price were pinned to the
    // starting capacity the second upgrade would cost 149 rather than 299.
    await stageStock(game, 'hydrogen', { quantity: 300, capacity: 300 });
    await clickRowButton(game, 'hydrogenIncreaseStorageRow');
    await game.page.waitForTimeout(600);

    const afterSecond = await readState(game, 'hydrogen');
    expect(afterSecond.capacity).toBe(600);
    expect(afterSecond.quantity).toBe(1);
  });

  test('production stops dead at the cap instead of overflowing it', async ({ game }) => {
    await openResource(game, 'hydrogen');

    // Five tier 1 autobuyers at the shipped rate is 10 hydrogen/second, so a
    // 40-unit gap closes well inside the window. Tier 1 needs no power, which is
    // why this holds on a fresh run with the grid down.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(150, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(110, 'resources', ['hydrogen', 'quantity']);
      m.rdo.setResourceDataObject(true, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'active']);
      m.rdo.setResourceDataObject(5, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
    });

    await game.page.waitForTimeout(4000);
    const filled = await readState(game, 'hydrogen');
    expect(filled.quantity).toBe(150);

    // And it stays there: a full store gains nothing further however long it runs.
    const rateWhenFull = await measureAccrualPerSecond(game, 'hydrogen', 2000);
    expect(rateWhenFull).toBe(0);
  });

  test('hitting the cap raises a storage-full notification whose action increases storage', async ({ game }) => {
    await openResource(game, 'hydrogen');

    await game.withMods((m) => {
      m.rdo.setResourceDataObject(150, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(120, 'resources', ['hydrogen', 'quantity']);
      m.rdo.setResourceDataObject(true, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'active']);
      m.rdo.setResourceDataObject(5, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
    });

    const action = game.page.locator('.notification-container.classification-storage button.notification-action-button');
    await action.waitFor({ state: 'visible', timeout: 30000 });

    const messages = await game.notifications('storage');
    expect(messages.join(' ')).toMatch(/hydrogen/i);

    const beforeAction = await readState(game, 'hydrogen');
    expect(beforeAction.capacity).toBe(150);

    await game.page.evaluate(() => {
      document
        .querySelector('.notification-container.classification-storage button.notification-action-button')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(900);

    // The notification's action is the same upgrade as the pane's button, so the
    // cap doubles and the charge is taken.
    const afterAction = await readState(game, 'hydrogen');
    expect(afterAction.capacity).toBe(300);
    expect(afterAction.quantity).toBeLessThan(150);
  });
});

test.describe('Resources — selling', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('the Sell button sells exactly the previewed amount and pays for it', async ({ game }) => {
    await openResource(game, 'hydrogen');
    await stageStock(game, 'hydrogen', { quantity: 137 });
    await game.withMods((m) => m.rdo.setResourceDataObject(0, 'currency', ['cash']));

    await selectQuantity(game, 'hydrogen', '100');

    const before = await readState(game, 'hydrogen');
    // The preview is the contract between the dropdown and the transaction: it is
    // what `sellResource()` parses.
    expect(before.preview).toContain('(100 ');

    await clickRowButton(game, 'hydrogenSellRow', 'button.sell');

    const after = await readState(game, 'hydrogen');
    const saleValue = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['hydrogen', 'saleValue']));

    expect(after.quantity).toBe(37);
    expect(after.cash).toBeCloseTo(100 * saleValue, 6);
  });

  test('the quantity selector decides how much the Sell button sells', async ({ game }) => {
    await openResource(game, 'hydrogen');

    // 120 divides cleanly by every proportional option, so each expectation is an
    // exact figure rather than a floor()-dependent one.
    const cases = [
      { option: 'all', expected: 120 },
      { option: 'threeQuarters', expected: 90 },
      { option: 'twoThirds', expected: 80 },
      { option: 'half', expected: 60 },
      { option: 'oneThird', expected: 40 },
      { option: '100', expected: 100 },
      { option: '10', expected: 10 },
      { option: '1', expected: 1 }
    ];

    const sold = [];
    for (const { option, expected } of cases) {
      await stageStock(game, 'hydrogen', { quantity: 120 });
      await selectQuantity(game, 'hydrogen', option);
      await clickRowButton(game, 'hydrogenSellRow', 'button.sell');
      const after = await readState(game, 'hydrogen');
      sold.push({ option, sold: 120 - after.quantity, expected });
    }

    expect(sold.filter((s) => s.sold !== s.expected)).toEqual([]);
  });

  test('selling more than is in stock sells the stock and no more', async ({ game }) => {
    await openResource(game, 'hydrogen');
    await stageStock(game, 'hydrogen', { quantity: 40 });
    await game.withMods((m) => m.rdo.setResourceDataObject(0, 'currency', ['cash']));

    await selectQuantity(game, 'hydrogen', '100');
    await clickRowButton(game, 'hydrogenSellRow', 'button.sell');

    const after = await readState(game, 'hydrogen');
    const saleValue = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['hydrogen', 'saleValue']));

    expect(after.quantity).toBe(0);
    expect(after.cash).toBeCloseTo(40 * saleValue, 6);
  });

  test('Sell All empties every unlocked resource and then disables itself', async ({ game }) => {
    // The debug grant is the game's own way to reach a stocked, fully unlocked
    // run: it reveals the categories, sets a 1M cap and stock on every resource
    // and compound, and unlocks them for sale.
    await game.debugClick('give100AllResourcesAndCompounds');
    await game.page.waitForTimeout(800);

    // Freeze production so the total banked is exactly the total snapshotted.
    await game.withMods((m, resources) => {
      m.rdo.setResourceDataObject(0, 'currency', ['cash']);
      for (const key of resources) {
        for (const tier of ['tier1', 'tier2', 'tier3', 'tier4']) {
          m.rdo.setResourceDataObject(0, 'resources', [key, 'upgrades', 'autoBuyer', tier, 'quantity']);
        }
      }
    }, ALL_RESOURCES);
    await game.page.waitForTimeout(400);

    const expectedCash = await game.withMods((m) => {
      const unlocked = new Set((m.cg.getUnlockedResourcesArray() || []).map((v) => String(v).toLowerCase()));
      const resources = m.rdo.getResourceDataObject('resources') || {};
      return Object.keys(resources)
        .filter((key) => unlocked.has(key.toLowerCase()))
        .reduce((sum, key) => {
          const quantity = Number(m.rdo.getResourceDataObject('resources', [key, 'quantity'])) || 0;
          const saleValue = Number(m.rdo.getResourceDataObject('resources', [key, 'saleValue'])) || 0;
          return sum + quantity * saleValue;
        }, 0);
    });
    expect(expectedCash).toBeGreaterThan(0);

    const sellAll = game.page.locator('#sellAllResourcesButton');
    await expect(sellAll).toBeEnabled();
    await sellAll.click();
    await game.page.waitForTimeout(800);

    const outcome = await game.withMods((m) => {
      const unlocked = new Set((m.cg.getUnlockedResourcesArray() || []).map((v) => String(v).toLowerCase()));
      const resources = m.rdo.getResourceDataObject('resources') || {};
      return {
        cash: m.rdo.getResourceDataObject('currency', ['cash']),
        leftover: Object.keys(resources)
          .filter((key) => unlocked.has(key.toLowerCase()))
          .map((key) => ({ key, quantity: m.rdo.getResourceDataObject('resources', [key, 'quantity']) }))
          .filter((entry) => entry.quantity !== 0)
      };
    });

    expect(outcome.leftover).toEqual([]);
    expect(outcome.cash).toBeCloseTo(expectedCash, 4);

    // With nothing left to sell the control disables itself — this one really is
    // a `disabled` attribute rather than the CSS colour gate used elsewhere.
    await expect(sellAll).toBeDisabled();
  });
});

test.describe('Resources — fusing', () => {
  test.setTimeout(240000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('the Fuse button is hidden until the fusion tech is researched', async ({ game }) => {
    await openResource(game, 'hydrogen');
    await stageStock(game, 'hydrogen', { quantity: 200 });
    await game.page.waitForTimeout(600);

    const beforeTech = await game.page.evaluate(() => {
      const button = document.querySelector('#hydrogenSellRow button.fuse');
      return button ? { present: true, invisible: button.classList.contains('invisible') } : { present: false };
    });
    expect(beforeTech.present).toBe(true);
    expect(beforeTech.invisible, 'no Hydrogen Fusion tech, so no Fuse button').toBe(true);

    await grantAllTechs(game);
    await game.page.waitForTimeout(800);

    const afterTech = await game.page.evaluate(() => {
      const button = document.querySelector('#hydrogenSellRow button.fuse');
      return {
        invisible: button.classList.contains('invisible'),
        disabled: button.classList.contains('red-disabled-text')
      };
    });
    expect(afterTech.invisible).toBe(false);
    expect(afterTech.disabled, 'stocked and teched, so the button is live').toBe(false);
  });

  test('the first fusion discovers the target resource at a quarter yield', async ({ game }) => {
    await grantAllTechs(game);
    await openResource(game, 'hydrogen');
    await stageStock(game, 'hydrogen', { quantity: 200 });
    await stageStock(game, 'helium', { quantity: 0 });
    await selectQuantity(game, 'hydrogen', '100');

    const lockedBefore = await game.withMods((m) => m.cg.getUnlockedResourcesArray().includes('helium'));
    expect(lockedBefore, 'helium is discovered by fusing, not by the tech').toBe(false);

    await clickRowButton(game, 'hydrogenSellRow', 'button.fuse');

    const after = await game.withMods((m) => ({
      hydrogen: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
      helium: m.rdo.getResourceDataObject('resources', ['helium', 'quantity']),
      unlocked: m.cg.getUnlockedResourcesArray().includes('helium')
    }));

    expect(after.unlocked, 'fusing discovers the product').toBe(true);
    expect(after.hydrogen).toBe(100);
    // Discovery pays a quarter of the ratio: ceil((100 x 0.5) / 4).
    expect(after.helium).toBe(13);

    // And the discovered resource becomes reachable in the side menu.
    const rowVisible = await game.page.evaluate(() =>
      !document.getElementById('heliumOption')?.closest('.row-side-menu')?.classList.contains('invisible'));
    expect(rowVisible).toBe(true);
  });

  test('once discovered, fusing converts at the full ratio with Fusion Efficiency III', async ({ game }) => {
    await grantAllTechs(game);
    await openResource(game, 'hydrogen');
    await stageStock(game, 'hydrogen', { quantity: 400 });
    await stageStock(game, 'helium', { quantity: 0 });
    await selectQuantity(game, 'hydrogen', '100');

    // First press discovers helium; the conversion rule under test is the one
    // that applies from the second press onwards.
    await clickRowButton(game, 'hydrogenSellRow', 'button.fuse');
    await game.page.waitForTimeout(500);

    const midpoint = await game.withMods((m) => ({
      hydrogen: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
      helium: m.rdo.getResourceDataObject('resources', ['helium', 'quantity'])
    }));

    await clickRowButton(game, 'hydrogenSellRow', 'button.fuse');

    const after = await game.withMods((m) => ({
      hydrogen: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
      helium: m.rdo.getResourceDataObject('resources', ['helium', 'quantity'])
    }));

    expect(midpoint.hydrogen - after.hydrogen).toBe(100);
    // fusionEfficiencyIII is granted, so efficiency is 1 and the yield is the
    // whole ratio: 100 x 0.5. Without the tech it would be a random 20-80%.
    expect(after.helium - midpoint.helium).toBe(50);
  });

  test('the quantity selector decides how much is fused, and the preview shows the yield', async ({ game }) => {
    await grantAllTechs(game);
    await openResource(game, 'hydrogen');
    await stageStock(game, 'hydrogen', { quantity: 400 });
    await stageStock(game, 'helium', { quantity: 0 });

    // Discover helium first so the preview carries the fusion suffix at all —
    // it is suppressed while neither fusion target is known.
    await selectQuantity(game, 'hydrogen', '10');
    await clickRowButton(game, 'hydrogenSellRow', 'button.fuse');
    await game.page.waitForTimeout(500);

    await selectQuantity(game, 'hydrogen', '10');
    const atTen = await readState(game, 'hydrogen');
    expect(atTen.preview).toMatch(/->\s*5\s/);

    await selectQuantity(game, 'hydrogen', '100');
    const atHundred = await readState(game, 'hydrogen');
    expect(atHundred.preview).toMatch(/->\s*50\s/);

    const before = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['helium', 'quantity']));
    await clickRowButton(game, 'hydrogenSellRow', 'button.fuse');
    const after = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['helium', 'quantity']));

    // The amount fused follows the dropdown, not the last value the button saw.
    expect(after - before).toBe(50);
  });

  test('fusion is limited by the target resource storage, and says so', async ({ game }) => {
    await grantAllTechs(game);
    await openResource(game, 'hydrogen');
    await stageStock(game, 'hydrogen', { quantity: 400 });
    await stageStock(game, 'helium', { quantity: 0, capacity: 120 });

    await selectQuantity(game, 'hydrogen', '10');
    await clickRowButton(game, 'hydrogenSellRow', 'button.fuse');
    await game.page.waitForTimeout(500);

    // Leave room for only 10 helium, then fuse enough hydrogen for 50.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(120, 'resources', ['helium', 'storageCapacity']);
      m.rdo.setResourceDataObject(110, 'resources', ['helium', 'quantity']);
      m.rdo.setResourceDataObject(400, 'resources', ['hydrogen', 'quantity']);
    });
    await selectQuantity(game, 'hydrogen', '100');
    await clickRowButton(game, 'hydrogenSellRow', 'button.fuse');

    const after = await game.withMods((m) => ({
      hydrogen: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
      helium: m.rdo.getResourceDataObject('resources', ['helium', 'quantity']),
      capacity: m.rdo.getResourceDataObject('resources', ['helium', 'storageCapacity'])
    }));

    // The store fills exactly to the brim and the surplus is lost — the source is
    // still spent in full, which is the cost of fusing into a full tank.
    expect(after.helium).toBe(after.capacity);
    expect(after.hydrogen).toBe(300);

    const warnings = await game.notifications('fuse');
    expect(warnings.length).toBeGreaterThan(0);
  });

  test('carbon fuses to both of its targets in a single press', async ({ game }) => {
    await grantAllTechs(game);
    await openResource(game, 'carbon');
    await stageStock(game, 'carbon', { quantity: 400 });
    await stageStock(game, 'neon', { quantity: 0 });
    await stageStock(game, 'sodium', { quantity: 0 });

    // Discover both products first, so the press under test takes the normal
    // conversion branch for each target.
    await selectQuantity(game, 'carbon', '10');
    await clickRowButton(game, 'carbonSellRow', 'button.fuse');
    await game.page.waitForTimeout(500);

    await game.withMods((m) => {
      m.rdo.setResourceDataObject(400, 'resources', ['carbon', 'quantity']);
      m.rdo.setResourceDataObject(0, 'resources', ['neon', 'quantity']);
      m.rdo.setResourceDataObject(0, 'resources', ['sodium', 'quantity']);
    });
    await selectQuantity(game, 'carbon', '100');

    const preview = (await readState(game, 'carbon')).preview;
    expect(preview).toMatch(/->\s*30\s/);
    expect(preview).toMatch(/,\s*20\s/);

    await clickRowButton(game, 'carbonSellRow', 'button.fuse');

    const after = await game.withMods((m) => ({
      carbon: m.rdo.getResourceDataObject('resources', ['carbon', 'quantity']),
      neon: m.rdo.getResourceDataObject('resources', ['neon', 'quantity']),
      sodium: m.rdo.getResourceDataObject('resources', ['sodium', 'quantity'])
    }));

    // Carbon's ratios are 0.3 to neon and 0.2 to sodium, at full efficiency.
    expect(after.neon).toBe(30);
    expect(after.sodium).toBe(20);
    // One press, one charge — the source is not billed twice for two targets.
    expect(after.carbon).toBe(300);
  });
});

test.describe('Resources — autobuyer tiers and the techs that unlock them', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('a fresh run offers tier 1 only; the higher tiers are not on the pane', async ({ game }) => {
    await openResource(game, 'hydrogen');
    await game.page.waitForTimeout(900);

    const rows = await game.page.evaluate(() =>
      [1, 2, 3, 4].map((tier) => ({
        tier,
        hidden: document.getElementById(`hydrogenAutoBuyer${tier}Row`)?.classList.contains('invisible')
      })));

    expect(rows[0].hidden, 'tier 1 is available from the start').toBe(false);
    expect(rows.slice(1).map((r) => r.hidden), 'tiers 2-4 wait on tech').toEqual([true, true, true]);

    const level = await game.withMods((m) => m.rdo.getAutoBuyerTierLevel('hydrogen', 'resources'));
    expect(level).toBe(1);
  });

  test('researching the techs raises the tier level and puts every tier on the pane', async ({ game }) => {
    await openResource(game, 'hydrogen');
    await grantAllTechs(game);
    await game.page.waitForTimeout(1200);

    const level = await game.withMods((m) => m.rdo.getAutoBuyerTierLevel('hydrogen', 'resources'));
    expect(level).toBe(4);

    const rows = await game.page.evaluate(() =>
      [1, 2, 3, 4].map((tier) =>
        document.getElementById(`hydrogenAutoBuyer${tier}Row`)?.classList.contains('invisible')));
    expect(rows).toEqual([false, false, false, false]);

    // The rule is per-resource and driven off the same data, so it must hold for
    // all of them rather than for the one pane that happens to be open.
    const levels = await game.withMods((m, resources) =>
      resources.map((key) => ({ key, level: m.rdo.getAutoBuyerTierLevel(key, 'resources') })), EXTRACTABLE);
    expect(levels.filter((entry) => entry.level !== 4)).toEqual([]);
  });

  test('buying a tier 1 autobuyer charges the resource, raises the price and starts extraction', async ({ game }) => {
    await openResource(game, 'hydrogen');
    await stageStock(game, 'hydrogen', { quantity: 150, capacity: 1e6 });

    const before = await game.withMods((m) => ({
      quantity: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
      price: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'price']),
      owned: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']),
      rateTier1: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'rate'])
    }));
    expect(before.owned).toBe(0);

    // Nothing owned, nothing extracted — the baseline that makes the measurement
    // below mean something.
    expect(await measureAccrualPerSecond(game, 'hydrogen', 1500)).toBe(0);

    await clickRowButton(game, 'hydrogenAutoBuyer1Row');
    await game.page.waitForTimeout(900);

    const after = await game.withMods((m) => ({
      quantity: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
      price: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'price']),
      owned: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])
    }));

    expect(after.owned).toBe(1);
    expect(after.price).toBeGreaterThan(before.price);
    // The charge is applied by the frame loop, not by the click handler, and
    // production has already started replacing some of it by the time this reads.
    expect(after.quantity).toBeLessThan(before.quantity);

    // 0.02 per 10ms tick is 2 hydrogen/second for one autobuyer — but the star
    // the run begins in is randomised, and a B-type adds a flat 0.02 to every
    // tier 1 rate, which doubles it. Derive the expectation from the boost the
    // game reports rather than pinning a figure that only holds for some stars.
    const bTypeBoost = await game.withMods((m) => m.game.getBTypeAutoBuyerBoostForTier(1));
    const expected = (before.rateTier1 + bTypeBoost) * 100;

    const rate = await measureAccrualPerSecond(game, 'hydrogen', 2500);
    expect(rate).toBeGreaterThan(expected * 0.8);
    expect(rate).toBeLessThan(expected * 1.2);
  });

  test('a higher tier bought through its own button out-produces tier 1', async ({ game }) => {
    await openResource(game, 'hydrogen');
    await grantAllTechs(game);
    await game.page.waitForTimeout(1000);

    // Tiers 2 and up need the grid, and the tech grant does not switch it on.
    await game.withMods((m) => {
      m.cg.setInfinitePower(true);
      m.cg.setPowerOnOff(true);
      m.rdo.setResourceDataObject(1e9, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(1e6, 'resources', ['hydrogen', 'quantity']);
      for (const tier of ['tier1', 'tier2', 'tier3', 'tier4']) {
        m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', tier, 'quantity']);
      }
    });

    await clickRowButton(game, 'hydrogenAutoBuyer1Row');
    await game.page.waitForTimeout(700);
    const tier1Rate = await measureAccrualPerSecond(game, 'hydrogen', 2500);

    await game.withMods((m) =>
      m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']));
    await clickRowButton(game, 'hydrogenAutoBuyer2Row');
    await game.page.waitForTimeout(700);
    const tier2Rate = await measureAccrualPerSecond(game, 'hydrogen', 2500);

    const owned = await game.withMods((m) => ({
      tier1: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']),
      tier2: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])
    }));
    expect(owned).toEqual({ tier1: 0, tier2: 1 });

    expect(tier1Rate).toBeGreaterThan(0);
    // Shipped rates are 0.02 and 0.1 — a five-fold step.
    expect(tier2Rate).toBeGreaterThan(tier1Rate * 3);
  });
});

test.describe('Resources — catalogue invariants', () => {
  test.setTimeout(120000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('each tier extracts faster and costs more than the one below it', async ({ game }) => {
    // Solar is excluded: all four of its tiers are rate 0 by design, because
    // solar output is driven by the power system rather than by autobuyers.
    const inversions = await game.withMods((m, config) => {
      const { resources, tiers } = config;
      const bad = [];

      for (const key of resources) {
        const read = (tier, field) =>
          m.rdo.getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', tier, field]) || 0;

        for (let i = 1; i < tiers.length; i++) {
          if (read(tiers[i], 'rate') <= read(tiers[i - 1], 'rate')) {
            bad.push(`${key}: ${tiers[i]} is not faster than ${tiers[i - 1]}`);
          }
          if (read(tiers[i], 'price') <= read(tiers[i - 1], 'price')) {
            bad.push(`${key}: ${tiers[i]} is not dearer than ${tiers[i - 1]}`);
          }
        }
      }
      return bad;
    }, { resources: EXTRACTABLE, tiers: TIERS });

    expect(inversions).toEqual([]);
  });

  test('every resource name resolves to real copy in all five languages', async ({ game }) => {
    const problems = await game.withMods(async (m, config) => {
      const { resources, languages } = config;
      const original = m.cg.getLanguage();
      const issues = [];

      for (const language of languages) {
        await m.loc.initLocalization(language);
        for (const key of resources) {
          const token = `resource${key.charAt(0).toUpperCase()}${key.slice(1)}`;
          const value = m.loc.localize(token, language);
          if (!value || value === token) issues.push(`${language}/${key}: unresolved`);
        }
      }

      await m.loc.initLocalization(original);
      return issues;
    }, { resources: ALL_RESOURCES, languages: ['en', 'es', 'pt', 'de', 'it', 'fr'] });

    expect(problems).toEqual([]);
  });

  test('driving the resource panes raises no console or page errors', async ({ game }) => {
    await game.debugClick('give100AllResourcesAndCompounds');
    await game.page.waitForTimeout(600);

    for (const key of EXTRACTABLE) {
      await openResource(game, key);
    }

    expect(game.significantErrors()).toEqual([]);
  });
});
