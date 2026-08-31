/**
 * newUI/notation.js — Phase 2 of the large UI refactor.
 * See docs/largeUIRefactor.md §F4 and the Phase 2 section.
 *
 * THE RAW-VALUE CHANNEL
 * =====================
 * The defect this file exists to remove: today a number is written into an
 * element's text and that text becomes the only copy of it. Every frame the
 * formatters read the number back *out of the markup* by string surgery —
 * `textContent.split(' ')` and `parts[1]` in complexPurchaseBuildingFormatter
 * (game.js:12683), `innerHTML.match(/>(.*?)</)` in complexSellStringFormatter
 * (game.js:12804), and a bare global digit-matching regex sweep over innerHTML in
 * formatAllNotationElements (game.js:12595).
 *
 * That makes word order load-bearing. A translation that puts the unit before
 * the number, a currency symbol on the wrong side, a comma inside a number, or
 * a span some other feature injected, all change what the parser recovers. The
 * codebase already carries the scar: Cosmic Rip rows had to be given an early
 * return because "the walk below would mangle them in either mode".
 *
 * THE FIX
 * -------
 * A writer stamps the raw number(s) and the literal text around them onto the
 * element, and the formatter *rebuilds* the display from those. Nothing is ever
 * parsed back out of what was rendered.
 *
 * The stamp is deliberately an interleaved parts/values pair rather than a
 * template string with `{0}` placeholders, because a localised label may itself
 * contain braces and there would then be no safe escape:
 *
 *     parts  = ["$", " per tick"]      values = [1234]
 *     render = "$" + format(1234) + " per tick"
 *
 * `parts.length` is always `values.length + 1`.
 *
 * MIGRATION SHAPE
 * ---------------
 * This is opt-in, per element. `renderStamped()` returns false for an element
 * that carries no stamp, and every formatter falls back to its legacy path in
 * that case. So writers can be migrated one at a time and an unmigrated element
 * behaves exactly as it does today — which is what lets Phase 2 land in pieces
 * against the Phase 0 screenshots rather than as one all-or-nothing rewrite.
 */

/* Dataset keys. Kept as constants because they are read in game.js and written
   here, and a typo in either place would silently fall back to the legacy path
   rather than throwing. */
export const PARTS_KEY = 'uiParts';   // data-ui-parts — JSON array of literals
export const VALUES_KEY = 'uiVals';   // data-ui-vals  — JSON array of numbers
export const FORMAT_KEY = 'uiFmt';    // data-ui-fmt   — formatting variant

/**
 * Formatting variants. The default covers every ordinary number; the other two
 * preserve behaviours the legacy formatter special-cased and which players
 * would notice if they changed.
 */
export const FORMAT_DEFAULT = 'default';
/** The cash stat drops a trailing `.0` — `$1M` reads better than `$1.0M`. */
export const FORMAT_CASH = 'cash';
/** Research and building costs under 1000 stay unabbreviated and exact. */
export const FORMAT_COST_VERBATIM = 'costVerbatim';

/**
 * Stamp an element with the values and surrounding literals that make up its
 * text, then leave it to `renderStamped` to draw.
 *
 * `parts` must have exactly one more entry than `values`.
 * Passing a non-finite value clears the stamp rather than writing `NaN`, so a
 * caller that has nothing meaningful to show degrades to the legacy path
 * instead of rendering garbage.
 */
export function stamp(element, parts, values, format = FORMAT_DEFAULT) {
    if (!element) return false;

    const safeValues = (values || []).map(Number);
    if (!Array.isArray(parts) || parts.length !== safeValues.length + 1
        || safeValues.some((v) => !Number.isFinite(v))) {
        clearStamp(element);
        return false;
    }

    element.dataset[PARTS_KEY] = JSON.stringify(parts);
    element.dataset[VALUES_KEY] = JSON.stringify(safeValues);
    element.dataset[FORMAT_KEY] = format;
    return true;
}

/** Convenience for the common one-number case. */
export function stampOne(element, prefix, value, suffix = '', format = FORMAT_DEFAULT) {
    return stamp(element, [prefix ?? '', suffix ?? ''], [value], format);
}

export function clearStamp(element) {
    if (!element) return;
    delete element.dataset[PARTS_KEY];
    delete element.dataset[VALUES_KEY];
    delete element.dataset[FORMAT_KEY];
}

export function hasStamp(element) {
    return !!(element && element.dataset && element.dataset[PARTS_KEY] && element.dataset[VALUES_KEY]);
}

/** Read the stamped values back. Returns null when the element carries no stamp. */
export function readStamp(element) {
    if (!hasStamp(element)) return null;
    try {
        const parts = JSON.parse(element.dataset[PARTS_KEY]);
        const values = JSON.parse(element.dataset[VALUES_KEY]);
        if (!Array.isArray(parts) || !Array.isArray(values) || parts.length !== values.length + 1) {
            return null;
        }
        return { parts, values, format: element.dataset[FORMAT_KEY] || FORMAT_DEFAULT };
    } catch {
        // A malformed stamp must not take the frame down; the caller falls back.
        return null;
    }
}

/**
 * Rebuild an element's text from its stamp.
 *
 * `formatValue(number, format)` is injected rather than imported so this module
 * stays free of any dependency on game.js — which imports half the codebase and
 * would make a circular graph. game.js passes its own notation ladder in.
 *
 * Returns false when there is no usable stamp, which is the caller's signal to
 * run the legacy parsing path for that element.
 *
 * Writes `textContent`, never `innerHTML`: the stamped literals are plain text
 * by construction, and using textContent means a label that happens to contain
 * `<` or `&` cannot become markup.
 */
export function renderStamped(element, formatValue) {
    const s = readStamp(element);
    if (!s || typeof formatValue !== 'function') return false;

    let out = s.parts[0];
    for (let i = 0; i < s.values.length; i++) {
        out += String(formatValue(s.values[i], s.format));
        out += s.parts[i + 1];
    }

    // Only touch the DOM when the text actually changes. The frame loop runs
    // this on every notation element 60 times a second, and an unconditional
    // write invalidates layout even when nothing moved.
    if (element.textContent !== out) {
        element.textContent = out;
    }
    return true;
}

/**
 * Stamp an element and render it in one step, for writers that have the raw
 * values to hand and want the element correct immediately rather than at the
 * next frame.
 */
export function stampAndRender(element, parts, values, formatValue, format = FORMAT_DEFAULT) {
    if (!stamp(element, parts, values, format)) return false;
    return renderStamped(element, formatValue);
}
