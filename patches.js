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
            }

            saveData.version = 0.969;
        }

        if (saveData.version < 0.976) {
            if (objectType === 'resourceData') {
                const freshCosmicRip = {
                    galacticPoints: 0,
                    ripTelemetryData: 0,
                    nearSpaceScannerArrayRestored: false,
                    ripLocationSectorIndex: -1,
                    ripFound: false,
                    scanResultsBySectorIndex: Array(9).fill(false),
                    upgrades: {
                        sensorBuoy: {
                            quantity: 0,
                            basePrices: [500000, 100000, 600000],
                            price: 500000,
                            resource1Price: [100000, 'titanium', 'compounds'],
                            resource2Price: [600000, 'silicon', 'resources'],
                            resource3Price: [0, '', ''],
                            setPrice: 'sensorBuoyPrice',
                            rate: 0.04
                        },
                        ripResearchOrbiter: {
                            quantity: 0,
                            basePrices: [1000000, 1000000, 1000000, 500000],
                            price: 1000000,
                            resource1Price: [1000000, 'helium', 'resources'],
                            resource2Price: [1000000, 'sodium', 'resources'],
                            resource3Price: [500000, 'steel', 'compounds'],
                            setPrice: 'ripResearchOrbiterPrice',
                            rate: 0.07
                        },
                    },
                    techs: {
                        stabilizerArray: { appearsAt: [5000, null, null], prereqs: [null], price: 10000, idForRenderPosition: 1, timeToResearch: 60000 },
                        quantumContainmentField: { appearsAt: [12000, "stabilizerArray", ""], prereqs: ['Stabilizer Array'], price: 15000, idForRenderPosition: 2, timeToResearch: 120000 },
                        dimensionalAnchorMatrix: { appearsAt: [16000, "quantumContainmentField", ""], prereqs: ['Quantum Containment Field'], price: 25000, idForRenderPosition: 3, timeToResearch: 180000 },
                        singularityStabilizer: { appearsAt: [30000, "dimensionalAnchorMatrix", ""], prereqs: ['Dimensional Anchor Matrix'], price: 40000, idForRenderPosition: 4, timeToResearch: 240000 },
                        realityWeaveRegulator: { appearsAt: [40000, "singularityStabilizer", ""], prereqs: ['Singularity Stabilizer'], price: 60000, idForRenderPosition: 5, timeToResearch: 300000 },
                    }
                };
                saveData.cosmicRip = freshCosmicRip;
            }
            saveData.version = 0.976;
        }

        if (saveData.version < 0.978) {
            if (objectType === 'galacticCasinoData') {
                if (!Array.isArray(saveData.casinoGamesWon)) {
                    saveData.casinoGamesWon = [];
                }
            }

            if (objectType === 'achievementsData') {
                if (!saveData || typeof saveData !== 'object') {
                    saveData = {};
                }

                const newAchievements = {
                    buyCasinoPoints: {
                        id: "buyCasinoPoints",
                        name: "Buy Some Casino Points",
                        specialConditionName: 'achievementBuyCasinoPoints',
                        specialCondition: false,
                        specialConditionArguments: false,
                        resetOnRebirth: false,
                        active: false,
                        requirements: { requirement1: "special", value1: "" },
                        gives: { gives1: "rewardString", value1: { type: "pride", quantity: 0 } },
                        notification: "buyCasinoPointsNotification"
                    },
                    winAllCasinoGames: {
                        id: "winAllCasinoGames",
                        name: "Win a Prize in All Casino Games",
                        specialConditionName: 'achievementWinAllCasinoGames',
                        specialCondition: false,
                        specialConditionArguments: false,
                        resetOnRebirth: false,
                        active: false,
                        requirements: { requirement1: "special", value1: "" },
                        gives: { gives1: "rewardString", value1: { type: "pride", quantity: 0 } },
                        notification: "winAllCasinoGamesNotification"
                    },
                    winWheelSpecialPrize: {
                        id: "winWheelSpecialPrize",
                        name: "Win a Wheel of Fortune Special Prize",
                        specialConditionName: 'achievementWinWheelSpecialPrize',
                        specialCondition: false,
                        specialConditionArguments: false,
                        resetOnRebirth: false,
                        active: false,
                        requirements: { requirement1: "special", value1: "" },
                        gives: { gives1: "rewardString", value1: { type: "pride", quantity: 0 } },
                        notification: "winWheelSpecialPrizeNotification"
                    },
                    restoreNearSpaceScannerArray: {
                        id: "restoreNearSpaceScannerArray",
                        name: "Restore the Near Space Scanner Array",
                        specialConditionName: 'achievementRestoreNearSpaceScannerArray',
                        specialCondition: false,
                        specialConditionArguments: false,
                        resetOnRebirth: false,
                        active: false,
                        requirements: { requirement1: "special", value1: "" },
                        gives: { gives1: "rewardString", value1: { type: "pride", quantity: 0 } },
                        notification: "restoreNearSpaceScannerArrayNotification"
                    },
                    findCosmicRip: {
                        id: "findCosmicRip",
                        name: "Find the Cosmic Rip",
                        specialConditionName: 'achievementFindCosmicRip',
                        specialCondition: false,
                        specialConditionArguments: false,
                        resetOnRebirth: false,
                        active: false,
                        requirements: { requirement1: "special", value1: "" },
                        gives: { gives1: "rewardString", value1: { type: "pride", quantity: 0 } },
                        notification: "findCosmicRipNotification"
                    },
                    gain1MTelemetryData: {
                        id: "gain1MTelemetryData",
                        name: "Gain 1M Telemetry Data",
                        specialConditionName: 'achievementGain1MTelemetryData',
                        specialCondition: false,
                        specialConditionArguments: false,
                        resetOnRebirth: false,
                        active: false,
                        requirements: { requirement1: "special", value1: "" },
                        gives: { gives1: "rewardString", value1: { type: "pride", quantity: 0 } },
                        notification: "gain1MTelemetryDataNotification"
                    },
                    closeCosmicRip: {
                        id: "closeCosmicRip",
                        name: "Close the Cosmic Rip",
                        specialConditionName: 'achievementCloseCosmicRip',
                        specialCondition: false,
                        specialConditionArguments: false,
                        resetOnRebirth: false,
                        active: false,
                        requirements: { requirement1: "special", value1: "" },
                        gives: { gives1: "rewardString", value1: { type: "pride", quantity: 0 } },
                        notification: "closeCosmicRipNotification"
                    },
                    suffer5NegativeEvents: {
                        id: "suffer5NegativeEvents",
                        name: "Suffer 5 Negative Instant Events",
                        specialConditionName: 'achievementSuffer5NegativeEvents',
                        specialCondition: false,
                        specialConditionArguments: false,
                        resetOnRebirth: false,
                        active: false,
                        requirements: { requirement1: "special", value1: "" },
                        gives: { gives1: "rewardString", value1: { type: "pride", quantity: 0 } },
                        notification: "suffer5NegativeEventsNotification"
                    },
                    enjoyEndlessSummer: {
                        id: "enjoyEndlessSummer",
                        name: "Enjoy an Endless Summer",
                        specialConditionName: 'achievementEnjoyEndlessSummer',
                        specialCondition: false,
                        specialConditionArguments: false,
                        resetOnRebirth: false,
                        active: false,
                        requirements: { requirement1: "special", value1: "" },
                        gives: { gives1: "rewardString", value1: { type: "pride", quantity: 0 } },
                        notification: "enjoyEndlessSummerNotification"
                    },
                    completeOnboarding: {
                        id: "completeOnboarding",
                        name: "Complete the Onboarding",
                        specialConditionName: 'achievementCompleteOnboarding',
                        specialCondition: false,
                        specialConditionArguments: false,
                        resetOnRebirth: false,
                        active: false,
                        requirements: { requirement1: "special", value1: "" },
                        gives: { gives1: "rewardString", value1: { type: "pride", quantity: 0 } },
                        notification: "completeOnboardingNotification"
                    }
                };

                for (const [key, achievement] of Object.entries(newAchievements)) {
                    if (!saveData[key]) {
                        saveData[key] = achievement;
                    }
                }
            }

            saveData.version = 0.978;
        }

        if (saveData.version < 0.979) {
            if (objectType === 'resourceData') {
                const resourceNameUpgradeMap = {
                    solar: {
                        tier1: { old: 'Solar AB1', new: 'autoBuyerNameSolarAB1' },
                        tier2: { old: 'Solar AB2', new: 'autoBuyerNameSolarAB2' },
                        tier3: { old: 'Solar AB3', new: 'autoBuyerNameSolarAB3' },
                        tier4: { old: 'Solar AB4', new: 'autoBuyerNameSolarAB4' }
                    },
                    hydrogen: {
                        tier1: { old: 'Hydrogen Compressor', new: 'autoBuyerNameHydrogenCompressor' },
                        tier2: { old: 'Advanced Hydrogen Compressor', new: 'autoBuyerNameHydrogenCompressorAdvanced' },
                        tier3: { old: 'Industrial Hydrogen Compressor', new: 'autoBuyerNameHydrogenCompressorIndustrial' },
                        tier4: { old: 'Quantum Hydrogen Compressor', new: 'autoBuyerNameHydrogenCompressorQuantum' }
                    },
                    helium: {
                        tier1: { old: 'Helium Extractor', new: 'autoBuyerNameHeliumExtractor' },
                        tier2: { old: 'Advanced Helium Extractor', new: 'autoBuyerNameHeliumExtractorAdvanced' },
                        tier3: { old: 'Industrial Helium Extractor', new: 'autoBuyerNameHeliumExtractorIndustrial' },
                        tier4: { old: 'Quantum Helium Extractor', new: 'autoBuyerNameHeliumExtractorQuantum' }
                    },
                    carbon: {
                        tier1: { old: 'Burner', new: 'autoBuyerNameCarbonBurner' },
                        tier2: { old: 'Advanced Carbon Extractor', new: 'autoBuyerNameCarbonExtractorAdvanced' },
                        tier3: { old: 'Industrial Carbon Extractor', new: 'autoBuyerNameCarbonExtractorIndustrial' },
                        tier4: { old: 'Quantum Carbon Extractor', new: 'autoBuyerNameCarbonExtractorQuantum' }
                    },
                    neon: {
                        tier1: { old: 'Neon Extractor', new: 'autoBuyerNameNeonExtractor' },
                        tier2: { old: 'Advanced Neon Extractor', new: 'autoBuyerNameNeonExtractorAdvanced' },
                        tier3: { old: 'Industrial Neon Extractor', new: 'autoBuyerNameNeonExtractorIndustrial' },
                        tier4: { old: 'Quantum Neon Extractor', new: 'autoBuyerNameNeonExtractorQuantum' }
                    },
                    oxygen: {
                        tier1: { old: 'Oxygen Extractor', new: 'autoBuyerNameOxygenExtractor' },
                        tier2: { old: 'Advanced Oxygen Extractor', new: 'autoBuyerNameOxygenExtractorAdvanced' },
                        tier3: { old: 'Industrial Oxygen Extractor', new: 'autoBuyerNameOxygenExtractorIndustrial' },
                        tier4: { old: 'Quantum Oxygen Extractor', new: 'autoBuyerNameOxygenExtractorQuantum' }
                    },
                    silicon: {
                        tier1: { old: 'Silicon Extractor', new: 'autoBuyerNameSiliconExtractor' },
                        tier2: { old: 'Advanced Silicon Extractor', new: 'autoBuyerNameSiliconExtractorAdvanced' },
                        tier3: { old: 'Industrial Silicon Extractor', new: 'autoBuyerNameSiliconExtractorIndustrial' },
                        tier4: { old: 'Quantum Silicon Extractor', new: 'autoBuyerNameSiliconExtractorQuantum' }
                    },
                    iron: {
                        tier1: { old: 'Iron Extractor', new: 'autoBuyerNameIronExtractor' },
                        tier2: { old: 'Advanced Iron Extractor', new: 'autoBuyerNameIronExtractorAdvanced' },
                        tier3: { old: 'Industrial Iron Extractor', new: 'autoBuyerNameIronExtractorIndustrial' },
                        tier4: { old: 'Quantum Iron Extractor', new: 'autoBuyerNameIronExtractorQuantum' }
                    },
                    sodium: {
                        tier1: { old: 'Sodium Extractor', new: 'autoBuyerNameSodiumExtractor' },
                        tier2: { old: 'Advanced Sodium Extractor', new: 'autoBuyerNameSodiumExtractorAdvanced' },
                        tier3: { old: 'Industrial Sodium Extractor', new: 'autoBuyerNameSodiumExtractorIndustrial' },
                        tier4: { old: 'Quantum Sodium Extractor', new: 'autoBuyerNameSodiumExtractorQuantum' }
                    }
                };

                // Migrate resources
                if (saveData.resources && typeof saveData.resources === 'object') {
                    for (const [resourceName, tiers] of Object.entries(resourceNameUpgradeMap)) {
                        const resource = saveData.resources[resourceName];
                        if (resource?.upgrades?.autoBuyer) {
                            for (const [tier, mapping] of Object.entries(tiers)) {
                                const autoBuyerTier = resource.upgrades.autoBuyer[tier];
                                if (autoBuyerTier && autoBuyerTier.nameUpgrade === mapping.old) {
                                    autoBuyerTier.nameUpgrade = mapping.new;
                                }
                            }
                        }
                    }
                }

                // Migrate compound autoBuyer nameUpgrade fields to localization keys
                const compoundNameUpgradeMap = {
                    diesel: {
                        tier1: { old: 'Backyard Extractor', new: 'autoBuyerNameDieselBackyard' },
                        tier2: { old: 'Advanced Extractor', new: 'autoBuyerNameDieselAdvanced' },
                        tier3: { old: 'Industrial Extractor', new: 'autoBuyerNameDieselIndustrial' },
                        tier4: { old: 'Quantum Extractor', new: 'autoBuyerNameDieselQuantum' }
                    },
                    glass: {
                        tier1: { old: 'Workshop Glass Fabricator', new: 'autoBuyerNameGlassWorkshop' },
                        tier2: { old: 'Small Glass Factory', new: 'autoBuyerNameGlassSmall' },
                        tier3: { old: 'Medium Glass Factory', new: 'autoBuyerNameGlassMedium' },
                        tier4: { old: 'Large Glass Factory', new: 'autoBuyerNameGlassLarge' }
                    },
                    steel: {
                        tier1: { old: 'Workshop Steel Fabricator', new: 'autoBuyerNameSteelWorkshop' },
                        tier2: { old: 'Small Steel Factory', new: 'autoBuyerNameSteelSmall' },
                        tier3: { old: 'Medium Steel Factory', new: 'autoBuyerNameSteelMedium' },
                        tier4: { old: 'Large Steel Factory', new: 'autoBuyerNameSteelLarge' }
                    },
                    concrete: {
                        tier1: { old: 'Back Yard Concrete Mixer', new: 'autoBuyerNameConcreteBackyard' },
                        tier2: { old: 'Small Concrete Factory', new: 'autoBuyerNameConcreteSmall' },
                        tier3: { old: 'Medium Concrete Factory', new: 'autoBuyerNameConcreteMedium' },
                        tier4: { old: 'Large Concrete Factory', new: 'autoBuyerNameConcreteLarge' }
                    },
                    water: {
                        tier1: { old: 'Basic Water Pump', new: 'autoBuyerNameWaterBasic' },
                        tier2: { old: 'Small Water Treatment Plant', new: 'autoBuyerNameWaterSmall' },
                        tier3: { old: 'Medium Water Treatment Plant', new: 'autoBuyerNameWaterMedium' },
                        tier4: { old: 'Large Water Treatment Plant', new: 'autoBuyerNameWaterLarge' }
                    },
                    titanium: {
                        tier1: { old: 'Basic Titanium Smelter', new: 'autoBuyerNameTitaniumBasic' },
                        tier2: { old: 'Small Titanium Factory', new: 'autoBuyerNameTitaniumSmall' },
                        tier3: { old: 'Medium Titanium Factory', new: 'autoBuyerNameTitaniumMedium' },
                        tier4: { old: 'Large Titanium Factory', new: 'autoBuyerNameTitaniumLarge' }
                    }
                };

                // Migrate compounds
                if (saveData.compounds && typeof saveData.compounds === 'object') {
                    for (const [compoundName, tiers] of Object.entries(compoundNameUpgradeMap)) {
                        const compound = saveData.compounds[compoundName];
                        if (compound?.upgrades?.autoBuyer) {
                            for (const [tier, mapping] of Object.entries(tiers)) {
                                const autoBuyerTier = compound.upgrades.autoBuyer[tier];
                                if (autoBuyerTier && autoBuyerTier.nameUpgrade === mapping.old) {
                                    autoBuyerTier.nameUpgrade = mapping.new;
                                }
                            }
                        }
                    }
                }
            }

            saveData.version = 0.979;
        }
        if (saveData.version < 0.98) {
            // Release 0.98 does not change any saved structure. Keep this rung
            // nevertheless: a save made by 0.979 must be explicitly carried to
            // the new schema version, just like every later structural release.
            saveData.version = 0.98;
        }
    }
    return saveData;
}
