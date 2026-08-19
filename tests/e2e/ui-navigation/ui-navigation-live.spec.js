/**
 * Area: UI Navigation — the whole shell walked, tab by tab and pane by pane
 * Plan: tests/docs/areas/ui-navigation.md
 *
 * `attention-indicators.spec.js` covers one behaviour of the side menu — the ⚠️
 * marker clearing when a row is opened. This file covers the navigation itself:
 * nine tabs, fifty-nine option rows, and the content column each one is supposed
 * to draw.
 *
 * ## What "the pane opened" is taken to mean
 *
 * Asserting that `getCurrentOptionPane()` changed proves only that a click
 * handler ran. The claim worth making is stronger, and it is the one a player
 * would make: **the content column now shows the thing you clicked on**. So
 * every row in the sweep has to satisfy four things at once —
 *
 *   1. the pane name changed to something, and no two rows on a tab land on the
 *      same pane;
 *   2. `#headerContentTabN` *names the row* — every heading in the game either
 *      is the row's label or begins with it, so a row wired to the wrong pane is
 *      caught by name rather than by id;
 *   3. `#optionContentTabN` actually has children, which separates "routed
 *      correctly" from "routed correctly and drew nothing";
 *   4. the row is the one marked `row-side-menu-selected`.
 *
 * ## Why the run is played out first
 *
 * Rows are hidden until the run unlocks them, and a hidden row draws nothing.
 * Three of the most interlinked chapters — Megastructures, the Black Hole and
 * the Cosmic Rip — are the last to unlock and the least walked, so the sweep is
 * run against a fully progressed save built from the game's own debug scenario,
 * and the two endgame chapters get their own specs that reach them the way the
 * game does: the megastructure flag through the variable debugger, and the
 * Cosmic Rip's panes by paying galactic points to restore the scanner array with
 * its own button.
 *
 * The chapter stops short of pressing **Close The Rip**, which starts a
 * cinematic that never hands the game back.
 */
import { test, expect } from '../_harness/game-fixture.mjs';
import { ALL_TABS, listOptionRows, openOptionRow, paneRender, walkAllPanes } from '../_harness/navigation.mjs';

/** A full progression plus fifty-nine pane draws is a long test. */
test.describe.configure({ timeout: 300_000 });

/** Tabs that start locked on a fresh run, reading `???` until their tech lands. */
const LOCKED_AT_BOOT = [2, 4, 5, 6, 7, 8];

/** Tabs that are playable from the first frame. */
const OPEN_AT_BOOT = [1, 3, 9];

/**
 * The rows a fully progressed run still keeps off the menu, and why.
 *
 * Being on this list is not a defect: each of these is gated on a condition the
 * debug scenario does not reach, so the game is right not to offer it. The list
 * is written out rather than counted so that a row *newly* falling off the menu
 * is a failure rather than a number nobody notices.
 */
const EXPECTED_HELD_BACK = [
  'tab3.option4 Philosophy',                  // chosen at rebirth, not mid-run
  'tab5.option2 Star Data',                   // needs a star selected on the Star Map
  'tab5.option5 Colonise',                    // needs a destination star to colonise
  'tab7.option1 Rebirth',                     // needs a rebirth to be possible
  'tab7.option3 Ascendency Perks',            // needs ascendency points to spend
  'tab7.option4 Megastructures',              // needs a megastructure run — its own spec below
  'tab7.option5 Black Hole',                  // needs the black hole researched
  'tab8.option2 Near Space Scanner Array',    // needs the array restored — its own spec below
  'tab8.option3 Cosmic Rip',                  // needs the array restored — its own spec below
  'tab9.option15 Exit Game'                   // Electron shells only
];

/** Strip attention markers and whitespace so a label can be compared to a heading. */
function plainText(value) {
  return String(value ?? '').replace(/[⚠️🌀ℹ️]/gu, '').replace(/\s+/g, ' ').trim();
}

/** How the tab strip currently reads, in the order the shell renders it. */
async function tabStrip(page) {
  return page.evaluate(() =>
    Array.from(document.getElementById('tabsContainer').children).map((tab, position) => ({
      position,
      id: tab.id,
      index: Number(tab.id.replace('tab', '')),
      name: tab.getAttribute('data-name'),
      label: (tab.textContent || '').replace(/[⚠️🌀ℹ️]/gu, '').trim(),
      locked: tab.classList.contains('tab-not-yet'),
      selected: tab.classList.contains('selected')
    })));
}

