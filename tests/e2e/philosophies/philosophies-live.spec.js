/**
 * Area: Philosophies — played through the Philosophy pane
 * Plan: tests/docs/areas/philosophies.md
 *
 * `philosophies.spec.js` pins the catalogue, the choice modal and the shape of
 * the four branches. Not one of its effect specs ever pressed a button on the
 * Philosophy pane: they called `setResourceAutobuyerPricesAfterRepeatables()`
 * and friends directly, which proves the effect function multiplies a number
 * and proves nothing about whether a player can *buy* the upgrade that runs it.
 *
 * This file buys all twenty upgrades — the special ability and four repeatables
 * on each of the four paths — through their own buttons, and then exercises a
 * scenario that uses each one.
 *
 * ## The run-2 gate, which shapes every test here
 *
 * The Philosophy pane does not exist on run 1. `rebirth()` reveals
 * `#philosophyOption` only in its `rebirthCalledOnRun1` branch, and three of the
 * four special abilities additionally check `getStatRun() > 1` at the point of
 * use. So a spec that wants to buy anything on this pane has to *play a whole
 * run and rebirth out of it first*, which is what `startRunTwoAs()` does:
 *
 *   boot -> choose the path in the real modal (raised by the star-study timer)
 *        -> prepareRunForStarshipLaunch()      the debug scenario chain
 *        -> scan a destination, win the battle
 *        -> press Rebirth on the Galactic tab and confirm the modal
 *        -> prepareRunForStarshipLaunch() again, to re-tech the new run
 *
 * The philosophy itself is chosen through `startInvestigateStarTimer`'s
 * completion modal rather than `setPlayerPhilosophy`, because that modal is the
 * only place in the game where the choice is made, and because it is the thing
 * that has to keep working for any of this to be reachable at all.
 *
 * ## What a purchase actually does
 *
 * Each row's button calls `gain(..., 'techUnlockPhilosophy', ..., 'techsPhilosophy', 'research')`,
 * which deducts the price from research immediately and queues the price rise;
 * the frame loop applies it as `Math.ceil(price * GAME_COST_MULTIPLIER)`. The
 * repeatable handlers then increment their own slot in
 * `repeatableTechMultipliers` and call their one effect function. The special
 * ability instead falls into `gain`'s `elementId === 'ability'` branch and only
 * sets `philosophyAbilityActive`.
 *
 * Clicks are dispatched at the element rather than performed with the mouse.
 * These buttons carry `red-disabled-text` (`pointer-events: none`) whenever the
 * player cannot afford them, and that CSS gate is the intended affordability
 * mechanism — see known-issues #17. The gate is asserted as a class, separately,
 * by `the buttons report affordability through the colour class`.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/**
 * The twenty upgrades, keyed by path.
 *
 * `slot` is the `idWithinCategory` the repeatable occupies, which is also its
 * key in `repeatableTechMultipliers` and the index
 * `addPhilosophyRepeatablesBackInAfterRebirth` replays it from.
 */
const PATHS = {
  constructor: {
    ability: { key: 'spaceStorageTankResearch', rowId: 'techPhilosophySpaceStorageTankResearchRow' },
    repeatables: [
      { slot: 1, key: 'efficientAssembly', rowId: 'techPhilosophyEfficientAssemblyRow', affects: 'space' },
      { slot: 2, key: 'laserMining', rowId: 'techPhilosophyLaserMiningRow', affects: 'resources' },
      { slot: 3, key: 'massCompoundAssembly', rowId: 'techPhilosophyMassCompoundAssemblyRow', affects: 'compounds' },
      { slot: 4, key: 'energyDrones', rowId: 'techPhilosophyEnergyDronesRow', affects: 'buildings' }
    ]
  },
  supremacist: {
    ability: { key: 'fleetHolograms', rowId: 'techPhilosophyFleetHologramsRow' },
    repeatables: [
      { slot: 1, key: 'hangarAutomation', rowId: 'techPhilosophyHangarAutomationRow', affects: 'fleetCosts' },
      { slot: 2, key: 'syntheticPlating', rowId: 'techPhilosophySyntheticPlatingRow', affects: 'fleetHealth' },
      { slot: 3, key: 'antimatterEngineMinaturization', rowId: 'techPhilosophyAntimatterEngineMinaturizationRow', affects: 'fleetSpeed' },
      { slot: 4, key: 'laserIntensityResearch', rowId: 'techPhilosophyLaserIntensityResearchRow', affects: 'fleetAttackPower' }
    ]
  },
  voidborn: {
    ability: { key: 'voidSeers', rowId: 'techPhilosophyVoidSeersRow' },
    repeatables: [
      { slot: 1, key: 'stellarWhispers', rowId: 'techPhilosophyStellarWhispersRow', affects: 'initialImpression' },
      { slot: 2, key: 'stellarInsightManifold', rowId: 'techPhilosophyStellarInsightManifoldRow', affects: 'starStudy' },
      { slot: 3, key: 'asteroidDwellers', rowId: 'techPhilosophyAsteroidDwellersRow', affects: 'asteroidSearch' },
      { slot: 4, key: 'ascendencyPhilosophy', rowId: 'techPhilosophyAscendencyPhilosophyRow', affects: 'ascendencyPoints' }
    ]
  },
  expansionist: {
    ability: { key: 'rapidExpansion', rowId: 'techPhilosophyRapidExpansionRow' },
    repeatables: [
      { slot: 1, key: 'spaceElevator', rowId: 'techPhilosophySpaceElevatorRow', affects: 'starshipPartsCost' },
      { slot: 2, key: 'launchPadMassProduction', rowId: 'techPhilosophyLaunchPadMassProductionRow', affects: 'rocketPartsCost' },
      { slot: 3, key: 'asteroidAttractors', rowId: 'techPhilosophyAsteroidAttractorsRow', affects: 'rocketTravelTime' },
      { slot: 4, key: 'warpDrive', rowId: 'techPhilosophyWarpDriveRow', affects: 'starshipTravelTime' }
    ]
  }
};

