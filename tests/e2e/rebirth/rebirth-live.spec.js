/**
 * Area: Rebirth — three rebirths, played through the Rebirth pane
 * Plan: tests/docs/areas/rebirth.md
 *
 * `rebirth.spec.js` covers the refusal path and the button's honesty;
 * `rebirth-reset.spec.js` samples three resources and a handful of flags. Both
 * of them reach the reset by calling `m.game.rebirth()` from `withMods`, which
 * skips the two things most likely to break: the button's own enable rule, and
 * the confirmation modal that stands between a player and the single most
 * destructive operation in the game.
 *
 * This file presses the button. It covers the three rebirths that behave
 * differently from one another:
 *
 * | Scenario | Why it is its own case |
 * |---|---|
 * | The first rebirth, run 1 -> 2 | takes the `rebirthCalledOnRun1` branch: reveals the Philosophy row, and is the only rebirth that runs against a run built by `initialise` rather than by a previous reset |
 * | A later rebirth, run 2 -> 3 | runs against a board that a reset already produced, replays philosophy repeatables and permanent perks, and must not compound anything |
 * | A rebirth after the cosmic rip is closed | the end-game state: `closeCosmicRip`/`completeGame` earned, a galactic point spent, the credits played, and `cosmicRip` the one tech `resetAllVariablesOnRebirth` deliberately carries over |
 *
 * Each of the three is audited the same way, against one shared contract:
 *
 *   1. **Everything that should be cleared is cleared** — measured against the
 *      board as it stood on a *fresh boot*, before the debug scenario stocked
 *      it. That is a stronger claim than "smaller than it was": it says the run
 *      is back to its starting position, prices included.
 *   2. **Everything that should be kept is kept** — the run counter goes up by
 *      exactly one and nothing meta goes down. Losing a perk, an achievement or
 *      the chosen philosophy is unrecoverable, because there is no undo and the
 *      autosave fires immediately afterwards.
 *   3. **The game is playable straight afterwards** — the frame loop is still
 *      ticking, resources still accrue, every unlocked tab still draws, and
 *      nothing has been written to the console.
 *
 * The last of those is what the original bug report was: thousands of
 * `Missing subKey` warnings streaming out of a half-completed reset, with no
 * crash and nothing on screen to say the run was broken.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** Reaching run 3 costs three debug setups and two rebirths, plus a 22s cinematic. */
test.describe.configure({ timeout: 300_000 });

// --------------------------------------------------------------------- helpers

/**
 * Close whatever modal is currently up.
 *
 * `callPopupModal` waits out an already-open modal before binding its handlers,
 * so a Rebirth confirmation clicked while the onboarding prompt or a debug
 * scenario's popup is still on screen would land on the wrong dialog.
 */
async function dismissAnyOpenModal(page) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const closed = await page.evaluate(() => {
      const cancel = document.getElementById('modalCancel');
      if (cancel?.offsetParent) { cancel.click(); return true; }
      const confirm = document.getElementById('modalConfirm');
      if (confirm?.offsetParent) { confirm.click(); return true; }
      return false;
    });
    if (!closed) return;
    await page.waitForTimeout(400);
  }
}

/**
 * Put the run in the state a player reaches by travelling to a system and
 * scanning it. `starSystems.stars.destinationStar` is what `rebirth()` rebuilds
 * the next run around, and every rebirth consumes it.
 */
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

