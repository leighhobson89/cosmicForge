/**
 * Area: Galactic Casino — the shared special-prize catalogue
 * Plan: tests/docs/areas/galactic-casino.md
 *
 * `claimCasinoSpecialPrizeByKey()` is the single award path behind both the
 * Wheel of Fortune's special segment and Higher or Lower's tier 7, so every
 * prize key is exercised here directly against its own target. The timer
 * prizes are the interesting ones: each only pays out when its specific
 * activity is genuinely in flight, and returns null otherwise — a wheel prize
 * that silently no-ops is the failure mode this guards.
 */
import { test, expect } from '../_harness/game-fixture.mjs';
import { bootCasino } from './_casino-helpers.mjs';

test.describe('Galactic Casino — special prizes', () => {
  test.beforeEach(async ({ game }) => {
    await bootCasino(game);
  });

  test('an empty or unknown prize key awards nothing', async ({ game }) => {
    const result = await game.withMods((m) => ({
      empty: m.casino.claimCasinoSpecialPrizeByKey('', { notify: false }),
      select: m.casino.claimCasinoSpecialPrizeByKey('select', { notify: false }),
      unknown: m.casino.claimCasinoSpecialPrizeByKey('special_not_a_real_prize', { notify: false })
    }));

    expect(result.empty).toBeNull();
    expect(result.select).toBeNull();
    expect(result.unknown).toBeNull();
  });

  test('the flat CP and research prizes credit exactly their advertised amount', async ({ game }) => {
    const result = await game.withMods((m) => {
      const cpBefore = m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']);
      const cp = m.casino.claimCasinoSpecialPrizeByKey('special_100cp', { notify: false });
      const cpAfter = m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']);

      const researchBefore = m.rdo.getResourceDataObject('research', ['quantity']);
      const research = m.casino.claimCasinoSpecialPrizeByKey('special_100k_research', { notify: false });
      const researchAfter = m.rdo.getResourceDataObject('research', ['quantity']);

      return { cp, cpBefore, cpAfter, research, researchBefore, researchAfter };
    });

    expect(result.cp).toEqual({ type: 'cp', amount: 100 });
    expect(result.cpAfter).toBe(result.cpBefore + 100);
    expect(result.research).toEqual({ type: 'research', amount: 100000 });
    expect(result.researchAfter).toBe(result.researchBefore + 100000);
  });

  test('a material-doubling prize doubles an unlocked stock', async ({ game }) => {
    const result = await game.withMods((m) => {
      // prepareRunForStarshipLaunch grants every material, so iron is unlocked.
      m.rdo.setResourceDataObject(1234, 'resources', ['iron', 'quantity']);
      const before = m.rdo.getResourceDataObject('resources', ['iron', 'quantity']);
      const awarded = m.casino.claimCasinoSpecialPrizeByKey('special_double_iron', { notify: false });
      return { before, awarded, after: m.rdo.getResourceDataObject('resources', ['iron', 'quantity']) };
    });

    expect(result.awarded.type).toBe('resources');
    expect(result.awarded.key).toBe('iron');
    expect(result.awarded.oldQuantity).toBe(1234);
    expect(result.awarded.newQuantity).toBe(2468);
    expect(result.after).toBe(2468);
  });

  test('every advertised doubling prize resolves to the right category', async ({ game }) => {
    // The wheel's dropdown offers exactly these five materials, split across
    // both categories; a mis-categorised key would double the wrong stock.
    const expected = {
      special_double_titanium: 'compounds',
      special_double_steel: 'compounds',
      special_double_silicon: 'resources',
      special_double_iron: 'resources',
      special_double_sodium: 'resources'
    };

    const result = await game.withMods((m, keys) => {
      const out = {};
      for (const [key, category] of Object.entries(keys)) {
        const material = key.replace('special_double_', '');
        m.rdo.setResourceDataObject(500, category, [material, 'quantity']);
        const awarded = m.casino.claimCasinoSpecialPrizeByKey(key, { notify: false });
        out[key] = {
          awarded,
          quantity: m.rdo.getResourceDataObject(category, [material, 'quantity'])
        };
      }
      return out;
    }, expected);

    for (const [key, category] of Object.entries(expected)) {
      expect(result[key].awarded.type, key).toBe(category);
      expect(result[key].awarded.key, key).toBe(key.replace('special_double_', ''));
      expect(result[key].quantity, key).toBe(1000);
    }
  });

  test('a doubling prize for a locked material falls back to 20 CP', async ({ game }) => {
    const result = await game.withMods((m) => {
      const cpBefore = m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']);
      // Empty the unlock lists so the key cannot resolve to a real stock; the
      // documented fallback is a 20 CP consolation rather than a dead prize.
      // The accessors expose the live arrays and their setters only unshift, so
      // drain and refill in place.
      const resources = m.cg.getUnlockedResourcesArray();
      const compounds = m.cg.getUnlockedCompoundsArray();
      const savedResources = [...resources];
      const savedCompounds = [...compounds];
      resources.length = 0;
      compounds.length = 0;

      const awarded = m.casino.claimCasinoSpecialPrizeByKey('special_double_iron', { notify: false });
      const cpAfter = m.rdo.getGalacticCasinoDataObject('casinoPoints', ['quantity']);

      resources.push(...savedResources);
      compounds.push(...savedCompounds);

      return { cpBefore, awarded, cpAfter, restored: resources.length === savedResources.length };
    });

    expect(result.awarded).toEqual({ type: 'cp', amount: 20 });
    expect(result.cpAfter).toBe(result.cpBefore + 20);
    expect(result.restored).toBe(true);
  });

  test('every timer prize awards nothing while its activity is idle', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.cg.setCurrentlySearchingAsteroid(false);
      m.cg.setCurrentlyInvestigatingStar(false);
      m.cg.setCurrentlyPillagingVoid(false);
      m.cg.setStarShipStatus(['orbiting', 'sirius']);
      for (const rocket of ['rocket1', 'rocket2', 'rocket3', 'rocket4']) {
        m.cg.setCurrentlyTravellingToAsteroid(rocket, false);
        m.cg.setTimeLeftUntilRocketTravelToAsteroidTimerFinishes(rocket, 0);
      }

      return {
        asteroid: m.casino.claimCasinoSpecialPrizeByKey('special_telescope_finish_asteroid_search', { notify: false }),
        starStudy: m.casino.claimCasinoSpecialPrizeByKey('special_telescope_finish_star_study', { notify: false }),
        voidPillage: m.casino.claimCasinoSpecialPrizeByKey('special_telescope_finish_void_pillage', { notify: false }),
        starshipWarp: m.casino.claimCasinoSpecialPrizeByKey('special_starship_warp', { notify: false }),
        starshipFinish: m.casino.claimCasinoSpecialPrizeByKey('special_finish_starship_journey', { notify: false }),
        rocketWarp: m.casino.claimCasinoSpecialPrizeByKey('special_rocket_warp', { notify: false }),
        rocketFinish: m.casino.claimCasinoSpecialPrizeByKey('special_finish_rocket_journey', { notify: false })
      };
    });

    for (const [key, value] of Object.entries(result)) {
      expect(value, `${key} should award nothing while idle`).toBeNull();
    }
  });

  test('the asteroid-search prize finishes the scan and yields an asteroid', async ({ game }) => {
    // The prize's own contract is that the scan *finishes*; whether that scan
    // then finds anything belongs to `discoverAsteroid`, which rolls a 7% miss by
    // design. So the finishing half is asserted on every claim, and the finding
    // half only has to come good once — five consecutive misses is a one in six
    // hundred thousand event, where demanding a find from a single claim fails
    // roughly one run in fourteen.
    const attempts = await game.withMods((m) => {
      const rounds = [];
      for (let i = 0; i < 5; i++) {
        const asteroidsBefore = (m.cg.getAsteroidArray() || []).length;
        m.cg.setCurrentlySearchingAsteroid(true);
        m.cg.setTimeLeftUntilAsteroidScannerTimerFinishes(120000);

        const awarded = m.casino.claimCasinoSpecialPrizeByKey('special_telescope_finish_asteroid_search', { notify: false });

        rounds.push({
          asteroidsBefore,
          awarded,
          asteroidsAfter: (m.cg.getAsteroidArray() || []).length,
          stillSearching: m.cg.getCurrentlySearchingAsteroid(),
          msLeft: m.cg.getTimeLeftUntilAsteroidScannerTimerFinishes(),
          telescopeReady: m.cg.getTelescopeReadyToSearch()
        });
      }
      return rounds;
    });

    for (const [index, round] of attempts.entries()) {
      expect(round.awarded?.type, `claim ${index + 1}`).toBe('telescope_finish_asteroid_search');
      expect(round.awarded?.asteroid, `claim ${index + 1}`).toBeTruthy();
      expect(round.stillSearching, `claim ${index + 1}`).toBe(false);
      expect(round.msLeft, `claim ${index + 1}`).toBe(0);
      expect(round.telescopeReady, `claim ${index + 1}`).toBe(true);
      // A claim can miss, but it can never lose an asteroid.
      expect(round.asteroidsAfter, `claim ${index + 1}`)
        .toBeGreaterThanOrEqual(round.asteroidsBefore);
      expect(round.asteroidsAfter, `claim ${index + 1}`)
        .toBeLessThanOrEqual(round.asteroidsBefore + 1);
    }

    const found = attempts.filter((round) => round.asteroidsAfter === round.asteroidsBefore + 1).length;
    expect(found, `${found} of 5 claims found an asteroid`).toBeGreaterThan(0);
  });

  test('the star-study prize finishes the investigation and frees the telescope', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.cg.setCurrentlyInvestigatingStar(true);
      m.cg.setTimeLeftUntilStarInvestigationTimerFinishes(120000);

      const awarded = m.casino.claimCasinoSpecialPrizeByKey('special_telescope_finish_star_study', { notify: false });

      return {
        awarded,
        stillInvestigating: m.cg.getCurrentlyInvestigatingStar(),
        msLeft: m.cg.getTimeLeftUntilStarInvestigationTimerFinishes(),
        telescopeReady: m.cg.getTelescopeReadyToSearch()
      };
    });

    expect(result.awarded).toEqual({ type: 'telescope_finish_star_study' });
    expect(result.stillInvestigating).toBe(false);
    expect(result.msLeft).toBe(0);
    expect(result.telescopeReady).toBe(true);
  });

  test('the void-pillage prize is gated behind the Voidborn philosophy', async ({ game }) => {
    const result = await game.withMods((m) => {
      const originalPhilosophy = m.cg.getPlayerPhilosophy();

      m.cg.setPlayerPhilosophy('supremacist');
      m.cg.setCurrentlyPillagingVoid(true);
      m.cg.setTimeLeftUntilPillageVoidTimerFinishes(120000);
      const asSupremacist = m.casino.claimCasinoSpecialPrizeByKey('special_telescope_finish_void_pillage', { notify: false });
      const pillagingAfterRefusal = m.cg.getCurrentlyPillagingVoid();

      m.cg.setPlayerPhilosophy('voidborn');
      const asVoidborn = m.casino.claimCasinoSpecialPrizeByKey('special_telescope_finish_void_pillage', { notify: false });

      const after = {
        pillaging: m.cg.getCurrentlyPillagingVoid(),
        msLeft: m.cg.getTimeLeftUntilPillageVoidTimerFinishes()
      };

      m.cg.setPlayerPhilosophy(originalPhilosophy);
      return { asSupremacist, pillagingAfterRefusal, asVoidborn, after };
    });

    expect(result.asSupremacist).toBeNull();
    // A refused claim must leave the pillage running.
    expect(result.pillagingAfterRefusal).toBe(true);
    expect(result.asVoidborn).toEqual({ type: 'telescope_finish_void_pillage' });
    expect(result.after.pillaging).toBe(false);
    expect(result.after.msLeft).toBe(0);
  });

  test('both starship prizes cut a journey in flight down to a two second hop', async ({ game }) => {
    const result = await game.withMods((m) => {
      const run = (key) => {
        m.cg.setStarShipStatus(['travelling', 'sirius']);
        m.cg.setDestinationStar('sirius');
        m.cg.setTimeLeftUntilTravelToDestinationStarTimerFinishes(600000);
        const awarded = m.casino.claimCasinoSpecialPrizeByKey(key, { notify: false });
        return { awarded, msLeft: m.cg.getTimeLeftUntilTravelToDestinationStarTimerFinishes() };
      };

      return { warp: run('special_starship_warp'), finish: run('special_finish_starship_journey') };
    });

    expect(result.warp.awarded?.type).toBe('starship_warp');
    expect(result.warp.awarded?.destinationStar).toBe('sirius');
    expect(result.warp.msLeft).toBeLessThanOrEqual(2000);
    expect(result.finish.awarded?.type).toBe('finish_starship_journey');
    expect(result.finish.msLeft).toBeLessThanOrEqual(2000);
  });

  test('both rocket prizes pick a rocket that is actually in flight', async ({ game }) => {
    const result = await game.withMods((m) => {
      const arm = () => {
        for (const rocket of ['rocket1', 'rocket2', 'rocket3', 'rocket4']) {
          m.cg.setCurrentlyTravellingToAsteroid(rocket, rocket === 'rocket2');
          m.cg.setTimeLeftUntilRocketTravelToAsteroidTimerFinishes(rocket, rocket === 'rocket2' ? 600000 : 0);
          m.cg.setRocketDirection(rocket, false);
        }
        m.cg.setDestinationAsteroid('rocket2', 'Asteroid1');
      };

      arm();
      const warp = m.casino.claimCasinoSpecialPrizeByKey('special_rocket_warp', { notify: false });
      const warpMsLeft = m.cg.getTimeLeftUntilRocketTravelToAsteroidTimerFinishes('rocket2');

      arm();
      const finish = m.casino.claimCasinoSpecialPrizeByKey('special_finish_rocket_journey', { notify: false });
      const finishMsLeft = m.cg.getTimeLeftUntilRocketTravelToAsteroidTimerFinishes('rocket2');

      return { warp, warpMsLeft, finish, finishMsLeft };
    });

    // Only rocket2 is in flight, so the random pick has exactly one candidate.
    expect(result.warp?.type).toBe('rocket_warp');
    expect(result.warp?.rocketKey).toBe('rocket2');
    expect(result.warpMsLeft).toBeLessThanOrEqual(2000);
    expect(result.finish?.type).toBe('finish_rocket_journey');
    expect(result.finish?.rocketKey).toBe('rocket2');
    expect(result.finishMsLeft).toBeLessThanOrEqual(2000);
  });

  test('claiming a special prize through the wheel flags the achievement and counts the win', async ({ game }) => {
    await game.setDebugVariable('wheelForceSpecial', 'true');
    await game.closeVariableDebugger();

    const result = await game.page.evaluate(async () => {
      const m = globalThis.__mods;
      await m.casino.playWheelOfFortune({ wheelId: 'galacticCasinoGame2Wheel', costCp: 1, durationMs: 200 });

      const wheel = document.getElementById('galacticCasinoGame2Wheel');
      wheel.setAttribute('data-prize-selection', 'special_100cp');

      const before = m.cg.statFunctionsGets.stat_wheelSpecialWonThisRun();
      const claimed = m.casino.claimWheelSpecialPrize({ wheelId: 'galacticCasinoGame2Wheel' });
      return { claimed, before, after: m.cg.statFunctionsGets.stat_wheelSpecialWonThisRun() };
    });

    expect(result.claimed).toEqual({ type: 'cp', amount: 100 });
    expect(result.after).toBe(result.before + 1);

    // checkForAchievements() runs on the game loop, so poll the achievement's
    // own granted state rather than the transient flag array.
    await game.page.waitForTimeout(600);
    const granted = await game.withMods((m) => m.rdo.getAchievementDataObject('winWheelSpecialPrize')?.active);
    expect(granted).toBe(true);
  });

  test('the special prize keys the wheel offers all resolve to a real branch', async ({ game }) => {
    // Guards against a dropdown option drifting away from the award switch: a
    // key with no branch would return null on a *ready* activity too.
    const offered = await game.page.evaluate(() =>
      Array.from(document.querySelectorAll('#galacticCasinoGame2PrizeDropdown .dropdown-option'))
        .map((el) => el.getAttribute('data-value'))
        .filter((v) => v && v !== 'select'));

    expect(offered.length).toBeGreaterThan(0);

    const unhandled = await game.withMods((m, keys) => {
      const handled = new Set([
        'special_100cp', 'special_100k_research', 'special_starship_warp',
        'special_finish_starship_journey', 'special_rocket_warp',
        'special_finish_rocket_journey', 'special_telescope_finish_star_study',
        'special_telescope_finish_asteroid_search', 'special_telescope_finish_void_pillage'
      ]);
      return keys.filter((key) => !handled.has(key) && !key.startsWith('special_double_'));
    }, offered);

    expect(unhandled).toEqual([]);
  });
});
