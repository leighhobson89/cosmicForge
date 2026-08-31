/**
 * newUI/createSection.js — Phase 1 of the large UI refactor.
 * See docs/largeUIRefactor.md §3.1–3.2 and the Phase 1 section.
 *
 * The section/row factories that will replace `createOptionRow`.
 *
 * PURELY ADDITIVE. Nothing in the shipped game imports this module yet; it is
 * exercised only by newUI/demo.html. `createOptionRow` is untouched and remains
 * the only row builder in use until Phase 3, when it is rewritten as a thin
 * adapter onto these functions so all 277 existing call sites keep working.
 *
 * WHY THIS SHAPE
 * --------------
 * `createOptionRow` takes a flat bag of 21 loosely-named options
 * (`objectSectionArgument1` means a different thing per `rowCategory`), decides
 * tech-tree and Cosmic Rip visibility itself, and hardcodes three pane names.
 * These factories take a described row instead, and deliberately do three
 * things differently:
 *
 *   1. **Cost is data, not a sentence.** `cost: [{ amount: 250, label: 'Hydrogen' }]`
 *      renders one chip per component and stores the raw number on the chip's
 *      dataset. The legacy row rendered a single string that the frame loop then
 *      re-parsed by word position every frame (game.js:12683). Phase 2 rewrites
 *      the formatters to read `dataset.uiAmount` and write the display, which is
 *      only possible because the number is kept here in the first place.
 *
 *   2. **The section owns the columns.** Rows place cells into the section's
 *      named grid tracks and declare no widths at all, so the 44 inline
 *      `noDescriptionContainer` percentage overrides have nowhere to live.
 *
 *   3. **No game rules.** There is no tech-unlock, telemetry or pane-name logic
 *      in here. Visibility is applied by the caller, or by the reveal registry
 *      Phase 3 introduces. This file knows about layout and nothing else.
 *
 * LOCALISATION
 * ------------
 * Every text field accepts either an already-localised string (what the current
 * call sites produce, e.g. `localize('buttonSell', getLanguage())`) or a
 * `{ key: 'someLocKey' }` descriptor resolved through the localiser installed
 * with `setUiLocaliser`. The descriptor form is preferred going forward because
 * it lets a row be re-localised in place on a language change instead of being
 * torn down and rebuilt. Until a localiser is installed the key is rendered
 * verbatim, so a missing wire-up is visible rather than silent.
 */

/* -------------------------------------------------------------- localise -- */

/** Installed by the app; identity-ish by default so this module stays standalone. */
let localiser = (key) => key;

/**
 * Install the real localiser.
 * Phase 3 calls this once from ui.js with
 * `(key) => localize(key, getLanguage())`.
 */
export function setUiLocaliser(fn) {
    if (typeof fn === 'function') localiser = fn;
}

/**
 * Resolve a text field.
 *
 * Accepts: a string (already localised), `{ key }` (localised here),
 * `{ text }` (explicitly not localised — numbers, proper nouns), or null.
 */
export function resolveText(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value.key === 'string') return localiser(value.key);
    if (typeof value.text === 'string') return value.text;
    return String(value);
}

/* ----------------------------------------------------------------- utils -- */

function el(tag, classNames, text) {
    const node = document.createElement(tag);
    if (classNames) {
        (Array.isArray(classNames) ? classNames : [classNames])
            .filter(Boolean)
            .forEach((c) => node.classList.add(c));
    }
    if (text !== undefined && text !== null && text !== '') node.textContent = text;
    return node;
}

/** Copy a plain object onto an element's dataset, skipping empty values. */
function applyDataset(node, data) {
    if (!data) return;
    Object.entries(data).forEach(([k, v]) => {
        if (v === null || v === undefined || v === '') return;
        node.dataset[k] = String(v);
    });
}

/* ------------------------------------------------------------------ cost -- */

