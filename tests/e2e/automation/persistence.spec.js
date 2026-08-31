/**
 * Area: Automation — the settings that survive a rebirth
 * Plan: tests/docs/areas/automation.md
 *
 * P10 of the player-feedback plan, from a player reviewer:
 *
 *   "The automation settings should stay from one rebirth to the next … it gets in
 *    the way of the acceleration of rebirths when it's clear that of course, there
 *    is basically no reason to not automate once we've reached enough of an endgame
 *    that we can actually afford to buy the automation."
 *
 * ## The shape of the bug
 *
 * Every automation control in this game is a **pair**: an *ownership* flag saying
 * the player has the capability at all, and the player's own on/off (or mode)
 * choice. `resetResourceDataObjectOnRebirthAndAddApAndPermanentBuffsBack()` wipes
 * `resourceData` back to a pristine module-load snapshot and then hand-restores a
 * named list — and that list held the ownership half of each pair and none of the
 * choices. So a player who had already spent 60 AP on the two automation perks
 * still had to walk round the panes re-ticking boxes before every run.
 *
 * Three settings are in scope, and the scope is deliberate:
 *
 *   `space.upgrades.spaceTelescope.autoSpaceTelescopeEnabled`  the telescope on/off
 *   `space.upgrades.spaceTelescope.autoSpaceTelescopeMode`     asteroid / star / void
 *   `research.upgrades.autoBuyer.enabled`                      the research auto-buyer
 *
 * The mode is in scope because it is part of the same control: restoring the
 * toggle without it puts the player back on `studyAsteroid`, which is the wrong
 * job for anyone who had chosen stars.
 *
 * ## What these specs are actually guarding
 *
 * Three things, in order of how easily each would regress:
 *
 * 1. **"Persist" means "as the player left it", not "on".** A toggle switched off
 *    on purpose has to come back off. The lazy implementation — force it true when
 *    the perk is owned — passes any test that only checks the on case.
 * 2. **The setting is only inherited if the capability was.** A run without the
 *    perk must not come back with an enabled toggle for something it cannot do.
 * 3. **The automation really runs.** A restored flag that nothing reads is not a
 *    fix, so the telescope case is checked by letting the frame loop start a real
 *    scan in the new run with nothing touched by hand.
 *
 * The negative half matters as much as the positive, and the shape of it changed
 * with P9: `autoSell` and `autoCreate` were originally out of scope, and P9
 * brought both in — autosell as the `cashShare` / `compoundShare` pair that
 * replaced it, and auto-create as the candidate this file's original note
 * nominated. The final spec here now pins that they *do* survive, and — just as
 * importantly — that the exact shares the player chose come back, including a
 * material deliberately left at nothing-sold, rather than everything being
 * forced to some default because the perk is owned.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

// A rebirth-ready run plus the real rebirth flow is not quick, and several of
// these play two runs.
test.describe.configure({ timeout: 420_000 });

/** The three settings in scope, and the flag each one's survival depends on. */
const PERSISTED = {
  telescopeEnabled: {
    section: 'space',
    path: ['upgrades', 'spaceTelescope', 'autoSpaceTelescopeEnabled'],
    fresh: false
  },
  telescopeMode: {
    section: 'space',
    path: ['upgrades', 'spaceTelescope', 'autoSpaceTelescopeMode'],
    fresh: 'studyAsteroid'
  },
  researchEnabled: {
    section: 'research',
    path: ['upgrades', 'autoBuyer', 'enabled'],
    fresh: false
  }
};

// ---------------------------------------------------------------------- helpers

/** Close whatever modal is currently up, so the next click lands where intended. */
async function dismissAnyOpenModal(page, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
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

/** Open a side-menu option by id, revealing its row first. */
async function openOptionById(game, optionId, tab = null) {
  if (tab !== null) await game.openTab(tab);
  const found = await game.page.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el) return false;
    el.closest('.row-side-menu')?.classList.remove('invisible');
    el.classList.remove('invisible');
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, optionId);
  if (!found) throw new Error(`No side-menu row with id ${optionId}`);
  await game.page.waitForTimeout(700);
  return found;
}