/** Which tab container group is on screen. */
async function visibleContainerGroups(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('[id$="ContainerGroup"]'))
      .filter((el) => el.offsetParent !== null || el.getClientRects().length > 0)
      .map((el) => el.id));
}

/** The debug scenario chain, plus every tech, so nothing is hidden by unlock state. */
async function playRunToLateGame(game) {
  await game.prepareRunForStarshipLaunch();
  await game.debugClick('grantAllTechsButton');
  await game.page.waitForTimeout(600);
  await game.debugClick('unlockAllTabsButton').catch(() => {});
  await game.debugClick('give1BButton');
  await game.debugClick('give1MAllResourcesAndCompounds');

  // The one tech neither debug button grants. `unlockAllTabsButton` unlocks the
  // other five deliberately and leaves `cosmicRip` out, because the game grants
  // it from the Miaplacidus win cinematic — a fourteen-second cutscene belonging
  // to another chapter. Without it the frame loop re-locks tab 8 within a frame,
  // relabels it `???` and the Cosmic Rip is unreachable. Staging it is the same
  // accumulated-progress precondition the cosmic-rip specs use; everything
  // downstream of it here is navigated for real.
  await game.withMods((m) => m.cg.setTechUnlockedArray('cosmicRip'));
  await game.page.waitForTimeout(1000);
}

// -------------------------------------------------------------------- the tabs

test.describe('UI Navigation — the tab strip', () => {
  test('a fresh run shows only the tabs it has unlocked, and the rest read ???', async ({ game, page }) => {
    await game.boot();
    const tabs = await tabStrip(page);

    expect(tabs.length, 'nine tabs ship').toBe(9);

    for (const index of OPEN_AT_BOOT) {
      const tab = tabs.find((t) => t.index === index);
      expect(tab.locked, `tab ${index} is playable from the first frame`).toBe(false);
      expect(tab.label, `tab ${index} should carry its name`).not.toBe('???');
    }
    for (const index of LOCKED_AT_BOOT) {
      const tab = tabs.find((t) => t.index === index);
      expect(tab.locked, `tab ${index} is behind a tech`).toBe(true);
      // A locked tab hides what it is, not just whether you can use it.
      expect(tab.label, `tab ${index} should not name itself before it unlocks`).toBe('???');
    }

    // Resources is where a run starts.
    expect(tabs.find((t) => t.selected)?.index).toBe(1);
  });

  test('playing the run out unlocks every tab, each with its own name', async ({ game, page }) => {
    await game.boot();
    await playRunToLateGame(game);
    await page.waitForTimeout(800);

    const tabs = await tabStrip(page);
    const stillLocked = tabs.filter((tab) => tab.locked || tab.label === '???');

    expect(stillLocked.map((t) => t.id), 'a fully unlocked run leaves no tab hidden').toEqual([]);
    // Every tab names itself, and no two share a name.
    const names = tabs.map((t) => t.label);
    expect(new Set(names).size, `duplicate tab names: ${names.join(', ')}`).toBe(names.length);
  });

  test('clicking a tab brings its container group forward and puts the others away', async ({ game, page }) => {
    await game.boot();
    await playRunToLateGame(game);

    for (const index of ALL_TABS) {
      await game.openTab(index);
      const groups = await visibleContainerGroups(page);
      expect(groups, `opening tab ${index} should show exactly its own container group`)
        .toEqual([`tab${index}ContainerGroup`]);

      const current = await game.withMods((m) => m.cg.getCurrentTab());
      expect(current[0], `getCurrentTab index after opening tab ${index}`).toBe(index);
      // The name is the canonical English one, not the rendered label, because
      // ~19 frame-loop gates key off it.
      expect(typeof current[1]).toBe('string');
      expect(current[1]).not.toBe('???');
    }
  });

  test('the number keys open the tab in that position, whatever order the tabs are in', async ({ game, page }) => {
    await game.boot();
    await playRunToLateGame(game);
    await page.waitForTimeout(800);

    const strip = await tabStrip(page);
    // The order is the game's own: `checkOrderOfTabs` sorts unlocked tabs by a
    // priority table, so position 2 is not necessarily tab 2.
    for (const tab of strip) {
      await page.click('body', { position: { x: 5, y: 5 } }).catch(() => {});
      await page.keyboard.press(String(tab.position + 1));
      await page.waitForTimeout(350);

      const current = await game.withMods((m) => m.cg.getCurrentTab());
      expect(current[0], `pressing "${tab.position + 1}" should open the tab in position ${tab.position + 1}`)
        .toBe(tab.index);
    }
  });

  test('the tab order follows the game\'s own priority table once chapters unlock', async ({ game, page }) => {
    await game.boot();
    await playRunToLateGame(game);
    await page.waitForTimeout(1200);

    const order = (await tabStrip(page)).map((tab) => tab.index);

    // `checkOrderOfTabs` sorts by { 1:1, 4:2, 3:3, 2:4, 6:5, 5:6, 7:7, 8:8, 9:9 },
    // so a fully unlocked run reads Resources, Compounds, Research, Energy,
    // Space Mining, Interstellar, Galactic, Cosmic Rip, Settings.
    expect(order).toEqual([1, 4, 3, 2, 6, 5, 7, 8, 9]);
  });
});

