/**
 * Shared setup for the Black Hole specs.
 *
 * Everything here drives the game's own controls. The one exception is
 * discovery, which is normally a random telescope event and so is seeded — every
 * step after that point goes through a real button.
 *
 * The three upgrades and what each is meant to do:
 *
 *   Power     (#blackHoleButton2)  raises the warp multiplier
 *   Duration  (#blackHoleButton3)  lengthens how long a warp lasts
 *   Recharge  (#blackHoleButton4)  shortens the charge time between warps
 *
 * All three are bought with research points, and each purchase raises its own
 * price by the game cost multiplier.
 */

/** Open a side-menu option by id, the way a player clicks it. */
export async function openOptionById(game, optionId) {
  await game.page.evaluate((id) => {
    const el = document.getElementById(id);
    el?.closest('.row-side-menu')?.classList.remove('invisible');
    el?.classList.remove('invisible');
    el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, optionId);
  await game.page.waitForTimeout(600);
}

/** Grant research points; every black hole purchase is priced in them. */
export async function grantResearch(game, amount = 1e12) {
  await game.withMods((m, value) => m.rdo.setResourceDataObject(value, 'research', ['quantity']), amount);
}

/**
 * Reach the black hole pane with the feature discovered and plenty of research.
 */
export async function openBlackHolePane(game) {
  await game.withMods((m) => m.cg.setBlackHoleDiscovered(true));
  await game.openTab(7);
  await openOptionById(game, 'blackholeOption');
  await grantResearch(game);
  await game.page.waitForTimeout(600);
}

/**
 * Click Research, then reopen the pane.
 *
 * The three upgrade buttons are built by `drawTab7Content` inside
 * `#blackHoleUnlockedContainer`, and that only happens on a pane *draw*. Clicking
 * Research flips the container visible but does not rebuild the pane, so without
 * the reopen the buttons do not exist in the DOM at all — not merely hidden.
 */
export async function researchBlackHole(game) {
  // Dispatched for the same reason as the upgrade buttons below, though the
  // coverer here is different: `prepareRunForStarshipLaunch()` earns a run of
  // achievements, and their toasts stack over the right of the screen, which is
  // exactly where this button sits. `document.elementFromPoint()` at the
  // button's centre returns `div.notification.show.notification-achievement`, so
  // a real click - `force: true` included, since force skips the actionability
  // wait and not hit-testing - lands on the toast and the research is never
  // bought.
  await clickBlackHoleButton(game, 'blackHoleResearchButton', { settleMs: 800 });

  // Reopening the *same* pane is a no-op — the click handler short-circuits when
  // the pane is already current — so bounce off another one to force a genuine
  // redraw. Only then does the upgrade section get built.
  await openOptionById(game, 'rebirthOption');
  await openOptionById(game, 'blackholeOption');
  await game.page.waitForTimeout(800);
}

/**
 * Click a black hole button by id, and let the frame loop react.
 *
 * Note the selector: `createButton` takes the `id_blackHoleButton2` entry in its
 * classNames list and turns it into the element's **id**, so the class is gone
 * by the time the button is in the DOM. Selecting on `button.id_blackHoleButton2`
 * matches nothing at all — which reads as "the pane never built the upgrades".
 */
export async function clickBlackHoleButton(game, buttonId, { settleMs = 400 } = {}) {
  const button = game.page.locator(`#${buttonId}`).first();
  await button.waitFor({ state: 'visible', timeout: 15000 });

  // Dispatched rather than clicked. `#blackHoleButton4` is visible, enabled and
  // carries `green-ready-text`, but a real click at its coordinates never
  // reaches its handler — something in the black hole panel sits over it, and
  // even `force: true` only skips the actionability wait, not hit-testing. A
  // wrapper installed on the element counted zero invocations, which is how this
  // was distinguished from the handler early-returning. Buttons 2 and 3 happen
  // to sit clear and work either way.
  const fired = await game.page.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el) return false;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, buttonId);
  if (!fired) throw new Error(`Black hole button ${buttonId} was not in the DOM`);
  await game.page.waitForTimeout(settleMs);
}

/** The label the frame loop has painted on one of the upgrade buttons. */
export async function blackHoleButtonLabel(game, buttonId) {
  return game.page.evaluate((id) => document.getElementById(id)?.textContent ?? null, buttonId);
}
