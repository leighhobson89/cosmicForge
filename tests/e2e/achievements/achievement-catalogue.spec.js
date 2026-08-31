/**
 * Area: Achievements — the whole catalogue, condition by condition
 * Plan: tests/docs/areas/achievements.md
 *
 * Seventy achievements ship in `achievementsData`, and every one of them makes
 * two promises: it turns itself on when its condition is met, and it pays the
 * reward its `gives` block describes. Neither promise was covered before — the
 * old file proved one achievement (`collect50Hydrogen`) fired and paid, and took
 * the other sixty-nine on trust.
 *
 * This file walks all seventy. For each one it establishes the *real* condition
 * the game's own code establishes at the moment the player earns it, lets the
 * achievements engine grant it, and then audits the reward against the arithmetic
 * `addAchievementBonus` is supposed to perform:
 *
 * | `gives1` | What is asserted |
 * |---|---|
 * | `cash` / `antimatter` / `ascendencyPoints` | the balance rose by exactly `floor(before + quantity)` |
 * | `compound` | the named compound rose by the quantity, clamped at its own storage cap |
 * | `multiplier` + `allResources` | *every* resource's four autobuyer tier rates were scaled, and `solar` was left alone |
 * | `multiplierPermanent` + `allResources` | the same, and the permanent multiplier itself advanced by the quantity |
 * | `multiplier`/`multiplierPermanent` + `createCostCompounds` | every compound recipe ratio was rescaled, at least one genuinely fell, and the dropdown recipe text was rebuilt to match |
 * | `multiplier` + `cash` | every resource *and* compound sale value was scaled |
 * | `doubleAllResourcesToStorageCap` / `…Compounds…` | every stock doubled, clamped at its cap |
 * | `rewardString` | nothing in the economy moved at all |
 *
 * ### How the conditions are staged, and why that is the honest surface here
 *
 * Forty-three of the seventy are *flag* achievements. The game's contract for
 * those is one line, repeated at forty-odd call sites across `game.js`,
 * `casino.js`, `events.js`, `cosmicRip.js`, `onboarding.js` and the tab drawers:
 *
 * ```js
 * setAchievementFlagArray('<achievementId>', 'add');
 * ```
 *
 * …after which the frame loop's `checkForAchievements()` is what notices, grants,
 * pays and clears the flag. Raising that flag is therefore *the* trigger surface
 * this area owns; whether the black hole pane raises it when a black hole is
 * discovered belongs to the black-hole area and is covered there. The remaining
 * twenty-seven are staged by putting the game in the state their checker reads —
 * a resource stock, a cash balance, a researched tech, a star-vision distance, a
 * run number set through the game's own variable debugger.
 *
 * `achievements-live.spec.js` is the other half of this: it *plays* the
 * scenarios the UI and the debug menu can genuinely reach, and lets the frame
 * loop — not a direct call — do the granting.
 *
 * ### Why each achievement is measured inside a single evaluation
 *
 * `gameLoop` is running throughout, and it moves cash, stock and rates every
 * frame. A reward measured across three round trips to the page would be a
 * measurement of production, not of the reward. Snapshot, check, and re-snapshot
 * all happen inside one synchronous block, which the frame loop cannot interleave
 * with — the same rule the random-events specs are built on.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe.configure({ timeout: 300_000 });

/**
 * Reduce a notification to comparable text.
 *
 * An achievement notification is a string with `<br>` separators that the tray
 * renders as HTML, so the two places it can be read from do not hold the same
 * characters: the queue holds the raw string with its tags, and the rendered
 * element's `textContent` has the tags gone *and no whitespace in their place* —
 * `ACHIEVEMENT:<br>You have…` reads back as `ACHIEVEMENT:You have…`. Dropping
 * tags without substituting a space, and then dropping whitespace entirely,
 * makes one expectation matchable against either reading.
 */
function compactText(value) {
  return String(value ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, '');
}

