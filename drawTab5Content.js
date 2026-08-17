import { removeTabAttentionIfNoIndicators, createColoniseOpinionProgressBar, setColoniseOpinionProgressBar, spaceTravelButtonHideAndShowDescription, setupInfoTooltips, drawStarConnectionDrawings, createStarDestinationRow, sortStarTable, handleSortStarClick, createTextElement, createOptionRow, createButton, generateStarfield, showNotification, showEnterWarModeModal, setWarUI, removeStarConnectionTooltip } from './ui.js';
import { sfxPlayer } from './audioManager.js';
import { getStarNames, getStarTypeByName } from './descriptions.js';
import { getFactoryStarsArray, getSettledStars, setInFormation, setRedrawBattleDescription, setFleetChangedSinceLastDiplomacy, setDestinationStarScanned, getDestinationStarScanned, getStellarScannerBuilt, getStarShipTravelling, getDestinationStar, getCurrencySymbol, getSortStarMethod, getCurrentStarSystem, STAR_FIELD_SEED, NUMBER_OF_STARS, getStarMapMode, setStarMapMode, getWarMode, replaceBattleUnits, setNeedNewBattleCanvas, setFormationGoal, setBattleResolved, getBelligerentEnemyFlag, setAchievementFlagArray, getStarsWithAncientManuscripts, getStarShipDestinationReminderVisible, getStarVisionDistance, getMiaplacidusMilestoneLevel, getCurrentTheme } from './constantsAndGlobalVars.js';

import { getMaxFleetShip, getFleetShips, copyStarDataToDestinationStarField, getResourceDataObject, getStarShipParts, getStarShipPartsNeededInTotalPerModule, getStarSystemDataObject, setStarSystemDataObject } from './resourceDataObject.js';
import { capitaliseString, capitaliseWordsWithRomanNumerals } from './utilityFunctions.js';
import { updateDiplomacySituation, calculateModifiedAttitude, increaseAttackAndDefensePower, generateDestinationStarData, gain, getAscendencyPointsWithRepeatableBonus, GENERATED_ANOMALY_CATALOGUE } from './game.js';
import { localize, localizeMaterialName } from './localization.js';
import { getLanguage } from './constantsAndGlobalVars.js';

// Star data holds these as English words, and the surrounding code branches on
// them to pick a colour class, so the stored value stays canonical and only the
// rendering of it is localized. Anything not in a map falls through unchanged,
// which is what generated race names and trait names need.
const CIVILIZATION_LEVEL_KEYS = {
    None: 'civilizationLevelNone',
    Unsentient: 'civilizationLevelUnsentient',
    Industrial: 'civilizationLevelIndustrial',
    Spacefaring: 'civilizationLevelSpacefaring',
    Robotic: 'civilizationLevelRobotic'
};

const THREAT_LEVEL_KEYS = {
    None: 'threatLevelNone',
    Low: 'threatLevelLow',
    Moderate: 'threatLevelModerate',
    High: 'threatLevelHigh',
    Extreme: 'threatLevelExtreme'
};

const ATTITUDE_KEYS = {
    None: 'attitudeNone',
    Receptive: 'attitudeReceptive',
    Neutral: 'attitudeNeutral',
    Reserved: 'attitudeReserved',
    Belligerent: 'attitudeBelligerent',
    Scared: 'attitudeScared'
};

// The fixed anomalies are authored as plain strings rather than objects: two on
// the Miaplacidus system in `resourceDataObject.js`, and `Stalwart`, which
// `generateAnomalies` returns for any hard-mode destination. Generated anomalies
// are objects and take the branch below this map.
const ANOMALY_KEYS = {
    'Broken Force Field': 'anomalyBrokenForceField',
    'AI Master Race': 'anomalyAiMasterRace',
    Stalwart: 'anomalyStalwart'
};

const localizeFromMap = (map, value) => (map[value] ? localize(map[value], getLanguage()) : value);
const localizeCivilizationLevel = (value) => localizeFromMap(CIVILIZATION_LEVEL_KEYS, value);
const localizeThreatLevel = (value) => localizeFromMap(THREAT_LEVEL_KEYS, value);
const localizeAttitude = (value) => localizeFromMap(ATTITUDE_KEYS, value);
const localizeAnomalyName = (value) => localizeFromMap(ANOMALY_KEYS, value);

// Generated anomalies and lifeform traits carry their catalogue key next to the
// canonical English value, so the display resolves from the key and the stored
// value stays the one the battle code branches on.
const localizeKeyed = (key, fallback) => (key ? localize(key, getLanguage()) : fallback);

// Traits held in a save written before the key slot existed only have two
// entries, so the canonical English value has to resolve a key of its own or
// those rows stay English forever.
const TRAIT_NAME_KEYS = {
    Aggressive: 'traitNameAggressive',
    Diplomatic: 'traitNameDiplomatic',
    Terrans: 'traitNameTerrans',
    Aquatic: 'traitNameAquatic',
    Aerialians: 'traitNameAerialians',
    Armored: 'traitNameArmored',
    'Hive Mind': 'traitNameHiveMind',
    'Power Siphon': 'traitNamePowerSiphon',
    Hypercharge: 'traitNameHypercharge',
    Mechanized: 'traitNameMechanized',
    'N/A': 'textNotApplicable'
};

const localizeTraitName = (trait) => localizeKeyed(trait?.[2] ?? TRAIT_NAME_KEYS[trait?.[0]], trait?.[0]);

// The same problem for generated anomalies: one rolled before the key slots
// existed is stored with only its English `name` and `effect`. Both maps are
// built from the generator's own catalogue so there is a single source of truth
// for which English string belongs to which key. They are built on first use
// rather than at module scope, because this module and `game.js` import each
// other and the catalogue is still in its temporal dead zone at load time.
let generatedAnomalyKeyMaps = null;
const getGeneratedAnomalyKeyMaps = () => {
    if (!generatedAnomalyKeyMaps) {
        const catalogue = GENERATED_ANOMALY_CATALOGUE || [];
        generatedAnomalyKeyMaps = {
            names: Object.fromEntries(catalogue.map((a) => [a.name, a.nameKey])),
            effects: Object.fromEntries(catalogue.map((a) => [a.effect, a.effectKey]))
        };
    }
    return generatedAnomalyKeyMaps;
};

const localizeGeneratedAnomalyName = (anomaly) => localizeKeyed(anomaly?.nameKey ?? getGeneratedAnomalyKeyMaps().names[anomaly?.name], anomaly?.name);
const localizeGeneratedAnomalyEffect = (anomaly) => localizeKeyed(anomaly?.effectKey ?? getGeneratedAnomalyKeyMaps().effects[anomaly?.effect], anomaly?.effect);

// Precipitation is a compound key plus the section it lives in.
// Stars stubbed in for settled systems carry the literal 'Unknown' rather than a
// compound key, so that value has to be caught before it reaches the catalogue —
// `compoundUnknown` does not exist, and localize() would render the key itself.
const localizePrecipitationType = (star) => {
    const type = star?.precipitationType;
    if (!type || type === 'Unknown') {
        return localize('textUnknown', getLanguage());
    }
    return localizeMaterialName(type, star.precipitationResourceCategory ?? 'compounds', getLanguage());
};

// Star ship modules and fleet ships are addressed by id everywhere else, so the
// display name is looked up from the id rather than carried alongside it.
const localizeStarShipModule = (id) => localize('starShipModule' + id.slice(2), getLanguage());
const localizeFleetShip = (id) => localize('fleetShip' + id.slice('fleet'.length), getLanguage());

