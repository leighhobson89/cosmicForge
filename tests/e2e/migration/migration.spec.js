/**
 * Area: Migration — replay any historical save version against today's build
 * Plan: tests/docs/areas/migration.md
 *
 * The question this area answers is the one that matters on release day: **if a
 * player last opened the game at version X, do they still have a game today, and
 * can they carry on playing it?**
 *
 * It is asked one version at a time, and the version is chosen from the command
 * line:
 *
 *     node tests/run-e2e.mjs migration 0.97      one version
 *     node tests/run-e2e.mjs migration 0.93 0.99 several
 *     node tests/run-e2e.mjs migration           every rung in the ladder
 *
 * ## How a save from an old version is obtained
 *
 * Not from a fixture file. A checked-in 0.97 save would be frozen the day it was
 * written and would slowly stop resembling anything a real save looks like. This
 * spec instead **plays a run in the current build**, exports the save the game
 * itself produces through the real Saving pane, and then *ages* it: the catalogue
 * in `version-ladder.mjs` holds, for every rung in `patches.js`, the inverse of
 * what that rung adds, and ageing to 0.97 means applying the inverse of every
 * rung above 0.97, newest first. What comes out has today's structure minus
 * exactly the fields a 0.97 build had never heard of — which is what the ladder
 * exists to put back.
 *
 * The aged code then goes in through the real Import button, so the ladder runs
 * where it really runs: inside `restoreGameStatus` on the way into a live game.
 *
 * ## What each version's test proves
 *
 * 1. Every versioned section of the save arrives at the current version.
 * 2. Every rung above the target actually did its work — asserted from the
 *    catalogue's `check`, not by trusting the version number the loop assigns.
 * 3. The run survived: name, techs, unlocked resources, asteroids, star system.
 * 4. The migration is idempotent — loading the migrated save again changes it no
 *    further.
 * 5. **The game keeps playing.** Tabs render, a real purchase button still buys
 *    and still charges, the timers still advance, and the save still round-trips.
 *
 * ## When a new version is added
 *
 * Add the rung to `patches.js`, bump `GAME_VERSION_FOR_SAVES` and the template
 * `version:` literals in `resourceDataObject.js`, and add the matching entry to
 * `version-ladder.mjs`. The first test below parses the real source and fails by
 * name if the catalogue has fallen behind, so this cannot be forgotten quietly.
 *
 * Nothing here writes to the game source. The save is aged in memory and pushed
 * through the game's own import box.
 */
import { test, expect } from '../_harness/game-fixture.mjs';
import {
    LADDER,
    VERSIONED_SECTIONS,
    ageSaveTo,
    readLadderVersionsFromPatches,
    readTemplateVersions,
    readVersionConstants,
    resolveTargetVersions,
    rungsAbove
} from './version-ladder.mjs';

const { current: CURRENT_VERSION, minimum: MINIMUM_VERSION } = readVersionConstants();

/** Versions asked for on the command line by tests/run-e2e.mjs, or the whole ladder. */
const TARGET_VERSIONS = resolveTargetVersions(
    (process.env.E2E_MIGRATION_VERSIONS || '').split(',').map((s) => s.trim()).filter(Boolean)
);

const SAVING_PANE_TOKEN = 'tab9.option2';
const VISUAL_PANE_TOKEN = 'tab9.option1';
const IMPORT_CODE_BUTTON = '#importSaveRow button.save-load-button';

// ------------------------------------------------------------------ save plumbing

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

/** Leave the pane and come back, so the game captures a save of the state as it is now. */
async function recapture(game) {
    await openPaneByToken(game, VISUAL_PANE_TOKEN);
    await game.page.waitForTimeout(400);
    await openSavingPane(game);
    return exportedCode(game);
}

function exportedCode(game) {
    return game.page.evaluate(() => document.getElementById('exportSaveArea')?.value ?? '');
}

/** The compression is the page's, so both directions go through the page. */
function decode(game, code) {
    return game.page.evaluate((c) => {
        const json = LZString.decompressFromEncodedURIComponent(c);
        return json ? JSON.parse(json) : null;
    }, code);
}

