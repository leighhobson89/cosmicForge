/**
 * Area: Fleet Hangar — the hangar built, then every ship bought by hand
 * Plan: tests/docs/areas/fleet-hangar.md
 *
 * `fleet-hangar.spec.js` reads the fleet data object and calls the buff
 * functions. This file plays the pane instead: it proves the hangar module is
 * what unlocks shipbuilding at all, then buys each of the five classes through
 * its own Build button and checks the money and materials that actually left the
 * player's stores, the price the next one asks, and the aggregate power the
 * fleet reports afterwards.
 *
 * | Stage | What is pinned |
 * |---|---|
 * | The gate | with the other three mandatory modules finished and the hangar not, there is no Fleet Hangar pane and no way to buy a ship; finishing the hangar is what opens it |
 * | The bill | each class charges its advertised cash and all three of its advertised materials, to the unit |
 * | The escalation | every purchase makes that class's cash bill and all three material bills 13% dearer, ceiling-rounded |
 * | The roster | the five classes are five different jobs — the envoy fights nothing and is capped at one; the four combat classes cover air, land and sea at different speeds |
 * | The aggregate | a hand-built mixed fleet's attack and defense are the sum of what was bought, not a number kept somewhere else |
 *
 * ## Three things shape how these specs are written
 *
 * **Ships must be bought one frame apart.** `gain()` deducts nothing itself: it
 * writes the bill into `itemsToDeduct`, which the frame loop settles on its next
 * pass, and `setItemsToDeduct` *overwrites* the entry for a resource rather than
 * adding to it. Two clicks inside one frame are charged once. Every purchase
 * here waits a frame, which is also what a real player's fastest clicking does.
 *
 * **Production is stopped before any store is measured.** The debug scenario
 * leaves the autobuyers stocked, and precipitation accrues on its own whenever
 * it is raining — titanium is a possible precipitation compound and is a bill
 * line for every ship class. Both are silenced up front so the only thing moving
 * a store is the purchase under test.
 *
 * **The envoy cap is a CSS gate, and is asserted as one.** Nothing in `gain()`
 * enforces `maxCanBuild`; the frame loop puts `red-disabled-text` on the button,
 * whose `pointer-events: none` is the whole mechanism. A dispatched click would
 * bypass it and buy a second envoy, so the gate is checked by reading the class
 * the frame loop applied, not by clicking and hoping for a refusal.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe.configure({ timeout: 180_000 });

/** `GAME_COST_MULTIPLIER` — every ship bought makes the next one dearer. */
const COST_MULTIPLIER = 1.13;

const ENVOY = 'fleetEnvoy';
const COMBAT_CLASSES = ['fleetScout', 'fleetMarauder', 'fleetLandStalker', 'fleetNavalStrafer'];
const ALL_CLASSES = [ENVOY, ...COMBAT_CLASSES];

/** The four mandatory starship modules; the hangar is the one under test here. */
const OTHER_MANDATORY_MODULES = ['ssStructural', 'ssLifeSupport', 'ssAntimatterEngine'];
const HANGAR_MODULE = 'ssFleetHangar';

const buildRowId = (fleetId) => `space${fleetId.charAt(0).toUpperCase()}${fleetId.slice(1)}BuildRow`;

// --------------------------------------------------------------------- helpers

/** Close whatever modal is up, whichever of its two buttons it uses. */
async function dismissAnyOpenModal(page) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const closed = await page.evaluate(() => {
      const cancel = document.getElementById('modalCancel');
      if (cancel?.offsetParent) { cancel.click(); return true; }
      const confirm = document.getElementById('modalConfirm');
      if (confirm?.offsetParent) { confirm.click(); return true; }
      return false;
    });
    if (!closed) return;
    await page.waitForTimeout(300);
  }
}