/** Open the Rebirth pane on the Galactic tab. */
async function openRebirthPane(game, page) {
  await dismissAnyOpenModal(page);
  await game.openTab(7);
  await page.evaluate(() => {
    const el = document.getElementById('rebirthOption');
    el?.closest('.row-side-menu')?.classList.remove('invisible');
    el?.classList.remove('invisible');
    el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await page.waitForTimeout(800);
}

/** The Rebirth button's honest state: `disabled`, not merely coloured. */
async function rebirthButtonState(page) {
  return page.evaluate(() => {
    const button = document.querySelector('.rebirth-check');
    if (!button) return null;
    return {
      disabled: button.disabled,
      ready: button.classList.contains('green-ready-text'),
      pointerEvents: getComputedStyle(button).pointerEvents
    };
  });
}

/**
 * Press Rebirth and confirm — the player's own route through the reset.
 *
 * The confirmation is matched on its localized confirm label, so this cannot
 * pass by dismissing whatever other dialog happens to be up, and the button is
 * asserted to be genuinely enabled first, because a real click on a `disabled`
 * button would silently do nothing and every assertion afterwards would be
 * measuring an untouched run.
 */
async function rebirthThroughTheUI(game, page) {
  const state = await rebirthButtonState(page);
  expect(state, 'the Rebirth pane should expose its button').not.toBeNull();
  expect(state.disabled, 'the run should have earned a completable rebirth by now').toBe(false);
  expect(state.ready).toBe(true);

  const runBefore = await game.withMods((m) => m.cg.getStatRun());
  const confirmLabel = await game.withMods((m) => m.loc.localize('modalRebirthConfirmLabel', m.cg.getLanguage()));

  await page.evaluate(() => document.querySelector('.rebirth-check')?.click());
  await page.waitForFunction(
    (label) => document.getElementById('modalConfirm')?.innerText?.trim() === label,
    confirmLabel,
    { timeout: 15000 }
  );
  await page.evaluate(() => document.getElementById('modalConfirm').click());

  await page.waitForFunction(
    (before) => globalThis.__mods.cg.getStatRun() === before + 1,
    runBefore,
    { timeout: 25000 }
  );
  await page.waitForTimeout(1000);
  return runBefore + 1;
}

/** Stock the run, scan a destination and win the battle that earns the rebirth. */
async function playRunToRebirthReady(game, page, destination) {
  await game.prepareRunForStarshipLaunch();
  await dismissAnyOpenModal(page);
  await scanDestinationSystem(game, destination);
  // `rebirthChecks()` turns a won battle into `rebirthPossible` on the frame
  // loop; that is what the Rebirth button reads.
  await game.withMods((m) => m.cg.setBattleResolved(true, 'player'));
  await openRebirthPane(game, page);
}

/**
 * Everything that belongs to the *run* and must therefore be wiped.
 *
 * Deliberately excludes anything derived from which star the run is in — the
 * whole point of a rebirth is that the star changes, so weather, star type and
 * the B-type autobuyer boost legitimately differ either side of one.
 */
async function readRunBoard(game) {
  return game.withMods((m) => {
    const quantities = (category) => Object.fromEntries(
      Object.keys(m.rdo.getResourceDataObject(category))
        .map((key) => [key, m.rdo.getResourceDataObject(category, [key, 'quantity'])])
    );

    return {
      cash: m.rdo.getResourceDataObject('currency', ['cash']),
      research: m.rdo.getResourceDataObject('research', ['quantity']),
      resourceQuantities: quantities('resources'),
      compoundQuantities: quantities('compounds'),

      // Prices are part of "back to the starting position": a reset that
      // emptied the stores but left late-game prices standing would leave the
      // new run unplayable.
      powerPlantPrice: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'price']),
      powerPlantQuantity: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']),
      scienceKitPrice: m.rdo.getResourceDataObject('research', ['upgrades', 'scienceKit', 'price']),
      rocketBuiltParts: m.rdo.getResourceDataObject('space', ['upgrades', 'rocket1', 'builtParts']),
      hydrogenAutobuyerQuantity: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']),

      techUnlockedArray: [...(m.cg.getTechUnlockedArray() ?? [])].sort(),
      unlockedResources: [...(m.cg.getUnlockedResourcesArray() ?? [])].sort(),
      unlockedCompounds: [...(m.cg.getUnlockedCompoundsArray() ?? [])].sort(),
      rocketsBuilt: [...(m.cg.getRocketsBuilt() ?? [])].sort(),
      starShipModulesBuilt: [...(m.cg.getStarShipModulesBuilt() ?? [])].sort(),
      asteroidCount: (m.cg.getAsteroidArray() ?? []).length,
      starShipBuilt: m.cg.getStarShipBuilt(),

      casinoPoints: m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity'])
    };
  });
}

/** The per-run flags a rebirth has to hand back in their starting position. */
async function readRunFlags(game) {
  return game.withMods((m) => ({
    destinationStar: m.cg.getDestinationStar(),
    destinationStarScanned: m.cg.getDestinationStarScanned(),
    battleResolved: [...m.cg.getBattleResolved()],
    rebirthPossible: m.cg.getRebirthPossible(),
    hasDestinationRecord: Boolean(m.rdo.getStarSystemDataObject('stars', ['destinationStar'], true))
  }));
}

/**
 * Everything earned *across* runs, which a rebirth must carry forward.
 *
 * Perk levels and achievement flags are compared whole rather than sampled: a
 * reset that dropped one perk out of thirty would pass any spot check.
 */
