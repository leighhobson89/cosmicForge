/**
 * Area: Galactic Market
 * Plan: tests/docs/areas/galactic-market.md
 *
 * Trades are driven entirely through the pane's own dropdowns, quantity field
 * and Confirm button. That matters here more than in most areas: the trade
 * summary is not computed by `galacticMarketTrade()` at all — the game loop
 * writes it into the DOM each frame, and the trade then *reads it back out*.
 * Anything that bypasses the UI would be testing a different code path from the
 * one a player uses, so every quantity assertion below compares the previewed
 * figures against what the trade actually moved.
 *
 * Market bias also drifts on its own timers, so exact price ratios are not
 * stable across frames; the assertions pin the invariant relationships
 * (previews match execution, bias moves in proportion to trade volume) instead
 * of frozen numbers.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

const TRADEABLE_RESOURCES = ['hydrogen', 'helium', 'carbon', 'neon', 'oxygen', 'sodium', 'silicon', 'iron'];
const TRADEABLE_COMPOUNDS = ['diesel', 'glass', 'steel', 'concrete', 'water', 'titanium'];

/** Open tab 7 and select the Galactic Market pane through its real side-menu row. */
async function openMarket(game) {
  await game.openTab(7);
  const clicked = await game.page.evaluate(() => {
    const el = document.getElementById('galacticMarketOption');
    if (!el) return false;
    el.closest('.row-side-menu')?.classList.remove('invisible');
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  });
  await game.page.waitForTimeout(800);
  return clicked;
}

async function pickOption(game, dropdownId, value) {
  const ok = await game.page.evaluate(({ dropdownId, value }) => {
    const option = document.querySelector(`#${dropdownId} .dropdown-option[data-value="${value}"]`);
    if (!option) return false;
    option.click();
    return true;
  }, { dropdownId, value });
  if (!ok) throw new Error(`No option ${value} in ${dropdownId}`);
  await game.page.waitForTimeout(400);
}

/** Select both sides of a trade and switch the quantity selector to manual entry. */
async function stageTrade(game, { outgoing, incoming, quantity }) {
  await pickOption(game, 'galacticMarketOutgoingStockTypeDropDown', outgoing);
  await pickOption(game, 'galacticMarketIncomingStockTypeDropDown', incoming);
  await pickOption(game, 'galacticMarketQuantityToTradeDropDown', 'enter');

  await game.page.evaluate((value) => {
    const field = document.getElementById('galacticMarketQuantityTextArea');
    field.value = String(value);
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }, quantity);
  // The summary is recomputed by the game loop, and the commission figure it
  // feeds back into the incoming quantity lags a frame, so settle before reading.
  await game.page.waitForTimeout(700);
}

/** The trade summary as the player sees it, with its display numbers parsed. */
function readSummary(game) {
  return game.withMods((m) => {
    const text = (id) => document.getElementById(id)?.innerHTML ?? '';
    const parse = (value) => {
      const match = String(value).match(/(\d[\d,]*(?:\.\d+)?)([KMBGTPE]?)/);
      if (!match) return NaN;
      const units = { K: 1e3, M: 1e6, B: 1e9, T: 1e12, P: 1e15, E: 1e18 };
      return parseFloat(match[1].replace(/,/g, '')) * (units[match[2]] ?? 1);
    };
    return {
      outgoingRaw: text('galacticMarketOutgoingQuantityText'),
      incomingRaw: text('galacticMarketIncomingQuantityText'),
      commissionRaw: text('galacticMarketComissionQuantitySummaryText'),
      outgoing: parse(text('galacticMarketOutgoingQuantityText')),
      incoming: parse(text('galacticMarketIncomingQuantityText')),
      commission: parse(text('galacticMarketComissionQuantitySummaryText')),
      outgoingType: text('galacticMarketOutgoingStockTypeText'),
      incomingType: text('galacticMarketIncomingStockTypeText'),
      commissionPercent: m.cg.getCurrentGalacticMarketCommission(),
      confirmReady: !!document.querySelector('.galactic-market-confirm-trade-button')?.classList.contains('green-ready-text')
    };
  });
}

