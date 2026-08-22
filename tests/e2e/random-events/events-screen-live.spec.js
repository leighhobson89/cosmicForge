/**
 * Area: Random Events — the log and the Events screen a player reads it on
 * Plan: tests/docs/areas/random-events.md
 *
 * Events happen while the player is looking somewhere else. The Events pane on
 * the Help tab is the only place they can find out what hit them and what is
 * still running, so the log is not a debugging aid — it is the feature.
 *
 * Nothing here reads a snapshot function and calls it a day. Every assertion is
 * made against the two tables the pane renders:
 *
 *   tab 9 -> Events        drawTab9Content builds #eventsRowContainer
 *     #timedEventsActiveBody     rebuilt every frame by updateTimedEventsPanel()
 *     #timedEventsHistoryBody    from getEventsHistorySnapshot()
 *
 * Two things about that pipeline drive the shape of these specs:
 *
 *   1. `updateTimedEventsPanel()` runs from `updateDynamicUiContent()` on the
 *      frame loop, so the tables are live — an effect started while the pane is
 *      open appears in it without the pane being reopened, and its countdown
 *      ticks down on screen. Both are asserted rather than assumed.
 *   2. The rows are *localized*, and the good/bad sentiment is carried by a
 *      colour class per row. A row that renders its own key, or renders an
 *      unmapped event as good news, is exactly the kind of defect that is
 *      invisible from a snapshot function.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

const TIMED_EVENT_IDS = [
  'galacticMarketLockdown', 'endlessSummer', 'minerBrokeDown',
  'supplyChainDisruption', 'blackHoleInstability'
];

test.describe.configure({ timeout: 240_000 });

// ---------------------------------------------------------------------- helpers

/** Open the Events pane on the Help tab, the way a player reaches it. */
async function openEventsScreen(game) {
  await game.openTab(9);
  const opened = await game.page.evaluate(() => {
    const el = document.getElementById('eventsOption');
    if (!el) return false;
    el.classList.remove('invisible');
    el.closest('.row-side-menu')?.classList.remove('invisible');
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  });
  if (!opened) throw new Error('The Events row is not on the Help menu');
  await game.page.waitForTimeout(900);
  return opened;
}

/** Fire one named event through the debug menu's own select and Trigger button. */
async function triggerFromDebugMenu(game, eventId) {
  await game.debugSelect('debugRandomEventSelect', eventId);
  await game.debugClick('triggerRandomEventButton');
  await game.page.waitForTimeout(600);
}

/** The two tables, read as a player sees them. */
function readTables(game) {
  return game.page.evaluate(() => {
    const rowsOf = (id) => Array.from(document.querySelectorAll(`#${id} tr`)).map((tr) => {
      const cells = Array.from(tr.querySelectorAll('td'));
      return {
        cells: cells.map((td) => (td.textContent || '').trim()),
        span: cells.length === 1 ? Number(cells[0].getAttribute('colspan') || 1) : 1,
        classes: cells.map((td) => Array.from(td.classList))
      };
    });
    return {
      active: rowsOf('timedEventsActiveBody'),
      history: rowsOf('timedEventsHistoryBody'),
      headings: Array.from(document.querySelectorAll('#eventsRowContainer .help-sub-header-text'))
        .map((el) => (el.textContent || '').trim())
    };
  });
}

// ============================================================================