// ------------------------------------------------------------------- the panes

test.describe('UI Navigation — every pane in the game', () => {
  test('every option row opens a pane that names it and draws content', async ({ game, page }) => {
    await game.boot();
    await playRunToLateGame(game);

    const problems = [];
    const panesByTab = {};

    const visited = await walkAllPanes(game, {
      tabs: ALL_TABS,
      onPane: async ({ tab, token, label, pane, hidden, render }) => {
        const where = `tab ${tab} / ${token} "${label}"`;

        if (!pane) problems.push(`${where}: opened no pane at all`);
        (panesByTab[tab] ||= []).push({ token, label, pane, hidden });

        // The heading either is the row's name or starts with it — the Star Map
        // and the four rockets append their own controls to the heading row.
        const header = plainText(render.header);
        if (!header) {
          problems.push(`${where}: the content column has no heading`);
        } else if (!header.toLowerCase().startsWith(plainText(label).toLowerCase())) {
          problems.push(`${where}: heading "${header}" does not name the row`);
        }

        // Content is only *promised* for a row the run has actually unlocked.
        // The walk forces hidden rows open so their routing is still checked,
        // but some of them legitimately draw nothing when their precondition is
        // absent — Colonise returns early with no destination star, which is a
        // deliberate guard rather than an empty pane. Demanding content from a
        // row the game is not offering would be asserting a promise it never
        // made; the count check below stops that exemption swallowing the sweep.
        if (!hidden && render.children === 0) problems.push(`${where}: pane "${pane}" drew nothing`);

        const selected = await page.evaluate(({ t, tk }) => {
          const el = document.querySelector(`#tab${t}ContainerGroup p[class~="${tk}"]`);
          return Boolean(el?.closest('.row-side-menu')?.classList.contains('row-side-menu-selected'));
        }, { t: tab, tk: token });
        if (!selected) problems.push(`${where}: the row was not marked as the selected one`);
      }
    });

    // Every tab has to contribute, or a whole tab silently dropping out of the
    // walk would look like a pass.
    for (const tab of ALL_TABS) {
      expect(Object.keys(panesByTab).map(Number), `tab ${tab} contributed no option rows`).toContain(tab);
    }
    expect(visited.length, 'the shell ships around sixty option rows').toBeGreaterThanOrEqual(55);

    // Name the rows a fully progressed run still holds back, rather than just
    // counting them: that keeps the "hidden rows need not draw" allowance above
    // to a known, reviewable list, and a new row joining it fails here.
    const heldBack = visited.filter((row) => row.hidden).map((row) => `${row.token} ${row.label}`).sort();
    expect(heldBack, 'rows a fully progressed run still holds back').toEqual(EXPECTED_HELD_BACK);

    // Two rows on the same tab landing on the same pane means one of them is
    // wired to the wrong handler.
    for (const [tab, entries] of Object.entries(panesByTab)) {
      const panes = entries.map((entry) => entry.pane);
      const duplicates = panes.filter((pane, index) => panes.indexOf(pane) !== index);
      if (duplicates.length) {
        problems.push(`tab ${tab}: rows share panes ${[...new Set(duplicates)].join(', ')}`);
      }
    }

    expect(problems).toEqual([]);
  });

  test('walking every pane raises no console or page error', async ({ game }) => {
    await game.boot();
    await playRunToLateGame(game);
    await walkAllPanes(game, { tabs: ALL_TABS });

    expect(game.significantErrors()).toEqual([]);
  });

  test('coming back to a tab reopens the pane you left it on', async ({ game, page }) => {
    await game.boot();
    await playRunToLateGame(game);

    // Leave a distinctive pane open on three different tabs...
    const chosen = [
      { tab: 1, token: 'tab1.option8' },
      { tab: 3, token: 'tab3.option3' },
      { tab: 9, token: 'tab9.option3' }
    ];
    for (const { tab, token } of chosen) {
      expect(await openOptionRow(game, tab, token), `${token} should exist`).toBe(true);
    }

    // ...then go round the tabs again and check each one came back as it was.
    for (const { tab, token } of chosen) {
      await game.openTab(tab);
      await page.waitForTimeout(600);

      const render = await paneRender(page, tab);
      const label = (await listOptionRows(page, tab)).find((row) => row.token === token)?.label;

      expect(plainText(render.header).toLowerCase(),
        `tab ${tab} should have reopened on "${label}"`)
        .toContain(plainText(label).toLowerCase());
      expect(render.children, `tab ${tab} reopened on an empty pane`).toBeGreaterThan(0);
    }
  });

  test('the side-menu collapsibles open and close on their headers', async ({ game, page }) => {
    await game.boot();
    await playRunToLateGame(game);
    await game.openTab(1);

    const headers = await page.evaluate(() =>
      Array.from(document.querySelectorAll('#tab1ContainerGroup .collapsible'))
        .map((el) => el.id)
        .filter(Boolean));
    expect(headers.length, 'tab 1 groups its resources into collapsible categories').toBeGreaterThan(0);

    for (const id of headers) {
      const state = async () => page.evaluate((collapsibleId) => {
        const collapsible = document.getElementById(collapsibleId);
        const content = collapsible?.querySelector('.collapsible-content');
        return {
          open: Boolean(content?.classList.contains('open')),
          height: content ? content.getBoundingClientRect().height : 0
        };
      }, id);

      const before = await state();
      await page.evaluate((collapsibleId) => {
        document.getElementById(collapsibleId)
          ?.querySelector('.collapsible-header')
          ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }, id);
      await page.waitForTimeout(450);
      const after = await state();

      expect(after.open, `${id} should have toggled from ${before.open}`).toBe(!before.open);
      // A section that reports itself closed but still occupies its full height
      // has toggled a class and nothing else.
      if (before.open) expect(after.height).toBeLessThan(before.height);
    }
  });
});

