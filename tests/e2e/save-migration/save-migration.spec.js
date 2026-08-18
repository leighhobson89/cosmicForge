/**
 * Area: Save Migration — the patches.js version ladder, driven through Import
 * Plan: tests/docs/areas/save-migration.md
 *
 * `migrateResourceData` is the code that decides whether a player who last
 * played six months ago still has a game tomorrow. It has never had a test.
 *
 * ## How these specs reach it
 *
 * Not by calling it. Every spec here plays a run, takes the save the game itself
 * produces, **ages it** — rewrites its `version` field downwards and undoes the
 * fields a historical rung is supposed to add — pastes it into the real import
 * box and presses the real Import button. The ladder then runs where it really
 * runs: inside `restoreGameStatus` -> `restoreResourceDataObject`, on the way
 * into a live game. What is asserted afterwards is read back out of the save the
 * game re-captures on the next visit to the pane.
 *
 * Ageing a real save rather than checking in a fixture is deliberate. A checked-in
 * 0.93 save would be frozen the day it was written and would stop resembling
 * anything the migration is asked to handle; a save the current game just made,
 * with its version rewound, always has today's shape.
 *
 * ## Adding a version, without touching the source
 *
 * The last group covers the case the ladder exists for: **a new rung is added and
 * the game's version is bumped**. That cannot be done from inside the page —
 * `GAME_VERSION_FOR_SAVES` is a `const` export — so the modified module has to be
 * what the browser receives.
 *
 * It is served by Playwright route interception. The spec intercepts the requests
 * for `constantsAndGlobalVars.js` and `patches.js`, rewrites the response bodies
 * in memory, and fulfils the request with the rewritten text. The game then boots
 * genuinely believing the current save version is 0.9995 and genuinely carrying an
 * extra rung in its ladder, and the import path exercises it for real.
 *
 * **The files on disk are never opened for writing.** There is nothing to restore
 * afterwards, so a crashed run, a timeout or a killed process cannot leave a
 * bumped version behind in the source. `beforeAll` snapshots both files and
 * `afterAll` asserts they are byte-identical, which turns that guarantee into an
 * assertion rather than a claim.
 */
import { test, expect } from '../_harness/game-fixture.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const CONSTANTS_FILE = path.join(ROOT, 'constantsAndGlobalVars.js');
const PATCHES_FILE = path.join(ROOT, 'patches.js');

const SAVING_PANE_TOKEN = 'tab9.option2';
const VISUAL_PANE_TOKEN = 'tab9.option1';
const IMPORT_CODE_BUTTON = '#importSaveRow button.save-load-button';

/** The version the intercepted build claims to be, and the rung that takes it there. */
const BUMPED_VERSION = 0.9995;
const LADDER_MARKER = 'rung-0.9995-e2e';

/**
 * The extra rung, inserted at the end of the ladder inside the `while` loop.
 * It writes a marker so the spec can tell the rung ran rather than inferring it
 * from the version number alone, which the loop would set either way.
 */
const NEW_RUNG = [
  '        if (saveData.version < ' + BUMPED_VERSION + ') {',
  "            if (objectType === 'resourceData') {",
  "                saveData.e2eLadderRungMarker = '" + LADDER_MARKER + "';",
  '            }',
  '            saveData.version = ' + BUMPED_VERSION + ';',
  '        }',
  ''
].join('\n');

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

/** Leave the pane and return, so the game captures a save of the state as it is now. */
async function recapture(game) {
  await openPaneByToken(game, VISUAL_PANE_TOKEN);
  await game.page.waitForTimeout(400);
  await openSavingPane(game);
  return game.page.evaluate(() => document.getElementById('exportSaveArea')?.value ?? '');
}

function exportedCode(game) {
  return game.page.evaluate(() => document.getElementById('exportSaveArea')?.value ?? '');
}

function decode(game, code) {
  return game.page.evaluate((c) => {
    const json = LZString.decompressFromEncodedURIComponent(c);
    return json ? JSON.parse(json) : null;
  }, code);
}

