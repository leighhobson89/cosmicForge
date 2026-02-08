import {
    changeAsteroidArray,
    getBlackHoleAlwaysOn,
    getBlackHoleDiscovered,
    getActivatedFuelBurnObject,
    getAsteroidArray,
    getBuildingTypeOnOff,
    getCurrentlyTravellingToAsteroid,
    getCurrentStarSystemWeatherEfficiency,
    getDestinationAsteroid,
    getDestinationStar,
    getDestinationStarScanned,
    getMiningObject,
    getRocketDirection,
    getRocketUserName,
    getStarShipBuilt,
    getStarShipTravelling,
    getTechUnlockedArray,
    getUnlockedCompoundsArray,
    getUnlockedResourcesArray,
    removeRocketBuilt,
    setAntimatterUnlocked,
    setCheckRocketFuellingStatus,
    setCurrentlyTravellingToAsteroid,
    setDestinationAsteroid,
    setDestinationStar,
    setDestinationStarScanned,
    setLaunchedRockets,
    setMiningObject,
    setRocketDirection,
    setRocketReadyToTravel,
    setRocketTravelDuration,
    setRocketUserName,
    setRocketsFuellerStartedArray,
    setTimeLeftUntilRocketTravelToAsteroidTimerFinishes,
    setStarShipArrowPosition,
    setStarShipBuilt,
    setStarShipDestinationReminderVisible,
    setStarShipStatus,
    setStarShipTravelling,
    setStarTravelDuration,
    setTimeLeftUntilTravelToDestinationStarTimerFinishes,
    setStellarScannerBuilt,
    getAllRepeatableTechMultipliersObject,
    getPlayerPhilosophy,
    getStatRun,
    setBuildingTypeOnOff
} from "./constantsAndGlobalVars.js";
import {
    getBlackHoleDuration,
    getBlackHolePower,
    getBlackHoleResearchDone,
    getResourceDataObject,
    resourceDataRebirthCopy,
    setBlackHoleDuration,
    setBlackHolePower,
    setResourceDataObject
} from "./resourceDataObject.js";
import { sfxPlayer } from "./audioManager.js";
import { timerManagerDelta } from "./timerManagerDelta.js";
import { trackAnalyticsEvent } from "./analytics.js";
import { randomEventTriggerDescriptions } from "./descriptions.js";
import { forceWeatherCycle, setFleetPricesAfterRepeatables, setStarshipPartPricesAfterRepeatables, setWeatherCycleSecondsRemaining } from "./game.js";

let randomEventUiHandlers = {
    showNotification: null,
    showEventModal: null,
    refreshSpaceMiningRocketSidebar: null,
    isGalacticTabUnlocked: null,
    onTimedEffectStarted: null,
    onAnyEventTriggered: null
};

let eventsMasterSwitch = true; //TRUE TO HAVE EVENTS WORKING IN GAME NOT TO BE CHANGED BY AI
let randomEventDebugLoggingEnabled = false; //DEBUG EVENTS
let eventTimerCountdownAffectedByTimewarp = false; //DEBUG EVENTS
let timedEventTimerAffectedByTimewarp = true; //DEBUG EVENTS
const COUNTDOWN_LOG_BUCKET_SECONDS = 30; //DEBUG
let lastGlobalCountdownLogBucket = null; //DEBUG

const DEFAULT_EVENT_PROBABILITY = 0.30;
const HALFWAY_PROBABILITY_MODIFIER = 0.5;
const PROBABILITY_DECAY_ON_TRIGGER = 0.9;

const MIN_CYCLE_DURATION_MS = 45 * 60 * 1000;
const MAX_CYCLE_DURATION_MS = 75 * 60 * 1000;
const GLOBAL_EVENT_TIMER_ID = 'randomEventGlobalTimer';

const TIMED_EFFECTS_TIMER_ID = 'randomEventTimedEffectsTimer';

const timedEffectDefinitions = {
    galacticMarketLockdown: {
        id: 'galacticMarketLockdown',
        onExpire: () => {
            randomEventUiHandlers.showNotification?.('Galactic Market access restored.', 'info', 5000, 'default');
            randomEventUiHandlers.showEventModal?.('galacticMarketLockdownEnded');
        }
    },
    endlessSummer: {
        id: 'endlessSummer',
        onExpire: () => {
            randomEventUiHandlers.showNotification?.('Endless Summer has ended.', 'info', 5000, 'default');
            randomEventUiHandlers.showEventModal?.('endlessSummerEnded');
            forceWeatherCycle?.();
        }
    },
    minerBrokeDown: {
        id: 'minerBrokeDown',
        onExpire: () => {
            const state = getTimedEffectState('minerBrokeDown') || {};
            const rocketKey = (state && typeof state === 'object') ? state.rocket : null;
            const fallbackRocketName = rocketKey ? formatEventName(String(rocketKey)) : null;
            const rocketName = rocketKey ? (getRocketUserName(rocketKey) || fallbackRocketName) : null;

            setTimedEffectState('minerBrokeDown', { rocket: null });
            randomEventUiHandlers.showNotification?.(
                rocketName ? `Mining operations restored, ${rocketName} has been repaired.` : 'Mining operations restored.',
                'info',
                5000,
                'default'
            );
            randomEventUiHandlers.showEventModal?.('minerBrokeDownEnded', rocketName ? { rocketName } : null);
        }
    },
    supplyChainDisruption: {
        id: 'supplyChainDisruption',
        onExpire: () => {
            const state = getTimedEffectState('supplyChainDisruption') || {};
            const category = (state && typeof state === 'object') ? state.category : null;
            const key = (state && typeof state === 'object') ? state.key : null;
            const itemName = (category && key) ? getItemDisplayName(category, key) : null;

            setTimedEffectState('supplyChainDisruption', { category: null, key: null, percentDown: null });
            randomEventUiHandlers.showNotification?.(
                itemName ? `Supply chains restored (${itemName}).` : 'Supply chains restored.',
                'info',
                5000,
                'default'
            );
            randomEventUiHandlers.showEventModal?.('supplyChainDisruptionEnded', itemName ? { itemName } : null);
        }
    },
    blackHoleInstability: {
        id: 'blackHoleInstability',
        onExpire: () => {
            const state = getTimedEffectState('blackHoleInstability') || {};
            const originalPower = Number(state?.originalPower);
            const originalDuration = Number(state?.originalDuration);

            if (Number.isFinite(originalPower) && originalPower > 0) {
                setBlackHolePower(originalPower);
            }
            if (Number.isFinite(originalDuration) && originalDuration >= 0) {
                setBlackHoleDuration(originalDuration);
            }

            setTimedEffectState('blackHoleInstability', {
                tickAccumulatorMs: 0,
                lastPowerMultiplier: 1,
                lastDurationMultiplier: 1
            });

            randomEventUiHandlers.showNotification?.('Black Hole Instability stabilised.', 'info', 5000, 'default');
            randomEventUiHandlers.showEventModal?.('blackHoleInstabilityEnded');
        }
    }
};

const TIMED_RANDOM_EVENT_IDS = new Set([
    'galacticMarketLockdown',
    'endlessSummer',
    'minerBrokeDown',
    'supplyChainDisruption',
    'blackHoleInstability'
]);

