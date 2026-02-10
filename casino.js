import { showNotification } from './ui.js';
import { getGalacticCasinoDataObject, setGalacticCasinoDataObject } from './resourceDataObject.js';
import { getResourceDataObject, setResourceDataObject } from './resourceDataObject.js';
import {
    startTravelToAndFromAsteroidTimer,
    startTravelToDestinationStarTimer,
    startSearchAsteroidTimer,
    startInvestigateStarTimer,
    startPillageVoidTimer,
    resetRocketForNextJourney,
    discoverAsteroid,
    extendStarDataRange,
    gainPillageVoidResourcesAndCompounds,
} from './game.js';
import { timerManagerDelta } from './timerManagerDelta.js';
import {
    getUnlockedResourcesArray,
    getUnlockedCompoundsArray,
    getCurrentlySearchingAsteroid,
    getCurrentlyInvestigatingStar,
    getCurrentlyPillagingVoid,
    getTimeLeftUntilAsteroidScannerTimerFinishes,
    setTimeLeftUntilAsteroidScannerTimerFinishes,
    getTimeLeftUntilStarInvestigationTimerFinishes,
    setTimeLeftUntilStarInvestigationTimerFinishes,
    getTimeLeftUntilPillageVoidTimerFinishes,
    setTimeLeftUntilPillageVoidTimerFinishes,
    getStarShipTravelling,
    getTimeLeftUntilTravelToDestinationStarTimerFinishes,
    getCurrentlyTravellingToAsteroid,
    getTimeLeftUntilRocketTravelToAsteroidTimerFinishes,
    setTimeLeftUntilRocketTravelToAsteroidTimerFinishes,
    getRocketUserName,
    getRocketDirection,
    setRocketDirection,
    setRocketTravelDuration,
    getDestinationAsteroid,
    setCurrentlyTravellingToAsteroid,
    setMiningObject,
    setAntimatterUnlocked,
    getStarShipStatus,
    setStarShipStatus,
    getDestinationStar,
    setStarShipArrowPosition,
    setTimeLeftUntilTravelToDestinationStarTimerFinishes,
    setTelescopeReadyToSearch,
    setCurrentlySearchingAsteroid,
    setCurrentlyInvestigatingStar,
    setCurrentlyPillagingVoid,
    getAsteroidArray,
} from './constantsAndGlobalVars.js';

export function getBaseProbabilityCasino() {
    const value = getGalacticCasinoDataObject('settings', ['baseProbabilityCasino']);
    return (typeof value === 'number' && Number.isFinite(value)) ? value : 0.4;
}

function randomIntInclusive(min, max) {
    const mn = Math.ceil(min);
    const mx = Math.floor(max);
    if (mx < mn) return mn;
    return Math.floor(Math.random() * (mx - mn + 1)) + mn;
}

