/**
 * Area: Ascendency Perks — how the list reads
 * Plan: docs/player-feedback-improvement-plan.md, item P2
 *
 * `ascendency-perks-live.spec.js` proves the perks *work*: the prices charged,
 * the AP spent, the effects measured. This spec proves the list can be *read*,
 * which was the player's actual complaint about it:
 *
 * | Complaint | What is asserted here |
 * |---|---|
 * | "finished" and "can't afford" looked identical — both a red Buy button | a maxed row carries no Buy button at all |
 * | finished perks sat in among the ones still worth buying | rows are grouped unbought → part-bought → finished, each group cheapest-first |
 * | a finished perk announced itself twice, in the same green | exactly one completion indicator per maxed row, and it is the far-right one |
 * | (the fix must not cost anything) | the far-right slot on a maxed row sits at the same x as the price on an unmaxed one |
 *
 * Everything is done by playing: AP comes from the debug menu's grant button and
 * every purchase is a press of the row's own Buy button. Nothing calls
 * `purchaseBuff` directly, because the thing under test *is* the wiring between
 * the button, the frame loop and the row.
 *
 * Note the deliberate split between "live" and "redrawn". Losing the Buy button
 * has to happen the instant the last purchase lands, so the frame loop does it —
 * and this spec checks it without redrawing anything. The ordering, by contrast,
 * is settled at draw time on purpose: re-sorting live would slide a row out from
 * under the pointer at the exact moment the player finishes a perk. So the order
 * is asserted after the pane is genuinely reopened.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** The AP the debug menu's grant button pays, per click. */
const DEBUG_AP_GRANT = 100;

/**
 * The perks this spec drives, chosen for what they prove rather than at random.
 *
 * - `littleBagOfHydrogen` is the cheapest non-rebuyable perk: one press maxes it.
 * - `asteroidScannerBoost` is rebuyable with a real cap (2) and a flat price
 *   multiple of 1, so two presses max it at a predictable price each. It is the
 *   only kind of perk that can reach "maxed" *after* being partially bought.
 * - `quantumEngines` is rebuyable with a cap of 10, so one press leaves it
 *   permanently in the middle group — part-bought, still buyable.
 *
 * None of the three has a side effect that opens a modal, which would swallow
 * the next click.
 */
const MAXES_IN_ONE = 'littleBagOfHydrogen';
const MAXES_IN_TWO = 'asteroidScannerBoost';
const STAYS_PARTIAL = 'quantumEngines';

// ------------------------------------------------------------------- utilities

/**
 * Dispatch a click straight at an element.
 *
 * The perk buttons sit inside an option row whose description container overlaps
 * them, so a real click at their coordinates can land on the coverer. This also
 * bypasses the `pointer-events: none` affordability gate, which is why nothing
 * here infers "the purchase was refused" from a dispatched click.
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
 * `'ascendency perks'`; with any other pane open the rows keep whatever they
 * were drawn with, and every "live" assertion below would be reading a snapshot.
 */
async function openPerksPane(game) {
  await openOptionById(game, 'ascendencyOption', 7);
  const pane = await game.withMods((m) => m.cg.getCurrentOptionPane());
  expect(pane, 'the perk rows are only maintained while their pane is open')
    .toBe('ascendency perks');
  await game.page.waitForSelector('#littleBagOfHydrogenCostText', { timeout: 15000 });
  await game.page.waitForTimeout(600);
}

/**
 * Genuinely rebuild the pane, the way a player would: leave it for a sibling
 * pane and come back. Clicking the same option again would not prove a redraw
 * happened, so this leaves first.
 */
async function reopenPerksPane(game) {
  await openOptionById(game, 'megastructuresOption');
  await openPerksPane(game);
}

/**
 * Grant AP through the debug menu's own button — the game's sanctioned route —
 * and unlock the tabs, because tab 7 is hidden until a run has earned its way
 * there and the pane cannot be opened while it is.
 */
async function openUpAndGrantAp(game, clicks = 1) {
  await game.openDebugMenu();
  await game.debugClick('unlockAllTabsButton');
  await game.debugClick('add100ApButton', { times: clicks });
  await game.page.waitForTimeout(300);
}

/** Press the Buy button on one perk row. */
async function buyPerk(game, key) {
  const slug = key.replace(/([A-Z])/g, '-$1').toLowerCase();
  await clickElement(game, `button.ascendency-buff-button.buff-class-${slug}`);
}

/**
 * Every perk row as the pane is currently showing it, in DOM order, paired with
 * the catalogue record behind it.
 *
 * Rows are found by their wrapper id rather than by their Buy button, because
 * the whole point of a maxed row is that it no longer has one.
 */
