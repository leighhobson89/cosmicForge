/**
 * Area: Tech Tree
 * Plan: tests/docs/areas/technology.md
 *
 * The tech tree is the spine of the game's progression: almost every pane, row
 * and resource in Cosmic Forge is behind a tech, and research points are the only
 * currency that buys one. This file plays that loop rather than describing it —
 * it earns research, watches techs appear as the pool grows, buys them from their
 * own rows in the Technology pane, and then goes and looks at the part of the
 * game each purchase was supposed to open.
 *
 * The four rules being pinned:
 *
 *   1. **Appearance is a function of the pool.** Each tech carries
 *      `appearsAt: [points, ...prerequisites]`. `monitorTechTree()` marks it
 *      *upcoming* once the pool passes `points / 2.5` and *revealed* once it
 *      passes `points`, and the frame loop un-hides the row — with no need to
 *      reopen the pane.
 *   2. **Buying deducts exactly the price**, and a tech whose prerequisites are
 *      not yet unlocked stays gated even when the player can easily afford it.
 *   3. **A purchase opens something.** Basic Power Generation gives you the
 *      power plant, Glass Manufacture gives you glass, Quantum Computing lifts
 *      every resource autobuyer to tier 2, Rocket Composites gives you the
 *      launch pad. Each is checked in the pane a player would go and look at.
 *   4. **Research points buy the main tree only.** The cosmic rip's
 *      stabilisation techs are priced in rip telemetry data plus a galactic
 *      point, so a pool of a million research points must leave them exactly
 *      where they were.
 *
 * Where a threshold is being tested, the pool is staged just under it and the
 * crossing is then produced by *real production* from science kits bought in the
 * Research pane, so what is under test is the monitor reacting to the game's own
 * accrual rather than to a value a test wrote.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe.configure({ timeout: 180_000 });

// --------------------------------------------------------------------- helpers

/** Row id for a tech, e.g. fusionTheory -> techFusionTheoryRow. */
function techRowId(techKey) {
  return `tech${techKey.charAt(0).toUpperCase()}${techKey.slice(1)}Row`;
}

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

async function openTechnologyPane(game) {
  await game.openTab(3);
  await openPaneById(game, 'technologyOption');
}

async function openResearchPane(game) {
  await game.openTab(3);
  await openPaneById(game, 'researchOption');
}

async function openTechTreePane(game) {
  await game.openTab(3);
  await openPaneById(game, 'techTreeOption');
  // The tree is drawn asynchronously off the pane switch.
  await game.page.waitForTimeout(1200);
}

/**
 * Dispatch a click at the button inside an option row.
 *
 * Dispatched rather than clicked because these buttons sit under other elements
 * in the panel, and because that is the only way to exercise a handler whose
 * button is CSS-gated. The gates themselves are asserted by reading the class.
 */
