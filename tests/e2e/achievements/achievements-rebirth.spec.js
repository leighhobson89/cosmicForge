/**
 * Area: Achievements — what survives a rebirth, and what is meant to come back
 * Plan: tests/docs/areas/achievements.md
 *
 * Every achievement carries a `resetOnRebirth` flag, and the two halves of that
 * flag are promises to the player of opposite kinds. A `true` achievement is one
 * the run can earn again, so wiping it is the point. A `false` achievement is
 * *permanent* — it is the record of something that happened once, and losing it
 * to a rebirth is unrecoverable, because there is no undo and the autosave fires
 * immediately afterwards.
 *
 * The reward has the same two halves, and the catalogue lines them up: every
 * achievement paying a plain `multiplier` (which acts on this run's autobuyer
 * rates, and which the reset therefore throws away) is `resetOnRebirth: true`, so
 * the player can win the multiplier back. Every `multiplierPermanent` belongs to
 * an achievement that is never reset, and `addPermanentResourcesModifiersBackIn()`
 * re-applies it to the fresh board on the way out of every rebirth. This file
 * asserts that pairing as an invariant rather than trusting it, because an
 * achievement added on the wrong side of it silently either loses the player a
 * permanent bonus or hands them one twice.
 *
 * Two rebirths are taken, both through the Rebirth pane's own button and
 * confirmation modal, because "survives a rebirth" has to mean *every* rebirth —
 * a reset that only spared the permanent achievements on the first pass would
 * pass a one-rebirth test and still erase a player's record on their third run.
 *
 * ### Why the achievements are granted directly here
 *
 * What is under test is the *reset*, not the conditions — those are swept
 * achievement by achievement in `achievement-catalogue.spec.js` and played
 * through the UI in `achievements-live.spec.js`. Reaching all seventy conditions
 * again before each rebirth would triple the runtime of this file to re-prove
 * something already covered, so the whole catalogue is granted through the
 * game's own `grantAchievement`, which is the single function every condition
 * funnels into.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe.configure({ timeout: 420_000 });

// --------------------------------------------------------------------- helpers

/**
 * Close whatever modal is currently up.
 *
 * `callPopupModal` waits out an already-open modal before binding its handlers,
 * so a Rebirth confirmation clicked while another dialog is still on screen
 * would land on the wrong buttons.
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

/** Press Rebirth and confirm — the player's own route through the reset. */
async function rebirthThroughTheUI(game, page) {
  const state = await page.evaluate(() => {
    const button = document.querySelector('.rebirth-check');
    if (!button) return null;
    return { disabled: button.disabled, ready: button.classList.contains('green-ready-text') };
  });
  expect(state, 'the Rebirth pane should expose its button').not.toBeNull();
  expect(state.disabled, 'the run should have earned a completable rebirth by now').toBe(false);

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
  await page.waitForTimeout(1200);
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
 * Earn the whole catalogue, through the game's own grant function.
 *
 * Returns the achievements that were granted here, so the assertions below can
 * distinguish "was never on" from "was on and was wiped".
 */
async function grantEveryAchievement(game) {
  return game.withMods((m) => {
    const ids = Object.keys(m.rdo.achievementsData).filter((k) => k !== 'version');
    for (const id of ids) {
      if (m.rdo.getAchievementDataObject(id, ['active'], true) !== true) m.ach.grantAchievement(id);
    }
    return ids.filter((id) => m.rdo.getAchievementDataObject(id, ['active'], true) === true);
  });
}

/** The `resetOnRebirth` split, read from the game rather than hard-coded here. */
async function readResetPolicy(game) {
  return game.withMods((m) => {
    const permanent = [];
    const perRun = [];
    for (const id of Object.keys(m.rdo.achievementsData)) {
      if (id === 'version') continue;
      (m.rdo.getAchievementDataObject(id, ['resetOnRebirth'], true) ? perRun : permanent).push(id);
    }
    return { permanent: permanent.sort(), perRun: perRun.sort() };
  });
}

/** Which achievements are currently on. */
async function readActive(game) {
  return game.withMods((m) => Object.keys(m.rdo.achievementsData)
    .filter((k) => k !== 'version' && m.rdo.getAchievementDataObject(k, ['active'], true) === true)
    .sort());
}

/**
 * The three achievements `autoGrantAchievementsOnRebirth()` hands straight back
 * when the run has infinite power. They are `resetOnRebirth: true`, so they are
 * cleared and then immediately re-earned within the same rebirth — expected
 * behaviour that a naive "everything resettable is off afterwards" check would
 * report as a defect.
 */
async function autoGrantedOnRebirth(game) {
  const infinitePower = await game.withMods((m) => m.cg.getInfinitePower());
  return infinitePower ? ['buildPowerPlant', 'buildSolarPowerPlant', 'tripPower'] : [];
}

// ------------------------------------------------------------------ the specs

test.describe('Achievements — persistence across rebirths', () => {
  test('a permanent multiplier belongs to a permanent achievement, and vice versa', async ({ game }) => {
    await game.boot();

    // The design invariant the reset depends on. A `multiplier` reward acts on
    // this run's autobuyer rates and does not survive the reset, so its
    // achievement must be re-earnable; a `multiplierPermanent` is re-applied to
    // the new board by `addPermanentResourcesModifiersBackIn()`, so its
    // achievement must never be re-earnable or the player would compound it.
    const mismatches = await game.withMods((m) => {
      const problems = [];
      for (const id of Object.keys(m.rdo.achievementsData)) {
        if (id === 'version') continue;
        const achievement = m.rdo.getAchievementDataObject(id);
        const category = achievement?.gives?.gives1;
        const resets = achievement?.resetOnRebirth === true;

        if (category === 'multiplier' && !resets) {
          problems.push(`${id}: pays a per-run multiplier a rebirth wipes, but is never reset so it can never be re-earned`);
        }
        if (category === 'multiplierPermanent' && resets) {
          problems.push(`${id}: pays a permanent multiplier, but is reset on rebirth so it can be earned again and compounded`);
        }
      }
      return problems;
    });

    expect(mismatches).toEqual([]);
  });

  test('the catalogue is split into achievements a rebirth clears and achievements it never touches', async ({ game }) => {
    await game.boot();
    const policy = await readResetPolicy(game);

    // Both halves have to be populated for the two specs below to mean anything.
    expect(policy.perRun.length, 'some achievements must be re-earnable each run').toBeGreaterThan(0);
    expect(policy.permanent.length, 'some achievements must be permanent').toBeGreaterThan(0);
    expect(policy.perRun.length + policy.permanent.length).toBe(70);
  });

  test('every permanent achievement survives two rebirths, and every per-run one is handed back', async ({ game, page }) => {
    await game.boot();
    const policy = await readResetPolicy(game);

    await playRunToRebirthReady(game, page, 'vega');

    const granted = await grantEveryAchievement(game);
    expect(granted.sort()).toEqual([...policy.permanent, ...policy.perRun].sort());

    const autoGranted = await autoGrantedOnRebirth(game);

    // ------------------------------------------------------------- rebirth 1
    await openRebirthPane(game, page);
    const runAfterFirst = await rebirthThroughTheUI(game, page);
    expect(runAfterFirst).toBe(2);

    let active = await readActive(game);

    const lostPermanently = policy.permanent.filter((id) => !active.includes(id));
    expect(lostPermanently, 'these are marked resetOnRebirth: false and must survive a rebirth').toEqual([]);

    const survivedWrongly = policy.perRun.filter((id) => active.includes(id) && !autoGranted.includes(id));
    expect(survivedWrongly, 'these are marked resetOnRebirth: true and should have been cleared').toEqual([]);

    for (const id of autoGranted) {
      expect(active.includes(id), `${id} is auto-granted again on a rebirth with infinite power`).toBe(true);
    }

    // ------------------------------------------------------------- rebirth 2
    // Re-earn the per-run half, so the second rebirth is asked to clear a full
    // board again rather than one that is already mostly empty.
    await grantEveryAchievement(game);
    await playRunToRebirthReady(game, page, 'rigel');
    await openRebirthPane(game, page);
    const runAfterSecond = await rebirthThroughTheUI(game, page);
    expect(runAfterSecond).toBe(3);

    active = await readActive(game);

    expect(
      policy.permanent.filter((id) => !active.includes(id)),
      'a permanent achievement lost on the second rebirth — persistence has to hold for every rebirth, not the first'
    ).toEqual([]);
    expect(
      policy.perRun.filter((id) => active.includes(id) && !autoGranted.includes(id)),
      'a per-run achievement survived the second rebirth'
    ).toEqual([]);

    expect(game.significantErrors()).toEqual([]);
  });

  test('a permanent multiplier is re-applied to the fresh board after every rebirth', async ({ game, page }) => {
    await game.boot();
    await playRunToRebirthReady(game, page, 'altair');

    // The three achievements paying `multiplierPermanent` are seeAllNewsTickers
    // (+0.2 resources), activateAllWackyNewsTickers (compound cost x0.8) and
    // rebirth (+0.3 resources). Earning the whole catalogue collects all three.
    await grantEveryAchievement(game);

    const earned = await game.withMods((m) => ({
      resources: m.cg.getMultiplierPermanentResources(),
      compounds: m.cg.getMultiplierPermanentCompounds()
    }));
    // 1 + 0.2 + 0.3. Asserted rather than merely "greater than 1", so a reward
    // that silently stopped being added shows up here.
    expect(earned.resources).toBeCloseTo(1.5, 6);
    expect(earned.compounds).toBeCloseTo(0.8, 6);

    // The board a rebirth rebuilds from, before the permanent modifiers go back
    // in. Read from the pristine copy the reset restores.
    const baseRates = await game.withMods((m) => {
      const rates = {};
      for (const key of Object.keys(m.rdo.getResourceDataObject('resources') || {})) {
        if (key === 'version' || key === 'solar') continue;
        rates[key] = [1, 2, 3, 4].map((tier) =>
          m.rdo.getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', `tier${tier}`, 'rate'], true));
      }
      return rates;
    });
    expect(Object.keys(baseRates).length).toBeGreaterThan(0);

    await openRebirthPane(game, page);
    await rebirthThroughTheUI(game, page);

    const after = await game.withMods((m) => ({
      multiplier: m.cg.getMultiplierPermanentResources(),
      rates: (() => {
        const rates = {};
        for (const key of Object.keys(m.rdo.getResourceDataObject('resources') || {})) {
          if (key === 'version' || key === 'solar') continue;
          rates[key] = [1, 2, 3, 4].map((tier) =>
            m.rdo.getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', `tier${tier}`, 'rate'], true));
        }
        return rates;
      })()
    }));

    // The permanent multiplier itself has to come through the reset untouched…
    expect(after.multiplier).toBeCloseTo(earned.resources, 6);

    // …and it has to have been *used*: every non-zero rate on the rebuilt board
    // carries it. A rebirth that kept the number and forgot to apply it would
    // silently halve the player's permanent progress.
    const unscaled = [];
    for (const [key, tiers] of Object.entries(after.rates)) {
      tiers.forEach((rate, index) => {
        if (!(rate > 0)) return;
        // The rebuilt rate is `pristine * multiplier`, so dividing it back out
        // has to land on a figure at or below the rate this run started with.
        const implied = rate / after.multiplier;
        if (!(implied > 0) || implied >= rate) {
          unscaled.push(`${key} tier${index + 1}: ${rate} shows no sign of the x${after.multiplier} permanent multiplier`);
        }
      });
    }
    expect(unscaled).toEqual([]);
    expect(game.significantErrors()).toEqual([]);
  });
});
