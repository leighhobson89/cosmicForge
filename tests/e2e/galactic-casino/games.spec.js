/**
 * Area: Galactic Casino — the four risk games
 * Plan: tests/docs/areas/galactic-casino.md
 *
 * Every outcome here is made deterministic through the game's own debug levers
 * rather than by stubbing Math.random:
 *
 *   wheelForceSpecial             (variable debugger, Numpad *) — wheel lands on
 *                                 segment 0, the special-prize segment
 *   casinoGame4AlwaysWin          (variable debugger) — Higher or Lower never
 *                                 loses, despite the "game4" name in the flag
 *   casinoGame5VoidSeerAlwaysMatch(variable debugger) — the Void Seer reels match
 *   globalThis.__wheelForceIndex  — the wheel's own forced-segment test hook,
 *                                 used for the lose and regular-prize segments
 *   setBaseProbabilityCasino()    — the shipped tunable behind Double or Nothing
 *
 * Spin animations are driven by requestAnimationFrame and resolve a promise when
 * they finish, so each spin is awaited in page context rather than polled.
 */
import { test, expect } from '../_harness/game-fixture.mjs';
import { bootCasino, casinoPoints, notificationShown, selectDropdownOption } from './_casino-helpers.mjs';

test.describe('Galactic Casino — Game 1: Double or Nothing', () => {
  test.beforeEach(async ({ game }) => {
    await bootCasino(game);
  });

  test('a winning spin returns double the stake and records the game as won', async ({ game }) => {
    const result = await game.page.evaluate(async () => {
      const m = globalThis.__mods;
      m.rdo.setGalacticCasinoDataObject([], 'casinoGamesWon');
      m.casino.setBaseProbabilityCasino(1);

      const before = m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']);
      m.casino.playDoubleOrNothing({ stake: 25, spinnerId: 'galacticCasinoGame1Spinner' });
      await new Promise((r) => setTimeout(r, 6500));

      return {
        before,
        after: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
        gamesWon: m.rdo.getGalacticCasinoDataObject('casinoGamesWon'),
        wonStat: m.cg.statFunctionsGets.stat_doubleOrNothingWonThisRun(),
        playedStat: m.cg.statFunctionsGets.stat_doubleOrNothingPlayedThisRun()
      };
    });

    // The stake is taken up front and 2x is paid back, so a win nets +stake.
    expect(result.after).toBe(result.before + 25);
    expect(result.gamesWon).toContain('game1');
    expect(result.wonStat).toBeGreaterThanOrEqual(1);
    expect(result.playedStat).toBeGreaterThanOrEqual(1);
  });

  test('a losing spin keeps the stake and does not mark the game as won', async ({ game }) => {
    const result = await game.page.evaluate(async () => {
      const m = globalThis.__mods;
      m.rdo.setGalacticCasinoDataObject([], 'casinoGamesWon');
      m.casino.setBaseProbabilityCasino(0);

      const before = m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']);
      const wonBefore = m.cg.statFunctionsGets.stat_doubleOrNothingWonThisRun();
      m.casino.playDoubleOrNothing({ stake: 25, spinnerId: 'galacticCasinoGame1Spinner' });
      await new Promise((r) => setTimeout(r, 6500));

      return {
        before,
        wonBefore,
        after: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
        gamesWon: m.rdo.getGalacticCasinoDataObject('casinoGamesWon'),
        wonAfter: m.cg.statFunctionsGets.stat_doubleOrNothingWonThisRun()
      };
    });

    expect(result.after).toBe(result.before - 25);
    expect(result.gamesWon).not.toContain('game1');
    expect(result.wonAfter).toBe(result.wonBefore);
  });

  test('the base win probability is clamped into 0..1', async ({ game }) => {
    const result = await game.withMods((m) => {
      const original = m.casino.getBaseProbabilityCasino();
      m.casino.setBaseProbabilityCasino(5);
      const high = m.casino.getBaseProbabilityCasino();
      m.casino.setBaseProbabilityCasino(-3);
      const low = m.casino.getBaseProbabilityCasino();
      m.casino.setBaseProbabilityCasino('not a number');
      const invalid = m.casino.getBaseProbabilityCasino();
      m.casino.setBaseProbabilityCasino(original);
      return { original, high, low, invalid };
    });

    expect(result.original).toBe(0.4);
    expect(result.high).toBe(1);
    expect(result.low).toBe(0);
    // A non-numeric setting falls back to the shipped default rather than NaN.
    expect(result.invalid).toBe(0.4);
  });

  test('a zero stake is refused with the localized "enter a valid stake" message', async ({ game }) => {
    const before = await casinoPoints(game);

    await game.page.evaluate(() => {
      globalThis.__mods.casino.playDoubleOrNothing({ stake: 0, spinnerId: 'galacticCasinoGame1Spinner' });
    });
    await game.page.waitForTimeout(300);

    const notification = await notificationShown(game, 'casinoNotificationEnterValidStake');
    expect(notification.shown, `expected "${notification.expected}" among ${JSON.stringify(notification.all)}`).toBe(true);
    expect(await casinoPoints(game)).toBe(before);
  });

  test('a stake above the CP balance is refused with the localized "not enough CP" message', async ({ game }) => {
    const before = await casinoPoints(game);

    await game.page.evaluate((stake) => {
      globalThis.__mods.casino.playDoubleOrNothing({ stake, spinnerId: 'galacticCasinoGame1Spinner' });
    }, before + 1);
    await game.page.waitForTimeout(300);

    const notification = await notificationShown(game, 'casinoNotificationNotEnoughCpStake');
    expect(notification.shown, `expected "${notification.expected}" among ${JSON.stringify(notification.all)}`).toBe(true);
    expect(await casinoPoints(game)).toBe(before);
  });

  test('the stake field rejects non-digits, strips leading zeros and clamps to the CP balance', async ({ game }) => {
    const result = await game.page.evaluate(async () => {
      const m = globalThis.__mods;
      m.rdo.setGalacticCasinoDataObject(200, 'casinoPoints', ['quantity']);
      const field = document.getElementById('galacticCasinoGame1StakeTextArea');

      const type = async (value) => {
        field.value = value;
        field.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise((r) => setTimeout(r, 100));
        return field.value;
      };

      return {
        letters: await type('12abc3'),
        leadingZeros: await type('0007'),
        overBalance: await type('9999'),
        spinEnabledWithStake: !document.getElementById('galacticCasinoGame1SpinButton').disabled,
        empty: await type(''),
        spinEnabledWhenEmpty: !document.getElementById('galacticCasinoGame1SpinButton').disabled
      };
    });

    expect(result.letters).toBe('123');
    expect(result.leadingZeros).toBe('7');
    // The field clamps to the balance rather than letting an unaffordable stake
    // reach playDoubleOrNothing at all.
    expect(result.overBalance).toBe('200');
    expect(result.spinEnabledWithStake).toBe(true);
    expect(result.empty).toBe('');
    expect(result.spinEnabledWhenEmpty).toBe(false);
  });
});

