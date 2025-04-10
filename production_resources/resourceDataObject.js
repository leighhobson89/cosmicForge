import { getAchievementNotification, replaceRocketNames } from "./descriptions.js";
import { migrateResourceData } from "./saveLoadGame.js";
import { addPermanentBuffsBackInAfterRebirth } from './game.js';
import { getCurrentTheme } from "./constantsAndGlobalVars.js";

export let achievementImageUrls;

export let resourceData = {
    version: 0.62, //update this whenever changes are made to the structure
    resources: {
        solar: {
            autoSell: false,
            nameResource: 'Solar',
            screenName: 'solar',
            saleValue: 0,
            salePreviewElement: 'sellSolarDescription',
            quantity: 10000,
            rate: 0,
            usedForFuelPerSec: 0,
            storageCapacity: 10000,
            currentSecondaryIncreasePrice: 0,
            revealedYet: false,
            upgrades: {
                autoBuyer: {
                    currentTierLevel: 1,
                    normalProgression: true,
                    tier1: { nameUpgrade: 'Solar AB1', screen: 'solar', place: 'solarAutoBuyer1Row', price: 0, rate: 0, quantity: 0, setPrice: 'solarAB1Price', energyUse: 0, active: true },
                    tier2: { nameUpgrade: 'Solar AB2', screen: 'solar', place: 'solarAutoBuyer2Row', price: 0, rate: 0, quantity: 0, setPrice: 'solarAB2Price', energyUse: 0, active: true },
                    tier3: { nameUpgrade: 'Solar AB3', screen: 'solar', place: 'solarAutoBuyer3Row', price: 0, rate: 0, quantity: 0, setPrice: 'solarAB3Price', energyUse: 0, active: true },
                    tier4: { nameUpgrade: 'Solar AB4', screen: 'solar', place: 'solarAutoBuyer4Row', price: 0, rate: 0, quantity: 0, setPrice: 'solarAB4Price', energyUse: 0, active: true }
                },
            },
            canFuseTech: '',
            fuseTo1: '',
            fuseTo2: '',
            fuseToRatio1: 0,
            fuseToRatio2: 0
        },
        hydrogen: {
            autoSell: false,
            nameResource: 'Hydrogen',
            screenName: 'hydrogen',
            saleValue: 0.02,
            salePreviewElement: 'sellHydrogenDescription',
            quantity: 0,
            rate: 0,
            usedForFuelPerSec: 0,
            storageCapacity: 150, 
            currentSecondaryIncreasePrice: 0,
            revealedYet: false,
            upgrades: {
                autoBuyer: {
                    currentTierLevel: 1,
                    normalProgression: true,
                    tier1: { nameUpgrade: 'Hydrogen Compressor', screen: 'hydrogen', place: 'hydrogenAutoBuyer1Row', price: 50, rate: 0.02, quantity: 0, setPrice: 'hydrogenAB1Price', energyUse: 0, active: true },
                    tier2: { nameUpgrade: 'Advanced Hydrogen Compressor', screen: 'hydrogen', place: 'hydrogenAutoBuyer2Row', price: 400, rate: 0.1, quantity: 0, setPrice: 'hydrogenAB2Price', energyUse: 0.03, active: true },
                    tier3: { nameUpgrade: 'Industrial Hydrogen Compressor', screen: 'hydrogen', place: 'hydrogenAutoBuyer3Row', price: 2000, rate: 0.5, quantity: 0, setPrice: 'hydrogenAB3Price', energyUse: 0.12, active: true },
                    tier4: { nameUpgrade: 'Quantum Hydrogen Compressor', screen: 'hydrogen', place: 'hydrogenAutoBuyer4Row', price: 10000, rate: 2.5, quantity: 0, setPrice: 'hydrogenAB4Price', energyUse: 0.6, active: true }                    
                },
            },
            canFuseTech: 'hydrogenFusion',
            fuseTo1: 'helium',
            fuseTo2: '',
            fuseToRatio1: 0.5,
            fuseToRatio2: 0
        },
        helium: {
            autoSell: false,
            nameResource: 'Helium',
            screenName: 'helium',
            saleValue: 0.03,
            salePreviewElement: 'sellHeliumDescription',
            quantity: 0,
            rate: 0,
            usedForFuelPerSec: 0,
            storageCapacity: 120,
            currentSecondaryIncreasePrice: 0,
            revealedYet: false,
            upgrades: {
                autoBuyer: {
                    currentTierLevel: 1,
                    normalProgression: true,
                    tier1: { nameUpgrade: 'Helium Extractor', screen: 'helium', place: 'heliumAutoBuyer1Row', price: 75, rate: 0.02, quantity: 0, setPrice: 'heliumAB1Price', energyUse: 0, active: true },
                    tier2: { nameUpgrade: 'Advanced Helium Extractor', screen: 'helium', place: 'heliumAutoBuyer2Row', price: 600, rate: 0.075, quantity: 0, setPrice: 'heliumAB2Price', energyUse: 0.03, active: true },
                    tier3: { nameUpgrade: 'Industrial Helium Extractor', screen: 'helium', place: 'heliumAutoBuyer3Row', price: 3000, rate: 0.375, quantity: 0, setPrice: 'heliumAB3Price', energyUse: 0.09, active: true },
                    tier4: { nameUpgrade: 'Quantum Helium Extractor', screen: 'helium', place: 'heliumAutoBuyer4Row', price: 15000, rate: 1.875, quantity: 0, setPrice: 'heliumAB4Price', energyUse: 0.45, active: true }                    
                }
            },
            canFuseTech: 'heliumFusion',
            fuseTo1: 'carbon',
            fuseTo2: '',
            fuseToRatio1: 0.3,
            fuseToRatio2: 0
        },
        carbon: {
            autoSell: false,
            nameResource: 'Carbon',
            screenName: 'carbon',
            saleValue: 0.1,
            salePreviewElement: 'sellCarbonDescription',
            quantity: 0,
            rate: 0,
            usedForFuelPerSec: 0,
            storageCapacity: 130,
            currentSecondaryIncreasePrice: 0,
            revealedYet: false,
            upgrades: {
                autoBuyer: {
                    currentTierLevel: 1,
                    normalProgression: true,
                    tier1: { nameUpgrade: 'Burner', screen: 'carbon', place: 'carbonAutoBuyer1Row', price: 80, rate: 0.02, quantity: 0, setPrice: 'carbonAB1Price', energyUse: 0, active: true },
                    tier2: { nameUpgrade: 'Advanced Carbon Extractor', screen: 'carbon', place: 'carbonAutoBuyer2Row', price: 640, rate: 0.1, quantity: 0, setPrice: 'carbonAB2Price', energyUse: 0.03, active: true },
                    tier3: { nameUpgrade: 'Industrial Carbon Extractor', screen: 'carbon', place: 'carbonAutoBuyer3Row', price: 3200, rate: 0.5, quantity: 0, setPrice: 'carbonAB3Price', energyUse: 0.12, active: true },
                    tier4: { nameUpgrade: 'Quantum Carbon Extractor', screen: 'carbon', place: 'carbonAutoBuyer4Row', price: 16000, rate: 2.5, quantity: 0, setPrice: 'carbonAB4Price', energyUse: 0.6, active: true }                    
                }
            },
            canFuseTech: 'carbonFusion',
            fuseTo1: 'neon',
            fuseTo2: 'sodium',
            fuseToRatio1: 0.3,
            fuseToRatio2: 0.2
        },    
        neon: {
            autoSell: false,
            nameResource: 'Neon',
            screenName: 'neon',
            saleValue: 0.40,
            salePreviewElement: 'sellNeonDescription',
            quantity: 0,
            rate: 0,
            usedForFuelPerSec: 0,
            storageCapacity: 200,
            currentSecondaryIncreasePrice: 0,
            revealedYet: false,
            upgrades: {
                autoBuyer: {
                    currentTierLevel: 0,
                    normalProgression: false,
                    tier1: { nameUpgrade: 'Neon Extractor', screen: 'neon', place: 'neonAutoBuyer1Row', price: 120, rate: 0.02, quantity: 0, setPrice: 'neonAB1Price', energyUse: 0, active: true },
                    tier2: { nameUpgrade: 'Advanced Neon Extractor', screen: 'neon', place: 'neonAutoBuyer2Row', price: 960, rate: 0.125, quantity: 0, setPrice: 'neonAB2Price', energyUse: 0.03, active: true },
                    tier3: { nameUpgrade: 'Industrial Neon Extractor', screen: 'neon', place: 'neonAutoBuyer3Row', price: 4800, rate: 0.625, quantity: 0, setPrice: 'neonAB3Price', energyUse: 0.15, active: true },
                    tier4: { nameUpgrade: 'Quantum Neon Extractor', screen: 'neon', place: 'neonAutoBuyer4Row', price: 24000, rate: 3.125, quantity: 0, setPrice: 'neonAB4Price', energyUse: 0.75, active: true }                    
                }
            },
            canFuseTech: 'neonFusion',
            fuseTo1: 'oxygen',
            fuseTo2: '',
            fuseToRatio1: 0.3,
            fuseToRatio2: 0
        },
        oxygen: {
            autoSell: false,
            nameResource: 'Oxygen',
            screenName: 'oxygen',
            saleValue: 0.05,
            salePreviewElement: 'sellOxygenDescription',
            quantity: 0,
            rate: 0,
            usedForFuelPerSec: 0,
            storageCapacity: 170,
            currentSecondaryIncreasePrice: 0,
            revealedYet: false,
            upgrades: {
                autoBuyer: {
                    currentTierLevel: 1,
                    normalProgression: true,
                    tier1: { nameUpgrade: 'Oxygen Extractor', screen: 'oxygen', place: 'oxygenAutoBuyer1Row', price: 140, rate: 0.02, quantity: 0, setPrice: 'oxygenAB1Price', energyUse: 0, active: true },
                    tier2: { nameUpgrade: 'Advanced Oxygen Extractor', screen: 'oxygen', place: 'oxygenAutoBuyer2Row', price: 1120, rate: 0.15, quantity: 0, setPrice: 'oxygenAB2Price', energyUse: 0.03, active: true },
                    tier3: { nameUpgrade: 'Industrial Oxygen Extractor', screen: 'oxygen', place: 'oxygenAutoBuyer3Row', price: 5600, rate: 0.75, quantity: 0, setPrice: 'oxygenAB3Price', energyUse: 0.18, active: true },
                    tier4: { nameUpgrade: 'Quantum Oxygen Extractor', screen: 'oxygen', place: 'oxygenAutoBuyer4Row', price: 28000, rate: 3.75, quantity: 0, setPrice: 'oxygenAB4Price', energyUse: 0.9, active: true }
                }
            },
            canFuseTech: 'oxygenFusion',
            fuseTo1: 'silicon',
            fuseTo2: '',
            fuseToRatio1: 0.2,
            fuseToRatio2: 0
        },
        silicon: {
            autoSell: false,
            nameResource: 'Silicon',
            screenName: 'silicon',
            saleValue: 0.08,
            salePreviewElement: 'sellSiliconDescription',
            quantity: 0,
            rate: 0,
            usedForFuelPerSec: 0,
            storageCapacity: 150,
            currentSecondaryIncreasePrice: 0,
            revealedYet: false,
            upgrades: {
                autoBuyer: {
                    currentTierLevel: 1,
                    normalProgression: true,
                    tier1: { nameUpgrade: 'Silicon Extractor', screen: 'silicon', place: 'siliconAutoBuyer1Row', price: 200, rate: 0.02, quantity: 0, setPrice: 'siliconAB1Price', energyUse: 0, active: true },
                    tier2: { nameUpgrade: 'Advanced Silicon Extractor', screen: 'silicon', place: 'siliconAutoBuyer2Row', price: 1600, rate: 0.175, quantity: 0, setPrice: 'siliconAB2Price', energyUse: 0.03, active: true },
                    tier3: { nameUpgrade: 'Industrial Silicon Extractor', screen: 'silicon', place: 'siliconAutoBuyer3Row', price: 8000, rate: 0.875, quantity: 0, setPrice: 'siliconAB3Price', energyUse: 0.21, active: true },
                    tier4: { nameUpgrade: 'Quantum Silicon Extractor', screen: 'silicon', place: 'siliconAutoBuyer4Row', price: 40000, rate: 4.375, quantity: 0, setPrice: 'siliconAB4Price', energyUse: 1.05, active: true }                    
                }
            },
            canFuseTech: 'siliconFusion',
            fuseTo1: 'iron',
            fuseTo2: '',
            fuseToRatio1: 0.2,
            fuseToRatio2: 0
        },
        iron: {
            autoSell: false,
            nameResource: 'Iron',
            screenName: 'iron',
            saleValue: 0.17,
            salePreviewElement: 'sellIronDescription',
            quantity: 0,
            rate: 0,
            usedForFuelPerSec: 0,
            storageCapacity: 180,
            currentSecondaryIncreasePrice: 0,
            revealedYet: false,
            upgrades: {
                autoBuyer: {
                    currentTierLevel: 1,
                    normalProgression: true,
                    tier1: { nameUpgrade: 'Iron Extractor', screen: 'iron', place: 'ironAutoBuyer1Row', price: 250, rate: 0.02, quantity: 0, setPrice: 'ironAB1Price', energyUse: 0, active: true },
                    tier2: { nameUpgrade: 'Advanced Iron Extractor', screen: 'iron', place: 'ironAutoBuyer2Row', price: 2000, rate: 0.2, quantity: 0, setPrice: 'ironAB2Price', energyUse: 0.03, active: true },
                    tier3: { nameUpgrade: 'Industrial Iron Extractor', screen: 'iron', place: 'ironAutoBuyer3Row', price: 10000, rate: 1, quantity: 0, setPrice: 'ironAB3Price', energyUse: 0.27, active: true },
                    tier4: { nameUpgrade: 'Quantum Iron Extractor', screen: 'iron', place: 'ironAutoBuyer4Row', price: 50000, rate: 5, quantity: 0, setPrice: 'ironAB4Price', energyUse: 1.35, active: true }                    
                }
            },
            canFuseTech: '',
            fuseTo1: '',
            fuseTo2: '',
            fuseToRatio1: 0.3,
            fuseToRatio2: 0
        },
        sodium: {
            autoSell: false,
            nameResource: 'Sodium',
            screenName: 'sodium',
            saleValue: 0.1,
            salePreviewElement: 'sellSodiumDescription',
            quantity: 0,
            rate: 0,
            usedForFuelPerSec: 0,
            storageCapacity: 200,
            currentSecondaryIncreasePrice: 0,
            revealedYet: false,
            upgrades: {
                autoBuyer: {
                    currentTierLevel: 1,
                    normalProgression: true,
                    tier1: { nameUpgrade: 'Sodium Extractor', screen: 'sodium', place: 'sodiumAutoBuyer1Row', price: 300, rate: 0.02, quantity: 0, setPrice: 'sodiumAB1Price', energyUse: 0, active: true },
                    tier2: { nameUpgrade: 'Advanced Sodium Extractor', screen: 'sodium', place: 'sodiumAutoBuyer2Row', price: 2400, rate: 0.25, quantity: 0, setPrice: 'sodiumAB2Price', energyUse: 0.03, active: true },
                    tier3: { nameUpgrade: 'Industrial Sodium Extractor', screen: 'sodium', place: 'sodiumAutoBuyer3Row', price: 12000, rate: 1.25, quantity: 0, setPrice: 'sodiumAB3Price', energyUse: 0.24, active: true },
                    tier4: { nameUpgrade: 'Quantum Sodium Extractor', screen: 'sodium', place: 'sodiumAutoBuyer4Row', price: 60000, rate: 6.25, quantity: 0, setPrice: 'sodiumAB4Price', energyUse: 1.2, active: true }                    
                }
            },
            canFuseTech: '',
            fuseTo1: '',
            fuseTo2: '',
            fuseToRatio1: 0.5,
            fuseToRatio2: 0
        }
    },
    compounds: {
        diesel: {
            autoSell: false,
            nameResource: 'Diesel',
            screenName: 'diesel',
            saleValue: 0.3,
            salePreviewElement: 'sellDieselDescription',
            createPreviewElement: 'createDieselDescription',
            quantity: 0,
            rate: 0,
            usedForFuelPerSec: 0,
            storageCapacity: 500,
            currentSecondaryIncreasePrice: 0,
            upgrades: {
                autoBuyer: {
                    currentTierLevel: 0,
                    normalProgression: true,
                    tier1: { nameUpgrade: 'Backyard Extractor', screen: 'diesel', place: 'dieselAutoBuyer1Row', price: 50000, rate: 0.02, quantity: 0, setPrice: 'dieselAB1Price', energyUse: 0, active: true },
                    tier2: { nameUpgrade: 'Advanced Extractor', screen: 'diesel', place: 'dieselAutoBuyer2Row', price: 400000, rate: 0.1, quantity: 0, setPrice: 'dieselAB2Price', energyUse: 0.03, active: true },
                    tier3: { nameUpgrade: 'Industrial Extractor', screen: 'diesel', place: 'dieselAutoBuyer3Row', price: 2000000, rate: 0.5, quantity: 0, setPrice: 'dieselAB3Price', energyUse: 0.12, active: true },
                    tier4: { nameUpgrade: 'Quantum Extractor', screen: 'diesel', place: 'dieselAutoBuyer4Row', price: 10000000, rate: 2.5, quantity: 0, setPrice: 'dieselAB4Price', energyUse: 0.6, active: true }
                },
            },
            revealedBy: 'hydroCarbons',
            canCreateTech: 'compounds',
            createsFrom1: ['hydrogen', 'resources'],
            createsFrom2: ['carbon', 'resources'],
            createsFrom3: '',
            createsFrom4: '',
            createsFromRatio1: 26,
            createsFromRatio2: 12,
            createsFromRatio3: 0,
            createsFromRatio4: 0
        },        
        glass: {
            autoSell: false,
            nameResource: 'Glass',
            screenName: 'glass',
            saleValue: 0.8,
            salePreviewElement: 'sellGlassDescription',
            createPreviewElement: 'createGlassDescription',
            quantity: 0,
            rate: 0,
            usedForFuelPerSec: 0,
            storageCapacity: 200,
            currentSecondaryIncreasePrice: 0,
            upgrades: {
                autoBuyer: {
                    currentTierLevel: 0,
                    normalProgression: true,
                    tier1: { nameUpgrade: 'Workshop Glass Fabricator', screen: 'glass', place: 'glassAutoBuyer1Row', price: 70000, rate: 0.02, quantity: 0, setPrice: 'glassAB1Price', energyUse: 0, active: true },
                    tier2: { nameUpgrade: 'Small Glass Factory', screen: 'glass', place: 'glassAutoBuyer2Row', price: 600000, rate: 0.08, quantity: 0, setPrice: 'glassAB2Price', energyUse: 0.08, active: true },
                    tier3: { nameUpgrade: 'Medium Glass Factory', screen: 'glass', place: 'glassAutoBuyer3Row', price: 2500000, rate: 0.4, quantity: 0, setPrice: 'glassAB3Price', energyUse: 0.31, active: true },
                    tier4: { nameUpgrade: 'Large Glass Factory', screen: 'glass', place: 'glassAutoBuyer4Row', price: 1250000, rate: 1.5, quantity: 0, setPrice: 'glassAB4Price', energyUse: 1.5, active: true }
                },
            },
            revealedBy: 'glassManufacture',
            canCreateTech: 'compounds',
            createsFrom1: ['silicon', 'resources'],
            createsFrom2: ['oxygen', 'resources'],
            createsFrom3: ['sodium', 'resources'],
            createsFrom4: '',
            createsFromRatio1: 4,
            createsFromRatio2: 2,
            createsFromRatio3: 1,
            createsFromRatio4: 0
        },
        steel: {
            autoSell: false,
            nameResource: 'Steel',
            screenName: 'steel',
            saleValue: 1.8,
            salePreviewElement: 'sellSteelDescription',
            createPreviewElement: 'createSteelDescription',
            quantity: 0,
            rate: 0,
            usedForFuelPerSec: 0,
            storageCapacity: 250,
            currentSecondaryIncreasePrice: 0,
            upgrades: {
                autoBuyer: {
                    currentTierLevel: 0,
                    normalProgression: true,
                    tier1: { nameUpgrade: 'Workshop Steel Fabricator', screen: 'steel', place: 'steelAutoBuyer1Row', price: 80000, rate: 0.02, quantity: 0, setPrice: 'steelAB1Price', energyUse: 0, active: true },
                    tier2: { nameUpgrade: 'Small Steel Factory', screen: 'steel', place: 'steelAutoBuyer2Row', price: 700000, rate: 0.1, quantity: 0, setPrice: 'steelAB2Price', energyUse: 0.1, active: true },
                    tier3: { nameUpgrade: 'Medium Steel Factory', screen: 'steel', place: 'steelAutoBuyer3Row', price: 3000000, rate: 0.5, quantity: 0, setPrice: 'steelAB3Price', energyUse: 0.35, active: true },
                    tier4: { nameUpgrade: 'Large Steel Factory', screen: 'steel', place: 'steelAutoBuyer4Row', price: 1500000, rate: 2, quantity: 0, setPrice: 'steelAB4Price', energyUse: 1.8, active: true }
                },
            },
            revealedBy: 'steelFoundries',
            canCreateTech: 'compounds',
            createsFrom1: ['iron', 'resources'],
            createsFrom2: ['carbon', 'resources'],
            createsFrom3: '',
            createsFrom4: '',
            createsFromRatio1: 4,
            createsFromRatio2: 1,
            createsFromRatio3: 0,
            createsFromRatio4: 0
        },
        concrete: {
            autoSell: false,
            nameResource: 'Concrete',
            screenName: 'concrete',
            saleValue: 0.8,
            salePreviewElement: 'sellConcreteDescription',
            createPreviewElement: 'createConcreteDescription',
            quantity: 0,
            rate: 0,
            usedForFuelPerSec: 0,
            storageCapacity: 50,
            currentSecondaryIncreasePrice: 15,
            upgrades: {
                autoBuyer: {
                    currentTierLevel: 0,
                    normalProgression: true,
                    tier1: { nameUpgrade: 'Back Yard Concrete Mixer', screen: 'concrete', place: 'concreteAutoBuyer1Row', price: 95000, rate: 0.01, quantity: 0, setPrice: 'concreteAB1Price', energyUse: 0, active: true },
                    tier2: { nameUpgrade: 'Small Concrete Factory', screen: 'concrete', place: 'concreteAutoBuyer2Row', price: 800000, rate: 0.08, quantity: 0, setPrice: 'concreteAB2Price', energyUse: 0.2, active: true },
                    tier3: { nameUpgrade: 'Medium Concrete Factory', screen: 'concrete', place: 'concreteAutoBuyer3Row', price: 4200000, rate: 0.5, quantity: 0, setPrice: 'concreteAB3Price', energyUse: 0.7, active: true },
                    tier4: { nameUpgrade: 'Large Concrete Factory', screen: 'concrete', place: 'concreteAutoBuyer4Row', price: 1800000, rate: 2, quantity: 0, setPrice: 'concreteAB4Price', energyUse: 3.6, active: true }
                },
            },
            revealedBy: 'aggregateMixing',
            canCreateTech: 'compounds',
            createsFrom1: ['silicon', 'resources'],
            createsFrom2: ['sodium', 'resources'],
            createsFrom3: ['hydrogen', 'resources'],
            createsFrom4: '',
            createsFromRatio1: 5,
            createsFromRatio2: 2,
            createsFromRatio3: 3,
            createsFromRatio4: 0
        },
        water: {
            autoSell: false,
            nameResource: 'Water',
            screenName: 'water',
            saleValue: 1.6,
            salePreviewElement: 'sellWaterDescription',
            createPreviewElement: 'createWaterDescription',
            quantity: 0,
            rate: 0,
            usedForFuelPerSec: 0,
            storageCapacity: 100,
            currentSecondaryIncreasePrice: 0,
            upgrades: {
                autoBuyer: {
                    currentTierLevel: 0,
                    normalProgression: false,
                    tier1: { nameUpgrade: 'Basic Water Pump', screen: 'water', place: 'waterAutoBuyer1Row', price: 95000, rate: 0.02, quantity: 0, setPrice: 'waterAB1Price', energyUse: 0, active: true },
                    tier2: { nameUpgrade: 'Small Water Treatment Plant', screen: 'water', place: 'waterAutoBuyer2Row', price: 800000, rate: 0.08, quantity: 0, setPrice: 'waterAB2Price', energyUse: 0.2, active: true },
                    tier3: { nameUpgrade: 'Medium Water Treatment Plant', screen: 'water', place: 'waterAutoBuyer3Row', price: 4200000, rate: 0.5, quantity: 0, setPrice: 'waterAB3Price', energyUse: 0.7, active: true },
                    tier4: { nameUpgrade: 'Large Water Treatment Plant', screen: 'water', place: 'waterAutoBuyer4Row', price: 1800000, rate: 2, quantity: 0, setPrice: 'waterAB4Price', energyUse: 3.6, active: true }
                },
            },
            revealedBy: 'neonFusion',
            canCreateTech: 'compounds',
            createsFrom1: ['hydrogen', 'resources'],
            createsFrom2: ['oxygen', 'resources'],
            createsFrom3: '',
            createsFrom4: '',
            createsFromRatio1: 20,
            createsFromRatio2: 10,
            createsFromRatio3: 0,
            createsFromRatio4: 0
        },
        titanium: {
            autoSell: false,
            nameResource: 'Titanium',
            screenName: 'titanium',
            saleValue: 6,
            salePreviewElement: 'sellTitaniumDescription',
            createPreviewElement: 'createTitaniumDescription',
            quantity: 0,
            rate: 0,
            usedForFuelPerSec: 0,
            storageCapacity: 50,
            currentSecondaryIncreasePrice: 15,
            upgrades: {
                autoBuyer: {
                    currentTierLevel: 0,
                    normalProgression: true,
                    tier1: { nameUpgrade: 'Basic Titanium Smelter', screen: 'titanium', place: 'titaniumAutoBuyer1Row', price: 105000, rate: 0.01, quantity: 0, setPrice: 'titaniumAB1Price', energyUse: 0, active: true },
                    tier2: { nameUpgrade: 'Small Titanium Factory', screen: 'titanium', place: 'titaniumAutoBuyer2Row', price: 850000, rate: 0.08, quantity: 0, setPrice: 'titaniumAB2Price', energyUse: 0.4, active: true },
                    tier3: { nameUpgrade: 'Medium Titanium Factory', screen: 'titanium', place: 'titaniumAutoBuyer3Row', price: 4800000, rate: 0.5, quantity: 0, setPrice: 'titaniumAB3Price', energyUse: 1.3, active: true },
                    tier4: { nameUpgrade: 'Large Titanium Factory', screen: 'titanium', place: 'titaniumAutoBuyer4Row', price: 1880000, rate: 2, quantity: 0, setPrice: 'titaniumAB4Price', energyUse: 5.1, active: true }
                },
            },
            revealedBy: 'neutronCapture',
            canCreateTech: 'compounds',
            createsFrom1: ['iron', 'resources'],
            createsFrom2: ['sodium', 'resources'],
            createsFrom3: ['neon', 'resources'],
            createsFrom4: '',
            createsFromRatio1: 22,
            createsFromRatio2: 18,
            createsFromRatio3: 40,
            createsFromRatio4: 0
        }                                 
    },
    buildings: {
        energy: {
            batteryBoughtYet: false,
            nameResource: 'Energy',
            screenName: 'energy',
            saleValue: 0,
            salePreviewElement: 'sellEnergyDescription',
            quantity: 0,
            rate: 0,
            consumption: 0,
            storageCapacity: 0,
            upgrades: {
                powerPlant1: { 
                    revealedBy: 'basicPowerGeneration',
                    price: 300,
                    resource1Price: [100, 'carbon', 'resources'],
                    resource2Price: [0, '', ''],
                    resource3Price: [0, '', ''],
                    rate: 0.05,
                    quantity: 0, 
                    setPrice: 'powerPlant1Price',
                    fuel: ['carbon', 0.03, 'resources'],
                    purchasedRate: 0,
                    maxPurchasedRate: 0,
                    weatherAffects: false,
                },
                powerPlant2: {
                    revealedBy: 'solarPowerGeneration',
                    price: 1200,
                    resource1Price: [150, 'glass', 'compounds'],
                    resource2Price: [200, 'steel', 'compounds'],
                    resource3Price: [0, '', ''],
                    rate: 0.2,
                    quantity: 0, 
                    setPrice: 'powerPlant2Price',
                    fuel: ['solar', 0, 'resources'],
                    purchasedRate: 0,
                    maxPurchasedRate: 0,
                    weatherAffects: true,
                },
                powerPlant3: {
                    revealedBy: 'advancedPowerGeneration',
                    price: 800,
                    resource1Price: [0, '', ''],
                    resource2Price: [0, '', ''],
                    resource3Price: [0, '', ''],
                    rate: 0.35,
                    quantity: 0, 
                    setPrice: 'powerPlant3Price',
                    fuel: ['diesel', 0.01, 'compounds'],
                    purchasedRate: 0,
                    maxPurchasedRate: 0,
                    weatherAffects: false,
                },
                battery1: {
                    price: 5000,
                    resource1Price: [500, 'sodium', 'resources'],
                    resource2Price: [1000, 'carbon', 'resources'],
                    resource3Price: [0, '', ''],
                    capacity: 15000,
                    quantity: 0, 
                    setPrice: 'battery1Price'
                },
                battery2: {
                    price: 50000,
                    resource1Price: [0, '', ''],
                    resource2Price: [0, '', ''],
                    resource3Price: [0, '', ''],
                    capacity: 150000,
                    quantity: 0, 
                    setPrice: 'battery2Price'
                },
                battery3: {
                    price: 500000,
                    resource1Price: [0, '', ''],
                    resource2Price: [0, '', ''],
                    resource3Price: [0, '', ''],
                    capacity: 1500000,
                    quantity: 0, 
                    setPrice: 'battery3Price'
                }
            }
        }
    },
    space: {
        upgrades: {
            spaceTelescope: { 
                spaceTelescopeBoughtYet: false,
                price: 10000,
                resource1Price: [20000, 'iron', 'resources'],
                resource2Price: [15000, 'glass', 'compounds'],
                resource3Price: [20000, 'silicon', 'resources'],
                energyUseSearchAsteroid: 0.4,
                energyUseInvestigateStar: 0.7,
            },
            launchPad: { 
                launchPadBoughtYet: false,
                price: 40000,
                resource1Price: [10000, 'iron', 'resources'],
                resource2Price: [1000, 'titanium', 'compounds'],
                resource3Price: [20000, 'concrete', 'compounds'],
            },
            rocket1: {
                builtParts: 0,
                parts: 15,
                price: 1000,
                resource1Price: [1000, 'glass', 'compounds'],
                resource2Price: [1000, 'titanium', 'compounds'],
                resource3Price: [3000, 'steel', 'compounds'],
                setPrice: 'rocket1Price',
                fuelQuantity: 0,
                fuelQuantityToLaunch: 10000, //10000
                autoBuyer: {
                    currentTierLevel: 1,
                    normalProgression: false,
                    tier1: { nameUpgrade: 'Fuel', screen: 'rocket1', place: 'rocket1Autobuyer1Row', price: 5000, rate: 0.02, quantity: 0, setPrice: 'rocket1AB1Price', energyUse: 0.7 },
                },
            },
            rocket2: {
                builtParts: 0,
                parts: 20,
                price: 1000,
                resource1Price: [1000, 'glass', 'compounds'],
                resource2Price: [1000, 'titanium', 'compounds'],
                resource3Price: [3000, 'steel', 'compounds'],
                setPrice: 'rocket2Price',
                fuelQuantity: 0,
                fuelQuantityToLaunch: 12000,
                autoBuyer: {
                    currentTierLevel: 1,
                    normalProgression: false,
                    tier1: { nameUpgrade: 'Fuel', screen: 'rocket2', place: 'rocket2Autobuyer1Row', price: 6000, rate: 0.02, quantity: 0, setPrice: 'rocket2AB1Price', energyUse: 0.8 },
                },
            },
            rocket3: {
                builtParts: 0,
                parts: 25,
                price: 1000,
                resource1Price: [1000, 'glass', 'compounds'],
                resource2Price: [1000, 'titanium', 'compounds'],
                resource3Price: [3000, 'steel', 'compounds'],
                setPrice: 'rocket3Price',
                fuelQuantity: 0,
                fuelQuantityToLaunch: 14000,
                autoBuyer: {
                    currentTierLevel: 1,
                    normalProgression: false,
                    tier1: { nameUpgrade: 'Fuel', screen: 'rocket3', place: 'rocket3Autobuyer1Row', price: 7000, rate: 0.02, quantity: 0, setPrice: 'rocket3AB1Price', energyUse: 0.9 },
                },
            },
            rocket4: {
                builtParts: 0,
                parts: 30,
                price: 1000,
                resource1Price: [1000, 'glass', 'compounds'],
                resource2Price: [1000, 'titanium', 'compounds'],
                resource3Price: [3000, 'steel', 'compounds'],
                setPrice: 'rocket4Price',
                fuelQuantity: 0,
                fuelQuantityToLaunch: 16000,
                autoBuyer: {
                    currentTierLevel: 1,
                    normalProgression: false,
                    tier1: { nameUpgrade: 'Fuel', screen: 'rocket4', place: 'rocket4Autobuyer1Row', price: 8000, rate: 0.02, quantity: 0, setPrice: 'rocket4AB1Price', energyUse: 1.0 },
                },
            },
            ssStructural: {
                finished: false,
                builtParts: 0,
                parts: 20,
                price: 3000,
                resource1Price: [4000, 'steel', 'compounds'],
                resource2Price: [1500, 'titanium', 'compounds'],
                resource3Price: [4500, 'silicon', 'resources'],
                setPrice: 'ssStructuralPrice',
            },
            ssLifeSupport: {
                finished: false,
                builtParts: 0,
                parts: 10,
                price: 7500,
                resource1Price: [5000, 'glass', 'compounds'],
                resource2Price: [20000, 'oxygen', 'resources'],
                resource3Price: [15000, 'water', 'compounds'],
                setPrice: 'ssLifeSupportPrice',
            },
            ssAntimatterEngine: {
                finished: false,
                builtParts: 0,
                parts: 16,
                price: 6000,
                resource1Price: [3500, 'steel', 'compounds'],
                resource2Price: [2000, 'titanium', 'compounds'],
                resource3Price: [10000, 'neon', 'resources'],
                setPrice: 'ssAntimatterEnginePrice',
            },
            ssFleetHangar: {
                finished: false,
                builtParts: 0,
                parts: 1,
                price: 50000,
                resource1Price: [40000, 'glass', 'compounds'],
                resource2Price: [20000, 'titanium', 'compounds'],
                resource3Price: [80000, 'steel', 'compounds'],
                setPrice: 'ssFleetHangarPrice'
            },
            ssStellarScanner: {
                finished: false,
                builtParts: 0,
                parts: 8,
                price: 2500,
                resource1Price: [1500, 'glass', 'compounds'],
                resource2Price: [2000, 'silicon', 'resources'],
                resource3Price: [3000, 'neon', 'resources'],
                setPrice: 'ssStellarScannerPrice'
            },
            fleetEnvoy: {
                envoyBuiltYet: false,
                maxCanBuild: 1,
                quantity: 0,
                price: 2000,
                resource1Price: [8000, 'hydrogen', 'resources'],
                resource2Price: [300, 'silicon', 'resources'],
                resource3Price: [120, 'titanium', 'compounds'],
                setPrice: 'fleetEnvoyPrice',
                bonusPercentage: null,
                baseAttackStrength: 0,
                bonusAgainstType: null,
                bonusAgainstTrait: null,
                defenseStrength: 0,
                joinsAttackDefense: false
            },
            fleetScout: {
                maxCanBuild: 100000,
                quantity: 0,
                price: 5000,
                resource1Price: [14000, 'hydrogen', 'resources'],
                resource2Price: [1000, 'silicon', 'resources'],
                resource3Price: [300, 'titanium', 'compounds'],
                setPrice: 'fleetScoutPrice',
                bonusPercentage: 10,
                baseAttackStrength: 2,
                bonusGivenAgainstType: 'air',
                bonusRemovedBy: 'Aerialians',
                defenseStrength: 2,
                joinsAttackDefense: true,
                speed: 5
            },
            fleetMarauder: {
                maxCanBuild: 100000,
                quantity: 0,
                price: 7500,
                resource1Price: [14000, 'helium', 'resources'],
                resource2Price: [2000, 'silicon', 'resources'],
                resource3Price: [600, 'titanium', 'compounds'],
                setPrice: 'fleetMarauderPrice',
                bonusPercentage: 15,
                baseAttackStrength: 4,
                bonusGivenAgainstType: 'air',
                bonusRemovedBy: 'Aerialians',
                defenseStrength: 3,
                joinsAttackDefense: true,
                speed: 4
            },
            fleetLandStalker: {
                maxCanBuild: 100000,
                quantity: 0,
                price: 9000,
                resource1Price: [22000, 'helium', 'resources'],
                resource2Price: [3000, 'silicon', 'resources'],
                resource3Price: [900, 'titanium', 'compounds'],
                setPrice: 'fleetLandStalkerPrice',
                bonusPercentage: 20,
                baseAttackStrength: 4,
                bonusGivenAgainstType: 'land',
                bonusRemovedBy: 'Terrans',
                defenseStrength: 0,
                joinsAttackDefense: true,
                speed: 2
            },
            fleetNavalStrafer: {
                maxCanBuild: 100000,
                quantity: 0,
                price: 8000,
                resource1Price: [26000, 'hydrogen', 'resources'],
                resource2Price: [4000, 'silicon', 'resources'],
                resource3Price: [1200, 'titanium', 'compounds'],
                setPrice: 'fleetNavalStraferPrice',
                bonusPercentage: 15,
                baseAttackStrength: 6,
                bonusGivenAgainstType: 'sea',
                bonusRemovedBy: 'Aquatic',
                defenseStrength: 0,
                joinsAttackDefense: true,
                speed: 1
            }
        }
    },
    research: {
        screenName: 'research',
        quantity: 50,
        rate: 0,
        ratePower: 0,
        upgrades: {
            scienceKit: { 
                active: true,
                price: 5,
                resource1Price: [0, '', ''],
                resource2Price: [0, '', ''],
                resource3Price: [0, '', ''],
                rate: 0.005,
                quantity: 0, 
                setPrice: 'scienceKitPrice',
                energyUse: 0
            },
            scienceClub: { 
                active: true,
                price: 200,
                resource1Price: [0, '', ''],
                resource2Price: [0, '', ''],
                resource3Price: [0, '', ''],
                rate: 0.08,
                quantity: 0, 
                setPrice: 'scienceClubPrice',
                energyUse: 0
            },
            scienceLab: { 
                active: true,
                price: 1500,
                resource1Price: [0, '', ''],
                resource2Price: [0, '', ''],
                resource3Price: [0, '', ''],
                rate: 0.2,
                quantity: 0, 
                setPrice: 'scienceLabPrice',
                energyUse: 0.5
            }
        }
    },    
    techs: {
        knowledgeSharing: { appearsAt: [0, null, null], prereqs: [null], price: 150, idForRenderPosition: 10 },
        fusionTheory: { appearsAt: [500, "knowledgeSharing", ""], prereqs: ['Knowledge Sharing'], price: 750, idForRenderPosition: 20 },
        hydrogenFusion: { appearsAt: [1000, "fusionTheory", ""], prereqs: ['Fusion Theory'], price: 1150, idForRenderPosition: 30 },
        heliumFusion: { appearsAt: [2000, "hydrogenFusion", ""], prereqs: ['Hydrogen Fusion'], price: 2300, idForRenderPosition: 40 },
        carbonFusion: { appearsAt: [4100, "nobleGasCollection", ""], prereqs: ['Noble Gas Collection'], price: 4300, idForRenderPosition: 50 },
        basicPowerGeneration: { appearsAt: [3000, "heliumFusion", ""], prereqs: ['Helium Fusion'], price: 4200, idForRenderPosition: 51 },
        sodiumIonPowerStorage: { appearsAt: [5000, "basicPowerGeneration", ""], prereqs: ['Basic Power Generation'], price: 7000, idForRenderPosition: 52 },
        solarPowerGeneration: { appearsAt: [12000, "steelFoundries", "glassManufacture"], prereqs: ['Steel Foundries', 'Glass Manufacture'], price: 15000, idForRenderPosition: 53 },
        giganticTurbines: { appearsAt: [4200, "hydroCarbons", ""], prereqs: ['HydroCarbons'], price: 4800, idForRenderPosition: 54 },
        advancedPowerGeneration: { appearsAt: [6000, "giganticTurbines", "basicPowerGeneration"], prereqs: ['Gigantic Turbines', 'Basic Power Generation'], price: 8000, idForRenderPosition: 55 },
        rocketComposites: { appearsAt: [28000, "neutronCapture", "nanoTubeTechnology", "steelFoundries"], prereqs: ['Neutron Capture', 'Nano Tube Technology', 'Steel Foundries'], price: 34000, idForRenderPosition: 56 },
        advancedFuels: { appearsAt: [25000, "hydroCarbons", "neutronCapture", "advancedPowerGeneration"], prereqs: ['HydroCarbons', 'Neutron Capture', 'Advanced Power Generation'], price: 30000, idForRenderPosition: 57 },
        planetaryNavigation: { appearsAt: [27000, "atmosphericTelescopes", "rocketComposites", "quantumComputing"], prereqs: ['Atmospheric Telescopes', 'Rocket Composites', 'Quantum Computing'], price: 29000, idForRenderPosition: 58 },
        neonFusion: { appearsAt: [5000, "carbonFusion", ""], prereqs: ['Carbon Fusion'], price: 5750, idForRenderPosition: 60 },
        oxygenFusion: { appearsAt: [7000, "neonFusion", ""], prereqs: ['Neon Fusion'], price: 8000, idForRenderPosition: 70 },
        compounds: { appearsAt: [8000, "hydrogenFusion", "carbonFusion"], prereqs: ['Hydrogen Fusion', 'Carbon Fusion'], price: 9000, idForRenderPosition: 70 },
        siliconFusion: { appearsAt: [10000, "oxygenFusion", ""], prereqs: ['Oxygen Fusion'], price: 11500, idForRenderPosition: 80 },
        aggregateMixing: { appearsAt: [12000, "siliconFusion", ""], prereqs: ['Silicon Fusion'], price: 13000, idForRenderPosition: 81 },
        steelFoundries: { appearsAt: [11500, "siliconFusion", ""], prereqs: ['Silicon Fusion'], price: 13000, idForRenderPosition: 82 },
        nanoTubeTechnology: { appearsAt: [3500, "heliumFusion", ""], prereqs: ['Helium Fusion'], price: 4000, idForRenderPosition: 499 },
        nanoBrokers: { appearsAt: [18000, "nanoTubeTechnology", "steelFoundries", "compounds"], prereqs: ['Nano Tube Technology', 'Steel Foundries', 'Compounds'], price: 19000, idForRenderPosition: 498 },
        hydroCarbons: { appearsAt: [3200, "basicPowerGeneration", ""], prereqs: ['Basic Power Generation'], price: 3800, idForRenderPosition: 500 },
        stellarCartography: { appearsAt: [700, null], prereqs: [null], price: 800, idForRenderPosition: 510 },
        quantumComputing: { appearsAt: [3500, "nanoTubeTechnology", ""], prereqs: ['Nano Tube Technology'], price: 5750, idForRenderPosition: 520 },
        scienceLaboratories: { appearsAt: [5750, "quantumComputing", ""], prereqs: ['Quantum Computing'], price: 7000, idForRenderPosition: 521 },
        nobleGasCollection: { appearsAt: [4000, "nanoTubeTechnology", ""], prereqs: ['Nano Tube Technology'], price: 4500, idForRenderPosition: 530 },
        neutronCapture: { appearsAt: [20000, "siliconFusion", ""], prereqs: ['Silicon Fusion'], price: 23000, idForRenderPosition: 600 },
        glassManufacture: { appearsAt: [8000, "oxygenFusion", ""], prereqs: ['Oxygen Fusion'], price: 9000, idForRenderPosition: 700 },
        atmosphericTelescopes: { appearsAt: [9000, "glassManufacture", "stellarCartography"], prereqs: ['Glass Manufacture', 'Stellar Cartography'], price: 10000, idForRenderPosition: 700 },
        fusionEfficiencyI: { appearsAt: [1500, "fusionTheory", ""], prereqs: ['Fusion Theory'], price: 1750, idForRenderPosition: 9000 },
        fusionEfficiencyII: { appearsAt: [3000, "fusionEfficiencyI", ""], prereqs: ['Fusion Efficiency I'], price: 3500, idForRenderPosition: 9010 },
        fusionEfficiencyIII: { appearsAt: [9000, "fusionEfficiencyII", ""], prereqs: ['Fusion Efficiency II'], price: 10000, idForRenderPosition: 9030 },
        orbitalConstruction: { appearsAt: [45000, "planetaryNavigation", "rocketComposites", ""], prereqs: ['Planetary Navigation', 'Rocket Composites'], price: 50000, idForRenderPosition: 9100 },
        antimatterEngines: { appearsAt: [65000, "orbitalConstruction", "neutronCapture", "FTLTravelTheory"], prereqs: ['Orbital Construction', 'Neutron Capture', 'FTL Travel Theory'], price: 78000, idForRenderPosition: 9101 },
        FTLTravelTheory: { appearsAt: [60000, "neutronCapture", "planetaryNavigation", "advancedFuels"], prereqs: ['Neutron Capture', 'Planetary Navigation', 'Advanced Fuels'], price: 65000, idForRenderPosition: 9102 },
        lifeSupportSystems: { appearsAt: [55000, "orbitalConstruction", "nanoTubeTechnology", "quantumComputing"], prereqs: ['Orbital Construction', 'Nano Tube Technology', 'Quantum Computing'], price: 60000, idForRenderPosition: 9103 },
        starshipFleets: { appearsAt: [80000, "FTLTravelTheory", "antimatterEngines", "orbitalConstruction"], prereqs: ['FTL Travel Theory', 'Antimatter Engines', 'Orbital Construction'], price: 100000, idForRenderPosition: 9104 },
        stellarScanners: { appearsAt: [70000, "FTLTravelTheory", "orbitalConstruction"], prereqs: ['FTL Travel Theory', 'Orbital Construction'], price: 72000, idForRenderPosition: 9105 }
    },    
    currency: {
        cash: 10,
    },
    antimatter: {
        quantity: 0,
        rate: 0,
        storageCapacity: 100000
    },
    ascendencyPoints: {
        quantity: 0,
    },
    fleets: {
        attackPower: 0,
        defensePower: 0
    }
};