function pickRandom(array) {
    if (!Array.isArray(array) || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
}

function titleCaseFromKey(value) {
    return String(value || '')
        .replace(/[_-]+/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function clampNumber(n, fallback = 0) {
    const num = Number(n);
    return Number.isFinite(num) ? num : fallback;
}

function doubleStockQuantity(category, key) {
    const cat = String(category || '').toLowerCase();
    if (cat !== 'resources' && cat !== 'compounds') {
        return null;
    }

    const qty = getResourceDataObject(cat, [key, 'quantity']);
    if (typeof qty !== 'number' || !Number.isFinite(qty)) {
        return null;
    }

    const doubled = Math.max(0, qty * 2);
    setResourceDataObject(doubled, cat, [key, 'quantity']);
    return { type: cat, key, oldQuantity: qty, newQuantity: doubled };
}

function getEligibleTravellingRocket() {
    const rockets = ['rocket1', 'rocket2', 'rocket3', 'rocket4'];
    const eligible = rockets.filter((rocketKey) => {
        try {
            const active = !!getCurrentlyTravellingToAsteroid?.(rocketKey);
            const remaining = clampNumber(getTimeLeftUntilRocketTravelToAsteroidTimerFinishes?.(rocketKey), 0);
            return active && remaining > 0;
        } catch (e) {
            return false;
        }
    });
    return pickRandom(eligible);
}

function warpRocketInstantly(rocketKey) {
    const defaultLabel = titleCaseFromKey(rocketKey);
    const customName = getRocketUserName?.(rocketKey) ?? defaultLabel;
    const name = String(customName || defaultLabel);
    const returning = !!getRocketDirection?.(rocketKey);
    const destination = getDestinationAsteroid?.(rocketKey);

    const toTimer = `${rocketKey}TravelToAsteroidTimer`;
    const returnTimer = `${rocketKey}TravelReturnTimer`;
    if (timerManagerDelta.hasTimer(toTimer)) {
        timerManagerDelta.removeTimer(toTimer);
    }
    if (timerManagerDelta.hasTimer(returnTimer)) {
        timerManagerDelta.removeTimer(returnTimer);
    }

    if (returning) {
        const warpReturnMs = 2000;
        setRocketDirection?.(rocketKey, true);
        setRocketTravelDuration?.(rocketKey, warpReturnMs);
        setTimeLeftUntilRocketTravelToAsteroidTimerFinishes?.(rocketKey, warpReturnMs);
        setCurrentlyTravellingToAsteroid?.(rocketKey, true);
        startTravelToAndFromAsteroidTimer([warpReturnMs, 'wheelPrize'], rocketKey, true);
        return { rocketKey, name, warpedTo: 'Base' };
    }

    if (destination) {
        const warpToAsteroidMs = 2000;
        setRocketDirection?.(rocketKey, false);
        setRocketTravelDuration?.(rocketKey, warpToAsteroidMs);
        setTimeLeftUntilRocketTravelToAsteroidTimerFinishes?.(rocketKey, warpToAsteroidMs);
        setCurrentlyTravellingToAsteroid?.(rocketKey, true);
        startTravelToAndFromAsteroidTimer([warpToAsteroidMs, 'wheelPrize'], rocketKey, false);
        return { rocketKey, name, warpedTo: `Asteroid ${destination}` };
    }

    setTimeLeftUntilRocketTravelToAsteroidTimerFinishes?.(rocketKey, 0);
    setCurrentlyTravellingToAsteroid?.(rocketKey, false);
    return { rocketKey, name, warpedTo: 'Destination' };
}

function warpStarshipInstantly() {
    const status = getStarShipStatus?.() || ['preconstruction', null];
    const destination = getDestinationStar?.();
    const dest = String(status?.[1] || destination || '').toLowerCase();

    if (String(status?.[0] || '') !== 'travelling') {
        return null;
    }

    if (timerManagerDelta.hasTimer('starShipTravelToDestinationStarTimer')) {
        timerManagerDelta.removeTimer('starShipTravelToDestinationStarTimer');
    }

    setTimeLeftUntilTravelToDestinationStarTimerFinishes?.(0);
    setStarShipStatus?.(['orbiting', dest]);
    setStarShipArrowPosition?.(1);
    return dest;
}

function discoverAsteroidSilentAndGetName() {
    discoverAsteroid?.(true);

    const arr = getAsteroidArray?.() || [];
    const last = arr.length > 0 ? arr[arr.length - 1] : null;
    if (!last || typeof last !== 'object') return null;
    const key = Object.keys(last)[0];
    const data = last[key];
    const named = data?.specialName ? data?.name : null;
    return named || key;
}

function finishStarStudyInstantly() {
    if (timerManagerDelta.hasTimer('investigateStarTimer')) {
        timerManagerDelta.removeTimer('investigateStarTimer');
    }
    extendStarDataRange?.(false);
    setTelescopeReadyToSearch?.(true);
    setCurrentlyInvestigatingStar?.(false);
    setTimeLeftUntilStarInvestigationTimerFinishes?.(0);
}

function finishVoidPillageInstantly() {
    if (timerManagerDelta.hasTimer('pillageVoidTimer')) {
        timerManagerDelta.removeTimer('pillageVoidTimer');
    }
    gainPillageVoidResourcesAndCompounds?.();
    setTelescopeReadyToSearch?.(true);
    setCurrentlyPillagingVoid?.(false);
    setTimeLeftUntilPillageVoidTimerFinishes?.(0);
}

export function claimWheelSpecialPrize({ wheelId } = {}) {
    const id = String(wheelId || '');
    if (!id) return null;

    const wheelEl = document.getElementById(id);
    if (!wheelEl) return null;

    const specialReady = String(wheelEl.getAttribute('data-special-ready') || 'false') === 'true';
    const spinning = String(wheelEl.getAttribute('data-spinning') || 'false') === 'true';
    if (!specialReady || spinning) return null;

    const selection = String(wheelEl.getAttribute('data-prize-selection') || 'select').toLowerCase();
    if (!selection || selection === 'select') return null;

    if (selection === 'special_100cp') {
        const current = getGalacticCasinoDataObject('casinoPoints', ['quantity']) ?? 0;
        setGalacticCasinoDataObject(Math.max(0, current + 100), 'casinoPoints', ['quantity']);
        showNotification('Special Prize Claimed! 100CP', 'info', 3500, 'galacticCasino');
        return { type: 'cp', amount: 100 };
    }

    if (selection === 'special_100k_research') {
        const current = clampNumber(getResourceDataObject('research', ['quantity']) ?? 0, 0);
        const newQty = Math.max(0, current + 100000);
        setResourceDataObject(newQty, 'research', ['quantity']);
        showNotification('Special Prize Claimed! 100,000 Research Points', 'info', 3500, 'galacticCasino');
        return { type: 'research', amount: 100000 };
    }

    if (selection.startsWith('special_double_')) {
        const key = selection.replace('special_double_', '');
        const unlockedResources = new Set((getUnlockedResourcesArray?.() || []).map((v) => String(v || '').toLowerCase()));
        const unlockedCompounds = new Set((getUnlockedCompoundsArray?.() || []).map((v) => String(v || '').toLowerCase()));
        const isUnlocked = unlockedResources.has(key) || unlockedCompounds.has(key);
        if (!isUnlocked) {
            return null;
        }

        const categoryByKey = {
            titanium: 'compounds',
            steel: 'compounds',
            silicon: 'resources',
            iron: 'resources',
            sodium: 'resources'
        };
        const category = categoryByKey[key] || (unlockedCompounds.has(key) ? 'compounds' : 'resources');

        const result = doubleStockQuantity(category, key);
        if (result) {
            showNotification(`Special Prize Claimed! ${titleCaseFromKey(key)} doubled`, 'info', 3500, 'galacticCasino');
        }
        return result;
    }

    if (selection === 'special_starship_warp') {
        const dest = warpStarshipInstantly();
        if (!dest) return null;
        showNotification(`Special Prize Claimed! Starship warped instantly to ${titleCaseFromKey(dest)}`, 'info', 3500, 'galacticCasino');
        return { type: 'starship_warp', destinationStar: dest };
    }

    if (selection === 'special_rocket_warp') {
        const rocketKey = getEligibleTravellingRocket();
        if (!rocketKey) return null;
        const result = warpRocketInstantly(rocketKey);
        const rocketIndexMatch = String(rocketKey).match(/rocket(\d+)/i);
        const rocketIndex = rocketIndexMatch ? rocketIndexMatch[1] : '';
        const displayName = String(result?.name || titleCaseFromKey(rocketKey));
        const prefix = rocketIndex ? `Rocket ${rocketIndex} ${displayName}` : displayName;
        showNotification(`Special Prize Claimed! ${prefix} warped to ${result.warpedTo}`, 'info', 3500, 'galacticCasino');
        return { type: 'rocket_warp', ...result };
    }

    if (selection === 'special_telescope_discover_asteroid') {
        if (!(getCurrentlySearchingAsteroid?.() && (getTimeLeftUntilAsteroidScannerTimerFinishes?.() > 0))) {
            return null;
        }
        const name = discoverAsteroidSilentAndGetName();
        if (name) {
            showNotification(`Special Prize Claimed! Space Telescope discovered Asteroid ${name}`, 'info', 3500, 'galacticCasino');
        }
        return { type: 'telescope_discover_asteroid', asteroid: name };
    }

    if (selection === 'special_telescope_finish_star_study') {
        if (!(getCurrentlyInvestigatingStar?.() && (getTimeLeftUntilStarInvestigationTimerFinishes?.() > 0))) {
            return null;
        }
        finishStarStudyInstantly();
        showNotification('Special Prize Claimed! Space Telescope finished Star Study!', 'info', 3500, 'galacticCasino');
        return { type: 'telescope_finish_star_study' };
    }

    if (selection === 'special_telescope_finish_void_pillage') {
        if (!(getCurrentlyPillagingVoid?.() && (getTimeLeftUntilPillageVoidTimerFinishes?.() > 0))) {
            return null;
        }
        finishVoidPillageInstantly();
        showNotification('Special Prize Claimed! Space Telescope finished Pillaging The Void!', 'info', 3500, 'galacticCasino');
        return { type: 'telescope_finish_void_pillage' };
    }

    return null;
}

function awardCpPrize(cost) {
    const current = getGalacticCasinoDataObject('casinoPoints', ['quantity']) ?? 0;
    const payout = Math.max(0, Math.floor(cost * 2));
    setGalacticCasinoDataObject(Math.max(0, current + payout), 'casinoPoints', ['quantity']);
    return { type: 'cp', amount: payout };
}

function awardCashPrize() {
    const currentCash = Number(getResourceDataObject('currency', ['cash']) ?? 0);
    const maxAdd = Math.floor(currentCash * 0.05);
    if (!Number.isFinite(maxAdd) || maxAdd <= 0) {
        return null;
    }
    const amount = randomIntInclusive(1, maxAdd);
    setResourceDataObject(Math.max(0, currentCash + amount), 'currency', ['cash']);
    return { type: 'cash', amount };
}

function awardResearchPrize() {
    const current = Number(getResourceDataObject('research', ['quantity']) ?? 0);
    const maxAdd = Math.floor(current * 0.05);
    if (!Number.isFinite(maxAdd) || maxAdd <= 0) {
        return null;
    }
    const amount = randomIntInclusive(1, maxAdd);
    setResourceDataObject(Math.max(0, current + amount), 'research', ['quantity']);
    return { type: 'research', amount };
}

function awardStockPrize(category) {
    const unlockedRaw = category === 'resources'
        ? (getUnlockedResourcesArray?.() || [])
        : (getUnlockedCompoundsArray?.() || []);

    const unlocked = Array.from(new Set((unlockedRaw || []).map((v) => String(v || '').toLowerCase())));
    if (category === 'resources' && !unlocked.includes('hydrogen')) {
        unlocked.unshift('hydrogen');
    }

    const eligible = unlocked.filter((key) => {
        const qty = Number(getResourceDataObject(category, [key, 'quantity']) ?? 0);
        const cap = Number(getResourceDataObject(category, [key, 'storageCapacity']) ?? 0);
        return Number.isFinite(cap) && cap > qty;
    });

    const chosenKey = pickRandom(eligible);
    if (!chosenKey) {
        return null;
    }

    const currentQty = Number(getResourceDataObject(category, [chosenKey, 'quantity']) ?? 0);
    const cap = Number(getResourceDataObject(category, [chosenKey, 'storageCapacity']) ?? 0);
    const headroom = Math.max(0, cap - currentQty);
    const maxInc = Math.max(1, Math.floor(currentQty * 0.1));
    const maxAward = Math.min(headroom, maxInc);
    if (!Number.isFinite(maxAward) || maxAward <= 0) {
        return null;
    }

    const amount = randomIntInclusive(1, maxAward);
    setResourceDataObject(Math.max(0, currentQty + amount), category, [chosenKey, 'quantity']);
    return { type: category, key: chosenKey, amount };
}

function awardTimePrize(cost) {
    const candidates = [];

    if (getCurrentlySearchingAsteroid?.() && (getTimeLeftUntilAsteroidScannerTimerFinishes?.() > 0)) {
        candidates.push({
            id: 'spaceTelescopeSearchAsteroids',
            label: 'Space Telescope: Asteroid Scan',
            timerName: 'searchAsteroidTimer',
            getMs: () => getTimeLeftUntilAsteroidScannerTimerFinishes(),
            setMs: (ms) => setTimeLeftUntilAsteroidScannerTimerFinishes(ms),
            restart: (ms) => {
                timerManagerDelta.removeTimer('searchAsteroidTimer');
                startSearchAsteroidTimer([ms, 'wheelPrize']);
            }
        });
    }

    if (getCurrentlyInvestigatingStar?.() && (getTimeLeftUntilStarInvestigationTimerFinishes?.() > 0)) {
        candidates.push({
            id: 'spaceTelescopeStudyStars',
            label: 'Space Telescope: Star Investigation',
            timerName: 'investigateStarTimer',
            getMs: () => getTimeLeftUntilStarInvestigationTimerFinishes(),
            setMs: (ms) => setTimeLeftUntilStarInvestigationTimerFinishes(ms),
            restart: (ms) => {
                timerManagerDelta.removeTimer('investigateStarTimer');
                startInvestigateStarTimer([ms, 'wheelPrize']);
            }
        });
    }

    if (getCurrentlyPillagingVoid?.() && (getTimeLeftUntilPillageVoidTimerFinishes?.() > 0)) {
        candidates.push({
            id: 'spaceTelescopePillageVoid',
            label: 'Space Telescope: Void Pillage',
            timerName: 'pillageVoidTimer',
            getMs: () => getTimeLeftUntilPillageVoidTimerFinishes(),
            setMs: (ms) => setTimeLeftUntilPillageVoidTimerFinishes(ms),
            restart: (ms) => {
                timerManagerDelta.removeTimer('pillageVoidTimer');
                startPillageVoidTimer([ms, 'wheelPrize']);
            }
        });
    }

    if (getStarShipTravelling?.() && (getTimeLeftUntilTravelToDestinationStarTimerFinishes?.() > 0)) {
        candidates.push({
            id: 'starshipTravelling',
            label: 'Starship Journey',
            timerName: 'starShipTravelToDestinationStarTimer',
            getMs: () => getTimeLeftUntilTravelToDestinationStarTimerFinishes(),
            setMs: (ms) => setTimeLeftUntilTravelToDestinationStarTimerFinishes(ms),
            restart: (ms) => {
                timerManagerDelta.removeTimer('starShipTravelToDestinationStarTimer');
                startTravelToDestinationStarTimer([ms, 'wheelPrize']);
            }
        });
    }

    ['rocket1', 'rocket2', 'rocket3', 'rocket4'].forEach((rocketKey) => {
        try {
            const active = getCurrentlyTravellingToAsteroid?.(rocketKey);
            const remaining = Number(getTimeLeftUntilRocketTravelToAsteroidTimerFinishes?.(rocketKey) ?? 0);
            if (active && remaining > 0) {
                const returning = !!getRocketDirection?.(rocketKey);
                const timerName = returning ? `${rocketKey}TravelReturnTimer` : `${rocketKey}TravelToAsteroidTimer`;
                candidates.push({
                    id: `${rocketKey}Travelling`,
                    label: getRocketUserName?.(rocketKey) ?? titleCaseFromKey(rocketKey),
                    timerName,
                    getMs: () => Number(getTimeLeftUntilRocketTravelToAsteroidTimerFinishes(rocketKey) ?? 0),
                    setMs: (ms) => setTimeLeftUntilRocketTravelToAsteroidTimerFinishes(rocketKey, ms),
                    restart: (ms) => {
                        timerManagerDelta.removeTimer(timerName);
                        startTravelToAndFromAsteroidTimer([ms, 'wheelPrize'], rocketKey, returning);
                    }
                });
            }
        } catch (e) {
            // ignore
        }
    });

    const chosen = pickRandom(candidates);
    if (!chosen) {
        return { type: 'cp_fallback', ...awardCpPrize(cost) };
    }

    const remainingMs = Number(chosen.getMs?.() ?? 0);
    if (!Number.isFinite(remainingMs) || remainingMs <= 0) {
        return { type: 'cp_fallback', ...awardCpPrize(cost) };
    }

    const maxReduce = Math.floor(remainingMs * 0.1);
    if (maxReduce <= 0) {
        return { type: 'cp_fallback', ...awardCpPrize(cost) };
    }

    const reduceMs = randomIntInclusive(1, maxReduce);
    const newMs = Math.max(0, remainingMs - reduceMs);
    if (typeof chosen.restart === 'function') {
        chosen.restart(newMs);
    } else if (typeof chosen.setMs === 'function') {
        chosen.setMs(newMs);
    }
    return {
        type: 'time',
        timerId: chosen.id,
        timerLabel: chosen.label,
        oldSeconds: Math.ceil(remainingMs / 1000),
        newSeconds: Math.ceil(newMs / 1000),
    };
}

const regularPrizes = {
    resources: { type: 'resources' },
    compounds: { type: 'compounds' },
    cash: { type: 'cash' },
    research: { type: 'research' },
    time: { type: 'time' },
    cp: { type: 'cp' }
};

function awardRegularPrize(cost) {
    const keys = Object.keys(regularPrizes);
    const chosen = pickRandom(keys);
    if (!chosen) {
        return awardCpPrize(cost);
    }

    if (chosen === 'resources') {
        return awardStockPrize('resources') || awardCpPrize(cost);
    }

    if (chosen === 'compounds') {
        return awardStockPrize('compounds') || awardCpPrize(cost);
    }

    if (chosen === 'cash') {
        return awardCashPrize() || awardCpPrize(cost);
    }

    if (chosen === 'research') {
        return awardResearchPrize() || awardCpPrize(cost);
    }

    if (chosen === 'time') {
        const result = awardTimePrize(cost);
        return result || awardCpPrize(cost);
    }

    if (chosen === 'cp') {
        return awardCpPrize(cost);
    }

    return awardCpPrize(cost);
}

export function setBaseProbabilityCasino(value) {
    const n = Number(value);
    const clamped = Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.4;
    setGalacticCasinoDataObject(clamped, 'settings', ['baseProbabilityCasino']);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function easeInQuad(t) {
    return t * t;
}

function spinEase(t) {
    const a = 0.2;
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    if (t < a) {
        const p = t / a;
        return a * easeInQuad(p);
    }
    const p = (t - a) / (1 - a);
    return a + (1 - a) * easeOutCubic(p);
}

export function spinDoubleOrNothing(spinnerId, durationMs = 5000) {
    const spinnerEl = document.getElementById(spinnerId);
    if (!spinnerEl) return Promise.resolve('lose');

    const track = spinnerEl.querySelector('.casino-spinner-track');
    if (!track) return Promise.resolve('lose');

    const items = Array.from(track.querySelectorAll('.casino-spinner-item'));
    if (items.length === 0) return Promise.resolve('lose');

    const viewport = spinnerEl.querySelector('.casino-spinner-viewport');

    const winProbability = getBaseProbabilityCasino();
    const roll = Math.random();
    const outcome = (roll < winProbability) ? 'win' : 'lose';

    const preferredItem = outcome === 'win'
        ? items.find(el => el.dataset.value === 'win')
        : items.find(el => el.dataset.value === 'lose');

    let itemHeight = items[0].offsetHeight;
    if (!itemHeight && preferredItem) {
        itemHeight = preferredItem.offsetHeight;
    }
    if (!itemHeight) {
        itemHeight = viewport?.offsetHeight || 0;
    }
    if (!itemHeight) {
        return Promise.resolve(outcome);
    }

    const viewportHeight = viewport?.offsetHeight || itemHeight;
    const centerOffset = (viewportHeight - itemHeight) / 2;

    track.style.transform = `translateY(${centerOffset}px)`;

    const startTime = performance.now();

    let targetIndex = -1;
    for (let i = items.length - 1; i >= 0; i -= 1) {
        if (items[i]?.dataset?.value === outcome) {
            targetIndex = i;
            break;
        }
    }
    if (targetIndex < 0) {
        targetIndex = 0;
    }

    const startOffset = centerOffset;
    const targetEl = items[targetIndex];
    const viewportCenter = viewportHeight / 2;
    const targetCenter = targetEl ? (targetEl.offsetTop + (itemHeight / 2)) : ((targetIndex * itemHeight) + (itemHeight / 2));
    const endOffset = viewportCenter - targetCenter;

    track.style.willChange = 'transform';

    return new Promise((resolve) => {
        const tick = (now) => {
            const t = Math.min(1, (now - startTime) / durationMs);
            const eased = spinEase(t);
            const current = startOffset + (endOffset - startOffset) * eased;
            track.style.transform = `translateY(${current}px)`;

            if (t < 1) {
                requestAnimationFrame(tick);
            } else {
                track.style.willChange = '';

                track.style.transform = `translateY(${Math.round(endOffset)}px)`;

                if (viewport && typeof viewport.animate === 'function') {
                    viewport.animate(
                        [
                            { transform: 'scale(1)' },
                            { transform: 'scale(1.18)' },
                            { transform: 'scale(1)' }
                        ],
                        { duration: 300, easing: 'ease-out' }
                    );
                }
                resolve(outcome);
            }
        };

        requestAnimationFrame(tick);
    });
}

export function playDoubleOrNothing({ stake, spinnerId }) {
    const currentCp = getGalacticCasinoDataObject('casinoPoints', ['quantity']) ?? 0;
    const stakeInt = parseInt(String(stake ?? '0'), 10);
    const desiredStake = Number.isFinite(stakeInt) ? Math.max(0, stakeInt) : 0;

    if (desiredStake <= 0) {
        showNotification('Enter a valid stake.', 'info', 2500, 'galacticCasino');
        return;
    }

    if (desiredStake > currentCp) {
        showNotification('Not enough CP for that stake.', 'info', 2500, 'galacticCasino');
        return;
    }

    setGalacticCasinoDataObject(Math.max(0, currentCp - desiredStake), 'casinoPoints', ['quantity']);

    const spinButton = document.getElementById('galacticCasinoGame1SpinButton');
    if (spinButton) {
        spinButton.disabled = true;
        spinButton.classList.add('red-disabled-text');
    }

    spinDoubleOrNothing(spinnerId, 5000)
        .then((outcome) => {
            if (outcome === 'win') {
                const cpAfterSpin = getGalacticCasinoDataObject('casinoPoints', ['quantity']) ?? 0;
                setGalacticCasinoDataObject(Math.max(0, cpAfterSpin + (desiredStake * 2)), 'casinoPoints', ['quantity']);
                showNotification('WIN! Stake doubled.', 'info', 2500, 'galacticCasino');
            } else {
                showNotification('LOSE! Better luck next time.', 'error', 2500, 'galacticCasino');
            }
        })
        .finally(() => {
            if (spinButton) {
                const stakeEl = document.getElementById('galacticCasinoGame1StakeTextArea');
                const cleaned = String(stakeEl?.value ?? '').replace(/[^0-9]/g, '');
                const stakeValue = cleaned === '' ? 0 : parseInt(cleaned, 10);
                const canSpin = Number.isFinite(stakeValue) && stakeValue > 0;

                spinButton.disabled = !canSpin;
                spinButton.classList.toggle('green-ready-text', canSpin);
                spinButton.classList.toggle('red-disabled-text', !canSpin);
            }
        });
}

export function playWheelOfFortune({ wheelId, costCp = 1, durationMs = 5000 } = {}) {
    const id = String(wheelId || '');
    if (!id) {
        return Promise.resolve(null);
    }
    const wheelEl = document.getElementById(id);
    if (!wheelEl) {
        return Promise.resolve(null);
    }
    const face = wheelEl.querySelector('.galactic-casino-roulette-face');
    if (!face) {
        return Promise.resolve(null);
    }
    const spinButton = document.getElementById('galacticCasinoGame2SpinWheelButton');
    const currentCp = getGalacticCasinoDataObject('casinoPoints', ['quantity']) ?? 0;
    const cost = Number.isFinite(Number(costCp)) ? Math.max(0, Number(costCp)) : 1;
    if (cost <= 0) {
        return Promise.resolve(null);
    }
    const specialReady = String(wheelEl.getAttribute('data-special-ready') || 'false') === 'true';
    if (specialReady) {
        showNotification('Claim your prize before spinning again.', 'info', 2500, 'galacticCasino');
        return Promise.resolve(null);
    }
    if (currentCp < cost) {
        showNotification('Not enough CP to spin the wheel.', 'info', 2500, 'galacticCasino');
        return Promise.resolve(null);
    }
    const spinning = String(wheelEl.getAttribute('data-spinning') || 'false') === 'true';
    if (spinning) {
        return Promise.resolve(null);
    }
    wheelEl.setAttribute('data-special-ready', 'false');
    wheelEl.setAttribute('data-prize-selection', 'select');
    wheelEl.setAttribute('data-spinning', 'true');
    if (spinButton) {
        spinButton.disabled = true;
        spinButton.classList.add('red-disabled-text');
        spinButton.classList.remove('green-ready-text');
    }
    setGalacticCasinoDataObject(Math.max(0, currentCp - cost), 'casinoPoints', ['quantity']);
    const segmentCount = 16;
    const segmentAngle = 360 / segmentCount;

    globalThis.__wheelForceSpecial = true; //debug to win special prize
    const forcedIndexRaw = globalThis.__wheelForceIndex;
    const forcedIndex = Number.isFinite(Number(forcedIndexRaw)) ? Math.floor(Number(forcedIndexRaw)) : null;
    const selectedIndex = globalThis.__wheelForceSpecial
        ? 0
        : (forcedIndex !== null
            ? ((forcedIndex % segmentCount) + segmentCount) % segmentCount
            : Math.floor(Math.random() * segmentCount));
    const selectedCenter = (selectedIndex * segmentAngle) + (segmentAngle / 2);
    const currentRotation = Number.parseFloat(String(wheelEl.getAttribute('data-rotation') || '0')) || 0;
    const normalizedCurrent = ((currentRotation % 360) + 360) % 360;
    const desiredNormalized = ((-selectedCenter % 360) + 360) % 360;
    const delta = ((desiredNormalized - normalizedCurrent) + 360) % 360;
    const extraSpins = 6;
    const targetRotation = currentRotation + (extraSpins * 360) + delta;
    face.style.willChange = 'transform';
    const startTime = performance.now();
    return new Promise((resolve) => {
        const tick = (now) => {
            const t = Math.min(1, (now - startTime) / durationMs);
            const eased = easeOutCubic(t);
            const current = currentRotation + (targetRotation - currentRotation) * eased;
            face.style.transform = `rotate(${current}deg)`;

            if (t < 1) {
                requestAnimationFrame(tick);
            } else {
                face.style.willChange = '';

                face.style.transform = `rotate(${Math.round(targetRotation)}deg)`;

                wheelEl.setAttribute('data-rotation', String(targetRotation));
                wheelEl.setAttribute('data-spinning', 'false');
                const cpAfter = getGalacticCasinoDataObject('casinoPoints', ['quantity']) ?? 0;
                if (spinButton) {
                    const canSpin = cpAfter >= cost;
                    spinButton.disabled = !canSpin;
                    spinButton.classList.toggle('green-ready-text', canSpin);
                    spinButton.classList.toggle('red-disabled-text', !canSpin);
                }

                if (selectedIndex === 0) {
                    wheelEl.setAttribute('data-special-ready', 'true');
                    showNotification('WIN! Special Prize! - Select a Prize from the dropdown to continue.', 'info', 3500, 'galacticCasino');
                } else if (selectedIndex % 2 === 1) {
                    showNotification('LOSE! Better luck next time.', 'error', 2000, 'galacticCasino');
                } else {
                    const prize = awardRegularPrize(cost);

                    if (prize?.type === 'resources' || prize?.type === 'compounds') {
                        showNotification(`WON! ${prize.amount} ${titleCaseFromKey(prize.key)}`, 'info', 3500, 'galacticCasino');
                    } else if (prize?.type === 'cash') {
                        showNotification(`WON! ${prize.amount} Cash`, 'info', 3500, 'galacticCasino');
                    } else if (prize?.type === 'research') {
                        showNotification(`WON! ${prize.amount} Research Points`, 'info', 3500, 'galacticCasino');
                    } else if (prize?.type === 'time') {
                        const label = prize?.timerLabel || 'Timer';
                        const fromS = Number(prize?.oldSeconds ?? 0);
                        const toS = Number(prize?.newSeconds ?? 0);
                        showNotification(`WON! ${label}: Time reduced from ${fromS}s to ${toS}s`, 'info', 3500, 'galacticCasino');
                    } else if (prize?.type === 'cp_fallback' || prize?.type === 'cp') {
                        const amount = prize?.amount ?? 0;
                        showNotification(`WON! ${amount} CP`, 'info', 3500, 'galacticCasino');
                    } else {
                        showNotification('WON!', 'info', 2500, 'galacticCasino');
                    }
                }

                resolve({ selectedIndex });
            }
        };
        requestAnimationFrame(tick);
    });
}