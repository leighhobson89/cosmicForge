import { capitaliseWordsWithRomanNumerals } from './utilityFunctions.js';

export function applyPatchesAfterRestoreGameStatus(deps = {}) {
    migrateAncientManuscriptsAndFactoryStarsIfNeeded(deps);
    patchOTypeMechanicActivatedForThisSave(deps);
}

export function patchOTypeMechanicActivatedForThisSave(deps = {}) {
    const {
        getStarNames,
        getStarTypeByName,
        getOTypeMechanicActivatedForThisSave,
        setOTypeMechanicActivatedForThisSave,
        trackAnalyticsEvent,
    } = deps;

    if (
        !getStarNames ||
        !getStarTypeByName ||
        !getOTypeMechanicActivatedForThisSave ||
        !setOTypeMechanicActivatedForThisSave
    ) {
        return;
    }

    const names = getStarNames?.() || [];
    if (!Array.isArray(names) || names.length === 0) {
        setOTypeMechanicActivatedForThisSave(false);
        return;
    }

    const requiredOStars = ['Mintaka', 'Regulus', 'Menkalinan'];
    const requiredSet = new Set(requiredOStars.map((n) => n.toLowerCase()));

    let hasMintaka = false;
    let hasRegulus = false;
    let hasMenkalinan = false;
    let foundUnexpectedOStar = false;
    const foundOStars = [];
    let unexpectedOStarName = null;

    for (const name of names) {
        const safeName = String(name ?? '').trim();
        if (!safeName) continue;

        const type = getStarTypeByName(safeName);
        if (type !== 'O') continue;

        const lower = safeName.toLowerCase();
        foundOStars.push(safeName);
        if (!requiredSet.has(lower)) {
            foundUnexpectedOStar = true;
            unexpectedOStarName = safeName;
            break;
        }

        if (lower === 'mintaka') hasMintaka = true;
        if (lower === 'regulus') hasRegulus = true;
        if (lower === 'menkalinan') hasMenkalinan = true;
    }

    const ok = !foundUnexpectedOStar && hasMintaka && hasRegulus && hasMenkalinan;
    const previous = getOTypeMechanicActivatedForThisSave();
    if (previous !== ok) {
        setOTypeMechanicActivatedForThisSave(ok);
    }

    if (!ok && !globalThis.__oTypeMechanicGateNotActivatedTracked && trackAnalyticsEvent) {
        globalThis.__oTypeMechanicGateNotActivatedTracked = true;
        trackAnalyticsEvent(
            'save_patch_applied',
            {
                patch_id: 'o_type_mechanic_flag_not_activated',
                ok,
                previous,
                found_o_stars: foundOStars,
                unexpected_o_star: unexpectedOStarName,
                has_mintaka: hasMintaka,
                has_regulus: hasRegulus,
                has_menkalinan: hasMenkalinan,
                ts: new Date().toISOString(),
            },
            { immediate: true, flushReason: 'save_patch' }
        );
    }
}

