/**
 * Area: UI Navigation
 * Plan: tests/docs/areas/ui-navigation.md — "Attention indicators highlight the
 * right tabs and clear when addressed".
 *
 * The ⚠️ marker tells the player a side-menu option has something new in it, and
 * a matching marker on the tab tells them which tab to look in. Opening the
 * option is what makes it no longer new, so the marker has to clear on that
 * click — for every option, on every tab.
 *
 * Each `drawTab*Content` used to clear it by rebuilding the row's element id
 * from the current pane name (`'near space scanner array'` →
 * `#nearSpaceScannerArrayOption`). That derivation had drifted out of step with
 * `index.html` for 25 of the 59 pane names, including all three Cosmic Rip
 * options, whose real ids are prefixed `cosmicRip…` — so those markers never
 * cleared at all and the tab kept its badge forever.
 *
 * This spec drives the real click path over every reachable option row rather
 * than checking a list of ids, so a future row whose id does not match its pane
 * name is caught rather than silently joining the same backlog.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

const TABS = [1, 2, 3, 4, 5, 6, 7, 8];

/** Reveal every side-menu row on a tab and return one clickable label per row. */
async function revealOptionRows(page, tab) {
  return page.evaluate((tabIndex) => {
    const group = document.getElementById(`tab${tabIndex}ContainerGroup`);
    if (!group) return [];

    group.classList.remove('invisible');
    group.querySelectorAll('.row-side-menu, .collapsible').forEach((el) => el.classList.remove('invisible'));

    const rows = [];
    group.querySelectorAll('.row-side-menu').forEach((row) => {
      row.classList.remove('invisible');
      // The label paragraph carries the `tabN.optionM` class the click handler
      // is bound to; the notation paragraphs beside it share the same handler.
      const label = Array.from(row.querySelectorAll('p'))
        .find((p) => Array.from(p.classList).some((c) => c.startsWith(`tab${tabIndex}.`)));
      if (!label) return;
      label.classList.remove('invisible');
      if (!label.id) return;
      rows.push(label.id);
    });
    return rows;
  }, tab);
}

async function markRow(game, rowId, icon = '⚠️') {
  return game.withMods((m, { rowId, icon }) => {
    const el = document.getElementById(rowId);
    if (!el) return false;
    m.ui.appendAttentionIndicator(el, icon);
    return Boolean(el.querySelector('.attention-indicator'));
  }, { rowId, icon });
}

async function clickRow(page, rowId) {
  await page.evaluate((id) => {
    document.getElementById(id)?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, rowId);
  await page.waitForTimeout(180);
}

async function rowHasIndicator(page, rowId) {
  return page.evaluate((id) => {
    const el = document.getElementById(id);
    return Boolean(el?.closest('.row-side-menu')?.querySelector('.attention-indicator'));
  }, rowId);
}

test.describe('UI Navigation — attention indicators', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
  });

  for (const tab of TABS) {
    test(`every option row on tab ${tab} clears its marker when opened`, async ({ game, page }) => {
      await game.openTab(tab);
      const rows = await revealOptionRows(page, tab);

      // A tab with no side-menu rows would make the assertions below vacuous.
      expect(rows.length, `tab ${tab} should expose at least one option row`).toBeGreaterThan(0);

      const stuck = [];
      for (const rowId of rows) {
        if (!(await markRow(game, rowId))) continue;
        await clickRow(page, rowId);
        if (await rowHasIndicator(page, rowId)) stuck.push(rowId);
      }

      expect(stuck, `rows that kept their marker after being opened on tab ${tab}`).toEqual([]);
    });
  }

  test('the Cosmic Rip options clear, which is where the id derivation broke', async ({ game, page }) => {
    await game.openTab(8);
    await revealOptionRows(page, 8);

    const cosmicRipRows = [
      'cosmicRipSituationOption',
      'cosmicRipNearSpaceScannerArrayOption',
      'cosmicRipCosmicRipOption'
    ];

    for (const rowId of cosmicRipRows) {
      expect(await markRow(game, rowId), `${rowId} should exist and take a marker`).toBe(true);
      await clickRow(page, rowId);
      expect(await rowHasIndicator(page, rowId), `${rowId} should clear on open`).toBe(false);
    }
  });

  test('the tab badge clears once every option on the tab has been opened', async ({ game, page }) => {
    await game.openTab(8);
    const rows = await revealOptionRows(page, 8);

    await game.withMods((m, ids) => {
      m.ui.appendAttentionIndicator(document.getElementById('tab8'));
      ids.forEach((id) => m.ui.appendAttentionIndicator(document.getElementById(id)));
    }, rows);

    expect(await page.evaluate(() => Boolean(document.getElementById('tab8')?.querySelector('.attention-indicator'))))
      .toBe(true);

    for (const rowId of rows) await clickRow(page, rowId);

    expect(
      await page.evaluate(() => Boolean(document.getElementById('tab8')?.querySelector('.attention-indicator'))),
      'tab 8 should drop its badge once no option row still carries a marker'
    ).toBe(false);
  });

  test('opening a row clears ⚠️ but leaves 🌀 alone', async ({ game, page }) => {
    await game.openTab(7);
    await revealOptionRows(page, 7);

    // 🌀 reports the black hole's charge state rather than novelty, and
    // blackHoleUIChecks re-derives it every frame. Clearing it on a click would
    // fight that, so the sweep is asked directly rather than through a click —
    // the frame loop would otherwise take its own view of the row a tick later.
    const result = await game.withMods((m) => {
      const row = document.getElementById('blackholeOption');
      m.ui.appendAttentionIndicator(row, '🌀');
      m.ui.clearOptionRowAttentionIndicator(row);
      const afterSwirl = row.querySelector('.attention-indicator')?.textContent ?? null;

      m.ui.appendAttentionIndicator(row, '⚠️');
      m.ui.clearOptionRowAttentionIndicator(row);
      const afterWarning = row.querySelector('.attention-indicator')?.textContent ?? null;

      return { afterSwirl, afterWarning };
    });

    expect(result.afterSwirl).toContain('🌀');
    expect(result.afterWarning).toBeNull();
  });

  test('the marker is out of the layout flow, so a long label keeps its full width', async ({ game, page }) => {
    await game.openTab(1);
    await revealOptionRows(page, 1);
    await markRow(game, 'hydrogenOption');

    const geometry = await page.evaluate(() => {
      const icon = document.getElementById('hydrogenOption')?.querySelector('.attention-indicator');
      return icon ? { position: getComputedStyle(icon).position } : null;
    });

    // An inline marker counts towards the label's width, which pushed translated
    // tab names onto a second line and detached the marker from its label.
    expect(geometry?.position).toBe('absolute');

    const tabWraps = await page.evaluate(() =>
      Array.from(document.querySelectorAll('#tabsContainer .tab'))
        .filter((t) => t.querySelector('.attention-indicator'))
        .filter((t) => t.scrollHeight - t.clientHeight > 2)
        .map((t) => t.id));
    expect(tabWraps, 'a marked tab must not grow a second line for its marker').toEqual([]);
  });
});
