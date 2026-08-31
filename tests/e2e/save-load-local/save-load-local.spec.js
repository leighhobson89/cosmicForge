/**
 * Area: Local Save & Load — the two ways a player moves a run off this machine
 * Plan: tests/docs/areas/save-load-local.md
 *
 * The game offers local saving in two shapes, and they are different features
 * that happen to share a payload:
 *
 *   the code    the compressed string in #exportSaveArea. Export copies it to the
 *               clipboard, Import reads it back out of #importSaveArea. This is
 *               what a player pastes into a Discord message or a text file.
 *   the file    Manual Save writes `cosmic_forge_save_<timestamp>.txt` through a
 *               real browser download; Manual Load reads one back through a real
 *               file picker.
 *
 * Every spec here drives those four buttons rather than calling saveGame() and
 * loadGame(). That matters because the interesting failures are not in the
 * compression — they are in the wiring: the pane's once-per-visit `onSaveScreen`
 * hook that fills the export box, the blob download, the FileReader path, and
 * the validate-before-parse guard. None of that is reachable from a direct call.
 *
 * The shape of every round trip is the same, and is deliberately harsh:
 *
 *   1. play a run (debug scenario chain + real settings changes through the UI)
 *   2. take the artifact the way a player does — copy the code, or download it
 *   3. boot a *completely new run* over the top, with a different pioneer name
 *   4. feed the artifact back in through the real button
 *   5. compare the re-serialised state against the original
 *
 * Step 3 is the part that gives the comparison teeth. Loading into the same
 * session would pass even if restoreGameStatus did nothing at all.
 *
 * Two comparison sets are used, because they have different tolerances:
 *
 *   structural()  identity, unlock arrays, tech list, asteroid count, settings.
 *                 Compared exactly — none of it drifts while the game runs.
 *   totals()      resource and currency quantities. Compared with `>=`, because
 *                 the frame loop keeps producing between the export and the
 *                 comparison and an exact match would be racy by construction.
 */
import { test, expect } from '../_harness/game-fixture.mjs';
import fs from 'node:fs';

/** The Saving / Loading pane's side-menu row, matched on its exact class token. */
const SAVING_PANE_TOKEN = 'tab9.option2';
const VISUAL_PANE_TOKEN = 'tab9.option1';

/** The four save/load buttons. They carry no ids, so they are located by row + class. */
const EXPORT_CODE_BUTTON = '#exportSaveRow button.save-load-button';
const DOWNLOAD_FILE_BUTTON = '#exportSaveRow button.save-load-file-export';
const IMPORT_CODE_BUTTON = '#importSaveRow button.save-load-button';
const LOAD_FILE_BUTTON = '#importSaveRow button.save-load-file-export';

/** Open one of the tab 9 panes through its real side-menu row. */
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
 * The box is not filled by opening the pane: `gameLoop` notices the pane is open,
 * calls `saveGame('onSaveScreen')` once, and that is what writes the value. So the
 * wait is on the value appearing, not on the pane rendering.
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

/** Clear the notification tray so the next poll cannot read a stale message. */
async function clearNotifications(game) {
  await game.page.evaluate(() =>
    document.querySelectorAll('.notification-container').forEach((c) => c.replaceChildren()));
}

/**
 * Poll for a save/load notification matching `pattern`.
 *
 * Notifications are queued per classification and shown one at a time, so a
 * single snapshot taken straight after a click reads the *previous* message.
 * Returns the matching text, or null if it never appeared.
 */
async function waitForNotification(game, pattern, { timeout = 20000 } = {}) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const seen = await game.notifications('loadSave');
    const hit = seen.find((t) => pattern.test(t));
    if (hit) return hit;
    await game.page.waitForTimeout(250);
  }
  return null;
}

/**
 * Fields that must survive a round trip byte for byte. None of these drift.
 *
 * `saveName` is deliberately *not* here. `restoreGameStatus` only adopts the
 * name out of the save when the load came from the cloud — a local import keeps
 * the importing player's own pioneer name, so that pasting in someone else's
 * save string cannot take over their cloud slot. The round-trip specs assert
 * that rule explicitly rather than folding it into this comparison.
 */
