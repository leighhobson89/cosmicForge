/**
 * The save-version ladder, as data.
 *
 * `patches.js` says how to climb *up* from an old save to the current one. This
 * file says the opposite: for each rung, how to push a modern save back *down*
 * through it, so that what comes out has the shape a build of that era actually
 * wrote. Age a save through every rung above 0.97 and you have a 0.97 save —
 * built out of today's data, so it never goes stale the way a checked-in fixture
 * would, but missing exactly the fields the 0.976, 0.978, 0.979, 0.98, 0.99 and
 * 0.991 rungs are there to put back.
 *
 * That inversion is the whole trick behind `migration.spec.js`. It means the
 * suite can be pointed at *any* version — `node tests/run-e2e.mjs migration 0.97`
 * — rather than only at the handful of fixtures somebody remembered to write.
 *
 * ## Adding a version
 *
 * When a rung is added to `patches.js` and `GAME_VERSION_FOR_SAVES` is bumped,
 * add an entry here too. `readLadderVersionsFromPatches()` below parses the real
 * source, and the spec fails if this catalogue and `patches.js` disagree — so
 * forgetting is loud rather than silent. See `tests/docs/areas/migration.md`.
 *
 * Each entry needs:
 *
 *   version     the number in `if (saveData.version < X)`
 *   objectTypes which `objectType` arguments the rung actually branches on
 *   summary     one line, for the failure message and the report
 *   downgrade   mutate a decoded save so it looks like it predates this rung
 *   check       given the migrated save (and the original it was aged from),
 *               return [{ what, actual, expected, tolerance? }] to assert
 *
 * `downgrade` and `check` both run in Node against a plain decoded object, so
 * they can be written normally — no page-context or serialisation constraints.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..', '..', '..');
export const PATCHES_FILE = path.join(ROOT, 'patches.js');
export const CONSTANTS_FILE = path.join(ROOT, 'constantsAndGlobalVars.js');
export const DATA_OBJECT_FILE = path.join(ROOT, 'resourceDataObject.js');

// --------------------------------------------------------------- source facts
//
// Everything below is read out of the shipped source rather than restated here,
// so this module cannot drift into describing a ladder the game no longer has.

/** The rung versions, in ladder order, as `patches.js` actually branches on them. */
export function readLadderVersionsFromPatches() {
    const source = fs.readFileSync(PATCHES_FILE, 'utf8');
    const versions = [...source.matchAll(/if\s*\(\s*saveData\.version\s*<\s*([\d.]+)\s*\)/g)]
        .map((m) => Number(m[1]));
    return [...new Set(versions)].sort((a, b) => a - b);
}

/** `GAME_VERSION_FOR_SAVES` and `MINIMUM_GAME_VERSION_FOR_SAVES` from the constants module. */
export function readVersionConstants() {
    const source = fs.readFileSync(CONSTANTS_FILE, 'utf8');
    const read = (name) => {
        const match = source.match(new RegExp(`export const ${name}\\s*=\\s*([\\d.]+)`));
        if (!match) throw new Error(`${name} not found in constantsAndGlobalVars.js`);
        return Number(match[1]);
    };
    return { current: read('GAME_VERSION_FOR_SAVES'), minimum: read('MINIMUM_GAME_VERSION_FOR_SAVES') };
}

/**
 * The `version:` literals on the data-object templates.
 *
 * These are what a *freshly written* save carries. If one is left behind when
 * the game version is bumped, every new save is born stale and is re-migrated on
 * every single load — which no ladder test on old saves would ever notice.
 */