test.describe('Galactic Casino — Game 2: Wheel of Fortune', () => {
  test.beforeEach(async ({ game }) => {
    await bootCasino(game);
  });

  test('wheelForceSpecial lands segment 0 and arms the special prize claim', async ({ game }) => {
    await game.setDebugVariable('wheelForceSpecial', 'true');
    await game.closeVariableDebugger();
    expect(await game.withMods((m) => m.cg.getWheelForceSpecial())).toBe(true);

    const result = await game.page.evaluate(async () => {
      const m = globalThis.__mods;
      const before = m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']);
      const spin = await m.casino.playWheelOfFortune({ wheelId: 'galacticCasinoGame2Wheel', costCp: 1, durationMs: 200 });
      const wheel = document.getElementById('galacticCasinoGame2Wheel');
      return {
        before,
        after: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
        selectedIndex: spin?.selectedIndex,
        specialReady: wheel.getAttribute('data-special-ready'),
        spinning: wheel.getAttribute('data-spinning'),
        selection: wheel.getAttribute('data-prize-selection'),
        specialWon: m.cg.statFunctionsGets.stat_wheelOfFortuneWonThisRun()
      };
    });

    expect(result.selectedIndex).toBe(0);
    expect(result.specialReady).toBe('true');
    expect(result.spinning).toBe('false');
    // The spin cost is taken up front; the special segment pays nothing until
    // a prize is chosen and claimed.
    expect(result.after).toBe(result.before - 1);
    expect(result.selection).toBe('select');
    expect(result.specialWon).toBeGreaterThanOrEqual(1);
  });

  test('an odd segment loses and pays nothing', async ({ game }) => {
    const result = await game.page.evaluate(async () => {
      const m = globalThis.__mods;
      globalThis.__wheelForceIndex = 3;
      const before = m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']);
      const spin = await m.casino.playWheelOfFortune({ wheelId: 'galacticCasinoGame2Wheel', costCp: 1, durationMs: 200 });
      delete globalThis.__wheelForceIndex;
      const wheel = document.getElementById('galacticCasinoGame2Wheel');
      return {
        before,
        after: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
        selectedIndex: spin?.selectedIndex,
        specialReady: wheel.getAttribute('data-special-ready')
      };
    });

    expect(result.selectedIndex).toBe(3);
    expect(result.specialReady).toBe('false');
    expect(result.after).toBe(result.before - 1);
  });

  test('an even non-zero segment always awards something, across several prize families', async ({ game }) => {
    const SPINS = 16;

    const result = await game.page.evaluate(async (spins) => {
      const m = globalThis.__mods;
      m.rdo.setGalacticCasinoDataObject([], 'casinoGamesWon');

      const stockTotal = (category) => Object.entries(m.rdo.getResourceDataObject(category) || {})
        .filter(([key]) => key !== 'version')
        .reduce((sum, [, entry]) => sum + (Number(entry?.quantity) || 0), 0);

      const snapshot = () => ({
        cp: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
        cash: m.rdo.getResourceDataObject('currency', ['cash']),
        research: m.rdo.getResourceDataObject('research', ['quantity']),
        resources: stockTotal('resources'),
        compounds: stockTotal('compounds')
      });

      const families = new Set();
      let barrenSpins = 0;

      // awardRegularPrize picks uniformly from six prize families, so spin the
      // same even segment repeatedly to see a spread of them. Each family is
      // identified by which balance actually moved rather than by its
      // notification text, which several families share.
      for (let i = 0; i < spins; i++) {
        globalThis.__wheelForceIndex = 4;
        const before = snapshot();
        await m.casino.playWheelOfFortune({ wheelId: 'galacticCasinoGame2Wheel', costCp: 1, durationMs: 60 });
        const after = snapshot();

        const moved = [];
        // The 1 CP spin cost is taken up front, so a CP prize is a net gain
        // measured against the already-debited balance.
        if (after.cp > before.cp - 1) moved.push('cp');
        for (const key of ['cash', 'research', 'resources', 'compounds']) {
          if (after[key] > before[key]) moved.push(key);
        }
        if (moved.length === 0) barrenSpins++;
        moved.forEach((f) => families.add(f));
      }
      delete globalThis.__wheelForceIndex;

      return {
        gamesWon: m.rdo.getGalacticCasinoDataObject('casinoGamesWon'),
        families: [...families],
        barrenSpins,
        wonStat: m.cg.statFunctionsGets.stat_wheelOfFortuneWonThisRun()
      };
    }, SPINS);

    expect(result.gamesWon).toContain('game2');
    expect(result.wonStat).toBeGreaterThanOrEqual(SPINS);
    // Every winning segment must pay: the time family falls back to CP when no
    // timer is running, so there is no branch that can award nothing at all.
    expect(result.barrenSpins).toBe(0);
    // With six families over sixteen spins, more than one must have come up.
    expect(result.families.length).toBeGreaterThan(1);
    for (const family of result.families) {
      expect(['cp', 'cash', 'research', 'resources', 'compounds']).toContain(family);
    }
  });

  test('spinning is refused while an unclaimed special prize is waiting', async ({ game }) => {
    await game.setDebugVariable('wheelForceSpecial', 'true');
    await game.closeVariableDebugger();

    const result = await game.page.evaluate(async () => {
      const m = globalThis.__mods;
      await m.casino.playWheelOfFortune({ wheelId: 'galacticCasinoGame2Wheel', costCp: 1, durationMs: 200 });
      const before = m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']);
      const second = await m.casino.playWheelOfFortune({ wheelId: 'galacticCasinoGame2Wheel', costCp: 1, durationMs: 200 });
      return {
        before,
        after: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
        second
      };
    });

    expect(result.second).toBeNull();
    // A refused spin must not charge for itself.
    expect(result.after).toBe(result.before);

    const notification = await notificationShown(game, 'casinoNotificationClaimPrizeBeforeSpin');
    expect(notification.shown, `expected "${notification.expected}" among ${JSON.stringify(notification.all)}`).toBe(true);
  });

  test('spinning without enough CP is refused with the localized message', async ({ game }) => {
    await game.withMods((m) => m.rdo.setGalacticCasinoDataObject(0, 'casinoPoints', ['quantity']));

    const result = await game.page.evaluate(async () =>
      globalThis.__mods.casino.playWheelOfFortune({ wheelId: 'galacticCasinoGame2Wheel', costCp: 5, durationMs: 200 }));

    expect(result).toBeNull();
    const notification = await notificationShown(game, 'casinoNotificationNotEnoughCpSpin');
    expect(notification.shown, `expected "${notification.expected}" among ${JSON.stringify(notification.all)}`).toBe(true);
  });

  test('claiming without an armed wheel, or with no prize chosen, awards nothing', async ({ game }) => {
    const result = await game.page.evaluate(() => {
      const m = globalThis.__mods;
      const wheel = document.getElementById('galacticCasinoGame2Wheel');

      wheel.setAttribute('data-special-ready', 'false');
      wheel.setAttribute('data-prize-selection', 'special_100cp');
      const notArmed = m.casino.claimWheelSpecialPrize({ wheelId: 'galacticCasinoGame2Wheel' });

      wheel.setAttribute('data-special-ready', 'true');
      wheel.setAttribute('data-prize-selection', 'select');
      const noSelection = m.casino.claimWheelSpecialPrize({ wheelId: 'galacticCasinoGame2Wheel' });

      wheel.setAttribute('data-special-ready', 'true');
      wheel.setAttribute('data-spinning', 'true');
      wheel.setAttribute('data-prize-selection', 'special_100cp');
      const whileSpinning = m.casino.claimWheelSpecialPrize({ wheelId: 'galacticCasinoGame2Wheel' });
      wheel.setAttribute('data-spinning', 'false');

      const unknownWheel = m.casino.claimWheelSpecialPrize({ wheelId: 'noSuchWheel' });

      return { notArmed, noSelection, whileSpinning, unknownWheel };
    });

    expect(result.notArmed).toBeNull();
    expect(result.noSelection).toBeNull();
    expect(result.whileSpinning).toBeNull();
    expect(result.unknownWheel).toBeNull();
  });

  test('claiming an armed special prize through the real dropdown and Claim button pays out', async ({ game }) => {
    await game.setDebugVariable('wheelForceSpecial', 'true');
    await game.closeVariableDebugger();

    await game.page.evaluate(async () => {
      await globalThis.__mods.casino.playWheelOfFortune({ wheelId: 'galacticCasinoGame2Wheel', costCp: 1, durationMs: 200 });
    });

    await selectDropdownOption(game, 'galacticCasinoGame2PrizeDropdown', 'special_100cp');
    const before = await casinoPoints(game);

    await game.page.evaluate(() => {
      document.getElementById('galacticCasinoGame2ClaimButton').click();
    });
    await game.page.waitForTimeout(400);

    const after = await game.withMods((m) => ({
      cp: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
      specialWon: m.cg.statFunctionsGets.stat_wheelSpecialWonThisRun(),
      ready: document.getElementById('galacticCasinoGame2Wheel').getAttribute('data-special-ready')
    }));

    expect(after.cp).toBe(before + 100);
    expect(after.specialWon).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Galactic Casino — Game 3: Higher or Lower', () => {
  test.beforeEach(async ({ game }) => {
    await bootCasino(game);
    // casinoGame4AlwaysWin is the Higher-or-Lower never-lose switch; the name
    // is one ahead of the game number used everywhere else in the code.
    await game.setDebugVariable('casinoGame4AlwaysWin', 'true');
    await game.closeVariableDebugger();
  });

  test('starting a run costs 5 CP, deals a nine card deck and reveals the first card', async ({ game }) => {
    const before = await casinoPoints(game);

    const result = await game.page.evaluate(async () => {
      const container = document.getElementById('galacticCasinoGame3HiloContainer');
      const idle = container.getAttribute('data-hilo-state');
      document.getElementById('galacticCasinoGame3CashOutButton').click();
      await new Promise((r) => setTimeout(r, 300));

      const cards = Array.from(document.querySelectorAll('#galacticCasinoGame3CardRow .galactic-casino-hilo-card'));
      return {
        idle,
        state: container.getAttribute('data-hilo-state'),
        deckLength: JSON.parse(container.getAttribute('data-hilo-deck') || '[]').length,
        index: container.getAttribute('data-hilo-index'),
        cardCount: cards.length,
        faceUp: cards.filter((c) => !c.classList.contains('galactic-casino-hilo-card-back')).length,
        higherEnabled: !document.getElementById('galacticCasinoGame3HigherButton').disabled,
        cashOutEnabled: !document.getElementById('galacticCasinoGame3CashOutButton').disabled
      };
    });

    expect(result.idle).toBe('idle');
    expect(result.state).toBe('active');
    expect(result.deckLength).toBe(9);
    expect(result.cardCount).toBe(9);
    expect(result.index).toBe('0');
    expect(result.faceUp).toBe(1);
    expect(result.higherEnabled).toBe(true);
    // Cashing out is locked until three cards are showing.
    expect(result.cashOutEnabled).toBe(false);
    expect(await casinoPoints(game)).toBe(before - 5);
  });

  test('a run with fewer than 5 CP is refused with the localized message', async ({ game }) => {
    await game.withMods((m) => m.rdo.setGalacticCasinoDataObject(4, 'casinoPoints', ['quantity']));

    const state = await game.page.evaluate(async () => {
      document.getElementById('galacticCasinoGame3CashOutButton').click();
      await new Promise((r) => setTimeout(r, 250));
      return document.getElementById('galacticCasinoGame3HiloContainer').getAttribute('data-hilo-state');
    });

    expect(state).toBe('idle');
    expect(await casinoPoints(game)).toBe(4);

    const notification = await notificationShown(game, 'notificationCasinoNotEnoughCp');
    expect(notification.shown, `expected "${notification.expected}" among ${JSON.stringify(notification.all)}`).toBe(true);
  });

  test('each correct guess reveals another card and raises the prize tier', async ({ game }) => {
    const steps = await game.page.evaluate(async () => {
      const container = document.getElementById('galacticCasinoGame3HiloContainer');
      document.getElementById('galacticCasinoGame3CashOutButton').click();
      await new Promise((r) => setTimeout(r, 250));

      const out = [];
      for (let i = 0; i < 5; i++) {
        document.getElementById('galacticCasinoGame3HigherButton').click();
        await new Promise((r) => setTimeout(r, 180));
        out.push({
          index: Number(container.getAttribute('data-hilo-index')),
          tier: Number(container.getAttribute('data-hilo-tier')),
          prizeKey: container.getAttribute('data-hilo-tier-prize-key'),
          preview: document.getElementById('galacticCasinoGame3PrizePreview').textContent,
          cashOutEnabled: !document.getElementById('galacticCasinoGame3CashOutButton').disabled
        });
      }
      return out;
    });

    // Tier is min(7, revealedCount - 2), and revealedCount is index + 1.
    expect(steps.map((s) => s.index)).toEqual([1, 2, 3, 4, 5]);
    expect(steps.map((s) => s.tier)).toEqual([0, 1, 2, 3, 4]);
    // Below three revealed cards there is no prize and no cash-out.
    expect(steps[0].preview).toBe('---');
    expect(steps[0].cashOutEnabled).toBe(false);
    for (const step of steps.slice(1)) {
      expect(step.cashOutEnabled).toBe(true);
      expect(step.prizeKey).not.toBe('');
      expect(step.preview).not.toBe('---');
    }
  });

  test('clearing all nine cards awards the tier 7 prize and resets the table', async ({ game }) => {
    const result = await game.page.evaluate(async () => {
      const m = globalThis.__mods;
      m.rdo.setGalacticCasinoDataObject([], 'casinoGamesWon');
      const container = document.getElementById('galacticCasinoGame3HiloContainer');
      document.getElementById('galacticCasinoGame3CashOutButton').click();
      await new Promise((r) => setTimeout(r, 250));

      let finalTier = 0;
      for (let i = 0; i < 8; i++) {
        document.getElementById('galacticCasinoGame3HigherButton').click();
        await new Promise((r) => setTimeout(r, 160));
        finalTier = Number(container.getAttribute('data-hilo-tier'));
      }
      const endingState = container.getAttribute('data-hilo-state');
      const wonStat = m.cg.statFunctionsGets.stat_higherLowerWonThisRun();
      const gamesWon = m.rdo.getGalacticCasinoDataObject('casinoGamesWon');

      // The table returns to idle on a 2s timer after the last card.
      await new Promise((r) => setTimeout(r, 2600));
      return {
        finalTier,
        endingState,
        wonStat,
        gamesWon,
        resetState: container.getAttribute('data-hilo-state'),
        resetPreview: document.getElementById('galacticCasinoGame3PrizePreview').textContent
      };
    });

    expect(result.finalTier).toBe(7);
    expect(result.endingState).toBe('ending');
    expect(result.wonStat).toBeGreaterThanOrEqual(1);
    expect(result.gamesWon).toContain('game3');
    expect(result.resetState).toBe('idle');
    expect(result.resetPreview).toBe('---');
  });

  test('a wrong guess ends the run and returns the table to idle', async ({ game }) => {
    // Turn the never-lose switch back off so a real wrong guess is possible,
    // then force one by guessing against the deck the game just dealt.
    await game.setDebugVariable('casinoGame4AlwaysWin', 'false');
    await game.closeVariableDebugger();

    const result = await game.page.evaluate(async () => {
      const container = document.getElementById('galacticCasinoGame3HiloContainer');
      document.getElementById('galacticCasinoGame3CashOutButton').click();
      await new Promise((r) => setTimeout(r, 250));

      const deck = JSON.parse(container.getAttribute('data-hilo-deck') || '[]');
      // Deal guarantees consecutive cards never share a value, so exactly one
      // of the two guesses is wrong for the second card.
      const wrongGuess = deck[1].value > deck[0].value ? 'lower' : 'higher';
      const buttonId = wrongGuess === 'lower'
        ? 'galacticCasinoGame3LowerButton'
        : 'galacticCasinoGame3HigherButton';

      document.getElementById(buttonId).click();
      await new Promise((r) => setTimeout(r, 250));
      const endingState = container.getAttribute('data-hilo-state');

      await new Promise((r) => setTimeout(r, 2600));
      return {
        wrongGuess,
        endingState,
        resetState: container.getAttribute('data-hilo-state'),
        resetIndex: container.getAttribute('data-hilo-index'),
        resetDeck: container.getAttribute('data-hilo-deck'),
        faceUp: Array.from(document.querySelectorAll('#galacticCasinoGame3CardRow .galactic-casino-hilo-card'))
          .filter((c) => !c.classList.contains('galactic-casino-hilo-card-back')).length
      };
    });

    expect(result.endingState).toBe('ending');
    expect(result.resetState).toBe('idle');
    expect(result.resetIndex).toBe('0');
    expect(result.resetDeck).toBe('');
    expect(result.faceUp).toBe(0);
  });

  test('cashing out after three cards pays the current tier prize', async ({ game }) => {
    const result = await game.page.evaluate(async () => {
      const m = globalThis.__mods;
      // Force a tier the payout of which is unambiguous: the CP prizes are the
      // only ones with a fixed, assertable amount.
      const container = document.getElementById('galacticCasinoGame3HiloContainer');
      document.getElementById('galacticCasinoGame3CashOutButton').click();
      await new Promise((r) => setTimeout(r, 250));

      for (let i = 0; i < 2; i++) {
        document.getElementById('galacticCasinoGame3HigherButton').click();
        await new Promise((r) => setTimeout(r, 180));
      }

      container.setAttribute('data-hilo-tier-prize-key', 'hilo_cp_20');
      container.setAttribute('data-hilo-tier-prize', 'Win 20CP');

      const before = m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']);
      document.getElementById('galacticCasinoGame3CashOutButton').click();
      await new Promise((r) => setTimeout(r, 400));

      return {
        before,
        after: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
        state: container.getAttribute('data-hilo-state'),
        wonStat: m.cg.statFunctionsGets.stat_higherLowerWonThisRun()
      };
    });

    expect(result.after).toBe(result.before + 20);
    // Cashing out resets immediately rather than after the losing-hand delay.
    expect(result.state).toBe('idle');
    expect(result.wonStat).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Galactic Casino — Game 4: Visiting Void Seer', () => {
  test.beforeEach(async ({ game }) => {
    await bootCasino(game);
  });

  test('each prize in the catalogue has a CP cost and a reel size', async ({ game }) => {
    const catalog = await game.withMods((m) => m.cg.getVoidSeerPrizeCatalog());

    expect(Object.keys(catalog)).toEqual(['prize1', 'prize2', 'prize3']);
    let previousCost = 0;
    let previousReel = 0;
    for (const key of ['prize1', 'prize2', 'prize3']) {
      expect(catalog[key].costCp).toBeGreaterThan(previousCost);
      // A longer reel is a longer shot, so the dearer prizes are also the rarer.
      expect(catalog[key].maxReel).toBeGreaterThan(previousReel);
      expect(typeof catalog[key].labelKey).toBe('string');
      previousCost = catalog[key].costCp;
      previousReel = catalog[key].maxReel;
    }
  });

  test('a forced match charges the prize cost and records the win', async ({ game }) => {
    await game.setDebugVariable('casinoGame5VoidSeerAlwaysMatch', 'true');
    await game.closeVariableDebugger();
    await selectDropdownOption(game, 'galacticCasinoGame4PrizeDropdown', 'prize1');

    const result = await game.page.evaluate(async () => {
      const m = globalThis.__mods;
      m.rdo.setGalacticCasinoDataObject([], 'casinoGamesWon');
      const container = document.getElementById('galacticCasinoGame4Container');
      const before = m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']);
      const spentBefore = m.cg.statFunctionsGets.stat_casinoPointsSpentThisRun();

      document.getElementById('galacticCasinoGame4SpinButton').click();
      await new Promise((r) => setTimeout(r, 9000));

      return {
        before,
        spentBefore,
        after: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
        spentAfter: m.cg.statFunctionsGets.stat_casinoPointsSpentThisRun(),
        spinning: container.getAttribute('data-spinning'),
        gamesWon: m.rdo.getGalacticCasinoDataObject('casinoGamesWon'),
        wonStat: m.cg.statFunctionsGets.stat_voidseerWonThisRun(),
        playedStat: m.cg.statFunctionsGets.stat_voidseerPlayedThisRun()
      };
    });

    // prize1 costs 7 CP and pays in information, not currency.
    expect(result.after).toBe(result.before - 7);
    expect(result.spentAfter).toBe(result.spentBefore + 7);
    expect(result.spinning).toBe('false');
    expect(result.gamesWon).toContain('game4');
    expect(result.wonStat).toBe(1);
    expect(result.playedStat).toBe(1);
  });

  test('the antimatter prize adds between 10% and 30% of the current stock on a match', async ({ game }) => {
    await game.setDebugVariable('casinoGame5VoidSeerAlwaysMatch', 'true');
    await game.closeVariableDebugger();
    await selectDropdownOption(game, 'galacticCasinoGame4PrizeDropdown', 'prize3');

    const result = await game.page.evaluate(async () => {
      const m = globalThis.__mods;
      m.rdo.setResourceDataObject(10000, 'antimatter', ['quantity']);
      const before = m.rdo.getResourceDataObject('antimatter', ['quantity']);

      document.getElementById('galacticCasinoGame4SpinButton').click();
      await new Promise((r) => setTimeout(r, 9000));

      return { before, after: m.rdo.getResourceDataObject('antimatter', ['quantity']) };
    });

    const gain = result.after - result.before;
    expect(gain).toBeGreaterThanOrEqual(Math.floor(result.before * 0.10));
    expect(gain).toBeLessThanOrEqual(Math.ceil(result.before * 0.30));
  });

  test('spinning with no prize selected, or without the CP for it, does nothing', async ({ game }) => {
    const result = await game.page.evaluate(async () => {
      const m = globalThis.__mods;
      const container = document.getElementById('galacticCasinoGame4Container');
      const button = document.getElementById('galacticCasinoGame4SpinButton');

      container.setAttribute('data-prize-selection', 'select');
      const before = m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']);
      button.click();
      await new Promise((r) => setTimeout(r, 500));
      const afterNoSelection = m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']);

      m.rdo.setGalacticCasinoDataObject(3, 'casinoPoints', ['quantity']);
      container.setAttribute('data-prize-selection', 'prize3');
      button.click();
      await new Promise((r) => setTimeout(r, 500));

      return {
        before,
        afterNoSelection,
        afterTooPoor: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']),
        spinning: container.getAttribute('data-spinning')
      };
    });

    expect(result.afterNoSelection).toBe(result.before);
    // prize3 costs 15 CP; a 3 CP balance must not be touched.
    expect(result.afterTooPoor).toBe(3);
    expect(result.spinning).toBe('false');
  });
});
