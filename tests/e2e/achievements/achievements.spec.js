/**
 * Area: Achievements — catalogue integrity, copy, and surviving a save
 * Plan: tests/docs/areas/achievements.md
 *
 * What is left here is only what the other three files do not already cover.
 *
 * | File | Covers |
 * |---|---|
 * | `achievement-catalogue.spec.js` | all seventy conditions, and the exact reward each one pays |
 * | `achievements-live.spec.js` | the scenarios that can be played through the real UI and debug menu, granted by the frame loop |
 * | `achievements-rebirth.spec.js` | what a rebirth clears, what it must never clear, and the permanent multipliers it re-applies |
 * | `achievements-pane.spec.js` | the grid, the artwork for all nine themes, and the tooltips |
 *
 * So this file holds three things none of those reach: the shape of the data
 * every one of those files depends on, the copy the player is shown in all five
 * shipped languages, and the round trip through a real save code.
 *
 * The cases that used to live here — a fresh save granting nothing, one resource
 * achievement firing at its threshold, a reward not being paid twice, and a
 * notification resolving rather than showing a raw key — have moved to the
 * catalogue sweep, which now does all four for every achievement rather than for
 * `collect50Hydrogen` alone. They are not asserted twice.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe.configure({ timeout: 240_000 });

const SAVING_PANE_TOKEN = 'tab9.option2';
const VISUAL_PANE_TOKEN = 'tab9.option1';
const IMPORT_CODE_BUTTON = '#importSaveRow button.save-load-button';

/** Open a tab 9 pane by its class token. */
async function openPaneByToken(game, token) {
  await game.openTab(9);
  const clicked = await game.page.evaluate((classToken) => {
    const row = document.querySelector(`p.inset-paragraph[class~="${classToken}"]`);
    if (!row) return false;
    row.closest('.row-side-menu')?.classList.remove('invisible');
    row.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, token);
  if (!clicked) throw new Error(`No tab 9 side-menu row for ${token}`);
  await game.page.waitForTimeout(500);
}

/**
 * Open Saving / Loading and wait for the game to fill the export box.
 *
 * Opening the pane does not fill it: `gameLoop` notices the pane is open and
 * calls `saveGame('onSaveScreen')` once, and *that* writes the value.
 */
async function openSavingPane(game) {
  await openPaneByToken(game, SAVING_PANE_TOKEN);
  await game.page.waitForFunction(
    () => {
      const area = document.getElementById('exportSaveArea');
      return !!area && typeof area.value === 'string' && area.value.length > 50;
    },
    null,
    { timeout: 30000 }
  );
}

/** Leave the pane and come back, which makes the game capture a fresh save. */
async function revisitSavingPane(game) {
  await openPaneByToken(game, VISUAL_PANE_TOKEN);
  await game.page.waitForTimeout(400);
  await openSavingPane(game);
}

/** The compressed code currently in the export box. */
function exportedCode(game) {
  return game.page.evaluate(() => document.getElementById('exportSaveArea')?.value ?? '');
}

/** Decompress a save code into the game state object it encodes. */
function decode(game, code) {
  return game.page.evaluate((c) => {
    const json = LZString.decompressFromEncodedURIComponent(c);
    return json ? JSON.parse(json) : null;
  }, code);
}

/** Put a string in the import box and press the real Import button. */
async function importCode(game, code) {
  await game.page.evaluate((c) => {
    const area = document.getElementById('importSaveArea');
    if (area) area.value = c;
  }, code);
  await game.page.click(IMPORT_CODE_BUTTON);
}

/** Poll the load/save notification tray for a message. */
async function waitForNotification(game, pattern, timeout = 20000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const seen = await game.notifications('loadSave');
    const hit = seen.find((t) => pattern.test(t));
    if (hit) return hit;
    await game.page.waitForTimeout(250);
  }
  return null;
}

/** Which achievements are currently on. */
async function readActive(game) {
  return game.withMods((m) => Object.keys(m.rdo.achievementsData)
    .filter((k) => k !== 'version' && m.rdo.getAchievementDataObject(k, ['active'], true) === true)
    .sort());
}