async function readPerkRows(game) {
  return game.withMods((m) => {
    const buffs = m.rdo.getAscendencyBuffDataObject();
    const keyByRowId = new Map();
    Object.keys(buffs).forEach((key) => {
      if (key === 'version') return;
      const capitalised = key.charAt(0).toUpperCase() + key.slice(1);
      keyByRowId.set(`buff${capitalised}Row`, key);
    });

    return Array.from(document.querySelectorAll('.option-row'))
      .filter((row) => keyByRowId.has(row.id))
      .map((row) => {
        const key = keyByRowId.get(row.id);
        const buff = buffs[key];
        const capitalised = key.charAt(0).toUpperCase() + key.slice(1);
        const costEl = document.getElementById(`${key}CostText`);
        const statusEl = document.getElementById(`buff${capitalised}BuyStatusText`);
        const badge = costEl ? costEl.getBoundingClientRect() : null;

        return {
          key,
          boughtYet: buff.boughtYet,
          rebuyable: buff.rebuyable,
          timesRebuyable: buff.timesRebuyable,
          maxed: m.rdo.isAscendencyBuffMaxed(buff),
          price: Math.round(m.rdo.getAscendencyBuffCost(buff)),
          buyButtons: row.querySelectorAll('button.ascendency-buff-button').length,
          spacers: row.querySelectorAll('.ascendency-buff-maxed-spacer').length,
          costText: (costEl?.textContent || '').trim(),
          statusText: (statusEl?.textContent || '').trim(),
          badgeIsFlagged: Boolean(costEl?.classList.contains('ascendency-buff-maxed-badge')),
          // The right-hand column is flush right, so its *right* edge is the
          // fixed one; the left edge legitimately moves with the width of the
          // word in the slot ("Maxed" is wider than "3 AP").
          badgeRight: badge ? Math.round(badge.right) : null,
          // Every visible scrap of text on the row, so "says it once" can be
          // counted rather than assumed from the two slots this spec knows about.
          visibleText: Array.from(row.querySelectorAll('.buff-value'))
            .map((el) => (el.textContent || '').trim())
            .filter(Boolean)
        };
      });
  });
}

/** The one row for a given perk. */
function rowFor(rows, key) {
  const row = rows.find((r) => r.key === key);
  expect(row, `no row rendered for ${key}`).toBeTruthy();
  return row;
}

/** How many times the Buy button has to be pressed to finish this perk off. */
async function pressesToMax(game, key) {
  return game.withMods((m, buffKey) => {
    const buff = m.rdo.getAscendencyBuffDataObject()[buffKey];
    return buff.rebuyable ? buff.timesRebuyable - buff.boughtYet : 1;
  }, key);
}

/** Buy a perk until the catalogue says it can be bought no further. */
async function maxOutPerk(game, key) {
  const presses = await pressesToMax(game, key);
  for (let i = 0; i < presses; i++) {
    await buyPerk(game, key);
  }
  const maxed = await game.withMods(
    (m, buffKey) => m.rdo.isAscendencyBuffMaxed(m.rdo.getAscendencyBuffDataObject()[buffKey]),
    key
  );
  expect(maxed, `${key} should be maxed after ${presses} press(es)`).toBe(true);
}

// ----------------------------------------------------------------------- specs

