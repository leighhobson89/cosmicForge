import {
    changeAsteroidArray,
    getActivatedFuelBurnObject,
    getAsteroidArray,
    getBuildingTypeOnOff,
    getCurrentlyTravellingToAsteroid,
    getCurrentStarSystemWeatherEfficiency,
    getDestinationAsteroid,
    getMiningObject,
    getRocketDirection,
    getRocketUserName,
    getTechUnlockedArray,
    getUnlockedCompoundsArray,
    getUnlockedResourcesArray,
    removeRocketBuilt,
    setAntimatterUnlocked,
    setCheckRocketFuellingStatus,
    setCurrentlyTravellingToAsteroid,
    setDestinationAsteroid,
    setLaunchedRockets,
    setMiningObject,
    setRocketDirection,
    setRocketReadyToTravel,
    setRocketTravelDuration,
    setRocketUserName,
    setRocketsFuellerStartedArray,
    setTimeLeftUntilRocketTravelToAsteroidTimerFinishes,
    setBuildingTypeOnOff
} from "./constantsAndGlobalVars.js";
import { getResourceDataObject, setResourceDataObject } from "./resourceDataObject.js";
import { timerManagerDelta } from "./timerManagerDelta.js";
import { randomEventTriggerDescriptions } from "./descriptions.js";

let randomEventUiHandlers = {
    showNotification: null,
    showEventModal: null,
    refreshSpaceMiningRocketSidebar: null
};

let eventsMasterSwitch = false; //TRUE TO HAVE EVENTS WORKING IN GAME
let randomEventDebugLoggingEnabled = false; //DEBUG EVENTS TRUE
let randomEventTimerAffectedByTimewarp = false; //DEBUG EVENTS TRUE
const COUNTDOWN_LOG_BUCKET_SECONDS = 30; //DEBUG
let lastGlobalCountdownLogBucket = null; //DEBUG

const DEFAULT_EVENT_PROBABILITY = 0.30;
const HALFWAY_PROBABILITY_MODIFIER = 0.5;
const PROBABILITY_DECAY_ON_TRIGGER = 0.9;

const MIN_CYCLE_DURATION_MS = 45 * 60 * 1000;
const MAX_CYCLE_DURATION_MS = 75 * 60 * 1000;
const GLOBAL_EVENT_TIMER_ID = 'randomEventGlobalTimer';

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
    }
};

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
        if (root.version === undefined) {
            setResourceDataObject(1, 'randomEvents', ['version']);
        }
        return getResourceDataObject('randomEvents', null, true) || root;
    }

    setResourceDataObject({}, 'randomEvents', ['events']);
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
    let lastUsingRealTime = !randomEventTimerAffectedByTimewarp;

    timerManagerDelta.addTimer(GLOBAL_EVENT_TIMER_ID, {
        durationMs: 0,
        repeat: true,
        onUpdate: ({ deltaMs: _deltaMs }) => {
            if (!eventsMasterSwitch) {
                return;
            }

            const useRealTime = !randomEventTimerAffectedByTimewarp;

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

    const nextProbability = Math.max(0.01, baseP * PROBABILITY_DECAY_ON_TRIGGER);
    setEventState(picked, {
        currentProbability: nextProbability,
        timesTriggered: Math.max(0, (Number(state?.timesTriggered) || 0) + 1)
    });

    randomEventUiHandlers.showNotification?.(
        `Random Event: ${formatEventName(picked)}`,
        'info',
        5000,
        'default'
    );

    const modalReplacements = (triggerResult && typeof triggerResult === 'object')
        ? (triggerResult.modalReplacements || triggerResult)
        : null;
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

    Object.keys(randomEventDefinitions).forEach((eventId) => {
        ensureEventStateExists(eventId);
    });

    if (eventsMasterSwitch) {
        scheduleGlobalEventTimer();
    }
}

export function triggerRandomEventDebug() {
    if (!eventsMasterSwitch) {
        return;
    }
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

    const nextProbability = Math.max(0.01, baseP * PROBABILITY_DECAY_ON_TRIGGER);
    setEventState(picked, {
        currentProbability: nextProbability,
        timesTriggered: Math.max(0, (Number(state?.timesTriggered) || 0) + 1)
    });

    randomEventUiHandlers.showNotification?.(
        `Random Event: ${formatEventName(picked)}`,
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

    const nextProbability = Math.max(0.01, baseP * PROBABILITY_DECAY_ON_TRIGGER);
    setEventState(eventId, {
        currentProbability: nextProbability,
        timesTriggered: Math.max(0, (Number(state?.timesTriggered) || 0) + 1)
    });

    randomEventUiHandlers.showNotification?.(
        `Random Event: ${formatEventName(eventId)}`,
        'info',
        5000,
        'default'
    );

    const modalReplacements = (triggerResult && typeof triggerResult === 'object')
        ? (triggerResult.modalReplacements || triggerResult)
        : null;
    randomEventUiHandlers.showEventModal?.(eventId, modalReplacements);
}

export function setRandomEventUiHandlers({ showNotification, showEventModal, refreshSpaceMiningRocketSidebar } = {}) {
    if (typeof showNotification === 'function') {
        randomEventUiHandlers.showNotification = showNotification;
    }
    if (typeof showEventModal === 'function') {
        randomEventUiHandlers.showEventModal = showEventModal;
    }
    if (typeof refreshSpaceMiningRocketSidebar === 'function') {
        randomEventUiHandlers.refreshSpaceMiningRocketSidebar = refreshSpaceMiningRocketSidebar;
    }
}

export function setRandomEventTimerAffectedByTimewarp(enabled) {
    randomEventTimerAffectedByTimewarp = !!enabled;
}
