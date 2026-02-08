import { getCurrentlyPillagingVoid, getTimeLeftUntilPillageVoidTimerFinishes, getTimeLeftUntilStarInvestigationTimerFinishes, getCurrentlyInvestigatingStar, getRocketUserName, setRocketUserName, setRocketDirection, getRocketDirection, getDestinationAsteroid, deferredActions, getSortAsteroidMethod, getAsteroidArray, setCheckRocketFuellingStatus, getCurrencySymbol, setRocketsFuellerStartedArray, getLaunchedRockets, getRocketsFuellerStartedArray, getCurrentlySearchingAsteroid, getTimeLeftUntilAsteroidScannerTimerFinishes, setDestinationAsteroid, getMiningObject, setAsteroidArray, getCurrentStarSystemWeatherEfficiency, getPlayerPhilosophy, getPhilosophyAbilityActive, getStatRun, getDemoBuild } from './constantsAndGlobalVars.js';

import { getRocketPartsNeededInTotalPerRocket, getRocketParts, getResourceDataObject, setResourceDataObject } from './resourceDataObject.js';
import { startTravelToAndFromAsteroidTimer, startInvestigateStarTimer, startSearchAsteroidTimer, launchRocket, gain, startUpdateTimersAndRates, addBuildingPotentialRate, buildSpaceMiningBuilding, addToResourceAllTimeStat, startPillageVoidTimer } from './game.js';
import { timerManagerDelta } from './timerManagerDelta.js';

import { removeTabAttentionIfNoIndicators, createSvgElement, createDropdown, createToggleSwitch, handleSortAsteroidClick, sortAsteroidTable, switchFuelGaugeWhenFuellerBought, createTextElement, createOptionRow, createButton, showNotification, renameRocket } from './ui.js';
import { capitaliseString } from './utilityFunctions.js';
import { sfxPlayer } from './audioManager.js'

import { trackAnalyticsEvent } from './analytics.js';

