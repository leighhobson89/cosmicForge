/**
 * Area: Colonisation — a system taken by force, and everything that follows
 * Plan: tests/docs/areas/colonise.md
 *
 * `colonise.spec.js` and `settled-stars.spec.js` cover the bookkeeping around
 * `settledStars` by calling its setter. This file wins an actual battle and then
 * follows the consequences all the way through a rebirth: the achievements the
 * victory grants, the ascendency points it pays, the moment the settled list
 * finally grows, and the star turning up on the map as somewhere the player owns.
 *
 * | Stage | What is pinned |
 * |---|---|
 * | The victory | the battle is fought to a decision on the canvas, the defenders are wiped out, and the system is settled off the back of it |
 * | The achievements | `settleSystem` and `conquerEnemy` are *granted*, not merely flagged — and a hive-mind defender adds its own |
 * | The reward | a conquest pays double the star's ascendency points, once per run |
 * | The settled list | a victory does **not** grow it; the rebirth that moves the run to the conquered system does |
 * | The map | the system left behind is drawn as a settled star, tagged as such, and the new one is the current star |
 * | The next run | the rebirth carries the ascendency points over and turns the conquest into a galactic point |
 *
 * ## Why the victory is reliable
 *
 * Enemy fleet counts are randomised per star by design, so a spec that fights a
 * randomly-composed defender cannot assert who wins — `battle-live.spec.js`
 * covers that case and asserts only what holds for either outcome. The specs
 * here need a *win* to have anything to follow, so they choose the engagement:
 * a destination is rolled until its defenders are few, and the debug scenario's
 * hundred and twenty ships go up against a dozen. The battle itself is entirely
 * real — the same canvas, the same frame loop, the same Attack button — only the
 * matchup is chosen, exactly as a player choosing a soft target would choose it.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe.configure({ timeout: 420_000 });

/** Defenders few enough that a full debug fleet is not going to lose to them. */
const BEATABLE_DEFENDERS = 12;

// --------------------------------------------------------------------- helpers

async function dismissAnyOpenModal(page, rounds = 8) {
  for (let attempt = 0; attempt < rounds; attempt++) {
    const closed = await page.evaluate(() => {
      const confirm = document.getElementById('modalConfirm');
      if (confirm?.offsetParent) { confirm.click(); return true; }
      const cancel = document.getElementById('modalCancel');
      if (cancel?.offsetParent) { cancel.click(); return true; }
      return false;
    });
    if (!closed) return;
    await page.waitForTimeout(400);
  }
}

/**
 * Open a side-menu option by id.
 *
 * The pane matters more than it looks for Colonise: `coloniseChecks()` in the
 * frame loop is gated on `getCurrentOptionPane() === 'colonise'`, so with any
 * other pane open the battle is built but never fought.
 */
