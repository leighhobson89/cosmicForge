/**
 * Area: Achievements — the pane: the grid, its artwork and its tooltips
 * Plan: tests/docs/areas/achievements.md
 *
 * The achievements pane is the only place an achievement is *visible*. It draws
 * a ten-by-seven grid of seventy tiles, paints each one with its own PNG, dims
 * the ones not yet earned, and hangs a tooltip off every tile that reports what
 * the achievement asks for, what it pays, whether a rebirth takes it away, and
 * whether it has been earned.
 *
 * Three things make this worth its own file rather than a line in the catalogue
 * sweep:
 *
 *   1. **The artwork is theme-scoped and lives on disk.** Every tile's
 *      background is `./images/achievements/<theme>/images/<id>.png`, rebuilt by
 *      `setAchievementIconImageUrls()` whenever the theme changes, across nine
 *      themes and seventy achievements — 630 files. A missing or renamed one is
 *      an empty square in the game and nothing at all in the console, because
 *      `background-image` failing to load is silent.
 *   2. **The tooltip is regenerated every frame.** `gameLoop` calls
 *      `refreshAchievementTooltipDescriptions()` on every tick, and
 *      `grantAchievement()` calls it again, so the status line is live — it has
 *      to flip from "not achieved" to "achieved" while the player is looking at
 *      it, without reopening the pane.
 *   3. **The grid is positional.** Each tile's cell comes from
 *      `achievementPositionDataLinker`, and two achievements sharing a cell
 *      means one is drawn on top of the other and is unreachable — the same
 *      class of defect as known-issues.md #15, where two pairs of techs shared a
 *      tree position.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe.configure({ timeout: 300_000 });

/** Every theme the settings dropdown offers, and every folder under images/achievements. */
const THEMES = ['terminal', 'dark', 'misty', 'light', 'frosty', 'summer', 'supernova', 'galaxy', 'space'];

/** Open the Achievements pane the way a player does: tab 9, its own side-menu row. */
async function openAchievementsPane(game) {
  await game.openTab(9);
  const clicked = await game.page.evaluate(() => {
    const row = document.querySelector('#tab9ContainerGroup p[class~="tab9.option10"]');
    if (!row) return false;
    row.classList.remove('invisible');
    row.closest('.row-side-menu')?.classList.remove('invisible');
    row.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  });
  if (!clicked) throw new Error('No Achievements row on tab 9');
  await game.page.waitForTimeout(900);

  const pane = await game.withMods((m) => m.cg.getCurrentOptionPane());
  if (pane !== 'achievements') throw new Error(`Expected the achievements pane, got "${pane}"`);
}