function buildInstantEventUiDescription(eventId, triggerResult) {
    const safe = (triggerResult && typeof triggerResult === 'object') ? triggerResult : {};

    if (eventId === 'powerPlantExplosion') {
        return safe.destroyedBuilding ? `${safe.destroyedBuilding} destroyed.` : 'Power plant destroyed.';
    }

    if (eventId === 'batteryExplosion') {
        return safe.destroyedBuilding ? `${safe.destroyedBuilding} destroyed.` : 'Battery destroyed.';
    }

    if (eventId === 'scienceTheft') {
        const amount = Number(safe.amountStolen);
        if (Number.isFinite(amount) && amount > 0) {
            return `Research halved (-${amount}).`;
        }
        return 'Research halved.';
    }

    if (eventId === 'researchBreakthrough') {
        const amount = Number(safe.amountGained);
        if (Number.isFinite(amount) && amount > 0) {
            return `Research doubled (+${amount}).`;
        }
        return 'Research doubled.';
    }

    if (eventId === 'rocketInstantArrival') {
        const rocketName = safe.rocketName;
        return rocketName ? `${rocketName} instantly arrived.` : 'A travelling rocket instantly arrived.';
    }

    if (eventId === 'antimatterReaction') {
        const rocketName = safe.rocketName ? String(safe.rocketName) : 'A mining rocket';
        const asteroidName = safe.asteroidName ? String(safe.asteroidName) : 'an asteroid';
        const antimatterLost = Number(safe.antimatterLost);
        const lossText = Number.isFinite(antimatterLost) && antimatterLost > 0 ? ` -${antimatterLost} antimatter.` : '';
        return `${rocketName} lost; ${asteroidName} destroyed.${lossText}`;
    }

    if (eventId === 'stockLoss') {
        const itemName = safe.itemName ? String(safe.itemName) : 'Stock';
        const lostPercent = Number(safe.lostPercent);
        if (Number.isFinite(lostPercent) && lostPercent > 0) {
            return `-${lostPercent}% ${itemName}.`;
        }
        return `Stock loss (${itemName}).`;
    }

    if (eventId === 'starshipLostInSpace') {
        return 'Starship lost; destination cleared; fleets reset.';
    }

    return getEventTriggerDescription(eventId);
}

function recordInstantEventHistory(eventId, triggerResult) {
    pushInstantEventHistoryEntry({
        id: eventId,
        name: formatEventName(eventId),
        endedAtMs: Date.now(),
        durationLabel: 'Instant',
        description: buildInstantEventUiDescription(eventId, triggerResult),
        context: (triggerResult && typeof triggerResult === 'object') ? { ...triggerResult } : null
    });
}