/** Open one of the Interstellar tab's panes by its side-menu row id. */
async function openInterstellarPane(game, page, optionId) {
  await dismissAnyOpenModal(page);
  await game.openTab(5);
  await page.evaluate((id) => {
    const el = document.getElementById(id);
    el?.classList.remove('invisible');
    el?.closest('.row-side-menu')?.classList.remove('invisible');
    el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, optionId);
  await page.waitForTimeout(700);
}

/**
 * Silence everything that moves a material store on its own.
 *
 * The autobuyers are emptied, and the weather is forced sunny through the debug
 * menu so precipitation stops accruing — without that, a titanium-raining system
 * would make every ship's third bill line unmeasurable.
 */
async function stopAllProduction(game, page) {
  await game.debugClick('clearWeatherButton').catch(() => {});
  await game.withMods((m) => {
    for (const category of ['resources', 'compounds']) {
      const all = m.rdo.getResourceDataObject(category) ?? {};
      for (const key of Object.keys(all)) {
        const autoBuyer = all[key]?.upgrades?.autoBuyer;
        if (!autoBuyer) continue;
        for (const tier of Object.keys(autoBuyer)) {
          const slot = autoBuyer[tier];
          if (slot && typeof slot === 'object' && 'quantity' in slot) {
            slot.quantity = 0;
            slot.active = false;
          }
        }
      }
    }
  });
  await page.waitForTimeout(300);
}

/**
 * Stock a run with money, materials and techs but **no starship of any kind**.
 *
 * Deliberately not `prepareRunForStarshipLaunch()`: that builds the ship and
 * hands over thirty of every class plus the envoy, which is exactly the state
 * these specs need to arrive at by playing rather than start from.
 */
async function stockRunWithoutStarship(game, page) {
  await game.debugClick('unlockAllTabsButton');
  await game.debugClick('give1BButton');
  await game.debugClick('give1MAllResourcesAndCompounds');
  await game.debugClick('grantAllTechsButton');
  await page.waitForTimeout(600);
  await dismissAnyOpenModal(page);
  await game.withMods((m) => {
    m.cg.setInfinitePower(true);
    m.cg.setPowerOnOff(true);
    // A star study completing with no philosophy set raises the choice modal,
    // and it would sit over every later click.
    if (!m.cg.getPlayerPhilosophy()) m.cg.setPlayerPhilosophy('voidborn');
  });
  await stopAllProduction(game, page);
}

/** Stock a run and build the ship, so the hangar pane is reachable. */
async function stockRunWithHangar(game, page) {
  await stockRunWithoutStarship(game, page);
  await game.debugClick('buildStarshipDebugButton');
  await page.waitForTimeout(600);
  await dismissAnyOpenModal(page);
  // The debug build hands over materials again; re-silence production and let
  // the frame loop notice the ship exists.
  await stopAllProduction(game, page);
  await page.waitForTimeout(400);
}

/** Is the Fleet Hangar reachable from the side menu at this moment? */
async function hangarReachable(page) {
  return page.evaluate(() => {
    const option = document.getElementById('fleetHangarOption');
    const row = option?.closest('.row-side-menu');
    return {
      rowPresent: Boolean(row),
      rowHidden: Boolean(row?.classList.contains('invisible')),
      buildRows: Array.from(document.querySelectorAll('[id^="spaceFleet"][id$="BuildRow"]')).map((el) => el.id)
    };
  });
}

/** One ship class's ledger: what it costs and what it is worth in a fight. */
async function readClass(game, fleetId) {
  return game.withMods((m, id) => {
    const at = (field) => m.rdo.getResourceDataObject('space', ['upgrades', id, field]);
    return {
      quantity: at('quantity'),
      maxCanBuild: at('maxCanBuild'),
      price: at('price'),
      bills: [at('resource1Price'), at('resource2Price'), at('resource3Price')],
      baseAttackStrength: at('baseAttackStrength'),
      defenseStrength: at('defenseStrength'),
      joinsAttackDefense: at('joinsAttackDefense'),
      bonusGivenAgainstType: at('bonusGivenAgainstType') ?? null,
      speed: at('speed') ?? null,
      envoyBuiltYet: at('envoyBuiltYet') ?? null
    };
  }, fleetId);
}

/** The stores a given class's bill is drawn from, plus the fleet aggregates. */
async function readStoresFor(game, bills) {
  return game.withMods((m, lines) => ({
    cash: m.rdo.getResourceDataObject('currency', ['cash']),
    materials: lines.map(([, name, category]) =>
      m.rdo.getResourceDataObject(category, [name, 'quantity'])),
    attackPower: m.rdo.getResourceDataObject('fleets', ['attackPower']),
    defensePower: m.rdo.getResourceDataObject('fleets', ['defensePower'])
  }), bills);
}

/**
 * Press one class's Build button `times` times, a frame apart.
 *
 * Two `requestAnimationFrame` hops between presses guarantee the frame loop has
 * settled the previous bill, which is what stops several purchases collapsing
 * into a single charge.
 */
async function buildShips(page, fleetId, times = 1) {
  const pressed = await page.evaluate(async ({ id, count }) => {
    const button = document.getElementById(id)?.querySelector('button.building-purchase-button');
    if (!button) return 0;
    let done = 0;
    for (let i = 0; i < count; i++) {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      done++;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
    return done;
  }, { id: buildRowId(fleetId), count: times });
  if (pressed !== times) throw new Error(`Only pressed ${pressed}/${times} on ${buildRowId(fleetId)}`);
  await page.waitForTimeout(350);
}

// ------------------------------------------------------------------- the gate

test.describe('Fleet Hangar — the hangar has to exist first', () => {
  test('nothing can be built until the hangar module is finished', async ({ game, page }) => {
    await game.boot();
    await stockRunWithoutStarship(game, page);
    await game.openTab(5);
    await page.waitForTimeout(700);

    const fresh = await hangarReachable(page);
    expect(await game.withMods((m) => m.cg.getStarShipBuilt()), 'a fresh run has no ship').toBe(false);
    expect(fresh.rowPresent, 'the side-menu row exists in the shell').toBe(true);
    expect(fresh.rowHidden, 'but it is hidden while the ship is unbuilt').toBe(true);
    expect(fresh.buildRows, 'and no ship build row has been drawn').toEqual([]);

    // Finish every other mandatory module and leave the hangar alone. This is
    // the whole point of the spec: the ship is one module short, and the one it
    // is short of is the hangar.
    await game.withMods((m, modules) => {
      for (const id of modules) {
        const parts = m.rdo.getResourceDataObject('space', ['upgrades', id, 'parts']);
        m.rdo.setResourceDataObject(parts, 'space', ['upgrades', id, 'builtParts']);
        m.rdo.setResourceDataObject(true, 'space', ['upgrades', id, 'finished']);
      }
    }, OTHER_MANDATORY_MODULES);
    await page.waitForTimeout(700);

    const withoutHangar = await hangarReachable(page);
    expect(await game.withMods((m) => m.cg.getStarShipBuilt()),
      'three of four modules is not a ship').toBe(false);
    expect(withoutHangar.rowHidden, 'the hangar is still the missing piece').toBe(true);
    expect(withoutHangar.buildRows, 'so there is still no way to buy a ship').toEqual([]);

    // Now finish the hangar, and let the frame loop's own checkIfStarShipBuilt()
    // draw the conclusion rather than setting starShipBuilt directly.
    await game.withMods((m, id) => {
      const parts = m.rdo.getResourceDataObject('space', ['upgrades', id, 'parts']);
      m.rdo.setResourceDataObject(parts, 'space', ['upgrades', id, 'builtParts']);
      m.rdo.setResourceDataObject(true, 'space', ['upgrades', id, 'finished']);
    }, HANGAR_MODULE);
    await page.waitForTimeout(900);

    expect(await game.withMods((m) => m.cg.getStarShipBuilt()),
      'finishing the hangar completes the ship').toBe(true);

    const unlocked = await hangarReachable(page);
    expect(unlocked.rowHidden, 'and that is what reveals the Fleet Hangar').toBe(false);

    await openInterstellarPane(game, page, 'fleetHangarOption');
    const opened = await hangarReachable(page);
    expect(opened.buildRows.sort(), 'every class now has a build row')
      .toEqual(ALL_CLASSES.map(buildRowId).sort());

    expect(game.significantErrors()).toEqual([]);
  });
});

// ---------------------------------------------------------------- the roster

test.describe('Fleet Hangar — five classes, five jobs', () => {
  test.beforeEach(async ({ game, page }) => {
    await game.boot();
    await stockRunWithHangar(game, page);
    await openInterstellarPane(game, page, 'fleetHangarOption');
  });

  test('the envoy fights nothing and the four combat classes cover air, land and sea', async ({ game }) => {
    const roster = {};
    for (const id of ALL_CLASSES) roster[id] = await readClass(game, id);

    // The envoy is the diplomatic ship: it is what makes negotiation possible at
    // all, and it contributes nothing to a battle.
    expect(roster[ENVOY].joinsAttackDefense).toBe(false);
    expect(roster[ENVOY].baseAttackStrength).toBe(0);
    expect(roster[ENVOY].defenseStrength).toBe(0);
    expect(roster[ENVOY].maxCanBuild).toBe(1);

    for (const id of COMBAT_CLASSES) {
      expect(roster[id].joinsAttackDefense, `${id} should join combat`).toBe(true);
      expect(roster[id].baseAttackStrength, `${id} attack`).toBeGreaterThan(0);
      expect(roster[id].speed, `${id} speed`).toBeGreaterThan(0);
      expect(roster[id].maxCanBuild, `${id} should not be capped like the envoy`).toBeGreaterThan(1);
    }

    // Between them the combat classes counter all three enemy fleet types, which
    // is what makes composition a decision rather than a formality.
    const covered = new Set(COMBAT_CLASSES.map((id) => roster[id].bonusGivenAgainstType));
    expect([...covered].sort()).toEqual(['air', 'land', 'sea']);

    // Speed is the price of power: the hardest hitter is the slowest ship, and
    // the cheapest scout is the fastest. A roster where one class dominated on
    // both axes would make the other three pointless.
    const byAttack = [...COMBAT_CLASSES].sort(
      (a, b) => roster[a].baseAttackStrength - roster[b].baseAttackStrength);
    const weakest = roster[byAttack[0]];
    const strongest = roster[byAttack[byAttack.length - 1]];
    expect(strongest.baseAttackStrength).toBeGreaterThan(weakest.baseAttackStrength);
    expect(strongest.speed).toBeLessThan(weakest.speed);
    expect(strongest.price).toBeGreaterThan(weakest.price);

    // Every class asks for three real materials, so no class is free in anything.
    for (const id of ALL_CLASSES) {
      expect(roster[id].bills.length).toBe(3);
      for (const [amount, name, category] of roster[id].bills) {
        expect(amount, `${id} bill amount`).toBeGreaterThan(0);
        expect(['resources', 'compounds'], `${id} bill category`).toContain(category);
        expect(typeof name).toBe('string');
      }
    }
  });

  test('the envoy is capped at one, and the button is what enforces it', async ({ game, page }) => {
    const before = await readClass(game, ENVOY);
    expect(before.quantity, 'no envoy has been bought yet').toBe(0);
    expect(before.envoyBuiltYet).toBe(false);

    await buildShips(page, ENVOY, 1);
    // The cap is applied by the frame loop's pass over the purchase rows, so it
    // needs a moment rather than being true the instant the click returns.
    await page.waitForTimeout(700);

    const after = await readClass(game, ENVOY);
    expect(after.quantity, 'the envoy is built').toBe(1);
    expect(after.quantity).toBe(after.maxCanBuild);
    expect(after.envoyBuiltYet, 'and the run records that it exists, which is what opens diplomacy').toBe(true);

    // The gate itself. `gain()` has no maxCanBuild check of its own, so this
    // class *is* the cap — a dispatched click would still buy a second envoy,
    // which is why the assertion reads the class rather than clicking again.
    const gate = await page.evaluate((rowId) => {
      const button = document.getElementById(rowId)?.querySelector('button.building-purchase-button');
      const quantity = document.getElementById('fleetEnvoyBuiltQuantity');
      const max = document.getElementById('fleetEnvoyBuiltQuantityMax');
      return {
        blocked: Boolean(button?.classList.contains('red-disabled-text')),
        pointerEvents: button ? getComputedStyle(button).pointerEvents : null,
        quantityText: quantity?.textContent?.trim(),
        maxText: max?.textContent?.trim()
      };
    }, buildRowId(ENVOY));

    expect(gate.blocked, 'a built envoy disables its own Build button').toBe(true);
    expect(gate.pointerEvents, 'and the class is what makes it unclickable').toBe('none');
    expect(gate.quantityText).toBe('1');
    expect(gate.maxText).toBe('1');

    expect(game.significantErrors()).toEqual([]);
  });
});

// -------------------------------------------------------- the bill, per class

test.describe('Fleet Hangar — what each ship actually costs', () => {
  test.beforeEach(async ({ game, page }) => {
    await game.boot();
    await stockRunWithHangar(game, page);
    await openInterstellarPane(game, page, 'fleetHangarOption');
  });

  for (const fleetId of ALL_CLASSES) {
    test(`buying a ${fleetId} charges its advertised cash and all three materials`, async ({ game, page }) => {
      const advertised = await readClass(game, fleetId);
      const before = await readStoresFor(game, advertised.bills);

      await buildShips(page, fleetId, 1);

      const after = await readStoresFor(game, advertised.bills);
      const now = await readClass(game, fleetId);

      expect(now.quantity, 'one ship was added to the hangar').toBe(advertised.quantity + 1);
      expect(before.cash - after.cash, 'cash charged').toBe(advertised.price);
      for (let i = 0; i < advertised.bills.length; i++) {
        const [amount, name] = advertised.bills[i];
        expect(before.materials[i] - after.materials[i], `${name} charged`).toBe(amount);
      }
    });

    test(`buying a ${fleetId} makes the next one 13% dearer in every line`, async ({ game, page }) => {
      const before = await readClass(game, fleetId);

      await buildShips(page, fleetId, 1);

      const after = await readClass(game, fleetId);

      expect(after.price, 'cash price').toBe(Math.ceil(before.price * COST_MULTIPLIER));
      for (let i = 0; i < before.bills.length; i++) {
        const [oldAmount, name] = before.bills[i];
        const [newAmount, newName] = after.bills[i];
        expect(newName, 'the material itself does not change').toBe(name);
        expect(newAmount, `${name} price`).toBe(Math.ceil(oldAmount * COST_MULTIPLIER));
      }
    });
  }

  test('three ships bought in a row are charged three times, not once', async ({ game, page }) => {
    // The regression this guards is real and easy to reintroduce: `gain()` only
    // queues a bill, and the queue holds one entry per resource, so purchases
    // made inside a single frame collapse into a single charge.
    const first = await readClass(game, 'fleetScout');
    const before = await readStoresFor(game, first.bills);

    const expectedCash = [0, 1, 2].reduce((total, step) => {
      let price = first.price;
      for (let i = 0; i < step; i++) price = Math.ceil(price * COST_MULTIPLIER);
      return total + price;
    }, 0);

    await buildShips(page, 'fleetScout', 3);

    const after = await readStoresFor(game, first.bills);
    const now = await readClass(game, 'fleetScout');

    expect(now.quantity).toBe(first.quantity + 3);
    expect(before.cash - after.cash, 'each of the three was charged at its own price').toBe(expectedCash);
  });
});

// ----------------------------------------------------------- the aggregate

test.describe('Fleet Hangar — the fleet a player actually assembles', () => {
  test('a hand-built mixed fleet reports the attack and defense it was bought', async ({ game, page }) => {
    await game.boot();
    await stockRunWithHangar(game, page);
    await openInterstellarPane(game, page, 'fleetHangarOption');

    const composition = { fleetScout: 3, fleetMarauder: 2, fleetLandStalker: 1, fleetNavalStrafer: 2 };

    const start = await game.withMods((m) => ({
      attack: m.rdo.getResourceDataObject('fleets', ['attackPower']),
      defense: m.rdo.getResourceDataObject('fleets', ['defensePower'])
    }));
    expect(start.attack, 'a run with no ships has no fleet power').toBe(0);
    expect(start.defense).toBe(0);

    // Per-unit strengths are read before anything is bought, because a purchase
    // never changes them — only the philosophy repeatables do, and none is
    // active here.
    const perUnit = {};
    for (const id of COMBAT_CLASSES) perUnit[id] = await readClass(game, id);

    for (const [id, count] of Object.entries(composition)) {
      await buildShips(page, id, count);
    }
    await page.waitForTimeout(500);

    const expectedAttack = COMBAT_CLASSES.reduce(
      (sum, id) => sum + composition[id] * perUnit[id].baseAttackStrength, 0);
    const expectedDefense = COMBAT_CLASSES.reduce(
      (sum, id) => sum + composition[id] * perUnit[id].defenseStrength, 0);

    const built = await game.withMods((m, ids) => ({
      quantities: Object.fromEntries(ids.map((id) =>
        [id, m.rdo.getResourceDataObject('space', ['upgrades', id, 'quantity'])])),
      attack: m.rdo.getResourceDataObject('fleets', ['attackPower']),
      defense: m.rdo.getResourceDataObject('fleets', ['defensePower']),
      // Set by the Build handler; diplomacy uses it to decide whether the power
      // ratio it last negotiated on is still current.
      fleetChanged: m.cg.getFleetChangedSinceLastDiplomacy()
    }), COMBAT_CLASSES);

    expect(built.quantities).toEqual(composition);
    expect(built.attack, 'attack is the sum of what was bought').toBeCloseTo(expectedAttack, 6);
    expect(built.defense, 'defense likewise').toBeCloseTo(expectedDefense, 6);
    expect(built.fleetChanged, 'building flags the fleet as changed for diplomacy').toBe(true);

    // The pane's own readout has to agree with the data object, or the player is
    // choosing a fight on a number the game does not believe.
    const shown = await page.evaluate(() => {
      const description = document.getElementById('descriptionContentTab5');
      const spans = Array.from(description?.querySelectorAll('span') ?? []);
      return spans.map((s) => s.textContent.trim());
    });
    expect(shown, 'the Fleet Hangar description shows the live fleet power')
      .toContain(built.attack.toFixed(0));

    expect(game.significantErrors()).toEqual([]);
  });
});
