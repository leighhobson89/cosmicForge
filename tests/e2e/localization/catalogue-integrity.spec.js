/**
 * Area: Localization
 * Plan: tests/docs/areas/localization.md
 * Feature status: docs/localization/status.md
 *
 * Integrity of `localization.json` itself. These specs need no browser — the
 * catalogue is a data file, and asserting against it directly is both faster and
 * far more precise than inferring the same facts from rendered text.
 *
 * The localization feature is only half built, so several assertions here are
 * deliberately written as *ratchets* against a recorded baseline rather than as
 * absolutes. A ratchet fails when the situation gets worse and quietly tolerates
 * it getting better, which is what a half-finished feature actually needs: it
 * stops regressions without demanding the remaining work be done first. Each one
 * names the status.md item it belongs to, so tightening the number is part of
 * closing that item.
 */
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const CATALOGUE_PATH = path.join(ROOT, 'localization.json');

const require = createRequire(import.meta.url);

const LANGUAGES = ['en', 'es', 'de', 'it', 'fr'];
const REFERENCE = 'en';

const RAW = fs.readFileSync(CATALOGUE_PATH, 'utf8');
const CATALOGUE = JSON.parse(RAW);

/**
 * The three keys that are intentionally empty in every language: casino special
 * prize notifications whose suffix is supplied at runtime. Asserted as an exact
 * set so a *fourth* empty value — an untranslated string someone forgot — fails.
 * status.md item 7 wants the checker to reject empty values outright; until then
 * this pins the sanctioned exceptions.
 */
const SANCTIONED_EMPTY_KEYS = [
  'casinoNotificationSpecialPrizeRocketWarpedSuffix',
  'casinoNotificationSpecialPrizeStarshipFinishedSuffix',
  'casinoNotificationSpecialPrizeStarshipWarpedSuffix'
];

/**
 * Ratchet for status.md item 8 (translation quality). Values byte-identical to
 * English per language. Many are legitimately identical — proper nouns, star
 * names, chemical symbols — so the number cannot go to zero, but it must never
 * grow without a reason recorded here: an identical value is usually an
 * untranslated placeholder.
 *
 * Raised once, when the index.html and onboarding strings were extracted. Every
 * addition is a word that is genuinely the same in that language:
 *   es 35 -> 37   "AP:" (statLabelAscendencyPoints), "NO" (buttonNo)
 *   de 41 -> 42   "AP:"
 *   it 37 -> 39   "AP:", "NO"
 *   fr 44 -> 45   "Options" (categoryOptions)
 *
 * Raised again while extracting the drawTab*Content literals, which added ~570
 * keys. Every addition below is a word that is genuinely the same in that
 * language — currency names, the theme proper nouns, and units:
 *   es 37 -> 48   "Solar", "Euro", "Yen", "Won", "Normal" (notation and star-map
 *                 mode), "Terminal", "Supernova", "Neutral", "Bitcoin (₿)"
 *   de 42 -> 60   the same set plus "Dollar ($)", "Notation:", "Land:",
 *                 "Industrial"/"Normal" variants and the German-identical
 *                 megastructure stage words
 *   it 39 -> 46   "Euro", "Yen", "Won", "Bitcoin (₿)", "Supernova", "Rare",
 *                 "Intelligence:"
 *   fr 45 -> 72   the currency block, "Terminal", "Supernova", "Distance",
 *                 "Rare", "Notation:", "Traits:", "Air:", "Type", "2 Minutes"
 *                 through "10 Minutes"
 *
 * These are the numbers a native-reader pass (item 8) should bring down; none
 * of them may rise without a line added here.
 *
 * Raised again by the support-file extraction (item 5, second half: game.js,
 * ui.js, events.js, constantsAndGlobalVars.js, resourceDataObject.js). The
 * additions are terms that genuinely coincide across these languages:
 *   es 48 -> 50   "BOOST", "Opinion: 0%"
 *   de 60 -> 66   "BOOST", "Instant", "Story - Leigh Hobson", "CPC Tech I/II/…"
 *                 and the other credit lines that are proper nouns
 *   it 46 -> 50   "BOOST", "Rifornimento", "No", "Stock"
 *   fr 72 -> 79   "BOOST", "Stock", "stable", "Instabilité", "Opinion: 0%",
 *                 "Hypercharge", "Impression: {value}%"
 */
