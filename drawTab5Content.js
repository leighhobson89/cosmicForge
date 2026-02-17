import { removeTabAttentionIfNoIndicators, createColoniseOpinionProgressBar, setColoniseOpinionProgressBar, spaceTravelButtonHideAndShowDescription, drawStarConnectionDrawings, createStarDestinationRow, sortStarTable, handleSortStarClick, createTextElement, createOptionRow, createButton, generateStarfield, showNotification, showEnterWarModeModal, setWarUI, removeStarConnectionTooltip } from './ui.js';
import { sfxPlayer } from './audioManager.js';
import { getStarNames, getStarTypeByName } from './descriptions.js';
import { getFactoryStarsArray, getSettledStars, setInFormation, setRedrawBattleDescription, setFleetChangedSinceLastDiplomacy, setDestinationStarScanned, getDestinationStarScanned, getStellarScannerBuilt, getStarShipTravelling, getDestinationStar, getCurrencySymbol, getSortStarMethod, getCurrentStarSystem, STAR_FIELD_SEED, NUMBER_OF_STARS, getStarMapMode, setStarMapMode, getWarMode, replaceBattleUnits, setNeedNewBattleCanvas, setFormationGoal, setBattleResolved, getBelligerentEnemyFlag, setAchievementFlagArray, getStarsWithAncientManuscripts, getStarShipDestinationReminderVisible, getStarVisionDistance, getMiaplacidusMilestoneLevel, getCurrentTheme } from './constantsAndGlobalVars.js';
import { getMaxFleetShip, getFleetShips, copyStarDataToDestinationStarField, getResourceDataObject, getStarShipParts, getStarShipPartsNeededInTotalPerModule, getStarSystemDataObject, setStarSystemDataObject } from './resourceDataObject.js';
import { capitaliseString, capitaliseWordsWithRomanNumerals } from './utilityFunctions.js';
import { updateDiplomacySituation, calculateModifiedAttitude, increaseAttackAndDefensePower, generateDestinationStarData, gain, getAscendencyPointsWithRepeatableBonus } from './game.js';

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
    const optionElement = document.getElementById(heading.toLowerCase().replace(/\s(.)/g, (match, group1) => group1.toUpperCase()).replace(/\s+/g, '') + 'Option');
    if (optionElement) {
        const warningIcon = optionElement.querySelector('span.attention-indicator');
        if (warningIcon && warningIcon.innerHTML.includes('⚠️')) {
            warningIcon.remove();
        }
    }
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
                <div id="starMapNameField" class="star-map-name-field">Star Map</div>
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
                        <span class="star-map-search-overlay-text">Search Star...</span>
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
                overlayTextEl.textContent = enabled ? 'Search Star...' : 'Normal/Dist Mode...';
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

        const buttons = ['Normal', 'Distance', 'Studied', 'In Range'];
        
        buttons.forEach(button => {
            const buttonElement = createButton(button, ['option-button', 'star-option-button'], () => { 
                document.querySelectorAll('.star-option-button').forEach(btn => {
                    btn.classList.remove('green-ready-text');
                });
    
                buttonElement.classList.add('green-ready-text');
                
                setStarMapMode(button.toLowerCase());
                setSearchEnabledForMode(button.toLowerCase());

                removeStarConnectionTooltip();
                const destinationRow = document.getElementById('descriptionContentTab5');
                if (destinationRow) {
                    destinationRow.innerHTML = 'This is a map of the known galaxy.';
                }

                const starContainer = document.querySelector('#optionContentTab5');
                starContainer.innerHTML = '';
                generateStarfield(starContainer, NUMBER_OF_STARS, STAR_FIELD_SEED, getStarMapMode(), false, null, false);
            }, '', '', '', null, '', true, null, '');
            
            starButtonContainer.appendChild(buttonElement);

            if (buttonElement.innerHTML.toLowerCase() === getStarMapMode()) {
                buttonElement.classList.add('green-ready-text');
            }
        });
        
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
                showNotification(`Star not found on map: ${normalized}`, 'warning', 2500, 'starMap');
            }
        };

        const renderResults = (matches) => {
            if (!resultsEl) {
                return;
            }

            resultsEl.innerHTML = '';

            if (matches.length === 0) {
                resultsEl.innerHTML = `<div class="star-map-search-item red-disabled-text" role="option">No matches</div>`;
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
                `Distance`,
                'starLegendDistance',
                ['sort-by', 'label-star'],
                (event) => handleSortStarClick('distance')
            ),
            createTextElement(
                `Type`,
                'starLegendType',
                ['sort-by', 'label-star'],
                (event) => handleSortStarClick('type')
            ),
            createTextElement(
                `Weather`,
                'starLegendWeatherProb',
                ['sort-by', 'label-star'],
                (event) => handleSortStarClick('weather')
            ),
            createTextElement(
                `Precipitation`,
                'starLegendPrecipitationType',
                ['sort-by', 'label-star'],
                (event) => handleSortStarClick('precipitationType')
            ),
            createTextElement(
                `Fuel (AM)`,
                'starLegendFuel',
                ['no-sort', 'label-star'],
                (event) => handleSortStarClick('fuel')
            ),
            createTextElement(
                `AP`,
                'starLegendAscendencyPoints',
                ['no-sort', 'label-star'],
                (event) => handleSortStarClick('ascendencyPoints')
            )
        );

        const starLegendRow = createOptionRow(
            `starLegendRow`,
            null,
            `Sort By:`,
            starLegendCells,
            null,
            null,
            null,
            null,
            ``,
            '',
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            'star',
            [true, '10%', '90%']
        );

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
            const safePrecipitationType = precipitationType ? capitaliseString(precipitationType) : 'Unknown';
            const safeStarType = star?.starType ?? 'A';

            const weatherIconSpan = `<span class="${safeWeatherTendency[2]}">${safeWeatherTendency[0]}</span>`;
            const weatherText = `${weatherIconSpan} (${safeWeatherTendency[1]}%)`;

            const currentAntimatter = getResourceDataObject('antimatter', ['quantity']);
            const hasEnoughFuel = currentAntimatter >= fuel;
            const fuelClass = hasEnoughFuel ? 'green-ready-text' : 'red-disabled-text';

            const isSettled = settledStarNameSet.has(normalizedLower);

            const distanceText = isSettled ? 'Settled' : `${safeDistance.toFixed(2)} ly`;
            const weatherTextDisplay = isSettled ? ' ' : weatherText;
            const precipitationText = isSettled ? ' ' : `${safePrecipitationType}`;
            const fuelText = isSettled ? 'Settled' : `${safeFuel}`;
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

            const starDataRow = createOptionRow(
                `${starRowName}`,
                null,
                starNameLabel,
                starDataCells,
                null,
                null,
                null,
                null,
                ``,
                '',
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                'star',
                [true, '10%', '90%']
            );

            if (isSettled) {
                starDataRow.style.opacity = '0.5';
            }

            optionContentElement.appendChild(starDataRow);
        });
    }
    if (heading === 'Star Ship') {
        if (!starDestinationInfoRedraw) {
            const destinationStar = getDestinationStar();
            const destinationReminderRow = createOptionRow(
                `spaceStarShipDestinationReminderRow`,
                null,
                '',
                null,
                null,
                null,
                null,
                null,
                '',
                '',
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
            );

            const reminderMainRow = destinationReminderRow.querySelector('.option-row-main');
            if (reminderMainRow) {
                reminderMainRow.remove();
            }

            if (!getStarShipDestinationReminderVisible()) {
                destinationReminderRow.classList.add('invisible');
            }

            optionContentElement.appendChild(destinationReminderRow);

            const starShipModules = [
                { id: 'ssStructural', label: 'Structural' },
                { id: 'ssLifeSupport', label: 'Life Support Module' },
                { id: 'ssAntimatterEngine', label: 'Antimatter Engine' },
                { id: 'ssFleetHangar', label: 'Fleet Hangar' },
                { id: 'ssStellarScanner', label: 'Stellar Scanner' }
            ];

            starShipModules.forEach(module => {
                const starshipComponentBuildRow = createOptionRow(
                    `space${capitaliseString(module.id)}BuildRow`,
                    null,
                    `${module.label}:`,
                    createButton(`Build Module`, ['option-button', 'red-disabled-text', 'building-purchase-button', 'resource-cost-sell-check'], () => {
                        gain(1, `${module.id}BuiltPartsQuantity`, module.id, false, null, 'space', 'space');
                    }, 'upgradeCheck', '', 'spaceUpgrade', module.id, 'cash', true, null, 'starShipPurchase'),
                    createTextElement(
                        `Built: <span id="${module.id}BuiltPartsQuantity">${getStarShipParts(module.id)}</span> / <span id="${module.id}TotalPartsQuantity">${getStarShipPartsNeededInTotalPerModule(module.id)}</span>`,
                        `${module.id}PartsCountText`,
                        []
                    ),
                    null,
                    null,
                    null,
                    `${getCurrencySymbol() + getResourceDataObject('space', ['upgrades', module.id, 'price'])}, 
                    ${getResourceDataObject('space', ['upgrades', module.id, 'resource1Price'])[0]} ${capitaliseString(getResourceDataObject('space', ['upgrades', module.id, 'resource1Price'])[1])}, 
                    ${getResourceDataObject('space', ['upgrades', module.id, 'resource2Price'])[0]} ${capitaliseString(getResourceDataObject('space', ['upgrades', module.id, 'resource2Price'])[1])}, 
                    ${getResourceDataObject('space', ['upgrades', module.id, 'resource3Price'])[0]} ${capitaliseString(getResourceDataObject('space', ['upgrades', module.id, 'resource3Price'])[1])}`,
                    '',
                    'upgradeCheck',
                    'spaceUpgrade',
                    module.id,
                    'cash',
                    null,
                    false,
                    null,
                    null,
                    'starShipPurchase'
                );

                optionContentElement.appendChild(starshipComponentBuildRow);
            });

            const starShipTravelRow = createOptionRow(
                `spaceStarShipTravelRow`,
                null,
                `Travelling To:`,
                createTextElement(`${capitaliseWordsWithRomanNumerals(destinationStar || '')}`, `starShipDestinationStar`, ['green-ready-text', 'destination-text']),
                createTextElement(`<div id="spaceTravelToStarProgressBar">`, `spaceTravelToStarProgressBarContainer`, ['progress-bar-container']),
                null,
                null,
                null,
                `Travelling...`,
                '',
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                'travel'
            );
            optionContentElement.appendChild(starShipTravelRow);

            const starShipStellarScannerRow = createOptionRow(
                `spaceStarShipStellarScannerRow`,
                null,
                `Perform System Scan:`,
                createButton(`Scan System`, ['option-button', 'green-ready-text'], () => {
                    sfxPlayer.playAudio("asteroidScan");
                    setDestinationStarScanned(true);
                    copyStarDataToDestinationStarField(destinationStar);
                    generateDestinationStarData();
                    showNotification(`${capitaliseWordsWithRomanNumerals(destinationStar)} System Scanned!`, 'info', 3000, 'starShip');

                    drawTab5Content('Star Ship', optionContentElement, true, false);
                }, '', '', '', null, '', true, null, ''),
                null,
                null,
                null,
                null,
                `Scan ${capitaliseWordsWithRomanNumerals(destinationStar)} System`,
                '',
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                ''
            );
            optionContentElement.appendChild(starShipStellarScannerRow);
        }

        if (getDestinationStarScanned()) {
            drawLifeformData(optionContentElement);
        }

        function drawLifeformData(optionContentElement) {
            const starData = getStarSystemDataObject('stars', ['destinationStar']);
            const displayAscendencyPoints = getAscendencyPointsWithRepeatableBonus(starData.ascendencyPoints);
        
            const starNameRow = createOptionRow(
                'starNameRow',
                null,
                'Star Name:',
                createTextElement(
                    capitaliseWordsWithRomanNumerals(getDestinationStar()),
                    'starNameText',
                    ['value-text']
                ),
                createTextElement(
                    `<span class="ap-destination-star-element-right">AP: <span class="green-ready-text">${displayAscendencyPoints}</span></span>
                    Life: <span class="${getStellarScannerBuilt() ? (starData.lifeDetected ? 'green-ready-text' : 'red-disabled-text') : 'red-disabled-text'}">
                        ${getStellarScannerBuilt() ? (starData.lifeDetected ? 'Yes' : 'No') : '???'}
                    </span>`,
                    'apContainer',
                    ['value-text', 'ap-destination-star-element']
                ),                             
                createTextElement(
                    `<span class="ap-destination-star-element-right">
                        Weather: <span class="${starData.weatherTendency[2]}">${starData.weatherTendency[0]}</span> 
                        (<span class="probability-text">${starData.weatherTendency[1]}</span>%) - 
                        <span class="${starData.precipitation !== 'water' ? 'green-ready-text' : ''}">
                            ${capitaliseString(starData.precipitationType)}
                        </span>
                    </span>`,
                    'weatherContainer',
                    ['value-text', 'ap-destination-star-element']
                ),                
                null,
                null,
                '',
                '',
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                '',
                [true, '15%', '85%']
            );            
        
            const civilizationRow = createOptionRow(
                'civilizationLevelRow',
                null,
                'Civilization:',
                createTextElement(
                    getStellarScannerBuilt() 
                        ? (starData.raceName === 'None' 
                            ? '<span class="green-ready-text">None</span>' 
                            : starData.raceName)
                        : `<span class="red-disabled-text">???</span>`,
                    'civilizationLevelText',
                    ['value-text']
                ),                
                createTextElement(
                    `<span class="ap-destination-star-element-right">Type: 
                        <span class="${getStellarScannerBuilt() 
                            ? (starData.civilizationLevel === 'Unsentient' 
                                ? 'green-ready-text' 
                                : starData.civilizationLevel === 'Industrial' 
                                    ? 'warning-orange-text' 
                                    : starData.civilizationLevel === 'None' 
                                        ? 'green-ready-text' 
                                        : 'red-disabled-text') 
                            : 'red-disabled-text'}">
                            ${getStellarScannerBuilt() ? starData.civilizationLevel : '???'}
                        </span>
                    </span>`,
                    'apContainer',
                    ['value-text', 'ap-destination-star-element']
                ),                    
                null,                               
                null,
                null,
                ``,
                '',
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                '',
                [true, '15%', '85%']
            );            
        
        const traitsText = getStellarScannerBuilt() 
        ? starData.lifeformTraits.map(trait => 
            `<span class="${trait[1]}">${trait[0]}</span>`
        ).join(", ") 
        : `<span class="red-disabled-text">???</span>`;
        
        const populationText = getStellarScannerBuilt() 
        ? (starData.civilizationLevel === 'Unsentient' 
            ? 'N/A' 
            : (starData.populationEstimate ? starData.populationEstimate.toLocaleString() : 'N/A')) 
        : `<span class="red-disabled-text">???</span>`;
        
        
        const populationRow = createOptionRow(
            'populationRow',
            null,
            'Population:',
            createTextElement(
                populationText,
                'populationText',
                ['value-text']
            ),
            createTextElement(
                `<span class="ap-destination-star-element-right">Traits: <span class="value-text">${traitsText}</span></span>`,
                'traitsText',
                ['value-text', 'ap-destination-star-element']
            ),
            null,                               
            null,
            null,
            ``,
            '',
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            '',
            [true, '15%', '85%']
        );              
        
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
            
            const threatRow = createOptionRow(
                'threatLevelRow',
                null,
                'Threat Level:',
                createTextElement(
                    `<span class="${threatLevelClass}">${threatLevel}</span>`,
                    'threatLevelText',
                    [threatLevelClass]
                ),
                createTextElement(
                    `<span class="ap-destination-star-element-right">Defense: <span class="value-text ${defenseClass}">${defenseText}</span></span>`,
                    'defenseRatingText',
                    ['value-text', 'ap-destination-star-element']
                ),
                null,                               
                null,
                null,
                ``,
                '',
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                '',
                [true, '15%', '85%']
            );                                           
        
            const fleetRow = createOptionRow(
                'enemyFleetsRow',
                null,
                'Enemy Fleets:',
                createTextElement(
                    `Air: <span class="${starData.civilizationLevel === 'None' 
                        ? 'green-ready-text' 
                        : (getStellarScannerBuilt() 
                            ? (starData.enemyFleets.fleetChanges.air.class || '') 
                            : 'red-disabled-text')}">
                        ${starData.civilizationLevel === 'None' 
                            ? 'None' 
                            : (getStellarScannerBuilt() 
                                ? starData.enemyFleets.air 
                                : '???')}
                    </span>`,
                    'fleetAirText',
                    ['value-text', 'ap-destination-star-element']
                ),
                createTextElement(
                    `Land: <span class="${starData.civilizationLevel === 'None' 
                        ? 'green-ready-text' 
                        : (getStellarScannerBuilt() 
                            ? (starData.enemyFleets.fleetChanges.land.class || '') 
                            : 'red-disabled-text')}">
                        ${starData.civilizationLevel === 'None' 
                            ? 'None' 
                            : (getStellarScannerBuilt() 
                                ? starData.enemyFleets.land 
                                : '???')}
                    </span>`,
                    'fleetLandText',
                    ['value-text', 'ap-destination-star-element']
                ),
                createTextElement(
                    `Sea: <span class="${starData.civilizationLevel === 'None' 
                        ? 'green-ready-text' 
                        : (getStellarScannerBuilt() 
                            ? (starData.enemyFleets.fleetChanges.sea.class || '') 
                            : 'red-disabled-text')}">
                        ${starData.civilizationLevel === 'None' 
                            ? 'None' 
                            : (getStellarScannerBuilt() 
                                ? starData.enemyFleets.sea 
                                : '???')}
                    </span>`,
                    'fleetSeaText',
                    ['value-text', 'ap-destination-star-element']
                ),                                                 
                null,
                null,
                ``,
                '',
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                '',
                [true, '15%', '85%']
            );                    
        
            let anomaliesText;

            if (getFactoryStarsArray().includes(getDestinationStar())) {
                anomaliesText = '<span class="red-disabled-text">Megastructure</span>';
            } else if (starData.civilizationLevel === 'None') {
                anomaliesText = '<span>N/A</span>';
            } else if (!getStellarScannerBuilt()) {
                anomaliesText = '<span class="red-disabled-text">???</span>';
            } else if (starData.anomalies.length === 0) {
                anomaliesText = '<span>None</span>';
            } else {
                anomaliesText = starData.anomalies.map(a => {
                    if (typeof a === 'string') {
                        return `<span class="red-disabled-text">${a}</span>`;
                    }

                    if (a?.name === 'None') {
                        return `<span>N/A</span>`;
                    }

                    return `${a?.name}: <span class="${a?.class}">${a?.effect}</span>`;
                }).join('<br/>');
            }
            
            const anomaliesRow = createOptionRow(
                'anomaliesRow',
                null,
                'Anomalies:',
                createTextElement(
                    anomaliesText,
                    'anomaliesTextField',
                    ['value-text']
                ),
                null,
                null,
                null,
                null,
                ``,
                '',
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                '',
                [true, '15%', '85%']
            );
            
            optionContentElement.appendChild(starNameRow);
            optionContentElement.appendChild(civilizationRow);
            optionContentElement.appendChild(populationRow);
            optionContentElement.appendChild(threatRow);
            optionContentElement.appendChild(fleetRow);
            optionContentElement.appendChild(anomaliesRow);
        }
    }

    if (heading === 'Fleet Hangar') {
        const fleetShips = [
            { id: 'fleetEnvoy', label: 'Envoy' },
            { id: 'fleetScout', label: 'Scout' },
            { id: 'fleetMarauder', label: 'Marauder' },
            { id: 'fleetLandStalker', label: 'Land Stalker' },
            { id: 'fleetNavalStrafer', label: 'Naval Strafer' }
        ];

        fleetShips.forEach(fleetShip => {
            const fleetShipBuildRow = createOptionRow(
                `space${capitaliseString(fleetShip.id)}BuildRow`,
                null,
                `${fleetShip.label}:`,
                createButton(`Build`, ['option-button', 'red-disabled-text', 'building-purchase-button', 'resource-cost-sell-check'], () => {
                    gain(1, `${fleetShip.id}BuiltQuantity`, fleetShip.id, false, null, 'space', 'space');
                    increaseAttackAndDefensePower(fleetShip.id);
                    setFleetChangedSinceLastDiplomacy(true);
                    replaceBattleUnits({ player: [], enemy: [] });
                    setNeedNewBattleCanvas(true);
                    setFormationGoal(null);
                    setInFormation(false);
                }, 'upgradeCheck', '', 'spaceUpgrade', fleetShip.id, 'cash', true, null, 'fleetPurchase'),
                createTextElement(
                    fleetShip.id === 'fleetEnvoy' 
                    ? `Quantity: <span id="${fleetShip.id}BuiltQuantity">${getFleetShips(fleetShip.id)}</span> / <span id="${fleetShip.id}BuiltQuantityMax">${getMaxFleetShip(fleetShip.id)}</span>`
                    : `Quantity: <span id="${fleetShip.id}BuiltQuantity">${getFleetShips(fleetShip.id)}</span>`,
                `${fleetShip.id}QuantityText`,
                []
                ),
                null,
                null,
                null,
                `${getCurrencySymbol() + getResourceDataObject('space', ['upgrades', fleetShip.id, 'price'])}, 
                ${getResourceDataObject('space', ['upgrades', fleetShip.id, 'resource1Price'])[0]} ${capitaliseString(getResourceDataObject('space', ['upgrades', fleetShip.id, 'resource1Price'])[1])}, 
                ${getResourceDataObject('space', ['upgrades', fleetShip.id, 'resource2Price'])[0]} ${capitaliseString(getResourceDataObject('space', ['upgrades', fleetShip.id, 'resource2Price'])[1])}, 
                ${getResourceDataObject('space', ['upgrades', fleetShip.id, 'resource3Price'])[0]} ${capitaliseString(getResourceDataObject('space', ['upgrades', fleetShip.id, 'resource3Price'])[1])}`,
                '',
                'upgradeCheck',
                'spaceUpgrade',
                fleetShip.id,
                'cash',
                null,
                false,
                null,
                null,
                'fleetPurchase'
            );
            optionContentElement.appendChild(fleetShipBuildRow);
        });
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
        
            const diplomacyOptionsRow = createOptionRow(
                'diplomacyOptionsRow',
                null,
                'Relations:',
                createButton(`Bully`, ['option-button', 'red-disabled-text', 'diplomacy-button', 'bully'], () => {
                    setStarSystemDataObject(true, 'stars', ['destinationStar', 'triedToBully']);
                    updateDiplomacySituation('bully', starData);
                }, null, null, null, null, null, true, null, 'diplomacy'),
                createButton(`Passive`, ['option-button', 'red-disabled-text', 'diplomacy-button', 'passive'], () => {
                    updateDiplomacySituation('passive', starData);
                }, null, null, null, null, null, true, null, 'diplomacy'),                            
                createButton(`Harmony`, ['option-button', 'red-disabled-text', 'diplomacy-button', 'harmony'], () => {
                    updateDiplomacySituation('harmony', starData);
                }, null, null, null, null, null, true, null, 'diplomacy'),               
                createButton(`Vassalize`, ['option-button', 'red-disabled-text', 'diplomacy-button', 'vassalize'], () => {
                    updateDiplomacySituation('vassalize', starData);
                }, null, null, null, null, null, true, null, 'diplomacy'),
                createButton(`Conquest`, ['option-button', 'red-disabled-text', 'diplomacy-button', 'conquest'], () => {
                    updateDiplomacySituation('conquest', starData);
                }, null, null, null, null, null, true, null, 'diplomacy'),
                '',
                '',
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                '',
                [true, '15%', '85%']
            );  

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

            const receptionStatusRow = createOptionRow(
                'receptionStatusRow',
                null,
                'Attitude:',              
                createTextElement(
                    `<span class="${attitudeClass}">${attitude}</span>`,
                    'attitudeText',
                    ['value-text', 'intelligence-element']
                ),  
                createTextElement(
                    `Threat: <span class="${threatLevelClass}">${threatLevel}</span>`,
                    'threatLevelText',
                    [threatLevelClass, 'intelligence-element']
                ),                
                null,                              
                null,
                null,
                ``,
                '',
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                '',
                [true, '15%', '85%']
            );  
            
            const traitsText = starData.lifeformTraits
            .slice(0, 2)
            .map(trait => `<span class="${trait[1]}">${trait[0]}</span>`)
            .join(", ");
        
            const defenseText = `${starData.defenseRating}%`;
            const defenseClass = starData.defenseRating > 75 
                ? "red-disabled-text" 
                : starData.defenseRating >= 50 
                    ? "warning-orange-text" 
                    : "green-ready-text"; 
        
            const intelligenceRow = createOptionRow(
                'intelligenceRow',
                null,
                'Intelligence:',              
                createTextElement(
                    `<span class="${
                        starData.civilizationLevel === 'Unsentient' || starData.civilizationLevel === 'None'
                            ? 'green-ready-text'
                            : starData.civilizationLevel === 'Industrial'
                                ? 'warning-orange-text'
                                : 'red-disabled-text'
                    }">
                        ${starData.civilizationLevel}
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
                    `Defense: <span class="value-text ${defenseClass}">${defenseText}</span>`,
                    'defenseRatingText',
                    ['value-text', 'intelligence-element']
                ),                               
                null,
                null,
                ``,
                '',
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                '',
                [true, '15%', '85%']
            );                                                           
        
            const fleetRow = createOptionRow(
                'enemyFleetsRow',
                null,
                'Enemy Fleets:',
                createTextElement(
                    `Air: <span class="${starData.civilizationLevel === 'None' 
                        ? 'green-ready-text' 
                        : (getStellarScannerBuilt() 
                            ? (starData.enemyFleets.fleetChanges.air.class || '') 
                            : 'red-disabled-text')}">
                        ${starData.civilizationLevel === 'None' 
                            ? 'None' 
                            : (getStellarScannerBuilt() 
                                ? starData.enemyFleets.air 
                                : '???')}
                    </span>`,
                    'fleetAirText',
                    ['value-text', 'ap-destination-star-element']
                ),
                createTextElement(
                    `Land: <span class="${starData.civilizationLevel === 'None' 
                        ? 'green-ready-text' 
                        : (getStellarScannerBuilt() 
                            ? (starData.enemyFleets.fleetChanges.land.class || '') 
                            : 'red-disabled-text')}">
                        ${starData.civilizationLevel === 'None' 
                            ? 'None' 
                            : (getStellarScannerBuilt() 
                                ? starData.enemyFleets.land 
                                : '???')}
                    </span>`,
                    'fleetLandText',
                    ['value-text', 'ap-destination-star-element']
                ),
                createTextElement(
                    `Sea: <span class="${starData.civilizationLevel === 'None' 
                        ? 'green-ready-text' 
                        : (getStellarScannerBuilt() 
                            ? (starData.enemyFleets.fleetChanges.sea.class || '') 
                            : 'red-disabled-text')}">
                        ${starData.civilizationLevel === 'None' 
                            ? 'None' 
                            : (getStellarScannerBuilt() 
                                ? starData.enemyFleets.sea 
                                : '???')}
                    </span>`,
                    'fleetSeaText',
                    ['value-text', 'ap-destination-star-element']
                ),                                                 
                null,
                null,
                ``,
                '',
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                '',
                [true, '15%', '85%']
            );       
        
            optionContentElement.appendChild(diplomacyOptionsRow);
            optionContentElement.appendChild(receptionStatusRow);
            optionContentElement.appendChild(intelligenceRow);
            optionContentElement.appendChild(fleetRow);

            setFleetChangedSinceLastDiplomacy(false);
    }
}