const randomEventDefinitions = {
    powerPlantExplosion: {
        id: 'powerPlantExplosion',
        canTrigger: () => {
            const available = getAvailablePowerPlantTypes();
            return available.length > 0;
        },
        trigger: () => {
            const available = getAvailablePowerPlantTypes();
            if (available.length === 0) return false;

            const picked = available[Math.floor(Math.random() * available.length)];
            const destroyed = destroyPowerPlant(picked);
            if (!destroyed) return false;
            return { destroyedBuilding: getBuildingDisplayName(picked) };
        }
    },
    batteryExplosion: {
        id: 'batteryExplosion',
        canTrigger: () => {
            const battery = getHighestBatteryTierWithQuantity();
            return battery !== null;
        },
        trigger: () => {
            const battery = getHighestBatteryTierWithQuantity();
            if (!battery) return false;
            const destroyed = destroyBattery(battery);
            if (!destroyed) return false;
            return { destroyedBuilding: getBuildingDisplayName(battery) };
        }
    },
    scienceTheft: {
        id: 'scienceTheft',
        initialProbability: 0.5,
        canTrigger: () => {
            const current = Number(getResourceDataObject('research', ['quantity']) || 0);
            return current > 1;
        },
        trigger: () => {
            const current = Number(getResourceDataObject('research', ['quantity']) || 0);
            if (current <= 1) return false;

            const amountStolen = Math.ceil(current / 2);
            const next = Math.max(0, current - amountStolen);
            setResourceDataObject(next, 'research', ['quantity']);
            return { amountStolen: amountStolen, remainingResearch: next };
        }
    },
    researchBreakthrough: {
        id: 'researchBreakthrough',
        initialProbability: 0.5,
        canTrigger: () => true,
        trigger: () => {
            const current = Number(getResourceDataObject('research', ['quantity']) || 0);
            const next = Math.floor(Math.max(0, current * 2));
            const gained = next - current;
            setResourceDataObject(next, 'research', ['quantity']);
            return { amountGained: gained, totalResearch: next };
        }
    },
    rocketInstantArrival: {
        id: 'rocketInstantArrival',
        initialProbability: 0.2,
        canTrigger: () => {
            return getTravellingRockets().length > 0;
        },
        trigger: () => {
            const travelling = getTravellingRockets();
            if (!travelling.length) return false;

            const rocket = travelling[Math.floor(Math.random() * travelling.length)];
            const destination = getDestinationAsteroid(rocket);
            const returning = !!getRocketDirection(rocket);

            forceCompleteRocketTravel(rocket);

            return {
                rocketName: getRocketUserName(rocket),
                destination: destination,
                arrivalType: returning ? 'base' : 'asteroid'
            };
        }
    },
    starshipLostInSpace: {
        id: 'starshipLostInSpace',
        initialProbability: 0.1,
        canTrigger: () => {
            const built = typeof getStarShipBuilt === 'function' ? !!getStarShipBuilt() : false;
            const travelling = typeof getStarShipTravelling === 'function' ? !!getStarShipTravelling() : false;
            const scanned = typeof getDestinationStarScanned === 'function' ? !!getDestinationStarScanned() : false;
            const destination = typeof getDestinationStar === 'function' ? getDestinationStar() : null;

            return built && travelling && !scanned && !!destination;
        },
        trigger: () => {
            const destination = typeof getDestinationStar === 'function' ? getDestinationStar() : null;

            if (timerManagerDelta.hasTimer('starShipTravelToDestinationStarTimer')) {
                timerManagerDelta.removeTimer('starShipTravelToDestinationStarTimer');
            }

            setStarShipTravelling(false);
            setStarShipBuilt(false);
            setStarShipStatus(['preconstruction', null]);
            setStarShipArrowPosition(0);
            setStarShipDestinationReminderVisible(false);
            setStarTravelDuration(0);
            setTimeLeftUntilTravelToDestinationStarTimerFinishes(0);

            setStellarScannerBuilt(false);

            setDestinationStarScanned(false);
            setDestinationStar(null);

            const applyRebirthBasePricesForPrefix = (prefix) => {
                const rebirthUpgrades = resourceDataRebirthCopy?.space?.upgrades;
                if (!rebirthUpgrades || typeof rebirthUpgrades !== 'object') return;

                Object.keys(rebirthUpgrades).forEach((key) => {
                    if (!String(key).startsWith(prefix)) return;
                    const base = rebirthUpgrades[key];
                    if (!base || typeof base !== 'object') return;

                    if (typeof base.price === 'number') {
                        setResourceDataObject(base.price, 'space', ['upgrades', key, 'price']);
                    }
                    if (Array.isArray(base.resource1Price)) {
                        setResourceDataObject([...base.resource1Price], 'space', ['upgrades', key, 'resource1Price']);
                    }
                    if (Array.isArray(base.resource2Price)) {
                        setResourceDataObject([...base.resource2Price], 'space', ['upgrades', key, 'resource2Price']);
                    }
                    if (Array.isArray(base.resource3Price)) {
                        setResourceDataObject([...base.resource3Price], 'space', ['upgrades', key, 'resource3Price']);
                    }
                });
            };

            const starshipModules = ['ssStructural', 'ssLifeSupport', 'ssAntimatterEngine', 'ssFleetHangar', 'ssStellarScanner'];
            starshipModules.forEach((module) => {
                setResourceDataObject(0, 'space', ['upgrades', module, 'builtParts']);
                setResourceDataObject(false, 'space', ['upgrades', module, 'finished']);
            });

            applyRebirthBasePricesForPrefix('ss');

            const fleetUnits = ['fleetEnvoy', 'fleetScout', 'fleetMarauder', 'fleetLandStalker', 'fleetNavalStrafer'];
            fleetUnits.forEach((unit) => {
                setResourceDataObject(0, 'space', ['upgrades', unit, 'quantity']);
            });

            applyRebirthBasePricesForPrefix('fleet');

            if (getStatRun?.() > 2) {
                const repeatables = getAllRepeatableTechMultipliersObject?.() || {};
                const philosophy = getPlayerPhilosophy?.();

                if (philosophy === 'supremacist') {
                    const times = Math.max(0, Number(repeatables['1'] || 1) - 1);
                    for (let i = 0; i < times; i++) {
                        setFleetPricesAfterRepeatables();
                    }
                }

                if (philosophy === 'expansionist') {
                    const times = Math.max(0, Number(repeatables['1'] || 1) - 1);
                    for (let i = 0; i < times; i++) {
                        setStarshipPartPricesAfterRepeatables();
                    }
                }
            }

            setResourceDataObject(0, 'fleets', ['attackPower']);
            setResourceDataObject(0, 'fleets', ['defensePower']);
            setResourceDataObject(false, 'space', ['upgrades', 'fleetEnvoy', 'envoyBuiltYet']);

            return {
                notificationText: 'Random Event: Starship lost in space',
                destinationStar: destination
            };
        }
    },
    antimatterReaction: {
        id: 'antimatterReaction',
        initialProbability: 0.1,
        canTrigger: () => {
            return getMiningRockets().length > 0;
        },
        trigger: () => {
            const mining = getMiningRockets();
            if (!mining.length) return false;

            const rocket = mining[Math.floor(Math.random() * mining.length)];
            const rocketNameBeforeReset = getRocketUserName(rocket);
            const asteroidKey = (getMiningObject() || {})[rocket];
            if (!asteroidKey) return false;

            const asteroid = getAsteroidByKey(asteroidKey);
            if (!asteroid) return false;

            const originalAmount = Number(asteroid.originalQuantity ?? 0);
            const remainingAmount = Array.isArray(asteroid.quantity) ? Number(asteroid.quantity[0] ?? 0) : Number(asteroid.quantity ?? 0);
            const minedAmount = Math.max(0, originalAmount - remainingAmount);

            const playerAntimatter = Number(getResourceDataObject('antimatter', ['quantity']) || 0);
            const nextAntimatter = Math.max(0, playerAntimatter - minedAmount);
            setResourceDataObject(nextAntimatter, 'antimatter', ['quantity']);

            changeAsteroidArray(asteroidKey, 'destroyed', true);
            if (Array.isArray(asteroid.quantity)) {
                changeAsteroidArray(asteroidKey, 'quantity', [0, 'red-disabled-text']);
            } else {
                changeAsteroidArray(asteroidKey, 'quantity', 0);
            }
            changeAsteroidArray(asteroidKey, 'beingMined', false);

            setMiningObject(rocket, null);
            resetRocketToUnbuilt(rocket);

            randomEventUiHandlers.refreshSpaceMiningRocketSidebar?.();

            return {
                rocketName: rocketNameBeforeReset,
                asteroidName: asteroid.name ?? asteroidKey,
                antimatterLost: minedAmount
            };
        }
    },
    stockLoss: {
        id: 'stockLoss',
        initialProbability: 0.5,
        canTrigger: () => true,
        trigger: () => {
            const target = pickStockLossTarget();
            if (!target) return false;

            const lossFraction = Math.random() * (0.80 - 0.40) + 0.40;
            const percentLost = Math.floor(lossFraction * 100);

            const remainingQuantity = Math.max(0, Math.round(target.quantity * (1 - lossFraction)));
            const lostQuantity = Math.max(0, target.quantity - remainingQuantity);
            setResourceDataObject(remainingQuantity, target.category, [target.key, 'quantity']);

            const itemName = String(getResourceDataObject(target.category, [target.key, 'nameResource'], true) || target.key);
            const reason = pickStockLossReason();

            return {
                itemName,
                reason,
                lostPercent: percentLost,
                lostQuantity,
                remainingQuantity
            };
        }
    },
    galacticMarketLockdown: {
        id: 'galacticMarketLockdown',
        initialProbability: 0.15,
        canTrigger: () => {
            const galacticUnlocked = typeof randomEventUiHandlers.isGalacticTabUnlocked === 'function'
                ? !!randomEventUiHandlers.isGalacticTabUnlocked()
                : false;
            return galacticUnlocked && !isTimedEffectActive('galacticMarketLockdown');
        },
        trigger: () => {
            startTimedEffect('galacticMarketLockdown', 30 * 60 * 1000);
            return {
                notificationText: 'Random Event: Galactic Market offline (30 minutes)'
            };
        }
    },
    endlessSummer: {
        id: 'endlessSummer',
        initialProbability: 0.5,
        canTrigger: () => !isTimedEffectActive('endlessSummer'),
        trigger: () => {
            const minutes = Math.floor(Math.random() * (50 - 40 + 1)) + 40;
            startTimedEffect('endlessSummer', minutes * 60 * 1000);
            setWeatherCycleSecondsRemaining?.(10);
            return {
                notificationText: `Random Event: Endless Summer (${minutes} minutes)`,
                modalReplacements: { minutes }
            };
        }
    },
    minerBrokeDown: {
        id: 'minerBrokeDown',
        initialProbability: 0.30,
        canTrigger: () => {
            const mining = getMiningRockets();
            return mining.length > 0 && !isTimedEffectActive('minerBrokeDown');
        },
        trigger: () => {
            const mining = getMiningRockets();
            if (!mining.length) return false;

            const pickedRocket = mining[Math.floor(Math.random() * mining.length)];
            startTimedEffect('minerBrokeDown', 15 * 60 * 1000, { rocket: pickedRocket });

            return {
                notificationText: `Random Event: Miner broke down (${getRocketUserName(pickedRocket)})`,
                modalReplacements: { rocketName: getRocketUserName(pickedRocket) }
            };
        }
    },
    supplyChainDisruption: {
        id: 'supplyChainDisruption',
        initialProbability: 0.30,
        canTrigger: () => {
            const candidates = getSupplyChainDisruptionCandidates();
            return candidates.length > 0 && !isTimedEffectActive('supplyChainDisruption');
        },
        trigger: () => {
            const candidates = getSupplyChainDisruptionCandidates();
            if (!candidates.length) return false;

            const picked = candidates[Math.floor(Math.random() * candidates.length)];
            const itemName = getItemDisplayName(picked.category, picked.key);
            const percentDown = Math.floor(Math.random() * (80 - 60 + 1)) + 60;
            startTimedEffect('supplyChainDisruption', 15 * 60 * 1000, { category: picked.category, key: picked.key, percentDown });

            return {
                notificationText: `Random Event: Supply Chain Disruption (${itemName})`,
                modalReplacements: { itemName, percentDown }
            };
        }
    },
    blackHoleInstability: {
        id: 'blackHoleInstability',
        initialProbability: 0.30,
        canTrigger: () => {
            const discovered = typeof getBlackHoleDiscovered === 'function' ? !!getBlackHoleDiscovered() : false;
            const researched = !!getBlackHoleResearchDone();
            return discovered && researched && !isTimedEffectActive('blackHoleInstability');
        },
        trigger: () => {
            const minutes = Math.floor(Math.random() * (25 - 15 + 1)) + 15;
            const durationMs = minutes * 60 * 1000;

            const originalPower = Number(getBlackHolePower());
            const originalDuration = Number(getBlackHoleDuration());

            startTimedEffect('blackHoleInstability', durationMs, {
                originalPower,
                originalDuration,
                tickAccumulatorMs: 0,
                lastPowerMultiplier: 1,
                lastDurationMultiplier: 1
            });

            applyBlackHoleInstabilityShift(true);

            return {
                notificationText: `Random Event: Black Hole Instability (${minutes} minutes)`,
                modalReplacements: {
                    minutes
                }
            };
        }
    }
};

function roundToTwo(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) {
        return num;
    }
    return Math.round(num * 100) / 100;
}

function formatInstabilityDelta(multiplier) {
    const m = Number(multiplier);
    if (!Number.isFinite(m) || m <= 0) {
        return 'unknown';
    }

    const delta = (m - 1) * 100;
    const rounded = Math.round(Math.abs(delta));

    if (rounded === 0) {
        return 'stable';
    }
    if (delta < 0) {
        return `${rounded}% weaker`;
    }
    return `${rounded}% stronger`;
}

