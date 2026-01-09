import { removeTabAttentionIfNoIndicators, createColoniseOpinionProgressBar, setColoniseOpinionProgressBar, spaceTravelButtonHideAndShowDescription, drawStarConnectionDrawings, createStarDestinationRow, sortStarTable, handleSortStarClick, createTextElement, createOptionRow, createButton, generateStarfield, showNotification, showEnterWarModeModal, setWarUI } from './ui.js';
import { getFactoryStarsArray, setInFormation, setRedrawBattleDescription, setFleetChangedSinceLastDiplomacy, setDestinationStarScanned, getDestinationStarScanned, getStellarScannerBuilt, getStarShipTravelling, getDestinationStar, getCurrencySymbol, getSortStarMethod, getCurrentStarSystem, STAR_FIELD_SEED, NUMBER_OF_STARS, getStarMapMode, setStarMapMode, getWarMode, replaceBattleUnits, setNeedNewBattleCanvas, setFormationGoal, setBattleResolved, getBelligerentEnemyFlag, setAchievementFlagArray, getStarsWithAncientManuscripts } from './constantsAndGlobalVars.js';
import { getMaxFleetShip, getFleetShips, copyStarDataToDestinationStarField, getResourceDataObject, getStarShipParts, getStarShipPartsNeededInTotalPerModule, getStarSystemDataObject, setStarSystemDataObject } from './resourceDataObject.js';
import { capitaliseString, capitaliseWordsWithRomanNumerals } from './utilityFunctions.js';
import { updateDiplomacySituation, calculateModifiedAttitude, increaseAttackAndDefensePower, generateDestinationStarData, gain, getAscendencyPointsWithRepeatableBonus } from './game.js';

export async function drawTab5Content(heading, optionContentElement, starDestinationInfoRedraw, diplomacyRedraw) {
    const optionElement = document.getElementById(heading.toLowerCase().replace(/\s(.)/g, (match, group1) => group1.toUpperCase()).replace(/\s+/g, '') + 'Option');
    if (optionElement) {
        const warningIcon = optionElement.querySelector('span.attention-indicator');
        if (warningIcon && warningIcon.innerHTML.includes('⚠️')) {
            warningIcon.remove();
        }
    }
    removeTabAttentionIfNoIndicators('tab5');

    if (heading === 'Star Map') {
        const headerRow = document.getElementById('headerContentTab5');
        
        headerRow.innerHTML = `
            <div id="starMapNameField" class="star-map-name-field">Star Map</div>
            <div id="starButtonContainer" class="header-button-container"></div>
        `;
        
        const starButtonContainer = headerRow.querySelector('#starButtonContainer');
        const buttons = ['Normal', 'Distance', 'Studied', 'In Range'];
        
        buttons.forEach(button => {
            const buttonElement = createButton(button, ['option-button', 'star-option-button'], () => { 
                document.querySelectorAll('.star-option-button').forEach(btn => {
                    btn.classList.remove('green-ready-text');
                });
    
                buttonElement.classList.add('green-ready-text');
                
                setStarMapMode(button.toLowerCase());

                const starContainer = document.querySelector('#optionContentTab5');
                starContainer.innerHTML = '';
                generateStarfield(starContainer, NUMBER_OF_STARS, STAR_FIELD_SEED, getStarMapMode(), false, null, false);
            }, '', '', '', null, '', true, '', '');
            
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
    }

    if (heading === 'Star Data') {        
        let currentStarName = getCurrentStarSystem();
        let starsData = getStarSystemDataObject('stars');
        
        let starsObject = Object.fromEntries(
            Object.entries(starsData).filter(([starName]) => starName !== currentStarName && starName !== 'destinationStar')
        );        

        const starLegendRow = createOptionRow(
            `starLegendRow`,
            null,
            `Sort By:`,
            createTextElement(
                `Distance`,
                'starLegendDistance',
                ['sort-by', 'label-star'],
                (event) => handleSortStarClick('distance')
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
            ),
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

        Object.entries(sortedStars).forEach(([nameStar, star]) => {
            const factoryStarStatus = getStarSystemDataObject('stars', [nameStar, 'factoryStar']);

            const isFactoryStar = getFactoryStarsArray().includes(nameStar) && 
            (!Number.isInteger(Number(factoryStarStatus)) || isNaN(Number(factoryStarStatus))) 
            ? factoryStarStatus
            : false;

            const { distance, fuel, ascendencyPoints, name, weatherTendency, precipitationType } = star;
            const displayAscendencyPoints = getAscendencyPointsWithRepeatableBonus(ascendencyPoints);

            const starRowName = `starRow_${name}`;
            const weatherIconSpan = `<span class="${weatherTendency[2]}">${weatherTendency[0]}</span>`;
            const weatherText = `${weatherIconSpan} (${weatherTendency[1]}%)`;

            const currentAntimatter = getResourceDataObject('antimatter', ['quantity']);
            const hasEnoughFuel = currentAntimatter >= fuel;
            
            const fuelClass = hasEnoughFuel ? 'green-ready-text' : 'red-disabled-text';

            const starNameClass = !hasEnoughFuel 
                ? 'red-disabled-text' 
                : isFactoryStar 
                    ? 'factory-star-text' 
                    : 'green-ready-text';
            
            const starNameLabel = [
                `${capitaliseWordsWithRomanNumerals(nameStar)}:`,
                starNameClass
            ];
        
            const starDataRow = createOptionRow(
                `${starRowName}`,
                null,
                starNameLabel,
                createTextElement(
                    `${distance.toFixed(2)} ly`,
                    'starInfoContainerDistance',
                    ['value-star', 'distance-star', fuelClass]
                ), 
                createTextElement(
                    weatherText,
                    'starInfoContainerWeatherTendency',
                    ['value-star']
                ),                       
                createTextElement(
                    `${capitaliseString(precipitationType)}`,
                    'starInfoContainerPrecipitationType',
                    ['value-star']
                ),
                createTextElement(
                    `${fuel}`,
                    'starInfoContainerFuel',
                    ['value-star', 'fuel-star', 'notation', fuelClass]
                ),
                createTextElement(
                    `${displayAscendencyPoints}`,
                    'starInfoContainerAscendencyPoints',
                    ['value-star', 'fuel-star', 'notation']
                ),
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
        
            optionContentElement.appendChild(starDataRow);
        });        
    }

    if (heading === 'Star Ship') {
        if (!starDestinationInfoRedraw) {
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
                        gain(1, `${module.id}BuiltPartsQuantity`, module.id, false, null, 'space', 'space')
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
    
            const destinationStar = getDestinationStar();
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
                    if (a.name === 'None') {
                        return `<span>N/A</span>`;
                    }
                    return `${a.name}: <span class="${a.class}">${a.effect}</span>`;
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