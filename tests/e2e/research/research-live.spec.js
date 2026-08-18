/**
 * Area: Research — played through the Research pane
 * Plan: tests/docs/areas/research.md
 *
 * `research.spec.js` covers the catalogue: what the three buildings cost, how the
 * rate formula adds up, and that the tech data is internally consistent. It does
 * all of that by reading the data object.
 *
 * This file buys the buildings. Every purchase here goes through the row's own
 * button in the Research pane, every unlock is earned by researching the tech
 * that grants it in the Technology pane, and every claim about *rate* is settled
 * by measuring how much research the pool actually gained over a wall-clock
 * window — not by reading `research.rate` back.
 *
 * The rules being pinned, in the order they matter to a player:
 *
 *   1. A building costs **cash**, not research points. The row's cost label says
 *      `$5`, the purchase deducts from `currency.cash`, and the price escalates
 *      afterwards.
 *   2. Two of the three buildings are **locked behind techs** — the Science Club
 *      behind Knowledge Sharing, the Science Lab behind Science Laboratories —
 *      so the only honest way to reach them is to research the tech first.
 *   3. Only the **Science Lab draws power** (`energyUse: 0.35`). Building labs
 *      raises total consumption; building kits does not. With the grid down the
 *      labs stop contributing and the kits and clubs carry on, which is a
 *      collapse in throughput a player feels rather than a flag they can read.
 *   4. The **research autobuyer** does not exist until the Robotic Research
 *      Automation ascendency perk is bought, and once enabled it spends the pool
 *      on techs by itself.
 *
 * One measurement note. `#researchRate` carries the `notation` class, so the
 * frame loop reformats it and rounds: a true rate of 0.5/s is displayed as
 * `1 / s`. Any assertion comparing the display against the truth therefore
 * stages enough buildings that the rounding is a rounding error and not the
 * whole signal.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe.configure({ timeout: 180_000 });

// --------------------------------------------------------------------- helpers

/** Open a side-menu pane by its option id, the way a player clicks it. */
async function openPaneById(game, optionId) {
  await game.page.evaluate((id) => {
    const el = document.getElementById(id);
    el?.closest('.row-side-menu')?.classList.remove('invisible');
    el?.classList.remove('invisible');
    el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, optionId);
  await game.page.waitForTimeout(600);
}

async function openResearchPane(game) {
  await game.openTab(3);
  await openPaneById(game, 'researchOption');
}

async function openTechnologyPane(game) {
  await game.openTab(3);
  await openPaneById(game, 'technologyOption');
}

/**
 * Press the purchase button inside an option row.
 *
 * Dispatched rather than clicked for the reason the energy specs give: several
 * of these controls sit under another element in the panel, so a real click at
 * their coordinates lands on the coverer. Dispatching also bypasses the CSS
 * affordability gate, which is why the gate itself is asserted separately by
 * reading the class rather than by clicking and hoping nothing happens.
 */
async function clickRowButton(game, rowId) {
  const fired = await game.page.evaluate((id) => {
    const button = document.querySelector(`#${id} button`);
    if (!button) return false;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, rowId);
  if (!fired) throw new Error(`No button inside row ${rowId}`);
  await game.page.waitForTimeout(300);
}

/** Visibility and button state of an option row, as the pane currently shows it. */
async function rowState(game, rowId) {
  return game.page.evaluate((id) => {
    const row = document.getElementById(id);
    if (!row) return { present: false };
    const button = row.querySelector('button');
    const cost = row.querySelector('.description-container label');
    return {
      present: true,
      hidden: row.classList.contains('invisible'),
      buttonClasses: button ? Array.from(button.classList) : null,
      costText: cost?.textContent?.trim() ?? null
    };
  }, rowId);
}

/** Everything the research economy exposes, read in one frame. */
async function readResearch(game) {
  return game.withMods((m) => ({
    cash: m.rdo.getResourceDataObject('currency', ['cash']),
    quantity: m.rdo.getResourceDataObject('research', ['quantity']),
    kit: m.rdo.getResourceDataObject('research', ['upgrades', 'scienceKit', 'quantity']),
    club: m.rdo.getResourceDataObject('research', ['upgrades', 'scienceClub', 'quantity']),
    lab: m.rdo.getResourceDataObject('research', ['upgrades', 'scienceLab', 'quantity']),
    kitPrice: m.rdo.getResourceDataObject('research', ['upgrades', 'scienceKit', 'price']),
    energyUse: m.cg.getTotalEnergyUse(),
    powerOn: m.cg.getPowerOnOff()
  }));
}

/**
 * Research actually added to the pool per real second.
 *
 * The pool is the only honest measure of the rate: `research.rate` is a field the
 * purchase handler writes, and would keep reporting a healthy number if the
 * accrual timer stopped running altogether.
 */
async function measureResearchPerSecond(game, windowMs = 3000) {
  const start = await game.withMods((m) => ({
    q: m.rdo.getResourceDataObject('research', ['quantity']),
    t: Date.now()
  }));
  await game.page.waitForTimeout(windowMs);
  const end = await game.withMods((m) => ({
    q: m.rdo.getResourceDataObject('research', ['quantity']),
    t: Date.now()
  }));
  return (end.q - start.q) / ((end.t - start.t) / 1000);
}

/** Dismiss the run-1 popup several techs raise, which would swallow later clicks. */
async function dismissPopup(game) {
  await game.page.evaluate(() => {
    const confirm = document.getElementById('modalConfirm');
    if (confirm?.offsetParent) confirm.click();
  });
  await game.page.waitForTimeout(400);
}

/** Buy a tech through its row in the Technology pane, funded by the debug menu. */
async function researchTech(game, techKey) {
  await game.debugClick('give1MResearch');
  await openTechnologyPane(game);
  const rowId = `tech${techKey.charAt(0).toUpperCase()}${techKey.slice(1)}Row`;
  await clickRowButton(game, rowId);
  await game.page.waitForTimeout(600);
  const unlocked = await game.withMods((m, key) => m.cg.getTechUnlockedArray().includes(key), techKey);
  if (!unlocked) throw new Error(`${techKey} did not unlock through ${rowId}`);
  await dismissPopup(game);
}

/** Buy `count` of a building through its row, returning what each one cost. */
async function buyBuilding(game, rowId, upgradeKey, count = 1) {
  const spent = [];
  for (let i = 0; i < count; i++) {
    const before = await game.withMods((m, key) => ({
      cash: m.rdo.getResourceDataObject('currency', ['cash']),
      price: m.rdo.getResourceDataObject('research', ['upgrades', key, 'price'])
    }), upgradeKey);
    await clickRowButton(game, rowId);
    const after = await game.withMods((m) => m.rdo.getResourceDataObject('currency', ['cash']));
    spent.push({ price: before.price, deducted: before.cash - after });
  }
  return spent;
}

// ------------------------------------------------------------------ the specs

test.describe('Research — buildings bought through their own buttons', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.debugClick('give1BButton');
    await openResearchPane(game);
  });

  test('buying a Science Kit charges its advertised price in cash and adds one building', async ({ game }) => {
    const before = await readResearch(game);
    const rowBefore = await rowState(game, 'researchScienceKitRow');

    // The row advertises a cash cost, and the deduction has to match it. A
    // building that quietly charged research points instead would still leave
    // the quantity looking right.
    expect(rowBefore.hidden, 'the Science Kit is the one building available from the start').toBe(false);
    expect(rowBefore.costText).toContain('$');

    const [purchase] = await buyBuilding(game, 'researchScienceKitRow', 'scienceKit');
    const after = await readResearch(game);

    expect(purchase.deducted).toBeCloseTo(purchase.price, 6);
    expect(after.kit).toBe(before.kit + 1);
    expect(after.kitPrice, 'the next kit must cost more than the one just bought')
      .toBeGreaterThan(before.kitPrice);
  });

  test('each kit bought raises the research the pool actually gains per second', async ({ game }) => {
    const idle = await measureResearchPerSecond(game, 1500);
    expect(idle, 'a fresh run has no research buildings, so nothing accrues').toBeCloseTo(0, 5);

    await buyBuilding(game, 'researchScienceKitRow', 'scienceKit', 10);
    const withTen = await measureResearchPerSecond(game, 3000);

    await buyBuilding(game, 'researchScienceKitRow', 'scienceKit', 10);
    const withTwenty = await measureResearchPerSecond(game, 3000);

    // scienceKit is 0.005 per tick and the tick is 10ms, so one kit is 0.5/s:
    // ten of them make 5/s and twenty make 10/s. Measured against the pool, not
    // read off the rate field.
    expect(withTen).toBeGreaterThan(4);
    expect(withTen).toBeLessThan(6);
    expect(withTwenty).toBeGreaterThan(withTen * 1.7);
    expect(withTwenty).toBeLessThan(12);
  });

  test('the displayed rate agrees with the rate the pool is really gaining', async ({ game }) => {
    // 40 kits make 20/s, far enough above the notation rounding step that the
    // display and the measurement have to agree to be meaningful.
    await buyBuilding(game, 'researchScienceKitRow', 'scienceKit', 40);
    await game.page.waitForTimeout(600);

    const measured = await measureResearchPerSecond(game, 4000);
    const text = await game.page.locator('#researchRate').textContent();

    expect(text).toBeTruthy();
    expect(text).not.toContain('NaN');
    expect(text).not.toContain('undefined');
    expect(text, 'the side menu shows the rate as "<n> / s"').toMatch(/[\d.]+\s*\/\s*s/);

    const displayed = Number(String(text).replace(/[^\d.]/g, ''));
    expect(displayed).toBeCloseTo(measured, 0);
  });

  test('a building the player cannot afford is gated by its colour class', async ({ game }) => {
    // Affordability in this game is enforced by `red-disabled-text`, whose CSS
    // is `pointer-events: none`. Asserting the class is asserting the gate;
    // dispatching a click at the button would bypass it by design.
    await game.withMods((m) => m.rdo.setResourceDataObject(0, 'currency', ['cash']));
    await game.page.waitForTimeout(700);

    const broke = await rowState(game, 'researchScienceKitRow');
    expect(broke.buttonClasses).toContain('red-disabled-text');

    await game.debugClick('give1BButton');
    await game.page.waitForTimeout(700);

    const rich = await rowState(game, 'researchScienceKitRow');
    expect(rich.buttonClasses).not.toContain('red-disabled-text');
  });
});

