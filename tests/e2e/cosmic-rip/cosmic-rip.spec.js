/**
 * Area: Cosmic Rip
 * Plan: tests/docs/areas/cosmic-rip.md
 *
 * The scanning economy (cosmicRip.js) is exercised directly through its real
 * exported functions rather than by simulating canvas clicks on the sector grid,
 * matching the direct-module style used by colonise.spec.js and battle.spec.js.
 * Late-game state (settled systems, tab unlocks) comes from the debug menu's
 * "Prepare Run For Starship Launch" scenario, same as those specs.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe('Cosmic Rip', () => {
  test.describe('scanning economy', () => {
    test.beforeEach(async ({ game }) => {
      await game.boot();
      await game.prepareRunForStarshipLaunch();
    });

    test('the rip location seeds deterministically and only once', async ({ game }) => {
      const result = await game.withMods((m) => {
        const first = m.rip.ensureCosmicRipLocationSeeded();
        const second = m.rip.ensureCosmicRipLocationSeeded();
        const third = m.rip.ensureCosmicRipLocationSeeded();
        return { first, second, third, sectorCount: m.rip.getCosmicRipSectorCount() };
      });

      expect(result.first).toBe(result.second);
      expect(result.second).toBe(result.third);
      expect(Number.isInteger(result.first)).toBe(true);
      expect(result.first).toBeGreaterThanOrEqual(0);
      expect(result.first).toBeLessThan(result.sectorCount);
    });

    test('restoring the scanner array fails without enough GP', async ({ game }) => {
      const result = await game.withMods((m) => {
        m.rdo.setCosmicRipGalacticPoints(0);
        m.rdo.setCosmicRipNearSpaceScannerArrayRestored(false);
        return m.rip.restoreNearSpaceScannerArray();
      });

      expect(result).toEqual({ ok: false, reason: 'not_enough_gp' });
    });

    test('restoring the scanner array costs the documented GP and enables scanning', async ({ game }) => {
      const result = await game.withMods((m) => {
        const cost = m.rip.getNearSpaceScannerArrayRestoreCostGp();
        m.cg.setGalacticPointsSpent(0);
        m.rdo.setCosmicRipGalacticPoints(cost + 5);

        const before = m.rdo.getCosmicRipGalacticPoints();
        const outcome = m.rip.restoreNearSpaceScannerArray();
        const after = m.rdo.getCosmicRipGalacticPoints();

        return {
          cost,
          before,
          after,
          outcome,
          restored: m.rdo.getCosmicRipNearSpaceScannerArrayRestored(),
          spent: m.cg.getGalacticPointsSpent(),
          scanResults: m.rdo.getCosmicRipScanResultsBySectorIndex()
        };
      });

      expect(result.outcome).toEqual({ ok: true });
      expect(result.after).toBe(result.before - result.cost);
      expect(result.restored).toBe(true);
      expect(result.spent).toBe(result.cost);
      expect(result.scanResults).toEqual(Array(9).fill(false));
    });

    test('restoring a second time is rejected', async ({ game }) => {
      const result = await game.withMods((m) => {
        const cost = m.rip.getNearSpaceScannerArrayRestoreCostGp();
        m.cg.setGalacticPointsSpent(0);
        m.rdo.setCosmicRipGalacticPoints(cost + 5);
        m.rip.restoreNearSpaceScannerArray();
        return m.rip.restoreNearSpaceScannerArray();
      });

      expect(result).toEqual({ ok: false, reason: 'already_restored' });
    });

    test('scanning is refused before the scanner array is restored', async ({ game }) => {
      const result = await game.withMods((m) => {
        m.rdo.setCosmicRipNearSpaceScannerArrayRestored(false);
        return m.rip.scanCosmicRipSector(0);
      });

      expect(result).toEqual({ ok: false, reason: 'telescope_not_restored' });
    });

    test('scanning the rip sector reveals it, scanning elsewhere does not', async ({ game }) => {
      const result = await game.withMods((m) => {
        const restoreCost = m.rip.getNearSpaceScannerArrayRestoreCostGp();
        const sectorCount = m.rip.getCosmicRipSectorCount();
        m.cg.setGalacticPointsSpent(0);
        m.rdo.setCosmicRipGalacticPoints(restoreCost + sectorCount + 5);
        m.rip.restoreNearSpaceScannerArray();

        const ripIndex = m.rip.ensureCosmicRipLocationSeeded();
        const missIndex = (ripIndex + 1) % sectorCount;

        const missResult = m.rip.scanCosmicRipSector(missIndex);
        const foundBeforeHit = m.rdo.getCosmicRipRipFound();
        const hitResult = m.rip.scanCosmicRipSector(ripIndex);
        const foundAfterHit = m.rdo.getCosmicRipRipFound();

        return { ripIndex, missIndex, missResult, foundBeforeHit, hitResult, foundAfterHit };
      });

      expect(result.missResult).toEqual({ ok: true, found: false, sectorIndex: result.missIndex });
      expect(result.foundBeforeHit).toBe(false);
      expect(result.hitResult).toEqual({ ok: true, found: true, sectorIndex: result.ripIndex });
      expect(result.foundAfterHit).toBe(true);
    });

    test('scanning the same sector twice is rejected the second time', async ({ game }) => {
      const result = await game.withMods((m) => {
        const restoreCost = m.rip.getNearSpaceScannerArrayRestoreCostGp();
        m.cg.setGalacticPointsSpent(0);
        m.rdo.setCosmicRipGalacticPoints(restoreCost + 10);
        m.rip.restoreNearSpaceScannerArray();

        const first = m.rip.scanCosmicRipSector(3);
        const second = m.rip.scanCosmicRipSector(3);
        return { first, second };
      });

      expect(result.first.ok).toBe(true);
      expect(result.second).toEqual({ ok: false, reason: 'already_scanned' });
    });

    test('an out-of-range sector index is rejected', async ({ game }) => {
      const result = await game.withMods((m) => {
        const restoreCost = m.rip.getNearSpaceScannerArrayRestoreCostGp();
        m.cg.setGalacticPointsSpent(0);
        m.rdo.setCosmicRipGalacticPoints(restoreCost + 10);
        m.rip.restoreNearSpaceScannerArray();

        return {
          negative: m.rip.scanCosmicRipSector(-1),
          tooHigh: m.rip.scanCosmicRipSector(m.rip.getCosmicRipSectorCount()),
          notANumber: m.rip.scanCosmicRipSector('nope')
        };
      });

      expect(result.negative).toEqual({ ok: false, reason: 'invalid_sector' });
      expect(result.tooHigh).toEqual({ ok: false, reason: 'invalid_sector' });
      expect(result.notANumber).toEqual({ ok: false, reason: 'invalid_sector' });
    });

    test('scanning is refused once the GP balance is spent to zero', async ({ game }) => {
      const result = await game.withMods((m) => {
        const restoreCost = m.rip.getNearSpaceScannerArrayRestoreCostGp();
        m.cg.setGalacticPointsSpent(0);
        m.rdo.setCosmicRipGalacticPoints(restoreCost);
        m.rip.restoreNearSpaceScannerArray();

        // Every GP was spent on restoration, so no scan can be afforded.
        const balance = m.rdo.getCosmicRipGalacticPoints();
        const outcome = m.rip.scanCosmicRipSector(0);
        return { balance, outcome };
      });

      expect(result.balance).toBe(0);
      expect(result.outcome).toEqual({ ok: false, reason: 'not_enough_gp' });
    });

    test('galactic points derive from settled systems and never go negative', async ({ game }) => {
      await game.withMods((m) => m.cg.setGalacticPointsSpent(0));

      const withOneExtraSystem = await game.withMods((m) => {
        m.cg.setSettledStars('vega');
        const settledCount = m.cg.getSettledStars().length - 1;
        return settledCount;
      });
      await game.page.waitForTimeout(700);
      const gpAfterSettling = await game.withMods((m) => Number(m.rdo.getCosmicRipGalacticPoints()) || 0);

      await game.withMods((m) => m.cg.setGalacticPointsSpent(999));
      await game.page.waitForTimeout(700);
      const gpAfterOverspend = await game.withMods((m) => Number(m.rdo.getCosmicRipGalacticPoints()) || 0);

      expect(withOneExtraSystem).toBeGreaterThan(0);
      expect(gpAfterSettling).toBe(withOneExtraSystem);
      expect(gpAfterOverspend).toBe(0);
    });
  });

  test.describe('tech tree isolation', () => {
    test.beforeEach(async ({ game }) => {
      await game.boot();
      await game.prepareRunForStarshipLaunch();
    });

    test('cosmic rip techs unlock into their own array, independent of the main tech tree', async ({ game }) => {
      const result = await game.withMods(async (m) => {
        const techName = 'stabilizerArray';
        m.cg.setCosmicRipTechUnlockedArray([], true);
        m.rdo.setResourceDataObject(10_000_000, 'cosmicRip', ['ripTelemetryData']);
        m.rdo.setCosmicRipGalacticPoints(100);
        m.cg.setGalacticPointsSpent(0);

        const mainTechsBefore = [...m.cg.getTechUnlockedArray()];
        const ripTechsBefore = [...m.cg.getCosmicRipTechUnlockedArray()];

        m.game.gain(1, null, techName, true, null, 'cosmicRipTech', 'tech');

        // Fast-forward every registered delta timer (including this tech's
        // research timer) well past its documented research duration.
        const duration = m.rdo.getResourceDataObject('cosmicRip', ['techs', techName, 'timeToResearch']) || 60000;
        m.timers.timerManagerDelta.update(duration + 5000, 1);

        return {
          mainTechsBefore,
          ripTechsBefore,
          mainTechsAfter: [...m.cg.getTechUnlockedArray()],
          ripTechsAfter: [...m.cg.getCosmicRipTechUnlockedArray()]
        };
      });

      expect(result.ripTechsBefore).not.toContain('stabilizerArray');
      expect(result.ripTechsAfter).toContain('stabilizerArray');
      // Researching a cosmic rip tech must not leak into the main tree's array.
      expect(result.mainTechsAfter).toEqual(result.mainTechsBefore);
    });
  });

  test.describe('build-flag gating', () => {
    test('with the build flag enabled, the Cosmic Rip tab exists', async ({ game }) => {
      await game.boot();

      const state = await game.page.evaluate(() => ({
        flag: window.__COSMIC_RIP_ENABLED__,
        tabExists: Boolean(document.getElementById('tab8')),
        containerExists: Boolean(document.getElementById('tab8ContainerGroup'))
      }));

      expect(state.flag).toBe(true);
      expect(state.tabExists).toBe(true);
      expect(state.containerExists).toBe(true);
    });

    test('with the build flag disabled, the whole tab is removed from the DOM', async ({ page }) => {
      await page.route('**/buildFlags.js', (route) =>
        route.fulfill({
          contentType: 'text/javascript',
          body: `window.__DEMO_BUILD__ = false;\nwindow.__COSMIC_RIP_ENABLED__ = false;\nwindow.__VARIABLE_DEBUGGER_AND_CHEATS__ = true;\n`
        })
      );

      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#pioneerCodeName', { timeout: 60000 });
      await page.fill('#pioneerCodeName', `Test1981_e2e_cosmicrip_${Date.now()}`);
      await page.click('#modalConfirm');
      await page.waitForSelector('#fullScreenCheckBox', { timeout: 60000 });
      await page.click('#fullScreenCheckBox');
      await page.click('#modalConfirm');
      await page.waitForSelector('#tab1', { timeout: 60000 });

      const cancel = page.locator('#modalCancel');
      if (await cancel.isVisible({ timeout: 3000 }).catch(() => false)) {
        if ((await cancel.textContent())?.trim() === 'NO') await cancel.click();
      }

      // showTabsUponUnlock() removes tab8 from the DOM on the very first frame
      // when the flag is off, so give the loop a moment to run.
      await page.waitForTimeout(500);

      const state = await page.evaluate(() => ({
        flag: window.__COSMIC_RIP_ENABLED__,
        tabExists: Boolean(document.getElementById('tab8')),
        containerExists: Boolean(document.getElementById('tab8ContainerGroup'))
      }));

      expect(state.flag).toBe(false);
      expect(state.tabExists).toBe(false);
      expect(state.containerExists).toBe(false);
    });
  });
});
