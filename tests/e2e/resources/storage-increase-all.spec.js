/**
 * Area: Resources / Compounds — Increase All Storage
 * Plan: docs/player-feedback-improvement-plan.md (P5)
 *
 * A player who fills a store earns a storage increase. Before P5 the claim the
 * player actually saw lived inside a notification that times out, so looking
 * away lost it until the next notification fired or they walked to the
 * material's own pane — which is the complaint P5 exists to answer.
 *
 * The fix is a button in each sidebar header, beside Sell All, that claims every
 * increase that is currently earned. Two properties of it are worth pinning, and
 * both are asserted below:
 *
 * 1. **Eligibility is derived from state, never from a notification.** The
 *    header button is lit by the frame loop from `getIncreasableStorageKeys()`,
 *    which asks the data object which unlocked stores are standing at their cap.
 *    A notification that expired, or one that was never seen at all, cannot take
 *    a claim away — so a spec here fills a store, lets the toast die of old age,
 *    and claims it anyway.
 * 2. **Partial eligibility is the normal case.** A sweep must claim exactly the
 *    full stores and leave every partial one alone, at its own cap and its own
 *    price. The specs stage a mix and assert both halves.
 *
 * The water reservoir is the interesting corner. Enlarging it charges concrete
 * as well as water, and a full concrete store's own increase spends all but one
 * unit of it, so when both are full one press can only ever pay for one of them.
 * The sweep claims the reservoir first, by decision: that spends 30% of the
 * concrete rather than all of it, and concrete's own claim returns by itself as
 * soon as it refills. Claiming concrete first would starve the reservoir on
 * every single sweep. "the reservoir is claimed before concrete's own increase"
 * below is what holds that decision in place.
 *
 * Setup is driven from the game's own debug menu wherever it reaches — the
 * "Give 1M of all Resources and Compounds" button both unlocks and fills every
 * store, which is exactly the state this feature is about. `withMods` is used
 * only to unfill selected stores afterwards and to read state back.
 *
 * Affordability is never tested by clicking a dark button and checking nothing
 * happened: the gate in this game is the `red-disabled-text` class, whose CSS is
 * `pointer-events: none`, and dispatched clicks go straight through it. The
 * class is the assertion.
 */
import { test, expect } from '../_harness/game-fixture.mjs';


/** The extractable resources, in the order the data object declares them. */
const EXTRACTABLE = ['hydrogen', 'helium', 'carbon', 'neon', 'oxygen', 'silicon', 'iron', 'sodium'];

/** What the debug menu's "Give 1M of all Resources and Compounds" leaves behind. */
const DEBUG_FILL = 1000000;

const RESOURCES_BUTTON = 'increaseAllStorageResourcesButton';
const COMPOUNDS_BUTTON = 'increaseAllStorageCompoundsButton';


// ------------------------------------------------------------------- utilities

/**
 * Unlock and fill every store through the game's own debug button.
 *
 * This is the scenario the feature is for — every store at its cap at once — and
 * it arrives through the same click a developer uses, so the specs are not
 * describing a hand-built fiction.
 */
async function fillEverythingFromDebug(game) {
  await game.debugClick('give100AllResourcesAndCompounds');
  await game.page.waitForTimeout(800);
}

/** Quantity and capacity for every material in a category. */
async function readCategory(game, category) {
  return game.withMods((m, cat) => {
    const out = {};
    Object.keys(m.rdo.getResourceDataObject(cat) || {}).forEach((key) => {
      out[key] = {
        quantity: m.rdo.getResourceDataObject(cat, [key, 'quantity'], true),
        capacity: m.rdo.getResourceDataObject(cat, [key, 'storageCapacity'], true)
      };
    });
    return out;
  }, category);
}

/** The header button's live gate: its colour class and whether clicks can reach it. */
async function buttonGate(game, buttonId) {
  return game.page.evaluate((id) => {
    const button = document.getElementById(id);
    if (!button) return null;
    return {
      ready: button.classList.contains('green-ready-text'),
      dark: button.classList.contains('red-disabled-text'),
      pointerEvents: getComputedStyle(button).pointerEvents,
      label: (button.textContent || '').trim()
    };
  }, buttonId);
}