/**
 * Build the chips for one row's cost.
 *
 * `costs` is an array of `{ amount, label?, prefix?, suffix?, currency?, resource? }`.
 *
 * `prefix` / `suffix` exist because a currency symbol's side is locale-dependent
 * — the game already puts `€` after the number and `$` before it. Keeping it as
 * a separate field means the symbol is never something a formatter has to find
 * by scanning the rendered text, which is precisely how the legacy formatter
 * got it wrong.
 *
 * The raw `amount` is written to `dataset.uiAmount` and is the value the
 * formatter is expected to read. The rendered text is a convenience for the
 * pre-Phase-2 world; once Phase 2 lands, the formatter owns the text and the
 * dataset owns the truth.
 */
export function createCostChips(costs = []) {
    const list = Array.isArray(costs) ? costs : [costs];

    return list.filter(Boolean).map((cost) => {
        const chip = el('span', ['ui-chip', cost.currency ? 'ui-chip-currency' : null]);

        applyDataset(chip, {
            uiAmount: cost.amount,
            uiResource: cost.resource,
            uiCurrency: cost.currency ? 'true' : ''
        });

        const label = resolveText(cost.label);
        const amount = cost.amount === null || cost.amount === undefined ? '' : String(cost.amount);
        const prefix = resolveText(cost.prefix);
        const suffix = resolveText(cost.suffix);
        chip.textContent = `${prefix}${amount}${suffix}${label ? ' ' + label : ''}`.trim();

        return chip;
    });
}

/* ------------------------------------------------------------------- row -- */

/**
 * Build one row.
 *
 * Returns a `.ui-row` element whose CSS is `display: contents`, so its cells
 * become direct children of the owning section's grid while the row element
 * itself survives to carry the id, dataset and reveal state. Append it to a
 * section's grid — `createSection` does that for you.
 *
 * Options
 *   id           string, becomes the element id
 *   title        text field — the row's label
 *   subtitle     text field — e.g. the upgrade's own name. The legacy row could
 *                show only one of these; here both fit.
 *   stat         { label?, value } — the "Quantity: n" the legacy row buried
 *                inside the controls
 *   cost         array of cost descriptors (see createCostChips)
 *   actions      array of elements — buttons, dropdowns, toggles. Passed through
 *                untouched, so existing createButton/createDropdown output works
 *   detail       text field — the prose the legacy row rendered as a permanent
 *                full-width band; collapsed behind a disclosure here
 *   detailLabel  text field — the disclosure's own label. Pass an already
 *                localised string; see createDisclosure for why there is no default
 *   detailOpen   boolean, start expanded (default false)
 *   affordable   boolean — false applies `red-disabled-text` to the cost cell.
 *                The gate itself stays exactly as it is: the frame loop adds and
 *                removes that class, and its `pointer-events: none` is the whole
 *                mechanism. This only sets the initial state
 *   hidden       boolean — applies `invisible`, the game's existing reveal class
 *   dataset      plain object copied onto the row element
 */