export function readTemplateVersions() {
    const source = fs.readFileSync(DATA_OBJECT_FILE, 'utf8');
    const lines = source.split(/\r?\n/);
    const found = [];
    let owner = 'unknown';
    for (const line of lines) {
        const declaration = line.match(/^\s*(?:export\s+)?(?:let|const|var)\s+([A-Za-z0-9_]+)\s*=\s*\{/);
        if (declaration) owner = declaration[1];
        const version = line.match(/^\s*version:\s*([\d.]+)\s*,/);
        if (version) found.push({ owner, version: Number(version[1]) });
    }
    return found;
}

// ------------------------------------------------------------------- helpers

const RESOURCE_AUTOBUYER_NAMES = {
    solar: ['Solar AB1', 'Solar AB2', 'Solar AB3', 'Solar AB4'],
    hydrogen: ['Hydrogen Compressor', 'Advanced Hydrogen Compressor', 'Industrial Hydrogen Compressor', 'Quantum Hydrogen Compressor'],
    helium: ['Helium Extractor', 'Advanced Helium Extractor', 'Industrial Helium Extractor', 'Quantum Helium Extractor'],
    carbon: ['Burner', 'Advanced Carbon Extractor', 'Industrial Carbon Extractor', 'Quantum Carbon Extractor'],
    neon: ['Neon Extractor', 'Advanced Neon Extractor', 'Industrial Neon Extractor', 'Quantum Neon Extractor'],
    oxygen: ['Oxygen Extractor', 'Advanced Oxygen Extractor', 'Industrial Oxygen Extractor', 'Quantum Oxygen Extractor'],
    silicon: ['Silicon Extractor', 'Advanced Silicon Extractor', 'Industrial Silicon Extractor', 'Quantum Silicon Extractor'],
    iron: ['Iron Extractor', 'Advanced Iron Extractor', 'Industrial Iron Extractor', 'Quantum Iron Extractor'],
    sodium: ['Sodium Extractor', 'Advanced Sodium Extractor', 'Industrial Sodium Extractor', 'Quantum Sodium Extractor']
};

const COMPOUND_AUTOBUYER_NAMES = {
    diesel: ['Backyard Extractor', 'Advanced Extractor', 'Industrial Extractor', 'Quantum Extractor'],
    glass: ['Workshop Glass Fabricator', 'Small Glass Factory', 'Medium Glass Factory', 'Large Glass Factory'],
    steel: ['Workshop Steel Fabricator', 'Small Steel Factory', 'Medium Steel Factory', 'Large Steel Factory'],
    concrete: ['Back Yard Concrete Mixer', 'Small Concrete Factory', 'Medium Concrete Factory', 'Large Concrete Factory'],
    water: ['Basic Water Pump', 'Small Water Treatment Plant', 'Medium Water Treatment Plant', 'Large Water Treatment Plant'],
    titanium: ['Basic Titanium Smelter', 'Small Titanium Factory', 'Medium Titanium Factory', 'Large Titanium Factory']
};

/** The achievements the 0.978 rung backfills into an older achievements section. */
const ACHIEVEMENTS_ADDED_AT_0_978 = [
    'buyCasinoPoints', 'winAllCasinoGames', 'winWheelSpecialPrize', 'restoreNearSpaceScannerArray',
    'findCosmicRip', 'gain1MTelemetryData', 'closeCosmicRip', 'suffer5NegativeEvents',
    'enjoyEndlessSummer', 'completeOnboarding'
];

/** The compounds whose tier 3 and tier 4 prices the 0.991 rung swaps back. */
const TRANSPOSED_COMPOUND_TIERS = [
    { material: 'glass', oldTier3: 2500000, oldTier4: 1250000 },
    { material: 'concrete', oldTier3: 4200000, oldTier4: 1800000 },
    { material: 'water', oldTier3: 4200000, oldTier4: 1800000 },
    { material: 'titanium', oldTier3: 4800000, oldTier4: 1880000 }
];

const GAME_COST_MULTIPLIER = 1.13;

const tiers = (state, category, material) =>
    state?.resourceData?.[category]?.[material]?.upgrades?.autoBuyer ?? null;

const energyUpgrade = (state, key) =>
    state?.resourceData?.buildings?.energy?.upgrades?.[key] ?? null;

/** Multiply a numeric field in place, leaving zero and non-numbers alone. */
function scale(holder, key, ratio) {
    if (!holder || typeof holder !== 'object') return;
    const current = Number(holder[key]);
    if (Number.isFinite(current) && current > 0) holder[key] = current * ratio;
}

/** Every autoSell flag in the save, as `resources.neon` style paths. */
function autoSellFlags(state) {
    const out = [];
    for (const category of ['resources', 'compounds']) {
        const section = state?.resourceData?.[category];
        if (!section || typeof section !== 'object') continue;
        for (const key of Object.keys(section)) {
            const material = section[key];
            if (material && typeof material === 'object' && 'autoSell' in material) {
                out.push({ path: `${category}.${key}`, value: material.autoSell });
            }
        }
    }
    return out;
}

/** Every autobuyer display name in the save, as `resources.neon.tier2` style paths. */
function autobuyerNames(state) {
    const out = [];
    for (const [category, map] of [['resources', RESOURCE_AUTOBUYER_NAMES], ['compounds', COMPOUND_AUTOBUYER_NAMES]]) {
        for (const material of Object.keys(map)) {
            const autoBuyer = tiers(state, category, material);
            if (!autoBuyer) continue;
            for (const tier of ['tier1', 'tier2', 'tier3', 'tier4']) {
                if (autoBuyer[tier] && typeof autoBuyer[tier].nameUpgrade === 'string') {
                    out.push({ path: `${category}.${material}.${tier}`, name: autoBuyer[tier].nameUpgrade });
                }
            }
        }
    }
    return out;
}

// ------------------------------------------------------------------- the ladder

/**
 * One entry per rung in `patches.js`, in the same order.
 *
 * A `check` that returns `[]` is not laziness: some rungs leave nothing visible
 * once the climb finishes, because a later rung overwrites their work outright.
 * Those say so in `summary`, and the fact that the save still arrives at the
 * current version with the run intact is what the spec asserts for them.
 */
export const LADDER = [
    {
        version: 0.93,
        objectTypes: ['galacticCasinoData'],
        summary: 'Casino point base cost was rebased to 100,000.',
        downgrade(state) {
            const points = state?.galacticCasino?.casinoPoints;
            if (points) points.cpBaseCost = 1000;
        },
        check(migrated) {
            return [{
                what: 'casino cpBaseCost is rebased',
                actual: migrated?.galacticCasino?.casinoPoints?.cpBaseCost,
                expected: 100000
            }];
        }
    },

    {
        version: 0.94,
        objectTypes: ['*'],
        summary: 'Black hole power above 50 is rescaled to the nerfed curve, once, behind a flag.',
        downgrade(state) {
            // The flag is what stops the rescale running twice, so a save from
            // before the rung has neither the flag nor the nerfed value. 100 is
            // a pre-nerf power a real player could hold: 25 purchases above the
            // base, which the rung turns into 50 + 25 * 0.5 = 62.5.
            if (state?.resourceData) delete state.resourceData.flags;
            if (state?.resourceData?.blackHole) state.resourceData.blackHole.power = 100;
        },
        check(migrated) {
            return [
                {
                    what: 'black hole power is rescaled onto the nerfed curve',
                    actual: migrated?.resourceData?.blackHole?.power,
                    expected: 62.5
                },
                {
                    what: 'the rescale is flagged so it cannot run a second time',
                    actual: migrated?.resourceData?.flags?.blackHoleNerfPatched,
                    expected: true
                }
            ];
        }
    },

    {
        version: 0.95,
        objectTypes: ['resourceData'],
        summary: 'Power plant 3 and batteries 2/3 are repriced, scaled by how many the player owns.',
        downgrade(state) {
            // Prices are recomputed from the quantity, so any wrong number here
            // is enough to prove the rung ran — but zero would be indistinguishable
            // from an unset field, hence a visibly bogus positive value.
            for (const key of ['powerPlant3', 'battery2', 'battery3']) {
                const upgrade = energyUpgrade(state, key);
                if (!upgrade) continue;
                upgrade.price = 1;
                upgrade.resource1Price = [1, 'hydrogen', 'resources'];
                upgrade.resource2Price = [1, 'helium', 'resources'];
                upgrade.resource3Price = [1, 'sodium', 'resources'];
            }
        },
        check(migrated) {
            const at = (key) => energyUpgrade(migrated, key);
            const factor = (key) => Math.pow(GAME_COST_MULTIPLIER, at(key)?.quantity || 0);
            const results = [];
            if (at('powerPlant3')) {
                results.push({
                    what: 'powerPlant3 price is recomputed from its quantity',
                    actual: at('powerPlant3').price,
                    expected: Math.ceil(700 * factor('powerPlant3'))
                });
                results.push({
                    what: 'powerPlant3 third resource cost is cleared',
                    actual: at('powerPlant3').resource3Price?.[0],
                    expected: 0
                });
            }
            if (at('battery2')) {
                results.push({
                    what: 'battery2 price is recomputed from its quantity',
                    actual: at('battery2').price,
                    expected: Math.ceil(50000 * factor('battery2'))
                });
            }
            if (at('battery3')) {
                results.push({
                    what: 'battery3 price is recomputed from its quantity',
                    actual: at('battery3').price,
                    expected: Math.ceil(500000 * factor('battery3'))
                });
            }
            return results;
        }
    },

    {
        version: 0.967,
        objectTypes: ['resourceData', 'gameState'],
        summary: 'The legacy `spaceRip` section is renamed to `cosmicRip`, carrying its fields across.',
        downgrade(state) {
            const rip = state?.resourceData?.cosmicRip;
            if (!rip) return;
            // Put the section back under its old name, with the field name that
            // was also renamed at this rung. This is the shape the rung is
            // written to find.
            state.resourceData.spaceRip = {
                galacticPoints: rip.galacticPoints ?? 0,
                galacticTelescopeRestored: rip.nearSpaceScannerArrayRestored ?? false,
                ripLocationSectorIndex: rip.ripLocationSectorIndex ?? -1,
                ripFound: rip.ripFound ?? false,
                scanResultsBySectorIndex: Array.isArray(rip.scanResultsBySectorIndex)
                    ? [...rip.scanResultsBySectorIndex]
                    : Array(9).fill(false)
            };
            delete state.resourceData.cosmicRip;
        },
        check(migrated) {
            return [
                {
                    what: 'the legacy spaceRip section is gone',
                    actual: migrated?.resourceData?.spaceRip,
                    expected: undefined
                },
                {
                    what: 'a cosmicRip section exists in its place',
                    actual: typeof migrated?.resourceData?.cosmicRip,
                    expected: 'object'
                }
            ];
        }
    },

    {
        version: 0.969,
        objectTypes: ['resourceData'],
        summary: 'Rip stage, instability and the research/projects sections are seeded. Later replaced wholesale by 0.976, so nothing of it survives a full climb.',
        downgrade(state) {
            const rip = state?.resourceData?.cosmicRip;
            if (!rip) return;
            for (const key of ['stage', 'instability', 'containmentIntegrity', 'sealProgress', 'ripResearch', 'projects']) {
                delete rip[key];
            }
        },
        check() {
            // 0.976 overwrites cosmicRip in its entirety, so by the time a save
            // reaches the current version none of this rung's output is left to
            // look at. Asserting anything here would be asserting 0.976's work.
            return [];
        }
    },

    {
        version: 0.976,
        objectTypes: ['resourceData'],
        summary: 'The whole cosmicRip section is replaced with the current structure, including its upgrades and tech tree.',
        downgrade(state) {
            const rip = state?.resourceData?.cosmicRip;
            if (!rip) return;
            // Rebuild the 0.969-era shape: the pre-0.976 section had progress
            // fields but no upgrades and no tech tree at all.
            state.resourceData.cosmicRip = {
                galacticPoints: rip.galacticPoints ?? 0,
                nearSpaceScannerArrayRestored: rip.nearSpaceScannerArrayRestored ?? false,
                ripLocationSectorIndex: rip.ripLocationSectorIndex ?? -1,
                ripFound: rip.ripFound ?? false,
                scanResultsBySectorIndex: Array.isArray(rip.scanResultsBySectorIndex)
                    ? [...rip.scanResultsBySectorIndex]
                    : Array(9).fill(false),
                stage: 'discovery',
                instability: 100,
                containmentIntegrity: 0,
                sealProgress: 0,
                ripResearch: { points: 0, level: 0, unlocked: { stabilization: false, containment: false, sealing: false } },
                projects: {
                    stabilizerArrayLevel: 0,
                    containmentRingSegmentsBuilt: 0,
                    containmentRingSegmentsRequired: 8,
                    anchorPylonsBuilt: 0,
                    anchorPylonsRequired: 4,
                    sealDriverBuilt: false,
                    failsafeCapacitorsBuilt: 0,
                    failsafeCapacitorsRequired: 3,
                    sensorBuoyDeployed: false
                }
            };
        },
        check(migrated) {
            const rip = migrated?.resourceData?.cosmicRip;
            return [
                { what: 'the rip scan grid is nine sectors', actual: rip?.scanResultsBySectorIndex?.length, expected: 9 },
                { what: 'the rip location is unset', actual: rip?.ripLocationSectorIndex, expected: -1 },
                { what: 'the sensor buoy upgrade is priced', actual: rip?.upgrades?.sensorBuoy?.price, expected: 500000 },
                { what: 'the rip research orbiter upgrade is priced', actual: rip?.upgrades?.ripResearchOrbiter?.price, expected: 1000000 },
                { what: 'the rip tech tree is present', actual: rip?.techs?.stabilizerArray?.price, expected: 10000 },
                { what: 'the superseded stage field is gone', actual: rip?.stage, expected: undefined }
            ];
        }
    },

    {
        version: 0.978,
        objectTypes: ['galacticCasinoData', 'achievementsData'],
        summary: 'The casino gains its games-won list, and ten achievements are backfilled.',
        downgrade(state) {
            if (state?.galacticCasino) delete state.galacticCasino.casinoGamesWon;
            if (state?.achievementsData) {
                for (const key of ACHIEVEMENTS_ADDED_AT_0_978) delete state.achievementsData[key];
            }
        },
        check(migrated) {
            // Weaker than it looks, and deliberately kept anyway. Both restore
            // paths merge against this build's template, so a missing games-won
            // list or achievement would be refilled from the template even if
            // this rung never ran. What these two assert is therefore the
            // outcome the player cares about — a pre-0.978 save arrives with
            // both — rather than proof the rung specifically produced it.
            const achievements = migrated?.achievementsData ?? {};
            return [
                {
                    what: 'the casino has a games-won list',
                    actual: Array.isArray(migrated?.galacticCasino?.casinoGamesWon),
                    expected: true
                },
                {
                    what: 'every achievement added at 0.978 is present',
                    actual: ACHIEVEMENTS_ADDED_AT_0_978.filter((key) => !achievements[key]),
                    expected: []
                }
            ];
        }
    },

    {
        version: 0.979,
        objectTypes: ['resourceData'],
        summary: 'Autobuyer display names become localization keys, so no pane renders an untranslated string.',
        downgrade(state) {
            for (const [category, map] of [['resources', RESOURCE_AUTOBUYER_NAMES], ['compounds', COMPOUND_AUTOBUYER_NAMES]]) {
                for (const [material, names] of Object.entries(map)) {
                    const autoBuyer = tiers(state, category, material);
                    if (!autoBuyer) continue;
                    names.forEach((name, index) => {
                        const tier = autoBuyer[`tier${index + 1}`];
                        if (tier) tier.nameUpgrade = name;
                    });
                }
            }
        },
        check(migrated) {
            // A localization key, by this game's convention, starts `autoBuyerName`.
            // Anything still reading as prose is a name no language file knows.
            const leftAsProse = autobuyerNames(migrated)
                .filter((entry) => !entry.name.startsWith('autoBuyerName'))
                .map((entry) => `${entry.path} = "${entry.name}"`);
            return [{
                what: 'no autobuyer name is left as a raw display string',
                actual: leftAsProse,
                expected: []
            }];
        }
    },

    {
        version: 0.98,
        objectTypes: [],
        summary: 'A version bump with no data change — the rung exists only to move the number.',
        downgrade() {
            // Nothing to undo. The version field itself, set by the caller, is
            // the entire difference between a 0.979 save and a 0.98 one.
        },
        check() {
            return [];
        }
    },

    {
        version: 0.99,
        objectTypes: ['resourceData'],
        summary: 'Auto-sell is forced off on every resource and compound.',
        downgrade(state) {
            for (const category of ['resources', 'compounds']) {
                const section = state?.resourceData?.[category];
                if (!section || typeof section !== 'object') continue;
                for (const key of Object.keys(section)) {
                    const material = section[key];
                    if (material && typeof material === 'object' && 'autoSell' in material) {
                        material.autoSell = true;
                    }
                }
            }
        },
        check(migrated) {
            const stillOn = autoSellFlags(migrated).filter((f) => f.value !== false).map((f) => f.path);
            return [{
                what: 'auto-sell is off everywhere after migration',
                actual: stillOn,
                expected: []
            }];
        }
    },

    {
        version: 0.991,
        objectTypes: ['resourceData'],
        summary: 'Balance pass: neon and titanium sale values are rescaled, and four compounds have their transposed tier 3/4 prices swapped back.',
        downgrade(state) {
            // These fields are only ever *multiplied* at runtime, which is why the
            // rung rescales rather than overwrites — and why the inverse ratio is
            // an exact undo. That makes the check below a round trip: age the save
            // down, let the ladder carry it back up, and the numbers must land on
            // what they started as.
            scale(state?.resourceData?.resources?.neon, 'saleValue', 0.40 / 0.12);
            scale(state?.resourceData?.compounds?.titanium, 'saleValue', 6 / 12.5);
            for (const { material, oldTier3, oldTier4 } of TRANSPOSED_COMPOUND_TIERS) {
                const autoBuyer = tiers(state, 'compounds', material);
                if (!autoBuyer) continue;
                scale(autoBuyer.tier3, 'price', oldTier3 / oldTier4);
                scale(autoBuyer.tier4, 'price', oldTier4 / oldTier3);
            }
        },
        check(migrated, original) {
            // Floating point: two reciprocal multiplications do not land on the
            // exact same double, so compare relatively rather than by equality.
            const results = [
                {
                    what: 'neon sale value returns to its balanced figure',
                    actual: migrated?.resourceData?.resources?.neon?.saleValue,
                    expected: original?.resourceData?.resources?.neon?.saleValue,
                    tolerance: 1e-9
                },
                {
                    what: 'titanium sale value returns to its balanced figure',
                    actual: migrated?.resourceData?.compounds?.titanium?.saleValue,
                    expected: original?.resourceData?.compounds?.titanium?.saleValue,
                    tolerance: 1e-9
                }
            ];
            for (const { material } of TRANSPOSED_COMPOUND_TIERS) {
                for (const tier of ['tier3', 'tier4']) {
                    results.push({
                        what: `${material} ${tier} price returns to its balanced figure`,
                        actual: tiers(migrated, 'compounds', material)?.[tier]?.price,
                        expected: tiers(original, 'compounds', material)?.[tier]?.price,
                        tolerance: 1e-9
                    });
                }
            }
            return results;
        }
    }
];

// ------------------------------------------------------------------ ageing API

/** Save sections that carry their own `version` field and so must be rewound together. */
export const VERSIONED_SECTIONS = [
    'resourceData', 'starSystems', 'galacticMarket', 'galacticCasino', 'ascendencyBuffs'
];

/** The rungs a save at `version` still has to climb, oldest first. */
export function rungsAbove(version) {
    return LADDER.filter((rung) => rung.version > version);
}

/**
 * Rewind a decoded save to `targetVersion`, in place.
 *
 * Downgrades run newest rung first, which is the only order that makes sense:
 * 0.976's undo reconstructs the 0.969-era rip section, and 0.969's undo then
 * strips that section's fields. Run the other way round they would fight.
 *
 * `undone` comes back in the order the downgrades were actually applied — newest
 * first — so a caller can assert that ordering rather than take it on trust.
 */
export function ageSaveTo(state, targetVersion) {
    const undone = [];
    for (const rung of [...rungsAbove(targetVersion)].reverse()) {
        rung.downgrade(state);
        undone.push(rung.version);
    }
    for (const section of VERSIONED_SECTIONS) {
        if (state?.[section] && typeof state[section] === 'object') {
            state[section].version = targetVersion;
        }
    }
    return { targetVersion, undone };
}

/**
 * Which versions a run should cover.
 *
 * With no versions asked for, every rung *below* the current one is exercised —
 * each is a version some build actually stamped on saves, and a save entering the
 * ladder half way up is the common case for a player who last played a release or
 * two ago, exactly as likely to break as the oldest one. The top rung is left out
 * because a save already at the current version has nothing to climb.
 */
export function resolveTargetVersions(requested) {
    const list = (requested ?? []).map(Number).filter((v) => Number.isFinite(v));
    if (list.length) return [...new Set(list)].sort((a, b) => a - b);

    const { current } = readVersionConstants();
    return LADDER.map((rung) => rung.version).filter((version) => version < current);
}