export let starSystems = {
    version: 0.62,
    stars: {
        spica: {
            mapSize: 5.504440179536064, //might need to add this to star object when added dynamically for after rebirth
            startingStar: true,
            starCode: 'SPC',
            precipitationResourceCategory: 'compounds',
            precipitationType: 'water',
            weather: {
                sunny: [30, '☀', 1, 'green-ready-text'],
                cloudy: [47, '☁', 0.6, 'warning-orange-text'],
                rain: [20, '☂', 0.4, 'warning-orange-text'],
                volcano: [3, '⛰', 0.05, 'red-disabled-text']
            }
        }
    }
};

export let galacticMarket = {
    version: 0.62,
    resources: {
        hydrogen: { 
            name: "Hydrogen", 
            baseValue: 0.02, 
            marketBias: 0,
            tradeVolume: 100000,
            eventModifier: 0 
        },
        helium: { 
            name: "Helium", 
            baseValue: 0.01, 
            marketBias: 0, 
            tradeVolume: 100000,
            eventModifier: 0 
        },
        carbon: { 
            name: "Carbon", 
            baseValue: 0.1, 
            marketBias: 0,
            tradeVolume: 100000,
            eventModifier: 0 
        },
        neon: { 
            name: "Neon", 
            baseValue: 0.06, 
            marketBias: 0, 
            tradeVolume: 100000,
            eventModifier: 0 
        },
        oxygen: { 
            name: "Oxygen", 
            baseValue: 0.05, 
            marketBias: 0, 
            tradeVolume: 100000,
            eventModifier: 0 
        },
        silicon: { 
            name: "Silicon", 
            baseValue: 0.08, 
            marketBias: 0, 
            tradeVolume: 100000,
            eventModifier: 0 
        },
        iron: { 
            name: "Iron", 
            baseValue: 0.12, 
            marketBias: 0, 
            tradeVolume: 100000,
            eventModifier: 0 
        },
        sodium: { 
            name: "Sodium", 
            baseValue: 0.10, 
            marketBias: 0, 
            tradeVolume: 100000,
            eventModifier: 0 
        }
    },
    compounds: {
        water: { 
            name: "Water", 
            baseValue: 0.08, 
            marketBias: 0, 
            tradeVolume: 100000,
            eventModifier: 0 
        },
        diesel: { 
            name: "Diesel", 
            baseValue: 0.2, 
            marketBias: 0, 
            tradeVolume: 100000,
            eventModifier: 0 
        },
        glass: { 
            name: "Glass", 
            baseValue: 0.8, 
            marketBias: 0, 
            tradeVolume: 100000,
            eventModifier: 0 
        },
        steel: { 
            name: "Steel", 
            baseValue: 1.2, 
            marketBias: 0, 
            tradeVolume: 100000,
            eventModifier: 0 
        },
        concrete: { 
            name: "Concrete", 
            baseValue: 0.8, 
            marketBias: 0, 
            tradeVolume: 100000,
            eventModifier: 0 
        },
        titanium: { 
            name: "Titanium", 
            baseValue: 6, 
            marketBias: 0, 
            tradeVolume: 100000,
            eventModifier: 0 
        }
    }
};