// Space upgrade price tuples are [quantity, key, section].
const spaceUpgradePriceName = (upgrade, slot) => {
    const price = getResourceDataObject('space', ['upgrades', upgrade, `resource${slot}Price`]);
    return localizeMaterialName(price[1], price[2], getLanguage());
};

function getWeatherDisplayData(weatherTendency, weather) {
    if (Array.isArray(weatherTendency) && weatherTendency.length >= 3 && weatherTendency.every(value => value !== undefined)) {
        return weatherTendency;
    }

    if (weather && typeof weather === 'object') {
        let fallback = null;
        Object.values(weather).forEach(entry => {
            if (!Array.isArray(entry)) return;
            if (!fallback || entry[0] > fallback[0]) {
                fallback = entry;
            }
        });

        if (fallback) {
            const [probability, icon, , textClass = 'green-ready-text'] = fallback;
            return [icon, probability, textClass];
        }
    }

    return ['?', 0, 'red-disabled-text'];
}

export async function drawTab5Content(heading, optionContentElement, starDestinationInfoRedraw, diplomacyRedraw) {
    // The row's own marker is cleared by the click that opened this pane — see
    // clearOptionRowAttentionIndicator in ui.js.
    removeTabAttentionIfNoIndicators('tab5');

    const headerRow = document.getElementById('headerContentTab5');
    if (headerRow) {
        headerRow.classList.toggle('star-map-header', heading === 'Star Map');
        const headerContainer = headerRow.closest('.container-item-menu-header');
        if (headerContainer) {
            headerContainer.classList.toggle('star-map-header-container', heading === 'Star Map');
        }
    }

    if (heading === 'Star Map') {
        const headerRow = document.getElementById('headerContentTab5');
        
        headerRow.innerHTML = `
            <div class="star-map-header-top">
                <div id="starMapNameField" class="star-map-name-field">${localize('headerMainStarMap', getLanguage())}</div>
                <div id="starButtonContainer" class="header-button-container"></div>
                <div id="starMapSearchRow" class="star-map-search-row">
                    <input id="starMapSearchInput" class="star-map-search-input" type="text" placeholder="" autocomplete="off" />
                    <div id="starMapSearchOverlay" class="star-map-search-overlay">
                        <span class="star-map-search-overlay-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </span>
                        <span class="star-map-search-overlay-text">${localize('placeholderSearchStar', getLanguage())}</span>
                    </div>
                    <div id="starMapSearchResults" class="star-map-search-results invisible" role="listbox"></div>
                </div>
            </div>
        `;
        
        const starButtonContainer = headerRow.querySelector('#starButtonContainer');
        const searchRowEl = headerRow.querySelector('#starMapSearchRow');
        const overlayTextEl = headerRow.querySelector('#starMapSearchOverlay .star-map-search-overlay-text');
        const overlayIconEl = headerRow.querySelector('#starMapSearchOverlay .star-map-search-overlay-icon');
        const searchInputEl = headerRow.querySelector('#starMapSearchInput');
        const searchResultsEl = headerRow.querySelector('#starMapSearchResults');

        const setSearchEnabledForMode = (mode) => {
            const modeLower = String(mode || '').toLowerCase();
            const enabled = modeLower === 'normal' || modeLower === 'distance';

            if (searchRowEl) {
                searchRowEl.style.pointerEvents = enabled ? 'auto' : 'none';
                searchRowEl.classList.toggle('red-disabled-text', !enabled);
            }

            if (overlayTextEl) {
                overlayTextEl.textContent = enabled ? localize('placeholderSearchStar', getLanguage()) : localize('placeholderSearchModeUnavailable', getLanguage());
                overlayTextEl.classList.toggle('red-disabled-text', !enabled);
            }

            if (overlayIconEl) {
                overlayIconEl.classList.toggle('red-disabled-text', !enabled);
            }

            if (searchInputEl) {
                searchInputEl.classList.toggle('red-disabled-text', !enabled);
            }

            if (!enabled) {
                if (searchInputEl) {
                    searchInputEl.value = '';
                }
                if (searchResultsEl) {
                    searchResultsEl.classList.add('invisible');
                    searchResultsEl.innerHTML = '';
                }
                if (overlayTextEl) {
                    overlayTextEl.classList.remove('invisible');
                }
            }

            if (enabled && typeof globalThis.__starMapSearchSyncOverlayVisibility === 'function') {
                globalThis.__starMapSearchSyncOverlayVisibility();
            }
        };

        const buttons = [
            { mode: 'normal', key: 'starMapModeNormal' },
            { mode: 'distance', key: 'starMapModeDistance' },
            { mode: 'studied', key: 'starMapModeStudied' },
            { mode: 'in range', key: 'starMapModeInRange' }
        ];
        
        buttons.forEach(button => {
            const buttonElement = createButton({
                text: localize(button.key, getLanguage()),
                classNames: ['option-button', 'star-option-button'],
                onClick: () => { 
                    document.querySelectorAll('.star-option-button').forEach(btn => {
                        btn.classList.remove('green-ready-text');
                    });

                    buttonElement.classList.add('green-ready-text');
                    
                    setStarMapMode(button.mode);
                    setSearchEnabledForMode(button.mode);

                    removeStarConnectionTooltip();
                    const destinationRow = document.getElementById('descriptionContentTab5');
                    if (destinationRow) {
                        destinationRow.innerHTML = localize('headerDescStarMap', getLanguage());
                    }

                    const starContainer = document.querySelector('#optionContentTab5');
                    starContainer.innerHTML = '';
                    generateStarfield(starContainer, NUMBER_OF_STARS, STAR_FIELD_SEED, getStarMapMode(), false, null, false);
                },
                disableKeyboardForButton: true
            });
            
            starButtonContainer.appendChild(buttonElement);

            if (button.mode === getStarMapMode()) {
                buttonElement.classList.add('green-ready-text');
            }
        });
        
        const infoEmoji = document.createElement('p');
        infoEmoji.id = 'info_starMapModes';
        infoEmoji.className = 'info-emoji';
        infoEmoji.innerHTML = '\u00A0\u00A0ℹ️';
        starButtonContainer.appendChild(infoEmoji);
        
        const starContainer = document.querySelector('#optionContentTab5');   
        starContainer.innerHTML = '';     
        generateStarfield(starContainer, NUMBER_OF_STARS, STAR_FIELD_SEED, getStarMapMode(), false, null, false);
        if (getStarShipTravelling()) {
            drawStarConnectionDrawings(getCurrentStarSystem(), getDestinationStar(), 'travelling');
            const starData = getStarSystemDataObject('stars');
            createStarDestinationRow(starData[getDestinationStar()], 'travelling');
            spaceTravelButtonHideAndShowDescription();
        }

        const searchInput = headerRow.querySelector('#starMapSearchInput');
        const resultsEl = headerRow.querySelector('#starMapSearchResults');

        const closeResults = () => {
            resultsEl?.classList.add('invisible');
            if (resultsEl) {
                resultsEl.innerHTML = '';
            }
        };

        const runSearchSelectionPing = (starName) => {
            const modeLower = String(getStarMapMode?.() || '').toLowerCase();
            if (modeLower !== 'normal' && modeLower !== 'distance') {
                return;
            }

            const normalized = capitaliseWordsWithRomanNumerals(starName);
            const possibleIds = [
                normalized,
                `settledStar${normalized}`,
                `noneInterestingStar${normalized}`
            ];

            const starElement = possibleIds
                .map((id) => document.getElementById(id))
                .find(Boolean);

            if (!starElement) {
                return;
            }

            const rect = starElement.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            const ping = document.createElement('div');
            ping.style.left = `${x}px`;
            ping.style.top = `${y}px`;
            ping.className = 'star-map-search-selection-ping green-ready-text';

            document.body.appendChild(ping);

            window.setTimeout(() => {
                ping.remove();
            }, 4100);
        };

        const selectStarByName = (starName) => {
            const starContainer = document.querySelector('#optionContentTab5');
            if (!starContainer) {
                return;
            }

            const normalized = capitaliseWordsWithRomanNumerals(starName);
            const possibleIds = [
                normalized,
                `settledStar${normalized}`,
                `noneInterestingStar${normalized}`
            ];

            const starElement = possibleIds
                .map((id) => document.getElementById(id))
                .find(Boolean);

            if (starElement) {
                starElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            } else {
                showNotification(localize('notificationStarNotFoundOnMap', getLanguage()).replace('{star}', normalized), 'warning', 2500, 'starMap');
            }
        };

        const renderResults = (matches) => {
            if (!resultsEl) {
                return;
            }

            resultsEl.innerHTML = '';

            if (matches.length === 0) {
                resultsEl.innerHTML = `<div class="star-map-search-item red-disabled-text" role="option">${localize('textNoMatches', getLanguage())}</div>`;
                resultsEl.classList.remove('invisible');
                return;
            }

            const settledStars = new Set((getSettledStars() || []).map((name) => String(name).toLowerCase()));
            const factoryStars = new Set((getFactoryStarsArray() || []).map((name) => String(name).toLowerCase()));
            const currentStarLower = String(getCurrentStarSystem() || '').toLowerCase();
            const studiedDistance = getStarVisionDistance?.() ?? 0;

            const dummyContainer = document.createElement('div');
            const { starDistanceData } = generateStarfield(
                dummyContainer,
                NUMBER_OF_STARS,
                STAR_FIELD_SEED,
                null,
                true,
                getCurrentStarSystem(),
                false
            ) || { starDistanceData: {} };

            const getItemClassesForStarName = (starName) => {
                const normalizedLower = String(starName).toLowerCase();
                const classes = [];

                if (normalizedLower === 'miaplacidus') {
                    classes.push('star-map-search-bold');
                    if ((getMiaplacidusMilestoneLevel?.() ?? 0) !== 4) {
                        classes.push('red-disabled-text');
                        return classes;
                    }
                    const distance = starDistanceData?.[capitaliseWordsWithRomanNumerals(starName)];
                    const isStudied = typeof distance === 'number' && distance <= studiedDistance;
                    if (isStudied) {
                        classes.push('green-ready-text');
                    }
                    return classes;
                }

                if (factoryStars.has(normalizedLower)) {
                    classes.push('factory-star-text');
                    return classes;
                }

                if (settledStars.has(normalizedLower)) {
                    classes.push('settled-star-text');
                    return classes;
                }

                if (normalizedLower === currentStarLower) {
                    return classes;
                }

                const distance = starDistanceData?.[capitaliseWordsWithRomanNumerals(starName)];
                const isStudied = typeof distance === 'number' && distance <= studiedDistance;
                if (isStudied) {
                    if (getStarTypeByName(starName) === 'O') {
                        classes.push('o-star-text');
                    } else {
                        classes.push('green-ready-text');
                    }
                }
                return classes;
            };

            matches.forEach((match) => {
                const item = document.createElement('div');
                const itemClasses = ['star-map-search-item', ...getItemClassesForStarName(match)];
                item.className = itemClasses.join(' ');
                item.setAttribute('role', 'option');
                item.textContent = match;
                item.addEventListener('mousedown', (event) => {
                    event.preventDefault();
                    if (searchInput) {
                        searchInput.value = match;
                    }
                    selectStarByName(match);
                    runSearchSelectionPing(match);
                    if (typeof syncOverlayVisibility === 'function') {
                        syncOverlayVisibility();
                    }
                    closeResults();
                });
                resultsEl.appendChild(item);
            });

            resultsEl.classList.remove('invisible');
        };

        if (searchInput && resultsEl) {
            const overlayEl = headerRow.querySelector('#starMapSearchOverlay');
            const overlayTextEl = headerRow.querySelector('#starMapSearchOverlay .star-map-search-overlay-text');
            const allStars = getStarNames();

            const syncOverlayVisibility = () => {
                if (!overlayTextEl) {
                    return;
                }
                const hasValue = (searchInput.value || '').trim().length > 0;
                const focused = document.activeElement === searchInput;
                const shouldHide = focused || hasValue;
                overlayTextEl.classList.toggle('invisible', shouldHide);
            };

            globalThis.__starMapSearchSyncOverlayVisibility = syncOverlayVisibility;

            const onSearchInput = () => {
                const query = (searchInput.value || '').trim();
                if (query.length < 2) {
                    closeResults();
                    syncOverlayVisibility();
                    return;
                }

                const lower = query.toLowerCase();
                const manuscripts = getStarsWithAncientManuscripts?.() || [];
                const revealedFactoryStars = new Set(
                    manuscripts
                        .filter((entry) => Array.isArray(entry) && entry.length >= 4 && entry[3] === true)
                        .map((entry) => String(entry[1]).toLowerCase())
                );
                const factoryStars = new Set((getFactoryStarsArray() || []).map((name) => String(name).toLowerCase()));

                const matches = allStars
                    .filter((name) => String(name).toLowerCase().includes(lower))
                    .filter((name) => {
                        const normalizedLower = String(name).toLowerCase();
                        if (!factoryStars.has(normalizedLower)) {
                            return true;
                        }
                        return revealedFactoryStars.has(normalizedLower);
                    })
                    .slice(0, 50);

                renderResults(matches);
                syncOverlayVisibility();
            };

            searchInput.addEventListener('input', onSearchInput);
            searchInput.addEventListener('focus', () => {
                if ((searchInput.value || '').trim().length > 0) {
                    searchInput.value = '';
                }
                closeResults();
                syncOverlayVisibility();
            });
            searchInput.addEventListener('blur', () => {
                closeResults();
                syncOverlayVisibility();
            });
            searchInput.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    closeResults();
                    syncOverlayVisibility();
                }
            });

            if (overlayEl) {
                overlayEl.addEventListener('mousedown', (event) => {
                    event.preventDefault();
                    searchInput.focus();
                });
            }

            syncOverlayVisibility();

            if (!globalThis.__starMapSearchOutsideClickListenerAttached) {
                globalThis.__starMapSearchOutsideClickListenerAttached = true;
                document.addEventListener('click', (event) => {
                    const target = event.target;
                    const searchRow = document.getElementById('starMapSearchRow');
                    if (!searchRow) {
                        return;
                    }
                    if (target instanceof Node && searchRow.contains(target)) {
                        return;
                    }
                    const resultsEl = document.getElementById('starMapSearchResults');
                    resultsEl?.classList.add('invisible');
                    if (resultsEl) {
                        resultsEl.innerHTML = '';
                    }
                });
            }
        }
        
        setupInfoTooltips();
    }

    if (heading === 'Star Data') {
        let currentStarName = getCurrentStarSystem();
        let starsData = getStarSystemDataObject('stars');
        const settledStars = getSettledStars();
        const factoryStarsList = getFactoryStarsArray();
        const ancientManuscripts = getStarsWithAncientManuscripts?.() || [];

        const normalizedCurrentLower = String(currentStarName || '').toLowerCase();
        const destinationStarLower = 'destinationstar';
        const settledLowerToOriginal = new Map(
            (settledStars || [])
                .filter(Boolean)
                .map((name) => [String(name).toLowerCase(), String(name)])
        );

        Object.entries(Object.fromEntries(settledLowerToOriginal)).forEach(([settledLower, settledOriginal]) => {
            if (!settledLower) return;
            if (settledLower === normalizedCurrentLower) return;
            if (settledLower === destinationStarLower) return;
            if (!starsData?.[settledLower] && !starsData?.[settledOriginal]) {
                setStarSystemDataObject(
                    {
                        name: settledOriginal,
                        distance: Number.POSITIVE_INFINITY,
                        fuel: Number.POSITIVE_INFINITY,
                        ascendencyPoints: 0,
                        starType: getStarTypeByName(settledOriginal),
                        weatherTendency: null,
                        weather: null,
                        precipitationType: 'Unknown'
                    },
                    'stars',
                    [settledLower]
                );
            }
        });

        starsData = getStarSystemDataObject('stars');

        let starsObject = Object.fromEntries(
            Object.entries(starsData).filter(([starName]) => {
                if (starName === currentStarName || starName === 'destinationStar') return false;

                const normalizedLower = String(starName || '').toLowerCase();
                const hasRevealedManuscript = ancientManuscripts.some(
                    (entry) => Array.isArray(entry) && entry[1] === normalizedLower && entry[3] === true
                );
                const isRevealedFactoryStar = factoryStarsList.includes(normalizedLower) && hasRevealedManuscript;

                const isSettled = settledStars.includes(starName);
                return !isSettled || isRevealedFactoryStar || isSettled;
            })
        );

        const starLegendCells = document.createElement('div');
        starLegendCells.classList.add('star-table-cells');
        starLegendCells.append(
            createTextElement(
                localize('textAsteroidDistance', getLanguage()),
                'starLegendDistance',
                ['sort-by', 'label-star'],
                (event) => handleSortStarClick('distance')
            ),
            createTextElement(
                localize('textStarType', getLanguage()),
                'starLegendType',
                ['sort-by', 'label-star'],
                (event) => handleSortStarClick('type')
            ),
            createTextElement(
                `<span class="inline-icon-header">${localize('textStarWeather', getLanguage())} <p id="info_starLegendWeather" class="info-emoji">ℹ️</p></span>`,
                'starLegendWeatherProb',
                ['sort-by', 'label-star'],
                (event) => handleSortStarClick('weather')
            ),
            createTextElement(
                localize('textStarPrecipitation', getLanguage()),
                'starLegendPrecipitationType',
                ['sort-by', 'label-star'],
                (event) => handleSortStarClick('precipitationType')
            ),
            createTextElement(
                localize('textStarFuel', getLanguage()),
                'starLegendFuel',
                ['no-sort', 'label-star'],
                (event) => handleSortStarClick('fuel')
            ),
            createTextElement(
                localize('textStarAscendencyPoints', getLanguage()),
                'starLegendAscendencyPoints',
                ['no-sort', 'label-star'],
                (event) => handleSortStarClick('ascendencyPoints')
            )
        );

        const starLegendRow = createOptionRow({
            labelId: `starLegendRow`,
            renderNameABs: null,
            labelText: localize('tab6SortByRowLabel', getLanguage()),
            inputElements: [
                starLegendCells,
            ],
            descriptionText: ``,
            resourcePriceObject: '',
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'star',
            noDescriptionContainer: [true, '10%', '90%']
        });

        optionContentElement.appendChild(starLegendRow);

        let sortedStars = sortStarTable(starsObject, getSortStarMethod());

        const settledStarNameSet = new Set((settledStars || []).map((n) => String(n || '').toLowerCase()));
        const sortedEntries = Object.entries(sortedStars);
        const nonSettledEntries = sortedEntries.filter(([nameStar]) => !settledStarNameSet.has(String(nameStar || '').toLowerCase()));
        const settledEntries = sortedEntries
            .filter(([nameStar]) => settledStarNameSet.has(String(nameStar || '').toLowerCase()))
            .sort(([a], [b]) => String(a || '').localeCompare(String(b || '')));

        [...nonSettledEntries, ...settledEntries].forEach(([nameStar, star]) => {
            const normalizedLower = String(nameStar || '').toLowerCase();
            const hasRevealedManuscript = ancientManuscripts.some(
                (entry) => Array.isArray(entry) && entry[1] === normalizedLower && entry[3] === true
            );
            const isRevealedFactoryStar = factoryStarsList.includes(normalizedLower) && hasRevealedManuscript;

            const { distance, fuel, ascendencyPoints, name, weatherTendency, weather, precipitationType } = star;
            const displayAscendencyPoints = getAscendencyPointsWithRepeatableBonus(ascendencyPoints);

            const safeWeatherTendency = getWeatherDisplayData(weatherTendency, weather);
            const safeDistance = Number.isFinite(distance) ? distance : Number(distance ?? 0);
            const safeFuel = Number.isFinite(fuel) ? fuel : Number(fuel ?? 0);
            const safePrecipitationType = localizePrecipitationType(star);
            const safeStarType = star?.starType ?? 'A';

            const weatherIconSpan = `<span class="${safeWeatherTendency[2]}">${safeWeatherTendency[0]}</span>`;
            const weatherText = `${weatherIconSpan} (${safeWeatherTendency[1]}%)`;

            const currentAntimatter = getResourceDataObject('antimatter', ['quantity']);
            const hasEnoughFuel = currentAntimatter >= fuel;
            const isSettled = settledStarNameSet.has(normalizedLower);
            const fuelClass = isSettled ? 'red-disabled-text' : (hasEnoughFuel ? 'green-ready-text' : 'red-disabled-text');

            const distanceText = isSettled ? localize('textSettled', getLanguage()) : `${safeDistance.toFixed(2)} ly`;
            const weatherTextDisplay = isSettled ? ' ' : weatherText;
            const precipitationText = isSettled ? ' ' : `${safePrecipitationType}`;
            const fuelText = isSettled ? localize('textSettled', getLanguage()) : `${safeFuel}`;

            const apText = isSettled ? ' ' : `${displayAscendencyPoints}`;

            const starDataCells = document.createElement('div');
            starDataCells.classList.add('star-table-cells');
            starDataCells.append(
                createTextElement(
                    distanceText,
                    'starInfoContainerDistance',
                    ['value-star', 'distance-star', fuelClass]
                ),
                createTextElement(
                    `${safeStarType}`,
                    'starInfoContainerType',
                    ['value-star', 'type-star']
                ),
                createTextElement(
                    weatherTextDisplay,
                    'starInfoContainerWeatherTendency',
                    ['value-star']
                ),
                createTextElement(
                    precipitationText,
                    'starInfoContainerPrecipitationType',
                    ['value-star']
                ),
                createTextElement(
                    fuelText,
                    'starInfoContainerFuel',
                    ['value-star', 'fuel-star', 'notation', fuelClass]
                ),
                createTextElement(
                    apText,
                    'starInfoContainerAscendencyPoints',
                    ['value-star', 'fuel-star', 'notation']
                )
            );

            const theme = getCurrentTheme?.() || 'terminal';
            const megaStructureIconHtml = isRevealedFactoryStar
                ? ` <img src="images/megaStructure/${theme}/DysonSphereActive.png" class="star-data-mega-icon" alt="" />`
                : '';

            const starNameClass = !hasEnoughFuel
                ? 'red-disabled-text'
                : isSettled
                    ? 'settled-star-text'
                    : isRevealedFactoryStar
                        ? 'factory-star-text'
                        : safeStarType === 'O'
                            ? 'o-star-text'
                            : 'green-ready-text';

            const starNameLabel = [
                `${capitaliseWordsWithRomanNumerals(nameStar)}:${megaStructureIconHtml}`,
                starNameClass
            ];

            const starRowName = `starRow_${name}`;

            const starDataRow = createOptionRow({
                labelId: `${starRowName}`,
                renderNameABs: null,
                labelText: starNameLabel,
                inputElements: [
                    starDataCells,
                ],
                descriptionText: ``,
                resourcePriceObject: '',
                dataConditionCheck: null,
                objectSectionArgument1: null,
                objectSectionArgument2: null,
                quantityArgument: null,
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'star',
                noDescriptionContainer: [true, '10%', '90%']
            });

            if (isSettled) {
                starDataRow.style.opacity = '0.5';
            }

            optionContentElement.appendChild(starDataRow);
        });

        setupInfoTooltips();
    }

    if (heading === 'Star Ship') {
        if (!starDestinationInfoRedraw) {
            const destinationStar = getDestinationStar();
            const destinationReminderRow = createOptionRow({
                labelId: `spaceStarShipDestinationReminderRow`,
                renderNameABs: null,
                labelText: '',
                inputElements: [],
                descriptionText: '',
                resourcePriceObject: '',
                dataConditionCheck: null,
                objectSectionArgument1: null,
                objectSectionArgument2: null,
                quantityArgument: null,
                autoBuyerTier: null,
                startInvisibleValue: null,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: null
            });

            const reminderMainRow = destinationReminderRow.querySelector('.option-row-main');
            if (reminderMainRow) {
                reminderMainRow.remove();
            }

            if (!getStarShipDestinationReminderVisible()) {
                destinationReminderRow.classList.add('invisible');
            }

            optionContentElement.appendChild(destinationReminderRow);

            const starShipModules = [
                { id: 'ssStructural' },
                { id: 'ssLifeSupport' },
                { id: 'ssAntimatterEngine' },
                { id: 'ssFleetHangar' },
                { id: 'ssStellarScanner' }
            ];

            starShipModules.forEach(module => {
                const starshipComponentBuildRow = createOptionRow({
                    labelId: `space${capitaliseString(module.id)}BuildRow`,
                    renderNameABs: null,
                    labelText: `${localizeStarShipModule(module.id)}:`,
                    inputElements: [
                        createButton({
                            text: localize('buttonBuildModule', getLanguage()),
                            classNames: ['option-button', 'red-disabled-text', 'building-purchase-button', 'resource-cost-sell-check'],
                            onClick: () => {
                                gain(1, `${module.id}BuiltPartsQuantity`, module.id, false, null, 'space', 'space');
                            },
                            dataConditionCheck: 'upgradeCheck',
                            resourcePriceObject: '',
                            objectSectionArgument1: 'spaceUpgrade',
                            objectSectionArgument2: module.id,
                            quantityArgument: 'cash',
                            disableKeyboardForButton: true,
                            autoBuyerTier: null,
                            rowCategory: 'starShipPurchase'
                        }),
                        createTextElement(
                            `${localize('textBuilt', getLanguage())} <span id="${module.id}BuiltPartsQuantity">${getStarShipParts(module.id)}</span> / <span id="${module.id}TotalPartsQuantity">${getStarShipPartsNeededInTotalPerModule(module.id)}</span>`,
                            `${module.id}PartsCountText`,
                            []
                        ),
                    ],
                    descriptionText: `${getCurrencySymbol() + getResourceDataObject('space', ['upgrades', module.id, 'price'])}, 
                    ${getResourceDataObject('space', ['upgrades', module.id, 'resource1Price'])[0]} ${spaceUpgradePriceName(module.id, 1)}, 
                    ${getResourceDataObject('space', ['upgrades', module.id, 'resource2Price'])[0]} ${spaceUpgradePriceName(module.id, 2)}, 
                    ${getResourceDataObject('space', ['upgrades', module.id, 'resource3Price'])[0]} ${spaceUpgradePriceName(module.id, 3)}`,
                    resourcePriceObject: '',
                    dataConditionCheck: 'upgradeCheck',
                    objectSectionArgument1: 'spaceUpgrade',
                    objectSectionArgument2: module.id,
                    quantityArgument: 'cash',
                    autoBuyerTier: null,
                    startInvisibleValue: false,
                    resourceString: null,
                    optionalIterationParam: null,
                    rowCategory: 'starShipPurchase'
                });

                optionContentElement.appendChild(starshipComponentBuildRow);
            });

            const starShipTravelRow = createOptionRow({
                labelId: `spaceStarShipTravelRow`,
                renderNameABs: null,
                labelText: localize('tab5TravellingToRowLabel', getLanguage()),
                inputElements: [
                    createTextElement(`${capitaliseWordsWithRomanNumerals(destinationStar || '')}`, `starShipDestinationStar`, ['green-ready-text', 'destination-text']),
                    createTextElement(`<div id="spaceTravelToStarProgressBar">`, `spaceTravelToStarProgressBarContainer`, ['progress-bar-container']),
                ],
                descriptionText: localize('textTravelling', getLanguage()),
                resourcePriceObject: '',
                dataConditionCheck: null,
                objectSectionArgument1: null,
                objectSectionArgument2: null,
                quantityArgument: null,
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'travel'
            });
            optionContentElement.appendChild(starShipTravelRow);

            const starShipStellarScannerRow = createOptionRow({
                labelId: `spaceStarShipStellarScannerRow`,
                renderNameABs: null,
                labelText: localize('tab5PerformSystemScanRowLabel', getLanguage()),
                inputElements: [
                    createButton({
                        text: localize('buttonScanSystem', getLanguage()),
                        classNames: ['option-button', 'green-ready-text'],
                        onClick: () => {
                            sfxPlayer.playAudio("asteroidScan");
                            setDestinationStarScanned(true);
                            copyStarDataToDestinationStarField(destinationStar);
                            generateDestinationStarData();
                            showNotification(localize('notificationSystemScanned', getLanguage()).replace('{star}', capitaliseWordsWithRomanNumerals(destinationStar)), 'info', 3000, 'starShip');

                            drawTab5Content('Star Ship', optionContentElement, true, false);
                        },
                        disableKeyboardForButton: true
                    }),
                ],
                descriptionText: localize('tab5ScanSystemDescription', getLanguage()).replace('{star}', capitaliseWordsWithRomanNumerals(destinationStar)),
                resourcePriceObject: '',
                dataConditionCheck: null,
                objectSectionArgument1: null,
                objectSectionArgument2: null,
                quantityArgument: null,
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: ''
            });
            optionContentElement.appendChild(starShipStellarScannerRow);
        }

        if (getDestinationStarScanned()) {
            drawLifeformData(optionContentElement);
            setupInfoTooltips();
        }

        function drawLifeformData(optionContentElement) {
            const starData = getStarSystemDataObject('stars', ['destinationStar']);
            const displayAscendencyPoints = getAscendencyPointsWithRepeatableBonus(starData.ascendencyPoints);
        
            const starNameRow = createOptionRow({
                labelId: 'starNameRow',
                renderNameABs: null,
                labelText: localize('tab5StarNameRowLabel', getLanguage()),
                inputElements: [
                    createTextElement(
                        capitaliseWordsWithRomanNumerals(getDestinationStar()),
                        'starNameText',
                        ['value-text']
                    ),
                    createTextElement(
                        `<span class="ap-destination-star-element-right">AP: <span class="green-ready-text">${displayAscendencyPoints}</span> <p id="info_starShipScanAP" class="info-emoji">ℹ️</p></span>
                    ${localize('labelLife', getLanguage())} <span class="${getStellarScannerBuilt() ? (starData.lifeDetected ? 'green-ready-text' : 'red-disabled-text') : 'red-disabled-text'}">
                        ${getStellarScannerBuilt() ? (starData.lifeDetected ? localize('textYes', getLanguage()) : localize('textNo', getLanguage())) : '???'}
                    </span>`,
                        'apContainer',
                        ['value-text', 'ap-destination-star-element']
                    ),
                    createTextElement(
                        `<span class="ap-destination-star-element-right">
                        ${localize('labelWeather', getLanguage())} <span class="${starData.weatherTendency[2]}">${starData.weatherTendency[0]}</span> 
                        (<span class="probability-text">${starData.weatherTendency[1]}</span>%) - 
                        <span class="${starData.precipitation !== 'water' ? 'green-ready-text' : ''}">
                            ${localizePrecipitationType(starData)} <p id="info_starShipScanPrecipitation" class="info-emoji">ℹ️</p>
                        </span>
                    </span>`,
                        'weatherContainer',
                        ['value-text', 'ap-destination-star-element']
                    ),
                ],
                descriptionText: '',
                resourcePriceObject: '',
                dataConditionCheck: null,
                objectSectionArgument1: null,
                objectSectionArgument2: null,
                quantityArgument: null,
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: '',
                noDescriptionContainer: [true, '15%', '85%']
            });            
        
            const civilizationRow = createOptionRow({
                labelId: 'civilizationLevelRow',
                renderNameABs: null,
                labelText: localize('tab5CivilizationRowLabel', getLanguage()),
                inputElements: [
                    createTextElement(
                        getStellarScannerBuilt() 
                            ? (starData.raceName === 'None' 
                                ? `<span class="green-ready-text">${localize('textNone', getLanguage())}</span>` 
                                : starData.raceName)
                            : `<span class="red-disabled-text">???</span>`,
                        'civilizationLevelText',
                        ['value-text']
                    ),
                    createTextElement(
                        `<span class="ap-destination-star-element-right">${localize('labelType', getLanguage())} 
                        <span class="${getStellarScannerBuilt() 
                            ? (starData.civilizationLevel === 'Unsentient' 
                                ? 'green-ready-text' 
                                : starData.civilizationLevel === 'Industrial' 
                                    ? 'warning-orange-text' 
                                    : starData.civilizationLevel === 'None' 
                                        ? 'green-ready-text' 
                                        : 'red-disabled-text') 
                            : 'red-disabled-text'}">
                            ${getStellarScannerBuilt() ? localizeCivilizationLevel(starData.civilizationLevel) : '???'}
                        </span> <p id="info_starShipScanType" class="info-emoji">ℹ️</p>
                    </span>`,
                        'apContainer',
                        ['value-text', 'ap-destination-star-element']
                    ),
                ],
                descriptionText: ``,
                resourcePriceObject: '',
                dataConditionCheck: null,
                objectSectionArgument1: null,
                objectSectionArgument2: null,
                quantityArgument: null,
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: '',
                noDescriptionContainer: [true, '15%', '85%']
            });            
        
        const traitsText = getStellarScannerBuilt() 
        ? starData.lifeformTraits.map(trait => 
            `<span class="${trait[1]}">${localizeTraitName(trait)}</span>`
        ).join(", ") 
        : `<span class="red-disabled-text">???</span>`;
        
        const populationText = getStellarScannerBuilt() 
        ? (starData.civilizationLevel === 'Unsentient' 
            ? localize('textNotApplicable', getLanguage()) 
            : (starData.populationEstimate ? starData.populationEstimate.toLocaleString() : localize('textNotApplicable', getLanguage()))) 
        : `<span class="red-disabled-text">???</span>`;
        
        
        const populationRow = createOptionRow({
            labelId: 'populationRow',
            renderNameABs: null,
            labelText: localize('tab5PopulationRowLabel', getLanguage()),
            inputElements: [
                createTextElement(
                    populationText,
                    'populationText',
                    ['value-text']
                ),
                createTextElement(
                    `<span class="ap-destination-star-element-right">${localize('labelTraits', getLanguage())} <span class="value-text">${traitsText}</span></span>`,
                    'traitsText',
                    ['value-text', 'ap-destination-star-element']
                ),
            ],
            descriptionText: ``,
            resourcePriceObject: '',
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: '',
            noDescriptionContainer: [true, '15%', '85%']
        });              
        
            let defenseClass = "";
            let defenseText = `${getStellarScannerBuilt() ? starData.defenseRating + '%' : '???'}`;
            
            if (getStellarScannerBuilt()) {
                if (starData.defenseRating > 75) {
                    defenseClass = "red-disabled-text";
                } else if (starData.defenseRating >= 50) {
                    defenseClass = "warning-orange-text";
                } else {
                    defenseClass = "green-ready-text";
                }
            } else {
                defenseClass = "red-disabled-text";
            }
            
            let threatLevelClass = "";
            const threatLevel = getStellarScannerBuilt() ? starData.threatLevel : '???';
            if (threatLevel === "None" || threatLevel === "Low") {
                threatLevelClass = "green-ready-text";
            } else if (threatLevel === "Moderate" || threatLevel === "High") {
                threatLevelClass = "warning-orange-text";
            } else if (threatLevel === "Extreme") {
                threatLevelClass = "red-disabled-text";
            } else {
                threatLevelClass = "red-disabled-text";
            }
        
        const threatRow = createOptionRow({
            labelId: 'threatLevelRow',
            renderNameABs: null,
            labelText: localize('tab5ThreatLevelRowLabel', getLanguage()),
            inputElements: [
                createTextElement(
                    `<span class="${threatLevelClass}">${localizeThreatLevel(threatLevel)}</span> <p id="info_starShipScanThreatLevel" class="info-emoji">ℹ️</p>`,
                    'threatLevelText',
                    [threatLevelClass]
                ),
                createTextElement(
                    `<span class="ap-destination-star-element-right">${localize('labelDefense', getLanguage())} <span class="value-text ${defenseClass}">${defenseText}</span> <p id="info_starShipScanDefense" class="info-emoji">ℹ️</p></span>`,
                    'defenseRatingText',
                    ['value-text', 'ap-destination-star-element']
                ),
            ],
            descriptionText: ``,
            resourcePriceObject: '',
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: '',
            noDescriptionContainer: [true, '15%', '85%']
        });                                           
        
        const fleetRow = createOptionRow({
            labelId: 'enemyFleetsRow',
            renderNameABs: null,
            labelText: localize('tab5EnemyFleetsRowLabel', getLanguage()),
            inputElements: [
                createTextElement(
                    `${localize('labelFleetAir', getLanguage())} <span class="${starData.civilizationLevel === 'None' 
                        ? 'green-ready-text' 
                        : (getStellarScannerBuilt() 
                            ? (starData.enemyFleets.fleetChanges.air.class || '') 
                            : 'red-disabled-text')}">
                        ${starData.civilizationLevel === 'None' 
                            ? localize('textNone', getLanguage()) 
                            : (getStellarScannerBuilt() 
                                ? starData.enemyFleets.air 
                                : '???')}
                    </span>`,
                    'fleetAirText',
                    ['value-text', 'ap-destination-star-element']
                ),
                createTextElement(
                    `${localize('labelFleetLand', getLanguage())} <span class="${starData.civilizationLevel === 'None' 
                        ? 'green-ready-text' 
                        : (getStellarScannerBuilt() 
                            ? (starData.enemyFleets.fleetChanges.land.class || '') 
                            : 'red-disabled-text')}">
                        ${starData.civilizationLevel === 'None' 
                            ? localize('textNone', getLanguage()) 
                            : (getStellarScannerBuilt() 
                                ? starData.enemyFleets.land 
                                : '???')}
                    </span>`,
                    'fleetLandText',
                    ['value-text', 'ap-destination-star-element']
                ),
                createTextElement(
                    `${localize('labelFleetSea', getLanguage())} <span class="${starData.civilizationLevel === 'None' 
                        ? 'green-ready-text' 
                        : (getStellarScannerBuilt() 
                            ? (starData.enemyFleets.fleetChanges.sea.class || '') 
                            : 'red-disabled-text')}">
                        ${starData.civilizationLevel === 'None' 
                            ? localize('textNone', getLanguage()) 
                            : (getStellarScannerBuilt() 
                                ? starData.enemyFleets.sea 
                                : '???')}
                    </span> <p id="info_starShipScanEnemyFleets" class="info-emoji">ℹ️</p>`,
                    'fleetSeaText',
                    ['value-text', 'ap-destination-star-element']
                ),                                                 
            ],
            descriptionText: ``,
            resourcePriceObject: '',
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: '',
            noDescriptionContainer: [true, '15%', '85%']
        });                    
        
        let anomaliesText;

        if (getFactoryStarsArray().includes(getDestinationStar())) {
            anomaliesText = `<span class="red-disabled-text">${localize('textMegastructure', getLanguage())}</span>`;
        } else if (starData.civilizationLevel === 'None') {
            anomaliesText = `<span>${localize('textNotApplicable', getLanguage())}</span>`;
        } else if (!getStellarScannerBuilt()) {
            anomaliesText = '<span class="red-disabled-text">???</span>';
        } else if (starData.anomalies.length === 0) {
            anomaliesText = `<span>${localize('textNone', getLanguage())}</span>`;
        } else {
            anomaliesText = starData.anomalies.map(a => {
                if (typeof a === 'string') {
                    return `<span class="red-disabled-text">${localizeAnomalyName(a)}</span>`;
                }

                if (a?.name === 'None') {
                    return `<span>${localize('textNotApplicable', getLanguage())}</span>`;
                }

                return `${localizeGeneratedAnomalyName(a)}: <span class="${a?.class}">${localizeGeneratedAnomalyEffect(a)}</span>`;
            }).join('<br/>');
        }
        
        const anomaliesRow = createOptionRow({
            labelId: 'anomaliesRow',
            renderNameABs: null,
            labelText: localize('tab5AnomaliesRowLabel', getLanguage()),
            inputElements: [
                createTextElement(
                    anomaliesText,
                    'anomaliesTextField',
                    ['value-text']
                ),
            ],
            descriptionText: ``,
            resourcePriceObject: '',
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: '',
            noDescriptionContainer: [true, '15%', '85%']
        });

        optionContentElement.appendChild(starNameRow);
        optionContentElement.appendChild(civilizationRow);
        optionContentElement.appendChild(populationRow);
        optionContentElement.appendChild(threatRow);
        optionContentElement.appendChild(fleetRow);
        optionContentElement.appendChild(anomaliesRow);
    }
}

    if (heading === 'Fleet Hangar') {
        const headerRow = document.getElementById('headerContentTab5');
        if (headerRow) {
            headerRow.innerHTML = `${localize('headerMainFleetHangar', getLanguage())} <p id="info_fleetHangarHeader" class="info-emoji">ℹ️</p>`;
        }
        
        const fleetShips = [
            { id: 'fleetEnvoy' },
            { id: 'fleetScout' },
            { id: 'fleetMarauder' },
            { id: 'fleetLandStalker' },
            { id: 'fleetNavalStrafer' }
        ];

        fleetShips.forEach(fleetShip => {
            const fleetShipBuildRow = createOptionRow({
                labelId: `space${capitaliseString(fleetShip.id)}BuildRow`,
                renderNameABs: null,
                labelText: `${localizeFleetShip(fleetShip.id)}:`,
                inputElements: [
                    createButton({
                        text: localize('buttonBuild', getLanguage()),
                        classNames: ['option-button', 'red-disabled-text', 'building-purchase-button', 'resource-cost-sell-check'],
                        onClick: () => {
                            gain(1, `${fleetShip.id}BuiltQuantity`, fleetShip.id, false, null, 'space', 'space');
                            increaseAttackAndDefensePower(fleetShip.id);
                            setFleetChangedSinceLastDiplomacy(true);
                            replaceBattleUnits({ player: [], enemy: [] });
                            setNeedNewBattleCanvas(true);
                            setFormationGoal(null);
                            setInFormation(false);
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'spaceUpgrade',
                        objectSectionArgument2: fleetShip.id,
                        quantityArgument: 'cash',
                        disableKeyboardForButton: true,
                        autoBuyerTier: null,
                        rowCategory: 'fleetPurchase'
                    }),
                    createTextElement(
                        fleetShip.id === 'fleetEnvoy' 
                        ? `${localize('textQuantity', getLanguage())}: <span id="${fleetShip.id}BuiltQuantity">${getFleetShips(fleetShip.id)}</span> / <span id="${fleetShip.id}BuiltQuantityMax">${getMaxFleetShip(fleetShip.id)}</span>`
                        : `${localize('textQuantity', getLanguage())}: <span id="${fleetShip.id}BuiltQuantity">${getFleetShips(fleetShip.id)}</span>`,
                    `${fleetShip.id}QuantityText`,
                    []
                    ),
                ],
                descriptionText: `${getCurrencySymbol() + getResourceDataObject('space', ['upgrades', fleetShip.id, 'price'])}, 
                ${getResourceDataObject('space', ['upgrades', fleetShip.id, 'resource1Price'])[0]} ${spaceUpgradePriceName(fleetShip.id, 1)}, 
                ${getResourceDataObject('space', ['upgrades', fleetShip.id, 'resource2Price'])[0]} ${spaceUpgradePriceName(fleetShip.id, 2)}, 
                ${getResourceDataObject('space', ['upgrades', fleetShip.id, 'resource3Price'])[0]} ${spaceUpgradePriceName(fleetShip.id, 3)}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'spaceUpgrade',
                objectSectionArgument2: fleetShip.id,
                quantityArgument: 'cash',
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'fleetPurchase'
            });
            optionContentElement.appendChild(fleetShipBuildRow);
        });
        setupInfoTooltips();
    }

    if (heading === 'Colonise') {
        setBattleResolved(false, null);
        
        if (getWarMode()) {
            setRedrawBattleDescription(true);
        }

        const starData = getStarSystemDataObject('stars', ['destinationStar']);

        if (getResourceDataObject('space', ['upgrades', 'fleetEnvoy', 'envoyBuiltYet']) && !getBelligerentEnemyFlag() && starData.civilizationLevel !== 'Unsentient' && starData.civilizationLevel !== 'None') {
            setAchievementFlagArray('initiateDiplomacyWithAlienRace', 'add');
        }

        if (getWarMode()) {
            setWarUI(true);
        }

        if (!diplomacyRedraw) {
            calculateModifiedAttitude(starData);
        }

        if (starData.patience <= 0 && !getWarMode()) {
            await showEnterWarModeModal('patience');
        }

        createColoniseOpinionProgressBar(optionContentElement);
        setColoniseOpinionProgressBar(starData.currentImpression, optionContentElement);
        
            const diplomacyOptionsRow = createOptionRow({
                labelId: 'diplomacyOptionsRow',
                renderNameABs: null,
                labelText: localize('tab5RelationsRowLabel', getLanguage()),
                inputElements: [
                    createButton({
                        text: localize('buttonBully', getLanguage()),
                        classNames: ['option-button', 'red-disabled-text', 'diplomacy-button', 'bully'],
                        onClick: () => {
                            setStarSystemDataObject(true, 'stars', ['destinationStar', 'triedToBully']);
                            updateDiplomacySituation('bully', starData);
                        },
                        disableKeyboardForButton: true,
                        rowCategory: 'diplomacy'
                    }),
                    createButton({
                        text: localize('buttonPassive', getLanguage()),
                        classNames: ['option-button', 'red-disabled-text', 'diplomacy-button', 'passive'],
                        onClick: () => {
                            updateDiplomacySituation('passive', starData);
                        },
                        disableKeyboardForButton: true,
                        rowCategory: 'diplomacy'
                    }),
                    createButton({
                        text: localize('buttonHarmony', getLanguage()),
                        classNames: ['option-button', 'red-disabled-text', 'diplomacy-button', 'harmony'],
                        onClick: () => {
                            updateDiplomacySituation('harmony', starData);
                        },
                        disableKeyboardForButton: true,
                        rowCategory: 'diplomacy'
                    }),
                    createButton({
                        text: localize('buttonVassalize', getLanguage()),
                        classNames: ['option-button', 'red-disabled-text', 'diplomacy-button', 'vassalize'],
                        onClick: () => {
                            updateDiplomacySituation('vassalize', starData);
                        },
                        disableKeyboardForButton: true,
                        rowCategory: 'diplomacy'
                    }),
                    createButton({
                        text: localize('buttonConquest', getLanguage()),
                        classNames: ['option-button', 'red-disabled-text', 'diplomacy-button', 'conquest'],
                        onClick: () => {
                            updateDiplomacySituation('conquest', starData);
                        },
                        disableKeyboardForButton: true,
                        rowCategory: 'diplomacy'
                    }),
                ],
                descriptionText: '',
                resourcePriceObject: '',
                dataConditionCheck: null,
                objectSectionArgument1: null,
                objectSectionArgument2: null,
                quantityArgument: null,
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: '',
                noDescriptionContainer: [true, '15%', '85%']
            });  

            const attitude = starData.attitude;
            const attitudeClass = attitude === "Neutral" || attitude === 'None'
                ? ""
                : attitude === "Receptive" || attitude === "Scared"
                    ? "green-ready-text"
                    : attitude === "Reserved"
                        ? "warning-orange-text"
                        : "red-disabled-text";            

            const threatLevel = starData.threatLevel;
            const threatLevelClass = threatLevel === "None" || threatLevel === "Low"
                ? "green-ready-text"
                : threatLevel === "Moderate" || threatLevel === "High"
                    ? "warning-orange-text"
                    : "red-disabled-text";

            const receptionStatusRow = createOptionRow({
                labelId: 'receptionStatusRow',
                renderNameABs: null,
                labelText: localize('tab5AttitudeRowLabel', getLanguage()),
                inputElements: [
                    createTextElement(
                        `<span class="${attitudeClass}">${localizeAttitude(attitude)}</span>`,
                        'attitudeText',
                        ['value-text', 'intelligence-element']
                    ),
                    createTextElement(
                        `${localize('labelThreat', getLanguage())} <span class="${threatLevelClass}">${localizeThreatLevel(threatLevel)}</span>`,
                        'threatLevelText',
                        [threatLevelClass, 'intelligence-element']
                    ),
                ],
                descriptionText: ``,
                resourcePriceObject: '',
                dataConditionCheck: null,
                objectSectionArgument1: null,
                objectSectionArgument2: null,
                quantityArgument: null,
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: '',
                noDescriptionContainer: [true, '15%', '85%']
            });  
            
            const traitsText = starData.lifeformTraits
            .slice(0, 2)
            .map(trait => `<span class="${trait[1]}">${localizeTraitName(trait)}</span>`)
            .join(", ");
        
            const defenseText = `${starData.defenseRating}%`;
            const defenseClass = starData.defenseRating > 75 
                ? "red-disabled-text" 
                : starData.defenseRating >= 50 
                    ? "warning-orange-text" 
                    : "green-ready-text"; 
        
            const intelligenceRow = createOptionRow({
                labelId: 'intelligenceRow',
                renderNameABs: null,
                labelText: localize('tab5IntelligenceRowLabel', getLanguage()),
                inputElements: [
                    createTextElement(
                        `<span class="${
                            starData.civilizationLevel === 'Unsentient' || starData.civilizationLevel === 'None'
                                ? 'green-ready-text'
                                : starData.civilizationLevel === 'Industrial'
                                    ? 'warning-orange-text'
                                    : 'red-disabled-text'
                        }">
                        ${localizeCivilizationLevel(starData.civilizationLevel)}
                    </span>`,
                        'apContainer',
                        ['value-text', 'intelligence-element']
                    ),
                    createTextElement(
                        `<span class="value-text">${traitsText}</span>`,
                        'traitsText',
                        ['value-text', 'intelligence-element']
                    ),
                    createTextElement(
                        `${localize('labelDefense', getLanguage())} <span class="value-text ${defenseClass}">${defenseText}</span>`,
                        'defenseRatingText',
                        ['value-text', 'intelligence-element']
                    ),
                ],
                descriptionText: ``,
                resourcePriceObject: '',
                dataConditionCheck: null,
                objectSectionArgument1: null,
                objectSectionArgument2: null,
                quantityArgument: null,
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: '',
                noDescriptionContainer: [true, '15%', '85%']
            });                                                           
        
            const fleetRow = createOptionRow({
                labelId: 'enemyFleetsRow',
                renderNameABs: null,
                labelText: localize('tab5EnemyFleetsRowLabel', getLanguage()),
                inputElements: [
                    createTextElement(
                        `${localize('labelFleetAir', getLanguage())} <span class="${starData.civilizationLevel === 'None' 
                            ? 'green-ready-text' 
                            : (getStellarScannerBuilt() 
                                ? (starData.enemyFleets.fleetChanges.air.class || '') 
                                : 'red-disabled-text')}">
                        ${starData.civilizationLevel === 'None' 
                            ? localize('textNone', getLanguage()) 
                            : (getStellarScannerBuilt() 
                                ? starData.enemyFleets.air 
                                : '???')}
                    </span>`,
                        'fleetAirText',
                        ['value-text', 'ap-destination-star-element']
                    ),
                    createTextElement(
                        `${localize('labelFleetLand', getLanguage())} <span class="${starData.civilizationLevel === 'None' 
                            ? 'green-ready-text' 
                            : (getStellarScannerBuilt() 
                                ? (starData.enemyFleets.fleetChanges.land.class || '') 
                                : 'red-disabled-text')}">
                        ${starData.civilizationLevel === 'None' 
                            ? localize('textNone', getLanguage()) 
                            : (getStellarScannerBuilt() 
                                ? starData.enemyFleets.land 
                                : '???')}
                    </span>`,
                        'fleetLandText',
                        ['value-text', 'ap-destination-star-element']
                    ),
                    createTextElement(
                        `${localize('labelFleetSea', getLanguage())} <span class="${starData.civilizationLevel === 'None' 
                            ? 'green-ready-text' 
                            : (getStellarScannerBuilt() 
                                ? (starData.enemyFleets.fleetChanges.sea.class || '') 
                                : 'red-disabled-text')}">
                        ${starData.civilizationLevel === 'None' 
                            ? localize('textNone', getLanguage()) 
                            : (getStellarScannerBuilt() 
                                ? starData.enemyFleets.sea 
                                : '???')}
                    </span> <p id="info_starShipScanEnemyFleets" class="info-emoji">ℹ️</p>`,
                        'fleetSeaText',
                        ['value-text', 'ap-destination-star-element']
                    ),
                ],
                descriptionText: ``,
                resourcePriceObject: '',
                dataConditionCheck: null,
                objectSectionArgument1: null,
                objectSectionArgument2: null,
                quantityArgument: null,
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: '',
                noDescriptionContainer: [true, '15%', '85%']
            });       
        
            optionContentElement.appendChild(diplomacyOptionsRow);
            optionContentElement.appendChild(receptionStatusRow);
            optionContentElement.appendChild(intelligenceRow);
            optionContentElement.appendChild(fleetRow);

            setFleetChangedSinceLastDiplomacy(false);
    }
}