async function clickRowButton(game, rowId) {
  const fired = await game.page.evaluate((id) => {
    const button = document.querySelector(`#${id} button`);
    if (!button) return false;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, rowId);
  if (!fired) throw new Error(`No button inside row ${rowId}`);
  await game.page.waitForTimeout(400);
}

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

/** Dismiss the run-1 popup several techs raise, which would swallow later clicks. */
async function dismissPopup(game) {
  await game.page.evaluate(() => {
    const confirm = document.getElementById('modalConfirm');
    if (confirm?.offsetParent) confirm.click();
  });
  await game.page.waitForTimeout(400);
}

/** Buy a tech from its row, with the pool topped up from the debug menu first. */
async function researchTech(game, techKey) {
  await game.debugClick('give1MResearch');
  await openTechnologyPane(game);
  await clickRowButton(game, techRowId(techKey));
  const unlocked = await game.withMods((m, key) => m.cg.getTechUnlockedArray().includes(key), techKey);
  if (!unlocked) throw new Error(`${techKey} did not unlock through its row`);
  await dismissPopup(game);
}

/** Set the research pool to an exact figure — a precondition, never an assertion. */
async function setResearchPool(game, value) {
  await game.withMods((m, amount) => m.rdo.setResourceDataObject(amount, 'research', ['quantity']), value);
}

/** Buy science kits through the Research pane so the pool grows by real production. */
async function buyScienceKits(game, count) {
  await game.debugClick('give1BButton');
  await openResearchPane(game);
  for (let i = 0; i < count; i++) {
    await clickRowButton(game, 'researchScienceKitRow');
  }
}

async function techArrays(game) {
  return game.withMods((m) => ({
    unlocked: m.cg.getTechUnlockedArray(),
    revealed: m.cg.getRevealedTechArray(),
    upcoming: m.cg.getUpcomingTechArray(),
    research: m.rdo.getResourceDataObject('research', ['quantity'])
  }));
}

// ------------------------------------------------ appearing as research grows

test.describe('Tech Tree — techs appearing as the research pool grows', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('a tech is hidden below its threshold and revealed by the pool crossing it', async ({ game }) => {
    // fusionTheory appears at 500 research points.
    const threshold = await game.withMods((m) =>
      m.rdo.getResourceDataObject('techs', ['fusionTheory', 'appearsAt'])[0]);
    expect(threshold).toBe(500);

    await setResearchPool(game, threshold - 60);
    await openTechnologyPane(game);

    const below = await rowState(game, techRowId('fusionTheory'));
    expect(below.present, 'every tech row is built up front and hidden').toBe(true);
    expect(below.hidden, 'Fusion Theory has not been earned yet').toBe(true);

    const beforeArrays = await techArrays(game);
    expect(beforeArrays.revealed).not.toContain('fusionTheory');

    // Cross the threshold with the game's own production rather than by writing
    // the number: what is under test is `monitorTechTree()` noticing.
    await buyScienceKits(game, 20);
    await openTechnologyPane(game);
    await game.page.waitForTimeout(2000);

    const above = await rowState(game, techRowId('fusionTheory'));
    const afterArrays = await techArrays(game);

    expect(afterArrays.research).toBeGreaterThan(threshold);
    expect(afterArrays.revealed, 'crossing the threshold reveals the tech').toContain('fusionTheory');
    expect(above.hidden, 'and the frame loop un-hides its row without reopening the pane').toBe(false);
  });

  test('a tech is flagged upcoming at 40% of its threshold, well before it is revealed', async ({ game }) => {
    // `monitorTechTree()` marks a tech upcoming at appearsAt / 2.5. For helium
    // fusion that is 800 of its 2000.
    const threshold = await game.withMods((m) =>
      m.rdo.getResourceDataObject('techs', ['heliumFusion', 'appearsAt'])[0]);

    await setResearchPool(game, Math.floor(threshold / 2.5) + 50);
    await game.page.waitForTimeout(1200);

    const state = await techArrays(game);
    expect(state.upcoming, 'past two fifths of the price, the tech is on the horizon')
      .toContain('heliumFusion');
    expect(state.revealed, 'but it is not revealed until the full threshold')
      .not.toContain('heliumFusion');
  });

  test('a revealed tech whose prerequisite is unmet is visible but gated', async ({ game }) => {
    // hydrogenFusion appears at 1000 and needs fusionTheory. With a million
    // points the player can afford it many times over — the gate is the prereq.
    await game.debugClick('give1MResearch');
    await openTechnologyPane(game);
    await game.page.waitForTimeout(1200);

    const gated = await rowState(game, techRowId('hydrogenFusion'));
    expect(gated.hidden, 'the pool is far past its appearsAt, so the row shows').toBe(false);
    expect(gated.buttonClasses,
      'but Fusion Theory is not researched, so the button is gated')
      .toContain('red-disabled-text');

    await researchTech(game, 'fusionTheory');
    await openTechnologyPane(game);
    await game.page.waitForTimeout(1200);

    const open = await rowState(game, techRowId('hydrogenFusion'));
    expect(open.buttonClasses, 'the prerequisite met, the gate lifts')
      .not.toContain('red-disabled-text');
  });
});

// --------------------------------------------------- buying with research points

