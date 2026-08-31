/**
 * Area: Resources — the "Gain 1" button in the pane header
 * Plan: docs/player-feedback-improvement-plan.md, P14
 *
 * P14 removed the per-resource Gain option row and moved its button onto the
 * pane header line, to the right of the resource name. The row it replaced was
 * one of eight on every resource pane, so the win is vertical space; the risk is
 * that a control which used to be built by `createOptionRow` alongside the rest
 * is now built somewhere the pane's own redraw does not reach.
 *
 * That is what this file is about. Three things have to hold at once, and each
 * one fails differently:
 *
 *   1. **The row is gone and the button is there.** A pane that kept both would
 *      look fine and reclaim nothing.
 *   2. **The button still gains.** It is the same `gain(1, ...)` call, including
 *      the clamp at storage capacity, and it has to keep working from its new
 *      home — clicked as a player clicks it, not called through `withMods`.
 *   3. **The header is redrawn like the body is.** The button lives outside
 *      `#optionContentTab1`, which `updateContent` wipes wholesale on every pane
 *      change. Nothing outside that element is cleared for free, so switching
 *      from Hydrogen to Helium — or back to the tab's intro page — has to swap
 *      or drop the button rather than leaving the last pane's behind. A stale
 *      button here would gain the *wrong resource*, silently.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** The eight extractable resources, each of which gets its own header button. */
const EXTRACTABLE = ['hydrogen', 'helium', 'carbon', 'neon', 'oxygen', 'silicon', 'iron', 'sodium'];

