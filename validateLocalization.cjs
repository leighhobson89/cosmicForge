// Localization Key Consistency Checker
// Run this script to verify all 5 languages have identical key sets

const fs = require('fs');
const path = require('path');

const LOCALIZATION_FILE = path.join(__dirname, 'localization.json');
const LANGUAGES = ['en', 'es', 'de', 'it', 'fr'];

function checkLocalizationConsistency() {
    console.log('Checking localization key consistency...\n');

    let data;
    try {
        const content = fs.readFileSync(LOCALIZATION_FILE, 'utf8');
        data = JSON.parse(content);
    } catch (err) {
        console.error(`❌ Failed to read or parse ${LOCALIZATION_FILE}:`, err.message);
        process.exit(1);
    }

    // Check all languages exist
    for (const lang of LANGUAGES) {
        if (!data[lang]) {
            console.error(`❌ Missing language section: "${lang}"`);
            process.exit(1);
        }
    }

    // Get key sets
    const keySets = {};
    for (const lang of LANGUAGES) {
        keySets[lang] = new Set(Object.keys(data[lang]));
    }

    // Use English as reference
    const reference = 'en';
    const referenceKeys = keySets[reference];
    let hasErrors = false;

    for (const lang of LANGUAGES) {
        if (lang === reference) continue;

        const langKeys = keySets[lang];
        const missing = [];
        const extra = [];

        for (const key of referenceKeys) {
            if (!langKeys.has(key)) {
                missing.push(key);
            }
        }

        for (const key of langKeys) {
            if (!referenceKeys.has(key)) {
                extra.push(key);
            }
        }

        if (missing.length === 0 && extra.length === 0) {
            console.log(`✅ ${lang}: OK (${langKeys.size} keys)`);
        } else {
            hasErrors = true;
            console.log(`\n❌ ${lang}:`);
            console.log(`   Total keys: ${langKeys.size} (expected: ${referenceKeys.size})`);
            
            if (missing.length > 0) {
                console.log(`   Missing (${missing.length}):`);
                missing.forEach(k => console.log(`      - ${k}`));
            }
            
            if (extra.length > 0) {
                console.log(`   Extra (${extra.length}):`);
                extra.forEach(k => console.log(`      - ${k}`));
            }
        }
    }

    console.log(`\n${hasErrors ? 'Errors found!' : 'All languages have identical key sets.'}`);
    console.log(`\nKey counts:`);
    LANGUAGES.forEach(lang => {
        console.log(`  ${lang}: ${keySets[lang].size} keys`);
    });

    return !hasErrors;
}

// Run check if executed directly
if (require.main === module) {
    const success = checkLocalizationConsistency();
    process.exit(success ? 0 : 1);
}

module.exports = { checkLocalizationConsistency, LANGUAGES };
