// Localization Key Checker
//
// Three checks, in the order a broken catalogue tends to break:
//
//   1. parity    — all languages declare exactly the same key set.
//   2. values    — no value is empty, except the sanctioned few.
//   3. wiring    — every key is reachable from the shipped source, and every key
//                  the source asks for exists.
//
// The wiring check is the interesting one. Most keys reach `localize()` as a
// quoted literal and are trivial to find, but a handful of families are built by
// concatenation at the call site, so no literal for them exists anywhere:
// `'starShipModule' + id.slice(2)`, `'buffName' + capitaliseString(buffKey)`,
// and so on. A checker that only looks for literals reports those as unused, and
// that false signal is what made pruning genuinely dead keys unsafe.
//
// So the families are *resolved* rather than excused: each one enumerates the
// exact key set its construction can produce, from the same source the game
// builds it from. That gives both directions. A key a family can produce but the
// catalogue lacks is a missing translation; a key that matches a family's shape
// but that the family cannot produce is dead. Neither is visible to a
// prefix-based allowlist.
//
// Run directly (`node validateLocalization.cjs`) to check, or with `--report` to
// print the full classification of every key.

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const LOCALIZATION_FILE = path.join(ROOT, 'localization.json');
const LANGUAGES = ['en', 'es', 'pt', 'de', 'it', 'fr'];
const REFERENCE = 'en';

const SANCTIONED_EMPTY_KEYS = [
    'casinoNotificationSpecialPrizeRocketWarpedSuffix',
    'casinoNotificationSpecialPrizeStarshipFinishedSuffix',
    'casinoNotificationSpecialPrizeStarshipWarpedSuffix'
];

const capitalise = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);

function readCatalogue() {
    const content = fs.readFileSync(LOCALIZATION_FILE, 'utf8');
    return JSON.parse(content);
}

function shippedSourceFiles() {
    return fs
        .readdirSync(ROOT)
        .filter((f) => f.endsWith('.js') || f.endsWith('.html'))
        .map((f) => path.join(ROOT, f));
}

function readSources() {
    const sources = {};
    for (const file of shippedSourceFiles()) {
        sources[path.basename(file)] = fs.readFileSync(file, 'utf8');
    }
    sources.__all = Object.values(sources).join('\n');
    return sources;
}

function objectLiteralBody(source, declaration) {
    const start = source.indexOf(declaration);
    if (start === -1) return '';

    const open = source.indexOf('{', start);
    if (open === -1) return '';

    let depth = 0;
    for (let i = open; i < source.length; i++) {
        if (source[i] === '{') depth++;
        else if (source[i] === '}') {
            depth--;
            if (depth === 0) return source.slice(open + 1, i);
        }
    }
    return '';
}