function applyBlackHoleInstabilityShift(showNotification) {
    if (!isTimedEffectActive('blackHoleInstability')) {
        return;
    }

    const state = getTimedEffectState('blackHoleInstability') || {};
    const originalPower = Number(state?.originalPower);
    const originalDuration = Number(state?.originalDuration);

    if (!Number.isFinite(originalPower) || originalPower <= 0) {
        return;
    }

    const alwaysOn = typeof getBlackHoleAlwaysOn === 'function' ? !!getBlackHoleAlwaysOn() : false;

    const powerMultiplier = roundToTwo(Math.random() + 0.5); // 0.5 .. 1.5
    const durationMultiplier = roundToTwo(Math.random() + 0.5); // 0.5 .. 1.5

    const nextPower = Math.max(0.01, roundToTwo(originalPower * powerMultiplier));
    setBlackHolePower(nextPower);

    let appliedDurationMultiplier = 1;
    if (!alwaysOn && Number.isFinite(originalDuration) && originalDuration >= 0) {
        appliedDurationMultiplier = durationMultiplier;
        const nextDuration = Math.max(0, Math.round(originalDuration * durationMultiplier));
        setBlackHoleDuration(nextDuration);
    } else if (alwaysOn && Number.isFinite(originalDuration) && originalDuration >= 0) {
        // If the black hole becomes always-on during instability, revert duration to its original.
        setBlackHoleDuration(originalDuration);
    }

    setTimedEffectState('blackHoleInstability', {
        lastPowerMultiplier: powerMultiplier,
        lastDurationMultiplier: appliedDurationMultiplier
    });

    if (showNotification) {
        const powerText = formatInstabilityDelta(powerMultiplier);
        if (alwaysOn) {
            randomEventUiHandlers.showNotification?.(
                `Black Hole Instability: Strength ${powerText} than standard.`,
                'info',
                5000,
                'default'
            );
        } else {
            const durationText = formatInstabilityDelta(appliedDurationMultiplier);
            randomEventUiHandlers.showNotification?.(
                `Black Hole Instability: Strength ${powerText} than standard. Duration ${durationText} than standard.`,
                'info',
                5000,
                'default'
            );
        }
    }
}

function getItemDisplayName(category, key) {
    if (!category || !key) {
        return 'Unknown';
    }

    const data = getResourceDataObject(category, [key], true);
    if (data && typeof data === 'object') {
        const storedName = category === 'compounds' ? data.nameCompound : data.nameResource;
        if (typeof storedName === 'string' && storedName.trim() !== '') {
            return storedName;
        }
    }

    return formatEventName(String(key));
}

function getSupplyChainDisruptionCandidates() {
    const candidates = [];
    const tiers = [1, 2, 3, 4];

    const resourceKeys = Array.from(new Set(['hydrogen', ...(getUnlockedResourcesArray() || [])]));
    resourceKeys.forEach((key) => {
        if (key !== 'hydrogen' && !(getUnlockedResourcesArray() || []).includes(key)) {
            return;
        }

        const hasAny = tiers.some((tier) => {
            const qty = Number(getResourceDataObject('resources', [key, 'upgrades', 'autoBuyer', `tier${tier}`, 'quantity'], true)) || 0;
            return qty > 0;
        });

        if (hasAny) {
            candidates.push({ category: 'resources', key });
        }
    });

    const compoundKeys = Array.from(new Set(getUnlockedCompoundsArray() || []));
    compoundKeys.forEach((key) => {
        const hasAny = tiers.some((tier) => {
            const qty = Number(getResourceDataObject('compounds', [key, 'upgrades', 'autoBuyer', `tier${tier}`, 'quantity'], true)) || 0;
            return qty > 0;
        });

        if (hasAny) {
            candidates.push({ category: 'compounds', key });
        }
    });

    return candidates;
}

function getTimedEffectsRoot() {
    const root = getRandomEventsRoot();
    const stored = root?.timedEffects;
    if (stored && typeof stored === 'object') {
        return stored;
    }

    setResourceDataObject({}, 'randomEvents', ['timedEffects']);
    return getResourceDataObject('randomEvents', ['timedEffects'], true) || {};
}

function getTimedEffectsHistoryRoot() {
    const root = getRandomEventsRoot();
    const stored = root?.timedEffectsHistory;
    if (Array.isArray(stored)) {
        return stored;
    }

    setResourceDataObject([], 'randomEvents', ['timedEffectsHistory']);
    return getResourceDataObject('randomEvents', ['timedEffectsHistory'], true) || [];
}

function getInstantEventsHistoryRoot() {
    const root = getRandomEventsRoot();
    const stored = root?.instantEventsHistory;
    if (Array.isArray(stored)) {
        return stored;
    }

    setResourceDataObject([], 'randomEvents', ['instantEventsHistory']);
    return getResourceDataObject('randomEvents', ['instantEventsHistory'], true) || [];
}

function pushInstantEventHistoryEntry(entry) {
    if (!entry || typeof entry !== 'object') {
        return;
    }

    const history = getInstantEventsHistoryRoot();
    const next = Array.isArray(history) ? [...history, entry] : [entry];
    const maxEntries = 300;
    const trimmed = next.length > maxEntries ? next.slice(next.length - maxEntries) : next;
    setResourceDataObject(trimmed, 'randomEvents', ['instantEventsHistory']);
}

function pushTimedEffectHistoryEntry(entry) {
    if (!entry || typeof entry !== 'object') {
        return;
    }

    const history = getTimedEffectsHistoryRoot();
    const next = Array.isArray(history) ? [...history, entry] : [entry];
    const maxEntries = 200;
    const trimmed = next.length > maxEntries ? next.slice(next.length - maxEntries) : next;
    setResourceDataObject(trimmed, 'randomEvents', ['timedEffectsHistory']);
}

function buildTimedEffectUiDescription(effectId, state) {
    const safeState = (state && typeof state === 'object') ? state : {};

    if (effectId === 'galacticMarketLockdown') {
        return 'Galactic Market is offline.';
    }

    if (effectId === 'endlessSummer') {
        return 'Weather remains Sunny.';
    }

    if (effectId === 'minerBrokeDown') {
        const rocketKey = safeState.rocket;
        const fallbackRocketName = rocketKey ? formatEventName(String(rocketKey)) : null;
        const rocketName = rocketKey ? (getRocketUserName(rocketKey) || fallbackRocketName) : null;
        return rocketName
            ? `${rocketName} mining rate is 0.`
            : 'One mining rocket rate is 0.';
    }

    if (effectId === 'supplyChainDisruption') {
        const category = safeState.category;
        const key = safeState.key;
        const itemName = (category && key) ? getItemDisplayName(category, key) : null;
        const percentDown = Math.max(0, Math.min(100, Math.round(Number(safeState.percentDown) || 0)));
        return itemName
            ? `${itemName} production reduced by -${percentDown}%.`
            : `Production reduced by -${percentDown}%.`;
    }

    if (effectId === 'blackHoleInstability') {
        return 'Black Hole strength (and duration) shift every minute.';
    }

    return 'Ongoing timed effect.';
}

function recordTimedEffectHistory(effectId) {
    const state = getTimedEffectState(effectId);
    if (!state || typeof state !== 'object') {
        return;
    }

    const endedAtMs = Date.now();
    const startedAtMs = Number(state.startedAtMs);
    const totalDurationMs = Number(state.totalDurationMs);
    const durationMs = Number.isFinite(totalDurationMs) && totalDurationMs >= 0
        ? totalDurationMs
        : (Number.isFinite(startedAtMs) && startedAtMs > 0)
            ? Math.max(0, endedAtMs - startedAtMs)
            : null;

    pushTimedEffectHistoryEntry({
        id: effectId,
        name: formatEventName(effectId),
        startedAtMs: Number.isFinite(startedAtMs) ? startedAtMs : null,
        endedAtMs,
        durationMs,
        description: buildTimedEffectUiDescription(effectId, state),
        context: { ...state }
    });
}

function getTimedEffectState(effectId) {
    getTimedEffectsRoot();
    const stored = getResourceDataObject('randomEvents', ['timedEffects', effectId], true);
    if (stored && typeof stored === 'object') {
        return stored;
    }

    const initial = { id: effectId, remainingMs: 0 };
    setResourceDataObject(initial, 'randomEvents', ['timedEffects', effectId]);
    return initial;
}

function setTimedEffectState(effectId, partial) {
    const previous = getTimedEffectState(effectId) || {};
    const next = { ...previous, ...partial };
    setResourceDataObject(next, 'randomEvents', ['timedEffects', effectId]);
    return next;
}

export function isTimedEffectActive(effectId) {
    const remaining = Number(getTimedEffectState(effectId)?.remainingMs) || 0;
    return remaining > 0;
}

export function getTimedEffectRemainingMs(effectId) {
    return Math.max(0, Number(getTimedEffectState(effectId)?.remainingMs) || 0);
}

export function getTimedEffectStateSnapshot(effectId) {
    const state = getTimedEffectState(effectId);
    return state && typeof state === 'object' ? { ...state } : null;
}