function encode(game, state) {
    return game.page.evaluate((s) => LZString.compressToEncodedURIComponent(JSON.stringify(s)), state);
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

/** Push a save code in through the real Import button and wait for the game to confirm it. */
async function importAndConfirm(game, code, label) {
    await clearNotifications(game);
    await importCode(game, code);
    const loaded = await waitForNotification(game, /loaded successfully/i);
    expect(loaded, `${label} must load, not be rejected`).toBeTruthy();
    await game.page.waitForTimeout(500);
}

// ------------------------------------------------------------------ assertions

/** Fields that prove a migration carried a run forward rather than quietly resetting it. */
function structural(state) {
    return {
        saveName: state.saveName,
        techs: [...(state.techUnlockedArray ?? [])].sort(),
        unlockedResources: [...(state.unlockedResourcesArray ?? [])].sort(),
        unlockedCompounds: [...(state.unlockedCompoundsArray ?? [])].sort(),
        asteroids: (state.asteroidArray ?? []).length,
        currentStarSystem: state.currentStarSystem
    };
}

/**
 * Whatever of a run is *missing* from a later snapshot.
 *
 * Used after playing on, where exact equality would be the wrong test: staging a
 * purchase stocks glass, steel, carbon, iron and silicon, and the frame loop is
 * entitled to reveal a material it now sees the player holding. An unlock list
 * that grew has lost nothing. An unlock list that shrank has.
 */
function whatTheRunLost(after, before) {
    const missing = {};
    for (const [key, value] of Object.entries(before)) {
        if (Array.isArray(value)) {
            const gone = value.filter((entry) => !(after[key] ?? []).includes(entry));
            if (gone.length) missing[key] = gone;
        } else if (after[key] !== value) {
            missing[key] = { was: value, now: after[key] };
        }
    }
    return missing;
}

/** The version each versioned section of a save is currently claiming. */
function sectionVersions(state) {
    const out = {};
    for (const section of VERSIONED_SECTIONS) {
        const value = state?.[section]?.version;
        if (typeof value === 'number') out[section] = value;
    }
    return out;
}

/** Run every catalogue check for the rungs a save at `from` had to climb. */
function assertRungsDidTheirWork(migrated, original, from) {
    const rungs = rungsAbove(from);
    expect(rungs.length, `a save at ${from} should have rungs left to climb`).toBeGreaterThan(0);

    for (const rung of rungs) {
        for (const { what, actual, expected, tolerance } of rung.check(migrated, original)) {
            const label = `rung ${rung.version}: ${what}`;
            if (typeof tolerance === 'number' && typeof actual === 'number' && typeof expected === 'number') {
                expect(Math.abs(actual - expected), `${label} (got ${actual}, wanted ${expected})`)
                    .toBeLessThanOrEqual(Math.max(Math.abs(expected), 1) * tolerance);
            } else {
                expect(actual, label).toEqual(expected);
            }
        }
    }
}

// ------------------------------------------------------------------ playing

/** A run with enough in it that a migration losing something would be visible. */
async function playARun(game) {
    await game.openDebugMenu();
    await game.debugClick('give1BButton');
    await game.debugClick('grantAllTechsButton');
    await game.debugClick('add10AsteroidsButton');
    await game.debugClick('unlockAllTabsButton');
    await game.page.waitForTimeout(800);
}

/**
 * Carry on playing after the migration, through the game's own controls.
 *
 * A migrated save that loads but cannot be played is not a migration that
 * worked, and every check below is deliberately something a data-level
 * assertion on the save object would miss: whether the panes still draw,
 * whether a purchase button still reaches its handler, whether the frame loop
 * is still running, and whether the game can write a save again afterwards.
 */
async function keepPlaying(game) {
    // 1. The panes still draw. Tab 9 is where we came from, so start elsewhere.
    //    Each tab owns a `#tabNContainerGroup`; the check is that clicking the
    //    tab puts its group on screen with content in it, which is what a pane
    //    that failed to draw against migrated data would not do. The `selected`
    //    highlight is deliberately not asserted — `highlightActiveTab` matches
    //    on the tab's visible label, so that would be testing tab labelling.
    const tabsRendered = [];
    for (const index of [1, 2, 3, 4]) {
        await game.openTab(index);
        tabsRendered.push(await game.page.evaluate((i) => {
            const group = document.getElementById(`tab${i}ContainerGroup`);
            return {
                tab: i,
                onScreen: !!group && group.offsetParent !== null,
                hasContent: (group?.textContent || '').trim().length > 0
            };
        }, index));
    }
    expect(tabsRendered, 'every core tab must still render after a migration')
        .toEqual([1, 2, 3, 4].map((tab) => ({ tab, onScreen: true, hasContent: true })));

    // 2. A real purchase still works. Staging (cash, materials, the revealed
    //    flag) is seeded directly; the *purchase itself* goes through the
    //    button the player clicks, which is the wiring a migration can break.
    await game.withMods((m) => {
        m.rdo.setResourceDataObject(1e9, 'currency', ['cash']);
        for (const resource of ['carbon', 'glass', 'steel', 'iron', 'silicon']) {
            const category = ['glass', 'steel'].includes(resource) ? 'compounds' : 'resources';
            m.rdo.setResourceDataObject(1e9, category, [resource, 'storageCapacity']);
            m.rdo.setResourceDataObject(1e9, category, [resource, 'quantity']);
        }
        m.rdo.setResourceDataObject(true, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'revealed']);
    });

    await game.openTab(2);
    await game.page.evaluate(() => {
        const option = document.getElementById('powerPlant1Option');
        option?.closest('.row-side-menu')?.classList.remove('invisible');
        option?.classList.remove('invisible');
        option?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(700);

    const before = await game.withMods((m) => ({
        quantity: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']),
        cash: m.rdo.getResourceDataObject('currency', ['cash'])
    }));

    // Dispatched rather than clicked: these controls sit under other elements in
    // the panel, so a real click at their coordinates lands on the coverer.
    const clicked = await game.page.evaluate(() => {
        const button = [...document.querySelectorAll('button.building-purchase-button')]
            .find((b) => b.offsetParent !== null);
        if (!button) return false;
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        return true;
    });
    expect(clicked, 'a purchase button should be on screen for the open plant pane').toBe(true);
    await game.page.waitForTimeout(700);

    const after = await game.withMods((m) => ({
        quantity: m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']),
        cash: m.rdo.getResourceDataObject('currency', ['cash'])
    }));

    expect(after.quantity, 'a migrated save must still be able to buy a power plant').toBe(before.quantity + 1);
    expect(after.cash, 'the purchase must still be paid for').toBeLessThan(before.cash);

    // 3. The frame loop is still turning. A migration that leaves a timer in a
    //    bad state shows up here rather than in any field read.
    const advanced = await game.advanceTimers(5000);
    expect(advanced.advanced, 'the delta timer system must still be reachable after a migration').toBe(true);

    // 4. And the game can write a save again — a migrated run that cannot be
    //    saved is a run the player loses the moment they close the tab.
    const rewritten = await recapture(game);
    expect(rewritten.length, 'the game must still be able to export a save').toBeGreaterThan(50);
    return rewritten;
}

// ------------------------------------------------------------------ the catalogue

test.describe('Migration — the ladder catalogue tracks the source', () => {
    test('every rung in patches.js has an entry in version-ladder.mjs, and vice versa', () => {
        const inSource = readLadderVersionsFromPatches();
        const inCatalogue = LADDER.map((rung) => rung.version);

        const missing = inSource.filter((v) => !inCatalogue.includes(v));
        const stale = inCatalogue.filter((v) => !inSource.includes(v));

        expect(
            missing,
            'patches.js has rungs this area does not know how to age a save back through. ' +
            'Add an entry for each to tests/e2e/migration/version-ladder.mjs, with a `downgrade` ' +
            'that strips what the rung adds and a `check` that proves it ran.'
        ).toEqual([]);

        expect(
            stale,
            'version-ladder.mjs describes rungs that are no longer in patches.js. ' +
            'Remove them, or the suite is testing a ladder the game does not have.'
        ).toEqual([]);

        expect(inCatalogue, 'the catalogue must be in ladder order').toEqual(inSource);
    });

    test('the top rung is the version the game claims to be', () => {
        const top = Math.max(...LADDER.map((rung) => rung.version));
        expect(
            top,
            'GAME_VERSION_FOR_SAVES and the last rung in patches.js must agree, or a save ' +
            'that climbs the whole ladder still comes out below current and is re-migrated forever.'
        ).toBe(CURRENT_VERSION);
    });

    test('every data-object template carries the current version', () => {
        // These literals are what a *new* save is stamped with. One left behind
        // at a bump means every freshly written save is born stale and climbs the
        // ladder on every single load — invisible to any test that only ages old
        // saves, and a real cost to every player.
        const behind = readTemplateVersions().filter((t) => t.version !== CURRENT_VERSION);
        expect(
            behind,
            `resourceDataObject.js templates must all be stamped ${CURRENT_VERSION}`
        ).toEqual([]);
    });

    test('the versions this run was asked for are inside the supported range', () => {
        const outOfRange = TARGET_VERSIONS.filter((v) => v < MINIMUM_VERSION || v >= CURRENT_VERSION);
        expect(
            outOfRange,
            `a migration target must be at least ${MINIMUM_VERSION} (the oldest save the game accepts) ` +
            `and below ${CURRENT_VERSION} (there is nothing to migrate at or above current). ` +
            `Run: node tests/run-e2e.mjs migration <version>`
        ).toEqual([]);
    });
});

// ------------------------------------------------------------------ per version

test.describe('Migration — a save from an older version climbs to current and plays on', () => {
    test.setTimeout(300000);

    test.beforeEach(async ({ game }) => {
        await game.boot();
        await playARun(game);
        await openSavingPane(game);
    });

    for (const from of TARGET_VERSIONS) {
        const climbing = rungsAbove(from).map((r) => r.version);

        test(`a ${from} save migrates to ${CURRENT_VERSION} and the game keeps playing`, async ({ game }) => {
            test.skip(
                from < MINIMUM_VERSION || from >= CURRENT_VERSION,
                `${from} is outside the migratable range ${MINIMUM_VERSION}..${CURRENT_VERSION}`
            );

            // --- age a real save down to the target version -------------------
            const code = await exportedCode(game);
            const original = await decode(game, code);
            expect(original, 'the Saving pane must produce a decodable save').toBeTruthy();

            const aged = structuredClone(original);
            const { undone } = ageSaveTo(aged, from);
            // Newest rung first: 0.976's undo rebuilds the 0.969-era rip section
            // that 0.969's undo then strips. The other order would fight.
            expect(undone, `ageing to ${from} must undo every rung above it, newest first`)
                .toEqual(climbing.slice().reverse());
            expect(sectionVersions(aged), `every versioned section must be rewound to ${from}`)
                .toEqual(Object.fromEntries(Object.keys(sectionVersions(original)).map((k) => [k, from])));

            const before = structural(original);

            // --- put it in through the real Import button ---------------------
            await importAndConfirm(game, await encode(game, aged), `a ${from} save`);
            const migrated = await decode(game, await recapture(game));

            // --- 1. it arrived at the current version -------------------------
            const arrived = sectionVersions(migrated);
            expect(
                arrived,
                `every versioned section must climb to ${CURRENT_VERSION}`
            ).toEqual(Object.fromEntries(Object.keys(arrived).map((k) => [k, CURRENT_VERSION])));

            // --- 2. every rung it passed actually did its work ----------------
            // The while loop assigns the version whether or not the body did
            // anything, so the number alone proves nothing.
            assertRungsDidTheirWork(migrated, original, from);

            // --- 3. the run itself survived -----------------------------------
            // A migration that silently resets progress is worse than one that
            // throws, because it looks like it worked.
            expect(structural(migrated), `a ${from} save must keep its run`).toEqual(before);

            // --- 4. loading it again changes nothing --------------------------
            await importAndConfirm(game, await encode(game, migrated), 'an already-migrated save');
            const reloaded = await decode(game, await recapture(game));

            expect(sectionVersions(reloaded), 're-loading must not move the version').toEqual(arrived);
            expect(structural(reloaded), 're-loading must not disturb the run').toEqual(before);
            assertRungsDidTheirWork(reloaded, original, from);

            // --- 5. and the game is still playable ----------------------------
            const rewritten = await keepPlaying(game);
            const rewrittenState = await decode(game, rewritten);
            expect(
                sectionVersions(rewrittenState),
                'a save written after a migration must be stamped with the current version'
            ).toEqual(arrived);
            expect(
                whatTheRunLost(structural(rewrittenState), before),
                'playing on must not lose anything the migrated run had'
            ).toEqual({});

            expect(game.significantErrors()).toEqual([]);
        });
    }
});
