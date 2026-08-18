import { getLanguage, setLanguage } from './constantsAndGlobalVars.js';

const SUPPORTED_LANGUAGES = ['en', 'es', 'de', 'it', 'fr'];
const DEFAULT_LANGUAGE = 'en';
const LANGUAGE_STORAGE_KEY = 'cosmicForgeLanguage';

let localizationData = {};

// Reverse index of translated compound name -> internal compound key, built per
// language on first use. `reverseLocalizeForCompounds` is reached from the frame
// loop, so it must not walk the catalogue on every call.
let compoundReverseIndex = new Map();
let materialReverseIndex = new Map();

export function getSupportedLanguages() {
    return [...SUPPORTED_LANGUAGES];
}

export function isSupportedLanguage(value) {
    return typeof value === 'string' && SUPPORTED_LANGUAGES.includes(value.trim().toLowerCase());
}

function normaliseLanguage(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return null;
    // Accept full locale tags ('fr-CA') by matching on the primary subtag.
    const primary = trimmed.split(/[-_]/)[0];
    return SUPPORTED_LANGUAGES.includes(primary) ? primary : null;
}

function readStoredLanguage() {
    try {
        return normaliseLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));
    } catch (error) {
        return null;
    }
}

export function persistLanguage(value) {
    const resolved = normaliseLanguage(value);
    if (!resolved) return false;
    try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, resolved);
        return true;
    } catch (error) {
        // Private browsing or a locked-down Electron partition — a non-persisted
        // language is a degraded experience, not a failure worth breaking boot for.
        return false;
    }
}

function detectBrowserLanguage() {
    try {
        const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
        for (const candidate of candidates) {
            const resolved = normaliseLanguage(candidate);
            if (resolved) return resolved;
        }
    } catch (error) {
        return null;
    }
    return null;
}

// Explicit request wins, then a previously saved choice, then the browser/OS
// locale, then English. Every branch is validated against SUPPORTED_LANGUAGES so
// an unknown tag can never reach the lookup tables.
function resolveLanguage(requested) {
    return normaliseLanguage(requested)
        ?? readStoredLanguage()
        ?? detectBrowserLanguage()
        ?? DEFAULT_LANGUAGE;
}

function setLocalization(data) {
    localizationData = data;
    // The catalogue is re-fetched on every initLocalization call, so any index
    // built from the previous copy is stale by definition.
    compoundReverseIndex = new Map();
    materialReverseIndex = new Map();
}

function getLocalization() {
    return localizationData;
}

async function fetchLocalization() {
    try {
        const response = await fetch('localization.json');
        localizationData = await response.json();
    } catch (error) {
        console.error('Error loading localization:', error);
    }
    return localizationData;
}

export async function initLocalization(language) {
    const localization = await fetchLocalization();
    setLocalization(localization);

    const resolved = resolveLanguage(language);

    // Fall back to English if the catalogue somehow lacks the resolved language,
    // so a malformed localization.json degrades instead of blanking the UI.
    const available = localization && localization[resolved]
        ? resolved
        : DEFAULT_LANGUAGE;

    setLanguage(available);
    persistLanguage(available);

    return available;
}

// The catalogue value exactly as authored, with real newlines left alone. Use
// this wherever the result is written to `textContent` / `innerText` on an
// element that wraps (`white-space: pre-wrap`); `localize()` would hand those
// call sites a literal `<br>` to display.
function localizeRaw(key, language) {
    const data = getLocalization();
    if (!data || !data[language]) {
        console.error(`Localization data not loaded or language '${language}' not found`);
        return key;
    }
    const localizedString = data[language][key];
    if (!localizedString) return key;

    return localizedString;
}

function localize(key, language) {
    const localizedString = localizeRaw(key, language);

    return localizedString.replace(/\n/g, '<br>');
}

// Build the translated-name -> internal-key map for one language, once. Cached
// until the catalogue is replaced. Keyed by language rather than by "whatever is
// active", because callers pass the language they want explicitly.
function getCompoundReverseIndex(language) {
    const cached = compoundReverseIndex.get(language);
    if (cached) return cached;

    const data = getLocalization();
    const table = data && data[language];
    if (!table) return null;

    const index = new Map();
    for (const [key, value] of Object.entries(table)) {
        if (!key.startsWith('compound') || typeof value !== 'string') continue;
        const name = value.toLowerCase();
        // First declaration wins, matching the linear scan this replaced, which
        // returned on its first match in insertion order.
        if (!index.has(name)) {
            index.set(name, key.slice('compound'.length).toLowerCase());
        }
    }

    compoundReverseIndex.set(language, index);
    return index;
}

/**
 * Translated material name -> internal key, across **both** sections.
 *
 * `getCompoundReverseIndex` deliberately covers only `compound*` keys, because
 * its caller resolves compound names specifically. Crafting needs the wider
 * mapping: a recipe's ingredients are usually resources ("Wasserstoff" ->
 * "hydrogen"), and looking those up in the compound-only index silently returns
 * the translated name unchanged.
 *
 * Compounds are indexed first so that a name shared by both sections resolves the
 * same way it always has — see known-issues #8.
 */
function getMaterialReverseIndex(language) {
    const cached = materialReverseIndex.get(language);
    if (cached) return cached;

    const data = getLocalization();
    const table = data && data[language];
    if (!table) return null;

    const index = new Map();
    for (const prefix of ['compound', 'resource']) {
        for (const [key, value] of Object.entries(table)) {
            if (!key.startsWith(prefix) || typeof value !== 'string') continue;
            const name = value.toLowerCase();
            if (!index.has(name)) {
                index.set(name, key.slice(prefix.length).toLowerCase());
            }
        }
    }

    materialReverseIndex.set(language, index);
    return index;
}

/** Turn a displayed material name back into the key the data object uses. */
function reverseLocalizeMaterialName(localizedValue, language) {
    if (typeof localizedValue !== 'string') return localizedValue;

    const index = getMaterialReverseIndex(language);
    if (!index) return localizedValue;

    const resolved = index.get(localizedValue.toLowerCase());
    return resolved === undefined ? localizedValue : resolved;
}

// Resource and compound display names are stored in the catalogue under
// `resource<Name>` / `compound<Name>`, but the game data holds the internal key
// plus the section it lives in ('resources' / 'compounds'). Several draw
// functions and the frame loop need to turn that pair into a display name, so
// the mapping lives here rather than being re-derived at each call site.
function localizeMaterialName(name, section, language) {
    if (typeof name !== 'string' || !name) return name;
    const prefix = section === 'compounds' ? 'compound' : 'resource';
    const capitalised = name.charAt(0).toUpperCase() + name.slice(1);
    return localize(prefix + capitalised, language);
}

function reverseLocalizeForCompounds(localizedValue, language) {
    if (typeof localizedValue !== 'string') return localizedValue;

    const index = getCompoundReverseIndex(language);
    if (!index) return localizedValue;

    const resolved = index.get(localizedValue.toLowerCase());
    return resolved === undefined ? localizedValue : resolved;
}

export {
    localize,
    localizeRaw,
    localizeMaterialName,
    reverseLocalizeForCompounds,
    reverseLocalizeMaterialName,
    LANGUAGE_STORAGE_KEY,
    DEFAULT_LANGUAGE
};