export function drawTab6Content(heading, optionContentElement) {
    const optionElement = document.getElementById(heading.toLowerCase().replace(/\s(.)/g, (match, group1) => group1.toUpperCase()).replace(/\s+/g, '') + 'Option');
    if (optionElement) {
        const warningIcon = optionElement.querySelector('span.attention-indicator');
        if (warningIcon && warningIcon.innerHTML.includes('⚠️')) {
            warningIcon.remove();
        }
    }
    removeTabAttentionIfNoIndicators('tab6');

    const asteroids = getAsteroidArray();
    const asteroidsBeingMinedOrExhausted = getMiningObject();
    if (heading === 'Space Telescope') {
        const spaceBuildTelescopeRow = createOptionRow(
                    'spaceBuildTelescopeRow',
                    null,
                    'Space Telescope:',
                    createButton(`Build Space Telescope`, ['option-button', 'red-disabled-text', 'building-purchase-button', 'resource-cost-sell-check', 'spaceTelescope'], () => {
                        buildSpaceMiningBuilding('spaceTelescope', false);
                        sfxPlayer.playAudio('buildTelescope', false);
                        document.getElementById('spaceTelescopeSearchAsteroidRow').classList.remove('invisible');
                        document.getElementById('spaceTelescopeInvestigateStarRow').classList.remove('invisible');
                        if (getPlayerPhilosophy() === 'voidborn' && getPhilosophyAbilityActive() && getStatRun() > 1) {
                            document.getElementById('spaceTelescopePhilosophyBoostResourcesAndCompoundsRow').classList.remove('invisible');
                        }
                        spaceBuildTelescopeRow.classList.add('invisible');
                        showNotification('Space Telescope Built!', 'info', 3000, 'special');
                    }, 'upgradeCheck', '', 'spaceUpgrade', 'spaceTelescope', 'cash', true, null, 'spaceMiningPurchase'),
                    createTextElement('Bought', 'spaceTelescopeAlreadyBoughtText', ['green-ready-text', 'invisible']),
                    null,
                    null,
                    null,
                    `${getCurrencySymbol() + getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'price'])}, 
                    ${getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'resource1Price'])[0]} ${capitaliseString(getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'resource1Price'])[1])}, 
                    ${getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'resource2Price'])[0]} ${capitaliseString(getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'resource2Price'])[1])}, 
                    ${getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'resource3Price'])[0]} ${capitaliseString(getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'resource3Price'])[1])}`,
                    '',
                    'upgradeCheck',
                    'spaceUpgrade',
                    'spaceTelescope',
                    'cash',
                    null,
                    false,
                    null,
                    null,
                    'spaceMiningPurchase'
                );
                optionContentElement.appendChild(spaceBuildTelescopeRow);

        const autoTelescopeOptions = [
            { value: 'studyAsteroid', text: 'Study Asteroid' },
            { value: 'studyStars', text: 'Study Stars' },
            ...(getPlayerPhilosophy() === 'voidborn' && getPhilosophyAbilityActive() && getStatRun() > 1
                ? [{ value: 'pillageVoid', text: 'Pillage The Void' }]
                : [])
        ];

        const spaceTelescopeAutoRow = createOptionRow(
            'spaceTelescopeAutoRow',
            'Auto Space Telescope',
            'Auto Space Telescope:',
            createDropdown(
                'autoSpaceTelescopeModeDropdown',
                autoTelescopeOptions,
                getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'autoSpaceTelescopeMode']),
                (value) => {
                    setResourceDataObject(value, 'space', ['upgrades', 'spaceTelescope', 'autoSpaceTelescopeMode']);
                }
            ),
            createToggleSwitch(
                'autoTelescopeToggle',
                getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'autoSpaceTelescopeEnabled']),
                (isEnabled) => {
                    setResourceDataObject(isEnabled, 'space', ['upgrades', 'spaceTelescope', 'autoSpaceTelescopeEnabled']);
                },
                ['toggle-switch-spacing']
            ),
            null,
            null,
            null,
            '',
            '',
            'upgradeCheck',
            'autoBuyer',
            'autoTelescope',
            'time',
            null,
            false,
            null,
            null,
            null
        );
        
        // Only show the auto telescope row if the space telescope is built and autoSpaceTelescopeRowEnabled is true
        if (getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'spaceTelescopeBoughtYet']) && getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'autoSpaceTelescopeRowEnabled'])) {
            optionContentElement.appendChild(spaceTelescopeAutoRow);
        }

        const spaceTelescopeSearchAsteroidRow = createOptionRow(
                    'spaceTelescopeSearchAsteroidRow',
                    'Scan Asteroids',
                    'Scan Asteroids',
                    createButton(`Scan Asteroids`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                        startSearchAsteroidTimer([0, 'buttonClick']);
                        sfxPlayer.playAudio('asteroidScan', false);
                    }, 'upgradeCheck', '', 'autoBuyer', 'searchAsteroid', 'time', true, null, 'spaceMiningPurchase'),
                    createTextElement(
                        `<div id="spaceTelescopeSearchAsteroidProgressBar">`,
                        'spaceTelescopeSearchAsteroidProgressBarContainer',
                        ['progress-bar-container', 'invisible']
                    ),                     
                    null,
                    null,
                    null,
                    `Ready To Search`,
                    '',
                    'upgradeCheck',
                    'autoBuyer',
                    'searchAsteroid',
                    'time',
                    null,
                    false,
                    null,
                    null,
                    null
                );
                optionContentElement.appendChild(spaceTelescopeSearchAsteroidRow);

        const spaceTelescopeInvestigateStarRow = createOptionRow(
                    'spaceTelescopeInvestigateStarRow',
                    'Study Stars',
                    'Study Stars',
                    (() => {
                        const extraClasses = getDemoBuild() ? ['electron-purple-demo-button'] : [];
                        return createButton(`Study Stars`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', ...extraClasses], () => {
                        startInvestigateStarTimer([0, 'buttonClick']);
                        sfxPlayer.playAudio('starStudy', false);
                        }, 'upgradeCheck', '', 'autoBuyer', 'investigateStar', 'time', true, null, 'spaceMiningPurchase');
                    })(),
                    createTextElement(
                        `<div id="spaceTelescopeInvestigateStarProgressBar">`,
                        'spaceTelescopeInvestigateStarProgressBarContainer',
                        ['progress-bar-container', 'invisible']
                    ),                     
                    null,
                    null,
                    null,
                    `Ready To Study`,
                    '',
                    'upgradeCheck',
                    'autoBuyer',
                    'investigateStar',
                    'time',
                    null,
                    false,
                    null,
                    null,
                    null
                );
                optionContentElement.appendChild(spaceTelescopeInvestigateStarRow);

                const spaceTelescopePhilosophyBoostResourcesAndCompoundsRow = createOptionRow(
                    'spaceTelescopePhilosophyBoostResourcesAndCompoundsRow',
                    'Pillage The Void',
                    'Pillage The Void',
                    createButton(`Pillage the Void`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'pillageVoid'], () => {
                        startPillageVoidTimer([0, 'buttonClick']);
                        sfxPlayer.playAudio('starStudy', false); //maybe replace in future
                    }, 'upgradeCheck', '', 'autoBuyer', 'pillageVoid', 'time', true, null, 'spaceMiningPurchase'),
                    createTextElement(
                        `<div id="spaceTelescopePillageVoidProgressBar">`,
                        'spaceTelescopePillageVoidProgressBarContainer',
                        ['progress-bar-container', 'invisible']
                    ),                     
                    null,
                    null,
                    null,
                    `Ready To Pillage`,
                    '',
                    'upgradeCheck',
                    'autoBuyer',
                    'pillageVoid',
                    'time',
                    null,
                    false,
                    null,
                    null,
                    null
                );
                optionContentElement.appendChild(spaceTelescopePhilosophyBoostResourcesAndCompoundsRow);

                const shouldShowPillageVoidRow =
                    (getPlayerPhilosophy() === 'voidborn' && getPhilosophyAbilityActive() && getStatRun() > 1) ||
                    getCurrentlyPillagingVoid();
                if (!shouldShowPillageVoidRow) {
                    spaceTelescopePhilosophyBoostResourcesAndCompoundsRow.classList.add('invisible');
                }

                if (getResourceDataObject('space', ['upgrades', 'spaceTelescope', 'spaceTelescopeBoughtYet'])) {
                    spaceBuildTelescopeRow.classList.add('invisible');
                    
                    if (getCurrentlySearchingAsteroid()) {
                        timerManagerDelta.removeTimer('searchAsteroidTimer');
                        deferredActions.push(() => {
                            const timeRemaining = getTimeLeftUntilAsteroidScannerTimerFinishes();
                            startSearchAsteroidTimer([timeRemaining, 'reEnterSpaceTelescopeScreen']);
                        });
                    }
                    
                    if (getCurrentlyInvestigatingStar()) {
                        timerManagerDelta.removeTimer('investigateStarTimer');
                        deferredActions.push(() => {
                            const timeRemaining = getTimeLeftUntilStarInvestigationTimerFinishes();
                            startInvestigateStarTimer([timeRemaining, 'reEnterSpaceTelescopeScreen']);
                        });
                    }

                    if (getCurrentlyPillagingVoid()) {
                        timerManagerDelta.removeTimer('pillageVoidTimer');
                        deferredActions.push(() => {
                            const timeRemaining = getTimeLeftUntilPillageVoidTimerFinishes();
                            startPillageVoidTimer([timeRemaining, 'reEnterSpaceTelescopeScreen']);
                        });
                    }
                    
                }
    }

    if (heading === 'Launch Pad') {
        const spaceBuildLaunchPadRow = createOptionRow(
                    'spaceBuildLaunchPadRow',
                    null,
                    'Launch Pad:',
                    createButton(`Build Launch Pad`, ['option-button', 'red-disabled-text', 'building-purchase-button', 'resource-cost-sell-check', 'launchPad'], () => {
                        buildSpaceMiningBuilding('launchPad', false);
                        sfxPlayer.playAudio('buildLaunchPad', false);
                        document.getElementById('spaceRocket1BuildRow').classList.remove('invisible');
                        document.getElementById('spaceRocket2BuildRow').classList.remove('invisible');
                        document.getElementById('spaceRocket3BuildRow').classList.remove('invisible');
                        document.getElementById('spaceRocket4BuildRow').classList.remove('invisible');
                        spaceBuildLaunchPadRow.classList.add('invisible');
                        showNotification('Launch Pad Built!', 'info', 3000, 'special');
                    }, 'upgradeCheck', '', 'spaceUpgrade', 'launchPad', 'cash', true, null, 'spaceMiningPurchase'),
                    createTextElement('Bought', 'launchPadAlreadyBoughtText', ['green-ready-text', 'invisible']),
                    null,
                    null,
                    null,
                    `${getCurrencySymbol() + getResourceDataObject('space', ['upgrades', 'launchPad', 'price'])}, 
                    ${getResourceDataObject('space', ['upgrades', 'launchPad', 'resource1Price'])[0]} ${capitaliseString(getResourceDataObject('space', ['upgrades', 'launchPad', 'resource1Price'])[1])}, 
                    ${getResourceDataObject('space', ['upgrades', 'launchPad', 'resource2Price'])[0]} ${capitaliseString(getResourceDataObject('space', ['upgrades', 'launchPad', 'resource2Price'])[1])}, 
                    ${getResourceDataObject('space', ['upgrades', 'launchPad', 'resource3Price'])[0]} ${capitaliseString(getResourceDataObject('space', ['upgrades', 'launchPad', 'resource3Price'])[1])}`,
                    '',
                    'upgradeCheck',
                    'spaceUpgrade',
                    'launchPad',
                    'cash',
                    null,
                    false,
                    null,
                    null,
                    'spaceMiningPurchase'
                );
                optionContentElement.appendChild(spaceBuildLaunchPadRow);

                if (getResourceDataObject('space', ['upgrades', 'launchPad', 'launchPadBoughtYet'])) {
                    spaceBuildLaunchPadRow.classList.add('invisible');
                }

        const rockets = [
            { id: 'rocket1', label: 'Rocket Miner 1' },
            { id: 'rocket2', label: 'Rocket Miner 2' },
            { id: 'rocket3', label: 'Rocket Miner 3' },
            { id: 'rocket4', label: 'Rocket Miner 4' }
        ];

        rockets.forEach(rocket => {
            const isDemoLocked = getDemoBuild() && ['rocket2', 'rocket3', 'rocket4'].includes(rocket.id);
            const extraClasses = isDemoLocked ? ['electron-purple-demo-button'] : [];
            const rocketBuildRow = createOptionRow(
                `space${capitaliseString(rocket.id)}BuildRow`,
                null,
                `${rocket.label}:`,
                createButton(`Build Rocket Part`, ['option-button', 'red-disabled-text', 'building-purchase-button', 'resource-cost-sell-check', ...extraClasses], () => {
                    trackAnalyticsEvent('rocket_part_built', {
                        rocket_id: rocket.id,
                        ts: new Date().toISOString()
                    });
                    gain(1, `${rocket.id}BuiltPartsQuantity`, rocket.id, false, null, 'space', 'space')
                }, 'upgradeCheck', '', 'spaceUpgrade', rocket.id, 'cash', true, null, 'spaceMiningPurchase'),
                createTextElement(
                    `Built: <span id="${rocket.id}BuiltPartsQuantity">${getRocketParts(rocket.id)}</span> / <span id="${rocket.id}TotalPartsQuantity">${getRocketPartsNeededInTotalPerRocket(rocket.id)}</span>`,
                    `${rocket.id}PartsCountText`,
                    []
                ),
                null,
                null,
                null,
                `${getCurrencySymbol() + getResourceDataObject('space', ['upgrades', rocket.id, 'price'])}, 
                ${getResourceDataObject('space', ['upgrades', rocket.id, 'resource1Price'])[0]} ${capitaliseString(getResourceDataObject('space', ['upgrades', rocket.id, 'resource1Price'])[1])}, 
                ${getResourceDataObject('space', ['upgrades', rocket.id, 'resource2Price'])[0]} ${capitaliseString(getResourceDataObject('space', ['upgrades', rocket.id, 'resource2Price'])[1])}, 
                ${getResourceDataObject('space', ['upgrades', rocket.id, 'resource3Price'])[0]} ${capitaliseString(getResourceDataObject('space', ['upgrades', rocket.id, 'resource3Price'])[1])}`,
                '',
                'upgradeCheck',
                'spaceUpgrade',
                rocket.id,
                'cash',
                null,
                false,
                null,
                null,
                'spaceMiningPurchase'
            );
            optionContentElement.appendChild(rocketBuildRow);
        });
    }

    if (heading === `${getRocketUserName('rocket1')}`) createRocketUI('rocket1', optionContentElement, asteroids, asteroidsBeingMinedOrExhausted);
    if (heading === `${getRocketUserName('rocket2')}`) createRocketUI('rocket2', optionContentElement, asteroids, asteroidsBeingMinedOrExhausted);
    if (heading === `${getRocketUserName('rocket3')}`) createRocketUI('rocket3', optionContentElement, asteroids, asteroidsBeingMinedOrExhausted);
    if (heading === `${getRocketUserName('rocket4')}`) createRocketUI('rocket4', optionContentElement, asteroids, asteroidsBeingMinedOrExhausted);
    
    if (heading === 'Asteroids') {
        let asteroidsArray = getAsteroidArray();
    
        if (asteroidsArray.length === 0) {
            return;
        }

        const asteroidLegendRow = createOptionRow(
            `asteroidLegendRow`,
            null,
            `Sort By:`,
            createTextElement(
                `Rarity`,
                'asteroidLegendRarity',
                ['sort-by', 'label-asteroid'],
                (event) => handleSortAsteroidClick('rarity')
            ),
            createTextElement(
                `Distance`,
                'asteroidLegendDistance',
                ['no-sort', 'label-asteroid'],
                (event) => handleSortAsteroidClick('distance')
            ),
            createTextElement(
                `Complexity`,
                'asteroidLegendEOE',
                ['no-sort', 'label-asteroid'],
                (event) => handleSortAsteroidClick('eoe')
            ),
            createTextElement(
                `Antimatter`,
                'asteroidLegendQuantity',
                ['no-sort', 'label-asteroid'],
                (event) => handleSortAsteroidClick('quantity')
            ),            
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
            'asteroid',
            [true, '25%', '75%']
        );
        optionContentElement.appendChild(asteroidLegendRow);

        const asteroidsBeingMined = getMiningObject();
        let flaggedAsteroids = asteroidsArray.map(obj => {
            const asteroidName = Object.keys(obj)[0];
            if (Object.values(asteroidsBeingMined).includes(asteroidName)) {
                obj[asteroidName].beingMined = true;
            } else {
                obj[asteroidName].beingMined = false;
            }
            return obj;
        });

        flaggedAsteroids = sortAsteroidTable(flaggedAsteroids, getSortAsteroidMethod());

        flaggedAsteroids.forEach((asteroid) => {
            const asteroidName = Object.keys(asteroid)[0];

            const { name, distance, easeOfExtraction, quantity, rarity } = asteroid[asteroidName];
            const asteroidRowName = `asteroidRow_${name}`;

            let rarityElementOverride;

            if (asteroid[asteroidName].destroyed) {
                rarityElementOverride = createTextElement("Destroyed!", 'asteroidInfoContainerRarity', ['value-asteroid', 'red-disabled-text']);
                asteroid[asteroidName].quantity[1] = 'red-disabled-text';
                asteroid[asteroidName].easeOfExtraction[1] = 'red-disabled-text';
                asteroid[asteroidName].distance[1] = 'red-disabled-text';
            } else if (asteroid[asteroidName].quantity[0] === 0) {
                rarityElementOverride = createTextElement("Exhausted!", 'asteroidInfoContainerRarity', ['value-asteroid', 'red-disabled-text']);
                asteroid[asteroidName].quantity[1] = 'red-disabled-text';
                asteroid[asteroidName].easeOfExtraction[1] = 'red-disabled-text';
                asteroid[asteroidName].distance[1] = 'red-disabled-text';
            } else if (asteroid[asteroidName].beingMined) {
                rarityElementOverride = createTextElement("Being Mined!", 'asteroidInfoContainerRarity', ['value-asteroid', 'green-ready-text']);
            } else {
                rarityElementOverride = createTextElement(`${rarity[0]}`, 'asteroidInfoContainerRarity', ['value-asteroid', 'rarity-asteroid', rarity[1]]);
            }
            
            const asteroidRow = createOptionRow(
                `${asteroidRowName}`,
                null,
                (asteroid[asteroidName].destroyed || asteroid[asteroidName].quantity[0] === 0)
                ? [`${name}:`, 'red-disabled-text']
                : asteroid[asteroidName].beingMined 
                    ? [`${name}:`, 'green-ready-text']
                    : [`${name}:`],
                rarityElementOverride,
                createTextElement(
                    `${distance[0]}`,
                    'asteroidInfoContainerDistance',
                    ['value-asteroid', 'distance-asteroid', distance[1]]
                ),
                createTextElement(
                    `${easeOfExtraction[0]}`,
                    'asteroidInfoContainerEOE',
                    ['value-asteroid', 'eoe-asteroid', easeOfExtraction[1]]
                ),
                createTextElement(
                    `${Math.floor(quantity[0])}`,
                    'asteroidInfoContainerQuantity',
                    ['value-asteroid', 'quantity-asteroid', quantity[1]]
                ),                             
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
                'asteroid',
                [true, '25%', '75%']
            );

            if (asteroid[asteroidName].destroyed || asteroid[asteroidName].quantity[0] === 0) {
                asteroidRow.style.opacity = "0.5";
            }

            optionContentElement.appendChild(asteroidRow);
        });
    } 
    
    if (heading === 'Mining') {
            const antimatterSvgRow = createOptionRow(
                'antimatterSvgRow',
                null,
                '',
                createSvgElement('antimatterSvg', '100%', '700px', ['antimatter-svg']),
                null,
                null,
                null,
                null,
                '',
                '',
                'antimatterRender',
                '',
                '',
                '',
                null,
                false,
                null,
                null,
                'antimatter',
                [true, 'invisible', '100%']
            );
        
            optionContentElement.appendChild(antimatterSvgRow);    
        }  
}

