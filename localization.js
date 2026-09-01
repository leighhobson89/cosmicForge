import { getLanguage, setLanguage } from './constantsAndGlobalVars.js';

const SUPPORTED_LANGUAGES = ['en', 'es', 'pt', 'de', 'it', 'fr'];
const DEFAULT_LANGUAGE = 'en';
const LANGUAGE_STORAGE_KEY = 'cosmicForgeLanguage';

let localizationData = {};

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

function resolveLanguage(requested) {
    return normaliseLanguage(requested)
        ?? readStoredLanguage()
        ?? detectBrowserLanguage()
        ?? DEFAULT_LANGUAGE;
}

function setLocalization(data) {
    localizationData = data;
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
    const available = localization && localization[resolved]
        ? resolved
        : DEFAULT_LANGUAGE;

    setLanguage(available);
    persistLanguage(available);

    return available;
}

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
        if (!index.has(name)) {
            index.set(name, key.slice('compound'.length).toLowerCase());
        }
    }

    compoundReverseIndex.set(language, index);
    return index;
}

const SHORT_NAME_KEY = /^(?:resource|compound)Short[A-Z]/;

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
            if (SHORT_NAME_KEY.test(key)) continue;
            const name = value.toLowerCase();
            if (!index.has(name)) {
                index.set(name, key.slice(prefix.length).toLowerCase());
            }
        }
    }

    materialReverseIndex.set(language, index);
    return index;
}

function reverseLocalizeMaterialName(localizedValue, language) {
    if (typeof localizedValue !== 'string') return localizedValue;

    const index = getMaterialReverseIndex(language);
    if (!index) return localizedValue;

    const resolved = index.get(localizedValue.toLowerCase());
    return resolved === undefined ? localizedValue : resolved;
}

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