/**
 * Rewind a real save into an older one.
 *
 * `mutate` runs against the decoded state in page context and undoes whatever the
 * rung under test is supposed to redo; the result is recompressed into a code the
 * import box accepts, exactly as if it had come out of an old build.
 */
function ageSave(game, code, mutate, arg = null) {
  return game.page.evaluate(({ c, src, a }) => {
    const state = JSON.parse(LZString.decompressFromEncodedURIComponent(c));
    // eslint-disable-next-line no-new-func
    const fn = new Function(`return (${src})`)();
    fn(state, a);
    return LZString.compressToEncodedURIComponent(JSON.stringify(state));
  }, { c: code, src: mutate.toString(), a: arg });
}

async function importCode(game, code) {
  await game.page.evaluate((c) => {
    const area = document.getElementById('importSaveArea');
    if (area) area.value = c;
  }, code);
  await game.page.click(IMPORT_CODE_BUTTON);
}

async function clearNotifications(game) {
  await game.page.evaluate(() =>
    document.querySelectorAll('.notification-container').forEach((c) => c.replaceChildren()));
}

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

/** Import an aged code and wait for the game to confirm it loaded. */
async function importAged(game, code) {
  await clearNotifications(game);
  await importCode(game, code);
  const loaded = await waitForNotification(game, /loaded successfully/i);
  expect(loaded, 'an aged save must load, not be rejected').toBeTruthy();
  await game.page.waitForTimeout(500);
}

/** Structural fields, used to prove a migration preserved a run rather than resetting it. */
function structural(state) {
  return {
    saveName: state.saveName,
    techs: [...(state.techUnlockedArray ?? [])].sort(),
    unlockedResources: [...(state.unlockedResourcesArray ?? [])].sort(),
    asteroids: (state.asteroidArray ?? []).length,
    currentStarSystem: state.currentStarSystem
  };
}

/** A run with enough in it that a migration losing something would be visible. */
async function playARun(game) {
  await game.openDebugMenu();
  await game.debugClick('give1BButton');
  await game.debugClick('grantAllTechsButton');
  await game.debugClick('add10AsteroidsButton');
  await game.debugClick('unlockAllTabsButton');
  await game.page.waitForTimeout(800);
}

/** Every autobuyer display name the 0.979 rung is responsible for converting. */
const OLD_AUTOBUYER_NAMES = {
  resources: {
    hydrogen: ['Hydrogen Compressor', 'Advanced Hydrogen Compressor', 'Industrial Hydrogen Compressor', 'Quantum Hydrogen Compressor'],
    helium: ['Helium Extractor', 'Advanced Helium Extractor', 'Industrial Helium Extractor', 'Quantum Helium Extractor'],
    carbon: ['Burner', 'Advanced Carbon Extractor', 'Industrial Carbon Extractor', 'Quantum Carbon Extractor'],
    neon: ['Neon Extractor', 'Advanced Neon Extractor', 'Industrial Neon Extractor', 'Quantum Neon Extractor'],
    oxygen: ['Oxygen Extractor', 'Advanced Oxygen Extractor', 'Industrial Oxygen Extractor', 'Quantum Oxygen Extractor'],
    silicon: ['Silicon Extractor', 'Advanced Silicon Extractor', 'Industrial Silicon Extractor', 'Quantum Silicon Extractor'],
    iron: ['Iron Extractor', 'Advanced Iron Extractor', 'Industrial Iron Extractor', 'Quantum Iron Extractor'],
    sodium: ['Sodium Extractor', 'Advanced Sodium Extractor', 'Industrial Sodium Extractor', 'Quantum Sodium Extractor'],
    solar: ['Solar AB1', 'Solar AB2', 'Solar AB3', 'Solar AB4']
  },
  compounds: {
    diesel: ['Backyard Extractor', 'Advanced Extractor', 'Industrial Extractor', 'Quantum Extractor'],
    glass: ['Workshop Glass Fabricator', 'Small Glass Factory', 'Medium Glass Factory', 'Large Glass Factory'],
    steel: ['Workshop Steel Fabricator', 'Small Steel Factory', 'Medium Steel Factory', 'Large Steel Factory'],
    concrete: ['Back Yard Concrete Mixer', 'Small Concrete Factory', 'Medium Concrete Factory', 'Large Concrete Factory'],
    water: ['Basic Water Pump', 'Small Water Treatment Plant', 'Medium Water Treatment Plant', 'Large Water Treatment Plant'],
    titanium: ['Basic Titanium Smelter', 'Small Titanium Factory', 'Medium Titanium Factory', 'Large Titanium Factory']
  }
};

