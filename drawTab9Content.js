import { getCurrentOptionPane, getCurrentTheme, setAutoSaveToggle, getAutoSaveToggle, getAutoSaveFrequency, setAutoSaveFrequency, getSaveData, setSaveData, getCurrencySymbol, setCurrencySymbol, getNotationType, setNotationType, setNotificationsToggle, getNotificationsToggle, getSaveName, getWeatherEffectSetting, setWeatherEffectSetting, setNewsTickerSetting, getNewsTickerSetting, setSaveExportCloudFlag, getBackgroundAudio, setBackgroundAudio, getSfx, setSfx, setWasAutoSaveToggled, setMouseParticleTrailEnabled, getMouseParticleTrailEnabled, setCustomPointerEnabled, getCustomPointerEnabled, getOnboardingMode, getDemoBuild, getLanguage, getVariableDebuggerAndCheats } from './constantsAndGlobalVars.js';
import { createButton, createTextFieldArea, createRow, createSection, createPane, appendUiRow, createDropdown, createToggleSwitch, createHtmlTableAchievementsGrid, createHtmlTableStatistics, createHtmlTextAreaProse, toggleGameFullScreen, selectTheme, callPopupModal, showHideModal, showNotification, applyCustomPointerSetting, setElementPointerEvents, fadeInStartupOverlay, setupAchievementTooltip, relocalizeAll } from './ui.js';
import { localize } from './localization.js';
import { importSaveStringFileFromComputer, downloadSaveStringToComputer, initializeAutoSave, saveGame, saveGameToCloud, loadGameFromCloud, copySaveStringToClipBoard, loadGame, destroySaveGameOnCloud } from './saveLoadGame.js';
import { hardResetWarningHeader, hardResetWarningText, getStatisticsContent, getHelpContent } from './descriptions.js';
import { setAchievementIconImageUrls, getAchievementPositionData } from './resourceDataObject.js';
import { trackAnalyticsEvent } from './analytics.js';

/**
 * Open one pane for a settings screen and hand back the section its rows go in.
 *
 * Large UI refactor, Phase 4 (docs/largeUIRefactor.md). One pane per screen is
 * what makes the controls line up down the page: the pane owns the four grid
 * tracks and every row places its cells into them, so the dropdowns and toggles
 * share one left edge instead of each row resolving its own percentages against
 * its own label. The nineteen `noDescriptionContainer` overrides this tab used
 * to carry — '25%'/'80%', '17%'/'83%', 'invisible'/'100%' — are gone with it.
 *
 * Rows are appended into the returned section as they are built, rather than
 * collected and appended at the end, because several screens read a control back
 * out of the document by id between two row builds.
 */
