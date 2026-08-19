/**
 * Area: Ascendency Perks — the pane, played
 * Plan: tests/docs/areas/ascendency.md
 *
 * `ascendency.spec.js` keeps the catalogue checks that have no UI to drive —
 * the shape of each buff record, and whether its description resolves in all
 * five languages. Everything that a player can actually *do* lives here, and is
 * done through the real pane: the Buy buttons on tab 7 → Ascendency Perks, the
 * frame loop that colours them, and the debug menu's AP grant.
 *
 * Four things are proved, because between them they are the whole feature:
 *
 * | Question | How it is answered here |
 * |---|---|
 * | How many can I buy? | the frame loop's own green/red classification is compared, perk by perk, against the affordability rule at three different balances the run actually reaches |
 * | Where does AP come from, and where does it go? | granted through the debug menu, spent through the button, and the balance is checked to the point |
 * | Is the price right? | a rebuyable perk is bought to its cap and the price quoted, the price charged, and `baseCost × multiple^boughtYet` are held equal at every step |
 * | Does the perk do anything? | measured — production throughput and energy accrual are timed before and after the purchase, rather than reading the multiplier field back |
 *
 * The last row is the one that matters most. A spec that asserts
 * `effectCategoryMagnitude === 1.5` passes with the whole effect chain deleted.
 *
 * Affordability is deliberately never tested by clicking a red button and
 * checking nothing happened: the gate in this game is the `red-disabled-text`
 * class, whose CSS is `pointer-events: none`, and a dispatched click goes
 * straight through it by design. The class is the assertion.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** The AP the debug menu's grant button pays, per click. */
const DEBUG_AP_GRANT = 100;

/** The perks whose effect is measured rather than read back. */
const SMART_AUTO_BUYERS_MULTIPLIER = 1.5;
const OPTIMIZED_POWER_GRIDS_MULTIPLIER = 1.2;

// ------------------------------------------------------------------- utilities

/**
 * Dispatch a click straight at an element.
 *
 * The perk buttons sit inside an option row whose description container overlaps
 * them, so a real click at their coordinates can land on the coverer. Note this
 * also bypasses the `pointer-events: none` affordability gate — which is why no
 * assertion here infers "the purchase was refused" from a dispatched click.
 */
async function clickElement(game, selector) {
  const fired = await game.page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, selector);
  if (!fired) throw new Error(`Nothing matched ${selector}`);
  await game.page.waitForTimeout(400);
}

/** Close whatever modal is currently up, so the next click is not swallowed. */
async function dismissAnyOpenModal(page, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    const closed = await page.evaluate(() => {
      const confirm = document.getElementById('modalConfirm');
      if (confirm?.offsetParent) { confirm.click(); return true; }
      const cancel = document.getElementById('modalCancel');
      if (cancel?.offsetParent) { cancel.click(); return true; }
      return false;
    });
    if (!closed) return;
    await page.waitForTimeout(400);
  }
}