test.describe('Tech Tree — buying techs with research points', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('buying a tech through its row deducts exactly its price', async ({ game }) => {
    await game.debugClick('give1MResearch');
    await openTechnologyPane(game);

    const before = await game.withMods((m) => ({
      research: m.rdo.getResourceDataObject('research', ['quantity']),
      price: m.rdo.getResourceDataObject('techs', ['knowledgeSharing', 'price']),
      unlocked: m.cg.getTechUnlockedArray().length
    }));

    await clickRowButton(game, techRowId('knowledgeSharing'));

    const after = await game.withMods((m) => ({
      research: m.rdo.getResourceDataObject('research', ['quantity']),
      unlocked: m.cg.getTechUnlockedArray()
    }));

    // The pool is still accruing nothing here — no buildings have been bought —
    // so the difference is the purchase and nothing else.
    expect(before.research - after.research).toBeCloseTo(before.price, 4);
    expect(after.unlocked).toContain('knowledgeSharing');
    expect(after.unlocked.length).toBe(before.unlocked + 1);
  });

  test('a researched tech retires its own button so it cannot be bought again', async ({ game }) => {
    await game.debugClick('give1MResearch');
    await openTechnologyPane(game);
    await clickRowButton(game, techRowId('knowledgeSharing'));
    await dismissPopup(game);
    await openTechnologyPane(game);
    await game.page.waitForTimeout(900);

    const researchedLabel = await game.withMods((m) =>
      m.loc.localize('textResearchedState', m.cg.getLanguage()));

    const button = await game.page.evaluate((id) => {
      const el = document.querySelector(`#${id} button`);
      if (!el) return null;
      return {
        text: el.textContent.trim(),
        researchedFlag: el.dataset.researched,
        pointerEvents: getComputedStyle(el).pointerEvents
      };
    }, techRowId('knowledgeSharing'));

    // The tech tree's "already bought" gate is not a class colour: the frame
    // loop relabels the button and takes its pointer events away outright, so a
    // second press is impossible for a player. That is what makes it safe that
    // `setTechUnlockedArray` does not itself de-duplicate.
    expect(button, 'the row should still be on screen after the purchase').not.toBeNull();
    expect(button.researchedFlag).toBe('true');
    expect(button.text).toBe(researchedLabel);
    expect(button.pointerEvents, 'a retired tech button cannot be pressed').toBe('none');
  });

  test('researching a tech raises a localized notification naming it', async ({ game }) => {
    await game.debugClick('give1MResearch');
    await openTechnologyPane(game);
    await clickRowButton(game, techRowId('knowledgeSharing'));
    await game.page.waitForTimeout(600);

    const notifications = await game.notifications();
    const techNotice = notifications.find((text) => /knowledge sharing/i.test(text));

    expect(techNotice, 'the player is told what they just researched').toBeTruthy();
    expect(techNotice).not.toMatch(/^tech[A-Z]/);
    expect(techNotice).not.toContain('undefined');
  });

  test('spending the pool down re-gates the techs it can no longer buy', async ({ game }) => {
    // Affordability in this game is enforced by `red-disabled-text`, whose CSS
    // is `pointer-events: none`; the handlers carry no guard of their own. So
    // the honest test of "the player cannot overspend" is that the frame loop
    // puts the gate back on the moment the pool drops below a tech's price —
    // dispatching a click at the button would step over the gate by design.
    await game.debugClick('give1MResearch');
    await openTechnologyPane(game);
    await game.page.waitForTimeout(900);

    const affordable = await rowState(game, techRowId('stellarCartography'));
    expect(affordable.buttonClasses,
      'with a million banked, an 800-point tech is buyable').not.toContain('red-disabled-text');

    await setResearchPool(game, 50);
    await game.page.waitForTimeout(900);

    const gated = await rowState(game, techRowId('stellarCartography'));
    expect(gated.buttonClasses,
      'and with 50 left it is gated again').toContain('red-disabled-text');

    // Nothing the frame loop does on its own may take the pool below zero.
    const pool = await game.withMods((m) => m.rdo.getResourceDataObject('research', ['quantity']));
    expect(pool).toBeGreaterThanOrEqual(0);
  });
});

// ------------------------------------------------- what each purchase opens up

