/**
 * Area: Galactic Market — the market played through its own pane
 * Plan: tests/docs/areas/galactic-market.md
 *
 * `galactic-market.spec.js` proves the data and the handlers. Several of its
 * cases call `galacticMarketSellApForCash()` and `galacticMarketLiquidateForAp()`
 * outright, and none of them ever presses the Liquidate button. This file never
 * calls a market function directly: every trade, every AP sale and the whole
 * liquidation go through the dropdowns, the quantity field and the buttons a
 * player uses, and the assertions are made against what the pane rendered.
 *
 * ## Why the DOM is the contract here, not a convenience
 *
 * The trade summary is **not** computed by `galacticMarketTrade()`. The frame
 * loop writes it into the pane and the trade then reads it back out:
 *
 *   galacticMarketChecks()        outgoing text  <- the quantity field
 *     -> calculateIncomingQuantity()             incoming <- bias-adjusted ratio
 *     -> commission text          <- floor(commission% x outgoing)
 *     -> incoming text            <- incoming less its share of the commission
 *   Confirm -> galacticMarketTrade()
 *     -> parseNumber(outgoing text)              the *rendered* string is the input
 *     -> moves both holdings, shifts both biases
 *
 * `galacticMarketChecks()` only runs while the Galactic tab is open *and* the
 * market pane is the current one, so a trade staged from anywhere else has no
 * summary at all and moves nothing. That interlock is invisible to a
 * function-level test and is the reason every spec below opens the pane first.
 *
 * ## The rounding trap, and why these specs run in plain notation
 *
 * Because the trade parses the rendered string, the notation setting is part of
 * the transaction. In the default condensed mode `12345` renders as `12.3K` and
 * `parseNumber` reads it back as `12300` — so on the outgoing side the *display*
 * decides what is actually deducted, and on the incoming side the display is a
 * rounded-down version of the exact figure the trade credits from
 * `getGalacticMarketIncomingQuantity()`.
 *
 * That makes "the pane's promise equals the transaction" uncheckable in
 * condensed mode: the two legitimately differ by the rounding. Every spec here
 * therefore stages the **plain** notation setting, which groups in thousands and
 * loses nothing, so the rendered figures and the moved quantities can be
 * compared as exact integers. It is a shipped setting rather than a test-only
 * fiction, and the notation area covers the formatter itself.
 *
 * ## The demand mechanic
 *
 * Three separate clocks move prices, and the specs are written around all three:
 *
 *   - a trade shifts both sides' bias immediately, by the traded quantity as a
 *     percentage of that material's `tradeVolume`;
 *   - `adjustMarketBiases()` walks every bias back towards zero every 10s, in a
 *     step sized by the bias's own magnitude (0.05 / 0.5 / 5 / 50);
 *   - the market cycle, every 2-5 minutes, re-rolls both AP prices, drops the
 *     commission by 20 (floor 10) and re-rolls every trade volume.
 *
 * Only the first two are reachable inside a test's lifetime. The third is driven
 * by a closure-local `setInterval` with no handle, so nothing here depends on it
 * — but everything here reads commission and the AP price live, in the same
 * evaluation as the assertion, so a cycle landing mid-spec cannot fail a run.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

const TRADEABLE_RESOURCES = ['hydrogen', 'helium', 'carbon', 'neon', 'oxygen', 'sodium', 'silicon', 'iron'];
const TRADEABLE_COMPOUNDS = ['diesel', 'glass', 'steel', 'concrete', 'water', 'titanium'];
const ALL_MATERIALS = [...TRADEABLE_RESOURCES, ...TRADEABLE_COMPOUNDS];

const categoryOf = (material) => (TRADEABLE_RESOURCES.includes(material) ? 'resources' : 'compounds');

// The sweep trades all fourteen materials in one test, and the commission cap
// test makes a dozen consecutive trades; both outrun the default budget.
test.describe.configure({ timeout: 300_000 });

// ------------------------------------------------------------------ navigation

/**
 * Open a side-menu row by id and wait for its pane to draw.
 *
 * Rows are dispatched at rather than clicked: on tab 7 the side menu sits under
 * the content column's overlay on a narrow viewport, and a real click lands on
 * the coverer. None of these rows is gated on affordability, so bypassing
 * pointer-events costs nothing here — where a spec means to test a *gate*, it
 * asserts the class instead (see the lockdown and liquidation cases).
 */
async function openRow(game, optionId) {
  const found = await game.page.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el) return false;
    el.classList.remove('invisible');
    el.closest('.row-side-menu')?.classList.remove('invisible');
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, optionId);
  await game.page.waitForTimeout(700);
  return found;
}

async function openMarket(game) {
  await game.openTab(7);
  const opened = await openRow(game, 'galacticMarketOption');
  if (!opened) throw new Error('The Galactic Market row is not on the tab 7 menu');
  await game.page.waitForTimeout(300);
}

/**
 * Boot, run the debug scenario and put the game in plain notation.
 *
 * See the header: plain notation is what makes every rendered figure in this
 * file exact, and therefore comparable with the quantities that moved.
 */
async function bootMarketRun(game) {
  await game.boot();
  await game.prepareRunForStarshipLaunch();
  await game.withMods((m) => m.cg.setNotationType('normal'));
  await game.page.waitForTimeout(400);
}

async function openRebirthPane(game) {
  await game.openTab(7);
  const opened = await openRow(game, 'rebirthOption');
  if (!opened) throw new Error('The Rebirth row is not on the tab 7 menu');
}

// --------------------------------------------------------------------- controls

/** Click a real option inside one of the pane's custom dropdowns. */
async function pickOption(game, dropdownId, value) {
  const ok = await game.page.evaluate(({ dropdownId, value }) => {
    const option = document.querySelector(`#${dropdownId} .dropdown-option[data-value="${value}"]`);
    if (!option) return false;
    option.click();
    return true;
  }, { dropdownId, value });
  if (!ok) throw new Error(`No option "${value}" in #${dropdownId}`);
  await game.page.waitForTimeout(350);
}

