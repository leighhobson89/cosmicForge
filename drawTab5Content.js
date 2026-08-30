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

/**
 * The three ids one star can be drawn under on the map.
 *
 * `generateStarfield` names the element for the star itself, prefixes a settled
 * one and prefixes one that is only scenery, so every lookup by name has to try
 * all three before deciding the star is not on the map.
 */
function findDrawnStarElement(starName) {
    const normalized = capitaliseWordsWithRomanNumerals(starName);
    return [
        normalized,
        `settledStar${normalized}`,
        `noneInterestingStar${normalized}`
    ]
        .map((id) => document.getElementById(id))
        .find(Boolean) || null;
}

// The ping is appended to `document.body`, not to the starfield, because it is
// positioned in viewport coordinates. That means nothing tears it down when the
// map goes away, so the mark and the timer that ends it are held here and can be
// cancelled from outside.
let activeSelectionPing = null;
let activeSelectionPingTimer = null;

/**
 * Take down the selection ping now.
 *
 * The animation repeats for four seconds to be findable, which is long enough
 * for a player to have left the pane before it ends. A mark pointing at a star
 * that is no longer on screen is worse than no mark, so leaving the star map, or
 * redrawing it in a mode that may not draw that star at all, cancels it.
 */
export function clearStarMapSelectionPing() {
    if (activeSelectionPingTimer !== null) {
        window.clearTimeout(activeSelectionPingTimer);
        activeSelectionPingTimer = null;
    }

    activeSelectionPing = null;

    // Swept by class rather than by the reference alone: a ping from a previous
    // draw whose reference was replaced would otherwise outlive everything.
    document.querySelectorAll('.star-map-search-selection-ping').forEach((element) => element.remove());
}

/**
 * Drop the selection ping over a star on the map.
 *
 * The ping is a fixed-position element placed over the star's current rectangle,
 * so it only means anything in the two modes that draw the star where the player
 * can see it. Any previous mark is taken down first, so repeated selections
 * replace one another rather than piling up.
 */
function runSearchSelectionPing(starName) {
    const modeLower = String(getStarMapMode?.() || '').toLowerCase();
    if (modeLower !== 'normal' && modeLower !== 'distance') {
        return;
    }

    const starElement = findDrawnStarElement(starName);

    if (!starElement) {
        return;
    }

    clearStarMapSelectionPing();

    const rect = starElement.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const ping = document.createElement('div');
    ping.style.left = `${x}px`;
    ping.style.top = `${y}px`;
    ping.className = 'star-map-search-selection-ping green-ready-text';

    document.body.appendChild(ping);
    activeSelectionPing = ping;

    activeSelectionPingTimer = window.setTimeout(() => {
        ping.remove();
        if (activeSelectionPing === ping) {
            activeSelectionPing = null;
        }
        activeSelectionPingTimer = null;
    }, 4100);
}

/**
 * Select a star on the map by name, exactly as clicking it would.
 *
 * The click handler `generateStarfield` puts on each star is the only thing that
 * draws the connection line, builds the destination row and calls
 * `setDestinationStar` — and it is also where the travel guard lives. Dispatching
 * at the element rather than duplicating any of that is what keeps the search box
 * and the Star Data table agreeing with a plain click on the map.
 */
function selectStarByName(starName) {
    const starContainer = document.querySelector('#optionContentTab5');
    if (!starContainer) {
        return;
    }

    const normalized = capitaliseWordsWithRomanNumerals(starName);
    const starElement = findDrawnStarElement(starName);

    if (starElement) {
        starElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    } else {
        showNotification(localize('notificationStarNotFoundOnMap', getLanguage()).replace('{star}', normalized), 'warning', 2500, 'starMap');
    }
}

/**
 * P4: take the player to the star map and ping one star there.
 *
 * This is the whole of what the globe button on a Star Data row does. It is
 * deliberately *showing*, not choosing: the destination is left exactly as the
 * player left it, and nothing here cares whether the star ship is in flight.
 * Picking a destination stays the map's own job, one click away once the player
 * can see where the star is.
 *
 * Two details are load-bearing. The mode is set *before* the pane is drawn,
 * because the map-mode buttons take their highlight from `getStarMapMode()` at
 * draw time, and the ping can only be placed in a mode that draws the star
 * somewhere visible. And the navigation goes through the side-menu row rather
 * than calling the draw directly, so the row highlight, the remembered screen and
 * the current option pane are all set by the listener that already owns them; the
 * Star Map branch of `drawTab5Content` contains no `await`, so the field is on
 * screen by the time the click returns.
 */
function focusStarOnStarMap(starName) {
    if (!starName) {
        return false;
    }

    const starMapOption = document.getElementById('starMapOption');
    if (!starMapOption) {
        return false;
    }

    setStarMapMode('normal');
    starMapOption.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // A star the table lists but the field never drew has nothing to ping. Say so,
    // the same way the search box does with a name it cannot place, rather than
    // leaving the player on a map wondering which speck flashed.
    if (!findDrawnStarElement(starName)) {
        const normalized = capitaliseWordsWithRomanNumerals(starName);
        showNotification(localize('notificationStarNotFoundOnMap', getLanguage()).replace('{star}', normalized), 'warning', 2500, 'starMap');
        return true;
    }

    runSearchSelectionPing(starName);

    return true;
}

