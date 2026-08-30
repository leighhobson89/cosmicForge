/**
 * Area: Energy — what the grid leaves behind when it trips
 * Source: bugs.txt, "BUGS TO FIX NEXT ROUND (found 2026-08-30 while verifying P3)"
 *
 * Two defects that both come from the same place: state about a power plant kept
 * in more than one spot, with only one of the copies updated.
 *
 * | Defect | What is asserted here |
 * |---|---|
 * | A tripped grid rewrote the toggle's label without its dataset flag, so the next click read the stale flag and took the wrong branch — the player had to click twice to restart a plant | after a trip, one click restarts the plant |
 * | `buildingTypeOnOff` rides in the save, so a save written before the sellBuilding() fix comes back with a plant type flagged on at quantity zero | a save carrying that contradiction is normalised on load |
 *
 * The first is driven entirely through the real toggle button, because the whole
 * bug lived in the gap between what the button showed and what its handler read.
 * Asserting the dataset alone would have passed against the broken build too —
 * the label and the flag were each individually plausible, and only disagreed
 * with each other.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** Dispatch a click straight at an element — these controls sit under others. */
async function clickById(game, id) {
  const fired = await game.page.evaluate((elementId) => {
    const el = document.getElementById(elementId);
    if (!el) return false;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, id);
  if (!fired) throw new Error(`Element ${id} was not in the DOM`);
  await game.page.waitForTimeout(350);
}

/** Open a side-menu option by id, the way a player clicks it. */
async function openOptionById(game, optionId) {
  await game.page.evaluate((id) => {
    const el = document.getElementById(id);
    el?.closest('.row-side-menu')?.classList.remove('invisible');
    el?.classList.remove('invisible');
    el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, optionId);
  await game.page.waitForTimeout(600);
}

/**
 * A run with a fuelled, running power plant and its pane open.
 *
 * Fuel and storage are both staged: a plant with no carbon to burn switches
 * itself off, which looks exactly like the toggle bug this spec is about.
 */
async function stageRunningPlant(game, plant = 'powerPlant1', quantity = 5) {
  await game.withMods((m, config) => {
    m.cg.setInfinitePower(false);
    m.rdo.setResourceDataObject(1e6, 'resources', ['carbon', 'storageCapacity']);
    m.rdo.setResourceDataObject(1e6, 'resources', ['carbon', 'quantity']);
    m.rdo.setResourceDataObject(config.quantity, 'buildings', ['energy', 'upgrades', config.plant, 'quantity']);
    m.game.toggleBuildingTypeOnOff(config.plant, true);
    m.cg.setPowerOnOff(true);
  }, { plant, quantity });
  await game.page.waitForTimeout(1200);
  await game.openTab(2);
  await openOptionById(game, `${plant}Option`);
  await game.page.waitForTimeout(400);
}

/** What the toggle button is showing, and what its handler will read off it. */
async function readToggle(game, plant = 'powerPlant1') {
  return game.withMods((m, id) => {
    const el = document.getElementById(`${id}Toggle`);
    return {
      label: (el?.textContent || '').trim(),
      toggleState: el?.dataset?.toggleState ?? null,
      running: m.cg.getBuildingTypeOnOff(id)
    };
  }, plant);
}

test.describe('Energy — a tripped grid leaves the toggle usable', () => {
  test('one click restarts a plant after the grid has dropped', async ({ game }) => {
    await game.boot();
    await stageRunningPlant(game);

    const running = await readToggle(game);
    expect(running.running, 'the plant should be running before the grid drops').toBe(true);

    // Drop the grid the way the game itself does when the energy balance demands
    // it. setPowerOnOff(false) is the exact path that relabelled every plant.
    await game.withMods((m) => m.cg.setPowerOnOff(false));
    await game.page.waitForTimeout(800);

    const tripped = await readToggle(game);
    expect(tripped.running, 'a dropped grid deactivates every plant').toBe(false);
    // The label and the flag have to agree. They are what the two halves of the
    // click handler read, and the bug was precisely that they disagreed.
    expect(tripped.toggleState,
      `the button reads "${tripped.label}" — its flag must say the same`).toBe('inactive');

    // The player's actual complaint: one press should restart it.
    await clickById(game, 'powerPlant1Toggle');
    await game.page.waitForTimeout(900);

    const afterOneClick = await readToggle(game);
    expect(afterOneClick.running,
      `one press must restart the plant, not consume a stale flag (flag was "${tripped.toggleState}")`)
      .toBe(true);
    expect(afterOneClick.toggleState, 'and the flag follows the plant').toBe('active');
  });

  test('the label and the flag never disagree, across a trip and back', async ({ game }) => {
    await game.boot();
    await stageRunningPlant(game);

    // Every state the button passes through in a normal trip-and-restart cycle.
    const states = [];
    states.push(await readToggle(game));

    await game.withMods((m) => m.cg.setPowerOnOff(false));
    await game.page.waitForTimeout(800);
    states.push(await readToggle(game));

    await clickById(game, 'powerPlant1Toggle');
    await game.page.waitForTimeout(900);
    states.push(await readToggle(game));

    await clickById(game, 'powerPlant1Toggle');
    await game.page.waitForTimeout(900);
    states.push(await readToggle(game));

    // The invariant, stated once for every state: the flag the handler reads is
    // the state the plant is actually in.
    const disagreements = states.filter(
      (state) => (state.toggleState === 'active') !== state.running
    );
    expect(disagreements,
      'the toggle flag must track the plant it belongs to at every step')
      .toEqual([]);
  });
});

test.describe('Energy — a save cannot come back claiming a plant it does not own', () => {
  test('a plant type flagged on at quantity zero is switched off on load', async ({ game }) => {
    await game.boot();
    await stageRunningPlant(game);

    // Build the contradiction a pre-fix save carries: the type is flagged as
    // running, but the player owns none of them. This is what selling the last
    // plant used to leave behind, and it rides in gameState.buildingTypeOnOff.
    const save = await game.withMods((m) => {
      const state = m.cg.captureGameStatusForSaving('export');
      state.buildingTypeOnOff = { ...state.buildingTypeOnOff, powerPlant1: true };
      state.resourceData.buildings.energy.upgrades.powerPlant1.quantity = 0;
      return JSON.parse(JSON.stringify(state));
    });

    expect(save.buildingTypeOnOff.powerPlant1,
      'the staged save should carry the contradiction this test is about').toBe(true);

    await game.withMods(async (m, state) => {
      await m.cg.restoreGameStatus(state, 'export');
    }, save);
    await game.page.waitForTimeout(600);

    const restored = await game.withMods((m) => ({
      flagged: m.cg.getBuildingTypeOnOff('powerPlant1'),
      quantity: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity'])
    }));

    expect(restored.quantity, 'the save owns no plants of this type').toBe(0);
    expect(restored.flagged,
      'a type the player owns none of cannot come back flagged as running')
      .toBe(false);
  });

  test('a plant type the player does own is left switched on', async ({ game }) => {
    await game.boot();
    await stageRunningPlant(game);

    // The complementary half: normalisation must not switch off a plant that is
    // legitimately running, or it would silently kill the grid on every load.
    const save = await game.withMods((m) => {
      const state = m.cg.captureGameStatusForSaving('export');
      return JSON.parse(JSON.stringify(state));
    });

    expect(save.buildingTypeOnOff.powerPlant1, 'the staged save has a running plant').toBe(true);
    expect(save.resourceData.buildings.energy.upgrades.powerPlant1.quantity,
      'and owns some of them').toBeGreaterThan(0);

    await game.withMods(async (m, state) => {
      await m.cg.restoreGameStatus(state, 'export');
    }, save);
    await game.page.waitForTimeout(600);

    expect(await game.withMods((m) => m.cg.getBuildingTypeOnOff('powerPlant1')),
      'a plant the player owns and was running stays running').toBe(true);
  });
});
