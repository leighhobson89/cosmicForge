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
    getFeedbackContent
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
        console.log("Clearing existing auto-save timer.");
        clearTimeout(autoSaveTimer);
    }

    const frequency = getAutoSaveFrequency();
    console.log("Auto-save initialized with frequency:", frequency, "ms");

    let timeLeft = frequency / 1000;

    const autoSaveHandler = () => {

        if (getAutoSaveToggle()) {
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

        // Migration for version 0.74 or lower
        if (saveData.version < 0.74) {
            if (objectType === 'resourceData') {
                // Add the new techs to the saveData.techs object for versions <= 0.74
                const newTechs = {
                    dysonSphereUnderstanding: { appearsAt: [40000, "advancedPowerGeneration", ""], prereqs: ['Advanced Power Generation'], price: 50000, idForRenderPosition: 10001, special: 'megastructure' },
                    dysonSphereCapabilities: { appearsAt: [80000, "dysonSphereUnderstanding", ""], prereqs: ['Dyson Sphere Understanding'], price: 100000, idForRenderPosition: 10002, special: 'megastructure' },
                    dysonSphereDisconnect: { appearsAt: [120000, "dysonSphereCapabilities", ""], prereqs: ['Dyson Sphere Capabilities'], price: 150000, idForRenderPosition: 10003, special: 'megastructure' },
                    dysonSpherePower: { appearsAt: [160000, "dysonSphereDisconnect", ""], prereqs: ['Dyson Sphere Disconnect'], price: 200000, idForRenderPosition: 10004, special: 'megastructure' },
                    dysonSphereConnect: { appearsAt: [200000, "dysonSpherePower", ""], prereqs: ['Dyson Sphere Power'], price: 250000, idForRenderPosition: 10005, special: 'megastructure' },

                    celestialProcessingCoreUnderstanding: { appearsAt: [40000, "quantumComputing", ""], prereqs: ['Quantum Computing'], price: 50000, idForRenderPosition: 10101, special: 'megastructure' },
                    celestialProcessingCoreCapabilities: { appearsAt: [80000, "celestialProcessingCoreUnderstanding", ""], prereqs: ['Celestial Processing Core Understanding'], price: 100000, idForRenderPosition: 10102, special: 'megastructure' },
                    celestialProcessingCoreDisconnect: { appearsAt: [120000, "celestialProcessingCoreCapabilities", ""], prereqs: ['Celestial Processing Core Capabilities'], price: 150000, idForRenderPosition: 10103, special: 'megastructure' },
                    celestialProcessingCorePower: { appearsAt: [160000, "celestialProcessingCoreDisconnect", ""], prereqs: ['Celestial Processing Core Disconnect'], price: 200000, idForRenderPosition: 10104, special: 'megastructure' },
                    celestialProcessingCoreConnect: { appearsAt: [200000, "celestialProcessingCorePower", ""], prereqs: ['Celestial Processing Core Power'], price: 250000, idForRenderPosition: 10105, special: 'megastructure' },

                    plasmaForgeUnderstanding: { appearsAt: [40000, "neutronCapture", ""], prereqs: ['Neutron Capture'], price: 50000, idForRenderPosition: 10201, special: 'megastructure' },
                    plasmaForgeCapabilities: { appearsAt: [80000, "plasmaForgeUnderstanding", ""], prereqs: ['Plasma Forge Understanding'], price: 100000, idForRenderPosition: 10202, special: 'megastructure' },
                    plasmaForgeDisconnect: { appearsAt: [120000, "plasmaForgeCapabilities", ""], prereqs: ['Plasma Forge Capabilities'], price: 150000, idForRenderPosition: 10203, special: 'megastructure' },
                    plasmaForgePower: { appearsAt: [160000, "plasmaForgeDisconnect", ""], prereqs: ['Plasma Forge Disconnect'], price: 200000, idForRenderPosition: 10204, special: 'megastructure' },
                    plasmaForgeConnect: { appearsAt: [200000, "plasmaForgePower", ""], prereqs: ['Plasma Forge Power'], price: 250000, idForRenderPosition: 10205, special: 'megastructure' },

                    galacticMemoryArchiveUnderstanding: { appearsAt: [50000, "orbitalConstruction", ""], prereqs: ['Orbital Construction'], price: 50000, idForRenderPosition: 10301, special: 'megastructure' },
                    galacticMemoryArchiveCapabilities: { appearsAt: [100000, "galacticMemoryArchiveUnderstanding", ""], prereqs: ['Galactic Memory Archive Understanding'], price: 100000, idForRenderPosition: 10302, special: 'megastructure' },
                    galacticMemoryArchiveDisconnect: { appearsAt: [150000, "galacticMemoryArchiveCapabilities", ""], prereqs: ['Galactic Memory Archive Capabilities'], price: 150000, idForRenderPosition: 10303, special: 'megastructure' },
                    galacticMemoryArchivePower: { appearsAt: [200000, "galacticMemoryArchiveDisconnect", ""], prereqs: ['Galactic Memory Archive Disconnect'], price: 200000, idForRenderPosition: 10304, special: 'megastructure' },
                    galacticMemoryArchiveConnect: { appearsAt: [250000, "galacticMemoryArchivePower", ""], prereqs: ['Galactic Memory Archive Power'], price: 250000, idForRenderPosition: 10305, special: 'megastructure' }
                };

                // Add the new techs to the saveData.techs object
                saveData.techs = {
                    ...saveData.techs,
                    ...newTechs
                };
            }
            saveData.version = 0.74;
        }

        saveData.version += 0.001;
    }

    return saveData;
}