test.describe('Save migration — the historical ladder', () => {
  test.setTimeout(240000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await playARun(game);
    await openSavingPane(game);
  });

  test('a 0.93-era save climbs every rung to the current version', async ({ game }) => {
    const current = Number(await game.withMods((m) => m.cg.getCurrentGameVersion()));
    expect(current).toBeGreaterThan(0.93);

    const code = await exportedCode(game);
    const before = structural(await decode(game, code));

    // Rewound to the oldest version the game still accepts, with the sections
    // later rungs are responsible for building stripped back out.
    const aged = await ageSave(game, code, (state) => {
      state.resourceData.version = 0.93;
      delete state.resourceData.cosmicRip;
      delete state.resourceData.flags;
      if (state.galacticCasino) {
        state.galacticCasino.version = 0.93;
        delete state.galacticCasino.casinoGamesWon;
        if (state.galacticCasino.casinoPoints) state.galacticCasino.casinoPoints.cpBaseCost = 1;
      }
    });

    await importAged(game, aged);

    const migrated = await decode(game, await recapture(game));

    expect(migrated.resourceData.version, 'the ladder must climb all the way to the current version')
      .toBe(current);

    // The 0.976 rung rebuilds cosmicRip wholesale, so a save that predates the
    // feature comes out with the whole structure the current game expects.
    const rip = migrated.resourceData.cosmicRip;
    expect(rip, 'a pre-rip save must come out with a cosmicRip section').toBeTruthy();
    expect(rip.scanResultsBySectorIndex).toHaveLength(9);
    expect(rip.ripLocationSectorIndex).toBe(-1);
    expect(rip.upgrades?.sensorBuoy?.price).toBe(500000);
    expect(rip.techs?.stabilizerArray?.price).toBe(10000);

    // The 0.978 rung gives the casino its games-won list.
    expect(Array.isArray(migrated.galacticCasino?.casinoGamesWon)).toBe(true);

    // And the run itself survived the climb. A migration that resets progress is
    // worse than one that throws, because it looks like it worked.
    expect(structural(migrated)).toEqual(before);

    expect(game.significantErrors()).toEqual([]);
  });

  test('a save at every historical version in the ladder migrates cleanly to current', async ({ game }) => {
    const current = Number(await game.withMods((m) => m.cg.getCurrentGameVersion()));
    const code = await exportedCode(game);
    const before = structural(await decode(game, code));

    // Every version the ladder branches on. Covering only the oldest would leave
    // a save that entered the ladder half way up — which is the common case for
    // a player who last played a couple of releases ago — entirely untested.
    const LADDER_VERSIONS = [0.93, 0.94, 0.95, 0.967, 0.969, 0.976, 0.978, 0.979];

    const results = [];
    for (const version of LADDER_VERSIONS) {
      const aged = await ageSave(game, code, (state, v) => {
        state.resourceData.version = v;
      }, version);

      await importAged(game, aged);
      const migrated = await decode(game, await recapture(game));

      results.push({
        from: version,
        to: migrated.resourceData.version,
        ripPresent: !!migrated.resourceData.cosmicRip,
        run: structural(migrated)
      });
    }

    // Every entry point must arrive at the current version, with the run intact
    // and a cosmicRip section present whichever rung rebuilt it.
    expect(results.map((r) => ({ from: r.from, to: r.to })))
      .toEqual(LADDER_VERSIONS.map((v) => ({ from: v, to: current })));
    expect(results.filter((r) => !r.ripPresent)).toEqual([]);
    for (const result of results) {
      expect(result.run, `a save entering at ${result.from} must keep its run`).toEqual(before);
    }

    expect(game.significantErrors()).toEqual([]);
  });

  test('every old autobuyer display name becomes a localization key', async ({ game }) => {
    const code = await exportedCode(game);

    // Put the pre-localization display names back, the way a returning player's
    // save still has them. This rung is what stands between such a player and a
    // game rendering raw strings that no language file knows about.
    const aged = await ageSave(game, code, (state) => {
      state.resourceData.version = 0.978;
      const map = {
        resources: {
          hydrogen: ['Hydrogen Compressor', 'Advanced Hydrogen Compressor', 'Industrial Hydrogen Compressor', 'Quantum Hydrogen Compressor'],
          helium: ['Helium Extractor', 'Advanced Helium Extractor', 'Industrial Helium Extractor', 'Quantum Helium Extractor'],
          carbon: ['Burner', 'Advanced Carbon Extractor', 'Industrial Carbon Extractor', 'Quantum Carbon Extractor'],
          neon: ['Neon Extractor', 'Advanced Neon Extractor', 'Industrial Neon Extractor', 'Quantum Neon Extractor'],
          oxygen: ['Oxygen Extractor', 'Advanced Oxygen Extractor', 'Industrial Oxygen Extractor', 'Quantum Oxygen Extractor'],
          silicon: ['Silicon Extractor', 'Advanced Silicon Extractor', 'Industrial Silicon Extractor', 'Quantum Silicon Extractor'],
          iron: ['Iron Extractor', 'Advanced Iron Extractor', 'Industrial Iron Extractor', 'Quantum Iron Extractor'],
          sodium: ['Sodium Extractor', 'Advanced Sodium Extractor', 'Industrial Sodium Extractor', 'Quantum Sodium Extractor'],
          solar: ['Solar AB1', 'Solar AB2', 'Solar AB3', 'Solar AB4']
        },
        compounds: {
          diesel: ['Backyard Extractor', 'Advanced Extractor', 'Industrial Extractor', 'Quantum Extractor'],
          glass: ['Workshop Glass Fabricator', 'Small Glass Factory', 'Medium Glass Factory', 'Large Glass Factory'],
          steel: ['Workshop Steel Fabricator', 'Small Steel Factory', 'Medium Steel Factory', 'Large Steel Factory'],
          concrete: ['Back Yard Concrete Mixer', 'Small Concrete Factory', 'Medium Concrete Factory', 'Large Concrete Factory'],
          water: ['Basic Water Pump', 'Small Water Treatment Plant', 'Medium Water Treatment Plant', 'Large Water Treatment Plant'],
          titanium: ['Basic Titanium Smelter', 'Small Titanium Factory', 'Medium Titanium Factory', 'Large Titanium Factory']
        }
      };
      for (const [category, entries] of Object.entries(map)) {
        for (const [key, names] of Object.entries(entries)) {
          const autoBuyer = state.resourceData?.[category]?.[key]?.upgrades?.autoBuyer;
          if (!autoBuyer) continue;
          names.forEach((name, index) => {
            if (autoBuyer[`tier${index + 1}`]) autoBuyer[`tier${index + 1}`].nameUpgrade = name;
          });
        }
      }
    });

    await importAged(game, aged);

    // Every converted name must be a key the localization system resolves. This
    // is the assertion that guards the localization release for old saves: a
    // name left un-migrated resolves to itself and fails here.
    const unresolved = await game.withMods((m, spec) => {
      const problems = [];
      for (const [category, entries] of Object.entries(spec)) {
        for (const key of Object.keys(entries)) {
          for (const tier of ['tier1', 'tier2', 'tier3', 'tier4']) {
            const nameKey = m.rdo.getResourceDataObject(category, [key, 'upgrades', 'autoBuyer', tier, 'nameUpgrade']);
            if (!nameKey) { problems.push(`${category}/${key}/${tier}: missing`); continue; }
            const localized = m.loc.localize(nameKey, m.cg.getLanguage());
            if (!localized || localized === nameKey) problems.push(`${category}/${key}/${tier}: ${nameKey}`);
          }
        }
      }
      return problems;
    }, OLD_AUTOBUYER_NAMES);

    expect(unresolved).toEqual([]);

    // And the pane a returning player would open renders the localized name
    // rather than the raw key the save arrived carrying.
    await game.page.evaluate(() => {
      const option = document.getElementById('hydrogenOption');
      option?.classList.remove('invisible');
      option?.closest('.row-side-menu')?.classList.remove('invisible');
      option?.closest('.collapsible')?.classList.remove('invisible');
      option?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(900);

    const rowText = await game.page.evaluate(() =>
      document.getElementById('hydrogenAutoBuyer1Row')?.textContent ?? '');
    expect(rowText).toContain('Hydrogen Compressor');
    expect(rowText, 'the raw key must never reach the screen').not.toContain('autoBuyerName');

    expect(game.significantErrors()).toEqual([]);
  });

  test('the black hole power rescale runs once, and the flag stops it running twice', async ({ game }) => {
    const code = await exportedCode(game);

    // 90 power under the old scale: 50 + round((90-50)/2) * 0.5 = 60.
    const aged = await ageSave(game, code, (state) => {
      state.resourceData.version = 0.93;
      state.resourceData.blackHole.power = 90;
      delete state.resourceData.flags;
    });

    await importAged(game, aged);
    const once = await decode(game, await recapture(game));

    expect(once.resourceData.blackHole.power).toBe(60);
    expect(once.resourceData.flags?.blackHoleNerfPatched,
      'the rescale must record that it has been applied').toBe(true);

    // Now hand the ladder a save that is old *and* already flagged — which is
    // what an interrupted or replayed upgrade looks like. The rescale must not
    // fire again and halve the player's black hole a second time.
    const replayed = await ageSave(game, await exportedCode(game), (state) => {
      state.resourceData.version = 0.93;
      state.resourceData.blackHole.power = 90;
      state.resourceData.flags = { blackHoleNerfPatched: true };
    });

    await importAged(game, replayed);
    const twice = await decode(game, await recapture(game));

    expect(twice.resourceData.blackHole.power,
      'an already-patched save must not be rescaled again').toBe(90);

    expect(game.significantErrors()).toEqual([]);
  });

  test('re-running the ladder over an already-migrated save changes nothing', async ({ game }) => {
    const code = await exportedCode(game);

    const aged = await ageSave(game, code, (state) => {
      state.resourceData.version = 0.93;
      delete state.resourceData.cosmicRip;
      delete state.resourceData.flags;
    });

    await importAged(game, aged);
    const first = await decode(game, await recapture(game));

    // Rewind only the version, leaving every migrated field in place, and send it
    // through again. Idempotence means the second pass is a no-op.
    const replayed = await ageSave(game, await exportedCode(game), (state) => {
      state.resourceData.version = 0.93;
    });

    await importAged(game, replayed);
    const second = await decode(game, await recapture(game));

    expect(second.resourceData.version).toBe(first.resourceData.version);
    expect(second.resourceData.cosmicRip).toEqual(first.resourceData.cosmicRip);
    expect(second.resourceData.blackHole).toEqual(first.resourceData.blackHole);
    expect(second.resourceData.flags).toEqual(first.resourceData.flags);
    expect(structural(second)).toEqual(structural(first));

    expect(game.significantErrors()).toEqual([]);
  });

  test('a save older than the minimum supported version is refused, and the run is untouched', async ({ game }) => {
    const code = await exportedCode(game);
    const before = structural(await decode(game, code));

    const tooOld = await ageSave(game, code, (state) => {
      state.resourceData.version = 0.5;
    });

    await clearNotifications(game);
    await importCode(game, tooOld);

    const refused = await waitForNotification(game, /error initializing game|invalid game data/i);
    expect(refused, 'a save below the minimum must be refused with a message').toBeTruthy();

    // Refusal has to mean refusal. Half-loading a save the game cannot migrate is
    // how a player loses a run to a version they never chose.
    expect(structural(await decode(game, await recapture(game)))).toEqual(before);
  });

  test('a save from a newer version than the game is left exactly as it is', async ({ game }) => {
    const code = await exportedCode(game);

    const fromTheFuture = await ageSave(game, code, (state) => {
      state.resourceData.version = 1.5;
      state.resourceData.aFieldThisBuildHasNeverHeardOf = 'from the future';
    });

    await importAged(game, fromTheFuture);
    const loaded = await decode(game, await recapture(game));

    // The `while` loop's condition is `version < currentVersion`, so a future
    // save must pass straight through — neither downgraded nor re-migrated.
    expect(loaded.resourceData.version).toBe(1.5);
    expect(loaded.resourceData.aFieldThisBuildHasNeverHeardOf).toBe('from the future');

    expect(game.significantErrors()).toEqual([]);
  });

  test('a save with whole sections missing migrates rather than throwing', async ({ game }) => {
    const code = await exportedCode(game);

    const damaged = await ageSave(game, code, (state) => {
      state.resourceData.version = 0.93;
      // Sections an old or partially-written save might genuinely be missing.
      delete state.resourceData.cosmicRip;
      delete state.resourceData.flags;
      delete state.galacticMarket;
      delete state.ascendencyBuffs;
      state.resourceData.blackHole.power = 'not a number';
    });

    await importAged(game, damaged);
    const migrated = await decode(game, await recapture(game));

    const current = Number(await game.withMods((m) => m.cg.getCurrentGameVersion()));
    expect(migrated.resourceData.version).toBe(current);
    expect(migrated.resourceData.cosmicRip).toBeTruthy();
    // A non-numeric power is not finite, so the rescale must decline to touch it
    // rather than turning it into NaN.
    expect(Number.isNaN(migrated.resourceData.blackHole.power)).toBe(false);

    expect(game.significantErrors()).toEqual([]);
  });
});

/**
 * The case the ladder exists for: someone adds a rung and bumps the version.
 *
 * The bumped build is served by rewriting the two module responses in flight. The
 * source files are only ever read here — see the guard specs at the end of the
 * group, which assert byte-for-byte that they were left alone.
 */
test.describe('Save migration — adding a new version to the ladder', () => {
  test.setTimeout(240000);

  /** Contents of the two source files as they were before anything ran. */
  let pristine = {};

  test.beforeAll(() => {
    pristine = {
      constants: fs.readFileSync(CONSTANTS_FILE, 'utf8'),
      patches: fs.readFileSync(PATCHES_FILE, 'utf8')
    };
  });

  test.afterAll(() => {
    // The whole point of interception over editing: there is nothing to restore,
    // and this proves it, whatever happened to the specs above.
    expect(fs.readFileSync(CONSTANTS_FILE, 'utf8'),
      'constantsAndGlobalVars.js must be untouched on disk').toBe(pristine.constants);
    expect(fs.readFileSync(PATCHES_FILE, 'utf8'),
      'patches.js must be untouched on disk').toBe(pristine.patches);
  });

  /**
   * Serve a build whose current save version is BUMPED_VERSION and whose ladder
   * carries one extra rung. Must be called before `boot()`, because that is what
   * navigates and therefore what fetches the modules.
   */
  async function serveBumpedLadder(game) {
    const rewritten = { constants: false, patches: false };

    await game.page.route('**/constantsAndGlobalVars.js', async (route) => {
      const response = await route.fetch();
      const body = await response.text();
      // Anchored on `export const` so the MINIMUM_ constant, which contains this
      // name as a substring, is not caught by the same expression.
      const patched = body.replace(
        /export const GAME_VERSION_FOR_SAVES\s*=\s*[\d.]+/,
        `export const GAME_VERSION_FOR_SAVES = ${BUMPED_VERSION}`
      );
      rewritten.constants = patched !== body;
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'text/javascript; charset=utf-8' },
        body: patched
      });
    });

    await game.page.route('**/patches.js', async (route) => {
      const response = await route.fetch();
      const body = await response.text();
      // The tail of migrateResourceData: the closing brace of the `while`, then
      // the return. Inserting before it puts the rung last inside the loop.
      const patched = body.replace(
        /\n(\s*)\}(\r?\n)(\s*)return saveData;/,
        `\n${NEW_RUNG}$1}$2$3return saveData;`
      );
      rewritten.patches = patched !== body;
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'text/javascript; charset=utf-8' },
        body: patched
      });
    });

    return rewritten;
  }

  test('a save made by the previous version is carried up by the new rung', async ({ game }) => {
    const rewritten = await serveBumpedLadder(game);

    await game.boot();

    // If either rewrite silently failed to match, the rest of this spec would
    // pass against the unmodified game and prove nothing.
    expect(rewritten.constants, 'the version bump must have been applied to the served module').toBe(true);
    expect(rewritten.patches, 'the new rung must have been inserted into the served ladder').toBe(true);

    const current = Number(await game.withMods((m) => m.cg.getCurrentGameVersion()));
    expect(current, 'the running game must be the bumped build').toBe(BUMPED_VERSION);

    await playARun(game);
    await openSavingPane(game);

    // The data object's own template still carries the previous version, so the
    // save this build writes is, by construction, a save from before the bump —
    // which is exactly the save the new rung has to handle.
    const code = await exportedCode(game);
    const saved = await decode(game, code);
    expect(saved.resourceData.version).toBeLessThan(BUMPED_VERSION);
    expect(saved.resourceData.e2eLadderRungMarker).toBeUndefined();
    const before = structural(saved);

    await importAged(game, code);
    const migrated = await decode(game, await recapture(game));

    expect(migrated.resourceData.version, 'the ladder must climb to the new version')
      .toBe(BUMPED_VERSION);
    expect(migrated.resourceData.e2eLadderRungMarker,
      'the new rung must actually have run, not just had its version assigned')
      .toBe(LADDER_MARKER);

    // A new rung must not cost the player anything that was already in the save.
    expect(structural(migrated)).toEqual(before);

    expect(game.significantErrors()).toEqual([]);
  });

  test('a save already at the new version is left alone by the new rung', async ({ game }) => {
    await serveBumpedLadder(game);
    await game.boot();
    await playARun(game);
    await openSavingPane(game);

    const code = await exportedCode(game);

    // Already at the bumped version, and carrying a marker value the rung would
    // overwrite if it ran. It must not run.
    const alreadyCurrent = await ageSave(game, code, (state) => {
      state.resourceData.version = 0.9995;
      state.resourceData.e2eLadderRungMarker = 'set-by-hand';
    });

    await importAged(game, alreadyCurrent);
    const loaded = await decode(game, await recapture(game));

    expect(loaded.resourceData.version).toBe(BUMPED_VERSION);
    expect(loaded.resourceData.e2eLadderRungMarker,
      'a save already at the current version must not be re-migrated').toBe('set-by-hand');

    expect(game.significantErrors()).toEqual([]);
  });

  test('the version bump never reached the files on disk', async ({ game }) => {
    // The interception is per-page, so an unrouted boot serves the real modules.
    await game.boot();
    const live = Number(await game.withMods((m) => m.cg.getCurrentGameVersion()));
    expect(live, 'an ordinary boot must still be the real build').not.toBe(BUMPED_VERSION);

    expect(fs.readFileSync(CONSTANTS_FILE, 'utf8')).toBe(pristine.constants);
    expect(fs.readFileSync(PATCHES_FILE, 'utf8')).toBe(pristine.patches);
  });
});
