/**
 * newUI/createRow.js — Phase 3 of the large UI refactor.
 * See docs/largeUIRefactor.md §3.1–3.3 and the Phase 3 section.
 *
 * `createRow(spec)` — the v2 row primitive.
 * =========================================
 * This is the row builder the migration is aiming at: it takes the described
 * row from newUI/rowSpec.js and renders it into the Phase 1 section grid, where
 * the *section* owns the columns and the row places cells into named tracks.
 *
 * It replaces `createOptionRow`, which does three things this one deliberately
 * does not:
 *
 *   1. **It decides its own visibility from game rules.** Tech tree, Cosmic Rip
 *      telemetry, and three panes named out loud in a layout function. Here the
 *      row carries `reveal` descriptors and newUI/reveal.js asks whoever
 *      registered that kind. This file contains no game rule at all.
 *
 *   2. **It declares its own widths.** 44 call sites pass an inline percentage
 *      pair that writes `style.width` and bypasses the stylesheet. A row built
 *      here has no widths to declare — the pane's grid tracks decide, so every
 *      action cell on the screen shares one left edge by construction rather
 *      than by coincidence.
 *
 *   3. **It renders its cost as a sentence.** The whole cost went in as one
 *      string that the frame loop then re-parsed by word position, every frame.
 *      Here each component is a chip carrying its own raw number.
 *
 * WHAT IS DELIBERATELY KEPT
 * -------------------------
 * The row still carries the `option-row` class alongside `ui-row`, and still
 * carries the same `data-*` attributes the legacy wrapper does. That is not
 * timidity: the frame loop sweeps `document.querySelectorAll('.option-row')`
 * once a frame and hands each one to `resourceAndCompoundMonitorRevealRowsChecks`
 * (game.js:7620), which is what actually un-hides a tech row when its research
 * threshold is crossed. A migrated row that dropped the class would stop being
 * revealed. The class goes at Phase 7, with that sweep, not before.
 *
 * `.ui-row` is `display: contents`, so the legacy `.option-row { display: flex }`
 * rule has nothing to apply to — but the two rules have equal specificity and
 * would be decided by load order alone, which is too fragile a thing to rest a
 * layout on. newUI/components.css therefore states `.ui-row.option-row`
 * explicitly.
 */

import { createUiRow, createSection, createPane, appendUiRow, resolveText, setUiLocaliser } from './createSection.js';
import { createRowSpec } from './rowSpec.js';
import { applyReveal } from './reveal.js';
import { stamp, FORMAT_DEFAULT } from './notation.js';

export { createSection, createPane, appendUiRow, setUiLocaliser };

/**
 * Legacy classes a migrated row keeps wearing, and why.
 *
 * `option-row` — the frame loop's reveal sweep selects on it (game.js:2634).
 * `d-flex`     — NOT kept. It is a bootstrap display class and would fight
 *                `display: contents`; nothing selects on it.
 */
const LEGACY_ROW_CLASS = 'option-row';

/**
 * Build one row from a spec.
 *
 * Returns the `.ui-row` element. Append it to a section built by
 * `createSection`, or pass the spec straight to a section's `rows` array.
 *
 * `context` is handed to the reveal predicates untouched, so a pane can pass
 * whatever its own predicates need without this file knowing what that is.
 */
export function createRow(spec, context = null) {
    const normalised = createRowSpec(spec);

    const row = createUiRow({
        id: normalised.id,
        variant: normalised.variant,
        title: normalised.title,
        subtitle: normalised.subtitle,
        stat: normalised.stat,
        cost: normalised.cost,
        actions: normalised.actions,
        detail: normalised.detail,
        detailLabel: normalised.detailLabel,
        detailOpen: normalised.detailOpen,
        detailCollapsible: normalised.detailCollapsible,
        detailInline: normalised.detailInline,
        affordable: !(normalised.gate && normalised.gate.blocked),
        hidden: normalised.hidden,
        dataset: normalised.dataset
    });

    row.classList.add(LEGACY_ROW_CLASS);
    normalised.classNames.forEach((className) => row.classList.add(className));

    applyGate(row, normalised.gate);
    stampCostChips(row, normalised.cost);
    applyReveal(row, normalised.reveal, context);

    return row;
}

/**
 * Put the affordability plumbing on the cost cell.
 *
 * The mechanism is unchanged and must stay unchanged: affordability in this game
 * is enforced by the frame loop adding `red-disabled-text`, whose CSS is
 * `pointer-events: none`, and purchase handlers carry no guard of their own.
 * That is by design. All that moves is which element wears the class — the
 * legacy row put it on the description label, the grid row puts it on the cost
 * cell — and the frame loop finds it by the same marker class it always used
 * (`resource-cost-sell-check` / `compound-cost-sell-check`) plus the same
 * `data-*` attributes it reads off it.
 */
function applyGate(row, gate) {
    if (!gate) return;

    const costCell = row.querySelector(':scope > .ui-cell-cost');
    if (!costCell) return;

    if (gate.kind === 'affordability') {
        costCell.classList.add('red-disabled-text');
        if (gate.category === 'compound') costCell.classList.add('compound-cost-sell-check');
        else costCell.classList.add('resource-cost-sell-check');
    }

    if (gate.dataset) {
        Object.entries(gate.dataset).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') return;
            costCell.dataset[key] = String(value);
        });
    }
}

/**
 * Stamp each chip with its raw amount through the Phase 2 channel.
 *
 * `createCostChips` already writes `dataset.uiAmount`, which is the row's own
 * record of the number. This adds the notation stamp on top, which is what the
 * *formatter* reads — the two are separate on purpose: `uiAmount` says what the
 * row costs, the stamp says how to redraw the text without parsing it. A chip
 * whose amount is absent gets no stamp and is left exactly as rendered, which is
 * the same opt-in fallback every other Phase 2 writer uses.
 */
function stampCostChips(row, costs) {
    const costCell = row.querySelector(':scope > .ui-cell-cost');
    if (!costCell) return;

    // Index-aligned rather than selector-driven: one cost entry produces exactly
    // one child, but an entry may be an element the caller supplied — a span the
    // frame loop already owns — and those must be left entirely alone. Walking
    // `.ui-chip` matches instead would shift the indices past every such entry
    // and stamp the wrong number onto the wrong chip.
    costs.forEach((cost, index) => {
        const chip = costCell.children[index];
        if (!chip || !chip.classList.contains('ui-chip')) return;
        if (!cost || !Number.isFinite(cost.amount)) return;

        const prefix = resolveText(cost.prefix);
        const label = resolveText(cost.label);
        const suffix = `${resolveText(cost.suffix)}${label ? ' ' + label : ''}`;

        chip.classList.add('notation');
        stamp(chip, [prefix, suffix], [cost.amount], FORMAT_DEFAULT);
    });
}