export function createUiRow(options = {}) {
    const {
        id,
        title = null,
        subtitle = null,
        stat = null,
        cost = [],
        actions = [],
        detail = null,
        detailLabel = null,
        detailOpen = false,
        affordable = true,
        hidden = false,
        dataset = null
    } = options;

    const row = el('div', 'ui-row');
    if (id) row.id = id;
    if (hidden) row.classList.add('invisible');
    applyDataset(row, dataset);

    // A grid item rather than a border, so the rule spans the column gaps too.
    row.appendChild(el('div', 'ui-row-rule'));

    /* title + subtitle */
    const titleCell = el('div', ['ui-cell', 'ui-cell-title']);
    titleCell.appendChild(el('span', 'ui-title', resolveText(title)));
    if (subtitle) titleCell.appendChild(el('span', 'ui-subtitle', resolveText(subtitle)));
    row.appendChild(titleCell);

    /* stat */
    const statCell = el('div', ['ui-cell', 'ui-cell-stat']);
    if (stat && stat.value !== null && stat.value !== undefined) {
        const label = resolveText(stat.label);
        if (label) statCell.appendChild(document.createTextNode(`${label} `));
        const value = el('span', 'ui-stat-value', String(stat.value));
        applyDataset(value, { uiValue: stat.value });
        statCell.appendChild(value);
    }
    row.appendChild(statCell);

    /* cost */
    const costCell = el('div', ['ui-cell', 'ui-cell-cost']);
    if (!affordable) costCell.classList.add('red-disabled-text');
    createCostChips(cost).forEach((chip) => costCell.appendChild(chip));
    row.appendChild(costCell);

    /* actions — appended as given, so existing factories' output drops straight in */
    const actionCell = el('div', ['ui-cell', 'ui-cell-action']);
    (Array.isArray(actions) ? actions : [actions])
        .filter(Boolean)
        .forEach((node) => actionCell.appendChild(node));
    row.appendChild(actionCell);

    /* detail, collapsed */
    const detailText = resolveText(detail);
    if (detailText) {
        row.appendChild(createDisclosure(detailText, {
            open: detailOpen,
            label: detailLabel,
            id: id ? `${id}Detail` : null
        }));
    }

    return row;
}

/**
 * The collapsed prose row.
 *
 * Returned as a single `.ui-detail` grid item spanning every track. Kept
 * separate so a caller can drop one into a section on its own.
 *
 * `label` defaults to null — a caret with no text — deliberately. A hardcoded
 * English "Details" would violate the rule that every user-facing string comes
 * from localization.json in all six languages, and adding the key now would put
 * an unreachable entry in the catalogue that `validateLocalization.cjs` rightly
 * rejects (nothing imports this module until Phase 3). So Phase 3 does both
 * halves together: adds `uiRowDetailsLabel` to all six languages and passes it
 * here. Until then callers pass their own already-localised label, as the demo
 * does.
 */
export function createDisclosure(text, { open = false, id = null, label = null } = {}) {
    const wrap = el('div', 'ui-detail');

    const button = el('button', 'ui-disclosure');
    button.type = 'button';
    button.setAttribute('aria-expanded', String(open));

    const caret = el('span', 'ui-caret', '›');
    button.appendChild(caret);

    const labelText = resolveText(label);
    if (labelText) button.appendChild(document.createTextNode(` ${labelText}`));

    const body = el('div', 'ui-detail-body', text);
    if (id) {
        body.id = id;
        button.setAttribute('aria-controls', id);
    }
    body.hidden = !open;

    button.addEventListener('click', () => {
        const isOpen = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!isOpen));
        body.hidden = isOpen;
    });

    wrap.appendChild(button);
    wrap.appendChild(body);
    return wrap;
}

/* --------------------------------------------------------------- section -- */

/**
 * Build a section: a heading, one set of column headings, and a grid of rows.
 *
 * This is the piece that makes alignment structural. Every row appended here
 * shares this element's grid, so the action column cannot drift between rows —
 * which is the measurable Phase 3 exit criterion (all action cells share one
 * `getBoundingClientRect().left`).
 *
 * Options
 *   id            string, element id
 *   heading       text field — the section label. Omit for an unheaded section
 *   columns       { title, stat, cost, action } text fields for the column
 *                 headings, written once per section instead of being repeated
 *                 as a prefix inside every row. Omit to draw no heading row
 *   rows          array of row elements (from createUiRow) or row option objects
 *   bare          boolean — drop the border, background and padding
 *   tracks        { title, stat, cost, action } CSS track sizes, overriding the
 *                 defaults for THIS section only. A pane with unusually long
 *                 labels widens one track here, for all its rows at once —
 *                 rather than each row inventing its own percentage, which is
 *                 the failure the legacy overrides represent
 *   dataset       plain object copied onto the section element
 */
