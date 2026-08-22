/**
 * Area: Localization
 * Plan: tests/docs/areas/localization.md
 *
 * `resourceDataObject` warns instead of throwing when a nested data path cannot
 * be resolved. The shared harness intentionally records errors only, so this
 * spec listens for this one warning separately: a Missing subKey warning can
 * leave a translated interaction apparently usable while silently skipping its
 * state update.
 *
 * Dialog coverage map (all are raised by their real game entry point):
 *
 *   welcome / onboarding  — startGame() -> promptOnboardingIfNeeded()
 *   technology unlock     — a Technology-pane purchase -> callPopupModal()
 *   philosophy choice     — star-study timer completion -> callPopupModal()
 *   hard-reset warning    — Settings / Game Options button -> callPopupModal()
 *   every option pane     — real tab and side-menu-link clicks after a
 *                           late-game debug setup
 *
 * The other modal families are intentionally exercised in their owning areas:
 * rebirth, diplomacy/battle, casino, market, ascendency and cosmic-rip specs.
 * They need irreversible or random scenario setup, whereas this localization
 * regression's contract is that each language can render and operate every
 * dialog mechanism without producing a missing data-path warning.
 */
import { test, expect } from '../_harness/game-fixture.mjs';
import { ALL_TABS, listOptionRows } from '../_harness/navigation.mjs';

const LANGUAGES = ['en', 'es', 'pt', 'de', 'it', 'fr'];

/** Collect just the warning under test, retaining the action that caused it. */
function captureMissingSubKeyWarnings(page) {
  const warnings = [];
  let action = 'boot';

  page.on('console', (message) => {
    const text = message.text();
    // Chromium normally classifies console.warn as "warning", but this is the
    // exact regression signal, so do not let a browser/reporter severity quirk
    // hide it. The dynamic final segment is deliberately unconstrained.
    if (/\bMissing subKey:/.test(text)) {
      warnings.push({ action, type: message.type(), text });
    }
  });

  return {
    warnings,
    during(label) { action = label; }
  };
}

async function closeVisibleModal(page, button = '#modalConfirm') {
  const closed = await page.evaluate((selector) => {
    const modal = document.getElementById('modal');
    const target = document.querySelector(selector);
    if (!modal || getComputedStyle(modal).display === 'none' || !target || target.classList.contains('invisible')) {
      return false;
    }
    target.click();
    return true;
  }, button);
  if (closed) await page.waitForTimeout(450);
  return closed;
}