export let ascendencyBuffs = {
    version: 0.62,
    "efficientStorage": {  //done
        name: "Efficient Storage",
        description: "buffEfficientStorageRow",
        rebuyable: true,
        rebuyableIncreaseMultiple: 2,
        baseCostAp: 10,
        effectCategoryMagnitude: 2,
        boughtYet: 0,
        timesRebuyable: 3
    },
    "smartAutoBuyers": {  //done
        name: "Smart Auto Buyers",
        description: "buffSmartAutoBuyersRow",
        rebuyable: true,
        rebuyableIncreaseMultiple: 2,
        baseCostAp: 15,
        effectCategoryMagnitude: 1.5,
        boughtYet: 0,
        timesRebuyable: 100000
    },
    "jumpstartResearch": {  //done
        name: "Jumpstart Research",
        description: "buffJumpstartResearchRow",
        rebuyable: false,
        rebuyableIncreaseMultiple: 1,
        baseCostAp: 30,
        effectCategoryMagnitude: 100,
        boughtYet: 0,
        timesRebuyable: 100000
    },
    "optimizedPowerGrids": {  //done
        name: "Optimized Power Grids",
        description: "buffOptimizedPowerGridsRow",
        rebuyable: true,
        rebuyableIncreaseMultiple: 2,
        baseCostAp: 25,
        effectCategoryMagnitude: 1.2,
        boughtYet: 0,
        timesRebuyable: 100000
    },
    "fasterAsteroidScan": { //done
        name: "Faster Asteroid Scan",
        description: "buffFasterAsteroidScanRow",
        rebuyable: true,
        rebuyableIncreaseMultiple: 1.2,
        baseCostAp: 20,
        effectCategoryMagnitude: 0.25,
        boughtYet: 0,
        timesRebuyable: 4
    },
    "deeperStarStudy": { //done
        name: "Deeper Star Study",
        description: "buffDeeperStarStudyRow",
        rebuyable: true,
        rebuyableIncreaseMultiple: 2,
        baseCostAp: 50,
        effectCategoryMagnitude: 2,
        boughtYet: 0,
        timesRebuyable: 3
    },
    "asteroidScannerBoost": {  //done
        name: "Asteroid Scanner Boost",
        description: "buffAsteroidScannerBoostRow",
        rebuyable: true,
        rebuyableIncreaseMultiple: 1,
        baseCostAp: 20,
        effectCategoryMagnitude: 2,
        boughtYet: 0,
        timesRebuyable: 2
    },
    "rocketFuelOptimization": {  //done
        name: "Rocket Fuel Optimization",
        description: "buffRocketFuelOptimizationRow",
        rebuyable: false,
        rebuyableIncreaseMultiple: 1,
        baseCostAp: 40,
        effectCategoryMagnitude: 0.5,
        boughtYet: 0,
        timesRebuyable: 100000
    },
    "enhancedMining": { //done
        name: "Enhanced Mining",
        description: "buffEnhancedMiningRow",
        rebuyable: true,
        rebuyableIncreaseMultiple: 2,
        baseCostAp: 15,
        effectCategoryMagnitude: 0.25,
        boughtYet: 0,
        timesRebuyable: 4
    },
    "quantumEngines": { //done
        name: "Quantum Engines",
        description: "buffQuantumEnginesRow",
        rebuyable: true,
        rebuyableIncreaseMultiple: 1.2,
        baseCostAp: 15,
        effectCategoryMagnitude: 2,
        boughtYet: 0,
        timesRebuyable: 10
    }
};

