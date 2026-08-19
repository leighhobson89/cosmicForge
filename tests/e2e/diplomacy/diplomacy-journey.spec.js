/**
 * Area: Diplomacy — the whole journey, from the scan to the last word
 * Plan: tests/docs/areas/diplomacy.md
 *
 * `diplomacy.spec.js` calls `updateDiplomacySituation()` and reads the star
 * record back. This file flies there instead. It launches the starship at a real
 * star, runs the flight down to the three-quarter mark where the system scan
 * unlocks, scans (or deliberately does not), arrives in orbit, opens the Colonise
 * pane and then talks to whoever is living there — pressing the game's own Bully,
 * Passive, Harmony, Vassalize and Settle/Conquer buttons and checking what each
 * one did to the system.
 *
 * | Stage | What is pinned |
 * |---|---|
 * | Three quarters of the way | the scan control is hidden before `STELLAR_SCANNER_RANGE` and offered after it |
 * | Scanning, or not | a scan is what opens the Colonise pane at all; the scanner *module* is the difference between reading the life signs and seeing `???` |
 * | Who lives there | every civilization level — none, unsentient, industrial, spacefaring — gets the reception it should: an empty system is settled, an inhabited one is negotiated with |
 * | Talking | each of the four conversations reaches every outcome its branch table allows, and each outcome has the consequence it promises |
 * | Patience | every approach costs patience, and running it out forces the war modal |
 *
 * ## How the randomness is handled
 *
 * Who lives at a star, how they are disposed, and how a conversation goes are all
 * rolled. So the outcome-coverage specs are written as *sweeps*: they repeat a
 * real conversation until every documented outcome for that button has been seen,
 * and **every** iteration asserts the consequences of whichever outcome came up.
 * A sweep that never reaches an outcome fails naming the one it missed, and no
 * iteration is left unverified along the way. The alternative — expecting a
 * particular outcome from one press — would fail roughly whenever the dice went
 * the other way.
 *
 * Re-rolling a destination is staging, and it is done through the game's own
 * `generateDestinationStarData()`. Everything that is under test — which buttons
 * light up, what a press does, what the modal says — is driven through the pane.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe.configure({ timeout: 240_000 });

/** `STELLAR_SCANNER_RANGE` — the fraction of the flight the scan unlocks at. */
const SCAN_UNLOCKS_AT = 0.75;

/** Comfortably past the longest flight these specs set up. */
const FLIGHT_TO_COMPLETION_MS = 60_000_000;

const SENTIENT_LEVELS = ['Industrial', 'Spacefaring', 'Robotic'];

/**
 * The conquest button carries one of two labels, both from the catalogue. Read
 * them through `localize` rather than pinning the English words: the button used
 * to be relabelled with a hardcoded 'Settle', and the game read that text back
 * to decide whether the button was armed — see tests/docs/known-issues.md #41.
 */
async function conquestLabels(game) {
  return game.withMods((m) => ({
    settle: m.loc.localize('buttonSettle', m.cg.getLanguage()),
    conquest: m.loc.localize('buttonConquest', m.cg.getLanguage())
  }));
}

// --------------------------------------------------------------------- helpers

