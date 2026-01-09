import {
    getMinimumVersion,
    getCurrentGameVersion,
    setSaveName,
    getSaveName,
    setSaveData, 
    captureGameStatusForSaving, 
    restoreGameStatus, 
    getAutoSaveFrequency,
    getAutoSaveToggle,
    getSaveData,
    getUserPlatform,
    getFeedbackGiven,
    getFeedbackContent,
    getBattleOngoing
} from './constantsAndGlobalVars.js';

import { setAchievementIconImageUrls } from './resourceDataObject.js';

import { showNotification } from './ui.js';
import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js";
import { getNavigatorLanguage } from './game.js';

const supabaseUrl = 'https://riogcxvtomyjlzkcnujf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpb2djeHZ0b215amx6a2NudWpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMjY1NDgsImV4cCI6MjA1OTYwMjU0OH0.HH7KXPrcORvl6Wiefupl422gRYxAa_kFCRM2-puUcsQ';
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async () => {

});

let autoSaveTimer = null;

export function initializeAutoSave() {
    if (autoSaveTimer) {
        //console.log("Clearing existing auto-save timer.");
        clearTimeout(autoSaveTimer);
    }

    const frequency = getAutoSaveFrequency();
    //console.log("Auto-save initialized with frequency:", frequency, "ms");

    let timeLeft = frequency / 1000;

    const autoSaveHandler = () => {

        const canAutoSave = getAutoSaveToggle() && !getBattleOngoing();

        if (canAutoSave) {
            saveGame('autoSave');

            if (getSaveData()) {
                saveGameToCloud(getSaveData(), 'autosave');
            }

            setSaveData(null);
        }

        timeLeft = frequency / 1000;
        autoSaveTimer = setTimeout(autoSaveHandler, frequency);
    };

    autoSaveTimer = setTimeout(autoSaveHandler, frequency);
}

export async function destroySaveGameOnCloud() {
    try {
        const userId = getSaveName();

        const { data: existingRow, error: fetchError } = await supabase
            .from('CosmicForge_saves')
            .select('*')
            .eq('pioneer_name', userId)
            .single();

        if (fetchError) {
            throw fetchError;
        }

        const currentTimestamp = new Date().toISOString();
        const backupUserId = `graveyard_${userId}`;

        const { error: insertError } = await supabase
            .from('CosmicForge_saves')
            .insert([{
                pioneer_name: backupUserId,
                data: existingRow.data,
                created_at: currentTimestamp,
                region: existingRow.region,
                feedback: existingRow.feedback,
                feedback_content: existingRow.feedback_content
            }]);

        if (insertError) {
            throw insertError;
        }

        const { error: updateError } = await supabase
            .from('CosmicForge_saves')
            .update({ data: null })
            .eq('pioneer_name', userId);

        if (updateError) {
            throw updateError;
        }

        showNotification('Cloud Save data deleted, Pioneer name can be re-used.', 'info', 3000, 'loadSave');

    } catch (error) {
        console.error('Error archiving and nulling save data:', error);
        showNotification('Failed to delete save data.', 'error', 3000, 'loadSave');
    }
}


export async function saveGameToCloud(gameData, type) {
    try {
        const userId = getSaveName();
        const currentTimestamp = new Date().toISOString();

        const { data: existingData, error: fetchError } = await supabase
            .from('CosmicForge_saves')
            .select('*')
            .eq('pioneer_name', userId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
        }

        if (existingData) {
            const { error: updateError } = await supabase
                .from('CosmicForge_saves')
                .update({ 
                    data: gameData,
                    'created_at': currentTimestamp,
                    'region': getUserPlatform(),
                    'feedback': getFeedbackGiven(),
                    'feedback_content': getFeedbackContent()
                })
                .eq('pioneer_name', userId);

            if (updateError) {
                throw updateError;
            }

            if (type !== 'initialise') {
                showNotification('Game updated in the cloud!', 'info', 3000, 'loadSave');
            }
        } else {
            const { error: insertError } = await supabase
                .from('CosmicForge_saves')
                .insert([{ pioneer_name: userId, data: gameData, 'created_at': currentTimestamp }]);

            if (insertError) {
                throw insertError;
            }

            if (type !== 'initialise') {
                showNotification('Game saved to the cloud!', 'info', 3000, 'loadSave');
            }
        }

    } catch (error) {
        showNotification('Error saving game to cloud!', 'error', 3000, 'loadSave');
    }
}

