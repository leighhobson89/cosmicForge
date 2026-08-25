import { getGameActiveCountTime, getTimerRateRatio, getSaveName, getRocketUserName, getDestinationStar, getCurrencySymbol, getPlayerPhilosophy, getRepeatableTechMultipliers, getStatRun, getCurrentRunIsMegaStructureRun, getPriceCasinoGame2, getPriceCasinoGame3, getLanguage} from "./constantsAndGlobalVars.js";
import { calculateAndAddExtraAPFromPhilosophyRepeatable, formatNumber } from "./game.js";
import { getAchievementDataObject, getResourceDataObject, getCosmicRipGalacticPoints } from "./resourceDataObject.js";
import { capitaliseWordsWithRomanNumerals } from "./utilityFunctions.js";
import { localize } from "./localization.js";

export let infoTooltipDescriptions;
export let gameIntroHeader;
export let gameIntroText;
export let gameSaveNameCollect;
export let headerDescriptions;
export let techNotificationMessages;
export let optionDescriptions;
export let galacticMarketTooltipDescriptions;
export let newsTickerContent;
export let helpContent = null;
export let statisticsContent = null;
export let rocketNames;
export let starNames;
export let achievementNotifications;
export let launchStarShipWarningHeader;
export let launchStarShipWarningText;
export let enterWarModeModalHeader;
export let enterwarModeModalBackOutText;
export let enterwarModeModalNoBackOutText;
export let enterWarModeInsultedText;
export let enterWarModeSurrenderText;
export let enterWarModeNotVassalizedText;
export let enterWarModeScaredText;
export let enterWarModeModalLaughAtProspect;
export let enterWarModeModalLaughAndEnterWar;
export let enterWarModeModalImproveToReceptive;
export let enterWarModeModalNeutral;
export let enterWarModeModalReserved;
export let enterWarModeModalPatience;
export let modalBattleHeaderText;
export let modalBattleWonText;
export let modalBattleLostText;
export let modalBattleNoSentientLifeHeader;
export let modalBattleNoSentientLifeText;
export let modalRebirthHeader;
export let modalRebirthText;
export let modalGalacticTabUnlockHeader;
export let modalGalacticTabUnlockText;
export let modalOStarReachedHeader;
export let modalOStarReachedText;
export let modalOTypeStarTechAcquiredHeader;
export let modalOTypeStarTechAcquiredText;
export let achievementTooltipDescriptions;
export let achievementTooltipDescriptionTexts;
export let modalFeedbackThanksHeaderText;
export let modalFeedbackHeaderText;
export let modalFeedbackContentThanks;
export let modalFeedbackContentTextGood;
export let modalFeedbackContentTextBad;
export let modalPlayerLeaderPhilosophyHeaderText;
export let modalPlayerLeaderPhilosophyContentText;
export let modalPlayerLeaderIntroHeaderText;
export let modalPlayerLeaderIntroContentText1;
export let modalPlayerLeaderIntroContentText2;
export let modalPlayerLeaderIntroContentText3;
export let modalPlayerLeaderIntroContentText4;
export let hardResetWarningHeader;
export let hardResetWarningText;
export let modalCompoundsTabUnlockHeader;
export let modalCompoundsTabUnlockText;
export let modalSpaceMiningTabUnlockHeader;
export let modalSpaceMiningTabUnlockText;
export let modalEnergyTabUnlockHeader;
export let modalEnergyTabUnlockText;
export let modalInterstellarTabUnlockHeader;
export let modalInterstellarTabUnlockText;
export let modalKnowledgeSharingTabUnlockHeader;
export let modalKnowledgeSharingTabUnlockText;
export let modalScienceLabsTabUnlockHeader;
export let modalScienceLabsTabUnlockText;
export let modalQuantumComputingTabUnlockHeader;
export let modalQuantumComputingTabUnlockText;
export let modalRocketCompositesTabUnlockHeader;
export let modalRocketCompositesTabUnlockText;
export let modalNanoBrokersUnlockHeader;
export let modalNanoBrokersUnlockText;
export let modalCompoundMachiningTabUnlockHeader;
export let modalCompoundMachiningTabUnlockText;
export let modalMegaStructureTechDysonSphere1Header;
export let modalMegaStructureTechDysonSphere1Text;
export let modalMegaStructureTechDysonSphere2Header;
export let modalMegaStructureTechDysonSphere2Text;
export let modalMegaStructureTechDysonSphere3Header;
export let modalMegaStructureTechDysonSphere3Text;
export let modalMegaStructureTechDysonSphere4Header;
export let modalMegaStructureTechDysonSphere4Text;
export let modalMegaStructureTechDysonSphere5Header;
export let modalMegaStructureTechDysonSphere5Text;
export let modalMegaStructureTechCelestialProcessingCore1Header;
export let modalMegaStructureTechCelestialProcessingCore1Text;
export let modalMegaStructureTechCelestialProcessingCore2Header;
export let modalMegaStructureTechCelestialProcessingCore2Text;
export let modalMegaStructureTechCelestialProcessingCore3Header;
export let modalMegaStructureTechCelestialProcessingCore3Text;
export let modalMegaStructureTechCelestialProcessingCore4Header;
export let modalMegaStructureTechCelestialProcessingCore4Text;
export let modalMegaStructureTechCelestialProcessingCore5Header;
export let modalMegaStructureTechCelestialProcessingCore5Text;
export let modalMegaStructureTechPlasmaForge1Header;
export let modalMegaStructureTechPlasmaForge1Text;
export let modalMegaStructureTechPlasmaForge2Header;
export let modalMegaStructureTechPlasmaForge2Text;
export let modalMegaStructureTechPlasmaForge3Header;
export let modalMegaStructureTechPlasmaForge3Text;
export let modalMegaStructureTechPlasmaForge4Header;
export let modalMegaStructureTechPlasmaForge4Text;
export let modalMegaStructureTechPlasmaForge5Header;
export let modalMegaStructureTechPlasmaForge5Text;
export let modalMegaStructureTechGalacticMemoryArchive1Header;
export let modalMegaStructureTechGalacticMemoryArchive1Text;
export let modalMegaStructureTechGalacticMemoryArchive2Header;
export let modalMegaStructureTechGalacticMemoryArchive2Text;
export let modalMegaStructureTechGalacticMemoryArchive3Header;
export let modalMegaStructureTechGalacticMemoryArchive3Text;
export let modalMegaStructureTechGalacticMemoryArchive4Header;
export let modalMegaStructureTechGalacticMemoryArchive4Text;
export let modalMegaStructureTechGalacticMemoryArchive5Header;
export let modalMegaStructureTechGalacticMemoryArchive5Text;
export let modalBlackHoleDiscoveredHeader;
export let modalBlackHoleDiscoveredText;
export let miaplacidusEndgameStoryPopups;
export let onboardingModalHeader;
export let onboardingModalText;

export let modalEventPowerPlantExplosionHeader;
export let modalEventPowerPlantExplosionText;
export let modalEventBatteryExplosionHeader;
export let modalEventBatteryExplosionText;
export let modalEventScienceTheftHeader;
export let modalEventScienceTheftText;
export let modalEventResearchBreakthroughHeader;
export let modalEventResearchBreakthroughText;
export let modalEventRocketInstantArrivalHeader;
export let modalEventRocketInstantArrivalText;
export let modalEventAntimatterReactionHeader;
export let modalEventAntimatterReactionText;
export let modalEventStockLossHeader;
export let modalEventStockLossText;
export let modalEventStarshipLostInSpaceHeader;
export let modalEventStarshipLostInSpaceText;
export let modalEventEndlessSummerHeader;
export let modalEventEndlessSummerText;
export let modalEventEndlessSummerEndedHeader;
export let modalEventEndlessSummerEndedText;
export let modalEventGalacticMarketLockdownHeader;
export let modalEventGalacticMarketLockdownText;
export let modalEventGalacticMarketLockdownEndedHeader;
export let modalEventGalacticMarketLockdownEndedText;
export let modalEventMinerBrokeDownHeader;
export let modalEventMinerBrokeDownText;
export let modalEventMinerBrokeDownEndedHeader;
export let modalEventMinerBrokeDownEndedText;
export let modalEventSupplyChainDisruptionHeader;
export let modalEventSupplyChainDisruptionText;
export let modalEventSupplyChainDisruptionEndedHeader;
export let modalEventSupplyChainDisruptionEndedText;
export let modalEventBlackHoleInstabilityHeader;
export let modalEventBlackHoleInstabilityText;
export let modalEventBlackHoleInstabilityEndedHeader;
export let modalEventBlackHoleInstabilityEndedText;
export let modalCosmicRipLocatedHeader;
export let modalCosmicRipLocatedText;
export let modalNearSpaceScannerArrayRestoredHeader;
export let modalNearSpaceScannerArrayRestoredText;
export let modalCosmicRipClosedHeader;
export let modalCosmicRipClosedText;
export let modalCosmicRipTechStabilizerArrayHeader;
export let modalCosmicRipTechStabilizerArrayText;
export let modalCosmicRipTechQuantumContainmentFieldHeader;
export let modalCosmicRipTechQuantumContainmentFieldText;
export let modalCosmicRipTechDimensionalAnchorMatrixHeader;
export let modalCosmicRipTechDimensionalAnchorMatrixText;
export let modalCosmicRipTechSingularityStabilizerHeader;
export let modalCosmicRipTechSingularityStabilizerText;
export let modalCosmicRipTechRealityWeaveRegulatorHeader;
export let modalCosmicRipTechRealityWeaveRegulatorText;

export let cosmicRipStatusMessages;

export let randomEventTriggerDescriptions;

const LANGUAGE_FLAGS = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Espanol' },
    { code: 'pt', name: 'Português' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'fr', name: 'Francais' }
];

function buildLanguageFlagBar() {
    const flagCells = LANGUAGE_FLAGS
        .map(({ code, name }) => `
            <div class="language-flag-cell" data-language="${code}" role="button" tabindex="0" title="${name}">
                <img class="language-flag-image" src="images/flags/${code}.png" alt="${name}">
            </div>`)
        .join('<div class="language-flag-spacer"></div>');

    const labelCells = LANGUAGE_FLAGS
        .map(({ code }) => `<div class="language-flag-label" data-language-label="${code}">${code}</div>`)
        .join('<div class="language-flag-spacer"></div>');

    return `<div class="language-flag-bar" id="languageFlagBar">${flagCells}${labelCells}</div>`;
}

