/**
 * Area: Localization
 * Plan: tests/docs/areas/localization.md
 * Feature status: docs/localization/status.md (item 2)
 *
 * `reverseLocalizeForCompounds()` maps a translated compound name back to its
 * internal key. It is reached from `compoundCostSellCreateChecks()` via
 * `checkStatusAndSetTextClasses()`, which `gameLoop` runs over every cached
 * element on the Compounds tab **every frame** — so both its correctness and its
 * cost are frame-budget concerns, not cosmetic ones.
 *
 * These specs pin the behavioural contract first, so the performance work has
 * something to be safe against: in particular that the function honours the
 * `language` argument it is given rather than whatever language is currently
 * active, which any caching strategy has to respect.
 */
import { test, expect } from '../_harness/game-fixture.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const CATALOGUE = JSON.parse(fs.readFileSync(path.join(ROOT, 'localization.json'), 'utf8'));

const LANGUAGES = ['en', 'es', 'de', 'it', 'fr'];
const COMPOUNDS = ['diesel', 'glass', 'concrete', 'steel', 'water', 'titanium'];

/**
 * Cost ceiling for the hot path, in milliseconds for `LOOKUP_ITERATIONS` calls.
 *
 * A full `Object.entries()` walk of the 1,626-key table with `toLowerCase()` on
 * both sides costs roughly 650ms for this many calls; an indexed lookup costs
 * under a millisecond. The budget sits far enough above the indexed cost to be
 * immune to a slow CI machine, and far enough below the scanning cost that the
 * regression cannot creep back in unnoticed.
 */
const LOOKUP_ITERATIONS = 2000;
const LOOKUP_BUDGET_MS = 150;