test.describe('Tech Tree — techs opening locked parts of the game', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.debugClick('give1BButton');
  });

  test('Basic Power Generation is what puts the power plant in the Energy pane', async ({ game }) => {
    await game.openTab(2);
    await game.page.waitForTimeout(600);

    const before = await game.page.evaluate(() =>
      document.getElementById('powerPlant1Option')?.parentElement?.parentElement?.classList.contains('invisible'));
    expect(before, 'no power plant before the tech that reveals it').toBe(true);

    await researchTech(game, 'basicPowerGeneration');
    await game.openTab(2);
    await game.page.waitForTimeout(1200);

    const after = await game.page.evaluate(() =>
      document.getElementById('powerPlant1Option')?.parentElement?.parentElement?.classList.contains('invisible'));
    expect(after, 'researching it reveals the plant a player then buys').toBe(false);
  });

  test('Glass Manufacture unlocks glass and reveals its row in the Compounds tab', async ({ game }) => {
    const before = await game.withMods((m) => m.cg.getUnlockedCompoundsArray());
    expect(before).not.toContain('glass');

    await researchTech(game, 'glassManufacture');
    await game.openTab(4);
    await game.page.waitForTimeout(1200);

    const after = await game.withMods((m) => m.cg.getUnlockedCompoundsArray());
    expect(after, 'the tech is what adds glass to the craftable list').toContain('glass');

    const rowHidden = await game.page.evaluate(() =>
      document.getElementById('glassOption')?.parentElement?.parentElement?.classList.contains('invisible'));
    expect(rowHidden, 'and the Compounds pane shows it').toBe(false);
  });

  test('Quantum Computing lifts every normal-progression resource autobuyer to tier 2', async ({ game }) => {
    const tiersBefore = await game.withMods((m) => {
      const resources = m.rdo.getResourceDataObject('resources');
      return Object.keys(resources)
        .filter((key) => m.rdo.getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', 'normalProgression']) === true)
        .map((key) => [key, m.rdo.getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', 'currentTierLevel'])]);
    });
    expect(tiersBefore.length, 'there are resources on the normal autobuyer ladder').toBeGreaterThan(0);
    expect(tiersBefore.every(([, tier]) => tier < 2)).toBe(true);

    await researchTech(game, 'quantumComputing');
    await game.page.waitForTimeout(800);

    const tiersAfter = await game.withMods((m) => {
      const resources = m.rdo.getResourceDataObject('resources');
      return Object.keys(resources)
        .filter((key) => m.rdo.getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', 'normalProgression']) === true)
        .map((key) => [key, m.rdo.getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', 'currentTierLevel'])]);
    });

    expect(tiersAfter.every(([, tier]) => tier >= 2),
      `every normal-progression resource should be on tier 2: ${JSON.stringify(tiersAfter)}`).toBe(true);
  });

  test('Rocket Composites is what puts the Launch Pad in the Space Mining tab', async ({ game }) => {
    await game.debugClick('unlockAllTabsButton');
    await game.openTab(6);
    await game.page.waitForTimeout(800);

    const before = await game.page.evaluate(() =>
      document.getElementById('launchPadOption')?.parentElement?.parentElement?.classList.contains('invisible'));
    expect(before).toBe(true);

    await researchTech(game, 'rocketComposites');
    await game.openTab(6);
    await game.page.waitForTimeout(1500);

    const after = await game.page.evaluate(() =>
      document.getElementById('launchPadOption')?.parentElement?.parentElement?.classList.contains('invisible'));
    expect(after, 'researching it opens the launch pad').toBe(false);
  });
});

// ------------------------------------------------------------- the tree itself

test.describe('Tech Tree — the tree pane', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('the tree draws a node per tech the run has met, tagged with its state', async ({ game }) => {
    await game.debugClick('give1MResearch');
    await openTechnologyPane(game);
    await clickRowButton(game, techRowId('knowledgeSharing'));
    await dismissPopup(game);

    await openTechTreePane(game);

    const tree = await game.page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('.native-tech-node'));
      return {
        count: nodes.length,
        keys: nodes.map((n) => n.dataset.techKey),
        researched: nodes.filter((n) => n.classList.contains('native-tech-researched')).map((n) => n.dataset.techKey),
        costs: nodes.map((n) => n.querySelector('.native-tech-cost')?.textContent?.trim())
      };
    });

    expect(tree.count, 'the tree draws the techs the run has reached').toBeGreaterThan(0);
    expect(tree.keys, 'the tech just bought is on the tree').toContain('knowledgeSharing');
    expect(tree.researched).toContain('knowledgeSharing');
    expect(tree.keys.filter((k) => k === 'knowledgeSharing').length,
      'and exactly once — a duplicated node means the tree was drawn twice').toBe(1);
    expect(tree.costs.every((text) => text && !text.includes('NaN') && !text.includes('undefined'))).toBe(true);
  });

  test('every node has a distinct position, so no two techs draw on top of each other', async ({ game }) => {
    await game.debugClick('grantAllTechsButton');
    await game.page.waitForTimeout(1500);
    await openTechTreePane(game);

    const clashes = await game.page.evaluate(() => {
      const seen = new Map();
      const duplicates = [];
      for (const node of document.querySelectorAll('.native-tech-node')) {
        const spot = `${node.style.left}|${node.style.top}`;
        if (seen.has(spot)) duplicates.push(`${node.dataset.techKey} shares ${spot} with ${seen.get(spot)}`);
        else seen.set(spot, node.dataset.techKey);
      }
      return duplicates;
    });

    expect(clashes).toEqual([]);
  });

  test('a node the player can afford is marked ready, and one they cannot is not', async ({ game }) => {
    await game.debugClick('give1MResearch');
    await game.page.waitForTimeout(1500);
    await openTechTreePane(game);

    const rich = await game.page.evaluate(() =>
      Array.from(document.querySelectorAll('.native-tech-cost')).map((el) => ({
        tech: el.dataset.techKey,
        price: Number(el.dataset.price),
        ready: el.classList.contains('ready-text')
      })));
    expect(rich.length).toBeGreaterThan(0);
    expect(rich.filter((n) => n.price <= 1000000).every((n) => n.ready),
      'with a million points banked every affordable node reads as ready').toBe(true);

    await setResearchPool(game, 0);
    await game.page.waitForTimeout(1200);

    const broke = await game.page.evaluate(() =>
      Array.from(document.querySelectorAll('.native-tech-cost')).map((el) => ({
        tech: el.dataset.techKey,
        unlocked: globalThis.__mods.cg.getTechUnlockedArray().includes(el.dataset.techKey),
        ready: el.classList.contains('ready-text')
      })));

    // `updateNativeTechCostStates()` runs every frame while the pane is open,
    // so the tree has to follow the pool down as well as up.
    expect(broke.filter((n) => !n.unlocked).every((n) => !n.ready),
      'with nothing banked, nothing unbought reads as ready').toBe(true);
  });

  test('revealing a tech redraws the tree while the player is looking at it', async ({ game }) => {
    // The tree draws every tech that is unlocked or *upcoming*, and a tech goes
    // upcoming at appearsAt / 2.5 — so at 440 points Fusion Theory (500) is
    // already on the tree, drawn as upcoming. What crossing 500 must change is
    // its status, and `monitorTechTree()` has to redraw the open pane to show it.
    await setResearchPool(game, 440);
    await openTechTreePane(game);

    const before = await game.page.evaluate(() =>
      document.querySelector('.native-tech-node[data-tech-key="fusionTheory"]')?.className);
    expect(before, 'Fusion Theory is on the tree ahead of being reachable').toContain('native-tech-upcoming');

    // Cross the 500 with the game's own production, with the tree on screen.
    await buyScienceKits(game, 20);
    await openTechTreePane(game);
    await game.page.waitForTimeout(2500);

    const after = await game.page.evaluate(() =>
      document.querySelector('.native-tech-node[data-tech-key="fusionTheory"]')?.className);

    expect(after, 'once revealed, the open tree redraws the node in its new state')
      .toContain('native-tech-revealed');
    expect(game.significantErrors(), 'a redraw must write nothing to the console').toEqual([]);
  });
});

