import { getCurrentOptionPane, getCurrentTheme, setAutoSaveToggle, getAutoSaveToggle, getAutoSaveFrequency, setAutoSaveFrequency, getSaveData, setSaveData, getCurrencySymbol, setCurrencySymbol, getNotationType, setNotationType, setNotificationsToggle, getNotificationsToggle, getSaveName, getWeatherEffectSetting, setWeatherEffectSetting, setNewsTickerSetting, getNewsTickerSetting, setSaveExportCloudFlag, getBackgroundAudio, setBackgroundAudio, getSfx, setSfx, setWasAutoSaveToggled, setMouseParticleTrailEnabled, getMouseParticleTrailEnabled, setCustomPointerEnabled, getCustomPointerEnabled, getOnboardingMode, getDemoBuild } from './constantsAndGlobalVars.js';
import { setupAchievementTooltip, createHtmlTableAchievementsGrid, createHtmlTableStatistics, createHtmlTextAreaProse, toggleGameFullScreen, createButton, createTextFieldArea, createOptionRow, createDropdown, createToggleSwitch, selectTheme, callPopupModal, showHideModal, showNotification, applyCustomPointerSetting, setElementPointerEvents, fadeInStartupOverlay } from './ui.js';
import { importSaveStringFileFromComputer, downloadSaveStringToComputer, initializeAutoSave, saveGame, saveGameToCloud, loadGameFromCloud, copySaveStringToClipBoard, loadGame, destroySaveGameOnCloud } from './saveLoadGame.js';
import { hardResetWarningHeader, hardResetWarningText, getStatisticsContent, getHelpContent } from './descriptions.js';
import { setAchievementIconImageUrls, getAchievementPositionData } from './resourceDataObject.js';
import { trackAnalyticsEvent } from './analytics.js';