test.describe('Localization — compound reverse lookup', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('every translated compound name maps back to its internal key', async ({ game }) => {
    const failures = await game.withMods(async (m, { languages, compounds }) => {
      const problems = [];
      for (const lang of languages) {
        await m.loc.initLocalization(lang);
        for (const key of compounds) {
          const locKey = `compound${key.charAt(0).toUpperCase()}${key.slice(1)}`;
          const translated = m.loc.localize(locKey, lang);
          const back = m.loc.reverseLocalizeForCompounds(translated, lang);
          if (String(back) !== key) problems.push(`${lang}: "${translated}" -> "${back}" (expected "${key}")`);
        }
      }
      await m.loc.initLocalization('en');
      return problems;
    }, { languages: LANGUAGES, compounds: COMPOUNDS });

    expect(failures).toEqual([]);
  });

  test('the language argument is honoured, not the currently active language', async ({ game }) => {
    // The single most important constraint on any caching strategy here: the
    // function is called with an explicit language, and `compoundCostSellCreateChecks`
    // passes `getLanguage()`. A cache keyed on "whatever was last initialised"
    // would pass every other spec in this file and still be wrong.
    const results = await game.withMods(async (m) => {
      await m.loc.initLocalization('fr');

      return {
        // Active language is French; ask about German and Italian names.
        germanWhileFrench: m.loc.reverseLocalizeForCompounds('Glas', 'de'),
        italianWhileFrench: m.loc.reverseLocalizeForCompounds('Vetro', 'it'),
        frenchWhileFrench: m.loc.reverseLocalizeForCompounds('Verre', 'fr'),
        // A German name asked about in French must NOT resolve.
        germanAskedAsFrench: m.loc.reverseLocalizeForCompounds('Glas', 'fr')
      };
    });

    expect(results.germanWhileFrench).toBe('glass');
    expect(results.italianWhileFrench).toBe('glass');
    expect(results.frenchWhileFrench).toBe('glass');
    expect(results.germanAskedAsFrench).toBe('Glas');
  });

  test('lookup is case-insensitive in both directions', async ({ game }) => {
    // The live caller feeds it a name parsed out of description text and
    // lower-cased, so the incoming value never matches the catalogue's casing.
    const results = await game.withMods(async (m) => {
      await m.loc.initLocalization('de');
      return {
        lower: m.loc.reverseLocalizeForCompounds('glas', 'de'),
        upper: m.loc.reverseLocalizeForCompounds('GLAS', 'de'),
        mixed: m.loc.reverseLocalizeForCompounds('gLaS', 'de'),
        exact: m.loc.reverseLocalizeForCompounds('Glas', 'de')
      };
    });

    expect(results).toEqual({ lower: 'glass', upper: 'glass', mixed: 'glass', exact: 'glass' });
  });

  test('an unknown name is returned unchanged', async ({ game }) => {
    const results = await game.withMods((m) => ({
      unknown: m.loc.reverseLocalizeForCompounds('definitelyNotACompound', 'en'),
      empty: m.loc.reverseLocalizeForCompounds('', 'en'),
      word: m.loc.reverseLocalizeForCompounds('Cash', 'en'),
      symbol: m.loc.reverseLocalizeForCompounds('$', 'en')
    }));

    expect(results.unknown).toBe('definitelyNotACompound');
    expect(results.empty).toBe('');
    expect(results.word).toBe('Cash');
    expect(results.symbol).toBe('$');
  });

  test('a bare quantity collides with the compoundCreateQty family', async ({ game }) => {
    // Documented current behaviour, not desired behaviour. Every key starting
    // `compound` is eligible, which includes `compoundCreateQty500` — whose
    // English value is the string "500". The live caller feeds this function the
    // last whitespace-separated word of a description line, so a line ending in
    // a bare number resolves to a data-object path that does not exist.
    //
    // Harmless today because the only lines that reach it end in a compound
    // name. Pinned here so that changing the lookup's shape cannot alter it by
    // accident, and so that fixing it is a deliberate, visible change.
    // See tests/docs/known-issues.md #8.
    const results = await game.withMods((m) => ({
      fiveHundred: m.loc.reverseLocalizeForCompounds('500', 'en'),
      one: m.loc.reverseLocalizeForCompounds('1', 'en')
    }));

    expect(results.fiveHundred).toBe('createqty500');
    expect(results.one).toBe('createqty1');
  });

  test('a non-compound catalogue value never resolves to a compound key', async ({ game }) => {
    // Only keys beginning `compound` are eligible. A resource name that happens
    // to collide must fall through untouched rather than silently reading the
    // wrong entry out of the data object every frame.
    const results = await game.withMods(async (m, resources) => {
      await m.loc.initLocalization('en');
      const out = {};
      for (const name of resources) {
        const locKey = `resource${name.charAt(0).toUpperCase()}${name.slice(1)}`;
        const translated = m.loc.localize(locKey, 'en');
        out[name] = m.loc.reverseLocalizeForCompounds(translated, 'en');
      }
      return out;
    }, ['hydrogen', 'helium', 'carbon', 'neon', 'oxygen', 'sodium', 'silicon', 'iron']);

    for (const [name, resolved] of Object.entries(results)) {
      expect(COMPOUNDS, `resource "${name}" resolved to compound key "${resolved}"`).not.toContain(resolved);
    }
  });

  test('an unknown language is returned unchanged rather than throwing', async ({ game }) => {
    const result = await game.withMods((m) => ({
      unknownLanguage: m.loc.reverseLocalizeForCompounds('Glass', 'ja'),
      nullLanguage: m.loc.reverseLocalizeForCompounds('Glass', null),
      undefinedLanguage: m.loc.reverseLocalizeForCompounds('Glass', undefined)
    }));

    expect(result.unknownLanguage).toBe('Glass');
    expect(result.nullLanguage).toBe('Glass');
    expect(result.undefinedLanguage).toBe('Glass');
  });

  test('the resolved key is always a real compound in the data object', async ({ game }) => {
    // The value is used directly as a data-object path segment. A key the data
    // object does not carry silently yields `undefined` for the quantity, which
    // makes an affordable upgrade render as unaffordable.
    const dangling = await game.withMods(async (m, languages) => {
      const known = new Set(Object.keys(m.rdo.getResourceDataObject('compounds') || {}));
      const bad = [];

      for (const lang of languages) {
        await m.loc.initLocalization(lang);
        for (const compound of ['diesel', 'glass', 'concrete', 'steel', 'water', 'titanium']) {
          const locKey = `compound${compound.charAt(0).toUpperCase()}${compound.slice(1)}`;
          const resolved = m.loc.reverseLocalizeForCompounds(m.loc.localize(locKey, lang), lang);
          if (!known.has(resolved)) bad.push(`${lang}: ${resolved}`);
        }
      }
      await m.loc.initLocalization('en');
      return bad;
    }, LANGUAGES);

    expect(dangling).toEqual([]);
  });

  test('lookup stays correct after a language change', async ({ game }) => {
    // Exercises invalidation: whatever the function memoises must survive the
    // catalogue being re-fetched and the active language moving underneath it.
    const results = await game.withMods(async (m) => {
      const trace = [];
      for (const lang of ['en', 'de', 'fr', 'de', 'it', 'en']) {
        await m.loc.initLocalization(lang);
        const translated = m.loc.localize('compoundConcrete', lang);
        trace.push({ lang, translated, back: m.loc.reverseLocalizeForCompounds(translated, lang) });
      }
      return trace;
    });

    for (const entry of results) {
      expect(entry.back, `${entry.lang}: "${entry.translated}" -> "${entry.back}"`).toBe('concrete');
    }
    // And the translations really did differ, or the test proved nothing.
    expect(new Set(results.map((r) => r.translated)).size).toBeGreaterThan(1);
  });

  test('lookup cost stays within the frame budget', async ({ game }) => {
    // status.md item 2. The frame loop calls this for every compound cost
    // element it has cached, sixty times a second, so a linear scan of the
    // catalogue is spent budget that grows with every key translators add.
    const measurement = await game.withMods(async (m, { iterations, compounds }) => {
      await m.loc.initLocalization('de');

      const names = compounds.map((c) =>
        m.loc.localize(`compound${c.charAt(0).toUpperCase()}${c.slice(1)}`, 'de'));

      // Warm up so the measurement is not dominated by first-call JIT.
      for (let i = 0; i < 50; i++) m.loc.reverseLocalizeForCompounds(names[i % names.length], 'de');

      const start = performance.now();
      let sink = '';
      for (let i = 0; i < iterations; i++) {
        sink = m.loc.reverseLocalizeForCompounds(names[i % names.length], 'de');
      }
      const elapsed = performance.now() - start;

      await m.loc.initLocalization('en');
      return { elapsed, sink };
    }, { iterations: LOOKUP_ITERATIONS, compounds: COMPOUNDS });

    // Guard against the measurement being optimised away entirely.
    expect(COMPOUNDS).toContain(measurement.sink);
    expect(
      measurement.elapsed,
      `${LOOKUP_ITERATIONS} reverse lookups took ${measurement.elapsed.toFixed(1)}ms ` +
      `(budget ${LOOKUP_BUDGET_MS}ms) — this runs inside the 60fps frame loop`
    ).toBeLessThan(LOOKUP_BUDGET_MS);
  });

  test('a miss costs no more than a hit', async ({ game }) => {
    // A miss is the common case in the live caller: most description lines have
    // no second compound at all, so the parsed word is not a compound name. A
    // linear scan makes the miss the *worst* case, since it walks every key.
    const measurement = await game.withMods(async (m, iterations) => {
      await m.loc.initLocalization('de');

      const hitStart = performance.now();
      for (let i = 0; i < iterations; i++) m.loc.reverseLocalizeForCompounds('Glas', 'de');
      const hit = performance.now() - hitStart;

      const missStart = performance.now();
      for (let i = 0; i < iterations; i++) m.loc.reverseLocalizeForCompounds('nichtVorhanden', 'de');
      const miss = performance.now() - missStart;

      await m.loc.initLocalization('en');
      return { hit, miss };
    }, LOOKUP_ITERATIONS);

    expect(
      measurement.miss,
      `miss ${measurement.miss.toFixed(1)}ms vs hit ${measurement.hit.toFixed(1)}ms`
    ).toBeLessThan(LOOKUP_BUDGET_MS);
  });
});