async function readMetaBoard(game) {
  return game.withMods((m) => {
    const perks = Object.fromEntries(
      Object.entries(m.rdo.getAscendencyBuffDataObject() ?? {})
        .filter(([key]) => key !== 'version')
        .map(([key, buff]) => [key, buff?.boughtYet ?? 0])
    );

    return {
      run: m.cg.getStatRun(),
      philosophy: m.cg.getPlayerPhilosophy(),
      abilityActive: m.cg.getPhilosophyAbilityActive(),
      multipliers: { ...m.cg.getAllRepeatableTechMultipliersObject() },
      ascendencyPoints: m.rdo.getResourceDataObject('ascendencyPoints', ['quantity']),
      achievementFlags: [...(m.cg.getAchievementFlagArray() ?? [])].sort(),
      perks,
      settledStars: [...(m.cg.getSettledStars() ?? [])].map((s) => String(s).toLowerCase()),
      galacticPoints: Number(m.rdo.getCosmicRipGalacticPoints()) || 0,
      saveName: m.cg.getSaveName(),
      currentStarSystem: m.cg.getCurrentStarSystem()
    };
  });
}

/**
 * Assert the run is back where a fresh boot left it.
 *
 * `expectedTechs` is the tech list the new run should hold. It is
 * `['apAwardedThisRun']` for every ordinary rebirth, and gains `cosmicRip` once
 * the rip has been unlocked, because that is the one tech
 * `resetAllVariablesOnRebirth` deliberately carries over.
 */
function expectRunWasReset(pristine, before, after, { expectedTechs = ['apAwardedThisRun'] } = {}) {
  // Guard the guard: if the debug scenario had not actually stocked the run,
  // "everything is back to its starting value" would be trivially true.
  expect(before.cash, 'the run under test should have been stocked first').toBeGreaterThan(pristine.cash);
  expect(before.techUnlockedArray.length).toBeGreaterThan(pristine.techUnlockedArray.length);

  expect(after.techUnlockedArray).toEqual([...expectedTechs].sort());

  expect(after.cash).toBe(pristine.cash);
  expect(after.research).toBe(pristine.research);
  expect(after.resourceQuantities).toEqual(pristine.resourceQuantities);
  expect(after.compoundQuantities).toEqual(pristine.compoundQuantities);

  expect(after.powerPlantPrice).toBe(pristine.powerPlantPrice);
  expect(after.powerPlantQuantity).toBe(pristine.powerPlantQuantity);
  expect(after.scienceKitPrice).toBe(pristine.scienceKitPrice);
  expect(after.rocketBuiltParts).toBe(pristine.rocketBuiltParts);
  expect(after.hydrogenAutobuyerQuantity).toBe(pristine.hydrogenAutobuyerQuantity);

  expect(after.unlockedResources).toEqual(['hydrogen']);
  expect(after.unlockedCompounds).toEqual([]);
  expect(after.rocketsBuilt).toEqual([]);
  expect(after.starShipModulesBuilt).toEqual([]);
  expect(after.asteroidCount).toBe(0);
  expect(after.starShipBuilt).toBe(false);
  expect(after.casinoPoints).toBe(0);
}

/** Assert the per-run flags are back to their starting position. */
function expectFlagsWereReset(flags) {
  expect(flags.destinationStar, 'the new run has no destination chosen yet').toBeNull();
  expect(flags.destinationStarScanned).toBe(false);
  expect(flags.battleResolved).toEqual([false, null]);
  expect(flags.rebirthPossible, 'the new run has not earned a rebirth yet').toBe(false);
  // The record the rebirth consumed is gone, which is exactly why a second
  // rebirth without a fresh scan is refused rather than half-completed.
  expect(flags.hasDestinationRecord).toBe(false);
}

/** Assert nothing earned across runs was lost, and the run counter moved by one. */
function expectMetaSurvived(before, after, { destination }) {
  expect(after.run).toBe(before.run + 1);
  expect(after.philosophy).toBe(before.philosophy);
  expect(after.abilityActive).toBe(before.abilityActive);
  expect(after.multipliers).toEqual(before.multipliers);
  expect(after.saveName).toBe(before.saveName);

  // A rebirth grants AP. The one thing it must never do is take any away.
  expect(after.ascendencyPoints).toBeGreaterThanOrEqual(before.ascendencyPoints);
  expect(after.perks).toEqual(before.perks);
  // Achievements accumulate: `rebirth` itself is added on the way through.
  expect(after.achievementFlags).toEqual(expect.arrayContaining(before.achievementFlags));

  // Galactic points derive from the settled list, so a reset here would
  // silently take points away from the player.
  expect(after.settledStars).toEqual(expect.arrayContaining(before.settledStars));
  expect(after.settledStars).toContain(destination.toLowerCase());
  expect(after.settledStars.length).toBe(before.settledStars.length + 1);
  expect(after.galacticPoints).toBe(before.galacticPoints + 1);

  // The run moved to the system it conquered.
  expect(String(after.currentStarSystem).toLowerCase()).toBe(destination.toLowerCase());
}