function startTimedEffect(effectId, durationMs, extraState = null) {
    const safeDuration = Math.max(0, Number(durationMs) || 0);
    const extra = (extraState && typeof extraState === 'object') ? extraState : null;
    setTimedEffectState(effectId, { remainingMs: safeDuration, totalDurationMs: safeDuration, startedAtMs: Date.now(), ...(extra || {}) });

    if (typeof randomEventUiHandlers.onTimedEffectStarted === 'function') {
        randomEventUiHandlers.onTimedEffectStarted(effectId);
    }
}

function handleTimedEffectExpired(effectId) {
    const def = timedEffectDefinitions[effectId];
    if (def && typeof def.onExpire === 'function') {
        def.onExpire();
    }
}

function scheduleTimedEffectsTimer() {
    if (timerManagerDelta.hasTimer(TIMED_EFFECTS_TIMER_ID)) {
        return;
    }

    let lastRealUpdateTimestamp = null;
    let lastUsingRealTime = !timedEventTimerAffectedByTimewarp;
    let lastUnwarpedUpdateTimestamp = null;
    const lastTimedEffectLogBuckets = {};

    timerManagerDelta.addTimer(TIMED_EFFECTS_TIMER_ID, {
        durationMs: 0,
        repeat: true,
        onUpdate: ({ deltaMs: _deltaMs }) => {
            if (!eventsMasterSwitch) {
                return;
            }

            const unwarpedNow = (typeof performance !== 'undefined' && typeof performance.now === 'function')
                ? performance.now()
                : Date.now();
            let realDeltaMs = 0;
            if (lastUnwarpedUpdateTimestamp === null) {
                lastUnwarpedUpdateTimestamp = unwarpedNow;
            } else {
                realDeltaMs = Math.max(0, unwarpedNow - lastUnwarpedUpdateTimestamp);
                lastUnwarpedUpdateTimestamp = unwarpedNow;
            }

            const useRealTime = !timedEventTimerAffectedByTimewarp;
            if (useRealTime !== lastUsingRealTime) {
                lastUsingRealTime = useRealTime;
                lastRealUpdateTimestamp = null;
            }

            let effectiveDeltaMs = _deltaMs;
            if (useRealTime) {
                const now = (typeof performance !== 'undefined' && typeof performance.now === 'function')
                    ? performance.now()
                    : Date.now();

                if (lastRealUpdateTimestamp === null) {
                    lastRealUpdateTimestamp = now;
                    return;
                }

                effectiveDeltaMs = Math.max(0, now - lastRealUpdateTimestamp);
                lastRealUpdateTimestamp = now;
            }

            const root = getTimedEffectsRoot();
            const activeIds = Object.keys(root);

            activeIds.forEach((effectId) => {
                const remaining = Number(getTimedEffectState(effectId)?.remainingMs) || 0;
                if (remaining <= 0) {
                    return;
                }

                const deltaForEffect = (effectId === 'blackHoleInstability') ? realDeltaMs : effectiveDeltaMs;

                const nextRemaining = remaining - deltaForEffect;
                if (nextRemaining <= 0) {
                    recordTimedEffectHistory(effectId);
                    setTimedEffectState(effectId, { remainingMs: 0 });
                    handleTimedEffectExpired(effectId);
                    return;
                }

                setTimedEffectState(effectId, { remainingMs: nextRemaining });

                if (effectId === 'blackHoleInstability') {
                    const prev = getTimedEffectState('blackHoleInstability') || {};
                    const accumulator = Number(prev?.tickAccumulatorMs) || 0;
                    const nextAccumulator = accumulator + deltaForEffect;
                    const minutesElapsed = Math.floor(nextAccumulator / (60 * 1000));
                    const carry = nextAccumulator - (minutesElapsed * 60 * 1000);

                    if (minutesElapsed > 0) {
                        for (let i = 0; i < minutesElapsed; i += 1) {
                            applyBlackHoleInstabilityShift(true);
                        }
                    }

                    setTimedEffectState('blackHoleInstability', { tickAccumulatorMs: carry });
                }

                if (randomEventDebugLoggingEnabled) {
                    const secondsRemaining = Math.max(0, Math.ceil(nextRemaining / 1000));
                    const bucket = Math.floor(secondsRemaining / COUNTDOWN_LOG_BUCKET_SECONDS);
                    const lastBucket = lastTimedEffectLogBuckets[effectId];
                    if (lastBucket === undefined || lastBucket !== bucket) {
                        lastTimedEffectLogBuckets[effectId] = bucket;
                        console.log(`[TimedEffects] ${formatEventName(effectId)}: ${secondsRemaining}s remaining`);
                    }
                }
            });
        }
    });
}

export function getTimedEffectsUiSnapshot() {
    const root = getTimedEffectsRoot();
    const ids = Object.keys(root || {});
    return ids
        .map((effectId) => {
            const state = getTimedEffectStateSnapshot(effectId) || {};
            const remainingMs = Math.max(0, Number(state?.remainingMs) || 0);
            if (remainingMs <= 0) {
                return null;
            }
            return {
                id: effectId,
                name: formatEventName(effectId),
                remainingMs,
                description: buildTimedEffectUiDescription(effectId, state),
                state
            };
        })
        .filter(Boolean);
}

export function getTimedEffectsHistorySnapshot() {
    const history = getTimedEffectsHistoryRoot();
    const entries = Array.isArray(history) ? history.slice() : [];
    entries.sort((a, b) => {
        const aEnded = Number(a?.endedAtMs) || 0;
        const bEnded = Number(b?.endedAtMs) || 0;
        return bEnded - aEnded;
    });
    return entries;
}

export function getEventsHistorySnapshot() {
    const timed = getTimedEffectsHistoryRoot();
    const instant = getInstantEventsHistoryRoot();
    const combined = [];

    if (Array.isArray(timed)) combined.push(...timed);
    if (Array.isArray(instant)) combined.push(...instant);

    combined.sort((a, b) => {
        const aEnded = Number(a?.endedAtMs) || 0;
        const bEnded = Number(b?.endedAtMs) || 0;
        return bEnded - aEnded;
    });

    return combined;
}

function getEventTriggerDescription(eventId) {
    const stored = randomEventTriggerDescriptions && typeof randomEventTriggerDescriptions === 'object'
        ? randomEventTriggerDescriptions[eventId]
        : null;
    return stored || 'Unknown action';
}

function getUnlockedStockCandidates() {
    const candidates = [];

    const resourceKeys = Array.from(new Set(['hydrogen', ...(getUnlockedResourcesArray() || [])]));
    resourceKeys.forEach((key) => {
        if (key !== 'hydrogen' && !(getUnlockedResourcesArray() || []).includes(key)) {
            return;
        }

        const quantity = Number(getResourceDataObject('resources', [key, 'quantity'], true) || 0);
        const storageCapacity = Number(getResourceDataObject('resources', [key, 'storageCapacity'], true) || 0);
        if (!Number.isFinite(quantity) || !Number.isFinite(storageCapacity) || storageCapacity <= 0 || quantity <= 0) {
            return;
        }

        candidates.push({ category: 'resources', key, quantity, storageCapacity, fillRatio: quantity / storageCapacity });
    });

    if (getTechUnlockedArray().includes('compounds')) {
        const compoundKeys = Array.from(new Set(getUnlockedCompoundsArray() || []));
        compoundKeys.forEach((key) => {
            const quantity = Number(getResourceDataObject('compounds', [key, 'quantity'], true) || 0);
            const storageCapacity = Number(getResourceDataObject('compounds', [key, 'storageCapacity'], true) || 0);
            if (!Number.isFinite(quantity) || !Number.isFinite(storageCapacity) || storageCapacity <= 0 || quantity <= 0) {
                return;
            }

            candidates.push({ category: 'compounds', key, quantity, storageCapacity, fillRatio: quantity / storageCapacity });
        });
    }

    return candidates;
}

function pickStockLossTarget() {
    const candidates = getUnlockedStockCandidates();
    if (!candidates.length) {
        return null;
    }

    const aboveHalf = candidates.filter((c) => c.fillRatio >= 0.5);
    if (aboveHalf.length) {
        return aboveHalf[Math.floor(Math.random() * aboveHalf.length)];
    }

    const maxFill = candidates.reduce((max, c) => Math.max(max, c.fillRatio), 0);
    const top = candidates.filter((c) => c.fillRatio === maxFill);
    return top[Math.floor(Math.random() * top.length)];
}

