import {
    getInfinitePowerRate,
    getStatRun,
    getAdditionalSystemsToSettleThisRun,
    getPlayerStartingUnitHealth,
    setPlayerPhilosophy,
    getPlayerPhilosophy,
    setFeedbackContent,
    setSaveData,
    getNotificationQueues,
    setNotificationQueues,
    getNotificationStatus,
    setNotificationStatus,
    getNotificationContainers,
    setNotificationContainers,
    getClassificationOrder,
    setClassificationOrder,
    setEnemyFleetsAdjustedForDiplomacy,
    getEnemyFleetsAdjustedForDiplomacy,
    getFleetConstantData,
    setInFormation,
    getFormationGoal,
    setFormationGoal,
    getBattleTriggeredByPlayer,
    replaceBattleUnits,
    setBattleOngoing,
    setBattleUnits,
    getBattleUnits,
    setDiplomacyPossible,
    setAlreadySeenNewsTickerArray,
    getAlreadySeenNewsTickerArray,
    getStarShipStatus,
    getStarShipArrowPosition,
    getFromStarObject,
    setFromStarObject,
    getToStarObject,
    setToStarObject,
    getStarShipTravelling,
    setDestinationStar,
    getDestinationStar,
    getStarShipBuilt,
    setSortStarMethod,
    getStarVisionDistance,
    STAR_SEED,
    setRocketUserName,
    setCurrentDestinationDropdownText,
    getBoostRate,
    setHasAntimatterSvgRightBoxDataChanged,
    getHasAntimatterSvgRightBoxDataChanged,
    getNormalMaxAntimatterRate,
    getMiningObject,
    getImageUrls,
    getUnlockedResourcesArray,
    setUnlockedCompoundsArray,
    setUnlockedResourcesArray,
    setTechUnlockedArray,
    getNewsTickerScrollDuration,
    getNewsTickerManuscriptClueChance,
    getOneOffPrizesAlreadyClaimedArray,
    setOneOffPrizesAlreadyClaimedArray,
    deferredActions,
    getUpcomingTechArray,
    setLastSavedTimeStamp,
    setCurrentTheme,
    READY_TO_SORT,
    NOW,
    setTechRenderCounter,
    setTechRenderChange,
    getRevealedTechArray,
    setRevealedTechArray,
    getDebugVisibilityArray,
    getTechUnlockedArray,
    getLastScreenOpenRegister,
    setLastScreenOpenRegister,
    setCurrentOptionPane,
    getNotificationsToggle,
    setCurrentTab,
    getCurrentTab,
    setElements,
    getElements,
    getGameVisibleActive,
    getCurrentOptionPane,
    setSaveName,
    getSaveName,
    setOnboardingMode,
    getSaveData,
    getTimerRateRatio,
    getBuildingTypeOnOff,
    getNewsTickerSetting,
    getPowerOnOff,
    getRocketsFuellerStartedArray,
    getRocketsBuilt,
    getLaunchedRockets,
    getDestinationAsteroid,
    getCurrentlyTravellingToAsteroid,
    getRocketDirection,
    getCurrentStarSystemWeatherEfficiency,
    getCurrentPrecipitationRate,
    getCurrentStarSystem,
    setSortAsteroidMethod,
    getAsteroidArray,
    getMegaStructureTechsResearched,
    getCurrentRunIsMegaStructureRun,
    getIsAntimatterBoostActive,
    setRocketsBuilt,
    setAntimatterUnlocked,
    setCanFuelRockets,
    setCanTravelToAsteroids,
    getRocketUserName,
    setCurrentStarObject,
    setWarMode,
    getWarMode,
    getNeedNewBattleCanvas,
    setNeedNewBattleCanvas,
    getSettledStars,
    MAX_STACKS,
    STACK_WIDTH,
    BASE_RIGHT,
    setAchievementFlagArray,
    getThemesTriedArray,
    setThemesTriedArray,
    setActivatedWackyNewsEffectsArray,
    setFirstAccessArray,
    getFirstAccessArray,
    getFeedbackCanBeRequested,
    setFeedbackCanBeRequested,
    getRepeatableTechMultipliers,
    STAR_FIELD_SEED,
    NUMBER_OF_STARS,
    getStarMapMode,
    getPhilosophyAbilityActive,
    getStarsWithAncientManuscripts,
    getManuscriptCluesShown,
    getFactoryStarsArray,
    markManuscriptClueShown,
    getMiaplacidusMilestoneLevel,
    getHomeStarName,
    getInfinitePower,
    getRunStartTime,
    setRunStartTime,
    getGameStartTime,
    getCurrentlySearchingAsteroid,
    getCurrentlyInvestigatingStar,
    getCurrentlyPillagingVoid,
    getTimeLeftUntilAsteroidScannerTimerFinishes,
    getTimeLeftUntilStarInvestigationTimerFinishes,
    getTimeLeftUntilPillageVoidTimerFinishes,
    getTotalEnergyUse,
    getCurrencySymbol,
    getGalacticMarketOutgoingStockType,
    getGalacticMarketIncomingStockType,
    getMouseParticleTrailEnabled,
    getCustomPointerEnabled,
    getCurrentTheme,
    getMaxMouseTrailParticles,
    getParticleLifetimeMs,
    getParticlesPerEvent,
    getMouseParticleContainer,
    setMouseParticleContainer,
    getCustomPointerAssetKeys,
    getCustomPointerFallbackTheme,
    getCursorTypeToPointerMap,
    getCustomPointerEnabledClass,
    getCustomPointerHideCursorClass,
    getCustomPointerElement,
    setCustomPointerElement,
    getCustomPointerImageElement,
    setCustomPointerImageElement,
    getPendingCustomPointerType,
    setPendingCustomPointerType,
    getCustomPointerListenersAttached,
    setCustomPointerListenersAttached,
    getSuppressUiClickSfx,
    setSuppressUiClickSfx,
    getRebirthPossible,
    getMegaStructuresInPossessionArray,
    getDebugTimeWarpDurationMs,
    setDebugTimeWarpDurationMs,
    getDebugTimeWarpMultiplier,
    setDebugTimeWarpMultiplier,
    getDebugHoldEnterToGainEnabled,
    setDebugHoldEnterToGainEnabled,
    getTimeWarpMultiplier,
    getBlackHoleAlwaysOn,
    setTimeWarpMultiplier,
    getTimeWarpTimeoutId,
    setTimeWarpTimeoutId,
    getTimeWarpEndTimestampMs,
    
} from './constantsAndGlobalVars.js';
import {
    getResourceDataObject,
    getStarSystemDataObject,
    setAutoBuyerTierLevel,
    setResourceDataObject,
    setStarSystemDataObject,
    getGalacticMarketDataObject,
    getBuffEnhancedMiningData,
    getAchievementImageUrl,
    getBlackHolePower,
    getStarSystemWeather
} from "./resourceDataObject.js";
import {
    optionDescriptions,
    getRocketNames,
    getOptionDescription,
    gameIntroHeader,
    gameIntroText,
    launchStarShipWarningHeader,
    launchStarShipWarningText,
    enterWarModeModalHeader,
    enterwarModeModalBackOutText,
    enterwarModeModalNoBackOutText,
    enterWarModeInsultedText,
    enterWarModeSurrenderText,
    enterWarModeNotVassalizedText,
    enterWarModeScaredText,
    enterWarModeModalLaughAtProspect,
    enterWarModeModalLaughAndEnterWar,
    enterWarModeModalImproveToReceptive,
    enterWarModeModalNeutral,
    enterWarModeModalReserved,
    enterWarModeModalPatience,
    modalBattleHeaderText,
    modalBattleWonText,
    modalBattleLostText,
    modalBattleNoSentientLifeHeader,
    modalBattleNoSentientLifeText,
    modalFeedbackHeaderText,
    modalFeedbackThanksHeaderText,
    modalFeedbackContentTextGood,
    modalFeedbackContentTextBad,
    modalFeedbackContentThanks,
    gameSaveNameCollect,
    initialiseDescriptions,
    rocketNames,
    getHeaderDescriptions,
    getStarNames,
    getAchievementTooltipDescription,
    refreshAchievementTooltipDescriptions,
    modalPlayerLeaderIntroContentText1,
    modalPlayerLeaderIntroContentText2,
    modalPlayerLeaderIntroContentText3,
    modalPlayerLeaderIntroContentText4,
    galacticMarketTooltipDescriptions,
    modalBlackHoleDiscoveredHeader,
    modalBlackHoleDiscoveredText,
    miaplacidusEndgameStoryPopups,
    
} from "./descriptions.js";

import { saveGame, loadGameFromCloud, generateRandomPioneerName, saveGameToCloud } from './saveLoadGame.js';

import { promptOnboardingIfNeeded, setShouldPromptOnboarding } from './onboarding.js';

import {
    setSellFuseCreateTextDescriptionClassesBasedOnButtonStates,
    setGameState,
    startGame,
    offlineGains,
    startNewsTickerTimer,
    getBatteryLevel,
    toggleAllPower,
    boostAntimatterRate,
    discoverAsteroid,
    buildSpaceMiningBuilding,
    extendStarDataRange,
    generateStarDataAndAddToDataObject,
    startTravelToDestinationStarTimer,
    addToResourceAllTimeStat,
    calculateMovementVectorToTarget,
    setEnemyFleetPower,
    rebirth,
    settleSystemAfterBattle,
    setAutoSellToggleState,
    setAutoCreateToggleState,
    calculateStarTravelDurationWithModifiers,
    getAscendencyPointsWithRepeatableBonus,
    formatProductionRateValue,
    timeWarp,
    forceClearWeather
} from './game.js';

import { 
    capitaliseString, 
    capitaliseWordsWithRomanNumerals,
    toCamelCase
} from './utilityFunctions.js';

import { playClickSfx, playSwipeSfx, sfxPlayer } from './audioManager.js';

import { drawTab1Content } from './drawTab1Content.js';
import { drawTab2Content } from './drawTab2Content.js';
import { drawTab3Content } from './drawTab3Content.js';
import { drawTab4Content } from './drawTab4Content.js';
import { drawTab5Content } from './drawTab5Content.js';
import { drawTab6Content } from './drawTab6Content.js';
import { drawTab7Content } from './drawTab7Content.js';
import { drawTab8Content } from './drawTab8Content.js';

let modalTooltipHandlers = {};

const variableDebuggerWindow = document.getElementById('variableDebuggerWindow');
const debugWindow = document.getElementById('debugWindow');
const closeButton = document.querySelector('.close-btn');

let hoveredButtonElement = null;
let holdEnterRapidClickIntervalId = null;

function shouldIgnoreHoldEnterRapidClick(eventTarget) {
    const target = eventTarget ?? document.activeElement;
    if (!target) {
        return false;
    }

    const tag = (target.tagName || '').toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        return true;
    }

    if (target.isContentEditable) {
        return true;
    }

    return false;
}

function updateHoldEnterToGainDebugStatus() {
    const button = document.getElementById('holdEnterToGainDebugButton');
    if (!button) {
        return;
    }

    const enabled = getDebugHoldEnterToGainEnabled();
    button.textContent = enabled ? 'Enabled' : 'Disabled';
    button.classList.remove('green-ready-text', 'debug-toggle-inactive');
    if (enabled) {
        button.classList.add('green-ready-text');
    } else {
        button.classList.add('debug-toggle-inactive');
    }
}

function stopHoldEnterRapidClick() {
    if (holdEnterRapidClickIntervalId) {
        clearInterval(holdEnterRapidClickIntervalId);
        holdEnterRapidClickIntervalId = null;
    }
}

function startHoldEnterRapidClick() {
    if (holdEnterRapidClickIntervalId) {
        return;
    }

    const intervalMs = 35;
    holdEnterRapidClickIntervalId = setInterval(() => {
        if (!getDebugHoldEnterToGainEnabled()) {
            stopHoldEnterRapidClick();
            return;
        }

        const btn = hoveredButtonElement;
        if (!btn || btn.disabled) {
            return;
        }

        if (!document.body.contains(btn)) {
            hoveredButtonElement = null;
            return;
        }

        btn.click();
    }, intervalMs);
}

document.addEventListener('mouseover', (event) => {
    const target = event.target;
    if (!target) {
        return;
    }

    const button = target.closest?.('button');
    if (button) {
        hoveredButtonElement = button;
    }
}, true);

document.addEventListener('mouseout', (event) => {
    const target = event.target;
    if (!target) {
        return;
    }

    const button = target.closest?.('button');
    if (button && hoveredButtonElement === button) {
        hoveredButtonElement = null;
    }
}, true);

document.addEventListener('keydown', (event) => {
    if (event.code !== 'Enter') {
        return;
    }

    if (!getDebugHoldEnterToGainEnabled()) {
        return;
    }

    if (event.repeat) {
        return;
    }

    if (shouldIgnoreHoldEnterRapidClick(event.target)) {
        return;
    }

    if (!hoveredButtonElement) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    startHoldEnterRapidClick();
});

document.addEventListener('keyup', (event) => {
    if (event.code === 'Enter') {
        if (holdEnterRapidClickIntervalId) {
            event.preventDefault();
            event.stopPropagation();
        }
        stopHoldEnterRapidClick();
    }
});

function shouldUseCustomPointer() {
    return !!getCustomPointerEnabled();
}

function adjustGalacticSidebarWidths() {
    const entries = [
        ['galacticMarketOption2', 'galacticMarketOption3'],
        ['ascendencyOption2', 'ascendencyOption3'],
        ['megastructuresOption2', 'megastructuresOption3']
    ];

    entries.forEach(([expandId, collapseId]) => {
        const expandContainer = document.getElementById(expandId)?.closest('.row-side-menu-item');
        const collapseContainer = document.getElementById(collapseId)?.closest('.row-side-menu-item');

        if (expandContainer) {
            if (expandId === 'galacticMarketOption2') {
                expandContainer.style.flex = '1 1 auto';
                expandContainer.style.maxWidth = '85%';
                expandContainer.style.width = '85%';
                expandContainer.style.textAlign = 'center';
            } else {
                expandContainer.style.flex = '1 1 auto';
                expandContainer.style.maxWidth = '85%';
                expandContainer.style.width = '85%';
            }
        }

        if (collapseContainer) {
            collapseContainer.style.flex = '0 0 0';
            collapseContainer.style.maxWidth = '0';
            collapseContainer.style.width = '0';
            collapseContainer.style.padding = '0';
            collapseContainer.style.margin = '0';
            collapseContainer.style.overflow = 'hidden';
        }
    });
}

function getOrCreateStatTooltip() {
    let tooltip = document.getElementById('stat-tooltip');
    if (!tooltip) {
        setupStatTooltips();
        tooltip = document.getElementById('stat-tooltip');
    }
    return tooltip;
}

function attachSharedTooltip(element, getContent) {
    if (!element || element.dataset.sharedTooltipAttached) {
        return;
    }

    element.dataset.sharedTooltipAttached = 'true';

    const showOrMove = (event) => {
        const tooltip = getOrCreateStatTooltip();
        if (!tooltip) {
            return;
        }

        const content = getContent?.();
        if (!content) {
            tooltip.style.display = 'none';
            return;
        }

        tooltip.innerHTML = content;
        tooltip.style.display = 'block';

        const pointerOffset = 12;
        const scrollX = window.scrollX ?? document.documentElement.scrollLeft ?? 0;
        const scrollY = window.scrollY ?? document.documentElement.scrollTop ?? 0;

        let left = event.pageX + pointerOffset;
        let top = event.pageY + pointerOffset;

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;

        const tooltipWidth = tooltip.offsetWidth;
        const tooltipHeight = tooltip.offsetHeight;
        const viewportRight = scrollX + window.innerWidth;
        const viewportBottom = scrollY + window.innerHeight;

        if (left + tooltipWidth > viewportRight) {
            left = Math.max(scrollX + 8, event.pageX - tooltipWidth - pointerOffset);
        }

        if (top + tooltipHeight > viewportBottom) {
            top = Math.max(scrollY + 8, event.pageY - tooltipHeight - pointerOffset);
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    };

    const hide = () => {
        const tooltip = getOrCreateStatTooltip();
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    };

    element.addEventListener('mouseenter', showOrMove);
    element.addEventListener('mousemove', showOrMove);
    element.addEventListener('mouseleave', hide);
}

function hasMegaStructureTech(techList, structureId, techIndex) {
    return Array.isArray(techList) && techList.some(entry => Array.isArray(entry) && entry[0] === structureId && entry[1] === techIndex);
}

function buildForceFieldTooltipContent() {
    const techsResearched = getMegaStructureTechsResearched?.() || [];
    let disconnectCount = 0;

    for (let structureId = 1; structureId <= 4; structureId++) {
        if (hasMegaStructureTech(techsResearched, structureId, 3)) {
            disconnectCount += 1;
        }
    }

    let strengthText = '100%';
    let strengthClass = 'red-disabled-text';

    if (disconnectCount >= 4) {
        strengthText = 'DOWN!';
        strengthClass = 'green-ready-text';
    } else if (disconnectCount === 3) {
        strengthText = '25%';
        strengthClass = '';
    } else if (disconnectCount === 2) {
        strengthText = '50%';
        strengthClass = 'warning-orange-text';
    } else if (disconnectCount === 1) {
        strengthText = '75%';
        strengthClass = 'warning-orange-text';
    }

    const strengthHtml = strengthClass
        ? `<span class="${strengthClass}">${strengthText}</span>`
        : `<span>${strengthText}</span>`;

    const followUp = disconnectCount >= 4
        ? `<div class="green-ready-text">You can now move to Miaplacidus!</div>`
        : '<div>Keep searching and conquering Ancient Megastructures to weaken the Miaplacidus Force Field</div>';

    return [
        `<div>Force Field Strength: ${strengthHtml}</div>`,
        '<div class="tooltip-spacer">&nbsp;</div>',
        followUp
    ].join('');
}

function buildLaunchPadSidebarStatus() {
    const statusElement = document.getElementById('launchPadOption2');
    const optionRow = statusElement?.closest('.row-side-menu');
    if (!statusElement || optionRow?.classList.contains('invisible')) {
        return { text: '', className: '' };
    }

    const launchPadData = getResourceDataObject('space', ['upgrades', 'launchPad']);
    const built = launchPadData?.launchPadBoughtYet;

    if (built) {
        return { text: 'Built', className: 'green-ready-text' };
    }

    return { text: 'Not Built', className: 'red-disabled-text' };
}

function attachEnergyTooltipMirrors() {
    const tooltip = document.getElementById('stat-tooltip');
    if (!tooltip) {
        return;
    }

    const stat2Element = document.getElementById('stat2');
    const getTooltipContent = () => {
        const referenceText = stat2Element?.textContent.trim() || '';
        return buildEnergyTooltipContent(referenceText);
    };

    const energyElements = ['energyRate', 'powerPlant1Rate', 'powerPlant2Rate', 'powerPlant3Rate']
        .map(id => document.getElementById(id))
        .filter(Boolean);

    energyElements.forEach(element => {
        if (element.dataset.energyTooltipAttached) {
            return;
        }

        const showTooltip = event => {
            tooltip.innerHTML = getTooltipContent();
            tooltip.style.display = 'block';
            tooltip.style.left = `${event.pageX + 10}px`;
            tooltip.style.top = `${event.pageY + 10}px`;
        };

        const moveTooltip = event => {
            tooltip.innerHTML = getTooltipContent();
            tooltip.style.left = `${event.pageX + 10}px`;
            tooltip.style.top = `${event.pageY + 10}px`;
        };

        const hideTooltip = () => {
            tooltip.style.display = 'none';
        };

        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mousemove', moveTooltip);
        element.addEventListener('mouseleave', hideTooltip);

        element.dataset.energyTooltipAttached = 'true';
    });
}

function initCustomPointer() {
    if (!document?.body) return;

    let pointerElement = getCustomPointerElement();
    let pointerImageElement = getCustomPointerImageElement();

    if (!pointerElement) {
        pointerElement = document.createElement('div');
        pointerElement.className = 'custom-pointer';

        pointerImageElement = document.createElement('img');
        pointerImageElement.alt = '';
        pointerImageElement.setAttribute('aria-hidden', 'true');
        pointerImageElement.draggable = false;
        pointerElement.appendChild(pointerImageElement);

        document.body.appendChild(pointerElement);

        setCustomPointerElement(pointerElement);
        setCustomPointerImageElement(pointerImageElement);
    } else if (!pointerImageElement) {
        pointerImageElement = document.createElement('img');
        pointerImageElement.alt = '';
        pointerImageElement.setAttribute('aria-hidden', 'true');
        pointerImageElement.draggable = false;
        pointerElement.appendChild(pointerImageElement);
        setCustomPointerImageElement(pointerImageElement);
    }

    attachCustomPointerListeners();
    updateCustomPointerImage();
}

function teardownCustomPointer() {
    detachCustomPointerListeners();
    const pointerElement = getCustomPointerElement();
    if (pointerElement) {
        pointerElement.remove();
    }
    setCustomPointerElement(null);
    setCustomPointerImageElement(null);
    setPendingCustomPointerType('default');
}

function attachCustomPointerListeners() {
    if (getCustomPointerListenersAttached()) return;
    document.addEventListener('pointermove', handleCustomPointerMove, true);
    document.addEventListener('pointerleave', handleCustomPointerLeave, true);
    setCustomPointerListenersAttached(true);
}

function detachCustomPointerListeners() {
    if (!getCustomPointerListenersAttached()) return;
    document.removeEventListener('pointermove', handleCustomPointerMove, true);
    document.removeEventListener('pointerleave', handleCustomPointerLeave, true);
    setCustomPointerListenersAttached(false);
}

const handleCustomPointerMove = (event) => {
    if (event.pointerType && event.pointerType !== 'mouse') {
        getCustomPointerElement()?.classList.remove('visible');
        return;
    }

    const pointerElement = getCustomPointerElement();
    if (!pointerElement || !shouldUseCustomPointer()) {
        return;
    }

    const pointerType = resolvePointerType(event);
    if (pointerType !== getPendingCustomPointerType()) {
        setPendingCustomPointerType(pointerType);
        updateCustomPointerImage();
    }

    const pointerWidth = pointerElement.offsetWidth || 0;
    const pointerHeight = pointerElement.offsetHeight || 0;
    const offsetX = pointerWidth / 3 + 2;
    const offsetY = pointerHeight / 3 - 1;

    pointerElement.style.left = `${event.clientX + offsetX}px`;
    pointerElement.style.top = `${event.clientY + offsetY}px`;
    pointerElement.classList.add('visible');
};

const handleCustomPointerLeave = () => {
    getCustomPointerElement()?.classList.remove('visible');
};

function withCursorProbe(getCursorValue) {
    const body = document.body;
    if (!body) {
        return getCursorValue();
    }

    const cursorHideClass = getCustomPointerHideCursorClass();
    const hadCursorHideClass = body.classList.contains(cursorHideClass);
    if (hadCursorHideClass) {
        body.classList.remove(cursorHideClass);
    }

    try {
        return getCursorValue();
    } finally {
        if (hadCursorHideClass) {
            body.classList.add(cursorHideClass);
        }
    }
}

function resolvePointerType(event) {
    const target = event?.target ?? document.body;
    const cursorValue = withCursorProbe(() => {
        try {
            return window.getComputedStyle(target).cursor || 'auto';
        } catch {
            return 'auto';
        }
    });

    const normalized = cursorValue.split(',')[0].trim();
    if (!normalized || normalized === 'auto' || normalized === 'default' || normalized === 'text' || normalized === 'inherit' || normalized.startsWith('url')) {
        return 'default';
    }

    const cursorMap = getCursorTypeToPointerMap();
    return cursorMap[normalized] ?? 'default';
}

function updateCustomPointerImage() {
    const pointerImageElement = getCustomPointerImageElement();
    if (!pointerImageElement) {
        return;
    }

    const pointerType = getPendingCustomPointerType() || 'default';
    const themeToken = formatThemeToken(getCurrentTheme());
    const assetKey = resolvePointerAssetKey(pointerType, themeToken);
    const assetPath = `./images/mouse/${assetKey}.png`;

    if (pointerImageElement.dataset.assetPath !== assetPath) {
        pointerImageElement.dataset.assetPath = assetPath;
        pointerImageElement.src = assetPath;
    }

    const pointerElement = getCustomPointerElement();
    if (pointerElement?.dataset.pointerType !== pointerType) {
        pointerElement.dataset.pointerType = pointerType;
    }
}

function resolvePointerAssetKey(pointerType, themeToken) {
    const keyForTheme = `${pointerType}${themeToken}`;
    if (getCustomPointerAssetKeys().has(keyForTheme)) {
        return keyForTheme;
    }

    const fallbackThemeToken = formatThemeToken(getCustomPointerFallbackTheme());
    const fallbackKey = `${pointerType}${fallbackThemeToken}`;
    if (getCustomPointerAssetKeys().has(fallbackKey)) {
        return fallbackKey;
    }

    return `default${fallbackThemeToken}`;
}

function formatThemeToken(theme) {
    if (typeof theme !== 'string' || !theme.length) {
        return formatThemeToken(getCustomPointerFallbackTheme());
    }
    return theme.charAt(0).toUpperCase() + theme.slice(1);
}

export function applyCustomPointerSetting() {
    if (!document?.body) return;
    const enabled = shouldUseCustomPointer();
    document.body.classList.toggle(getCustomPointerEnabledClass(), enabled);
    document.body.classList.toggle(getCustomPointerHideCursorClass(), enabled);

    if (enabled) {
        initCustomPointer();
    } else {
        teardownCustomPointer();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    setElements();
    setupStatTooltips();
    attachEnergyTooltipMirrors();
    setupProductionRateTooltips();
    setupMouseParticleTrail();
    adjustGalacticSidebarWidths();
    applyCustomPointerSetting();

    setGameState(getGameVisibleActive());

    generateRandomPioneerName();

    if (localStorage.getItem('saveName')) {
        setSaveName(localStorage.getItem('saveName'));
    }

function setupMouseParticleTrail() {
    if (getMouseParticleContainer() || !document.body) {
        return;
    }

    const container = document.createElement('div');
    container.className = 'mouse-particle-container';
    document.body.appendChild(container);
    setMouseParticleContainer(container);

    document.addEventListener('pointermove', handleMouseParticleMove);
}

function handleMouseParticleMove(event) {
    const container = getMouseParticleContainer();
    if (!getMouseParticleTrailEnabled() || !container) {
        return;
    }

    const particlesPerEvent = getParticlesPerEvent();
    for (let i = 0; i < particlesPerEvent; i++) {
        spawnMouseParticle(event.clientX, event.clientY, container);
    }
}

function spawnMouseParticle(x, y, container) {
    const particle = document.createElement('div');
    particle.className = 'mouse-particle';

    const size = 2 + Math.random() * 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    const angle = Math.random() * Math.PI * 2;
    const distance = 10 + Math.random() * 25;
    particle.style.setProperty('--particle-move-x', `${Math.cos(angle) * distance}px`);
    particle.style.setProperty('--particle-move-y', `${Math.sin(angle) * distance}px`);

    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    container.appendChild(particle);

    const maxParticles = getMaxMouseTrailParticles();
    while (container.childElementCount > maxParticles) {
        container.firstElementChild?.remove();
    }

    const particleLifetime = getParticleLifetimeMs();
    setTimeout(() => {
        particle.remove();
    }, particleLifetime);
}
function setupStatTooltips() {
    if (document.getElementById('stat-tooltip')) {
        return;
    }

    const tooltip = document.createElement('div');
    tooltip.id = 'stat-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.padding = '6px 10px';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.background = 'var(--container-bg-color)';
    tooltip.style.color = 'var(--text-color)';
    tooltip.style.border = '1px solid var(--border-color, #555)';
    tooltip.style.borderRadius = 'var(--border-radius, 4px)';
    tooltip.style.fontSize = '12px';
    tooltip.style.zIndex = '100000';
    tooltip.style.display = 'none';
    tooltip.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    tooltip.style.maxWidth = '380px';
    tooltip.style.maxHeight = '80vh';
    tooltip.style.overflowY = 'auto';
    tooltip.style.wordWrap = 'break-word';
    tooltip.style.whiteSpace = 'normal';
    document.body.appendChild(tooltip);

    const statIds = ['cashStat', 'stat2', 'stat3', 'stat4', 'stat5', 'stat6', 'stat7', 'stat8'];
    const statTargets = statIds
        .map(id => {
            const valueElement = document.getElementById(id);
            const statCell = valueElement?.closest('.stat-cell');
            return valueElement && statCell ? { valueElement, statCell } : null;
        })
        .filter(Boolean);

    const updateTooltipContent = ({ statCell, valueElement }) => {
        const customContent = valueElement.dataset.tooltipContent;

        if (customContent) {
            tooltip.innerHTML = customContent;
            return;
        }

        const labelText = statCell?.querySelector('.stat-label')?.textContent.trim() ?? '';
        const valueText = valueElement.innerText.replace(/\s+/g, ' ').trim();
        tooltip.textContent = `${labelText} ${valueText}`.trim();
    };

    const moveTooltip = (event) => {
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY + 10}px`;
    };

    statTargets.forEach(target => {
        const { statCell, valueElement } = target;

        statCell.addEventListener('mouseenter', (event) => {
            updateTooltipContent(target);
            tooltip.style.display = 'block';
            moveTooltip(event);
        });

        statCell.addEventListener('mousemove', (event) => {
            updateTooltipContent(target);
            moveTooltip(event);
        });

        statCell.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
    });
}


function setupProductionRateTooltips() {
    let tooltip = document.getElementById('production-rate-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'production-rate-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.padding = '6px 10px';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.background = 'var(--container-bg-color)';
        tooltip.style.color = 'var(--text-color)';
        tooltip.style.border = '1px solid var(--border-color, #555)';
        tooltip.style.borderRadius = 'var(--border-radius, 4px)';
        tooltip.style.fontSize = '12px';
        tooltip.style.zIndex = '100000';
        tooltip.style.display = 'none';
        tooltip.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
        tooltip.style.maxWidth = '320px';
        tooltip.style.wordWrap = 'break-word';
        document.body.appendChild(tooltip);
    }

    const resources = Object.keys(getResourceDataObject('resources') || {});
    const compounds = Object.keys(getResourceDataObject('compounds') || {});

    const attachTooltip = (resourceKey, category) => {
        const element = document.getElementById(`${resourceKey}Rate`);
        if (!element || element.dataset.productionTooltipAttached) {
            return;
        }

        element.dataset.productionTooltipAttached = 'true';

        const updateTooltip = (event) => {
            if (!shouldShowProductionTooltip(category)) {
                tooltip.style.display = 'none';
                return;
            }

            const content = buildProductionTooltipContent(resourceKey, category);
            if (!content) {
                tooltip.style.display = 'none';
                return;
            }

            tooltip.innerHTML = content;
            tooltip.style.display = 'block';
            tooltip.style.left = `${event.pageX + 10}px`;
            tooltip.style.top = `${event.pageY + 10}px`;
        };

        element.addEventListener('mouseenter', updateTooltip);
        element.addEventListener('mousemove', updateTooltip);
        element.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
    };

    resources.forEach(resource => attachTooltip(resource, 'resources'));
    compounds.forEach(compound => attachTooltip(compound, 'compounds'));

    const researchElement = document.getElementById('researchRate');
    if (researchElement && !researchElement.dataset.productionTooltipAttached) {
        researchElement.dataset.productionTooltipAttached = 'true';

        const updateResearchTooltip = event => {
            if (!shouldShowProductionTooltip('research')) {
                tooltip.style.display = 'none';
                return;
            }

            const content = buildResearchTooltipContent();
            if (!content) {
                tooltip.style.display = 'none';
                return;
            }

            tooltip.innerHTML = content;
            tooltip.style.display = 'block';
            tooltip.style.left = `${event.pageX + 10}px`;
            tooltip.style.top = `${event.pageY + 10}px`;
        };

        researchElement.addEventListener('mouseenter', updateResearchTooltip);
        researchElement.addEventListener('mousemove', updateResearchTooltip);
        researchElement.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
    }

    const miningElement = document.getElementById('miningRate');
    if (miningElement && !miningElement.dataset.productionTooltipAttached) {
        miningElement.dataset.productionTooltipAttached = 'true';

        const updateMiningTooltip = event => {
            if (!shouldShowProductionTooltip('antimatter')) {
                tooltip.style.display = 'none';
                return;
            }

            const content = buildAntimatterTooltipContent();
            if (!content) {
                tooltip.style.display = 'none';
                return;
            }

            tooltip.innerHTML = content;
            tooltip.style.display = 'block';
            tooltip.style.left = `${event.pageX + 10}px`;
            tooltip.style.top = `${event.pageY + 10}px`;
        };

        miningElement.addEventListener('mouseenter', updateMiningTooltip);
        miningElement.addEventListener('mousemove', updateMiningTooltip);
        miningElement.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
    }
}

function shouldShowProductionTooltip(category) {
    const currentTab = getCurrentTab?.();
    const tabLabel = currentTab?.[1] ?? '';

    if (category === 'resources') {
        return tabLabel.includes('Resources');
    }

    if (category === 'compounds') {
        return tabLabel.includes('Compounds');
    }

    if (category === 'research') {
        return tabLabel.includes('Research');
    }

    if (category === 'antimatter') {
        return tabLabel.includes('Space Mining');
    }

    return false;
}

function buildProductionTooltipContent(resourceKey, category) {
    const resourceData = getResourceDataObject(category, [resourceKey]);
    if (!resourceData) {
        return '';
    }

    const timerRatio = getTimerRateRatio() || 1;
    const displayName = capitaliseString(resourceData.nameResource || resourceData.nameCompound || resourceKey);
    const warpMultiplier = getBlackHoleAlwaysOn() ? getBlackHolePower() : getTimeWarpMultiplier();
    const rateElement = document.getElementById(`${resourceKey}Rate`);
    const fallbackRate = `${formatProductionRateValue(((getResourceDataObject(category, [resourceKey, 'rate']) || 0) * timerRatio * (warpMultiplier || 1)))} / s`;
    const netRateDisplay = (rateElement?.textContent?.trim()) || fallbackRate;

    const lines = [
        `<div><strong>${displayName}</strong>: <span class="green-ready-text">${netRateDisplay}</span></div>`
    ];

    if ((warpMultiplier || 1) !== 1) {
        lines.push('<div class="tooltip-spacer">&nbsp;</div>');
        lines.push(`<div class="green-ready-text">Black Hole Multiplier of x${warpMultiplier} applied</div>`);
    }

    const autoBuyerGenerationLines = buildAutoBuyerGenerationLines(resourceKey, category, timerRatio);
    const autoCreateGenerationLine = buildAutoCreateGenerationLine(resourceKey, category, timerRatio);
    const precipitationGenerationLine = buildPrecipitationGenerationLine(resourceKey, category, timerRatio);
    const generationBlock = [autoBuyerGenerationLines, autoCreateGenerationLine, precipitationGenerationLine].filter(Boolean).join('');
    if (generationBlock) {
        lines.push('<div class="tooltip-spacer">&nbsp;</div>');
        lines.push('<div><strong>Generation</strong></div>');
        lines.push(generationBlock);
    }

    const consumptionLines = buildFuelConsumptionLines(resourceKey, category, timerRatio);
    if (consumptionLines) {
        lines.push('<div class="tooltip-spacer">&nbsp;</div>');
        lines.push('<div><strong>Consumption</strong></div>');
        lines.push(consumptionLines);
    }

    const diversionLines = buildAutoCreateDiversionLines(resourceKey, category);
    if (diversionLines) {
        lines.push('<div class="tooltip-spacer">&nbsp;</div>');
        lines.push(diversionLines);
    }

    return lines.join('');
}

function buildResearchTooltipContent() {
    const timerRatio = getTimerRateRatio() || 1;
    const rateElement = document.getElementById('researchRate');
    const warpMultiplier = getBlackHoleAlwaysOn() ? getBlackHolePower() : getTimeWarpMultiplier();

    const fallbackRate = `${formatProductionRateValue(calculateResearchTooltipRatePerTick() * timerRatio * (warpMultiplier || 1))} / s`;
    const netRateDisplay = (rateElement?.textContent?.trim()) || fallbackRate;

    const lines = [
        `<div><strong>Research</strong>: <span class="green-ready-text">${netRateDisplay}</span></div>`
    ];

    if ((warpMultiplier || 1) !== 1) {
        lines.push('<div class="tooltip-spacer">&nbsp;</div>');
        lines.push(`<div class="green-ready-text">Black Hole Multiplier of x${warpMultiplier} applied</div>`);
    }

    const { lines: generationLines, total: generationTotal } = buildResearchGenerationLines(timerRatio);
    if (generationLines.length > 0) {
        lines.push('<div class="tooltip-spacer">&nbsp;</div>');
        lines.push('<div><strong>Generation</strong></div>');
        lines.push(...generationLines);
    }

    const { lines: bonusLines } = buildResearchBonusLines(timerRatio);
    if (bonusLines.length > 0) {
        lines.push('<div class="tooltip-spacer">&nbsp;</div>');
        lines.push('<div><strong>MegaStructure Bonuses</strong></div>');
        lines.push(...bonusLines);
    }

    return lines.join('');
}

function calculateResearchTooltipRatePerTick() {
    const generationData = buildResearchGenerationLines(1);
    const bonusData = buildResearchBonusLines(1);
    return generationData.total + bonusData.total;
}

function buildResearchGenerationLines(timerRatio) {
    const powerOn = getPowerOnOff();
    const upgrades = getResourceDataObject('research', ['upgrades']) || {};
    const researchSources = [
        { key: 'scienceKit', label: 'Science Kit' },
        { key: 'scienceClub', label: 'Science Club' },
        { key: 'scienceLab', label: 'Science Lab', requiresPower: true }
    ];

    const lines = [];
    let total = 0;

    researchSources.forEach(({ key, label, requiresPower }) => {
        const upgradeData = upgrades[key];
        if (!upgradeData) {
            return;
        }

        const baseRate = (upgradeData.rate || 0) * (upgradeData.quantity || 0);
        const isActive = upgradeData.active !== false;
        const contributes = isActive && baseRate > 0 && (powerOn || !requiresPower);
        if (!contributes) {
            return;
        }

        total += baseRate;
        const perSecond = baseRate * timerRatio;
        const formatted = formatProductionRateValue(perSecond);
        lines.push(`<div>${label}: <span class="green-ready-text">${formatted} / s</span></div>`);
    });

    return { lines, total };
}

function buildAntimatterTooltipContent() {
    const timerRatio = getTimerRateRatio() || 1;
    const warpMultiplier = getBlackHoleAlwaysOn() ? getBlackHolePower() : getTimeWarpMultiplier();
    const rateElement = document.getElementById('miningRate');
    const antimatterRate = (getResourceDataObject('antimatter', ['rate']) || 0) * timerRatio;
    const fallbackRate = `${formatProductionRateValue(antimatterRate * (warpMultiplier || 1))} / s`;
    const netRateDisplay = (rateElement?.textContent?.trim()) || fallbackRate;

    const lines = [
        `<div><strong>Antimatter</strong>: <span class="green-ready-text">${netRateDisplay}</span></div>`
    ];

    if ((warpMultiplier || 1) !== 1) {
        lines.push('<div class="tooltip-spacer">&nbsp;</div>');
        lines.push(`<div class="green-ready-text">Black Hole Multiplier of x${warpMultiplier} applied</div>`);
    }

    const { lines: rocketLines } = buildAntimatterRocketLines(timerRatio);
    if (rocketLines.length > 0) {
        lines.push('<div class="tooltip-spacer">&nbsp;</div>');
        lines.push('<div><strong>Rockets</strong></div>');
        lines.push(...rocketLines);
    }

    const { lines: megaLines } = buildAntimatterMegaStructureLines(timerRatio);
    if (megaLines.length > 0) {
        lines.push('<div class="tooltip-spacer">&nbsp;</div>');
        lines.push('<div><strong>MegaStructure Bonuses</strong></div>');
        lines.push(...megaLines);
    }

    return lines.join('');
}

function buildAntimatterRocketLines(timerRatio) {
    const miningAssignments = getMiningObject?.() || {};
    const asteroids = getAsteroidArray?.() || [];
    const buffData = getBuffEnhancedMiningData?.();
    const buffMultiplier = 1 + ((buffData?.boughtYet ?? 0) * (buffData?.effectCategoryMagnitude ?? 0));
    const boostMultiplier = getIsAntimatterBoostActive?.() ? getBoostRate?.() : 1;

    const lines = [];
    let total = 0;

    for (let i = 1; i <= 4; i++) {
        const rocketKey = `rocket${i}`;
        const rocketName = getRocketUserName?.(rocketKey) || `Rocket ${i}`;
        const asteroidName = miningAssignments?.[rocketKey];
        const asteroid = findAsteroidByName(asteroids, asteroidName);
        const perTick = calculateRocketExtractionPerTick(asteroid, buffMultiplier, boostMultiplier);
        total += perTick;
        const perSecond = perTick * timerRatio;
        const formatted = formatProductionRateValue(perSecond);
        lines.push(`<div>${rocketName}: <span class="green-ready-text">${formatted} / s</span></div>`);
    }

    return { lines, total };
}

function buildAntimatterMegaStructureLines(timerRatio) {
    const megaStructureTechs = getMegaStructureTechsResearched?.() || [];
    const techLabels = {
        1: 'Dyson Sphere',
        2: 'Celestial Proc. Core',
        3: 'Plasma Forge',
        4: 'Galactic Mem. Arch.'
    };
    const perSecondValue = 0.15;

    const lines = [];
    let total = 0;

    Object.entries(techLabels).forEach(([structureId, label]) => {
        if (hasMegaStructureTech(megaStructureTechs, Number(structureId), 3)) {
            total += perSecondValue / timerRatio;
            const formatted = formatProductionRateValue(perSecondValue);
            lines.push(`<div>${label}: <span class="green-ready-text">${formatted} / s</span></div>`);
        }
    });

    return { lines, total };
}

function findAsteroidByName(asteroids, targetName) {
    if (!targetName || !Array.isArray(asteroids)) {
        return null;
    }

    const entry = asteroids.find(obj => Object.prototype.hasOwnProperty.call(obj, targetName));
    return entry ? entry[targetName] : null;
}

function calculateRocketExtractionPerTick(asteroid, buffMultiplier, boostMultiplier) {
    if (!asteroid || !asteroid.beingMined) {
        return 0;
    }

    const baseRate = calculateAsteroidExtractionRate(asteroid);
    let extractionRate = baseRate * buffMultiplier * boostMultiplier;
    const available = Math.max(0, asteroid.quantity?.[0] ?? 0);
    return Math.min(extractionRate, available);
}

function calculateAsteroidExtractionRate(asteroid) {
    if (!asteroid) {
        return 0;
    }

    const maxRate = getNormalMaxAntimatterRate?.() || 0;
    const minRate = 0.0001;
    const maxEase = 1;
    const minEase = 10;
    const easeValueRaw = Array.isArray(asteroid.easeOfExtraction) ? asteroid.easeOfExtraction[0] : asteroid.easeOfExtraction;
    const easeValue = Math.max(maxEase, Math.min(minEase, easeValueRaw ?? minEase));
    const normalizedEase = (easeValue - maxEase) / (minEase - maxEase);
    return maxRate - (normalizedEase * (maxRate - minRate));
}

function buildResearchBonusLines(timerRatio) {
    const megaStructureTechs = getMegaStructureTechsResearched?.() || [];
    const isMegaStructureRun = getCurrentRunIsMegaStructureRun?.();
    const currentFactoryStar = getStarSystemDataObject('stars', [getCurrentStarSystem(), 'factoryStar'], true);
    const inCelestialProcessingCore = currentFactoryStar === 'Celestial Processing Core';

    const hasMegaResearch = index =>
        Array.isArray(megaStructureTechs) &&
        megaStructureTechs.some(entry => Array.isArray(entry) && entry[0] === 2 && entry[1] === index);

    const bonusEntries = [];

    if (isMegaStructureRun && inCelestialProcessingCore) {
        const cpcBonuses = [
            { index: 1, amount: 0.5, label: 'CPC Tech I' },
            { index: 2, amount: 1, label: 'CPC Tech II' },
            { index: 4, amount: 1.5, label: 'CPC Tech IV' }
        ];

        cpcBonuses.forEach(({ index, amount, label }) => {
            if (hasMegaResearch(index)) {
                bonusEntries.push({ label, amount });
            }
        });
    }

    if (hasMegaResearch(5)) {
        const amount = isMegaStructureRun && inCelestialProcessingCore ? 2 : 5;
        bonusEntries.push({ label: 'CPC Tech V', amount });
    }

    const lines = [];
    let total = 0;

    bonusEntries.forEach(({ label, amount }) => {
        total += amount;
        const perSecond = amount * timerRatio;
        const formatted = formatProductionRateValue(perSecond);
        lines.push(`<div>${label}: <span class="green-ready-text">+${formatted} / s</span></div>`);
    });

    return { lines, total };
}

function buildAutoBuyerGenerationLines(resourceKey, category, timerRatio) {
    const autoBuyer = getResourceDataObject(category, [resourceKey, 'upgrades', 'autoBuyer']);
    if (!autoBuyer) {
        return '';
    }

    const tierNumbers = [1, 2, 3, 4];
    const tierLines = tierNumbers.map(tier => {
        const tierData = autoBuyer[`tier${tier}`];
        if (!tierData) {
            return null;
        }

        const quantity = tierData.quantity ?? 0;
        if (quantity <= 0) {
            return null;
        }

        const active = Boolean(tierData.active);
        if (!active) {
            return null;
        }

        const perUnitRate = tierData.rate ?? 0;
        const contribution = perUnitRate * quantity * timerRatio;
        const className = contribution > 0 ? 'green-ready-text' : 'red-disabled-text';
        const label = tierData.nameUpgrade || `Tier ${tier}`;
        const tierLabel = `${label} (Tier ${tier})`;
        const formattedContribution = formatProductionRateValue(contribution);

        return `<div>${tierLabel}: <span class="${className}">${formattedContribution} / s</span></div>`;
    }).filter(Boolean);

    return tierLines.join('');
}

function buildAutoCreateGenerationLine(resourceKey, category, timerRatio) {
    if (category !== 'compounds') {
        return '';
    }

    const compoundData = getResourceDataObject('compounds', [resourceKey]);
    if (!compoundData?.autoCreate) {
        return '';
    }

    const autoCreateRate = calculateAutoCreateRatePerSecond(resourceKey, timerRatio);
    if (autoCreateRate <= 0) {
        return '';
    }

    const formatted = formatProductionRateValue(autoCreateRate);
    return `<div class="stats-text">Auto Creation: ${formatted} / s</div>`;
}

function buildPrecipitationGenerationLine(resourceKey, category, timerRatio) {
    if (category !== 'compounds') {
        return '';
    }

    if (getCurrentStarSystemWeatherEfficiency()?.[2] !== 'rain') {
        return '';
    }

    const precipitationCategory = getStarSystemDataObject('stars', [getCurrentStarSystem(), 'precipitationResourceCategory']);
    if (precipitationCategory !== 'compounds') {
        return '';
    }

    const precipitationType = getStarSystemDataObject('stars', [getCurrentStarSystem(), 'precipitationType']);
    if (!precipitationType || resourceKey !== precipitationType) {
        return '';
    }

    const tech = getTechUnlockedArray();
    const revealedBy = getResourceDataObject('compounds', [precipitationType, 'revealedBy']);
    const precipitationRevealedYet = tech.includes('compounds') && tech.includes(revealedBy);
    if (!precipitationRevealedYet) {
        return '';
    }

    const compoundData = getResourceDataObject('compounds', [precipitationType]);
    const quantity = compoundData?.quantity ?? 0;
    const capacity = compoundData?.storageCapacity ?? Infinity;
    const available = Math.max(0, capacity - quantity);
    const perTickRate = Math.max(0, getCurrentPrecipitationRate?.() ?? 0);
    const effectivePerTick = available <= 0 ? 0 : Math.min(perTickRate, available);
    const perSecond = effectivePerTick * timerRatio;

    const className = perSecond > 0 ? 'green-ready-text' : 'red-disabled-text';
    const formatted = formatProductionRateValue(perSecond);
    return `<div>Precipitation: <span class="${className}">${formatted} / s</span></div>`;
}

function buildAutoCreateDiversionLines(resourceKey, category) {
    if (category !== 'resources') {
        return '';
    }

    const compounds = getResourceDataObject('compounds') || {};
    const diversionTargets = Object.entries(compounds)
        .filter(([, data]) => data?.autoCreate)
        .filter(([, data]) => compoundUsesResource(data, resourceKey));

    if (diversionTargets.length === 0) {
        return '';
    }

    const lines = diversionTargets.map(([compoundKey, data]) => {
        const name = capitaliseString(data?.nameCompound || data?.nameResource || compoundKey);
        return `<div class="stats-text">Resources diverted to create ${name}</div>`;
    });

    return lines.join('');
}

function calculateAutoCreateRatePerSecond(compoundKey, timerRatio) {
    const compoundData = getResourceDataObject('compounds', [compoundKey]);
    if (!compoundData) {
        return 0;
    }

    if (isCompoundStorageFull(compoundData)) {
        return 0;
    }

    const perIngredientRates = getCompoundIngredientEntries(compoundData)
        .map(({ resourceName, category, ratio }) => {
            if (!resourceName || ratio <= 0) {
                return 0;
            }

            const sourceCategory = category || 'resources';
            const perSecond = calculateGrossAutoBuyerGenerationPerSecond(sourceCategory, resourceName, timerRatio);
            return Math.max(0, perSecond / ratio);
        })
        .filter(rate => rate >= 0);

    if (perIngredientRates.length === 0) {
        return 0;
    }

    return Math.min(...perIngredientRates);
}

function compoundUsesResource(compoundData, resourceKey) {
    return getCompoundIngredientEntries(compoundData).some(({ resourceName }) => resourceName === resourceKey);
}

function isCompoundStorageFull(compoundData) {
    const quantity = compoundData.quantity ?? 0;
    const capacity = compoundData.storageCapacity ?? Infinity;
    return quantity >= capacity;
}

function calculateGrossAutoBuyerGenerationPerSecond(category, resourceKey, timerRatio) {
    const autoBuyer = getResourceDataObject(category, [resourceKey, 'upgrades', 'autoBuyer']);
    if (!autoBuyer) {
        return 0;
    }

    return [1, 2, 3, 4].reduce((total, tier) => {
        const tierData = autoBuyer[`tier${tier}`];
        if (!tierData) {
            return total;
        }

        const quantity = tierData.quantity ?? 0;
        if (quantity <= 0) {
            return total;
        }

        const active = tierData.active !== false;
        if (!active) {
            return total;
        }

        const rate = tierData.rate ?? 0;
        if (rate <= 0) {
            return total;
        }

        return total + (rate * quantity * timerRatio);
    }, 0);
}

function getCompoundIngredientEntries(compoundData) {
    return [1, 2, 3, 4]
        .map(index => {
            const resourceEntry = compoundData[`createsFrom${index}`];
            const ratio = compoundData[`createsFromRatio${index}`] || 0;
            if (!Array.isArray(resourceEntry) || !resourceEntry[0]) {
                return null;
            }

            return {
                resourceName: resourceEntry[0],
                category: resourceEntry[1],
                ratio
            };
        })
        .filter(Boolean);
}

const fuelConsumptionMap = {
    resources: {
        carbon: [{ buildingKey: 'powerPlant1', label: 'Basic Power Plant' }]
    },
    compounds: {
        diesel: [{ buildingKey: 'powerPlant3', label: 'Advanced Power Plant' }]
    }
};

function buildFuelConsumptionLines(resourceKey, category, timerRatio) {
    const consumptionEntries = fuelConsumptionMap?.[category]?.[resourceKey];
    if (!consumptionEntries) {
        return '';
    }

    const powerOn = getPowerOnOff();

    const lines = consumptionEntries.map(({ buildingKey, label }) => {
        const buildingData = getResourceDataObject('buildings', ['energy', 'upgrades', buildingKey]);
        if (!buildingData) {
            return null;
        }

        const quantity = buildingData.quantity ?? 0;
        const fuelRate = buildingData.fuel?.[1] ?? 0;
        const isActive = powerOn && getBuildingTypeOnOff(buildingKey);
        const consumption = isActive ? fuelRate * quantity * timerRatio : 0;
        const className = consumption > 0 ? 'red-disabled-text' : 'green-ready-text';

        return `<div>${label}: <span class="${className}">${consumption.toFixed(2)} / s</span></div>`;
    }).filter(Boolean);

    return lines.join('');
}

    initialiseDescriptions();

    const headerText = gameIntroHeader;
    let content = gameSaveNameCollect;
    populateModal(headerText, content);
    getElements().modalContainer.style.display = 'flex';
    getElements().overlay.style.display = 'flex';

    document.querySelector('.fullScreenCheckBox').addEventListener('click', function () {
        this.classList.toggle('checked');
    });

    document.querySelector('.fullScreenLabel').addEventListener('click', function () {
        document.querySelector('.fullScreenCheckBox').classList.toggle('checked');
    });

    await getUserSaveName();

    initialiseDescriptions();

    content = gameIntroText;
    populateModal(headerText, content);
    getElements().modalContainer.style.display = 'flex';
    document.querySelector('.fullScreenContainer').style.display = 'flex';
    getElements().overlay.style.display = 'flex';

    const modalConfirmBtn = document.getElementById('modalConfirm');

    const startGameClickHandler = async () => {
        if (document.getElementById('fullScreenCheckBox').classList.contains('checked')) {
            toggleGameFullScreen();
        }
        document.querySelector('.fullScreenContainer').style.display = 'none';
        showHideModal();

        modalConfirmBtn.removeEventListener('click', startGameClickHandler);

        await promptOnboardingIfNeeded({ callPopupModal, showHideModal });
    };

    modalConfirmBtn.addEventListener('click', startGameClickHandler);
    
    startGame();

    document.addEventListener('keydown', (event) => {
        if (event.code === 'NumpadSubtract') {
            toggleDebugWindow();
        }
    });

    document.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', function () {
            playSwipeSfx();
            const content = this.nextElementSibling;
            content.classList.toggle('open');
            this.classList.toggle('active');
        });
    });

    //handleLanguageChange(getLanguageSelected()); //if we are using localise later on

    const powerAllButton = document.getElementById('activateGridButton');
    powerAllButton.addEventListener('click', () => {
        if (!getInfinitePower()) {
            toggleAllPower();
        }
    });
     
    window.addEventListener('resize', () => {
        if (getCurrentOptionPane()) {
            const starContainer = document.querySelector('#optionContentTab5');
            starContainer.innerHTML = '';
            generateStarfield(starContainer, NUMBER_OF_STARS, STAR_FIELD_SEED, getStarMapMode(), false, null, false);
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            setLastSavedTimeStamp(new Date().toISOString());
        } else {
            offlineGains(true);
        }
    });

    document.addEventListener("mouseenter", (e) => {
        if (getResourceDataObject('antimatter', ['rate']) > 0) {
            if (e.target && e.target.id === 'svgRateBar' || e.target.id === 'svgRateBarOuter') {
                const boostTextContainer = document.getElementById('boostTextContainer');
                const antimatterRateBarOuter = document.getElementById('svgRateBarOuter');
                if (antimatterRateBarOuter) {
                    antimatterRateBarOuter.style.backgroundColor = `rgba(var(--text-color-rgb), 0.2)`;
                }
                if (boostTextContainer) {
                    boostTextContainer.style.visibility = 'visible';
                    boostTextContainer.style.opacity = "1";
                }
            }
        }
    }, true);
    
    document.addEventListener("mouseleave", (e) => {
        if (getResourceDataObject('antimatter', ['rate']) > 0) {
            if (e.target && e.target.id === 'svgRateBarOuter') {
                boostAntimatterRate(false);
            }
        }
    }, true);   
    
    document.addEventListener('mousedown', (e) => {
        if (getResourceDataObject('antimatter', ['rate']) > 0) {
            if (e.target && e.target.id === 'svgRateBarOuter') {
                boostAntimatterRate(true);
            }
        }
    });

    document.addEventListener('mouseup', (e) => {
        if (getResourceDataObject('antimatter', ['rate']) > 0) {
            if (e.target && e.target.id === 'svgRateBarOuter') {
                boostAntimatterRate(false);
            }
        }
    });
});

export function removeTabAttentionIfNoIndicators(tabId) {
    const container = document.getElementById(`${tabId}ContainerGroup`);
    const tab = document.getElementById(tabId);

    if (container && tab) {
        const hasIndicators = container.classList.contains('attention-indicator') ||
                              container.querySelector('.attention-indicator');
        if (!hasIndicators) {
            const icon = tab.querySelector('.attention-indicator');
            if (icon) {
                icon.remove();
            }
        }
    }
}

function buildPowerPlantStatusLines() {
    const plants = [
        { label: 'Basic Power Plant', key: 'powerPlant1' },
        { label: 'Solar Power Plant', key: 'powerPlant2' },
        { label: 'Advanced Power Plant', key: 'powerPlant3' }
    ];

    return plants.map(({ label, key }) => {
        const isOn = getBuildingTypeOnOff(key);
        const className = isOn ? 'green-ready-text' : 'red-disabled-text';
        const statusText = isOn ? 'ON' : 'OFF';
        return `<div>${label}: <span class="${className}">${statusText}</span></div>`;
    }).join('');
}


export function updateContent(heading, tab, type) {
    if (getSuppressUiClickSfx()) {
        setSuppressUiClickSfx(false);
    } else {
        playClickSfx();
    }
    const optionDescriptionElements = getElements().optionPaneDescriptions;
    let optionDescription;

    let headerContentElement;
    let optionContentElement;
    let optionDescriptionElement;

    let tabNumber = parseInt(tab.replace('tab', ''));
    headerContentElement = document.getElementById(`headerContentTab${tabNumber}`);
    optionContentElement = document.getElementById(`optionContentTab${tabNumber}`);

    headerContentElement.innerText = heading;

    if (heading.includes('⚠️') || heading.includes('🌀')) {
        heading = heading.replace(/\s*[⚠️🌀]/g, '').trim();
        headerContentElement.innerText = heading;
    }

    optionContentElement.innerHTML = '';
       
    if (type === 'intro') {      
        optionDescription = getHeaderDescriptions([heading]);
        optionDescriptionElement = optionDescriptionElements[tabNumber - 1];
        optionDescriptionElement.innerHTML = optionDescription;
        optionDescriptionElement.style.border = `1px dashed var(--container-border-color)`;

        const asciiArt = getImageUrls();
        const asciiContainer = document.createElement('div');
        asciiContainer.classList.add('intro-image-container');

        const asciiKey = heading.toLowerCase();
        asciiContainer.innerHTML = asciiArt[asciiKey];
    
        optionContentElement.appendChild(asciiContainer);
        return;
    } else {
        optionDescription = getHeaderDescriptions([heading.toLowerCase()]);
        switch (tab) {
            case 'tab1':
                optionDescriptionElement = optionDescriptionElements[0];
                optionDescriptionElement.innerHTML = optionDescription;
                optionDescriptionElement.style.border = `1px dashed var(--container-border-color)`;
                drawTab1Content(heading, optionContentElement);
                break;
            case 'tab2':
                optionDescriptionElement = optionDescriptionElements[1];
                optionDescriptionElement.innerHTML = optionDescription;
                optionDescriptionElement.style.border = `1px dashed var(--container-border-color)`;
                drawTab2Content(heading, optionContentElement);
                break;
            case 'tab3':
                optionDescriptionElement = optionDescriptionElements[2];
                optionDescriptionElement.innerHTML = optionDescription;
                optionDescriptionElement.style.border = `1px dashed var(--container-border-color)`;
                drawTab3Content(heading, optionContentElement);
                break;
            case 'tab4':
                optionDescriptionElement = optionDescriptionElements[3];
                optionDescriptionElement.innerHTML = optionDescription;
                optionDescriptionElement.style.border = `1px dashed var(--container-border-color)`;
                drawTab4Content(heading, optionContentElement);
                break;
            case 'tab5':
                optionDescriptionElement = optionDescriptionElements[4];
                optionDescriptionElement.innerHTML = optionDescription;
                optionDescriptionElement.style.border = `1px dashed var(--container-border-color)`;
                drawTab5Content(heading, optionContentElement, false, false);
                break;
            case 'tab6':
                optionDescriptionElement = optionDescriptionElements[5];
                if (getCurrentOptionPane().startsWith('rocket')) {
                    optionDescriptionElement.innerHTML = getRocketNames('rocketDescription');
                } else {
                    optionDescriptionElement.innerHTML = optionDescription;
                }
                optionDescriptionElement.style.border = `1px dashed var(--container-border-color)`;
                drawTab6Content(heading, optionContentElement);
                break;
            case 'tab7':
                optionDescriptionElement = optionDescriptionElements[6];
                optionDescriptionElement.innerHTML = optionDescription;
                optionDescriptionElement.style.border = `1px dashed var(--container-border-color)`;
                drawTab7Content(heading, optionContentElement);
                break;
            case 'tab8':
                optionDescriptionElement = optionDescriptionElements[7];
                optionDescriptionElement.innerHTML = optionDescription;
                optionDescriptionElement.style.border = `1px dashed var(--container-border-color)`;
                drawTab8Content(heading, optionContentElement);
                break;
            default:
                console.error('Invalid tab:', tab);
                break;
        }
    }
}

export function createOptionRow(
    labelId,
    renderNameABs,
    labelText,
    inputElement1,
    inputElement2,
    inputElement3,
    inputElement4,
    inputElement5,
    descriptionText,
    resourcePriceObject,
    dataConditionCheck,
    objectSectionArgument1,
    objectSectionArgument2,
    quantityArgument,
    autoBuyerTier,
    startInvisibleValue,
    resourceString,
    optionalIterationParam,
    rowCategory,
    noDescriptionContainer,
    specialInputContainerClasses = false,
    hideMainDescriptionRow = false
) {
    // Main wrapper container
    const wrapper = document.createElement('div');
    wrapper.classList.add('option-row', 'd-flex')
    wrapper.id = labelId;

    // Create the description row
    const descriptionRowContainer = document.createElement('div');
    descriptionRowContainer.id = labelId + 'Description';
    descriptionRowContainer.classList.add('option-row-description', 'd-flex');
    if(getOptionDescription(labelId)) {
        descriptionRowContainer.innerHTML = getOptionDescription(labelId).content1;
    }

    // Main row container
    const mainRow = document.createElement('div');
    mainRow.classList.add('option-row-main', 'd-flex');
    wrapper.dataset.conditionCheck = dataConditionCheck;
    wrapper.dataset.type = objectSectionArgument1;
    wrapper.dataset.autoBuyerTier = autoBuyerTier;
    wrapper.dataset.rowCategory = rowCategory;

    // Visibility logic for mainRow
    if (dataConditionCheck === "techUnlock") {
        const researchPointsToAppear = getResourceDataObject('techs', [objectSectionArgument1, 'appearsAt'])[0];
        const prerequisiteForTech = getResourceDataObject('techs', [objectSectionArgument1, 'appearsAt'])[1];
        if (getResourceDataObject('research', ['quantity']) < researchPointsToAppear && !getRevealedTechArray().includes(objectSectionArgument1)) {
            wrapper.classList.add('invisible');
        } else if (!getTechUnlockedArray().includes(prerequisiteForTech)) {
            wrapper.classList.add('invisible');
        } else if (getResourceDataObject('research', ['quantity']) >= researchPointsToAppear && !getRevealedTechArray().includes(objectSectionArgument1)) {
            setRevealedTechArray(objectSectionArgument1);
        }
    }

    if (getCurrentOptionPane() === 'launch pad') {
        if (objectSectionArgument2.startsWith('rocket') && !getResourceDataObject('space', ['upgrades', 'launchPad', 'launchPadBoughtYet'])) {
            wrapper.classList.add('invisible');
        } else if (objectSectionArgument2.startsWith('rocket')) {
            wrapper.classList.remove('invisible');
        }
    }

    if (getCurrentOptionPane() === 'space telescope') {
        if (['searchAsteroid', 'investigateStar', 'pillageVoid'].includes(objectSectionArgument2)) {
            if (!getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'spaceTelescopeBoughtYet'])) {
                wrapper.classList.add('invisible');
            } else {
                if (objectSectionArgument2 === 'pillageVoid') {
                    if (getPlayerPhilosophy() === 'voidborn' && getPhilosophyAbilityActive() && getStatRun() > 1) {
                        wrapper.classList.remove('invisible');
                    } else {
                        wrapper.classList.add('invisible');
                    }
                } else {
                    wrapper.classList.remove('invisible');
                }
            }
        }
    }

    if (startInvisibleValue && startInvisibleValue[0] !== 'research') {
        const revealElementType = startInvisibleValue[0];
        const revealElementCondition = startInvisibleValue[1];

        if (revealElementType === 'tech') {
            if (!getTechUnlockedArray().includes(revealElementCondition)) {
                wrapper.classList.add('invisible');
            }
        }

        if (revealElementType === 'debug') {
            if (getDebugVisibilityArray().includes(revealElementCondition)) {
                wrapper.classList.add('invisible');
            }
        }
    }

    // Create the label container
    const labelContainer = document.createElement('div');
    labelContainer.classList.add('label-container');
    if (noDescriptionContainer) {
        if (noDescriptionContainer[1] !== 'invisible') {
            labelContainer.style.width = noDescriptionContainer[1];
        } else {
            labelContainer.classList.add('invisible');
        }

    }
    const label = document.createElement('label');

    if (objectSectionArgument1 === 'autoBuyer') { //to change color of label pass an array [value, class] as labeltext argument to function
        label.innerText = renderNameABs + ':';
    } else {
        if (Array.isArray(labelText)) {
            labelContainer.classList.add(labelText[1]);
            label.innerText = labelText[0];
        } else {
            label.innerText = labelText;
        }
    }
    
    labelContainer.appendChild(label);
    mainRow.appendChild(labelContainer);

    // Create the input container
    const inputContainer = document.createElement('div');
    inputContainer.classList.add('input-container');
    if (specialInputContainerClasses) {
        specialInputContainerClasses.forEach(className => {
            inputContainer.classList.add(className);
        });
    }

    if (noDescriptionContainer) {
        inputContainer.style.width = noDescriptionContainer[2];
    }

    if (inputElement1) inputContainer.appendChild(inputElement1);
    if (inputElement2) inputContainer.appendChild(inputElement2);
    if (inputElement3) inputContainer.appendChild(inputElement3);
    if (inputElement4) inputContainer.appendChild(inputElement4);
    if (inputElement5) inputContainer.appendChild(inputElement5);

    mainRow.appendChild(inputContainer);

    // Create the description container that contains prices of upgrades etc
    if (!noDescriptionContainer || getCurrentOptionPane() === 'energy' || getCurrentOptionPane() === 'power plant' || getCurrentOptionPane() === 'advanced power plant' || getCurrentOptionPane() === 'solar power plant') {
        const descriptionContainer = document.createElement('div');
        descriptionContainer.classList.add('description-container');
        const description = document.createElement('label');
        description.classList.add('notation');
    
        if (rowCategory === 'building' || rowCategory === 'spaceMiningPurchase' || rowCategory === 'starShipPurchase' || rowCategory === 'fleetPurchase') {
            description.classList.add('building-purchase');
        }
    
        description.id = generateElementId(labelText, resourceString, optionalIterationParam);
        description.innerHTML = descriptionText;
    
        if (dataConditionCheck) {
            if (rowCategory === 'resource' || rowCategory === 'building' || rowCategory === 'spaceMiningPurchase' || rowCategory === 'starShipPurchase' || rowCategory === 'fleetPurchase' || rowCategory === 'science' || rowCategory === 'tech') {
                description.classList.add('red-disabled-text', 'resource-cost-sell-check');
            } else if (rowCategory === 'compound') {
                description.classList.add('red-disabled-text', 'compound-cost-sell-check');
            }
    
            if (dataConditionCheck === 'techUnlock') {
                description.dataset.conditionCheck = dataConditionCheck;
                description.dataset.argumentCheckQuantity = quantityArgument;
                description.dataset.type = objectSectionArgument1;
            } else {
                const quantityArgument2 = descriptionText.includes(',') && objectSectionArgument1.includes('storage') ? descriptionText.split(',').pop().trim().split(' ').pop().toLowerCase() : '';            
                
                description.dataset.conditionCheck = dataConditionCheck;
                description.dataset.resourcePriceObject = resourcePriceObject;
                description.dataset.type = objectSectionArgument1;
                description.dataset.resourceToFuseTo = objectSectionArgument2;
                description.dataset.argumentCheckQuantity = quantityArgument;
                description.dataset.argumentCheckQuantity2 = quantityArgument2;
                description.dataset.autoBuyerTier = autoBuyerTier;
                description.dataset.rowCategory = rowCategory;
            }
        }
    
        descriptionContainer.appendChild(description);
        mainRow.appendChild(descriptionContainer);
    }

    if (!hideMainDescriptionRow) {
         wrapper.appendChild(descriptionRowContainer);
    }
    wrapper.appendChild(mainRow);

    return wrapper;
}

function generateElementId(labelText, resource, optionalIterationParam) {

    let id = labelText.replace(/:$/, '');
    id = id.replace(/(^\w|[A-Z]|\s+)(\w*)/g, (match, p1, p2, index) => {
        return index === 0 ? p1.toLowerCase() + p2 : p1.toUpperCase() + p2;
    });

    if (resource !== null) {
        id = resource.toLowerCase() + capitaliseString(id);
    }

    if (optionalIterationParam) {
        id += optionalIterationParam + 'Description';
    } else {
        id += 'Description';
    }

    id = id.replace(/\s+/g, '');
    
    return id;
}

export function createDropdown(id, options, selectedValue, onChange, classes = []) {
    const selectContainer = document.createElement('div');
    selectContainer.classList.add('select-container');
    selectContainer.id = id;

    if (Array.isArray(classes)) {
        classes.forEach(className => selectContainer.classList.add(className));
    }

    const dropdown = document.createElement('div');
    dropdown.classList.add('dropdown');
    dropdown.setAttribute('tabindex', '0');

    const dropdownText = document.createElement('span');
    dropdownText.classList.add('dropdown-text');

    const defaultOption = options.find(option => option.value === selectedValue);
    dropdownText.innerHTML = defaultOption ? defaultOption.text : 'Select an option';

    dropdown.appendChild(dropdownText);

    const dropdownOptions = document.createElement('div');
    dropdownOptions.classList.add('dropdown-options');

    options.forEach((option) => {
        const optionDiv = document.createElement('div');
        optionDiv.classList.add('dropdown-option');
        optionDiv.setAttribute('data-value', option.value);
        optionDiv.setAttribute('data-type', option.type);
        optionDiv.innerHTML = option.text;

        optionDiv.addEventListener('click', (event) => {
            playClickSfx();
            const value = event.target.getAttribute('data-value');
            const selectedOption = options.find(option => option.value == value);
            dropdownText.innerHTML = selectedOption ? selectedOption.text : 'Select an option';
            if (getCurrentOptionPane().startsWith('rocket')) {
                setCurrentDestinationDropdownText(dropdownText.innerHTML);
            }
            dropdownOptions.classList.remove('show');
            selectContainer.style.borderRadius = '10px 10px 10px 10px';
            onChange(value);
        });

        dropdownOptions.appendChild(optionDiv);
    });

    dropdown.addEventListener('click', (event) => {
        playSwipeSfx();
        event.stopPropagation();

        const isVisible = dropdownOptions.classList.contains('show');

        document.querySelectorAll('.dropdown-options').forEach(option => {
            option.classList.remove('show');
        });

        if (!isVisible) {
            dropdownOptions.classList.add('show');
            selectContainer.style.borderRadius = '10px 10px 0 0'; 
        } else {
            selectContainer.style.borderRadius = '10px 10px 10px 10px';
        }
    });

    document.addEventListener('click', (event) => {
        if (!selectContainer.contains(event.target)) {
            selectContainer.style.borderRadius = '10px 10px 10px 10px';
            dropdownOptions.classList.remove('show');
        }
    });

    selectContainer.appendChild(dropdown);
    selectContainer.appendChild(dropdownOptions);
    return selectContainer;
}

export function createToggleSwitch(id, isChecked, onChange, extraClasses) {
    const toggleContainer = document.createElement('div');
    toggleContainer.classList.add('toggle-container');

    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.id = id;
    toggle.checked = isChecked;

    toggle.addEventListener('change', (event) => {
        const isEnabled = event.target.checked;
        playSwipeSfx();
        onChange(isEnabled);
    });

    const toggleLabel = document.createElement('label');
    toggleLabel.htmlFor = id;

    if (Array.isArray(extraClasses)) {
        extraClasses.forEach(className => {
            toggleContainer.classList.add(className);
        });
    }

    toggleContainer.appendChild(toggle);
    toggleContainer.appendChild(toggleLabel);
    return toggleContainer;
}

export function setElementPointerEvents(element, value) {
    if (!element) {
        return;
    }

    const pointerEvents = (value === 'none' || value === 'auto')
        ? value
        : (value ? 'auto' : 'none');

    element.style.pointerEvents = pointerEvents;
}

export function setElementOpacity(element, value) {
    if (!element) {
        return;
    }

    element.style.opacity = String(value);
}

export function setButtonState(button, options = {}) {
    if (!button) {
        return;
    }

    const {
        enabled,
        ready = null,
        addClasses = [],
        removeClasses = [],
        disabledClass = 'red-disabled-text',
        readyClass = 'green-ready-text',
        applyDisabledClass = true,
        applyPointerEvents = true
    } = options;

    if (typeof enabled === 'boolean') {
        if ('disabled' in button) {
            button.disabled = !enabled;
        }
        if (applyPointerEvents) {
            setElementPointerEvents(button, enabled);
        }

        if (applyDisabledClass) {
            button.classList.toggle(disabledClass, !enabled);
        }
    }

    if (ready !== null) {
        button.classList.toggle(readyClass, Boolean(ready));
    }

    if (Array.isArray(removeClasses) && removeClasses.length) {
        button.classList.remove(...removeClasses);
    }

    if (Array.isArray(addClasses) && addClasses.length) {
        button.classList.add(...addClasses);
    }
}


export function createButton(text, classNames, onClick, dataConditionCheck, resourcePriceObject, objectSectionArgument1, objectSectionArgument2, quantityArgument, disableKeyboardForButton, autoBuyerTier, rowCategory) {
    const button = document.createElement('button');
    button.innerText = text;
    
    if (Array.isArray(classNames)) {
        classNames.forEach(className => {
            if (className.startsWith('id_')) {
                button.id = className.slice(3);
            } else {
                button.classList.add(className);
            }
        });
    } else if (typeof classNames === 'string') {
        button.classList.add(classNames);
    }

    if (dataConditionCheck) {
        if (dataConditionCheck === 'sellResource' || dataConditionCheck === 'fuseResource') {
            button.dataset.conditionCheck = dataConditionCheck;
            button.dataset.argumentCheckQuantity = quantityArgument;
            button.dataset.type = objectSectionArgument1;
            button.dataset.resourceToFuseTo = objectSectionArgument2;
        } else if (dataConditionCheck === 'techUnlock' || dataConditionCheck === 'techUnlockPhilosophy') {
            button.dataset.conditionCheck = dataConditionCheck;
            button.dataset.argumentCheckQuantity = quantityArgument;
            button.dataset.type = objectSectionArgument1;
        }else if (dataConditionCheck === 'toggle') {
            button.dataset.conditionCheck = dataConditionCheck;
            button.dataset.toggleTarget = objectSectionArgument2;
        } else {
            button.dataset.conditionCheck = dataConditionCheck;
            button.dataset.resourcePriceObject = resourcePriceObject;
            button.dataset.type = objectSectionArgument1;
            button.dataset.resourceToFuseTo = objectSectionArgument2;
            button.dataset.argumentCheckQuantity = quantityArgument;
            button.dataset.autoBuyerTier = autoBuyerTier;
            button.dataset.rowCategory = rowCategory;
        }
    }

    button.addEventListener('click', function(event) {
        if (objectSectionArgument1 && objectSectionArgument1 === 'storage') {
            sfxPlayer.playAudio('increaseStorage');
        } else {
            playClickSfx();
        }
        onClick(event);
    });
    
    if (disableKeyboardForButton) {
        button.setAttribute('tabindex', '-1');
        button.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
            }
        });
    }

    return button;
}

export function createTextElement(text, id, classList, onClick) {
    const div = document.createElement('div');
    
    div.id = id;
    div.innerHTML = text;

    if (Array.isArray(classList)) {
        div.classList.add(...classList);
    }

    if (typeof onClick === 'function') {
        div.addEventListener('click', (event) => onClick(event));
    }

    return div;
}

export function createHtmlTextAreaProse(id, classList = [], headerText = '', bodyText = '', headerClasses = [], bodyClasses = []) {
    const div = document.createElement('div');
    const headers = headerText ? headerText : [];
    const bodies = bodyText ? bodyText : [];
    let innerTextString = '';
    
    for (let i = 0; i < Math.max(headers.length, bodies.length); i++) {
        const header = headers[i] || '';
        const body = bodies[i] || '';

        if (header) {
            innerTextString += `<span class="${headerClasses.join(' ')}">${header}</span>`;
        }
        if (header && body) {
            innerTextString += '<br/><br/>';
        }
        if (body) {
            innerTextString += `<span class="${bodyClasses.join(' ')}">${body}</span>`;
        }

        if (i < Math.max(headers.length, bodies.length) - 1) {
            innerTextString += '<br/><br/>';
            innerTextString += `<div class="sub-header-seperator" style="width: 100%; height: 10px;"></div>`;
        }
    }

    div.id = id;
    div.innerHTML = innerTextString;

    if (Array.isArray(classList)) {
        div.classList.add(...classList);
    } else if (typeof classList === 'string') {
        div.classList.add(classList);
    }

    return div;
}

export function setupAchievementTooltip() {
    const tooltip = document.createElement('div');
    tooltip.id = 'achievement-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.padding = '6px 10px';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.background = 'var(--container-bg-color)';
    tooltip.style.color = 'var(--text-color)';
    tooltip.style.border = '1px solid var(--border-color, #555)';
    tooltip.style.borderRadius = 'var(--border-radius, 4px)';
    tooltip.style.fontSize = '12px';
    tooltip.style.zIndex = '1000';
    tooltip.style.display = 'none';
    tooltip.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    tooltip.style.maxWidth = '300px';
    tooltip.style.wordWrap = 'break-word';
    document.body.appendChild(tooltip);

    const containerWidth = 200;

    document.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('achievement-tile')) {
            const tile = e.target;
            const gridColumnStart= parseInt(window.getComputedStyle(tile).getPropertyValue('grid-column-start'), 10);
            let tooltipContent = getAchievementTooltipDescription(tile.id);
            
            if (tooltipContent) {
                tooltip.innerHTML = tooltipContent;
                tooltip.style.display = 'block';
                if (gridColumnStart > 5) {
                    tooltip.style.left = `${e.pageX - containerWidth + 10}px`;
                } else {
                    tooltip.style.left = `${e.pageX + 10}px`;
                }
                tooltip.style.top = `${e.pageY + 10}px`;
            }
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (tooltip.style.display === 'block') {
            const tile = e.target;
            const gridColumnStart= parseInt(window.getComputedStyle(tile).getPropertyValue('grid-column-start'), 10);

            let tooltipContent = getAchievementTooltipDescription(tile.id);
            if (tooltipContent) {
                tooltip.innerHTML = tooltipContent;
            }

            if (gridColumnStart > 5) {
                tooltip.style.left = `${e.pageX - containerWidth + 10}px`;
            } else {
                tooltip.style.left = `${e.pageX + 10}px`;
            }
            tooltip.style.top = `${e.pageY + 10}px`;
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.classList.contains('achievement-tile')) {
            tooltip.style.display = 'none';
        }
    });
}

export function setupModalButtonTooltips() {
    const tooltip = document.createElement('div');
    tooltip.id = 'modal-button-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.padding = '8px 12px';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.background = 'var(--bg-color)';
    tooltip.style.color = 'var(--text-color)';
    tooltip.style.border = '1px solid var(--border-color, #555)';
    tooltip.style.borderRadius = 'var(--border-radius, 4px)';
    tooltip.style.fontSize = '12px';
    tooltip.style.zIndex = '10000';
    tooltip.style.display = 'none';
    tooltip.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    tooltip.style.maxWidth = '300px';
    tooltip.style.wordWrap = 'break-word';
    document.body.appendChild(tooltip);

    const tooltipTextMap = {
        modalConfirm: modalPlayerLeaderIntroContentText1,      // Constructor
        modalCancel: modalPlayerLeaderIntroContentText2,       // Supremacist
        modalExtraChoice1: modalPlayerLeaderIntroContentText3, // Voidborn
        modalExtraChoice2: modalPlayerLeaderIntroContentText4  // Expansionist
    };

    modalTooltipHandlers.mouseover = (e) => {
        const target = e.target;
        if (target && tooltipTextMap.hasOwnProperty(target.id)) {
            tooltip.innerHTML = tooltipTextMap[target.id];
            tooltip.style.display = 'block';
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
        }
    };

    modalTooltipHandlers.mousemove = (e) => {
        if (tooltip.style.display === 'block') {
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
        }
    };

    modalTooltipHandlers.mouseout = (e) => {
        if (e.target && tooltipTextMap.hasOwnProperty(e.target.id)) {
            tooltip.style.display = 'none';
        }
    };

    document.addEventListener('mouseover', modalTooltipHandlers.mouseover);
    document.addEventListener('mousemove', modalTooltipHandlers.mousemove);
    document.addEventListener('mouseout', modalTooltipHandlers.mouseout);
}

export function removeModalButtonTooltips() {
    const tooltip = document.getElementById('modal-button-tooltip');
    if (tooltip) {
        tooltip.remove();
    }

    if (modalTooltipHandlers.mouseover) {
        document.removeEventListener('mouseover', modalTooltipHandlers.mouseover);
        document.removeEventListener('mousemove', modalTooltipHandlers.mousemove);
        document.removeEventListener('mouseout', modalTooltipHandlers.mouseout);
        modalTooltipHandlers = {};
    }
}

const attentionRules = [
    {
    selector: '#tab1',
    condition: () => {
        const container = document.getElementById('tab1ContainerGroup');
        return container && container.querySelector('.attention-indicator') !== null;
    }
    },
    {
    selector: '#tab2',
    condition: () => {
        const container = document.getElementById('tab2ContainerGroup');
        return container && container.querySelector('.attention-indicator') !== null;
    }
    },
    {
    selector: '#tab3',
    condition: () => {
        const container = document.getElementById('tab3ContainerGroup');
        return container && container.querySelector('.attention-indicator') !== null;
    }
    },
    {
    selector: '#tab4',
    condition: () => {
        const container = document.getElementById('tab4ContainerGroup');
        return container && container.querySelector('.attention-indicator') !== null;
    }
    },
    {
    selector: '#tab5',
    condition: () => {
        const container = document.getElementById('tab5ContainerGroup');
        return container && container.querySelector('.attention-indicator') !== null;
    }
    },
    {
    selector: '#tab6',
    condition: () => {
        const container = document.getElementById('tab6ContainerGroup');
        return container && container.querySelector('.attention-indicator') !== null;
    }
    },
    {
    selector: '#tab7',
    condition: () => {
        const container = document.getElementById('tab7ContainerGroup');
        return container && container.querySelector('.attention-indicator') !== null;
    }
    },
    {
    selector: '#tab8',
    condition: () => {
        const container = document.getElementById('tab8ContainerGroup');
        return container && container.querySelector('.attention-indicator') !== null;
    }
    }
  ];
  
export function updateAttentionIndicators() {
    attentionRules.forEach(rule => {
        const element = document.querySelector(rule.selector);

        if (rule.condition()) {
            if (element.innerHTML.includes('???')) {
                removeAttentionIndicator(element);
                return;
            }

            let iconText = '⚠️';
            if (element.id?.startsWith('tab')) {
                const container = document.getElementById(`${element.id}ContainerGroup`);
                const containerIcons = Array.from(container?.querySelectorAll('.attention-indicator') || []);
                const iconTexts = containerIcons
                    .map(icon => icon?.textContent?.trim())
                    .filter(Boolean);

                if (iconTexts.includes('🌀')) {
                    iconText = '🌀';
                } else if (iconTexts.length > 0) {
                    iconText = iconTexts[0];
                }
            }

            appendAttentionIndicator(element, iconText);
        } else {
            removeAttentionIndicator(element);
        }
    });
}

export function appendAttentionIndicator(element, iconText = '⚠️') {
    if (!element || !(element instanceof HTMLElement)) return;
    const existing = element.querySelector('.attention-indicator');
    if (existing) {
        const desired = ` ${iconText}`;
        if (existing.textContent !== desired) {
            existing.textContent = desired;
        }
        return;
    }

    const icon = document.createElement('span');
    icon.className = 'attention-indicator';
    icon.textContent = ` ${iconText}`;
    element.appendChild(icon);
  }

export function removeAttentionIndicator(element) {
    const icon = element?.querySelector('.attention-indicator');
    if (icon) {
      icon.remove();
    }
  }
  

export function createHtmlTableAchievementsGrid(id, classList = [], achievementsData = []) {
    const container = document.createElement('div');
    container.id = id;

    container.classList.add(...classList);
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(10, 80px)';
    container.style.gridTemplateRows = 'repeat(6, 80px)';
    container.style.gap = '0px';
    container.style.padding = '10px';
    container.style.justifyContent = 'start';
    container.style.alignItems = 'start';

    achievementsData.forEach(achievement => {
        const tile = document.createElement('div');
        tile.id = achievement.id;
        tile.classList.add('achievement-tile');
        tile.style.gridColumnStart = achievement.gridColumn + 1;
        tile.style.gridRowStart = achievement.gridRow + 1;
        tile.style.width = '70px';
        tile.style.height = '70px';
        tile.style.border = '1px solid var(--text-color)';
        tile.style.boxSizing = 'border-box';
        tile.style.position = 'relative';
        tile.style.opacity = 0.3;

        tile.style.backgroundImage = `url('${getAchievementImageUrl(achievement.id)}')`;
        tile.style.backgroundSize = 'contain';
        tile.style.backgroundRepeat = 'no-repeat';
        tile.style.backgroundPosition = 'center';
        container.appendChild(tile);
    });

    return container;
}

export function createHtmlTableStatistics(id, classList = [], mainHeadings, subHeadings, subBodys, mainHeaderClasses = [], subHeaderClasses = [], subBodyClasses = []) {
    const div = document.createElement('div');
    let innerTextString = '';

    classList.push('center-statistics');

    for (let i = 0; i < mainHeadings.length; i++) {
        const mainHeading = capitaliseString(mainHeadings[i]);
        const dualColumnPerRow = ['resources', 'compounds', 'research', 'energy', 'spacemining', 'interstellar'].includes(String(mainHeadings[i]).toLowerCase());

        innerTextString += `<span class="${mainHeaderClasses.join(' ')}">${mainHeading}</span><br/>`;

        innerTextString += `
        <table class="statistics-table">
            <thead>
                ${i === 0 || i === 1 ? '' : `  <!-- Only include the headers for tables after the first and second --> 
                    <tr class="first-row">
                        <td class="left-column"></td>
                        <td class="middle-column">Current Run</td>
                        <td class="right-column">All Time</td>
                    </tr>
                `}
            </thead>
            <tbody>
        `;

        const notationHeaders = ['Cash', 'Hydrogen', 'Helium', 'Carbon', 'Neon', 'Oxygen', 'Sodium', 'Silicon', 'Iron', 'Diesel', 'Glass', 'Concrete', 'Steel', 'Water', 'Titanium', 'Research Points'];

        for (let j = 0; j < subHeadings[i].length; j++) {
            let header = capitaliseString(subHeadings[i][j] || '');
            const body = capitaliseString(subBodys[i][j] || '');
            const isAllTimeHeader = header.endsWith(' ');
            const headerClasses = [...subHeaderClasses];
            const bodyClasses = [...subBodyClasses];

            if (header) {
                if (notationHeaders.includes(header)) {
                    bodyClasses.push('notation');
                }
                header += ':';
            }

            // Apply special rule for the first and second tables (i === 0 or i === 1)
            if (i === 0 || i === 1) {
                innerTextString += `
                    <tr>
                        <td class="left-column"><span class="${headerClasses.join(' ')}">${header}</span></td>
                        <td class="middle-column">
                            <span id="stat_${toCamelCase(header.replace(':', '').trim())}" class="${bodyClasses.join(' ')}">${body}</span>
                        </td>
                        <td class="right-column"></td>
                    </tr>
                `;
            } else {
                const statIdBase = toCamelCase(header.replace(':', '').trim());

                if (dualColumnPerRow) {
                    innerTextString += `
                        <tr>
                            <td class="left-column"><span class="${headerClasses.join(' ')}">${header}</span></td>
                            <td class="middle-column">
                                <span id="stat_${statIdBase}ThisRun" class="${bodyClasses.join(' ')}">${body}</span>
                            </td>
                            <td class="right-column">
                                <span id="stat_${statIdBase}" class="${bodyClasses.join(' ')}">${body}</span>
                            </td>
                        </tr>
                    `;
                } else {
                    innerTextString += `
                        <tr>
                            <td class="left-column"><span class="${headerClasses.join(' ')}">${header}</span></td>
                            <td class="middle-column">
                                ${!isAllTimeHeader ? `<span id="stat_${statIdBase}" class="${bodyClasses.join(' ')}">${body}</span>` : ''}
                            </td>
                            <td class="right-column">
                                ${isAllTimeHeader ? `<span id="stat_${statIdBase}" class="${bodyClasses.join(' ')}">${body}</span>` : ''}
                            </td>
                        </tr>
                    `;
                }
            }
            
        }

        innerTextString += `
                </tbody>
            </table>
            <br/>
        `;
    }

    div.id = id;
    div.innerHTML = innerTextString;

    if (Array.isArray(classList)) {
        div.classList.add(...classList);
    } else if (typeof classList === 'string') {
        div.classList.add(classList);
    }

    return div;
}

export function createTextFieldArea(id, classList = [], placeholder = '', innerTextString) {
    const textArea = document.createElement('textarea');
    
    textArea.id = id;
    textArea.placeholder = placeholder;

    if (innerTextString) {
        textArea.value = innerTextString;
    }

    textArea.classList.add('text-area-height', 'text-area-width', 'text-area-style'); 

    if (Array.isArray(classList)) {
        textArea.classList.add(...classList);
    } else if (typeof classList === 'string') {
        textArea.classList.add(classList);
    }

    return textArea;
}

export function createSvgElement(id, width = "100%", height = "100%", additionalClasses = []) {
    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.id = id;
    svgElement.setAttribute("width", width);
    svgElement.setAttribute("height", height);

    if (Array.isArray(additionalClasses)) {
        svgElement.classList.add(...additionalClasses);
    } else if (typeof additionalClasses === "string") {
        svgElement.classList.add(additionalClasses);
    }

    return svgElement;
}

 export function createBlackHole(defaultStage = 0, sizeOverridePx = null) {
     const baseSize = 220;
     const renderSize = (typeof sizeOverridePx === 'number' && Number.isFinite(sizeOverridePx) && sizeOverridePx > 0)
         ? sizeOverridePx
         : baseSize;
     const size = baseSize;
     const canvas = document.createElement('canvas');

     const horizontalPaddingPercent = 0.05;
     const paddedWidth = Math.round(renderSize * (1 + horizontalPaddingPercent * 2));
     const horizontalPaddingPx = (paddedWidth - renderSize) / 2;

     canvas.width = paddedWidth;
     canvas.height = renderSize;
     canvas.style.width = `${paddedWidth}px`;
     canvas.style.height = `${renderSize}px`;
     canvas.style.display = 'block';
     canvas.style.margin = '0 auto';

     const ctx = canvas.getContext('2d');
     if (!ctx) return canvas;

     const baseStage = Number.isFinite(defaultStage) ? Math.max(0, Math.floor(defaultStage)) : 0;
     const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
     const scaleFactor = renderSize / baseSize;
     canvas.width = paddedWidth * dpr;
     canvas.height = renderSize * dpr;

     const horizontalOffsetUnits = horizontalPaddingPx / scaleFactor;
     const clearWidth = size + horizontalOffsetUnits * 2;

     ctx.scale(dpr * scaleFactor, dpr * scaleFactor);
     ctx.translate(horizontalOffsetUnits, 0);

     const c = size / 2;
     const coreRadius = 34;
     const ringRadius = 62;
     const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

     const getChargePercent = () => {
         const raw = Number.parseFloat(canvas?.dataset?.chargePercent);
         if (!Number.isFinite(raw)) {
             return null;
         }
         return clamp(raw, 0, 100);
     };

     const getTimeWarping = () => canvas?.dataset?.timeWarping === 'true';

     const getTimeWarpStrength = () => {
         if (!getTimeWarping()) {
             return 0;
         }

         const remainingRaw = Number.parseFloat(canvas?.dataset?.timeWarpRemainingMs);
         if (!Number.isFinite(remainingRaw)) {
             return 1;
         }

         const x = clamp(remainingRaw / 1000, 0, 1);
         return x * x * (3 - 2 * x);
     };

     const getStageFromChargePercent = (chargePercent) => {
         if (chargePercent >= 100) return 3;
         if (chargePercent >= 66) return 2;
         if (chargePercent >= 33) return 1;
         return 0;
     };

     const getTextColor = () => {
         const themeElement = document.querySelector('[data-theme]') || document.body || document.documentElement;
         const themeColor = getComputedStyle(themeElement)
             .getPropertyValue('--text-color')
             .trim();

         if (themeColor) {
             return themeColor;
         }

         const rootColor = getComputedStyle(document.documentElement)
             .getPropertyValue('--text-color')
             .trim();

         return rootColor || '#ffffff';
     };

     const draw = (now) => {
         if (!canvas.isConnected) return;

         const chargePercent = getChargePercent();
         const stage = Math.max(baseStage, chargePercent === null ? baseStage : getStageFromChargePercent(chargePercent));
         const timeWarping = getTimeWarping();
         const timeWarpStrength = getTimeWarpStrength();
         const isFullyCharged = chargePercent !== null && chargePercent >= 100;
         const saturationDampening = stage >= 3 && isFullyCharged ? 0.82 : 1;

         const extraArms = Math.floor(3 * timeWarpStrength);
         const arms = (2 + Math.min(3, stage)) + extraArms;
         const spinMultiplier = 1 + (3.15 - 1) * timeWarpStrength;
         const spin = (0.00055 + stage * 0.00012 + (chargePercent === null ? 0 : (chargePercent / 100) * 0.00008)) * spinMultiplier;
         const t = now * spin;

         const pulseSpeed = (0.0022 + stage * 0.00045) * (1 + (2.1 - 1) * timeWarpStrength);
         const pulse = Math.sin(now * pulseSpeed);
         const pulseAmplitude = (0.006 + stage * 0.002) * (1 + (2.4 - 1) * timeWarpStrength);
         const pulseScale = 1 + pulse * pulseAmplitude * (isFullyCharged ? 1.75 : 1) * (1 + (1.2 - 1) * timeWarpStrength);
         const textColor = getTextColor();

         ctx.clearRect(-horizontalOffsetUnits, 0, clearWidth, size);

         ctx.save();
         ctx.translate(c, c);
         ctx.translate(0, 16); // Adjusted vertical centering
         ctx.scale(pulseScale, pulseScale);
         ctx.scale(1, 0.82);

         ctx.globalCompositeOperation = ((timeWarping && timeWarpStrength > 0) || stage >= 3) ? 'lighter' : 'source-over';
         for (let k = 0; k < 3; k += 1) {
             const flash = timeWarping ? (0.75 + 0.25 * Math.sin(now * 0.032 + k * 2.1)) : 1;
             const flashStrength = 1 + (flash - 1) * timeWarpStrength;
             ctx.globalAlpha = (0.65 - k * 0.18) * (1 + pulse * (stage * 0.03)) * saturationDampening * flashStrength;
             ctx.lineWidth = (10 + k * 10) * (1 + stage * 0.06 + pulse * (stage * 0.02)) * (1 + (1.35 - 1) * timeWarpStrength);
             ctx.strokeStyle = textColor;
             ctx.beginPath();
             ctx.arc(0, 0, ringRadius + k * 1.5 + (timeWarping ? 2.4 * Math.sin(now * 0.006 + k) * timeWarpStrength : 0), 0, Math.PI * 2);
             ctx.stroke();
         }

         if (timeWarping && timeWarpStrength > 0) {
             ctx.save();
             ctx.globalCompositeOperation = 'lighter';
             const shockCount = 3;
             for (let s = 0; s < shockCount; s += 1) {
                 const ph = ((now * 0.00085) + s * 0.31) % 1;
                 const rr = coreRadius + 10 + ph * 96;
                 ctx.globalAlpha = (1 - ph) * 0.38 * timeWarpStrength;
                 ctx.lineWidth = 1.2 + (1 - ph) * 5.2 * timeWarpStrength;
                 ctx.strokeStyle = textColor;
                 ctx.beginPath();
                 ctx.arc(0, 0, rr, 0, Math.PI * 2);
                 ctx.stroke();
             }
             ctx.restore();
         }

         if (stage >= 1) {
             const chargeFactor = chargePercent === null ? (stage / 3) : (chargePercent / 100);
             const strength = clamp(stage / 3, 0, 1) * (0.55 + chargeFactor * 0.45);
             const cornerInset = size * 0.47;
             const corners = [
                 [-cornerInset, -cornerInset],
                 [cornerInset, -cornerInset],
                 [-cornerInset, cornerInset],
                 [cornerInset, cornerInset]
             ];

             const basePhase = (now * (0.00025 + stage * 0.00022)) % 1;
             const streaksPerCorner = 4 + stage * 4;
             const segmentLength = 18 + stage * 10;
             const maxOffset = 6 + stage * 4;

             ctx.save();
             ctx.globalCompositeOperation = stage >= 3 ? 'lighter' : 'source-over';
             ctx.strokeStyle = textColor;
             ctx.lineCap = 'round';

             for (let cornerIndex = 0; cornerIndex < corners.length; cornerIndex += 1) {
                 const cornerX = corners[cornerIndex][0];
                 const cornerY = corners[cornerIndex][1];
                 const dirXRaw = -cornerX;
                 const dirYRaw = -cornerY;
                 const cornerDist = Math.hypot(dirXRaw, dirYRaw);
                 if (!cornerDist) continue;

                 const dirX = dirXRaw / cornerDist;
                 const dirY = dirYRaw / cornerDist;
                 const perpX = -dirY;
                 const perpY = dirX;

                 const travelDistance = cornerDist - coreRadius - segmentLength;
                 if (travelDistance <= 1) continue;

                 for (let s = 0; s < streaksPerCorner; s += 1) {
                     const lane = (s / (streaksPerCorner - 1)) * 2 - 1;
                     const laneOffset = lane * maxOffset;

                     const p = (basePhase + cornerIndex * 0.21 + s * 0.17) % 1;
                     const dist = p * travelDistance;
                     const wobble = Math.sin((basePhase + s) * 8 + cornerIndex) * (1 + stage * 0.35);

                     const startX = cornerX + dirX * dist + perpX * (laneOffset + wobble);
                     const startY = cornerY + dirY * dist + perpY * (laneOffset + wobble);
                     const endX = startX + dirX * segmentLength;
                     const endY = startY + dirY * segmentLength;

                     const fade = (1 - p) * (0.35 + stage * 0.12);
                     ctx.globalAlpha = strength * fade * saturationDampening;
                     ctx.lineWidth = (0.9 + stage * 0.45) * (0.9 + pulse * 0.08);
                     ctx.beginPath();
                     ctx.moveTo(startX, startY);
                     ctx.lineTo(endX, endY);
                     ctx.stroke();
                 }
             }

             ctx.restore();
         }

         for (let arm = 0; arm < arms; arm += 1) {
             const armOffset = (arm / arms) * Math.PI * 2;
             const steps = timeWarping ? (220 + Math.floor(100 * timeWarpStrength)) : 220;
             for (let i = 0; i < steps; i += 1) {
                 const p = i / steps;
                 const r = coreRadius + p * 44;
                 const angle = armOffset + t * (6.0 + (9.5 - 6.0) * timeWarpStrength) + p * (10.0 + (14.0 - 10.0) * timeWarpStrength);
                 const wobble = Math.sin(p * 18 + t * (2.5 + (4.2 - 2.5) * timeWarpStrength) + armOffset)
                     * (1.4 + stage * 0.35 + pulse * (stage * 0.15))
                     * (1 + (1.45 - 1) * timeWarpStrength);
                 const x = Math.cos(angle) * r;
                 const y = Math.sin(angle) * (r * 0.65 + wobble);
                 const a = (0.35 + (1 - p) * 0.45) * (1 + (1.2 - 1) * timeWarpStrength);
                 ctx.globalAlpha = Math.min(1, a) * saturationDampening;
                 ctx.fillStyle = textColor;
                 ctx.beginPath();
                 ctx.arc(x, y, (1.25 + (1 - p) * 1.4) * (1 + (1.15 - 1) * timeWarpStrength), 0, Math.PI * 2);
                 ctx.fill();
             }
         }

         if (timeWarping && timeWarpStrength > 0) {
             ctx.save();
             ctx.globalCompositeOperation = 'lighter';
             ctx.fillStyle = textColor;
             const particles = Math.floor(90 * timeWarpStrength);
             for (let i = 0; i < particles; i += 1) {
                 const p = ((now * 0.00011) + i * 0.037) % 1;
                 const rr = (size * 0.52) * (1 - p) + (coreRadius + 2) * p;
                 const ang = now * 0.0035 + i * 0.82 + p * 6.5;
                 const squeeze = 0.66 + 0.1 * Math.sin(now * 0.004 + i);
                 const x = Math.cos(ang) * rr;
                 const y = Math.sin(ang) * rr * squeeze;
                 ctx.globalAlpha = (1 - p) * 0.95 * timeWarpStrength;
                 ctx.beginPath();
                 ctx.arc(x, y, 1.1 + (1 - p) * 1.8, 0, Math.PI * 2);
                 ctx.fill();
             }
             ctx.restore();
         }

         ctx.restore();

        ctx.save();
        ctx.translate(c, c);
        ctx.translate(0, 16);

         ctx.globalCompositeOperation = 'source-over';
         ctx.globalAlpha = 1;
         ctx.fillStyle = '#000000';
         ctx.beginPath();
         ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
         ctx.fill();

         const ringGradient = ctx.createRadialGradient(0, 0, coreRadius - 2, 0, 0, coreRadius + 10);
         ringGradient.addColorStop(0, 'rgba(0,0,0,0)');
         ringGradient.addColorStop(0.55, textColor);
         ringGradient.addColorStop(1, 'rgba(0,0,0,0)');

         ctx.globalAlpha = timeWarping ? (1 - 0.15 * timeWarpStrength + 0.15 * Math.sin(now * 0.03) * timeWarpStrength) : 1;
         ctx.strokeStyle = ringGradient;
         ctx.lineWidth = timeWarping ? (3 + (4.6 - 3) * timeWarpStrength) : 3;
         ctx.beginPath();
         ctx.arc(0, 0, coreRadius + 3, t * 2.0, t * 2.0 + Math.PI * 1.55);
         ctx.stroke();

         ctx.restore();

         requestAnimationFrame(draw);
     };

     requestAnimationFrame(draw);
     return canvas;
 }

export function selectTheme(theme) {
    const body = document.body;
    body.setAttribute('data-theme', theme);
    setCurrentTheme(theme);

    setThemesTriedArray(theme, 'add');
    const requiredThemes = ['terminal', 'dark', 'misty', 'light', 'frosty', 'summer', 'forest'];
    const triedThemes = getThemesTriedArray();
    const hasAllThemes = requiredThemes.every(t => triedThemes.includes(t));
    if (hasAllThemes) {
        setAchievementFlagArray('tryAllThemes', 'add');
    }
}

export function showWeatherNotification(type) {
    const precipitationType = getStarSystemDataObject('stars', [getCurrentStarSystem(), 'precipitationType']);
    const tech = getTechUnlockedArray();

    if (type === 'rain') {
        const benefits = tech.includes('compounds') && tech.includes(getResourceDataObject('compounds', [precipitationType, 'revealedBy']));
        const hasRockets = tech.includes('rocketComposites');

        if (hasRockets && benefits) {
            showNotification(`Heavy Rain! No launches until it clears, but ${precipitationType} stores benefit!`, 'warning', 3000, 'weather');
        } else if (hasRockets) {
            showNotification('Heavy Rain! No launches until it clears.', 'warning');
        } else if (benefits) {
            showNotification(`Heavy Rain! ${capitaliseString(precipitationType)} stores benefit!`, 'warning', 3000, 'weather');
        } else {
            showNotification('Heavy Rain!', 'warning', 3000, 'weather');
        }
    } else if (type === 'volcano') {
        const hasRockets = tech.includes('rocketComposites');
        const hasSolar = tech.includes('solarPowerGeneration');

        if (hasRockets && hasSolar) {
            showNotification('Volcano Eruption! No launches until it clears, and solar power generation severely affected!', 'error', 3000, 'weather');
        } else if (hasRockets) {
            showNotification('Volcano Eruption! No launches until it clears.', 'error', 3000, 'weather');
        } else if (hasSolar) {
            showNotification('Volcano Eruption! Solar power severely affected!', 'error', 3000, 'weather');
        } else {
            showNotification('Volcano Eruption!', 'warning', 3000, 'weather');
        }
    } else {
        console.error('Unknown weather type:', type);
    }
}

export function showNotification(message, type = 'info', time = 3000, classification = 'default') {
    if (!getNotificationsToggle()) return;

    const queues = getNotificationQueues();
    const status = getNotificationStatus();

    if (!queues[classification]) {
        queues[classification] = [];
        status[classification] = false;
        setNotificationQueues(queues);
        setNotificationStatus(status);
        createNotificationContainer(classification);
    }

    queues[classification].push({ message, type, time });
    setNotificationQueues(queues);

    if (!status[classification]) {
        processNotificationQueue(classification);
    }
}

function createNotificationContainer(classification) {
    const container = document.createElement('div');
    container.className = `notification-container classification-${classification}`;

    document.body.appendChild(container);

    const containers = getNotificationContainers();
    containers[classification] = container;
    setNotificationContainers(containers);

    const order = getClassificationOrder();
    order.push(classification);
    setClassificationOrder(order);

    updateContainerPositions();
}

function updateContainerPositions() {
    const containers = getNotificationContainers();
    const order = getClassificationOrder();

    order.slice(0, MAX_STACKS).forEach((className, index) => {
        const container = containers[className];
        if (container) {
            container.style.right = `${BASE_RIGHT + index * STACK_WIDTH}px`;
        }
    });
}

function processNotificationQueue(classification) {
    if (!getNotificationsToggle()) return;

    const queues = getNotificationQueues();
    const status = getNotificationStatus();

    const queue = queues[classification];
    if (queue?.length > 0) {
        status[classification] = true;
        setNotificationStatus(status);

        const { message, type, time } = queue.shift();
        setNotificationQueues(queues);

        sendNotification(message, type, classification, time);
    } else {
        status[classification] = false;
        setNotificationStatus(status);

        const containers = getNotificationContainers();
        const container = containers[classification];
        if (container) {
            container.remove();
            delete containers[classification];
            setNotificationContainers(containers);
        }

        delete queues[classification];
        setNotificationQueues(queues);

        const order = getClassificationOrder().filter(c => c !== classification);
        setClassificationOrder(order);
        delete status[classification];
        setNotificationStatus(status);
        updateContainerPositions();
    }
}

function sendNotification(message, type, classification, duration) {
    const containers = getNotificationContainers();
    const container = containers[classification];
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `<div class="notification-content">${message}</div>`;

    const existing = container.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    const button = document.createElement('button');
    button.className = 'notification-button';
    button.innerText = 'Clear All';
    button.onclick = () => {
        const queues = getNotificationQueues();
        const containers = getNotificationContainers();
        const status = getNotificationStatus();
        const order = getClassificationOrder();
    
        queues[classification] = [];
        setNotificationQueues(queues);
    
        const container = containers[classification];
        if (container) {
            container.remove();
            delete containers[classification];
            setNotificationContainers(containers);
        }

        delete status[classification];
        setNotificationStatus(status);
    
        const newOrder = order.filter(c => c !== classification);
        setClassificationOrder(newOrder);
    
        updateContainerPositions();
    };

notification.appendChild(button);

    container.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        hideNotification(notification);
        processNotificationQueue(classification);
    }, duration);
}

function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        notification.remove();
    }, 500);
}

function highlightActiveTab(activeTabText) {
    if (activeTabText.trim() === "???") return;

    const tabs = document.querySelectorAll('#tabsContainer .tab');

    tabs.forEach(tab => {
        if (tab.textContent.trim() === activeTabText.trim()) {
            tab.classList.add('selected');
        } else {
            tab.classList.remove('selected');
        }
    });
}

export function disableActivateButton(button, action, activeClass) {
    switch (action) {
        case 'active':
            button.classList.remove('disabled');
            button.classList.add(activeClass);
            break;
        case 'disable':
            button.classList.remove(activeClass);
            button.classList.add('disabled');
            break;
    }
}

export function updateDescriptionRow(rowKey, targetProperty) {
    const optionDescriptions = getOptionDescription(rowKey);

    if (
        optionDescriptions &&
        targetProperty in optionDescriptions &&
        'content1' in optionDescriptions
    ) {
        const temp = optionDescriptions['content1'];
        optionDescriptions['content1'] = optionDescriptions[targetProperty];
        optionDescriptions[targetProperty] = temp;
    } else {
        console.error(`Invalid row key or property: ${rowKey}, ${targetProperty}`);
    }
}

function getStarColorForDistanceFilterButton(distance) {
    const maxDistance = 100;
    const minDistance = 0;
    const normalizedDistance = Math.min(Math.max(distance, minDistance), maxDistance) / maxDistance;

    if (normalizedDistance <= 0) return "rgb(255, 255, 255)";
    if (normalizedDistance <= 0.25) return `rgb(${255}, ${255 - normalizedDistance * 255}, ${255 - normalizedDistance * 255})`;
    if (normalizedDistance <= 0.5) return `rgb(${255}, ${255}, ${0 + (normalizedDistance - 0.25) * 1020})`;
    return `rgb(${255}, ${255 - (normalizedDistance - 0.5) * 510}, ${0})`;
}

function getStarColorForTravel(fuelRequired, starName) {
    const currentAntimatter = getResourceDataObject('antimatter', ['quantity']);
    const canTravel = currentAntimatter >= fuelRequired;
    const themeElement = document.querySelector('[data-theme]') || document.documentElement;

    const computedStyles = getComputedStyle(themeElement);
    const readyTextColor = computedStyles.getPropertyValue('--ready-text').trim();
    const disabledTextColor = computedStyles.getPropertyValue('--disabled-text').trim();

    let color = canTravel ? readyTextColor : disabledTextColor;

    if (starName === getDestinationStar() && getStarShipStatus()[0] === 'orbiting') {
        color = readyTextColor;
    }
    return color;
}

export function getStarDataAndDistancesToAllStarsFromSettledStar(settledStar) {
    const dummyContainer = document.createElement('div');
    const { stars, starDistanceData } = generateStarfield(dummyContainer, NUMBER_OF_STARS, STAR_FIELD_SEED, null, true, settledStar, false);
    return { stars, starDistanceData };
}

export function generateStarfield(starfieldContainer, numberOfStars = 70, seed = 1, mapMode, calculationMode = false, originStarName = null, factoryStarChooserMode = false) {
    const stars = [];
    const starDistanceData = {};
    const minSize = 2;
    const maxSize = 6;
    const containerRect = starfieldContainer.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    const containerLeft = containerRect.left;
    const containerTop = containerRect.top;
    const starNames = getStarNames();
    const settledStarsList = getSettledStars();
    const currentStarSystemLower = getCurrentStarSystem();
    let currentStar = null;

    for (let i = 0; i < numberOfStars; i++) {
        const name = starNames.length > 0 ? starNames.splice(Math.floor(seededRandom(seed - i * 1.2) * starNames.length), 1)[0] : `Star${i}`;
        const size = getSeededRandomInRange(seed + i, minSize, maxSize);
        const x = getSeededRandomInRange(seed + i + numberOfStars, 0, containerWidth - 30) + containerLeft;
        const y = getSeededRandomInRange(seed + i + numberOfStars * 2, 0, containerHeight) + containerTop;
        const z = getSeededRandomInRange(seed + i + numberOfStars * 3, 10, 100000);
        stars.push({ name, x, y, z, size, width: size * 1.1, height: size * 1.1, left: x, top: y });
    }

    if (calculationMode && originStarName) {
        currentStar = stars.find(star => star.name.toLowerCase() === originStarName.toLowerCase());
    } else {
        currentStar = stars.find(star => star.name === capitaliseWordsWithRomanNumerals(getCurrentStarSystem()));
    }

    stars.forEach(star => {
        starDistanceData[star.name] = calculate3DDistance(
            currentStar.left + currentStar.width / 2,
            currentStar.top + currentStar.height / 2,
            currentStar.z,
            star.left + star.width / 2,
            star.top + star.height / 2,
            star.z
        );
    });

    if (calculationMode) {
        return { stars, starDistanceData };
    }

    if (factoryStarChooserMode) {
        const destination = getDestinationStar();
        const current = getCurrentStarSystem();
        const settled = settledStarsList;
        const visionDistance = getStarVisionDistance();
        const ancientManuscriptStars = getStarsWithAncientManuscripts();
    
        const filteredStarData = stars
            .filter(star => {
                const name = star.name;
                const distance = starDistanceData[name];
                return (
                    name !== 'Miaplacidus' &&
                    name !== destination &&
                    name !== current &&
                    !ancientManuscriptStars.includes(name) &&
                    !settled.includes(name) &&
                    distance > visionDistance
                );
            })
            .map(star => [
                star.name.toLowerCase(),
                parseFloat(starDistanceData[star.name].toFixed(2))
            ]);
    
        return filteredStarData;
    }    

    const factoryStars = getFactoryStarsArray();
    const ancientManuscripts = getStarsWithAncientManuscripts();

    stars.forEach(star => {
        const distance = starDistanceData[star.name];
        const normalizedStarName = star.name.toLowerCase();
        const hasRevealedManuscript = ancientManuscripts.some(
            entry => Array.isArray(entry) && entry[1] === normalizedStarName && entry[3] === true
        );
        const isFactoryStar = factoryStars.includes(normalizedStarName) && hasRevealedManuscript;
        const isSettled = settledStarsList.includes(normalizedStarName);
        const isCurrentStarSystem = normalizedStarName === currentStarSystemLower;
        const isSettledNonCurrent = isSettled && !isCurrentStarSystem;
        const isInteresting =
            isFactoryStar ||
            distance <= getStarVisionDistance() ||
            star.name === currentStar.name ||
            isSettled;
        const isHomeStar = star.name === 'Miaplacidus';
        const showFactoryAppearance = isFactoryStar && !isSettledNonCurrent;

        let starElement = document.createElement('div');

        if (isHomeStar) {
            if (getMiaplacidusMilestoneLevel() === 4) {
                starElement.classList.add('star', 'home-star-accessible');
            } else {
                starElement.classList.add('star', 'home-star');
            }
            starElement.id = star.name;
        } else if (showFactoryAppearance) {
            starElement.classList.add('star', 'factory-star');
            starElement.id = star.name;
        } else {
            starElement.id = isInteresting ? star.name : `noneInterestingStar${star.name}`;
            if (isInteresting && isSettledNonCurrent) {
                starElement.id = `settledStar${star.name}`;
            }

            starElement.classList.add(isInteresting ? 'star' : 'star-uninteresting');
            if (starElement.id.includes("settledStar")) {
                starElement.classList.add("settled-star");
            } 

            if (isHomeStar) {
                if (getMiaplacidusMilestoneLevel() === 4) {
                    starElement.classList.add('home-star-accessible');
                } else {
                    starElement.classList.add('home-star');
                }
            }
        }

        if (starElement.id.includes("settledStar")) {
            starElement.classList.add("settled-star");
        }

        if (starElement.id.includes("settledStar")) {
            const tags = [];
            if (isFactoryStar) {
                tags.push('(MEGASTRUCTURE)');
            }
            tags.push('(SETTLED)');
            starElement.setAttribute("titler", `${star.name} ${tags.join(' ')}`.trim());
        } else if (star.name.toLowerCase() === getCurrentStarSystem()) {
            starElement.setAttribute("titler", `${star.name}`);
        } else if (starElement.classList.contains("star-uninteresting") || starElement.id === capitaliseString(getCurrentStarSystem())) {
            starElement.setAttribute("titler", `${star.name}`);
        } else if (starElement.classList.contains("factory-star")) {
            starElement.setAttribute("titler", `${star.name} (MEGASTRUCTURE)`);
        } else {
            starElement.setAttribute("titler", `${star.name} (${distance}ly)`);
        }        
        
        if (star.name === currentStar.name || getSettledStars().includes(star.name.toLowerCase())) {
            starElement.style.width = `${star.width * 1.5}px`;
            starElement.style.height = `${star.height * 1.5}px`;
            if (star.name === currentStar.name) {
                starElement.classList.add('current-star');
                starElement.style.width = `${star.width * 4}px`;
                starElement.style.height = `${star.height * 4}px`;
                setCurrentStarObject(currentStar);
            }
        } else if (isFactoryStar) {
            starElement.style.width = `${star.width * 2}px`;
            starElement.style.height = `${star.height * 2}px`;
            starElement.classList.add('star');
            // Always register factory stars so their data appears in the Star Data table
            generateStarDataAndAddToDataObject(starElement, distance);
            if (mapMode === 'distance') {
                starElement.style.backgroundColor = getStarColorForDistanceFilterButton(distance);
            } else if (mapMode === 'in range') {
                starElement.style.backgroundColor = getStarColorForTravel(getStarSystemDataObject('stars', [star.name.toLowerCase()]).fuel, star.name.toLowerCase());
            }
        } else if (isInteresting) {
            starElement.style.width = `${star.width * 2}px`;
            starElement.style.height = `${star.height * 2}px`;
            if (!checkIfInterestingStarIsInStarDataAlready(starElement.id.toLowerCase())) {
                generateStarDataAndAddToDataObject(starElement, distance);
            }
            if (mapMode === 'distance') {
                starElement.style.backgroundColor = getStarColorForDistanceFilterButton(distance);
            } else if (mapMode === 'in range') {
                starElement.style.backgroundColor = getStarColorForTravel(getStarSystemDataObject('stars', [star.name.toLowerCase()]).fuel, star.name.toLowerCase());
            }
        } else {
            starElement.style.width = `${star.width / 2}px`;
            starElement.style.height = `${star.height / 2}px`;
            const randomDuration = (Math.random() * 1 + 0.5).toFixed(2);
            starElement.style.animationDuration = `${randomDuration}s`;
            if (mapMode === 'studied' || mapMode === 'in range') {
                starElement.classList.add('invisible');
            } else {
                starElement.classList.remove('invisible');
            }
        }
        
        starElement.style.left = `${star.left}px`;
        starElement.style.top = `${star.top}px`;
    
        starElement.addEventListener('click', () => {
            if (!getStarShipTravelling()) {
                if (isInteresting) {
                    if (isHomeStar && getMiaplacidusMilestoneLevel() !== 4) {
                        return;
                    }
                    const starData = getStarSystemDataObject('stars');
                    if (star.name === currentStar.name) {
                        return;
                    }
                    setFromStarObject(currentStar);
                    setToStarObject(star);
                    drawStarConnectionDrawings(currentStar, star, true);
                    createStarDestinationRow(starData[star.name.toLowerCase()] || star.name, true);
                    if (starData[star.name.toLowerCase()]) {
                        setDestinationStar(starData[star.name.toLowerCase()].name);
                    }
                } else if (isHomeStar) {
                    if (getMiaplacidusMilestoneLevel() === 4) {
                        drawStarConnectionDrawings(currentStar, star, false);
                        createStarDestinationRow(star.name, false);
                    } else {
                        return;
                    }
                } else {
                    drawStarConnectionDrawings(currentStar, star, false);
                    createStarDestinationRow(star.name, false);
                }
            }
        });
        
        if (
            getFactoryStarsArray().includes(star.name.toLowerCase()) &&
            getStarsWithAncientManuscripts().some(entry => entry[1] === star.name.toLowerCase() && entry[3] === false)
        ) {
            return;
        }        
        
        starfieldContainer.appendChild(starElement);
    });
}

export function createStarDestinationRow(starData, isInteresting) {
    const starName = typeof starData === "object" ? starData.name.toLowerCase() : starData.toLowerCase();

    if (getSettledStars().includes(starName)) {
        return;
    }

    const elementRow = document.getElementById('descriptionContentTab5');
    if (!elementRow) return;
    const currentAntimatter = getResourceDataObject('antimatter', ['quantity']);
    const themeElement = document.querySelector('[data-theme]');
    if (!themeElement) return;

    const themeStyles = getComputedStyle(themeElement);
    const readyTextColor = themeStyles.getPropertyValue('--ready-text').trim();
    const disabledTextColor = themeStyles.getPropertyValue('--disabled-text').trim();

    const canTravel = isInteresting ? currentAntimatter >= starData.fuel : false;
    const textColor = canTravel ? readyTextColor : disabledTextColor;

    elementRow.innerHTML = `
        <div class="option-row-main d-flex no-vertical-padding">
            <div id="starDestinationName">Name: ${isInteresting ? capitaliseWordsWithRomanNumerals(starData.name) : starData}</div>
            <div id="starDestinationDistance" class="travel-starship-info">Distance: <span style="color: ${textColor};">${isInteresting ? `${starData.distance.toFixed(2)}ly` : '???'}</span></div>
            <div id="starDestinationFuel" class="travel-starship-info">Fuel: <span style="color: ${textColor};">${isInteresting ? `${starData.fuel} AM` : '???'}</span></div>
            <div id="starDestinationButton"></div>
            <div id="starDestinationDescription" class="green-ready-text invisible">Travelling...</div>
        </div>
    `;

    const buttonContainer = document.getElementById('starDestinationButton');
    const button = createButton(`Travel`, ['option-button', 'red-disabled-text', 'travel-starship-button'], () => {
        let content = launchStarShipWarningText;
        if (getFactoryStarsArray().includes(getDestinationStar())) {
            content += `<br><br><span class="warning-orange-text">WARNING: MegaStructure Systems are Extremely difficult to conquer!<br>Only go if you have high Production to rebuild broken Fleets multiple times!</span>`;
        } else if (getHomeStarName() === getDestinationStar()) {
            content += `<br><br><span class="red-disabled-text">WARNING: Flying to Miaplacidus is suicidal unless you are VERY strong with<br>VERY high production capabilities to rebuild broken Fleets multiple times!</span>`;
        }

        content += `<br><br><span class="${
            (() => {
                const s = Math.floor(calculateStarTravelDurationWithModifiers(getDestinationStar()) / 1000);
                return s >= 10800 ? 'red-disabled-text' : s >= 3600 ? 'warning-orange-text' : 'green-ready-text';
            })()
        }">Real Time Flight Time to ${capitaliseWordsWithRomanNumerals(getDestinationStar())} approximately: ${
            (() => {
                const s = Math.floor(calculateStarTravelDurationWithModifiers(getDestinationStar()) / 1000);
                return s >= 3600
                    ? `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`
                    : s >= 60
                    ? `${Math.floor(s / 60)}m ${s % 60}s`
                    : `${s}s`;
            })()
        }</span>`;

        callPopupModal(
            launchStarShipWarningHeader, 
            content, 
            true, 
            true, 
            false, 
            false, 
            function() {  
                const destinationStar = getDestinationStar();  
                const starData = getStarSystemDataObject('stars', [destinationStar]);  
                showNotification(`Travelling to ${capitaliseWordsWithRomanNumerals(starData.name)}`, 'info', 3000, 'special');
                startTravelToDestinationStarTimer([0, 'buttonClick'], false);
                spendAntimatterOnFuelForStarShip(starData.fuel);
                spaceTravelButtonHideAndShowDescription();
                addToResourceAllTimeStat(1, 'starShipLaunched');
                addToResourceAllTimeStat(starData.ascendencyPoints, 'apAnticipated');
                setAchievementFlagArray('launchStarship', 'add');
                showHideModal();
            },
            function() {  
                showHideModal();
            },
            null,  
            null,
            'LAUNCH',
            'CANCEL',
            null,
            null,
            false
        );
    }, 'upgradeCheck', '', 'autoBuyer', 'travelToStar', 'time', true, null, 'starShipPurchase');
    buttonContainer.appendChild(button);
}

export async function callPopupModal(
  header,
  content,
  showConfirm,
  showCancel,
  showExtra1,
  showExtra2,
  onConfirm,
  onCancel,
  onExtra1,
  onExtra2,
  confirmLabel,
  cancelLabel,
  extra1Label,
  extra2Label,
  setupToolTips = false
) {
    await waitForModalToHide();

    if (setupToolTips) {
        setupModalButtonTooltips();
    }

    const modalContainer = document.getElementById('modal');
    const overlay = document.getElementById('overlay');

    const confirmButton = document.getElementById('modalConfirm');
    const cancelButton = document.getElementById('modalCancel');
    const extra1Button = document.getElementById('modalExtraChoice1');
    const extra2Button = document.getElementById('modalExtraChoice2');

    confirmButton.onclick = null;
    cancelButton.onclick = null;
    extra1Button.onclick = null;
    extra2Button.onclick = null;

    populateModal(header, content);

    if (showConfirm) {
        confirmButton.classList.remove('invisible');
        confirmButton.innerText = confirmLabel;
        confirmButton.onclick = () => {
            onConfirm?.();
        };
    } else {
        confirmButton.classList.add('invisible');
    }

    if (showCancel) {
        cancelButton.classList.remove('invisible');
        cancelButton.innerText = cancelLabel;
        cancelButton.onclick = () => {
            onCancel?.();
        };
    } else {
        cancelButton.classList.add('invisible');
    }

    if (showExtra1) {
        extra1Button.classList.remove('invisible');
        extra1Button.innerText = extra1Label;
        extra1Button.onclick = () => {
            onExtra1?.();
        };
    } else {
        extra1Button.classList.add('invisible');
    }

    if (showExtra2) {
        extra2Button.classList.remove('invisible');
        extra2Button.innerText = extra2Label;
        extra2Button.onclick = () => {
            onExtra2?.();
        };
    } else {
        extra2Button.classList.add('invisible');
    }

    modalContainer.style.display = 'flex';
    overlay.style.display = 'flex';
}

export function showEnterWarModeModal(reason) {
    if (getEnemyFleetsAdjustedForDiplomacy() && getResourceDataObject('fleets', ['attackPower']) <= 0) {
        return;
    }

    return new Promise((resolve) => {
        const canBackout = reason === "chooseWar";

        const modalContainer = getElements().modalContainer;
        const overlay = getElements().overlay;
        const enterWarModeConfirmButton = document.getElementById('modalConfirm');
        const enterWarModeCancelButton = document.getElementById('modalCancel');
        enterWarModeConfirmButton.innerText = 'CONFIRM';
        enterWarModeCancelButton.innerText = 'CANCEL';

        enterWarModeConfirmButton.classList.remove('invisible');
        enterWarModeCancelButton.classList.add('invisible');

        const starData = getStarSystemDataObject('stars', ['destinationStar']);

        const headerText = enterWarModeModalHeader;
        let content;
        let latestDifferenceInImpression = starData.latestDifferenceInImpression;
        let finalDifference = 0;
        let percentageChange = 0;

        if (reason === 'patience' || reason === 'receptive' || reason === 'reserved' || reason === 'neutral' || reason === 'rebuff') {
            if (reason === 'patience' && !getEnemyFleetsAdjustedForDiplomacy()) {
                finalDifference = starData.currentImpression - starData.initialImpression; 
                adjustEnemyFleetBasedOnDiplomacy(starData, finalDifference);
                setEnemyFleetPower();
                setEnemyFleetsAdjustedForDiplomacy(true);
            }

            if (latestDifferenceInImpression !== 0) {
                percentageChange = latestDifferenceInImpression;
            }
        }

        let spanClass = latestDifferenceInImpression < 0 ? 'red-disabled-text' : (latestDifferenceInImpression > 0 ? 'green-ready-text' : '');

        if (canBackout) {
            enterWarModeCancelButton.classList.remove('invisible');
            content = enterwarModeModalBackOutText;
        } else {
            switch (reason) {
                case "patience":
                    spanClass = finalDifference < 0 ? 'red-disabled-text' : (finalDifference > 0 ? 'green-ready-text' : '');
                    content = enterWarModeModalPatience + "<br>";
                    const spanText = finalDifference === 0
                    ? "No change in overall impression - Fleets unaffected."
                    : (finalDifference < 0
                        ? `Overall Impression Worsened - Enemy Fleets bolstered by ${Math.abs(finalDifference / 3).toFixed(2)}%`
                        : `Overall Impression Improved - Enemy Fleets reduced by ${Math.abs(finalDifference / 3).toFixed(2)}%`);                

                    content += `<span class="${spanClass}">${spanText}</span>`;
                    setWarUI(true);
                    break;
                case "insulted":
                    content = enterWarModeInsultedText + "<br><span class='red-disabled-text'>Enemy Defense Bolstered by 10%</span>";
                    break;
                case "scared":
                    content = enterWarModeScaredText + "<br><span class='green-ready-text'>Half of the enemy fleets have deserted through fear!</span>";
                    break;
                case "surrender":
                    content = enterWarModeSurrenderText + "<br><span class='green-ready-text'>Victory!</span>";
                    break;
                case "notVassalized":
                    content = enterWarModeNotVassalizedText;
                    break;
                case "noScanner":
                    content = enterwarModeModalNoBackOutText + "<br><span class='red-disabled-text'>Attacking Blind!</span>";
                    break;
                case "laugh":
                case "rebuff":
                    content = enterWarModeModalLaughAtProspect + "<br><span class='red-disabled-text'>Enemy Impression of you -10%</span>";
                    break;
                case "laughWar":
                    content = enterWarModeModalLaughAndEnterWar + "<br><span class='red-disabled-text'>Immediate Closure of Diplomacy!</span>";
                    break; 
                case "reserved":
                    content = enterWarModeModalReserved + (latestDifferenceInImpression !== 0 ? "<br><span class='" + spanClass + "'>Impression change: " + (latestDifferenceInImpression < 0 ? "-" : "") + Math.abs(percentageChange).toFixed(2) + "%</span>" : "");
                    break;
                case "neutral":
                    content = enterWarModeModalNeutral + (latestDifferenceInImpression !== 0 ? "<br><span class='" + spanClass + "'>Impression change: " + (latestDifferenceInImpression < 0 ? "-" : "") + Math.abs(percentageChange).toFixed(2) + "%</span>" : "");
                    break;
                case "receptive":
                    content = enterWarModeModalImproveToReceptive + (latestDifferenceInImpression !== 0 ? "<br><span class='" + spanClass + "'>Impression change: " + (latestDifferenceInImpression < 0 ? "-" : "") + Math.abs(percentageChange).toFixed(2) + "%</span>" : "");
                    break;
            }
        }

        populateModal(headerText, content);

        modalContainer.style.display = 'flex';
        overlay.style.display = 'flex';

        enterWarModeConfirmButton.onclick = function () {
            if (reason === 'surrender') {
                settleSystemAfterBattle('surrender');
                showHideModal();
                resolve();
                return;
            }
            
            if (reason !== 'laugh' && reason !== 'reserved' && reason !== 'neutral' && reason !== 'receptive' && reason !== 'rebuff') {
                setWarUI(true);
            }

            showHideModal();
            resolve();
        };

        enterWarModeCancelButton.onclick = function () {
            showHideModal();
            resolve();
        };
    });
}

export async function triggerFeedBackModal(feedback) {
    const modalContainer = getElements().modalContainer;
    const overlay = getElements().overlay;
    const sendFeedBackConfirmButton = document.getElementById('modalConfirm');
    const sendFeedBackCancelButton = document.getElementById('modalCancel');
    sendFeedBackConfirmButton.innerText = 'SEND FEEDBACK';
    sendFeedBackCancelButton.innerText = 'NO THANKS';
    
    let headerText = modalFeedbackHeaderText;
    let content;

    if (feedback === 'good') {
        content = modalFeedbackContentTextGood + `<br><br><textarea id="feedbackArea" class="text-area-style text-area-width text-area-height" placeholder="Leave your thoughts here..."></textarea>`;
    } else {
        content = modalFeedbackContentTextBad + `<br><br><textarea id="feedbackArea" class="text-area-style text-area-width text-area-height" placeholder="Leave your thoughts here..."></textarea>`;
    }

    sendFeedBackConfirmButton.classList.remove('invisible');
    sendFeedBackCancelButton.classList.remove('invisible');

    populateModal(headerText, content);

    modalContainer.style.display = 'flex';
    overlay.style.display = 'flex';

    const firstConfirmClickHandler = function () {
        setFeedbackValueAndSaveGame('accepted', document.getElementById('feedbackArea').value);
        headerText = modalFeedbackThanksHeaderText;
        content = modalFeedbackContentThanks;
        sendFeedBackConfirmButton.innerText = 'OK';
        sendFeedBackCancelButton.classList.add('invisible');
        populateModal(headerText, content);

        sendFeedBackConfirmButton.onclick = function () {
            showHideModal();
        };
    };

    sendFeedBackConfirmButton.onclick = firstConfirmClickHandler;

    sendFeedBackCancelButton.onclick = function () {
        setFeedbackValueAndSaveGame('refused', document.getElementById('feedbackArea').value);
        showHideModal();
    };
}

export async function showBattlePopup(won, apGain = 0) {
    return new Promise((resolve) => {
        const modalContainer = getElements().modalContainer;
        const overlay = getElements().overlay;
        const battleOutcomeConfirmButton = document.getElementById('modalConfirm');
        const battleOutcomeCancelButton = document.getElementById('modalCancel');
        battleOutcomeConfirmButton.innerText = 'CONFIRM';

        let headerText = modalBattleHeaderText;
        let content = won ? modalBattleWonText.replace(' X ', ` ${apGain} `) : modalBattleLostText;

        if (won) {
            if (won !== 'megastructure') {
                content += `<br>- You have conquered the <span class="green-ready-text">${capitaliseWordsWithRomanNumerals(getDestinationStar())}</span> System!`;
            } else {
                content += `<br>- You have defeated the Mechanized army and conquered the <span class="factory-star-text">${capitaliseWordsWithRomanNumerals(getDestinationStar())}</span> System!<br>You will be able to conduct investigative research on how to harness its power on your next run!<br><br><span class="green-ready-text">Prepare for Glory!</span>`;
            }

            const extraSystems = getAdditionalSystemsToSettleThisRun();
            if (Array.isArray(extraSystems) && extraSystems.length > 0) {
                extraSystems.forEach(([name, distance]) => {
                    const formattedDistance = distance.toFixed(1);
                    content += `<br>- Leaders ${formattedDistance}ly away in the <span class="green-ready-text">${name}</span> System<br>have also heard of your greatness and have ceded their System!`;
                });
            }
        }

        if (won === 'noSentientLife') {
            headerText = modalBattleNoSentientLifeHeader;
            content = modalBattleNoSentientLifeText.replace(' X ', ` ${apGain} `);
            content += `<br>- You have settled the <span class="green-ready-text">${capitaliseWordsWithRomanNumerals(getDestinationStar())}</span> System!`;
        }

        battleOutcomeConfirmButton.classList.remove('invisible');
        battleOutcomeCancelButton.classList.add('invisible');

        populateModal(headerText, content);

        modalContainer.style.display = 'flex';
        overlay.style.display = 'flex';

        battleOutcomeConfirmButton.onclick = function () {
            showHideModal();
            resolve();
        };
    });
}

function waitForModalToHide() {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const modalContainer = getElements().modalContainer;
            if (modalContainer && modalContainer.style.display === 'none') {
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });
}

function setFeedbackValueAndSaveGame(wanted, text) {
    setFeedbackCanBeRequested(false);
    setFeedbackContent([wanted, text]);

    saveGame('feedbackSave');
    const saveData = getSaveData();
    if (saveData) {
        saveGameToCloud(saveData, 'manualExportCloud');
    }
    setSaveData(null);
}

export function setWarUI(setWarState) {
    const starData = getStarSystemDataObject('stars', ['destinationStar']);
    const playerFleetPower = getResourceDataObject('fleets', ['attackPower']);

    if (playerFleetPower === 0) {
        return;
    }

    if (setWarState) {
        setDiplomacyPossible(false);
        setWarMode(true);
    }

    const optionContentElement = document.getElementById(`optionContentTab5`);
    const diplomacyImpressionBar = document.getElementById('diplomacyImpressionBar');
    const diplomacyOptionsRow = document.getElementById('diplomacyOptionsRow');
    const receptionStatusRowDescription = document.getElementById('receptionStatusRowDescription');

    if (!getWarMode()) {
        receptionStatusRowDescription.innerHTML = "";
    }

    createBattleCanvas(optionContentElement, starData);

    if (diplomacyOptionsRow) {
        diplomacyOptionsRow.classList.add('invisible');
    }

    if (diplomacyImpressionBar) {
        diplomacyImpressionBar.classList.add('invisible');
    } 
}

function adjustEnemyFleetBasedOnDiplomacy(starData, finalDifference) {
    const percentageFactor = Math.floor(finalDifference / 3);

    if (finalDifference < 0) {
        starData.enemyFleets.air += Math.ceil(starData.enemyFleets.air * (percentageFactor / 100));
        starData.enemyFleets.land += Math.ceil(starData.enemyFleets.land * (percentageFactor / 100));
        starData.enemyFleets.sea += Math.ceil(starData.enemyFleets.sea * (percentageFactor / 100));
    } else if (finalDifference > 0) {
        starData.enemyFleets.air -= Math.floor(starData.enemyFleets.air * (Math.abs(percentageFactor) / 100));
        starData.enemyFleets.land -= Math.floor(starData.enemyFleets.land * (Math.abs(percentageFactor) / 100));
        starData.enemyFleets.sea -= Math.floor(starData.enemyFleets.sea * (Math.abs(percentageFactor) / 100));
    }

    setStarSystemDataObject(starData.enemyFleets.air, 'stars', ['destinationStar', 'enemyFleets', 'air']);
    setStarSystemDataObject(starData.enemyFleets.land, 'stars', ['destinationStar', 'enemyFleets', 'land']);
    setStarSystemDataObject(starData.enemyFleets.sea, 'stars', ['destinationStar', 'enemyFleets', 'sea']);

    return finalDifference;
}

function spendAntimatterOnFuelForStarShip(fuelNeeded) {
    const antimatterLeft = Math.max(0, Math.floor(getResourceDataObject('antimatter', ['quantity']) - fuelNeeded));
    setResourceDataObject(antimatterLeft, 'antimatter', ['quantity']);
}

function calculate3DDistance(x1, y1, z1, x2, y2, z2) {
    return parseFloat((Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2) / 1000).toFixed(2));
}

function getSeededRandomInRange(seed, min, max) {
    return seededRandom(seed) * (max - min) + min;
}

function seededRandom(seed) {
    let x = Math.sin(seed++) * STAR_SEED;
    return x - Math.floor(x);
}

function checkIfInterestingStarIsInStarDataAlready(star) {
    const starData = getStarSystemDataObject('stars');
    return star in starData;
}

export function removeStarConnectionTooltip() {
    const starConnectionLineElement = document.getElementById('star-connection-line');
    const starConnectionLabelElement = document.getElementById('star-connection-label');
    const starConnectionArrowHeadElement = document.getElementById('arrowheadStarship');
    if (starConnectionLineElement) {
        starConnectionLineElement.remove();
    }
    if (starConnectionLabelElement) {
        starConnectionLabelElement.remove();
    }
    if (starConnectionArrowHeadElement) {
        starConnectionArrowHeadElement.remove();
    }
}

export function drawStarConnectionDrawings(fromStar, toStar, isInteresting) {
    if (toStar.name) {
        if (getSettledStars().includes(toStar.name.toLowerCase())) {
            return;
        }
    } else {
        if (getSettledStars().includes(toStar.toLowerCase())) {
            return;
        }
    }

    removeStarConnectionTooltip();

    let lineElement = null;
    let labelElement = null;
    let arrowHead = null;

    if (isInteresting !== 'orbiting') {
        let toStarData;
        let fuelNeeded = 0;
        let apGranted = 0;
    
        if (isInteresting === 'travelling') {
            fromStar = getFromStarObject();
            toStarData = getStarSystemDataObject('stars', [toStar.toLowerCase()]);
            toStar = getToStarObject();
            fuelNeeded = toStarData.fuel;
            apGranted = toStarData.ascendencyPoints;  
        } else if (isInteresting) {
            toStarData = getStarSystemDataObject('stars', [toStar.name.toLowerCase()]);
            fuelNeeded = toStarData.fuel;
            apGranted = toStarData.ascendencyPoints;  
        }
    
        const currentAntimatter = getResourceDataObject('antimatter', ['quantity']);
        const isTravellingLine = isInteresting === 'travelling';
        const canTravel = isInteresting && fuelNeeded <= currentAntimatter;
    
        const themeElement = document.querySelector('[data-theme]') || document.documentElement;
        const themeStyles = getComputedStyle(themeElement);
        const arrowColor = themeStyles.getPropertyValue('--text-color');
        let lineColor = isTravellingLine
            ? arrowColor
            : (canTravel ? themeStyles.getPropertyValue('--ready-text') : themeStyles.getPropertyValue('--disabled-text'));
        const labelColor = lineColor;
    
        const fromPosition = getStarCenterCoordinates(fromStar);
        const toPosition = getStarCenterCoordinates(toStar);

        if (!fromPosition || !toPosition) {
            return;
        }

        const { x: fromX, y: fromY } = fromPosition;
        const { x: toX, y: toY } = toPosition;
    
        const distance = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);
        const angle = Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI);
    
        lineElement = document.createElement('div');
        lineElement.id = 'star-connection-line';
        lineElement.classList.add('star-connection-line');
        lineElement.style.width = `${distance}px`;
        lineElement.style.transform = `rotate(${angle}deg)`;
        lineElement.style.left = `${fromX}px`;
        lineElement.style.top = `${fromY}px`;
    
        if (isTravellingLine || getStarShipTravelling()) {
            lineElement.style.borderTop = `1px dashed ${lineColor}`;
            lineElement.style.background = 'none';
            lineElement.style.maskImage = 'none';
            if (isTravellingLine) {
                lineElement.style.zIndex = '1';
            }
        } else {
            lineElement.style.background = `linear-gradient(to right, 
                transparent 14px, 
                ${lineColor} 14px, 
                ${lineColor} calc(100% - 10px), 
                transparent calc(100% - 10px)
            )`;
        }
    
        if (!(isTravellingLine || getStarShipTravelling())) {
            labelElement = document.createElement('div');
            labelElement.id = 'star-connection-label';
            labelElement.classList.add('star-connection-label');
            const displayAp = isInteresting ? getAscendencyPointsWithRepeatableBonus(apGranted) : null;
            labelElement.innerHTML = isInteresting 
                ? `Antimatter: ${fuelNeeded}<br>AP: ${displayAp}` 
                : `??? <br> ???`;
            labelElement.style.color = labelColor;
            labelElement.style.textAlign = 'center';
            labelElement.style.border = `1px dashed ${labelColor}`;
            labelElement.style.borderRadius = '10px';
        
            const centerX = (fromX + toX) / 2;
            const centerY = (fromY + toY) / 2;
            labelElement.style.left = `${centerX}px`;
            labelElement.style.top = `${centerY}px`;
        } else {
            arrowHead = drawStarShipArrowhead(fromStar, toStar, isInteresting, null);
        }
    }

    let orbitCircle;

    const tooltipLayer = document.getElementById('tooltipLayer') || document.body;

    if (getStarShipStatus()[0] === 'orbiting' && getCurrentTab()[1].includes('Interstellar') && getCurrentOptionPane() === 'star map') {
        orbitCircle = drawOrbitCircle(getToStarObject());
    }

    if (lineElement) {
        tooltipLayer.appendChild(lineElement);
    }
    if (labelElement) {
        tooltipLayer.appendChild(labelElement);
    }
    if (arrowHead) {
        tooltipLayer.appendChild(arrowHead);
    }
    if (orbitCircle) {
        tooltipLayer.appendChild(orbitCircle);
        arrowHead = drawStarShipArrowhead(getFromStarObject(), getToStarObject(), isInteresting, orbitCircle);
        tooltipLayer.appendChild(arrowHead);
    }
}

export function drawOrbitCircle(toStar) {
    removeOrbitCircle();

    const themeElement = document.querySelector('[data-theme]') || document.documentElement;
    const themeStyles = getComputedStyle(themeElement);
    const borderColor = themeStyles.getPropertyValue('--text-color');

    const orbitCircle = document.createElement('div');
    orbitCircle.id = 'orbit-circle';
    orbitCircle.classList.add('orbit-circle');
    orbitCircle.style.position = 'absolute';
    orbitCircle.style.border = `2px dotted ${borderColor}`;
    orbitCircle.style.borderRadius = '50%';
    orbitCircle.style.background = 'transparent';

    const starElement = document.getElementById(toStar.name);
    if (!starElement) return null;

    const starX = starElement.offsetLeft;
    const starY = starElement.offsetTop;
    const starSize = starElement.offsetWidth;
    const orbitSize = starSize * 3;

    orbitCircle.style.width = `${orbitSize}px`;
    orbitCircle.style.height = `${orbitSize}px`;

    const orbitCenterX = starX + starSize / 2;
    const orbitCenterY = starY + starSize / 2;

    orbitCircle.style.left = `${orbitCenterX - orbitSize / 2}px`;
    orbitCircle.style.top = `${orbitCenterY - orbitSize / 2}px`;

    return orbitCircle;
}

export function drawStarShipArrowhead(fromStar, toStar, isInteresting, orbitCircle) {
    document.querySelectorAll('.arrowhead-starship').forEach(arrow => arrow.remove());
    const arrowHead = document.createElement('div');
    arrowHead.id = 'arrowheadStarship';
    arrowHead.classList.add('arrowhead-starship');

    const fromPosition = getStarCenterCoordinates(fromStar);
    const toPosition = getStarCenterCoordinates(toStar);

    if (!fromPosition || !toPosition) {
        return arrowHead;
    }

    const { x: fromX, y: fromY } = fromPosition;
    const { x: toX, y: toY } = toPosition;

    const angle = Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI);

    if ((isInteresting === 'orbiting' || isInteresting === 'readyForTravel') && orbitCircle) {
        const orbitX = orbitCircle.offsetLeft;
        const orbitY = orbitCircle.offsetTop;
        const orbitRadius = orbitCircle.offsetWidth / 2;

        const centerX = orbitX + orbitRadius;
        const centerY = orbitY + orbitRadius;
        const angleDeg = 45;
        const angleRad = (angleDeg * Math.PI) / 180;

        const arrowX = centerX + orbitRadius * Math.cos(angleRad);
        const arrowY = centerY + orbitRadius * Math.sin(angleRad);

        const tangentAngleDeg = angleDeg + 90;
        const arrowSize = 12;

        arrowHead.style.left = `${arrowX - arrowSize / 2}px`;
        arrowHead.style.top = `${arrowY - arrowSize / 2}px`;
        arrowHead.style.transform = `rotate(${tangentAngleDeg}deg)`;
    } else {
        let arrowPosition = getStarShipArrowPosition();
        arrowHead.style.transform = `rotate(${angle + 90}deg)`;
        
        const arrowSize = 12;
        const halfBase = 8;
        
        const arrowX = fromX + (toX - fromX) * arrowPosition;
        const arrowY = fromY + (toY - fromY) * arrowPosition;

        const tipOffsetX = (arrowSize / 2) * Math.cos(angle * (Math.PI / 180));
        const tipOffsetY = (arrowSize / 2) * Math.sin(angle * (Math.PI / 180));

        arrowHead.style.left = `${arrowX - tipOffsetX - halfBase}px`;
        arrowHead.style.top = `${arrowY - tipOffsetY - (arrowSize / 2)}px`; 
    }

    return arrowHead;
}

function getStarCenterCoordinates(star) {
    if (!star) {
        return null;
    }

    const starName = typeof star === 'string'
        ? capitaliseWordsWithRomanNumerals(star)
        : star.name;

    const candidateIds = [
        starName,
        `settledStar${starName}`,
        `noneInterestingStar${starName}`
    ].filter(Boolean);

    let element = null;
    for (const id of candidateIds) {
        element = document.getElementById(id);
        if (element) {
            break;
        }
    }

    if (element) {
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }

    if (star.left !== undefined && star.top !== undefined) {
        const width = star.width ?? 0;
        const height = star.height ?? 0;
        return {
            x: star.left + width,
            y: star.top + height
        };
    }

    return null;
}

export function removeOrbitCircle() {
    const existingOrbitCircle = document.getElementById('orbit-circle');
    if (existingOrbitCircle) {
        existingOrbitCircle.remove();
    }
}

export function sortTechRows(now) {
    if (now) {
        setTechRenderCounter(READY_TO_SORT + NOW);
    } else {
        setTechRenderCounter(READY_TO_SORT);
    }
    setTechRenderChange(true);
}

export function showHideModal() {
    if (getElements().modalContainer.style.display === 'flex') {
        getElements().modalContainer.style.display = 'none';
        getElements().overlay.style.display = 'none';
    } else {
        getElements().modalContainer.style.display = 'flex';
        getElements().overlay.style.display = 'flex';
    }
}

function populateModal(headerText, content) {
    const modalTitle = getElements().modalHeader;
    modalTitle.textContent = headerText;

    const modalContent = getElements().modalContent;
    modalContent.innerHTML = content;
}

async function getUserSaveName() {
    return new Promise((resolve) => {
        const saveNameButton = document.getElementById('modalConfirm');
        const saveNameField = document.getElementById('pioneerCodeName');
        saveNameButton.classList.remove('invisible');
        saveNameButton.innerText = 'CONFIRM';

        const handleSaveNameClick = async () => {
            const userName = saveNameField.value.trim();
            if (userName) {
                setSaveName(userName);
                localStorage.setItem('saveName', getSaveName());
                setOnboardingMode(false);
                saveNameButton.innerText = 'START';
                showHideModal();

                const loadSucceeded = await loadGameFromCloud();
                setShouldPromptOnboarding(!loadSucceeded);

                saveGame('initialise');
                saveNameButton.removeEventListener('click', handleSaveNameClick); // Remove handler after successful input
                resolve();
            } else {
                alert("Please enter a valid code name!");
            }
        };

        saveNameButton.addEventListener('click', handleSaveNameClick);
    });
}


export function getTimeInStatCell() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const timeZoneMap = {
        "GMT": "GMT", // Greenwich Mean Time
        "GMT+1": "CET", // Central European Time
        "GMT+2": "EET", // Eastern European Time
        "GMT+3": "MSK", // Moscow Standard Time
        "GMT+4": "GST", // Gulf Standard Time
        "GMT+5": "PKT", // Pakistan Standard Time
        "GMT+5:30": "IST", // Indian Standard Time
        "GMT+6": "BST", // Bangladesh Standard Time
        "GMT+7": "ICT", // Indochina Time
        "GMT+8": "CST", // China Standard Time
        "GMT+9": "JST", // Japan Standard Time
        "GMT+10": "AEST", // Australian Eastern Standard Time
        "GMT+11": "SBT", // Solomon Islands Time
        "GMT+12": "NZST", // New Zealand Standard Time
        "GMT-1": "AZOT", // Azores Time
        "GMT-2": "GST", // South Georgia Time
        "GMT-3": "BRT", // Brasília Time
        "GMT-4": "AST", // Atlantic Standard Time
        "GMT-5": "EST", // Eastern Standard Time
        "GMT-6": "CST", // Central Standard Time
        "GMT-7": "MST", // Mountain Standard Time
        "GMT-8": "PST", // Pacific Standard Time
        "GMT-9": "AKST", // Alaska Standard Time
        "GMT-10": "HST", // Hawaii Standard Time
        "GMT-11": "NUT", // Niue Time
        "GMT-12": "AoE", // Anywhere on Earth
    };

    const rawTimeZone = Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
        .formatToParts(now)
        .find(part => part.type === 'timeZoneName').value;

    const timeZone = timeZoneMap[rawTimeZone] || rawTimeZone;

    const timeString = `${hours}:${minutes} ${timeZone}`;
    
    //tooltip
    const stat8Element = document.getElementById('stat8');
    if (stat8Element) {
        const statCell = stat8Element.closest('.stat-cell');
        const statLabel = statCell?.querySelector('.stat-label');
        if (statLabel && !statLabel.textContent.trim()) {
            statLabel.textContent = '';
        }

        const runStart = getRunStartTime();
        const totalStart = getGameStartTime();

        const runDuration = formatDurationSince(runStart);
        const totalDuration = formatDurationSince(totalStart);
        const currentRun = getStatRun();

        stat8Element.textContent = timeString;
        stat8Element.dataset.tooltipContent = [
            `<div><strong>${timeString}</strong></div>`,
            `<div>Run: <span class="green-ready-text">${currentRun}</span></div>`,
            `<div>Run Time: <span class="green-ready-text">${runDuration}</span></div>`,
            `<div>Total Time: <span class="green-ready-text">${totalDuration}</span></div>`
        ].join('');
    }
}

function buildEnergyTooltipContent(netText) {
    const timerRatio = getTimerRateRatio() || 1;
    const totalGeneration = (getResourceDataObject('buildings', ['energy', 'rate']) || 0) * timerRatio;
    const totalConsumption = (getTotalEnergyUse() || 0) * timerRatio;
    const infinitePower = getInfinitePower();
    const netRate = infinitePower ? Infinity : totalGeneration - totalConsumption;
    const netClass = infinitePower || netRate > 0 ? 'green-ready-text' : 'red-disabled-text';
    const netDisplay = infinitePower ? '∞ DYSON ∞' : (netText || formatEnergyValue(netRate, true));

    const generatorLines = buildPowerPlantGenerationLines(timerRatio);
    const consumerLines = buildEnergyConsumerLines(timerRatio);

    const generationSubtotalLine = `<div>Total Generated: <span class="green-ready-text">${formatEnergyValue(totalGeneration, true)}</span></div>`;
    const consumptionSubtotalLine = `<div>Total Consumed: <span class="red-disabled-text">${formatEnergyValue(-totalConsumption)}</span></div>`;

    return [
        `<div>Net Energy: <span class="${netClass}">${netDisplay}</span></div>`,
        generationSubtotalLine,
        consumptionSubtotalLine,
        `<div class="tooltip-spacer">&nbsp;</div>`,
        `<div><strong>Generators</strong></div>`,
        generatorLines,
        `<div class="tooltip-spacer">&nbsp;</div>`,
        `<div><strong>Consumers</strong></div>`,
        consumerLines
    ].filter(Boolean).join('');
}

function buildPowerPlantGenerationLines(timerRatio) {
    const plants = [
        { label: 'Basic Power Plant', key: 'powerPlant1' },
        { label: 'Solar Power Plant', key: 'powerPlant2' },
        { label: 'Advanced Power Plant', key: 'powerPlant3' }
    ];

    return plants.map(({ label, key }) => {
        const quantity = getResourceDataObject('buildings', ['energy', 'upgrades', key, 'quantity']) || 0;
        const purchasedRate = getResourceDataObject('buildings', ['energy', 'upgrades', key, 'purchasedRate']) || 0;
        const isOn = getBuildingTypeOnOff(key);
        const generation = (isOn ? purchasedRate : 0) * timerRatio;
        const generationClass = generation > 0 ? 'green-ready-text' : 'red-disabled-text';

        return `<div>${label}: <span class="${generationClass}">${formatEnergyValue(generation, true)}</span> (${quantity.toLocaleString()} online)</div>`;
    }).join('');
}

function buildEnergyConsumerLines(timerRatio) {
    const autoBuyerLines = buildAutoBuyerConsumptionLines(timerRatio);
    const scienceLabLine = buildScienceLabConsumptionLine(timerRatio);
    const spaceTelescopeLine = buildSpaceTelescopeConsumptionLine(timerRatio);
    const rocketLines = buildRocketRefuelLines(timerRatio);

    return [
        autoBuyerLines,
        scienceLabLine,
        spaceTelescopeLine,
        rocketLines
    ].filter(Boolean).join('');
}

function buildAutoBuyerConsumptionLines(timerRatio) {
    const tiers = [2, 3, 4];
    const tierData = tiers.map(tier => ({ tier, count: 0, usage: 0 }));
    const collections = ['resources', 'compounds'];

    collections.forEach(collection => {
        const data = getResourceDataObject(collection);
        if (!data) return;

        Object.keys(data).forEach(key => {
            const autoBuyer = data[key]?.upgrades?.autoBuyer;
            if (!autoBuyer) return;

            tiers.forEach(tier => {
                const tierKey = `tier${tier}`;
                const tierInfo = autoBuyer[tierKey];
                if (!tierInfo || !tierInfo.active) return;

                const quantity = tierInfo.quantity || 0;
                const energyUse = tierInfo.energyUse || 0;
                if (!quantity || !energyUse) return;

                const target = tierData[tier - 2];
                target.count += quantity;
                target.usage += energyUse * quantity;
            });
        });
    });

    return tierData.map(({ tier, count, usage }) => {
        const usageKw = usage * timerRatio;
        const usageClass = usageKw > 0 ? 'red-disabled-text' : 'green-ready-text';
        const countClass = count > 0 ? 'green-ready-text' : 'red-disabled-text';
        return `<div>Tier ${tier} Autobuyers: <span class="${usageClass}">${formatEnergyValue(-usageKw)}</span> (${count.toLocaleString()} active)</div>`;
    }).join('');
}

function buildScienceLabConsumptionLine(timerRatio) {
    const scienceLab = getResourceDataObject('research', ['upgrades', 'scienceLab']) || {};
    const quantity = scienceLab.quantity || 0;
    const energyUse = (scienceLab.energyUse || 0) * quantity * timerRatio;
    const usageClass = energyUse > 0 ? 'red-disabled-text' : 'green-ready-text';
    const quantityClass = quantity > 0 ? 'green-ready-text' : 'red-disabled-text';

    return `<div>Science Labs: <span class="${usageClass}">${formatEnergyValue(-energyUse)}</span> (${quantity.toLocaleString()} active)</div>`;
}

function buildSpaceTelescopeConsumptionLine(timerRatio) {
    const telescope = getResourceDataObject('space', ['upgrades', 'spaceTelescope']);
    if (!telescope || !telescope.spaceTelescopeBoughtYet) {
        return `<div>Space Telescope: <span class="red-disabled-text">Not built</span></div>`;
    }

    let status = 'Idle';
    let usage = 0;

    if (getCurrentlySearchingAsteroid() && getTimeLeftUntilAsteroidScannerTimerFinishes() > 0) {
        status = 'Searching Asteroids';
        usage = telescope.energyUseSearchAsteroid || 0;
    } else if (getCurrentlyInvestigatingStar() && getTimeLeftUntilStarInvestigationTimerFinishes() > 0) {
        status = 'Investigating Stars';
        usage = telescope.energyUseInvestigateStar || 0;
    } else if (getCurrentlyPillagingVoid() && getTimeLeftUntilPillageVoidTimerFinishes() > 0) {
        status = 'Pillaging the Void';
        usage = telescope.energyUsePhilosophyBoostResourcesAndCompounds || 0;
    }

    const usageKw = usage * timerRatio;
    const className = usageKw > 0 ? 'red-disabled-text' : 'green-ready-text';
    const usageText = usageKw > 0 ? formatEnergyValue(-usageKw) : '0 KW / s';

    return `<div>Space Telescope (${status}): <span class="${className}">${usageText}</span></div>`;
}

function buildRocketRefuelLines(timerRatio) {
    const rockets = getRocketsFuellerStartedArray?.() || [];
    const activeRockets = rockets.filter(rocket => !rocket.includes('FuelledUp'));

    if (!activeRockets.length) {
        return `<div>Rocket Refuelling: <span class="green-ready-text">Idle</span></div>`;
    }

    return activeRockets.map(rocketKey => {
        const rocket = getResourceDataObject('space', ['upgrades', rocketKey]);
        const energyUsePerTick = rocket?.autoBuyer?.tier1?.energyUse || 0;
        const usageKw = energyUsePerTick * timerRatio;
        const label = rocketKey.replace('rocket', 'Rocket ');
        return `<div><span class="green-ready-text">${label} Refuel:</span> <span class="red-disabled-text">${formatEnergyValue(-usageKw)}</span></div>`;
    }).join('');
}

function formatEnergyValue(value, isGeneration = false) {
    if (!isFinite(value)) {
        return '∞ DYSON ∞';
    }
    const rounded = Math.round(Math.abs(value));
    const formatted = `${rounded.toLocaleString()} KW / s`;
    if (rounded === 0) {
        return formatted;
    }
    const sign = isGeneration ? '+' : '-';
    return `${sign}${formatted}`;
}

function calculateAndShowBatteryPercentage(hasBattery) {
    if (!hasBattery) {
        return { text: '0%', className: 'red-disabled-text', value: 0 };
    }

    const batteryLevel = Math.round(getBatteryLevel() ?? 0);

    let className = 'green-ready-text';
    if (batteryLevel < 15) {
        className = 'red-disabled-text';
    } else if (batteryLevel < 50) {
        className = 'warning-orange-text';
    } else if (batteryLevel < 70) {
        className = '';
    }

    return { text: `${batteryLevel}%`, className, value: batteryLevel };
}

function buildBatteryTooltipContent() {
    const hasBattery = Boolean(getResourceDataObject('buildings', ['energy', 'batteryBoughtYet']));
    const batteryPercentageInfo = calculateAndShowBatteryPercentage(hasBattery);

    const energyRate = getInfinitePower()
        ? getInfinitePowerRate()
        : getResourceDataObject('buildings', ['energy', 'rate']) || 0;
    const consumption = getResourceDataObject('buildings', ['energy', 'consumption']) || 0;
    const totalCapacity = getResourceDataObject('buildings', ['energy', 'storageCapacity']) || 0;
    const energyQuantity = getResourceDataObject('buildings', ['energy', 'quantity']) || 0;

    let statusText = 'NO BATTERY';
    let statusClass = 'red-disabled-text';

    if (hasBattery) {
        if (energyRate >= consumption) {
            statusText = 'BATTERY CHARGING';
            statusClass = 'green-ready-text';
        } else {
            statusText = 'BATTERY DEPLETING';
            statusClass = 'red-disabled-text';
        }
    }

    const percentageSpan = batteryPercentageInfo.className
        ? `<span class="${batteryPercentageInfo.className}">${batteryPercentageInfo.text}</span>`
        : `<span>${batteryPercentageInfo.text}</span>`;

    const batteryLines = [
        { label: 'Sodium Ion Battery', path: ['energy', 'upgrades', 'battery1', 'quantity'] },
        { label: 'Battery 2', path: ['energy', 'upgrades', 'battery2', 'quantity'] },
        { label: 'Battery 3', path: ['energy', 'upgrades', 'battery3', 'quantity'] }
    ].map(({ label, path }) => {
        const quantity = getResourceDataObject('buildings', path) ?? 0;
        const quantityClass = quantity > 0 ? 'green-ready-text' : 'red-disabled-text';
        return `<div>${label}: <span class="${quantityClass}">${quantity}</span></div>`;
    });

    const capacityMwh = Math.floor(totalCapacity / 1000);
    const totalCapacityLine = `<div>Total Battery Capacity: <span class="green-ready-text">${capacityMwh.toLocaleString()} MWh</span></div>`;

    const depletionInfo = getBatteryDepletionInfo(energyRate, consumption, totalCapacity, energyQuantity, hasBattery);
    const depletionLabel = depletionInfo.mode === 'charging' ? 'Time until Charged:' : 'Time until Depletion:';
    const depletionLine = `<div>${depletionLabel} <span class="${depletionInfo.className}">${depletionInfo.text}</span></div>`;

    return [
        `<div><span class="${statusClass}">${statusText}</span></div>`,
        `<div class="tooltip-spacer">&nbsp;</div>`,
        `<div>Battery Charge: ${percentageSpan}</div>`,
        ...batteryLines,
        `<div class="tooltip-spacer">&nbsp;</div>`,
        totalCapacityLine,
        depletionLine
    ].join('');
}

function getBatteryDepletionInfo(energyRate, consumption, totalCapacity, energyQuantity, hasBattery) {
    const netRate = energyRate - consumption;

    if (!hasBattery || totalCapacity <= 0) {
        return { text: '∞', className: 'green-ready-text', mode: 'neutral' };
    }

    const timerRatio = getTimerRateRatio() || 1;

    if (netRate > 0) {
        const perSecondCharge = netRate * timerRatio;
        if (!perSecondCharge) {
            return { text: '∞', className: 'green-ready-text', mode: 'charging' };
        }

        const missingEnergy = Math.max(0, totalCapacity - energyQuantity);
        const secondsUntilFull = missingEnergy / perSecondCharge;
        const formatted = formatDepletionDuration(secondsUntilFull, true);
        return { ...formatted, mode: 'charging' };
    } else if (netRate < 0) {
        const perSecondDrain = Math.abs(netRate) * timerRatio;
        if (!perSecondDrain) {
            return { text: '∞', className: 'green-ready-text', mode: 'depleting' };
        }

        const secondsUntilEmpty = energyQuantity / perSecondDrain;
        const formatted = formatDepletionDuration(secondsUntilEmpty, false);
        return { ...formatted, mode: 'depleting' };
    }

    return { text: '∞', className: 'green-ready-text', mode: 'neutral' };
}

function formatDepletionDuration(seconds, charging = false) {
    if (!isFinite(seconds) || seconds < 0) {
        return { text: '∞', className: 'green-ready-text' };
    }

    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const parts = [];
    if (hours > 0) {
        parts.push(`${hours}h`);
    }

    if (minutes > 0 || hours > 0) {
        parts.push(`${minutes}m`);
    }

    parts.push(`${secs}s`);
    const formatted = parts.join(' ');

    let className;
    if (charging) {
        className = 'green-ready-text';
    } else {
        className = totalSeconds < 60 ? 'red-disabled-text' : 'warning-orange-text';
    }

    return { text: formatted, className };
}

export function statToolBarCustomizations() {
    const cashStatElement = document.getElementById('cashStat');
    const stat2Element = document.getElementById('stat2');
    const stat3Element = document.getElementById('stat3');
    const stat4Element = document.getElementById('stat4');
    const stat5Element = document.getElementById('stat5');
    const stat6Element = document.getElementById('stat6');
    const stat7Element = document.getElementById('stat7');

    if (cashStatElement) {
        const cashAmount = Math.floor(getResourceDataObject('currency', ['cash']) ?? 0);
        const currencySymbol = getCurrencySymbol();
        const cashDisplay = currencySymbol === '€'
            ? `${cashAmount.toLocaleString()}${currencySymbol}`
            : `${currencySymbol}${cashAmount.toLocaleString()}`;
        cashStatElement.dataset.tooltipContent = `<div>Cash: <span class="green-ready-text">${cashDisplay}</span></div>`;
    }

    if (stat2Element) {
        stat2Element.dataset.tooltipContent = buildEnergyTooltipContent(stat2Element.textContent.trim());
    }

    if (stat3Element) {
        const stat3Text = stat3Element.textContent.trim();
        const stat3Class = determineStatClassColor(stat3Text);
        const plantStatusLines = buildPowerPlantStatusLines();
        stat3Element.dataset.tooltipContent = [
            `<div>Power Status: <span class="${stat3Class}">${stat3Text}</span></div>`,
            `<div class="tooltip-spacer">&nbsp;</div>`,
            plantStatusLines
        ].join('');
    }

    if (stat4Element) {
        stat4Element.dataset.tooltipContent = buildBatteryTooltipContent();
    }

    if (stat5Element) {
        const stat5Text = stat5Element.textContent.trim() || '0';
        const isUnknown = stat5Text === '???';
        const stat5Value = isUnknown ? 0 : (parseInt(stat5Text.replace(/[^\d-]/g, ''), 10) || 0);
        const antimatterClass = stat5Value > 0 ? 'green-ready-text' : 'red-disabled-text';
        const labelText = isUnknown ? '???' : 'Antimatter Fuel';
        const valueClass = isUnknown ? 'red-disabled-text' : antimatterClass;
        stat5Element.dataset.tooltipContent = `<div>${labelText}: <span class="${valueClass}">${stat5Text}</span></div>`;
    }

    if (stat6Element) {
        const stat6Value = parseInt(stat6Element.textContent.replace(/\D/g, ''), 10) || 0;
        const apClass = stat6Value > 0 ? 'green-ready-text' : 'red-disabled-text';
        const apDisplay = stat6Element.textContent.trim() || '0';
        stat6Element.dataset.tooltipContent = `<div>Ascendency Points: <span class="${apClass}">${apDisplay}</span></div>`;
    }

    if (stat7Element) {
        const systemName = capitaliseString(getCurrentStarSystem());
        const stat7Text = stat7Element.textContent.trim();
        const solarOutputMatch = stat7Text.match(/(\d+%)/);
        const solarOutput = solarOutputMatch?.[1] ?? (stat7Text.split(' ')[0] || 'N/A');

        const weatherInfo = getCurrentStarSystemWeatherEfficiency() || [];
        const weatherType = weatherInfo[2];
        const weatherCurrentStarSystemObject = getStarSystemWeather(getCurrentStarSystem());
        const precipitationType = getStarSystemDataObject('stars', [getCurrentStarSystem(), 'precipitationType']) || 'N/A';

        let weatherSymbol = weatherCurrentStarSystemObject?.[weatherType]?.[1] ?? '';
        if (!weatherSymbol) {
            const textParts = stat7Text.split(' ').filter(Boolean);
            weatherSymbol = textParts.length > 1 ? textParts[textParts.length - 1] : '';
            if (!weatherSymbol && stat7Text.length === 1) {
                weatherSymbol = stat7Text;
            }
        }

        let weatherClass = 'warning-orange-text';
        if (weatherType === 'sunny') {
            weatherClass = 'green-ready-text';
        } else if (weatherType === 'volcano') {
            weatherClass = 'red-disabled-text';
        }

        const weatherSymbolHtml = weatherSymbol
            ? `<span class="${weatherClass}">${weatherSymbol}</span>`
            : `<span class="${weatherClass}">N/A</span>`;

        stat7Element.dataset.tooltipContent = [
            `<div>System: <span class="green-ready-text">${systemName}</span></div>`,
                        `<div>Precipitation Type: <span class="green-ready-text">${capitaliseString(precipitationType)}</span></div>`,
            `<div>Solar Energy Output: <span class="${weatherClass}">${solarOutput}</span></div>`,
            `<div>Weather: ${weatherSymbolHtml}</div>`,
        ].join('');
    }
}

function formatDurationSince(timestamp) {
    if (!timestamp) {
        return 'N/A';
    }

    const elapsed = Date.now() - timestamp;
    if (elapsed < 0) {
        return '0s';
    }

    return formatDuration(elapsed);
}

function formatDuration(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
}

function drawStackedBarChart(canvasId, generationValues, consumptionValues, solarPlantMaxPurchasedRate) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    const powerPlant1Status = getBuildingTypeOnOff('powerPlant1');
    const powerPlant2Status = getBuildingTypeOnOff('powerPlant2');
    const powerPlant3Status = getBuildingTypeOnOff('powerPlant3');

    canvas.height = 1000;

    const height = canvas.height - 80;
    const width = canvas.width;

    const axisPadding = 50;
    const maxBarHeight = height - axisPadding;

    let maxValue;

    if (powerPlant2Status) {
        const difference = solarPlantMaxPurchasedRate - generationValues[1];

        const adjustedGenerationValues = [...generationValues];
        if (difference > 0) {
            adjustedGenerationValues[1] = adjustedGenerationValues[1] + difference;
        }

        maxValue = Math.max(
            ...adjustedGenerationValues,
            ...consumptionValues,
            adjustedGenerationValues.reduce((a, b) => a + b, 0),
            consumptionValues.reduce((a, b) => a + b, 0)
        );
    } else {
        maxValue = Math.max(
            ...generationValues,
            ...consumptionValues,
            generationValues.reduce((a, b) => a + b, 0),
            consumptionValues.reduce((a, b) => a + b, 0)
        );
    }

    const textColor = getComputedStyle(canvas).getPropertyValue('--text-color-hex').trim();
    const bgColor = getComputedStyle(canvas).getPropertyValue('--bg-color').trim();

    ctx.clearRect(0, 0, width, height);

    const powerPlantStatus = [powerPlant1Status, powerPlant2Status, powerPlant3Status];
    const generationData = generationValues.map((value, index) => ({
        value,
        status: powerPlantStatus[index],
        originalIndex: index
    }));

    generationData.sort((a, b) => {
        if (a.status === b.status) {
            return a.originalIndex - b.originalIndex;
        }
        return a.status ? -1 : 1;
    });

    const sortedGenerationValues = generationData.map(data => data.value);
    const sortedGenerationStatuses = generationData.map(data => data.status);

    const barWidth = width * 0.3;
    const gap = 10;

    const generationColors = getComputedStyle(canvas).getPropertyValue('--generation-colors').trim().split(',');
    const consumptionColors = getComputedStyle(canvas).getPropertyValue('--consumption-colors').trim().split(',');

    function drawBar(x, values, colors, status, powerOn, barType, solarMaxPurchasedRate) {
        const textColor = getComputedStyle(canvas).getPropertyValue('--text-color').trim();
        let currentY = height - 11;

        values.forEach((value, index) => {
            const barHeight = (value / maxValue) * maxBarHeight;

            if (barType === 'consumption' && !powerOn) {
                ctx.fillStyle = bgColor;
                ctx.fillRect(x, currentY - barHeight, barWidth, barHeight);

                ctx.save();
                ctx.setLineDash([5, 5]);
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 4;
                ctx.strokeRect(x, currentY - barHeight, barWidth, barHeight);
                ctx.restore();
            } else {
                ctx.fillStyle = (status[index] === false) ? bgColor : colors[index];
                ctx.fillRect(x, currentY - barHeight, barWidth, barHeight);

                if (status[index] === false) {
                    ctx.save();
                    ctx.setLineDash([5, 5]);
                    ctx.strokeStyle = textColor;
                    ctx.lineWidth = 4;
                    ctx.strokeRect(x, currentY - barHeight, barWidth, barHeight);
                    ctx.restore();
                }
            }

            currentY -= barHeight;
        });

        if (barType === 'generation') {
            const powerPlant2Index = generationData.findIndex(d => d.originalIndex === 1);
            if (powerPlant2Index !== -1 && getBuildingTypeOnOff('powerPlant2')) {
                const powerPlant2Value = values[powerPlant2Index];
                const solarExtra = Math.max(0, solarMaxPurchasedRate - powerPlant2Value);

                if (solarExtra > 0) {
                    const solarExtraHeight = (solarExtra / maxValue) * maxBarHeight;

                    ctx.save();
                    ctx.setLineDash([5, 5]);
                    ctx.strokeStyle = getStarSystemDataObject('stars', [getCurrentStarSystem(), 'weather', getCurrentStarSystemWeatherEfficiency()[2]])[3];
                    ctx.lineWidth = 4;
                    ctx.strokeRect(x, currentY - solarExtraHeight, barWidth, solarExtraHeight);
                    ctx.restore();

                    ctx.font = '60px Arial';
                    ctx.fillStyle = getStarSystemDataObject('stars', [getCurrentStarSystem(), 'weather', getCurrentStarSystemWeatherEfficiency()[2]])[3];
                    const symbol = getStarSystemDataObject('stars', [getCurrentStarSystem(), 'weather', getCurrentStarSystemWeatherEfficiency()[2]])[1];
                    const textWidth = ctx.measureText(symbol).width;

                    const centerX = x + (barWidth / 2) - (textWidth / 2);
                    const centerY = currentY - solarExtraHeight + 50;

                    ctx.fillText(symbol, centerX, centerY);

                    currentY -= solarExtraHeight;
                }
            }

            if (getInfinitePower()) {
                const infinitePowerValue = getInfinitePowerRate();
                const infiniteBarHeight = (infinitePowerValue / maxValue) * maxBarHeight;

                ctx.fillStyle = 'yellow';
                ctx.fillRect(x, currentY - infiniteBarHeight, barWidth, infiniteBarHeight);

                ctx.font = '30px Arial';
                ctx.fillStyle = 'yellow';
                ctx.fillText('∞', x + (barWidth / 2) - 10, currentY - infiniteBarHeight + 30);

                currentY -= infiniteBarHeight;
            }
        }
    }

    if (getInfinitePower()) {
        const infinitePowerValue = getInfinitePowerRate();
        maxValue = infinitePowerValue;

        drawBar((gap * 6), [infinitePowerValue], ['yellow'], [true], getPowerOnOff(), 'generation', solarPlantMaxPurchasedRate);

        ctx.beginPath();
        ctx.moveTo(0, height - 10);
        ctx.lineTo(width, height - 10);
        ctx.strokeStyle = textColor;
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = 'yellow';
        ctx.font = '30px Arial';

        for (let i = 0; i <= 5; i++) {
            const yPosition = height - (i / 5) * maxBarHeight;
            ctx.fillText('∞', gap * 2, yPosition);
        }

        const genLabelX = (gap * 4) + barWidth / 2 - 10;
        ctx.fillText('Gen.', genLabelX, height + 20);

        return;
    }

    if (generationData.length > 0 && generationData[0].originalIndex === 1) {
        drawBar((gap * 6), sortedGenerationValues, generationColors, sortedGenerationStatuses, getPowerOnOff(), 'generation', solarPlantMaxPurchasedRate);
    } else {
        drawBar((gap * 6), sortedGenerationValues, generationColors, sortedGenerationStatuses, getPowerOnOff(), 'generation', solarPlantMaxPurchasedRate);
    }

    drawBar((gap * 6) + barWidth + gap, consumptionValues, consumptionColors, [true, true, true], getPowerOnOff(), 'consumption', solarPlantMaxPurchasedRate);

    ctx.beginPath();
    ctx.moveTo(0, height - 10);
    ctx.lineTo(width, height - 10);
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.font = '30px Arial';
    ctx.fillStyle = textColor;

    const labelSpacing = maxValue / 5;
    for (let i = 0; i <= 5; i++) {
        const labelValue = labelSpacing * i;
        const yPosition = height - (labelValue / maxValue) * maxBarHeight;

        if (labelValue === 0) {
            ctx.fillStyle = 'transparent';
        } else {
            ctx.fillStyle = textColor;
        }

        ctx.fillText(labelValue.toFixed(0), gap * 2, yPosition);
    }

    const genLabelX = (gap * 4) + barWidth / 2 - 10;
    const consLabelX = (gap * 4) + barWidth * 1.5 + gap - 10;

    ctx.fillText('Gen.', genLabelX, height + 20);
    ctx.fillText('Con.', consLabelX, height + 20);
}

export function removeAllIndicatorIcons(iconText = '⚠️', indicatorClass = 'attention-indicator') {
    const indicators = document.querySelectorAll(`.${indicatorClass}`);
    indicators.forEach(indicator => {
        if (indicator.innerHTML.includes(iconText)) {
            indicator.remove();
        }
    });
}

function syncResourceSidebarVisibility() {
    const unlockedResources = getUnlockedResourcesArray();
    const resourceKeys = ['hydrogen', 'helium', 'carbon', 'neon', 'oxygen', 'sodium', 'silicon', 'iron'];

    resourceKeys.forEach(resourceKey => {
        const optionElement = document.getElementById(`${resourceKey}Option`);
        const row = optionElement?.closest('.row-side-menu');
        if (!row) return;

        const shouldBeVisible = resourceKey === 'hydrogen' || unlockedResources.includes(resourceKey);
        if (shouldBeVisible) {
            row.classList.remove('invisible');
        } else {
            row.classList.add('invisible');
            if (optionElement) {
                removeAttentionIndicator(optionElement);
            }
        }
    });
}

export function updateDynamicUiContent() {
    syncResourceSidebarVisibility();

    if (!document.getElementById('energyConsumptionStats').classList.contains('invisible')) {
        const powerPlant1PurchasedRate = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'purchasedRate']);
        const powerPlant2PurchasedRate = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'purchasedRate']);
        const solarPlantMaxPurchasedRate = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'maxPurchasedRate']) * getTimerRateRatio();
        const powerPlant3PurchasedRate = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'purchasedRate']);

        const powerConsumption = getResourceDataObject('buildings', ['energy', 'consumption']);
        
        const generationValues = [powerPlant1PurchasedRate * getTimerRateRatio(), powerPlant2PurchasedRate * getTimerRateRatio(), powerPlant3PurchasedRate * getTimerRateRatio()];
        const consumptionValues = [powerConsumption * getTimerRateRatio()];
        drawStackedBarChart('powerGenerationConsumptionChart', generationValues, consumptionValues, solarPlantMaxPurchasedRate);
    }

    updateSidebarStatusDisplays();

    if (getCurrentOptionPane() !== 'star map') {
        removeStarConnectionTooltip();
    }
}

const sidebarStatusHighlightClasses = ['green-ready-text', 'red-disabled-text', 'warning-orange-text'];

const rocketSidebarStatusEntries = ['rocket1', 'rocket2', 'rocket3', 'rocket4'].map(rocketKey => ({
    elementId: `${rocketKey}PartsQuantity`,
    builder: () => buildRocketSidebarStatus(rocketKey)
}));

const launchPadSidebarStatusEntries = [
    {
        elementId: 'launchPadOption2',
        builder: buildLaunchPadSidebarStatus
    }
];

const starShipSidebarStatusEntries = [
    {
        elementId: 'starShipOption2',
        builder: buildStarShipSidebarStatus
    }
];

const galacticMarketSidebarStatusEntries = [
    {
        elementId: 'galacticMarketOption2',
        builder: buildGalacticMarketSidebarStatus
    }
];

// Add the megastructure sidebar status entry
const megastructureSidebarStatusEntry = {
    elementId: 'megastructuresOption2',
    builder: buildMegastructuresSidebarStatus
};

const sidebarStatusUpdaters = [
    {
        elementId: 'spaceTelescopeOption2',
        builder: buildSpaceTelescopeSidebarStatus
    },
    ...rocketSidebarStatusEntries,
    ...launchPadSidebarStatusEntries,
    ...starShipSidebarStatusEntries,
    ...galacticMarketSidebarStatusEntries,
    megastructureSidebarStatusEntry  // Add the megastructure status
];

function updateSidebarStatusDisplays() {
    sidebarStatusUpdaters.forEach(({ elementId, builder }) => {
        const element = document.getElementById(elementId);
        if (!element || typeof builder !== 'function') {
            return;
        }

        const result = builder();
        const text = result?.text ?? '';
        const className = result?.className ?? '';
        const html = result?.html;

        if (typeof html === 'string') {
            if (element.innerHTML !== html) {
                element.innerHTML = html;
            }
        } else if (element.textContent !== text) {
            element.textContent = text;
        }

        sidebarStatusHighlightClasses.forEach(highlightClass => {
            if (className === highlightClass) {
                element.classList.add(highlightClass);
            } else {
                element.classList.remove(highlightClass);
            }
        });
    });
}

function buildSpaceTelescopeSidebarStatus() {
    const optionElement = document.getElementById('spaceTelescopeOption');
    const optionRow = optionElement?.closest('.row-side-menu');
    if (optionRow?.classList.contains('invisible')) {
        return { text: '', className: '' };
    }

    const telescopeData = getResourceDataObject('space', ['upgrades', 'spaceTelescope']);
    if (!telescopeData?.spaceTelescopeBoughtYet) {
        return { text: 'Not Built', className: 'red-disabled-text' };
    }

    const activeTasks = [
        {
            isActive: () => getCurrentlySearchingAsteroid() && (getTimeLeftUntilAsteroidScannerTimerFinishes() > 0),
            label: 'Scanning Asteroids'
        },
        {
            isActive: () => getCurrentlyInvestigatingStar() && (getTimeLeftUntilStarInvestigationTimerFinishes() > 0),
            label: 'Studying Stars'
        },
        {
            isActive: () => getCurrentlyPillagingVoid() && (getTimeLeftUntilPillageVoidTimerFinishes() > 0),
            label: 'Pillaging The Void'
        }
    ];

    const activeTask = activeTasks.find(task => task.isActive());

    if (!activeTask) {
        return { text: 'Idle', className: '' };
    }

    if (!getPowerOnOff()) {
        return { text: 'No Power', className: 'red-disabled-text' };
    }

    return { text: activeTask.label, className: 'green-ready-text' };
}

const rocketStatusClassMap = {
    'Not Built': 'red-disabled-text',
    'Ready For Refuel': 'green-ready-text',
    'Fuelling': 'warning-orange-text',
    'Ready To Fuel': 'green-ready-text',
    'Ready For Launch': 'green-ready-text',
    'Select Destination': 'warning-orange-text',
    'Travelling': 'green-ready-text',
    'Mining': 'green-ready-text',
    'Returning': 'green-ready-text',
    'Idle': ''
};

function buildRocketSidebarStatus(rocketKey) {
    const statusElement = document.getElementById(`${rocketKey}PartsQuantity`);
    const optionRow = statusElement?.closest('.row-side-menu');
    if (optionRow?.classList.contains('invisible')) {
        return { text: '', className: '' };
    }

    const builtRockets = getRocketsBuilt() || [];
    if (!builtRockets.includes(rocketKey)) {
        return { text: 'Not Built', className: rocketStatusClassMap['Not Built'] };
    }

    const fuelingEntries = getRocketsFuellerStartedArray() || [];
    const launched = (getLaunchedRockets() || []).includes(rocketKey);
    const miningTarget = (getMiningObject() || {})[rocketKey];
    const isTravelling = getCurrentlyTravellingToAsteroid(rocketKey);
    const isReturning = isTravelling && !!getRocketDirection(rocketKey);
    const destination = getDestinationAsteroid(rocketKey);

    if (miningTarget) {
        return { text: 'Mining', className: rocketStatusClassMap['Mining'] };
    }

    if (isTravelling) {
        const status = isReturning ? 'Returning' : 'Travelling';
        return { text: status, className: rocketStatusClassMap[status] };
    }

    if (launched) {
        if (destination) {
            return { text: 'Ready To Travel', className: 'green-ready-text' };
        }

        return { text: 'Select Destination', className: rocketStatusClassMap['Select Destination'] };
    }

    if (fuelingEntries.includes(rocketKey)) {
        return { text: 'Fuelling', className: rocketStatusClassMap['Fuelling'] };
    }

    if (fuelingEntries.includes(`${rocketKey}FuelledUp`)) {
        return { text: 'Ready For Launch', className: rocketStatusClassMap['Ready For Launch'] };
    }

    if (!fuelingEntries.includes(rocketKey) && !fuelingEntries.includes(`${rocketKey}FuelledUp`) && destination) {
        return { text: 'Ready To Travel', className: 'green-ready-text' };
    }

    if (!fuelingEntries.length) {
        return { text: 'Ready For Refuel', className: rocketStatusClassMap['Ready For Refuel'] };
    }

    return { text: 'Idle', className: rocketStatusClassMap['Idle'] };
}

const starShipStatusClassMap = {
    'Not Built': 'red-disabled-text',
    'Ready To Depart': 'green-ready-text',
    'Travelling': 'green-ready-text',
    'Orbiting Destination': 'green-ready-text',
    'Colonised Destination': 'green-ready-text'
};

const galacticMarketResourceKeys = ['hydrogen', 'helium', 'carbon', 'neon', 'oxygen', 'sodium', 'silicon', 'iron'];
const galacticMarketCompoundKeys = ['diesel', 'glass', 'steel', 'concrete', 'water', 'titanium'];

const GALACTIC_BIAS_GREEN_THRESHOLD = 3;
const GALACTIC_BIAS_ORANGE_THRESHOLD = 10;

function formatMarketBiasValue(bias) {
    if (typeof bias !== 'number' || Number.isNaN(bias)) {
        return '--';
    }

    const absolute = Math.abs(bias);
    const decimals = absolute >= 10 ? 0 : 1;
    const formatted = bias.toFixed(decimals);
    return `${bias > 0 ? '+' : ''}${formatted}%`;
}

function getMarketTypeForItem(item) {
    if (!item || item === 'select') {
        return null;
    }

    if (galacticMarketResourceKeys.includes(item)) {
        return 'resources';
    }

    if (galacticMarketCompoundKeys.includes(item)) {
        return 'compounds';
    }

    return null;
}

function getMarketBiasValue(item) {
    const type = getMarketTypeForItem(item);
    if (!type) {
        return null;
    }

    const bias = getGalacticMarketDataObject(type, [item, 'marketBias']);
    return typeof bias === 'number' ? bias : 0;
}

function getBiasSeverityClass(bias) {
    if (typeof bias !== 'number' || Number.isNaN(bias)) {
        return 'green-ready-text';
    }

    const magnitude = Math.abs(bias);
    if (magnitude <= GALACTIC_BIAS_GREEN_THRESHOLD) {
        return 'green-ready-text';
    }

    if (magnitude <= GALACTIC_BIAS_ORANGE_THRESHOLD) {
        return 'warning-orange-text';
    }

    return 'red-disabled-text';
}

function buildBiasHtmlSegment(label, bias) {
    if (bias === null) {
        return '';
    }

    const className = getBiasSeverityClass(bias);
    return `<span class="${className}">${label}:${formatMarketBiasValue(bias)}</span>`;
}

function getMarketTooltipSection(sectionKey, item, bias) {
    const type = getMarketTypeForItem(item);
    if (!type) {
        return '';
    }

    const isOutgoing = sectionKey === 'Outgoing';
    const title = isOutgoing ? galacticMarketTooltipDescriptions.outgoingTitle : galacticMarketTooltipDescriptions.incomingTitle;

    const baseValue = getGalacticMarketDataObject(type, [item, 'baseValue']) ?? 0;
    const tradeVolume = getGalacticMarketDataObject(type, [item, 'tradeVolume']) ?? 0;
    const adjustedPrice = Math.max(0, baseValue * (1 + (bias / 100)));
    const biasClass = getBiasSeverityClass(bias);

    return [
        '<div class="tooltip-section">',
        `<div class="tooltip-heading">${title}</div>`,
        `<div><strong>Item:</strong> ${capitaliseString(item)}</div>`,
        `<div>Bias: <span class="${biasClass}">${formatMarketBiasValue(bias)}</span></div>`,
        `<div>Base Price: ${baseValue.toFixed(2)}</div>`,
        `<div>Adjusted Price: ${adjustedPrice.toFixed(2)}</div>`,
        `<div>Trade Volume: ${tradeVolume.toLocaleString()}</div>`,
        '</div>'
    ].join('');
}

function buildBiasExplanation(outgoingBias, incomingBias) {
    const sections = [];

    if (outgoingBias !== null) {
        sections.push([
            '<div class="tooltip-section">',
            `<div class="tooltip-heading">${galacticMarketTooltipDescriptions.outgoingTitle}</div>`,
            `<div class="tooltip-body">${galacticMarketTooltipDescriptions.outgoingText}</div>`,
            '</div>'
        ].join(''));
    }

    if (incomingBias !== null) {
        sections.push([
            '<div class="tooltip-section">',
            `<div class="tooltip-heading">${galacticMarketTooltipDescriptions.incomingTitle}</div>`,
            `<div class="tooltip-body">${galacticMarketTooltipDescriptions.incomingText}</div>`,
            '</div>'
        ].join(''));
    }

    if (outgoingBias !== null && incomingBias !== null) {
        const outgoingMagnitude = Math.abs(outgoingBias);
        const incomingMagnitude = Math.abs(incomingBias);
        let comparisonText = galacticMarketTooltipDescriptions.comparisonBalanced;

        if (outgoingMagnitude > incomingMagnitude) {
            comparisonText = galacticMarketTooltipDescriptions.comparisonHigherOutgoing;
        } else if (incomingMagnitude > outgoingMagnitude) {
            comparisonText = galacticMarketTooltipDescriptions.comparisonHigherIncoming;
        }

        sections.push([
            '<div class="tooltip-section">',
            `<div class="tooltip-heading">${galacticMarketTooltipDescriptions.comparisonTitle}</div>`,
            `<div class="tooltip-body">${comparisonText}</div>`,
            '</div>'
        ].join(''));
    }

    return sections.join('');
}

function deriveMarketBiasClass(bias) {
    if (typeof bias !== 'number' || Number.isNaN(bias)) {
        return '';
    }

    return getBiasSeverityClass(bias);
}

function buildGalacticMarketSidebarStatus() {
    const statusElement = document.getElementById('galacticMarketOption2');
    const optionRow = statusElement?.closest('.row-side-menu');
    if (!statusElement || optionRow?.classList.contains('invisible')) {
        return { text: '', className: '' };
    }

    attachSharedTooltip(statusElement, () => statusElement.dataset.galacticTooltipContent || '');

    const outgoingSelection = getGalacticMarketOutgoingStockType();
    const incomingSelection = getGalacticMarketIncomingStockType();
    const outgoingBias = getMarketBiasValue(outgoingSelection);
    const incomingBias = getMarketBiasValue(incomingSelection);

    if (outgoingBias === null && incomingBias === null) {
        delete statusElement.dataset.galacticTooltipContent;
        return { text: 'Bias --', className: '' };
    }

    const textSegments = [];
    const htmlSegments = [];
    const tooltipSegments = [];

    if (outgoingBias !== null) {
        textSegments.push(`O:${formatMarketBiasValue(outgoingBias)}`);
        htmlSegments.push(buildBiasHtmlSegment('O', outgoingBias));
        tooltipSegments.push(getMarketTooltipSection('Outgoing', outgoingSelection, outgoingBias));
    }

    if (incomingBias !== null) {
        textSegments.push(`I:${formatMarketBiasValue(incomingBias)}`);
        htmlSegments.push(buildBiasHtmlSegment('I', incomingBias));
        tooltipSegments.push(getMarketTooltipSection('Incoming', incomingSelection, incomingBias));
    }

    const explanation = buildBiasExplanation(outgoingBias, incomingBias);
    const tooltipContent = [...tooltipSegments];
    if (explanation) {
        tooltipContent.push(explanation);
    }

    statusElement.dataset.galacticTooltipContent = tooltipContent.join('<div class="tooltip-spacer">&nbsp;</div>');

    return {
        text: `Bias ${textSegments.join(' | ')}`,
        html: `Bias ${htmlSegments.join(' | ')}`,
        className: deriveMarketBiasClass((() => {
            if (outgoingBias !== null && incomingBias !== null) {
                return Math.abs(outgoingBias) >= Math.abs(incomingBias) ? outgoingBias : incomingBias;
            }
            return outgoingBias ?? incomingBias;
        })())
    };
}

function buildMegastructuresSidebarStatus() {
    const statusElement = document.getElementById('megastructuresOption2');
    const optionRow = statusElement?.closest('.row-side-menu');
    if (optionRow?.classList.contains('invisible')) {
        return { text: '', className: '' };
    }

    const megastructures = [
        { 
            id: 1, 
            name: 'Dyson Sphere',
            techs: [
                'Dyson Sphere Understanding',
                'Dyson Sphere Capabilities',
                'Dyson Sphere Disconnect',
                'Dyson Sphere Power',
                'Dyson Sphere Connect'
            ]
        },
        { 
            id: 2, 
            name: 'Celestial Processing Core',
            techs: [
                'CPC Understanding',
                'CPC Capabilities',
                'CPC Disconnect',
                'CPC Power',
                'CPC Connect'
            ]
        },
        { 
            id: 3, 
            name: 'Plasma Forge',
            techs: [
                'Plasma Forge Understanding',
                'Plasma Forge Capabilities',
                'Plasma Forge Disconnect',
                'Plasma Forge Power',
                'Plasma Forge Connect'
            ]
        },
        { 
            id: 4, 
            name: 'Galactic Memory Archive',
            techs: [
                'GMA Understanding',
                'GMA Capabilities',
                'GMA Disconnect',
                'GMA Power',
                'GMA Connect'
            ]
        }
    ];

    const capturedMegastructures = getMegaStructuresInPossessionArray() || [];
    const totalMegastructures = megastructures.length;
    
    const capturedCount = megastructures.filter(ms => 
        capturedMegastructures.some(item => 
            typeof item === 'string' ? item === ms.name : item === ms.id
        )
    ).length;

    let tooltipContent = '<div class="tooltip-section">';
    tooltipContent += '<div class="tooltip-heading">Megastructures Status</div><br>';

    const captured = [];
    const notCaptured = [];
    
    megastructures.forEach(ms => {
        const isCaptured = capturedMegastructures.some(item => 
            typeof item === 'string' ? item === ms.name : item === ms.id
        );
        if (isCaptured) {
            captured.push(ms);
        } else {
            notCaptured.push(ms);
        }
    });

    if (captured.length > 0) {
        tooltipContent += '<div class="tooltip-subheading">Captured Megastructures:</div>';
        captured.forEach(ms => {
        const statusClass = 'green-ready-text';
        
        tooltipContent += `<div class="megastructure-status ${statusClass}">`;
        tooltipContent += `<strong>${ms.name}:</strong> Captured`;
        
        const techsResearched = getMegaStructureTechsResearched() || [];
        ms.techs.forEach((techName, index) => {
            const techId = index + 1;
            const isResearched = techsResearched.some(([msId, tId]) => 
                msId === ms.id && tId === techId
            );
            const techStatus = isResearched ? '✓' : '✗';
            const techClass = isResearched ? 'green-ready-text' : 'red-disabled-text';
            tooltipContent += `<div class="tech-status ${techClass}" style="margin-left: 10px;">`;
            tooltipContent += `${techName}: ${techStatus}`;
            tooltipContent += '</div>';
        });
        
        tooltipContent += '</div>';
        });
    }

    if (captured.length > 0 && notCaptured.length > 0) {
        tooltipContent += '<br>';
    }

    if (notCaptured.length > 0) {
        tooltipContent += '<div class="tooltip-subheading">Non-Captured Megastructures:</div>';
        notCaptured.forEach(ms => {
            const statusClass = 'red-disabled-text';
            
            tooltipContent += `<div class="megastructure-status ${statusClass}">`;
            tooltipContent += `<strong>${ms.name}:</strong> Not Captured`;
            
            const techsResearched = getMegaStructureTechsResearched() || [];
            ms.techs.forEach((techName, index) => {
                const techId = index + 1;
                const isResearched = techsResearched.some(([msId, tId]) => 
                    msId === ms.id && tId === techId
                );
                const techStatus = isResearched ? '✓' : '✗';
                const techClass = isResearched ? 'green-ready-text' : 'red-disabled-text';
                tooltipContent += `<div class="tech-status ${techClass}" style="margin-left: 10px;">`;
                tooltipContent += `${techName}: ${techStatus}`;
                tooltipContent += '</div>';
            });
            
            tooltipContent += '</div>';
        });
    }

    tooltipContent += '</div>';

    // Store tooltip content in data attribute
    statusElement.dataset.megastructureTooltipContent = tooltipContent;

    // Set up tooltip if not already done
    if (!statusElement.dataset.tooltipInitialized) {
        attachSharedTooltip(statusElement, () => statusElement.dataset.megastructureTooltipContent || '');
        statusElement.dataset.tooltipInitialized = 'true';
    }

    const text = `Captured: ${capturedCount}/${totalMegastructures}`;
    return {
        text: text,
        html: `<div style="text-align: center;">${text}</div>`,
        className: capturedCount > 0 ? 'green-ready-text' : ''
    };
}

function buildStarShipSidebarStatus() {
    const statusElement = document.getElementById('starShipOption2');
    const optionRow = statusElement?.closest('.row-side-menu');
    if (!statusElement || optionRow?.classList.contains('invisible')) {
        return { text: '', className: '' };
    }

    if (!getStarShipBuilt()) {
        return { text: 'Not Built', className: starShipStatusClassMap['Not Built'] };
    }

    const [starShipState] = getStarShipStatus() || [];

    if (getRebirthPossible()) {
        return { text: 'Colonised', className: starShipStatusClassMap['Colonised Destination'] };
    }

    if (starShipState === 'orbiting') {
        const destination = (getStarShipStatus() || [])[1];
        const destinationText = destination
            ? `Orbiting ${capitaliseWordsWithRomanNumerals(destination)}`
            : 'Orbiting Destination';
        return { text: destinationText, className: starShipStatusClassMap['Orbiting Destination'] };
    }

    if (starShipState === 'travelling' || getStarShipTravelling()) {
        return { text: 'Travelling', className: starShipStatusClassMap['Travelling'] };
    }

    if (starShipState === 'readyForTravel') {
        return { text: 'Ready To Depart', className: starShipStatusClassMap['Ready To Depart'] };
    }

    return { text: 'Ready To Depart', className: starShipStatusClassMap['Ready To Depart'] };
}

function drawLeftSideOfAntimatterSvg(asteroidsArray, rocketData, svgElement, svgNS) {
    Array.from(svgElement.children).forEach(child => {
        if (child.id !== 'svgRateBar' && child.id !== 'svgRightScaleContainer') {
            svgElement.removeChild(child);
        }
    });

    const rockets = ["Rocket 1", "Rocket 2", "Rocket 3", "Rocket 4"];
    const numRockets = rockets.length;

    const svgWidth = svgElement.clientWidth;
    const svgHeight = svgElement.clientHeight;
    const boxWidth = svgWidth * 0.4;
    const leftOffset = svgWidth * 0.1;
    const rightOffset = svgWidth * 0.65;
    const verticalSpacing = svgHeight / (numRockets + 1);
    const boxHeight = verticalSpacing * 0.8;

    let lineClasses = [
        getMiningObject().rocket1 === "refuel" ? "warning-text" : (getMiningObject().rocket1 ? "ready-text" : "disabled-text"),
        getMiningObject().rocket2 === "refuel" ? "warning-text" : (getMiningObject().rocket2 ? "ready-text" : "disabled-text"),
        getMiningObject().rocket3 === "refuel" ? "warning-text" : (getMiningObject().rocket3 ? "ready-text" : "disabled-text"),
        getMiningObject().rocket4 === "refuel" ? "warning-text" : (getMiningObject().rocket4 ? "ready-text" : "disabled-text")
    ];       

    const titleContainer = document.createElementNS(svgNS, "foreignObject");
    titleContainer.setAttribute("x", "0px");
    titleContainer.setAttribute("y", "0");
    titleContainer.setAttribute("width", svgWidth);
    titleContainer.setAttribute("height", "60");

    const titleDiv = document.createElement("div");
    titleDiv.style.width = "100%";
    titleDiv.style.height = "100%";
    titleDiv.style.display = "flex";
    titleDiv.style.alignItems = "center";
    titleDiv.style.justifyContent = "center";
    titleDiv.style.fontSize = "36px";
    titleDiv.style.fontWeight = "bold";
    titleDiv.style.color = "var(--text-color)";
    titleDiv.style.fontFamily = "var(--font-family)";
    titleDiv.style.textAlign = "center";
    titleDiv.innerHTML = "Antimatter Mining";

    titleContainer.appendChild(titleDiv);
    svgElement.appendChild(titleContainer);

    let topMostY = null;
    let bottomMostY = null;

    rockets.forEach((rocket, index) => {
        const lineClass = lineClasses[index % lineClasses.length];

        const yOffset = verticalSpacing * (index + 1) - boxHeight / 2;
        if (topMostY === null) topMostY = yOffset;
        bottomMostY = yOffset + boxHeight;
    
        let rocketInfo = rocketData[(rocket.slice(0, rocket.length - 2) + (index + 1)).toLowerCase()];

        let asteroid;
        if (rocketInfo) {
            asteroid = asteroidsArray.find(asteroidObj => asteroidObj[rocketInfo[1]])[rocketInfo[1]];
        } else {
            asteroid = null;
        }

        let textLines = rocketInfo ? [
            ['', (() => {
                const name = getRocketUserName('rocket' + (index + 1));
                const spaceIdx = name.indexOf(' ');
                if (spaceIdx > 0) return name.slice(0, spaceIdx) + '...';
                return name.length > 13 ? name.slice(0, 13) + '...' : name;
            })()],
            ["Asteroid:", (() => {
                const name = rocketInfo[1];
                const spaceIdx = name.indexOf(' ');
                if (spaceIdx > 0) return name.slice(0, spaceIdx) + '...';
                return name.length > 13 ? name.slice(0, 13) + '...' : name;
            })()],           
            ["Complexity:", rocketInfo[2]],
            ["Antimatter Left:", Math.floor(rocketInfo[4])]
        ] : [
            ['', `Rocket ${index + 1}`],
            [getMiningObject()[`rocket${index + 1}`] === 'refuel' ? "Requires Refuelling" : "Not at Asteroid", ""],
            ["", ""],
            ["", ""]
        ];

        let easeOfExtractionColorClass;

        if (asteroid) {
            switch (asteroid.easeOfExtraction[1]) {
                case 'warning-orange-text':
                    easeOfExtractionColorClass = 'warning-text';
                    break;
                case 'red-disabled-text':
                    easeOfExtractionColorClass = 'disabled-text';
                    break;
                case 'green-ready-text':
                    easeOfExtractionColorClass = 'ready-text';
                    break;
                default:
                    easeOfExtractionColorClass = 'var(--text-color)';
                    break;
            }
        }
    
        const table = document.createElementNS(svgNS, "foreignObject");
        table.setAttribute("x", leftOffset);
        table.setAttribute("y", yOffset);
        table.setAttribute("width", boxWidth);
        table.setAttribute("height", boxHeight);
    
        const div = document.createElement("div");
        div.style.border = `2px solid var(--${lineClass})`;
        div.style.borderRadius = "10px";
        div.style.padding = "5px 10px 10px 10px";
        div.style.width = "100%";
        div.style.height = "100%";
        div.style.boxSizing = "border-box";
    
        const htmlTable = document.createElement("table");
        htmlTable.style.width = "100%";
    
        textLines.forEach(([label, value], rowIndex) => {
            const row = document.createElement("tr");
    
            const labelCell = document.createElement("td");
            labelCell.innerHTML = label;
            labelCell.style.fontWeight = "bold";
            labelCell.style.textAlign = "left";
            row.appendChild(labelCell);
    
            const valueCell = document.createElement("td");
            valueCell.innerHTML = value;
            valueCell.style.textAlign = "left";

            if (value instanceof HTMLElement) { 
                valueCell.innerHTML = ""; 
                valueCell.appendChild(value);
            } else {
                valueCell.innerHTML = value;
            }
    
            if (label === "Not at Asteroid") {
                labelCell.style.color = label === "Not at Asteroid" 
                    ? "var(--disabled-text)" 
                    : "var(--warning-text)";
            } else {
                valueCell.innerHTML = value;
            }

            let antimatterColorClass = 'var(--text-color)';
            
            if (asteroid) {
                antimatterColorClass = asteroid.quantity[1];
            }

            if (rowIndex < 2) {
                valueCell.style.color = `var(--${lineClass})`;
            } else if (rowIndex === 2) {
                valueCell.style.color = `var(--${easeOfExtractionColorClass})`;
            } else if (rowIndex === 3) {
                valueCell.style.color = `var(--${antimatterColorClass})`;
            }
    
            row.appendChild(valueCell);
            htmlTable.appendChild(row);
        });
    
        div.appendChild(htmlTable);
        table.appendChild(div);
        svgElement.appendChild(table);
    
        const centerY = yOffset + boxHeight / 2.5;
        const boxRightX = leftOffset + boxWidth;
        const lineEndX = rightOffset;

        const marker = document.createElementNS(svgNS, "marker");
        marker.setAttribute("id", `arrow${index}`);
        marker.setAttribute("markerWidth", "10");
        marker.setAttribute("markerHeight", "7");
        marker.setAttribute("refX", "10");
        marker.setAttribute("refY", "3.5");
        marker.setAttribute("orient", "auto");
        marker.setAttribute("markerUnits", "strokeWidth");
    
        const arrowPath = document.createElementNS(svgNS, "path");
        arrowPath.setAttribute("d", "M0,0 L10,3.5 L0,7");
        arrowPath.setAttribute("fill", "var(--" + lineClass + ")");
        marker.appendChild(arrowPath);
        svgElement.appendChild(marker);
    
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", boxRightX);
        line.setAttribute("y1", centerY);
        line.setAttribute("x2", lineEndX);
        line.setAttribute("y2", centerY);
        line.setAttribute("stroke", "var(--" + lineClass + ")");
        line.setAttribute("stroke-width", "2");
        line.setAttribute("marker-end", `url(#arrow${index})`);
    
        svgElement.appendChild(line);

        const label = document.createElementNS(svgNS, "text");
        label.setAttribute("x", (boxRightX + lineEndX) / 2);
        label.setAttribute("y", centerY - 10);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("fill", "var(--" + lineClass + ")");
        label.setAttribute("font-size", "14");
        if (rocketInfo && !getIsAntimatterBoostActive()) {
            label.innerHTML = `${(rocketInfo[3] * (1 + (getBuffEnhancedMiningData().boughtYet * getBuffEnhancedMiningData().effectCategoryMagnitude)) * getTimerRateRatio()).toFixed(2)} / s`;
        } else if (rocketInfo && getIsAntimatterBoostActive()) {
            label.innerHTML = `${(rocketInfo[3] * (1 + (getBuffEnhancedMiningData().boughtYet * getBuffEnhancedMiningData().effectCategoryMagnitude)) * getTimerRateRatio() * getBoostRate()).toFixed(2)} / s`;
        } else {
            label.innerHTML = '0 / s';
        }

        svgElement.appendChild(label);
    });
    return [topMostY, bottomMostY, rightOffset, boxWidth, boxHeight];
}

export async function drawAntimatterFlowDiagram(rocketData, svgElement) {
    const asteroidsArray = getAsteroidArray();
    const svgNS = "http://www.w3.org/2000/svg";
    let topMostY = 0;
    let bottomMostY = 0;
    let rightOffset = 0;
    let boxWidth = 0;
    let boxHeight = 0;

    if (!getHasAntimatterSvgRightBoxDataChanged(svgElement)) {
        [topMostY, bottomMostY, rightOffset, boxWidth, boxHeight] = drawLeftSideOfAntimatterSvg(asteroidsArray, rocketData, svgElement, svgNS);
        return;
    }  else {
        [topMostY, bottomMostY, rightOffset, boxWidth, boxHeight] = drawLeftSideOfAntimatterSvg(asteroidsArray, rocketData, svgElement, svgNS);
    }
    
    const rightBoxHeight = bottomMostY - topMostY;

    const rightBox = document.createElementNS(svgNS, "foreignObject");
    rightBox.setAttribute("x", rightOffset);
    rightBox.setAttribute("y", topMostY);
    rightBox.setAttribute("width", boxWidth / 2);
    rightBox.setAttribute("height", rightBoxHeight);
    rightBox.setAttribute("id", 'svgRateBar');

    const boostTextContainer = document.createElement("div");
    boostTextContainer.style.position = "absolute";
    boostTextContainer.style.top = "10px";
    boostTextContainer.style.left = "50%";
    boostTextContainer.style.transform = "translateX(-50%)";
    boostTextContainer.style.textAlign = "center";
    boostTextContainer.style.color = "var(--text-color)";
    boostTextContainer.style.fontSize = "20px";
    boostTextContainer.style.fontWeight = "bold";
    setElementPointerEvents(boostTextContainer, 'none');
    boostTextContainer.setAttribute("id", 'boostTextContainer');

    const rightArrowLine = document.createElement("div");
    rightArrowLine.innerText = "🢃";
    boostTextContainer.appendChild(rightArrowLine);

    const boostWordLine = document.createElement("div");
    boostWordLine.innerText = "BOOST";
    boostTextContainer.appendChild(boostWordLine);

    const leftArrowLine = document.createElement("div");
    leftArrowLine.innerText = "🢁";
    boostTextContainer.appendChild(leftArrowLine);

    boostTextContainer.style.opacity = "0";
    boostTextContainer.style.visibility = "hidden";
    boostTextContainer.style.transition = "opacity 0.3s ease, visibility 0.3s ease";

    const antimatterRateBarOuter = document.createElement("div");
    antimatterRateBarOuter.style.position = "relative";
    antimatterRateBarOuter.style.width = "100%";
    antimatterRateBarOuter.style.height = "100%";
    antimatterRateBarOuter.style.border = "2px solid var(--text-color)";
    antimatterRateBarOuter.style.borderRadius = "10px";
    antimatterRateBarOuter.style.backgroundColor = "var(--container-bg-color)";
    antimatterRateBarOuter.style.transition = "background-color 0.3s ease-in-out";
    antimatterRateBarOuter.setAttribute("id", 'svgRateBarOuter');

    const antimatterTotalRate = getResourceDataObject('antimatter', ['rate']);
    const antimatterMaxRate = getNormalMaxAntimatterRate() * 10;
    
    const antimatterPercentage = (antimatterTotalRate / antimatterMaxRate) * 50;
    const antimatterRateBarInner = document.createElement("div");
    antimatterRateBarInner.style.position = "absolute";
    antimatterRateBarInner.style.bottom = "0";
    antimatterRateBarInner.style.width = "100%";
    antimatterRateBarInner.style.height = `${Math.min(50, Math.max(0, antimatterPercentage))}%`;
    antimatterRateBarInner.style.borderRadius = "10px";
    antimatterRateBarInner.style.backgroundColor = "var(--text-color)";
    antimatterRateBarInner.setAttribute("id", 'svgRateBarInner');

    const scaleContainer = document.createElement("div");
    scaleContainer.style.display = "flex";
    scaleContainer.style.flexDirection = "column";
    scaleContainer.style.justifyContent = "space-between";
    scaleContainer.style.alignItems = "flex-end";
    scaleContainer.style.width = "100%";
    scaleContainer.style.color = "var(--text-color)";
    scaleContainer.style.fontSize = "12px";
    
    for (let i = 0; i <= 8; i++) {  
        const scaleLabel = document.createElement("div");
        scaleLabel.innerText = `${(antimatterMaxRate * 2 * ((8 - i) / 8) * getTimerRateRatio()).toFixed(2)} / s`;
        scaleLabel.style.position = "absolute";
        scaleLabel.style.right = "5px";
        
        let topOffset = (i / 8) * 100;
        
        if (i === 0) {
            topOffset += 2;
        } else if (i === 8) {
            topOffset -= 2;
        }
    
        scaleLabel.style.top = `${topOffset}%`;
        scaleLabel.style.transform = "translateY(-50%)";
        scaleLabel.style.whiteSpace = "nowrap";
        scaleContainer.appendChild(scaleLabel);
    }
    
    const scaleForeignObject = document.createElementNS(svgNS, "foreignObject");
    scaleForeignObject.setAttribute("x", rightOffset + (boxWidth / 2) - 20);
    scaleForeignObject.setAttribute("y", topMostY);
    scaleForeignObject.setAttribute("width", 80);
    scaleForeignObject.setAttribute("height", rightBoxHeight);
    scaleForeignObject.setAttribute("id", "svgRightScaleContainer");
    scaleForeignObject.appendChild(scaleContainer);

    svgElement.appendChild(scaleForeignObject);
    antimatterRateBarOuter.appendChild(antimatterRateBarInner);
    rightBox.appendChild(antimatterRateBarOuter);
    rightBox.appendChild(boostTextContainer);

    svgElement.appendChild(rightBox);
}

export function drawNativeTechTree(techData, containerSelector) {
    const container = document.querySelector(containerSelector) || document.getElementById('techTreeNativeContainer');
    if (!container) return;

    container.innerHTML = '';

    const unlockedTechs = getTechUnlockedArray();
    const revealedTechs = getRevealedTechArray();
    const upcomingTechs = getUpcomingTechArray();

    const stage = document.createElement('div');
    stage.classList.add('native-tech-stage');
    const edgesSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    edgesSvg.classList.add('native-tech-edges');
    const nodesLayer = document.createElement('div');
    nodesLayer.classList.add('native-tech-nodes');

    stage.style.transformOrigin = '0 0';
    stage.style.transform = 'scale(1)';
    stage.style.transition = 'transform 0.2s ease';
    stage.appendChild(edgesSvg);
    stage.appendChild(nodesLayer);
    container.appendChild(stage);
    setupNativeTechTreeDrag(container);
    setupNativeTechTreeZoom(container, stage);

    const sortedTechs = Object.entries(techData).sort((a, b) => {
        const aCost = a[1].appearsAt?.[0] ?? 0;
        const bCost = b[1].appearsAt?.[0] ?? 0;
        return aCost - bCost;
    });

    const colSpacing = 260;
    const rowSpacing = 180;
    const nodeWidth = 240;
    const marginX = 60;
    const marginY = 60;

    const pathOrder = Array.from(new Set(sortedTechs.map(([_, value]) => value.path || 1))).sort((a, b) => a - b);
    const columnIndexByPath = new Map(pathOrder.map((path, index) => [path, index]));
    const pathOffsets = new Map(pathOrder.map(path => [path, marginY]));

    const nodeDataMap = new Map();
    let maxBottom = marginY;

    sortedTechs.forEach(([techKey, techValue]) => {
        const path = techValue.path || 1;
        const columnIndex = columnIndexByPath.get(path) ?? 0;
        const x = marginX + columnIndex * colSpacing;

        const status = unlockedTechs.includes(techKey)
            ? 'researched'
            : revealedTechs.includes(techKey)
                ? 'revealed'
                : upcomingTechs.includes(techKey)
                    ? 'upcoming'
                    : 'hidden';

        const node = document.createElement('div');
        node.classList.add('native-tech-node', `native-tech-${status}`);
        node.style.left = `${x}px`;
        node.style.top = `${marginY}px`;
        node.style.width = `${nodeWidth}px`;
        node.dataset.techKey = techKey;

        const formattedName = capitaliseString(techKey).replace(/([a-z])([A-Z])/g, '$1 $2');
        const canShowDetails = unlockedTechs.includes(techKey) || revealedTechs.includes(techKey);

        if (status === 'researched') {
            const statusTag = document.createElement('span');
            statusTag.classList.add('native-tech-status');
            statusTag.textContent = 'RESEARCHED';
            node.appendChild(statusTag);
        }

        const title = document.createElement('div');
        title.classList.add('native-tech-title');
        title.textContent = canShowDetails ? formattedName : '???';

        node.appendChild(title);
        const descriptionId = 'tech' + capitaliseString(techKey).replace(/\s+/g, '') + 'Row';
        const descriptionCopy = optionDescriptions[descriptionId]?.content2 || '';
        const descriptionElement = document.createElement('div');
        descriptionElement.classList.add('native-tech-description');
        if (canShowDetails) {
            descriptionElement.classList.add('ready-text');
            descriptionElement.innerHTML = descriptionCopy;
        } else {
            descriptionElement.classList.add('red-disabled-text');
            descriptionElement.textContent = '???';
        }
        node.appendChild(descriptionElement);

        const priceRaw = getResourceDataObject('techs', [techKey, 'price']);
        const price = typeof priceRaw === 'number' ? priceRaw : Number(priceRaw) || 0;
        const currentResearchRaw = getResourceDataObject('research', ['quantity']);
        const currentResearch = typeof currentResearchRaw === 'number' ? currentResearchRaw : Number(currentResearchRaw) || 0;
        const meetsCostRequirement = currentResearch >= price || unlockedTechs.includes(techKey);
        const costElement = document.createElement('div');
        costElement.classList.add('native-tech-cost', meetsCostRequirement ? 'ready-text' : 'red-disabled-text');
        costElement.dataset.techKey = techKey;
        costElement.dataset.price = String(price);
        costElement.textContent = `${price.toLocaleString()} Research`;
        node.appendChild(costElement);

        nodesLayer.appendChild(node);
        const measuredHeight = node.getBoundingClientRect().height;

        const prereqKeys = (techValue.appearsAt || []).slice(1).filter(Boolean);
        let requiredY = marginY;
        if (prereqKeys.length) {
            const prereqBottom = Math.max(...prereqKeys.map(prereq => {
                const prereqData = nodeDataMap.get(prereq);
                return prereqData ? prereqData.y + prereqData.height : marginY;
            }));
            requiredY = prereqBottom + rowSpacing;
        }

        const currentPathOffset = pathOffsets.get(path) ?? marginY;
        const finalY = Math.max(requiredY, currentPathOffset);
        node.style.top = `${finalY}px`;

        pathOffsets.set(path, finalY + measuredHeight + rowSpacing);
        nodeDataMap.set(techKey, {
            key: techKey,
            x,
            y: finalY,
            width: nodeWidth,
            height: measuredHeight,
            path
        });

        maxBottom = Math.max(maxBottom, finalY + measuredHeight);
    });

    const svgWidth = (pathOrder.length - 1) * colSpacing + nodeWidth + marginX * 2;
    const svgHeight = maxBottom + marginY;
    edgesSvg.setAttribute('width', svgWidth);
    edgesSvg.setAttribute('height', svgHeight);
    edgesSvg.style.width = `${svgWidth}px`;
    edgesSvg.style.height = `${svgHeight}px`;
    stage.style.width = `${svgWidth}px`;
    stage.style.height = `${svgHeight}px`;
    edgesSvg.innerHTML = `
        <defs>
            <marker id="nativeTechArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"></path>
            </marker>
        </defs>
    `;

    sortedTechs.forEach(([techKey, techValue]) => {
        const targetNode = nodeDataMap.get(techKey);
        if (!targetNode) return;

        const prereqKeys = (techValue.appearsAt || []).slice(1).filter(Boolean);
        prereqKeys.forEach(prereqKey => {
            const sourceNode = nodeDataMap.get(prereqKey);
            if (!sourceNode) return;

            const startX = sourceNode.x + sourceNode.width / 2;
            const startY = sourceNode.y + sourceNode.height;
            const endX = targetNode.x + targetNode.width / 2;
            const endY = targetNode.y;
            const verticalPadding = 80;
            const midY = Math.max(startY + verticalPadding, endY - verticalPadding);

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const pathData = [
                `M ${startX} ${startY}`,
                `L ${startX} ${midY}`,
                `L ${endX} ${midY}`,
                `L ${endX} ${endY}`
            ].join(' ');
            path.setAttribute('d', pathData);
            path.setAttribute('stroke', 'currentColor');
            path.setAttribute('fill', 'none');
            path.setAttribute('marker-end', 'url(#nativeTechArrow)');
            path.classList.add('native-tech-edge');

            edgesSvg.appendChild(path);
        });
    });

    stage.appendChild(edgesSvg);
    stage.appendChild(nodesLayer);
    container.appendChild(stage);
}

function setupNativeTechTreeDrag(container) {
    if (container.dataset.dragInit === 'true') {
        return;
    }

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;
    let startScrollTop = 0;

    const onMouseMove = (event) => {
        if (!isDragging) return;

        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;
        container.scrollLeft = startScrollLeft - deltaX;
        container.scrollTop = startScrollTop - deltaY;
    };

    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        container.classList.remove('native-tech-dragging');
    };

    container.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        isDragging = true;
        container.classList.add('native-tech-dragging');
        startX = event.clientX;
        startY = event.clientY;
        startScrollLeft = container.scrollLeft;
        startScrollTop = container.scrollTop;
        container.setPointerCapture(event.pointerId);
        event.preventDefault();
    });

    container.addEventListener('pointermove', (event) => {
        if (!isDragging) return;
        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;
        container.scrollLeft = startScrollLeft - deltaX;
        container.scrollTop = startScrollTop - deltaY;
    });

    container.addEventListener('pointerup', (event) => {
        if (!isDragging) return;
        isDragging = false;
        container.classList.remove('native-tech-dragging');
        container.releasePointerCapture(event.pointerId);
    });

    container.addEventListener('pointerleave', () => {
        if (!isDragging) return;
        isDragging = false;
        container.classList.remove('native-tech-dragging');
    });

    container.addEventListener('pointercancel', () => {
        if (!isDragging) return;
        isDragging = false;
        container.classList.remove('native-tech-dragging');
    });
    container.dataset.dragInit = 'true';
}

function setupNativeTechTreeZoom(container, stage) {
    const zoomLevels = [0.4, 0.5, 0.6, 0.75, 0.9, 1, 1.15, 1.35, 1.6];

    if (!container.nativeTechZoom) {
        container.nativeTechZoom = {
            levelIndex: 0,
            applyZoom(targetStage) {
                const scale = zoomLevels[this.levelIndex];
                if (targetStage) {
                    targetStage.style.transform = `scale(${scale})`;
                }
            }
        };

        container.addEventListener('wheel', (event) => {
            if (event.ctrlKey || event.metaKey) {
                return;
            }
            event.preventDefault();
            const zoomState = container.nativeTechZoom;
            const stageRect = zoomState.stage.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const cursorX = event.clientX - containerRect.left + container.scrollLeft;
            const cursorY = event.clientY - containerRect.top + container.scrollTop;
            const prevScale = zoomLevels[zoomState.levelIndex];

            if (event.deltaY > 0) {
                zoomState.levelIndex = Math.max(0, zoomState.levelIndex - 1);
            } else {
                zoomState.levelIndex = Math.min(zoomLevels.length - 1, zoomState.levelIndex + 1);
            }

            const newScale = zoomLevels[zoomState.levelIndex];

            setTimeout(() => {
                const scaleRatio = newScale / prevScale;
                container.scrollLeft = (cursorX * scaleRatio) - (event.clientX - containerRect.left);
                container.scrollTop = (cursorY * scaleRatio) - (event.clientY - containerRect.top);
            }, 50);

            zoomState.applyZoom(zoomState.stage);
        }, { passive: false });
    }

    container.nativeTechZoom.stage = stage;
    container.nativeTechZoom.applyZoom(stage);
}

export function showTabsUponUnlock() {
    const tabs = document.querySelectorAll('.tab');
    const unlockedTechs = getTechUnlockedArray();

    tabs.forEach(tab => {
        const tabTech = tab.getAttribute('data-tab') ?? '';
        const tabName = tab.getAttribute('data-name') ?? '';

        if (unlockedTechs.includes(tabTech)) {
            if (!getBattleTriggeredByPlayer()) {
                tab.classList.remove('tab-not-yet');
            }
            tab.textContent = tabName;
            const containerGroup = document.getElementById(`${tab.id}ContainerGroup`);

            if (containerGroup) {
                const firstAccessArray = getFirstAccessArray();            
                const optionElements = containerGroup.querySelectorAll('[id$="Option"]');
            
                optionElements.forEach(el => {
                    const grandparent = el.parentElement?.parentElement;
                    const isVisible = !grandparent?.classList.contains('invisible');
                    const normalizedElName = normalizeTabName(el.textContent);
                    const isFirstAccess = !firstAccessArray.includes(normalizedElName);
            
                    if (isVisible && isFirstAccess) {
                        appendAttentionIndicator(el);
                    } else {
                        removeAttentionIndicator(el);
                    }
                });
            }                  
        } else if (tabTech) {
            tab.classList.add('tab-not-yet');
            tab.textContent = '???';
            removeAttentionIndicator(tab);
        }
    });
}

function normalizeTabName(tabName) {
    return tabName
        .replace(/\s*[⚠️🌀]/g, '')
        .toLowerCase()
        .trimEnd();
}

export function checkOrderOfTabs() {
    const techArray = getTechUnlockedArray();

    const tabPriorities = {
        1: 1,
        2: 4,
        3: 3,
        4: 2,
        5: 6,
        6: 5,
        7: 7,
        8: 8
    };

    let unlockedTabs = [1, 3];

    if (techArray.includes('stellarCartography')) unlockedTabs.push(5);
    if (techArray.includes('basicPowerGeneration')) unlockedTabs.push(2);
    if (techArray.includes('compounds')) unlockedTabs.push(4);
    if (techArray.includes('atmosphericTelescopes')) unlockedTabs.push(6);
    if (techArray.includes('apAwardedThisRun')) unlockedTabs.push(7);

    unlockedTabs = unlockedTabs.sort((a, b) => tabPriorities[a] - tabPriorities[b]);

    const allTabs = Array.from(document.getElementById('tabsContainer').children);
    const tabsWithUnknown = allTabs.filter(tab => tab.classList.contains('tab-not-yet'));
    
    if (tabsWithUnknown.length > 0) {
        unlockedTabs = unlockedTabs.filter(tab => !tabsWithUnknown.some(t => `tab${tab}` === t.id));
        unlockedTabs.push(...tabsWithUnknown.map(tab => parseInt(tab.id.replace('tab', ''), 10)));
    }

    const allTabIds = allTabs
        .map(tab => parseInt(tab.id.replace('tab', ''), 10))
        .filter(Number.isFinite);
    allTabIds.forEach(id => {
        if (!unlockedTabs.includes(id)) {
            unlockedTabs.push(id);
        }
    });

    if (!unlockedTabs.includes(8)) {
        unlockedTabs.push(8);
    }

    allTabs.forEach(tab => {
        const container = document.getElementById(`${tab.id}ContainerGroup`);
        if (container && container.querySelector('.attention-indicator')) {
            const containerIcons = Array.from(container.querySelectorAll('.attention-indicator'));
            const iconTexts = containerIcons
                .map(icon => icon?.textContent?.trim())
                .filter(Boolean);

            const iconText = iconTexts.includes('🌀')
                ? '🌀'
                : (iconTexts[0] || '⚠️');

            appendAttentionIndicator(tab, iconText);
        } else {
            removeAttentionIndicator(tab);
        }
    });

    const currentOrder = Array.from(document.getElementById('tabsContainer').children).map(tab =>
        parseInt(tab.id.replace('tab', ''), 10)
    );

    if (JSON.stringify(currentOrder) === JSON.stringify(unlockedTabs)) {
        return;
    }

    reorderTabs(unlockedTabs);
}

export function updateTabHotkeys() {
    const tabs = Array.from(document.getElementById('tabsContainer').children);

    document.removeEventListener('keydown', handleTabHotkeys);
    
    function handleTabHotkeys(event) {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

        const key = event.key;
        if (key >= '1' && key <= String(tabs.length)) {
            const tabIndex = parseInt(key, 10) - 1;
            const tabElement = tabs[tabIndex];
            
            if (tabElement) {
                tabElement.click();
            }
        }
    }

    document.addEventListener('keydown', handleTabHotkeys);
}

function reorderTabs(newOrder) {
    const tabsContainer = document.getElementById('tabsContainer');

    newOrder.forEach(tabId => {
        const tab = document.getElementById(`tab${tabId}`);
        if (tab) {
            tabsContainer.appendChild(tab);
        }
    });

    initializeTabEventListeners();
    updateTabHotkeys();
}

function initializeTabEventListeners() {
    let fuseButton;

    document.querySelectorAll('[class*="tab1"][class*="option1"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab1', 'hydrogen');
            setCurrentOptionPane('hydrogen');
            updateContent('Hydrogen', 'tab1', 'content');
            fuseButton = document.querySelector('button.fuse');
            setSellFuseCreateTextDescriptionClassesBasedOnButtonStates(fuseButton, 'fuse');
            setAutoSellToggleState('hydrogen', 'resources');
            setFirstAccessArray('hydrogen');
        });
    });
    
    document.querySelectorAll('[class*="tab1"][class*="option2"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab1', 'helium');
            setCurrentOptionPane('helium');
            updateContent('Helium', 'tab1', 'content');
            fuseButton = document.querySelector('button.fuse');
            setSellFuseCreateTextDescriptionClassesBasedOnButtonStates(fuseButton, 'fuse');
            setAutoSellToggleState('helium', 'resources');
            setFirstAccessArray('helium');
        });
    });

    document.querySelectorAll('[class*="tab1"][class*="option3"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab1', 'carbon');
            setCurrentOptionPane('carbon');
            updateContent('Carbon', 'tab1', 'content');
            fuseButton = document.querySelector('button.fuse');
            setSellFuseCreateTextDescriptionClassesBasedOnButtonStates(fuseButton, 'fuse');
            setAutoSellToggleState('carbon', 'resources');
            setFirstAccessArray('carbon');
        });
    });

    document.querySelectorAll('[class*="tab1"][class*="option4"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab1', 'neon');
            setCurrentOptionPane('neon');
            updateContent('Neon', 'tab1', 'content');
            fuseButton = document.querySelector('button.fuse');
            setSellFuseCreateTextDescriptionClassesBasedOnButtonStates(fuseButton, 'fuse');
            setAutoSellToggleState('neon', 'resources');
            setFirstAccessArray('neon');
        });
    });

    document.querySelectorAll('[class*="tab1"][class*="option5"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab1', 'oxygen');
            setCurrentOptionPane('oxygen');
            updateContent('Oxygen', 'tab1', 'content');
            fuseButton = document.querySelector('button.fuse');
            setSellFuseCreateTextDescriptionClassesBasedOnButtonStates(fuseButton, 'fuse');
            setAutoSellToggleState('oxygen', 'resources');
            setFirstAccessArray('oxygen');
        });
    });

    document.querySelectorAll('[class*="tab1"][class*="option6"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab1', 'sodium');
            setCurrentOptionPane('sodium');
            updateContent('Sodium', 'tab1', 'content');
            setAutoSellToggleState('sodium', 'resources');
            setFirstAccessArray('sodium');
        });
    });

    document.querySelectorAll('[class*="tab1"][class*="option7"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab1', 'silicon');
            setCurrentOptionPane('silicon');
            updateContent('Silicon', 'tab1', 'content');
            fuseButton = document.querySelector('button.fuse');
            setSellFuseCreateTextDescriptionClassesBasedOnButtonStates(fuseButton, 'fuse');
            setAutoSellToggleState('silicon', 'resources');
            setFirstAccessArray('silicon');
        });
    });

    document.querySelectorAll('[class*="tab1"][class*="option8"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab1', 'iron');
            setCurrentOptionPane('iron');
            updateContent('Iron', 'tab1', 'content');
            setAutoSellToggleState('iron', 'resources');
            setFirstAccessArray('iron');
        });
    });

    document.querySelectorAll('[class*="tab2"][class*="option1"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab2', 'energy storage');
            setCurrentOptionPane('energy storage');
            updateContent('Energy Storage', 'tab2', 'content');
            setFirstAccessArray('energy storage');
        });
    });

    document.querySelectorAll('[class*="tab2"][class*="option2"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab2', 'power plant');
            setCurrentOptionPane('power plant');
            updateContent('Power Plant', 'tab2', 'content');
            setFirstAccessArray('power plant');
        });
    });

    document.querySelectorAll('[class*="tab2"][class*="option3"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab2', 'solar power plant');
            setCurrentOptionPane('solar power plant');
            updateContent('Solar Power Plant', 'tab2', 'content');
            setFirstAccessArray('solar power plant');
        });
    });

    document.querySelectorAll('[class*="tab2"][class*="option4"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab2', 'advanced power plant');
            setCurrentOptionPane('advanced power plant');
            updateContent('Advanced Power Plant', 'tab2', 'content');
            setFirstAccessArray('advanced power plant');
        });
    });

    document.querySelectorAll('[class*="tab3"][class*="option1"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab3', 'research');
            setCurrentOptionPane('research');
            updateContent('Research', 'tab3', 'content');
            setFirstAccessArray('research');
        });
    });
    
    document.querySelectorAll('[class*="tab3"][class*="option2"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab3', 'technology');
            setCurrentOptionPane('technology');
            updateContent('Technology', 'tab3', 'content');
            setFirstAccessArray('technology');
        });
    });

    document.querySelectorAll('[class*="tab3"][class*="option3"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab3', 'tech tree');
            setCurrentOptionPane('tech tree');
            updateContent('Tech Tree', 'tab3', 'content');
            setFirstAccessArray('tech tree');
        });
    });

    document.querySelectorAll('[class*="tab3"][class*="option4"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab3', 'philosophy');
            setCurrentOptionPane('philosophy');
            updateContent('Philosophy', 'tab3', 'content');
            setFirstAccessArray('philosophy');
        });
    });

    document.querySelectorAll('[class*="tab4"][class*="option1"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab4', 'diesel');
            setCurrentOptionPane('diesel');
            updateContent('Diesel', 'tab4', 'content');
            setAutoSellToggleState('diesel', 'compounds');
            setAutoCreateToggleState('diesel');
            setFirstAccessArray('diesel');
        });
    });

    document.querySelectorAll('[class*="tab4"][class*="option2"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab4', 'glass');
            setCurrentOptionPane('glass');
            updateContent('Glass', 'tab4', 'content');
            setAutoSellToggleState('glass', 'compounds');
            setAutoCreateToggleState('glass');
            setFirstAccessArray('glass');
        });
    });

    document.querySelectorAll('[class*="tab4"][class*="option3"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab4', 'steel');
            setCurrentOptionPane('steel');
            updateContent('Steel', 'tab4', 'content');
            setAutoSellToggleState('steel', 'compounds');
            setAutoCreateToggleState('steel');
            setFirstAccessArray('steel');
        });
    });

    document.querySelectorAll('[class*="tab4"][class*="option4"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab4', 'concrete');
            setCurrentOptionPane('concrete');
            updateContent('Concrete', 'tab4', 'content');
            setAutoSellToggleState('concrete', 'compounds');
            setAutoCreateToggleState('concrete');
            setFirstAccessArray('concrete');
        });
    });

    document.querySelectorAll('[class*="tab4"][class*="option5"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab4', 'water');
            setCurrentOptionPane('water');
            updateContent('Water', 'tab4', 'content');
            setAutoSellToggleState('water', 'compounds');
            setAutoCreateToggleState('water');
            setFirstAccessArray('water');
        });
    });

    document.querySelectorAll('[class*="tab4"][class*="option6"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab4', 'titanium');
            setCurrentOptionPane('titanium');
            updateContent('Titanium', 'tab4', 'content');
            setAutoSellToggleState('titanium', 'compounds');
            setAutoCreateToggleState('titanium');
            setFirstAccessArray('titanium');
        });
    });

    document.querySelectorAll('[class*="tab5"][class*="option1"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab5', 'star map');
            setCurrentOptionPane('star map');
            updateContent('Star Map', 'tab5', 'content');
            setFirstAccessArray('star map');
        });
    });

    document.querySelectorAll('[class*="tab5"][class*="option2"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab5', 'star data');
            setCurrentOptionPane('star data');
            updateContent('Star Data', 'tab5', 'content');
            setFirstAccessArray('star data');
        });
    });

    document.querySelectorAll('[class*="tab5"][class*="option3"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab5', 'star ship');
            setCurrentOptionPane('star ship');
            updateContent('Star Ship', 'tab5', 'content');
            setFirstAccessArray('star ship');
        });
    });

    document.querySelectorAll('[class*="tab5"][class*="option4"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab5', 'fleet hangar');
            setCurrentOptionPane('fleet hangar');
            updateContent('Fleet Hangar', 'tab5', 'content');
            setFirstAccessArray('fleet hangar');
        });
    });

    document.querySelectorAll('[class*="tab5"][class*="option5"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab5', 'colonise');
            setCurrentOptionPane('colonise');
            updateContent('Colonise', 'tab5', 'content');
            setFirstAccessArray('colonise');
        });
    });

    document.querySelectorAll('[class*="tab6"][class*="option1"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab6', 'launch pad');
            setCurrentOptionPane('launch pad');
            updateContent('Launch Pad', 'tab6', 'content');
            setFirstAccessArray('launch pad');
        });
    });

    document.querySelectorAll('[class*="tab6"][class*="option2"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab6', 'rocket1');
            setCurrentOptionPane('rocket1');
            updateContent(`${getRocketUserName('rocket1')}`, 'tab6', 'content');
            setFirstAccessArray('rocket1');
        });
    });

    document.querySelectorAll('[class*="tab6"][class*="option3"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab6', 'rocket2');
            setCurrentOptionPane('rocket2');
            updateContent(`${getRocketUserName('rocket2')}`, 'tab6', 'content');
            setFirstAccessArray('rocket2');
        });
    });

    document.querySelectorAll('[class*="tab6"][class*="option4"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab6', 'rocket3');
            setCurrentOptionPane('rocket3');
            updateContent(`${getRocketUserName('rocket3')}`, 'tab6', 'content');
            setFirstAccessArray('rocket3');
        });
    });

    document.querySelectorAll('[class*="tab6"][class*="option5"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab6', 'rocket4');
            setCurrentOptionPane('rocket4');
            updateContent(`${getRocketUserName('rocket4')}`, 'tab6', 'content');
            setFirstAccessArray('rocket4');
        });
    });

    document.querySelectorAll('[class*="tab6"][class*="option6"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab6', 'space telescope');
            setCurrentOptionPane('space telescope');
            updateContent('Space Telescope', 'tab6', 'content');
            setFirstAccessArray('space telescope');
        });
    });

    document.querySelectorAll('[class*="tab6"][class*="option7"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab6', 'asteroids');
            setCurrentOptionPane('asteroids');
            updateContent('Asteroids', 'tab6', 'content');
            setFirstAccessArray('asteroids');
        });
    });

    document.querySelectorAll('[class*="tab6"][class*="option8"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setHasAntimatterSvgRightBoxDataChanged(null);
            setLastScreenOpenRegister('tab6', 'mining');
            setCurrentOptionPane('mining');
            updateContent('Mining', 'tab6', 'content');
            setFirstAccessArray('mining');
        });
    });

    document.querySelectorAll('[class*="tab7"][class*="option1"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab7', 'rebirth');
            setCurrentOptionPane('rebirth');
            updateContent('Rebirth', 'tab7', 'content');
            setFirstAccessArray('rebirth');
        });
    });

    document.querySelectorAll('[class*="tab7"][class*="option2"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab7', 'galactic market');
            setCurrentOptionPane('galactic market');
            updateContent('Galactic Market', 'tab7', 'content');
            setFirstAccessArray('galactic market');
        });
    });

    document.querySelectorAll('[class*="tab7"][class*="option3"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab7', 'ascendency perks');
            setCurrentOptionPane('ascendency perks');
            updateContent('Ascendency Perks', 'tab7', 'content');
            setFirstAccessArray('ascendency perks');
        });
    });

    document.querySelectorAll('[class*="tab7"][class*="option4"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab7', 'megastructures');
            setCurrentOptionPane('megastructures');
            updateContent('Megastructures', 'tab7', 'content');
            setFirstAccessArray('megastructures');
        });
    });

    document.querySelectorAll('[class*="tab7"][class*="option5"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab7', 'black hole');
            setCurrentOptionPane('black hole');
            updateContent('Black Hole', 'tab7', 'content');
            setFirstAccessArray('black hole');
        });
    });
    
    document.querySelectorAll('[class*="tab8"][class*="option1"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab8', 'visual');
            setCurrentOptionPane('visual');
            updateContent('Visual', 'tab8', 'content');
            setFirstAccessArray('visual');
        });
    });
    
    document.querySelectorAll('[class*="tab8"][class*="option2"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab8', 'saving / loading');
            setCurrentOptionPane('saving / loading');
            updateContent('Saving / Loading', 'tab8', 'content');
            setFirstAccessArray('saving / loading');
        });
    });

    document.querySelectorAll('[class*="tab8"][class*="option3"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab8', 'game options');
            setCurrentOptionPane('game options');
            updateContent('Game Options', 'tab8', 'content');
            setFirstAccessArray('game options');
        });
    });

    document.querySelectorAll('[class*="tab8"][class*="option4"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab8', 'get started');
            setCurrentOptionPane('get started');
            updateContent('Get Started', 'tab8', 'content');
            setFirstAccessArray('get started');
        });
    });
    
    document.querySelectorAll('[class*="tab8"][class*="option5"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab8', 'concepts - early');
            setCurrentOptionPane('concepts - early');
            updateContent('Concepts - Early', 'tab8', 'content');
            setFirstAccessArray('concepts - early');
        });
    });
    
    document.querySelectorAll('[class*="tab8"][class*="option6"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab8', 'concepts - mid');
            setCurrentOptionPane('concepts - mid');
            updateContent('Concepts - Mid', 'tab8', 'content');
            setFirstAccessArray('concepts - mid');
        });
    });
    
    document.querySelectorAll('[class*="tab8"][class*="option7"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab8', 'concepts - late');
            setCurrentOptionPane('concepts - late');
            updateContent('Concepts - Late', 'tab8', 'content');
            setFirstAccessArray('concepts - late');
        });    
    });

    document.querySelectorAll('[class*="tab8"][class*="option13"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab8', 'concepts - end goal');
            setCurrentOptionPane('concepts - end goal');
            updateContent('Concepts - End Goal', 'tab8', 'content');
            setFirstAccessArray('concepts - end goal');
        });
    });

    document.querySelectorAll('[class*="tab8"][class*="option8"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab8', 'statistics');
            setCurrentOptionPane('statistics');
            updateContent('Statistics', 'tab8', 'content');
            setFirstAccessArray('statistics');
        });    
    });

    document.querySelectorAll('[class*="tab8"][class*="option9"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab8', 'contact');
            setCurrentOptionPane('contact');
            updateContent('Contact', 'tab8', 'content');
            setFirstAccessArray('contact');
        });    
    });

    document.querySelectorAll('[class*="tab8"][class*="option10"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab8', 'achievements');
            setCurrentOptionPane('achievements');
            refreshAchievementTooltipDescriptions();
            updateContent('Achievements', 'tab8', 'content');
            setFirstAccessArray('achievements');
        });    
    });

    document.querySelectorAll('[class*="tab8"][class*="option11"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab8', 'philosophies');
            setLastScreenOpenRegister('tab8', 'philosophies');
            setCurrentOptionPane('philosophies');
            updateContent('Philosophies', 'tab8', 'content');
            setFirstAccessArray('philosophies');
        });    
    });

    document.querySelectorAll('[class*="tab8"][class*="option12"]').forEach(function(element) {
        element.addEventListener('click', function() {
            selectRowCss(this);
            setLastScreenOpenRegister('tab8', 'story');
            setLastScreenOpenRegister('tab8', 'story');
            setCurrentOptionPane('story');
            updateContent('Story', 'tab8', 'content');
            setFirstAccessArray('story');
        });    
    });

    function selectRowCss(clickedItem) {
        const tabClassName = Array.from(clickedItem.classList).find(cls => cls.startsWith('tab'));
        if (!tabClassName) return;
        const [tabClass, optionClass] = tabClassName.split('.');
        if (!tabClass || !optionClass) return;
        
        document.querySelectorAll('.row-side-menu').forEach(i => i.classList.remove('row-side-menu-selected'));
        clickedItem.parentElement?.parentElement?.classList.add('row-side-menu-selected');
    }

    const tabsContainer = document.getElementById('tabsContainer');

    if (tabsContainer) {
        const tabs = Array.from(tabsContainer.children);
    
        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                playClickSfx();

                const dynamicIndex = parseInt(tab.id.replace('tab', ''), 10);
    
                setCurrentTab([dynamicIndex, document.getElementById('tab' + dynamicIndex).textContent]);
                highlightActiveTab(tab.textContent);
                setGameState(getGameVisibleActive());
    
                let content = tab.textContent;
                if (content === '☰') {
                    content = 'Settings';
                }

                if (!content.includes('Interstellar')) {
                    removeStarConnectionTooltip();
                    if (document.getElementById('descriptionContentTab5') && !getStarShipTravelling()) {
                        document.getElementById('descriptionContentTab5').innerHTML = getHeaderDescriptions('star map');
                    }
                } else {
                    if (getStarShipTravelling() && getCurrentOptionPane() === 'star map') {
                        drawStarConnectionDrawings(getCurrentStarSystem(), getDestinationStar(), 'travelling');
                        const starData = getStarSystemDataObject('stars');
                        createStarDestinationRow(starData[getDestinationStar()], 'travelling');
                        spaceTravelButtonHideAndShowDescription();
                    }
                }
    
                if (!getLastScreenOpenRegister(`tab${dynamicIndex}`)) {
                    updateContent(content, `tab${dynamicIndex}`, 'intro');
                }
    
                const lastOpenOptionPane = getLastScreenOpenRegister('tab' + getCurrentTab()[0]);
                if (lastOpenOptionPane) {
                    if (lastOpenOptionPane === 'space telescope') { //hack to refresh timer if ongoing
                        const optionContentElement = document.getElementById(`optionContentTab6`);
                        optionContentElement.innerHTML = '';
                        drawTab6Content('Space Telescope', optionContentElement);
                    } else if (lastOpenOptionPane === 'galactic market') {
                        const optionContentElement = document.getElementById(`optionContentTab7`);
                        optionContentElement.innerHTML = '';
                        drawTab7Content('Galactic Market', optionContentElement);
                    } else if (["power plant", "advanced power plant", "solar power plant"].includes(lastOpenOptionPane)) {
                        const optionContentElement = document.getElementById(`optionContentTab2`);
                        optionContentElement.innerHTML = '';
                        const formattedPaneName = lastOpenOptionPane
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ');
                    
                        drawTab2Content(formattedPaneName, optionContentElement);
                    } else if (["hydrogen", "helium", "carbon", "neon", "oxygen", "sodium", "silicon", "iron"].includes(lastOpenOptionPane)) {
                        const optionContentElement = document.getElementById(`optionContentTab1`);
                        optionContentElement.innerHTML = '';
                        setCurrentOptionPane(lastOpenOptionPane);
                        updateContent(capitaliseString(lastOpenOptionPane), 'tab1', 'content');
                        fuseButton = document.querySelector('button.fuse');
                        setSellFuseCreateTextDescriptionClassesBasedOnButtonStates(fuseButton, 'fuse');
                        setAutoSellToggleState(lastOpenOptionPane, 'resources');
                    } else if (["diesel", "glass", "steel", "concrete", "water", "titanium"].includes(lastOpenOptionPane)) {
                        const optionContentElement = document.getElementById(`optionContentTab4`);
                        optionContentElement.innerHTML = '';
                        setCurrentOptionPane(lastOpenOptionPane);
                        updateContent(capitaliseString(lastOpenOptionPane), 'tab4', 'content');
                        setAutoSellToggleState(lastOpenOptionPane, 'compounds');
                        setAutoCreateToggleState(lastOpenOptionPane);
                    }
                    setCurrentOptionPane(lastOpenOptionPane);
                }
            });
        });
    }  
}

export function spaceTravelButtonHideAndShowDescription() {
    const descriptionDiv = document.getElementById('starDestinationDescription');
    const buttonDiv = document.getElementById('starDestinationButton');
    if (descriptionDiv && getStarShipTravelling()) {
        descriptionDiv.classList.remove('invisible');
    }
    if (buttonDiv && (getStarShipTravelling() || !getStarShipBuilt())) {
        buttonDiv.classList.add('invisible');
    }
}

export async function showNewsTickerMessage(newsTickerContainer) {
    const randomValue = Math.random();
    let category;

    if (randomValue < 0.03) {
        category = "oneOff";
    } else if (randomValue < 0.13) {
        category = "prize";
    } else if (randomValue < 0.28) {
        category = "wackyEffects";
    } else {
        category = "noPrize";
    }

    let manuscriptClueSelection = null;
    if (category === 'noPrize' && Math.random() < getNewsTickerManuscriptClueChance()) {
        manuscriptClueSelection = getEligibleManuscriptClue(newsTickerContainer);
        if (manuscriptClueSelection) {
            category = 'manuscriptClues';
        }
    }

    let randomIndex = null;
    let message;

    if (category === 'manuscriptClues') {
        if (!manuscriptClueSelection) {
            manuscriptClueSelection = getEligibleManuscriptClue(newsTickerContainer);
        }

        if (!manuscriptClueSelection) {
            showNewsTickerMessage(newsTickerContainer);
            return;
        }

        ({ message } = manuscriptClueSelection);
    } else {
        randomIndex = Math.floor(Math.random() * newsTickerContainer[category].length);
        message = newsTickerContainer[category][randomIndex];
    }
    // let message = newsTickerContainer['wackyEffects'][newsTickerContainer['wackyEffects'].length - 1]; //DEBUG MESSAGES
    // category = 'wackyEffects'; //DEBUG

    if (category === 'prize' || category === 'oneOff' || category === 'wackyEffects') {
        if (category === 'oneOff') {
            if (getOneOffPrizesAlreadyClaimedArray().includes(randomIndex)) {
                message = false;
            } else {
                addMessageToSeenArray(message.id);
                message = await specialMessageBuilder(message, category);
            }
        } else {
            addMessageToSeenArray(message.id)
           message = await specialMessageBuilder(message, category);
        }
    } else if (category === 'manuscriptClues') {
        addMessageToSeenArray(manuscriptClueSelection.templateId);
        markManuscriptClueShown(manuscriptClueSelection.manuscriptStarName, manuscriptClueSelection.templateId);
    }

    if (message === false || message === undefined || message.includes('Wanna Give FeedBack') && !getFeedbackCanBeRequested()) {
        showNewsTickerMessage(newsTickerContainer);
    } else {
        if (category === 'noPrize') {
            addMessageToSeenArray(randomIndex);
        }
        await playCosmicForgeIntermission('out');
        displayNewsTickerMessage(message);
    }  
}

function getEligibleManuscriptClue(newsTickerContainer) {
    const manuscripts = getStarsWithAncientManuscripts();
    const templates = newsTickerContainer?.manuscriptClues ?? [];

    if (!Array.isArray(manuscripts) || !manuscripts.length || !templates.length) {
        return null;
    }

    const cluesShown = getManuscriptCluesShown() ?? {};

    const eligibleEntries = manuscripts
        .map(entry => {
            if (!Array.isArray(entry) || entry.length < 4) return null;
            const [manuscriptStarName, factoryStarName, , reported] = entry;
            if (reported || !manuscriptStarName || !factoryStarName) return null;

            const normalized = manuscriptStarName.toLowerCase();
            const usedIds = cluesShown[normalized] ?? [];
            const availableTemplates = templates.filter(template => !usedIds.includes(template.id));

            if (!availableTemplates.length) return null;

            return {
                manuscriptStarName,
                availableTemplates
            };
        })
        .filter(Boolean);

    if (!eligibleEntries.length) {
        return null;
    }

    const entry = eligibleEntries[Math.floor(Math.random() * eligibleEntries.length)];
    const template = entry.availableTemplates[Math.floor(Math.random() * entry.availableTemplates.length)];
    const formattedStarName = capitaliseWordsWithRomanNumerals(entry.manuscriptStarName);
    const message = template.template.replaceAll('{STAR}', formattedStarName);

    return {
        message,
        templateId: template.id,
        manuscriptStarName: entry.manuscriptStarName
    };
}

function addMessageToSeenArray(id) {
    if (!getAlreadySeenNewsTickerArray().includes(id)) {
        setAlreadySeenNewsTickerArray(id);
    }
}

async function playCosmicForgeIntermission(direction) {
    return new Promise(resolve => {
        const banner = document.getElementById('cosmicForgeBanner');
        if (!banner) {
            resolve();
            return;
        }

        if (direction === 'out' && !banner.classList.contains('cosmic-banner-active')) {
            resolve();
            return;
        }

        if (!banner.dataset.cosmicForgeReady) {
            const letters = 'COSMIC FORGE'.split('');
            banner.innerHTML = letters
                .map(letter => {
                    const displayLetter = letter === ' ' ? '&nbsp;' : letter;
                    return `<span class="cosmic-letter">${displayLetter}</span>`;
                })
                .join('');
            banner.dataset.cosmicForgeReady = 'true';
        }

        const spans = Array.from(banner.querySelectorAll('.cosmic-letter'));
        if (!spans.length) {
            resolve();
            return;
        }

        const baseDelay = 70;

        if (direction === 'in') {
            banner.classList.add('cosmic-banner-active');
            spans.forEach(span => span.classList.remove('cosmic-letter-in', 'cosmic-letter-out'));
        }

        const sequencedSpans = [...spans].reverse();

        sequencedSpans.forEach((span, index) => {
            const delay = index * baseDelay;
            setTimeout(() => {
                if (direction === 'in') {
                    span.classList.add('cosmic-letter-in');
                } else {
                    span.classList.add('cosmic-letter-out');
                }
            }, delay);
        });

        const totalDelay = spans.length * baseDelay + 500;
        setTimeout(() => {
            if (direction === 'out') {
                spans.forEach(span => span.classList.remove('cosmic-letter-in', 'cosmic-letter-out'));
                banner.classList.remove('cosmic-banner-active');
            }
            resolve();
        }, totalDelay);
    });
}

async function displayNewsTickerMessage(message) {
    const newsTicker = document.querySelector('.news-ticker-content');
    const container = document.querySelector('.news-ticker-container');

    newsTicker.classList.remove('invisible');
    newsTicker.innerHTML = '';

    const textElement = document.createElement('div');
    textElement.classList.add('news-ticker-text');
    textElement.innerHTML = message;

    newsTicker.appendChild(textElement);
    addPrizeEventListeners();
    addOneOffEventListeners();
    addWackyEffectsEventListeners();

    const containerWidth = container.offsetWidth;
    const additionalOffset = containerWidth * 0.3;
    const scrollDuration = getNewsTickerScrollDuration();

    textElement.style.animation = `scrollNews ${scrollDuration / 1000}s linear infinite`;
    textElement.style.animationName = 'scrollNews';

    const keyframes = `
        @keyframes scrollNews {
            0% {
                transform: translateX(${containerWidth}px);
            }
            100% {
                transform: translateX(-${containerWidth + additionalOffset}px);
            }
        }
    `;

    const styleTag = document.createElement('style');
    styleTag.textContent = keyframes;
    document.head.appendChild(styleTag);

    let timeoutId;
    let prizeElement = document.getElementById('prizeTickerSpan');
    let prizeElement2 = document.getElementById('prizeTickerSpan2');

    function handleVisibilityChange() {
        if (document.hidden) {
            newsTicker.classList.add('invisible');
            if (prizeElement) {
                document.querySelector('.news-ticker-content').style.animation = 'none';
                prizeElement.remove();
            }
            if (prizeElement2) {
                document.querySelector('.news-ticker-content').style.animation = 'none';
                prizeElement2.remove();
            }
            clearTimeout(timeoutId);
        } else {
            if (getNewsTickerSetting()) {
                startNewsTickerTimer();
            }
        }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    timeoutId = setTimeout(async () => {
        newsTicker.classList.add('invisible');
        if (prizeElement) {
            document.querySelector('.news-ticker-content').style.animation = 'none';
            prizeElement.remove();
        } 
        if (prizeElement2) {
            document.querySelector('.news-ticker-content').style.animation = 'none';
            prizeElement2.remove();
        }       
        newsTicker.innerHTML = '';
        if (styleTag.parentNode) {
            styleTag.parentNode.removeChild(styleTag);
        }
        await playCosmicForgeIntermission('in');
        startNewsTickerTimer();
        clearTimeout(timeoutId);
    }, scrollDuration);
}

function specialMessageBuilder(message, prizeCategory) {
    if (prizeCategory === 'prize') {
        if (message.type === 'giftResource') {
            let amountToAdd = 0;

            const visible = !getElements()[message.item + 'Option'].parentElement.parentElement.classList.contains('invisible');
            if (message.condition === 'visible' && visible) {
                let currentResourceQuantity, resourceStorageCapacity;

                if (message.category === "antimatter") {
                    currentResourceQuantity = getResourceDataObject("antimatter", ["quantity"]);
                    resourceStorageCapacity = getResourceDataObject("antimatter", ["storageCapacity"]);
                } else {
                    currentResourceQuantity = getResourceDataObject(message.category, [message.item, "quantity"]);
                    resourceStorageCapacity = getResourceDataObject(message.category, [message.item, "storageCapacity"]);
                }

                const difference = resourceStorageCapacity - currentResourceQuantity;
            
                if (difference === 0) {
                    return false;
                }
            
                amountToAdd = Math.min(Math.floor(Math.random() * difference) + 1, resourceStorageCapacity / 10);
            } else {
                return false;
            }

            let newMessage = message.body;
            newMessage = newMessage.replace('xxx', amountToAdd);
    
            const linkWord = message.linkWord;
            const linkWordRegex = new RegExp(`\\b${linkWord}\\b`, 'g');
    
            newMessage = newMessage.replace(linkWordRegex, `
                <span id="prizeTickerSpan" 
                    data-prize-type="giftResource" 
                    data-category="${message.category}" 
                    data-item="${message.item}"
                    data-data1="${amountToAdd}">
                    ${linkWord}
                </span>
            `);
    
            deferredActions.push(() => {
                addPrizeEventListeners();
            });
    
            return newMessage;
        }

    } else if (prizeCategory === 'oneOff') {
        if (!getOneOffPrizesAlreadyClaimedArray().includes(message.id)) {
            setOneOffPrizesAlreadyClaimedArray(message.id);
            const multiplier = message.type[1];
    
            let newMessage = message.body;
            const linkWord = message.linkWord;
            const linkWordRegex = new RegExp(`\\b${linkWord}\\b`, 'g');
    
            newMessage = newMessage.replace(linkWordRegex, `
                <span 
                    id="prizeTickerSpan"
                    data-oneoff-id='${message.id}' 
                    data-category='${JSON.stringify(message.category)}'
                    data-item='${typeof message.item === 'string' ? message.item : JSON.stringify(message.item)}'  
                    data-type='${message.type[0]}' 
                    data-multiplier='${multiplier}'>
                    ${linkWord}
                </span>
            `);
    
            deferredActions.push(() => {
                addOneOffEventListeners(); //at this point we have not already claimed it and we are definitely applying it no matter what
            });
    
            return newMessage;
        } else {
            return false;
        }
    } else if (prizeCategory === 'wackyEffects') {
        let newMessage = message.body;
        const linkWord = message.linkWord;
        const linkWord2 = message.linkWord2;

        if (newMessage.includes(linkWord)) {
            newMessage = newMessage.split(linkWord).join(`
                <span 
                    id="prizeTickerSpan"
                    ${message.class ? `class="${message.class}"` : ''} 
                    data-effect-item='${message.item}'>
                    ${linkWord}
                </span>
            `);
        }

        if (linkWord2 !== '' && newMessage.includes(linkWord2)) {
            newMessage = newMessage.split(linkWord2).join(`
                <span 
                    id="prizeTickerSpan2"
                    ${message.class ? `class="${message.class}"` : ''} 
                    data-effect-item='${message.item}'>
                    ${linkWord2}
                </span>
            `);
        }
    
        deferredActions.push(() => {
            addWackyEffectsEventListeners();
        });
    
        return newMessage;
    }
}

function multiplyAndRound(value, multiplier, precision = 6) {
    if (!Number.isFinite(value) || !Number.isFinite(multiplier)) {
        return 0;
    }

    const factor = Math.pow(10, precision);
    return Math.round(value * multiplier * factor) / factor;
}

function addOneOffEventListeners() {
    const oneOffElement = document.getElementById('prizeTickerSpan');

    if (!oneOffElement || !oneOffElement.hasAttribute('data-oneoff-id')) {
        return;
    }

    oneOffElement.addEventListener('click', function () {
        addToResourceAllTimeStat(1, 'newsTickerPrizesCollected');
        sfxPlayer.playAudio('goodPrize');
        const multiplier = parseFloat(this.getAttribute('data-multiplier'));

        const rawCategory = this.getAttribute('data-category');
        if (!rawCategory) {
            console.warn('One-off prize missing data-category attribute.');
            return;
        }

        let categoryArray;
        if (rawCategory === 'antimatter') {
            categoryArray = ['antimatter'];
        } else {
            try {
                categoryArray = JSON.parse(rawCategory);
            } catch (error) {
                console.error('Invalid data-category for one-off prize:', rawCategory, error);
                return;
            }
        }

        let item = this.getAttribute('data-item');
        if (!item) {
            console.warn('One-off prize missing data-item attribute.');
            return;
        }

        if (typeof item === 'string' && item.startsWith('[') && item.endsWith(']')) {
            try {
                item = JSON.parse(item);
            } catch (error) {
                console.error('Invalid data-item for one-off prize:', item, error);
                return;
            }
        }

        const type = this.getAttribute('data-type');

        let resourcesToInclude = getResourceDataObject('resources');
        let compoundsToInclude = getResourceDataObject('compounds');

        let resourcesAndCompoundsToInclude = {
            resources: resourcesToInclude,
            compounds: compoundsToInclude
        };

        resourcesToInclude = filterObjectsByCondition(resourcesToInclude);
        compoundsToInclude = filterObjectsByCondition(compoundsToInclude);

        if (type === 'storageMultiplier') {
            categoryArray.forEach(category => { // resource or compounds storage capacity
                if (category === 'resources' || category === 'compounds') {
                    const categoryTypeToUse = category === 'resources' ? resourcesToInclude : compoundsToInclude;
                    Object.keys(categoryTypeToUse).forEach(element => {
                        setResourceDataObject(
                            Math.floor(
                                getResourceDataObject(category, [element, 'storageCapacity']) * multiplier
                            ),
                            category,
                            [element, 'storageCapacity']
                        );
                    });
                } else if (category === 'buildings') { //battery storage capacity
                    const buyBuildingButtonElement = document.querySelector(`#${item[0]}${capitaliseString(item[1])}Row .option-row-main .input-container .building-purchase-button`);

                    const quantityOfBuilding = getResourceDataObject('buildings', [item[0], 'upgrades', item[1], 'quantity']);
                    const currentCapacityOfBuilding = Math.floor(quantityOfBuilding * getResourceDataObject('buildings', [item[0], 'upgrades', item[1], 'capacity']) * quantityOfBuilding);
                    const currentTotalCapacityMinusBuildingType = Math.floor(getResourceDataObject('buildings', [item[0], 'storageCapacity']) - currentCapacityOfBuilding);
                    const newTotalCapacity = Math.floor(currentTotalCapacityMinusBuildingType + (currentCapacityOfBuilding * multiplier));

                    setResourceDataObject(newTotalCapacity, 'buildings', [item[0], 'storageCapacity']);
                    setResourceDataObject(Math.floor(getResourceDataObject('buildings', [item[0], 'upgrades', item[1], 'capacity']) * multiplier),'buildings',[item[0], 'upgrades', item[1], 'capacity']);
                   
                    if (buyBuildingButtonElement)  {
                        buyBuildingButtonElement.innerHTML = `Add ${Math.floor(getResourceDataObject('buildings', [item[0], 'upgrades', item[1], 'capacity']) / 1000)} MWh`;
                    }
                }
            });
        } else if (type === 'rateMultiplier') {
            categoryArray.forEach(category => { // resource, compounds, or building rate multiplier
                if (category === 'resources' || category === 'compounds') {
                    const categoryTypeToUse = category === 'resources' ? resourcesToInclude : compoundsToInclude;
                    Object.keys(categoryTypeToUse).forEach(element => { //set future purchase rate * multiplier
                        const currentRate = getResourceDataObject(category, [element, 'upgrades', 'autoBuyer', item[1], 'rate']);
                        const newRate = multiplyAndRound(currentRate, multiplier);

                        setResourceDataObject(newRate, category, [element, 'upgrades', 'autoBuyer', item[1], 'rate']);

                        if (getCurrentOptionPane() === element) { //set autobuyer button text if on that screen at the moment prize is clicked
                            const buyBuildingButtonElement = document.querySelector(`#${element}AutoBuyer${item[1].replace(/^\D+/g, '')}Row .option-row-main .input-container button[data-auto-buyer-tier="${item[1]}`);
                            if (buyBuildingButtonElement) {
                                buyBuildingButtonElement.innerHTML = `Add ${newRate * getTimerRateRatio()} ${capitaliseString(element)} /s`;
                            }
                        }
                    });
                } else if (category === 'buildings') { // building rate multiplier e.g. Power Plants
                    const buyBuildingButtonElement = document.querySelector(`#${item[0]}${capitaliseString(item[1])}Row .option-row-main .input-container .building-purchase-button`);
                    const rateElement = document.getElementById(`${item[1]}Rate`);

                    const currentPurchasedRateOfBuilding = getResourceDataObject('buildings', [item[0], 'upgrades', item[1], 'purchasedRate']);
                    const newPurchasedRateOfBuilding = multiplyAndRound(currentPurchasedRateOfBuilding, multiplier);

                    const currentRatePerBuilding = getResourceDataObject('buildings', [item[0], 'upgrades', item[1], 'rate']);
                    const newRateOfBuilding = multiplyAndRound(currentRatePerBuilding, multiplier);

                    setResourceDataObject(newPurchasedRateOfBuilding, 'buildings', [item[0], 'upgrades', item[1], 'purchasedRate']);
                    setResourceDataObject(newRateOfBuilding, 'buildings', [item[0], 'upgrades', item[1], 'rate']);
        
                    if (buyBuildingButtonElement) {
                        buyBuildingButtonElement.innerHTML = `Add ${Math.floor(newRateOfBuilding * getTimerRateRatio())} KW /s`;
                    }

                    if (rateElement) {
                        const quantityOfBuilding = getResourceDataObject('buildings', [item[0], 'upgrades', item[1], 'quantity']);
                        rateElement.innerHTML = `${Math.floor((newRateOfBuilding * getTimerRateRatio()) * quantityOfBuilding)} KW / s`;
                    }
                }
            });
        } else if (type === 'adder') {
            const itemToAddType = categoryArray;
            const quantityToAdd = multiplier;
            setResourceDataObject(getResourceDataObject(itemToAddType, ['quantity']) + quantityToAdd, itemToAddType, ['quantity']);
            if (itemToAddType === 'antimatter') {
                addToResourceAllTimeStat(quantityToAdd, 'antimatter');
                addToResourceAllTimeStat(quantityToAdd, 'antimatterThisRun');
            } else if (itemToAddType === 'ascendencyPoints') {
                addToResourceAllTimeStat(quantityToAdd, 'totalApGain')
            }
        }

        setElementPointerEvents(this, 'none');
        setElementOpacity(this, 0.5);
    });
}

function filterObjectsByCondition(dataObject) {
    let filteredObject = {};
    for (let key in dataObject) {
        if (dataObject.hasOwnProperty(key)) {
            let element = document.getElementById(key + 'Option');
            if (
                element &&
                element.parentElement &&
                element.parentElement.parentElement &&
                !element.parentElement.parentElement.classList.contains('invisible')
            ) {
                filteredObject[key] = dataObject[key];
            }
        }
    }
    return filteredObject;
}

function addPrizeEventListeners() {
    const prizeElement = document.getElementById('prizeTickerSpan');
    if (prizeElement) {
        if (prizeElement.hasAttribute('data-effect-item')) {
            return;
        }
        prizeElement.addEventListener('click', function () {
            sfxPlayer.playAudio('goodPrize');
            const prizeType = this.getAttribute('data-prize-type');
            const category = this.getAttribute('data-category');
            const item = this.getAttribute('data-item');
            const quantityToAdd = parseInt(this.getAttribute('data-data1'));
            addToResourceAllTimeStat(1, 'newsTickerPrizesCollected');

            switch (prizeType) {
                case 'giftResource': //storage checks already done before getting here
                    setResourceDataObject(
                        getResourceDataObject(category, [item, 'quantity']) + quantityToAdd,
                        category,
                        [item, 'quantity']
                    );
                    addToResourceAllTimeStat(quantityToAdd, item);
                    break;
                default:
                    break;
            }

            setElementPointerEvents(this, 'none');
            setElementOpacity(this, 0.5);
        });
    }
}

function addWackyEffectsEventListeners() {
    const prizeTickerSpan = document.getElementById('prizeTickerSpan');
    const prizeTickerSpan2 = document.getElementById('prizeTickerSpan2');
    
    if (!prizeTickerSpan || !prizeTickerSpan.hasAttribute('data-effect-item')) return;

    prizeTickerSpan.addEventListener('click', () => {
        const effectItem = prizeTickerSpan.getAttribute('data-effect-item');
        if (!effectItem) {
            console.warn('Wacky effect span missing data-effect-item attribute.');
            return;
        }
        let targetElement = prizeTickerSpan.parentElement;

        if (!targetElement) return;

        const existingAnimation = targetElement.style.animation || '';
        let newAnimation = existingAnimation;
        let otherElement = prizeTickerSpan.parentElement.parentElement.querySelector('span#prizeTickerSpan2');

        switch (effectItem) {
            case 'wave':
                //add sound effect
                targetElement = prizeTickerSpan.parentElement.parentElement;
                newAnimation += ', waveAnimation 2s infinite alternate ease-in-out';
                prizeTickerSpan.style.opacity = '0.5';
                break;
            case 'disco':
                //add sound effect
                targetElement = prizeTickerSpan.parentElement;
                prizeTickerSpan.classList.add('disco');
                break;
            case 'bounce':
                //add sound effect
                targetElement = prizeTickerSpan.parentElement.parentElement;
                newAnimation += ', bounceAnimation 1s infinite ease-in-out';
                prizeTickerSpan.style.opacity = '0.8';
                break;
            case 'fade':
                //add sound effect
                newAnimation += ', fadeAnimation 1s infinite alternate';
                prizeTickerSpan.style.opacity = '0.5';
                break;
            case 'glitch':
                //add sound effect
                targetElement = prizeTickerSpan.parentElement.parentElement;
                newAnimation += ', glitchAnimation 0.1s infinite';
                prizeTickerSpan.style.opacity = '0.5';
                break;
            case 'wobble':
                //add sound effect
                targetElement = prizeTickerSpan.parentElement.parentElement;
                newAnimation += ', wobbleAnimation 1s infinite ease-in-out';
                prizeTickerSpan.style.opacity = '0.5';
                break;
            case 'boo':
                //add sound effect
                prizeTickerSpan.classList.remove('boo');
                break;
            case 'feedback':
                targetElement = prizeTickerSpan.parentElement.parentElement;
                newAnimation += ', feedbackGood 0.4s ease-in-out forwards';
                prizeTickerSpan.style.opacity = '0.5';
                if (otherElement) {
                    otherElement.style.opacity = '0.5';
                }
                break;
            default:
                console.warn('Unknown effect item:', effectItem);
                break;
        }

        if (effectItem === 'feedback') {
            setActivatedWackyNewsEffectsArray(effectItem, 'good');
            if (getFeedbackCanBeRequested()) {
                triggerFeedBackModal('good');
            }
        } else {
            setActivatedWackyNewsEffectsArray(effectItem);
        }
        
        targetElement.style.animation = newAnimation;

        setElementPointerEvents(prizeTickerSpan, 'none');
        if (otherElement) {
            setElementPointerEvents(otherElement, 'none');
        }
    });

    if (prizeTickerSpan2 && prizeTickerSpan2.hasAttribute('data-effect-item')) {
        prizeTickerSpan2.addEventListener('click', () => {
            const effectItem = prizeTickerSpan2.getAttribute('data-effect-item');
            if (!effectItem) {
                console.warn('Wacky effect span 2 missing data-effect-item attribute.');
                return;
            }
            let targetElement = prizeTickerSpan2.parentElement;
        
            if (!targetElement) return;
        
            const existingAnimation = targetElement.style.animation || '';
            let newAnimation = existingAnimation;
            let otherElement = prizeTickerSpan2.parentElement.parentElement.querySelector('span#prizeTickerSpan');
        
            switch (effectItem) {
                case 'feedback':
                    targetElement = prizeTickerSpan2.parentElement.parentElement;
                    newAnimation += ', feedbackBad 0.4s ease-in-out forwards';
                    prizeTickerSpan2.style.opacity = '0.5';
                    if (otherElement) {
                        otherElement.style.opacity = '0.5';
                        setElementPointerEvents(otherElement, 'none');
                    }
                    break;
                default:
                    console.warn('Unknown effect item:', effectItem);
                    break;
            }
        
            if (effectItem === 'feedback') {
                setActivatedWackyNewsEffectsArray(effectItem, 'bad');
                if (getFeedbackCanBeRequested()) {
                    triggerFeedBackModal('bad');
                }
            }  else {
                setActivatedWackyNewsEffectsArray(effectItem);
            }
            
            targetElement.style.animation = newAnimation;
        
            setElementPointerEvents(prizeTickerSpan2, 'none');
            if (otherElement) {
                setElementPointerEvents(otherElement, 'none');
            }
        });
    }
}

let particleInterval;

export function startWeatherEffect(type) {
    const weatherEffectOverlay = document.getElementById('weatherEffectOverlay');
    if (!weatherEffectOverlay) return;

    weatherEffectOverlay.style.display = 'block';

    const overlayHeight = 1000;
    const fallDuration = 0.003;

    const classNameToAddToParticle = type === 'rain' ? 'raindrop' : type === 'volcano' ? 'lavadrop' : null;

    if (!classNameToAddToParticle) {
        console.error('Invalid weather effect type:', type);
        return;
    }

    if (particleInterval) {
        clearInterval(particleInterval);
    }

    particleInterval = setInterval(() => {
        const drop = document.createElement('div');
        drop.classList.add(classNameToAddToParticle);

        const randomX = Math.random() * 5000;
        drop.style.left = `${randomX}px`;

        const adjustedDuration = overlayHeight * fallDuration;
        drop.style.animationDuration = `${adjustedDuration}s`;

        weatherEffectOverlay.appendChild(drop);

        setTimeout(() => {
            drop.remove();
        }, adjustedDuration * 1000);
    }, 20);
}

export function stopWeatherEffect() {
    const weatherEffectOverlay = document.getElementById('weatherEffectOverlay');

    if (!weatherEffectOverlay) return;

    if (particleInterval) {
        clearInterval(particleInterval);
    }

    particleInterval = null;

    weatherEffectOverlay.style.display = 'none';

    const particles = weatherEffectOverlay.querySelectorAll('.raindrop, .lavadrop');
    particles.forEach(particle => particle.remove());
}

export function toggleGameFullScreen() {
    if (!document.fullscreenElement) {
        if (document.body.requestFullscreen) {
            document.body.requestFullscreen();
        } else if (document.body.mozRequestFullScreen) {
            document.body.mozRequestFullScreen();
        } else if (document.body.webkitRequestFullscreen) {
            document.body.webkitRequestFullscreen();
        } else if (document.body.msRequestFullscreen) {
            document.body.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

export function switchFuelGaugeWhenFuellerBought(rocket, type) {
    const fuellerBought = getRocketsFuellerStartedArray().some(item => item === rocket && !item.includes('FuelledUp'));

    if ((fuellerBought || type !== 'normal') && getCurrentOptionPane() === rocket) {
        if (type === 'normal') {
            const progressFuelingElement = document.getElementById(rocket + 'FuellingProgressBarContainer');
            const rocketLaunchButton = document.querySelector('button.rocket-fuelled-check');
            progressFuelingElement.classList.remove('invisible');
            rocketLaunchButton.classList.remove('invisible');
        } else {
            const optionContentElement = document.getElementById(`optionContentTab6`);
            optionContentElement.innerHTML = '';
            drawTab6Content(`${getRocketUserName(rocket)}`, optionContentElement);
        }

    }
}

export function switchBatteryStatBarWhenBatteryBought() {
    const batteryNo = document.getElementById('batteryNo');
    const batteryIndicatorBarContainer = document.getElementById('batteryBarContainer');

    if (getResourceDataObject('buildings', ['energy', 'batteryBoughtYet'])) {
        if (batteryNo && batteryIndicatorBarContainer) {
            batteryNo.classList.add('invisible');
            batteryIndicatorBarContainer.classList.remove('invisible');
            return getBatteryLevel();
        }
    } else {
        batteryNo.classList.remove('invisible');
        batteryIndicatorBarContainer.classList.add('invisible');
        return null;
    }
}

export function setBatteryIndicator(value) {
    const batteryBarContainer = document.getElementById('batteryBarContainer');
    batteryBarContainer.classList.remove('invisible');

    let batteryBar = document.getElementById('batteryBar');
    if (!batteryBar) {
        batteryBar = document.createElement('div');
        batteryBar.id = 'batteryBar';
        batteryBarContainer.appendChild(batteryBar);
    }

    let indicatorSymbol = document.getElementById('indicatorSymbol');
    if (!indicatorSymbol) {
        indicatorSymbol = document.createElement('span');
        indicatorSymbol.id = 'indicatorSymbol';
        batteryBarContainer.parentElement.appendChild(indicatorSymbol);
    }

    const energyRate = getInfinitePower() ? getInfinitePowerRate() : getResourceDataObject('buildings', ['energy', 'rate']);
    const consumption = getResourceDataObject('buildings', ['energy', 'consumption']);

    if (energyRate > consumption && getPowerOnOff()) {
        indicatorSymbol.innerHTML = '▲';
        indicatorSymbol.style.color = 'var(--ready-text)';
    } else if (energyRate < consumption && getPowerOnOff()) {
        indicatorSymbol.innerHTML = '▼';
        indicatorSymbol.style.color = 'var(--disabled-text)';
    } else {
        indicatorSymbol.innerHTML = '-';
        indicatorSymbol.style.color = 'var(--text-color)';
    }

    batteryBar.style.width = `${value}%`;

    if (value === 100) {
        batteryBar.style.setProperty('background-color', 'var(--ready-text)', 'important');
    } else if (value > 25) {
        batteryBar.style.setProperty('background-color', 'var(--text-color)', 'important');
    } else if (value > 10) {
        batteryBar.style.setProperty('background-color', 'var(--warning-text)', 'important');
    } else {
        batteryBar.style.setProperty('background-color', 'var(--disabled-text)', 'important');
    }
}

export function handleSortAsteroidClick(sortMethod) {
    setSortAsteroidMethod(sortMethod);
    const optionContentElement = document.getElementById(`optionContentTab6`);
    optionContentElement.innerHTML = '';
    drawTab6Content('Asteroids', optionContentElement);
}

export function handleSortStarClick(sortMethod) {
    setSortStarMethod(sortMethod);
    const optionContentElement = document.getElementById(`optionContentTab5`);
    optionContentElement.innerHTML = '';
    drawTab5Content('Star Data', optionContentElement, false, false);
}

export function sortStarTable(starsObject, sortMethod) {
    const labels = {
        distance: document.getElementById('starLegendDistance'),
        weather: document.getElementById('starLegendWeatherProb'),
        precipitationType: document.getElementById('starLegendPrecipitationType'),
        fuel: document.getElementById('starLegendFuel'),
        ascendencyPoints: document.getElementById('starLegendAscendencyPoints')
    };

    Object.values(labels).forEach(label => label.classList.remove('sort-by'));

    if (labels[sortMethod]) {
        labels[sortMethod].classList.add('sort-by');
    }

    Object.entries(labels).forEach(([key, label]) => {
        if (key !== sortMethod) {
            label.classList.add('no-sort');
        }
    });

    let sortedEntries = Object.entries(starsObject).sort(([keyA, starA], [keyB, starB]) => {
        switch (sortMethod) {
            case "distance":
                return starA.distance - starB.distance;
            case "weather":
                const weatherPriority = {
                    "☀": 1,
                    "☁": 2,
                    "☂": 3,
                    "⛰": 4
                };
                const weatherIconA = starA.weatherTendency[0]; 
                const weatherIconB = starB.weatherTendency[0];
                const weatherProbabilityA = starA.weatherTendency[1];
                const weatherProbabilityB = starB.weatherTendency[1];

                if (weatherPriority[weatherIconA] !== weatherPriority[weatherIconB]) {
                    return weatherPriority[weatherIconA] - weatherPriority[weatherIconB];
                }

                return weatherProbabilityB - weatherProbabilityA;
            case "precipitationType":
                return starA.precipitationType.localeCompare(starB.precipitationType);
            case "fuel":
                return starA.fuel - starB.fuel;
            case "ascendencyPoints":
                return starA.ascendencyPoints - starB.ascendencyPoints;
            default:
                return 0;
        }
    });

    const factoryStars = getFactoryStarsArray();
    const manuscripts = getStarsWithAncientManuscripts();

    sortedEntries = sortedEntries.filter(([name, star]) => {
        return !(
            factoryStars.includes(name) &&
            manuscripts.some(entry => entry[1] === name && entry[3] === false)
        );
    });

    return Object.fromEntries(sortedEntries);
}

export function sortAsteroidTable(asteroidsArray, sortMethod) {
    const labels = {
        rarity: document.getElementById('asteroidLegendRarity'),
        distance: document.getElementById('asteroidLegendDistance'),
        eoe: document.getElementById('asteroidLegendEOE'),
        quantity: document.getElementById('asteroidLegendQuantity')
    };

    Object.values(labels).forEach(label => label.classList.remove('sort-by'));

    if (labels[sortMethod]) {
        labels[sortMethod].classList.add('sort-by');
    }

    Object.entries(labels).forEach(([key, label]) => {
        if (key !== sortMethod) {
            label.classList.add('no-sort');
        }
    });

    asteroidsArray.sort((a, b) => {
        const nameA = Object.keys(a)[0];
        const nameB = Object.keys(b)[0];

        const asteroidA = a[nameA];
        const asteroidB = b[nameB];

        const isExhaustedA = asteroidA.quantity[0] === 0;
        const isExhaustedB = asteroidB.quantity[0] === 0;
        const isMinedA = asteroidA.beingMined;
        const isMinedB = asteroidB.beingMined;

        if (isExhaustedA && !isExhaustedB) return 1;
        if (!isExhaustedA && isExhaustedB) return -1;

        if (isMinedA && !isMinedB) return 1;
        if (!isMinedA && isMinedB) return -1;

        switch (sortMethod) {
            case "rarity":
                const rarityOrder = { "Legendary": 1, "Rare": 2, "Uncommon": 3, "Common": 4 };
                return rarityOrder[asteroidA.rarity[0]] - rarityOrder[asteroidB.rarity[0]];

            case "distance":
                return asteroidA.distance[0] - asteroidB.distance[0];

            case "eoe":
                return asteroidA.easeOfExtraction[0] - asteroidB.easeOfExtraction[0];

            case "quantity":
                return asteroidB.quantity[0] - asteroidA.quantity[0];

            default:
                return 0;
        }
    });

    return asteroidsArray;
}

export function renameRocket(rocketId, originalRocketKey) {
    const rocketNameField = document.getElementById(`${rocketId}NameField`);
    if (!rocketNameField) return;

    const newRocketName = (rocketNameField.textContent ?? '').trim(); 
    const newRocketKey = newRocketName.toLowerCase();

    setRocketUserName(rocketId, newRocketName);

    if (originalRocketKey in rocketNames) {
        rocketNames[newRocketKey] = rocketNames[originalRocketKey];
        delete rocketNames[originalRocketKey];
    }
}

export function getStats(statFunctions) {
    Object.keys(statFunctions).forEach(stat => {
        const statElement = document.getElementById(stat);
        if (statElement) {
            const statValue = statFunctions[stat]();
            statElement.innerHTML = `<span>${(typeof statValue === 'number' && !Number.isInteger(statValue)) ? Math.floor(statValue) : statValue}</span>`;
            const classColor = determineStatClassColor(statValue);
            statElement.firstChild.classList.add(classColor);
        }
    });
}

function determineStatClassColor(value) {
    const isString = typeof value === 'string';
    const rawString = isString ? value.trim() : '';
    const normalized = isString ? rawString.replace(/^•/, '').trim().toUpperCase() : value;

    if (
        normalized === 'FALSE' ||
        normalized === 'NO' ||
        normalized === '0' ||
        normalized === 'OFF' ||
        rawString === '⛰' ||
        normalized === 'N/A' ||
        value === false ||
        value === 0
    ) {
        return 'red-disabled-text';
    }

    if (
        rawString === '☁' ||
        rawString === '☂' ||
        normalized === 'TRIPPED'
    ) {
        return 'warning-orange-text';
    }

    return 'green-ready-text';
}

export function createColoniseOpinionProgressBar(parentElement) {
    const diplomacyImpressionBarContainer = document.createElement("div");
    diplomacyImpressionBarContainer.classList.add("diplomacy-impression-bar-container");
    diplomacyImpressionBarContainer.id = 'diplomacyImpressionBar';

    const underBar = document.createElement("div");
    underBar.classList.add("diplomacy-impression-bar-underbar-horizontal");

    const percentageBar = document.createElement("div");
    percentageBar.classList.add("diplomacy-impression-bar-horizontal");

    const progressText = document.createElement("span");
    progressText.classList.add("diplomacy-impression-bar-text");
    progressText.textContent = "Opinion: 0%";

    diplomacyImpressionBarContainer.appendChild(underBar);
    diplomacyImpressionBarContainer.appendChild(percentageBar);
    diplomacyImpressionBarContainer.appendChild(progressText);

    parentElement.appendChild(diplomacyImpressionBarContainer);
}

export function setColoniseOpinionProgressBar(value, parentElement) {
    value = Math.max(0, Math.min(100, value));

    const horizontalBar = parentElement.querySelector(".diplomacy-impression-bar-horizontal");
    const barText = parentElement.querySelector(".diplomacy-impression-bar-text");

    const rect = parentElement.getBoundingClientRect();
    const horizontalWidth = rect.width;

    const percentageBarFill = (value / 100) * horizontalWidth;
    horizontalBar.style.width = `${percentageBarFill}px`;
    barText.textContent = `Impression: ${value}%`;
}


const battleVisualLasers = [];
const battleVisualExplosions = [];


function wrapAngle(angle) {
    return ((angle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
}


function angleLerp(current, target, t) {
    const c = wrapAngle(current);
    const to = wrapAngle(target);
    let diff = to - c;
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;
    return c + diff * t;
}


function updateUnitRenderState(unit) {
    if (typeof unit.renderX !== 'number') unit.renderX = unit.x;
    if (typeof unit.renderY !== 'number') unit.renderY = unit.y;
    const desiredRot = typeof unit.rotation === 'number' ? unit.rotation : 0;
    if (typeof unit.renderRotation !== 'number') unit.renderRotation = desiredRot;

    unit.renderX += (unit.x - unit.renderX) * 0.35;
    unit.renderY += (unit.y - unit.renderY) * 0.35;
    unit.renderRotation = angleLerp(unit.renderRotation, desiredRot, 0.22);
}


function renderBattleLasers(ctx, now) {
    if (!battleVisualLasers.length) return;

    const battleUnits = getBattleUnits();
    const allUnits = battleUnits ? [...battleUnits.player, ...battleUnits.enemy] : [];

    for (let i = battleVisualLasers.length - 1; i >= 0; i--) {
        const shot = battleVisualLasers[i];
        const age = now - shot.t;
        if (age >= shot.life) {
            battleVisualLasers.splice(i, 1);
            continue;
        }

        let x1 = shot.x1;
        let y1 = shot.y1;
        let x2 = shot.x2;
        let y2 = shot.y2;

        if (shot.unitId && allUnits.length) {
            const u = allUnits.find(s => s.id === shot.unitId);
            if (u) {
                x1 = typeof u.renderX === 'number' ? u.renderX : u.x;
                y1 = typeof u.renderY === 'number' ? u.renderY : u.y;
            }
        }

        if (shot.enemyId && allUnits.length) {
            const e = allUnits.find(s => s.id === shot.enemyId);
            if (e) {
                x2 = typeof e.renderX === 'number' ? e.renderX : e.x;
                y2 = typeof e.renderY === 'number' ? e.renderY : e.y;
            }
        }

        const p = age / shot.life;
        const a = (1 - p);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';

        ctx.globalAlpha = 0.18 * a;
        ctx.strokeStyle = shot.color;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.globalAlpha = 0.95 * a;
        ctx.strokeStyle = shot.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.globalAlpha = 0.7 * a;
        ctx.fillStyle = 'rgba(255,255,255,1)';
        ctx.beginPath();
        ctx.arc(x2, y2, 1.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}


function renderBattleExplosions(ctx, now) {
    if (!battleVisualExplosions.length) return;

    for (let i = battleVisualExplosions.length - 1; i >= 0; i--) {
        const ex = battleVisualExplosions[i];
        const age = now - ex.t;
        if (age >= ex.life) {
            battleVisualExplosions.splice(i, 1);
            continue;
        }

        const p = age / ex.life;
        const a = 1 - p;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        const flashA = Math.max(0, Math.min(1, (1 - p * 2.1))) * 0.9;
        if (flashA > 0.001) {
            const r = 10 + p * 46;
            const g = ctx.createRadialGradient(ex.x, ex.y, 0, ex.x, ex.y, r);
            g.addColorStop(0, `rgba(255,255,255,${0.9 * flashA})`);
            g.addColorStop(0.25, `rgba(255,240,180,${0.75 * flashA})`);
            g.addColorStop(0.6, `rgba(255,120,80,${0.35 * flashA})`);
            g.addColorStop(1, 'rgba(255,120,80,0)');
            ctx.globalAlpha = 1;
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(ex.x, ex.y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        const ringA = Math.max(0, Math.min(1, 1 - Math.abs(p - 0.28) / 0.28)) * 0.65;
        if (ringA > 0.001) {
            const rr = 8 + p * 120;
            ctx.globalAlpha = ringA;
            ctx.strokeStyle = 'rgba(255,255,255,1)';
            ctx.lineWidth = Math.max(1, 7 - p * 6);
            ctx.beginPath();
            ctx.arc(ex.x, ex.y, rr, 0, Math.PI * 2);
            ctx.stroke();
        }

        for (const part of ex.parts) {
            const px = ex.x + part.vx * p;
            const py = ex.y + part.vy * p + p * p * 44;
            const pr = part.r * (1 - p);
            ctx.globalAlpha = a * part.a;
            ctx.fillStyle = part.c;
            ctx.beginPath();
            ctx.arc(px, py, pr, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

//-------------------------------------------------------------------------------------------------
//--------------BATTLECANVAS-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------

    export function drawFleets(canvasId, enemyFleets = [], playerFleets = [], createNew = true) {
        //DEBUG
         //enemyFleets = [10,18,26]; //DEBUG
        // playerFleets = [1,0,0,0]; //DEBUG
        //
        const canvas = document.getElementById(canvasId);

        const optionContentElement = document.getElementById(`optionContentTab5`);
        const starData = getStarSystemDataObject('stars', ['destinationStar']);
        if (!canvas)  {
            setNeedNewBattleCanvas(true);
            createBattleCanvas(optionContentElement, starData);
            return;
        }

        const ctx = canvas.getContext('2d');
    
        const canvasWidth = canvas.offsetWidth;
        const canvasHeight = canvas.offsetHeight;
    
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        let idCounter = 0;
    
        const getUnitSize = (unitType) => {
            if (unitType === 'air_marauder') return 6;
            return unitType.includes('air') ? 4 : (unitType.includes('land') ? 8 : 12);
        };
    
        if (!createNew) {
            return;
        }
    
        setBattleOngoing(true); //USE THIS TO BLOCK SAVING IN FUTURE LIKE SET TO FALSE NOT IN COLONISE SCREEN AND STORE BATTLEUNITS WHEN LEAVING THE SCREEN TO RELOAD LATER
        let newUnits = { player: [], enemy: [] };
    
        const fleetTypes = {
            enemy: ['air', 'land', 'sea'],
            player: ['air_scout', 'air_marauder', 'land_landStalker', 'sea_navalStrafer']
        };
    
        const generateFleetUnits = (fleets, owner) => {
            fleets.forEach((fleetCount, i) => {
                const unitType = fleetTypes[owner][i];
                let speed;
                if (owner === 'player') {
                    const resourceFleetName = "fleet" + capitaliseString(unitType.split("_").slice(1).join("_"));
                    speed = getResourceDataObject('space', ['upgrades', resourceFleetName, 'speed']);
                } else if (owner === 'enemy') {
                    let airSpeed = getFleetConstantData("air").speed;
                    let landSpeed = getFleetConstantData("land").speed;
                    let seaSpeed = getFleetConstantData("sea").speed;

                    if (starData.lifeformTraits[2][0] === 'Hypercharge') {
                        airSpeed *= 2;
                        landSpeed *= 2;
                        seaSpeed *= 2;
                    }

                    const speedMap = { air: airSpeed, land: landSpeed, sea: seaSpeed };
                    speed = speedMap[unitType] || 0;
                }
                
                for (let j = 0; j < fleetCount; j++) {
                    newUnits[owner].push(createUnit(unitType, owner, canvasWidth, canvasHeight, idCounter, speed));
                    idCounter++;
                }
            });
        };
    
        generateFleetUnits(enemyFleets, 'enemy');
        generateFleetUnits(playerFleets, 'player');
    
        replaceBattleUnits(newUnits);

        function createUnit(unitType, owner, canvasWidth, canvasHeight, idCounter, speed) {
            const size = getUnitSize(unitType);
            const { x, y, width, height, columnNumber, columnNumberWithinType } = getUnitPosition(unitType, owner, canvasWidth, canvasHeight, size);
            const visionDistanceAir = getFleetConstantData('air').visionDistance;
            const visionDistanceLand = getFleetConstantData('land').visionDistance;
            const visionDistanceSea = getFleetConstantData('sea').visionDistance;
            let accelerationAir = getFleetConstantData('air').acceleration;
            let accelerationLand = getFleetConstantData('land').acceleration;
            let accelerationSea = getFleetConstantData('sea').acceleration;

            if (getPlayerPhilosophy() === 'supremacist' && owner === 'player') {
                const speedUpgradeBoughtTimes = getRepeatableTechMultipliers('3') - 1;
                const multiplier = Math.pow(1.05, speedUpgradeBoughtTimes);
            
                accelerationAir *= multiplier;
                accelerationLand *= multiplier;
                accelerationSea *= multiplier;
            }

            return { 
                id: `${idCounter}_${unitType}`, 
                x, 
                y, 
                width, 
                height,
                size, 
                health: owner === 'enemy' ? (starData.lifeformTraits[2][0] === 'Hive Mind' ? 50 : 100) : getPlayerStartingUnitHealth(),
                owner, 
                speed: speed,
                verticalSpeed: 0,
                horizontalSpeed: 0,
                movementVector: [0, 0],
                columnNumber,
                columnNumberWithinType,
                rotation: owner === 'player' ? Math.PI / 2 : -Math.PI / 2,
                inFormation: false,
                currentGoal: null,
                visionDistance: unitType.includes('air') ? visionDistanceAir : unitType.includes('land') ? visionDistanceLand : visionDistanceSea,
                acceleration: (owner === 'enemy' && starData.lifeformTraits[2][0] === 'Hypercharge') ? (unitType.includes('air') ? accelerationAir : unitType.includes('land') ? accelerationLand : accelerationSea) * 2 : (unitType.includes('air') ? accelerationAir : unitType.includes('land') ? accelerationLand : accelerationSea),
                currentSpeed: 0,
                huntX: null,
                huntY: null,
                disabled: false
            };
        }
    
        function getUnitPosition(unitType, owner, canvasWidth, canvasHeight, size) {
            const padding = 4;
            const boundingBox = size + padding * 2;
            const doubleSpacing = boundingBox * 1.5;
        
            let isPlayer = owner === 'player';
        
            const playerTypeOrder = ['air_scout', 'air_marauder', 'land_landStalker', 'sea_navalStrafer'];
            const enemyTypeOrder = ['air', 'land', 'sea'];
        
            let typeKey = unitType;
        
            if (!getUnitPosition.columns) {
                getUnitPosition.columns = { player: {}, enemy: {} };
                getUnitPosition.columnCounts = { player: {}, enemy: {} };
        
                let playerX = boundingBox;
                let enemyX = canvasWidth - boundingBox;
        
                playerTypeOrder.forEach(type => {
                    getUnitPosition.columns.player[type] = { x: playerX, y: boundingBox };
                    getUnitPosition.columnCounts.player[type] = 0;
                    playerX += doubleSpacing;
                });
        
                enemyTypeOrder.forEach(type => {
                    getUnitPosition.columns.enemy[type] = { x: enemyX, y: boundingBox };
                    getUnitPosition.columnCounts.enemy[type] = 0;
                    enemyX -= doubleSpacing;
                });
            }
        
            let position = getUnitPosition.columns[owner][typeKey];
        
            if (position.y + boundingBox > canvasHeight) {
                position.y = boundingBox;
                position.x += isPlayer ? doubleSpacing : -doubleSpacing;
                getUnitPosition.columnCounts[owner][typeKey]++;
            }
        
            let columnNumber;

            if (isPlayer) {
                columnNumber = playerTypeOrder.indexOf(typeKey) + 1;
            } else {
                columnNumber = enemyTypeOrder.indexOf(typeKey) + 1;
            }
            
            const columnNumberWithinType = getUnitPosition.columnCounts[owner][typeKey] + 1;
        
            let newPosition = { x: position.x, y: position.y };
            position.y += boundingBox;
        
            if (owner === 'player') {
                newPosition.x -= 150;
            } else if (owner === 'enemy') {
                newPosition.x += 150;
            }
        
            return { 
                ...newPosition, 
                width: size, 
                height: size, 
                columnNumber,
                columnNumberWithinType
            };
        } 
    }           
    
    function drawUnit(ctx, unit) {
        ctx.save();
        const x = typeof unit.renderX === 'number' ? unit.renderX : unit.x;
        const y = typeof unit.renderY === 'number' ? unit.renderY : unit.y;
        ctx.translate(x, y);

        if (unit.id.includes('air')) {
            ctx.rotate(typeof unit.renderRotation === 'number' ? unit.renderRotation : unit.rotation);
        }
    
        switch (unit.id.split('_')[1]) {
            case 'air':
            case 'air_scout':
            case 'air_marauder':
                ctx.save();
                ctx.globalAlpha = 0.22;
                ctx.fillStyle = 'rgba(255,255,255,1)';
                ctx.beginPath();
                ctx.moveTo(0, -unit.size * 0.55);
                ctx.lineTo(-unit.size * 0.35, unit.size * 0.65);
                ctx.lineTo(unit.size * 0.35, unit.size * 0.65);
                ctx.closePath();
                ctx.fill();
                ctx.restore();

                ctx.beginPath();
                ctx.moveTo(0, -unit.size);
                ctx.lineTo(-unit.size * 1.1, unit.size);
                ctx.lineTo(0, unit.size * 0.55);
                ctx.lineTo(unit.size * 1.1, unit.size);
                ctx.closePath();
                ctx.fill();

                ctx.globalAlpha = 0.5;
                ctx.strokeStyle = 'rgba(0,0,0,0.35)';
                ctx.lineWidth = Math.max(1, unit.size * 0.18);
                ctx.stroke();
                ctx.globalAlpha = 1;
                break;
            case 'land':
            case 'land_landStalker':
                ctx.beginPath();
                if (typeof ctx.roundRect === 'function') {
                    ctx.roundRect(-unit.size, -unit.size * 0.55, unit.size * 2, unit.size * 1.1, unit.size * 0.35);
                } else {
                    ctx.rect(-unit.size, -unit.size * 0.55, unit.size * 2, unit.size * 1.1);
                }
                ctx.fill();

                ctx.globalAlpha = 0.55;
                ctx.strokeStyle = 'rgba(0,0,0,0.35)';
                ctx.lineWidth = Math.max(1, unit.size * 0.16);
                ctx.stroke();
                ctx.globalAlpha = 1;

                ctx.fillStyle = 'rgba(255,255,255,0.18)';
                ctx.fillRect(-unit.size * 0.25, -unit.size * 0.75, unit.size * 0.5, unit.size * 0.55);
                break;
            case 'sea':
            case 'sea_navalStrafer':
                ctx.save();
                ctx.scale(1.35, 0.85);
                ctx.beginPath();
                ctx.arc(0, 0, unit.size / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                ctx.globalAlpha = 0.55;
                ctx.strokeStyle = 'rgba(0,0,0,0.28)';
                ctx.lineWidth = Math.max(1, unit.size * 0.14);
                ctx.beginPath();
                ctx.arc(0, 0, unit.size * 0.45, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
                break;
        }
    
        ctx.restore();
    }  

    export function explosionAnimation(x, y) {
        const animationContainer = document.getElementById('explosionAnimation');
        animationContainer.classList.remove('invisible');
        animationContainer.classList.add('animate-explosion');
        
        animationContainer.style.left = `${x}px`;
        animationContainer.style.top = `${y}px`;

        const now = performance.now();
        const parts = [];
        const count = 70;
        const palette = [
            'rgba(255,255,255,1)',
            'rgba(255,240,180,1)',
            'rgba(255,170,90,1)',
            'rgba(255,90,70,1)',
            'rgba(255,0,255,1)',
            'rgba(64,224,208,1)'
        ];
        for (let i = 0; i < count; i++) {
            const a = (i / count) * Math.PI * 2;
            const sp = 70 + Math.random() * 220;
            const spark = Math.random() < 0.35;
            parts.push({
                vx: Math.cos(a) * sp,
                vy: Math.sin(a) * sp,
                r: (spark ? 1.2 : 2.8) + Math.random() * (spark ? 2.0 : 4.4),
                a: (spark ? 0.55 : 0.35) + Math.random() * (spark ? 0.45 : 0.6),
                c: palette[Math.floor(Math.random() * palette.length)]
            });
        }
        battleVisualExplosions.push({ x, y, t: now, life: 980, parts });
        
        setTimeout(() => {
            animationContainer.classList.remove('animate-explosion');
            animationContainer.classList.add('invisible');
        }, 1250);
    }

    export function shootLaser(unit, enemy) {
        let strokeColor = "transparent";
    
        if (unit.currentGoal && unit.currentGoal.id === enemy.id) {
            if (unit.owner === "player") {
                if (unit.id.includes('air')) {
                    strokeColor = "magenta";
                } else if (unit.id.includes('sea')) {
                    strokeColor = "turquoise";
                } else if (unit.id.includes('land')) {
                    strokeColor = "yellow";
                }
            } else if (unit.owner === "enemy") {
                if (unit.id.includes('air')) {
                    strokeColor = "rgb(255, 0, 255)";
                } else if (unit.id.includes('sea')) {
                    strokeColor = "rgb(64, 224, 208)";
                } else if (unit.id.includes('land')) {
                    strokeColor = "rgb(255, 255, 0)";
                }
            }
        }
    
        const x1 = typeof unit.renderX === 'number' ? unit.renderX : unit.x;
        const y1 = typeof unit.renderY === 'number' ? unit.renderY : unit.y;
        const x2 = typeof enemy.renderX === 'number' ? enemy.renderX : enemy.x;
        const y2 = typeof enemy.renderY === 'number' ? enemy.renderY : enemy.y;

        // Keep lasers essentially "instant" (1-2 frames) and anchored to current unit positions.
        battleVisualLasers.push({
            unitId: unit.id,
            enemyId: enemy.id,
            x1,
            y1,
            x2,
            y2,
            color: strokeColor,
            t: performance.now(),
            life: 34
        });
    }

    
    export function createBattleCanvas(optionContentElement, starData) {
        const playerFleetScout = getResourceDataObject('space', ['upgrades', 'fleetScout', 'quantity']);
        const playerFleetMarauder = getResourceDataObject('space', ['upgrades', 'fleetMarauder', 'quantity']);
        const playerFleetLandStalker = getResourceDataObject('space', ['upgrades', 'fleetLandStalker', 'quantity']);
        const playerFleetNavalStrafer = getResourceDataObject('space', ['upgrades', 'fleetNavalStrafer', 'quantity']);
        const enemyFleets = [starData.enemyFleets.air, starData.enemyFleets.land, starData.enemyFleets.sea];
        const playerFleets = [playerFleetScout, playerFleetMarauder, playerFleetLandStalker, playerFleetNavalStrafer];

        if (!document.getElementById('battleCanvas') && getNeedNewBattleCanvas()) {
            const battleContainer = document.createElement('div');
            battleContainer.classList.add('battle-container');
            battleContainer.id = 'battleCanvasContainer';

            const canvas = document.createElement('canvas');
            canvas.id = 'battleCanvas';
            
            battleContainer.appendChild(canvas);

            const explosion = document.createElement('div');
            explosion.id = 'explosionAnimation';
            explosion.classList.add('invisible', 'explosion');
            battleContainer.appendChild(explosion);
            
            optionContentElement.prepend(battleContainer);

            canvas.style.width = '100%';
            canvas.style.height = '100%';
            
            if (getBattleUnits()) {
                const battleUnits = getBattleUnits();
                
                if (battleUnits.player.length === 0 && battleUnits.enemy.length === 0) {
                    drawFleets('battleCanvas', enemyFleets, playerFleets, true);
                } else {
                    drawFleets('battleCanvas', enemyFleets, playerFleets, false);
                }
            }
            setNeedNewBattleCanvas(false);
        }
    }

    export function moveBattleUnits(canvasId) {
        const canvas = document.getElementById(canvasId);

        const optionContentElement = document.getElementById(`optionContentTab5`);
        const starData = getStarSystemDataObject('stars', ['destinationStar']);
        if (!canvas)  {
            setNeedNewBattleCanvas(true);
            createBattleCanvas(optionContentElement, starData);
            return;
        }

        const ctx = canvas.getContext('2d');
        const battleUnits = getBattleUnits();
    
        if (!battleUnits) return;
    
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

        const now = performance.now();

        const highestColumnEnemy = battleUnits.enemy.reduce((max, unit) =>
            Math.max(max, unit.columnNumber || 0), 0);
        
        const highestColumnNumberWithinHighestColumnEnemy = battleUnits.enemy
            .filter(unit => unit.columnNumber === highestColumnEnemy)
            .reduce((max, unit) => Math.max(max, unit.columnNumberWithinType || 0), 0);
        
        const lowestColumnPlayer = battleUnits.player.reduce((min, unit) =>
            Math.min(min, unit.columnNumber || Infinity), Infinity);
        
        const lowestColumnNumberWithinLowestColumnPlayer = battleUnits.player
            .filter(unit => unit.columnNumber === lowestColumnPlayer)
            .reduce((min, unit) => Math.min(min, unit.columnNumberWithinType || Infinity), Infinity);
        
        const lastPlayerUnits = battleUnits.player.filter(unit => 
            unit.columnNumber === lowestColumnPlayer && unit.columnNumberWithinType === lowestColumnNumberWithinLowestColumnPlayer
        );

        const lastEnemyUnits = battleUnits.enemy.filter(unit => 
            unit.columnNumber === highestColumnEnemy && unit.columnNumberWithinType === highestColumnNumberWithinHighestColumnEnemy
        );

        const lastPlayerOnScreen = lastPlayerUnits.some(unit => unit.x >= 10);
        const lastEnemyOnScreen = lastEnemyUnits.some(unit => unit.x <= (canvas.offsetWidth - 10));

        const allUnitsOnScreen = lastPlayerOnScreen && lastEnemyOnScreen;

        if (!getBattleTriggeredByPlayer() && !getFormationGoal()) {
            setFormationGoal(moveIntoFormation(canvas));
        }

        const formationGoals = getFormationGoal();

        const getFormationYForUnit = (unitId) => {
            if (!Array.isArray(formationGoals)) return null;
            const goal = formationGoals.find(g => g.id === unitId);
            return goal ? goal.y : null;
        };
    
        battleUnits.player.forEach(unit => {
            if (!unit.hasBeenOnCanvas && unit.x > 3 && unit.y >= 0) {
                unit.hasBeenOnCanvas = true;
            }
    
            if (!allUnitsOnScreen && !getBattleTriggeredByPlayer()) {
                unit.x += 1;
                const targetY = getFormationYForUnit(unit.id);
                if (typeof targetY === 'number') {
                    unit.y = targetY;
                }
            } else if (unit.hasBeenOnCanvas) {

                if (getBattleTriggeredByPlayer()) {
                    calculateMovement(unit, canvas, 'player', 'fight');
                } else {
                    if (allUnitsOnScreen) {
                        unit.inFormation = true;
                    }
                }
            } else {
                console.log('unit drawn out of bounds of ever being on canvas:', unit);
            }
        });
    
        battleUnits.enemy.forEach(unit => {
            if (!unit.hasBeenOnCanvas && unit.x + unit.width < (canvas.offsetWidth + 1) && unit.y >= 0) {
                unit.hasBeenOnCanvas = true;
            }
    
            if (!allUnitsOnScreen && !getBattleTriggeredByPlayer()) {
                unit.x -= 1;
                const targetY = getFormationYForUnit(unit.id);
                if (typeof targetY === 'number') {
                    unit.y = targetY;
                }
            } else if (unit.hasBeenOnCanvas) {
                if (getBattleTriggeredByPlayer()) {
                    calculateMovement(unit, canvas, 'enemy', 'fight');
                } else {
                    if (allUnitsOnScreen) {
                        unit.inFormation = true;
                    }
                }
            } else {
                console.log('unit drawn out of bounds of ever being on canvas:', unit);
            }
        });

        if (!getBattleTriggeredByPlayer() && allUnitsOnScreen) {
            setInFormation(true);
        }

        battleUnits.player.forEach(updateUnitRenderState);
        battleUnits.enemy.forEach(updateUnitRenderState);
    
        battleUnits.player.forEach(unit => {
            if (!unit.disabled) {
                // ctx.fillStyle = 
                //     unit.currentGoal?.id === 'hunt' ? 'magenta' : 
                //     (unit.currentGoal?.id ? 'blue' : 
                //     getComputedStyle(document.querySelector('[data-theme]')).getPropertyValue('--ready-text').trim());
                
                const themeElement = document.querySelector('[data-theme]');
                ctx.fillStyle = themeElement ? getComputedStyle(themeElement).getPropertyValue('--ready-text').trim() : 'white';
                drawUnit(ctx, unit);
            }

        });
        
        battleUnits.enemy.forEach(unit => {
            if (!unit.disabled) {
                            // ctx.fillStyle = 
            //     unit.currentGoal?.id === 'hunt' ? 'magenta' : 
            //     (unit.currentGoal?.id ? 'blue' : 
            //     getComputedStyle(document.querySelector('[data-theme]')).getPropertyValue('--disabled-text').trim());
            
            const themeElement = document.querySelector('[data-theme]');
            ctx.fillStyle = themeElement ? getComputedStyle(themeElement).getPropertyValue('--disabled-text').trim() : 'white';
            drawUnit(ctx, unit);
            }
        });

        renderBattleExplosions(ctx, now);
        renderBattleLasers(ctx, now);
    }        

    function moveIntoFormation(canvas) {
        const battleUnits = getBattleUnits();
        
        const totalColumnsPlayer = getTotalColumnsData(battleUnits.player);
        const totalColumnsEnemy = getTotalColumnsData(battleUnits.enemy);
    
        const columnHeight = canvas.offsetHeight - 4;
        
        let newPositions = [];
    
        function calculatePositions(units, totalColumns) {
            totalColumns.forEach(column => {
                const columnKey = `${column.columnNumber}-${column.columnNumberWithinType}`;
                const unitCount = column.unitCount;
                const unitSpacing = columnHeight / (unitCount + 1);
    
                const columnUnits = units.filter(unit => 
                    `${unit.columnNumber}-${unit.columnNumberWithinType}` === columnKey
                );
    
                columnUnits.forEach((unit, index) => {
                    const yPosition = unitSpacing * (index + 1);
                    newPositions.push({ id: unit.id, y: yPosition });
                });
            });
        }
    
        calculatePositions(battleUnits.player, totalColumnsPlayer);
        calculatePositions(battleUnits.enemy, totalColumnsEnemy);
    
        return newPositions;
    }    
    
    function getTotalColumnsData(units) {
        const columnMap = new Map();
        
        units.forEach(unit => {
            const key = `${unit.columnNumber}-${unit.columnNumberWithinType}`;
            
            if (!columnMap.has(key)) {
                columnMap.set(key, {
                    columnNumber: unit.columnNumber,
                    columnNumberWithinType: unit.columnNumberWithinType,
                    unitCount: 0,
                    unitHeights: []
                });
            }
    
            const columnData = columnMap.get(key);
            columnData.unitCount += 1;
            columnData.unitHeights.push(unit.height);
        });
    
        return Array.from(columnMap.values());
    }

    function calculateMovementVector(unit, type, canvas) {
        let movementVector = [0, 0];
    
        switch (type) {
            case 'formation':
                const formationGoals = getFormationGoal();
                const goal = formationGoals.find(goal => goal.id === unit.id);
    
                if (goal) {
                    const goalY = goal.y;
                
                    if (unit.y < goalY) {
                        movementVector = [0, 100];
                    } else {
                        const battleUnits = getBattleUnits();
                        const owner = unit.owner;
                        const unitIndex = battleUnits[owner].findIndex(u => u.id === unit.id);
                        
                        if (unitIndex !== -1) {
                            battleUnits[owner][unitIndex].inFormation = true;
                            setBattleUnits(owner, battleUnits[owner]);
                        }
                    }
                }
                
                if (
                    getBattleUnits().player.every(unit => unit.inFormation) &&
                    getBattleUnits().enemy.every(unit => unit.inFormation)
                ) {
                    setInFormation(true);
                }                                                                         

                break;
            
            case 'fight':
                movementVector = calculateMovementVectorToTarget(unit, unit.currentGoal, canvas);
                break;
        }
    
        return movementVector;
    }   

    function checkCanvasBounds(unit, canvas) {
        if (unit.x < 0) {
            unit.x = 10;
        } else if (unit.x > canvas.offsetWidth) {
            unit.x = canvas.offsetWidth - 10;
        }
        
        if (unit.y < 0) {
            unit.y = 10;
        } else if (unit.y > canvas.offsetHeight) {
            unit.y = canvas.offsetHeight - 10;
        }
    }

    function calculateMovement(unit, canvas, key, type) {
        checkCanvasBounds(unit, canvas);
        const newMovementVector = calculateMovementVector(unit, type, canvas);

        let baseSpeed;
    
        if (type === "formation") {
            baseSpeed = 3 + (Math.random() * 3 - 1);
        } else {
            let acceleration = unit.acceleration; // /3 is DEBUG
            unit.currentSpeed = Math.min(unit.speed, unit.currentSpeed + acceleration);
            
            baseSpeed = unit.currentSpeed;
        }
    
        const xFactor = newMovementVector[0] / 100;
        const yFactor = newMovementVector[1] / 100;
            
        unit.horizontalSpeed = Math.max(-unit.speed, Math.min(unit.speed, baseSpeed * xFactor));
        unit.verticalSpeed = Math.max(-unit.speed, Math.min(unit.speed, baseSpeed * yFactor));        

        if (type !== 'formation') {
            if (newMovementVector[0] < 0) {
                unit.horizontalSpeed = -Math.abs(unit.horizontalSpeed);
            } else {
                unit.horizontalSpeed = Math.abs(unit.horizontalSpeed);
            }
            
            unit.horizontalSpeed = Math.max(-unit.speed, Math.min(unit.horizontalSpeed, unit.speed));
            
            if (newMovementVector[1] < 0) {
                unit.verticalSpeed = -Math.abs(unit.verticalSpeed);
            } else {
                unit.verticalSpeed = Math.abs(unit.verticalSpeed);
            }
            
            unit.verticalSpeed = Math.max(-unit.speed, Math.min(unit.verticalSpeed, unit.speed));
        }
    
        unit.x += unit.horizontalSpeed;
        unit.y += unit.verticalSpeed;
        unit.movementVector = newMovementVector;
        
        if (type === 'fight') {
            updateUnitRotation(newMovementVector, unit);  
        }

        const latestUnits = getBattleUnits()[key];
        const latestUnit = latestUnits.find(u => u.id === unit.id);

        const mergedUnit = {
            ...unit,
            currentGoal: latestUnit.currentGoal !== unit.currentGoal ? latestUnit.currentGoal : unit.currentGoal,
            huntX: latestUnit.huntX !== unit.huntX ? latestUnit.huntX : unit.huntX,
            huntY: latestUnit.huntY !== unit.huntY ? latestUnit.huntY : unit.huntY
        };

        const updatedUnits = latestUnits.map(u => (u.id === unit.id ? mergedUnit : u));
        setBattleUnits(key, updatedUnits);
    }

    function updateUnitRotation(movementVector, unit) {
        const x = movementVector[0];
        const y = movementVector[1];
        const desiredAngle = Math.atan2(y, x) + Math.PI / 2;
        unit.rotation = desiredAngle;
        return unit;
    }

    export function resetTabsOnRebirth() {
        const tabData = [
            { id: "tab1", classes: ["tab", "selected"], dataTab: "", dataName: "Resources", text: "Resources" },
            { id: "tab2", classes: ["tab", "tab-not-yet"], dataTab: "basicPowerGeneration", dataName: "Energy", text: "???" },
            { id: "tab3", classes: ["tab"], dataTab: "", dataName: "Research", text: "Research" },
            { id: "tab4", classes: ["tab", "tab-not-yet"], dataTab: "compounds", dataName: "Compounds", text: "???" },
            { id: "tab5", classes: ["tab", "tab-not-yet"], dataTab: "stellarCartography", dataName: "Interstellar", text: "???" },
            { id: "tab6", classes: ["tab", "tab-not-yet"], dataTab: "atmosphericTelescopes", dataName: "Space Mining", text: "???" },
            { id: "tab7", classes: ["tab", "tab-not-yet"], dataTab: "apAwardedThisRun", dataName: "Galactic", text: "???" },
            { id: "tab8", classes: ["tab"], dataTab: "", dataName: "☰", text: "☰" }
        ];
        
        tabData.forEach(tab => {
            const element = document.getElementById(tab.id);
            if (element) {
                element.className = tab.classes.join(" ");
                element.setAttribute("data-tab", tab.dataTab);
                element.setAttribute("data-name", tab.dataName);
                element.textContent = tab.text;
            }
        });
    }

    //reset classes on rebirth
    export function resetTab1ClassesRebirth() {
        const collapsibles = document.querySelectorAll('.collapsible');
        collapsibles.forEach(collapsible => {
            if (collapsible.id === "gas" || collapsible.id === "solids") {
                collapsible.classList.add('open');
            } else {
                collapsible.classList.remove('open');
            }
        });
    
        const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
        collapsibleHeaders.forEach(header => {
            header.classList.add('active');
        });
    
        const collapsibleContents = document.querySelectorAll('.collapsible-content');
        collapsibleContents.forEach(content => {
            content.classList.add('open');
        });
    
        const rowSideMenuItems = document.querySelectorAll('.row-side-menu');
        rowSideMenuItems.forEach(row => {
            if (row.classList.contains('invisible')) {
                row.classList.add('invisible');
            } else {
                row.classList.remove('invisible');
            }
        });
    
        const invisibleElements = document.querySelectorAll('.row-side-menu');
        invisibleElements.forEach(element => {
            if (element.querySelector('.invisible')) {
                element.classList.add('invisible');
            } else {
                element.classList.remove('invisible');
            }
        });
    
        const hydrogenRow = document.getElementById('hydrogenOption').closest('.row-side-menu');
        hydrogenRow.classList.remove('invisible');
    
        const heliumRow = document.getElementById('heliumOption').closest('.row-side-menu');
        heliumRow.classList.add('invisible');
    
        const neonRow = document.getElementById('neonOption').closest('.row-side-menu');
        neonRow.classList.add('invisible');
    
        const oxygenRow = document.getElementById('oxygenOption').closest('.row-side-menu');
        oxygenRow.classList.add('invisible');
    
        const carbonRow = document.getElementById('carbonOption').closest('.row-side-menu');
        carbonRow.classList.add('invisible');
    
        const siliconRow = document.getElementById('siliconOption').closest('.row-side-menu');
        siliconRow.classList.add('invisible');
    
        const sodiumRow = document.getElementById('sodiumOption').closest('.row-side-menu');
        sodiumRow.classList.add('invisible');
    
        const ironRow = document.getElementById('ironOption').closest('.row-side-menu');
        ironRow.classList.add('invisible');
    }

    export function resetTab2ClassesRebirth() {
        const collapsibles = document.querySelectorAll('.collapsible');
        collapsibles.forEach(collapsible => {
            if (collapsible.id === "energyBuildings") {
                collapsible.classList.add('open');
            } else {
                collapsible.classList.remove('open');
            }
        });
    
        const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
        collapsibleHeaders.forEach(header => {
            header.classList.add('active');
        });
    
        const collapsibleContents = document.querySelectorAll('.collapsible-content');
        collapsibleContents.forEach(content => {
            content.classList.add('open');
        });
    
        const rowSideMenuItems = document.querySelectorAll('.row-side-menu');
        rowSideMenuItems.forEach(row => {
            if (row.classList.contains('invisible')) {
                row.classList.add('invisible');
            } else {
                row.classList.remove('invisible');
            }
        });
    
        const energyStats = document.getElementById('energyConsumptionStats');
        energyStats?.classList.add('invisible');
    
        const energyRow = document.getElementById('energyOption').closest('.row-side-menu');
        energyRow.classList.remove('invisible');
    
        const powerPlant1Row = document.getElementById('powerPlant1Option').closest('.row-side-menu');
        powerPlant1Row.classList.add('invisible');
    
        const powerPlant2Row = document.getElementById('powerPlant2Option').closest('.row-side-menu');
        powerPlant2Row.classList.add('invisible');
    
        const powerPlant3Row = document.getElementById('powerPlant3Option').closest('.row-side-menu');
        powerPlant3Row.classList.add('invisible');
    }   
    
    export function resetTab4ClassesRebirth() {
        const collapsibles = document.querySelectorAll('.tab-4 .collapsible');
        collapsibles.forEach(collapsible => {
            if (collapsible.id === "liquidCompounds" || collapsible.id === "solidCompounds" ||
                collapsible.id === "hydroCarbons" || collapsible.id === "silicates" || collapsible.id === "metalAlloys") {
                collapsible.classList.add('open', 'invisible');
            } else {
                collapsible.classList.remove('open', 'invisible');
            }
        });
    
        const collapsibleHeaders = document.querySelectorAll('.tab-4 .collapsible-header');
        collapsibleHeaders.forEach(header => {
            header.classList.add('active');
        });
    
        const collapsibleContents = document.querySelectorAll('.tab-4 .collapsible-content');
        collapsibleContents.forEach(content => {
            content.classList.add('open');
        });
    
        const rowSideMenuItems = document.querySelectorAll('.tab-4 .row-side-menu');
        rowSideMenuItems.forEach(row => {
            if (row.classList.contains('invisible')) {
                row.classList.add('invisible');
            } else {
                row.classList.remove('invisible');
            }
        });
    
        const specificInvisibleRows = [
            'dieselOption', 'waterOption', 'glassOption', 'concreteOption', 'steelOption', 'titaniumOption'
        ];
        
        specificInvisibleRows.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const row = element.closest('.row-side-menu');
                row.classList.add('invisible');
            }
        });
    }

    export function resetTab5ClassesRebirth() {
        const collapsibles = document.querySelectorAll('.collapsible');
        collapsibles.forEach(collapsible => {
            if (collapsible.id === "starMapOption" || collapsible.id === "starShipOption") {
                collapsible.classList.add('open');
            } else {
                collapsible.classList.remove('open');
            }
        });

        const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
        collapsibleHeaders.forEach(header => {
            header.classList.add('active');
        });
    
        const collapsibleContents = document.querySelectorAll('.collapsible-content');
        collapsibleContents.forEach(content => {
            content.classList.add('open');
        });
    
        const starDataRow = document.getElementById('starDataOption').closest('.row-side-menu');
        starDataRow.classList.add('invisible');
    
        const starShipRow = document.getElementById('starShipOption').closest('.row-side-menu');
        starShipRow.classList.remove('invisible');
    
        const fleetHangarRow = document.getElementById('fleetHangarOption').closest('.row-side-menu');
        fleetHangarRow.classList.add('invisible');
    
        const coloniseRow = document.getElementById('coloniseOption').closest('.row-side-menu');
        coloniseRow.classList.add('invisible');
    }

    export function resetTab6ClassesRebirth() {
        const collapsibleHeaders = document.querySelectorAll('.tab-6 .collapsible-header');
        collapsibleHeaders.forEach(header => {
            header.classList.add('active');
        });
    
        const collapsibleContents = document.querySelectorAll('.tab-6 .collapsible-content');
        collapsibleContents.forEach(content => {
            content.classList.add('open');
        });
    
        const rowSideMenuItems = document.querySelectorAll('.tab-6 .row-side-menu');
        rowSideMenuItems.forEach(row => {
            row.classList.add('invisible');
        });
    
        const visibleRows = ['spaceTelescopeOption'];
        visibleRows.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const row = element.closest('.row-side-menu');
                row.classList.remove('invisible');
            }
        });
    }

export function createMegaStructureDiagram() {
    const container = document.createElement('div');
    container.className = 'mega-structure-diagram-container';
    container.id = 'megaStructureDiagramContainer';
    attachSharedTooltip(container, buildForceFieldTooltipContent);

    const forceFieldBox = document.createElement('div');
    forceFieldBox.className = 'force-field-container';
    forceFieldBox.id = 'forceFieldBox';
    container.appendChild(forceFieldBox);

    const starSystemBox = document.createElement('div');
    starSystemBox.className = 'star-system-container';
    starSystemBox.id = 'starSystemBox';
    container.appendChild(starSystemBox);

    const dysonSphereContainer = document.createElement('div');
    dysonSphereContainer.className = 'dyson-sphere-container';
    dysonSphereContainer.id = 'dysonSphereContainer';
    container.appendChild(dysonSphereContainer);

    const celestialProcessingCoreContainer = document.createElement('div');
    celestialProcessingCoreContainer.className = 'celestial-processing-core-container';
    celestialProcessingCoreContainer.id = 'celestialProcessingCoreContainer';
    container.appendChild(celestialProcessingCoreContainer);

    const plasmaForgeContainer = document.createElement('div');
    plasmaForgeContainer.className = 'plasma-forge-container';
    plasmaForgeContainer.id = 'plasmaForgeContainer';
    container.appendChild(plasmaForgeContainer);

    const galacticMemoryArchiveContainer = document.createElement('div');
    galacticMemoryArchiveContainer.className = 'galactic-memory-archive-container';
    galacticMemoryArchiveContainer.id = 'galacticMemoryArchiveContainer';
    container.appendChild(galacticMemoryArchiveContainer);

    return container;
}

export function createMegaStructureTable() {
    const tableContainer = document.createElement('div');
    tableContainer.className = 'mega-structure-table-container';
    tableContainer.id = 'tableContainer';

    const infoGrid = document.createElement('div');
    infoGrid.className = 'mega-info-grid';

    const megaStructures = [
        {
            name: 'Dyson Sphere',
            key: 'DysonSphere',
            research: ['ds1', 'ds2', 'ds3', 'ds4', 'ds5'],
            effects: ['effect1', 'effect2', 'effect3', 'effect4', 'effect5']
        },
        {
            name: 'Celestial Processing Core',
            key: 'CelestialProcessingCore',
            research: ['cpc1', 'cpc2', 'cpc3', 'cpc4', 'cpc5'],
            effects: ['effect1', 'effect2', 'effect3', 'effect4', 'effect5']
        },
        {
            name: 'Plasma Forge',
            key: 'PlasmaForge',
            research: ['pf1', 'pf2', 'pf3', 'pf4', 'pf5'],
            effects: ['effect1', 'effect2', 'effect3', 'effect4', 'effect5']
        },
        {
            name: 'Galactic Memory Archive',
            key: 'GalacticMemoryArchive',
            research: ['gma1', 'gma2', 'gma3', 'gma4', 'gma5'],
            effects: ['effect1', 'effect2', 'effect3', 'effect4', 'effect5']
        }
    ];

    megaStructures.forEach(structure => {
        const nameCell = document.createElement('div');
        nameCell.className = 'info-cell name-cell';
        nameCell.id = `name${structure.key}`;
        nameCell.textContent = structure.name;
        infoGrid.appendChild(nameCell);

        const researchCell = document.createElement('div');
        researchCell.className = 'info-cell research-cell';
        structure.research.forEach((text, index) => {
            const line = document.createElement('div');
            line.textContent = text;
            line.id = `research${structure.key}${index + 1}`;
            researchCell.appendChild(line);
        });
        infoGrid.appendChild(researchCell);

        const effectCell = document.createElement('div');
        effectCell.className = 'info-cell effect-cell';
        structure.effects.forEach((text, index) => {
            const line = document.createElement('div');
            line.textContent = text;
            line.id = `effect${structure.key}${index + 1}`;
            effectCell.appendChild(line);
        });
        infoGrid.appendChild(effectCell);
    });

    tableContainer.appendChild(infoGrid);
    return tableContainer;
}


let activeWinCinematicPromise = null;


export function playWinCinematic(durationMs = 14000) {
    if (activeWinCinematicPromise) return activeWinCinematicPromise;

    setAchievementFlagArray('completeGame', 'add');

    activeWinCinematicPromise = new Promise((resolve) => {
        const existing = document.getElementById('winCinematicOverlay');
        if (existing) {
            resolve();
            activeWinCinematicPromise = null;
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'winCinematicOverlay';
        overlay.style.position = 'fixed';
        overlay.style.left = '0';
        overlay.style.top = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.zIndex = '95000';
        overlay.style.background = 'rgba(0, 0, 0, 1)';
        overlay.style.opacity = '1';
        overlay.style.transition = 'opacity 900ms ease';
        overlay.style.pointerEvents = 'auto';
        overlay.style.userSelect = 'none';

        const canvas = document.createElement('canvas');
        canvas.id = 'winCinematicCanvas';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';

        overlay.appendChild(canvas);
        document.body.appendChild(overlay);

        const previousOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = 'hidden';

        const stopEvent = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const blockedPointerEvents = [
            'click',
            'dblclick',
            'contextmenu',
            'mousedown',
            'mouseup',
            'mousemove',
            'pointerdown',
            'pointerup',
            'pointermove',
            'touchstart',
            'touchmove',
            'touchend'
        ];

        blockedPointerEvents.forEach(type => overlay.addEventListener(type, stopEvent, { capture: true }));
        overlay.addEventListener('wheel', stopEvent, { capture: true, passive: false });

        const keyBlocker = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (typeof e.stopImmediatePropagation === 'function') {
                e.stopImmediatePropagation();
            }
        };
        document.addEventListener('keydown', keyBlocker, true);
        document.addEventListener('keyup', keyBlocker, true);

        const ctx = canvas.getContext('2d', { alpha: true });

        const clamp01 = (v) => Math.max(0, Math.min(1, v));
        const lerp = (a, b, t) => a + (b - a) * t;
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
        const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
        const rnd = (min, max) => min + Math.random() * (max - min);

        const holdAfterTitleMs = 13000;
        const totalDurationMs = durationMs + holdAfterTitleMs;

        const stars = [];
        const landBlobs = [];
        const cloudPuffs = [];
        const ringPieces = [];
        const ships = [];
        const troops = [];
        const fireworks = [];

        let nextShipSpawnAt = 0;
        let nextFireworkAt = 0;

        let rafId = null;
        let finished = false;
        let resizeHandler = null;

        const resize = () => {
            const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
            canvas.width = Math.floor(window.innerWidth * dpr);
            canvas.height = Math.floor(window.innerHeight * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const initScene = () => {
            stars.length = 0;
            landBlobs.length = 0;
            cloudPuffs.length = 0;
            ringPieces.length = 0;

            const w = window.innerWidth;
            const h = window.innerHeight;
            const starCount = Math.floor(180 + (w * h) / 12000);
            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    r: rnd(0.4, 1.6),
                    tw: rnd(0, Math.PI * 2),
                    s: rnd(0.15, 0.8)
                });
            }

            for (let i = 0; i < 36; i++) {
                const a = rnd(-Math.PI, Math.PI);
                const d = Math.sqrt(Math.random()) * 0.92;
                landBlobs.push({
                    x: Math.cos(a) * d,
                    y: Math.sin(a) * d,
                    r: rnd(0.05, 0.14),
                    hue: rnd(92, 140)
                });
            }

            for (let i = 0; i < 28; i++) {
                const a = rnd(-Math.PI, Math.PI);
                const d = Math.sqrt(Math.random()) * 0.88;
                cloudPuffs.push({
                    x: Math.cos(a) * d,
                    y: Math.sin(a) * d,
                    r: rnd(0.05, 0.16),
                    o: rnd(0.05, 0.16),
                    sp: rnd(-0.25, 0.25)
                });
            }

            const pieceCount = 22;
            for (let i = 0; i < pieceCount; i++) {
                const start = rnd(0, Math.PI * 2);
                const len = rnd(0.12, 0.34);
                const end = start + len;
                const mid = (start + end) / 2;

                ringPieces.push({
                    start,
                    end,
                    mid,
                    radJitter: rnd(-0.03, 0.06),
                    thick: rnd(0.8, 1.35),
                    hue: rnd(175, 210),
                    dashA: rnd(10, 24),
                    dashB: rnd(7, 20)
                });
            }
        };

        const drawRingDebris = (planet, t, layer, alphaBase = 1) => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const rBase = Math.min(w, h) * 0.42;

            const cx = planet.cx;
            const cy = planet.cy;
            const tilt = -0.55;
            const squash = 0.34;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(tilt);
            ctx.scale(1, squash);

            const wob = 0.5 + 0.5 * Math.sin(t * 0.8);
            const ringR = rBase * 1.12;

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            for (const p of ringPieces) {
                const depth = Math.sin(p.mid);
                if (layer === 'back' && depth >= 0) continue;
                if (layer === 'front' && depth < 0) continue;

                const localAlpha = (layer === 'front' ? 0.42 : 0.18) * alphaBase;
                const flicker = 0.75 + 0.25 * Math.sin(t * 2.1 + p.mid * 3.0);

                ctx.save();
                const rr = ringR * (1 + p.radJitter);
                ctx.globalAlpha = localAlpha * flicker;

                ctx.setLineDash([p.dashA * (1 + wob), p.dashB]);
                ctx.lineWidth = (rBase * 0.055) * p.thick;
                ctx.strokeStyle = `hsla(${p.hue}, 90%, 72%, 0.95)`;

                ctx.beginPath();
                ctx.arc(0, 0, rr, p.start, p.end);
                ctx.stroke();

                ctx.setLineDash([]);
                ctx.lineWidth *= 0.35;
                ctx.globalAlpha *= 0.55;
                ctx.strokeStyle = `rgba(255,255,255,0.85)`;
                ctx.beginPath();
                ctx.arc(0, 0, rr + rBase * 0.015, p.start + 0.02, p.end - 0.02);
                ctx.stroke();

                const fragmentCount = Math.floor(rnd(1, 4));
                for (let i = 0; i < fragmentCount; i++) {
                    const a = lerp(p.start, p.end, Math.random());
                    const fx = Math.cos(a) * rr;
                    const fy = Math.sin(a) * rr;
                    const sz = rnd(rBase * 0.01, rBase * 0.025);
                    ctx.save();
                    ctx.translate(fx, fy);
                    ctx.rotate(a + rnd(-0.6, 0.6));
                    ctx.globalAlpha = (layer === 'front' ? 0.35 : 0.18) * alphaBase;
                    ctx.fillStyle = `hsla(${p.hue + 10}, 70%, 65%, 1)`;
                    ctx.fillRect(-sz * 0.5, -sz * 0.15, sz, sz * 0.3);
                    ctx.restore();
                }

                ctx.restore();
            }

            ctx.restore();
        };

        const drawStars = (w, h, t) => {
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,1)';
            ctx.fillRect(0, 0, w, h);
            for (const s of stars) {
                const tw = 0.6 + 0.4 * Math.sin(s.tw + t * 1.8);
                const alpha = clamp01(0.25 + tw * 0.75);
                ctx.fillStyle = `rgba(255,255,255,${alpha})`;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        };

        const drawAurora = (w, h, tt) => {
            const a = clamp01((tt - 0.05) / 0.35);
            if (a <= 0) return;
            ctx.save();
            ctx.globalAlpha = 0.22 * a;
            ctx.translate(w * 0.5, h * 0.2);
            for (let i = 0; i < 5; i++) {
                const phase = tt * 2.4 + i * 1.1;
                const grad = ctx.createLinearGradient(-w * 0.5, 0, w * 0.5, 0);
                grad.addColorStop(0, 'rgba(120, 255, 210, 0)');
                grad.addColorStop(0.45, `rgba(120, 255, 210, ${0.35 + 0.2 * Math.sin(phase)})`);
                grad.addColorStop(0.55, `rgba(170, 140, 255, ${0.3 + 0.2 * Math.cos(phase)})`);
                grad.addColorStop(1, 'rgba(170, 140, 255, 0)');

                ctx.fillStyle = grad;
                ctx.beginPath();
                const baseY = i * 26;
                ctx.moveTo(-w * 0.55, baseY);
                for (let x = -w * 0.55; x <= w * 0.55; x += 40) {
                    const y = baseY + Math.sin(phase + x * 0.01) * 18 + Math.cos(phase * 1.3 + x * 0.006) * 10;
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(w * 0.55, baseY + 120);
                ctx.lineTo(-w * 0.55, baseY + 120);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        };

        const drawPlanet = (w, h, t) => {
            const rBase = Math.min(w, h) * 0.42;
            const cx = w * 0.74;
            const cy = h * 0.78;

            const breathe = 1 + Math.sin(t * 2.4) * 0.006;
            const r = rBase * breathe;
            const rot = t * 0.2;

            ctx.save();
            ctx.translate(cx, cy);

            const glow = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, r * 1.25);
            glow.addColorStop(0, 'rgba(90, 255, 210, 0.20)');
            glow.addColorStop(0.55, 'rgba(110, 190, 255, 0.08)');
            glow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(0, 0, r * 1.25, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.clip();

            const ocean = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.2, 0, 0, r);
            ocean.addColorStop(0, 'rgba(90, 210, 255, 1)');
            ocean.addColorStop(0.55, 'rgba(20, 130, 230, 1)');
            ocean.addColorStop(1, 'rgba(0, 40, 90, 1)');
            ctx.fillStyle = ocean;
            ctx.fillRect(-r, -r, r * 2, r * 2);

            ctx.save();
            ctx.rotate(rot);
            for (const b of landBlobs) {
                const x = b.x * r;
                const y = b.y * r;
                const rr = b.r * r;
                const grad = ctx.createRadialGradient(x - rr * 0.25, y - rr * 0.25, rr * 0.2, x, y, rr);
                grad.addColorStop(0, `hsla(${b.hue}, 78%, 56%, 0.95)`);
                grad.addColorStop(1, `hsla(${b.hue - 16}, 70%, 34%, 0.95)`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(x, y, rr, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();

            ctx.save();
            ctx.rotate(-rot * 0.7);
            for (const c of cloudPuffs) {
                const x = c.x * r;
                const y = c.y * r;
                const rr = c.r * r;
                const wob = Math.sin(t * 1.2 + x * 0.01 + y * 0.014) * 0.08;
                const alpha = clamp01(c.o + wob);
                ctx.fillStyle = `rgba(255,255,255,${alpha})`;
                ctx.beginPath();
                ctx.arc(x + Math.sin(t * c.sp) * rr * 0.1, y + Math.cos(t * c.sp) * rr * 0.1, rr, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();

            ctx.restore();

            ctx.save();
            ctx.translate(cx, cy);
            const atm = ctx.createRadialGradient(-r * 0.2, -r * 0.3, r * 0.4, 0, 0, r * 1.08);
            atm.addColorStop(0, 'rgba(255, 255, 255, 0)');
            atm.addColorStop(0.68, 'rgba(180, 255, 245, 0.10)');
            atm.addColorStop(0.9, 'rgba(120, 190, 255, 0.14)');
            atm.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.strokeStyle = atm;
            ctx.lineWidth = r * 0.06;
            ctx.beginPath();
            ctx.arc(0, 0, r * 1.01, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            return { cx, cy, r };
        };

        const bezier = (p0, p1, p2, p3, t) => {
            const u = 1 - t;
            const tt = t * t;
            const uu = u * u;
            const uuu = uu * u;
            const ttt = tt * t;
            return {
                x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
                y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
            };
        };

        const bezierTangent = (p0, p1, p2, p3, t) => {
            const u = 1 - t;
            return {
                x: 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
                y: 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y)
            };
        };

        const spawnShip = (planet, elapsed) => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const angle = rnd(-Math.PI * 0.15, Math.PI * 0.55);
            const endX = planet.cx + Math.cos(angle) * planet.r * 0.96;
            const endY = planet.cy + Math.sin(angle) * planet.r * 0.96;

            const p0 = { x: rnd(-w * 0.25, w * 0.15), y: rnd(-h * 0.25, h * 0.15) };
            const p3 = { x: endX, y: endY };
            const p1 = { x: lerp(p0.x, p3.x, 0.45) + rnd(-120, 140), y: lerp(p0.y, p3.y, 0.35) + rnd(-220, 120) };
            const p2 = { x: lerp(p0.x, p3.x, 0.75) + rnd(-80, 90), y: lerp(p0.y, p3.y, 0.65) + rnd(-120, 80) };

            const colorHue = rnd(185, 220);
            const ship = {
                spawnAt: elapsed,
                duration: rnd(2400, 3800),
                p0,
                p1,
                p2,
                p3,
                trail: [],
                hue: colorHue,
                size: rnd(7, 13),
                landedAt: null,
                lastPos: { x: p0.x, y: p0.y }
            };

            ships.push(ship);
        };

        const drawShip = (ship, planet, elapsed, introA) => {
            const t0 = clamp01((elapsed - ship.spawnAt) / ship.duration);
            const t1 = easeOutCubic(t0);
            const pos = bezier(ship.p0, ship.p1, ship.p2, ship.p3, t1);
            const tan = bezierTangent(ship.p0, ship.p1, ship.p2, ship.p3, t1);
            const ang = Math.atan2(tan.y, tan.x);

            ship.lastPos = pos;
            ship.trail.push({ x: pos.x, y: pos.y, a: elapsed });
            if (ship.trail.length > 16) ship.trail.shift();

            const distToPlanet = Math.hypot(pos.x - planet.cx, pos.y - planet.cy);
            const near = clamp01((planet.r * 1.2 - distToPlanet) / (planet.r * 0.55));
            const size = ship.size * lerp(1, 0.72, near);

            ctx.save();
            ctx.globalAlpha = 0.85 * introA;

            for (let i = 0; i < ship.trail.length - 1; i++) {
                const a = (i / ship.trail.length);
                const pA = ship.trail[i];
                const pB = ship.trail[i + 1];
                ctx.strokeStyle = `hsla(${ship.hue}, 90%, 70%, ${0.18 * a})`;
                ctx.lineWidth = lerp(6, 1, a);
                ctx.beginPath();
                ctx.moveTo(pA.x, pA.y);
                ctx.lineTo(pB.x, pB.y);
                ctx.stroke();
            }

            ctx.translate(pos.x, pos.y);
            ctx.rotate(ang);

            const body = `hsla(${ship.hue}, 86%, 68%, 0.95)`;
            ctx.fillStyle = body;
            ctx.beginPath();
            ctx.moveTo(size * 1.5, 0);
            ctx.lineTo(-size * 1.2, -size * 0.8);
            ctx.lineTo(-size * 0.7, 0);
            ctx.lineTo(-size * 1.2, size * 0.8);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = 'rgba(255,255,255,0.22)';
            ctx.beginPath();
            ctx.arc(size * 0.2, -size * 0.18, size * 0.45, 0, Math.PI * 2);
            ctx.fill();

            const thrustA = clamp01(1 - t0);
            ctx.globalAlpha = (0.35 + 0.35 * thrustA) * introA;
            ctx.fillStyle = `hsla(${ship.hue + 40}, 100%, 70%, 0.9)`;
            ctx.beginPath();
            ctx.moveTo(-size * 1.1, 0);
            ctx.lineTo(-size * 2.2 - thrustA * size * 1.8, -size * 0.35);
            ctx.lineTo(-size * 2.2 - thrustA * size * 1.8, size * 0.35);
            ctx.closePath();
            ctx.fill();

            ctx.restore();

            if (t0 >= 1 && ship.landedAt === null) {
                ship.landedAt = elapsed;
                for (let i = 0; i < Math.floor(rnd(6, 12)); i++) {
                    troops.push({
                        x: ship.p3.x + rnd(-10, 10),
                        y: ship.p3.y + rnd(-10, 10),
                        spawnAt: elapsed + i * rnd(70, 120),
                        dir: rnd(-1, 1) < 0 ? -1 : 1,
                        sp: rnd(14, 30),
                        hue: rnd(90, 155)
                    });
                }
            }
        };

        const drawTroops = (elapsed, introA) => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const rBase = Math.min(w, h) * 0.42;
            const cx = w * 0.74;
            const cy = h * 0.78;

            ctx.save();
            ctx.globalAlpha = 0.95 * introA;
            const maxAge = 4200;
            for (const tr of troops) {
                if (elapsed < tr.spawnAt) continue;
                const age = elapsed - tr.spawnAt;
                if (age > maxAge) continue;

                const a = clamp01(1 - age / maxAge);
                const dx = tr.dir * (age / 1000) * tr.sp;
                const dy = (age / 1000) * rnd(2, 6);
                const px = tr.x + dx;
                const py = tr.y + dy;

                const dist = Math.hypot(px - cx, py - cy);
                if (dist > rBase * 1.02) continue;

                ctx.globalAlpha = a * 0.95 * introA;
                ctx.fillStyle = `hsla(${tr.hue}, 70%, 65%, 1)`;
                ctx.beginPath();
                ctx.arc(px, py, 1.6, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = `rgba(255,255,255,${0.55 * a})`;
                ctx.beginPath();
                ctx.arc(px + 1.2, py - 1.0, 0.9, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        };

        const spawnFirework = (elapsed) => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const x = rnd(w * 0.45, w * 0.82);
            const y = rnd(h * 0.08, h * 0.38);
            const hue = rnd(160, 320);
            const count = Math.floor(rnd(26, 44));
            const parts = [];
            for (let i = 0; i < count; i++) {
                const a = (i / count) * Math.PI * 2 + rnd(-0.08, 0.08);
                const sp = rnd(80, 190);
                parts.push({
                    x,
                    y,
                    vx: Math.cos(a) * sp,
                    vy: Math.sin(a) * sp,
                    life: rnd(900, 1400)
                });
            }
            fireworks.push({ x, y, hue, born: elapsed, parts });
        };

        const drawFireworks = (elapsed, introA) => {
            ctx.save();
            ctx.globalAlpha = 1;
            for (let i = fireworks.length - 1; i >= 0; i--) {
                const fw = fireworks[i];
                const age = elapsed - fw.born;
                if (age > 1700) {
                    fireworks.splice(i, 1);
                    continue;
                }

                for (const p of fw.parts) {
                    const t = clamp01(age / p.life);
                    const x = p.x + p.vx * t * 0.012;
                    const y = p.y + p.vy * t * 0.012 + t * t * 28;
                    const a = (1 - t) * 0.9 * introA;
                    ctx.fillStyle = `hsla(${fw.hue}, 95%, 70%, ${a})`;
                    ctx.beginPath();
                    ctx.arc(x, y, lerp(2.1, 0.6, t), 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.restore();
        };

        const creditsLines = [
            'CREDITS:',
            'Game Design - Leigh Hobson',
            'Development - Leigh Hobson',
            'Graphics and UI Design - Leigh Hobson',
            'QA - Leigh Hobson',
            'Story - Leigh Hobson',
            'Cosmic Forge © 2026 Leigh Hobson'
        ];
        const creditsLineVisibleMs = 2500;
        const creditsFadeMs = 750;
        const creditsStepMs = creditsLineVisibleMs - creditsFadeMs;
        const creditsStartMs = durationMs * 0.76;

        const drawCredits = (w, h, elapsed, titleA) => {
            const t = elapsed - creditsStartMs;
            if (t < 0) return;

            const size = Math.max(34, Math.min(74, w * 0.055));
            const baseY = h * 0.355;

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(120, 255, 230, 0.45)';
            ctx.shadowBlur = 18;
            ctx.fillStyle = 'rgba(220, 255, 245, 1)';

            for (let i = 0; i < creditsLines.length; i++) {
                const local = t - i * creditsStepMs;
                if (local < 0 || local > creditsLineVisibleMs) continue;

                const fadeIn = clamp01(local / creditsFadeMs);
                const fadeOut = clamp01((creditsLineVisibleMs - local) / creditsFadeMs);
                const a = Math.min(fadeIn, fadeOut);

                const phase = clamp01(local / creditsLineVisibleMs);
                const y = baseY + lerp(22, -22, easeInOutSine(phase));

                const fontScale = i === 0 ? 0.30 : (i === creditsLines.length - 1 ? 0.26 : 0.28);
                const weight = i === 0 ? 700 : (i === creditsLines.length - 1 ? 600 : 500);

                ctx.globalAlpha = 0.85 * a * titleA;
                ctx.font = `${weight} ${Math.round(size * fontScale)}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
                ctx.fillText(creditsLines[i], w * 0.5, y);
            }

            ctx.restore();
        };

        const drawTitle = (w, h, tt, elapsed) => {
            const endA = clamp01((tt - 0.76) / 0.16);
            if (endA <= 0) return;

            ctx.save();
            const a = easeInOutSine(endA);
            ctx.globalAlpha = 0.9 * a;
            const size = Math.max(34, Math.min(74, w * 0.055));
            ctx.font = `700 ${Math.round(size)}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(120, 255, 230, 0.6)';
            ctx.shadowBlur = 24;
            ctx.fillStyle = 'rgba(220, 255, 245, 1)';
            ctx.fillText('VICTORY', w * 0.5, h * 0.18);

            ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
            ctx.shadowBlur = 12;
            ctx.globalAlpha = 0.65 * a;
            ctx.font = `500 ${Math.round(size * 0.36)}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
            ctx.fillStyle = 'rgba(220, 255, 245, 1)';
            ctx.fillText('WELCOME HOME, MIA\' PLAC', w * 0.5, h * 0.245);

            ctx.globalAlpha = 0.55 * a;
            ctx.font = `600 ${Math.round(size * 0.28)}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
            ctx.fillStyle = 'rgba(220, 255, 245, 1)';
            ctx.fillText('YOU ARE THE COSMIC FORGER', w * 0.5, h * 0.285);
            ctx.restore();

            drawCredits(w, h, elapsed, a);
        };

        const cleanup = () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            if (resizeHandler) {
                window.removeEventListener('resize', resizeHandler);
            }
            blockedPointerEvents.forEach(type => overlay.removeEventListener(type, stopEvent, { capture: true }));
            overlay.removeEventListener('wheel', stopEvent, { capture: true });
            document.removeEventListener('keydown', keyBlocker, true);
            document.removeEventListener('keyup', keyBlocker, true);
            document.documentElement.style.overflow = previousOverflow;
            overlay.remove();
            activeWinCinematicPromise = null;
            resolve();
        };

        const end = () => {
            if (finished) return;
            finished = true;
            overlay.style.opacity = '0';
            setTimeout(cleanup, 950);
        };

        resize();
        initScene();
        resizeHandler = () => {
            resize();
            initScene();
        };
        window.addEventListener('resize', resizeHandler);

        const start = performance.now();

        const frame = (now) => {
            const elapsed = now - start;
            const ttBase = clamp01(elapsed / durationMs);
            const w = window.innerWidth;
            const h = window.innerHeight;

            const introA = easeOutCubic(clamp01(elapsed / 1100));
            const outroA = 1 - easeInOutSine(clamp01((elapsed - (totalDurationMs - 1200)) / 1200));
            const sceneA = clamp01(introA * outroA);

            drawStars(w, h, elapsed / 1000);
            drawAurora(w, h, ttBase);

            const planetT = elapsed / 1000;
            const planet = { cx: w * 0.74, cy: h * 0.78, r: Math.min(w, h) * 0.42 };
            drawRingDebris(planet, planetT, 'back', sceneA);
            const planetDrawn = drawPlanet(w, h, planetT);
            drawRingDebris(planetDrawn, planetT, 'front', sceneA);

            const shipPhase = clamp01((ttBase - 0.08) / 0.62);
            if (shipPhase > 0 && elapsed >= nextShipSpawnAt && shipPhase < 1) {
                const intensity = lerp(85, 18, shipPhase);
                spawnShip(planetDrawn, elapsed);
                nextShipSpawnAt = elapsed + rnd(intensity * 0.6, intensity * 1.05);
            }

            for (let i = ships.length - 1; i >= 0; i--) {
                const ship = ships[i];
                if (elapsed - ship.spawnAt > ship.duration + 7000) {
                    ships.splice(i, 1);
                    continue;
                }
                drawShip(ship, planetDrawn, elapsed, sceneA);
            }

            drawTroops(elapsed, sceneA);

            const fireworkPhase = clamp01((ttBase - 0.52) / 0.34);
            if (fireworkPhase > 0 && elapsed >= nextFireworkAt && ttBase < 0.9) {
                spawnFirework(elapsed);
                nextFireworkAt = elapsed + rnd(280, 520);
            }
            drawFireworks(elapsed, sceneA);
            drawTitle(w, h, ttBase, elapsed);

            ctx.save();
            ctx.globalAlpha = (1 - sceneA);
            ctx.fillStyle = 'rgba(0,0,0,1)';
            ctx.fillRect(0, 0, w, h);
            ctx.restore();

            if (elapsed >= totalDurationMs) {
                end();
                return;
            }

            rafId = requestAnimationFrame(frame);
        };

        rafId = requestAnimationFrame(frame);
    });

    return activeWinCinematicPromise;
}
    
//-------------------------------------------------------------------------------------------------
//--------------DEBUG-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------

function toggleDebugWindow() {
    if (debugWindow.style.display === 'none' || !debugWindow.style.display) {
        showDebugWindow();
    } else {
        debugWindow.style.display = 'none';
    }
}

function showDebugWindow() {
    debugWindow.style.display = 'block';
}

let isDragging = false;
let offsetX = 0;
let offsetY = 0;
let currentWindow = null;

function onMouseDown(e, windowElement) {
    isDragging = true;
    currentWindow = windowElement;
    offsetX = e.clientX - windowElement.offsetLeft;
    offsetY = e.clientY - windowElement.offsetTop;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(e) {
    if (isDragging && currentWindow) {
        currentWindow.style.left = `${e.clientX - offsetX}px`;
        currentWindow.style.top = `${e.clientY - offsetY}px`;
    }
}

function onMouseUp() {
    isDragging = false;
    currentWindow = null;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}

document.querySelector('.debug-header').addEventListener('mousedown', (e) => onMouseDown(e, document.getElementById('debugWindow')));
document.querySelector('.debug-variables-header').addEventListener('mousedown', (e) => onMouseDown(e, document.getElementById('variableDebuggerWindow')));

closeButton.addEventListener('click', () => {
    debugWindow.style.display = 'none';
});

const grantAllTechsButton = document.getElementById('grantAllTechsButton');
grantAllTechsButton.addEventListener('click', () => {
    const techArray = getResourceDataObject('techs');
    setResourceDataObject(getResourceDataObject('research', ['quantity']) + 1000000, 'research', ['quantity']);

    Object.keys(techArray).forEach((techKey) => {
        setTechUnlockedArray(techKey);
    });

    setUnlockedCompoundsArray('diesel');
    setUnlockedCompoundsArray('glass');
    setUnlockedCompoundsArray('steel');
    setUnlockedCompoundsArray('concrete');
    setUnlockedCompoundsArray('water');
    setUnlockedCompoundsArray('titanium');

    setCanFuelRockets(true);
    setCanTravelToAsteroids(true);

    grantAllTechsButton.classList.add('red-disabled-text');
    showNotification('CHEAT! All techs unlocked!', 'info', 3000, 'debug');

    console.log('All techs unlocked!');
});

const give1BButton = document.getElementById('give1BButton');
give1BButton.addEventListener('click', () => {
    const currentCash = getResourceDataObject('currency', ['cash']);
    const newCash = currentCash + 1000000000;

    setResourceDataObject(newCash, 'currency', ['cash']);
    
    showNotification('CHEAT! $1B added', 'info', 3000, 'debug');
    console.log('$ 1B granted! Current cash:', newCash);
});

const give100Button = document.getElementById('give100Button');
give100Button.addEventListener('click', () => {
    const newCash = 100;

    setResourceDataObject(newCash, 'currency', ['cash']);
    
    showNotification('CHEAT! $100 set', 'info', 3000, 'debug');
    console.log('$100 set! Current cash:', newCash);
});

const give1MResearchButton = document.getElementById('give1MResearch');
give1MResearchButton.addEventListener('click', () => {
    setResourceDataObject(1000000, 'research', ['quantity']);
    
    showNotification('CHEAT! 1M research points added!', 'info', 3000, 'debug');
    console.log('1M storage capacity granted to all resources and compounds!');
});

const give1MAllResourcesAndCompoundsButton = document.getElementById('give1MAllResourcesAndCompounds');
give1MAllResourcesAndCompoundsButton.addEventListener('click', () => {
    const resources = getResourceDataObject('resources');
    const compounds = getResourceDataObject('compounds');

    const resourceGases = document.getElementById('gas');
    const resourceSolids = document.getElementById('solids');
    const compoundLiquids = document.getElementById('liquidCompounds');
    const compoundSolids = document.getElementById('solidCompounds');

    resourceGases.classList.remove('invisible');
    resourceSolids.classList.remove('invisible');
    compoundLiquids.classList.remove('invisible');
    compoundSolids.classList.remove('invisible');

    [resourceGases, resourceSolids, compoundLiquids, compoundSolids].forEach(category => {
        category.querySelectorAll('.invisible').forEach(child => {
            child.classList.remove('invisible');
        });
    });

    Object.keys(resources).forEach(resourceKey => {
        setResourceDataObject(1000000, 'resources', [resourceKey, 'storageCapacity']);
        setResourceDataObject(1000000, 'resources', [resourceKey, 'quantity']);
        setUnlockedResourcesArray(resourceKey);
        setAutoBuyerTierLevel(resourceKey, 4, false, 'resources');
    });

    Object.keys(compounds).forEach(compoundKey => {
        setResourceDataObject(1000000, 'compounds', [compoundKey, 'storageCapacity']);
        setResourceDataObject(1000000, 'compounds', [compoundKey, 'quantity']);
        setUnlockedCompoundsArray(compoundKey);
        setAutoBuyerTierLevel(compoundKey, 4, false, 'compounds');
    });
    
    showNotification('CHEAT! 1M of every resource and compound added!', 'info', 3000, 'debug');
    console.log('1M storage capacity granted to all resources and compounds!');
});

const give100AllResourcesAndCompoundsButton = document.getElementById('give100AllResourcesAndCompounds');
give100AllResourcesAndCompoundsButton.addEventListener('click', () => {
    const resources = getResourceDataObject('resources');
    const compounds = getResourceDataObject('compounds');

    const resourceGases = document.getElementById('gas');
    const resourceSolids = document.getElementById('solids');
    const compoundLiquids = document.getElementById('liquidCompounds');
    const compoundSolids = document.getElementById('solidCompounds');

    resourceGases.classList.remove('invisible');
    resourceSolids.classList.remove('invisible');
    compoundLiquids.classList.remove('invisible');
    compoundSolids.classList.remove('invisible');

    [resourceGases, resourceSolids, compoundLiquids, compoundSolids].forEach(category => {
        category.querySelectorAll('.invisible').forEach(child => {
            child.classList.remove('invisible');
        });
    });

    Object.keys(resources).forEach(resourceKey => {
        setResourceDataObject(100, 'resources', [resourceKey, 'storageCapacity']);
        setResourceDataObject(100, 'resources', [resourceKey, 'quantity']);
        setUnlockedResourcesArray(resourceKey);
        setAutoBuyerTierLevel(resourceKey, 1, false, 'resources');
    });

    Object.keys(compounds).forEach(compoundKey => {
        setResourceDataObject(100, 'compounds', [compoundKey, 'storageCapacity']);
        setResourceDataObject(100, 'compounds', [compoundKey, 'quantity']);
        setUnlockedCompoundsArray(compoundKey);
        setAutoBuyerTierLevel(compoundKey, 1, false, 'compounds');
    });
    
    showNotification('CHEAT! 100 of every resource and compound!', 'info', 3000, 'debug');
    console.log('100 of all resources and compounds!');
});

const add10AsteroidsButton = document.getElementById('add10AsteroidsButton');
add10AsteroidsButton.addEventListener('click', () => {
    for (let i = 0; i < 10; i++) {
        discoverAsteroid(true);
    }
    showNotification('CHEAT! Discovered 10 Asteroids!', 'info', 3000, 'debug');
});

const addStarButton = document.getElementById('addStarButton');
addStarButton.addEventListener('click', () => {
    // for (let i = 0; i < 10; i++) {
        extendStarDataRange(true);
    // }
    showNotification('CHEAT! Discovered Star Data!', 'info', 3000, 'debug');
});

const debugTimeWarpDurationSelect = document.getElementById('debugTimeWarpDurationSelect');
const debugTimeWarpMultiplierSelect = document.getElementById('debugTimeWarpMultiplierSelect');
const debugTimeWarpButton = document.getElementById('debugTimeWarpButton');

if (debugTimeWarpDurationSelect) {
    const durationOptions = Array.from(debugTimeWarpDurationSelect.options).map(option => option.value);
    let durationValue = String(getDebugTimeWarpDurationMs());
    if (!durationOptions.includes(durationValue)) {
        durationValue = durationOptions[durationOptions.length - 1];
        setDebugTimeWarpDurationMs(Number(durationValue));
    }
    debugTimeWarpDurationSelect.value = durationValue;
    debugTimeWarpDurationSelect.addEventListener('change', event => {
        setDebugTimeWarpDurationMs(Number(event.target.value));
    });
}

if (debugTimeWarpMultiplierSelect) {
    const multiplierOptions = Array.from(debugTimeWarpMultiplierSelect.options).map(option => option.value);
    let multiplierValue = String(getDebugTimeWarpMultiplier());
    if (!multiplierOptions.includes(multiplierValue)) {
        multiplierValue = multiplierOptions[2]; // default ×10
        setDebugTimeWarpMultiplier(Number(multiplierValue));
    }
    debugTimeWarpMultiplierSelect.value = multiplierValue;
    debugTimeWarpMultiplierSelect.addEventListener('change', event => {
        setDebugTimeWarpMultiplier(Number(event.target.value));
    });
}

debugTimeWarpButton?.addEventListener('click', () => {
    const duration = getDebugTimeWarpDurationMs();
    const multiplier = getDebugTimeWarpMultiplier();
    timeWarp(duration, multiplier);
});

const clearWeatherButton = document.getElementById('clearWeatherButton');
clearWeatherButton?.addEventListener('click', () => {
    forceClearWeather();
    showNotification('CHEAT! Weather set to sunny', 'info', 3000, 'debug');
});

const buildLaunchPadScannerAndAllRocketsButton = document.getElementById('buildLaunchPadScannerAndAllRocketsButton');
buildLaunchPadScannerAndAllRocketsButton.addEventListener('click', () => {
    buildSpaceMiningBuilding('spaceTelescope', true);
    buildSpaceMiningBuilding('launchPad', true);

    setResourceDataObject(getResourceDataObject('space', ['upgrades', 'rocket1', 'parts']), 'space', ['upgrades', 'rocket1', 'builtParts']);
    setResourceDataObject(getResourceDataObject('space', ['upgrades', 'rocket2', 'parts']), 'space', ['upgrades', 'rocket2', 'builtParts']);
    setResourceDataObject(getResourceDataObject('space', ['upgrades', 'rocket3', 'parts']), 'space', ['upgrades', 'rocket3', 'builtParts']);
    setResourceDataObject(getResourceDataObject('space', ['upgrades', 'rocket4', 'parts']), 'space', ['upgrades', 'rocket4', 'builtParts']);

    setRocketsBuilt('rocket1');
    setRocketsBuilt('rocket2');
    setRocketsBuilt('rocket3');
    setRocketsBuilt('rocket4');

    buildLaunchPadScannerAndAllRocketsButton.classList.add('red-disabled-text');
    showNotification('CHEAT! Launch Pad, Space Scanner and all Rockets Built!', 'info', 3000, 'debug');
});

const gain10000AntimatterButton = document.getElementById('gain10000AntimatterButton');
gain10000AntimatterButton.addEventListener('click', () => {
    setAntimatterUnlocked(true);
    setResourceDataObject(getResourceDataObject('antimatter', ['quantity']) + 10000, 'antimatter', ['quantity']);
    showNotification('CHEAT! 10000 Antimatter added!', 'info', 3000, 'debug');
});

const unlockAllTabsButton = document.getElementById('unlockAllTabsButton');
unlockAllTabsButton.addEventListener('click', () => {
    const allTabs = document.querySelectorAll('.tab');

    allTabs.forEach(tab => {
        if (tab.classList.contains('tab-not-yet')) {
            tab.classList.remove('tab-not-yet');
            tab.textContent = tab.getAttribute('data-name');
        }
    });

    const techsToUnlock = [
        'stellarCartography',
        'basicPowerGeneration',
        'compounds',
        'atmosphericTelescopes',
        'apAwardedThisRun'
    ];
    
    const unlockedTechs = getTechUnlockedArray();
    
    techsToUnlock.forEach(tech => {
        if (!unlockedTechs.includes(tech)) {
            setTechUnlockedArray(tech);
        }
    });

    reorderTabs([1, 4, 3, 2, 6, 5, 7, 8]);

    showNotification('CHEAT! All tabs unlocked!', 'info', 3000, 'debug');
});

const holdEnterToGainDebugButton = document.getElementById('holdEnterToGainDebugButton');
holdEnterToGainDebugButton?.addEventListener('click', () => {
    setDebugHoldEnterToGainEnabled(!getDebugHoldEnterToGainEnabled());
    updateHoldEnterToGainDebugStatus();
});

updateHoldEnterToGainDebugStatus();

function toggleVariableDebuggerWindow() {
    if (variableDebuggerWindow.style.display === 'none' || !variableDebuggerWindow.style.display) {
        variableDebuggerWindow.style.display = 'block';
        document.body.classList.add('debug-window-open');
    } else {
        variableDebuggerWindow.style.display = 'none';
        document.body.classList.remove('debug-window-open');
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'NumpadMultiply') {
        toggleVariableDebuggerWindow();
    }
});

const variableDebuggerCloseButton = document.querySelector('.variable-debugger-close-btn');
variableDebuggerCloseButton.addEventListener('click', () => {
    toggleVariableDebuggerWindow();
});
