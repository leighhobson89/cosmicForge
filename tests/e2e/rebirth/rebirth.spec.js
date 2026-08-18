/**
 * Area: Rebirth
 * Plan: tests/docs/areas/rebirth.md
 *
 * The prestige reset, and the most destructive operation in the game if it goes
 * wrong: it wipes the run's resources, techs, buildings and star system and
 * rebuilds them around the system the player colonised.
 *
 * The reported failure was a console warning — `Missing subKey: destinationStar`
 * — followed by the run being left in a half-reset state. `rebirth()` rebuilds
 * the new run from `starSystems.stars.destinationStar`, the record the tab 5
 * system scan copies in, and every rebirth deletes that record on its way out.
 * Any state that reached `rebirth()` without one therefore tore the run down as
 * far as `setupNewRunStarSystem()`, threw on the missing record, and stopped —
 * after `stopAutoSave()` and the tab reset but before the run counter, the AP
 * grant and `setRebirthPossible(false)`. The button was also only cosmetically
 * disabled (a colour class that removes pointer events), so it stayed reachable
 * programmatically and by any path that did not go through a real mouse click.
 *
 * These specs pin both halves: the operation refuses a state it cannot finish,
 * and the button reports that state honestly.
 *
 * What is left here is only what `rebirth-live.spec.js` does not already play
 * through the pane. That file presses the Rebirth button, confirms the modal and
 * audits three whole rebirths against a fresh-boot baseline, so the cases that
 * merely called `m.game.rebirth()` and re-checked the run counter, the console,
 * the consumed destination record, the perks or the philosophy have been removed
 * from here rather than asserted twice. The four below survive because each
 * covers something the live file does not reach: the localized refusal notice,
 * the button's transition from disabled to ready, the cancel branch of the
 * confirmation modal, and a rebirth taken with the rip already closed.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/**
 * Put the run in the state a player reaches by travelling to a system and
 * scanning it, which is what writes `stars.destinationStar`. Driven through the
 * game's own star generator and copy helper rather than by hand-building the
 * record, so the shape stays whatever the game says it is.
 */
async function scanDestinationSystem(game, starName = 'vega') {
  return game.withMods((m, name) => {
    m.game.generateStarDataAndAddToDataObject({ id: name }, 12);
    m.cg.setDestinationStar(name);
    m.rdo.copyStarDataToDestinationStarField(name);
    m.cg.setDestinationStarScanned(true);
    return Boolean(m.rdo.getStarSystemDataObject('stars', ['destinationStar'], true));
  }, starName);
}

/**
 * Close whatever modal is currently up. The onboarding prompt reappears after
 * the debug setup chain, and `callPopupModal` waits for an open modal to close
 * before binding its own handlers — so a Rebirth confirmation clicked with the
 * onboarding prompt still on screen would land on the onboarding buttons.
 */
async function dismissAnyOpenModal(page) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const closed = await page.evaluate(() => {
      const cancel = document.getElementById('modalCancel');
      if (cancel?.offsetParent) { cancel.click(); return true; }
      const confirm = document.getElementById('modalConfirm');
      if (confirm?.offsetParent) { confirm.click(); return true; }
      return false;
    });
    if (!closed) return;
    await page.waitForTimeout(500);
  }
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
  await page.waitForTimeout(700);
}

async function rebirthButtonState(page) {
  return page.evaluate(() => {
    const btn = document.querySelector('.rebirth-check');
    if (!btn) return null;
    return {
      disabled: btn.disabled,
      pointerEvents: getComputedStyle(btn).pointerEvents,
      ready: btn.classList.contains('green-ready-text')
    };
  });
}

test.describe('Rebirth', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
  });

  test('the refusal tells the player what is missing, in their own language', async ({ game, page }) => {
    await scanDestinationSystem(game);
    await game.withMods((m) => m.game.rebirth());
    await page.waitForTimeout(1000);

    await game.withMods((m) => m.ui.relocalizeAll('de'));
    await page.waitForTimeout(500);

    await game.withMods((m) => m.game.rebirth());
    await page.waitForTimeout(600);

    const expected = await game.withMods((m) => m.loc.localize('notificationRebirthNoDestination', 'de'));
    const notifications = await game.notifications();
    expect(notifications.some((text) => text.includes(expected))).toBe(true);
  });

  test('the rebirth button is genuinely disabled until a rebirth is possible', async ({ game, page }) => {
    await scanDestinationSystem(game);
    await openRebirthPane(game, page);

    const locked = await rebirthButtonState(page);
    expect(locked, 'the Rebirth pane should expose its button').not.toBeNull();
    expect(locked.disabled, 'not merely coloured red — `disabled`, so no code path can enter rebirth()').toBe(true);
    expect(locked.pointerEvents).toBe('none');
    expect(locked.ready).toBe(false);

    // Winning the battle at the destination is what earns the rebirth.
    await game.withMods((m) => m.cg.setBattleResolved(true, 'player'));
    await page.waitForTimeout(700);

    const unlocked = await rebirthButtonState(page);
    expect(unlocked.disabled).toBe(false);
    expect(unlocked.ready).toBe(true);
  });

  test('cancelling the confirmation modal changes nothing', async ({ game, page }) => {
    await scanDestinationSystem(game);
    await game.withMods((m) => m.cg.setBattleResolved(true, 'player'));
    await openRebirthPane(game, page);
    await page.waitForTimeout(600);

    const before = await game.withMods((m) => ({
      run: m.cg.getStatRun(),
      currentStar: m.cg.getCurrentStarSystem(),
      starKeys: Object.keys(m.rdo.getStarSystemDataObject('stars'))
    }));

    const confirmLabel = await game.withMods((m) => m.loc.localize('modalRebirthConfirmLabel', m.cg.getLanguage()));

    await page.evaluate(() => document.querySelector('.rebirth-check')?.click());
    // Wait for the *Rebirth* modal specifically, identified by its confirm
    // label, so this cannot pass by dismissing some other modal.
    await page.waitForFunction(
      (label) => document.getElementById('modalConfirm')?.innerText?.trim() === label,
      confirmLabel,
      { timeout: 10000 }
    );

    await page.evaluate(() => document.getElementById('modalCancel').click());
    await page.waitForTimeout(800);

    const after = await game.withMods((m) => ({
      run: m.cg.getStatRun(),
      currentStar: m.cg.getCurrentStarSystem(),
      starKeys: Object.keys(m.rdo.getStarSystemDataObject('stars'))
    }));

    expect(after).toEqual(before);
  });

  test('closing the cosmic rip does not, by itself, block a rebirth', async ({ game, page }) => {
    // The end-game state the failure was first seen in. Closing the rip spends a
    // galactic point and plays the credits; it touches nothing rebirth depends
    // on, so a run that still has a scanned destination can rebirth afterwards.
    await scanDestinationSystem(game);
    await game.withMods((m) => {
      m.cg.setBattleResolved(true, 'player');
      m.cg.setAchievementFlagArray('closeCosmicRip', 'add');
      m.cg.setAchievementFlagArray('completeGame', 'add');
      m.cg.setGalacticPointsSpent((Number(m.cg.getGalacticPointsSpent()) || 0) + 1);
    });

    const runBefore = await game.withMods((m) => m.cg.getStatRun());

    const result = await game.withMods((m) => {
      try { return { returned: m.game.rebirth() }; } catch (error) { return { threw: error.message }; }
    });
    await page.waitForTimeout(1200);

    expect(result.threw).toBeUndefined();
    expect(result.returned).toBe(true);
    expect(await game.withMods((m) => m.cg.getStatRun())).toBe(runBefore + 1);
  });
});
