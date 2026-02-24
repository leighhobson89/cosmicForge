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
        if (saveData.version < 0.91) {
            if (objectType === 'gameState') {
                saveData.oTypeMechanicActivatedForThisSave = true;
            }
            if (objectType === 'resourceData') {
                const upgrades = saveData?.space?.upgrades;
                if (upgrades && typeof upgrades === 'object') {
                    const applyRocketPatch = (rocketKey, parts, titaniumCostPerPart, oldParts) => {
                        const rocket = upgrades?.[rocketKey];
                        if (!rocket || typeof rocket !== 'object') {
                            return;
                        }
                        if (rocket.parts !== undefined) rocket.parts = parts;
                        if (rocket.builtParts !== undefined) {
                            const built = Number(rocket.builtParts) || 0;
                            if (built >= oldParts) {
                                rocket.builtParts = parts;
                            }
                        }
                        if (Array.isArray(rocket.resource2Price) && rocket.resource2Price.length >= 1) {
                            rocket.resource2Price[0] = titaniumCostPerPart;
                        }
                    };
                    applyRocketPatch('rocket1', 12, 700, 15);
                    applyRocketPatch('rocket2', 17, 700, 20);
                    applyRocketPatch('rocket3', 22, 700, 25);
                    applyRocketPatch('rocket4', 27, 700, 30);
                }
            }
            saveData.version = 0.91;
        }
        if (saveData.version < 0.92) {
            if (objectType === 'resourceData') {
                const energyUpgrades = saveData?.buildings?.energy?.upgrades;
                if (energyUpgrades && typeof energyUpgrades === 'object') {
                    if (energyUpgrades.powerPlant2 && typeof energyUpgrades.powerPlant2 === 'object') {
                        energyUpgrades.powerPlant2.price = 1000;
                    }
                    if (energyUpgrades.powerPlant3 && typeof energyUpgrades.powerPlant3 === 'object') {
                        energyUpgrades.powerPlant3.price = 700;
                    }
                }
            }
            saveData.version = 0.92;
        }
        if (saveData.version < 0.93) {
            if (objectType === 'galacticCasinoData') {
                saveData.casinoPoints.cpBaseCost = 100000;
            }
            saveData.version = 0.93;
        }
        if (saveData.version < 0.94) {
                if (!saveData.flags || typeof saveData.flags !== 'object') {
                    saveData.flags = {};
                }
                const alreadyPatched = saveData.flags.blackHoleNerfPatched === true;
                if (!alreadyPatched) {
                    const powerRaw = saveData?.blackHole?.power;
                    const power = Number(powerRaw);
                    if (Number.isFinite(power) && power > 50) {
                        const delta = power - 50;
                        const oldPurchasesAbove = Math.round(delta / 2);
                        const newPower = 50 + (oldPurchasesAbove * 0.5);
                        const roundedNewPower = Math.round(newPower * 2) / 2;
                        if (saveData && saveData.blackHole && typeof saveData.blackHole === 'object') {
                            saveData.blackHole.power = roundedNewPower;
                        }
                    }
                    saveData.flags.blackHoleNerfPatched = true;
                }
            saveData.version = 0.94;
        }
        if (saveData.version < 0.95) {
            if (objectType === 'resourceData') {
                const energyUpgrades = saveData?.buildings?.energy?.upgrades;
                if (energyUpgrades && typeof energyUpgrades === 'object') {
                    const GAME_COST_MULTIPLIER = 1.13;
                    if (energyUpgrades.powerPlant3 && typeof energyUpgrades.powerPlant3 === 'object') {
                        const quantity = energyUpgrades.powerPlant3.quantity || 0;
                        const scaleFactor = Math.pow(GAME_COST_MULTIPLIER, quantity);
                        energyUpgrades.powerPlant3.price = Math.ceil(700 * scaleFactor);
                        energyUpgrades.powerPlant3.resource1Price = [Math.ceil(800 * scaleFactor), 'hydrogen', 'resources'];
                        energyUpgrades.powerPlant3.resource2Price = [Math.ceil(500 * scaleFactor), 'helium', 'resources'];
                        energyUpgrades.powerPlant3.resource3Price = [0, '', ''];
                    }
                    if (energyUpgrades.battery2 && typeof energyUpgrades.battery2 === 'object') {
                        const quantity = energyUpgrades.battery2.quantity || 0;
                        const scaleFactor = Math.pow(GAME_COST_MULTIPLIER, quantity);
                        energyUpgrades.battery2.price = Math.ceil(50000 * scaleFactor);
                        energyUpgrades.battery2.resource1Price = [Math.ceil(3000 * scaleFactor), 'steel', 'compounds'];
                        energyUpgrades.battery2.resource2Price = [Math.ceil(1500 * scaleFactor), 'glass', 'compounds'];
                        energyUpgrades.battery2.resource3Price = [Math.ceil(2000 * scaleFactor), 'sodium', 'resources'];
                    }
                    if (energyUpgrades.battery3 && typeof energyUpgrades.battery3 === 'object') {
                        const quantity = energyUpgrades.battery3.quantity || 0;
                        const scaleFactor = Math.pow(GAME_COST_MULTIPLIER, quantity);
                        energyUpgrades.battery3.price = Math.ceil(500000 * scaleFactor);
                        energyUpgrades.battery3.resource1Price = [Math.ceil(25000 * scaleFactor), 'titanium', 'compounds'];
                        energyUpgrades.battery3.resource2Price = [Math.ceil(12000 * scaleFactor), 'neon', 'resources'];
                        energyUpgrades.battery3.resource3Price = [Math.ceil(18000 * scaleFactor), 'silicon', 'resources'];

                    }
                }
            }
            saveData.version = 0.95;
        }

        if (saveData.version < 0.967) {
            if (objectType === 'resourceData') {
                const legacy = (saveData && typeof saveData === 'object') ? saveData.spaceRip : null;
                if (legacy && typeof legacy === 'object') {
                    if (!saveData.cosmicRip || typeof saveData.cosmicRip !== 'object') {
                        saveData.cosmicRip = {};
                    }
                    if (typeof saveData.cosmicRip.galacticPoints !== 'number') {
                        saveData.cosmicRip.galacticPoints = typeof legacy.galacticPoints === 'number' ? legacy.galacticPoints : 0;
                    }
                    if (typeof saveData.cosmicRip.nearSpaceScannerArrayRestored !== 'boolean') {
                        saveData.cosmicRip.nearSpaceScannerArrayRestored = typeof legacy.galacticTelescopeRestored === 'boolean'
                            ? legacy.galacticTelescopeRestored
                            : false;
                    }
                    if (typeof saveData.cosmicRip.ripLocationSectorIndex !== 'number') {
                        saveData.cosmicRip.ripLocationSectorIndex = typeof legacy.ripLocationSectorIndex === 'number' ? legacy.ripLocationSectorIndex : -1;
                    }
                    if (typeof saveData.cosmicRip.ripFound !== 'boolean') {
                        saveData.cosmicRip.ripFound = typeof legacy.ripFound === 'boolean' ? legacy.ripFound : false;
                    }
                    if (!Array.isArray(saveData.cosmicRip.scanResultsBySectorIndex) || saveData.cosmicRip.scanResultsBySectorIndex.length !== 9) {
                        if (Array.isArray(legacy.scanResultsBySectorIndex) && legacy.scanResultsBySectorIndex.length === 9) {
                            saveData.cosmicRip.scanResultsBySectorIndex = legacy.scanResultsBySectorIndex.map(v => v === true);
                        } else {
                            saveData.cosmicRip.scanResultsBySectorIndex = Array(9).fill(false);
                        }
                    }
                    delete saveData.spaceRip;
                }

                if (!saveData.cosmicRip || typeof saveData.cosmicRip !== 'object') {
                    saveData.cosmicRip = {};
                }
                if (typeof saveData.cosmicRip.galacticPoints !== 'number') {
                    saveData.cosmicRip.galacticPoints = 0;
                }
                if (typeof saveData.cosmicRip.nearSpaceScannerArrayRestored !== 'boolean') {
                    saveData.cosmicRip.nearSpaceScannerArrayRestored = false;
                }
                if (typeof saveData.cosmicRip.ripLocationSectorIndex !== 'number') {
                    saveData.cosmicRip.ripLocationSectorIndex = -1;
                }
                if (typeof saveData.cosmicRip.ripFound !== 'boolean') {
                    saveData.cosmicRip.ripFound = false;
                }
                if (!Array.isArray(saveData.cosmicRip.scanResultsBySectorIndex) || saveData.cosmicRip.scanResultsBySectorIndex.length !== 9) {
                    saveData.cosmicRip.scanResultsBySectorIndex = Array(9).fill(false);
                }
            }

            if (objectType === 'gameState') {
                if (typeof saveData.galacticPointsSpent !== 'number') {
                    saveData.galacticPointsSpent = 0;
                }
            }

            saveData.version = 0.967;
        }

        if (saveData.version < 0.969) {
            if (objectType === 'resourceData') {
                if (!saveData.cosmicRip || typeof saveData.cosmicRip !== 'object') {
                    saveData.cosmicRip = {};
                }

                if (typeof saveData.cosmicRip.stage !== 'string') {
                    saveData.cosmicRip.stage = 'discovery';
                }
                if (typeof saveData.cosmicRip.instability !== 'number') {
                    saveData.cosmicRip.instability = 100;
                }
                if (typeof saveData.cosmicRip.containmentIntegrity !== 'number') {
                    saveData.cosmicRip.containmentIntegrity = 0;
                }
                if (typeof saveData.cosmicRip.sealProgress !== 'number') {
                    saveData.cosmicRip.sealProgress = 0;
                }

                if (!saveData.cosmicRip.ripResearch || typeof saveData.cosmicRip.ripResearch !== 'object') {
                    saveData.cosmicRip.ripResearch = {};
                }
                if (typeof saveData.cosmicRip.ripResearch.points !== 'number') {
                    saveData.cosmicRip.ripResearch.points = 0;
                }
                if (typeof saveData.cosmicRip.ripResearch.level !== 'number') {
                    saveData.cosmicRip.ripResearch.level = 0;
                }
                if (!saveData.cosmicRip.ripResearch.unlocked || typeof saveData.cosmicRip.ripResearch.unlocked !== 'object') {
                    saveData.cosmicRip.ripResearch.unlocked = {};
                }
                if (typeof saveData.cosmicRip.ripResearch.unlocked.stabilization !== 'boolean') {
                    saveData.cosmicRip.ripResearch.unlocked.stabilization = false;
                }
                if (typeof saveData.cosmicRip.ripResearch.unlocked.containment !== 'boolean') {
                    saveData.cosmicRip.ripResearch.unlocked.containment = false;
                }
                if (typeof saveData.cosmicRip.ripResearch.unlocked.sealing !== 'boolean') {
                    saveData.cosmicRip.ripResearch.unlocked.sealing = false;
                }

                if (!saveData.cosmicRip.projects || typeof saveData.cosmicRip.projects !== 'object') {
                    saveData.cosmicRip.projects = {};
                }
                if (typeof saveData.cosmicRip.projects.stabilizerArrayLevel !== 'number') {
                    saveData.cosmicRip.projects.stabilizerArrayLevel = 0;
                }
                if (typeof saveData.cosmicRip.projects.containmentRingSegmentsBuilt !== 'number') {
                    saveData.cosmicRip.projects.containmentRingSegmentsBuilt = 0;
                }
                if (typeof saveData.cosmicRip.projects.containmentRingSegmentsRequired !== 'number') {
                    saveData.cosmicRip.projects.containmentRingSegmentsRequired = 8;
                }
                if (typeof saveData.cosmicRip.projects.anchorPylonsBuilt !== 'number') {
                    saveData.cosmicRip.projects.anchorPylonsBuilt = 0;
                }
                if (typeof saveData.cosmicRip.projects.anchorPylonsRequired !== 'number') {
                    saveData.cosmicRip.projects.anchorPylonsRequired = 4;
                }
                if (typeof saveData.cosmicRip.projects.sealDriverBuilt !== 'boolean') {
                    saveData.cosmicRip.projects.sealDriverBuilt = false;
                }
                if (typeof saveData.cosmicRip.projects.failsafeCapacitorsBuilt !== 'number') {
                    saveData.cosmicRip.projects.failsafeCapacitorsBuilt = 0;
                }
                if (typeof saveData.cosmicRip.projects.failsafeCapacitorsRequired !== 'number') {
                    saveData.cosmicRip.projects.failsafeCapacitorsRequired = 3;
                }
                if (typeof saveData.cosmicRip.projects.sensorBuoyDeployed !== 'boolean') {
                    saveData.cosmicRip.projects.sensorBuoyDeployed = false;
                }
                if (typeof saveData.cosmicRip.projects.stabilizerNodeDeployedCount !== 'number') {
                    saveData.cosmicRip.projects.stabilizerNodeDeployedCount = 0;
                }
            }

            saveData.version = 0.969;
        }
    }
    return saveData;
}