function structural(state) {
  return {
    version: state.resourceData?.version,
    techs: [...(state.techUnlockedArray ?? [])].sort(),
    unlockedResources: [...(state.unlockedResourcesArray ?? [])].sort(),
    unlockedCompounds: [...(state.unlockedCompoundsArray ?? [])].sort(),
    asteroids: (state.asteroidArray ?? []).length,
    rocketsBuilt: state.rocketsBuilt,
    currentStarSystem: state.currentStarSystem,
    notationType: state.notationType,
    currencySymbol: state.currencySymbol,
    autoSaveFrequency: state.autoSaveFrequency,
    // A handful of nested data-object values, to prove the round trip reaches
    // past the top level of the state object.
    powerPlant1: state.resourceData?.buildings?.energy?.upgrades?.powerPlant1?.quantity,
    hydrogenTier1Name: state.resourceData?.resources?.hydrogen?.upgrades?.autoBuyer?.tier1?.nameUpgrade,
    ripStage: state.resourceData?.cosmicRip?.stage ?? null
  };
}

/** Quantities, which the running game may have increased since the export. */
function totals(state) {
  return {
    cash: Math.floor(state.resourceData?.currency?.cash ?? -1),
    antimatter: Math.floor(state.resourceData?.antimatter?.quantity ?? -1),
    hydrogen: Math.floor(state.resourceData?.resources?.hydrogen?.quantity ?? -1),
    research: Math.floor(state.resourceData?.research?.quantity ?? -1)
  };
}

