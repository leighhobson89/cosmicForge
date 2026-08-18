/**
 * Area: Cosmic Rip — the chapter played, from galactic points to the brink of closing
 * Plan: tests/docs/areas/cosmic-rip.md
 *
 * `cosmic-rip.spec.js` covers the module's contract: what `scanCosmicRipSector`
 * returns for a bad index, what `restoreNearSpaceScannerArray` refuses, and that
 * the rip's location seeds once. All of it by calling the exported functions.
 *
 * This file plays the chapter instead. It earns galactic points off the settled
 * ledger, restores the Near Space Scanner Array with its own button, **sweeps the
 * galactic telescope's sector grid by clicking sectors** until the rip is found,
 * deploys sensor buoys, lets the telemetry economy run, researches all five
 * stabilisation techs through their buttons and their timers, and stops with the
 * Close The Rip button lit.
 *
 * Note the galactic telescope is not the Space Telescope. They are different
 * instruments in different chapters: the Space Telescope hunts asteroids and
 * stars from the Space Mining tab, while the galactic telescope is the sector
 * grid the Near Space Scanner Array gives you, and is the only thing that can
 * find the rip. Nothing in this file touches the Space Telescope.
 *
 * ## Why it stops where it stops
 *
 * Pressing **Close The Rip** starts the end-game cinematic, and that overlay is
 * designed never to hand the game back — the run is over and only a page reload
 * recovers it. So the last thing any spec can assert is the state immediately
 * before the press: every tech researched, the stability bar full, the row
 * revealed and the button lit. This file asserts exactly that and does not press.
 *
 * ## What is staged, and why only this
 *
 * Two preconditions are staged with `withMods`, and they are the accumulated
 * work of previous runs rather than anything this file is measuring:
 *
 *   - **the `cosmicRip` tech**, which the Miaplacidus win cinematic grants — a
 *     fourteen-second cutscene belonging to another area;
 *   - **the settled ledger**, because galactic points are one per settled system
 *     beyond the first and the chapter costs more than twenty of them.
 *
 * Everything downstream of those is played. In particular the galactic points
 * themselves are never written: the frame loop derives them every frame from
 * `settledStars.length - 1 - galacticPointsSpent`, so a spec that wrote the
 * balance would have it overwritten within a frame. Staging the ledger and
 * letting the loop do the arithmetic is both the only way that works and the
 * honest one.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** Restoring, sweeping nine sectors and running five research timers is not quick. */
test.describe.configure({ timeout: 300_000 });

/** The five stabilisation techs, in the order their prerequisites allow. */
const RIP_TECHS = [
  'stabilizerArray',
  'quantumContainmentField',
  'dimensionalAnchorMatrix',
  'singularityStabilizer',
  'realityWeaveRegulator'
];

/** The galactic telescope's grid is nine sectors, one of which holds the rip. */
const SECTOR_COUNT = 9;

// --------------------------------------------------------------------- helpers

