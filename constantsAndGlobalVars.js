import { restoreAchievementsDataObject, restoreAscendencyBuffsDataObject, restoreGalacticMarketDataObject, restoreRocketNamesObject, restoreResourceDataObject, restoreStarSystemsDataObject, resourceData, starSystems, getResourceDataObject, setResourceDataObject, galacticMarket, ascendencyBuffs, achievementsData, getStarSystemDataObject } from "./resourceDataObject.js";
import { achievementFunctionsMap } from "./achievements.js";
import { drawNativeTechTree, selectTheme, startWeatherEffect, stopWeatherEffect, applyCustomPointerSetting } from "./ui.js";
import { capitaliseWordsWithRomanNumerals, capitaliseString } from './utilityFunctions.js';
import { offlineGains, startNewsTickerTimer } from './game.js';
import { rocketNames } from './descriptions.js';
import { boostSoundManager } from './audioManager.js';

//DEBUG
export let debugFlag = false;
export let debugOptionFlag = false;
export let stateLoading = false;
export const debugVisibilityArray = ['settingsNotificationTestRow'];

var debugTimeWarpDurationMs = 5000;
var debugTimeWarpMultiplier = 10;
var debugHoldEnterToGainEnabled = false;
let blackHoleDiscovered = false;
let blackHoleDiscoveryProbability = 0;

//ELEMENTS
let elements;
let saveData = null;

//CONSTANTS
export const HOMESTAR = 'miaplacidus';
export const MINIMUM_GAME_VERSION_FOR_SAVES = 0.70;
export const GAME_VERSION_FOR_SAVES = 0.81;
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