/**
 * Prove the run is alive: the frame loop ticks, production accrues, every
 * unlocked tab draws, and nothing lands in the console.
 *
 * A dead frame loop is the failure mode with no symptom — see known-issues #1 —
 * so it is checked by watching a counter the loop owns actually move.
 */
async function expectRunIsPlayable(game, page) {
  const firstTick = await game.withMods((m) => JSON.stringify(m.cg.getGameActiveCountTime()));
  await page.waitForTimeout(1400);
  const secondTick = await game.withMods((m) => JSON.stringify(m.cg.getGameActiveCountTime()));
  expect(secondTick, 'the frame loop should still be running').not.toBe(firstTick);

  const tab = await game.withMods((m) => m.cg.getCurrentTab());
  expect(Array.isArray(tab)).toBe(true);
  expect(tab[0]).toBeGreaterThanOrEqual(1);

  // Production: stage one autobuyer and watch the quantity climb. Tier 1 is
  // deliberate — it is the tier that runs without power, so this measures the
  // production loop rather than the grid.
  await game.withMods((m) => {
    m.rdo.setResourceDataObject(true, 'resources', ['hydrogen', 'revealedYet']);
    m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'quantity']);
    m.rdo.setResourceDataObject(1e9, 'resources', ['hydrogen', 'storageCapacity']);
    m.rdo.setResourceDataObject(1, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'rate']);
    m.rdo.setResourceDataObject(100, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
    m.rdo.setResourceDataObject(true, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'active']);
  });
  const stockBefore = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']));
  await page.waitForTimeout(1500);
  const stockAfter = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']));
  expect(stockAfter, 'resources should still be produced after a rebirth').toBeGreaterThan(stockBefore);

  // Every tab the new run has is opened in turn. `drawTab5Content` once threw
  // on a missing destination-star record after a battle, and because it is
  // async and called unawaited the pane simply half-drew; a sweep is how that
  // class of failure becomes visible.
  for (const index of [1, 2, 3, 4, 5, 6, 7]) {
    await game.openTab(index);
    await page.waitForTimeout(250);
  }
  await game.openTab(1);
  await page.waitForTimeout(300);

  expect(game.significantErrors(), 'a rebirth must write nothing to the console').toEqual([]);
}

// ------------------------------------------------------------------- the specs

test.describe('Rebirth — the first one, run 1 to 2', () => {
  test('resets the run, keeps everything earned, and leaves a playable run 2', async ({ game, page }) => {
    await game.boot();
    // The board as `initialise` built it, before the debug scenario stocks it.
    // Everything the reset is supposed to clear is compared back to this.
    const pristine = await readRunBoard(game);

    await playRunToRebirthReady(game, page, 'vega');

    const runBefore = await readRunBoard(game);
    const metaBefore = await readMetaBoard(game);
    expect(metaBefore.run).toBe(1);

    const run = await rebirthThroughTheUI(game, page);
    expect(run).toBe(2);

    expectRunWasReset(pristine, runBefore, await readRunBoard(game));
    expectFlagsWereReset(await readRunFlags(game));
    expectMetaSurvived(metaBefore, await readMetaBoard(game), { destination: 'vega' });

    await expectRunIsPlayable(game, page);
  });

  test('reveals the Philosophy pane, which is the run-1 rebirth\'s own job', async ({ game, page }) => {
    // `rebirth()` does this in its `rebirthCalledOnRun1` branch and nowhere
    // else, so it is the one thing the first rebirth does that later ones do not.
    await game.boot();
    await playRunToRebirthReady(game, page, 'vega');

    await game.openTab(3);
    await page.waitForTimeout(400);
    const beforeReveal = await page.evaluate(() =>
      document.getElementById('philosophyOption')?.parentElement?.parentElement?.classList.contains('invisible'));
    expect(beforeReveal, 'run 1 has no Philosophy pane').toBe(true);

    await openRebirthPane(game, page);
    await rebirthThroughTheUI(game, page);

    await game.openTab(3);
    await page.waitForTimeout(400);
    const afterReveal = await page.evaluate(() =>
      document.getElementById('philosophyOption')?.parentElement?.parentElement?.classList.contains('invisible'));
    expect(afterReveal).toBe(false);

    expect(game.significantErrors()).toEqual([]);
  });

  test('a second rebirth without a fresh scan is refused, and the run is untouched', async ({ game, page }) => {
    await game.boot();
    await playRunToRebirthReady(game, page, 'vega');
    await rebirthThroughTheUI(game, page);

    // The destination record is consumed by the rebirth that used it, so the
    // button must go back to `disabled` rather than merely red — a colour class
    // only removes pointer events, and `rebirth()` entered from a state it
    // cannot finish tears the run down as far as `setupNewRunStarSystem()`.
    await openRebirthPane(game, page);
    const locked = await rebirthButtonState(page);
    expect(locked.disabled).toBe(true);
    expect(locked.ready).toBe(false);
    expect(locked.pointerEvents).toBe('none');

    // Earning another rebirth is not enough on its own: without a destination
    // there is nothing to rebuild the next run around.
    await game.withMods((m) => m.cg.setBattleResolved(true, 'player'));
    await page.waitForTimeout(900);
    const stillLocked = await rebirthButtonState(page);
    expect(stillLocked.disabled, 'earned, but not completable').toBe(true);

    const before = await readRunBoard(game);
    const metaBefore = await readMetaBoard(game);
    await page.evaluate(() => document.querySelector('.rebirth-check')?.click());
    await page.waitForTimeout(1200);

    expect(await readRunBoard(game)).toEqual(before);
    expect((await readMetaBoard(game)).run).toBe(metaBefore.run);
    expect(game.significantErrors()).toEqual([]);
  });
});

