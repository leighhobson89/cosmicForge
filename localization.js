import { getLanguage, setLanguage } from './constantsAndGlobalVars.js';

const SUPPORTED_LANGUAGES = ['en', 'es', 'de', 'it', 'fr'];
const DEFAULT_LANGUAGE = 'en';
const LANGUAGE_STORAGE_KEY = 'cosmicForgeLanguage';

let localizationData = {};

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

function localize(key, language) {
    const data = getLocalization();
    if (!data || !data[language]) {
        console.error(`Localization data not loaded or language '${language}' not found`);
        return key;
    }
    let localizedString = data[language][key];
    if (!localizedString) return key;

    localizedString = localizedString.replace(/\n/g, '<br>');

    if (localizedString.includes('${')) {
        try {
            return interpolateTemplateLiteral(localizedString);
        } catch (e) {
            console.error(`Error evaluating template literal in localized string for key '${key}':`, e);
            return localizedString;
        }
    } else {
        return localizedString;
    }
}

function interpolateTemplateLiteral(template) {
    return template.replace(/\${(.*?)}/g, (match, expression) => {
        try {
            const value = eval(expression);
            return String(value);
        } catch (e) {
            console.error(`Error evaluating expression '${expression}' in template literal:`, e);
            return match;
        }
    });
}

function reverseLocalizeForCompounds(localizedValue, language) {
    const data = getLocalization();
    if (!data || !data[language]) {
        return localizedValue;
    }
    
    // Find the key that maps to this localized value, only checking 'compound' keys
    for (const [key, value] of Object.entries(data[language])) {
        if (key.startsWith('compound') && value.toLowerCase() === localizedValue.toLowerCase()) {
            return key.replace('compound', '').toLowerCase();
        }
    }
    return localizedValue;
}

export {
    localize,
    reverseLocalizeForCompounds,
    LANGUAGE_STORAGE_KEY,
    DEFAULT_LANGUAGE
};