export function createSection(options = {}) {
    const {
        id,
        heading = null,
        columns = null,
        rows = [],
        bare = false,
        tracks = null,
        dataset = null
    } = options;

    const section = el('div', ['ui-section', bare ? 'ui-section-bare' : null]);
    if (id) section.id = id;
    applyDataset(section, dataset);

    const headingText = resolveText(heading);
    if (headingText) section.appendChild(el('div', 'ui-section-head', headingText));

    const grid = el('div', 'ui-grid');

    // Per-section track overrides are set as custom properties on the grid, so
    // they cascade to that grid only and never leak to another section.
    if (tracks) {
        if (tracks.title) grid.style.setProperty('--ui-track-title', tracks.title);
        if (tracks.stat) grid.style.setProperty('--ui-track-stat', tracks.stat);
        if (tracks.cost) grid.style.setProperty('--ui-track-cost', tracks.cost);
        if (tracks.action) grid.style.setProperty('--ui-track-action', tracks.action);
    }

    if (columns) {
        grid.appendChild(el('div', ['ui-colhead', 'ui-colhead-title'], resolveText(columns.title)));
        grid.appendChild(el('div', ['ui-colhead', 'ui-colhead-stat'], resolveText(columns.stat)));
        grid.appendChild(el('div', ['ui-colhead', 'ui-colhead-cost'], resolveText(columns.cost)));
        grid.appendChild(el('div', ['ui-colhead', 'ui-colhead-action'], resolveText(columns.action)));
    }

    (Array.isArray(rows) ? rows : [rows])
        .filter(Boolean)
        .forEach((row) => grid.appendChild(row instanceof HTMLElement ? row : createUiRow(row)));

    section.appendChild(grid);
    return section;
}

/**
 * Wrap sections in a pane that owns the column tracks.
 *
 * Use this whenever a screen shows MORE THAN ONE section. A section on its own
 * is internally aligned, but two sections are two independent grids, and the
 * action track is content-sized — so a section with wider buttons resolves all
 * its tracks differently and its action column lands somewhere else. That is the
 * same defect the legacy row system has, just one level up, and it is a real one:
 * the first build of the Phase 1 demo showed two sections 35px out of line.
 *
 * A pane hoists the track definition to the top and each section re-uses it via
 * CSS `subgrid`, so every row on the screen shares one column definition.
 *
 * Sections inside a pane are drawn bare — a subgrid item's own horizontal
 * padding would inset its tracks and bring the drift straight back. Card
 * treatment is Phase 6's problem and will be drawn behind the grid.
 *
 * Options
 *   id        string, element id
 *   sections  array of section elements (from createSection) or section option
 *             objects
 *   tracks    { title, stat, cost, action } CSS track sizes for the whole pane
 *   dataset   plain object copied onto the pane element
 */
export function createPane(options = {}) {
    const { id, sections = [], tracks = null, dataset = null } = options;

    const pane = el('div', 'ui-pane');
    if (id) pane.id = id;
    applyDataset(pane, dataset);

    if (tracks) {
        if (tracks.title) pane.style.setProperty('--ui-track-title', tracks.title);
        if (tracks.stat) pane.style.setProperty('--ui-track-stat', tracks.stat);
        if (tracks.cost) pane.style.setProperty('--ui-track-cost', tracks.cost);
        if (tracks.action) pane.style.setProperty('--ui-track-action', tracks.action);
    }

    (Array.isArray(sections) ? sections : [sections])
        .filter(Boolean)
        .forEach((section) => {
            pane.appendChild(section instanceof HTMLElement ? section : createSection(section));
        });

    return pane;
}

/** Append a row to an existing section built by `createSection`. */
export function appendUiRow(section, row) {
    const grid = section?.querySelector(':scope > .ui-grid');
    if (!grid) return null;
    const node = row instanceof HTMLElement ? row : createUiRow(row);
    grid.appendChild(node);
    return node;
}