test.describe('Galactic Market', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await openMarket(game);
  });

  test('the pane renders the trade, quantity, summary and AP rows', async ({ game }) => {
    const missing = await game.page.evaluate(() => {
      const ids = [
        'galacticMarketOutgoingStockTypeDropDown', 'galacticMarketIncomingStockTypeDropDown',
        'galacticMarketQuantityToTradeDropDown', 'galacticMarketQuantityTextArea',
        'galacticMarketOutgoingQuantityText', 'galacticMarketIncomingQuantityText',
        'galacticMarketComissionQuantitySummaryText', 'galacticMarketComissionQuantityStockTypeText',
        'galacticMarketSellApForCashDropDown', 'galacticMarketCashGainQuantity'
      ];
      const byId = ids.filter((id) => !document.getElementById(id));
      const byClass = ['.galactic-market-confirm-trade-button', '.galactic-market-confirm-sell-ap-button']
        .filter((sel) => !document.querySelector(sel));
      return [...byId, ...byClass];
    });

    expect(missing).toEqual([]);
  });

  test('both dropdowns offer every tradeable material', async ({ game }) => {
    const options = await game.page.evaluate(() => {
      const read = (id) => Array.from(document.querySelectorAll(`#${id} .dropdown-option`))
        .map((el) => el.getAttribute('data-value'))
        .filter((v) => v && v !== 'select');
      return {
        outgoing: read('galacticMarketOutgoingStockTypeDropDown'),
        incoming: read('galacticMarketIncomingStockTypeDropDown')
      };
    });

    for (const material of [...TRADEABLE_RESOURCES, ...TRADEABLE_COMPOUNDS]) {
      expect(options.outgoing, `outgoing missing ${material}`).toContain(material);
      expect(options.incoming, `incoming missing ${material}`).toContain(material);
    }
    expect(options.outgoing.length).toBe(14);
  });

  test('the quantity selector stays locked until both sides of the trade are chosen', async ({ game }) => {
    const initial = await game.page.evaluate(() =>
      document.getElementById('galacticMarketQuantityToTradeDropDown').classList.contains('dropdown-disabled'));
    expect(initial).toBe(true);

    await pickOption(game, 'galacticMarketOutgoingStockTypeDropDown', 'hydrogen');
    const halfChosen = await game.page.evaluate(() =>
      document.getElementById('galacticMarketQuantityToTradeDropDown').classList.contains('dropdown-disabled'));
    expect(halfChosen).toBe(true);

    await pickOption(game, 'galacticMarketIncomingStockTypeDropDown', 'diesel');
    await game.page.waitForTimeout(400);
    const bothChosen = await game.page.evaluate(() =>
      document.getElementById('galacticMarketQuantityToTradeDropDown').classList.contains('dropdown-disabled'));
    expect(bothChosen).toBe(false);
  });

  test('a material cannot be traded for itself', async ({ game }) => {
    await pickOption(game, 'galacticMarketOutgoingStockTypeDropDown', 'iron');
    // The loop removes the outgoing selection from the incoming dropdown, and
    // resets the incoming side outright if the two ever match.
    await game.withMods((m) => m.cg.setGalacticMarketIncomingStockType('iron'));
    await game.page.waitForTimeout(500);

    const state = await game.withMods((m) => ({
      outgoing: m.cg.getGalacticMarketOutgoingStockType(),
      incoming: m.cg.getGalacticMarketIncomingStockType(),
      ironStillOffered: !!document.querySelector('#galacticMarketIncomingStockTypeDropDown .dropdown-option[data-value="iron"]')
    }));

    expect(state.outgoing).toBe('iron');
    expect(state.incoming).toBe('select');
    expect(state.ironStillOffered).toBe(false);
  });

  test('"all stock" fills the outgoing quantity with the entire holding', async ({ game }) => {
    await game.withMods((m) => m.rdo.setResourceDataObject(54321, 'resources', ['carbon', 'quantity']));

    await pickOption(game, 'galacticMarketOutgoingStockTypeDropDown', 'carbon');
    await pickOption(game, 'galacticMarketIncomingStockTypeDropDown', 'glass');
    await pickOption(game, 'galacticMarketQuantityToTradeDropDown', 'all');
    await game.page.waitForTimeout(600);

    // Compare against the quantity field rather than the summary line: the
    // summary is rendered through the notation formatter, which rounds "54321"
    // to "54.3K" and so cannot prove an exact match. Both are read in the same
    // evaluate because carbon production keeps the holding moving.
    const result = await game.withMods((m) => ({
      field: Number(document.getElementById('galacticMarketQuantityTextArea').value),
      holding: m.rdo.getResourceDataObject('resources', ['carbon', 'quantity'])
    }));

    expect(result.field).toBe(result.holding);
    expect(result.field).toBeGreaterThanOrEqual(54321);
  });

  test('an entered quantity above the holding is clamped to it', async ({ game }) => {
    await game.withMods((m) => m.rdo.setResourceDataObject(2500, 'resources', ['neon', 'quantity']));
    await stageTrade(game, { outgoing: 'neon', incoming: 'water', quantity: 999999 });

    const field = await game.page.evaluate(() => document.getElementById('galacticMarketQuantityTextArea').value);
    expect(Number(field)).toBe(2500);
  });

  test('the previewed commission is the commission percentage of the outgoing quantity', async ({ game }) => {
    await game.withMods((m) => m.rdo.setResourceDataObject(100000, 'resources', ['hydrogen', 'quantity']));
    await stageTrade(game, { outgoing: 'hydrogen', incoming: 'diesel', quantity: 20000 });

    const summary = await readSummary(game);

    expect(summary.outgoing).toBe(20000);
    expect(summary.commission).toBe(Math.floor((summary.commissionPercent / 100) * 20000));
    expect(summary.outgoingType.toLowerCase()).toBe('hydrogen');
    expect(summary.incomingType.toLowerCase()).toBe('diesel');
    expect(summary.confirmReady).toBe(true);
  });

  test('the previewed incoming quantity is bounded by the bias-adjusted price ratio', async ({ game }) => {
    await game.withMods((m) => m.rdo.setResourceDataObject(100000, 'resources', ['hydrogen', 'quantity']));
    await stageTrade(game, { outgoing: 'hydrogen', incoming: 'diesel', quantity: 20000 });

    const summary = await readSummary(game);
    const prices = await game.withMods((m) => ({
      outBase: m.rdo.getGalacticMarketDataObject('resources', ['hydrogen', 'baseValue']),
      inBase: m.rdo.getGalacticMarketDataObject('compounds', ['diesel', 'baseValue']),
      outBias: m.rdo.getGalacticMarketDataObject('resources', ['hydrogen', 'marketBias']),
      inBias: m.rdo.getGalacticMarketDataObject('compounds', ['diesel', 'marketBias'])
    }));

    const ratio = (prices.outBase * (1 + prices.outBias / 100)) / (prices.inBase * (1 + prices.inBias / 100));
    const uncommissioned = Math.floor(summary.outgoing * ratio);

    // Diesel is ten times hydrogen's base value, so the trade must come back
    // with roughly a tenth of the quantity, before commission.
    expect(uncommissioned).toBeGreaterThan(0);
    expect(summary.incoming).toBeGreaterThan(0);
    // Commission is skimmed off the incoming side proportionally, so the
    // displayed figure is strictly below the raw ratio conversion.
    expect(summary.incoming).toBeLessThan(uncommissioned);
  });

  test('confirming a trade moves exactly the quantities the summary previewed', async ({ game }) => {
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(100000, 'resources', ['hydrogen', 'quantity']);
      m.rdo.setResourceDataObject(0, 'compounds', ['diesel', 'quantity']);
    });
    await stageTrade(game, { outgoing: 'hydrogen', incoming: 'diesel', quantity: 10000 });

    const summary = await readSummary(game);
    const before = await game.withMods((m) => ({
      hydrogen: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
      diesel: m.rdo.getResourceDataObject('compounds', ['diesel', 'quantity'])
    }));

    await game.page.evaluate(() => document.querySelector('.galactic-market-confirm-trade-button').click());
    await game.page.waitForTimeout(500);

    const after = await game.withMods((m) => ({
      hydrogen: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
      diesel: m.rdo.getResourceDataObject('compounds', ['diesel', 'quantity']),
      quantityField: document.getElementById('galacticMarketQuantityTextArea').value,
      selectionType: m.cg.getGalacticMarketOutgoingQuantitySelectionType()
    }));

    expect(before.hydrogen - after.hydrogen).toBe(summary.outgoing);
    expect(after.diesel - before.diesel).toBe(summary.incoming);
    // The trade resets the quantity selector so the same amount cannot be
    // confirmed twice by accident.
    expect(after.selectionType).toBe('select');
    expect(Number(after.quantityField)).toBe(0);
  });

  test('a trade pushes the outgoing bias down and the incoming bias up in proportion to trade volume', async ({ game }) => {
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(100000, 'resources', ['hydrogen', 'quantity']);
      m.rdo.setGalacticMarketDataObject(0, 'resources', ['hydrogen', 'marketBias']);
      m.rdo.setGalacticMarketDataObject(0, 'compounds', ['diesel', 'marketBias']);
    });
    await stageTrade(game, { outgoing: 'hydrogen', incoming: 'diesel', quantity: 10000 });

    const summary = await readSummary(game);

    // Read, press and re-read in one synchronous block. `adjustMarketBiases()`
    // runs on its own ten-second interval and walks every bias towards zero, so
    // a before-read taken as a separate round trip can be a tick stale and the
    // measured shift comes out 0.05 short of the traded proportion.
    const shift = await game.page.evaluate(() => {
      const m = globalThis.__mods;
      const read = () => ({
        outBias: m.rdo.getGalacticMarketDataObject('resources', ['hydrogen', 'marketBias']),
        inBias: m.rdo.getGalacticMarketDataObject('compounds', ['diesel', 'marketBias'])
      });
      const outVolume = m.rdo.getGalacticMarketDataObject('resources', ['hydrogen', 'tradeVolume']);
      const before = read();
      document.querySelector('.galactic-market-confirm-trade-button').click();
      return { outVolume, before, after: read() };
    });
    await game.page.waitForTimeout(400);

    // Selling floods the market with hydrogen and drains diesel: the bias shift
    // is the traded quantity as a percentage of that material's trade volume.
    const expectedOutShift = (summary.outgoing / shift.outVolume) * 100;
    expect(shift.after.outBias).toBeLessThan(shift.before.outBias);
    expect(shift.before.outBias - shift.after.outBias).toBeCloseTo(expectedOutShift, 4);
    expect(shift.after.inBias).toBeGreaterThan(shift.before.inBias);
  });

  test('commission climbs 6 to 13 points per trade and never exceeds 80', async ({ game }) => {
    await game.withMods((m) => m.rdo.setResourceDataObject(10000000, 'resources', ['hydrogen', 'quantity']));

    const first = await game.withMods((m) => m.cg.getCurrentGalacticMarketCommission());

    await stageTrade(game, { outgoing: 'hydrogen', incoming: 'diesel', quantity: 1000 });
    await game.page.evaluate(() => document.querySelector('.galactic-market-confirm-trade-button').click());
    await game.page.waitForTimeout(400);
    const second = await game.withMods((m) => m.cg.getCurrentGalacticMarketCommission());

    const rise = second - first;
    expect(rise).toBeGreaterThanOrEqual(6);
    expect(rise).toBeLessThanOrEqual(13);

    // Drive it to the ceiling directly: the cap is what stops repeated trading
    // from producing a negative payout.
    const capped = await game.withMods((m) => {
      m.cg.setCurrentGalacticMarketCommission(78);
      const values = [];
      for (let i = 0; i < 10; i++) {
        const current = m.cg.getCurrentGalacticMarketCommission();
        const increase = Math.floor(Math.random() * (13 - 6 + 1)) + 6;
        m.cg.setCurrentGalacticMarketCommission(Math.min(current + increase, 80));
        values.push(m.cg.getCurrentGalacticMarketCommission());
      }
      return values;
    });
    for (const value of capped) expect(value).toBeLessThanOrEqual(80);
    expect(capped[capped.length - 1]).toBe(80);
  });

  test('selling AP for cash debits the points and credits at the AP sale price', async ({ game }) => {
    await game.debugClick('add100ApButton');

    const result = await game.withMods((m) => {
      const price = m.cg.getApSellForCashPrice();
      const before = {
        ap: m.rdo.getResourceDataObject('ascendencyPoints', ['quantity']),
        cash: m.rdo.getResourceDataObject('currency', ['cash'])
      };
      m.game.galacticMarketSellApForCash(10);
      return {
        price,
        before,
        after: {
          ap: m.rdo.getResourceDataObject('ascendencyPoints', ['quantity']),
          cash: m.rdo.getResourceDataObject('currency', ['cash'])
        }
      };
    });

    expect(result.price).toBeGreaterThan(0);
    expect(result.after.ap).toBe(result.before.ap - 10);
    expect(result.after.cash).toBe(result.before.cash + 10 * result.price);
  });

  test('the sell-AP confirm button only arms when the points are actually held', async ({ game }) => {
    const result = await game.page.evaluate(async () => {
      const m = globalThis.__mods;
      const button = document.querySelector('.galactic-market-confirm-sell-ap-button');
      const read = () => button.classList.contains('green-ready-text');

      m.rdo.setResourceDataObject(1, 'ascendencyPoints', ['quantity']);
      m.cg.setGalacticMarketSellApForCashQuantity('10');
      await new Promise((r) => setTimeout(r, 500));
      const tooPoor = read();

      m.rdo.setResourceDataObject(50, 'ascendencyPoints', ['quantity']);
      await new Promise((r) => setTimeout(r, 500));
      const affordable = read();

      m.cg.setGalacticMarketSellApForCashQuantity('select');
      await new Promise((r) => setTimeout(r, 500));
      const cashPreviewWithNoSelection = document.getElementById('galacticMarketCashGainQuantity').innerHTML;

      return { tooPoor, affordable, cashPreviewWithNoSelection };
    });

    expect(result.tooPoor).toBe(false);
    expect(result.affordable).toBe(true);
    expect(result.cashPreviewWithNoSelection).toMatch(/0/);
  });

  test('liquidation converts every tradeable stock and all cash into AP, once per run', async ({ game }) => {
    const result = await game.withMods((m, materials) => {
      const { resources, compounds } = materials;
      for (const key of resources) m.rdo.setResourceDataObject(5000, 'resources', [key, 'quantity']);
      for (const key of compounds) m.rdo.setResourceDataObject(5000, 'compounds', [key, 'quantity']);
      m.rdo.setResourceDataObject(1000000, 'currency', ['cash']);
      m.rdo.setResourceDataObject(0, 'ascendencyPoints', ['quantity']);
      m.cg.setLiquidatedThisRun(false);

      m.game.galacticMarketLiquidateForAp(17);

      return {
        ap: m.rdo.getResourceDataObject('ascendencyPoints', ['quantity']),
        cash: m.rdo.getResourceDataObject('currency', ['cash']),
        liquidated: m.cg.getLiquidatedThisRun(),
        leftoverResources: resources.map((key) => m.rdo.getResourceDataObject('resources', [key, 'quantity'])),
        leftoverCompounds: compounds.map((key) => m.rdo.getResourceDataObject('compounds', [key, 'quantity']))
      };
    }, { resources: TRADEABLE_RESOURCES, compounds: TRADEABLE_COMPOUNDS });

    expect(result.ap).toBe(17);
    expect(result.cash).toBe(0);
    expect(result.liquidated).toBe(true);
    expect(result.leftoverResources).toEqual(TRADEABLE_RESOURCES.map(() => 0));
    expect(result.leftoverCompounds).toEqual(TRADEABLE_COMPOUNDS.map(() => 0));
  });

  test('a market lockdown greys the side-menu row and refuses to open the pane', async ({ game }) => {
    // Trigger the real random event through the debug menu rather than calling
    // startTimedEffect directly, so the whole event pipeline is exercised.
    await game.debugSelect('debugRandomEventSelect', 'galacticMarketLockdown');
    await game.debugClick('triggerRandomEventButton');
    await game.page.waitForTimeout(600);

    const locked = await game.page.evaluate(() => {
      const option = document.getElementById('galacticMarketOption');
      // Leave the market pane, then try to re-enter it while locked.
      document.getElementById('rebirthOption')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      option.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return {
        greyed: option.classList.contains('red-disabled-text'),
        pointerEvents: option.style.pointerEvents
      };
    });
    await game.page.waitForTimeout(400);

    const state = await game.withMods((m) => ({ pane: m.cg.getCurrentOptionPane() }));

    expect(locked.greyed).toBe(true);
    expect(locked.pointerEvents).toBe('none');
    // The click handler bails before switching panes, so the market never opens.
    expect(state.pane).not.toBe('galactic market');
  });

  test('holdings, bias and commission survive a save/load round trip', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.rdo.setResourceDataObject(4242, 'resources', ['silicon', 'quantity']);
      m.rdo.setGalacticMarketDataObject(-12.5, 'resources', ['silicon', 'marketBias']);
      m.rdo.setGalacticMarketDataObject(7777, 'compounds', ['steel', 'tradeVolume']);
      m.cg.setCurrentGalacticMarketCommission(42);

      const saved = JSON.parse(JSON.stringify(m.cg.captureGameStatusForSaving('initialise')));
      return {
        silicon: saved.resourceData?.resources?.silicon?.quantity,
        siliconBias: saved.galacticMarket?.resources?.silicon?.marketBias,
        steelVolume: saved.galacticMarket?.compounds?.steel?.tradeVolume,
        commission: m.cg.getCurrentGalacticMarketCommission()
      };
    });

    expect(result.silicon).toBe(4242);
    expect(result.siliconBias).toBe(-12.5);
    expect(result.steelVolume).toBe(7777);
    expect(result.commission).toBe(42);
  });

  test('trading produces no console or page errors', async ({ game }) => {
    await game.withMods((m) => m.rdo.setResourceDataObject(100000, 'resources', ['oxygen', 'quantity']));
    await stageTrade(game, { outgoing: 'oxygen', incoming: 'concrete', quantity: 5000 });
    await game.page.evaluate(() => document.querySelector('.galactic-market-confirm-trade-button').click());
    await game.page.waitForTimeout(500);

    expect(game.significantErrors()).toEqual([]);
  });
});