function setFuellingVisibility(rocket, params) {
    const [fuellingState, fuelledUpState, launchedState] = params;
    if (fuellingState || fuelledUpState) {
        const fuelUpButton = document.querySelector(`.${rocket}`);
        fuelUpButton.classList.add('invisible');
        document.getElementById(`${rocket}FuellingProgressBarContainer`).classList.remove('invisible');
        const launchButton = document.querySelector(`.${rocket}-launch-button`);
        launchButton.classList.remove('invisible');
        launchButton.textContent = 'Launch!';
        document.getElementById('fuelDescription').textContent = 'Fuelling...'
        document.getElementById('fuelDescription').classList.remove('red-disabled-text');
    }
    if (fuelledUpState) {
        document.getElementById(`${rocket}FuellingProgressBar`).style.width = '100%';
        const launchButton = document.querySelector(`.${rocket}-launch-button`);
        if (getCurrentStarSystemWeatherEfficiency()[2] !== 'rain' && getCurrentStarSystemWeatherEfficiency()[2] !== 'volcano') {
            launchButton.classList.add('green-ready-text');
            launchButton.classList.remove('red-disabled-text');
            launchButton.textContent = 'Launch!';
            document.getElementById('fuelDescription').textContent = 'Ready For Launch...'
            document.getElementById('fuelDescription').classList.add('green-ready-text');
        } else {
            launchButton.classList.remove('green-ready-text');
            launchButton.classList.add('red-disabled-text');
            launchButton.textContent = 'Launch!';
            document.getElementById('fuelDescription').textContent = 'Bad Weather!'
            document.getElementById('fuelDescription').classList.remove('green-ready-text');
            document.getElementById('fuelDescription').classList.add('red-disabled-text');
        }

    }
    if (launchedState) {
        const autoBuyerRow = document.getElementById(`space${capitaliseString(rocket)}AutoBuyerRow`);
        if (autoBuyerRow) {
            autoBuyerRow.classList.add('invisible');
        }
    }

    if (!fuellingState && !fuelledUpState && !launchedState) {
        document.getElementById(`${rocket}FuellingProgressBar`).style.width = '0%';
        document.getElementById(`${rocket}FuellingProgressBarContainer`).classList.add('invisible');
    }
}