async function dismissAnyOpenModal(page) {
  for (let attempt = 0; attempt < 5; attempt++) {
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

/** Open one of the Cosmic Rip tab's panes by its side-menu option id. */
async function openRipPane(game, page, optionId) {
  await dismissAnyOpenModal(page);
  await game.openTab(8);
  await page.evaluate((id) => {
    const el = document.getElementById(id);
    el?.classList.remove('invisible');
    el?.closest('.row-side-menu')?.classList.remove('invisible');
    el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, optionId);
  await page.waitForTimeout(800);
}

/**
 * Put the ledger of a long-played save on the board.
 *
 * Miaplacidus is not decoration: the restore button's own gate is
 * `!restored && gp >= 10 && miaplacidusSettled`, so settling the home system is
 * what opens the chapter at all. The rest are the conquests the points come from.
 */
async function stageSettledLedger(game, page, { systems = 30 } = {}) {
  await game.withMods((m, count) => {
    m.cg.setTechUnlockedArray('cosmicRip');
    m.cg.setSettledStars('miaplacidus');
    for (let i = 1; i <= count; i++) m.cg.setSettledStars(`ripspec_system_${i}`);
    m.cg.setGalacticPointsSpent(0);
  }, systems);
  // The balance is recomputed by the frame loop, not by the call above.
  await page.waitForTimeout(600);
}

async function readRipState(game) {
  return game.withMods((m) => ({
    gp: m.rdo.getCosmicRipGalacticPoints(),
    spent: m.cg.getGalacticPointsSpent(),
    restored: m.rdo.getCosmicRipNearSpaceScannerArrayRestored(),
    found: m.rdo.getCosmicRipRipFound(),
    scans: [...(m.rdo.getCosmicRipScanResultsBySectorIndex() || [])],
    ripIndex: m.rdo.getCosmicRipRipLocationSectorIndex(),
    telemetry: m.rdo.getResourceDataObject('cosmicRip', ['ripTelemetryData']),
    buoys: m.rdo.getResourceDataObject('cosmicRip', ['upgrades', 'sensorBuoy', 'quantity']),
    unlockedTechs: [...(m.cg.getCosmicRipTechUnlockedArray() || [])],
    revealedTechs: [...(m.cg.getRevealedCosmicRipTechArray() || [])]
  }));
}

/** Press the Restore button on the Situation pane. */
async function restoreScannerArray(game, page) {
  await openRipPane(game, page, 'cosmicRipSituationOption');
  const state = await page.evaluate(() => {
    const button = document.querySelector('.cosmic-rip-restore-scanner-array-button');
    if (!button) return null;
    return { disabled: button.disabled, ready: button.classList.contains('green-ready-text') };
  });
  expect(state, 'the Situation pane should offer the restore button').not.toBeNull();
  expect(state.disabled, 'a stocked ledger pays the ten galactic points this costs').toBe(false);

  await page.evaluate(() => document.querySelector('.cosmic-rip-restore-scanner-array-button')?.click());
  await page.waitForTimeout(800);
  await dismissAnyOpenModal(page);
  return state;
}

/** How the galactic telescope's nine scan labels currently read. */
async function scanLabels(page) {
  return page.evaluate((count) => {
    const out = [];
    for (let i = 0; i < count; i++) {
      const el = document.getElementById(`cosmicRipNearSpaceScannerArrayScanLabel${i}`);
      out.push(el ? {
        lit: el.classList.contains('green-ready-text'),
        blocked: el.classList.contains('red-disabled-text'),
        scanned: el.dataset.scanned === 'true',
        text: (el.textContent || '').trim()
      } : null);
    }
    return out;
  }, SECTOR_COUNT);
}

/**
 * Click a sector on the galactic telescope grid.
 *
 * This is the real control: the sector divs sit in an interactive overlay above
 * the telescope canvas, and their handler refuses unless that sector's own scan
 * label has been lit by the frame loop. Dispatching the click exercises the
 * handler; whether the label is lit is asserted separately, so the gate is
 * measured rather than stepped over silently.
 */
async function clickSector(page, index) {
  const clicked = await page.evaluate((i) => {
    const sector = document.getElementById(`cosmicRipNearSpaceScannerArraySector${i}`);
    if (!sector) return false;
    sector.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, index);
  if (!clicked) throw new Error(`Sector ${index} is not on the telescope grid`);
  await page.waitForTimeout(400);
}

/** Sweep the grid sector by sector until the rip is located. */
async function sweepTelescopeUntilFound(game, page) {
  const visited = [];
  for (let i = 0; i < SECTOR_COUNT; i++) {
    const before = await readRipState(game);
    if (before.found) break;
    await clickSector(page, i);
    visited.push(i);
    const after = await readRipState(game);
    if (after.found) return { visited, foundAt: i };
  }
  return { visited, foundAt: null };
}

/** Deploy `count` sensor buoys through the Deploy button on the telescope pane. */
async function deploySensorBuoys(game, page, count) {
  await game.debugClick('give1BButton');
  await game.debugClick('give1MAllResourcesAndCompounds');
  await page.waitForTimeout(500);
  await openRipPane(game, page, 'cosmicRipNearSpaceScannerArrayOption');

  for (let i = 0; i < count; i++) {
    const pressed = await page.evaluate(() => {
      const button = document.querySelector('#cosmicRipNearSpaceScannerArrayDeploySensorBuoyRow button');
      if (!button) return false;
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    });
    if (!pressed) throw new Error('The sensor buoy row has no Deploy button');
    await page.waitForTimeout(250);
  }
}

/** Research one stabilisation tech through its button, then run its timer out. */
async function researchRipTech(game, page, techName) {
  const clicked = await page.evaluate((name) => {
    const button = document.getElementById(`cosmicRipTechResearchButton_${name}`);
    if (!button) return null;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return { blocked: button.classList.contains('red-disabled-text') };
  }, techName);
  if (!clicked) throw new Error(`No research button for ${techName}`);
  await page.waitForTimeout(400);
  return clicked;
}

/** The Close The Rip row and button, as the frame loop leaves them. */
async function closeRipState(page) {
  return page.evaluate(() => {
    const row = document.getElementById('closeCosmicRipRow');
    const button = row?.querySelector('.cosmic-rip-close-rip-button');
    return {
      rowPresent: Boolean(row),
      rowVisible: Boolean(row) && !row.classList.contains('invisible'),
      ready: Boolean(button?.classList.contains('green-ready-text')),
      blocked: Boolean(button?.classList.contains('red-disabled-text')),
      pointerEvents: button ? getComputedStyle(button).pointerEvents : null,
      costText: document.getElementById('closeCosmicRipCostGP')?.textContent?.trim() ?? null
    };
  });
}

// ------------------------------------------------------------ galactic points

test.describe('Cosmic Rip — earning and spending galactic points', () => {
  test('a galactic point is one settled system beyond the first, counted by the frame loop', async ({ game, page }) => {
    await game.boot();
    await game.withMods((m) => {
      m.cg.setTechUnlockedArray('cosmicRip');
      m.cg.setGalacticPointsSpent(0);
    });

    // A run begins with its own star already on the settled ledger, and the loop
    // subtracts one for it — so a run that has conquered nothing has nothing to
    // spend.
    await page.waitForTimeout(600);
    const fresh = await readRipState(game);
    expect(fresh.gp, 'the system you start in does not pay').toBe(0);

    // Settle systems and let the loop do the arithmetic. Writing the balance
    // directly would be overwritten within a frame, which is the whole reason
    // this is the only honest way to earn them. The assertion is a delta so it
    // states the rule — one point per system settled — rather than a total that
    // depends on what the ledger already held.
    await game.withMods((m) => {
      m.cg.setSettledStars('miaplacidus');
      for (let i = 1; i <= 5; i++) m.cg.setSettledStars(`gpspec_system_${i}`);
    });
    await page.waitForTimeout(600);
    const conquered = await readRipState(game);
    expect(conquered.gp - fresh.gp, 'six systems settled, six points earned').toBe(6);

    // A repeat conquest is deduplicated by setSettledStars, so it pays nothing.
    await game.withMods((m) => m.cg.setSettledStars('gpspec_system_3'));
    await page.waitForTimeout(600);
    expect((await readRipState(game)).gp,
      'settling a system already held earns nothing').toBe(conquered.gp);
  });

  test('spending points moves the balance down and the spent ledger up', async ({ game, page }) => {
    await game.boot();
    await stageSettledLedger(game, page);

    const before = await readRipState(game);
    expect(before.gp, 'a stocked ledger with nothing spent yet').toBeGreaterThan(10);
    expect(before.spent).toBe(0);

    await restoreScannerArray(game, page);
    await page.waitForTimeout(600);

    const after = await readRipState(game);
    expect(after.spent, 'restoring the array costs ten').toBe(10);
    expect(after.gp, 'and the balance the loop derives follows it down').toBe(before.gp - 10);
  });

  test('the balance never goes negative, however much is spent', async ({ game, page }) => {
    await game.boot();
    await stageSettledLedger(game, page, { systems: 12 });
    await restoreScannerArray(game, page);

    // A dozen conquests cannot pay for the ten-point restoration and then nine
    // scans at a point each, so the sweep has to run out partway.
    const funded = (await readRipState(game)).gp;
    expect(funded, 'the run is deliberately short of a full sweep').toBeLessThan(SECTOR_COUNT);

    await openRipPane(game, page, 'cosmicRipNearSpaceScannerArrayOption');
    for (let i = 0; i < SECTOR_COUNT; i++) await clickSector(page, i);
    await page.waitForTimeout(800);

    const state = await readRipState(game);
    expect(state.gp, 'the balance stops at zero rather than going through it').toBe(0);
    expect(state.scans.filter(Boolean).length,
      'exactly as many sectors were scanned as there were points to pay for')
      .toBe(funded);
  });
});

// --------------------------------------------- restoring the scanner array

test.describe('Cosmic Rip — restoring the Near Space Scanner Array', () => {
  test('the restore button is dead without the points and lit with them', async ({ game, page }) => {
    await game.boot();
    await game.withMods((m) => {
      m.cg.setTechUnlockedArray('cosmicRip');
      m.cg.setSettledStars('miaplacidus');
      m.cg.setGalacticPointsSpent(0);
    });
    await openRipPane(game, page, 'cosmicRipSituationOption');
    await page.waitForTimeout(600);

    const broke = await page.evaluate(() => {
      const button = document.querySelector('.cosmic-rip-restore-scanner-array-button');
      return button ? { disabled: button.disabled, ready: button.classList.contains('green-ready-text') } : null;
    });
    expect(broke, 'the row is there from the start').not.toBeNull();
    expect(broke.disabled, 'one settled system pays nothing towards the ten it costs').toBe(true);

    await game.withMods((m) => {
      for (let i = 1; i <= 12; i++) m.cg.setSettledStars(`restorespec_system_${i}`);
    });
    await page.waitForTimeout(900);

    const rich = await page.evaluate(() => {
      const button = document.querySelector('.cosmic-rip-restore-scanner-array-button');
      return { disabled: button.disabled, ready: button.classList.contains('green-ready-text') };
    });
    expect(rich.disabled, 'twelve conquests is more than enough').toBe(false);
    expect(rich.ready).toBe(true);
  });

  test('restoring it seeds the rip, clears the grid and opens the telescope', async ({ game, page }) => {
    await game.boot();
    await stageSettledLedger(game, page);
    await restoreScannerArray(game, page);

    const state = await readRipState(game);
    expect(state.restored, 'the button is what restores it').toBe(true);
    expect(state.found, 'restoring it does not also find the rip').toBe(false);
    expect(state.scans.length, 'a clean nine-sector grid').toBe(SECTOR_COUNT);
    expect(state.scans.every((scanned) => scanned === false)).toBe(true);
    expect(state.ripIndex, 'the rip has been placed somewhere on the grid')
      .toBeGreaterThanOrEqual(0);
    expect(state.ripIndex).toBeLessThan(SECTOR_COUNT);

    // The telescope pane is what the restoration is for.
    await openRipPane(game, page, 'cosmicRipNearSpaceScannerArrayOption');
    const grid = await page.evaluate(() => ({
      container: Boolean(document.getElementById('cosmicRipNearSpaceScannerArrayCanvas')
        || document.querySelector('#cosmicRipNearSpaceScannerArraySector0')),
      sectors: document.querySelectorAll('[id^="cosmicRipNearSpaceScannerArraySector"]').length,
      fogCells: document.querySelectorAll('[id^="cosmicRipNearSpaceScannerArrayFogCell"]').length
    }));
    expect(grid.sectors, 'nine clickable sectors').toBe(SECTOR_COUNT);
    expect(grid.fogCells, 'each under its own fog cell').toBe(SECTOR_COUNT);
  });

  test('restoring twice is refused and charges nothing the second time', async ({ game, page }) => {
    await game.boot();
    await stageSettledLedger(game, page);
    await restoreScannerArray(game, page);
    const afterFirst = await readRipState(game);

    await openRipPane(game, page, 'cosmicRipSituationOption');
    const rowHidden = await page.evaluate(() =>
      document.getElementById('cosmicRipRestoreNearSpaceScannerArrayRow')?.classList.contains('invisible'));
    expect(rowHidden, 'a restored array is not for sale again').toBe(true);

    // Reach the handler anyway: it must refuse on its own, not only by being hidden.
    const refusal = await game.withMods((m) => m.rip.restoreNearSpaceScannerArray());
    const afterSecond = await readRipState(game);

    expect(refusal).toEqual({ ok: false, reason: 'already_restored' });
    expect(afterSecond.spent).toBe(afterFirst.spent);
  });
});

// ------------------------------------------ scanning with the galactic telescope

test.describe('Cosmic Rip — sweeping the galactic telescope', () => {
  test.beforeEach(async ({ game, page }) => {
    await game.boot();
    await stageSettledLedger(game, page);
    await restoreScannerArray(game, page);
    await openRipPane(game, page, 'cosmicRipNearSpaceScannerArrayOption');
  });

  test('every unscanned sector is lit while there are points to spend', async ({ game, page }) => {
    await page.waitForTimeout(900);
    const labels = await scanLabels(page);

    expect(labels.filter(Boolean).length, 'nine scan labels').toBe(SECTOR_COUNT);
    expect(labels.every((label) => label.lit),
      'restored, unscanned and in funds — every sector is scannable').toBe(true);
    expect(labels.every((label) => !label.scanned)).toBe(true);
    expect(labels.every((label) => label.text && !label.text.includes('undefined'))).toBe(true);
  });

  test('clicking a sector scans it, charges a point and lifts its fog', async ({ game, page }) => {
    const before = await readRipState(game);
    await clickSector(page, 0);
    await page.waitForTimeout(900);
    const after = await readRipState(game);

    expect(after.scans[0], 'the sector clicked is the sector scanned').toBe(true);
    expect(after.scans.filter(Boolean).length, 'and only that one').toBe(1);
    expect(before.gp - after.gp, 'a scan costs one galactic point').toBe(1);
    expect(after.spent - before.spent).toBe(1);

    const label = (await scanLabels(page))[0];
    expect(label.scanned, 'the label records the sector as scanned').toBe(true);
  });

  test('clicking a scanned sector again does nothing and costs nothing', async ({ game, page }) => {
    await clickSector(page, 3);
    await page.waitForTimeout(700);
    const afterFirst = await readRipState(game);

    await clickSector(page, 3);
    await page.waitForTimeout(700);
    const afterSecond = await readRipState(game);

    expect(afterSecond.gp, 'a spent sector is not chargeable twice').toBe(afterFirst.gp);
    expect(afterSecond.scans.filter(Boolean).length).toBe(afterFirst.scans.filter(Boolean).length);
  });

  test('sweeping the grid finds the rip, in the seeded sector and nowhere else', async ({ game, page }) => {
    const seeded = (await readRipState(game)).ripIndex;
    const sweep = await sweepTelescopeUntilFound(game, page);

    expect(sweep.foundAt, 'sweeping all nine sectors must find the rip').not.toBeNull();
    expect(sweep.foundAt, 'and it must be where it was seeded').toBe(seeded);

    const state = await readRipState(game);
    expect(state.found).toBe(true);
    // Every sector up to and including the rip was paid for, and no further.
    expect(state.scans.filter(Boolean).length).toBe(sweep.visited.length);

    const notifications = await game.notifications();
    expect(notifications.some((text) => text && text.length > 0),
      'finding the rip tells the player').toBe(true);
  });

  test('with the balance spent out, the sectors go dark and a click does nothing', async ({ game, page }) => {
    // Spend the balance down to nothing through the galactic points ledger the
    // frame loop reads, then check the telescope reflects it.
    await game.withMods((m) => {
      const settled = (m.cg.getSettledStars() || []).length - 1;
      m.cg.setGalacticPointsSpent(settled);
    });
    await page.waitForTimeout(900);

    const labels = await scanLabels(page);
    const unscanned = labels.filter((label) => !label.scanned);
    expect(unscanned.every((label) => label.blocked && !label.lit),
      'no points, no scanning').toBe(true);

    const before = await readRipState(game);
    await clickSector(page, 8);
    await page.waitForTimeout(600);
    const after = await readRipState(game);

    expect(after.scans.filter(Boolean).length,
      'the sector handler refuses while its own label is dark')
      .toBe(before.scans.filter(Boolean).length);
  });
});

// ------------------------------------------------------ the telemetry economy

test.describe('Cosmic Rip — the telemetry economy', () => {
  test.beforeEach(async ({ game, page }) => {
    await game.boot();
    await stageSettledLedger(game, page, { systems: 60 });
    await restoreScannerArray(game, page);
    await openRipPane(game, page, 'cosmicRipNearSpaceScannerArrayOption');
    await sweepTelescopeUntilFound(game, page);
    await dismissAnyOpenModal(page);
  });

  test('deploying sensor buoys makes telemetry actually accrue', async ({ game, page }) => {
    const idle = await readRipState(game);
    expect(idle.buoys, 'no buoys before any are deployed').toBe(0);

    const beforeIdle = await game.withMods((m) => m.rdo.getResourceDataObject('cosmicRip', ['ripTelemetryData']));
    await page.waitForTimeout(2000);
    const afterIdle = await game.withMods((m) => m.rdo.getResourceDataObject('cosmicRip', ['ripTelemetryData']));
    expect(afterIdle, 'nothing deployed, nothing gathered').toBe(beforeIdle);

    await deploySensorBuoys(game, page, 5);
    await page.waitForTimeout(800);

    const deployed = await readRipState(game);
    expect(deployed.buoys, 'five buoys bought through the Deploy button').toBe(5);

    // Measure the pool rather than reading the rate field: the rate is written
    // by the purchase, the pool is written by the timer that has to be running.
    const start = await game.withMods((m) => ({
      q: m.rdo.getResourceDataObject('cosmicRip', ['ripTelemetryData']),
      t: Date.now()
    }));
    await page.waitForTimeout(4000);
    const end = await game.withMods((m) => ({
      q: m.rdo.getResourceDataObject('cosmicRip', ['ripTelemetryData']),
      t: Date.now()
    }));

    const perSecond = (end.q - start.q) / ((end.t - start.t) / 1000);
    const expectedPerSecond = await game.withMods((m) =>
      m.rdo.getResourceDataObject('cosmicRip', ['upgrades', 'sensorBuoy', 'rate'])
      * m.rdo.getResourceDataObject('cosmicRip', ['upgrades', 'sensorBuoy', 'quantity'])
      * m.cg.getTimerRateRatio());

    expect(perSecond, 'telemetry gathers at the rate the buoys advertise')
      .toBeGreaterThan(expectedPerSecond * 0.8);
    expect(perSecond).toBeLessThan(expectedPerSecond * 1.2);
  });

  test('a stabilisation tech reveals itself when the telemetry reaches its threshold', async ({ game, page }) => {
    const threshold = await game.withMods((m) =>
      m.rdo.getResourceDataObject('cosmicRip', ['techs', 'stabilizerArray', 'appearsAt'])[0]);

    await game.withMods((m, below) =>
      m.rdo.setResourceDataObject(below, 'cosmicRip', ['ripTelemetryData']), threshold - 200);
    await openRipPane(game, page, 'cosmicRipCosmicRipOption');
    await page.waitForTimeout(900);

    const hidden = await page.evaluate(() =>
      document.getElementById('cosmicRipStabilizerArrayRow')?.classList.contains('invisible'));
    expect(hidden, 'below the threshold the tech is not on offer').toBe(true);

    // Cross it with the buoys' own production rather than by writing the number.
    await deploySensorBuoys(game, page, 40);
    await openRipPane(game, page, 'cosmicRipCosmicRipOption');
    await page.waitForTimeout(4000);

    const state = await readRipState(game);
    const shown = await page.evaluate(() =>
      document.getElementById('cosmicRipStabilizerArrayRow')?.classList.contains('invisible'));

    expect(state.telemetry).toBeGreaterThan(threshold);
    expect(state.revealedTechs, 'crossing the threshold reveals it').toContain('stabilizerArray');
    expect(shown, 'and the pane shows its row').toBe(false);
  });
});

// -------------------------------------------------- stabilising, to the brink

test.describe('Cosmic Rip — stabilising the rip, up to the last button', () => {
  test('all five techs researched through their own buttons leave the rip one press from closed', async ({ game, page }) => {
    await game.boot();
    await stageSettledLedger(game, page, { systems: 60 });
    await restoreScannerArray(game, page);
    await openRipPane(game, page, 'cosmicRipNearSpaceScannerArrayOption');

    const sweep = await sweepTelescopeUntilFound(game, page);
    expect(sweep.foundAt, 'the rip has to be found before it can be stabilised').not.toBeNull();
    await dismissAnyOpenModal(page);

    // The five techs cost 150,000 telemetry between them. Deploying the buoys to
    // gather that in real time is not something a spec can wait out, so the pool
    // is stocked and what is played is the research itself.
    await game.withMods((m) => m.rdo.setResourceDataObject(1000000, 'cosmicRip', ['ripTelemetryData']));
    await openRipPane(game, page, 'cosmicRipCosmicRipOption');
    await page.waitForTimeout(900);

    const beforeAll = await closeRipState(page);
    expect(beforeAll.rowVisible, 'nothing researched, nothing to close').toBe(false);

    for (const tech of RIP_TECHS) {
      const gpBefore = await readRipState(game);
      const price = await game.withMods((m, name) =>
        m.rdo.getResourceDataObject('cosmicRip', ['techs', name, 'price']), tech);

      await researchRipTech(game, page, tech);

      // The research is a timer, not an instant purchase: the button gives way
      // to a progress bar and the tech is not unlocked until the bar runs out.
      const midway = await page.evaluate((name) => {
        const bar = document.getElementById(`cosmicRipTechProgressBarContainer_${name}`);
        const button = document.getElementById(`cosmicRipTechResearchButton_${name}`);
        return {
          barShown: Boolean(bar) && !bar.classList.contains('invisible'),
          buttonHidden: Boolean(button) && button.classList.contains('invisible')
        };
      }, tech);
      expect(midway.barShown, `${tech} should show its research progress bar`).toBe(true);
      expect(midway.buttonHidden, `${tech}'s button should stand down while it researches`).toBe(true);

      const duringTimer = await readRipState(game);
      expect(duringTimer.unlockedTechs,
        `${tech} must not be unlocked before its timer finishes`).not.toContain(tech);
      expect(gpBefore.telemetry - duringTimer.telemetry,
        `${tech} should charge its telemetry price up front`).toBeCloseTo(price, 4);
      expect(gpBefore.gp - duringTimer.gp, `${tech} also costs a galactic point`).toBe(1);

      // Each timer is one to five minutes; drive the delta manager rather than
      // waiting it down in real time.
      await game.advanceTimers(400000);
      await page.waitForTimeout(500);

      const done = await readRipState(game);
      expect(done.unlockedTechs, `${tech} should finish researching`).toContain(tech);
    }

    await dismissAnyOpenModal(page);
    await page.waitForTimeout(900);

    const stability = await page.evaluate(() => ({
      width: document.getElementById('cosmicRipStabilityProgressBar')?.style.width ?? null,
      text: document.getElementById('cosmicRipStabilityPercentageText')?.textContent?.trim() ?? null
    }));
    expect(stability.width, 'five of five techs is a fully stabilised rip').toBe('100%');
    expect(stability.text).toContain('100');

    // The Close The Rip row lives on the Situation pane and is revealed by the
    // frame loop once all five techs are in.
    await openRipPane(game, page, 'cosmicRipSituationOption');
    await page.waitForTimeout(900);

    const close = await closeRipState(page);
    expect(close.rowPresent).toBe(true);
    expect(close.rowVisible, 'all five researched reveals the last button').toBe(true);
    expect(close.ready, 'and with points still banked it is lit').toBe(true);
    expect(close.blocked).toBe(false);
    expect(close.pointerEvents, 'a lit button is genuinely pressable').not.toBe('none');

    // Deliberately not pressed. Closing the rip starts the end-game cinematic,
    // whose overlay never lifts, so this is the furthest the chapter can be
    // played and still leave a running game behind.
    expect(game.significantErrors(), 'playing the whole chapter must leave the console clean').toEqual([]);
  });

  test('with the points spent out, the last button is revealed but blocked', async ({ game, page }) => {
    await game.boot();
    // Exactly enough to restore, sweep and research: the balance ends at zero,
    // and the close costs one more.
    await stageSettledLedger(game, page, { systems: 60 });
    await restoreScannerArray(game, page);
    await openRipPane(game, page, 'cosmicRipNearSpaceScannerArrayOption');
    await sweepTelescopeUntilFound(game, page);
    await dismissAnyOpenModal(page);

    await game.withMods((m) => m.rdo.setResourceDataObject(1000000, 'cosmicRip', ['ripTelemetryData']));
    await openRipPane(game, page, 'cosmicRipCosmicRipOption');
    await page.waitForTimeout(700);

    for (const tech of RIP_TECHS) {
      await researchRipTech(game, page, tech);
      await game.advanceTimers(400000);
      await page.waitForTimeout(400);
    }
    await dismissAnyOpenModal(page);

    // Spend the remaining balance to nothing.
    await game.withMods((m) => {
      const settled = (m.cg.getSettledStars() || []).length - 1;
      m.cg.setGalacticPointsSpent(settled);
    });
    await openRipPane(game, page, 'cosmicRipSituationOption');
    await page.waitForTimeout(1000);

    const close = await closeRipState(page);
    expect(close.rowVisible, 'the work is done, so the row is shown').toBe(true);
    expect(close.ready, 'but the last galactic point has to be there to spend').toBe(false);
    expect(close.blocked).toBe(true);
  });
});