/**
 * P4: the globe button that sits at the head of a star's name in the Star Data
 * table.
 *
 * It carries no gate of its own. Showing a player where a star is cannot go
 * wrong — not while the ship is in flight, and not when the trip is unaffordable
 * — so the button is live on every row the table still considers a place to go.
 */
function createStarShowOnMapButton(starName) {
    const button = document.createElement('span');
    button.id = `starShowOnMapButton_${starName}`;
    button.className = 'star-target-button';
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    button.dataset.star = String(starName);
    button.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9"></circle>
            <ellipse cx="12" cy="12" rx="4.2" ry="9"></ellipse>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <path d="M5.2 6.6h13.6"></path>
            <path d="M5.2 17.4h13.6"></path>
        </svg>
    `;

    button.title = localize('tooltipShowStarOnMap', getLanguage());
    button.setAttribute('aria-label', button.title);

    button.addEventListener('click', (event) => {
        event.stopPropagation();
        focusStarOnStarMap(starName);
    });

    return button;
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
                    // The field is about to be thrown away and redrawn, and two of the
                    // four modes do not draw every star at all, so a mark left over
                    // from a search or a Star Data globe would point at nothing.
                    clearStarMapSelectionPing();
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

        // P4: the ping is shared with the Star Data table's globe button, so it and
        // the star lookup it needs live at module scope rather than in this closure.
        // The click-through moved with it for the same reason, even though only the
        // search box selects a star: the search chooses a destination, the globe only
        // shows the player where one is.

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

        // P4: the left-hand slot used to be a static "Sort By:" caption sitting over
        // a column that is in fact the star's name. It is now the Name header, and it
        // sorts like the six on its right.
        const starLegendRow = createOptionRow({
            labelId: `starLegendRow`,
            renderNameABs: null,
            labelText: localize('textStarName', getLanguage()),
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
            noDescriptionContainer: [true, '15%', '85%']
        });

        // The header is the row's own label element rather than a seventh cell in
        // `starLegendCells`, because the name it heads is drawn in the label column
        // too. It is given the id here because `sortStarTable` finds every header by
        // id when it moves the `sort-by` marker onto whichever column is active.
        //
        // The info icon carries the whole of what this column now does — that the
        // header sorts, and that the globe on each row shows the star on the map —
        // because neither is discoverable from a globe glyph alone. It is wired the
        // same way as the Weather header's icon: `setupInfoTooltips` at the end of
        // this branch binds every `.info-emoji` to its entry in
        // `infoTooltipDescriptions`, keyed by id.
        const starLegendNameHeader = starLegendRow.querySelector('.label-container .label-text');
        if (starLegendNameHeader) {
            starLegendNameHeader.id = 'starLegendName';
            starLegendNameHeader.classList.add('sort-by', 'label-star', 'star-legend-name');
            starLegendNameHeader.innerHTML = `<span class="inline-icon-header">${localize('textStarName', getLanguage())} <p id="info_starLegendName" class="info-emoji">ℹ️</p></span>`;
            starLegendNameHeader.addEventListener('click', (event) => {
                // Reading the tip is not a request to re-sort the table under it.
                if (event.target.closest('.info-emoji')) {
                    return;
                }
                handleSortStarClick('name');
            });
        }

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

            // P4: no trailing colon. Every other row in the game reads
            // "<thing>: <control>", but this column is now a sortable header over a
            // list of names rather than a label introducing the cells beside it.
            const starNameLabel = [
                `${capitaliseWordsWithRomanNumerals(nameStar)}${megaStructureIconHtml}`,
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
                noDescriptionContainer: [true, '15%', '85%']
            });

            if (isSettled) {
                starDataRow.style.opacity = '0.5';
            }

            // P4: a settled star is not a place to go any more — its distance,
            // weather, precipitation and AP cells are already blanked — so it gets no
            // globe. Every other row does, in the name column, because the button
            // acts on the star rather than on any one of the six figures.
            //
            // It goes *before* the name rather than after it. The name column is a
            // fixed fraction of the row and a long star name overflows it, so a
            // trailing button ends up drawn underneath the value cells, which are
            // later siblings and therefore paint over it. At the head of the column
            // it is always inside its own box, and a megastructure star's icon still
            // sits where it always did, at the end of the name.
            if (!isSettled) {
                starDataRow.querySelector('.label-container')?.prepend(createStarShowOnMapButton(nameStar));
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

        // The destination record is legitimately absent at points in the run —
        // notably right after a battle resolves, when this pane is redrawn.
        // Everything below is built from it: the opinion bar, the diplomacy
        // rows, the enemy-fleet readout, and the click handlers that close over
        // it. None of that is meaningful without the record, so bail rather than
        // draw a pane full of undefined.
        //
        // This is the last branch in the function, so returning here skips
        // nothing else. It was previously unguarded, and because
        // drawTab5Content is async and called unawaited from the pane click
        // handler, the throw surfaced as an unhandled promise rejection and
        // left the pane half-drawn — four of them per battle fought.
        if (!starData) {
            return;
        }

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