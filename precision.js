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

/**
 * Can a holding of `quantity` pay a cost of `cost`?
 *
 * This must be the *only* question asked anywhere a purchase is gated or
 * settled. The gate that greys a button out and the deduction that collects the
 * charge have to agree exactly: a gate looser than the deduction hands out free
 * units (the item is granted by `gain()` before the charge settles, and a failed
 * settle also suppresses the price rise), while a gate tighter than the
 * deduction refuses purchases the game would have honoured.
 */
export function canAfford(quantity, cost) {
    return isAtLeast(quantity, cost);
}

/**
 * Are two quantities the same, allowing for float drift?
 *
 * Used for "this store is at its cap" rather than for money. Production clamps
 * with `Math.min(current + amount, capacity)` so a full store usually lands on
 * the cap exactly, but a store filled by any other route — an offline gain, a
 * rebirth grant, a sale that was reversed — can sit an ulp under it and then
 * never reads as full.
 */
export function isEffectivelyEqual(a, b) {
    const x = Number(a);
    const y = Number(b);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return false;
    }
    return Math.abs(x - y) <= Math.max(toleranceFor(x), toleranceFor(y));
}

/**
 * Pay `cost` out of `quantity`.
 *
 * Subtraction alone is not enough. When the tolerance is what made the purchase
 * affordable, the plain difference is a small negative number, and a negative
 * balance is both displayable and spendable-from. Snapping that residue to zero
 * keeps the loosened gate from being a way to go overdrawn.
 */
export function settleSpend(quantity, cost) {
    const q = Number(quantity) || 0;
    const c = Number(cost) || 0;
    const remainder = q - c;
    if (remainder < 0) {
        return 0;
    }
    return remainder;
}

/**
 * The integer to show for a holding: always at or below the true value.
 *
 * The tolerance is added before flooring, so a balance sitting an ulp under a
 * round number reads as that round number rather than one short — which is the
 * same forgiveness `canAfford` applies, and the reason the two agree.
 */
export function displayQuantity(value) {
    const v = Number(value);
    if (!Number.isFinite(v)) {
        return 0;
    }
    return Math.floor(v + toleranceFor(v));
}

/**
 * The integer to show for a cost: always at or above what will be charged.
 *
 * Prices are already integral, so in practice this is the identity — it exists
 * to state the direction, and to stay correct for the few costs derived as a
 * share of something else (the water reservoir charges 30% of the water cap in
 * concrete).
 */
export function displayCost(value) {
    const v = Number(value);
    if (!Number.isFinite(v)) {
        return 0;
    }
    return Math.ceil(v - toleranceFor(v));
}

/**
 * Cash, to two decimal places, never rounded up.
 *
 * `toFixed(2)` was the single most misleading call in the game: cash is the only
 * display that carries decimals, so it is the only one where the player can read
 * a value precise enough to compare against a price by eye — and it rounded the
 * wrong way.
 */
export function displayCurrency(value) {
    const v = Number(value);
    if (!Number.isFinite(v)) {
        return '0.00';
    }
    const sign = v < 0 ? '-' : '';
    const magnitude = Math.abs(v);
    // A display's tolerance must never exceed half its own quantum, or the slack
    // that is meant to absorb invisible drift starts moving the last digit the
    // player can see. This is the only two-decimal display in the game, so it is
    // the only one where the shared tolerance is coarser than what it renders:
    // past a balance of about 5e10 the relative term grows beyond half a cent.
    const slack = Math.min(toleranceFor(magnitude), 0.005);
    const truncated = Math.floor((magnitude + slack) * 100) / 100;
    return `${sign}${truncated.toFixed(2)}`;
}

/**
 * Round a value to `decimals` places without ever rounding up.
 *
 * The shared primitive behind the abbreviated notations, which quote a value to
 * one decimal place ("1.2K"). Truncating rather than rounding is what stops 1250
 * becoming "1.3K" and reading as more than the player has.
 *
 * The slack here is **a few ulps**, and deliberately not `toleranceFor` — which
 * this function is otherwise the twin of.
 *
 * `toleranceFor` answers "is this balance close enough to that price to count",
 * and its floor of 1e-9 is calibrated for a raw balance. This function is asked
 * something quite different, and it is asked it *after a division*: the
 * abbreviation ladder divides by up to 1e12 before it truncates, and a tolerance
 * meaningful at the original magnitude is enormous at the scaled one. At 1e-9 it
 * rendered 9,999,999,999 as "10.0B"; at a relative 1e-13 it still rendered
 * 9,999,999,999,999 as "10.0e12" — both a whole tenth of a suffix more than the
 * player had, in the one function whose entire purpose is to never overstate.
 *
 * The only error this actually has to absorb is binary representation: a divide
 * and a multiply each cost at most an ulp, so two ulps covers the arithmetic
 * and four leaves double the margin. That is around 9e-16 of the value — a thousand times
 * smaller than the smallest difference the one-decimal display can show, so it
 * can never move a rendered digit, while still fixing the case it exists for:
 * binary cannot hold 2.9, so `2.9 * 10` is 28.999999999999996 and a bare floor
 * would render it "2.8".
 */
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
