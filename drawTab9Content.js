import { getCurrentOptionPane, getCurrentTheme, setAutoSaveToggle, getAutoSaveToggle, getAutoSaveFrequency, setAutoSaveFrequency, getSaveData, setSaveData, getCurrencySymbol, setCurrencySymbol, getNotationType, setNotationType, setNotificationsToggle, getNotificationsToggle, getSaveName, getWeatherEffectSetting, setWeatherEffectSetting, setNewsTickerSetting, getNewsTickerSetting, setSaveExportCloudFlag, getBackgroundAudio, setBackgroundAudio, getSfx, setSfx, setWasAutoSaveToggled, setMouseParticleTrailEnabled, getMouseParticleTrailEnabled, setCustomPointerEnabled, getCustomPointerEnabled, getOnboardingMode, getDemoBuild } from './constantsAndGlobalVars.js';
import { createButton, createTextFieldArea, createOptionRow, createDropdown, createToggleSwitch, createHtmlTableAchievementsGrid, createHtmlTableStatistics, createHtmlTextAreaProse, toggleGameFullScreen, selectTheme, callPopupModal, showHideModal, showNotification, applyCustomPointerSetting, setElementPointerEvents, fadeInStartupOverlay, setupAchievementTooltip } from './ui.js';
import { importSaveStringFileFromComputer, downloadSaveStringToComputer, initializeAutoSave, saveGame, saveGameToCloud, loadGameFromCloud, copySaveStringToClipBoard, loadGame, destroySaveGameOnCloud } from './saveLoadGame.js';
import { hardResetWarningHeader, hardResetWarningText, getStatisticsContent, getHelpContent } from './descriptions.js';
import { setAchievementIconImageUrls, getAchievementPositionData } from './resourceDataObject.js';
import { trackAnalyticsEvent } from './analytics.js';

