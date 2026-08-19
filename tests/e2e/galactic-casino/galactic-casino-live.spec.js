/**
 * Area: Galactic Casino — the four games played on their own buttons
 * Plan: tests/docs/areas/galactic-casino.md
 *
 * `games.spec.js` and `cp-economy.spec.js` reach into the module and call
 * `playDoubleOrNothing()`, `playWheelOfFortune()` and
 * `claimCasinoSpecialPrizeByKey()` directly. That proves the payout maths. It
 * proves nothing about the part of the casino that is actually intricate: every
 * one of the four games is armed and disarmed by `galacticCasinoChecks()` on the
 * frame loop, and the arming rules are where the interesting behaviour lives.
 *
 *   Game 1  the Spin button is enabled by the *stake field's own input handler*,
 *           not by the loop, and the field clamps the stake to the CP balance
 *   Game 2  the loop refuses to arm Spin while an unclaimed special is waiting,
 *           and enables each prize in the dropdown only when its target exists
 *   Game 3  the Play/Cash Out button is one control in three states, and the
 *           prize tier is re-rolled by the reveal count
 *   Game 4  the loop arms Spin from the selected prize's cost against the
 *           balance, and disables prizes with nothing to point at
 *
 * So nothing here calls a casino function. Every game is played by typing into
 * its field, choosing in its dropdown and pressing its buttons, and the payouts
 * are read back off the balances afterwards.
 *
 * ## Making the outcomes deterministic without stubbing anything
 *
 * All four levers used below are shipped by the game itself:
 *
 *   setBaseProbabilityCasino()      the tunable behind Double or Nothing
 *   wheelForceSpecial               variable debugger — wheel lands segment 0
 *   casinoGame4AlwaysWin            variable debugger — Higher or Lower never loses
 *   casinoGame5VoidSeerAlwaysMatch  variable debugger — the Void Seer reels match
 *   globalThis.__wheelForceIndex    the wheel's own forced-segment hook
 *
 * `Math.random` is never patched, so every code path taken is a path the game
 * can genuinely take.
 *
 * ## Disabled means disabled here
 *
 * Unlike the purchase buttons elsewhere in the game, the casino's controls go
 * through `setButtonState`, which sets a real `disabled` attribute. A disabled
 * `<button>` does not fire its handler even for a dispatched click, so a refusal
 * can be tested by pressing the button rather than only by reading a class —
 * and these specs do press.
 */
import { test, expect } from '../_harness/game-fixture.mjs';
import { bootCasino, casinoPoints, notificationShown, selectDropdownOption } from './_casino-helpers.mjs';

// Every spin is a real animation: Double or Nothing runs 5s, the Void Seer 5.1s,
// and the Higher or Lower specs play several nine-card rounds back to back.
test.describe.configure({ timeout: 300_000 });

// ---------------------------------------------------------------------- helpers

/** Press a button by id, reporting whether it was actually enabled. */
async function pressButton(game, id) {
  const state = await game.page.evaluate((buttonId) => {
    const el = document.getElementById(buttonId);
    if (!el) return null;
    const enabled = !el.disabled;
    const ready = el.classList.contains('green-ready-text');
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return { enabled, ready };
  }, id);
  if (!state) throw new Error(`Casino button not found: ${id}`);
  return state;
}

/** Read a button's arming without pressing it. */
function buttonState(game, id) {
  return game.page.evaluate((buttonId) => {
    const el = document.getElementById(buttonId);
    if (!el) return null;
    return {
      enabled: !el.disabled,
      ready: el.classList.contains('green-ready-text'),
      pointerEvents: getComputedStyle(el).pointerEvents
    };
  }, id);
}