test.describe('Achievements — catalogue integrity', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('every achievement carries the data the grant path dereferences', async ({ game }) => {
    // `grantAchievement` throws on a missing `gives`, `addAchievementBonus`
    // reads `gives.gives1`, `checkForAchievements` reads `requirements` and
    // `specialCondition`, and the notification and the tooltip are both keyed
    // off the id. A record missing any of those is a crash waiting for the
    // player who earns it.
    const problems = await game.withMods((m) => {
      const issues = [];

      for (const [key, achievement] of Object.entries(m.rdo.achievementsData)) {
        if (key === 'version' || !achievement || typeof achievement !== 'object') continue;
        if (!achievement.id) issues.push(`${key}: missing id`);
        if (achievement.id && achievement.id !== key) issues.push(`${key}: id mismatch (${achievement.id})`);
        if (!achievement.gives || typeof achievement.gives !== 'object') issues.push(`${key}: missing gives`);
        if (!achievement.gives?.gives1) issues.push(`${key}: gives has no category`);
        if (!achievement.notification) issues.push(`${key}: missing notification key`);
        if (typeof achievement.active !== 'boolean') issues.push(`${key}: active is not a boolean`);
        if (typeof achievement.resetOnRebirth !== 'boolean') issues.push(`${key}: resetOnRebirth is not a boolean`);
        if (!achievement.requirements || typeof achievement.requirements !== 'object') {
          issues.push(`${key}: missing requirements`);
        }

        // A `special` requirement is checked by a named function; anything else
        // goes through `genericAchievementChecker`, which handles exactly five
        // requirement types and silently does nothing for a sixth.
        const requirement = achievement.requirements?.requirement1;
        const handled = ['resources', 'unlock', 'tech', 'buildings', 'cash', 'special'];
        if (!handled.includes(requirement)) {
          issues.push(`${key}: requirement type "${requirement}" is not handled by genericAchievementChecker`);
        }
        if (requirement === 'special' && typeof achievement.specialCondition !== 'function') {
          issues.push(`${key}: declares a special requirement but has no checker function`);
        }
        if (requirement !== 'special' && achievement.specialCondition !== false) {
          issues.push(`${key}: has a checker function but a "${requirement}" requirement, so it will never be run`);
        }
      }
      return issues;
    });

    expect(problems).toEqual([]);
  });

  test('every special checker in the catalogue is one the achievements module exports', async ({ game }) => {
    // `achievementFunctionsMap` is how a save restores a checker after a round
    // trip through JSON, which drops functions. A checker missing from the map
    // survives the first run and stops working the moment the player loads.
    const problems = await game.withMods((m) => {
      const exported = new Set(Object.keys(m.ach.achievementFunctionsMap));
      const issues = [];
      for (const [key, achievement] of Object.entries(m.rdo.achievementsData)) {
        if (key === 'version' || !achievement?.specialConditionName) continue;
        if (!exported.has(achievement.specialConditionName)) {
          issues.push(`${key}: ${achievement.specialConditionName} is not in achievementFunctionsMap`);
        }
        if (m.ach.achievementFunctionsMap[achievement.specialConditionName] !== achievement.specialCondition) {
          issues.push(`${key}: specialCondition is not the function the map names`);
        }
      }
      return issues;
    });

    expect(problems).toEqual([]);
  });

  test('every achievement notification resolves to real copy in all five languages', async ({ game }) => {
    // An achievement's `notification` field is a lookup key into the
    // `achievementNotifications` map in descriptions.js, which is rebuilt per
    // language — it is not itself a localization key. Rebuild per language and
    // assert the resolved copy is real text.
    const unresolved = await game.withMods(async (m) => {
      const data = m.rdo.achievementsData || {};
      const problems = [];
      const original = m.cg.getLanguage();

      for (const language of ['en', 'es', 'pt', 'de', 'it', 'fr']) {
        await m.loc.initLocalization(language);
        m.desc.initialiseDescriptions();

        for (const [key, achievement] of Object.entries(data)) {
          if (key === 'version' || !achievement?.notification) continue;
          const resolved = m.desc.getAchievementNotification(achievement.notification);
          if (!resolved || typeof resolved !== 'string' || !resolved.trim()) {
            problems.push(`${language}:${achievement.notification}:empty`);
          } else if (resolved === achievement.notification) {
            problems.push(`${language}:${achievement.notification}:unresolved`);
          }
        }
      }

      await m.loc.initLocalization(original);
      m.desc.initialiseDescriptions();
      return problems;
    });

    expect(unresolved).toEqual([]);
  });

  test('granting by id is the same as granting by object, and an unknown id is refused', async ({ game }) => {
    // Both call shapes are used in production — `grantAchievementsById` passes
    // objects, `autoGrantAchievementsOnRebirth` passes ids — and a silent no-op
    // for an id that does not exist would hide a typo in either.
    const byId = await game.withMods((m) => {
      const before = m.rdo.getAchievementDataObject('collect1000Hydrogen', ['active'], true);
      m.ach.grantAchievement('collect1000Hydrogen');
      return { before, after: m.rdo.getAchievementDataObject('collect1000Hydrogen', ['active'], true) };
    });
    expect(byId).toEqual({ before: false, after: true });

    const byObject = await game.withMods((m) => {
      const achievement = m.rdo.getAchievementDataObject('collect5000Carbon');
      const before = achievement.active;
      m.ach.grantAchievement(achievement);
      return { before, after: m.rdo.getAchievementDataObject('collect5000Carbon', ['active'], true) };
    });
    expect(byObject).toEqual({ before: false, after: true });

    const unknown = await game.withMods((m) => {
      try {
        m.ach.grantAchievement('definitelyNotAnAchievement');
        return 'no-throw';
      } catch (error) {
        return error.constructor.name;
      }
    });
    expect(unknown, 'a mistyped achievement id must not fail silently').toBe('TypeError');
  });
});

