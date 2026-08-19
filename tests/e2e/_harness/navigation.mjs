/**
 * Shared side-menu navigation helpers.
 *
 * Every tab in Cosmic Forge is a side menu of option rows plus one content pane,
 * and the wiring between them is entirely class-based: a row is a `<p>` carrying
 * a `tabN.optionM` class token, and `initializeTabEventListeners` binds one
 * handler per token that sets the current pane and redraws the content.
 *
 * Two specs need to walk that structure — `ui-navigation` to prove every row
 * opens its own pane, and `notation` to reach every screen that renders a
 * number — so the walk lives here rather than being written twice.
 *
 * Three details drive the shape of these helpers:
 *
 *   1. Rows are hidden behind unlock state with the `invisible` class. Revealing
 *      a row is a *test* affordance, not an assertion about unlocks; specs that
 *      care about unlock order assert `hidden` from `listOptionRows` instead.
 *   2. The class token, not the row id, is the identity that matters. Several
 *      rows have no id at all (the three settings panes are `tab9.option1` …
 *      `tab9.option3` with no id), and `querySelector('[class~="tab9.option1"]')`
 *      is the only selector that will not also match `option10` upwards.
 *   3. Clicks are dispatched rather than driven through the mouse, because rows
 *      sit under overlays on several tabs. That bypasses CSS gating, which is
 *      fine here: none of these rows are gated on affordability.
 */

/** Every tab index in the shell, in the order the markup declares them. */
export const ALL_TABS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * List the option rows on a tab.
 *
 * Returns one entry per side-menu row that carries a `tabN.optionM` label,
 * with the class token that identifies it, its id if it has one, its visible
 * label, and whether its row is currently hidden by the unlock system.
 */
export async function listOptionRows(page, tab) {
  return page.evaluate((t) => {
    const group = document.getElementById(`tab${t}ContainerGroup`);
    if (!group) return [];

    const rows = [];
    group.querySelectorAll('.row-side-menu').forEach((row) => {
      const label = Array.from(row.querySelectorAll('p'))
        .find((p) => Array.from(p.classList).some((c) => c.startsWith(`tab${t}.`)));
      if (!label) return;
      rows.push({
        tab: t,
        token: Array.from(label.classList).find((c) => c.startsWith(`tab${t}.`)),
        id: label.id || null,
        // The label carries its attention indicator inside the same element, so
        // strip anything that is not part of the name.
        label: (label.textContent || '').replace(/[⚠️🌀ℹ️]/gu, '').trim(),
        hidden: row.classList.contains('invisible')
      });
    });
    return rows;
  }, tab);
}

/** Open a tab and list its option rows in one step. */
export async function openTabAndListRows(game, tab) {
  await game.openTab(tab);
  return listOptionRows(game.page, tab);
}

/**
 * Open one option row by its class token, revealing its row first.
 *
 * Returns false when the tab does not carry that token at all, so a caller can
 * tell "the row is not there" apart from "the row did nothing".
 */
export async function openOptionRow(game, tab, token) {
  const clicked = await game.page.evaluate(({ t, tk }) => {
    const el = document.querySelector(`#tab${t}ContainerGroup p[class~="${tk}"]`);
    if (!el) return false;
    el.classList.remove('invisible');
    el.closest('.row-side-menu')?.classList.remove('invisible');
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, { t: tab, tk: token });
  if (clicked) await game.page.waitForTimeout(600);
  return clicked;
}

/**
 * What a tab's content column currently holds.
 *
 * `header` and `description` are the two elements `updateContent` writes, and
 * `children` counts what the `drawTabNContent` builder appended — a pane that
 * routed correctly but drew nothing shows as a header with no children.
 */
export async function paneRender(page, tab) {
  return page.evaluate((t) => {
    const content = document.getElementById(`optionContentTab${t}`);
    return {
      header: (document.getElementById(`headerContentTab${t}`)?.textContent || '').trim(),
      description: (document.getElementById(`descriptionContentTab${t}`)?.textContent || '').trim(),
      children: content ? content.children.length : 0,
      text: (content?.textContent || '').replace(/\s+/g, ' ').trim()
    };
  }, tab);
}

/**
 * Walk every option row on every listed tab, opening each one.
 *
 * `onPane` is awaited after each row is opened and is given
 * `{ tab, token, label, pane, render }`, so a caller can sample whatever it
 * cares about while the pane is on screen.
 */
export async function walkAllPanes(game, { tabs = ALL_TABS, onPane } = {}) {
  const visited = [];
  for (const tab of tabs) {
    const rows = await openTabAndListRows(game, tab);
    for (const row of rows) {
      const opened = await openOptionRow(game, tab, row.token);
      if (!opened) continue;
      const pane = await game.withMods((m) => m.cg.getCurrentOptionPane());
      const render = await paneRender(game.page, tab);
      const entry = { ...row, pane, render };
      visited.push(entry);
      if (onPane) await onPane(entry);
    }
  }
  return visited;
}