export const achievementsData = {
    collect50Hydrogen: {
        name: "Collect 50 Hydrogen",
        specialCondition: false,
        specialConditionArguments: false,
        resetOnRebirth: true,
        gridRow: 1,
        active: false,
        requirements: {
            requirement1: "resources",
            value1: {
                type: 'hydrogen',
                quantity: 50
            }
        },
        gives: {
            gives1: "cash",
            value1: {
                quantity: 10
            }
        },
        notification: "collect50HydrogenNotification"
    },
    collect1000Hydrogen: {
        name: "Collect 1000 Hydrogen",
        specialCondition: false,
        specialConditionArguments: false,
        resetOnRebirth: true,
        gridRow: 1,
        active: false,
        requirements: {
            requirement1: "resources",
            value1: {
                type: 'hydrogen',
                quantity: 1000
            }
        },
        gives: {
            gives1: "cash",
            value1: {
                quantity: 25
            }
        },
        notification: "collect1000HydrogenNotification"
    },
    collect5000Carbon: {
        name: "Collect 5000 Carbon",
        specialCondition: false,
        specialConditionArguments: false,
        resetOnRebirth: true,
        gridRow: 1,
        active: false,
        requirements: {
            requirement1: "resources",
            value1: {
                type: 'carbon',
                quantity: 5000
            }
        },
        gives: {
            gives1: "cash",
            value1: {
                quantity: 150
            }
        },
        notification: "collect5000CarbonNotification"
    },
    collect50000Iron: {
        name: "Collect 50000 Iron",
        specialCondition: false,
        specialConditionArguments: false,
        resetOnRebirth: true,
        gridRow: 1,
        active: false,
        requirements: {
            requirement1: "resources",
            value1: {
                type: 'iron',
                quantity: 50000
            }
        },
        gives: {
            gives1: "cash",
            value1: {
                quantity: 1800
            }
        },
        notification: "collect50000IronNotification"
    },
    collect100Precipitation: {
        name: "Collect 100 Precipitation",
        specialCondition: achievementCollect100Precipitation,
        specialConditionArguments: false,
        resetOnRebirth: true,
        gridRow: 1,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "cash",
            value1: {
                quantity: 1000
            }
        },
        notification: "collect100PrecipitationNotification"
    },
    fuseElement: {
        name: "Fuse an Element",
        specialCondition: false,
        specialConditionArguments: false,
        resetOnRebirth: true,
        gridRow: 1,
        active: false,
        requirements: {
            requirement1: "unlock",
            value1: "helium"
        },
        gives: {
            gives1: "cash",
            value1: {
                quantity: 40
            }
        },
        notification: "fuseElementNotification"
    }, 
    createSteel: {
        name: "Create Steel",
        specialCondition: achievementCreateCompound,
        specialConditionArguments: ['steel'],
        resetOnRebirth: true,
        gridRow: 1,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "multiplier",
            value1: {
                type: 'createCostCompounds',
                quantity: 0.8
            }
        },
        notification: "createSteelNotification"
    },
    createTitanium: {
        name: "Create Titanium",
        specialCondition: achievementCreateCompound,
        specialConditionArguments: ['titanium'],
        resetOnRebirth: true,
        gridRow: 1,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "multiplier",
            value1: {
                type: 'createCostCompounds',
                quantity: 0.8
            }
        },
        notification: "createTitaniumNotification"
    },
    unlockCompounds: {
        name: "Unlock Compounds",
        specialCondition: false,
        specialConditionArguments: false,
        resetOnRebirth: true,
        gridRow: 2,
        active: false,
        requirements: {
            requirement1: "tech",
            value1: "compounds"
        },
        gives: {
            gives1: "cash",
            value1: {
                quantity: 200
            }
        },
        notification: "unlockCompoundsNotification"
    },
    researchTechnology: {
        name: "Research a Technology",
        specialCondition: false,
        specialConditionArguments: false,
        resetOnRebirth: true,
        gridRow: 2,
        active: false,
        requirements: {
            requirement1: "tech",
            value1: "knowledgeSharing"
        },
        gives: {
            gives1: "cash",
            value1: {
                quantity: 30
            }
        },
        notification: "researchTechnologyNotification"
    },
    researchAllTechnologies: {
        name: "Research All Technologies",
        specialCondition: achievementResearchAllTechnologies,
        specialConditionArguments: false,
        resetOnRebirth: false,
        gridRow: 2,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "ascendencyPoints",
            value1: {
                quantity: 1
            }
        },
        notification: "researchAllTechnologiesNotification"
    },
    achieve100FusionEfficiency: {
        name: "Achieve 100% Fusion Efficiency",
        specialCondition: achievementAchieve100FusionEfficiency,
        specialConditionArguments: false,
        resetOnRebirth: true,
        gridRow: 2,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "cash",
            value1: {
                quantity: 500
            }
        },
        notification: "achieve100FusionEfficiencyNotification"
    },   
    have50HoursWithOnePioneer: {
        name: "Have 50 Hours Logged with One Pioneer Name",
        specialCondition: achievementHave50HoursWithOnePioneer,
        specialConditionArguments: false,
        resetOnRebirth: false,
        gridRow: 2,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "ascendencyPoints",
            value1: {
                quantity: 50
            }
        },
        notification: "have50HoursWithOnePioneerNotification"
    },
    buildPowerPlant: {
        name: "Build a Power Plant",
        specialCondition: false,
        specialConditionArguments: false,
        resetOnRebirth: true,
        gridRow: 2,
        active: false,
        requirements: {
            requirement1: "buildings",
            value1: {
                type: 'powerPlant1',
                quantity: 1
            }
        },
        gives: {
            gives1: "multiplier",
            value1: {
                type: 'allResources',
                quantity: 1.1
            }
        },
        notification: "buildPowerPlantNotification"
    },
    buildSolarPowerPlant: {
        name: "Build a Solar Power Plant",
        specialCondition: false,
        specialConditionArguments: false,
        resetOnRebirth: true,
        gridRow: 2,
        active: false,
        requirements: {
            requirement1: "buildings",
            value1: {
                type: 'powerPlant2',
                quantity: 1
            }
        },
        gives: {
            gives1: "multiplier",
            value1: {
                type: 'allResources',
                quantity: 1.2
            }
        },
        notification: "buildSolarPowerPlantNotification"
    },
    collect100TitaniumAsPrecipitation: {
        name: "Collect 100 Titanium as Precipitation",
        specialCondition: achievementCollect100TitaniumAsPrecipitation,
        specialConditionArguments: false,
        resetOnRebirth: false,
        gridRow: 2,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "ascendencyPoints",
            value1: {
                quantity: 50
            }
        },
        notification: "collect100TitaniumAsPrecipitationNotification"
    },
    gain100Cash: {
        name: "Gain 100 Cash",
        specialCondition: false,
        specialConditionArguments: false,
        resetOnRebirth: true,
        gridRow: 3,
        active: false,
        requirements: {
            requirement1: "cash",
            value1: {
                quantity: 100
            }
        },
        gives: {
            gives1: "multiplier",
            value1: {
                type: 'cash',
                quantity: 1.1
            }
        },
        notification: "gain100CashNotification"
    },
    gain10000Cash: {
        name: "Gain 10000 Cash",
        specialCondition: false,
        specialConditionArguments: false,
        resetOnRebirth: true,
        gridRow: 3,
        active: false,
        requirements: {
            requirement1: "cash",
            value1: {
                quantity: 10000
            }
        },
        gives: {
            gives1: "multiplier",
            value1: {
                type: 'cash',
                quantity: 1.2
            }
        },
        notification: "gain10000CashNotification"
    },
    gain100000Cash: {
        name: "Gain 100000 Cash",
        specialCondition: false,
        specialConditionArguments: false,
        resetOnRebirth: true,
        gridRow: 3,
        active: false,
        requirements: {
            requirement1: "cash",
            value1: {
                quantity: 100000
            }
        },
        gives: {
            gives1: "multiplier",
            value1: {
                type: 'cash',
                quantity: 1.2
            }
        },
        notification: "gain100000CashNotification"
    },
    gain1000000Cash: {
        name: "Gain 1000000 Cash",
        specialCondition: false,
        specialConditionArguments: false,
        resetOnRebirth: true,
        gridRow: 3,
        active: false,
        requirements: {
            requirement1: "cash",
            value1: {
                quantity: 1000000
            }
        },
        gives: {
            gives1: "multiplier",
            value1: {
                type: 'cash',
                quantity: 1.5
            }
        },
        notification: "gain1000000CashNotification"
    },
    seeAllNewsTickers: {
        name: "See All News Tickers",
        specialCondition: achievementSeeAllNewsTickers,
        specialConditionArguments: false,
        resetOnRebirth: false,
        gridRow: 3,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "multiplierPermanent",
            value1: {
                type: 'allResources',
                quantity: 1.2
            }
        },
        notification: "seeAllNewsTickersNotification"
    },
    activateAllWackyNewsTickers: {
        name: "Activate All Wacky News Tickers",
        specialCondition: achievementActivateAllWackyNewsTickers,
        specialConditionArguments: false,
        resetOnRebirth: false,
        gridRow: 3,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "multiplierPermanent",
            value1: {
                type: 'createCostCompounds',
                quantity: 0.80
            }
        },
        notification: "activateAllWackyNewsTickersNotification"
    },
    discoverLegendaryAsteroid: {
        name: "Discover a Legendary Asteroid",
        specialCondition: achievementDiscoverLegendaryAsteroid,
        specialConditionArguments: false,
        resetOnRebirth: true,
        gridRow: 4,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "cash",
            value1: {
                quantity: 75000
            }
        },
        notification: "discoverLegendaryAsteroidNotification"
    },
    have4RocketsMiningAntimatter: {
        name: "Have 4 Rockets Simultaneously Mining Antimatter",
        specialCondition: achievementHave4RocketsMiningAntimatter,
        specialConditionArguments: false,
        resetOnRebirth: true,
        gridRow: 4,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "cash",
            value1: {
                quantity: 100000
            }
        },
        notification: "have4RocketsMiningAntimatterNotification"
    },
    tripPower: {
        name: "Trip the Power",
        specialCondition: achievementTripPower,
        specialConditionArguments: false,
        resetOnRebirth: true,
        gridRow: 4,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "multiplier",
            value1: {
                type: 'allResources',
                quantity: 1.1
            }
        },
        notification: "tripPowerNotification"
    },
    discoverAsteroid: {
        name: "Discover an Asteroid",
        specialCondition: achievementDiscoverAsteroid,
        specialConditionArguments: false,
        resetOnRebirth: true,
        gridRow: 4,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "multiplier",
            value1: {
                type: 'createCostCompounds',
                quantity: 0.95
            }
        },
        notification: "discoverAsteroidNotification"
    },
    launchRocket: {
        name: "Launch a Rocket",
        specialCondition: achievementLaunchRocket,
        specialConditionArguments: false,
        resetOnRebirth: true,
        gridRow: 4,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "multiplier",
            value1: {
                type: 'allResources',
                quantity: 1.1
            }
        },
        notification: "launchRocketNotification"
    },
    mineAllAntimatterAsteroid: {
        name: "Mine All Antimatter from an Asteroid",
        specialCondition: false,
        specialConditionArguments: achievementMineAllAntimatterAsteroid,
        resetOnRebirth: true,
        gridRow: 4,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "antimatter",
            value1: {
                quantity: 150
            }
        },
        notification: "mineAllAntimatterAsteroidNotification"
    },
    studyStar: {
        name: "Study a Star",
        specialCondition: achievementStudyAStar,
        specialConditionArguments: [0.5],
        resetOnRebirth: true,
        gridRow: 4,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "multiplier",
            value1: {
                type: 'createCostCompounds',
                quantity: 0.95
            }
        },
        notification: "studyStarNotification"
    },
    studyStarMoreThan5LYAway: {
        name: "Study a Star More Than 5ly Away",
        specialCondition: achievementStudyAStar,
        specialConditionArguments: [5],
        resetOnRebirth: true,
        gridRow: 4,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "multiplier",
            value1: {
                type: 'createCostCompounds',
                quantity: 0.90
            }
        },
        notification: "studyStarMoreThan5LYAwayNotification"
    },
    studyStarMoreThan20LYAway: {
        name: "Study a Star More Than 20ly Away",
        specialCondition: achievementStudyAStar,
        specialConditionArguments: [20],
        resetOnRebirth: true,
        gridRow: 4,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "multiplier",
            value1: {
                type: 'createCostCompounds',
                quantity: 0.85
            }
        },
        notification: "studyStarMoreThan20LYAwayNotification"
    },
    launchStarship: {
        name: "Launch a Starship",
        specialCondition: achievementLaunchStarShip,
        specialConditionArguments: false,
        resetOnRebirth: true,
        gridRow: 4,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "cash",
            value1: {
                quantity: 10000
            }
        },
        notification: "launchStarshipNotification"
    },
    performGalacticMarketTransaction: {
        name: "Perform a Galactic Market Transaction",
        specialCondition: achievementPerformGalaticMarketTransaction,
        specialConditionArguments: false,
        resetOnRebirth: false,
        gridRow: 4,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "ascendencyPoints",
            value1: {
                quantity: 1
            }
        },
        notification: "performGalacticMarketTransactionNotification"
    },
    trade10APForCash: {
        name: "Trade 10 AP for Cash in One Transaction in the Galactic Market",
        specialCondition: achievementTrade10APForCash,
        specialConditionArguments: false,
        resetOnRebirth: false,
        gridRow: 4,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "ascendencyPoints",
            value1: {
                quantity: 5
            }
        },
        notification: "trade10APForCashNotification"
    },
    initiateDiplomacyWithAlienRace: {
        name: "Initiate Diplomacy with an Alien Race",
        specialCondition: achievementInitiateDiplomacyWithAlienRace,
        specialConditionArguments: false,
        resetOnRebirth: true,
        gridRow: 5,
        active: true,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "multiplier",
            value1: {
                type: 'allResources',
                quantity: 1.1
            }
        },
        notification: "initiateDiplomacyWithAlienRaceNotification"
    },
    bullyEnemyIntoSubmission: {
        name: "Bully an Enemy into Submission",
        specialCondition: achievementBeatEnemy,
        specialConditionArguments:  ['bully'],
        resetOnRebirth: false,
        gridRow: 5,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "ascendencyPoints",
            value1: {
                quantity: 1
            }
        },
        notification: "bullyEnemyIntoSubmissionNotification"
    },
    vassalizeEnemy: {
        name: "Vassalize an Enemy",
        specialCondition: achievementBeatEnemy,
        specialConditionArguments:  ['vassalize'],
        resetOnRebirth: false,
        gridRow: 5,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "ascendencyPoints",
            value1: {
                quantity: 1
            }
        },
        notification: "vassalizeEnemyNotification"
    },
    conquerEnemy: {
        name: "Conquer an Enemy",
        specialCondition: achievementBeatEnemy,
        specialConditionArguments: ['conquer'],
        resetOnRebirth: false,
        gridRow: 5,
        active: true,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "ascendencyPoints",
            value1: {
                quantity: 1
            }
        },
        notification: "conquerEnemyNotification"
    },
    conquerHiveMindEnemy: {
        name: "Conquer a Hive Mind Enemy",
        specialCondition: achievementBeatEnemy,
        specialConditionArguments: ['hiveMind'],
        resetOnRebirth: false,
        gridRow: 5,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "ascendencyPoints",
            value1: {
                quantity: 2
            }
        },
        notification: "conquerHiveMindEnemyNotification"
    },
    conquerBelligerentEnemy: {
        name: "Conquer a Belligerent Enemy",
        specialCondition: achievementBeatEnemy,
        specialConditionArguments: ['belligerent'],
        resetOnRebirth: false,
        gridRow: 5,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "ascendencyPoints",
            value1: {
                quantity: 3
            }
        },
        notification: "conquerBelligerentEnemyNotification"
    },
    conquerEnemyWithoutScanning: {
        name: "Conquer an Enemy Without Scanning the System",
        specialCondition: achievementBeatEnemy,
        specialConditionArguments: ['withoutScanning'],
        resetOnRebirth: false,
        gridRow: 5,
        active: true,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "ascendencyPoints",
            value1: {
                quantity: 2
            }
        },
        notification: "conquerEnemyWithoutScanningNotification"
    },
    settleUnoccupiedSystem: {
        name: "Settle an Unoccupied System",
        specialCondition: achievementBeatEnemy,
        specialConditionArguments: ['unoccupied'],
        resetOnRebirth: false,
        gridRow: 5,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "cash",
            value1: {
                quantity: 50000
            }
        },
        notification: "settleUnoccupiedSystemNotification"
    },
    discoverSystemWithNoLife: {
        name: "Discover a System with No Life",
        specialCondition: achievementBeatEnemy,
        specialConditionArguments: ['noLife'],
        resetOnRebirth: false,
        gridRow: 5,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "cash",
            value1: {
                quantity: 75000
            }
        },
        notification: "discoverSystemWithNoLifeNotification"
    },
    settleSystem: {
        name: "Settle a System",
        specialCondition: achievementBeatEnemy,
        specialConditionArguments: ['settleNormal'],
        resetOnRebirth: false,
        gridRow: 5,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "ascendencyPoints",
            value1: {
                quantity: 1
            }
        },
        notification: "settleSystemNotification"
    },
    spendAP: {
        name: "Spend Ascendency Points",
        specialCondition: achievementSpendAp,
        specialConditionArguments: false,
        resetOnRebirth: true,
        gridRow: 5,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "multiplier",
            value1: {
                type: 'allResources',
                quantity: 1.1
            }
        },
        notification: "spendAPNotification"
    },
    liquidateAllAssets: {
        name: "Liquidate All Assets",
        specialCondition: achievementLiquidateAllAssets,
        specialConditionArguments: false,
        resetOnRebirth: false,
        gridRow: 5,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "ascendencyPoints",
            value1: {
                quantity: 0
            }
        },
        notification: "liquidateAllAssetsNotification"
    },
    rebirth: {
        name: "Rebirth",
        specialCondition: achievementRebirth,
        specialConditionArguments: false,
        resetOnRebirth: false,
        gridRow: 5,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "multiplierPermanent",
            value1: {
                type: 'allResources',
                quantity: 1.3
            }
        },
        notification: "rebirthNotification"
    },
    conquer10StarSystems: {
        name: "Conquer 10 Star Systems",
        specialCondition: achievementConquerStarSystems,
        specialConditionArguments: [10],
        resetOnRebirth: false,
        gridRow: 5,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "ascendencyPoints",
            value1: {
                quantity: 10
            }
        },
        notification: "conquer10StarSystemsNotification"
    },
    conquer50StarSystems: {
        name: "Conquer 50 Star Systems",
        specialCondition: achievementConquerStarSystems,
        specialConditionArguments: [100],
        resetOnRebirth: false,
        gridRow: 5,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "ascendencyPoints",
            value1: {
                quantity: 100
            }
        },
        notification: "conquer50StarSystemsNotification"
    },
    studyAllStarsInOneRun: {
        name: "Study All Stars in the Star Map in One Run",
        specialCondition: achievementStudyAllStarsInOneRun,
        specialConditionArguments: false,
        resetOnRebirth: false,
        gridRow: 5,
        active: false,
        requirements: {
            requirement1: "special",
            value1: ""
        },
        gives: {
            gives1: "ascendencyPoints",
            value1: {
                quantity: 0
            }
        },
        notification: "studyAllStarsInOneRunNotification"
    }
};