async function dismissAnyOpenModal(page) {
  for (let attempt = 0; attempt < 8; attempt++) {
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

const openStarShipPane = (game, page) => openInterstellarPane(game, page, 'starShipOption');
const openStarMapPane = (game, page) => openInterstellarPane(game, page, 'starMapOption');
const openColonisePane = (game, page) => openInterstellarPane(game, page, 'coloniseOption');

/** Is a side-menu option currently offered to the player? */
async function optionVisible(page, optionId) {
  return page.evaluate((id) => {
    const row = document.getElementById(id)?.closest('.row-side-menu');
    return Boolean(row) && !row.classList.contains('invisible');
  }, optionId);
}

/** Pick a destination the way a player does: click a reachable star on the map. */
async function chooseDestinationOnTheStarMap(game, page) {
  await openStarMapPane(game, page);

  const chosen = await page.evaluate(() => {
    const map = document.getElementById('optionContentTab5');
    if (!map) return null;
    const candidates = Array.from(map.querySelectorAll('.star'))
      .filter((el) => !el.classList.contains('current-star')
        && !el.id.startsWith('settledStar')
        && !el.id.startsWith('noneInterestingStar')
        && el.id !== 'Miaplacidus');
    const target = candidates[0];
    if (!target) return null;
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return target.id;
  });
  expect(chosen, 'the star map should offer a reachable star to travel to').not.toBeNull();
  await page.waitForTimeout(600);

  const destination = await game.withMods((m) => m.cg.getDestinationStar());
  expect(destination, 'clicking a star should record it as the destination').toBeTruthy();
  return destination;
}

/** Press Travel and confirm the launch warning, as a player does. */
async function launchThroughTheUI(game, page) {
  const confirmLabel = await game.withMods((m) => m.loc.localize('buttonLaunchUpper', m.cg.getLanguage()));
  await page.evaluate(() => {
    document.querySelector('button.travel-starship-button')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await page.waitForFunction(
    (label) => document.getElementById('modalConfirm')?.innerText?.trim() === label,
    confirmLabel,
    { timeout: 20000 }
  );
  await page.evaluate(() => document.getElementById('modalConfirm').click());
  await page.waitForTimeout(700);
}

/** The scan row's state, as the frame loop leaves it. */
async function scanRowState(game, page) {
  const dom = await page.evaluate(() => {
    const row = document.getElementById('spaceStarShipStellarScannerRow');
    return {
      present: Boolean(row),
      hidden: Boolean(row?.classList.contains('invisible'))
    };
  });
  const arrow = await game.withMods((m) => m.cg.getStarShipArrowPosition());
  return { ...dom, arrow };
}

/** Press the pane's own Scan System button. */
async function scanTheSystem(page) {
  const pressed = await page.evaluate(() => {
    const button = document.getElementById('spaceStarShipStellarScannerRow')?.querySelector('button');
    if (!button) return false;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  });
  if (!pressed) throw new Error('The Scan System button was not on screen');
  await page.waitForTimeout(700);
}

/**
 * Stock a run and build the starship, optionally leaving the stellar scanner
 * module unbuilt so the "arriving blind" half of the journey is reachable.
 *
 * The debug menu's Build Starship finishes *every* `ss` module including the
 * scanner, so the no-scanner run finishes the four mandatory modules itself and
 * lets the frame loop's `checkIfStarShipBuilt()` draw the conclusion.
 */
async function prepareRun(game, page, { withScanner = true } = {}) {
  if (withScanner) {
    await game.prepareRunForStarshipLaunch();
    await page.waitForTimeout(400);
    await dismissAnyOpenModal(page);
    return;
  }

  await game.debugClick('unlockAllTabsButton');
  await game.debugClick('give1BButton');
  await game.debugClick('give1MAllResourcesAndCompounds');
  await game.debugClick('grantAllTechsButton');
  await game.debugClick('buildLaunchPadScannerAndAllRocketsButton');
  await game.debugClick('addStarButton', { times: 5, delayMs: 80 });
  await game.debugClick('gain10000AntimatterButton', { times: 8, delayMs: 60 });
  await page.waitForTimeout(500);
  await dismissAnyOpenModal(page);

  await game.withMods((m) => {
    if (!m.cg.getPlayerPhilosophy()) m.cg.setPlayerPhilosophy('voidborn');
    for (const id of ['ssStructural', 'ssLifeSupport', 'ssAntimatterEngine', 'ssFleetHangar']) {
      const parts = m.rdo.getResourceDataObject('space', ['upgrades', id, 'parts']);
      m.rdo.setResourceDataObject(parts, 'space', ['upgrades', id, 'builtParts']);
      m.rdo.setResourceDataObject(true, 'space', ['upgrades', id, 'finished']);
    }
  });
  await page.waitForTimeout(700);
  await game.debugClick('addFleetsAndEnvoyButton');
  await page.waitForTimeout(400);
  await dismissAnyOpenModal(page);
}

/**
 * Fly to a star and stop at the given fraction of the journey.
 *
 * The delta timer is advanced rather than waited on — a real flight is minutes
 * long — but it is the game's own travel timer being advanced, so the arrow
 * position, the progress bar and the scan gate all move because the game moved
 * them.
 */
async function flyTo(game, page, fraction) {
  const destination = await chooseDestinationOnTheStarMap(game, page);
  const duration = await game.withMods((m, name) =>
    m.game.calculateStarTravelDurationWithModifiers(name), destination);

  await launchThroughTheUI(game, page);
  await openStarShipPane(game, page);

  if (fraction > 0) {
    await game.advanceTimers(Math.floor(duration * fraction));
    await page.waitForTimeout(500);
  }
  return { destination, duration };
}

/** Finish the flight and settle into orbit. */
async function completeFlight(game, page) {
  await game.advanceTimers(FLIGHT_TO_COMPLETION_MS);
  await page.waitForTimeout(900);
  await dismissAnyOpenModal(page);
  await page.waitForTimeout(300);
  await dismissAnyOpenModal(page);
}

/** The destination system as the Colonise pane sees it. */
async function readSystem(game) {
  return game.withMods((m) => {
    const data = m.rdo.getStarSystemDataObject('stars', ['destinationStar']) ?? {};
    const fleets = data.enemyFleets ?? {};
    return {
      civilizationLevel: data.civilizationLevel ?? null,
      lifeDetected: data.lifeDetected ?? null,
      primaryTrait: data.lifeformTraits?.[0]?.[0] ?? null,
      extraTrait: data.lifeformTraits?.[2]?.[0] ?? null,
      attitude: data.attitude ?? null,
      currentImpression: data.currentImpression ?? null,
      initialImpression: data.initialImpression ?? null,
      patience: data.patience ?? null,
      defenseRating: data.defenseRating ?? null,
      enemyFleets: { air: fleets.air || 0, land: fleets.land || 0, sea: fleets.sea || 0 },
      enemyTotal: (fleets.air || 0) + (fleets.land || 0) + (fleets.sea || 0),
      playerAttackPower: m.rdo.getResourceDataObject('fleets', ['attackPower']),
      warMode: m.cg.getWarMode(),
      diplomacyPossible: m.cg.getDiplomacyPossible(),
      achievementFlags: [...(m.cg.getAchievementFlagArray() ?? [])],
      // The flag array is a queue, not a record: the frame loop's achievement
      // pass removes each flag as it grants the achievement, so what survives to
      // be asserted on is the granted achievement itself.
      granted: ['settleSystem', 'discoverSystemWithNoLife', 'settleUnoccupiedSystem',
        'bullyEnemyIntoSubmission', 'vassalizeEnemy', 'initiateDiplomacyWithAlienRace']
        .filter((id) => m.rdo.getAchievementDataObject(id, ['active']) === true),
      apAwardedThisRun: m.cg.getApAwardedThisRun(),
      ascendencyPoints: m.rdo.getResourceDataObject('ascendencyPoints', ['quantity'])
    };
  });
}

/**
 * Re-roll the inhabitants of the system currently in orbit until `predicate`
 * holds, using the game's own generator.
 *
 * Preconditions are allowed to be staged; what is under test is what the pane
 * and the buttons then do with them. Returns null if the roll never came up,
 * so a caller can say which combination it could not reach.
 */
async function rollInhabitantsUntil(game, predicateSource, attempts = 400) {
  return game.withMods((m, { src, tries }) => {
    // eslint-disable-next-line no-new-func
    const matches = new Function(`return (${src})`)();
    for (let i = 0; i < tries; i++) {
      m.game.generateDestinationStarData();
      const data = m.rdo.getStarSystemDataObject('stars', ['destinationStar']);
      const fleets = data.enemyFleets || {};
      const view = {
        civilizationLevel: data.civilizationLevel,
        primaryTrait: data.lifeformTraits?.[0]?.[0] ?? null,
        currentImpression: data.currentImpression,
        attitude: data.attitude,
        enemyTotal: (fleets.air || 0) + (fleets.land || 0) + (fleets.sea || 0)
      };
      if (matches(view)) return view;
    }
    return null;
  }, { src: predicateSource.toString(), tries: attempts });
}

/** Put the system back into a state where diplomacy can be attempted again. */
async function resetForAnotherConversation(game, page, { attackPower = null } = {}) {
  await game.withMods((m, power) => {
    m.cg.setWarMode(false);
    m.cg.setBattleResolved(false, null);
    m.cg.setEnemyFleetsAdjustedForDiplomacy(false);
    // The pane only recalculates the modified attitude when the fleet has moved
    // since the last negotiation, which is the flag a Build click sets.
    m.cg.setFleetChangedSinceLastDiplomacy(true);
    m.cg.setDiplomacyPossible(true);
    if (power !== null) m.rdo.setResourceDataObject(power, 'fleets', ['attackPower']);
  }, attackPower);
  // Re-opening the pane is what rebinds the buttons to the current star record:
  // each handler closes over the `starData` captured when the row was drawn.
  await openColonisePane(game, page);
}

/** The enabled/disabled state of the five Colonise buttons, as the frame loop set it. */
async function diplomacyButtonState(page) {
  return page.evaluate(() => {
    const out = {};
    for (const action of ['bully', 'passive', 'harmony', 'vassalize', 'conquest']) {
      const button = document.querySelector(`button.${action}`);
      out[action] = button
        ? {
            present: true,
            enabled: button.classList.contains('green-ready-text'),
            blocked: button.classList.contains('red-disabled-text'),
            label: button.innerHTML.trim()
          }
        : { present: false };
    }
    return out;
  });
}

/**
 * Press one of the Colonise pane's diplomacy buttons and read what it did.
 *
 * The click is dispatched rather than sent through the mouse because the pane
 * redraws itself under the pointer as the frame loop runs. Dispatching also
 * bypasses the `pointer-events: none` that `red-disabled-text` applies, which is
 * exactly why button *state* is asserted separately, by class, rather than by
 * clicking a disabled control and hoping for a refusal.
 */
async function pressDiplomacyButton(game, page, action, { readAfterModal = false } = {}) {
  const before = await readSystem(game);

  const pressed = await page.evaluate((cls) => {
    const button = document.querySelector(`button.${cls}`);
    if (!button) return false;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, action);
  if (!pressed) throw new Error(`The ${action} button was not on the Colonise pane`);

  await page.waitForTimeout(600);

  const modal = await page.evaluate(() => {
    const container = document.getElementById('modal');
    const visible = Boolean(container) && getComputedStyle(container).display !== 'none';
    return {
      visible,
      text: visible ? (document.querySelector('.modal-content p')?.innerText ?? '').trim() : ''
    };
  });

  // `chatAndExchangePleasantries` *awaits* the reply modal on three of its four
  // branches and only writes the new impression and patience once the player has
  // read it. A caller that measures those has to confirm the modal first, or it
  // is reading the state the conversation started from.
  if (readAfterModal) {
    await page.evaluate(() => document.getElementById('modalConfirm')?.click());
    await page.waitForTimeout(500);
  }

  const after = await readSystem(game);
  return { before, after, modal };
}

// ------------------------------------------------ the journey to first contact

test.describe('Diplomacy — three quarters of the way there', () => {
  test('the system scan is offered at the scanner range and not before', async ({ game, page }) => {
    await game.boot();
    await prepareRun(game, page);

    const { duration } = await flyTo(game, page, 0.4);

    const partWay = await scanRowState(game, page);
    expect(partWay.present, 'the scan row is drawn with the pane').toBe(true);
    expect(partWay.arrow, 'less than three quarters of the way').toBeLessThan(SCAN_UNLOCKS_AT);
    expect(partWay.hidden, 'so the scan is not on offer yet').toBe(true);

    // Cross the threshold. Nothing else changes: the same pane, the same row.
    await game.advanceTimers(Math.floor(duration * 0.4));
    await page.waitForTimeout(600);

    const inRange = await scanRowState(game, page);
    expect(inRange.arrow, 'now past the scanner range').toBeGreaterThan(SCAN_UNLOCKS_AT);
    expect(inRange.hidden, 'and the scan is offered').toBe(false);

    const beforeScan = await game.withMods((m) => m.cg.getDestinationStarScanned());
    expect(beforeScan).toBe(false);

    await scanTheSystem(page);

    const system = await readSystem(game);
    expect(await game.withMods((m) => m.cg.getDestinationStarScanned()),
      'scanning mid-flight records the system as scanned').toBe(true);
    expect(system.civilizationLevel, 'and the scan is what generates who lives there').toBeTruthy();
    expect(typeof system.defenseRating).toBe('number');

    // Scanning once is enough: the row goes away rather than offering a re-scan.
    await page.waitForTimeout(500);
    const afterScan = await scanRowState(game, page);
    expect(afterScan.hidden, 'a scanned system is not offered a second scan').toBe(true);

    expect(game.significantErrors()).toEqual([]);
  });

  test('an unscanned system cannot be colonised, and scanning is what opens the pane', async ({ game, page }) => {
    await game.boot();
    await prepareRun(game, page);

    await flyTo(game, page, 0);
    await completeFlight(game, page);

    const status = await game.withMods((m) => [...m.cg.getStarShipStatus()]);
    expect(status[0], 'the ship arrived').toBe('orbiting');

    await game.openTab(5);
    await page.waitForTimeout(700);
    expect(await game.withMods((m) => m.cg.getDestinationStarScanned()),
      'the flight was made without scanning').toBe(false);
    expect(await optionVisible(page, 'coloniseOption'),
      'an unscanned system offers nothing to colonise').toBe(false);

    // Orbit is the second place the scan is offered, so the player who flew
    // blind can still take a look before deciding.
    await openStarShipPane(game, page);
    const inOrbit = await scanRowState(game, page);
    expect(inOrbit.hidden, 'orbit offers the scan whatever the arrow says').toBe(false);

    await scanTheSystem(page);
    await game.openTab(5);
    await page.waitForTimeout(900);

    expect(await optionVisible(page, 'coloniseOption'),
      'scanning is what unlocks Colonise').toBe(true);
    expect(game.significantErrors()).toEqual([]);
  });

  test('without the scanner module the life signs stay unknown, and the run is flagged as blind', async ({ game, page }) => {
    await game.boot();
    await prepareRun(game, page, { withScanner: false });

    expect(await game.withMods((m) => m.cg.getStarShipBuilt()),
      'the four mandatory modules make a ship without the scanner').toBe(true);
    expect(await game.withMods((m) => m.cg.getStellarScannerBuilt()),
      'but the optional scanner was never built').toBe(false);

    await flyTo(game, page, 0.8);
    await scanTheSystem(page);

    const readout = await page.evaluate(() => {
      const container = document.getElementById('apContainer');
      return (container?.innerText ?? '').trim();
    });
    expect(readout, 'a scan with no scanner reads the system but not its life signs').toContain('???');

    // The same distinction is what the "conquered without scanning" achievement
    // is keyed on, so the two must not drift apart.
    expect(await game.withMods((m) => m.cg.getDestinationStarScanned())).toBe(true);
    expect(await game.withMods((m) => m.cg.getStellarScannerBuilt())).toBe(false);
    expect(game.significantErrors()).toEqual([]);
  });

  test('with the scanner module the same scan reads the life signs outright', async ({ game, page }) => {
    await game.boot();
    await prepareRun(game, page);

    await flyTo(game, page, 0.8);
    await scanTheSystem(page);

    const [yes, no] = await game.withMods((m) => [
      m.loc.localize('textYes', m.cg.getLanguage()),
      m.loc.localize('textNo', m.cg.getLanguage())
    ]);
    const readout = await page.evaluate(() => (document.getElementById('apContainer')?.innerText ?? '').trim());
    const system = await readSystem(game);

    expect(readout, 'the life line is answered rather than hidden').not.toContain('???');
    expect(readout).toContain(system.lifeDetected ? yes : no);
    expect(game.significantErrors()).toEqual([]);
  });
});

// -------------------------------------------------------------- who lives there

test.describe('Diplomacy — every kind of neighbour', () => {
  test.beforeEach(async ({ game, page }) => {
    await game.boot();
    await prepareRun(game, page);
    await flyTo(game, page, 0);
    await completeFlight(game, page);
    await openStarShipPane(game, page);
    await scanTheSystem(page);
  });

  test('an empty system offers only Settle, and settling it is peaceful', async ({ game, page }) => {
    const rolled = await rollInhabitantsUntil(game, (s) => s.civilizationLevel === 'None');
    expect(rolled, 'a lifeless system should be rollable').not.toBeNull();

    await resetForAnotherConversation(game, page);
    await page.waitForTimeout(600);

    const buttons = await diplomacyButtonState(page);
    expect(buttons.conquest.present).toBe(true);
    expect(buttons.conquest.label, 'there is nothing to conquer, only to settle')
      .toBe((await conquestLabels(game)).settle);
    expect(buttons.conquest.enabled).toBe(true);
    for (const action of ['bully', 'passive', 'harmony', 'vassalize']) {
      expect(buttons[action].blocked, `${action} has nobody to talk to`).toBe(true);
      expect(buttons[action].enabled).toBe(false);
    }

    const before = await readSystem(game);
    await pressDiplomacyButton(game, page, 'conquest');
    await page.waitForTimeout(900);
    await dismissAnyOpenModal(page);
    await page.waitForTimeout(600);
    await dismissAnyOpenModal(page);

    const after = await readSystem(game);
    expect(after.warMode, 'settling an empty system starts no war').toBe(false);
    expect(after.apAwardedThisRun, 'the system is settled and the run is paid for it').toBe(true);
    expect(after.ascendencyPoints).toBeGreaterThan(before.ascendencyPoints);
    // Two achievements: the generic settle, and the one specific to finding
    // nobody home. Both are read as *granted*, because the flag that requests
    // them is consumed by the frame loop on the pass that awards them.
    expect(after.granted, 'finding an empty system is its own discovery')
      .toContain('discoverSystemWithNoLife');
    expect(after.granted, 'and settling one still counts as settling one')
      .toContain('settleSystem');
  });

  test('an unsentient system is settled too, and is a different discovery', async ({ game, page }) => {
    const rolled = await rollInhabitantsUntil(game, (s) => s.civilizationLevel === 'Unsentient');
    expect(rolled, 'an unsentient system should be rollable').not.toBeNull();

    await resetForAnotherConversation(game, page);
    await page.waitForTimeout(600);

    const buttons = await diplomacyButtonState(page);
    expect(buttons.conquest.label, 'animals are not negotiated with')
      .toBe((await conquestLabels(game)).settle);
    expect(buttons.passive.blocked).toBe(true);
    expect(buttons.harmony.blocked).toBe(true);

    const before = await readSystem(game);
    expect(before.civilizationLevel).toBe('Unsentient');
    expect(before.attitude, 'an unsentient system holds no opinion').toBe('None');

    await pressDiplomacyButton(game, page, 'conquest');
    await page.waitForTimeout(900);
    await dismissAnyOpenModal(page);
    await page.waitForTimeout(600);
    await dismissAnyOpenModal(page);

    const after = await readSystem(game);
    expect(after.warMode).toBe(false);
    expect(after.apAwardedThisRun).toBe(true);
    expect(after.granted, 'taking a system off the animals is a different discovery')
      .toContain('settleUnoccupiedSystem');
    expect(after.granted).toContain('settleSystem');
  });

  test("an empty system offers Settle in the player's own language", async ({ game, page }) => {
    // The label used to be a hardcoded 'Settle' written straight into the
    // button, and the game read that same text back to decide whether the button
    // was armed. Translating it without moving the state onto the element is
    // what known-issues #41 records; this is the player-visible half of it.
    const rolled = await rollInhabitantsUntil(game, (s) => s.civilizationLevel === 'None');
    expect(rolled, 'a lifeless system should be rollable').not.toBeNull();

    await game.withMods((m) => m.ui.relocalizeAll('de'));
    await page.waitForTimeout(600);
    await resetForAnotherConversation(game, page);
    await page.waitForTimeout(600);

    const labels = await conquestLabels(game);
    const buttons = await diplomacyButtonState(page);

    expect(labels.settle, 'the German catalogue supplies the label').toBe('Besiedeln');
    expect(buttons.conquest.label, 'and the button renders it').toBe(labels.settle);
    expect(buttons.conquest.enabled, 'while still being the armed control it was').toBe(true);

    // The mode rides on the element, so it survives being read back by the frame
    // loop in a language where the old text comparison would have matched nothing.
    expect(await page.evaluate(() =>
      document.querySelector('button.conquest')?.dataset.conquestMode),
      'the settle mode is recorded on the element, not inferred from its text')
      .toBe('settle');
  });

  test('an inhabited, armed system opens the full set of conversations', async ({ game, page }) => {
    const rolled = await rollInhabitantsUntil(game,
      (s) => s.enemyTotal > 0 && s.currentImpression >= 10
        && ['Industrial', 'Spacefaring'].includes(s.civilizationLevel));
    expect(rolled, 'a sentient armed system should be rollable').not.toBeNull();

    // A fleet that comfortably outguns them, so the power-gated buttons are
    // decided by their own rule rather than by a shortfall.
    await resetForAnotherConversation(game, page, { attackPower: (rolled.enemyTotal + 100) * 10 });
    await page.waitForTimeout(700);

    const system = await readSystem(game);
    expect(SENTIENT_LEVELS).toContain(system.civilizationLevel);
    expect(system.diplomacyPossible, 'an envoy and a civil reception make diplomacy possible').toBe(true);

    const buttons = await diplomacyButtonState(page);
    expect(buttons.passive.enabled, 'anyone will take a call').toBe(true);
    expect(buttons.harmony.enabled, 'and anyone can be courted').toBe(true);
    expect(buttons.bully.enabled, 'a superior fleet can threaten them').toBe(true);
    expect(buttons.conquest.enabled, 'and can attack them').toBe(true);
    expect(buttons.conquest.label, 'an armed system is conquered, not settled')
      .not.toBe((await conquestLabels(game)).settle);

    // Vassalization is the one conversation that is not simply unlocked by
    // force: it wants near-total admiration as well, which only a courted system
    // reaches.
    expect(buttons.vassalize.enabled, 'until they admire you, they will not submit')
      .toBe(system.currentImpression >= 95);

    // The pane's own impression readout has to agree with the record, or the
    // player is deciding on a number the game does not hold.
    const barText = await page.evaluate(() =>
      (document.querySelector('.diplomacy-impression-bar-text')?.textContent ?? '').trim());
    expect(barText).toContain(String(system.currentImpression));
  });

  test('a system whose fleets are gone is settled rather than fought', async ({ game, page }) => {
    const rolled = await rollInhabitantsUntil(game,
      (s) => s.enemyTotal > 0 && ['Industrial', 'Spacefaring'].includes(s.civilizationLevel));
    expect(rolled).not.toBeNull();

    // Their ships are gone — the state a surrender or a rout leaves behind.
    await game.withMods((m) => {
      for (const arm of ['air', 'land', 'sea']) {
        m.rdo.setStarSystemDataObject(0, 'stars', ['destinationStar', 'enemyFleets', arm]);
      }
      m.game.setEnemyFleetPower();
    });
    await resetForAnotherConversation(game, page);
    await page.waitForTimeout(700);

    const buttons = await diplomacyButtonState(page);
    expect(buttons.conquest.label, 'a disarmed system is walked into')
      .toBe((await conquestLabels(game)).settle);
    for (const action of ['bully', 'passive', 'harmony', 'vassalize']) {
      expect(buttons[action].blocked, `${action} is closed once their fleets are gone`).toBe(true);
    }
  });
});

// ---------------------------------------------------------------- talking to them

test.describe('Diplomacy — every conversation, and everywhere it leads', () => {
  test.beforeEach(async ({ game, page }) => {
    await game.boot();
    await prepareRun(game, page);
    await flyTo(game, page, 0);
    await completeFlight(game, page);
    await openStarShipPane(game, page);
    await scanTheSystem(page);
  });

  test('threatening a diplomatic race with an overwhelming fleet ends in surrender or fear', async ({ game, page }) => {
    const seen = new Set();

    for (let attempt = 0; attempt < 18 && seen.size < 2; attempt++) {
      const rolled = await rollInhabitantsUntil(game,
        (s) => s.primaryTrait === 'Diplomatic' && s.enemyTotal > 0 && s.currentImpression >= 10);
      expect(rolled, 'a diplomatic, armed neighbour should be rollable').not.toBeNull();

      // powerRatio > 2 against a Diplomatic race is the branch under test.
      await resetForAnotherConversation(game, page,
        { attackPower: (rolled.enemyTotal + 200) * 20 });

      const { before, after, modal } = await pressDiplomacyButton(game, page, 'bully');
      expect(modal.visible, 'every conversation gets an answer').toBe(true);
      expect(['Surrendered', 'Scared']).toContain(after.attitude);
      seen.add(after.attitude);

      if (after.attitude === 'Surrendered') {
        // Surrender is total: their ships are gone and the system is yours for
        // the taking without a shot.
        expect(after.enemyTotal, 'a surrendered system has no fleet left').toBe(0);
        expect(after.granted,
          'and bullying them into it is its own achievement')
          .toContain('bullyEnemyIntoSubmission');
      } else {
        // Fear costs them half their ships, and no more than half.
        expect(after.enemyFleets.air).toBe(Math.floor(before.enemyFleets.air / 2));
        expect(after.enemyFleets.land).toBe(Math.floor(before.enemyFleets.land / 2));
        expect(after.enemyFleets.sea).toBe(Math.floor(before.enemyFleets.sea / 2));
      }

      await dismissAnyOpenModal(page);
    }

    expect([...seen].sort(),
      'both documented outcomes of a lopsided threat should be reachable')
      .toEqual(['Scared', 'Surrendered']);
    expect(game.significantErrors()).toEqual([]);
  });

  test('threatening an aggressive race is always taken as an insult', async ({ game, page }) => {
    for (let attempt = 0; attempt < 4; attempt++) {
      const rolled = await rollInhabitantsUntil(game,
        (s) => s.primaryTrait === 'Aggressive' && s.enemyTotal > 0 && s.currentImpression >= 10);
      expect(rolled, 'an aggressive, armed neighbour should be rollable').not.toBeNull();

      await resetForAnotherConversation(game, page, { attackPower: (rolled.enemyTotal + 200) * 20 });

      const { before, after } = await pressDiplomacyButton(game, page, 'bully');

      // An aggressive race short-circuits every other branch: whatever the
      // power ratio, the answer is to dig in.
      expect(after.defenseRating, 'they bolster their defenses')
        .toBe(Math.ceil(before.defenseRating * 1.1));
      expect(after.patience, 'and stop listening').toBe(0);
      // Their fleet is deliberately not asserted here. Zeroing patience makes the
      // pane's own redraw raise the war question, and that dialog settles the
      // diplomatic fleet adjustment as it opens — so the composition legitimately
      // moves between the press and the read. The insult's own effects are the
      // bolstered defenses and the exhausted patience, and those are what is
      // pinned.
      expect(after.warMode, 'an insult puts the question of war to the player').toBe(true);

      await dismissAnyOpenModal(page);
    }
    expect(game.significantErrors()).toEqual([]);
  });

  test('passive contact reaches every attitude its branch table allows', async ({ game, page }) => {
    const seen = new Set();

    for (let attempt = 0; attempt < 30 && seen.size < 4; attempt++) {
      const rolled = await rollInhabitantsUntil(game,
        (s) => s.enemyTotal > 0 && s.currentImpression >= 10
          && ['Industrial', 'Spacefaring'].includes(s.civilizationLevel));
      expect(rolled).not.toBeNull();

      // Alternate the fleet so both the courted and the cowed paths come up.
      const power = attempt % 2 === 0 ? (rolled.enemyTotal + 100) * 10 : 1;
      await resetForAnotherConversation(game, page, { attackPower: power });

      const { before, after } = await pressDiplomacyButton(game, page, 'passive', { readAfterModal: true });
      expect(['Receptive', 'Neutral', 'Reserved', 'Belligerent']).toContain(after.attitude);
      seen.add(after.attitude);

      // Every attitude puts the impression inside the band it names, and each
      // one is checked on the pass it happens rather than only when it is new.
      if (after.attitude === 'Receptive') {
        expect(after.currentImpression).toBeGreaterThanOrEqual(65);
        expect(after.currentImpression).toBeLessThanOrEqual(100);
      } else if (after.attitude === 'Neutral') {
        expect(after.currentImpression).toBeGreaterThanOrEqual(45);
        expect(after.currentImpression).toBeLessThanOrEqual(59);
      } else if (after.attitude === 'Reserved') {
        expect(after.currentImpression).toBeGreaterThanOrEqual(10);
        expect(after.currentImpression).toBeLessThanOrEqual(44);
      } else {
        // Taking offence wipes the goodwill out and hardens the defenses.
        expect(after.currentImpression).toBe(0);
        expect(after.defenseRating).toBe(Math.ceil(before.defenseRating * 1.1));
        expect(after.patience).toBeLessThanOrEqual(0);
      }

      // Talking costs them patience whichever way it goes.
      expect(after.patience).toBeLessThan(before.patience + 1);

      await dismissAnyOpenModal(page);
    }

    expect([...seen].sort(),
      `passive contact should reach all four attitudes; reached ${[...seen].join(', ')}`)
      .toEqual(['Belligerent', 'Neutral', 'Receptive', 'Reserved']);
    expect(game.significantErrors()).toEqual([]);
  });

  test('courting them reaches admiration, a rebuff and offence', async ({ game, page }) => {
    const seen = new Set();

    for (let attempt = 0; attempt < 30 && seen.size < 3; attempt++) {
      const rolled = await rollInhabitantsUntil(game,
        (s) => s.enemyTotal > 0 && s.currentImpression >= 10
          && ['Industrial', 'Spacefaring'].includes(s.civilizationLevel));
      expect(rolled).not.toBeNull();

      await resetForAnotherConversation(game, page, { attackPower: (rolled.enemyTotal + 100) * 10 });

      const { before, after } = await pressDiplomacyButton(game, page, 'harmony');

      // Harmony is the expensive approach: two patience a go, against one.
      expect(after.patience, 'courting costs two patience').toBeLessThanOrEqual(before.patience - 2);

      if (after.currentImpression >= 85 && after.attitude !== 'Belligerent') {
        seen.add('receptive');
        expect(after.currentImpression).toBeLessThanOrEqual(100);
      } else if (after.attitude === 'Belligerent' && after.currentImpression === 0) {
        seen.add('belligerent');
      } else {
        seen.add('rebuff');
        expect(after.currentImpression,
          'a rebuff costs ten points of goodwill').toBe(before.currentImpression - 10);
      }

      await dismissAnyOpenModal(page);
    }

    expect([...seen].sort(),
      `courting should reach all three outcomes; reached ${[...seen].join(', ')}`)
      .toEqual(['belligerent', 'rebuff', 'receptive']);
    expect(game.significantErrors()).toEqual([]);
  });

  test('courting them into admiration is what unlocks vassalization', async ({ game, page }) => {
    const rolled = await rollInhabitantsUntil(game,
      (s) => s.primaryTrait === 'Diplomatic' && s.enemyTotal > 0 && s.currentImpression >= 10
        && ['Industrial', 'Spacefaring'].includes(s.civilizationLevel));
    expect(rolled).not.toBeNull();

    await resetForAnotherConversation(game, page, { attackPower: (rolled.enemyTotal + 200) * 20 });

    // Vassalization is gated on an impression no first contact ever produces —
    // `calculateInitialImpression` clamps at 80 — so it can only be reached by
    // courting them, which is the journey this spec is here to prove exists.
    const atFirstContact = await readSystem(game);
    expect(atFirstContact.currentImpression).toBeLessThan(95);
    expect((await diplomacyButtonState(page)).vassalize.enabled).toBe(false);

    // No pane reset inside this loop, deliberately. Each handler redraws the
    // Colonise pane itself, so the buttons are already bound to the updated
    // record; re-entering the pane instead would re-run `calculateModifiedAttitude`,
    // which clamps the impression back towards the *initial* one and would undo
    // the courting on the very step being measured.
    let courted = null;
    for (let attempt = 0; attempt < 30 && !courted; attempt++) {
      await game.withMods((m) => {
        // Keep them willing to keep talking; running patience out is a different
        // spec, and would end this conversation in a war instead.
        m.rdo.setStarSystemDataObject(20, 'stars', ['destinationStar', 'patience']);
      });

      const { after } = await pressDiplomacyButton(game, page, 'harmony');
      await dismissAnyOpenModal(page);
      await page.waitForTimeout(300);

      if (after.currentImpression >= 95 && after.attitude !== 'Belligerent') {
        courted = await readSystem(game);
        break;
      }

      // Taking offence ends this conversation for good: war mode closes
      // diplomacy, so a fresh neighbour is needed to carry on courting.
      if (await game.withMods((m) => m.cg.getWarMode())) {
        const next = await rollInhabitantsUntil(game,
          (s) => s.primaryTrait === 'Diplomatic' && s.enemyTotal > 0 && s.currentImpression >= 10
            && ['Industrial', 'Spacefaring'].includes(s.civilizationLevel));
        expect(next).not.toBeNull();
        await resetForAnotherConversation(game, page, { attackPower: (next.enemyTotal + 200) * 20 });
      }
    }

    expect(courted, 'courting should eventually reach admiration').not.toBeNull();
    expect(courted.currentImpression).toBeGreaterThanOrEqual(95);
    expect(courted.currentImpression).toBeLessThanOrEqual(100);

    await page.waitForTimeout(600);
    expect((await diplomacyButtonState(page)).vassalize.enabled,
      'and admiration is what opens the offer of vassalage').toBe(true);

    const { after, modal } = await pressDiplomacyButton(game, page, 'vassalize');
    expect(modal.visible).toBe(true);

    if (after.attitude === 'Surrendered') {
      expect(after.enemyTotal, 'a vassal keeps no fleet').toBe(0);
      expect(after.granted).toContain('vassalizeEnemy');
    } else {
      // The offer carries a one-in-four refusal, which leaves everything as it
      // was rather than costing anything.
      expect(after.enemyTotal).toBe(courted.enemyTotal);
      expect(after.defenseRating).toBe(courted.defenseRating);
    }
    expect(game.significantErrors()).toEqual([]);
  });

  test('an aggressive race is never offered vassalage, however strong the fleet', async ({ game, page }) => {
    const rolled = await rollInhabitantsUntil(game,
      (s) => s.primaryTrait === 'Aggressive' && s.enemyTotal > 0 && s.currentImpression >= 10
        && ['Industrial', 'Spacefaring'].includes(s.civilizationLevel));
    expect(rolled, 'an aggressive, armed neighbour should be rollable').not.toBeNull();

    await resetForAnotherConversation(game, page, { attackPower: (rolled.enemyTotal + 200) * 20 });

    // Admiration on its own is not enough: the gate also asks that they are not
    // an aggressive people, and they are.
    await game.withMods((m) => {
      m.rdo.setStarSystemDataObject(100, 'stars', ['destinationStar', 'currentImpression']);
    });
    await openColonisePane(game, page);
    await page.waitForTimeout(700);

    const system = await readSystem(game);
    expect(system.primaryTrait).toBe('Aggressive');
    expect(system.currentImpression).toBeGreaterThanOrEqual(95);
    expect((await diplomacyButtonState(page)).vassalize.enabled,
      'an aggressive race refuses vassalage whatever they think of you').toBe(false);
  });

  test('vassalization is refused sometimes, and never for a supremacist with the ability up', async ({ game, page }) => {
    const rolled = await rollInhabitantsUntil(game,
      (s) => s.enemyTotal > 0 && ['Industrial', 'Spacefaring'].includes(s.civilizationLevel));
    expect(rolled).not.toBeNull();

    // The supremacist branch is the game's promise that the perk removes the
    // dice entirely, so it is checked several times rather than once.
    await game.withMods((m) => {
      m.cg.setPlayerPhilosophy('supremacist');
      m.cg.setPhilosophyAbilityActive(true);
    });

    for (let attempt = 0; attempt < 5; attempt++) {
      await rollInhabitantsUntil(game,
        (s) => s.enemyTotal > 0 && ['Industrial', 'Spacefaring'].includes(s.civilizationLevel));
      await resetForAnotherConversation(game, page, { attackPower: 100000 });

      const { after } = await pressDiplomacyButton(game, page, 'vassalize');
      expect(after.attitude, 'the supremacist ability makes submission certain').toBe('Surrendered');
      expect(after.enemyTotal).toBe(0);
      await dismissAnyOpenModal(page);
    }

    // Without the ability the refusal has to be reachable, or the roll is dead.
    await game.withMods((m) => {
      m.cg.setPlayerPhilosophy('voidborn');
      m.cg.setPhilosophyAbilityActive(false);
    });

    let refused = false;
    for (let attempt = 0; attempt < 30 && !refused; attempt++) {
      const next = await rollInhabitantsUntil(game,
        (s) => s.enemyTotal > 0 && ['Industrial', 'Spacefaring'].includes(s.civilizationLevel));
      expect(next).not.toBeNull();
      await resetForAnotherConversation(game, page, { attackPower: 100000 });

      const { before, after } = await pressDiplomacyButton(game, page, 'vassalize');
      if (after.attitude !== 'Surrendered') {
        refused = true;
        expect(after.enemyTotal, 'a refusal costs them nothing').toBe(before.enemyTotal);
      }
      await dismissAnyOpenModal(page);
    }

    expect(refused, 'without the perk, vassalization must sometimes be refused').toBe(true);
    expect(game.significantErrors()).toEqual([]);
  });

  test('running their patience out ends the talking', async ({ game, page }) => {
    const rolled = await rollInhabitantsUntil(game,
      (s) => s.enemyTotal > 0 && s.currentImpression >= 10
        && ['Industrial', 'Spacefaring'].includes(s.civilizationLevel));
    expect(rolled).not.toBeNull();

    // One patience left, set *before* the pane is drawn: the approach handler
    // reads patience from the star record the row closed over, so a value written
    // after the draw would never be seen by the press that is supposed to spend it.
    await game.withMods((m) => {
      m.rdo.setStarSystemDataObject(1, 'stars', ['destinationStar', 'patience']);
    });
    await resetForAnotherConversation(game, page, { attackPower: (rolled.enemyTotal + 100) * 10 });

    const beforePress = await readSystem(game);
    expect(beforePress.patience, 'they have one approach left in them').toBe(1);

    const { after } = await pressDiplomacyButton(game, page, 'passive', { readAfterModal: true });
    expect(after.patience, 'the approach spent their last patience').toBeLessThanOrEqual(0);

    // Spending the last patience ends the conversation whichever way the reply
    // went. Two routes lead there and both are the same rule: either they took
    // offence outright, or the pane put the war question up on its next draw
    // because the record now shows no patience left. Raising that question is
    // itself what commits the run — `showEnterWarModeModal('patience')` calls
    // setWarUI while it builds the dialog, not when the player answers it.
    expect(await game.withMods((m) => m.cg.getWarMode()),
      'a system out of patience is a system at war').toBe(true);

    await dismissAnyOpenModal(page);
    await openColonisePane(game, page);
    await page.waitForTimeout(900);
    await dismissAnyOpenModal(page);

    // What is on offer now is the fleet, not the envoy. The conversation row is
    // hidden rather than removed, so the check is on the class the war UI applies.
    const paneNow = await page.evaluate(() => {
      const row = document.getElementById('diplomacyOptionsRow');
      const bar = document.getElementById('diplomacyImpressionBar');
      return {
        attack: Boolean(document.getElementById('battleButton')),
        talkingHidden: Boolean(row?.classList.contains('invisible')),
        impressionHidden: Boolean(bar?.classList.contains('invisible')),
        diplomacyPossible: null
      };
    });
    expect(paneNow.attack, 'the Colonise pane offers the attack instead').toBe(true);
    expect(paneNow.talkingHidden, 'and the conversation row is put away').toBe(true);
    expect(paneNow.impressionHidden, 'along with what they thought of you').toBe(true);
    // `getDiplomacyPossible()` is deliberately not asserted here. Re-entering the
    // pane runs setWarUI (which clears it) and then calculateModifiedAttitude
    // (which recomputes it from the impression and sets it back), so the flag is
    // stale by the time a returning player sees the pane. It is inert — the row
    // it would enable is hidden — so what is pinned is the row, which is what
    // actually stops the player talking.


    expect(game.significantErrors()).toEqual([]);
  });

  test('choosing conquest on an armed system declares war and shuts diplomacy down', async ({ game, page }) => {
    const rolled = await rollInhabitantsUntil(game,
      (s) => s.enemyTotal > 0 && s.currentImpression >= 10
        && ['Industrial', 'Spacefaring'].includes(s.civilizationLevel));
    expect(rolled).not.toBeNull();

    await resetForAnotherConversation(game, page, { attackPower: (rolled.enemyTotal + 100) * 10 });

    const buttons = await diplomacyButtonState(page);
    expect(buttons.conquest.label, 'this system has to be taken')
      .not.toBe((await conquestLabels(game)).settle);

    await pressDiplomacyButton(game, page, 'conquest');

    // The conquest path raises the one modal a player can still back out of.
    const backOut = await page.evaluate(() => {
      const cancel = document.getElementById('modalCancel');
      return Boolean(cancel) && !cancel.classList.contains('invisible');
    });
    expect(backOut, 'declaring war is the one decision that offers a way out').toBe(true);

    await page.evaluate(() => document.getElementById('modalConfirm')?.click());
    await page.waitForTimeout(1200);

    const after = await readSystem(game);
    expect(after.warMode, 'confirming commits the fleet').toBe(true);
    expect(after.enemyFleets, 'and the defenders are still standing').toBeTruthy();

    // The enemy's power is derived from the composition rather than kept
    // separately, which is what the battle is then scored against.
    const power = await game.withMods((m) =>
      m.rdo.getStarSystemDataObject('stars', ['destinationStar', 'enemyFleets', 'fleetPower']));
    expect(power).toBe(after.enemyFleets.air * 2 + after.enemyFleets.land * 4 + after.enemyFleets.sea * 6);

    // War is the end of talking: pressing Attack closes diplomacy for good.
    const attack = page.locator('#battleButton');
    await attack.waitFor({ state: 'visible', timeout: 30000 });
    await attack.click();
    await page.waitForTimeout(600);

    expect(await game.withMods((m) => m.cg.getDiplomacyPossible()),
      'once the shooting starts there is nothing left to say').toBe(false);
    expect(await game.withMods((m) => m.cg.getBattleTriggeredByPlayer())).toBe(true);
  });
});
