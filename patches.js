import { capitaliseWordsWithRomanNumerals } from './utilityFunctions.js';

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

        if (saveData.version < 0.85) {
            if (objectType === 'resourceData') {
                if (saveData?.research?.upgrades?.scienceLab) {
                    saveData.research.upgrades.scienceLab.energyUse = 0.35;
                }
            }

            if (objectType === 'gameState') {
                if (!saveData.flags || typeof saveData.flags !== 'object') {
                    saveData.flags = {};
                }
                if (saveData.flags.eventsTriggeredOnce === undefined) {
                    saveData.flags.eventsTriggeredOnce = false;
                }
            }

            saveData.version = 0.85;
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