const PHILOSOPHIES = Object.keys(PATHS);

/** Which choice-modal button selects which path. */
const CHOICE_BUTTON = {
  constructor: '#modalConfirm',
  supremacist: '#modalCancel',
  voidborn: '#modalExtraChoice1',
  expansionist: '#modalExtraChoice2'
};

/** `Math.ceil(price * GAME_COST_MULTIPLIER)` — the rise applied after every purchase. */
const COST_MULTIPLIER = 1.13;

// --------------------------------------------------------------------- helpers

/**
 * Close whatever modal is currently up.
 *
 * `callPopupModal` waits for an open modal to finish closing before binding its
 * own handlers, so a confirmation clicked while an earlier prompt is still on
 * screen lands on the wrong dialog. The debug setup chain and the philosophy
 * choice both leave modals behind, so this runs between the stages.
 */
async function dismissAnyOpenModal(page) {
  for (let attempt = 0; attempt < 5; attempt++) {
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
 * Choose a philosophy by answering the game's own choice modal.
 *
 * The modal is built in one place only: the completion branch of
 * `startInvestigateStarTimer`, gated on `!getPlayerPhilosophy()`. The timer is a
 * repeating delta timer counting `adjustment[0]` down, so seeding a short
 * remainder and letting the live frame loop run it fires the real handler in
 * under a second instead of the usual forty minutes.
 *
 * The countdown pauses unless the telescope has power and neither competing
 * telescope action is running, and `canContinue` is re-derived every frame — so
 * the power itself has to be on, not merely the flag.
 */
async function choosePhilosophyThroughModal(game, philosophy) {
  await game.withMods((m) => {
    m.cg.setPlayerPhilosophy(undefined);
    m.cg.setPowerOnOff(true);
    m.cg.setCurrentlySearchingAsteroid(false);
    m.cg.setCurrentlyPillagingVoid(false);
    m.cg.setStarInvestigationTimerCanContinue(true);
    m.game.startInvestigateStarTimer([400]);
  });

  await game.page.locator('#modalExtraChoice2').waitFor({ state: 'visible', timeout: 20000 });
  await game.page.click(CHOICE_BUTTON[philosophy]);
  await game.page.waitForTimeout(500);

  const chosen = await game.withMods((m) => m.cg.getPlayerPhilosophy());
  if (chosen !== philosophy) {
    throw new Error(`Choice modal recorded ${chosen} when ${philosophy} was picked`);
  }
}

/**
 * Put the run in the state a player reaches by travelling to a system and
 * scanning it. That record — `starSystems.stars.destinationStar` — is what
 * `rebirth()` rebuilds the next run around, and every rebirth consumes it.
 */
async function scanDestinationSystem(game, starName) {
  const staged = await game.withMods((m, name) => {
    m.game.generateStarDataAndAddToDataObject({ id: name }, 12);
    m.cg.setDestinationStar(name);
    m.rdo.copyStarDataToDestinationStarField(name);
    m.cg.setDestinationStarScanned(true);
    return Boolean(m.rdo.getStarSystemDataObject('stars', ['destinationStar'], true));
  }, starName);
  if (!staged) throw new Error(`Could not stage a scanned destination at ${starName}`);
}

/** Open the Rebirth pane on the Galactic tab, revealing its side-menu row first. */
async function openRebirthPane(game, page) {
  await dismissAnyOpenModal(page);
  await game.openTab(7);
  await page.evaluate(() => {
    const el = document.getElementById('rebirthOption');
    el?.closest('.row-side-menu')?.classList.remove('invisible');
    el?.classList.remove('invisible');
    el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await page.waitForTimeout(800);
}

/**
 * Press Rebirth and confirm the modal — the player's route through the reset.
 *
 * The confirmation is matched on its localized confirm label rather than on
 * "whatever modal is up", so this cannot pass by dismissing some other dialog.
 */
async function rebirthThroughTheUI(game, page) {
  const runBefore = await game.withMods((m) => m.cg.getStatRun());
  const confirmLabel = await game.withMods((m) => m.loc.localize('modalRebirthConfirmLabel', m.cg.getLanguage()));

  await page.evaluate(() => document.querySelector('.rebirth-check')?.click());
  await page.waitForFunction(
    (label) => document.getElementById('modalConfirm')?.innerText?.trim() === label,
    confirmLabel,
    { timeout: 15000 }
  );
  await page.evaluate(() => document.getElementById('modalConfirm').click());

  await page.waitForFunction(
    (before) => globalThis.__mods.cg.getStatRun() === before + 1,
    runBefore,
    { timeout: 20000 }
  );
  await page.waitForTimeout(800);
  return runBefore + 1;
}

/**
 * Boot, choose `philosophy` in the real modal, play the run out and rebirth into
 * run 2 with a fully teched board.
 *
 * The second `prepareRunForStarshipLaunch()` is not decoration: the rebirth
 * wipes techs, buildings and research, and most of the effects measured below
 * are prices on rows that only exist once the run is teched again.
 */
async function startRunTwoAs(game, page, philosophy, { destination = 'vega' } = {}) {
  await game.boot();
  await choosePhilosophyThroughModal(game, philosophy);
  await dismissAnyOpenModal(page);

  await game.prepareRunForStarshipLaunch();
  await dismissAnyOpenModal(page);

  await scanDestinationSystem(game, destination);
  // Winning the battle at the destination is what earns the rebirth; the frame
  // loop turns that into `rebirthPossible` inside `rebirthChecks()`.
  await game.withMods((m) => m.cg.setBattleResolved(true, 'player'));
  await openRebirthPane(game, page);
  const run = await rebirthThroughTheUI(game, page);
  if (run !== 2) throw new Error(`Expected to land on run 2, landed on run ${run}`);

  await dismissAnyOpenModal(page);
  await game.prepareRunForStarshipLaunch();
  await dismissAnyOpenModal(page);

  const state = await game.withMods((m) => ({
    run: m.cg.getStatRun(),
    philosophy: m.cg.getPlayerPhilosophy()
  }));
  if (state.philosophy !== philosophy) {
    throw new Error(`Philosophy became ${state.philosophy} across the rebirth, expected ${philosophy}`);
  }
  return state;
}

/**
 * Open the Philosophy pane on the Research tab.
 *
 * The side-menu row is revealed by `rebirth()` on the run-1 rebirth; clearing
 * `invisible` here is a reachability precondition, and the reveal itself is
 * asserted by its own spec below.
 */
async function openPhilosophyPane(game, page) {
  await dismissAnyOpenModal(page);
  await game.openTab(3);
  await page.evaluate(() => {
    const el = document.getElementById('philosophyOption');
    el?.closest('.row-side-menu')?.classList.remove('invisible');
    el?.classList.remove('invisible');
    el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await page.waitForTimeout(700);

  const pane = await game.withMods((m) => m.cg.getCurrentOptionPane());
  if (pane !== 'philosophy') throw new Error(`Expected the philosophy pane to be current, got ${pane}`);
}

/** Grant research through the debug menu's own button, 1M at a time. */
async function grantResearch(game, times = 1) {
  await game.debugClick('give1MResearch', { times, delayMs: 150 });
}

/** Press one philosophy row's button. */
async function buyUpgrade(game, rowId) {
  const clicked = await game.page.evaluate((row) => {
    const button = document.getElementById(row)?.querySelector('button.philosophy-tech-unlock');
    if (!button) return false;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, rowId);
  if (!clicked) throw new Error(`No philosophy-tech-unlock button inside #${rowId}`);
  // The research deduction is immediate; the price rise is queued and applied by
  // the frame loop out of `itemsToIncreasePrice`.
  await game.page.waitForTimeout(700);
}

/** The row ids currently rendered on the Philosophy pane. */
async function renderedPhilosophyRows(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('[id^="techPhilosophy"][id$="Row"]')).map((el) => el.id));
}

/** Research balance, the multiplier table, the ability flag and one tech's price. */
async function readPurchaseState(game, philosophy, techKey) {
  return game.withMods((m, config) => ({
    research: m.rdo.getResourceDataObject('research', ['quantity']),
    price: m.rdo.getResourceDataObject('philosophyRepeatableTechs', [config.philosophy, config.techKey, 'price']),
    multipliers: { ...m.cg.getAllRepeatableTechMultipliersObject() },
    abilityActive: m.cg.getPhilosophyAbilityActive()
  }), { philosophy, techKey });
}

/**
 * Read every value any of the twenty upgrades can move, in one pass.
 *
 * Taking the whole board each time is what makes "this repeatable changed its
 * own thing and nothing else" assertable: an effect that leaked into another
 * path's domain would otherwise pass unnoticed.
 */
async function readEffectBoard(game) {
  return game.withMods((m) => ({
    // constructor
    spaceTelescopePrice: m.rdo.getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'price']),
    launchPadPrice: m.rdo.getResourceDataObject('space', ['upgrades', 'launchPad', 'price']),
    hydrogenAutobuyerPrice: m.rdo.getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'price']),
    ironAutobuyerPrice: m.rdo.getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'price']),
    dieselRecipeRatio: m.rdo.getResourceDataObject('compounds', ['diesel', 'createsFromRatio1']),
    glassRecipeRatio: m.rdo.getResourceDataObject('compounds', ['glass', 'createsFromRatio1']),
    powerPlantPrice: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'price']),
    scienceKitPrice: m.rdo.getResourceDataObject('research', ['upgrades', 'scienceKit', 'price']),
    increaseStorageFactor: m.cg.getIncreaseStorageFactor(),
    // supremacist
    fleetScoutPrice: m.rdo.getResourceDataObject('space', ['upgrades', 'fleetScout', 'price']),
    unitHealth: m.cg.getPlayerStartingUnitHealth(),
    fleetScoutSpeed: m.rdo.getResourceDataObject('space', ['upgrades', 'fleetScout', 'speed']),
    fleetScoutAttack: m.rdo.getResourceDataObject('space', ['upgrades', 'fleetScout', 'baseAttackStrength']),
    // voidborn
    initialImpression: m.cg.getInitialImpression(),
    starStudyDuration: m.cg.getBaseInvestigateStarTimerDuration(),
    asteroidSearchDuration: m.cg.getBaseSearchAsteroidTimerDuration(),
    apForTenBase: m.game.getAscendencyPointsWithRepeatableBonus(10),
    // expansionist
    starshipPartPrice: m.rdo.getResourceDataObject('space', ['upgrades', 'ssStructural', 'price']),
    rocketPartPrice: m.rdo.getResourceDataObject('space', ['upgrades', 'rocket1', 'price']),
    rocketTravelSpeed: m.cg.getRocketTravelSpeed(),
    starShipTravelSpeed: m.cg.getStarShipTravelSpeed()
  }));
}