/**
 * Press a header button.
 *
 * Dispatched rather than really clicked, for the reason the other resource specs
 * dispatch: the button carries `red-disabled-text` (`pointer-events: none`) for
 * most of a run and a real click would be swallowed by the CSS gate instead of
 * reaching the handler. Specs that care about the gate read it with
 * `buttonGate()` above.
 */
async function pressHeaderButton(game, buttonId) {
  const found = await game.page.evaluate((id) => {
    const button = document.getElementById(id);
    if (!button) return false;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, buttonId);
  if (!found) throw new Error(`No header button #${buttonId}`);
  // The charge settles inside the click; the cap increase is a deferred job the
  // frame loop runs on its next pass.
  await game.page.waitForTimeout(900);
}

/** Open a material's pane the way a player does, by clicking its side-menu row. */
async function openMaterial(game, key, tab) {
  await game.openTab(tab);
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
}

/** Press a button inside one of a pane's option rows. */
async function clickRowButton(game, rowId) {
  const clicked = await game.page.evaluate((row) => {
    const button = document.getElementById(row)?.querySelector('button');
    if (!button) return false;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, rowId);
  if (!clicked) throw new Error(`No button inside #${rowId}`);
  await game.page.waitForTimeout(700);
}


test.describe('Increase All Storage — the header button', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('sits beside Sell All in both sidebar headers', async ({ game }) => {
    const placement = await game.page.evaluate(() => {
      const read = (sellId, increaseId) => {
        const sell = document.getElementById(sellId);
        const increase = document.getElementById(increaseId);
        return {
          present: !!increase,
          sharesHeader: !!sell && !!increase
            && sell.closest('.container-item-menu-header') === increase.closest('.container-item-menu-header'),
          isOptionButton: !!increase && increase.classList.contains('option-button')
        };
      };
      return {
        resources: read('sellAllResourcesButton', 'increaseAllStorageResourcesButton'),
        compounds: read('sellAllCompoundsButton', 'increaseAllStorageCompoundsButton')
      };
    });

    expect(placement.resources).toEqual({ present: true, sharesHeader: true, isOptionButton: true });
    expect(placement.compounds).toEqual({ present: true, sharesHeader: true, isOptionButton: true });
  });

  test('is dark on a fresh run and lights the moment a store tops out', async ({ game }) => {
    const atStart = await buttonGate(game, RESOURCES_BUTTON);
    expect(atStart.dark, 'nothing is full on a fresh run, so nothing is claimable').toBe(true);
    expect(atStart.ready).toBe(false);
    expect(atStart.pointerEvents).toBe('none');

    // Fill hydrogen by actually producing it: five tier 1 autobuyers at the
    // shipped rate is 10 hydrogen/second, and tier 1 needs no power, so this
    // runs on a fresh run with the grid down.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(150, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(110, 'resources', ['hydrogen', 'quantity']);
      m.rdo.setResourceDataObject(true, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'active']);
      m.rdo.setResourceDataObject(5, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
    });

    await expect
      .poll(async () => (await buttonGate(game, RESOURCES_BUTTON)).ready, { timeout: 30000 })
      .toBe(true);

    const lit = await buttonGate(game, RESOURCES_BUTTON);
    expect(lit.dark, 'a lit button must not still carry the disabled class').toBe(false);
    expect(lit.pointerEvents, 'and it must actually be clickable').toBe('auto');
  });

  test('goes dark again once every claim has been taken', async ({ game }) => {
    await fillEverythingFromDebug(game);

    await expect
      .poll(async () => (await buttonGate(game, RESOURCES_BUTTON)).ready, { timeout: 20000 })
      .toBe(true);

    await pressHeaderButton(game, RESOURCES_BUTTON);
    await game.page.waitForTimeout(900);

    const after = await buttonGate(game, RESOURCES_BUTTON);
    expect(after.ready, 'every store was drained by its own claim, so nothing is left').toBe(false);
    expect(after.dark).toBe(true);
    expect(after.pointerEvents).toBe('none');
  });

  test('a press with nothing earned changes nothing', async ({ game }) => {
    const before = await readCategory(game, 'resources');
    await pressHeaderButton(game, RESOURCES_BUTTON);
    const after = await readCategory(game, 'resources');

    expect(after).toEqual(before);
    expect(await game.notifications('storageIncreased'), 'and says nothing').toEqual([]);
  });
});