export function saveGame(type) {
    const gameState = captureGameStatusForSaving(type);
    gameState.timeStamp = new Date().toISOString();

    const serializedGameState = JSON.stringify(gameState);
    const compressedSaveData = LZString.compressToEncodedURIComponent(serializedGameState);

    const saveGameArea = document.getElementById('exportSaveArea');
    if (saveGameArea) {
        setSaveData(compressedSaveData);
        saveGameArea.value = compressedSaveData;
        saveGameArea.readOnly = true;
    }

    if (type === 'initialise' || type === 'autoSave' || type === 'feedbackSave') {
        setSaveData(compressedSaveData);
    }
}

export function importSaveStringFileFromComputer() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';

    input.addEventListener('change', () => {
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const fileContents = event.target.result;

            if (typeof fileContents === 'string') {
                const textArea = document.getElementById('importSaveArea');
                if (textArea) {
                    textArea.value = fileContents;
                }

                try {
                    await loadGame();
                } catch (err) {
                    console.error('Load failed from file import:', err);
                }
            }
        };

        reader.readAsText(file);
    });

    input.click();
}

export function downloadSaveStringToComputer() {
    const saveArea = document.getElementById('exportSaveArea');
    if (!saveArea || !saveArea.value) {
        console.warn('No save data found to download.');
        return;
    }

    const saveData = saveArea.value;
    const blob = new Blob([saveData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const now = new Date();
    const formattedTimestamp = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')} : ${String(now.getHours()).padStart(2, '0')}_${String(now.getMinutes()).padStart(2, '0')}_${String(now.getSeconds()).padStart(2, '0')}`;
    a.download = `cosmic_forge_save_${formattedTimestamp}.txt`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function copySaveStringToClipBoard() {
    const textArea = document.getElementById('exportSaveArea');
    textArea.select();
    textArea.setSelectionRange(0, 99999);

    try {
        navigator.clipboard.writeText(textArea.value)
            .then(() => {
                showNotification('Data copied to clipboard!', 'info', 3000, 'loadSave');
            })
            .catch(err => {
                showNotification('Error copying data! If on Chrome, this could be expected.  Select and copy the text string manually!', 'error', 3000, 'loadSave');
                console.log('Error copying data! ' + err);
            })
            .finally(() => {
                textArea.setSelectionRange(0, 0);
            })
    } catch (err) {
        console.log('Error copying data! ' + err);
    }
}

export async function loadGameFromCloud() {
    try {
        const userId = localStorage.getItem('saveName') || getSaveName();

        const { data, error } = await supabase
            .from('CosmicForge_saves')
            .select('data')
            .eq('pioneer_name', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        if (!data) {
            // No row found at all
            showNotification('No saved game data found.', 'warning', 3000, 'loadSave');
            return false;
        }

        if (data.data === null) {
            showNotification('This Pioneer name is being reused for a new game.', 'info', 5000, 'loadSave');
            return false;
        }

        const gameData = data.data;
        const decompressedJson = LZString.decompressFromEncodedURIComponent(gameData);
        const gameState = JSON.parse(decompressedJson);

        await initialiseLoadedGame(gameState, 'cloud');
        setAchievementIconImageUrls();
        getNavigatorLanguage();
        showNotification('Game loaded successfully!', 'info', 3000, 'loadSave');
        return true;

    } catch (error) {
        console.error("Error loading game from cloud:", error);
        showNotification('Error loading game data from the cloud.', 'error', 3000, 'loadSave');
        return false;
    }
}

export function loadGame() {
    return new Promise((resolve, reject) => {
        const textArea = document.getElementById('importSaveArea');
        if (!textArea || !textArea.value.trim()) {
            return reject('No valid save data found in the import area.');
        }

        try {
            const compressed = textArea.value.trim();

            // Validate the compressed string before processing
            if (!validateSaveString(compressed)) {
                showNotification('Invalid game data string. Please check and try again.', 'warning', 3000, 'loadSave');
                return reject('Invalid game data string');
            }

            const decompressedJson = LZString.decompressFromEncodedURIComponent(compressed);
            const gameState = JSON.parse(decompressedJson);

            initialiseLoadedGame(gameState, 'textImport')
                .then(() => {
                    setAchievementIconImageUrls();
                    showNotification('Game loaded successfully!', 'info', 3000, 'loadSave');
                    resolve();
                })
                .catch(error => {
                    console.error('Error initializing game:', error);
                    showNotification('Error initializing game. Please make sure the data is correct.', 'error', 3000, 'loadSave');
                    reject(error);
                });

        } catch (error) {
            console.error('Error loading game:', error);
            showNotification('Error loading game. Please make sure the string contains valid game data.', 'error', 3000, 'loadSave');
            reject(error);
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {

});

function validateSaveString(compressed) {
    try {
        const decompressedJson = LZString.decompressFromEncodedURIComponent(compressed);
        JSON.parse(decompressedJson);
        return decompressedJson !== null;
    } catch {
        return false;
    }
}

async function initialiseLoadedGame(gameState, type) {
    await restoreGameStatus(gameState, type);
}

export function generateRandomPioneerName() {
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';

    for (let i = 0; i < 8; i++) {
        randomString += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }

    const pioneerName = `Pioneer-${randomString}`;
    setSaveName(pioneerName);
}

export function migrateResourceData(saveData, objectType) {
    const currentVersion = getCurrentGameVersion();
    saveData.version = saveData.version ? saveData.version : getMinimumVersion();

    while (saveData.version < currentVersion) {

        if (saveData.version < 0.76) {
            if (objectType === 'resourceData') {
                saveData.techs = {
                    knowledgeSharing: { appearsAt: [0, null, null], prereqs: [null], price: 150, idForRenderPosition: 10, path: 1 },
                    fusionTheory: { appearsAt: [500, "knowledgeSharing", ""], prereqs: ['Knowledge Sharing'], price: 750, idForRenderPosition: 20, path: 1 },
                    hydrogenFusion: { appearsAt: [1000, "fusionTheory", ""], prereqs: ['Fusion Theory'], price: 1150, idForRenderPosition: 30, path: 1 },
                    heliumFusion: { appearsAt: [2000, "hydrogenFusion", ""], prereqs: ['Hydrogen Fusion'], price: 2300, idForRenderPosition: 40, path: 1 },
                    carbonFusion: { appearsAt: [4100, "nobleGasCollection", ""], prereqs: ['Noble Gas Collection'], price: 4300, idForRenderPosition: 50, path: 1 },

                    basicPowerGeneration: { appearsAt: [3000, "heliumFusion", ""], prereqs: ['Helium Fusion'], price: 4200, idForRenderPosition: 51, path: 2 },
                    sodiumIonPowerStorage: { appearsAt: [5000, "basicPowerGeneration", ""], prereqs: ['Basic Power Generation'], price: 7000, idForRenderPosition: 52, path: 2 },
                    solarPowerGeneration: { appearsAt: [12000, "steelFoundries", "glassManufacture"], prereqs: ['Steel Foundries', 'Glass Manufacture'], price: 15000, idForRenderPosition: 53, path: 2 },
                    giganticTurbines: { appearsAt: [4200, "hydroCarbons", ""], prereqs: ['HydroCarbons'], price: 4800, idForRenderPosition: 54, path: 2 },
                    advancedPowerGeneration: { appearsAt: [6000, "giganticTurbines", "basicPowerGeneration"], prereqs: ['Gigantic Turbines', 'Basic Power Generation'], price: 8000, idForRenderPosition: 55, path: 2 },
                    rocketComposites: { appearsAt: [28000, "neutronCapture", "nanoTubeTechnology", "steelFoundries"], prereqs: ['Neutron Capture', 'Nano Tube Technology', 'Steel Foundries'], price: 34000, idForRenderPosition: 56, path: 5 },
                    advancedFuels: { appearsAt: [25000, "hydroCarbons", "neutronCapture", "advancedPowerGeneration"], prereqs: ['HydroCarbons', 'Neutron Capture', 'Advanced Power Generation'], price: 30000, idForRenderPosition: 57, path: 2 },
                    planetaryNavigation: { appearsAt: [27000, "atmosphericTelescopes", "rocketComposites", "quantumComputing"], prereqs: ['Atmospheric Telescopes', 'Rocket Composites', 'Quantum Computing'], price: 29000, idForRenderPosition: 58, path: 5 },

                    neonFusion: { appearsAt: [5000, "carbonFusion", ""], prereqs: ['Carbon Fusion'], price: 5750, idForRenderPosition: 60, path: 1 },
                    oxygenFusion: { appearsAt: [7000, "neonFusion", ""], prereqs: ['Neon Fusion'], price: 8000, idForRenderPosition: 70, path: 1 },
                    compounds: { appearsAt: [8000, "hydrogenFusion", "carbonFusion"], prereqs: ['Hydrogen Fusion', 'Carbon Fusion'], price: 9000, idForRenderPosition: 70, path: 1 },
                    siliconFusion: { appearsAt: [10000, "oxygenFusion", ""], prereqs: ['Oxygen Fusion'], price: 11500, idForRenderPosition: 80, path: 1 },
                    aggregateMixing: { appearsAt: [12000, "siliconFusion", ""], prereqs: ['Silicon Fusion'], price: 13000, idForRenderPosition: 81, path: 1 },
                    steelFoundries: { appearsAt: [11500, "siliconFusion", ""], prereqs: ['Silicon Fusion'], price: 13000, idForRenderPosition: 82, path: 1 },

                    nanoTubeTechnology: { appearsAt: [3500, "heliumFusion", ""], prereqs: ['Helium Fusion'], price: 4000, idForRenderPosition: 499, path: 4 },
                    nanoBrokers: { appearsAt: [18000, "nanoTubeTechnology", "steelFoundries", "compounds"], prereqs: ['Nano Tube Technology', 'Steel Foundries', 'Compounds'], price: 19000, idForRenderPosition: 498, path: 4 },
                    hydroCarbons: { appearsAt: [3200, "basicPowerGeneration", ""], prereqs: ['Basic Power Generation'], price: 3800, idForRenderPosition: 500, path: 2 },
                    stellarCartography: { appearsAt: [700, null], prereqs: [null], price: 800, idForRenderPosition: 510, path: 4 },
                    quantumComputing: { appearsAt: [3500, "nanoTubeTechnology", ""], prereqs: ['Nano Tube Technology'], price: 5750, idForRenderPosition: 520, path: 4 },
                    scienceLaboratories: { appearsAt: [5750, "quantumComputing", ""], prereqs: ['Quantum Computing'], price: 7000, idForRenderPosition: 521, path: 4 },
                    nobleGasCollection: { appearsAt: [4000, "nanoTubeTechnology", ""], prereqs: ['Nano Tube Technology'], price: 4500, idForRenderPosition: 530, path: 4 },
                    neutronCapture: { appearsAt: [20000, "siliconFusion", ""], prereqs: ['Silicon Fusion'], price: 23000, idForRenderPosition: 600, path: 5 },
                    glassManufacture: { appearsAt: [8000, "oxygenFusion", ""], prereqs: ['Oxygen Fusion'], price: 9000, idForRenderPosition: 700, path: 4 },
                    atmosphericTelescopes: { appearsAt: [9000, "glassManufacture", "stellarCartography"], prereqs: ['Glass Manufacture', 'Stellar Cartography'], price: 10000, idForRenderPosition: 700, path: 4 },

                    fusionEfficiencyI: { appearsAt: [1500, "fusionTheory", ""], prereqs: ['Fusion Theory'], price: 1750, idForRenderPosition: 9000, path: 10 },
                    fusionEfficiencyII: { appearsAt: [3000, "fusionEfficiencyI", ""], prereqs: ['Fusion Efficiency I'], price: 3500, idForRenderPosition: 9010, path: 10 },
                    fusionEfficiencyIII: { appearsAt: [9000, "fusionEfficiencyII", ""], prereqs: ['Fusion Efficiency II'], price: 10000, idForRenderPosition: 9030, path: 10 },
                    orbitalConstruction: { appearsAt: [45000, "planetaryNavigation", "rocketComposites", ""], prereqs: ['Planetary Navigation', 'Rocket Composites'], price: 50000, idForRenderPosition: 9100, path: 5 },
                    antimatterEngines: { appearsAt: [65000, "orbitalConstruction", "neutronCapture", "FTLTravelTheory"], prereqs: ['Orbital Construction', 'Neutron Capture', 'FTL Travel Theory'], price: 78000, idForRenderPosition: 9101, path: 5 },
                    FTLTravelTheory: { appearsAt: [60000, "neutronCapture", "planetaryNavigation", "advancedFuels"], prereqs: ['Neutron Capture', 'Planetary Navigation', 'Advanced Fuels'], price: 65000, idForRenderPosition: 9102, path: 5 },
                    lifeSupportSystems: { appearsAt: [55000, "orbitalConstruction", "nanoTubeTechnology", "quantumComputing"], prereqs: ['Orbital Construction', 'Nano Tube Technology', 'Quantum Computing'], price: 60000, idForRenderPosition: 9103, path: 5 },
                    starshipFleets: { appearsAt: [80000, "FTLTravelTheory", "antimatterEngines", "orbitalConstruction"], prereqs: ['FTL Travel Theory', 'Antimatter Engines', 'Orbital Construction'], price: 100000, idForRenderPosition: 9104, path: 5 },
                    stellarScanners: { appearsAt: [70000, "FTLTravelTheory", "orbitalConstruction"], prereqs: ['FTL Travel Theory', 'Orbital Construction'], price: 72000, idForRenderPosition: 9105, path: 5 },

                    // Megastructure Investigation Techs
                    dysonSphereUnderstanding: { appearsAt: [40000, "advancedPowerGeneration", ""], prereqs: ['Advanced Power Generation'], price: 50000, idForRenderPosition: 10001, special: 'megastructure', path: 6 },
                    dysonSphereCapabilities: { appearsAt: [80000, "dysonSphereUnderstanding", ""], prereqs: ['Dyson Sphere Understanding'], price: 100000, idForRenderPosition: 10002, special: 'megastructure', path: 6 },
                    dysonSphereDisconnect: { appearsAt: [120000, "dysonSphereCapabilities", ""], prereqs: ['Dyson Sphere Capabilities'], price: 150000, idForRenderPosition: 10003, special: 'megastructure', path: 6 },
                    dysonSpherePower: { appearsAt: [160000, "dysonSphereDisconnect", ""], prereqs: ['Dyson Sphere Disconnect'], price: 200000, idForRenderPosition: 10004, special: 'megastructure', path: 6 },
                    dysonSphereConnect: { appearsAt: [200000, "dysonSpherePower", ""], prereqs: ['Dyson Sphere Power'], price: 250000, idForRenderPosition: 10005, special: 'megastructure', path: 6 },

                    celestialProcessingCoreUnderstanding: { appearsAt: [40000, "quantumComputing", ""], prereqs: ['Quantum Computing'], price: 50000, idForRenderPosition: 10101, special: 'megastructure', path: 7 },
                    celestialProcessingCoreCapabilities: { appearsAt: [80000, "celestialProcessingCoreUnderstanding", ""], prereqs: ['Celestial Processing Core Understanding'], price: 100000, idForRenderPosition: 10102, special: 'megastructure', path: 7 },
                    celestialProcessingCoreDisconnect: { appearsAt: [120000, "celestialProcessingCoreCapabilities", ""], prereqs: ['Celestial Processing Core Capabilities'], price: 150000, idForRenderPosition: 10103, special: 'megastructure', path: 7 },
                    celestialProcessingCorePower: { appearsAt: [160000, "celestialProcessingCoreDisconnect", ""], prereqs: ['Celestial Processing Core Disconnect'], price: 200000, idForRenderPosition: 10104, special: 'megastructure', path: 7 },
                    celestialProcessingCoreConnect: { appearsAt: [200000, "celestialProcessingCorePower", ""], prereqs: ['Celestial Processing Core Power'], price: 250000, idForRenderPosition: 10105, special: 'megastructure', path: 7 },

                    plasmaForgeUnderstanding: { appearsAt: [40000, "neutronCapture", ""], prereqs: ['Neutron Capture'], price: 50000, idForRenderPosition: 10201, special: 'megastructure', path: 8 },
                    plasmaForgeCapabilities: { appearsAt: [80000, "plasmaForgeUnderstanding", ""], prereqs: ['Plasma Forge Understanding'], price: 100000, idForRenderPosition: 10202, special: 'megastructure', path: 8 },
                    plasmaForgeDisconnect: { appearsAt: [120000, "plasmaForgeCapabilities", ""], prereqs: ['Plasma Forge Capabilities'], price: 150000, idForRenderPosition: 10203, special: 'megastructure', path: 8 },
                    plasmaForgePower: { appearsAt: [160000, "plasmaForgeDisconnect", ""], prereqs: ['Plasma Forge Disconnect'], price: 200000, idForRenderPosition: 10204, special: 'megastructure', path: 8 },
                    plasmaForgeConnect: { appearsAt: [200000, "plasmaForgePower", ""], prereqs: ['Plasma Forge Power'], price: 250000, idForRenderPosition: 10205, special: 'megastructure', path: 8 },

                    galacticMemoryArchiveUnderstanding: { appearsAt: [50000, "orbitalConstruction", ""], prereqs: ['Orbital Construction'], price: 50000, idForRenderPosition: 10301, special: 'megastructure', path: 9 },
                    galacticMemoryArchiveCapabilities: { appearsAt: [100000, "galacticMemoryArchiveUnderstanding", ""], prereqs: ['Galactic Memory Archive Understanding'], price: 100000, idForRenderPosition: 10302, special: 'megastructure', path: 9 },
                    galacticMemoryArchiveDisconnect: { appearsAt: [150000, "galacticMemoryArchiveCapabilities", ""], prereqs: ['Galactic Memory Archive Capabilities'], price: 150000, idForRenderPosition: 10303, special: 'megastructure', path: 9 },
                    galacticMemoryArchivePower: { appearsAt: [200000, "galacticMemoryArchiveDisconnect", ""], prereqs: ['Galactic Memory Archive Disconnect'], price: 200000, idForRenderPosition: 10304, special: 'megastructure', path: 9 },
                    galacticMemoryArchiveConnect: { appearsAt: [250000, "galacticMemoryArchivePower", ""], prereqs: ['Galactic Memory Archive Power'], price: 250000, idForRenderPosition: 10305, special: 'megastructure', path: 9 },
                }
            }
            saveData.version = 0.76;
        }

        if (saveData.version < 0.77) {
            if (objectType === 'ascendencyBuffsData') {
                saveData.roboticResearchAutomation = {
                    name: "Robotic Research Automation",
                    description: "buffRoboticResearchAutomationRow",
                    rebuyable: false,
                    rebuyableIncreaseMultiple: 1,
                    baseCostAp: 20,
                    effectCategoryMagnitude: 1,
                    boughtYet: 0,
                    timesRebuyable: 100000
                };
            }

            if (objectType === 'resourceData') {
                saveData.research.upgrades.autoBuyer = {
                    active: false,
                    enabled: false
                }
            }
            saveData.version = 0.77;
        }

        saveData.version += 0.001;
    }

    return saveData;
}