function openPane(optionContentElement, id) {
    const section = createSection({ id: `${id}Section`, bare: true });
    optionContentElement.appendChild(createPane({
        id: `${id}Pane`,
        // A settings label is short and a settings row has three things in it —
        // name, control, sentence — so the name does not want the 1.5fr the
        // default gives it. At the default the control sat a third of the pane
        // away from its own label with nothing in between.
        tracks: { title: 'minmax(11ch, 0.65fr)' },
        sections: [section]
    }));
    return section;
}

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
        const section = openPane(optionContentElement, 'tab9ExitGame');

        const exitGameRow = createRow({
            id: 'exitGameRow',
            title: localize('tab9ExitGameRowLabel', getLanguage()),
            actions: [
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
            detail: localize('headerDescExitGame', getLanguage()),
            detailInline: true
        });

        appendUiRow(section, exitGameRow);
    }

    if (heading === 'Visual') {
        const section = openPane(optionContentElement, 'tab9Visual');

        // P14 (player-feedback plan): Theme leads the Visual pane. It is the setting
        // players reach for most and the only one whose effect is immediately visible
        // across the whole window, so it no longer sits below four toggles.
        const settingsThemeRow = createRow({
            id: 'settingsThemeRow',
            title: localize('tab9ThemeRowLabel', getLanguage()),
            actions: [
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
            detail: localize('tab9ThemeRowDescription', getLanguage()),
            detailInline: true
        });
        appendUiRow(section, settingsThemeRow);

        const settingsCurrencySymbolRow = createRow({
            id: 'settingsCurrencySymbolRow',
            title: localize('tab9CurrencyRowLabel', getLanguage()),
            actions: [
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
            detail: localize('tab9CurrencyRowDescription', getLanguage()),
            detailInline: true
        });
        appendUiRow(section, settingsCurrencySymbolRow);

        // P14 (player-feedback plan): plain notation is no longer offered to players —
        // condensed is the only notation the game presents, and setNotationType()
        // forces a save that predates that back onto it. The formatter still
        // understands 'normal', so the row survives behind the debug flag for
        // checking how a figure renders without the abbreviation ladder.
        if (getVariableDebuggerAndCheats()) {
            const settingsNotationRow = createRow({
                id: 'settingsNotationRow',
                title: localize('tab9NotationRowLabel', getLanguage()),
                actions: [
                    createDropdown('notationSelect', [
                        { value: 'normalCondensed', text: localize('dropdownNotationNormalCondensed', getLanguage()) },
                        { value: 'normal', text: localize('dropdownNotationNormal', getLanguage()) },
                    ], getNotationType(), (value) => {
                        setNotationType(value);
                    }),
                ],
                detail: localize('tab9NotationRowDescription', getLanguage()),
                detailInline: true
            });
            appendUiRow(section, settingsNotationRow);
        }

        const settingsToggleNotificationsRow = createRow({
            id: 'settingsToggleNotificationsRow',
            title: localize('tab9ToggleNotificationsRowLabel', getLanguage()),
            actions: [
                createToggleSwitch('notificationsToggle', true, (isEnabled) => {
                    setNotificationsToggle(isEnabled);
                }, null),
            ],
            detail: localize('tab9ToggleNotificationsRowDescription', getLanguage()),
            detailInline: true
        });
        appendUiRow(section, settingsToggleNotificationsRow);

        const customPointerToggleRow = createRow({
            id: 'customPointerToggleRow',
            title: localize('tab9CustomPointerRowLabel', getLanguage()),
            actions: [
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
            detail: localize('tab9CustomPointerRowDescription', getLanguage()),
            detailInline: true
        });
        appendUiRow(section, customPointerToggleRow);

        const mouseTrailToggleRow = createRow({
            id: 'mouseTrailToggleRow',
            title: localize('tab9MouseTrailRowLabel', getLanguage()),
            actions: [
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
            detail: localize('tab9MouseTrailRowDescription', getLanguage()),
            detailInline: true
        });
        appendUiRow(section, mouseTrailToggleRow);


        const weatherEffectSettingsRow = createRow({
            id: 'weatherEffectSettingsRow',
            title: localize('tab9WeatherEffectsRowLabel', getLanguage()),
            actions: [
                createToggleSwitch('weatherEffectSettingToggle', true, (isEnabled) => {
                    setWeatherEffectSetting(isEnabled);
                }, null),
            ],
            detail: localize('tab9WeatherEffectsRowDescription', getLanguage()),
            detailInline: true
        });
        appendUiRow(section, weatherEffectSettingsRow);

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
        const section = openPane(optionContentElement, 'tab9GameOptions');

        const toggleGameFullScreenRow = createRow({
            id: 'toggleGameFullScreenRow',
            title: localize('tab9ToggleFullScreenRowLabel', getLanguage()),
            actions: [
                createButton({
                    text: localize('buttonToggle', getLanguage()),
                    classNames: ['option-button', 'full-screen-button'],
                    onClick: () => {
                        toggleGameFullScreen();
                    },
                }),
            ],
            detail: localize('tab9ToggleFullScreenRowDescription', getLanguage()),
            detailInline: true
        });
        appendUiRow(section, toggleGameFullScreenRow);

        const settingsLanguageRow = createRow({
            id: 'settingsLanguageRow',
            title: localize('settingsLanguageRowLabel', getLanguage()),
            actions: [
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
            detail: localize('settingsLanguageRowDescription', getLanguage()),
            detailInline: true
        });
        appendUiRow(section, settingsLanguageRow);

        const newsTickerToggleRow = createRow({
            id: 'newsTickerToggleRow',
            title: localize('tab9NewsTickerRowLabel', getLanguage()),
            actions: [
                createToggleSwitch('newsTickerSettingToggle', true, (isEnabled) => {
                    setNewsTickerSetting(isEnabled);
                }, null),
            ],
            detail: localize('tab9NewsTickerRowDescription', getLanguage()),
            detailInline: true
        });
        appendUiRow(section, newsTickerToggleRow);

        const newsTickerSettingToggleElement = document.getElementById('newsTickerSettingToggle');
        if (newsTickerSettingToggleElement) {
            newsTickerSettingToggleElement.checked = getNewsTickerSetting();
        }

        const backGroundAudioRow = createRow({
            id: 'backGroundAudioRow',
            title: localize('tab9BackgroundAudioRowLabel', getLanguage()),
            actions: [
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
            detail: localize('tab9BackgroundAudioRowDescription', getLanguage()),
            detailInline: true
        });
        appendUiRow(section, backGroundAudioRow);

        const backGroundAudioToggleElement = document.getElementById('backGroundAudioToggle');
        if (backGroundAudioToggleElement) {
            backGroundAudioToggleElement.checked = getBackgroundAudio();
        }

        const sfxAudioRow = createRow({
            id: 'sfxAudioRow',
            title: localize('tab9SfxRowLabel', getLanguage()),
            actions: [
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
            detail: localize('tab9SfxRowDescription', getLanguage()),
            detailInline: true
        });
        appendUiRow(section, sfxAudioRow);
        
        const sfxToggleElement = document.getElementById('sfxToggle');
        if (sfxToggleElement) {
            sfxToggleElement.checked = getSfx();
        }        
    }

    if (heading === 'Saving / Loading') {   
        const section = openPane(optionContentElement, 'tab9SavingLoading');
        const demoExtraClasses = getDemoBuild() ? ['electron-purple-demo-button'] : [];
        const autoSaveConfigRow = createRow({
            id: 'autoSaveConfigRow',
            title: localize('tab9AutoSaveRowLabel', getLanguage()),
            actions: [
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
            ]
        });
        appendUiRow(section, autoSaveConfigRow);

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

        const exportSaveRow = createRow({
            id: 'exportSaveRow',
            title: localize('tab9ExportSaveRowLabel', getLanguage()),
            actions: [
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
            ]
        });
        appendUiRow(section, exportSaveRow);

        const importSaveRow = createRow({
            id: 'importSaveRow',
            title: localize('tab9ImportSaveRowLabel', getLanguage()),
            actions: [
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
            ]
        });
        appendUiRow(section, importSaveRow);

        const exportCloudSaveRow = createRow({
            id: 'exportCloudSaveRow',
            title: localize('tab9ExportCloudSaveRowLabel', getLanguage()),
            actions: [
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
            ]
        });
        appendUiRow(section, exportCloudSaveRow);

        const importCloudSaveRow = createRow({
            id: 'importCloudSaveRow',
            title: localize('tab9ImportCloudSaveRowLabel', getLanguage()),
            actions: [
                createButton({
                    text: localize('buttonLoadFromCloud', getLanguage()),
                    classNames: ['option-button', 'save-load-button', ...demoExtraClasses],
                    onClick: () => {
                        loadGameFromCloud();
                    },
                }),
            ]
        });
        appendUiRow(section, importCloudSaveRow);

        const hardResetRow = createRow({
            id: 'hardResetRow',
            title: localize('tab9HardResetRowLabel', getLanguage()),
            actions: [
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
            detail: localize('tab9HardResetRowDescription', getLanguage()),
            detailInline: true
        });
        appendUiRow(section, hardResetRow);

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
        
        const helpRow = createRow({
            id: rowId,
            variant: 'full',
            actions: [
                createHtmlTextAreaProse(
                    `${rowId}TextArea`,
                    combinedClasses,
                    getHelpContent(getCurrentOptionPane(), 'subHeadings'),
                    getHelpContent(getCurrentOptionPane(), 'subBodys'),
                    ['help-sub-header-text'],
                    ['help-sub-body-text']
                ),
            ]
        });
        
        appendUiRow(openPane(optionContentElement, 'tab9Help'), helpRow);

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
    
        const achievementsRow = createRow({
            id: rowId,
            variant: 'full',
            actions: [
                createHtmlTableAchievementsGrid(
                    `${rowId}AchievementsGrid`,
                    ['achievement-container', 'achievement-container-margin'],
                    achievementsData
                ),
            ]
        });
    
        appendUiRow(openPane(optionContentElement, 'tab9Achievements'), achievementsRow);
        setupAchievementTooltip();
    }      
    
    function createStatisticsSectionRow(rowId) {
        const statisticsRow = createRow({
            id: rowId,
            variant: 'full',
            actions: [
                createHtmlTableStatistics(
                    `${rowId}TextArea`,
                    ['help-container', 'help-container-margin', 'center-statistics'],
                    getStatisticsContent('mainHeadings'),
                    getStatisticsContent('subHeadings'),
                    getStatisticsContent('subBodys')
                ),
            ]
        });
        
        appendUiRow(openPane(optionContentElement, 'tab9Statistics'), statisticsRow);
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

        const eventsRow = createRow({
            id: rowId,
            variant: 'full',
            actions: [
                container,
            ]
        });

        appendUiRow(openPane(optionContentElement, 'tab9Events'), eventsRow);
    }
}
