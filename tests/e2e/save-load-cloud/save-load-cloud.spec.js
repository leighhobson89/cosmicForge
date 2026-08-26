/**
 * Area: Cloud Save & Load — the Supabase round trip, played rather than called
 * Plan: tests/docs/areas/save-load-cloud.md
 *
 * This is the only area in the suite that writes to production infrastructure, so
 * the first thing to understand is what it touches and why that is safe.
 *
 * ## The one row this suite owns
 *
 * Every cloud write in this file lands on a single Supabase row:
 *
 *     ---000test_Test1981_cosmicForge_e2e
 *
 * The name is built to be unmistakable and to sort to the very top of the
 * `cosmicforge_saves` table ahead of every real pioneer, so it is obvious at a
 * glance in the dashboard that it is not a player. The row is *reused* on every
 * run rather than being uniquely named per run: a unique name would mean the
 * table grows by one row every time the suite is executed, forever. Reusing it
 * also means the second and later runs exercise saveGameToCloud's UPDATE branch,
 * which is the branch a returning player actually hits.
 *
 * The `Test1981` fragment is the game's own sanctioned debug backdoor, so this
 * pioneer can reach the debug menu the same way `boot()` normally does.
 *
 * The hard-reset spec additionally creates `graveyard_---000test_...` once, and
 * from then on updates it. Nothing here ever deletes a row: the suite leaves its
 * two rows in place deliberately rather than issuing DELETEs against production.
 *
 * ## Why the specs are serial
 *
 * They share that one row, so they must not interleave — a parallel autosave
 * would overwrite the row mid round trip. `mode: 'serial'` also fixes the order,
 * which matters for the last spec: it destroys the save and then re-saves it, so
 * the row is left holding data for the next run.
 *
 * ## What "a fresh session" means here
 *
 * `game.boot()` navigates, so calling it a second time inside one test is a
 * genuinely new session — new module state, new game loop, the boot modals
 * answered again. Booting as the test pioneer makes the game load that pioneer's
 * cloud save through `loadGameFromCloud()` exactly as it does for a returning
 * player. That is the load path under test; nothing here calls it directly.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/**
 * The single cloud row this suite writes to. Distinctive, sorts to the top of the
 * table, and carries the Test1981 debug backdoor.
 */
const CLOUD_TEST_PIONEER = '---000test_Test1981_cosmicForge_e2e';

const SAVING_PANE_TOKEN = 'tab9.option2';
const VISUAL_PANE_TOKEN = 'tab9.option1';

const SAVE_TO_CLOUD_BUTTON = '#exportCloudSaveRow button.save-load-button';
const LOAD_FROM_CLOUD_BUTTON = '#importCloudSaveRow button.save-load-button';
const HARD_RESET_BUTTON = '#hardResetRow button.hard-reset-button';

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

/** Open Saving / Loading and wait for the game's own once-per-visit capture. */
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

/** The code currently in the export box — after a cloud save, this is what was sent. */
function exportedCode(game) {
  return game.page.evaluate(() => document.getElementById('exportSaveArea')?.value ?? '');
}

function decode(game, code) {
  return game.page.evaluate((c) => {
    const json = LZString.decompressFromEncodedURIComponent(c);
    return json ? JSON.parse(json) : null;
  }, code);
}

async function clearNotifications(game) {
  await game.page.evaluate(() =>
    document.querySelectorAll('.notification-container').forEach((c) => c.replaceChildren()));
}

/** Poll for a save/load notification; returns the matching text or null. */
async function waitForNotification(game, pattern, { timeout = 30000 } = {}) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const seen = await game.notifications('loadSave');
    const hit = seen.find((t) => pattern.test(t));
    if (hit) return hit;
    await game.page.waitForTimeout(250);
  }
  return null;
}

/** Type a pioneer name into the pane's own field, the way a player renames a save. */
async function setPioneerField(game, name) {
  await game.page.evaluate((value) => {
    const field = document.getElementById('saveName');
    if (field) field.value = value;
  }, name);
}

/** Press Save To Cloud and report whichever outcome message the game raised. */
async function saveToCloud(game) {
  await clearNotifications(game);
  await game.page.click(SAVE_TO_CLOUD_BUTTON);
  return waitForNotification(game, /cloud/i);
}