/** Open some other pane, so returning to Achievements is a genuine redraw. */
async function openAnotherPane(game) {
  await game.openTab(9);
  await game.page.evaluate(() => {
    const row = document.querySelector('#tab9ContainerGroup p[class~="tab9.option13"]');
    row?.closest('.row-side-menu')?.classList.remove('invisible');
    row?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await game.page.waitForTimeout(700);
}

/** What the grid currently holds: one entry per tile, in DOM order. */
async function readGrid(game) {
  return game.page.evaluate(() => {
    const container = document.getElementById('achievementsRowAchievementsGrid');
    if (!container) return null;
    return Array.from(container.querySelectorAll('.achievement-tile')).map((tile) => {
      const style = window.getComputedStyle(tile);
      return {
        id: tile.id,
        column: style.getPropertyValue('grid-column-start').trim(),
        row: style.getPropertyValue('grid-row-start').trim(),
        opacity: Number(tile.style.opacity),
        backgroundImage: tile.style.backgroundImage
      };
    });
  });
}

/** The URL inside a `url('…')` background-image declaration. */
function backgroundUrl(declaration) {
  const match = /url\(["']?(.*?)["']?\)/.exec(declaration || '');
  return match ? match[1] : null;
}

test.describe('Achievements — the pane', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('the pane draws one tile per achievement, each in its own cell', async ({ game }) => {
    await openAchievementsPane(game);

    const tiles = await readGrid(game);
    expect(tiles, 'the pane should build the achievements grid').not.toBeNull();

    const catalogue = await game.withMods((m) =>
      Object.keys(m.rdo.achievementsData).filter((k) => k !== 'version').sort());

    expect(tiles.map((t) => t.id).sort()).toEqual(catalogue);

    // Two achievements in one cell means one is drawn underneath the other and
    // can never be hovered — invisible to the player and to any test that only
    // counts tiles.
    const cells = tiles.map((t) => `${t.row}/${t.column}`);
    const duplicated = cells.filter((cell, index) => cells.indexOf(cell) !== index);
    expect([...new Set(duplicated)], 'two achievements share a grid cell').toEqual([]);

    // Every tile the grid draws should match the position the data declares.
    const declared = await game.withMods((m) => m.rdo.getAchievementPositionData());
    const misplaced = tiles.filter((tile) => {
      const position = declared[tile.id];
      return !position
        || String(position.gridColumn + 1) !== tile.column
        || String(position.gridRow + 1) !== tile.row;
    }).map((tile) => `${tile.id} at ${tile.row}/${tile.column}`);
    expect(misplaced).toEqual([]);
  });

  test('an unearned tile is dimmed and an earned one is lit, without reopening the pane', async ({ game }) => {
    await openAchievementsPane(game);

    const before = (await readGrid(game)).find((tile) => tile.id === 'collect50Hydrogen');
    expect(before.opacity, 'an achievement not yet earned should be dimmed').toBeCloseTo(0.3, 5);

    // Earn it for real, and let the frame loop's own pass over the grid — the
    // block at the top of `checkForAchievements()` — repaint the tile.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(1e6, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(50, 'resources', ['hydrogen', 'quantity']);
    });
    await game.page.waitForFunction(
      () => Number(document.getElementById('collect50Hydrogen')?.style.opacity) === 1,
      null,
      { timeout: 15000 }
    ).catch(() => { /* asserted below with a readable message */ });

    const after = (await readGrid(game)).find((tile) => tile.id === 'collect50Hydrogen');
    expect(after.opacity, 'an earned achievement should be lit while the pane is open').toBe(1);
  });

  test('every tile is painted with its own artwork for the current theme', async ({ game }) => {
    await openAchievementsPane(game);

    const theme = await game.withMods((m) => m.cg.getCurrentTheme());
    const tiles = await readGrid(game);

    const wrong = [];
    for (const tile of tiles) {
      const url = backgroundUrl(tile.backgroundImage);
      const expected = `./images/achievements/${theme}/images/${tile.id}.png`;
      if (!url) {
        wrong.push(`${tile.id}: no background image at all`);
      } else if (!url.endsWith(expected.replace('./', ''))) {
        // `getAchievementImageUrl` returns null for a key it does not know, which
        // renders as the literal string "null" and shows as a blank square.
        wrong.push(`${tile.id}: painted with "${url}", expected "${expected}"`);
      }
    }
    expect(wrong).toEqual([]);
  });

  test('every achievement has artwork on disk for every theme', async ({ game }) => {
    // 630 files. The URLs are asked of the game rather than assembled here, so a
    // change to the naming scheme is caught rather than silently mirrored.
    const original = await game.withMods((m) => m.cg.getCurrentTheme());
    const missing = [];

    for (const theme of THEMES) {
      const urls = await game.withMods((m, name) => {
        m.cg.setCurrentTheme(name);
        m.rdo.setAchievementIconImageUrls();
        const map = m.rdo.getAchievementIconImageUrls();
        return Object.keys(m.rdo.achievementsData)
          .filter((k) => k !== 'version')
          .map((id) => ({ id, url: map[id] ?? null }));
      }, theme);

      const nullUrls = urls.filter((entry) => !entry.url).map((entry) => `${theme}/${entry.id}: no url`);
      missing.push(...nullUrls);

      // Requested in batches: 70 parallel fetches per theme keeps the sweep
      // quick without opening 630 sockets at once.
      const present = urls.filter((entry) => entry.url);
      for (let i = 0; i < present.length; i += 20) {
        const batch = present.slice(i, i + 20);
        const results = await Promise.all(batch.map(async (entry) => {
          const path = entry.url.replace(/^\.\//, '/');
          const response = await game.page.request.get(path);
          return { entry, status: response.status(), path };
        }));
        for (const result of results) {
          if (result.status !== 200) {
            missing.push(`${result.path} -> HTTP ${result.status}`);
          }
        }
      }
    }

    await game.withMods((m, name) => {
      m.cg.setCurrentTheme(name);
      m.rdo.setAchievementIconImageUrls();
    }, original);

    expect(missing).toEqual([]);
  });

  test('changing the theme repaints the grid with that theme\'s artwork', async ({ game }) => {
    await openAchievementsPane(game);
    const before = await readGrid(game);
    const beforeTheme = await game.withMods((m) => m.cg.getCurrentTheme());

    // Chosen through the settings dropdown, so what is under test is the real
    // path from the control to the pane.
    const target = beforeTheme === 'supernova' ? 'frosty' : 'supernova';
    await game.openTab(9);
    await game.page.evaluate(() => {
      const row = document.querySelector('#tab9ContainerGroup p[class~="tab9.option1"]');
      row?.closest('.row-side-menu')?.classList.remove('invisible');
      row?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(700);
    await game.page.evaluate((theme) => {
      const container = document.getElementById('themeSelect');
      container?.querySelector('div.dropdown')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      container?.querySelector(`div.dropdown-option[data-value="${theme}"]`)
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }, target);
    await game.page.waitForTimeout(700);

    await openAchievementsPane(game);
    const after = await readGrid(game);

    expect(await game.withMods((m) => m.cg.getCurrentTheme())).toBe(target);

    const stale = [];
    for (const tile of after) {
      const url = backgroundUrl(tile.backgroundImage) || '';
      if (!url.includes(`/achievements/${target}/`)) {
        stale.push(`${tile.id}: still painted from "${url}"`);
      }
    }
    expect(stale, 'the grid should repaint from the newly chosen theme').toEqual([]);
    expect(before.length).toBe(after.length);
  });

  test('hovering a tile shows a tooltip naming the achievement, its reward and its rebirth policy', async ({ game }) => {
    await openAchievementsPane(game);

    const expected = await game.withMods((m) => ({
      description: m.desc.getAchievementTooltipDescriptionTexts('collect50Hydrogen'),
      reward: m.loc.localize('reward', m.cg.getLanguage()),
      resetLabel: m.loc.localize('resetOnRebirth', m.cg.getLanguage()),
      yes: m.loc.localize('yes', m.cg.getLanguage()),
      statusLabel: m.loc.localize('status', m.cg.getLanguage()),
      notAchieved: m.loc.localize('notAchieved', m.cg.getLanguage()),
      currency: m.cg.getCurrencySymbol()
    }));

    await game.page.hover('#collect50Hydrogen');
    await game.page.waitForTimeout(400);

    const tooltip = await game.page.evaluate(() => {
      const el = document.getElementById('achievement-tooltip');
      if (!el) return null;
      return { display: el.style.display, text: (el.textContent || '').replace(/\s+/g, ' ').trim() };
    });

    expect(tooltip, 'the pane should have installed a tooltip element').not.toBeNull();
    expect(tooltip.display).toBe('block');

    // The four things the tooltip promises the player.
    expect(tooltip.text).toContain(expected.description);
    expect(tooltip.text).toContain(`${expected.reward}: ${expected.currency}10`);
    expect(tooltip.text).toContain(`${expected.resetLabel}: ${expected.yes}`);
    expect(tooltip.text).toContain(`${expected.statusLabel}: ${expected.notAchieved}`);
  });

  test('the tooltip status flips to achieved while the player is still hovering it', async ({ game }) => {
    await openAchievementsPane(game);

    const labels = await game.withMods((m) => ({
      status: m.loc.localize('status', m.cg.getLanguage()),
      achieved: m.loc.localize('achieved', m.cg.getLanguage()),
      notAchieved: m.loc.localize('notAchieved', m.cg.getLanguage())
    }));

    await game.page.hover('#collect50Hydrogen');
    await game.page.waitForTimeout(400);
    const before = await game.page.evaluate(() =>
      (document.getElementById('achievement-tooltip')?.textContent || '').replace(/\s+/g, ' ').trim());
    expect(before).toContain(`${labels.status}: ${labels.notAchieved}`);

    // Earn it without touching the pane. `refreshAchievementTooltipDescriptions()`
    // runs on every frame, so the open tooltip has to catch up on its own.
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(1e6, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(50, 'resources', ['hydrogen', 'quantity']);
    });
    await game.page.waitForFunction(
      () => globalThis.__mods.rdo.getAchievementDataObject('collect50Hydrogen', ['active'], true) === true,
      null,
      { timeout: 15000 }
    );

    // The tooltip repaints on mousemove, which is what a hovering player is
    // doing; nudge the pointer inside the same tile rather than re-entering it.
    const box = await game.page.locator('#collect50Hydrogen').boundingBox();
    await game.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await game.page.mouse.move(box.x + box.width / 2 + 2, box.y + box.height / 2 + 2);
    await game.page.waitForTimeout(400);

    const after = await game.page.evaluate(() =>
      (document.getElementById('achievement-tooltip')?.textContent || '').replace(/\s+/g, ' ').trim());
    expect(after).toContain(`${labels.status}: ${labels.achieved}`);
  });

  test('every achievement has a tooltip that resolves, in all six languages', async ({ game }) => {
    // The tooltip body is built from `achievementTooltipDescriptionTexts`, which
    // is rebuilt per language by `initialiseDescriptions()`. An achievement
    // missing from that map renders a tooltip with a hole in it and a console
    // warning nobody reads.
    const problems = await game.withMods(async (m) => {
      const ids = Object.keys(m.rdo.achievementsData).filter((k) => k !== 'version');
      const issues = [];
      const original = m.cg.getLanguage();

      for (const language of ['en', 'es', 'pt', 'de', 'it', 'fr']) {
        await m.loc.initLocalization(language);
        m.desc.initialiseDescriptions();
        m.desc.refreshAchievementTooltipDescriptions();

        for (const id of ids) {
          const body = m.desc.getAchievementTooltipDescriptionTexts(id);
          if (!body || typeof body !== 'string' || !body.trim()) {
            issues.push(`${language}:${id}: no tooltip text`);
          }
          const full = m.desc.getAchievementTooltipDescription(id);
          if (!full || typeof full !== 'string' || !full.trim()) {
            issues.push(`${language}:${id}: no tooltip`);
          } else if (!full.includes(m.loc.localize('status', language))) {
            issues.push(`${language}:${id}: tooltip has no status line`);
          }
        }
      }

      await m.loc.initLocalization(original);
      m.desc.initialiseDescriptions();
      m.desc.refreshAchievementTooltipDescriptions();
      return issues;
    });

    expect(problems).toEqual([]);
  });

  test('reopening the pane does not stack a second tooltip on the document', async ({ game }) => {
    // `createAchievementsSectionRow()` calls `setupAchievementTooltip()` every
    // time the pane is drawn, and that function appends a fresh element and
    // binds three more document-level listeners. Left unchecked, a player who
    // visits the pane ten times has ten overlapping tooltips sharing one id and
    // thirty listeners firing on every mouse move.
    //
    // The listener count is measured alongside, and reported in the failure
    // message rather than asserted on: two different panes build different
    // numbers of rows, so "achievements against another pane" is not a clean
    // enough control to assert against. The tooltip element count is — it goes
    // up by exactly one per visit, and only this pane appends one.
    const client = await game.page.context().newCDPSession(game.page);
    await client.send('Performance.enable');
    const listeners = async () => {
      const { metrics } = await client.send('Performance.getMetrics');
      return metrics.find((entry) => entry.name === 'JSEventListeners')?.value ?? 0;
    };

    await openAchievementsPane(game);
    const baselineListeners = await listeners();
    const baselineTooltips = await game.page.evaluate(() =>
      document.querySelectorAll('#achievement-tooltip').length);

    for (let visit = 0; visit < 3; visit++) {
      await openAnotherPane(game);
      await openAnotherPane(game);
    }
    const controlListeners = await listeners();

    for (let visit = 0; visit < 3; visit++) {
      await openAnotherPane(game);
      await openAchievementsPane(game);
    }
    const afterListeners = await listeners();

    const tooltips = await game.page.evaluate(() =>
      document.querySelectorAll('#achievement-tooltip').length);

    const controlCost = controlListeners - baselineListeners;
    const achievementsCost = afterListeners - controlListeners;

    expect(
      tooltips,
      `the achievements pane should install exactly one tooltip however often it is opened `
      + `(started at ${baselineTooltips}; three more visits added ${tooltips - baselineTooltips}; `
      + `document listeners grew by ${achievementsCost} against a control of ${controlCost} for the same number of redraws of another pane)`
    ).toBe(1);
  });

  test('driving the achievements pane raises no console or page errors', async ({ game }) => {
    await openAchievementsPane(game);
    await game.page.hover('#collect50Hydrogen');
    await game.page.waitForTimeout(300);
    await game.page.hover('#completeGame');
    await game.page.waitForTimeout(300);
    await openAnotherPane(game);
    await openAchievementsPane(game);
    await game.page.waitForTimeout(1000);

    expect(game.significantErrors()).toEqual([]);
  });
});
