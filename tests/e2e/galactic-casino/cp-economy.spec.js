/**
 * Area: Galactic Casino — CP economy
 * Plan: tests/docs/areas/galactic-casino.md
 *
 * Covers the currency the three risk games run on: how CP is unlocked, priced,
 * bought, migrated across save versions, and counted in the statistics screen.
 * Purchases go through the real dropdown, textarea and Buy button in the casino
 * pane, so the per-frame affordability pass in `galacticMarketChecks()` (which
 * computes the cost preview and enables the button) is exercised too.
 */
import { test, expect } from '../_harness/game-fixture.mjs';
import { bootCasino, casinoPoints, openCasinoPane, selectDropdownOption } from './_casino-helpers.mjs';

test.describe('Galactic Casino — CP economy', () => {
  test('the casino unlocks from the apAwardedThisRun tech and renders all four games', async ({ game }) => {
    await game.boot();

    const beforeUnlock = await game.withMods((m) => m.cg.getGalacticCasinoUnlocked());
    expect(beforeUnlock).toBe(false);

    await game.prepareRunForStarshipLaunch();
    // galacticMarketChecks() flips the flag on the first frame after the tech
    // lands, so give the loop a moment rather than reading it synchronously.
    await game.page.waitForTimeout(500);

    const state = await game.withMods((m) => ({
      unlocked: m.cg.getGalacticCasinoUnlocked(),
      hasTech: m.cg.getTechUnlockedArray().includes('apAwardedThisRun')
    }));
    expect(state.hasTech).toBe(true);
    expect(state.unlocked).toBe(true);

    expect(await openCasinoPane(game)).toBe(true);

    const present = await game.page.evaluate(() => {
      const ids = [
        'galacticCasinoPurchaseItemDropDown', 'galacticCasinoPurchaseQuantityTextArea',
        'galacticCasinoPurchaseCpPreview',
        'galacticCasinoGame1StakeTextArea', 'galacticCasinoGame1Spinner', 'galacticCasinoGame1SpinButton',
        'galacticCasinoGame2Wheel', 'galacticCasinoGame2SpinWheelButton',
        'galacticCasinoGame2PrizeDropdown', 'galacticCasinoGame2ClaimButton',
        'galacticCasinoGame3HiloContainer', 'galacticCasinoGame3CashOutButton',
        'galacticCasinoGame3HigherButton', 'galacticCasinoGame3LowerButton',
        'galacticCasinoGame4Container', 'galacticCasinoGame4SpinButton',
        'galacticCasinoGame4PrizeDropdown'
      ];
      return ids.filter((id) => !document.getElementById(id));
    });
    expect(present).toEqual([]);
  });

  test('CP is priced at cpBaseCost divided by the material value of one CP', async ({ game }) => {
    await bootCasino(game);

    const pricing = await game.withMods((m) => {
      const cpBaseCost = m.rdo.getGalacticCasinoDataObject('casinoPoints', ['cpBaseCost']);
      const values = m.rdo.getGalacticCasinoDataObject('casinoPoints', ['valueOfOneCP']);
      const rows = [];
      for (const category of ['resources', 'compounds']) {
        for (const [key, value] of Object.entries(values[category])) {
          rows.push({ category, key, value, costPerCp: cpBaseCost / value });
        }
      }
      return { cpBaseCost, rows };
    });

    expect(pricing.cpBaseCost).toBe(100000);
    // Cash is the reference material at a value of exactly 1, so one CP costs
    // cpBaseCost in cash and proportionally less of anything more valuable.
    for (const row of pricing.rows) {
      expect(row.value, `${row.key} value`).toBeGreaterThan(0);
      expect(Number.isFinite(row.costPerCp), `${row.key} cost`).toBe(true);
      expect(row.costPerCp).toBeGreaterThan(0);
    }
    const titanium = pricing.rows.find((r) => r.key === 'titanium');
    const hydrogen = pricing.rows.find((r) => r.key === 'hydrogen');
    // Titanium is the most valuable material, so it buys CP most cheaply.
    expect(titanium.costPerCp).toBeLessThan(hydrogen.costPerCp);
  });

  test('buying CP with cash charges cpBaseCost per point and credits the balance', async ({ game }) => {
    await bootCasino(game, { cp: false });
    await selectDropdownOption(game, 'galacticCasinoPurchaseItemDropDown', 'cash');

    const result = await game.page.evaluate(async () => {
      const m = globalThis.__mods;
      const textarea = document.getElementById('galacticCasinoPurchaseQuantityTextArea');
      textarea.value = '3';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      // The preview and the button's enabled state are recomputed by the game
      // loop, not by the input handler, so wait a frame or two for both.
      await new Promise((r) => setTimeout(r, 400));

      const button = document.querySelector('.galactic-casino-buy-cp-button');
      const before = {
        cash: m.rdo.getResourceDataObject('currency', ['cash']),
        cp: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
        buyEnabled: !button.disabled,
        preview: document.getElementById('galacticCasinoPurchaseCpPreview').textContent
      };

      button.click();
      await new Promise((r) => setTimeout(r, 300));

      return {
        before,
        after: {
          cash: m.rdo.getResourceDataObject('currency', ['cash']),
          cp: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
          quantityField: textarea.value
        },
        selection: m.cg.getGalacticCasinoPurchaseItem(),
        cpBaseCost: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['cpBaseCost'])
      };
    });

    expect(result.selection).toBe('cash');
    expect(result.before.buyEnabled).toBe(true);
    // The preview is rendered through the game's notation formatter, so assert
    // it is a live figure rather than the placeholder zero.
    expect(result.before.preview).not.toBe('0');
    expect(result.after.cp).toBe(result.before.cp + 3);
    expect(result.after.cash).toBe(result.before.cash - 3 * result.cpBaseCost);
    // A completed purchase clears the quantity field.
    expect(result.after.quantityField).toBe('');
  });

  test('a purchase larger than the player can afford is clamped to the affordable amount', async ({ game }) => {
    await bootCasino(game, { cp: false });
    await selectDropdownOption(game, 'galacticCasinoPurchaseItemDropDown', 'cash');

    const result = await game.page.evaluate(async () => {
      const m = globalThis.__mods;
      const textarea = document.getElementById('galacticCasinoPurchaseQuantityTextArea');
      const cash = m.rdo.getResourceDataObject('currency', ['cash']);
      const cpBaseCost = m.rdo.getGalacticCasinoDataObject('casinoPoints', ['cpBaseCost']);
      const maxAffordable = Math.floor(cash / cpBaseCost);

      textarea.value = String(maxAffordable + 5000);
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 500));

      return { maxAffordable, clampedTo: textarea.value };
    });

    expect(Number(result.clampedTo)).toBe(result.maxAffordable);
  });

  test('a purchase with nothing selected, or of a locked material, is refused', async ({ game }) => {
    await bootCasino(game, { cp: false });

    const result = await game.page.evaluate(async () => {
      const m = globalThis.__mods;
      const textarea = document.getElementById('galacticCasinoPurchaseQuantityTextArea');
      const before = m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']);

      // Nothing selected: buyCasinoPoints() returns before touching anything.
      textarea.value = '5';
      m.game.buyCasinoPoints();
      const afterNoSelection = m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']);

      // A material the player has not unlocked is rejected on the same path,
      // and the loop resets the dropdown back to "select".
      m.cg.setGalacticCasinoPurchaseItem('titanium');
      const unlocked = (m.cg.getUnlockedCompoundsArray() || []).map((v) => String(v).toLowerCase());
      m.game.buyCasinoPoints();
      const afterLocked = m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']);

      m.cg.setGalacticCasinoPurchaseItem('select');
      return { before, afterNoSelection, afterLocked, titaniumUnlocked: unlocked.includes('titanium') };
    });

    expect(result.afterNoSelection).toBe(result.before);
    if (!result.titaniumUnlocked) {
      expect(result.afterLocked).toBe(result.before);
    }
  });

  test('a restored save keeps its own casino data and is given the default cpBaseCost when it has none', async ({ game }) => {
    await bootCasino(game, { cp: false });

    const result = await game.withMods((m) => {
      // A save from a build that predates the cpBaseCost field: the restore
      // merges the template over it, so the default price survives.
      m.rdo.restoreGalacticCasinoDataObject({
        version: 0.93,
        casinoPoints: { quantity: 42 },
        casinoGamesWon: ['game1', 'game3'],
        settings: { baseProbabilityCasino: 0.6 }
      });

      return {
        cpBaseCost: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['cpBaseCost']),
        quantity: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
        gamesWon: m.rdo.getGalacticCasinoDataObject('casinoGamesWon'),
        probability: m.casino.getBaseProbabilityCasino(),
        hydrogenValue: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['valueOfOneCP', 'resources', 'hydrogen']),
        titaniumValue: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['valueOfOneCP', 'compounds', 'titanium'])
      };
    });

    expect(result.cpBaseCost).toBe(100000);
    expect(result.quantity).toBe(42);
    expect(result.gamesWon).toEqual(['game1', 'game3']);
    expect(result.probability).toBe(0.6);
    // The whole valueOfOneCP table is refilled from the template, so a save that
    // omits a material cannot leave it unpriced.
    expect(result.hydrogenValue).toBe(0.02);
    expect(result.titaniumValue).toBe(6);
  });

  test('the sub-0.93 cpBaseCost patch is unreachable because 0.93 is the minimum accepted save version', async ({ game }) => {
    await bootCasino(game, { cp: false });

    // patches.js sets cpBaseCost = 100000 for saves below 0.93, but
    // migrateResourceData() floors any version below getMinimumVersion() — which
    // is exactly 0.93 — before the patch loop runs, so the branch never fires.
    // Such saves are rejected outright by restoreGameStatus anyway. This test
    // pins the behaviour so the patch is not mistaken for a live safety net.
    const result = await game.withMods((m) => {
      m.rdo.restoreGalacticCasinoDataObject({
        version: 0.9,
        casinoPoints: { quantity: 1, cpBaseCost: 1 }
      });
      return {
        minimumVersion: m.cg.getMinimumVersion(),
        cpBaseCost: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['cpBaseCost'])
      };
    });

    expect(result.minimumVersion).toBe(0.93);
    expect(result.cpBaseCost).toBe(1);
  });

  test('CP spend and per-game plays and wins are tracked in both the run and all-time scopes', async ({ game }) => {
    await bootCasino(game);

    const result = await game.withMods((m) => {
      const read = () => ({
        spentRun: m.cg.statFunctionsGets.stat_casinoPointsSpentThisRun(),
        spentAll: m.cg.statFunctionsGets.stat_casinoPointsSpent(),
        donPlayedRun: m.cg.statFunctionsGets.stat_doubleOrNothingPlayedThisRun(),
        donPlayedAll: m.cg.statFunctionsGets.stat_doubleOrNothingPlayed(),
        wheelWonRun: m.cg.statFunctionsGets.stat_wheelOfFortuneWonThisRun(),
        wheelWonAll: m.cg.statFunctionsGets.stat_wheelOfFortuneWon(),
        specialRun: m.cg.statFunctionsGets.stat_wheelSpecialWonThisRun(),
        hiloPlayedRun: m.cg.statFunctionsGets.stat_higherLowerPlayedThisRun(),
        seerWonAll: m.cg.statFunctionsGets.stat_voidseerWon()
      });

      const before = read();
      m.cg.addGalacticCasinoStatBothScopes(25, 'casinoPointsSpent');
      m.cg.incrementGalacticCasinoStatBothScopes('game1_doubleOrNothingPlayed');
      m.cg.incrementGalacticCasinoStatBothScopes('game2_wheelWon');
      m.cg.incrementGalacticCasinoStatBothScopes('game2_wheelSpecialWon');
      m.cg.incrementGalacticCasinoStatBothScopes('game3_higherLowerPlayed');
      m.cg.incrementGalacticCasinoStatBothScopes('game4_voidSeerWon');
      return { before, after: read() };
    });

    expect(result.after.spentRun).toBe(result.before.spentRun + 25);
    expect(result.after.spentAll).toBe(result.before.spentAll + 25);
    expect(result.after.donPlayedRun).toBe(result.before.donPlayedRun + 1);
    expect(result.after.donPlayedAll).toBe(result.before.donPlayedAll + 1);
    expect(result.after.wheelWonRun).toBe(result.before.wheelWonRun + 1);
    expect(result.after.wheelWonAll).toBe(result.before.wheelWonAll + 1);
    expect(result.after.specialRun).toBe(result.before.specialRun + 1);
    expect(result.after.hiloPlayedRun).toBe(result.before.hiloPlayedRun + 1);
    expect(result.after.seerWonAll).toBe(result.before.seerWonAll + 1);
  });

  test('the CP balance and games-won list survive a save/load round trip', async ({ game }) => {
    await bootCasino(game);

    const result = await game.withMods((m) => {
      m.rdo.setGalacticCasinoDataObject(777, 'casinoPoints', ['quantity']);
      m.rdo.setGalacticCasinoDataObject(['game1', 'game2'], 'casinoGamesWon');

      const saved = JSON.parse(JSON.stringify(m.cg.captureGameStatusForSaving('initialise')));
      return {
        quantity: saved.galacticCasino?.casinoPoints?.quantity,
        gamesWon: saved.galacticCasino?.casinoGamesWon,
        cpBaseCost: saved.galacticCasino?.casinoPoints?.cpBaseCost,
        spentThisRun: saved.casinoPointsSpentThisRun
      };
    });

    expect(result.quantity).toBe(777);
    expect(result.gamesWon).toEqual(['game1', 'game2']);
    expect(result.cpBaseCost).toBe(100000);
    expect(typeof result.spentThisRun).toBe('number');
  });

  test('the debug menu CP grant is what the other casino specs rely on', async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();

    const before = await casinoPoints(game);
    await game.debugClick('add10000CpButton');
    const after = await casinoPoints(game);

    expect(after).toBe(before + 10000);
  });
});