async function openOptionById(game, page, optionId, tabIndex = 5) {
  await game.openTab(tabIndex);
  await page.evaluate((id) => {
    const el = document.getElementById(id);
    el?.classList.remove('invisible');
    el?.closest('.row-side-menu')?.classList.remove('invisible');
    el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, optionId);
  await page.waitForTimeout(700);
}

/** Comfortably past the longest flight these specs set up. */
const FLIGHT_TO_COMPLETION_MS = 60_000_000;

/**
 * Fly to a real star and scan it.
 *
 * Not shortcut-able: `rebirth()` refuses to run without a destination record
 * carrying a `starCode`, and that field is written by
 * `copyStarDataToDestinationStarField` — which only the scan calls. A run that
 * pointed `destinationStar` at a name without flying there would settle happily
 * and then fail to rebirth, which is the half of this flow the specs are here
 * to follow.
 */
async function arriveAndScan(game, page) {
  await openOptionById(game, page, 'starMapOption');

  const chosen = await page.evaluate(() => {
    const map = document.getElementById('optionContentTab5');
    const candidates = Array.from(map?.querySelectorAll('.star') ?? [])
      // Factory stars and O-types double the ascendency payout and pull the
      // megastructure branch in with them; both are their own areas, and both
      // would make the payment arithmetic here mean something different.
      .filter((el) => !el.classList.contains('current-star')
        && !el.classList.contains('factory-star')
        && !el.classList.contains('o-star')
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

  // The flight is minutes long in real time; the game's own travel timer is
  // advanced rather than waited on.
  await game.advanceTimers(FLIGHT_TO_COMPLETION_MS);
  await page.waitForTimeout(1000);
  await dismissAnyOpenModal(page);

  await openOptionById(game, page, 'starShipOption');
  const scanned = await page.evaluate(() => {
    const button = document.getElementById('spaceStarShipStellarScannerRow')?.querySelector('button');
    if (!button) return false;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  });
  expect(scanned, 'orbit should offer the system scan').toBe(true);
  await page.waitForTimeout(800);

  const status = await game.withMods((m) => ({
    status: [...m.cg.getStarShipStatus()],
    scanned: m.cg.getDestinationStarScanned(),
    starCode: m.rdo.getStarSystemDataObject('stars', ['destinationStar'], true)?.starCode ?? null
  }));
  expect(status.status[0], 'the ship arrived').toBe('orbiting');
  expect(status.scanned).toBe(true);
  expect(status.starCode, 'the scan writes the star code rebirth later needs').toBeTruthy();
}

/** Everything the conquest and its aftermath touch. */
async function readRunState(game) {
  return game.withMods((m) => {
    const star = m.rdo.getStarSystemDataObject('stars', ['destinationStar']) ?? {};
    const fleets = star.enemyFleets ?? {};
    const achievementIds = [
      'settleSystem', 'conquerEnemy', 'conquerHiveMindEnemy', 'conquerBelligerentEnemy',
      'conquerEnemyWithoutScanning', 'settleUnoccupiedSystem', 'discoverSystemWithNoLife',
      'rebirth', 'conquerMegastructureSystem'
    ];
    return {
      destination: m.cg.getDestinationStar(),
      currentStarSystem: m.cg.getCurrentStarSystem(),
      settledStars: [...(m.cg.getSettledStars() ?? [])],
      ascendencyPoints: m.rdo.getResourceDataObject('ascendencyPoints', ['quantity']),
      apAwardedThisRun: m.cg.getApAwardedThisRun(),
      starAscendencyPoints: star.ascendencyPoints ?? null,
      civilizationLevel: star.civilizationLevel ?? null,
      extraTrait: star.lifeformTraits?.[2]?.[0] ?? null,
      enemyTotal: (fleets.air || 0) + (fleets.land || 0) + (fleets.sea || 0),
      battleResolved: [...(m.cg.getBattleResolved() ?? [])],
      rebirthPossible: m.cg.getRebirthPossible(),
      statRun: m.cg.getStatRun(),
      galacticPoints: Number(m.rdo.getCosmicRipGalacticPoints?.() ?? 0),
      granted: achievementIds.filter((id) => m.rdo.getAchievementDataObject(id, ['active']) === true),
      // Several conquest achievements pay ascendency points of their own on
      // being granted, so the settlement payment can only be checked once
      // theirs is known.
      achievementAp: Object.fromEntries(achievementIds.map((id) => {
        const gives = m.rdo.getAchievementDataObject(id, ['gives'], true);
        return [id, gives?.gives1 === 'ascendencyPoints' ? (gives.value1?.quantity ?? 0) : 0];
      })),
      isFactoryStar: Boolean(m.rdo.getStarSystemDataObject('stars', [String(m.cg.getDestinationStar() || '').toLowerCase(), 'factoryStar'], true)),
      starType: m.rdo.getStarSystemDataObject('stars', [String(m.cg.getDestinationStar() || '').toLowerCase(), 'starType'], true) ?? null,
      playerAttackPower: m.rdo.getResourceDataObject('fleets', ['attackPower'])
    };
  });
}

/**
 * Roll the destination system until `predicate` holds, using the game's own
 * generator, then optionally trim the garrison.
 *
 * Trimming is the same state a rout or a surrender leaves behind, and it is what
 * makes the engagement one the player can be expected to win. Everything under
 * test after this point — the battle, the settle, the rebirth — is untouched.
 */
async function rollDestinationUntil(game, predicateSource, { trimTo = null, attempts = 600 } = {}) {
  return game.withMods((m, { src, tries, trim }) => {
    // eslint-disable-next-line no-new-func
    const matches = new Function(`return (${src})`)();
    for (let i = 0; i < tries; i++) {
      m.game.generateDestinationStarData();
      const data = m.rdo.getStarSystemDataObject('stars', ['destinationStar']);
      const fleets = data.enemyFleets || {};
      const view = {
        civilizationLevel: data.civilizationLevel,
        primaryTrait: data.lifeformTraits?.[0]?.[0] ?? null,
        extraTrait: data.lifeformTraits?.[2]?.[0] ?? null,
        currentImpression: data.currentImpression,
        defenseRating: data.defenseRating,
        enemyTotal: (fleets.air || 0) + (fleets.land || 0) + (fleets.sea || 0)
      };
      if (!matches(view)) continue;

      if (trim !== null && view.enemyTotal > trim) {
        // Keep at least one of each arm the system actually fielded, so the
        // battle still has all the unit types it would have had.
        const scale = trim / view.enemyTotal;
        for (const arm of ['air', 'land', 'sea']) {
          const had = fleets[arm] || 0;
          const kept = had > 0 ? Math.max(1, Math.floor(had * scale)) : 0;
          m.rdo.setStarSystemDataObject(kept, 'stars', ['destinationStar', 'enemyFleets', arm]);
        }
        m.game.setEnemyFleetPower();
        const after = m.rdo.getStarSystemDataObject('stars', ['destinationStar', 'enemyFleets']);
        view.enemyTotal = (after.air || 0) + (after.land || 0) + (after.sea || 0);
      }
      return view;
    }
    return null;
  }, { src: predicateSource.toString(), tries: attempts, trim: trimTo });
}

/** Get to a fought battle: Colonise pane open, war declared, Attack pressed. */
async function fightFor(game, page, rolled) {
  await openOptionById(game, page, 'coloniseOption');
  const pane = await game.withMods((m) => m.cg.getCurrentOptionPane());
  expect(pane, 'the frame loop only fights while the Colonise pane is open').toBe('colonise');

  await game.withMods((m) => {
    m.cg.setWarMode(false);
    m.cg.setBattleResolved(false, null);
    m.cg.setNeedNewBattleCanvas(true);
  });

  const before = await readRunState(game);
  expect(before.enemyTotal, 'there has to be somebody to fight').toBeGreaterThan(0);
  expect(before.playerAttackPower, 'and a fleet to fight them with').toBeGreaterThan(0);

  const starData = await game.withMods((m) => m.rdo.getStarSystemDataObject('stars', ['destinationStar']));
  await game.withMods((m, data) => m.game.updateDiplomacySituation('conquest', data), starData);
  await dismissAnyOpenModal(page, 4);
  await page.waitForTimeout(1200);

  // Declaring war only lines the fleets up. Nothing moves until Attack is
  // pressed: `assignGoalToUnits()` hands out goals only when
  // `getBattleTriggeredByPlayer()` is set, and one click sets it.
  const attack = page.locator('#battleButton');
  await attack.waitFor({ state: 'visible', timeout: 30000 });
  await attack.click();
  await page.waitForTimeout(500);

  expect(await game.withMods((m) => m.cg.getBattleTriggeredByPlayer()),
    'Attack should have triggered the engagement').toBe(true);

  const field = await game.withMods((m) => {
    const units = m.cg.getBattleUnits();
    return { player: units?.player?.length ?? 0, enemy: units?.enemy?.length ?? 0 };
  });
  expect(field.player, 'both sides must be on the canvas').toBeGreaterThan(0);
  expect(field.enemy).toBeGreaterThan(0);
  expect(field.player, 'and the matchup must be the lopsided one this spec chose')
    .toBeGreaterThan(field.enemy);

  return { before, rolled };
}

/** Wait for the frame loop to fight the battle to a decision and settle after it. */
async function waitForVictory(game, page, timeoutMs = 240000) {
  await page.waitForFunction(
    () => globalThis.__mods.cg.getBattleResolved()[0] === true,
    undefined,
    { timeout: timeoutMs }
  );
  // Settling raises a chain of modals — the run-1 leader introduction and the
  // battle result — and only finishes once they are answered.
  await page.waitForTimeout(1500);
  await dismissAnyOpenModal(page);
  await page.waitForTimeout(800);
  await dismissAnyOpenModal(page);
  await page.waitForTimeout(800);

  const state = await readRunState(game);
  expect(state.battleResolved[0]).toBe(true);
  expect(state.battleResolved[1],
    'the chosen matchup was meant to be unlosable; a defeat here is worth looking at')
    .toBe('player');
  return state;
}

/** Take the run through the real Rebirth button and its confirmation. */
async function rebirthThroughTheUI(game, page) {
  await openOptionById(game, page, 'rebirthOption', 7);

  const button = await page.evaluate(() => {
    const el = document.querySelector('button.rebirth-check');
    if (!el) return null;
    return { enabled: !el.disabled, ready: el.classList.contains('green-ready-text') };
  });
  expect(button, 'the Rebirth pane should offer a Rebirth button').not.toBeNull();
  expect(button.enabled, 'a won run should be able to rebirth').toBe(true);
  expect(button.ready).toBe(true);

  await page.evaluate(() => {
    document.querySelector('button.rebirth-check')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await page.waitForTimeout(700);

  // The confirmation is the real one, with a cancel the player could take.
  const confirmable = await page.evaluate(() => {
    const cancel = document.getElementById('modalCancel');
    return Boolean(cancel) && !cancel.classList.contains('invisible');
  });
  expect(confirmable, 'rebirth asks before it tears the run down').toBe(true);

  await page.evaluate(() => document.getElementById('modalConfirm')?.click());
  await page.waitForTimeout(2500);
  await dismissAnyOpenModal(page);
  await page.waitForTimeout(1200);
  await dismissAnyOpenModal(page);
  await page.waitForTimeout(800);
}

// ------------------------------------------------------------- winning a system

test.describe('Colonisation — a system won in battle', () => {
  test('the victory settles the system, pays double ascendency points, and grants both achievements', async ({ game, page }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await arriveAndScan(game, page);

    const rolled = await rollDestinationUntil(game,
      (s) => s.enemyTotal > 0 && ['Industrial', 'Spacefaring'].includes(s.civilizationLevel),
      { trimTo: BEATABLE_DEFENDERS });
    expect(rolled, 'an armed, inhabited system should be rollable').not.toBeNull();

    const { before } = await fightFor(game, page, rolled);
    expect(before.apAwardedThisRun, 'nothing has been won yet').toBe(false);
    expect(before.granted, 'and nothing has been settled yet').not.toContain('settleSystem');

    const after = await waitForVictory(game, page);

    // The victory is real: the defenders are gone from the record, not just
    // marked as beaten.
    expect(after.enemyTotal, 'a routed system fields nothing').toBe(0);

    // Both achievements, read as *granted*. The flag array they travel on is a
    // queue the frame loop empties as it awards them, so a flag assertion would
    // pass or fail on timing rather than on the award.
    expect(after.granted, 'taking a system counts as settling it').toContain('settleSystem');
    expect(after.granted, 'and beating its defenders is its own achievement').toContain('conquerEnemy');

    // A conquest pays double the system's own worth — `apModifier` is 2 for the
    // battle and surrender access points and 1 for a peaceful settle — plus
    // whatever the achievements it unlocked pay on top. Both halves are counted,
    // because the total is the only observable and asserting the settlement
    // alone would silently absorb a change to either.
    expect(before.starAscendencyPoints, 'the star has to be worth something').toBeGreaterThan(0);
    expect(before.isFactoryStar, 'this spec deliberately takes an ordinary system').toBe(false);
    expect(before.starType, 'and not an O-type, which would double the payout again').not.toBe('O');

    const settlementAp = Math.floor(before.starAscendencyPoints * 2);
    const achievementAp = after.granted
      .filter((id) => !before.granted.includes(id))
      .reduce((total, id) => total + (after.achievementAp[id] ?? 0), 0);

    expect(settlementAp, 'the settlement is worth something on its own').toBeGreaterThan(0);
    expect(after.ascendencyPoints - before.ascendencyPoints,
      'the conquest pays twice the star, plus what the achievements it unlocked pay')
      .toBe(settlementAp + achievementAp);
    expect(after.apAwardedThisRun, 'and the run is marked as paid so it cannot be paid twice').toBe(true);

    // The settled list is a rebirth-time concern. This is the single most
    // commonly mis-assumed thing about the flow: the only two callers of
    // `setSettledStars` are both inside `rebirth()`.
    expect(after.settledStars, 'winning does not settle the list').toEqual(before.settledStars);

    expect(game.significantErrors()).toEqual([]);
  });

  test('beating a hive-mind defender adds the achievement that only they carry', async ({ game, page }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await arriveAndScan(game, page);

    const rolled = await rollDestinationUntil(game,
      (s) => s.enemyTotal > 0 && s.extraTrait === 'Hive Mind'
        && ['Industrial', 'Spacefaring'].includes(s.civilizationLevel),
      { trimTo: BEATABLE_DEFENDERS });
    expect(rolled, 'a hive-mind system should be rollable').not.toBeNull();
    expect(rolled.extraTrait).toBe('Hive Mind');

    await fightFor(game, page, rolled);
    const after = await waitForVictory(game, page);

    expect(after.granted).toContain('conquerEnemy');
    expect(after.granted, 'and the hive mind is a distinct conquest')
      .toContain('conquerHiveMindEnemy');
    expect(game.significantErrors()).toEqual([]);
  });

  test('a won run unlocks rebirth, and an unwon one does not', async ({ game, page }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await arriveAndScan(game, page);

    const rolled = await rollDestinationUntil(game,
      (s) => s.enemyTotal > 0 && ['Industrial', 'Spacefaring'].includes(s.civilizationLevel),
      { trimTo: BEATABLE_DEFENDERS });
    expect(rolled).not.toBeNull();

    const { before } = await fightFor(game, page, rolled);
    expect(before.rebirthPossible, 'a run with everything still to play for cannot rebirth').toBe(false);

    await waitForVictory(game, page);

    // rebirthChecks() in the frame loop is what flips this, off the back of the
    // resolved battle — so it needs the loop to have run, not just the settle.
    await page.waitForTimeout(1200);
    const after = await readRunState(game);
    expect(after.rebirthPossible, 'winning the run is what makes rebirth possible').toBe(true);

    expect(game.significantErrors()).toEqual([]);
  });
});

// -------------------------------------------------------- the move to the system

test.describe('Colonisation — the settled star, and the run that follows', () => {
  test('rebirth moves the run to the conquered system, settles it, and shows it on the map', async ({ game, page }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await arriveAndScan(game, page);

    const rolled = await rollDestinationUntil(game,
      (s) => s.enemyTotal > 0 && ['Industrial', 'Spacefaring'].includes(s.civilizationLevel),
      { trimTo: BEATABLE_DEFENDERS });
    expect(rolled).not.toBeNull();

    const { before } = await fightFor(game, page, rolled);
    const conqueredStar = before.destination;
    const previousHome = before.currentStarSystem.toLowerCase();

    const won = await waitForVictory(game, page);
    expect(won.settledStars.map((s) => s.toLowerCase()))
      .toEqual([previousHome]);
    const apBeforeRebirth = won.ascendencyPoints;

    await page.waitForTimeout(1200);
    await rebirthThroughTheUI(game, page);

    const next = await readRunState(game);

    // The run has moved: the conquered system is now home, and the list of what
    // the player owns has grown by exactly the one system they took.
    expect(next.currentStarSystem.toLowerCase(),
      'the run continues in the system that was won').toBe(conqueredStar.toLowerCase());
    expect(next.settledStars.map((s) => s.toLowerCase()),
      'and that system joins the settled list at rebirth, not before')
      .toEqual([previousHome, conqueredStar.toLowerCase()]);
    expect(next.statRun, 'the run counter moves on').toBe(won.statRun + 1);
    expect(next.granted, 'and rebirthing is itself an achievement').toContain('rebirth');

    // The reward for colonising survives the reset: ascendency points are the
    // permanent currency the next run is built with.
    expect(next.ascendencyPoints,
      'ascendency points carry over into the new run').toBeGreaterThanOrEqual(apBeforeRebirth);

    // One conquered system is one galactic point, which is what buys the cosmic
    // rip upgrades.
    expect(next.galacticPoints - won.galacticPoints,
      'the conquest is worth a galactic point').toBe(1);

    // And the map says so. The system left behind is drawn as a settled star,
    // with its own id prefix and the settled tag; the new one is the current star.
    await openOptionById(game, page, 'starMapOption');
    await page.waitForTimeout(1200);

    const settledTag = await game.withMods((m) => m.loc.localize('textStarTagSettled', m.cg.getLanguage()));
    const map = await page.evaluate((names) => {
      const container = document.getElementById('optionContentTab5');
      const settled = Array.from(container?.querySelectorAll('.settled-star') ?? []).map((el) => ({
        id: el.id,
        titler: el.getAttribute('titler') || ''
      }));
      const current = Array.from(container?.querySelectorAll('.current-star') ?? []).map((el) => el.id);
      return { settled, current, previousName: names.previous, conqueredName: names.conquered };
    }, { previous: previousHome, conquered: conqueredStar.toLowerCase() });

    const settledIds = map.settled.map((s) => s.id.toLowerCase());
    expect(settledIds, 'the system the run came from is drawn as settled')
      .toContain(`settledstar${previousHome}`);

    const previousStarOnMap = map.settled.find((s) => s.id.toLowerCase() === `settledstar${previousHome}`);
    expect(previousStarOnMap.titler, 'and is labelled as owned')
      .toContain(settledTag);

    expect(map.current.map((id) => id.toLowerCase()),
      'while the conquered system is now the current one')
      .toContain(conqueredStar.toLowerCase());

    expect(game.significantErrors()).toEqual([]);
  });
});