/** Open a side-menu option by id, revealing its row first. */
async function openOptionById(game, optionId, tab = null) {
  if (tab !== null) await game.openTab(tab);
  await game.page.evaluate((id) => {
    const el = document.getElementById(id);
    el?.closest('.row-side-menu')?.classList.remove('invisible');
    el?.classList.remove('invisible');
    el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, optionId);
  await game.page.waitForTimeout(600);
}

/**
 * Open the Ascendency Perks pane and wait until the frame loop owns it.
 *
 * `ascendencyBuffChecks()` only runs while `getCurrentOptionPane()` is
 * `'ascendency perks'`, so with any other pane open every button keeps whatever
 * class it was drawn with and the affordability assertions below would be
 * reading a snapshot rather than a live decision.
 */
async function openPerksPane(game) {
  await openOptionById(game, 'ascendencyOption', 7);
  const pane = await game.withMods((m) => m.cg.getCurrentOptionPane());
  expect(pane, 'the perk buttons are only maintained while their pane is open')
    .toBe('ascendency perks');
  await game.page.waitForSelector('button.ascendency-buff-button', { timeout: 15000 });
  // One frame with the pane open, so the buttons carry a live classification.
  await game.page.waitForTimeout(600);
}

/** Grant AP through the debug menu's own button — the game's sanctioned route. */
async function grantAp(game, clicks = 1) {
  await game.openDebugMenu();
  await game.debugClick('add100ApButton', { times: clicks });
  await game.page.waitForTimeout(300);
}

/** The player's AP balance. */
function currentAp(game) {
  return game.withMods((m) => m.cg.getAscendencyPoints());
}

/**
 * Every perk row as the pane is currently showing it, paired with the catalogue
 * record behind it.
 *
 * The key is reconstructed from the button's `buff-class-` token exactly the way
 * `checkAscendencyButtons()` does it, so a row this helper cannot resolve is a
 * row the game cannot resolve either.
 */
async function readPerkRows(game) {
  return game.withMods((m) => {
    const buffs = m.rdo.getAscendencyBuffDataObject();
    const ap = m.cg.getAscendencyPoints();

    return Array.from(document.querySelectorAll('button.ascendency-buff-button')).map((button) => {
      const token = Array.from(button.classList).find((c) => c.startsWith('buff-class-')) || '';
      const key = token
        .replace('buff-class-', '')
        .split('-')
        .map((word, index) => (index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1)))
        .join('');

      const buff = buffs[key] || null;
      const capitalised = key.charAt(0).toUpperCase() + key.slice(1);
      const costEl = document.getElementById(`${key}CostText`);
      const statusEl = document.getElementById(`buff${capitalised}BuyStatusText`);

      const maxed = buff
        ? (buff.rebuyable ? buff.boughtYet >= buff.timesRebuyable : buff.boughtYet > 0)
        : true;
      const price = buff
        ? Math.round(buff.rebuyable
          ? buff.baseCostAp * Math.pow(buff.rebuyableIncreaseMultiple, buff.boughtYet)
          : buff.baseCostAp)
        : null;

      return {
        key,
        resolved: Boolean(buff),
        ready: button.classList.contains('green-ready-text'),
        blocked: button.classList.contains('red-disabled-text'),
        costText: (costEl?.textContent || '').trim(),
        statusText: (statusEl?.textContent || '').trim(),
        boughtYet: buff?.boughtYet ?? null,
        rebuyable: buff?.rebuyable ?? null,
        timesRebuyable: buff?.timesRebuyable ?? null,
        baseCostAp: buff?.baseCostAp ?? null,
        price,
        maxed,
        // What the rules say the button should be showing right now.
        shouldBeReady: Boolean(buff) && ap >= price && !maxed
      };
    });
  });
}

/** Press the Buy button on one perk row. */
async function buyPerk(game, key, { slug = null } = {}) {
  const token = slug ?? key.replace(/([A-Z])/g, '-$1').toLowerCase();
  await clickElement(game, `button.ascendency-buff-button.buff-class-${token}`);
}

/** Measure a resource's accrual per real second — the only honest proof of a rate. */
async function measureAccrualPerSecond(game, { category = 'resources', key = 'oxygen', windowMs = 3000 } = {}) {
  const read = () => game.withMods((m, config) => ({
    q: m.rdo.getResourceDataObject(config.category, [config.key, 'quantity']),
    t: Date.now()
  }), { category, key });

  const start = await read();
  await game.page.waitForTimeout(windowMs);
  const end = await read();
  return (end.q - start.q) / ((end.t - start.t) / 1000);
}