/** Fields that must survive the cloud round trip exactly. */
function structural(state) {
  return {
    saveName: state.saveName,
    version: state.resourceData?.version,
    techs: [...(state.techUnlockedArray ?? [])].sort(),
    unlockedResources: [...(state.unlockedResourcesArray ?? [])].sort(),
    asteroids: (state.asteroidArray ?? []).length,
    currentStarSystem: state.currentStarSystem,
    currencySymbol: state.currencySymbol,
    notationType: state.notationType,
    hydrogenTier1Name: state.resourceData?.resources?.hydrogen?.upgrades?.autoBuyer?.tier1?.nameUpgrade
  };
}

/**
 * structural(), minus the pioneer name.
 *
 * For the cloud round trip the name is part of what must be restored, so it
 * belongs in structural(). But pressing **Save To Cloud** renames the player to
 * whatever is in the pane's field *before* the upload is attempted — the rename
 * is the player's own action in that click, not something the upload did. A spec
 * asking "did the run survive a failed upload?" has to leave it out, or it
 * measures the deliberate rename instead of the failure.
 */
function runOnly(state) {
  const fields = structural(state);
  delete fields.saveName;
  return fields;
}

/** Quantities, which keep growing while the game runs. */
function totals(state) {
  return {
    cash: Math.floor(state.resourceData?.currency?.cash ?? -1),
    antimatter: Math.floor(state.resourceData?.antimatter?.quantity ?? -1),
    hydrogen: Math.floor(state.resourceData?.resources?.hydrogen?.quantity ?? -1)
  };
}

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
 * Play a run worth uploading. The currency symbol is chosen through the real
 * dropdown and differs per spec, which is what lets a later spec prove the cloud
 * row was *replaced* rather than duplicated.
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

