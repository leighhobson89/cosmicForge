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

export function readStoredValue(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        return null;
    }
}

export function writeStoredValue(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        return false;
    }
}