// ------------------------------------------------------- the endgame chapters

test.describe('UI Navigation — the megastructure chapter', () => {
  test('a megastructure run reveals the row, and its pane draws the diagram and the table', async ({ game, page }) => {
    await game.boot();
    await playRunToLateGame(game);
    await game.openTab(7);

    // Before the flag, the row is hidden: `megastructureUIChecks` shows it only
    // on a megastructure run, once the tab is unlocked, or once one is captured.
    const hiddenBefore = await page.evaluate(() =>
      document.getElementById('megastructuresOption')?.parentElement?.parentElement?.classList.contains('invisible'));
    expect(hiddenBefore, 'the megastructure row waits for the chapter').toBe(true);

    // Turn the run into a megastructure run through the game's own variable
    // debugger, which is how the chapter is reached without flying there.
    await game.setDebugVariable('currentRunIsMegaStructureRun', 'true');
    await game.closeVariableDebugger();
    await page.waitForTimeout(900);

    const shownAfter = await page.evaluate(() =>
      document.getElementById('megastructuresOption')?.parentElement?.parentElement?.classList.contains('invisible'));
    expect(shownAfter, 'the frame loop should reveal the row once the run is a megastructure run').toBe(false);

    expect(await openOptionRow(game, 7, 'tab7.option4')).toBe(true);
    await page.waitForTimeout(900);

    const render = await paneRender(page, 7);
    expect(plainText(render.header).toLowerCase()).toContain('megastructure');
    expect(render.children, 'the pane draws a diagram row and a table row').toBeGreaterThanOrEqual(2);

    const pane = await page.evaluate(() => ({
      diagram: Boolean(document.getElementById('megastructureDiagramRow')),
      table: Boolean(document.getElementById('megastructureTableRow')),
      text: (document.getElementById('optionContentTab7')?.textContent || '').toLowerCase()
    }));
    expect(pane.diagram, 'the megastructure diagram row').toBe(true);
    expect(pane.table, 'the megastructure table row').toBe(true);

    // All four structures belong on the table; a chapter that lists three has
    // dropped one.
    for (const structure of ['dyson', 'celestial', 'plasma', 'galactic']) {
      expect(pane.text, `the table should mention the ${structure} structure`).toContain(structure);
    }
    expect(game.significantErrors()).toEqual([]);
  });
});