/** Type into the quantity field the way the player does, through its input event. */
async function typeQuantity(game, value) {
  await game.page.evaluate((v) => {
    const field = document.getElementById('galacticMarketQuantityTextArea');
    field.value = String(v);
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
  // The summary is rebuilt by the frame loop, and the commission it feeds back
  // into the incoming figure lags a frame, so settle before reading.
  await game.page.waitForTimeout(800);
}

/** Choose both sides of a trade and enter a quantity, all through the controls. */
async function stageTrade(game, { outgoing, incoming, quantity }) {
  await pickOption(game, 'galacticMarketOutgoingStockTypeDropDown', outgoing);
  // Choosing the outgoing side rebuilds the incoming dropdown's options, so the
  // incoming pick has to come after that rebuild has landed.
  await game.page.waitForTimeout(400);
  await pickOption(game, 'galacticMarketIncomingStockTypeDropDown', incoming);
  await pickOption(game, 'galacticMarketQuantityToTradeDropDown', 'enter');
  await typeQuantity(game, quantity);
}

/** Press Confirm. Returns whether the button was armed at the moment of pressing. */
async function confirmTrade(game) {
  const armed = await game.page.evaluate(() => {
    const button = document.querySelector('.galactic-market-confirm-trade-button');
    if (!button) return null;
    const wasArmed = button.classList.contains('green-ready-text');
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return wasArmed;
  });
  await game.page.waitForTimeout(600);
  return armed;
}

/**
 * The trade summary exactly as the pane is showing it.
 *
 * Numbers are parsed the same way `parseNumber` in game.js parses them, because
 * that is the function the trade itself uses on these very strings.
 */
function readSummary(game) {
  return game.withMods((m) => {
    const raw = (id) => document.getElementById(id)?.innerHTML ?? '';
    const parse = (value) => {
      const match = String(value).match(/(\d[\d,]*(?:\.\d+)?)([KMBGTPE]?)/);
      if (!match) return NaN;
      const units = { K: 1e3, M: 1e6, B: 1e9, T: 1e12, P: 1e15, E: 1e18 };
      return parseFloat(match[1].replace(/,/g, '')) * (units[match[2]] ?? 1);
    };
    return {
      outgoing: parse(raw('galacticMarketOutgoingQuantityText')),
      incoming: parse(raw('galacticMarketIncomingQuantityText')),
      commission: parse(raw('galacticMarketComissionQuantitySummaryText')),
      outgoingRaw: raw('galacticMarketOutgoingQuantityText'),
      incomingRaw: raw('galacticMarketIncomingQuantityText'),
      outgoingType: raw('galacticMarketOutgoingStockTypeText'),
      incomingType: raw('galacticMarketIncomingStockTypeText'),
      commissionType: raw('galacticMarketComissionQuantityStockTypeText'),
      commissionPercent: m.cg.getCurrentGalacticMarketCommission(),
      confirmArmed: !!document.querySelector('.galactic-market-confirm-trade-button')?.classList.contains('green-ready-text')
    };
  });
}

/** Put a known holding, with headroom, behind a material. */
async function stageHolding(game, material, quantity) {
  await game.withMods((m, cfg) => {
    m.rdo.setResourceDataObject(Math.max(cfg.quantity * 10, 1e7), cfg.category, [cfg.material, 'storageCapacity']);
    m.rdo.setResourceDataObject(cfg.quantity, cfg.category, [cfg.material, 'quantity']);
  }, { material, category: categoryOf(material), quantity });
}

/** Pin one or more materials' bias so the price ratio is a known quantity. */
async function pinBias(game, entries) {
  await game.withMods((m, list) => {
    for (const entry of list) {
      m.rdo.setGalacticMarketDataObject(entry.bias, entry.category, [entry.material, 'marketBias']);
    }
  }, entries.map((e) => ({ ...e, category: categoryOf(e.material) })));
  await game.page.waitForTimeout(300);
}

// ============================================================================

test.describe('Galactic Market — trading through the pane', () => {
  test.beforeEach(async ({ game }) => {
    await bootMarketRun(game);
    await openMarket(game);
  });

  test('every one of the fourteen tradeable materials trades through the dropdowns, and each trade moves exactly what the summary promised', async ({ game }) => {
    const QUANTITY = 10000;
    const results = [];

    for (let index = 0; index < ALL_MATERIALS.length; index++) {
      const outgoing = ALL_MATERIALS[index];
      // Pair each material with the next one round the ring, so the sweep
      // covers every material on the *incoming* side as well as the outgoing —
      // the two sides take different branches for category resolution.
      const incoming = ALL_MATERIALS[(index + 1) % ALL_MATERIALS.length];
      const outCategory = categoryOf(outgoing);
      const inCategory = categoryOf(incoming);

      await stageHolding(game, outgoing, QUANTITY * 4);
      await stageHolding(game, incoming, 0);
      await stageTrade(game, { outgoing, incoming, quantity: QUANTITY });

      // Read the summary, snapshot both holdings, press Confirm and re-snapshot
      // inside a single page evaluation. Two separate clocks make a split read
      // unsound: the production loop keeps adding stock, and the ten-second bias
      // decay keeps moving the conversion, so a summary read one round trip
      // earlier can be quoting a price the trade no longer uses.
      // `galacticMarketTrade()` is synchronous, so nothing can interleave here.
      const moved = await game.page.evaluate((cfg) => {
        const m = globalThis.__mods;
        const parse = (value) => {
          const match = String(value).match(/(\d[\d,]*(?:\.\d+)?)([KMBGTPE]?)/);
          if (!match) return NaN;
          const units = { K: 1e3, M: 1e6, B: 1e9, T: 1e12, P: 1e15, E: 1e18 };
          return parseFloat(match[1].replace(/,/g, '')) * (units[match[2]] ?? 1);
        };
        const raw = (id) => document.getElementById(id)?.innerHTML ?? '';
        const read = () => ({
          outgoing: m.rdo.getResourceDataObject(cfg.outCategory, [cfg.outgoing, 'quantity']),
          incoming: m.rdo.getResourceDataObject(cfg.inCategory, [cfg.incoming, 'quantity'])
        });

        const summary = {
          outgoing: parse(raw('galacticMarketOutgoingQuantityText')),
          incoming: parse(raw('galacticMarketIncomingQuantityText')),
          commission: parse(raw('galacticMarketComissionQuantitySummaryText')),
          outgoingType: raw('galacticMarketOutgoingStockTypeText'),
          incomingType: raw('galacticMarketIncomingStockTypeText'),
          commissionType: raw('galacticMarketComissionQuantityStockTypeText')
        };

        const button = document.querySelector('.galactic-market-confirm-trade-button');
        const wasArmed = button.classList.contains('green-ready-text');
        const before = read();
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const after = read();
        return { wasArmed, summary, before, after };
      }, { outgoing, incoming, outCategory, inCategory });

      await game.page.waitForTimeout(500);
      const reset = await game.withMods((m) => ({
        selection: m.cg.getGalacticMarketOutgoingQuantitySelectionType(),
        field: document.getElementById('galacticMarketQuantityTextArea').value
      }));

      results.push({
        outgoing,
        incoming,
        wasArmed: moved.wasArmed,
        summary: moved.summary,
        before: moved.before,
        after: moved.after,
        selection: reset.selection,
        field: reset.field
      });
    }

    for (const row of results) {
      const label = `${row.outgoing} -> ${row.incoming}`;
      expect(row.wasArmed, `${label}: Confirm should be armed`).toBe(true);
      expect(row.summary.outgoing, `${label}: previewed outgoing`).toBe(QUANTITY);
      expect(row.summary.incoming, `${label}: previewed incoming should be a real figure`).toBeGreaterThan(0);
      // The whole point: the pane's promise and the transaction agree. Both
      // sides are floored on write — `Math.floor(held - previewed)` going out
      // and `Math.floor(held + previewed)` coming in — so a holding carrying a
      // fraction of a unit from the production loop loses that fraction to the
      // trade. Comparing against the floored post-state keeps the assertion
      // exact instead of chasing that remainder with a tolerance.
      expect(row.after.outgoing, `${label}: paid vs previewed`)
        .toBe(Math.floor(row.before.outgoing - row.summary.outgoing));
      expect(row.after.incoming, `${label}: received vs previewed`)
        .toBe(Math.floor(row.before.incoming + row.summary.incoming));
      // The material names in the summary are the ones that were chosen.
      expect(row.summary.outgoingType.toLowerCase(), `${label}: outgoing label`).toBe(row.outgoing);
      expect(row.summary.incomingType.toLowerCase(), `${label}: incoming label`).toBe(row.incoming);
      // Commission is charged in the outgoing material, never the incoming one.
      expect(row.summary.commissionType.toLowerCase(), `${label}: commission label`).toBe(row.outgoing);
      // A completed trade disarms itself so the same amount cannot go twice.
      expect(row.selection, `${label}: quantity selector reset`).toBe('select');
      expect(Number(row.field), `${label}: quantity field cleared`).toBe(0);
    }
  });

  test('the previewed incoming quantity is the bias-adjusted price ratio, less the commission share', async ({ game }) => {
    await stageHolding(game, 'hydrogen', 200000);
    await pinBias(game, [{ material: 'hydrogen', bias: 0 }, { material: 'diesel', bias: 0 }]);
    await stageTrade(game, { outgoing: 'hydrogen', incoming: 'diesel', quantity: 20000 });

    // Everything the assertion needs is read in one evaluation, because the
    // commission is re-rolled by the market cycle on its own schedule.
    const observed = await game.withMods((m) => {
      const parse = (value) => {
        const match = String(value).match(/(\d[\d,]*(?:\.\d+)?)([KMBGTPE]?)/);
        if (!match) return NaN;
        const units = { K: 1e3, M: 1e6, B: 1e9, T: 1e12, P: 1e15, E: 1e18 };
        return parseFloat(match[1].replace(/,/g, '')) * (units[match[2]] ?? 1);
      };
      const outgoing = parse(document.getElementById('galacticMarketOutgoingQuantityText').innerHTML);
      const incoming = parse(document.getElementById('galacticMarketIncomingQuantityText').innerHTML);
      const commission = parse(document.getElementById('galacticMarketComissionQuantitySummaryText').innerHTML);

      const outBase = m.rdo.getGalacticMarketDataObject('resources', ['hydrogen', 'baseValue']);
      const inBase = m.rdo.getGalacticMarketDataObject('compounds', ['diesel', 'baseValue']);
      const outBias = m.rdo.getGalacticMarketDataObject('resources', ['hydrogen', 'marketBias']);
      const inBias = m.rdo.getGalacticMarketDataObject('compounds', ['diesel', 'marketBias']);
      const commissionPercent = m.cg.getCurrentGalacticMarketCommission();

      const adjustedOut = Math.max(0, outBase * (1 + outBias / 100));
      const adjustedIn = Math.max(0, inBase * (1 + inBias / 100));
      const rawIncoming = Math.floor(outgoing * (adjustedOut / adjustedIn));
      const expectedCommission = Math.floor((commissionPercent / 100) * outgoing);

      return {
        outgoing,
        incoming,
        commission,
        commissionPercent,
        outBase,
        inBase,
        outBias,
        inBias,
        rawIncoming,
        expectedCommission,
        expectedIncoming: Math.max(0, Math.floor(rawIncoming - (expectedCommission * (rawIncoming / outgoing))))
      };
    });

    expect(observed.outBias).toBe(0);
    expect(observed.inBias).toBe(0);
    expect(observed.outgoing).toBe(20000);
    // Hydrogen is priced at 0.02 and diesel at 0.2, so the trade comes back at
    // a tenth before commission. The figure is 1999 rather than 2000 because
    // `0.02 / 0.2` is 0.09999999999999999 in binary floating point and the
    // conversion floors — the pane really does quote one unit short, and
    // pinning it here is what would catch that rounding silently changing.
    expect(observed.outBase).toBe(0.02);
    expect(observed.inBase).toBe(0.2);
    expect(observed.rawIncoming).toBe(1999);
    expect(observed.commission).toBe(observed.expectedCommission);
    expect(observed.incoming).toBe(observed.expectedIncoming);
    // And the commission is a real cost: the payout is strictly below the ratio.
    expect(observed.incoming).toBeLessThan(observed.rawIncoming);
  });

  test('demand moves the price: the same trade returns less of a material the market wants and more of one it is dumping', async ({ game }) => {
    await stageHolding(game, 'hydrogen', 400000);

    const previewWithBias = async (incomingBias) => {
      await pinBias(game, [
        { material: 'hydrogen', bias: 0 },
        { material: 'diesel', bias: incomingBias }
      ]);
      await stageTrade(game, { outgoing: 'hydrogen', incoming: 'diesel', quantity: 20000 });
      const summary = await readSummary(game);
      // The stored figure is the conversion before commission is skimmed off, so
      // it is the one that isolates the price effect. Both biases are read in
      // the same round trip and the expectation derived from them, because the
      // ten-second decay walks a pinned bias back towards zero — a hardcoded
      // -50 becomes -49.5 the moment the spec takes longer than one tick.
      return game.withMods((m, displayed) => {
        const outBias = m.rdo.getGalacticMarketDataObject('resources', ['hydrogen', 'marketBias']);
        const inBias = m.rdo.getGalacticMarketDataObject('compounds', ['diesel', 'marketBias']);
        const adjustedOut = Math.max(0, 0.02 * (1 + outBias / 100));
        const adjustedIn = Math.max(0, 0.2 * (1 + inBias / 100));
        return {
          stored: m.cg.getGalacticMarketIncomingQuantity(),
          expected: Math.floor(20000 * (adjustedOut / adjustedIn)),
          outBias,
          inBias,
          displayed
        };
      }, summary.incoming);
    };

    // A positive bias means diesel is dear right now, so the same hydrogen buys
    // less of it; a negative bias means it is cheap and buys more.
    const dear = await previewWithBias(50);
    const neutral = await previewWithBias(0);
    const cheap = await previewWithBias(-50);

    // The conversion is the bias-adjusted price ratio, to the unit, in all three
    // markets: 20000 hydrogen at 0.02 against diesel at roughly 0.3, 0.2 and 0.1.
    expect(neutral.stored, `neutral at bias ${neutral.inBias}`).toBe(neutral.expected);
    expect(dear.stored, `dear at bias ${dear.inBias}`).toBe(dear.expected);
    expect(cheap.stored, `cheap at bias ${cheap.inBias}`).toBe(cheap.expected);
    expect(neutral.stored).toBe(1999);
    // Roughly two thirds comes back when diesel is dear and twice as much when
    // it is cheap; the drift makes the exact figure a moving target, so the
    // bands are stated and the exact values checked against the live bias above.
    expect(dear.stored).toBeGreaterThan(1300);
    expect(dear.stored).toBeLessThan(1360);
    expect(cheap.stored).toBeGreaterThan(3900);
    expect(cheap.stored).toBeLessThanOrEqual(4000);
    // And the pane moves the same way the price does.
    expect(dear.displayed, `dear=${dear.displayed} neutral=${neutral.displayed}`).toBeLessThan(neutral.displayed);
    expect(cheap.displayed, `cheap=${cheap.displayed} neutral=${neutral.displayed}`).toBeGreaterThan(neutral.displayed);
  });

  test('a trade drives the outgoing bias down and the incoming bias up, in proportion to each material trade volume', async ({ game }) => {
    await stageHolding(game, 'oxygen', 200000);
    await pinBias(game, [{ material: 'oxygen', bias: 0 }, { material: 'steel', bias: 0 }]);
    await stageTrade(game, { outgoing: 'oxygen', incoming: 'steel', quantity: 20000 });

    // Read, press and re-read in one synchronous block. The ten-second decay
    // walks every bias towards zero on its own, so a before-read taken as a
    // separate round trip can be a tick stale and the shift comes out short.
    const shift = await game.page.evaluate(() => {
      const m = globalThis.__mods;
      const parse = (value) => {
        const match = String(value).match(/(\d[\d,]*(?:\.\d+)?)([KMBGTPE]?)/);
        if (!match) return NaN;
        const units = { K: 1e3, M: 1e6, B: 1e9, T: 1e12, P: 1e15, E: 1e18 };
        return parseFloat(match[1].replace(/,/g, '')) * (units[match[2]] ?? 1);
      };
      const read = () => ({
        outBias: m.rdo.getGalacticMarketDataObject('resources', ['oxygen', 'marketBias']),
        inBias: m.rdo.getGalacticMarketDataObject('compounds', ['steel', 'marketBias'])
      });

      const outVolume = m.rdo.getGalacticMarketDataObject('resources', ['oxygen', 'tradeVolume']);
      const inVolume = m.rdo.getGalacticMarketDataObject('compounds', ['steel', 'tradeVolume']);
      const outgoing = parse(document.getElementById('galacticMarketOutgoingQuantityText').innerHTML);
      // The bias shift uses the *uncommissioned* incoming figure, which is what
      // the loop stored — not the smaller number rendered in the summary.
      const storedIncoming = m.cg.getGalacticMarketIncomingQuantity();

      const before = read();
      document.querySelector('.galactic-market-confirm-trade-button')
        .dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return { outVolume, inVolume, outgoing, storedIncoming, before, after: read() };
    });
    await game.page.waitForTimeout(400);

    // Selling floods the market with oxygen and drains steel.
    expect(shift.after.outBias).toBeLessThan(shift.before.outBias);
    expect(shift.after.inBias).toBeGreaterThan(shift.before.inBias);
    expect(shift.before.outBias - shift.after.outBias)
      .toBeCloseTo((shift.outgoing / shift.outVolume) * 100, 4);
    expect(shift.after.inBias - shift.before.inBias)
      .toBeCloseTo((shift.storedIncoming / shift.inVolume) * 100, 4);
  });

  test('market bias decays back towards zero on its own, in a step sized by its own magnitude', async ({ game }) => {
    // The decay runs on a 10s wall-clock interval started at boot, so a bias
    // large enough to take the 5-point step shows movement inside one window.
    await pinBias(game, [{ material: 'carbon', bias: 200 }, { material: 'glass', bias: -200 }]);

    const before = await game.withMods((m) => ({
      carbon: m.rdo.getGalacticMarketDataObject('resources', ['carbon', 'marketBias']),
      glass: m.rdo.getGalacticMarketDataObject('compounds', ['glass', 'marketBias'])
    }));

    await game.page.waitForTimeout(12000);

    const after = await game.withMods((m) => ({
      carbon: m.rdo.getGalacticMarketDataObject('resources', ['carbon', 'marketBias']),
      glass: m.rdo.getGalacticMarketDataObject('compounds', ['glass', 'marketBias'])
    }));

    expect(before.carbon).toBe(200);
    expect(before.glass).toBe(-200);
    // Both walk towards zero, never past it and never away from it.
    expect(after.carbon, `carbon ${before.carbon} -> ${after.carbon}`).toBeLessThan(before.carbon);
    expect(after.carbon).toBeGreaterThan(0);
    expect(after.glass, `glass ${before.glass} -> ${after.glass}`).toBeGreaterThan(before.glass);
    expect(after.glass).toBeLessThan(0);
    // Above a magnitude of 100 the step is 5 a tick; one or two ticks fit in
    // the window, and the market cycle can shave a little more off a non-zero
    // bias, so the band is stated rather than a single value.
    expect(before.carbon - after.carbon).toBeGreaterThanOrEqual(5);
    expect(before.carbon - after.carbon).toBeLessThanOrEqual(30);
    expect(after.glass - before.glass).toBeGreaterThanOrEqual(5);
    expect(after.glass - before.glass).toBeLessThanOrEqual(30);
  });

  test('the sidebar reports the bias of both selected sides and colours it by severity', async ({ game }) => {
    // The line and the biases behind it are read in the same round trip, and the
    // expected text is derived from those live values rather than from the
    // numbers that were pinned: the ten-second decay walks a bias towards zero,
    // so a hardcoded "+1.5%" is stale the moment one tick lands. What is being
    // tested is the formatting rule and the severity thresholds, both of which
    // hold whatever the bias currently is.
    const read = async () => game.page.evaluate(() => {
      const m = globalThis.__mods;
      const el = document.getElementById('galacticMarketOption2');
      return {
        text: (el?.textContent || '').trim(),
        html: el?.innerHTML || '',
        classes: Array.from(el?.classList || []),
        outBias: m.rdo.getGalacticMarketDataObject('resources', ['iron', 'marketBias']),
        inBias: m.rdo.getGalacticMarketDataObject('compounds', ['water', 'marketBias'])
      };
    });

    /** The pane's own rule: one decimal below a magnitude of 10, none above. */
    const formatBias = (bias) => {
      const decimals = Math.abs(bias) >= 10 ? 0 : 1;
      return `${bias > 0 ? '+' : ''}${bias.toFixed(decimals)}%`;
    };

    await pickOption(game, 'galacticMarketOutgoingStockTypeDropDown', 'iron');
    await game.page.waitForTimeout(400);
    await pickOption(game, 'galacticMarketIncomingStockTypeDropDown', 'water');

    // Inside +/-3 the market is calm and reads green.
    await pinBias(game, [{ material: 'iron', bias: 1.5 }, { material: 'water', bias: -1.5 }]);
    await game.page.waitForTimeout(700);
    const calm = await read();

    // Past 3 and up to 10 it is a warning.
    await pinBias(game, [{ material: 'iron', bias: 7 }, { material: 'water', bias: 0 }]);
    await game.page.waitForTimeout(700);
    const warning = await read();

    // Past 10 it is a problem, and the figure loses its decimal place.
    await pinBias(game, [{ material: 'iron', bias: 24.4 }, { material: 'water', bias: 0 }]);
    await game.page.waitForTimeout(700);
    const severe = await read();

    expect(Math.abs(calm.outBias), 'the calm bias should still be inside the green band').toBeLessThanOrEqual(3);
    expect(calm.text).toContain(`O:${formatBias(calm.outBias)}`);
    expect(calm.text).toContain(`I:${formatBias(calm.inBias)}`);
    expect(calm.classes).toContain('green-ready-text');

    expect(Math.abs(warning.outBias)).toBeGreaterThan(3);
    expect(Math.abs(warning.outBias)).toBeLessThanOrEqual(10);
    expect(warning.text).toContain(`O:${formatBias(warning.outBias)}`);
    expect(warning.text).toMatch(/O:\+\d\.\d%/);
    expect(warning.classes).toContain('warning-orange-text');

    expect(Math.abs(severe.outBias)).toBeGreaterThan(10);
    expect(severe.text).toContain(`O:${formatBias(severe.outBias)}`);
    // Past ten the decimal place is dropped.
    expect(severe.text).toMatch(/O:\+\d+%/);
    expect(severe.text).not.toMatch(/O:\+\d+\.\d%/);
    expect(severe.classes).toContain('red-disabled-text');
    // Each side is coloured on its own severity inside the line, so a calm
    // incoming side is not painted red by a wild outgoing one.
    expect(severe.html).toContain('green-ready-text');
  });

  test('hovering the market status shows the base price, the bias-adjusted price and the trade volume', async ({ game }) => {
    /**
     * Hover the status line with a real pointer and read the shared tooltip.
     *
     * A real `page.mouse.move` rather than a dispatched event, because the whole
     * point of this spec is whether a player can actually reach the tooltip —
     * and the answer depends on the element's computed `pointer-events`.
     */
    const hoverStatus = async (expectedFragment) => {
      await game.page.waitForFunction((fragment) => {
        const el = document.getElementById('galacticMarketOption2');
        return !!el?.dataset.galacticTooltipContent?.includes(fragment);
      }, expectedFragment, { timeout: 15000 });

      const box = await game.page.evaluate(() => {
        const el = document.getElementById('galacticMarketOption2');
        const r = el?.getBoundingClientRect();
        return r && r.width > 0
          ? { x: r.x + r.width / 2, y: r.y + r.height / 2, pointerEvents: getComputedStyle(el).pointerEvents }
          : null;
      });
      if (!box) return { visible: false, text: '', pointerEvents: null };

      // Park the pointer well away first, so each hover is a fresh entry.
      await game.page.mouse.move(5, 5);
      await game.page.waitForTimeout(120);
      await game.page.mouse.move(box.x, box.y);
      await game.page.waitForTimeout(200);
      await game.page.mouse.move(box.x + 1, box.y + 1);
      await game.page.waitForTimeout(300);

      const tooltip = await game.page.evaluate(() => {
        const el = document.getElementById('stat-tooltip');
        return { visible: el ? getComputedStyle(el).display !== 'none' : false, text: el?.textContent || '' };
      });
      return { ...tooltip, pointerEvents: box.pointerEvents };
    };

    await pickOption(game, 'galacticMarketOutgoingStockTypeDropDown', 'titanium');
    await game.page.waitForTimeout(400);
    await pickOption(game, 'galacticMarketIncomingStockTypeDropDown', 'hydrogen');

    /**
     * The tooltip's own numbers, checked against each other.
     *
     * The bias is not pinned for the assertion: the ten-second decay walks it
     * towards zero, so a hardcoded "+2.0%" is stale as soon as one tick lands.
     * What cannot drift is the relationship the tooltip is there to show —
     * adjusted price is base price scaled by the bias it prints alongside it.
     */
    const readPrices = (text) => {
      const bias = Number((text.match(/Bias:\s*([+-]?[\d.]+)%/) || [])[1]);
      const base = Number((text.match(/Base Price:\s*([\d.]+)/) || [])[1]);
      const adjusted = Number((text.match(/Adjusted Price:\s*([\d.]+)/) || [])[1]);
      const volume = (text.match(/Trade Volume:\s*([\d,]+)/) || [])[1];
      return { bias, base, adjusted, volume };
    };

    // A calm market first: titanium's base value is 6, and a small positive bias
    // lifts the working price just above it.
    await pinBias(game, [{ material: 'titanium', bias: 2 }, { material: 'hydrogen', bias: 0 }]);
    const calm = await hoverStatus('Adjusted Price');

    expect(calm.visible, 'the tooltip should appear on hover').toBe(true);
    const calmPrices = readPrices(calm.text);
    expect(calmPrices.base, 'titanium is priced at 6').toBe(6);
    expect(calmPrices.bias).toBeGreaterThan(0);
    expect(calmPrices.bias).toBeLessThanOrEqual(2);
    expect(calmPrices.adjusted).toBeCloseTo(6 * (1 + calmPrices.bias / 100), 1);
    expect(calmPrices.adjusted).toBeGreaterThan(calmPrices.base);
    // The trade volume is the denominator every bias shift is measured against,
    // so it belongs on the tooltip beside the price.
    expect(calmPrices.volume, `volume in ${calm.text}`).toMatch(/^\d{1,3}(,\d{3})+$/);

    // Now a market in real trouble. The information matters most here — this is
    // the reading that tells the player how far the price has moved — so the
    // tooltip has to survive the severity colouring.
    await pinBias(game, [{ material: 'titanium', bias: 25 }, { material: 'hydrogen', bias: 0 }]);
    const severe = await hoverStatus('Adjusted Price');

    expect(
      severe.pointerEvents,
      'a severe bias must not make the status line unhoverable'
    ).not.toBe('none');
    expect(severe.visible, 'the tooltip should still appear at a severe bias').toBe(true);
    const severePrices = readPrices(severe.text);
    // Past a magnitude of 10 the figure loses its decimal place.
    expect(severePrices.bias).toBeGreaterThan(20);
    expect(severePrices.bias).toBeLessThanOrEqual(25);
    expect(severePrices.base).toBe(6);
    expect(severePrices.adjusted).toBeCloseTo(6 * (1 + severePrices.bias / 100), 1);
  });

  test('the quantity selector stays locked until both sides are chosen, then offers all stock and a clamped manual entry', async ({ game }) => {
    const lockedState = async () => game.page.evaluate(() =>
      document.getElementById('galacticMarketQuantityToTradeDropDown').classList.contains('dropdown-disabled'));

    expect(await lockedState(), 'locked with neither side chosen').toBe(true);

    await pickOption(game, 'galacticMarketOutgoingStockTypeDropDown', 'silicon');
    await game.page.waitForTimeout(500);
    expect(await lockedState(), 'still locked with only one side chosen').toBe(true);

    await pickOption(game, 'galacticMarketIncomingStockTypeDropDown', 'concrete');
    await game.page.waitForTimeout(700);
    expect(await lockedState(), 'unlocked once both sides are chosen').toBe(false);

    // "All stock" fills the field from the live holding. It is compared against
    // the field rather than the summary, because the summary goes through the
    // notation formatter and 54321 reads back as 54.3K.
    await stageHolding(game, 'silicon', 54321);
    await pickOption(game, 'galacticMarketQuantityToTradeDropDown', 'all');
    await game.page.waitForTimeout(900);
    const all = await game.withMods((m) => ({
      field: Number(document.getElementById('galacticMarketQuantityTextArea').value),
      holding: m.rdo.getResourceDataObject('resources', ['silicon', 'quantity'])
    }));
    expect(all.field).toBe(all.holding);
    expect(all.field).toBeGreaterThanOrEqual(54321);

    // A manual entry above the holding is clamped down to it, so an
    // unaffordable trade can never reach the Confirm button.
    await stageHolding(game, 'silicon', 2500);
    await pickOption(game, 'galacticMarketQuantityToTradeDropDown', 'enter');
    await typeQuantity(game, 999999);
    const clamped = await game.page.evaluate(() =>
      Number(document.getElementById('galacticMarketQuantityTextArea').value));
    expect(clamped).toBe(2500);
  });

  test('a material cannot be traded for itself: the incoming dropdown drops whatever the outgoing side is holding', async ({ game }) => {
    await pickOption(game, 'galacticMarketOutgoingStockTypeDropDown', 'neon');
    await game.page.waitForTimeout(800);

    const offered = await game.page.evaluate(() =>
      Array.from(document.querySelectorAll('#galacticMarketIncomingStockTypeDropDown .dropdown-option'))
        .map((el) => el.getAttribute('data-value'))
        .filter((v) => v && v !== 'select'));

    expect(offered, 'neon should not be offered back to itself').not.toContain('neon');
    expect(offered.length, 'the other thirteen are still offered').toBe(13);

    // Switching the outgoing side puts neon back and takes the new one away —
    // the dropdown is rebuilt, not permanently pruned.
    await pickOption(game, 'galacticMarketOutgoingStockTypeDropDown', 'glass');
    await game.page.waitForTimeout(800);
    const afterSwitch = await game.page.evaluate(() =>
      Array.from(document.querySelectorAll('#galacticMarketIncomingStockTypeDropDown .dropdown-option'))
        .map((el) => el.getAttribute('data-value'))
        .filter((v) => v && v !== 'select'));

    expect(afterSwitch).toContain('neon');
    expect(afterSwitch).not.toContain('glass');
    expect(afterSwitch.length).toBe(13);
  });

  test('the Confirm button is armed only while the staged trade would actually return something', async ({ game }) => {
    const armed = async () => game.page.evaluate(() => {
      const button = document.querySelector('.galactic-market-confirm-trade-button');
      return {
        ready: button.classList.contains('green-ready-text'),
        disabled: button.classList.contains('red-disabled-text'),
        pointerEvents: getComputedStyle(button).pointerEvents,
        outgoingText: document.getElementById('galacticMarketOutgoingQuantityText').innerHTML,
        incomingText: document.getElementById('galacticMarketIncomingQuantityText').innerHTML,
        commissionText: document.getElementById('galacticMarketComissionQuantitySummaryText').innerHTML
      };
    });

    const idle = await armed();
    expect(idle.ready, 'nothing staged').toBe(false);
    expect(idle.disabled).toBe(true);
    // The gate is the colour class, whose CSS is pointer-events: none — that is
    // how every affordability check in this game is enforced, by design.
    expect(idle.pointerEvents).toBe('none');

    await stageHolding(game, 'helium', 100000);
    await stageTrade(game, { outgoing: 'helium', incoming: 'water', quantity: 10000 });
    const staged = await armed();
    expect(staged.ready).toBe(true);
    expect(staged.disabled).toBe(false);
    expect(staged.pointerEvents).not.toBe('none');

    // Zeroing the field should take the trade back off the table: with nothing
    // going out there is nothing to come back, so the summary should read zero
    // on both sides and the button should go dead again.
    await typeQuantity(game, 0);
    const emptied = await armed();
    expect(emptied.outgoingText, 'the outgoing side should read zero').toMatch(/^0/);
    expect(
      emptied.incomingText,
      `the incoming side should clear when the quantity is zeroed, but reads "${emptied.incomingText}"`
    ).toMatch(/^0/);
    expect(
      emptied.commissionText,
      `the commission should clear when the quantity is zeroed, but reads "${emptied.commissionText}"`
    ).toMatch(/^0/);
    expect(emptied.ready, 'Confirm should disarm for a zero-quantity trade').toBe(false);
    expect(emptied.disabled).toBe(true);
  });

  test('commission climbs 6 to 13 points with every confirmed trade and is capped at 80', async ({ game }) => {
    await stageHolding(game, 'hydrogen', 5000000);

    const series = [await game.withMods((m) => m.cg.getCurrentGalacticMarketCommission())];
    const rises = [];

    // Twelve trades is more than enough to walk 10 up to the ceiling even at
    // the slowest possible rate of 6 a trade.
    for (let i = 0; i < 12; i++) {
      await stageTrade(game, { outgoing: 'hydrogen', incoming: 'diesel', quantity: 1000 });
      await confirmTrade(game);
      const now = await game.withMods((m) => m.cg.getCurrentGalacticMarketCommission());
      rises.push(now - series[series.length - 1]);
      series.push(now);
      if (now >= 80) break;
    }

    for (let i = 0; i < rises.length; i++) {
      const previous = series[i];
      // Each trade adds 6..13, clipped by whatever headroom is left up to 80.
      expect(rises[i], `trade ${i + 1}: ${series.join(' -> ')}`).toBeGreaterThanOrEqual(Math.min(6, 80 - previous));
      expect(rises[i], `trade ${i + 1}: ${series.join(' -> ')}`).toBeLessThanOrEqual(13);
    }
    for (const value of series) expect(value).toBeLessThanOrEqual(80);
    expect(series[series.length - 1], `series: ${series.join(' -> ')}`).toBe(80);
  });

  test('trading raises no console or page errors', async ({ game }) => {
    await stageHolding(game, 'sodium', 100000);
    await stageTrade(game, { outgoing: 'sodium', incoming: 'concrete', quantity: 5000 });
    await confirmTrade(game);

    expect(game.significantErrors()).toEqual([]);
  });
});

test.describe('Galactic Market — ascendency points across the counter', () => {
  test.beforeEach(async ({ game }) => {
    await bootMarketRun(game);
    await openMarket(game);
  });

  /**
   * Choose a sale quantity, press Sell, and report what the pane promised
   * against what actually moved.
   *
   * The read/press/read happens in one synchronous evaluation so the frame loop
   * cannot bank interest in between: `galacticMarketSellApForCash` is
   * synchronous, so nothing else can run inside the block.
   */
  async function sellAp(game, quantity) {
    await pickOption(game, 'galacticMarketSellApForCashDropDown', String(quantity));
    await game.page.waitForTimeout(800);

    const result = await game.page.evaluate(() => {
      const m = globalThis.__mods;
      const button = document.querySelector('.galactic-market-confirm-sell-ap-button');
      const read = () => ({
        ap: m.rdo.getResourceDataObject('ascendencyPoints', ['quantity']),
        cash: m.rdo.getResourceDataObject('currency', ['cash'])
      });

      const armed = button.classList.contains('green-ready-text');
      const price = m.cg.getApSellForCashPrice();
      // The preview carries the currency symbol and thousands separators.
      const preview = Number(String(document.getElementById('galacticMarketCashGainQuantity').innerHTML).replace(/[^\d]/g, ''));
      const before = read();
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return { armed, price, preview, before, after: read() };
    });
    await game.page.waitForTimeout(400);
    return result;
  }

  test('all three sale quantities preview a cash figure and pay exactly that on the Sell button', async ({ game }) => {
    await game.debugClick('add100ApButton');
    await game.page.waitForTimeout(500);

    // A one and a five-point sale are plain transactions.
    for (const quantity of [1, 5]) {
      const result = await sellAp(game, quantity);
      const label = `selling ${quantity} AP`;
      expect(result.armed, `${label}: Sell should be armed`).toBe(true);
      expect(result.price, `${label}: a price should be quoted`).toBeGreaterThan(0);
      expect(result.after.ap, `${label}: points debited`).toBe(result.before.ap - quantity);
      expect(result.after.cash, `${label}: cash credited`).toBe(result.before.cash + quantity * result.price);
      // The preview the player was shown is the figure they were paid.
      expect(result.preview, `${label}: preview vs payout`).toBe(quantity * result.price);
    }
  });

  test('a ten-point sale pays out and earns the achievement that hands five points back', async ({ game }) => {
    await game.debugClick('add100ApButton');
    await game.page.waitForTimeout(500);

    const before = await game.withMods((m) => !!m.rdo.getAchievementDataObject('trade10APForCash', ['active']));
    expect(before, 'the achievement should not be held yet').toBe(false);

    const result = await sellAp(game, 10);
    // The sale flags the achievement; the frame loop is what grants it and pays
    // the bonus, so the settled figure needs a moment.
    await game.page.waitForTimeout(1500);
    const settled = await game.withMods((m) => ({
      earned: !!m.rdo.getAchievementDataObject('trade10APForCash', ['active']),
      ap: m.rdo.getResourceDataObject('ascendencyPoints', ['quantity'])
    }));

    expect(result.armed).toBe(true);
    expect(result.preview).toBe(10 * result.price);
    expect(result.after.cash).toBe(result.before.cash + 10 * result.price);
    // The sale itself debits exactly ten, there and then.
    expect(result.after.ap, `${result.before.ap} -> ${result.after.ap}`).toBe(result.before.ap - 10);
    // And the "Trade 10 AP for Cash" achievement then hands five back, so the
    // run ends five points down rather than ten. Asserting the naive -10 on the
    // settled figure would be asserting against the game's own reward.
    expect(settled.earned, 'the ten-point sale should earn its achievement').toBe(true);
    expect(settled.ap, `settled from ${result.before.ap}`).toBe(result.before.ap - 10 + 5);
  });

  test('the Sell button stays disarmed when the points are not held', async ({ game }) => {
    const armed = async () => game.page.evaluate(() => {
      const button = document.querySelector('.galactic-market-confirm-sell-ap-button');
      return {
        ready: button.classList.contains('green-ready-text'),
        pointerEvents: getComputedStyle(button).pointerEvents,
        preview: document.getElementById('galacticMarketCashGainQuantity').innerHTML
      };
    });

    await game.withMods((m) => {
      m.cg.setNotationType('normal');
      m.rdo.setResourceDataObject(1, 'ascendencyPoints', ['quantity']);
    });
    await pickOption(game, 'galacticMarketSellApForCashDropDown', '10');
    await game.page.waitForTimeout(800);
    const tooPoor = await armed();

    await game.debugClick('add100ApButton');
    await game.page.waitForTimeout(800);
    const affordable = await armed();

    expect(tooPoor.ready, 'one point cannot cover a ten-point sale').toBe(false);
    expect(tooPoor.pointerEvents).toBe('none');
    expect(affordable.ready).toBe(true);
    // The preview stays live even while the sale is unaffordable, so the player
    // can see what the sale would be worth before earning the points.
    expect(Number(String(tooPoor.preview).replace(/[^\d]/g, ''))).toBeGreaterThan(0);
  });

  test('liquidating the run converts every tradeable stock and all cash into the previewed ascendency points, once', async ({ game }) => {
    // The stock has to be worth something: one ascendency point costs
    // `getApBuyPrice()`, which starts at a million, so a token holding
    // liquidates to zero points and the button correctly never arms.
    await game.withMods((m, materials) => {
      for (const key of materials.resources) {
        m.rdo.setResourceDataObject(1e9, 'resources', [key, 'storageCapacity']);
        m.rdo.setResourceDataObject(5e7, 'resources', [key, 'quantity']);
      }
      for (const key of materials.compounds) {
        m.rdo.setResourceDataObject(1e9, 'compounds', [key, 'storageCapacity']);
        m.rdo.setResourceDataObject(5e7, 'compounds', [key, 'quantity']);
      }
      m.rdo.setResourceDataObject(1e9, 'currency', ['cash']);
      m.rdo.setResourceDataObject(0, 'ascendencyPoints', ['quantity']);
    }, { resources: TRADEABLE_RESOURCES, compounds: TRADEABLE_COMPOUNDS });

    await openRebirthPane(game);

    const button = () => game.page.evaluate(() => {
      const el = document.querySelector('.galactic-market-confirm-liquidate-button');
      return {
        ready: el.classList.contains('green-ready-text'),
        pointerEvents: getComputedStyle(el).pointerEvents
      };
    });

    // Authorisation is a deliberate second step: the button stays dead until
    // the dropdown is switched to "liquidate", however much stock is held.
    const unauthorized = await button();
    expect(unauthorized.ready, 'liquidation must be authorized first').toBe(false);
    expect(unauthorized.pointerEvents).toBe('none');

    await pickOption(game, 'galacticMarketLiquidateDropDown', 'yes');
    await game.page.waitForTimeout(900);

    const staged = await game.withMods((m) => ({
      ready: !!document.querySelector('.galactic-market-confirm-liquidate-button')?.classList.contains('green-ready-text'),
      // Plain notation groups the figure in thousands, so strip the separators.
      previewed: Number(String(document.getElementById('galacticMarketApLiquidationQuantity')?.innerHTML ?? '').replace(/[^\d]/g, '')),
      quantity: m.cg.getApLiquidationQuantity(),
      ap: m.rdo.getResourceDataObject('ascendencyPoints', ['quantity']),
      liquidated: m.cg.getLiquidatedThisRun()
    }));

    expect(staged.ready, 'authorized and holding stock, the button should arm').toBe(true);
    expect(staged.previewed, 'the pane should quote a points figure').toBeGreaterThan(0);
    expect(staged.previewed).toBe(staged.quantity);
    expect(staged.liquidated).toBe(false);

    // The quoted figure is recomputed from the live holdings on every frame, so
    // the quote and the press have to be taken in the same synchronous block or
    // production ticking in between moves the number that was promised.
    const press = await game.page.evaluate((materials) => {
      const m = globalThis.__mods;
      const read = () => ({
        ap: m.rdo.getResourceDataObject('ascendencyPoints', ['quantity']),
        cash: m.rdo.getResourceDataObject('currency', ['cash']),
        resources: materials.resources.map((key) => m.rdo.getResourceDataObject('resources', [key, 'quantity'])),
        compounds: materials.compounds.map((key) => m.rdo.getResourceDataObject('compounds', [key, 'quantity']))
      });
      const quoted = Number(String(document.getElementById('galacticMarketApLiquidationQuantity').innerHTML).replace(/[^\d]/g, ''));
      const before = read();
      document.querySelector('.galactic-market-confirm-liquidate-button')
        .dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return { quoted, before, after: read() };
    }, { resources: TRADEABLE_RESOURCES, compounds: TRADEABLE_COMPOUNDS });

    await game.page.waitForTimeout(1000);
    const settled = await game.withMods((m) => ({
      liquidated: m.cg.getLiquidatedThisRun(),
      ready: !!document.querySelector('.galactic-market-confirm-liquidate-button')?.classList.contains('green-ready-text')
    }));

    expect(press.quoted, 'the pane should still be quoting a figure').toBeGreaterThan(0);
    expect(press.after.ap, 'the previewed points are the points awarded').toBe(press.before.ap + press.quoted);
    // Read in the same synchronous block as the press, because autobuyers refill
    // an emptied store within a frame and a later read would never see zero.
    expect(press.after.cash).toBe(0);
    expect(press.after.resources).toEqual(TRADEABLE_RESOURCES.map(() => 0));
    expect(press.after.compounds).toEqual(TRADEABLE_COMPOUNDS.map(() => 0));
    expect(settled.liquidated, 'the run is marked as liquidated').toBe(true);
    // Once per run: with the flag set the button goes dead again and stays
    // dead, which is the gate a player meets when they come back to it.
    expect(settled.ready).toBe(false);
  });
});

test.describe('Galactic Market — the lockdown event closes the counter', () => {
  test.beforeEach(async ({ game }) => {
    await bootMarketRun(game);
    await openMarket(game);
  });

  test('a market lockdown greys the row, refuses to open the pane and says so in the sidebar', async ({ game }) => {
    // Fire the real event from the debug menu rather than starting the timed
    // effect by hand, so the whole pipeline runs: the event guard, the effect
    // timer and the UI handler that greys the row.
    await game.debugSelect('debugRandomEventSelect', 'galacticMarketLockdown');
    await game.debugClick('triggerRandomEventButton');
    await game.page.waitForTimeout(1000);

    const active = await game.withMods((m) => ({
      running: m.events.isTimedEffectActive('galacticMarketLockdown'),
      remaining: m.events.getTimedEffectRemainingMs('galacticMarketLockdown')
    }));
    expect(active.running, 'the lockdown should be running').toBe(true);
    expect(active.remaining).toBeGreaterThan(0);

    // Leave the market, then try to come back to it while it is shut.
    await openRow(game, 'rebirthOption');
    const gate = await game.page.evaluate(() => {
      const option = document.getElementById('galacticMarketOption');
      option.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return {
        greyed: option.classList.contains('red-disabled-text'),
        pointerEvents: option.style.pointerEvents
      };
    });
    await game.page.waitForTimeout(700);

    const state = await game.withMods((m) => ({
      pane: m.cg.getCurrentOptionPane(),
      status: (document.getElementById('galacticMarketOption2')?.textContent || '').trim(),
      shutdownLabel: m.loc.localize('textShutdown', m.cg.getLanguage())
    }));

    expect(gate.greyed).toBe(true);
    expect(gate.pointerEvents).toBe('none');
    // The click handler bails before switching panes, so the market never opens.
    expect(state.pane).not.toBe('galactic market');
    // And the sidebar tells the player why rather than just going quiet.
    expect(state.status).toBe(state.shutdownLabel);
  });

  test('the lockdown expiring hands the market back', async ({ game }) => {
    await game.debugSelect('debugRandomEventSelect', 'galacticMarketLockdown');
    await game.debugClick('triggerRandomEventButton');
    await game.page.waitForTimeout(800);

    // Wind the remaining time down to a sliver and let the effect timer run it
    // out for real, rather than clearing the state by hand — that way the
    // expiry path and its restoration handler are the things being tested.
    await game.withMods((m) => {
      const state = m.rdo.getResourceDataObject('randomEvents', ['timedEffects', 'galacticMarketLockdown'], true) || {};
      m.rdo.setResourceDataObject({ ...state, remainingMs: 80 }, 'randomEvents', ['timedEffects', 'galacticMarketLockdown']);
    });
    await game.page.waitForTimeout(2000);

    const restored = await game.page.evaluate(() => {
      const option = document.getElementById('galacticMarketOption');
      return {
        greyed: option.classList.contains('red-disabled-text'),
        pointerEvents: option.style.pointerEvents
      };
    });
    expect(restored.greyed).toBe(false);
    expect(restored.pointerEvents).toBe('');

    await openMarket(game);
    await stageHolding(game, 'iron', 50000);
    await stageTrade(game, { outgoing: 'iron', incoming: 'titanium', quantity: 10000 });
    const summary = await readSummary(game);
    const before = await game.withMods((m) => m.rdo.getResourceDataObject('compounds', ['titanium', 'quantity']));
    await confirmTrade(game);
    const after = await game.withMods((m) => m.rdo.getResourceDataObject('compounds', ['titanium', 'quantity']));

    // Trading works again, which is a stronger claim than the row losing a class.
    expect(summary.incoming).toBeGreaterThan(0);
    expect(after - before).toBe(summary.incoming);
  });
});