/** Choose a value from one of the settings dropdowns, through the dropdown itself. */
async function chooseDropdown(game, dropdownId, value) {
  const ok = await game.page.evaluate(({ id, option }) => {
    const container = document.getElementById(id);
    if (!container) return false;
    container.querySelector('div.dropdown')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const choice = container.querySelector(`div.dropdown-option[data-value="${option}"]`);
    if (!choice) return false;
    choice.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, { id: dropdownId, option: value });
  if (!ok) throw new Error(`Could not choose "${value}" in #${dropdownId}`);
  await game.page.waitForTimeout(600);
}

/**
 * Play a run worth saving: the game's own scenario chain for the bulk of it, plus
 * the currency changed through its real dropdown so the save carries something
 * the player chose by hand rather than only what the debug menu granted.
 *
 * Notation used to be the second hand-chosen setting here. It no longer can be:
 * plain notation was retired from the Visual pane, and a save that carries it is
 * migrated back onto condensed on load — so notationType still round-trips (it is
 * in `structural()` below), it just no longer varies.
 */
async function playARun(game, { currency = '€' } = {}) {
  await game.openDebugMenu();
  await game.debugClick('give1BButton');
  await game.debugClick('grantAllTechsButton');
  await game.debugClick('add10AsteroidsButton');
  await game.debugClick('gain10000AntimatterButton');
  await game.debugClick('unlockAllTabsButton');
  await game.page.waitForTimeout(800);

  await openPaneByToken(game, VISUAL_PANE_TOKEN);
  await chooseDropdown(game, 'currencySelect', currency);
}

test.describe('Local save & load — the code', () => {
  test.setTimeout(240000);

  test('a run exported as a code restores into a brand new session', async ({ game }) => {
    await game.boot();
    const originalPioneer = game.pioneer;

    await playARun(game);
    await openSavingPane(game);

    const code = await exportedCode(game);
    expect(code.length, 'the pane must fill the export box on arrival').toBeGreaterThan(50);

    const saved = await decode(game, code);
    expect(saved, 'the exported code must decompress to a game state').not.toBeNull();
    const savedStructural = structural(saved);
    const savedTotals = totals(saved);

    // A completely different run, so nothing left over from the first can make
    // the comparison below pass by accident.
    await game.boot();
    const importerPioneer = game.pioneer;
    expect(importerPioneer).not.toBe(originalPioneer);

    await openSavingPane(game);
    const beforeImport = await decode(game, await exportedCode(game));
    expect(beforeImport.saveName, 'the new run must start out as a different pioneer')
      .not.toBe(saved.saveName);
    expect(structural(beforeImport).techs.length, 'the new run must start with no techs').toBe(0);

    await clearNotifications(game);
    await importCode(game, code);

    const loaded = await waitForNotification(game, /loaded successfully/i);
    expect(loaded, 'importing a valid code must tell the player it worked').toBeTruthy();

    await revisitSavingPane(game);
    const restored = await decode(game, await exportedCode(game));

    expect(structural(restored)).toEqual(savedStructural);

    // The one field the import must NOT take from the save. Adopting the name
    // would point this player's autosave at the cloud slot of whoever wrote the
    // code they pasted in, and quietly overwrite that person's game.
    expect(restored.saveName, 'a local import must keep the importing player as the pioneer')
      .toBe(importerPioneer);
    expect(restored.saveName).not.toBe(saved.saveName);

    const restoredTotals = totals(restored);
    for (const key of Object.keys(savedTotals)) {
      expect(restoredTotals[key], `${key} must survive the round trip`)
        .toBeGreaterThanOrEqual(savedTotals[key]);
    }

    expect(game.significantErrors()).toEqual([]);
  });

  test('the exported code is compressed, not readable JSON', async ({ game }) => {
    await game.boot();
    await openSavingPane(game);

    const code = await exportedCode(game);

    // Not JSON in its own right, and none of the field names are legible in it —
    // that is what makes it safe to paste into a chat window without leaking a
    // wall of state, and it is why every import path must decompress first.
    expect(() => JSON.parse(code)).toThrow();
    expect(code).not.toContain('resourceData');
    expect(code).not.toContain('saveName');

    const decoded = await decode(game, code);
    expect(decoded).not.toBeNull();
    expect(decoded.resourceData).toBeTruthy();
    expect(decoded.saveName).toBe(game.pioneer);

    // The compressed form is materially smaller than the JSON it encodes.
    const jsonLength = JSON.stringify(decoded).length;
    expect(code.length).toBeLessThan(jsonLength / 2);

    expect(game.significantErrors()).toEqual([]);
  });

  test('the Export button copies the code to the clipboard', async ({ game }) => {
    await game.page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await game.boot();
    await openSavingPane(game);

    const code = await exportedCode(game);
    await clearNotifications(game);
    await game.page.click(EXPORT_CODE_BUTTON);

    const copied = await waitForNotification(game, /copied to clipboard/i);
    expect(copied, 'the Export button must confirm the copy').toBeTruthy();

    const clipboard = await game.page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toBe(code);

    expect(game.significantErrors()).toEqual([]);
  });

  test('a truncated code is refused and the running game is left alone', async ({ game }) => {
    await game.boot();
    await playARun(game);
    await openSavingPane(game);

    const code = await exportedCode(game);
    const before = structural(await decode(game, code));

    await clearNotifications(game);
    await importCode(game, code.slice(0, Math.floor(code.length / 2)));

    const refused = await waitForNotification(game, /invalid game data string/i);
    expect(refused, 'a truncated code must be refused with a message').toBeTruthy();

    await revisitSavingPane(game);
    const after = structural(await decode(game, await exportedCode(game)));
    expect(after, 'a refused import must not disturb the live run').toEqual(before);
  });

  test('a code that is not a save at all is refused', async ({ game }) => {
    await game.boot();
    await playARun(game);
    await openSavingPane(game);

    const before = structural(await decode(game, await exportedCode(game)));

    await clearNotifications(game);
    await importCode(game, 'this is not a cosmic forge save at all');

    const refused = await waitForNotification(game, /invalid game data string/i);
    expect(refused, 'arbitrary text must be refused with a message').toBeTruthy();

    await revisitSavingPane(game);
    expect(structural(await decode(game, await exportedCode(game)))).toEqual(before);
  });

  test('pressing Import with an empty box tells the player rather than failing silently', async ({ game }) => {
    await game.boot();
    await openSavingPane(game);

    const before = structural(await decode(game, await exportedCode(game)));

    await clearNotifications(game);
    await importCode(game, '');

    // The player has pressed a button and is entitled to know why nothing
    // happened. `loadGame()` rejects on an empty box, and the row's onClick does
    // not catch it, so today this produces an unhandled rejection and no message.
    const told = await waitForNotification(game, /save|data|invalid/i, { timeout: 8000 });
    expect(told, 'an empty import box must produce a message, not silence').toBeTruthy();

    await revisitSavingPane(game);
    expect(structural(await decode(game, await exportedCode(game)))).toEqual(before);

    expect(game.significantErrors(), 'a refused import must not leave an unhandled rejection')
      .toEqual([]);
  });

  test('the save pane captures once per visit, and captures again on the next visit', async ({ game }) => {
    await game.boot();
    await openSavingPane(game);

    expect(await game.withMods((m) => m.cg.getSavedYetSinceOpeningSaveDialogue()))
      .toBe(true);

    // Sitting on the pane must not re-capture: the guard exists so the box does
    // not churn under the player while they are selecting the text in it.
    const first = await exportedCode(game);
    await game.page.waitForTimeout(2500);
    expect(await exportedCode(game), 'the code must be stable while the pane is open')
      .toBe(first);

    await openPaneByToken(game, VISUAL_PANE_TOKEN);
    await game.page.waitForTimeout(600);
    expect(await game.withMods((m) => m.cg.getSavedYetSinceOpeningSaveDialogue()))
      .toBe(false);

    // Play on, come back: the new visit must capture the progress made since.
    await game.openDebugMenu();
    await game.debugClick('give1BButton');
    await game.page.waitForTimeout(500);

    await openSavingPane(game);
    const second = await exportedCode(game);
    expect(second, 'a return visit must capture a fresh save').not.toBe(first);

    const firstCash = totals(await decode(game, first)).cash;
    const secondCash = totals(await decode(game, second)).cash;
    expect(secondCash).toBeGreaterThan(firstCash);

    expect(game.significantErrors()).toEqual([]);
  });
});

test.describe('Local save & load — the file', () => {
  test.setTimeout(240000);

  test('Manual Save downloads a .txt holding exactly the exported code', async ({ game }, testInfo) => {
    await game.boot();
    await playARun(game);
    await openSavingPane(game);

    const code = await exportedCode(game);

    const [download] = await Promise.all([
      game.page.waitForEvent('download', { timeout: 30000 }),
      game.page.click(DOWNLOAD_FILE_BUTTON)
    ]);

    // The name carries a timestamp so successive saves do not overwrite one
    // another in the player's downloads folder.
    expect(download.suggestedFilename())
      .toMatch(/^cosmic_forge_save_\d{4}_\d{2}_\d{2}.*\.txt$/);

    const path = testInfo.outputPath('downloaded-save.txt');
    await download.saveAs(path);
    const onDisk = fs.readFileSync(path, 'utf8');

    expect(onDisk).toBe(code);

    const decoded = await decode(game, onDisk);
    expect(decoded, 'the downloaded file must decompress to a game state').not.toBeNull();
    expect(decoded.saveName).toBe(game.pioneer);

    expect(game.significantErrors()).toEqual([]);
  });

  test('a downloaded save file loads back into a brand new session', async ({ game }, testInfo) => {
    await game.boot();
    const originalPioneer = game.pioneer;

    await playARun(game, { currency: '£' });
    await openSavingPane(game);

    const [download] = await Promise.all([
      game.page.waitForEvent('download', { timeout: 30000 }),
      game.page.click(DOWNLOAD_FILE_BUTTON)
    ]);
    const path = testInfo.outputPath('round-trip-save.txt');
    await download.saveAs(path);

    const saved = await decode(game, fs.readFileSync(path, 'utf8'));
    const savedStructural = structural(saved);
    const savedTotals = totals(saved);

    // Fresh run, then load the file over the top through the real picker.
    await game.boot();
    const importerPioneer = game.pioneer;
    expect(importerPioneer).not.toBe(originalPioneer);
    await openSavingPane(game);
    await clearNotifications(game);

    const [chooser] = await Promise.all([
      game.page.waitForEvent('filechooser', { timeout: 30000 }),
      game.page.click(LOAD_FILE_BUTTON)
    ]);
    await chooser.setFiles(path);

    const loaded = await waitForNotification(game, /loaded successfully/i, { timeout: 30000 });
    expect(loaded, 'loading a save file must tell the player it worked').toBeTruthy();

    await revisitSavingPane(game);
    const restored = await decode(game, await exportedCode(game));

    expect(structural(restored)).toEqual(savedStructural);

    // Same rule as the code path: the file carries the run, not the identity.
    expect(restored.saveName, 'loading a save file must keep the importing player as the pioneer')
      .toBe(importerPioneer);
    expect(restored.saveName).not.toBe(saved.saveName);

    const restoredTotals = totals(restored);
    for (const key of Object.keys(savedTotals)) {
      expect(restoredTotals[key], `${key} must survive the file round trip`)
        .toBeGreaterThanOrEqual(savedTotals[key]);
    }

    expect(game.significantErrors()).toEqual([]);
  });

  test('a .txt file that is not a save is refused through the file picker', async ({ game }, testInfo) => {
    await game.boot();
    await playARun(game);
    await openSavingPane(game);

    const before = structural(await decode(game, await exportedCode(game)));

    const junk = testInfo.outputPath('not-a-save.txt');
    fs.writeFileSync(junk, 'Dear diary, today I did not save my game.\n', 'utf8');

    await clearNotifications(game);
    const [chooser] = await Promise.all([
      game.page.waitForEvent('filechooser', { timeout: 30000 }),
      game.page.click(LOAD_FILE_BUTTON)
    ]);
    await chooser.setFiles(junk);

    const refused = await waitForNotification(game, /invalid game data string/i, { timeout: 30000 });
    expect(refused, 'a junk file must be refused with a message').toBeTruthy();

    await revisitSavingPane(game);
    expect(structural(await decode(game, await exportedCode(game))), 'a refused file must not disturb the live run')
      .toEqual(before);
  });
});
