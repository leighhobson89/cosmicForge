import {
  restoreAchievementsDataObject, restoreAscendencyBuffsDataObject, restoreGalacticMarketDataObject, restoreGalacticCasinoDataObject, restoreRocketNamesObject, restoreResourceDataObject, restoreStarSystemsDataObject, resourceData, starSystems, getResourceDataObject, setResourceDataObject, galacticMarket, galacticCasino, ascendencyBuffs, achievementsData, getStarSystemDataObject, getBlackHoleResearchDone, getBlackHolePower, getBlackHoleDuration, getBlackHoleRechargeMultiplier, getBlackHoleResearchPrice, getBlackHolePowerPrice, getBlackHoleDurationPrice, getBlackHoleRechargePrice, setBlackHoleResearchDone, setBlackHolePower, setBlackHoleDuration, setBlackHoleRechargeMultiplier, setBlackHoleResearchPrice, setBlackHolePowerPrice, setBlackHoleDurationPrice, setBlackHoleRechargePrice, oTypePowerPlantBuffs, restoreOTypePowerPlantBuffsObject, getAchievementDataObject,
  getGalacticCasinoDataObject,
  setGalacticCasinoDataObject,
} from './resourceDataObject.js';
import { getRandomEventIds } from './events.js';
import { achievementFunctionsMap } from "./achievements.js";
import { drawNativeTechTree, selectTheme, startWeatherEffect, stopWeatherEffect, applyCustomPointerSetting, showNotification, generateStarfield } from "./ui.js";
import { capitaliseWordsWithRomanNumerals, capitaliseString } from './utilityFunctions.js';
import { offlineGains, startNewsTickerTimer } from './game.js';
import { rocketNames, getStarNames, getStarTypeByName } from './descriptions.js';
import { boostSoundManager } from './audioManager.js';
import { trackAnalyticsEvent } from './analytics.js';

//DEBUG
export let debugFlag = false;
export let debugOptionFlag = false;
export let stateLoading = false;
export const debugVisibilityArray = ['settingsNotificationTestRow'];
let wheelForceSpecial = false;
let casinoGame4AlwaysWin = false;
let casinoGame5VoidSeerAlwaysMatch = false;
var debugTimeWarpDurationMs = 5000;
var debugTimeWarpMultiplier = 50;
var debugHoldEnterToGainEnabled = false;

//ELEMENTS
let elements;
let saveData = null;

//CONSTANTS
export const HOMESTAR = 'miaplacidus';
export const MINIMUM_GAME_VERSION_FOR_SAVES = 0.93;
export const GAME_VERSION_FOR_SAVES = 0.978;
export const deferredActions = [];

//NOTIFICATIONS
export const MAX_STACKS = 4;
export const STACK_WIDTH = 220;
export const BASE_RIGHT = 0;        

export const MINIMUM_BLACK_HOLE_CHARGE_TIME = 30000;
export const INFINITE_POWER_RATE = 5000000000000000;
export const MENU_STATE = 'menuState';
export const GAME_VISIBLE_ACTIVE = 'gameVisibleActive';
export const TIMER_UPDATE_INTERVAL = 10;
export const TIMER_RATE_RATIO = 100;
export const READY_TO_SORT = 120;
export const NOW = 30; //READY TO SORT NOW needs total of 150
export const BUILDING_TYPES = ['energy', 'space', 'starShip', 'fleetHangar', 'colonise', 'philosophy'];
export const NEWS_TICKER_SCROLL_DURATION = 40000;
export const NEWS_TICKER_MANUSCRIPT_CLUE_CHANCE = 0.25;
export const GAME_COST_MULTIPLIER = 1.13;
export const ASTEROID_COST_MULTIPLIER = 1.07;
export const NORMAL_MAX_ANTIMATTER_RATE = 0.004;
export const BOOST_ANTIMATTER_RATE_MULTIPLIER = 2;
export const STARTING_STAR_SYSTEM = 'spica';
export const STAR_SEED = 53;
export const STAR_FIELD_SEED = 80;
export const NUMBER_OF_STARS = 100;
export const STELLAR_SCANNER_RANGE = 0.75;
export const OFFLINE_GAINS_RATE = 0.334;
export const ENEMY_FLEET_SPEED_AIR = 5;
export const ENEMY_FLEET_SPEED_LAND = 2;
export const ENEMY_FLEET_SPEED_SEA = 1;
export const PRICE_CASINO_GAME_2 = 1;
export const PRICE_CASINO_GAME_3 = 5;
export const VOID_SEER_PRIZE_CATALOG = {
    prize1: { costCp: 7, maxReel: 6, label: 'O Type Star Clue - 7CP - Odds: 6/1' },
    prize2: { costCp: 10, maxReel: 8, label: 'Ancient Manuscript Clue - 10CP - Odds: 8/1' },
    prize3: { costCp: 15, maxReel: 12, label: 'Pillage Antimatter - 15CP - Odds: 12/1' }

};

export function addGalacticCasinoStatBothScopes(amountToAdd, statKey) {
    const amt = Number(amountToAdd);
    if (!Number.isFinite(amt) || amt === 0) return;
    const key = String(statKey || '').trim();
    if (!key) return;

    const apply = (k, add) => {
        switch (k) {
            case 'casinoPointsSpent':
                casinoPointsSpentThisRun += add;
                allTimeCasinoPointsSpent += add;
                break;
            case 'game1_doubleOrNothingPlayed':
                casinoGame1DoubleOrNothingPlayedThisRun += add;
                allTimeCasinoGame1DoubleOrNothingPlayed += add;
                break;
            case 'game1_doubleOrNothingWon':
                casinoGame1DoubleOrNothingWonThisRun += add;
                allTimeCasinoGame1DoubleOrNothingWon += add;
                break;
            case 'game2_wheelPlayed':
                casinoGame2WheelPlayedThisRun += add;
                allTimeCasinoGame2WheelPlayed += add;
                break;
            case 'game2_wheelWon':
                casinoGame2WheelWonThisRun += add;
                allTimeCasinoGame2WheelWon += add;
                break;
            case 'game2_wheelSpecialWon':
                casinoGame2WheelSpecialWonThisRun += add;
                allTimeCasinoGame2WheelSpecialWon += add;
                break;
            case 'game3_higherLowerPlayed':
                casinoGame3HigherLowerPlayedThisRun += add;
                allTimeCasinoGame3HigherLowerPlayed += add;
                break;
            case 'game3_higherLowerWon':
                casinoGame3HigherLowerWonThisRun += add;
                allTimeCasinoGame3HigherLowerWon += add;
                break;
            case 'game4_voidSeerPlayed':
                casinoGame4VoidSeerPlayedThisRun += add;
                allTimeCasinoGame4VoidSeerPlayed += add;
                break;
            case 'game4_voidSeerWon':
                casinoGame4VoidSeerWonThisRun += add;
                allTimeCasinoGame4VoidSeerWon += add;
                break;
            default:
                break;
        }
    };

    apply(key, amt);
}

export function incrementGalacticCasinoStatBothScopes(statKey) {
    addGalacticCasinoStatBothScopes(1, statKey);
}

function getGalacticCasinoStatValue(statKey, scope) {
    const safeScope = scope === 'currentRun' ? 'currentRun' : 'allTime';
    const key = String(statKey || '').trim();
    if (!key) return 0;

    const allTimeMap = {
        casinoPointsSpent: () => allTimeCasinoPointsSpent,
        game1_doubleOrNothingPlayed: () => allTimeCasinoGame1DoubleOrNothingPlayed,
        game1_doubleOrNothingWon: () => allTimeCasinoGame1DoubleOrNothingWon,
        game2_wheelPlayed: () => allTimeCasinoGame2WheelPlayed,
        game2_wheelWon: () => allTimeCasinoGame2WheelWon,
        game2_wheelSpecialWon: () => allTimeCasinoGame2WheelSpecialWon,
        game3_higherLowerPlayed: () => allTimeCasinoGame3HigherLowerPlayed,
        game3_higherLowerWon: () => allTimeCasinoGame3HigherLowerWon,
        game4_voidSeerPlayed: () => allTimeCasinoGame4VoidSeerPlayed,
        game4_voidSeerWon: () => allTimeCasinoGame4VoidSeerWon,
    };

    const thisRunMap = {
        casinoPointsSpent: () => casinoPointsSpentThisRun,
        game1_doubleOrNothingPlayed: () => casinoGame1DoubleOrNothingPlayedThisRun,
        game1_doubleOrNothingWon: () => casinoGame1DoubleOrNothingWonThisRun,
        game2_wheelPlayed: () => casinoGame2WheelPlayedThisRun,
        game2_wheelWon: () => casinoGame2WheelWonThisRun,
        game2_wheelSpecialWon: () => casinoGame2WheelSpecialWonThisRun,
        game3_higherLowerPlayed: () => casinoGame3HigherLowerPlayedThisRun,
        game3_higherLowerWon: () => casinoGame3HigherLowerWonThisRun,
        game4_voidSeerPlayed: () => casinoGame4VoidSeerPlayedThisRun,
        game4_voidSeerWon: () => casinoGame4VoidSeerWonThisRun,
    };

    const getter = safeScope === 'currentRun' ? thisRunMap[key] : allTimeMap[key];
    const value = typeof getter === 'function' ? getter() : 0;
    return Number(value ?? 0);
}

export const AP_BASE_SELL_PRICE = 100000;
export const AP_BASE_BUY_PRICE = 1000000;
export const CASH_LIQUIDATION_MODIFIER = 10;
export const MAX_ANCIENT_MANUSCRIPTS = 4;
export const POWER_GRACE_PERIOD_MS = 5000;

export const factoryStarMap = {
    1: "Dyson Sphere",
    2: "Celestial Processing Core",
    3: "Plasma Forge",
    4: "Galactic Memory Archive"
};

export const enemyFleetData = {
    air: {
        speed: ENEMY_FLEET_SPEED_AIR,
        visionDistance: 300, //300
        acceleration: 0.020
    },
    land: {
        speed: ENEMY_FLEET_SPEED_LAND,
        visionDistance: 150, //150
        acceleration: 0.012
    },
    sea: {
        speed: ENEMY_FLEET_SPEED_SEA,
        visionDistance: 200, //200
        acceleration: 0.006
    }
}

export function getDemoBuild() {
    return demoBuild;
}

export function setDemoBuild(value) {
    demoBuild = !!value;
}

export let notificationQueues = {};
export let notificationStatus = {};
export let notificationContainers = {};
export let classificationOrder = [];

export let firstAccessArray = [];

export let repeatableTechMultipliers = {
    1: 1,
    2: 1,
    3: 1,
    4: 1
};

let compoundCreateDropdownRecipeText = {
    diesel: {
      fillToCapacity: { value: 'fillToCapacity', text: 'Fill To Capacity' },
      max: { value: 'max', text: 'Max Possible' },
      threeQuarters: { value: 'threeQuarters', text: 'Up to 75%' },
      twoThirds: { value: 'twoThirds', text: 'Up to 67%' },
      half: { value: 'half', text: 'Up to 50%' },
      oneThird: { value: 'oneThird', text: 'Up to 33%' },
      50000: { value: '50000', text: '50000 - 1.3M Hyd, 600K Crb' },
      5000: { value: '5000', text: '5000 - 130K Hyd, 60K Crb' },
      500: { value: '500', text: '500 - 13K Hyd, 6K Crb' },
      50: { value: '50', text: '50 - 1.3K Hyd, 600 Crb' },
      5: { value: '5', text: '5 - 130 Hyd, 60 Crb' },
      1: { value: '1', text: '1 - 26 Hyd, 12 Crb' }
    },
    glass: {
      fillToCapacity: { value: 'fillToCapacity', text: 'Fill To Capacity' },
      max: { value: 'max', text: 'Max Possible' },
      threeQuarters: { value: 'threeQuarters', text: 'Up to 75%' },
      twoThirds: { value: 'twoThirds', text: 'Up to 67%' },
      half: { value: 'half', text: 'Up to 50%' },
      oneThird: { value: 'oneThird', text: 'Up to 33%' },
      50000: { value: '50000', text: '50000 - 200K Sil, 100K Oxy, 50K Sod' },
      5000: { value: '5000', text: '5000 - 20K Sil, 10K Oxy, 5K Sod' },
      500: { value: '500', text: '500 - 2K Sil, 1K Oxy, 500 Sod' },
      50: { value: '50', text: '50 - 200 Sil, 100 Oxy, 50 Sod' },
      5: { value: '5', text: '5 - 20 Sil, 10 Oxy, 5 Sod' },
      1: { value: '1', text: '1 - 4 Sil, 2 Oxy, 1 Sod' }
    },
    steel: {
      fillToCapacity: { value: 'fillToCapacity', text: 'Fill To Capacity' },
      max: { value: 'max', text: 'Max Possible' },
      threeQuarters: { value: 'threeQuarters', text: 'Up to 75%' },
      twoThirds: { value: 'twoThirds', text: 'Up to 67%' },
      half: { value: 'half', text: 'Up to 50%' },
      oneThird: { value: 'oneThird', text: 'Up to 33%' },
      50000: { value: '50000', text: '50000 - 200K Irn, 50K Crb' },
      5000: { value: '5000', text: '5000 - 20K Irn, 5K Crb' },
      500: { value: '500', text: '500 - 2K Irn, 500 Crb' },
      50: { value: '50', text: '50 - 200 Irn, 50 Crb' },
      5: { value: '5', text: '5 - 20 Irn, 5 Crb' },
      1: { value: '1', text: '1 - 4 Irn, 1 Crb' }
    },
    concrete: {
      fillToCapacity: { value: 'fillToCapacity', text: 'Fill To Capacity' },
      max: { value: 'max', text: 'Max Possible' },
      threeQuarters: { value: 'threeQuarters', text: 'Up to 75%' },
      twoThirds: { value: 'twoThirds', text: 'Up to 67%' },
      half: { value: 'half', text: 'Up to 50%' },
      oneThird: { value: 'oneThird', text: 'Up to 33%' },
      50000: { value: '50000', text: '50000 - 250K Sil, 100K Sod, 150K Hyd' },
      5000: { value: '5000', text: '5000 - 25K Sil, 10K Sod, 15K Hyd' },
      500: { value: '500', text: '500 - 2.5K Sil, 1K Sod, 1.5K Hyd' },
      50: { value: '50', text: '50 - 250 Sil, 100 Sod, 150 Hyd' },
      5: { value: '5', text: '5 - 25 Sil, 10 Sod, 15 Hyd' },
      1: { value: '1', text: '1 - 5 Sil, 2 Sod, 3 Hyd' }
    },
    water: {
      fillToCapacity: { value: 'fillToCapacity', text: 'Fill To Capacity' },
      max: { value: 'max', text: 'Max Possible' },
      threeQuarters: { value: 'threeQuarters', text: 'Up to 75%' },
      twoThirds: { value: 'twoThirds', text: 'Up to 67%' },
      half: { value: 'half', text: 'Up to 50%' },
      oneThird: { value: 'oneThird', text: 'Up to 33%' },
      50000: { value: '50000', text: '50000 - 1M Hyd, 500K Oxy' },
      5000: { value: '5000', text: '5000 - 100K Hyd, 50K Oxy' },
      500: { value: '500', text: '500 - 10K Hyd, 5K Oxy' },
      50: { value: '50', text: '50 - 1K Hyd, 500 Oxy' },
      5: { value: '5', text: '5 - 100 Hyd, 50 Oxy' },
      1: { value: '1', text: '1 - 20 Hyd, 10 Oxy' }
    },
    titanium: {
      fillToCapacity: { value: 'fillToCapacity', text: 'Fill To Capacity' },
      max: { value: 'max', text: 'Max Possible' },
      threeQuarters: { value: 'threeQuarters', text: 'Up to 75%' },
      twoThirds: { value: 'twoThirds', text: 'Up to 67%' },
      half: { value: 'half', text: 'Up to 50%' },
      oneThird: { value: 'oneThird', text: 'Up to 33%' },
      50000: { value: '50000', text: '50000 - 1.1M Irn, 900K Sod, 2M Neo' },
      5000: { value: '5000', text: '5000 - 110K Irn, 90K Sod, 200K Neo' },
      500: { value: '500', text: '500 - 11K Irn, 9K Sod, 20K Neo' },
      50: { value: '50', text: '50 - 1.1K Irn, 900 Sod, 2K Neo' },
      5: { value: '5', text: '5 - 110 Irn, 90 Sod, 200 Neo' },
      1: { value: '1', text: '1 - 22 Irn, 18 Sod, 40 Neo' }
    }
  };  

//GLOBAL VARIABLES
export let gameState;
let achievementFlagArray = [];
let blackHoleDiscoveryProbability = 0;
let blackHoleDiscovered = false;
let oTypePowerPlantStrengthBoost = 8;
let megaStructureTechsResearched = [];
let miaplacidusMilestoneLevel = 0;
let increaseStorageFactor = 2;
let rocketTravelSpeed = 0.2;
let starShipTravelSpeed = 360000; //3600000 one real hour per light year
let galacticPointsSpent = 0;
let philosophy = null;
let feedbackContent = 'Not done yet';
let feedbackGiven = null;
let gameStartTimeStamp = null;
let runStartTimeStamp = null;
let gameActiveCountTime = [0, 0];
let blackHoleNerfPatched = false;
let rocketUserName = {rocket1: 'Rocket 1', rocket2: 'Rocket 2', rocket3: 'Rocket 3', rocket4: 'Rocket 4'};
let asteroidArray = [];
let alreadySeenNewsTickerArray = [];
let activatedWackyNewsEffectsArray = [];
let collectedPrecipitationQuantityThisRun = 0;
let rocketsBuilt = [];
let starShipModulesBuilt = [];
let rocketsFuellerStartedArray = [];
let launchedRockets = [];
let saveName = null;
let lastSavedTimeStamp = null;
let currentTheme = 'terminal';
let themesTriedArray = ['terminal'];
let autoSaveFrequency = 300000;
let currentStarSystem = getStartingStarSystem();
let currentStarSystemWeatherEfficiency = [];
let currentPrecipitationRate = 0;
let techRenderCounter = 0;
let tempRowValue = null;
let currencySymbol = '$';
let sortAsteroidMethod = 'rarity';
let sortStarMethod = 'distance';
let saleResourcePreviews = {};
let saleCompoundPreviews = {};
let createCompoundPreviews = {};
let constituentPartsObject = {};
let itemsToDeduct = {};
let itemsToIncreasePrice = {};
let techUnlockedArray = ['apAwardedThisRun'];
let revealedTechArray = [];
let upcomingTechArray = [];
let cosmicRipTechUnlockedArray = [];
let revealedCosmicRipTechArray = [];
let unlockedResourcesArray = ['hydrogen'];
let unlockedCompoundsArray = [];
let temporaryCoreTechRowsRepo = null;
let canAffordDeferred = null;
let originalFrameNumbers = {};
let baseSearchAsteroidTimerDuration = 60000;
let baseInvestigateStarTimerDuration = 400000;
let basePillageVoidTimerDuration = 500000;
let baseBlackHoleChargeTimerDuration = 300000;
let blackHoleDurationUpgradeIncrementMs = 3000;
let blackHolePowerUpgradeIncrement = 2;
let currentAsteroidSearchTimerDurationTotal = 0;
let currentInvestigateStarTimerDurationTotal = 0;
let currentPillageVoidTimerDurationTotal = 0;
let currentBlackHoleChargeTimerDurationTotal = 0;
let currentlyChargingBlackHole = false;
let blackHoleChargeReady = false;
let blackHoleAlwaysOn = false;
let currentlyTimeWarpingBlackHole = false;
let currentBlackHoleTimeWarpDurationTotal = 0;
let blackHoleTimeWarpEndTimestampMs = 0;
let timeLeftUntilAsteroidScannerTimerFinishes = 0;
let timeLeftUntilTravelToDestinationStarTimerFinishes = 0;
let timeLeftUntilPillageVoidTimerFinishes = 0;
let timeLeftUntilStarInvestigationTimerFinishes = 0;
let timeLeftUntilBlackHoleChargeTimerFinishes = 0;
let oldAntimatterRightBoxSvgData = null;
let currentDestinationDropdownText = 'Select an option';
let starVisionDistance = 0;
let starMapMode = 'normal';
let starVisionIncrement = 1;
let destinationStar = null;
let fromStarObject = null;
let toStarObject = null;
let currentStarObject = null;
let starShipStatus = ['preconstruction', null];
let starShipDestinationReminderVisible = false;
let runNumber = 1;
let settledStars = [STARTING_STAR_SYSTEM];
let cosmicRipNearSpaceScannerArraySectorNames = null;
let cosmicRipNearSpaceScannerArrayOneSectorState = false;
let cosmicRipFoundSectorIndexForZoom = 0;
let cosmicRipNearSpaceScannerArrayCanvasEl = null;
let cosmicRipNearSpaceScannerArrayGridOverlayEl = null;
let cosmicRipNearSpaceScannerArrayFogOverlayEl = null;
let cosmicRipNearSpaceScannerArrayInteractiveOverlayEl = null;
let cosmicRipNearSpaceScannerArrayScanLabelOverlayEl = null;
let cosmicRipNearSpaceScannerArrayScanLabelEls = null;
let cosmicRipNearSpaceScannerArrayFogEls = null;
let cosmicRipNearSpaceScannerArrayLabelFadeOverlayEl = null;
let cosmicRipNearSpaceScannerArrayZoomCanvasEl = null;
let cosmicRipLocatedModalShown = false;
let cosmicRipOneSectorStateReady = false;
let cosmicRipPrevRipFound = undefined;
let cosmicRipScanResultsBySectorIndex = null;
let cosmicRipGpForUi = 0;
let cosmicRipScannerRestoredForUi = false;
let cosmicRipRipSpriteImgCache = null;
let cosmicRipNearSpaceScannerArrayDrawCanvas = null;
let cosmicRipNearSpaceScannerArrayResizeAttached = false;
let cosmicRipPrevScanResultsBySectorIndex = null;
let cosmicRipRipFoundUiSequenceStarted = false;
let cosmicRipTechResearchTimers = {};
let cosmicRipTechTimeLeftUntilResearchFinishes = {};
let cosmicRipTechResearchDurations = {};
let cosmicRipTechCurrentResearchProgress = 0;
let apSellForCashPrice = AP_BASE_SELL_PRICE;
let apBuyForCashPrice = AP_BASE_BUY_PRICE;
let apLiquidationQuantity = 0;
let userPlatform = [
    null,
    null,
    null
];
let hostSource = null;
let multiplierPermanentResources = 1;
let multiplierPermanentCompounds = 1;
let playerStartingUnitHealth = 100;
let initialImpression = 35;
let additionalSystemsToSettleThisRun = [];
let starsWithAncientManuscripts = [];
let factoryStarsArray = [];
let manuscriptCluesShown = {};
let megaStructuresInPossessionArray = [];
let oStarArrivalPopupsShown = [];

function syncFactoryStarsArrayFromAncientManuscripts() {
    const next = [];
    const seen = new Set();
    const entries = Array.isArray(starsWithAncientManuscripts) ? starsWithAncientManuscripts : [];

    for (let i = 0; i < entries.length && next.length < 4; i++) {
        const entry = entries[i];
        const factoryStar = Array.isArray(entry) ? entry[1] : null;
        const lower = typeof factoryStar === 'string' ? factoryStar.toLowerCase() : '';
        if (!lower) continue;
        if (seen.has(lower)) continue;
        seen.add(lower);
        next.push(lower);
    }

    factoryStarsArray = next;
}
let oTypeMechanicActivatedForThisSave = true;

let battleUnits = { 
    player: [], 
    enemy: [] 
};

let miningObject = {
    rocket1: null,
    rocket2: null,
    rocket3: null,
    rocket4: null  
}

let timeLeftUntilRocketTravelToAsteroidTimerFinishes = {
    rocket1: 0,
    rocket2: 0,
    rocket3: 0,
    rocket4: 0  
}

let rocketTravelDuration = {
    rocket1: 0,
    rocket2: 0,
    rocket3: 0,
    rocket4: 0
}

let lastSellResourceCompoundDropdownOption = {
    resources: {
      hydrogen: 'all',
      helium: 'all',
      carbon: 'all',
      neon: 'all',
      oxygen: 'all',
      sodium: 'all',
      silicon: 'all',
      iron: 'all'
    },
    compounds: {
      diesel: 'all',
      glass: 'all',
      steel: 'all',
      concrete: 'all',
      water: 'all',
      titanium: 'all'
    }
  };

let starTravelDuration = 0;

let destinationAsteroid = {
    rocket1: null,
    rocket2: null,
    rocket3: null,
    rocket4: null 
};

let rocketDirection = {
    rocket1: false,
    rocket2: false,
    rocket3: false,
    rocket4: false 
}

export let oneOffPrizesAlreadyClaimedArray = [];

let lastScreenOpenRegister = {
    tab1: null,
    tab2: null,
    tab3: null,
    tab4: null,
    tab5: null,
    tab6: null,
    tab7: null,
    tab8: null,
    tab9: null,
};

let activatedFuelBurnObject = {
    carbon: false,
};

let buildingTypeOnOff = {
    powerPlant1: false,
    powerPlant2: false,
    powerPlant3: false,
}

let ranOutOfFuelWhenOn = {
    powerPlant1: false,
    powerPlant2: false,
    powerPlant3: false,
}

let powerGracePeriodEnd = 0;

let lastFocusOfflineGainsAppliedAt = 0;

let battleResolved = [false, null];

let galacticMarketOutgoingStockType = 'select';
let galacticMarketIncomingStockType = 'select';
let galacticMarketOutgoingQuantitySelectionType = 'select';
let galacticMarketSellApForCashQuantity = 'select';
let galacticMarketIncomingQuantity = 0;
let currentGalacticMarketCommission = 10;

let galacticCasinoPurchaseItem = 'select';

let currentTab = [1, 'Resources'];
let currentOptionPane = null;
let notationType = 'normalCondensed';

let mouseParticleTrailEnabled = false;
let customPointerEnabled = true;

const MAX_MOUSE_TRAIL_PARTICLES = 40;
const PARTICLE_LIFETIME_MS = 800;
const PARTICLES_PER_EVENT = 3;
let mouseParticleContainer = null;

const CUSTOM_POINTER_THEMES = [
    'terminal',
    'dark',
    'misty',
    'light',
    'frosty',
    'summer',
    'supernova',
    'galaxy',
    'space'
];

const CUSTOM_POINTER_ASSET_KEYS = new Set(
    CUSTOM_POINTER_THEMES.flatMap((theme) => {
        const token = theme.charAt(0).toUpperCase() + theme.slice(1);
        return [
            `default${token}`,
            `hand${token}`,
            `drag${token}`
        ];
    })
);

const CUSTOM_POINTER_FALLBACK_THEME = 'terminal';
const CURSOR_TYPE_TO_POINTER = {
    pointer: 'hand',
    grab: 'drag',
    grabbing: 'drag',
    move: 'drag'
};
const CUSTOM_POINTER_ENABLED_CLASS = 'custom-pointer-enabled';
const CUSTOM_POINTER_HIDE_CURSOR_CLASS = 'custom-pointer-hide-cursor';
let customPointerElement = null;
let customPointerImageElement = null;
let pendingCustomPointerType = 'default';
let customPointerListenersAttached = false;

let antimatterDeltaAccumulator = 0;

let timeWarpMultiplier = 1;
let timeWarpEndTimestampMs = 0;
let timeWarpTimeoutId = null;

//STATS PAGE LOGGERS
let allTimeTotalHydrogen = 0;
let allTimeTotalHelium = 0;
let allTimeTotalCarbon = 0;
let allTimeTotalNeon = 0;
let allTimeTotalOxygen = 0;
let allTimeTotalSodium = 0;
let allTimeTotalSilicon = 0;
let allTimeTotalIron = 0;
let allTimeTotalDiesel = 0;
let allTimeTotalGlass = 0;
let allTimeTotalSteel = 0;
let allTimeTotalConcrete = 0;
let allTimeTotalWater = 0;
let allTimeTotalTitanium = 0;
let allTimeTotalResearchPoints = 0;
let allTimeTotalScienceKits = 0;
let allTimeTotalScienceClubs = 0;
let allTimeTotalScienceLabs = 0;
let allTimeTotalRocketsLaunched = 0;
let allTimeTotalStarShipsLaunched = 0;
let allTimeTotalAsteroidsDiscovered = 0;
let allTimeTotalLegendaryAsteroidsDiscovered = 0;

let allTimeCasinoPointsSpent = 0;
let allTimeCasinoGame1DoubleOrNothingPlayed = 0;
let allTimeCasinoGame1DoubleOrNothingWon = 0;
let allTimeCasinoGame2WheelPlayed = 0;
let allTimeCasinoGame2WheelWon = 0;
let allTimeCasinoGame2WheelSpecialWon = 0;
let allTimeCasinoGame3HigherLowerPlayed = 0;
let allTimeCasinoGame3HigherLowerWon = 0;
let allTimeCasinoGame4VoidSeerPlayed = 0;
let allTimeCasinoGame4VoidSeerWon = 0;

let allTimeRipTelemetryDataEarned = 0;

let hydrogenThisRun = 0;
let heliumThisRun = 0;
let carbonThisRun = 0;
let neonThisRun = 0;
let oxygenThisRun = 0;
let sodiumThisRun = 0;
let siliconThisRun = 0;
let ironThisRun = 0;

let dieselThisRun = 0;
let glassThisRun = 0;
let steelThisRun = 0;
let concreteThisRun = 0;
let waterThisRun = 0;
let titaniumThisRun = 0;

let researchPointsThisRun = 0;
let scienceKitsThisRun = 0;
let scienceClubsThisRun = 0;
let scienceLabsThisRun = 0;

let casinoPointsSpentThisRun = 0;
let casinoGame1DoubleOrNothingPlayedThisRun = 0;
let casinoGame1DoubleOrNothingWonThisRun = 0;
let casinoGame2WheelPlayedThisRun = 0;
let casinoGame2WheelWonThisRun = 0;
let casinoGame2WheelSpecialWonThisRun = 0;
let casinoGame3HigherLowerPlayedThisRun = 0;
let casinoGame3HigherLowerWonThisRun = 0;
let casinoGame4VoidSeerPlayedThisRun = 0;
let casinoGame4VoidSeerWonThisRun = 0;

let ripTelemetryDataEarnedThisRun = 0;

let starStudyRange = 0;
let allTimeTotalAntimatterMined = 0;
let antimatterMinedThisRun = 0;
let allTimeTotalApGain = 0;
let currentRunNumber = 0;
let currentRunTimer = 0;
let totalNewsTickerPrizesCollected = 0;
let apAnticipatedThisRun = 0;
let allTimeStarShipsBuilt = 0;
let starShipTravelDistance = 0;
let allTimesTripped = 0;
let timesTrippedThisRun = 0;
let allTimeBasicPowerPlantsBuilt = 0;
let allTimeAdvancedPowerPlantsBuilt = 0;
let allTimeSolarPowerPlantsBuilt = 0;
let allTimeSodiumIonBatteriesBuilt = 0;
let allTimeBattery2Built = 0;
let allTimeBattery3Built = 0;
let basicPowerPlantsBuiltThisRun = 0;
let advancedPowerPlantsBuiltThisRun = 0;
let solarPowerPlantsBuiltThisRun = 0;
let sodiumIonBatteriesBuiltThisRun = 0;
let battery2BuiltThisRun = 0;
let battery3BuiltThisRun = 0;
let allTimeRocketsBuilt = 0;
let allTimeTotalAsteroidsMined = 0;
let enemyFleetPowerAtBattleStart = 0;
let asteroidsMinedThisRun = 0;
let formationGoal = null;
let liquidationValue = 0;
let megastructureAntimatterAmount = 0;

//FLAGS
let checkRocketFuellingStatus = {
    rocket1: false,
    rocket2: false,
    rocket3: false,
    rocket4: false
};

let currentlyTravellingToAsteroid = {
    rocket1: false,
    rocket2: false,
    rocket3: false,
    rocket4: false
};

let rocketReadyToTravel = {
    rocket1: true,
    rocket2: true,
    rocket3: true,
    rocket4: true
}

let storageAdderBonus = false;
let megaStructureResourceBonus = false;
let infinitePower = false;
let megaStructureAssignmentMode = 'arrival';
let nonExhaustiveResources = false;
let currentRunIsMegaStructureRun = false;
let megaStructureTabNotificationShown = false;
let hasVisitedMegaStructure = false;
let megaStructureTabUnlocked = false;
let rebirthPossible = false;
let sfx = false;
let backgroundAudio = false;
let saveExportCloudFlag = false;
let autoSaveToggle = true;
let newsTickerSetting = true;
let weatherEffectSettingToggle = true;
let notificationsToggle = true;
let techRenderChange = false;
let suppressUiClickSfx = false;
let losingEnergy = false;
let powerOnOff = false;
let trippedStatus = false;
let savedYetSinceOpeningSaveDialogue = false;
let weatherEffectOn = false;
let weatherEfficiencyApplied = false;
let currentlySearchingAsteroid = false;
let currentlyInvestigatingStar = false;
let currentlyPillagingVoid = false;
let telescopeReadyToSearch = true;
let asteroidTimerCanContinue = false;
let starInvestigationTimerCanContinue = false;
let pillageVoidTimerCanContinue = false;
let antimatterUnlocked = false;
let permanentAntimatterUnlock = false;
let isAntimatterBoostActive = false;
let antimatterSvgEventListeners = false;
let canTravelToAsteroids = false;
let canFuelRockets = false;
let starShipBuilt = false;
let starShipTravelling = false;
let starShipArrowPosition = 0;
let stellarScannerBuilt = false;
let destinationStarScanned = false;
let diplomacyPossible = true;
let warMode = false;
let fleetChangedSinceLastDiplomacy = false;
let battleOngoing = false;
let battleTriggeredByPlayer = false;
let needNewBattleCanvas = false;
let redrawBattleDescription = true;
let inFormation = false;
let wasAutoSaveToggled = false;
let enemyFleetAdjustedForDiplomacy = false;
let apAwardedThisRun = false;
let galacticMarketOutgoingQuantitySelectionTypeDisabledStatus = true;
let galacticMarketLiquidationAuthorization = 'no';
let hasClickedOutgoingOptionGalacticMarket = false;
let liquidatedThisRun = false;
let belligerentEnemyFlag = false;
let feedbackCanBeRequested = true;
let philosophyAbilityActive = false;
let onboardingMode = false;
let galacticCasinoUnlocked = false;

let demoBuild = false;

let eventsTriggeredOnce = false;

let randomEventTriggerCountsThisRun = {};
let randomEventTriggerCountsAllTime = {};

let miaplacidusEndgameStoryShown = false;

//GETTER SETTER METHODS
export function setElements() {
    elements = {
        menu: document.getElementById('menu'),
        menuTitle: document.getElementById('menuTitle'),
        newGameMenuButton: document.getElementById('newGame'),
        returnToMenuButton: document.getElementById('returnToMenu'),
        canvas: document.getElementById('canvas'),
        testContainer: document.getElementById('testContainer'),
        statsContainer: document.getElementById('statsContainer'),
        newsTickerContainer: document.getElementById('newsTickerContainer'),
        tabsContainer: document.getElementById('tabsContainer'),
        mainContainer: document.getElementById('mainContainer'),
        solidsMenu: document.getElementById('solids'),
        gasesMenu: document.getElementById('gas'),
        nonFerrous: document.getElementById('nonFerrous'),
        gases: document.getElementById('gases'),
        nobleGases: document.getElementById('nobleGases'),
        hydrogenOption: document.getElementById('hydrogenOption'),
        hydrogenRate: document.getElementById('hydrogenRate'),
        hydrogenQuantity: document.getElementById('hydrogenQuantity'),
        heliumOption: document.getElementById('heliumOption'),
        heliumRate: document.getElementById('heliumRate'),
        heliumQuantity: document.getElementById('heliumQuantity'),
        carbonOption: document.getElementById('carbonOption'),
        carbonRate: document.getElementById('carbonRate'),
        carbonQuantity: document.getElementById('carbonQuantity'),
        neonOption: document.getElementById('neonOption'),
        neonRate: document.getElementById('neonRate'),
        neonQuantity: document.getElementById('neonQuantity'),
        oxygenOption: document.getElementById('oxygenOption'),
        oxygenRate: document.getElementById('oxygenRate'),
        oxygenQuantity: document.getElementById('oxygenQuantity'),
        sodiumOption: document.getElementById('sodiumOption'),
        sodiumRate: document.getElementById('sodiumRate'),
        sodiumQuantity: document.getElementById('sodiumQuantity'),
        siliconOption: document.getElementById('siliconOption'),
        siliconRate: document.getElementById('siliconRate'),
        siliconQuantity: document.getElementById('siliconQuantity'),
        ironOption: document.getElementById('ironOption'),
        ironRate: document.getElementById('ironRate'),
        ironQuantity: document.getElementById('ironQuantity'),
        dieselOption: document.getElementById('dieselOption'),
        dieselRate: document.getElementById('dieselRate'),
        dieselQuantity: document.getElementById('dieselQuantity'),
        waterOption: document.getElementById('waterOption'),
        waterRate: document.getElementById('waterRate'),
        waterQuantity: document.getElementById('waterQuantity'),
        glassOption: document.getElementById('glassOption'),
        glassRate: document.getElementById('glassRate'),
        glassQuantity: document.getElementById('glassQuantity'),
        steelOption: document.getElementById('steelOption'),
        steelRate: document.getElementById('steelRate'),
        steelQuantity: document.getElementById('steelQuantity'),
        concreteOption: document.getElementById('concreteOption'),
        concreteRate: document.getElementById('concreteRate'),
        concreteQuantity: document.getElementById('concreteQuantity'),
        titaniumOption: document.getElementById('titaniumOption'),
        titaniumRate: document.getElementById('titaniumRate'),
        titaniumQuantity: document.getElementById('titaniumQuantity'),
        energyRate: document.getElementById('energyRate'),
        energyQuantity: document.getElementById('energyQuantity'),
        powerPlant1Quantity: document.getElementById('powerPlant1Quantity'),
        powerPlant1Rate: document.getElementById('powerPlant1Rate'),
        powerPlant2Quantity: document.getElementById('powerPlant2Quantity'),
        powerPlant2Rate: document.getElementById('powerPlant2Rate'),
        powerPlant3Quantity: document.getElementById('powerPlant3Quantity'),
        powerPlant3Rate: document.getElementById('powerPlant3Rate'),
        battery1Quantity: document.getElementById('battery1Quantity'),
        battery2Quantity: document.getElementById('battery2Quantity'),
        battery3Quantity: document.getElementById('battery3Quantity'),
        sensorBuoyQuantity: document.getElementById('sensorBuoyQuantity'),
        ripResearchOrbiterQuantity: document.getElementById('ripResearchOrbiterQuantity'),
        cosmicRipTelemetryRate: document.getElementById('cosmicRipTelemetryRate'),
        cosmicRipTelemetryQuantity: document.getElementById('cosmicRipTelemetryQuantity'),
        researchRate: document.getElementById('researchRate'),
        researchQuantity: document.getElementById('researchQuantity'),
        scienceKitQuantity: document.getElementById('scienceKitQuantity'),
        scienceClubQuantity: document.getElementById('scienceClubQuantity'),
        scienceLabQuantity: document.getElementById('scienceLabQuantity'),
        miningOption: document.getElementById('miningOption'),
        miningQuantity: document.getElementById('miningQuantity'),
        miningRate: document.getElementById('miningRate'),
        cashStat: document.getElementById('cashStat'),
        optionPaneDescriptions: document.querySelectorAll('.option-pane-description'),
        notificationContainer: document.getElementById('notificationContainer'),
        modalContainer: document.getElementById('modal'),
        modalHeader: document.querySelector('.modal-header h4'),
        modalContent: document.querySelector('.modal-content p'),
        overlay: document.getElementById('overlay'),
    };
}

export const statFunctionsGets = {
    "stat_timePlayed": getStatTotalTimePlayed,
    "stat_pioneer": getStatPioneer,
    "stat_currentAp": getStatCurrentAp,
    "stat_apGain": getStatTotalApGain,
    "stat_run": getStatRun,
    "stat_runTime": getStatRunTime,
    "stat_uniqueNewsTickersSeen": getStatTotalUniqueNewsTickersSeen,
    "stat_newsTickerPrizesCollected": getStatNewsTickerPrizesCollected,
    "stat_theme": getStatTheme,
    "stat_antimatterMined": getStatTotalAntimatterMined,
    "stat_totalAsteroidsDiscovered": getStatTotalAsteroidsDiscovered,
    "stat_legendaryAsteroidsDiscovered": getStatTotalLegendaryAsteroidsDiscovered,
    "stat_rocketsLaunched": getStatTotalRocketsLaunched,
    "stat_starShipsLaunched": getStatTotalStarShipsLaunched,

    "stat_starSystem": getStatStarSystem,
    "stat_currentWeather": getStatCurrentWeather,
    "stat_cash": getStatCash,
    "stat_apAnticipated": getStatApAnticipated,
    "stat_antimatter": getStatAntimatter,

    // Events
    "stat_powerPlantExplosionThisRun": getStatEventPowerPlantExplosionThisRun,
    "stat_powerPlantExplosion": getStatEventPowerPlantExplosionAllTime,
    "stat_batteryExplosionThisRun": getStatEventBatteryExplosionThisRun,
    "stat_batteryExplosion": getStatEventBatteryExplosionAllTime,
    "stat_scienceTheftThisRun": getStatEventScienceTheftThisRun,
    "stat_scienceTheft": getStatEventScienceTheftAllTime,
    "stat_researchBreakthroughThisRun": getStatEventResearchBreakthroughThisRun,
    "stat_researchBreakthrough": getStatEventResearchBreakthroughAllTime,
    "stat_rocketInstantArrivalThisRun": getStatEventRocketInstantArrivalThisRun,
    "stat_rocketInstantArrival": getStatEventRocketInstantArrivalAllTime,
    "stat_starshipLostInSpaceThisRun": getStatEventStarshipLostInSpaceThisRun,
    "stat_starshipLostInSpace": getStatEventStarshipLostInSpaceAllTime,
    "stat_antimatterReactionThisRun": getStatEventAntimatterReactionThisRun,
    "stat_antimatterReaction": getStatEventAntimatterReactionAllTime,
    "stat_stockLossThisRun": getStatEventStockLossThisRun,
    "stat_stockLoss": getStatEventStockLossAllTime,
    "stat_galacticMarketLockdownThisRun": getStatEventGalacticMarketLockdownThisRun,
    "stat_galacticMarketLockdown": getStatEventGalacticMarketLockdownAllTime,
    "stat_endlessSummerThisRun": getStatEventEndlessSummerThisRun,
    "stat_endlessSummer": getStatEventEndlessSummerAllTime,
    "stat_minerBrokeDownThisRun": getStatEventMinerBrokeDownThisRun,
    "stat_minerBrokeDown": getStatEventMinerBrokeDownAllTime,
    "stat_supplyChainDisruptionThisRun": getStatEventSupplyChainDisruptionThisRun,
    "stat_supplyChainDisruption": getStatEventSupplyChainDisruptionAllTime,
    "stat_blackHoleInstabilityThisRun": getStatEventBlackHoleInstabilityThisRun,
    "stat_blackHoleInstability": getStatEventBlackHoleInstabilityAllTime,

    "stat_hydrogen": getStatHydrogen,
    "stat_helium": getStatHelium,
    "stat_carbon": getStatCarbon,
    "stat_neon": getStatNeon,
    "stat_oxygen": getStatOxygen,
    "stat_sodium": getStatSodium,
    "stat_silicon": getStatSilicon,
    "stat_iron": getStatIron,

    "stat_hydrogenThisRun": getStatHydrogenThisRun,
    "stat_heliumThisRun": getStatHeliumThisRun,
    "stat_carbonThisRun": getStatCarbonThisRun,
    "stat_neonThisRun": getStatNeonThisRun,
    "stat_oxygenThisRun": getStatOxygenThisRun,
    "stat_sodiumThisRun": getStatSodiumThisRun,
    "stat_siliconThisRun": getStatSiliconThisRun,
    "stat_ironThisRun": getStatIronThisRun,

    "stat_diesel": getStatDiesel,
    "stat_glass": getStatGlass,
    "stat_steel": getStatSteel,
    "stat_concrete": getStatConcrete,
    "stat_water": getStatWater,
    "stat_titanium": getStatTitanium,

    "stat_dieselThisRun": getStatDieselThisRun,
    "stat_glassThisRun": getStatGlassThisRun,
    "stat_steelThisRun": getStatSteelThisRun,
    "stat_concreteThisRun": getStatConcreteThisRun,
    "stat_waterThisRun": getStatWaterThisRun,
    "stat_titaniumThisRun": getStatTitaniumThisRun,

    "stat_researchPoints": getStatResearchPoints,
    "stat_scienceKits": getStatScienceKits,
    "stat_scienceClubs": getStatScienceClubs,
    "stat_scienceLabs": getStatScienceLabs,
    "stat_techsUnlocked": getStatTechsUnlockedAllTime,
    "stat_techsUnlockedThisRun": getStatTechsUnlocked,

    "stat_researchPointsThisRun": getStatResearchPointsThisRun,
    "stat_scienceKitsThisRun": getStatScienceKitsThisRun,
    "stat_scienceClubsThisRun": getStatScienceClubsThisRun,
    "stat_scienceLabsThisRun": getStatScienceLabsThisRun,

    "stat_powerThisRun": getStatPower,
    "stat_totalEnergyThisRun": getStatTotalEnergy,
    "stat_totalProductionThisRun": getStatTotalProduction,
    "stat_totalConsumptionThisRun": getStatTotalConsumption,
    "stat_totalBatteryStorageThisRun": getStatTotalBatteryStorage,
    "stat_power": getStatPowerAllTime,
    "stat_totalEnergy": getStatTotalEnergyAllTime,
    "stat_totalProduction": getStatTotalProductionAllTime,
    "stat_totalConsumption": getStatTotalConsumptionAllTime,
    "stat_totalBatteryStorage": getStatTotalBatteryStorageAllTime,
    "stat_timesTripped": getStatTimesTripped,
    "stat_timesTrippedThisRun": getStatTimesTrippedThisRun,
    "stat_basicPowerPlants": getStatBasicPowerPlants,
    "stat_basicPowerPlantsThisRun": getStatBasicPowerPlantsThisRun,
    "stat_advancedPowerPlants": getStatAdvancedPowerPlants,
    "stat_advancedPowerPlantsThisRun": getStatAdvancedPowerPlantsThisRun,
    "stat_solarPowerPlants": getStatSolarPowerPlants,
    "stat_solarPowerPlantsThisRun": getStatSolarPowerPlantsThisRun,
    "stat_sodiumIonBatteries": getStatSodiumIonBatteries,
    "stat_sodiumIonBatteriesThisRun": getStatSodiumIonBatteriesThisRun,
    "stat_battery2": getStatBattery2,
    "stat_battery2ThisRun": getStatBattery2ThisRun,
    "stat_battery3": getStatBattery3,
    "stat_battery3ThisRun": getStatBattery3ThisRun,

    "stat_spaceTelescopeBuiltThisRun": getStatSpaceTelescopeBuilt,
    "stat_launchPadBuiltThisRun": getStatLaunchPadBuilt,
    "stat_spaceTelescopeBuilt": getStatSpaceTelescopeBuiltAllTime,
    "stat_launchPadBuilt": getStatLaunchPadBuiltAllTime,
    "stat_rocketsBuiltThisRun": getStatRocketsBuilt,
    "stat_rocketsBuilt": getStatRocketsBuiltAllTime,
    "stat_asteroidsDiscoveredThisRun": getStatAsteroidsDiscovered,
    "stat_asteroidsDiscovered": getStatTotalAsteroidsDiscovered,
    "stat_asteroidsMinedThisRun": getStatAsteroidsMinedThisRun,
    "stat_asteroidsMined": getStatAsteroidsMined,

    "stat_starStudyRangeThisRun": getStatStarStudyRange,
    "stat_starShipBuiltThisRun": getStatStarShipBuilt,
    "stat_systemScannedThisRun": getStatSystemScanned,
    "stat_starStudyRange": getStatStarStudyRangeAllTime,
    "stat_starShipBuilt": getStatStarShipBuiltAllTime,
    "stat_systemScanned": getStatSystemScannedAllTime,
    "stat_starShipDistanceTravelledThisRun": getStatStarShipDistanceTravelled,
    "stat_starShipDistanceTravelled": getStatStarShipDistanceTravelled,
    "stat_fleetAttackStrengthThisRun": getStatFleetAttackStrength,
    "stat_fleet1ThisRun": getStatFleet1,
    "stat_fleet2ThisRun": getStatFleet2,
    "stat_fleet3ThisRun": getStatFleet3,
    "stat_fleet4ThisRun": getStatFleet4,
    "stat_fleet5ThisRun": getStatFleet5,
    "stat_enemyThisRun": getStatEnemy,
    "stat_enemyTotalDefenceOvercomeThisRun": getStatEnemyTotalDefenceOvercome,
    "stat_enemyTotalDefenceRemainingThisRun": getStatEnemyTotalDefenceRemaining,
    "stat_apFromStarVoyageThisRun": getStatApFromStarVoyage,
    "stat_fleetAttackStrength": getStatFleetAttackStrength,
    "stat_fleet1": getStatFleet1,
    "stat_fleet2": getStatFleet2,
    "stat_fleet3": getStatFleet3,
    "stat_fleet4": getStatFleet4,
    "stat_fleet5": getStatFleet5,
    "stat_enemy": getStatEnemyAllTime,
    "stat_enemyTotalDefenceOvercome": getStatEnemyTotalDefenceOvercomeAllTime,
    "stat_enemyTotalDefenceRemaining": getStatEnemyTotalDefenceRemainingAllTime,
    "stat_apFromStarVoyage": getStatApFromStarVoyage,

    "stat_envoyThisRun": getStatFleetEnvoy,
    "stat_scoutThisRun": getStatFleetScout,
    "stat_marauderThisRun": getStatFleetMarauder,
    "stat_landStalkerThisRun": getStatFleetLandStalker,
    "stat_navalStraferThisRun": getStatFleetNavalStrafer,
    "stat_envoy": getStatFleetEnvoy,
    "stat_scout": getStatFleetScout,
    "stat_marauder": getStatFleetMarauder,
    "stat_landStalker": getStatFleetLandStalker,
    "stat_navalStrafer": getStatFleetNavalStrafer,

    "stat_blackHoleDiscoveredThisRun": getStatBlackHoleDiscoveredThisRun,
    "stat_blackHoleDiscovered": getStatBlackHoleDiscoveredAllTime,
    "stat_blackHoleAlwaysActiveThisRun": getStatBlackHoleAlwaysActiveThisRun,
    "stat_blackHoleAlwaysActive": getStatBlackHoleAlwaysActiveAllTime,
    "stat_blackHoleStrengthThisRun": getStatBlackHoleStrengthThisRun,
    "stat_blackHoleStrength": getStatBlackHoleStrengthAllTime,

    // Cosmic Rip Chapter
    "stat_galacticPointsEarnedThisRun": getStatCosmicRipChapterGalacticPointsEarnedThisRun,
    "stat_galacticPointsEarned": getStatCosmicRipChapterGalacticPointsEarnedAllTime,

    "stat_galacticPointsSpentThisRun": getStatCosmicRipChapterGalacticPointsSpentThisRun,
    "stat_galacticPointsSpent": getStatCosmicRipChapterGalacticPointsSpentAllTime,

    "stat_cosmicRipChapterUnlockThisRun": getStatCosmicRipChapterUnlockThisRun,
    "stat_cosmicRipChapterUnlock": getStatCosmicRipChapterUnlockAllTime,

    "stat_nearSpaceScannerArrayRestoredThisRun": getStatNearSpaceScannerArrayRestoredThisRun,
    "stat_nearSpaceScannerArrayRestored": getStatNearSpaceScannerArrayRestoredAllTime,

    "stat_cosmicRipLocatedThisRun": getStatCosmicRipLocatedThisRun,
    "stat_cosmicRipLocated": getStatCosmicRipLocatedAllTime,

    "stat_cosmicRipStabilisedThisRun": getStatCosmicRipStabilisedThisRun,
    "stat_cosmicRipStabilised": getStatCosmicRipStabilisedAllTime,

    "stat_ripTelemetryDataGainedThisRun": getStatRipTelemetryDataGainedThisRun,
    "stat_ripTelemetryDataGained": getStatRipTelemetryDataGainedAllTime,

    // Galactic Casino
    "stat_casinoPointsSpentThisRun": () => getGalacticCasinoStatValue('casinoPointsSpent', 'currentRun'),
    "stat_casinoPointsSpent": () => getGalacticCasinoStatValue('casinoPointsSpent', 'allTime'),

    "stat_doubleOrNothingPlayedThisRun": () => getGalacticCasinoStatValue('game1_doubleOrNothingPlayed', 'currentRun'),
    "stat_doubleOrNothingPlayed": () => getGalacticCasinoStatValue('game1_doubleOrNothingPlayed', 'allTime'),

    "stat_doubleOrNothingWonThisRun": () => getGalacticCasinoStatValue('game1_doubleOrNothingWon', 'currentRun'),
    "stat_doubleOrNothingWon": () => getGalacticCasinoStatValue('game1_doubleOrNothingWon', 'allTime'),

    "stat_wheelOfFortunePlayedThisRun": () => getGalacticCasinoStatValue('game2_wheelPlayed', 'currentRun'),
    "stat_wheelOfFortunePlayed": () => getGalacticCasinoStatValue('game2_wheelPlayed', 'allTime'),

    "stat_wheelOfFortuneWonThisRun": () => getGalacticCasinoStatValue('game2_wheelWon', 'currentRun'),
    "stat_wheelOfFortuneWon": () => getGalacticCasinoStatValue('game2_wheelWon', 'allTime'),

    "stat_wheelSpecialWonThisRun": () => getGalacticCasinoStatValue('game2_wheelSpecialWon', 'currentRun'),
    "stat_wheelSpecialWon": () => getGalacticCasinoStatValue('game2_wheelSpecialWon', 'allTime'),

    "stat_higherLowerPlayedThisRun": () => getGalacticCasinoStatValue('game3_higherLowerPlayed', 'currentRun'),
    "stat_higherLowerPlayed": () => getGalacticCasinoStatValue('game3_higherLowerPlayed', 'allTime'),

    "stat_higherLowerWonThisRun": () => getGalacticCasinoStatValue('game3_higherLowerWon', 'currentRun'),
    "stat_higherLowerWon": () => getGalacticCasinoStatValue('game3_higherLowerWon', 'allTime'),

    "stat_voidseerPlayedThisRun": () => getGalacticCasinoStatValue('game4_voidSeerPlayed', 'currentRun'),
    "stat_voidseerPlayed": () => getGalacticCasinoStatValue('game4_voidSeerPlayed', 'allTime'),

    "stat_voidseerWonThisRun": () => getGalacticCasinoStatValue('game4_voidSeerWon', 'currentRun'),
    "stat_voidseerWon": () => getGalacticCasinoStatValue('game4_voidSeerWon', 'allTime'),
};

export const statFunctionsSets = {
    "set_hydrogen": setStatHydrogen,
    "set_helium": setStatHelium,
    "set_carbon": setStatCarbon,
    "set_neon": setStatNeon,
    "set_oxygen": setStatOxygen,
    "set_sodium": setStatSodium,
    "set_silicon": setStatSilicon,
    "set_iron": setStatIron,
    "set_diesel": setStatDiesel,
    "set_glass": setStatGlass,
    "set_steel": setStatSteel,
    "set_concrete": setStatConcrete,
    "set_water": setStatWater,
    "set_titanium": setStatTitanium,
    "set_researchPoints": setStatResearchPoints,
    "set_scienceKits": setStatScienceKits,
    "set_scienceClubs": setStatScienceClubs,
    "set_scienceLabs": setStatScienceLabs,

    "set_hydrogenThisRun": setStatHydrogenThisRun,
    "set_heliumThisRun": setStatHeliumThisRun,
    "set_carbonThisRun": setStatCarbonThisRun,
    "set_neonThisRun": setStatNeonThisRun,
    "set_oxygenThisRun": setStatOxygenThisRun,
    "set_sodiumThisRun": setStatSodiumThisRun,
    "set_siliconThisRun": setStatSiliconThisRun,
    "set_ironThisRun": setStatIronThisRun,

    "set_dieselThisRun": setStatDieselThisRun,
    "set_glassThisRun": setStatGlassThisRun,
    "set_steelThisRun": setStatSteelThisRun,
    "set_concreteThisRun": setStatConcreteThisRun,
    "set_waterThisRun": setStatWaterThisRun,
    "set_titaniumThisRun": setStatTitaniumThisRun,

    "set_researchPointsThisRun": setStatResearchPointsThisRun,
    "set_scienceKitsThisRun": setStatScienceKitsThisRun,
    "set_scienceClubsThisRun": setStatScienceClubsThisRun,
    "set_scienceLabsThisRun": setStatScienceLabsThisRun,
    "set_antimatter": setStatAntimatter,
    "set_antimatterThisRun": setStatAntimatterThisRun,
    "set_apAnticipated": setStatApAnticipated,
    "set_newsTickerPrizesCollected": setStatNewsTickerPrizesCollected,
    "set_totalApGain": setStatTotalApGain,
    "set_starStudyRange": setStatStarStudyRange,
    "set_starShipTravelDistance": setStatStarShipTravelDistance,
    "set_totalLegendaryAsteroidsDiscovered": setStatTotalLegendaryAsteroidsDiscovered,
    "set_totalAsteroidsDiscovered": setStatTotalAsteroidsDiscovered,
    "set_totalRocketsLaunched": setStatTotalRocketsLaunched,
    "set_starShipLaunched": setStatStarShipLaunched,
    "set_allTimesTripped": setStatTimesTripped,
    "set_allTimesTrippedThisRun": setStatTimesTrippedThisRun,
    "set_allTimeBasicPowerPlantsBuilt": setStatBasicPowerPlants,
    "set_allTimeBasicPowerPlantsBuiltThisRun": setStatBasicPowerPlantsThisRun,
    "set_allTimeAdvancedPowerPlantsBuilt": setStatAdvancedPowerPlants,
    "set_allTimeAdvancedPowerPlantsBuiltThisRun": setStatAdvancedPowerPlantsThisRun,
    "set_allTimeSolarPowerPlantsBuilt": setStatSolarPowerPlants,
    "set_allTimeSolarPowerPlantsBuiltThisRun": setStatSolarPowerPlantsThisRun,
    "set_allTimeSodiumIonBatteriesBuilt": setStatSodiumIonBatteries,
    "set_allTimeSodiumIonBatteriesBuiltThisRun": setStatSodiumIonBatteriesThisRun,
    "set_allTimeBattery2Built": setStatBattery2,
    "set_allTimeBattery2BuiltThisRun": setStatBattery2ThisRun,
    "set_allTimeBattery3Built": setStatBattery3,
    "set_allTimeBattery3BuiltThisRun": setStatBattery3ThisRun,
    "set_asteroidsMined": setStatAsteroidsMined,
    "set_asteroidsMinedThisRun": setStatAsteroidsMinedThisRun,
};

export function setGameStateVariable(value) {
    gameState = value;
}

export function getMouseParticleTrailEnabled() {
    return mouseParticleTrailEnabled;
}

export function setMouseParticleTrailEnabled(value) {
    mouseParticleTrailEnabled = Boolean(value);
}

export function getCustomPointerEnabled() {
    return customPointerEnabled;
}

export function setCustomPointerEnabled(value) {
    customPointerEnabled = Boolean(value);
}

export function getMaxMouseTrailParticles() {
    return MAX_MOUSE_TRAIL_PARTICLES;
}

export function getParticleLifetimeMs() {
    return PARTICLE_LIFETIME_MS;
}

export function getParticlesPerEvent() {
    return PARTICLES_PER_EVENT;
}

export function getMouseParticleContainer() {
    return mouseParticleContainer;
}

export function setMouseParticleContainer(value) {
    mouseParticleContainer = value ?? null;
}

export function getCustomPointerAssetKeys() {
    return CUSTOM_POINTER_ASSET_KEYS;
}

export function getCustomPointerFallbackTheme() {
    return CUSTOM_POINTER_FALLBACK_THEME;
}

export function getCursorTypeToPointerMap() {
    return CURSOR_TYPE_TO_POINTER;
}

export function getCustomPointerEnabledClass() {
    return CUSTOM_POINTER_ENABLED_CLASS;
}

export function getCustomPointerHideCursorClass() {
    return CUSTOM_POINTER_HIDE_CURSOR_CLASS;
}

export function getCustomPointerElement() {
    return customPointerElement;
}

export function setCustomPointerElement(element) {
    customPointerElement = element ?? null;
}

export function getCustomPointerImageElement() {
    return customPointerImageElement;
}

export function setCustomPointerImageElement(element) {
    customPointerImageElement = element ?? null;
}

export function getPendingCustomPointerType() {
    return pendingCustomPointerType;
}

export function setPendingCustomPointerType(value) {
    pendingCustomPointerType = typeof value === 'string' && value.length ? value : 'default';
}

export function getCustomPointerListenersAttached() {
    return customPointerListenersAttached;
}

export function setCustomPointerListenersAttached(value) {
    customPointerListenersAttached = Boolean(value);
}

export function getGameStateVariable() {
    return gameState;
}

export function getElements() {
    return elements;
}

export function mapFactoryStarValue(value) {
    if (value === null || value === undefined || value === false) {
        return value;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '') {
            return value;
        }

        const parsed = Number(trimmed);
        if (!Number.isNaN(parsed) && factoryStarMap[parsed]) {
            return factoryStarMap[parsed];
        }

        return trimmed;
    }

    if (typeof value === 'number' && factoryStarMap[value]) {
        return factoryStarMap[value];
    }

    return value;
}

export function resetAllVariablesOnRebirth() {
    const cosmicRipEnabled = typeof window !== 'undefined' && window.__COSMIC_RIP_ENABLED__ === true;
    const hadCosmicRipUnlocked = getTechUnlockedArray().includes('cosmicRip');

    if (!getMegaStructureTechsResearched().some(arr => Array.isArray(arr) && arr[0] === 1 && arr[1] === 5)) {
        infinitePower = false;
    }

    rocketTravelSpeed = 0.1;
    starShipTravelSpeed = 360000; //3600000 one real hour per light year
    runStartTimeStamp = null;
    rocketUserName = {rocket1: 'Rocket 1', rocket2: 'Rocket 2', rocket3: 'Rocket 3', rocket4: 'Rocket 4'};
    asteroidArray = [];
    rocketsBuilt = [];
    starShipModulesBuilt = [];
    rocketsFuellerStartedArray = [];
    launchedRockets = [];
    currentStarSystemWeatherEfficiency = [];
    currentPrecipitationRate = 0;
    techRenderCounter = 0;
    tempRowValue = null;
    sortAsteroidMethod = 'rarity';
    sortStarMethod = 'distance';
    saleResourcePreviews = {};
    saleCompoundPreviews = {};
    createCompoundPreviews = {};
    constituentPartsObject = {};
    itemsToDeduct = {};
    itemsToIncreasePrice = {};
    techUnlockedArray = ['apAwardedThisRun'];
    if (cosmicRipEnabled && hadCosmicRipUnlocked) {
        techUnlockedArray.unshift('cosmicRip');
    }
    revealedTechArray = [];
    upcomingTechArray = [];
    unlockedResourcesArray = ['hydrogen'];
    unlockedCompoundsArray = [];
    temporaryCoreTechRowsRepo = null;
    canAffordDeferred = null;
    originalFrameNumbers = {};
    baseSearchAsteroidTimerDuration = 120000;
    baseInvestigateStarTimerDuration = 400000;
    basePillageVoidTimerDuration = 500000;
    currentAsteroidSearchTimerDurationTotal = 0;
    currentInvestigateStarTimerDurationTotal = 0;
    currentPillageVoidTimerDurationTotal = 0;
    timeLeftUntilAsteroidScannerTimerFinishes = 0;
    timeLeftUntilTravelToDestinationStarTimerFinishes = 0;
    timeLeftUntilPillageVoidTimerFinishes = 0;
    timeLeftUntilStarInvestigationTimerFinishes = 0;
    oldAntimatterRightBoxSvgData = null;
    currentDestinationDropdownText = 'Select an option';
    starVisionDistance = 0; //0
    starMapMode = 'normal';
    starVisionIncrement = 1;
    destinationStar = null;
    fromStarObject = null;
    toStarObject = null;
    currentStarObject = null;
    starShipStatus = ['preconstruction', null];
    collectedPrecipitationQuantityThisRun = 0;
    additionalSystemsToSettleThisRun = [];

    casinoPointsSpentThisRun = 0;
    casinoGame1DoubleOrNothingPlayedThisRun = 0;
    casinoGame1DoubleOrNothingWonThisRun = 0;
    casinoGame2WheelPlayedThisRun = 0;
    casinoGame2WheelWonThisRun = 0;
    casinoGame2WheelSpecialWonThisRun = 0;
    casinoGame3HigherLowerPlayedThisRun = 0;
    casinoGame3HigherLowerWonThisRun = 0;
    casinoGame4VoidSeerPlayedThisRun = 0;
    casinoGame4VoidSeerWonThisRun = 0;
    ripTelemetryDataEarnedThisRun = 0;

    randomEventTriggerCountsThisRun = {};

    runNumber++;
    
    battleUnits = { 
        player: [], 
        enemy: [] 
    };
    
    miningObject = {
        rocket1: null,
        rocket2: null,
        rocket3: null,
        rocket4: null  
    }
    
    timeLeftUntilRocketTravelToAsteroidTimerFinishes = {
        rocket1: 0,
        rocket2: 0,
        rocket3: 0,
        rocket4: 0  
    }
    
    rocketTravelDuration = {
        rocket1: 0,
        rocket2: 0,
        rocket3: 0,
        rocket4: 0
    }
    
    starTravelDuration = 0;
    
    destinationAsteroid = {
        rocket1: null,
        rocket2: null,
        rocket3: null,
        rocket4: null 
    };
    
    rocketDirection = {
        rocket1: false,
        rocket2: false,
        rocket3: false,
        rocket4: false 
    }

    currentlyTravellingToAsteroid = {
        rocket1: false,
        rocket2: false,
        rocket3: false,
        rocket4: false
    };

    rocketReadyToTravel = {
        rocket1: true,
        rocket2: true,
        rocket3: true,
        rocket4: true
    };
    
    oneOffPrizesAlreadyClaimedArray = [];
    
    activatedFuelBurnObject = {
        carbon: false,
    };
    
    buildingTypeOnOff = {
        powerPlant1: false,
        powerPlant2: false,
        powerPlant3: false,
    }
    
    ranOutOfFuelWhenOn = {
        powerPlant1: false,
        powerPlant2: false,
        powerPlant3: false,
    }

    compoundCreateDropdownRecipeText = {
        diesel: {
          fillToCapacity: { value: 'fillToCapacity', text: 'Fill To Capacity' },
          max: { value: 'max', text: 'Max Possible' },
          threeQuarters: { value: 'threeQuarters', text: 'Up to 75%' },
          twoThirds: { value: 'twoThirds', text: 'Up to 67%' },
          half: { value: 'half', text: 'Up to 50%' },
          oneThird: { value: 'oneThird', text: 'Up to 33%' },
          50000: { value: '50000', text: '50000 - 1.3M Hyd, 600K Crb' },
          5000: { value: '5000', text: '5000 - 130K Hyd, 60K Crb' },
          500: { value: '500', text: '500 - 13K Hyd, 6K Crb' },
          50: { value: '50', text: '50 - 1.3K Hyd, 600 Crb' },
          5: { value: '5', text: '5 - 130 Hyd, 60 Crb' },
          1: { value: '1', text: '1 - 26 Hyd, 12 Crb' }
        },
        glass: {
          fillToCapacity: { value: 'fillToCapacity', text: 'Fill To Capacity' },
          max: { value: 'max', text: 'Max Possible' },
          threeQuarters: { value: 'threeQuarters', text: 'Up to 75%' },
          twoThirds: { value: 'twoThirds', text: 'Up to 67%' },
          half: { value: 'half', text: 'Up to 50%' },
          oneThird: { value: 'oneThird', text: 'Up to 33%' },
          50000: { value: '50000', text: '50000 - 200K Sil, 100K Oxy, 50K Sod' },
          5000: { value: '5000', text: '5000 - 20K Sil, 10K Oxy, 5K Sod' },
          500: { value: '500', text: '500 - 2K Sil, 1K Oxy, 500 Sod' },
          50: { value: '50', text: '50 - 200 Sil, 100 Oxy, 50 Sod' },
          5: { value: '5', text: '5 - 20 Sil, 10 Oxy, 5 Sod' },
          1: { value: '1', text: '1 - 4 Sil, 2 Oxy, 1 Sod' }
        },
        steel: {
          fillToCapacity: { value: 'fillToCapacity', text: 'Fill To Capacity' },
          max: { value: 'max', text: 'Max Possible' },
          threeQuarters: { value: 'threeQuarters', text: 'Up to 75%' },
          twoThirds: { value: 'twoThirds', text: 'Up to 67%' },
          half: { value: 'half', text: 'Up to 50%' },
          oneThird: { value: 'oneThird', text: 'Up to 33%' },
          50000: { value: '50000', text: '50000 - 200K Irn, 50K Crb' },
          5000: { value: '5000', text: '5000 - 20K Irn, 5K Crb' },
          500: { value: '500', text: '500 - 2K Irn, 500 Crb' },
          50: { value: '50', text: '50 - 200 Irn, 50 Crb' },
          5: { value: '5', text: '5 - 20 Irn, 5 Crb' },
          1: { value: '1', text: '1 - 4 Irn, 1 Crb' }
        },
        concrete: {
          fillToCapacity: { value: 'fillToCapacity', text: 'Fill To Capacity' },
          max: { value: 'max', text: 'Max Possible' },
          threeQuarters: { value: 'threeQuarters', text: 'Up to 75%' },
          twoThirds: { value: 'twoThirds', text: 'Up to 67%' },
          half: { value: 'half', text: 'Up to 50%' },
          oneThird: { value: 'oneThird', text: 'Up to 33%' },
          50000: { value: '50000', text: '50000 - 250K Sil, 100K Sod, 150K Hyd' },
          5000: { value: '5000', text: '5000 - 25K Sil, 10K Sod, 15K Hyd' },
          500: { value: '500', text: '500 - 2.5K Sil, 1K Sod, 1.5K Hyd' },
          50: { value: '50', text: '50 - 250 Sil, 100 Sod, 150 Hyd' },
          5: { value: '5', text: '5 - 25 Sil, 10 Sod, 15 Hyd' },
          1: { value: '1', text: '1 - 5 Sil, 2 Sod, 3 Hyd' }
        },
        water: {
          fillToCapacity: { value: 'fillToCapacity', text: 'Fill To Capacity' },
          max: { value: 'max', text: 'Max Possible' },
          threeQuarters: { value: 'threeQuarters', text: 'Up to 75%' },
          twoThirds: { value: 'twoThirds', text: 'Up to 67%' },
          half: { value: 'half', text: 'Up to 50%' },
          oneThird: { value: 'oneThird', text: 'Up to 33%' },
          50000: { value: '50000', text: '50000 - 1M Hyd, 500K Oxy' },
          5000: { value: '5000', text: '5000 - 100K Hyd, 50K Oxy' },
          500: { value: '500', text: '500 - 10K Hyd, 5K Oxy' },
          50: { value: '50', text: '50 - 1K Hyd, 500 Oxy' },
          5: { value: '5', text: '5 - 100 Hyd, 50 Oxy' },
          1: { value: '1', text: '1 - 20 Hyd, 10 Oxy' }
        },
        titanium: {
          fillToCapacity: { value: 'fillToCapacity', text: 'Fill To Capacity' },
          max: { value: 'max', text: 'Max Possible' },
          threeQuarters: { value: 'threeQuarters', text: 'Up to 75%' },
          twoThirds: { value: 'twoThirds', text: 'Up to 67%' },
          half: { value: 'half', text: 'Up to 50%' },
          oneThird: { value: 'oneThird', text: 'Up to 33%' },
          50000: { value: '50000', text: '50000 - 1.1M Irn, 900K Sod, 2M Neo' },
          5000: { value: '5000', text: '5000 - 110K Irn, 90K Sod, 200K Neo' },
          500: { value: '500', text: '500 - 11K Irn, 9K Sod, 20K Neo' },
          50: { value: '50', text: '50 - 1.1K Irn, 900 Sod, 2K Neo' },
          5: { value: '5', text: '5 - 110 Irn, 90 Sod, 200 Neo' },
          1: { value: '1', text: '1 - 22 Irn, 18 Sod, 40 Neo' }
        }
    };
    
    battleResolved = [false, null];

    galacticMarketOutgoingStockType = 'select';
    galacticMarketIncomingStockType = 'select';
    galacticMarketOutgoingQuantitySelectionType = 'select';
    galacticMarketSellApForCashQuantity = 'select';
    galacticCasinoPurchaseItem = 'select';
    currentGalacticMarketCommission = 10;
    apSellForCashPrice = AP_BASE_SELL_PRICE;
    apBuyForCashPrice = AP_BASE_BUY_PRICE;
    liquidationValue = 0;
    apLiquidationQuantity = 0;
    
    //STATS PAGE LOGGERS
    starStudyRange = 0;
    antimatterMinedThisRun = 0;
    currentRunNumber = runNumber;
    currentRunTimer = 0;
    apAnticipatedThisRun = 0;
    starShipTravelDistance = 0;
    asteroidsMinedThisRun = 0;
    timesTrippedThisRun = 0;
    basicPowerPlantsBuiltThisRun = 0;
    advancedPowerPlantsBuiltThisRun = 0;
    solarPowerPlantsBuiltThisRun = 0;
    sodiumIonBatteriesBuiltThisRun = 0;
    battery2BuiltThisRun = 0;
    battery3BuiltThisRun = 0;
    enemyFleetPowerAtBattleStart = 0;

    hydrogenThisRun = 0;
    heliumThisRun = 0;
    carbonThisRun = 0;
    neonThisRun = 0;
    oxygenThisRun = 0;
    sodiumThisRun = 0;
    siliconThisRun = 0;
    ironThisRun = 0;

    dieselThisRun = 0;
    glassThisRun = 0;
    steelThisRun = 0;
    concreteThisRun = 0;
    waterThisRun = 0;
    titaniumThisRun = 0;

    researchPointsThisRun = 0;
    scienceKitsThisRun = 0;
    scienceClubsThisRun = 0;
    scienceLabsThisRun = 0;
    allTimeTotalRocketsLaunched = 0;
    allTimeTotalStarShipsLaunched = 0;
    allTimeTotalAsteroidsDiscovered = 0;
    allTimeTotalLegendaryAsteroidsDiscovered = 0;
    starStudyRange = 0;
    allTimeTotalAntimatterMined = 0;
    antimatterMinedThisRun = 0;
    allTimeTotalApGain = 0;
    currentRunNumber = 0;
    currentRunTimer = 0;
    totalNewsTickerPrizesCollected = 0;
    apAnticipatedThisRun = 0;
    allTimeStarShipsBuilt = 0;
    starShipTravelDistance = 0;
    allTimesTripped = 0;
    allTimeBasicPowerPlantsBuilt = 0;
    allTimeAdvancedPowerPlantsBuilt = 0;
    allTimeSolarPowerPlantsBuilt = 0;
    allTimeSodiumIonBatteriesBuilt = 0;
    allTimeBattery2Built = 0;
    allTimeBattery3Built = 0;
    asteroidsMinedThisRun = 0;
    formationGoal = null;
    liquidationValue = 0;

    //FLAGS
    checkRocketFuellingStatus = {
        rocket1: false,
        rocket2: false,
        rocket3: false,
        rocket4: false
    };
    
    currentlyTravellingToAsteroid = {
        rocket1: false,
        rocket2: false,
        rocket3: false,
        rocket4: false
    };
    
    rocketReadyToTravel = {
        rocket1: true,
        rocket2: true,
        rocket3: true,
        rocket4: true
    }
    
    currentRunIsMegaStructureRun = false;
    techRenderChange = false;
    suppressUiClickSfx = false;
    losingEnergy = false;
    powerOnOff = getInfinitePower();
    trippedStatus = false;
    weatherEffectOn = false;
    weatherEfficiencyApplied = false;
    currentlySearchingAsteroid = false;
    currentlyInvestigatingStar = false;
    currentlyPillagingVoid = false;
    telescopeReadyToSearch = true;
    currentlyChargingBlackHole = false;
    blackHoleChargeReady = false;
    asteroidTimerCanContinue = false;
    starInvestigationTimerCanContinue = false;
    pillageVoidTimerCanContinue = false;

    if (!getPermanentAntimatterUnlock()) {
        antimatterUnlocked = false;
    }
    
    isAntimatterBoostActive = false;
    antimatterSvgEventListeners = false;
    canTravelToAsteroids = false;
    canFuelRockets = false;
    starShipBuilt = false;
    starShipTravelling = false;
    starShipArrowPosition = 0;
    stellarScannerBuilt = false;
    destinationStarScanned = false;
    diplomacyPossible = true;
    warMode = false;
    fleetChangedSinceLastDiplomacy = false;
    battleOngoing = false;
    battleTriggeredByPlayer = false;
    needNewBattleCanvas = false;
    redrawBattleDescription = true;
    inFormation = false;
    enemyFleetAdjustedForDiplomacy = false;
    apAwardedThisRun = false;
    galacticMarketOutgoingQuantitySelectionTypeDisabledStatus = true;
    galacticMarketLiquidationAuthorization = 'no';
    hasClickedOutgoingOptionGalacticMarket = false;
    liquidatedThisRun = false;
    belligerentEnemyFlag = false;
    galacticCasinoUnlocked = false;

    setCurrentPrecipitationRate(0);
    stopWeatherEffect();
    setWeatherEffectOn(false);
}

export function captureGameStatusForSaving(type) {
    detectAndSetUserPlatform();
    let gameState = {};

    if (type === 'manualExportCloud') {
        const saveNameElement = document.getElementById('saveName');
        if (saveNameElement && typeof saveNameElement.value === 'string') {
            setSaveName(saveNameElement.value);
        }
        localStorage.setItem('saveName', getSaveName());
    }

    if (type === 'initialise') {
        localStorage.setItem('saveName', getSaveName());
    }

    gameState.resourceData = JSON.parse(JSON.stringify(resourceData));
    gameState.starSystems = JSON.parse(JSON.stringify(starSystems));
    gameState.galacticMarket = JSON.parse(JSON.stringify(galacticMarket));
    gameState.galacticCasino = JSON.parse(JSON.stringify(galacticCasino));
    gameState.ascendencyBuffs = JSON.parse(JSON.stringify(ascendencyBuffs));
    gameState.achievementsData = JSON.parse(JSON.stringify(achievementsData));

    gameState.saveName = getSaveName();
    gameState.currentTheme = getCurrentTheme();
    gameState.themesTriedArray = themesTriedArray;
    gameState.autoSaveFrequency = getAutoSaveFrequency();
    gameState.currentStarSystem = getCurrentStarSystem();
    gameState.currencySymbol = getCurrencySymbol();
    gameState.constituentPartsObject = getConstituentPartsObject();
    gameState.techUnlockedArray = techUnlockedArray;
    gameState.revealedTechArray = revealedTechArray;
    gameState.cosmicRipTechUnlockedArray = cosmicRipTechUnlockedArray;
    gameState.revealedCosmicRipTechArray = revealedCosmicRipTechArray;
    gameState.upcomingTechArray = upcomingTechArray;
    gameState.unlockedResourcesArray = unlockedResourcesArray;
    gameState.unlockedCompoundsArray = unlockedCompoundsArray;
    gameState.activatedFuelBurnObject = activatedFuelBurnObject;
    gameState.buildingTypeOnOff = buildingTypeOnOff;
    gameState.ranOutOfFuelWhenOn = ranOutOfFuelWhenOn;
    gameState.notationType = getNotationType();
    gameState.oneOffPrizesAlreadyClaimedArray = oneOffPrizesAlreadyClaimedArray;
    gameState.rocketsBuilt = rocketsBuilt;
    gameState.starShipModulesBuilt = starShipModulesBuilt;
    gameState.rocketsFuellerStartedArray = rocketsFuellerStartedArray;
    gameState.launchedRockets = launchedRockets;
    gameState.baseSearchAsteroidTimerDuration = baseSearchAsteroidTimerDuration;
    gameState.timeLeftUntilAsteroidScannerTimerFinishes = timeLeftUntilAsteroidScannerTimerFinishes;
    gameState.timeLeftUntilBlackHoleChargeTimerFinishes = timeLeftUntilBlackHoleChargeTimerFinishes;
    gameState.timeLeftUntilStarInvestigationTimerFinishes = timeLeftUntilStarInvestigationTimerFinishes;
    gameState.timeLeftUntilPillageVoidTimerFinishes = timeLeftUntilPillageVoidTimerFinishes;
    gameState.timeLeftUntilTravelToDestinationStarTimerFinishes = timeLeftUntilTravelToDestinationStarTimerFinishes;
    gameState.currentAsteroidSearchTimerDurationTotal = currentAsteroidSearchTimerDurationTotal;
    gameState.currentInvestigateStarTimerDurationTotal = currentInvestigateStarTimerDurationTotal;
    gameState.currentPillageVoidTimerDurationTotal = currentPillageVoidTimerDurationTotal;
    gameState.currentBlackHoleChargeTimerDurationTotal = currentBlackHoleChargeTimerDurationTotal;
    gameState.timeLeftUntilRocketTravelToAsteroidTimerFinishes = timeLeftUntilRocketTravelToAsteroidTimerFinishes;
    gameState.asteroidArray = asteroidArray;
    gameState.cosmicRipTechTimeLeftUntilResearchFinishes = cosmicRipTechTimeLeftUntilResearchFinishes;
    gameState.cosmicRipTechResearchDurations = cosmicRipTechResearchDurations;
    gameState.rocketTravelDuration = rocketTravelDuration;
    gameState.starTravelDuration = starTravelDuration;
    gameState.miningObject = miningObject;
    gameState.destinationAsteroid = destinationAsteroid;
    gameState.rocketDirection = rocketDirection;
    gameState.rocketUserName = rocketUserName;
    gameState.rocketNames = rocketNames;
    gameState.starVisionDistance = starVisionDistance;
    gameState.starVisionIncrement = starVisionIncrement;
    gameState.destinationStar = destinationStar;
    gameState.fromStarObject = fromStarObject;
    gameState.toStarObject = toStarObject;
    gameState.currentStarObject = currentStarObject;
    gameState.starShipStatus = starShipStatus;
    gameState.destinationStar = destinationStar;
    gameState.allTimeTotalHydrogen = allTimeTotalHydrogen;
    gameState.allTimeTotalHelium = allTimeTotalHelium;
    gameState.allTimeTotalCarbon = allTimeTotalCarbon;
    gameState.allTimeTotalNeon = allTimeTotalNeon;
    gameState.allTimeTotalOxygen = allTimeTotalOxygen;
    gameState.allTimeTotalSodium = allTimeTotalSodium;
    gameState.allTimeTotalSilicon = allTimeTotalSilicon;
    gameState.allTimeTotalIron = allTimeTotalIron;
    gameState.allTimeTotalDiesel = allTimeTotalDiesel;
    gameState.allTimeTotalGlass = allTimeTotalGlass;
    gameState.allTimeTotalSteel = allTimeTotalSteel;
    gameState.allTimeTotalConcrete = allTimeTotalConcrete;
    gameState.allTimeTotalWater = allTimeTotalWater;
    gameState.allTimeTotalTitanium = allTimeTotalTitanium;
    gameState.allTimeTotalResearchPoints = allTimeTotalResearchPoints;
    gameState.allTimeTotalScienceKits = allTimeTotalScienceKits;
    gameState.allTimeTotalScienceClubs = allTimeTotalScienceClubs;
    gameState.allTimeTotalScienceLabs = allTimeTotalScienceLabs;

    gameState.hydrogenThisRun = hydrogenThisRun;
    gameState.heliumThisRun = heliumThisRun;
    gameState.carbonThisRun = carbonThisRun;
    gameState.neonThisRun = neonThisRun;
    gameState.oxygenThisRun = oxygenThisRun;
    gameState.sodiumThisRun = sodiumThisRun;
    gameState.siliconThisRun = siliconThisRun;
    gameState.ironThisRun = ironThisRun;

    gameState.dieselThisRun = dieselThisRun;
    gameState.glassThisRun = glassThisRun;
    gameState.steelThisRun = steelThisRun;
    gameState.concreteThisRun = concreteThisRun;
    gameState.waterThisRun = waterThisRun;
    gameState.titaniumThisRun = titaniumThisRun;

    gameState.researchPointsThisRun = researchPointsThisRun;
    gameState.scienceKitsThisRun = scienceKitsThisRun;
    gameState.scienceClubsThisRun = scienceClubsThisRun;
    gameState.scienceLabsThisRun = scienceLabsThisRun;

    gameState.casinoPointsSpentThisRun = casinoPointsSpentThisRun;
    gameState.casinoGame1DoubleOrNothingPlayedThisRun = casinoGame1DoubleOrNothingPlayedThisRun;
    gameState.casinoGame1DoubleOrNothingWonThisRun = casinoGame1DoubleOrNothingWonThisRun;
    gameState.casinoGame2WheelPlayedThisRun = casinoGame2WheelPlayedThisRun;
    gameState.casinoGame2WheelWonThisRun = casinoGame2WheelWonThisRun;
    gameState.casinoGame2WheelSpecialWonThisRun = casinoGame2WheelSpecialWonThisRun;
    gameState.casinoGame3HigherLowerPlayedThisRun = casinoGame3HigherLowerPlayedThisRun;
    gameState.casinoGame3HigherLowerWonThisRun = casinoGame3HigherLowerWonThisRun;
    gameState.casinoGame4VoidSeerPlayedThisRun = casinoGame4VoidSeerPlayedThisRun;
    gameState.casinoGame4VoidSeerWonThisRun = casinoGame4VoidSeerWonThisRun;
    gameState.ripTelemetryDataEarnedThisRun = ripTelemetryDataEarnedThisRun;
    gameState.allTimeTotalRocketsLaunched = allTimeTotalRocketsLaunched;
    gameState.allTimeTotalStarShipsLaunched = allTimeTotalStarShipsLaunched;
    gameState.allTimeTotalAsteroidsDiscovered = allTimeTotalAsteroidsDiscovered;
    gameState.allTimeTotalLegendaryAsteroidsDiscovered = allTimeTotalLegendaryAsteroidsDiscovered;

    gameState.allTimeCasinoPointsSpent = allTimeCasinoPointsSpent;
    gameState.allTimeCasinoGame1DoubleOrNothingPlayed = allTimeCasinoGame1DoubleOrNothingPlayed;
    gameState.allTimeCasinoGame1DoubleOrNothingWon = allTimeCasinoGame1DoubleOrNothingWon;
    gameState.allTimeCasinoGame2WheelPlayed = allTimeCasinoGame2WheelPlayed;
    gameState.allTimeCasinoGame2WheelWon = allTimeCasinoGame2WheelWon;
    gameState.allTimeCasinoGame2WheelSpecialWon = allTimeCasinoGame2WheelSpecialWon;
    gameState.allTimeCasinoGame3HigherLowerPlayed = allTimeCasinoGame3HigherLowerPlayed;
    gameState.allTimeCasinoGame3HigherLowerWon = allTimeCasinoGame3HigherLowerWon;
    gameState.allTimeCasinoGame4VoidSeerPlayed = allTimeCasinoGame4VoidSeerPlayed;
    gameState.allTimeCasinoGame4VoidSeerWon = allTimeCasinoGame4VoidSeerWon;
    gameState.allTimeRipTelemetryDataEarned = allTimeRipTelemetryDataEarned;
    gameState.allTimeTotalStarsStudied = starStudyRange;
    gameState.allTimeTotalAntimatterMined = allTimeTotalAntimatterMined;
    gameState.antimatterMinedThisRun = antimatterMinedThisRun;
    gameState.allTimeTotalApGain = allTimeTotalApGain;
    gameState.currentRunNumber = currentRunNumber;
    gameState.currentRunTimer = currentRunTimer;
    gameState.totalNewsTickerPrizesCollected = totalNewsTickerPrizesCollected;
    gameState.apAnticipatedThisRun = apAnticipatedThisRun;
    gameState.allTimeStarShipsBuilt = allTimeStarShipsBuilt;
    gameState.alreadySeenNewsTickerArray = alreadySeenNewsTickerArray;
    gameState.activatedWackyNewsEffectsArray = activatedWackyNewsEffectsArray;
    gameState.collectedPrecipitationQuantityThisRun = collectedPrecipitationQuantityThisRun;
    gameState.gameActiveCountTime = gameActiveCountTime;
    gameState.userPlatform = userPlatform;
    gameState.hostSource = hostSource;
    gameState.compoundCreateDropdownRecipeText = compoundCreateDropdownRecipeText;
    gameState.firstAccessArray = firstAccessArray;
    gameState.philosophy = philosophy;
    gameState.repeatableTechMultipliers = repeatableTechMultipliers;
    gameState.playerStartingUnitHealth = playerStartingUnitHealth;
    gameState.initialImpression = initialImpression;
    gameState.rocketTravelSpeed = rocketTravelSpeed;
    gameState.starShipTravelSpeed = starShipTravelSpeed;
    gameState.increaseStorageFactor = increaseStorageFactor;
    gameState.additionalSystemsToSettleThisRun = additionalSystemsToSettleThisRun;
    gameState.starsWithAncientManuscripts = starsWithAncientManuscripts;
    gameState.factoryStarsArray = factoryStarsArray;
    gameState.manuscriptCluesShown = manuscriptCluesShown;
    gameState.megaStructuresInPossessionArray = megaStructuresInPossessionArray;
    gameState.oStarArrivalPopupsShown = oStarArrivalPopupsShown;
    gameState.oTypeMechanicActivatedForThisSave = oTypeMechanicActivatedForThisSave;
    gameState.oTypePowerPlantBuffs = JSON.parse(JSON.stringify(oTypePowerPlantBuffs));
    gameState.miaplacidusMilestoneLevel = miaplacidusMilestoneLevel;
    gameState.megaStructureTechsResearched = megaStructureTechsResearched;
    gameState.megaStructureAntimatterAmount = megastructureAntimatterAmount;
    gameState.galacticPointsSpent = galacticPointsSpent;

    gameState.runNumber = runNumber;
    gameState.starShipTravelDistance = starShipTravelDistance;
    gameState.allTimesTripped = allTimesTripped;
    gameState.timesTrippedThisRun = timesTrippedThisRun;
    gameState.allTimeBasicPowerPlantsBuilt = allTimeBasicPowerPlantsBuilt;
    gameState.allTimeAdvancedPowerPlantsBuilt = allTimeAdvancedPowerPlantsBuilt;
    gameState.allTimeSolarPowerPlantsBuilt = allTimeSolarPowerPlantsBuilt;
    gameState.allTimeSodiumIonBatteriesBuilt = allTimeSodiumIonBatteriesBuilt;
    gameState.allTimeBattery2Built = allTimeBattery2Built;
    gameState.allTimeBattery3Built = allTimeBattery3Built;
    gameState.basicPowerPlantsBuiltThisRun = basicPowerPlantsBuiltThisRun;
    gameState.advancedPowerPlantsBuiltThisRun = advancedPowerPlantsBuiltThisRun;
    gameState.solarPowerPlantsBuiltThisRun = solarPowerPlantsBuiltThisRun;
    gameState.sodiumIonBatteriesBuiltThisRun = sodiumIonBatteriesBuiltThisRun;
    gameState.battery2BuiltThisRun = battery2BuiltThisRun;
    gameState.battery3BuiltThisRun = battery3BuiltThisRun;
    gameState.allTimeRocketsBuilt = allTimeRocketsBuilt;
    gameState.allTimeTotalAsteroidsMined = allTimeTotalAsteroidsMined;
    gameState.asteroidsMinedThisRun = asteroidsMinedThisRun;
    gameState.enemyFleetPowerAtBattleStart = enemyFleetPowerAtBattleStart;
    gameState.runStartTimeStamp = runStartTimeStamp;
    gameState.gameStartTimeStamp = gameStartTimeStamp;
    gameState.battleUnits = battleUnits;
    gameState.battleResolved = battleResolved;
    gameState.settledStars = settledStars;
    gameState.currentGalacticMarketCommission = currentGalacticMarketCommission;
    gameState.multiplierPermanentResources = multiplierPermanentResources;
    gameState.multiplierPermanentCompounds = multiplierPermanentCompounds;
    gameState.feedbackGiven = feedbackGiven;
    gameState.feedbackContent = feedbackContent;
    gameState.blackHoleDiscovered = blackHoleDiscovered;
    gameState.blackHoleDiscoveryProbability = blackHoleDiscoveryProbability;

    gameState.flags = {
        autoSaveToggle: autoSaveToggle,
        weatherEffectSettingToggle: weatherEffectSettingToggle,
        newsTickerSetting: newsTickerSetting,
        notificationsToggle: notificationsToggle,
        customPointerEnabled: customPointerEnabled,
        mouseParticleTrailEnabled: mouseParticleTrailEnabled,
        blackHoleNerfPatched: blackHoleNerfPatched,
        techRenderChange: techRenderChange,
        suppressUiClickSfx: suppressUiClickSfx,
        losingEnergy: losingEnergy,
        powerOnOff: powerOnOff,
        trippedStatus: trippedStatus,
        currentlySearchingAsteroid: currentlySearchingAsteroid,
        currentlyInvestigatingStar: currentlyInvestigatingStar,
        currentlyPillagingVoid: currentlyPillagingVoid,
        telescopeReadyToSearch: telescopeReadyToSearch,
        currentlyChargingBlackHole: currentlyChargingBlackHole,
        blackHoleChargeReady: blackHoleChargeReady,
        blackHoleAlwaysOn: blackHoleAlwaysOn,
        currentlyTravellingToAsteroid: currentlyTravellingToAsteroid,
        rocketReadyToTravel: rocketReadyToTravel,
        antimatterUnlocked: antimatterUnlocked,
        canTravelToAsteroids: canTravelToAsteroids,
        canFuelRockets: canFuelRockets,
        backgroundAudio: backgroundAudio,
        sfx: sfx,
        starShipBuilt: starShipBuilt,
        starShipTravelling: starShipTravelling,
        stellarScannerBuilt: stellarScannerBuilt,
        destinationStarScanned: destinationStarScanned,
        diplomacyPossible: diplomacyPossible,
        warMode: warMode,
        enemyFleetAdjustedForDiplomacy: enemyFleetAdjustedForDiplomacy,
        apAwardedThisRun: apAwardedThisRun,
        rebirthPossible: rebirthPossible,
        liquidatedThisRun: liquidatedThisRun,
        belligerentEnemyFlag: belligerentEnemyFlag,
        feedbackCanBeRequested: feedbackCanBeRequested,
        philosophyAbilityActive: philosophyAbilityActive,
        eventsTriggeredOnce: eventsTriggeredOnce,
        currentRunIsMegaStructureRun: currentRunIsMegaStructureRun,
        megaStructureTabNotificationShown: megaStructureTabNotificationShown,
        hasVisitedMegaStructure: hasVisitedMegaStructure,
        megaStructureTabUnlocked: megaStructureTabUnlocked,
        infinitePower: infinitePower,
        megaStructureResourceBonus: megaStructureResourceBonus,
        storageAdderBonus: storageAdderBonus,
        megaStructureAssignmentMode: megaStructureAssignmentMode,
        permanentAntimatterUnlock: permanentAntimatterUnlock,
        nonExhaustiveResources: nonExhaustiveResources,
        miaplacidusEndgameStoryShown: miaplacidusEndgameStoryShown,
        galacticCasinoUnlocked: galacticCasinoUnlocked,
    }

    return gameState;
}

export function restoreGameStatus(gameState, type) {
    return new Promise((resolve, reject) => {
        try {
            if (gameState?.resourceData) {
                const resourceVersion = Number(gameState.resourceData.version ?? 0);
                if (resourceVersion < MINIMUM_GAME_VERSION_FOR_SAVES) {
                    return reject(new Error('Save version below minimum supported version'));
                }
            }

            if (gameState.resourceData) {
                restoreResourceDataObject(JSON.parse(JSON.stringify(gameState.resourceData)));
            } else {
                gameState.resourceData = resourceData;
            }
            
            if (gameState.starSystems) {
                restoreStarSystemsDataObject(JSON.parse(JSON.stringify(gameState.starSystems)));
            } else {
                gameState.starSystems = starSystems;
            }
            
            if (gameState.rocketNames) {
                restoreRocketNamesObject(JSON.parse(JSON.stringify(gameState.rocketNames)));
            } else {
                gameState.rocketNames = rocketNames;
            }      
            
            if (gameState.galacticMarket) {
                restoreGalacticMarketDataObject(JSON.parse(JSON.stringify(gameState.galacticMarket)));
            } else {
                gameState.galacticMarket = galacticMarket;
            }

            if (gameState.galacticCasino) {
                restoreGalacticCasinoDataObject(JSON.parse(JSON.stringify(gameState.galacticCasino)));
            } else {
                gameState.galacticCasino = galacticCasino;
            }

            if (gameState.ascendencyBuffs) {
                restoreAscendencyBuffsDataObject(JSON.parse(JSON.stringify(gameState.ascendencyBuffs)));
            } else {
                gameState.ascendencyBuffs = ascendencyBuffs;
            }

            if (gameState.achievementsData) {
                let parsed = JSON.parse(JSON.stringify(gameState.achievementsData));
                parsed = attachAchievementFunctions(parsed);
                restoreAchievementsDataObject(parsed);
            } else {
                gameState.achievementsData = achievementsData;
            }

            if (gameState.oTypePowerPlantBuffs) {
                restoreOTypePowerPlantBuffsObject(JSON.parse(JSON.stringify(gameState.oTypePowerPlantBuffs)));
            } else {
                gameState.oTypePowerPlantBuffs = oTypePowerPlantBuffs;
            }
            

            if (type === 'cloud') {
                if (gameState.saveName) {
                    setSaveName(gameState.saveName);
                }
            }

            setCurrentTheme(gameState.currentTheme);
            themesTriedArray = Array.isArray(gameState.themesTriedArray) ? gameState.themesTriedArray : ['terminal'];
            const savedAutoSaveFrequency = Number(gameState.autoSaveFrequency);
            setAutoSaveFrequency(Number.isFinite(savedAutoSaveFrequency) && savedAutoSaveFrequency > 0 ? savedAutoSaveFrequency : 300000);
            setCurrentStarSystem(gameState.currentStarSystem);
            setCurrencySymbol(gameState.currencySymbol);
            setConstituentPartsObject(gameState.constituentPartsObject);
            blackHoleDiscovered = gameState.blackHoleDiscovered ?? false;
            blackHoleDiscoveryProbability = gameState.blackHoleDiscoveryProbability ?? 0;
            techUnlockedArray = gameState.techUnlockedArray;
            revealedTechArray = gameState.revealedTechArray;
            cosmicRipTechUnlockedArray = gameState.cosmicRipTechUnlockedArray ?? [];
            revealedCosmicRipTechArray = gameState.revealedCosmicRipTechArray ?? [];
            upcomingTechArray = gameState.upcomingTechArray;
            unlockedResourcesArray = gameState.unlockedResourcesArray;
            unlockedCompoundsArray = gameState.unlockedCompoundsArray;
            activatedFuelBurnObject = gameState.activatedFuelBurnObject;
            buildingTypeOnOff = gameState.buildingTypeOnOff;
            ranOutOfFuelWhenOn = gameState.ranOutOfFuelWhenOn;
            setNotationType(gameState.notationType);
            oneOffPrizesAlreadyClaimedArray = gameState.oneOffPrizesAlreadyClaimedArray;
            rocketsBuilt = gameState.rocketsBuilt;
            starShipModulesBuilt = gameState.starShipModulesBuilt ?? [''];
            rocketsFuellerStartedArray = gameState.rocketsFuellerStartedArray ?? [''];
            launchedRockets = gameState.launchedRockets ?? [''];
            baseSearchAsteroidTimerDuration = gameState.baseSearchAsteroidTimerDuration ?? 120000;
            timeLeftUntilAsteroidScannerTimerFinishes = gameState.timeLeftUntilAsteroidScannerTimerFinishes ?? 0;
            timeLeftUntilBlackHoleChargeTimerFinishes = gameState.timeLeftUntilBlackHoleChargeTimerFinishes ?? 0;
            timeLeftUntilStarInvestigationTimerFinishes = gameState.timeLeftUntilStarInvestigationTimerFinishes ?? 0;
            timeLeftUntilPillageVoidTimerFinishes = gameState.timeLeftUntilPillageVoidTimerFinishes ?? 0;
            timeLeftUntilRocketTravelToAsteroidTimerFinishes = gameState.timeLeftUntilRocketTravelToAsteroidTimerFinishes ?? {rocket1: 0, rocket2: 0, rocket3: 0, rocket4: 0};
            timeLeftUntilTravelToDestinationStarTimerFinishes = gameState.timeLeftUntilTravelToDestinationStarTimerFinishes ?? 0;
            currentAsteroidSearchTimerDurationTotal = gameState.currentAsteroidSearchTimerDurationTotal ?? 0;
            currentInvestigateStarTimerDurationTotal = gameState.currentInvestigateStarTimerDurationTotal ?? 0;
            currentPillageVoidTimerDurationTotal = gameState.currentPillageVoidTimerDurationTotal ?? 0;
            currentBlackHoleChargeTimerDurationTotal = gameState.currentBlackHoleChargeTimerDurationTotal ?? 0;
            asteroidArray = (gameState.asteroidArray ?? []).filter(item => item !== '') || null;
            rocketTravelDuration = gameState.rocketTravelDuration ?? {rocket1: 0, rocket2: 0, rocket3: 0, rocket4: 0};
            cosmicRipTechTimeLeftUntilResearchFinishes = gameState.cosmicRipTechTimeLeftUntilResearchFinishes ?? {};
            cosmicRipTechResearchDurations = gameState.cosmicRipTechResearchDurations ?? {};
            starTravelDuration = gameState.starTravelDuration ?? 0;
            miningObject = gameState.miningObject ?? {rocket1: null, rocket2: null, rocket3: null, rocket4: null};
            destinationAsteroid = gameState.destinationAsteroid ?? {rocket1: null, rocket2: null, rocket3: null, rocket4: null};
            rocketDirection = gameState.rocketDirection ?? {rocket1: false, rocket2: false, rocket3: false, rocket4: false};
            rocketUserName = gameState.rocketUserName ?? {rocket1: 'Rocket 1', rocket2: 'Rocket 2', rocket3: 'Rocket 3', rocket4: 'Rocket 4'};
            starVisionDistance = gameState.starVisionDistance ?? 0;
            starVisionIncrement = gameState.starVisionIncrement ?? 1;
            destinationStar = gameState.destinationStar ?? null;
            fromStarObject = gameState.fromStarObject ?? null;
            toStarObject = gameState.toStarObject ?? null;
            currentStarObject = gameState.currentStarObject ?? null;
            starShipStatus = gameState.starShipStatus ?? ['preconstruction', null];
            destinationStar = gameState.destinationStar ?? null;
            allTimeTotalHydrogen = gameState.allTimeTotalHydrogen ?? 0;
            allTimeTotalHelium = gameState.allTimeTotalHelium ?? 0;
            allTimeTotalCarbon = gameState.allTimeTotalCarbon ?? 0;
            allTimeTotalNeon = gameState.allTimeTotalNeon ?? 0;
            allTimeTotalOxygen = gameState.allTimeTotalOxygen ?? 0;
            allTimeTotalSodium = gameState.allTimeTotalSodium ?? 0;
            allTimeTotalSilicon = gameState.allTimeTotalSilicon ?? 0;
            allTimeTotalIron = gameState.allTimeTotalIron ?? 0;
            allTimeTotalDiesel = gameState.allTimeTotalDiesel ?? 0;
            allTimeTotalGlass = gameState.allTimeTotalGlass ?? 0;
            allTimeTotalSteel = gameState.allTimeTotalSteel ?? 0;
            allTimeTotalConcrete = gameState.allTimeTotalConcrete ?? 0;
            allTimeTotalWater = gameState.allTimeTotalWater ?? 0;
            allTimeTotalTitanium = gameState.allTimeTotalTitanium ?? 0;
            allTimeTotalResearchPoints = gameState.allTimeTotalResearchPoints ?? 0;
            allTimeTotalScienceKits = gameState.allTimeTotalScienceKits ?? 0;
            allTimeTotalScienceClubs = gameState.allTimeTotalScienceClubs ?? 0;
            allTimeTotalScienceLabs = gameState.allTimeTotalScienceLabs ?? 0;

            hydrogenThisRun = gameState.hydrogenThisRun ?? 0;
            heliumThisRun = gameState.heliumThisRun ?? 0;
            carbonThisRun = gameState.carbonThisRun ?? 0;
            neonThisRun = gameState.neonThisRun ?? 0;
            oxygenThisRun = gameState.oxygenThisRun ?? 0;
            sodiumThisRun = gameState.sodiumThisRun ?? 0;
            siliconThisRun = gameState.siliconThisRun ?? 0;
            ironThisRun = gameState.ironThisRun ?? 0;

            dieselThisRun = gameState.dieselThisRun ?? 0;
            glassThisRun = gameState.glassThisRun ?? 0;
            steelThisRun = gameState.steelThisRun ?? 0;
            concreteThisRun = gameState.concreteThisRun ?? 0;
            waterThisRun = gameState.waterThisRun ?? 0;
            titaniumThisRun = gameState.titaniumThisRun ?? 0;

            researchPointsThisRun = gameState.researchPointsThisRun ?? 0;
            scienceKitsThisRun = gameState.scienceKitsThisRun ?? 0;
            scienceClubsThisRun = gameState.scienceClubsThisRun ?? 0;
            scienceLabsThisRun = gameState.scienceLabsThisRun ?? 0;

            casinoPointsSpentThisRun = gameState.casinoPointsSpentThisRun ?? 0;
            casinoGame1DoubleOrNothingPlayedThisRun = gameState.casinoGame1DoubleOrNothingPlayedThisRun ?? 0;
            casinoGame1DoubleOrNothingWonThisRun = gameState.casinoGame1DoubleOrNothingWonThisRun ?? 0;
            casinoGame2WheelPlayedThisRun = gameState.casinoGame2WheelPlayedThisRun ?? 0;
            casinoGame2WheelWonThisRun = gameState.casinoGame2WheelWonThisRun ?? 0;
            casinoGame2WheelSpecialWonThisRun = gameState.casinoGame2WheelSpecialWonThisRun ?? 0;
            casinoGame3HigherLowerPlayedThisRun = gameState.casinoGame3HigherLowerPlayedThisRun ?? 0;
            casinoGame3HigherLowerWonThisRun = gameState.casinoGame3HigherLowerWonThisRun ?? 0;
            casinoGame4VoidSeerPlayedThisRun = gameState.casinoGame4VoidSeerPlayedThisRun ?? 0;
            casinoGame4VoidSeerWonThisRun = gameState.casinoGame4VoidSeerWonThisRun ?? 0;
            ripTelemetryDataEarnedThisRun = gameState.ripTelemetryDataEarnedThisRun ?? 0;
            allTimeTotalRocketsLaunched = gameState.allTimeTotalRocketsLaunched ?? 0;
            allTimeTotalStarShipsLaunched = gameState.allTimeTotalStarShipsLaunched ?? 0;
            allTimeTotalAsteroidsDiscovered = gameState.allTimeTotalAsteroidsDiscovered ?? 0;
            allTimeTotalLegendaryAsteroidsDiscovered = gameState.allTimeTotalLegendaryAsteroidsDiscovered ?? 0;

            allTimeCasinoPointsSpent = gameState.allTimeCasinoPointsSpent ?? 0;
            allTimeCasinoGame1DoubleOrNothingPlayed = gameState.allTimeCasinoGame1DoubleOrNothingPlayed ?? 0;
            allTimeCasinoGame1DoubleOrNothingWon = gameState.allTimeCasinoGame1DoubleOrNothingWon ?? 0;
            allTimeCasinoGame2WheelPlayed = gameState.allTimeCasinoGame2WheelPlayed ?? 0;
            allTimeCasinoGame2WheelWon = gameState.allTimeCasinoGame2WheelWon ?? 0;
            allTimeCasinoGame2WheelSpecialWon = gameState.allTimeCasinoGame2WheelSpecialWon ?? 0;
            allTimeCasinoGame3HigherLowerPlayed = gameState.allTimeCasinoGame3HigherLowerPlayed ?? 0;
            allTimeCasinoGame3HigherLowerWon = gameState.allTimeCasinoGame3HigherLowerWon ?? 0;
            allTimeCasinoGame4VoidSeerPlayed = gameState.allTimeCasinoGame4VoidSeerPlayed ?? 0;
            allTimeCasinoGame4VoidSeerWon = gameState.allTimeCasinoGame4VoidSeerWon ?? 0;
            allTimeRipTelemetryDataEarned = gameState.allTimeRipTelemetryDataEarned ?? 0;
            starStudyRange = gameState.allTimeTotalStarsStudied ?? 0;
            allTimeTotalAntimatterMined = gameState.allTimeTotalAntimatterMined ?? 0;
            antimatterMinedThisRun = gameState.antimatterMinedThisRun ?? 0;
            allTimeTotalApGain = gameState.allTimeTotalApGain ?? 0;
            currentRunNumber = gameState.currentRunNumber ?? 0;
            currentRunTimer = gameState.currentRunTimer ?? 0;
            totalNewsTickerPrizesCollected = gameState.totalNewsTickerPrizesCollected ?? 0;
            apAnticipatedThisRun = gameState.apAnticipatedThisRun ?? 0;
            allTimeStarShipsBuilt = gameState.allTimeStarShipsBuilt ?? 0;
            alreadySeenNewsTickerArray = gameState.alreadySeenNewsTickerArray ?? [];
            runNumber = gameState.runNumber ?? 1;
            starShipTravelDistance = gameState.starShipTravelDistance ?? 0;
            allTimesTripped = gameState.allTimesTripped ?? 0;
            timesTrippedThisRun = gameState.timesTrippedThisRun ?? 0;
            allTimeBasicPowerPlantsBuilt = gameState.allTimeBasicPowerPlantsBuilt ?? 0;
            allTimeAdvancedPowerPlantsBuilt = gameState.allTimeAdvancedPowerPlantsBuilt ?? 0;
            allTimeSolarPowerPlantsBuilt = gameState.allTimeSolarPowerPlantsBuilt ?? 0;
            allTimeSodiumIonBatteriesBuilt = gameState.allTimeSodiumIonBatteriesBuilt ?? 0;
            allTimeBattery2Built = gameState.allTimeBattery2Built ?? 0;
            allTimeBattery3Built = gameState.allTimeBattery3Built ?? 0;
            basicPowerPlantsBuiltThisRun = gameState.basicPowerPlantsBuiltThisRun ?? 0;
            advancedPowerPlantsBuiltThisRun = gameState.advancedPowerPlantsBuiltThisRun ?? 0;
            solarPowerPlantsBuiltThisRun = gameState.solarPowerPlantsBuiltThisRun ?? 0;
            sodiumIonBatteriesBuiltThisRun = gameState.sodiumIonBatteriesBuiltThisRun ?? 0;
            battery2BuiltThisRun = gameState.battery2BuiltThisRun ?? 0;
            battery3BuiltThisRun = gameState.battery3BuiltThisRun ?? 0;
            allTimeRocketsBuilt = gameState.allTimeRocketsBuilt ?? 0;
            allTimeTotalAsteroidsMined = gameState.allTimeTotalAsteroidsMined ?? 0;
            asteroidsMinedThisRun = gameState.asteroidsMinedThisRun ?? 0;
            enemyFleetPowerAtBattleStart = gameState.enemyFleetPowerAtBattleStart ?? 0;
            runStartTimeStamp = gameState.runStartTimeStamp ?? null;
            gameStartTimeStamp = gameState.gameStartTimeStamp ?? null;
            battleUnits = gameState.battleUnits ?? { player: [], enemy: [] };
            battleResolved = gameState.battleResolved ?? [false, null];
            settledStars = gameState.settledStars ?? [STARTING_STAR_SYSTEM];
            currentGalacticMarketCommission = gameState.currentGalacticMarketCommission ?? 10;
            activatedWackyNewsEffectsArray = gameState.activatedWackyNewsEffectsArray ?? [];
            collectedPrecipitationQuantityThisRun = gameState.collectedPrecipitationQuantityThisRun ?? 0;
            gameActiveCountTime = gameState.gameActiveCountTime ?? [0, 0];
            userPlatform = gameState.userPlatform ?? [null, null, null];
            hostSource = gameState.hostSource ?? null;
            multiplierPermanentResources = gameState.multiplierPermanentResources ?? 1;
            multiplierPermanentCompounds = gameState.multiplierPermanentCompounds ?? 1;
            firstAccessArray = gameState.firstAccessArray ?? [];
            feedbackGiven = gameState.feedbackGiven ?? null;
            feedbackContent = gameState.feedbackContent ?? 'Not done yet';
            philosophy = gameState.philosophy ?? null;
            repeatableTechMultipliers = gameState.repeatableTechMultipliers ?? { 1: 1, 2: 1, 3: 1, 4: 1 };
            playerStartingUnitHealth = gameState.playerStartingUnitHealth ?? 100;
            initialImpression = gameState.initialImpression ?? 35;
            rocketTravelSpeed = gameState.rocketTravelSpeed ?? 0.1;
            starShipTravelSpeed = gameState.starShipTravelSpeed ?? 360000;
            increaseStorageFactor = gameState.increaseStorageFactor ?? 2;
            additionalSystemsToSettleThisRun = gameState.additionalSystemsToSettleThisRun ?? [];
            starsWithAncientManuscripts = gameState.starsWithAncientManuscripts ?? [];
            factoryStarsArray = gameState.factoryStarsArray ?? [];
            manuscriptCluesShown = gameState.manuscriptCluesShown ?? {};
            megaStructuresInPossessionArray = (gameState.megaStructuresInPossessionArray ?? []).map(mapFactoryStarValue);
            oStarArrivalPopupsShown = (gameState.oStarArrivalPopupsShown ?? []).filter((item) => item !== '').map((n) => String(n).toLowerCase());
            oTypeMechanicActivatedForThisSave = !!gameState.oTypeMechanicActivatedForThisSave;
            miaplacidusMilestoneLevel = gameState.miaplacidusMilestoneLevel ?? 0;
            megaStructureTechsResearched = gameState.megaStructureTechsResearched ?? [];
            megastructureAntimatterAmount = gameState.megaStructureAntimatterAmount ?? 0;
            galacticPointsSpent = gameState.galacticPointsSpent ?? 0;
            
            if (gameState.compoundCreateDropdownRecipeText) {
                compoundCreateDropdownRecipeText = gameState.compoundCreateDropdownRecipeText;
            }

            autoSaveToggle = gameState.flags.autoSaveToggle ?? false;
            notificationsToggle = gameState.flags.notificationsToggle ?? true;
            customPointerEnabled = gameState.flags.customPointerEnabled ?? false;
            mouseParticleTrailEnabled = gameState.flags.mouseParticleTrailEnabled ?? true;
            weatherEffectSettingToggle = gameState.flags.weatherEffectSettingToggle ?? true;
            newsTickerSetting = gameState.flags.newsTickerSetting ?? true;
            techRenderChange = gameState.flags.techRenderChange ?? false;
            suppressUiClickSfx = gameState.flags.suppressUiClickSfx ?? false;
            losingEnergy = gameState.flags.losingEnergy ?? false;
            powerOnOff = gameState.flags.powerOnOff ?? false;
            trippedStatus = gameState.flags.trippedStatus ?? false;
            currentlySearchingAsteroid = gameState.flags.currentlySearchingAsteroid ?? false;
            currentlyInvestigatingStar = gameState.flags.currentlyInvestigatingStar ?? false;
            currentlyPillagingVoid = gameState.flags.currentlyPillagingVoid ?? false;
            telescopeReadyToSearch = gameState.flags.telescopeReadyToSearch ?? true;            
            currentlyChargingBlackHole = gameState.flags.currentlyChargingBlackHole ?? false;
            blackHoleChargeReady = gameState.flags.blackHoleChargeReady ?? false;
            blackHoleAlwaysOn = gameState.flags.blackHoleAlwaysOn ?? false;
            currentlyTravellingToAsteroid = gameState.flags.currentlyTravellingToAsteroid ?? { rocket1: false, rocket2: false, rocket3: false, rocket4: false };
            rocketReadyToTravel = gameState.flags.rocketReadyToTravel ?? { rocket1: true, rocket2: true, rocket3: true, rocket4: true };
            antimatterUnlocked = gameState.flags.antimatterUnlocked ?? false;
            canTravelToAsteroids = gameState.flags.canTravelToAsteroids ?? false;
            canFuelRockets = gameState.flags.canFuelRockets ?? false;
            backgroundAudio = gameState.flags.backgroundAudio ?? false;      
            sfx = gameState.flags.sfx ?? false;
            starShipBuilt = gameState.flags.starShipBuilt ?? false;
            starShipTravelling = gameState.flags.starShipTravelling ?? false;
            stellarScannerBuilt = gameState.flags.stellarScannerBuilt ?? false;
            destinationStarScanned = gameState.flags.destinationStarScanned ?? false;
            diplomacyPossible = gameState.flags.diplomacyPossible ?? true;
            warMode = gameState.flags.warMode ?? false;
            enemyFleetAdjustedForDiplomacy = gameState.flags.enemyFleetAdjustedForDiplomacy ?? false;
            apAwardedThisRun = gameState.flags.apAwardedThisRun ?? false;
            rebirthPossible = gameState.flags.rebirthPossible ?? false;
            liquidatedThisRun = gameState.flags.liquidatedThisRun ?? false;
            belligerentEnemyFlag = gameState.flags.belligerentEnemyFlag ?? false;
            feedbackCanBeRequested = gameState.flags.feedbackCanBeRequested ?? true;
            philosophyAbilityActive = gameState.flags.philosophyAbilityActive ?? false;
            eventsTriggeredOnce = gameState.flags.eventsTriggeredOnce ?? false;

            randomEventTriggerCountsThisRun = gameState.randomEventTriggerCountsThisRun ?? {};
            randomEventTriggerCountsAllTime = gameState.randomEventTriggerCountsAllTime ?? {};
            currentRunIsMegaStructureRun = gameState.flags.currentRunIsMegaStructureRun ?? false;
            megaStructureTabNotificationShown = gameState.flags.megaStructureTabNotificationShown ?? false;
            hasVisitedMegaStructure = gameState.flags.hasVisitedMegaStructure ?? false;
            megaStructureTabUnlocked = gameState.flags.megaStructureTabUnlocked ?? false;
            infinitePower = gameState.flags.infinitePower ?? false;
            megaStructureResourceBonus = gameState.flags.megaStructureResourceBonus ?? false;
            storageAdderBonus = gameState.flags.storageAdderBonus ?? false;
            megaStructureAssignmentMode = gameState.flags.megaStructureAssignmentMode ?? 'legacy';
            permanentAntimatterUnlock = gameState.flags.permanentAntimatterUnlock ?? false;
            nonExhaustiveResources = gameState.flags.nonExhaustiveResources ?? (ascendencyBuffs?.nonExhaustiveResources?.boughtYet > 0) ?? false;
            miaplacidusEndgameStoryShown = gameState.flags.miaplacidusEndgameStoryShown ?? false;
            galacticCasinoUnlocked = gameState.flags.galacticCasinoUnlocked ?? false;
            blackHoleNerfPatched = gameState.flags.blackHoleNerfPatched ?? false;

            selectTheme(getCurrentTheme());
            applyCustomPointerSetting();
            setLastSavedTimeStamp(gameState.timeStamp);
            offlineGains(false);

            if (warMode && getBattleResolved()[0] === false) {
                battleUnits = { player: [], enemy: [] };
            }

            
            const autoSaveToggleElement = document.getElementById('autoSaveToggle');
            const autoSaveFrequencyElement = document.getElementById('autoSaveFrequency');
            const weatherEffectSettingToggleElement = document.getElementById('weatherEffectSettingToggle');
            const newsTickerSettingToggleElement = document.getElementById('newsTickerSettingToggle');
            const backgroundAudioToggleElement = document.getElementById('backgroundAudioToggle');
            const sfxToggleElement = document.getElementById('sfxToggle');

            if (autoSaveFrequencyElement) {
                autoSaveFrequencyElement.value = getAutoSaveFrequency();
            }
            
            if (autoSaveToggleElement) {
                autoSaveToggleElement.checked = getAutoSaveToggle();
            }

            if (weatherEffectSettingToggleElement) {
                weatherEffectSettingToggleElement.checked = getWeatherEffectSetting();
            }

            if (newsTickerSettingToggleElement) {
                newsTickerSettingToggleElement.checked = getNewsTickerSetting();
            }

            if (backgroundAudioToggleElement) {
                backgroundAudioToggleElement.checked = getBackgroundAudio();
            }

            if (sfxToggleElement) {
                sfxToggleElement.checked = getSfx();
            }            

            setCurrentPrecipitationRate(0);
            stopWeatherEffect();
            setWeatherEffectOn(false);

            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

function attachAchievementFunctions(data) {
    for (const key in data) {
        if (key === 'version') continue;
        const achievement = data[key];
        if (!('specialCondition' in achievement)) {
            const fn = achievementFunctionsMap[achievement.specialConditionName];
            if (fn) {
                achievement.specialCondition = fn;
            }
        }
    }

    return data;
}

export function getHomeStarName() {
    return HOMESTAR;
}

export function getGameVisibleActive() {
    return GAME_VISIBLE_ACTIVE;
}

export function getTimerUpdateInterval() {
    return TIMER_UPDATE_INTERVAL;
}

export function getTimerRateRatio() {
    return TIMER_RATE_RATIO;
}

export function getCurrencySymbol() {
    return currencySymbol;
}

export function setCurrencySymbol(value) {
    currencySymbol = value;
}

export function getCurrentTab() {
    return currentTab;
}

export function setCurrentTab(value) {
    currentTab = value;
}

export function getNotificationsToggle() {
    return notificationsToggle;
}

export function setNotificationsToggle(value) {
    notificationsToggle = value;
}

export function getAutoSaveToggle() {
    return autoSaveToggle;
}

export function setAutoSaveToggle(value) {
    autoSaveToggle = value;
}

export function getWasAutoSaveToggled() {
    return wasAutoSaveToggled;
}

export function setWasAutoSaveToggled(value) {
    wasAutoSaveToggled = value;
}

export function getNotationType() {
    return notationType;
}

export function setNotationType(value) {
    notationType = value;
}

export function getAntimatterDeltaAccumulator() {
    return antimatterDeltaAccumulator;
}

export function setAntimatterDeltaAccumulator(value) {
    antimatterDeltaAccumulator = value;
}

export function getTimeWarpMultiplier() {
    return timeWarpMultiplier;
}

export function setTimeWarpMultiplier(value) {
    timeWarpMultiplier = (typeof value === 'number' && Number.isFinite(value) && value > 0) ? value : 1;
}

export function getTimeWarpEndTimestampMs() {
    return timeWarpEndTimestampMs;
}

export function setTimeWarpEndTimestampMs(value) {
    timeWarpEndTimestampMs = (typeof value === 'number' && Number.isFinite(value)) ? value : 0;
}

export function getTimeWarpTimeoutId() {
    return timeWarpTimeoutId;
}

export function setTimeWarpTimeoutId(value) {
    timeWarpTimeoutId = value ?? null;
}

export function getDebugTimeWarpDurationMs() {
    return debugTimeWarpDurationMs;
}

export function setDebugTimeWarpDurationMs(value) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) {
        debugTimeWarpDurationMs = parsed;
    }
}

export function getDebugTimeWarpMultiplier() {
    return debugTimeWarpMultiplier;
}

export function setDebugTimeWarpMultiplier(value) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
        debugTimeWarpMultiplier = parsed;
    }
}

export function getDebugHoldEnterToGainEnabled() {
    return debugHoldEnterToGainEnabled;
}

export function setDebugHoldEnterToGainEnabled(value) {
    debugHoldEnterToGainEnabled = Boolean(value);
}

export function getIncreaseStorageFactor() {
    return increaseStorageFactor;
}

export function setIncreaseStorageFactor(value) {
    increaseStorageFactor = value;
}

export function getCurrentOptionPane() {
    return currentOptionPane;
}

export function setCurrentOptionPane(value) {
    currentOptionPane = value.toLowerCase();
}

export function setItemsToDeduct(nameArray, amountArray, itemTypeArray, resourcePrices) {
    if (nameArray === 'clear') {
        itemsToDeduct = {};
        return;
    }

    let optionalName1 = resourcePrices[0][1];
    let optionalName2 = resourcePrices[1][1];
    let optionalName3 = resourcePrices[2][1];

    if (!itemsToDeduct[nameArray]) {
        itemsToDeduct[nameArray] = {};
    }

    if (!itemsToDeduct[optionalName1]) {
        itemsToDeduct[optionalName1] = {};
    }
    if (!itemsToDeduct[optionalName2]) {
        itemsToDeduct[optionalName2] = {};
    }
    if (!itemsToDeduct[optionalName3]) {
        itemsToDeduct[optionalName3] = {};
    }

    nameArray.forEach((name, index) => {
        itemsToDeduct[name] = {
            deductQuantity: amountArray[index],
            typeOfResourceCompound: itemTypeArray[index],
        };
    });    

    itemsToDeduct[optionalName1].deductQuantity = resourcePrices[0][0];
    itemsToDeduct[optionalName1].typeOfResourceCompound = resourcePrices[0][2];
    itemsToDeduct[optionalName1].resourceOrder = 'resource1Price';

    itemsToDeduct[optionalName2].deductQuantity = resourcePrices[1][0];
    itemsToDeduct[optionalName2].typeOfResourceCompound = resourcePrices[1][2];
    itemsToDeduct[optionalName2].resourceOrder = 'resource2Price';

    itemsToDeduct[optionalName3].deductQuantity = resourcePrices[2][0];
    itemsToDeduct[optionalName3].typeOfResourceCompound = resourcePrices[2][2];
    itemsToDeduct[optionalName3].resourceOrder = 'resource3Price';
}

export function getItemsToDeduct() {
    return itemsToDeduct;
}

export function setItemsToIncreasePrice(name, setPriceTarget, currentPrice, itemResourceOrCompound, resourcePrices) {
    if (name === 'clear') {
        itemsToIncreasePrice = {};
        return;
    }

    let optionalName1 = resourcePrices[0][1];
    let optionalName2 = resourcePrices[1][1];
    let optionalName3 = resourcePrices[2][1];

    if (!itemsToIncreasePrice[name]) {
        itemsToIncreasePrice[name] = {};
    }
    if (itemResourceOrCompound !== 'research') {
        if (!itemsToIncreasePrice[optionalName1]) {
            itemsToIncreasePrice[optionalName1] = {};
        }
        if (!itemsToIncreasePrice[optionalName2]) {
            itemsToIncreasePrice[optionalName2] = {};
        }
        if (!itemsToIncreasePrice[optionalName3]) {
            itemsToIncreasePrice[optionalName3] = {};
        }
    }

    itemsToIncreasePrice[name].currentPrice = currentPrice;
    itemsToIncreasePrice[name].setPriceTarget = setPriceTarget;
    itemsToIncreasePrice[name].typeOfResourceCompound = itemResourceOrCompound;

    if (itemResourceOrCompound !== 'research') {
        itemsToIncreasePrice[optionalName1].currentPrice = resourcePrices[0][0];
        itemsToIncreasePrice[optionalName1].setPriceTarget = setPriceTarget;
        itemsToIncreasePrice[optionalName1].typeOfResourceCompound = resourcePrices[0][2];
        itemsToIncreasePrice[optionalName1].resourceOrder = 'resource1Price';
        
        itemsToIncreasePrice[optionalName2].currentPrice = resourcePrices[1][0];
        itemsToIncreasePrice[optionalName2].setPriceTarget = setPriceTarget;
        itemsToIncreasePrice[optionalName2].typeOfResourceCompound = resourcePrices[1][2];
        itemsToIncreasePrice[optionalName2].resourceOrder = 'resource2Price';
        
        itemsToIncreasePrice[optionalName3].currentPrice = resourcePrices[2][0];
        itemsToIncreasePrice[optionalName3].setPriceTarget = setPriceTarget;
        itemsToIncreasePrice[optionalName3].typeOfResourceCompound = resourcePrices[2][2];
        itemsToIncreasePrice[optionalName3].resourceOrder = 'resource3Price';
    }
}

export function getItemsToIncreasePrice() {
    return itemsToIncreasePrice;
}

export function setSaleResourcePreview(resource, amount, fusionTo1, fusionTo2) {
    const resourceQuantity = getResourceDataObject('resources', [resource, 'quantity']);

    let calculatedAmount;

    switch (amount) {
        case 'All Stock':
            calculatedAmount = Math.floor(resourceQuantity);
            break;
        case '75% Stock':
            calculatedAmount = Math.floor(resourceQuantity * 0.75);
            break;
        case '67% Stock':
            calculatedAmount = Math.floor(resourceQuantity * 2 / 3);
            break;
        case '50% Stock':
            calculatedAmount = Math.floor(resourceQuantity * 0.5);
            break;
        case '33% Stock':
            calculatedAmount = Math.floor(resourceQuantity / 3);
            break;
        case '100000':
            calculatedAmount = Math.min(100000, resourceQuantity);
            break;
        case '10000':
            calculatedAmount = Math.min(10000, resourceQuantity);
            break;
        case '1000':
            calculatedAmount = Math.min(1000, resourceQuantity);
            break;
        case '100':
            calculatedAmount = Math.min(100, resourceQuantity);
            break;
        case '10':
            calculatedAmount = Math.min(10, resourceQuantity);
            break;
        case '1':
            calculatedAmount = Math.min(1, resourceQuantity);
            break;
        default:
            calculatedAmount = 0;
            break;
    }
    setResourceSalePreview(resource, calculatedAmount, fusionTo1, fusionTo2);
}

export function setSaleCompoundPreview(compound, amount) {
    const compoundQuantity = getResourceDataObject('compounds', [compound, 'quantity']);

    let calculatedAmount;

    switch (amount) {
        case 'All Stock':
            calculatedAmount = Math.floor(compoundQuantity);
            break;
        case '75% Stock':
            calculatedAmount = Math.floor(compoundQuantity * 0.75);
            break;
        case '67% Stock':
            calculatedAmount = Math.floor(compoundQuantity * 2 / 3);
            break;
        case '50% Stock':
            calculatedAmount = Math.floor(compoundQuantity * 0.5);
            break;
        case '33% Stock':
            calculatedAmount = Math.floor(compoundQuantity / 3);
            break;
        case '100000':
            calculatedAmount = Math.min(100000, compoundQuantity);
            break;
        case '10000':
            calculatedAmount = Math.min(10000, compoundQuantity);
            break;
        case '1000':
            calculatedAmount = Math.min(1000, compoundQuantity);
            break;
        case '100':
            calculatedAmount = Math.min(100, compoundQuantity);
            break;
        case '10':
            calculatedAmount = Math.min(10, compoundQuantity);
            break;
        case '1':
            calculatedAmount = Math.min(1, compoundQuantity);
            break;
        default:
            calculatedAmount = 0;
            break;
    }
    setCompoundSalePreview(compound, calculatedAmount);
}

export function setCreateCompoundPreview(compoundToCreate, dropDownString) {
    let amount = /^[A-Za-z]/.test(dropDownString) 
    ? dropDownString 
    : dropDownString.split(" ")[0];
    
    const type1 = getResourceDataObject('compounds', [compoundToCreate, 'createsFrom1'])[1];
    const type2 = getResourceDataObject('compounds', [compoundToCreate, 'createsFrom2'])[1];
    const type3 = getResourceDataObject('compounds', [compoundToCreate, 'createsFrom3'])[1];
    const type4 = getResourceDataObject('compounds', [compoundToCreate, 'createsFrom4'])[1];

    const constituentParts1 = getResourceDataObject('compounds', [compoundToCreate, 'createsFrom1'])[0];
    const constituentParts2 = getResourceDataObject('compounds', [compoundToCreate, 'createsFrom2'])[0];
    const constituentParts3 = getResourceDataObject('compounds', [compoundToCreate, 'createsFrom3'])[0];
    const constituentParts4 = getResourceDataObject('compounds', [compoundToCreate, 'createsFrom4'])[0];

    const constituentPartsRatio1 = Math.max(0, Math.round(getResourceDataObject('compounds', [compoundToCreate, 'createsFromRatio1']) || 0));
    const constituentPartsRatio2 = Math.max(0, Math.round(getResourceDataObject('compounds', [compoundToCreate, 'createsFromRatio2']) || 0));
    const constituentPartsRatio3 = Math.max(0, Math.round(getResourceDataObject('compounds', [compoundToCreate, 'createsFromRatio3']) || 0));
    const constituentPartsRatio4 = Math.max(0, Math.round(getResourceDataObject('compounds', [compoundToCreate, 'createsFromRatio4']) || 0));

    const constituentParts1Quantity = type1 ? getResourceDataObject(type1, [constituentParts1, 'quantity']) || 0 : 0;
    const constituentParts2Quantity = type2 ? getResourceDataObject(type2, [constituentParts2, 'quantity']) || 0 : 0;
    const constituentParts3Quantity = type3 ? getResourceDataObject(type3, [constituentParts3, 'quantity']) || 0 : 0;
    const constituentParts4Quantity = type4 ? getResourceDataObject(type4, [constituentParts4, 'quantity']) || 0 : 0;

    const maxConstituentParts1 = constituentPartsRatio1 > 0 ? Math.floor(constituentParts1Quantity / constituentPartsRatio1) : Infinity;
    const maxConstituentParts2 = constituentPartsRatio2 > 0 ? Math.floor(constituentParts2Quantity / constituentPartsRatio2) : Infinity;
    const maxConstituentParts3 = constituentPartsRatio3 > 0 ? Math.floor(constituentParts3Quantity / constituentPartsRatio3) : Infinity;
    const maxConstituentParts4 = constituentPartsRatio4 > 0 ? Math.floor(constituentParts4Quantity / constituentPartsRatio4) : Infinity;

    const maxCompoundToCreate = Math.min(maxConstituentParts1, maxConstituentParts2, maxConstituentParts3, maxConstituentParts4);

    let createAmount;
    let constituentPartsQuantityNeeded1 = 0;
    let constituentPartsQuantityNeeded2 = 0;
    let constituentPartsQuantityNeeded3 = 0;
    let constituentPartsQuantityNeeded4 = 0;

    const currentQuantity = getResourceDataObject('compounds', [compoundToCreate, 'quantity']) || 0;
    const storageCapacity = getResourceDataObject('compounds', [compoundToCreate, 'storageCapacity']) || 0;
    const availableStorage = Math.max(storageCapacity - currentQuantity, 0);

    switch (amount) {
        case 'Fill To Capacity':
            createAmount = Math.min(maxCompoundToCreate, availableStorage);
            constituentPartsQuantityNeeded1 = Math.round(createAmount * constituentPartsRatio1);
            constituentPartsQuantityNeeded2 = Math.round(createAmount * constituentPartsRatio2);
            constituentPartsQuantityNeeded3 = Math.round(createAmount * constituentPartsRatio3);
            constituentPartsQuantityNeeded4 = Math.round(createAmount * constituentPartsRatio4);
            break;
        case 'Max Possible':
            createAmount = Math.floor(maxCompoundToCreate * 1);
            constituentPartsQuantityNeeded1 = Math.round(createAmount * constituentPartsRatio1);
            constituentPartsQuantityNeeded2 = Math.round(createAmount * constituentPartsRatio2);
            constituentPartsQuantityNeeded3 = Math.round(createAmount * constituentPartsRatio3);
            constituentPartsQuantityNeeded4 = Math.round(createAmount * constituentPartsRatio4);
            break;
        case 'Up to 75%':
            createAmount = Math.floor(maxCompoundToCreate * 0.75);
            constituentPartsQuantityNeeded1 = Math.round(createAmount * constituentPartsRatio1);
            constituentPartsQuantityNeeded2 = Math.round(createAmount * constituentPartsRatio2);
            constituentPartsQuantityNeeded3 = Math.round(createAmount * constituentPartsRatio3);
            constituentPartsQuantityNeeded4 = Math.round(createAmount * constituentPartsRatio4);
            break;
        case 'Up to 67%':
            createAmount = Math.floor(maxCompoundToCreate * (2 / 3));
            constituentPartsQuantityNeeded1 = Math.round(createAmount * constituentPartsRatio1);
            constituentPartsQuantityNeeded2 = Math.round(createAmount * constituentPartsRatio2);
            constituentPartsQuantityNeeded3 = Math.round(createAmount * constituentPartsRatio3);
            constituentPartsQuantityNeeded4 = Math.round(createAmount * constituentPartsRatio4);
            break;
        case 'Up to 50%':
            createAmount = Math.floor(maxCompoundToCreate * 0.5);
            constituentPartsQuantityNeeded1 = Math.round(createAmount * constituentPartsRatio1);
            constituentPartsQuantityNeeded2 = Math.round(createAmount * constituentPartsRatio2);
            constituentPartsQuantityNeeded3 = Math.round(createAmount * constituentPartsRatio3);
            constituentPartsQuantityNeeded4 = Math.round(createAmount * constituentPartsRatio4);
            break;
        case 'Up to 33%':
            createAmount = Math.floor(maxCompoundToCreate * (1 / 3));
            constituentPartsQuantityNeeded1 = Math.round(createAmount * constituentPartsRatio1);
            constituentPartsQuantityNeeded2 = Math.round(createAmount * constituentPartsRatio2);
            constituentPartsQuantityNeeded3 = Math.round(createAmount * constituentPartsRatio3);
            constituentPartsQuantityNeeded4 = Math.round(createAmount * constituentPartsRatio4);
            break;
        case '50000':
            createAmount = Math.min(maxCompoundToCreate, 50000);
            constituentPartsQuantityNeeded1 = Math.round(createAmount * constituentPartsRatio1);
            constituentPartsQuantityNeeded2 = Math.round(createAmount * constituentPartsRatio2);
            constituentPartsQuantityNeeded3 = Math.round(createAmount * constituentPartsRatio3);
            constituentPartsQuantityNeeded4 = Math.round(createAmount * constituentPartsRatio4);
            break;
        case '5000':
            createAmount = Math.min(maxCompoundToCreate, 5000);
            constituentPartsQuantityNeeded1 = Math.round(createAmount * constituentPartsRatio1);
            constituentPartsQuantityNeeded2 = Math.round(createAmount * constituentPartsRatio2);
            constituentPartsQuantityNeeded3 = Math.round(createAmount * constituentPartsRatio3);
            constituentPartsQuantityNeeded4 = Math.round(createAmount * constituentPartsRatio4);
            break;
        case '500':
            createAmount = Math.min(maxCompoundToCreate, 500);
            constituentPartsQuantityNeeded1 = Math.round(createAmount * constituentPartsRatio1);
            constituentPartsQuantityNeeded2 = Math.round(createAmount * constituentPartsRatio2);
            constituentPartsQuantityNeeded3 = Math.round(createAmount * constituentPartsRatio3);
            constituentPartsQuantityNeeded4 = Math.round(createAmount * constituentPartsRatio4);
            break;
        case '50':
            createAmount = Math.min(maxCompoundToCreate, 50);
            constituentPartsQuantityNeeded1 = Math.round(createAmount * constituentPartsRatio1);
            constituentPartsQuantityNeeded2 = Math.round(createAmount * constituentPartsRatio2);
            constituentPartsQuantityNeeded3 = Math.round(createAmount * constituentPartsRatio3);
            constituentPartsQuantityNeeded4 = Math.round(createAmount * constituentPartsRatio4);
            break;
        case '5':
            createAmount = Math.min(maxCompoundToCreate, 5);
            constituentPartsQuantityNeeded1 = Math.round(createAmount * constituentPartsRatio1);
            constituentPartsQuantityNeeded2 = Math.round(createAmount * constituentPartsRatio2);
            constituentPartsQuantityNeeded3 = Math.round(createAmount * constituentPartsRatio3);
            constituentPartsQuantityNeeded4 = Math.round(createAmount * constituentPartsRatio4);
            break;
        case '1':
            createAmount = Math.min(maxCompoundToCreate, 1);
            constituentPartsQuantityNeeded1 = Math.round(createAmount * constituentPartsRatio1);
            constituentPartsQuantityNeeded2 = Math.round(createAmount * constituentPartsRatio2);
            constituentPartsQuantityNeeded3 = Math.round(createAmount * constituentPartsRatio3);
            constituentPartsQuantityNeeded4 = Math.round(createAmount * constituentPartsRatio4);
            break;
        default:
            createAmount = 0;
            break;
    }

    setCompoundCreatePreview(compoundToCreate, createAmount, 
        constituentPartsQuantityNeeded1, 
        constituentPartsQuantityNeeded2, 
        constituentPartsQuantityNeeded3, 
        constituentPartsQuantityNeeded4);
}

export function setCompoundCreatePreview(compoundToCreate, createAmount, amountConstituentPart1, amountConstituentPart2, amountConstituentPart3, amountConstituentPart4) {
    const compoundToCreateCapitalised = getResourceDataObject('compounds', [compoundToCreate, 'nameResource']);
    const compoundToCreateQuantity = getResourceDataObject('compounds', [compoundToCreate, 'quantity']);
    const compoundToCreateStorage = getResourceDataObject('compounds', [compoundToCreate, 'storageCapacity']);
    
    const constituentPartString1 = capitaliseString(getResourceDataObject('compounds', [compoundToCreate, 'createsFrom1'])[0]);
    const constituentPartString2 = capitaliseString(getResourceDataObject('compounds', [compoundToCreate, 'createsFrom2'])[0]);
    const constituentPartString3 = capitaliseString(getResourceDataObject('compounds', [compoundToCreate, 'createsFrom3'])[0]);
    const constituentPartString4 = capitaliseString(getResourceDataObject('compounds', [compoundToCreate, 'createsFrom4'])[0]);
    
    let constituentParts = [];
    
    if (amountConstituentPart1 > 0) {
        constituentParts.push(`${Math.round(amountConstituentPart1)} ${constituentPartString1}`);
    }
    if (amountConstituentPart2 > 0) {
        constituentParts.push(`${Math.round(amountConstituentPart2)} ${constituentPartString2}`);
    }
    if (amountConstituentPart3 > 0) {
        constituentParts.push(`${Math.round(amountConstituentPart3)} ${constituentPartString3}`);
    }
    if (amountConstituentPart4 > 0) {
        constituentParts.push(`${Math.round(amountConstituentPart4)} ${constituentPartString4}`);
    }
    
    const suffix = (compoundToCreateQuantity + createAmount > compoundToCreateStorage) ? '!' : '';
    const partsString = constituentParts.join(', ');

    createCompoundPreviews[compoundToCreate] =
        `${createAmount} ${compoundToCreateCapitalised} (${partsString}${suffix})`;
}

export function setResourceSalePreview(resource, value, fuseToResource1, fuseToResource2) {
    let fusionFlag = false;
    let tooManyToStore1 = 0;
    let tooManyToStore2 = 0;
    let suffixFusion = '';

    const resourceCapitalised = getResourceDataObject('resources', [resource, 'nameResource']);
    const resourceQuantity = getResourceDataObject('resources', [resource, 'quantity']);
    const resourceSaleValueFactor = getResourceDataObject('resources', [resource, 'saleValue']);

    if (getTechUnlockedArray().includes(getResourceDataObject('resources', [resource, 'canFuseTech']))) {
        const fuseToCapitalised1 = getResourceDataObject('resources', [fuseToResource1, 'nameResource']);
        const fuseToQuantity1 = getResourceDataObject('resources', [fuseToResource1, 'quantity']);
        const fuseToStorage1 = getResourceDataObject('resources', [fuseToResource1, 'storageCapacity']);
        const fuseToRatio1 = getResourceDataObject('resources', [resource, 'fuseToRatio1']);

        fusionFlag = true;
        
        if (Math.floor(value * fuseToRatio1) > fuseToStorage1 - fuseToQuantity1) {
            tooManyToStore1 = 1;
        }
        if (fuseToStorage1 === fuseToQuantity1) {
            tooManyToStore1 = 2;
        }

        const quantityToAddFuseTo1 = Math.min(
            Math.floor(value * fuseToRatio1),
            Math.floor(fuseToStorage1 - fuseToQuantity1)
        );

        let quantityToAddFuseTo2 = 0;
        let fuseToCapitalised2 = '';

        if (fuseToResource2 !== '' && fuseToResource2 !== undefined) {
            fuseToCapitalised2 = getResourceDataObject('resources', [fuseToResource2, 'nameResource']);
            const fuseToQuantity2 = getResourceDataObject('resources', [fuseToResource2, 'quantity']);
            const fuseToStorage2 = getResourceDataObject('resources', [fuseToResource2, 'storageCapacity']);
            const fuseToRatio2 = getResourceDataObject('resources', [resource, 'fuseToRatio2']);
    
            if (Math.floor(value * fuseToRatio2) > fuseToStorage2 - fuseToQuantity2) {
                tooManyToStore2 = 1;
            }
            if (fuseToStorage2 === fuseToQuantity2) {
                tooManyToStore2 = 2;
            }
    
            quantityToAddFuseTo2 = Math.min(
                Math.floor(value * fuseToRatio2),
                Math.floor(fuseToStorage2 - fuseToQuantity2)
            );
        }

        const suffix =
        tooManyToStore1 === 0 && tooManyToStore2 === 0 ? '' :
        tooManyToStore1 > 0 || tooManyToStore2 > 0 ? '!' :
        tooManyToStore1 === 1 || tooManyToStore2 === 1 ? '!' :
        tooManyToStore1 === 2 || tooManyToStore2 === 2 ? '!!' :
        '';    
        
        suffixFusion = ` -> ${quantityToAddFuseTo1} ${fuseToCapitalised1}, ${quantityToAddFuseTo2} ${fuseToCapitalised2}${suffix}`;

        if (!getUnlockedResourcesArray().includes(fuseToResource1) && !getUnlockedResourcesArray().includes(fuseToResource2)) {
            suffixFusion = '';
        }
    }

    if (getCurrencySymbol() !== "€") {
        if (value <= resourceQuantity) {
            saleResourcePreviews[resource] =
                `<span class="green-ready-text notation sell-fuse-money">${getCurrencySymbol()}${(value * resourceSaleValueFactor).toFixed(2)}</span>` +
                ' (' +
                value + ' ' + resourceCapitalised + (fusionFlag ? suffixFusion : '') + ')';
        } else {
            saleResourcePreviews[resource] =
                `<span class="green-ready-text notation sell-fuse-money">${getCurrencySymbol()}${(resourceQuantity * resourceSaleValueFactor).toFixed(2)}</span>` +
                ' (' +
                resourceQuantity + ' ' + resourceCapitalised + (fusionFlag ? suffixFusion : '') + ')';
        }
    } else {
        if (value <= resourceQuantity) {
            saleResourcePreviews[resource] =
                `<span class="green-ready-text notation sell-fuse-money">${(value * resourceSaleValueFactor).toFixed(2)}${getCurrencySymbol()}</span>` +
                ' (' +
                value + ' ' + resourceCapitalised + (fusionFlag ? suffixFusion : '') + ')';
        } else {
            saleResourcePreviews[resource] =
                `<span class="green-ready-text notation sell-fuse-money">${(resourceQuantity * resourceSaleValueFactor).toFixed(2)}${getCurrencySymbol()}</span>` +
                ' (' +
                resourceQuantity + ' ' + resourceCapitalised + (fusionFlag ? suffixFusion : '') + ')';
        }
    } 
}

export function setCompoundSalePreview(compound, value) {
    const compoundCapitalised = getResourceDataObject('compounds', [compound, 'nameResource']);
    const compoundQuantity = getResourceDataObject('compounds', [compound, 'quantity']);
    const compoundSaleValueFactor = getResourceDataObject('compounds', [compound, 'saleValue']);

    if (getCurrencySymbol() !== "€") {
        if (value <= compoundQuantity) {
            saleCompoundPreviews[compound] =
                `<span class="green-ready-text notation sell-fuse-money">${getCurrencySymbol()}${(value * compoundSaleValueFactor).toFixed(2)}</span>` +
                ' (' +
                value + ' ' + compoundCapitalised + ')';
        } else {
            saleCompoundPreviews[compound] =
                `<span class="green-ready-text notation sell-fuse-money">${getCurrencySymbol()}${(compoundQuantity * compoundSaleValueFactor).toFixed(2)}</span>` +
                ' (' +
                compoundQuantity + ' ' + compoundCapitalised + ')';
        }
    } else {
        if (value <= compoundQuantity) {
            saleCompoundPreviews[compound] =
                `<span class="green-ready-text notation sell-fuse-money">${(value * compoundSaleValueFactor).toFixed(2)}${getCurrencySymbol()}</span>` +
                ' (' +
                value + ' ' + compoundCapitalised + ')';
        } else {
            saleCompoundPreviews[compound] =
                `<span class="green-ready-text notation sell-fuse-money">${(compoundQuantity * compoundSaleValueFactor).toFixed(2)}${getCurrencySymbol()}</span>` +
                ' (' +
                compoundQuantity + ' ' + compoundCapitalised + ')';
        }
    } 
}

export function getOfflineGainsRate() {
    return OFFLINE_GAINS_RATE;
}

export function getCompoundCreatePreview(key) {
    return createCompoundPreviews[key];
}

export function getResourceSalePreview(key) {
    return saleResourcePreviews[key];
}

export function getCompoundSalePreview(key) {
    return saleCompoundPreviews[key];
}

export function getLastScreenOpenRegister(key) {
    return lastScreenOpenRegister[key];
}

export function setLastScreenOpenRegister(key, value) {
    lastScreenOpenRegister[key] = value;
}

export function getDebugVisibilityArray() {
    return debugVisibilityArray;
}

export function getTechUnlockedArray() {
    return techUnlockedArray;
}

export function setTechUnlockedArrayDirect(value) {
    techUnlockedArray = Array.isArray(value) ? value : techUnlockedArray;
}

export function setTechUnlockedArray(value, direct = false) {
    if (value === 'run1' && techUnlockedArray.length === 1 && techUnlockedArray[0] === 'apAwardedThisRun' && value !== 'compoundMachining') {
        techUnlockedArray = [];
        return;
    }

    if (value === 'run1') {
        return;
    }

    if (direct) {
        techUnlockedArray = Array.isArray(value) ? value : techUnlockedArray;
    } else {
        techUnlockedArray.unshift(value);
    }
}


export function getRevealedTechArray() {
    return revealedTechArray;
}

export function setRevealedTechArray(value) {
    revealedTechArray.unshift(value);
}

export function getRevealedCosmicRipTechArray() {
    return revealedCosmicRipTechArray;
}

export function setRevealedCosmicRipTechArray(value) {
    revealedCosmicRipTechArray.unshift(value);
}

export function getCosmicRipTechUnlockedArray() {
    return cosmicRipTechUnlockedArray;
}

export function setCosmicRipTechUnlockedArray(value, direct = false) {
    if (direct) {
        cosmicRipTechUnlockedArray = Array.isArray(value) ? value : cosmicRipTechUnlockedArray;
    } else {
        cosmicRipTechUnlockedArray.unshift(value);
    }
}

export function getUpcomingTechArray() {
    return upcomingTechArray;
}

export function setUpcomingTechArray(value) {
    upcomingTechArray.unshift(value);
}

export function getUnlockedResourcesArray() {
    return unlockedResourcesArray;
}

export function setUnlockedResourcesArray(value) {
    unlockedResourcesArray.unshift(value);
}

export function getUnlockedCompoundsArray() {
    return unlockedCompoundsArray;
}

export function setUnlockedCompoundsArray(value) {
    unlockedCompoundsArray.unshift(value);
}

export function getOriginalFrameNumbers() {
    return originalFrameNumbers;
}

export function setOriginalFrameNumbers(value) {
    originalFrameNumbers = value;
}

export function getBlackHoleDiscovered() {
    return blackHoleDiscovered;
}

export function setBlackHoleDiscovered(value) {
    blackHoleDiscovered = Boolean(value);
}

export function getBlackHoleDiscoveryProbability() {
    return blackHoleDiscoveryProbability;
}

export function setBlackHoleDiscoveryProbability(value) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) {
        blackHoleDiscoveryProbability = Math.min(100, parsed);
    }
}

export function getTemporaryCoreTechRowsRepo(key) {
    if (!temporaryCoreTechRowsRepo || typeof temporaryCoreTechRowsRepo !== 'object') {
        if (key === 'rows') return [];
        return null;
    }

    const value = temporaryCoreTechRowsRepo[key];
    if (key === 'rows') {
        return Array.isArray(value) ? value : [];
    }
    return value ?? null;
}

export function setTemporaryCoreTechRowsRepo(containerValue, rowsValue) {
    if (!temporaryCoreTechRowsRepo) {
        temporaryCoreTechRowsRepo = {};
    }
    if (containerValue !== 'noChange') {
        temporaryCoreTechRowsRepo.container = containerValue;
    }
    
    temporaryCoreTechRowsRepo.rows = rowsValue;
}

export function getCanAffordDeferred() {
    return canAffordDeferred;
}

export function setCanAffordDeferred(value) {
    canAffordDeferred = value;
}

export function getTempRowValue() {
    return tempRowValue;
}

export function setTempRowValue(value) {
    tempRowValue = value;
}

export function getTechRenderChange() {
    return techRenderChange;
}

export function setTechRenderChange(value) {
    techRenderChange = value;
}

export function getSuppressUiClickSfx() {
    return suppressUiClickSfx;
}

export function setSuppressUiClickSfx(value) {
    suppressUiClickSfx = value;
}

export function getTechRenderCounter() {
    return techRenderCounter;
}

export function setTechRenderCounter(value) {
    techRenderCounter = value;
}

export function getBuildingTypes() {
    return BUILDING_TYPES;
}

export function setTotalEnergyUse(value) {
    setResourceDataObject(value, 'buildings', ['energy', 'consumption']);
}

export function getTotalEnergyUse() {
    return getResourceDataObject('buildings', ['energy', 'consumption']);
}

export function setLosingEnergy(value) {
    losingEnergy = value;
}

export function getLosingEnergy() {
    return losingEnergy;
}

export function setPowerOnOff(value) {
    if (!getInfinitePower()) {
        powerOnOff = value;
    } else {
        powerOnOff = true;
    }

    if (!value) { //if power cuts off set all buttons to Activate mode ie deactivated.
        setPowerGracePeriodEnd(0);
        const powerBuildings = getResourceDataObject('buildings', ['energy', 'upgrades']);

        Object.keys(powerBuildings).forEach(powerBuilding => {
            if (powerBuilding.startsWith('power')) {
                const powerBuildingToggleButtonId = powerBuilding + 'Toggle';
                if (document.getElementById(powerBuildingToggleButtonId)) {
                    setBuildingTypeOnOff(powerBuilding, false);
                    document.getElementById(powerBuildingToggleButtonId).textContent = 'Activate';
                }
            }
        });
    }
}

export function getPowerOnOff() {
    return powerOnOff;
}

export function setConstituentPartsObject(value) {
    constituentPartsObject = value;
}

export function getConstituentPartsObject() {
    return constituentPartsObject;
}

export function getActivatedFuelBurnObject(fuelType) {
    return activatedFuelBurnObject[fuelType];
}

export function setActivatedFuelBurnObject(fuelType, value) {
    activatedFuelBurnObject[fuelType] = value;
}

export function getBuildingTypeOnOff(building) {
    return buildingTypeOnOff[building];
}

export function setBuildingTypeOnOff(building, value) {
    if (value) {
        setTrippedStatus(false);
    }

    const now = Date.now();
    if (value && !getInfinitePower()) {
        setPowerGracePeriodEnd(now + POWER_GRACE_PERIOD_MS);
    } else if (!value && !getInfinitePower() && buildingTypeOnOff[building]) {
        const anyOtherActive = Object.entries(buildingTypeOnOff).some(([key, active]) => {
            if (key === building) return false;
            return active;
        });
        if (!anyOtherActive) {
            setPowerGracePeriodEnd(0);
        }
    }

    const graceActive = isPowerGracePeriodActive(now);

    const powerPlant1PurchasedRate = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'purchasedRate']);
    const powerPlant2PurchasedRate = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'purchasedRate']);
    const powerPlant3PurchasedRate = getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'purchasedRate']);
    
    const buildingActivationStates = {
        powerPlant1: building === 'powerPlant1' ? value : buildingTypeOnOff['powerPlant1'],
        powerPlant2: building === 'powerPlant2' ? value : buildingTypeOnOff['powerPlant2'],
        powerPlant3: building === 'powerPlant3' ? value : buildingTypeOnOff['powerPlant3'],
    };

    const totalActiveRate =
        (buildingActivationStates.powerPlant1 ? powerPlant1PurchasedRate : 0) +
        (buildingActivationStates.powerPlant2 ? powerPlant2PurchasedRate : 0) +
        (buildingActivationStates.powerPlant3 ? powerPlant3PurchasedRate : 0);

    const batteryBought = getResourceDataObject('buildings', ['energy', 'batteryBoughtYet']);
    const energyConsumption = getResourceDataObject('buildings', ['energy', 'consumption']);
    const energyQuantity = getResourceDataObject('buildings', ['energy', 'quantity']);
    
    if (
        !graceActive &&
        (
            (!getInfinitePower() && !batteryBought && energyConsumption > totalActiveRate) ||
            (batteryBought && energyQuantity === 0 && energyConsumption > totalActiveRate)
        )
    ) {
        setTrippedStatus(true);
        setAchievementFlagArray('tripPower', 'add');
    }

    buildingTypeOnOff[building] = value;
}

export function getRanOutOfFuelWhenOn(building) {
    return ranOutOfFuelWhenOn[building];
}

export function setRanOutOfFuelWhenOn(building, value) {
    ranOutOfFuelWhenOn[building] = value;
}

export function getTrippedStatus() {
    return trippedStatus;
}

export function setTrippedStatus(value) {
    trippedStatus = value;
}

export function getPowerGracePeriodEnd() {
    return powerGracePeriodEnd;
}

export function setPowerGracePeriodEnd(value) {
    powerGracePeriodEnd = value;
}

export function getLastFocusOfflineGainsAppliedAt() {
    return lastFocusOfflineGainsAppliedAt;
}

export function setLastFocusOfflineGainsAppliedAt(value) {
    lastFocusOfflineGainsAppliedAt = value;
}

export function isPowerGracePeriodActive(referenceTime = Date.now()) {
    if (!powerGracePeriodEnd) {
        return false;
    }
    if (getInfinitePower()) {
        return false;
    }
    return referenceTime < powerGracePeriodEnd;
}

export function getCurrentStarSystem() {
    return currentStarSystem;
}

export function setCurrentStarSystem(value) {
    currentStarSystem = typeof value === 'string' ? value.toLowerCase() : value;
}

export function getStartingStarSystem() {
    return STARTING_STAR_SYSTEM;
}

export function setBackgroundAudio(value) {
    backgroundAudio = value ?? false;
}

export function getBackgroundAudio() {
    return backgroundAudio;
}

export function getSfx() {
    return sfx;
}

export function setSfx(value) {
    sfx = value ?? false;
}

export function getCurrentStarSystemWeatherEfficiency() {
    return currentStarSystemWeatherEfficiency;
}

export function setCurrentStarSystemWeatherEfficiency(value) {
    currentStarSystemWeatherEfficiency = value;
}

export function getCurrentPrecipitationRate() {
    return currentPrecipitationRate;
}

export function setCurrentPrecipitationRate(value) {
    currentPrecipitationRate = value;
}

export function getSaveData() {
    return saveData;
}

export function setSaveData(value) {
    saveData = value;
}

export function getAutoSaveFrequency() {
    return autoSaveFrequency;
}

export function setAutoSaveFrequency(value) {
    autoSaveFrequency = value;
}

export function getCurrentTheme() {
    return currentTheme;
}

export function setCurrentTheme(value) {
    currentTheme = value;
}

export function setThemesTriedArray(themeKey, action) {
    if (action === 'add' && typeof themeKey === 'string' && themeKey.length) {
        if (!themesTriedArray.includes(themeKey)) {
            themesTriedArray.push(themeKey);
        }
    } else if (action === 'remove' && typeof themeKey === 'string' && themeKey.length) {
        themesTriedArray = themesTriedArray.filter(t => t !== themeKey);
    } else if (action === 'empty') {
        themesTriedArray = [];
    }
}

export function getThemesTriedArray() {
    return themesTriedArray;
}

export function getLastSavedTimeStamp() {
    return lastSavedTimeStamp;
}

export function setLastSavedTimeStamp(value) {
    lastSavedTimeStamp = value;
}

export function getSaveName() {
    return saveName;
}

export function setSaveName(value) {
    saveName = value;
}

export function getSavedYetSinceOpeningSaveDialogue() {
    return savedYetSinceOpeningSaveDialogue;
}

export function setSavedYetSinceOpeningSaveDialogue(value) {
    savedYetSinceOpeningSaveDialogue = value;
}

export function getSaveExportCloudFlag() {
    return saveExportCloudFlag;
}

export function setSaveExportCloudFlag(value) {
    saveExportCloudFlag = value;
}

export async function getTechTreeDataAndDraw() {
    let techData = getResourceDataObject('techs');
    const unlockedTechs = getTechUnlockedArray();
    const upcomingTechs = getUpcomingTechArray();

    techData = Object.fromEntries(
        Object.entries(techData).filter(([key]) => 
            unlockedTechs.includes(key) || upcomingTechs.includes(key)
        )
    );

    if (getCurrentRunIsMegaStructureRun()) {
        const systemMegaStructure = getStarSystemDataObject('stars', [getCurrentStarSystem(), 'factoryStar']);
        
        techData = Object.fromEntries(
            Object.entries(techData).filter(([key, tech]) => {
                if (tech.special === 'megastructure') {
                    const techName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    //console.log(techName, systemMegaStructure);
                    return techName.includes(systemMegaStructure);
                }
                return true;
            })
        );
    } else {
        techData = Object.fromEntries(
            Object.entries(techData).filter(([key, tech]) => tech.special !== 'megastructure')
        );
    }

    drawNativeTechTree(techData, '#techTreeNative');
}

export function getOneOffPrizesAlreadyClaimedArray() {
    return oneOffPrizesAlreadyClaimedArray;
}

export function setOneOffPrizesAlreadyClaimedArray(value) {
    oneOffPrizesAlreadyClaimedArray.unshift(value);
}

export function getNewsTickerScrollDuration() {
    return NEWS_TICKER_SCROLL_DURATION;
}

export function getNewsTickerManuscriptClueChance() {
    return NEWS_TICKER_MANUSCRIPT_CLUE_CHANCE;
}

export function setWeatherEffectSetting(value) {
    weatherEffectSettingToggle = value;
    if (!value) {
        stopWeatherEffect();
        setWeatherEffectOn(false);
    }

    if (value && getCurrentStarSystemWeatherEfficiency()[2] === 'rain') {
        startWeatherEffect('rain');
        setWeatherEffectOn(true);
    }

    if (value && getCurrentStarSystemWeatherEfficiency()[2] === 'volcano') {
        startWeatherEffect('volcano');
        setWeatherEffectOn(true);
    }
}

export function getWeatherEffectSetting() {
    return weatherEffectSettingToggle;
}

export function setWeatherEffectOn(value) {
    weatherEffectOn = value;
}

export function getWeatherEffectOn() {
    return weatherEffectOn;
}

export function setNewsTickerSetting(value) {
    newsTickerSetting = value;
    startNewsTickerTimer();
    
    if (!value) {
        document.getElementById('newsTickerContainer').classList.add('invisible');
        document.getElementById('tabsContainer').style.marginTop = '30px';
        document.querySelector('.main-container').style.marginTop = '80px';
        document.getElementById('statsContainer').style.borderBottom = 'none';
    } else {
        document.getElementById('newsTickerContainer').classList.remove('invisible');
        document.getElementById('tabsContainer').style.marginTop = '60px';
        document.querySelector('.main-container').style.marginTop = '110px';
        document.getElementById('statsContainer').style.borderBottom = '1px dashed';
    }
}

export function getNewsTickerSetting() {
    return newsTickerSetting;
}

export function setRocketsBuilt(value) {
    if (!rocketsBuilt.includes(value)) {
        rocketsBuilt.push(value);
        allTimeRocketsBuilt += 1;
    }
}

export function getRocketsBuilt() {
    return rocketsBuilt;
}

export function removeRocketBuilt(value) {
    rocketsBuilt = rocketsBuilt.filter((item) => item !== value);
}

export function setStarShipModulesBuilt(value) {
    starShipModulesBuilt.push(value);
}

export function getStarShipModulesBuilt() {
    return starShipModulesBuilt ?? [''];
}

export function changeAsteroidArray(key, property, value) {
    for (let obj of asteroidArray) {
        if (obj.hasOwnProperty(key)) {
            obj[key][property] = value;
            return;
        }
    }
}

export function setAsteroidArray(value) {
    asteroidArray.push(value);
}

export function getAsteroidArray() {
    return asteroidArray;
}

export function setRocketsFuellerStartedArray(value, addRemove, matchType = 'exact') {
    if (addRemove === 'add') {
        rocketsFuellerStartedArray.push(value);
    } else if (addRemove === 'remove') {
        rocketsFuellerStartedArray = rocketsFuellerStartedArray.filter(
            item => matchType === 'reset' ? !item.startsWith(value) : item !== value
        );
    }

    rocketsFuellerStartedArray = rocketsFuellerStartedArray.filter(item => item !== '');
}

export function getRocketsFuellerStartedArray() {
    return rocketsFuellerStartedArray;
}

export function setCheckRocketFuellingStatus(key, value) {
    checkRocketFuellingStatus[key] = value;
}

export function getCheckRocketFuellingStatus(key) {
    return checkRocketFuellingStatus[key];
}

export function setWeatherEfficiencyApplied(value) {
    weatherEfficiencyApplied = value;
}

export function getWeatherEfficiencyApplied(key) {
    return weatherEfficiencyApplied;
}

export function setLaunchedRockets(value, addRemove) {
    if (addRemove === 'add') {
        launchedRockets.push(value);
    } else if (addRemove === 'remove') {
        launchedRockets = launchedRockets.filter(item => item !== value);
    }
}

export function getLaunchedRockets() {
    return launchedRockets;
}

export function setMiningObject(key, value) {
    miningObject[key] = value;
}

export function getMiningObject() {
    return miningObject;
}

export function getImageUrls() {
    return IMAGE_URLS;
}

export function getCurrentGameVersion() {
    return GAME_VERSION_FOR_SAVES;
}

export function getMinimumVersion() {
    return MINIMUM_GAME_VERSION_FOR_SAVES;
}

export function getBlackHoleNerfPatched() {
    return blackHoleNerfPatched;
}

export function setBlackHoleNerfPatched(value) {
    blackHoleNerfPatched = !!value;
}

export function getBaseSearchAsteroidTimerDuration() {
    return baseSearchAsteroidTimerDuration;
}

export function setBaseSearchAsteroidTimerDuration(value) {
    baseSearchAsteroidTimerDuration = value;
}

export function getBaseInvestigateStarTimerDuration() {
    return baseInvestigateStarTimerDuration;
}

export function setBaseInvestigateStarTimerDuration(value) {
    baseInvestigateStarTimerDuration = value;
}

export function getBasePillageVoidTimerDuration() {
    return basePillageVoidTimerDuration;
}

export function setBasePillageVoidTimerDuration(value) {
    basePillageVoidTimerDuration = value;
}

export function getCurrentlySearchingAsteroid() {
    return currentlySearchingAsteroid;
}

export function setCurrentlySearchingAsteroid(value) {
    currentlySearchingAsteroid = value ?? false;
}

export function getCurrentlyInvestigatingStar() {
    return currentlyInvestigatingStar;
}

export function setCurrentlyInvestigatingStar(value) {
    currentlyInvestigatingStar = value ?? false;
}

export function getCurrentlyPillagingVoid() {
    return currentlyPillagingVoid;
}

export function setCurrentlyPillagingVoid(value) {
    currentlyPillagingVoid = value;
}

export function getTimeLeftUntilAsteroidScannerTimerFinishes() {
    return timeLeftUntilAsteroidScannerTimerFinishes;
}

export function setTimeLeftUntilAsteroidScannerTimerFinishes(value) {
    timeLeftUntilAsteroidScannerTimerFinishes = value ?? 0;
}

export function getTimeLeftUntilPillageVoidTimerFinishes() {
    return timeLeftUntilPillageVoidTimerFinishes;
}

export function setTimeLeftUntilPillageVoidTimerFinishes(value) {
    timeLeftUntilPillageVoidTimerFinishes = value ?? 0;
}

export function getTimeLeftUntilTravelToDestinationStarTimerFinishes() {
    return timeLeftUntilTravelToDestinationStarTimerFinishes;
}

export function setTimeLeftUntilTravelToDestinationStarTimerFinishes(value) {
    timeLeftUntilTravelToDestinationStarTimerFinishes = value ?? 0;
}

export function getTimeLeftUntilStarInvestigationTimerFinishes() {
    return timeLeftUntilStarInvestigationTimerFinishes;
}

export function setTimeLeftUntilStarInvestigationTimerFinishes(value) {
    timeLeftUntilStarInvestigationTimerFinishes = value ?? 0;
}

export function getTimeLeftUntilBlackHoleChargeTimerFinishes() {
    return timeLeftUntilBlackHoleChargeTimerFinishes;
}

export function setTimeLeftUntilBlackHoleChargeTimerFinishes(value) {
    timeLeftUntilBlackHoleChargeTimerFinishes = value ?? 0;
}

export function getBaseBlackHoleChargeTimerDuration() {
    return baseBlackHoleChargeTimerDuration;
}

export function setBaseBlackHoleChargeTimerDuration(value) {
    baseBlackHoleChargeTimerDuration = value;
}

export function getBlackHoleDurationUpgradeIncrementMs() {
    return blackHoleDurationUpgradeIncrementMs;
}

export function getBlackHolePowerUpgradeIncrement() {
    return blackHolePowerUpgradeIncrement;
}

export function getCurrentBlackHoleChargeTimerDurationTotal() {
    return currentBlackHoleChargeTimerDurationTotal;
}

export function setCurrentBlackHoleChargeTimerDurationTotal(value) {
    currentBlackHoleChargeTimerDurationTotal = value ?? 0;
}

export function getCurrentlyTimeWarpingBlackHole() {
    return currentlyTimeWarpingBlackHole;
}

export function setCurrentlyTimeWarpingBlackHole(value) {
    currentlyTimeWarpingBlackHole = value ?? false;
}

export function getCurrentBlackHoleTimeWarpDurationTotal() {
    return currentBlackHoleTimeWarpDurationTotal;
}

export function setCurrentBlackHoleTimeWarpDurationTotal(value) {
    currentBlackHoleTimeWarpDurationTotal = value ?? 0;
}

export function getBlackHoleTimeWarpEndTimestampMs() {
    return blackHoleTimeWarpEndTimestampMs;
}

export function setBlackHoleTimeWarpEndTimestampMs(value) {
    blackHoleTimeWarpEndTimestampMs = (typeof value === 'number' && Number.isFinite(value)) ? value : 0;
}

export function getCurrentlyChargingBlackHole() {
    return currentlyChargingBlackHole;
}

export function setCurrentlyChargingBlackHole(value) {
    currentlyChargingBlackHole = value ?? false;
}

export function getBlackHoleChargeReady() {
    return blackHoleChargeReady;
}

export function setBlackHoleChargeReady(value) {
    blackHoleChargeReady = value ?? false;
}

export function getBlackHoleAlwaysOn() {
    return blackHoleAlwaysOn;
}

export function setBlackHoleAlwaysOn(value) {
    blackHoleAlwaysOn = value ?? false;
}

export function getTimeLeftUntilRocketTravelToAsteroidTimerFinishes(key) {
    return timeLeftUntilRocketTravelToAsteroidTimerFinishes[key];
}

export function setTimeLeftUntilRocketTravelToAsteroidTimerFinishes(key, value) {
    timeLeftUntilRocketTravelToAsteroidTimerFinishes[key] = value ?? {rocket1: 0, rocket2: 0, rocket3: 0, rocket4: 0};
}

export function getTelescopeReadyToSearch() {
    return telescopeReadyToSearch;
}

export function setTelescopeReadyToSearch(value) {
    telescopeReadyToSearch = value ?? true;
}

export function getCurrentAsteroidSearchTimerDurationTotal() {
    return currentAsteroidSearchTimerDurationTotal;
}

export function setCurrentAsteroidSearchTimerDurationTotal(value) {
    currentAsteroidSearchTimerDurationTotal = value ?? 0;
}

export function getCurrentInvestigateStarTimerDurationTotal() {
    return currentInvestigateStarTimerDurationTotal;
}

export function setCurrentInvestigateStarTimerDurationTotal(value) {
    currentInvestigateStarTimerDurationTotal = value ?? 0;
}

export function getCurrentPillageVoidTimerDurationTotal() {
    return currentPillageVoidTimerDurationTotal;
}

export function setCurrentPillageVoidTimerDurationTotal(value) {
    currentPillageVoidTimerDurationTotal = value ?? 0;
}

export function getAsteroidTimerCanContinue() {
    return asteroidTimerCanContinue;
}

export function setAsteroidTimerCanContinue(value) {
    asteroidTimerCanContinue = value;
}

export function getPillageVoidTimerCanContinue() {
    return pillageVoidTimerCanContinue;
}

export function setPillageVoidTimerCanContinue(value) {
    pillageVoidTimerCanContinue = value;
}

export function getStarInvestigationTimerCanContinue() {
    return starInvestigationTimerCanContinue;
}

export function setStarInvestigationTimerCanContinue(value) {
    starInvestigationTimerCanContinue = value;
}

export function getCurrentlyTravellingToAsteroid(key) {
    return currentlyTravellingToAsteroid[key];
}

export function setCurrentlyTravellingToAsteroid(key, value) {
    currentlyTravellingToAsteroid[key] = value;
}

export function setRocketReadyToTravel(key, value) {
    rocketReadyToTravel[key] = value;
}

export function getRocketReadyToTravel(key) {
    return rocketReadyToTravel[key];
}

export function setRocketTravelDuration(key, value) {
    rocketTravelDuration[key] = value;
}

export function getRocketTravelDuration() {
    return rocketTravelDuration;
}

export function setStarTravelDuration(value) {
    starTravelDuration = value;
}

export function getStarTravelDuration() {
    return starTravelDuration;
}

export function setDestinationAsteroid(key, value) {
    destinationAsteroid[key] = value;
}

export function getDestinationAsteroid(key) {
    return destinationAsteroid[key];
}

export function getGameCostMultiplier() {
    return GAME_COST_MULTIPLIER;
}

export function setSortAsteroidMethod(value) {
    sortAsteroidMethod = value;
}

export function getSortAsteroidMethod() {
    return sortAsteroidMethod;
}

export function setSortStarMethod(value) {
    sortStarMethod = value;
}

export function getSortStarMethod() {
    return sortStarMethod;
}

export function getRocketTravelSpeed() {
    return rocketTravelSpeed;
}

export function setRocketTravelSpeed(value) {
    rocketTravelSpeed = value;
}

export function getStarShipTravelSpeed() {
    return starShipTravelSpeed;
}

export function setStarShipTravelSpeed(value) {
    starShipTravelSpeed = value;
}

export function getAntimatterUnlocked() {
    return antimatterUnlocked;
}

export function setAntimatterUnlocked(value) {
    antimatterUnlocked = value;
}

export function getPermanentAntimatterUnlock() {
    return permanentAntimatterUnlock;
}

export function setMegaStructureAntimatterAmount(value) {
    megastructureAntimatterAmount += value;
}

export function getMegaStructureAntimatterAmount() {
    return megastructureAntimatterAmount;
}

export function setPermanentAntimatterUnlock(value) {
    permanentAntimatterUnlock = value;
}

export function getNormalMaxAntimatterRate() {
    return NORMAL_MAX_ANTIMATTER_RATE;
}

export function getHasAntimatterSvgRightBoxDataChanged(newAntimatterSvgData) {
    return JSON.stringify(newAntimatterSvgData) !== JSON.stringify(oldAntimatterRightBoxSvgData);
}

export function setHasAntimatterSvgRightBoxDataChanged(value) {
    oldAntimatterRightBoxSvgData = value;
}

export function getIsAntimatterBoostActive() {
    return isAntimatterBoostActive;
}

export function setIsAntimatterBoostActive(value) {
    if (getSfx() && value) {
        boostSoundManager.startBoostLoop();
    }

    if (!value) {
        boostSoundManager.stopBoostLoop();
    }

    isAntimatterBoostActive = value;
}

export function getAntimatterSvgEventListeners() {
    return antimatterSvgEventListeners;
}

export function setAntimatterSvgEventListeners(value) {
    antimatterSvgEventListeners = value;
}

export function getBoostRate() {
    return BOOST_ANTIMATTER_RATE_MULTIPLIER;
}

export function setRocketDirection(key, value) {
    rocketDirection[key] = value;
}

export function getRocketDirection(key) {
    return rocketDirection[key] ?? false;
}

export function setCanTravelToAsteroids(value) {
    canTravelToAsteroids = value;
}

export function getCanTravelToAsteroids() {
    return canTravelToAsteroids ?? false;
}

export function setCanFuelRockets(value) {
    canFuelRockets = value;
}

export function getCanFuelRockets() {
    return canFuelRockets ?? false;
}

export function setCurrentDestinationDropdownText(value) {
    currentDestinationDropdownText = value;
}

export function getCurrentDestinationDropdownText() {
    return currentDestinationDropdownText ?? 'Select an option';
}

export function getRocketUserName(key) {
    return rocketUserName[key] ?? `Rocket ${capitaliseString(key).slice(-1)}`;
}

export function setRocketUserName(key, value) {
    rocketUserName[key] = value;
}

export function getStarVisionDistance() {
    return starVisionDistance ?? 0;
}

export function setStarVisionDistance(value) {
    starVisionDistance = value;
}

export function getStarMapMode() {
    return starMapMode ?? 'normal';
}

export function setStarMapMode(value) {
    starMapMode = value;
}

export function getStarVisionIncrement() {
    return starVisionIncrement ?? 1;
}

export function setStarVisionIncrement(value) {
    starVisionIncrement = value;
}

export function getAscendencyPoints() {
    return getResourceDataObject('ascendencyPoints', ['quantity']) ?? 0;
}

export function setAscendencyPoints(value) {
    setResourceDataObject(value, 'ascendencyPoints', ['quantity']);
}

export function getStarShipBuilt() {
    return starShipBuilt;
}

export function setStarShipBuilt(value) {
    starShipBuilt = value;
}

export function getDestinationStar() {
    return destinationStar ?? null;
}

export function setDestinationStar(value) {
    destinationStar = typeof value === 'string' ? value.toLowerCase() : value;
}

export function getStarShipTravelling() {
    return starShipTravelling ?? false;
}

export function setStarShipTravelling(value) {
    starShipTravelling = value;
}

export function getFromStarObject() {
    return fromStarObject ?? null;
}

export function setFromStarObject(value) {
    fromStarObject = value;
}

export function getToStarObject() {
    return toStarObject ?? null;
}

export function setToStarObject(value) {
    toStarObject = value;
}

export function getCurrentStarObject(value) {
    return currentStarObject;
}

export function setCurrentStarObject(value) {
    currentStarObject = value;
}

export function getStarShipArrowPosition() {
    return starShipArrowPosition ?? 0;
}

export function setStarShipArrowPosition(value) {
    starShipArrowPosition = value;
}

export function getStarShipStatus() {
    return starShipStatus ?? ['preconstruction', null];
}

export function setStarShipStatus(value) {
    starShipStatus = value;
}

export function getStarShipDestinationReminderVisible() {
    return starShipDestinationReminderVisible;
}

export function setStarShipDestinationReminderVisible(value) {
    starShipDestinationReminderVisible = Boolean(value);
}

export function getStellarScannerBuilt() {
    return stellarScannerBuilt ?? false;
}

export function setStellarScannerBuilt(value) {
    stellarScannerBuilt = value;
}

export function getDestinationStarScanned() {
    return destinationStarScanned;
}

export function setDestinationStarScanned(value) {
    destinationStarScanned = value;
}

export function getOTypePowerPlantStrengthBoost() {
    return oTypePowerPlantStrengthBoost;
}

export function setOTypePowerPlantStrengthBoost(value) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
        return;
    }
    oTypePowerPlantStrengthBoost = value;
}

export function getStellarScannerRange() {
    return STELLAR_SCANNER_RANGE;
}

export function setDiplomacyPossible(value) {
    diplomacyPossible = value
}

export function getWarMode() {
    return warMode;
}

export function setWarMode(value) {
    warMode = value;
}

export function getOnboardingMode() {
    return onboardingMode;
}

export function setOnboardingMode(value) {
    onboardingMode = value;
}

export function getBelligerentEnemyFlag() {
    return belligerentEnemyFlag;
}

export function setBelligerentEnemyFlag(value) {
    belligerentEnemyFlag = value;
}

export function getDiplomacyPossible() {
    return diplomacyPossible;
}

export function setFleetChangedSinceLastDiplomacy(value) {
    fleetChangedSinceLastDiplomacy = value
}

export function getFleetChangedSinceLastDiplomacy() {
    return fleetChangedSinceLastDiplomacy;
}

export function setBattleUnits(key, value) {
    battleUnits[key] = value;
}

export function replaceBattleUnits(value) {
    battleUnits = value;
}

export function getNeedNewBattleCanvas() {
    return needNewBattleCanvas;
}

export function setNeedNewBattleCanvas(value) {
    needNewBattleCanvas = value;
}

export function getBattleUnits() {
    return battleUnits;
}

export function getBattleOngoing() {
    return battleOngoing ?? false;
}

export function setBattleOngoing(value) {
    battleOngoing = value;
}

export function getBattleTriggeredByPlayer() {
    return battleTriggeredByPlayer ?? false;
}

export function setBattleTriggeredByPlayer(value) {
    battleTriggeredByPlayer = value;
}

export function getPlayerStartingUnitHealth() {
    return playerStartingUnitHealth ?? 100;
}

export function setPlayerStartingUnitHealth(value) {
    playerStartingUnitHealth = value;
}

export function getInitialImpression() {
    return initialImpression ?? 35;
}

export function setInitialImpression(value) {
    initialImpression = value;
}

export function getFormationGoal() {
    return formationGoal;
}

export function setFormationGoal(value) {
    formationGoal = value;
}

export function getFleetConstantData(key) {
    return enemyFleetData[key] ? enemyFleetData[key] : null;
}

export function setFleetConstantData(key, value) {
    if (enemyFleetData[key]) {
        enemyFleetData[key] = value;
    }
}

export function getRedrawBattleDescription() {
    return redrawBattleDescription;
}

export function setRedrawBattleDescription(value) {
    redrawBattleDescription = value;
}

export function getInFormation() {
    return inFormation;
}

export function setInFormation(value) {
    inFormation = value;
}

export function getEnemyFleetsAdjustedForDiplomacy() {
    return enemyFleetAdjustedForDiplomacy;
}

export function setEnemyFleetsAdjustedForDiplomacy(value) {
    enemyFleetAdjustedForDiplomacy = value;
}

export function getBattleResolved() {
    return battleResolved;
}

export function setBattleResolved(status, winner) {
    battleResolved = [status, winner];
}

export function getApAwardedThisRun() {
    return apAwardedThisRun;
}

export function setApAwardedThisRun(value) {
    apAwardedThisRun = value;
}

export function getRebirthPossible() {
    return rebirthPossible;
}

export function setRebirthPossible(value) {
    rebirthPossible = value;
}

export function setGalacticMarketOutgoingStockType(value) {
    galacticMarketOutgoingStockType = value;
}

export function getGalacticMarketOutgoingStockType() {
    return galacticMarketOutgoingStockType;
}

export function setGalacticMarketIncomingStockType(value) {
    galacticMarketIncomingStockType = value;
}

export function getGalacticMarketIncomingStockType() {
    return galacticMarketIncomingStockType;
}

export function setGalacticMarketOutgoingQuantitySelectionType(value) {
    galacticMarketOutgoingQuantitySelectionType = value;
}

export function getGalacticMarketOutgoingQuantitySelectionType() {
    return galacticMarketOutgoingQuantitySelectionType;
}

export function setGalacticMarketOutgoingQuantitySelectionTypeDisabledStatus(value) {
    galacticMarketOutgoingQuantitySelectionTypeDisabledStatus = value;
}

export function getGalacticCasinoPurchaseItem() {
    return galacticCasinoPurchaseItem;
}

export function setGalacticCasinoPurchaseItem(value) {
    galacticCasinoPurchaseItem = value;
}

export function getGalacticMarketOutgoingQuantitySelectionTypeDisabledStatus() {
    return galacticMarketOutgoingQuantitySelectionTypeDisabledStatus;
}

export function setGalacticMarketSellApForCashQuantity(value) {
    galacticMarketSellApForCashQuantity = value;
}

export function getGalacticMarketSellApForCashQuantity() {
    return galacticMarketSellApForCashQuantity;
}

export function setGalacticMarketLiquidationAuthorization(value) {
    galacticMarketLiquidationAuthorization = value;
}

export function getGalacticMarketLiquidationAuthorization() {
    return galacticMarketLiquidationAuthorization;
}

export function setHasClickedOutgoingOptionGalacticMarket(value) {
    hasClickedOutgoingOptionGalacticMarket = value;
}

export function getHasClickedOutgoingOptionGalacticMarket(value) {
    return hasClickedOutgoingOptionGalacticMarket;
}

export function getPriceCasinoGame2() {
    return PRICE_CASINO_GAME_2;
}

export function getPriceCasinoGame3() {
    return PRICE_CASINO_GAME_3;
}

export function getVoidSeerPrizeCatalog() {
    return VOID_SEER_PRIZE_CATALOG;
}

export function setGalacticMarketIncomingQuantity(value) {
    galacticMarketIncomingQuantity = value;
}

export function getGalacticMarketIncomingQuantity() {
    return galacticMarketIncomingQuantity;
}

export function setCurrentGalacticMarketCommission(value) {
    currentGalacticMarketCommission = value;
}

export function getCurrentGalacticMarketCommission() {
    return currentGalacticMarketCommission;
}

export function setApSellForCashPrice(value) {
    apSellForCashPrice = value;
}

export function getApSellForCashPrice() {
    return apSellForCashPrice;
}

export function getApBaseSellPrice() {
    return AP_BASE_SELL_PRICE;
}

export function setApBuyPrice(value) {
    apBuyForCashPrice = value;
}

export function getApBuyPrice() {
    return apBuyForCashPrice;
}

export function getApBaseBuyPrice() {
    return AP_BASE_BUY_PRICE;
}

export function setLiquidationValue(value) {
    liquidationValue = value;
}

export function getLiquidationValue() {
    return liquidationValue;
}

export function setApLiquidationQuantity(value) {
    apLiquidationQuantity = value;
}

export function getApLiquidationQuantity() {
    return apLiquidationQuantity;
}

export function getCashLiquidationModifier() {
    return CASH_LIQUIDATION_MODIFIER;
}

export function getLiquidatedThisRun() {
    return liquidatedThisRun;
}

export function setLiquidatedThisRun(value) {
    liquidatedThisRun = value;
}

export function getLastSellResourceCompoundDropdownOption(type, resource) {
    return lastSellResourceCompoundDropdownOption[type][resource];
}

export function setLastSellResourceCompoundDropdownOption(type, resource, value) {
    if (!lastSellResourceCompoundDropdownOption[type]) {
        lastSellResourceCompoundDropdownOption[type] = {};
    }
    lastSellResourceCompoundDropdownOption[type][resource] = value;
}

export function getNotificationQueues() {
    return notificationQueues;
}

export function setNotificationQueues(value) {
    notificationQueues = value;
}

export function getNotificationStatus() {
    return notificationStatus;
}

export function setNotificationStatus(value) {
    notificationStatus = value;
}

export function getNotificationContainers() {
    return notificationContainers;
}

export function setNotificationContainers(value) {
    notificationContainers = value;
}

export function getClassificationOrder() {
    return classificationOrder;
}

export function setClassificationOrder(value) {
    classificationOrder = value;
}

export function setAdditionalSystemsToSettleThisRun(value) {
    additionalSystemsToSettleThisRun = value;
}

export function getAdditionalSystemsToSettleThisRun() {
    return additionalSystemsToSettleThisRun;
}

export function getStarsWithAncientManuscripts() {
    return starsWithAncientManuscripts;
}

export function setStarsWithAncientManuscripts(value) {
    starsWithAncientManuscripts.push(value);
    syncFactoryStarsArrayFromAncientManuscripts();
}

export function getOStarArrivalPopupsShown() {
    return Array.isArray(oStarArrivalPopupsShown) ? oStarArrivalPopupsShown : [];
}

export function markOStarArrivalPopupShown(starName) {
    if (!starName) {
        return;
    }

    const normalized = String(starName).toLowerCase();
    if (!oStarArrivalPopupsShown.includes(normalized)) {
        oStarArrivalPopupsShown.push(normalized);
    }
}

export function getOTypeMechanicActivatedForThisSave() {
    return !!oTypeMechanicActivatedForThisSave;
}

export function setOTypeMechanicActivatedForThisSave(value) {
    oTypeMechanicActivatedForThisSave = !!value;
}

export function getMaxAncientManuscripts() {
    return MAX_ANCIENT_MANUSCRIPTS;
}

export function getManuscriptCluesShown() {
    return manuscriptCluesShown;
}

export function markManuscriptClueShown(starName, clueId) {
    if (!starName || clueId === undefined || clueId === null) {
        return;
    }

    const normalizedName = starName.toLowerCase();
    if (!Array.isArray(manuscriptCluesShown[normalizedName])) {
        manuscriptCluesShown[normalizedName] = [];
    }

    if (!manuscriptCluesShown[normalizedName].includes(clueId)) {
        manuscriptCluesShown[normalizedName].push(clueId);
    }
}

export function activateFactoryStar(star) {
    const factoryStarNameRaw = star?.[1];
    if (!factoryStarNameRaw) {
        return;
    }

    const factoryStarName = factoryStarNameRaw.toLowerCase();

    for (let i = 0; i < starsWithAncientManuscripts.length; i++) {
        const current = starsWithAncientManuscripts[i];
        const isMatch =
            Array.isArray(current) &&
            Array.isArray(star) &&
            current[0] === star[0] &&
            current[1] === star[1] &&
            current[2] === star[2];

        if (isMatch) {
            starsWithAncientManuscripts[i][3] = true;
            starsWithAncientManuscripts[i][1] = factoryStarName;
            break;
        }
    }

    if (!factoryStarsArray.includes(factoryStarName)) {
        factoryStarsArray.push(factoryStarName);
    }

    syncFactoryStarsArrayFromAncientManuscripts();

    const factoryStarObject = starSystems?.stars?.[factoryStarName];
    if (!factoryStarObject) {
        return;
    }

    const factoryStarId = factoryStarObject.factoryStar;
    if (factoryStarId === undefined || factoryStarId === null) {
        return;
    }

    const mappedFactoryStarString = mapFactoryStarValue(factoryStarId);
    starSystems.stars[factoryStarName].factoryStar = mappedFactoryStarString;
}

export function setMegaStructuresInPossessionArray(value) {
    megaStructuresInPossessionArray.push(mapFactoryStarValue(value));
}

export function getMegaStructuresInPossessionArray() {
    return megaStructuresInPossessionArray;
}

export function getFactoryStarsArray() {
    return Array.isArray(factoryStarsArray) ? [...factoryStarsArray] : [];
}

export function setFactoryStarsArray(value, override = false) {
    if (override) {
        if (Array.isArray(value)) {
            factoryStarsArray = value
                .filter(Boolean)
                .map((v) => (typeof v === 'string' ? v.toLowerCase() : v))
                .slice(0, 4);
        } else {
            factoryStarsArray = [];
        }
        syncFactoryStarsArrayFromAncientManuscripts();
        return;
    }

    factoryStarsArray.push(typeof value === 'string' ? value.toLowerCase() : value);
    syncFactoryStarsArrayFromAncientManuscripts();
}

export function getCurrentRunIsMegaStructureRun() {
    return currentRunIsMegaStructureRun;
}

export function setCurrentRunIsMegaStructureRun(value) {
    currentRunIsMegaStructureRun = value;
}

export function getMegaStructureTabNotificationShown() {
    return megaStructureTabNotificationShown;
}

export function setMegaStructureTabNotificationShown(value) {
    megaStructureTabNotificationShown = value;
}

export function getHasVisitedMegaStructure() {
    return hasVisitedMegaStructure;
}

export function setHasVisitedMegaStructure(value) {
    hasVisitedMegaStructure = value;
}

export function getMegaStructureAssignmentMode() {
    return megaStructureAssignmentMode;
}

export function setMegaStructureAssignmentMode(value) {
    megaStructureAssignmentMode = value;
}

export function getMegaStructureTabUnlocked() {
    return megaStructureTabUnlocked;
}

export function setMegaStructureTabUnlocked(value) {
    megaStructureTabUnlocked = value;
}

export function getGalacticCasinoUnlocked() {
    return galacticCasinoUnlocked;
}

export function setGalacticCasinoUnlocked(value) {
    galacticCasinoUnlocked = Boolean(value);
}

export function setMiaplacidusMilestoneLevel(value) {
    miaplacidusMilestoneLevel = value;
}

export function getMiaplacidusMilestoneLevel() {
    return miaplacidusMilestoneLevel;
}

export function getMegaStructureTechsResearched() {
    return megaStructureTechsResearched;
}

export function setMegaStructureTechsResearched(value, override = false) {
    if (!override) {
        megaStructureTechsResearched.push(value);
    } else {
        megaStructureTechsResearched = value;
    }
}

export function getNonExhaustiveResources() {
    return nonExhaustiveResources || !!(ascendencyBuffs?.nonExhaustiveResources?.boughtYet > 0);
}

export function setNonExhaustiveResources(value) {
    nonExhaustiveResources = Boolean(value);
}

export function getInfinitePower() {
    return infinitePower;
}

export function setInfinitePower(value) {
    infinitePower = value;
}

export function getMegaStructureResourceBonus() {
    return megaStructureResourceBonus;
}

export function setMegaStructureResourceBonus(value) {
    megaStructureResourceBonus = value;
}

export function getStorageAdderBonus() {
    return storageAdderBonus;
}

export function setStorageAdderBonus(value) {
    storageAdderBonus = value;
}

export function getInfinitePowerRate() {
    return INFINITE_POWER_RATE;
}

export function getAsteroidCostMultiplier() {
    return ASTEROID_COST_MULTIPLIER;
}

//stat retrievers-------------------------------------------------------------------------------------------------------

function getStatPioneer() {//
    return getSaveName();
}

function getStatCurrentAp() {//
    return getAscendencyPoints();
}

function getStatTotalApGain() {//
    return allTimeTotalApGain;
}

export function getStatRun() {//
    return runNumber;
}

function getStatTotalTimePlayed() {
    const elapsedMilliseconds = Date.now() - getGameStartTime();
    return formatTime(elapsedMilliseconds);
}

function getStatRunTime() {
    const elapsedMilliseconds = Date.now() - getRunStartTime();
    return formatTime(elapsedMilliseconds);
}

function formatTime(milliseconds) {
    let totalSeconds = Math.floor(milliseconds / 1000);
    let days = Math.floor(totalSeconds / (3600 * 24));
    totalSeconds %= (3600 * 24);
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    let timeString = '';
    if (days > 0) timeString += `${days}d `;
    if (hours > 0) timeString += `${hours}h `;
    if (minutes > 0) timeString += `${minutes}m `;
    if (seconds > 0 || timeString === '') timeString += `${seconds}s`;

    return timeString.trim();
}

function getStatTotalUniqueNewsTickersSeen() {//
    return alreadySeenNewsTickerArray.length;
}

function getStatNewsTickerPrizesCollected() {//
    return totalNewsTickerPrizesCollected;
}

function getStatTheme() {//
    return capitaliseString(getCurrentTheme());
}

function getStatTotalAntimatterMined() {//
    return allTimeTotalAntimatterMined;
}

function getStatTotalAsteroidsDiscovered() {//
    return allTimeTotalAsteroidsDiscovered;
}

function getStatTotalLegendaryAsteroidsDiscovered() {//
    return allTimeTotalLegendaryAsteroidsDiscovered;
}

function getStatTotalRocketsLaunched() {//
    return allTimeTotalRocketsLaunched;
}

function getStatTotalStarShipsLaunched() {//
    return allTimeTotalStarShipsLaunched;
}

function getStatStarSystem() {//
    return capitaliseWordsWithRomanNumerals(getCurrentStarSystem());
}

function getStatCurrentWeather() {//
    return document.getElementById('stat7').textContent.trim().slice(-1);
}

function getStatCash() {//
    return document.getElementById('cashStat').textContent;
}

function getStatApAnticipated() {//
    return apAnticipatedThisRun;
}

function getStatAntimatter() {//
    return resourceData.antimatter.quantity;
}

function getStatHydrogen() {//
    return allTimeTotalHydrogen;
}

function getStatHydrogenThisRun() {
    return hydrogenThisRun;
}

function getStatHelium() {//
    return allTimeTotalHelium;
}

function getStatHeliumThisRun() {
    return heliumThisRun;
}

function getStatCarbon() {//
    return allTimeTotalCarbon;
}

function getStatCarbonThisRun() {
    return carbonThisRun;
}

function getStatNeon() {//
    return allTimeTotalNeon;
}

function getStatNeonThisRun() {
    return neonThisRun;
}

function getStatOxygen() {//
    return allTimeTotalOxygen;
}

function getStatOxygenThisRun() {
    return oxygenThisRun;
}

function getStatSodium() {//
    return allTimeTotalSodium;
}

function getStatSodiumThisRun() {
    return sodiumThisRun;
}

function getStatSilicon() {//
    return allTimeTotalSilicon;
}

function getStatSiliconThisRun() {
    return siliconThisRun;
}

function getStatIron() {//
    return allTimeTotalIron;
}

function getStatIronThisRun() {
    return ironThisRun;
}

function getStatDiesel() {//
    return allTimeTotalDiesel;
}

function getStatDieselThisRun() {
    return dieselThisRun;
}

function getStatGlass() {//
    return allTimeTotalGlass;
}

function getStatGlassThisRun() {
    return glassThisRun;
}

function getStatSteel() {//
    return allTimeTotalSteel;
}

function getStatSteelThisRun() {
    return steelThisRun;
}

function getStatConcrete() {//
    return allTimeTotalConcrete;
}

function getStatConcreteThisRun() {
    return concreteThisRun;
}

function getStatWater() {//
    return allTimeTotalWater;
}

function getStatWaterThisRun() {
    return waterThisRun;
}

function getStatTitanium() {//
    return allTimeTotalTitanium;
}

function getStatTitaniumThisRun() {
    return titaniumThisRun;
}

function getStatResearchPoints() {//
    return allTimeTotalResearchPoints;
}

function getStatResearchPointsThisRun() {
    return researchPointsThisRun;
}

function getStatScienceKits() {//
    return allTimeTotalScienceKits;
}

function getStatScienceKitsThisRun() {
    return scienceKitsThisRun;
}

function getStatScienceClubs() {//
    return allTimeTotalScienceClubs;
}

function getStatScienceClubsThisRun() {
    return scienceClubsThisRun;
}

function getStatScienceLabs() {//
    return allTimeTotalScienceLabs;
}

function getStatScienceLabsThisRun() {
    return scienceLabsThisRun;
}

function getStatTechsUnlocked() {//
    return getTechUnlockedArray().length;
}

function getStatTechsUnlockedAllTime() {
    return getTechUnlockedArray().length;
}

function getStatPower() {//
    return document.getElementById('stat3').textContent.split(' ')[1];
}

function getStatPowerAllTime() {
    return 'N/A';
}

function getStatTotalEnergy() {//
    return document.getElementById('stat2').textContent;
}

function getStatTotalEnergyAllTime() {
    return 'N/A';
}

function getStatTotalProduction() {//
    return Math.floor((resourceData.buildings.energy.upgrades.powerPlant1.quantity * resourceData.buildings.energy.upgrades.powerPlant1.rate 
        + resourceData.buildings.energy.upgrades.powerPlant2.quantity * resourceData.buildings.energy.upgrades.powerPlant2.rate
        + resourceData.buildings.energy.upgrades.powerPlant3.quantity * resourceData.buildings.energy.upgrades.powerPlant3.rate) 
        * getTimerRateRatio()) + ' KW / s';
}

function getStatTotalProductionAllTime() {
    return 'N/A';
}

function getStatTotalConsumption() {//
    return Math.floor(getTotalEnergyUse() * getTimerRateRatio()) + ' KW / s';
}

function getStatTotalConsumptionAllTime() {
    return 'N/A';
}

function getStatTotalBatteryStorage() {//
    return Math.floor(getResourceDataObject('buildings', ['energy', 'storageCapacity']) / 1000)  + ' MWh';
}

function getStatTotalBatteryStorageAllTime() {
    return 'N/A';
}

function getStatTimesTripped() {//
    return allTimesTripped;
}

function getStatTimesTrippedThisRun() {
    return timesTrippedThisRun;
}

function getStatBasicPowerPlants() {//
    return allTimeBasicPowerPlantsBuilt;
}

function getStatBasicPowerPlantsThisRun() {
    return basicPowerPlantsBuiltThisRun;
}

function getStatAdvancedPowerPlants() {//
    return allTimeAdvancedPowerPlantsBuilt;
}

function getStatAdvancedPowerPlantsThisRun() {
    return advancedPowerPlantsBuiltThisRun;
}

function getStatSolarPowerPlants() {//
    return allTimeSolarPowerPlantsBuilt;
}

function getStatSolarPowerPlantsThisRun() {
    return solarPowerPlantsBuiltThisRun;
}

function getStatSodiumIonBatteries() {//
    return allTimeSodiumIonBatteriesBuilt;
}

function getStatSodiumIonBatteriesThisRun() {
    return sodiumIonBatteriesBuiltThisRun;
}

function getStatBattery2() {//
    return allTimeBattery2Built;
}

function getStatBattery2ThisRun() {
    return battery2BuiltThisRun;
}

function getStatBattery3() {//
    return allTimeBattery3Built;
}

function getStatBattery3ThisRun() {
    return battery3BuiltThisRun;
}

function getStatSpaceTelescopeBuilt() {//
    return getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'spaceTelescopeBoughtYet']) ? "Yes" : "No";
}

function getStatSpaceTelescopeBuiltAllTime() {
    return 'N/A';
}

function getStatLaunchPadBuilt() {//
    return getResourceDataObject('space', ['upgrades', 'launchPad', 'launchPadBoughtYet']) ? "Yes" : "No";
}

function getStatLaunchPadBuiltAllTime() {
    return 'N/A';
}

function getStatRocketsBuilt() {//
    return getRocketsBuilt().length;
}

function getStatRocketsBuiltAllTime() {
    return allTimeRocketsBuilt;
}

function getStatAsteroidsDiscovered() {//
    return getAsteroidArray().length;
}

function getStatAsteroidsMined() {
    return allTimeTotalAsteroidsMined;
}

function getStatAsteroidsMinedThisRun() {
    return asteroidsMinedThisRun;
}

function getStatStarStudyRange() {//
    return `${starStudyRange} ly`;
}

function getStatStarStudyRangeAllTime() {
    return 'N/A';
}

function getStatStarShipBuilt() {//
    return starShipBuilt ? "Yes" : "No";
}

function getStatStarShipBuiltAllTime() {
    return 'N/A';
}

function getStatStarShipDistanceTravelled() {//
    return `${starShipTravelDistance} ly`;
}

function getStatSystemScanned() {//
    return destinationStarScanned ? "Yes" : "No";
}

function getStatSystemScannedAllTime() {
    return 'N/A';
}

function getStatFleetAttackStrength() {
    return Math.floor(getResourceDataObject('fleets', ['attackPower']));
}

function getStatFleet1() {
    return getResourceDataObject('space', ['upgrades', 'fleetEnvoy', 'quantity']);
}

function getStatFleet2() {
    return getResourceDataObject('space', ['upgrades', 'fleetScout', 'quantity']);
}

function getStatFleet3() {
    return getResourceDataObject('space', ['upgrades', 'fleetMarauder', 'quantity']);
}

function getStatFleet4() {
    return getResourceDataObject('space', ['upgrades', 'fleetLandStalker', 'quantity']);
}

function getStatFleet5() {
    return getResourceDataObject('space', ['upgrades', 'fleetNavalStrafer', 'quantity']);
}

function getStatFleetEnvoy() {
    return getResourceDataObject('space', ['upgrades', 'fleetEnvoy', 'quantity']);
}

function getStatFleetScout() {
    return getResourceDataObject('space', ['upgrades', 'fleetScout', 'quantity']);
}

function getStatFleetMarauder() {
    return getResourceDataObject('space', ['upgrades', 'fleetMarauder', 'quantity']);
}

function getStatFleetLandStalker() {
    return getResourceDataObject('space', ['upgrades', 'fleetLandStalker', 'quantity']);
}

function getStatFleetNavalStrafer() {
    return getResourceDataObject('space', ['upgrades', 'fleetNavalStrafer', 'quantity']);
}

function getStatEnemy() {
    return getStarSystemDataObject('stars', ['destinationStar', 'raceName'], true) ?? 'N/A';
}

function getStatEnemyAllTime() {
    return 'N/A';
}

function getStatEnemyTotalDefenceOvercome() {
    return 'N/A';
}

function getStatEnemyTotalDefenceOvercomeAllTime() {
    const start = enemyFleetPowerAtBattleStart;
    const current = getStarSystemDataObject('stars', ['destinationStar', 'enemyFleets', 'fleetPower'], true) ?? 0;
    return Math.max(0, start - current);
}

function getStatBlackHoleDiscoveredThisRun() {
    return 'N/A';
}

function getStatBlackHoleDiscoveredAllTime() {
    return getBlackHoleDiscovered() ? 'Yes' : 'No';
}

function getStatBlackHoleAlwaysActiveThisRun() {
    return 'N/A';
}

function getStatBlackHoleAlwaysActiveAllTime() {
    return getBlackHoleAlwaysOn() ? 'Yes' : 'No';
}

function getStatBlackHoleStrengthThisRun() {
    return 'N/A';
}

function getStatBlackHoleStrengthAllTime() {
    return getBlackHolePower();
}

function getStatCosmicRipChapterGalacticPointsEarnedThisRun() {
    return 'N/A';
}

function getStatCosmicRipChapterGalacticPointsEarnedAllTime() {
    const settledCount = ((getSettledStars?.() || []).length) - 1;
    return Math.max(0, settledCount);
}

function getStatCosmicRipChapterGalacticPointsSpentThisRun() {
    return 'N/A';
}

function getStatCosmicRipChapterGalacticPointsSpentAllTime() {
    return Number(getGalacticPointsSpent?.()) || 0;
}

function getStatCosmicRipChapterUnlockThisRun() {
    return 'N/A';
}

function getStatCosmicRipChapterUnlockAllTime() {
    return getTechUnlockedArray?.().includes('cosmicRip') ? 'Yes' : 'No';
}

function getStatNearSpaceScannerArrayRestoredThisRun() {
    return 'N/A';
}

function getStatNearSpaceScannerArrayRestoredAllTime() {
    return (getResourceDataObject('cosmicRip', ['nearSpaceScannerArrayRestored']) === true) ? 'Yes' : 'No';
}

function getStatCosmicRipLocatedThisRun() {
    return 'N/A';
}

function getStatCosmicRipLocatedAllTime() {
    return (getResourceDataObject('cosmicRip', ['ripFound']) === true) ? 'Yes' : 'No';
}

function getStatCosmicRipStabilisedThisRun() {
    return 'N/A';
}

function getStatCosmicRipStabilisedAllTime() {
    const techs = getResourceDataObject('cosmicRip', ['techs']) || {};
    const total = Object.keys(techs).length;
    const unlocked = (getCosmicRipTechUnlockedArray?.() || []).length;
    if (!total) return 'No';
    return unlocked >= total ? 'Yes' : 'No';
}

function getStatRipTelemetryDataGainedThisRun() {
    return 'N/A';
}

function getStatRipTelemetryDataGainedAllTime() {
    return allTimeRipTelemetryDataEarned;
}

function getStatEventPowerPlantExplosionThisRun() { return getRandomEventCountThisRun('powerPlantExplosion'); }
function getStatEventPowerPlantExplosionAllTime() { return getRandomEventCountAllTime('powerPlantExplosion'); }
function getStatEventBatteryExplosionThisRun() { return getRandomEventCountThisRun('batteryExplosion'); }
function getStatEventBatteryExplosionAllTime() { return getRandomEventCountAllTime('batteryExplosion'); }
function getStatEventScienceTheftThisRun() { return getRandomEventCountThisRun('scienceTheft'); }
function getStatEventScienceTheftAllTime() { return getRandomEventCountAllTime('scienceTheft'); }
function getStatEventResearchBreakthroughThisRun() { return getRandomEventCountThisRun('researchBreakthrough'); }
function getStatEventResearchBreakthroughAllTime() { return getRandomEventCountAllTime('researchBreakthrough'); }
function getStatEventRocketInstantArrivalThisRun() { return getRandomEventCountThisRun('rocketInstantArrival'); }
function getStatEventRocketInstantArrivalAllTime() { return getRandomEventCountAllTime('rocketInstantArrival'); }
function getStatEventStarshipLostInSpaceThisRun() { return getRandomEventCountThisRun('starshipLostInSpace'); }
function getStatEventStarshipLostInSpaceAllTime() { return getRandomEventCountAllTime('starshipLostInSpace'); }
function getStatEventAntimatterReactionThisRun() { return getRandomEventCountThisRun('antimatterReaction'); }
function getStatEventAntimatterReactionAllTime() { return getRandomEventCountAllTime('antimatterReaction'); }
function getStatEventStockLossThisRun() { return getRandomEventCountThisRun('stockLoss'); }
function getStatEventStockLossAllTime() { return getRandomEventCountAllTime('stockLoss'); }
function getStatEventGalacticMarketLockdownThisRun() { return getRandomEventCountThisRun('galacticMarketLockdown'); }
function getStatEventGalacticMarketLockdownAllTime() { return getRandomEventCountAllTime('galacticMarketLockdown'); }
function getStatEventEndlessSummerThisRun() { return getRandomEventCountThisRun('endlessSummer'); }
function getStatEventEndlessSummerAllTime() { return getRandomEventCountAllTime('endlessSummer'); }
function getStatEventMinerBrokeDownThisRun() { return getRandomEventCountThisRun('minerBrokeDown'); }
function getStatEventMinerBrokeDownAllTime() { return getRandomEventCountAllTime('minerBrokeDown'); }
function getStatEventSupplyChainDisruptionThisRun() { return getRandomEventCountThisRun('supplyChainDisruption'); }
function getStatEventSupplyChainDisruptionAllTime() { return getRandomEventCountAllTime('supplyChainDisruption'); }
function getStatEventBlackHoleInstabilityThisRun() { return getRandomEventCountThisRun('blackHoleInstability'); }
function getStatEventBlackHoleInstabilityAllTime() { return getRandomEventCountAllTime('blackHoleInstability'); }

function getStatEnemyTotalDefenceRemaining() {
    return getStarSystemDataObject('stars', ['destinationStar', 'enemyFleets', 'fleetPower'], true) ?? 0;
}

function getStatEnemyTotalDefenceRemainingAllTime() {
    return 'N/A';
}

function getStatApFromStarVoyage() {
    return apAnticipatedThisRun;
}

//setters
function setStatHydrogen(valueToAdd) {
    allTimeTotalHydrogen += valueToAdd;
}

function setStatHydrogenThisRun(valueToAdd) {
    hydrogenThisRun += valueToAdd;
}

function setStatHelium(valueToAdd) {
    allTimeTotalHelium += valueToAdd;
}

function setStatHeliumThisRun(valueToAdd) {
    heliumThisRun += valueToAdd;
}

function setStatCarbon(valueToAdd) {
    allTimeTotalCarbon += valueToAdd;
}

function setStatCarbonThisRun(valueToAdd) {
    carbonThisRun += valueToAdd;
}

function setStatNeon(valueToAdd) {
    allTimeTotalNeon += valueToAdd;
}

function setStatNeonThisRun(valueToAdd) {
    neonThisRun += valueToAdd;
}

function setStatOxygen(valueToAdd) {
    allTimeTotalOxygen += valueToAdd;
}

function setStatOxygenThisRun(valueToAdd) {
    oxygenThisRun += valueToAdd;
}

function setStatSodium(valueToAdd) {
    allTimeTotalSodium += valueToAdd;
}

function setStatSodiumThisRun(valueToAdd) {
    sodiumThisRun += valueToAdd;
}

function setStatSilicon(valueToAdd) {
    allTimeTotalSilicon += valueToAdd;
}

function setStatSiliconThisRun(valueToAdd) {
    siliconThisRun += valueToAdd;
}

function setStatIron(valueToAdd) {
    allTimeTotalIron += valueToAdd;
}

function setStatIronThisRun(valueToAdd) {
    ironThisRun += valueToAdd;
}

function setStatDiesel(valueToAdd) {
    allTimeTotalDiesel += valueToAdd;
}

function setStatDieselThisRun(valueToAdd) {
    dieselThisRun += valueToAdd;
}

function setStatGlass(valueToAdd) {
    allTimeTotalGlass += valueToAdd;
}

function setStatGlassThisRun(valueToAdd) {
    glassThisRun += valueToAdd;
}

function setStatSteel(valueToAdd) {
    allTimeTotalSteel += valueToAdd;
}

function setStatSteelThisRun(valueToAdd) {
    steelThisRun += valueToAdd;
}

function setStatConcrete(valueToAdd) {
    allTimeTotalConcrete += valueToAdd;
}

function setStatConcreteThisRun(valueToAdd) {
    concreteThisRun += valueToAdd;
}

function setStatWater(valueToAdd) {
    if (getTechUnlockedArray().includes('compounds')) {
        allTimeTotalWater += valueToAdd;
    }
}

function setStatWaterThisRun(valueToAdd) {
    if (getTechUnlockedArray().includes('compounds')) {
        waterThisRun += valueToAdd;
    }
}

function setStatTitanium(valueToAdd) {
    allTimeTotalTitanium += valueToAdd;
}

function setStatTitaniumThisRun(valueToAdd) {
    titaniumThisRun += valueToAdd;
}

function setStatResearchPoints(valueToAdd) {
    allTimeTotalResearchPoints += valueToAdd;
}

function setStatResearchPointsThisRun(valueToAdd) {
    researchPointsThisRun += valueToAdd;
}

function setStatScienceKits(valueToAdd) {
    allTimeTotalScienceKits += valueToAdd;
}

function setStatScienceKitsThisRun(valueToAdd) {
    scienceKitsThisRun += valueToAdd;
}

function setStatScienceClubs(valueToAdd) {
    allTimeTotalScienceClubs += valueToAdd;
}

function setStatScienceClubsThisRun(valueToAdd) {
    scienceClubsThisRun += valueToAdd;
}

function setStatScienceLabs(valueToAdd) {
    allTimeTotalScienceLabs += valueToAdd;
}

function setStatScienceLabsThisRun(valueToAdd) {
    scienceLabsThisRun += valueToAdd;
}

function setStatAntimatter(valueToAdd) {
    allTimeTotalAntimatterMined += valueToAdd;
}

function setStatAntimatterThisRun(valueToAdd) {
    antimatterMinedThisRun += valueToAdd;
}

function setStatApAnticipated(valueToAdd) {
    apAnticipatedThisRun += valueToAdd;
}

function setStatNewsTickerPrizesCollected(valueToAdd) {
    totalNewsTickerPrizesCollected += valueToAdd;
}

function setStatTotalApGain(valueToAdd) {
    allTimeTotalApGain += valueToAdd;
}

function setStatStarStudyRange(value) {
    starStudyRange = value;
}

function setStatStarShipTravelDistance(value) {
    starShipTravelDistance = value;
}

function setStatTotalLegendaryAsteroidsDiscovered(valueToAdd) {
    allTimeTotalLegendaryAsteroidsDiscovered += valueToAdd;
}

function setStatTotalAsteroidsDiscovered(valueToAdd) {
    allTimeTotalAsteroidsDiscovered += valueToAdd;
}

function setStatTotalRocketsLaunched(valueToAdd) {
    allTimeTotalRocketsLaunched += valueToAdd;
}

function setStatStarShipLaunched(valueToAdd) {
    allTimeTotalStarShipsLaunched += valueToAdd;
}

function setStatTimesTripped(valueToAdd) {
    allTimesTripped += valueToAdd;
}

function setStatTimesTrippedThisRun(valueToAdd) {
    timesTrippedThisRun += valueToAdd;
}

function setStatBasicPowerPlants(valueToAdd) {
    allTimeBasicPowerPlantsBuilt += valueToAdd;
}

function setStatBasicPowerPlantsThisRun(valueToAdd) {
    basicPowerPlantsBuiltThisRun += valueToAdd;
}

function setStatAdvancedPowerPlants(valueToAdd) {
    allTimeAdvancedPowerPlantsBuilt += valueToAdd;
}

function setStatAdvancedPowerPlantsThisRun(valueToAdd) {
    advancedPowerPlantsBuiltThisRun += valueToAdd;
}

function setStatSolarPowerPlants(valueToAdd) {
    allTimeSolarPowerPlantsBuilt += valueToAdd;
}

function setStatSolarPowerPlantsThisRun(valueToAdd) {
    solarPowerPlantsBuiltThisRun += valueToAdd;
}

function setStatSodiumIonBatteries(valueToAdd) {
    allTimeSodiumIonBatteriesBuilt += valueToAdd;
}

function setStatSodiumIonBatteriesThisRun(valueToAdd) {
    sodiumIonBatteriesBuiltThisRun += valueToAdd;
}

function setStatBattery2(valueToAdd) {
    allTimeBattery2Built += valueToAdd;
}

function setStatBattery2ThisRun(valueToAdd) {
    battery2BuiltThisRun += valueToAdd;
}

function setStatBattery3(valueToAdd) {
    allTimeBattery3Built += valueToAdd;
}

function setStatBattery3ThisRun(valueToAdd) {
    battery3BuiltThisRun += valueToAdd;
}

function setStatAsteroidsMined(valueToAdd) {
    allTimeTotalAsteroidsMined += valueToAdd;
}

function setStatAsteroidsMinedThisRun(valueToAdd) {
    asteroidsMinedThisRun += valueToAdd;
}

export function setEnemyFleetPowerAtBattleStart(value) {
    enemyFleetPowerAtBattleStart = Number(value) || 0;
}

export function getEnemyFleetPowerAtBattleStart() {
    return enemyFleetPowerAtBattleStart;
}

export function getActivatedWackyNewsEffectsArray() {
    return activatedWackyNewsEffectsArray;
}

export function setCollectedPrecipitationQuantityThisRun(value) {
    collectedPrecipitationQuantityThisRun = value;
}

export function getCollectedPrecipitationQuantityThisRun() {
    return collectedPrecipitationQuantityThisRun;
}

export function setActivatedWackyNewsEffectsArray(value, extra = null) {
    if (!getActivatedWackyNewsEffectsArray().includes(value)) {
        activatedWackyNewsEffectsArray.push(value);

        if (extra !== null) {
            setFeedbackGiven(extra);
            //console.log('FeedBack Given: ' + extra);
        }
    }
}

export function getFeedbackGiven() {
    return feedbackGiven;
}

export function setFeedbackGiven(value) {
    feedbackGiven = value;
}

export function getFeedbackCanBeRequested() {
    return feedbackCanBeRequested;
}

export function setFeedbackCanBeRequested(value) {
    feedbackCanBeRequested = value;
}

export function getEventsTriggeredOnce() {
    return eventsTriggeredOnce;
}

export function setEventsTriggeredOnce(value) {
    eventsTriggeredOnce = value;
}

export function setFeedbackContent(value) {
    feedbackContent = value;
}

export function getFeedbackContent() {
    return feedbackContent;
}

export function getAlreadySeenNewsTickerArray() {
    return alreadySeenNewsTickerArray;
}

export function setAlreadySeenNewsTickerArray(value) {
    alreadySeenNewsTickerArray.push(value);
}

export function setGameStartTime() {
    gameStartTimeStamp = Date.now();
}

export function setRunStartTime() {
    runStartTimeStamp = Date.now();
}

export function getGameStartTime() {
    return gameStartTimeStamp;
}

export function getRunStartTime() {
    return runStartTimeStamp;
}

export function setGameActiveCountTime(value, offlineValue) {
    const current = gameActiveCountTime;

    gameActiveCountTime = [
        value !== null ? value : current[0],
        offlineValue !== null ? offlineValue : current[1]
    ];
}

export function getGameActiveCountTime() {
    return gameActiveCountTime;
}

export function getSettledStars() {
    return settledStars;
}

export function setSettledStars(value) {
    settledStars.push(value);
}

export function getPlayerPhilosophy() {
    return philosophy;
}

export function setPlayerPhilosophy(value) {
    philosophy = value;
}

export function getMiaplacidusEndgameStoryShown() {
    return miaplacidusEndgameStoryShown;
}

export function getGalacticPointsSpent() {
    return galacticPointsSpent;
}

export function setGalacticPointsSpent(value) {
    galacticPointsSpent = typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function getAllTimeRipTelemetryDataEarned() {
    return allTimeRipTelemetryDataEarned;
}

export function setAllTimeRipTelemetryDataEarned(value) {
    allTimeRipTelemetryDataEarned = typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function addToAllTimeRipTelemetryDataEarned(amount) {
    const add = Number(amount);
    if (Number.isFinite(add) && add > 0) {
        allTimeRipTelemetryDataEarned += add;
        ripTelemetryDataEarnedThisRun += add;
    }
}

export function getCosmicRipNearSpaceScannerArraySectorNames() {
    return cosmicRipNearSpaceScannerArraySectorNames;
}

export function setCosmicRipNearSpaceScannerArraySectorNames(value) {
    cosmicRipNearSpaceScannerArraySectorNames = value;
}

export function getCosmicRipNearSpaceScannerArrayOneSectorState() {
    return cosmicRipNearSpaceScannerArrayOneSectorState;
}

export function setCosmicRipNearSpaceScannerArrayOneSectorState(value) {
    cosmicRipNearSpaceScannerArrayOneSectorState = value === true;
}

export function getCosmicRipFoundSectorIndexForZoom() {
    return cosmicRipFoundSectorIndexForZoom;
}

export function setCosmicRipFoundSectorIndexForZoom(value) {
    cosmicRipFoundSectorIndexForZoom = typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function getCosmicRipNearSpaceScannerArrayCanvasEl() {
    return cosmicRipNearSpaceScannerArrayCanvasEl;
}

export function setCosmicRipNearSpaceScannerArrayCanvasEl(value) {
    cosmicRipNearSpaceScannerArrayCanvasEl = value;
}

export function getCosmicRipNearSpaceScannerArrayGridOverlayEl() {
    return cosmicRipNearSpaceScannerArrayGridOverlayEl;
}

export function setCosmicRipNearSpaceScannerArrayGridOverlayEl(value) {
    cosmicRipNearSpaceScannerArrayGridOverlayEl = value;
}

export function getCosmicRipNearSpaceScannerArrayFogOverlayEl() {
    return cosmicRipNearSpaceScannerArrayFogOverlayEl;
}

export function setCosmicRipNearSpaceScannerArrayFogOverlayEl(value) {
    cosmicRipNearSpaceScannerArrayFogOverlayEl = value;
}

export function getCosmicRipNearSpaceScannerArrayInteractiveOverlayEl() {
    return cosmicRipNearSpaceScannerArrayInteractiveOverlayEl;
}

export function setCosmicRipNearSpaceScannerArrayInteractiveOverlayEl(value) {
    cosmicRipNearSpaceScannerArrayInteractiveOverlayEl = value;
}

export function getCosmicRipNearSpaceScannerArrayScanLabelOverlayEl() {
    return cosmicRipNearSpaceScannerArrayScanLabelOverlayEl;
}

export function setCosmicRipNearSpaceScannerArrayScanLabelOverlayEl(value) {
    cosmicRipNearSpaceScannerArrayScanLabelOverlayEl = value;
}

export function getCosmicRipNearSpaceScannerArrayScanLabelEls() {
    return cosmicRipNearSpaceScannerArrayScanLabelEls;
}

export function setCosmicRipNearSpaceScannerArrayScanLabelEls(value) {
    cosmicRipNearSpaceScannerArrayScanLabelEls = value;
}

export function getCosmicRipNearSpaceScannerArrayFogEls() {
    return cosmicRipNearSpaceScannerArrayFogEls;
}

export function setCosmicRipNearSpaceScannerArrayFogEls(value) {
    cosmicRipNearSpaceScannerArrayFogEls = value;
}

export function getCosmicRipNearSpaceScannerArrayLabelFadeOverlayEl() {
    return cosmicRipNearSpaceScannerArrayLabelFadeOverlayEl;
}

export function setCosmicRipNearSpaceScannerArrayLabelFadeOverlayEl(value) {
    cosmicRipNearSpaceScannerArrayLabelFadeOverlayEl = value;
}

export function getCosmicRipNearSpaceScannerArrayZoomCanvasEl() {
    return cosmicRipNearSpaceScannerArrayZoomCanvasEl;
}

export function setCosmicRipNearSpaceScannerArrayZoomCanvasEl(value) {
    cosmicRipNearSpaceScannerArrayZoomCanvasEl = value;
}

export function getCosmicRipLocatedModalShown() {
    return cosmicRipLocatedModalShown;
}

export function setCosmicRipLocatedModalShown(value) {
    cosmicRipLocatedModalShown = value === true;
}

export function getCosmicRipOneSectorStateReady() {
    return cosmicRipOneSectorStateReady;
}

export function setCosmicRipOneSectorStateReady(value) {
    cosmicRipOneSectorStateReady = value === true;
}

export function getCosmicRipPrevRipFound() {
    return cosmicRipPrevRipFound;
}

export function setCosmicRipPrevRipFound(value) {
    cosmicRipPrevRipFound = value;
}

export function getCosmicRipScanResultsBySectorIndex() {
    return cosmicRipScanResultsBySectorIndex;
}

export function setCosmicRipScanResultsBySectorIndex(value) {
    cosmicRipScanResultsBySectorIndex = value;
}

export function getCosmicRipGpForUi() {
    return cosmicRipGpForUi;
}

export function setCosmicRipGpForUi(value) {
    cosmicRipGpForUi = typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function getCosmicRipScannerRestoredForUi() {
    return cosmicRipScannerRestoredForUi;
}

export function setCosmicRipScannerRestoredForUi(value) {
    cosmicRipScannerRestoredForUi = value === true;
}

export function getCosmicRipRipSpriteImgCache() {
    return cosmicRipRipSpriteImgCache;
}

export function setCosmicRipRipSpriteImgCache(value) {
    cosmicRipRipSpriteImgCache = value;
}

export function getCosmicRipNearSpaceScannerArrayDrawCanvas() {
    return cosmicRipNearSpaceScannerArrayDrawCanvas;
}

export function setCosmicRipNearSpaceScannerArrayDrawCanvas(value) {
    cosmicRipNearSpaceScannerArrayDrawCanvas = value;
}

export function getCosmicRipNearSpaceScannerArrayResizeAttached() {
    return cosmicRipNearSpaceScannerArrayResizeAttached;
}

export function setCosmicRipNearSpaceScannerArrayResizeAttached(value) {
    cosmicRipNearSpaceScannerArrayResizeAttached = value === true;
}

export function getCosmicRipPrevScanResultsBySectorIndex() {
    return cosmicRipPrevScanResultsBySectorIndex;
}

export function setCosmicRipPrevScanResultsBySectorIndex(value) {
    cosmicRipPrevScanResultsBySectorIndex = value;
}

export function getCosmicRipRipFoundUiSequenceStarted() {
    return cosmicRipRipFoundUiSequenceStarted;
}

export function setCosmicRipRipFoundUiSequenceStarted(value) {
    cosmicRipRipFoundUiSequenceStarted = value === true;
}

export function getCosmicRipTechResearchTimers() {
    return cosmicRipTechResearchTimers;
}

export function setCosmicRipTechResearchTimers(value) {
    cosmicRipTechResearchTimers = value || {};
}

export function getCosmicRipTechTimeLeftUntilResearchFinishes() {
    return cosmicRipTechTimeLeftUntilResearchFinishes;
}

export function setCosmicRipTechTimeLeftUntilResearchFinishes(value) {
    cosmicRipTechTimeLeftUntilResearchFinishes = value || {};
}

export function getCosmicRipTechResearchDurations() {
    return cosmicRipTechResearchDurations;
}

export function setCosmicRipTechResearchDurations(value) {
    cosmicRipTechResearchDurations = value || {};
}

export function getCosmicRipTechCurrentResearchProgress() {
    return cosmicRipTechCurrentResearchProgress;
}

export function setCosmicRipTechCurrentResearchProgress(value) {
    cosmicRipTechCurrentResearchProgress = typeof value === 'number' ? value : 0;
}

export function setMiaplacidusEndgameStoryShown(value) {
    miaplacidusEndgameStoryShown = value;
}

export function getVariableDebuggerAndCheats() {
    if (typeof window === 'undefined') {
        return false;
    }

    if (window.__VARIABLE_DEBUGGER_AND_CHEATS__) {
        return true;
    }

    return window.__VARIABLE_DEBUGGER_AND_CHEATS;
}

export function setVariableDebuggerAndCheats(value) {
    if (typeof window !== 'undefined') {
        window.__VARIABLE_DEBUGGER_AND_CHEATS__ = !!value;
    }
}

export function getMinimumBlackHoleChargeTime() {
    return MINIMUM_BLACK_HOLE_CHARGE_TIME;
}

export function getWheelForceSpecial() {
    return wheelForceSpecial;
}

export function setWheelForceSpecial(value) {
    wheelForceSpecial = value === 'true' || value === true;
}

export function getCasinoGame4AlwaysWin() {
    return casinoGame4AlwaysWin;
}

export function setCasinoGame4AlwaysWin(value) {
    casinoGame4AlwaysWin = value === 'true' || value === true;
}

export function getCasinoGame5VoidSeerAlwaysMatch() {
    return casinoGame5VoidSeerAlwaysMatch;
}

export function setCasinoGame5VoidSeerAlwaysMatch(value) {
    casinoGame5VoidSeerAlwaysMatch = value === 'true' || value === true;
}

function incrementRandomEventTriggerCounts(eventId) {
    const id = String(eventId || '').trim();
    if (!id) return;

    const prevThisRun = Number(randomEventTriggerCountsThisRun?.[id]) || 0;
    const prevAllTime = Number(randomEventTriggerCountsAllTime?.[id]) || 0;

    randomEventTriggerCountsThisRun = {
        ...(randomEventTriggerCountsThisRun || {}),
        [id]: prevThisRun + 1,
    };
    randomEventTriggerCountsAllTime = {
        ...(randomEventTriggerCountsAllTime || {}),
        [id]: prevAllTime + 1,
    };
}

export function recordRandomEventTriggered(eventId) {
    incrementRandomEventTriggerCounts(eventId);
}

function getRandomEventCountThisRun(eventId) {
    const id = String(eventId || '').trim();
    return Number(randomEventTriggerCountsThisRun?.[id]) || 0;
}

function getRandomEventCountAllTime(eventId) {
    const id = String(eventId || '').trim();
    return Number(randomEventTriggerCountsAllTime?.[id]) || 0;
}

//image urls----------------------------------------------------------------------------------------------------------------------

const IMAGE_URLS = {
    'resources': `
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡾⠋⠙⢷⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡿⠁⠀⠀⠈⢿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢀⣀⣤⣤⣀⣀⡀⠀⢸⠃⠀⠀⠀⠀⠘⡇⠀⢀⣀⣀⣤⣤⣀⡀⠀⠀⠀
⠀⠀⠀⢸⠉⠀⠀⠉⠉⠛⠻⣿⣤⣀⠀⠀⣀⣤⣿⠟⠛⠉⠉⠁⠈⠉⡇⠀⠀⠀
⠀⠀⠀⠘⣧⡀⠀⠀⠀⠀⠀⣇⣀⣽⠿⠿⣯⣀⣸⠀⠀⠀⠀⠀⢀⣼⠃⠀⠀⠀
⠀⠀⠀⠀⠈⠻⣦⡀⠀⣠⣴⡟⠉⠀⢀⡀⠀⠉⢻⣦⣄⠀⢀⣴⠟⠁⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢈⣿⣿⣉⠀⡇⠀⢰⣿⣿⠆⠀⢸⠀⣉⣿⣿⡁⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⣴⠟⠁⠀⠙⠻⣧⣀⠀⠉⠉⠀⣀⣼⠟⠋⠀⠈⠻⣦⡀⠀⠀⠀⠀
⠀⠀⠀⢠⡟⠁⠀⠀⠀⠀⠀⡏⠉⣻⣶⣶⣟⠉⢹⠀⠀⠀⠀⠀⠈⢻⡄⠀⠀⠀
⠀⠀⠀⢸⣀⠀⠀⣀⣀⣤⣴⣿⠛⠉⠀⠀⠉⠛⣿⣦⣤⣀⣀⠀⠀⣀⡇⠀⠀⠀
⠀⠀⠀⠈⠉⠛⠛⠉⠉⠁⠀⢸⡄⠀⠀⠀⠀⢠⡇⠀⠈⠉⠉⠛⠛⠉⠁⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣷⡀⠀⠀⢀⣾⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢷⣄⣠⡾⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
`,

    'compounds': `
⠀⠀⠀⠀⠀⠀⠀⢀⣠⣶⣿⣿⣿⣷⣦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⠿⠛⠋⠉⠉⠙⠛⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣿⡿⠋⣠⣴⣾⣿⣿⣿⣿⣿⣶⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠈⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⠟⢋⣁⣀⣀⣀⡀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⣴⣿⣿⣿⣿⣿⣿⣷⡄⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣾⣿⣿⣿⣿⣿⣿⣿⣿⠃⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⡄⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀
⠀⠀⠀⠀⢠⣦⠈⢿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠻⣿⣿⣿⣿⣿⣿⡿⠃⠀⠀⠀⠀
⠀⠀⠀⠀⣿⣿⣧⡀⠻⢿⣿⣿⣿⣿⣿⣿⣿⣦⣈⠉⠛⠛⠋⠁⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣿⣿⣿⣿⣦⣄⠉⠛⠿⠿⠿⠿⠟⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣷⣶⣶⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠈⠛⠿⣿⣿⣿⡿⠟⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
`,
    'energy': `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⡴⠂
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣾⡿⠋⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣶⣿⣿⠟⠋⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣾⣿⣿⣿⡟⠁⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠋⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣴⣿⣿⣿⣿⣿⡿⠋⠁⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣴⣿⣿⣿⣿⣿⣿⠟⠉⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣴⣿⣿⣿⣿⣿⣿⠿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢀⣠⣶⣿⣿⣿⣿⣿⣿⡿⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣠⣶⣿⣿⣿⣿⣿⣿⣿⣿⣧⣤⣤⣤⣤⡤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣿⣿⣿⣿⣿⣿⠿⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢀⣴⣿⣿⣿⣿⠿⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣠⣴⣿⣿⠿⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⣠⣾⡿⠟⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠠⠞⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`,
    'research': `
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣾⣿⣷⠄⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣷⣄⠙⠿⠏⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠻⣿⣿⣿⣿⡦⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣾⣷⣦⡈⠛⢿⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⣿⣿⣿⣿⣿⣶⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣄⠙⠿⣿⣿⣿⣿⣿⣿⡿⠂⢀⣀⣀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣿⣿⣷⣦⡈⠛⢿⣿⣿⡿⠀⣼⠟⠉⠙⢷⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣠⣾⣿⣿⣿⣿⣿⠋⠀⠀⠉⠻⣇⠀⣿⡀⠀⢀⣼⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀⠀⠀⣿⣦⣈⠙⠛⠛⠁⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⡆⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀
⠀⠀⠀⠀⣀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⣠⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀
⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀
⠀⠀⠀⠀⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠃⠀⠀⠀⠀`,
    'galactic': `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⡀⠒⠒⠦⣄⡀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢀⣤⣶⡾⠿⠿⠿⠿⣿⣿⣶⣦⣄⠙⠷⣤⡀⠀⠀⠀⠀
⠀⠀⠀⣠⡾⠛⠉⠀⠀⠀⠀⠀⠀⠀⠈⠙⠻⣿⣷⣄⠘⢿⡄⠀⠀⠀
⠀⢀⡾⠋⠀⠀⠀⠀⠀⠀⠀⠀⠐⠂⠠⢄⡀⠈⢿⣿⣧⠈⢿⡄⠀⠀
⢀⠏⠀⠀⠀⢀⠄⣀⣴⣾⠿⠛⠛⠛⠷⣦⡙⢦⠀⢻⣿⡆⠘⡇⠀⠀
⠀⠀⠀⠀⡐⢁⣴⡿⠋⢀⠠⣠⠤⠒⠲⡜⣧⢸⠄⢸⣿⡇⠀⡇⠀⠀
⠀⠀⠀⡼⠀⣾⡿⠁⣠⢃⡞⢁⢔⣆⠔⣰⠏⡼⠀⣸⣿⠃⢸⠃⠀⠀
⠀⠀⢰⡇⢸⣿⡇⠀⡇⢸⡇⣇⣀⣠⠔⠫⠊⠀⣰⣿⠏⡠⠃⠀⠀⢀
⠀⠀⢸⡇⠸⣿⣷⠀⢳⡈⢿⣦⣀⣀⣀⣠⣴⣾⠟⠁⠀⠀⠀⠀⢀⡎
⠀⠀⠘⣷⠀⢻⣿⣧⠀⠙⠢⠌⢉⣛⠛⠋⠉⠀⠀⠀⠀⠀⠀⣠⠎⠀
⠀⠀⠀⠹⣧⡀⠻⣿⣷⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⡾⠃⠀⠀
⠀⠀⠀⠀⠈⠻⣤⡈⠻⢿⣿⣷⣦⣤⣤⣤⣤⣤⣴⡾⠛⠉⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠈⠙⠶⢤⣈⣉⠛⠛⠛⠛⠋⠉⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`,
    'interstellar': `⠀⠀⠀⡖⠐⠖⠂⡀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢰⣤⡗⣬⣞⣭⢉⢣⢦⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⣮⣫⣴⢅⣧⠺⠾⡋⣌⣧⣵⣄⠀⠀⠀⠀⠀⠀⠀
⠀⣏⣯⣋⡼⡟⡂⣦⣓⡻⣍⢻⣝⡂⡀⢀⣀⡴⠂⠀
⠀⢭⢾⣛⡷⣳⣟⠭⡌⠱⡖⣇⣬⢖⡯⣣⠋⠀⠀⠀
⠀⠸⣻⣾⣿⣩⡧⣎⢼⡾⣛⠷⣺⢩⡵⠋⡠⠀⠀⠀
⠀⠀⣳⣭⣾⣿⣿⣷⣶⣓⣩⢇⣼⣏⣀⡴⠄⠲⡀⠀
⠀⠀ ⢿⢿⣿⣿⡝⡾⣿⢺⠾⢯⡭⣇⣬⡨⠔⠑⠀
⠀  ⠹⢾⣿⣿⣿⣿⣟⣿⣧⢼⣫⢶⠀⢠⣴⡂⡅
⠀⠀⠀ ⣸⡟⠿⢫⣿⣿⣿⡽⡻⣟⢞⠥⣷⣷⠀⢀
⠀⠀ ⡿⣿⡔⡦⢾⠍⠣⠏⣻⢿⣯⡞⣋⢰⠎⠌⠒
⠀⠀ ⠃⢹⣿⣧⣴⡂⠀⠀⠈⠙⠋⠈⠙⠉⠚⠉⠀
⠀⠀ ⠀⢸⢿⢷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀  ⠰⢸⢸⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀  ⠀⠸⣴⣰⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
  ⡀⢀⣘⣀⣃⢀`,

    'space mining': `⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢸⣿⣿⣶⣦⣄⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢈⣿⣿⣿⣿⣿⣿⣾⡄⠀⠀⠀⠀⣼⣿⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠙⢿⣿⣿⡟⠛⠛⠿⡄⠀⠀⢰⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠙⢿⣧⠀⠀⠀⠀⠀⣠⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠉⠂⠀⢀⣴⣿⣿⣌⠛⠿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢀⣠⣼⠻⣿⣿⣿⣷⣤⡈⠻⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢠⣴⣶⣿⣿⣿⣿⣦⡘⢿⣿⣿⣿⣿⣦⣄⢸⣦⣄⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⣄⠙⣿⣿⣿⣿⣿⣿⠿⠛⠂⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠙⠿⠿⠿⠿⠿⠛⠓⠈⠻⣿⡿⠋⠀⢴⠆⠉⠉⣀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⡿⠁⢼⠇⠀⠰⡷⠄⠉⢁⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠃⢰⡄⠀⠿⠂⣠⣶⣿⣿⣇⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠲⠀⢰⣿⣿⣿⣿⣿⣆⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠿⣿⣿⣿⣿⡀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠛⠃⠀`,
    'cosmic rip': `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀
⠀⠀⠀⡀⡀⠀⠀⠀⠀⢀⢀⢴⠂⠁⠘⢣⡆⡀⠉⠛⠂⡐⠠⠀⠀⡀⠀⠒⠋⠉⠁⠀⠀
⠀⠀⠀⠀⠈⠁⠐⠠⠀⠐⠆⠐⣀⣿⣹⣥⣸⣷⣶⣶⠤⢀⠠⢂⠁⠀⣠⡀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⠀⠤⢀⠐⣬⠃⠀⠠⠻⡟⠛⠀⠛⠛⠋⠀⢁⠀⠀⣠⣦⣿⣿⣦⡀⠀⠀⠀
⠀⠀⠀⢠⣴⣴⣾⣿⡶⡏⠘⠂⠀⡀⠀⠈⠀⠀⠀⠀⢠⡄⢂⣹⣿⣿⣿⣿⣿⡷⠀⠀⠀
⠀⠀⢠⣿⣿⣿⣿⣿⢇⠃⠀⠁⠈⠈⠂⠀⠀⠠⡄⠀⠀⠃⠀⠐⠂⠉⣼⣿⣿⣿⣿⡄⠀
⠀⣶⣿⣿⣿⣿⣿⣿⡉⠀⠀⠀⡀⢐⣈⠀⠀⠄⠀⠀⠀⠀⠀⠂⠘⣶⣽⢻⣿⣿⣿⣿⠀
⣤⣿⣿⣿⣿⣿⣿⡀⠂⠀⠀⠀⣨⣮⣟⣷⣦⣀⢀⠀⠀⠀⠀⠀⠀⢈⣽⣿⣿⣿⣿⣿⡆
⣿⣿⣿⢁⣿⣿⣻⠃⠀⠀⠀⠀⢻⣿⣿⣿⣿⣿⣯⡁⠀⠀⠀⠀⢀⡈⣿⣿⣿⣿⣿⣿⣷
⣿⣿⣿⣿⣿⣿⣿⣄⠀⠀⠀⠀⠀⠛⣻⣿⣿⣿⣿⣇⠀⠈⠀⠀⠀⠁⠈⢯⣹⣿⣯⣿⡏
⠘⣹⣿⣿⣿⣿⣿⣯⡄⠀⠀⠀⠀⠘⣫⣿⡟⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀⣤⣹⣿⣿⣿⠃
⠀⣿⢿⢉⠹⣿⢿⣟⢳⣀⡀⠀⠀⠀⠀⣟⠀⠜⠛⠁⠀⠀⠀⠀⠀⠀⠀⢽⣿⡿⠿⡿⠀
⠀⠀⠈⠟⠀⢸⣇⣿⣿⣿⢇⠀⠀⠀⠀⡀⠀⠨⡄⠀⠀⢀⠀⠀⠄⢀⣴⣦⠘⠃⠤⠃⠀
⠀⠀⠀⠀⢺⣿⣿⣿⣿⣿⡎⠀⠀⠀⡘⠁⠀⠀⠈⠀⠈⠘⠀⠀⠀⡀⢹⣿⣿⡶⠀⠀⠀
⠀⠀⠀⠀⠀⠹⣿⣿⠟⠋⠀⠔⢀⠌⢀⠀⠀⠀⠀⠀⠡⣀⠀⡠⠌⠡⠯⡽⠏⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠄⠃⠀⢄⢻⡿⣾⣷⣇⣀⣨⠓⠬⣀⠄⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⡀⠤⠂⠀⠐⠳⠿⠿⠿⠄⠋⠼⠍⠿⠟⠋⠀⠀⠁⠒⠦⠤⣀⣀⣀⠀
⠀⠀⠤⠤⠐⠂⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`,
    'settings': `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⣿⣿⣿⡀⠀⠀⠀⠀⣠⣷⣦⣄⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣶⣤⣤⣶⣿⣿⣿⣿⠏⠀⠀⠀⠀⠀⠀
⠀⠀⠀⣠⣶⣤⣀⣀⣠⣼⣿⠿⠛⠋⠉⠉⠙⠛⠿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀
⠀⠀⣰⣿⣿⣿⣿⣿⡿⠋⣡⡴⠞⠛⠋⠙⠛⠳⢦⣄⠙⢿⣷⣀⠀⠀⠀⢀⠀⠀
⠀⠀⠈⠙⢿⣿⣿⠟⢠⡾⠁⠀⠀⠀⠀⠀⠀⠀⠀⠈⢷⡄⠻⣿⣿⣿⣿⣿⡆⠀
⠀⠀⠀⠀⠈⣿⡟⠀⣾⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⡀⢻⣿⣿⣿⣿⣷⠀
⠀⠀⠀⢀⣼⣿⡇⢸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡇⢸⣿⡿⠋⠀⠀⠀
⠀⢶⣾⣿⣿⣿⣧⠀⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⠁⣸⣿⡀⠀⠀⠀⠀
⠀⠸⣿⣿⣿⣿⣿⣆⠘⣧⡀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣼⠃⣰⣿⣿⣷⣄⠀⠀⠀
⠀⠀⠉⠀⠀⠀⠙⢿⣷⣌⠛⠶⣤⣀⣀⣀⣀⣤⡴⠛⣡⣾⣿⣿⣿⣿⣿⡟⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣷⣦⣄⣉⣉⣉⣉⣠⣴⣾⡿⠛⠋⠛⠻⢿⠏⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣠⣿⣿⣿⣿⡿⠿⠿⢿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠈⠛⠿⣿⠏⠀⠀⠀⠀⠙⣿⣿⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠛⠋⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`
}

export function populateVariableDebugger() {
    const debugTextAreaContainer = document.getElementById('debugTextAreaContainer');
    const variableDebuggerSearchInput = document.getElementById('variableDebuggerSearch');
    const debugContent = debugTextAreaContainer?.closest?.('.debug-content') ?? null;
    const variableDebuggerSearchBar = variableDebuggerSearchInput?.closest?.('.variable-debugger-search-bar') ?? null;
    const researchAutoBuyerConfig = getResourceDataObject('research', ['upgrades', 'autoBuyer']);
    const philosophyTechData = getResourceDataObject('philosophyRepeatableTechs');
    const cosmicRipData = getResourceDataObject('cosmicRip');
    
    const variables = [
        { label: "", value: "" },
        { label: "Game Settings:", value: "" },
        { label: "", value: "" },

        { label: "gamestate", value: gameState },
        { label: "gameStartTimeStamp", value: gameStartTimeStamp },
        { label: "runStartTimeStamp", value: runStartTimeStamp },        
        { label: "alreadySeenNewsTickerArray", value: alreadySeenNewsTickerArray },
        { label: "currencySymbol", value: currencySymbol },
        { label: "currentTheme", value: currentTheme },
        { label: "sfx", value: sfx },
        { label: "backgroundAudio", value: backgroundAudio },
        { label: "saveExportCloudFlag", value: saveExportCloudFlag },
        { label: "autoSaveToggle", value: autoSaveToggle },
        { label: "newsTickerSetting", value: newsTickerSetting },
        { label: "weatherEffectSettingToggle", value: weatherEffectSettingToggle },
        { label: "notificationsToggle", value: notificationsToggle },
        { label: "saveName", value: saveName },
        { label: "lastSavedTimeStamp", value: lastSavedTimeStamp },
        { label: "autoSaveFrequency", value: autoSaveFrequency },
        { label: "savedYetSinceOpeningSaveDialogue", value: savedYetSinceOpeningSaveDialogue },

        { label: "", value: "" },
        { label: "Run:", value: "" },
        { label: "", value: "" },

        { label: "rebirthPossible", value: rebirthPossible },
        { label: "runNumber", value: runNumber },
        { label: "apAwardedThisRun", value: apAwardedThisRun },
        { label: "settledStars", value: settledStars },
        { label: "currentStarSystem", value: currentStarSystem },

        { label: "", value: "" },
        { label: "Resources / Compounds / AutoBuyers:", value: "" },
        { label: "", value: "" },

        { label: "saleResourcePreviews", value: saleResourcePreviews },
        { label: "saleCompoundPreviews", value: saleCompoundPreviews },
        { label: "createCompoundPreviews", value: createCompoundPreviews },
        { label: "constituentPartsObject", value: constituentPartsObject },
        { label: "itemsToDeduct", value: itemsToDeduct },
        { label: "itemsToIncreasePrice", value: itemsToIncreasePrice },
        { label: "unlockedResourcesArray", value: unlockedResourcesArray },
        { label: "unlockedCompoundsArray", value: unlockedCompoundsArray },
        { label: "temporaryCoreTechsRowsRepo", value: temporaryCoreTechRowsRepo },
        { label: "canAffordDeferred", value: canAffordDeferred },
        { label: "originalFrameNumbers", value: originalFrameNumbers },

        { label: "", value: "" },
        { label: "Research AutoBuyer:", value: "" },
        { label: "", value: "" },

        { label: "researchAutoBuyerActive", value: researchAutoBuyerConfig?.active ?? null },
        { label: "researchAutoBuyerEnabled", value: researchAutoBuyerConfig?.enabled ?? null },
        { label: "researchAutoBuyerConfig", value: researchAutoBuyerConfig },

        { label: "", value: "" },
        { label: "Tech:", value: "" },
        { label: "", value: "" },

        { label: "techRenderCounter", value: techRenderCounter },
        { label: "techUnlockedArray", value: techUnlockedArray },
        { label: "revealedTechArray", value: revealedTechArray },
        { label: "upcomingTechArray", value: upcomingTechArray },
        { label: "tempRowValue", value: tempRowValue },

        { label: "", value: "" },
        { label: "Energy:", value: "" },
        { label: "", value: "" },

        { label: "losingEnergy", value: losingEnergy },
        { label: "powerOnOff", value: powerOnOff },
        { label: "trippedStatus", value: trippedStatus },

        { label: "", value: "" },
        { label: "Statistics:", value: "" },
        { label: "", value: "" },

        { label: "allTimeTotalHydrogen", value: allTimeTotalHydrogen },
        { label: "allTimeTotalHelium", value: allTimeTotalHelium },
        { label: "allTimeTotalCarbon", value: allTimeTotalCarbon },
        { label: "allTimeTotalNeon", value: allTimeTotalNeon },
        { label: "allTimeTotalOxygen", value: allTimeTotalOxygen },
        { label: "allTimeTotalSodium", value: allTimeTotalSodium },
        { label: "allTimeTotalSilicon", value: allTimeTotalSilicon },
        { label: "allTimeTotalIron", value: allTimeTotalIron },
        { label: "allTimeTotalDiesel", value: allTimeTotalDiesel },
        { label: "allTimeTotalGlass", value: allTimeTotalGlass },
        { label: "allTimeTotalSteel", value: allTimeTotalSteel },
        { label: "allTimeTotalConcrete", value: allTimeTotalConcrete },
        { label: "allTimeTotalWater", value: allTimeTotalWater },
        { label: "allTimeTotalTitanium", value: allTimeTotalTitanium },
        { label: "allTimeTotalResearchPoints", value: allTimeTotalResearchPoints },
        { label: "allTimeTotalScienceKits", value: allTimeTotalScienceKits },
        { label: "allTimeTotalScienceClubs", value: allTimeTotalScienceClubs },
        { label: "allTimeTotalScienceLabs", value: allTimeTotalScienceLabs },
        { label: "allTimeTotalRocketsLaunched", value: allTimeTotalRocketsLaunched },
        { label: "allTimeTotalStarShipsLaunched", value: allTimeTotalStarShipsLaunched },
        { label: "allTimeTotalAsteroidsDiscovered", value: allTimeTotalAsteroidsDiscovered },
        { label: "allTimeTotalLegendaryAsteroidsDiscovered", value: allTimeTotalLegendaryAsteroidsDiscovered },
        { label: "starStudyRange", value: starStudyRange },
        { label: "allTimeTotalAntimatterMined", value: allTimeTotalAntimatterMined },
        { label: "antimatterMinedThisRun", value: antimatterMinedThisRun },
        { label: "allTimeTotalApGain", value: allTimeTotalApGain },
        { label: "currentRunNumber", value: currentRunNumber },
        { label: "currentRunTimer", value: currentRunTimer },
        { label: "totalNewsTickerPrizesCollected", value: totalNewsTickerPrizesCollected },
        { label: "apAnticipatedThisRun", value: apAnticipatedThisRun },
        { label: "allTimeStarShipsBuilt", value: allTimeStarShipsBuilt },
        { label: "starShipTravelDistance", value: starShipTravelDistance },
        { label: "allTimesTripped", value: allTimesTripped },
        { label: "allTimeBasicPowerPlantsBuilt", value: allTimeBasicPowerPlantsBuilt },
        { label: "allTimeAdvancedPowerPlantsBuilt", value: allTimeAdvancedPowerPlantsBuilt },
        { label: "allTimeSolarPowerPlantsBuilt", value: allTimeSolarPowerPlantsBuilt },
        { label: "allTimeSodiumIonBatteriesBuilt", value: allTimeSodiumIonBatteriesBuilt },
        { label: "allTimeBattery2Built", value: allTimeBattery2Built },
        { label: "allTimeBattery3Built", value: allTimeBattery3Built },
        { label: "asteroidsMinedThisRun", value: asteroidsMinedThisRun },

        { label: "", value: "" },
        { label: "Weather:", value: "" },
        { label: "", value: "" },

        { label: "weatherEffectOn", value: weatherEffectOn },
        { label: "weatherEfficiencyApplied", value: weatherEfficiencyApplied },
        { label: "currentStarSystemWeatherEfficiency", value: currentStarSystemWeatherEfficiency },
        { label: "currentPrecipitationRate", value: currentPrecipitationRate },

        { label: "", value: "" },
        { label: "Space Telescope:", value: "" },
        { label: "", value: "" },

        { label: "currentlySearchingAsteroid", value: currentlySearchingAsteroid },
        { label: "currentlyInvestigatingStar", value: currentlyInvestigatingStar },
        { label: "currentlyPillagingVoid", value: currentlyPillagingVoid },
        { label: "telescopeReadyToSearch", value: telescopeReadyToSearch },
        { label: "asteroidTimerCanContinue", value: asteroidTimerCanContinue },
        { label: "starInvestigationTimerCanContinue", value: starInvestigationTimerCanContinue },
        { label: "pillageVoidTimerCanContinue", value: pillageVoidTimerCanContinue },
        { label: "sortAsteroidMethod", value: sortAsteroidMethod },
        { label: "sortStarMethod", value: sortStarMethod },
        { label: "baseSearchAsteroidTimerDuration", value: baseSearchAsteroidTimerDuration },
        { label: "baseInvestigateStarTimerDuration", value: baseInvestigateStarTimerDuration },
        { label: "basePillageVoidTimerDuration", value: basePillageVoidTimerDuration },
        { label: "currentAsteroidSearchTimerDurationTotal", value: currentAsteroidSearchTimerDurationTotal },
        { label: "currentInvestigateStarTimerDurationTotal", value: currentInvestigateStarTimerDurationTotal },
        { label: "currentPillageVoidTimerDurationTotal", value: currentPillageVoidTimerDurationTotal },

        { label: "timeLeftUntilAsteroidScannerTimerFinishes", value: timeLeftUntilAsteroidScannerTimerFinishes },
        { label: "timeLeftUntilTravelToDestinationStarTimerFinishes", value: timeLeftUntilTravelToDestinationStarTimerFinishes },
        { label: "timeLeftUntilStarInvestigationTimerFinishes", value: timeLeftUntilStarInvestigationTimerFinishes },
        { label: "timeLeftUntilPillageVoidTimerFinishes", value: timeLeftUntilPillageVoidTimerFinishes },
        { label: "oldAntimatterRightBoxSvgData", value: oldAntimatterRightBoxSvgData },

        { label: "", value: "" },
        { label: "Rockets And Asteroid Mining:", value: "" },
        { label: "", value: "" },

        { label: "antimatterUnlocked", value: antimatterUnlocked },
        { label: "isAntimatterBoostActive", value: isAntimatterBoostActive },
        { label: "antimatterSvgEventListeners", value: antimatterSvgEventListeners },
        { label: "canTravelToAsteroids", value: canTravelToAsteroids },
        { label: "canFuelRockets", value: canFuelRockets },
        { label: "checkRocketFuellingStatus - rocket1", value: checkRocketFuellingStatus.rocket1 },
        { label: "checkRocketFuellingStatus - rocket2", value: checkRocketFuellingStatus.rocket2 },
        { label: "checkRocketFuellingStatus - rocket3", value: checkRocketFuellingStatus.rocket3 },
        { label: "checkRocketFuellingStatus - rocket4", value: checkRocketFuellingStatus.rocket4 },
        { label: "currentlyTravellingToAsteroid - rocket1", value: currentlyTravellingToAsteroid.rocket1 },
        { label: "currentlyTravellingToAsteroid - rocket2", value: currentlyTravellingToAsteroid.rocket2 },
        { label: "currentlyTravellingToAsteroid - rocket3", value: currentlyTravellingToAsteroid.rocket3 },
        { label: "currentlyTravellingToAsteroid - rocket4", value: currentlyTravellingToAsteroid.rocket4 },
        { label: "rocketReadyToTravel - rocket1", value: rocketReadyToTravel.rocket1 },
        { label: "rocketReadyToTravel - rocket2", value: rocketReadyToTravel.rocket2 },
        { label: "rocketReadyToTravel - rocket3", value: rocketReadyToTravel.rocket3 },
        { label: "rocketReadyToTravel - rocket4", value: rocketReadyToTravel.rocket4 },
        { label: "rocketUserName", value: rocketUserName },
        { label: "rocketsBuilt", value: rocketsBuilt },
        { label: "miningObject", value: miningObject },
        { label: "asteroidArray", value: asteroidArray },
        { label: "rocketsFuellerStartedArray", value: rocketsFuellerStartedArray },
        { label: "launchedRockets", value: launchedRockets },

        { label: "", value: "" },
        { label: "Star Ship:", value: "" },
        { label: "", value: "" },

        { label: "starShipBuilt", value: starShipBuilt },
        { label: "starShipTravelling", value: starShipTravelling },
        { label: "starShipArrowPosition", value: starShipArrowPosition },
        { label: "stellarScannerBuilt", value: stellarScannerBuilt },
        { label: "destinationStarScanned", value: destinationStarScanned },
        { label: "currentDestinationDropdownText", value: currentDestinationDropdownText },
        { label: "starVisionDistance", value: starVisionDistance },
        { label: "starMapMode", value: starMapMode },
        { label: "starVisionIncrement", value: starVisionIncrement },
        { label: "destinationStar", value: destinationStar },
        { label: "fromStarObject", value: fromStarObject },
        { label: "toStarObject", value: toStarObject },
        { label: "currentStarObject", value: currentStarObject },
        { label: "starShipStatus", value: starShipStatus },
        { label: "starShipModulesBuilt", value: starShipModulesBuilt },

        { label: "", value: "" },
        { label: "Diplomacy:", value: "" },
        { label: "", value: "" },

        { label: "diplomacyPossible", value: diplomacyPossible },

        { label: "", value: "" },
        { label: "Battle:", value: "" },
        { label: "", value: "" },

        { label: "needNewBattleCanvas", value: needNewBattleCanvas },
        { label: "redrawBattleDescription", value: redrawBattleDescription },
        { label: "warMode", value: warMode },
        { label: "fleetChangedSinceLastDiplomacy", value: fleetChangedSinceLastDiplomacy },
        { label: "battleOngoing", value: battleOngoing },
        { label: "formationGoal", value: formationGoal },
        { label: "battleTriggeredByPlayer", value: battleTriggeredByPlayer },
        { label: "inFormation", value: inFormation },
        { label: "wasAutoSaveToggled", value: wasAutoSaveToggled },
        { label: "enemyFleetAdjustedForDiplomacy", value: enemyFleetAdjustedForDiplomacy },

        { label: "", value: "" },
        { label: "Philosophy:", value: "" },
        { label: "", value: "" },

        { label: "philosophy", value: philosophy },
        { label: "philosophyAbilityActive", value: philosophyAbilityActive },
        { label: "repeatableTechMultipliers", value: repeatableTechMultipliers },
        { label: "philosophyRepeatableTechs", value: philosophyTechData },

        { label: "", value: "" },
        { label: "MegaStructures:", value: "" },
        { label: "", value: "" },

        { label: "starsWithAncientManuscripts", value: starsWithAncientManuscripts },
        { label: "factoryStarsArray", value: factoryStarsArray },
        { label: "manuscriptCluesShown", value: manuscriptCluesShown },
        { label: "megaStructuresInPossessionArray", value: megaStructuresInPossessionArray },
        { label: "megaStructureTechsResearched", value: megaStructureTechsResearched },
        { label: "megaStructureAntimatterAmount", value: megastructureAntimatterAmount },
        { label: "miaplacidusMilestoneLevel", value: miaplacidusMilestoneLevel },
        { label: "factoryStarMap", value: factoryStarMap },
        { label: "currentRunIsMegaStructureRun", value: currentRunIsMegaStructureRun },
        { label: "megaStructureResourceBonus", value: megaStructureResourceBonus },
        { label: "infinitePower", value: infinitePower },

        { label: "", value: "" },
        { label: "Black Hole:", value: "" },
        { label: "", value: "" },

        { label: "blackHoleDiscovered", value: blackHoleDiscovered },
        { label: "blackHoleDiscoveryProbability", value: blackHoleDiscoveryProbability },
        { label: "blackHoleAlwaysOn", value: blackHoleAlwaysOn },
        { label: "blackHoleChargeReady", value: blackHoleChargeReady },
        { label: "currentlyChargingBlackHole", value: currentlyChargingBlackHole },
        { label: "currentlyTimeWarpingBlackHole", value: currentlyTimeWarpingBlackHole },

        { label: "timeWarpMultiplier", value: timeWarpMultiplier },
        { label: "timeWarpEndTimestampMs", value: timeWarpEndTimestampMs },

        { label: "baseBlackHoleChargeTimerDuration", value: baseBlackHoleChargeTimerDuration },
        { label: "blackHoleDurationUpgradeIncrementMs", value: blackHoleDurationUpgradeIncrementMs },
        { label: "blackHolePowerUpgradeIncrement", value: blackHolePowerUpgradeIncrement },
        { label: "currentBlackHoleChargeTimerDurationTotal", value: currentBlackHoleChargeTimerDurationTotal },
        { label: "timeLeftUntilBlackHoleChargeTimerFinishes", value: timeLeftUntilBlackHoleChargeTimerFinishes },

        { label: "blackHoleResearchDone", value: getBlackHoleResearchDone() },
        { label: "blackHolePower", value: getBlackHolePower() },
        { label: "blackHoleDuration", value: getBlackHoleDuration() },
        { label: "blackHoleRechargeMultiplier", value: getBlackHoleRechargeMultiplier() },
        { label: "blackHoleResearchPrice", value: getBlackHoleResearchPrice() },
        { label: "blackHolePowerPrice", value: getBlackHolePowerPrice() },
        { label: "blackHoleDurationPrice", value: getBlackHoleDurationPrice() },
        { label: "blackHoleRechargePrice", value: getBlackHoleRechargePrice() },

        { label: "", value: "" },
        { label: "Galactic Casino:", value: "" },
        { label: "", value: "" },

        { label: "casinoPoints.quantity", value: getGalacticCasinoDataObject('casinoPoints', ['quantity']) ?? 0 },
        { label: "wheelForceSpecial", value: getWheelForceSpecial() },
        { label: "casinoGame4AlwaysWin", value: getCasinoGame4AlwaysWin() },
        { label: "casinoGame5VoidSeerAlwaysMatch", value: getCasinoGame5VoidSeerAlwaysMatch() },

        { label: "", value: "" },
        { label: "Cosmic Rip:", value: "" },
        { label: "", value: "" },

        { label: "cosmicRip", value: cosmicRipData },
        { label: "galacticPointsSpent", value: galacticPointsSpent ?? null },
        { label: "cosmicRip.galacticPoints", value: cosmicRipData?.galacticPoints ?? null },
        { label: "cosmicRip.nearSpaceScannerArrayRestored", value: cosmicRipData?.nearSpaceScannerArrayRestored ?? null },
        { label: "cosmicRip.ripLocationSectorIndex", value: cosmicRipData?.ripLocationSectorIndex ?? null },
        { label: "cosmicRip.ripFound", value: cosmicRipData?.ripFound ?? null },
        { label: "cosmicRip.scanResultsBySectorIndex", value: cosmicRipData?.scanResultsBySectorIndex ?? null },
        { label: "cosmicRip.stage", value: cosmicRipData?.stage ?? null },
        { label: "cosmicRip.instability", value: cosmicRipData?.instability ?? null },
        { label: "cosmicRip.containmentIntegrity", value: cosmicRipData?.containmentIntegrity ?? null },
        { label: "cosmicRip.sealProgress", value: cosmicRipData?.sealProgress ?? null },
        { label: "cosmicRipPrevRipFound", value: getCosmicRipPrevRipFound() ?? null },
        { label: "cosmicRipNearSpaceScannerArrayOneSectorState", value: getCosmicRipNearSpaceScannerArrayOneSectorState() ?? null },
        { label: "cosmicRipFoundSectorIndexForZoom", value: getCosmicRipFoundSectorIndexForZoom() ?? null },
        { label: "cosmicRip.ripResearch.points", value: cosmicRipData?.ripResearch?.points ?? null },
        { label: "cosmicRip.ripResearch.level", value: cosmicRipData?.ripResearch?.level ?? null },
        { label: "cosmicRip.ripResearch.unlocked", value: cosmicRipData?.ripResearch?.unlocked ?? null },
        { label: "cosmicRip.projects", value: cosmicRipData?.projects ?? null },
        { label: "cosmicRipNearSpaceScannerArraySectorNames", value: getCosmicRipNearSpaceScannerArraySectorNames() ?? null },
        { label: "cosmicRipFoundSectorIndexForZoom", value: getCosmicRipFoundSectorIndexForZoom() ?? null },
    ];    

    // If the inline editor is open, preserve the DOM node and (if focused) its selection.
    // This window is refreshed every tick, and clearing/rebuilding the container would otherwise
    // continuously steal focus from the textarea, making it impossible to type.
    const existingEditorRow = globalThis.__variableDebuggerEditorRow;
    const existingEditorTextarea = existingEditorRow?.querySelector?.('textarea') ?? null;
    const editorHadFocus = !!(existingEditorTextarea && document.activeElement === existingEditorTextarea);
    const editorSelectionStart = editorHadFocus ? existingEditorTextarea.selectionStart : null;
    const editorSelectionEnd = editorHadFocus ? existingEditorTextarea.selectionEnd : null;

    if (existingEditorRow && existingEditorRow.parentNode) {
        existingEditorRow.parentNode.removeChild(existingEditorRow);
    }

    debugTextAreaContainer.innerHTML = "";

    const editState = globalThis.__variableDebuggerEditState;
    const editTargetLabel = editState?.label ? String(editState.label) : '';

    variables.forEach((variable) => {
        const div = document.createElement("div");
        div.dataset.variableDebuggerLabel = String(variable.label ?? '');
        const label = document.createElement("span");

        if (variable.label === "") {
            const blankLineDiv = document.createElement("div");
            blankLineDiv.style.height = "10px";
            debugTextAreaContainer.appendChild(blankLineDiv);
        } else if (variable.value === "" && variable.label.endsWith(':')) {
            label.innerHTML = `${variable.label}`;
            label.style.fontSize = "2rem";
            div.appendChild(label);
            debugTextAreaContainer.appendChild(div);
        } else {
            const iconContainer = document.createElement("span");
            iconContainer.style.display = "inline-flex";
            iconContainer.style.alignItems = "center";
            iconContainer.style.marginRight = "8px";
            iconContainer.style.userSelect = "none";
            iconContainer.style.pointerEvents = "auto";
            iconContainer.style.touchAction = "manipulation";

            const clipboardIcon = document.createElement("span");
            clipboardIcon.textContent = "📋";
            clipboardIcon.style.cursor = "pointer";
            clipboardIcon.style.marginRight = "4px";
            clipboardIcon.style.padding = "2px 4px";
            clipboardIcon.style.pointerEvents = "auto";
            clipboardIcon.style.touchAction = "manipulation";
            clipboardIcon.title = "Copy to clipboard";
            clipboardIcon.addEventListener("pointerdown", (e) => {
                e.preventDefault();
                e.stopPropagation();
                clipboardIcon.setPointerCapture?.(e.pointerId);
                const textToCopy = `${variable.label}: ${formatVariableDebuggerValue(variable.value)}`;

                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        console.log("Copied to clipboard:", textToCopy);
                        showNotification(`Copied: ${variable.label}`, 'warning', 2000, 'general');
                    }).catch((err) => {
                        console.error("Clipboard API failed:", err);
                        fallbackCopy(textToCopy, variable.label);
                    });
                } else {
                    fallbackCopy(textToCopy, variable.label);
                }
            });

            const pencilIcon = document.createElement("span");
            pencilIcon.textContent = "✏️";
            pencilIcon.style.cursor = "pointer";
            pencilIcon.style.padding = "2px 4px";
            pencilIcon.style.pointerEvents = "auto";
            pencilIcon.style.touchAction = "manipulation";
            pencilIcon.title = "Edit variable";
            pencilIcon.addEventListener("pointerdown", (e) => {
                e.preventDefault();
                e.stopPropagation();
                pencilIcon.setPointerCapture?.(e.pointerId);
                openVariableDebuggerInlineEditor(String(variable.label));
            });

            iconContainer.appendChild(clipboardIcon);
            iconContainer.appendChild(pencilIcon);

            label.innerHTML = `${variable.label}:&nbsp;&nbsp;`;
            label.style.cursor = 'pointer';
            label.title = "Click to copy variable";
            label.addEventListener("pointerdown", (e) => {
                e.preventDefault();
                e.stopPropagation();
                const textToCopy = `${variable.label}: ${formatVariableDebuggerValue(variable.value)}`;
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        showNotification(`Copied: ${variable.label}`, 'warning', 2000, 'general');
                    }).catch((err) => {
                        fallbackCopy(textToCopy, variable.label);
                    });
                } else {
                    fallbackCopy(textToCopy, variable.label);
                }
            });
    
            const valueDiv = document.createElement("span");
            const className = variable.value === null ? "red-disabled-text" : "green-ready-text";
            valueDiv.classList.add(className);
            valueDiv.textContent = formatVariableDebuggerValue(variable.value);

            valueDiv.style.cursor = "pointer";
            valueDiv.style.pointerEvents = "auto";
            valueDiv.style.touchAction = "manipulation";
            valueDiv.title = "Click to edit";
            valueDiv.addEventListener("pointerdown", (e) => {
                e.preventDefault();
                e.stopPropagation();
                valueDiv.setPointerCapture?.(e.pointerId);
                openVariableDebuggerInlineEditor(String(variable.label));
            });
    
            div.appendChild(iconContainer);
            div.appendChild(label);
            div.appendChild(valueDiv);
    
            debugTextAreaContainer.appendChild(div);

            if (editTargetLabel && String(variable.label) === editTargetLabel) {
                // Always insert the editor row directly after the target variable row.
                // If it already exists, we re-append the same DOM node to preserve event handlers.
                let editorRow = globalThis.__variableDebuggerEditorRow;
                if (!editorRow || editorRow.dataset.editLabel !== editTargetLabel) {
                    editorRow = createVariableDebuggerInlineEditorRow(editTargetLabel);
                    editorRow.dataset.editLabel = editTargetLabel;
                    globalThis.__variableDebuggerEditorRow = editorRow;
                }

                // If the textarea isn't focused, keep it in sync with state on repaint.
                const textarea = editorRow.querySelector?.('textarea') ?? null;
                if (textarea && document.activeElement !== textarea) {
                    textarea.value = String(globalThis.__variableDebuggerEditState?.value ?? '');
                }

                debugTextAreaContainer.appendChild(editorRow);

                if (editorHadFocus && textarea) {
                    queueMicrotask(() => {
                        try {
                            textarea.focus();
                            if (typeof editorSelectionStart === 'number' && typeof editorSelectionEnd === 'number') {
                                textarea.setSelectionRange(editorSelectionStart, editorSelectionEnd);
                            }
                        } catch {
                        }
                    });
                }
            }
        }
    });

    if (variableDebuggerSearchInput && !variableDebuggerSearchInput.__variableDebuggerSearchListenerAttached) {
        variableDebuggerSearchInput.__variableDebuggerSearchListenerAttached = true;
        variableDebuggerSearchInput.addEventListener('input', () => {
            const raw = String(variableDebuggerSearchInput.value ?? '');
            const q = raw.trim().toLowerCase();
            if (q.length < 3) {
                variableDebuggerSearchInput.style.color = 'red';
                return;
            }

            const rows = Array.from(debugTextAreaContainer.querySelectorAll('[data-variable-debugger-label]'));
            const matchIndex = rows.findIndex((el) => {
                const label = String(el.dataset.variableDebuggerLabel ?? '').toLowerCase();
                if (!label) return false;
                if (label.endsWith(':')) return false;
                return label.includes(q);
            });

            if (matchIndex === -1) {
                variableDebuggerSearchInput.style.color = 'red';
                return;
            }

            variableDebuggerSearchInput.style.color = 'var(--text-color)';

            const matchEl = rows[matchIndex];
            const isNearBottom = matchIndex >= Math.max(0, rows.length - 15);

            const searchBarHeight = variableDebuggerSearchBar ? variableDebuggerSearchBar.offsetHeight : 0;
            const extraPadding = 30;

            if (debugContent) {
                if (isNearBottom) {
                    debugContent.scrollTop = debugContent.scrollHeight;
                } else {
                    const targetTop = matchEl.offsetTop;
                    debugContent.scrollTop = Math.max(0, targetTop - searchBarHeight - extraPadding);
                }
            } else {
                matchEl.scrollIntoView({ block: isNearBottom ? 'end' : 'start' });
            }
        });
    }
}

function openVariableDebuggerInlineEditor(label) {
    const safeLabel = String(label || '');
    if (!safeLabel) {
        return;
    }

    if (!getVariableDebuggerSetterForLabel(safeLabel)) {
        showNotification(`Cannot edit: ${safeLabel}`, 'warning', 2000, 'general');
        return;
    }

    let currentValue = '';
    try {
        currentValue = getCurrentVariableDebuggerValueForLabel(safeLabel);
    } catch {
        currentValue = '';
    }

    globalThis.__variableDebuggerEditState = {
        label: safeLabel,
        value: currentValue
    };
}

function closeVariableDebuggerInlineEditor() {
    globalThis.__variableDebuggerEditState = null;
    globalThis.__variableDebuggerEditorRow = null;
}

function createVariableDebuggerInlineEditorRow(label) {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '8px';
    row.style.marginLeft = '22px';
    row.style.marginTop = '2px';
    row.style.marginBottom = '2px';
    row.classList.add('variable-debugger-inline-editor-row');

    const input = document.createElement('textarea');
    input.classList.add('variable-debugger-inline-editor-input');
    input.value = String(globalThis.__variableDebuggerEditState?.value ?? '');
    input.placeholder = `Set ${label}...`;
    input.style.flex = '1';
    input.style.height = '44px';
    input.style.fontSize = '14px';
    input.style.resize = 'vertical';
    input.style.whiteSpace = 'pre-wrap';
    input.style.overflowWrap = 'anywhere';
    // Ensure normal mouse interactions (click-to-place caret, drag-to-select) aren't blocked
    // by pointer handlers on parent containers during tick rerenders.
    input.style.pointerEvents = 'auto';
    input.style.touchAction = 'auto';
    input.addEventListener('pointerdown', (e) => {
        // Do NOT preventDefault here (that would stop selection/caret placement).
        e.stopPropagation();
    });
    input.addEventListener('pointermove', (e) => {
        e.stopPropagation();
    });
    input.addEventListener('pointerup', (e) => {
        e.stopPropagation();
    });
    input.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    input.addEventListener('mousemove', (e) => {
        e.stopPropagation();
    });
    input.addEventListener('mouseup', (e) => {
        e.stopPropagation();
    });

    const submit = document.createElement('button');
    submit.classList.add('variable-debugger-inline-editor-button');
    submit.textContent = 'SUBMIT';
    submit.style.height = '22px';
    submit.style.fontSize = '12px';
    submit.style.cursor = 'pointer';
    submit.style.pointerEvents = 'auto';
    submit.style.touchAction = 'manipulation';
    submit.disabled = String(input.value ?? '').trim() === '';

    const cancel = document.createElement('button');
    cancel.classList.add('variable-debugger-inline-editor-button');
    cancel.textContent = 'X';
    cancel.style.height = '22px';
    cancel.style.fontSize = '12px';
    cancel.style.cursor = 'pointer';
    cancel.style.pointerEvents = 'auto';
    cancel.style.touchAction = 'manipulation';

    function syncEditState() {
        const state = globalThis.__variableDebuggerEditState;
        if (state && state.label === label) {
            state.value = String(input.value ?? '');
        }
        submit.disabled = String(input.value ?? '').trim() === '';
    }

    input.addEventListener('input', () => {
        syncEditState();
    });

    submit.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        submit.setPointerCapture?.(e.pointerId);
        if (String(input.value ?? '').trim() === '') {
            return;
        }
        applyVariableDebuggerEdit(label, input.value);
    });

    cancel.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        cancel.setPointerCapture?.(e.pointerId);
        closeVariableDebuggerInlineEditor();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                return;
            }
            e.preventDefault();
            if (String(input.value ?? '').trim() === '') {
                return;
            }
            applyVariableDebuggerEdit(label, input.value);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            closeVariableDebuggerInlineEditor();
        }
    });

    row.appendChild(input);
    row.appendChild(submit);
    row.appendChild(cancel);

    queueMicrotask(() => {
        try {
            input.focus();
            input.select();
        } catch {
        }
    });

    return row;
}

function applyVariableDebuggerEdit(label, raw) {
    const setter = getVariableDebuggerSetterForLabel(label);
    if (!setter) {
        showNotification(`Cannot edit: ${label}`, 'warning', 2000, 'general');
        return;
    }

    let parsed;
    try {
        parsed = parseVariableDebuggerInput(raw);
    } catch (err) {
        showNotification(`Invalid value: ${err.message}`, 'warning', 3000, 'general');
        return;
    }

    try {
        setter(parsed);
        showNotification(`Updated: ${label}`, 'warning', 2000, 'general');
        closeVariableDebuggerInlineEditor();
    } catch (err) {
        showNotification(`Failed to update: ${label} - ${err.message}`, 'warning', 3000, 'general');
    }
}

function parseVariableDebuggerInput(raw) {
    const str = String(raw ?? '').trim();
    if (str === '') {
        return '';
    }

    // Try to parse as JSON first (for arrays and objects)
    if ((str.startsWith('[') && str.endsWith(']')) || (str.startsWith('{') && str.endsWith('}'))) {
        try {
            const parsed = JSON.parse(str);
            // Validate that arrays contain only the expected types
            if (Array.isArray(parsed)) {
                return parsed;
            }
            // Return objects as-is
            if (typeof parsed === 'object' && parsed !== null) {
                return parsed;
            }
        } catch (err) {
            // JSON parse failed, throw a descriptive error
            throw new Error(`Invalid JSON: ${err.message}`);
        }
    }

    // Try to parse as number
    if (!isNaN(str) && !isNaN(parseFloat(str))) {
        const num = parseFloat(str);
        // Check if it should be an integer
        if (Number.isInteger(num)) {
            return parseInt(str, 10);
        }
        return num;
    }

    // Try to parse as boolean
    if (str === 'true') return true;
    if (str === 'false') return false;

    // Try to parse as null
    if (str === 'null') return null;

    // Return as string
    return str;
}

function getVariableDebuggerSetterForLabel(label) {
    const map = {
        // Game Settings
        gamestate: (v) => setGameStateVariable(v),
        gameStartTimeStamp: (v) => { gameStartTimeStamp = Number(v); },
        runStartTimeStamp: (v) => { runStartTimeStamp = Number(v); },
        alreadySeenNewsTickerArray: (v) => { alreadySeenNewsTickerArray = JSON.parse(v); },
        currencySymbol: (v) => { currencySymbol = v; },
        currentTheme: (v) => { currentTheme = v; document.body.setAttribute('data-theme', v); },
        sfx: (v) => { sfx = v === 'true' || v === true; },
        backgroundAudio: (v) => setBackgroundAudio(v),
        saveExportCloudFlag: (v) => { saveExportCloudFlag = v === 'true' || v === true; },
        autoSaveToggle: (v) => { autoSaveToggle = v === 'true' || v === true; },
        newsTickerSetting: (v) => { newsTickerSetting = v === 'true' || v === true; },
        weatherEffectSettingToggle: (v) => { weatherEffectSettingToggle = v === 'true' || v === true; },
        notificationsToggle: (v) => { notificationsToggle = v === 'true' || v === true; },
        saveName: (v) => { saveName = v; },
        lastSavedTimeStamp: (v) => { lastSavedTimeStamp = v; },
        autoSaveFrequency: (v) => { autoSaveFrequency = Number(v); },
        savedYetSinceOpeningSaveDialogue: (v) => { savedYetSinceOpeningSaveDialogue = v === 'true' || v === true; },

        // Run
        rebirthPossible: (v) => { rebirthPossible = v === 'true' || v === true; },
        runNumber: (v) => { runNumber = Number(v); },
        apAwardedThisRun: (v) => { apAwardedThisRun = Number(v); },
        currentStarSystem: (v) => { currentStarSystem = v; },

        // Resources / Compounds / AutoBuyers
        saleResourcePreviews: (v) => { saleResourcePreviews = v; },
        saleCompoundPreviews: (v) => { saleCompoundPreviews = v; },
        createCompoundPreviews: (v) => { createCompoundPreviews = v; },
        constituentPartsObject: (v) => { constituentPartsObject = v; },
        itemsToDeduct: (v) => { itemsToDeduct = v; },
        itemsToIncreasePrice: (v) => { itemsToIncreasePrice = v; },
        unlockedResourcesArray: (v) => { unlockedResourcesArray = v; },
        unlockedCompoundsArray: (v) => { unlockedCompoundsArray = v; },
        temporaryCoreTechsRowsRepo: (v) => { temporaryCoreTechRowsRepo = v; },
        canAffordDeferred: (v) => { canAffordDeferred = v === 'true' || v === true; },
        originalFrameNumbers: (v) => { originalFrameNumbers = v; },

        // Tech
        techRenderCounter: (v) => { techRenderCounter = Number(v); },
        techUnlockedArray: (v) => { techUnlockedArray = v; },
        revealedTechArray: (v) => { revealedTechArray = v; },
        upcomingTechArray: (v) => { upcomingTechArray = v; },
        tempRowValue: (v) => { tempRowValue = v; },

        // Energy
        losingEnergy: (v) => { losingEnergy = v === 'true' || v === true; },
        powerOnOff: (v) => { powerOnOff = v === 'true' || v === true; },
        trippedStatus: (v) => { trippedStatus = v === 'true' || v === true; },

        // Statistics - all Time totals
        allTimeTotalHydrogen: (v) => { allTimeTotalHydrogen = Number(v); },
        allTimeTotalHelium: (v) => { allTimeTotalHelium = Number(v); },
        allTimeTotalCarbon: (v) => { allTimeTotalCarbon = Number(v); },
        allTimeTotalNeon: (v) => { allTimeTotalNeon = Number(v); },
        allTimeTotalOxygen: (v) => { allTimeTotalOxygen = Number(v); },
        allTimeTotalSodium: (v) => { allTimeTotalSodium = Number(v); },
        allTimeTotalSilicon: (v) => { allTimeTotalSilicon = Number(v); },
        allTimeTotalIron: (v) => { allTimeTotalIron = Number(v); },
        allTimeTotalDiesel: (v) => { allTimeTotalDiesel = Number(v); },
        allTimeTotalGlass: (v) => { allTimeTotalGlass = Number(v); },
        allTimeTotalSteel: (v) => { allTimeTotalSteel = Number(v); },
        allTimeTotalConcrete: (v) => { allTimeTotalConcrete = Number(v); },
        allTimeTotalWater: (v) => { allTimeTotalWater = Number(v); },
        allTimeTotalTitanium: (v) => { allTimeTotalTitanium = Number(v); },
        allTimeTotalResearchPoints: (v) => { allTimeTotalResearchPoints = Number(v); },
        allTimeTotalScienceKits: (v) => { allTimeTotalScienceKits = Number(v); },
        allTimeTotalScienceClubs: (v) => { allTimeTotalScienceClubs = Number(v); },
        allTimeTotalScienceLabs: (v) => { allTimeTotalScienceLabs = Number(v); },
        allTimeTotalRocketsLaunched: (v) => { allTimeTotalRocketsLaunched = Number(v); },
        allTimeTotalStarShipsLaunched: (v) => { allTimeTotalStarShipsLaunched = Number(v); },
        allTimeTotalAsteroidsDiscovered: (v) => { allTimeTotalAsteroidsDiscovered = Number(v); },
        allTimeTotalLegendaryAsteroidsDiscovered: (v) => { allTimeTotalLegendaryAsteroidsDiscovered = Number(v); },
        starStudyRange: (v) => { starStudyRange = Number(v); },
        allTimeTotalAntimatterMined: (v) => { allTimeTotalAntimatterMined = Number(v); },
        antimatterMinedThisRun: (v) => { antimatterMinedThisRun = Number(v); },
        allTimeTotalApGain: (v) => { allTimeTotalApGain = Number(v); },
        currentRunNumber: (v) => { currentRunNumber = Number(v); },
        currentRunTimer: (v) => { currentRunTimer = Number(v); },
        totalNewsTickerPrizesCollected: (v) => { totalNewsTickerPrizesCollected = Number(v); },
        apAnticipatedThisRun: (v) => { apAnticipatedThisRun = Number(v); },
        allTimeStarShipsBuilt: (v) => { allTimeStarShipsBuilt = Number(v); },
        starShipTravelDistance: (v) => { starShipTravelDistance = Number(v); },
        allTimesTripped: (v) => { allTimesTripped = Number(v); },
        allTimeBasicPowerPlantsBuilt: (v) => { allTimeBasicPowerPlantsBuilt = Number(v); },
        allTimeAdvancedPowerPlantsBuilt: (v) => { allTimeAdvancedPowerPlantsBuilt = Number(v); },
        allTimeSolarPowerPlantsBuilt: (v) => { allTimeSolarPowerPlantsBuilt = Number(v); },
        allTimeSodiumIonBatteriesBuilt: (v) => { allTimeSodiumIonBatteriesBuilt = Number(v); },
        allTimeBattery2Built: (v) => { allTimeBattery2Built = Number(v); },
        allTimeBattery3Built: (v) => { allTimeBattery3Built = Number(v); },
        asteroidsMinedThisRun: (v) => { asteroidsMinedThisRun = Number(v); },

        // Weather
        weatherEffectOn: (v) => { weatherEffectOn = v === 'true' || v === true; },
        weatherEfficiencyApplied: (v) => { weatherEfficiencyApplied = v === 'true' || v === true; },
        currentStarSystemWeatherEfficiency: (v) => { currentStarSystemWeatherEfficiency = Number(v); },
        currentPrecipitationRate: (v) => { currentPrecipitationRate = Number(v); },

        // Space Telescope
        currentlySearchingAsteroid: (v) => { currentlySearchingAsteroid = v === 'true' || v === true; },
        currentlyInvestigatingStar: (v) => { currentlyInvestigatingStar = v === 'true' || v === true; },
        currentlyPillagingVoid: (v) => { currentlyPillagingVoid = v === 'true' || v === true; },
        telescopeReadyToSearch: (v) => { telescopeReadyToSearch = v === 'true' || v === true; },
        asteroidTimerCanContinue: (v) => { asteroidTimerCanContinue = v === 'true' || v === true; },
        starInvestigationTimerCanContinue: (v) => { starInvestigationTimerCanContinue = v === 'true' || v === true; },
        pillageVoidTimerCanContinue: (v) => { pillageVoidTimerCanContinue = v === 'true' || v === true; },
        sortAsteroidMethod: (v) => { sortAsteroidMethod = v; },
        sortStarMethod: (v) => { sortStarMethod = v; },
        baseSearchAsteroidTimerDuration: (v) => { baseSearchAsteroidTimerDuration = Number(v); },
        baseInvestigateStarTimerDuration: (v) => { baseInvestigateStarTimerDuration = Number(v); },
        basePillageVoidTimerDuration: (v) => { basePillageVoidTimerDuration = Number(v); },
        currentAsteroidSearchTimerDurationTotal: (v) => { currentAsteroidSearchTimerDurationTotal = Number(v); },
        currentInvestigateStarTimerDurationTotal: (v) => { currentInvestigateStarTimerDurationTotal = Number(v); },
        currentPillageVoidTimerDurationTotal: (v) => { currentPillageVoidTimerDurationTotal = Number(v); },
        timeLeftUntilAsteroidScannerTimerFinishes: (v) => { timeLeftUntilAsteroidScannerTimerFinishes = Number(v); },
        timeLeftUntilTravelToDestinationStarTimerFinishes: (v) => { timeLeftUntilTravelToDestinationStarTimerFinishes = Number(v); },
        timeLeftUntilStarInvestigationTimerFinishes: (v) => { timeLeftUntilStarInvestigationTimerFinishes = Number(v); },
        timeLeftUntilPillageVoidTimerFinishes: (v) => { timeLeftUntilPillageVoidTimerFinishes = Number(v); },
        oldAntimatterRightBoxSvgData: (v) => { oldAntimatterRightBoxSvgData = v; },

        // Rockets And Asteroid Mining
        antimatterUnlocked: (v) => { antimatterUnlocked = v === 'true' || v === true; },
        isAntimatterBoostActive: (v) => { isAntimatterBoostActive = v === 'true' || v === true; },
        antimatterSvgEventListeners: (v) => { antimatterSvgEventListeners = v; },
        canTravelToAsteroids: (v) => { canTravelToAsteroids = v === 'true' || v === true; },
        canFuelRockets: (v) => { canFuelRockets = v === 'true' || v === true; },
        rocketUserName: (v) => { rocketUserName = v; },
        rocketsBuilt: (v) => { rocketsBuilt = Number(v); },
        miningObject: (v) => { miningObject = v; },
        asteroidArray: (v) => { asteroidArray = v; },
        rocketsFuellerStartedArray: (v) => { rocketsFuellerStartedArray = v; },
        launchedRockets: (v) => { launchedRockets = v; },

        // Star Ship
        starShipBuilt: (v) => { starShipBuilt = v === 'true' || v === true; },
        starShipTravelling: (v) => { starShipTravelling = v === 'true' || v === true; },
        starShipArrowPosition: (v) => { starShipArrowPosition = Number(v); },
        stellarScannerBuilt: (v) => { stellarScannerBuilt = v === 'true' || v === true; },
        destinationStarScanned: (v) => { destinationStarScanned = v === 'true' || v === true; },
        currentDestinationDropdownText: (v) => { currentDestinationDropdownText = v; },
        starVisionDistance: (v) => { starVisionDistance = Number(v); },
        starMapMode: (v) => { starMapMode = v; },
        starVisionIncrement: (v) => { starVisionIncrement = Number(v); },
        destinationStar: (v) => { destinationStar = v; },
        fromStarObject: (v) => { fromStarObject = v; },
        toStarObject: (v) => { toStarObject = v; },
        currentStarObject: (v) => { currentStarObject = v; },
        starShipStatus: (v) => { starShipStatus = v; },
        starShipModulesBuilt: (v) => { starShipModulesBuilt = v; },

        // Diplomacy
        diplomacyPossible: (v) => { diplomacyPossible = v === 'true' || v === true; },

        // Battle
        needNewBattleCanvas: (v) => { needNewBattleCanvas = v === 'true' || v === true; },
        redrawBattleDescription: (v) => { redrawBattleDescription = v === 'true' || v === true; },
        warMode: (v) => { warMode = v === 'true' || v === true; },
        fleetChangedSinceLastDiplomacy: (v) => { fleetChangedSinceLastDiplomacy = v === 'true' || v === true; },
        battleOngoing: (v) => { battleOngoing = v === 'true' || v === true; },
        formationGoal: (v) => { formationGoal = v; },
        battleTriggeredByPlayer: (v) => { battleTriggeredByPlayer = v === 'true' || v === true; },
        inFormation: (v) => { inFormation = v === 'true' || v === true; },
        wasAutoSaveToggled: (v) => { wasAutoSaveToggled = v === 'true' || v === true; },
        enemyFleetAdjustedForDiplomacy: (v) => { enemyFleetAdjustedForDiplomacy = v; },

        // Philosophy
        philosophy: (v) => { philosophy = v; },
        philosophyAbilityActive: (v) => { philosophyAbilityActive = v === 'true' || v === true; },
        repeatableTechMultipliers: (v) => { repeatableTechMultipliers = v; },

        // Megastructures
        starsWithAncientManuscripts: (v) => { starsWithAncientManuscripts = v; },
        factoryStarsArray: (v) => { factoryStarsArray = v; },
        manuscriptCluesShown: (v) => { manuscriptCluesShown = v; },
        megaStructuresInPossessionArray: (v) => { megaStructuresInPossessionArray = v; },
        megaStructureTechsResearched: (v) => { megaStructureTechsResearched = v; },
        megaStructureAntimatterAmount: (v) => { megastructureAntimatterAmount = Number(v); },
        miaplacidusMilestoneLevel: (v) => { miaplacidusMilestoneLevel = Number(v); },
        factoryStarMap: (v) => { factoryStarMap = v; },
        currentRunIsMegaStructureRun: (v) => { currentRunIsMegaStructureRun = v === 'true' || v === true; },
        megaStructureResourceBonus: (v) => { megaStructureResourceBonus = v === 'true' || v === true; },
        infinitePower: (v) => { infinitePower = v === 'true' || v === true; },

        // Black Hole
        blackHoleDiscovered: (v) => setBlackHoleDiscovered(v),
        blackHoleDiscoveryProbability: (v) => setBlackHoleDiscoveryProbability(Number(v)),
        blackHoleAlwaysOn: (v) => setBlackHoleAlwaysOn(v === 'true' || v === true),
        blackHoleChargeReady: (v) => setBlackHoleChargeReady(v === 'true' || v === true),
        currentlyChargingBlackHole: (v) => setCurrentlyChargingBlackHole(v === 'true' || v === true),
        currentlyTimeWarpingBlackHole: (v) => setCurrentlyTimeWarpingBlackHole(v === 'true' || v === true),
        timeWarpMultiplier: (v) => setTimeWarpMultiplier(Number(v)),
        timeWarpEndTimestampMs: (v) => setTimeWarpEndTimestampMs(Number(v)),
        baseBlackHoleChargeTimerDuration: (v) => setBaseBlackHoleChargeTimerDuration(Number(v)),
        blackHoleDurationUpgradeIncrementMs: (v) => setBlackHoleDurationUpgradeIncrementMs(Number(v)),
        blackHolePowerUpgradeIncrement: (v) => setBlackHolePowerUpgradeIncrement(Number(v)),
        currentBlackHoleChargeTimerDurationTotal: (v) => setCurrentBlackHoleChargeTimerDurationTotal(Number(v)),
        timeLeftUntilBlackHoleChargeTimerFinishes: (v) => setTimeLeftUntilBlackHoleChargeTimerFinishes(Number(v)),

        blackHoleResearchDone: (v) => setBlackHoleResearchDone(v === 'true' || v === true),
        blackHolePower: (v) => setBlackHolePower(Number(v)),
        blackHoleDuration: (v) => setBlackHoleDuration(Number(v)),
        blackHoleRechargeMultiplier: (v) => setBlackHoleRechargeMultiplier(Number(v)),
        blackHoleResearchPrice: (v) => setBlackHoleResearchPrice(v),
        blackHolePowerPrice: (v) => setBlackHolePowerPrice(v),
        blackHoleDurationPrice: (v) => setBlackHoleDurationPrice(v),
        blackHoleRechargePrice: (v) => setBlackHoleRechargePrice(v),

        // Galactic Casino
        'casinoPoints.quantity': (v) => setGalacticCasinoDataObject(Number(v), 'casinoPoints', ['quantity']),
        wheelForceSpecial: (v) => setWheelForceSpecial(v),
        casinoGame4AlwaysWin: (v) => setCasinoGame4AlwaysWin(v),
        casinoGame5VoidSeerAlwaysMatch: (v) => setCasinoGame5VoidSeerAlwaysMatch(v),

        // Cosmic Rip
        settledStars: (v) => { settledStars = v; },
        cosmicRip: (v) => setResourceDataObject(v, 'cosmicRip', []),
        'galacticPointsSpent': (v) => setGalacticPointsSpent(Number(v)),
        'cosmicRip.galacticPoints': (v) => setResourceDataObject(Number(v), 'cosmicRip', ['galacticPoints']),
        'cosmicRip.nearSpaceScannerArrayRestored': (v) => setResourceDataObject(v === 'true' || v === true, 'cosmicRip', ['nearSpaceScannerArrayRestored']),
        'cosmicRip.ripLocationSectorIndex': (v) => setResourceDataObject(Number(v), 'cosmicRip', ['ripLocationSectorIndex']),
        'cosmicRip.ripFound': (v) => setResourceDataObject(v === 'true' || v === true, 'cosmicRip', ['ripFound']),
        'cosmicRip.scanResultsBySectorIndex': (v) => setResourceDataObject(v, 'cosmicRip', ['scanResultsBySectorIndex']),
        'cosmicRip.stage': (v) => setResourceDataObject(Number(v), 'cosmicRip', ['stage']),
        'cosmicRip.instability': (v) => setResourceDataObject(Number(v), 'cosmicRip', ['instability']),
        'cosmicRip.containmentIntegrity': (v) => setResourceDataObject(Number(v), 'cosmicRip', ['containmentIntegrity']),
        'cosmicRip.sealProgress': (v) => setResourceDataObject(Number(v), 'cosmicRip', ['sealProgress']),
        'cosmicRipPrevRipFound': (v) => setCosmicRipPrevRipFound(v === 'true' || v === true),
        'cosmicRipNearSpaceScannerArraySectorNames': (v) => setCosmicRipNearSpaceScannerArraySectorNames(v),
        'cosmicRipNearSpaceScannerArrayOneSectorState': (v) => setCosmicRipNearSpaceScannerArrayOneSectorState(v === 'true' || v === true),
        'cosmicRipFoundSectorIndexForZoom': (v) => setCosmicRipFoundSectorIndexForZoom(Number(v)),
        'cosmicRip.ripResearch.points': (v) => setResourceDataObject(Number(v), 'cosmicRip', ['ripResearch', 'points']),
        'cosmicRip.ripResearch.level': (v) => setResourceDataObject(Number(v), 'cosmicRip', ['ripResearch', 'level']),
        'cosmicRip.ripResearch.unlocked': (v) => setResourceDataObject(v === 'true' || v === true, 'cosmicRip', ['ripResearch', 'unlocked']),
        'cosmicRip.projects': (v) => setResourceDataObject(v, 'cosmicRip', ['projects']),
    };

    return map[label] || null;
}

function formatVariableDebuggerValue(value) {
    if (Array.isArray(value) || typeof value === 'object') {
        const stringifiedValue = JSON.stringify(value);
        return stringifiedValue.length > 2000 ? `${stringifiedValue.slice(0, 2000)}...` : stringifiedValue;
    } else {
        return value;
    }
}

function fallbackCopy(text, label) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
        document.execCommand('copy');
        console.log("Copied via fallback:", text);
        showNotification(`Copied: ${label}`, 'warning', 2000, 'general');
    } catch (err) {
        console.error("Fallback copy failed:", err);
    }
    document.body.removeChild(textarea);
}

export function getUserPlatform() {
    return userPlatform;
}

export function setUserPlatform(value) {
    userPlatform = value;
}

export function getHostSource() {
    return hostSource;
}

export function setHostSource(value) {
    hostSource = value;
}

function detectAndSetUserPlatform() {
    if (typeof window === 'undefined') {
        userPlatform = ['unknown', 'unknown', {}];
        hostSource = 'unknown';
        return;
    }

    const ua = window.navigator?.userAgent?.toLowerCase?.() ?? 'unknown';
    let platform = 'unknown';
    let platformData = {};
    const hostname = window?.location?.hostname;

    if (window.location?.hostname?.includes('github.io')) {
        platform = 'github';
        platformData = {
            hostname: window.location.hostname,
            pathname: window.location.pathname
        };
    } else if (window.location?.hostname?.includes('itch.io')) {
        platform = 'itch';
        platformData = {
            hostname: window.location.hostname,
            pathname: window.location.pathname,
            referrer: (typeof document !== 'undefined' && document?.referrer) ? document.referrer : ''
        };
    }

    userPlatform = [platform, ua, platformData];
    hostSource = hostname || (platform === 'electron' ? 'electron' : 'unknown');
}

export function setAchievementFlagArray(achievementKey, action) {
    if (action === 'add' && !achievementFlagArray.includes(achievementKey)) {
        achievementFlagArray.push(achievementKey);
    } else if (action === 'remove' && achievementFlagArray.includes(achievementKey)) {
        achievementFlagArray = achievementFlagArray.filter(flag => flag !== achievementKey);
    } else if (action === 'empty') {
        achievementFlagArray = [];
    }
}

export function getAchievementFlagArray() {
    return achievementFlagArray;
}
  
export function getCompoundCreateDropdownRecipeText(compound) {
    return compoundCreateDropdownRecipeText[compound];
}

export function setCompoundCreateDropdownRecipeText(compound, newOptions) {
    compoundCreateDropdownRecipeText[compound] = newOptions;
}

export function getMultiplierPermanentResources() {
    return multiplierPermanentResources;
}

export function setMultiplierPermanentResources(value) {
    multiplierPermanentResources = value;
}

export function getMultiplierPermanentCompounds() {
    return multiplierPermanentCompounds;
}

export function setMultiplierPermanentCompounds(value) {
    multiplierPermanentCompounds = value;
}

export function getFirstAccessArray() {
    return firstAccessArray;
}

export function setFirstAccessArray(value) {
    if (!firstAccessArray.includes(value)) {
        firstAccessArray.push(value);
    }
}

export function getPhilosophyAbilityActive() {
    return philosophyAbilityActive;
}

export function setPhilosophyAbilityActive(value) {
    philosophyAbilityActive = value;
}

export function getAllRepeatableTechMultipliersObject() {
    return repeatableTechMultipliers;
}

export function getRepeatableTechMultipliers(key) {
    return repeatableTechMultipliers[key];
}

export function setRepeatableTechMultipliers(key, value) {
    repeatableTechMultipliers[key] = value;
}  

function getCurrentVariableDebuggerValueForLabel(label) {
    if (label === 'gamestate') return JSON.stringify(gameState);
    if (label === 'gameStartTimeStamp') return String(gameStartTimeStamp);
    if (label === 'runStartTimeStamp') return String(runStartTimeStamp);
    if (label === 'alreadySeenNewsTickerArray') return JSON.stringify(alreadySeenNewsTickerArray);
    if (label === 'currencySymbol') return String(currencySymbol);
    if (label === 'currentTheme') return String(currentTheme);
    if (label === 'sfx') return String(sfx);
    if (label === 'backgroundAudio') return String(backgroundAudio);
    if (label === 'saveExportCloudFlag') return String(saveExportCloudFlag);
    if (label === 'autoSaveToggle') return String(autoSaveToggle);
    if (label === 'newsTickerSetting') return String(newsTickerSetting);
    if (label === 'weatherEffectSettingToggle') return String(weatherEffectSettingToggle);
    if (label === 'notificationsToggle') return String(notificationsToggle);
    if (label === 'saveName') return String(saveName);
    if (label === 'lastSavedTimeStamp') return String(lastSavedTimeStamp);
    if (label === 'autoSaveFrequency') return String(autoSaveFrequency);
    if (label === 'savedYetSinceOpeningSaveDialogue') return String(savedYetSinceOpeningSaveDialogue);

    if (label === 'rebirthPossible') return String(rebirthPossible);
    if (label === 'runNumber') return String(runNumber);
    if (label === 'apAwardedThisRun') return String(apAwardedThisRun);
    if (label === 'currentStarSystem') return String(currentStarSystem);

    if (label === 'saleResourcePreviews') return JSON.stringify(saleResourcePreviews);
    if (label === 'saleCompoundPreviews') return JSON.stringify(saleCompoundPreviews);
    if (label === 'createCompoundPreviews') return JSON.stringify(createCompoundPreviews);
    if (label === 'constituentPartsObject') return JSON.stringify(constituentPartsObject);
    if (label === 'itemsToDeduct') return JSON.stringify(itemsToDeduct);
    if (label === 'itemsToIncreasePrice') return JSON.stringify(itemsToIncreasePrice);
    if (label === 'unlockedResourcesArray') return JSON.stringify(unlockedResourcesArray);
    if (label === 'unlockedCompoundsArray') return JSON.stringify(unlockedCompoundsArray);
    if (label === 'temporaryCoreTechsRowsRepo') return JSON.stringify(temporaryCoreTechRowsRepo);
    if (label === 'canAffordDeferred') return String(canAffordDeferred);
    if (label === 'originalFrameNumbers') return JSON.stringify(originalFrameNumbers);

    if (label === 'techRenderCounter') return String(techRenderCounter);
    if (label === 'techUnlockedArray') return JSON.stringify(techUnlockedArray);
    if (label === 'revealedTechArray') return JSON.stringify(revealedTechArray);
    if (label === 'upcomingTechArray') return JSON.stringify(upcomingTechArray);
    if (label === 'tempRowValue') return String(tempRowValue);

    if (label === 'losingEnergy') return String(losingEnergy);
    if (label === 'powerOnOff') return String(powerOnOff);
    if (label === 'trippedStatus') return String(trippedStatus);

    if (label === 'allTimeTotalHydrogen') return String(allTimeTotalHydrogen);
    if (label === 'allTimeTotalHelium') return String(allTimeTotalHelium);
    if (label === 'allTimeTotalCarbon') return String(allTimeTotalCarbon);
    if (label === 'allTimeTotalNeon') return String(allTimeTotalNeon);
    if (label === 'allTimeTotalOxygen') return String(allTimeTotalOxygen);
    if (label === 'allTimeTotalSodium') return String(allTimeTotalSodium);
    if (label === 'allTimeTotalSilicon') return String(allTimeTotalSilicon);
    if (label === 'allTimeTotalIron') return String(allTimeTotalIron);
    if (label === 'allTimeTotalDiesel') return String(allTimeTotalDiesel);
    if (label === 'allTimeTotalGlass') return String(allTimeTotalGlass);
    if (label === 'allTimeTotalSteel') return String(allTimeTotalSteel);
    if (label === 'allTimeTotalConcrete') return String(allTimeTotalConcrete);
    if (label === 'allTimeTotalWater') return String(allTimeTotalWater);
    if (label === 'allTimeTotalTitanium') return String(allTimeTotalTitanium);
    if (label === 'allTimeTotalResearchPoints') return String(allTimeTotalResearchPoints);
    if (label === 'allTimeTotalScienceKits') return String(allTimeTotalScienceKits);
    if (label === 'allTimeTotalScienceClubs') return String(allTimeTotalScienceClubs);
    if (label === 'allTimeTotalScienceLabs') return String(allTimeTotalScienceLabs);
    if (label === 'allTimeTotalRocketsLaunched') return String(allTimeTotalRocketsLaunched);
    if (label === 'allTimeTotalStarShipsLaunched') return String(allTimeTotalStarShipsLaunched);
    if (label === 'allTimeTotalAsteroidsDiscovered') return String(allTimeTotalAsteroidsDiscovered);
    if (label === 'allTimeTotalLegendaryAsteroidsDiscovered') return String(allTimeTotalLegendaryAsteroidsDiscovered);
    if (label === 'starStudyRange') return String(starStudyRange);
    if (label === 'allTimeTotalAntimatterMined') return String(allTimeTotalAntimatterMined);
    if (label === 'antimatterMinedThisRun') return String(antimatterMinedThisRun);
    if (label === 'allTimeTotalApGain') return String(allTimeTotalApGain);
    if (label === 'currentRunNumber') return String(currentRunNumber);
    if (label === 'currentRunTimer') return String(currentRunTimer);
    if (label === 'totalNewsTickerPrizesCollected') return String(totalNewsTickerPrizesCollected);
    if (label === 'apAnticipatedThisRun') return String(apAnticipatedThisRun);
    if (label === 'allTimeStarShipsBuilt') return String(allTimeStarShipsBuilt);
    if (label === 'starShipTravelDistance') return String(starShipTravelDistance);
    if (label === 'allTimesTripped') return String(allTimesTripped);
    if (label === 'allTimeBasicPowerPlantsBuilt') return String(allTimeBasicPowerPlantsBuilt);
    if (label === 'allTimeAdvancedPowerPlantsBuilt') return String(allTimeAdvancedPowerPlantsBuilt);
    if (label === 'allTimeSolarPowerPlantsBuilt') return String(allTimeSolarPowerPlantsBuilt);
    if (label === 'allTimeSodiumIonBatteriesBuilt') return String(allTimeSodiumIonBatteriesBuilt);
    if (label === 'allTimeBattery2Built') return String(allTimeBattery2Built);
    if (label === 'allTimeBattery3Built') return String(allTimeBattery3Built);
    if (label === 'asteroidsMinedThisRun') return String(asteroidsMinedThisRun);

    if (label === 'weatherEffectOn') return String(weatherEffectOn);
    if (label === 'weatherEfficiencyApplied') return String(weatherEfficiencyApplied);
    if (label === 'currentStarSystemWeatherEfficiency') return String(currentStarSystemWeatherEfficiency);
    if (label === 'currentPrecipitationRate') return String(currentPrecipitationRate);

    if (label === 'currentlySearchingAsteroid') return String(currentlySearchingAsteroid);
    if (label === 'currentlyInvestigatingStar') return String(currentlyInvestigatingStar);
    if (label === 'currentlyPillagingVoid') return String(currentlyPillagingVoid);
    if (label === 'telescopeReadyToSearch') return String(telescopeReadyToSearch);
    if (label === 'asteroidTimerCanContinue') return String(asteroidTimerCanContinue);
    if (label === 'starInvestigationTimerCanContinue') return String(starInvestigationTimerCanContinue);
    if (label === 'pillageVoidTimerCanContinue') return String(pillageVoidTimerCanContinue);
    if (label === 'sortAsteroidMethod') return String(sortAsteroidMethod);
    if (label === 'sortStarMethod') return String(sortStarMethod);
    if (label === 'baseSearchAsteroidTimerDuration') return String(baseSearchAsteroidTimerDuration);
    if (label === 'baseInvestigateStarTimerDuration') return String(baseInvestigateStarTimerDuration);
    if (label === 'basePillageVoidTimerDuration') return String(basePillageVoidTimerDuration);
    if (label === 'currentAsteroidSearchTimerDurationTotal') return String(currentAsteroidSearchTimerDurationTotal);
    if (label === 'currentInvestigateStarTimerDurationTotal') return String(currentInvestigateStarTimerDurationTotal);
    if (label === 'currentPillageVoidTimerDurationTotal') return String(currentPillageVoidTimerDurationTotal);
    if (label === 'timeLeftUntilAsteroidScannerTimerFinishes') return String(timeLeftUntilAsteroidScannerTimerFinishes);
    if (label === 'timeLeftUntilTravelToDestinationStarTimerFinishes') return String(timeLeftUntilTravelToDestinationStarTimerFinishes);
    if (label === 'timeLeftUntilStarInvestigationTimerFinishes') return String(timeLeftUntilStarInvestigationTimerFinishes);
    if (label === 'timeLeftUntilPillageVoidTimerFinishes') return String(timeLeftUntilPillageVoidTimerFinishes);
    if (label === 'oldAntimatterRightBoxSvgData') return JSON.stringify(oldAntimatterRightBoxSvgData);

    if (label === 'antimatterUnlocked') return String(antimatterUnlocked);
    if (label === 'isAntimatterBoostActive') return String(isAntimatterBoostActive);
    if (label === 'antimatterSvgEventListeners') return JSON.stringify(antimatterSvgEventListeners);
    if (label === 'canTravelToAsteroids') return String(canTravelToAsteroids);
    if (label === 'canFuelRockets') return String(canFuelRockets);
    if (label === 'checkRocketFuellingStatus - rocket1') return String(checkRocketFuellingStatus?.rocket1);
    if (label === 'checkRocketFuellingStatus - rocket2') return String(checkRocketFuellingStatus?.rocket2);
    if (label === 'checkRocketFuellingStatus - rocket3') return String(checkRocketFuellingStatus?.rocket3);
    if (label === 'checkRocketFuellingStatus - rocket4') return String(checkRocketFuellingStatus?.rocket4);
    if (label === 'currentlyTravellingToAsteroid - rocket1') return String(currentlyTravellingToAsteroid?.rocket1);
    if (label === 'currentlyTravellingToAsteroid - rocket2') return String(currentlyTravellingToAsteroid?.rocket2);
    if (label === 'currentlyTravellingToAsteroid - rocket3') return String(currentlyTravellingToAsteroid?.rocket3);
    if (label === 'currentlyTravellingToAsteroid - rocket4') return String(currentlyTravellingToAsteroid?.rocket4);
    if (label === 'rocketReadyToTravel - rocket1') return String(rocketReadyToTravel?.rocket1);
    if (label === 'rocketReadyToTravel - rocket2') return String(rocketReadyToTravel?.rocket2);
    if (label === 'rocketReadyToTravel - rocket3') return String(rocketReadyToTravel?.rocket3);
    if (label === 'rocketReadyToTravel - rocket4') return String(rocketReadyToTravel?.rocket4);
    if (label === 'rocketUserName') return JSON.stringify(rocketUserName);
    if (label === 'rocketsBuilt') return String(rocketsBuilt);
    if (label === 'miningObject') return JSON.stringify(miningObject);
    if (label === 'asteroidArray') return JSON.stringify(asteroidArray);
    if (label === 'rocketsFuellerStartedArray') return JSON.stringify(rocketsFuellerStartedArray);
    if (label === 'launchedRockets') return JSON.stringify(launchedRockets);

    if (label === 'starShipBuilt') return String(starShipBuilt);
    if (label === 'starShipTravelling') return String(starShipTravelling);
    if (label === 'starShipArrowPosition') return String(starShipArrowPosition);
    if (label === 'stellarScannerBuilt') return String(stellarScannerBuilt);
    if (label === 'destinationStarScanned') return String(destinationStarScanned);
    if (label === 'currentDestinationDropdownText') return String(currentDestinationDropdownText);
    if (label === 'starVisionDistance') return String(starVisionDistance);
    if (label === 'starMapMode') return String(starMapMode);
    if (label === 'starVisionIncrement') return String(starVisionIncrement);
    if (label === 'destinationStar') return JSON.stringify(destinationStar);
    if (label === 'fromStarObject') return JSON.stringify(fromStarObject);
    if (label === 'toStarObject') return JSON.stringify(toStarObject);
    if (label === 'currentStarObject') return JSON.stringify(currentStarObject);
    if (label === 'starShipStatus') return String(starShipStatus);
    if (label === 'starShipModulesBuilt') return JSON.stringify(starShipModulesBuilt);

    if (label === 'diplomacyPossible') return String(diplomacyPossible);

    if (label === 'needNewBattleCanvas') return String(needNewBattleCanvas);
    if (label === 'redrawBattleDescription') return String(redrawBattleDescription);
    if (label === 'warMode') return String(warMode);
    if (label === 'fleetChangedSinceLastDiplomacy') return String(fleetChangedSinceLastDiplomacy);
    if (label === 'battleOngoing') return String(battleOngoing);
    if (label === 'formationGoal') return String(formationGoal);
    if (label === 'battleTriggeredByPlayer') return String(battleTriggeredByPlayer);
    if (label === 'inFormation') return String(inFormation);
    if (label === 'wasAutoSaveToggled') return String(wasAutoSaveToggled);
    if (label === 'enemyFleetAdjustedForDiplomacy') return JSON.stringify(enemyFleetAdjustedForDiplomacy);

    if (label === 'philosophy') return String(philosophy);
    if (label === 'philosophyAbilityActive') return String(philosophyAbilityActive);
    if (label === 'repeatableTechMultipliers') return JSON.stringify(repeatableTechMultipliers);

    if (label === 'starsWithAncientManuscripts') return JSON.stringify(starsWithAncientManuscripts);
    if (label === 'factoryStarsArray') return JSON.stringify(factoryStarsArray);
    if (label === 'manuscriptCluesShown') return JSON.stringify(manuscriptCluesShown);
    if (label === 'megaStructuresInPossessionArray') return JSON.stringify(megaStructuresInPossessionArray);
    if (label === 'megaStructureTechsResearched') return JSON.stringify(megaStructureTechsResearched);
    if (label === 'megaStructureAntimatterAmount') return String(megastructureAntimatterAmount);
    if (label === 'miaplacidusMilestoneLevel') return String(miaplacidusMilestoneLevel);
    if (label === 'factoryStarMap') return JSON.stringify(factoryStarMap);
    if (label === 'currentRunIsMegaStructureRun') return String(currentRunIsMegaStructureRun);
    if (label === 'megaStructureResourceBonus') return String(megaStructureResourceBonus);
    if (label === 'infinitePower') return String(infinitePower);

    if (label === 'blackHoleDiscovered') return String(blackHoleDiscovered);
    if (label === 'blackHoleDiscoveryProbability') return String(blackHoleDiscoveryProbability);
    if (label === 'blackHoleAlwaysOn') return String(blackHoleAlwaysOn);
    if (label === 'blackHoleChargeReady') return String(blackHoleChargeReady);
    if (label === 'currentlyChargingBlackHole') return String(currentlyChargingBlackHole);
    if (label === 'currentlyTimeWarpingBlackHole') return String(currentlyTimeWarpingBlackHole);
    if (label === 'timeWarpMultiplier') return String(timeWarpMultiplier);
    if (label === 'timeWarpEndTimestampMs') return String(timeWarpEndTimestampMs);
    if (label === 'baseBlackHoleChargeTimerDuration') return String(baseBlackHoleChargeTimerDuration);
    if (label === 'blackHoleDurationUpgradeIncrementMs') return String(blackHoleDurationUpgradeIncrementMs);
    if (label === 'blackHolePowerUpgradeIncrement') return String(blackHolePowerUpgradeIncrement);
    if (label === 'currentBlackHoleChargeTimerDurationTotal') return String(currentBlackHoleChargeTimerDurationTotal);
    if (label === 'timeLeftUntilBlackHoleChargeTimerFinishes') return String(timeLeftUntilBlackHoleChargeTimerFinishes);
    if (label === 'blackHoleResearchDone') return String(getBlackHoleResearchDone());
    if (label === 'blackHolePower') return String(getBlackHolePower());
    if (label === 'blackHoleDuration') return String(getBlackHoleDuration());
    if (label === 'blackHoleRechargeMultiplier') return String(getBlackHoleRechargeMultiplier());
    if (label === 'blackHoleResearchPrice') return String(getBlackHoleResearchPrice());
    if (label === 'blackHolePowerPrice') return String(getBlackHolePowerPrice());
    if (label === 'blackHoleDurationPrice') return String(getBlackHoleDurationPrice());
    if (label === 'blackHoleRechargePrice') return String(getBlackHoleRechargePrice());

    if (label === 'casinoPoints.quantity') return String(getGalacticCasinoDataObject('casinoPoints', ['quantity']) ?? 0);
    if (label === 'wheelForceSpecial') return String(getWheelForceSpecial());
    if (label === 'casinoGame4AlwaysWin') return String(getCasinoGame4AlwaysWin());
    if (label === 'casinoGame5VoidSeerAlwaysMatch') return String(getCasinoGame5VoidSeerAlwaysMatch());

    if (label === 'settledStars') return JSON.stringify(settledStars);
    if (label === 'cosmicRip') return JSON.stringify(getResourceDataObject('cosmicRip'));
    if (label === 'galacticPointsSpent') return String(galacticPointsSpent);
    const rip = getResourceDataObject('cosmicRip');
    if (label === 'cosmicRip.galacticPoints') return String(rip?.galacticPoints ?? '');
    if (label === 'cosmicRip.nearSpaceScannerArrayRestored') return String(rip?.nearSpaceScannerArrayRestored ?? '');
    if (label === 'cosmicRip.ripLocationSectorIndex') return String(rip?.ripLocationSectorIndex ?? '');
    if (label === 'cosmicRip.ripFound') return String(rip?.ripFound ?? '');
    if (label === 'cosmicRip.scanResultsBySectorIndex') return JSON.stringify(rip?.scanResultsBySectorIndex ?? null);
    if (label === 'cosmicRip.stage') return String(rip?.stage ?? '');
    if (label === 'cosmicRip.instability') return String(rip?.instability ?? '');
    if (label === 'cosmicRip.containmentIntegrity') return String(rip?.containmentIntegrity ?? '');
    if (label === 'cosmicRip.sealProgress') return String(rip?.sealProgress ?? '');
    if (label === 'cosmicRipPrevRipFound') return String(getCosmicRipPrevRipFound() ?? '');
    if (label === 'cosmicRipNearSpaceScannerArrayOneSectorState') return String(getCosmicRipNearSpaceScannerArrayOneSectorState() ?? '');
    if (label === 'cosmicRipFoundSectorIndexForZoom') return String(getCosmicRipFoundSectorIndexForZoom() ?? '');
    if (label === 'cosmicRip.ripResearch.points') return String(rip?.ripResearch?.points ?? '');
    if (label === 'cosmicRip.ripResearch.level') return String(rip?.ripResearch?.level ?? '');
    if (label === 'cosmicRip.ripResearch.unlocked') return String(rip?.ripResearch?.unlocked ?? '');
    if (label === 'cosmicRip.projects') return JSON.stringify(rip?.projects ?? null);
    if (label === 'cosmicRipNearSpaceScannerArraySectorNames') return JSON.stringify(getCosmicRipNearSpaceScannerArraySectorNames() ?? null);
    if (label === 'cosmicRipFoundSectorIndexForZoom') return String(getCosmicRipFoundSectorIndexForZoom() ?? '');

    const state = globalThis.__variableDebuggerEditState;
    if (state && state.label === label) {
        return String(state.value ?? '');
    }

    return null;
}