test.describe('UI Navigation — the cosmic rip chapter', () => {
  /**
   * Put a long-played ledger on the board and restore the scanner array with its
   * own button, which is what makes the other two Cosmic Rip panes reachable.
   *
   * Galactic points are never written directly: the frame loop derives them from
   * `settledStars.length - 1 - galacticPointsSpent` every frame, so staging the
   * ledger and letting the loop do the arithmetic is the only thing that holds.
   */
  async function openTheChapter(game, page) {
    await game.withMods((m) => {
      m.cg.setTechUnlockedArray('cosmicRip');
      m.cg.setSettledStars('miaplacidus');
      for (let i = 1; i <= 30; i++) m.cg.setSettledStars(`uinav_system_${i}`);
      m.cg.setGalacticPointsSpent(0);
    });
    await page.waitForTimeout(800);

    expect(await openOptionRow(game, 8, 'tab8.option1'), 'the Situation row').toBe(true);
    await page.waitForTimeout(600);

    const pressed = await page.evaluate(() => {
      const button = document.querySelector('.cosmic-rip-restore-scanner-array-button');
      if (!button) return null;
      const blocked = button.disabled;
      button.click();
      return { blocked };
    });
    expect(pressed, 'the Situation pane offers the restore button').not.toBeNull();
    expect(pressed.blocked, 'thirty settled systems pay the ten points it costs').toBe(false);
    await page.waitForTimeout(1000);
  }

  test('restoring the scanner array adds its panes, and all three draw', async ({ game, page }) => {
    await game.boot();
    await playRunToLateGame(game);
    await game.openTab(8);

    const before = await listOptionRows(page, 8);
    expect(before.length, 'the Cosmic Rip tab ships three rows').toBe(3);
    // Only the Situation is offered until the array is back.
    expect(before.find((row) => row.token === 'tab8.option1').hidden).toBe(false);
    expect(before.find((row) => row.token === 'tab8.option2').hidden,
      'the telescope is hidden until the array is restored').toBe(true);

    await openTheChapter(game, page);
    await game.openTab(8);
    await page.waitForTimeout(900);

    const after = await listOptionRows(page, 8);
    expect(after.find((row) => row.token === 'tab8.option2').hidden,
      'restoring the array puts the telescope on the menu').toBe(false);

    // Each of the three panes has to route and draw.
    for (const row of after) {
      expect(await openOptionRow(game, 8, row.token), `${row.token} should open`).toBe(true);
      const render = await paneRender(page, 8);
      const pane = await game.withMods((m) => m.cg.getCurrentOptionPane());

      expect(plainText(render.header).toLowerCase(), `${row.token} heading`)
        .toContain(plainText(row.label).toLowerCase());
      expect(render.children, `pane "${pane}" drew nothing`).toBeGreaterThan(0);
    }

    // The telescope pane is the one the restoration buys, so check it really
    // built its nine-sector grid rather than an empty shell.
    expect(await openOptionRow(game, 8, 'tab8.option2')).toBe(true);
    await page.waitForTimeout(900);
    const grid = await page.evaluate(() => ({
      sectors: document.querySelectorAll('[id^="cosmicRipNearSpaceScannerArraySector"]').length,
      fog: document.querySelectorAll('[id^="cosmicRipNearSpaceScannerArrayFogCell"]').length
    }));
    expect(grid.sectors, 'nine clickable sectors').toBe(9);
    expect(grid.fog, 'each under its own fog cell').toBe(9);

    expect(game.significantErrors()).toEqual([]);
  });

  test('the Cosmic Rip tab keeps working after the chapter opens it up', async ({ game, page }) => {
    await game.boot();
    await playRunToLateGame(game);
    await game.openTab(8);
    await openTheChapter(game, page);

    // Leave the chapter, play elsewhere, and come back: the tab has to reopen on
    // the pane it was left on rather than resetting or drawing nothing.
    expect(await openOptionRow(game, 8, 'tab8.option3'), 'the Cosmic Rip row').toBe(true);
    const left = plainText((await paneRender(page, 8)).header);

    await game.openTab(1);
    await page.waitForTimeout(500);
    await game.openTab(7);
    await page.waitForTimeout(500);
    await game.openTab(8);
    await page.waitForTimeout(800);

    const returned = await paneRender(page, 8);
    expect(plainText(returned.header)).toBe(left);
    expect(returned.children).toBeGreaterThan(0);
    expect(game.significantErrors()).toEqual([]);
  });
});