export function drawTab9Content(heading, optionContentElement) {
    if (heading === 'Contact') createHelpSectionRow('contactRow', ['discord-link', 'email-link']);
    if (heading === 'Get Started') createHelpSectionRow('getStartedRow', []);
    if (heading === 'Story') createHelpSectionRow('storyRow', []);
    if (heading === 'Concepts - Early') createHelpSectionRow('conceptsEarlyRow', []);
    if (heading === 'Concepts - Mid') createHelpSectionRow('conceptsMidRow', []);
    if (heading === 'Concepts - Late') createHelpSectionRow('conceptsLateRow', []);
    if (heading === 'Concepts - End Goal') createHelpSectionRow('conceptsEndGoalRow', []);
    if (heading === 'Philosophies') createHelpSectionRow('philosophies', []);
    if (heading === 'Statistics') createStatisticsSectionRow('statisticsRow');
    if (heading === 'Achievements') createAchievementsSectionRow('achievementsRow');
    if (heading === 'Events') createEventsSectionRow('eventsRow');

    if (heading === 'Exit Game') {
        const exitGameRow = createOptionRow({
            labelId: 'exitGameRow',
            renderNameABs: null,
            labelText: 'Exit Game:',
            inputElements: [
                createButton({
                    text: 'EXIT GAME',
                    classNames: ['option-button', 'green-ready-text'],
                    onClick: () => {
                        const ua = (typeof window !== 'undefined' && window.navigator?.userAgent) ? window.navigator.userAgent.toLowerCase() : '';
                        const isElectron = ua.includes('electron') || (typeof window !== 'undefined' && window.process?.versions?.electron);
                        if (!isElectron) {
                            return;
                        }

                        callPopupModal(
                            'EXIT GAME',
                            'Would you like to save to the cloud before exiting?',
                            true,
                            true,
                            true,
                            false,
                            function() {
                                showHideModal();
                                (async () => {
                                    await fadeInStartupOverlay(2000);
                                    window.close();
                                })().catch((error) => {
                                    console.error('Exit & Don\'t Save failed:', error);
                                    window.close();
                                });
                            },
                            function() {
                                showHideModal();
                            },
                            function() {
                                (async () => {
                                    if (getOnboardingMode()) {
                                        showNotification("You can't save while onboarding mode is active!", 'info', 4000, 'loadSave');
                                        return;
                                    }

                                    if (getDemoBuild()) {
                                        showNotification('Saving is disabled in the demo build!', 'info', 4000, 'loadSave');
                                        return;
                                    }

                                    saveGame('manualExportCloud');
                                    const saveData = getSaveData();
                                    if (!saveData) {
                                        showNotification('No save data available to export.', 'error', 3000, 'loadSave');
                                        return;
                                    }

                                    let savedOk = false;
                                    try {
                                        savedOk = await saveGameToCloud(saveData, 'manualExportCloud');
                                        if (savedOk) {
                                            setSaveExportCloudFlag(saveData);
                                        }
                                    } finally {
                                        setSaveData(null);
                                    }

                                    if (!savedOk) {
                                        return;
                                    }

                                    showHideModal();
                                    await fadeInStartupOverlay(2000);
                                    window.close();
                                })().catch((error) => {
                                    console.error('Exit & Save failed:', error);
                                    showNotification('Error saving game to cloud!', 'error', 3000, 'loadSave');
                                });
                            },
                            null,
                            "EXIT AND DON'T SAVE",
                            'CANCEL',
                            'EXIT AND SAVE',
                            null,
                            false
                        );
                    },
                }),
            ],
            descriptionText: 'Here you can Exit The Game',
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: [true, '25%', '80%'],
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });

        optionContentElement.appendChild(exitGameRow);
    }

    if (heading === 'Visual') {
        const settingsCurrencySymbolRow = createOptionRow({
            labelId: 'settingsCurrencySymbolRow',
            renderNameABs: null,
            labelText: 'Currency:',
            inputElements: [
                createDropdown('currencySelect', [
                    { value: '$', text: 'Dollar ($)' },
                    { value: '€', text: 'Euro (€)' },
                    { value: '£', text: 'Pound (£)' },
                    { value: '¥', text: 'Yen (¥)' },
                    { value: '₹', text: 'Rupee (₹)' },
                    { value: '₩', text: 'Won (₩)' },
                    { value: '₣', text: 'Franc (₣)' },
                    { value: '₿', text: 'Bitcoin (₿)' },
                ], getCurrencySymbol(), (value) => {
                    setCurrencySymbol(value);
                }),
            ],
            descriptionText: 'Change the symbol used for Cash (Visual Only).',
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        optionContentElement.appendChild(settingsCurrencySymbolRow);

        const settingsNotationRow = createOptionRow({
            labelId: 'settingsNotationRow',
            renderNameABs: null,
            labelText: 'Notation:',
            inputElements: [
                createDropdown('notationSelect', [
                    { value: 'normalCondensed', text: 'Normal Condensed' },
                    { value: 'normal', text: 'Normal' },
                ], getNotationType(), (value) => {
                    setNotationType(value);
                }),
            ],
            descriptionText: 'Change the notation used.',
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        optionContentElement.appendChild(settingsNotationRow);

        const settingsToggleNotificationsRow = createOptionRow({
            labelId: 'settingsToggleNotificationsRow',
            renderNameABs: null,
            labelText: 'Toggle Notifications:',
            inputElements: [
                createToggleSwitch('notificationsToggle', true, (isEnabled) => {
                    setNotificationsToggle(isEnabled);
                }, null),
            ],
            descriptionText: 'Toggle notifications',
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        optionContentElement.appendChild(settingsToggleNotificationsRow);

        const customPointerToggleRow = createOptionRow({
            labelId: 'customPointerToggleRow',
            renderNameABs: null,
            labelText: 'Custom Pointer:',
            inputElements: [
                createToggleSwitch('customPointerToggle', false, (isEnabled) => {
                    setCustomPointerEnabled(isEnabled);
                    applyCustomPointerSetting();
                    trackAnalyticsEvent('settings_changed', {
                        setting_id: 'custom_pointer',
                        enabled: !!isEnabled
                    }, { immediate: true, flushReason: 'settings' });
                    trackAnalyticsEvent('settings_snapshot', {
                        theme_id: getCurrentTheme(),
                        background_audio: !!getBackgroundAudio(),
                        sfx: !!getSfx(),
                        custom_pointer: !!getCustomPointerEnabled(),
                        mouse_trail: !!getMouseParticleTrailEnabled()
                    }, { immediate: true, flushReason: 'settings' });
                }, null),
            ],
            descriptionText: 'Toggle Cosmic Forge mouse cursor.',
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        optionContentElement.appendChild(customPointerToggleRow);

        const mouseTrailToggleRow = createOptionRow({
            labelId: 'mouseTrailToggleRow',
            renderNameABs: null,
            labelText: 'Mouse Trail:',
            inputElements: [
                createToggleSwitch('mouseTrailToggle', true, (isEnabled) => {
                    setMouseParticleTrailEnabled(isEnabled);
                    trackAnalyticsEvent('settings_changed', {
                        setting_id: 'mouse_trail',
                        enabled: !!isEnabled
                    }, { immediate: true, flushReason: 'settings' });
                    trackAnalyticsEvent('settings_snapshot', {
                        theme_id: getCurrentTheme(),
                        background_audio: !!getBackgroundAudio(),
                        sfx: !!getSfx(),
                        custom_pointer: !!getCustomPointerEnabled(),
                        mouse_trail: !!getMouseParticleTrailEnabled()
                    }, { immediate: true, flushReason: 'settings' });
                }, null),
            ],
            descriptionText: 'Toggle the mouse particle trail effect.',
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        optionContentElement.appendChild(mouseTrailToggleRow);

        const settingsThemeRow = createOptionRow({
            labelId: 'settingsThemeRow',
            renderNameABs: null,
            labelText: 'Theme:',
            inputElements: [
                createDropdown('themeSelect', [
                    { value: 'terminal', text: 'Terminal' },
                    { value: 'dark', text: 'Dark' },
                    { value: 'supernova', text: 'Supernova' },
                    { value: 'galaxy', text: 'Galaxy' },
                    { value: 'space', text: 'Space' },
                    { value: 'misty', text: 'Misty' },
                    { value: 'light', text: 'Light' },
                    { value: 'frosty', text: 'Frosty' },
                    { value: 'summer', text: 'Summer' },
                ], document.body.getAttribute('data-theme'), (value) => {
                    selectTheme(value);
                    setAchievementIconImageUrls();
                }),
            ],
            descriptionText: 'Change styling of the page.',
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        optionContentElement.appendChild(settingsThemeRow);

        const weatherEffectSettingsRow = createOptionRow({
            labelId: 'weatherEffectSettingsRow',
            renderNameABs: null,
            labelText: 'Weather Effects:',
            inputElements: [
                createToggleSwitch('weatherEffectSettingToggle', true, (isEnabled) => {
                    setWeatherEffectSetting(isEnabled);
                }, null),
            ],
            descriptionText: 'Toggle weather effects on or off.',
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        optionContentElement.appendChild(weatherEffectSettingsRow);

        const notificationsToggleElement = document.getElementById('notificationsToggle');
        if (notificationsToggleElement) {
            notificationsToggleElement.checked = getNotificationsToggle();
        }

        const customPointerToggleElement = document.getElementById('customPointerToggle');
        if (customPointerToggleElement) {
            customPointerToggleElement.checked = getCustomPointerEnabled();
        }

        const mouseTrailToggleElement = document.getElementById('mouseTrailToggle');
        if (mouseTrailToggleElement) {
            mouseTrailToggleElement.checked = getMouseParticleTrailEnabled();
        }
        
        const currencyDropdownElement = document.getElementById('currencySelect');
        if (currencyDropdownElement) {
            currencyDropdownElement.value = getCurrencySymbol();
        }
        
        const notationDropdownElement = document.getElementById('notationSelect');
        if (notationDropdownElement) {
            notationDropdownElement.value = getNotationType();
        }
        
        const themeDropdownElement = document.getElementById('themeSelect');
        if (themeDropdownElement) {
            themeDropdownElement.value = getCurrentTheme();
        }  
        
        const weatherEffectSettingToggleElement = document.getElementById('weatherEffectSettingToggle');
        if (weatherEffectSettingToggleElement) {
            weatherEffectSettingToggleElement.checked = getWeatherEffectSetting();
        } 
    }

    if (heading === 'Game Options') {

        const toggleGameFullScreenRow = createOptionRow({
            labelId: 'toggleGameFullScreenRow',
            renderNameABs: null,
            labelText: 'Toggle Full Screen:',
            inputElements: [
                createButton({
                    text: `Toggle`,
                    classNames: ['option-button', 'full-screen-button'],
                    onClick: () => {
                        toggleGameFullScreen();
                    },
                }),
            ],
            descriptionText: 'Toggle Full Screen Mode. (or F11)',
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        optionContentElement.appendChild(toggleGameFullScreenRow);

        const newsTickerToggleRow = createOptionRow({
            labelId: 'newsTickerToggleRow',
            renderNameABs: null,
            labelText: 'News Ticker Feature:',
            inputElements: [
                createToggleSwitch('newsTickerSettingToggle', true, (isEnabled) => {
                    setNewsTickerSetting(isEnabled);
                }, null),
            ],
            descriptionText: 'Toggle the News Ticker feature on or off.',
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        optionContentElement.appendChild(newsTickerToggleRow);

        const newsTickerSettingToggleElement = document.getElementById('newsTickerSettingToggle');
        if (newsTickerSettingToggleElement) {
            newsTickerSettingToggleElement.checked = getNewsTickerSetting();
        }

        const backGroundAudioRow = createOptionRow({
            labelId: 'backGroundAudioRow',
            renderNameABs: null,
            labelText: 'Background Ambience Sound:',
            inputElements: [
                createToggleSwitch('backGroundAudioToggle', false, (isEnabled) => {
                    setBackgroundAudio(isEnabled);
                    trackAnalyticsEvent('settings_changed', {
                        setting_id: 'background_audio',
                        enabled: !!isEnabled
                    }, { immediate: true, flushReason: 'settings' });
                    trackAnalyticsEvent('settings_snapshot', {
                        theme_id: getCurrentTheme(),
                        background_audio: !!getBackgroundAudio(),
                        sfx: !!getSfx(),
                        custom_pointer: !!getCustomPointerEnabled(),
                        mouse_trail: !!getMouseParticleTrailEnabled()
                    }, { immediate: true, flushReason: 'settings' });
                }, null),
            ],
            descriptionText: 'Toggle Background Ambience on or off.',
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        optionContentElement.appendChild(backGroundAudioRow);

        const backGroundAudioToggleElement = document.getElementById('backGroundAudioToggle');
        if (backGroundAudioToggleElement) {
            backGroundAudioToggleElement.checked = getBackgroundAudio();
        }

        const sfxAudioRow = createOptionRow({
            labelId: 'sfxAudioRow',
            renderNameABs: null,
            labelText: 'Sound Effects:',
            inputElements: [
                createToggleSwitch('sfxToggle', false, (isEnabled) => {
                    setSfx(isEnabled);
                    trackAnalyticsEvent('settings_changed', {
                        setting_id: 'sfx',
                        enabled: !!isEnabled
                    }, { immediate: true, flushReason: 'settings' });
                    trackAnalyticsEvent('settings_snapshot', {
                        theme_id: getCurrentTheme(),
                        background_audio: !!getBackgroundAudio(),
                        sfx: !!getSfx(),
                        custom_pointer: !!getCustomPointerEnabled(),
                        mouse_trail: !!getMouseParticleTrailEnabled()
                    }, { immediate: true, flushReason: 'settings' });
                }, null),
            ],
            descriptionText: 'Toggle Sound Effects on or off.',
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        optionContentElement.appendChild(sfxAudioRow);
        
        const sfxToggleElement = document.getElementById('sfxToggle');
        if (sfxToggleElement) {
            sfxToggleElement.checked = getSfx();
        }        
    }

    if (heading === 'Saving / Loading') {   
        const demoExtraClasses = getDemoBuild() ? ['electron-purple-demo-button'] : [];
        const autoSaveConfigRow = createOptionRow({
            labelId: 'autoSaveConfigRow',
            renderNameABs: null,
            labelText: 'Auto Save:',
            inputElements: [
                createDropdown('autoSaveFrequency', [
                    { value: 120000, text: '2 Minutes' },
                    { value: 180000, text: '3 Minutes' },
                    { value: 300000, text: '5 Minutes' },
                    { value: 600000, text: '10 Minutes' },
                ], parseInt(getAutoSaveFrequency()), (value) => {
                    setAutoSaveFrequency(parseInt(value));
                    initializeAutoSave();
                }),
                createToggleSwitch('autoSaveToggle', true, (isEnabled) => {
                    setAutoSaveToggle(isEnabled),
                    setWasAutoSaveToggled(getAutoSaveToggle());
                    initializeAutoSave();
                    if (!isEnabled) {
                        showNotification('AUTOSAVE IS OFF, REMEMBER TO BACK UP SAVES MANUALLY', 'error', 5000, 'loadSave');
                    }
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: '',
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        optionContentElement.appendChild(autoSaveConfigRow);

        if (getDemoBuild()) {
            const autoSaveToggleElement = document.getElementById('autoSaveToggle');
            if (autoSaveToggleElement) {
                autoSaveToggleElement.classList.add('electron-purple-demo-button');
            }

            const autoSaveToggleLabelElement = document.querySelector('label[for="autoSaveToggle"]');
            if (autoSaveToggleLabelElement) {
                autoSaveToggleLabelElement.classList.add('electron-purple-demo-button');
            }
        }

        const exportSaveRow = createOptionRow({
            labelId: 'exportSaveRow',
            renderNameABs: null,
            labelText: 'Export Save:',
            inputElements: [
                createTextFieldArea('exportSaveArea', ['export-save'], 'Save Data should appear here', null),
                createButton({
                    text: `Export`,
                    classNames: ['option-button', 'save-load-button', ...demoExtraClasses],
                    onClick: () => {
                        copySaveStringToClipBoard();
                    },
                }),
                createButton({
                    text: `Manual Save`,
                    classNames: ['option-button', 'save-load-file-export', ...demoExtraClasses],
                    onClick: () => {
                        downloadSaveStringToComputer();
                    },
                }),
            ],
            descriptionText: '',
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: [true, '17%', '83%'],
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        optionContentElement.appendChild(exportSaveRow);

        const importSaveRow = createOptionRow({
            labelId: 'importSaveRow',
            renderNameABs: null,
            labelText: 'Import Save:',
            inputElements: [
                createTextFieldArea('importSaveArea', ['import-save'], 'Please paste your Save Data here...', null),
                createButton({
                    text: `Import`,
                    classNames: ['option-button', 'save-load-button', ...demoExtraClasses],
                    onClick: () => {
                        loadGame();
                    },
                }),
                createButton({
                    text: `Manual Load`,
                    classNames: ['option-button', 'save-load-file-export', ...demoExtraClasses],
                    onClick: () => {
                        importSaveStringFileFromComputer();
                    },
                }),
            ],
            descriptionText: '',
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: [true, '17%', '83%'],
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        optionContentElement.appendChild(importSaveRow);

        const exportCloudSaveRow = createOptionRow({
            labelId: 'exportCloudSaveRow',
            renderNameABs: null,
            labelText: 'Export Cloud Save:',
            inputElements: [
                createButton({
                    text: `Save To Cloud`,
                    classNames: ['option-button', 'save-load-button', ...demoExtraClasses],
                    onClick: () => {
                        if (getOnboardingMode()) {
                            showNotification("You can't save while onboarding mode is active!", 'info', 4000, 'loadSave');
                            return;
                        }

                        saveGame('manualExportCloud');
                        const saveData = getSaveData();
                        if (saveData) {
                            saveGameToCloud(saveData, 'manualExportCloud');
                            setSaveExportCloudFlag(saveData);
                        }
                        setSaveData(null);
                    },
                }),
                Object.assign(document.createElement('span'), { innerHTML: 'Pioneer Name:', className: 'save-name-margin' }),
                createTextFieldArea('saveName', ['save-name', 'save-name-width', 'save-name-height', 'save-name-margin'], '', getSaveName()),
            ],
            descriptionText: '',
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: [true, '25%', '80%'],
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        optionContentElement.appendChild(exportCloudSaveRow);

        const importCloudSaveRow = createOptionRow({
            labelId: 'importCloudSaveRow',
            renderNameABs: null,
            labelText: 'Import Cloud Save:',
            inputElements: [
                createButton({
                    text: `Load From Cloud`,
                    classNames: ['option-button', 'save-load-button', ...demoExtraClasses],
                    onClick: () => {
                        loadGameFromCloud();
                    },
                }),
            ],
            descriptionText: '',
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: [true, '25%', '80%'],
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        optionContentElement.appendChild(importCloudSaveRow);

        const hardResetRow = createOptionRow({
            labelId: 'hardResetRow',
            renderNameABs: null,
            labelText: 'HARD RESET:',
            inputElements: [
                createButton({
                    text: `!!!RESET ALL GAME PROGRESS FOR THIS PIONEER NAME!!!`,
                    classNames: ['option-button', 'hard-reset-button'],
                    onClick: () => {
                        callPopupModal(
                            hardResetWarningHeader,
                            hardResetWarningText,
                            true,
                            true,
                            false,
                            false,
                            function () {
                                destroySaveGameOnCloud();
                                showNotification(
                                    `GAME HARD RESET!<br><br>Please REFRESH your Browser and use same Pioneer name to start the new game!`,
                                    'error',
                                    200000000,
                                    'special'
                                );
                                showHideModal();
                                document.getElementById('overlay').style.display = 'flex';
                            },
                            function () {
                                showHideModal();
                            },
                            null,
                            null,
                            '! RESET ALL PROGRESS, EVEN ON CLOUD !',
                            'CANCEL TO SAFETY',
                            null,
                            null,
                            false
                        );
                    },
                }),
            ],
            descriptionText: '',
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: [true, '25%', '80%'],
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        optionContentElement.appendChild(hardResetRow);

        const autoSaveToggleElement = document.getElementById('autoSaveToggle');
        if (autoSaveToggleElement) {
            autoSaveToggleElement.checked = getAutoSaveToggle();
        }
        
        const autoSaveFrequencyElement = document.getElementById('autoSaveFrequency');
        if (autoSaveFrequencyElement) {
            autoSaveFrequencyElement.value = getAutoSaveFrequency();
        }
    }

    function createHelpSectionRow(rowId, classes) {
        const defaultClasses = ['help-container', 'help-container-margin'];
        const combinedClasses = defaultClasses.concat(classes || []);
        
        const helpRow = createOptionRow({
            labelId: rowId,
            renderNameABs: null,
            labelText: '',
            inputElements: [
                createHtmlTextAreaProse(
                    `${rowId}TextArea`,
                    combinedClasses,
                    getHelpContent(getCurrentOptionPane(), 'subHeadings'),
                    getHelpContent(getCurrentOptionPane(), 'subBodys'),
                    ['help-sub-header-text'],
                    ['help-sub-body-text']
                ),
            ],
            descriptionText: '',
            resourcePriceObject: '',
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: '',
            noDescriptionContainer: [true, 'invisible', '100%'],
            specialInputContainerClasses: ['no-left-margin'],
            hideMainDescriptionRow: false
        });
        
        optionContentElement.appendChild(helpRow);

        const contactRowTextArea = document.getElementById('contactRowTextArea');

        if (helpRow && contactRowTextArea && contactRowTextArea.classList.contains('discord-link')) {
            const spans = helpRow.querySelectorAll('span');
            
            spans.forEach(span => {
                if (span.innerHTML.includes('discord.gg')) {
                    span.classList.add('green-ready-text');
                    span.style.cursor = 'pointer';
                    setElementPointerEvents(span, 'auto');
                    span.addEventListener('click', () => {
                        window.open(span.innerHTML, '_blank');
                    });
                }
            });
        }
        
        if (helpRow && contactRowTextArea && contactRowTextArea.classList.contains('email-link')) {
            const spans = helpRow.querySelectorAll('span');
            
            spans.forEach(span => {
                if (span.innerHTML.includes('@gmail.com')) {
                    span.classList.add('green-ready-text');
                    span.style.cursor = 'pointer';
                    setElementPointerEvents(span, 'auto');
                    span.addEventListener('click', () => {
                        window.open(`mailto:${span.innerHTML}`, '_blank');
                    });
                }
            });
        }        
    }   
    
    function createAchievementsSectionRow(rowId) {
        const achievementsData = Object.values(getAchievementPositionData());
    
        const achievementsRow = createOptionRow({
            labelId: rowId,
            renderNameABs: null,
            labelText: '',
            inputElements: [
                createHtmlTableAchievementsGrid(
                    `${rowId}AchievementsGrid`,
                    ['achievement-container', 'achievement-container-margin'],
                    achievementsData
                ),
            ],
            descriptionText: '',
            resourcePriceObject: '',
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: '',
            noDescriptionContainer: [true, '0%', '100%'],
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
    
        optionContentElement.appendChild(achievementsRow);
        setupAchievementTooltip();
    }      
    
    function createStatisticsSectionRow(rowId) {
        const statisticsRow = createOptionRow({
            labelId: rowId,
            renderNameABs: null,
            labelText: '',
            inputElements: [
                createHtmlTableStatistics(
                    `${rowId}TextArea`,
                    ['help-container', 'help-container-margin', 'center-statistics'],
                    getStatisticsContent('mainHeadings'),
                    getStatisticsContent('subHeadings'),
                    getStatisticsContent('subBodys')
                ),
            ],
            descriptionText: '',
            resourcePriceObject: '',
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: '',
            noDescriptionContainer: [true, '0%', '100%'],
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        
        optionContentElement.appendChild(statisticsRow);
    }

    function createEventsSectionRow(rowId) {
        const container = document.createElement('div');
        container.id = `${rowId}Container`;
        container.classList.add('events-container');

        const activeTitle = document.createElement('div');
        activeTitle.id = `${rowId}ActiveTitle`;
        activeTitle.classList.add('help-sub-header-text');
        activeTitle.innerHTML = 'Active Events';
        container.appendChild(activeTitle);

        const activeTable = document.createElement('table');
        activeTable.id = `${rowId}ActiveTable`;
        activeTable.classList.add('events-table');
        activeTable.innerHTML = `
            <thead>
                <tr>
                    <th>Event</th>
                    <th>Active Until</th>
                    <th>Effect</th>
                </tr>
            </thead>
            <tbody id="timedEventsActiveBody">
                <tr><td colspan="3">No active timed events.</td></tr>
            </tbody>
        `;
        container.appendChild(activeTable);

        const historyTitle = document.createElement('div');
        historyTitle.id = `${rowId}HistoryTitle`;
        historyTitle.classList.add('help-sub-header-text');
        historyTitle.style.marginTop = '14px';
        historyTitle.innerHTML = 'Event History';
        container.appendChild(historyTitle);

        const historyTable = document.createElement('table');
        historyTable.id = `${rowId}HistoryTable`;
        historyTable.classList.add('events-table');
        historyTable.innerHTML = `
            <thead>
                <tr>
                    <th>Event</th>
                    <th>Total Duration</th>
                    <th>Effect</th>
                </tr>
            </thead>
            <tbody id="timedEventsHistoryBody">
                <tr><td colspan="3">No completed timed events yet.</td></tr>
            </tbody>
        `;
        container.appendChild(historyTable);

        const eventsRow = createOptionRow({
            labelId: rowId,
            renderNameABs: null,
            labelText: '',
            inputElements: [
                container,
            ],
            descriptionText: '',
            resourcePriceObject: '',
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: '',
            noDescriptionContainer: [true, 'invisible', '100%'],
            specialInputContainerClasses: ['no-left-margin'],
            hideMainDescriptionRow: false
        });

        optionContentElement.appendChild(eventsRow);
    }
}