/** Stage one tier-1 autobuyer that runs whether or not the grid is up. */
async function stageTier1Production(game, key = 'oxygen') {
  await game.withMods((m, resource) => {
    m.rdo.setResourceDataObject(true, 'resources', [resource, 'revealedYet']);
    m.rdo.setResourceDataObject(0, 'resources', [resource, 'quantity']);
    m.rdo.setResourceDataObject(1e15, 'resources', [resource, 'storageCapacity']);
    for (const tier of ['tier1', 'tier2', 'tier3', 'tier4']) {
      m.rdo.setResourceDataObject(0, 'resources', [resource, 'upgrades', 'autoBuyer', tier, 'quantity']);
    }
    m.rdo.setResourceDataObject(true, 'resources', [resource, 'upgrades', 'autoBuyer', 'tier1', 'active']);
    m.rdo.setResourceDataObject(10, 'resources', [resource, 'upgrades', 'autoBuyer', 'tier1', 'rate']);
    m.rdo.setResourceDataObject(100, 'resources', [resource, 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
    m.rdo.setResourceDataObject(1, 'resources', [resource, 'upgrades', 'autoBuyer', 'currentTierLevel']);
  }, key);
  await game.page.waitForTimeout(600);
}

// ---------------------------------------------------------- the pane as drawn

test.describe('Ascendency Perks — the pane a player opens', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.openDebugMenu();
    await game.debugClick('unlockAllTabsButton');
  });

  test('every perk in the catalogue gets a row, quoting its catalogue price', async ({ game }) => {
    await openPerksPane(game);

    const rows = await readPerkRows(game);
    const catalogue = await game.withMods((m) => Object.keys(m.rdo.getAscendencyBuffDataObject())
      .filter((k) => k !== 'version'));

    expect(rows.length, 'one Buy button per perk').toBe(catalogue.length);
    expect(rows.map((r) => r.key).sort()).toEqual([...catalogue].sort());

    // Every button resolves back to a real catalogue entry. A row that does not
    // is a row the frame loop silently skips, so it would never enable or
    // disable — it would sit red forever whatever the player's balance.
    expect(rows.filter((r) => !r.resolved).map((r) => r.key)).toEqual([]);

    for (const row of rows) {
      expect(row.costText, `${row.key} should quote its price`).toBe(`${row.price} AP`);
      expect(row.price, `${row.key} first price is its base cost`).toBe(row.baseCostAp);
    }
  });

  test('a fresh save can afford nothing, and every button says so', async ({ game }) => {
    await openPerksPane(game);

    expect(await currentAp(game), 'a new pioneer has earned no AP yet').toBe(0);

    const rows = await readPerkRows(game);
    const affordable = rows.filter((r) => r.ready);

    expect(affordable, 'nothing is buyable on zero AP').toEqual([]);
    for (const row of rows) {
      expect(row.blocked, `${row.key} should be gated`).toBe(true);
      expect(row.statusText, `${row.key} starts unbought`).toBe('Not Bought');
    }
  });

  // ------------------------------------------------- how many you can buy

  test('the pane lights up exactly the perks the balance can pay for', async ({ game }) => {
    await openPerksPane(game);

    // Three balances the run genuinely passes through: nothing, a debug grant,
    // and whatever is left after spending some of it.
    const seen = [];

    const audit = async (label) => {
      await game.page.waitForTimeout(700);
      const ap = await currentAp(game);
      const rows = await readPerkRows(game);
      const wrong = rows.filter((r) => r.ready !== r.shouldBeReady);
      expect(wrong.map((r) => `${r.key}: ${r.price} AP, ready=${r.ready}, ap=${ap}`),
        `the affordability classification is wrong at ${label}`).toEqual([]);
      // Ready and blocked are opposites, never both and never neither.
      expect(rows.filter((r) => r.ready === r.blocked), `${label}: a button in both states`).toEqual([]);
      seen.push({ label, ap, affordable: rows.filter((r) => r.ready).length });
    };

    await audit('zero AP');

    await grantAp(game, 1);
    await openPerksPane(game);
    await audit('after one debug grant');

    // Spend some of it on the cheapest perk, then re-audit: prices above the new
    // balance must have gone red, and the perk just bought must be off the list.
    const cheapest = (await readPerkRows(game))
      .filter((r) => r.ready)
      .sort((a, b) => a.price - b.price)[0];
    expect(cheapest, 'a 100 AP balance should afford something').toBeTruthy();
    await buyPerk(game, cheapest.key);
    await audit('after spending');

    expect(seen[0].affordable, 'nothing at zero').toBe(0);
    expect(seen[1].affordable, 'a grant should open several perks up').toBeGreaterThan(0);
    expect(seen[1].ap).toBe(DEBUG_AP_GRANT);
    expect(seen[2].ap).toBe(DEBUG_AP_GRANT - cheapest.price);
  });

  test('buying the affordable perks one at a time never overdraws the balance', async ({ game }) => {
    await grantAp(game, 1);
    await openPerksPane(game);

    const spent = [];
    // Buy greedily, cheapest first, until the pane says nothing else is
    // affordable. This is the player's own "how many can I buy?" answered by
    // actually buying them.
    for (let round = 0; round < 25; round++) {
      const rows = await readPerkRows(game);
      const next = rows.filter((r) => r.ready && r.shouldBeReady).sort((a, b) => a.price - b.price)[0];
      if (!next) break;

      const before = await currentAp(game);
      await buyPerk(game, next.key);
      await dismissAnyOpenModal(game.page);
      const after = await currentAp(game);

      expect(after, `${next.key} should cost exactly the ${next.price} AP it quoted`)
        .toBe(before - next.price);
      expect(after, 'AP must never go negative').toBeGreaterThanOrEqual(0);
      spent.push({ key: next.key, price: next.price });
      await game.page.waitForTimeout(400);
    }

    expect(spent.length, 'a 100 AP balance should buy several perks').toBeGreaterThan(1);
    const total = spent.reduce((sum, s) => sum + s.price, 0);
    expect(await currentAp(game)).toBe(DEBUG_AP_GRANT - total);

    // The pane agrees the shopping trip is over.
    const remaining = await readPerkRows(game);
    expect(remaining.filter((r) => r.ready), 'nothing affordable should still look ready').toEqual([]);

    expect(game.significantErrors()).toEqual([]);
  });

  // --------------------------------------------------------- price validation

  test('a rebuyable perk doubles in price each time, and charges what it quotes', async ({ game }) => {
    // Efficient Storage: 10 AP base, ×2 per purchase, three purchases allowed.
    // 10 + 20 + 40 = 70, so one grant covers the whole ladder with room over.
    await grantAp(game, 1);
    await openPerksPane(game);

    const ladder = [];
    for (let purchase = 0; purchase < 3; purchase++) {
      const row = (await readPerkRows(game)).find((r) => r.key === 'efficientStorage');
      const expectedPrice = Math.round(row.baseCostAp * Math.pow(2, purchase));

      expect(row.boughtYet, 'the counter should track purchases').toBe(purchase);
      expect(row.price, `purchase ${purchase + 1} price`).toBe(expectedPrice);
      expect(row.costText, 'the quoted price is the computed price').toBe(`${expectedPrice} AP`);
      expect(row.ready, 'the ladder should stay affordable').toBe(true);

      const before = await currentAp(game);
      await buyPerk(game, 'efficientStorage');
      const after = await currentAp(game);
      expect(after, `purchase ${purchase + 1} should charge ${expectedPrice}`).toBe(before - expectedPrice);

      ladder.push(expectedPrice);
      await game.page.waitForTimeout(500);
    }

    expect(ladder).toEqual([10, 20, 40]);

    // The cap is real: three is the limit, and the row says so rather than
    // quoting a fourth price the player can never pay.
    const capped = (await readPerkRows(game)).find((r) => r.key === 'efficientStorage');
    expect(capped.boughtYet).toBe(3);
    expect(capped.ready, 'a maxed perk is never buyable again').toBe(false);
    expect(capped.blocked).toBe(true);
    expect(capped.costText).toBe('Bought Max');

    // And it stays capped even when the player is rich.
    await grantAp(game, 3);
    await openPerksPane(game);
    const stillCapped = (await readPerkRows(game)).find((r) => r.key === 'efficientStorage');
    expect(stillCapped.ready, 'money cannot buy a fourth').toBe(false);
    expect(await game.withMods((m) => m.rdo.getAscendencyBuffDataObject().efficientStorage.boughtYet)).toBe(3);
  });

  test('a one-shot perk can only ever be bought once', async ({ game }) => {
    await grantAp(game, 1);
    await openPerksPane(game);

    const before = await currentAp(game);
    await buyPerk(game, 'littleBagOfHydrogen');
    await game.page.waitForTimeout(600);

    const bought = (await readPerkRows(game)).find((r) => r.key === 'littleBagOfHydrogen');
    expect(bought.boughtYet).toBe(1);
    expect(await currentAp(game)).toBe(before - 3);
    expect(bought.statusText, 'the row should report the purchase').toBe('Bought');
    expect(bought.costText).toBe('Bought');
    expect(bought.ready, 'a non-rebuyable perk is spent').toBe(false);
    expect(bought.blocked).toBe(true);

    // A second attempt must not be reachable *and* must not settle: the button
    // is gated, and the underlying handler refuses a perk already at its cap.
    await buyPerk(game, 'littleBagOfHydrogen');
    await game.page.waitForTimeout(500);
    expect(await game.withMods((m) => m.rdo.getAscendencyBuffDataObject().littleBagOfHydrogen.boughtYet),
      'the count must not climb past one').toBe(1);
  });

  test('spending AP for the first time earns the Spend Ascendency Points achievement', async ({ game }) => {
    await grantAp(game, 1);
    await openPerksPane(game);

    expect(await game.withMods((m) => m.rdo.getAchievementDataObject('spendAP', ['active'])),
      'nothing has been spent yet').toBe(false);

    await buyPerk(game, 'littleBagOfHydrogen');
    // The flag is a queue the frame loop drains; the grant lands a frame later.
    await game.page.waitForFunction(
      () => globalThis.__mods.rdo.getAchievementDataObject('spendAP', ['active']) === true,
      undefined,
      { timeout: 20000 }
    );

    expect(await game.withMods((m) => m.rdo.getAchievementDataObject('spendAP', ['active']))).toBe(true);
  });
});

