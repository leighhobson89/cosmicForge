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

  test('a rebirth with a scanned destination completes and moves the run there', async ({ game, page }) => {
    expect(await scanDestinationSystem(game, 'vega')).toBe(true);

    const before = await game.withMods((m) => ({
      run: m.cg.getStatRun(),
      starKeys: Object.keys(m.rdo.getStarSystemDataObject('stars'))
    }));
    expect(before.starKeys).toContain('destinationStar');

    const result = await game.withMods((m) => {
      try { return { returned: m.game.rebirth() }; } catch (error) { return { threw: error.message }; }
    });
    await page.waitForTimeout(1200);

    expect(result.threw, 'rebirth must not throw from a state it accepted').toBeUndefined();
    expect(result.returned).toBe(true);

    const after = await game.withMods((m) => ({
      run: m.cg.getStatRun(),
      currentStar: m.cg.getCurrentStarSystem(),
      starKeys: Object.keys(m.rdo.getStarSystemDataObject('stars')),
      rebirthPossible: m.cg.getRebirthPossible(),
      destinationStar: m.cg.getDestinationStar()
    }));

    expect(after.run).toBe(before.run + 1);
    expect(after.currentStar).toBe('vega');
    expect(after.rebirthPossible, 'the new run has not earned a rebirth yet').toBe(false);
    expect(after.destinationStar, 'the new run has no destination chosen yet').toBeNull();

    // The record the rebirth consumed is gone, which is exactly why a second
    // rebirth without a fresh scan is the failing case below.
    expect(after.starKeys).not.toContain('destinationStar');
  });

  test('a rebirth completes with no console errors', async ({ game, page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`));
    page.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`);
    });

    await scanDestinationSystem(game);
    errors.length = 0;

    await game.withMods((m) => m.game.rebirth());
    await page.waitForTimeout(1500);

    const significant = errors.filter((e) => !/Failed to load|net::ERR_|favicon/.test(e));
    expect(significant, 'a clean rebirth writes nothing to the console').toEqual([]);
  });

  test('a rebirth with no scanned destination is refused and changes nothing', async ({ game, page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`));
    page.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`);
    });

    // Reach the failing state the way a player does: rebirth once, which deletes
    // the destination record, then try again before scanning a new system.
    await scanDestinationSystem(game);
    await game.withMods((m) => m.game.rebirth());
    await page.waitForTimeout(1000);

    const before = await game.withMods((m) => ({
      run: m.cg.getStatRun(),
      currentStar: m.cg.getCurrentStarSystem(),
      starKeys: Object.keys(m.rdo.getStarSystemDataObject('stars')),
      cash: m.rdo.getResourceDataObject('currency', ['cash'])
    }));

    errors.length = 0;
    const result = await game.withMods((m) => {
      try { return { returned: m.game.rebirth() }; } catch (error) { return { threw: error.message }; }
    });
    await page.waitForTimeout(1000);

    expect(result.threw, 'the refusal must be a return, not a throw part-way through the reset').toBeUndefined();
    expect(result.returned).toBe(false);

    const after = await game.withMods((m) => ({
      run: m.cg.getStatRun(),
      currentStar: m.cg.getCurrentStarSystem(),
      starKeys: Object.keys(m.rdo.getStarSystemDataObject('stars')),
      cash: m.rdo.getResourceDataObject('currency', ['cash'])
    }));

    expect(after, 'a refused rebirth must leave the run exactly as it was').toEqual(before);

    const significant = errors.filter((e) => !/Failed to load|net::ERR_|favicon/.test(e));
    expect(significant, 'the refusal is a player-facing notice, not a console warning').toEqual([]);
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

  test('the button stays disabled when the rebirth is earned but the destination record is gone', async ({ game, page }) => {
    // The exact combination behind the report: `rebirthPossible` true, no
    // destination record. The button used to go green on the first alone.
    await scanDestinationSystem(game);
    await game.withMods((m) => {
      m.cg.setBattleResolved(true, 'player');
      m.cg.setRebirthPossible(true);
      delete m.rdo.getStarSystemDataObject('stars').destinationStar;
    });

    await openRebirthPane(game, page);
    await page.waitForTimeout(700);

    const state = await rebirthButtonState(page);
    expect(state.disabled).toBe(true);
    expect(state.ready).toBe(false);
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

  test('confirming the modal performs the rebirth', async ({ game, page }) => {
    await scanDestinationSystem(game, 'vega');
    await game.withMods((m) => m.cg.setBattleResolved(true, 'player'));
    await openRebirthPane(game, page);
    await page.waitForTimeout(600);

    const runBefore = await game.withMods((m) => m.cg.getStatRun());
    const confirmLabel = await game.withMods((m) => m.loc.localize('modalRebirthConfirmLabel', m.cg.getLanguage()));

    await page.evaluate(() => document.querySelector('.rebirth-check')?.click());
    // callPopupModal is async and waits out any modal still closing, so the
    // confirm handler is not bound the instant the click returns. Matching on
    // the label pins this to the Rebirth modal rather than whatever is up.
    await page.waitForFunction(
      (label) => document.getElementById('modalConfirm')?.innerText?.trim() === label,
      confirmLabel,
      { timeout: 10000 }
    );
    await page.evaluate(() => document.getElementById('modalConfirm').click());
    await page.waitForTimeout(1500);

    const after = await game.withMods((m) => ({
      run: m.cg.getStatRun(),
      currentStar: m.cg.getCurrentStarSystem()
    }));

    expect(after.run).toBe(runBefore + 1);
    expect(after.currentStar).toBe('vega');
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

  test('perks, achievements and philosophy survive a rebirth', async ({ game, page }) => {
    await scanDestinationSystem(game);

    const before = await game.withMods((m) => ({
      philosophy: m.cg.getPlayerPhilosophy(),
      buffKeys: Object.keys(m.rdo.getAscendencyBuffDataObject() || {}).sort()
    }));

    await game.withMods((m) => m.game.rebirth());
    await page.waitForTimeout(1200);

    const after = await game.withMods((m) => ({
      philosophy: m.cg.getPlayerPhilosophy(),
      buffKeys: Object.keys(m.rdo.getAscendencyBuffDataObject() || {}).sort()
    }));

    expect(after.philosophy).toBe(before.philosophy);
    expect(after.buffKeys).toEqual(before.buffKeys);
  });
});
