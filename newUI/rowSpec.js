/**
 * newUI/rowSpec.js — Phase 3 of the large UI refactor.
 * See docs/largeUIRefactor.md §3.1 and the Phase 3 section (F1).
 *
 * THE ROW SPEC
 * ============
 * `createOptionRow` takes a flat bag of 21 loosely-named options, and three of
 * them — `objectSectionArgument1`, `objectSectionArgument2`, `quantityArgument`
 * — mean a different thing depending on `rowCategory`: a resource key, a tech
 * key, a fuse-to target, or a storage type. There is no schema, so a call site
 * cannot be validated, an IDE cannot help, and the only way to find out what a
 * given argument does is to read the factory.
 *
 * This file is that missing schema. A row is described once, as data, in terms
 * of what the player sees:
 *
 *     {
 *         id:       'hydrogenAutoBuyer1Row',
 *         title:    { key: 'tab1HydrogenAutoBuyer1RowLabel' },
 *         subtitle: { key: 'upgradeNameHydrogenAB1' },
 *         stat:     { label: { key: 'textQuantity' }, value: 3 },
 *         cost:     [{ resource: 'hydrogen', amount: 250 }],
 *         actions:  [buyButton, maxButton],
 *         detail:   'The long prose the pane used to print above every row.',
 *         gate:     { kind: 'affordability', category: 'resource' },
 *         reveal:   [{ kind: 'tech', requires: 'hydrogenFusion' }]
 *     }
 *
 * WHY A SPEC RATHER THAN JUST A BETTER FACTORY
 * --------------------------------------------
 * Because there are two renderers, and there will be for several phases. The
 * legacy renderer draws the `.option-row` mini-table the game has today; the
 * grid renderer draws the Phase 1 section grid. Both are driven from *this*
 * object, which is what makes `createOptionRow` a genuine adapter — it maps the
 * 21-option bag onto a spec and hands it to the legacy renderer — rather than a
 * second implementation that has to be kept in step by hand.
 *
 * It is also what makes the information-parity check meaningful. Parity is
 * "every field of the spec reached the DOM", and that can only be asked of a
 * row that has a spec.
 *
 * NUMBERS STAY NUMBERS
 * --------------------
 * `cost[].amount` is a `Number`, never a formatted string. This is the Phase 2
 * rule restated at the row level: the renderer prints it, the raw value is
 * stamped alongside (newUI/notation.js), and nothing ever parses the printed
 * text back out again.
 */

/* ------------------------------------------------------------- text field -- */

/**
 * A text field is one of:
 *   'already localised string'   — what every current call site produces
 *   { key: 'someLocKey' }        — resolved by the installed localiser
 *   { text: 'not translatable' } — numbers, proper nouns, catalogue names
 *   { html: '<span>…</span>' }   — markup the caller has built itself
 *   null                         — absent
 *
 * The `html` form is not encouraged but it is honest: several existing rows
 * build a span carrying an id that the frame loop then writes into, and
 * pretending otherwise would only push that markup somewhere less visible.
 */
export function isTextField(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' || typeof value === 'number') return true;
    if (typeof value !== 'object') return false;
    return typeof value.key === 'string'
        || typeof value.text === 'string'
        || typeof value.html === 'string';
}

/* ------------------------------------------------------------------ costs -- */

/**
 * Normalise one cost component.
 *
 * `amount` is coerced to a number and dropped if it is not finite, because a
 * cost chip with `NaN` in it is worse than a chip with no figure — the figure is
 * the whole point of the cell, and a silent `NaN` would be formatted and
 * shipped.
 */
function normaliseCost(entry) {
    if (!entry) return null;

    // An element passes through untouched. A row whose price is written by the
    // frame loop into a span it owns by id has to keep that exact element; the
    // renderer appends it as the cell's one child for this entry, so the cost
    // list and the cell's children stay index-aligned.
    if (typeof HTMLElement !== 'undefined' && entry instanceof HTMLElement) return entry;

    if (typeof entry === 'number') return { amount: entry, label: null, prefix: null, suffix: null, resource: null, currency: false };

    const amount = entry.amount === null || entry.amount === undefined
        ? null
        : Number(entry.amount);

    return {
        amount: Number.isFinite(amount) ? amount : null,
        label: entry.label ?? null,
        prefix: entry.prefix ?? null,
        suffix: entry.suffix ?? null,
        resource: entry.resource ?? null,
        currency: Boolean(entry.currency)
    };
}

/* ------------------------------------------------------------------- spec -- */

/** Every field a row spec may carry. The parity tool walks this list. */
export const ROW_SPEC_FIELDS = [
    'id', 'section', 'variant', 'title', 'subtitle', 'stat', 'cost', 'actions',
    'detail', 'detailLabel', 'detailOpen', 'detailCollapsible', 'detailInline',
    'gate', 'reveal',
    'dataset', 'classNames', 'hidden', 'legacy'
];

