import { getCurrentOptionPane, getCurrentTheme, setAutoSaveToggle, getAutoSaveToggle, getAutoSaveFrequency, setAutoSaveFrequency, getSaveData, setSaveData, getCurrencySymbol, setCurrencySymbol, getNotationType, setNotationType, setNotificationsToggle, getNotificationsToggle, getSaveName, getWeatherEffectSetting, setWeatherEffectSetting, setNewsTickerSetting, getNewsTickerSetting, setSaveExportCloudFlag, getBackgroundAudio, setBackgroundAudio, getSfx, setSfx, setWasAutoSaveToggled, setMouseParticleTrailEnabled, getMouseParticleTrailEnabled, setCustomPointerEnabled, getCustomPointerEnabled, getOnboardingMode, getDemoBuild, getLanguage } from './constantsAndGlobalVars.js';
import { createButton, createTextFieldArea, createOptionRow, createDropdown, createToggleSwitch, createHtmlTableAchievementsGrid, createHtmlTableStatistics, createHtmlTextAreaProse, toggleGameFullScreen, selectTheme, callPopupModal, showHideModal, showNotification, applyCustomPointerSetting, setElementPointerEvents, fadeInStartupOverlay, setupAchievementTooltip, relocalizeAll } from './ui.js';
import { localize } from './localization.js';
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
            labelText: localize('tab9ExitGameRowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: localize('headerMainExitGame', getLanguage()),
                    classNames: ['option-button', 'green-ready-text'],
                    onClick: () => {
                        const ua = (typeof window !== 'undefined' && window.navigator?.userAgent) ? window.navigator.userAgent.toLowerCase() : '';
                        const isElectron = ua.includes('electron') || (typeof window !== 'undefined' && window.process?.versions?.electron);
                        if (!isElectron) {
                            return;
                        }

                        callPopupModal({
                            header: localize('headerMainExitGame', getLanguage()),
                            content: localize('modalExitGameText', getLanguage()),
                            showConfirm: true,
                            showCancel: true,
                            showExtra1: true,
                            showExtra2: false,
                            onConfirm: function() {
                                showHideModal();
                                (async () => {
                                    await fadeInStartupOverlay(2000);
                                    window.close();
                                })().catch((error) => {
                                    console.error('Exit & Don\'t Save failed:', error);
                                    window.close();
                                });
                            },
                            onCancel: function() {
                                showHideModal();
                            },
                            onExtra1: function() {
                                (async () => {
                                    if (getOnboardingMode()) {
                                        showNotification(localize('notificationCannotSaveDuringOnboarding', getLanguage()), 'info', 4000, 'loadSave');
                                        return;
                                    }

                                    if (getDemoBuild()) {
                                        showNotification(localize('notificationSavingDisabledInDemo', getLanguage()), 'info', 4000, 'loadSave');
                                        return;
                                    }

                                    saveGame('manualExportCloud');
                                    const saveData = getSaveData();
                                    if (!saveData) {
                                        showNotification(localize('notificationNoSaveDataToExport', getLanguage()), 'error', 3000, 'loadSave');
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
                                    showNotification(localize('notificationErrorSavingToCloud', getLanguage()), 'error', 3000, 'loadSave');
                                });
                            },
                            onExtra2: null,
                            confirmLabel: localize('modalExitGameConfirmLabel', getLanguage()),
                            cancelLabel: localize('buttonCancel', getLanguage()),
                            extra1Label: localize('modalExitGameExtra1Label', getLanguage()),
                            extra2Label: null,
                            setupToolTips: false,
                        });
                    },
                }),
            ],
            descriptionText: localize('headerDescExitGame', getLanguage()),
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
            labelText: localize('tab9CurrencyRowLabel', getLanguage()),
            inputElements: [
                createDropdown('currencySelect', [
                    { value: '$', text: localize('dropdownCurrencyDollar', getLanguage()) },
                    { value: '€', text: localize('dropdownCurrencyEuro', getLanguage()) },
                    { value: '£', text: localize('dropdownCurrencyPound', getLanguage()) },
                    { value: '¥', text: localize('dropdownCurrencyYen', getLanguage()) },
                    { value: '₹', text: localize('dropdownCurrencyRupee', getLanguage()) },
                    { value: '₩', text: localize('dropdownCurrencyWon', getLanguage()) },
                    { value: '₣', text: localize('dropdownCurrencyFranc', getLanguage()) },
                    { value: '₿', text: localize('dropdownCurrencyBitcoin', getLanguage()) },
                ], getCurrencySymbol(), (value) => {
                    setCurrencySymbol(value);
                }),
            ],
            descriptionText: localize('tab9CurrencyRowDescription', getLanguage()),
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
            labelText: localize('tab9NotationRowLabel', getLanguage()),
            inputElements: [
                createDropdown('notationSelect', [
                    { value: 'normalCondensed', text: localize('dropdownNotationNormalCondensed', getLanguage()) },
                    { value: 'normal', text: localize('dropdownNotationNormal', getLanguage()) },
                ], getNotationType(), (value) => {
                    setNotationType(value);
                }),
            ],
            descriptionText: localize('tab9NotationRowDescription', getLanguage()),
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
            labelText: localize('tab9ToggleNotificationsRowLabel', getLanguage()),
            inputElements: [
                createToggleSwitch('notificationsToggle', true, (isEnabled) => {
                    setNotificationsToggle(isEnabled);
                }, null),
            ],
            descriptionText: localize('tab9ToggleNotificationsRowDescription', getLanguage()),
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
            labelText: localize('tab9CustomPointerRowLabel', getLanguage()),
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
            descriptionText: localize('tab9CustomPointerRowDescription', getLanguage()),
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
            labelText: localize('tab9MouseTrailRowLabel', getLanguage()),
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
            descriptionText: localize('tab9MouseTrailRowDescription', getLanguage()),
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
            labelText: localize('tab9ThemeRowLabel', getLanguage()),
            inputElements: [
                createDropdown('themeSelect', [
                    { value: 'terminal', text: localize('dropdownThemeTerminal', getLanguage()) },
                    { value: 'dark', text: localize('dropdownThemeDark', getLanguage()) },
                    { value: 'supernova', text: localize('dropdownThemeSupernova', getLanguage()) },
                    { value: 'galaxy', text: localize('dropdownThemeGalaxy', getLanguage()) },
                    { value: 'space', text: localize('dropdownThemeSpace', getLanguage()) },
                    { value: 'misty', text: localize('dropdownThemeMisty', getLanguage()) },
                    { value: 'light', text: localize('dropdownThemeLight', getLanguage()) },
                    { value: 'frosty', text: localize('dropdownThemeFrosty', getLanguage()) },
                    { value: 'summer', text: localize('dropdownThemeSummer', getLanguage()) },
                ], document.body.getAttribute('data-theme'), (value) => {
                    selectTheme(value);
                    setAchievementIconImageUrls();
                }),
            ],
            descriptionText: localize('tab9ThemeRowDescription', getLanguage()),
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
            labelText: localize('tab9WeatherEffectsRowLabel', getLanguage()),
            inputElements: [
                createToggleSwitch('weatherEffectSettingToggle', true, (isEnabled) => {
                    setWeatherEffectSetting(isEnabled);
                }, null),
            ],
            descriptionText: localize('tab9WeatherEffectsRowDescription', getLanguage()),
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
            labelText: localize('tab9ToggleFullScreenRowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: localize('buttonToggle', getLanguage()),
                    classNames: ['option-button', 'full-screen-button'],
                    onClick: () => {
                        toggleGameFullScreen();
                    },
                }),
            ],
            descriptionText: localize('tab9ToggleFullScreenRowDescription', getLanguage()),
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

        const settingsLanguageRow = createOptionRow({
            labelId: 'settingsLanguageRow',
            renderNameABs: null,
            labelText: localize('settingsLanguageRowLabel', getLanguage()),
            inputElements: [
                createDropdown('languageSelect', [
                    { value: 'en', text: 'English' },
                    { value: 'es', text: 'Español' },
                    { value: 'pt', text: 'Português' },
                    { value: 'de', text: 'Deutsch' },
                    { value: 'it', text: 'Italiano' },
                    { value: 'fr', text: 'Français' },
                ], getLanguage(), (value) => {
                    // relocalizeAll redraws this very pane, so it must be the last
                    // thing that touches the current DOM subtree.
                    relocalizeAll(value);
                }),
            ],
            descriptionText: localize('settingsLanguageRowDescription', getLanguage()),
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
        optionContentElement.appendChild(settingsLanguageRow);

        const newsTickerToggleRow = createOptionRow({
            labelId: 'newsTickerToggleRow',
            renderNameABs: null,
            labelText: localize('tab9NewsTickerRowLabel', getLanguage()),
            inputElements: [
                createToggleSwitch('newsTickerSettingToggle', true, (isEnabled) => {
                    setNewsTickerSetting(isEnabled);
                }, null),
            ],
            descriptionText: localize('tab9NewsTickerRowDescription', getLanguage()),
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
            labelText: localize('tab9BackgroundAudioRowLabel', getLanguage()),
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
            descriptionText: localize('tab9BackgroundAudioRowDescription', getLanguage()),
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
            labelText: localize('tab9SfxRowLabel', getLanguage()),
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
            descriptionText: localize('tab9SfxRowDescription', getLanguage()),
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
            labelText: localize('tab9AutoSaveRowLabel', getLanguage()),
            inputElements: [
                createDropdown('autoSaveFrequency', [
                    { value: 120000, text: localize('dropdownAutoSave2Minutes', getLanguage()) },
                    { value: 180000, text: localize('dropdownAutoSave3Minutes', getLanguage()) },
                    { value: 300000, text: localize('dropdownAutoSave5Minutes', getLanguage()) },
                    { value: 600000, text: localize('dropdownAutoSave10Minutes', getLanguage()) },
                ], parseInt(getAutoSaveFrequency()), (value) => {
                    setAutoSaveFrequency(parseInt(value));
                    initializeAutoSave();
                }),
                createToggleSwitch('autoSaveToggle', true, (isEnabled) => {
                    setAutoSaveToggle(isEnabled),
                    setWasAutoSaveToggled(getAutoSaveToggle());
                    initializeAutoSave();
                    if (!isEnabled) {
                        showNotification(localize('notificationAutoSaveOff', getLanguage()), 'error', 5000, 'loadSave');
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
            labelText: localize('tab9ExportSaveRowLabel', getLanguage()),
            inputElements: [
                createTextFieldArea('exportSaveArea', ['export-save'], localize('placeholderExportSaveArea', getLanguage()), null),
                createButton({
                    text: localize('buttonExport', getLanguage()),
                    classNames: ['option-button', 'save-load-button', ...demoExtraClasses],
                    onClick: () => {
                        copySaveStringToClipBoard();
                    },
                }),
                createButton({
                    text: localize('buttonManualSave', getLanguage()),
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
            labelText: localize('tab9ImportSaveRowLabel', getLanguage()),
            inputElements: [
                createTextFieldArea('importSaveArea', ['import-save'], localize('placeholderImportSaveArea', getLanguage()), null),
                createButton({
                    text: localize('buttonImport', getLanguage()),
                    classNames: ['option-button', 'save-load-button', ...demoExtraClasses],
                    onClick: () => {
                        // loadGame() notifies the player itself on every refusal
                        // path, so this catch only stops the rejection surfacing
                        // as an unhandled error in the console.
                        loadGame().catch(() => {});
                    },
                }),
                createButton({
                    text: localize('buttonManualLoad', getLanguage()),
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
            labelText: localize('tab9ExportCloudSaveRowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: localize('buttonSaveToCloud', getLanguage()),
                    classNames: ['option-button', 'save-load-button', ...demoExtraClasses],
                    onClick: () => {
                        if (getOnboardingMode()) {
                            showNotification(localize('notificationCannotSaveDuringOnboarding', getLanguage()), 'info', 4000, 'loadSave');
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
                Object.assign(document.createElement('span'), { innerHTML: localize('labelPioneerName', getLanguage()), className: 'save-name-margin' }),
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
            labelText: localize('tab9ImportCloudSaveRowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: localize('buttonLoadFromCloud', getLanguage()),
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
            labelText: localize('tab9HardResetRowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: localize('buttonHardResetAllProgress', getLanguage()),
                    classNames: ['option-button', 'hard-reset-button'],
                    onClick: () => {
                        callPopupModal({
                            header: hardResetWarningHeader,
                            content: hardResetWarningText,
                            showConfirm: true,
                            showCancel: true,
                            showExtra1: false,
                            showExtra2: false,
                            onConfirm: function () {
                                destroySaveGameOnCloud();
                                showNotification(
                                    localize('notificationHardResetComplete', getLanguage()),
                                    'error',
                                    200000000,
                                    'special'
                                );
                                showHideModal();
                                document.getElementById('overlay').style.display = 'flex';
                            },
                            onCancel: function () {
                                showHideModal();
                            },
                            onExtra1: null,
                            onExtra2: null,
                            confirmLabel: localize('modalHardResetConfirmLabel', getLanguage()),
                            cancelLabel: localize('modalHardResetCancelLabel', getLanguage()),
                            extra1Label: null,
                            extra2Label: null,
                            setupToolTips: false,
                        });
                    },
                }),
            ],
            descriptionText: localize('tab9HardResetRowDescription', getLanguage()),
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
        activeTitle.innerHTML = localize('tab9EventsActiveTitle', getLanguage());
        container.appendChild(activeTitle);

        const activeTable = document.createElement('table');
        activeTable.id = `${rowId}ActiveTable`;
        activeTable.classList.add('events-table');
        activeTable.innerHTML = `
            <thead>
                <tr>
                    <th>${localize('tab9EventsColumnEvent', getLanguage())}</th>
                    <th>${localize('tab9EventsColumnActiveUntil', getLanguage())}</th>
                    <th>${localize('tab9EventsColumnEffect', getLanguage())}</th>
                </tr>
            </thead>
            <tbody id="timedEventsActiveBody">
                <tr><td colspan="3">${localize('tab9EventsNoneActive', getLanguage())}</td></tr>
            </tbody>
        `;
        container.appendChild(activeTable);

        const historyTitle = document.createElement('div');
        historyTitle.id = `${rowId}HistoryTitle`;
        historyTitle.classList.add('help-sub-header-text');
        historyTitle.style.marginTop = '14px';
        historyTitle.innerHTML = localize('tab9EventsHistoryTitle', getLanguage());
        container.appendChild(historyTitle);

        const historyTable = document.createElement('table');
        historyTable.id = `${rowId}HistoryTable`;
        historyTable.classList.add('events-table');
        historyTable.innerHTML = `
            <thead>
                <tr>
                    <th>${localize('tab9EventsColumnEvent', getLanguage())}</th>
                    <th>${localize('tab9EventsColumnTotalDuration', getLanguage())}</th>
                    <th>${localize('tab9EventsColumnEffect', getLanguage())}</th>
                </tr>
            </thead>
            <tbody id="timedEventsHistoryBody">
                <tr><td colspan="3">${localize('tab9EventsNoneCompleted', getLanguage())}</td></tr>
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