export function setAchievementIconImageUrls() {
    achievementImageUrls = {
        collect50Hydrogen: `./images/achievements/${getCurrentTheme()}/images/collect50Hydrogen.png`,
        collect1000Hydrogen: `./images/achievements/${getCurrentTheme()}/images/collect1000Hydrogen.png`,
        collect5000Carbon: `./images/achievements/${getCurrentTheme()}/images/collect5000Carbon.png`,
        collect50000Iron: `./images/achievements/${getCurrentTheme()}/images/collect50000Iron.png`,
        researchTechnology: `./images/achievements/${getCurrentTheme()}/images/researchTechnology.png`,
        researchAllTechnologies: `./images/achievements/${getCurrentTheme()}/images/researchAllTechnologies.png`,
        achieve100FusionEfficiency: `./images/achievements/${getCurrentTheme()}/images/achieve100FusionEfficiency.png`,
        fuseElement: `./images/achievements/${getCurrentTheme()}/images/fuseElement.png`,
        gain100Cash: `./images/achievements/${getCurrentTheme()}/images/gain100Cash.png`,
        gain10000Cash: `./images/achievements/${getCurrentTheme()}/images/gain10000Cash.png`,
        gain100000Cash: `./images/achievements/${getCurrentTheme()}/images/gain100000Cash.png`,
        gain1000000Cash: `./images/achievements/${getCurrentTheme()}/images/gain1000000Cash.png`,
        buildPowerPlant: `./images/achievements/${getCurrentTheme()}/images/buildPowerPlant.png`,
        tripPower: `./images/achievements/${getCurrentTheme()}/images/tripPower.png`,
        buildSolarPowerPlant: `./images/achievements/${getCurrentTheme()}/images/buildSolarPowerPlant.png`,
        collect100Precipitation: `./images/achievements/${getCurrentTheme()}/images/collect100Precipitation.png`,
        unlockCompounds: `./images/achievements/${getCurrentTheme()}/images/unlockCompounds.png`,
        createSteel: `./images/achievements/${getCurrentTheme()}/images/createSteel.png`,
        createTitanium: `./images/achievements/${getCurrentTheme()}/images/createTitanium.png`,
        discoverAsteroid: `./images/achievements/${getCurrentTheme()}/images/discoverAsteroid.png`,
        launchRocket: `./images/achievements/${getCurrentTheme()}/images/launchRocket.png`,
        mineAllAntimatterAsteroid: `./images/achievements/${getCurrentTheme()}/images/mineAllAntimatterAsteroid.png`,
        studyStar: `./images/achievements/${getCurrentTheme()}/images/studyStar.png`,
        studyStarMoreThan5LYAway: `./images/achievements/${getCurrentTheme()}/images/studyStarMoreThan5LYAway.png`,
        studyStarMoreThan20LYAway: `./images/achievements/${getCurrentTheme()}/images/studyStarMoreThan20LYAway.png`,
        launchStarship: `./images/achievements/${getCurrentTheme()}/images/launchStarship.png`,
        initiateDiplomacyWithAlienRace: `./images/achievements/${getCurrentTheme()}/images/initiateDiplomacyWithAlienRace.png`,
        bullyEnemyIntoSubmission: `./images/achievements/${getCurrentTheme()}/images/bullyEnemyIntoSubmission.png`,
        vassalizeEnemy: `./images/achievements/${getCurrentTheme()}/images/vassalizeEnemy.png`,
        conquerEnemy: `./images/achievements/${getCurrentTheme()}/images/conquerEnemy.png`,
        conquerHiveMindEnemy: `./images/achievements/${getCurrentTheme()}/images/conquerHiveMindEnemy.png`,
        conquerBelligerentEnemy: `./images/achievements/${getCurrentTheme()}/images/conquerBelligerentEnemy.png`,
        conquerEnemyWithoutScanning: `./images/achievements/${getCurrentTheme()}/images/conquerEnemyWithoutScanning.png`,
        settleUnoccupiedSystem: `./images/achievements/${getCurrentTheme()}/images/settleUnoccupiedSystem.png`,
        discoverSystemWithNoLife: `./images/achievements/${getCurrentTheme()}/images/discoverSystemWithNoLife.png`,
        settleSystem: `./images/achievements/${getCurrentTheme()}/images/settleSystem.png`,
        spendAP: `./images/achievements/${getCurrentTheme()}/images/spendAP.png`,
        performGalacticMarketTransaction: `./images/achievements/${getCurrentTheme()}/images/performGalacticMarketTransaction.png`,
        liquidateAllAssets: `./images/achievements/${getCurrentTheme()}/images/liquidateAllAssets.png`,
        rebirth: `./images/achievements/${getCurrentTheme()}/images/rebirth.png`,
        conquer10StarSystems: `./images/achievements/${getCurrentTheme()}/images/conquer10StarSystems.png`,
        conquer50StarSystems: `./images/achievements/${getCurrentTheme()}/images/conquer50StarSystems.png`,
        seeAllNewsTickers: `./images/achievements/${getCurrentTheme()}/images/seeAllNewsTickers.png`,
        activateAllWackyNewsTickers: `./images/achievements/${getCurrentTheme()}/images/activateAllWackyNewsTickers.png`,
        collect100TitaniumAsPrecipitation: `./images/achievements/${getCurrentTheme()}/images/collect100TitaniumAsPrecipitation.png`,
        discoverLegendaryAsteroid: `./images/achievements/${getCurrentTheme()}/images/discoverLegendaryAsteroid.png`,
        have4RocketsMiningAntimatter: `./images/achievements/${getCurrentTheme()}/images/have4RocketsMiningAntimatter.png`,
        studyAllStarsInOneRun: `./images/achievements/${getCurrentTheme()}/images/studyAllStarsInOneRun.png`,
        trade10APForCash: `./images/achievements/${getCurrentTheme()}/images/trade10APForCash.png`,
        have50HoursWithOnePioneer: `./images/achievements/${getCurrentTheme()}/images/have50HoursWithOnePioneer.png`,    
    };    
}  