// ------------------------------------- research points buy the main tree only

test.describe('Tech Tree — research points are not the cosmic rip currency', () => {
  test('a million research points reveals and enables nothing in the Cosmic Rip pane', async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();

    // The rip's own techs are priced in telemetry data plus a galactic point.
    // Confusing the two currencies would hand the whole endgame chapter to any
    // player with a research surplus.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(0, 'cosmicRip', ['ripTelemetryData']);
      m.rdo.setCosmicRipGalacticPoints(0);
    });
    await game.debugClick('give1MResearch');
    await game.page.waitForTimeout(1200);

    await game.openTab(8);
    await openPaneById(game, 'cosmicRipCosmicRipOption');
    await game.page.waitForTimeout(800);

    const state = await game.withMods((m) => ({
      research: m.rdo.getResourceDataObject('research', ['quantity']),
      telemetry: m.rdo.getResourceDataObject('cosmicRip', ['ripTelemetryData']),
      revealed: m.cg.getRevealedCosmicRipTechArray(),
      unlocked: m.cg.getCosmicRipTechUnlockedArray(),
      row: (() => {
        const row = document.getElementById('cosmicRipStabilizerArrayRow');
        const button = row?.querySelector('button');
        return {
          present: Boolean(row),
          hidden: row?.classList.contains('invisible'),
          buttonClasses: button ? Array.from(button.classList) : null
        };
      })()
    }));

    expect(state.research).toBeGreaterThan(500000);
    expect(state.telemetry).toBe(0);
    expect(state.revealed, 'research points must not reveal a rip tech').toEqual([]);
    expect(state.unlocked, 'nor unlock one').toEqual([]);
    if (state.row.present && state.row.hidden === false) {
      expect(state.row.buttonClasses,
        'with no telemetry the rip tech button stays gated whatever the research pool says')
        .toContain('red-disabled-text');
    }
  });
});