/** The same string with its tags turned back into spaces, for failure output. */
function readableText(value) {
  return String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Every achievement in the catalogue, in the order they are exercised.
 *
 * The order matters and is not cosmetic. `checkForAchievements()` re-tests every
 * inactive achievement on every call, so a stage that satisfies more than one
 * condition would grant several at once and make the reward measurement
 * meaningless. Two rules keep exactly one firing per step:
 *
 *   1. **Threshold families ascend.** 50 hydrogen before 1000; 100 cash before
 *      1000000; 0.5 ly before 5 before 20; run 11 before run 51.
 *   2. **Cash and stock thresholds come first**, because fifteen later rewards
 *      pay cash and two of them double every stock — either would re-trip a
 *      threshold that had not been claimed yet.
 *
 * The sweep asserts that rule held rather than assuming it: any step that turns
 * on more than one achievement is reported as a failure of the ordering, not
 * quietly averaged into the reward maths.
 */
const CATALOGUE = [
  // --- cash thresholds, ascending, before anything that pays cash -----------
  { id: 'gain100Cash', stage: { kind: 'cash', quantity: 100 } },
  { id: 'gain10000Cash', stage: { kind: 'cash', quantity: 10000 } },
  { id: 'gain100000Cash', stage: { kind: 'cash', quantity: 100000 } },
  { id: 'gain1000000Cash', stage: { kind: 'cash', quantity: 1000000 } },

  // --- stock thresholds, before anything that doubles every stock -----------
  { id: 'collect50Hydrogen', stage: { kind: 'resource', type: 'hydrogen', quantity: 50 } },
  { id: 'collect1000Hydrogen', stage: { kind: 'resource', type: 'hydrogen', quantity: 1000 } },
  { id: 'collect5000Carbon', stage: { kind: 'resource', type: 'carbon', quantity: 5000 } },
  { id: 'collect50000Iron', stage: { kind: 'resource', type: 'iron', quantity: 50000 } },

  // --- unlocks and techs, individual techs before the whole tree ------------
  { id: 'fuseElement', stage: { kind: 'unlockResource', resource: 'helium' } },
  { id: 'unlockCompounds', stage: { kind: 'tech', tech: 'compounds' } },
  { id: 'researchTechnology', stage: { kind: 'tech', tech: 'knowledgeSharing' } },
  { id: 'achieve100FusionEfficiency', stage: { kind: 'tech', tech: 'fusionEfficiencyIII' } },
  { id: 'researchAllTechnologies', stage: { kind: 'allTechs' } },

  // --- buildings ------------------------------------------------------------
  { id: 'buildPowerPlant', stage: { kind: 'building', type: 'powerPlant1', quantity: 1 } },
  { id: 'buildSolarPowerPlant', stage: { kind: 'building', type: 'powerPlant2', quantity: 1 } },

  // --- precipitation: the plain one first, then the titanium variant --------
  { id: 'collect100Precipitation', stage: { kind: 'precipitation', quantity: 100, precipitationType: 'water' } },
  { id: 'collect100TitaniumAsPrecipitation', stage: { kind: 'precipitation', quantity: 100, precipitationType: 'titanium' } },

  // --- star vision, ascending ----------------------------------------------
  { id: 'studyStar', stage: { kind: 'starVision', distance: 0.5 } },
  { id: 'studyStarMoreThan5LYAway', stage: { kind: 'starVision', distance: 5 } },
  { id: 'studyStarMoreThan20LYAway', stage: { kind: 'starVision', distance: 20 } },

  // --- run count, ascending. Staged through the variable debugger, because
  //     `runNumber` has no exported setter and the debugger is the game's own
  //     way in. -------------------------------------------------------------
  { id: 'conquer10StarSystems', stage: { kind: 'runNumber', run: 11 } },
  { id: 'conquer50StarSystems', stage: { kind: 'runNumber', run: 51 } },

  // --- state the checker reads directly ------------------------------------
  { id: 'have50HoursWithOnePioneer', stage: { kind: 'activeTime', hours: 50 } },
  { id: 'have4RocketsMiningAntimatter', stage: { kind: 'mining' } },
  { id: 'haveFleetSizeOf50EachShipType', stage: { kind: 'fleet', quantity: 50 } },
  { id: 'seeAllNewsTickers', stage: { kind: 'newsTickersSeen' } },
  { id: 'activateAllWackyNewsTickers', stage: { kind: 'wackyActivated' } },
  { id: 'winAllCasinoGames', stage: { kind: 'casinoWins' } },
  { id: 'gain1MTelemetryData', stage: { kind: 'telemetry', quantity: 1000000 } },

  // --- flag achievements ----------------------------------------------------
  { id: 'createSteel', stage: { kind: 'flag' } },
  { id: 'createTitanium', stage: { kind: 'flag' } },
  { id: 'tripPower', stage: { kind: 'flag' } },
  { id: 'discoverAsteroid', stage: { kind: 'flag' } },
  { id: 'discoverLegendaryAsteroid', stage: { kind: 'flag' } },
  { id: 'launchRocket', stage: { kind: 'flag' } },
  { id: 'mineAllAntimatterAsteroid', stage: { kind: 'flag' } },
  { id: 'launchStarship', stage: { kind: 'flag' } },
  { id: 'performGalacticMarketTransaction', stage: { kind: 'flag' } },
  { id: 'trade10APForCash', stage: { kind: 'flag' } },
  { id: 'liquidateAllAssets', stage: { kind: 'flag' } },
  { id: 'spendAP', stage: { kind: 'flag' } },
  { id: 'initiateDiplomacyWithAlienRace', stage: { kind: 'flag' } },
  { id: 'bullyEnemyIntoSubmission', stage: { kind: 'flag' } },
  { id: 'vassalizeEnemy', stage: { kind: 'flag' } },
  { id: 'conquerEnemy', stage: { kind: 'flag' } },
  { id: 'conquerHiveMindEnemy', stage: { kind: 'flag' } },
  { id: 'conquerBelligerentEnemy', stage: { kind: 'flag' } },
  { id: 'conquerEnemyWithoutScanning', stage: { kind: 'flag' } },
  { id: 'settleUnoccupiedSystem', stage: { kind: 'flag' } },
  { id: 'discoverSystemWithNoLife', stage: { kind: 'flag' } },
  { id: 'settleSystem', stage: { kind: 'flag' } },
  { id: 'studyAllStarsInOneRun', stage: { kind: 'flag' } },
  { id: 'adoptPhilosophy', stage: { kind: 'flag' } },
  { id: 'discoverBlackHole', stage: { kind: 'flag' } },
  { id: 'activateBlackHoleOver10x', stage: { kind: 'flag' } },
  { id: 'findAncientManuscript', stage: { kind: 'flag' } },
  { id: 'conquerMegastructureSystem', stage: { kind: 'flag' } },
  { id: 'bringDownMiaplacideanForceField', stage: { kind: 'flag' } },
  { id: 'restoreNearSpaceScannerArray', stage: { kind: 'flag' } },
  { id: 'findCosmicRip', stage: { kind: 'flag' } },
  { id: 'closeCosmicRip', stage: { kind: 'flag' } },
  { id: 'completeGame', stage: { kind: 'flag' } },
  { id: 'completeRunOnMiaplacidus', stage: { kind: 'flag' } },
  { id: 'tryAllThemes', stage: { kind: 'flag' } },
  { id: 'buyCasinoPoints', stage: { kind: 'flag' } },
  { id: 'winWheelSpecialPrize', stage: { kind: 'flag' } },
  { id: 'suffer5NegativeEvents', stage: { kind: 'flag' } },
  { id: 'enjoyEndlessSummer', stage: { kind: 'flag' } },
  { id: 'rebirth', stage: { kind: 'flag' } },
  { id: 'completeOnboarding', stage: { kind: 'flag' } }
];

/**
 * Stage one achievement's condition, then measure the grant and the reward.
 *
 * Runs in one of three phases, because two of the seventy cannot be staged from
 * inside this block:
 *
 * - **`full`** (all but two): stage the condition, snapshot, run the check,
 *   snapshot again — all synchronously, so the frame loop cannot slip a
 *   production tick between the two readings.
 * - **`baseline`**: snapshot only. Used just before the variable debugger is
 *   driven, because opening that editor, searching it and submitting a value
 *   takes about a second of real time during which `gameLoop` keeps calling
 *   `checkForAchievements()`. The achievement is therefore already granted by
 *   the time the staging returns, and a baseline taken afterwards would be
 *   measuring the reward against a board that already contains it.
 * - **`measure`**: skip the staging, use the baseline captured earlier, and
 *   audit from there.
 *
 * `checkForAchievements()` is the exact entry point `gameLoop` calls every
 * frame — nothing here reaches past it to `grantAchievement`, so a broken
 * checker still fails.
 */
const measureGrant = (m, payload) => {
  const entry = payload.entry;
  const phase = payload.phase || 'full';
  const near = (a, b) => {
    if (a === b) return true;
    if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
    return Math.abs(a - b) <= Math.max(1e-9, Math.abs(b) * 1e-9);
  };

  const activeSet = () => Object.keys(m.rdo.achievementsData)
    .filter((k) => k !== 'version' && m.rdo.getAchievementDataObject(k, ['active'], true) === true);

  const resourceKeys = Object.keys(m.rdo.getResourceDataObject('resources') || {}).filter((k) => k !== 'version');
  const compoundKeys = Object.keys(m.rdo.getResourceDataObject('compounds') || {}).filter((k) => k !== 'version');

  const snapshot = () => {
    const resources = {};
    for (const key of resourceKeys) {
      resources[key] = {
        quantity: m.rdo.getResourceDataObject('resources', [key, 'quantity'], true),
        cap: m.rdo.getResourceDataObject('resources', [key, 'storageCapacity'], true),
        saleValue: m.rdo.getResourceDataObject('resources', [key, 'saleValue'], true),
        rates: [1, 2, 3, 4].map((tier) =>
          m.rdo.getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', `tier${tier}`, 'rate'], true))
      };
    }

    const compounds = {};
    for (const key of compoundKeys) {
      compounds[key] = {
        quantity: m.rdo.getResourceDataObject('compounds', [key, 'quantity'], true),
        cap: m.rdo.getResourceDataObject('compounds', [key, 'storageCapacity'], true),
        saleValue: m.rdo.getResourceDataObject('compounds', [key, 'saleValue'], true),
        ratios: [1, 2, 3, 4].map((i) =>
          m.rdo.getResourceDataObject('compounds', [key, `createsFromRatio${i}`], true)),
        recipeOne: m.cg.getCompoundCreateDropdownRecipeText(key)?.['1']?.text ?? null
      };
    }

    return {
      cash: m.rdo.getResourceDataObject('currency', ['cash'], true),
      ascendencyPoints: m.rdo.getResourceDataObject('ascendencyPoints', ['quantity'], true),
      antimatter: m.rdo.getResourceDataObject('antimatter', ['quantity'], true),
      multiplierPermanentResources: m.cg.getMultiplierPermanentResources(),
      multiplierPermanentCompounds: m.cg.getMultiplierPermanentCompounds(),
      resources,
      compounds
    };
  };

  const achievement = m.rdo.getAchievementDataObject(entry.id);

  if (phase === 'baseline') {
    return {
      baseline: snapshot(),
      activeBefore: activeSet(),
      stagedAlreadyActive: achievement?.active === true
    };
  }

  // ------------------------------------------------------------------ staging
  const stage = entry.stage;
  const stagedAlreadyActive = phase === 'measure'
    ? payload.stagedAlreadyActive
    : achievement?.active === true;

  switch (phase === 'measure' ? 'stagedOutside' : stage.kind) {
    case 'stagedOutside':
      // Already staged through the variable debugger.
      break;
    case 'cash':
      m.rdo.setResourceDataObject(stage.quantity, 'currency', ['cash']);
      break;
    case 'resource':
      // Stage against the resource's own cap, or the game silently clamps the
      // figure the threshold is being tested against.
      if (m.rdo.getResourceDataObject('resources', [stage.type, 'storageCapacity'], true) < stage.quantity) {
        m.rdo.setResourceDataObject(stage.quantity * 10, 'resources', [stage.type, 'storageCapacity']);
      }
      m.rdo.setResourceDataObject(stage.quantity, 'resources', [stage.type, 'quantity']);
      break;
    case 'unlockResource':
      if (!m.cg.getUnlockedResourcesArray().includes(stage.resource)) {
        m.cg.setUnlockedResourcesArray(stage.resource);
      }
      break;
    case 'tech':
      if (!m.cg.getTechUnlockedArray().includes(stage.tech)) m.cg.setTechUnlockedArray(stage.tech);
      break;
    case 'allTechs':
      for (const tech of Object.keys(m.rdo.getResourceDataObject('techs') || {})) {
        if (!m.cg.getTechUnlockedArray().includes(tech)) m.cg.setTechUnlockedArray(tech);
      }
      break;
    case 'building':
      m.rdo.setResourceDataObject(stage.quantity, 'buildings', ['energy', 'upgrades', stage.type, 'quantity']);
      break;
    case 'precipitation':
      m.rdo.setStarSystemDataObject(stage.precipitationType, 'stars', [m.cg.getCurrentStarSystem(), 'precipitationType']);
      m.cg.setCollectedPrecipitationQuantityThisRun(stage.quantity);
      break;
    case 'starVision':
      m.cg.setStarVisionDistance(stage.distance);
      break;
    case 'activeTime':
      // `calculateElapsedActiveGameTime()` rewrites this every frame from the
      // session's start timestamp, so it is set here rather than before the
      // evaluation — inside this block no frame can overwrite it.
      m.cg.setGameActiveCountTime(stage.hours * 60 * 60 * 1000 + 1000, null);
      break;
    case 'mining':
      for (const rocket of ['rocket1', 'rocket2', 'rocket3', 'rocket4']) {
        m.cg.setMiningObject(rocket, 'testAsteroid');
      }
      break;
    case 'fleet':
      for (const ship of ['fleetScout', 'fleetMarauder', 'fleetLandStalker', 'fleetNavalStrafer']) {
        m.rdo.setResourceDataObject(stage.quantity, 'space', ['upgrades', ship, 'quantity']);
      }
      break;
    case 'newsTickersSeen': {
      // The checker compares for equality, not for "at least", so exactly the
      // shortfall is pushed.
      let total = 0;
      for (const value of Object.values(m.desc.newsTickerContent || {})) {
        if (Array.isArray(value)) total += value.length;
      }
      const seen = m.cg.getAlreadySeenNewsTickerArray();
      for (let i = seen.length; i < total; i++) m.cg.setAlreadySeenNewsTickerArray(`seen-${i}`);
      break;
    }
    case 'wackyActivated': {
      const wacky = m.desc.newsTickerContent?.wackyEffects;
      const total = Array.isArray(wacky) ? wacky.length : 0;
      const activated = m.cg.getActivatedWackyNewsEffectsArray();
      for (let i = activated.length; i < total; i++) m.cg.setActivatedWackyNewsEffectsArray(`wacky-${i}`);
      break;
    }
    case 'casinoWins':
      m.rdo.setGalacticCasinoDataObject(['wheel', 'higherLower', 'voidSeer', 'slots'], 'casinoGamesWon');
      break;
    case 'telemetry':
      m.rdo.setResourceDataObject(stage.quantity, 'cosmicRip', ['ripTelemetryData']);
      break;
    case 'flag':
      m.cg.setAchievementFlagArray(entry.id, 'add');
      break;
    default:
      return { error: `unknown stage kind: ${stage.kind}` };
  }

  // --------------------------------------------------------------- measuring
  const activeBefore = phase === 'measure' ? payload.activeBefore : activeSet();
  const before = phase === 'measure' ? payload.baseline : snapshot();

  m.ach.checkForAchievements();

  const after = snapshot();
  const activeAfter = activeSet();
  // P6 gave achievements their own classification so several can share a row;
  // before that they were posted to the 'default' catch-all queue.
  const queuedMessages = (m.cg.getNotificationQueues()?.achievement ?? []).map((n) => String(n.message));
  const onScreen = Array.from(document.querySelectorAll('.notification-container'))
    .map((el) => (el.textContent || '').trim());

  // The frame loop calls this every frame; a reward applied more than once shows
  // up here and nowhere else.
  for (let i = 0; i < 5; i++) m.ach.checkForAchievements();
  const afterRepeats = snapshot();

  // ------------------------------------------------------------- reward audit
  const gives = achievement?.gives ?? {};
  const category = gives.gives1;
  const type = gives.value1?.type;
  const quantity = gives.value1?.quantity;
  const rewardProblems = [];
  const note = (text) => rewardProblems.push(`${entry.id}: ${text}`);

  const economyUnchanged = () => {
    if (!near(after.cash, before.cash)) note(`cash moved ${before.cash} -> ${after.cash}`);
    if (!near(after.ascendencyPoints, before.ascendencyPoints)) note('ascendency points moved');
    if (!near(after.antimatter, before.antimatter)) note('antimatter moved');
    for (const key of resourceKeys) {
      if (!near(after.resources[key].quantity, before.resources[key].quantity)) note(`${key} stock moved`);
      if (!near(after.resources[key].saleValue, before.resources[key].saleValue)) note(`${key} sale value moved`);
      for (let t = 0; t < 4; t++) {
        if (!near(after.resources[key].rates[t], before.resources[key].rates[t])) note(`${key} tier${t + 1} rate moved`);
      }
    }
    for (const key of compoundKeys) {
      if (!near(after.compounds[key].quantity, before.compounds[key].quantity)) note(`${key} stock moved`);
      for (let i = 0; i < 4; i++) {
        if (!near(after.compounds[key].ratios[i], before.compounds[key].ratios[i])) note(`${key} ratio${i + 1} moved`);
      }
    }
  };

  switch (category) {
    case 'cash': {
      const expected = Math.floor(before.cash + quantity);
      if (!near(after.cash, expected)) note(`cash should be ${expected}, was ${after.cash}`);
      break;
    }
    case 'ascendencyPoints': {
      const expected = Math.floor(before.ascendencyPoints + quantity);
      if (!near(after.ascendencyPoints, expected)) {
        note(`ascendency points should be ${expected}, were ${after.ascendencyPoints}`);
      }
      break;
    }
    case 'antimatter': {
      const expected = Math.floor(before.antimatter + quantity);
      if (!near(after.antimatter, expected)) note(`antimatter should be ${expected}, was ${after.antimatter}`);
      break;
    }
    case 'compound': {
      const expected = Math.min(before.compounds[type].cap, Math.floor(before.compounds[type].quantity + quantity));
      if (!near(after.compounds[type].quantity, expected)) {
        note(`${type} should be ${expected}, was ${after.compounds[type].quantity}`);
      }
      break;
    }
    case 'doubleAllResourcesToStorageCap': {
      for (const key of resourceKeys) {
        const expected = Math.min(before.resources[key].cap, Math.floor(before.resources[key].quantity * 2));
        if (!near(after.resources[key].quantity, expected)) {
          note(`${key} should have doubled to ${expected}, was ${after.resources[key].quantity}`);
        }
      }
      break;
    }
    case 'doubleAllCompoundsToStorageCap': {
      for (const key of compoundKeys) {
        const expected = Math.min(before.compounds[key].cap, Math.floor(before.compounds[key].quantity * 2));
        if (!near(after.compounds[key].quantity, expected)) {
          note(`${key} should have doubled to ${expected}, was ${after.compounds[key].quantity}`);
        }
      }
      break;
    }
    case 'multiplier':
    case 'multiplierPermanent': {
      if (type === 'allResources') {
        const factor = category === 'multiplierPermanent'
          ? before.multiplierPermanentResources + quantity
          : quantity;
        if (category === 'multiplierPermanent') {
          const expectedMultiplier = before.multiplierPermanentResources + quantity;
          if (!near(after.multiplierPermanentResources, expectedMultiplier)) {
            note(`permanent resource multiplier should be ${expectedMultiplier}, was ${after.multiplierPermanentResources}`);
          }
        }
        let scaled = 0;
        for (const key of resourceKeys) {
          if (key === 'solar') {
            for (let t = 0; t < 4; t++) {
              if (!near(after.resources.solar.rates[t], before.resources.solar.rates[t])) {
                note('solar is excluded from the resource multiplier but its rate changed');
              }
            }
            continue;
          }
          for (let t = 0; t < 4; t++) {
            const expected = before.resources[key].rates[t] * factor;
            if (!near(after.resources[key].rates[t], expected)) {
              note(`${key} tier${t + 1} rate should be ${expected}, was ${after.resources[key].rates[t]}`);
            }
            if (before.resources[key].rates[t] > 0 && after.resources[key].rates[t] !== before.resources[key].rates[t]) {
              scaled++;
            }
          }
        }
        // Guards against the reward being applied to a board of zeroes, where
        // every `0 * 1.1 === 0` check passes while nothing has happened.
        if (scaled === 0) note('no autobuyer rate actually changed — the multiplier had nothing to act on');
      } else if (type === 'cash') {
        let scaled = 0;
        for (const key of resourceKeys) {
          const expected = before.resources[key].saleValue * quantity;
          if (!near(after.resources[key].saleValue, expected)) {
            note(`${key} sale value should be ${expected}, was ${after.resources[key].saleValue}`);
          }
          if (before.resources[key].saleValue > 0) scaled++;
        }
        for (const key of compoundKeys) {
          const expected = before.compounds[key].saleValue * quantity;
          if (!near(after.compounds[key].saleValue, expected)) {
            note(`${key} sale value should be ${expected}, was ${after.compounds[key].saleValue}`);
          }
        }
        if (scaled === 0) note('every sale value was zero — the multiplier had nothing to act on');
      } else if (type === 'createCostCompounds') {
        if (category === 'multiplierPermanent' && !near(after.multiplierPermanentCompounds, quantity)) {
          note(`permanent compound multiplier should be ${quantity}, was ${after.multiplierPermanentCompounds}`);
        }
        let reduced = 0;
        for (const key of compoundKeys) {
          for (let i = 0; i < 4; i++) {
            const wasRatio = before.compounds[key].ratios[i];
            const isRatio = after.compounds[key].ratios[i];
            if (wasRatio > 0) {
              const expected = Math.max(1, Math.round(wasRatio * quantity));
              if (!near(isRatio, expected)) {
                note(`${key} createsFromRatio${i + 1} should be ${expected}, was ${isRatio}`);
              }
              if (isRatio < wasRatio) reduced++;
            } else if (!near(isRatio, wasRatio)) {
              note(`${key} createsFromRatio${i + 1} changed from an unset ratio`);
            }
          }
          // The dropdown a player picks a batch size from is built from those
          // ratios; a reward that moved the data and left the menu stale would
          // sell the player the old price.
          const recipe = after.compounds[key].recipeOne;
          if (recipe === null) {
            note(`${key} has no rebuilt recipe line for the "1" batch`);
          } else {
            for (let i = 0; i < 4; i++) {
              const ratio = after.compounds[key].ratios[i];
              if (ratio > 0 && !recipe.includes(ratio.toLocaleString('en-US'))) {
                note(`${key} recipe line "${recipe}" does not show its new ratio ${ratio}`);
              }
            }
          }
        }
        if (reduced === 0) note('no compound recipe got cheaper — the discount had nothing to act on');
      } else {
        note(`unhandled multiplier type: ${type}`);
      }
      break;
    }
    case 'rewardString':
      economyUnchanged();
      break;
    default:
      note(`unhandled gives category: ${category}`);
  }

  const newlyActive = activeAfter.filter((k) => !activeBefore.includes(k));

  // A reward applied twice is the failure mode `active` is supposed to prevent.
  const repeatProblems = [];
  if (!near(afterRepeats.cash, after.cash)) repeatProblems.push(`cash moved again: ${after.cash} -> ${afterRepeats.cash}`);
  if (!near(afterRepeats.ascendencyPoints, after.ascendencyPoints)) repeatProblems.push('ascendency points moved again');
  if (!near(afterRepeats.antimatter, after.antimatter)) repeatProblems.push('antimatter moved again');
  if (!near(afterRepeats.multiplierPermanentResources, after.multiplierPermanentResources)) {
    repeatProblems.push('permanent resource multiplier moved again');
  }
  for (const key of resourceKeys) {
    for (let t = 0; t < 4; t++) {
      if (!near(afterRepeats.resources[key].rates[t], after.resources[key].rates[t])) {
        repeatProblems.push(`${key} tier${t + 1} rate moved again`);
      }
    }
  }

  return {
    id: entry.id,
    stagedAlreadyActive,
    active: m.rdo.getAchievementDataObject(entry.id, ['active'], true) === true,
    newlyActive,
    rewardProblems,
    repeatProblems,
    expectedNotification: m.desc.getAchievementNotification(achievement?.notification),
    notificationSeen: queuedMessages.concat(onScreen)
  };
};

test.describe('Achievements — every achievement in the catalogue fires and pays', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('the catalogue under test is the whole catalogue', async ({ game }) => {
    // If an achievement is added to the game and not to this file, the sweep
    // below would silently stop covering it.
    const shipped = await game.withMods((m) =>
      Object.keys(m.rdo.achievementsData).filter((k) => k !== 'version').sort());

    const covered = CATALOGUE.map((entry) => entry.id).sort();
    expect(covered).toEqual(shipped);
    expect(new Set(covered).size, 'the catalogue lists no achievement twice').toBe(covered.length);
  });

  test('nothing is granted before its condition is met', async ({ game }) => {
    // The frame loop has been calling `checkForAchievements()` since boot, so
    // this is a live claim about a real run rather than about a cold data object.
    await game.page.waitForTimeout(1500);

    const state = await game.withMods((m) => ({
      active: Object.keys(m.rdo.achievementsData)
        .filter((k) => k !== 'version' && m.rdo.getAchievementDataObject(k, ['active'], true) === true),
      flags: [...(m.cg.getAchievementFlagArray() ?? [])],
      total: Object.keys(m.rdo.achievementsData).filter((k) => k !== 'version').length
    }));

    expect(state.total).toBe(CATALOGUE.length);
    expect(state.active).toEqual([]);
    // `checkForAchievements()` empties the flag array on every pass, so a flag
    // still standing after a second of frames means the loop is not running.
    expect(state.flags).toEqual([]);
  });

  test('each achievement fires on its own condition and pays exactly what it promises', async ({ game }) => {
    const firedEarly = [];
    const neverFired = [];
    const contaminated = [];
    const rewardProblems = [];
    const repeatProblems = [];
    const missingNotification = [];

    for (const entry of CATALOGUE) {
      let result;

      if (entry.stage.kind === 'runNumber') {
        // `runNumber` has no exported setter; the variable debugger is the
        // game's own way to move it, and driving it here exercises that editor
        // as well. The baseline has to be captured *first*, because the frame
        // loop grants the achievement while the debugger is still being driven.
        const baseline = await game.withMods(measureGrant, { entry, phase: 'baseline' });
        await game.setDebugVariable('runNumber', entry.stage.run);
        await game.closeVariableDebugger();
        result = await game.withMods(measureGrant, { entry, phase: 'measure', ...baseline });
      } else {
        result = await game.withMods(measureGrant, { entry, phase: 'full' });
      }

      if (result.error) {
        rewardProblems.push(`${entry.id}: ${result.error}`);
        continue;
      }
      if (result.stagedAlreadyActive) firedEarly.push(entry.id);
      if (!result.active) neverFired.push(entry.id);
      if (result.newlyActive.length > 1) {
        contaminated.push(`${entry.id}: also granted ${result.newlyActive.filter((k) => k !== entry.id).join(', ')}`);
      }
      rewardProblems.push(...result.rewardProblems);
      repeatProblems.push(...result.repeatProblems.map((p) => `${entry.id}: ${p}`));

      const expected = compactText(result.expectedNotification);
      if (!expected) {
        missingNotification.push(`${entry.id}: notification key resolved to nothing`);
      } else if (!result.notificationSeen.some((text) => compactText(text).includes(expected))) {
        // The reading above is taken synchronously, which catches every message
        // that went into the queue. One does not queue: when the tray is empty
        // `showNotification` shifts the message straight back out and renders
        // it immediately, so it is on screen rather than waiting. Check there
        // before reporting a miss.
        const shown = await game.page.waitForFunction(
          (text) => Array.from(document.querySelectorAll('.notification-container'))
            .some((el) => (el.textContent || '').replace(/\s+/g, '').includes(text)),
          expected,
          { timeout: 3000 }
        ).then(() => true).catch(() => false);
        if (!shown) {
          missingNotification.push(`${entry.id}: "${readableText(result.expectedNotification)}" was never raised`);
        }
      }
    }

    // Soft assertions so one broken achievement does not hide the other
    // sixty-nine — the whole point of sweeping the catalogue.
    expect.soft(firedEarly, 'these were already active before their own condition was staged').toEqual([]);
    expect.soft(neverFired, 'these did not turn on when their condition was met').toEqual([]);
    expect.soft(contaminated, 'a staging step granted more than one achievement, so its reward measurement is not isolated').toEqual([]);
    expect.soft(rewardProblems, 'rewards that did not match the achievement data').toEqual([]);
    expect.soft(repeatProblems, 'rewards applied more than once by repeated frame-loop checks').toEqual([]);
    expect.soft(missingNotification, 'achievements granted without raising their own notification').toEqual([]);
  });
});
