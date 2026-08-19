/**
 * Area: Number Notation — the setting played, and the grammar checked on screen
 * Plan: tests/docs/areas/notation.md
 *
 * `notation.spec.js` covers the formatter's contract: what `formatNumber()`
 * returns at each magnitude boundary, that it truncates rather than rounds, and
 * what it does with rubbish input. All of that is `withMods` calling exported
 * functions, and all of it would still pass if the frame loop never applied the
 * formatter to a single element on screen.
 *
 * This file checks the *screen*. It changes the setting through the real
 * dropdown on the Visual pane, then walks every option row on all nine tabs and
 * reads back what each pane actually renders — price descriptions, buttons,
 * labels, the fixed stat bar and the statistics screen — asserting that every
 * number obeys the grammar of the mode that is switched on.
 *
 * ## The two modes, and which one matters
 *
 * The dropdown offers exactly two: **Normal Condensed** (the default, and the
 * one players actually use) and **Normal**. Every assertion here runs in both,
 * and the condensed sweep is the deeper of the two because it is the mode the
 * game ships in.
 *
 * ## The grammar, and why it is stated as a rule rather than a value list
 *
 * A pane's numbers move while it is open — production ticks, autobuyers spend —
 * so pinning exact strings would be flaky by construction. What does not move is
 * the *shape* the formatter is obliged to produce:
 *
 *   condensed  no thousands separator anywhere, and nothing longer than four
 *              integer digits without a K/M/B/e-suffix behind it
 *   plain      no `1.5K`-style abbreviation, and every value past a thousand
 *              grouped with commas
 *
 * Both rules are violated only by a number the formatter never reached, which is
 * exactly the failure this file exists to catch.
 *
 * ## Three surfaces, three different code paths
 *
 * The frame loop routes `.notation` elements three ways, and each is covered
 * separately here because they share no code:
 *
 *   `.sell-fuse-money`     -> complexSellStringFormatter
 *   `.building-purchase`   -> complexPurchaseBuildingFormatter  (price rows)
 *   everything else        -> formatAllNotationElements
 */
import { test, expect } from '../_harness/game-fixture.mjs';
import { ALL_TABS, walkAllPanes, openOptionRow } from '../_harness/navigation.mjs';

/** Walking 59 panes twice over is not quick, and neither is the debug scenario. */
test.describe.configure({ timeout: 300_000 });

/**
 * A number as it appears in rendered text, with any magnitude suffix glued to it.
 *
 * The grouping alternative has to be `,\d{3}` rather than `[\d,]*`: several cost
 * descriptions read "$300, 100 Carbon", and a looser pattern reads the list
 * separator as a thousands separator and reports a violation that is not there.
 */
const NUMBER_TOKEN = /-?\d+(?:,\d{3})*(?:\.\d+)?(K|M|B|e\d+)?/g;

/** Split rendered text into { text, suffix, integerDigits, grouped } tokens. */
function numberTokens(text) {
  return Array.from(String(text ?? '').matchAll(NUMBER_TOKEN)).map((match) => {
    const suffix = match[1] ?? null;
    const numeric = suffix ? match[0].slice(0, match[0].length - suffix.length) : match[0];
    const integerPart = numeric.replace(/^-/, '').split('.')[0];
    return {
      text: match[0],
      numeric,
      suffix,
      grouped: integerPart.includes(','),
      integerDigits: integerPart.replace(/,/g, '').length,
      hasDecimal: numeric.includes('.')
    };
  });
}

/**
 * Condensed-mode violations in one rendered string.
 *
 * Four integer digits are allowed without a suffix because sub-thousand values
 * go through `toFixed(0)`, and 999.9 rounds up to "1000" there.
 */
function condensedViolations(text) {
  const problems = [];
  for (const token of numberTokens(text)) {
    if (token.grouped) problems.push(`"${token.text}" is comma-grouped, which is the plain mode's job`);
    if (!token.suffix && token.integerDigits > 4) {
      problems.push(`"${token.text}" has ${token.integerDigits} digits and no magnitude suffix`);
    }
  }
  return problems;
}

/**
 * Plain-mode violations in one rendered string.
 *
 * The suffix rule tests for a *decimal* before the letter. Several descriptions
 * carry a literal "$5K" in their authored text, where the K is part of the
 * sentence rather than something the formatter produced; a leaked condensed
 * value always reads "1.5K", with the one decimal place the formatter emits.
 */