test.describe('Increase All Storage — resources', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('one press claims every full store: cap doubled, old cap charged', async ({ game }) => {
    await fillEverythingFromDebug(game);
    await pressHeaderButton(game, RESOURCES_BUTTON);

    const after = await readCategory(game, 'resources');

    for (const key of EXTRACTABLE) {
      expect(after[key].capacity, `${key} should have doubled`).toBe(DEBUG_FILL * 2);
      // The charge is the cap that was just outgrown, less one — the game leaves
      // a single unit behind so an upgrade cannot black out the grid.
      expect(after[key].quantity, `${key} should have paid its old cap`).toBe(1);
    }
  });

  test('partial stores are left alone, at their own cap and their own price', async ({ game }) => {
    await fillEverythingFromDebug(game);

    const partial = ['carbon', 'neon', 'sodium'];
    const full = EXTRACTABLE.filter((key) => !partial.includes(key));
    await game.withMods((m, keys) => {
      keys.forEach((key) => m.rdo.setResourceDataObject(500000, 'resources', [key, 'quantity']));
    }, partial);
    await game.page.waitForTimeout(400);

    await pressHeaderButton(game, RESOURCES_BUTTON);
    const after = await readCategory(game, 'resources');

    for (const key of full) {
      expect(after[key].capacity, `${key} was full and should have been claimed`).toBe(DEBUG_FILL * 2);
      expect(after[key].quantity).toBe(1);
    }
    for (const key of partial) {
      expect(after[key].capacity, `${key} was half full and must be untouched`).toBe(DEBUG_FILL);
      expect(after[key].quantity, `${key} must not have been charged`).toBe(500000);
    }
  });

  test('the notification names exactly the stores that were claimed', async ({ game }) => {
    await fillEverythingFromDebug(game);
    await game.withMods((m) => {
      ['carbon', 'neon', 'sodium'].forEach((key) =>
        m.rdo.setResourceDataObject(500000, 'resources', [key, 'quantity']));
    });
    await game.page.waitForTimeout(400);

    await pressHeaderButton(game, RESOURCES_BUTTON);

    // Its own classification, not 'storage': the stores just claimed each left a
    // storage-full toast in that queue, and one classification shows one
    // notification at a time, so a summary posted there would surface a minute
    // after the press instead of with it.
    const toast = (await game.notifications('storageIncreased')).join(' ');
    expect(toast, 'the summary is on screen straight away').not.toBe('');
    for (const named of ['Hydrogen', 'Helium', 'Oxygen', 'Silicon', 'Iron']) {
      expect(toast, `${named} was claimed and should be named`).toContain(named);
    }
    for (const notNamed of ['Carbon', 'Neon', 'Sodium']) {
      expect(toast, `${notNamed} was not claimed and must not be named`).not.toContain(notNamed);
    }
  });

  test('solar is never swept — it has no storage to increase', async ({ game }) => {
    await fillEverythingFromDebug(game);

    const before = await readCategory(game, 'resources');
    // The debug fill unlocks solar and leaves it at exactly its cap, which is the
    // state every other resource is claimed from. Solar has no Increase Storage
    // row and is not storage-limited, so it must be skipped rather than read as
    // permanently claimable.
    expect(before.solar.quantity).toBe(before.solar.capacity);

    await pressHeaderButton(game, RESOURCES_BUTTON);
    const after = await readCategory(game, 'resources');

    expect(after.solar.capacity, 'solar keeps its capacity').toBe(before.solar.capacity);
    expect(after.solar.quantity, 'and is never charged').toBe(before.solar.quantity);
    expect((await game.notifications('storageIncreased')).join(' ')).not.toContain('Solar');
  });

  test('a full store that is not unlocked yet is not claimed', async ({ game }) => {
    // Hydrogen is the only resource unlocked on a fresh run. Iron is filled to
    // its cap behind the game's back; a sweep must still ignore it, because the
    // player has not discovered it.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(150, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(150, 'resources', ['hydrogen', 'quantity']);
      const ironCap = m.rdo.getResourceDataObject('resources', ['iron', 'storageCapacity']);
      m.rdo.setResourceDataObject(ironCap, 'resources', ['iron', 'quantity']);
    });
    await game.page.waitForTimeout(500);

    const before = await readCategory(game, 'resources');
    await pressHeaderButton(game, RESOURCES_BUTTON);
    const after = await readCategory(game, 'resources');

    expect(after.hydrogen.capacity, 'the unlocked, full store is claimed').toBe(300);
    expect(after.iron.capacity, 'the locked one is not').toBe(before.iron.capacity);
    expect(after.iron.quantity, 'and is not charged').toBe(before.iron.quantity);
  });

  test('the resources button never touches compounds', async ({ game }) => {
    await fillEverythingFromDebug(game);

    const compoundsBefore = await readCategory(game, 'compounds');
    await pressHeaderButton(game, RESOURCES_BUTTON);
    const compoundsAfter = await readCategory(game, 'compounds');

    expect(compoundsAfter).toEqual(compoundsBefore);
  });
});


