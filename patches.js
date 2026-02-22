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
        if (saveData.version < 0.96) {
            if (objectType === 'resourceData') {
                if (!saveData.spaceRip || typeof saveData.spaceRip !== 'object') {
                    saveData.spaceRip = {};
                }
                if (typeof saveData.spaceRip.galacticPoints !== 'number') {
                    saveData.spaceRip.galacticPoints = 0;
                }
            }
            if (objectType === 'gameState') {
                if (typeof saveData.galacticPointsSpent !== 'number') {
                    saveData.galacticPointsSpent = 0;
                }
            }
            saveData.version = 0.96;
        }
        saveData.version += 0.001;
    }
    return saveData;
}