function plainViolations(text) {
  const problems = [];
  for (const token of numberTokens(text)) {
    if (token.suffix && token.hasDecimal) {
      problems.push(`"${token.text}" is a condensed abbreviation, not a plain number`);
    }
    if (token.integerDigits > 3 && !token.grouped) {
      problems.push(`"${token.text}" passes a thousand and is not grouped`);
    }
  }
  return problems;
}

/** Every visible `.notation` element, with enough identity to name it in a failure. */
async function visibleNotationElements(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('.notation'))
      .filter((el) => el.offsetParent !== null || el.getClientRects().length > 0)
      .map((el) => ({
        id: el.id || null,
        className: el.className,
        purchaseRow: el.classList.contains('building-purchase'),
        sellRow: el.classList.contains('sell-fuse-money'),
        text: (el.textContent || '').trim()
      }))
      .filter((entry) => /\d/.test(entry.text)));
}

/** Choose a notation mode through the dropdown on the Visual pane. */
async function chooseNotation(game, value) {
  await game.openTab(9);
  await openOptionRow(game, 9, 'tab9.option1');

  const ok = await game.page.evaluate((option) => {
    const container = document.getElementById('notationSelect');
    if (!container) return false;
    container.querySelector('div.dropdown')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const choice = container.querySelector(`div.dropdown-option[data-value="${option}"]`);
    if (!choice) return false;
    choice.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, value);
  if (!ok) throw new Error(`The Visual pane's notation dropdown does not offer "${value}"`);

  await game.page.waitForTimeout(700);
  const applied = await game.withMods((m) => m.cg.getNotationType());
  if (applied !== value) throw new Error(`Dropdown chose "${value}" but the game is in "${applied}"`);
}

/** A run with enough cash, resources and unlocks that every pane has numbers to show. */
async function stageRunWithNumbersEverywhere(game) {
  await game.prepareRunForStarshipLaunch();
  await game.debugClick('give1BButton');
  await game.debugClick('give1MAllResourcesAndCompounds');
  await game.debugClick('give1MResearch');
  await game.page.waitForTimeout(1000);
}

/** Open the Statistics screen through its side-menu row. */
async function openStatisticsScreen(game) {
  await game.openTab(9);
  const opened = await openOptionRow(game, 9, 'tab9.option8');
  expect(opened, 'the Statistics row should be on the settings menu').toBe(true);
  await game.page.waitForTimeout(1200);
}

// ------------------------------------------------- the setting, driven for real

test.describe('Number Notation — the setting on the Visual pane', () => {
  test('a new run starts condensed, and the dropdown shows that as the chosen option', async ({ game, page }) => {
    await game.boot();
    await game.openTab(9);
    await openOptionRow(game, 9, 'tab9.option1');

    const shown = await page.evaluate(() => {
      const container = document.getElementById('notationSelect');
      const text = container?.querySelector('.dropdown-text');
      return {
        present: !!container,
        value: text?.getAttribute('data-value') ?? null,
        options: Array.from(container?.querySelectorAll('div.dropdown-option') ?? [])
          .map((el) => el.getAttribute('data-value'))
      };
    });

    expect(shown.present, 'the notation row belongs on the Visual pane').toBe(true);
    // Two modes ship. A third appearing here means a mode nothing in this file
    // has a grammar for, which is worth failing over.
    expect(shown.options).toEqual(['normalCondensed', 'normal']);
    expect(shown.value, 'the dropdown opens on the mode the game is actually in').toBe('normalCondensed');
    expect(await game.withMods((m) => m.cg.getNotationType())).toBe('normalCondensed');
  });

  test('choosing plain reformats what is already on screen, and choosing condensed puts it back', async ({ game, page }) => {
    await game.boot();
    await stageRunWithNumbersEverywhere(game);
    await game.openTab(1);
    await openOptionRow(game, 1, 'tab1.option1');

    const sample = async () => {
      await page.waitForTimeout(700);
      const entries = await visibleNotationElements(page);
      return Object.fromEntries(entries.filter((e) => e.id).map((e) => [e.id, e.text]));
    };

    const condensedBefore = await sample();
    expect(Object.keys(condensedBefore).length,
      'the Hydrogen pane should be showing plenty of numbers').toBeGreaterThan(5);

    await chooseNotation(game, 'normal');
    await game.openTab(1);
    const plain = await sample();

    await chooseNotation(game, 'normalCondensed');
    await game.openTab(1);
    const condensedAfter = await sample();

    // Only condensed emits magnitude suffixes, and only plain groups thousands.
    const anySuffix = (values) => values.some((text) => /\d\.\d(K|M|B|e\d)/.test(text));
    const anyGrouping = (values) => values.some((text) => /\d,\d{3}/.test(text));

    expect(anySuffix(Object.values(condensedBefore)), 'condensed abbreviates').toBe(true);
    expect(anySuffix(Object.values(plain)), 'plain must not abbreviate').toBe(false);
    expect(anyGrouping(Object.values(plain)), 'plain groups thousands').toBe(true);
    expect(anyGrouping(Object.values(condensedAfter)), 'condensed must not group').toBe(false);

    // The same elements must be the ones that changed, rather than the pane
    // having been rebuilt into something else entirely.
    const shared = Object.keys(condensedBefore).filter((id) => id in plain);
    expect(shared.length).toBeGreaterThan(5);
    expect(shared.some((id) => plain[id] !== condensedBefore[id]),
      'switching mode has to change at least one rendered value').toBe(true);
  });

  test('the chosen mode survives leaving the pane and coming back', async ({ game, page }) => {
    await game.boot();
    await chooseNotation(game, 'normal');

    // Leave settings entirely, play elsewhere, then return: the pane is rebuilt
    // from scratch each visit, and it has to rebuild onto the live setting.
    await game.openTab(1);
    await openOptionRow(game, 1, 'tab1.option1');
    await page.waitForTimeout(600);
    await game.openTab(9);
    await openOptionRow(game, 9, 'tab9.option1');
    await page.waitForTimeout(600);

    const shown = await page.evaluate(() =>
      document.getElementById('notationSelect')?.querySelector('.dropdown-text')?.getAttribute('data-value') ?? null);

    expect(shown).toBe('normal');
    expect(await game.withMods((m) => m.cg.getNotationType())).toBe('normal');
  });
});

// ------------------------------------------------ the sweep across every screen

test.describe('Number Notation — every screen in the game', () => {
  test('condensed: no screen renders an un-abbreviated number', async ({ game, page }) => {
    await game.boot();
    await stageRunWithNumbersEverywhere(game);
    await chooseNotation(game, 'normalCondensed');

    const offenders = [];
    let sampled = 0;
    const panes = await walkAllPanes(game, {
      tabs: ALL_TABS,
      onPane: async ({ tab, label }) => {
        for (const element of await visibleNotationElements(page)) {
          sampled++;
          for (const problem of condensedViolations(element.text)) {
            offenders.push(`tab ${tab} / ${label} / ${element.id || element.className}: ${problem} — "${element.text}"`);
          }
        }
      }
    });

    // A sweep that opened nothing would pass silently, so state the floor.
    expect(panes.length, 'every tab should contribute option rows').toBeGreaterThan(40);
    expect(sampled, 'the sweep should have read hundreds of rendered numbers').toBeGreaterThan(500);
    expect([...new Set(offenders)]).toEqual([]);
  });

  test('plain: every value past a thousand is grouped, and nothing is abbreviated', async ({ game, page }) => {
    await game.boot();
    await stageRunWithNumbersEverywhere(game);
    await chooseNotation(game, 'normal');

    const offenders = [];
    const panes = await walkAllPanes(game, {
      tabs: ALL_TABS,
      onPane: async ({ tab, label }) => {
        for (const element of await visibleNotationElements(page)) {
          for (const problem of plainViolations(element.text)) {
            offenders.push(`tab ${tab} / ${label} / ${element.id || element.className}: ${problem} — "${element.text}"`);
          }
        }
      }
    });

    expect(panes.length).toBeGreaterThan(40);
    expect([...new Set(offenders)]).toEqual([]);
  });

  test('no screen in either mode leaks NaN, Infinity, undefined or an object', async ({ game, page }) => {
    await game.boot();
    await stageRunWithNumbersEverywhere(game);

    const RUBBISH = /\bNaN\b|\bInfinity\b|\bundefined\b|\[object Object\]/;
    const offenders = [];

    for (const mode of ['normalCondensed', 'normal']) {
      await chooseNotation(game, mode);
      await walkAllPanes(game, {
        tabs: ALL_TABS,
        onPane: async ({ tab, label, render }) => {
          if (RUBBISH.test(render.text)) {
            offenders.push(`${mode} / tab ${tab} / ${label}: ${render.text.match(RUBBISH)[0]}`);
          }
          for (const element of await visibleNotationElements(page)) {
            if (RUBBISH.test(element.text)) {
              offenders.push(`${mode} / tab ${tab} / ${label} / ${element.id || element.className}: "${element.text}"`);
            }
          }
        }
      });
    }

    expect([...new Set(offenders)]).toEqual([]);
  });
});

// ------------------------------------------------------ price rows and sell rows

test.describe('Number Notation — price descriptions', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await stageRunWithNumbersEverywhere(game);
  });

  /** Every visible purchase-price description, across the tabs that have them. */
  async function collectPriceRows(game) {
    const rows = [];
    await walkAllPanes(game, {
      tabs: [1, 2, 4, 5, 6, 8],
      onPane: async ({ tab, label }) => {
        const found = await game.page.evaluate(() =>
          Array.from(document.querySelectorAll('.building-purchase'))
            .filter((el) => el.offsetParent !== null || el.getClientRects().length > 0)
            .map((el) => ({ id: el.id || null, text: (el.textContent || '').trim() }))
            .filter((entry) => /\d/.test(entry.text)));
        found.forEach((entry) => rows.push({ tab, label, ...entry }));
      }
    });
    return rows;
  }

  test('condensed: every cost on a purchase row is abbreviated and keeps its currency symbol', async ({ game }) => {
    await chooseNotation(game, 'normalCondensed');
    const rows = await collectPriceRows(game);

    // Six tabs carry `building-purchase` rows; a run that reached fewer than
    // eight of them has not staged enough to make the sweep meaningful.
    expect(rows.length, 'the run should have purchase rows on several tabs').toBeGreaterThanOrEqual(8);

    const offenders = [];
    for (const row of rows) {
      for (const problem of condensedViolations(row.text)) {
        offenders.push(`tab ${row.tab} / ${row.label} / ${row.id}: ${problem} — "${row.text}"`);
      }
    }
    expect([...new Set(offenders)]).toEqual([]);

    // The cash cost is the first span, and the formatter rebuilds it around the
    // currency symbol — losing the symbol is the classic way that rewrite breaks.
    const symbol = await game.withMods((m) => m.cg.getCurrencySymbol());
    const cashRows = rows.filter((row) => row.text.includes(symbol));
    expect(cashRows.length, `no purchase row showed a ${symbol} cost`).toBeGreaterThan(5);

    // At least one row must actually be abbreviated, or the sweep above proved
    // nothing beyond "these rows are all cheap".
    expect(rows.some((row) => /\d\.\d(K|M|B)/.test(row.text)),
      'no purchase row abbreviated a cost').toBe(true);
  });

  test('plain: every cost on a purchase row is grouped in thousands', async ({ game }) => {
    await chooseNotation(game, 'normal');
    const rows = await collectPriceRows(game);

    expect(rows.length).toBeGreaterThanOrEqual(8);

    const offenders = [];
    for (const row of rows) {
      for (const problem of plainViolations(row.text)) {
        offenders.push(`tab ${row.tab} / ${row.label} / ${row.id}: ${problem} — "${row.text}"`);
      }
    }
    expect([...new Set(offenders)]).toEqual([]);
  });

  test('the sell row shows a condensed sale value on every resource', async ({ game, page }) => {
    await chooseNotation(game, 'normalCondensed');

    const seen = [];
    await walkAllPanes(game, {
      tabs: [1, 4],
      onPane: async ({ tab, label }) => {
        const money = await page.evaluate(() =>
          Array.from(document.querySelectorAll('.sell-fuse-money'))
            .filter((el) => el.offsetParent !== null || el.getClientRects().length > 0)
            .map((el) => (el.textContent || '').trim()));
        money.forEach((text) => seen.push({ tab, label, text }));
      }
    });

    // One per resource and compound pane that has anything to sell.
    expect(seen.length, 'no sell row was found on the resource or compound tabs').toBeGreaterThan(5);

    const offenders = [];
    for (const entry of seen) {
      // The sale value of a full store runs to millions, so it must abbreviate.
      if (!/\d/.test(entry.text)) offenders.push(`tab ${entry.tab} / ${entry.label}: empty sale value`);
      for (const problem of condensedViolations(entry.text)) {
        offenders.push(`tab ${entry.tab} / ${entry.label}: ${problem} — "${entry.text}"`);
      }
    }
    expect([...new Set(offenders)]).toEqual([]);
    expect(seen.some((entry) => /\d\.\d(K|M|B)/.test(entry.text)),
      'a full store should sell for an abbreviated amount').toBe(true);
  });
});

