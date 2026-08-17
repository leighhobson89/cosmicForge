/**
 * Area: Number Notation
 * Plan: tests/docs/areas/notation.md
 *
 * Two shipped modes, chosen from Settings → Notation:
 *
 *   normalCondensed  (default) — 1.2K / 3.4M / 5.6B / 7.8e12 / 9.0e42
 *   normal                     — 1,234 with thousands separators
 *
 * `formatNumber()` is the condensed formatter every display path funnels
 * through, and the frame loop applies `formatAllNotationElements` to every
 * element carrying the `notation` class. The condensed form deliberately
 * *truncates* rather than rounds — `Math.floor(n / divisor * 10) / 10` — so
 * 1999 reads 1.9K, not 2.0K. That is the single most load-bearing detail here:
 * a switch to rounding would silently overstate every number in the game.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

const NOTATION_MODES = ['normalCondensed', 'normal'];

test.describe('Number Notation', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('the condensed formatter picks the right suffix at every magnitude boundary', async ({ game }) => {
    const cases = [
      [0, '0'], [1, '1'], [999, '999'],
      [1000, '1.0K'], [1500, '1.5K'], [999999, '999.9K'],
      [1e6, '1.0M'], [2.5e6, '2.5M'], [999999999, '999.9M'],
      [1e9, '1.0B'], [1e12, '1.0e12'],
      [1e13, '1.0e13'], [1e42, '1.0e42'], [1e300, '1.0e300']
    ];

    const results = await game.withMods((m, inputs) =>
      inputs.map(([value]) => m.game.formatNumber(value)), cases);

    cases.forEach(([value, expected], index) => {
      expect(results[index], `formatNumber(${value})`).toBe(expected);
    });
  });

  test('the condensed formatter truncates rather than rounds', async ({ game }) => {
    const results = await game.withMods((m, values) =>
      values.map((value) => m.game.formatNumber(value)), [1999, 1099, 1_999_999, 9_999_999_999]);

    // Rounding would read 2.0K / 1.1K / 2.0M / 10.0B and overstate every one.
    expect(results).toEqual(['1.9K', '1.0K', '1.9M', '9.9B']);
  });

  test('sub-thousand values render as whole numbers with no suffix', async ({ game }) => {
    const results = await game.withMods((m, values) =>
      values.map((value) => m.game.formatNumber(value)), [0, 0.4, 0.6, 12.7, 999.9]);

    // Everything below 1000 goes through toFixed(0), so fractions disappear.
    expect(results).toEqual(['0', '0', '1', '13', '1000']);
  });

  test('negative and zero values format sanely, and unparseable input passes through untouched', async ({ game }) => {
    const numeric = await game.withMods((m, values) =>
      values.map((value) => String(m.game.formatNumber(value))), [-1, -1e6, -0.4, 0]);

    // Negatives fall through to toFixed(0) because every magnitude branch tests
    // for `>=`, so they are never given a suffix.
    expect(numeric).toEqual(['-1', '-1000000', '-0', '0']);
    for (const result of numeric) {
      expect(result).not.toContain('NaN');
      expect(result).not.toContain('Infinity');
    }

    // The guard is `if (isNaN(parseFloat(value))) return value` — it returns the
    // *original* input rather than a sanitised string, so a caller that passes
    // NaN gets NaN back. Nothing is laundered here: keeping rubbish visible is
    // what makes the DOM sweep below a meaningful assertion.
    const passthrough = await game.withMods((m) => ({
      empty: m.game.formatNumber(''),
      text: m.game.formatNumber('abc'),
      nullValue: m.game.formatNumber(null),
      undefinedValue: m.game.formatNumber(undefined),
      notANumber: String(m.game.formatNumber(NaN)),
      infinite: String(m.game.formatNumber(Infinity))
    }));

    expect(passthrough.empty).toBe('');
    expect(passthrough.text).toBe('abc');
    expect(passthrough.nullValue).toBeNull();
    expect(passthrough.undefinedValue).toBeUndefined();
    expect(passthrough.notANumber).toBe('NaN');
    // Infinity is "numeric" to parseFloat, so it reaches the magnitude ladder
    // and comes back as an exponent string rather than the word Infinity.
    expect(passthrough.infinite).not.toBe('Infinity');
  });

  test('the production-rate formatter keeps the sign and scales its precision', async ({ game }) => {
    const results = await game.withMods((m, values) =>
      values.map((value) => m.game.formatProductionRateValue(value)),
      [0, 0.005, 0.25, 1, 1.25, 12.75, 999, 1000, 1500, -1500, -0.25]);

    // Below 1 it shows two decimals, below 1000 one decimal, and above that it
    // hands off to the condensed formatter — with the sign restored separately,
    // because formatNumber is only ever given the absolute value.
    expect(results).toEqual([
      '0.00', '0.01', '0.25', '1.0', '1.3', '12.8', '999.0', '1.0K', '1.5K', '-1.5K', '-0.25'
    ]);
  });

  test('the notation setting offers exactly the two shipped modes and round-trips', async ({ game }) => {
    await game.openTab(9);
    await game.page.evaluate(() => {
      const el = document.getElementById('gameOptionsOption') || document.getElementById('visualOption');
      el?.closest('.row-side-menu')?.classList.remove('invisible');
      el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(500);

    const result = await game.withMods((m, modes) => {
      const original = m.cg.getNotationType();
      const roundTrip = {};
      for (const mode of modes) {
        m.cg.setNotationType(mode);
        roundTrip[mode] = m.cg.getNotationType();
      }
      m.cg.setNotationType(original);
      return { original, roundTrip, restored: m.cg.getNotationType() };
    }, NOTATION_MODES);

    expect(result.original).toBe('normalCondensed');
    expect(result.roundTrip).toEqual({ normalCondensed: 'normalCondensed', normal: 'normal' });
    expect(result.restored).toBe('normalCondensed');
  });

  test('switching notation reformats visible values within a frame or two', async ({ game }) => {
    await game.prepareRunForStarshipLaunch();
    await game.openTab(1);
    await game.page.waitForTimeout(600);

    const readNotationElements = () => game.page.evaluate(() =>
      Array.from(document.querySelectorAll('.notation'))
        .filter((el) => el.offsetParent !== null)
        .map((el) => el.textContent.trim())
        .filter((text) => /\d/.test(text)));

    await game.withMods((m) => m.cg.setNotationType('normalCondensed'));
    await game.page.waitForTimeout(600);
    const condensed = await readNotationElements();

    await game.withMods((m) => m.cg.setNotationType('normal'));
    await game.page.waitForTimeout(600);
    const normal = await readNotationElements();

    await game.withMods((m) => m.cg.setNotationType('normalCondensed'));

    expect(condensed.length).toBeGreaterThan(0);
    expect(normal.length).toBeGreaterThan(0);
    // The two modes must actually render differently somewhere on screen; if
    // nothing changed, the frame loop is not reformatting on a setting change.
    const changed = normal.some((text, index) => text !== condensed[index]);
    expect(changed).toBe(true);
    // Only the condensed mode emits magnitude suffixes.
    expect(normal.some((text) => /\d(K|M|B|e\d)/.test(text))).toBe(false);
  });

  test('the plain mode renders thousands separators and no suffixes', async ({ game }) => {
    await game.prepareRunForStarshipLaunch();
    await game.withMods((m) => m.cg.setNotationType('normal'));
    await game.openTab(1);
    await game.page.waitForTimeout(800);

    // Notation elements carry units and labels alongside the figure, so pull the
    // numeric tokens out rather than requiring the whole string to be a number.
    const numbers = await game.page.evaluate(() =>
      Array.from(document.querySelectorAll('.notation'))
        .filter((el) => el.offsetParent !== null)
        .flatMap((el) => el.textContent.match(/\d[\d,]*(?:\.\d+)?/g) ?? []));

    await game.withMods((m) => m.cg.setNotationType('normalCondensed'));

    expect(numbers.length).toBeGreaterThan(0);
    const fourDigitsOrMore = numbers.filter((text) => text.replace(/[.,]/g, '').length > 3);
    // Any value past a thousand must be grouped, which is the whole point of
    // the plain mode.
    for (const text of fourDigitsOrMore) {
      expect(text, `${text} should be comma-grouped`).toMatch(/,/);
    }
  });

  test('no NaN, Infinity or undefined ever reaches a rendered number', async ({ game }) => {
    await game.prepareRunForStarshipLaunch();

    const offenders = [];
    for (const mode of NOTATION_MODES) {
      await game.withMods((m, notation) => m.cg.setNotationType(notation), mode);
      for (let tab = 1; tab <= 9; tab++) {
        await game.openTab(tab);
        const found = await game.page.evaluate((notationMode) =>
          Array.from(document.querySelectorAll('.notation, .stats-text, .option-row-description'))
            .filter((el) => el.offsetParent !== null)
            .map((el) => el.textContent.trim())
            .filter((text) => /\bNaN\b|\bInfinity\b|\bundefined\b|\[object Object\]/.test(text))
            .map((text) => `${notationMode}: ${text.slice(0, 80)}`), mode);
        offenders.push(...found);
      }
    }

    await game.withMods((m) => m.cg.setNotationType('normalCondensed'));
    expect(offenders).toEqual([]);
  });

  test('the notation preference survives a save/load round trip', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.cg.setNotationType('normal');
      const savedNormal = JSON.parse(JSON.stringify(m.cg.captureGameStatusForSaving('initialise')));

      m.cg.setNotationType('normalCondensed');
      const savedCondensed = JSON.parse(JSON.stringify(m.cg.captureGameStatusForSaving('initialise')));

      return { normal: savedNormal.notationType, condensed: savedCondensed.notationType };
    });

    expect(result.normal).toBe('normal');
    expect(result.condensed).toBe('normalCondensed');
  });

  test('formatting is stable: re-running the formatter on its own output changes nothing further', async ({ game }) => {
    // The frame loop re-applies the formatter to elements it already formatted,
    // so a formatter that is not idempotent would compound its own output —
    // "1.5K" becoming "1.5" and then drifting on every subsequent frame.
    await game.prepareRunForStarshipLaunch();
    await game.openTab(1);
    await game.page.waitForTimeout(800);

    const first = await game.page.evaluate(() =>
      Array.from(document.querySelectorAll('.notation'))
        .filter((el) => el.offsetParent !== null && /\d/.test(el.textContent))
        .map((el) => el.textContent.trim()));

    // Quantities that are still ticking will legitimately move, so compare the
    // *shape* of each rendering rather than its exact value.
    await game.page.waitForTimeout(1200);
    const second = await game.page.evaluate(() =>
      Array.from(document.querySelectorAll('.notation'))
        .filter((el) => el.offsetParent !== null && /\d/.test(el.textContent))
        .map((el) => el.textContent.trim()));

    const shape = (text) => text.replace(/\d/g, '#');
    expect(first.length).toBeGreaterThan(0);
    expect(second.length).toBe(first.length);
    for (let i = 0; i < first.length; i++) {
      // A suffix must not appear or vanish spontaneously, and no value may pick
      // up a second suffix such as "1.5KK".
      expect(second[i]).not.toMatch(/(K|M|B){2}/);
      expect(shape(second[i]).replace(/#/g, '').length,
        `"${first[i]}" -> "${second[i]}" changed formatting shape`)
        .toBe(shape(first[i]).replace(/#/g, '').length);
    }
  });
});