// -------------------------------------------------------- what the perks do

test.describe('Ascendency Perks — the effect, measured', () => {
  test.setTimeout(240000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.openDebugMenu();
    await game.debugClick('unlockAllTabsButton');
    await grantAp(game, 1);
  });

  test('Smart Auto Buyers makes an autobuyer measurably faster', async ({ game }) => {
    await stageTier1Production(game);
    // Tier 1 runs unpowered, so the measurement cannot be disturbed by the grid
    // tripping part way through the window.
    const before = await measureAccrualPerSecond(game);
    expect(before, 'the staged autobuyer must be producing to begin with').toBeGreaterThan(0);

    await openPerksPane(game);
    const row = (await readPerkRows(game)).find((r) => r.key === 'smartAutoBuyers');
    expect(row.ready, 'the grant should cover this perk').toBe(true);
    await buyPerk(game, 'smartAutoBuyers');
    await game.page.waitForTimeout(600);

    const after = await measureAccrualPerSecond(game);

    // The perk is a rate multiplier, so the *throughput* has to move — not just
    // the number in the data object.
    expect(after / before, 'production should scale by the perk multiplier')
      .toBeCloseTo(SMART_AUTO_BUYERS_MULTIPLIER, 1);
  });

  test('Optimized Power Grids makes the grid measurably stronger', async ({ game }) => {
    // A plant that is actually burning fuel, so the energy line is real output
    // rather than a staged number.
    await game.withMods((m) => {
      m.cg.setInfinitePower(false);
      m.rdo.setResourceDataObject(1e9, 'resources', ['carbon', 'storageCapacity']);
      m.rdo.setResourceDataObject(1e9, 'resources', ['carbon', 'quantity']);
      m.rdo.setResourceDataObject(5, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
      // The grid reads `purchasedRate`, which is derived from quantity x rate
      // when a plant is bought — staging the quantity alone leaves it at zero
      // and the plant generates nothing.
      m.game.addBuildingPotentialRate('powerPlant1');
      m.rdo.setResourceDataObject(true, 'buildings', ['energy', 'batteryBoughtYet']);
      m.rdo.setResourceDataObject(1e12, 'buildings', ['energy', 'storageCapacity']);
      m.rdo.setResourceDataObject(0, 'buildings', ['energy', 'quantity']);
      m.game.toggleBuildingTypeOnOff('powerPlant1', true);
      m.cg.setPowerOnOff(true);
    });
    await game.page.waitForTimeout(1500);

    const measureEnergy = async () => {
      const read = () => game.withMods((m) => ({
        q: m.rdo.getResourceDataObject('buildings', ['energy', 'quantity']),
        t: Date.now()
      }));
      const start = await read();
      await game.page.waitForTimeout(3000);
      const end = await read();
      return (end.q - start.q) / ((end.t - start.t) / 1000);
    };

    const before = await measureEnergy();
    expect(before, 'the plant must be generating before the perk is bought').toBeGreaterThan(0);

    await openPerksPane(game);
    const row = (await readPerkRows(game)).find((r) => r.key === 'optimizedPowerGrids');
    expect(row.ready, 'the grant should cover this perk').toBe(true);
    await buyPerk(game, 'optimizedPowerGrids');
    await game.page.waitForTimeout(800);

    const after = await measureEnergy();
    expect(after / before, 'the grid should generate faster by the perk multiplier')
      .toBeCloseTo(OPTIMIZED_POWER_GRIDS_MULTIPLIER, 1);
  });

  test('Compound Automation unlocks compound machining and tells the player', async ({ game }) => {
    await openPerksPane(game);

    expect(await game.withMods((m) => m.cg.getTechUnlockedArray().includes('compoundMachining')),
      'compound machining is behind the perk').toBe(false);

    await buyPerk(game, 'compoundAutomation');
    await game.page.waitForTimeout(700);

    // On the first run the purchase raises a modal announcing the new tab. It is
    // the player's only notice that the perk did anything, so it is asserted
    // rather than merely dismissed.
    const announced = await game.page.evaluate(() =>
      Boolean(document.getElementById('modalConfirm')?.offsetParent));
    expect(announced, 'run 1 should be told the compound machining tab opened').toBe(true);
    await dismissAnyOpenModal(game.page);

    expect(await game.withMods((m) => m.cg.getTechUnlockedArray().includes('compoundMachining'))).toBe(true);
  });

  test('Robotic Research Automation switches the research autobuyer on and shows its row', async ({ game }) => {
    await openPerksPane(game);

    const before = await game.withMods((m) => ({
      active: Boolean(m.rdo.getResourceDataObject('research', ['upgrades', 'autoBuyer', 'active'])),
      rowHidden: document.getElementById('researchAutoBuyerRow')?.classList.contains('invisible') ?? null
    }));
    expect(before.active, 'the research autobuyer starts off').toBe(false);

    await buyPerk(game, 'roboticResearchAutomation');
    await game.page.waitForTimeout(700);

    expect(await game.withMods((m) =>
      Boolean(m.rdo.getResourceDataObject('research', ['upgrades', 'autoBuyer', 'active']))))
      .toBe(true);

    // The frame loop reveals the row off the same flag, which is what makes the
    // perk visible to the player rather than only to the save file.
    await openOptionById(game, 'researchOption', 3);
    await game.page.waitForFunction(
      () => {
        const row = document.getElementById('researchAutoBuyerRow');
        return Boolean(row) && !row.classList.contains('invisible');
      },
      undefined,
      { timeout: 20000 }
    );
  });

  test('Auto Space Telescope enables the automatic scan row', async ({ game }) => {
    await openPerksPane(game);

    expect(await game.withMods((m) =>
      Boolean(m.rdo.getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'autoSpaceTelescopeRowEnabled']))))
      .toBe(false);

    await buyPerk(game, 'autoSpaceTelescope');
    await game.page.waitForTimeout(700);

    expect(await game.withMods((m) =>
      Boolean(m.rdo.getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'autoSpaceTelescopeRowEnabled']))))
      .toBe(true);
  });

  test('Non Exhaustive Resources arms the never-run-dry rule', async ({ game }) => {
    await openPerksPane(game);

    expect(await game.withMods((m) => m.cg.getNonExhaustiveResources()),
      'resources start exhaustible').toBe(false);

    await buyPerk(game, 'nonExhaustiveResources');
    await game.page.waitForTimeout(700);

    expect(await game.withMods((m) => m.cg.getNonExhaustiveResources())).toBe(true);
    // What the flag then *does* is a rebirth-time grant, and is measured in the
    // carry-over spec below rather than asserted here.
  });
});

