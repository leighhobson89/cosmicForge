/**
 * Area: Battle & Conquest — a real battle, fought end to end
 * Plan: tests/docs/areas/battle.md
 *
 * `battle.spec.js` covers the data and the accessors. This file fights an actual
 * battle: it opens the Colonise pane, declares war through the real confirm
 * modal, and then lets the frame loop run the engagement to its conclusion.
 *
 * The path under test is the whole chain, and none of it is simulated here:
 *
 *   updateDiplomacySituation('conquest')   the dispatcher every Colonise button calls
 *     -> setEnemyFleetPower()              derives enemy power from air/land/sea counts
 *     -> colonisePrepareWarUI('chooseWar') raises the real war-entry modal
 *     -> setWarUI(true)                    war mode on, diplomacy closed
 *     -> createBattleCanvas() / drawFleets()    builds both sides, setBattleOngoing(true)
 *     -> gameLoop: moveBattleUnits() + assignGoalToUnits()   fights it, frame by frame
 *     -> checkBattleOutcome() / initiateBattleFadeOut()      resolves and settles
 *
 * **The enemy's fleet counts are randomised per star by design**, so who wins is
 * not knowable in advance and must not be asserted. What is knowable is that the
 * battle reaches a decision, that the decision is internally consistent, and that
 * the consequences match whichever side won. Every assertion below is written to
 * hold for either outcome — a spec that expected a victory would fail roughly
 * whenever the dice went the other way, which is worse than no spec at all.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/**
 * Open a side-menu option by its element id, the way a player clicks it.
 *
 * `openPane()` matches on the visible label, which does not work here: the
 * Colonise row's text is not a bare "Colonise". The pane matters more than it
 * looks — `coloniseChecks()` in the frame loop is gated on
 * `getCurrentOptionPane() === 'colonise'`, so with any other pane open the
 * battle is built but never fought, and the units simply sit there.
 */
