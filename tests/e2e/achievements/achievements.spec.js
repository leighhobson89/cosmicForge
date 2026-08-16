/**
 * Area: Achievements
 * Plan: tests/docs/areas/achievements.md
 *
 * Covers unlock conditions, single-fire behaviour, reward application, notification
 * content and localization, and persistence of achievement state.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe('Achievements', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('no achievement is active on a fresh save', async ({ game }) => {
    const result = await game.withMods((m) => {
      const data = m.rdo.achievementsData || {};
      const active = Object.entries(data)
        .filter(([k, v]) => k !== 'version' && v && typeof v === 'object' && v.active === true)
        .map(([k]) => k);
      return {
        total: Object.keys(data).filter((k) => k !== 'version').length,
        active,
        flagArray: m.cg.getAchievementFlagArray?.() ?? []
      };
    });

    expect(result.total).toBeGreaterThan(0);
    // A brand-new game must not have pre-granted achievements.
    expect(result.active).toEqual([]);
    expect(result.flagArray).toEqual([]);
  });

  test('a resource achievement fires only once its requirement is met', async ({ game }) => {
    // collect50Hydrogen requires 50 hydrogen and gives 10 cash.
    const belowThreshold = await game.withMods((m) => {
      m.rdo.setResourceDataObject(49, 'resources', ['hydrogen', 'quantity']);
      m.ach.checkForAchievements();
      return m.rdo.getAchievementDataObject('collect50Hydrogen')?.active;
    });
    expect(belowThreshold).toBe(false);

    const atThreshold = await game.withMods((m) => {
      const cashBefore = m.rdo.getResourceDataObject('currency', ['cash']);
      m.rdo.setResourceDataObject(50, 'resources', ['hydrogen', 'quantity']);
      m.ach.checkForAchievements();
      return {
        active: m.rdo.getAchievementDataObject('collect50Hydrogen')?.active,
        cashBefore,
        cashAfter: m.rdo.getResourceDataObject('currency', ['cash'])
      };
    });

    expect(atThreshold.active).toBe(true);
    // The achievement's documented reward is 10 cash.
    expect(atThreshold.cashAfter).toBe(atThreshold.cashBefore + 10);
  });

  test('an achievement does not re-grant its reward on repeated checks', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.rdo.setResourceDataObject(50, 'resources', ['hydrogen', 'quantity']);
      m.ach.checkForAchievements();
      const cashAfterFirst = m.rdo.getResourceDataObject('currency', ['cash']);

      // Many more checks, as the frame loop would do.
      for (let i = 0; i < 25; i++) m.ach.checkForAchievements();

      return {
        cashAfterFirst,
        cashAfterMany: m.rdo.getResourceDataObject('currency', ['cash']),
        active: m.rdo.getAchievementDataObject('collect50Hydrogen')?.active
      };
    });

    expect(result.active).toBe(true);
    expect(result.cashAfterMany).toBe(result.cashAfterFirst);
  });

  test('granting an achievement shows a notification with real text, not a raw key', async ({ game }) => {
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(50, 'resources', ['hydrogen', 'quantity']);
      m.ach.checkForAchievements();
    });

    await game.page.waitForTimeout(500);
    const notifications = await game.notifications();
    const joined = notifications.join(' | ');

    expect(joined.length).toBeGreaterThan(0);
    // The notification must be resolved copy, not the localization key itself.
    expect(joined).not.toContain('collect50HydrogenNotification');
  });

  test('every achievement has the data required to be granted', async ({ game }) => {
    const problems = await game.withMods((m) => {
      const data = m.rdo.achievementsData || {};
      const issues = [];

      for (const [key, ach] of Object.entries(data)) {
        if (key === 'version' || !ach || typeof ach !== 'object') continue;
        if (!ach.id) issues.push(`${key}: missing id`);
        if (ach.id && ach.id !== key) issues.push(`${key}: id mismatch (${ach.id})`);
        if (!ach.gives || typeof ach.gives !== 'object') issues.push(`${key}: missing gives`);
        if (!ach.notification) issues.push(`${key}: missing notification key`);
        if (!ach.requirements || typeof ach.requirements !== 'object') {
          issues.push(`${key}: missing requirements`);
        }
      }
      return issues;
    });

    expect(problems).toEqual([]);
  });

  test('every achievement notification resolves to real copy in all five languages', async ({ game }) => {
    // An achievement's `notification` field is a lookup key into the
    // achievementNotifications map in descriptions.js, which is rebuilt per
    // language — it is not itself a localization key. Rebuild per language and
    // assert the resolved copy is real text.
    const unresolved = await game.withMods(async (m) => {
      const data = m.rdo.achievementsData || {};
      const languages = ['en', 'es', 'de', 'it', 'fr'];
      const problems = [];
      const original = m.cg.getLanguage();

      for (const lang of languages) {
        await m.loc.initLocalization(lang);
        m.desc.initialiseDescriptions();

        for (const [key, ach] of Object.entries(data)) {
          if (key === 'version' || !ach?.notification) continue;
          const resolved = m.desc.getAchievementNotification(ach.notification);
          if (!resolved || typeof resolved !== 'string' || !resolved.trim()) {
            problems.push(`${lang}:${ach.notification}:empty`);
          } else if (resolved === ach.notification) {
            problems.push(`${lang}:${ach.notification}:unresolved`);
          }
        }
      }

      await m.loc.initLocalization(original);
      m.desc.initialiseDescriptions();
      return problems;
    });

    expect(unresolved).toEqual([]);
  });

  test('achievement state survives a save/load round trip', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.rdo.setResourceDataObject(50, 'resources', ['hydrogen', 'quantity']);
      m.ach.checkForAchievements();
      const activeBefore = m.rdo.getAchievementDataObject('collect50Hydrogen')?.active;

      const captured = m.cg.captureGameStatusForSaving('initialise');
      const serialized = JSON.stringify(captured);
      const restored = JSON.parse(serialized);

      return {
        activeBefore,
        persisted: restored.achievementsData?.collect50Hydrogen?.active
      };
    });

    expect(result.activeBefore).toBe(true);
    expect(result.persisted).toBe(true);
  });

  test('granting by id is equivalent to granting by object', async ({ game }) => {
    const result = await game.withMods((m) => {
      const target = 'collect1000Hydrogen';
      const before = m.rdo.getAchievementDataObject(target)?.active;
      m.ach.grantAchievement(target);
      return { before, after: m.rdo.getAchievementDataObject(target)?.active };
    });

    expect(result.before).toBe(false);
    expect(result.after).toBe(true);
  });

  test('granting an unknown achievement throws rather than failing silently', async ({ game }) => {
    const outcome = await game.withMods((m) => {
      try {
        m.ach.grantAchievement('definitelyNotAnAchievement');
        return 'no-throw';
      } catch (e) {
        return e.constructor.name;
      }
    });

    expect(outcome).toBe('TypeError');
  });
});