/** Open a resource's pane by clicking its side-menu row, revealing it first. */
async function openResource(game, key) {
  const opened = await game.page.evaluate((resource) => {
    const option = document.getElementById(`${resource}Option`);
    if (!option) return false;
    option.classList.remove('invisible');
    option.closest('.row-side-menu')?.classList.remove('invisible');
    option.closest('.collapsible')?.classList.remove('invisible');
    option.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, key);
  if (!opened) throw new Error(`No side-menu row for ${key}`);
  await game.page.waitForTimeout(700);

  const pane = await game.withMods((m) => m.cg.getCurrentOptionPane());
  if (pane !== key) throw new Error(`Expected the ${key} pane to be current, got ${pane}`);
}

/** What the tab-1 pane header is currently holding. */
async function headerState(game) {
  return game.page.evaluate(() => {
    const actions = document.getElementById('headerActionsTab1');
    const buttons = actions ? Array.from(actions.querySelectorAll('button')) : [];
    return {
      containerPresent: !!actions,
      buttonIds: buttons.map((button) => button.id),
      buttonText: buttons.map((button) => (button.innerText || '').trim()),
      title: (document.getElementById('headerContentTab1')?.textContent || '').trim()
    };
  });
}

/**
 * Press the header Gain button.
 *
 * Dispatched rather than driven through the mouse, in line with the rest of the
 * suite: several tab-1 controls carry `red-disabled-text` (pointer-events: none)
 * at some point in a run. This one never does — it has no affordability gate —
 * so the dispatch is exercising the same path a real click takes.
 */
async function pressGain(game, key, times = 1) {
  for (let i = 0; i < times; i++) {
    const pressed = await game.page.evaluate((id) => {
      const button = document.getElementById(id);
      if (!button) return false;
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    }, `${key}GainButton`);
    if (!pressed) throw new Error(`No #${key}GainButton in the pane header`);
    await game.page.waitForTimeout(120);
  }
  await game.page.waitForTimeout(400);
}

/** Stock a resource and stop its autobuyers, so a press is the only thing moving it. */
async function stageStock(game, key, { quantity, capacity }) {
  await game.withMods((m, config) => {
    m.rdo.setResourceDataObject(true, 'resources', [config.key, 'revealedYet']);
    m.rdo.setResourceDataObject(config.capacity, 'resources', [config.key, 'storageCapacity']);
    m.rdo.setResourceDataObject(config.quantity, 'resources', [config.key, 'quantity']);
    for (const tier of ['tier1', 'tier2', 'tier3', 'tier4']) {
      m.rdo.setResourceDataObject(0, 'resources', [config.key, 'upgrades', 'autoBuyer', tier, 'quantity']);
    }
  }, { key, quantity, capacity });
  await game.page.waitForTimeout(300);
}

const quantityOf = (game, key) => game.withMods((m, resource) =>
  m.rdo.getResourceDataObject('resources', [resource, 'quantity']), key);

test.describe('Resources — the Gain button in the pane header', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.openTab(1);
  });

  test('every resource pane carries its own Gain button in the header, and no Gain row in the body', async ({ game }) => {
    const label = await game.withMods((m) => m.loc.localize('buttonGainOne', m.cg.getLanguage()));
    expect(label, 'the button label comes from the catalogue, not a hard-coded string').toBeTruthy();

    const problems = [];
    for (const key of EXTRACTABLE) {
      await openResource(game, key);
      const header = await headerState(game);

      if (!header.containerPresent) problems.push(`${key}: the header has no actions container`);
      if (header.buttonIds.length !== 1) problems.push(`${key}: ${header.buttonIds.length} header buttons, expected 1`);
      if (header.buttonIds[0] !== `${key}GainButton`) problems.push(`${key}: header button is #${header.buttonIds[0]}`);
      if (header.buttonText[0] !== label) problems.push(`${key}: button reads "${header.buttonText[0]}", expected "${label}"`);

      // The old row, and any option row that still holds a lone gain button.
      const bodyGain = await game.page.evaluate((resource) => {
        const content = document.getElementById('optionContentTab1');
        return {
          oldRow: !!document.getElementById(`${resource}GainRow`),
          buttonInBody: !!content?.querySelector(`#${resource}GainButton`)
        };
      }, key);
      if (bodyGain.oldRow) problems.push(`${key}: the Gain option row is still being drawn`);
      if (bodyGain.buttonInBody) problems.push(`${key}: the Gain button is inside the pane body`);
    }

    expect(problems).toEqual([]);
  });

  test('the button sits on the title line rather than above or below it', async ({ game }) => {
    // The whole point of the change is reclaimed height, so this asserts the
    // geometry rather than only the DOM position: the button's vertical span has
    // to overlap the title's, and it has to be to the right of it.
    await openResource(game, 'hydrogen');

    const geometry = await game.page.evaluate(() => {
      const title = document.getElementById('headerContentTab1')?.getBoundingClientRect();
      const button = document.getElementById('hydrogenGainButton')?.getBoundingClientRect();
      if (!title || !button) return null;
      return {
        overlapsVertically: button.top < title.bottom && title.top < button.bottom,
        toTheRight: button.left >= title.left,
        buttonVisible: button.width > 0 && button.height > 0
      };
    });

    expect(geometry).toEqual({ overlapsVertically: true, toTheRight: true, buttonVisible: true });
  });

  test('one press gains exactly one unit, and a full store refuses the press', async ({ game }) => {
    await openResource(game, 'hydrogen');
    await stageStock(game, 'hydrogen', { quantity: 10, capacity: 1000 });

    const before = await quantityOf(game, 'hydrogen');
    await pressGain(game, 'hydrogen', 5);
    const after = await quantityOf(game, 'hydrogen');

    expect(after - before, 'five presses of the header Gain button').toBe(5);

    // `gain()` clamps at capacity, so a full store must not go past it.
    await stageStock(game, 'hydrogen', { quantity: 1000, capacity: 1000 });
    await pressGain(game, 'hydrogen', 3);
    expect(await quantityOf(game, 'hydrogen'), 'a full store cannot be pushed over capacity').toBe(1000);
  });

  test('switching panes swaps the button, so a press can never gain the previous resource', async ({ game }) => {
    await openResource(game, 'hydrogen');
    await stageStock(game, 'hydrogen', { quantity: 0, capacity: 1000 });
    await stageStock(game, 'helium', { quantity: 0, capacity: 1000 });

    await openResource(game, 'helium');
    const header = await headerState(game);
    expect(header.buttonIds, "only the open pane's Gain button may be in the header")
      .toEqual(['heliumGainButton']);

    const hydrogenBefore = await quantityOf(game, 'hydrogen');
    await pressGain(game, 'helium', 3);

    expect(await quantityOf(game, 'helium'), 'the Helium button gains Helium').toBe(3);
    expect(await quantityOf(game, 'hydrogen'), 'and leaves Hydrogen alone').toBe(hydrogenBefore);
  });

  test('the tab intro page has no Gain button, and leaving the tab and returning restores exactly one', async ({ game }) => {
    // `beforeEach` has clicked tab 1 without opening a pane, so the content column
    // is the tab's intro page. It draws no resource, so it must carry no button —
    // `updateContent` returns early for the intro type, before any pane builder
    // runs, which is why the header is cleared ahead of that return.
    expect((await headerState(game)).buttonIds,
      'the intro page draws no resource, so it offers no Gain').toEqual([]);

    await openResource(game, 'hydrogen');
    expect((await headerState(game)).buttonIds).toEqual(['hydrogenGainButton']);

    // Tab 1 remembers the pane that was last open, so coming back rebuilds
    // Hydrogen — and has to rebuild the header with it, once, not twice.
    await game.openTab(2);
    await game.openTab(1);
    await game.page.waitForTimeout(900);

    expect((await headerState(game)).buttonIds,
      'returning to the tab restores one Gain button, not a second copy').toEqual(['hydrogenGainButton']);
  });
});