async function openOptionById(game, optionId) {
  await game.page.evaluate((id) => {
    const el = document.getElementById(id);
    el?.closest('.row-side-menu')?.classList.remove('invisible');
    el?.classList.remove('invisible');
    el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, optionId);
  await game.page.waitForTimeout(600);
}

/** Roll destination stars until one is sentient and armed — i.e. actually fightable. */
async function rollArmedDestination(game, starName = 'sirius') {
  for (let i = 0; i < 60; i++) {
    const starData = await game.withMods((m, name) => {
      m.cg.setDestinationStar(name);
      m.game.generateDestinationStarData();
      return m.rdo.getStarSystemDataObject('stars', ['destinationStar']);
    }, starName);

    const civ = starData?.civilizationLevel;
    const enemySum = (starData?.enemyFleets?.air || 0)
      + (starData?.enemyFleets?.land || 0)
      + (starData?.enemyFleets?.sea || 0);
    if (civ && civ !== 'None' && civ !== 'Unsentient' && enemySum > 0) return starData;
  }
  throw new Error('Could not roll a sentient, armed destination star after 60 attempts');
}

/** Click through the chain of real confirm modals the conquest path raises. */
async function clickThroughModals(game, maxClicks = 5) {
  for (let i = 0; i < maxClicks; i++) {
    const visible = await game.page.locator('#modal').isVisible().catch(() => false);
    if (!visible) return;
    await game.page.click('#modalConfirm').catch(() => {});
    await game.page.waitForTimeout(250);
  }
}

/**
 * Get to the point where the frame loop will fight: Colonise pane open on tab 5,
 * an armed destination, war declared through the real modal.
 */
async function declareWarOnArmedSystem(game) {
  await game.openTab(5);
  await openOptionById(game, 'coloniseOption');

  const pane = await game.withMods((m) => m.cg.getCurrentOptionPane());
  if (pane !== 'colonise') {
    throw new Error(`Colonise pane did not open (pane is ${JSON.stringify(pane)}); the frame loop will not fight the battle`);
  }

  const starData = await rollArmedDestination(game);

  await game.withMods((m) => {
    m.cg.setWarMode(false);
    m.cg.setBattleResolved(false, null);
    m.cg.setNeedNewBattleCanvas(true);
  });

  const before = await game.withMods((m) => ({
    playerPower: m.rdo.getResourceDataObject('fleets', ['attackPower']),
    enemyFleets: { ...m.rdo.getStarSystemDataObject('stars', ['destinationStar', 'enemyFleets']) },
    settled: [...(m.cg.getSettledStars() ?? [])],
    ap: m.cg.getAscendencyPoints()
  }));

  await game.withMods((m, data) => m.game.updateDiplomacySituation('conquest', data), starData);
  await clickThroughModals(game);
  await game.page.waitForTimeout(1500);

  // Declaring war only lines the fleets up. Nothing moves until the player
  // presses Attack: `assignGoalToUnits()` hands out goals only when
  // `getBattleTriggeredByPlayer()` is set, and that flag is set by exactly one
  // thing — the `#battleButton` click handler. Without this click both sides sit
  // at their starting coordinates indefinitely, which is precisely how this spec
  // failed before the button was found.
  const attack = game.page.locator('#battleButton');
  await attack.waitFor({ state: 'visible', timeout: 30000 });
  await attack.click();
  await game.page.waitForTimeout(500);

  const triggered = await game.withMods((m) => m.cg.getBattleTriggeredByPlayer());
  if (!triggered) throw new Error('Attack was clicked but the battle was not triggered');

  return { starData, before };
}

/** Wait for the frame loop to fight the battle to a decision. */
async function waitForBattleDecision(game, timeoutMs = 150000) {
  await game.page.waitForFunction(
    () => globalThis.__mods.cg.getBattleResolved()[0] === true,
    undefined,
    { timeout: timeoutMs }
  );
  await game.page.waitForTimeout(1500);
  return game.withMods((m) => ({
    resolved: m.cg.getBattleResolved(),
    ongoing: m.cg.getBattleOngoing(),
    units: {
      player: (m.cg.getBattleUnits()?.player ?? []).map((u) => ({ disabled: u.disabled === true })),
      enemy: (m.cg.getBattleUnits()?.enemy ?? []).map((u) => ({ disabled: u.disabled === true }))
    },
    settled: [...(m.cg.getSettledStars() ?? [])],
    ap: m.cg.getAscendencyPoints(),
    apAwardedThisRun: m.cg.getApAwardedThisRun(),
    playerPower: m.rdo.getResourceDataObject('fleets', ['attackPower'])
  }));
}

test.describe('Battle — a real engagement, fought to a decision', () => {
  // One battle is enough provided the verification is robust to the randomness,
  // and each run of this file fights a differently-composed one.
  test.setTimeout(300000);

  test('war can be declared on an armed system and the battle runs to a decision', async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();

    const { starData, before } = await declareWarOnArmedSystem(game);

    const warMode = await game.withMods((m) => m.cg.getWarMode());
    expect(warMode, 'the conquest path should have entered war mode').toBe(true);

    // Both sides must actually exist, or "the battle resolved" is vacuous.
    const started = await game.withMods((m) => {
      const units = m.cg.getBattleUnits();
      return {
        player: units?.player?.length ?? 0,
        enemy: units?.enemy?.length ?? 0,
        canvas: Boolean(document.getElementById('battleCanvas'))
      };
    });
    expect(started.canvas, 'the battle canvas should have been built').toBe(true);
    expect(started.player, 'the player should have units on the field').toBeGreaterThan(0);
    expect(started.enemy, 'the enemy should have units on the field').toBeGreaterThan(0);

    const outcome = await waitForBattleDecision(game);

    // Randomised enemy counts mean either side may win; what must hold is that
    // the result is a decision, and that it names one of exactly two winners.
    expect(outcome.resolved[0]).toBe(true);
    expect(['player', 'enemy']).toContain(outcome.resolved[1]);

    // The decision has to agree with the field: the loser's units are all
    // disabled. This is what makes the outcome real rather than a flag someone
    // set.
    const allDisabled = (units) => units.length > 0 && units.every((u) => u.disabled);
    if (outcome.resolved[1] === 'player') {
      expect(allDisabled(outcome.units.enemy), 'a player win means every enemy unit is disabled').toBe(true);
    } else {
      expect(allDisabled(outcome.units.player), 'an enemy win means every player unit is disabled').toBe(true);
    }

    // The battle must stop when it ends, or the frame loop keeps fighting a
    // finished engagement and autosave stays suppressed forever.
    expect(outcome.ongoing).toBeFalsy();

    expect(before.playerPower).toBeGreaterThan(0);
    expect(starData.civilizationLevel).toBeTruthy();
    expect(game.significantErrors()).toEqual([]);
  });

  test('the outcome has the consequences that outcome should have', async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();

    const { before } = await declareWarOnArmedSystem(game);
    const outcome = await waitForBattleDecision(game);

    if (outcome.resolved[1] === 'player') {
      // Winning runs settleSystemAfterBattle('battle'). Note what that does and
      // does not do: it awards ascendency points and flags the run, but it does
      // **not** append to `settledStars` — the only two callers of
      // `setSettledStars` are both inside `rebirth()`, so the settled list grows
      // when the run actually moves to the new system, not at the moment the
      // battle is won. Asserting a settled-list increase here fails on every
      // victory, which is how this spec first went wrong.
      expect(outcome.apAwardedThisRun, 'a victory should flag the AP award for the run').toBe(true);
      expect(outcome.ap).toBeGreaterThanOrEqual(before.ap);
      expect(outcome.settled.length,
        'the settled list is a rebirth-time concern and must not move here')
        .toBe(before.settled.length);
    } else {
      // Losing must not award the system, and a destroyed fleet is the cost.
      expect(outcome.settled.length, 'a defeat must not settle the system')
        .toBe(before.settled.length);
      expect(outcome.playerPower).toBeLessThanOrEqual(before.playerPower);
    }

    expect(game.significantErrors()).toEqual([]);
  });

  test('enemy fleet counts fall as the battle is fought and never grow', async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();

    const { before } = await declareWarOnArmedSystem(game);
    const outcome = await waitForBattleDecision(game);

    const after = await game.withMods((m) => ({
      enemyFleets: { ...m.rdo.getStarSystemDataObject('stars', ['destinationStar', 'enemyFleets']) }
    }));

    const sum = (f) => (f.air || 0) + (f.land || 0) + (f.sea || 0);
    const beforeSum = sum(before.enemyFleets);
    const afterSum = sum(after.enemyFleets);

    expect(beforeSum, 'the enemy must start with ships or there is nothing to fight').toBeGreaterThan(0);
    // Counts are decremented as units are destroyed, and zeroed outright on a
    // player victory. Either way they must never grow during a battle.
    expect(afterSum, `enemy fleet total ${beforeSum} -> ${afterSum}`).toBeLessThanOrEqual(beforeSum);

    if (outcome.resolved[1] === 'player') {
      expect(afterSum, 'a victory should leave the defenders wiped out').toBe(0);
    }
  });

  test('autosave is suppressed for the duration of a real battle, then restored', async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await game.withMods((m) => m.cg.setAutoSaveToggle(true));

    await declareWarOnArmedSystem(game);

    // Sampled while the battle is genuinely in progress, not by setting the flag.
    const during = await game.withMods((m) => ({
      ongoing: m.cg.getBattleOngoing(),
      autoSaveAllowed: m.cg.getAutoSaveToggle() && !m.cg.getBattleOngoing()
    }));
    expect(during.ongoing, 'the battle should be ongoing at this point').toBe(true);
    expect(during.autoSaveAllowed, 'autosave must be suppressed mid-battle').toBe(false);

    await waitForBattleDecision(game);

    const after = await game.withMods((m) => ({
      ongoing: m.cg.getBattleOngoing(),
      autoSaveAllowed: m.cg.getAutoSaveToggle() && !m.cg.getBattleOngoing()
    }));
    expect(after.ongoing).toBeFalsy();
    expect(after.autoSaveAllowed, 'autosave must resume once the battle ends').toBe(true);
  });
});
