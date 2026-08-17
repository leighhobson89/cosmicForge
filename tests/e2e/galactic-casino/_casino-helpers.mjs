/**
 * Shared setup for the Galactic Casino specs.
 *
 * The casino unlocks itself from the gameLoop the moment the `apAwardedThisRun`
 * tech is present (see galacticMarketChecks), which the debug menu's
 * "Unlock All Tabs" grants — so `prepareRunForStarshipLaunch()` is all the
 * unlock setup any spec needs.
 */

/** Boot, run the full debug scenario, top up CP and open the casino pane. */
export async function bootCasino(game, { cp = true } = {}) {
  await game.boot();
  await game.prepareRunForStarshipLaunch();
  if (cp) await game.debugClick('add10000CpButton');
  await openCasinoPane(game);
}

/** Open tab 7 and select the Galactic Casino pane through its real side-menu row. */
export async function openCasinoPane(game) {
  await game.openTab(7);
  const clicked = await game.page.evaluate(() => {
    const el = document.getElementById('galacticCasinoOption');
    if (!el) return false;
    el.closest('.row-side-menu')?.classList.remove('invisible');
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  });
  await game.page.waitForTimeout(800);
  return clicked;
}

/** Current CP balance. */
export function casinoPoints(game) {
  return game.withMods((m) => m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']));
}

/** Choose an option in one of the casino's custom dropdowns by its data-value. */
export async function selectDropdownOption(game, dropdownId, value) {
  const ok = await game.page.evaluate(({ dropdownId, value }) => {
    const option = document.querySelector(`#${dropdownId} .dropdown-option[data-value="${value}"]`);
    if (!option) return false;
    option.click();
    return true;
  }, { dropdownId, value });
  if (!ok) throw new Error(`Dropdown option ${value} not found in ${dropdownId}`);
  await game.page.waitForTimeout(300);
}

/**
 * Wait for a notification carrying the given localization key's text.
 *
 * Notifications are queued per classification and displayed one at a time, so a
 * message triggered while an earlier casino notification is still on screen
 * only appears once that one expires — up to 3.5s later. Asserting immediately
 * therefore reads the *previous* message, which is why this polls rather than
 * taking a single snapshot, and why it matches anywhere in the visible set
 * rather than at a fixed position.
 */
export async function notificationShown(game, localizationKey, timeoutMs = 8000) {
  const expected = await game.withMods(
    (m, key) => m.loc.localize(key, m.cg.getLanguage()),
    localizationKey
  );

  const deadline = Date.now() + timeoutMs;
  let all = [];
  const seen = new Set();
  do {
    all = await game.notifications();
    all.forEach((text) => seen.add(text));
    if (all.some((text) => text.includes(expected))) {
      return { expected, shown: true, all };
    }
    await game.page.waitForTimeout(250);
  } while (Date.now() < deadline);

  return { expected, shown: false, all: [...seen] };
}