test.describe('Research — buildings locked behind techs', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.debugClick('give1BButton');
  });

  test('the Science Club appears only once Knowledge Sharing is researched, and then works', async ({ game }) => {
    await openResearchPane(game);
    const locked = await rowState(game, 'researchScienceClubRow');
    expect(locked.present, 'the row is built up front and hidden, not omitted').toBe(true);
    expect(locked.hidden, 'no Knowledge Sharing yet, so no Science Club').toBe(true);

    await researchTech(game, 'knowledgeSharing');

    await openResearchPane(game);
    await game.page.waitForTimeout(700);
    const unlocked = await rowState(game, 'researchScienceClubRow');
    expect(unlocked.hidden, 'Knowledge Sharing is what opens the Science Club').toBe(false);

    const before = await readResearch(game);
    const [purchase] = await buyBuilding(game, 'researchScienceClubRow', 'scienceClub');
    const after = await readResearch(game);

    expect(after.club).toBe(before.club + 1);
    expect(purchase.deducted).toBeCloseTo(purchase.price, 6);
  });

  test('the Science Lab appears only once Science Laboratories is researched, and then works', async ({ game }) => {
    await openResearchPane(game);
    expect((await rowState(game, 'researchScienceLabRow')).hidden).toBe(true);

    await researchTech(game, 'scienceLaboratories');

    await openResearchPane(game);
    await game.page.waitForTimeout(700);
    expect((await rowState(game, 'researchScienceLabRow')).hidden).toBe(false);

    const before = await readResearch(game);
    const [purchase] = await buyBuilding(game, 'researchScienceLabRow', 'scienceLab');
    const after = await readResearch(game);

    expect(after.lab).toBe(before.lab + 1);
    expect(purchase.deducted).toBeCloseTo(purchase.price, 6);
  });
});