/**
 * Every board field a repeatable is allowed to move, keyed by `affects`.
 *
 * The complement of each entry is what must hold still, which is how the
 * "no other path's effects" half of the plan is enforced.
 */
const EFFECT_FIELDS = {
  space: ['spaceTelescopePrice', 'launchPadPrice'],
  resources: ['hydrogenAutobuyerPrice', 'ironAutobuyerPrice'],
  compounds: ['dieselRecipeRatio', 'glassRecipeRatio'],
  buildings: ['powerPlantPrice', 'scienceKitPrice'],
  fleetCosts: ['fleetScoutPrice'],
  fleetHealth: ['unitHealth'],
  fleetSpeed: ['fleetScoutSpeed'],
  fleetAttackPower: ['fleetScoutAttack'],
  initialImpression: ['initialImpression'],
  starStudy: ['starStudyDuration'],
  asteroidSearch: ['asteroidSearchDuration'],
  ascendencyPoints: ['apForTenBase'],
  starshipPartsCost: ['starshipPartPrice'],
  rocketPartsCost: ['rocketPartPrice'],
  rocketTravelTime: ['rocketTravelSpeed'],
  starshipTravelTime: ['starShipTravelSpeed']
};

/** Assert one repeatable's documented effect against a before/after board pair. */
function expectRepeatableEffect(affects, before, after) {
  switch (affects) {
    // Every price repeatable is a flat 5% cut, applied multiplicatively.
    case 'resources':
      expect(after.hydrogenAutobuyerPrice).toBeCloseTo(before.hydrogenAutobuyerPrice * 0.95, 4);
      expect(after.ironAutobuyerPrice).toBeCloseTo(before.ironAutobuyerPrice * 0.95, 4);
      break;
    case 'buildings':
      expect(after.powerPlantPrice).toBeCloseTo(before.powerPlantPrice * 0.95, 4);
      expect(after.scienceKitPrice).toBeCloseTo(before.scienceKitPrice * 0.95, 4);
      break;
    case 'fleetCosts':
      expect(after.fleetScoutPrice).toBeCloseTo(before.fleetScoutPrice * 0.95, 4);
      break;
    case 'starshipPartsCost':
      expect(after.starshipPartPrice).toBeCloseTo(before.starshipPartPrice * 0.95, 4);
      break;
    case 'rocketPartsCost':
      expect(after.rocketPartPrice).toBeCloseTo(before.rocketPartPrice * 0.95, 4);
      break;

    // Compound recipes are cut by 5% too, but rounded up and floored at 1, so a
    // ratio already at 1 legitimately cannot move.
    case 'compounds':
      expect(after.dieselRecipeRatio).toBe(Math.max(1, Math.ceil(before.dieselRecipeRatio * 0.95)));
      expect(after.glassRecipeRatio).toBe(Math.max(1, Math.ceil(before.glassRecipeRatio * 0.95)));
      expect(after.dieselRecipeRatio).toBeLessThanOrEqual(before.dieselRecipeRatio);
      break;

    // The one-off space buildings are re-derived from `basePrices` every frame
    // by `checkRepeatables`, at `1 - (level - 1) * 0.01`. Going from level 1 to
    // level 2 is therefore a 1% cut off the base, not off the current price.
    case 'space':
      expect(after.spaceTelescopePrice).toBeLessThan(before.spaceTelescopePrice);
      expect(after.launchPadPrice).toBeLessThan(before.launchPadPrice);
      break;

    // The fleet buffs are 5% up.
    case 'fleetHealth':
      expect(after.unitHealth).toBeCloseTo(before.unitHealth * 1.05, 4);
      break;
    case 'fleetSpeed':
      expect(after.fleetScoutSpeed).toBeCloseTo(before.fleetScoutSpeed * 1.05, 4);
      break;
    case 'fleetAttackPower':
      expect(after.fleetScoutAttack).toBeCloseTo(before.fleetScoutAttack * 1.05, 4);
      break;

    // Impression is a flat +1; the two telescope timers are a 1% cut each.
    case 'initialImpression':
      expect(after.initialImpression).toBe(before.initialImpression + 1);
      break;
    case 'starStudy':
      expect(after.starStudyDuration).toBeCloseTo(before.starStudyDuration * 0.99, 4);
      break;
    case 'asteroidSearch':
      expect(after.asteroidSearchDuration).toBeCloseTo(before.asteroidSearchDuration * 0.99, 4);
      break;

    // The AP repeatable has no effect function: the bonus is read live from the
    // slot-4 multiplier, so one purchase is worth exactly one extra point.
    case 'ascendencyPoints':
      expect(after.apForTenBase).toBe(before.apForTenBase + 1);
      break;

    // Rockets get faster (distance / speed), starships get quicker
    // (distance * speed) — opposite directions for the same intent.
    case 'rocketTravelTime':
      expect(after.rocketTravelSpeed).toBeCloseTo(before.rocketTravelSpeed / 0.95, 6);
      expect(after.rocketTravelSpeed).toBeGreaterThan(before.rocketTravelSpeed);
      break;
    case 'starshipTravelTime':
      expect(after.starShipTravelSpeed).toBeCloseTo(before.starShipTravelSpeed * 0.95, 4);
      expect(after.starShipTravelSpeed).toBeLessThan(before.starShipTravelSpeed);
      break;

    default:
      throw new Error(`No effect assertion written for "${affects}"`);
  }
}