let megaStructureTechsResearched = [];
let miaplacidusMilestoneLevel = 0;
let increaseStorageFactor = 2;
let rocketTravelSpeed = 0.2;
let starShipTravelSpeed = 360000; //3600000 one real hour per light year
let philosophy = null;
let feedbackContent = 'Not done yet';
let feedbackGiven = null;
let gameStartTimeStamp = null;
let runStartTimeStamp = null;
let gameActiveCountTime = [0, 0];
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
let apSellForCashPrice = AP_BASE_SELL_PRICE;
let apBuyForCashPrice = AP_BASE_BUY_PRICE;
let apLiquidationQuantity = 0;
let userPlatform = [
    null, // [0] - Platform: 'github', 'itch', 'electron', or 'unknown'
    null, // [1] - User agent string
    null  // [2] - Additional platform-specific data
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

let battleResolved = [false, null];

let galacticMarketOutgoingStockType = 'select';
let galacticMarketIncomingStockType = 'select';
let galacticMarketOutgoingQuantitySelectionType = 'select';
let galacticMarketSellApForCashQuantity = 'select';
let galacticMarketIncomingQuantity = 0;
let currentGalacticMarketCommission = 10;

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
    'forest'
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
let nonExhaustiveResources = false;
let currentRunIsMegaStructureRun = false;
let megaStructureTabNotificationShown = false;
let hasVisitedMegaStructure = false;
let megaStructureTabUnlocked = false;
let rebirthPossible = false;
let sfx = false;
let backgroundAudio = false;
let saveExportCloudFlag = false;
let autoSaveToggle = false;
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
    // Overview
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

    // Run
    "stat_starSystem": getStatStarSystem,
    "stat_currentWeather": getStatCurrentWeather,
    "stat_cash": getStatCash,
    "stat_apAnticipated": getStatApAnticipated,
    "stat_antimatter": getStatAntimatter,

    // Resources
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

    // Compounds
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

    // Research
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

    // Energy
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

    // Space Mining
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

    // Interstellar
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

export function resetAllVariablesOnRebirth() {
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
    revealedTechArray = [];
    upcomingTechArray = [];
    unlockedResourcesArray = ['hydrogen'];
    unlockedCompoundsArray = [];
    temporaryCoreTechRowsRepo = null;
    canAffordDeferred = null;
    originalFrameNumbers = {};
    baseSearchAsteroidTimerDuration = 120000;
    baseInvestigateStarTimerDuration = 400000;
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
    megastructureAntimatterAmount = 0;

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

    setCurrentPrecipitationRate(0);
    stopWeatherEffect();
    setWeatherEffectOn(false);
}

export function captureGameStatusForSaving(type) {
    // Ensure platform is detected before saving
    if (!userPlatform[0] || !hostSource) {
        // Initialize user platform
        detectAndSetUserPlatform();

        function detectAndSetUserPlatform() {
            const ua = window.navigator.userAgent.toLowerCase();
            let platform = 'unknown';
            let platformData = {};
            const hostname = window?.location?.hostname;
            
            // Check if running in Electron
            if (window && window.process && window.process.versions && window.process.versions.electron) {
                platform = 'electron';
                platformData = {
                    electronVersion: window.process.versions.electron,
                    nodeVersion: window.process.versions.node,
                    chromeVersion: window.process.versions.chrome
                };
            } 
            // Check if running on GitHub Pages
            else if (window.location.hostname.includes('github.io')) {
                platform = 'github';
                platformData = {
                    hostname: window.location.hostname,
                    pathname: window.location.pathname
                };
            }
            // Check if running on Itch.io
            else if (window.location.hostname.includes('itch.io')) {
                platform = 'itch';
                platformData = {
                    hostname: window.location.hostname,
                    pathname: window.location.pathname,
                    referrer: document.referrer
                };
            }
            
            userPlatform = [platform, ua, platformData];
            hostSource = hostname || (platform === 'electron' ? 'electron' : 'unknown');
        }
    }
    let gameState = {};

    if (type === 'manualExportCloud') {
        setSaveName(document.getElementById('saveName').value);
        localStorage.setItem('saveName', getSaveName());
    }

    if (type === 'initialise') {
        localStorage.setItem('saveName', getSaveName());
    }

    // Large objects directly
    gameState.resourceData = JSON.parse(JSON.stringify(resourceData));
    gameState.starSystems = JSON.parse(JSON.stringify(starSystems));
    gameState.galacticMarket = JSON.parse(JSON.stringify(galacticMarket));
    gameState.ascendencyBuffs = JSON.parse(JSON.stringify(ascendencyBuffs));
    gameState.achievementsData = JSON.parse(JSON.stringify(achievementsData));

    // Global variables
    gameState.saveName = getSaveName();
    gameState.currentTheme = getCurrentTheme();
    gameState.themesTriedArray = themesTriedArray;
    gameState.autoSaveFrequency = getAutoSaveFrequency();
    gameState.currentStarSystem = getCurrentStarSystem();
    gameState.currencySymbol = getCurrencySymbol();
    gameState.constituentPartsObject = getConstituentPartsObject();
    gameState.techUnlockedArray = techUnlockedArray;
    gameState.revealedTechArray = revealedTechArray;
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
    gameState.allTimeTotalRocketsLaunched = allTimeTotalRocketsLaunched;
    gameState.allTimeTotalStarShipsLaunched = allTimeTotalStarShipsLaunched;
    gameState.allTimeTotalAsteroidsDiscovered = allTimeTotalAsteroidsDiscovered;
    gameState.allTimeTotalLegendaryAsteroidsDiscovered = allTimeTotalLegendaryAsteroidsDiscovered;
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
    gameState.miaplacidusMilestoneLevel = miaplacidusMilestoneLevel;
    gameState.megaStructureTechsResearched = megaStructureTechsResearched;
    gameState.megaStructureAntimatterAmount = megastructureAntimatterAmount;

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

    // Flags
    gameState.flags = {
        autoSaveToggle: autoSaveToggle,
        weatherEffectSettingToggle: weatherEffectSettingToggle,
        newsTickerSetting: newsTickerSetting,
        notificationsToggle: notificationsToggle,
        customPointerEnabled: customPointerEnabled,
        mouseParticleTrailEnabled: mouseParticleTrailEnabled,
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
        currentRunIsMegaStructureRun: currentRunIsMegaStructureRun,
        megaStructureTabNotificationShown: megaStructureTabNotificationShown,
        hasVisitedMegaStructure: hasVisitedMegaStructure,
        megaStructureTabUnlocked: megaStructureTabUnlocked,
        infinitePower: infinitePower,
        megaStructureResourceBonus: megaStructureResourceBonus,
        storageAdderBonus: storageAdderBonus,
        permanentAntimatterUnlock: permanentAntimatterUnlock,
        nonExhaustiveResources: nonExhaustiveResources,
        miaplacidusEndgameStoryShown: miaplacidusEndgameStoryShown,
    }

    return gameState;
}

export function restoreGameStatus(gameState, type) {
    return new Promise((resolve, reject) => {
        try {
            // Game variables
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
            

            // Global variables
            if (type === 'cloud') {
                if (gameState.saveName) {
                    setSaveName(gameState.saveName);
                }
            }

            setCurrentTheme(gameState.currentTheme);
            themesTriedArray = Array.isArray(gameState.themesTriedArray) ? gameState.themesTriedArray : ['terminal'];
            setAutoSaveFrequency(300000);
            setCurrentStarSystem(gameState.currentStarSystem);
            setCurrencySymbol(gameState.currencySymbol);
            setConstituentPartsObject(gameState.constituentPartsObject);
            blackHoleDiscovered = gameState.blackHoleDiscovered ?? false;
            blackHoleDiscoveryProbability = gameState.blackHoleDiscoveryProbability ?? 0;
            techUnlockedArray = gameState.techUnlockedArray;
            revealedTechArray = gameState.revealedTechArray;
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
            allTimeTotalRocketsLaunched = gameState.allTimeTotalRocketsLaunched ?? 0;
            allTimeTotalStarShipsLaunched = gameState.allTimeTotalStarShipsLaunched ?? 0;
            allTimeTotalAsteroidsDiscovered = gameState.allTimeTotalAsteroidsDiscovered ?? 0;
            allTimeTotalLegendaryAsteroidsDiscovered = gameState.allTimeTotalLegendaryAsteroidsDiscovered ?? 0;
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
            megaStructuresInPossessionArray = gameState.megaStructuresInPossessionArray ?? [];
            miaplacidusMilestoneLevel = gameState.miaplacidusMilestoneLevel ?? 0;
            megaStructureTechsResearched = gameState.megaStructureTechsResearched ?? [];
            megastructureAntimatterAmount = gameState.megaStructureAntimatterAmount ?? 0;
            
            if (gameState.compoundCreateDropdownRecipeText) {
                compoundCreateDropdownRecipeText = gameState.compoundCreateDropdownRecipeText;
            }

            // Flags
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
            currentRunIsMegaStructureRun = gameState.flags.currentRunIsMegaStructureRun ?? false;
            megaStructureTabNotificationShown = gameState.flags.megaStructureTabNotificationShown ?? false;
            hasVisitedMegaStructure = gameState.flags.hasVisitedMegaStructure ?? false;
            megaStructureTabUnlocked = gameState.flags.megaStructureTabUnlocked ?? false;
            infinitePower = gameState.flags.infinitePower ?? false;
            megaStructureResourceBonus = gameState.flags.megaStructureResourceBonus ?? false;
            storageAdderBonus = gameState.flags.storageAdderBonus ?? false;
            permanentAntimatterUnlock = gameState.flags.permanentAntimatterUnlock ?? false;
            nonExhaustiveResources = gameState.flags.nonExhaustiveResources ?? (ascendencyBuffs?.nonExhaustiveResources?.boughtYet > 0) ?? false;
            miaplacidusEndgameStoryShown = gameState.flags.miaplacidusEndgameStoryShown ?? false;

            selectTheme(getCurrentTheme());
            applyCustomPointerSetting();
            setLastSavedTimeStamp(gameState.timeStamp);
            offlineGains(false);

            if (warMode && getBattleResolved()[0] === false) {
                battleUnits = { player: [], enemy: [] };
            }

            patchNeonAutoBuyers();
            patchAchievementsPrecipitation();
            fixLaunchPadAndSpaceTelescope(rocketsBuilt, asteroidArray);
            
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

export function patchNeonAutoBuyers() {
    setResourceDataObject(true, 'resources', ['neon', 'upgrades', 'autoBuyer', 'normalProgression']);

    const tech = getTechUnlockedArray();
    const tier =
        tech.includes('rocketComposites') ? 4 :
        tech.includes('quantumComputers') ? 2 :
        getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'currentTierLevel']) === 0 ? 1 :
        null;

    if (tier) {
        setResourceDataObject(tier, 'resources', ['neon', 'upgrades', 'autoBuyer', 'currentTierLevel']);
    }
}

export function patchAchievementsPrecipitation() { //to add unlocked compounds to saves
    const unlockedTechs = getTechUnlockedArray();
    const unlockedCompounds = getUnlockedCompoundsArray();

    const techToCompoundMap = {
        hydroCarbons: 'diesel',
        glassManufacture: 'glass',
        aggregateMixing: 'concrete',
        steelFoundries: 'steel',
        neutronCapture: 'titanium',
        neonFusion: 'water'
    };

    for (const tech in techToCompoundMap) {
        const compound = techToCompoundMap[tech];
        if (unlockedTechs.includes(tech) && !unlockedCompounds.includes(compound)) {
            setUnlockedCompoundsArray(compound);
        }
    }
}

function fixLaunchPadAndSpaceTelescope(rocketsBuilt, asteroidArray) { //for fixing saves broken by my carelessness in migration.
    if (rocketsBuilt.length > 0) {
        setResourceDataObject(true, 'space', ['upgrades', 'launchPad', 'launchPadBoughtYet']);
    
        if (!canFuelRockets && getTechUnlockedArray().includes('advancedFuels')) {
            canFuelRockets = true;
        }
    
        rocketsBuilt.forEach(rocket => {
            const partsRequired = getResourceDataObject('space', ['upgrades', rocket, 'parts']);
            setResourceDataObject(partsRequired, 'space', ['upgrades', rocket, 'builtParts']);
        });
    }
    
    if (asteroidArray.length > 0 || starVisionDistance > 0) {
        setResourceDataObject(true, 'space', ['upgrades', 'spaceTelescope', 'spaceTelescopeBoughtYet']);
    }
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

    const constituentPartsRatio1 = getResourceDataObject('compounds', [compoundToCreate, 'createsFromRatio1']) || 0;
    const constituentPartsRatio2 = getResourceDataObject('compounds', [compoundToCreate, 'createsFromRatio2']) || 0;
    const constituentPartsRatio3 = getResourceDataObject('compounds', [compoundToCreate, 'createsFromRatio3']) || 0;
    const constituentPartsRatio4 = getResourceDataObject('compounds', [compoundToCreate, 'createsFromRatio4']) || 0;

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
            constituentPartsQuantityNeeded1 = createAmount * constituentPartsRatio1;
            constituentPartsQuantityNeeded2 = createAmount * constituentPartsRatio2;
            constituentPartsQuantityNeeded3 = createAmount * constituentPartsRatio3;
            constituentPartsQuantityNeeded4 = createAmount * constituentPartsRatio4;
            break;
        case 'Max Possible':
            createAmount = Math.floor(maxCompoundToCreate * 1);
            constituentPartsQuantityNeeded1 = createAmount * constituentPartsRatio1;
            constituentPartsQuantityNeeded2 = createAmount * constituentPartsRatio2;
            constituentPartsQuantityNeeded3 = createAmount * constituentPartsRatio3;
            constituentPartsQuantityNeeded4 = createAmount * constituentPartsRatio4;
            break;
        case 'Up to 75%':
            createAmount = Math.floor(maxCompoundToCreate * 0.75);
            constituentPartsQuantityNeeded1 = createAmount * constituentPartsRatio1;
            constituentPartsQuantityNeeded2 = createAmount * constituentPartsRatio2;
            constituentPartsQuantityNeeded3 = createAmount * constituentPartsRatio3;
            constituentPartsQuantityNeeded4 = createAmount * constituentPartsRatio4;
            break;
        case 'Up to 67%':
            createAmount = Math.floor(maxCompoundToCreate * (2 / 3));
            constituentPartsQuantityNeeded1 = createAmount * constituentPartsRatio1;
            constituentPartsQuantityNeeded2 = createAmount * constituentPartsRatio2;
            constituentPartsQuantityNeeded3 = createAmount * constituentPartsRatio3;
            constituentPartsQuantityNeeded4 = createAmount * constituentPartsRatio4;
            break;
        case 'Up to 50%':
            createAmount = Math.floor(maxCompoundToCreate * 0.5);
            constituentPartsQuantityNeeded1 = createAmount * constituentPartsRatio1;
            constituentPartsQuantityNeeded2 = createAmount * constituentPartsRatio2;
            constituentPartsQuantityNeeded3 = createAmount * constituentPartsRatio3;
            constituentPartsQuantityNeeded4 = createAmount * constituentPartsRatio4;
            break;
        case 'Up to 33%':
            createAmount = Math.floor(maxCompoundToCreate * (1 / 3));
            constituentPartsQuantityNeeded1 = createAmount * constituentPartsRatio1;
            constituentPartsQuantityNeeded2 = createAmount * constituentPartsRatio2;
            constituentPartsQuantityNeeded3 = createAmount * constituentPartsRatio3;
            constituentPartsQuantityNeeded4 = createAmount * constituentPartsRatio4;
            break;
        case '50000':
            createAmount = Math.min(maxCompoundToCreate, 50000);
            constituentPartsQuantityNeeded1 = createAmount * constituentPartsRatio1;
            constituentPartsQuantityNeeded2 = createAmount * constituentPartsRatio2;
            constituentPartsQuantityNeeded3 = createAmount * constituentPartsRatio3;
            constituentPartsQuantityNeeded4 = createAmount * constituentPartsRatio4;
            break;
        case '5000':
            createAmount = Math.min(maxCompoundToCreate, 5000);
            constituentPartsQuantityNeeded1 = createAmount * constituentPartsRatio1;
            constituentPartsQuantityNeeded2 = createAmount * constituentPartsRatio2;
            constituentPartsQuantityNeeded3 = createAmount * constituentPartsRatio3;
            constituentPartsQuantityNeeded4 = createAmount * constituentPartsRatio4;
            break;
        case '500':
            createAmount = Math.min(maxCompoundToCreate, 500);
            constituentPartsQuantityNeeded1 = createAmount * constituentPartsRatio1;
            constituentPartsQuantityNeeded2 = createAmount * constituentPartsRatio2;
            constituentPartsQuantityNeeded3 = createAmount * constituentPartsRatio3;
            constituentPartsQuantityNeeded4 = createAmount * constituentPartsRatio4;
            break;
        case '50':
            createAmount = Math.min(maxCompoundToCreate, 50);
            constituentPartsQuantityNeeded1 = createAmount * constituentPartsRatio1;
            constituentPartsQuantityNeeded2 = createAmount * constituentPartsRatio2;
            constituentPartsQuantityNeeded3 = createAmount * constituentPartsRatio3;
            constituentPartsQuantityNeeded4 = createAmount * constituentPartsRatio4;
            break;
        case '5':
            createAmount = Math.min(maxCompoundToCreate, 5);
            constituentPartsQuantityNeeded1 = createAmount * constituentPartsRatio1;
            constituentPartsQuantityNeeded2 = createAmount * constituentPartsRatio2;
            constituentPartsQuantityNeeded3 = createAmount * constituentPartsRatio3;
            constituentPartsQuantityNeeded4 = createAmount * constituentPartsRatio4;
            break;
        case '1':
            createAmount = Math.min(maxCompoundToCreate, 1);
            constituentPartsQuantityNeeded1 = createAmount * constituentPartsRatio1;
            constituentPartsQuantityNeeded2 = createAmount * constituentPartsRatio2;
            constituentPartsQuantityNeeded3 = createAmount * constituentPartsRatio3;
            constituentPartsQuantityNeeded4 = createAmount * constituentPartsRatio4;
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
        constituentParts.push(`${amountConstituentPart1} ${constituentPartString1}`);
    }
    if (amountConstituentPart2 > 0) {
        constituentParts.push(`${amountConstituentPart2} ${constituentPartString2}`);
    }
    if (amountConstituentPart3 > 0) {
        constituentParts.push(`${amountConstituentPart3} ${constituentPartString3}`);
    }
    if (amountConstituentPart4 > 0) {
        constituentParts.push(`${amountConstituentPart4} ${constituentPartString4}`);
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

export function setTechUnlockedArray(value) {
    if (value === 'run1' && techUnlockedArray.length === 1 && techUnlockedArray[0] === 'apAwardedThisRun' && value !== 'compoundMachining') {
        techUnlockedArray = [];
        return;
    }

    techUnlockedArray.unshift(value);
}


export function getRevealedTechArray() {
    return revealedTechArray;
}

export function setRevealedTechArray(value) {
    revealedTechArray.unshift(value);
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
    return temporaryCoreTechRowsRepo[key];
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
    const factoryStarName = star[1];
    const factoryStarId = starSystems.stars[factoryStarName].factoryStar

    const mappedFactoryStarString = mapFactoryStarValue(factoryStarId);
    starSystems.stars[factoryStarName].factoryStar = mappedFactoryStarString;
    
    for (let i = 0; i < starsWithAncientManuscripts.length; i++) {
        const current = starsWithAncientManuscripts[i];
        const isExactMatch = current.length === star.length && current.every((value, index) => value === star[index]);

        if (isExactMatch) {
            starsWithAncientManuscripts[i][3] = true;
            break;
        }
    }
}

export function setMegaStructuresInPossessionArray(value) {
    megaStructuresInPossessionArray.push(value);
}

export function getMegaStructuresInPossessionArray() {
    return megaStructuresInPossessionArray;
}

export function getFactoryStarsArray() {
    return factoryStarsArray;
}

export function setFactoryStarsArray(value) {
    factoryStarsArray.push(value);
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

export function getMegaStructureTabUnlocked() {
    return megaStructureTabUnlocked;
}

export function setMegaStructureTabUnlocked(value) {
    megaStructureTabUnlocked = value;
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

export function setMegaStructureTechsResearched(value) {
    megaStructureTechsResearched.push(value);
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
    const start = enemyFleetPowerAtBattleStart;
    const current = getStarSystemDataObject('stars', ['destinationStar', 'enemyFleets', 'fleetPower'], true) ?? 0;
    return Math.max(0, start - current);
}

function getStatEnemyTotalDefenceOvercomeAllTime() {
    return 'N/A';
}

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

export function setMiaplacidusEndgameStoryShown(value) {
    miaplacidusEndgameStoryShown = value;
}

export function getMinimumBlackHoleChargeTime() {
    return MINIMUM_BLACK_HOLE_CHARGE_TIME;
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
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠛⠋⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`,
    'battleArt': `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡀⠤⠠⠐⠒⠀⠉⣉⣉⠀⠁⠀⠀⠄⠤⠤⠬⠤⠭⢈⡉⠍⢁⠒⡒⠀⠤⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⠤⠐⠒⣋⢁⡀⢀⢲⣔⣂⣀⣒⣊⣴⣚⢁⡤⣍⣻⣛⣒⣺⠶⣬⣁⣤⣍⡋⠝⢒⠴⠭⢦⣀⡒⣤⣉⡐⠂⠤⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠤⢒⠈⠀⣀⣤⣴⠿⠖⠯⠹⠛⠓⠒⠛⠛⢿⠿⣷⠾⢿⢾⡿⢯⣙⣑⣋⠛⣽⠛⢛⡩⣟⣟⣢⣽⣶⣦⣤⣀⣛⣏⠉⠛⡓⠦⢄⣁⡒⠠⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠄⢂⣁⣴⠞⠒⣊⡝⡋⢁⣠⣠⣤⣴⣴⡴⣿⢲⡖⣮⣍⡛⠙⢺⡿⣷⡤⠶⣏⢿⣻⣿⠾⣞⣓⣛⣛⠻⠟⠛⠛⢿⣻⠛⣗⣩⣭⣷⡟⢻⡉⢛⠲⢤⣀⡈⠐⡠⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⠐⣩⣴⢞⣩⣤⣍⣁⡐⡺⡆⠴⠟⠋⠉⠭⢛⠻⣿⣟⣿⣛⣿⡱⣯⡵⣶⢫⣿⡷⣍⣸⣟⣫⠭⠿⠛⠉⠉⠉⢁⠤⠤⢤⡆⣽⣿⢟⣛⣁⣁⣤⣄⣜⣿⣽⣶⣼⣿⣴⣭⣆⢈⠂⢄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠔⣨⣴⣿⣯⠰⢟⣟⠭⡤⣲⣏⡔⠒⢂⣤⡦⣶⣶⢶⡔⠙⣿⣾⣽⣷⣿⣳⣿⣽⢿⡽⠖⠋⢁⣀⣤⣀⣔⣀⠤⢄⣿⣿⡟⣶⣦⣾⣿⠿⣮⣿⣯⣉⣿⣿⣿⣟⠋⠉⠉⠛⠿⣯⣿⣧⣝⣞⠯⢆⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠔⠊⠠⣼⣷⣿⣷⢿⣞⣯⢆⡍⣻⡿⣙⣳⣦⠾⣿⣿⣭⣷⣎⣄⣴⣿⣟⡿⣿⣿⡿⢿⣛⣭⡀⣠⣦⣵⣟⡿⣴⣿⠞⠃⠀⠹⣿⣿⣿⣿⣿⣹⣿⣿⣿⣿⣝⢼⢻⡿⣿⣷⣖⣤⣐⣄⢍⠻⣿⣾⣝⢿⣯⣜⡈⠢⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠔⠁⢀⣤⣾⣿⣿⣯⢖⣋⣍⣼⣟⣩⡞⣿⣛⣿⣶⠿⢻⣿⡿⣯⡻⣝⠿⣞⡾⣽⣿⣭⠞⠨⣋⠁⢋⣿⣿⣯⣿⣿⣿⣿⣿⢶⣄⣦⣿⣿⣿⡉⢈⠓⣿⡁⠈⢉⠙⡏⣿⡿⡿⠋⠉⢽⣯⣿⢭⣧⣴⡽⣿⣿⣶⣯⣷⡆⠈⣤⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⠊⠀⣠⣴⣿⣿⣿⣿⡿⣱⣭⡿⣳⣿⣋⣩⣿⣟⣳⡳⡏⣁⡚⣩⣷⣳⢳⡯⣟⠺⠹⣞⣳⢶⣿⣶⣤⡾⣿⣿⢻⡗⣯⣿⣿⣿⡿⢾⣿⣿⣿⣿⣿⣿⣆⣽⣸⣄⣠⣿⣡⣷⣽⡅⠀⢠⠀⢀⣈⢻⣿⣷⣿⣽⣿⣿⣿⣿⣶⣼⣿⣹⣷⢕⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠞⠀⠐⣿⣿⣿⣿⣿⣻⣟⣴⣿⣿⣳⣟⣳⣿⣿⡟⡒⠙⣛⡽⣿⠋⣽⢧⢯⣳⢿⣭⣛⣟⡼⡵⠹⣖⣫⠷⣾⣿⣳⢟⣶⣿⣿⡿⠟⣻⣾⣿⣷⣯⣿⣿⣿⣿⣿⣷⣽⣿⣿⣿⣿⣿⣿⣳⡌⠦⣄⠋⣮⡿⣿⣿⣿⣿⣻⣿⣯⣿⣿⣿⣷⣿⣮⣷⢕⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠔⠁⠐⣠⣼⣿⣿⣿⣿⡧⣿⣧⣦⣿⣯⢵⣻⣹⣿⣾⠛⣡⣩⡲⠧⣷⣾⡹⣞⡧⢟⡽⣲⡽⢾⣽⢟⡯⠔⠒⣼⣟⣰⣟⡿⣿⠋⠁⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣮⣶⣄⡀⢘⣿⣽⠿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⡽⡻⣿⣱⡤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⢃⢤⣿⣻⣿⣿⣿⣿⡿⣿⣾⣯⢙⠿⢿⣷⣞⣩⣿⣭⡴⣓⣼⠯⢙⣪⠵⡼⣋⠿⡽⢊⡴⢧⣟⣳⢮⢣⢌⢦⡊⠴⣨⣿⣿⣿⣧⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣎⣿⣿⣿⣟⣿⣿⣿⣿⣿⣿⣿⣭⡺⣳⣶⣮⠢⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠌⢠⣷⣏⣿⣿⣿⣿⢻⣿⠐⠋⣹⡏⠈⣦⣾⢻⢋⣵⣾⣷⢿⠟⠩⢈⣟⢌⠲⡱⣯⡟⣶⢫⡞⡽⡲⢧⠏⣞⡸⣆⢳⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡷⡑⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⢂⣼⣽⣿⡿⠻⠋⣿⣾⣽⡧⢒⣽⡟⣼⡇⣿⣿⣿⢿⣾⢿⢫⣧⣀⡿⢏⢫⠚⣩⣵⣶⣬⣵⣧⣼⣿⣿⣿⣿⣿⣷⢲⢹⣿⠟⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⣱⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⠽⣎⢆⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⡔⢀⣾⣟⡾⣿⣦⡔⡚⢿⣾⣉⣴⣿⣿⠟⣻⣷⢿⣿⡿⣼⣻⢆⣿⣿⡋⢤⣲⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⢟⡿⣟⣈⣽⠿⠉⣰⣾⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⢻⣧⠢⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠜⣠⣾⣿⣽⣿⣿⣿⣿⣄⣩⠟⣡⣿⣿⣿⣷⣭⣿⣏⢿⣯⣿⣷⢎⣽⢷⣿⣐⢤⣿⣿⣿⣿⣿⣿⣿⢟⣿⣥⣶⢹⢽⣿⣿⡿⣍⣶⡟⢫⣿⣻⣿⣿⣿⣿⡦⣿⣍⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⡻⣾⣷⡡⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠜⣰⣿⣿⡿⣿⣿⣿⣿⣭⣿⣷⣿⣿⣿⣿⠟⡣⠺⠟⠻⣿⣿⣼⣿⡗⢻⣽⣿⣽⣿⣿⣿⣿⣾⣿⣟⡿⢻⣏⣠⣾⣽⣿⣿⢿⡿⠿⣯⣷⣄⣻⣝⣿⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⡟⣿⣿⣿⣧⣿⢯⣷⣡⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠌⣀⣿⣛⣽⠃⠻⠿⠿⢿⠋⢘⣿⣻⡿⢳⣵⠞⠓⠫⣕⣦⣌⢻⣿⣿⢲⡽⣷⣟⡼⣿⣿⣿⣾⣿⣿⣿⣿⣛⣽⢻⣿⣿⣷⣿⣽⣿⣿⣷⣤⢮⡻⠿⣿⣿⣿⣿⣹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⡿⠹⣿⣏⠉⡟⣯⢿⣻⣷⡡⠀⠀⠀⠀⠀
⠀⠀⠀⠀⡘⡰⣿⡿⣿⣿⣧⣄⠴⣀⣜⣠⣿⣿⠛⢀⡟⢡⡤⠶⡛⠪⣯⢻⣈⢿⣫⣗⣻⣼⣿⢶⣿⣾⣿⣿⣿⣿⢯⢾⠽⢻⣿⣿⠟⠟⣿⣿⣿⣿⣿⣿⣿⣷⣿⣷⣽⣿⣻⡿⣿⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣽⣿⣿⣿⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣼⣿⣿⣿⣿⣿⣿⣿⠀⢷⡜⢿⣿⣿⣵⢡⠀⠀⠀⠀
⠀⠀⠀⢠⢡⣷⣿⣷⣨⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⠘⠏⣿⠐⡀⡇⣄⣿⣞⣯⠸⡿⠳⣿⣿⢿⣾⡷⡽⠛⣿⣝⣮⣟⢣⡶⣿⣿⡇⢰⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣷⣶⣿⣯⣹⣟⣿⣟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣗⣳⡺⣿⣿⣻⣧⠃⠀⠀⠀
⠀⠀⢀⠃⣾⣿⣿⣿⢿⣮⡙⠻⣿⣽⣿⣿⣿⢿⣿⡐⠀⠉⠊⡜⣰⣿⡿⣿⡯⣷⣷⡄⣻⣹⣯⣯⣻⣿⣿⡻⣾⡷⠮⣵⣶⡿⣿⣿⣿⠶⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣿⣿⣿⣿⣿⡿⠟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⡟⢿⣹⣿⣯⡟⡀⠀⠀
⠀⠀⡜⣸⡟⢿⡿⠃⣾⣿⣿⣷⣾⣿⣿⣿⣿⣿⣿⣷⣖⣤⣾⣼⣷⣗⠃⢠⣿⣻⣿⣿⣿⣭⣿⣿⣿⣿⣿⣿⣦⣹⡻⣿⣛⣧⣊⣡⣯⣤⣼⣯⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣿⣏⢙⣿⣿⣿⣿⣿⣷⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣇⣿⣿⣿⣿⡽⣱⠀⠀
⠀⢠⢡⣿⣷⡾⣧⠀⣿⣿⣿⣿⣿⣿⡟⠿⣿⣿⣿⣿⣵⣷⣿⣿⣿⣧⠖⣿⣿⣷⡿⢻⣿⣿⣿⣿⣿⣿⣿⢿⣿⣽⣿⣿⣿⣾⣟⣿⠿⢻⣍⣻⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⣿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡽⣯⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣿⣿⣿⣿⡃⡄⠀
⠀⡌⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠛⢯⡖⠘⠉⢿⣽⣿⣿⣿⢿⠟⢃⣴⣿⣿⣿⢿⢵⣿⣿⣿⣿⣿⣯⢞⣞⣹⡟⠧⠉⠛⠿⣿⣿⣮⡤⡹⠟⢿⣿⣿⣿⣿⣿⣿⣟⣛⣯⡷⣟⢫⡵⣯⣿⣿⣿⣿⣿⣿⣿⣿⣟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⠠⠀
⢀⠁⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⡎⢀⣴⠀⣿⣿⣿⣿⣰⣿⣶⣿⢝⣿⡿⢁⡾⠐⣿⣿⣿⣿⣿⣿⣟⡿⣿⣿⣷⣶⣶⣶⣩⣽⣷⣽⣧⣟⣁⢸⣯⣛⢿⡿⣛⣎⣝⣾⣟⡾⢛⣼⣯⢹⡻⢯⣿⣩⠻⡝⢯⣭⠿⣿⣿⣿⣿⣿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⣿⣿⣿⡀⡄
⡞⢘⣿⣿⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⡣⢊⣽⣿⣿⣿⣿⣿⣿⣧⣞⣟⡃⣦⢇⣬⣿⡟⣿⣿⣏⣿⣻⣷⣦⠿⣿⣿⣿⠿⡿⠿⢿⠻⢿⣿⣧⣿⣿⡛⢿⢿⣿⣴⣾⣻⣿⢻⣿⣙⡶⠯⢭⡿⣤⣾⣧⣹⣿⣿⠿⣼⢿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⣿⢯⣿⢩⣿⣿⡇⢁
⡇⣸⣿⣿⣿⠏⣯⣿⣾⣿⣿⣿⡿⣿⣫⣟⣾⢛⣡⣾⣿⣿⣿⣿⣿⣿⣿⣧⣮⢾⡫⡽⠿⠓⢈⣿⡿⢻⣿⣿⣿⢻⣉⣽⣿⣶⣶⣶⣿⡷⠀⠙⠛⣿⠿⠃⢹⣯⣹⣿⣿⡿⣻⣽⢏⣬⢗⢻⡹⣷⣿⣿⣺⣹⣻⣿⣿⣿⣳⣎⡽⣟⠯⣝⡻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣄⡿⣻⣿⢾⣿⣿⣧⠀
⡇⠉⣿⠋⢻⡘⣿⣿⣿⣿⣿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣫⣹⢿⣿⣿⣏⢼⣡⢎⠏⡀⠰⢢⠊⠳⠟⣿⣿⣿⣿⣟⣿⣿⡟⣿⣿⣿⣿⠇⣤⣄⣀⣀⠀⠀⣹⣾⣿⡏⠐⡿⣡⣽⣾⣿⣯⣷⣾⣼⣿⣿⣿⣽⡷⠿⠾⣿⣳⢽⢾⣻⢽⣳⣧⡏⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣾⣿⣿⣷⣿⣿⠀
⡇⣰⡷⣠⣿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣽⣿⣯⣿⣿⣿⣿⣿⣿⡿⢜⠜⡤⣾⢸⣧⣷⣷⣿⣇⢈⣯⡄⣻⣿⣴⣿⠟⣀⡹⣾⠟⠟⣿⣻⣀⣾⣿⣯⣽⣵⣿⣿⣿⣬⣗⣝⣶⣯⡖⣯⣿⣽⣿⣻⢿⣴⣋⡷⢯⣯⠿⣯⡿⣧⣟⣾⡝⢯⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣿⣿⣿⠀
⡅⣟⣡⣾⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣾⣿⣿⣿⣿⣿⣿⣏⣈⣽⣯⣶⣿⡿⢻⢋⣽⣿⣿⣿⣖⣨⣾⣩⣯⢯⣿⣫⡗⣝⣿⣷⢏⡾⢓⡇⡧⣟⣟⣯⢏⣷⣻⣽⣷⢯⡿⢼⡇⢻⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠄
⡇⣻⢃⣿⣿⢿⣿⣿⣮⣿⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⡟⣿⣹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⣿⣿⣿⣿⣿⣾⣷⣿⣿⣿⣿⣟⣃⣼⣼⢋⣿⡟⢻⣤⡿⣫⣎⡁⢴⡾⣵⢺⣭⠽⣬⢚⣶⣓⠾⣵⣛⢾⣭⡿⣧⣿⣟⣿⣞⡟⣾⡼⣽⢧⠧⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⢩⣿⣿⣿⠂
⡇⢳⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⣤⡾⡧⠿⢩⠎⠁⢲⣶⣎⡷⣦⣞⢷⡳⣏⣞⣻⡘⣯⢳⣭⡻⡵⢫⡟⢞⣓⡵⣬⣬⢷⡾⣝⣳⢏⡟⡎⣿⣍⡽⣭⣛⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣥⣰⣿⣿⣿⠀
⡇⠈⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣿⣿⠿⣿⣿⣿⣿⣇⣿⣿⣻⡷⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡫⢾⡏⠀⡟⢩⣾⠷⡀⠋⠿⣗⣿⣎⢷⡓⢮⠼⠓⣷⢶⣱⢲⣕⣞⣹⣜⣳⢏⣞⡵⣯⣻⡼⣯⣝⣯⣿⣽⣿⣷⢶⢯⡿⣬⡟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀
⡇⠀⣛⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣽⣿⣿⣿⣿⣿⣹⣯⣿⣧⡩⡿⣿⣿⣿⣿⣿⣿⣿⣿⢷⡈⣷⣬⣒⣌⢻⣦⡴⣷⣬⠍⢻⣮⣓⣹⢋⡿⣛⡥⡿⢭⡻⣶⣝⠶⣍⡞⣯⢿⣹⢯⣽⣷⣯⣾⢿⣹⣿⠽⣭⣿⣿⣿⢅⣿⣿⣿⢏⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀
⢣⢠⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣿⣻⣿⣿⣟⡿⡟⣿⣿⣿⣿⡟⣽⢝⣽⣿⠏⠓⠉⠉⣿⡻⣿⣿⣿⣜⠾⢦⢿⢷⣯⣷⢿⣛⠾⣯⣛⣶⢧⣟⣞⡳⡝⣽⢹⢯⡷⣯⣟⣷⣚⢧⣟⣼⢻⣶⢿⣳⣿⣿⢸⣧⢽⡾⣿⣿⣯⠟⣿⣿⢿⣾⣿⣿⣻⣿⣿⣿⣟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀
⠈⡄⢻⣿⣯⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⣟⣿⣿⣿⣾⣬⣞⣻⣿⣶⣶⣴⣦⣸⡁⠙⢻⣿⣿⡞⡿⣷⣿⣿⡿⣏⠟⡿⣴⣛⢮⠻⢼⡝⣳⢽⢪⡽⣶⡽⣟⡖⣷⣻⣧⣟⠾⣿⣻⡿⣷⣿⢣⣿⣟⣍⣿⣿⢽⣧⣿⣿⣿⣿⣽⣿⣿⣿⢿⣿⣿⣿⣷⣽⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀
⠀⢃⢸⣿⣿⣷⣟⣿⢿⣿⣿⣿⣿⣿⣿⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣻⣿⣿⡻⣿⣟⣻⣻⣿⣟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⣠⣬⣿⣛⣿⣏⢆⠻⣿⢶⣽⣞⣻⢖⣊⢷⣹⠾⣝⣫⠾⣧⣳⣈⠿⣝⣞⣲⣟⢧⣾⣻⣿⣯⢷⣻⢷⢻⣟⣧⣾⣿⣯⣿⣷⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣏⢼⣿⣿⣿⡟⠀⠀
⠀⠘⡈⣿⣿⣿⣽⣿⣿⣻⣿⣽⣿⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣿⣯⣿⣿⣿⣾⣿⣿⣿⣷⣿⣿⣿⡿⣿⣿⣿⣿⣿⣿⢿⡿⣿⠛⡾⢷⡹⣿⣏⠻⣿⣧⡯⣝⡼⢚⠝⣿⠿⣧⣻⣗⡛⣾⣟⣿⢽⣻⠳⣿⣿⣵⢿⣿⣻⡿⣻⣿⣿⣦⣟⣲⣿⢛⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣼⣶⣿⣿⣿⢇⠃⠀
⠀⠀⢣⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣯⣇⠈⢻⣿⣼⣷⣍⡟⢻⣷⣧⣯⢷⣿⣭⣲⣸⣴⡟⣳⡿⣏⣷⣽⣬⣾⣿⡾⣏⣟⣴⣿⡏⣿⣵⣽⣣⣿⣾⣿⣿⣿⠍⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡘⠀⠀
⠀⠀⠈⡄⠽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣻⣿⣿⣗⣿⣿⡛⢟⢿⠉⢛⣳⣯⠻⣿⣿⣦⡽⢿⣟⣿⣿⣟⣷⣽⣱⣟⣿⣱⢾⣽⣽⣓⡽⣿⣾⢿⣻⣟⣿⣷⣯⣿⣟⣽⣿⣿⠄⠠⡔⣤⣭⣛⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢣⠁⠀⠀
⠀⠀⠀⠐⢀⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢽⣿⣿⣿⣯⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣄⢐⣟⣿⣤⣤⣟⣿⣿⣎⢫⢿⡳⣿⣿⣾⠣⣜⠓⣿⣷⣻⢿⣍⣷⡾⢹⣿⣿⣏⣿⣿⡿⣿⣿⣿⡟⠁⠀⢠⡾⠛⠋⠛⠻⠶⢌⣹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⠂⠀⠀⠀
⠀⠀⠀⠀⢡⠀⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⣻⡟⠛⠙⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣻⣷⡿⡗⡘⠿⣤⠈⣛⣿⡼⢪⣷⣹⣿⣿⡽⣏⢿⡼⢻⣿⣷⢞⣟⣿⣻⣽⢟⣿⢽⢾⣿⣿⣿⡏⠀⠞⡏⢧⣷⣿⣏⣐⣷⣶⡳⣍⡙⢿⢿⣿⣿⣿⣿⣿⣿⡟⡘⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢃⠱⣆⠣⡈⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣻⣿⣿⣾⣍⡳⣟⣿⡿⣤⠝⣧⡵⡿⣿⣪⣿⣿⣿⣿⠻⣜⠯⢞⣽⣳⡟⣾⣻⢻⢿⠛⣹⣾⣋⡾⣿⣿⣿⣀⢀⣾⣴⣿⣿⣿⣿⣿⣿⣿⡓⠼⣿⣪⣝⣿⣿⣿⣿⣿⡿⡑⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢣⠈⣧⡈⠢⠀⢨⠛⢯⢻⣟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣽⡻⢿⣿⣿⣿⣿⣿⣽⣗⣄⡛⣿⣿⢿⣶⣿⣿⢿⣇⣘⣯⣟⣿⣿⣻⣿⣿⢣⡽⢞⣽⣫⢞⣻⣿⣿⡿⣏⣧⣿⣿⣲⣷⣾⣽⣫⣾⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣳⣯⣽⣿⣿⣿⣿⣿⡿⡑⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢢⠹⣿⣦⣄⠀⠁⠀⠡⠈⠛⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⣈⡁⢶⣾⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣿⣿⣿⣷⣿⣿⣿⣿⣼⢏⣿⣿⣿⣿⣏⢷⡹⣟⣾⣵⢯⣷⣿⣿⣷⣿⣿⡿⣯⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⡑⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠢⡘⣿⣿⣷⣤⡀⠀⠀⠐⡀⢉⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣻⡿⣿⣿⣿⣿⣿⣿⣿⣯⣿⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢓⡇⢀⣷⣿⡿⣿⣘⢧⡟⣵⢿⠞⠳⣾⠿⣿⣿⣿⣿⢿⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠔⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠌⠻⣿⣿⣿⣦⡀⠀⢤⡀⠀⠈⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⡾⣿⣿⣿⢾⢿⣳⣟⣾⡹⣭⢿⣅⣤⣁⣊⣉⠍⠉⢀⡾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢋⠌⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢃⠘⢿⣿⣿⣷⣦⡀⠐⡄⠀⠈⠱⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣽⠃⣿⠿⣿⡟⣶⣿⡕⣮⢷⣭⣯⣽⣯⣎⣁⡀⢁⣤⠴⣿⣻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⡱⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠑⡌⠙⣿⣿⣿⣿⣦⣈⡀⠀⡀⠀⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡻⣿⣿⣿⣿⣮⣿⠿⣽⣟⣿⣿⣿⣿⣽⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠆⣿⣗⣿⣿⣿⢯⢿⣹⣞⡷⣿⣻⣿⣽⣿⡓⠶⣽⠹⠛⣵⣯⠿⣿⣽⡿⢩⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢟⠔⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠢⡀⠛⢿⡻⣿⣿⣿⣤⣈⢄⡀⠀⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⢡⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠇⣸⣽⣿⣏⢞⡷⣯⣛⠷⣮⢻⣽⣾⣿⣿⣿⣿⣷⡆⠐⢠⣿⣭⡾⣿⣿⣥⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢟⠑⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢦⠉⠻⣾⣿⣿⣿⣿⣷⣭⣦⡀⠈⠺⠻⣿⣿⣿⡿⣿⣿⡆⣤⣿⣿⡿⣭⠉⠳⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⡘⣸⣿⡿⡏⠞⣽⢾⠝⣮⣿⣾⣿⣟⢻⠿⠿⢿⠿⣿⣧⡴⢯⣍⡵⠴⢿⣿⣿⣿⣿⡿⢿⣿⣿⣿⣿⣿⣿⣿⡟⡣⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢦⠈⠻⣟⣿⣿⣿⣿⡿⣿⣦⣀⠀⠑⢽⡻⣿⣽⡙⢿⣮⣿⡉⠻⠿⢷⣦⣄⣈⡑⠻⠽⣛⣿⠿⢿⣿⣿⣷⣿⣿⣿⡿⡟⢲⣿⠛⠻⡟⢾⣭⣯⣿⣿⣏⣋⠙⢿⣶⡄⠀⠂⣀⣩⡝⣳⣶⢋⢤⣶⣿⢽⡿⢛⣏⡉⣾⣿⣿⣿⣿⣿⠟⡩⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠢⡈⠛⢽⢿⣿⣿⣮⣽⣿⣷⣦⠀⠻⣿⣿⣧⡀⠉⠉⠉⠀⠀⠓⠒⠲⢮⣝⣻⣻⢶⣮⡭⣓⡲⠿⣿⣫⡯⢟⣻⢏⣼⣿⣷⣿⠷⣿⣿⣿⣿⣿⣿⡿⢿⣶⡢⠤⣇⣁⣀⣩⡶⣫⣿⣟⣾⠿⣾⢿⣾⣛⣶⣾⣿⣿⣿⡿⢟⠁⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠢⢄⠑⠳⣾⣿⣿⠻⣻⡷⡑⡀⠙⢿⣿⣿⣿⣶⣦⣄⡤⠀⠀⢀⣤⣾⡫⠉⠡⢶⢬⠝⠻⠫⠶⢌⠙⢿⠼⣵⠿⢿⣿⣷⣿⣿⣿⣿⣿⣷⣉⡛⢻⡿⢿⣭⣿⣯⣽⣽⣿⣿⣷⣜⣶⡶⣾⣯⣝⣫⣽⣿⣿⠟⣋⠔⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠢⣌⠙⠛⠿⣯⣿⠷⣱⣄⡀⠈⠹⠿⣿⡛⢿⠿⣷⣀⠘⢿⣟⠁⠀⢩⢃⣭⣻⣟⣳⣄⣀⠀⠘⠀⣶⣆⣛⠛⣷⣿⣿⠿⣿⡿⣷⣟⣿⣿⣟⣿⣶⣾⣿⣿⣿⣿⡿⠿⠻⣟⡿⣿⣿⣿⣿⠿⢋⠕⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠑⠢⣀⠈⠻⣆⣫⣽⡿⣗⢦⡐⣤⣉⣈⡽⠚⢻⡿⠟⠚⡩⠔⣣⣾⣿⣋⣩⡍⠿⢿⣿⣦⡄⠿⣾⣧⣶⣍⣉⣛⣳⣥⣴⣮⡽⠿⠟⢻⠿⣛⣟⡏⣡⣴⣶⣿⣟⡵⣿⣽⣿⠿⢋⠅⠊⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠂⠤⡉⠉⠛⢋⣝⢪⠬⣑⣂⣠⣙⣩⣄⣶⣿⣶⣿⠿⠷⠟⠋⠩⣭⣿⣷⣿⣿⣿⣷⣄⠈⠉⠉⠉⢉⣀⣤⣴⣶⣾⣿⣿⢛⣛⣯⠳⠞⣛⣻⡿⣿⠻⢛⣋⠫⠐⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠒⠄⢀⡀⠙⠥⣘⠛⠛⡛⢋⣉⢩⣫⣭⣵⣶⣶⡿⠿⠛⢏⠾⠾⠥⢒⠛⣛⠻⠟⠛⠛⠛⢚⡹⠋⡭⠒⠉⣀⠈⣀⣄⣳⠶⠟⢉⣉⠦⠒⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠒⠀⠤⣀⠈⠈⠉⠉⠋⠉⠹⠩⠄⠀⠀⠀⠁⠀⠀⠀⠀⠉⠀⠀⠀⠀⠉⠈⠁⠀⢀⠀⣤⠤⡴⢛⣉⠱⠔⠚⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠁⠒⠂⠤⠤⠄⣀⢀⣠⣀⣀⣀⣀⣀⣀⣀⣀⣈⣠⣤⣴⣂⣰⡮⠦⠔⠓⠈⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`
}

export function populateVariableDebugger() {
    const debugTextAreaContainer = document.getElementById('debugTextAreaContainer');
    const researchAutoBuyerConfig = getResourceDataObject('research', ['upgrades', 'autoBuyer']);
    const philosophyTechData = getResourceDataObject('philosophyRepeatableTechs');
    
    const variables = [
        { label: "", value: "" },
        { label: "Game Settings:", value: "" },
        { label: "", value: "" },

        { label: "gamestate", value: getGameStateVariable() },
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
    ];    

    debugTextAreaContainer.innerHTML = "";

    variables.forEach((variable) => {
        const div = document.createElement("div");
        const label = document.createElement("span");

        if (variable.value === "" && variable.label !== "") {
            label.style.fontSize = "2rem";
        }

        if (variable.label === "") {
            const blankLineDiv = document.createElement("div");
            blankLineDiv.style.height = "10px";
            debugTextAreaContainer.appendChild(blankLineDiv);
        } else {
            label.innerHTML = variable.value === "" ? `${variable.label}` : `${variable.label}:&nbsp;&nbsp;`;
    
            const valueDiv = document.createElement("span");
            const className = variable.value === null ? "red-disabled-text" : "green-ready-text";
            valueDiv.classList.add(className);
            valueDiv.textContent = formatVariableDebuggerValue(variable.value);
    
            div.appendChild(label);
            div.appendChild(valueDiv);
    
            debugTextAreaContainer.appendChild(div);
        }
    });
}

function formatVariableDebuggerValue(value) {
    if (Array.isArray(value) || typeof value === 'object') {
        const stringifiedValue = JSON.stringify(value);
        return stringifiedValue.length > 2000 ? `${stringifiedValue.slice(0, 2000)}...` : stringifiedValue;
    } else {
        return value;
    }
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