test.describe('Increase All Storage — compounds and the reservoir', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('the compounds header claims compounds', async ({ game }) => {
    await fillEverythingFromDebug(game);

    const resourcesBefore = await readCategory(game, 'resources');
    await pressHeaderButton(game, COMPOUNDS_BUTTON);
    const after = await readCategory(game, 'compounds');

    for (const key of ['diesel', 'glass', 'steel', 'titanium']) {
      expect(after[key].capacity, `${key} should have doubled`).toBe(DEBUG_FILL * 2);
      expect(after[key].quantity).toBe(1);
    }

    const resourcesAfter = await readCategory(game, 'resources');
    expect(resourcesAfter, 'and it must not touch resources').toEqual(resourcesBefore);
  });

  test("the reservoir is claimed before concrete's own increase", async ({ game }) => {
    // Both stores are full, and one press can only pay for one of them: the
    // reservoir charges 30% of the water cap in concrete, while concrete's own
    // increase spends all but one unit of the concrete store. The reservoir goes
    // first by decision — it spends 30% rather than 100%, and concrete's claim
    // comes back on its own as soon as concrete refills, whereas the reverse
    // order starves the reservoir on every sweep.
    await fillEverythingFromDebug(game);

    const before = await readCategory(game, 'compounds');
    expect(before.water.quantity).toBe(before.water.capacity);
    expect(before.concrete.quantity).toBe(before.concrete.capacity);

    await pressHeaderButton(game, COMPOUNDS_BUTTON);
    const after = await readCategory(game, 'compounds');

    expect(after.water.capacity, 'the reservoir is the one that grows').toBe(DEBUG_FILL * 2);
    expect(after.water.quantity, 'and pays its old cap in water').toBe(1);

    const concreteCharged = before.concrete.quantity - after.concrete.quantity;
    expect(concreteCharged, 'the reservoir also costs 30% of the water cap in concrete')
      .toBeCloseTo(DEBUG_FILL * 0.3, 5);
    expect(after.concrete.capacity, 'concrete keeps its own cap for now').toBe(DEBUG_FILL);
    expect(after.concrete.quantity, 'and keeps the concrete the reservoir did not spend')
      .toBeCloseTo(DEBUG_FILL * 0.7, 5);
  });

  test("concrete's own claim comes back once it refills", async ({ game }) => {
    await fillEverythingFromDebug(game);
    await pressHeaderButton(game, COMPOUNDS_BUTTON);

    const afterFirst = await readCategory(game, 'compounds');
    expect(afterFirst.concrete.capacity, 'concrete was deferred, not claimed').toBe(DEBUG_FILL);

    // Refill concrete to its cap — the only thing that was standing between it
    // and its own increase.
    await game.withMods((m, cap) => {
      m.rdo.setResourceDataObject(cap, 'compounds', ['concrete', 'quantity']);
    }, DEBUG_FILL);
    await game.page.waitForTimeout(600);

    await expect
      .poll(async () => (await buttonGate(game, COMPOUNDS_BUTTON)).ready, { timeout: 20000 })
      .toBe(true);

    await pressHeaderButton(game, COMPOUNDS_BUTTON);
    const afterSecond = await readCategory(game, 'compounds');

    expect(afterSecond.concrete.capacity, 'and now it is claimed').toBe(DEBUG_FILL * 2);
    expect(afterSecond.concrete.quantity).toBe(1);
  });

  test('a full reservoir with too little concrete is not claimed, and nothing is charged', async ({ game }) => {
    await fillEverythingFromDebug(game);
    // Empty every other compound so the reservoir is the only candidate, and
    // leave concrete just short of the 30% the reservoir needs.
    await game.withMods((m, cap) => {
      ['diesel', 'glass', 'steel', 'titanium'].forEach((key) =>
        m.rdo.setResourceDataObject(0, 'compounds', [key, 'quantity']));
      m.rdo.setResourceDataObject(cap * 0.3 - 1000, 'compounds', ['concrete', 'quantity']);
    }, DEBUG_FILL);
    await game.page.waitForTimeout(600);

    const gate = await buttonGate(game, COMPOUNDS_BUTTON);
    expect(gate.dark, 'the reservoir cannot be paid for, so there is nothing to claim').toBe(true);

    const before = await readCategory(game, 'compounds');
    await pressHeaderButton(game, COMPOUNDS_BUTTON);
    const after = await readCategory(game, 'compounds');

    expect(after.water.capacity, 'the reservoir did not grow').toBe(before.water.capacity);
    expect(after.water.quantity, 'the water was not spent').toBe(before.water.quantity);
    expect(after.concrete.quantity, 'and neither was the concrete').toBe(before.concrete.quantity);

    // Top the concrete up and the same press now works — proving the refusal was
    // the concrete cost and nothing else.
    await game.withMods((m, cap) => {
      m.rdo.setResourceDataObject(cap, 'compounds', ['concrete', 'quantity']);
    }, DEBUG_FILL);
    await game.page.waitForTimeout(600);

    await pressHeaderButton(game, COMPOUNDS_BUTTON);
    const afterTopUp = await readCategory(game, 'compounds');
    expect(afterTopUp.water.capacity).toBe(DEBUG_FILL * 2);
  });
});