/** Type a stake into Game 1's field, through its real input handler. */
async function typeStake(game, value) {
  const field = await game.page.evaluate((v) => {
    const el = document.getElementById('galacticCasinoGame1StakeTextArea');
    el.value = String(v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return el.value;
  }, value);
  await game.page.waitForTimeout(200);
  return field;
}

/** Wait for the wheel to stop turning. */
async function waitForWheelIdle(game, timeout = 20000) {
  await game.page.waitForFunction(
    () => document.getElementById('galacticCasinoGame2Wheel')?.getAttribute('data-spinning') === 'false',
    null,
    { timeout }
  );
}

/** Wait for the Void Seer reels to stop turning. */
async function waitForVoidSeerIdle(game, timeout = 25000) {
  await game.page.waitForFunction(
    () => document.getElementById('galacticCasinoGame4Container')?.getAttribute('data-spinning') === 'false',
    null,
    { timeout }
  );
}

/** Every balance a casino prize can move, sampled in one go. */
function balances(game) {
  return game.withMods((m) => {
    const total = (category) => Object.entries(m.rdo.getResourceDataObject(category) || {})
      .filter(([key]) => key !== 'version')
      .reduce((sum, [, entry]) => sum + (Number(entry?.quantity) || 0), 0);
    return {
      cp: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
      cash: m.rdo.getResourceDataObject('currency', ['cash']),
      research: m.rdo.getResourceDataObject('research', ['quantity']),
      resources: total('resources'),
      compounds: total('compounds'),
      antimatter: m.rdo.getResourceDataObject('antimatter', ['quantity'])
    };
  });
}

/** Which of a Higher or Lower prize key's balances should have moved. */
function expectedMoverForHiloKey(key) {
  if (/^hilo_cp_\d+$/.test(key)) return 'cp';
  if (key.startsWith('hilo_cash')) return 'cash';
  if (key.startsWith('hilo_research')) return 'research';
  if (key === 'hilo_resource_topup') return 'resources';
  if (key === 'hilo_compound_topup') return 'compounds';
  if (key.startsWith('special_double_')) return 'stock';
  if (key.startsWith('hilo_timewarp_')) return 'timewarp';
  // The tier 7 finish-a-journey prizes fall back to a flat 150 CP when there is
  // nothing in flight to finish.
  return 'cp';
}

// ============================================================================

test.describe('Galactic Casino — buying the chips', () => {
  test('CP is bought through the dropdown, the field and the Buy button, and charges the chosen material', async ({ game }) => {
    await bootCasino(game, { cp: false });
    // The cost preview carries the `notation` class, so in the default condensed
    // mode 300000 renders as "300.0K" and cannot be compared with the charge
    // exactly. Plain notation groups in thousands and loses nothing.
    await game.withMods((m) => m.cg.setNotationType('normal'));
    await game.page.waitForTimeout(400);

    // Cash is the reference material at a value of exactly 1; hydrogen and
    // titanium sit at either end of the price table, so the three together
    // cover the whole `costPerCp = cpBaseCost / valueOfOneCP` calculation.
    const purchases = [
      { material: 'cash', category: 'currency', quantity: 3 },
      { material: 'hydrogen', category: 'resources', quantity: 2 },
      { material: 'titanium', category: 'compounds', quantity: 4 }
    ];

    for (const purchase of purchases) {
      await selectDropdownOption(game, 'galacticCasinoPurchaseItemDropDown', purchase.material);
      await game.page.evaluate((quantity) => {
        const field = document.getElementById('galacticCasinoPurchaseQuantityTextArea');
        field.value = String(quantity);
        field.dispatchEvent(new Event('input', { bubbles: true }));
      }, purchase.quantity);
      // The preview and the Buy button's arming are recomputed by the frame
      // loop rather than by the input handler.
      await game.page.waitForTimeout(600);

      // Quote, press and re-read inside one synchronous block: `buyCasinoPoints`
      // is synchronous, so the loop cannot top up a material in between.
      const result = await game.page.evaluate((cfg) => {
        const m = globalThis.__mods;
        const holding = () => (cfg.category === 'currency'
          ? m.rdo.getResourceDataObject('currency', ['cash'])
          : m.rdo.getResourceDataObject(cfg.category, [cfg.material, 'quantity']));
        const button = document.querySelector('.galactic-casino-buy-cp-button');

        const cpBaseCost = m.rdo.getGalacticCasinoDataObject('casinoPoints', ['cpBaseCost']);
        const valueOfOneCp = cfg.category === 'currency'
          ? 1
          : m.rdo.getGalacticCasinoDataObject('casinoPoints', ['valueOfOneCP', cfg.category, cfg.material]);
        // The preview goes through the notation formatter; plain notation
        // groups in thousands, so the separators come off before comparing.
        const preview = Number(String(document.getElementById('galacticCasinoPurchaseCpPreview').textContent).replace(/[^\d]/g, ''));
        const armed = !button.disabled;

        const before = { material: holding(), cp: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']) };
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const after = { material: holding(), cp: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']) };

        return {
          armed,
          preview,
          cpBaseCost,
          valueOfOneCp,
          before,
          after,
          field: document.getElementById('galacticCasinoPurchaseQuantityTextArea').value
        };
      }, purchase);

      const label = `buying ${purchase.quantity} CP with ${purchase.material}`;
      const expectedCost = Math.ceil(purchase.quantity * (result.cpBaseCost / result.valueOfOneCp));

      expect(result.armed, `${label}: Buy should be armed`).toBe(true);
      // The quoted cost is what the player is charged, to the unit.
      expect(result.preview, `${label}: quoted cost`).toBe(expectedCost);
      expect(result.after.cp - result.before.cp, `${label}: chips credited`).toBe(purchase.quantity);
      expect(result.before.material - result.after.material, `${label}: material charged`).toBe(expectedCost);
      // A completed purchase clears the field so the same amount is not bought twice.
      expect(result.field, `${label}: field cleared`).toBe('');
    }
  });

  test('an unaffordable amount is clamped to what the material can actually buy, and Buy stays dead with nothing entered', async ({ game }) => {
    await bootCasino(game, { cp: false });
    await selectDropdownOption(game, 'galacticCasinoPurchaseItemDropDown', 'cash');

    const idle = await game.page.evaluate(() => !document.querySelector('.galactic-casino-buy-cp-button').disabled);
    expect(idle, 'nothing entered, nothing to buy').toBe(false);

    const clamped = await game.page.evaluate(async () => {
      const m = globalThis.__mods;
      const field = document.getElementById('galacticCasinoPurchaseQuantityTextArea');
      const cash = m.rdo.getResourceDataObject('currency', ['cash']);
      const cpBaseCost = m.rdo.getGalacticCasinoDataObject('casinoPoints', ['cpBaseCost']);
      const maxAffordable = Math.floor(cash / cpBaseCost);

      field.value = String(maxAffordable + 5000);
      field.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 700));

      return { maxAffordable, field: Number(field.value), armed: !document.querySelector('.galactic-casino-buy-cp-button').disabled };
    });

    expect(clamped.field).toBe(clamped.maxAffordable);
    // Clamped down to something affordable, the purchase is allowed.
    expect(clamped.armed).toBe(true);
  });

  test('a material the run has not unlocked is offered greyed out and cannot be selected', async ({ game }) => {
    await game.boot();
    // A plain run: only the starting resource is unlocked, so the rest of the
    // dropdown must be shut.
    await game.debugClick('unlockAllTabsButton');
    await game.page.waitForTimeout(600);
    await game.openTab(7);
    await game.page.evaluate(() => {
      const el = document.getElementById('galacticCasinoOption');
      el?.closest('.row-side-menu')?.classList.remove('invisible');
      el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(1200);

    const rows = await game.withMods((m) => {
      const unlockedResources = (m.cg.getUnlockedResourcesArray() || []).map((v) => String(v).toLowerCase());
      const unlockedCompounds = (m.cg.getUnlockedCompoundsArray() || []).map((v) => String(v).toLowerCase());
      return Array.from(document.querySelectorAll('#galacticCasinoPurchaseItemDropDown .dropdown-option'))
        .map((el) => ({
          value: String(el.getAttribute('data-value') || '').toLowerCase(),
          type: String(el.getAttribute('data-type') || '').toLowerCase(),
          greyed: el.classList.contains('red-disabled-text'),
          pointerEvents: el.style.pointerEvents,
          unlocked: unlockedResources.includes(String(el.getAttribute('data-value') || '').toLowerCase())
            || unlockedCompounds.includes(String(el.getAttribute('data-value') || '').toLowerCase())
        }));
    });

    expect(rows.length, 'the dropdown should offer materials').toBeGreaterThan(1);
    for (const row of rows) {
      if (row.value === 'select' || row.type === 'currency') continue;
      // The gate is per option and follows the run's unlock lists exactly.
      expect(row.greyed, `${row.value} greyed`).toBe(!row.unlocked);
      expect(row.pointerEvents, `${row.value} pointer events`).toBe(row.unlocked ? 'auto' : 'none');
    }
  });
});

test.describe('Galactic Casino — Game 1: Double or Nothing, played on the button', () => {
  test.beforeEach(async ({ game }) => {
    await bootCasino(game);
  });

  test('a winning spin pays double the stake back and records the game as won', async ({ game }) => {
    await game.withMods((m) => {
      m.rdo.setGalacticCasinoDataObject([], 'casinoGamesWon');
      m.casino.setBaseProbabilityCasino(1);
    });

    const typed = await typeStake(game, 25);
    expect(typed, 'the field should hold the stake').toBe('25');

    const before = await game.withMods((m) => ({
      cp: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
      played: m.cg.statFunctionsGets.stat_doubleOrNothingPlayedThisRun(),
      won: m.cg.statFunctionsGets.stat_doubleOrNothingWonThisRun(),
      spent: m.cg.statFunctionsGets.stat_casinoPointsSpentThisRun()
    }));

    const press = await pressButton(game, 'galacticCasinoGame1SpinButton');
    expect(press.enabled, 'Spin should be live with a stake typed').toBe(true);

    // The stake is taken up front and the button locked for the spin.
    await game.page.waitForTimeout(400);
    const during = await buttonState(game, 'galacticCasinoGame1SpinButton');
    const staked = await casinoPoints(game);

    // The spin animation runs for five seconds and pays on completion.
    await game.page.waitForTimeout(6500);
    const after = await game.withMods((m) => ({
      cp: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
      played: m.cg.statFunctionsGets.stat_doubleOrNothingPlayedThisRun(),
      won: m.cg.statFunctionsGets.stat_doubleOrNothingWonThisRun(),
      spent: m.cg.statFunctionsGets.stat_casinoPointsSpentThisRun(),
      gamesWon: m.rdo.getGalacticCasinoDataObject('casinoGamesWon'),
      spinner: document.getElementById('galacticCasinoGame1Spinner')?.textContent?.trim()
    }));

    expect(staked, 'the stake is debited before the reel turns').toBe(before.cp - 25);
    expect(during.enabled, 'Spin is locked while the reel turns').toBe(false);
    // Double back on the debited balance, so a win nets the stake.
    expect(after.cp).toBe(before.cp + 25);
    expect(after.played).toBe(before.played + 1);
    expect(after.won).toBe(before.won + 1);
    expect(after.spent).toBe(before.spent + 25);
    expect(after.gamesWon).toContain('game1');
  });

  test('a losing spin keeps the stake and leaves the game unwon', async ({ game }) => {
    await game.withMods((m) => {
      m.rdo.setGalacticCasinoDataObject([], 'casinoGamesWon');
      m.casino.setBaseProbabilityCasino(0);
    });

    await typeStake(game, 40);
    const before = await game.withMods((m) => ({
      cp: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
      won: m.cg.statFunctionsGets.stat_doubleOrNothingWonThisRun()
    }));

    await pressButton(game, 'galacticCasinoGame1SpinButton');
    await game.page.waitForTimeout(6500);

    const after = await game.withMods((m) => ({
      cp: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
      won: m.cg.statFunctionsGets.stat_doubleOrNothingWonThisRun(),
      gamesWon: m.rdo.getGalacticCasinoDataObject('casinoGamesWon')
    }));

    expect(after.cp).toBe(before.cp - 40);
    expect(after.won).toBe(before.won);
    expect(after.gamesWon).not.toContain('game1');
  });

  test('the stake field rejects letters, strips leading zeros and clamps to the balance, arming Spin only for a real stake', async ({ game }) => {
    await game.withMods((m) => m.rdo.setGalacticCasinoDataObject(200, 'casinoPoints', ['quantity']));

    expect(await typeStake(game, '12abc3'), 'letters are dropped').toBe('123');
    expect(await typeStake(game, '0007'), 'leading zeros are stripped').toBe('7');
    // Clamping in the field is what stops an unaffordable stake from ever
    // reaching the game, so there is no "not enough CP" path to fall into.
    expect(await typeStake(game, '9999'), 'clamped to the balance').toBe('200');
    expect((await buttonState(game, 'galacticCasinoGame1SpinButton')).enabled).toBe(true);

    expect(await typeStake(game, ''), 'an empty field stays empty').toBe('');
    const empty = await buttonState(game, 'galacticCasinoGame1SpinButton');
    expect(empty.enabled, 'Spin is dead with no stake').toBe(false);

    // And a dead button really is dead: pressing it must not start a spin.
    const before = await casinoPoints(game);
    await pressButton(game, 'galacticCasinoGame1SpinButton');
    await game.page.waitForTimeout(800);
    expect(await casinoPoints(game)).toBe(before);
  });
});

test.describe('Galactic Casino — Game 2: the Wheel of Fortune, spun on the button', () => {
  test.beforeEach(async ({ game }) => {
    await bootCasino(game);
  });

  test('the special segment arms the prize dropdown, and the Claim button pays the prize that was chosen', async ({ game }) => {
    await game.setDebugVariable('wheelForceSpecial', 'true');
    await game.closeVariableDebugger();
    await game.page.waitForTimeout(500);

    const before = await game.withMods((m) => ({
      cp: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
      special: m.cg.statFunctionsGets.stat_wheelSpecialWonThisRun()
    }));

    // Before the spin, the dropdown and Claim are shut.
    const idle = await game.page.evaluate(() => ({
      dropdownLocked: document.getElementById('galacticCasinoGame2PrizeDropdown').style.pointerEvents === 'none',
      claim: !document.getElementById('galacticCasinoGame2ClaimButton').disabled
    }));
    expect(idle.dropdownLocked).toBe(true);
    expect(idle.claim).toBe(false);

    const press = await pressButton(game, 'galacticCasinoGame2SpinWheelButton');
    expect(press.enabled, 'Spin should be live with CP in hand').toBe(true);
    await waitForWheelIdle(game);
    await game.page.waitForTimeout(700);

    const armed = await game.page.evaluate(() => ({
      specialReady: document.getElementById('galacticCasinoGame2Wheel').getAttribute('data-special-ready'),
      dropdownLocked: document.getElementById('galacticCasinoGame2PrizeDropdown').style.pointerEvents === 'none',
      spinAgain: !document.getElementById('galacticCasinoGame2SpinWheelButton').disabled
    }));

    expect(armed.specialReady).toBe('true');
    expect(armed.dropdownLocked, 'the prize dropdown opens once the special lands').toBe(false);
    // Spinning again is refused until the prize is taken.
    expect(armed.spinAgain).toBe(false);

    await selectDropdownOption(game, 'galacticCasinoGame2PrizeDropdown', 'special_100cp');
    await game.page.waitForTimeout(600);
    const claimReady = await buttonState(game, 'galacticCasinoGame2ClaimButton');
    expect(claimReady.enabled, 'Claim arms once a prize is chosen').toBe(true);

    await pressButton(game, 'galacticCasinoGame2ClaimButton');
    await game.page.waitForTimeout(800);

    const after = await game.withMods((m) => ({
      cp: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
      special: m.cg.statFunctionsGets.stat_wheelSpecialWonThisRun(),
      specialReady: document.getElementById('galacticCasinoGame2Wheel').getAttribute('data-special-ready'),
      claim: !document.getElementById('galacticCasinoGame2ClaimButton').disabled,
      spinAgain: !document.getElementById('galacticCasinoGame2SpinWheelButton').disabled
    }));

    // One CP for the spin, a hundred back for the prize.
    expect(after.cp).toBe(before.cp - 1 + 100);
    expect(after.special).toBe(before.special + 1);
    expect(after.specialReady).toBe('false');
    expect(after.claim, 'Claim goes dead once the prize is taken').toBe(false);
    expect(after.spinAgain, 'and the wheel is free to spin again').toBe(true);
  });

  test('the research special prize pays its hundred thousand through the same Claim button', async ({ game }) => {
    await game.setDebugVariable('wheelForceSpecial', 'true');
    await game.closeVariableDebugger();
    await game.withMods((m) => m.rdo.setResourceDataObject(1000, 'research', ['quantity']));

    await pressButton(game, 'galacticCasinoGame2SpinWheelButton');
    await waitForWheelIdle(game);
    await game.page.waitForTimeout(600);

    await selectDropdownOption(game, 'galacticCasinoGame2PrizeDropdown', 'special_100k_research');
    await game.page.waitForTimeout(500);

    // Research accrues on the frame loop, so read either side of the press in
    // one synchronous block.
    const claim = await game.page.evaluate(() => {
      const m = globalThis.__mods;
      const before = m.rdo.getResourceDataObject('research', ['quantity']);
      document.getElementById('galacticCasinoGame2ClaimButton').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return { before, after: m.rdo.getResourceDataObject('research', ['quantity']) };
    });

    expect(claim.after - claim.before).toBe(100000);
  });

  test('a doubling prize doubles the stock it names, chosen from the real dropdown', async ({ game }) => {
    await game.setDebugVariable('wheelForceSpecial', 'true');
    await game.closeVariableDebugger();
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(1e9, 'resources', ['iron', 'storageCapacity']);
      m.rdo.setResourceDataObject(1234, 'resources', ['iron', 'quantity']);
    });

    await pressButton(game, 'galacticCasinoGame2SpinWheelButton');
    await waitForWheelIdle(game);
    await game.page.waitForTimeout(600);

    await selectDropdownOption(game, 'galacticCasinoGame2PrizeDropdown', 'special_double_iron');
    await game.page.waitForTimeout(500);

    const claim = await game.page.evaluate(() => {
      const m = globalThis.__mods;
      m.rdo.setResourceDataObject(1234, 'resources', ['iron', 'quantity']);
      const before = m.rdo.getResourceDataObject('resources', ['iron', 'quantity']);
      document.getElementById('galacticCasinoGame2ClaimButton').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return { before, after: m.rdo.getResourceDataObject('resources', ['iron', 'quantity']) };
    });

    expect(claim.before).toBe(1234);
    expect(claim.after).toBe(2468);
  });

  test('a prize with nothing to point at is offered greyed out and cannot be claimed', async ({ game }) => {
    await game.setDebugVariable('wheelForceSpecial', 'true');
    await game.closeVariableDebugger();

    await pressButton(game, 'galacticCasinoGame2SpinWheelButton');
    await waitForWheelIdle(game);
    await game.page.waitForTimeout(800);

    // With no rocket in flight, no starship travelling and the telescope idle,
    // the five "finish that job" prizes have no target.
    const options = await game.page.evaluate(() =>
      Array.from(document.querySelectorAll('#galacticCasinoGame2PrizeDropdown .dropdown-option'))
        .map((el) => ({
          value: el.getAttribute('data-value'),
          greyed: el.classList.contains('red-disabled-text'),
          pointerEvents: el.style.pointerEvents
        })));

    const byValue = Object.fromEntries(options.map((o) => [o.value, o]));
    for (const key of [
      'special_rocket_warp',
      'special_starship_warp',
      'special_telescope_finish_asteroid_search',
      'special_telescope_finish_star_study'
    ]) {
      expect(byValue[key].greyed, `${key} should be greyed with nothing in flight`).toBe(true);
      expect(byValue[key].pointerEvents, `${key} pointer events`).toBe('none');
    }
    // The prizes that always have a target stay live.
    expect(byValue.special_100cp.greyed).toBe(false);
    expect(byValue.special_100k_research.greyed).toBe(false);
  });

  test('a losing segment costs the spin and pays nothing', async ({ game }) => {
    await game.page.evaluate(() => { globalThis.__wheelForceIndex = 3; });

    const before = await casinoPoints(game);
    await pressButton(game, 'galacticCasinoGame2SpinWheelButton');
    await waitForWheelIdle(game);
    await game.page.waitForTimeout(600);

    const after = await game.withMods((m) => ({
      cp: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
      specialReady: document.getElementById('galacticCasinoGame2Wheel').getAttribute('data-special-ready')
    }));
    await game.page.evaluate(() => { delete globalThis.__wheelForceIndex; });

    expect(after.cp).toBe(before - 1);
    expect(after.specialReady).toBe('false');
  });

  test('a winning segment always pays something, and over a run of spins pays out of more than one prize family', async ({ game }) => {
    const SPINS = 10;
    await game.withMods((m) => m.rdo.setGalacticCasinoDataObject([], 'casinoGamesWon'));

    const families = new Set();
    let barren = 0;

    for (let i = 0; i < SPINS; i++) {
      await game.page.evaluate(() => { globalThis.__wheelForceIndex = 4; });
      const before = await balances(game);
      await pressButton(game, 'galacticCasinoGame2SpinWheelButton');
      await waitForWheelIdle(game);
      await game.page.waitForTimeout(250);
      const after = await balances(game);

      const moved = [];
      // The spin cost of 1 CP comes off up front, so a CP prize shows as a gain
      // measured against the already-debited balance.
      if (after.cp > before.cp - 1) moved.push('cp');
      for (const key of ['cash', 'research', 'resources', 'compounds']) {
        if (after[key] > before[key]) moved.push(key);
      }
      if (moved.length === 0) barren++;
      moved.forEach((f) => families.add(f));
    }
    await game.page.evaluate(() => { delete globalThis.__wheelForceIndex; });

    const state = await game.withMods((m) => ({
      gamesWon: m.rdo.getGalacticCasinoDataObject('casinoGamesWon'),
      won: m.cg.statFunctionsGets.stat_wheelOfFortuneWonThisRun()
    }));

    expect(state.gamesWon).toContain('game2');
    expect(state.won).toBeGreaterThanOrEqual(SPINS);
    // No winning segment may pay nothing: the time family falls back to CP when
    // no timer is running, so there is no dead branch.
    expect(barren, `${barren} of ${SPINS} winning spins paid nothing`).toBe(0);
    expect([...families].length, `families seen: ${[...families].join(', ')}`).toBeGreaterThan(1);
  });

  test('the wheel refuses to spin without the chip for it', async ({ game }) => {
    await game.withMods((m) => m.rdo.setGalacticCasinoDataObject(0, 'casinoPoints', ['quantity']));
    await game.page.waitForTimeout(700);

    const state = await buttonState(game, 'galacticCasinoGame2SpinWheelButton');
    expect(state.enabled, 'Spin is dead on an empty balance').toBe(false);

    await pressButton(game, 'galacticCasinoGame2SpinWheelButton');
    await game.page.waitForTimeout(700);
    const spinning = await game.page.evaluate(() =>
      document.getElementById('galacticCasinoGame2Wheel').getAttribute('data-spinning'));
    expect(spinning, 'and pressing it starts nothing').toBe('false');
    expect(await casinoPoints(game)).toBe(0);
  });
});

test.describe('Galactic Casino — Game 3: Higher or Lower, dealt and played on the buttons', () => {
  test.beforeEach(async ({ game }) => {
    await bootCasino(game);
    // `casinoGame4AlwaysWin` is the Higher-or-Lower never-lose switch; the name
    // is one ahead of the game number used everywhere else in the code.
    await game.setDebugVariable('casinoGame4AlwaysWin', 'true');
    await game.closeVariableDebugger();
  });

  test('Play deals nine cards for 5 CP, reveals the first, and locks Cash Out until three are showing', async ({ game }) => {
    const before = await casinoPoints(game);

    const idle = await game.page.evaluate(() =>
      document.getElementById('galacticCasinoGame3HiloContainer').getAttribute('data-hilo-state'));
    await pressButton(game, 'galacticCasinoGame3CashOutButton');
    await game.page.waitForTimeout(500);

    const dealt = await game.page.evaluate(() => {
      const container = document.getElementById('galacticCasinoGame3HiloContainer');
      const cards = Array.from(document.querySelectorAll('#galacticCasinoGame3CardRow .galactic-casino-hilo-card'));
      return {
        state: container.getAttribute('data-hilo-state'),
        deckLength: JSON.parse(container.getAttribute('data-hilo-deck') || '[]').length,
        index: container.getAttribute('data-hilo-index'),
        cards: cards.length,
        faceUp: cards.filter((c) => !c.classList.contains('galactic-casino-hilo-card-back')).length,
        higher: !document.getElementById('galacticCasinoGame3HigherButton').disabled,
        lower: !document.getElementById('galacticCasinoGame3LowerButton').disabled,
        cashOut: !document.getElementById('galacticCasinoGame3CashOutButton').disabled,
        preview: document.getElementById('galacticCasinoGame3PrizePreview').textContent
      };
    });

    expect(idle).toBe('idle');
    expect(dealt.state).toBe('active');
    expect(dealt.deckLength).toBe(9);
    expect(dealt.cards).toBe(9);
    expect(dealt.index).toBe('0');
    expect(dealt.faceUp).toBe(1);
    expect(dealt.higher).toBe(true);
    expect(dealt.lower).toBe(true);
    expect(dealt.cashOut, 'no cashing out on one card').toBe(false);
    expect(dealt.preview).toBe('---');
    expect(await casinoPoints(game)).toBe(before - 5);
  });

  test('each correct guess turns another card and raises the prize tier', async ({ game }) => {
    await pressButton(game, 'galacticCasinoGame3CashOutButton');
    await game.page.waitForTimeout(400);

    const steps = [];
    for (let i = 0; i < 5; i++) {
      await pressButton(game, 'galacticCasinoGame3HigherButton');
      await game.page.waitForTimeout(250);
      steps.push(await game.page.evaluate(() => {
        const container = document.getElementById('galacticCasinoGame3HiloContainer');
        return {
          index: Number(container.getAttribute('data-hilo-index')),
          tier: Number(container.getAttribute('data-hilo-tier')),
          prizeKey: container.getAttribute('data-hilo-tier-prize-key'),
          preview: document.getElementById('galacticCasinoGame3PrizePreview').textContent,
          faceUp: Array.from(document.querySelectorAll('#galacticCasinoGame3CardRow .galactic-casino-hilo-card'))
            .filter((c) => !c.classList.contains('galactic-casino-hilo-card-back')).length,
          cashOut: !document.getElementById('galacticCasinoGame3CashOutButton').disabled
        };
      }));
    }

    // Tier is min(7, revealed - 2), and revealed is index + 1.
    expect(steps.map((s) => s.index)).toEqual([1, 2, 3, 4, 5]);
    expect(steps.map((s) => s.faceUp)).toEqual([2, 3, 4, 5, 6]);
    expect(steps.map((s) => s.tier)).toEqual([0, 1, 2, 3, 4]);
    expect(steps[0].preview, 'two cards is not a prize yet').toBe('---');
    expect(steps[0].cashOut).toBe(false);
    for (const step of steps.slice(1)) {
      expect(step.cashOut).toBe(true);
      expect(step.prizeKey).not.toBe('');
      expect(step.preview).not.toBe('---');
    }
  });

  test('cashing out pays the prize the pane was offering, whatever family it fell in', async ({ game }) => {
    // Five separate hands, cashed out at a different depth each time, so the
    // prize comes from a different tier and the payout of each family is
    // checked against the balance it is supposed to move.
    const rounds = [];

    for (let guesses = 2; guesses <= 6; guesses++) {
      await pressButton(game, 'galacticCasinoGame3CashOutButton');
      await game.page.waitForTimeout(400);
      for (let i = 0; i < guesses; i++) {
        await pressButton(game, 'galacticCasinoGame3HigherButton');
        await game.page.waitForTimeout(220);
      }

      // Read the offered prize, press Cash Out and re-read every balance in one
      // synchronous block, so production cannot be mistaken for a payout.
      const round = await game.page.evaluate(() => {
        const m = globalThis.__mods;
        const container = document.getElementById('galacticCasinoGame3HiloContainer');
        const total = (category) => Object.entries(m.rdo.getResourceDataObject(category) || {})
          .filter(([key]) => key !== 'version')
          .reduce((sum, [, entry]) => sum + (Number(entry?.quantity) || 0), 0);
        const read = () => ({
          cp: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
          cash: m.rdo.getResourceDataObject('currency', ['cash']),
          research: m.rdo.getResourceDataObject('research', ['quantity']),
          resources: total('resources'),
          compounds: total('compounds')
        });

        const prizeKey = container.getAttribute('data-hilo-tier-prize-key');
        const tier = Number(container.getAttribute('data-hilo-tier'));
        const before = read();
        document.getElementById('galacticCasinoGame3CashOutButton').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        return { prizeKey, tier, before, after: read(), state: container.getAttribute('data-hilo-state') };
      });

      rounds.push(round);
      await game.page.waitForTimeout(700);
    }

    for (const round of rounds) {
      const label = `tier ${round.tier} prize ${round.prizeKey}`;
      expect(round.prizeKey, `${label}: a prize should have been offered`).not.toBe('');
      // Cashing out resets the table immediately rather than after the losing
      // hand's two-second delay.
      expect(round.state, `${label}: table reset`).toBe('idle');

      const mover = expectedMoverForHiloKey(round.prizeKey);
      const delta = {
        cp: round.after.cp - round.before.cp,
        cash: round.after.cash - round.before.cash,
        research: round.after.research - round.before.research,
        resources: round.after.resources - round.before.resources,
        compounds: round.after.compounds - round.before.compounds
      };

      if (mover === 'timewarp') {
        // A time warp prize pays in game speed rather than in a balance; it is
        // started on a three-second delay and is covered by the black hole area.
        continue;
      }
      if (mover === 'stock') {
        const material = round.prizeKey.replace('special_double_', '');
        expect(
          delta.resources + delta.compounds,
          `${label}: doubling ${material} should raise a stock`
        ).toBeGreaterThan(0);
        continue;
      }
      // A flat CP prize names its own amount in the key.
      const flatCp = round.prizeKey.match(/^hilo_cp_(\d+)$/);
      if (flatCp) {
        expect(delta.cp, `${label}: exact CP payout`).toBe(Number(flatCp[1]));
        continue;
      }
      expect(delta[mover], `${label}: ${mover} should have grown, deltas ${JSON.stringify(delta)}`).toBeGreaterThan(0);
    }
  });

  test('clearing all nine cards pays the top tier and returns the table to idle', async ({ game }) => {
    await game.withMods((m) => m.rdo.setGalacticCasinoDataObject([], 'casinoGamesWon'));

    await pressButton(game, 'galacticCasinoGame3CashOutButton');
    await game.page.waitForTimeout(400);
    for (let i = 0; i < 8; i++) {
      await pressButton(game, 'galacticCasinoGame3HigherButton');
      await game.page.waitForTimeout(220);
    }

    const cleared = await game.withMods((m) => ({
      tier: Number(document.getElementById('galacticCasinoGame3HiloContainer').getAttribute('data-hilo-tier')),
      state: document.getElementById('galacticCasinoGame3HiloContainer').getAttribute('data-hilo-state'),
      won: m.cg.statFunctionsGets.stat_higherLowerWonThisRun(),
      gamesWon: m.rdo.getGalacticCasinoDataObject('casinoGamesWon')
    }));

    // The table returns to idle on a two-second timer after the last card.
    await game.page.waitForTimeout(2800);
    const reset = await game.page.evaluate(() => ({
      state: document.getElementById('galacticCasinoGame3HiloContainer').getAttribute('data-hilo-state'),
      preview: document.getElementById('galacticCasinoGame3PrizePreview').textContent,
      faceUp: Array.from(document.querySelectorAll('#galacticCasinoGame3CardRow .galactic-casino-hilo-card'))
        .filter((c) => !c.classList.contains('galactic-casino-hilo-card-back')).length
    }));

    expect(cleared.tier).toBe(7);
    expect(cleared.state).toBe('ending');
    expect(cleared.won).toBeGreaterThanOrEqual(1);
    expect(cleared.gamesWon).toContain('game3');
    expect(reset.state).toBe('idle');
    expect(reset.preview).toBe('---');
    expect(reset.faceUp, 'the cards are turned back over').toBe(0);
  });

  test('a wrong guess ends the hand and the stake is gone', async ({ game }) => {
    // Turn the never-lose switch off so a genuine wrong guess is possible, then
    // make one deliberately against the deck the game just dealt.
    await game.setDebugVariable('casinoGame4AlwaysWin', 'false');
    await game.closeVariableDebugger();

    const before = await casinoPoints(game);
    await pressButton(game, 'galacticCasinoGame3CashOutButton');
    await game.page.waitForTimeout(400);

    const wrongButton = await game.page.evaluate(() => {
      const deck = JSON.parse(document.getElementById('galacticCasinoGame3HiloContainer').getAttribute('data-hilo-deck') || '[]');
      // The deal guarantees consecutive cards never share a value, so exactly
      // one of the two guesses is wrong for the second card.
      return deck[1].value > deck[0].value
        ? 'galacticCasinoGame3LowerButton'
        : 'galacticCasinoGame3HigherButton';
    });

    await pressButton(game, wrongButton);
    await game.page.waitForTimeout(400);
    const ending = await game.page.evaluate(() => ({
      state: document.getElementById('galacticCasinoGame3HiloContainer').getAttribute('data-hilo-state'),
      higher: !document.getElementById('galacticCasinoGame3HigherButton').disabled,
      cashOut: !document.getElementById('galacticCasinoGame3CashOutButton').disabled
    }));

    await game.page.waitForTimeout(2800);
    const reset = await game.page.evaluate(() => ({
      state: document.getElementById('galacticCasinoGame3HiloContainer').getAttribute('data-hilo-state'),
      index: document.getElementById('galacticCasinoGame3HiloContainer').getAttribute('data-hilo-index'),
      deck: document.getElementById('galacticCasinoGame3HiloContainer').getAttribute('data-hilo-deck')
    }));

    expect(ending.state).toBe('ending');
    expect(ending.higher, 'no more guesses on a dead hand').toBe(false);
    expect(ending.cashOut, 'and nothing to cash out').toBe(false);
    expect(reset.state).toBe('idle');
    expect(reset.index).toBe('0');
    expect(reset.deck).toBe('');
    // The 5 CP entry is not refunded on a loss.
    expect(await casinoPoints(game)).toBe(before - 5);
  });

  test('a hand cannot be dealt on fewer than five chips', async ({ game }) => {
    await game.withMods((m) => m.rdo.setGalacticCasinoDataObject(4, 'casinoPoints', ['quantity']));

    await pressButton(game, 'galacticCasinoGame3CashOutButton');
    await game.page.waitForTimeout(400);
    const state = await game.page.evaluate(() =>
      document.getElementById('galacticCasinoGame3HiloContainer').getAttribute('data-hilo-state'));

    expect(state, 'the table stays idle').toBe('idle');
    expect(await casinoPoints(game)).toBe(4);

    const notification = await notificationShown(game, 'notificationCasinoNotEnoughCp');
    expect(notification.shown, `expected "${notification.expected}" among ${JSON.stringify(notification.all)}`).toBe(true);
  });
});

test.describe('Galactic Casino — Game 4: the Visiting Void Seer, spun on the button', () => {
  test.beforeEach(async ({ game }) => {
    await bootCasino(game);
  });

  test('a matched pair on the antimatter prize charges 15 CP and pays a tenth to a third of the stock', async ({ game }) => {
    await game.setDebugVariable('casinoGame5VoidSeerAlwaysMatch', 'true');
    await game.closeVariableDebugger();
    await game.withMods((m) => {
      m.rdo.setGalacticCasinoDataObject([], 'casinoGamesWon');
      m.rdo.setResourceDataObject(10000, 'antimatter', ['quantity']);
    });

    await selectDropdownOption(game, 'galacticCasinoGame4PrizeDropdown', 'prize3');
    await game.page.waitForTimeout(700);

    const before = await game.withMods((m) => ({
      cp: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
      antimatter: m.rdo.getResourceDataObject('antimatter', ['quantity']),
      played: m.cg.statFunctionsGets.stat_voidSeerPlayedThisRun(),
      won: m.cg.statFunctionsGets.stat_voidSeerWonThisRun(),
      spent: m.cg.statFunctionsGets.stat_casinoPointsSpentThisRun(),
      // The reels are rebuilt to the prize's own length when it is chosen. The
      // strip repeats its faces forty times to make the scroll look endless, so
      // the reel's size is the number of *distinct* faces on it.
      reelFaces: new Set(Array.from(document.querySelectorAll('#galacticCasinoGame4Spinner1 .casino-spinner-item'))
        .map((el) => el.dataset.value)).size
    }));

    const press = await pressButton(game, 'galacticCasinoGame4SpinButton');
    expect(press.enabled, 'Spin arms once a prize is chosen and afforded').toBe(true);
    await waitForVoidSeerIdle(game);
    await game.page.waitForTimeout(800);

    const after = await game.withMods((m) => ({
      cp: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
      antimatter: m.rdo.getResourceDataObject('antimatter', ['quantity']),
      played: m.cg.statFunctionsGets.stat_voidSeerPlayedThisRun(),
      won: m.cg.statFunctionsGets.stat_voidSeerWonThisRun(),
      spent: m.cg.statFunctionsGets.stat_casinoPointsSpentThisRun(),
      gamesWon: m.rdo.getGalacticCasinoDataObject('casinoGamesWon')
    }));

    // prize3 costs 15 CP and its reel runs 0..12, so thirteen faces.
    expect(before.reelFaces).toBe(13);
    expect(after.cp).toBe(before.cp - 15);
    expect(after.spent).toBe(before.spent + 15);
    expect(after.played).toBe(before.played + 1);
    expect(after.won).toBe(before.won + 1);
    expect(after.gamesWon).toContain('game4');

    const gain = after.antimatter - before.antimatter;
    expect(gain).toBeGreaterThanOrEqual(Math.floor(before.antimatter * 0.10));
    expect(gain).toBeLessThanOrEqual(Math.ceil(before.antimatter * 0.30));
  });

  test('a losing spin charges the prize and pays nothing', async ({ game }) => {
    await game.setDebugVariable('casinoGame5VoidSeerAlwaysMatch', 'false');
    await game.closeVariableDebugger();
    await game.withMods((m) => m.rdo.setResourceDataObject(10000, 'antimatter', ['quantity']));
    await selectDropdownOption(game, 'galacticCasinoGame4PrizeDropdown', 'prize3');
    await game.page.waitForTimeout(700);

    // Thirteen reel faces, so a stray match is possible; spin until one hand
    // genuinely loses rather than assuming the first does. A loss is identified
    // by the won-stat *not* moving — the reels render every face they can show,
    // so their text is the whole strip and is identical on both sides.
    let lost = null;
    for (let attempt = 0; attempt < 5 && !lost; attempt++) {
      const before = await game.withMods((m) => ({
        cp: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
        antimatter: m.rdo.getResourceDataObject('antimatter', ['quantity']),
        won: m.cg.statFunctionsGets.stat_voidSeerWonThisRun()
      }));
      await pressButton(game, 'galacticCasinoGame4SpinButton');
      await waitForVoidSeerIdle(game);
      await game.page.waitForTimeout(700);
      const after = await game.withMods((m) => ({
        cp: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
        antimatter: m.rdo.getResourceDataObject('antimatter', ['quantity']),
        won: m.cg.statFunctionsGets.stat_voidSeerWonThisRun()
      }));
      if (after.won === before.won) lost = { before, after };
    }

    expect(lost, 'five spins should have produced at least one loss').not.toBeNull();
    expect(lost.after.cp).toBe(lost.before.cp - 15);
    expect(lost.after.antimatter, 'a losing spin pays nothing').toBe(lost.before.antimatter);
  });

  test('Spin stays dead with no prize chosen and with too few chips for the one that is', async ({ game }) => {
    const noSelection = await buttonState(game, 'galacticCasinoGame4SpinButton');
    expect(noSelection.enabled, 'nothing chosen, nothing to spin for').toBe(false);

    await selectDropdownOption(game, 'galacticCasinoGame4PrizeDropdown', 'prize3');
    await game.page.waitForTimeout(700);
    expect((await buttonState(game, 'galacticCasinoGame4SpinButton')).enabled).toBe(true);

    // prize3 costs 15; three chips cannot cover it, and the loop drops the
    // selection back to "select" once it becomes unaffordable.
    await game.withMods((m) => m.rdo.setGalacticCasinoDataObject(3, 'casinoPoints', ['quantity']));
    await game.page.waitForTimeout(900);
    const tooPoor = await buttonState(game, 'galacticCasinoGame4SpinButton');
    expect(tooPoor.enabled).toBe(false);

    await pressButton(game, 'galacticCasinoGame4SpinButton');
    await game.page.waitForTimeout(800);
    const state = await game.withMods((m) => ({
      cp: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
      spinning: document.getElementById('galacticCasinoGame4Container').getAttribute('data-spinning')
    }));
    expect(state.cp, 'a refused spin costs nothing').toBe(3);
    expect(state.spinning).toBe('false');
  });

  test('each prize in the dropdown is offered only when it has something to tell you about', async ({ game }) => {
    await game.page.waitForTimeout(900);

    const offered = await game.withMods((m) => {
      const catalog = m.cg.getVoidSeerPrizeCatalog();
      const options = Array.from(document.querySelectorAll('#galacticCasinoGame4PrizeDropdown .dropdown-option'))
        .map((el) => ({
          value: String(el.getAttribute('data-value')),
          greyed: el.classList.contains('red-disabled-text'),
          pointerEvents: el.style.pointerEvents
        }));
      return {
        options,
        catalog,
        cp: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
        manuscripts: (m.cg.getStarsWithAncientManuscripts?.() || []).length
      };
    });

    const byValue = Object.fromEntries(offered.options.map((o) => [o.value, o]));
    expect(Object.keys(offered.catalog)).toEqual(['prize1', 'prize2', 'prize3']);
    // Costs and reel lengths climb together: a dearer prize is a longer shot.
    expect(offered.catalog.prize1.costCp).toBe(7);
    expect(offered.catalog.prize2.costCp).toBe(10);
    expect(offered.catalog.prize3.costCp).toBe(15);
    expect(offered.catalog.prize1.maxReel).toBeLessThan(offered.catalog.prize2.maxReel);
    expect(offered.catalog.prize2.maxReel).toBeLessThan(offered.catalog.prize3.maxReel);

    // The antimatter prize always has a target, so with chips in hand it is live.
    expect(byValue.prize3.greyed, 'the antimatter prize always has something to give').toBe(false);
    // The manuscript prize is live exactly when an outstanding manuscript exists.
    expect(byValue.prize2.greyed).toBe(offered.manuscripts === 0);
  });
});