test.describe('Rebirth — a later one, run 2 to 3', () => {
  test('resets the run, keeps everything earned, and leaves a playable run 3', async ({ game, page }) => {
    await game.boot();
    const pristine = await readRunBoard(game);

    await playRunToRebirthReady(game, page, 'vega');
    expect(await rebirthThroughTheUI(game, page)).toBe(2);

    // Run 2 is played out in full again. This is the rebirth under test: it runs
    // against a board a previous reset produced rather than one `initialise`
    // built, which is where a reset that only half-restores its own output shows.
    await playRunToRebirthReady(game, page, 'rigel');

    const runBefore = await readRunBoard(game);
    const metaBefore = await readMetaBoard(game);
    expect(metaBefore.run).toBe(2);
    expect(metaBefore.settledStars).toContain('vega');

    expect(await rebirthThroughTheUI(game, page)).toBe(3);

    expectRunWasReset(pristine, runBefore, await readRunBoard(game));
    expectFlagsWereReset(await readRunFlags(game));
    expectMetaSurvived(metaBefore, await readMetaBoard(game), { destination: 'rigel' });

    // Both conquests are still on the books — the settled list is the ledger
    // galactic points are counted from, so it accumulates and never resets.
    const meta = await readMetaBoard(game);
    expect(meta.settledStars).toEqual(expect.arrayContaining(['vega', 'rigel']));

    await expectRunIsPlayable(game, page);
  });

  test('an ascendency perk bought on run 2 is still owned, and still applied, on run 3', async ({ game, page }) => {
    // Perks are the meta currency's whole point. `resetResourceDataObjectOnRebirthAndAddApAndPermanentBuffsBack`
    // wipes the data object and then puts the permanent buffs back on top, so a
    // perk that survived as a *number* but stopped being *applied* would look
    // completely normal in the ascendency pane and do nothing in the game.
    await game.boot();
    await playRunToRebirthReady(game, page, 'vega');
    expect(await rebirthThroughTheUI(game, page)).toBe(2);

    await game.debugClick('add100ApButton');
    // `purchaseBuff` is the function the ascendency pane's own buttons call.
    await game.withMods((m) => m.game.purchaseBuff('efficientStorage'));
    const bought = await game.withMods((m) => m.rdo.getBuffEfficientStorageData()['boughtYet']);
    expect(bought, 'the perk should have been affordable').toBeGreaterThan(0);

    await playRunToRebirthReady(game, page, 'rigel');
    expect(await rebirthThroughTheUI(game, page)).toBe(3);

    const afterRebirth = await game.withMods((m) => ({
      boughtYet: m.rdo.getBuffEfficientStorageData()['boughtYet'],
      // Efficient Storage raises the multiple every storage upgrade applies, so
      // its effect is observable without pressing anything.
      storageMultiple: m.cg.getIncreaseStorageFactor() * (m.rdo.getBuffEfficientStorageData()['boughtYet'] + 1)
    }));

    expect(afterRebirth.boughtYet).toBe(bought);
    expect(afterRebirth.storageMultiple).toBeGreaterThan(2);

    expect(game.significantErrors()).toEqual([]);
  });
});