test.describe('Ascendency Perks — list legibility (P2)', () => {
  test('a perk bought to its cap loses its Buy button the moment it is finished', async ({ game }) => {
    await game.boot();
    await openUpAndGrantAp(game);
    await openPerksPane(game);

    // Before: everything is buyable, so every row has a button and no spacer.
    const before = await readPerkRows(game);
    expect(before.length, 'the pane should have rendered the whole catalogue').toBeGreaterThan(5);
    for (const row of before) {
      expect(row.maxed, `${row.key} should start unbought on a fresh run`).toBe(false);
      expect(row.buyButtons, `${row.key} should have exactly one Buy button`).toBe(1);
      expect(row.spacers, `${row.key} should have no maxed spacer while it is buyable`).toBe(0);
    }

    // A rebuyable perk with a real cap: the first press must NOT take the button
    // away, only the last one. This is the half of the behaviour that a
    // single-purchase perk cannot prove.
    await buyPerk(game, MAXES_IN_TWO);
    const midway = rowFor(await readPerkRows(game), MAXES_IN_TWO);
    expect(midway.boughtYet, 'one press should have bought exactly one level').toBe(1);
    expect(midway.maxed, 'a cap of 2 is not reached after one press').toBe(false);
    expect(midway.buyButtons, 'a part-bought perk is still buyable, so it keeps its button').toBe(1);

    await buyPerk(game, MAXES_IN_TWO);
    const finished = rowFor(await readPerkRows(game), MAXES_IN_TWO);
    expect(finished.maxed, 'two presses should reach the cap of 2').toBe(true);
    expect(finished.buyButtons, 'a maxed perk must offer nothing left to press').toBe(0);
    expect(finished.spacers, 'the button is replaced, not deleted, so the row keeps its shape').toBe(1);
  });

  test('a maxed perk states it once, on the right, and the row does not move', async ({ game }) => {
    await game.boot();
    await openUpAndGrantAp(game);
    await openPerksPane(game);

    await maxOutPerk(game, MAXES_IN_ONE);
    await buyPerk(game, STAYS_PARTIAL);
    await game.page.waitForTimeout(600);

    const rows = await readPerkRows(game);
    const maxed = rowFor(rows, MAXES_IN_ONE);
    const partial = rowFor(rows, STAYS_PARTIAL);
    const untouched = rows.find((r) => r.boughtYet === 0);
    expect(untouched, 'the catalogue is bigger than the three perks this spec buys').toBeTruthy();

    // (c) exactly one completion indicator, and it is the far-right slot.
    expect(maxed.costText.toLowerCase(), 'the far-right slot is the badge').toContain('max');
    expect(maxed.badgeIsFlagged, 'the badge should be marked as such').toBe(true);
    expect(maxed.statusText, 'the buy-status slot must go blank rather than repeat it').toBe('');
    const completionMentions = maxed.visibleText.filter((t) => /max|bought|purchased/i.test(t));
    expect(completionMentions, 'a maxed row should say it is finished exactly once')
      .toHaveLength(1);

    // A part-bought perk is untouched by any of this: it still counts up in the
    // middle slot and still quotes its next price on the right.
    expect(partial.statusText, 'a part-bought perk still reports its count').toMatch(/1/);
    expect(partial.costText, 'a part-bought perk still quotes its next price').toContain('AP');

    // The badge is flush with the price above it. This is what catches a fix
    // that simply drops the Buy button: the button is the element carrying
    // `margin-left: auto`, so without a stand-in the whole right-hand column of
    // a maxed row collapses back to the left.
    expect(maxed.badgeRight, 'a maxed row should not shift its right-hand column')
      .toBeGreaterThan(untouched.badgeRight - 2);
    expect(maxed.badgeRight).toBeLessThan(untouched.badgeRight + 2);
  });

  test('redrawing the pane groups unbought, then part-bought, then finished — cheapest first', async ({ game }) => {
    await game.boot();
    await openUpAndGrantAp(game);
    await openPerksPane(game);

    await maxOutPerk(game, MAXES_IN_ONE);
    await maxOutPerk(game, MAXES_IN_TWO);
    await buyPerk(game, STAYS_PARTIAL);
    await game.page.waitForTimeout(600);

    await reopenPerksPane(game);
    const rows = await readPerkRows(game);

    expect(rowFor(rows, MAXES_IN_ONE).maxed, 'purchases survive a redraw').toBe(true);
    expect(rowFor(rows, MAXES_IN_TWO).maxed, 'purchases survive a redraw').toBe(true);
    expect(rowFor(rows, STAYS_PARTIAL).maxed, 'a cap of 10 is not reached in one press').toBe(false);
    expect(rowFor(rows, STAYS_PARTIAL).boughtYet, 'a cap of 10 is not reached in one press').toBe(1);

    const group = (row) => (row.maxed ? 2 : (row.boughtYet > 0 ? 1 : 0));
    const order = rows.map(group);

    // (a) the three groups are contiguous and in that order.
    expect(order, 'unbought perks must come before part-bought, and both before finished')
      .toEqual([...order].sort((a, b) => a - b));

    // All three groups are actually represented, or the assertion above is free.
    expect(new Set(order).size, 'this run has an unbought, a part-bought and a finished perk')
      .toBe(3);

    // The secondary sort: within a group, cheapest first.
    for (const g of [0, 1, 2]) {
      const prices = rows.filter((r) => group(r) === g).map((r) => r.price);
      expect(prices, `group ${g} should read cheapest-first`)
        .toEqual([...prices].sort((a, b) => a - b));
    }

    // And the finished ones are still finished-looking after the redraw — the
    // draw path and the frame loop have to agree, not just one of them.
    for (const row of rows.filter((r) => r.maxed)) {
      expect(row.buyButtons, `${row.key} is finished and must have no Buy button`).toBe(0);
      expect(row.statusText, `${row.key} should not repeat its completion`).toBe('');
      expect(row.costText.toLowerCase(), `${row.key} should carry the badge`).toContain('max');
    }
  });

  test('the AP charged is exactly what the rows quoted before they were pressed', async ({ game }) => {
    await game.boot();
    await openUpAndGrantAp(game);
    await openPerksPane(game);

    // The prices as the pane is advertising them, before anything is pressed.
    const quoted = await readPerkRows(game);
    const bagPrice = rowFor(quoted, MAXES_IN_ONE).price;
    const boost = rowFor(quoted, MAXES_IN_TWO);

    const apBefore = await game.withMods((m) => m.cg.getAscendencyPoints());
    expect(apBefore, 'the debug menu grant should have landed').toBe(DEBUG_AP_GRANT);

    await maxOutPerk(game, MAXES_IN_ONE);
    await maxOutPerk(game, MAXES_IN_TWO);

    // asteroidScannerBoost's price multiple is 1, so every level costs the
    // opening price — which makes the total checkable without re-deriving the
    // cost curve here and calling that a proof.
    const flatPriced = await game.withMods(
      (m, key) => m.rdo.getAscendencyBuffDataObject()[key].rebuyableIncreaseMultiple === 1,
      MAXES_IN_TWO
    );
    expect(flatPriced, 'this arithmetic assumes a flat rebuy price').toBe(true);

    const apAfter = await game.withMods((m) => m.cg.getAscendencyPoints());
    expect(apAfter, 'the pane must charge what it quoted')
      .toBe(apBefore - bagPrice - (boost.price * boost.timesRebuyable));
  });
});