const IDENTICAL_TO_ENGLISH_CEILING = { es: 50, de: 66, it: 50, fr: 79 };

/**
 * status.md item 7 used to be a ratchet here: a count of keys that appear as no
 * quoted literal in shipped source, allowed to fall but never rise. It peaked at
 * 59, and the whole reason it could not go to zero was that the checker could not
 * see keys built by concatenation, so 39 live keys were indistinguishable from 20
 * dead ones and none could be pruned safely.
 *
 * `validateLocalization.cjs` now resolves the five constructed families from the
 * same source the game builds them from, which told the two groups apart. The 20
 * dead keys were deleted and the ratchet became the absolute below: nothing may
 * be unreachable at all. A new constructed family means teaching the checker that
 * family, not raising a number.
 */
const CONSTRUCTED_FAMILY_SIZES = {
  'starShipModule*': 5,
  'fleetShip*': 5,
  'buffName*': 15,
  'eventName*': 13
};

/**
 * Keys allowed to carry an unbalanced HTML tag. **Empty, deliberately** — see
 * tests/docs/known-issues.md #9, which was the last entry here. Keeping the list
 * empty is itself the assertion: any key whose markup does not balance is a
 * regression to fix in the catalogue, not an item to add below.
 */
const KNOWN_UNBALANCED_KEYS = [];

/** Source files the shipped game actually loads. Excludes builds/dist/tests. */
function shippedSourceFiles() {
  return fs
    .readdirSync(ROOT)
    .filter((f) => f.endsWith('.js') || f.endsWith('.html'))
    .map((f) => path.join(ROOT, f));
}

function allShippedSource() {
  return shippedSourceFiles()
    .map((f) => fs.readFileSync(f, 'utf8'))
    .join('\n');
}