function topLevelKeys(body) {
    const keys = [];
    let depth = 0;
    for (const line of body.split('\n')) {
        if (depth === 0) {
            const match = line.match(/^\s*["']?([A-Za-z_][A-Za-z0-9_]*)["']?\s*:/);
            if (match) keys.push(match[1]);
        }
        for (const ch of line) {
            if (ch === '{' || ch === '[') depth++;
            else if (ch === '}' || ch === ']') depth--;
        }
    }
    return keys;
}

const CONSTRUCTED_KEY_FAMILIES = [
    {
        name: 'starShipModule*',
        builtBy: "drawTab5Content.js: localize('starShipModule' + id.slice(2))",
        owns: (key) => key.startsWith('starShipModule'),
        produce: (sources) => [...(sources['drawTab5Content.js'] || '').matchAll(/\{\s*id:\s*'(ss[A-Za-z0-9]+)'\s*\}/g)]
            .map((m) => `starShipModule${m[1].slice(2)}`)
    },
    {
        name: 'fleetShip*',
        builtBy: "drawTab5Content.js: localize('fleetShip' + id.slice('fleet'.length))",
        owns: (key) => key.startsWith('fleetShip'),
        produce: (sources) => [...(sources['drawTab5Content.js'] || '').matchAll(/\{\s*id:\s*'(fleet[A-Za-z0-9]+)'\s*\}/g)]
            .map((m) => `fleetShip${m[1].slice('fleet'.length)}`)
    },
    {
        name: 'buffName*',
        builtBy: "drawTab7Content.js: localize('buffName' + capitaliseString(buffKey))",
        owns: (key) => key.startsWith('buffName'),
        produce: (sources) => topLevelKeys(objectLiteralBody(sources['resourceDataObject.js'] || '', 'export let ascendencyBuffs'))
            .filter((k) => k !== 'version')
            .map((k) => `buffName${capitalise(k)}`)
    },
    {
        name: 'eventName*',
        builtBy: "events.js: localize('eventName' + id[0].toUpperCase() + id.slice(1))",
        owns: (key) => key.startsWith('eventName'),
        produce: (sources) => topLevelKeys(objectLiteralBody(sources['events.js'] || '', 'const randomEventDefinitions'))
            .map((id) => `eventName${capitalise(id)}`)
    },
    {
        name: 'resource* / compound* (localizeMaterialName)',
        builtBy: "localization.js: localize(prefix + capitalised) over the price and fuel tuples in resourceDataObject.js",
        owns: () => false,
        produce: (sources) => {
            const source = sources['resourceDataObject.js'] || '';
            const materialKey = (name, section) => (section === 'compounds' ? `compound${capitalise(name)}` : `resource${capitalise(name)}`);

            const prices = [...source.matchAll(/\[\s*\d+(?:\.\d+)?\s*,\s*'([a-z][A-Za-z0-9]*)'\s*,\s*'(resources|compounds)'\s*\]/g)]
                .map((m) => materialKey(m[1], m[2]));
            const fuels = [...source.matchAll(/fuel:\s*\[\s*'([a-z][A-Za-z0-9]*)'\s*,\s*\d+(?:\.\d+)?\s*,\s*'(resources|compounds)'\s*\]/g)]
                .map((m) => materialKey(m[1], m[2]));

            return [...prices, ...fuels];
        }
    }
];

function resolveConstructedKeys(sources = readSources()) {
    const produced = new Map();
    const families = [];

    for (const family of CONSTRUCTED_KEY_FAMILIES) {
        const keys = [...new Set(family.produce(sources))];
        families.push({ name: family.name, builtBy: family.builtBy, keys });
        for (const key of keys) {
            if (!produced.has(key)) produced.set(key, family.name);
        }
    }

    return { produced, families };
}

function literalKeys(sources = readSources()) {
    const literals = new Set();
    for (const match of sources.__all.matchAll(/['"`]([A-Za-z][A-Za-z0-9_]*)['"`]/g)) {
        literals.add(match[1]);
    }
    return literals;
}

function checkLocalizationConsistency(data = readCatalogue(), { quiet = false } = {}) {
    const log = quiet ? () => {} : console.log;

    for (const lang of LANGUAGES) {
        if (!data[lang]) {
            console.error(`❌ Missing language section: "${lang}"`);
            return false;
        }
    }

    const keySets = {};
    for (const lang of LANGUAGES) keySets[lang] = new Set(Object.keys(data[lang]));

    const referenceKeys = keySets[REFERENCE];
    let hasErrors = false;

    for (const lang of LANGUAGES) {
        if (lang === REFERENCE) continue;

        const langKeys = keySets[lang];
        const missing = [...referenceKeys].filter((k) => !langKeys.has(k));
        const extra = [...langKeys].filter((k) => !referenceKeys.has(k));

        if (missing.length === 0 && extra.length === 0) {
            log(`✅ ${lang}: OK (${langKeys.size} keys)`);
        } else {
            hasErrors = true;
            log(`\n❌ ${lang}:`);
            log(`   Total keys: ${langKeys.size} (expected: ${referenceKeys.size})`);
            if (missing.length > 0) {
                log(`   Missing (${missing.length}):`);
                missing.forEach((k) => log(`      - ${k}`));
            }
            if (extra.length > 0) {
                log(`   Extra (${extra.length}):`);
                extra.forEach((k) => log(`      - ${k}`));
            }
        }
    }

    return !hasErrors;
}

function checkEmptyValues(data = readCatalogue()) {
    const unexpectedEmpty = [];
    const missingSanctioned = [];

    for (const lang of LANGUAGES) {
        for (const [key, value] of Object.entries(data[lang] || {})) {
            if (String(value).trim() === '' && !SANCTIONED_EMPTY_KEYS.includes(key)) {
                unexpectedEmpty.push(`${lang}:${key}`);
            }
        }
        for (const key of SANCTIONED_EMPTY_KEYS) {
            if (!(key in (data[lang] || {}))) missingSanctioned.push(`${lang}:${key}`);
        }
    }

    return { unexpectedEmpty, missingSanctioned, ok: unexpectedEmpty.length === 0 && missingSanctioned.length === 0 };
}

function auditKeyReferences(data = readCatalogue(), sources = readSources()) {
    const catalogueKeys = Object.keys(data[REFERENCE] || {});
    const catalogueKeySet = new Set(catalogueKeys);
    const literals = literalKeys(sources);
    const { produced, families } = resolveConstructedKeys(sources);

    const missingLiteral = [];
    for (const match of sources.__all.matchAll(/localize\(\s*['"]([A-Za-z0-9_]+)['"]\s*[,)]/g)) {
        if (!catalogueKeySet.has(match[1])) missingLiteral.push(match[1]);
    }

    const missingConstructed = [];
    for (const [key, family] of produced) {
        if (!catalogueKeySet.has(key)) missingConstructed.push(`${key} (${family})`);
    }

    const referenced = [];
    const constructed = [];
    const unreferenced = [];

    for (const key of catalogueKeys) {
        if (literals.has(key)) referenced.push(key);
        else if (produced.has(key)) constructed.push(key);
        else unreferenced.push(key);
    }

    const orphanedByFamily = [];
    for (const family of CONSTRUCTED_KEY_FAMILIES) {
        const producible = new Set(family.produce(sources));
        for (const key of catalogueKeys) {
            if (family.owns(key) && !producible.has(key)) orphanedByFamily.push(`${key} (${family.name})`);
        }
    }

    return {
        families,
        referenced,
        constructed,
        unreferenced,
        orphanedByFamily,
        missing: [...new Set([...missingLiteral, ...missingConstructed])],
        ok: missingLiteral.length === 0 && missingConstructed.length === 0
            && unreferenced.length === 0 && orphanedByFamily.length === 0
    };
}

function validateLocalization({ report = false } = {}) {
    let data;
    try {
        data = readCatalogue();
    } catch (err) {
        console.error(`❌ Failed to read or parse ${LOCALIZATION_FILE}:`, err.message);
        return false;
    }

    console.log('Checking localization key consistency...\n');
    const parityOk = checkLocalizationConsistency(data);
    console.log(`\n${parityOk ? 'All languages have identical key sets.' : 'Errors found!'}`);
    console.log('\nKey counts:');
    LANGUAGES.forEach((lang) => console.log(`  ${lang}: ${Object.keys(data[lang] || {}).length} keys`));

    console.log('\nChecking for empty values...');
    const empties = checkEmptyValues(data);
    if (empties.ok) {
        console.log(`✅ Only the ${SANCTIONED_EMPTY_KEYS.length} sanctioned keys are empty, in every language.`);
    } else {
        empties.unexpectedEmpty.forEach((k) => console.log(`   ❌ empty value: ${k}`));
        empties.missingSanctioned.forEach((k) => console.log(`   ❌ sanctioned empty key missing: ${k}`));
    }

    console.log('\nChecking key wiring...');
    const audit = auditKeyReferences(data, readSources());
    for (const family of audit.families) {
        console.log(`   ${family.name}: ${family.keys.length} keys resolved — ${family.builtBy}`);
    }
    console.log(`   ${audit.referenced.length} referenced literally, ${audit.constructed.length} built at runtime.`);

    if (audit.missing.length > 0) {
        console.log(`   ❌ ${audit.missing.length} key(s) the source asks for are not in the catalogue:`);
        audit.missing.forEach((k) => console.log(`      - ${k}`));
    }
    if (audit.unreferenced.length > 0) {
        console.log(`   ❌ ${audit.unreferenced.length} key(s) nothing can reach — delete them, or add the family that builds them:`);
        audit.unreferenced.forEach((k) => console.log(`      - ${k}`));
    }
    if (audit.orphanedByFamily.length > 0) {
        console.log(`   ❌ ${audit.orphanedByFamily.length} key(s) shaped like a constructed family but not producible by it:`);
        audit.orphanedByFamily.forEach((k) => console.log(`      - ${k}`));
    }
    if (audit.ok) {
        console.log('   ✅ Every key is reachable, and every key the source asks for exists.');
    }

    if (report) {
        console.log('\nFull classification:');
        console.log(`  referenced literally (${audit.referenced.length})`);
        console.log(`  built at runtime (${audit.constructed.length}):`);
        audit.constructed.forEach((k) => console.log(`      - ${k}`));
    }

    return parityOk && empties.ok && audit.ok;
}

if (require.main === module) {
    const success = validateLocalization({ report: process.argv.includes('--report') });
    console.log(`\n${success ? '✅ Localization catalogue is clean.' : '❌ Localization catalogue has errors.'}`);
    process.exit(success ? 0 : 1);
}

module.exports = {
    checkLocalizationConsistency,
    checkEmptyValues,
    resolveConstructedKeys,
    auditKeyReferences,
    validateLocalization,
    readCatalogue,
    readSources,
    LANGUAGES,
    SANCTIONED_EMPTY_KEYS,
    CONSTRUCTED_KEY_FAMILIES
};