/** Read the three settings, plus the ownership flags they hang off. */
async function readAutomation(game) {
  return game.withMods((m, paths) => {
    const read = (entry) => m.rdo.getResourceDataObject(entry.section, entry.path, true);
    return {
      telescopeEnabled: read(paths.telescopeEnabled),
      telescopeMode: read(paths.telescopeMode),
      researchEnabled: read(paths.researchEnabled),
      telescopeOwned: !!m.rdo.getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'autoSpaceTelescopeRowEnabled'], true),
      researchOwned: !!m.rdo.getResourceDataObject('research', ['upgrades', 'autoBuyer', 'active'], true),
      telescopeBuilt: !!m.rdo.getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'spaceTelescopeBoughtYet'], true)
    };
  }, PERSISTED);
}

/** Grant AP through the debug menu's own button — the game's sanctioned route. */
async function grantAp(game) {
  await game.openDebugMenu();
  await game.debugClick('add100ApButton');
  await game.page.waitForTimeout(300);
}

/** Buy one perk by pressing its own button on the Ascendency Perks pane. */
async function buyPerk(game, key) {
  await openOptionById(game, 'ascendencyOption', 7);
  const pane = await game.withMods((m) => m.cg.getCurrentOptionPane());
  expect(pane, 'the perk buttons are only maintained while their pane is open')
    .toBe('ascendency perks');
  await game.page.waitForTimeout(600);

  const token = key.replace(/([A-Z])/g, '-$1').toLowerCase();
  const pressed = await game.page.evaluate((selector) => {
    const button = document.querySelector(selector);
    if (!button) return false;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, `button.ascendency-buff-button.buff-class-${token}`);
  if (!pressed) throw new Error(`No Buy button for the ${key} perk`);
  await game.page.waitForTimeout(700);

  const owned = await game.withMods((m, k) => m.rdo.getAscendencyBuffDataObject()[k].boughtYet, key);
  expect(owned, `${key} should have been bought`).toBeGreaterThan(0);
}

/** Flip the telescope automation toggle, through the control on the pane. */
async function setTelescopeAutomation(game, on) {
  await openOptionById(game, 'spaceTelescopeOption', 6);
  const flipped = await game.page.evaluate((wanted) => {
    const toggle = document.querySelector('#spaceTelescopeAutoRow #autoTelescopeToggle');
    if (!toggle) return null;
    if (toggle.checked !== wanted) toggle.click();
    return toggle.checked;
  }, on);
  if (flipped === null) throw new Error('The telescope automation row was not on the pane');
  await game.page.waitForTimeout(400);
  return flipped;
}

/** Choose a telescope mode from the real dropdown. */
async function setTelescopeMode(game, mode) {
  const chosen = await game.page.evaluate((wanted) => {
    const option = document.querySelector(
      `#autoSpaceTelescopeModeDropdown .dropdown-option[data-value="${wanted}"]`
    );
    if (!option) return false;
    option.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, mode);
  if (!chosen) throw new Error(`The telescope dropdown has no ${mode} option`);
  await game.page.waitForTimeout(400);
}

/** Flip the research auto-buyer toggle, through the control on the pane. */
async function setResearchAutomation(game, on) {
  await openOptionById(game, 'researchOption', 3);
  const flipped = await game.page.evaluate((wanted) => {
    const row = document.getElementById('researchAutoBuyerRow');
    if (!row) return null;
    // The frame loop reveals the row once the perk is owned; a spec that clicked
    // before that frame would be clicking a hidden control.
    if (row.classList.contains('invisible')) return 'hidden';
    const toggle = row.querySelector('#scienceAutoBuyerToggle');
    if (!toggle) return null;
    if (toggle.checked !== wanted) toggle.click();
    return toggle.checked;
  }, on);
  if (flipped === null) throw new Error('The research auto-buyer row was not on the pane');
  if (flipped === 'hidden') throw new Error('The research auto-buyer row is still hidden');
  await game.page.waitForTimeout(400);
  return flipped;
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

/** Press Rebirth and confirm — the player's own route through the reset. */
async function rebirthThroughTheUI(game, page) {
  await dismissAnyOpenModal(page);
  await openOptionById(game, 'rebirthOption', 7);

  const state = await page.evaluate(() => {
    const button = document.querySelector('.rebirth-check');
    return button ? { disabled: button.disabled, ready: button.classList.contains('green-ready-text') } : null;
  });
  expect(state, 'the Rebirth pane should expose its button').not.toBeNull();
  expect(state.disabled, 'the run should have earned a completable rebirth by now').toBe(false);

  const runBefore = await game.withMods((m) => m.cg.getStatRun());
  const confirmLabel = await game.withMods((m) =>
    m.loc.localize('modalRebirthConfirmLabel', m.cg.getLanguage()));

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

/** Stock the run and earn the rebirth, without touching any automation. */
async function playRunToRebirthReady(game, page, destination = 'vega') {
  await game.boot();
  await game.prepareRunForStarshipLaunch();
  await dismissAnyOpenModal(page);
  await scanDestinationSystem(game, destination);
  // `rebirthChecks()` turns a won battle into `rebirthPossible` on the frame
  // loop; that is what the Rebirth button reads.
  await game.withMods((m) => m.cg.setBattleResolved(true, 'player'));
  await game.page.waitForTimeout(600);
}

/**
 * A run that owns both automation perks, with every control set as asked.
 *
 * The perks are bought through the perk pane and the controls flipped through
 * their own switches, so what is being tested afterwards is the state the game
 * itself wrote, not state a spec poked into the data object.
 */
async function runWithAutomation(game, page, { telescope, mode, research }) {
  await playRunToRebirthReady(game, page);
  await grantAp(game);
  await buyPerk(game, 'autoSpaceTelescope');
  await buyPerk(game, 'roboticResearchAutomation');
  await dismissAnyOpenModal(page);

  await setTelescopeAutomation(game, telescope);
  if (mode) await setTelescopeMode(game, mode);
  await setResearchAutomation(game, research);

  const before = await readAutomation(game);
  expect(before.telescopeOwned, 'the telescope perk should be owned').toBe(true);
  expect(before.researchOwned, 'the research perk should be owned').toBe(true);
  expect(before.telescopeEnabled, 'the telescope toggle should be as asked').toBe(telescope);
  expect(before.researchEnabled, 'the research toggle should be as asked').toBe(research);
  if (mode) expect(before.telescopeMode, 'the mode should be as chosen').toBe(mode);
  return before;
}

// ============================================================ the three settings

test.describe('Automation — the settings a player already paid for', () => {
  test('the telescope automation, its mode and the research auto-buyer all survive a rebirth', async ({ game, page }) => {
    const before = await runWithAutomation(game, page, {
      telescope: true,
      mode: 'studyStars',
      research: true
    });

    await rebirthThroughTheUI(game, page);
    const after = await readAutomation(game);

    expect(after.telescopeOwned, 'the perk is still owned, as it always was').toBe(true);
    expect(after.researchOwned, 'and so is the research one').toBe(true);

    expect(after.telescopeEnabled, 'the telescope automation is still on').toBe(true);
    expect(after.researchEnabled, 'the research auto-buyer is still on').toBe(true);
    expect(after.telescopeMode, 'and it is still pointed at the job the player chose')
      .toBe('studyStars');

    // The mode is the half that a fix aimed only at the on/off switch would miss.
    expect(after.telescopeMode, 'not silently back on the default')
      .not.toBe(PERSISTED.telescopeMode.fresh);
    expect(after).toMatchObject({
      telescopeEnabled: before.telescopeEnabled,
      telescopeMode: before.telescopeMode,
      researchEnabled: before.researchEnabled
    });
  });

  test('a setting the player deliberately turned off comes back off', async ({ game, page }) => {
    // "Persist" has to mean "as the player left it". Forcing the toggles true
    // whenever the perk is owned would pass the test above and fail here, and it
    // would take away a choice the player made on purpose.
    await runWithAutomation(game, page, {
      telescope: false,
      mode: 'studyStars',
      research: false
    });

    await rebirthThroughTheUI(game, page);
    const after = await readAutomation(game);

    expect(after.telescopeOwned, 'the capability is still owned').toBe(true);
    expect(after.researchOwned).toBe(true);
    expect(after.telescopeEnabled, 'but the telescope was left off, so it stays off').toBe(false);
    expect(after.researchEnabled, 'and so does the research auto-buyer').toBe(false);
    expect(after.telescopeMode, 'the mode is still remembered either way').toBe('studyStars');
  });

  test('the restored controls are what the panes redraw with', async ({ game, page }) => {
    // The data object surviving is only half of it: the toggle and the dropdown
    // take their state from it at draw time, so a player opening the pane in the
    // new run has to see the automation already on.
    await runWithAutomation(game, page, {
      telescope: true,
      mode: 'studyStars',
      research: true
    });

    await rebirthThroughTheUI(game, page);

    // The telescope itself is a per-run purchase, so put one back the way the
    // debug setup does before its pane can show the automation row again.
    await game.prepareRunForStarshipLaunch();
    await dismissAnyOpenModal(page);

    await openOptionById(game, 'spaceTelescopeOption', 6);
    const telescopeRow = await page.evaluate(() => {
      const row = document.getElementById('spaceTelescopeAutoRow');
      if (!row) return null;
      return {
        toggled: !!row.querySelector('#autoTelescopeToggle')?.checked,
        mode: row.querySelector('#autoSpaceTelescopeModeDropdown .dropdown-text')?.getAttribute('data-value') ?? null
      };
    });
    expect(telescopeRow, 'the automation row should be drawn again').not.toBeNull();
    expect(telescopeRow.toggled, 'drawn already switched on').toBe(true);
    expect(telescopeRow.mode, 'and already on the chosen mode').toBe('studyStars');

    await openOptionById(game, 'researchOption', 3);
    await page.waitForTimeout(600);
    const researchToggled = await page.evaluate(() =>
      !!document.querySelector('#researchAutoBuyerRow #scienceAutoBuyerToggle')?.checked);
    expect(researchToggled, 'and the research toggle is drawn switched on too').toBe(true);
  });

  test('the telescope automation actually runs in the new run, untouched', async ({ game, page }) => {
    // A restored flag nothing reads is not a fix, so this one waits for the work
    // itself. `checkAndStartAutoTelescopeAction()` on the frame loop needs four
    // things: the perk owned, the toggle on, a telescope built, and power. The
    // first two are what the rebirth now carries across; the last two are per-run
    // and are put back here the way a player would, which is the point — the
    // player rebuilds their telescope and never touches the automation switch.
    await runWithAutomation(game, page, {
      telescope: true,
      mode: 'studyStars',
      research: true
    });

    await rebirthThroughTheUI(game, page);
    await game.prepareRunForStarshipLaunch();
    await dismissAnyOpenModal(page);
    await game.withMods((m) => {
      // Every telescope action draws power, and a run this young has no grid.
      m.cg.setInfinitePower(true);
      m.cg.setPowerOnOff(true);
    });

    const scanning = await page.waitForFunction(
      () => globalThis.__mods.cg.getCurrentlyInvestigatingStar() === true,
      undefined,
      { timeout: 30000 }
    ).then(() => true).catch(() => false);

    expect(scanning, 'a star study should have started on its own, with nothing clicked')
      .toBe(true);

    // And the *right* job: `studyStars` is what was chosen before the rebirth, so
    // an asteroid scan here would mean the mode was lost even though the switch
    // survived.
    const running = await game.withMods((m) => ({
      investigating: m.cg.getCurrentlyInvestigatingStar(),
      searchingAsteroid: m.cg.getCurrentlySearchingAsteroid()
    }));
    expect(running.investigating, 'studying a star, as chosen').toBe(true);
    expect(running.searchingAsteroid, 'not scanning asteroids, the default it did not revert to')
      .toBe(false);
  });

  test('the research auto-buyer actually buys in the new run, untouched', async ({ game, page }) => {
    // The same argument as the telescope, for the other control: prove the work
    // happens rather than that a boolean reads true. `handleResearchAutoBuyer()`
    // spends on the cheapest affordable tech whose prerequisites are met, and a
    // fresh run has its whole tech tree to get through, so a run with research
    // banked and the toggle inherited should start unlocking on its own.
    await runWithAutomation(game, page, {
      telescope: false,
      mode: 'studyStars',
      research: true
    });

    const newRun = await rebirthThroughTheUI(game, page);
    expect(newRun, 'the rebirth should have advanced the run counter').toBeGreaterThan(1);

    const startingTechs = await game.withMods((m) => {
      // Rebirth leaves the run with almost no research; bank enough for the
      // opening techs so the auto-buyer has something it can afford.
      m.rdo.setResourceDataObject(50000, 'research', ['quantity']);
      return m.cg.getTechUnlockedArray().length;
    });

    const bought = await page.waitForFunction(
      (before) => globalThis.__mods.cg.getTechUnlockedArray().length > before,
      startingTechs,
      { timeout: 30000 }
    ).then(() => true).catch(() => false);

    expect(bought, 'a tech should have been researched with nothing clicked').toBe(true);
    expect(await game.withMods((m) => m.rdo.getResourceDataObject('research', ['upgrades', 'autoBuyer', 'enabled'])),
      'and the toggle is still the one the player left on').toBe(true);
  });
});

// =========================================================== the negative half

test.describe('Automation — what must not be inherited', () => {
  test('a run that never bought the perks comes back with nothing enabled', async ({ game, page }) => {
    await playRunToRebirthReady(game, page);

    const before = await readAutomation(game);
    expect(before.telescopeOwned, 'no telescope perk in this run').toBe(false);
    expect(before.researchOwned, 'and no research perk').toBe(false);

    // Force the settings on behind the game's back, which is the state a
    // corrupted or hand-edited save could arrive in. The owner-gate is what has
    // to refuse them, not the fact that a player could not have set them.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(true, 'space', ['upgrades', 'spaceTelescope', 'autoSpaceTelescopeEnabled']);
      m.rdo.setResourceDataObject(true, 'research', ['upgrades', 'autoBuyer', 'enabled']);
    });

    await rebirthThroughTheUI(game, page);
    const after = await readAutomation(game);

    expect(after.telescopeOwned, 'still unowned').toBe(false);
    expect(after.researchOwned).toBe(false);
    expect(after.telescopeEnabled, 'so the telescope setting is not carried across').toBe(false);
    expect(after.researchEnabled, 'nor the research one').toBe(false);
  });

  test('the P9 allocation settings and auto-create now survive too', async ({ game, page }) => {
    // P10 left `autoSell` and `autoCreate` out of scope; P9 brought both in, on
    // the grounds the original note gave for the candidates it did carry - the
    // capability behind them is permanent, so making the player re-tune fourteen
    // splits every run is the same friction P10 set out to remove.
    //
    // Distinctive values, not just "on": the lazy implementation - force
    // everything true when the perk is owned - passes any test that only checks
    // the on case, exactly as the telescope specs above are careful about.
    await playRunToRebirthReady(game, page);

    await game.withMods((m) => {
      m.rdo.setResourceDataObject(35, 'resources', ['hydrogen', 'cashShare']);
      m.rdo.setResourceDataObject(25, 'resources', ['hydrogen', 'compoundShare']);
      // One deliberately left selling nothing. With the autosell toggle gone
      // that is what "off" means, so it has to come back as chosen rather than
      // being reset to some default because the perk is owned.
      m.rdo.setResourceDataObject(0, 'resources', ['iron', 'cashShare']);
      m.rdo.setResourceDataObject(80, 'resources', ['iron', 'compoundShare']);
      m.rdo.setResourceDataObject(true, 'compounds', ['diesel', 'autoCreate']);
      // A machine switched off by hand, to prove the tier flags are not swept up.
      m.rdo.setResourceDataObject(false, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier2', 'active']);
    });

    await rebirthThroughTheUI(game, page);

    const after = await game.withMods((m) => ({
      hydrogenCash: m.rdo.getResourceDataObject('resources', ['hydrogen', 'cashShare'], true),
      hydrogenCompound: m.rdo.getResourceDataObject('resources', ['hydrogen', 'compoundShare'], true),
      ironCash: m.rdo.getResourceDataObject('resources', ['iron', 'cashShare'], true),
      ironCompound: m.rdo.getResourceDataObject('resources', ['iron', 'compoundShare'], true),
      compoundAutoCreate: m.rdo.getResourceDataObject('compounds', ['diesel', 'autoCreate'], true),
      tier2Active: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier2', 'active'], true)
    }));

    expect(after.hydrogenCash, 'the exact cash share the player set comes back').toBe(35);
    expect(after.hydrogenCompound, 'and the exact compound share').toBe(25);
    expect(after.ironCash, 'a material set to sell nothing comes back selling nothing').toBe(0);
    expect(after.ironCompound, 'with the compound band it was left at').toBe(80);
    expect(after.compoundAutoCreate, 'auto-create is carried now, as P10 anticipated it would be').toBe(true);
    expect(after.tier2Active, 'and an autobuyer tier comes back on, its own default').toBe(true);
  });
});