const achievementPositionDataLinker = {
    collect50Hydrogen: { id: 'collect50Hydrogen', gridRow: 0, gridColumn: 0 },
    collect1000Hydrogen: { id: 'collect1000Hydrogen', gridRow: 0, gridColumn: 1 },
    collect5000Carbon: { id: 'collect5000Carbon', gridRow: 0, gridColumn: 2 },
    collect50000Iron: { id: 'collect50000Iron', gridRow: 0, gridColumn: 3 },
    researchTechnology: { id: 'researchTechnology', gridRow: 0, gridColumn: 4 },
    researchAllTechnologies: { id: 'researchAllTechnologies', gridRow: 0, gridColumn: 5 },
    achieve100FusionEfficiency: { id: 'achieve100FusionEfficiency', gridRow: 0, gridColumn: 6 },
    fuseElement: { id: 'fuseElement', gridRow: 0, gridColumn: 7 },
    gain100Cash: { id: 'gain100Cash', gridRow: 0, gridColumn: 8 },
    gain10000Cash: { id: 'gain10000Cash', gridRow: 0, gridColumn: 9 },
    gain100000Cash: { id: 'gain100000Cash', gridRow: 1, gridColumn: 0 },
    gain1000000Cash: { id: 'gain1000000Cash', gridRow: 1, gridColumn: 1 },
    buildPowerPlant: { id: 'buildPowerPlant', gridRow: 1, gridColumn: 2 },
    tripPower: { id: 'tripPower', gridRow: 1, gridColumn: 3 },
    buildSolarPowerPlant: { id: 'buildSolarPowerPlant', gridRow: 1, gridColumn: 4 },
    collect100Precipitation: { id: 'collect100Precipitation', gridRow: 1, gridColumn: 5 },
    unlockCompounds: { id: 'unlockCompounds', gridRow: 1, gridColumn: 6 },
    createSteel: { id: 'createSteel', gridRow: 1, gridColumn: 7 },
    createTitanium: { id: 'createTitanium', gridRow: 1, gridColumn: 8 },
    discoverAsteroid: { id: 'discoverAsteroid', gridRow: 1, gridColumn: 9 },
    launchRocket: { id: 'launchRocket', gridRow: 2, gridColumn: 0 },
    mineAllAntimatterAsteroid: { id: 'mineAllAntimatterAsteroid', gridRow: 2, gridColumn: 1 },
    studyStar: { id: 'studyStar', gridRow: 2, gridColumn: 2 },
    studyStarMoreThan5LYAway: { id: 'studyStarMoreThan5LYAway', gridRow: 2, gridColumn: 3 },
    studyStarMoreThan20LYAway: { id: 'studyStarMoreThan20LYAway', gridRow: 2, gridColumn: 4 },
    launchStarship: { id: 'launchStarship', gridRow: 2, gridColumn: 5 },
    initiateDiplomacyWithAlienRace: { id: 'initiateDiplomacyWithAlienRace', gridRow: 2, gridColumn: 6 },
    bullyEnemyIntoSubmission: { id: 'bullyEnemyIntoSubmission', gridRow: 2, gridColumn: 7 },
    vassalizeEnemy: { id: 'vassalizeEnemy', gridRow: 2, gridColumn: 8 },
    conquerEnemy: { id: 'conquerEnemy', gridRow: 2, gridColumn: 9 },
    conquerHiveMindEnemy: { id: 'conquerHiveMindEnemy', gridRow: 3, gridColumn: 0 },
    conquerBelligerentEnemy: { id: 'conquerBelligerentEnemy', gridRow: 3, gridColumn: 1 },
    conquerEnemyWithoutScanning: { id: 'conquerEnemyWithoutScanning', gridRow: 3, gridColumn: 2 },
    settleUnoccupiedSystem: { id: 'settleUnoccupiedSystem', gridRow: 3, gridColumn: 3 },
    discoverSystemWithNoLife: { id: 'discoverSystemWithNoLife', gridRow: 3, gridColumn: 4 },
    settleSystem: { id: 'settleSystem', gridRow: 3, gridColumn: 5 },
    spendAP: { id: 'spendAP', gridRow: 3, gridColumn: 6 },
    performGalacticMarketTransaction: { id: 'performGalacticMarketTransaction', gridRow: 3, gridColumn: 7 },
    liquidateAllAssets: { id: 'liquidateAllAssets', gridRow: 3, gridColumn: 8 },
    rebirth: { id: 'rebirth', gridRow: 3, gridColumn: 9 },
    conquer10StarSystems: { id: 'conquer10StarSystems', gridRow: 4, gridColumn: 0 },
    conquer50StarSystems: { id: 'conquer50StarSystems', gridRow: 4, gridColumn: 1 },
    seeAllNewsTickers: { id: 'seeAllNewsTickers', gridRow: 4, gridColumn: 2 },
    activateAllWackyNewsTickers: { id: 'activateAllWackyNewsTickers', gridRow: 4, gridColumn: 3 },
    collect100TitaniumAsPrecipitation: { id: 'collect100TitaniumAsPrecipitation', gridRow: 4, gridColumn: 4 },
    discoverLegendaryAsteroid: { id: 'discoverLegendaryAsteroid', gridRow: 4, gridColumn: 5 },
    have4RocketsMiningAntimatter: { id: 'have4RocketsMiningAntimatter', gridRow: 4, gridColumn: 6 },
    studyAllStarsInOneRun: { id: 'studyAllStarsInOneRun', gridRow: 4, gridColumn: 7 },
    trade10APForCash: { id: 'trade10APForCash', gridRow: 4, gridColumn: 8 },
    have50HoursWithOnePioneer: { id: 'have50HoursWithOnePioneer', gridRow: 4, gridColumn: 9 }
};


