import {
    setSuppressUiClickSfx,
    setFirstAccessArray,
    setCurrentOptionPane,
    setLastScreenOpenRegister,
    getLastScreenOpenRegister,
    getStarShipDestinationReminderVisible,
    setStarShipDestinationReminderVisible,
    setMegaStructureTabUnlocked,
    getMegaStructureTabUnlocked,
    getMegaStructureTabNotificationShown,
    setMegaStructureTabNotificationShown,
    getHasVisitedMegaStructure,
    setHasVisitedMegaStructure,
    getManuscriptCluesShown,
    getAsteroidCostMultiplier,
    getMegaStructureAntimatterAmount,
    setMegaStructureAntimatterAmount,
    setPermanentAntimatterUnlock,
    getPermanentAntimatterUnlock,
    setStorageAdderBonus,
    getStorageAdderBonus,
    setMegaStructureResourceBonus,
    getMegaStructureResourceBonus,
    getInfinitePower,
    setInfinitePower,
    getMegaStructureTechsResearched,
    setMegaStructureTechsResearched,
    getMiaplacidusMilestoneLevel,
    setMiaplacidusMilestoneLevel,
    setCurrentRunIsMegaStructureRun,
    getCurrentRunIsMegaStructureRun,
    getMegaStructuresInPossessionArray,
    setMegaStructuresInPossessionArray,
    getFactoryStarsArray,
    setFactoryStarsArray,
    NUMBER_OF_STARS, 
    STAR_FIELD_SEED,
    activateFactoryStar,
    factoryStarMap,
    getMaxAncientManuscripts,
    setStarsWithAncientManuscripts,
    getStarsWithAncientManuscripts,
    setPlayerPhilosophy,
    getPillageVoidTimerCanContinue,
    setPillageVoidTimerCanContinue,
    getCurrentlyPillagingVoid,
    setCurrentlyPillagingVoid,
    getCurrentPillageVoidTimerDurationTotal,
    setCurrentPillageVoidTimerDurationTotal,
    getTimeLeftUntilPillageVoidTimerFinishes,
    setTimeLeftUntilPillageVoidTimerFinishes,
    getAdditionalSystemsToSettleThisRun,
    setAdditionalSystemsToSettleThisRun,
    getCompoundCreateDropdownRecipeText,
    setCompoundCreateDropdownRecipeText,
    setBaseInvestigateStarTimerDuration,
    getInitialImpression,
    getAllRepeatableTechMultipliersObject,
    getPlayerPhilosophy,
    setUserPlatform,
    setGameActiveCountTime,
    getGameActiveCountTime,
    getUnlockedCompoundsArray,
    getCollectedPrecipitationQuantityThisRun,
    setCollectedPrecipitationQuantityThisRun,
    setBelligerentEnemyFlag,
    setAchievementFlagArray,
    getLiquidatedThisRun,
    setLiquidatedThisRun,
    getCashLiquidationModifier,
    getApLiquidationQuantity,
    setApLiquidationQuantity,
    setLiquidationValue,
    getApBaseBuyPrice,
    getApBuyPrice,
    setApBuyPrice,
    getApBaseSellPrice,
    getApSellForCashPrice,
    setApSellForCashPrice,
    setHasClickedOutgoingOptionGalacticMarket,
    getHasClickedOutgoingOptionGalacticMarket,
    setSettledStars,
    resetAllVariablesOnRebirth,
    getRebirthPossible,
    setRebirthPossible,
    setApAwardedThisRun,
    getApAwardedThisRun,
    getAutoSaveToggle,
    setAutoSaveToggle,
    setBattleUnits,
    getBattleTriggeredByPlayer,
    getInFormation,
    setInFormation,
    getRedrawBattleDescription,
    setRedrawBattleDescription,
    getNeedNewBattleCanvas,
    setNeedNewBattleCanvas,
    getBattleOngoing,
    setBattleOngoing,
    getFleetChangedSinceLastDiplomacy,
    setFleetChangedSinceLastDiplomacy,
    setDiplomacyPossible,
    getDiplomacyPossible,
    getGameStartTime,
    getRunStartTime,
    setGameStartTime,
    setRunStartTime,
    statFunctionsGets,
    statFunctionsSets,
    getStellarScannerRange,
    getDestinationStarScanned,
    setStellarScannerBuilt,
    getStellarScannerBuilt,
    setStarShipStatus,
    getStarShipStatus,
    getStarShipTravelSpeed,
    getStarTravelDuration,
    setStarTravelDuration,
    getStarShipTravelling,
    setStarShipTravelling,
    setStarShipBuilt,
    getAscendencyPoints,
    setAscendencyPoints,
    getRocketUserName,
    getCanFuelRockets,
    setRocketDirection,
    getRocketDirection,
    getBoostRate,
    getIsAntimatterBoostActive,
    setIsAntimatterBoostActive,
    getNormalMaxAntimatterRate,
    changeAsteroidArray,
    setAntimatterUnlocked,
    getAntimatterUnlocked,
    setMiningObject,
    getMiningObject,
    setTimeLeftUntilTravelToDestinationStarTimerFinishes,
    getTimeLeftUntilTravelToDestinationStarTimerFinishes,
    setTimeLeftUntilRocketTravelToAsteroidTimerFinishes,
    getTimeLeftUntilRocketTravelToAsteroidTimerFinishes,
    getRocketTravelSpeed,
    getDestinationAsteroid,
    setDestinationAsteroid,
    getRocketTravelDuration,
    setRocketTravelDuration,
    setRocketReadyToTravel,
    getRocketReadyToTravel,
    getCurrentlyTravellingToAsteroid,
    setCurrentlyTravellingToAsteroid,
    setAsteroidTimerCanContinue,
    getAsteroidTimerCanContinue,
    setStarInvestigationTimerCanContinue,
    getStarInvestigationTimerCanContinue,
    getAsteroidArray,
    setAsteroidArray,
    getGameCostMultiplier,
    setCurrentAsteroidSearchTimerDurationTotal,
    getCurrentAsteroidSearchTimerDurationTotal,
    getCurrentInvestigateStarTimerDurationTotal,
    setCurrentInvestigateStarTimerDurationTotal,
    getTelescopeReadyToSearch,
    setTelescopeReadyToSearch,
    setTimeLeftUntilAsteroidScannerTimerFinishes,
    getTimeLeftUntilAsteroidScannerTimerFinishes,
    getTimeLeftUntilStarInvestigationTimerFinishes,
    setTimeLeftUntilStarInvestigationTimerFinishes,
    setCurrentlySearchingAsteroid,
    getCurrentlySearchingAsteroid,
    setCurrentlyInvestigatingStar,
    getCurrentlyInvestigatingStar,
    setBaseSearchAsteroidTimerDuration,
    getBaseSearchAsteroidTimerDuration,
    setLaunchedRockets,
    getLaunchedRockets,
    setWeatherEfficiencyApplied,
    getWeatherEfficiencyApplied,
    getCheckRocketFuellingStatus,
    setCheckRocketFuellingStatus,
    getRocketsFuellerStartedArray,
    setRocketsFuellerStartedArray,
    setStarShipModulesBuilt,
    setRocketsBuilt,
    getRocketsBuilt,
    getWeatherEffectOn,
    setWeatherEffectOn,
    getSaveExportCloudFlag,
    setSaveExportCloudFlag,
    getSaveData,
    getNewsTickerSetting,
    getWeatherEffectSetting,
    setUpcomingTechArray,
    getUpcomingTechArray,
    getSavedYetSinceOpeningSaveDialogue,
    setSavedYetSinceOpeningSaveDialogue,
    getLastSavedTimeStamp,
    setCurrentPrecipitationRate,
    getCurrentPrecipitationRate,
    getCurrentStarSystemWeatherEfficiency,
    setCurrentStarSystemWeatherEfficiency,
    getCurrentStarSystem,
    setCurrentStarSystem,
    getTrippedStatus,
    setRanOutOfFuelWhenOn,
    getRanOutOfFuelWhenOn,
    setBuildingTypeOnOff,
    getBuildingTypeOnOff,
    setActivatedFuelBurnObject,
    getActivatedFuelBurnObject,
    setConstituentPartsObject,
    getConstituentPartsObject,
    setPowerOnOff,
    getPowerOnOff,
    setTotalEnergyUse,
    getTotalEnergyUse,
    getBuildingTypes,
    getTechRenderCounter,
    setTechRenderCounter,
    setTechRenderChange,
    getTechRenderChange,
    setTempRowValue,
    getTempRowValue,
    deferredActions,
    getCanAffordDeferred,
    setCanAffordDeferred,
    getTemporaryCoreTechRowsRepo,
    setTemporaryCoreTechRowsRepo,
    setOriginalFrameNumbers,
    getOriginalFrameNumbers,
    getUnlockedResourcesArray,
    setUnlockedResourcesArray,
    setRevealedTechArray,
    getTimerUpdateInterval,
    getTimerRateRatio,
    getPowerGracePeriodEnd,
    isPowerGracePeriodActive,
    setPowerGracePeriodEnd,
    getAntimatterDeltaAccumulator,
    setAntimatterDeltaAccumulator,
    setSaleResourcePreview,
    setCreateCompoundPreview,
    getCurrencySymbol,
    setSaleCompoundPreview,
    getItemsToIncreasePrice,
    setItemsToIncreasePrice,
    getItemsToDeduct,
    setItemsToDeduct,
    getCurrentOptionPane,
    getIncreaseStorageFactor,
    setGameStateVariable,  
    getGameVisibleActive, 
    getElements, 
    gameState, 
    getCurrentTab,
    getRevealedTechArray,
    getTechUnlockedArray,
    getResourceSalePreview,
    getCompoundSalePreview,
    getCompoundCreatePreview,
    getNotationType,
    getTechTreeDataAndDraw,
    getSaveName,
    setHasAntimatterSvgRightBoxDataChanged,
    getCanTravelToAsteroids,
    getCurrentDestinationDropdownText,
    getBaseInvestigateStarTimerDuration,
    getStarVisionIncrement,
    getStarVisionDistance,
    setStarVisionDistance,
    getStarShipBuilt,
    getDestinationStar,
    getHomeStarName,
    setStarShipArrowPosition,
    getStarShipArrowPosition,
    getCurrentStarObject,
    getOfflineGainsRate,
    getWarMode,
    getBattleUnits,
    setFormationGoal,
    setBattleTriggeredByPlayer,
    getWasAutoSaveToggled,
    getBattleResolved,
    setBattleResolved,
    setEnemyFleetsAdjustedForDiplomacy,
    setTechUnlockedArray,
    getStatRun,
    populateVariableDebugger,
    setLastSavedTimeStamp,
    getGalacticMarketOutgoingStockType, 
    setGalacticMarketIncomingStockType, 
    getGalacticMarketIncomingStockType, 
    setGalacticMarketOutgoingQuantitySelectionType, 
    getGalacticMarketOutgoingQuantitySelectionType, 
    getGalacticMarketSellApForCashQuantity, 
    getGalacticMarketLiquidationAuthorization,
    setGalacticMarketIncomingQuantity,
    getGalacticMarketIncomingQuantity,
    setCurrentGalacticMarketCommission,
    getCurrentGalacticMarketCommission,
    getBelligerentEnemyFlag,
    setPhilosophyAbilityActive,
    getPhilosophyAbilityActive,
    getRepeatableTechMultipliers,
    setPlayerStartingUnitHealth,
    getPlayerStartingUnitHealth,
    setInitialImpression,
    setRocketTravelSpeed,
    setStarShipTravelSpeed,
    getSettledStars,
    getBasePillageVoidTimerDuration,
    getInfinitePowerRate,
    getCurrentTheme
} from './constantsAndGlobalVars.js';

import {
    setGalacticMarketDataObject,
    getGalacticMarketDataObject,
    getStarSystemDataObject,
    setStarSystemDataObject,
    getAutoBuyerTierLevel,
    getResourceDataObject,
    setResourceDataObject,
    getStarSystemWeather,
    getRocketPartsNeededInTotalPerRocket,
    getStarShipPartsNeededInTotalPerModule,
    getMaxFleetShip,
    resetResourceDataObjectOnRebirthAndAddApAndPermanentBuffsBack,
    setupNewRunStarSystem,
    getAscendencyBuffDataObject,
    setAscendencyBuffDataObject,
    getBuffEfficientStorageData,
    getBuffSmartAutoBuyersData,
    getBuffJumpstartResearchData,
    getBuffOptimizedPowerGridsData,
    getBuffCompoundAutomationData,
    getBuffFasterAsteroidScanData,
    getBuffDeeperStarStudyData,
    getBuffAsteroidScannerBoostData,
    getBuffRocketFuelOptimizationData,
    getBuffEnhancedMiningData,
    getBuffQuantumEnginesData,
    setAchievementIconImageUrls,
    megaStructureImageUrls,
    miaplacidus 
} from "./resourceDataObject.js";

import { autoGrantAchievementsOnRebirth, checkForAchievements, resetAchievementsOnRebirth } from "./achievements.js";

import { 
    updateContent,
    sortTechRows,
    showNotification,
    showTabsUponUnlock,
    getTimeInStatCell,
    statToolBarCustomizations,
    updateDynamicUiContent,
    checkOrderOfTabs,
    showNewsTickerMessage,
    startWeatherEffect,
    stopWeatherEffect,
    switchBatteryStatBarWhenBatteryBought,
    setBatteryIndicator,
    drawAntimatterFlowDiagram,
    switchFuelGaugeWhenFuellerBought,
    showWeatherNotification,
    drawStarConnectionDrawings,
    spaceTravelButtonHideAndShowDescription,
    removeStarConnectionTooltip,
    removeOrbitCircle,
    drawOrbitCircle,
    drawStarShipArrowhead,
    getStats,
    updateTabHotkeys,
    showEnterWarModeModal,
    setWarUI,
    drawFleets,
    moveBattleUnits,
    explosionAnimation,
    shootLaser,
    showBattlePopup,
    resetTabsOnRebirth,
    resetTab1ClassesRebirth,
    resetTab2ClassesRebirth,
    resetTab4ClassesRebirth,
    resetTab5ClassesRebirth,
    resetTab6ClassesRebirth,
    updateAttentionIndicators,
    appendAttentionIndicator,
    getStarDataAndDistancesToAllStarsFromSettledStar,
    callPopupModal,
    showHideModal,
    removeModalButtonTooltips,
    generateStarfield
} from "./ui.js";

import {
    capitaliseString,
    capitaliseWordsWithRomanNumerals
 } from './utilityFunctions.js';

 import { modalCompoundMachiningTabUnlockHeader, modalCompoundMachiningTabUnlockText, modalPlayerLeaderPhilosophyHeaderText, modalPlayerLeaderPhilosophyContentText, modalPlayerLeaderIntroHeaderText, modalPlayerLeaderIntroContentText1, modalPlayerLeaderIntroContentText2, modalPlayerLeaderIntroContentText3, modalPlayerLeaderIntroContentText4, modalGalacticTabUnlockHeader, modalGalacticTabUnlockText, newsTickerContent, refreshAchievementTooltipDescriptions } from './descriptions.js';

 import { initializeAutoSave, saveGame } from './saveLoadGame.js';
 import { playClickSfx, sfxPlayer, weatherAmbienceManager, backgroundAudio } from './audioManager.js';
 import { timerManager } from './timerManager.js';
import { timerManagerDelta } from './timerManagerDelta.js';
 import { initialiseDescriptions, megaStructureTableText } from './descriptions.js';

 import { drawTab5Content } from './drawTab5Content.js';
import { handleTechnologyButtonClick } from './drawTab3Content.js';

function updateProductionRateText(elementId, rateValue) {
    if (!isFinite(rateValue)) {
        rateValue = 0;
    }

    const elements = getElements?.();
    const rateElement = elements?.[elementId] || document.getElementById(elementId);
    if (!rateElement) {
        return;
    }

    const formattedValue = formatProductionRateValue(rateValue);
    rateElement.textContent = `${formattedValue} / s`;

    rateElement.classList.remove('green-ready-text', 'red-disabled-text', 'warning-orange-text');
    if (rateValue > 0) {
        rateElement.classList.add('green-ready-text');
    } else if (rateValue < 0) {
        rateElement.classList.add('red-disabled-text');
    } else {
        rateElement.classList.add('warning-orange-text');
    }
}

export function formatProductionRateValue(rateValue) {
    const sign = rateValue < 0 ? '-' : '';
    const absValue = Math.abs(rateValue);

    if (absValue >= 1000) {
        return `${sign}${formatNumber(absValue)}`;
    }

    if (absValue >= 1) {
        return `${sign}${absValue.toFixed(1)}`;
    }

    return `${sign}${absValue.toFixed(2)}`;
}

//--------------------------------------------------------------------------------------------------------
export function startGame() {
    if (!getGameStartTime()) {
        setGameStartTime();
    }

    if (!getRunStartTime()) {
        setRunStartTime();
    }
    setLastSavedTimeStamp(getGameStartTime().toISOString);
    setGameState(getGameVisibleActive());
    updateContent('Resources', `tab1`, 'intro');
    updateTabHotkeys();
    initializeAutoSave();
    startInitialTimers();
    startNewsTickerTimer();
    if (getStatRun() === 1) {
        setTechUnlockedArray('run1');
    }
    setAchievementIconImageUrls();
    getNavigatorLanguage();
    gameLoop();
}

function initialiseAntimatterDeltaTimer() {
    const timerId = 'antimatterDeltaTimer';
    if (timerManagerDelta.hasTimer(timerId)) {
        return;
    }

    timerManagerDelta.addTimer(timerId, {
        durationMs: 0,
        repeat: true,
        onUpdate: ({ deltaMs }) => updateAntimatterDelta(deltaMs),
        metadata: { type: 'antimatter' }
    });
}

function updateAntimatterDelta(deltaMs) {
    if (!deltaMs || !getAntimatterUnlocked()) {
        return;
    }

    const accumulator = getAntimatterDeltaAccumulator() + deltaMs;
    const intervalMs = getTimerUpdateInterval();

    if (accumulator >= intervalMs) {
        const leftover = accumulator % intervalMs;
        setAntimatterDeltaAccumulator(leftover);
        updateAntimatterAndDiagram();
        return;
    }

    setAntimatterDeltaAccumulator(accumulator);
}

export function calculateElapsedActiveGameTime() {
    const gameStart = getGameStartTime();
    const totalInactiveTime = getGameActiveCountTime()[1];

    if (gameStart) {
        const now = Date.now();
        const elapsed = now - gameStart;
        const elapsedMinusOffline = elapsed - totalInactiveTime;
        setGameActiveCountTime(elapsedMinusOffline, null);
    }
}

function checkResearchAutoBuyerRowVisibility() {
    const researchAutoBuyerRow = document.getElementById('researchAutoBuyerRow');
    if (researchAutoBuyerRow) {
        const autoBuyerActive = !!getResourceDataObject('research', ['upgrades', 'autoBuyer', 'active']);
        researchAutoBuyerRow.classList.toggle('invisible', !autoBuyerActive);
    }
}

function handleResearchAutoBuyer() {
    const autoBuyerConfig = getResourceDataObject('research', ['upgrades', 'autoBuyer']);
    if (!autoBuyerConfig?.active || !autoBuyerConfig?.enabled) {
        return;
    }

    const techs = getResourceDataObject('techs');
    if (!techs) {
        return;
    }

    const unlockedTechs = getTechUnlockedArray();
    const currentResearchRaw = getResourceDataObject('research', ['quantity']);
    const currentResearch = typeof currentResearchRaw === 'number' ? currentResearchRaw : Number(currentResearchRaw) || 0;

    let cheapestTechName = null;
    let cheapestTechPrice = Infinity;

    Object.entries(techs).forEach(([techKey, techData]) => {
        if (techData?.special === 'megastructure') {
            return;
        }

        if (unlockedTechs.includes(techKey)) {
            return;
        }

        const techPrice = Number(techData?.price) || 0;
        if (techPrice <= 0 || currentResearch < techPrice) {
            return;
        }

        const prerequisites = Array.isArray(techData?.appearsAt)
            ? techData.appearsAt.slice(1).filter(prereq => prereq !== null && prereq !== '')
            : [];
        const prerequisitesMet = prerequisites.every(prereq => unlockedTechs.includes(prereq));

        if (!prerequisitesMet) {
            return;
        }

        if (techPrice < cheapestTechPrice) {
            cheapestTechPrice = techPrice;
            cheapestTechName = techKey;
        }
    });

    if (!cheapestTechName) {
        return;
    }

    handleTechnologyButtonClick(cheapestTechName, null);
}

export async function gameLoop() {
    if (gameState === getGameVisibleActive()) {
        timerManagerDelta.updateWithTimestamp(performance.now());
        updateAttentionIndicators();
        calculateElapsedActiveGameTime();
        refreshAchievementTooltipDescriptions();

        if (document.getElementById('variableDebuggerWindow').style.display === 'block') {
            populateVariableDebugger();
        }

        backgroundAudio.update();
        weatherAmbienceManager.update();
        const elements = document.querySelectorAll('.notation');

        showHideDynamicUiContent();
        updateDynamicUiContent();
        showTabsUponUnlock();
        checkOrderOfTabs();
        
        setEnergyUse();

        const resourceNames = Object.keys(getResourceDataObject('resources'));
        const resourceTierPairs = [];
        resourceNames.forEach(resourceName => {
            for (let tier = 1; tier <= 4; tier++) {
                resourceTierPairs.push([resourceName, tier]);
            }
        });

        const compoundNames = Object.keys(getResourceDataObject('compounds'));
        const compoundTierPairs = [];
        compoundNames.forEach(compoundName => {
            for (let tier = 1; tier <= 4; tier++) {
                compoundTierPairs.push([compoundName, tier]);
            }
        });

        addPrecipitationResource();

        if (getCurrentStarSystemWeatherEfficiency()[2] !== 'rain' && getCurrentStarSystemWeatherEfficiency()[2] !== 'volcano') {
            stopWeatherEffect();
            setWeatherEffectOn(false);
        }
        
        let allQuantities = getAllQuantities();
        allQuantities = normalizeAllQuantities(allQuantities);
        const allStorages = getAllStorages();
        const allElements = getAllElements(resourceTierPairs, compoundTierPairs);
        const allDescElements = getAllDynamicDescriptionElements(resourceTierPairs, compoundTierPairs);
        updateUIQuantities(allQuantities, allStorages, allElements, allDescElements);
        
        updateStats();
        checkForAchievements();

        updateRocketNames();
        updateAllPowerPlantRates();
        checkIfStarShipBuilt();

        if (getItemsToDeduct() && Object.keys(getItemsToDeduct()).length > 0) {
            checkAndDeductResources();
        }

        if (getItemsToIncreasePrice() && Object.keys(getItemsToIncreasePrice()).length > 0) {
            checkAndIncreasePrices();
        }

        checkRepeatables();
        checkResearchAutoBuyerRowVisibility();
        handleResearchAutoBuyer();

        const elementsToCheck = [
            ...document.querySelectorAll(
                '#autoCreateToggle, #autoSellToggle, .energy-check, .fuel-check, .resource-cost-sell-check, .compound-cost-sell-check, [class*="travel-starship"], .diplomacy-button'
            ),
            ...Array.from(document.querySelectorAll('*')).filter(element =>
                /^.+[1-4]Toggle$/.test(element.id) ||
                ['scienceKitToggle', 'scienceClubToggle', 'scienceLabToggle'].includes(element.id) ||
                element.id.endsWith('Description') && !element.id.startsWith('tech')
            )
        ];
        
        elementsToCheck.forEach(checkStatusAndSetTextClasses);        
        
        handleAutoCreateResourceSellRows();

        starChecks();
        starShipUiChecks();
        fleetHangarChecks();
        coloniseChecks();
        galacticMarketChecks();
        ascendencyBuffChecks();
        megastructureUIChecks();
        rebirthChecks();
        calculateLiquidationValue();

        handlePowerAllButtonState();
        checkPowerBuildingsFuelLevels();
        checkPowerForSpaceTelescopeTimer(['searchAsteroidTimer', 'investigateStarTimer', 'pillageVoidTimer']);
        checkAndStartAutoTelescopeAction();

        monitorTechTree();
        updateNativeTechCostStates();
        
        const revealRowsCheck = document.querySelectorAll('.option-row');
        revealRowsCheck.forEach((revealRowCheck) => {
            resourceAndCompoundMonitorRevealRowsChecks(revealRowCheck);
        });

        getBuildingTypes().forEach(type => {
            checkAndRevealNewBuildings(type);
        });

        monitorRevealResourcesCheck();
        monitorRevealCompoundsCheck();

        if (getAntimatterUnlocked() && getCurrentTab()[1].includes('Space Mining')) {
            if (getElements().miningOption.parentElement.parentElement.classList.contains('invisible')) {
                getElements().miningOption.parentElement.parentElement.classList.remove('invisible');
            }
        }

        updateAllSalePricePreviews();
        updateAllCreatePreviews();

        while (deferredActions.length > 0) {
            const runDeferredJobs = deferredActions.shift();
            runDeferredJobs();
        }

        if (getCurrentOptionPane() === 'technology') {
            updateClassesInRowsToRender();

            const sortedRows = sortRowsByRenderPosition(getTemporaryCoreTechRowsRepo('rows'), 'techs');
            const containerToRenderTo = getTemporaryCoreTechRowsRepo('container');
        
            if (getTechRenderChange()) {
                setTechRenderCounter(getTechRenderCounter() + 1);
            
                if (getTechRenderCounter() >= 150) {
                    sortedRows.forEach(item => containerToRenderTo.appendChild(item.row));
                    setTechRenderChange(false);
                    setTechRenderCounter(0);
                }
            }
        }

        setAllOriginalFrameNumberValues();

        elements.forEach(element => {
            if (document.body.contains(element)) {
                if (element.classList.contains('sell-fuse-money')) {
                    setTempRowValue(element.innerHTML);
                    complexSellStringFormatter(element, getNotationType());
                } else if (element.classList.contains('building-purchase')) {
                    setTempRowValue(element.innerHTML);
                    complexPurchaseBuildingFormatter(element, getNotationType());
                } else {
                    formatAllNotationElements(element, getNotationType());
                }
            }
        });

        fuelRockets();
        updateRocketDescription();

        if (!getSavedYetSinceOpeningSaveDialogue() && getCurrentOptionPane() === 'saving / loading') {
            saveGame('onSaveScreen');
            setSavedYetSinceOpeningSaveDialogue(true);
        } else if (getCurrentOptionPane() === 'saving / loading') {
            if (!getSaveExportCloudFlag()) {
                const saveData = getSaveData();
                const exportSaveArea = document.getElementById('exportSaveArea');
                exportSaveArea.value = saveData;
            } else {
                const saveData = getSaveExportCloudFlag();
                const exportSaveArea = document.getElementById('exportSaveArea');
                exportSaveArea.value = saveData;
            }
        } else {
            setSaveExportCloudFlag(false);
        }

        if (getSavedYetSinceOpeningSaveDialogue && getCurrentOptionPane() !== 'saving / loading') {
            setSavedYetSinceOpeningSaveDialogue(false);
        }

        requestAnimationFrame(gameLoop);
    }
}

function initialiseResearchDeltaTimer() {
    const researchTimerId = 'researchDeltaTimer';
    if (timerManagerDelta.hasTimer(researchTimerId)) {
        return;
    }

    timerManagerDelta.addTimer(researchTimerId, {
        durationMs: 0,
        repeat: true,
        onUpdate: ({ deltaMs }) => {
            updateResearchDelta(deltaMs);
        },
        metadata: { type: 'research' }
    });
}

function updateResearchDelta(deltaMs) {
    if (!deltaMs) {
        return;
    }

    const researchRatePerTick = calculateResearchRatePerTick();
    updateResearchRateDisplay(researchRatePerTick);

    if (researchRatePerTick <= 0) {
        return;
    }

    const researchPerMillisecond = researchRatePerTick / getTimerUpdateInterval();
    const researchGain = researchPerMillisecond * deltaMs;

    if (researchGain <= 0) {
        return;
    }

    const currentResearchQuantity = getResourceDataObject('research', ['quantity']);
    setResourceDataObject(currentResearchQuantity + researchGain, 'research', ['quantity']);
    addToResourceAllTimeStat(researchGain, 'researchPoints');
}

function calculateResearchRatePerTick() {
    const upgrades = getResourceDataObject('research', ['upgrades']);
    let poweredRate = 0;
    let unpoweredRate = 0;

    Object.keys(upgrades).forEach(upgradeKey => {
        const upgradeData = upgrades[upgradeKey];
        if (!upgradeData) {
            return;
        }

        const buildingRate = (upgradeData.rate || 0) * (upgradeData.quantity || 0);
        if (upgradeData.active) {
            poweredRate += buildingRate;
            if (upgradeKey !== 'scienceLab') {
                unpoweredRate += buildingRate;
            }
        }
    });

    let finalRate = getPowerOnOff() ? poweredRate : unpoweredRate;

    const megaStructureTechs = getMegaStructureTechsResearched();
    const isMegaStructureRun = getCurrentRunIsMegaStructureRun();
    const currentFactoryStar = getStarSystemDataObject('stars', [getCurrentStarSystem(), 'factoryStar'], true);

    if (isMegaStructureRun && currentFactoryStar === 'Celestial Processing Core') {
        if (megaStructureTechs.some(arr => Array.isArray(arr) && arr[0] === 2 && arr[1] === 1)) {
            finalRate += 0.5;
        }

        if (megaStructureTechs.some(arr => Array.isArray(arr) && arr[0] === 2 && arr[1] === 2)) {
            finalRate += 1;
        }

        if (megaStructureTechs.some(arr => Array.isArray(arr) && arr[0] === 2 && arr[1] === 4)) {
            finalRate += 1.5;
        }
    }

    if (megaStructureTechs.some(arr => Array.isArray(arr) && arr[0] === 2 && arr[1] === 5)) {
        if (isMegaStructureRun && getStarSystemDataObject('stars', [getCurrentStarSystem(), 'factoryStar']) === 'Celestial Processing Core') {
            finalRate += 2;
        } else {
            finalRate += 5;
        }
    }

    return finalRate;
}

function updateResearchRateDisplay(researchRatePerTick) {
    const researchRateElement = getElements().researchRate;
    if (!researchRateElement) {
        return;
    }

    const displayRate = researchRatePerTick * getTimerRateRatio();
    researchRateElement.textContent = `${displayRate.toFixed(1)} / s`;

    if (displayRate > 0) {
        researchRateElement.classList.add('green-ready-text');
    } else {
        researchRateElement.classList.remove('green-ready-text');
    }
}

function initialiseEnergyDeltaTimer() {
    const energyTimerId = 'energyDeltaTimer';
    if (timerManagerDelta.hasTimer(energyTimerId)) {
        return;
    }

    timerManagerDelta.addTimer(energyTimerId, {
        durationMs: 0,
        repeat: true,
        onUpdate: ({ deltaMs }) => updateEnergyDelta(deltaMs),
        metadata: { type: 'energy' }
    });
}

function updateEnergyDelta(deltaMs) {
    if (!deltaMs) {
        return;
    }

    const tickInterval = getTimerUpdateInterval();
    if (!tickInterval) {
        return;
    }

    const tickMultiplier = deltaMs / tickInterval;
    if (tickMultiplier <= 0) {
        return;
    }

    let newEnergyRate = 0;
    let currentEnergyQuantity = getResourceDataObject('buildings', ['energy', 'quantity']);
    const batteryBought = getResourceDataObject('buildings', ['energy', 'batteryBoughtYet']);
    const energyStorageCapacity = getResourceDataObject('buildings', ['energy', 'storageCapacity']);

    if (!getWeatherEfficiencyApplied()) {
        setResourceDataObject(
            getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'purchasedRate']) * getCurrentStarSystemWeatherEfficiency()[1],
            'buildings',
            ['energy', 'upgrades', 'powerPlant2', 'purchasedRate']
        );
        setWeatherEfficiencyApplied(true);
    }

    if (Math.floor(currentEnergyQuantity) <= energyStorageCapacity) {
        if (getPowerOnOff()) {
            if (getBuildingTypeOnOff('powerPlant1')) {
                newEnergyRate += getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'purchasedRate']);
            }
            if (getBuildingTypeOnOff('powerPlant2')) {
                newEnergyRate += getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'purchasedRate']);
            }
            if (getBuildingTypeOnOff('powerPlant3')) {
                newEnergyRate += getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'purchasedRate']);
            }

            let totalRate = getInfinitePower() ? getInfinitePowerRate() : newEnergyRate - getTotalEnergyUse();

            if (batteryBought) {
                if (Math.floor(currentEnergyQuantity) === energyStorageCapacity) {
                    if (totalRate >= 0) {
                        setResourceDataObject(currentEnergyQuantity, 'buildings', ['energy', 'quantity']);
                        getElements().energyQuantity.classList.remove('red-disabled-text');
                        getElements().energyQuantity.classList.add('green-ready-text');
                        totalRate = 0;
                    } else {
                        const energyDelta = totalRate * tickMultiplier;
                        setResourceDataObject(currentEnergyQuantity + energyDelta, 'buildings', ['energy', 'quantity']);
                        getElements().energyQuantity.classList.add('red-disabled-text');
                        getElements().energyQuantity.classList.remove('green-ready-text');
                    }
                } else {
                    const energyDelta = totalRate * tickMultiplier;
                    setResourceDataObject(
                        Math.min(currentEnergyQuantity + energyDelta, getResourceDataObject('buildings', ['energy', 'storageCapacity'])),
                        'buildings',
                        ['energy', 'quantity']
                    );
                    getElements().energyQuantity.classList.remove('red-disabled-text');
                    getElements().energyQuantity.classList.remove('green-ready-text');
                }
            }
            const energyRateElement = getElements().energyRate;
            if (getInfinitePower()) {
                energyRateElement.textContent = `∞ DYSON ∞`;
            } else {
                energyRateElement.textContent = `${Math.floor(totalRate * getTimerRateRatio())} KW / s`;
            }

            if (totalRate > 0 || getInfinitePower()) {
                energyRateElement.classList.add('green-ready-text');
                energyRateElement.classList.remove('red-disabled-text');
            } else {
                energyRateElement.classList.add('red-disabled-text');
                energyRateElement.classList.remove('green-ready-text');
            }
        } else {
            getElements().energyQuantity.classList.remove('red-disabled-text');
            getElements().energyQuantity.classList.remove('green-ready-text');
            const energyRateElement = getElements().energyRate;
            energyRateElement.textContent = `0 KW / s`;
            energyRateElement.classList.add('red-disabled-text');
            energyRateElement.classList.remove('green-ready-text');
        }
    } else {
        getElements().energyQuantity.classList.add('green-ready-text');
        getElements().energyQuantity.classList.remove('red-disabled-text');
    }

    currentEnergyQuantity = getResourceDataObject('buildings', ['energy', 'quantity']);

    if (currentEnergyQuantity < 0) {
        setResourceDataObject(0, 'buildings', ['energy', 'quantity']);
    }

    if (getInfinitePower()) {
        setResourceDataObject(getInfinitePowerRate(), 'buildings', ['energy', 'rate']);
    } else {
        setResourceDataObject(newEnergyRate, 'buildings', ['energy', 'rate']);
    }

    const powerOnNow = getPowerOnOff();
    let powerOnAfterSwitch = powerOnNow;
    const anyPlantActive = getBuildingTypeOnOff('powerPlant1') || getBuildingTypeOnOff('powerPlant2') || getBuildingTypeOnOff('powerPlant3');

    const initialPowerState = getPowerOnOff();
    const graceActive = isPowerGracePeriodActive();

    if (!batteryBought) {
        const totalRate = newEnergyRate - getTotalEnergyUse();
        if (!getInfinitePower()) {
            if (anyPlantActive) {
                const shouldForceOff = totalRate <= 0 && powerOnNow && !graceActive;
                const shouldForceOn = totalRate > 0 && !powerOnNow;

                if (shouldForceOff) {
                    setPowerOnOff(false);
                } else if (shouldForceOn) {
                    setPowerOnOff(true);
                }
                powerOnAfterSwitch = getPowerOnOff();
            }
        } else {
            powerOnAfterSwitch = true;
        }
    } else {
        if (!getInfinitePower()) {
            const shouldForceOff = currentEnergyQuantity <= 0.00001 && powerOnNow && !graceActive;
            const shouldForceOn = currentEnergyQuantity > 0.00001 && !powerOnNow;

            if (shouldForceOff) {
                setPowerOnOff(false);
            } else if (shouldForceOn) {
                setPowerOnOff(true);
            }
            powerOnAfterSwitch = getPowerOnOff();
        } else {
            powerOnAfterSwitch = true;
        }
    }

    if (powerOnAfterSwitch !== initialPowerState) {
        if (!getPowerOnOff()) {
            sfxPlayer.playAudio('powerOff', 'powerOn');
            sfxPlayer.playAudio('powerTripped', false);
            addToResourceAllTimeStat(1, 'allTimesTripped');
        }
    }

    if (!getPowerOnOff() && powerOnNow !== powerOnAfterSwitch) {
        const powerBuildings = Object.fromEntries(
            Object.entries(getResourceDataObject('buildings', ['energy', 'upgrades'])).filter(([key]) => key.startsWith('power'))
        );

        Object.keys(powerBuildings).forEach(powerBuilding => {
            const fuelType = getResourceDataObject('buildings', ['energy', 'upgrades', powerBuilding, 'fuel'])[0];
            const fuelCategory = getResourceDataObject('buildings', ['energy', 'upgrades', powerBuilding, 'fuel'])[2];

            toggleBuildingTypeOnOff(powerBuilding, false);
            startUpdateTimersAndRates(powerBuilding, 'toggle');
            addOrRemoveUsedPerSecForFuelRate(fuelType, null, fuelCategory, powerBuilding, true);
        });
    }

    setAsteroidTimerCanContinue(getPowerOnOff() && !getCurrentlyInvestigatingStar() && !getCurrentlyPillagingVoid());
    setStarInvestigationTimerCanContinue(getPowerOnOff() && !getCurrentlySearchingAsteroid() && !getCurrentlyPillagingVoid());
    setPillageVoidTimerCanContinue(getPowerOnOff() && !getCurrentlySearchingAsteroid() && !getCurrentlyInvestigatingStar());
}

function initialiseResourceAutoBuyerDeltaTimers() {
    const resources = getResourceDataObject('resources');
    if (!resources) {
        return;
    }

    const tiers = [1, 2, 3, 4];

    Object.keys(resources).forEach(resource => {
        tiers.forEach(tier => {
            const timerId = `${resource}AB${tier}`;
            if (timerManagerDelta.hasTimer(timerId)) {
                return;
            }

            timerManagerDelta.addTimer(timerId, {
                durationMs: 0,
                repeat: true,
                onUpdate: ({ deltaMs }) => updateResourceAutoBuyerDelta(resource, tier, deltaMs),
                metadata: { type: 'resourceAutoBuyer', resource, tier }
            });
        });
    });
}

function updateResourceAutoBuyerDelta(resource, tier, deltaMs) {
    if (!deltaMs) {
        return;
    }

    const tickInterval = getTimerUpdateInterval();
    if (!tickInterval) {
        return;
    }

    const tickMultiplier = deltaMs / tickInterval;
    if (tickMultiplier <= 0) {
        return;
    }

    const storageCapacity = getResourceDataObject('resources', [resource, 'storageCapacity']);
    if (typeof storageCapacity !== 'number' || Number.isNaN(storageCapacity)) {
        return;
    }

    let currentQuantity = getResourceDataObject('resources', [resource, 'quantity']) || 0;

    if (getPowerOnOff()) {
        const autoBuyerExtractionRate = getResourceDataObject('resources', [resource, 'upgrades', 'autoBuyer', `tier${tier}`, 'rate']) || 0;
        const currentTierAutoBuyerQuantity = getResourceDataObject('resources', [resource, 'upgrades', 'autoBuyer', `tier${tier}`, 'quantity']) || 0;
        const activeAutoBuyer = getResourceDataObject('resources', [resource, 'upgrades', 'autoBuyer', `tier${tier}`, 'active']);
        const calculatedResourceRate = activeAutoBuyer ? autoBuyerExtractionRate * currentTierAutoBuyerQuantity : 0;

        const productionAmount = calculatedResourceRate * tickMultiplier;
        const updatedQuantity = Math.min(currentQuantity + productionAmount, storageCapacity);
        const actualGain = Math.max(0, Math.min(storageCapacity - currentQuantity, productionAmount));

        setResourceDataObject(updatedQuantity, 'resources', [resource, 'quantity']);
        addToResourceAllTimeStat(actualGain, resource);
        currentQuantity = updatedQuantity;

        const getResourceTierContribution = tierIndex => {
            const isActive = getResourceDataObject('resources', [resource, 'upgrades', 'autoBuyer', `tier${tierIndex}`, 'active']);
            if (!isActive) return 0;
            return (
                (getResourceDataObject('resources', [resource, 'upgrades', 'autoBuyer', `tier${tierIndex}`, 'rate']) || 0) *
                (getResourceDataObject('resources', [resource, 'upgrades', 'autoBuyer', `tier${tierIndex}`, 'quantity']) || 0)
            );
        };

        const allResourceRatesAddedTogether =
            getResourceTierContribution(1) +
            getResourceTierContribution(2) +
            getResourceTierContribution(3) +
            getResourceTierContribution(4);

        const powerPlant1FuelType = 'carbon';
        const powerPlant1ConsumptionPerTick =
            (getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'fuel'])?.[1] || 0) *
            (getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']) || 0);

        let amountToDeductForConsumption = 0;

        if (getBuildingTypeOnOff('powerPlant1') && resource === powerPlant1FuelType) {
            amountToDeductForConsumption = powerPlant1ConsumptionPerTick;
            if (tier === 1) {
                const consumptionAmount = amountToDeductForConsumption * tickMultiplier;
                setCanAffordDeferred(true);
                deferredActions.push(() => {
                    if (getCanAffordDeferred()) {
                        const netResourceRate = allResourceRatesAddedTogether - amountToDeductForConsumption;
                        setResourceDataObject(netResourceRate, 'resources', [resource, 'rate']);
                        const currentQuantityDeferred = getResourceDataObject('resources', [resource, 'quantity']) || 0;
                        const newQuantity = Math.max(currentQuantityDeferred - consumptionAmount, 0);
                        setResourceDataObject(newQuantity, 'resources', [resource, 'quantity']);
                    }
                    setCanAffordDeferred(null);
                });
            }
        }

        if (resource !== 'solar') {
            const netRateDisplay = (allResourceRatesAddedTogether - amountToDeductForConsumption) * getTimerRateRatio();
            updateProductionRateText(`${resource}Rate`, netRateDisplay);
        }
    } else if (tier === 1) {
        const autoBuyerExtractionRate = getResourceDataObject('resources', [resource, 'upgrades', 'autoBuyer', 'tier1', 'rate']) || 0;
        const currentTierAutoBuyerQuantity = getResourceDataObject('resources', [resource, 'upgrades', 'autoBuyer', 'tier1', 'quantity']) || 0;
        const activeAutoBuyer = getResourceDataObject('resources', [resource, 'upgrades', 'autoBuyer', 'tier1', 'active']);

        const calculatedResourceRate = activeAutoBuyer ? autoBuyerExtractionRate * currentTierAutoBuyerQuantity : 0;
        const productionAmount = calculatedResourceRate * tickMultiplier;
        const updatedQuantity = Math.min(currentQuantity + productionAmount, storageCapacity);
        const actualGain = Math.max(0, Math.min(storageCapacity - currentQuantity, productionAmount));

        setResourceDataObject(updatedQuantity, 'resources', [resource, 'quantity']);
        addToResourceAllTimeStat(actualGain, resource);

        const resourceTier1Rate = calculatedResourceRate;
        setResourceDataObject(resourceTier1Rate, 'resources', [resource, 'rate']);
        if (resource !== 'solar') {
            updateProductionRateText(`${resource}Rate`, resourceTier1Rate * getTimerRateRatio());
        }
    }

    if (getResourceDataObject('resources', [resource, 'autoSell'])) {
        const updatedQuantity = getResourceDataObject('resources', [resource, 'quantity']) || 0;

        if (updatedQuantity > 100) {
            const autoSellQuantity = updatedQuantity - 100;
            setResourceDataObject(100, 'resources', [resource, 'quantity']);
            processAutoSell(resource, autoSellQuantity, 'resources');
        }
    }
}

function initialiseCompoundAutoBuyerDeltaTimers() {
    const compounds = getResourceDataObject('compounds');
    if (!compounds) {
        return;
    }

    const tiers = [1, 2, 3, 4];

    Object.keys(compounds).forEach(compound => {
        tiers.forEach(tier => {
            const timerId = `${compound}AB${tier}`;
            if (timerManagerDelta.hasTimer(timerId)) {
                return;
            }

            timerManagerDelta.addTimer(timerId, {
                durationMs: 0,
                repeat: true,
                onUpdate: ({ deltaMs }) => updateCompoundAutoBuyerDelta(compound, tier, deltaMs),
                metadata: { type: 'compoundAutoBuyer', compound, tier }
            });
        });
    });
}

function updateCompoundAutoBuyerDelta(compound, tier, deltaMs) {
    if (!deltaMs) {
        return;
    }

    const tickInterval = getTimerUpdateInterval();
    if (!tickInterval) {
        return;
    }

    const tickMultiplier = deltaMs / tickInterval;
    if (tickMultiplier <= 0) {
        return;
    }

    const storageCapacity = getResourceDataObject('compounds', [compound, 'storageCapacity']);
    if (typeof storageCapacity !== 'number' || Number.isNaN(storageCapacity)) {
        return;
    }

    let currentQuantity = getResourceDataObject('compounds', [compound, 'quantity']) || 0;

    if (getPowerOnOff()) {
        const autoBuyerExtractionRate = getResourceDataObject('compounds', [compound, 'upgrades', 'autoBuyer', `tier${tier}`, 'rate']) || 0;
        const currentTierAutoBuyerQuantity = getResourceDataObject('compounds', [compound, 'upgrades', 'autoBuyer', `tier${tier}`, 'quantity']) || 0;
        const activeAutoBuyer = getResourceDataObject('compounds', [compound, 'upgrades', 'autoBuyer', `tier${tier}`, 'active']);
        const calculatedCompoundRate = activeAutoBuyer ? autoBuyerExtractionRate * currentTierAutoBuyerQuantity : 0;

        const productionAmount = calculatedCompoundRate * tickMultiplier;
        const updatedQuantity = Math.min(currentQuantity + productionAmount, storageCapacity);
        const actualGain = Math.max(0, Math.min(storageCapacity - currentQuantity, productionAmount));

        setResourceDataObject(updatedQuantity, 'compounds', [compound, 'quantity']);
        addToResourceAllTimeStat(actualGain, compound);
        currentQuantity = updatedQuantity;

        if (
            getCurrentStarSystemWeatherEfficiency()[2] === 'rain' &&
            compound === getStarSystemDataObject('stars', [getCurrentStarSystem(), 'precipitationType']) &&
            getUnlockedCompoundsArray().includes(getStarSystemDataObject('stars', [getCurrentStarSystem(), 'precipitationType']))
        ) {
            const precipitationGain = currentQuantity >= storageCapacity ? 0 : autoBuyerExtractionRate * tickMultiplier;
            setCollectedPrecipitationQuantityThisRun(getCollectedPrecipitationQuantityThisRun() + precipitationGain);
        }

        const getCompoundTierContribution = tierIndex => {
            const isActive = getResourceDataObject('compounds', [compound, 'upgrades', 'autoBuyer', `tier${tierIndex}`, 'active']);
            if (!isActive) return 0;
            return (
                (getResourceDataObject('compounds', [compound, 'upgrades', 'autoBuyer', `tier${tierIndex}`, 'rate']) || 0) *
                (getResourceDataObject('compounds', [compound, 'upgrades', 'autoBuyer', `tier${tierIndex}`, 'quantity']) || 0)
            );
        };

        let allCompoundRatesAddedTogether =
            getCompoundTierContribution(1) +
            getCompoundTierContribution(2) +
            getCompoundTierContribution(3) +
            getCompoundTierContribution(4);

        if (compound === getStarSystemDataObject('stars', [getCurrentStarSystem(), 'precipitationType'])) {
            allCompoundRatesAddedTogether += getCurrentPrecipitationRate();
        }

        const powerPlant3FuelType = 'diesel';
        const powerPlant3ConsumptionPerTick =
            (getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'fuel'])?.[1] || 0) *
            (getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'quantity']) || 0);

        let amountToDeductForConsumption = 0;

        if (getBuildingTypeOnOff('powerPlant3') && compound === powerPlant3FuelType) {
            amountToDeductForConsumption = powerPlant3ConsumptionPerTick;
            if (tier === 1) {
                const consumptionAmount = amountToDeductForConsumption * tickMultiplier;
                setResourceDataObject(allCompoundRatesAddedTogether - amountToDeductForConsumption, 'compounds', [compound, 'rate']);
                const currentQuantityTier1 = getResourceDataObject('compounds', [compound, 'quantity']) || 0;
                const adjustedQuantity = Math.max(0, Math.min(currentQuantityTier1 - consumptionAmount, storageCapacity));
                setResourceDataObject(adjustedQuantity, 'compounds', [compound, 'quantity']);
                currentQuantity = adjustedQuantity;
            }
        }

        const netCompoundRateDisplay = (allCompoundRatesAddedTogether - amountToDeductForConsumption) * getTimerRateRatio();
        updateProductionRateText(`${compound}Rate`, netCompoundRateDisplay);
    } else if (tier === 1) {
        const autoBuyerExtractionRate = getResourceDataObject('compounds', [compound, 'upgrades', 'autoBuyer', 'tier1', 'rate']) || 0;
        const currentTierAutoBuyerQuantity = getResourceDataObject('compounds', [compound, 'upgrades', 'autoBuyer', 'tier1', 'quantity']) || 0;
        const activeAutoBuyer = getResourceDataObject('compounds', [compound, 'upgrades', 'autoBuyer', 'tier1', 'active']);
        const calculatedCompoundRate = activeAutoBuyer ? autoBuyerExtractionRate * currentTierAutoBuyerQuantity : 0;

        const productionAmount = calculatedCompoundRate * tickMultiplier;
        const updatedQuantity = Math.min(currentQuantity + productionAmount, storageCapacity);
        const actualGain = Math.max(0, Math.min(storageCapacity - currentQuantity, productionAmount));

        setResourceDataObject(updatedQuantity, 'compounds', [compound, 'quantity']);
        addToResourceAllTimeStat(actualGain, compound);

        if (
            compound === getStarSystemDataObject('stars', [getCurrentStarSystem(), 'precipitationType']) &&
            getUnlockedCompoundsArray().includes(getStarSystemDataObject('stars', [getCurrentStarSystem(), 'precipitationType']))
        ) {
            const precipitationGain = activeAutoBuyer ? autoBuyerExtractionRate * tickMultiplier : 0;
            setCollectedPrecipitationQuantityThisRun(getCollectedPrecipitationQuantityThisRun() + precipitationGain);
        }

        let compoundTier1Rate = calculatedCompoundRate;

        if (compound === getStarSystemDataObject('stars', [getCurrentStarSystem(), 'precipitationType'])) {
            compoundTier1Rate += getCurrentPrecipitationRate();
        }

        if (!activeAutoBuyer) {
            compoundTier1Rate = 0;
        }

        setResourceDataObject(compoundTier1Rate, 'compounds', [compound, 'rate']);
        updateProductionRateText(`${compound}Rate`, compoundTier1Rate * getTimerRateRatio());
    } else if (
        compound === getStarSystemDataObject('stars', [getCurrentStarSystem(), 'precipitationType'])
    ) {
        setResourceDataObject(getCurrentPrecipitationRate(), 'compounds', [compound, 'rate']);
        updateProductionRateText(`${compound}Rate`, getCurrentPrecipitationRate() * getTimerRateRatio());
    }

    if (getResourceDataObject('compounds', [compound, 'autoSell'])) {
        const updatedQuantity = getResourceDataObject('compounds', [compound, 'quantity']) || 0;

        if (updatedQuantity > 100) {
            const autoSellQuantity = updatedQuantity - 100;
            setResourceDataObject(100, 'compounds', [compound, 'quantity']);
            processAutoSell(compound, autoSellQuantity, 'compounds');
        }
    }

    if (getResourceDataObject('compounds', [compound, 'autoCreate'])) {
        const resources = [1, 2, 3, 4].map(i => getResourceDataObject('compounds', [compound, `createsFrom${i}`])?.[0]);

        resources.forEach(resourceName => {
            if (resourceName !== '' && resourceName !== undefined) {
                setResourceDataObject(false, 'resources', [resourceName, 'autoSell']);
            }
        });

        currentQuantity = getResourceDataObject('compounds', [compound, 'quantity']) || 0;

        if (currentQuantity < storageCapacity) {
            const amountToCreateArray = calculateCreatableCompoundAmount(compound);
            const availableStorage = Math.floor(storageCapacity - currentQuantity);
            const amountToCreate = Math.min(amountToCreateArray[0], availableStorage);

            setResourceDataObject(currentQuantity + amountToCreate, 'compounds', [compound, 'quantity']);

            amountToCreateArray.slice(1).forEach(([amountPerUnit, resourceName]) => {
                if (resourceName && amountPerUnit > 0) {
                    const currentResourceQuantity = getResourceDataObject('resources', [resourceName, 'quantity']) || 0;
                    const newResourceQuantity = currentResourceQuantity - Math.floor((amountToCreate / amountToCreateArray[0]) * amountPerUnit);
                    setResourceDataObject(newResourceQuantity, 'resources', [resourceName, 'quantity']);
                }
            });
        }
    }
}

function initialiseRocketFuelDeltaTimers() {
    const spaceUpgrades = getResourceDataObject('space', ['upgrades']);
    if (!spaceUpgrades) {
        return;
    }

    Object.keys(spaceUpgrades)
        .filter(upgradeKey => upgradeKey.startsWith('rocket'))
        .forEach(rocketName => {
            const timerId = `${rocketName}FuelDeltaTimer`;
            if (timerManagerDelta.hasTimer(timerId)) {
                return;
            }

            timerManagerDelta.addTimer(timerId, {
                durationMs: 0,
                repeat: true,
                onUpdate: ({ deltaMs }) => updateRocketFuelDelta(rocketName, deltaMs),
                metadata: { type: 'rocketFuel', rocket: rocketName }
            });
        });
}

function updateRocketFuelDelta(rocketName, deltaMs) {
    if (!deltaMs) {
        return;
    }

    const fuelingEntries = getRocketsFuellerStartedArray();
    const isCurrentlyFueling = fuelingEntries.includes(rocketName);

    if (!isCurrentlyFueling) {
        setCheckRocketFuellingStatus(rocketName, false);
        return;
    }

    const canFuelNow = getPowerOnOff() && getCanFuelRockets();
    setCheckRocketFuellingStatus(rocketName, canFuelNow);

    if (!canFuelNow) {
        return;
    }

    const rocketData = getResourceDataObject('space', ['upgrades', rocketName]);
    if (!rocketData) {
        return;
    }

    const fullFuelAmount = rocketData?.fuelQuantityToLaunch ?? 0;
    const currentFuelAmount = rocketData?.fuelQuantity ?? 0;

    if (fullFuelAmount <= 0 || currentFuelAmount >= fullFuelAmount) {
        return;
    }

    const tierConfig = rocketData?.autoBuyer?.tier1 ?? null;
    const baseFuelRate = tierConfig?.rate ?? 0;
    const optimisationStacks = (getBuffRocketFuelOptimizationData()?.boughtYet ?? 0) + 1;
    const effectiveFuelRate = baseFuelRate * optimisationStacks;

    if (effectiveFuelRate <= 0) {
        return;
    }

    const secondsElapsed = deltaMs / 10;
    const fuelToAdd = effectiveFuelRate * secondsElapsed * getTimerRateRatio();

    if (fuelToAdd <= 0) {
        return;
    }

    const nextFuelAmount = Math.min(fullFuelAmount, currentFuelAmount + fuelToAdd);
    setResourceDataObject(nextFuelAmount, 'space', ['upgrades', rocketName, 'fuelQuantity']);
}

export function drawMegaStructureTableText() {
    const tableContainer = document.getElementById('tableContainer');
    if (!tableContainer) return;

    for (const [id, text] of Object.entries(megaStructureTableText)) {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = `<span class="red-disabled-text">${text}</span>`;
        }
    }

    function colorMegaStructureTableText() {
        const themeElement = document.querySelector('[data-theme]');
        const themeStyles = getComputedStyle(themeElement);
        let readyColor = themeStyles.getPropertyValue('--text-color').trim();
        readyColor = readyColor.replace(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/, 'rgba($1, $2, $3, 0.5)');

        const megaKeys = [
            'DysonSphere',
            'CelestialProcessingCore',
            'PlasmaForge',
            'GalacticMemoryArchive'
        ];

        for (const [id, _] of Object.entries(megaStructureTableText)) {
            const el = document.getElementById(id);
            if (!el) continue;

            const span = el.querySelector('span');
            if (!span) continue;

            span.className = 'red-disabled-text';

            if (conditionForId(id)) {
                span.className = 'green-ready-text';
            }
        }

        megaKeys.forEach(key => {
            const ids = [
                `name${key}`,
                ...[1, 2, 3, 4, 5].map(i => `research${key}${i}`),
                ...[1, 2, 3, 4, 5].map(i => `effect${key}${i}`)
            ];

            const allGreen = ids.every(id => {
                const el = document.getElementById(id);
                const span = el?.querySelector('span');
                return span && span.classList.contains('green-ready-text');
            });

            if (allGreen) {
                ids.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.style.backgroundColor = readyColor;
                });
            }
        });
    }

    function conditionForId(id) {
        if (id.startsWith('name')) {
            const owned = getMegaStructuresInPossessionArray();
            const name = megaStructureTableText[id];
            return owned.includes(name);
        }

        const researched = getMegaStructureTechsResearched();
        const idMatch = id.match(/^(research|effect)([A-Za-z]+)(\d)$/);

        if (idMatch) {
            const [, , key, indexStr] = idMatch;
            const structureIndexMap = {
                DysonSphere: 1,
                CelestialProcessingCore: 2,
                PlasmaForge: 3,
                GalacticMemoryArchive: 4
            };
            const structureIndex = structureIndexMap[key];
            const researchIndex = parseInt(indexStr);

            return researched.some(
                ([msIndex, rIndex]) =>
                    msIndex === structureIndex && rIndex === researchIndex
            );
        }

        return false;
    }

    colorMegaStructureTableText();
}


function megastructureUIChecks() {
    const isMegaStructureRun = getCurrentRunIsMegaStructureRun();
    const optionElement = document.getElementById('megastructuresOption');
    const optionContainer = optionElement?.parentElement?.parentElement;
    const shouldShowOption = isMegaStructureRun || getMegaStructureTabUnlocked();

    if (optionContainer) {
        if (shouldShowOption) {
            if (optionContainer.classList.contains('invisible')) {
                optionContainer.classList.remove('invisible');
            }

            if (isMegaStructureRun && !getMegaStructureTabUnlocked()) {
                setMegaStructureTabUnlocked(true);
            }
        } else if (!optionContainer.classList.contains('invisible')) {
            optionContainer.classList.add('invisible');
        }
    }

    if (isMegaStructureRun) {
        if (!getMegaStructureTabNotificationShown() && !getHasVisitedMegaStructure()) {
            showNotification(`The MegaStructure Option is now available in the Galactic Tab!`, 'info', 3000, 'tech');
            setMegaStructureTabNotificationShown(true);
            setHasVisitedMegaStructure(true);
        }
    }

    if (getCurrentOptionPane() === 'megastructures') {
        drawMegaStructureTableText();

        const researched = getMegaStructureTechsResearched();
        const themeKey = capitaliseString(getCurrentTheme());

        const dysonSphereDisconnected = researched.some(pair => pair[0] === 1 && pair[1] === 3);
        const celestialProcessingCoreDisconnected = researched.some(pair => pair[0] === 2 && pair[1] === 3);
        const plasmaForgeDisconnected = researched.some(pair => pair[0] === 3 && pair[1] === 3);
        const galacticMemoryArchiveDisconnected = researched.some(pair => pair[0] === 4 && pair[1] === 3);

        const dysonSphereContainer = document.getElementById('dysonSphereContainer');
        const celestialProcessingCoreContainer = document.getElementById('celestialProcessingCoreContainer');
        const plasmaForgeContainer = document.getElementById('plasmaForgeContainer');
        const galacticMemoryArchiveContainer = document.getElementById('galacticMemoryArchiveContainer');
        const starSystemContainer = document.getElementById('starSystemBox');

        function updateContainerImage(container, disconnected, activeKeyBase, notActiveKeyBase) {
            if (!container) return;
            const key = (disconnected ? activeKeyBase : notActiveKeyBase) + themeKey;
            const expectedSrc = megaStructureImageUrls[key];

            let img = container.querySelector('img');
            if (img) {
                if (!img.src.endsWith(expectedSrc)) {
                    img.src = expectedSrc;
                }
            } else {
                img = document.createElement('img');
                img.className = 'mega-structure-image';
                img.src = expectedSrc;
                container.appendChild(img);
            }
        }

        updateContainerImage(dysonSphereContainer, dysonSphereDisconnected, 'dysonSphereActive', 'dysonSphereNotActive');
        updateContainerImage(celestialProcessingCoreContainer, celestialProcessingCoreDisconnected, 'celestialProcessingCoreActive', 'celestialProcessingCoreNotActive');
        updateContainerImage(plasmaForgeContainer, plasmaForgeDisconnected, 'plasmaForgeActive', 'plasmaForgeNotActive');
        updateContainerImage(galacticMemoryArchiveContainer, galacticMemoryArchiveDisconnected, 'galacticMemoryArchiveActive', 'galacticMemoryArchiveNotActive');

        if (starSystemContainer) {
            const allActive = dysonSphereDisconnected && celestialProcessingCoreDisconnected && plasmaForgeDisconnected && galacticMemoryArchiveDisconnected;
            const key = (allActive ? 'starSystemActive' : 'starSystemNotActive') + themeKey;
            const expectedSrc = megaStructureImageUrls[key];

            let img = starSystemContainer.querySelector('img');
            if (img) {
                if (!img.src.endsWith(expectedSrc)) {
                    img.src = expectedSrc;
                }
            } else {
                img = document.createElement('img');
                img.className = 'star-system-image';
                img.src = expectedSrc;
                starSystemContainer.appendChild(img);
            }
        }

        const disconnectedCount = 
            (dysonSphereDisconnected ? 1 : 0) + 
            (celestialProcessingCoreDisconnected ? 1 : 0) + 
            (plasmaForgeDisconnected ? 1 : 0) + 
            (galacticMemoryArchiveDisconnected ? 1 : 0);

        const forceFieldContainer = document.getElementById('forceFieldBox');
        if (forceFieldContainer) {
            const key = `forceField${disconnectedCount}${themeKey}`;
            const forceFieldSrc = megaStructureImageUrls[key];

            let img = forceFieldContainer.querySelector('img');
            if (img) {
                if (!img.src.endsWith(forceFieldSrc)) {
                    img.src = forceFieldSrc;
                }
            } else {
                img = document.createElement('img');
                img.className = 'force-field-image';
                img.src = forceFieldSrc;
                forceFieldContainer.appendChild(img);
            }
        }
    }
}

function checkRepeatables() {
    const playerPhilosophy = getPlayerPhilosophy();
    const repeatableObject = getAllRepeatableTechMultipliersObject();

    const handlers = {
        constructor: {
            "1": () => { // cheaper one off buildings
                setOneOffBuildingPricesAfterRepeatables(getRepeatableTechMultipliers('1')); // DONE
            },
            "2": () => { // cheaper resource autobuyers
                //setResourceAutobuyerPricesAfterRepeatables(getRepeatableTechMultipliers('2')); //already DONE in upgrade button logic
            },
            "3": () => { // cheaper compound recipes
                //setCompoundRecipePricesAfterRepeatables(getRepeatableTechMultipliers('3')); //already DONE in upgrade button logic
            },
            "4": () => { // cheaper energy and research buildings
                //setEnergyAndResearchBuildingPricesAfterRepeatables(getRepeatableTechMultipliers('4')); //already DONE in upgrade button logic
            }
        },
        supremacist: {
            "1": () => { // cheaper fleets
                //setFleetPricesAfterRepeatables(getRepeatableTechMultipliers('1')); //already DONE in upgrade button logic
            },
            "2": () => { // fleets higher health armor
                //setFleetArmorBuffsAfterRepeatables(getRepeatableTechMultipliers('2')); //already DONE in upgrade button logic
            },
            "3": () => { // fleets faster
                //setFleetSpeedsAfterRepeatables(getRepeatableTechMultipliers('3')); //already DONE in upgrade button logic
            },
            "4": () => { // fleets more damage dealt
                //setFleetAttackDamageAfterRepeatables(getRepeatableTechMultipliers('4')); //already DONE in upgrade button logic
            }
        },
        voidborn: {
            "1": () => { // improve starting impression of enemies
                //setInitialImpressionBaseAfterRepeatables(getRepeatableTechMultipliers('1')); //already DONE in upgrade button logic
            },
            "2": () => { // star study quicker
                //setStarStudyEfficiencyAfterRepeatables(getRepeatableTechMultipliers('2')); //already DONE in upgrade button logic
            },
            "3": () => { // asteroid search quicker
                //setAsteroidSearchEfficiencyAfterRepeatables(getRepeatableTechMultipliers('3')); //already DONE in upgrade button logic
            },
            "4": () => { // improve base awarded AP by 1pt each time
                //calculateAndAddExtraAPFromPhilosophyRepeatable(getRepeatableTechMultipliers('4')); //already DONE in upgrade button logic
            }
        },
        expansionist: {
            "1": () => { // reduce starship parts costs
                //setStarshipPartPricesAfterRepeatables(getRepeatableTechMultipliers('1')); //already DONE in upgrade button logic
            },
            "2": () => { // reduce rocket parts costs
                //setRocketPartPricesAfterRepeatables(getRepeatableTechMultipliers('2')); //already DONE in upgrade button logic
            },
            "3": () => { // reduce rocket travel time
                //setRocketTravelTimeReductionAfterRepeatables(getRepeatableTechMultipliers('3')); //already DONE in upgrade button logic
            },
            "4": () => { // reduce starship travel time
                //setStarshipTravelTimeReductionAfterRepeatables(getRepeatableTechMultipliers('4')); //already DONE in upgrade button logic
            }
        }
    };

    for (const key in repeatableObject) {
        if (repeatableObject.hasOwnProperty(key)) {
            const handler = handlers[playerPhilosophy]?.[key];
            if (handler) {
                handler();
            }
        }
    }
}

function setOneOffBuildingPricesAfterRepeatables(multiple = 1) {
    const reductionFactor = 1 - (multiple - 1) * 0.01;

    function applyPriceReduction(basePrices, upgradeName, resource1, resource1Type, resource2, resource2Type, resource3, resource3Type) {
        const modifiedPrices = basePrices.map(price => price * reductionFactor);
        setResourceDataObject(modifiedPrices[0], 'space', ['upgrades', upgradeName, 'price']);
        setResourceDataObject([modifiedPrices[1], resource1, resource1Type], 'space', ['upgrades', upgradeName, 'resource1Price']);
        setResourceDataObject([modifiedPrices[2], resource2, resource2Type], 'space', ['upgrades', upgradeName, 'resource2Price']);
        setResourceDataObject([modifiedPrices[3], resource3, resource3Type], 'space', ['upgrades', upgradeName, 'resource3Price']);
    }

    const basePricesTelescope = getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'basePrices']);
    const basePricesLaunchPad = getResourceDataObject('space', ['upgrades', 'launchPad', 'basePrices']);

    applyPriceReduction(basePricesTelescope, 'spaceTelescope', 'iron', 'resources', 'titanium', 'compounds', 'concrete', 'compounds');
    applyPriceReduction(basePricesLaunchPad, 'launchPad', 'glass', 'compounds', 'titanium', 'compounds', 'steel', 'compounds');
}

export function setResourceAutobuyerPricesAfterRepeatables() {
    const resources = getResourceDataObject('resources');
    
    Object.keys(resources).forEach(resource => {
        if (resource === 'solar') return;

        for (let tier = 1; tier <= 4; tier++) {
            const pricePath = ['upgrades', 'autoBuyer', `tier${tier}`, 'price'];
            const currentPrice = getResourceDataObject('resources', [resource, ...pricePath]);

            const updatedPrice = currentPrice * 0.95;
            setResourceDataObject(updatedPrice, 'resources', [resource, ...pricePath]);
        }
    });
}

export function setCompoundRecipePricesAfterRepeatables() {
    const allCompounds = getResourceDataObject('compounds');

    for (const compoundKey in allCompounds) {
        for (let i = 1; i <= 4; i++) {
            const ratioKey = `createsFromRatio${i}`;
            const currentRatio = getResourceDataObject('compounds', [compoundKey, ratioKey]);

            if (currentRatio > 0) {
                const newRatio = Math.max(1, currentRatio * 0.95);
                setResourceDataObject(newRatio, 'compounds', [compoundKey, ratioKey]);
            }
        }

        const originalCompoundText = getCompoundCreateDropdownRecipeText(compoundKey);
        const updatedCompoundText = {};

        for (const key of ['max', 'threeQuarters', 'twoThirds', 'half', 'oneThird']) {
            if (originalCompoundText[key]) {
                updatedCompoundText[key] = originalCompoundText[key];
            }
        }

        const resourceShortNames = {
            iron: 'Irn',
            carbon: 'Crb',
            sodium: 'Sod',
            neon: 'Neo',
            hydrogen: 'Hyd',
            oxygen: 'Oxy',
            silicon: 'Sil'
        };

        const quantitiesToUpdate = {
            '50000': 50000,
            '5000': 5000,
            '500': 500,
            '50': 50,
            '5': 5,
            '1': 1
        };

        const sources = [];
        for (let i = 1; i <= 4; i++) {
            const from = getResourceDataObject('compounds', [compoundKey, `createsFrom${i}`]);
            const ratio = getResourceDataObject('compounds', [compoundKey, `createsFromRatio${i}`]);
            if (from && from[0] && ratio > 0) {
                const shortName = resourceShortNames[from[0]];
                sources.push({ compound: shortName, ratio });
            }
        }

        for (const [label, baseMultiplier] of Object.entries(quantitiesToUpdate)) {
            const parts = sources.map(({ compound, ratio }) => {
                const amount = ratio * baseMultiplier;
                let formatted;

                if (amount >= 1000000) {
                    formatted = `${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}M`;
                } else if (amount >= 1000) {
                    formatted = `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
                } else {
                    formatted = Math.round(amount);
                }

                return `${formatted} ${compound}`;
            });

            updatedCompoundText[label] = {
                value: label,
                text: `${label} - ${parts.join(', ')}`
            };
        }

        setCompoundCreateDropdownRecipeText(compoundKey, updatedCompoundText);
    }
}

export function setEnergyAndResearchBuildingPricesAfterRepeatables() {
    const energyBuildings = getResourceDataObject('buildings', ['energy', 'upgrades']);
    const researchBuildings = getResourceDataObject('research', ['upgrades']);

    const reducePrice = (value) => value > 0 ? value * 0.95 : value;

    const updateBuildingPrices = (key, subKeys) => {
        const price = getResourceDataObject(key, [...subKeys, 'price']);
        if (price > 0) {
            setResourceDataObject(reducePrice(price), key, [...subKeys, 'price']);
        }

        for (let i = 1; i <= 3; i++) {
            const resourceKey = `resource${i}Price`;
            const priceArray = getResourceDataObject(key, [...subKeys, resourceKey]);

            if (Array.isArray(priceArray) && priceArray[0] > 0) {
                const newPriceArray = [...priceArray];
                newPriceArray[0] = reducePrice(priceArray[0]);
                setResourceDataObject(newPriceArray, key, [...subKeys, resourceKey]);
            }
        }
    };

    Object.keys(energyBuildings).forEach(buildingKey => {
        updateBuildingPrices('buildings', ['energy', 'upgrades', buildingKey]);
    });

    Object.keys(researchBuildings).forEach(researchKey => {
        updateBuildingPrices('research', ['upgrades', researchKey]);
    });
}

export function setFleetPricesAfterRepeatables() {
    const spaceUpgrades = getResourceDataObject('space', ['upgrades']);
    const reducePrice = (value) => value > 0 ? value * 0.95 : value;

    const updateFleetPrices = (fleetKey) => {
        const basePath = ['upgrades', fleetKey];

        const price = getResourceDataObject('space', [...basePath, 'price']);
        if (price > 0) {
            setResourceDataObject(reducePrice(price), 'space', [...basePath, 'price']);
        }

        for (let i = 1; i <= 3; i++) {
            const resourceKey = `resource${i}Price`;
            const priceArray = getResourceDataObject('space', [...basePath, resourceKey]);

            if (Array.isArray(priceArray) && priceArray[0] > 0) {
                const newPriceArray = [...priceArray];
                newPriceArray[0] = reducePrice(priceArray[0]);
                setResourceDataObject(newPriceArray, 'space', [...basePath, resourceKey]);
            }
        }
    };

    Object.keys(spaceUpgrades).forEach(key => {
        if (key.startsWith('fleet')) {
            updateFleetPrices(key);
        }
    });
}

export function setFleetArmorBuffsAfterRepeatables() {
    const current = getPlayerStartingUnitHealth();
    const updated = current * 1.05;
    setPlayerStartingUnitHealth(updated);
}

export function setFleetSpeedsAfterRepeatables() {
    const fleets = ['fleetScout', 'fleetMarauder', 'fleetLandStalker', 'fleetNavalStrafer'];

    for (const fleet of fleets) {
        const path = ['upgrades', fleet, 'speed'];
        const current = getResourceDataObject('space', path);
        const updated = current * 1.05;
        setResourceDataObject(updated, 'space', path);
    }
}

export function setFleetAttackDamageAfterRepeatables() {
    const fleets = ['fleetScout', 'fleetMarauder', 'fleetLandStalker', 'fleetNavalStrafer'];

    for (const fleet of fleets) {
        const path = ['upgrades', fleet, 'baseAttackStrength'];
        const current = getResourceDataObject('space', path);
        const updated = current * 1.05;
        setResourceDataObject(updated, 'space', path);
    }
}

export function setInitialImpressionBaseAfterRepeatables() {
    setInitialImpression(getInitialImpression() + 1);
}

export function setStarStudyEfficiencyAfterRepeatables() {
    const currentDuration = getBaseInvestigateStarTimerDuration();
    const newDuration = currentDuration * 0.99;
    setBaseInvestigateStarTimerDuration(newDuration);
}

export function setAsteroidSearchEfficiencyAfterRepeatables() {
    const currentDuration = getBaseSearchAsteroidTimerDuration();
    const newDuration = currentDuration * 0.99;
    setBaseSearchAsteroidTimerDuration(newDuration);
}

export function calculateAndAddExtraAPFromPhilosophyRepeatable(amountToAdd = 0) {
    return amountToAdd;
}

export function getAscendencyPointsWithRepeatableBonus(baseAscendencyPoints = 0) {
    const base = Number(baseAscendencyPoints) || 0;

    if (getPlayerPhilosophy() === 'voidborn' && getStatRun() > 1) {
        const bonus = calculateAndAddExtraAPFromPhilosophyRepeatable(getRepeatableTechMultipliers('4'));
        return base + bonus;
    }

    return base;
}

export function setStarshipPartPricesAfterRepeatables() {
    const spaceUpgrades = getResourceDataObject('space', ['upgrades']);
    const reducePrice = (value) => value > 0 ? value * 0.95 : value;

    const updateStarshipPartPrices = (partKey) => {
        const basePath = ['upgrades', partKey];

        const price = getResourceDataObject('space', [...basePath, 'price']);
        if (price > 0) {
            setResourceDataObject(reducePrice(price), 'space', [...basePath, 'price']);
        }

        for (let i = 1; i <= 3; i++) {
            const resourceKey = `resource${i}Price`;
            const priceArray = getResourceDataObject('space', [...basePath, resourceKey]);

            if (Array.isArray(priceArray) && priceArray[0] > 0) {
                const newPriceArray = [...priceArray];
                newPriceArray[0] = reducePrice(priceArray[0]);
                setResourceDataObject(newPriceArray, 'space', [...basePath, resourceKey]);
            }
        }
    };

    Object.keys(spaceUpgrades).forEach(key => {
        if (key.startsWith('ss')) {
            updateStarshipPartPrices(key);
        }
    });
}

export function setRocketPartPricesAfterRepeatables() {
    const spaceUpgrades = getResourceDataObject('space', ['upgrades']);
    const reducePrice = (value) => value > 0 ? value * 0.95 : value;

    const updateRocketPartPrices = (partKey) => {
        const basePath = ['upgrades', partKey];

        const price = getResourceDataObject('space', [...basePath, 'price']);
        if (price > 0) {
            setResourceDataObject(reducePrice(price), 'space', [...basePath, 'price']);
        }

        for (let i = 1; i <= 3; i++) {
            const resourceKey = `resource${i}Price`;
            const priceArray = getResourceDataObject('space', [...basePath, resourceKey]);

            if (Array.isArray(priceArray) && priceArray[0] > 0) {
                const newPriceArray = [...priceArray];
                newPriceArray[0] = reducePrice(priceArray[0]);
                setResourceDataObject(newPriceArray, 'space', [...basePath, resourceKey]);
            }
        }
    };

    Object.keys(spaceUpgrades).forEach(key => {
        if (key.startsWith('rocket')) {
            updateRocketPartPrices(key);
        }
    });
}

export function setRocketTravelTimeReductionAfterRepeatables() {
    const currentSpeed = getRocketTravelSpeed();
    const newSpeed = currentSpeed / 0.95;
    setRocketTravelSpeed(newSpeed);
}

export function setStarshipTravelTimeReductionAfterRepeatables() {
    const currentSpeed = getStarShipTravelSpeed();
    const newSpeed = currentSpeed * 0.95;
    setStarShipTravelSpeed(newSpeed);
}

function handleAutoCreateResourceSellRows() {
    const autoCreateCompoundsActivated = Object.keys(getResourceDataObject('compounds'))
        .filter(key => getResourceDataObject('compounds', [key, 'autoCreate']) === true);

    autoCreateCompoundsActivated.forEach(autoCreateCompound => {
        const resources = [1, 2, 3, 4]
            .map(i => getResourceDataObject('compounds', [autoCreateCompound, `createsFrom${i}`])[0])
            .filter(resource => resource !== '' && resource !== undefined);

        const currentPane = getCurrentOptionPane();

        if (resources.includes(currentPane)) {
            const sellRowElement = document.getElementById(`${currentPane}SellRow`);
            if (sellRowElement) {
                sellRowElement.style.pointerEvents = 'none';
                sellRowElement.style.opacity = '0.5';
            }
        }
    });
}

function updateNativeTechCostStates() {
    if (getCurrentOptionPane() !== 'tech tree') {
        return;
    }

    const costElements = document.querySelectorAll('.native-tech-cost');
    if (!costElements.length) {
        return;
    }

    const currentResearchRaw = getResourceDataObject('research', ['quantity']);
    const currentResearch = typeof currentResearchRaw === 'number' ? currentResearchRaw : Number(currentResearchRaw) || 0;
    const unlockedTechs = getTechUnlockedArray();

    costElements.forEach(costElement => {
        const price = Number(costElement.dataset.price ?? 0);
        const techKey = costElement.dataset.techKey;
        if (!techKey) {
            return;
        }

        const meetsCostRequirement = unlockedTechs.includes(techKey) || currentResearch >= price;
        costElement.classList.toggle('ready-text', meetsCostRequirement);
        costElement.classList.toggle('red-disabled-text', !meetsCostRequirement);
    });
}

function updateAllPowerPlantRates() {
    if (getCurrentTab()[1].includes('Energy')) {
        const buildings = ['powerPlant1', 'powerPlant2', 'powerPlant3'];
  
        buildings.forEach(building => {
          const rateBuilding = getResourceDataObject('buildings', ['energy', 'upgrades', building, 'rate']);
          const newQuantityBuilding = getResourceDataObject('buildings', ['energy', 'upgrades', building, 'quantity']); 
      
          const energyRateElement = getElements()[building + 'Rate'];
          if (energyRateElement) {
            const totalRate = rateBuilding * newQuantityBuilding * getTimerRateRatio();
            energyRateElement.innerHTML = `${Math.floor(totalRate)} KW / s`;

            if (totalRate > 0) {
                energyRateElement.classList.add('green-ready-text');
            } else {
                energyRateElement.classList.remove('green-ready-text');
            }
          }
        });
    }
  }  

function checkIfStarShipBuilt() {
    if (!getStarShipBuilt())  {
        const starShipModules = Object.keys(getResourceDataObject('space', ['upgrades']))
        .filter(module => module.startsWith('ss') && !module.startsWith('ssStellarScanner'));

        const allMandatoryModulesFinished = starShipModules.every(starShipModule => 
            getResourceDataObject('space', ['upgrades', starShipModule, 'finished'])
        );
    
        setStarShipBuilt(allMandatoryModulesFinished);
        if (allMandatoryModulesFinished) {
            showNotification('Star Ship can now be launched!', 'info', 3000, 'starShip');
        }
    }

    if (!getStellarScannerBuilt()) {
        const stellarScannerFinished = getResourceDataObject('space', ['upgrades', 'ssStellarScanner', 'finished']) === true;
        setStellarScannerBuilt(stellarScannerFinished);
    }
}

function updateRocketNames() {
    if (getCurrentTab()[1].includes('Space Mining')) {
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`rocket${i}`).textContent = getRocketUserName(`rocket${i}`);
        }
    }
}

function showHideDynamicUiContent() {
    if (getCurrentOptionPane() === 'energy storage' || getCurrentOptionPane() === 'power plant' || getCurrentOptionPane() === 'solar power plant' || getCurrentOptionPane() === 'advanced power plant') {
        document.getElementById('energyConsumptionStats').classList.remove('invisible');
    } else {
        document.getElementById('energyConsumptionStats').classList.add('invisible');
    }
}

function addPrecipitationResource() {
    const currentStarSystemPrecipitationCategory = getStarSystemDataObject('stars', [getCurrentStarSystem(), 'precipitationResourceCategory']);
    const currentStarSystemPrecipitationType = getStarSystemDataObject('stars', [getCurrentStarSystem(), 'precipitationType']);
    const precipitationTypeRevealedYet = getTechUnlockedArray().includes(getResourceDataObject(currentStarSystemPrecipitationCategory, [currentStarSystemPrecipitationType, 'revealedBy']));

    let currentStarSystemPrecipitationTypeQuantity = getResourceDataObject(currentStarSystemPrecipitationCategory, [currentStarSystemPrecipitationType, 'quantity']);
    let precipitationStorageAvailable = getResourceDataObject(currentStarSystemPrecipitationCategory, [currentStarSystemPrecipitationType, 'storageCapacity']) > currentStarSystemPrecipitationTypeQuantity;

    if (getCurrentStarSystemWeatherEfficiency()[2] === 'rain' && precipitationTypeRevealedYet && precipitationStorageAvailable) {
        setResourceDataObject(currentStarSystemPrecipitationTypeQuantity + getCurrentPrecipitationRate(), currentStarSystemPrecipitationCategory, [currentStarSystemPrecipitationType, 'quantity']);
        addToResourceAllTimeStat(getCurrentPrecipitationRate(), currentStarSystemPrecipitationType);
        const precipitationId = currentStarSystemPrecipitationType + 'Quantity';

        if (document.getElementById(precipitationId)) {
            document.getElementById(precipitationId).textContent = getResourceDataObject(currentStarSystemPrecipitationCategory, [currentStarSystemPrecipitationType, 'quantity']);
        }
    }
}

function checkAndRevealNewBuildings(type) {
    let elements;
    let element;

    switch (type) {
        case 'energy':
            elements = getResourceDataObject('buildings', ['energy', 'upgrades']);
            for (const key in elements) {
                if (elements.hasOwnProperty(key)) {
                    const upgrade = elements[key];
                    const revealedTech = upgrade.revealedBy;
                    if (getTechUnlockedArray().includes(revealedTech)) {
                        const elementUpgradeOptionElement = key + 'Option';
                        document.getElementById(elementUpgradeOptionElement).parentElement.parentElement.classList.remove('invisible');
                    }
                }
            }
            break;
        case 'space':
            element = document.getElementById('launchPadOption');
            if (getTechUnlockedArray().includes('rocketComposites') && getCurrentTab()[1].includes('Space Mining')) {
                element.parentElement.parentElement.classList.remove('invisible');
            } else {
                element.parentElement.parentElement.classList.add('invisible');
            }
            element = document.getElementById('asteroidsOption');
            if (getAsteroidArray().length > 0 && getCurrentTab()[1].includes('Space Mining')) {
                element.parentElement.parentElement.classList.remove('invisible');
            } else {
                element.parentElement.parentElement.classList.add('invisible');
            }
            break;
        case 'starShip':
            element = document.getElementById('starShipOption');
            if (getTechUnlockedArray().includes('orbitalConstruction') && getCurrentTab()[1].includes('Interstellar')) {
                element.parentElement.parentElement.classList.remove('invisible');
            } else {
                element.parentElement.parentElement.classList.add('invisible');
            }
            if (getCurrentOptionPane() === 'star ship') {
                const ssModules = {
                    ssStructural: 'orbitalConstruction',
                    ssLifeSupport: 'lifeSupportSystems',
                    ssAntimatterEngine: 'antimatterEngines',
                    ssFleetHangar: 'starshipFleets',
                };
                
                Object.keys(ssModules).forEach(ssModule => {
                    const rowElement = document.getElementById(`space${capitaliseString(ssModule)}BuildRow`);
                    if (rowElement) {
                        if (getTechUnlockedArray().includes(ssModules[ssModule]) && !getStarShipBuilt()) {
                            rowElement.classList.remove('invisible');
                        } else {
                            rowElement.classList.add('invisible');
                        }
                    }
                });
                
                const stellarScannerRow = document.getElementById(`spaceSsStellarScannerBuildRow`);
                if (stellarScannerRow) {
                    const stellarScannerTechUnlocked = getTechUnlockedArray().includes('stellarScanners');
                    const starShipInBuildPhase = getStarShipStatus()[0] === 'readyForTravel' || getStarShipStatus()[0] === 'preconstruction';

                    if (!stellarScannerTechUnlocked || getStellarScannerBuilt() || !starShipInBuildPhase) {
                        stellarScannerRow.classList.add('invisible');
                    } else {
                        stellarScannerRow.classList.remove('invisible');
                    }
                }               
            }
            break;
        case 'fleetHangar':
            element = document.getElementById('fleetHangarOption');
            if (getStarShipBuilt() && getCurrentTab()[1].includes('Interstellar')) {
                element.parentElement.parentElement.classList.remove('invisible');
            } else {
                element.parentElement.parentElement.classList.add('invisible');
            }
            break;
        case 'colonise':
            element = document.getElementById('coloniseOption');
            const quantitiesFleets = (() => {
                const data = getResourceDataObject('space', ['upgrades']);
                
                return Object.keys(data)
                    .filter(key => key.startsWith('fleet'))
                    .map(key => data[key].quantity);
            })();
        
            if (!getApAwardedThisRun() && getDestinationStarScanned() && getStarShipStatus()[0] === 'orbiting' && quantitiesFleets.some(qty => qty > 0) && getCurrentTab()[1].includes('Interstellar')) {
                element.parentElement.parentElement.classList.remove('invisible');
            } else {
                element.parentElement.parentElement.classList.add('invisible');
            }
            break;
        case 'philosophy':
            element = [...document.querySelectorAll('p[class*="tab3"]')].find(el => el.innerHTML.includes('Philosophy'));
            if (getStatRun() > 1 && getPlayerPhilosophy() !== null) {
                element.parentElement.parentElement.classList.remove('invisible');
            } else {
                element.parentElement.parentElement.classList.add('invisible');
            }
    }
}

function updateStats() {
    //top bar
    //stat1
    const cash = getResourceDataObject('currency', ['cash']);
    if (getCurrencySymbol() !== "€") {
        getElements().cashStat.textContent = `${getCurrencySymbol()}${cash.toFixed(2)}`;
    } else {
        getElements().cashStat.textContent = `${cash.toFixed(2) + getCurrencySymbol()}`;
    }

    //stat2
    updateEnergyStat(document.getElementById('stat2'));

    //stat3
    checkStatusAndSetTextClasses(document.getElementById('stat3'));

    //stat4
    const batteryLevel = switchBatteryStatBarWhenBatteryBought();

    if (batteryLevel || batteryLevel === 0) {
        setBatteryIndicator(batteryLevel);
    }

    //stat5
    updateAntimatterStat();

    //stat6
    updateAP();

    //stat7
    let statLabelElement = document.getElementById('stat7').previousElementSibling;
    statLabelElement.innerHTML = `${capitaliseWordsWithRomanNumerals(getCurrentStarSystem())}:`;

    //stat8
    getTimeInStatCell();

    //stat5-7 tooltip + styling
    statToolBarCustomizations();

    //stats page
    if (getCurrentOptionPane() === 'statistics') {
        getStats(statFunctionsGets);
    }
}

function updateAP() {
    const statLabelElement = document.getElementById('stat6').closest('.stat-cell').querySelector('.stat-label');
    statLabelElement.innerHTML = 'AP:';
    if (getAscendencyPoints() > 0) {
        document.getElementById('stat6').innerHTML = `<span class="green-ready-text">${getAscendencyPoints()}</span>`;
    } else {
        document.getElementById('stat6').innerHTML = `<span class="red-disabled-text">0</span>`;
    }
}

function updateAntimatterStat() {
    const statLabelElement = document.getElementById('stat5').closest('.stat-cell').querySelector('.stat-label');
    if (getAntimatterUnlocked()) {
        statLabelElement.innerHTML = 'Antimatter:'
        const antimatterTotalQuantity = Math.floor(getResourceDataObject('antimatter', ['quantity']));
        const antimatterValueClass = antimatterTotalQuantity > 0 ? 'green-ready-text' : 'red-disabled-text';
        document.getElementById('stat5').innerHTML = `<span class="${antimatterValueClass}">${antimatterTotalQuantity}</span>`;
    } else {
        statLabelElement.innerHTML = '???';
        document.getElementById('stat5').innerHTML = `<span class="red-disabled-text">???</span>`;
    }
}

function setRevealedResources(resource) {
    const resourcePairs = [
        ['hydrogen', 'helium'],
        ['helium', 'carbon'],
        ['carbon', 'neon'],
        ['carbon', 'sodium'],
        ['neon', 'oxygen'],
        ['oxygen', 'silicon'],
        ['silicon', 'iron']
    ];

    resourcePairs.forEach(pair => {
        if (pair[0] === resource) {
            setResourceDataObject(true, 'resources', [pair[1], 'revealedYet']);
        }
    });
}

export function fuseResource(resource, fuseTargets) {
    setRevealedResources(resource);
    
    const resourceString = getResourceDataObject('resources', [resource, 'nameResource']);
    const resourceQuantity = getResourceDataObject('resources', [resource, 'quantity']);
    let totalDeducted = 0;
    let iterationCounter = 0;

    for (let target of fuseTargets) {
        iterationCounter++;
        const { fuseTo, ratio, resourceRowToShow, categoryToShow, mainCategoryToShow } = target;

        const fuseToString = getResourceDataObject('resources', [fuseTo, 'nameResource']);
        const fuseToStorageCapacity = getResourceDataObject('resources', [fuseTo, 'storageCapacity']);
        const fuseToQuantity = getResourceDataObject('resources', [fuseTo, 'quantity']);
        
        let fuseData, amountToDeductFromResource, amountToAddToResource, realAmountToAdd = 0, lostQuantity = 0;

        if (!getUnlockedResourcesArray().includes(fuseTo)) {
            resourceRowToShow.classList.remove('invisible');
            mainCategoryToShow.classList.remove('invisible');
            categoryToShow.classList.remove('invisible');
            setUnlockedResourcesArray(fuseTo);
            appendAttentionIndicator(document.getElementById(`${fuseTo}Option`));
            fuseData = getResourceSalePreview(resource);
            amountToDeductFromResource = parseInt(fuseData.match(/\((\d+)/)[1], 10);
            const amountToAdd = Math.ceil((amountToDeductFromResource * ratio) / 4);

            showNotification(
                `Discovered ${fuseToString} and made ${amountToAdd} ${fuseToString} from ${amountToDeductFromResource} ${resourceString}!`,
                'info', 3000, 'fuse'
            );
            setResourceDataObject(resourceQuantity - amountToDeductFromResource, 'resources', [resource, 'quantity']);
            setResourceDataObject(fuseToQuantity + amountToAdd, 'resources', [fuseTo, 'quantity']);
            addToResourceAllTimeStat(amountToAdd, fuseTo);
            totalDeducted = amountToDeductFromResource;
        } else {
            let fusionEfficiency = 1;

            if (!getTechUnlockedArray().includes("fusionEfficiencyI")) {
                fusionEfficiency = Math.random() * (0.30 - 0.20) + 0.20;
            } else if (!getTechUnlockedArray().includes("fusionEfficiencyII")) {
                fusionEfficiency = Math.random() * (0.60 - 0.40) + 0.40;
            } else if (!getTechUnlockedArray().includes("fusionEfficiencyIII")) {
                fusionEfficiency = Math.random() * (0.80 - 0.60) + 0.60;
            }

            fuseData = getResourceSalePreview(resource);
            amountToDeductFromResource = parseInt(fuseData.match(/\((\d+)/)[1], 10);
            iterationCounter === 1 ? amountToAddToResource = parseInt(fuseData.match(/->\s*(\d+)/)[1], 10) : amountToAddToResource = parseInt(fuseData.match(/(?<=,\s)\d+/)[0], 10)

            realAmountToAdd = Math.floor(amountToAddToResource * fusionEfficiency);
            const energyLossFuseToQuantity = Math.floor(amountToAddToResource - realAmountToAdd);
            const availableStorageFuseTo = Math.floor(fuseToStorageCapacity - fuseToQuantity);

            if (Math.abs(amountToDeductFromResource * ratio - amountToAddToResource) <= 1) {
                showNotification(
                    `Should Fuse ${amountToDeductFromResource} ${resourceString} into ${Math.floor(amountToDeductFromResource * ratio)} ${fuseToString}. Lost ${energyLossFuseToQuantity} ${fuseToString} as energy due to sub-optimal fusion efficiency, receive ${realAmountToAdd} ${fuseToString}`,
                    'info',
                    3000, 'fuse'
                );
            } else { ;
                
                lostQuantity = Math.max(realAmountToAdd - availableStorageFuseTo, 0);
                showNotification(
                    `Should Fuse ${amountToDeductFromResource} ${resourceString} into ${Math.floor(amountToDeductFromResource * ratio)} ${fuseToString}. Max available storage is for ${availableStorageFuseTo}.  Of those, ${energyLossFuseToQuantity} lost due to sub-optimal fusion efficiency. So receive ${realAmountToAdd - lostQuantity} ${fuseToString}`,
                    'warning',
                    5000, 'fuse'
                );
            }

            const finalAmountToAdd = Math.min(realAmountToAdd - lostQuantity, availableStorageFuseTo);
            setResourceDataObject(fuseToQuantity + finalAmountToAdd, 'resources', [fuseTo, 'quantity']);
            addToResourceAllTimeStat(finalAmountToAdd, fuseTo);
            totalDeducted = amountToDeductFromResource;
        }
    }

    setResourceDataObject(resourceQuantity - totalDeducted, 'resources', [resource, 'quantity']);
}

export function sellResource(resource) {
    const resourceQuantity = getResourceDataObject('resources', [resource, 'quantity']);
    const saleData = getResourceSalePreview(resource);

    const currentCash = getResourceDataObject('currency', ['cash']);
    const extractedValue = saleData.split('>')[1].split('<')[0].trim();
    let cashRaised;

    if (getCurrencySymbol() === "€") {
        cashRaised = parseFloat(extractedValue.replace('€', '').replace(',', ''));
    } else {
        cashRaised = parseFloat(extractedValue.slice(1).replace(',', '')); // Remove the currency symbol and convert
    }
    const quantityToDeduct = parseInt(saleData.match(/\((\d+)/)[1], 10);

    if (getCurrencySymbol() === "€") {
        showNotification(
            `You sold ${quantityToDeduct} ${capitaliseString(resource)} for ${cashRaised}${getCurrencySymbol()}!`,
            'info', 3000, 'sold'
        );
    } else {
        showNotification(
            `You sold ${quantityToDeduct} ${capitaliseString(resource)} for ${getCurrencySymbol()}${cashRaised}!`,
            'info', 3000, 'sold'
        );
    }

    setResourceDataObject(resourceQuantity - quantityToDeduct, 'resources', [resource, 'quantity']);

    if (getResourceDataObject('resources', [resource, 'quantity']) < 1) {
        setResourceDataObject(0, 'resources', [resource, 'quantity']);
    }

    setResourceDataObject(currentCash + cashRaised, 'currency', ['cash']);
}

export function createCompound(compound) {
    const constituentPartsObject = getConstituentPartsObject();
    const existingCompoundQuantity = getResourceDataObject('compounds', [compound, 'quantity']);
    const compoundMaxStorage = getResourceDataObject('compounds', [compound, 'storageCapacity']);

    let newQuantity = existingCompoundQuantity + constituentPartsObject.compoundToCreateQuantity;
    let exceededDifference = 0;

    if (newQuantity > compoundMaxStorage) {
        exceededDifference = newQuantity - compoundMaxStorage;
        newQuantity = compoundMaxStorage;
    }

    setResourceDataObject(newQuantity, 'compounds', [compound, 'quantity']);

    let notificationParts = [];

    for (let i = 1; i <= 4; i++) {
        const partNameKey = `constituentPartName${i}`;
        const partQuantityKey = `constituentPartQuantity${i}`;
        const partName = constituentPartsObject[partNameKey];
        const partQuantity = constituentPartsObject[partQuantityKey];

        if (partName && partQuantity > 0) {
            let type;

            if (getResourceDataObject('resources')[partName]) {
                type = 'resources';
            } 
            else if (getResourceDataObject('compounds')[partName]) {
                type = 'compounds';
            } 
            else {
                type = 'error';
            }

            setResourceDataObject(
                getResourceDataObject(type, [partName, 'quantity']) - partQuantity,
                type, 
                [partName, 'quantity']
            );

            notificationParts.push(`${partQuantity} ${capitaliseString(partName)}`);
        }
    }

    const compoundCreatedQuantity = constituentPartsObject.compoundToCreateQuantity;
    const compoundCreatedName = capitaliseString(compound);

    if (exceededDifference > 0) {
        showNotification(
            `You created ${compoundCreatedQuantity} ${compoundCreatedName} from ${notificationParts.join(', ')} but ${exceededDifference} ${compoundCreatedName} was wasted due to storage limit being exceeded.`,
            'warning', 3000, 'create'
        );
    } else {
        showNotification(
            `You created ${compoundCreatedQuantity} ${compoundCreatedName} from ${notificationParts.join(', ')}`,
            'info', 3000, 'create'
        );
    }
}

export function sellCompound(compound) {
    const resourceQuantity = getResourceDataObject('compounds', [compound, 'quantity']);
    const saleData = getCompoundSalePreview(compound);

    const currentCash = getResourceDataObject('currency', ['cash']);
    let extractedValue = saleData.split('>')[1].split('<')[0].trim();

    let cashRaised;

    if (getCurrencySymbol() === "€") {
        cashRaised = parseFloat(extractedValue.replace('€', '').replace(',', ''));
    } else {
        cashRaised = parseFloat(extractedValue.slice(1).replace(',', ''));
    }

    const quantityToDeduct = parseInt(saleData.match(/\((\d+)/)[1], 10);

    setResourceDataObject(resourceQuantity - quantityToDeduct, 'compounds', [compound, 'quantity']);

    if (getResourceDataObject('compounds', [compound, 'quantity']) < 1) {
        setResourceDataObject(0, 'compounds', [compound, 'quantity']);
    }

    setResourceDataObject(currentCash + cashRaised, 'currency', ['cash']);

    if (getCurrencySymbol() === "€") {
        showNotification(
            `You sold ${quantityToDeduct} ${capitaliseString(compound)} for ${cashRaised}${getCurrencySymbol()}!`,
            'info', 3000, 'special'
        );
    } else {
        showNotification(
            `You sold ${quantityToDeduct} ${capitaliseString(compound)} for ${getCurrencySymbol()}${cashRaised}!`,
            'info', 3000, 'special'
        );
    }
}

function updateAllCreatePreviews() {
    const currentScreen = getCurrentOptionPane();
    const compounds = getResourceDataObject('compounds');
   
    for (const compound in compounds) {   
        if (compound === currentScreen) {
            const dropDownElementId = compound + "CreateSelectQuantity";

            setCreateCompoundPreview(currentScreen, document.getElementById(dropDownElementId).querySelector('div.dropdown').innerText);
                  
            const createPreviewString = getCompoundCreatePreview(compound);
            let cleanedString = cleanString(createPreviewString);

            const createPreviewElementId = compounds[compound]?.createPreviewElement;
            const createPreviewElement = document.getElementById(createPreviewElementId);
    
            if (createPreviewElement) {
                createPreviewElement.innerHTML = cleanedString;
            }

            if (getResourceDataObject('compounds', [compound, 'autoCreate'])) {
                createPreviewElement.innerHTML = '<span class="red-disabled-text">Auto Creating...</span>';
            }
        }
    }
}

function updateAllSalePricePreviews() {
    const currentScreen = getCurrentOptionPane();
    const resources = getResourceDataObject('resources');
    const compounds = getResourceDataObject('compounds');

    for (const resource in resources) {
        const fuseTo1 = resources[resource]?.['fuseTo1'];
        const fuseTo2 = resources[resource]?.['fuseTo2'];
    
        if (resource === currentScreen) {
            const dropDownElementId = resource + "SellSelectQuantity";

            setSaleResourcePreview(currentScreen, document.getElementById(dropDownElementId).querySelector('div.dropdown').innerText, fuseTo1, fuseTo2);
                  
            const salePreviewString = getResourceSalePreview(resource);
            let cleanedString = cleanString(salePreviewString);

            const salePreviewElementId = resources[resource]?.salePreviewElement;
            const salePreviewElement = document.getElementById(salePreviewElementId);
    
            if (salePreviewElement) {
                salePreviewElement.innerHTML = cleanedString;
            }

            const sellDescription = document.getElementById(`${resource}SellRow`);
            if (sellDescription && getComputedStyle(sellDescription).pointerEvents === 'none') {
                salePreviewElement.innerHTML = '<span class="red-disabled-text">Auto Creating...</span>';
            }
        }
    }
    
    for (const compound in compounds) {   
        if (compound === currentScreen) {
            const dropDownElementId = compound + "SellSelectQuantity";

            setSaleCompoundPreview(currentScreen, document.getElementById(dropDownElementId).querySelector('div.dropdown').innerText);
                  
            const salePreviewString = getCompoundSalePreview(compound);
            let cleanedString = cleanString(salePreviewString);

            const salePreviewElementId = compounds[compound]?.salePreviewElement;
            const salePreviewElement = document.getElementById(salePreviewElementId);
    
            if (salePreviewElement) {
                salePreviewElement.innerHTML = cleanedString;
            }
        }
    }
}

function cleanString(string) {
    if (string.includes("NaN") || string.includes(", 0 )")) { //clean string
        return string.split(",")[0] + ")";
    } else if (string.includes(', 0 !)')) {
        return string.split(",")[0] + "!)";
    } else if (string.includes(', 0 !!)')) {
        return string.split(",")[0] + "!!)";
    } else if (string.includes(" ()")) {
        return string.replace(" ()", "");
    } else {
        return string;
    }
}

function checkAndIncreasePrices() {
    const priceIncreaseObject = getItemsToIncreasePrice();

    for (const key in priceIncreaseObject) {
        if (key === "") {
            delete priceIncreaseObject[key];
        }
    }

    for (const priceIncrease in priceIncreaseObject) {
        if (priceIncreaseObject.hasOwnProperty(priceIncrease)) {

            if (getCanAffordDeferred()) {
                const { currentPrice, setPriceTarget, typeOfResourceCompound } = priceIncreaseObject[priceIncrease];
                if (setPriceTarget.startsWith('science')) {
                    setNewItemPrice(currentPrice, setPriceTarget, null, null, null);
                } else if (setPriceTarget.startsWith('power') || setPriceTarget.startsWith('battery') || setPriceTarget.startsWith('rocket') || setPriceTarget.startsWith('ss') || setPriceTarget.startsWith('fleet')) { //add new building types if needed will have a bug here if add any more it will go to the else block
                    if (priceIncrease === "cash") {
                        setNewItemPrice(currentPrice, setPriceTarget, null, null, priceIncrease);
                    } else {
                        setNewItemPrice(currentPrice, setPriceTarget, null, null, priceIncreaseObject);
                    }
                } else if (setPriceTarget.includes('TechPhilosophy'))    {
                    setNewItemPrice(currentPrice, setPriceTarget, null, null, 'research');
                } else {
                    const tierMatch = setPriceTarget.match(new RegExp(`${priceIncrease}AB(\\d+)Price`));
                    if (tierMatch && tierMatch[1]) {
                        const tier = parseInt(tierMatch[1], 10);
                        setNewItemPrice(currentPrice, setPriceTarget, tier, typeOfResourceCompound, null);
                    }
                }
            }
        }
    }

    setItemsToIncreasePrice('clear');
}

function setNewItemPrice(currentPrice, elementName, tier, typeOfResourceCompound, optionalResource) {
    let resource1Price = 0;
    let resource2Price = 0;
    let resource3Price = 0;

    let resource1Name = '';
    let resource2Name = '';
    let resource3Name = '';

    let resource1Category = '';
    let resource2Category = '';
    let resource3Category = '';

    if (elementName) {
        const newCorePrice = Math.ceil(currentPrice * getGameCostMultiplier());

        if (optionalResource && optionalResource !== 'cash' && optionalResource !== 'research') {
            for (const item in optionalResource) {
                if (optionalResource.hasOwnProperty(item)) {
                    const resource = optionalResource[item];
                    const resourceOrder = resource.resourceOrder;
    
                    if (resourceOrder === 'resource1Price') {
                        resource1Price = resource.currentPrice;
                        resource1Name = item;
                        resource1Category = resource.typeOfResourceCompound;
                    } else if (resourceOrder === 'resource2Price') {
                        resource2Price = resource.currentPrice;;
                        resource2Name = item;
                        resource2Category = resource.typeOfResourceCompound;
                    } else if (resourceOrder === 'resource3Price') {
                        resource3Price = resource.currentPrice;;
                        resource3Name = item;
                        resource3Category = resource.typeOfResourceCompound;
                    }
                }
            }
        }

        let newResource1Price = resource1Price > 0 ? Math.ceil(resource1Price * getGameCostMultiplier()) : 0;
        let newResource2Price = resource2Price > 0 ? Math.ceil(resource2Price * getGameCostMultiplier()) : 0;
        let newResource3Price = resource3Price > 0 ? Math.ceil(resource3Price * getGameCostMultiplier()) : 0;

        if (newResource1Price > 0) {
            newResource1Price = [newResource1Price, resource1Name, resource1Category];
        }

        if (newResource2Price > 0) {
            newResource2Price = [newResource2Price, resource2Name, resource2Category];
        }

        if (newResource3Price > 0) {
            newResource3Price = [newResource3Price, resource3Name, resource3Category];
        }
        
        if (elementName.startsWith('science')) {
            const strippedElementName = elementName.slice(0, -5);        
            setResourceDataObject(newCorePrice, 'research', ['upgrades', strippedElementName, 'price']);
        } else if (elementName.startsWith('power') || elementName.startsWith('battery')) {
            const strippedElementName = elementName.slice(0, -5);
            if (optionalResource === 'cash') {
                setResourceDataObject(newCorePrice, 'buildings', ['energy', 'upgrades', strippedElementName, 'price']);
            }        
            if (resource1Price > 0) {
                setResourceDataObject(newResource1Price, 'buildings', ['energy', 'upgrades', strippedElementName, 'resource1Price']);
            }
            if (resource2Price > 0) {
                setResourceDataObject(newResource2Price, 'buildings', ['energy', 'upgrades', strippedElementName, 'resource2Price']);
            }
            if (resource3Price > 0) {
                setResourceDataObject(newResource3Price, 'buildings', ['energy', 'upgrades', strippedElementName, 'resource3Price']);
            }
        } else if (elementName.startsWith('rocket') || elementName.startsWith('ss') || elementName.startsWith('fleet')) {
            const strippedElementName = elementName.slice(0, -5);
            if (optionalResource === 'cash') {
                setResourceDataObject(newCorePrice, 'space', ['upgrades', strippedElementName, 'price']);
            }        
            if (resource1Price > 0) {
                setResourceDataObject(newResource1Price, 'space', ['upgrades', strippedElementName, 'resource1Price']);
            }
            if (resource2Price > 0) {
                setResourceDataObject(newResource2Price, 'space', ['upgrades', strippedElementName, 'resource2Price']);
            }
            if (resource3Price > 0) {
                setResourceDataObject(newResource3Price, 'space', ['upgrades', strippedElementName, 'resource3Price']);
            }
        } else if (elementName.includes('TechPhilosophy')) {
            const repeatableTech = elementName.split("TechPhilosophy")[0];
            setResourceDataObject(newCorePrice, 'philosophyRepeatableTechs', [getPlayerPhilosophy(), repeatableTech, 'price']);
        } else { //autoBuyer
            const itemName = elementName.replace(/([A-Z])/g, '-$1').toLowerCase().split('-')[0];
            setResourceDataObject(newCorePrice, typeOfResourceCompound, [itemName, 'upgrades', 'autoBuyer', `tier${tier}`, 'price']);       
        }
    }
}

function checkAndDeductResources() {
    const deductObject = getItemsToDeduct();
    let deductAmount;
    let mainKey;

    for (const itemToDeductType in deductObject) {
        if (itemToDeductType === "" || itemToDeductType.includes(',')) {
            delete deductObject[itemToDeductType];
        }
    }

    for (const itemToDeductType in deductObject) {
        if (deductObject.hasOwnProperty(itemToDeductType)) {
            let currentQuantity;
            deductAmount = deductObject[itemToDeductType].deductQuantity;
            const typeOfResourceCompound = deductObject[itemToDeductType].typeOfResourceCompound;

            if (itemToDeductType === 'cash') {
                mainKey = 'currency';
                currentQuantity = getResourceDataObject(mainKey, [itemToDeductType]);
                if (deductAmount >  currentQuantity) {
                    setCanAffordDeferred(false);
                } else {
                    setResourceDataObject(currentQuantity - deductAmount, mainKey, [itemToDeductType]);
                    setCanAffordDeferred(true);
                }
            } else if (itemToDeductType === 'research') {
                mainKey = 'research';
                currentQuantity = getResourceDataObject(mainKey, ['quantity']);
                if (deductAmount >  currentQuantity) {
                    setCanAffordDeferred(false);
                } else {
                    setResourceDataObject(currentQuantity - deductAmount, mainKey, ['quantity']);
                    setCanAffordDeferred(true);
                }
            } else {
                mainKey = typeOfResourceCompound;
                currentQuantity = getResourceDataObject(mainKey, [itemToDeductType, 'quantity']);
                if (deductAmount >  currentQuantity) {
                    setCanAffordDeferred(false);
                } else {
                    setResourceDataObject(currentQuantity - deductAmount, mainKey, [itemToDeductType, 'quantity']);
                    setCanAffordDeferred(true);
                } 
            }
        }
    }

    setItemsToDeduct('clear');
}

function getAllQuantities() {
    const resourceKeys = Object.keys(getResourceDataObject('resources'));
    const compoundKeys = Object.keys(getResourceDataObject('compounds'));
    const rockets = Object.keys(getResourceDataObject('space', ['upgrades']))
    .filter(rocket => rocket.startsWith('rocket'));
    const starshipModules = Object.keys(getResourceDataObject('space', ['upgrades']))
    .filter(module => module.startsWith('ss'));
    const fleetShips = Object.keys(getResourceDataObject('space', ['upgrades']))
    .filter(module => module.startsWith('fleet'));

    const allQuantities = {};

    resourceKeys.forEach(resource => {
        const resourceName = resource;
        allQuantities[resourceName] = getResourceDataObject('resources', [resourceName, 'quantity']);
        allQuantities[`${resourceName}AB1Quantity`] = getResourceDataObject('resources', [resourceName, 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
        allQuantities[`${resourceName}AB2Quantity`] = getResourceDataObject('resources', [resourceName, 'upgrades', 'autoBuyer', 'tier2', 'quantity']);
        allQuantities[`${resourceName}AB3Quantity`] = getResourceDataObject('resources', [resourceName, 'upgrades', 'autoBuyer', 'tier3', 'quantity']);
        allQuantities[`${resourceName}AB4Quantity`] = getResourceDataObject('resources', [resourceName, 'upgrades', 'autoBuyer', 'tier4', 'quantity']);
    });

    compoundKeys.forEach(compound => {
        const compoundName = compound;
        allQuantities[compoundName] = getResourceDataObject('compounds', [compoundName, 'quantity']);
        allQuantities[`${compoundName}AB1Quantity`] = getResourceDataObject('compounds', [compoundName, 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
        allQuantities[`${compoundName}AB2Quantity`] = getResourceDataObject('compounds', [compoundName, 'upgrades', 'autoBuyer', 'tier2', 'quantity']);
        allQuantities[`${compoundName}AB3Quantity`] = getResourceDataObject('compounds', [compoundName, 'upgrades', 'autoBuyer', 'tier3', 'quantity']);
        allQuantities[`${compoundName}AB4Quantity`] = getResourceDataObject('compounds', [compoundName, 'upgrades', 'autoBuyer', 'tier4', 'quantity']);
    });

    if (getCurrentOptionPane() === 'launch pad') {
        rockets.forEach(rocket => {
            allQuantities[rocket] = getResourceDataObject('space', ['upgrades', rocket, 'builtParts']);
        });
    } else if (getCurrentOptionPane() === 'star ship') {
        starshipModules.forEach(module => {
            allQuantities[module] = getResourceDataObject('space', ['upgrades', module, 'builtParts']);
        });
    } else if (getCurrentOptionPane() === 'fleet hangar') {
        fleetShips.forEach(ship => {
            allQuantities[ship] = getResourceDataObject('space', ['upgrades', ship, 'quantity']);
        });
    }        

    allQuantities.energy = getResourceDataObject('buildings', ['energy', 'quantity']);
    allQuantities.battery1 = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'quantity']);
    allQuantities.battery2 = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery2', 'quantity']);
    allQuantities.battery3 = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery3', 'quantity']);
    allQuantities.powerPlant1 = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
    allQuantities.powerPlant2 = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'quantity']);
    allQuantities.powerPlant3 = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'quantity']);

    allQuantities.spaceTelescope = null;
    allQuantities.launchPad = null;

    allQuantities.research = getResourceDataObject('research', ['quantity']);
    allQuantities.scienceKit = getResourceDataObject('research', ['upgrades', 'scienceKit', 'quantity']);
    allQuantities.scienceClub = getResourceDataObject('research', ['upgrades', 'scienceClub', 'quantity']);
    allQuantities.scienceLab = getResourceDataObject('research', ['upgrades', 'scienceLab', 'quantity']);

    return allQuantities;
}

function getAllStorages() {
    const resourceKeys = Object.keys(getResourceDataObject('resources'));
    const compoundKeys = Object.keys(getResourceDataObject('compounds'));

    const allStorages = {};

    resourceKeys.forEach(resource => {
        const resourceName = resource;
        allStorages[resourceName] = getResourceDataObject('resources', [resourceName, 'storageCapacity']);
    });

    compoundKeys.forEach(compound => {
        const compoundName = compound;
        allStorages[compoundName] = getResourceDataObject('compounds', [compoundName, 'storageCapacity']);
    });

    allStorages.energy = getResourceDataObject('buildings', ['energy', 'storageCapacity']);
    allStorages.battery1 = null;
    allStorages.battery2 = null;
    allStorages.battery3 = null;
    allStorages.powerPlant1 = null;
    allStorages.powerPlant2 = null;
    allStorages.powerPlant3 = null;

    allStorages.spaceTelescope = null;
    allStorages.launchPad = null;

    allStorages.research = null;
    allStorages.scienceKit = null;
    allStorages.scienceClub = null;
    allStorages.scienceLab = null;

    return allStorages;
}

function getAllElements(resourcesArray, compoundsArray) {
    const resourceNames = [];
    const compoundNames = [];

    const allElements = {};

    resourcesArray.forEach(resource => {
        if (!resourceNames.includes(resource[0])) {
            resourceNames.push(resource[0]);
            allElements[resource[0]] = getElements()[`${resource[0]}Quantity`];
            allElements[`${resource[0]}AB1Quantity`] = document.getElementById(`${resource[0]}AB1Quantity`);
            allElements[`${resource[0]}AB2Quantity`] = document.getElementById(`${resource[0]}AB2Quantity`);
            allElements[`${resource[0]}AB3Quantity`] = document.getElementById(`${resource[0]}AB3Quantity`);
            allElements[`${resource[0]}AB4Quantity`] = document.getElementById(`${resource[0]}AB4Quantity`);
        }
    });

    compoundsArray.forEach(compound => {
        if (!compoundNames.includes(compound[0])) {
            compoundNames.push(compound[0]);
            allElements[compound[0]] = getElements()[`${compound[0]}Quantity`];
            allElements[`${compound[0]}AB1Quantity`] = document.getElementById(`${compound[0]}AB1Quantity`);
            allElements[`${compound[0]}AB2Quantity`] = document.getElementById(`${compound[0]}AB2Quantity`);
            allElements[`${compound[0]}AB3Quantity`] = document.getElementById(`${compound[0]}AB3Quantity`);
            allElements[`${compound[0]}AB4Quantity`] = document.getElementById(`${compound[0]}AB4Quantity`);
        }
    });

    allElements.energy = getElements().energyQuantity;
    allElements.battery1 = getElements().battery1Quantity;
    allElements.battery2 = getElements().battery2Quantity;
    allElements.battery3 = getElements().battery3Quantity;
    allElements.powerPlant1 = getElements().powerPlant1Quantity;
    allElements.powerPlant2 = getElements().powerPlant2Quantity;
    allElements.powerPlant3 = getElements().powerPlant3Quantity;

    allElements.spaceTelescope = null;
    allElements.launchPad = null;  
    
    if (getCurrentOptionPane() === 'launch pad') {
        allElements.rocket1BuiltParts = document.getElementById('rocket1BuiltPartsQuantity');
        allElements.rocket1TotalParts = document.getElementById('rocket1TotalPartsQuantity');
    
        allElements.rocket2BuiltParts = document.getElementById('rocket2BuiltPartsQuantity');
        allElements.rocket2TotalParts = document.getElementById('rocket2TotalPartsQuantity');
    
        allElements.rocket3BuiltParts = document.getElementById('rocket3BuiltPartsQuantity');
        allElements.rocket3TotalParts = document.getElementById('rocket3TotalPartsQuantity');
    
        allElements.rocket4BuiltParts = document.getElementById('rocket4BuiltPartsQuantity');
        allElements.rocket4TotalParts = document.getElementById('rocket4TotalPartsQuantity');
    } else {
        allElements.rocket1BuiltParts = null;
        allElements.rocket1TotalParts = null;
    
        allElements.rocket2BuiltParts = null;
        allElements.rocket2TotalParts = null;
    
        allElements.rocket3BuiltParts = null;
        allElements.rocket3TotalParts = null;
    
        allElements.rocket4BuiltParts = null;
        allElements.rocket4TotalParts = null;
    }
    
    if (getCurrentOptionPane() === 'star ship') {
        allElements.ssStructuralBuiltParts = document.getElementById('ssStructuralBuiltPartsQuantity');
        allElements.ssStructuralTotalParts = document.getElementById('ssStructuralTotalPartsQuantity');
    
        allElements.ssLifeSupportBuiltParts = document.getElementById('ssLifeSupportBuiltPartsQuantity');
        allElements.ssLifeSupportTotalParts = document.getElementById('ssLifeSupportTotalPartsQuantity');
    
        allElements.ssAntimatterEngineBuiltParts = document.getElementById('ssAntimatterEngineBuiltPartsQuantity');
        allElements.ssAntimatterEngineTotalParts = document.getElementById('ssAntimatterEngineTotalPartsQuantity');
    
        allElements.ssFleetHangarBuiltParts = document.getElementById('ssFleetHangarBuiltPartsQuantity');
        allElements.ssFleetHangarTotalParts = document.getElementById('ssFleetHangarTotalPartsQuantity');
        
        allElements.ssStellarScannerBuiltParts = document.getElementById('ssStellarScannerBuiltPartsQuantity');
        allElements.ssStellarScannerTotalParts = document.getElementById('ssStellarScannerTotalPartsQuantity');
    } else {
        allElements.ssStructuralBuiltParts = null;
        allElements.ssStructuralTotalParts = null;
    
        allElements.ssLifeSupportBuiltParts = null;
        allElements.ssLifeSupportTotalParts = null;
    
        allElements.ssAntimatterEngineBuiltParts = null;
        allElements.ssAntimatterEngineTotalParts = null;
    
        allElements.ssFleetHangarBuiltParts = null;
        allElements.ssFleetHangarTotalParts = null;

        allElements.ssStellarScannerBuiltParts = null;
        allElements.ssStellarScannerTotalParts = null;
    }    

    if (getCurrentOptionPane() === 'fleet hangar') {
        allElements.fleetEnvoyQuantity = document.getElementById('fleetEnvoyBuiltQuantity');
        allElements.fleetEnvoyMax = document.getElementById('fleetEnvoyBuiltQuantityMax');
        allElements.fleetScoutQuantity = document.getElementById('fleetScoutBuiltQuantity');
        allElements.fleetMarauderQuantity = document.getElementById('fleetMarauderBuiltQuantity');
        allElements.fleetLandStalkerQuantity = document.getElementById('fleetLandStalkerBuiltQuantity');
        allElements.fleetNavalStraferQuantity = document.getElementById('fleetNavalStraferBuiltQuantity');
    } else {
        allElements.fleetEnvoyQuantity = null;
        allElements.fleetEnvoyMax = null;
        allElements.fleetScoutQuantity = null;
        allElements.fleetMarauderQuantity = null;
        allElements.fleetLandStalkerQuantity = null;
        allElements.fleetNavalStraferQuantity = null;
    } 

    allElements.research = getElements().researchQuantity;
    allElements.scienceKit = getElements().scienceKitQuantity;
    allElements.scienceClub = getElements().scienceClubQuantity;
    allElements.scienceLab = getElements().scienceLabQuantity;

    return allElements;
}

function getAllDynamicDescriptionElements(resourceTierPairs, compoundTierPairs) {
    const elements = {};

    resourceTierPairs.forEach(([resourceName, tier]) => {
        const resourceIncreaseStorageDescElement = document.getElementById(`${resourceName}IncreaseContainerSizeDescription`);
        const resourceStoragePrice = getResourceDataObject('resources', [resourceName, 'storageCapacity'] - 1); //to allow power to stay on we leave 1 if upgrading storage

        const resourceAutoBuyerDescElement = document.getElementById(`${resourceName}AutoBuyerTier${tier}Description`);
        const resourceAutoBuyerPrice = getResourceDataObject('resources', [resourceName, 'upgrades', 'autoBuyer', `tier${tier}`, 'price']);

        elements[`${resourceName}IncreaseStorage`] = { element: resourceIncreaseStorageDescElement, price: resourceStoragePrice, string1: `${capitaliseString(resourceName)}` };
        elements[`${resourceName}AutoBuyerTier${tier}`] = { element: resourceAutoBuyerDescElement, price: resourceAutoBuyerPrice, string1: `${capitaliseString(resourceName)}` };
    });

    compoundTierPairs.forEach(([compoundName, tier]) => {
        const compoundIncreaseStorageDescElement = document.getElementById(`${compoundName}IncreaseContainerSizeDescription`);
        const compoundStoragePrice = getResourceDataObject('compounds', [compoundName, 'storageCapacity'] - 1); //to allow power to stay on we leave 1 if upgrading storage

        const resourceAutoBuyerDescElement = document.getElementById(`${compoundName}AutoBuyerTier${tier}Description`);
        const resourceAutoBuyerPrice = getResourceDataObject('compounds', [compoundName, 'upgrades', 'autoBuyer', `tier${tier}`, 'price']);

        elements[`${compoundName}IncreaseStorage`] = { element: compoundIncreaseStorageDescElement, price: compoundStoragePrice, string1: `${capitaliseString(compoundName)}` };
        elements[`${compoundName}AutoBuyerTier${tier}`] = { element: resourceAutoBuyerDescElement, price: resourceAutoBuyerPrice, string1: `${capitaliseString(compoundName)}` };
    });

    const scienceElements = getScienceResourceDescriptionElements();
    const buildingsElements = getBuildingResourceDescriptionElements();
    const spaceMiningElements = getSpaceMiningResourceDescriptionElements();
    const starShipElements = getStarShipResourceDescriptionElements();
    const fleetElements = getFleetResourceDescriptionElements();
    const philosophyTechElements = getPhilosophyTechElements();

    Object.assign(elements, scienceElements, buildingsElements, spaceMiningElements, starShipElements, fleetElements, philosophyTechElements);

    return elements;
}

function getPhilosophyTechElements() {
    if (getCurrentOptionPane() === 'philosophy') {
        let abilityRow;
        let repeatable1Row;
        let repeatable2Row;
        let repeatable3Row;
        let repeatable4Row;

        let abilityPrice;
        let repeatable1RowPrice;
        let repeatable2RowPrice;
        let repeatable3RowPrice;
        let repeatable4RowPrice;
        
        switch(getPlayerPhilosophy()) {
            case 'constructor':
                abilityRow = document.getElementById('spaceStorageTankResearchDescription');
                abilityPrice = getResourceDataObject('philosophyRepeatableTechs', ['constructor', 'spaceStorageTankResearch', 'price']);
        
                repeatable1Row = document.getElementById('efficientAssemblyDescription');
                repeatable1RowPrice = getResourceDataObject('philosophyRepeatableTechs', ['constructor', 'efficientAssembly', 'price']);
        
                repeatable2Row = document.getElementById('laserMiningDescription');
                repeatable2RowPrice = getResourceDataObject('philosophyRepeatableTechs', ['constructor', 'laserMining', 'price']);
        
                repeatable3Row = document.getElementById('massCompoundAssemblyDescription');
                repeatable3RowPrice = getResourceDataObject('philosophyRepeatableTechs', ['constructor', 'massCompoundAssembly', 'price']);
        
                repeatable4Row = document.getElementById('energyDronesDescription');
                repeatable4RowPrice = getResourceDataObject('philosophyRepeatableTechs', ['constructor', 'energyDrones', 'price']);
                break;
        
            case 'supremacist':
                abilityRow = document.getElementById('fleetHologramsDescription');
                abilityPrice = getResourceDataObject('philosophyRepeatableTechs', ['supremacist', 'fleetHolograms', 'price']);
        
                repeatable1Row = document.getElementById('hangarAutomationDescription');
                repeatable1RowPrice = getResourceDataObject('philosophyRepeatableTechs', ['supremacist', 'hangarAutomation', 'price']);
        
                repeatable2Row = document.getElementById('syntheticPlatingDescription');
                repeatable2RowPrice = getResourceDataObject('philosophyRepeatableTechs', ['supremacist', 'syntheticPlating', 'price']);
        
                repeatable3Row = document.getElementById('antimatterEngineMinaturizationDescription');
                repeatable3RowPrice = getResourceDataObject('philosophyRepeatableTechs', ['supremacist', 'antimatterEngineMinaturization', 'price']);
        
                repeatable4Row = document.getElementById('laserIntensityResearchDescription');
                repeatable4RowPrice = getResourceDataObject('philosophyRepeatableTechs', ['supremacist', 'laserIntensityResearch', 'price']);
                break;
        
            case 'voidborn':
                abilityRow = document.getElementById('voidSeersDescription');
                abilityPrice = getResourceDataObject('philosophyRepeatableTechs', ['voidborn', 'voidSeers', 'price']);
        
                repeatable1Row = document.getElementById('stellarWhispersDescription');
                repeatable1RowPrice = getResourceDataObject('philosophyRepeatableTechs', ['voidborn', 'stellarWhispers', 'price']);
        
                repeatable2Row = document.getElementById('stellarInsightManifoldDescription');
                repeatable2RowPrice = getResourceDataObject('philosophyRepeatableTechs', ['voidborn', 'stellarInsightManifold', 'price']);
        
                repeatable3Row = document.getElementById('asteroidDwellersDescription');
                repeatable3RowPrice = getResourceDataObject('philosophyRepeatableTechs', ['voidborn', 'asteroidDwellers', 'price']);
        
                repeatable4Row = document.getElementById('ascendencyPhilosophyDescription');
                repeatable4RowPrice = getResourceDataObject('philosophyRepeatableTechs', ['voidborn', 'ascendencyPhilosophy', 'price']);
                break;
        
            case 'expansionist':
                abilityRow = document.getElementById('rapidExpansionDescription');
                abilityPrice = getResourceDataObject('philosophyRepeatableTechs', ['expansionist', 'rapidExpansion', 'price']);
        
                repeatable1Row = document.getElementById('spaceElevatorDescription');
                repeatable1RowPrice = getResourceDataObject('philosophyRepeatableTechs', ['expansionist', 'spaceElevator', 'price']);
        
                repeatable2Row = document.getElementById('launchPadMassProductionDescription');
                repeatable2RowPrice = getResourceDataObject('philosophyRepeatableTechs', ['expansionist', 'launchPadMassProduction', 'price']);
        
                repeatable3Row = document.getElementById('asteroidAttractorsDescription');
                repeatable3RowPrice = getResourceDataObject('philosophyRepeatableTechs', ['expansionist', 'asteroidAttractors', 'price']);
        
                repeatable4Row = document.getElementById('warpDriveDescription');
                repeatable4RowPrice = getResourceDataObject('philosophyRepeatableTechs', ['expansionist', 'warpDrive', 'price']);
                break;
        }        

        const abilityDescElement = abilityRow;
        const abilityPriceAmount = abilityPrice;
        
        const repeatable1DescElement = repeatable1Row;
        const repeatable1PriceAmount = repeatable1RowPrice;
        
        const repeatable2DescElement = repeatable2Row;
        const repeatable2PriceAmount = repeatable2RowPrice;
        
        const repeatable3DescElement = repeatable3Row;
        const repeatable3PriceAmount = repeatable3RowPrice;
        
        const repeatable4DescElement = repeatable4Row;
        const repeatable4PriceAmount = repeatable4RowPrice;
        
        return {
            abilityBuy: {
                element: abilityDescElement,
                price: abilityPriceAmount,
                string1: 'Research'
            },
            repeatable1Buy: {
                element: repeatable1DescElement,
                price: repeatable1PriceAmount,
                string1: 'Research'
            },
            repeatable2Buy: {
                element: repeatable2DescElement,
                price: repeatable2PriceAmount,
                string1: 'Research'
            },
            repeatable3Buy: {
                element: repeatable3DescElement,
                price: repeatable3PriceAmount,
                string1: 'Research'
            },
            repeatable4Buy: {
                element: repeatable4DescElement,
                price: repeatable4PriceAmount,
                string1: 'Research'
            }
        };        
    }
}

function getFleetResourceDescriptionElements() {
    const fleetEnvoyDescElement = document.getElementById('envoyDescription');
    const fleetEnvoyPrice = getResourceDataObject('space', ['upgrades', 'fleetEnvoy', 'price']);
    const fleetEnvoyResource1Price = getResourceDataObject('space', ['upgrades', 'fleetEnvoy', 'resource1Price'])[0];
    const fleetEnvoyResource2Price = getResourceDataObject('space', ['upgrades', 'fleetEnvoy', 'resource2Price'])[0];
    const fleetEnvoyResource3Price = getResourceDataObject('space', ['upgrades', 'fleetEnvoy', 'resource3Price'])[0];

    const fleetScoutDescElement = document.getElementById('scoutDescription');
    const fleetScoutPrice = getResourceDataObject('space', ['upgrades', 'fleetScout', 'price']);
    const fleetScoutResource1Price = getResourceDataObject('space', ['upgrades', 'fleetScout', 'resource1Price'])[0];
    const fleetScoutResource2Price = getResourceDataObject('space', ['upgrades', 'fleetScout', 'resource2Price'])[0];
    const fleetScoutResource3Price = getResourceDataObject('space', ['upgrades', 'fleetScout', 'resource3Price'])[0];

    const fleetMarauderDescElement = document.getElementById('marauderDescription');
    const fleetMarauderPrice = getResourceDataObject('space', ['upgrades', 'fleetMarauder', 'price']);
    const fleetMarauderResource1Price = getResourceDataObject('space', ['upgrades', 'fleetMarauder', 'resource1Price'])[0];
    const fleetMarauderResource2Price = getResourceDataObject('space', ['upgrades', 'fleetMarauder', 'resource2Price'])[0];
    const fleetMarauderResource3Price = getResourceDataObject('space', ['upgrades', 'fleetMarauder', 'resource3Price'])[0];

    const fleetLandStalkerDescElement = document.getElementById('landStalkerDescription');
    const fleetLandStalkerPrice = getResourceDataObject('space', ['upgrades', 'fleetLandStalker', 'price']);
    const fleetLandStalkerResource1Price = getResourceDataObject('space', ['upgrades', 'fleetLandStalker', 'resource1Price'])[0];
    const fleetLandStalkerResource2Price = getResourceDataObject('space', ['upgrades', 'fleetLandStalker', 'resource2Price'])[0];
    const fleetLandStalkerResource3Price = getResourceDataObject('space', ['upgrades', 'fleetLandStalker', 'resource3Price'])[0];

    const fleetNavalStraferDescElement = document.getElementById('navalStraferDescription');
    const fleetNavalStraferPrice = getResourceDataObject('space', ['upgrades', 'fleetNavalStrafer', 'price']);
    const fleetNavalStraferResource1Price = getResourceDataObject('space', ['upgrades', 'fleetNavalStrafer', 'resource1Price'])[0];
    const fleetNavalStraferResource2Price = getResourceDataObject('space', ['upgrades', 'fleetNavalStrafer', 'resource2Price'])[0];
    const fleetNavalStraferResource3Price = getResourceDataObject('space', ['upgrades', 'fleetNavalStrafer', 'resource3Price'])[0];

    return {
        fleetEnvoyBuy: { 
            element: fleetEnvoyDescElement,
            price: fleetEnvoyPrice,
            resource1Price: fleetEnvoyResource1Price,
            resource2Price: fleetEnvoyResource2Price,
            resource3Price: fleetEnvoyResource3Price,
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('space', ['upgrades', 'fleetEnvoy', 'resource1Price'])[1]),
            string3: capitaliseString(getResourceDataObject('space', ['upgrades', 'fleetEnvoy', 'resource2Price'])[1]),
            string4: capitaliseString(getResourceDataObject('space', ['upgrades', 'fleetEnvoy', 'resource3Price'])[1])
        },
        fleetScoutBuy: { 
            element: fleetScoutDescElement,
            price: fleetScoutPrice,
            resource1Price: fleetScoutResource1Price,
            resource2Price: fleetScoutResource2Price,
            resource3Price: fleetScoutResource3Price,
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('space', ['upgrades', 'fleetScout', 'resource1Price'])[1]),
            string3: capitaliseString(getResourceDataObject('space', ['upgrades', 'fleetScout', 'resource2Price'])[1]),
            string4: capitaliseString(getResourceDataObject('space', ['upgrades', 'fleetScout', 'resource3Price'])[1])
        },
        fleetMarauderBuy: { 
            element: fleetMarauderDescElement,
            price: fleetMarauderPrice,
            resource1Price: fleetMarauderResource1Price,
            resource2Price: fleetMarauderResource2Price,
            resource3Price: fleetMarauderResource3Price,
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('space', ['upgrades', 'fleetMarauder', 'resource1Price'])[1]),
            string3: capitaliseString(getResourceDataObject('space', ['upgrades', 'fleetMarauder', 'resource2Price'])[1]),
            string4: capitaliseString(getResourceDataObject('space', ['upgrades', 'fleetMarauder', 'resource3Price'])[1])
        },
        fleetLandStalkerBuy: { 
            element: fleetLandStalkerDescElement,
            price: fleetLandStalkerPrice,
            resource1Price: fleetLandStalkerResource1Price,
            resource2Price: fleetLandStalkerResource2Price,
            resource3Price: fleetLandStalkerResource3Price,
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('space', ['upgrades', 'fleetLandStalker', 'resource1Price'])[1]),
            string3: capitaliseString(getResourceDataObject('space', ['upgrades', 'fleetLandStalker', 'resource2Price'])[1]),
            string4: capitaliseString(getResourceDataObject('space', ['upgrades', 'fleetLandStalker', 'resource3Price'])[1])
        },
        fleetNavalStraferBuy: { 
            element: fleetNavalStraferDescElement,
            price: fleetNavalStraferPrice,
            resource1Price: fleetNavalStraferResource1Price,
            resource2Price: fleetNavalStraferResource2Price,
            resource3Price: fleetNavalStraferResource3Price,
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('space', ['upgrades', 'fleetNavalStrafer', 'resource1Price'])[1]),
            string3: capitaliseString(getResourceDataObject('space', ['upgrades', 'fleetNavalStrafer', 'resource2Price'])[1]),
            string4: capitaliseString(getResourceDataObject('space', ['upgrades', 'fleetNavalStrafer', 'resource3Price'])[1])
        }
    };
}

function getScienceResourceDescriptionElements() {
    const scienceKitBuyDescElement = document.getElementById('scienceKitDescription');
    const scienceKitBuyPrice = getResourceDataObject('research', ['upgrades', 'scienceKit', 'price']);
    const scienceKitBuyResource1Price = getResourceDataObject('research', ['upgrades', 'scienceKit', 'resource1Price'])[0];
    const scienceKitBuyResource2Price = getResourceDataObject('research', ['upgrades', 'scienceKit', 'resource2Price'])[0];
    const scienceKitBuyResource3Price = getResourceDataObject('research', ['upgrades', 'scienceKit', 'resource3Price'])[0];

    const scienceClubBuyDescElement = document.getElementById('openScienceClubDescription');
    const scienceClubBuyPrice = getResourceDataObject('research', ['upgrades', 'scienceClub', 'price']);
    const scienceClubBuyResource1Price = getResourceDataObject('research', ['upgrades', 'scienceClub', 'resource1Price'])[0];
    const scienceClubBuyResource2Price = getResourceDataObject('research', ['upgrades', 'scienceClub', 'resource2Price'])[0];
    const scienceClubBuyResource3Price = getResourceDataObject('research', ['upgrades', 'scienceClub', 'resource3Price'])[0];

    const scienceLabBuyDescElement = document.getElementById('openScienceLabDescription');
    const scienceLabBuyPrice = getResourceDataObject('research', ['upgrades', 'scienceLab', 'price']);
    const scienceLabBuyResource1Price = getResourceDataObject('research', ['upgrades', 'scienceLab', 'resource1Price'])[0];
    const scienceLabBuyResource2Price = getResourceDataObject('research', ['upgrades', 'scienceLab', 'resource2Price'])[0];
    const scienceLabBuyResource3Price = getResourceDataObject('research', ['upgrades', 'scienceLab', 'resource3Price'])[0];

    return {
        scienceKitBuy: { 
            element: scienceKitBuyDescElement, 
            price: scienceKitBuyPrice, 
            resource1Price: scienceKitBuyResource1Price, 
            resource2Price: scienceKitBuyResource2Price, 
            resource3Price: scienceKitBuyResource3Price, 
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('research', ['upgrades', 'scienceKit', 'resource1Price'])[1]),
            string3: capitaliseString(getResourceDataObject('research', ['upgrades', 'scienceKit', 'resource2Price'])[1]),
            string4: capitaliseString(getResourceDataObject('research', ['upgrades', 'scienceKit', 'resource3Price'])[1])
        },
        scienceClubBuy: { 
            element: scienceClubBuyDescElement, 
            price: scienceClubBuyPrice, 
            resource1Price: scienceClubBuyResource1Price, 
            resource2Price: scienceClubBuyResource2Price, 
            resource3Price: scienceClubBuyResource3Price, 
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('research', ['upgrades', 'scienceClub', 'resource1Price'])[1]),
            string3: capitaliseString(getResourceDataObject('research', ['upgrades', 'scienceClub', 'resource2Price'])[1]),
            string4: capitaliseString(getResourceDataObject('research', ['upgrades', 'scienceClub', 'resource3Price'])[1])
        },
        scienceLabBuy: { 
            element: scienceLabBuyDescElement, 
            price: scienceLabBuyPrice, 
            resource1Price: scienceLabBuyResource1Price, 
            resource2Price: scienceLabBuyResource2Price, 
            resource3Price: scienceLabBuyResource3Price, 
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('research', ['upgrades', 'scienceLab', 'resource1Price'])[1]),
            string3: capitaliseString(getResourceDataObject('research', ['upgrades', 'scienceLab', 'resource2Price'])[1]),
            string4: capitaliseString(getResourceDataObject('research', ['upgrades', 'scienceLab', 'resource3Price'])[1])
        }
    };
}

function getBuildingResourceDescriptionElements() {
    const battery1BuyDescElement = document.getElementById('sodiumIonBatteryDescription');
    const battery1BuyPrice = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'price']);
    const battery1BuyResource1Price = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource1Price'])[0];
    const battery1BuyResource2Price = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource2Price'])[0];
    const battery1BuyResource3Price = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource3Price'])[0];

    const battery2BuyDescElement = document.getElementById('battery2Description');
    const battery2BuyPrice = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery2', 'price']);
    const battery2BuyResource1Price = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery2', 'resource1Price'])[0];
    const battery2BuyResource2Price = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery2', 'resource2Price'])[0];
    const battery2BuyResource3Price = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery2', 'resource3Price'])[0];

    const battery3BuyDescElement = document.getElementById('battery3Description');
    const battery3BuyPrice = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery3', 'price']);
    const battery3BuyResource1Price = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery3', 'resource1Price'])[0];
    const battery3BuyResource2Price = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery3', 'resource2Price'])[0];
    const battery3BuyResource3Price = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery3', 'resource3Price'])[0];

    const powerPlant1BuyDescElement = document.getElementById('powerPlantDescription');
    const powerPlant1BuyPrice = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'price']);
    const powerPlant1BuyResource1Price = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'resource1Price'])[0];
    const powerPlant1BuyResource2Price = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'resource2Price'])[0];
    const powerPlant1BuyResource3Price = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'resource3Price'])[0];

    const powerPlant2BuyDescElement = document.getElementById('solarPowerPlantDescription');
    const powerPlant2BuyPrice = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'price']);
    const powerPlant2BuyResource1Price = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'resource1Price'])[0];
    const powerPlant2BuyResource2Price = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'resource2Price'])[0];
    const powerPlant2BuyResource3Price = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'resource3Price'])[0];

    const powerPlant3BuyDescElement = document.getElementById('advancedPowerPlantDescription');
    const powerPlant3BuyPrice = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'price']);
    const powerPlant3BuyResource1Price = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'resource1Price'])[0];
    const powerPlant3BuyResource2Price = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'resource2Price'])[0];
    const powerPlant3BuyResource3Price = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'resource3Price'])[0];

    return {
        battery1Buy: { 
            element: battery1BuyDescElement, 
            price: battery1BuyPrice, 
            resource1Price: battery1BuyResource1Price, 
            resource2Price: battery1BuyResource2Price, 
            resource3Price: battery1BuyResource3Price, 
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource1Price'])[1]), 
            string3: capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource2Price'])[1]), 
            string4: capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource3Price'])[1]) 
        },
        battery2Buy: { 
            element: battery2BuyDescElement, 
            price: battery2BuyPrice, 
            resource1Price: battery2BuyResource1Price, 
            resource2Price: battery2BuyResource2Price, 
            resource3Price: battery2BuyResource3Price, 
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery2', 'resource1Price'])[1]), 
            string3: capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery2', 'resource2Price'])[1]), 
            string4: capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery2', 'resource3Price'])[1]) 
        },
        battery3Buy: { 
            element: battery3BuyDescElement, 
            price: battery3BuyPrice, 
            resource1Price: battery3BuyResource1Price, 
            resource2Price: battery3BuyResource2Price, 
            resource3Price: battery3BuyResource3Price, 
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery3', 'resource1Price'])[1]), 
            string3: capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery3', 'resource2Price'])[1]), 
            string4: capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery3', 'resource3Price'])[1]) 
        },
        powerPlant1Buy: { 
            element: powerPlant1BuyDescElement, 
            price: powerPlant1BuyPrice, 
            resource1Price: powerPlant1BuyResource1Price, 
            resource2Price: powerPlant1BuyResource2Price, 
            resource3Price: powerPlant1BuyResource3Price, 
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'resource1Price'])[1]), 
            string3: capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'resource2Price'])[1]), 
            string4: capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'resource3Price'])[1]) 
        },
        powerPlant2Buy: { 
            element: powerPlant2BuyDescElement, 
            price: powerPlant2BuyPrice, 
            resource1Price: powerPlant2BuyResource1Price, 
            resource2Price: powerPlant2BuyResource2Price, 
            resource3Price: powerPlant2BuyResource3Price, 
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'resource1Price'])[1]), 
            string3: capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'resource2Price'])[1]), 
            string4: capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'resource3Price'])[1]) 
        },
        powerPlant3Buy: { 
            element: powerPlant3BuyDescElement, 
            price: powerPlant3BuyPrice, 
            resource1Price: powerPlant3BuyResource1Price, 
            resource2Price: powerPlant3BuyResource2Price, 
            resource3Price: powerPlant3BuyResource3Price, 
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'resource1Price'])[1]), 
            string3: capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'resource2Price'])[1]), 
            string4: capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'resource3Price'])[1])  
        }        
    };
}

function getStarShipResourceDescriptionElements() {
    const ssStructuralBuyDescElement = document.getElementById('structuralDescription');
    const ssStructuralBuyPrice = getResourceDataObject('space', ['upgrades', 'ssStructural', 'price']);
    const ssStructuralBuyResource1Price = getResourceDataObject('space', ['upgrades', 'ssStructural', 'resource1Price'])[0];
    const ssStructuralBuyResource2Price = getResourceDataObject('space', ['upgrades', 'ssStructural', 'resource2Price'])[0];
    const ssStructuralBuyResource3Price = getResourceDataObject('space', ['upgrades', 'ssStructural', 'resource3Price'])[0];

    const ssLifeSupportBuyDescElement = document.getElementById('lifeSupportModuleDescription');
    const ssLifeSupportBuyPrice = getResourceDataObject('space', ['upgrades', 'ssLifeSupport', 'price']);
    const ssLifeSupportBuyResource1Price = getResourceDataObject('space', ['upgrades', 'ssLifeSupport', 'resource1Price'])[0];
    const ssLifeSupportBuyResource2Price = getResourceDataObject('space', ['upgrades', 'ssLifeSupport', 'resource2Price'])[0];
    const ssLifeSupportBuyResource3Price = getResourceDataObject('space', ['upgrades', 'ssLifeSupport', 'resource3Price'])[0];

    const ssAntimatterEngineBuyDescElement = document.getElementById('antimatterEngineDescription');
    const ssAntimatterEngineBuyPrice = getResourceDataObject('space', ['upgrades', 'ssAntimatterEngine', 'price']);
    const ssAntimatterEngineBuyResource1Price = getResourceDataObject('space', ['upgrades', 'ssAntimatterEngine', 'resource1Price'])[0];
    const ssAntimatterEngineBuyResource2Price = getResourceDataObject('space', ['upgrades', 'ssAntimatterEngine', 'resource2Price'])[0];
    const ssAntimatterEngineBuyResource3Price = getResourceDataObject('space', ['upgrades', 'ssAntimatterEngine', 'resource3Price'])[0];

    const ssFleetHangarBuyDescElement = document.getElementById('fleetHangarDescription');
    const ssFleetHangarBuyPrice = getResourceDataObject('space', ['upgrades', 'ssFleetHangar', 'price']);
    const ssFleetHangarBuyResource1Price = getResourceDataObject('space', ['upgrades', 'ssFleetHangar', 'resource1Price'])[0];
    const ssFleetHangarBuyResource2Price = getResourceDataObject('space', ['upgrades', 'ssFleetHangar', 'resource2Price'])[0];
    const ssFleetHangarBuyResource3Price = getResourceDataObject('space', ['upgrades', 'ssFleetHangar', 'resource3Price'])[0];
    
    const ssStellarScannerBuyDescElement = document.getElementById('stellarScannerDescription');
    const ssStellarScannerBuyPrice = getResourceDataObject('space', ['upgrades', 'ssStellarScanner', 'price']);
    const ssStellarScannerBuyResource1Price = getResourceDataObject('space', ['upgrades', 'ssStellarScanner', 'resource1Price'])[0];
    const ssStellarScannerBuyResource2Price = getResourceDataObject('space', ['upgrades', 'ssStellarScanner', 'resource2Price'])[0];
    const ssStellarScannerBuyResource3Price = getResourceDataObject('space', ['upgrades', 'ssStellarScanner', 'resource3Price'])[0];
    return {
        ssStructuralBuy: { 
            element: ssStructuralBuyDescElement,
            price: ssStructuralBuyPrice,
            resource1Price: ssStructuralBuyResource1Price,
            resource2Price: ssStructuralBuyResource2Price,
            resource3Price: ssStructuralBuyResource3Price,
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('space', ['upgrades', 'ssStructural', 'resource1Price'])[1]),
            string3: capitaliseString(getResourceDataObject('space', ['upgrades', 'ssStructural', 'resource2Price'])[1]),
            string4: capitaliseString(getResourceDataObject('space', ['upgrades', 'ssStructural', 'resource3Price'])[1])
        },
        ssLifeSupportBuy: { 
            element: ssLifeSupportBuyDescElement,
            price: ssLifeSupportBuyPrice,
            resource1Price: ssLifeSupportBuyResource1Price,
            resource2Price: ssLifeSupportBuyResource2Price,
            resource3Price: ssLifeSupportBuyResource3Price,
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('space', ['upgrades', 'ssLifeSupport', 'resource1Price'])[1]),
            string3: capitaliseString(getResourceDataObject('space', ['upgrades', 'ssLifeSupport', 'resource2Price'])[1]),
            string4: capitaliseString(getResourceDataObject('space', ['upgrades', 'ssLifeSupport', 'resource3Price'])[1])
        },
        ssAntimatterEngineBuy: { 
            element: ssAntimatterEngineBuyDescElement,
            price: ssAntimatterEngineBuyPrice,
            resource1Price: ssAntimatterEngineBuyResource1Price,
            resource2Price: ssAntimatterEngineBuyResource2Price,
            resource3Price: ssAntimatterEngineBuyResource3Price,
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('space', ['upgrades', 'ssAntimatterEngine', 'resource1Price'])[1]),
            string3: capitaliseString(getResourceDataObject('space', ['upgrades', 'ssAntimatterEngine', 'resource2Price'])[1]),
            string4: capitaliseString(getResourceDataObject('space', ['upgrades', 'ssAntimatterEngine', 'resource3Price'])[1])
        },
        ssFleetHangarBuy: { 
            element: ssFleetHangarBuyDescElement,
            price: ssFleetHangarBuyPrice,
            resource1Price: ssFleetHangarBuyResource1Price,
            resource2Price: ssFleetHangarBuyResource2Price,
            resource3Price: ssFleetHangarBuyResource3Price,
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('space', ['upgrades', 'ssFleetHangar', 'resource1Price'])[1]),
            string3: capitaliseString(getResourceDataObject('space', ['upgrades', 'ssFleetHangar', 'resource2Price'])[1]),
            string4: capitaliseString(getResourceDataObject('space', ['upgrades', 'ssFleetHangar', 'resource3Price'])[1])
        },
        ssStellarScannerBuy: { 
            element: ssStellarScannerBuyDescElement,
            price: ssStellarScannerBuyPrice,
            resource1Price: ssStellarScannerBuyResource1Price,
            resource2Price: ssStellarScannerBuyResource2Price,
            resource3Price: ssStellarScannerBuyResource3Price,
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('space', ['upgrades', 'ssStellarScanner', 'resource1Price'])[1]),
            string3: capitaliseString(getResourceDataObject('space', ['upgrades', 'ssStellarScanner', 'resource2Price'])[1]),
            string4: capitaliseString(getResourceDataObject('space', ['upgrades', 'ssStellarScanner', 'resource3Price'])[1])
        }
    };
}

function getSpaceMiningResourceDescriptionElements() {
    const spaceTelescopeBuyDescElement = document.getElementById('spaceTelescopeDescription');
    const spaceTelescopeBuyPrice = getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'price']);
    const spaceTelescopeBuyResource1Price = getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'resource1Price'])[0];
    const spaceTelescopeBuyResource2Price = getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'resource2Price'])[0];
    const spaceTelescopeBuyResource3Price = getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'resource3Price'])[0];

    const launchPadBuyDescElement = document.getElementById('launchPadDescription');
    const launchPadBuyPrice = getResourceDataObject('space', ['upgrades', 'launchPad', 'price']);
    const launchPadBuyResource1Price = getResourceDataObject('space', ['upgrades', 'launchPad', 'resource1Price'])[0];
    const launchPadBuyResource2Price = getResourceDataObject('space', ['upgrades', 'launchPad', 'resource2Price'])[0];
    const launchPadBuyResource3Price = getResourceDataObject('space', ['upgrades', 'launchPad', 'resource3Price'])[0];

    const rocket1BuyDescElement = document.getElementById('rocketMiner1Description');
    const rocket1BuyPrice = getResourceDataObject('space', ['upgrades', 'rocket1', 'price']);
    const rocket1BuyResource1Price = getResourceDataObject('space', ['upgrades', 'rocket1', 'resource1Price'])[0];
    const rocket1BuyResource2Price = getResourceDataObject('space', ['upgrades', 'rocket1', 'resource2Price'])[0];
    const rocket1BuyResource3Price = getResourceDataObject('space', ['upgrades', 'rocket1', 'resource3Price'])[0];

    const rocket2BuyDescElement = document.getElementById('rocketMiner2Description');
    const rocket2BuyPrice = getResourceDataObject('space', ['upgrades', 'rocket2', 'price']);
    const rocket2BuyResource1Price = getResourceDataObject('space', ['upgrades', 'rocket2', 'resource1Price'])[0];
    const rocket2BuyResource2Price = getResourceDataObject('space', ['upgrades', 'rocket2', 'resource2Price'])[0];
    const rocket2BuyResource3Price = getResourceDataObject('space', ['upgrades', 'rocket2', 'resource3Price'])[0];

    const rocket3BuyDescElement = document.getElementById('rocketMiner3Description');
    const rocket3BuyPrice = getResourceDataObject('space', ['upgrades', 'rocket3', 'price']);
    const rocket3BuyResource1Price = getResourceDataObject('space', ['upgrades', 'rocket3', 'resource1Price'])[0];
    const rocket3BuyResource2Price = getResourceDataObject('space', ['upgrades', 'rocket3', 'resource2Price'])[0];
    const rocket3BuyResource3Price = getResourceDataObject('space', ['upgrades', 'rocket3', 'resource3Price'])[0];

    const rocket4BuyDescElement = document.getElementById('rocketMiner4Description');
    const rocket4BuyPrice = getResourceDataObject('space', ['upgrades', 'rocket4', 'price']);
    const rocket4BuyResource1Price = getResourceDataObject('space', ['upgrades', 'rocket4', 'resource1Price'])[0];
    const rocket4BuyResource2Price = getResourceDataObject('space', ['upgrades', 'rocket4', 'resource2Price'])[0];
    const rocket4BuyResource3Price = getResourceDataObject('space', ['upgrades', 'rocket4', 'resource3Price'])[0];

    return {
        spaceTelescopeBuy: { 
            element: spaceTelescopeBuyDescElement, 
            price: spaceTelescopeBuyPrice, 
            resource1Price: spaceTelescopeBuyResource1Price, 
            resource2Price: spaceTelescopeBuyResource2Price, 
            resource3Price: spaceTelescopeBuyResource3Price, 
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'resource1Price'])[1]), 
            string3: capitaliseString(getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'resource2Price'])[1]), 
            string4: capitaliseString(getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'resource3Price'])[1]) 
        },
        launchPadBuy: { 
            element: launchPadBuyDescElement, 
            price: launchPadBuyPrice, 
            resource1Price: launchPadBuyResource1Price, 
            resource2Price: launchPadBuyResource2Price, 
            resource3Price: launchPadBuyResource3Price, 
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('space', ['upgrades', 'launchPad', 'resource1Price'])[1]), 
            string3: capitaliseString(getResourceDataObject('space', ['upgrades', 'launchPad', 'resource2Price'])[1]), 
            string4: capitaliseString(getResourceDataObject('space', ['upgrades', 'launchPad', 'resource3Price'])[1]) 
        },
        rocket1Buy: { 
            element: rocket1BuyDescElement,
            price: rocket1BuyPrice,
            resource1Price: rocket1BuyResource1Price,
            resource2Price: rocket1BuyResource2Price,
            resource3Price: rocket1BuyResource3Price,
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('space', ['upgrades', 'rocket1', 'resource1Price'])[1]),
            string3: capitaliseString(getResourceDataObject('space', ['upgrades', 'rocket1', 'resource2Price'])[1]),
            string4: capitaliseString(getResourceDataObject('space', ['upgrades', 'rocket1', 'resource3Price'])[1])
        },
        rocket2Buy: { 
            element: rocket2BuyDescElement,
            price: rocket2BuyPrice,
            resource1Price: rocket2BuyResource1Price,
            resource2Price: rocket2BuyResource2Price,
            resource3Price: rocket2BuyResource3Price,
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('space', ['upgrades', 'rocket2', 'resource1Price'])[1]),
            string3: capitaliseString(getResourceDataObject('space', ['upgrades', 'rocket2', 'resource2Price'])[1]),
            string4: capitaliseString(getResourceDataObject('space', ['upgrades', 'rocket2', 'resource3Price'])[1])
        },
        rocket3Buy: { 
            element: rocket3BuyDescElement,
            price: rocket3BuyPrice,
            resource1Price: rocket3BuyResource1Price,
            resource2Price: rocket3BuyResource2Price,
            resource3Price: rocket3BuyResource3Price,
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('space', ['upgrades', 'rocket3', 'resource1Price'])[1]),
            string3: capitaliseString(getResourceDataObject('space', ['upgrades', 'rocket3', 'resource2Price'])[1]),
            string4: capitaliseString(getResourceDataObject('space', ['upgrades', 'rocket3', 'resource3Price'])[1])
        },
        rocket4Buy: { 
            element: rocket4BuyDescElement,
            price: rocket4BuyPrice,
            resource1Price: rocket4BuyResource1Price,
            resource2Price: rocket4BuyResource2Price,
            resource3Price: rocket4BuyResource3Price,
            string1: getCurrencySymbol(),
            string2: capitaliseString(getResourceDataObject('space', ['upgrades', 'rocket4', 'resource1Price'])[1]),
            string3: capitaliseString(getResourceDataObject('space', ['upgrades', 'rocket4', 'resource2Price'])[1]),
            string4: capitaliseString(getResourceDataObject('space', ['upgrades', 'rocket4', 'resource3Price'])[1])
        }
    };       
}

function updateUIQuantities(allQuantities, allStorages, allElements, allDescriptionElements) {
    for (const item in allQuantities) {
        if (allQuantities.hasOwnProperty(item)) {
            const quantity = allQuantities[item];
            const storage = allStorages[item];
            const element = allElements[item];

            updateQuantityDisplays(element, quantity, storage, null, null, null, false);
        }

        if (item.startsWith('science')) {
            const quantityScienceBuilding = allQuantities[item];
            const element = document.getElementById(`${item}Quantity`);
            if (element && quantityScienceBuilding) {
                element.textContent = `Quantity: ${quantityScienceBuilding}`;
            }
        }

        if (item.includes('AB')) {
            let tier;
            const quantityAutoBuyer = allQuantities[item];

            const match = item.match(/AB(\d+)/);
            if (match) {
                tier = parseInt(match[1], 10);
            } else {
                return null;
            }

            const element = document.getElementById(item);
            if (element) {
                element.textContent = `Quantity: ${quantityAutoBuyer}`;
            }
        }

        if (item.startsWith('rocket') || item.startsWith('ss')) {
            const quantity = allQuantities[item];
            if (quantity || quantity === 0) {
                const partsCountText = document.getElementById(`${item}PartsCountText`);
                const getTotalPartsNeeded = item.startsWith('rocket') 
                    ? getRocketPartsNeededInTotalPerRocket 
                    : getStarShipPartsNeededInTotalPerModule;

                partsCountText.innerHTML = `Built: <span id="${item}BuiltPartsQuantity">${quantity}</span> / <span id="${item}TotalPartsQuantity">${getTotalPartsNeeded(item)}</span>`;
            }
        }

        if (item.startsWith('fleet')) {
            const quantity = allQuantities[item];
            if (quantity || quantity === 0) {
                const quantityText = document.getElementById(`${item}QuantityText`);
                quantityText.innerHTML = item === 'fleetEnvoy'
                    ? `Quantity: <span id="${item}BuiltQuantity">${quantity}</span> / <span id="${item}BuiltQuantityMax">${getMaxFleetShip(item)}</span>`
                    : `Quantity: <span id="${item}BuiltQuantity">${quantity}</span>`;
            }
        }        
    }

    for (const allDescriptionElement in allDescriptionElements) {
        let resource1Price;
        let resource2Price;
        let resource3Price;

        if (allDescriptionElements.hasOwnProperty(allDescriptionElement)) {
            const price = allDescriptionElements[allDescriptionElement].price;

            if (allDescriptionElement.endsWith("Buy")) { //if can cost cash or resources ie science or building
                resource1Price = allDescriptionElements[allDescriptionElement].resource1Price;
                resource2Price = allDescriptionElements[allDescriptionElement].resource2Price;
                resource3Price = allDescriptionElements[allDescriptionElement].resource3Price;
            }

            const costResourceOrCompoundName1 = allDescriptionElements[allDescriptionElement].string1;
            const costResourceOrCompoundName2 = allDescriptionElements[allDescriptionElement].string2;
            const costResourceOrCompoundName3 = allDescriptionElements[allDescriptionElement].string3;
            const costResourceOrCompoundName4 = allDescriptionElements[allDescriptionElement].string4;

            const element = allDescriptionElements[allDescriptionElement].element;

            const resourceData1 = [resource1Price, costResourceOrCompoundName2];
            const resourceData2 = [resource2Price, costResourceOrCompoundName3];
            const resourceData3 = [resource3Price, costResourceOrCompoundName4];

            updateQuantityDisplays(element, price, costResourceOrCompoundName1, resourceData1, resourceData2, resourceData3, true);
        } 
    }
}

function manageTabSpecificUi() {
    const currentTab = getCurrentTab();
    if (currentTab.includes("???")) {
        return;
    }

    const tabElements = document.querySelectorAll(`.tab-${currentTab}`);
    const allTabElements = document.querySelectorAll('[class^="tab-"]');
    allTabElements.forEach(element => {
        const tabNumberMatch = element.className.match(/tab-(\d+)/);
        if (tabNumberMatch) {
            const tabNumber = parseInt(tabNumberMatch[1], 10);

            if (tabNumber !== currentTab) {
                element.classList.remove('d-flex');
                element.classList.add('d-none');
            }
        }
    });

    if (tabElements.length > 0) {
        tabElements.forEach(element => {
            element.classList.remove('d-none');
            element.classList.add('d-flex');
        });

        //console.log(`Showing UI for Tab ${currentTab}.`);
    } else {
        //console.log(`No tab-specific UI to show for Tab ${currentTab}, but other tabs are hidden.`);
    }
}

function monitorRevealResourcesCheck() {
    let revealStatus;
    let resourceElementId;

    const resourceKeys = Object.keys(getResourceDataObject('resources'));

    for (const resource of resourceKeys) {
        revealStatus = getResourceDataObject('resources', [resource, 'revealedYet']);
        resourceElementId = resource + "Option";
        if (revealStatus) {
            document.getElementById(resourceElementId).parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.classList.remove('invisible');
            document.getElementById(resourceElementId).parentElement.parentElement.parentElement.parentElement.classList.remove('invisible');
            document.getElementById(resourceElementId).parentElement.parentElement.classList.remove('invisible');
        }
    }
}

function monitorRevealCompoundsCheck() {
    let revealTech;
    const compoundKeys = Object.keys(getResourceDataObject('compounds'));

    for (const compound of compoundKeys) {
        revealTech = getResourceDataObject('compounds', [compound, 'revealedBy']);
        const compoundElementId = compound + "Option";
        if (getTechUnlockedArray().includes(revealTech)) {
            document.getElementById(compoundElementId).parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.classList.remove('invisible');
            document.getElementById(compoundElementId).parentElement.parentElement.parentElement.parentElement.classList.remove('invisible');
            document.getElementById(compoundElementId).parentElement.parentElement.classList.remove('invisible');
        }
    }
}

function updateAntimatterAndDiagram() {
    const antimatterTotalQuantity = getResourceDataObject('antimatter', ['quantity']);
    const miningObject = getMiningObject();
    const asteroidsBeingMined = getAsteroidArray();
    const elements = getElements();

    if (getPermanentAntimatterUnlock() && !getAntimatterUnlocked()) {
        setAntimatterUnlocked(true);
    }
    
    asteroidsBeingMined.forEach(obj => {
        const asteroidName = Object.keys(obj)[0];
        const isBeingMined = Object.values(miningObject).includes(asteroidName);
    
        if (obj[asteroidName]) {
            obj[asteroidName].beingMined = isBeingMined;
            changeAsteroidArray(asteroidName, "beingMined", obj[asteroidName].beingMined);
        }
    });

    const rocketData = {};
    let totalAntimatterExtractionRate = 0;

    for (let i = 1; i <= 4; i++) {
        const rocketName = `rocket${i}`;
        const rocketKey = getMiningObject()[rocketName];
        const asteroid = getAsteroidArray().find(asteroid => asteroid[rocketKey])?.[rocketKey];

        if (asteroid) {
            rocketData[`rocket${i}`] = [
                `Rocket ${i}`,
                asteroid.name,
                asteroid.easeOfExtraction[0],
                getSpecificAsteroidExtractionRate(asteroid),
                asteroid.quantity[0]
            ];
        } else {
            rocketData[`rocket${i}`] = null;
        }

        if (
            rocketKey &&
            asteroid &&
            asteroid.quantity[0] <= 0 &&
            !getRocketDirection(rocketName) &&
            !getCurrentlyTravellingToAsteroid(rocketName)
        ) {
            setRocketDirection(rocketName, true);
            sfxPlayer.playAudio('rocketLaunch', false);
            startTravelToAndFromAsteroidTimer([0, 'returning'], rocketName, true);
            boostAntimatterRate(false);
            continue;
        }

        if (asteroid && asteroid.beingMined) {
            let quantityAntimatterClass = 'none';
            const baseExtractionRate = rocketData[`rocket${i}`][3];
            let extractionRate = baseExtractionRate;
            extractionRate *= (1 + (getBuffEnhancedMiningData()['boughtYet'] * getBuffEnhancedMiningData()['effectCategoryMagnitude']));
            
            if (getIsAntimatterBoostActive()) {
                extractionRate *= getBoostRate();
            }

            const actualExtraction = Math.min(extractionRate, asteroid.quantity[0]);
            const newQuantityAntimatterAsteroid = Math.max(0, asteroid.quantity[0] - actualExtraction);
            const quantityPercentage = (newQuantityAntimatterAsteroid / asteroid.originalQuantity) * 100;
            const asteroidDepleted = newQuantityAntimatterAsteroid === 0 && asteroid.quantity[0] > 0;

            totalAntimatterExtractionRate += actualExtraction;
            rocketData[`rocket${i}`][3] = asteroidDepleted ? 0 : baseExtractionRate;

            if (asteroidDepleted && !getRocketDirection(`rocket${i}`)) {
                setRocketDirection(`rocket${i}`, true); //set rocket returning
                sfxPlayer.playAudio('rocketLaunch', false);
                startTravelToAndFromAsteroidTimer([0, 'returning'], `rocket${i}`, getRocketDirection(`rocket${i}`));
                boostAntimatterRate(false);
            }

            if (quantityPercentage > 90) {
                quantityAntimatterClass = 'ready-text';
            } else if (quantityPercentage > 50) {
                quantityAntimatterClass = 'none';
            } else if (quantityPercentage > 20) {
                quantityAntimatterClass = 'warning-text';
            } else {
                quantityAntimatterClass = 'disabled-text';
            }
        
            changeAsteroidArray(asteroid.name, "quantity", [newQuantityAntimatterAsteroid, quantityAntimatterClass]);
        }
    } 

    const megaStructureGainPerTick = getMegaStructureAntimatterAmount() / getTimerRateRatio();
    const totalAntimatterGainPerTick = totalAntimatterExtractionRate + megaStructureGainPerTick;
    const newAntimatterQuantity = antimatterTotalQuantity + totalAntimatterGainPerTick;

    setResourceDataObject(newAntimatterQuantity, 'antimatter', ['quantity']);
    setResourceDataObject(totalAntimatterGainPerTick, 'antimatter', ['rate']);

    if (getAntimatterUnlocked() && totalAntimatterGainPerTick > 0) {
        addToResourceAllTimeStat(totalAntimatterGainPerTick, 'antimatter');
        addToResourceAllTimeStat(totalAntimatterGainPerTick, 'antimatterThisRun');
    }

    if (elements?.miningRate) {
        const miningRateElement = elements.miningRate;
        const formattedMiningRate = `${(totalAntimatterGainPerTick * getTimerRateRatio()).toFixed(2)} / s`;
        miningRateElement.innerText = formattedMiningRate;

        miningRateElement.classList.remove('green-ready-text', 'warning-orange-text');
        if (totalAntimatterGainPerTick > 0) {
            miningRateElement.classList.add('green-ready-text');
        } else {
            miningRateElement.classList.add('warning-orange-text');
        }
    }

    if (elements?.miningQuantity) {
        elements.miningQuantity.innerText = `${Math.floor(newAntimatterQuantity)}`;
    }

    if (getCurrentOptionPane() === 'mining') {
        const svgElement = document.getElementById('antimatterSvg');

        drawAntimatterFlowDiagram(rocketData, svgElement);
        const rateBars = Array.from(svgElement.children).filter(child => child.id === 'svgRateBar');
        
        if (rateBars.length > 1) {
            svgElement.removeChild(rateBars[0]);
        }
        
        setHasAntimatterSvgRightBoxDataChanged(svgElement);
    }     
}

function getSpecificAsteroidExtractionRate(asteroid) {
    const maxRate = getNormalMaxAntimatterRate();
    const minRate = 0.0001;
    const maxEase = 1;
    const minEase = 10; //leave as 10 even for new complexity scale up to 6 so rate is higher than before even or bad ones

    const normalizedEase = (asteroid.easeOfExtraction[0] - maxEase) / (minEase - maxEase);
    const extractionRate = maxRate - (normalizedEase * (maxRate - minRate));

    return extractionRate;
}

function monitorTechTree() {
    const techs = getResourceDataObject('techs');
    
    Object.keys(techs).forEach(techKey => {
        if (!getTechUnlockedArray().includes(techKey)) {
            if (getResourceDataObject('research', ['quantity']) > techs[techKey].appearsAt[0] && !getRevealedTechArray().includes(techKey)) {
                setRevealedTechArray(techKey);
                if (getCurrentOptionPane() === 'tech tree') {
                    const tooltip = document.getElementById('techTreeTooltip');
                    if (tooltip) {
                        tooltip.remove();
                    }
                    getTechTreeDataAndDraw(true);
                }
            }
            if (getResourceDataObject('research', ['quantity']) > (techs[techKey].appearsAt[0] / 2.5) && !getUpcomingTechArray().includes(techKey)) {
                setUpcomingTechArray(techKey);
                if (getCurrentOptionPane() === 'tech tree') {
                    const tooltip = document.getElementById('techTreeTooltip');
                    if (tooltip) {
                        tooltip.remove();
                    }
                    getTechTreeDataAndDraw(true);
                }
            }
        }
    });
}

function resourceAndCompoundMonitorRevealRowsChecks(element) {
    if (element.classList.contains('invisible') && element.dataset.conditionCheck === 'techUnlock') { //reveal techs check
        if (getRevealedTechArray().includes(element.dataset.type)) {
            element.classList.remove('invisible');
            setTechRenderChange(true);
        } else if (!getRevealedTechArray().includes(element.dataset.type) && getResourceDataObject('research', ['quantity']) >= getResourceDataObject('techs', [element.dataset.type, 'appearsAt'])[0]) {
            element.classList.remove('invisible');
            setTechRenderChange(true);
        }
    } else if (element.dataset.conditionCheck === 'upgradeCheck' && element.dataset.type === 'autoBuyer') { //autobuyer reveal check
        const elementTier = parseInt(element.dataset.autoBuyerTier.slice(-1));
        if (getCurrentTab()[1].includes('Resources') && element.dataset.rowCategory === 'resource')  {
            if (elementTier > 0 ) {
                if (elementTier <= getAutoBuyerTierLevel(getCurrentOptionPane(), 'resources')) {
                    element.classList.remove('invisible');
                } else {
                    element.classList.add('invisible');
                }
            } else {
                element.classList.add('invisible');
            }
        } else if (getCurrentTab()[1].includes('Compounds') && element.dataset.rowCategory === 'compound')  {
            if (getTechUnlockedArray().includes('compoundMachining')) {
                element.classList.remove('invisible');
                return;
            }

            if (element.id === 'dieselAutoBuyer1Row') {
                element.classList.remove('invisible');
            } else if (elementTier > 0 ) {
                if (elementTier <= getAutoBuyerTierLevel(getCurrentOptionPane(), 'compounds')) {
                    element.classList.remove('invisible');
                } else {
                    element.classList.add('invisible');
                }
            } else {
                element.classList.add('invisible');
            }
        }
    }
}

export function checkAndStartAutoTelescopeAction() {
    const telescopeData = getResourceDataObject('space', ['upgrades', 'spaceTelescope']);

    if (!telescopeData?.spaceTelescopeBoughtYet ||
        !telescopeData?.autoSpaceTelescopeEnabled ||
        !telescopeData?.autoSpaceTelescopeRowEnabled) {
        return;
    }

    const timerManagerDlta = window.timerManagerDelta || timerManagerDelta;
    const hasActiveTimer = 
        timerManagerDlta.hasTimer('searchAsteroidTimer') ||
        timerManagerDlta.hasTimer('investigateStarTimer') ||
        timerManagerDlta.hasTimer('pillageVoidTimer');

    const hasPendingRestoration =
        (getCurrentlySearchingAsteroid() && getTimeLeftUntilAsteroidScannerTimerFinishes() > 0) ||
        (getCurrentlyInvestigatingStar() && getTimeLeftUntilStarInvestigationTimerFinishes() > 0) ||
        (getCurrentlyPillagingVoid() && getTimeLeftUntilPillageVoidTimerFinishes() > 0);

    if (hasActiveTimer || hasPendingRestoration) {
        return;
    }

    const mode = telescopeData.autoSpaceTelescopeMode ?? 'studyAsteroid';
    
    if (mode === 'studyAsteroid') {
        startSearchAsteroidTimer([0, 'autoTelescope']);
    } else if (mode === 'studyStars') {
        startInvestigateStarTimer([0, 'autoTelescope']);
    } else if (mode === 'pillageVoid' && 
               getPlayerPhilosophy() === 'voidborn' && 
               getPhilosophyAbilityActive() && 
               getStatRun() > 1) {
        startPillageVoidTimer([0, 'autoTelescope']);
    }
}

export function checkPowerForSpaceTelescopeTimer(timers) {
    timers.forEach(timerName => {
        const deltaTimerContinuations = {
            searchAsteroidTimer: getAsteroidTimerCanContinue(),
            investigateStarTimer: getStarInvestigationTimerCanContinue(),
            pillageVoidTimer: getPillageVoidTimerCanContinue()
        };

        const isDeltaTimer = Object.prototype.hasOwnProperty.call(deltaTimerContinuations, timerName);

        if (isDeltaTimer) {
            // Check if the timer exists before trying to manage it
            if (timerManagerDelta.hasTimer(timerName)) {
                const canContinue = deltaTimerContinuations[timerName];
                if (canContinue) {
                    timerManagerDelta.resumeTimer(timerName);
                } else {
                    timerManagerDelta.pauseTimer(timerName);
                }
            }
            // Continue to the next timer instead of returning
        } else {
            const timer = timerManager.getTimer(timerName);
            if (timer) {
                timer.pause();
            }
        }
    });
}

function travelToAsteroidChecks(element) {
    const accompanyingLabel = document.getElementById('travelToDescription');  

    if (accompanyingLabel) { //travelTo description
        const rocketClass = [...element.classList].find(cls => cls.startsWith('rocket') && cls.match(/^rocket\d+/));
        if (rocketClass) {
            const rocketName = rocketClass.match(/^rocket\d+/)[0];
            const travelToProgressBarElement = document.getElementById(`spaceTravelToAsteroidProgressBar${capitaliseString(rocketName)}Container`);
            const travelToDropdown = document.getElementById(`${rocketName}TravelDropdown`);
            const destinationAsteroidTextElement = document.getElementById(`${rocketName}DestinationAsteroid`);
            if (getRocketDirection(rocketName)) {
                destinationAsteroidTextElement.innerHTML = `Base`;
            } else {
                destinationAsteroidTextElement.innerHTML = `${getDestinationAsteroid(rocketName)}`;
            }

            if (getRocketReadyToTravel(rocketName) && getLaunchedRockets().includes(rocketName) && getCanTravelToAsteroids()) {
                accompanyingLabel.classList.remove('red-disabled-text');
                accompanyingLabel.innerHTML = `Ready To Travel...<br>${getDestinationAsteroid(getCurrentOptionPane())}`;
                accompanyingLabel.classList.add('green-ready-text');
                travelToProgressBarElement.classList.add('invisible');
                destinationAsteroidTextElement.classList.add('invisible');
                element.classList.remove('invisible');
                travelToDropdown.classList.remove('invisible');
                if (!getDestinationAsteroid(rocketName)) {
                    accompanyingLabel.innerText = 'Select Destination...';
                }
            } else {
                if (getCurrentlyTravellingToAsteroid(rocketName)) { //travelling case handled in timer
                    travelToProgressBarElement.classList.remove('invisible');
                    destinationAsteroidTextElement.classList.remove('invisible');
                    element.classList.add('invisible');
                    travelToDropdown.classList.add('invisible');
                } else if (getMiningObject()[rocketName] !== null) { //if rocket mining at an asteroid
                    const asteroidBeingMinedByCurrentRocket = getMiningObject()[rocketName];
                    accompanyingLabel.classList.remove('red-disabled-text');
                    accompanyingLabel.classList.add('green-ready-text');
                    travelToProgressBarElement.classList.add('invisible');
                    destinationAsteroidTextElement.classList.add('invisible');
                    element.classList.add('invisible');
                    travelToDropdown.classList.add('invisible');
                    accompanyingLabel.innerText = 'Mining Antimatter at ' + asteroidBeingMinedByCurrentRocket;
                } else if (!getLaunchedRockets().includes(rocketName)) {
                    accompanyingLabel.classList.add('red-disabled-text');
                    accompanyingLabel.classList.remove('green-ready-text');
                    accompanyingLabel.innerText = 'Not Launched!';
                    travelToProgressBarElement.classList.add('invisible');
                    destinationAsteroidTextElement.classList.add('invisible');
                    element.classList.add('invisible');
                    travelToDropdown.classList.remove('invisible');
                } else if (!getCanTravelToAsteroids()) {
                    element.classList.add('red-disabled-text');
                    element.classList.remove('green-ready-text');
                    accompanyingLabel.classList.remove('green-ready-text');
                    accompanyingLabel.classList.add('red-disabled-text');
                    accompanyingLabel.innerHTML = `Lack Nav Tech!`;
                    travelToDropdown.classList.remove('invisible');
                }

                if (!travelToDropdown.classList.contains('invisible')) {
                    travelToDropdown.querySelector('div.dropdown span').innerHTML = getCurrentDestinationDropdownText();
                }

                const elapsedTime = getRocketTravelDuration(rocketName) - getTimeLeftUntilRocketTravelToAsteroidTimerFinishes(rocketName);
                const progressBarPercentage = (elapsedTime / getRocketTravelDuration(rocketName)) * 100;
                document.getElementById(`spaceTravelToAsteroidProgressBar${capitaliseString(rocketName)}`).style.width = `${progressBarPercentage}%`;
            }
        }
    }

    if (element.dataset.resourceToFuseTo === 'travelToAsteroid') { //travelTo button
        const rocketClass = [...element.classList].find(cls => cls.startsWith('rocket') && cls.match(/^rocket\d+/));
        if (rocketClass) {
            const rocketName = rocketClass.match(/^rocket\d+/)[0];

            if (!getCanTravelToAsteroids() || !getDestinationAsteroid(rocketName) || !getLaunchedRockets().includes(rocketName) || getCurrentlyTravellingToAsteroid(rocketName) || !getRocketReadyToTravel(rocketName) || getMiningObject()[rocketName] !== null) {
                element.classList.add('red-disabled-text');
                element.classList.remove('green-ready-text');
            } else {
                element.classList.remove('red-disabled-text');
                element.classList.add('green-ready-text'); 
            }

            getCurrentlyTravellingToAsteroid(rocketName) || getMiningObject()[rocketName] !== null ? (element.classList.add('invisible')) : (element.classList.remove('invisible'));
            const progressBarTravelToAsteroid = document.getElementById(`spaceTravelToAsteroidProgressBar${capitaliseString(rocketName)}`);
            if (progressBarTravelToAsteroid) {
                getCurrentlyTravellingToAsteroid(rocketName) ? progressBarTravelToAsteroid.classList.remove('invisible') : progressBarTravelToAsteroid.classList.add('invisible');
            }
        }
    }
}

function spaceTelescopeChecks(element, type) {
    const isAsteroid = type === 'searchAsteroid';
    const isStar = type === 'investigateStar';
    const isPillageVoid = type === 'pillageVoid';
    
    const labelId = isAsteroid
      ? 'scanAsteroidsDescription'
      : isStar
        ? 'studyStarsDescription'
        : 'pillageTheVoidDescription';
    
    const progressBarId = isAsteroid
      ? 'spaceTelescopeSearchAsteroidProgressBar'
      : isStar
        ? 'spaceTelescopeInvestigateStarProgressBar'
        : 'spaceTelescopePillageVoidProgressBar';
    
    const progressBarContainerId = isAsteroid
      ? 'spaceTelescopeSearchAsteroidProgressBarContainer'
      : isStar
        ? 'spaceTelescopeInvestigateStarProgressBarContainer'
        : 'spaceTelescopePillageVoidProgressBarContainer';
    
    const accompanyingLabel = document.getElementById(labelId);

    if (accompanyingLabel) { // Scan description
        if (getPowerOnOff()) {
            accompanyingLabel.classList.remove('red-disabled-text');
            if (getTelescopeReadyToSearch()) {
                accompanyingLabel.innerText = isAsteroid
                ? 'Ready To Search...'
                : isStar
                  ? 'Ready To Study...'
                  : 'Ready To Pillage...';
              
                accompanyingLabel.classList.add('green-ready-text');
            } else {
                if (isAsteroid) {
                    if (getCurrentlyInvestigatingStar() || getCurrentlyPillagingVoid()) {
                        accompanyingLabel.innerText = getCurrentlyInvestigatingStar()
                            ? 'Currently Investigating Stars...'
                            : 'Currently Pillaging the Void...';
                        accompanyingLabel.classList.remove('green-ready-text');
                        accompanyingLabel.classList.add('red-disabled-text');
                    }
                } else if (isStar) {
                    if (getCurrentlySearchingAsteroid() || getCurrentlyPillagingVoid()) {
                        accompanyingLabel.innerText = getCurrentlySearchingAsteroid()
                            ? 'Currently Searching Asteroids...'
                            : 'Currently Pillaging the Void...';
                        accompanyingLabel.classList.remove('green-ready-text');
                        accompanyingLabel.classList.add('red-disabled-text');
                    }
                } else if (isPillageVoid) {
                    if (getCurrentlySearchingAsteroid() || getCurrentlyInvestigatingStar()) {
                        accompanyingLabel.innerText = getCurrentlySearchingAsteroid()
                            ? 'Currently Searching Asteroids...'
                            : 'Currently Investigating Stars...';
                        accompanyingLabel.classList.remove('green-ready-text');
                        accompanyingLabel.classList.add('red-disabled-text');
                    }
                }
            }            
        } else {
            accompanyingLabel.classList.add('red-disabled-text');
            accompanyingLabel.classList.remove('green-ready-text');
            accompanyingLabel.innerText = 'Requires Power!';
        
            let elapsedTime, totalDuration;
        
            if (isAsteroid) {
                elapsedTime = getCurrentAsteroidSearchTimerDurationTotal() - getTimeLeftUntilAsteroidScannerTimerFinishes();
                totalDuration = getCurrentAsteroidSearchTimerDurationTotal();
            } else if (isStar) {
                elapsedTime = getCurrentInvestigateStarTimerDurationTotal() - getTimeLeftUntilStarInvestigationTimerFinishes();
                totalDuration = getCurrentInvestigateStarTimerDurationTotal();
            } else if (isPillageVoid){
                elapsedTime = getCurrentPillageVoidTimerDurationTotal() - getTimeLeftUntilPillageVoidTimerFinishes();
                totalDuration = getCurrentPillageVoidTimerDurationTotal();
            }
        
            const progressBarPercentage = (elapsedTime / totalDuration) * 100;
            document.getElementById(progressBarId).style.width = `${progressBarPercentage}%`;
        } 
    }

    if (element.dataset.resourceToFuseTo === type) { // Scan button doesnt need specifics for which timer as it is not shown unless getTelescopeReadyToSearch is true
        if (getPowerOnOff() && getTelescopeReadyToSearch()) {
            element.classList.remove('red-disabled-text');
        } else {
            element.classList.add('red-disabled-text');
        }

        if (getTelescopeReadyToSearch()) {
            element.classList.remove('invisible');
        } else {
            if (element.tagName.toLowerCase() === 'button') {
                element.classList.add('invisible');
            }
        }
        
        const progressBarContainer = document.getElementById(progressBarContainerId);
        if (progressBarContainer) {
            if (getTelescopeReadyToSearch()) {
                progressBarContainer.classList.add('invisible');
            } else if (isAsteroid && getCurrentlySearchingAsteroid()) {
                progressBarContainer.classList.remove('invisible');
            } else if (isStar && getCurrentlyInvestigatingStar()) {
                progressBarContainer.classList.remove('invisible');
            } else if (isPillageVoid && getCurrentlyPillagingVoid()) {
                progressBarContainer.classList.remove('invisible');
            } else {
                progressBarContainer.classList.add('invisible');
            }
        }        
    }
}

function powerGenerationFuelChecks(element) {
    if (element.tagName.toLowerCase() === 'button') {
        const buildingNameString = element.dataset.toggleTarget;
        const buildingQuantity = getResourceDataObject('buildings', ['energy', 'upgrades', buildingNameString, 'quantity']);

        const fuelType = getResourceDataObject('buildings', ['energy', 'upgrades', buildingNameString, 'fuel'])[0];
        const fuelCategory = getResourceDataObject('buildings', ['energy', 'upgrades', buildingNameString, 'fuel'])[2];
        const fuelQuantity = getResourceDataObject(fuelCategory, [fuelType, 'quantity']);

        const fuelTypeElement = document.getElementById(buildingNameString + 'FuelType');
        const fuelQuantityElement = document.getElementById(buildingNameString + 'FuelQuantity');

        if (buildingQuantity > 0) {
            element.classList.remove('invisible');
            fuelTypeElement.classList.remove('invisible');
            fuelQuantityElement.classList.remove('invisible');

            const shouldDisableForFuel = fuelQuantity <= 0 && buildingNameString !== 'powerPlant2';

            if (shouldDisableForFuel) {
                element.textContent = 'Activate';
                element.classList.add('red-disabled-text');
                fuelTypeElement.classList.add('red-disabled-text');
                fuelQuantityElement.classList.add('red-disabled-text');
                fuelTypeElement.classList.remove('green-ready-text');
                fuelQuantityElement.classList.remove('green-ready-text');
            } else {
                if (getBuildingTypeOnOff(buildingNameString)) {                
                    element.textContent = 'Deactivate';
                }
                element.classList.remove('red-disabled-text');
                fuelTypeElement.classList.remove('red-disabled-text');
                fuelQuantityElement.classList.remove('red-disabled-text');
                fuelTypeElement.classList.add('green-ready-text');
                fuelQuantityElement.classList.add('green-ready-text');
            }
            if (buildingNameString !== 'powerPlant2') {
                fuelQuantityElement.textContent = Math.floor(fuelQuantity);
            } else {
                fuelQuantityElement.textContent = Math.floor(getCurrentStarSystemWeatherEfficiency()[1] * 100) + '% ' + getStarSystemDataObject('stars', [getCurrentStarSystem(), 'weather', getCurrentStarSystemWeatherEfficiency()[2]])[1];
                colorSolarFuelElements(fuelTypeElement, fuelQuantityElement);
            }
            
        } 
    }
}

function colorSolarFuelElements(fuelTypeElement, fuelQuantityElement) {
    const weather = getCurrentStarSystemWeatherEfficiency()[2];

if (weather === 'rain' || weather === 'cloudy') {
    fuelQuantityElement.classList.add('warning-orange-text');
    fuelQuantityElement.classList.remove('red-disabled-text', 'green-ready-text');

    fuelTypeElement.classList.add('warning-orange-text');
    fuelTypeElement.classList.remove('red-disabled-text', 'green-ready-text');
} else if (weather === 'volcano') {
    fuelQuantityElement.classList.add('red-disabled-text');
    fuelQuantityElement.classList.remove('warning-orange-text', 'green-ready-text');

    fuelTypeElement.classList.add('red-disabled-text');
    fuelTypeElement.classList.remove('warning-orange-text', 'green-ready-text');
} else {
    fuelQuantityElement.classList.add('green-ready-text');
    fuelQuantityElement.classList.remove('warning-orange-text', 'red-disabled-text');

    fuelTypeElement.classList.add('green-ready-text');
    fuelTypeElement.classList.remove('warning-orange-text', 'red-disabled-text');
}

}

function energyChecks(element) {
    const valueText = element.textContent;
    const match = valueText.match(/(-?\d+(\.\d+)?) KW \/ s/);

    if (match) {
        const number = parseFloat(match[1]);
        if (number < 0) {
            element.classList.add('red-disabled-text');
        } else {
            element.classList.remove('red-disabled-text');
        }
    }
}

function powerOnOrOffChecks(element) {
    if (!getResourceDataObject('buildings', ['energy', 'batteryBoughtYet'])) {
        // No battery purchased yet
        if (getInfinitePower() || getResourceDataObject('buildings', ['energy', 'rate']) > 0) {
            element.textContent = '• ON';
            element.classList.remove('red-disabled-text');
            element.classList.add('green-ready-text');
            element.classList.remove('warning-orange-text');
        } else if (getTrippedStatus()) { 
            element.textContent = '• TRIPPED';
            element.classList.add('warning-orange-text');
            element.classList.remove('green-ready-text');
            element.classList.remove('red-disabled-text');
        } else {
            element.textContent = '• OFF';
            element.classList.add('red-disabled-text');
            element.classList.remove('green-ready-text');
            element.classList.remove('warning-orange-text');
        }
    } else {
        // Battery is purchased
        if (getInfinitePower() || getResourceDataObject('buildings', ['energy', 'quantity']) > 0.00001) {
            element.textContent = '• ON';
            element.classList.remove('red-disabled-text');
            element.classList.add('green-ready-text');
            element.classList.remove('warning-orange-text');
        } else if (getTrippedStatus()) {
            element.textContent = '• TRIPPED';
            element.classList.add('warning-orange-text');
            element.classList.remove('green-ready-text');
            element.classList.remove('red-disabled-text');
        } else {
            element.textContent = '• OFF';
            element.classList.remove('warning-orange-text');
            element.classList.add('red-disabled-text');
            element.classList.remove('green-ready-text');
        }
    }
}

function compoundCostSellCreateChecks(element) {  //to refactor
    let compound = element.dataset.type;
    let compound2;

    const type = element.dataset.type;

    if (compound === 'storage' || compound === 'autoBuyer') {
        compound = element.dataset.argumentCheckQuantity;
        compound2 = element.dataset.argumentCheckQuantity2;
    }

    const checkQuantityString = element.dataset.argumentCheckQuantity;
    const checkQuantityString2 = element.dataset.argumentCheckQuantity2;
    const isCashOverride = element.dataset.cashOverride === 'true';
    const cashOverrideResource = element.dataset.cashOverrideResource || 'cash';

    let quantity;
    if (isCashOverride) {
        quantity = getResourceDataObject('currency', [cashOverrideResource]);
    } else if (checkQuantityString) {
        quantity = getResourceDataObject('compounds', [checkQuantityString, 'quantity']);
    } else {
        quantity = 0;
    }
    let quantity2;
    compound2 ? quantity2 = getResourceDataObject('compounds', [checkQuantityString2, 'quantity']) : -1;

    if (element.classList.contains('sell') || element.dataset.conditionCheck === 'sellCompound') { //sell
        if (quantity > 0) { 
            element.classList.remove('red-disabled-text');
        } else {
            element.classList.add('red-disabled-text');
        }

        return;
    }

    if (element.classList.contains('create') || element.dataset.conditionCheck === 'createCompound') { //sell           
        const createCompoundDescriptionString = document.getElementById('create' + capitaliseString(checkQuantityString) + 'Description').innerHTML;
        const accompanyingLabel = element.parentElement.nextElementSibling.querySelector('label');
        if (accompanyingLabel.textContent.startsWith('0')) {
            accompanyingLabel.classList.remove('warning-orange-text');
            accompanyingLabel.classList.add('red-disabled-text');
        } else {
            accompanyingLabel.classList.remove('red-disabled-text'); 
        }
        
        let constituentComponents = getConstituentComponents(createCompoundDescriptionString);      
        constituentComponents = unpackConstituentPartsObject(constituentComponents);
        setConstituentPartsObject(constituentComponents);

        let isDisabled = false;

        for (let i = 1; i <= 4; i++) {
            const nameKey = `constituentPartName${i}`;
            const quantityKey = `constituentPartQuantity${i}`;
            const requiredName = constituentComponents[nameKey];
            const requiredQuantity = constituentComponents[quantityKey];
    
            if (constituentComponents.compoundToCreateQuantity <= 0) {
                isDisabled = true;
                break;
            }

            if (!requiredName || requiredQuantity <= 0) continue;
    
            const currentQuantity = getResourceDataObject('resources', [requiredName, 'quantity']);
            if (currentQuantity < requiredQuantity) {
                element.classList.remove('warning-orange-text');
                element.classList.add('red-disabled-text');
                setSellFuseCreateTextDescriptionClassesBasedOnButtonStates(element, 'create');
                isDisabled = true;
                break;
            }
        }
    
        if (!isDisabled) {
            if (createCompoundDescriptionString.includes('!')) {
                element.classList.add('warning-orange-text');
            }
            if (!createCompoundDescriptionString.includes('!')) {
                element.classList.remove('warning-orange-text');
            }
            if (getPowerOnOff()) {
                element.classList.remove('red-disabled-text');
            } else {
                element.classList.add('red-disabled-text');
            }
            setSellFuseCreateTextDescriptionClassesBasedOnButtonStates(element, 'create');
        }

        return;
    }

    let price;
    let price2;
    let mainKey;

    if (type === 'autoBuyer') {
        mainKey = 'compounds';
        const autoBuyerTier = element.dataset.autoBuyerTier;
        if (autoBuyerTier === 'tier0') return;
        price = getResourceDataObject(mainKey, [compound, 'upgrades', 'autoBuyer', autoBuyerTier, 'price']);
        if (isCashOverride && element.tagName.toLowerCase() !== 'button') {
            element.textContent = `${getCurrencySymbol()}${price.toFixed(2)}`;
        }
        price2 = 0;
    } else if (element.dataset.type === "storage") {
        mainKey = 'compounds' //storageCapacity
        price = getResourceDataObject(mainKey, [compound, 'storageCapacity']) - 1;
        if (element.tagName.toLowerCase() !== 'button') {
            price2 = compound2 ? Math.floor(getResourceDataObject(mainKey, [compound, 'storageCapacity']) * 0.3) : 0;
            const mainCompoundPriceText = `${price} ${getResourceDataObject(mainKey, [compound, 'nameResource'])}`;
            const secondaryCompoundPriceText = price2 > 0 ? `, ${price2} ${getResourceDataObject(mainKey, [compound2, 'nameResource'])}` : '';
        
            const mainCompoundSpan = document.createElement('span');
            mainCompoundSpan.id = 'mainCompoundPriceText';
            mainCompoundSpan.textContent = mainCompoundPriceText;
        
            const secondaryCompoundSpan = document.createElement('span');
            secondaryCompoundSpan.id = 'secondaryCompoundPriceText';
            secondaryCompoundSpan.textContent = secondaryCompoundPriceText;
        
            element.textContent = '';
            element.appendChild(mainCompoundSpan);
            element.appendChild(secondaryCompoundSpan);
        }
         else {
            price2 = 0;
        }
    }

    if (element.dataset.conditionCheck === 'upgradeCheck' && quantity >= price && quantity2 >= price2) { //reason for quantity2 being -1 higher up
        if (element.tagName.toLowerCase() !== 'button' && price2 > 0) {
            document.getElementById('mainCompoundPriceText').classList.add('green-ready-text');
            document.getElementById('secondaryCompoundPriceText').classList.add('green-ready-text');
            document.getElementById('mainCompoundPriceText').classList.remove('red-disabled-text');
            document.getElementById('secondaryCompoundPriceText').classList.remove('red-disabled-text');
        }
        element.classList.remove('red-disabled-text');
    } else {
        if (element.tagName.toLowerCase() !== 'button' && price2 > 0) {
            if (quantity < price) {
                document.getElementById('mainCompoundPriceText').classList.add('red-disabled-text');
                document.getElementById('mainCompoundPriceText').classList.remove('green-ready-text');
                element.classList.add('red-disabled-text');
            } else {
                document.getElementById('mainCompoundPriceText').classList.add('green-ready-text');
            }
            if (quantity2 < price2) {
                document.getElementById('secondaryCompoundPriceText').classList.add('red-disabled-text');
                document.getElementById('secondaryCompoundPriceText').classList.remove('green-ready-text'); 
                element.classList.add('red-disabled-text');
            } else {
                document.getElementById('secondaryCompoundPriceText').classList.add('green-ready-text');
            }
            if (quantity >= price && quantity2 >= price2) {
                element.classList.remove('red-disabled-text');
            }
        } else if (element.tagName.toLowerCase() !== 'button') {
            if (quantity < price) {
                element.classList.add('red-disabled-text');
            } else {
                element.classList.remove('red-disabled-text');
            }
        } else { //buttons
            if (element.parentElement.parentElement.querySelector('.description-container').firstChild.classList.contains('red-disabled-text')) { //could cause problems with compound autobuyers if introduced, even when this is working as intended
                element.classList.add('red-disabled-text');
            } else {
                element.classList.remove('red-disabled-text');
            }
        }
    }

    if (getElements()[compound + 'Rate'].textContent.includes('-')) {
        getElements()[compound + 'Rate'].classList.add('red-disabled-text');
    } else {
        getElements()[compound + 'Rate'].classList.remove('red-disabled-text');
    }
}

function resourceCostSellChecks(element) {
    if (element.classList.contains('sell-building-button')) {
        const buildingType = element.dataset.resourceToFuseTo;
        const quantityBuilding = getResourceDataObject('buildings', ['energy', 'upgrades', buildingType, 'quantity']);

        if (quantityBuilding > 0) {
            element.classList.remove('red-disabled-text');
            element.classList.add('green-ready-text');
        } else {
            document.getElementById(buildingType + 'Toggle').classList.add('invisible');
            element.classList.add('red-disabled-text');
            element.classList.remove('green-ready-text');
        }
        return;
    }
    
    let resource = element.dataset.type;
    const techName = element.dataset.type;
    const type = element.dataset.type;
    const resourceToFuseTo = element.dataset.resourceToFuseTo;

    //science / building upgrades
    const scienceUpgradeType = element.dataset.resourceToFuseTo;
    const buildingUpgradeType = element.dataset.resourceToFuseTo;
    const spaceUpgradeType = element.dataset.resourceToFuseTo;

    if (resource === 'storage' || resource === 'autoBuyer') {
        resource = element.dataset.argumentCheckQuantity;
    }

    const checkQuantityString = element.dataset.argumentCheckQuantity;

    let quantity;

    if (checkQuantityString === 'cash') {
        quantity = getResourceDataObject('currency', ['cash']);
    } else if (checkQuantityString === 'time') {
        quantity = 0;
    } else {
        if (checkQuantityString === 'research') {
            quantity = getResourceDataObject('research', ['quantity']); //research
        } else {
            quantity = getResourceDataObject('resources', [checkQuantityString, 'quantity']); //research
        } 
    }

    if (element.classList.contains('sell') || element.dataset.conditionCheck === 'sellResource') { //sell
        return setStateOfSellResourceButton(element, quantity);
    }

    if (element.classList.contains('fuse') || element.dataset.conditionCheck === 'fuseResource') {
        return setStateOfFuseResourceButton(element, quantity, resource, resourceToFuseTo);
    }

    if (element.classList.contains('tech-unlock') || element.dataset.conditionCheck === 'techUnlock') { 
        return handleTechnologyScreenButtonAndDescriptionStates(element, quantity, techName);
    }   
    
    if (element.classList.contains('philosophy-tech-unlock') || element.dataset.conditionCheck === 'techUnlockPhilosophy') { 
        return handlePhilosophyTechnologyScreenButtonAndDescriptionStates(element, quantity, techName);
    }  

    let price = setPriceForAllPurchases(element, type, resource, scienceUpgradeType, buildingUpgradeType, spaceUpgradeType);

    let resourcePrices = [];
    let resourceNames = [];
    let resourceCategories = [];

    if (element.classList.contains('building-purchase')) {
        ({ resourcePrices, resourceNames, resourceCategories } = setUpResourcePricesNamesCategories(resource, type, spaceUpgradeType, buildingUpgradeType));
    }

    checkIfHaveEnoughResourceForUpgradeAndSetState(element, quantity, price);
    
    if (element.dataset.conditionCheck === 'upgradeCheck' && quantity >= price) {
        setStateOfDescriptionLabelsForAutoBuyers(element, price, quantity, resourceCategories, resourceNames, resourcePrices);
    } else {
        setStateOfDescriptionLabelsForBuildingAndOneOffSpacePurchases(element, price, quantity, resourceCategories, resourceNames, resourcePrices);
    } 

    if (resource !== 'energy' && resource !== 'spaceUpgrade' && resource !== 'scienceUpgrade' && resource !== 'cash' && resource !== 'time') {
        handleResourceRateStates(resource);
    } else if (resource === 'spaceUpgrade') {
        handleSpaceUpgradeResourceType(element);
    } else if (resource === 'cash') { //build launchPad, spaceTelescope, startFuellingAutoBuyers
        handleRocketFuellingChecksAndOneOffPurchases(element, price);
        //add any more that need resource === cash
    } else if (resource === 'time') {
        //should be handled in the timer itself
    } 
}

function setPriceForAllPurchases(element, type, resource, scienceUpgradeType, buildingUpgradeType, spaceUpgradeType) {
    let mainKey;
    let price;

    if (type === 'autoBuyer') {
        if (resource === 'cash') { //rocketFuelBuyer
            const autoBuyerTier = element.dataset.autoBuyerTier;
            let rocket;
            for (let clas of element.classList) {
                if (clas.includes("rocket")) {
                    rocket = clas;
                    break;
                }
            }
            price = getResourceDataObject('space', ['upgrades', rocket, 'autoBuyer', autoBuyerTier, 'price']);
        } else if (resource === 'time') { //for things like search asteroid
            price = 0;
        } else {
            mainKey = 'resources';
            const autoBuyerTier = element.dataset.autoBuyerTier;
            if (autoBuyerTier === 'tier0') return 0;
            price = getResourceDataObject(mainKey, [resource, 'upgrades', 'autoBuyer', autoBuyerTier, 'price']);
        }

    } else if (type === 'scienceUpgrade') {
        mainKey = 'research';
        price = getResourceDataObject(mainKey, ['upgrades', scienceUpgradeType, 'price']);
    } else if (type === 'energy') {
        mainKey = 'buildings';
        price = getResourceDataObject(mainKey, [resource, 'upgrades', buildingUpgradeType, 'price']);
    } else if (type === 'spaceUpgrade') {
        mainKey = 'space';
        price = getResourceDataObject(mainKey, ['upgrades', spaceUpgradeType, 'price']);
    } else {
        if (element.dataset.type === "research") {
            mainKey = 'research';
            price = getResourceDataObject(mainKey, ['quantity']);
        } else if (element.dataset.type === "storage") {
            mainKey = 'resources' //storageCapacity
            price = getResourceDataObject(mainKey, [resource, 'storageCapacity']) - 1;
            if (element.tagName.toLowerCase() !== 'button') {
                element.textContent = `${price} ${getResourceDataObject(mainKey, [resource, 'nameResource'])}`;
            }
        }
    }

    return price;
}

function handleTechnologyScreenButtonAndDescriptionStates(element, quantity, techName) {
    const prerequisiteArray = getResourceDataObject('techs', [techName, 'appearsAt']).slice(1).filter(prereq => prereq !== null && prereq !== '');
    
    if (element && quantity >= getResourceDataObject('techs', [techName, 'price'])) {
        element.classList.remove('red-disabled-text');
        element.classList.add('green-ready-text');
    } else if (element) {
        element.classList.add('red-disabled-text');
        element.classList.remove('green-ready-text');
    }

    if (element.tagName.toLowerCase() === 'button') {
        if (quantity >= getResourceDataObject('techs', [techName, 'price'])) {
            const allPrerequisitesUnlocked = prerequisiteArray.every(prerequisite => getTechUnlockedArray().includes(prerequisite));

            if (allPrerequisitesUnlocked) {
                element.classList.remove('red-disabled-text');
            } else {
                element.classList.add('red-disabled-text');
            }
        }
    } else { 
        const prerequisiteSpan = element.querySelector('span');
        
        if (prerequisiteSpan) {
            const technologiesString = prerequisiteSpan.textContent.trim();
            if ((technologiesString !== "" && element.tagName.toLowerCase() !== 'button') || element.tagName.toLowerCase() === 'button') {
                const technologiesArray = technologiesString.split(', ');
                prerequisiteSpan.innerHTML = '';

                technologiesArray.forEach((tech, index) => {

                    const techSpan = document.createElement('span');
                    techSpan.textContent = tech.trim();
                    const techSpanArrayName = /^[A-Z]{2,}/.test(tech.split(' ')[0]) 
                    ? tech.replace(/\s+/g, '')
                    : tech.charAt(0).toLowerCase() + tech.slice(1).replace(/\s+/g, '');

                    if (getTechUnlockedArray().includes(techSpanArrayName)) {
                        techSpan.classList.add('green-ready-text');
                        techSpan.classList.remove('red-disabled-text');
                    } else {
                        techSpan.classList.remove('green-ready-text');
                        techSpan.classList.add('red-disabled-text');
                    }
                    prerequisiteSpan.appendChild(techSpan);

                    if (index < technologiesArray.length - 1) {
                        prerequisiteSpan.appendChild(document.createTextNode(', '));
                    }
                });
            }
        }
    }

    if (getTechUnlockedArray().includes(techName)) {
        if (element.tagName.toLowerCase() === 'button') {
            setSellFuseCreateTextDescriptionClassesBasedOnButtonStates(element, 'green');
        }
        element.classList.remove('red-disabled-text');
        element.classList.add('green-ready-text');
        element.textContent = 'Researched';
        element.style.pointerEvents = 'none';
        setTechRenderChange(true);
    }
}

function handlePhilosophyTechnologyScreenButtonAndDescriptionStates(element, quantity, techName) {
    if (element && quantity >= getResourceDataObject('philosophyRepeatableTechs', [getPlayerPhilosophy(), techName, 'price'])) {
        element.classList.remove('red-disabled-text');
        element.parentElement.parentElement?.querySelector('.description-container label span')?.classList.remove('red-disabled-text');
    
        element.classList.add('green-ready-text');
        element.parentElement.parentElement?.querySelector('.description-container label span')?.classList.add('green-ready-text');
    } else if (element) {
        element.classList.add('red-disabled-text');
        element.parentElement.parentElement?.querySelector('.description-container label span')?.classList.add('red-disabled-text');
    
        element.classList.remove('green-ready-text');
        element.parentElement.parentElement?.querySelector('.description-container label span')?.classList.remove('green-ready-text');
    }
    

    if (element.tagName.toLowerCase() === 'button') {
        if (quantity >= getResourceDataObject('philosophyRepeatableTechs', [getPlayerPhilosophy(), techName, 'price'])) {
            element.classList.remove('red-disabled-text');
            element.parentElement.parentElement?.querySelector('.description-container label span').classList.remove('red-disabled-text');
            element.classList.add('green-ready-text');
            element.parentElement.parentElement?.querySelector('.description-container label span').classList.add('green-ready-text');
        }

        if (element.classList.contains('special-ability')) {
            if (getPhilosophyAbilityActive()) {
                element.innerHTML = 'UNLOCKED';
                element.style.pointerEvents = 'none';
            }
        }
    }
}

function setStateOfSellResourceButton(element, quantity) {
    if (quantity > 0) { 
        element.classList.remove('red-disabled-text');
    } else {
        element.classList.add('red-disabled-text');
    }
}

function setStateOfFuseResourceButton(element, quantity, resource, resourceToFuseTo) {
    if (getTechUnlockedArray().includes(resource + 'Fusion') && getUnlockedResourcesArray().includes(resourceToFuseTo)) {
        element.classList.remove('invisible'); 
    }

    if (getTechUnlockedArray().includes(resource + 'Fusion') && quantity > 0) {
        element.classList.remove('red-disabled-text');
        if (element.tagName.toLowerCase() === 'button') {
            setSellFuseCreateTextDescriptionClassesBasedOnButtonStates(element, 'fuse');
        }
    } else if (!getTechUnlockedArray().includes(resource + 'Fusion')) {
        element.classList.add('invisible');
    } else {
        element.classList.remove('warning-orange-text');
        element.classList.add('red-disabled-text');
    }
}

function setUpResourcePricesNamesCategories(resource, type, spaceUpgradeType, buildingUpgradeType) {
    let resourceCategories = [];
    let resourcePrices = [];
    let resourceNames = [];

    if (type === 'spaceUpgrade') {
        resourcePrices.push(
            getResourceDataObject('space', ['upgrades', spaceUpgradeType, 'resource1Price'])[0],
            getResourceDataObject('space', ['upgrades', spaceUpgradeType, 'resource2Price'])[0],
            getResourceDataObject('space', ['upgrades', spaceUpgradeType, 'resource3Price'])[0]
        );
        resourceNames.push(
            getResourceDataObject('space', ['upgrades', spaceUpgradeType, 'resource1Price'])[1],
            getResourceDataObject('space', ['upgrades', spaceUpgradeType, 'resource2Price'])[1],
            getResourceDataObject('space', ['upgrades', spaceUpgradeType, 'resource3Price'])[1]
        );
        resourceCategories.push(
            getResourceDataObject('space', ['upgrades', spaceUpgradeType, 'resource1Price'])[2],
            getResourceDataObject('space', ['upgrades', spaceUpgradeType, 'resource2Price'])[2],
            getResourceDataObject('space', ['upgrades', spaceUpgradeType, 'resource3Price'])[2]
        );
    } else {
        if (resource !== 'time') {
            resourcePrices.push(
                getResourceDataObject('buildings', ['energy', 'upgrades', buildingUpgradeType, 'resource1Price'])[0],
                getResourceDataObject('buildings', ['energy', 'upgrades', buildingUpgradeType, 'resource2Price'])[0],
                getResourceDataObject('buildings', ['energy', 'upgrades', buildingUpgradeType, 'resource3Price'])[0]
            );
            resourceNames.push(
                getResourceDataObject('buildings', ['energy', 'upgrades', buildingUpgradeType, 'resource1Price'])[1],
                getResourceDataObject('buildings', ['energy', 'upgrades', buildingUpgradeType, 'resource2Price'])[1],
                getResourceDataObject('buildings', ['energy', 'upgrades', buildingUpgradeType, 'resource3Price'])[1]
            );
            resourceCategories.push(
                getResourceDataObject('buildings', ['energy', 'upgrades', buildingUpgradeType, 'resource1Price'])[2],
                getResourceDataObject('buildings', ['energy', 'upgrades', buildingUpgradeType, 'resource2Price'])[2],
                getResourceDataObject('buildings', ['energy', 'upgrades', buildingUpgradeType, 'resource3Price'])[2]
            );
        }
    }

    return { resourceCategories: resourceCategories, resourceNames: resourceNames, resourcePrices: resourcePrices };
}

function checkIfHaveEnoughResourceForUpgradeAndSetState(element, quantity, price) {
    if (element.dataset.conditionCheck === 'upgradeCheck' && quantity >= price && element.dataset.argumentCheckQuantity !== 'time') {
        element.classList.remove('red-disabled-text');
    } else {
        element.classList.add('red-disabled-text');
    }
}

function handleResourceRateStates(resource) {
    if (getElements()[resource + 'Rate'].textContent.includes('-')) {
        getElements()[resource + 'Rate'].classList.add('red-disabled-text');
    } else {
        getElements()[resource + 'Rate'].classList.remove('red-disabled-text');
    }
}

function setStateOfDescriptionLabelsForAutoBuyers(element, price, quantity, resourceCategories, resourceNames, resourcePrices) {
    if (element.classList.contains('building-purchase')) {
        element.querySelectorAll('span').forEach((span, index) => {
            if (index !== 0) {
                const category = resourceCategories[index-1];
                const name = resourceNames[index-1];
                const price = resourcePrices[index-1];

                if (category && getResourceDataObject(category, [name, 'quantity']) > price) {
                    span.classList.remove('red-disabled-text');
                    span.classList.add('green-ready-text');
                } else if (category) {
                    span.classList.add('red-disabled-text');
                    span.classList.remove('green-ready-text');
                }
            } else {
                if (element.dataset.conditionCheck === 'upgradeCheck' && quantity >= price) {
                    span.classList.remove('red-disabled-text');
                    span.classList.add('green-ready-text');  
                } else {
                    span.classList.add('red-disabled-text');
                    span.classList.remove('green-ready-text');
                }
            }
        });
    } else if (element.dataset.argumentCheckQuantity !== 'time') {
        element.classList.remove('red-disabled-text');
    } else if (element.dataset.argumentCheckQuantity === 'time') {
        if (getPowerOnOff()) {
            element.classList.remove('red-disabled-text');
        } else {
            element.classList.add('red-disabled-text');
        }
    }
}

function setStateOfDescriptionLabelsForBuildingAndOneOffSpacePurchases(element, price, quantity, resourceCategories, resourceNames, resourcePrices) {
    if (element.classList.contains('building-purchase') && !element.classList.contains('building-purchase-button')) {
        element.querySelectorAll('span').forEach((span, index) => {
            if (index !== 0) {
                const category = resourceCategories[index-1];
                const name = resourceNames[index-1];
                const price = resourcePrices[index-1];
    
                if (category && getResourceDataObject(category, [name, 'quantity']) > price) {
                    span.classList.remove('red-disabled-text');
                    span.classList.add('green-ready-text');
                } else if (category) {
                    span.classList.add('red-disabled-text');
                    span.classList.remove('green-ready-text');
                }
            } else {
                if (element.dataset.conditionCheck === 'upgradeCheck' && quantity >= price) {
                    span.classList.remove('red-disabled-text');
                    span.classList.add('green-ready-text');  
                } else {
                    span.classList.add('red-disabled-text');
                    span.classList.remove('green-ready-text');
                }
            }
        });
    } else {
        element.classList.add('red-disabled-text');
    }
}

function setStateOfButtonsBasedOnDescriptionStateForBuildingPurchases(element) {
    const spans = element.querySelectorAll('span');

    let hasRedDisabledText = false;
    spans.forEach(span => {
        if (span.classList.contains('red-disabled-text')) {
            hasRedDisabledText = true;
        }
    });

    const buttons = element.parentElement.parentElement.querySelectorAll('button');

    buttons.forEach(buyButton => {
        if (
            buyButton.classList.contains('sell-building-button') ||
            buyButton.dataset?.conditionCheck === 'toggle' ||
            buyButton.classList.contains('toggle-timer')
        ) return; // Skip sell buttons and building toggles
    
        if (hasRedDisabledText) {
            buyButton.classList.add('red-disabled-text');
        } else {
            if (buyButton.innerHTML !== 'Built!' && buyButton.innerHTML !== 'Launched!') {
                buyButton.classList.remove('red-disabled-text');
            }
        }
    });    
}

function handleVisibilityOfOneOffPurchaseButtonsAndDescriptions(element) {
    if (element.dataset.rowCategory === 'fleetPurchase') {
        return;
    }

    const upgradeTypes = ['launchPad', 'spaceTelescope'];

    upgradeTypes.forEach(upgradeType => {
        if (element.classList.contains(upgradeType)) {
            if (getResourceDataObject('space', ['upgrades', upgradeType, `${upgradeType}BoughtYet`])) {
                const accompanyingLabel = element.parentElement.nextElementSibling.querySelector('label');
    
                element.classList.add('invisible');
                document.getElementById(`${upgradeType}AlreadyBoughtText`).classList.remove('invisible');
                accompanyingLabel.classList.add('invisible');
            }
        }
    });

    if (element.innerHTML === 'Built!' || element.innerHTML === 'Launched!') {
        element.classList.remove('green-ready-text');
        element.classList.add('red-disabled-text');
        const rocketNumber = element.dataset.resourceToFuseTo;
        const partsCountElement = document.getElementById(`${rocketNumber}PartsCountText`);
        partsCountElement.classList.add('invisible');
        return true;
    }
    return false;
}

function handleRocketFuellingChecksAndOneOffPurchases(element, price) {
    let rocket;
    let currentCash = getResourceDataObject('currency', ['cash']);
    for (let clas of element.classList) {
        if (clas.includes("rocket")) {
            rocket = clas;
            break;
        }
    }

    const rocketsFuellerStartedArray = getRocketsFuellerStartedArray();
    const accompanyingLabel = element.parentElement.parentElement.querySelector('.description-container label');
    const filteredRockets = rocketsFuellerStartedArray.filter(item => !item.includes('FuelledUp'));
    const launchButton = document.querySelector(`.${rocket}-launch-button`);

    if (!filteredRockets.includes(rocket) && currentCash >= price) { //purchase launchPad, spaceTelescope etc
        if (element.dataset?.rowCategory !== 'rocketFuel') {
            element.classList.remove('red-disabled-text');
        } else {
            if (getPowerOnOff()) {
                element.classList.remove('red-disabled-text');
            } else {
                element.classList.add('red-disabled-text');
            }
        }        
    } else if (filteredRockets.includes(rocket)) {
        element.classList.add('invisible');
        accompanyingLabel.textContent = 'Fuelling...';
        accompanyingLabel.classList.remove('red-disabled-text');
        accompanyingLabel.classList.add('green-ready-text');
    } else {
        element.classList.add('red-disabled-text');
    }

    if (rocketsFuellerStartedArray.includes(`${rocket}FuelledUp`) && getCurrentStarSystemWeatherEfficiency()[2] !== 'rain' && getCurrentStarSystemWeatherEfficiency()[2] !== 'volcano' && getCurrentOptionPane() === rocket) {
        document.getElementById('fuelDescription').textContent = 'Ready For Launch...';
        document.getElementById('fuelDescription').classList.add('green-ready-text');
        document.getElementById('fuelDescription').classList.remove('red-disabled-text');
        setCheckRocketFuellingStatus(rocket, false);
        launchButton.classList.add('green-ready-text');
        launchButton.classList.remove('red-disabled-text');
    } else if (rocketsFuellerStartedArray.includes(`${rocket}FuelledUp`) && (getCurrentStarSystemWeatherEfficiency()[2] === 'rain' || getCurrentStarSystemWeatherEfficiency()[2] === 'volcano') && getCurrentOptionPane() === rocket) {
        document.getElementById('fuelDescription').textContent = 'Bad Weather!';
        document.getElementById('fuelDescription').classList.remove('green-ready-text');
        document.getElementById('fuelDescription').classList.add('red-disabled-text');
        launchButton.classList.remove('green-ready-text');
        launchButton.classList.add('red-disabled-text');
    }
}

function handleSpaceUpgradeResourceType(element) {
    const dataName = element.dataset.resourceToFuseTo;
    if (dataName.includes('rocket') || dataName.startsWith('ss')) {
        const builtParts = getResourceDataObject('space', ['upgrades', dataName, 'builtParts']);
        const totalParts = getResourceDataObject('space', ['upgrades', dataName, 'parts']);

        const partBuyButton = element.parentElement.parentElement.querySelector('.input-container button');

        const hasRedDisabledTextSpan = Array.from(element.querySelectorAll('span')).some(span => 
            span.classList.contains('red-disabled-text')
        );

        if (hasRedDisabledTextSpan) {
            partBuyButton.classList.add('red-disabled-text');
        }

        if (builtParts === totalParts) {
            const builtPartsElement = document.getElementById(`${dataName}BuiltPartsQuantity`);
            const totalPartsElement = document.getElementById(`${dataName}TotalPartsQuantity`);
            partBuyButton.classList.add('red-disabled-text');
            element.classList.add('green-ready-text');
            builtPartsElement.classList.add('green-ready-text');
            totalPartsElement.classList.add('green-ready-text');
            element.classList.remove('red-disabled-text');
            element.textContent = 'Built!';

            if (dataName.includes('ss') && !getResourceDataObject('space', ['upgrades', dataName, 'finished'])) {
                setResourceDataObject(true, 'space', ['upgrades', dataName, 'finished']);
            }

            if (dataName.includes('rocket') && getLaunchedRockets().includes(dataName)) {
                element.textContent = 'Launched!';
            }
        }

        if (dataName.includes('rocket')) {
            const rocketsBuiltArray = getRocketsBuilt();

            for (let i = 1; i <= 4; i++) {
                const element = document.getElementById('rocket' + i);
                if (element) {
                    if (rocketsBuiltArray.includes('rocket' + i)) {
                        element.parentElement.parentElement.classList.remove('invisible');
                    } else {
                        element.parentElement.parentElement.classList.add('invisible');
                    }
                }
            }
        }
    } else if (dataName.startsWith('fleet')) {
        const quantity = getResourceDataObject('space', ['upgrades', dataName, 'quantity']);
        const maxQuantity = getResourceDataObject('space', ['upgrades', dataName, 'maxCanBuild']);

        const buyButton = element.parentElement.parentElement.querySelector('.input-container button');

        const hasRedDisabledTextSpan = Array.from(element.querySelectorAll('span')).some(span => 
            span.classList.contains('red-disabled-text')
        );

        if (hasRedDisabledTextSpan) {
            buyButton.classList.add('red-disabled-text');
        }

        if (quantity === maxQuantity) {
            const quantityElement = document.getElementById(`${dataName}BuiltQuantity`);
            const maxQuantityElement = document.getElementById(`${dataName}BuiltQuantityMax`);
            buyButton.classList.add('red-disabled-text');
            element.classList.add('green-ready-text');
            quantityElement.classList.add('green-ready-text');
            maxQuantityElement.classList.add('green-ready-text');
            element.classList.remove('red-disabled-text');
            element.textContent = 'Built!';

            if (dataName.includes('fleetEnvoy') && !getResourceDataObject('space', ['upgrades', dataName, 'envoyBuiltYet'])) {
                setResourceDataObject(true, 'space', ['upgrades', dataName, 'envoyBuiltYet']);
            }
        }
    }
}

function checkStatusAndSetTextClasses(element) {
    if (element.id === 'spaceStorageTankResearchDescription' || element.id === 'fleetHologramsDescription' || element.id === 'voidSeersDescription' || element.id === 'rapidExpansionDescription') {
        if (element.innerHTML === 'UNLOCKED' || (element.querySelector('span') && element.querySelector('span').innerHTML === 'UNLOCKED')) {
            element.innerHTML = '<span class="green-ready-text">UNLOCKED</span>';
            element.parentElement.parentElement.parentElement.querySelector('.special-ability').classList.remove('red-disabled-text');
            element.parentElement.parentElement.parentElement.querySelector('.special-ability').classList.add('green-ready-text');
        }
        return;
    }

    if ([...element.classList].some(clas => clas.includes('travel-starship'))) {
        return checkTravelToStarElements(element);
    }

    if (getCurrentOptionPane() === 'colonise' && element.classList.contains('diplomacy-button')) {
        return checkDiplomacyButtons(element);
    }

    if ([...element.classList].some(clas => clas.includes('travel-to-asteroid-button'))) {
        checkTravelToDescriptions(element); //not return as this does not affect element and so still need to check element
    }
    
    if ((element.dataset.resourceToFuseTo === 'travelToAsteroid') && getCurrentOptionPane().startsWith('rocket')) {
        return travelToAsteroidChecks(element);
    }

    if (['searchAsteroid', 'investigateStar', 'pillageVoid'].includes(element.dataset.resourceToFuseTo) && getCurrentOptionPane() === 'space telescope') {
        spaceTelescopeChecks(element, element.dataset.resourceToFuseTo);
    }
    
    if (element.classList.contains('fuel-check')) {
        return powerGenerationFuelChecks(element);
    }

    if (element.classList.contains('energy-check')) {
        return energyChecks(element);
    }

    if (element.classList.contains('powered-check')) {
        return powerOnOrOffChecks(element);
    }
            
    if (element.classList.contains('building-purchase-button')) {
        const earlyReturn = handleVisibilityOfOneOffPurchaseButtonsAndDescriptions(element);
        if (earlyReturn) {
            return;
        }
    }  

    if (element.classList.contains('compound-cost-sell-check') && element.dataset && element.dataset.conditionCheck !== 'undefined' && element.dataset.resourcePriceObject !== 'undefined') {
        if (getCurrentTab()[1].includes('Compounds')) {
            return compoundCostSellCreateChecks(element);
        } else {
            return;
        }
    }

    if (element.classList.contains('resource-cost-sell-check') && element.dataset && element.dataset.conditionCheck !== 'undefined' && element.dataset.resourcePriceObject !== 'undefined') {
        resourceCostSellChecks(element);  
    }

    if (element.id === 'autoSellToggle') {
        return autoSellerChecks(element);
    }

    if (element.id === 'autoCreateToggle') {
       return autoCreateChecks(element);
    }

    if (/^.+[1-4]Toggle$/.test(element.id) || ['scienceKitToggle', 'scienceClubToggle', 'scienceLabToggle'].includes(element.id)) {
        return autoBuyerToggleChecks(element);
    }    
   
    if (element.classList.contains('building-purchase')) {
        setStateOfButtonsBasedOnDescriptionStateForBuildingPurchases(element);
    }
}

function autoBuyerToggleChecks(element) {
    const regex = /^([a-zA-Z]+)([1-4])Toggle$/;
    const match = element.id.match(regex);

    if (match) {
        const item = match[1];
        const tier = parseInt(match[2], 10);

        let resourcesActive = getResourceDataObject('resources', [item, 'upgrades', 'autoBuyer', `tier${tier}`, 'active'], true);
        let active = resourcesActive !== undefined ? resourcesActive : getResourceDataObject('compounds', [item, 'upgrades', 'autoBuyer', `tier${tier}`, 'active'], true);
        
        if (active === undefined) {
            return;
        } else {
            element.checked = active;
        }
        
    }

    const scienceToggles = ['scienceKitToggle', 'scienceClubToggle', 'scienceLabToggle'];
    if (scienceToggles.includes(element.id)) {
        const item = element.id.replace('Toggle', '');
        const active = getResourceDataObject('research', ['upgrades', item, 'active']);
        element.checked = active;
    }
}

function autoCreateChecks(element) {
    const toggleSwitchContainer = element.parentElement;
    const textAutoContainer = toggleSwitchContainer.parentElement.querySelector('.autoBuyer-building-quantity');

    if (getTechUnlockedArray().includes('compoundMachining')) {
        if (toggleSwitchContainer.classList.contains('invisible')) {
            toggleSwitchContainer.classList.remove('invisible');
        }
        if (textAutoContainer && textAutoContainer.classList.contains('invisible')) {
            textAutoContainer.classList.remove('invisible');
        }
        if (!getPowerOnOff()) {
            toggleSwitchContainer.style.pointerEvents = 'none';
            toggleSwitchContainer.style.opacity = '0.5';
        } else {
            toggleSwitchContainer.style.pointerEvents = 'auto';
            toggleSwitchContainer.style.opacity = '1';
        }
    } else {
        if (!toggleSwitchContainer.classList.contains('invisible')) {
            toggleSwitchContainer.classList.add('invisible');
        }
        if (textAutoContainer && !textAutoContainer.classList.contains('invisible')) {
            textAutoContainer.classList.add('invisible');
        }
    }


}


function autoSellerChecks(element) {
    const toggleSwitchContainer = element.parentElement;
    const textAutoContainer = toggleSwitchContainer.parentElement.querySelector('.autoBuyer-building-quantity');

    if (getTechUnlockedArray().includes('nanoBrokers')) {
        if (toggleSwitchContainer.classList.contains('invisible')) {
            toggleSwitchContainer.classList.remove('invisible');
        }
        if (textAutoContainer && textAutoContainer.classList.contains('invisible')) {
            textAutoContainer.classList.remove('invisible');
        }
    } else {
        if (!toggleSwitchContainer.classList.contains('invisible')) {
            toggleSwitchContainer.classList.add('invisible');
        }
        if (textAutoContainer && !textAutoContainer.classList.contains('invisible')) {
            textAutoContainer.classList.add('invisible');
        }
    }
}

function starChecks() {
    const starData = getStarSystemDataObject('stars');
    if (Object.keys(starData).length > 1) {
        document.getElementById('starDataOption').parentElement.parentElement.classList.remove('invisible');
    }
}

function starShipUiChecks() {
    if (getCurrentOptionPane() === 'star ship') {
        const travelToDestinationStarRow = document.getElementById('spaceStarShipTravelRow');
        const scanDestinationStarRow = document.getElementById('spaceStarShipStellarScannerRow');
        const destinationStarDetailsRow = document.getElementById('spaceDestinationStarDetailsRow');

        if (travelToDestinationStarRow) {
            if (getStarShipTravelling() && getStarShipStatus()[0] === 'travelling') {
                travelToDestinationStarRow.classList.remove('invisible');
            } else {
                travelToDestinationStarRow.classList.add('invisible');
            }
        }

        if (scanDestinationStarRow) {
            if (!getDestinationStarScanned() && (getStarShipArrowPosition() > getStellarScannerRange() || getStarShipStatus()[0] === 'orbiting')) {
                scanDestinationStarRow.classList.remove('invisible');
            } else {
                scanDestinationStarRow.classList.add('invisible');
            }
        }

        if (destinationStarDetailsRow) {
            if (getDestinationStarScanned() && getStarShipStatus()[0] === 'orbiting') { // && getStarShipStatus()[0] add invading, landing etc however it is
                destinationStarDetailsRow.classList.remove('invisible');
            } else {
                destinationStarDetailsRow.classList.add('invisible');
            }
        }

        if (getDestinationStarScanned()) {
            getStellarScannerBuilt() ? document.getElementById('descriptionContentTab5').innerHTML = 'Here you can analyse the findings of your System Scan!' : document.getElementById('descriptionContentTab5').innerHTML = 'Without a Stellar Scanner fitted, you cannot determine anything, Good Luck!';
        }
    }

    if (getCurrentOptionPane() !== 'star map' || !getCurrentTab()[1].includes('Interstellar')) {
        removeStarConnectionTooltip();
        removeOrbitCircle();
    }

    if (getCurrentOptionPane() === 'star map' && getStarShipStatus()[0] === 'readyForTravel') {
        const tooltipLayer = document.getElementById('tooltipLayer') || document.body;
        const orbitCircle = drawOrbitCircle(getCurrentStarObject());
        tooltipLayer.appendChild(orbitCircle);
        const arrowHead = drawStarShipArrowhead('', '', 'readyForTravel', orbitCircle);
        tooltipLayer.appendChild(arrowHead);
    }

    const allModulesFinished = Object.entries(getResourceDataObject('space', ['upgrades']))
        .filter(([key]) => key.startsWith('ss') && !key.startsWith('ssStellarScanner'))
        .every(([, upgrade]) => upgrade.finished === true);

    let shipStatus = getStarShipStatus()[0];
    let shouldShowDestinationReminder = allModulesFinished && shipStatus === 'readyForTravel';
    setStarShipDestinationReminderVisible(shouldShowDestinationReminder);

    if (getResourceDataObject('space', ['upgrades']) && !getStarShipTravelling() && shipStatus !== 'readyForTravel' && allModulesFinished) {
        setStarShipStatus(['readyForTravel', null]);
        shipStatus = 'readyForTravel';
        shouldShowDestinationReminder = true;
        setStarShipDestinationReminderVisible(true);

        selectStarShipSidebarOption();
    }
}

function selectStarShipSidebarOption(retryCount = 0) {
    const starShipOptionElement = document.getElementById('starShipOption');
    if (!starShipOptionElement) {
        if (retryCount < 5) {
            setTimeout(() => selectStarShipSidebarOption(retryCount + 1), 100 * (retryCount + 1));
        }
        return;
    }

    document.querySelectorAll('.row-side-menu').forEach(row => row.classList.remove('row-side-menu-selected'));
    starShipOptionElement.closest('.row-side-menu')?.classList.add('row-side-menu-selected');

    setLastScreenOpenRegister('tab5', 'star ship');
    setCurrentOptionPane('star ship');
    setSuppressUiClickSfx(true);
    updateContent('Star Ship', 'tab5', 'content');
    setFirstAccessArray('star ship');
}

function fleetHangarChecks() {
    if (getCurrentOptionPane() === 'fleet hangar') {
        document.getElementById('descriptionContentTab5').innerHTML = `Build your fleets to conquer visited Systems - Fleet Strength: <span class="green-ready-text">${getResourceDataObject('fleets', ['attackPower']).toFixed(0)}</span>`;
        if (getStarShipStatus()[0] !== 'preconstruction' && getStarShipStatus()[0] !== 'readyForTravel' && !getStellarScannerBuilt()) {
            if (document.getElementById('spaceFleetEnvoyBuildRow')) {
                document.getElementById('spaceFleetEnvoyBuildRow').classList.add('invisible');
            }
        }
    }
}

export function getNavigatorLanguage() {
    const languages = navigator.languages || [navigator.language];
    const primaryLanguage = languages[0];
    let region = null;
    try {
        const userLocale = new Intl.Locale(primaryLanguage);
        region = userLocale.region;
    } catch (e) {
    }

    const platform = navigator.platform;
    setUserPlatform([primaryLanguage, region, platform]);
}


function disableTabsLinksAndAutoSaveDuringBattle(battleStart) {
    for (let i = 1; i <= 8; i++) {
        let tab = document.getElementById(`tab${i}`);
        if (tab) {
            tab.classList.toggle("tab-not-yet", battleStart);
        }
    }

    document.querySelectorAll("[id*='Option'], #starMapOption").forEach(element => {
        element.classList.toggle("tab-not-yet", battleStart);
    });    
}

export function updateFleetsAfterDestroyingAUnit(unit) {
    const fleetNamePlayer = 'fleet' + capitaliseString(unit.id.split('_').pop());
    const fleetNameEnemy = unit.id.split('_').pop();
    
    let powerEnemy = 0;

    if (unit.owner === 'enemy') {
        if (fleetNameEnemy.includes('air')) {
            powerEnemy = 2;
        } else if (fleetNameEnemy.includes('land')) {
            powerEnemy = 4;
        } else {
            powerEnemy = 6;
        }
    }
    
    const unitBaseStrength = unit.owner === 'player' ? getResourceDataObject('space', ['upgrades', fleetNamePlayer, 'baseAttackStrength']) : powerEnemy;

    if (unit.owner === 'player') {
        const newQuantity = Math.max(0, Math.floor(getResourceDataObject('space', ['upgrades', fleetNamePlayer, 'quantity']) - 1));
        setResourceDataObject(newQuantity, 'space', ['upgrades', fleetNamePlayer, 'quantity']);
        
        const currentAttackPower = getResourceDataObject('fleets', ['attackPower']);
        const currentDefensePower = getResourceDataObject('fleets', ['defensePower']);
        setResourceDataObject(Math.max(0, currentAttackPower - unitBaseStrength), 'fleets', ['attackPower']);
        setResourceDataObject(Math.max(0, currentDefensePower - unitBaseStrength), 'fleets', ['defensePower']);
    } else {
        const newEnemyFleetsCount = Math.max(0, Math.floor(getStarSystemDataObject('stars', ['destinationStar', 'enemyFleets', fleetNameEnemy]) - 1));
        setStarSystemDataObject(newEnemyFleetsCount, 'stars', ['destinationStar', 'enemyFleets', fleetNameEnemy]);
        
        const currentAttackPowerEnemy = getStarSystemDataObject('stars', ['destinationStar', 'enemyFleets', 'fleetPower']);
        setStarSystemDataObject(Math.max(0, currentAttackPowerEnemy - powerEnemy), 'stars', ['destinationStar', 'enemyFleets', 'fleetPower']);
        
        writeEnemyFleetStats(fleetNameEnemy);
    }
    writeBattleTopDescriptionUpdate();
}


export function writeBattleTopDescriptionUpdate() {
    document.getElementById('descriptionContentTab5').innerHTML = `Defeat The Enemy! - Fleet Power: <span class="green-ready-text">${getResourceDataObject('fleets', ['attackPower']).toFixed(0)}</span> Enemy Fleet Power: <span class="red-disabled-text">${getStarSystemDataObject('stars', ['destinationStar', 'enemyFleets', 'fleetPower']).toFixed(0)}</span>`;
}

export function writeEnemyFleetStats(type) {
    const elementId = `fleet${capitaliseString(type)}Text`;
    const element = document.getElementById(elementId);
    
    if (element) {
        const span = element.querySelector('span');
        if (span) {
            span.innerHTML = getStarSystemDataObject('stars', ['destinationStar', 'enemyFleets', type]);
        }
    }
}

function removeDuplicateIds(id) {
    const elements = document.querySelectorAll(`#${id}`);
    if (elements.length > 1) {
        elements.forEach((el, index) => {
            if (index > 0) el.remove();
        });
    }
}

export function checkBattleOutcome() {
    const battleUnits = getBattleUnits();
    
    function allDisabled(units) {
        return units.every(unit => unit.disabled === true);
    }

    const playerDefeated = allDisabled(battleUnits.player);
    const enemyDefeated = allDisabled(battleUnits.enemy);

    if (playerDefeated) {
        return [true, 'enemy'];
    } else if (enemyDefeated) {
        return [true, 'player'];
    }

    return [false, null];
}

function waitForAnimationEnd(element, animationClass) {
    return new Promise((resolve) => {
        element.classList.add(animationClass);
        element.addEventListener('animationend', function onAnimationEnd() {
            element.removeEventListener('animationend', onAnimationEnd);
            resolve();
        });
    });
}

let settleSystemAfterBattleCalled = false;

async function initiateBattleFadeOut(battleResolved) {
    const battleCanvas = document.getElementById('battleCanvas');
    if (battleCanvas) {
        await waitForAnimationEnd(battleCanvas, 'fade-in-stretch');
        setBattleResolved(true, battleResolved[1]);

        if (battleResolved[1] !== 'enemy' && !settleSystemAfterBattleCalled) {
            settleSystemAfterBattle('battle');
            settleSystemAfterBattleCalled = true; 
        }
    }
}

function resetFleetsToZero(owner) {
    if (owner === 'player') {
        const fleetNames = ['fleetScout', 'fleetMarauder', 'fleetLandStalker', 'fleetNavalStrafer'];
        fleetNames.forEach(fleet => {
            setResourceDataObject(0, 'space', ['upgrades', fleet, 'quantity']);
        });
        setResourceDataObject(0, 'fleets', ['attackPower']);
        setResourceDataObject(0, 'fleets', ['defensePower']);
    } else if (owner === 'enemy') {
        const fleetNames = ['air', 'land', 'sea'];
        fleetNames.forEach(fleet => {
            setStarSystemDataObject(0, 'stars', ['destinationStar', 'enemyFleets', fleet]);
        });
        setStarSystemDataObject(0, 'stars', ['destinationStar', 'enemyFleets', 'fleetPower']);
    }
}

function autoSelectOption(option) {
    const optionElement = document.getElementById(option);
    if (optionElement) {
        optionElement.click();
    }
}

function resetFleetPrices() {
    const fleetBaseCosts = {
        fleetScout: {
            price: 5000,
            resource1Price: [14000, 'hydrogen', 'resources'],
            resource2Price: [1000, 'silicon', 'resources'],
            resource3Price: [300, 'titanium', 'compounds']
        },
        fleetMarauder: {
            price: 7500,
            resource1Price: [14000, 'helium', 'resources'],
            resource2Price: [2000, 'silicon', 'resources'],
            resource3Price: [600, 'titanium', 'compounds']
        },
        fleetLandStalker: {
            price: 9000,
            resource1Price: [22000, 'helium', 'resources'],
            resource2Price: [3000, 'silicon', 'resources'],
            resource3Price: [900, 'titanium', 'compounds']
        },
        fleetNavalStrafer: {
            price: 8000,
            resource1Price: [26000, 'hydrogen', 'resources'],
            resource2Price: [4000, 'silicon', 'resources'],
            resource3Price: [1200, 'titanium', 'compounds']
        }
    };

    Object.entries(fleetBaseCosts).forEach(([fleetType, costs]) => {
        setResourceDataObject(costs.price, 'space', ['upgrades', fleetType, 'price']);
        setResourceDataObject([...costs.resource1Price], 'space', ['upgrades', fleetType, 'resource1Price']);
        setResourceDataObject([...costs.resource2Price], 'space', ['upgrades', fleetType, 'resource2Price']);
        setResourceDataObject([...costs.resource3Price], 'space', ['upgrades', fleetType, 'resource3Price']);
    });
}

function checkAscendencyButtons() {
    const buttons = document.querySelectorAll('.ascendency-buff-button');
    buttons.forEach(button => {
        const buffClass = Array.from(button.classList).find(cls => cls.startsWith('buff-class-'));

        const buffName = buffClass ? buffClass.replace('buff-class-', '').split('-')
            .map((word, index) => index === 0 
            ? word.toLowerCase()
            : word.charAt(0).toUpperCase() + word.slice(1)
            )
            .join('')
            : '';
        
        const buff = getAscendencyBuffDataObject()[buffName];

        if (!buff) return;

        const baseCost = buff.baseCostAp;
        let calculatedCost = baseCost;

        if (buff.rebuyable && buff.boughtYet > 0) {
            calculatedCost *= Math.pow(buff.rebuyableIncreaseMultiple, buff.boughtYet);
        }

        calculatedCost = Math.round(calculatedCost);

        if (getAscendencyPoints() >= calculatedCost && ((buff.rebuyable && buff.timesRebuyable > buff.boughtYet) || (!buff.rebuyable && buff.boughtYet === 0))) {
            button.classList.add('green-ready-text');
            button.classList.remove('red-disabled-text');
        } else {
            button.classList.add('red-disabled-text');
            button.classList.remove('green-ready-text');
        }
    });
}

function updateAscendencyRowTextFields() {
    const ascendencyBuffs = Object.fromEntries(Object.entries(getAscendencyBuffDataObject()).filter(([key]) => key !== "version"));

    Object.keys(ascendencyBuffs).forEach(buffKey => {
        const capitalizedBuffKey = capitaliseString(buffKey);
        const statusElementId = `buff${capitalizedBuffKey}BuyStatusText`;
        const costTextId = `${buffKey}CostText`;

        const buff = ascendencyBuffs[buffKey];
        const rebuyable = buff.rebuyable;
        let statusText = "";

        if (buff.boughtYet === 0) {
            statusText = "Not Bought";
        } else if (!rebuyable) {
            statusText = `<span class="green-ready-text">Bought</span>`;
        } else {
            statusText = `<span class="green-ready-text">Bought * ${buff.boughtYet}</span>`;
        }

        const statusElement = document.getElementById(statusElementId);

        if (statusElement) {
            statusElement.innerHTML = statusText;
        }

        const cost = rebuyable
            ? buff.baseCostAp * Math.pow(buff.rebuyableIncreaseMultiple, buff.boughtYet)
            : buff.baseCostAp;
        const roundedCost = Math.round(cost);

        const costTextElement = document.getElementById(costTextId);

        if (costTextElement) {
            if (buff.rebuyable && buff.timesRebuyable === buff.boughtYet) {
                costTextElement.innerHTML = 'Bought Max';
                costTextElement.classList.add("green-ready-text");
                costTextElement.classList.remove("red-disabled-text");
            } else if (!buff.rebuyable && buff.boughtYet > 0) {
                costTextElement.innerHTML = 'Bought';
                costTextElement.classList.add("green-ready-text");
                costTextElement.classList.remove("red-disabled-text");
            } else {
                costTextElement.innerHTML = `${roundedCost} AP`;

                if (getAscendencyPoints() >= roundedCost) {
                    costTextElement.classList.add("green-ready-text");
                    costTextElement.classList.remove("red-disabled-text");
                } else {
                    costTextElement.classList.add("red-disabled-text");
                    costTextElement.classList.remove("green-ready-text");
                }
            }
        }
    });
}

function ascendencyBuffChecks() {
    const pane = getCurrentOptionPane();
    if (pane === 'ascendency perks') {
        checkAscendencyButtons();
        updateAscendencyRowTextFields();
    }
}

function galacticMarketChecks() {
    if (getCurrentTab()[1].includes('Galactic') && getCurrentOptionPane() === 'galactic market') {
        const galacticMarketOutgoingStockTypeDropDown = document.getElementById('galacticMarketOutgoingStockTypeDropDown');
        const galacticMarketIncomingStockTypeDropDown = document.getElementById('galacticMarketIncomingStockTypeDropDown');

        const galacticMarketQuantityToTradeDropDown = document.getElementById('galacticMarketQuantityToTradeDropDown');
        const galacticMarketQuantityTextArea = document.getElementById('galacticMarketQuantityTextArea');
        const galacticMarketTradeConfirmButton = document.querySelector('.galactic-market-confirm-trade-button');

        const galacticMarketConfirmSellApButton = document.querySelector('.galactic-market-confirm-sell-ap-button');
        const galacticMarketLiquidateForApConfirmButton = document.querySelector('.galactic-market-confirm-liquidate-button');

        if (getGalacticMarketOutgoingStockType() !== 'select' && getHasClickedOutgoingOptionGalacticMarket()) {
            removeAndReplaceOutgoingOptionFromIncomingDropDown(galacticMarketOutgoingStockTypeDropDown, galacticMarketIncomingStockTypeDropDown);
            setHasClickedOutgoingOptionGalacticMarket(false);
        }

        if (getGalacticMarketOutgoingStockType() !== 'select' && getGalacticMarketOutgoingStockType() === getGalacticMarketIncomingStockType()) {
            document.getElementById('galacticMarketIncomingStockTypeDropDown').querySelector('.dropdown-text').textContent = 'Select Resource / Compound';
            setGalacticMarketIncomingStockType('select');
        }

        const galacticMarketQuantityTextAreaIsDisabled = getGalacticMarketOutgoingQuantitySelectionType() !== 'enter';
        galacticMarketQuantityTextArea.classList[galacticMarketQuantityTextAreaIsDisabled ? 'add' : 'remove']('invisible');        

        if (!galacticMarketQuantityTextAreaIsDisabled) {
            const quantityValue = document.getElementById('galacticMarketQuantityTextArea').value;
            
            const dropdownElement = document.getElementById('galacticMarketOutgoingStockTypeDropDown');
            const dataType = dropdownElement
              ? dropdownElement.querySelector(`.dropdown-option[data-value="${dropdownElement.querySelector('.dropdown-text').innerHTML.toLowerCase()}"]`)?.getAttribute('data-type') || null
              : null;

            if (dataType) {
                const playerQuantity = getResourceDataObject(dataType, [getGalacticMarketOutgoingStockType(), 'quantity']);
                
                if (parseInt(quantityValue) > playerQuantity) {
                    document.getElementById('galacticMarketQuantityTextArea').value = playerQuantity;
                    document.getElementById('galacticMarketOutgoingQuantityText').innerHTML = playerQuantity;
                } else {
                    document.getElementById('galacticMarketOutgoingQuantityText').innerHTML = quantityValue === '' ? '0' : quantityValue;
                }
            }
        } else {
            if (getGalacticMarketOutgoingQuantitySelectionType() === 'all') {
                const dropdownElement = document.getElementById('galacticMarketOutgoingStockTypeDropDown');
                const dataType = dropdownElement
                  ? dropdownElement.querySelector(`.dropdown-option[data-value="${dropdownElement.querySelector('.dropdown-text').innerHTML.toLowerCase()}"]`)?.getAttribute('data-type') || null
                  : null;
                
                if (dataType) {
                    const playerQuantity = getResourceDataObject(dataType, [getGalacticMarketOutgoingStockType(), 'quantity']);
                    
                    document.getElementById('galacticMarketQuantityTextArea').value = playerQuantity;
                    document.getElementById('galacticMarketOutgoingQuantityText').innerHTML = playerQuantity;
                }
            }
        }          

        if (getGalacticMarketOutgoingStockType() !== 'select' && getGalacticMarketIncomingStockType() !== 'select') {
            populateSummaryStockType();
            galacticMarketQuantityToTradeDropDown.classList.remove('dropdown-disabled');
            if (document.getElementById('galacticMarketOutgoingQuantityText').innerHTML === 'N/A') {
                document.getElementById('galacticMarketOutgoingQuantityText').innerHTML = 0;
            }
            if (document.getElementById('galacticMarketIncomingQuantityText').innerHTML === 'N/A') {
                document.getElementById('galacticMarketIncomingQuantityText').innerHTML = 0;
            }
            if (document.getElementById('galacticMarketComissionQuantitySummaryText').innerHTML === 'N/A') {
                document.getElementById('galacticMarketComissionQuantitySummaryText').innerHTML = 0;
            }

            if (getGalacticMarketOutgoingQuantitySelectionType() === 'select') {
                document.getElementById('galacticMarketOutgoingQuantityText').innerHTML = 'N/A';
                document.getElementById('galacticMarketIncomingQuantityText').innerHTML = 'N/A';
                document.getElementById('galacticMarketComissionQuantitySummaryText').innerHTML = 'N/A';
            }
            
            document.getElementById('galacticMarketComissionQuantityStockTypeText').innerHTML = capitaliseString(getGalacticMarketOutgoingStockType());

            if (document.getElementById('galacticMarketOutgoingQuantityText').innerHTML !== 'N/A' && parseNumber(document.getElementById('galacticMarketOutgoingQuantityText').innerHTML) > 0) {
                calculateIncomingQuantity();
                const incomingQuantity = getGalacticMarketIncomingQuantity();
                const commissionQuantity = parseNumber(document.getElementById('galacticMarketComissionQuantitySummaryText').innerHTML);
                const commissionAdjustedIncomingQuantity = Math.max(0, Math.floor(incomingQuantity - (commissionQuantity * (incomingQuantity / parseNumber(document.getElementById('galacticMarketOutgoingQuantityText').innerHTML)))));
                document.getElementById('galacticMarketComissionQuantitySummaryText').innerHTML = Math.floor((getCurrentGalacticMarketCommission() / 100) * parseNumber(document.getElementById('galacticMarketOutgoingQuantityText').innerHTML));
                document.getElementById('galacticMarketIncomingQuantityText').innerHTML = commissionAdjustedIncomingQuantity;
            }

        } else {
            galacticMarketQuantityToTradeDropDown.classList.add('dropdown-disabled');
            galacticMarketQuantityToTradeDropDown.querySelector('.dropdown-text').textContent = 'Select Quantity';
            setGalacticMarketOutgoingQuantitySelectionType('select');
            galacticMarketQuantityTextArea.classList.add('invisible');
            document.getElementById('galacticMarketOutgoingStockTypeText').innerHTML = 'N/A';
            document.getElementById('galacticMarketIncomingStockTypeText').innerHTML = 'N/A';
            document.getElementById('galacticMarketOutgoingQuantityText').innerHTML = 'N/A';
            document.getElementById('galacticMarketIncomingQuantityText').innerHTML = 'N/A';
            document.getElementById('galacticMarketComissionQuantitySummaryText').innerHTML = 'N/A';
            document.getElementById('galacticMarketComissionQuantityStockTypeText').innerHTML = 'N/A';
        }

        if (getGalacticMarketIncomingQuantity() !== null && getGalacticMarketIncomingQuantity() > 0) {
            galacticMarketTradeConfirmButton.classList.add('green-ready-text');
            galacticMarketTradeConfirmButton.classList.remove('red-disabled-text');
        } else {
            galacticMarketTradeConfirmButton.classList.remove('green-ready-text');
            galacticMarketTradeConfirmButton.classList.add('red-disabled-text');
        }

        //-------------------
        if (getGalacticMarketSellApForCashQuantity() !== 'select') {
            calculateAndDisplayCashGainForAp(getGalacticMarketSellApForCashQuantity());
        } else {
            document.getElementById('galacticMarketCashGainQuantity').innerHTML = 
            getCurrencySymbol() === '€' ? 0 + getCurrencySymbol() : getCurrencySymbol() + 0;
        }

        if (getGalacticMarketSellApForCashQuantity() !== 'select' && getAscendencyPoints() >= parseNumber(getGalacticMarketSellApForCashQuantity())) {
            galacticMarketConfirmSellApButton.classList.add('green-ready-text');
            galacticMarketConfirmSellApButton.classList.remove('red-disabled-text');
        } else {
            galacticMarketConfirmSellApButton.classList.remove('green-ready-text');
            galacticMarketConfirmSellApButton.classList.add('red-disabled-text');
        }
        
        if (getGalacticMarketLiquidationAuthorization() === 'yes' && !getLiquidatedThisRun() && getApLiquidationQuantity() > 0) {
            galacticMarketLiquidateForApConfirmButton.classList.add('green-ready-text');
            galacticMarketLiquidateForApConfirmButton.classList.remove('red-disabled-text');
        } else {
            galacticMarketLiquidateForApConfirmButton.classList.remove('green-ready-text');
            galacticMarketLiquidateForApConfirmButton.classList.add('red-disabled-text');
        }
    }
}

export function calculateLiquidationValue() {
    const resourcesToInclude = ['hydrogen', 'helium', 'carbon', 'neon', 'oxygen', 'sodium', 'silicon', 'iron'];
    const compoundsToInclude = ['diesel', 'glass', 'steel', 'concrete', 'water', 'titanium'];

    let totalLiquidationValue = 0;

    resourcesToInclude.forEach(resource => {
        const saleValue = getResourceDataObject('resources', [`${resource}`, 'saleValue']);
        const quantity = getResourceDataObject('resources', [`${resource}`, 'quantity']);
        
        if (saleValue !== null && quantity !== null) {
            totalLiquidationValue += saleValue * quantity;
        }
    });

    compoundsToInclude.forEach(compound => {
        const saleValue = getResourceDataObject('compounds', [`${compound}`, 'saleValue']);
        const quantity = getResourceDataObject('compounds', [`${compound}`, 'quantity']);
        
        if (saleValue !== null && quantity !== null) {
            totalLiquidationValue += saleValue * quantity;
        }
    });

    const cash = getResourceDataObject('currency', ['cash']) / getCashLiquidationModifier();
    if (cash !== null) {
        totalLiquidationValue += cash;
    }

    setLiquidationValue(totalLiquidationValue);
    const apCost = getApBuyPrice();
    const apAmount = Math.floor(totalLiquidationValue / apCost);
    let apFromPhilosophy = 0;
    
    if (getPlayerPhilosophy() === 'voidborn' && getStatRun() > 1) {
        apFromPhilosophy = calculateAndAddExtraAPFromPhilosophyRepeatable(getRepeatableTechMultipliers('4'));
    }

    setApLiquidationQuantity(apAmount + apFromPhilosophy);

    if (getCurrentOptionPane() === 'galactic market') {
        document.getElementById('galacticMarketApLiquidationQuantity').innerHTML = getApLiquidationQuantity();
    }
}

export function galacticMarketLiquidateForAp(quantityOfAp) {
    const resourcesToInclude = ['hydrogen', 'helium', 'carbon', 'neon', 'oxygen', 'sodium', 'silicon', 'iron'];
    const compoundsToInclude = ['diesel', 'glass', 'steel', 'concrete', 'water', 'titanium'];

    resourcesToInclude.forEach(resource => {
        setResourceDataObject(0, 'resources', [`${resource}`, 'quantity']);
    });

    compoundsToInclude.forEach(compound => {
        setResourceDataObject(0, 'compounds', [`${compound}`, 'quantity']);
    });

    setResourceDataObject(0, 'currency', ['cash']);

    const newAscendencyPoints = Math.floor(getAscendencyPoints() + quantityOfAp);
    setAscendencyPoints(newAscendencyPoints);
    setLiquidatedThisRun(true);
    setAchievementFlagArray('liquidateAllAssets', 'add');
}


export function galacticMarketSellApForCash(quantityOfAp) {
    if (quantityOfAp === '10') {
        setAchievementFlagArray('trade10APForCash', 'add');
    }

    const currentApPrice = getApSellForCashPrice();
    const amountToCredit = quantityOfAp * currentApPrice;
    setResourceDataObject(getAscendencyPoints() - quantityOfAp, 'ascendencyPoints', ['quantity']);
    setResourceDataObject(getResourceDataObject('currency', ['cash']) + amountToCredit, 'currency', ['cash']);
}

function calculateAndDisplayCashGainForAp(quantityToSell) {
    const apCashPrice = getApSellForCashPrice();    
    const totalApIncomeValue = quantityToSell * apCashPrice;
    
    document.getElementById('galacticMarketCashGainQuantity').innerHTML = 
    getCurrencySymbol() === '€' ? totalApIncomeValue + getCurrencySymbol() : getCurrencySymbol() + totalApIncomeValue;
}

function populateSummaryStockType() {
    document.getElementById('galacticMarketOutgoingStockTypeText').innerHTML = capitaliseString(getGalacticMarketOutgoingStockType());
    document.getElementById('galacticMarketIncomingStockTypeText').innerHTML = capitaliseString(getGalacticMarketIncomingStockType());
}

export function galacticMarketTrade() {
    const currentCommission = getCurrentGalacticMarketCommission();
    const randomIncrease = Math.floor(Math.random() * (13 - 6 + 1)) + 6;
    setCurrentGalacticMarketCommission(Math.min(currentCommission + randomIncrease, 80));

    const typesResources = ['hydrogen', 'helium', 'carbon', 'neon', 'oxygen', 'sodium', 'silicon', 'iron'];
    const typesCompounds = ['diesel', 'glass', 'steel', 'concrete', 'water', 'titanium'];
    const outgoingItem = getGalacticMarketOutgoingStockType();
    const incomingItem = getGalacticMarketIncomingStockType();
    const outgoingType = typesResources.includes(outgoingItem) ? 'resources' : (typesCompounds.includes(outgoingItem) ? 'compounds' : null);
    const incomingType = typesResources.includes(incomingItem) ? 'resources' : (typesCompounds.includes(incomingItem) ? 'compounds' : null);
    const outgoingQuantity = parseNumber(document.getElementById('galacticMarketOutgoingQuantityText').innerHTML);
    const incomingQuantity = getGalacticMarketIncomingQuantity();
    const commissionQuantity = parseNumber(document.getElementById('galacticMarketComissionQuantitySummaryText').innerHTML);
    const playerOutgoingQuantity = getResourceDataObject(outgoingType, [outgoingItem, 'quantity']);
    const playerIncomingQuantity = getResourceDataObject(incomingType, [incomingItem, 'quantity']);
    const commissionAdjustedIncomingQuantity = Math.max(0, Math.floor(incomingQuantity - (commissionQuantity * (incomingQuantity / outgoingQuantity))));
    
    const updatedOutgoingQuantity = Math.floor(playerOutgoingQuantity - outgoingQuantity);
    setResourceDataObject(updatedOutgoingQuantity, outgoingType, [outgoingItem, 'quantity']);
    
    const updatedIncomingQuantity = Math.floor(playerIncomingQuantity + commissionAdjustedIncomingQuantity);
    setResourceDataObject(updatedIncomingQuantity, incomingType, [incomingItem, 'quantity']);
    
    const outgoingTradeVolume = getGalacticMarketDataObject(outgoingType, [outgoingItem, 'tradeVolume']);
    const incomingTradeVolume = getGalacticMarketDataObject(incomingType, [incomingItem, 'tradeVolume']);

    let outgoingMarketBiasChange = 0;
    let incomingMarketBiasChange = 0;

    if (outgoingTradeVolume && outgoingQuantity) {
        outgoingMarketBiasChange = (outgoingQuantity / outgoingTradeVolume) * 100;
    }

    if (incomingTradeVolume && incomingQuantity) {
        incomingMarketBiasChange = (incomingQuantity / incomingTradeVolume) * 100;
    }

    let outgoingCurrentBias = getGalacticMarketDataObject(outgoingType, [outgoingItem, 'marketBias']);
    if (outgoingCurrentBias === undefined) {
        outgoingCurrentBias = 0;
    }

    let incomingCurrentBias = getGalacticMarketDataObject(incomingType, [incomingItem, 'marketBias']);
    if (incomingCurrentBias === undefined) {
        incomingCurrentBias = 0;
    }

    outgoingCurrentBias -= outgoingMarketBiasChange;
    incomingCurrentBias += incomingMarketBiasChange;

    setGalacticMarketDataObject(outgoingCurrentBias, outgoingType, [outgoingItem, 'marketBias']);
    setGalacticMarketDataObject(incomingCurrentBias, incomingType, [incomingItem, 'marketBias']);

    const galacticMarketQuantityToTradeDropDown = document.getElementById('galacticMarketQuantityToTradeDropDown');
    galacticMarketQuantityToTradeDropDown.classList.add('dropdown-disabled');
    galacticMarketQuantityToTradeDropDown.querySelector('.dropdown-text').textContent = 'Select Quantity';
    setGalacticMarketOutgoingQuantitySelectionType('select');
    document.getElementById('galacticMarketQuantityTextArea').value = 0;
    document.getElementById('galacticMarketQuantityTextArea').classList.add('invisible');
    setGalacticMarketIncomingQuantity(0);

    const outgoingMessage = `${Math.floor(outgoingQuantity - commissionQuantity)} ${capitaliseString(outgoingItem)}`;
    const incomingMessage = `${commissionAdjustedIncomingQuantity} ${capitaliseString(incomingItem)}`;
    const commissionMessage = `${commissionQuantity} ${capitaliseString(outgoingItem)}`;
    const notificationMessage = `You have traded ${outgoingMessage} for ${incomingMessage} and paid ${commissionMessage} commission!`;

    showNotification(notificationMessage, 'info', 5000, 3000, 'special');
    setAchievementFlagArray('performGalacticMarketTransaction', 'add');
}

function removeAndReplaceOutgoingOptionFromIncomingDropDown(outgoingDropdown, incomingDropdown) {
    const selectedOutgoingValue = getGalacticMarketOutgoingStockType();

    const staticValues = [
        'hydrogen', 'helium', 'carbon', 'neon', 'oxygen', 
        'sodium', 'silicon', 'iron', 'diesel', 'glass', 
        'steel', 'concrete', 'water', 'titanium'
    ];

    const optionsContainer = incomingDropdown.querySelector('.dropdown-options');
    const outgoingOption = Array.from(optionsContainer.querySelectorAll('.dropdown-option')).find(option => {
        return option.getAttribute('data-value') === selectedOutgoingValue && selectedOutgoingValue !== 'select';
    });

    if (outgoingOption) {
        outgoingOption.remove();
    }

    const currentValues = Array.from(optionsContainer.querySelectorAll('.dropdown-option')).map(option => option.getAttribute('data-value'));
    const allOptions = Array.from(optionsContainer.querySelectorAll('.dropdown-option'));

    staticValues.forEach(staticValue => {
        if (!currentValues.includes(staticValue) && staticValue !== selectedOutgoingValue) {
            const newOption = document.createElement('div');
            newOption.classList.add('dropdown-option');
            newOption.setAttribute('data-value', staticValue);
            newOption.innerHTML = capitaliseString(staticValue);

            newOption.addEventListener('click', (event) => {
                playClickSfx();
                const value = event.target.getAttribute('data-value');
                const selectedOption = allOptions.find(option => option.value === value);
                incomingDropdown.querySelector('.dropdown-text').innerHTML = selectedOption ? selectedOption.text : 'Select an option';

                optionsContainer.classList.remove('show');
                incomingDropdown.style.borderRadius = '10px 10px 10px 10px';
                incomingDropdown.querySelector('.dropdown-text').textContent = capitaliseString(value);
                setGalacticMarketIncomingStockType(value);
            });

            const referenceOption = optionsContainer.querySelector('.dropdown-option[data-value="' + staticValue + '"]');
            if (referenceOption) {
                optionsContainer.insertBefore(newOption, referenceOption);
            } else {
                optionsContainer.appendChild(newOption);
            }
        }
    });

const sortedOptions = staticValues
    .map(staticValue => allOptions.find(option => option.getAttribute('data-value') === staticValue))
    .filter(option => option !== undefined);

    sortedOptions.forEach(option => {
        optionsContainer.appendChild(option);
    });
}

function rebirthChecks() {
    if (getCurrentTab()[1].includes('Galactic')) {
        if (getDestinationStarScanned()) {
            document.getElementById('rebirthOption').parentElement.parentElement.classList.remove('invisible');
        } else {
            document.getElementById('rebirthOption').parentElement.parentElement.classList.add('invisible');
        }
    }

    const [status, winner] = getBattleResolved();

    if (status === true && winner === 'player' && getRebirthPossible() === false) {
        if (getCurrentRunIsMegaStructureRun()) {
            const megaStructure = getStarSystemDataObject('stars', [getCurrentStarSystem(), 'factoryStar']);
            const megastructureNumber = Number(
                Object.keys(factoryStarMap).find(
                    key => factoryStarMap[key] === megaStructure
                )
            );

            if (getMegaStructureTechsResearched().some(arr => Array.isArray(arr) && arr[0] === megastructureNumber && arr[1] === 3)) {
                setRebirthPossible(true);
            } else {
                setRebirthPossible(false);
            }

        } else {
            setRebirthPossible(true);
        }
    }

    if (getCurrentOptionPane() === 'rebirth') {
        if (getRebirthPossible()) {
            document.querySelector('.rebirth-check').classList.remove('red-disabled-text');
            document.querySelector('.rebirth-check').classList.add('green-ready-text');
        } else {
            document.querySelector('.rebirth-check').classList.add('red-disabled-text');
            document.querySelector('.rebirth-check').classList.remove('green-ready-text');
        }
    }
}

async function coloniseChecks() {
    if (getStatRun() > 1 || getApAwardedThisRun()) {
        document.getElementById('ascendencyOption').parentElement.parentElement.classList.remove('invisible');
    }
    
    if (getCurrentOptionPane() === 'colonise' && getCurrentTab()[1].includes('Interstellar')) {
        const battleCanvasContainer = document.getElementById('battleCanvasContainer');

        if (getBattleTriggeredByPlayer() && !getBattleResolved()[0]) {
            const battleResolved = checkBattleOutcome();
            if (battleResolved[0]) {
                drawBattleResultText('battleCanvas', battleResolved[1]);
                await initiateBattleFadeOut(battleResolved);

                disableTabsLinksAndAutoSaveDuringBattle(false);

                if (battleResolved[1] === 'enemy') {
                    resetFleetsToZero('player');
                    setFleetChangedSinceLastDiplomacy(false);
                    setBattleOngoing(false);
                    setBattleTriggeredByPlayer(false);
                    setInFormation(false);
                    setEnemyFleetsAdjustedForDiplomacy(false);
                    resetFleetPrices();
                    autoSelectOption('fleetHangarOption');
                    await showBattlePopup(false);
                } else {
                    setBattleOngoing(false);
                    setBattleTriggeredByPlayer(false);
                    resetFleetsToZero('enemy');
                    setInFormation(false);
                    setEnemyFleetsAdjustedForDiplomacy(false);
                    setFleetChangedSinceLastDiplomacy(false);
                    setAchievementFlagArray('conquerEnemy', 'add');
                    
                    if (getStarSystemDataObject('stars', ['destinationStar', 'lifeformTraits'])[2][0] === 'Hive Mind') {
                        setAchievementFlagArray('conquerHiveMindEnemy', 'add');
                    }
                    
                    if (getBelligerentEnemyFlag()) {
                        setAchievementFlagArray('conquerBelligerentEnemy', 'add');
                        setBelligerentEnemyFlag(false);
                    }

                    if (!getStellarScannerBuilt()) {
                        setAchievementFlagArray('conquerEnemyWithoutScanning', 'add');
                    }
                }
            }
        }

        const fleetPowerPlayer = getResourceDataObject('fleets', ['attackPower']);

        if (battleCanvasContainer && (getBattleResolved()[0] || fleetPowerPlayer === 0)) {
            battleCanvasContainer.classList.add('invisible');
            return;
        }

        removeDuplicateIds('diplomacyOptionsRow');
        removeDuplicateIds('diplomacyImpressionBar');
        removeDuplicateIds('receptionStatusRow');
        removeDuplicateIds('intelligenceRow');
        removeDuplicateIds('enemyFleetsRow');  

        if (!getWarMode()) {
            const patience = getStarSystemDataObject('stars', ['destinationStar', 'patience']);
            const civilizationLevel = getStarSystemDataObject('stars', ['destinationStar', 'civilizationLevel']);

            if (patience <= 0 && fleetPowerPlayer === 0) {
                document.querySelectorAll("button.bully, button.passive, button.harmony, button.conquest, button.vassalize")
                .forEach(button => button.classList.add("red-disabled-text"));
                document.getElementById('descriptionContentTab5').innerHTML = `<span class="green-ready-text">Build Your Fleets to Engage the Enemy! - Fleet Power: </span><span class="red-disabled-text">${getResourceDataObject('fleets', ['attackPower']).toFixed(0)}</span>`;
            } else {
                document.getElementById('descriptionContentTab5').innerHTML = `Engage in Diplomacy and War to establish your new colony at <span class="green-ready-text">${capitaliseWordsWithRomanNumerals(getDestinationStar())}</span> - Fleet Power: <span class="green-ready-text">${getResourceDataObject('fleets', ['attackPower']).toFixed(0)}</span>`;
            }

            const enemyFleetTotals = getStarSystemDataObject('stars', ['destinationStar', 'enemyFleets']);
            const enemyFleetSum = (enemyFleetTotals?.air || 0) + (enemyFleetTotals?.land || 0) + (enemyFleetTotals?.sea || 0);

            if (civilizationLevel === 'None' || civilizationLevel === 'Unsentient' || enemyFleetSum === 0) {
                const conquestButton = document.querySelector('button.conquest');
                if (conquestButton) {
                    conquestButton.innerHTML = 'Settle';
                    conquestButton.classList.remove('red-disabled-text');
                    conquestButton.classList.add('green-ready-text');
                }
                document.getElementById('descriptionContentTab5').innerHTML = `Simply Settle at <span class="green-ready-text">${capitaliseWordsWithRomanNumerals(getDestinationStar())}</span> with no resistance!`;
            }

        } else {
            const descriptionTab = document.getElementById('descriptionContentTab5');
            let button = document.getElementById('battleButton');

            if (getRedrawBattleDescription()) { //set this true when fleet power changes during battle
                writeBattleTopDescriptionUpdate();
                descriptionTab.innerHTML = `Defeat The Enemy! - Fleet Power: <span class="green-ready-text">${getResourceDataObject('fleets', ['attackPower']).toFixed(0)}</span> Enemy Fleet Power: <span class="red-disabled-text">${getStarSystemDataObject('stars', ['destinationStar', 'enemyFleets', 'fleetPower']).toFixed(0)}</span>`;
                button = document.createElement('button');
                button.id = 'battleButton';
                button.classList.add('option-button', 'red-disabled-text', 'battle-button');
                button.innerHTML = 'Attack!';
                button.onclick = function() {
                    disableTabsLinksAndAutoSaveDuringBattle(true);
                    setBattleTriggeredByPlayer(true);
                    setDiplomacyPossible(false);
                    setStarSystemDataObject(0, 'stars', ['destinationStar', 'initialImpression']);
                    setStarSystemDataObject(0, 'stars', ['destinationStar', 'currentImpression']);
                    setStarSystemDataObject('Belligerent', 'stars', ['destinationStar', 'attitude']);
                    calculateAttitude();
                    assignGoalToUnits();
                };
                descriptionTab.appendChild(button);
                setRedrawBattleDescription(false);
            }

            if (button) {
                if (getBattleTriggeredByPlayer()) {
                    button.classList.add('red-disabled-text');
                    button.classList.remove('green-ready-text');
                } else {
                    getInFormation() 
                        ? (button.classList.remove('red-disabled-text'), button.classList.add('green-ready-text')) 
                        : (button.classList.add('red-disabled-text'), button.classList.remove('green-ready-text'));
                }
            }
        }

        if (!getStellarScannerBuilt() || getWarMode()) {
            colonisePrepareWarUI('noScanner');
        }

        if (getWarMode()) {
            const starData = getStarSystemDataObject('stars', ['destinationStar']);
            const playerFleetScout = getResourceDataObject('space', ['upgrades', 'fleetScout', 'quantity']);
            const playerFleetMarauder = getResourceDataObject('space', ['upgrades', 'fleetMarauder', 'quantity']);
            const playerFleetLandStalker = getResourceDataObject('space', ['upgrades', 'fleetLandStalker', 'quantity']);
            const playerFleetNavalStrafer = getResourceDataObject('space', ['upgrades', 'fleetNavalStrafer', 'quantity']);
            const enemyFleets = [starData.enemyFleets.air, starData.enemyFleets.land, starData.enemyFleets.sea];
            const playerFleets = [playerFleetScout, playerFleetMarauder, playerFleetLandStalker, playerFleetNavalStrafer];
            if (getBattleUnits()) {
                drawFleets('battleCanvas', enemyFleets, playerFleets, false);
            } else {
                if (getNeedNewBattleCanvas()) {
                    colonisePrepareWarUI('chooseWar');
                }
            }

            if (getBattleOngoing() && !getNeedNewBattleCanvas()) {                
                moveBattleUnits('battleCanvas');
                assignGoalToUnits();
            }
        }
    }
}

function drawBattleResultText(canvasId, result) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    if (result === 'player') {
        ctx.fillText("Battle Won!", canvasWidth / 2, canvasHeight / 2);
    } else if (result === 'enemy') {
        ctx.fillText("Battle Lost!", canvasWidth / 2, canvasHeight / 2);
    }
}

async function colonisePrepareWarUI(reason) {
    if (!getWarMode()) {
        await showEnterWarModeModal(reason);
    } else {
        setWarUI(false);
    } 
}

function checkDiplomacyButtons(element) {
    const starData = getStarSystemDataObject('stars', ['destinationStar']);
    const civilizationLevel = starData.civilizationLevel;

    const enemyTraitMain = starData.lifeformTraits[0];
    const playerAttackPower = getResourceDataObject('fleets', ['attackPower']);
    const enemyPower = Math.floor(starData.enemyFleets.air + starData.enemyFleets.land + starData.enemyFleets.sea);
    const currentImpression = starData.currentImpression;

    let active = false;

    if (element.classList.contains('conquest')) {
        const enemyFleetSum = Math.floor(starData.enemyFleets.air + starData.enemyFleets.land + starData.enemyFleets.sea);
        if (playerAttackPower > 0 || element.innerHTML === 'Settle' || enemyFleetSum === 0) {
            active = true;
        }
    }

    if (getDiplomacyPossible() && civilizationLevel !== 'None' && civilizationLevel !== 'Unsentient') { 
        const classList = element.classList;

        switch (true) {
            case classList.contains('passive'):
            case classList.contains('harmony'):
                active = true;
                break;

            case classList.contains('bully') && playerAttackPower > enemyPower:
                active = true;
                break;

            case (classList.contains('vassalize') && playerAttackPower > (enemyPower * 1.5) && enemyTraitMain !== 'Aggressive' && currentImpression >= 95) || (getPlayerPhilosophy() === 'supremacist' && getStatRun() > 1 && getPhilosophyAbilityActive() === true && playerAttackPower > enemyPower * 3):
               active = true;
               break;
           
        }
    }    

    if (active) {
        element.classList.remove('red-disabled-text');
        element.classList.add('green-ready-text');
    } else {
        element.classList.add('red-disabled-text');
        element.classList.remove('green-ready-text');
    }
}


function checkTravelToStarElements(element) {
    let starData = null;

    if (getCurrentOptionPane() === 'star map') {
        if (!getStarShipBuilt()) {
            spaceTravelButtonHideAndShowDescription();
        }
        
        const starNameElement = document.getElementById('starDestinationName');
        if (!starNameElement) return;

        const starName = starNameElement.innerText.substring(starNameElement.innerText.indexOf(' ') + 1).toLowerCase();
        const starSystemData = getStarSystemDataObject('stars');

        if (starSystemData.hasOwnProperty(starName)) {
            starData = getStarSystemDataObject('stars', [starName]);
            if (!starData) return;
        } else {
            return;
        }

        const fuelNeeded = starData.fuel;
        const currentAntimatter = getResourceDataObject('antimatter', ['quantity']);
        const canTravel = currentAntimatter >= fuelNeeded && getTechUnlockedArray().includes('FTLTravelTheory');

        if (element.classList.contains('travel-starship-button')) {
            element.classList.toggle('red-disabled-text', !canTravel);
            element.classList.toggle('green-ready-text', canTravel);
            return;
        }

        const themeElement = document.querySelector('[data-theme]');
        if (!themeElement) return;

        const themeStyles = getComputedStyle(themeElement);
        const readyColor = themeStyles.getPropertyValue('--ready-text').trim();
        const disabledColor = themeStyles.getPropertyValue('--disabled-text').trim();

        const labelElement = element.querySelector('span:first-child');
        if (!labelElement) return;

        labelElement.style.color = getStarShipTravelling() ? readyColor : (canTravel ? readyColor : disabledColor);

        if (getStarShipTravelling() && getCurrentTab()[1].includes('Interstellar') && getStarShipStatus()[0] !== 'orbiting') {       
            drawStarConnectionDrawings(getCurrentStarSystem(), getDestinationStar(), 'travelling');
            removeOrbitCircle();
            spaceTravelButtonHideAndShowDescription();
        } else if (getCurrentTab()[1].includes('Interstellar') && getStarShipStatus()[0] === 'orbiting') {
            labelElement.textContent = 'Orbiting...'
            drawStarConnectionDrawings(getCurrentStarSystem(), getDestinationStar(), 'orbiting');
            document.getElementById('starDestinationDescription').textContent = 'Orbiting...';
        }
    }
}

function checkTravelToDescriptions(element) {
    const rocket = getCurrentOptionPane();
    if (getCurrentlyTravellingToAsteroid(rocket)) {
        const timeLeft = Math.floor(getTimeLeftUntilRocketTravelToAsteroidTimerFinishes(rocket) / 1000);
        const labelElement = element.parentElement.parentElement.querySelector('div.description-container label');
        if (!labelElement) {
            return;
        }
        labelElement.classList.add('green-ready-text');
        labelElement.classList.remove('red-disabled-text');
        labelElement.innerHTML = getRocketDirection(rocket)
            ? `Returning ... ${timeLeft}s`
            : `Travelling ... ${timeLeft}s`;
    }
}

export function setSellFuseCreateTextDescriptionClassesBasedOnButtonStates(element, type) {
    if (!element) return;
    const inputContainer = element.parentElement;
    if (!inputContainer) return;
    const descriptionContainer = inputContainer.nextElementSibling;
    if (!descriptionContainer) return;
    const accompanyingLabel = descriptionContainer.querySelector('label');
    if (!accompanyingLabel) return;
    if (type === 'create') {
        if (accompanyingLabel.textContent.includes('!')) {
            accompanyingLabel.classList.add('warning-orange-text');
        } else {
            accompanyingLabel.classList.remove('warning-orange-text');
        }
    } else if (type === 'green') {
        accompanyingLabel.classList.remove('red-disabled-text');
        accompanyingLabel.classList.add('unlocked-tech');
        accompanyingLabel.classList.add('green-ready-text');
        accompanyingLabel.textContent = 'Researched';
    }  else if (type === 'fuse') {
        if (getCurrentOptionPane() === 'iron' || getCurrentOptionPane() === 'sodium') {
            return;
        }
        
        if (accompanyingLabel.textContent.includes('!!')) {
            element.classList.add('warning-orange-text');
            element.classList.remove('red-disabled-text');
            accompanyingLabel.classList.remove('warning-orange-text');
            accompanyingLabel.classList.add('red-disabled-text');
        } else if (accompanyingLabel.textContent.includes('!')) {  //over the storage limit for output element
            element.classList.add('warning-orange-text');
            accompanyingLabel.classList.add('warning-orange-text');
        } else {
            element.classList.remove('warning-orange-text');
            accompanyingLabel.classList.remove('warning-orange-text');
            accompanyingLabel.classList.remove('red-disabled-text');
        }
    }
}

const updateQuantityDisplays = (element, data1, data2, resourceData1, resourceData2, resourceData3, desc) => {
    const [resourcePrice1, resourceName1] = resourceData1 || [null, null];
    const [resourcePrice2, resourceName2] = resourceData2 || [null, null];
    const [resourcePrice3, resourceName3] = resourceData3 || [null, null];

    if (desc) {
        if (element && data2) {
            let priceString = "";
    
            if (data2 === '€') {
                priceString = data1 + data2;
            } else if (data2 === getCurrencySymbol()) {
                priceString = data2 + data1;
            } else {
                if (element.dataset.type !== 'spaceStorageTankResearch' && element.dataset.type !== 'fleetHolograms' && element.dataset.type !== 'voidSeers' && element.dataset.type !== 'rapidExpansion') {
                    priceString = data1 + ' ' + data2;
                } else {
                    if (getPhilosophyAbilityActive()) {
                        priceString = 'UNLOCKED';
                    } else {
                        priceString = data1 + ' ' + data2;
                    }
                }
            }
    
            const resourceParts = [];
            if (resourcePrice1 != null && resourceName1 && resourceName1.trim() !== "") {
                resourceParts.push(resourcePrice1 + " " + resourceName1);
            }
            if (resourcePrice2 != null && resourceName2 && resourceName2.trim() !== "") {
                resourceParts.push(resourcePrice2 + " " + resourceName2);
            }
            if (resourcePrice3 != null && resourceName3 && resourceName3.trim() !== "") {
                resourceParts.push(resourcePrice3 + " " + resourceName3);
            }

            element.innerHTML = "";

            const priceSpan = document.createElement("span");
            priceSpan.className = 'currency-price';
            priceSpan.innerHTML = priceString;
            element.appendChild(priceSpan);
    
            if (resourceParts.length > 0) {
                resourceParts.forEach((resource, index) => {
                    const resourceSpan = document.createElement("span");
                    resourceSpan.className = `resource-price${index + 1}`;
                    resourceSpan.innerHTML = `, ${resource}`;
                    element.appendChild(resourceSpan);
                });
            }
        }     
    } else {
        if (element && data2 >= 0) {
            if (element === getElements().energyQuantity) {
                if (getResourceDataObject('buildings', ['energy', 'batteryBoughtYet'])) {
                    element.textContent = Math.floor(data1) + '/' + Math.floor(data2);
                } else {
                    element.textContent = Math.floor(data1);
                }
            } else if (element === getElements().researchQuantity) {
                element.textContent = Math.floor(data1);
            } else if (element.id && element.id.includes('power')) {
                element.textContent = Math.floor(data1);
            } else {
                element.textContent = Math.floor(data1) + '/' + Math.floor(data2);
            }
        } else if (element) {
            element.textContent = Math.floor(data1);
        }

        if (element && data2 && data1 === data2) {
            element.classList.add('green-ready-text');
        }

        if (element && data2 && data1 !== data2) {
            const baseId = element.id.replace('Quantity', '');
        
            const resourceAutoSell = getResourceDataObject('resources', [baseId, 'autoSell'], true);
            const compoundAutoSell = getResourceDataObject('compounds', [baseId, 'autoSell'], true);
            const compoundsAutoCreate = getResourceDataObject('compounds', [baseId, 'autoCreate'], true);

            if (resourceAutoSell || compoundAutoSell) {  //if autosell is on
                let storageCapacity = 0;
                if (resourceAutoSell) {
                    storageCapacity = getResourceDataObject('resources', [baseId, 'storageCapacity']);
                } else if (compoundAutoSell) {
                    storageCapacity = getResourceDataObject('compounds', [baseId, 'storageCapacity']);
                }

                if (storageCapacity > 100) {
                    element.classList.add('stats-text');
                    element.classList.remove('green-ready-text');
                }
            } else {
                element.classList.remove('stats-text');
            }

            if (compoundsAutoCreate !== undefined) {
                if (compoundsAutoCreate) { // if on
                    const storageCapacity = getResourceDataObject('compounds', [baseId, 'storageCapacity']);
                    const quantity = getResourceDataObject('compounds', [baseId, 'quantity']);

                    if (quantity < storageCapacity) {
                        element.classList.add('stats-text');
                        element.classList.remove('green-ready-text');
                    } else {
                        element.classList.remove('stats-text');
                        element.classList.add('green-ready-text');
                    }
                }
            }
        }        

        if (element && element.classList.contains('green-ready-text') && data1 !== data2) {
            element.classList.remove('green-ready-text');
        }
    }
};

export function increaseAttackAndDefensePower(fleetShipId) {
    if (fleetShipId !== 'fleetEnvoy') {
        const currentAttackPower = getResourceDataObject('fleets', ['attackPower']);
        const currentDefensePower = getResourceDataObject('fleets', ['defensePower']);
        const attackPowerToAdd = getResourceDataObject('space', ['upgrades', fleetShipId, 'baseAttackStrength']);
        const defensePowerToAdd = getResourceDataObject('space', ['upgrades', fleetShipId, 'defenseStrength']);

        setResourceDataObject(currentAttackPower + attackPowerToAdd, 'fleets', ['attackPower']);
        setResourceDataObject(currentDefensePower + defensePowerToAdd, 'fleets', ['defensePower']);
    }   
}

export function sellBuilding(quantityToSell, building) {
    const quantityBuilding = getResourceDataObject('buildings', ['energy', 'upgrades', building, 'quantity']);
    setResourceDataObject(Math.floor(quantityBuilding - quantityToSell), 'buildings', ['energy', 'upgrades', building, 'quantity']);
    
    const rateBuilding = getResourceDataObject('buildings', ['energy', 'upgrades', building, 'rate']);
    const newQuantityBuilding = getResourceDataObject('buildings', ['energy', 'upgrades', building, 'quantity']); 

    const energyRateElement = getElements()[building + 'Rate'];
    energyRateElement.innerHTML = `${Math.floor(rateBuilding * newQuantityBuilding * getTimerRateRatio())} KW / s`

    const priceKeys = [
        { key: 'price', isArray: false },
        { key: 'resource1Price', isArray: true },
        { key: 'resource2Price', isArray: true },
        { key: 'resource3Price', isArray: true },
      ];
      
      const costMultiplier = getGameCostMultiplier();
      const currentCash = getResourceDataObject('currency', ['cash']);
      
      for (let item of priceKeys) {
        let value = getResourceDataObject('buildings', ['energy', 'upgrades', building, item.key]);
      
        if (item.isArray) {
          if (!Array.isArray(value)) value = [value];
          value[0] = Math.floor(value[0] / costMultiplier);
        } else {
          value = Math.floor(value / costMultiplier);
          setResourceDataObject(Math.floor(value * 0.4) + currentCash, 'currency', ['cash']);
          showNotification(`You sold a Power Plant!  Receive: ${getCurrencySymbol()}${Math.floor(value * 0.4)}`);
        }
      
        setResourceDataObject(value, 'buildings', ['energy', 'upgrades', building, item.key]);
      }
}

export function gain(incrementAmount, elementId, item, ABOrTechPurchase, tierAB, resourceCategory, itemType) {
    let resourceType;

    if (resourceCategory === 'research') {
        resourceType = 'research';
    } else if (resourceCategory === 'techs') { 
        resourceType = 'techs';
    } else if (resourceCategory === 'techsPhilosophy') { 
        resourceType = 'techsPhilosophy';
    } else if (resourceCategory === 'scienceUpgrade') { 
        resourceType = 'scienceUpgrade';
    } else if (resourceCategory === 'energy') { 
        resourceType = 'energy';
    } else if (resourceCategory === 'space') { 
        resourceType = 'space';
    } else {
        resourceType = itemType.slice(0, -1);
    }

    let currentQuantity;

    if (item && item === 'techUnlock') {
        currentQuantity = getResourceDataObject('techs', [incrementAmount, 'price']);
    } else if (item && item === 'techUnlockPhilosophy') {
        currentQuantity = getResourceDataObject('philosophyRepeatableTechs', [getPlayerPhilosophy(), incrementAmount, 'price']); 
    } else if (item && item.startsWith('science')) {
        currentQuantity = getResourceDataObject('research', ['upgrades', item, 'quantity']); 
    } else if ((item && item.startsWith('power')) || (item && item.startsWith('battery'))) {
        currentQuantity = getResourceDataObject('buildings', ['energy', 'upgrades', item, 'quantity']);
    } else if ((item && (item.startsWith('rocket') || item.startsWith('ss')))) {
        currentQuantity = getResourceDataObject('space', ['upgrades', item, 'builtParts']);
    } else if ((item && (item.startsWith('fleet')))) {
        currentQuantity = getResourceDataObject('space', ['upgrades', item, 'quantity']);
    } else if (item && item === 'autoBuyer') {
        currentQuantity = getResourceDataObject(itemType, [resourceCategory, 'upgrades', 'autoBuyer', tierAB, 'quantity']);
    } else {
        currentQuantity = getResourceDataObject(itemType, [resourceCategory, 'quantity']);
    }

    if (ABOrTechPurchase) {
        if (ABOrTechPurchase === 'techUnlock' || ABOrTechPurchase === 'techUnlockPhilosophy') {
            setResourceDataObject(getResourceDataObject('research', ['quantity']) - currentQuantity, 'research', ['quantity']);
        } else {
            setResourceDataObject(currentQuantity + incrementAmount, itemType, [resourceCategory, 'upgrades', 'autoBuyer', tierAB, 'quantity']); //ab end up here should add to ab
        }
    } else {
        if (resourceType === 'scienceUpgrade') {
            setResourceDataObject(currentQuantity + incrementAmount, 'research', ['upgrades', item, 'quantity']); 
        } else if (resourceType === 'energy') { 
            setResourceDataObject(currentQuantity + incrementAmount, 'buildings', ['energy', 'upgrades', item, 'quantity']);
            if (item.startsWith('power')) {
                const powerBuildingFuelType = getResourceDataObject('buildings', ['energy', 'upgrades', item, 'fuel'])[0];
                const powerBuildingFuelBurnRate = getResourceDataObject('buildings', ['energy', 'upgrades', item, 'fuel'])[1];
                const powerBuildingFuelCategory = getResourceDataObject('buildings', ['energy', 'upgrades', item, 'fuel'])[2];
                const fuelObject = getResourceDataObject(powerBuildingFuelCategory, [powerBuildingFuelType]);
                setResourceDataObject(fuelObject.usedForFuelPerSec + powerBuildingFuelBurnRate, powerBuildingFuelCategory, [powerBuildingFuelType, 'usedForFuelPerSec']);
                
                if (getActivatedFuelBurnObject(powerBuildingFuelType)) {
                    const actualRateOfPowerBuildingFuel = getResourceDataObject(powerBuildingFuelCategory, [powerBuildingFuelType, 'rate']);
                    setResourceDataObject(actualRateOfPowerBuildingFuel - powerBuildingFuelBurnRate, powerBuildingFuelCategory, [powerBuildingFuelType, 'rate']);
                }
            }
        } else if (resourceType === 'resource' || resourceType === 'compound') {
            const storageCapacity = getResourceDataObject(itemType, [resourceCategory, 'storageCapacity']);
            if (currentQuantity < storageCapacity) {
                getElements()[elementId].classList.remove('green-ready-text');
                setResourceDataObject(currentQuantity + incrementAmount, itemType, [resourceCategory, 'quantity']);
                addToResourceAllTimeStat(incrementAmount, resourceCategory);
            } else {
                setResourceDataObject(storageCapacity, itemType, [resourceCategory, 'quantity']);
            }
            return;
        } else if (resourceType === 'research') {
            getElements()[elementId].classList.remove('green-ready-text');
            setResourceDataObject(currentQuantity + incrementAmount, 'research', ['quantity']);
        } else if (resourceType === 'space' && !item.startsWith('fleet')) {
            setResourceDataObject(currentQuantity + incrementAmount, 'space', ['upgrades', item, 'builtParts']);
            const builtParts = getResourceDataObject('space', ['upgrades', item, 'builtParts']);
            const totalParts = getResourceDataObject('space', ['upgrades', item, 'parts']);

            if (builtParts === totalParts && item.startsWith('rocket')) {
                setRocketsBuilt(item);
            }

            if (builtParts === totalParts && item.startsWith('ss')) {
                setStarShipModulesBuilt(item);
            }
        } else if (item.startsWith('fleet')) {
            setResourceDataObject(currentQuantity + incrementAmount, 'space', ['upgrades', item, 'quantity']);
        }
    }    

    let amountToDeduct;
    let resource1ToDeduct = 0;
    let resource2ToDeduct = 0;
    let resource3ToDeduct = 0;
    let itemSetNewPrice;

    let itemObject;
    let itemToDeduct1Name;
    let priceIncreaseName;

    if (resourceCategory !== 'techsPhilosophy') {
        if (resourceCategory === 'research') {
            itemObject = getResourceDataObject('research', ['upgrades', item]);
        } else if (resourceCategory === 'techs') {
            sortTechRows(false);
            return;
        } else if (resourceCategory === 'scienceUpgrade') {
            itemObject = getResourceDataObject('research', ['upgrades', item]);
        } else if (resourceCategory === 'energy') {
            itemObject = getResourceDataObject('buildings', ['energy', 'upgrades', item]);
        } else if (resourceCategory === 'space') {
            itemObject = getResourceDataObject('space', ['upgrades', item]);
        } else {
            itemObject = getResourceDataObject(itemType, [resourceCategory]);
        }
    } else {
        if (elementId === 'ability') {
            setPhilosophyAbilityActive(true);
            return;
        }
        itemObject = getResourceDataObject('philosophyRepeatableTechs', [getPlayerPhilosophy(), elementId]);
        itemSetNewPrice = itemObject.setPrice;
        amountToDeduct = itemObject.price;
        itemToDeduct1Name = elementId;  
        setCanAffordDeferred(true);     
    }

    let itemToDeduct2Name = '';
    let itemToDeduct3Name = '';
    let itemToDeduct4Name = '';

    let itemCategory1 = '';
    let itemCategory2 = '';
    let itemCategory3 = '';
    let resourcePrices = [[0,''],[0,''],[0,'']];

    if (ABOrTechPurchase !== 'techUnlockPhilosophy') {
        if (ABOrTechPurchase) {
            amountToDeduct = itemObject.upgrades.autoBuyer[tierAB].price;
            itemSetNewPrice = itemObject.upgrades.autoBuyer[tierAB].setPrice;
        } else { //energy / space
            amountToDeduct = itemObject.price;
            if (resourceCategory === 'energy' || resourceCategory === 'space') {
                resource1ToDeduct = itemObject.resource1Price[0];
                resource2ToDeduct = itemObject.resource2Price[0];
                resource3ToDeduct = itemObject.resource3Price[0];
            }
            itemSetNewPrice = itemObject.setPrice;
        }
    
        if (resourceCategory === 'scienceUpgrade' || resourceCategory === 'energy' || resourceCategory === 'space') {
            itemToDeduct1Name = 'cash';
            if (resourceCategory === 'energy' || resourceCategory === 'space') {
                itemToDeduct2Name = itemObject.resource1Price[1];
                itemToDeduct3Name = itemObject.resource2Price[1];
                itemToDeduct4Name = itemObject.resource3Price[1];
    
                itemCategory1 = itemObject.resource1Price[2];
                itemCategory2 = itemObject.resource2Price[2];
                itemCategory3 = itemObject.resource3Price[2];
            }
            resourcePrices = [[resource1ToDeduct, itemToDeduct2Name, itemCategory1], [resource2ToDeduct, itemToDeduct3Name, itemCategory2], [resource3ToDeduct, itemToDeduct4Name, itemCategory3]];
        } else if (ABOrTechPurchase && resourceCategory === 'diesel' && tierAB === 'tier1') {
            itemToDeduct1Name = 'cash';
            amountToDeduct = getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier1', 'price']);
            priceIncreaseName = resourceCategory;
        } else {
            itemToDeduct1Name = itemObject.screenName;
        }
        if (!priceIncreaseName) {
            priceIncreaseName = itemToDeduct1Name;
        }
    
        let itemToDeduct1NameArray = [itemToDeduct1Name];
        let amountToDeductArray = [amountToDeduct];
        let itemTypeArray = [itemType];
    
        setItemsToDeduct(itemToDeduct1NameArray, amountToDeductArray, itemTypeArray, resourcePrices);
    }
    setItemsToIncreasePrice(priceIncreaseName || itemToDeduct1Name, itemSetNewPrice, amountToDeduct, itemType, resourcePrices);
}

export function increaseResourceStorage(elementIds, resource, itemTypeArray) {
    let amountToDeductArray = [];
    let resourceToDeductNamesArray;
    const increaseFactor = getIncreaseStorageFactor() * (getBuffEfficientStorageData()['boughtYet'] + 1);

    if (resource[0] === 'water') {
        resourceToDeductNamesArray = resource;
        const firstResourceStorage = getResourceDataObject(itemTypeArray[0], [resource[0], 'storageCapacity']);

        for (let index = 0; index < resourceToDeductNamesArray.length; index++) {
            if (index > 0) {
                amountToDeductArray.push(firstResourceStorage * 0.3);
            } else {
                amountToDeductArray.push(firstResourceStorage - 1); //to leave power on if increasing storage
            }
        }
    } else {
        resourceToDeductNamesArray = [resource[0]];
        amountToDeductArray[0] = getResourceDataObject(itemTypeArray[0], [resourceToDeductNamesArray, 'storageCapacity']) - 1; //to leave power on if increasing storage
    }

    setItemsToDeduct(resourceToDeductNamesArray, amountToDeductArray, itemTypeArray, [[0,''],[0,''],[0,'']]);

    deferredActions.push(() => {
        const updatedStorageSize = getResourceDataObject(itemTypeArray[0], [resource[0], 'storageCapacity']) * increaseFactor;
        setResourceDataObject(updatedStorageSize, itemTypeArray[0], [resource[0], 'storageCapacity']);
        if (resource.length > 1) {
            setResourceDataObject(updatedStorageSize * 0.3, itemTypeArray[1], [resource[1], 'currentSecondaryIncreasePrice']);
        }
        elementIds.forEach(elementId => {
            getElements()[elementId].classList.remove('green-ready-text');
        });
    });
}

export function revealElement(elementId) {
    const element = document.getElementById(elementId);
    element.classList.remove('invisible');
}

export function startUpdateTimersAndRates(elementName, action) {
    if (elementName.startsWith('science')) {
        startUpdateScienceTimers(elementName);
        return;
    }

    if (elementName.startsWith('power')) {
        startUpdateEnergyTimers(elementName, action);
        return;
    }
}

function startInitialTimers() {
    const resources = getResourceDataObject('resources');
    const compounds = getResourceDataObject('compounds');
    const tiers = [1, 2, 3, 4];

    initialiseAntimatterDeltaTimer();
    initialiseRocketFuelDeltaTimers();
    
    initialiseResourceAutoBuyerDeltaTimers();
    initialiseCompoundAutoBuyerDeltaTimers();

    initialiseResearchDeltaTimer();
    initialiseEnergyDeltaTimer();

    let weatherCountDownToChangeInterval;

    changeWeather(weatherCountDownToChangeInterval);

    let marketBiasAdjustmentInterval;
    startMarketBiasAdjustment();

    function startMarketBiasAdjustment() {
        if (marketBiasAdjustmentInterval) {
            clearInterval(marketBiasAdjustmentInterval);
        }

        const adjustmentIntervalMs = 10000;
        marketBiasAdjustmentInterval = setInterval(() => {
            adjustMarketBiases();
        }, adjustmentIntervalMs);
    }

    let marketCycleCountDownToChangeInterval;
    startMarketCycle();
    
    function startMarketCycle() {
        const randomDurationInMinutes = Math.floor(Math.random() * 3) + 2;
        const randomDurationInMs = randomDurationInMinutes * 60 * 1000;
        const durationInSeconds = randomDurationInMs / 1000;
        //const durationInSeconds = 30; //DEBUG
    
        let timeLeft = durationInSeconds;

        if (marketCycleCountDownToChangeInterval) {
            clearInterval(marketCycleCountDownToChangeInterval);
        }
    
        marketCycleCountDownToChangeInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft -= 1;
            } else {
                calculateNewApForCashPrice();
                calculateNewLiquidationPricePerApGained();
                resetCommission();
                applyMarketChanges();
                startMarketCycle();
            }
        }, 1000);
    }
}

function changeWeather(weatherCountDownToChangeInterval) {
    function selectNewWeather() {
        setResourceDataObject(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'quantity']) * getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'rate']), 'buildings', ['energy', 'upgrades', 'powerPlant2', 'purchasedRate']);
        setWeatherEfficiencyApplied(false);
        const weatherCurrentStarSystemObject = getStarSystemWeather(getCurrentStarSystem());

        const weatherTypes = Object.keys(weatherCurrentStarSystemObject);
        const weatherProbabilities = weatherTypes.map(weatherType => weatherCurrentStarSystemObject[weatherType][0]);
        const totalProbability = weatherProbabilities.reduce((acc, val) => acc + val, 0);
        const randomSelection = Math.random() * totalProbability;

        let cumulativeProbability = 0;
        let selectedWeatherType = '';

        for (let i = 0; i < weatherTypes.length; i++) {
            cumulativeProbability += weatherProbabilities[i];
            if (randomSelection <= cumulativeProbability) {
                selectedWeatherType = weatherTypes[i];
                break;
            }
        }

        const [probability, symbolWeather, efficiencyWeather] = weatherCurrentStarSystemObject[selectedWeatherType];

        const statValueSpan = document.getElementById('stat7');
        const statTitleSpan = statValueSpan.previousElementSibling;

        switch (selectedWeatherType) {
            case 'sunny':
                statValueSpan.classList.add('green-ready-text');
                statValueSpan.classList.remove('warning-orange-text');
                statValueSpan.classList.remove('red-disabled-text');
                break;
            case 'cloudy':
            case 'rain':
                statValueSpan.classList.remove('green-ready-text');
                statValueSpan.classList.add('warning-orange-text');
                statValueSpan.classList.remove('red-disabled-text');
                if (selectedWeatherType === 'rain') {
                    showWeatherNotification('rain');
                }
                break;
            case 'volcano':
                statValueSpan.classList.remove('green-ready-text');
                statValueSpan.classList.remove('warning-orange-text');
                statValueSpan.classList.add('red-disabled-text');
                showWeatherNotification('volcano');
                break;  
        }

        statTitleSpan.textContent = `${capitaliseString(getCurrentStarSystem())}:`;
        statValueSpan.textContent = `${Math.floor(efficiencyWeather * 100)}% ${symbolWeather}`;
        setCurrentStarSystemWeatherEfficiency([getCurrentStarSystem(), efficiencyWeather, selectedWeatherType]);
    }

    selectNewWeather();

    const randomDurationInMinutes = Math.floor(Math.random() * 3) + 1;
    const randomDurationInMs = randomDurationInMinutes * 60 * 1000;

    //const randomDurationInMs = 10000; //DEBUG For Testing Weather

    const durationInSeconds = randomDurationInMs / 1000;

    if (weatherCountDownToChangeInterval) {
        clearInterval(weatherCountDownToChangeInterval);
    }

    let timeLeft = durationInSeconds;

    let precipitationRate = 0;
    let precipitationRateSet = false;
    setCurrentPrecipitationRate(0);
    
    weatherCountDownToChangeInterval = setInterval(() => {
        if (timeLeft > 0) {
            if (getCurrentStarSystemWeatherEfficiency()[2] === 'rain' && !precipitationRateSet) {
                precipitationRate = (Math.floor(Math.random() * 4) + 1) / getTimerRateRatio();
                setCurrentPrecipitationRate(precipitationRate);
                precipitationRateSet = true;
            } else if (!precipitationRateSet) {
                setCurrentPrecipitationRate(0);
                precipitationRateSet = true;
            }

            if (getCurrentStarSystemWeatherEfficiency()[2] === 'rain' || getCurrentStarSystemWeatherEfficiency()[2] === 'volcano') {
                if (getWeatherEffectSetting() && !getWeatherEffectOn()) {
                    startWeatherEffect(getCurrentStarSystemWeatherEfficiency()[2]);
                    setWeatherEffectOn(true);
                }
            }

            timeLeft -= 1;
        } else {
            stopWeatherEffect();
            setWeatherEffectOn(false);
            clearInterval(weatherCountDownToChangeInterval);
            changeWeather(weatherCountDownToChangeInterval);
        }
    }, 1000);
}

function calculateCreatableCompoundAmount(compoundToCreate) {
    const buffer = 100;

    const parts = [1, 2, 3, 4].map(i => {
        const ratio = getResourceDataObject('compounds', [compoundToCreate, `createsFromRatio${i}`]) || 0;
        const [part, type] = getResourceDataObject('compounds', [compoundToCreate, `createsFrom${i}`]) || [];
        const quantity = (type && part) ? getResourceDataObject(type, [part, 'quantity']) || 0 : 0;
        return { quantity, ratio, part };
    });

    const maxCreatableWithBuffer = Math.min(...parts.map(({ quantity, ratio }) => {
        if (ratio > 0) {
            const usableAmount = Math.max(0, quantity - buffer);
            return Math.floor(usableAmount / ratio);
        }
        return Infinity;
    }));

    const resourcesUsed = parts.map(({ ratio, part }) =>
        ratio > 0 ? [maxCreatableWithBuffer * ratio, part] : [0, part]
    );

    return [maxCreatableWithBuffer, ...resourcesUsed];
}

function calculateNewLiquidationPricePerApGained() {
    const basePrice = getApBaseBuyPrice();
    const minPrice = basePrice * 1;
    const maxPrice = basePrice * 1.6;
    
    const newPrice = Math.floor(Math.random() * (maxPrice - minPrice + 1) + minPrice);
    
    setApBuyPrice(newPrice);
}

function calculateNewApForCashPrice() {
    const basePrice = getApBaseSellPrice();
    const minPrice = basePrice * 0.6;
    const maxPrice = basePrice * 1.4;
    
    const newPrice = Math.floor(Math.random() * (maxPrice - minPrice + 1) + minPrice);
    
    setApSellForCashPrice(newPrice);
}

function resetCommission() {
    const currentCommission = getCurrentGalacticMarketCommission();
    const newCommission = Math.max(currentCommission - 20, 10);
    setCurrentGalacticMarketCommission(newCommission);
}

function applyMarketChanges() {
    const galacticMarketResources = getGalacticMarketDataObject('resources');
    for (const resource in galacticMarketResources) {
        if (galacticMarketResources.hasOwnProperty(resource)) {
            const currentQuantity = getResourceDataObject('resources', [resource, 'quantity']);
            if (currentQuantity !== undefined) {
                const randomChange = getRandomQuantityChange(currentQuantity);
                const currentTradeVolume = getGalacticMarketDataObject('resources', [resource, 'tradeVolume']);
                const newTradeVolume = currentTradeVolume + randomChange;

                setGalacticMarketDataObject(newTradeVolume, 'resources', [resource, 'tradeVolume']);

                const currentBias = getGalacticMarketDataObject('resources', [resource, 'marketBias']);
                if (currentBias !== undefined) {
                    const tradeVolumeChangePercentage = ((((newTradeVolume - currentTradeVolume) / currentTradeVolume) * 100) / 100);
                    if (tradeVolumeChangePercentage === Infinity) {
                        return;
                    }

                    let newBias = currentBias;
                    if (tradeVolumeChangePercentage > 0 && newBias !== 0) {
                        newBias -= (Math.abs(tradeVolumeChangePercentage) / 100) * Math.abs(currentBias);
                    }
                    else if (tradeVolumeChangePercentage < 0 && newBias !== 0) {
                        newBias += (Math.abs(tradeVolumeChangePercentage) / 100) * Math.abs(currentBias);
                    }

                    setGalacticMarketDataObject(newBias, 'resources', [resource, 'marketBias']);
                }
            }
        }
    }

    const galacticMarketCompounds = getGalacticMarketDataObject('compounds');
    for (const compound in galacticMarketCompounds) {
        if (galacticMarketCompounds.hasOwnProperty(compound)) {
            const currentQuantity = getResourceDataObject('compounds', [compound, 'quantity']);
            if (currentQuantity !== undefined) {
                const randomChange = getRandomQuantityChange(currentQuantity);
                const currentTradeVolume = getGalacticMarketDataObject('compounds', [compound, 'tradeVolume']);
                const newTradeVolume = currentTradeVolume + randomChange;

                setGalacticMarketDataObject(newTradeVolume, 'compounds', [compound, 'tradeVolume']);

                const currentBias = getGalacticMarketDataObject('compounds', [compound, 'marketBias']);
                if (currentBias !== undefined) {
                    const tradeVolumeChangePercentage = ((((newTradeVolume - currentTradeVolume) / currentTradeVolume) * 100));
                    if (tradeVolumeChangePercentage === Infinity) {
                        return;
                    }

                    let newBias = currentBias;
                    if (tradeVolumeChangePercentage > 0) {
                        newBias -= (Math.abs(tradeVolumeChangePercentage) / 100) * Math.abs(currentBias);
                    }
                    else if (tradeVolumeChangePercentage < 0) {
                        newBias += (Math.abs(tradeVolumeChangePercentage) / 100) * Math.abs(currentBias);
                    }

                    setGalacticMarketDataObject(newBias, 'compounds', [compound, 'marketBias']);
                }
            }
        }
    }
}

function getRandomQuantityChange(playerQuantity) {
    const maxQuantity = 10000000;
    const minQuantity = -1000000;
    let lowerBound, upperBound;

    if (playerQuantity === 0) {
        lowerBound = 100;
        upperBound = 100;
    } else {
        lowerBound = Math.max(playerQuantity * -10, minQuantity);
        upperBound = Math.min(playerQuantity * 10, maxQuantity);
    }

    let randomChange = Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;

    if (playerQuantity + randomChange > maxQuantity) {
        randomChange = maxQuantity - playerQuantity;
    } else if (playerQuantity + randomChange < minQuantity) {
        randomChange = minQuantity - playerQuantity;
    }

    return randomChange;
}

export function calculateIncomingQuantity() {
    const typesResources = ['hydrogen', 'helium', 'carbon', 'neon', 'oxygen', 'sodium', 'silicon', 'iron'];
    const typesCompounds = ['diesel', 'glass', 'steel', 'concrete', 'water', 'titanium'];

    const outgoingItem = getGalacticMarketOutgoingStockType();
    const incomingItem = getGalacticMarketIncomingStockType();

    let outgoingQuantity = parseNumber(document.getElementById('galacticMarketOutgoingQuantityText').innerHTML);

    if (!outgoingQuantity || outgoingQuantity <= 0) {
        outgoingQuantity = 0;
    }

    let outgoingType = typesResources.includes(outgoingItem) ? 'resources' : (typesCompounds.includes(outgoingItem) ? 'compounds' : null);
    let incomingType = typesResources.includes(incomingItem) ? 'resources' : (typesCompounds.includes(incomingItem) ? 'compounds' : null);

    const outgoingItemBasePrice = getGalacticMarketDataObject(outgoingType, [outgoingItem, 'baseValue']);
    const incomingItemBasePrice = getGalacticMarketDataObject(incomingType, [incomingItem, 'baseValue']);

    const outgoingMarketBias = getGalacticMarketDataObject(outgoingType, [outgoingItem, 'marketBias']);
    const incomingMarketBias = getGalacticMarketDataObject(incomingType, [incomingItem, 'marketBias']);

    const adjustedOutgoingPrice = Math.max(0, outgoingItemBasePrice * (1 + (outgoingMarketBias / 100)));
    const adjustedIncomingPrice = Math.max(0, incomingItemBasePrice * (1 + (incomingMarketBias / 100)));    
    const priceRatio = adjustedOutgoingPrice / adjustedIncomingPrice;

    const incomingQuantity = outgoingQuantity > 0 ? Math.floor(outgoingQuantity * priceRatio) : 0;

    setGalacticMarketIncomingQuantity(incomingQuantity);
}

function adjustMarketBiases() {
    const typesResources = ['hydrogen', 'helium', 'carbon', 'neon', 'oxygen', 'sodium', 'silicon', 'iron'];
    const typesCompounds = ['diesel', 'glass', 'steel', 'concrete', 'water', 'titanium'];

    [...typesResources, ...typesCompounds].forEach(itemType => {
        let currentBias;

        if (typesResources.includes(itemType)) {
            currentBias = getGalacticMarketDataObject('resources', [itemType, 'marketBias']);
        } else if (typesCompounds.includes(itemType)) {
            currentBias = getGalacticMarketDataObject('compounds', [itemType, 'marketBias']);
        }

        if (currentBias !== undefined) {
            const biasMagnitude = Math.abs(currentBias);
            let adjustmentStep = 0.05;

            if (biasMagnitude > 1000) {
                adjustmentStep = 50;
            } else if (biasMagnitude > 100) {
                adjustmentStep = 5;
            } else if (biasMagnitude > 10) {
                adjustmentStep = 0.5;
            }

            let newBias = currentBias;

            if (biasMagnitude <= adjustmentStep) {
                newBias = 0;
            } else if (newBias < 0) {
                newBias += adjustmentStep;
            } else if (newBias > 0) {
                newBias -= adjustmentStep;
            }

            setGalacticMarketDataObject(newBias, (typesResources.includes(itemType) ? 'resources' : 'compounds'), [itemType, 'marketBias']);
        }
    });
}

function processAutoSell(item, quantityToSell, type) {
    const price = getResourceDataObject(type, [item, 'saleValue']);
    const cashToAdd = price * quantityToSell;
    setResourceDataObject(getResourceDataObject('currency', ['cash']) + cashToAdd, 'currency', ['cash']);
}

export function purchaseBuff(buff) {
    setAchievementFlagArray('spendAP', 'add');
    const ascendencyBuffDataObject = Object.fromEntries(Object.entries(getAscendencyBuffDataObject()).filter(([key]) => key !== "version"));
    const currentAscendencyPoints = getResourceDataObject('ascendencyPoints', ['quantity']);

    const buffData = ascendencyBuffDataObject[buff];
    const baseCost = buffData.rebuyable
        ? buffData.baseCostAp * Math.pow(buffData.rebuyableIncreaseMultiple, buffData.boughtYet)
        : buffData.baseCostAp;
    const cost = Math.round(baseCost);

    if (currentAscendencyPoints >= cost) {
        const updatedAp = Math.max(0, Math.round(currentAscendencyPoints - cost));
        setResourceDataObject(updatedAp, 'ascendencyPoints', ['quantity']);
        setAscendencyBuffDataObject(buffData.boughtYet + 1, buff, ['boughtYet']);
    }

    if (buff === 'roboticResearchAutomation') {
        setResourceDataObject(true, 'research', ['upgrades', 'autoBuyer', 'active']);
    } else if (buff === 'autoSpaceTelescope') {
        setAutoSpaceTelescopeRowEnabled(true);
    }

    if (buff === 'smartAutoBuyers') {
        buffSmartAutoBuyersRateMultiplier();
    } else if (buff === 'optimizedPowerGrids') {
        buffOptimizedPowerGridsMultiplier();
    }

    if (buff === 'compoundAutomation') {
        if (getStatRun() === 1) {
            callPopupModal(
                modalCompoundMachiningTabUnlockHeader, 
                modalCompoundMachiningTabUnlockText, 
                true, 
                false, 
                false, 
                false, 
                function() {
                    showHideModal();
                },
                null, 
                null, 
                null,
                'CONFIRM',
                null,
                null,
                null,
                false
            );
        }
        setTechUnlockedArray('compoundMachining');
    }
}

export function calculateStarTravelDuration(destination) {
    const starData = getStarSystemDataObject('stars', [destination]);
    if (!starData) return;

    const distance = starData.distance;
    return distance * getStarShipTravelSpeed();
}

function hasStudiedAllRelevantStars() {
    const dummyContainer = document.createElement('div');
    const { stars, starDistanceData } = generateStarfield(
        dummyContainer,
        NUMBER_OF_STARS,
        STAR_FIELD_SEED,
        null,
        true,
        getCurrentStarSystem(),
        false
    ) || { stars: [], starDistanceData: {} };

    if (!Array.isArray(stars) || stars.length === 0) {
        return false;
    }

    const starVisionDistance = getStarVisionDistance();
    const settledStars = new Set((getSettledStars() || []).map(name => name?.toLowerCase()));
    const factoryStars = new Set((getFactoryStarsArray() || []).map(name => name?.toLowerCase()).filter(Boolean));
    const homeStarName = getHomeStarName()?.toLowerCase();
    const currentStarLower = getCurrentStarSystem()?.toLowerCase();

    return stars.every(star => {
        const normalizedName = star.name.toLowerCase();

        if (factoryStars.has(normalizedName)) {
            return true;
        }

        if (homeStarName !== undefined && normalizedName !== homeStarName && settledStars.has(normalizedName)) {
            return true;
        }

        const distance = starDistanceData?.[star.name];

        if (typeof distance !== 'number') {
            return false;
        }

        if (normalizedName === currentStarLower) {
            return true;
        }

        return distance <= starVisionDistance;
    });
}

function getQuantumEngineTravelTimeModifier() {
    const buffData = getBuffQuantumEnginesData();
    if (!buffData) {
        return 1;
    }

    const purchases = Math.max(0, Number(buffData.boughtYet) || 0);
    return Math.pow(0.5, purchases);
}

export function calculateStarTravelDurationWithModifiers(destination) {
    const baseDuration = calculateStarTravelDuration(destination);
    if (baseDuration === undefined) return;

    return baseDuration * getQuantumEngineTravelTimeModifier();
}


function calculateRocketTravelDuration(destinationAsteroid) {
    const asteroidsArray = getAsteroidArray();
    const targetAsteroid = asteroidsArray.find(obj => obj.hasOwnProperty(destinationAsteroid));

    if (!targetAsteroid) return;

    const distance = targetAsteroid[destinationAsteroid].distance[0];
    const speed = getRocketTravelSpeed();

    return Math.floor(distance / speed);  
    //return 10000; //DEBUG
}

export function startTravelToAndFromAsteroidTimer(adjustment, rocket, direction) {
    if (adjustment[1] === 'offlineGains' && !getCurrentlyTravellingToAsteroid(rocket)) {
        return;
    }

    setRocketReadyToTravel(rocket, false);
    setCurrentlyTravellingToAsteroid(rocket, true);

    const timerName = direction ? `${rocket}TravelReturnTimer` : `${rocket}TravelToAsteroidTimer`;
    const destination = getDestinationAsteroid(rocket);

    if (direction) {
        setAchievementFlagArray('mineAllAntimatterAsteroid', 'add');
        setMiningObject(rocket, null);
    }

    if (timerManagerDelta.hasTimer(timerName)) {
        return;
    }

    let totalDuration = getRocketTravelDuration()[rocket];
    if (adjustment[0] === 0 || !totalDuration) {
        totalDuration = calculateRocketTravelDuration(destination);
        setRocketTravelDuration(rocket, totalDuration);
    }

    let timeRemaining = adjustment[0] === 0 ? totalDuration : adjustment[0];
    setTimeLeftUntilRocketTravelToAsteroidTimerFinishes(rocket, timeRemaining);

    timerManagerDelta.addTimer(timerName, {
        durationMs: 0,
        repeat: true,
        onUpdate: ({ deltaMs }) => {
            timeRemaining = Math.max(timeRemaining - deltaMs, 0);
            setTimeLeftUntilRocketTravelToAsteroidTimerFinishes(rocket, timeRemaining);

            const travelTimerDescriptionElement = document.getElementById('travelToDescription');
            const timeLeftUI = Math.max(Math.floor(timeRemaining / 1000), 0);

            if (timeRemaining <= 0) {
                timerManagerDelta.removeTimer(timerName);

                if (direction) {
                    sfxPlayer.playAudio('rocketLand', false);
                    showNotification(`${getRocketUserName(rocket)} has returned to be refuelled!`, 'info', 3000, 'rocket');
                    resetRocketForNextJourney(rocket);
                } else {
                    showNotification(`${getRocketUserName(rocket)} has reached ${destination} and started mining Antimatter!`, 'info', 3000, 'rocket');
                    addToResourceAllTimeStat(1, 'asteroidsMined');

                    if (travelTimerDescriptionElement) {
                        travelTimerDescriptionElement.innerText = 'Mining Antimatter at ' + destination;
                    }

                    if (!getAntimatterUnlocked()) {
                        setAntimatterUnlocked(true);
                    }

                    setMiningObject(rocket, destination);
                }

                setTimeLeftUntilRocketTravelToAsteroidTimerFinishes(rocket, 0);
                setCurrentlyTravellingToAsteroid(rocket, false);
            } else if (travelTimerDescriptionElement) {
                travelTimerDescriptionElement.classList.remove('red-disabled-text');
                travelTimerDescriptionElement.classList.add('green-ready-text');
                travelTimerDescriptionElement.innerText = direction
                    ? `Returning ... ${timeLeftUI}s`
                    : `Travelling ... ${timeLeftUI}s`;

                const elapsedTime = getRocketTravelDuration()[rocket] - getTimeLeftUntilRocketTravelToAsteroidTimerFinishes(rocket);
                const progressBarPercentage = (elapsedTime / getRocketTravelDuration()[rocket]) * 100;
                const progressBar = document.getElementById(`spaceTravelToAsteroidProgressBar${capitaliseString(rocket)}`);
                if (progressBar) {
                    progressBar.style.width = `${progressBarPercentage}%`;
                }
            }
        },
        metadata: { type: 'spaceTravel', action: direction ? 'returnRocket' : 'travelToAsteroid', rocket }
    });
}

export function startTravelToDestinationStarTimer(adjustment) {
    if (adjustment[1] === 'offlineGains' && !getStarShipTravelling()) {
        return;
    }

    setStarShipTravelling(true);

    const destination = getDestinationStar();
    const timerName = 'starShipTravelToDestinationStarTimer';
    setStarShipStatus(['travelling', destination]);

    if (timerManagerDelta.hasTimer(timerName)) {
        return;
    }

    let totalDuration = getStarTravelDuration();
    if (adjustment[0] === 0 || !totalDuration) {
        totalDuration = calculateStarTravelDurationWithModifiers(destination);
        setStarTravelDuration(totalDuration);
    }

    let timeRemaining = adjustment[0] === 0 ? totalDuration : adjustment[0];
    setTimeLeftUntilTravelToDestinationStarTimerFinishes(timeRemaining);

    timerManagerDelta.addTimer(timerName, {
        durationMs: 0,
        repeat: true,
        onUpdate: ({ deltaMs }) => {
            timeRemaining = Math.max(timeRemaining - deltaMs, 0);
            setTimeLeftUntilTravelToDestinationStarTimerFinishes(timeRemaining);

            const travelTimerDescriptionElement = document.getElementById('travellingToDescription');
            const timeLeftUI = Math.max(Math.floor(timeRemaining / 1000), 0);
            const starData = getStarSystemDataObject('stars', [destination]);
            const distance = starData.distance;

            if (timeRemaining <= 0) {
                timerManagerDelta.removeTimer(timerName);
                showNotification(`StarShip has reached orbit of the ${capitaliseWordsWithRomanNumerals(destination)} system!`, 'info', 3000, 'starShip');

                if (travelTimerDescriptionElement) {
                    travelTimerDescriptionElement.innerText = 'Orbiting ' + capitaliseWordsWithRomanNumerals(destination);
                }

                setTimeLeftUntilTravelToDestinationStarTimerFinishes(0);
                setStarShipStatus(['orbiting', destination]);

                if (getStatRun() === 1) {
                    if (!getTechUnlockedArray().includes('apAwardedThisRun')) {
                        setTechUnlockedArray('apAwardedThisRun');
                    }
                    callPopupModal(
                        modalGalacticTabUnlockHeader,
                        modalGalacticTabUnlockText,
                        true,
                        false,
                        false,
                        false,
                        function() {
                            showHideModal();
                            showNotification('Galactic Tab Unlocked!', 'warning', 3000, 'special');
                        },
                        null,
                        null,
                        null,
                        'CONFIRM',
                        null,
                        null,
                        null,
                        false
                    );
                }

                if (getFactoryStarsArray().includes(getDestinationStar())) {
                    const header = 'MEGASTRUCTURE';
                    const content = `Your Starship arrived at the <span class="factory-star-text">${capitaliseWordsWithRomanNumerals(getDestinationStar())}</span> System!<br>You gasp at what you see! The main star has been completely enveloped by a gigantic structure!<br>It looks to be some kind of <span class="factory-star-text">${getStarSystemDataObject('stars', [getDestinationStar(), 'factoryStar'])}</span><br>No wonder we didn't discover this System before,<br>the star is not visible due to the size of this structure!<br>This system is going to be heavily defended for sure, but if we can conquer it,<br>for sure it will open up vast opportunities for us...`;
                    callPopupModal(
                        header,
                        content,
                        true,
                        false,
                        false,
                        false,
                        function() {
                            showHideModal();
                            if (getStatRun() === 1) {
                                showNotification('Galactic Tab Unlocked!', 'warning', 3000, 'special');
                            }
                        },
                        null,
                        null,
                        null,
                        'CONFIRM',
                        null,
                        null,
                        null,
                        false
                    );
                }

                addToResourceAllTimeStat(distance, 'starShipTravelDistance');
            } else {
                const elapsedTime = getStarTravelDuration() - getTimeLeftUntilTravelToDestinationStarTimerFinishes();
                const normalizedElapsedTime = elapsedTime / getStarTravelDuration();

                if (travelTimerDescriptionElement) {
                    travelTimerDescriptionElement.classList.remove('red-disabled-text');
                    travelTimerDescriptionElement.classList.add('green-ready-text');
                    travelTimerDescriptionElement.innerText = `Travelling ... ${timeLeftUI}s`;

                    const progressBar = document.getElementById('spaceTravelToStarProgressBar');
                    if (progressBar) {
                        progressBar.style.width = `${normalizedElapsedTime * 100}%`;
                    }
                }

                setStarShipArrowPosition(normalizedElapsedTime);
                const distanceTravelled = ((distance * normalizedElapsedTime * 100) / 100).toFixed(2);
                addToResourceAllTimeStat(distanceTravelled, 'starShipTravelDistance');
            }
        },
        metadata: { type: 'spaceTravel', action: 'travelToStar' }
    });
}

export function resetRocketForNextJourney(rocket) {
    setResourceDataObject(0, 'space', ['upgrades', rocket, 'fuelQuantity']);
    setRocketsFuellerStartedArray(rocket, 'remove', 'reset');
    setLaunchedRockets(rocket, 'remove');
    setTimeLeftUntilRocketTravelToAsteroidTimerFinishes(rocket, 0);
    setRocketTravelDuration(rocket, 0);
    setDestinationAsteroid(rocket, null);
    setRocketDirection(rocket, false);
    setCheckRocketFuellingStatus(rocket, false);
    setRocketReadyToTravel(rocket, true);
    switchFuelGaugeWhenFuellerBought(rocket, 'reset');

    if (timerManagerDelta.hasTimer(`${rocket}TravelToAsteroidTimer`)) {
        timerManagerDelta.removeTimer(`${rocket}TravelToAsteroidTimer`);
    }
    
    if (timerManagerDelta.hasTimer(`${rocket}TravelReturnTimer`)) {
        timerManagerDelta.removeTimer(`${rocket}TravelReturnTimer`);
    }
}

export function startPillageVoidTimer(adjustment) {
    if (!getPillageVoidTimerCanContinue()) {
        return;
    }

    if (adjustment[1] === 'offlineGains' && !getCurrentlyPillagingVoid()) {
        return;
    }

    setTelescopeReadyToSearch(false);
    setCurrentlyPillagingVoid(true);
    const timerName = 'pillageVoidTimer';

    if (timerManagerDelta.hasTimer(timerName)) {
        return;
    }

    let totalDuration = getCurrentPillageVoidTimerDurationTotal();
    if (adjustment[0] === 0 || !totalDuration) {
        totalDuration = getPillageVoidDuration();
        setCurrentPillageVoidTimerDurationTotal(totalDuration);
    }

    let timeRemaining = adjustment[0] === 0 ? totalDuration : adjustment[0];
    setTimeLeftUntilPillageVoidTimerFinishes(timeRemaining);

    timerManagerDelta.addTimer(timerName, {
        durationMs: 0,
        repeat: true,
        onUpdate: ({ deltaMs }) => {
            if (!getPillageVoidTimerCanContinue()) {
                timerManagerDelta.pauseTimer(timerName);
                return;
            }

            timeRemaining = Math.max(timeRemaining - deltaMs, 0);
            setTimeLeftUntilPillageVoidTimerFinishes(timeRemaining);
            const pillageVoidTimerDescriptionElement = document.getElementById('pillageTheVoidDescription');
            const timeLeftUI = Math.max(Math.floor(timeRemaining / 1000), 0);

            if (timeRemaining <= 0) {
                gainPillageVoidResourcesAndCompounds();
                timerManagerDelta.removeTimer(timerName);
                if (pillageVoidTimerDescriptionElement) {             
                    pillageVoidTimerDescriptionElement.innerText = 'Ready To Pillage';
                }
                setTelescopeReadyToSearch(true);
                setCurrentlyPillagingVoid(false);
                setTimeLeftUntilPillageVoidTimerFinishes(0);
            } else if (pillageVoidTimerDescriptionElement) {
                pillageVoidTimerDescriptionElement.classList.add('green-ready-text');
                pillageVoidTimerDescriptionElement.innerText = `Pillaging ... ${timeLeftUI}s`;
                const elapsedTime = getCurrentPillageVoidTimerDurationTotal() - getTimeLeftUntilPillageVoidTimerFinishes();
                const progressBarPercentage = (elapsedTime / getCurrentPillageVoidTimerDurationTotal()) * 100;
                document.getElementById('spaceTelescopePillageVoidProgressBar').style.width = `${progressBarPercentage}%`;
            }
        },
        metadata: { type: 'spaceTelescope', action: 'pillage-void' }
    });
}

export function startInvestigateStarTimer(adjustment) {
    if (!getStarInvestigationTimerCanContinue()) {
        return;
    }

    if (adjustment[1] === 'offlineGains' && !getCurrentlyInvestigatingStar()) {
        return;
    }

    setTelescopeReadyToSearch(false);
    setCurrentlyInvestigatingStar(true);

    const timerName = 'investigateStarTimer';
    if (timerManagerDelta.hasTimer(timerName)) {
        return;
    }

    let totalDuration = getCurrentInvestigateStarTimerDurationTotal();
    if (adjustment[0] === 0 || !totalDuration) {
        totalDuration = getStarInvestigationDuration();
        setCurrentInvestigateStarTimerDurationTotal(totalDuration);
    }

    let timeRemaining = adjustment[0] === 0 ? totalDuration : adjustment[0];
    setTimeLeftUntilStarInvestigationTimerFinishes(timeRemaining);

    timerManagerDelta.addTimer(timerName, {
        durationMs: 0,
        repeat: true,
        onUpdate: ({ deltaMs }) => {
            if (!getStarInvestigationTimerCanContinue()) {
                timerManagerDelta.pauseTimer(timerName);
                return;
            }

            timeRemaining = Math.max(timeRemaining - deltaMs, 0);
            setTimeLeftUntilStarInvestigationTimerFinishes(timeRemaining);

            const searchTimerDescriptionElement = document.getElementById('studyStarsDescription');
            const timeLeftUI = Math.max(Math.floor(timeRemaining / 1000), 0);

            if (timeRemaining <= 0) {
                extendStarDataRange(false);
                if (!getPlayerPhilosophy()) {
                    callPopupModal(
                        modalPlayerLeaderPhilosophyHeaderText, 
                        modalPlayerLeaderPhilosophyContentText, 
                        true, 
                        true, 
                        true, 
                        true, 
                        function() {  
                            setPlayerPhilosophy('constructor');
                            showNotification('You are a CONSTRUCTOR!', 'warning', 3000, 'special');
                            showHideModal();
                            removeModalButtonTooltips();
                        }, 
                        function() {  
                            setPlayerPhilosophy('supremacist');
                            showNotification('You are a SUPREMACIST!', 'warning', 3000, 'special');
                            showHideModal();
                            removeModalButtonTooltips();
                        }, 
                        function() {  
                            setPlayerPhilosophy('voidborn');
                            showNotification('You are VOIDBORN!', 'warning', 3000, 'special');
                            showHideModal();
                            removeModalButtonTooltips();
                        }, 
                        function() {  
                            setPlayerPhilosophy('expansionist');
                            showNotification('You are an EXPANSIONIST!', 'warning', 3000, 'special');
                            showHideModal();
                            removeModalButtonTooltips();
                        }, 
                        'CONSTRUCTOR', 
                        'SUPREMACIST', 
                        'VOIDBORN', 
                        'EXPANSIONIST',
                        true
                    );
                }

                timerManagerDelta.removeTimer(timerName);
                if (searchTimerDescriptionElement) {             
                    searchTimerDescriptionElement.innerText = 'Ready To Study';
                }
                setTelescopeReadyToSearch(true);
                setCurrentlyInvestigatingStar(false);
                setTimeLeftUntilStarInvestigationTimerFinishes(0);
            } else if (searchTimerDescriptionElement) {
                searchTimerDescriptionElement.classList.add('green-ready-text');
                searchTimerDescriptionElement.innerText = `Studying ... ${timeLeftUI}s`;
                const elapsedTime = getCurrentInvestigateStarTimerDurationTotal() - getTimeLeftUntilStarInvestigationTimerFinishes();
                const progressBarPercentage = (elapsedTime / getCurrentInvestigateStarTimerDurationTotal()) * 100;
                document.getElementById('spaceTelescopeInvestigateStarProgressBar').style.width = `${progressBarPercentage}%`;
            }
        },
        metadata: { type: 'spaceTelescope', action: 'investigate-star' }
    });
}

export function startSearchAsteroidTimer(adjustment) {
    if (!getAsteroidTimerCanContinue()) {
        return;
    }

    if (adjustment[1] === 'offlineGains' && !getCurrentlySearchingAsteroid()) {
        return;
    }

    const fasterAsteroidScanBuffAdjustment = getBuffFasterAsteroidScanData()['boughtYet'];
    const fasterAsteroidsScanBuffMultiplier = getBuffFasterAsteroidScanData()['effectCategoryMagnitude'];

    setTelescopeReadyToSearch(false);
    setCurrentlySearchingAsteroid(true);
    const timerName = 'searchAsteroidTimer';

    if (timerManagerDelta.hasTimer(timerName)) {
        return;
    }

    let totalDuration = getCurrentAsteroidSearchTimerDurationTotal();
    if (adjustment[0] === 0 || !totalDuration) {
        totalDuration = getAsteroidSearchDuration();
        if (fasterAsteroidScanBuffAdjustment > 0) {
            totalDuration = totalDuration * (1 - (fasterAsteroidsScanBuffMultiplier * fasterAsteroidScanBuffAdjustment));
        }
        setCurrentAsteroidSearchTimerDurationTotal(totalDuration);
    }

    let timeRemaining = adjustment[0] === 0 ? totalDuration : adjustment[0];
    setTimeLeftUntilAsteroidScannerTimerFinishes(timeRemaining);

    timerManagerDelta.addTimer(timerName, {
        durationMs: 0,
        repeat: true,
        onUpdate: ({ deltaMs }) => {
            if (!getAsteroidTimerCanContinue()) {
                timerManagerDelta.pauseTimer(timerName);
                return;
            }

            timeRemaining = Math.max(timeRemaining - deltaMs, 0);
            setTimeLeftUntilAsteroidScannerTimerFinishes(timeRemaining);
            const searchTimerDescriptionElement = document.getElementById('scanAsteroidsDescription');
            const timeLeftUI = Math.max(Math.floor(timeRemaining / 1000), 0);

            if (timeRemaining <= 0) {
                discoverAsteroid(false);
                timerManagerDelta.removeTimer(timerName);
                if (searchTimerDescriptionElement) {             
                    searchTimerDescriptionElement.innerText = 'Ready To Search';
                }
                setTelescopeReadyToSearch(true);
                setCurrentlySearchingAsteroid(false);
                setTimeLeftUntilAsteroidScannerTimerFinishes(0);
            } else if (searchTimerDescriptionElement) { 
                searchTimerDescriptionElement.classList.add('green-ready-text');
                searchTimerDescriptionElement.innerText = `Searching ... ${timeLeftUI}s`;
                const elapsedTime = getCurrentAsteroidSearchTimerDurationTotal() - getTimeLeftUntilAsteroidScannerTimerFinishes();
                const progressBarPercentage = (elapsedTime / getCurrentAsteroidSearchTimerDurationTotal()) * 100;
                document.getElementById('spaceTelescopeSearchAsteroidProgressBar').style.width = `${progressBarPercentage}%`;
            }
        },
        metadata: { type: 'spaceTelescope', action: 'search-asteroid' }
    });
}

function getAsteroidSearchDuration() {
    const baseTimeDuration = getBaseSearchAsteroidTimerDuration();
    const variance = baseTimeDuration * 0.2; // 20% variance
    const randomOffset = (Math.random() * 2 - 1) * variance;
    return baseTimeDuration + randomOffset;
}

function getStarInvestigationDuration() {
    const baseTimeDuration = getBaseInvestigateStarTimerDuration();
    const variance = baseTimeDuration * 0.2; // 20% variance
    const randomOffset = (Math.random() * 2 - 1) * variance;
    return baseTimeDuration + randomOffset;
}

function getPillageVoidDuration() {
    const baseTimeDuration = getBasePillageVoidTimerDuration();
    const variance = baseTimeDuration * 0.2; // 20% variance
    const randomOffset = (Math.random() * 2 - 1) * variance;
    return baseTimeDuration + randomOffset;
}

function getRandomNewsTickerInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min) * 1000;
}

export function startNewsTickerTimer() {
    if (getNewsTickerSetting()) {
        const randomDuration = getRandomNewsTickerInterval(20, 35);

        if (timerManager.getTimer('newsTicker')) {
            timerManager.removeTimer('newsTicker');
        }
    
        timerManager.addTimer('newsTicker', randomDuration, () => {
            showNewsTickerMessage(newsTickerContent);
            timerManager.removeTimer('newsTicker');
        });       
    } else {
        if (timerManager.getTimer('newsTicker')) {
            timerManager.removeTimer('newsTicker');
        }
    }
}

function startUpdateScienceTimers(elementName) {
    let newResearchRate;
    let newResearchRatePower = getResourceDataObject('research', ['ratePower']);
    const upgradeRatePerUnit = getResourceDataObject('research', ['upgrades', elementName, 'rate']);
    
    if (getResourceDataObject('research', ['upgrades', elementName, 'energyUse']) > 0) {
        newResearchRatePower = getResourceDataObject('research', ['ratePower']) + upgradeRatePerUnit;
    }
       
    newResearchRate = getResourceDataObject('research', ['rate']) + upgradeRatePerUnit;
    
    setResourceDataObject(newResearchRatePower, 'research', ['ratePower']);
    setResourceDataObject(newResearchRate, 'research', ['rate']);
}

function startUpdateEnergyTimers(elementName, action) {
    if (elementName.startsWith('power')) {
        let newEnergyRate = 0;
        const powerBuildingPotentialPower = getResourceDataObject('buildings', ['energy', 'upgrades', elementName, 'purchasedRate']);
        
        if (action === 'toggle') {
            if (getBuildingTypeOnOff(elementName)) {
                getElements()[elementName + 'Rate'].textContent = `${Math.floor(powerBuildingPotentialPower * getTimerRateRatio())} KW / s`;
            } else {
                getElements()[elementName + 'Rate'].textContent = `0 KW / s`;
            }
        } else if (action === 'buy') {
            getElements()[elementName + 'Rate'].textContent = `${Math.floor(powerBuildingPotentialPower * getTimerRateRatio())} KW / s`;
        }

        if (getInfinitePower()) {
            setResourceDataObject(getInfinitePowerRate(), 'buildings', ['energy', 'rate']);
        } else {
            setResourceDataObject(newEnergyRate, 'buildings', ['energy', 'rate']);
        }
    }
}

function formatAllNotationElements(element, notationType) {
        const originalContent = element.innerHTML;
        const formattedContent = originalContent.replace(/-?\d+(\.\d+)?/g, match => {
            let number = parseFloat(match);

            if (isNaN(number)) {
                console.warn(`Invalid number found: ${match}`);
                return match;
            }

            if (notationType === 'normal') {
                return number;
            } else if (notationType === 'normalCondensed') {
                if (element.id === 'cashStat') {
                    const formatNumber = (num, divisor) => {
                        const result = num / divisor;
                        const fraction = result % 1;
                        return (fraction === 0 || fraction === 0.1 || fraction === 0.9) 
                            ? result.toFixed(0) 
                            : result.toFixed(1);
                    };
                
                    if (number >= 1e13) {
                        let exponent = Math.floor(Math.log10(number));
                        const scaledNumber = number / Math.pow(10, exponent);
                        const fraction = scaledNumber % 1;
                        return `${(fraction === 0 || fraction === 0.1 || fraction === 0.9 
                            ? scaledNumber.toFixed(0) 
                            : scaledNumber.toFixed(1))}e${exponent}`;
                    } else if (number >= 1e12) {
                        return `${formatNumber(number, 1e12)}e12`;
                    } else if (number >= 1e9) {
                        return `${formatNumber(number, 1e9)}B`;
                    } else if (number >= 1e6) {
                        return `${formatNumber(number, 1e6)}M`;
                    } else if (number >= 1e3) {
                        return `${formatNumber(number, 1e3)}K`;
                    } else {
                        return Math.round(number).toFixed(0);
                    }
                }                
            
                if (number >= 1e13) {
                    let exponent = Math.floor(Math.log10(number));
                    return `${Math.floor(number / Math.pow(10, exponent) * 10) / 10}e${exponent}`;
                } else if (number >= 1e12) {
                    return `${(Math.floor(number / 1e12 * 10) / 10).toFixed(1)}e12`;
                } else if (number >= 1e9) {
                    return `${(Math.floor(number / 1e9 * 10) / 10).toFixed(1)}B`;
                } else if (number >= 1e6) {
                    return `${(Math.floor(number / 1e6 * 10) / 10).toFixed(1)}M`;
                } else if (number >= 1e3) {
                    return `${(Math.floor(number / 1e3 * 10) / 10).toFixed(1)}K`;
                } else {
                    if (element.dataset.conditionCheck === 'techUnlock' || element.dataset.type === 'building') {
                        return number; // Return the raw number for these conditions
                    } else {
                        return number.toFixed(0); // Default formatting for other cases
                    }
                }                               
            }                       
        });

        element.innerHTML = formattedContent;
}

function complexPurchaseBuildingFormatter(element, notationType) {
    if (notationType === 'normalCondensed') {
        const spans = element.querySelectorAll("span");
    
        spans.forEach((span, index) => {
            const content = span.textContent.trim();
            const parts = content.split(' ');
    
            let numberPart;
            
            if (index !== 0) {
                numberPart = parts[1]?.replace(/[^0-9.]/g, '');
            } else {
                numberPart = parts[0].replace(/[^0-9.]/g, '');
            }
            
            const formattedNumber = formatNumber(numberPart);
    
            if (index === 0) {
                if (getCurrencySymbol() === '€') {
                    span.textContent = formattedNumber + getCurrencySymbol();
                } else {
                    span.textContent = getCurrencySymbol() + formattedNumber;
                }
                
                if (parts.length > 1) {
                    span.textContent += ' ' + parts.slice(1).join(' ');
                }
            } else {
                const prefix = content.startsWith(",") ? ", " : "";
                const remainingText = parts.slice(2).join(' ');
                span.textContent = `${prefix}${formattedNumber}${remainingText ? " " + remainingText : ""}`;
            }
        });
    }    
}

export function formatNumber(value) {
    const number = parseFloat(value);
    if (isNaN(number)) return value;

    if (number >= 1e13) {
        let exponent = Math.floor(Math.log10(number));
        return `${(Math.floor(number / Math.pow(10, exponent) * 10) / 10).toFixed(1)}e${exponent}`;
    } else if (number >= 1e12) {
        return `${(Math.floor(number / 1e12 * 10) / 10).toFixed(1)}e12`;
    } else if (number >= 1e9) {
        return `${(Math.floor(number / 1e9 * 10) / 10).toFixed(1)}B`;
    } else if (number >= 1e6) {
        return `${(Math.floor(number / 1e6 * 10) / 10).toFixed(1)}M`;
    } else if (number >= 1e3) {
        return `${(Math.floor(number / 1e3 * 10) / 10).toFixed(1)}K`;
    } else {
        return number.toFixed(0);
    }
}

function complexSellStringFormatter(element, notationType) {
    if (notationType === 'normalCondensed') {
        const sellRowQuantityElement = element.parentElement;
        const match = sellRowQuantityElement.innerHTML.match(/>(.*?)</); //resource fusing from
    
        if (match) {
            const beforeMatch = sellRowQuantityElement.innerHTML.slice(0, match.index + 1);
            const afterMatch = sellRowQuantityElement.innerHTML.slice(match.index + match[0].length - 1);
            const newContent = getTempRowValue();
            
            sellRowQuantityElement.innerHTML = beforeMatch + newContent + afterMatch;
    
            if (sellRowQuantityElement.innerHTML.includes('-&gt; ')) { //first number to fuse to
                formatSellStringCondensed(sellRowQuantityElement, /&gt; (-?\d+)(\s|$)/, 5, 1);
            }
            
            if (sellRowQuantityElement.innerHTML.includes(', ')) { //second number to fuse to
                formatSellStringCondensed(sellRowQuantityElement, /, (\d+)\s/, 2, 1);
            }   
        }
    }
}

function formatSellStringCondensed(element, regex, sliceOffsetBefore, sliceOffsetAfter) {
    const match = element.innerHTML.match(regex);
    if (match) {
        const capturedNumber = parseFloat(match[1]);
        let formatted;
        if (capturedNumber < 0) {
            formatted = 0;
        }else {
            if (capturedNumber >= 1e13) {
                let exponent = Math.floor(Math.log10(capturedNumber));
                formatted = `${(Math.floor(capturedNumber / Math.pow(10, exponent) * 10) / 10).toFixed(1)}e${exponent}`;
            } else if (capturedNumber >= 1e12) {
                formatted = `${(Math.floor(capturedNumber / 1e12 * 10) / 10).toFixed(1)}e12`;
            } else if (capturedNumber >= 1e9) {
                formatted = `${(Math.floor(capturedNumber / 1e9 * 10) / 10).toFixed(1)}B`;
            } else if (capturedNumber >= 1e6) {
                formatted = `${(Math.floor(capturedNumber / 1e6 * 10) / 10).toFixed(1)}M`;
            } else if (capturedNumber >= 1e3) {
                formatted = `${(Math.floor(capturedNumber / 1e3 * 10) / 10).toFixed(1)}K`;
            } else {
                formatted = capturedNumber.toFixed(0);
            }
        }        
        const beforeMatch = element.innerHTML.slice(0, match.index + sliceOffsetBefore);
        const afterMatch = element.innerHTML.slice(match.index + match[0].length - sliceOffsetAfter);
        element.innerHTML = beforeMatch + formatted + afterMatch;
    }
}

function setAllOriginalFrameNumberValues() {
    const elements = document.querySelectorAll('.notation');
    const originalNumbers = getOriginalFrameNumbers();
    const existingSelectors = new Set();

    elements.forEach(element => {
        const originalContent = element.innerHTML;
        const elementSelector = element.id ? `#${element.id}` : `.${element.className}`;

        if (!(elementSelector in originalNumbers)) {
            originalNumbers[elementSelector] = {
                originalValue: originalContent,
                elementSelector: elementSelector
            };
            existingSelectors.add(elementSelector);
        }
    });

    setOriginalFrameNumbers(originalNumbers);
}

function sortRowsByRenderPosition(rows, mainKey) {
    const adjustedPositions = [];

    rows.forEach(item => {
        let alreadyAdjusted = false;
        const currentPos = getResourceDataObject(mainKey, [item.techName, 'idForRenderPosition']);

        if (mainKey === 'techs') {
            const researchButton = item.row.querySelector('.input-container button');
            if (researchButton.textContent === "Researched" && currentPos < 10000) {
                adjustedPositions.push({
                    ...item,
                    adjustedPos: currentPos + 10000
                });
                alreadyAdjusted = true;
            }

            if (!researchButton.classList.contains('red-disabled-text')) {
                adjustedPositions.push({
                    ...item,
                    adjustedPos: currentPos - 10000
                });
                alreadyAdjusted = true;
            }
        }

        if (!alreadyAdjusted) {
            if (item.row.classList.contains('invisible')) {
                adjustedPositions.push({
                    ...item,
                    adjustedPos: currentPos + 10000
                });
            } else {
                if (currentPos > 10000) {
                    adjustedPositions.push({
                        ...item,
                        adjustedPos: currentPos - 10000
                    });
                } else {
                    adjustedPositions.push({
                        ...item,
                        adjustedPos: currentPos
                    });
                }
            }
        }

    });

    return adjustedPositions.sort((a, b) => a.adjustedPos - b.adjustedPos);
}

function updateClassesInRowsToRender() {
    const unsortedRows = getTemporaryCoreTechRowsRepo('rows');

    unsortedRows.forEach(rowObj => { 
        const domElement = document.getElementById(rowObj.row.id);
        if (domElement) {
            const classList = domElement.classList;
            rowObj.classList = Array.from(classList);
        }
    });

    setTemporaryCoreTechRowsRepo('noChange', unsortedRows);
}

function setEnergyUse() {
    const resourceData = getResourceDataObject('resources');
    const compoundData = getResourceDataObject('compounds');
    const researchData = getResourceDataObject('research', ['upgrades']);
    const rocketData = Object.fromEntries(Object.entries(getResourceDataObject('space', ['upgrades'])).filter(([key]) => key.includes('rocket')));
    const spaceTelescope = getResourceDataObject('space', ['upgrades', 'spaceTelescope']);

    let totalEnergyUseResources = 0;
    let totalEnergyUseCompounds = 0;
    let totalEnergyUseResearch = 0;
    let totalEnergyUseRocketFuellers = 0;
    let totalEnergyUseSpaceTelescope = 0;

    for (const resourceKey in resourceData) { //autobuyer resources upgrades
        const resource = resourceData[resourceKey];
        const autoBuyer = resource.upgrades?.autoBuyer;

        if (autoBuyer) {
            for (let tierKey of ['tier1', 'tier2', 'tier3', 'tier4']) {
                const tier = autoBuyer[tierKey];

                if (tier) {
                    let energyUse = 0;
                    if (tier.active) {
                        energyUse = tier.energyUse || 0;
                    } else {
                        energyUse = 0;
                    }

                    const quantity = tier.quantity || 0;
                    totalEnergyUseResources += energyUse * quantity;
                }
            }
        }
    }

    for (const compoundKey in compoundData) { //autobuyer compounds upgrades
        const compound = compoundData[compoundKey];
        const autoBuyer = compound.upgrades?.autoBuyer;

        if (autoBuyer) {
            for (let tierKey of ['tier1', 'tier2', 'tier3', 'tier4']) {
                const tier = autoBuyer[tierKey];

                if (tier) {
                    let energyUse = 0;
                    if (tier.active) {
                        energyUse = tier.energyUse || 0;
                    } else {
                        energyUse = 0;
                    }

                    energyUse = tier.energyUse || 0;
                    const quantity = tier.quantity || 0;
                    totalEnergyUseCompounds += energyUse * quantity;
                }
            }
        }
    }

    for (const researchUpgradeKey in researchData) { //science upgrades
        const researchUpgrade = researchData[researchUpgradeKey];

        if (researchUpgrade) {
            let energyUse = 0;
            if (researchUpgrade.active) {
                energyUse = researchUpgrade.energyUse || 0;
            } else {
                energyUse = 0;
            }
            
            const quantity = researchUpgrade.quantity || 0;
            totalEnergyUseResearch += energyUse * quantity;
        }
    }

    for (const rocketKey in rocketData) { //rocket fuellers
        let energyUse = 0;
        const rocketFueller = rocketData[rocketKey].autoBuyer.tier1;

        if (rocketFueller) {
            if (getRocketsFuellerStartedArray().includes(rocketKey)) {
                energyUse = rocketFueller.energyUse;
            }
            totalEnergyUseRocketFuellers += energyUse;
        }
    }

    if (spaceTelescope) { //space telescope scanner
        let energyUse = 0;
        if (getCurrentlySearchingAsteroid() && getTimeLeftUntilAsteroidScannerTimerFinishes() > 0) {
            energyUse = spaceTelescope.energyUseSearchAsteroid;
        }
        if (getCurrentlyInvestigatingStar() && getTimeLeftUntilStarInvestigationTimerFinishes() > 0) {
            energyUse = spaceTelescope.energyUseInvestigateStar;
        }
        if (getCurrentlyPillagingVoid() && getTimeLeftUntilPillageVoidTimerFinishes() > 0) {
            energyUse = spaceTelescope.energyUsePhilosophyBoostResourcesAndCompounds;
        }
        totalEnergyUseSpaceTelescope += energyUse;
    }

    setTotalEnergyUse(totalEnergyUseResources + totalEnergyUseCompounds + totalEnergyUseResearch + totalEnergyUseRocketFuellers + totalEnergyUseSpaceTelescope);
}

export function setEnergyCapacity(battery) {
    const currentEnergyCap = getResourceDataObject('buildings', ['energy', 'storageCapacity']);

    const battery1Cap = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'capacity']);
    const battery2Cap = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery2', 'capacity']);
    const battery3Cap = getResourceDataObject('buildings', ['energy', 'upgrades', 'battery3', 'capacity']);
    
    let newEnergyCap;

    switch (battery) {
        case 'battery1':
            newEnergyCap = currentEnergyCap + battery1Cap;
            break;
        case 'battery2':
            newEnergyCap = currentEnergyCap + battery2Cap;
            break;
        case 'battery3':
            newEnergyCap = currentEnergyCap + battery3Cap;
            break;
    }
    
    setResourceDataObject(newEnergyCap, 'buildings', ['energy', 'storageCapacity']);
}

function updateEnergyStat(element) {
    const themeElement = document.querySelector('[data-theme]');
    const themeStyles = getComputedStyle(themeElement);

    if (getInfinitePower()) {
        element.style.color = themeStyles.getPropertyValue('--ready-text');
        element.textContent = `∞ DYSON ∞`;
        return;
    }
    const totalRate = (getResourceDataObject('buildings', ['energy', 'rate']) * getTimerRateRatio()) - (getTotalEnergyUse() * getTimerRateRatio());
    if (getPowerOnOff()) {
        element.textContent = `${Math.floor(totalRate)} KW / s`;
    } else {
        element.textContent = `0 KW / s`;
    }
}

function getConstituentComponents(createCompoundDescriptionString) {
    let compoundToCreateQuantity = 0;
    let constituentPartQuantity1 = 0;
    let constituentPartName1 = '';
    let constituentPartQuantity2 = 0;
    let constituentPartName2 = '';
    let constituentPartQuantity3 = 0;
    let constituentPartName3 = '';
    let constituentPartQuantity4 = 0;
    let constituentPartName4 = '';

    // Main compound quantity
    const regexCompoundToCreate = /(\d+(?:\.\d+)?(?:[KMGTPE]?)?)\s*/;
    const matchCompound = createCompoundDescriptionString.match(regexCompoundToCreate);
    if (matchCompound) {
        compoundToCreateQuantity = matchCompound[1];
    } else {
        //console.log('No match found for compound quantity.');
    }
    
    // Constituent Part 1
    const regexConstituentPart1 = /\((\d+(?:\.\d+)?(?:[KMGTPE]?)?)\s*([a-zA-Z]+)/;

    const matchConstituentPart1 = createCompoundDescriptionString.match(regexConstituentPart1);
    if (matchConstituentPart1) {
        constituentPartQuantity1 = matchConstituentPart1[1];
        constituentPartName1 = matchConstituentPart1[2];
    }
    
    // Constituent Part 2
    const regexConstituentPart2 = /, (\d+(?:\.\d+)?(?:[KMGTPE]?)?)\s*([a-zA-Z]+)/
    const matchConstituentPart2 = createCompoundDescriptionString.match(regexConstituentPart2);
    if (matchConstituentPart2) {
        constituentPartQuantity2 = matchConstituentPart2[1];
        constituentPartName2 = matchConstituentPart2[2];
    }
    
    // Constituent Part 3
    const regexConstituentPart3 = /(?:, \d+(?:\.\d+)?(?:[KMGTPE]?)?\s*[a-zA-Z]+){1}\s*,\s*(\d+(?:\.\d+)?(?:[KMGTPE]?)?)\s*([a-zA-Z]+)/;
                                    
    const matchConstituentPart3 = createCompoundDescriptionString.match(regexConstituentPart3);
    if (matchConstituentPart3) {
        constituentPartQuantity3 = matchConstituentPart3[1];
        constituentPartName3 = matchConstituentPart3[2];
    }
    
    // Constituent Part 4
    const regexConstituentPart4 = /(?:, \d+(?:\.\d+)?(?:[KMGTPE]?)?\s*[a-zA-Z]+){2}\s*,\s*(\d+(?:\.\d+)?(?:[KMGTPE]?)?)\s*([a-zA-Z]+)/;
    const matchConstituentPart4 = createCompoundDescriptionString.match(regexConstituentPart4);
    if (matchConstituentPart4) {
        constituentPartQuantity4 = matchConstituentPart4[1];
        constituentPartName4 = matchConstituentPart4[2];
    }
    
    return {
        compoundToCreateQuantity,
        constituentPartQuantity1,
        constituentPartName1,
        constituentPartQuantity2,
        constituentPartName2,
        constituentPartQuantity3,
        constituentPartName3,
        constituentPartQuantity4,
        constituentPartName4
    };
}

function unpackConstituentPartsObject(constituentComponents) {
    if (constituentComponents.compoundToCreateQuantity) {
        constituentComponents.compoundToCreateQuantity = parseNumber(constituentComponents.compoundToCreateQuantity);
    }

    for (let i = 1; i <= 4; i++) {
        let quantityKey = `constituentPartQuantity${i}`;
        let quantityValue = constituentComponents[quantityKey];

        if (quantityValue && quantityValue !== 0) {
            // Convert the numeric string to a number
            constituentComponents[quantityKey] = parseNumber(quantityValue);
        }

        let nameKey = `constituentPartName${i}`;
        if (constituentComponents[nameKey]) {
            constituentComponents[nameKey] = constituentComponents[nameKey].toLowerCase();
        }
    }

    return constituentComponents;
}

function parseNumber(value) {
    if (typeof value !== 'string') {
        return value;
    }

    const unitMultipliers = {
        K: 1e3,
        M: 1e6,
        B: 1e9,
        T: 1e12,
        E: 1e18,
        P: 1e15
    };

    let match = value.match(/(\d+(?:\.\d+)?)([KMGTPE]?)?/);
    if (match) {
        let [_, numPart, unitPart] = match;
        let number = parseFloat(numPart.replace(',', ''));
        if (unitPart in unitMultipliers) {
            number *= unitMultipliers[unitPart];
        }
        return number;
    }

    return value;
}

function normalizeAllQuantities(allQuantities) {
    for (let key in allQuantities) {
        if (allQuantities[key] < 0) {
            let type = 'error';

            const resources = getResourceDataObject('resources');
            const compounds = getResourceDataObject('compounds');

            if (key in resources) {
                type = 'resources';
            } else if (key in compounds) {
                type = 'compounds';
            }

            allQuantities[key] = 0;
            setResourceDataObject(0, type, [key, 'quantity']);
        }
    }
    return allQuantities;
}

export function addBuildingPotentialRate(powerBuilding) {
    const powerBuildingObject = getResourceDataObject('buildings', ['energy', 'upgrades', powerBuilding]);
    const powerBuildingQuantity = powerBuildingObject['quantity'];
    const powerBuildingEnergyRatePerUnit = powerBuildingObject['rate'];

    let powerBuildingPotentialRate = powerBuildingQuantity * powerBuildingEnergyRatePerUnit;

    if (powerBuilding === 'powerPlant2') {
        powerBuildingPotentialRate *= getCurrentStarSystemWeatherEfficiency()[1];
    }

    setResourceDataObject(powerBuildingPotentialRate, 'buildings', ['energy', 'upgrades', powerBuilding, 'purchasedRate']);
    setResourceDataObject(powerBuildingQuantity * powerBuildingEnergyRatePerUnit, 'buildings', ['energy', 'upgrades', powerBuilding, 'maxPurchasedRate']);
}

export function toggleBuildingTypeOnOff(building, activeStatus) { //flag building as switched on or off
    if (getBuildingTypeOnOff(building) !== activeStatus) {
        setBuildingTypeOnOff(building, activeStatus);
        //console.log(building + 'switched on (true) or off (false): ' + activeStatus);
    }
}

export function addOrRemoveUsedPerSecForFuelRate(fuelType, activateButtonElement, fuelCategory, buildingToCheck, trippedStatus) {
    let currentState;
    let newState;

    const totalFuelBurnForBuildingType = getResourceDataObject(fuelCategory, [fuelType, 'usedForFuelPerSec']);
    const currentFuelRate = getResourceDataObject(fuelCategory, [fuelType, 'rate']);

    if (activateButtonElement) { //if clicked
        switch(activateButtonElement.textContent) { //toggle text
            case 'Activate':
                currentState = false;
                activateButtonElement.textContent = 'Deactivate';
                activateButtonElement.classList.remove('red-disabled-text');
                activateButtonElement.classList.add('green-ready-text');
                newState = !currentState;
                break;
            case 'Deactivate':
                currentState = true;
                activateButtonElement.textContent = 'Activate';
                activateButtonElement.classList.remove('green-ready-text');
                newState = !currentState;
                break;
        }
    } else {
        if (!trippedStatus) {
            newState = 'fuelExhausted';
        } else {
            newState = 'tripped';
        }
    }

    const fuelExtractionRateTier1 = getResourceDataObject(fuelCategory, [fuelType, 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getResourceDataObject(fuelCategory, [fuelType, 'upgrades', 'autoBuyer', 'tier1', 'quantity']);

    if (newState && newState !== 'fuelExhausted' && newState !== 'tripped' && newState !== 'regularUpdate') { //if activating by clicking button
        setResourceDataObject(currentFuelRate - totalFuelBurnForBuildingType, fuelCategory, [fuelType, 'rate']);
        setActivatedFuelBurnObject(fuelType, true);
        return true;
    } else if (newState === 'fuelExhausted') { //if just ran out of fuel
        if (getRanOutOfFuelWhenOn(buildingToCheck)) {
            setResourceDataObject(0 + fuelExtractionRateTier1, fuelCategory, [fuelType, 'rate']);
            setActivatedFuelBurnObject(fuelType, false);
        } else { //if just gained some fuel after running out
            setResourceDataObject(currentFuelRate - totalFuelBurnForBuildingType, fuelCategory, [fuelType, 'rate']);
            setActivatedFuelBurnObject(fuelType, true);
        }
    } else if (newState === 'tripped') { //if switches off when no battery and energy consumption becomes higher than generation ie purchase of autoBuyer
        setResourceDataObject(fuelExtractionRateTier1, fuelCategory, [fuelType, 'rate']);
        setActivatedFuelBurnObject(fuelType, false);
    } else { //if deactivating by clicking button
        setResourceDataObject(currentFuelRate + totalFuelBurnForBuildingType, fuelCategory, [fuelType, 'rate']);
        setActivatedFuelBurnObject(fuelType, false);
        sfxPlayer.playAudio('powerOff', 'powerOn');
        return false;
    }
}

export function checkPowerBuildingsFuelLevels() {
    const powerBuildings = Object.fromEntries(Object.entries(getResourceDataObject('buildings', ['energy', 'upgrades'])).filter(([key]) => key.startsWith('power')));

    Object.keys(powerBuildings).forEach(powerBuilding => {
        const fuelType = getResourceDataObject('buildings', ['energy', 'upgrades', powerBuilding, 'fuel'])[0];
        const fuelCategory = getResourceDataObject('buildings', ['energy', 'upgrades', powerBuilding, 'fuel'])[2];
        const powerBuildingQuantity = getResourceDataObject('buildings', ['energy', 'upgrades', powerBuilding, 'quantity']);
        
        if (getResourceDataObject(fuelCategory, [fuelType, 'quantity']) <= 0 && powerBuildingQuantity > 0) { //if out of fuel
            toggleBuildingTypeOnOff(powerBuilding, false);
            startUpdateTimersAndRates(powerBuilding, 'toggle');
            setRanOutOfFuelWhenOn(powerBuilding, true);
            addOrRemoveUsedPerSecForFuelRate(fuelType, null, fuelCategory, powerBuilding, false);
        } else if (powerBuildingQuantity > 0) {
            if (getRanOutOfFuelWhenOn(powerBuilding)) {
                setRanOutOfFuelWhenOn(powerBuilding, false);
            }
        }
    });
}

const offlineGainsDebugToggle = true; //DEBUG to toggle offlineGains feature for testing

export function offlineGains(switchedFocus) {
    if (offlineGainsDebugToggle) {
        const resourcesObject = getResourceDataObject('resources');
        const compoundsObject = getResourceDataObject('compounds');
    
        const resources = Object.keys(resourcesObject);
        const compounds = Object.keys(compoundsObject);
    
        const resourceValues = {};
        const compoundValues = {};
        const energyValues = {};
        const researchValues = {};
        const antimatterValues = {};
    
        resources.forEach(resource => {
            resourceValues[resource] = {
                rate: Math.max(0, getResourceDataObject('resources', [resource, 'rate']) - getResourceDataObject('resources', [resource, 'usedForFuelPerSec'])),
                quantity: getResourceDataObject('resources', [resource, 'quantity']),
                storageCapacity: getResourceDataObject('resources', [resource, 'storageCapacity']),
            };
        });
        
        compounds.forEach(compound => {
            compoundValues[compound] = {
                rate: Math.max(0, getResourceDataObject('compounds', [compound, 'rate']) - getResourceDataObject('compounds', [compound, 'usedForFuelPerSec'])),
                quantity: getResourceDataObject('compounds', [compound, 'quantity']),
                storageCapacity: getResourceDataObject('compounds', [compound, 'storageCapacity']),
            };
        });        
    
        const batteryBought = getResourceDataObject('buildings', ['energy', 'batteryBoughtYet']);
        energyValues.energy = {
            rate: batteryBought ? getResourceDataObject('buildings', ['energy', 'rate']) - getResourceDataObject('buildings', ['energy', 'consumption']) : 0,
            quantity: getResourceDataObject('buildings', ['energy', 'quantity']),
        };
    
        researchValues.research = {
            rate: getResourceDataObject('research', ['rate']),
            quantity: getResourceDataObject('research', ['quantity']),
        };
    
        antimatterValues.antimatter = {
            rate: getResourceDataObject('antimatter', ['rate']),
            quantity: getResourceDataObject('antimatter', ['quantity'])
        }
    
        const combinedValues = {
            rate: {
                resources: Object.fromEntries(Object.entries(resourceValues).map(([key, value]) => [key, value.rate])),
                compounds: Object.fromEntries(Object.entries(compoundValues).map(([key, value]) => [key, value.rate])),
                energy: energyValues.energy.rate,
                research: researchValues.research.rate,
                antimatter: antimatterValues.antimatter.rate
            },
            quantity: {
                resources: Object.fromEntries(Object.entries(resourceValues).map(([key, value]) => [key, value.quantity])),
                compounds: Object.fromEntries(Object.entries(compoundValues).map(([key, value]) => [key, value.quantity])),
                energy: energyValues.energy.quantity,
                research: researchValues.research.quantity,
                antimatter: antimatterValues.antimatter.quantity
            },
        };

        const lastSavedTimeStamp = getLastSavedTimeStamp();
        const now = Date.now();
        const currentTimeStamp = new Date().toISOString();

        const lastSavedTime = new Date(lastSavedTimeStamp).getTime();
        const diff = now - lastSavedTime;
        setGameActiveCountTime(null, getGameActiveCountTime()[1] + diff);

        const timeDifferenceInSeconds = Math.floor(
            (new Date(currentTimeStamp).getTime() - new Date(lastSavedTimeStamp).getTime()) / 1000
        );
    
        const calculateOfflineGains = (data, multiplier = 1) => {
            return Object.fromEntries(
                Object.entries(data).map(([key, rate]) => [key, rate * multiplier * timeDifferenceInSeconds])
            );
        };
    
        let offlineGains = {
            resources: calculateOfflineGains(combinedValues.rate.resources, getTimerRateRatio()),
            compounds: calculateOfflineGains(combinedValues.rate.compounds, getTimerRateRatio()),
            energy: combinedValues.rate.energy * getTimerRateRatio() * timeDifferenceInSeconds,
            research: combinedValues.rate.research * getTimerRateRatio() * timeDifferenceInSeconds,
            rocket1: 0,
            rocket2: 0,
            rocket3: 0,
            rocket4: 0,
        };

        nerfOfflineGains(offlineGains);
    
        Object.entries(offlineGains.resources).forEach(([resource, gain]) => {
            const currentQuantity = getResourceDataObject('resources', [resource, 'quantity']);
            const storageCapacity = resourceValues[resource].storageCapacity;
            const finalQuantity = Math.min(currentQuantity + gain, storageCapacity);
            setResourceDataObject(finalQuantity, 'resources', [resource, 'quantity']);
            const gainToAddToStats = (currentQuantity + gain > storageCapacity) ? (storageCapacity - currentQuantity) : gain;
            addToResourceAllTimeStat(gainToAddToStats, resource);
        });
    
        Object.entries(offlineGains.compounds).forEach(([compound, gain]) => {
            const currentQuantity = getResourceDataObject('compounds', [compound, 'quantity']);
            const storageCapacity = compoundValues[compound].storageCapacity;
            const finalQuantity = Math.min(currentQuantity + gain, storageCapacity);
            setResourceDataObject(finalQuantity, 'compounds', [compound, 'quantity']);
            const gainToAddToStats = (currentQuantity + gain > storageCapacity) ? (storageCapacity - currentQuantity) : gain;
            addToResourceAllTimeStat(gainToAddToStats, compound);
        });
    
        const currentEnergyQuantity = getResourceDataObject('buildings', ['energy', 'quantity']);
        setResourceDataObject(Math.min(currentEnergyQuantity + offlineGains.energy, getResourceDataObject('buildings', ['energy', 'storageCapacity'])), 'buildings', ['energy', 'quantity']);
    
        const currentResearchQuantity = getResourceDataObject('research', ['quantity']);
        setResourceDataObject(currentResearchQuantity + offlineGains.research, 'research', ['quantity']);
        addToResourceAllTimeStat(offlineGains.research, 'researchPoints');
    
        const currentFuelQuantityRockets = getRocketsFuellerStartedArray().filter(rocket => !rocket.includes('FuelledUp'));
        currentFuelQuantityRockets.forEach(rocket => {
            const rocketDetails = getResourceDataObject('space', ['upgrades', rocket]);
            const fuelUpgradeRate = rocketDetails.autoBuyer.tier1.rate;
            const offlineFuelGain = (fuelUpgradeRate * timeDifferenceInSeconds) * getTimerRateRatio();
            offlineGains[rocket] += offlineFuelGain;
        });
    
        currentFuelQuantityRockets.forEach(rocket => {
            const currentRocketFuelQuantity = getResourceDataObject('space', ['upgrades', rocket, 'fuelQuantity']);
            setResourceDataObject(Math.min(currentRocketFuelQuantity + offlineGains[rocket], getResourceDataObject('space', ['upgrades', rocket, 'fuelQuantityToLaunch'])), 'space', ['upgrades', rocket, 'fuelQuantity']);
        });

        setAsteroidTimerCanContinue(getPowerOnOff() && !getCurrentlyInvestigatingStar() && !getCurrentlyPillagingVoid());
        setStarInvestigationTimerCanContinue(getPowerOnOff() && !getCurrentlySearchingAsteroid() && !getCurrentlyPillagingVoid());
        setPillageVoidTimerCanContinue(getPowerOnOff() && !getCurrentlySearchingAsteroid() && !getCurrentlyInvestigatingStar());        

        if (getCurrentlySearchingAsteroid() && getAsteroidTimerCanContinue()) {
            const timeLeft = getTimeLeftUntilAsteroidScannerTimerFinishes();
            const offlineTimeInMilliseconds = timeDifferenceInSeconds * 1000;
        
            const remainingTime = Math.max(timeLeft - offlineTimeInMilliseconds, 100);
        
            timerManagerDelta.removeTimer('searchAsteroidTimer');
            startSearchAsteroidTimer([remainingTime, 'offlineGains']);
        }

        if (getCurrentlyInvestigatingStar() && getStarInvestigationTimerCanContinue()) {
            const timeLeft = getTimeLeftUntilStarInvestigationTimerFinishes();
            const offlineTimeInMilliseconds = timeDifferenceInSeconds * 1000;
        
            const remainingTime = Math.max(timeLeft - offlineTimeInMilliseconds, 100);
        
            timerManagerDelta.removeTimer('investigateStarTimer');
            startInvestigateStarTimer([remainingTime, 'offlineGains']);
        }

        if (getCurrentlyPillagingVoid() && getPillageVoidTimerCanContinue()) {
            const timeLeft = getTimeLeftUntilPillageVoidTimerFinishes();
            const offlineTimeInMilliseconds = timeDifferenceInSeconds * 1000;
        
            const remainingTime = Math.max(timeLeft - offlineTimeInMilliseconds, 100);
        
            timerManagerDelta.removeTimer('pillageVoidTimer');
            startPillageVoidTimer([remainingTime, 'offlineGains']);
        }        

        if (getStarShipTravelling() && getStarShipStatus()[0] === 'travelling') {
            const timeLeft = getTimeLeftUntilTravelToDestinationStarTimerFinishes();
            const offlineTimeInMilliseconds = timeDifferenceInSeconds * 1000;
    
            const remainingTime = Math.max(timeLeft - offlineTimeInMilliseconds, 100);
    
            timerManagerDelta.removeTimer('starShipTravelToDestinationStarTimer');
            startTravelToDestinationStarTimer([remainingTime, 'offlineGains']);
        }
    
        const rocketTravelDurationObject = getRocketTravelDuration();
        Object.keys(rocketTravelDurationObject).forEach(rocketKey => {
            const rocket = rocketKey;
            const timeLeft = getTimeLeftUntilRocketTravelToAsteroidTimerFinishes(rocket);
            const offlineTimeInMilliseconds = timeDifferenceInSeconds * 1000;
        
            const remainingTime = Math.max(timeLeft - offlineTimeInMilliseconds, 1);
        
            timerManagerDelta.removeTimer(`${rocketKey}TravelToAsteroidTimer`);
            timerManagerDelta.removeTimer(`${rocketKey}TravelReturnTimer`);
            startTravelToAndFromAsteroidTimer([remainingTime, 'offlineGains'], rocketKey, getRocketDirection(rocketKey));
        });  
        
        const currentAntimatterQuantity = combinedValues.quantity.antimatter;
        const asteroidArray = getAsteroidArray();
        let offlineGainsAntimatter = 0;
        
        asteroidArray.forEach((asteroid) => { 
            const asteroidName = Object.keys(asteroid)[0];
            const rateExtractionAsteroid = getSpecificAsteroidExtractionRate(asteroid[asteroidName]);
            const beingMined = asteroid[asteroidName].beingMined;
            const quantityAntimatterAsteroid = asteroid[asteroidName].quantity[0];
        
            if (beingMined) {
                const nerfedExtractionRate = rateExtractionAsteroid * getOfflineGainsRate();
                const extractedAmount = Math.min(nerfedExtractionRate * getTimerRateRatio() * timeDifferenceInSeconds, quantityAntimatterAsteroid);
                offlineGainsAntimatter += extractedAmount;
                changeAsteroidArray(asteroidName, 'quantity', [Math.max(asteroid[asteroidName].quantity[0] - extractedAmount, 0), 'none']);
            }
        });
        
        setResourceDataObject(Math.floor(currentAntimatterQuantity + offlineGainsAntimatter), 'antimatter', ['quantity']);
        addToResourceAllTimeStat(Math.floor(offlineGainsAntimatter), 'antimatter');
        addToResourceAllTimeStat(Math.floor(offlineGainsAntimatter), 'antimatterThisRun');        
        
        if (!switchedFocus) {
            showNotification('Offline Gains Added!', 'info', 3000, 'loadSave');
        }
    
        //console.log('Offline Gains:', offlineGains);
        //console.log('Time Offline (seconds):', timeDifferenceInSeconds);
    }
    // startSearchAsteroidTimer([10000, 'offlineGains']); //DEBUG
    // startTravelToAndFromAsteroidTimer([10000, 'offlineGains'], 'rocket1', getRocketDirection('rocket1')); //DEBUG
}

function nerfOfflineGains(obj) {
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            nerfOfflineGains(obj[key]);
        } else {
            obj[key] = Math.floor(obj[key] * getOfflineGainsRate());
        }
    });
}

export function setAllCompoundsToZeroQuantity() {
    const compoundKeys = Object.keys(getResourceDataObject('compounds'));

    compoundKeys.forEach(compound => {
        setResourceDataObject(0, 'compounds', [compound, 'quantity']);
    });
}

export function buildSpaceMiningBuilding(spaceMiningBuilding, debug) {
    let currentResource1Quantity;
    let currentResource2Quantity;
    let currentResource3Quantity;

    const buySpaceMiningBuildingButtonElement = document.querySelector(`button[data-resource-to-fuse-to="${spaceMiningBuilding}"]`);
    const spaceMiningBuildingDescriptionElement = document.getElementById(`${spaceMiningBuilding}Description`);
    const spaceMiningBuildingAlreadyBoughtTextElement = document.getElementById(`${spaceMiningBuilding}AlreadyBoughtText`);

    const currentCash = getResourceDataObject('currency', ['cash']);
    const spaceMiningBuildingCashPrice = getResourceDataObject('space', ['upgrades', spaceMiningBuilding, 'price']);

    const spaceMiningBuildingResource1PriceQuantity = getResourceDataObject('space', ['upgrades', spaceMiningBuilding, 'resource1Price'])[0];
    const spaceMiningBuildingResource1PriceResource = getResourceDataObject('space', ['upgrades', spaceMiningBuilding, 'resource1Price'])[1];
    const spaceMiningBuildingResource1PriceCategory = getResourceDataObject('space', ['upgrades', spaceMiningBuilding, 'resource1Price'])[2];
    if (spaceMiningBuildingResource1PriceCategory) {
        currentResource1Quantity = getResourceDataObject(spaceMiningBuildingResource1PriceCategory, [spaceMiningBuildingResource1PriceResource, 'quantity']);
    }
    const spaceMiningBuildingResource2PriceQuantity = getResourceDataObject('space', ['upgrades', spaceMiningBuilding, 'resource2Price'])[0];
    const spaceMiningBuildingResource2PriceResource = getResourceDataObject('space', ['upgrades', spaceMiningBuilding, 'resource2Price'])[1];
    const spaceMiningBuildingResource2PriceCategory = getResourceDataObject('space', ['upgrades', spaceMiningBuilding, 'resource2Price'])[2];
    if (spaceMiningBuildingResource2PriceCategory) {
        currentResource2Quantity = getResourceDataObject(spaceMiningBuildingResource2PriceCategory, [spaceMiningBuildingResource2PriceResource, 'quantity']);
    }
    const spaceMiningBuildingResource3PriceQuantity = getResourceDataObject('space', ['upgrades', spaceMiningBuilding, 'resource3Price'])[0];
    const spaceMiningBuildingResource3PriceResource = getResourceDataObject('space', ['upgrades', spaceMiningBuilding, 'resource3Price'])[1];
    const spaceMiningBuildingResource3PriceCategory = getResourceDataObject('space', ['upgrades', spaceMiningBuilding, 'resource3Price'])[2];
    if (spaceMiningBuildingResource3PriceCategory) {
        currentResource3Quantity = getResourceDataObject(spaceMiningBuildingResource3PriceCategory, [spaceMiningBuildingResource3PriceResource, 'quantity']);
    }

    setResourceDataObject(Math.floor(currentCash - spaceMiningBuildingCashPrice), 'currency', ['cash']);

    if (spaceMiningBuildingResource1PriceCategory) {
        setResourceDataObject(Math.floor(currentResource1Quantity - spaceMiningBuildingResource1PriceQuantity), spaceMiningBuildingResource1PriceCategory, [spaceMiningBuildingResource1PriceResource, 'quantity']);
    }

    if (spaceMiningBuildingResource2PriceCategory) {
        setResourceDataObject(Math.floor(currentResource2Quantity - spaceMiningBuildingResource2PriceQuantity), spaceMiningBuildingResource2PriceCategory, [spaceMiningBuildingResource2PriceResource, 'quantity']);
    }

    if (spaceMiningBuildingResource3PriceCategory) {
        setResourceDataObject(Math.floor(currentResource3Quantity - spaceMiningBuildingResource3PriceQuantity), spaceMiningBuildingResource3PriceCategory, [spaceMiningBuildingResource3PriceResource, 'quantity']);
    }

    setResourceDataObject(true, 'space', ['upgrades', spaceMiningBuilding, `${spaceMiningBuilding}BoughtYet`]);

    if (!debug) {
        buySpaceMiningBuildingButtonElement.classList.add('invisible');
        spaceMiningBuildingDescriptionElement.classList.add('invisible');
        spaceMiningBuildingAlreadyBoughtTextElement.classList.remove('invisible');
    }
}

export function getBatteryLevel() {
    const totalBatteryCapacity = getResourceDataObject('buildings', ['energy', 'storageCapacity']);
    const totalBatteryCharge = getResourceDataObject('buildings', ['energy', 'quantity']);

    const batteryPercentage = (totalBatteryCharge / totalBatteryCapacity) * 100;
    return Math.min(100, Math.max(0, batteryPercentage));
}

export function getFuelLevel(rocket) {
    const totalFuelCapacity = getResourceDataObject('space', ['upgrades', rocket, 'fuelQuantityToLaunch']);
    const currentFuelQuantityLoaded = getResourceDataObject('space', ['upgrades', rocket, 'fuelQuantity']);

    const fuelPercentage = (currentFuelQuantityLoaded / totalFuelCapacity) * 100;
    return Math.min(100, Math.max(0, fuelPercentage));
}

export function fuelRockets() {
    let rocketsToFuel = getRocketsFuellerStartedArray();
    rocketsToFuel = rocketsToFuel.filter(rocket => !rocket.includes('FuelledUp'));

    rocketsToFuel.forEach((rocket, index) => {
        const rocketLaunchButton = document.querySelector('button.rocket-fuelled-check');
        const fuelQuantity = getResourceDataObject('space', ['upgrades', rocket, 'fuelQuantity']);
        const fullLevel = getResourceDataObject('space', ['upgrades', rocket, 'fuelQuantityToLaunch']);

        if (rocketLaunchButton && [...rocketLaunchButton.classList].some(clas => clas.includes(rocket))) {
            rocketLaunchButton.classList.remove('invisible');
        }

        const newFuelQuantity = fuelQuantity;
        const fuelQuantityProgressBarElement = document.getElementById(rocket + 'FuellingProgressBar');

        if (newFuelQuantity >= fullLevel) {
            showNotification(`${getRocketUserName(rocket)} is ready for Launch!`, 'info', 3000, 'rocket');
            if (!getRocketsFuellerStartedArray().includes(rocket + 'FuelledUp')) {
                setRocketsFuellerStartedArray(`${rocket}FuelledUp`, 'add');
            }
            setRocketsFuellerStartedArray(`${rocket}`, 'remove');

            if (rocketLaunchButton) {
                if (fuelQuantityProgressBarElement) {
                    fuelQuantityProgressBarElement.style.width = `100%`;
                }
                rocketLaunchButton.classList.remove('invisible');
                rocketLaunchButton.classList.remove('red-disabled-text');
                rocketLaunchButton.classList.add('green-ready-text');
                rocketLaunchButton.textContent = 'Launch!';
                rocketLaunchButton.classList.remove('no-interaction');
            }
        }

        if (getCurrentOptionPane() === rocket && getCanFuelRockets()) {
            fuelQuantityProgressBarElement.parentElement.classList.remove('invisible');
        }

        if (getCheckRocketFuellingStatus(rocket) && getPowerOnOff() && getCanFuelRockets()) {
            if (getCurrentOptionPane() === rocket) {
                const progressBarPercentage = getFuelLevel(rocket);

                if (fuelQuantityProgressBarElement.style.width !== `100%`) {
                    fuelQuantityProgressBarElement.style.width = `${progressBarPercentage}%`;
                }

                if (newFuelQuantity < fullLevel) {
                    rocketLaunchButton.textContent = `${Math.floor(progressBarPercentage)}%`;
                    rocketLaunchButton.classList.remove('red-disabled-text');
                    rocketLaunchButton.classList.remove('green-ready-text');
                    rocketLaunchButton.classList.add('no-interaction');
                }
            }
        } else if (!getPowerOnOff() && newFuelQuantity < fullLevel && getCanFuelRockets()) {
            const progressBarPercentage = getFuelLevel(rocket);
            if (rocketLaunchButton) {
                rocketLaunchButton.classList.add('red-disabled-text');
                rocketLaunchButton.textContent = `${Math.floor(progressBarPercentage)}%`;
                rocketLaunchButton.classList.add('no-interaction');
                document.getElementById('fuelDescription').textContent = 'Requires Power!';
                document.getElementById('fuelDescription').classList.remove('green-ready-text');
                document.getElementById('fuelDescription').classList.add('red-disabled-text');
            }
        }
    });

    const rockets = ['rocket1', 'rocket2', 'rocket3', 'rocket4'];

    if (!getCanFuelRockets()) {
        const fuelDescriptionElement = document.getElementById('fuelDescription');
        rockets.forEach(rocket => {
            const fuelRocketButton = document.querySelector(`button.${rocket}`);
            if (fuelRocketButton) {
                fuelRocketButton.classList.add('red-disabled-text');
            }

            if (fuelDescriptionElement) {
                fuelDescriptionElement.textContent = 'Lack Fuel Tech!';
                fuelDescriptionElement.classList.remove('green-ready-text');
                fuelDescriptionElement.classList.add('red-disabled-text');
            }
        });

    } else {
        const fuelDescriptionElement = document.getElementById('fuelDescription');
        
        if (fuelDescriptionElement) {
            fuelDescriptionElement.textContent = 'Fuelling...';
            fuelDescriptionElement.classList.add('green-ready-text');
            fuelDescriptionElement.classList.remove('red-disabled-text');
        }

        rockets.forEach(rocket => {
            const fuelRocketButton = document.querySelector(`button.${rocket}`);
            if (fuelRocketButton && getTechUnlockedArray().includes('advancedFuels' && getPowerOnOff())) {
                fuelRocketButton.classList.remove('red-disabled-text');
            }

            if (fuelDescriptionElement && getPowerOnOff() && getRocketsFuellerStartedArray().includes(`${rocket}FuelledUp`) && getCurrentOptionPane() === rocket) {
                if (getCurrentStarSystemWeatherEfficiency()[2] !== 'rain' && getCurrentStarSystemWeatherEfficiency()[2] !== 'volcano') {
                    fuelDescriptionElement.textContent = 'Ready For Launch...';
                    fuelDescriptionElement.classList.add('green-ready-text');
                    fuelDescriptionElement.classList.remove('red-disabled-text');
                } else {
                    fuelDescriptionElement.textContent = 'Bad Weather!';
                    fuelDescriptionElement.classList.remove('green-ready-text');
                    fuelDescriptionElement.classList.add('red-disabled-text');
                }
                return;
            } else if (fuelDescriptionElement && getPowerOnOff() && !getRocketsFuellerStartedArray().includes(rocket) && getCurrentOptionPane() === rocket) {
                fuelDescriptionElement.textContent = 'Ready To Fuel...';
                fuelDescriptionElement.classList.add('green-ready-text');
                fuelDescriptionElement.classList.remove('red-disabled-text');
                return;
            } else if (fuelDescriptionElement && !getPowerOnOff() && getCurrentOptionPane() === rocket) {
                fuelDescriptionElement.textContent = 'Requires Power!';
                fuelDescriptionElement.classList.remove('green-ready-text');
                fuelDescriptionElement.classList.add('red-disabled-text');
                return;
            }
        });
    }
}

export function updateRocketDescription() {
    const launchedRockets = getLaunchedRockets();
    const currentScreen = getCurrentOptionPane();

    for (const rocket of launchedRockets) {
        if (rocket === currentScreen) {
            document.getElementById('fuelDescription').textContent = 'Launched!';
            break;
        }
    }
}

export function launchRocket(rocket) {
    setAchievementFlagArray('launchRocket', 'add');
    setLaunchedRockets(rocket, 'add');
    document.getElementById(`space${capitaliseString(rocket)}AutoBuyerRow`).classList.add('invisible');
    showNotification(`${getRocketUserName(rocket)} Launched!`, 'info', 3000, 'rocket');
}

export function toggleAllPower() {
    const plantKeys = ['powerPlant1', 'powerPlant2', 'powerPlant3'];
    const plantConfigs = plantKeys.map(key => {
        const upgradeData = getResourceDataObject('buildings', ['energy', 'upgrades', key]);
        const fuelData = upgradeData.fuel || [];
        return {
            key,
            quantity: upgradeData.quantity || 0,
            fuelType: fuelData[0],
            fuelCategory: fuelData[2],
            toggleButton: document.getElementById(`${key}Toggle`)
        };
    });

    const hasActivePlant = plantConfigs.some(({ key }) => getBuildingTypeOnOff(key));

    if (hasActivePlant) {
        let deactivatedAny = false;
        plantConfigs.forEach(({ key, fuelType, fuelCategory, toggleButton }) => {
            if (getBuildingTypeOnOff(key)) {
                if (toggleButton) {
                    addOrRemoveUsedPerSecForFuelRate(fuelType, toggleButton, fuelCategory, key, false);
                }
                toggleBuildingTypeOnOff(key, false);
                startUpdateTimersAndRates(key, 'toggle');
                deactivatedAny = true;
            }
        });

        if (deactivatedAny && !getInfinitePower()) {
            setPowerOnOff(false);
        }

        handlePowerAllButtonState();
        sfxPlayer.playAudio('powerOff', 'powerOn');
        return;
    }

    let activatedAny = false;
    plantConfigs.forEach(({ key, quantity, fuelType, fuelCategory, toggleButton }) => {
        if (quantity > 0 && !getBuildingTypeOnOff(key)) {
            let shouldActivate = true;
            if (toggleButton) {
                shouldActivate = addOrRemoveUsedPerSecForFuelRate(fuelType, toggleButton, fuelCategory, key, false);
            }

            if (shouldActivate) {
                toggleBuildingTypeOnOff(key, true);
                startUpdateTimersAndRates(key, 'toggle');
                activatedAny = true;
            }
        }
    });

    if (activatedAny && !getInfinitePower()) {
        setPowerOnOff(true);
    }

    handlePowerAllButtonState();

    if (activatedAny) {
        sfxPlayer.playAudio('powerOn', 'powerOff');
    }
}

function handlePowerAllButtonState() {
    const quantityPowerPlant1 = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
    const quantityPowerPlant2 = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'quantity']);
    const quantityPowerPlant3 = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'quantity']);

    const powerColumnElement = document.getElementById('energyConsumptionStats');
    const powerAllButton = document.getElementById('activateGridButton');

    if (!powerColumnElement.classList.contains('invisible')) {
        const anyPlantsOwned = quantityPowerPlant1 > 0 || quantityPowerPlant2 > 0 || quantityPowerPlant3 > 0;
        const anyPlantActive = getBuildingTypeOnOff('powerPlant1') || getBuildingTypeOnOff('powerPlant2') || getBuildingTypeOnOff('powerPlant3');

        powerAllButton.classList.remove('red-disabled-text');
        powerAllButton.classList.remove('activate-grid-disabled-border');

        if (getInfinitePower()) {
            powerAllButton.textContent = 'Dyson Sphere';
            powerAllButton.classList.add('power-on-fill-state');
        } else if (anyPlantActive) {
            powerAllButton.textContent = 'Power Off';
            powerAllButton.classList.add('power-on-fill-state');
        } else {
            powerAllButton.textContent = 'Power On';
            powerAllButton.classList.remove('power-on-fill-state');
        }

        if (!anyPlantsOwned) {
            powerAllButton.classList.add('red-disabled-text');
            powerAllButton.classList.add('activate-grid-disabled-border');
        }
    }
}

export function gainPillageVoidResourcesAndCompounds() {
    const gained = decideWhichResourcesAndCompoundsGainedByPillage();

    const currentValues = {
        resources: {},
        compounds: {}
    };

    const gains = {
        resources: {},
        compounds: {}
    };

    gained.resources.forEach(resource => {
        const quantity = getResourceDataObject('resources', [resource, 'quantity']);
        const storageCapacity = getResourceDataObject('resources', [resource, 'storageCapacity']);
        currentValues.resources[resource] = { quantity, storageCapacity };

        const diff = storageCapacity - quantity;
        const maxGain = Math.floor(diff * 0.30);
        const actualGain = Math.floor(Math.random() * (maxGain + 1));

        gains.resources[resource] = actualGain;

        const updatedQuantity = quantity + actualGain;
        setResourceDataObject(updatedQuantity, 'resources', [resource, 'quantity']);
    });

    gained.compounds.forEach(compound => {
        const quantity = getResourceDataObject('compounds', [compound, 'quantity']);
        const storageCapacity = getResourceDataObject('compounds', [compound, 'storageCapacity']);
        currentValues.compounds[compound] = { quantity, storageCapacity };

        const diff = storageCapacity - quantity;
        const maxGain = Math.floor(diff * 0.20);
        const actualGain = Math.floor(Math.random() * (maxGain + 1));

        gains.compounds[compound] = actualGain;

        const updatedQuantity = quantity + actualGain;
        setResourceDataObject(updatedQuantity, 'compounds', [compound, 'quantity']);
    });

    showNotification(
        `Pillage Void Complete!<br><br>${
            Object.entries(gains.resources).length
                ? 'Resources Gained:<br>' +
                  Object.entries(gains.resources)
                      .map(([resourceName, gainAmount]) => `${gainAmount} ${capitaliseString(resourceName)}`)
                      .join('<br>') +
                  '<br><br>'
                : ''
        }${
            Object.entries(gains.compounds).length
                ? 'Compounds Gained:<br>' +
                  Object.entries(gains.compounds)
                      .map(([compoundName, gainAmount]) => `${gainAmount} ${capitaliseString(compoundName)}`)
                      .join('<br>')
                : ''
        }`,
        'info',
        4000,
        'special'
    );
}

export function decideWhichResourcesAndCompoundsGainedByPillage() {
    function weightedRandom() {
        const rand = Math.random();
        if (rand < 0.6) return 1;
        else if (rand < 0.85) return 2;
        else return 3;
    }

    function pickRandomUniqueItems(items, count) {
        const shuffled = items.slice().sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    function pickWeightedItems(items, weights, count) {
        const weightedPool = [];
        for (let i = 0; i < items.length; i++) {
            for (let j = 0; j < weights[i]; j++) {
                weightedPool.push(items[i]);
            }
        }

        const selected = new Set();
        while (selected.size < count && weightedPool.length > 0) {
            const choice = weightedPool[Math.floor(Math.random() * weightedPool.length)];
            selected.add(choice);
        }

        return Array.from(selected);
    }

    const resourceTypeQuantity = weightedRandom();
    const compoundTypeQuantity = weightedRandom();

    const resourceList = ['hydrogen', 'helium', 'carbon', 'neon', 'oxygen', 'sodium', 'silicon', 'iron'];
    const compoundList = ['diesel', 'glass', 'steel', 'concrete', 'titanium', 'water'];
    const compoundWeights = [2, 2, 1, 2, 1, 2];

    const selectedResources = pickRandomUniqueItems(resourceList, resourceTypeQuantity);
    const selectedCompounds = pickWeightedItems(compoundList, compoundWeights, compoundTypeQuantity);

    return {
        resources: selectedResources,
        compounds: selectedCompounds
    };
}

export function extendStarDataRange(debug) {
    const increment = getStarVisionIncrement() * Math.pow(getBuffDeeperStarStudyData()['effectCategoryMagnitude'], getBuffDeeperStarStudyData()['boughtYet']);
    const currentRange = getStarVisionDistance();

    setStarVisionDistance(currentRange + increment);

    if (hasStudiedAllRelevantStars()) {
        setAchievementFlagArray('studyAllStarsInOneRun', 'add');
    }

    addToResourceAllTimeStat(currentRange + increment, 'starStudyRange');

    if (getCurrentOptionPane() === 'star map') {
        drawTab5Content('Star Map', null, false, false);
    }

    if (!debug) {
        showNotification('Star Study Complete!</br></br>Take a look at the Star Map!', 'info', 3000, 'special');
    }
}

export function discoverAsteroid(debug) {
    if (Math.random() < 0.07 && !debug) {
        showNotification('Asteroid not found after search!', 'warning', 3000, 'special');
        return;
    }

    setAchievementFlagArray('discoverAsteroid', 'add');
    addToResourceAllTimeStat(1, 'totalAsteroidsDiscovered');

    const rawStarCode = getStarSystemDataObject('stars', [getCurrentStarSystem(), 'starCode']);
    const starCode = rawStarCode.length === 3 ? rawStarCode.toUpperCase() : getStarCode(rawStarCode);
    const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const randomLetter = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    const asteroidName = `${starCode}-${randomNumber}${randomLetter}`;
    const asteroid = generateAsteroidData(asteroidName);
    document.getElementById('asteroidsOption').parentElement.parentElement.classList.remove('invisible');
    setBaseSearchAsteroidTimerDuration(getBaseSearchAsteroidTimerDuration() * getAsteroidCostMultiplier());
    setAsteroidArray(asteroid);

    const keyName = Object.keys(asteroid)[0];
    if (!debug) {
        if (asteroid[keyName].specialName) {
            addToResourceAllTimeStat(1, 'totalLegendaryAsteroidsDiscovered');
            showNotification(`Legendary Asteroid Discovered!<br><br>They named it after you!<br><br>${asteroid[keyName].name}`, 'info', 3000, 'special');
        } else {
            showNotification(`Asteroid Discovered!<br><br>${asteroidName}`, 'info', 3000, 'special');
        }
    }
}

function getStarCode(name) {
    const words = name.toUpperCase().split(/\s+/);

    if (name.length <= 3) {
        return name;
    }

    let code = '';

    if (words.length > 1) {
        words.forEach(word => {
            if (code.length < 3) {
                code += word[0];
            }
        });
    }

    if (code.length < 3) {
        const firstWord = words[0].replace(/[AEIOU]/g, '');
        for (let i = 0; i < firstWord.length && code.length < 3; i++) {
            code += firstWord[i];
        }
    }

    if (code.length < 3) {
        code = name.substring(0, 3);
    }

    return code.padEnd(3, 'X');
}

function generateAsteroidData(name) {
    let distanceClass;
    let specialName = false;

    const minDistance = 30000;
    const maxDistance = 570000;

    const distance = Math.floor(Math.random() * (maxDistance - minDistance + 1)) + minDistance;
    const distancePercentile = (distance - minDistance) / (maxDistance - minDistance);

    const asteroidScannerBoostBoughtTimes = getBuffAsteroidScannerBoostData()['boughtYet'];
    
    if (distancePercentile >= 0.76) {
        distanceClass = 'red-disabled-text';
    } else if (distancePercentile >= 0.51) {
        distanceClass = 'orange-warning-text';
    } else if (distancePercentile >= 0.26) {
        distanceClass = 'none';
    } else {
        distanceClass = 'green-ready-text';
    }

    const rarityRoll = Math.floor(Math.random() * 101);
    let rarity, rarityClass;

    if (asteroidScannerBoostBoughtTimes === 1) {
        if (rarityRoll <= 50) {
            rarity = "Uncommon";
            rarityClass = 'warning-orange-text';
        } else if (rarityRoll <= 90) {
            rarity = "Rare";
            rarityClass = 'none';
        } else {
            rarity = "Legendary";
            rarityClass = 'green-ready-text';
        }
    } else if (asteroidScannerBoostBoughtTimes === 2) {
        if (rarityRoll <= 85) {
            rarity = "Rare";
            rarityClass = 'none';
        } else {
            rarity = "Legendary";
            rarityClass = 'green-ready-text';
        }
    } else {
        if (rarityRoll <= 50) {
            rarity = "Common";
            rarityClass = 'red-disabled-text';
        } else if (rarityRoll <= 70) {
            rarity = "Uncommon";
            rarityClass = 'warning-orange-text';
        } else if (rarityRoll <= 98) {
            rarity = "Rare";
            rarityClass = 'none';
        } else {
            rarity = "Legendary";
            rarityClass = 'green-ready-text';
        }
    }

    if (rarity === "Legendary" ) {
        setAchievementFlagArray('discoverLegendaryAsteroid', 'add');
    }

    const easeOfExtraction = Math.floor(Math.random() * 6) + 1; // Now only 1-6
    let easeClass;
    if (easeOfExtraction === 1) {
        easeClass = 'green-ready-text';      // Easiest (1)
    } else if (easeOfExtraction <= 3) {
        easeClass = 'none';                 // Moderate (2-3)
    } else if (easeOfExtraction <= 5) {
        easeClass = 'warning-orange-text';  // Hard (4-5)
    } else {
        easeClass = 'red-disabled-text';    // Hardest (6)
    }

    let quantity;
    if (rarity === "Common") {
        quantity = Math.floor(Math.random() * (1200 - 700 + 1)) + 700;
    } else if (rarity === "Uncommon") {
        quantity = Math.floor(Math.random() * (2000 - 1200 + 1)) + 1200;
    } else if (rarity === "Rare") {
        quantity = Math.floor(Math.random() * (4000 - 2000 + 1)) + 2000;
    } else {
        quantity = Math.floor(Math.random() * (10000 - 4000 + 1)) + 4000;
    }

    let quantityClass;
    const minQuantity = rarity === "Common" ? 700 : (rarity === "Uncommon" ? 1200 : (rarity === "Rare" ? 2000 : 4000));
    const maxQuantity = rarity === "Common" ? 1200 : (rarity === "Uncommon" ? 2000 : (rarity === "Rare" ? 4000 : 10000));
    const quantityPercentile = (quantity - minQuantity) / (maxQuantity - minQuantity);

    if (quantityPercentile >= 0.76) {
        quantityClass = 'green-ready-text';
    } else if (quantityPercentile >= 0.51) {
        quantityClass = 'none';
    } else if (quantityPercentile >= 0.26) {
        quantityClass = 'warning-orange-text';
    } else {
        quantityClass = 'red-disabled-text';
    }

    if (rarity === "Uncommon") {
        if (quantityClass === 'green-ready-text') quantityClass = 'none';
    } else if (rarity === "Common") {
        if (quantityClass === 'green-ready-text') quantityClass = 'warning-orange-text';
    }

    if (rarity === "Legendary") {
        const commanderName = getSaveName();
        name = generateLegendaryAsteroidName(commanderName);
        specialName = true;
    }

    return {
        [name]: {
            name,
            distance: [distance, distanceClass],
            rarity: [rarity, rarityClass],
            easeOfExtraction: [easeOfExtraction, easeClass],
            quantity: [quantity, quantityClass],
            originalQuantity: quantity,
            beingMined: false,
            specialName: specialName
        }
    };
}

function generateLegendaryAsteroidName(commanderName) {
    const asteroidNameParts = [
        "Eternal", "Dominion", "Celestara", "Hyperion", "Zenith", 
        "Titanis", "Astralis", "Nebularis", "Excalis", "Oblivion", 
        "Infinity", "Nova", "Sentinel", "Aetheris", "Solstice", 
        "Zephyrus", "Valhalla", "Eon", "Omicron", "Vanguard"
    ];

    let cleanedName = commanderName.replace(/[0-9]/g, "");
    cleanedName = capitaliseString(cleanedName);
    let nameComponent = asteroidNameParts[Math.floor(Math.random() * asteroidNameParts.length)];
    let usePrefix = Math.random() > 0.5;
    let asteroidName = usePrefix ? `${nameComponent} ${cleanedName}` : `${cleanedName} ${nameComponent}`;

    const asteroidArray = getAsteroidArray();
    const existingKeys = asteroidArray.map(asteroid => Object.keys(asteroid)[0]);

    let attempts = 0;

    while (existingKeys.includes(asteroidName) && attempts < 100) {
        nameComponent = asteroidNameParts[Math.floor(Math.random() * asteroidNameParts.length)];
        usePrefix = Math.random() > 0.5;
        asteroidName = usePrefix ? `${nameComponent} ${cleanedName}` : `${cleanedName} ${nameComponent}`;
        attempts++;
    }

    if (attempts >= 100) { //lower this number if any performance issues, 50 is probably ok
        let increment = 1;
        let newAsteroidName = `${asteroidName}${increment}`;

        while (existingKeys.includes(newAsteroidName)) {
            increment++;
            newAsteroidName = `${asteroidName}${increment}`;
        }

        asteroidName = newAsteroidName;
    }

    return asteroidName;
}

export function boostAntimatterRate(start) {
    const rateBarInner = document.getElementById('svgRateBarInner');
    const boostText = document.getElementById('boostTextContainer');
    const svgRateBarOuter = document.getElementById('svgRateBarOuter');
    
    if (rateBarInner) {
        if (start) {
            //console.log('starting boost');
            setIsAntimatterBoostActive(true);
            boostText.style.color = 'var(--ready-text)';
            svgRateBarOuter.style.backgroundColor = `rgba(var(--text-color-rgb), 0.6)`;
            rateBarInner.style.height = `${parseFloat(rateBarInner.style.height) * 2}%`;
            rateBarInner.style.backgroundColor = "var(--ready-text)";
        } else {
                //console.log('stopping boost');
                setIsAntimatterBoostActive(false);
                setHasAntimatterSvgRightBoxDataChanged(null);  
        }
    }
}

export function generateStarDataAndAddToDataObject(starElement, distance) {
    const fuel = calculateAntimatterRequired(distance);
    const ascendencyPoints = calculateAscendencyPoints(distance);

    const weatherTypes = {
        sunny: ['☀', 'green-ready-text'],
        cloudy: ['☁', 'warning-orange-text'],
        rain: ['☂', 'warning-orange-text'],
        volcano: ['⛰', 'red-disabled-text']
    };

    let weatherProbabilities = {
        sunny: 0,
        cloudy: 0,
        rain: 0,
        volcano: 0
    };

    let totalProbability = 0;
    Object.keys(weatherProbabilities).forEach(type => {
        weatherProbabilities[type] = Math.floor(Math.random() * 25);
        totalProbability += weatherProbabilities[type];
    });

    const scalingFactor = 100 / totalProbability;
    Object.keys(weatherProbabilities).forEach(type => {
        weatherProbabilities[type] = Math.round(weatherProbabilities[type] * scalingFactor);
    });

    const difference = 100 - Object.values(weatherProbabilities).reduce((acc, val) => acc + val, 0);
    if (difference !== 0) {
        weatherProbabilities.sunny += difference;
    }

    let weatherTendency = [];
    let maxProbability = 0;
    Object.keys(weatherProbabilities).forEach(type => {
        if (weatherProbabilities[type] > maxProbability) {
            maxProbability = weatherProbabilities[type];
            weatherTendency = [weatherTypes[type][0], weatherProbabilities[type], weatherTypes[type][1]];
        }
    });

    const randomPrecipitationType = calculatePrecipitationType();
    
    calculateIfHasAncientManuscript(starElement.id.toLowerCase());
    const factoryStar = checkIfFactoryStar(starElement.id.toLowerCase());

    const newStarData = {
        startingStar: false,
        starCode: starElement.id.toUpperCase(),
        name: starElement.id.toLowerCase(),
        distance: distance,
        fuel: fuel,
        ascendencyPoints: ascendencyPoints,
        precipitationResourceCategory: 'compounds',
        precipitationType: randomPrecipitationType,
        weather: {
            sunny: [weatherProbabilities.sunny, weatherTypes.sunny[0], 1, weatherTypes.sunny[1]],
            cloudy: [weatherProbabilities.cloudy, weatherTypes.cloudy[0], 0.6, weatherTypes.cloudy[1]],
            rain: [weatherProbabilities.rain, weatherTypes.rain[0], 0.4, weatherTypes.rain[1]],
            volcano: [weatherProbabilities.volcano, weatherTypes.volcano[0], 0.05, weatherTypes.volcano[1]]
        },
        weatherTendency: weatherTendency,
        factoryStar: factoryStar ? factoryStar : false
    };

    setStarSystemDataObject(newStarData, 'stars', [starElement.id.toLowerCase()]);
}

function checkIfFactoryStar(starName) {
    const entries = getStarsWithAncientManuscripts();

    for (const [manuscriptStar, factoryStarName, value, reported] of entries) {
        if (factoryStarName === starName) {
            return value;
        }
    }

    return false;
}

function calculateIfHasAncientManuscript(starName) {
    const ancientManuscriptsGenerated = getStarsWithAncientManuscripts().length;
    const maxAncientManuscripts = getMaxAncientManuscripts();
    
    let probability = 0;

    if (ancientManuscriptsGenerated >= maxAncientManuscripts || getFactoryStarsArray().includes(starName)) {
        return;
    } else {
        const visionDistance = getStarVisionDistance();

        if (visionDistance < 5 && ancientManuscriptsGenerated === 0) {
            probability = 20;
        } else if (visionDistance === 5 && ancientManuscriptsGenerated === 0) {
            probability = 100;
        } else if (visionDistance >= 6 && visionDistance <= 19 && ancientManuscriptsGenerated < 2) {
            probability = 20;
        } else if (visionDistance === 20 && ancientManuscriptsGenerated < 2) {
            probability = 100;
        } else if (visionDistance >= 21 && visionDistance <= 34 && ancientManuscriptsGenerated < 3) {
            probability = 20;
        } else if (visionDistance === 35 && ancientManuscriptsGenerated < 3) {
            probability = 100;
        } else if (visionDistance >= 36 && visionDistance <= 44 && ancientManuscriptsGenerated < 4) {
            probability = 20;
        } else if (visionDistance === 45 && ancientManuscriptsGenerated < 4) {
            probability = 100;
        } else {
            probability = 0;
        }
    }

    if (Math.random() * 100 < probability) {
        const position = ancientManuscriptsGenerated + 1;
        const factoryStarToPointTo = selectFactoryStarSystem(position);
        setFactoryStarsArray(factoryStarToPointTo); //watch out for null being set in here by not finding a factoryStarToPointTo and handle if this happens
        setStarsWithAncientManuscripts([starName, factoryStarToPointTo, position, false]); //add factoryStarToPointTo as second argument and shift others along
    }
}

export function selectFactoryStarSystem(position) {
    const dummyContainer = document.createElement('div');
    const factoryStarCandidates = generateStarfield(dummyContainer, NUMBER_OF_STARS, STAR_FIELD_SEED, null, false, null, true);

    let minDistance = 0;
    let maxDistance = 100;

    switch (position) {
        case 1:
            minDistance = 5;
            maxDistance = 15;
            break;
        case 2:
            minDistance = 16;
            maxDistance = 25;
            break;
        case 3:
            minDistance = 26;
            maxDistance = 40;
            break;
        case 4:
            minDistance = 41;
            maxDistance = 60;
            break;
    }

    const filteredCandidates = factoryStarCandidates.filter(
        ([name, distance]) => distance >= minDistance && distance <= maxDistance
    );

    if (filteredCandidates.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * filteredCandidates.length);
    return filteredCandidates[randomIndex][0];
}


export function calculateAscendencyPoints(distance) {
    const MIN_DISTANCE = 1;
    const MAX_DISTANCE = 100;
    const MIN_AP = 1;
    const MAX_AP = 50;

    if (distance >= 97.5) return MAX_AP;

    let normalizedDistance = (distance - MIN_DISTANCE) / (MAX_DISTANCE - MIN_DISTANCE);
    normalizedDistance = Math.max(0, Math.min(1, normalizedDistance));

    const exponent = 2.5;
    let ascendencyPoints = MIN_AP + (MAX_AP - MIN_AP) * Math.pow(normalizedDistance, exponent);
    ascendencyPoints = Math.min(MAX_AP - 1, Math.round(ascendencyPoints));

    let modifiedAP = ascendencyPoints;
    if (ascendencyPoints > 1 && ascendencyPoints < MAX_AP) {
        if (Math.random() < 0.2) {
            modifiedAP -= Math.ceil(Math.random() * Math.max(1, modifiedAP * 0.1));
        }
    }

    modifiedAP = getAscendencyPointsWithRepeatableBonus(modifiedAP);

    return modifiedAP;
}

export function calculateAntimatterRequired(distance) {
    const MIN_DISTANCE = 1;
    const MAX_DISTANCE = 100;
    const MIN_COST = Math.floor(Math.random() * (6000 - 4000 + 1)) + 4000;
    const MAX_COST = Math.floor(Math.random() * (160000 - 150000 + 1)) + 150000;

    let normalizedDistance = (distance - MIN_DISTANCE) / (MAX_DISTANCE - MIN_DISTANCE);

    normalizedDistance = Math.max(0, Math.min(1, normalizedDistance));

    const exponent = 2.5;
    const antimatterRequired = MIN_COST + (MAX_COST - MIN_COST) * Math.pow(normalizedDistance, exponent);

    return Math.round(antimatterRequired);
}

export function calculatePrecipitationType() {
    const precipitationWeights = [
        { type: "titanium", weight: 4 },
        { type: "water", weight: 40 },
        { type: "glass", weight: 19 },
        { type: "diesel", weight: 30 },
        { type: "concrete", weight: 0 },
        { type: "steel", weight: 7 }
    ];

    const weightedPrecipitationTypes = [];
    let cumulativeWeight = 0;

    precipitationWeights.forEach(({ type, weight }) => {
        cumulativeWeight += weight;
        weightedPrecipitationTypes.push({ type, cumulativeWeight });
    });

    const randomValue = Math.floor(Math.random() * 100);

    const selectedPrecipitationType = weightedPrecipitationTypes.find(({ cumulativeWeight }) => randomValue < cumulativeWeight);

    return selectedPrecipitationType ? selectedPrecipitationType.type : "water";
}

export function generateDestinationStarData() {
    const existingData = getStarSystemDataObject('stars', ['destinationStar']) || {};
    const destinationStar = getDestinationStar();

    if (destinationStar && destinationStar.toLowerCase() === getHomeStarName()) {
        const miaplacidusData = JSON.parse(JSON.stringify(miaplacidus));
        const updatedData = {
            ...existingData,
            ...miaplacidusData
        };

        setStarSystemDataObject(updatedData, 'stars', ['destinationStar']);
        return;
    }

    const lifeDetected = generateLifeDetection();
    //const lifeDetected = false; 
    const civilizationLevel = lifeDetected ? generateCivilizationLevel(existingData || 0) : 'None';
    //const civilizationLevel = 'Unsentient';
    const lifeformTraits = generateLifeformTraits(civilizationLevel);
    const population = lifeDetected ? generatePopulationEstimate(lifeformTraits) : 0;
    const raceName = generateRaceName(civilizationLevel);

    const threatLevel = lifeDetected ? generateThreatLevel(civilizationLevel, population, lifeformTraits) : "None";
    let defenseRating = lifeDetected ? generateDefenseRating(civilizationLevel, threatLevel, lifeformTraits) : 0;
    let enemyFleets = lifeDetected ? generateEnemyFleets(threatLevel, population, lifeformTraits) : 0;
    
    let anomalies = generateAnomalies(defenseRating, enemyFleets);
    defenseRating = anomalies[1];
    enemyFleets = anomalies[2];
    anomalies = anomalies[0];

    const initialImpression = calculateInitialImpression(lifeformTraits, civilizationLevel, threatLevel, enemyFleets, population);
    const attitude = calculateAttitude(initialImpression, civilizationLevel);
    const currentImpression = initialImpression;
    const triedToBully = false;
    const latestDifferenceInImpression = 0;
    let patience = Math.floor(Math.random() * (5 - 3 + 1)) + 3;

    if (lifeformTraits[0]) {
        if (lifeformTraits[0][0] === "Diplomatic") {
            patience += 1;
        } else if (lifeformTraits[0][0] === "Aggressive") {
            patience -= 1;
        }
    }

    const updatedData = {
        ...existingData,
        lifeDetected,
        lifeformTraits,
        civilizationLevel,
        populationEstimate: population,
        raceName,
        threatLevel,
        defenseRating,
        enemyFleets,
        anomalies, 
        initialImpression,
        currentImpression,
        latestDifferenceInImpression,
        attitude,
        triedToBully,
        patience
    };

    setStarSystemDataObject(updatedData, 'stars', ['destinationStar']);
}

function generateLifeDetection() {
    if (getFactoryStarsArray().includes(getDestinationStar())) {
        return true;
    } 

    return Math.random() < 0.97;
}

function generateLifeformTraits(civilizationLevel) {
    if (getFactoryStarsArray().includes(getDestinationStar())) {
        return [['Aggressive', 'red-disabled-text'], ['Mechanized', ''], ['Armored', 'red-disabled-text']];
    }

    const primaryTraits = [['Aggressive', 'red-disabled-text'], ['Diplomatic', 'green-ready-text']];
    const habitatTraits = [['Terrans', ''], ['Aquatic', ''], ['Aerialians', '']];
    const extraTraits = [['Armored', 'red-disabled-text'], ['Hive Mind', 'red-disabled-text'], ['Power Siphon', 'warning-orange-text'], ['Hypercharge', 'warning-orange-text']];
    
    if (civilizationLevel === 'Unsentient' || civilizationLevel === 'None') {
        return [['N/A', ''], ['N/A', ''], ['N/A', '']];
    }

    const primaryTrait = primaryTraits[Math.floor(Math.random() * primaryTraits.length)];
    const habitatTrait = habitatTraits[Math.floor(Math.random() * habitatTraits.length)];
    const extraTrait = extraTraits[Math.floor(Math.random() * extraTraits.length)];

    return [primaryTrait, habitatTrait, extraTrait];
}

function generateCivilizationLevel(starData) {
    if (getFactoryStarsArray().includes(getDestinationStar())) {
        return 'Robotic';
    } 

    const randomValue = Math.random();

    if (randomValue < 0.1) {
        return 'Unsentient';
    } else if (randomValue < 0.55) {
        addToResourceAllTimeStat(starData.ascendencyPoints, 'apAnticipated'); //double anticipated if a civilization is there
        return 'Industrial';
    } else {
        addToResourceAllTimeStat(starData.ascendencyPoints, 'apAnticipated'); //double anticipated if a civilization is there
        return 'Spacefaring';
    }
}

function generatePopulationEstimate(lifeformTraits) {
    let population;

    if (getFactoryStarsArray().includes(getDestinationStar())) {
        population = Math.floor(Math.random() * (100000000 - 50000000 + 1)) + 50000000;
    } else {
        population = Math.floor(Math.random() * (50000000 - 1000000 + 1)) + 1000000;

        if (lifeformTraits.some(trait => trait[0] === 'Hive Mind')) {
            population *= 4;
        }
    }

    return population;
}

function generateThreatLevel(civilizationLevel, population, lifeformTraits) {
    if (getFactoryStarsArray().includes(getDestinationStar())) {
        return 'Extreme';
    } 

    let threatLevel = "None";

    if (civilizationLevel === "Unsentient") {
        return threatLevel;
    }

    if (civilizationLevel === "Industrial") {
        if (population >= 10000000) {
            threatLevel = "Moderate";
        } else {
            threatLevel = "Low";
        }
    } else if (civilizationLevel === "Spacefaring") {
        if (population >= 50000000) {
            threatLevel = "Extreme";
        } else if (population >= 10000000) {
            threatLevel = "High";
        } else {
            threatLevel = "Moderate";
        }
    }

    if (lifeformTraits.some(trait => trait[0] === "Diplomatic") && threatLevel !== "None") {
        const threatLevels = ["None", "Low", "Moderate", "High", "Extreme"];
        const currentIndex = threatLevels.indexOf(threatLevel);
        threatLevel = threatLevels[Math.max(0, currentIndex - 1)];
    }    

    return threatLevel;
}

function generateDefenseRating(civilizationLevel, threatLevel, lifeformTraits) {
    const maxDefense = 100;
    let defenseRating = 0;

    if (civilizationLevel === "Unsentient") {
        return defenseRating;
    }

    const threatMultipliers = {
        "None": 0,
        "Low": 0.2,
        "Moderate": 0.4,
        "High": 0.7,
        "Extreme": 1
    };

    const civilizationBonus = civilizationLevel === "Spacefaring" ? 1 : 0.5;

    defenseRating = Math.round(maxDefense * threatMultipliers[threatLevel] * civilizationBonus);

    if (lifeformTraits.some(trait => trait[0] === "Armored")) {
        defenseRating = Math.min(maxDefense, defenseRating + 25);
    }    

    const minDefense = Math.max(1, defenseRating - 10);
    const maxDefenseAdjusted = Math.min(100, defenseRating + 10);

    return Math.floor(Math.random() * (maxDefenseAdjusted - minDefense + 1)) + minDefense;
}

function generateEnemyFleets(threatLevel, population, lifeformTraits) {
    const threatFleetMultipliers = {
        "None": 0,
        "Low": 0.00000001,
        "Moderate": 0.000000013,
        "High": 0.0000000169,
        "Extreme": 0.00000002197
    };    

    let totalFleets = Math.floor(population * threatFleetMultipliers[threatLevel] * 100);

    if (lifeformTraits.some(trait => trait[0] === "Diplomatic")) {
        totalFleets = Math.floor(totalFleets * 0.5);
    }    

    if (totalFleets === 0) return { land: 0, air: 0, sea: 0, fleetPower: 0 };

    let primaryType;
    if (lifeformTraits.some(trait => trait[0] === "Terrans") || lifeformTraits.some(trait => trait[0] === "Mechanized")) primaryType = "land";
    else if (lifeformTraits.some(trait => trait[0] === "Aerialians")) primaryType = "air";
    else if (lifeformTraits.some(trait => trait[0] === "Aquatic")) primaryType = "sea";    
    else primaryType = ["land", "air", "sea"][Math.floor(Math.random() * 3)];

    const primaryFleets = Math.floor(totalFleets * 0.6);
    let remainingFleets = totalFleets - primaryFleets;

    let secondaryFleets = Math.floor(Math.random() * (remainingFleets + 1));
    let tertiaryFleets = remainingFleets - secondaryFleets;

    let fleetDistribution = { land: 0, air: 0, sea: 0 };
    fleetDistribution[primaryType] = primaryFleets;

    let otherTypes = ["land", "air", "sea"].filter(type => type !== primaryType);
    fleetDistribution[otherTypes[0]] = secondaryFleets;
    fleetDistribution[otherTypes[1]] = tertiaryFleets;

    const fleetPower = fleetDistribution.air * 2 + fleetDistribution.land * 4 + fleetDistribution.sea * 6;
    return { ...fleetDistribution, fleetPower };
}

function generateAnomalies(defenseRating, enemyFleets) {
    if (getFactoryStarsArray().includes(getDestinationStar())) {
        return [
            ["Stalwart"],
            defenseRating,
            {
                ...enemyFleets,
                fleetChanges: {
                    air: { value: 0, class: "red-disabled-text" },
                    land: { value: 0, class: "red-disabled-text" },
                    sea: { value: 0, class: "red-disabled-text" }
                }
            }
        ];
    }

    const possibleAnomalies = [
        { name: "Electromagnetic Surge", effect: "Enemy defense -20%", value: -20, type: "enemy-defense-debuff", counter: "enemy-defense-buff", target: "enemy", class: "green-ready-text" },
        { name: "Fortified Magnetic Field", effect: "Enemy defense +20%", value: 20, type: "enemy-defense-buff", counter: "enemy-defense-debuff", target: "enemy", class: "red-disabled-text" },
        { name: "Plasma Instability", effect: "Player attack power +15%", value: 15, type: "player-attack-buff", counter: "player-attack-debuff", target: "player", class: "green-ready-text" },
        { name: "Energy Dampening Field", effect: "Player attack -15%", value: -15, type: "player-attack-debuff", counter: "player-attack-buff", target: "player", class: "red-disabled-text" },
        { name: "Atmospheric Disturbance", effect: "Enemy air fleets -30%", value: -30, type: "air-debuff", counter: "air-buff", target: "enemy", class: "green-ready-text" },
        { name: "High-Altitude Jet Streams", effect: "Enemy air fleets +20%", value: 20, type: "air-buff", counter: "air-debuff", target: "enemy", class: "red-disabled-text" },
        { name: "Seismic Instability", effect: "Enemy land fleets -30%", value: -30, type: "land-debuff", counter: "land-buff", target: "enemy", class: "green-ready-text" },
        { name: "Tectonic Shift", effect: "Enemy land fleets +20%", value: 20, type: "land-buff", counter: "land-debuff", target: "enemy", class: "red-disabled-text" },
        { name: "Deep Ocean Currents", effect: "Enemy sea fleets -30%", value: -30, type: "sea-debuff", counter: "sea-buff", target: "enemy", class: "green-ready-text" },
        { name: "Dark Matter Flux", effect: "Enemy sea fleets +20%", value: 20, type: "sea-buff", counter: "sea-debuff", target: "enemy", class: "red-disabled-text" }
    ];

    const shuffled = possibleAnomalies.sort(() => Math.random() - 0.5);
    let selectedAnomalies = [];
    let modifiedDefense = defenseRating;
    let modifiedEnemyFleets = { ...enemyFleets };
    let fleetChanges = { air: {}, land: {}, sea: {} };

    const isNoFleets = modifiedEnemyFleets.air === 0 && modifiedEnemyFleets.land === 0 && modifiedEnemyFleets.sea === 0;

    if (!isNoFleets) {
        for (let anomaly of shuffled) {
            if (!selectedAnomalies.some(a => a.type === anomaly.counter)) {
                selectedAnomalies.push(anomaly);
    
                if (anomaly.type.includes("enemy-defense")) {
                    modifiedDefense += (anomaly.value / 100) * modifiedDefense;
                } else if (!anomaly.type.includes("player")) {
                    let fleetType = anomaly.type.split('-')[0];
    
                    if (modifiedEnemyFleets[fleetType] !== undefined) {
                        let changeAmount = (anomaly.value / 100) * modifiedEnemyFleets[fleetType];
                        modifiedEnemyFleets[fleetType] = Math.floor(modifiedEnemyFleets[fleetType] + changeAmount);
    
                        let classType = anomaly.value > 0 ? "red-disabled-text" : "green-ready-text";
    
                        fleetChanges[fleetType] = {
                            value: Math.floor(changeAmount),
                            class: classType
                        };
                    }
                }
            }
            if (selectedAnomalies.length === 2) break;
        }
        return [selectedAnomalies, modifiedDefense, { ...modifiedEnemyFleets, fleetChanges }];
    } else {
        return [selectedAnomalies, modifiedDefense, { ...modifiedEnemyFleets, fleetChanges }];
    }
}

function generateRaceName(civilizationLevel) {
    if (getFactoryStarsArray().includes(getDestinationStar())) {
        const baseName = getStarSystemDataObject('stars', [getDestinationStar(), 'factoryStar']);
        const suffixes = ['Sentinels', 'Wardens', 'Guardians', 'Protectors', 'Custodians', 'Overseers', 'Aegis'];
        const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        return `${baseName} ${randomSuffix}`;
    }
    
    if (civilizationLevel === 'Unsentient') {
        const unsentientRaces = ['Floral', 'Bacterial', 'Cellular', 'Fungal', 'Mossy', 'Lichenous', 'Microbial', 'Protozoan'];
        return unsentientRaces[Math.floor(Math.random() * unsentientRaces.length)];
    }

    if (civilizationLevel === 'None') {
        return 'None';
    }

    const useStarName = Math.random() < 0.5;
    let starName = getDestinationStar().split(" ")[0].toLowerCase();

    const prefixes = [
        "Xy", "Za", "Vo", "Thra", "Kro", "Mora", "Dra", "Nexa", "Vex", "Zy",
        "Tero", "Qua", "Joro", "Phy", "Uro", "Grex", "Sylo", "Fero", "Wex", "Dexo",
        "Byra", "Tarn", "Oza", "Kly", "Mexo", "Pha", "Voro", "Dren", "Sora", "Lumo",
        "Xero", "Trilo", "Bry", "Nyth", "Quen", "Kyra", "Drano", "Luth", "Zylo", "Omex"
    ];
    
    const middles = [
        "vi", "lor", "thar", "quon", "zar", "mion", "rax", "drel", "vex", "nex",
        "phy", "ryn", "sol", "tarn", "bex", "thyl", "zor", "phel", "kyn", "threx",
        "lyx", "vor", "drix", "quar", "meth", "syl", "tor", "zarn", "lex", "dyn"
    ];
    
    const suffixes = [
        "ites", "ians", "nths", "oids", "ari", "ans", "eths", "ors", "ex", "ar",
        "oth", "orn", "yx", "eth", "al", "os", "ith", "une", "yn", "um",
        "orax", "eron", "ara", "oza", "exo", "yss", "ithil", "onis", "uva", "quix"
    ];

    let raceName;

    if (useStarName) {
        let prefix = Math.random() < 0.5 ? prefixes[Math.floor(Math.random() * prefixes.length)] : "";
        let middle = Math.random() < 0.5 ? middles[Math.floor(Math.random() * middles.length)] : "";
        let suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

        raceName = `${prefix}${starName}${middle}${suffix}`;
    } else {
        let prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        let middle = middles[Math.floor(Math.random() * middles.length)];
        let suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

        raceName = `${prefix}${middle}${suffix}`;
    }

    raceName = raceName.length <= 14 ? raceName : raceName.substring(0, 14);
    return raceName.charAt(0).toUpperCase() + raceName.slice(1);
}

function calculateInitialImpression(lifeformTraits, civilizationLevel, threatLevel, enemyFleets, population) {

    if (getFactoryStarsArray().includes(getDestinationStar())) {
        setDiplomacyPossible(false);
        return 0;
    }

    if (civilizationLevel === 'Unsentient' || civilizationLevel === 'None') {
        return 100;
    }

    let impression = getInitialImpression();

    if (lifeformTraits.some(trait => trait[0] === "Diplomatic")) {
        impression = 50;
    } else if (lifeformTraits.some(trait => trait[0] === "Aggressive")) {
        impression = 20;
    }

    if (lifeformTraits.some(trait => trait[0] === "Armored")) {
        impression -= 5;
    }
    if (lifeformTraits.some(trait => trait[0] === "Hive Mind")) {
        impression -= 10;
    }
    if (lifeformTraits.some(trait => trait[0] === "Power Siphon")) {
        impression += 3;
    }
    if (lifeformTraits.some(trait => trait[0] === "Hypercharge")) {
        impression += 3;
    }

    if (civilizationLevel === "Industrial") {
        impression += 5;
    } else if (civilizationLevel === "Spacefaring") {
        impression -= 5;
    }

    const threatModifiers = {
        "None": 5,
        "Low": 3,
        "Moderate": -5,
        "High": -10,
        "Extreme": -15
    };
    let threatImpact = threatModifiers[threatLevel] || 0;
    impression += threatImpact;
    // console.log(`Threat level '${threatLevel}' applied (${threatImpact}), new impression: ${impression}`);

    const totalFleetSize = enemyFleets.air + enemyFleets.land + enemyFleets.sea;
    let fleetPenalty = Math.floor(totalFleetSize / 20);
    impression -= fleetPenalty;
    // console.log(`Total fleet size: ${totalFleetSize}, fleet penalty: ${fleetPenalty}, new impression: ${impression}`);

    if (population < 5000000) {
        impression += 5;
        // console.log(`Small population detected, new impression: ${impression}`);
    } else if (population > 50000000) {
        impression -= 5;
        // console.log(`Large population detected, new impression: ${impression}`);
    }

    impression = Math.max(0, Math.min(80, impression));
    if (impression < 10) {
        setBelligerentEnemyFlag(true);
    } else {
        setBelligerentEnemyFlag(false);
    }
    // console.log(`Final impression (clamped to 0-80 range): ${impression}`);

    setDiplomacyPossible(impression >= 10);
    return impression;
}

function calculateAttitude(impression, civilizationLevel) {

    if (getFactoryStarsArray().includes(getDestinationStar())) {
        return 'Belligerent';
    }

    if (civilizationLevel === 'Unsentient' || civilizationLevel === 'None') return 'None';
    if (impression >= 60) {
        return 'Receptive';
    } else if (impression >= 45) {
        return 'Neutral';
    } else if (impression >= 10) {
        return 'Reserved';
    } else {
        return 'Belligerent';
    }
}

export function calculateModifiedAttitude(starData) {
    setDiplomacyPossible(getResourceDataObject('space', ['upgrades', 'fleetEnvoy', 'envoyBuiltYet']) && starData.currentImpression >= 10);
    const civilizationLevel = starData.civilizationLevel;
    if (civilizationLevel === 'Unsentient' || civilizationLevel === 'None' || !getDiplomacyPossible() || !getFleetChangedSinceLastDiplomacy()) return;

    const playerAttackPower = getResourceDataObject('fleets', ['attackPower']);
    const enemyTraitMain = starData.lifeformTraits[0][0];
    const enemyPower = Math.floor(starData.enemyFleets.air + starData.enemyFleets.land + starData.enemyFleets.sea);
    
    let initialImpression = starData.initialImpression;
    let currentImpression = starData.currentImpression;

    let powerDifference = playerAttackPower - enemyPower;
    let bonus = Math.floor(Math.abs(powerDifference) / 10);
    
    if (powerDifference !== 0) {
        if (enemyTraitMain === 'Diplomatic') {
            currentImpression += powerDifference > 0 ? bonus : -bonus;
        } else if (enemyTraitMain === 'Aggressive') {
            currentImpression += powerDifference > 0 ? Math.floor(bonus / 2) : -Math.floor(bonus / 2);
        }
    }

    const minImpression = Math.max(0, initialImpression - 10);
    const maxImpression = Math.min(100, initialImpression + 10);
    currentImpression = Math.max(minImpression, Math.min(maxImpression, currentImpression));

    const latestDifferenceInImpression = currentImpression - starData.currentImpression;

    setStarSystemDataObject(currentImpression, 'stars', ['destinationStar', 'currentImpression']);
    setStarSystemDataObject(latestDifferenceInImpression, 'stars', ['destinationStar', 'latestDifferenceInImpression']);

    const newAttitude = calculateAttitude(currentImpression, civilizationLevel);

    setStarSystemDataObject(newAttitude, 'stars', ['destinationStar', 'attitude']);
}

export function updateDiplomacySituation(buttonPressed, starData) {
    switch (buttonPressed) {
        case 'bully':
            bullyEnemy(starData);
            break;
        case 'passive':
            chatAndExchangePleasantries(starData);
            break;
        case 'harmony':
            tryToImproveImpression(starData);
            break;
        case 'vassalize':
            tryToVassalizeEnemy(starData);
            break;
        case 'conquest':
            const enemyFleetSum = (starData.enemyFleets.air || 0) + (starData.enemyFleets.land || 0) + (starData.enemyFleets.sea || 0);
            if (starData.civilizationLevel === 'None' || starData.civilizationLevel === 'Unsentient' || enemyFleetSum === 0) {
                
                if (starData.civilizationLevel === 'None') {
                    setAchievementFlagArray('discoverSystemWithNoLife', 'add');
                } else if (starData.civilizationLevel === 'Unsentient') {
                    setAchievementFlagArray('settleUnoccupiedSystem', 'add'); 
                }

                settleSystemAfterBattle('noSentientLife');
                break;
            }
            setEnemyFleetPower();
            setFormationGoal(null);
            setNeedNewBattleCanvas(true);
            colonisePrepareWarUI('chooseWar');
            break;
    }
}

export function setEnemyFleetPower() {
    let enemyFleetPowerAir = getStarSystemDataObject('stars', ['destinationStar', 'enemyFleets', 'air'])  * 2;
    let enemyFleetPowerLand = getStarSystemDataObject('stars', ['destinationStar', 'enemyFleets', 'land']) * 4;
    let enemyFleetPowerSea = getStarSystemDataObject('stars', ['destinationStar', 'enemyFleets', 'sea']) * 6;

    const totalEnemyFleetPower = Math.floor(enemyFleetPowerAir + enemyFleetPowerLand + enemyFleetPowerSea);
    setStarSystemDataObject(totalEnemyFleetPower, 'stars', ['destinationStar', 'enemyFleets', 'fleetPower']);
}

function bullyEnemy(starData) {
    const enemyTraitMain = starData.lifeformTraits[0][0];
    const playerAttackPower = getResourceDataObject('fleets', ['attackPower']);
    const enemyPower = Math.floor(starData.enemyFleets.air + starData.enemyFleets.land + starData.enemyFleets.sea);
    const enemyDefense = starData.defenseRating;

    let currentImpression = starData.currentImpression;

    const totalEnemyStrength = enemyPower + enemyDefense;
    const powerRatio = playerAttackPower / totalEnemyStrength;

    let outcome = "";

    if (powerRatio > 2 && enemyTraitMain === "Diplomatic") {
        outcome = Math.random() < 0.3 ? "scared" : "surrender";
    } else if (powerRatio >= 1.2 && enemyTraitMain !== "Aggressive") {
        outcome = Math.random() < 0.3 ? "attack" : "scared";
    } else if (powerRatio < 1.2 || enemyTraitMain === "Aggressive") {
        if (enemyTraitMain === 'Diplomatic') {
            outcome = Math.random() < 0.5 ? "attack" : "laugh";
        } else {
            outcome = "attack";
        }
    } else {
        outcome = "laugh";
    }  

    switch (outcome) {
        case "surrender":
            setStarSystemDataObject("Surrendered", 'stars', ['destinationStar', 'attitude']);
            setStarSystemDataObject(0, 'stars', ['destinationStar', 'enemyFleets', 'air']);
            setStarSystemDataObject(0, 'stars', ['destinationStar', 'enemyFleets', 'land']);
            setStarSystemDataObject(0, 'stars', ['destinationStar', 'enemyFleets', 'sea']);
            setEnemyFleetPower();
            colonisePrepareWarUI('surrender');
            setAchievementFlagArray('bullyEnemyIntoSubmission', 'add');
            break;
        case "scared":
            setStarSystemDataObject("Scared", 'stars', ['destinationStar', 'attitude']);
            setStarSystemDataObject(Math.floor((starData.enemyFleets.air || 0) / 2), 'stars', ['destinationStar', 'enemyFleets', 'air']);
            setStarSystemDataObject(Math.floor((starData.enemyFleets.land || 0) / 2), 'stars', ['destinationStar', 'enemyFleets', 'land']);
            setStarSystemDataObject(Math.floor((starData.enemyFleets.sea || 0) / 2), 'stars', ['destinationStar', 'enemyFleets', 'sea']);
            setEnemyFleetPower();
            colonisePrepareWarUI('scared');
            break;
        case "attack":
            setStarSystemDataObject(Math.ceil(starData.defenseRating * 1.1), 'stars', ['destinationStar', 'defenseRating']);
            setStarSystemDataObject(0, 'stars', ['destinationStar', 'patience']);
            colonisePrepareWarUI('insulted');
            break;
        case "laugh":
            currentImpression -= 10;
            setStarSystemDataObject(currentImpression, 'stars', ['destinationStar', 'currentImpression']);
            setStarSystemDataObject(-10, 'stars', ['destinationStar', 'latestDifferenceInImpression']);
            if (currentImpression < 10) {
                colonisePrepareWarUI('laughWar'); 
            } else {
                colonisePrepareWarUI('laugh');
            }
            break;
    }

    const optionContentElement = document.getElementById(`optionContentTab5`);
    optionContentElement.innerHTML = '';
    drawTab5Content('Colonise', optionContentElement, false, true);
}

async function chatAndExchangePleasantries(starData) {
    const enemyTraitMain = starData.lifeformTraits[0][0];

    let currentImpression = starData.currentImpression;
    let attitude = starData.attitude;
    const triedToBully = starData.triedToBully;
    const patience = starData.patience;

    let outcome = attitude;

    if (enemyTraitMain === "Diplomatic") {
        if (triedToBully && Math.random() < 0.5) {
            outcome = "Belligerent";
        } else if (currentImpression >= 45) {
            outcome = Math.random() < 0.6 ? "Receptive" : "Neutral";
        } else {
            outcome = Math.random() < 0.5 ? "Neutral" : "Reserved";
        }
    } else if (currentImpression >= 30) {
        if (triedToBully && Math.random() < 0.5) {
            outcome = "Belligerent";
        } else {
            outcome = "Neutral";
        }
    } else {
        outcome = Math.random() < 0.5 ? "Reserved" : "Belligerent";
        if (triedToBully) {
            outcome = "Belligerent";
        }
    }

    setStarSystemDataObject(outcome, 'stars', ['destinationStar', 'attitude']);

    const patienceModifier = -1;

    if (outcome === "Receptive") {
        currentImpression = Math.floor(Math.random() * (100 - 65 + 1)) + 65;
        setStarSystemDataObject(currentImpression - starData.currentImpression, 'stars', ['destinationStar', 'latestDifferenceInImpression']);
        await colonisePrepareWarUI('receptive');
    } else if (outcome === "Neutral") {
        currentImpression = Math.floor(Math.random() * (59 - 45 + 1)) + 45;
        setStarSystemDataObject(currentImpression - starData.currentImpression, 'stars', ['destinationStar', 'latestDifferenceInImpression']);
        await colonisePrepareWarUI('neutral');
    } else if (outcome === "Reserved") {
        currentImpression = Math.floor(Math.random() * (44 - 10 + 1)) + 10;
        setStarSystemDataObject(currentImpression - starData.currentImpression, 'stars', ['destinationStar', 'latestDifferenceInImpression']);
        await colonisePrepareWarUI('reserved');
    } else if (outcome === "Belligerent") {
        currentImpression = 0;
        setStarSystemDataObject(Math.ceil(starData.defenseRating * 1.1), 'stars', ['destinationStar', 'defenseRating']);
        setStarSystemDataObject(-starData.currentImpression, 'stars', ['destinationStar', 'latestDifferenceInImpression']);
        setStarSystemDataObject(0, 'stars', ['destinationStar', 'patience']);
        colonisePrepareWarUI('insulted');
    }

    setStarSystemDataObject(currentImpression, 'stars', ['destinationStar', 'currentImpression']);
    setStarSystemDataObject(Math.floor(patience + patienceModifier), 'stars', ['destinationStar', 'patience']);

    const optionContentElement = document.getElementById(`optionContentTab5`);
    optionContentElement.innerHTML = '';
    drawTab5Content('Colonise', optionContentElement, false, true);
}


async function tryToImproveImpression() {
    let currentImpression = getStarSystemDataObject('stars', ['destinationStar', 'currentImpression']);
    let patience = getStarSystemDataObject('stars', ['destinationStar', 'patience']);
    patience -= 2;

    setStarSystemDataObject(patience, 'stars', ['destinationStar', 'patience']);

    const harmonyOutcome = Math.random();
    let outcome = '';

    let latestDifference = 0;

    if (harmonyOutcome < 0.50 && patience >= 0) {
        currentImpression = Math.floor(Math.random() * (100 - 85 + 1)) + 85;
        latestDifference = currentImpression - getStarSystemDataObject('stars', ['destinationStar', 'currentImpression']);
        outcome = 'Receptive';
    } else if (harmonyOutcome < 0.75 || patience < 0) {
        currentImpression -= 10;
        latestDifference = -10;
        outcome = 'Rebuff';
    } else {
        currentImpression = 0;
        latestDifference = -getStarSystemDataObject('stars', ['destinationStar', 'currentImpression']);
        setStarSystemDataObject('Belligerent', 'stars', ['destinationStar', 'attitude']);
        outcome = 'Belligerent';
    }

    setStarSystemDataObject(currentImpression, 'stars', ['destinationStar', 'currentImpression']);
    setStarSystemDataObject(latestDifference, 'stars', ['destinationStar', 'latestDifferenceInImpression']);
    setStarSystemDataObject(Math.floor(patience), 'stars', ['destinationStar', 'patience']);

    const optionContentElement = document.getElementById(`optionContentTab5`);
    optionContentElement.innerHTML = '';
    drawTab5Content('Colonise', optionContentElement, false, true);

    if (outcome === 'Receptive') {
        await colonisePrepareWarUI('receptive');
    } else if (outcome === 'Belligerent') {
        setStarSystemDataObject(0, 'stars', ['destinationStar', 'patience']);
        colonisePrepareWarUI('insulted');
    } else {
        await colonisePrepareWarUI('rebuff');
    }
}

function tryToVassalizeEnemy() {
    let probability = 0.75;

    let vassalizeSuccess = Math.random() < probability;

    if (getPlayerPhilosophy() === 'supremacist' && getPhilosophyAbilityActive()) {
        vassalizeSuccess = true;
    }

    if (vassalizeSuccess) {
        setStarSystemDataObject("Surrendered", 'stars', ['destinationStar', 'attitude']);
        setStarSystemDataObject(0, 'stars', ['destinationStar', 'enemyFleets', 'air']);
        setStarSystemDataObject(0, 'stars', ['destinationStar', 'enemyFleets', 'land']);
        setStarSystemDataObject(0, 'stars', ['destinationStar', 'enemyFleets', 'sea']);
        setEnemyFleetPower();
        colonisePrepareWarUI('surrender');
        setAchievementFlagArray('vassalizeEnemy', 'add');
    } else {
        colonisePrepareWarUI('notVassalized');
    }
}

export function addToResourceAllTimeStat(amountToAdd, item) {
    if (item !== 'solar') {
        const setFunction = statFunctionsSets[`set_${item}`];
        setFunction(amountToAdd);
    }
}

function trackEnemyAndAdjustHealth(unit) {
    const battleUnits = getBattleUnits();
    const ownerUnits = battleUnits[unit.currentGoal.owner];

    const enemyDefenseRating = getStarSystemDataObject('stars', ['destinationStar', 'defenseRating']);
    const anomalies = getStarSystemDataObject('stars', ['destinationStar', 'anomalies']);
    const enemyTraits = getStarSystemDataObject('stars', ['destinationStar', 'lifeformTraits']);

    const playerAttackBuff = anomalies.find(anomaly => anomaly.type === "player-attack-buff");
    const playerAttackDebuff = anomalies.find(anomaly => anomaly.type === "player-attack-debuff");
    
    const playerBuffTotal = (playerAttackBuff?.value ?? 0) + (playerAttackDebuff?.value ?? 0);

    const baseHealthReduction = 0.2;

    const goalUnit = ownerUnits.find(u => u.id === unit.currentGoal.id);

    if (goalUnit) {
        if (goalUnit.x !== unit.currentGoal.x || goalUnit.y !== unit.currentGoal.y) {
            unit.currentGoal.x = goalUnit.x;
            unit.currentGoal.y = goalUnit.y;
        }

        if (goalUnit.health > 0) {
            let healthReduction = 0;

            if (goalUnit.owner === 'enemy') {
                healthReduction = Math.max(0, baseHealthReduction - (0.001 * enemyDefenseRating)) * (1 + playerBuffTotal / 100);
            } else if (goalUnit.owner === 'player') {
                healthReduction = 0.1;
            }

            goalUnit.health -= healthReduction;

            if (unit.owner === 'enemy') {
                if (enemyTraits[2][0] === "Power Siphon") {
                    const siphonAmount = healthReduction * 0.25;
                    unit.health = Math.min(100, unit.health + siphonAmount);
                }
            }
        }

        if (goalUnit.health <= 0 && !goalUnit.disabled) {
            unit.currentGoal = null;
            goalUnit.disabled = true;
            explosionAnimation(goalUnit.x, goalUnit.y);
        }
    }

    setBattleUnits(unit.owner, battleUnits[unit.owner]);
}

export function assignGoalToUnits() {
    const canvas = document.getElementById('battleCanvas');
    const battleUnits = getBattleUnits();
    
    ['player', 'enemy'].forEach(owner => {
        battleUnits[owner].forEach(unit => {
            if (!unit.disabled) {
                if (unit.currentGoal?.id === 'hunt') {
                    if (unit.huntX === null && unit.huntY === null) {
                        unit.huntX = unit.currentGoal.x;
                        unit.huntY = unit.currentGoal.y;
                    }
                    unit.currentGoal = getNewGoalForUnit(unit);
                } else if (!unit.currentGoal && getBattleTriggeredByPlayer()) {
                    unit.currentGoal = getNewGoalForUnit(unit);
                } else {
                    if (unit.currentGoal && getVisibleEnemies(unit).some(enemy => enemy.id === unit.currentGoal.id)) {
                        
                        trackEnemyAndAdjustHealth(unit, unit.currentGoal);
                        unit.huntX = null;
                        unit.huntY = null;
                    } else if (getBattleTriggeredByPlayer() ) {
                        if (unit.currentGoal !== 'dead') {
                            unit.currentGoal = {
                                x: Math.floor(Math.random() * (canvas.offsetWidth - 20)) + 10,
                                y: Math.floor(Math.random() * (canvas.offsetHeight - 20)) + 10,
                                id: 'hunt'
                            };
                        }
                    }
                }
            } else {
                if (unit.currentGoal !== 'dead') {
                    unit.currentGoal = 'dead';
                    updateFleetsAfterDestroyingAUnit(unit);
                } else {
                    return;
                } 
            }
        });
        setBattleUnits(owner, battleUnits[owner]);
    });
}

function getNewGoalForUnit(unit) {
    const visibleEnemies = getVisibleEnemies(unit);

    if (unit.currentGoal && unit.currentGoal.id === 'hunt' && visibleEnemies.length === 0) {
        const battleUnits = getBattleUnits();
        const battleUnit = battleUnits[unit.owner]?.find(u => u.id === unit.id);
    
        if (battleUnit && (battleUnit.huntX !== unit.huntX || battleUnit.huntY !== unit.huntY)) {
            return battleUnit.currentGoal;
        }
        
        return unit.currentGoal;
    }    

    const preferredTarget = getPreferredTarget(unit, visibleEnemies);
    return preferredTarget;
}

function getVisibleEnemies(unit) {
    const battleUnits = getBattleUnits();
    const enemyUnits = (unit.owner === 'player' ? battleUnits.enemy : battleUnits.player).filter(enemy => enemy.disabled !== true);

    const visibleEnemies = [];

    const unitRotation = unit.rotation;

    let minAngle = unitRotation - Math.PI / 2 - Math.PI / 2;
    let maxAngle = unitRotation + Math.PI / 2 - Math.PI / 2;
    minAngle = ((minAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
    maxAngle = ((maxAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);

    enemyUnits.forEach(enemy => {
        const dx = enemy.x - unit.x;
        const dy = enemy.y - unit.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= unit.visionDistance) {
            let angleToEnemy = Math.atan2(dy, dx);
            angleToEnemy = ((angleToEnemy % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);

            if (minAngle < maxAngle) {
                if (angleToEnemy >= minAngle && angleToEnemy <= maxAngle) {
                    visibleEnemies.push(enemy);

                    if (Math.random() <= 0.2) {
                        if (unit.currentGoal && unit.currentGoal.id === enemy.id) {
                            shootLaser(unit, enemy);
                        }
                    }
                }
            } 
            else {
                if (angleToEnemy >= minAngle || angleToEnemy <= maxAngle) {
                    visibleEnemies.push(enemy);

                    if (Math.random() <= 0.2) {
                        if (unit.currentGoal && unit.currentGoal.id === enemy.id) {
                            shootLaser(unit, enemy);
                        }
                    }
                }
            }
        }
    });

    return visibleEnemies;
}

function getPreferredTarget(unit, visibleEnemies) {
    const canvas = document.getElementById('battleCanvas');
    let preferredTarget = null;
    
    const potentialTargets = visibleEnemies.filter(enemy => {
        if (unit.owner === 'player') {
            if (unit.id.includes("air_scout") && (enemy.id.includes("air") || enemy.id.includes("sea"))) {
                return true;
            } else if (unit.id.includes("air_marauder") && (enemy.id.includes("land") || enemy.id.includes("sea"))) {
                return true;
            } else if (unit.id.includes("land_landStalker") && (enemy.id.includes("air") || enemy.id.includes("land"))) {
                return true;
            } else if (unit.id.includes("sea_navalStrafer") && (enemy.id.includes("sea") || enemy.id.includes("land"))) {
                return true;
            }
        } else if (unit.owner === 'enemy') {
            if (unit.id.includes("sea") && (enemy.id.includes("sea") || enemy.id.includes("land"))) {
                return true;
            } else if (unit.id.includes("air") && (enemy.id.includes("air") || enemy.id.includes("land"))) {
                return true;
            } else if (unit.id.includes("land") && (enemy.id.includes("air") || enemy.id.includes("sea"))) {
                return true;
            }
        }
        
        return false;
    });

    if (potentialTargets.length === 0) {
        if (visibleEnemies.length > 0) {
            return visibleEnemies[Math.floor(Math.random() * visibleEnemies.length)];
        } else {
            return {
                x: Math.floor(Math.random() * (canvas.offsetWidth - 20)) + 10,
                y: Math.floor(Math.random() * (canvas.offsetHeight - 20)) + 10,
                id: 'hunt'
            };
        }
    }

    const stealthyTargets = potentialTargets.filter(target => {
        return !getVisibleEnemies(target).includes(unit);
    });

    if (stealthyTargets.length > 0) {
        preferredTarget = stealthyTargets.reduce((prev, curr) => (prev.health < curr.health ? prev : curr));
    } else {
        preferredTarget = potentialTargets.reduce((prev, curr) => (prev.health < curr.health ? prev : curr));
    }

    return preferredTarget ? preferredTarget : 'hunt';
}

export function calculateMovementVectorToTarget(unit, objective) {
    if (!objective) return [0, 0];
    const battleUnits = getBattleUnits();
    const owner = unit.owner;

    if (objective && objective.id === 'hunt') {     
        const dx = unit.huntX - unit.x;
        const dy = unit.huntY - unit.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        if (distance > 20) {
            const scale = 100 / distance;
            const movementVector = [dx * scale, dy * scale];
    
            unit.movementVector = movementVector;
            unit.rotation = Math.atan2(dy, dx);
    
            const updatedUnits = battleUnits[owner].map(u => 
                u.id === unit.id ? { ...u, movementVector, rotation: unit.rotation } : u
            ); 
    
            setBattleUnits(owner, updatedUnits);
    
            return movementVector;
        } else {
            const updatedUnits = battleUnits[owner].map(u => {
                if (u.id === unit.id) {
                    const updatedUnit = { ...u, huntX: null, huntY: null, currentGoal: null };
                    return updatedUnit;
                }
                return u;
            });
            
            setBattleUnits(owner, updatedUnits);

            return unit.movementVector;
        }
    } else if (objective === null && !getInFormation()) {
        if (unit.owner === 'player') {
            return [100,0];
        } else {
            return [-100,0];        
        }
    }

    const dx = objective.x - unit.x;
    const dy = objective.y - unit.y; 

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 8) { //when unit reaches target
        turnAround(unit);
        return unit.movementVector;
    }

    const currentSpeed = unit.currentSpeed;
    const movementFactor = Math.min(distance / currentSpeed, 1);

    const movementVector = [
        (dx / distance) * movementFactor * 100,
        (dy / distance) * movementFactor * 100
    ];

    return movementVector;
}

export function turnAround(unit) {
    const battleUnits = getBattleUnits();

    if (unit.rotation + Math.PI <= 2 * Math.PI) {
        unit.rotation += Math.PI;
    } else {
        unit.rotation -= Math.PI;
    }
    unit.currentSpeed = -unit.currentSpeed;

    const updatedUnits = battleUnits[unit.owner].map(u => u.id === unit.id ? { ...u, currentSpeed: unit.currentSpeed } : u);
    setBattleUnits(unit.owner, updatedUnits);
}

export async function settleSystemAfterBattle(accessPoint) {
    setAchievementFlagArray('settleSystem', 'add');    
    const isFactoryStar = getFactoryStarsArray().includes(getDestinationStar());
    let apModifier = accessPoint === 'battle' || accessPoint === 'surrender' ? 2 : 1;
    
    if (accessPoint !== 'battle') {
        setBattleResolved(true, 'player');
    }

    if (isFactoryStar) {
        apModifier *= 2;
        setMegaStructuresInPossessionArray(getStarSystemDataObject('stars', [getDestinationStar(), 'factoryStar']));
    }

    const baseApGain = Math.floor(getStarSystemDataObject('stars', ['destinationStar', 'ascendencyPoints']) * apModifier);
    const apGain = getAscendencyPointsWithRepeatableBonus(baseApGain);
    
    if (!getApAwardedThisRun()) {   
        setResourceDataObject(Math.floor(apGain + getResourceDataObject('ascendencyPoints', ['quantity'])), 'ascendencyPoints', ['quantity']);
        setApAwardedThisRun(true);
    }

    if (getStatRun() < 2) {
        callPopupModal(
            modalPlayerLeaderIntroHeaderText,
            getPlayerPhilosophy() === 'constructor' ? modalPlayerLeaderIntroContentText1 :
            getPlayerPhilosophy() === 'supremacist' ? modalPlayerLeaderIntroContentText2 :
            getPlayerPhilosophy() === 'voidborn' ? modalPlayerLeaderIntroContentText3 :
            modalPlayerLeaderIntroContentText4,
            true,
            false,
            false,
            false,
            function() { showHideModal() },
            null,
            null,
            null,
            'IT SHALL BE DONE',
            null,
            null,
            null,
            false
    );
    }

    switch(accessPoint) {
        case 'noSentientLife':
            await showBattlePopup('noSentientLife', apGain);
            break;
        case 'battle':
            if (getPlayerPhilosophy() === 'expansionist' && getPhilosophyAbilityActive()) {
                setAdditionalSystemsToSettleThisRun(decideIfMoreSystemsAreAutomaticallySettled());
            }

            if (isFactoryStar) {
                await showBattlePopup('megastructure', apGain);
            } else {
                await showBattlePopup(true, apGain);
            }
            break;
    }

    if (getStarsWithAncientManuscripts().some(star => star[0] === getDestinationStar())) {
        let factoryStarToReport = null;

        for (let i = 0; i < 4; i++) {
            const manuscriptData = getStarsWithAncientManuscripts()[i];
            if (manuscriptData && manuscriptData[3] === false) { //finds first false manuscript slot to activate that factory star
                factoryStarToReport = getStarsWithAncientManuscripts()[i][1];
                activateFactoryStar(getStarsWithAncientManuscripts()[i]);
                break;
            }
        }

        const header = 'ANCIENT MANUSCRIPT!';
        const content = `Exploring a habitable Planet in the ${capitaliseWordsWithRomanNumerals(getDestinationStar())} System after your victory, you discover<br>an Ancient Manuscript!  It seems to point out about strange activities<br>in a previously undiscovered System, the <span class="factory-star-text">${capitaliseWordsWithRomanNumerals(factoryStarToReport)}</span> System! Its location has also<br>been revealed to us!`;

        callPopupModal(
            header, 
            content, 
            true, 
            false, 
            false, 
            false, 
            function() {
                showHideModal();
            },
            null, 
            null, 
            null,
            'CONFIRM',
            null,
            null,
            null,
            false
        );
    }    

    autoSelectOption('fleetHangarOption', apGain);
}

function decideIfMoreSystemsAreAutomaticallySettled() {
    const extraPossibleSystemsAllowed = Math.floor(Math.random() * 4);
    if (extraPossibleSystemsAllowed === 0) return [];

    const { stars, starDistanceData } = getStarDataAndDistancesToAllStarsFromSettledStar(getDestinationStar());

    const currentStar = getCurrentStarSystem().toLowerCase();
    const destinationStar = getDestinationStar().toLowerCase();
    const settledStars = getSettledStars();
    const playerFleetPower = getResourceDataObject('fleets', ['attackPower']);

    const filteredStars = stars
        .filter(star => {
            const starNameLower = star.name.toLowerCase();
            if (starNameLower === destinationStar || starNameLower === currentStar) {
                return false;
            }

            return !settledStars.some(settled => capitaliseWordsWithRomanNumerals(settled) === star.name);
        })
        .map(star => ({
            ...star,
            distanceFromSettledStar: starDistanceData[star.name]
        }));

    const starsWithinTenLightYears = filteredStars.filter(star => star.distanceFromSettledStar <= 10);

    function calculateSettleProbability(distance, fleetPower) {
        const fleetRatio = Math.min(fleetPower / 275, 1);
        const fleetScore = fleetRatio * 50;

        let distanceScore = 0;
        if (distance < 1) {
            distanceScore = 50;
        } else if (distance >= 10) {
            distanceScore = 0;
        } else {
            const distanceRatio = 1 - ((distance - 1) / 9);
            distanceScore = distanceRatio * 50;
        }

        return fleetScore + distanceScore;
    }

    function selectRandomCandidateSystemsFromFilteredStars(array, count) {
        const copy = [...array];
        const result = [];
        while (result.length < count && copy.length > 0) {
            const index = Math.floor(Math.random() * copy.length);
            result.push(copy.splice(index, 1)[0]);
        }
        return result;
    }

    const candidateStars = selectRandomCandidateSystemsFromFilteredStars(starsWithinTenLightYears, extraPossibleSystemsAllowed);
    const probabilities = candidateStars.map(star =>
        calculateSettleProbability(star.distanceFromSettledStar, playerFleetPower)
    );

    const additionallySettledSystems = [];
    candidateStars.forEach((star, index) => {
        const chance = probabilities[index];
        const roll = Math.random() * 100;
        if (roll <= chance) {
            additionallySettledSystems.push([star.name, star.distanceFromSettledStar]);
        }
    });

    return additionallySettledSystems;
}

export function addPermanentBuffsBackInAfterRebirth() {
    if (getBuffSmartAutoBuyersData()['boughtYet'] > 0) {
        for (let i = 0; i < getBuffSmartAutoBuyersData()['boughtYet']; i++) {
            buffSmartAutoBuyersRateMultiplier();
        }
    }

    if (getBuffOptimizedPowerGridsData()['boughtYet'] > 0) {
        for (let i = 0; i < getBuffOptimizedPowerGridsData()['boughtYet']; i++) {
            buffOptimizedPowerGridsMultiplier();
        }
    }

    if (getBuffJumpstartResearchData()['boughtYet'] > 0) {
        const resourceData = getResourceDataObject('techs');

        for (const itemKey in resourceData) {
            if (resourceData[itemKey].price <= 4200) {
                setTechUnlockedArray(itemKey);
            }
        }
    }

    if (getBuffCompoundAutomationData()['boughtYet'] > 0) {
        setTechUnlockedArray('compoundMachining');
    }
}

export function rebirth() {
    setAchievementFlagArray('rebirth', 'add');
    autoSelectOption('galacticMarketOption');
    document.getElementById('tabsContainer').children[0]?.click();
    autoSelectOption('hydrogenOption');
    setCurrentStarSystem(getStarSystemDataObject('stars', ['destinationStar', 'name']));
    setSettledStars(getCurrentStarSystem());

    if (getPlayerPhilosophy() === 'expansionist' && getPhilosophyAbilityActive()) {
        const extraSystems = getAdditionalSystemsToSettleThisRun();
        if (Array.isArray(extraSystems) && extraSystems.length > 0) {
            extraSystems.forEach(([name]) => {
                setSettledStars(name.toLowerCase());
            });
        }
    }

    setupNewRunStarSystem();
    setRebirthPossible(false);
    resetAllVariablesOnRebirth();
    resetAchievementsOnRebirth();
    autoGrantAchievementsOnRebirth();
    resetResourceDataObjectOnRebirthAndAddApAndPermanentBuffsBack(); //resets resource data, adds permanent buffs, and adds AP back in
    resetTabsOnRebirth();
    resetUIElementsOnRebirth();
    setCurrentRunIsMegaStructureRun(getFactoryStarsArray().includes(getCurrentStarSystem()));
    initialiseDescriptions();
    changeWeather(1000);
    setRunStartTime();

    if (getStatRun() === 2 && getPlayerPhilosophy() !== null) {
        const targetElement = [...document.querySelectorAll('p[class*="tab3"]')].find(
            el => el.innerHTML.includes('Philosophy')
        );
        appendAttentionIndicator(targetElement);
    }
}

function resetUIElementsOnRebirth() {
    if (document.getElementById('indicatorSymbol')) {
        document.getElementById('indicatorSymbol').remove();
    }

    resetTab1ClassesRebirth();
    resetTab2ClassesRebirth();
    resetTab4ClassesRebirth();
    resetTab5ClassesRebirth();
    resetTab6ClassesRebirth();
}

export function buffOptimizedPowerGridsMultiplier() {
    const multiplier = getAscendencyBuffDataObject()['optimizedPowerGrids'].effectCategoryMagnitude;

    const buildings = Object.fromEntries(
        Object.entries(getResourceDataObject('buildings', ['energy', 'upgrades']))
            .filter(([key]) => !key.includes('battery'))
    );

    Object.keys(buildings).forEach(buildingKey => {
        const building = buildings[buildingKey];

        if (building.maxPurchasedRate) {
            setResourceDataObject(building.maxPurchasedRate * multiplier, 'buildings', ['energy', 'upgrades', buildingKey, 'maxPurchasedRate']);
        }

        if (building.purchasedRate) {
            setResourceDataObject(building.purchasedRate * multiplier, 'buildings', ['energy', 'upgrades', buildingKey, 'purchasedRate']);
        }

        if (building.rate) {
            const newRateOfBuilding = building.rate * multiplier;
            setResourceDataObject(newRateOfBuilding, 'buildings', ['energy', 'upgrades', buildingKey, 'rate']);
        }
    });
}

export function buffSmartAutoBuyersRateMultiplier() {
    const multiplier = getAscendencyBuffDataObject()['smartAutoBuyers'].effectCategoryMagnitude;

    const resources = getResourceDataObject('resources');
    const compounds = getResourceDataObject('compounds');

    function processRates(data, key) {
        Object.keys(data).forEach(itemKey => {
            const item = data[itemKey];

            if (item.upgrades && item.upgrades.autoBuyer) {
                const tiers = item.upgrades.autoBuyer;

                Object.keys(tiers).forEach(tierKey => {
                    if (tierKey.startsWith('tier')) {
                        const oldRate = tiers[tierKey].rate;
                        const newRate = oldRate * multiplier;

                        setResourceDataObject(newRate, key, [itemKey, 'upgrades', 'autoBuyer', tierKey, 'rate']);
                    }
                });
            }
        });
    }

    processRates(resources, 'resources');
    processRates(compounds, 'compounds');
}

export function setAutoSellToggleState(item, type) {
    if (!getTechUnlockedArray().includes('nanoBrokers')) {
        return;
    }

    const sellRow = document.getElementById(`${item}SellRow`);
    const autoSellValue = getResourceDataObject(type, [item, 'autoSell']);
    const targetElement = sellRow.querySelector(`#autoSellToggle[data-type="${type}"]`);

    if (targetElement) {
        const allWithSameId = document.querySelectorAll('#autoSellToggle');
        allWithSameId.forEach(el => {
            if (el !== targetElement) {
                el.remove();
            }
        });

        targetElement.checked = autoSellValue;
    }
}

export function setAutoCreateToggleState(item) {
    if (!getTechUnlockedArray().includes('compoundMachining')) {
        return;
    }

    const createRow = document.getElementById(`${item}CreateRow`);
    const autoCreateValue = getResourceDataObject('compounds', [item, 'autoCreate']);
    const targetElement = createRow.querySelector(`#autoCreateToggle`);

    if (targetElement) {
        const allWithSameId = document.querySelectorAll('#autoCreateToggle');
        allWithSameId.forEach(el => {
            if (el !== targetElement) {
                el.remove();
            }
        });

        targetElement.checked = autoCreateValue;
    }
}

export const addStorageCapacityAndCompoundsToAllResources = (addValue) => {
    let resObj = getResourceDataObject('resources');

    for (const key in resObj) {
        if (key === 'solar') continue;

        const storagePath = [key, 'storageCapacity'];
        const currentCapacity = getResourceDataObject('resources', storagePath);
        const newCapacity = currentCapacity + addValue;
        setResourceDataObject(newCapacity, 'resources', storagePath);
    }

    resObj = getResourceDataObject('compounds');

    for (const key in resObj) {
        const storagePath = [key, 'storageCapacity'];
        const currentCapacity = getResourceDataObject('compounds', storagePath);
        const newCapacity = currentCapacity + addValue;
        setResourceDataObject(newCapacity, 'compounds', storagePath);
    }
};

export const applyRateMultiplierToAllResources = (multiplier) => {
    const resObj = getResourceDataObject('resources');

    for (const key in resObj) {
        if (key === 'solar') continue;

        for (let i = 1; i <= 4; i++) {
            const tierKey = `tier${i}`;
            const path = [key, 'upgrades', 'autoBuyer', tierKey, 'rate'];
            const rate = getResourceDataObject('resources', path);

            if (typeof rate === 'number') {
                const newRate = rate * multiplier;
                setResourceDataObject(newRate, 'resources', path);
            }
        }
    }
};

export function applyMegaStructureBonuses(megastructure, tech) {
    switch (megastructure) {
        case 1:
            switch (tech) {
                case 1:
                    setMegaStructureTechsResearched([1,1]);
                    const batteries = ['battery1', 'battery2', 'battery3'];

                    batteries.forEach(battery => {
                        const currentCapacity = getResourceDataObject('buildings', ['energy', 'upgrades', battery, 'capacity']);
                        const newCapacity = Math.floor(currentCapacity * 2);
                        setResourceDataObject(newCapacity, 'buildings', ['energy', 'upgrades', battery, 'capacity']);
                    });
                    setResourceDataObject(Math.floor(getResourceDataObject('buildings', ['energy', 'storageCapacity']) * 2), 'buildings', ['energy', 'storageCapacity']);
                    return;
                case 2:
                    setMegaStructureTechsResearched([1,2]);
                    const multiplier = 1.25;
                    const powerPlants = ['powerPlant1', 'powerPlant2', 'powerPlant3'];

                    powerPlants.forEach(powerPlantName => {
                        const powerPlantObject = getResourceDataObject('buildings', ['energy', 'upgrades', powerPlantName]);

                        setResourceDataObject(powerPlantObject.maxPurchasedRate * multiplier, 'buildings', ['energy', 'upgrades', powerPlantName, 'maxPurchasedRate']);
                        setResourceDataObject(powerPlantObject.purchasedRate * multiplier, 'buildings', ['energy', 'upgrades', powerPlantName, 'purchasedRate']);

                        const newRateOfBuilding = powerPlantObject.rate * multiplier;
                        setResourceDataObject(newRateOfBuilding, 'buildings', ['energy', 'upgrades', powerPlantName, 'rate']);
                    });
                    return;
                case 3:
                    setMegaStructureAntimatterAmount(0.15);
                    setPermanentAntimatterUnlock(true);
                    setMiaplacidusMilestoneLevel(getMiaplacidusMilestoneLevel() + 1);
                    setMegaStructureTechsResearched([1,3]);
                    return;
                case 4:
                    setInfinitePower(true);
                    setMegaStructureTechsResearched([1,4]);
                    setPowerOnOff(true);
                    return;
                case 5:
                    setInfinitePower(true);
                    setMegaStructureTechsResearched([1,5]);
                    setPowerOnOff(true);
                    return;
            }
            break;
        case 2:
            switch (tech) {
                case 1:
                    setMegaStructureTechsResearched([2,1]);
                    return;
                case 2:
                    setMegaStructureTechsResearched([2,2]);
                    return;
                case 3:
                    setMegaStructureAntimatterAmount(0.15);
                    setPermanentAntimatterUnlock(true);
                    setMiaplacidusMilestoneLevel(getMiaplacidusMilestoneLevel() + 1);
                    setMegaStructureTechsResearched([2,3]);
                    return;
                case 4:
                    setMegaStructureTechsResearched([2,4]);
                    return;
                case 5:
                    setMegaStructureTechsResearched([2,5]);
                    return;
            }
            break;
        case 3:
            switch (tech) {
                case 1:
                    applyRateMultiplierToAllResources(1.25);
                    setMegaStructureTechsResearched([3, 1]);
                    return;
                case 2:
                    applyRateMultiplierToAllResources(1.5);
                    setMegaStructureTechsResearched([3, 2]);
                    return;
                case 3:
                    setMegaStructureAntimatterAmount(0.15);
                    setPermanentAntimatterUnlock(true);
                    setMiaplacidusMilestoneLevel(getMiaplacidusMilestoneLevel() + 1);
                    setMegaStructureTechsResearched([3, 3]);
                    return;
                case 4:
                    applyRateMultiplierToAllResources(1.75);
                    setMegaStructureTechsResearched([3, 4]);
                    return;
                case 5:
                    applyRateMultiplierToAllResources(2);
                    setMegaStructureResourceBonus(true);
                    setMegaStructureTechsResearched([3, 5]);
                    return;
            }
        case 4:
            switch (tech) {
                case 1:
                    addStorageCapacityAndCompoundsToAllResources(100000);
                    setMegaStructureTechsResearched([4,1]);
                    return;
                case 2:
                    addStorageCapacityAndCompoundsToAllResources(1000000);
                    setMegaStructureTechsResearched([4,2]);
                    return;
                case 3:
                    setMegaStructureAntimatterAmount(0.15);
                    setPermanentAntimatterUnlock(true);
                    setMiaplacidusMilestoneLevel(getMiaplacidusMilestoneLevel() + 1);
                    setMegaStructureTechsResearched([4,3]);
                    return;
                case 4:
                    addStorageCapacityAndCompoundsToAllResources(1000000000);
                    setMegaStructureTechsResearched([4,4]);
                    return;
                case 5:
                    addStorageCapacityAndCompoundsToAllResources(10000000000);
                    setStorageAdderBonus(true);
                    setMegaStructureTechsResearched([4,5]);
                    return;
            }
            break;
    }
}

//===============================================================================================================

export function setGameState(newState) {
    setGameStateVariable(newState);

    switch (newState) {
        case getGameVisibleActive():
            getElements().statsContainer.classList.remove('d-none');
            getElements().statsContainer.classList.add('d-flex');
            getElements().tabsContainer.classList.remove('d-none');
            getElements().tabsContainer.classList.add('d-flex');
            getElements().mainContainer.classList.remove('d-none');
            getElements().mainContainer.classList.add('d-flex');

            manageTabSpecificUi();
            break;
    }
}