export function migrateAncientManuscriptsAndFactoryStarsIfNeeded(deps = {}) {
    const {
        getStarVisionDistance,
        getCurrentStarSystem,
        getSettledStars,
        getStarsWithAncientManuscripts,
        setStarsWithAncientManuscripts,
        getFactoryStarsArray,
        setFactoryStarsArray,
        NUMBER_OF_STARS,
        STAR_FIELD_SEED,
        getStarTypeByName,
        showNotification,
        generateStarfield,
        trackAnalyticsEvent,
    } = deps;

    if (
        !getStarVisionDistance ||
        !getCurrentStarSystem ||
        !getSettledStars ||
        !getStarsWithAncientManuscripts ||
        !setStarsWithAncientManuscripts ||
        !getFactoryStarsArray ||
        !setFactoryStarsArray ||
        !NUMBER_OF_STARS ||
        !STAR_FIELD_SEED ||
        !getStarTypeByName ||
        !generateStarfield
    ) {
        return;
    }

    const visionDistance = Number(getStarVisionDistance() ?? 0);
    const currentStar = getCurrentStarSystem();
    if (!currentStar) {
        return;
    }

    const settledStarSet = new Set((getSettledStars() || []).map((name) => String(name || '').toLowerCase()));
    const currentStarLower = String(currentStar || '').toLowerCase();

    const beforeManuscriptsSnapshot = JSON.stringify(getStarsWithAncientManuscripts() || []);
    const beforeFactorySnapshot = JSON.stringify(getFactoryStarsArray() || []);

    const manuscriptEntries = getStarsWithAncientManuscripts() || [];
    const factoryStarsArray = getFactoryStarsArray() || [];

    const factoryStarsToRemove = new Set();
    const removedManuscriptEntries = [];
    const cleanedManuscriptEntries = manuscriptEntries.filter((entry) => {
        if (!Array.isArray(entry) || entry.length < 2) {
            return true;
        }
        const manuscriptStar = entry[0];
        const factoryStar = entry[1];
        const manuscriptLower = String(manuscriptStar || '').toLowerCase();
        const factoryLower = String(factoryStar || '').toLowerCase();
        const manuscriptIsO = getStarTypeByName(manuscriptStar) === 'O';
        const factoryIsO = getStarTypeByName(factoryStar) === 'O';
        const manuscriptIsSettledOrCurrent = manuscriptLower === currentStarLower || settledStarSet.has(manuscriptLower);
        const factoryIsSettledOrCurrent = factoryLower === currentStarLower || settledStarSet.has(factoryLower);
        if (manuscriptIsO || factoryIsO || manuscriptIsSettledOrCurrent || factoryIsSettledOrCurrent) {
            removedManuscriptEntries.push(entry);
            if (typeof factoryStar === 'string' && factoryStar) {
                factoryStarsToRemove.add(factoryStar.toLowerCase());
            }
            return false;
        }
        return true;
    });

    const cleanedFactoryStars = factoryStarsArray.filter((name) => {
        const lower = String(name || '').toLowerCase();
        if (!lower) return false;
        if (lower === currentStarLower) return false;
        if (settledStarSet.has(lower)) return false;
        if (factoryStarsToRemove.has(lower)) return false;
        return getStarTypeByName(name) !== 'O';
    });

    if (cleanedManuscriptEntries.length !== manuscriptEntries.length) {
        manuscriptEntries.splice(0, manuscriptEntries.length, ...cleanedManuscriptEntries);
        manuscriptEntries
            .sort((a, b) => {
                const pa = Number(a?.[2] ?? 0);
                const pb = Number(b?.[2] ?? 0);
                return pa - pb;
            })
            .forEach((entry, idx) => {
                if (Array.isArray(entry) && entry.length >= 3) {
                    entry[2] = idx + 1;
                }
            });
    }
    if (cleanedFactoryStars.length !== factoryStarsArray.length) {
        factoryStarsArray.splice(0, factoryStarsArray.length, ...cleanedFactoryStars);
    }

    const thresholds = [5, 20, 35, 45];
    const desiredCount = thresholds.reduce((acc, t) => (visionDistance >= t ? acc + 1 : acc), 0);
    if (!desiredCount) {
        return;
    }

    const existingEntries = getStarsWithAncientManuscripts?.() || [];
    if (existingEntries.length >= desiredCount) {
        return;
    }

    const dummyContainer = document.createElement('div');
    const { stars, starDistanceData } = generateStarfield(
        dummyContainer,
        NUMBER_OF_STARS,
        STAR_FIELD_SEED,
        null,
        true,
        currentStar,
        false
    ) || { stars: [], starDistanceData: {} };

    const existingManuscriptStars = new Set(
        (getStarsWithAncientManuscripts() || [])
            .filter((entry) => Array.isArray(entry) && typeof entry[0] === 'string')
            .map((entry) => entry[0].toLowerCase())
    );
    const existingFactoryStars = new Set((getFactoryStarsArray() || []).map((n) => String(n).toLowerCase()));

    const pickRandom = (items) => items[Math.floor(Math.random() * items.length)];

    const pickManuscriptStarInBand = (low, high) => {
        const candidates = (stars || [])
            .map((star) => {
                const starName = star?.name;
                if (!starName) return null;
                const distance = starDistanceData?.[starName];
                return { starName, distance };
            })
            .filter((entry) => {
                if (!entry) return false;
                const nameLower = String(entry.starName).toLowerCase();
                if (nameLower === 'miaplacidus') return false;
                if (nameLower === currentStarLower) return false;
                if (settledStarSet.has(nameLower)) return false;
                if (existingManuscriptStars.has(nameLower)) return false;
                if (existingFactoryStars.has(nameLower)) return false;
                if (getStarTypeByName(entry.starName) === 'O') return false;
                if (typeof entry.distance !== 'number') return false;
                return entry.distance > low && entry.distance <= high;
            })
            .map((entry) => entry.starName.toLowerCase());

        if (!candidates.length) {
            return null;
        }
        return pickRandom(candidates);
    };

    const pickFactoryStarForPosition = (position) => {
        let minDistance = 0;
        let maxDistance = 100;

        switch (position) {
            case 1:
                minDistance = 5;
                maxDistance = 15;
                break;
            case 2:
                minDistance = 16;
                maxDistance = 25;
                break;
            case 3:
                minDistance = 26;
                maxDistance = 40;
                break;
            case 4:
                minDistance = 41;
                maxDistance = 60;
                break;
        }

        const candidates = (stars || [])
            .map((star) => {
                const starName = star?.name;
                if (!starName) return null;
                const distance = starDistanceData?.[starName];
                return { starName, distance };
            })
            .filter((entry) => {
                if (!entry) return false;
                const nameLower = String(entry.starName).toLowerCase();
                if (nameLower === 'miaplacidus') return false;
                if (nameLower === currentStarLower) return false;
                if (settledStarSet.has(nameLower)) return false;
                if (existingManuscriptStars.has(nameLower)) return false;
                if (existingFactoryStars.has(nameLower)) return false;
                if (getStarTypeByName(entry.starName) === 'O') return false;
                if (typeof entry.distance !== 'number') return false;
                return entry.distance >= minDistance && entry.distance <= maxDistance;
            })
            .map((entry) => entry.starName.toLowerCase());

        if (!candidates.length) {
            return null;
        }
        return pickRandom(candidates);
    };

    let entriesAdded = 0;
    while (getStarsWithAncientManuscripts().length < desiredCount) {
        const position = getStarsWithAncientManuscripts().length + 1;
        if (position > 4) {
            break;
        }

        const bandLow = position === 1 ? 0 : thresholds[position - 2];
        const bandHigh = thresholds[position - 1];

        const manuscriptStar = pickManuscriptStarInBand(bandLow, bandHigh);
        if (!manuscriptStar) {
            break;
        }

        const factoryStarToPointTo = pickFactoryStarForPosition(position);
        if (!factoryStarToPointTo) {
            break;
        }

        existingManuscriptStars.add(manuscriptStar);
        existingFactoryStars.add(factoryStarToPointTo);
        setFactoryStarsArray(factoryStarToPointTo);
        setStarsWithAncientManuscripts([manuscriptStar, factoryStarToPointTo, position, false]);
        entriesAdded++;
    }

    const afterManuscriptsSnapshot = JSON.stringify(getStarsWithAncientManuscripts() || []);
    const afterFactorySnapshot = JSON.stringify(getFactoryStarsArray() || []);
    const didChange =
        beforeManuscriptsSnapshot !== afterManuscriptsSnapshot ||
        beforeFactorySnapshot !== afterFactorySnapshot;

    if (didChange && trackAnalyticsEvent) {
        const removedFactoryStars = Array.from(factoryStarsToRemove);
        const affectedStars = Array.from(
            new Set(
                [
                    ...removedManuscriptEntries.flatMap((entry) => {
                        if (!Array.isArray(entry)) return [];
                        return [entry[0], entry[1]];
                    }),
                    ...removedFactoryStars
                ]
                    .filter(Boolean)
                    .map((name) => capitaliseWordsWithRomanNumerals(String(name)))
            )
        );
        trackAnalyticsEvent(
            'save_patch_applied',
            {
                patch_id: 'migrate_ancient_manuscripts_and_factory_stars_o_type_cleanup',
                affected_stars: affectedStars,
                removed_manuscript_entries: removedManuscriptEntries,
                removed_factory_stars: removedFactoryStars,
                manuscripts_before: JSON.parse(beforeManuscriptsSnapshot),
                manuscripts_after: JSON.parse(afterManuscriptsSnapshot),
                factory_before: JSON.parse(beforeFactorySnapshot),
                factory_after: JSON.parse(afterFactorySnapshot),
                backfilled_entries: entriesAdded,
                ts: new Date().toISOString(),
            },
            { immediate: true, flushReason: 'save_patch' }
        );
    }
    if (entriesAdded > 0 && showNotification) {
        showNotification(`Save updated: restored ${entriesAdded} missing Ancient Manuscript lead(s).`, 'info', 4000, 'loadSave');
    }
}