test.describe('Localization — compound cost rows keep the internal key', () => {
  // The Water storage upgrade is the one row in the game whose cost names a
  // second compound, which makes it the only place `argumentCheckQuantity2` is
  // ever populated — and therefore the only place the frame loop used to need a
  // reverse lookup at all.
  const ROW_ID = 'waterWaterIncreaseStorageRowDescription';
  const SECONDARY_KEY = 'concrete';

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
  });

  test('the row stores an internal compound key, not a translated name', async ({ game, page }) => {
    test.setTimeout(180_000);

    // This is the fix for status.md item 2: the key is resolved once when the
    // row is built, so `compoundCostSellCreateChecks` can index the data object
    // directly instead of reverse-mapping a display name every frame.
    const observed = [];

    for (const language of LANGUAGES) {
      await game.openTab(4);
      await page.evaluate(() => {
        const target = document.querySelector('[class~="tab4.option5"]');
        target?.classList.remove('invisible');
        target?.closest('.row-side-menu')?.classList.remove('invisible');
        target?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      await page.waitForTimeout(300);
      await game.withMods((m, l) => m.ui.relocalizeAll(l), language);
      // The frame loop rewrites this row's spans; give it time to settle or the
      // assertion catches a half-rendered intermediate state.
      await page.waitForTimeout(900);

      observed.push({
        language,
        ...(await page.evaluate((id) => {
          const el = document.getElementById(id);
          return {
            primary: el?.dataset.argumentCheckQuantity ?? null,
            secondary: el?.dataset.argumentCheckQuantity2 ?? null,
            // Read the row itself rather than the `secondaryCompoundPriceText`
            // span: that span only exists once the frame loop has rewritten the
            // row, and the assertion is about what the player reads either way.
            rowText: el?.innerText ?? ''
          };
        }, ROW_ID))
      });
    }

    const problems = [];
    for (const row of observed) {
      if (row.primary !== 'water') problems.push(`${row.language}: primary key was "${row.primary}"`);
      // Language-independent, so the row survives a language change even if it
      // is never redrawn.
      if (row.secondary !== SECONDARY_KEY) {
        problems.push(`${row.language}: secondary key was "${row.secondary}" (expected "${SECONDARY_KEY}")`);
      }
      // Both compound names are still rendered translated, so the internal key
      // did not leak into the label — and the secondary cost is still there at
      // all, which it would not be if the display path could no longer resolve
      // an internal key back to a name.
      //
      // The secondary half of this assertion also covers the frame loop actually
      // reaching this row: `checkStatusAndSetTextClasses` gates on
      // `getCurrentTab()[1].includes('Compounds')`, so it only holds in every
      // language because the stored tab identity is the canonical English name.
      for (const key of ['compoundWater', 'compoundConcrete']) {
        const expectedName = CATALOGUE[row.language][key];
        if (!row.rowText.includes(expectedName)) {
          problems.push(`${row.language}: row "${row.rowText}" missing "${expectedName}"`);
        }
      }

      // The misplaced-paren bug in `getAllDynamicDescriptionElements` handed the
      // whole compounds object to the price formatter, so the row read
      // "[object Object] Wasser". It was invisible in English only because the
      // frame loop overwrote the row a moment later.
      if (row.rowText.includes('[object')) {
        problems.push(`${row.language}: row rendered an object: "${row.rowText}"`);
      }
    }

    expect(problems).toEqual([]);
    expect(game.significantErrors()).toEqual([]);
  });
});