/** Board fields that must be untouched by a repeatable affecting `affects`. */
function untouchedFields(affects) {
  const owned = new Set(EFFECT_FIELDS[affects]);
  return Object.values(EFFECT_FIELDS).flat().filter((field) => !owned.has(field));
}

// ----------------------------------------------------------------- the specs

// Reaching run 2 costs a full boot, two debug setup chains and a rebirth, so
// every test in this file is long by construction.
test.describe.configure({ timeout: 240_000 });

for (const philosophy of PHILOSOPHIES) {
  const path = PATHS[philosophy];

  test.describe(`Philosophies — ${philosophy} on run 2`, () => {
    test.beforeEach(async ({ game, page }) => {
      await startRunTwoAs(game, page, philosophy);
      await openPhilosophyPane(game, page);
    });

    test(`the pane offers ${philosophy}'s five upgrades and no other path's`, async ({ game, page }) => {
      const rendered = await renderedPhilosophyRows(page);

      const expected = [path.ability.rowId, ...path.repeatables.map((r) => r.rowId)];
      expect(rendered.sort()).toEqual(expected.sort());

      // The four buttons are real, and exactly one of them is the special
      // ability — that marker is what routes the click into `gain`'s
      // `elementId === 'ability'` branch instead of a repeatable's.
      const buttons = await page.evaluate((rows) =>
        rows.map((row) => {
          const button = document.getElementById(row)?.querySelector('button.philosophy-tech-unlock');
          return button ? { row, special: button.classList.contains('special-ability') } : { row, missing: true };
        }), expected);

      expect(buttons.filter((b) => b.missing)).toEqual([]);
      expect(buttons.filter((b) => b.special).map((b) => b.row)).toEqual([path.ability.rowId]);
    });

    test(`the buttons report affordability through the colour class`, async ({ game, page }) => {
      // Affordability in this game is enforced by `red-disabled-text`, whose CSS
      // is `pointer-events: none` — known-issues #17 records that as design, not
      // a defect. What has to be true is that the frame loop keeps the class in
      // step with the research balance, because that class is the whole gate.
      const rowId = path.repeatables[0].rowId;

      await game.withMods((m) => m.rdo.setResourceDataObject(0, 'research', ['quantity']));
      await page.waitForTimeout(600);
      const broke = await page.evaluate((row) => {
        const button = document.getElementById(row)?.querySelector('button.philosophy-tech-unlock');
        return {
          disabledClass: button.classList.contains('red-disabled-text'),
          pointerEvents: getComputedStyle(button).pointerEvents
        };
      }, rowId);

      expect(broke.disabledClass, 'an unaffordable repeatable must be gated').toBe(true);
      expect(broke.pointerEvents).toBe('none');

      await grantResearch(game, 1);
      await page.waitForTimeout(600);
      const rich = await page.evaluate((row) => {
        const button = document.getElementById(row)?.querySelector('button.philosophy-tech-unlock');
        return {
          disabledClass: button.classList.contains('red-disabled-text'),
          readyClass: button.classList.contains('green-ready-text')
        };
      }, rowId);

      expect(rich.disabledClass).toBe(false);
      expect(rich.readyClass).toBe(true);
    });

    test(`every ${philosophy} repeatable is bought through its own button and charges research`, async ({ game, page }) => {
      await grantResearch(game, 2);

      for (const repeatable of path.repeatables) {
        const before = await readPurchaseState(game, philosophy, repeatable.key);
        await buyUpgrade(game, repeatable.rowId);
        const after = await readPurchaseState(game, philosophy, repeatable.key);

        expect(after.research, `${repeatable.key} should charge its price`)
          .toBeCloseTo(before.research - before.price, 4);
        expect(after.price, `${repeatable.key} should get dearer`)
          .toBe(Math.ceil(before.price * COST_MULTIPLIER));

        // Only this repeatable's own slot moves. The four slots are shared
        // across the paths, so a handler wired to the wrong slot would silently
        // buff a different upgrade.
        for (const slot of ['1', '2', '3', '4']) {
          const expectedValue = Number(slot) === repeatable.slot
            ? before.multipliers[slot] + 1
            : before.multipliers[slot];
          expect(after.multipliers[slot], `${repeatable.key} moved slot ${slot}`).toBe(expectedValue);
        }

        // Buying a repeatable must never hand over the special ability.
        expect(after.abilityActive, `${repeatable.key} should not unlock the ability`).toBe(false);
      }

      expect(game.significantErrors()).toEqual([]);
    });

    test(`every ${philosophy} repeatable has its documented effect and touches nothing else`, async ({ game, page }) => {
      await grantResearch(game, 2);

      for (const repeatable of path.repeatables) {
        const before = await readEffectBoard(game);
        await buyUpgrade(game, repeatable.rowId);
        // `checkRepeatables` re-derives the one-off space prices on the frame
        // loop rather than in the click handler, so give it a few frames.
        await page.waitForTimeout(500);
        const after = await readEffectBoard(game);

        expectRepeatableEffect(repeatable.affects, before, after);

        for (const field of untouchedFields(repeatable.affects)) {
          expect(after[field], `${repeatable.key} (${repeatable.affects}) moved ${field}`).toBe(before[field]);
        }
      }
    });

    test(`the ${philosophy} special ability unlocks through its own button, once`, async ({ game, page }) => {
      // The ability costs 500,000 against a repeatable's 10,000, so a single
      // debug grant is not enough on top of what the run already holds.
      await grantResearch(game, 1);

      const before = await readPurchaseState(game, philosophy, path.ability.key);
      expect(before.abilityActive, 'run 2 starts with the ability still locked').toBe(false);
      expect(before.research).toBeGreaterThanOrEqual(before.price);

      await buyUpgrade(game, path.ability.rowId);
      const after = await readPurchaseState(game, philosophy, path.ability.key);

      expect(after.abilityActive).toBe(true);
      expect(after.research, 'the ability charges its price like any other row')
        .toBeCloseTo(before.research - before.price, 4);
      // The ability is not repeatable, so it must not touch any slot.
      expect(after.multipliers).toEqual(before.multipliers);

      // Once held, the button reports itself as spent and stops accepting
      // clicks — the frame loop rewrites it in `handlePhilosophyTechnologyScreenButtonAndDescriptionStates`.
      await page.waitForTimeout(600);
      const unlockedLabel = await game.withMods((m) => m.loc.localize('textUnlocked', m.cg.getLanguage()));
      const buttonState = await page.evaluate((row) => {
        const button = document.getElementById(row)?.querySelector('button.philosophy-tech-unlock');
        return {
          text: button.innerText.trim(),
          pointerEvents: getComputedStyle(button).pointerEvents
        };
      }, path.ability.rowId);

      expect(buttonState.text).toBe(unlockedLabel.trim());
      expect(buttonState.pointerEvents).toBe('none');

      expect(game.significantErrors()).toEqual([]);
    });
  });
}