test.describe('Increase All Storage — the earned claim outlives the notification', () => {
  test.setTimeout(180000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('a claim survives its storage-full notification expiring', async ({ game }) => {
    // This is the player complaint P5 answers. Fill hydrogen by producing it,
    // wait out the notification that offers the claim, and claim it anyway.
    await openMaterial(game, 'hydrogen', 1);
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(150, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(120, 'resources', ['hydrogen', 'quantity']);
      m.rdo.setResourceDataObject(true, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'active']);
      m.rdo.setResourceDataObject(5, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
    });

    const action = game.page.locator('.notification-container.classification-storage button.notification-action-button');
    await action.waitFor({ state: 'visible', timeout: 30000 });

    // The storage notification is shown for 8s. Let it die untouched.
    await action.waitFor({ state: 'detached', timeout: 30000 });

    const gate = await buttonGate(game, RESOURCES_BUTTON);
    expect(gate.ready, 'the earned claim is state, not a notification, so it is still offered').toBe(true);

    await pressHeaderButton(game, RESOURCES_BUTTON);
    const after = await readCategory(game, 'resources');
    expect(after.hydrogen.capacity, 'and it can still be claimed').toBe(300);
    expect(after.hydrogen.quantity).toBe(1);
  });

  test("the pane's own Increase Storage button still works after a sweep", async ({ game }) => {
    await fillEverythingFromDebug(game);
    await pressHeaderButton(game, RESOURCES_BUTTON);

    const afterSweep = await readCategory(game, 'resources');
    expect(afterSweep.hydrogen.capacity).toBe(DEBUG_FILL * 2);

    // Refill hydrogen to its new cap and claim the next increase the old way.
    await openMaterial(game, 'hydrogen', 1);
    await game.withMods((m, cap) => {
      m.rdo.setResourceDataObject(cap, 'resources', ['hydrogen', 'quantity']);
    }, DEBUG_FILL * 2);
    await game.page.waitForTimeout(600);

    await clickRowButton(game, 'hydrogenIncreaseStorageRow');

    const after = await readCategory(game, 'resources');
    expect(after.hydrogen.capacity, 'the per-resource control is untouched by P5').toBe(DEBUG_FILL * 4);
    expect(after.hydrogen.quantity).toBe(1);
  });

  test('the storage-full notification action still works after a sweep', async ({ game }) => {
    await fillEverythingFromDebug(game);
    await pressHeaderButton(game, RESOURCES_BUTTON);
    await game.page.waitForTimeout(600);

    // Produce hydrogen up to its new cap so the notification fires for real.
    await game.withMods((m, cap) => {
      m.rdo.setResourceDataObject(cap - 40, 'resources', ['hydrogen', 'quantity']);
      m.rdo.setResourceDataObject(true, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'active']);
      m.rdo.setResourceDataObject(5, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
    }, DEBUG_FILL * 2);

    const action = game.page.locator('.notification-container.classification-storage button.notification-action-button');
    await action.waitFor({ state: 'visible', timeout: 40000 });

    await game.page.evaluate(() => {
      document
        .querySelector('.notification-container.classification-storage button.notification-action-button')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(900);

    const after = await readCategory(game, 'resources');
    expect(after.hydrogen.capacity, 'the notification is still a working claim').toBe(DEBUG_FILL * 4);
  });

  test('a storage-full notification cannot be claimed after a sweep already claimed it', async ({ game }) => {
    // Notifications are queued one at a time per classification, so filling
    // eight stores at once leaves seven toasts waiting their turn. Each one
    // still offers a live claim when it eventually appears, long after the
    // sweep drained the store it refers to. Honouring one of those doubles the
    // cap for nothing: the charge cannot be collected from a store holding one
    // unit, but the cap increase is a deferred job that runs regardless.
    await openMaterial(game, 'hydrogen', 1);
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(150, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(120, 'resources', ['hydrogen', 'quantity']);
      m.rdo.setResourceDataObject(true, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'active']);
      m.rdo.setResourceDataObject(5, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
    });

    const action = game.page.locator('.notification-container.classification-storage button.notification-action-button');
    await action.waitFor({ state: 'visible', timeout: 30000 });

    // Stop production, then claim the increase from the header instead.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
    });
    await pressHeaderButton(game, RESOURCES_BUTTON);

    const claimed = await readCategory(game, 'resources');
    expect(claimed.hydrogen.capacity, 'the sweep took the claim').toBe(300);
    expect(claimed.hydrogen.quantity).toBe(1);

    // The toast is still on screen and still carries a button. Pressing it must
    // not hand out a second, unpaid increase.
    await game.page.evaluate(() => {
      document
        .querySelector('.notification-container.classification-storage button.notification-action-button')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(900);

    const after = await readCategory(game, 'resources');
    expect(after.hydrogen.capacity, 'a spent claim stays spent').toBe(300);
    expect(after.hydrogen.quantity, 'and nothing further is charged').toBe(1);
  });

  test('enlarging the reservoir is refused when the concrete cannot be paid', async ({ game }) => {
    // The reservoir costs concrete as well as water, and the storage-full
    // notification has always said so by disabling its own action. The pane's
    // button carries no such check, so the claim itself has to hold the rule:
    // without it the cap doubled while the concrete charge silently failed to
    // collect.
    await fillEverythingFromDebug(game);
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(10, 'compounds', ['concrete', 'quantity']);
    });
    await openMaterial(game, 'water', 4);
    await game.page.waitForTimeout(600);

    const before = await readCategory(game, 'compounds');
    await clickRowButton(game, 'waterIncreaseStorageRow');
    const after = await readCategory(game, 'compounds');

    expect(after.water.capacity, 'the reservoir does not grow on credit').toBe(before.water.capacity);
    expect(after.water.quantity, 'and the water is not taken either').toBe(before.water.quantity);
    expect(after.concrete.quantity, 'nor the concrete').toBe(before.concrete.quantity);
  });
});
