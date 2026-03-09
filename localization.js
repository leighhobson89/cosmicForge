import { getLanguage, setLanguage } from './constantsAndGlobalVars.js';

let localizationData = {};

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
    setLanguage(getLanguage());
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

export {
    localize
};