export function initialiseDescriptions() {
    gameIntroHeader = localize('gameIntroHeader', getLanguage());
    gameSaveNameCollect = `
        ${localize('gameSaveNameCollect', getLanguage())}<br><br>
        ${buildLanguageFlagBar()}
        <textarea 
            id="pioneerCodeName"  
            class="save-name save-name-height save-name-modal-width">${getSaveName()}</textarea><br><br>${localize('gameSaveNameLoadHint', getLanguage())}
    `;
    gameIntroText = localize('gameIntroText', getLanguage());
    onboardingModalHeader = localize('onboardingModalHeader', getLanguage());
    onboardingModalText = localize('onboardingModalText', getLanguage());
    launchStarShipWarningHeader = localize('launchStarShipWarningHeader', getLanguage());
    launchStarShipWarningText = localize('launchStarShipWarningText', getLanguage());
    enterWarModeModalHeader = localize('enterWarModeModalHeader', getLanguage());
    enterwarModeModalBackOutText = localize('enterwarModeModalBackOutText', getLanguage());
    enterwarModeModalNoBackOutText = localize('enterwarModeModalNoBackOutText', getLanguage());
    enterWarModeInsultedText = localize('enterWarModeInsultedText', getLanguage());
    enterWarModeSurrenderText = localize('enterWarModeSurrenderText', getLanguage());
    enterWarModeNotVassalizedText = localize('enterWarModeNotVassalizedText', getLanguage());
    enterWarModeScaredText = localize('enterWarModeScaredText', getLanguage());
    enterWarModeModalLaughAtProspect = localize('enterWarModeModalLaughAtProspect', getLanguage());
    enterWarModeModalLaughAndEnterWar = localize('enterWarModeModalLaughAndEnterWar', getLanguage());
    enterWarModeModalImproveToReceptive = localize('enterWarModeModalImproveToReceptive', getLanguage());
    enterWarModeModalNeutral = localize('enterWarModeModalNeutral', getLanguage());
    enterWarModeModalReserved = localize('enterWarModeModalReserved', getLanguage());
    enterWarModeModalPatience = localize('enterWarModeModalPatience', getLanguage());
    modalBattleHeaderText = localize('modalBattleHeaderText', getLanguage());
    modalBattleWonText = localize('modalBattleWonText', getLanguage());
    modalBattleLostText = localize('modalBattleLostText', getLanguage());
    modalBattleNoSentientLifeHeader = localize('modalBattleNoSentientLifeHeader', getLanguage());
    modalBattleNoSentientLifeText = localize('modalBattleNoSentientLifeText', getLanguage());
    modalRebirthHeader = localize('modalRebirthHeader', getLanguage());
    modalRebirthText = localize('modalRebirthText', getLanguage());
    modalGalacticTabUnlockHeader = localize('modalGalacticTabUnlockHeader', getLanguage());
    modalGalacticTabUnlockText = localize('modalGalacticTabUnlockText', getLanguage());
    modalOStarReachedHeader = localize('modalOStarReachedHeader', getLanguage());
    modalOStarReachedText = localize('modalOStarReachedText', getLanguage());
    modalOTypeStarTechAcquiredHeader = localize('modalOTypeStarTechAcquiredHeader', getLanguage());
    modalOTypeStarTechAcquiredText = localize('modalOTypeStarTechAcquiredText', getLanguage());
    modalFeedbackHeaderText = localize('modalFeedbackHeaderText', getLanguage());
    modalFeedbackContentTextGood = localize('modalFeedbackContentTextGood', getLanguage());
    modalFeedbackContentTextBad = localize('modalFeedbackContentTextBad', getLanguage());
    modalFeedbackThanksHeaderText = localize('modalFeedbackThanksHeaderText', getLanguage());
    modalFeedbackContentThanks = localize('modalFeedbackContentThanks', getLanguage());
    modalPlayerLeaderPhilosophyHeaderText = localize('modalPlayerLeaderPhilosophyHeaderText', getLanguage());
    modalPlayerLeaderPhilosophyContentText = localize('modalPlayerLeaderPhilosophyContentText', getLanguage());
    modalPlayerLeaderIntroHeaderText = localize('modalPlayerLeaderIntroHeaderText', getLanguage());
    modalPlayerLeaderIntroContentText1 = localize('modalPlayerLeaderIntroContentText1', getLanguage());
    modalPlayerLeaderIntroContentText2 = localize('modalPlayerLeaderIntroContentText2', getLanguage());
    modalPlayerLeaderIntroContentText3 = localize('modalPlayerLeaderIntroContentText3', getLanguage());
    modalPlayerLeaderIntroContentText4 = localize('modalPlayerLeaderIntroContentText4', getLanguage());
    hardResetWarningHeader = localize('hardResetWarningHeader', getLanguage());
    hardResetWarningText = localize('hardResetWarningText', getLanguage());
    modalCompoundsTabUnlockHeader = localize('modalCompoundsTabUnlockHeader', getLanguage());
    modalCompoundsTabUnlockText = localize('modalCompoundsTabUnlockText', getLanguage());
    modalSpaceMiningTabUnlockHeader = localize('modalSpaceMiningTabUnlockHeader', getLanguage());
    modalSpaceMiningTabUnlockText = localize('modalSpaceMiningTabUnlockText', getLanguage());
    modalEnergyTabUnlockHeader = localize('modalEnergyTabUnlockHeader', getLanguage());
    modalEnergyTabUnlockText = localize('modalEnergyTabUnlockText', getLanguage());
    modalInterstellarTabUnlockHeader = localize('modalInterstellarTabUnlockHeader', getLanguage());
    modalInterstellarTabUnlockText = localize('modalInterstellarTabUnlockText', getLanguage());
    modalKnowledgeSharingTabUnlockHeader = localize('modalKnowledgeSharingTabUnlockHeader', getLanguage());
    modalKnowledgeSharingTabUnlockText = localize('modalKnowledgeSharingTabUnlockText', getLanguage());
    modalScienceLabsTabUnlockHeader = localize('modalScienceLabsTabUnlockHeader', getLanguage());
    modalScienceLabsTabUnlockText = localize('modalScienceLabsTabUnlockText', getLanguage());
    modalQuantumComputingTabUnlockHeader = localize('modalQuantumComputingTabUnlockHeader', getLanguage());
    modalQuantumComputingTabUnlockText = localize('modalQuantumComputingTabUnlockText', getLanguage());
    modalRocketCompositesTabUnlockHeader = localize('modalRocketCompositesTabUnlockHeader', getLanguage());
    modalRocketCompositesTabUnlockText = localize('modalRocketCompositesTabUnlockText', getLanguage());
    modalNanoBrokersUnlockHeader = localize('modalNanoBrokersUnlockHeader', getLanguage());
    modalNanoBrokersUnlockText = localize('modalNanoBrokersUnlockText', getLanguage());
    modalCompoundMachiningTabUnlockHeader = localize('modalCompoundMachiningTabUnlockHeader', getLanguage());
    modalCompoundMachiningTabUnlockText = localize('modalCompoundMachiningTabUnlockText', getLanguage());
    modalMegaStructureTechDysonSphere1Header = localize('modalMegaStructureTechDysonSphere1Header', getLanguage());
    modalMegaStructureTechDysonSphere1Text = localize('modalMegaStructureTechDysonSphere1Text', getLanguage());
    modalMegaStructureTechDysonSphere2Header = localize('modalMegaStructureTechDysonSphere2Header', getLanguage());
    modalMegaStructureTechDysonSphere2Text = localize('modalMegaStructureTechDysonSphere2Text', getLanguage());
    modalMegaStructureTechDysonSphere3Header = localize('modalMegaStructureTechDysonSphere3Header', getLanguage());
    modalMegaStructureTechDysonSphere3Text = localize('modalMegaStructureTechDysonSphere3Text', getLanguage());
    modalMegaStructureTechDysonSphere4Header = localize('modalMegaStructureTechDysonSphere4Header', getLanguage());
    modalMegaStructureTechDysonSphere4Text = localize('modalMegaStructureTechDysonSphere4Text', getLanguage());
    modalMegaStructureTechDysonSphere5Header = localize('modalMegaStructureTechDysonSphere5Header', getLanguage());
    modalMegaStructureTechDysonSphere5Text = localize('modalMegaStructureTechDysonSphere5Text', getLanguage());
    modalMegaStructureTechCelestialProcessingCore1Header = localize('modalMegaStructureTechCelestialProcessingCore1Header', getLanguage());
    modalMegaStructureTechCelestialProcessingCore1Text = localize('modalMegaStructureTechCelestialProcessingCore1Text', getLanguage());
    modalMegaStructureTechCelestialProcessingCore2Header = localize('modalMegaStructureTechCelestialProcessingCore2Header', getLanguage());
    modalMegaStructureTechCelestialProcessingCore2Text = localize('modalMegaStructureTechCelestialProcessingCore2Text', getLanguage());
    modalMegaStructureTechCelestialProcessingCore3Header = localize('modalMegaStructureTechCelestialProcessingCore3Header', getLanguage());
    modalMegaStructureTechCelestialProcessingCore3Text = localize('modalMegaStructureTechCelestialProcessingCore3Text', getLanguage());
    modalMegaStructureTechCelestialProcessingCore4Header = localize('modalMegaStructureTechCelestialProcessingCore4Header', getLanguage());
    modalMegaStructureTechCelestialProcessingCore4Text = localize('modalMegaStructureTechCelestialProcessingCore4Text', getLanguage());
    modalMegaStructureTechCelestialProcessingCore5Header = localize('modalMegaStructureTechCelestialProcessingCore5Header', getLanguage());
    modalMegaStructureTechCelestialProcessingCore5Text = localize('modalMegaStructureTechCelestialProcessingCore5Text', getLanguage());
    modalMegaStructureTechPlasmaForge1Header = localize('modalMegaStructureTechPlasmaForge1Header', getLanguage());
    modalMegaStructureTechPlasmaForge1Text = localize('modalMegaStructureTechPlasmaForge1Text', getLanguage());
    modalMegaStructureTechPlasmaForge2Header = localize('modalMegaStructureTechPlasmaForge2Header', getLanguage());
    modalMegaStructureTechPlasmaForge2Text = localize('modalMegaStructureTechPlasmaForge2Text', getLanguage());
    modalMegaStructureTechPlasmaForge3Header = localize('modalMegaStructureTechPlasmaForge3Header', getLanguage());
    modalMegaStructureTechPlasmaForge3Text = localize('modalMegaStructureTechPlasmaForge3Text', getLanguage());
    modalMegaStructureTechPlasmaForge4Header = localize('modalMegaStructureTechPlasmaForge4Header', getLanguage());
    modalMegaStructureTechPlasmaForge4Text = localize('modalMegaStructureTechPlasmaForge4Text', getLanguage());
    modalMegaStructureTechPlasmaForge5Header = localize('modalMegaStructureTechPlasmaForge5Header', getLanguage());
    modalMegaStructureTechPlasmaForge5Text = localize('modalMegaStructureTechPlasmaForge5Text', getLanguage());
    modalMegaStructureTechGalacticMemoryArchive1Header = localize('modalMegaStructureTechGalacticMemoryArchive1Header', getLanguage());
    modalMegaStructureTechGalacticMemoryArchive1Text = localize('modalMegaStructureTechGalacticMemoryArchive1Text', getLanguage());
    modalMegaStructureTechGalacticMemoryArchive2Header = localize('modalMegaStructureTechGalacticMemoryArchive2Header', getLanguage());
    modalMegaStructureTechGalacticMemoryArchive2Text = localize('modalMegaStructureTechGalacticMemoryArchive2Text', getLanguage());
    modalMegaStructureTechGalacticMemoryArchive3Header = localize('modalMegaStructureTechGalacticMemoryArchive3Header', getLanguage());
    modalMegaStructureTechGalacticMemoryArchive3Text = localize('modalMegaStructureTechGalacticMemoryArchive3Text', getLanguage());
    modalMegaStructureTechGalacticMemoryArchive4Header = localize('modalMegaStructureTechGalacticMemoryArchive4Header', getLanguage());
    modalMegaStructureTechGalacticMemoryArchive4Text = localize('modalMegaStructureTechGalacticMemoryArchive4Text', getLanguage());
    modalMegaStructureTechGalacticMemoryArchive5Header = localize('modalMegaStructureTechGalacticMemoryArchive5Header', getLanguage());
    modalMegaStructureTechGalacticMemoryArchive5Text = localize('modalMegaStructureTechGalacticMemoryArchive5Text', getLanguage());
    modalBlackHoleDiscoveredHeader = localize('modalBlackHoleDiscoveredHeader', getLanguage());
    modalBlackHoleDiscoveredText = localize('modalBlackHoleDiscoveredText', getLanguage());
    modalNearSpaceScannerArrayRestoredHeader = localize('modalNearSpaceScannerArrayRestoredHeader', getLanguage());
    modalNearSpaceScannerArrayRestoredText = localize('modalNearSpaceScannerArrayRestoredText', getLanguage());
    modalCosmicRipLocatedHeader = localize('modalCosmicRipLocatedHeader', getLanguage());
    modalCosmicRipLocatedText = localize('modalCosmicRipLocatedText', getLanguage());
    modalCosmicRipClosedHeader = localize('modalCosmicRipClosedHeader', getLanguage());
    modalCosmicRipClosedText = localize('modalCosmicRipClosedText', getLanguage());
    modalCosmicRipTechStabilizerArrayHeader = localize('modalCosmicRipTechStabilizerArrayHeader', getLanguage());
    modalCosmicRipTechStabilizerArrayText = localize('modalCosmicRipTechStabilizerArrayText', getLanguage());
    modalCosmicRipTechQuantumContainmentFieldHeader = localize('modalCosmicRipTechQuantumContainmentFieldHeader', getLanguage());
    modalCosmicRipTechQuantumContainmentFieldText = localize('modalCosmicRipTechQuantumContainmentFieldText', getLanguage());
    modalCosmicRipTechDimensionalAnchorMatrixHeader = localize('modalCosmicRipTechDimensionalAnchorMatrixHeader', getLanguage());
    modalCosmicRipTechDimensionalAnchorMatrixText = localize('modalCosmicRipTechDimensionalAnchorMatrixText', getLanguage());
    modalCosmicRipTechSingularityStabilizerHeader = localize('modalCosmicRipTechSingularityStabilizerHeader', getLanguage());
    modalCosmicRipTechSingularityStabilizerText = localize('modalCosmicRipTechSingularityStabilizerText', getLanguage());
    modalCosmicRipTechRealityWeaveRegulatorHeader = localize('modalCosmicRipTechRealityWeaveRegulatorHeader', getLanguage());
    modalCosmicRipTechRealityWeaveRegulatorText = localize('modalCosmicRipTechRealityWeaveRegulatorText', getLanguage());
    modalEventPowerPlantExplosionHeader = localize('modalEventPowerPlantExplosionHeader', getLanguage());
    modalEventPowerPlantExplosionText = localize('modalEventPowerPlantExplosionText', getLanguage());
    modalEventBatteryExplosionHeader = localize('modalEventBatteryExplosionHeader', getLanguage());
    modalEventBatteryExplosionText = localize('modalEventBatteryExplosionText', getLanguage());
    modalEventScienceTheftHeader = localize('modalEventScienceTheftHeader', getLanguage());
    modalEventScienceTheftText = localize('modalEventScienceTheftText', getLanguage());
    modalEventResearchBreakthroughHeader = localize('modalEventResearchBreakthroughHeader', getLanguage());
    modalEventResearchBreakthroughText = localize('modalEventResearchBreakthroughText', getLanguage());
    modalEventRocketInstantArrivalHeader = localize('modalEventRocketInstantArrivalHeader', getLanguage());
    modalEventRocketInstantArrivalText = localize('modalEventRocketInstantArrivalText', getLanguage());
    modalEventAntimatterReactionHeader = localize('modalEventAntimatterReactionHeader', getLanguage());
    modalEventAntimatterReactionText = localize('modalEventAntimatterReactionText', getLanguage());
    modalEventStockLossHeader = localize('modalEventStockLossHeader', getLanguage());
    modalEventStockLossText = localize('modalEventStockLossText', getLanguage());
    modalEventStarshipLostInSpaceHeader = localize('modalEventStarshipLostInSpaceHeader', getLanguage());
    modalEventStarshipLostInSpaceText = localize('modalEventStarshipLostInSpaceText', getLanguage());
    modalEventEndlessSummerHeader = localize('modalEventEndlessSummerHeader', getLanguage());
    modalEventEndlessSummerText = localize('modalEventEndlessSummerText', getLanguage());
    modalEventEndlessSummerEndedHeader = localize('modalEventEndlessSummerEndedHeader', getLanguage());
    modalEventEndlessSummerEndedText = localize('modalEventEndlessSummerEndedText', getLanguage());
    modalEventGalacticMarketLockdownHeader = localize('modalEventGalacticMarketLockdownHeader', getLanguage());
    modalEventGalacticMarketLockdownText = localize('modalEventGalacticMarketLockdownText', getLanguage());
    modalEventGalacticMarketLockdownEndedHeader = localize('modalEventGalacticMarketLockdownEndedHeader', getLanguage());
    modalEventGalacticMarketLockdownEndedText = localize('modalEventGalacticMarketLockdownEndedText', getLanguage());
    modalEventMinerBrokeDownHeader = localize('modalEventMinerBrokeDownHeader', getLanguage());
    modalEventMinerBrokeDownText = localize('modalEventMinerBrokeDownText', getLanguage());
    modalEventMinerBrokeDownEndedHeader = localize('modalEventMinerBrokeDownEndedHeader', getLanguage());
    modalEventMinerBrokeDownEndedText = localize('modalEventMinerBrokeDownEndedText', getLanguage());
    modalEventSupplyChainDisruptionHeader = localize('modalEventSupplyChainDisruptionHeader', getLanguage());
    modalEventSupplyChainDisruptionText = localize('modalEventSupplyChainDisruptionText', getLanguage());
    modalEventSupplyChainDisruptionEndedHeader = localize('modalEventSupplyChainDisruptionEndedHeader', getLanguage());
    modalEventSupplyChainDisruptionEndedText = localize('modalEventSupplyChainDisruptionEndedText', getLanguage());
    modalEventBlackHoleInstabilityHeader = localize('modalEventBlackHoleInstabilityHeader', getLanguage());
    modalEventBlackHoleInstabilityText = localize('modalEventBlackHoleInstabilityText', getLanguage());
    modalEventBlackHoleInstabilityEndedHeader = localize('modalEventBlackHoleInstabilityEndedHeader', getLanguage());
    modalEventBlackHoleInstabilityEndedText = localize('modalEventBlackHoleInstabilityEndedText', getLanguage());

    randomEventTriggerDescriptions = {
        powerPlantExplosion: localize('randomEventTriggerPowerPlantExplosion', getLanguage()),
        batteryExplosion: localize('randomEventTriggerBatteryExplosion', getLanguage()),
        scienceTheft: localize('randomEventTriggerScienceTheft', getLanguage()),
        researchBreakthrough: localize('randomEventTriggerResearchBreakthrough', getLanguage()),
        rocketInstantArrival: localize('randomEventTriggerRocketInstantArrival', getLanguage()),
        antimatterReaction: localize('randomEventTriggerAntimatterReaction', getLanguage()),
        stockLoss: localize('randomEventTriggerStockLoss', getLanguage()),
        starshipLostInSpace: localize('randomEventTriggerStarshipLostInSpace', getLanguage()),
        endlessSummer: localize('randomEventTriggerEndlessSummer', getLanguage()),
        galacticMarketLockdown: localize('randomEventTriggerGalacticMarketLockdown', getLanguage()),
        minerBrokeDown: localize('randomEventTriggerMinerBrokeDown', getLanguage()),
        supplyChainDisruption: localize('randomEventTriggerSupplyChainDisruption', getLanguage()),
        blackHoleInstability: localize('randomEventTriggerBlackHoleInstability', getLanguage())
    };

    cosmicRipStatusMessages = {
        stabilizerArray: localize('stabilizerArrayBuilt', getLanguage()),
        quantumContainmentField: localize('quantumContainmentFieldGenerated', getLanguage()),
        dimensionalAnchorMatrix: localize('dimensionalAnchorMatrixBuilt', getLanguage()),
        singularityStabilizer: localize('singularityStabilizerConstructed', getLanguage()),
        realityWeaveRegulator: localize('realityWeaveRegulatorBuilt', getLanguage()),
        fullyStabilised: localize('cosmicRipFullyStabilised', getLanguage()),
        objectiveBuildStabilizerArray: localize('objectiveBuildStabilizerArray', getLanguage()),
        objectiveBuildQuantumContainmentField: localize('objectiveBuildQuantumContainmentField', getLanguage()),
        objectiveBuildDimensionalAnchorMatrix: localize('objectiveBuildDimensionalAnchorMatrix', getLanguage()),
        objectiveBuildSingularityStabilizer: localize('objectiveBuildSingularityStabilizer', getLanguage()),
        objectiveBuildRealityWeaveRegulator: localize('objectiveBuildRealityWeaveRegulator', getLanguage()),
        objectiveCloseCosmicRip: localize('objectiveCloseCosmicRip', getLanguage()),
        objectiveScanSectors: localize('objectiveScanSectors', getLanguage())
    };

    miaplacidusEndgameStoryPopups = [
        {
            header: localize('storyHeaderMiaplacidus', getLanguage()),
            content: localize('storyContentMiaplacidus', getLanguage()),
            confirmLabel: localize('confirmLabelContinue', getLanguage())
        },
        {
            header: localize('storyHeaderReclamation', getLanguage()),
            content: localize('storyContentReclamation', getLanguage()),
            confirmLabel: localize('confirmLabelContinue', getLanguage())
        },
        {
            header: localize('storyHeaderHuntBegins', getLanguage()),
            content: localize('storyContentHuntBegins', getLanguage()),
            confirmLabel: localize('confirmLabelContinue', getLanguage())
        },
        {
            header: localize('storyHeaderOneLastThing', getLanguage()),
            content: localize('storyContentOneLastThing', getLanguage()),
            confirmLabel: localize('confirmLabelLetsFinish', getLanguage())
        }
    ];

    headerDescriptions = {
        'Resources': localize('headerDescResources', getLanguage()),
        'Compounds': localize('headerDescCompounds', getLanguage()),
        'Interstellar': localize('headerDescInterstellar', getLanguage()),
        'Research': localize('headerDescResearch', getLanguage()),
        'Energy': localize('headerDescEnergy', getLanguage()),
        'Space Mining': localize('headerDescSpaceMining', getLanguage()),
        'Galactic': localize('headerDescGalactic', getLanguage()),
        'Cosmic Rip': localize('headerDescCosmicRip', getLanguage()),
        'Settings': localize('headerDescSettings', getLanguage()),
        
        'hydrogen': localize('headerDescHydrogen', getLanguage()),
        'helium': localize('headerDescHelium', getLanguage()),
        'carbon': localize('headerDescCarbon', getLanguage()),
        'neon': localize('headerDescNeon', getLanguage()),
        'oxygen': localize('headerDescOxygen', getLanguage()),
        'sodium': localize('headerDescSodium', getLanguage()),
        'silicon': localize('headerDescSilicon', getLanguage()),
        'iron': localize('headerDescIron', getLanguage()),

        'energy storage': localize('headerDescEnergyStorage', getLanguage()),
        'power plant': localize('headerDescPowerPlant', getLanguage()),
        'advanced power plant': localize('headerDescAdvancedPowerPlant', getLanguage()),
        'solar power plant': localize('headerDescSolarPowerPlant', getLanguage()),
        'research': localize('headerDescResearchUpgrades', getLanguage()),
        'technology': localize('headerDescTechnology', getLanguage()),
        'tech tree': localize('headerDescTechTree', getLanguage()),
        'philosophy': localize('headerDescPhilosophy', getLanguage()),
    
        'diesel': localize('headerDescDiesel', getLanguage()),
        'glass': localize('headerDescGlass', getLanguage()),
        'steel': localize('headerDescSteel', getLanguage()),
        'water': localize('headerDescWater', getLanguage()),
        'concrete': localize('headerDescConcrete', getLanguage()),
        'titanium': localize('headerDescTitanium', getLanguage()),

        'star map': localize('headerDescStarMap', getLanguage()),
        'star data': localize('headerDescStarData', getLanguage()),
        'star ship': localize('headerDescStarShip', getLanguage()),
        'fleet hangar': localize('headerDescFleetHangar', getLanguage()) + `<span class="green-ready-text">${getResourceDataObject('fleets', ['attackPower']).toFixed(0)}</span>`,
        'colonise': localize('headerDescColonise', getLanguage()) + `<span class="green-ready-text">${capitaliseWordsWithRomanNumerals(getDestinationStar())}</span> - Fleet Power: <span class="green-ready-text">${getResourceDataObject('fleets', ['attackPower']).toFixed(0)}</span>`,

        'mining': localize('headerDescMining', getLanguage()),
        'space telescope': localize('headerDescSpaceTelescope', getLanguage()),
        'asteroids': localize('headerDescAsteroids', getLanguage()),
        'launch pad': localize('headerDescLaunchPad', getLanguage()),

        'rebirth': getCurrentRunIsMegaStructureRun()
            ? localize('headerDescRebirthMega', getLanguage())
            : localize('headerDescRebirth', getLanguage()),

        'galactic market': localize('headerDescGalacticMarket', getLanguage()),
        'galactic casino': localize('headerDescGalacticCasino', getLanguage()),
        'ascendency perks': localize('headerDescAscendencyPerks', getLanguage()) + `<span class="green-ready-text">${getResourceDataObject('ascendencyPoints', ['quantity'])}</span>`,
        'megastructures': localize('headerDescMegastructures', getLanguage()),
        'black hole': localize('headerDescBlackHole', getLanguage()),

        'situation': localize('headerDescSituation', getLanguage()) + `<span id="cosmicRipGpBalance" class="green-ready-text">${getCosmicRipGalacticPoints()}</span>`,
        'near space scanner array': localize('headerDescNearSpaceScannerArray', getLanguage()) + `<span id="cosmicRipGpBalanceNearSpace" class="green-ready-text">${getCosmicRipGalacticPoints()}</span>`,
        'cosmic rip': localize('headerDescCosmicRipTab', getLanguage()) + `<span id="cosmicRipGpBalanceCosmicRip" class="green-ready-text">${getCosmicRipGalacticPoints()}</span>`,

        'contact': localize('headerDescContact', getLanguage()),
        'get started': localize('headerDescGetStarted', getLanguage()),
        'story': localize('headerDescStory', getLanguage()),
        'concepts - early': localize('headerDescConceptsEarly', getLanguage()),
        'concepts - mid': localize('headerDescConceptsMid', getLanguage()),
        'concepts - late': localize('headerDescConceptsLate', getLanguage()),
        'concepts - end goal': localize('headerDescConceptsEndGoal', getLanguage()),
        'philosophies': localize('headerDescPhilosophies', getLanguage()),
        'visual': localize('headerDescVisual', getLanguage()),
        'game options': localize('headerDescGameOptions', getLanguage()),
        'saving / loading': localize('headerDescSavingLoading', getLanguage()),
        'statistics': localize('headerDescStatistics', getLanguage()),
        'achievements': localize('headerDescAchievements', getLanguage()),
        'events': localize('headerDescEvents', getLanguage()),
        'exit game': localize('headerDescExitGame', getLanguage())
    };

    infoTooltipDescriptions = {
        info_starLegendWeather: localize('infoTooltipStarLegendWeather', getLanguage()),
        info_starMapModes: localize('infoTooltipStarMapModes', getLanguage()),
        info_starShipScanAP: localize('infoTooltipStarShipScanAP', getLanguage()),
        info_starShipScanPrecipitation: localize('infoTooltipStarShipScanPrecipitation', getLanguage()),
        info_starShipScanType: localize('infoTooltipStarShipScanType', getLanguage()),
        info_starShipScanDefense: localize('infoTooltipStarShipScanDefense', getLanguage()),
        info_starShipScanEnemyFleets: localize('infoTooltipStarShipScanEnemyFleets', getLanguage()),
        info_starShipScanThreatLevel: localize('infoTooltipStarShipScanThreatLevel', getLanguage()),
        info_fleetHangarHeader: localize('infoTooltipFleetHangarHeader', getLanguage()),
        info_miningHeader: localize('infoTooltipMiningHeader', getLanguage()),
        info_launchPadHeader: localize('infoTooltipLaunchPadHeader', getLanguage()),
        info_asteroidsHeader: localize('infoTooltipAsteroidsHeader', getLanguage()),
        info_philosophyHeader: localize('infoTooltipPhilosophyHeader', getLanguage()),
        info_galacticCasinoHeader: localize('infoTooltipGalacticCasinoHeader', getLanguage()),
        info_galacticCasinoWheelOfFortune: localize('infoTooltipGalacticCasinoWheelOfFortune', getLanguage()),
        info_rebirthLiquidation: localize('infoTooltipRebirthLiquidation', getLanguage()),
        info_cosmicRipHeader: localize('infoTooltipCosmicRipHeader', getLanguage()),
        info_nearSpaceScannerArrayHeader: localize('infoTooltipNearSpaceScannerArrayHeader', getLanguage()),
        info_situationHeader: localize('infoTooltipSituationHeader', getLanguage()),
    };

    rocketNames = {
        rocketDescription: localize('rocketDescription', getLanguage()),
        [getRocketUserName('rocket1').toLowerCase()]: localize('rocketDescription', getLanguage()),
        [getRocketUserName('rocket2').toLowerCase()]: localize('rocketDescription', getLanguage()),
        [getRocketUserName('rocket3').toLowerCase()]: localize('rocketDescription', getLanguage()),
        [getRocketUserName('rocket4').toLowerCase()]: localize('rocketDescription', getLanguage()),
    }

    techNotificationMessages = {
        knowledgeSharing: localize('techNotifyKnowledgeSharing', getLanguage()),
        fusionTheory: localize('techNotifyFusionTheory', getLanguage()),
        hydrogenFusion: localize('techNotifyHydrogenFusion', getLanguage()),
        heliumFusion: localize('techNotifyHeliumFusion', getLanguage()),
        carbonFusion: localize('techNotifyCarbonFusion', getLanguage()),
        neonFusion: localize('techNotifyNeonFusion', getLanguage()),
        oxygenFusion: localize('techNotifyOxygenFusion', getLanguage()),
        siliconFusion: localize('techNotifySiliconFusion', getLanguage()),
        nobleGasCollection: localize('techNotifyNobleGasCollection', getLanguage()),
        glassManufacture: localize('techNotifyGlassManufacture', getLanguage()),
        aggregateMixing: localize('techNotifyAggregateMixing', getLanguage()),
        neutronCapture: localize('techNotifyNeutronCapture', getLanguage()),
        quantumComputing: localize('techNotifyQuantumComputing', getLanguage()),
        scienceLaboratories: localize('techNotifyScienceLaboratories', getLanguage()),
        hydroCarbons: localize('techNotifyHydroCarbons', getLanguage()),
        nanoTubeTechnology: localize('techNotifyNanoTubeTechnology', getLanguage()),
        nanoBrokers: localize('techNotifyNanoBrokers', getLanguage()),
        stellarCartography: localize('techNotifyStellarCartography', getLanguage()),
        fusionEfficiencyI: localize('techNotifyFusionEfficiencyI', getLanguage()),
        fusionEfficiencyII: localize('techNotifyFusionEfficiencyII', getLanguage()),
        fusionEfficiencyIII: localize('techNotifyFusionEfficiencyIII', getLanguage()),
        atmosphericTelescopes: localize('techNotifyAtmosphericTelescopes', getLanguage()),
        giganticTurbines: localize('techNotifyGiganticTurbines', getLanguage()),
        steelFoundries: localize('techNotifySteelFoundries', getLanguage()),
        rocketComposites: localize('techNotifyRocketComposites', getLanguage()),
        advancedFuels: localize('techNotifyAdvancedFuels', getLanguage()),
        planetaryNavigation: localize('techNotifyPlanetaryNavigation', getLanguage()),
        advancedPowerGeneration: localize('techNotifyAdvancedPowerGeneration', getLanguage()),
        basicPowerGeneration: localize('techNotifyBasicPowerGeneration', getLanguage()),
        solarPowerGeneration: localize('techNotifySolarPowerGeneration', getLanguage()),
        compounds: localize('techNotifyCompounds', getLanguage()),
        sodiumIonPowerStorage: localize('techNotifySodiumIonPowerStorage', getLanguage()),
        orbitalConstruction: localize('techNotifyOrbitalConstruction', getLanguage()),
        antimatterEngines: localize('techNotifyAntimatterEngines', getLanguage()),
        FTLTravelTheory: localize('techNotifyFTLTravelTheory', getLanguage()),
        lifeSupportSystems: localize('techNotifyLifeSupportSystems', getLanguage()),
        starshipFleets: localize('techNotifyStarshipFleets', getLanguage()),
        stellarScanners: localize('techNotifyStellarScanners', getLanguage()),
        dysonSphereUnderstanding: localize('techNotifyDysonSphereUnderstanding', getLanguage()),
        dysonSphereCapabilities: localize('techNotifyDysonSphereCapabilities', getLanguage()),
        dysonSphereDisconnect: localize('techNotifyDysonSphereDisconnect', getLanguage()),
        dysonSpherePower: localize('techNotifyDysonSpherePower', getLanguage()),
        dysonSphereConnect: localize('techNotifyDysonSphereConnect', getLanguage()),
        celestialProcessingCoreUnderstanding: localize('techNotifyCelestialProcessingCoreUnderstanding', getLanguage()),
        celestialProcessingCoreCapabilities: localize('techNotifyCelestialProcessingCoreCapabilities', getLanguage()),
        celestialProcessingCoreDisconnect: localize('techNotifyCelestialProcessingCoreDisconnect', getLanguage()),
        celestialProcessingCorePower: localize('techNotifyCelestialProcessingCorePower', getLanguage()),
        celestialProcessingCoreConnect: localize('techNotifyCelestialProcessingCoreConnect', getLanguage()),
        plasmaForgeUnderstanding: localize('techNotifyPlasmaForgeUnderstanding', getLanguage()),
        plasmaForgeCapabilities: localize('techNotifyPlasmaForgeCapabilities', getLanguage()),
        plasmaForgeDisconnect: localize('techNotifyPlasmaForgeDisconnect', getLanguage()),
        plasmaForgePower: localize('techNotifyPlasmaForgePower', getLanguage()),
        plasmaForgeConnect: localize('techNotifyPlasmaForgeConnect', getLanguage()),
        galacticMemoryArchiveUnderstanding: localize('techNotifyGalacticMemoryArchiveUnderstanding', getLanguage()),
        galacticMemoryArchiveCapabilities: localize('techNotifyGalacticMemoryArchiveCapabilities', getLanguage()),
        galacticMemoryArchiveDisconnect: localize('techNotifyGalacticMemoryArchiveDisconnect', getLanguage()),
        galacticMemoryArchivePower: localize('techNotifyGalacticMemoryArchivePower', getLanguage()),
        galacticMemoryArchiveConnect: localize('techNotifyGalacticMemoryArchiveConnect', getLanguage())
    };

    galacticMarketTooltipDescriptions = {
        outgoingTitle: localize('galacticMarketOutgoingTitle', getLanguage()),
        outgoingText: localize('galacticMarketOutgoingText', getLanguage()),
        incomingTitle: localize('galacticMarketIncomingTitle', getLanguage()),
        incomingText: localize('galacticMarketIncomingText', getLanguage()),
        comparisonTitle: localize('galacticMarketComparisonTitle', getLanguage()),
        comparisonHigherOutgoing: localize('galacticMarketComparisonHigherOutgoing', getLanguage()),
        comparisonHigherIncoming: localize('galacticMarketComparisonHigherIncoming', getLanguage()),
        comparisonBalanced: localize('galacticMarketComparisonBalanced', getLanguage())
    };

    optionDescriptions = {
        hydrogenSellRow: {
            content1: localize('optionDescHydrogenSellContent1', getLanguage()),
            content2: localize('optionDescHydrogenSellContent2', getLanguage()),
            updateAt: "hydrogenFusion"
        },
        hydrogenGainRow: {
            content1: localize('optionDescHydrogenGainContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        hydrogenIncreaseStorageRow: {
            content1: localize('optionDescHydrogenStorageContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        heliumSellRow: {
            content1: localize('optionDescHeliumSellContent1', getLanguage()),
            content2: localize('optionDescHeliumSellContent2', getLanguage()),
            updateAt: "heliumFusion"
        },
        heliumGainRow: {
            content1: localize('optionDescHeliumGainContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        heliumIncreaseStorageRow: {
            content1: localize('optionDescHeliumStorageContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        carbonSellRow: {
            content1: localize('optionDescCarbonSellContent1', getLanguage()),
            content2: localize('optionDescCarbonSellContent2', getLanguage()),
            updateAt: "carbonFusion"
        },
        carbonGainRow: {
            content1: localize('optionDescCarbonGainContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        carbonIncreaseStorageRow: {
            content1: localize('optionDescCarbonStorageContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        neonSellRow: {
            content1: localize('optionDescNeonSellContent1', getLanguage()),
            content2: localize('optionDescNeonSellContent2', getLanguage()),
            updateAt: "neonFusion"
        },
        neonGainRow: {
            content1: localize('optionDescNeonGainContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        neonIncreaseStorageRow: {
            content1: localize('optionDescNeonStorageContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        oxygenSellRow: {
            content1: localize('optionDescOxygenSellContent1', getLanguage()),
            content2: localize('optionDescOxygenSellContent2', getLanguage()),
            updateAt: "oxygenFusion"
        },
        oxygenGainRow: {
            content1: localize('optionDescOxygenGainContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        oxygenIncreaseStorageRow: {
            content1: localize('optionDescOxygenStorageContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        sodiumSellRow: {
            content1: localize('optionDescSodiumSellContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        sodiumGainRow: {
            content1: localize('optionDescSodiumGainContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        sodiumIncreaseStorageRow: {
            content1: localize('optionDescSodiumStorageContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        siliconSellRow: {
            content1: localize('optionDescSiliconSellContent1', getLanguage()),
            content2: localize('optionDescSiliconSellContent2', getLanguage()),
            updateAt: "siliconFusion"
        },
        siliconGainRow: {
            content1: localize('optionDescSiliconGainContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        siliconIncreaseStorageRow: {
            content1: localize('optionDescSiliconStorageContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        ironSellRow: {
            content1: localize('optionDescIronSellContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        ironGainRow: {
            content1: localize('optionDescIronGainContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        ironIncreaseStorageRow: {
            content1: localize('optionDescIronStorageContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        dieselCreateRow: {
            content1: localize('optionDescDieselCreateContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        dieselSellRow: {
            content1: localize('optionDescDieselSellContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        dieselIncreaseStorageRow: {
            content1: localize('optionDescDieselStorageContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        glassCreateRow: {
            content1: localize('optionDescGlassCreateContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        glassSellRow: {
            content1: localize('optionDescGlassSellContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        glassIncreaseStorageRow: {
            content1: localize('optionDescGlassStorageContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        steelCreateRow: {
            content1: localize('optionDescSteelCreateContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        steelSellRow: {
            content1: localize('optionDescSteelSellContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        steelIncreaseStorageRow: {
            content1: localize('optionDescSteelStorageContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        waterCreateRow: {
            content1: localize('optionDescWaterCreateContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        waterSellRow: {
            content1: localize('optionDescWaterSellContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        waterIncreaseStorageRow: {
            content1: localize('optionDescWaterStorageContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        concreteCreateRow: {
            content1: localize('optionDescConcreteCreateContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        concreteSellRow: {
            content1: localize('optionDescConcreteSellContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        concreteIncreaseStorageRow: {
            content1: localize('optionDescConcreteStorageContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        titaniumCreateRow: {
            content1: localize('optionDescTitaniumCreateContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        titaniumSellRow: {
            content1: localize('optionDescTitaniumSellContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        titaniumIncreaseStorageRow: {
            content1: localize('optionDescTitaniumStorageContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        hydrogenAutoBuyer1Row: {
            content1: localize('optionDescHydrogenAutoBuyer1Content1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        hydrogenAutoBuyer2Row: {
            content1: localize('optionDescHydrogenAutoBuyer2Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        hydrogenAutoBuyer3Row: {
            content1: localize('optionDescHydrogenAutoBuyer3Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        hydrogenAutoBuyer4Row: {
            content1: localize('optionDescHydrogenAutoBuyer4Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        heliumAutoBuyer1Row: {
            content1: localize('optionDescHeliumAutoBuyer1Content1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        heliumAutoBuyer2Row: {
            content1: localize('optionDescHeliumAutoBuyer2Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        heliumAutoBuyer3Row: {
            content1: localize('optionDescHeliumAutoBuyer3Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        heliumAutoBuyer4Row: {
            content1: localize('optionDescHeliumAutoBuyer4Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        carbonAutoBuyer1Row: {
            content1: localize('optionDescCarbonAutoBuyer1Content1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        carbonAutoBuyer2Row: {
            content1: localize('optionDescCarbonAutoBuyer2Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        carbonAutoBuyer3Row: {
            content1: localize('optionDescCarbonAutoBuyer3Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        carbonAutoBuyer4Row: {
            content1: localize('optionDescCarbonAutoBuyer4Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        neonAutoBuyer1Row: {
            content1: localize('optionDescNeonAutoBuyer1Content1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        neonAutoBuyer2Row: {
            content1: localize('optionDescNeonAutoBuyer2Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        neonAutoBuyer3Row: {
            content1: localize('optionDescNeonAutoBuyer3Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        neonAutoBuyer4Row: {
            content1: localize('optionDescNeonAutoBuyer4Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        oxygenAutoBuyer1Row: {
            content1: localize('optionDescOxygenAutoBuyer1Content1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        oxygenAutoBuyer2Row: {
            content1: localize('optionDescOxygenAutoBuyer2Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        oxygenAutoBuyer3Row: {
            content1: localize('optionDescOxygenAutoBuyer3Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        oxygenAutoBuyer4Row: {
            content1: localize('optionDescOxygenAutoBuyer4Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        sodiumAutoBuyer1Row: {
            content1: localize('optionDescSodiumAutoBuyer1Content1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        sodiumAutoBuyer2Row: {
            content1: localize('optionDescSodiumAutoBuyer2Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        sodiumAutoBuyer3Row: {
            content1: localize('optionDescSodiumAutoBuyer3Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        sodiumAutoBuyer4Row: {
            content1: localize('optionDescSodiumAutoBuyer4Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        siliconAutoBuyer1Row: {
            content1: localize('optionDescSiliconAutoBuyer1Content1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        siliconAutoBuyer2Row: {
            content1: localize('optionDescSiliconAutoBuyer2Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        siliconAutoBuyer3Row: {
            content1: localize('optionDescSiliconAutoBuyer3Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        siliconAutoBuyer4Row: {
            content1: localize('optionDescSiliconAutoBuyer4Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        ironAutoBuyer1Row: {
            content1: localize('optionDescIronAutoBuyer1Content1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        ironAutoBuyer2Row: {
            content1: localize('optionDescIronAutoBuyer2Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        ironAutoBuyer3Row: {
            content1: localize('optionDescIronAutoBuyer3Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        ironAutoBuyer4Row: {
            content1: localize('optionDescIronAutoBuyer4Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        dieselAutoBuyer1Row: {
            content1: localize('optionDescDieselAutoBuyer1Content1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        dieselAutoBuyer2Row: {
            content1: localize('optionDescDieselAutoBuyer2Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        dieselAutoBuyer3Row: {
            content1: localize('optionDescDieselAutoBuyer3Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        dieselAutoBuyer4Row: {
            content1: localize('optionDescDieselAutoBuyer4Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        glassAutoBuyer1Row: {
            content1: localize('optionDescGlassAutoBuyer1Content1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        glassAutoBuyer2Row: {
            content1: localize('optionDescGlassAutoBuyer2Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        glassAutoBuyer3Row: {
            content1: localize('optionDescGlassAutoBuyer3Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        glassAutoBuyer4Row: {
            content1: localize('optionDescGlassAutoBuyer4Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        steelAutoBuyer1Row: {
            content1: localize('optionDescSteelAutoBuyer1Content1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        steelAutoBuyer2Row: {
            content1: localize('optionDescSteelAutoBuyer2Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        steelAutoBuyer3Row: {
            content1: localize('optionDescSteelAutoBuyer3Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        steelAutoBuyer4Row: {
            content1: localize('optionDescSteelAutoBuyer4Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        waterAutoBuyer1Row: {
            content1: localize('optionDescWaterAutoBuyer1Content1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        waterAutoBuyer2Row: {
            content1: localize('optionDescWaterAutoBuyer2Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        waterAutoBuyer3Row: {
            content1: localize('optionDescWaterAutoBuyer3Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        waterAutoBuyer4Row: {
            content1: localize('optionDescWaterAutoBuyer4Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        concreteAutoBuyer1Row: {
            content1: localize('optionDescConcreteAutoBuyer1Content1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        concreteAutoBuyer2Row: {
            content1: localize('optionDescConcreteAutoBuyer2Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        concreteAutoBuyer3Row: {
            content1: localize('optionDescConcreteAutoBuyer3Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        concreteAutoBuyer4Row: {
            content1: localize('optionDescConcreteAutoBuyer4Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        titaniumAutoBuyer1Row: {
            content1: localize('optionDescTitaniumAutoBuyer1Content1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        titaniumAutoBuyer2Row: {
            content1: localize('optionDescTitaniumAutoBuyer2Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier2', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        titaniumAutoBuyer3Row: {
            content1: localize('optionDescTitaniumAutoBuyer3Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier3', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        titaniumAutoBuyer4Row: {
            content1: localize('optionDescTitaniumAutoBuyer4Content1', getLanguage()) + ` ${Math.floor(getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier4', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        cosmicRipNearSpaceScannerArrayDeploySensorBuoyRow: {
            content1: localize('optionDescCosmicRipDeployBuoyContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        cosmicRipNearSpaceScannerArrayDeployRipResearchOrbiterRow: {
            content1: localize('optionDescCosmicRipDeployOrbiterContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        cosmicRipCosmicRipStatusRow: {
            content1: localize('optionDescCosmicRipStatusContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        cosmicRipStabilizerArrayRow: {
            content1: localize('optionDescCosmicRipStabilizerArrayContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        cosmicRipQuantumContainmentFieldRow: {
            content1: localize('optionDescCosmicRipQuantumContainmentContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        cosmicRipDimensionalAnchorMatrixRow: {
            content1: localize('optionDescCosmicRipDimensionalAnchorContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        cosmicRipSingularityStabilizerRow: {
            content1: localize('optionDescCosmicRipSingularityStabilizerContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        cosmicRipRealityWeaveRegulatorRow: {
            content1: localize('optionDescCosmicRipRealityWeaveContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        researchAutoBuyerRow: {
            content1: localize('optionDescResearchAutoBuyerContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        researchScienceKitRow: {
            content1: localize('optionDescResearchScienceKitContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        researchScienceClubRow: {
            content1: localize('optionDescResearchScienceClubContent1', getLanguage()),
            content2: "",
            updateAt: ""
        },
        researchScienceLabRow: {
            content1: localize('optionDescResearchScienceLabContent1', getLanguage()) + ` ${Math.floor(getResourceDataObject('research', ['upgrades', 'scienceLab', 'energyUse']) * getTimerRateRatio())}KJ / s`,
            content2: "",
            updateAt: ""
        },
        techKnowledgeSharingRow: {
            content1: localize('optionDescTechKnowledgeSharingContent1', getLanguage()),
            content2: localize('optionDescTechKnowledgeSharingContent2', getLanguage()),
            updateAt: ""
        },
        techFusionTheoryRow: {
            content1: localize('optionDescTechFusionTheoryContent1', getLanguage()),
            content2: localize('optionDescTechFusionTheoryContent2', getLanguage()),
            updateAt: ""
        },
        techHydrogenFusionRow: {
            content1: localize('optionDescTechHydrogenFusionContent1', getLanguage()),
            content2: localize('optionDescTechHydrogenFusionContent2', getLanguage()),
            updateAt: ""
        },
        techStellarCartographyRow: {
            content1: localize('optionDescTechStellarCartographyContent1', getLanguage()),
            content2: localize('optionDescTechStellarCartographyContent2', getLanguage()),
            updateAt: ""
        },
        techNanoBrokersRow: {
            content1: localize('optionDescTechNanoBrokersContent1', getLanguage()),
            content2: localize('optionDescTechNanoBrokersContent2', getLanguage()),
            updateAt: ""
        },
        techQuantumComputingRow: {
            content1: localize('optionDescTechQuantumComputingContent1', getLanguage()),
            content2: localize('optionDescTechQuantumComputingContent2', getLanguage()),
            updateAt: ""
        },
        techHeliumFusionRow: {
            content1: localize('optionDescTechHeliumFusionContent1', getLanguage()),
            content2: localize('optionDescTechHeliumFusionContent2', getLanguage()),
            updateAt: ""
        },
        techHydroCarbonsRow: {
            content1: localize('optionDescTechHydroCarbonsContent1', getLanguage()),
            content2: localize('optionDescTechHydroCarbonsContent2', getLanguage()),
            updateAt: ""
        },
        techNanoTubeTechnologyRow: {
            content1: localize('optionDescTechNanoTubeTechnologyContent1', getLanguage()),
            content2: localize('optionDescTechNanoTubeTechnologyContent2', getLanguage()),
            updateAt: ""
        },
        techCarbonFusionRow: {
            content1: localize('optionDescTechCarbonFusionContent1', getLanguage()),
            content2: localize('optionDescTechCarbonFusionContent2', getLanguage()),
            updateAt: ""
        },
        techNeonFusionRow: {
            content1: localize('optionDescTechNeonFusionContent1', getLanguage()),
            content2: localize('optionDescTechNeonFusionContent2', getLanguage()),
            updateAt: ""
        },
        techOxygenFusionRow: {
            content1: localize('optionDescTechOxygenFusionContent1', getLanguage()),
            content2: localize('optionDescTechOxygenFusionContent2', getLanguage()),
            updateAt: ""
        },
        techSiliconFusionRow: {
            content1: localize('optionDescTechSiliconFusionContent1', getLanguage()),
            content2: localize('optionDescTechSiliconFusionContent2', getLanguage()),
            updateAt: ""
        },
        techNeutronCaptureRow: {
            content1: localize('optionDescTechNeutronCaptureContent1', getLanguage()),
            content2: localize('optionDescTechNeutronCaptureContent2', getLanguage()),
            updateAt: ""
        },
        techGlassManufactureRow: {
            content1: localize('optionDescTechGlassManufactureContent1', getLanguage()),
            content2: localize('optionDescTechGlassManufactureContent2', getLanguage()),
            updateAt: ""
        },
        techAggregateMixingRow: {
            content1: localize('optionDescTechAggregateMixingContent1', getLanguage()),
            content2: localize('optionDescTechAggregateMixingContent2', getLanguage()),
            updateAt: ""
        },        
        techNobleGasCollectionRow: {
            content1: localize("techNobleGasCollectionContent1", getLanguage()),
            content2: localize("techNobleGasCollectionContent2", getLanguage()),
            updateAt: ""
        },
        techFusionEfficiencyIRow: {
            content1: localize("techFusionEfficiencyIContent1", getLanguage()),
            content2: localize("techFusionEfficiencyIContent2", getLanguage()),
            updateAt: ""
        },
        techFusionEfficiencyIIRow: {
            content1: localize("techFusionEfficiencyIIContent1", getLanguage()),
            content2: localize("techFusionEfficiencyIIContent2", getLanguage()),
            updateAt: ""
        },
        techFusionEfficiencyIIIRow: {
            content1: localize("techFusionEfficiencyIIIContent1", getLanguage()),
            content2: localize("techFusionEfficiencyIIIContent2", getLanguage()),
            updateAt: ""
        },
        techAtmosphericTelescopesRow: {
            content1: localize("techAtmosphericTelescopesContent1", getLanguage()),
            content2: localize("techAtmosphericTelescopesContent2", getLanguage()),
            updateAt: ""
        },
        techGiganticTurbinesRow: {
            content1: localize("techGiganticTurbinesContent1", getLanguage()),
            content2: localize("techGiganticTurbinesContent2", getLanguage()),
            updateAt: ""
        },
        techSteelFoundriesRow: {
            content1: localize("techSteelFoundriesContent1", getLanguage()),
            content2: localize("techSteelFoundriesContent2", getLanguage()),
            updateAt: ""
        },
        techCompoundsRow: {
            content1: localize("techCompoundsContent1", getLanguage()),
            content2: localize("techCompoundsContent2", getLanguage()),
            updateAt: ""
        },
        techRocketCompositesRow: {
            content1: localize("techRocketCompositesContent1", getLanguage()),
            content2: localize("techRocketCompositesContent2", getLanguage()),
            updateAt: ""
        },
        techAdvancedFuelsRow: {
            content1: localize("techAdvancedFuelsContent1", getLanguage()),
            content2: localize("techAdvancedFuelsContent2", getLanguage()),
            updateAt: ""
        },
        techPlanetaryNavigationRow: {
            content1: localize("techPlanetaryNavigationContent1", getLanguage()),
            content2: localize("techPlanetaryNavigationContent2", getLanguage()),
            updateAt: ""
        },
        techAdvancedPowerGenerationRow: {
            content1: localize("techAdvancedPowerGenerationContent1", getLanguage()),
            content2: localize("techAdvancedPowerGenerationContent2", getLanguage()),
            updateAt: ""
        },
        techBasicPowerGenerationRow: {
            content1: localize("techBasicPowerGenerationContent1", getLanguage()),
            content2: localize("techBasicPowerGenerationContent2", getLanguage()),
            updateAt: ""
        },
        techSolarPowerGenerationRow: {
            content1: localize("techSolarPowerGenerationContent1", getLanguage()),
            content2: localize("techSolarPowerGenerationContent2", getLanguage()),
            updateAt: ""
        },        
        techScienceLaboratoriesRow: {
            content1: localize("techScienceLaboratoriesContent1", getLanguage()),
            content2: localize("techScienceLaboratoriesContent2", getLanguage()),
            updateAt: "" 
        },
        techSodiumIonPowerStorageRow: {
            content1: localize("techSodiumIonPowerStorageContent1", getLanguage()),
            content2: localize("techSodiumIonPowerStorageContent2", getLanguage()),
            updateAt: "" 
        }, 
        techOrbitalConstructionRow: {
            content1: localize("techOrbitalConstructionContent1", getLanguage()),
            content2: localize("techOrbitalConstructionContent2", getLanguage()),
            updateAt: ""
        },
        techAntimatterEnginesRow: {
            content1: localize("techAntimatterEnginesContent1", getLanguage()),
            content2: localize("techAntimatterEnginesContent2", getLanguage()),
            updateAt: ""
        },
        techFTLTravelTheoryRow: {
            content1: localize("techFTLTravelTheoryContent1", getLanguage()),
            content2: localize("techFTLTravelTheoryContent2", getLanguage()),
            updateAt: ""
        },
        techLifeSupportSystemsRow: {
            content1: localize("techLifeSupportSystemsContent1", getLanguage()),
            content2: localize("techLifeSupportSystemsContent2", getLanguage()),
            updateAt: ""
        },
        techStarshipFleetsRow: {
            content1: localize("techStarshipFleetsContent1", getLanguage()),
            content2: localize("techStarshipFleetsContent2", getLanguage()),
            updateAt: ""
        },  
        techStellarScannersRow: {
            content1: localize("techStellarScannersContent1", getLanguage()),
            content2: localize("techStellarScannersContent2", getLanguage()),
            updateAt: ""
        }, 
        techDysonSphereUnderstandingRow: {
            content1: localize("techDysonSphereUnderstandingContent1", getLanguage()),
            content2: localize("techDysonSphereUnderstandingContent2", getLanguage()),
            updateAt: ""
        },
        techDysonSphereCapabilitiesRow: {
            content1: localize("techDysonSphereCapabilitiesContent1", getLanguage()),
            content2: localize("techDysonSphereCapabilitiesContent2", getLanguage()),
            updateAt: ""
        },
        techDysonSphereDisconnectRow: {
            content1: localize("techDysonSphereDisconnectContent1", getLanguage()),
            content2: localize("techDysonSphereDisconnectContent2", getLanguage()),
            updateAt: ""
        },
        techDysonSpherePowerRow: {
            content1: localize("techDysonSpherePowerContent1", getLanguage()),
            content2: localize("techDysonSpherePowerContent2", getLanguage()),
            updateAt: ""
        },
        techDysonSphereConnectRow: {
            content1: localize("techDysonSphereConnectContent1", getLanguage()),
            content2: localize("techDysonSphereConnectContent2", getLanguage()),
            updateAt: ""
        },
        techCelestialProcessingCoreUnderstandingRow: {
            content1: localize("techCelestialProcessingCoreUnderstandingContent1", getLanguage()),
            content2: localize("techCelestialProcessingCoreUnderstandingContent2", getLanguage()),
            updateAt: ""
        },
        techCelestialProcessingCoreCapabilitiesRow: {
            content1: localize("techCelestialProcessingCoreCapabilitiesContent1", getLanguage()),
            content2: localize("techCelestialProcessingCoreCapabilitiesContent2", getLanguage()),
            updateAt: ""
        },
        techCelestialProcessingCoreDisconnectRow: {
            content1: localize("techCelestialProcessingCoreDisconnectContent1", getLanguage()),
            content2: localize("techCelestialProcessingCoreDisconnectContent2", getLanguage()),
            updateAt: ""
        },
        techCelestialProcessingCorePowerRow: {
            content1: localize("techCelestialProcessingCorePowerContent1", getLanguage()),
            content2: localize("techCelestialProcessingCorePowerContent2", getLanguage()),
            updateAt: ""
        },
        techCelestialProcessingCoreConnectRow: {
            content1: localize("techCelestialProcessingCoreConnectContent1", getLanguage()),
            content2: localize("techCelestialProcessingCoreConnectContent2", getLanguage()),
            updateAt: ""
        },

        blackHoleChargeProgressRow: {
            content1: localize("blackHoleChargeProgressContent1", getLanguage()),
            content2: "",
            updateAt: ''
        },
        blackHoleTimeWarpProgressRow: {
            content1: localize("blackHoleTimeWarpProgressContent1", getLanguage()),
            content2: "",
            updateAt: ''
        },
        blackHoleInteractionRow: {
            content1: localize("blackHoleInteractionContent1", getLanguage()),
            content2: "",
            updateAt: ''
        },
        blackHoleFeedRow: {
            content1: localize("blackHoleFeedContent1", getLanguage()),
            content2: "",
            updateAt: ''
        },
        blackHoleStatsRow: {
            content1: localize("blackHoleStatsContent1", getLanguage()),
            content2: "",
            updateAt: ''
        },
        blackHoleActivationRow: {
            content1: localize("blackHoleActivationContent1", getLanguage()),
            content2: "",
            updateAt: ''
        },
        techPlasmaForgeCapabilitiesRow: {
            content1: localize("techPlasmaForgeCapabilitiesContent1", getLanguage()),
            content2: localize("techPlasmaForgeCapabilitiesContent2", getLanguage()),
            updateAt: ""
        },
        techPlasmaForgeDisconnectRow: {
            content1: localize("techPlasmaForgeDisconnectContent1", getLanguage()),
            content2: localize("techPlasmaForgeDisconnectContent2", getLanguage()),
            updateAt: ""
        },
        techPlasmaForgePowerRow: {
            content1: localize("techPlasmaForgePowerContent1", getLanguage()),
            content2: localize("techPlasmaForgePowerContent2", getLanguage()),
            updateAt: ""
        },
        techPlasmaForgeConnectRow: {
            content1: localize("techPlasmaForgeConnectContent1", getLanguage()),
            content2: localize("techPlasmaForgeConnectContent2", getLanguage()),
            updateAt: ""
        },

        techGalacticMemoryArchiveUnderstandingRow: {
            content1: localize("techGalacticMemoryArchiveUnderstandingContent1", getLanguage()),
            content2: localize("techGalacticMemoryArchiveUnderstandingContent2", getLanguage()),
            updateAt: ""
        },
        techGalacticMemoryArchiveCapabilitiesRow: {
            content1: localize("techGalacticMemoryArchiveCapabilitiesContent1", getLanguage()),
            content2: localize("techGalacticMemoryArchiveCapabilitiesContent2", getLanguage()),
            updateAt: ""
        },
        techGalacticMemoryArchiveDisconnectRow: {
            content1: localize("techGalacticMemoryArchiveDisconnectContent1", getLanguage()),
            content2: localize("techGalacticMemoryArchiveDisconnectContent2", getLanguage()),
            updateAt: ""
        },
        techGalacticMemoryArchivePowerRow: {
            content1: localize("techGalacticMemoryArchivePowerContent1", getLanguage()),
            content2: localize("techGalacticMemoryArchivePowerContent2", getLanguage()),
            updateAt: ""
        },
        techGalacticMemoryArchiveConnectRow: {
            content1: localize("techGalacticMemoryArchiveConnectContent1", getLanguage()),
            content2: localize("techGalacticMemoryArchiveConnectContent2", getLanguage()),
            updateAt: ""
        },      
        techPhilosophySpaceStorageTankResearchRow: {
            content1: localize("techPhilosophySpaceStorageTankResearchContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        techPhilosophyFleetHologramsRow: {
            content1: localize("techPhilosophyFleetHologramsContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        techPhilosophyVoidSeersRow: {
            content1: localize("techPhilosophyVoidSeersContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        techPhilosophyRapidExpansionRow: {
            content1: localize("techPhilosophyRapidExpansionContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        techPhilosophyEfficientAssemblyRow: {
            content1: localize("techPhilosophyEfficientAssemblyContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        techPhilosophyLaserMiningRow: {
            content1: localize("techPhilosophyLaserMiningContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        techPhilosophyMassCompoundAssemblyRow: {
            content1: localize("techPhilosophyMassCompoundAssemblyContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        techPhilosophyEnergyDronesRow: {
            content1: localize("techPhilosophyEnergyDronesContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        techPhilosophyHangarAutomationRow: {
            content1: localize("techPhilosophyHangarAutomationContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        techPhilosophySyntheticPlatingRow: {
            content1: localize("techPhilosophySyntheticPlatingContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        techPhilosophyAntimatterEngineMinaturizationRow: {
            content1: localize("techPhilosophyAntimatterEngineMinaturizationContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        techPhilosophyLaserIntensityResearchRow: {
            content1: localize("techPhilosophyLaserIntensityResearchContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        techPhilosophyStellarWhispersRow: {
            content1: localize("techPhilosophyStellarWhispersContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        techPhilosophyStellarInsightManifoldRow: {
            content1: localize("techPhilosophyStellarInsightManifoldContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        techPhilosophyAsteroidDwellersRow: {
            content1: localize("techPhilosophyAsteroidDwellersContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        techPhilosophyAscendencyPhilosophyRow: {
            content1: localize("techPhilosophyAscendencyPhilosophyContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        techPhilosophySpaceElevatorRow: {
            content1: localize("techPhilosophySpaceElevatorContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        techPhilosophyLaunchPadMassProductionRow: {
            content1: localize("techPhilosophyLaunchPadMassProductionContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        techPhilosophyAsteroidAttractorsRow: {
            content1: localize("techPhilosophyAsteroidAttractorsContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        techPhilosophyWarpDriveRow: {
            content1: localize("techPhilosophyWarpDriveContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },        
        energyPowerPlant1Row: {
            content1: localize("energyPowerPlant1Content1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        energyPowerPlant2Row: {
            content1: localize("energyPowerPlant2Content1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        energyPowerPlant3Row: {
            content1: localize("energyPowerPlant3Content1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        energyBattery1Row: {
            content1: localize("energyBattery1Content1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        energyBattery2Row: {
            content1: localize("energyBattery2Content1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        energyBattery3Row: {
            content1: localize("energyBattery3Content1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        antimatterSvgRow: {
            content1: localize("antimatterSvgContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        spaceBuildLaunchPadRow: {
            content1: localize("spaceBuildLaunchPadContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        spaceBuildTelescopeRow: {
            content1: localize("spaceBuildTelescopeContent1", getLanguage()),
            content2: "",
            updateAt: "" 
        },
        spaceTelescopeSearchAsteroidRow: {
            content1: localize("spaceTelescopeSearchAsteroidContent1", getLanguage()).replace("{power}", Math.floor(getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'energyUseSearchAsteroid']) * getTimerRateRatio())),
            content2: "",
            updateAt: "" 
        },
        spaceTelescopeInvestigateStarRow: {
            content1: localize("spaceTelescopeInvestigateStarContent1", getLanguage()).replace("{power}", Math.floor(getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'energyUseInvestigateStar']) * getTimerRateRatio())),
            content2: "",
            updateAt: "" 
        },
        spaceTelescopePhilosophyBoostResourcesAndCompoundsRow: {
            content1: localize("spaceTelescopePhilosophyBoostContent1", getLanguage()).replace("{power}", Math.floor(getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'energyUsePhilosophyBoostResourcesAndCompounds']) * getTimerRateRatio())),
            content2: "",
            updateAt: "" 
        },
        spaceRocket1TravelRow: {
            content1: localize("spaceRocketTravelContent1", getLanguage()),
            content2: "",
            updateAt: "" 
        },
        spaceRocket2TravelRow: {
            content1: localize("spaceRocketTravelContent1", getLanguage()),
            content2: "",
            updateAt: "" 
        },
        spaceRocket3TravelRow: {
            content1: localize("spaceRocketTravelContent1", getLanguage()),
            content2: "",
            updateAt: "" 
        },
        spaceRocket4TravelRow: {
            content1: localize("spaceRocketTravelContent1", getLanguage()),
            content2: "",
            updateAt: "" 
        },
        spaceRocket1AutoBuyerRow: {
            content1: localize("spaceRocketAutoBuyerContent1", getLanguage()).replace("{power}", Math.floor(getResourceDataObject('space', ['upgrades', 'rocket1', 'autoBuyer', 'tier1', 'energyUse']) * getTimerRateRatio())),
            content2: "",
            updateAt: ""
        },
        spaceRocket2AutoBuyerRow: {
            content1: localize("spaceRocketAutoBuyerContent1", getLanguage()).replace("{power}", Math.floor(getResourceDataObject('space', ['upgrades', 'rocket2', 'autoBuyer', 'tier1', 'energyUse']) * getTimerRateRatio())),
            content2: "",
            updateAt: ""
        },
        spaceRocket3AutoBuyerRow: {
            content1: localize("spaceRocketAutoBuyerContent1", getLanguage()).replace("{power}", Math.floor(getResourceDataObject('space', ['upgrades', 'rocket3', 'autoBuyer', 'tier1', 'energyUse']) * getTimerRateRatio())),
            content2: "",
            updateAt: ""
        },
        spaceRocket4AutoBuyerRow: {
            content1: localize("spaceRocketAutoBuyerContent1", getLanguage()).replace("{power}", Math.floor(getResourceDataObject('space', ['upgrades', 'rocket4', 'autoBuyer', 'tier1', 'energyUse']) * getTimerRateRatio())),
            content2: "",
            updateAt: ""
        },
        spaceStarShipStellarScannerRow: {
            content1: localize("spaceStarShipStellarScannerContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        spaceStarShipDestinationReminderRow: {
            content1: localize("spaceStarShipDestinationReminderContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        spaceFleetEnvoyBuildRow: {
            content1: localize("spaceFleetEnvoyBuildContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        spaceFleetScoutBuildRow: {
            content1: localize("spaceFleetScoutBuildContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        spaceFleetMarauderBuildRow: {
            content1: localize("spaceFleetMarauderBuildContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        spaceFleetLandStalkerBuildRow: {
            content1: localize("spaceFleetLandStalkerBuildContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        spaceFleetNavalStraferBuildRow: {
            content1: localize("spaceFleetNavalStraferBuildContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        rebirthRow: {
            content1: localize("rebirthContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        megastructureDiagramRow: {
            content1: "",
            content2: "",
            updateAt: ""
        },
        galacticMarketItemSelectRow: {
            content1: localize("galacticMarketItemSelectContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        galacticMarketSellApForCashRow: {
            content1: localize("galacticMarketSellApForCashContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        galacticMarketLiquidateForAPRow: {
            content1: localize("galacticMarketLiquidateForApContent1", getLanguage()),
            content2: localize("galacticMarketLiquidateForApContent2", getLanguage()),
            updateAt: ""
        },
        galacticCasinoPurchaseCpRow: {
            content1: localize("galacticCasinoPurchaseCpContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        galacticCasinoGame1Row: {
            content1: localize("galacticCasinoGame1Content1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        galacticCasinoGame2Row: {
            content1: localize("galacticCasinoGame2Content1", getLanguage()).replace("{price}", getPriceCasinoGame2()),
            content2: "",
            updateAt: ""
        },
        galacticCasinoGame3Row: {
            content1: localize("galacticCasinoGame3Content1", getLanguage()).replace("{price}", getPriceCasinoGame3()),
            content2: "",
            updateAt: ""
        },
        galacticCasinoGame4Row: {
            content1: localize("galacticCasinoGame4Content1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        settingsCurrencySymbolRow: {
            content1: localize("settingsCurrencySymbolContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        settingsNotationRow: {
            content1: localize("settingsNotationContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        settingsToggleNotificationsRow: {
            content1: localize("settingsToggleNotificationsContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        settingsThemeRow: {
            content1: localize("settingsThemeContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        diplomacyOptionsRow: {
            content1: localize("diplomacyOptionsContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        receptionStatusRow: {
            content1: localize("receptionStatusContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        buffLittleBagOfHydrogenRow: {
            content1: localize("buffLittleBagOfHydrogenContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        buffNonExhaustiveResourcesRow: {
            content1: localize("buffNonExhaustiveResourcesContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        buffEfficientStorageRow: {
            content1: localize("buffEfficientStorageContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        buffSmartAutoBuyersRow: {
            content1: localize("buffSmartAutoBuyersContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        buffJumpstartResearchRow: {
            content1: localize("buffJumpstartResearchContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        buffOptimizedPowerGridsRow: {
            content1: localize("buffOptimizedPowerGridsContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        buffCompoundAutomationRow: {
            content1: localize("buffCompoundAutomationContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        buffRoboticResearchAutomationRow: {
            content1: localize("buffRoboticResearchAutomationContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        buffFasterAsteroidScanRow: {
            content1: localize("buffFasterAsteroidScanContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        buffDeeperStarStudyRow: {
            content1: localize("buffDeeperStarStudyContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        buffAsteroidScannerBoostRow: {
            content1: localize("buffAsteroidScannerBoostContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        buffRocketFuelOptimizationRow: {
            content1: localize("buffRocketFuelOptimizationContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        buffEnhancedMiningRow: {
            content1: localize("buffEnhancedMiningContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        buffQuantumEnginesRow: {
            content1: localize("buffQuantumEnginesContent1", getLanguage()),
            content2: "",
            updateAt: ""
        },
        buffAutoSpaceTelescopeRow: {
            content1: localize("buffAutoSpaceTelescopeContent1", getLanguage()),
            content2: "",
            updateAt: ""
        }
    };

    newsTickerContent = {
        wackyEffects: [
            {
                body: localize("newsWackyWave", getLanguage()),
                item: "wave",
                linkWord: localize("newsWackyWave", getLanguage()),
                linkWord2: "",
                class: "",
                id: 1000
            },
            {
                body: localize("newsWackyDisco", getLanguage()),
                item: "disco",
                linkWord: localize("newsWackyDisco", getLanguage()),
                linkWord2: "",
                class: "",
                id: 1001
            },
            {
                body: localize("newsWackyBounce", getLanguage()),
                item: "bounce",
                linkWord: localize("newsWackyBounce", getLanguage()),
                linkWord2: "",
                class: "",
                id: 1002
            },
            {
                body: localize("newsWackyFade", getLanguage()),
                item: "fade",
                linkWord: localize("newsWackyFade", getLanguage()),
                linkWord2: "",
                class: "",
                id: 1003
            },
            {
                body: localize("newsWackyGlitch", getLanguage()),
                item: "glitch",
                linkWord: localize("newsWackyGlitch", getLanguage()),
                linkWord2: "",
                class: "",
                id: 1004
            },
            {
                body: localize("newsWackyWobble", getLanguage()),
                item: "wobble",
                linkWord: localize("newsWackyWobble", getLanguage()),
                linkWord2: "",
                class: "",
                id: 1005
            },
            {
                body: localize("newsWackyBoo", getLanguage()),
                item: "boo",
                linkWord: "Boo!",
                linkWord2: "",
                class: "boo",
                id: 1006
            },
            {
                body: localize("newsWackyFeedback", getLanguage()),
                item: "feedback",
                linkWord: "👍🏽👍🏽👍🏽",
                linkWord2: "👎🏽👎🏽👎🏽",
                class: "",
                id: 1007
            } 
        ],        
        oneOff: [
            {
                id : 3000,
                body: localize("newsOneOffStorageResources", getLanguage()).replace("{here}", localize("hereLinkWord", getLanguage())),
                type: ["storageMultiplier", 2],
                condition: "visible",
                category: ["resources"],
                item: "all",
                linkWord: localize("hereLinkWord", getLanguage()),
            },
            {
                id : 3001,
                body: localize("newsOneOffStorageCompounds", getLanguage()).replace("{here}", localize("hereLinkWord", getLanguage())),
                type: ["storageMultiplier", 2],
                condition: "visible",
                category: ["compounds"],
                item: "all",
                linkWord: localize("hereLinkWord", getLanguage()),
            },
            {
                id : 3002,
                body: localize("newsOneOffStorageAll", getLanguage()).replace("{here}", localize("hereLinkWord", getLanguage())),
                type: ["storageMultiplier", 2],
                condition: "visible",
                category: ["resources", "compounds"],
                item: "all",
                linkWord: localize("hereLinkWord", getLanguage()),
            },
            {
                id : 3003,
                body: localize("newsOneOffStorageBattery1", getLanguage()).replace("{here}", localize("hereLinkWord", getLanguage())),
                type: ["storageMultiplier", 2],
                condition: "",
                category: ["buildings", "batteries"],
                item: ["energy", "battery1"],
                linkWord: localize("hereLinkWord", getLanguage()),
            },
            {   
                id : 3004,
                body: localize("newsOneOffStorageBattery2", getLanguage()).replace("{here}", localize("hereLinkWord", getLanguage())),
                type: ["storageMultiplier", 2],
                condition: "",
                category: ["buildings", "batteries"],
                item: ["energy", "battery2"],
                linkWord: localize("hereLinkWord", getLanguage()),
            },
            {
                id : 3005,
                body: localize("newsOneOffStorageBattery3", getLanguage()).replace("{here}", localize("hereLinkWord", getLanguage())),
                type: ["storageMultiplier", 2],
                condition: "",
                category: ["buildings", "batteries"],
                item: ["energy", "battery3"],
                linkWord: localize("hereLinkWord", getLanguage()),
            },
            {
                id : 3006,
                body: localize("newsOneOffOutputPowerPlant1", getLanguage()).replace("{here}", localize("hereLinkWord", getLanguage())),
                type: ["rateMultiplier", 2],
                condition: "",
                category: ["buildings"],
                item: ["energy", "powerPlant1"],
                linkWord: localize("hereLinkWord", getLanguage()),
            },
            {
                id : 3007,
                body: localize("newsOneOffOutputPowerPlant2", getLanguage()).replace("{here}", localize("hereLinkWord", getLanguage())),
                type: ["rateMultiplier", 2],
                condition: "",
                category: ["buildings"],
                item: ["energy", "powerPlant2"],
                linkWord: localize("hereLinkWord", getLanguage()),
            },
            {
                id : 3008,
                body: localize("newsOneOffOutputPowerPlant3", getLanguage()).replace("{here}", localize("hereLinkWord", getLanguage())),
                type: ["rateMultiplier", 2],
                condition: "",
                category: ["buildings"],
                item: ["energy", "powerPlant3"],
                linkWord: localize("hereLinkWord", getLanguage()),
            },            
            {
                id : 3009,
                body: localize("newsOneOffOutputAutoBuyerResources", getLanguage()).replace("{here}", localize("hereLinkWord", getLanguage())),
                type: ["rateMultiplier", 2],
                condition: "",
                category: ["resources"],
                item: ["all", "tier1"],
                linkWord: localize("hereLinkWord", getLanguage()),
            },
            {
                id : 3010,
                body: localize("newsOneOffOutputAutoBuyerCompounds", getLanguage()),
                type: ["rateMultiplier", 2],
                condition: "",
                category: ["compounds"],
                item: ["all", "tier1"],
                linkWord: localize("hereLinkWord", getLanguage()),
            },
            {
                id : 3011,
                body: localize("newsOneOffOutputAutoBuyerAll", getLanguage()),
                type: ["rateMultiplier", 2],
                condition: "",
                category: ["resources", "compounds"],
                item: ["all", "tier1"],
                linkWord: localize("hereLinkWord", getLanguage()),
            },
            {
                id: 3012,
                body: localize("newsOneOffFreeAntimatter", getLanguage()),
                type: ["adder", 100],
                condition: "visible",
                category: "antimatter",
                item: "quantity",
                linkWord: localize("hereLinkWord", getLanguage()),
            },            
            {
                id: 3013,
                body: localize("newsOneOffFreeAP", getLanguage()).replace("{ap}", getPlayerPhilosophy() === 'voidborn' && getStatRun() > 1 ? (1 + calculateAndAddExtraAPFromPhilosophyRepeatable(getRepeatableTechMultipliers('4'))) : 1),
                type: ["adder", getPlayerPhilosophy() === 'voidborn' && getStatRun() > 1 ? (1 + calculateAndAddExtraAPFromPhilosophyRepeatable(getRepeatableTechMultipliers('4'))) : 1],
                condition: "visible",
                category: "ascendencyPoints",
                item: "quantity",
                linkWord: localize("hereLinkWord", getLanguage()),
            }                
        ],
        prize: [
            {
                body: localize("newsPrizeHydrogen", getLanguage()).replace("{amount}", "xxx"),
                type: "giftResource",
                condition: "visible",
                category: "resources",
                item: "hydrogen",
                linkWord: localize("hereLinkWord", getLanguage()),
                id: 2000
            },
            {
                body: localize("newsPrizeHelium", getLanguage()).replace("{amount}", "xxx"),
                type: "giftResource",
                condition: "visible",
                category: "resources",
                item: "helium",
                linkWord: localize("hereLinkWord", getLanguage()),
                id: 2001
            },
            {
                body: localize("newsPrizeCarbon", getLanguage()).replace("{amount}", "xxx"),
                type: "giftResource",
                condition: "visible",
                category: "resources",
                item: "carbon",
                linkWord: localize("hereLinkWord", getLanguage()),
                id: 2002
            },
            {
                body: localize("newsPrizeNeon", getLanguage()).replace("{amount}", "xxx"),
                type: "giftResource",
                condition: "visible",
                category: "resources",
                item: "neon",
                linkWord: localize("hereLinkWord", getLanguage()),
                id: 2003
            },
            {
                body: localize("newsPrizeOxygen", getLanguage()).replace("{amount}", "xxx"),
                type: "giftResource",
                condition: "visible",
                category: "resources",
                item: "oxygen",
                linkWord: localize("hereLinkWord", getLanguage()),
                id: 2004
            },
            {
                body: localize("newsPrizeSodium", getLanguage()).replace("{amount}", "xxx"),
                type: "giftResource",
                condition: "visible",
                category: "resources",
                item: "sodium",
                linkWord: localize("hereLinkWord", getLanguage()),
                id: 2005
            },
            {
                body: localize("newsPrizeSilicon", getLanguage()).replace("{amount}", "xxx"),
                type: "giftResource",
                condition: "visible",
                category: "resources",
                item: "silicon",
                linkWord: localize("hereLinkWord", getLanguage()),
                id: 2006
            },
            {
                body: localize("newsPrizeIron", getLanguage()).replace("{amount}", "xxx"),
                type: "giftResource",
                condition: "visible",
                category: "resources",
                item: "iron",
                linkWord: localize("hereLinkWord", getLanguage()),
                id: 2007
            },
            {
                body: localize("newsPrizeDiesel", getLanguage()).replace("{amount}", "xxx"),
                type: "giftResource",
                condition: "visible",
                category: "compounds",
                item: "diesel",
                linkWord: localize("hereLinkWord", getLanguage()),
                id: 2008
            },
            {
                body: localize("newsPrizeGlass", getLanguage()).replace("{amount}", "xxx"),
                type: "giftResource",
                condition: "visible",
                category: "compounds",
                item: "glass",
                linkWord: localize("hereLinkWord", getLanguage()),
                id: 2009
            },
            {
                body: localize("newsPrizeSteel", getLanguage()).replace("{amount}", "xxx"),
                type: "giftResource",
                condition: "visible",
                category: "compounds",
                item: "steel",
                linkWord: localize("hereLinkWord", getLanguage()),
                id: 2010
            },
            {
                body: localize("newsPrizeConcrete", getLanguage()).replace("{amount}", "xxx"),
                type: "giftResource",
                condition: "visible",
                category: "compounds",
                item: "concrete",
                linkWord: localize("hereLinkWord", getLanguage()),
                id: 2011
            },
            {
                body: localize("newsPrizeTitanium", getLanguage()).replace("{amount}", "xxx"),
                type: "giftResource",
                condition: "visible",
                category: "compounds",
                item: "titanium",
                linkWord: localize("hereLinkWord", getLanguage()),
                id: 2012
            },
            {
                body: localize("newsPrizeWater", getLanguage()).replace("{amount}", "xxx"),
                type: "giftResource",
                condition: "visible",
                category: "compounds",
                item: "water",
                linkWord: localize("hereLinkWord", getLanguage()),
                id: 2013
            }
        ],
        manuscriptClues: [
            {
                id: 4000,
                template: localize("newsManuscriptScholars", getLanguage())
            },
            {
                id: 4001,
                template: localize("newsManuscriptAstrometric", getLanguage())
            },
            {
                id: 4002,
                template: localize("newsManuscriptFragments", getLanguage())
            },
            {
                id: 4003,
                template: localize("newsManuscriptExplorer", getLanguage())
            },
            {
                id: 4004,
                template: localize("newsManuscriptQuantum", getLanguage())
            },
            {
                id: 4005,
                template: localize("newsManuscriptGuardian", getLanguage())
            },
            {
                id: 4006,
                template: localize("newsManuscriptPilgrims", getLanguage())
            },
            {
                id: 4007,
                template: localize("newsManuscriptParchment", getLanguage())
            },
            {
                id: 4008,
                template: localize("newsManuscriptAstronomers", getLanguage())
            },
            {
                id: 4009,
                template: localize("newsManuscriptReported", getLanguage())
            }
        ],
        noPrize: [   //push index as id
            localize('newsNoPrizeHydrogenSurpluses', getLanguage()),
            localize('newsNoPrizeResearchCouncil', getLanguage()),
            localize('newsNoPrizeAutoBuyers', getLanguage()),
            localize('newsNoPrizeGainModules', getLanguage()),
            localize('newsNoPrizeEnergyCrisis', getLanguage()),
            localize('newsNoPrizeSolarAnomalies', getLanguage()),
            localize('newsNoPrizeMiningGuilds', getLanguage()),
            localize('newsNoPrizePrecipitationStudy', getLanguage()),
            localize('newsNoPrizeEnvoys', getLanguage()),
            localize('newsNoPrizeStarshipParts', getLanguage()),
            localize('newsNoPrizeGalacticSenate', getLanguage()),
            localize('newsNoPrizeVoidBorn', getLanguage()),
            localize('newsNoPrizePhilosophyRecords', getLanguage()),
            localize('newsNoPrizeTelescopeRecalibrated', getLanguage()),
            localize('newsNoPrizeDiplomaticCollapse', getLanguage()),
            localize('newsNoPrizeAPInflation', getLanguage()),
            localize('newsNoPrizeScienceKits', getLanguage()),
            localize('newsNoPrizeConstructorGuild', getLanguage()),
            localize('newsNoPrizeNewAI', getLanguage()),
            localize('newsNoPrizeRareCompounds', getLanguage()),
            localize('newsNoPrizeSentientDiplomacy', getLanguage()),
            localize('newsNoPrizeAntimatterBreach', getLanguage()),
            localize('newsNoPrizeMeteorological', getLanguage()),
            localize('newsNoPrizeRocketMiner', getLanguage()),
            localize('newsNoPrizeLegislators', getLanguage()),
            localize('newsNoPrizePhilosophyDivergence', getLanguage()),
            localize('newsNoPrizeTelescopeScans', getLanguage()),
            localize('newsNoPrizeRebirthDebate', getLanguage()),
            localize('newsNoPrizeGalacticMarketScrutiny', getLanguage()),
            localize('newsNoPrizeSpicaHydrogen', getLanguage()),
            localize('newsNoPrizeSpicaFusion', getLanguage()),
            localize('newsNoPrizeMiaplacidusSignal', getLanguage()),
            localize('newsNoPrizeAncientManuscripts', getLanguage()),
            localize('newsNoPrizeGuardiansGrip', getLanguage()),
            localize('newsNoPrizeNewCompound', getLanguage()),
            localize('newsNoPrizeUnknownVessels', getLanguage()),
            localize('newsNoPrizeForceField', getLanguage()),
            localize('newsNoPrizeGuardianDrones', getLanguage()),
            localize('newsNoPrizeElementSynthesis', getLanguage()),
            localize('newsNoPrizeDiplomaticChannels', getLanguage()),
            localize('newsNoPrizeTimeDilation', getLanguage()),
            localize('newsNoPrizeSpicaSun', getLanguage()),
            localize('newsNoPrizeGuardiansLockdown', getLanguage()),
            localize('newsNoPrizeRareMineral', getLanguage()),
            localize('newsNoPrizeCryptocurrency', getLanguage()),
            localize('newsNoPrizePlasmaStorms', getLanguage()),
            localize('newsNoPrizeAncientRelic', getLanguage()),
            localize('newsNoPrizeGuardianWarships', getLanguage()),
            localize('newsNoPrizeSecretMeeting', getLanguage()),
            localize('newsNoPrizeNewAlliance', getLanguage()),
            localize('newsNoPrizeMintakaWhispers', getLanguage()),
            localize('newsNoPrizeRegulusRumours', getLanguage()),
            localize('newsNoPrizeMenkalinanReports', getLanguage()),
            localize('newsNoPrizeRebirthColonization', getLanguage()),
            localize('newsNoPrizeForceFieldIntegrity', getLanguage()),
            localize('newsNoPrizeRebelNegotiations', getLanguage()),
            localize('newsNoPrizeDataLeak', getLanguage()),
            localize('newsNoPrizeEconomyBoom', getLanguage()),
            localize('newsNoPrizeMysteriousArtifact', getLanguage()),
            localize('newsNoPrizeSpicaDiplomacy', getLanguage()),
            localize('newsNoPrizeTechAdvancements', getLanguage()),
            localize('newsNoPrizeGoldenAge', getLanguage()),
            localize('newsNoPrizeExplorers', getLanguage()),
            localize('newsNoPrizeRebellionLegacy', getLanguage()),
            localize('newsNoPrizeFreedomMonument', getLanguage()),
            localize('newsNoPrizeMiaplacidusLegend', getLanguage()),
            localize('newsNoPrizeManuscriptResearch', getLanguage()),
            localize('newsNoPrizeNewCouncil', getLanguage()),
            localize('newsNoPrizeCulturalExchanges', getLanguage()),
            localize('newsNoPrizeNewChapter', getLanguage()),
            localize('newsNoPrizeGuardianOrigins', getLanguage()),
            localize('newsNoPrizeEndOfStory', getLanguage()),      
            localize('newsNoPrizeHummingbird', getLanguage()),
            localize('newsNoPrizeShortestFlight', getLanguage()),
            localize('newsNoPrizeEiffelTower', getLanguage()),
            localize('newsNoPrizeBananas', getLanguage()),
            localize('newsNoPrizeHiccups', getLanguage()),
            localize('newsNoPrizeHumNose', getLanguage()),
            localize('newsNoPrizeCowFriends', getLanguage()),
            localize('newsNoPrizeVenus', getLanguage()),
            localize('newsNoPrizeHoney', getLanguage()),
            localize('newsNoPrizeCloudWeight', getLanguage()),
            localize('newsNoPrizeMoonMoving', getLanguage()),
            localize('newsNoPrizeFlamingos', getLanguage()),
            localize('newsNoPrizeAstronautsCry', getLanguage()),
            localize('newsNoPrizeSloths', getLanguage()),
            localize('newsNoPrizeWombat', getLanguage()),
            localize('newsNoPrizeEiffelExpansion', getLanguage()),
            localize('newsNoPrizeStarsSand', getLanguage()),
            localize('newsNoPrizePenguins', getLanguage()),
            localize('newsNoPrizeSharksTrees', getLanguage()),
            localize('newsNoPrizeSneezeSpeed', getLanguage()),
            localize('newsNoPrizeNarwhal', getLanguage()),
            localize('newsNoPrizeStomachLining', getLanguage()),
            localize('newsNoPrizeCleopatra', getLanguage()),
            localize('newsNoPrizeButterfliesFeet', getLanguage()),
            localize('newsNoPrizeOrganTransplant', getLanguage()),
            localize('newsNoPrizeSnowflake', getLanguage()),
            localize('newsNoPrizeVenusDay', getLanguage()),
            localize('newsNoPrizeOctopusHearts', getLanguage()),
            localize('newsNoPrizeBamboo', getLanguage()),
            localize('newsNoPrizeRubberBandBall', getLanguage()),
            localize('newsNoPrizeShortestWar', getLanguage()),
            localize('newsNoPrizeShakespeare', getLanguage()),
            localize('newsNoPrizeJellyfish', getLanguage()),
            localize('newsNoPrizeMudskipper', getLanguage()),
            localize('newsNoPrizeGiraffeNeck', getLanguage()),
            localize('newsNoPrizeSnowman', getLanguage()),
            localize('newsNoPrizeNoSleep', getLanguage()),
            localize('newsNoPrizeAlarmClock', getLanguage()),
            localize('newsNoPrizePluto', getLanguage()),
            localize('newsNoPrizeSpiderSilk', getLanguage()),
            localize('newsNoPrizeCleopatraGreek', getLanguage()),
            localize('newsNoPrizeFakeFlamingos', getLanguage()),
            localize('newsNoPrizeElbowLick', getLanguage()),
            localize('newsNoPrizeOwls', getLanguage()),
            localize('newsNoPrizeChangeDollar', getLanguage()),
            localize('newsNoPrizeJoey', getLanguage()),
            localize('newsNoPrizeBambooType', getLanguage()),
            localize('newsNoPrizeScotlandUnicorn', getLanguage()),
            localize('newsNoPrizeNoseScents', getLanguage()),
            localize('newsNoPrizeFullMoon', getLanguage()),
            localize('newsNoPrizePenguinsSwim', getLanguage()),
            localize('newsNoPrizeRocksMuseum', getLanguage()),
            localize('newsNoPrizeSaliva', getLanguage()),
            localize('newsNoPrizeRollerCoaster', getLanguage()),
            localize('newsNoPrizeGreatWall', getLanguage()),
            localize('newsNoPrizeTasteBud', getLanguage()),
            localize('newsNoPrizeWalkMiles', getLanguage()),
            localize('newsNoPrizeSharkAge', getLanguage()),
            localize('newsNoPrizeSneezeRecover', getLanguage()),
            localize('newsNoPrizeEiffelPaint', getLanguage()),
            localize('newsNoPrizeScotlandMythical', getLanguage()),
            localize('newsNoPrizeMarsDay', getLanguage()),
            localize('newsNoPrizeButterflySensors', getLanguage()),
            localize('newsNoPrizeMasseter', getLanguage()),
            localize('newsNoPrizeScotlandFlight', getLanguage()),
            localize('newsNoPrizePigsSmart', getLanguage()),
            localize('newsNoPrizeLongestWord', getLanguage()),
            localize('newsNoPrizeEarthCore', getLanguage()),
            localize('newsNoPrizeOctopusHeartsDetail', getLanguage()),
            localize('newsNoPrizeHoneybee', getLanguage()),
            localize('newsNoPrizeToadCure', getLanguage()),
            localize('newsNoPrizeTattoos', getLanguage()),
            localize('newsNoPrizeHiccupRecord', getLanguage()),
            localize('newsNoPrizeCowMemory', getLanguage()),
            localize('newsNoPrizeOctopusTaste', getLanguage()),
            localize('newsNoPrizeBananaBerry', getLanguage()),
            localize('newsNoPrizePaperFold', getLanguage()),
            localize('newsNoPrizeNerdWord', getLanguage()),
            localize('newsNoPrizeDiamondRain', getLanguage()),
            localize('newsNoPrizeDolphinsMirror', getLanguage()),
            localize('newsNoPrizePandaDiet', getLanguage()),
            localize('newsNoPrizeChickenFlight', getLanguage()),
            localize('newsNoPrizeMouseWood', getLanguage()),
            localize('newsNoPrizeCleopatraPyramid', getLanguage()),
            localize('newsNoPrizeChessAtoms', getLanguage()),
            localize('newsNoPrizeBurjKhalifa', getLanguage()),
            localize('newsNoPrizeClowder', getLanguage()),
            localize('newsNoPrizeGoldfishMemory', getLanguage()),
            localize('newsNoPrizeKidneyTransplant', getLanguage()),
            localize('newsNoPrizeBlueWhale', getLanguage()),
            localize('newsNoPrizeSudanPyramids', getLanguage()),
            localize('newsNoPrizeRedLights', getLanguage()),
            localize('newsNoPrizeNorwayHell', getLanguage()),
            localize('newsNoPrizeKangarooBack', getLanguage()),
            localize('newsNoPrizePaperFoldSeven', getLanguage()),
            localize('newsNoPrizePeanutsLegumes', getLanguage()),
            localize('newsNoPrizeRobotWord', getLanguage()),
            localize('newsNoPrizeDolphinNames', getLanguage()),
            localize('newsNoPrizeHumanBanana', getLanguage()),
            localize('newsNoPrizeMercuryDay', getLanguage()),
            localize('newsNoPrizeTestify', getLanguage()),
            localize('newsNoPrizeTwinsGap', getLanguage()),
            localize('newsNoPrizeOlympusMons', getLanguage()),
            localize('newsNoPrizeRatsLaugh', getLanguage()),
            localize('newsNoPrizeOttersHands', getLanguage()),
            localize('newsNoPrizeGiraffeTongue', getLanguage()),
            localize('newsNoPrizePlasticFlamingos', getLanguage()),
            localize('newsNoPrizeHairCount', getLanguage()),
            localize('newsNoPrizeCannonball', getLanguage()),
            localize('newsNoPrizeRomeMouthwash', getLanguage()),
            localize('newsNoPrizeBreatheSwallow', getLanguage()),
            localize('newsNoPrizeCrocodileDung', getLanguage()),
            localize('newsNoPrizeAstronautHelmet', getLanguage()),
            localize('newsNoPrizeNumpad', getLanguage()),
            localize('newsNoPrizeManuscriptsHint', getLanguage()),
            localize('newsNoPrizeAmericanChance', getLanguage()),
            localize('newsNoPrizePayGame', getLanguage()),
            localize('newsNoPrizeCanadaSouth', getLanguage()),
            localize('newsNoPrizeCasinoProfits', getLanguage()),
            localize('newsNoPrizeCasinoRigged', getLanguage()),
            localize('newsNoPrizeMysteryGambler', getLanguage()),
            localize('newsNoPrizeCasinoSecurity', getLanguage()),
            localize('newsNoPrizeGamingCommission', getLanguage()),
            localize('newsNoPrizeCosmicRipEnergy', getLanguage()),
            localize('newsNoPrizeRealityWeave', getLanguage()),
            localize('newsNoPrizeDimensionalAnchors', getLanguage()),
            localize('newsNoPrizeQuantumFractures', getLanguage()),
            localize('newsNoPrizeHarmonics', getLanguage()),
        ]
    };

    statisticsContent = {
        'overview': {
            subHeading1: localize('statsOverviewSubHeading1', getLanguage()),
            subBody1: "NoData",

            subHeading2: localize('statsOverviewSubHeading2', getLanguage()),
            subBody2: "NoData",

            subHeading3: localize('statsOverviewSubHeading3', getLanguage()),
            subBody3: "NoData",

            subHeading4: localize('statsOverviewSubHeading4', getLanguage()),
            subBody4: "NoData",

            subHeading5: localize('statsOverviewSubHeading5', getLanguage()),
            subBody5: "NoData",

            subHeading6: localize('statsOverviewSubHeading6', getLanguage()),
            subBody6: "NoData",

            subHeading7: localize('statsOverviewSubHeading7', getLanguage()),
            subBody7: "NoData",

            subHeading8: localize('statsOverviewSubHeading8', getLanguage()),
            subBody8: "NoData",

            subHeading9: localize('statsOverviewSubHeading9', getLanguage()),
            subBody9: "NoData",

            subHeading10: localize('statsOverviewSubHeading10', getLanguage()),
            subBody10: "NoData",

            subHeading11: localize('statsOverviewSubHeading11', getLanguage()),
            subBody11: "NoData",

            subHeading12: localize('statsOverviewSubHeading12', getLanguage()),
            subBody12: "NoData",

            subHeading13: localize('statsOverviewSubHeading13', getLanguage()),
            subBody13: "NoData"
        },
        'run': {
            subHeading1: localize('statsRunSubHeading1', getLanguage()),
            subBody1: "NoData",

            subHeading2: localize('statsRunSubHeading2', getLanguage()),
            subBody2: "NoData",

            subHeading3: localize('statsRunSubHeading3', getLanguage()),
            subBody3: "NoData",

            subHeading4: localize('statsRunSubHeading4', getLanguage()),
            subBody4: "NoData",

            subHeading5: localize('statsRunSubHeading5', getLanguage()),
            subBody5: "NoData",

            subHeading6: localize('statsRunSubHeading6', getLanguage()),
            subBody6: "NoData"
        },
        'events': {
            subHeading1: localize('statsEventsSubHeading1', getLanguage()),
            subBody1: "NoData",

            subHeading2: localize('statsEventsSubHeading2', getLanguage()),
            subBody2: "NoData",

            subHeading3: localize('statsEventsSubHeading3', getLanguage()),
            subBody3: "NoData",

            subHeading4: localize('statsEventsSubHeading4', getLanguage()),
            subBody4: "NoData",

            subHeading5: localize('statsEventsSubHeading5', getLanguage()),
            subBody5: "NoData",

            subHeading6: localize('statsEventsSubHeading6', getLanguage()),
            subBody6: "NoData",

            subHeading7: localize('statsEventsSubHeading7', getLanguage()),
            subBody7: "NoData",

            subHeading8: localize('statsEventsSubHeading8', getLanguage()),
            subBody8: "NoData",

            subHeading9: localize('statsEventsSubHeading9', getLanguage()),
            subBody9: "NoData",

            subHeading10: localize('statsEventsSubHeading10', getLanguage()),
            subBody10: "NoData",

            subHeading11: localize('statsEventsSubHeading11', getLanguage()),
            subBody11: "NoData",

            subHeading12: localize('statsEventsSubHeading12', getLanguage()),
            subBody12: "NoData",

            subHeading13: localize('statsEventsSubHeading13', getLanguage()),
            subBody13: "NoData",
        },
        'resources': {
            subHeading1: localize('statsResourcesSubHeading1', getLanguage()),
            subBody1: "NoData",

            subHeading2: localize('statsResourcesSubHeading2', getLanguage()),
            subBody2: "NoData",

            subHeading3: localize('statsResourcesSubHeading3', getLanguage()),
            subBody3: "NoData",

            subHeading4: localize('statsResourcesSubHeading4', getLanguage()),
            subBody4: "NoData",

            subHeading5: localize('statsResourcesSubHeading5', getLanguage()),
            subBody5: "NoData",

            subHeading6: localize('statsResourcesSubHeading6', getLanguage()),
            subBody6: "NoData",

            subHeading7: localize('statsResourcesSubHeading7', getLanguage()),
            subBody7: "NoData",

            subHeading8: localize('statsResourcesSubHeading8', getLanguage()),
            subBody8: "NoData"
        },
        'compounds': {
            subHeading1: localize('statsCompoundsSubHeading1', getLanguage()),
            subBody1: "NoData",

            subHeading2: localize('statsCompoundsSubHeading2', getLanguage()),
            subBody2: "NoData",

            subHeading3: localize('statsCompoundsSubHeading3', getLanguage()),
            subBody3: "NoData",

            subHeading4: localize('statsCompoundsSubHeading4', getLanguage()),
            subBody4: "NoData",

            subHeading5: localize('statsCompoundsSubHeading5', getLanguage()),
            subBody5: "NoData",

            subHeading6: localize('statsCompoundsSubHeading6', getLanguage()),
            subBody6: "NoData"
        },
        'research': {
            subHeading1: localize('statsResearchSubHeading1', getLanguage()),
            subBody1: "NoData",

            subHeading2: localize('statsResearchSubHeading2', getLanguage()),
            subBody2: "NoData",

            subHeading3: localize('statsResearchSubHeading3', getLanguage()),
            subBody3: "NoData",

            subHeading4: localize('statsResearchSubHeading4', getLanguage()),
            subBody4: "NoData",

            subHeading5: localize('statsResearchSubHeading5', getLanguage()),
            subBody5: "NoData"
        },
        'energy': {
            subHeading1: localize('statsEnergySubHeading1', getLanguage()),
            subBody1: "NoData",

            subHeading2: localize('statsEnergySubHeading2', getLanguage()),
            subBody2: "NoData",

            subHeading3: localize('statsEnergySubHeading3', getLanguage()),
            subBody3: "NoData",

            subHeading4: localize('statsEnergySubHeading4', getLanguage()),
            subBody4: "NoData",

            subHeading5: localize('statsEnergySubHeading5', getLanguage()),
            subBody5: "NoData",

            subHeading6: localize('statsEnergySubHeading6', getLanguage()),
            subBody6: "NoData",

            subHeading7: localize('statsEnergySubHeading7', getLanguage()),
            subBody7: "NoData",

            subHeading8: localize('statsEnergySubHeading8', getLanguage()),
            subBody8: "NoData",

            subHeading9: localize('statsEnergySubHeading9', getLanguage()),
            subBody9: "NoData",

            subHeading10: localize('statsEnergySubHeading10', getLanguage()),
            subBody10: "NoData",

            subHeading11: localize('statsEnergySubHeading11', getLanguage()),
            subBody11: "NoData",

            subHeading12: localize('statsEnergySubHeading12', getLanguage()),
            subBody12: "NoData"
        },
        'spaceMining': {
            subHeading1: localize('statsSpaceMiningSubHeading1', getLanguage()),
            subBody1: "NoData",

            subHeading2: localize('statsSpaceMiningSubHeading2', getLanguage()),
            subBody2: "NoData",

            subHeading3: localize('statsSpaceMiningSubHeading3', getLanguage()),
            subBody3: "NoData",

            subHeading4: localize('statsSpaceMiningSubHeading4', getLanguage()),
            subBody4: "NoData",

            subHeading5: localize('statsSpaceMiningSubHeading5', getLanguage()),
            subBody5: "NoData",
        },
        'interstellar': {
            subHeading1: localize('statsInterstellarSubHeading1', getLanguage()),
            subBody1: "NoData",

            subHeading2: localize('statsInterstellarSubHeading2', getLanguage()),
            subBody2: "NoData",

            subHeading3: localize('statsInterstellarSubHeading3', getLanguage()),
            subBody3: "NoData",

            subHeading4: localize('statsInterstellarSubHeading4', getLanguage()),
            subBody4: "NoData",

            subHeading5: localize('statsInterstellarSubHeading5', getLanguage()),
            subBody5: "NoData",

            subHeading6: localize('statsInterstellarSubHeading6', getLanguage()),
            subBody6: "NoData",

            subHeading7: localize('statsInterstellarSubHeading7', getLanguage()),
            subBody7: "NoData",

            subHeading8: localize('statsInterstellarSubHeading8', getLanguage()),
            subBody8: "NoData",

            subHeading9: localize('statsInterstellarSubHeading9', getLanguage()),
            subBody9: "NoData",

            subHeading10: localize('statsInterstellarSubHeading10', getLanguage()),
            subBody10: "NoData",

            subHeading11: localize('statsInterstellarSubHeading11', getLanguage()),
            subBody11: "NoData",

            subHeading12: localize('statsInterstellarSubHeading12', getLanguage()),
            subBody12: "NoData",

            subHeading13: localize('statsInterstellarSubHeading13', getLanguage()),
            subBody13: "NoData",

            subHeading14: localize('statsInterstellarSubHeading14', getLanguage()),
            subBody14: "NoData",

            subHeading15: localize('statsInterstellarSubHeading15', getLanguage()),
            subBody15: "NoData",

            subHeading16: localize('statsInterstellarSubHeading16', getLanguage()),
            subBody16: "NoData",

            subHeading17: localize('statsInterstellarSubHeading17', getLanguage()),
            subBody17: "NoData",
        }
        ,
        'galactic Casino': {
            subHeading1: localize('statsGalacticcasinoSubHeading1', getLanguage()),
            subBody1: "NoData",

            subHeading2: localize('statsGalacticcasinoSubHeading2', getLanguage()),
            subBody2: "NoData",

            subHeading3: localize('statsGalacticcasinoSubHeading3', getLanguage()),
            subBody3: "NoData",

            subHeading4: localize('statsGalacticcasinoSubHeading4', getLanguage()),
            subBody4: "NoData",

            subHeading5: localize('statsGalacticcasinoSubHeading5', getLanguage()),
            subBody5: "NoData",

            subHeading6: localize('statsGalacticcasinoSubHeading6', getLanguage()),
            subBody6: "NoData",

            subHeading7: localize('statsGalacticcasinoSubHeading7', getLanguage()),
            subBody7: "NoData",

            subHeading8: localize('statsGalacticcasinoSubHeading8', getLanguage()),
            subBody8: "NoData",

            subHeading9: localize('statsGalacticcasinoSubHeading9', getLanguage()),
            subBody9: "NoData",

            subHeading10: localize('statsGalacticcasinoSubHeading10', getLanguage()),
            subBody10: "NoData",
        }
        ,
        'cosmic Rip Chapter': {
            subHeading1: localize('statsCosmicripchapterSubHeading1', getLanguage()),
            subBody1: "NoData",

            subHeading2: localize('statsCosmicripchapterSubHeading2', getLanguage()),
            subBody2: "NoData",

            subHeading3: localize('statsCosmicripchapterSubHeading3', getLanguage()),
            subBody3: "NoData",

            subHeading4: localize('statsCosmicripchapterSubHeading4', getLanguage()),
            subBody4: "NoData",

            subHeading5: localize('statsCosmicripchapterSubHeading5', getLanguage()),
            subBody5: "NoData",

            subHeading6: localize('statsCosmicripchapterSubHeading6', getLanguage()),
            subBody6: "NoData",

            subHeading7: localize('statsCosmicripchapterSubHeading7', getLanguage()),
            subBody7: "NoData",
        }
    }

    helpContent = {
        'contact': {
            subHeading1: localize('helpContactSubHeading1', getLanguage()),
            subBody1: '',
            subHeading2: localize('helpContactSubHeading2', getLanguage()),
            subBody2: `https://discord.gg/6bUN6BNtny`,
            subHeading3: localize('helpContactSubHeading3', getLanguage()),
            subBody3: localize('helpContactSubBody3', getLanguage()),
        },
        'get started': {
            subHeading1: localize('helpGetStartedSubHeading1', getLanguage()),
            subBody1: localize('helpGetStartedSubBody1', getLanguage()),
        },
        'story': {
            subHeading1: localize('helpStorySubHeading1', getLanguage()),
            subBody1: localize('helpStorySubBody1', getLanguage()),
            subHeading2: localize('helpStorySubHeading2', getLanguage()),
            subBody2: localize('helpStorySubBody2', getLanguage()),
            subHeading3: localize('helpStorySubHeading3', getLanguage()),
            subBody3: localize('helpStorySubBody3', getLanguage()),
        },
        'concepts - early': {
            subHeading1: localize('helpConceptsEarlySubHeading1', getLanguage()),
            subBody1: localize('helpConceptsEarlySubBody1', getLanguage()),
            subHeading2: localize('helpConceptsEarlySubHeading2', getLanguage()),
            subBody2: localize('helpConceptsEarlySubBody2', getLanguage()),
            subHeading3: localize('helpConceptsEarlySubHeading3', getLanguage()),
            subBody3: localize('helpConceptsEarlySubBody3', getLanguage()),
            subHeading4: localize('helpConceptsEarlySubHeading4', getLanguage()),
            subBody4: localize('helpConceptsEarlySubBody4', getLanguage()),
            subHeading5: localize('helpConceptsEarlySubHeading5', getLanguage()),
            subBody5: localize('helpConceptsEarlySubBody5', getLanguage()),
            subHeading6: localize('helpConceptsEarlySubHeading6', getLanguage()),
            subBody6: localize('helpConceptsEarlySubBody6', getLanguage()),
            subHeading7: localize('helpConceptsEarlySubHeading7', getLanguage()),
            subBody7: localize('helpConceptsEarlySubBody7', getLanguage()),
            subHeading8: localize('helpConceptsEarlySubHeading8', getLanguage()),
            subBody8: localize('helpConceptsEarlySubBody8', getLanguage()),
            subHeading9: localize('helpConceptsEarlySubHeading9', getLanguage()),
            subBody9: localize('helpConceptsEarlySubBody9', getLanguage()),
            subHeading10: localize('helpConceptsEarlySubHeading10', getLanguage()),
            subBody10: localize('helpConceptsEarlySubBody10', getLanguage()),
            subHeading11: localize('helpConceptsEarlySubHeading11', getLanguage()),
            subBody11: localize('helpConceptsEarlySubBody11', getLanguage()),
        },
        'concepts - mid': {
            subHeading1: localize('helpConceptsMidSubHeading1', getLanguage()),
            subBody1: localize('helpConceptsMidSubBody1', getLanguage()),
            subHeading2: localize('helpConceptsMidSubHeading2', getLanguage()),
            subBody2: localize('helpConceptsMidSubBody2', getLanguage()),
            subHeading3: localize('helpConceptsMidSubHeading3', getLanguage()),
            subBody3: localize('helpConceptsMidSubBody3', getLanguage()),
            subHeading4: localize('helpConceptsMidSubHeading4', getLanguage()),
            subBody4: localize('helpConceptsMidSubBody4', getLanguage()),
            subHeading5: localize('helpConceptsMidSubHeading5', getLanguage()),
            subBody5: localize('helpConceptsMidSubBody5', getLanguage()),
            subHeading6: localize('helpConceptsMidSubHeading6', getLanguage()),
            subBody6: localize('helpConceptsMidSubBody6', getLanguage()),
            subHeading7: localize('helpConceptsMidSubHeading7', getLanguage()),
            subBody7: localize('helpConceptsMidSubBody7', getLanguage()),
            subHeading8: localize('helpConceptsMidSubHeading8', getLanguage()),
            subBody8: localize('helpConceptsMidSubBody8', getLanguage()),
            subHeading9: localize('helpConceptsMidSubHeading9', getLanguage()),
            subBody9: localize('helpConceptsMidSubBody9', getLanguage()),
            subHeading10: localize('helpConceptsMidSubHeading10', getLanguage()),
            subBody10: localize('helpConceptsMidSubBody10', getLanguage()),
            subHeading11: localize('helpConceptsMidSubHeading11', getLanguage()),
            subBody11: localize('helpConceptsMidSubBody11', getLanguage()),
            subHeading12: localize('helpConceptsMidSubHeading12', getLanguage()),
            subBody12: localize('helpConceptsMidSubBody12', getLanguage()),
        },
        'concepts - late': {
            subHeading1: localize('helpConceptsLateSubHeading1', getLanguage()),
            subBody1: localize('helpConceptsLateSubBody1', getLanguage()),
            subHeading2: localize('helpConceptsLateSubHeading2', getLanguage()),
            subBody2: localize('helpConceptsLateSubBody2', getLanguage()),
            subHeading3: localize('helpConceptsLateSubHeading3', getLanguage()),
            subBody3: localize('helpConceptsLateSubBody3', getLanguage()),
            subHeading4: localize('helpConceptsLateSubHeading4', getLanguage()),
            subBody4: localize('helpConceptsLateSubBody4', getLanguage()),
            subHeading5: localize('helpConceptsLateSubHeading5', getLanguage()),
            subBody5: localize('helpConceptsLateSubBody5', getLanguage()),
            subHeading6: localize('helpConceptsLateSubHeading6', getLanguage()),
            subBody6: localize('helpConceptsLateSubBody6', getLanguage()),
            subHeading7: localize('helpConceptsLateSubHeading7', getLanguage()),
            subBody7: localize('helpConceptsLateSubBody7', getLanguage()),
            subHeading8: localize('helpConceptsLateSubHeading8', getLanguage()),
            subBody8: localize('helpConceptsLateSubBody8', getLanguage()),
            subHeading9: localize('helpConceptsLateSubHeading9', getLanguage()),
            subBody9: localize('helpConceptsLateSubBody9', getLanguage()),
            subHeading10: localize('helpConceptsLateSubHeading10', getLanguage()),
            subBody10: localize('helpConceptsLateSubBody10', getLanguage()),
            subHeading11: localize('helpConceptsLateSubHeading11', getLanguage()),
            subBody11: localize('helpConceptsLateSubBody11', getLanguage()),
            subHeading12: localize('helpConceptsLateSubHeading12', getLanguage()),
            subBody12: localize('helpConceptsLateSubBody12', getLanguage()),
            subHeading13: localize('helpConceptsLateSubHeading13', getLanguage()),
            subBody13: localize('helpConceptsLateSubBody13', getLanguage()),
            subHeading14: localize('helpConceptsLateSubHeading14', getLanguage()),
            subBody14: localize('helpConceptsLateSubBody14', getLanguage()),
            subHeading15: localize('helpConceptsLateSubHeading15', getLanguage()),
            subBody15: localize('helpConceptsLateSubBody15', getLanguage()),
            subHeading16: localize('helpConceptsLateSubHeading16', getLanguage()),
            subBody16: localize('helpConceptsLateSubBody16', getLanguage())
        },
        'concepts - end goal': {
            subHeading1: localize('helpConceptsEndGoalSubHeading1', getLanguage()),
            subBody1: localize('helpConceptsEndGoalSubBody1', getLanguage()),
            subHeading2: localize('helpConceptsEndGoalSubHeading2', getLanguage()),
            subBody2: localize('helpConceptsEndGoalSubBody2', getLanguage()),
            subHeading3: localize('helpConceptsEndGoalSubHeading3', getLanguage()),
            subBody3: localize('helpConceptsEndGoalSubBody3', getLanguage()),
            subHeading4: localize('helpConceptsEndGoalSubHeading4', getLanguage()),
            subBody4: localize('helpConceptsEndGoalSubBody4', getLanguage()),
            subHeading5: localize('helpConceptsEndGoalSubHeading5', getLanguage()),
            subBody5: localize('helpConceptsEndGoalSubBody5', getLanguage()),
        },
        'philosophies': {
            subHeading1: localize('helpPhilosophiesSubHeading1', getLanguage()),
            subBody1: localize('helpPhilosophiesSubBody1', getLanguage()),
            subHeading2: localize('helpPhilosophiesSubHeading2', getLanguage()),
            subBody2: localize('helpPhilosophiesSubBody2', getLanguage()),
            subHeading3: localize('helpPhilosophiesSubHeading3', getLanguage()),
            subBody3: localize('helpPhilosophiesSubBody3', getLanguage()),
            subHeading4: localize('helpPhilosophiesSubHeading4', getLanguage()),
            subBody4: localize('helpPhilosophiesSubBody4', getLanguage()),
            subHeading5: localize('helpPhilosophiesSubHeading5', getLanguage()),
            subBody5: localize('helpPhilosophiesSubBody5', getLanguage()),
            subHeading6: localize('helpPhilosophiesSubHeading6', getLanguage()),
            subBody6: localize('helpPhilosophiesSubBody6', getLanguage()),
            subHeading7: localize('helpPhilosophiesSubHeading7', getLanguage()),
            subBody7: localize('helpPhilosophiesSubBody7', getLanguage()),
        }
    }
    
    achievementTooltipDescriptionTexts = {
        "collect50Hydrogen": localize('achievementCollect50Hydrogen', getLanguage()),
        "collect1000Hydrogen": localize('achievementCollect1000Hydrogen', getLanguage()),
        "collect5000Carbon": localize('achievementCollect5000Carbon', getLanguage()),
        "collect50000Iron": localize('achievementCollect50000Iron', getLanguage()),
        "researchTechnology": localize('achievementResearchTechnology', getLanguage()),
        "researchAllTechnologies": localize('achievementResearchAllTechnologies', getLanguage()),
        "achieve100FusionEfficiency": localize('achievementAchieve100FusionEfficiency', getLanguage()),
        "fuseElement": localize('achievementFuseElement', getLanguage()),
        "gain100Cash": localize('achievementGain100Cash', getLanguage()),
        "gain10000Cash": localize('achievementGain10000Cash', getLanguage()),
        "gain100000Cash": localize('achievementGain100000Cash', getLanguage()),
        "gain1000000Cash": localize('achievementGain1000000Cash', getLanguage()),
        "buildPowerPlant": localize('achievementBuildPowerPlant', getLanguage()),
        "tripPower": localize('achievementTripPower', getLanguage()),
        "buildSolarPowerPlant": localize('achievementBuildSolarPowerPlant', getLanguage()),
        "collect100Precipitation": localize('achievementCollect100Precipitation', getLanguage()),
        "unlockCompounds": localize('achievementUnlockCompounds', getLanguage()),
        "createSteel": localize('achievementCreateSteel', getLanguage()),
        "createTitanium": localize('achievementCreateTitanium', getLanguage()),
        "discoverAsteroid": localize('achievementDiscoverAsteroid', getLanguage()),
        "launchRocket": localize('achievementLaunchRocket', getLanguage()),
        "mineAllAntimatterAsteroid": localize('achievementMineAllAntimatterAsteroid', getLanguage()),
        "studyStar": localize('achievementStudyStar', getLanguage()),
        "studyStarMoreThan5LYAway": localize('achievementStudyStarMoreThan5LYAway', getLanguage()),
        "studyStarMoreThan20LYAway": localize('achievementStudyStarMoreThan20LYAway', getLanguage()),
        "launchStarship": localize('achievementLaunchStarship', getLanguage()),
        "initiateDiplomacyWithAlienRace": localize('achievementInitiateDiplomacyWithAlienRace', getLanguage()),
        "bullyEnemyIntoSubmission": localize('achievementBullyEnemyIntoSubmission', getLanguage()),
        "vassalizeEnemy": localize('achievementVassalizeEnemy', getLanguage()),
        "conquerEnemy": localize('achievementConquerEnemy', getLanguage()),
        "conquerHiveMindEnemy": localize('achievementConquerHiveMindEnemy', getLanguage()),
        "conquerBelligerentEnemy": localize('achievementConquerBelligerentEnemy', getLanguage()),
        "conquerEnemyWithoutScanning": localize('achievementConquerEnemyWithoutScanning', getLanguage()),
        "settleUnoccupiedSystem": localize('achievementSettleUnoccupiedSystem', getLanguage()),
        "discoverSystemWithNoLife": localize('achievementDiscoverSystemWithNoLife', getLanguage()),
        "settleSystem": localize('achievementSettleSystem', getLanguage()),
        "spendAP": localize('achievementSpendAP', getLanguage()),
        "performGalacticMarketTransaction": localize('achievementPerformGalacticMarketTransaction', getLanguage()),
        "liquidateAllAssets": localize('achievementLiquidateAllAssets', getLanguage()),
        "rebirth": localize('achievementRebirth', getLanguage()),
        "conquer10StarSystems": localize('achievementConquer10StarSystems', getLanguage()),
        "conquer50StarSystems": localize('achievementConquer50StarSystems', getLanguage()),
        "seeAllNewsTickers": localize('achievementSeeAllNewsTickers', getLanguage()),
        "activateAllWackyNewsTickers": localize('achievementActivateAllWackyNewsTickers', getLanguage()),
        "collect100TitaniumAsPrecipitation": localize('achievementCollect100TitaniumAsPrecipitation', getLanguage()),
        "discoverLegendaryAsteroid": localize('achievementDiscoverLegendaryAsteroid', getLanguage()),
        "have4RocketsMiningAntimatter": localize('achievementHave4RocketsMiningAntimatter', getLanguage()),
        "studyAllStarsInOneRun": localize('achievementStudyAllStarsInOneRun', getLanguage()),
        "trade10APForCash": localize('achievementTrade10APForCash', getLanguage()),
        "have50HoursWithOnePioneer": localize('achievementHave50HoursWithOnePioneer', getLanguage()),
        "adoptPhilosophy": localize('achievementAdoptPhilosophy', getLanguage()),
        "discoverBlackHole": localize('achievementDiscoverBlackHole', getLanguage()),
        "activateBlackHoleOver10x": localize('achievementActivateBlackHoleOver10x', getLanguage()),
        "findAncientManuscript": localize('achievementFindAncientManuscript', getLanguage()),
        "conquerMegastructureSystem": localize('achievementConquerMegastructureSystem', getLanguage()),
        "bringDownMiaplacideanForceField": localize('achievementBringDownMiaplacideanForceField', getLanguage()),
        "completeGame": localize('achievementCompleteGame', getLanguage()),
        "completeRunOnMiaplacidus": localize('achievementCompleteRunOnMiaplacidus', getLanguage()),
        "haveFleetSizeOf50EachShipType": localize('achievementHaveFleetSizeOf50EachShipType', getLanguage()),
        "tryAllThemes": localize('achievementTryAllThemes', getLanguage()),
        "buyCasinoPoints": localize('achievementBuyCasinoPoints', getLanguage()),
        "winAllCasinoGames": localize('achievementWinAllCasinoGames', getLanguage()),
        "winWheelSpecialPrize": localize('achievementWinWheelSpecialPrize', getLanguage()),
        "restoreNearSpaceScannerArray": localize('achievementRestoreNearSpaceScannerArray', getLanguage()),
        "findCosmicRip": localize('achievementFindCosmicRip', getLanguage()),
        "gain1MTelemetryData": localize('achievementGain1MTelemetryData', getLanguage()),
        "closeCosmicRip": localize('achievementCloseCosmicRip', getLanguage()),
        "suffer5NegativeEvents": localize('achievementSuffer5NegativeEvents', getLanguage()),
        "enjoyEndlessSummer": localize('achievementEnjoyEndlessSummer', getLanguage()),
        "completeOnboarding": localize('achievementCompleteOnboarding', getLanguage()),      
    };

    achievementNotifications = {
        "collect50HydrogenNotification": localize('achievementNotificationCollect50Hydrogen', getLanguage()),
        "collect1000HydrogenNotification": localize('achievementNotificationCollect1000Hydrogen', getLanguage()),
        "collect5000CarbonNotification": localize('achievementNotificationCollect5000Carbon', getLanguage()),
        "collect50000IronNotification": localize('achievementNotificationCollect50000Iron', getLanguage()),
        "researchTechnologyNotification": localize('achievementNotificationResearchTechnology', getLanguage()),
        "researchAllTechnologiesNotification": localize('achievementNotificationResearchAllTechnologies', getLanguage()),
        "achieve100FusionEfficiencyNotification": localize('achievementNotificationAchieve100FusionEfficiency', getLanguage()),
        "fuseElementNotification": localize('achievementNotificationFuseElement', getLanguage()),
        "gain100CashNotification": localize('achievementNotificationGain100Cash', getLanguage()),
        "gain10000CashNotification": localize('achievementNotificationGain10000Cash', getLanguage()),
        "gain100000CashNotification": localize('achievementNotificationGain100000Cash', getLanguage()),
        "gain1000000CashNotification": localize('achievementNotificationGain1000000Cash', getLanguage()),
        "buildPowerPlantNotification": localize('achievementNotificationBuildPowerPlant', getLanguage()),
        "tripPowerNotification": localize('achievementNotificationTripPower', getLanguage()),
        "buildSolarPowerPlantNotification": localize('achievementNotificationBuildSolarPowerPlant', getLanguage()),
        "collect100PrecipitationNotification": localize('achievementNotificationCollect100Precipitation', getLanguage()),
        "unlockCompoundsNotification": localize('achievementNotificationUnlockCompounds', getLanguage()),
        "createSteelNotification": localize('achievementNotificationCreateSteel', getLanguage()),
        "createTitaniumNotification": localize('achievementNotificationCreateTitanium', getLanguage()),
        "discoverAsteroidNotification": localize('achievementNotificationDiscoverAsteroid', getLanguage()),
        "launchRocketNotification": localize('achievementNotificationLaunchRocket', getLanguage()),
        "mineAllAntimatterAsteroidNotification": localize('achievementNotificationMineAllAntimatterAsteroid', getLanguage()),
        "studyStarNotification": localize('achievementNotificationStudyStar', getLanguage()),
        "studyStarMoreThan5LYAwayNotification": localize('achievementNotificationStudyStarMoreThan5LYAway', getLanguage()),
        "studyStarMoreThan20LYAwayNotification": localize('achievementNotificationStudyStarMoreThan20LYAway', getLanguage()),
        "launchStarshipNotification": localize('achievementNotificationLaunchStarship', getLanguage()),
        "initiateDiplomacyWithAlienRaceNotification": localize('achievementNotificationInitiateDiplomacyWithAlienRace', getLanguage()),
        "bullyEnemyIntoSubmissionNotification": localize('achievementNotificationBullyEnemyIntoSubmission', getLanguage()),
        "vassalizeEnemyNotification": localize('achievementNotificationVassalizeEnemy', getLanguage()),
        "conquerEnemyNotification": localize('achievementNotificationConquerEnemy', getLanguage()),
        "conquerHiveMindEnemyNotification": localize('achievementNotificationConquerHiveMindEnemy', getLanguage()),
        "conquerBelligerentEnemyNotification": localize('achievementNotificationConquerBelligerentEnemy', getLanguage()), 
        "conquerEnemyWithoutScanningNotification": localize('achievementNotificationConquerEnemyWithoutScanning', getLanguage()),
        "settleUnoccupiedSystemNotification": localize('achievementNotificationSettleUnoccupiedSystem', getLanguage()),
        "discoverSystemWithNoLifeNotification": localize('achievementNotificationDiscoverSystemWithNoLife', getLanguage()),
        "settleSystemNotification": localize('achievementNotificationSettleSystem', getLanguage()),
        "spendAPNotification": localize('achievementNotificationSpendAP', getLanguage()),
        "performGalacticMarketTransactionNotification": localize('achievementNotificationPerformGalacticMarketTransaction', getLanguage()),
        "liquidateAllAssetsNotification": localize('achievementNotificationLiquidateAllAssets', getLanguage()),
        "rebirthNotification": localize('achievementNotificationRebirth', getLanguage()),
        "conquer10StarSystemsNotification": localize('achievementNotificationConquer10StarSystems', getLanguage()),
        "conquer50StarSystemsNotification": localize('achievementNotificationConquer50StarSystems', getLanguage()),
        "seeAllNewsTickersNotification": localize('achievementNotificationSeeAllNewsTickers', getLanguage()),
        "activateAllWackyNewsTickersNotification": localize('achievementNotificationActivateAllWackyNewsTickers', getLanguage()),
        "collect100TitaniumAsPrecipitationNotification": localize('achievementNotificationCollect100TitaniumAsPrecipitation', getLanguage()),
        "discoverLegendaryAsteroidNotification": localize('achievementNotificationDiscoverLegendaryAsteroid', getLanguage()),
        "have4RocketsMiningAntimatterNotification": localize('achievementNotificationHave4RocketsMiningAntimatter', getLanguage()),
        "studyAllStarsInOneRunNotification": localize('achievementNotificationStudyAllStarsInOneRun', getLanguage()),
        "trade10APForCashNotification": localize('achievementNotificationTrade10APForCash', getLanguage()),
        "have50HoursWithOnePioneerNotification": localize('achievementNotificationHave50HoursWithOnePioneer', getLanguage()),
        "adoptPhilosophyNotification": localize('achievementNotificationAdoptPhilosophy', getLanguage()),
        "discoverBlackHoleNotification": localize('achievementNotificationDiscoverBlackHole', getLanguage()),
        "activateBlackHoleOver10xNotification": localize('achievementNotificationActivateBlackHoleOver10x', getLanguage()),
        "findAncientManuscriptNotification": localize('achievementNotificationFindAncientManuscript', getLanguage()),
        "conquerMegastructureSystemNotification": localize('achievementNotificationConquerMegastructureSystem', getLanguage()),
        "bringDownMiaplacideanForceFieldNotification": localize('achievementNotificationBringDownMiaplacideanForceField', getLanguage()),
        "completeGameNotification": localize('achievementNotificationCompleteGame', getLanguage()),
        "completeRunOnMiaplacidusNotification": localize('achievementNotificationCompleteRunOnMiaplacidus', getLanguage()),
        "haveFleetSizeOf50EachShipTypeNotification": localize('achievementNotificationHaveFleetSizeOf50EachShipType', getLanguage()),
        "tryAllThemesNotification": localize('achievementNotificationTryAllThemes', getLanguage()),
        "buyCasinoPointsNotification": localize('achievementNotificationBuyCasinoPoints', getLanguage()),
        "winAllCasinoGamesNotification": localize('achievementNotificationWinAllCasinoGames', getLanguage()),
        "winWheelSpecialPrizeNotification": localize('achievementNotificationWinWheelSpecialPrize', getLanguage()),
        "restoreNearSpaceScannerArrayNotification": localize('achievementNotificationRestoreNearSpaceScannerArray', getLanguage()),
        "findCosmicRipNotification": localize('achievementNotificationFindCosmicRip', getLanguage()),
        "gain1MTelemetryDataNotification": localize('achievementNotificationGain1MTelemetryData', getLanguage()),
        "closeCosmicRipNotification": localize('achievementNotificationCloseCosmicRip', getLanguage()),
        "suffer5NegativeEventsNotification": localize('achievementNotificationSuffer5NegativeEvents', getLanguage()),
        "enjoyEndlessSummerNotification": localize('achievementNotificationEnjoyEndlessSummer', getLanguage()),
        "completeOnboardingNotification": localize('achievementNotificationCompleteOnboarding', getLanguage()),
    };
    
    achievementTooltipDescriptions = generateAchievementTooltipDescriptions();
}

starNames = [
  ["Sirius", "A"], ["Canopus", "F"], ["Arcturus", "K"], ["Sadalmelik", "G"], ["Capella", "G"],
  ["Rigel", "B"], ["Procyon", "F"], ["Betelgeuse", "M"], ["Altair", "A"], ["Aldebaran", "K"],
  ["Sterope", "B"], ["Antares", "M"], ["Pollux", "K"], ["Fomalhaut", "A"], ["Deneb", "A"],
  ["Mimosa", "B"], ["Regulus", "O"], ["Adhara", "B"], ["Castor", "A"], ["Shaula", "B"],
  ["Bellatrix", "B"], ["Elnath", "B"], ["Miaplacidus", "A"], ["Alnilam", "B"], ["Alnair", "B"],
  ["Alioth", "A"], ["Alnitak", "K"], ["Dubhe", "K"], ["Mirfak", "F"], ["Wezen", "F"],
  ["Sargas", "F"], ["Kaus Australis", "B"], ["Avior", "K"], ["Alkaid", "B"], ["Menkalinan", "O"],
  ["Atria", "K"], ["Alhena", "A"], ["Peacock", "B"], ["Tureis", "B"], ["Nunki", "B"],
  ["Mirzam", "B"], ["Alphard", "K"], ["Rasalhague", "A"], ["Caph", "F"], ["Zubenelgenubi", "A"],
  ["Electra", "B"], ["Hamal", "K"], ["Mintaka", "O"], ["Alsephina", "A"], ["Menkent", "K"],
  ["Enif", "K"], ["Tiaki", "K"], ["Ascella", "A"], ["Algol", "B"], ["Markab", "B"],
  ["Suhail", "K"], ["Zeta Ophiuchi", "M"], ["Kochab", "K"], ["Ankaa", "K"], ["Denebola", "A"],
  ["Vega", "A"], ["Azelfafage", "F"], ["Maia", "B"], ["Arkab Prior", "A"], ["Thuban", "A"],
  ["Izar", "K"], ["Ruchbah", "A"], ["Albireo", "K"], ["Almaaz", "F"], ["Dschubba", "B"],
  ["Algieba", "K"], ["Gomeisa", "B"], ["Hoedus II", "G"], ["Cebalrai", "K"], ["Nashira", "F"],
  ["Muscida", "A"], ["Kitalpha", "F"], ["Hyadum I", "K"], ["Eltanin", "K"], ["Yildun", "A"],
  ["Biham", "A"], ["Zubeneschamali", "B"], ["Alpherg", "K"], ["Alcor", "A"], ["Polaris", "F"],
  ["Pleione", "B"], ["Spica", "B"], ["Chara", "G"], ["Sadachbia", "F"], ["Rasalgethi", "M"],
  ["Barnards Star", "M"], ["Saiph", "B"], ["Hassaleh", "K"], ["Furud", "F"], ["Atik", "F"],
  ["Sadalsuud", "G"], ["Propus", "M"], ["Botein", "K"], ["Acamar", "A"], ["Anser", "G"]
];

export function refreshAchievementTooltipDescriptions() {
    achievementTooltipDescriptions = generateAchievementTooltipDescriptions();
}

function generateAchievementTooltipDescriptions() {
    if (typeof achievementTooltipDescriptionTexts === 'undefined') {
        return {};
    }
    return {
        "collect50Hydrogen": `
        ${getAchievementTooltipDescriptionTexts('collect50Hydrogen')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: ${getCurrencySymbol()}10</span><br>
        <span class="${getAchievementDataObject('collect50Hydrogen', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('collect50Hydrogen', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('collect50Hydrogen', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('collect50Hydrogen', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "collect1000Hydrogen": `
        ${getAchievementTooltipDescriptionTexts('collect1000Hydrogen')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: ${getCurrencySymbol()}25</span><br>
        <span class="${getAchievementDataObject('collect1000Hydrogen', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('collect1000Hydrogen', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('collect1000Hydrogen', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('collect1000Hydrogen', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "collect5000Carbon": `
        ${getAchievementTooltipDescriptionTexts('collect5000Carbon')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: ${getCurrencySymbol()}150</span><br>
        <span class="${getAchievementDataObject('collect5000Carbon', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('collect5000Carbon', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('collect5000Carbon', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('collect5000Carbon', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "collect50000Iron": `
        ${getAchievementTooltipDescriptionTexts('collect50000Iron')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: ${getCurrencySymbol()}1800</span><br>
        <span class="${getAchievementDataObject('collect50000Iron', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('collect50000Iron', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('collect50000Iron', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('collect50000Iron', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "researchTechnology": `
        ${getAchievementTooltipDescriptionTexts('researchTechnology')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: ${getCurrencySymbol()}30</span><br>
        <span class="${getAchievementDataObject('researchTechnology', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('researchTechnology', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('researchTechnology', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('researchTechnology', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "researchAllTechnologies": `
        ${getAchievementTooltipDescriptionTexts('researchAllTechnologies')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: 1 AP</span><br>
        <span class="${getAchievementDataObject('researchAllTechnologies', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('researchAllTechnologies', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('researchAllTechnologies', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('researchAllTechnologies', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "achieve100FusionEfficiency": `
        ${getAchievementTooltipDescriptionTexts('achieve100FusionEfficiency')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: ${getCurrencySymbol()}500</span><br>
        <span class="${getAchievementDataObject('achieve100FusionEfficiency', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('achieve100FusionEfficiency', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('achieve100FusionEfficiency', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('achieve100FusionEfficiency', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "fuseElement": `
        ${getAchievementTooltipDescriptionTexts('fuseElement')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: ${getCurrencySymbol()}40</span><br>
        <span class="${getAchievementDataObject('fuseElement', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('fuseElement', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('fuseElement', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('fuseElement', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "gain100Cash": `
        ${getAchievementTooltipDescriptionTexts('gain100Cash')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: x1.1 all Cash Sales</span><br>
        <span class="${getAchievementDataObject('gain100Cash', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('gain100Cash', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('gain100Cash', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('gain100Cash', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "gain10000Cash": `
        ${getAchievementTooltipDescriptionTexts('gain10000Cash')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: x1.2 all Cash Sales</span><br>
        <span class="${getAchievementDataObject('gain10000Cash', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('gain10000Cash', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('gain10000Cash', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('gain10000Cash', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "gain100000Cash": `
        ${getAchievementTooltipDescriptionTexts('gain100000Cash')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: x1.2 all Cash Sales</span><br>
        <span class="${getAchievementDataObject('gain100000Cash', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('gain100000Cash', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('gain100000Cash', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('gain100000Cash', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "gain1000000Cash": `
        ${getAchievementTooltipDescriptionTexts('gain1000000Cash')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: x1.5 all Cash Sales</span><br>
        <span class="${getAchievementDataObject('gain1000000Cash', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('gain1000000Cash', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('gain1000000Cash', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('gain1000000Cash', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,    
        "buildPowerPlant": `
        ${getAchievementTooltipDescriptionTexts('buildPowerPlant')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: x1.1 all Resource Rates</span><br>
        <span class="${getAchievementDataObject('buildPowerPlant', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('buildPowerPlant', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('buildPowerPlant', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('buildPowerPlant', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "tripPower": `
        ${getAchievementTooltipDescriptionTexts('tripPower')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: x1.1 all Resource Rates</span><br>
        <span class="${getAchievementDataObject('tripPower', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('tripPower', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('tripPower', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('tripPower', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "buildSolarPowerPlant": `
        ${getAchievementTooltipDescriptionTexts('buildSolarPowerPlant')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: x1.2 all Resource Rates</span><br>
        <span class="${getAchievementDataObject('buildSolarPowerPlant', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('buildSolarPowerPlant', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('buildSolarPowerPlant', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('buildSolarPowerPlant', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "collect100Precipitation": `
        ${getAchievementTooltipDescriptionTexts('collect100Precipitation')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: ${getCurrencySymbol()}1000</span><br>
        <span class="${getAchievementDataObject('collect100Precipitation', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('collect100Precipitation', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('collect100Precipitation', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('collect100Precipitation', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "unlockCompounds": `
        ${getAchievementTooltipDescriptionTexts('unlockCompounds')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: ${getCurrencySymbol()}200</span><br>
        <span class="${getAchievementDataObject('unlockCompounds', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('unlockCompounds', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('unlockCompounds', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('unlockCompounds', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "createSteel": `
        ${getAchievementTooltipDescriptionTexts('createSteel')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: -20% Compound Creation Material Costs</span><br>
        <span class="${getAchievementDataObject('createSteel', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('createSteel', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('createSteel', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('createSteel', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "createTitanium": `
        ${getAchievementTooltipDescriptionTexts('createTitanium')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: -20% Compound Creation Material Costs</span><br>
        <span class="${getAchievementDataObject('createTitanium', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('createTitanium', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('createTitanium', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('createTitanium', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "discoverAsteroid": `
        ${getAchievementTooltipDescriptionTexts('discoverAsteroid')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: -5% Compound Creation Material Costs</span><br>
        <span class="${getAchievementDataObject('discoverAsteroid', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('discoverAsteroid', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('discoverAsteroid', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('discoverAsteroid', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "launchRocket": `
        ${getAchievementTooltipDescriptionTexts('launchRocket')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: x1.1 all Resource Rates</span><br>
        <span class="${getAchievementDataObject('launchRocket', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('launchRocket', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('launchRocket', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('launchRocket', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "mineAllAntimatterAsteroid": `
        ${getAchievementTooltipDescriptionTexts('mineAllAntimatterAsteroid')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: 150 Antimatter</span><br>
        <span class="${getAchievementDataObject('mineAllAntimatterAsteroid', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('mineAllAntimatterAsteroid', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('mineAllAntimatterAsteroid', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('mineAllAntimatterAsteroid', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "studyStar": `
        ${getAchievementTooltipDescriptionTexts('studyStar')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: -5% Compound Creation Material Costs</span><br>
        <span class="${getAchievementDataObject('studyStar', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('studyStar', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('studyStar', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('studyStar', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "studyStarMoreThan5LYAway": `
        ${getAchievementTooltipDescriptionTexts('studyStarMoreThan5LYAway')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: -10% Compound Creation Material Costs</span><br>
        <span class="${getAchievementDataObject('studyStarMoreThan5LYAway', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('studyStarMoreThan5LYAway', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('studyStarMoreThan5LYAway', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('studyStarMoreThan5LYAway', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "studyStarMoreThan20LYAway": `
        ${getAchievementTooltipDescriptionTexts('studyStarMoreThan20LYAway')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: -15% Compound Creation Material Costs</span><br>
        <span class="${getAchievementDataObject('studyStarMoreThan20LYAway', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('studyStarMoreThan20LYAway', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('studyStarMoreThan20LYAway', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('studyStarMoreThan20LYAway', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "launchStarship": `
        ${getAchievementTooltipDescriptionTexts('launchStarship')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: ${getCurrencySymbol()}10000</span><br>
        <span class="${getAchievementDataObject('launchStarship', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('launchStarship', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('launchStarship', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('launchStarship', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "initiateDiplomacyWithAlienRace": `
        ${getAchievementTooltipDescriptionTexts('initiateDiplomacyWithAlienRace')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: x1.1 all Resource Rates</span><br>
        <span class="${getAchievementDataObject('initiateDiplomacyWithAlienRace', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('initiateDiplomacyWithAlienRace', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('initiateDiplomacyWithAlienRace', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('initiateDiplomacyWithAlienRace', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "bullyEnemyIntoSubmission": `
        ${getAchievementTooltipDescriptionTexts('bullyEnemyIntoSubmission')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: 1 AP</span><br>
        <span class="${getAchievementDataObject('bullyEnemyIntoSubmission', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('bullyEnemyIntoSubmission', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('bullyEnemyIntoSubmission', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('bullyEnemyIntoSubmission', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "vassalizeEnemy": `
        ${getAchievementTooltipDescriptionTexts('vassalizeEnemy')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: 1 AP</span><br>
        <span class="${getAchievementDataObject('vassalizeEnemy', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('vassalizeEnemy', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('vassalizeEnemy', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('vassalizeEnemy', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "conquerEnemy": `
        ${getAchievementTooltipDescriptionTexts('conquerEnemy')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: 1 AP</span><br>
        <span class="${getAchievementDataObject('conquerEnemy', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('conquerEnemy', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('conquerEnemy', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('conquerEnemy', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "conquerHiveMindEnemy": `
        ${getAchievementTooltipDescriptionTexts('conquerHiveMindEnemy')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: 2 AP</span><br>
        <span class="${getAchievementDataObject('conquerHiveMindEnemy', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('conquerHiveMindEnemy', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('conquerHiveMindEnemy', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('conquerHiveMindEnemy', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "conquerBelligerentEnemy": `
        ${getAchievementTooltipDescriptionTexts('conquerBelligerentEnemy')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: 3 AP</span><br>
        <span class="${getAchievementDataObject('conquerBelligerentEnemy', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('conquerBelligerentEnemy', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('conquerBelligerentEnemy', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('conquerBelligerentEnemy', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "conquerEnemyWithoutScanning": `
        ${getAchievementTooltipDescriptionTexts('conquerEnemyWithoutScanning')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: 2 AP</span><br>
        <span class="${getAchievementDataObject('conquerEnemyWithoutScanning', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('conquerEnemyWithoutScanning', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('conquerEnemyWithoutScanning', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('conquerEnemyWithoutScanning', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "settleUnoccupiedSystem": `
        ${getAchievementTooltipDescriptionTexts('settleUnoccupiedSystem')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: ${getCurrencySymbol()}50000</span><br>
        <span class="${getAchievementDataObject('settleUnoccupiedSystem', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('settleUnoccupiedSystem', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('settleUnoccupiedSystem', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('settleUnoccupiedSystem', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "discoverSystemWithNoLife": `
        ${getAchievementTooltipDescriptionTexts('discoverSystemWithNoLife')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: ${getCurrencySymbol()}75000</span><br>
        <span class="${getAchievementDataObject('discoverSystemWithNoLife', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('discoverSystemWithNoLife', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('discoverSystemWithNoLife', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('discoverSystemWithNoLife', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "settleSystem": `
        ${getAchievementTooltipDescriptionTexts('settleSystem')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: Pride!</span><br>
        <span class="${getAchievementDataObject('settleSystem', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('settleSystem', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('settleSystem', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('settleSystem', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "spendAP": `
        ${getAchievementTooltipDescriptionTexts('spendAP')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: x1.1 all Resource Rates</span><br>
        <span class="${getAchievementDataObject('spendAP', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('spendAP', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('spendAP', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('spendAP', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "performGalacticMarketTransaction": `
        ${getAchievementTooltipDescriptionTexts('performGalacticMarketTransaction')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: 1 AP</span><br>
        <span class="${getAchievementDataObject('performGalacticMarketTransaction', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('performGalacticMarketTransaction', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('performGalacticMarketTransaction', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('performGalacticMarketTransaction', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "liquidateAllAssets": `
        ${getAchievementTooltipDescriptionTexts('liquidateAllAssets')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: Pride!</span><br>
        <span class="${getAchievementDataObject('liquidateAllAssets', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('liquidateAllAssets', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('liquidateAllAssets', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('liquidateAllAssets', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "rebirth": `
        ${getAchievementTooltipDescriptionTexts('rebirth')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: Permanent x1.3 all Resource Rates</span><br>
        <span class="${getAchievementDataObject('rebirth', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('rebirth', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('rebirth', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('rebirth', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "conquer10StarSystems": `
        ${getAchievementTooltipDescriptionTexts('conquer10StarSystems')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: 10 AP</span><br>
        <span class="${getAchievementDataObject('conquer10StarSystems', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('conquer10StarSystems', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('conquer10StarSystems', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('conquer10StarSystems', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "conquer50StarSystems": `
        ${getAchievementTooltipDescriptionTexts('conquer50StarSystems')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: 100 AP</span><br>
        <span class="${getAchievementDataObject('conquer50StarSystems', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('conquer50StarSystems', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('conquer50StarSystems', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('conquer50StarSystems', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "seeAllNewsTickers": `
        ${getAchievementTooltipDescriptionTexts('seeAllNewsTickers')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: Permanent x1.2 all Resource Rates</span><br>
        <span class="${getAchievementDataObject('seeAllNewsTickers', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('seeAllNewsTickers', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('seeAllNewsTickers', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('seeAllNewsTickers', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "activateAllWackyNewsTickers": `
        ${getAchievementTooltipDescriptionTexts('activateAllWackyNewsTickers')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: Permanent -20% Compound Creation Material Costs</span><br>
        <span class="${getAchievementDataObject('activateAllWackyNewsTickers', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('activateAllWackyNewsTickers', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('activateAllWackyNewsTickers', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('activateAllWackyNewsTickers', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "collect100TitaniumAsPrecipitation": `
        ${getAchievementTooltipDescriptionTexts('collect100TitaniumAsPrecipitation')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: 50AP</span><br>
        <span class="${getAchievementDataObject('collect100TitaniumAsPrecipitation', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('collect100TitaniumAsPrecipitation', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('collect100TitaniumAsPrecipitation', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('collect100TitaniumAsPrecipitation', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "discoverLegendaryAsteroid": `
        ${getAchievementTooltipDescriptionTexts('discoverLegendaryAsteroid')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: ${getCurrencySymbol()}75000</span><br>
        <span class="${getAchievementDataObject('discoverLegendaryAsteroid', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('discoverLegendaryAsteroid', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('discoverLegendaryAsteroid', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('discoverLegendaryAsteroid', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "have4RocketsMiningAntimatter": `
        ${getAchievementTooltipDescriptionTexts('have4RocketsMiningAntimatter')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: ${getCurrencySymbol()}100000</span><br>
        <span class="${getAchievementDataObject('have4RocketsMiningAntimatter', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('have4RocketsMiningAntimatter', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('have4RocketsMiningAntimatter', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('have4RocketsMiningAntimatter', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "studyAllStarsInOneRun": `
        ${getAchievementTooltipDescriptionTexts('studyAllStarsInOneRun')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: Pride!</span><br>
        <span class="${getAchievementDataObject('studyAllStarsInOneRun', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('studyAllStarsInOneRun', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('studyAllStarsInOneRun', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('studyAllStarsInOneRun', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "trade10APForCash": `
        ${getAchievementTooltipDescriptionTexts('trade10APForCash')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: 5 AP</span><br>
        <span class="${getAchievementDataObject('trade10APForCash', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('trade10APForCash', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('trade10APForCash', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('trade10APForCash', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "have50HoursWithOnePioneer": `
        ${getAchievementTooltipDescriptionTexts('have50HoursWithOnePioneer')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: 50 AP</span><br>
        <span class="green-ready-text">
        ${localize('logged', getLanguage())}: ${
            (() => {
                const ms = getGameActiveCountTime()[0];
                const totalSeconds = Math.floor(ms / 1000);
                const days = Math.floor(totalSeconds / 86400);
                const hours = Math.floor((totalSeconds % 86400) / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                return `${days}d ${hours}h ${minutes}m ${seconds}s`;
            })()
        }
        </span><br><br>
        <span class="${getAchievementDataObject('have50HoursWithOnePioneer', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('have50HoursWithOnePioneer', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `
        ,
        "adoptPhilosophy": `
        ${getAchievementTooltipDescriptionTexts('adoptPhilosophy')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: Pride!</span><br>
        <span class="${getAchievementDataObject('adoptPhilosophy', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('adoptPhilosophy', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('adoptPhilosophy', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('adoptPhilosophy', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "discoverBlackHole": `
        ${getAchievementTooltipDescriptionTexts('discoverBlackHole')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: ${getCurrencySymbol()}1000000</span><br>
        <span class="${getAchievementDataObject('discoverBlackHole', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('discoverBlackHole', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('discoverBlackHole', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('discoverBlackHole', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "activateBlackHoleOver10x": `
        ${getAchievementTooltipDescriptionTexts('activateBlackHoleOver10x')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: x2 all Resource quantities (capped at storage)</span><br>
        <span class="${getAchievementDataObject('activateBlackHoleOver10x', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('activateBlackHoleOver10x', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('activateBlackHoleOver10x', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('activateBlackHoleOver10x', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "findAncientManuscript": `
        ${getAchievementTooltipDescriptionTexts('findAncientManuscript')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: x2 all Compound quantities (capped at storage)</span><br>
        <span class="${getAchievementDataObject('findAncientManuscript', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('findAncientManuscript', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('findAncientManuscript', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('findAncientManuscript', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "conquerMegastructureSystem": `
        ${getAchievementTooltipDescriptionTexts('conquerMegastructureSystem')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: ${getCurrencySymbol()}1000000</span><br>
        <span class="${getAchievementDataObject('conquerMegastructureSystem', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('conquerMegastructureSystem', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('conquerMegastructureSystem', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('conquerMegastructureSystem', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "bringDownMiaplacideanForceField": `
        ${getAchievementTooltipDescriptionTexts('bringDownMiaplacideanForceField')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: 100 AP</span><br>
        <span class="${getAchievementDataObject('bringDownMiaplacideanForceField', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('bringDownMiaplacideanForceField', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('bringDownMiaplacideanForceField', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('bringDownMiaplacideanForceField', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "completeGame": `
        ${getAchievementTooltipDescriptionTexts('completeGame')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: Pride!</span><br>
        <span class="${getAchievementDataObject('completeGame', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('completeGame', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('completeGame', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('completeGame', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "completeRunOnMiaplacidus": `
        ${getAchievementTooltipDescriptionTexts('completeRunOnMiaplacidus')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: 1GP</span><br>
        <span class="${getAchievementDataObject('completeRunOnMiaplacidus', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('completeRunOnMiaplacidus', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('completeRunOnMiaplacidus', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('completeRunOnMiaplacidus', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "haveFleetSizeOf50EachShipType": `
        ${getAchievementTooltipDescriptionTexts('haveFleetSizeOf50EachShipType')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: 1000000 Titanium (capped at storage)</span><br>
        <span class="${getAchievementDataObject('haveFleetSizeOf50EachShipType', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('haveFleetSizeOf50EachShipType', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('haveFleetSizeOf50EachShipType', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('haveFleetSizeOf50EachShipType', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `
        ,
        "tryAllThemes": `
        ${getAchievementTooltipDescriptionTexts('tryAllThemes')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: Pride!</span><br>
        <span class="${getAchievementDataObject('tryAllThemes', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('tryAllThemes', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('tryAllThemes', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('tryAllThemes', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `
        ,
        "buyCasinoPoints": `
        ${getAchievementTooltipDescriptionTexts('buyCasinoPoints')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: Pride!</span><br>
        <span class="${getAchievementDataObject('buyCasinoPoints', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('buyCasinoPoints', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('buyCasinoPoints', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('buyCasinoPoints', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "winAllCasinoGames": `
        ${getAchievementTooltipDescriptionTexts('winAllCasinoGames')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: 1GP</span><br>
        <span class="${getAchievementDataObject('winAllCasinoGames', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('winAllCasinoGames', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('winAllCasinoGames', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('winAllCasinoGames', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "winWheelSpecialPrize": `
        ${getAchievementTooltipDescriptionTexts('winWheelSpecialPrize')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: Pride!</span><br>
        <span class="${getAchievementDataObject('winWheelSpecialPrize', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('winWheelSpecialPrize', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('winWheelSpecialPrize', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('winWheelSpecialPrize', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "restoreNearSpaceScannerArray": `
        ${getAchievementTooltipDescriptionTexts('restoreNearSpaceScannerArray')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: Pride!</span><br>
        <span class="${getAchievementDataObject('restoreNearSpaceScannerArray', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('restoreNearSpaceScannerArray', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('restoreNearSpaceScannerArray', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('restoreNearSpaceScannerArray', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "findCosmicRip": `
        ${getAchievementTooltipDescriptionTexts('findCosmicRip')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: Pride!</span><br>
        <span class="${getAchievementDataObject('findCosmicRip', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('findCosmicRip', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('findCosmicRip', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('findCosmicRip', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "gain1MTelemetryData": `
        ${getAchievementTooltipDescriptionTexts('gain1MTelemetryData')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: Pride!</span><br>
        <span class="${getAchievementDataObject('gain1MTelemetryData', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('gain1MTelemetryData', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('gain1MTelemetryData', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('gain1MTelemetryData', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "closeCosmicRip": `
        ${getAchievementTooltipDescriptionTexts('closeCosmicRip')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: Pride!</span><br>
        <span class="${getAchievementDataObject('closeCosmicRip', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('closeCosmicRip', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('closeCosmicRip', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('closeCosmicRip', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "suffer5NegativeEvents": `
        ${getAchievementTooltipDescriptionTexts('suffer5NegativeEvents')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: Pride!</span><br>
        <span class="${getAchievementDataObject('suffer5NegativeEvents', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('suffer5NegativeEvents', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('suffer5NegativeEvents', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('suffer5NegativeEvents', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "enjoyEndlessSummer": `
        ${getAchievementTooltipDescriptionTexts('enjoyEndlessSummer')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: Pride!</span><br>
        <span class="${getAchievementDataObject('enjoyEndlessSummer', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('enjoyEndlessSummer', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('enjoyEndlessSummer', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('enjoyEndlessSummer', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `,
        "completeOnboarding": `
        ${getAchievementTooltipDescriptionTexts('completeOnboarding')}<br>
        <span class="green-ready-text">${localize('reward', getLanguage())}: Pride!</span><br>
        <span class="${getAchievementDataObject('completeOnboarding', ['resetOnRebirth']) ? 'green-ready-text' : ''}">
            ${localize('resetOnRebirth', getLanguage())}: ${getAchievementDataObject('completeOnboarding', ['resetOnRebirth']) ? localize('yes', getLanguage()) : localize('no', getLanguage())}
        </span><br><br>
        <span class="${getAchievementDataObject('completeOnboarding', ['active']) ? 'green-ready-text' : ''}">
            ${localize('status', getLanguage())}: ${getAchievementDataObject('completeOnboarding', ['active']) ? localize('achieved', getLanguage()) : localize('notAchieved', getLanguage())}
        </span>
        `
    };    
}

export function getMegaStructureTableText() {
    return {
        nameDysonSphere: localize('megaStructureTTNameDysonSphere', getLanguage()),
        researchDysonSphere1: localize('megaStructureTTResearchDysonSphere1', getLanguage()),
        researchDysonSphere2: localize('megaStructureTTResearchDysonSphere2', getLanguage()),
        researchDysonSphere3: localize('megaStructureTTResearchDysonSphere3', getLanguage()),
        researchDysonSphere4: localize('megaStructureTTResearchDysonSphere4', getLanguage()),
        researchDysonSphere5: localize('megaStructureTTResearchDysonSphere5', getLanguage()),
        effectDysonSphere1: localize('megaStructureTTEffectDysonSphere1', getLanguage()),
        effectDysonSphere2: localize('megaStructureTTEffectDysonSphere2', getLanguage()),
        effectDysonSphere3: localize('megaStructureTTEffectDysonSphere3', getLanguage()),
        effectDysonSphere4: localize('megaStructureTTEffectDysonSphere4', getLanguage()),
        effectDysonSphere5: localize('megaStructureTTEffectDysonSphere5', getLanguage()),

        nameCelestialProcessingCore: localize('megaStructureTTNameCelestialProcessingCore', getLanguage()),
        researchCelestialProcessingCore1: localize('megaStructureTTResearchCelestialProcessingCore1', getLanguage()),
        researchCelestialProcessingCore2: localize('megaStructureTTResearchCelestialProcessingCore2', getLanguage()),
        researchCelestialProcessingCore3: localize('megaStructureTTResearchCelestialProcessingCore3', getLanguage()),
        researchCelestialProcessingCore4: localize('megaStructureTTResearchCelestialProcessingCore4', getLanguage()),
        researchCelestialProcessingCore5: localize('megaStructureTTResearchCelestialProcessingCore5', getLanguage()),
        effectCelestialProcessingCore1: localize('megaStructureTTEffectCelestialProcessingCore1', getLanguage()),
        effectCelestialProcessingCore2: localize('megaStructureTTEffectCelestialProcessingCore2', getLanguage()),
        effectCelestialProcessingCore3: localize('megaStructureTTEffectCelestialProcessingCore3', getLanguage()),
        effectCelestialProcessingCore4: localize('megaStructureTTEffectCelestialProcessingCore4', getLanguage()),
        effectCelestialProcessingCore5: localize('megaStructureTTEffectCelestialProcessingCore5', getLanguage()),

        namePlasmaForge: localize('megaStructureTTNamePlasmaForge', getLanguage()),
        researchPlasmaForge1: localize('megaStructureTTResearchPlasmaForge1', getLanguage()),
        researchPlasmaForge2: localize('megaStructureTTResearchPlasmaForge2', getLanguage()),
        researchPlasmaForge3: localize('megaStructureTTResearchPlasmaForge3', getLanguage()),
        researchPlasmaForge4: localize('megaStructureTTResearchPlasmaForge4', getLanguage()),
        researchPlasmaForge5: localize('megaStructureTTResearchPlasmaForge5', getLanguage()),
        effectPlasmaForge1: localize('megaStructureTTEffectPlasmaForge1', getLanguage()),
        effectPlasmaForge2: localize('megaStructureTTEffectPlasmaForge2', getLanguage()),
        effectPlasmaForge3: localize('megaStructureTTEffectPlasmaForge3', getLanguage()),
        effectPlasmaForge4: localize('megaStructureTTEffectPlasmaForge4', getLanguage()),
        effectPlasmaForge5: localize('megaStructureTTEffectPlasmaForge5', getLanguage()),

        nameGalacticMemoryArchive: localize('megaStructureTTNameGalacticMemoryArchive', getLanguage()),
        researchGalacticMemoryArchive1: localize('megaStructureTTResearchGalacticMemoryArchive1', getLanguage()),
        researchGalacticMemoryArchive2: localize('megaStructureTTResearchGalacticMemoryArchive2', getLanguage()),
        researchGalacticMemoryArchive3: localize('megaStructureTTResearchGalacticMemoryArchive3', getLanguage()),
        researchGalacticMemoryArchive4: localize('megaStructureTTResearchGalacticMemoryArchive4', getLanguage()),
        researchGalacticMemoryArchive5: localize('megaStructureTTResearchGalacticMemoryArchive5', getLanguage()),
        effectGalacticMemoryArchive1: localize('megaStructureTTEffectGalacticMemoryArchive1', getLanguage()),
        effectGalacticMemoryArchive2: localize('megaStructureTTEffectGalacticMemoryArchive2', getLanguage()),
        effectGalacticMemoryArchive3: localize('megaStructureTTEffectGalacticMemoryArchive3', getLanguage()),
        effectGalacticMemoryArchive4: localize('megaStructureTTEffectGalacticMemoryArchive4', getLanguage()),
        effectGalacticMemoryArchive5: localize('megaStructureTTEffectGalacticMemoryArchive5', getLanguage()),
    };
}

export function getAchievementTooltipDescriptionTexts(achievementKey) {
    if (typeof achievementTooltipDescriptionTexts === 'undefined') {
        return undefined;
    }
    const tooltipDescriptionText = achievementTooltipDescriptionTexts[achievementKey];
    
    if (tooltipDescriptionText) {
        return tooltipDescriptionText;
    } else {
        console.warn(`Tooltip description not found for achievement key: ${achievementKey}`);
        return undefined;
    }
}

export function getAchievementTooltipDescription(achievementKey) {
    const tooltipDescription = achievementTooltipDescriptions[achievementKey];
    
    if (tooltipDescription) {
        return tooltipDescription;
    } else {
        console.warn(`Tooltip description not found for achievement key: ${achievementKey}`);
        return undefined;
    }
}

export function getAchievementNotification(achievementKey) {
    const notification = achievementNotifications[achievementKey];
    
    if (notification) {
        return notification;
    } else {
        console.warn(`Notification not found for achievement key: ${achievementKey}`);
        return undefined;
    }
}

export function getOptionDescription(key1) {
    return optionDescriptions[key1];
}

export function setOptionDescription(key1, value) {
    if (!optionDescriptions[key1]) {
        optionDescriptions[key1] = {};
    }
    Object.assign(optionDescriptions[key1], value);
}

export function getHeaderDescriptions(key) {
    return headerDescriptions[key];
}

export function setHeaderDescriptions(key, value) {
    headerDescriptions[key] = value.toLowerCase();
}

export function getRocketNames(key) {
    return rocketNames[key];
}

export function setRocketNames(key, value) {
    rocketNames[key] = value.toLowerCase();
}

export function replaceRocketNames(value) {
    rocketNames = value;
}

export function getStarNames() {
    return starNames.map((entry) => entry?.[0]).filter(Boolean);
}

export function getStarTypeByName(name) {
    const normalized = String(name ?? '').trim().toLowerCase();
    if (!normalized) {
        return 'A';
    }

    const match = starNames.find((entry) => String(entry?.[0] ?? '').toLowerCase() === normalized);
    return match?.[1] ?? 'A';
}

export function getNewsTickerContent() {
    return newsTickerContent;
}

export function getHelpContent(section, type) {
    const currentSection = helpContent[section];

    if (type === 'subHeadings') {
        return Object.keys(currentSection)
            .filter(key => key.startsWith('subHeading'))
            .map(key => currentSection[key]);
    } else if (type === 'subBodys') {
        return Object.keys(currentSection)
            .filter(key => key.startsWith('subBody'))
            .map(key => currentSection[key]);
    }

    return [];
}

export function getStatKeyFromLocalizedName(localizedName) {
    if (!statisticsContent) return null;
    
    const resourceKeys = ['hydrogen', 'helium', 'carbon', 'neon', 'oxygen', 'sodium', 'silicon', 'iron'];
    const compoundKeys = ['diesel', 'glass', 'steel', 'concrete', 'water', 'titanium'];
    const researchKeys = ['researchPoints', 'scienceKits', 'scienceClubs', 'scienceLabs', 'techsUnlocked'];
    const energyKeys = ['power', 'totalEnergy', 'totalProduction', 'totalConsumption', 'totalBatteryStorage', 'timesTripped', 'basicPowerPlants', 'advancedPowerPlants', 'solarPowerPlants', 'sodiumIonBatteries', 'battery2', 'battery3'];
    const spaceMiningKeys = ['spaceTelescopeBuilt', 'launchPadBuilt', 'rocketsBuilt', 'asteroidsDiscovered', 'asteroidsMined'];
    const interstellarKeys = ['starStudyRange', 'starShipBuilt', 'starShipDistanceTravelled', 'systemScanned', 'fleetAttackStrength', 'envoy', 'scout', 'marauder', 'landStalker', 'navalStrafer', 'enemy', 'enemyTotalDefenceOvercome', 'enemyTotalDefenceRemaining', 'apFromStarVoyage', 'blackHoleDiscovered', 'blackHoleAlwaysActive', 'blackHoleStrength'];
    const casinoKeys = ['casinoPointsSpent', 'doubleOrNothingPlayed', 'doubleOrNothingWon', 'wheelOfFortunePlayed', 'wheelOfFortuneWon', 'wheelSpecialWon', 'higherLowerPlayed', 'higherLowerWon', 'voidSeerPlayed', 'voidSeerWon'];
    const cosmicRipKeys = ['galacticPointsEarned', 'galacticPointsSpent', 'ripTelemetryDataGained', 'cosmicRipChapterUnlock', 'nearSpaceScannerArrayRestored', 'cosmicRipLocated', 'cosmicRipStabilised'];
    const overviewKeys = ['timePlayed', 'pioneer', 'currentAp', 'apGain', 'run', 'uniqueNewsTickersSeen', 'newsTickerPrizesCollected', 'theme', 'antimatterMined', 'totalAsteroidsDiscovered', 'legendaryAsteroidsDiscovered', 'rocketsLaunched', 'starShipsLaunched'];
    const runKeys = ['runTime', 'starSystem', 'currentWeather', 'cash', 'apAnticipated', 'antimatter'];
    const eventsKeys = ['powerPlantExplosion', 'batteryExplosion', 'scienceTheft', 'researchBreakthrough', 'rocketInstantArrival', 'starshipLostInSpace', 'antimatterReaction', 'stockLoss', 'galacticMarketLockdown', 'endlessSummer', 'minerBrokeDown', 'supplyChainDisruption', 'blackHoleInstability'];
    
    const allSections = {
        'resources': resourceKeys,
        'compounds': compoundKeys,
        'research': researchKeys,
        'energy': energyKeys,
        'spaceMining': spaceMiningKeys,
        'interstellar': interstellarKeys,
        'galactic Casino': casinoKeys,
        'cosmic Rip Chapter': cosmicRipKeys,
        'overview': overviewKeys,
        'run': runKeys,
        'events': eventsKeys
    };
    
    const normalizedName = localizedName.trim().toLowerCase();
    
    for (const [section, keys] of Object.entries(allSections)) {
        const sectionData = statisticsContent[section];
        if (!sectionData) continue;
        
        for (let i = 1; i <= keys.length; i++) {
            const subHeadingKey = `subHeading${i}`;
            const subHeadingValue = sectionData[subHeadingKey];
            
            if (subHeadingValue && subHeadingValue.trim().toLowerCase() === normalizedName) {
                return keys[i - 1];
            }
        }
    }
    
    return null;
}

export function getStatisticsContent(type) {
    if (!statisticsContent) {
        return [];
    }
    
    const mainHeadings = Object.keys(statisticsContent);

    if (type === 'mainHeadings') {
        return mainHeadings;
    }

    if (type === 'subHeadings' || type === 'subBodys') {
        let subSections = [];

        mainHeadings.forEach(mainHeading => {
            const subSectionsForMainHeading = statisticsContent[mainHeading];
            let subSectionArray = [];
            
            for (let i = 1; i <= Object.keys(subSectionsForMainHeading).length / 2; i++) {
                const subHeading = subSectionsForMainHeading[`subHeading${i}`] || '';
                const subBody = subSectionsForMainHeading[`subBody${i}`] || '';
                if (type === 'subHeadings') {
                    subSectionArray.push(subHeading);
                } else if (type === 'subBodys') {
                    subSectionArray.push(subBody);
                }
            }
            subSections.push(subSectionArray);
        });
        return subSections;
    }
    return [];
}