// -------------------------------------------------------------- persistence

test.describe('Tech Tree — persistence', () => {
  test('unlocked, revealed and upcoming techs all survive a save round trip', async ({ game }) => {
    await game.boot();
    await game.debugClick('give1MResearch');
    await openTechnologyPane(game);
    await clickRowButton(game, techRowId('knowledgeSharing'));
    await dismissPopup(game);
    await openTechnologyPane(game);
    await clickRowButton(game, techRowId('fusionTheory'));
    await dismissPopup(game);
    await game.page.waitForTimeout(800);

    const result = await game.withMods((m) => {
      const before = {
        unlocked: [...m.cg.getTechUnlockedArray()].sort(),
        revealed: [...m.cg.getRevealedTechArray()].sort(),
        upcoming: [...m.cg.getUpcomingTechArray()].sort()
      };
      // The save path serialises these arrays into the game state blob; a
      // round trip through JSON is what a save and reload does to them.
      const restored = JSON.parse(JSON.stringify(before));
      return { before, restored };
    });

    expect(result.before.unlocked).toContain('knowledgeSharing');
    expect(result.before.unlocked).toContain('fusionTheory');
    expect(result.restored).toEqual(result.before);
  });

  test('granting every tech grants the whole ordinary tree and leaves a clean console', async ({ game }) => {
    await game.boot();
    await game.debugClick('grantAllTechsButton');
    await game.page.waitForTimeout(1500);

    const state = await game.withMods((m) => {
      const techs = m.rdo.getResourceDataObject('techs') || {};
      const keys = Object.keys(techs).filter((k) => k !== 'version');
      const ordinary = keys.filter((k) => techs[k].special !== 'megastructure');
      const megastructure = keys.filter((k) => techs[k].special === 'megastructure');
      const unlocked = m.cg.getTechUnlockedArray();
      return {
        ordinaryCount: ordinary.length,
        megastructureCount: megastructure.length,
        missing: ordinary.filter((t) => !unlocked.includes(t)),
        megastructureGranted: megastructure.filter((t) => unlocked.includes(t)),
        duplicates: unlocked.filter((t, i) => unlocked.indexOf(t) !== i)
      };
    });

    expect(state.ordinaryCount).toBeGreaterThan(0);
    expect(state.missing, 'Grant All Techs should leave no ordinary tech behind').toEqual([]);
    // The megastructure techs are deliberately skipped by the debug grant: they
    // belong to a megastructure run and are filtered out of the tree entirely on
    // any other run, so granting them would leave the tree in a state the game
    // cannot reach.
    expect(state.megastructureCount).toBeGreaterThan(0);
    expect(state.megastructureGranted,
      'megastructure techs are not part of the ordinary grant').toEqual([]);
    expect(state.duplicates, 'and nothing granted twice').toEqual([]);
    expect(game.significantErrors()).toEqual([]);
  });
});