export function drawTab8Content(heading, optionContentElement) {
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
        const exitGameRow = createOptionRow(
            'exitGameRow',
            null,
            'Exit Game:',
            createButton('EXIT GAME', ['option-button', 'green-ready-text'], () => {
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
            }),
            null,
            null,
            null,
            null,
            'Here you can Exit The Game',
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            null,
            [true, '25%', '80%']
        );

        optionContentElement.appendChild(exitGameRow);
    }

    if (heading === 'Visual') {
        const settingsCurrencySymbolRow = createOptionRow(
            'settingsCurrencySymbolRow',
            null,
            'Currency:',
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
            null,
            null,
            null,
            null,
            'Change the symbol used for Cash (Visual Only).',
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            null
        );
        optionContentElement.appendChild(settingsCurrencySymbolRow);

        const settingsNotationRow = createOptionRow(
            'settingsNotationRow',
            null,
            'Notation:',
            createDropdown('notationSelect', [
                { value: 'normalCondensed', text: 'Normal Condensed' },
                { value: 'normal', text: 'Normal' },
            ], getNotationType(), (value) => {
                setNotationType(value);
            }),
            null,
            null,
            null,
            null,
            'Change the notation used.',
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            null
        );
        optionContentElement.appendChild(settingsNotationRow);

        const settingsToggleNotificationsRow = createOptionRow(
            'settingsToggleNotificationsRow',
            null,
            'Toggle Notifications:',
            createToggleSwitch('notificationsToggle', true, (isEnabled) => {
                setNotificationsToggle(isEnabled);
            }, null),
            null,
            null,
            null,
            null,
            'Toggle notifications',
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            null
        );
        optionContentElement.appendChild(settingsToggleNotificationsRow);

        const customPointerToggleRow = createOptionRow(
            'customPointerToggleRow',
            null,
            'Custom Pointer:',
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
            null,
            null,
            null,
            null,
            'Toggle Cosmic Forge mouse cursor.',
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            null
        );
        optionContentElement.appendChild(customPointerToggleRow);

        const mouseTrailToggleRow = createOptionRow(
            'mouseTrailToggleRow',
            null,
            'Mouse Trail:',
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
            null,
            null,
            null,
            null,
            'Toggle the mouse particle trail effect.',
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            null
        );
        optionContentElement.appendChild(mouseTrailToggleRow);

        const settingsThemeRow = createOptionRow(
            'settingsThemeRow',
            null,
            'Theme:',
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
            null,
            null,
            null,
            null,
            'Change styling of the page.',
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            null
        );
        optionContentElement.appendChild(settingsThemeRow);

        const weatherEffectSettingsRow = createOptionRow(
            'weatherEffectSettingsRow',
            null,
            'Weather Effects:',
            createToggleSwitch('weatherEffectSettingToggle', true, (isEnabled) => {
                setWeatherEffectSetting(isEnabled);
            }, null),
            null,
            null,
            null,
            null,
            'Toggle weather effects on or off.',
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            null
        );
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

        const toggleGameFullScreenRow = createOptionRow(
            'toggleGameFullScreenRow',
            null,
            'Toggle Full Screen:',
            createButton(`Toggle`, ['option-button', 'full-screen-button'], () => {
                toggleGameFullScreen();
            }),
            null,
            null,
            null,
            null,
            'Toggle Full Screen Mode. (or F11)',
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            null
        );
        optionContentElement.appendChild(toggleGameFullScreenRow);

        const newsTickerToggleRow = createOptionRow(
            'newsTickerToggleRow',
            null,
            'News Ticker Feature:',
            createToggleSwitch('newsTickerSettingToggle', true, (isEnabled) => {
                setNewsTickerSetting(isEnabled);
            }, null),
            null,
            null,
            null,
            null,
            'Toggle the News Ticker feature on or off.',
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            null
        );
        optionContentElement.appendChild(newsTickerToggleRow);

        const newsTickerSettingToggleElement = document.getElementById('newsTickerSettingToggle');
        if (newsTickerSettingToggleElement) {
            newsTickerSettingToggleElement.checked = getNewsTickerSetting();
        }

        const backGroundAudioRow = createOptionRow(
            'backGroundAudioRow',
            null,
            'Background Ambience Sound:',
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
            null,
            null,
            null,
            null,
            'Toggle Background Ambience on or off.',
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            null
        );
        optionContentElement.appendChild(backGroundAudioRow);

        const backGroundAudioToggleElement = document.getElementById('backGroundAudioToggle');
        if (backGroundAudioToggleElement) {
            backGroundAudioToggleElement.checked = getBackgroundAudio();
        }

        const sfxAudioRow = createOptionRow(
            'sfxAudioRow',
            null,
            'Sound Effects:',
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
            null,
            null,
            null,
            null,
            'Toggle Sound Effects on or off.',
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            null
        );
        optionContentElement.appendChild(sfxAudioRow);
        
        const sfxToggleElement = document.getElementById('sfxToggle');
        if (sfxToggleElement) {
            sfxToggleElement.checked = getSfx();
        }        
    }

    if (heading === 'Saving / Loading') {   
        const demoExtraClasses = getDemoBuild() ? ['electron-purple-demo-button'] : [];
        const autoSaveConfigRow = createOptionRow(
            'autoSaveConfigRow',
            null,
            'Auto Save:',
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
            }, ['toggle-switch-spacing']),
            null,
            null,
            null,
            '',
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            null
        );
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

        const exportSaveRow = createOptionRow(
            'exportSaveRow',
            null,
            'Export Save:',
            createTextFieldArea('exportSaveArea', ['export-save'], 'Save Data should appear here', null),
            createButton(`Export`, ['option-button', 'save-load-button', ...demoExtraClasses], () => {
                copySaveStringToClipBoard();
            }),
            createButton(`Export File`, ['option-button', 'save-load-file-export', ...demoExtraClasses], () => {
                downloadSaveStringToComputer();
            }),
            null,
            null,
            '',
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            null,
            [true, '17%', '83%']
        );
        optionContentElement.appendChild(exportSaveRow);

        const importSaveRow = createOptionRow(
            'importSaveRow',
            null,
            'Import Save:',
            createTextFieldArea('importSaveArea', ['import-save'], 'Please paste your Save Data here...', null),
            createButton(`Import`, ['option-button', 'save-load-button', ...demoExtraClasses], () => {
                loadGame();
            }),
            createButton(`Import File`, ['option-button', 'save-load-file-export', ...demoExtraClasses], () => {
                importSaveStringFileFromComputer();
            }),
            null,
            null,
            '',
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            null,
            [true, '17%', '83%']
        );
        optionContentElement.appendChild(importSaveRow);

        const exportCloudSaveRow = createOptionRow(
            'exportCloudSaveRow',
            null,
            'Export Cloud Save:',
            createButton(`Export Cloud Save`, ['option-button', 'save-load-button', ...demoExtraClasses], () => {
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
            }),
            Object.assign(document.createElement('span'), { innerHTML: 'Pioneer Name:', className: 'save-name-margin' }),
            createTextFieldArea('saveName', ['save-name', 'save-name-width', 'save-name-height', 'save-name-margin'], '', getSaveName()),
            null,
            null,
            '',
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            null,
            [true, '25%', '80%']
        );
        optionContentElement.appendChild(exportCloudSaveRow);

        const importCloudSaveRow = createOptionRow(
            'importCloudSaveRow',
            null,
            'Import Cloud Save:',
            createButton(`Import Cloud Save`, ['option-button', 'save-load-button', ...demoExtraClasses], () => {
                loadGameFromCloud();
            }),
            null,
            null,
            null,
            null,
            '',
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            null,
            [true, '25%', '80%']
        );
        optionContentElement.appendChild(importCloudSaveRow);

        const hardResetRow = createOptionRow(
            'hardResetRow',
            null,
            'HARD RESET:',
            createButton(`!!!RESET ALL GAME PROGRESS FOR THIS PIONEER NAME!!!`, ['option-button', 'hard-reset-button'], () => {
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

            }),
            null,
            null,
            null,
            null,
            '',
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            null,
            [true, '25%', '80%']
        );
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
        
        const helpRow = createOptionRow(
            rowId,
            null,
            '',
            createHtmlTextAreaProse(
                `${rowId}TextArea`,
                combinedClasses,
                getHelpContent(getCurrentOptionPane(), 'subHeadings'),
                getHelpContent(getCurrentOptionPane(), 'subBodys'),
                ['help-sub-header-text'],
                ['help-sub-body-text']
            ),
            null,
            null,
            null,
            null,
            '',
            '',
            '',
            '',
            '',
            '',
            null,
            false,
            null,
            null,
            '',
            [true, 'invisible', '100%'],
            ['no-left-margin']
        );
        
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
    
        const achievementsRow = createOptionRow(
            rowId,
            null,
            '',
            createHtmlTableAchievementsGrid(
                `${rowId}AchievementsGrid`,
                ['achievement-container', 'achievement-container-margin'],
                achievementsData
            ),
            null,
            null,
            null,
            null,
            '',
            '',
            '',
            '',
            '',
            '',
            null,
            false,
            null,
            null,
            '',
            [true, '0%', '100%']
        );
    
        optionContentElement.appendChild(achievementsRow);
        setupAchievementTooltip();
    }      
    
    function createStatisticsSectionRow(rowId) {
        const statisticsRow = createOptionRow(
            rowId,
            null,
            '',
            createHtmlTableStatistics(
                `${rowId}TextArea`,
                ['help-container', 'help-container-margin', 'center-statistics'],
                getStatisticsContent('mainHeadings'),
                getStatisticsContent('subHeadings'),
                getStatisticsContent('subBodys'),
                ['help-sub-header-text'],
                ['help-sub-body-text'],
                ['green-ready-text']
            ),                      
            null,
            null,
            null,
            null,
            '',
            '',
            '',
            '',
            '',
            '',
            null,
            false,
            null,
            null,
            '',
            [true, 'invisible', '100%'],
            ['no-left-margin']
        );
    
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

        const eventsRow = createOptionRow(
            rowId,
            null,
            '',
            container,
            null,
            null,
            null,
            null,
            '',
            '',
            '',
            '',
            '',
            '',
            null,
            false,
            null,
            null,
            '',
            [true, 'invisible', '100%'],
            ['no-left-margin']
        );

        optionContentElement.appendChild(eventsRow);
    }
}
