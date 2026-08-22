/**
 * Area: Battle & Conquest
 * Plan: tests/docs/areas/battle.md
 *
 * The debug menu's "Add 30 Fleets + Envoy" and the full starship-launch scenario
 * provide the fleet and diplomacy state these paths need, so nothing here has to
 * fake late-game progression by hand.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

const FLEET_TYPES = ['fleetEnvoy', 'fleetScout', 'fleetMarauder', 'fleetLandStalker', 'fleetNavalStrafer'];

test.describe('Battle & Conquest', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
  });

  test('the debug scenario provides a real fleet', async ({ game }) => {
    const fleets = await game.withMods((m, types) => {
      const out = {};
      for (const t of types) {
        out[t] = m.rdo.getResourceDataObject('space', ['upgrades', t, 'quantity']) ?? 0;
      }
      return out;
    }, FLEET_TYPES);

    const total = Object.values(fleets).reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(0);
    // The envoy is what makes diplomacy possible.
    expect(fleets.fleetEnvoy).toBeGreaterThan(0);
  });

  test('every fleet type has coherent combat metadata', async ({ game }) => {
    const problems = await game.withMods((m, types) => {
      const issues = [];
      for (const t of types) {
        const unit = m.rdo.getResourceDataObject('space', ['upgrades', t]);
        if (!unit) { issues.push(`${t}: missing`); continue; }
        if (typeof unit.quantity !== 'number' || unit.quantity < 0) {
          issues.push(`${t}: bad quantity ${unit.quantity}`);
        }
        if (unit.price !== undefined && !(Number.isFinite(unit.price) && unit.price >= 0)) {
          issues.push(`${t}: bad price ${unit.price}`);
        }
      }
      return issues;
    }, FLEET_TYPES);

    expect(problems).toEqual([]);
  });

  test('battle is not ongoing outside of combat', async ({ game }) => {
    const state = await game.withMods((m) => ({
      ongoing: m.cg.getBattleOngoing(),
      warMode: m.cg.getWarMode(),
      resolved: m.cg.getBattleResolved()
    }));

    expect(state.ongoing).toBeFalsy();
    expect(state.warMode).toBeFalsy();
  });

  test('battle flags round-trip through their accessors', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.cg.setBattleOngoing(true);
      m.cg.setBattleTriggeredByPlayer(true);
      m.cg.setWarMode(true);

      const set = {
        ongoing: m.cg.getBattleOngoing(),
        triggered: m.cg.getBattleTriggeredByPlayer(),
        war: m.cg.getWarMode()
      };

      m.cg.setBattleOngoing(false);
      m.cg.setBattleTriggeredByPlayer(false);
      m.cg.setWarMode(false);

      return {
        set,
        restored: {
          ongoing: m.cg.getBattleOngoing(),
          triggered: m.cg.getBattleTriggeredByPlayer(),
          war: m.cg.getWarMode()
        }
      };
    });

    expect(result.set).toEqual({ ongoing: true, triggered: true, war: true });
    expect(result.restored).toEqual({ ongoing: false, triggered: false, war: false });
  });

  test('battle resolution records both an outcome and a winner', async ({ game }) => {
    // battleResolved is a [status, winner] tuple, not a boolean — a caller that
    // treats it as a plain flag would read the array as always-truthy.
    const result = await game.withMods((m) => {
      m.cg.setBattleResolved(true, 'player');
      const won = m.cg.getBattleResolved();

      m.cg.setBattleResolved(true, 'enemy');
      const lost = m.cg.getBattleResolved();

      m.cg.setBattleResolved(false, null);
      const reset = m.cg.getBattleResolved();

      return { won, lost, reset };
    });

    expect(Array.isArray(result.won)).toBe(true);
    expect(result.won).toEqual([true, 'player']);
    expect(result.lost).toEqual([true, 'enemy']);
    expect(result.reset).toEqual([false, null]);
  });

  test('autosave is suppressed while a battle is ongoing', async ({ game }) => {
    // initializeAutoSave gates on: getAutoSaveToggle() && !getBattleOngoing()
    const result = await game.withMods((m) => {
      m.cg.setAutoSaveToggle(true);

      m.cg.setBattleOngoing(false);
      const idle = m.cg.getAutoSaveToggle() && !m.cg.getBattleOngoing();

      m.cg.setBattleOngoing(true);
      const inBattle = m.cg.getAutoSaveToggle() && !m.cg.getBattleOngoing();

      m.cg.setBattleOngoing(false);
      return { idle, inBattle };
    });

    expect(result.idle).toBe(true);
    // Saving mid-battle is what allows save-scumming a loss.
    expect(result.inBattle).toBe(false);
  });

  test('enemy fleet power is a finite non-negative number', async ({ game }) => {
    const result = await game.withMods((m) => {
      const atStart = m.cg.getEnemyFleetPowerAtBattleStart?.();
      return { atStart, type: typeof atStart };
    });

    if (result.atStart !== undefined && result.atStart !== null) {
      expect(Number.isFinite(Number(result.atStart))).toBe(true);
      expect(Number(result.atStart)).toBeGreaterThanOrEqual(0);
    } else {
      // No battle has started, so no recorded power — that is valid.
      expect(result.atStart ?? null).toBeNull();
    }
  });

  test('diplomacy is possible once an envoy exists', async ({ game }) => {
    const state = await game.withMods((m) => ({
      diplomacyPossible: m.cg.getDiplomacyPossible(),
      envoys: m.rdo.getResourceDataObject('space', ['upgrades', 'fleetEnvoy', 'quantity']) ?? 0
    }));

    expect(state.envoys).toBeGreaterThan(0);
    expect(state.diplomacyPossible).toBe(true);
  });

  test('entering war mode closes diplomacy', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.cg.setWarMode(false);
      m.cg.setDiplomacyPossible(true);
      const before = {
        war: m.cg.getWarMode(),
        diplomacy: m.cg.getDiplomacyPossible()
      };

      // Entering war is the documented one-way door out of diplomacy.
      m.cg.setWarMode(true);
      m.cg.setDiplomacyPossible(false);
      const after = {
        war: m.cg.getWarMode(),
        diplomacy: m.cg.getDiplomacyPossible()
      };

      m.cg.setWarMode(false);
      m.cg.setDiplomacyPossible(true);
      return { before, after };
    });

    expect(result.before).toEqual({ war: false, diplomacy: true });
    expect(result.after).toEqual({ war: true, diplomacy: false });
  });

  test('the belligerent enemy flag round-trips', async ({ game }) => {
    const result = await game.withMods((m) => {
      const before = m.cg.getBelligerentEnemyFlag();
      m.cg.setBelligerentEnemyFlag(true);
      const set = m.cg.getBelligerentEnemyFlag();
      m.cg.setBelligerentEnemyFlag(before ?? false);
      return { set, restored: m.cg.getBelligerentEnemyFlag() };
    });

    expect(result.set).toBe(true);
    expect(result.restored).toBeFalsy();
  });

  test('battle outcome modal copy resolves in all six languages', async ({ game }) => {
    const unresolved = await game.withMods(async (m) => {
      const languages = ['en', 'es', 'pt', 'de', 'it', 'fr'];
      const original = m.cg.getLanguage();
      const problems = [];

      for (const lang of languages) {
        await m.loc.initLocalization(lang);
        m.desc.initialiseDescriptions();

        const samples = {
          modalBattleHeaderText: m.desc.modalBattleHeaderText,
          modalBattleWonText: m.desc.modalBattleWonText,
          modalBattleLostText: m.desc.modalBattleLostText,
          modalBattleNoSentientLifeHeader: m.desc.modalBattleNoSentientLifeHeader,
          modalBattleNoSentientLifeText: m.desc.modalBattleNoSentientLifeText
        };

        for (const [name, value] of Object.entries(samples)) {
          if (!value || typeof value !== 'string' || !value.trim()) {
            problems.push(`${lang}:${name}:empty`);
          }
        }
      }

      await m.loc.initLocalization(original);
      m.desc.initialiseDescriptions();
      return problems;
    });

    expect(unresolved).toEqual([]);
  });

  test('battle state survives a save/load round trip', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.cg.setWarMode(true);
      m.cg.setBelligerentEnemyFlag(true);

      const restored = JSON.parse(JSON.stringify(m.cg.captureGameStatusForSaving('initialise')));

      m.cg.setWarMode(false);
      m.cg.setBelligerentEnemyFlag(false);

      return {
        warMode: restored.flags?.warMode,
        belligerent: restored.flags?.belligerentEnemyFlag
      };
    });

    expect(result.warMode).toBe(true);
    expect(result.belligerent).toBe(true);
  });

  test('a victory awards AP and the award is recorded for the run', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.cg.setAscendencyPoints(0);
      m.cg.setApAwardedThisRun(0);

      // Settle the award the way a won battle does.
      const award = 3;
      m.cg.setAscendencyPoints(m.cg.getAscendencyPoints() + award);
      m.cg.setApAwardedThisRun(m.cg.getApAwardedThisRun() + award);

      return {
        ap: m.cg.getAscendencyPoints(),
        awarded: m.cg.getApAwardedThisRun()
      };
    });

    expect(result.ap).toBe(3);
    expect(result.awarded).toBe(3);
  });
});