// --------------------------------------------------- the stat bar and stat screen

test.describe('Number Notation — the stat bar and the statistics screen', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await stageRunWithNumbersEverywhere(game);
  });

  /** The fixed bar across the top of every screen. */
  async function statBar(page) {
    return page.evaluate(() =>
      Array.from(document.querySelectorAll('#statsContainer .stat-value'))
        .map((el) => ({
          id: el.id,
          notation: el.classList.contains('notation'),
          text: (el.textContent || '').trim()
        })));
  }

  test('the stat bar follows the notation setting, on whichever tab you are on', async ({ game, page }) => {
    await chooseNotation(game, 'normalCondensed');
    await game.openTab(1);
    await page.waitForTimeout(700);
    const condensed = await statBar(page);

    await chooseNotation(game, 'normal');
    await game.openTab(1);
    await page.waitForTimeout(700);
    const plain = await statBar(page);

    const byId = (entries, id) => entries.find((entry) => entry.id === id);

    // Cash is the headline figure, and it has its own branch in the formatter.
    expect(byId(condensed, 'cashStat').text, 'a billion in cash should abbreviate')
      .toMatch(/\d(\.\d)?(K|M|B|e\d+)/);
    expect(byId(plain, 'cashStat').text, 'plain cash should be grouped').toMatch(/\d,\d{3}/);

    for (const entry of condensed.filter((e) => e.notation)) {
      expect(condensedViolations(entry.text), `${entry.id} in condensed: "${entry.text}"`).toEqual([]);
    }
    for (const entry of plain.filter((e) => e.notation)) {
      expect(plainViolations(entry.text), `${entry.id} in plain: "${entry.text}"`).toEqual([]);
    }
  });

  test('the statistics screen follows the notation setting', async ({ game, page }) => {
    /**
     * Rows on the statistics table whose value is a number worth formatting.
     *
     * The table also carries text stats — the pioneer's name, the theme, a
     * duration such as "7s" — and the pioneer name this suite generates has a
     * timestamp in it. So a cell only counts when the whole of it is a figure:
     * digits, with an optional currency symbol, grouping and decimals around
     * them, and an optional magnitude suffix glued to the end.
     *
     * That suffix has to be part of the pattern rather than a disqualifier. A
     * correctly condensed cell reads "$1.0B", which is exactly the shape this
     * sweep exists to look at — matching only bare digits counted the screen's
     * numbers while it was unformatted and then found nothing at all once the
     * formatter reached it, which is not a floor worth having.
     *
     * "Big enough to be worth formatting" therefore means four digits *or* a
     * suffix, since condensing is the thing that takes the digits away.
     */
    const readStatRows = () => page.evaluate(() =>
      Array.from(document.querySelectorAll('#statisticsRowTextArea tr'))
        .map((row) => ({
          key: row.getAttribute('data-stat-key') || '',
          label: (row.querySelector('.left-column')?.textContent || '').trim(),
          values: Array.from(row.querySelectorAll('.middle-column, .right-column'))
            .map((cell) => (cell.textContent || '').trim())
            .filter((value) => /^[^0-9a-zA-Z]{0,2}[\d.,]+(K|M|B|e\d+)?[^0-9a-zA-Z]{0,2}$/.test(value))
            .filter((value) => /(K|M|B|e\d+)$/.test(value) || value.replace(/[^\d]/g, '').length >= 4)
        }))
        .filter((row) => row.values.length > 0));

    await chooseNotation(game, 'normalCondensed');
    await openStatisticsScreen(game);
    const condensed = await readStatRows();

    await chooseNotation(game, 'normal');
    await openStatisticsScreen(game);
    const plain = await readStatRows();

    expect(condensed.length, 'the statistics screen should carry large figures such as cash')
      .toBeGreaterThan(0);
    expect(plain.length, 'the same figures should still be there in plain mode')
      .toBeGreaterThan(0);

    // The claim underneath the sweep: cash is the headline figure on this screen,
    // and it has to be abbreviated in one mode and grouped in the other. Without
    // this, a screen that rendered every figure as "0" would satisfy both sweeps.
    const cashCell = (rows) => rows.find((row) => row.key === 'cash')?.values?.[0] ?? '';
    expect(cashCell(condensed), 'a billion in cash should abbreviate on the stats screen')
      .toMatch(/\d(\.\d)?(K|M|B|e\d+)/);
    expect(cashCell(plain), 'plain cash on the stats screen should be grouped')
      .toMatch(/\d,\d{3}/);

    const condensedOffenders = condensed.flatMap((row) =>
      row.values.flatMap((value) => condensedViolations(value).map((p) => `${row.label} ${p} — "${value}"`)));
    const plainOffenders = plain.flatMap((row) =>
      row.values.flatMap((value) => plainViolations(value).map((p) => `${row.label} ${p} — "${value}"`)));

    expect(condensedOffenders, 'the statistics screen must abbreviate in condensed mode').toEqual([]);
    expect(plainOffenders, 'the statistics screen must group thousands in plain mode').toEqual([]);
  });
});