//----------------------------------------------------------------------------------------------------------
//GETTER SETTERS

export function getAchievementPositionData() {
    return achievementPositionDataLinker;
}

export function getBuffEfficientStorageData() {
    return ascendencyBuffs["efficientStorage"];
}

export function getBuffSmartAutoBuyersData() {
    return ascendencyBuffs["smartAutoBuyers"];
}

export function getBuffJumpstartResearchData() {
    return ascendencyBuffs["jumpstartResearch"];
}

export function getBuffOptimizedPowerGridsData() {
    return ascendencyBuffs["optimizedPowerGrids"];
}

export function getBuffFasterAsteroidScanData() {
    return ascendencyBuffs["fasterAsteroidScan"];
}

export function getBuffDeeperStarStudyData() {
    return ascendencyBuffs["deeperStarStudy"];
}

export function getBuffAsteroidScannerBoostData() {
    return ascendencyBuffs["asteroidScannerBoost"];
}

export function getBuffRocketFuelOptimizationData() {
    return ascendencyBuffs["rocketFuelOptimization"];
}

export function getBuffEnhancedMiningData() {
    return ascendencyBuffs["enhancedMining"];
}

export function getBuffQuantumEnginesData() {
    return ascendencyBuffs["quantumEngines"];
}

export function copyStarDataToDestinationStarField(starName) {
    const stars = getStarSystemDataObject('stars');

    stars.destinationStar = JSON.parse(JSON.stringify(stars[starName]));
}