// ------------------------------------------------- ability scenarios, per path

test.describe.configure({ timeout: 240_000 });

test.describe('Philosophies — Constructor ability: bigger storage upgrades', () => {
  test('Space Storage Tank Research takes a storage upgrade from doubling to quintupling', async ({ game, page }) => {
    await startRunTwoAs(game, page, 'constructor');

    // `increaseResourceStorage` multiplies by `increaseStorageFactor` times the
    // Efficient Storage perk level plus one. Nothing has bought that perk here,
    // so the factor is the whole multiple — guarded, because a perk in play
    // would make both measurements bigger and the ratio still look right.
    const perkLevel = await game.withMods((m) => m.rdo.getBuffEfficientStorageData()['boughtYet']);
    expect(perkLevel, 'this measurement assumes no Efficient Storage perk').toBe(0);

    /** Fill the store so the upgrade is affordable, then press Increase Storage. */
    const upgradeStorage = async () => {
      await game.withMods((m) => {
        const capacity = m.rdo.getResourceDataObject('resources', ['hydrogen', 'storageCapacity']);
        m.rdo.setResourceDataObject(capacity, 'resources', ['hydrogen', 'quantity']);
      });
      const capacityBefore = await game.withMods((m) =>
        m.rdo.getResourceDataObject('resources', ['hydrogen', 'storageCapacity']));

      const clicked = await page.evaluate(() => {
        const button = document.getElementById('hydrogenIncreaseStorageRow')?.querySelector('button');
        if (!button) return false;
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        return true;
      });
      if (!clicked) throw new Error('No Increase Storage button on the hydrogen pane');

      // The charge runs through `checkAndDeductResources` and the new capacity
      // through `deferredActions`, both on the frame loop.
      await page.waitForFunction(
        (previous) => globalThis.__mods.rdo
          .getResourceDataObject('resources', ['hydrogen', 'storageCapacity']) !== previous,
        capacityBefore,
        { timeout: 15000 }
      );
      const capacityAfter = await game.withMods((m) =>
        m.rdo.getResourceDataObject('resources', ['hydrogen', 'storageCapacity']));
      return capacityAfter / capacityBefore;
    };

    await game.openTab(1);
    await page.evaluate(() => {
      const option = document.getElementById('hydrogenOption');
      option?.classList.remove('invisible');
      option?.closest('.row-side-menu')?.classList.remove('invisible');
      option?.closest('.collapsible')?.classList.remove('invisible');
      option?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await page.waitForTimeout(600);

    const baseline = await upgradeStorage();
    expect(baseline, 'without the ability a storage upgrade doubles the cap').toBeCloseTo(2, 6);

    await openPhilosophyPane(game, page);
    await grantResearch(game, 1);
    await buyUpgrade(game, PATHS.constructor.ability.rowId);
    expect(await game.withMods((m) => m.cg.getPhilosophyAbilityActive())).toBe(true);

    await game.openTab(1);
    await page.evaluate(() => {
      document.getElementById('hydrogenOption')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await page.waitForTimeout(600);

    const boosted = await upgradeStorage();
    expect(boosted, 'with the ability the same button quintuples it').toBeCloseTo(5, 6);

    expect(game.significantErrors()).toEqual([]);
  });
});

test.describe('Philosophies — Supremacist ability: guaranteed vassalization', () => {
  test('Fleet Holograms turns the 75% vassalize roll into a certainty', async ({ game, page }) => {
    await startRunTwoAs(game, page, 'supremacist');
    await openPhilosophyPane(game, page);
    await grantResearch(game, 1);
    await buyUpgrade(game, PATHS.supremacist.ability.rowId);
    expect(await game.withMods((m) => m.cg.getPhilosophyAbilityActive())).toBe(true);

    // `updateDiplomacySituation` is the dispatcher every Colonise button calls,
    // and `tryToVassalizeEnemy` sits behind it. The enemy side is randomised by
    // design, so the destination is rolled until it is one that can be
    // vassalized at all, and the assertions are about the distribution of
    // outcomes rather than any particular star.
    const result = await game.withMods((m) => {
      const starData = (() => {
        for (let i = 0; i < 40; i++) {
          m.cg.setDestinationStar('sirius');
          m.game.generateDestinationStarData();
          const data = m.rdo.getStarSystemDataObject('stars', ['destinationStar']);
          const enemySum = data.enemyFleets.air + data.enemyFleets.land + data.enemyFleets.sea;
          if (data.civilizationLevel !== 'None' && data.civilizationLevel !== 'Unsentient' && enemySum > 0) return data;
        }
        return null;
      })();
      if (!starData) return { staged: false };

      const attempt = () => {
        m.rdo.setStarSystemDataObject('Neutral', 'stars', ['destinationStar', 'attitude']);
        m.game.updateDiplomacySituation('vassalize', starData);
        return m.rdo.getStarSystemDataObject('stars', ['destinationStar', 'attitude']);
      };

      const withAbility = Array.from({ length: 12 }, attempt);

      // Turning the ability back off is the control: the same path, the same
      // star, the roll restored.
      m.cg.setPhilosophyAbilityActive(false);
      const withoutAbility = Array.from({ length: 40 }, attempt);
      m.cg.setPhilosophyAbilityActive(true);

      return { staged: true, withAbility, withoutAbility };
    });

    expect(result.staged, 'could not roll a vassalizable destination in 40 attempts').toBe(true);
    expect(result.withAbility).toEqual(Array(12).fill('Surrendered'));
    // 40 rolls at 75% produce both outcomes with overwhelming probability, and
    // this is the half that proves the ability is doing the work.
    expect(result.withoutAbility).toContain('Surrendered');
    expect(result.withoutAbility).toContain('Neutral');
  });
});

test.describe('Philosophies — Voidborn ability: pillaging the void', () => {
  test('Void Seers reveals the telescope option and a pillage actually pays out', async ({ game, page }) => {
    await startRunTwoAs(game, page, 'voidborn');

    // The auto-telescope row — where the third telescope *mode* would appear — is
    // itself behind the `autoSpaceTelescope` ascendency perk, and without it the
    // dropdown is not built at all. Buying it here is an unrelated precondition:
    // it is what makes the "the ability adds pillageVoid to the modes" assertion
    // mean something rather than pass against an empty list.
    await game.debugClick('add100ApButton');
    await game.withMods((m) => m.game.purchaseBuff('autoSpaceTelescope'));

    /** Open the Space Telescope pane, bouncing off another pane so it redraws. */
    const openTelescope = async () => {
      await game.openTab(6);
      await page.evaluate(() => {
        document.getElementById('launchPadOption')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      await page.waitForTimeout(400);
      await page.evaluate(() => {
        const option = document.getElementById('spaceTelescopeOption');
        option?.classList.remove('invisible');
        option?.closest('.row-side-menu')?.classList.remove('invisible');
        option?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      await page.waitForTimeout(700);
    };

    const pillageRowState = () => page.evaluate(() => {
      const row = document.getElementById('spaceTelescopePhilosophyBoostResourcesAndCompoundsRow');
      const modeOptions = Array.from(
        document.querySelectorAll('#autoSpaceTelescopeModeDropdown div.dropdown-option')
      ).map((el) => el.dataset.value);
      return {
        rowPresent: Boolean(row),
        rowVisible: Boolean(row) && !row.classList.contains('invisible'),
        modeOptions
      };
    });

    await openTelescope();
    const locked = await pillageRowState();
    expect(locked.rowPresent, 'the pillage row is built for every path, then hidden').toBe(true);
    expect(locked.rowVisible, 'without the ability the pillage row stays hidden').toBe(false);
    // Guard the guard: the two modes every run has must be listed, or the
    // negative below would pass simply because the dropdown was never built.
    expect(locked.modeOptions).toEqual(expect.arrayContaining(['studyAsteroid', 'studyStars']));
    expect(locked.modeOptions).not.toContain('pillageVoid');

    await openPhilosophyPane(game, page);
    await grantResearch(game, 1);
    await buyUpgrade(game, PATHS.voidborn.ability.rowId);
    expect(await game.withMods((m) => m.cg.getPhilosophyAbilityActive())).toBe(true);

    await openTelescope();
    const unlocked = await pillageRowState();
    expect(unlocked.rowVisible, 'the ability is what puts the pillage row on the pane').toBe(true);
    expect(unlocked.modeOptions, 'and adds it to the auto-telescope modes').toContain('pillageVoid');

    // Empty the stores so there is headroom to fill: a pillage grants a random
    // share of the *gap* to capacity, and the debug scenario leaves everything
    // brimming, which would make a successful pillage yield exactly nothing.
    await game.withMods((m) => {
      for (const key of Object.keys(m.rdo.getResourceDataObject('resources'))) {
        if (key === 'solar') continue;
        m.rdo.setResourceDataObject(0, 'resources', [key, 'quantity']);
        m.rdo.setResourceDataObject(1e6, 'resources', [key, 'storageCapacity']);
      }
      for (const key of Object.keys(m.rdo.getResourceDataObject('compounds'))) {
        m.rdo.setResourceDataObject(0, 'compounds', [key, 'quantity']);
        m.rdo.setResourceDataObject(1e6, 'compounds', [key, 'storageCapacity']);
      }
      // The countdown only advances while the telescope has power and no other
      // telescope action is running.
      m.cg.setPowerOnOff(true);
      m.cg.setCurrentlySearchingAsteroid(false);
      m.cg.setCurrentlyInvestigatingStar(false);
      m.cg.setPillageVoidTimerCanContinue(true);
    });

    const totalStock = () => game.withMods((m) => {
      let total = 0;
      for (const key of Object.keys(m.rdo.getResourceDataObject('resources'))) {
        if (key === 'solar') continue;
        total += m.rdo.getResourceDataObject('resources', [key, 'quantity']);
      }
      for (const key of Object.keys(m.rdo.getResourceDataObject('compounds'))) {
        total += m.rdo.getResourceDataObject('compounds', [key, 'quantity']);
      }
      return total;
    });

    const before = await totalStock();

    const pressed = await page.evaluate(() => {
      const button = document.getElementById('spaceTelescopePhilosophyBoostResourcesAndCompoundsRow')
        ?.querySelector('button.pillageVoid');
      if (!button) return false;
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    });
    expect(pressed, 'the pillage row should carry its own button').toBe(true);
    await page.waitForTimeout(400);
    expect(await game.withMods((m) => m.cg.getCurrentlyPillagingVoid())).toBe(true);

    // The pillage is a ~500s delta timer. Driving the delta manager runs it to
    // completion at once rather than waiting it out.
    await game.advanceTimers(600000);
    await page.waitForTimeout(600);

    const after = await totalStock();
    expect(await game.withMods((m) => m.cg.getCurrentlyPillagingVoid()), 'the cycle should finish').toBe(false);
    // A pillage takes a random share of the headroom on 1-3 resources and 1-3
    // compounds. With a million units of room on each, a payout of exactly zero
    // is a one-in-hundreds-of-thousands event per item, so "it paid something"
    // is a fair thing to require of the feature.
    expect(after, 'pillaging the void should pay out').toBeGreaterThan(before);

    expect(game.significantErrors()).toEqual([]);
  });
});

test.describe('Philosophies — Expansionist ability: rapid expansion', () => {
  /** Stage the list a conquest would have filled, and name it for the assertions. */
  const EXTRA_SYSTEMS = [['pollux'], ['procyon']];

  async function stageConqueredNeighbours(game) {
    await game.withMods((m, extras) => m.cg.setAdditionalSystemsToSettleThisRun(extras), EXTRA_SYSTEMS);
  }

  test('without Rapid Expansion a rebirth settles only the destination', async ({ game, page }) => {
    await startRunTwoAs(game, page, 'expansionist');
    expect(await game.withMods((m) => m.cg.getPhilosophyAbilityActive())).toBe(false);

    await stageConqueredNeighbours(game);
    await scanDestinationSystem(game, 'rigel');
    await game.withMods((m) => m.cg.setBattleResolved(true, 'player'));

    const before = await game.withMods((m) => ({
      settled: [...(m.cg.getSettledStars() ?? [])],
      galacticPoints: Number(m.rdo.getCosmicRipGalacticPoints()) || 0
    }));

    await openRebirthPane(game, page);
    await rebirthThroughTheUI(game, page);

    const after = await game.withMods((m) => ({
      settled: [...(m.cg.getSettledStars() ?? [])],
      galacticPoints: Number(m.rdo.getCosmicRipGalacticPoints()) || 0
    }));

    // One system conquered, one galactic point, and the neighbours ignored.
    expect(after.settled.length).toBe(before.settled.length + 1);
    expect(after.galacticPoints).toBe(before.galacticPoints + 1);
    for (const [name] of EXTRA_SYSTEMS) {
      expect(after.settled.map((s) => String(s).toLowerCase())).not.toContain(name);
    }
  });

  test('Rapid Expansion settles the neighbours the conquest earned, one galactic point each', async ({ game, page }) => {
    await startRunTwoAs(game, page, 'expansionist');
    await openPhilosophyPane(game, page);
    await grantResearch(game, 1);
    await buyUpgrade(game, PATHS.expansionist.ability.rowId);
    expect(await game.withMods((m) => m.cg.getPhilosophyAbilityActive())).toBe(true);

    await stageConqueredNeighbours(game);
    await scanDestinationSystem(game, 'rigel');
    await game.withMods((m) => m.cg.setBattleResolved(true, 'player'));

    const before = await game.withMods((m) => ({
      settled: [...(m.cg.getSettledStars() ?? [])],
      galacticPoints: Number(m.rdo.getCosmicRipGalacticPoints()) || 0
    }));

    await openRebirthPane(game, page);
    await rebirthThroughTheUI(game, page);

    const after = await game.withMods((m) => ({
      settled: [...(m.cg.getSettledStars() ?? [])],
      galacticPoints: Number(m.rdo.getCosmicRipGalacticPoints()) || 0,
      // The list is a per-run tally and must not survive into the next run, or
      // the same neighbours would be granted again at the following rebirth.
      remainingExtras: m.cg.getAdditionalSystemsToSettleThisRun()
    }));

    const settledLower = after.settled.map((s) => String(s).toLowerCase());
    for (const [name] of EXTRA_SYSTEMS) {
      expect(settledLower, `${name} should have been settled by Rapid Expansion`).toContain(name);
    }
    expect(after.settled.length).toBe(before.settled.length + 1 + EXTRA_SYSTEMS.length);
    expect(after.galacticPoints).toBe(before.galacticPoints + 1 + EXTRA_SYSTEMS.length);
    expect(after.remainingExtras).toEqual([]);

    expect(game.significantErrors()).toEqual([]);
  });
});

// -------------------------------------------------------------- cross-cutting

test.describe('Philosophies — the pane itself', () => {
  test.describe.configure({ timeout: 240_000 });

  test('the Philosophy side-menu row is hidden on run 1 and revealed by the run-1 rebirth', async ({ game, page }) => {
    await game.boot();
    await choosePhilosophyThroughModal(game, 'constructor');
    await dismissAnyOpenModal(page);
    await game.prepareRunForStarshipLaunch();
    await dismissAnyOpenModal(page);

    await game.openTab(3);
    await page.waitForTimeout(500);
    const onRunOne = await page.evaluate(() => {
      const el = document.getElementById('philosophyOption');
      return el?.parentElement?.parentElement?.classList.contains('invisible');
    });
    expect(onRunOne, 'the pane is a run-2 feature and must not be offered on run 1').toBe(true);

    await scanDestinationSystem(game, 'vega');
    await game.withMods((m) => m.cg.setBattleResolved(true, 'player'));
    await openRebirthPane(game, page);
    await rebirthThroughTheUI(game, page);

    await game.openTab(3);
    await page.waitForTimeout(500);
    const onRunTwo = await page.evaluate(() => {
      const el = document.getElementById('philosophyOption');
      return el?.parentElement?.parentElement?.classList.contains('invisible');
    });
    expect(onRunTwo, 'the run-1 rebirth is what reveals the Philosophy row').toBe(false);
  });

  test('repeatables bought on run 2 are replayed into run 3, and the ability persists', async ({ game, page }) => {
    // `addPhilosophyRepeatablesBackInAfterRebirth` reapplies each slot
    // `multiplier - 1` times against the freshly reset data, which is the only
    // reason a repeatable is worth buying at all: without it every purchase
    // would be wiped by the next rebirth.
    await startRunTwoAs(game, page, 'supremacist');
    await openPhilosophyPane(game, page);
    await grantResearch(game, 2);

    // Slot 4 is fleet attack power, which the replay table does cover.
    await buyUpgrade(game, PATHS.supremacist.repeatables[3].rowId);
    await buyUpgrade(game, PATHS.supremacist.repeatables[3].rowId);
    await buyUpgrade(game, PATHS.supremacist.ability.rowId);

    const onRunTwo = await game.withMods((m) => ({
      multiplier: m.cg.getRepeatableTechMultipliers('4'),
      attack: m.rdo.getResourceDataObject('space', ['upgrades', 'fleetScout', 'baseAttackStrength']),
      abilityActive: m.cg.getPhilosophyAbilityActive()
    }));
    expect(onRunTwo.multiplier).toBe(3);
    expect(onRunTwo.abilityActive).toBe(true);

    await scanDestinationSystem(game, 'rigel');
    await game.withMods((m) => m.cg.setBattleResolved(true, 'player'));
    await openRebirthPane(game, page);
    const run = await rebirthThroughTheUI(game, page);
    expect(run).toBe(3);

    const onRunThree = await game.withMods((m) => ({
      multiplier: m.cg.getRepeatableTechMultipliers('4'),
      attack: m.rdo.getResourceDataObject('space', ['upgrades', 'fleetScout', 'baseAttackStrength']),
      abilityActive: m.cg.getPhilosophyAbilityActive()
    }));

    expect(onRunThree.multiplier, 'the levels themselves survive').toBe(3);
    expect(onRunThree.abilityActive, 'a bought ability is permanent').toBe(true);
    // Two purchases replayed against the reset base is 1.05 twice over.
    expect(onRunThree.attack).toBeCloseTo(onRunTwo.attack, 4);

    expect(game.significantErrors()).toEqual([]);
  });
});