// ------------------------------------------------------- surviving a rebirth

test.describe('Ascendency Perks — carrying over a rebirth', () => {
  // A real rebirth needs the whole run set up, a destination scanned, and the
  // reset itself; the button is pressed through its confirmation modal.
  test.setTimeout(420000);

  /** Put the run in the state a scanned, conquerable destination leaves behind. */
  async function scanDestinationSystem(game, starName) {
    const staged = await game.withMods((m, name) => {
      m.game.generateStarDataAndAddToDataObject({ id: name }, 12);
      m.cg.setDestinationStar(name);
      m.rdo.copyStarDataToDestinationStarField(name);
      m.cg.setDestinationStarScanned(true);
      return Boolean(m.rdo.getStarSystemDataObject('stars', ['destinationStar'], true));
    }, starName);
    if (!staged) throw new Error(`Could not stage a scanned destination at ${starName}`);
  }

  /** Press Rebirth and confirm it, the way the player has to. */
  async function rebirthThroughTheUI(game, page) {
    await dismissAnyOpenModal(page);
    await openOptionById(game, 'rebirthOption', 7);

    const state = await page.evaluate(() => {
      const el = document.querySelector('button.rebirth-check');
      return el ? { disabled: el.disabled, ready: el.classList.contains('green-ready-text') } : null;
    });
    expect(state, 'the Rebirth pane should expose its button').not.toBeNull();
    expect(state.disabled, 'the run should have earned its rebirth').toBe(false);
    expect(state.ready).toBe(true);

    const runBefore = await game.withMods((m) => m.cg.getStatRun());
    const confirmLabel = await game.withMods((m) =>
      m.loc.localize('modalRebirthConfirmLabel', m.cg.getLanguage()));

    await page.evaluate(() => document.querySelector('button.rebirth-check')?.click());
    await page.waitForFunction(
      (label) => document.getElementById('modalConfirm')?.innerText?.trim() === label,
      confirmLabel,
      { timeout: 15000 }
    );
    await page.evaluate(() => document.getElementById('modalConfirm').click());

    await page.waitForFunction(
      (before) => globalThis.__mods.cg.getStatRun() === before + 1,
      runBefore,
      { timeout: 30000 }
    );
    await page.waitForTimeout(1500);
    await dismissAnyOpenModal(page);
    await page.waitForTimeout(800);
    return runBefore + 1;
  }

  test('every perk bought is still bought, still paid for, and still working after a rebirth', async ({ game, page }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await dismissAnyOpenModal(page);

    // Enough AP for the whole basket under test, granted the way the debug menu
    // grants it.
    await grantAp(game, 2);
    await openPerksPane(game);

    // One of each kind of perk, so the reset has to replay every mechanism it
    // owns: a rate multiplier, a grid multiplier, a tech unlock, a flag, a
    // starting-stock grant, and a rebuyable bought more than once.
    const basket = [
      'smartAutoBuyers',
      'optimizedPowerGrids',
      'compoundAutomation',
      'nonExhaustiveResources',
      'jumpstartResearch',
      'efficientStorage',
      'efficientStorage'
    ];
    for (const key of basket) {
      await buyPerk(game, key);
      await dismissAnyOpenModal(page);
      await game.page.waitForTimeout(400);
    }

    const before = await game.withMods((m) => {
      const perks = Object.fromEntries(
        Object.entries(m.rdo.getAscendencyBuffDataObject())
          .filter(([key]) => key !== 'version')
          .map(([key, buff]) => [key, buff.boughtYet])
      );
      return {
        perks,
        ap: m.cg.getAscendencyPoints(),
        autoBuyerRate: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'rate']),
        plantRate: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'purchasedRate']),
        run: m.cg.getStatRun()
      };
    });

    expect(before.perks.smartAutoBuyers, 'the basket should have been bought').toBe(1);
    expect(before.perks.efficientStorage, 'the rebuyable one twice').toBe(2);

    await scanDestinationSystem(game, 'Aludra');
    await game.withMods((m) => m.cg.setBattleResolved(true, 'player'));
    const newRun = await rebirthThroughTheUI(game, page);

    const after = await game.withMods((m) => {
      const perks = Object.fromEntries(
        Object.entries(m.rdo.getAscendencyBuffDataObject())
          .filter(([key]) => key !== 'version')
          .map(([key, buff]) => [key, buff.boughtYet])
      );
      const techs = m.cg.getTechUnlockedArray() ?? [];
      const cheapTechs = Object.entries(m.rdo.getResourceDataObject('techs'))
        .filter(([, tech]) => tech.price <= 4200)
        .map(([key]) => key);
      return {
        perks,
        ap: m.cg.getAscendencyPoints(),
        run: m.cg.getStatRun(),
        autoBuyerRate: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'rate']),
        plantRate: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'purchasedRate']),
        nonExhaustive: m.cg.getNonExhaustiveResources(),
        hasCompoundMachining: techs.includes('compoundMachining'),
        missingCheapTechs: cheapTechs.filter((key) => !techs.includes(key)),
        hydrogen: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
        hydrogenTier1Price: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'price'])
      };
    });

    expect(after.run).toBe(newRun);

    // 1. The ledger: every purchase count survives, and so does the balance.
    expect(after.perks, 'no perk may be forgotten by the reset').toEqual(before.perks);
    expect(after.ap, 'a rebirth never spends the player\'s AP').toBeGreaterThanOrEqual(before.ap);

    // 2. The multipliers are re-applied to the fresh run, not merely remembered.
    //    The rebirth resets every rate to its pristine value, then replays each
    //    perk once per purchase — so the new run's rate must carry the perk.
    const pristine = await game.withMods((m) => ({
      autoBuyerRate: m.rdo.resourceDataRebirthCopy?.resources?.hydrogen?.upgrades?.autoBuyer?.tier1?.rate ?? null,
      plantRate: m.rdo.resourceDataRebirthCopy?.buildings?.energy?.upgrades?.powerPlant1?.purchasedRate ?? null
    }));
    expect(pristine.autoBuyerRate, 'the baseline copy should hold a rate to compare against').toBeGreaterThan(0);
    expect(after.autoBuyerRate / pristine.autoBuyerRate,
      'Smart Auto Buyers should be re-applied to the new run')
      .toBeCloseTo(SMART_AUTO_BUYERS_MULTIPLIER, 5);
    expect(after.plantRate / pristine.plantRate,
      'Optimized Power Grids should be re-applied to the new run')
      .toBeCloseTo(OPTIMIZED_POWER_GRIDS_MULTIPLIER, 5);

    // 3. The unlocks are handed back.
    expect(after.hasCompoundMachining, 'Compound Automation is permanent').toBe(true);
    expect(after.missingCheapTechs, 'Jumpstart Research re-grants every cheap tech').toEqual([]);
    expect(after.nonExhaustive, 'Non Exhaustive Resources is permanent').toBe(true);

    // 4. Non Exhaustive Resources pays its starting stock into the new run:
    //    enough of every resource to buy that resource's first autobuyer.
    expect(after.hydrogen, 'the new run should start able to afford its first autobuyer')
      .toBeGreaterThanOrEqual(after.hydrogenTier1Price);

    expect(game.significantErrors()).toEqual([]);
  });

  test('the hydrogen bag pays out on the next run, and the AP balance is untouched by the reset', async ({ game, page }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await dismissAnyOpenModal(page);

    await grantAp(game, 1);
    await openPerksPane(game);
    await buyPerk(game, 'littleBagOfHydrogen');
    await game.page.waitForTimeout(500);

    const apAfterPurchase = await currentAp(game);
    expect(apAfterPurchase).toBe(DEBUG_AP_GRANT - 3);

    await scanDestinationSystem(game, 'Suhail');
    await game.withMods((m) => m.cg.setBattleResolved(true, 'player'));
    await rebirthThroughTheUI(game, page);

    const after = await game.withMods((m) => ({
      ap: m.cg.getAscendencyPoints(),
      bought: m.rdo.getAscendencyBuffDataObject().littleBagOfHydrogen.boughtYet,
      hydrogen: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
      tier1Price: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'price']),
      helium: m.rdo.getResourceDataObject('resources', ['helium', 'quantity'])
    }));

    expect(after.bought, 'the purchase itself survives').toBe(1);
    // A rebirth pays AP in; what it must never do is take any away.
    expect(after.ap, 'the balance carried over').toBeGreaterThanOrEqual(apAfterPurchase);

    // The bag is exactly that: enough hydrogen for the first autobuyer, and
    // nothing for any other resource — that is what separates it from the Non
    // Exhaustive Resources perk, which stocks all of them.
    expect(after.hydrogen).toBeGreaterThanOrEqual(after.tier1Price);
    expect(after.helium, 'the bag is hydrogen only').toBe(0);

    expect(game.significantErrors()).toEqual([]);
  });
});