test.describe('Cloud save & load', () => {
  // Serial: every spec writes to the same row, and the last one destroys and
  // restores it. Running them in parallel would have them overwrite each other.
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(300000);

  test('a played run saved to the cloud comes back in a fresh session', async ({ game }) => {
    await game.boot();
    const originalPioneer = game.pioneer;

    await playARun(game, { currency: '€' });
    await openSavingPane(game);

    // Renaming the save in the pane's own field is how a player chooses which
    // cloud slot to write to; captureGameStatusForSaving reads it directly.
    await setPioneerField(game, CLOUD_TEST_PIONEER);
    const outcome = await saveToCloud(game);
    expect(outcome, 'saving to the cloud must report success').toMatch(/saved to the cloud|updated in the cloud/i);

    // After a manual cloud export the pane shows exactly the payload that was
    // uploaded, so this is the uploaded state rather than a re-capture of it.
    const uploaded = await decode(game, await exportedCode(game));
    expect(uploaded.saveName, 'the upload must be filed under the pioneer name typed into the field')
      .toBe(CLOUD_TEST_PIONEER);
    const uploadedStructural = structural(uploaded);
    const uploadedTotals = totals(uploaded);
    expect(uploadedStructural.techs.length).toBeGreaterThan(0);

    // A genuinely new session, as the test pioneer: the game loads that row from
    // the cloud during boot, which is the returning-player path.
    await game.boot({ pioneer: CLOUD_TEST_PIONEER });
    expect(game.pioneer).not.toBe(originalPioneer);

    await openSavingPane(game);
    const restored = await decode(game, await exportedCode(game));

    expect(structural(restored)).toEqual(uploadedStructural);
    const restoredTotals = totals(restored);
    for (const key of Object.keys(uploadedTotals)) {
      expect(restoredTotals[key], `${key} must survive the cloud round trip`)
        .toBeGreaterThanOrEqual(uploadedTotals[key]);
    }

    expect(game.significantErrors()).toEqual([]);
  });

  test('saving again under the same pioneer name replaces the row rather than adding another', async ({ game }) => {
    await game.boot();

    // A different currency symbol from the previous spec, so the state written
    // now is distinguishable from the state written then.
    await playARun(game, { currency: '¥' });
    await openSavingPane(game);
    await setPioneerField(game, CLOUD_TEST_PIONEER);

    const outcome = await saveToCloud(game);
    // The row already exists, so this must take the UPDATE branch. The two
    // branches raise different messages, which is what makes them separable
    // from outside the database.
    expect(outcome, 'a second save to an existing name must update, not insert')
      .toMatch(/updated in the cloud/i);

    const uploaded = await decode(game, await exportedCode(game));
    expect(uploaded.currencySymbol).toBe('¥');

    // Load it back: a duplicate row would leave the loader picking one of two,
    // and `.single()` would error outright. Getting the new state back proves
    // exactly one row exists and that it holds the newer save.
    await game.boot({ pioneer: CLOUD_TEST_PIONEER });
    await openSavingPane(game);
    const restored = await decode(game, await exportedCode(game));

    expect(restored.currencySymbol, 'the row must hold the most recent save').toBe('¥');
    expect(structural(restored)).toEqual(structural(uploaded));

    expect(game.significantErrors()).toEqual([]);
  });

  test('a blank pioneer name is refused instead of writing a nameless row', async ({ game }) => {
    await game.boot();
    await playARun(game);
    await openSavingPane(game);

    await setPioneerField(game, '   ');
    const outcome = await saveToCloud(game);

    expect(outcome, 'a blank pioneer name must be refused with a clear reason')
      .toMatch(/pioneer name is missing/i);
  });

  test('loading a pioneer name that has no cloud save says so rather than failing silently', async ({ game }) => {
    // A name that has never been saved: boot finds nothing, which is also why
    // the onboarding prompt is offered.
    await game.boot();
    await openSavingPane(game);

    await clearNotifications(game);
    await game.page.click(LOAD_FROM_CLOUD_BUTTON);

    const outcome = await waitForNotification(game, /no saved game data found/i);
    expect(outcome, 'loading an unknown pioneer must tell the player there is nothing there')
      .toBeTruthy();
  });

  test('autosave uploads the run on its own schedule', async ({ game }) => {
    // Booted as the test pioneer so the autosave lands on this suite's own row
    // rather than creating one named after a throwaway boot pioneer.
    await game.boot({ pioneer: CLOUD_TEST_PIONEER });
    await openSavingPane(game);

    // The dropdown's shortest option is two minutes, which is too long to sit
    // through; the variable debugger is the game's own way to reach the value.
    await game.setDebugVariable('autoSaveFrequency', 6000);
    await game.closeVariableDebugger();
    expect(Number(await game.withMods((m) => m.cg.getAutoSaveFrequency()))).toBe(6000);

    // The toggle's own handler calls initializeAutoSave(), so switching it off
    // and back on is how a player reschedules the timer — no direct call needed.
    await game.page.locator('label[for="autoSaveToggle"]').click();
    await game.page.waitForTimeout(500);
    expect(await game.withMods((m) => m.cg.getAutoSaveToggle())).toBe(false);

    await game.page.locator('label[for="autoSaveToggle"]').click();
    await game.page.waitForTimeout(500);
    expect(await game.withMods((m) => m.cg.getAutoSaveToggle())).toBe(true);

    await clearNotifications(game);
    const uploaded = await waitForNotification(game, /updated in the cloud|saved to the cloud/i, { timeout: 45000 });
    expect(uploaded, 'autosave must reach the cloud without the player pressing anything')
      .toBeTruthy();

    expect(game.significantErrors()).toEqual([]);
  });

  test('a network failure while saving is reported, and the run survives it', async ({ game }) => {
    await game.boot();
    await playARun(game, { currency: '£' });
    await openSavingPane(game);

    const before = runOnly(await decode(game, await exportedCode(game)));

    // Cut the connection to Supabase only — the CDN the client itself came from
    // is a different host and stays up, so this is a failed request rather than
    // a broken page. Registered after boot so the client loaded normally.
    await game.page.route('**://*.supabase.co/**', (route) => route.abort());

    await setPioneerField(game, CLOUD_TEST_PIONEER);
    const outcome = await saveToCloud(game);

    expect(outcome, 'a failed upload must be reported, not swallowed')
      .toMatch(/error saving game to cloud/i);
    expect(outcome, 'a failed upload must not claim success')
      .not.toMatch(/saved to the cloud!|updated in the cloud/i);

    // The important half: losing the network must not cost the player the run
    // they were trying to protect. The save still exists locally, unchanged.
    await game.page.unroute('**://*.supabase.co/**');
    const after = await decode(game, await exportedCode(game));
    expect(runOnly(after), 'a failed cloud save must leave the local run intact').toEqual(before);

    // The one thing that does change, and should: the player typed a pioneer
    // name and that rename stands, so a retry goes to the slot they chose rather
    // than silently reverting to the name they were playing under.
    expect(after.saveName, 'the typed pioneer name must survive a failed upload')
      .toBe(CLOUD_TEST_PIONEER);

    const code = await exportedCode(game);
    expect(code.length, 'the export box must still hold a usable save').toBeGreaterThan(50);
  });

  test('the uploaded row carries the platform, host and feedback columns', async ({ game }) => {
    await game.boot();
    await playARun(game, { currency: '$' });
    await openSavingPane(game);

    // Read the write on its way past rather than reading the table back: it needs
    // no database credentials, and it asserts what the game actually sends, which
    // is the thing that could be wrong.
    const writes = [];
    await game.page.route('**/rest/v1/cosmicforge_saves*', async (route) => {
      const request = route.request();
      if (['POST', 'PATCH'].includes(request.method())) {
        try {
          const body = JSON.parse(request.postData() || 'null');
          // POST sends an array of rows, PATCH sends the changed columns.
          writes.push(Array.isArray(body) ? body[0] : body);
        } catch { /* a body shape this spec does not care about */ }
      }
      await route.continue();
    });

    const expected = await game.withMods((m) => ({
      region: m.cg.getUserPlatform(),
      hostSource: m.cg.getHostSource(),
      feedback: m.cg.getFeedbackGiven(),
      userAgent: navigator.userAgent.toLowerCase(),
      hostname: window.location.hostname
    }));

    await setPioneerField(game, CLOUD_TEST_PIONEER);
    const outcome = await saveToCloud(game);
    expect(outcome).toMatch(/saved to the cloud|updated in the cloud/i);

    expect(writes.length, 'the save must have produced a write').toBeGreaterThan(0);
    const row = writes[writes.length - 1];

    expect(row.data, 'the payload must carry the compressed save').toBeTruthy();
    expect(typeof row.data).toBe('string');
    expect(row.created_at, 'the row must be stamped').toBeTruthy();
    expect(Number.isNaN(Date.parse(row.created_at))).toBe(false);

    // These three are the analytics columns. They are written on every save and
    // never read back by the game, so nothing else would ever notice them going
    // null or undefined.
    //
    // `region` is a three-part tuple, not a string: [platform, userAgent, data].
    // `platform` is only ever 'github' or 'itch', decided from the hostname, so
    // 'unknown' is the correct answer anywhere else — including this test server.
    // What must hold everywhere is the shape, and that the user agent is really
    // captured, since that is the part the column exists to record.
    expect(row.region, 'region must be sent exactly as the game detected it').toEqual(expected.region);
    expect(Array.isArray(row.region)).toBe(true);
    expect(row.region).toHaveLength(3);
    expect(['github', 'itch', 'unknown', 'electron']).toContain(row.region[0]);
    expect(row.region[1], 'the user agent must be recorded, not left as a placeholder')
      .toBe(expected.userAgent);
    expect(row.region[1].length).toBeGreaterThan(20);

    expect(row.hostSource, 'hostSource must be the host the game was served from')
      .toBe(expected.hostSource);
    expect(row.hostSource).toBe(expected.hostname);

    expect(row.feedback, 'feedback must reflect whether feedback was given').toEqual(expected.feedback);
    expect('feedback_content' in row, 'feedback_content must be sent even when empty').toBe(true);

    expect(game.significantErrors()).toEqual([]);
  });

  test('a hard reset archives the cloud save and frees the pioneer name', async ({ game }) => {
    await game.boot({ pioneer: CLOUD_TEST_PIONEER });
    await openSavingPane(game);

    await clearNotifications(game);
    await game.page.click(HARD_RESET_BUTTON);

    // The reset is destructive, so it goes through the real confirmation modal.
    const confirm = game.page.locator('#modalConfirm');
    await confirm.waitFor({ state: 'visible', timeout: 15000 });
    expect((await confirm.textContent())?.toUpperCase()).toContain('RESET ALL PROGRESS');
    await confirm.click();

    const deleted = await waitForNotification(game, /can be re-used|deleted/i);
    expect(deleted, 'the player must be told the cloud save was cleared').toBeTruthy();

    // The reset leaves a permanent overlay and tells the player to refresh, so a
    // reload is the next thing that really happens. The row still exists but its
    // data is null, and the game has a distinct message for exactly that.
    await game.boot({ pioneer: CLOUD_TEST_PIONEER });
    await openSavingPane(game);

    await clearNotifications(game);
    await game.page.click(LOAD_FROM_CLOUD_BUTTON);
    const reused = await waitForNotification(game, /being reused/i);
    expect(reused, 'a cleared row must report the name as reusable, not as an error')
      .toBeTruthy();

    // The new run must genuinely be new — the archived save must not come back.
    const afterReset = structural(await decode(game, await exportedCode(game)));
    expect(afterReset.techs.length, 'a reset pioneer must start over').toBe(0);

    // Leave the row holding a save again, so the suite's own fixture is in the
    // same state next run as it was this run.
    await playARun(game, { currency: '$' });
    await openSavingPane(game);
    await setPioneerField(game, CLOUD_TEST_PIONEER);
    const restored = await saveToCloud(game);
    expect(restored, 'the test row must be left holding a save')
      .toMatch(/saved to the cloud|updated in the cloud/i);
  });
});