async function openPaneByToken(game, tab, token) {
  await game.openTab(tab);
  const opened = await game.page.evaluate((classToken) => {
    const row = document.querySelector(`[class~="${classToken}"]`);
    if (!row) return false;
    row.classList.remove('invisible');
    row.closest('.row-side-menu')?.classList.remove('invisible');
    row.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, token);
  expect(opened, `missing side-menu entry ${token}`).toBe(true);
  await game.page.waitForTimeout(650);
}

async function triggerTechnologyUnlockDialog(game) {
  await game.debugClick('give1MResearch');
  await openPaneByToken(game, 3, 'tab3.option2');

  const clicked = await game.page.evaluate(() => {
    const button = document.querySelector('#techBasicPowerGenerationRow button');
    if (!button) return false;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  });
  expect(clicked, 'Basic Power Generation purchase button').toBe(true);
  await game.page.locator('#modalConfirm').waitFor({ state: 'visible', timeout: 15000 });
  await closeVisibleModal(game.page);
}

async function triggerPhilosophyDialog(game) {
  await game.withMods((m) => {
    m.cg.setPlayerPhilosophy(undefined);
    m.cg.setPowerOnOff(true);
    m.cg.setCurrentlySearchingAsteroid(false);
    m.cg.setCurrentlyPillagingVoid(false);
    m.cg.setStarInvestigationTimerCanContinue(true);
    m.game.startInvestigateStarTimer([400]);
  });

  // The choice is only created by the real star-study completion handler.
  await game.page.locator('#modalExtraChoice2').waitFor({ state: 'visible', timeout: 15000 });
  await closeVisibleModal(game.page);
}

async function triggerHardResetWarning(game) {
  await openPaneByToken(game, 9, 'tab9.option2');
  const clicked = await game.page.evaluate(() => {
    const button = document.querySelector('.hard-reset-button');
    if (!button) return false;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  });
  expect(clicked, 'Hard Reset All Progress button').toBe(true);
  await game.page.locator('#modalCancel').waitFor({ state: 'visible', timeout: 15000 });
  // The cancel branch is the real safe branch: confirmation deliberately
  // destroys the save and is not needed to test this dialog's data reads.
  await closeVisibleModal(game.page, '#modalCancel');
}

/**
 * Reach the same advanced UI state the other E2E areas use before walking it.
 *
 * The debug button deliberately unlocks tabs 2 and 4-7, but cosmicRip is not
 * one of its five techs. Add that real unlock-state value too, then wait for the
 * frame loop to turn tab 8 from ??? into a clickable tab before any player
 * interaction begins.
 */
async function prepareAllOptionPanes(game) {
  await game.prepareRunForStarshipLaunch();
  await game.debugClick('unlockAllTabsButton');
  await game.withMods((m) => {
    if (!m.cg.getTechUnlockedArray().includes('cosmicRip')) m.cg.setTechUnlockedArray('cosmicRip');
  });

  await game.page.waitForFunction(() =>
    Array.from(document.querySelectorAll('.tab')).every((tab) => !tab.classList.contains('tab-not-yet')),
  null, { timeout: 15000 });
}

/** Expand every available side-menu category before opening its option links. */
async function expandAvailableOptionGroups(page, tab) {
  const groups = page.locator(
    `#tab${tab}ContainerGroup .container-item-menu-body > .collapsible:not(.invisible)`
  );
  const count = await groups.count();

  for (let index = 0; index < count; index++) {
    const group = groups.nth(index);
    const content = group.locator('.collapsible-content').first();
    if (await content.evaluate((element) => !element.classList.contains('open'))) {
      await group.locator('.collapsible-header').first().click();
      await expect(content, `tab${tab} navigation category ${index} should be open`).toHaveClass(/\bopen\b/);
    }
  }
}

/**
 * Visit every pane a player can currently see, using normal Playwright clicks.
 *
 * Unlike the shared navigation helper's dispatch-based walk, this intentionally
 * exercises the actual tab and side-menu links a player presses. It never
 * clicks controls inside a pane: rendering the pane itself is the behaviour
 * under test here.
 */
async function visitEveryAvailableOptionPane(game, onBeforeOpen) {
  const visits = [];

  for (const tab of ALL_TABS) {
    await game.page.locator(`#tab${tab}`).click();
    await game.page.waitForTimeout(350);
    await expandAvailableOptionGroups(game.page, tab);

    const rows = await listOptionRows(game.page, tab);
    for (const row of rows.filter((entry) => !entry.hidden)) {
      // Most rows have an id; the three Settings links do not, so their stable
      // tabN.optionM token is the player's link identity there.
      const link = row.id
        ? game.page.locator(`#${row.id}`)
        : game.page.locator(`#tab${tab}ContainerGroup .row-side-menu p[class~="${row.token}"]`).first();

      await link.scrollIntoViewIfNeeded();
      await expect(link, `tab${tab}/${row.token} should be player-visible`).toBeVisible();
      if (onBeforeOpen) await onBeforeOpen({ tab, token: row.token, id: row.id });
      await link.click();
      await game.page.waitForTimeout(600);

      const pane = await game.withMods((m) => m.cg.getCurrentOptionPane());
      const entry = { tab, token: row.token, id: row.id, pane };
      visits.push(entry);
    }
  }

  return visits;
}

test.describe('Localization — dialogs do not warn about missing data paths', () => {
  test.describe.configure({ timeout: 240_000 });

  for (const language of LANGUAGES) {
    test(`every dialog path stays free of Missing subKey warnings in ${language}`, async ({ game, page }) => {
      // This listener must exist before boot: the welcome and onboarding dialogs
      // can render before the harness has a chance to expose game modules.
      const warningLog = captureMissingSubKeyWarnings(page);

      warningLog.during('welcome and onboarding acceptance');
      await game.boot({ language, acceptOnboarding: true });

      const supported = await game.withMods((m) => m.loc.getSupportedLanguages());
      // Playwright needs static test declarations for process isolation. Keep
      // that list honest against the runtime authority, so a newly shipped
      // language fails loudly instead of silently receiving no dialog sweep.
      expect([...supported].sort(), `supported languages reported while testing ${language}`)
        .toEqual([...LANGUAGES].sort());

      warningLog.during('technology unlock dialog');
      await triggerTechnologyUnlockDialog(game);

      warningLog.during('philosophy choice dialog');
      await triggerPhilosophyDialog(game);

      warningLog.during('hard-reset warning cancel branch');
      await triggerHardResetWarning(game);

      await page.waitForTimeout(600);
      expect(
        warningLog.warnings,
        `${language}: Missing subKey warnings by action:\n${warningLog.warnings
          .map(({ action, text }) => `  ${action}: ${text}`).join('\n')}`
      ).toEqual([]);
    });

    test(`every available option pane opens without Missing subKey warnings in ${language}`, async ({ game, page }) => {
      const warningLog = captureMissingSubKeyWarnings(page);
      warningLog.during('boot before option-pane sweep');
      // Declining onboarding leaves no tutorial overlay over the real links.
      await game.boot({ language, acceptOnboarding: false });

      const supported = await game.withMods((m) => m.loc.getSupportedLanguages());
      expect([...supported].sort(), `supported languages reported while testing ${language}`)
        .toEqual([...LANGUAGES].sort());

      // This is scenario setup only. From this point on the test uses player
      // clicks exclusively, and does not press any button inside an option pane.
      warningLog.during('late-game setup before opening every pane');
      await prepareAllOptionPanes(game);

      const visits = await visitEveryAvailableOptionPane(game, async ({ tab, token, id }) => {
        warningLog.during(`opening tab${tab}/${token} (${id ?? 'settings link'})`);
      });
      expect(visits.length, `${language}: at least one player-visible option pane should open`)
        .toBeGreaterThan(0);

      await page.waitForTimeout(600);
      expect(
        warningLog.warnings,
        `${language}: Missing subKey warnings by option pane:\n${warningLog.warnings
          .map(({ action, text }) => `  ${action}: ${text}`).join('\n')}`
      ).toEqual([]);
    });
  }
});
