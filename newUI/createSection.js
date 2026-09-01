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
 * `{ text }` (explicitly not localised — numbers, proper nouns), `{ html }`
 * (markup the caller built), or null.
 *
 * An element is NOT resolvable to a string and returns `''` — callers that can
 * accept one use `fillTextField` instead, which keeps the element rather than
 * flattening it.
 */
export function resolveText(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement) return '';
    if (typeof value.key === 'string') return localiser(value.key);
    if (typeof value.text === 'string') return value.text;
    if (typeof value.html === 'string') return value.html;
    return String(value);
}

/**
 * Write a text field into a cell, keeping an element if that is what was given.
 *
 * Phase 3 needs this because several real rows do not hold plain text: they hold
 * a span with an id that the frame loop writes into every tick — the ascendency
 * perk's price and buy-status are exactly that. Flattening those to a string
 * would silently cut the row off from the loop that keeps it current. So a text
 * field may also be an element (appended untouched) or `{ html }` (markup the
 * caller built and is responsible for).
 *
 * Returns true if anything was written, so a caller can leave an empty cell
 * genuinely empty rather than holding a blank span.
 */
export function fillTextField(container, value, { tag = 'span', classNames = null } = {}) {
    if (value === null || value === undefined || value === '') return false;

    if (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement) {
        container.appendChild(value);
        return true;
    }

    if (typeof value === 'object' && typeof value.html === 'string') {
        const node = el(tag, classNames);
        node.innerHTML = value.html;
        container.appendChild(node);
        return true;
    }

    const text = resolveText(value);
    if (!text) return false;

    container.appendChild(el(tag, classNames, text));
    return true;
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

/**
 * Write a detail body, keeping an element or markup as given.
 *
 * Shared by both disclosure modes so the collapsible and always-visible forms
 * cannot drift apart in what they accept.
 */
function writeDetailBody(node, text) {
    if (typeof HTMLElement !== 'undefined' && text instanceof HTMLElement) {
        node.appendChild(text);
    } else if (text && typeof text === 'object' && typeof text.html === 'string') {
        node.innerHTML = text.html;
    } else {
        node.textContent = resolveText(text);
    }
}

/** Copy a plain object onto an element's dataset, skipping empty values. */
function applyDataset(node, data) {
    if (!data) return;
    Object.entries(data).forEach(([k, v]) => {
        if (v === null || v === undefined || v === '') return;
        node.dataset[k] = String(v);
    });
}

/* ---------------------------------------------------------------- tracks -- */

/**
 * The pane's tracks, in the order they are drawn.
 *
 * `detail` is last because it is the sentence that explains the control beside
 * it, and a sentence reads after the thing it describes.
 */
export const UI_TRACKS = ['title', 'stat', 'cost', 'action', 'detail'];

/** A cell counts as filled if it holds an element or any non-space text. */
function cellHasContent(cell) {
    if (!cell) return false;
    if (cell.childElementCount > 0) return true;
    return cell.textContent.trim() !== '';
}

/**
 * Size a pane from the tracks its rows actually fill, and place the cells.
 *
 * WHY THIS EXISTS
 * ---------------
 * A grid track costs its share of the pane whether or not anything is in it. The
 * four tracks are `1.5fr / 0.55fr / 1fr / auto`, so a settings screen — which
 * fills `title` and `action` and nothing else — spent 40% of its width on two
 * permanently empty columns and threw every dropdown and toggle to the far right
 * of its own label. The same arithmetic ran the other way on the Cosmic Rip
 * Situation pane: its live status text sits in `stat`, the narrowest track, and
 * wrapped onto three lines while the empty `cost` track beside it held 250px of
 * nothing. Both are the same bug, and neither is fixable at the call site
 * without reintroducing exactly the per-row width overrides (F3) this refactor
 * exists to delete.
 *
 * So the pane measures itself. It walks its own rows, keeps the tracks that have
 * content, writes a template listing only those, and writes `--ui-col-*` so the
 * cells are placed by name rather than by DOM order — auto-placement would slide
 * every cell one column left for each track dropped. `data-ui-tracks` names the
 * surviving tracks so the stylesheet can hide the empty cells; an unplaced cell
 * would otherwise claim a grid row of its own.
 *
 * A track the caller sized explicitly through `tracks` is always kept. Asking for
 * a width is a statement that the column is wanted, even if the row that fills it
 * is revealed later.
 *
 * It is idempotent and cheap (a handful of `querySelectorAll`s over one pane), so
 * every path that can change a pane's content calls it: `createSection`,
 * `createPane` and `appendUiRow`.
 */
export function syncPaneTracks(root) {
    if (!root || typeof root.querySelectorAll !== 'function') return;

    const forced = root.__uiForcedTracks || {};

    const occupied = UI_TRACKS.filter((track) => {
        // The title track is never dropped: every row has a name, and a pane
        // whose first column moved would not line up with anything else.
        if (track === 'title') return true;
        if (forced[track]) return true;
        const cells = root.querySelectorAll(`.ui-cell-${track}, .ui-colhead-${track}`);
        for (let i = 0; i < cells.length; i++) {
            if (cellHasContent(cells[i])) return true;
        }
        return false;
    });

    // Only ONE element on a screen may carry the track list, because the
    // stylesheet hides an unused track's cells with a descendant selector and CSS
    // has no way to say "the nearest one wins". A section built empty and filled
    // later through `appendUiRow` would otherwise leave its own grid stamped with
    // the occupancy it had when it held no rows — `title` and nothing else — and
    // that stale stamp, being closer to the cells, would hide every control on
    // the pane. So the pane clears its sections on the way past.
    if (root.classList?.contains('ui-pane')) {
        root.querySelectorAll('.ui-grid[data-ui-tracks]').forEach((grid) => {
            delete grid.dataset.uiTracks;
            grid.style.removeProperty('grid-template-columns');
            UI_TRACKS.forEach((track) => grid.style.removeProperty(`--ui-col-${track}`));
        });
    }

    root.dataset.uiTracks = occupied.join(' ');
    root.style.gridTemplateColumns = occupied
        .map((track) => `[${track}] var(--ui-track-${track})`)
        .join(' ');

    UI_TRACKS.forEach((track) => {
        const index = occupied.indexOf(track);
        if (index === -1) root.style.removeProperty(`--ui-col-${track}`);
        else root.style.setProperty(`--ui-col-${track}`, String(index + 1));
    });
}

/**
 * The element that owns the column template for a section.
 *
 * Inside a pane that is the pane, because the section is a `subgrid` of it and
 * its own track declaration is inert. Standalone it is the section's `.ui-grid`.
 */
function trackOwner(node) {
    if (!node) return null;
    const pane = typeof node.closest === 'function' ? node.closest('.ui-pane') : null;
    if (pane) return pane;
    if (node.classList?.contains('ui-pane')) return node;
    return node.querySelector?.(':scope > .ui-grid') || null;
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
        // An element passes straight through. A row whose price is written by
        // the frame loop into a span it owns by id — the ascendency perk price
        // is one — has to keep that exact element, and rebuilding it as a chip
        // would break the only channel that keeps the figure current. One entry
        // still produces exactly one node, so the cost list and the cell's
        // children stay index-aligned either way.
        if (typeof HTMLElement !== 'undefined' && cost instanceof HTMLElement) return cost;

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
 *   detailInline boolean — draw the prose as a CELL in the `detail` track rather
 *                than as a band spanning the row. This is what a settings row
 *                wants: the sentence explains the control beside it, so it reads
 *                on the same line, and the row costs one line instead of two
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
        variant = 'columns',
        title = null,
        subtitle = null,
        stat = null,
        cost = [],
        actions = [],
        detail = null,
        detailLabel = null,
        detailOpen = false,
        detailCollapsible = true,
        detailInline = false,
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

    /* A full-bleed row is one cell across every track.

       This is not a column row with the columns switched off: several panes hold
       a single object that wants the whole width — the achievements grid, the
       statistics table, the help prose, the events list. Those are not rows with
       too many fields, and pushing them through the four tracks would truncate
       them. A title is still drawn if one is given, so a full-bleed block can be
       introduced by name. */
    if (variant === 'full') {
        row.classList.add('ui-row-full');

        if (title) {
            const heading = el('div', ['ui-cell', 'ui-cell-full', 'ui-cell-full-title']);
            fillTextField(heading, title, { classNames: 'ui-title' });
            fillTextField(heading, subtitle, { classNames: 'ui-subtitle' });
            row.appendChild(heading);
        }

        const body = el('div', ['ui-cell', 'ui-cell-full']);
        (Array.isArray(actions) ? actions : [actions])
            .filter(Boolean)
            .forEach((node) => body.appendChild(node));
        row.appendChild(body);

        if (detail) {
            // A full-bleed row already spans every track, so `detailInline` has
            // no column to move the prose into and is ignored rather than
            // silently drawing a fifth track nothing else on the pane uses.
            row.appendChild(createDisclosure(detail, {
                open: detailOpen,
                label: detailLabel,
                collapsible: detailCollapsible,
                id: id ? `${id}Detail` : null
            }));
        }

        return row;
    }

    /* title + subtitle */
    const titleCell = el('div', ['ui-cell', 'ui-cell-title']);
    fillTextField(titleCell, title, { classNames: 'ui-title' });
    fillTextField(titleCell, subtitle, { classNames: 'ui-subtitle' });
    row.appendChild(titleCell);

    /* stat */
    const statCell = el('div', ['ui-cell', 'ui-cell-stat']);
    if (typeof HTMLElement !== 'undefined' && stat instanceof HTMLElement) {
        // A whole element as the stat: the row's own live field, kept intact.
        statCell.appendChild(stat);
    } else if (stat && stat.value !== null && stat.value !== undefined) {
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

    /* detail — either a cell in the last track, or a band under the row.

       Inline is right where the sentence explains the control beside it, because
       that is the row's whole content and it fits on the line. The band is right
       where the prose is long or is an aside — a perk's flavour text — and would
       squeeze the columns that carry the row's actual data. */
    if (detail && detailInline) {
        const detailCell = el('div', ['ui-cell', 'ui-cell-detail']);
        writeDetailBody(detailCell, detail);
        if (id) detailCell.id = `${id}Detail`;
        row.appendChild(detailCell);
    } else if (detail) {
        row.appendChild(createDisclosure(detail, {
            open: detailOpen,
            label: detailLabel,
            collapsible: detailCollapsible,
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
 * `label` still defaults to null — a caret with no text — and the caller still
 * passes its own. Phase 3 added `uiRowDetailsLabel` to all six languages, but
 * this module resolves a `{ key }` through an installed localiser, and
 * `validateLocalization.cjs` only scans the root-level sources; a key that
 * appeared nowhere but here would be reported as unreachable and would fail
 * `build:win`. So the key is named at the call site, in a root file, and arrives
 * here as `{ key: 'uiRowDetailsLabel' }`.
 *
 * `text` is a text field, so a description that carries markup can be passed as
 * `{ html }` and an element that something else writes into can be passed
 * directly — the legacy description band held both.
 */
export function createDisclosure(text, { open = false, id = null, label = null, collapsible = true } = {}) {
    const wrap = el('div', ['ui-detail', collapsible ? null : 'ui-detail-static']);

    // `collapsible: false` draws the prose with no caret and no toggle, always
    // visible. A settings pane wants this: the sentence under a control explains
    // what the control does, so hiding it buys vertical space at the cost of the
    // row's whole purpose. Collapsing is right where the prose is an aside — a
    // perk's flavour text — and wrong where it is the instruction.
    if (!collapsible) {
        const staticBody = el('div', 'ui-detail-body');
        writeDetailBody(staticBody, text);
        if (id) staticBody.id = id;
        wrap.appendChild(staticBody);
        return wrap;
    }

    const button = el('button', 'ui-disclosure');
    button.type = 'button';
    button.setAttribute('aria-expanded', String(open));

    const caret = el('span', 'ui-caret', '›');
    button.appendChild(caret);

    const labelText = resolveText(label);
    if (labelText) button.appendChild(document.createTextNode(` ${labelText}`));

    const body = el('div', 'ui-detail-body');
    writeDetailBody(body, text);

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

    // A track the caller sized explicitly is never dropped by the occupancy
    // pass, so the request survives even when the row that fills it is revealed
    // later. Recorded on both elements because which one owns the template
    // depends on whether this section ends up inside a pane.
    if (tracks) {
        grid.__uiForcedTracks = { ...tracks };
        section.__uiForcedTracks = { ...tracks };
    }

    syncPaneTracks(grid);
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
        pane.__uiForcedTracks = { ...tracks };
        if (tracks.title) pane.style.setProperty('--ui-track-title', tracks.title);
        if (tracks.stat) pane.style.setProperty('--ui-track-stat', tracks.stat);
        if (tracks.cost) pane.style.setProperty('--ui-track-cost', tracks.cost);
        if (tracks.action) pane.style.setProperty('--ui-track-action', tracks.action);
        if (tracks.detail) pane.style.setProperty('--ui-track-detail', tracks.detail);
    }

    (Array.isArray(sections) ? sections : [sections])
        .filter(Boolean)
        .forEach((section) => {
            pane.appendChild(section instanceof HTMLElement ? section : createSection(section));
        });

    // The pane owns the template — its sections are `subgrid` of it — so its
    // occupancy is measured over every row on the screen at once. That is also
    // what keeps two sections sharing one set of column edges.
    syncPaneTracks(pane);
    return pane;
}

/**
 * Append a row to an existing section built by `createSection`.
 *
 * The pane is re-measured afterwards, because a screen that builds its rows one
 * at a time — several of tab 9's do, since they read a control back out of the
 * document by id between two builds — would otherwise be sized from whichever
 * rows happened to exist when the pane was created.
 */
export function appendUiRow(section, row) {
    const grid = section?.querySelector(':scope > .ui-grid');
    if (!grid) return null;
    const node = row instanceof HTMLElement ? row : createUiRow(row);
    grid.appendChild(node);
    syncPaneTracks(trackOwner(section) || grid);
    return node;
}