/**
 * Row variants.
 *
 * `columns` is the four-track row the mockup shows and is the default.
 *
 * `full` is one cell spanning every track, and it exists because a real
 * constraint says so: several panes carry a block of content that is nothing
 * like a row — the achievements grid, the statistics table, the help prose, the
 * events list. Those are not rows with too many fields; they are single objects
 * that want the whole width. Squeezing them into four tracks would truncate
 * them, and truncating information to fit a layout is the one thing this
 * refactor is not allowed to do. So the grid grows a variant instead.
 *
 * The variant is a property of the row, not of the section, so a pane can mix
 * them: a full-bleed table sitting under three ordinary rows still shares the
 * pane's tracks and still lines up with them.
 */
export const ROW_VARIANTS = ['columns', 'full'];

/**
 * Normalise a partial spec into the full shape, filling defaults.
 *
 * Unknown fields are kept rather than stripped, and reported through
 * `spec.unknownFields`. Stripping them would hide a typo at the call site — the
 * exact failure mode the 21-option bag has today, where a misspelled option is
 * simply ignored — while throwing would take a pane down over a cosmetic
 * mistake. Naming them lets the parity tool surface them without either.
 */
export function createRowSpec(partial = {}) {
    const input = partial || {};

    const unknownFields = Object.keys(input).filter((k) => !ROW_SPEC_FIELDS.includes(k));

    const costList = (Array.isArray(input.cost) ? input.cost : [input.cost])
        .map(normaliseCost)
        .filter(Boolean);

    const revealList = (Array.isArray(input.reveal) ? input.reveal : [input.reveal])
        .filter((r) => r && typeof r.kind === 'string');

    return {
        id: input.id ?? null,
        section: input.section ?? null,
        variant: ROW_VARIANTS.includes(input.variant) ? input.variant : 'columns',

        title: input.title ?? null,
        subtitle: input.subtitle ?? null,
        stat: input.stat ?? null,
        cost: costList,
        actions: (Array.isArray(input.actions) ? input.actions : [input.actions]).filter(Boolean),

        detail: input.detail ?? null,
        detailLabel: input.detailLabel ?? null,
        detailOpen: Boolean(input.detailOpen),

        // Whether the detail hides behind a disclosure. It usually should — that
        // is where the vertical space comes from. But on a settings pane the
        // explanatory sentence beneath a control is the point of the row, not an
        // aside, and hiding it would trade a usability regression for space the
        // pane does not need. Such a row asks for `detailCollapsible: false` and
        // gets the prose spanning every track, always visible, with no caret.
        detailCollapsible: input.detailCollapsible !== false,

        // Where the prose goes when it is not behind a disclosure. `detailInline`
        // draws it as a cell in the row's last track, which is what a settings
        // row wants — the sentence explains the control beside it, so it reads on
        // the same line and the row costs one line instead of two. The band under
        // the row is for prose too long to sit in a column.
        detailInline: Boolean(input.detailInline),

        // `gate` is declarative but changes nothing about the mechanism: the
        // frame loop still adds and removes `red-disabled-text`, whose
        // `pointer-events: none` IS the affordability gate in this game, by
        // design. All this records is which element wears the class and which of
        // the frame loop's two sweeps should find it.
        gate: input.gate ?? null,

        reveal: revealList,

        dataset: input.dataset ?? null,
        classNames: (Array.isArray(input.classNames) ? input.classNames : [input.classNames]).filter(Boolean),
        hidden: Boolean(input.hidden),

        // The untouched legacy option bag, carried through so the legacy
        // renderer can read the handful of things that are pure `.option-row`
        // plumbing and have no meaning in the grid — the inline width overrides,
        // `specialInputContainerClasses`, `hideMainDescriptionRow`. It is
        // quarantined in one field on purpose, so Phase 7 can delete this field
        // and find every legacy-only behaviour at once.
        legacy: input.legacy ?? null,

        unknownFields
    };
}

/**
 * A shallow description of what a spec claims to render, for the parity tool.
 *
 * Deliberately does not touch the DOM — it is the "expected" half of the
 * comparison, and the tool reads the "actual" half off the rendered row.
 */
export function describeRowSpec(spec) {
    return {
        id: spec.id,
        hasTitle: Boolean(spec.title),
        hasSubtitle: Boolean(spec.subtitle),
        hasStat: Boolean(spec.stat && spec.stat.value !== null && spec.stat.value !== undefined),
        costCount: spec.cost.length,
        actionCount: spec.actions.length,
        hasDetail: Boolean(spec.detail),
        detailInline: spec.detailInline,
        revealKinds: spec.reveal.map((r) => r.kind),
        gateKind: spec.gate ? spec.gate.kind : null,
        unknownFields: spec.unknownFields
    };
}