function createRocketUI(rocketId, optionContentElement, asteroids, asteroidsBeingMined) {
    const headerRow = document.getElementById('headerContentTab6');
    const originalRocketKey = getRocketUserName(rocketId).toLowerCase();
    
    headerRow.innerHTML = `
        <div id="${rocketId}NameField" class="rocket-name-field" spellcheck="false" contenteditable="true">${getRocketUserName(rocketId)}</div>
        <div id="${rocketId}-rename-btn" class="header-button-container"></div>
    `;

    const maxLength = 12;
    const nameField = document.getElementById(`${rocketId}NameField`);

    nameField.addEventListener('input', (e) => {
        let text = nameField.innerText;
        if (text.length > maxLength) {
            nameField.innerText = text.slice(0, maxLength);
            const range = document.createRange();
            range.setStart(nameField.firstChild, maxLength);
            range.setEnd(nameField.firstChild, maxLength);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
        }
    });

    nameField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            renameRocket(rocketId, originalRocketKey);
        }
    });

    document.getElementById(`${rocketId}-rename-btn`).appendChild(
        createButton('Rename', ['option-button', 'rename-rocket'], () => { 
            renameRocket(rocketId, originalRocketKey);
        }, '', '', '', null, '', true, '', '')
    );

    const autobuyerPrice = getResourceDataObject('space', ['upgrades', rocketId, 'autoBuyer', 'tier1', 'price']);
    setCheckRocketFuellingStatus(rocketId, true);
    
    const fuellingState = getRocketsFuellerStartedArray().includes(rocketId);
    const fuelledUpState = getRocketsFuellerStartedArray().includes(`${rocketId}FuelledUp`);
    const launchedState = getLaunchedRockets().includes(rocketId);

    const destinationAsteroids = ['rocket1', 'rocket2', 'rocket3', 'rocket4']
    .filter(id => id !== rocketId) // exclude the current rocket
    .map(id => getDestinationAsteroid(id))
    .filter(Boolean); // remove null/undefined

    let filteredAsteroids = asteroids.filter(obj => {
        const asteroidName = Object.keys(obj)[0];
        const asteroid = obj[asteroidName];

        const isBeingMined = Object.values(asteroidsBeingMined).includes(asteroidName);
        const isDestination = destinationAsteroids.includes(asteroidName);
        const hasQuantity = asteroid.quantity[0] > 0;

        return !isBeingMined && !isDestination && hasQuantity;
    });
    
    const rocketAutoBuyerRow = createOptionRow(
        `space${capitaliseString(rocketId)}AutoBuyerRow`,
        getResourceDataObject('space', ['upgrades', rocketId, 'autoBuyer', 'tier1', 'nameUpgrade']),
        'Fuel:',
        createButton(`Fuel Rocket`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', rocketId], () => {
            setRocketsFuellerStartedArray(rocketId, 'add');
            sfxPlayer.playAudio('fuelRocket', false);
            switchFuelGaugeWhenFuellerBought(rocketId, 'normal');
        }, 'upgradeCheck', '', 'autoBuyer', null, 'cash', true, 'tier1', 'rocketFuel'),
        createTextElement(`<div id="${rocketId}FuellingProgressBar">`, `${rocketId}FuellingProgressBarContainer`, ['progress-bar-container', 'invisible']),
        createButton(`Power Off!`, ['option-button', 'red-disabled-text', 'rocket-fuelled-check', `${rocketId}-launch-button`, 'invisible'], () => {
            launchRocket(rocketId);
            sfxPlayer.playAudio('rocketLaunch', false);
            addToResourceAllTimeStat(1, 'totalRocketsLaunched');
        }, 'upgradeCheck', '', null, null, null, true, null, null),
        null,
        null,
        `${getCurrencySymbol()}${autobuyerPrice}`,
        '',
        'upgradeCheck',
        'autoBuyer',
        null,
        'cash',
        'tier1',
        false,
        null,
        null,
        'rocketFuel'
    );
    optionContentElement.appendChild(rocketAutoBuyerRow);

    const rocketTravelRow = createOptionRow(
        `space${capitaliseString(rocketId)}TravelRow`,
        null,
        `Travel To:`,
        createTextElement(`${getDestinationAsteroid(rocketId)}`, `${rocketId}DestinationAsteroid`, ['green-ready-text', 'invisible', 'destination-text']),
        createDropdown(`${rocketId}TravelDropdown`, filteredAsteroids
            .flatMap(asteroidObj => Object.values(asteroidObj).map(asteroid => ({
                value: asteroid.name,
                text: `${asteroid.name}: Distance: <span class="dropDownDistanceValue ${getDistanceClass(asteroid.distance[0])}">${asteroid.distance[0]}</span>, Rarity: <span class="dropDownRarityValue ${getRarityClass(asteroid.rarity[0])}">${asteroid.rarity[0]}</span>, Antimatter: <span class="dropDownQuantityValue ${getQuantityClass(asteroid.quantity[0])}">${asteroid.quantity[0]}</span>`,
                distance: asteroid.distance[0]
            })))
            .sort((a, b) => a.distance - b.distance),
            '', (value) => {
                setDestinationAsteroid(rocketId, value);
            }, ['travel-to']),                                 
        createButton(`Travel`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check', `${rocketId}-travel-to-asteroid-button`], () => {
            startTravelToAndFromAsteroidTimer([0, 'buttonClick'], rocketId, false);
            setRocketDirection(rocketId, false);
        }, 'upgradeCheck', '', 'autoBuyer', 'travelToAsteroid', 'time', true, null, 'spaceMiningPurchase'),
        createTextElement(`<div id="spaceTravelToAsteroidProgressBar${capitaliseString(rocketId)}">`, `spaceTravelToAsteroidProgressBar${capitaliseString(rocketId)}Container`, ['progress-bar-container', 'invisible']),
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
    optionContentElement.appendChild(rocketTravelRow);

    setFuellingVisibility(rocketId, [fuellingState, fuelledUpState, launchedState]);
}

function getRarityClass(rarity) {
    if (rarity === 'Common') {
        return 'red-disabled-text';
    } else if (rarity === 'Uncommon') {
        return 'warning-orange-text';
    } else if (rarity === 'Legendary') {
        return 'green-ready-text';
    }
    return '';
}

function getDistanceClass(distance) {
    if (distance < 100000) {
        return 'green-ready-text';
    } else if (distance < 200000) {
        return '';
    } else if (distance < 300000) {
        return 'warning-orange-text';
    } else {
        return 'red-disabled-text';
    }
}

function getQuantityClass(quantity) {
    if (quantity <= 300) {
        return 'red-disabled-text';
    } else if (quantity <= 600) {
        return 'warning-orange-text';
    } else if (quantity <= 750) {
        return '';
    } else {
        return 'green-ready-text';
    }
}