export function migrateResourceData(saveData, objectType, options = {}) {
    const getCurrentGameVersion = options.getCurrentGameVersion;
    const getMinimumVersion = options.getMinimumVersion;
    const getStarTypeByName = options.getStarTypeByName;

    const currentVersion =
        typeof options.currentVersion === 'number'
            ? options.currentVersion
            : (typeof getCurrentGameVersion === 'function' ? getCurrentGameVersion() : 0);
    const minimumVersion =
        typeof options.minimumVersion === 'number'
            ? options.minimumVersion
            : (typeof getMinimumVersion === 'function' ? getMinimumVersion() : 0);

    saveData.version = (typeof saveData?.version === 'number') ? saveData.version : minimumVersion;
    if (saveData.version < minimumVersion) {
        saveData.version = minimumVersion;
    }

    while (saveData.version < currentVersion) {

        if (saveData.version < 0.81) {
            if (objectType === 'ascendencyBuffsData') {
                saveData.nonExhaustiveResources = {
                    name: "Non Exhaustive Resources",
                    description: "buffNonExhaustiveResourcesRow",
                    rebuyable: false,
                    rebuyableIncreaseMultiple: 1,
                    baseCostAp: 10,
                    effectCategoryMagnitude: 1,
                    boughtYet: 0,
                    timesRebuyable: 1
                };
            }

            saveData.version = 0.81;
        }

        if (saveData.version < 0.82) {
            if (objectType === 'ascendencyBuffsData') {
                saveData.littleBagOfHydrogen = {
                    name: "Little Bag Of Hydrogen",
                    description: "buffLittleBagOfHydrogenRow",
                    rebuyable: false,
                    rebuyableIncreaseMultiple: 1,
                    baseCostAp: 3,
                    effectCategoryMagnitude: 1,
                    boughtYet: 0,
                    timesRebuyable: 1
                };
            }

            saveData.version = 0.82;
        }

        if (saveData.version < 0.83) {
            if (objectType === 'starSystemsData') {
                if (saveData && saveData.stars && typeof saveData.stars === 'object') {
                    for (const [starKey, starObj] of Object.entries(saveData.stars)) {
                        if (!starObj || typeof starObj !== 'object') continue;
                        if (starObj.starType === undefined || starObj.starType === null) {
                            const lookupName = starObj.name ?? starKey;
                            if (typeof getStarTypeByName === 'function') {
                                starObj.starType = getStarTypeByName(lookupName);
                            }
                        }
                    }
                }
            }

            saveData.version = 0.83;
        }

        if (saveData.version < 0.84) {
            if (objectType === 'oTypePowerPlantBuffs') {
                if (!saveData || typeof saveData !== 'object') {
                    saveData = {};
                }

                if (!saveData.basicPowerPlantStar || typeof saveData.basicPowerPlantStar !== 'object') {
                    saveData.basicPowerPlantStar = { starName: null, settled: false };
                } else {
                    if (saveData.basicPowerPlantStar.starName === undefined) saveData.basicPowerPlantStar.starName = null;
                    if (saveData.basicPowerPlantStar.settled === undefined) saveData.basicPowerPlantStar.settled = false;
                }

                if (!saveData.solarPowerPlantStar || typeof saveData.solarPowerPlantStar !== 'object') {
                    saveData.solarPowerPlantStar = { starName: null, settled: false };
                } else {
                    if (saveData.solarPowerPlantStar.starName === undefined) saveData.solarPowerPlantStar.starName = null;
                    if (saveData.solarPowerPlantStar.settled === undefined) saveData.solarPowerPlantStar.settled = false;
                }

                if (!saveData.advancedPowerPlantStar || typeof saveData.advancedPowerPlantStar !== 'object') {
                    saveData.advancedPowerPlantStar = { starName: null, settled: false };
                } else {
                    if (saveData.advancedPowerPlantStar.starName === undefined) saveData.advancedPowerPlantStar.starName = null;
                    if (saveData.advancedPowerPlantStar.settled === undefined) saveData.advancedPowerPlantStar.settled = false;
                }
            }

            saveData.version = 0.84;
        }

        saveData.version += 0.001;
    }

    if (objectType === 'resourceData') {
        if (!saveData.blackHole) {
            saveData.blackHole = {
                researchPrice: 1000000,
                durationPrice: 600000,
                powerPrice: 850000,
                duration: 3000,
                power: 5,
                blackHoleResearchDone: false
            };
        }

        if (saveData.blackHole.researchPrice === undefined) {
            saveData.blackHole.researchPrice = 1000000;
        }
        if (saveData.blackHole.durationPrice === undefined) {
            saveData.blackHole.durationPrice = 600000;
        }
        if (saveData.blackHole.powerPrice === undefined) {
            saveData.blackHole.powerPrice = 850000;
        }
        if (saveData.blackHole.duration === undefined) {
            saveData.blackHole.duration = 3000;
        }
        if (saveData.blackHole.power === undefined) {
            saveData.blackHole.power = 5;
        }
        if (saveData.blackHole.blackHoleResearchDone === undefined) {
            saveData.blackHole.blackHoleResearchDone = false;
        }
        if (saveData.blackHole.rechargePrice === undefined) {
            saveData.blackHole.rechargePrice = 900000;
        }
        if (saveData.blackHole.rechargeMultiplier === undefined) {
            saveData.blackHole.rechargeMultiplier = 1;
        }
    }

    return saveData;
}
