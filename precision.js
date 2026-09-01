/**
 * The game's single precision policy.
 *
 * Every quantity in Cosmic Forge is a float. Production accrues as
 * `rate * deltaMs / tickInterval` many times a second, cash arrives from sales
 * priced in fractions of a unit, and storage caps are doubled repeatedly. Prices,
 * by contrast, are integers: `setNewItemPrice()` puts every new price through
 * `Math.ceil`. So the game constantly asks a float whether it has reached an
 * integer, and answers that question in two different places — the frame loop,
 * which decides whether the Buy button is red, and `checkAndDeductResources()`,
 * which actually collects the charge.
 *
 * Before this module those two asked it differently, and the display asked it a
 * third way. That is where the player's three complaints came from:
 *
 *   - Cash was displayed with `toFixed(2)`, which rounds *up*. A balance of
 *     999.996 read `$1000.00` on the stat bar while a 1000 purchase was refused.
 *   - A building's secondary resource costs were coloured with a strict `>`,
 *     while the charge settles on `>=`. Holding exactly the quoted price showed
 *     red on a purchase that would have gone through.
 *   - Repeated float addition leaves a balance a few ulps under a round number.
 *     `quantity >= price` then says no to what the player reads as an exact
 *     match, which is the "stops 0.01% short" report.
 *
 * The policy here is one rule, applied in one direction:
 *
 *   **Round holdings down, round costs up, and let both sides of every
 *   comparison share a single tolerance.**
 *
 * That direction is what makes the display honest rather than merely tidy: a
 * displayed holding is never more than the player has, and a displayed cost is
 * never less than they will be charged. Combined with integer prices it gives
 * the property the whole item exists for —
 *
 *     canAfford(quantity, cost)  <=>  displayQuantity(quantity) >= displayCost(cost)
 *
 * — so "it looks affordable but the button is red" cannot happen by construction
 * rather than by luck. `tests/e2e/precision/precision.spec.js` asserts that
 * equivalence directly.
 *
 * Deliberately dependency-free, like `utilityFunctions.js`. It is imported by
 * `game.js`, which `constantsAndGlobalVars.js` in turn imports, so taking a
 * dependency here would close a cycle around the module that owns boot state.
 * Nothing in here is mutable game state, so nothing in here belongs in the
 * constants file behind a getter/setter.
 */

/**
 * The floor under the tolerance, for values near zero.
 *
 * 1e-9 is far above the noise repeated float addition produces at the scale the
 * early game runs at (a double carries ~15 significant digits, so a balance in
 * the hundreds drifts in the 1e-13 range) and far below any quantity the game
 * can express as a price, the smallest of which is 1.
 */
export const PRECISION_ABSOLUTE_TOLERANCE = 1e-9;

/**
 * The tolerance as a share of the value, for large ones.
 *
 * A fixed 1e-9 is meaningless late in a run: at 1e15 the gap between adjacent
 * doubles is larger than that, so an absolute-only tolerance silently becomes no
 * tolerance at all exactly where accumulated drift is worst.
 *
 * The size of the share is a squeeze between two failures. Too small and it
 * stops absorbing drift: the gap between adjacent doubles at magnitude *m* is
 * about `m * 2.2e-16`, and drift accumulates over many additions, so anything
 * near that gap is no margin at all. Too large and the slack becomes visible —
 * at 1e-12, the tolerance at a magnitude of 1e12 is a whole unit, which
 * `displayCurrency` would then round a full unit upward, reintroducing at the
 * top of the range exactly the overstatement this module exists to remove.
 *
 * 1e-13 sits in the middle: roughly 450 ulps of headroom at every scale, and
 * never more than a tenth of a unit at 1e12. Past that the slack does grow to a
 * displayable size in principle, but a value that large is rendered abbreviated
 * ("1.0e15"), thirteen orders of magnitude coarser than the slack, so it cannot
 * be seen.
 */
export const PRECISION_RELATIVE_TOLERANCE = 1e-13;

/** How much slack a comparison against `value` is allowed. */
export function toleranceFor(value) {
    const magnitude = Math.abs(Number(value));
    if (!Number.isFinite(magnitude)) {
        return PRECISION_ABSOLUTE_TOLERANCE;
    }
    return Math.max(PRECISION_ABSOLUTE_TOLERANCE, magnitude * PRECISION_RELATIVE_TOLERANCE);
}

/**
 * Has `value` reached `threshold`, allowing for float drift?
 *
 * The general form. `canAfford` is the same test named for the thing the game
 * asks it about most, and exists separately so a reader of a purchase gate does
 * not have to work out which argument is which.
 */
export function isAtLeast(value, threshold) {
    const v = Number(value);
    const t = Number(threshold);
    if (!Number.isFinite(v) || !Number.isFinite(t)) {
        return false;
    }
    return v >= t - toleranceFor(t);
}

export function canAfford(quantity, cost) {
    return isAtLeast(quantity, cost);
}

export function isEffectivelyEqual(a, b) {
    const x = Number(a);
    const y = Number(b);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return false;
    }
    return Math.abs(x - y) <= Math.max(toleranceFor(x), toleranceFor(y));
}

export function settleSpend(quantity, cost) {
    const q = Number(quantity) || 0;
    const c = Number(cost) || 0;
    const remainder = q - c;
    if (remainder < 0) {
        return 0;
    }
    return remainder;
}

export function displayQuantity(value) {
    const v = Number(value);
    if (!Number.isFinite(v)) {
        return 0;
    }
    return Math.floor(v + toleranceFor(v));
}

export function displayCost(value) {
    const v = Number(value);
    if (!Number.isFinite(v)) {
        return 0;
    }
    return Math.ceil(v - toleranceFor(v));
}

export function displayCurrency(value) {
    const v = Number(value);
    if (!Number.isFinite(v)) {
        return '0.00';
    }
    const sign = v < 0 ? '-' : '';
    const magnitude = Math.abs(v);
    const slack = Math.min(toleranceFor(magnitude), 0.005);
    const truncated = Math.floor((magnitude + slack) * 100) / 100;
    return `${sign}${truncated.toFixed(2)}`;
}

export function truncateToDecimals(value, decimals) {
    const v = Number(value);
    if (!Number.isFinite(v)) {
        return 0;
    }
    const factor = Math.pow(10, decimals);
    const sign = v < 0 ? -1 : 1;
    const magnitude = Math.abs(v);
    const slack = magnitude * 4 * Number.EPSILON;
    return sign * (Math.floor((magnitude + slack) * factor) / factor);
}

export function formatUpgradeStep(currentValue, nextValue, options = {}) {
    const preferred = Number.isFinite(Number(options.decimals)) ? Math.floor(Number(options.decimals)) : 0;
    const ceiling = Number.isFinite(Number(options.maxDecimals)) ? Math.floor(Number(options.maxDecimals)) : 3;

    const low = Math.max(0, Math.min(20, preferred));
    const high = Math.max(low, Math.min(20, ceiling));

    const current = Number(currentValue);
    const next = Number(nextValue);

    if (!Number.isFinite(current) || !Number.isFinite(next)) {
        return {
            current: String(currentValue),
            next: String(nextValue),
            decimals: low,
            distinct: false
        };
    }

    for (let decimals = low; decimals <= high; decimals++) {
        const currentText = current.toFixed(decimals);
        const nextText = next.toFixed(decimals);
        if (currentText !== nextText) {
            return { current: currentText, next: nextText, decimals, distinct: true };
        }
    }

    return {
        current: current.toFixed(high),
        next: next.toFixed(high),
        decimals: high,
        distinct: false
    };
}