test.describe('Localization — catalogue integrity', () => {
  test('every supported language section exists and is populated', async () => {
    const shape = LANGUAGES.map((lang) => ({
      lang,
      present: Boolean(CATALOGUE[lang]),
      keys: CATALOGUE[lang] ? Object.keys(CATALOGUE[lang]).length : 0
    }));

    expect(shape.filter((s) => !s.present)).toEqual([]);
    expect(shape.filter((s) => s.keys < 1000)).toEqual([]);
  });

  test('validateLocalization.cjs passes as an assertion, not just a script', async () => {
    // The plan calls for the project's own checker to run in CI rather than by
    // hand. It logs to stdout and returns a boolean; we assert the boolean.
    const { checkLocalizationConsistency, LANGUAGES: checkerLanguages } =
      require(path.join(ROOT, 'validateLocalization.cjs'));

    // The checker must cover the same language set the game supports, or a
    // passing run proves less than it appears to.
    expect([...checkerLanguages].sort()).toEqual([...LANGUAGES].sort());
    expect(checkLocalizationConsistency()).toBe(true);
  });

  test('all five languages have byte-identical key sets', async () => {
    // Duplicates validateLocalization.cjs deliberately: this reports the actual
    // differing keys in the failure message, which the script only prints.
    const referenceKeys = new Set(Object.keys(CATALOGUE[REFERENCE]));
    const differences = [];

    for (const lang of LANGUAGES) {
      if (lang === REFERENCE) continue;
      const keys = new Set(Object.keys(CATALOGUE[lang]));
      for (const key of referenceKeys) if (!keys.has(key)) differences.push(`${lang}: missing ${key}`);
      for (const key of keys) if (!referenceKeys.has(key)) differences.push(`${lang}: extra ${key}`);
    }

    expect(differences).toEqual([]);
  });

  test('every value in every language is a string', async () => {
    // localize() calls .replace() and .includes() on whatever it finds, so a
    // number, null or nested object is a TypeError at render time.
    const bad = [];
    for (const lang of LANGUAGES) {
      for (const [key, value] of Object.entries(CATALOGUE[lang])) {
        if (typeof value !== 'string') bad.push(`${lang}:${key} is ${value === null ? 'null' : typeof value}`);
      }
    }
    expect(bad).toEqual([]);
  });

  test('only the sanctioned keys are empty, in every language', async () => {
    const unexpected = [];
    for (const lang of LANGUAGES) {
      const empty = Object.entries(CATALOGUE[lang])
        .filter(([, value]) => String(value).trim() === '')
        .map(([key]) => key)
        .sort();

      for (const key of empty) {
        if (!SANCTIONED_EMPTY_KEYS.includes(key)) unexpected.push(`${lang}:${key}`);
      }
      // The sanctioned three must also still be present in every language, so a
      // deletion in one language cannot silently drift the set.
      for (const key of SANCTIONED_EMPTY_KEYS) {
        if (!(key in CATALOGUE[lang])) unexpected.push(`${lang}:${key} missing entirely`);
      }
    }
    expect(unexpected).toEqual([]);
  });

  test('no value contains a template literal, keeping the eval() path dead', async () => {
    // status.md item 6: localize() runs eval() on any value containing `${…}`.
    // Nothing uses it today, which is the only reason the path is safe. This
    // spec fails the moment a translator re-arms it.
    const armed = [];
    for (const lang of LANGUAGES) {
      for (const [key, value] of Object.entries(CATALOGUE[lang])) {
        if (String(value).includes('${')) armed.push(`${lang}:${key}`);
      }
    }
    expect(armed).toEqual([]);
  });

  test('every key is a plain camelCase identifier', async () => {
    // The "no raw key on screen" sweep identifies leaked keys by their shape.
    // That detection is only sound while every key actually has that shape.
    const malformed = Object.keys(CATALOGUE[REFERENCE]).filter((k) => !/^[A-Za-z][A-Za-z0-9_]*$/.test(k));
    expect(malformed).toEqual([]);
  });

  test('the raw file declares each key exactly once per language', async () => {
    // JSON.parse silently keeps the last of a duplicated key, so parity checks
    // cannot see a duplicate at all. Count declarations in the raw text instead.
    const duplicates = [];

    for (const lang of LANGUAGES) {
      const start = RAW.indexOf(`"${lang}": {`);
      expect(start, `language block "${lang}" not found in raw JSON`).toBeGreaterThan(-1);

      // Walk braces from the opening one to find this language's block exactly.
      const open = RAW.indexOf('{', start);
      let depth = 0;
      let end = open;
      for (let i = open; i < RAW.length; i++) {
        if (RAW[i] === '{') depth++;
        else if (RAW[i] === '}') {
          depth--;
          if (depth === 0) { end = i; break; }
        }
      }

      const block = RAW.slice(open, end);
      const seen = new Map();
      for (const match of block.matchAll(/^\s*"([A-Za-z][A-Za-z0-9_]*)"\s*:/gm)) {
        seen.set(match[1], (seen.get(match[1]) ?? 0) + 1);
      }
      for (const [key, count] of seen) {
        if (count > 1) duplicates.push(`${lang}:${key} declared ${count} times`);
      }

      // Sanity: the walk must have found the whole block, not a fragment.
      expect(seen.size, `raw scan of "${lang}" found too few keys`)
        .toBe(Object.keys(CATALOGUE[lang]).length);
    }

    expect(duplicates).toEqual([]);
  });

  test('every key referenced literally in shipped source exists in the catalogue', async () => {
    // A missing key does not throw: localize() returns the key itself, so the
    // player sees `headerMainDiesel` on screen. This is the direction that must
    // stay at absolute zero.
    const source = allShippedSource();
    const missing = [];
    const referenced = new Set();

    // Only match `localize('key')` / `localize("key", lang)` — a literal
    // followed by `+` is a concatenation prefix, not a whole key.
    for (const match of source.matchAll(/localize\(\s*['"]([A-Za-z0-9_]+)['"]\s*[,)]/g)) {
      referenced.add(match[1]);
      if (!(match[1] in CATALOGUE[REFERENCE])) missing.push(match[1]);
    }

    expect(referenced.size).toBeGreaterThan(1000);
    expect([...new Set(missing)]).toEqual([]);
  });

  test('no key in the catalogue is unreachable from shipped source', async () => {
    // status.md item 7, now an absolute rather than a ratchet. A key nothing can
    // reach is a string that will never render; the checker resolves the five
    // constructed families itself, so a key it still cannot account for is dead.
    const { auditKeyReferences } = require(path.join(ROOT, 'validateLocalization.cjs'));
    const audit = auditKeyReferences();

    expect(audit.unreferenced, 'keys nothing in shipped source can reach').toEqual([]);
    expect(audit.orphanedByFamily, 'keys shaped like a constructed family that it cannot build').toEqual([]);
  });

  test('every key the source asks for exists, including the constructed ones', async () => {
    // The other direction, and the one a player actually sees: a key the source
    // builds but the catalogue lacks renders as the key itself.
    const { auditKeyReferences } = require(path.join(ROOT, 'validateLocalization.cjs'));
    const audit = auditKeyReferences();

    expect(audit.missing, 'keys the source asks for that the catalogue has not got').toEqual([]);
  });

  test('the checker resolves each constructed key family from source', async () => {
    // The families are the whole basis on which "unreachable" is judged. If one
    // silently resolved to nothing — a renamed declaration, a changed literal
    // shape — every key it covers would be reported as dead and invite deletion.
    const { resolveConstructedKeys } = require(path.join(ROOT, 'validateLocalization.cjs'));
    const { families } = resolveConstructedKeys();

    const sizes = Object.fromEntries(families.map((f) => [f.name, f.keys.length]));
    for (const [name, expected] of Object.entries(CONSTRUCTED_FAMILY_SIZES)) {
      expect(sizes[name], `family ${name} resolved ${sizes[name]} keys`).toBe(expected);
    }

    // The material-name family grows with the data files, so it is asserted as a
    // floor rather than an exact count — but it must never resolve to nothing.
    const materials = families.find((f) => f.name.startsWith('resource* / compound*'));
    expect(materials.keys.length).toBeGreaterThanOrEqual(15);
    expect(materials.keys).toContain('resourceSolar');
  });

  test('validateLocalization.cjs rejects an empty value that is not sanctioned', async () => {
    // status.md item 7 also asked the checker to fail on empty values outright,
    // with the casino suffixes as the only exceptions.
    const { checkEmptyValues, SANCTIONED_EMPTY_KEYS: checkerSanctioned } =
      require(path.join(ROOT, 'validateLocalization.cjs'));

    expect([...checkerSanctioned].sort()).toEqual([...SANCTIONED_EMPTY_KEYS].sort());
    expect(checkEmptyValues().ok).toBe(true);

    // A doctored catalogue must fail, or the check proves nothing.
    const doctored = JSON.parse(RAW);
    doctored.de[Object.keys(doctored.de)[0]] = '   ';
    expect(checkEmptyValues(doctored).ok).toBe(false);
  });

  test('untranslated values do not grow beyond the recorded baseline', async () => {
    // status.md item 8. Ceiling per language; a native-reader pass should lower
    // these numbers, and nothing should ever raise them.
    const growth = [];
    for (const lang of LANGUAGES) {
      if (lang === REFERENCE) continue;
      const identical = Object.keys(CATALOGUE[REFERENCE])
        .filter((k) => CATALOGUE[lang][k] === CATALOGUE[REFERENCE][k]);

      if (identical.length > IDENTICAL_TO_ENGLISH_CEILING[lang]) {
        growth.push(`${lang}: ${identical.length} identical to English (ceiling ${IDENTICAL_TO_ENGLISH_CEILING[lang]})`);
      }
    }
    expect(growth).toEqual([]);
  });

  test('dynamically constructed keys resolve for every resource and compound', async () => {
    // ui.js builds `resource${Name}` and `compound${Name}` by concatenation, so
    // the parity checker cannot see them. If one is missing, that row renders
    // its internal key as a label — in one language only, if the gap is partial.
    const resources = ['hydrogen', 'helium', 'carbon', 'neon', 'oxygen', 'sodium', 'silicon', 'iron'];
    const compounds = ['diesel', 'glass', 'concrete', 'steel', 'water', 'titanium'];
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    const missing = [];
    for (const lang of LANGUAGES) {
      for (const key of [...resources.map((r) => `resource${cap(r)}`), ...compounds.map((c) => `compound${cap(c)}`)]) {
        const value = CATALOGUE[lang][key];
        if (!value || !String(value).trim()) missing.push(`${lang}:${key}`);
      }
    }
    expect(missing).toEqual([]);
  });

  test('every autoBuyerName key referenced through the migration map exists', async () => {
    // Auto-buyer labels resolve through the rename map in patches.js, so the
    // key that ends up at localize() may not appear anywhere as a literal.
    const patches = fs.readFileSync(path.join(ROOT, 'patches.js'), 'utf8');
    const names = new Set();
    for (const match of patches.matchAll(/['"]([a-z][A-Za-z0-9]*(?:AB\d|Advanced|Industrial|Quantum|Compressor|Extractor|Burner|Collector|Harvester|Pump|Drill))['"]/g)) {
      names.add(match[1]);
    }

    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    const missing = [];
    for (const name of names) {
      const key = `autoBuyerName${cap(name)}`;
      // Only assert on names the catalogue is actually expected to carry: a
      // name present in English must be present in all five.
      if (!(key in CATALOGUE[REFERENCE])) continue;
      for (const lang of LANGUAGES) {
        if (!CATALOGUE[lang][key] || !String(CATALOGUE[lang][key]).trim()) missing.push(`${lang}:${key}`);
      }
    }
    expect(missing).toEqual([]);
  });

  test('the autoBuyerName family is complete across all five languages', async () => {
    const englishAutoBuyerKeys = Object.keys(CATALOGUE[REFERENCE]).filter((k) => k.startsWith('autoBuyerName'));
    expect(englishAutoBuyerKeys.length).toBeGreaterThan(20);

    const missing = [];
    for (const lang of LANGUAGES) {
      for (const key of englishAutoBuyerKeys) {
        if (!CATALOGUE[lang][key] || !String(CATALOGUE[lang][key]).trim()) missing.push(`${lang}:${key}`);
      }
    }
    expect(missing).toEqual([]);
  });

  test('no value carries an unbalanced HTML tag that would break a panel', async () => {
    // Values go through innerHTML in several places. An unclosed <strong> or
    // <span> from a translator swallows the rest of the panel.
    const unbalanced = [];
    for (const lang of LANGUAGES) {
      for (const [key, value] of Object.entries(CATALOGUE[lang])) {
        if (KNOWN_UNBALANCED_KEYS.includes(key)) continue;
        const text = String(value);
        for (const tag of ['strong', 'span', 'em', 'b', 'i', 'div']) {
          const open = (text.match(new RegExp(`<${tag}(\\s[^>]*)?>`, 'gi')) || []).length;
          const close = (text.match(new RegExp(`</${tag}>`, 'gi')) || []).length;
          if (open !== close) unbalanced.push(`${lang}:${key} <${tag}> ${open} open / ${close} close`);
        }
      }
    }
    expect(unbalanced).toEqual([]);
  });
});