test.describe('Research — the power the buildings draw', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.debugClick('give1BButton');
    await researchTech(game, 'scienceLaboratories');
    await openResearchPane(game);
  });

  test('kits draw no power and labs do, measured on the grid consumption figure', async ({ game }) => {
    const start = await readResearch(game);

    await buyBuilding(game, 'researchScienceKitRow', 'scienceKit', 5);
    await game.page.waitForTimeout(700);
    const afterKits = await readResearch(game);
    expect(afterKits.energyUse, 'five Science Kits are free to run')
      .toBeCloseTo(start.energyUse, 6);

    await buyBuilding(game, 'researchScienceLabRow', 'scienceLab', 3);
    await game.page.waitForTimeout(700);
    const afterLabs = await readResearch(game);

    // energyUse is 0.35 per lab, so three of them add 1.05 to consumption.
    expect(afterLabs.energyUse - afterKits.energyUse).toBeCloseTo(1.05, 4);
  });

  test('switching a lab off through its toggle stops it drawing power', async ({ game }) => {
    await buyBuilding(game, 'researchScienceLabRow', 'scienceLab', 4);
    await game.page.waitForTimeout(700);
    const running = await readResearch(game);
    expect(running.energyUse).toBeGreaterThan(0);

    // The toggle is a real checkbox with a change handler; flip it the way the
    // label click does.
    await game.page.evaluate(() => {
      const toggle = document.getElementById('scienceLabToggle');
      toggle.checked = false;
      toggle.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await game.page.waitForTimeout(800);

    const idle = await readResearch(game);
    expect(idle.energyUse, 'an inactive lab consumes nothing').toBeCloseTo(0, 4);
  });

  test('with the grid down the labs stop producing and the kits carry on', async ({ game }) => {
    // Both halves of the rule in one run: this is the difference between "the
    // power flag flipped" and "the player's research rate collapsed".
    await buyBuilding(game, 'researchScienceKitRow', 'scienceKit', 40);
    await buyBuilding(game, 'researchScienceLabRow', 'scienceLab', 10);
    await game.withMods((m) => m.cg.setPowerOnOff(true));
    await game.page.waitForTimeout(700);

    const powered = await measureResearchPerSecond(game, 4000);

    await game.withMods((m) => m.cg.setPowerOnOff(false));
    await game.page.waitForTimeout(700);
    const unpowered = await measureResearchPerSecond(game, 4000);

    // 40 kits are 0.2 per tick, which is 20/s. 10 labs are 2 per tick, which is
    // 200/s. Powered is therefore ~220/s and unpowered ~20/s — the kits alone.
    expect(powered).toBeGreaterThan(100);
    expect(unpowered).toBeGreaterThan(15);
    expect(unpowered).toBeLessThan(25);
    expect(unpowered).toBeLessThan(powered / 5);
  });
});

