import { getCurrentTheme, setAutoSaveToggle, getAutoSaveToggle, getAutoSaveFrequency, setAutoSaveFrequency, getSaveData, setSaveData, getCurrencySymbol, setCurrencySymbol, getNotationType, setNotationType, setNotificationsToggle, getNotificationsToggle, getSaveName, getWeatherEffectSetting, setWeatherEffectSetting, setNewsTickerSetting, getNewsTickerSetting, setSaveExportCloudFlag, getBackgroundAudio, setBackgroundAudio, getSfx, setSfx, setWasAutoSaveToggled, setMouseParticleTrailEnabled, getMouseParticleTrailEnabled, setCustomPointerEnabled, getCustomPointerEnabled, getOnboardingMode, getDemoBuild } from './constantsAndGlobalVars.js';
import { toggleGameFullScreen, createButton, createTextFieldArea, createOptionRow, createDropdown, createToggleSwitch, selectTheme, callPopupModal, showHideModal, showNotification, applyCustomPointerSetting, fadeInStartupOverlay } from './ui.js';
import { importSaveStringFileFromComputer, downloadSaveStringToComputer, initializeAutoSave, saveGame, saveGameToCloud, loadGameFromCloud, copySaveStringToClipBoard, loadGame, destroySaveGameOnCloud } from './saveLoadGame.js';
import { hardResetWarningHeader, hardResetWarningText } from './descriptions.js';
import { setAchievementIconImageUrls } from './resourceDataObject.js';
import { trackAnalyticsEvent } from './analytics.js';

export function drawTab8Content(heading, optionContentElement) {
    if (heading === 'Overview') {

    }
}