test.describe('Achievements — surviving a save', () => {
  test('earned achievements come back after a run is exported and imported into a new session', async ({ game }) => {
    await game.boot();

    // A spread across the three ways an achievement is earned — a threshold, a
    // tech, and a flag — so the round trip is not proved by one code path.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(1e6, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(1200, 'resources', ['hydrogen', 'quantity']);
      m.cg.setTechUnlockedArray('knowledgeSharing');
      m.cg.setAchievementFlagArray('discoverAsteroid', 'add');
    });

    // Granted by the frame loop, not by this spec.
    await game.page.waitForFunction(
      () => ['collect50Hydrogen', 'collect1000Hydrogen', 'researchTechnology', 'discoverAsteroid']
        .every((id) => globalThis.__mods.rdo.getAchievementDataObject(id, ['active'], true) === true),
      null,
      { timeout: 20000 }
    );

    const earned = await readActive(game);
    expect(earned).toEqual(expect.arrayContaining([
      'collect50Hydrogen', 'collect1000Hydrogen', 'researchTechnology', 'discoverAsteroid'
    ]));

    await openSavingPane(game);
    const code = await exportedCode(game);
    expect(code.length, 'the pane must fill the export box on arrival').toBeGreaterThan(50);

    const saved = await decode(game, code);
    expect(saved, 'the exported code must decompress to a game state').not.toBeNull();
    const savedActive = Object.entries(saved.achievementsData || {})
      .filter(([key, value]) => key !== 'version' && value?.active === true)
      .map(([key]) => key)
      .sort();
    expect(savedActive, 'the save code must carry the achievements the run earned').toEqual(earned);

    // A completely fresh session, so nothing left over can make the comparison
    // below pass by accident.
    await game.boot();
    expect(await readActive(game), 'a new run starts with nothing earned').toEqual([]);

    await openSavingPane(game);
    await importCode(game, code);
    expect(await waitForNotification(game, /loaded successfully/i), 'the import must report success').toBeTruthy();

    await revisitSavingPane(game);

    expect(await readActive(game), 'every earned achievement must come back from the save').toEqual(earned);

    // The checkers are functions, and JSON drops functions. `restoreGameStatus`
    // rebuilds them from `achievementFunctionsMap`; without that, the restored
    // run would throw the moment `checkForAchievements()` reached a special
    // achievement — which is every frame.
    const brokenCheckers = await game.withMods((m) => {
      const issues = [];
      for (const [key, achievement] of Object.entries(m.rdo.achievementsData)) {
        if (key === 'version' || !achievement?.specialConditionName) continue;
        if (typeof achievement.specialCondition !== 'function') {
          issues.push(`${key}: checker did not survive the load`);
        }
      }
      return issues;
    });
    expect(brokenCheckers).toEqual([]);

    // The strongest evidence the restore is sound: the loaded run keeps running.
    const tick = await game.withMods((m) => JSON.stringify(m.cg.getGameActiveCountTime()));
    await game.page.waitForTimeout(1200);
    const tock = await game.withMods((m) => JSON.stringify(m.cg.getGameActiveCountTime()));
    expect(tock, 'the frame loop should still be running after the load').not.toBe(tick);

    expect(game.significantErrors()).toEqual([]);
  });
});