function pickStockLossReason() {
    const reasons = [
        'poor storage conditions',
        'theft',
        'a containment failure',
        'a supply chain accident'
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
}

function getGlobalEventsState() {
    const root = getRandomEventsRoot();
    const stored = root?.global;
    if (stored && typeof stored === 'object') {
        return stored;
    }

    const randomDurationMs = Math.floor(Math.random() * (MAX_CYCLE_DURATION_MS - MIN_CYCLE_DURATION_MS + 1)) + MIN_CYCLE_DURATION_MS;
    const initial = {
        cycleDurationMs: randomDurationMs,
        timeRemainingMs: randomDurationMs,
        halfwayAttempted: false
    };
    setResourceDataObject(initial, 'randomEvents', ['global']);
    return initial;
}

function setGlobalEventsState(partial) {
    const previous = getGlobalEventsState() || {};
    const next = { ...previous, ...partial };
    setResourceDataObject(next, 'randomEvents', ['global']);
    return next;
}

function getRandomEventsRoot() {
    const root = getResourceDataObject('randomEvents', null, true);
    if (root && typeof root === 'object') {
        if (!root.events || typeof root.events !== 'object') {
            setResourceDataObject({}, 'randomEvents', ['events']);
        }
        if (!root.timedEffects || typeof root.timedEffects !== 'object') {
            setResourceDataObject({}, 'randomEvents', ['timedEffects']);
        }
        if (!root.instantEventsHistory || !Array.isArray(root.instantEventsHistory)) {
            setResourceDataObject([], 'randomEvents', ['instantEventsHistory']);
        }
        if (root.version === undefined) {
            setResourceDataObject(1, 'randomEvents', ['version']);
        }
        return getResourceDataObject('randomEvents', null, true) || root;
    }

    setResourceDataObject({}, 'randomEvents', ['events']);
    setResourceDataObject({}, 'randomEvents', ['timedEffects']);
    setResourceDataObject([], 'randomEvents', ['instantEventsHistory']);
    setResourceDataObject(1, 'randomEvents', ['version']);
    return getResourceDataObject('randomEvents', null, true);
}

function ensureEventStateExists(eventId) {
    const root = getRandomEventsRoot();
    const stored = root?.events?.[eventId];
    if (stored && typeof stored === 'object') {
        return stored;
    }

    const def = randomEventDefinitions[eventId];
    const initial = {
        id: eventId,
        currentProbability: Number(def?.initialProbability ?? DEFAULT_EVENT_PROBABILITY),
        timesTriggered: 0
    };

    setResourceDataObject(initial, 'randomEvents', ['events', eventId]);
    return initial;
}

function getEventState(eventId) {
    ensureEventStateExists(eventId);
    return getResourceDataObject('randomEvents', ['events', eventId], true);
}

function setEventState(eventId, partial) {
    const previous = getEventState(eventId) || {};
    const next = { ...previous, ...partial };
    setResourceDataObject(next, 'randomEvents', ['events', eventId]);
    return next;
}

function scheduleGlobalEventTimer() {
    if (timerManagerDelta.hasTimer(GLOBAL_EVENT_TIMER_ID)) {
        return;
    }

    let lastRealUpdateTimestamp = null;
    let lastUsingRealTime = !eventTimerCountdownAffectedByTimewarp;

    timerManagerDelta.addTimer(GLOBAL_EVENT_TIMER_ID, {
        durationMs: 0,
        repeat: true,
        onUpdate: ({ deltaMs: _deltaMs }) => {
            if (!eventsMasterSwitch) {
                return;
            }

            const useRealTime = !eventTimerCountdownAffectedByTimewarp;

            if (useRealTime !== lastUsingRealTime) {
                lastUsingRealTime = useRealTime;
                lastRealUpdateTimestamp = null;
            }

            let effectiveDeltaMs = _deltaMs;

            if (useRealTime) {
                const now = (typeof performance !== 'undefined' && typeof performance.now === 'function')
                    ? performance.now()
                    : Date.now();

                if (lastRealUpdateTimestamp === null) {
                    lastRealUpdateTimestamp = now;
                    return;
                }

                effectiveDeltaMs = Math.max(0, now - lastRealUpdateTimestamp);
                lastRealUpdateTimestamp = now;
            }

            const global = getGlobalEventsState();
            const cycleDurationMs = Number(global.cycleDurationMs);
            const halfThresholdMs = cycleDurationMs / 2;

            const previousRemaining = Number(global.timeRemainingMs) || 0;
            let remaining = previousRemaining - effectiveDeltaMs;

            if (randomEventDebugLoggingEnabled) {
                const secondsRemaining = Math.max(0, Math.ceil(remaining / 1000));
                const bucket = Math.floor(secondsRemaining / COUNTDOWN_LOG_BUCKET_SECONDS);
                if (lastGlobalCountdownLogBucket === null || bucket !== lastGlobalCountdownLogBucket) {
                    lastGlobalCountdownLogBucket = bucket;
                    const nextCheckpoint = (!global.halfwayAttempted && secondsRemaining > Math.ceil(halfThresholdMs / 1000))
                        ? 'HALFWAY'
                        : 'EXPIRY';
                    console.log(`[RandomEvents] Global countdown: ${secondsRemaining}s remaining | next checkpoint: ${nextCheckpoint}`);
                }
            }

            if (!global.halfwayAttempted && remaining <= halfThresholdMs) {
                if (randomEventDebugLoggingEnabled) {
                    console.log('[RandomEvents] Reached HALFWAY checkpoint. Attempting event trigger...');
                }
                attemptTriggerAtCheckpoint('halfway');
                setGlobalEventsState({ halfwayAttempted: true });
            }

            if (remaining <= 0) {
                if (randomEventDebugLoggingEnabled) {
                    console.log('[RandomEvents] Reached EXPIRY checkpoint. Attempting event trigger...');
                }
                attemptTriggerAtCheckpoint('expiry');

                const newRandomDurationMs = Math.floor(Math.random() * (MAX_CYCLE_DURATION_MS - MIN_CYCLE_DURATION_MS + 1)) + MIN_CYCLE_DURATION_MS;
                remaining = newRandomDurationMs;
                lastGlobalCountdownLogBucket = null;
                setGlobalEventsState({ timeRemainingMs: remaining, halfwayAttempted: false, cycleDurationMs: newRandomDurationMs });
                return;
            }

            setGlobalEventsState({ timeRemainingMs: remaining, cycleDurationMs });
        }
    });
}

function attemptTriggerAtCheckpoint(checkpointType) {
    const modifier = checkpointType === 'halfway' ? HALFWAY_PROBABILITY_MODIFIER : 1;
    const ids = Object.keys(randomEventDefinitions);
    const eligible = ids.filter((id) => randomEventDefinitions[id].canTrigger());

    if (randomEventDebugLoggingEnabled) {
        const probs = eligible.map((id) => {
            const state = getEventState(id);
            const p = Math.max(0, Math.min(1, Number(state?.currentProbability ?? DEFAULT_EVENT_PROBABILITY)));
            return `${id}:${p.toFixed(3)}`;
        });
        console.log(`[RandomEvents] Eligible at ${checkpointType}: ${eligible.length ? probs.join(', ') : '(none)'}`);
    }

    if (eligible.length === 0) {
        return false;
    }

    const picked = eligible[Math.floor(Math.random() * eligible.length)];
    const def = randomEventDefinitions[picked];
    const state = getEventState(picked);
    const baseP = Math.max(0, Math.min(1, Number(state?.currentProbability ?? DEFAULT_EVENT_PROBABILITY)));
    const effectiveP = Math.max(0, Math.min(1, baseP * modifier));
    const roll = Math.random();

    if (randomEventDebugLoggingEnabled) {
        console.log(
            `[RandomEvents] ${checkpointType} picked=${picked} | roll=${roll.toFixed(3)} p=${effectiveP.toFixed(3)} (base=${baseP.toFixed(3)} x${modifier}) | action=${getEventTriggerDescription(picked)}`
        );
    }

    if (roll > effectiveP) {
        return false;
    }

    const triggerResult = def.trigger();
    if (!triggerResult) {
        return false;
    }

    if (typeof randomEventUiHandlers.onAnyEventTriggered === 'function') {
        randomEventUiHandlers.onAnyEventTriggered(picked);
    }

    trackAnalyticsEvent('random_event_triggered', {
        event_id: picked,
        checkpoint: checkpointType,
        ts: new Date().toISOString()
    }, { immediate: true, flushReason: 'random_event' });

    if (!TIMED_RANDOM_EVENT_IDS.has(picked)) {
        recordInstantEventHistory(picked, triggerResult);
    }

    const nextProbability = Math.max(0.01, baseP * PROBABILITY_DECAY_ON_TRIGGER);
    setEventState(picked, {
        currentProbability: nextProbability,
        timesTriggered: Math.max(0, (Number(state?.timesTriggered) || 0) + 1)
    });

    randomEventUiHandlers.showNotification?.(
        (triggerResult && typeof triggerResult === 'object' && typeof triggerResult.notificationText === 'string' && triggerResult.notificationText.trim() !== '')
            ? triggerResult.notificationText
            : `Random Event: ${formatEventName(picked)}`,
        'info',
        5000,
        'default'
    );

    const modalReplacements = (triggerResult && typeof triggerResult === 'object')
        ? (triggerResult.modalReplacements || triggerResult)
        : null;

    sfxPlayer.playAudio('eventAlarm', false);
    randomEventUiHandlers.showEventModal?.(picked, modalReplacements);

    if (randomEventDebugLoggingEnabled) {
        console.log(`[RandomEvents] ${picked} TRIGGERED at ${checkpointType}. New base p=${nextProbability.toFixed(3)}`);
    }

    return true;
}

function getTravellingRockets() {
    const rockets = ['rocket1', 'rocket2', 'rocket3', 'rocket4'];
    return rockets.filter((rocket) => !!getCurrentlyTravellingToAsteroid(rocket));
}

function getMiningRockets() {
    const rockets = ['rocket1', 'rocket2', 'rocket3', 'rocket4'];
    const miningObject = getMiningObject() || {};
    return rockets.filter((rocket) => {
        const target = miningObject[rocket];
        return typeof target === 'string' && target.trim() !== '' && target !== 'refuel';
    });
}

function getAsteroidByKey(asteroidKey) {
    const asteroids = getAsteroidArray() || [];
    const match = asteroids.find((obj) => obj && typeof obj === 'object' && Object.prototype.hasOwnProperty.call(obj, asteroidKey));
    return match ? match[asteroidKey] : null;
}

function removeRocketTravelTimers(rocket) {
    const toTimer = `${rocket}TravelToAsteroidTimer`;
    const returnTimer = `${rocket}TravelReturnTimer`;

    if (timerManagerDelta.hasTimer(toTimer)) {
        timerManagerDelta.removeTimer(toTimer);
    }
    if (timerManagerDelta.hasTimer(returnTimer)) {
        timerManagerDelta.removeTimer(returnTimer);
    }
}

function forceCompleteRocketTravel(rocket) {
    const returning = !!getRocketDirection(rocket);
    const destination = getDestinationAsteroid(rocket);

    removeRocketTravelTimers(rocket);

    if (returning) {
        resetRocketForNextJourneyLite(rocket);
        return;
    }

    if (destination) {
        setAntimatterUnlocked(true);
        setMiningObject(rocket, destination);
    }

    setTimeLeftUntilRocketTravelToAsteroidTimerFinishes(rocket, 0);
    setCurrentlyTravellingToAsteroid(rocket, false);
}

function resetRocketForNextJourneyLite(rocket) {
    setResourceDataObject(0, 'space', ['upgrades', rocket, 'fuelQuantity']);
    setRocketsFuellerStartedArray(rocket, 'remove', 'reset');
    setLaunchedRockets(rocket, 'remove');
    setTimeLeftUntilRocketTravelToAsteroidTimerFinishes(rocket, 0);
    setRocketTravelDuration(rocket, 0);
    setDestinationAsteroid(rocket, null);
    setRocketDirection(rocket, false);
    setCheckRocketFuellingStatus(rocket, false);
    setRocketReadyToTravel(rocket, true);
}

function resetRocketToUnbuilt(rocket) {
    removeRocketTravelTimers(rocket);

    setResourceDataObject(0, 'space', ['upgrades', rocket, 'fuelQuantity']);
    setResourceDataObject(0, 'space', ['upgrades', rocket, 'builtParts']);

    setResourceDataObject(1000, 'space', ['upgrades', rocket, 'price']);
    setResourceDataObject([1000, 'glass', 'compounds'], 'space', ['upgrades', rocket, 'resource1Price']);
    setResourceDataObject([1000, 'titanium', 'compounds'], 'space', ['upgrades', rocket, 'resource2Price']);
    setResourceDataObject([3000, 'steel', 'compounds'], 'space', ['upgrades', rocket, 'resource3Price']);

    removeRocketBuilt(rocket);

    const rocketIndex = Number(rocket.replace('rocket', ''));
    if (Number.isFinite(rocketIndex) && rocketIndex >= 1) {
        setRocketUserName(rocket, `Rocket ${rocketIndex}`);
    }

    setRocketsFuellerStartedArray(rocket, 'remove', 'reset');
    setLaunchedRockets(rocket, 'remove');
    setMiningObject(rocket, null);
    setTimeLeftUntilRocketTravelToAsteroidTimerFinishes(rocket, 0);
    setRocketTravelDuration(rocket, 0);
    setDestinationAsteroid(rocket, null);
    setRocketDirection(rocket, false);
    setCurrentlyTravellingToAsteroid(rocket, false);
    setCheckRocketFuellingStatus(rocket, false);
    setRocketReadyToTravel(rocket, true);
}

function formatEventName(eventId) {
    return eventId.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
}

export function getRandomEventDebugOptions() {
    return Object.keys(randomEventDefinitions).map((id) => ({
        id,
        title: formatEventName(id)
    }));
}

function getBuildingDisplayName(buildingKey) {
    const map = {
        powerPlant1: 'Power Plant',
        powerPlant2: 'Solar Power Plant',
        powerPlant3: 'Advanced Power Plant',
        battery1: 'Sodium Ion Battery',
        battery2: 'Battery 2',
        battery3: 'Battery 3'
    };
    return map[buildingKey] || buildingKey;
}

function getAvailablePowerPlantTypes() {
    const candidates = ['powerPlant1', 'powerPlant2', 'powerPlant3'];
    return candidates.filter((key) => (getResourceDataObject('buildings', ['energy', 'upgrades', key, 'quantity'], true) || 0) > 0);
}

function destroyPowerPlant(powerPlantKey) {
    const currentQty = Number(getResourceDataObject('buildings', ['energy', 'upgrades', powerPlantKey, 'quantity'], true) || 0);
    if (currentQty <= 0) {
        return false;
    }

    const newQty = Math.max(0, currentQty - 1);
    setResourceDataObject(newQty, 'buildings', ['energy', 'upgrades', powerPlantKey, 'quantity']);

    const ratePerUnit = Number(getResourceDataObject('buildings', ['energy', 'upgrades', powerPlantKey, 'rate'], true) || 0);
    let purchasedRate = newQty * ratePerUnit;

    if (powerPlantKey === 'powerPlant2') {
        purchasedRate *= getCurrentStarSystemWeatherEfficiency()[1];
    }

    setResourceDataObject(purchasedRate, 'buildings', ['energy', 'upgrades', powerPlantKey, 'purchasedRate']);
    setResourceDataObject(newQty * ratePerUnit, 'buildings', ['energy', 'upgrades', powerPlantKey, 'maxPurchasedRate']);

    const fuel = getResourceDataObject('buildings', ['energy', 'upgrades', powerPlantKey, 'fuel'], true);
    if (Array.isArray(fuel) && fuel.length >= 3) {
        const fuelType = fuel[0];
        const fuelBurnRate = Number(fuel[1] || 0);
        const fuelCategory = fuel[2];

        const usedForFuel = Number(getResourceDataObject(fuelCategory, [fuelType, 'usedForFuelPerSec'], true) || 0);
        setResourceDataObject(Math.max(0, usedForFuel - fuelBurnRate), fuelCategory, [fuelType, 'usedForFuelPerSec']);

        if (getActivatedFuelBurnObject(fuelType)) {
            const currentRate = Number(getResourceDataObject(fuelCategory, [fuelType, 'rate'], true) || 0);
            setResourceDataObject(currentRate + fuelBurnRate, fuelCategory, [fuelType, 'rate']);
        }
    }

    if (newQty === 0 && getBuildingTypeOnOff(powerPlantKey)) {
        setBuildingTypeOnOff(powerPlantKey, false);
    }

    return true;
}

function getHighestBatteryTierWithQuantity() {
    const tiers = ['battery3', 'battery2', 'battery1'];
    for (const tier of tiers) {
        const qty = Number(getResourceDataObject('buildings', ['energy', 'upgrades', tier, 'quantity'], true) || 0);
        if (qty > 0) {
            return tier;
        }
    }
    return null;
}

function destroyBattery(batteryKey) {
    const currentQty = Number(getResourceDataObject('buildings', ['energy', 'upgrades', batteryKey, 'quantity'], true) || 0);
    if (currentQty <= 0) {
        return false;
    }

    const newQty = Math.max(0, currentQty - 1);
    setResourceDataObject(newQty, 'buildings', ['energy', 'upgrades', batteryKey, 'quantity']);

    const capacityDelta = Number(getResourceDataObject('buildings', ['energy', 'upgrades', batteryKey, 'capacity'], true) || 0);
    const currentCap = Number(getResourceDataObject('buildings', ['energy', 'storageCapacity'], true) || 0);
    const nextCap = Math.max(0, currentCap - capacityDelta);
    setResourceDataObject(nextCap, 'buildings', ['energy', 'storageCapacity']);

    const currentEnergy = Number(getResourceDataObject('buildings', ['energy', 'quantity'], true) || 0);
    setResourceDataObject(Math.min(currentEnergy, nextCap), 'buildings', ['energy', 'quantity']);

    const anyBatteriesLeft = ['battery1', 'battery2', 'battery3'].some((key) => {
        const qty = Number(getResourceDataObject('buildings', ['energy', 'upgrades', key, 'quantity'], true) || 0);
        return qty > 0;
    });

    setResourceDataObject(anyBatteriesLeft, 'buildings', ['energy', 'batteryBoughtYet']);

    return true;
}

export function initialiseRandomEventTimers() {
    getRandomEventsRoot();
    getGlobalEventsState();
    getTimedEffectsRoot();
    getInstantEventsHistoryRoot();

    Object.keys(randomEventDefinitions).forEach((eventId) => {
        ensureEventStateExists(eventId);
    });

    if (eventsMasterSwitch) {
        scheduleGlobalEventTimer();
    }

    scheduleTimedEffectsTimer();
}

export function triggerRandomEventDebug() {
    const ids = Object.keys(randomEventDefinitions);
    const eligible = ids.filter((id) => randomEventDefinitions[id].canTrigger());

    if (eligible.length === 0) {
        randomEventUiHandlers.showNotification?.('No eligible random events could trigger right now.', 'info', 3000, 'debug');
        return;
    }

    const picked = eligible[Math.floor(Math.random() * eligible.length)];
    const def = randomEventDefinitions[picked];
    const state = getEventState(picked);
    const baseP = Math.max(0, Math.min(1, Number(state?.currentProbability ?? DEFAULT_EVENT_PROBABILITY)));

    if (randomEventDebugLoggingEnabled) {
        console.log(`[RandomEvents] DEBUG force trigger picked=${picked} | baseP=${baseP.toFixed(3)} | action=${getEventTriggerDescription(picked)}`);
    }

    const triggerResult = def.trigger();
    if (!triggerResult) {
        return;
    }

    if (typeof randomEventUiHandlers.onAnyEventTriggered === 'function') {
        randomEventUiHandlers.onAnyEventTriggered(picked);
    }

    if (!TIMED_RANDOM_EVENT_IDS.has(picked)) {
        recordInstantEventHistory(picked, triggerResult);
    }

    const nextProbability = Math.max(0.01, baseP * PROBABILITY_DECAY_ON_TRIGGER);
    setEventState(picked, {
        currentProbability: nextProbability,
        timesTriggered: Math.max(0, (Number(state?.timesTriggered) || 0) + 1)
    });

    randomEventUiHandlers.showNotification?.(
        (triggerResult && typeof triggerResult === 'object' && typeof triggerResult.notificationText === 'string' && triggerResult.notificationText.trim() !== '')
            ? triggerResult.notificationText
            : `Random Event: ${formatEventName(picked)}`,
        'info',
        5000,
        'default'
    );

    const modalReplacements = (triggerResult && typeof triggerResult === 'object')
        ? (triggerResult.modalReplacements || triggerResult)
        : null;
    randomEventUiHandlers.showEventModal?.(picked, modalReplacements);
}

export function triggerSpecificRandomEventDebug(eventId) {
    const def = randomEventDefinitions[eventId];
    if (!def) {
        randomEventUiHandlers.showNotification?.(`Unknown random event: ${eventId}`, 'warning', 3000, 'debug');
        return;
    }

    if (!def.canTrigger()) {
        randomEventUiHandlers.showNotification?.(`Random Event not eligible: ${formatEventName(eventId)}`, 'info', 3000, 'debug');
        return;
    }

    const state = getEventState(eventId);
    const baseP = Math.max(0, Math.min(1, Number(state?.currentProbability ?? DEFAULT_EVENT_PROBABILITY)));

    const triggerResult = def.trigger();
    if (!triggerResult) {
        randomEventUiHandlers.showNotification?.(`Random Event failed to trigger: ${formatEventName(eventId)}`, 'info', 3000, 'debug');
        return;
    }

    if (typeof randomEventUiHandlers.onAnyEventTriggered === 'function') {
        randomEventUiHandlers.onAnyEventTriggered(eventId);
    }

    if (!TIMED_RANDOM_EVENT_IDS.has(eventId)) {
        recordInstantEventHistory(eventId, triggerResult);
    }

    const nextProbability = Math.max(0.01, baseP * PROBABILITY_DECAY_ON_TRIGGER);
    setEventState(eventId, {
        currentProbability: nextProbability,
        timesTriggered: Math.max(0, (Number(state?.timesTriggered) || 0) + 1)
    });

    randomEventUiHandlers.showNotification?.(
        (triggerResult && typeof triggerResult === 'object' && typeof triggerResult.notificationText === 'string' && triggerResult.notificationText.trim() !== '')
            ? triggerResult.notificationText
            : `Random Event: ${formatEventName(eventId)}`,
        'info',
        5000,
        'default'
    );

    const modalReplacements = (triggerResult && typeof triggerResult === 'object')
        ? (triggerResult.modalReplacements || triggerResult)
        : null;
    randomEventUiHandlers.showEventModal?.(eventId, modalReplacements);
}

export function setRandomEventUiHandlers({
    showNotification,
    showEventModal,
    refreshSpaceMiningRocketSidebar,
    isGalacticTabUnlocked,
    onTimedEffectStarted,
    onAnyEventTriggered
} = {}) {
    if (typeof showNotification === 'function') {
        randomEventUiHandlers.showNotification = showNotification;
    }
    if (typeof showEventModal === 'function') {
        randomEventUiHandlers.showEventModal = showEventModal;
    }
    if (typeof refreshSpaceMiningRocketSidebar === 'function') {
        randomEventUiHandlers.refreshSpaceMiningRocketSidebar = refreshSpaceMiningRocketSidebar;
    }
    if (typeof isGalacticTabUnlocked === 'function') {
        randomEventUiHandlers.isGalacticTabUnlocked = isGalacticTabUnlocked;
    }
    if (typeof onTimedEffectStarted === 'function') {
        randomEventUiHandlers.onTimedEffectStarted = onTimedEffectStarted;
    }
    if (typeof onAnyEventTriggered === 'function') {
        randomEventUiHandlers.onAnyEventTriggered = onAnyEventTriggered;
    }
}

export function setRandomEventTimerAffectedByTimewarp(enabled) {
    eventTimerCountdownAffectedByTimewarp = !!enabled;
}

export function setTimedEventTimerAffectedByTimewarp(enabled) {
    timedEventTimerAffectedByTimewarp = !!enabled;
}