export function restoreResourceDataObject(value) {
    value = migrateResourceData(value, 'resourceData');
    resourceData = value;
}

export function restoreStarSystemsDataObject(value) {
    value = migrateResourceData(value, 'starSystemsData');
    starSystems = value;
}

export function restoreRocketNamesObject(value) {
    value = migrateResourceData(value, 'rocketNames');
    replaceRocketNames(value);
}

export function restoreGalacticMarketDataObject(value) {
    value = migrateResourceData(value, 'galacticMarketData');
    galacticMarket = value;
}

export function restoreAscendencyBuffsDataObject(value) {
    value = migrateResourceData(value, 'ascendencyBuffsData')
    ascendencyBuffs = value;
}

export function getStarSystemWeather(starSystem) {
    return starSystems.stars[starSystem]?.weather || null;
}

export function setStarSystemWeather(starSystem, weatherData) {
    if (starSystems.stars[starSystem]) {
        starSystems.stars[starSystem].weather = weatherData;
    }
}

export function getAchievementImageUrl(key) {
    if (achievementImageUrls.hasOwnProperty(key)) {
        return achievementImageUrls[key];
    } else {
        console.warn('Achievement key not found:', key);
        return null; // or a default image URL
    }
}

export function getAchievementDataObject(key, subKeys, noWarning = false) {
    let current = achievementsData[key];

    if (!current && !noWarning) {
        console.warn(`Achievement data not found for key: ${key}`);
        return undefined;
    }

    if (subKeys) {
        for (const subKey of subKeys) {
            current = current?.[subKey];
            if (current === undefined && !noWarning) {
                console.warn(`Missing achievement subKey: ${subKey}`);
                return undefined;
            }
        }
    }

    return current;
}

export function setAchievementDataObject(value, key, subKeys = []) {
    if (!key) {
        console.warn("Achievement key is required.");
        return;
    }

    let current = achievementsData;
    current = current[key] || (current[key] = {});

    for (let i = 0; i < subKeys.length; i++) {
        const subKey = subKeys[i];

        if (i === subKeys.length - 1) {
            current[subKey] = value;
        } else {
            current = current[subKey] || (current[subKey] = {});
        }
    }
}

export function getAscendencyBuffDataObject() {
    return ascendencyBuffs;
}

export function setAscendencyBuffDataObject(value, key, subKeys = []) {
    if (!key) {
        console.warn("Main key is required.");
        return;
    }

    let current = ascendencyBuffs;
    current = current[key] || (current[key] = {});

    for (let i = 0; i < subKeys.length; i++) {
        const subKey = subKeys[i];

        if (i === subKeys.length - 1) {
            current[subKey] = value;
        } else {
            current = current[subKey] || (current[subKey] = {});
        }
    }
}

export function getResourceDataObject(key, subKeys, noWarning = false) {
    let current = resourceData[key];

    if (!current && !noWarning) {
        console.warn(`Resource data not found for key: ${key}`);
        return undefined;
    }

    if (subKeys) {
        for (const subKey of subKeys) {
            current = current?.[subKey];
            if (current === undefined && !noWarning) {
                console.warn(`Missing subKey: ${subKey}`);
                return undefined;
            }
        }
    }

    return current;
}

export function setResourceDataObject(value, key, subKeys = []) {
    if (!key) {
        console.warn("Main key is required.");
        return;
    }

    let current = resourceData;
    current = current[key] || (current[key] = {});

    for (let i = 0; i < subKeys.length; i++) {
        const subKey = subKeys[i];

        if (i === subKeys.length - 1) {
            current[subKey] = value;
        } else {
            current = current[subKey] || (current[subKey] = {});
        }
    }
}

export function getGalacticMarketDataObject(key, subKeys) {
    let current = galacticMarket[key];

    if (!current) {
        console.warn(`Galactic market data not found for key: ${key}`);
        return undefined;
    }

    if (subKeys) {
        for (const subKey of subKeys) {
            current = current?.[subKey];
            if (current === undefined) {
                console.warn(`Missing subKey: ${subKey}`);
                return undefined;
            }
        }
    }

    return current;
}

export function setGalacticMarketDataObject(value, key, subKeys = []) {
    if (!key) {
        console.warn("Main key is required.");
        return;
    }

    let current = galacticMarket;
    current = current[key] || (current[key] = {});

    for (let i = 0; i < subKeys.length; i++) {
        const subKey = subKeys[i];

        if (i === subKeys.length - 1) {
            current[subKey] = value;
        } else {
            current = current[subKey] || (current[subKey] = {});
        }
    }
}

export let resourceDataRebirthCopy = structuredClone(resourceData);

export function resetResourceDataObjectOnRebirthAndAddApAndPermanentBuffsBack() {
    const currentAp = getResourceDataObject('ascendencyPoints', ['quantity']);
    //const galacticBuffsList = 
    Object.assign(resourceData, resourceDataRebirthCopy);

    addPermanentBuffsBackInAfterRebirth();
    //add permanent buffs back in and any immediate effects here such as start up bonuses for new run
    setResourceDataObject(currentAp, 'ascendencyPoints', ['quantity']);
}

export function getStarSystemDataObject(key, subKeys) {
    let current = starSystems[key];

    if (!current) {
        console.warn(`Resource data not found for key: ${key}`);
        return undefined;
    }

    if (subKeys) {
        for (const subKey of subKeys) {
            current = current?.[subKey];
            if (current === undefined) {
                console.warn(`Missing subKey: ${subKey}`);
                return undefined;
            }
        }
    }

    return current;
}

export function setStarSystemDataObject(value, key, subKeys = []) {
    if (!key) {
        console.warn("Main key is required.");
        return;
    }

    let current = starSystems;
    current = current[key] || (current[key] = {});

    for (let i = 0; i < subKeys.length; i++) {
        const subKey = subKeys[i];

        if (i === subKeys.length - 1) {
            current[subKey] = value;
        } else {
            current = current[subKey] || (current[subKey] = {});
        }
    }
}

export function setupNewRunStarSystem() {
    const destinationStar = getStarSystemDataObject('stars', ['destinationStar']);
    const starObject = {
        mapSize: destinationStar.mapSize || 5.504440179536064, // TODO
        startingStar: destinationStar.startingStar || true,
        starCode: destinationStar.starCode,
        precipitationResourceCategory: destinationStar.precipitationResourceCategory,
        precipitationType: destinationStar.precipitationType,
        weather: destinationStar.weather
    };

    setRebirthStarSystemToStarSystemDataObject(starObject);
}

export function setRebirthStarSystemToStarSystemDataObject(newObject) {
    starSystems.stars = {};
    starSystems.stars[newObject.starCode.toLowerCase()] = newObject;
}


export function setAutoBuyerTierLevel(key, value, override = false, type) {
    if (resourceData[type][key].upgrades.autoBuyer.normalProgression === true || override) {
        resourceData[type][key].upgrades.autoBuyer.currentTierLevel = value;
    }
}

export function getAutoBuyerTierLevel(key, type) {
    return resourceData[type][key].upgrades.autoBuyer.currentTierLevel;
}

export function getRocketParts(rocket) {
    return resourceData.space.upgrades[rocket].builtParts;
}

export function getRocketPartsNeededInTotalPerRocket(rocket) {
    return resourceData.space.upgrades[rocket].parts;
}

export function getStarShipParts(starShipModule) {
    return resourceData.space.upgrades[starShipModule].builtParts;
}

export function getStarShipPartsNeededInTotalPerModule(starShipModule) {
    return resourceData.space.upgrades[starShipModule].parts;
}

export function getFleetShips(fleetShip) {
    return resourceData.space.upgrades[fleetShip].quantity;
}

export function getMaxFleetShip(fleetShip) {
    return resourceData.space.upgrades[fleetShip].maxCanBuild;
}

export function achievementResearchAllTechnologies() {

}

export function achievementAchieve100FusionEfficiency() {
    
}

export function achievementTripPower() {

}

export function achievementCollect100Precipitation() {

}

export function achievementCreateCompound(compound) {

}

export function achievementDiscoverAsteroid() {

}

export function achievementLaunchRocket() {

}

export function achievementMineAllAntimatterAsteroid() {

}

export function achievementStudyAStar(requiredDistance) {

}

export function achievementLaunchStarShip() {

}

export function achievementInitiateDiplomacyWithAlienRace() {

}

export function achievementBeatEnemy(victoryType) {

}

export function achievementSpendAp() {

}

export function achievementPerformGalaticMarketTransaction() {
    
}

export function achievementLiquidateAllAssets() {

}

export function achievementRebirth() {

}

export function achievementConquerStarSystems(conqueredQuantity) {

}

export function achievementSeeAllNewsTickers() {

}

export function achievementActivateAllWackyNewsTickers(conqueredQuantity) {

}

export function achievementCollect100TitaniumAsPrecipitation() {

}

export function achievementDiscoverLegendaryAsteroid() {

}

export function achievementHave4RocketsMiningAntimatter() {

}

export function achievementStudyAllStarsInOneRun() {

}

export function achievementTrade10APForCash() {

}

export function achievementHave50HoursWithOnePioneer() {
    
}