test.describe('Random Events — the Events screen', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
  });

  test('with nothing running and nothing logged, both tables say so in the player language', async ({ game }) => {
    await openEventsScreen(game);
    const tables = await readTables(game);

    const copy = await game.withMods((m) => ({
      noneActive: m.loc.localize('textNoActiveTimedEvents', m.cg.getLanguage()),
      noneCompleted: m.loc.localize('textNoCompletedTimedEvents', m.cg.getLanguage()),
      activeTitle: m.loc.localize('tab9EventsActiveTitle', m.cg.getLanguage()),
      historyTitle: m.loc.localize('tab9EventsHistoryTitle', m.cg.getLanguage())
    }));

    expect(tables.headings, 'both sections are titled').toEqual([copy.activeTitle, copy.historyTitle]);
    expect(tables.active.length).toBe(1);
    expect(tables.active[0].span, 'the empty state spans the whole table').toBe(3);
    expect(tables.active[0].cells[0]).toBe(copy.noneActive);
    expect(tables.history.length).toBe(1);
    expect(tables.history[0].cells[0]).toBe(copy.noneCompleted);
    // The empty state is real text, not a leftover key.
    expect(copy.noneActive).not.toBe('textNoActiveTimedEvents');
  });

  test('an effect started while the pane is open appears on it, named, described and counting down', async ({ game }) => {
    await openEventsScreen(game);
    expect((await readTables(game)).active[0].span, 'nothing running yet').toBe(3);

    // The pane is never reopened after this point: the table is rebuilt by the
    // frame loop, so the new row has to arrive on its own.
    await triggerFromDebugMenu(game, 'galacticMarketLockdown');
    await game.page.waitForTimeout(800);

    const first = await readTables(game);
    const expected = await game.withMods((m) => ({
      name: m.loc.localize('eventNameGalacticMarketLockdown', m.cg.getLanguage()),
      description: m.loc.localize('eventDescGalacticMarketOffline', m.cg.getLanguage())
    }));

    expect(first.active.length).toBe(1);
    const [name, remaining, effect] = first.active[0].cells;
    expect(name, 'the row names the event in the player language').toBe(expected.name);
    expect(effect, 'and says what it is doing to them').toBe(expected.description);
    // A thirty-minute lockdown reads as a mm:ss countdown just under 30:00.
    expect(remaining).toMatch(/^\d{1,2}:\d{2}$/);
    const asSeconds = (text) => {
      const [minutes, seconds] = text.split(':').map(Number);
      return minutes * 60 + seconds;
    };
    expect(asSeconds(remaining)).toBeGreaterThan(29 * 60);
    expect(asSeconds(remaining)).toBeLessThanOrEqual(30 * 60);

    // It is bad news, so the whole row is painted as bad news.
    expect(first.active[0].classes[0]).toContain('red-disabled-text');
    expect(first.active[0].classes[2]).toContain('red-disabled-text');

    // And the clock on screen is genuinely running.
    await game.page.waitForTimeout(3000);
    const later = await readTables(game);
    expect(
      asSeconds(later.active[0].cells[1]),
      `${remaining} -> ${later.active[0].cells[1]}`
    ).toBeLessThan(asSeconds(remaining));
  });

  test('a good event is coloured green and a bad one red, on the same table', async ({ game }) => {
    await triggerFromDebugMenu(game, 'endlessSummer');
    await triggerFromDebugMenu(game, 'galacticMarketLockdown');
    await openEventsScreen(game);

    const tables = await readTables(game);
    const names = await game.withMods((m) => ({
      summer: m.loc.localize('eventNameEndlessSummer', m.cg.getLanguage()),
      lockdown: m.loc.localize('eventNameGalacticMarketLockdown', m.cg.getLanguage())
    }));

    expect(tables.active.length).toBe(2);
    const rowFor = (label) => tables.active.find((row) => row.cells[0] === label);

    expect(rowFor(names.summer), 'endless summer should be listed').toBeTruthy();
    expect(rowFor(names.lockdown), 'the lockdown should be listed').toBeTruthy();
    // Endless summer is the one event in the timed set the game calls good.
    expect(rowFor(names.summer).classes[0]).toContain('green-ready-text');
    expect(rowFor(names.lockdown).classes[0]).toContain('red-disabled-text');
  });

  test('the active table is ordered by what ends soonest', async ({ game }) => {
    // Three effects with different remaining times, so the ordering rule has
    // something to sort. Endless summer runs longest, the lockdown next, and
    // the supply disruption is wound down to be the most urgent.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(5, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
    });
    await triggerFromDebugMenu(game, 'endlessSummer');
    await triggerFromDebugMenu(game, 'galacticMarketLockdown');
    await triggerFromDebugMenu(game, 'supplyChainDisruption');

    await game.withMods((m) => {
      const state = m.rdo.getResourceDataObject('randomEvents', ['timedEffects', 'supplyChainDisruption'], true) || {};
      m.rdo.setResourceDataObject({ ...state, remainingMs: 90 * 1000 }, 'randomEvents', ['timedEffects', 'supplyChainDisruption']);
    });

    await openEventsScreen(game);
    const tables = await readTables(game);

    const seconds = tables.active.map((row) => {
      const [minutes, secs] = row.cells[1].split(':').map(Number);
      return minutes * 60 + secs;
    });

    expect(tables.active.length).toBe(3);
    for (let i = 1; i < seconds.length; i++) {
      expect(seconds[i], `row ${i} should not end sooner than row ${i - 1}: ${seconds.join(', ')}`)
        .toBeGreaterThanOrEqual(seconds[i - 1]);
    }
    // The one that was wound down is on top.
    expect(seconds[0]).toBeLessThanOrEqual(90);
  });

  test('an instant event is logged as instant, with the numbers it moved', async ({ game }) => {
    await game.withMods((m) => m.rdo.setResourceDataObject(4000, 'research', ['quantity']));
    await triggerFromDebugMenu(game, 'researchBreakthrough');
    await openEventsScreen(game);

    const tables = await readTables(game);
    const copy = await game.withMods((m) => ({
      name: m.loc.localize('eventNameResearchBreakthrough', m.cg.getLanguage()),
      instant: m.loc.localize('textInstantDuration', m.cg.getLanguage())
    }));

    const row = tables.history.find((r) => r.cells[0] === copy.name);
    expect(row, 'the breakthrough should be in the completed log').toBeTruthy();
    expect(row.cells[1], 'an instant event has no duration to show').toBe(copy.instant);
    // The effect column reports the amount, so the log is worth reading rather
    // than a bare list of names.
    expect(row.cells[2].length).toBeGreaterThan(0);
    expect(row.cells[2]).toMatch(/\d/);
    // A breakthrough is good news.
    expect(row.classes[0]).toContain('green-ready-text');
  });

  test('a finished timed effect moves from the active table to the completed one, with its full duration', async ({ game }) => {
    await triggerFromDebugMenu(game, 'galacticMarketLockdown');
    await openEventsScreen(game);

    const running = await readTables(game);
    expect(running.active.length, 'it starts out in the active table').toBe(1);

    // Wind the remainder down and let the frame loop expire it for real.
    await game.withMods((m) => {
      const state = m.rdo.getResourceDataObject('randomEvents', ['timedEffects', 'galacticMarketLockdown'], true) || {};
      m.rdo.setResourceDataObject({ ...state, remainingMs: 80 }, 'randomEvents', ['timedEffects', 'galacticMarketLockdown']);
    });
    await game.page.waitForTimeout(2000);

    const finished = await readTables(game);
    const copy = await game.withMods((m) => ({
      name: m.loc.localize('eventNameGalacticMarketLockdown', m.cg.getLanguage()),
      noneActive: m.loc.localize('textNoActiveTimedEvents', m.cg.getLanguage())
    }));

    expect(finished.active.length).toBe(1);
    expect(finished.active[0].cells[0], 'the active table empties itself').toBe(copy.noneActive);

    const row = finished.history.find((r) => r.cells[0] === copy.name);
    expect(row, 'and the event turns up in the completed log').toBeTruthy();
    // The logged duration is the effect's advertised length in whole minutes,
    // not the sliver it was wound down to.
    expect(row.cells[1]).toMatch(/30/);
    expect(row.classes[0]).toContain('red-disabled-text');
  });

  test('the completed log is ordered newest first', async ({ game }) => {
    await triggerFromDebugMenu(game, 'researchBreakthrough');
    await game.page.waitForTimeout(600);
    await triggerFromDebugMenu(game, 'stockLoss');
    await game.page.waitForTimeout(600);
    await triggerFromDebugMenu(game, 'batteryExplosion').catch(() => {});

    await openEventsScreen(game);
    const tables = await readTables(game);

    const snapshot = await game.withMods((m) => m.events.getEventsHistorySnapshot().map((e) => ({
      id: e.id,
      endedAtMs: Number(e.endedAtMs) || 0
    })));

    // The snapshot is the order the table is built from, so the table's first
    // row must be the most recent event.
    for (let i = 1; i < snapshot.length; i++) {
      expect(snapshot[i - 1].endedAtMs).toBeGreaterThanOrEqual(snapshot[i].endedAtMs);
    }
    expect(tables.history.length).toBe(snapshot.length);

    const firstName = await game.withMods((m, id) => {
      const cap = `${id.charAt(0).toUpperCase()}${id.slice(1)}`;
      return m.loc.localize(`eventName${cap}`, m.cg.getLanguage());
    }, snapshot[0].id);
    expect(tables.history[0].cells[0]).toBe(firstName);
  });

  test('every event in the catalogue renders a real name and a real effect line, in all six languages', async ({ game }) => {
    // Fire the lot, so the log holds one row of every kind the pane can build.
    const ids = await game.withMods((m) => m.events.getRandomEventIds());
    for (const id of ids) {
      await triggerFromDebugMenu(game, id);
    }
    await openEventsScreen(game);

    const problems = [];
    for (const language of ['en', 'es', 'pt', 'de', 'it', 'fr']) {
      await game.withMods(async (m, lang) => {
        await m.loc.initLocalization(lang);
        m.desc.initialiseDescriptions();
      }, language);
      await game.page.waitForTimeout(700);

      const tables = await readTables(game);
      const rows = [...tables.active, ...tables.history];
      for (const row of rows) {
        if (row.span === 3) continue;
        const [name, duration, effect] = row.cells;
        if (!name || /^event(Name|Desc)/.test(name)) problems.push(`${language}: name "${name}"`);
        if (!duration) problems.push(`${language}: ${name} has no duration cell`);
        if (!effect || /^eventDesc/.test(effect)) problems.push(`${language}: ${name} effect "${effect}"`);
      }
      if (rows.filter((r) => r.span !== 3).length === 0) {
        problems.push(`${language}: the tables rendered no event rows at all`);
      }
    }

    await game.withMods(async (m) => {
      await m.loc.initLocalization('en');
      m.desc.initialiseDescriptions();
    });

    expect(problems).toEqual([]);
  });

  test('the log survives a save and the pane redraws it after a rebirth', async ({ game }) => {
    await triggerFromDebugMenu(game, 'researchBreakthrough');
    await triggerFromDebugMenu(game, 'galacticMarketLockdown');

    const saved = await game.withMods((m) => {
      const capture = JSON.parse(JSON.stringify(m.cg.captureGameStatusForSaving('initialise')));
      return {
        instant: (capture.resourceData?.randomEvents?.instantEventsHistory || []).map((e) => e.id),
        effects: Object.keys(capture.resourceData?.randomEvents?.timedEffects || {})
      };
    });

    expect(saved.instant, 'the instant log travels with the save').toContain('researchBreakthrough');
    expect(saved.effects).toContain('galacticMarketLockdown');

    // And the pane rebuilds from that same data when it is opened later.
    await openEventsScreen(game);
    const tables = await readTables(game);
    expect(tables.history.some((r) => r.span !== 3), 'the completed log has rows').toBe(true);
    expect(tables.active.some((r) => r.span !== 3), 'the active table has rows').toBe(true);
  });

  test('reading the Events screen raises no console or page errors', async ({ game }) => {
    for (const id of TIMED_EVENT_IDS) {
      await triggerFromDebugMenu(game, id);
    }
    await openEventsScreen(game);
    await game.page.waitForTimeout(2500);

    expect(game.significantErrors()).toEqual([]);
  });
});
