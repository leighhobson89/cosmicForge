/**
 * newUI/reveal.js — Phase 3 of the large UI refactor.
 * See docs/largeUIRefactor.md §3.1 and the Phase 3 section (F1).
 *
 * THE REVEAL REGISTRY
 * ===================
 * The defect this file exists to remove: `createOptionRow` decides for itself
 * whether a row should be on screen, and to do that it has to know the game's
 * rules. It reads the tech tree (ui.js:3892), the Cosmic Rip telemetry counter
 * (:3910), and then names three specific panes out loud —
 *
 *     if (getCurrentOptionPane() === 'launch pad') { ... }
 *     if (getCurrentOptionPane() === 'space telescope') { ...voidborn, run count... }
 *
 * — inside a layout function. A layout primitive that has to be edited whenever
 * a pane is added is not a primitive, and none of that logic can be tested,
 * reused or reasoned about separately from the markup it is tangled with.
 *
 * Here a row instead *declares* why it might be hidden:
 *
 *     reveal: { kind: 'tech', requires: 'hydrogenFusion' }
 *     reveal: { kind: 'launchPadRocket', target: 'rocket1' }
 *
 * and the predicate for each `kind` is registered by whoever owns that rule.
 * `tech` and `techUnlock` are registered by ui.js, which already imports the
 * tech accessors; `launchPadRocket` and `spaceTelescopeAction` are registered by
 * drawTab6Content.js, which is the file that draws those two panes. The layout
 * code knows only that a predicate exists.
 *
 * THREE-STATE RESULT, DELIBERATELY
 * --------------------------------
 * A predicate returns `true` (show), `false` (hide) or `null` (no opinion —
 * leave the row exactly as it is). The third state is not decoration: the legacy
 * code it replaces is asymmetric in precisely this way. The tech-unlock branch
 * only ever *adds* `invisible` and never removes it, because something else —
 * `resourceAndCompoundMonitorRevealRowsChecks` in the frame loop
 * (game.js:7620) — owns the un-hiding. The launch-pad branch both adds and
 * removes. Collapsing those to a boolean would silently change which rows the
 * frame loop is allowed to reveal, so the asymmetry is kept and made explicit.
 *
 * A row may carry several reveals; they are applied in order, and a later one
 * that has an opinion overrides an earlier one. That reproduces the legacy
 * sequence (tech → cosmic rip → launch pad → space telescope → startInvisible →
 * iteration param) exactly, which is what lets the adapter be a pure remapping
 * rather than a behavioural change.
 *
 * SIDE EFFECTS
 * ------------
 * Two of the legacy branches do more than decide: on first sighting they record
 * the tech as revealed (`setRevealedTechArray`). That belongs to the predicate,
 * not to this file, so predicates are allowed to have effects and are called
 * exactly once per row build — the same number of times the legacy branch ran.
 */

/** kind -> predicate(revealSpec, context) => true | false | null */
const predicates = new Map();

/** The class the game already uses for a hidden row. Unchanged on purpose. */
export const HIDDEN_CLASS = 'invisible';

/**
 * Register the predicate for one reveal kind.
 *
 * Registering a kind twice replaces the predicate and is not an error: the draw
 * files are re-imported in some tooling contexts, and a throw there would be a
 * worse failure than a replacement.
 */
export function registerReveal(kind, predicate) {
    if (typeof kind !== 'string' || !kind) return false;
    if (typeof predicate !== 'function') return false;
    predicates.set(kind, predicate);
    return true;
}

/** Whether anything has claimed this kind yet. */
export function hasReveal(kind) {
    return predicates.has(kind);
}

/** Every registered kind, for the parity tool and for debugging. */
export function listRevealKinds() {
    return [...predicates.keys()].sort();
}

/**
 * Ask one reveal descriptor whether its row should be visible.
 *
 * Returns `true`, `false`, or `null` for "no opinion". An unregistered kind is
 * `null` rather than a throw — a row whose owning pane has not been migrated yet
 * must keep rendering, and a missing predicate would otherwise blank a pane.
 */
export function evaluateReveal(reveal, context = null) {
    if (!reveal || typeof reveal.kind !== 'string') return null;

    const predicate = predicates.get(reveal.kind);
    if (!predicate) return null;

    const result = predicate(reveal, context);
    return result === true || result === false ? result : null;
}

/**
 * Apply a reveal descriptor, or a list of them, to an element.
 *
 * Applied in array order so a later opinion wins, matching the legacy branch
 * order. Returns the final visibility as a boolean, which is what the caller
 * needs when it wants to skip building an expensive hidden subtree.
 */
export function applyReveal(element, reveal, context = null) {
    if (!element) return true;

    const list = (Array.isArray(reveal) ? reveal : [reveal]).filter(Boolean);

    for (const descriptor of list) {
        const verdict = evaluateReveal(descriptor, context);
        if (verdict === true) element.classList.remove(HIDDEN_CLASS);
        else if (verdict === false) element.classList.add(HIDDEN_CLASS);
    }

    return !element.classList.contains(HIDDEN_CLASS);
}

/** Test seam: drop every predicate. Not used by the game. */
export function clearRevealRegistry() {
    predicates.clear();
}
