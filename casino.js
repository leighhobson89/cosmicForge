import { showNotification } from './ui.js';
import { getGalacticCasinoDataObject, setGalacticCasinoDataObject } from './resourceDataObject.js';

export function getBaseProbabilityCasino() {
    const value = getGalacticCasinoDataObject('settings', ['baseProbabilityCasino']);
    return (typeof value === 'number' && Number.isFinite(value)) ? value : 0.4;
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
    if (globalThis.__casinoDebug) {
        console.log('[casino] spin', { winProbability, roll, outcome });
    }

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