test.describe('Research — the autobuyer earned from an ascendency perk', () => {
  test('the perk reveals the row, and the enabled autobuyer researches techs on its own', async ({ game }) => {
    await game.boot();
    await game.debugClick('give1BButton');

    await openResearchPane(game);
    expect((await rowState(game, 'researchAutoBuyerRow')).hidden,
      'without the perk there is no research autobuyer').toBe(true);

    // Buy Robotic Research Automation through the Ascendency pane — the only
    // thing in the game that sets research.upgrades.autoBuyer.active.
    await game.debugClick('add100ApButton');
    await game.openTab(7);
    await openPaneById(game, 'ascendencyOption');
    await clickRowButton(game, 'buffRoboticResearchAutomationRow');
    await game.page.waitForTimeout(600);

    const bought = await game.withMods((m) =>
      m.rdo.getAscendencyBuffDataObject()?.roboticResearchAutomation?.boughtYet);
    expect(bought, 'the perk should have been purchased with the granted AP').toBeGreaterThan(0);

    await openResearchPane(game);
    await game.page.waitForTimeout(700);
    expect((await rowState(game, 'researchAutoBuyerRow')).hidden,
      'buying the perk is what reveals the row').toBe(false);

    const before = await game.withMods((m) => m.cg.getTechUnlockedArray().length);

    await game.page.evaluate(() => {
      const toggle = document.getElementById('scienceAutoBuyerToggle');
      toggle.checked = true;
      toggle.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await game.debugClick('give1MResearch');
    await game.page.waitForTimeout(3000);

    const after = await game.withMods((m) => ({
      count: m.cg.getTechUnlockedArray().length,
      research: m.rdo.getResourceDataObject('research', ['quantity'])
    }));

    expect(after.count, 'an enabled research autobuyer spends the pool on techs by itself')
      .toBeGreaterThan(before);
    expect(after.research).toBeGreaterThanOrEqual(0);
  });
});
