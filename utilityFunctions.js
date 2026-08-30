export function capitaliseString(str) {
    if (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    return '';
}

export function capitaliseWordsWithRomanNumerals(str) {
    const romanNumerals = new Set([
        'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x',
        'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx'
    ]);
    
    if (str && str !== '') {
        return str
            .split(' ')
            .map(word => {
                const lowerWord = word.toLowerCase();
                return romanNumerals.has(lowerWord) ? lowerWord.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');
    }
    return '';
}

export function toCamelCase(str) {
    return str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (match, char) => char.toUpperCase());
}

/**
 * Read one key from localStorage, or null if storage is unavailable.
 *
 * `localStorage` does not merely return nothing when the browser has it turned
 * off — reading or writing it *throws*. Private browsing, a locked-down Electron
 * partition and a Chromium profile with site data blocked all do this. Because
 * the boot path touches storage (analytics initialises inside ui.js, and the
 * save name is read while the UI is built), an unguarded throw killed the page
 * before the pioneer prompt was ever drawn: the game did not start at all.
 *
 * Losing persistence is a degraded experience; losing boot is not shippable.
 * Every storage touch in the shipped game goes through this pair, except
 * localization.js, which has carried its own equivalent guard from the start.
 */
export function readStoredValue(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        return null;
    }
}

/** Write one key to localStorage. Returns whether it actually persisted. */
export function writeStoredValue(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        return false;
    }
}
