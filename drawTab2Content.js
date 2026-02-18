import { getImageUrls, getTimerRateRatio, getCurrencySymbol, getBuildingTypeOnOff, setPowerOnOff, getCurrentStarSystemWeatherEfficiency, getInfinitePower, getDemoBuild } from './constantsAndGlobalVars.js';
import { sellBuilding, toggleBuildingTypeOnOff, addOrRemoveUsedPerSecForFuelRate, setEnergyCapacity, gain, startUpdateTimersAndRates, addBuildingPotentialRate, addToResourceAllTimeStat, getOTypePowerPlantBoostMultiplierForCurrentSystem } from './game.js';
import { setResourceDataObject, getResourceDataObject } from './resourceDataObject.js';
import { removeTabAttentionIfNoIndicators, switchBatteryStatBarWhenBatteryBought, createTextElement, createOptionRow, createButton } from './ui.js';
import { capitaliseString } from './utilityFunctions.js';
import { sfxPlayer, playClickSfx } from './audioManager.js';

export function drawTab2Content(heading, optionContentElement) {
    const optionElement = document.getElementById(heading.toLowerCase().replace(/\s(.)/g, (match, group1) => group1.toUpperCase()).replace(/\s+/g, '') + 'Option');
    if (optionElement) {
        const warningIcon = optionElement.querySelector('span.attention-indicator');
        if (warningIcon && warningIcon.innerHTML.includes('⚠️')) {
            warningIcon.remove();
        }
    }
    removeTabAttentionIfNoIndicators('tab2');
    
    let toggleButtonText;
    if (heading === 'Energy Storage') {

        const demoExtraClasses = getDemoBuild() ? ['electron-purple-demo-button'] : [];

        const battery1Row = createOptionRow(
            'energyBattery1Row',
            null,
            'Sodium Ion Battery:',
            createButton(`Add ${Math.floor(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'capacity']) / 1000)} MWh`, ['option-button', 'red-disabled-text', 'building-purchase-button', 'resource-cost-sell-check', ...demoExtraClasses], () => {
                gain(1, 'battery1Quantity', 'battery1', false, null, 'energy', 'resources');
                addToResourceAllTimeStat(1, 'allTimeSodiumIonBatteriesBuilt');
                setResourceDataObject(true, 'buildings', ['energy', 'batteryBoughtYet']);
                switchBatteryStatBarWhenBatteryBought();
                setEnergyCapacity('battery1');
            }, 'upgradeCheck', '', 'energy', 'battery1', 'cash', true, null, 'building'),
            null,
            null,
            null,
            null,
            `${getCurrencySymbol() + getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'price'])}, 
            ${getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource1Price'])[0]} ${capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource1Price'])[1])}, 
            ${getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource2Price'])[0]} ${capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource2Price'])[1])}, 
            ${getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource3Price'])[0]} ${capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource3Price'])[1])}`,
            '',
            'upgradeCheck',
            'energy',
            'battery1',
            'cash',
            null,
            ['tech', 'sodiumIonPowerStorage'],
            null,
            null,
            'building'
        );
        optionContentElement.appendChild(battery1Row);

        const battery2Row = createOptionRow(
            'energyBattery2Row',
            null,
            'Battery 2:',
            createButton(`Add ${Math.floor(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery2', 'capacity']) / 1000)} MWh`, ['option-button', 'red-disabled-text', 'building-purchase-button', 'resource-cost-sell-check', ...demoExtraClasses], () => {
                gain(1, 'battery2Quantity', 'battery2', false, null, 'energy', 'resources');
                addToResourceAllTimeStat(1, 'allTimeBattery2Built');
                setResourceDataObject(true, 'buildings', ['energy', 'batteryBoughtYet']);
                switchBatteryStatBarWhenBatteryBought();
                setEnergyCapacity('battery2');
            }, 'upgradeCheck', '', 'energy', 'battery2', 'cash', true, null, 'building'),
            null,
            null,
            null,
            null,
            `${getCurrencySymbol() + getResourceDataObject('buildings', ['energy', 'upgrades', 'battery2', 'price'])}`,
            '',
            'upgradeCheck',
            'energy',
            'battery2',
            'cash',
            null,
            ['tech', 'sodiumIonPowerStorage'],
            null,
            null,
            'building'
        );
        optionContentElement.appendChild(battery2Row);

        const battery3Row = createOptionRow(
            'energyBattery3Row',
            null,
            'Battery 3:',
            createButton(`Add ${Math.floor(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery3', 'capacity']) / 1000)} MWh`, ['option-button', 'red-disabled-text', 'building-purchase-button', 'resource-cost-sell-check', ...demoExtraClasses], () => {
                gain(1, 'battery3Quantity', 'battery3', false, null, 'energy', 'resources');
                addToResourceAllTimeStat(1, 'allTimeBattery3Built');
                setResourceDataObject(true, 'buildings', ['energy', 'batteryBoughtYet']);
                switchBatteryStatBarWhenBatteryBought();
                setEnergyCapacity('battery3');
            }, 'upgradeCheck', '', 'energy', 'battery3', 'cash', true, null, 'building'),
            null,
            null,
            null,
            null,
            `${getCurrencySymbol() + getResourceDataObject('buildings', ['energy', 'upgrades', 'battery3', 'price'])}`,
            '',
            'upgradeCheck',
            'energy',
            'battery3',
            'cash',
            null,
            ['tech', 'sodiumIonPowerStorage'],
            null,
            null,
            'building'
        );
        optionContentElement.appendChild(battery3Row);
    }
    
    if (heading === 'Power Plant') {
        const activeStatus = getBuildingTypeOnOff('powerPlant1');
        if (activeStatus) {
            toggleButtonText = 'Deactivate';
        } else {
            toggleButtonText = 'Activate';
        }

        const powerPlant1Row = createOptionRow(
            'energyPowerPlant1Row',
            null,
            'Power Plant:',
            createButton(`Sell 1`, ['option-button', 'red-disabled-text', 'sell-building-button', 'resource-cost-sell-check'], () => {
                sellBuilding(1, 'powerPlant1');
                addBuildingPotentialRate('powerPlant1');
            }, 'upgradeCheck', '', 'energy', 'powerPlant1', 'cash', true, null, 'building'),
            createButton(`Add ${Math.round(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'rate']) * getOTypePowerPlantBoostMultiplierForCurrentSystem('powerPlant1') * getTimerRateRatio())} KW /s`, ['option-button', 'building-purchase-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'powerPlant1Quantity', 'powerPlant1', false, null, 'energy', 'resources');
                addToResourceAllTimeStat(1, 'allTimeBasicPowerPlantsBuilt');
                addBuildingPotentialRate('powerPlant1');
                if (getBuildingTypeOnOff('powerPlant1')) {
                    startUpdateTimersAndRates('powerPlant1', 'buy');
                }
            }, 'upgradeCheck', '', 'energy', 'powerPlant1', 'cash', true, null, 'building'),
            createButton(toggleButtonText, ['option-button', 'toggle-timer', 'fuel-check', 'invisible', 'id_powerPlant1Toggle'], (event) => {
                const activeState = addOrRemoveUsedPerSecForFuelRate('carbon', event.target, 'resources', null, false);
                toggleBuildingTypeOnOff('powerPlant1', activeState);
                startUpdateTimersAndRates('powerPlant1', 'toggle');
                if (!getInfinitePower()) {
                    setPowerOnOff(true);
                }
                sfxPlayer.playAudio('powerOn', 'powerOff');
            }, 'toggle', null, null, 'powerPlant1', null, true, null, 'building'),
            createTextElement(`${capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'fuel'])[0])}:`, 'powerPlant1FuelType', ['red-disabled-text', 'fuel-type', 'invisible']),
            createTextElement(`${getResourceDataObject(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'fuel'])[2], [getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'fuel'])[0], 'quantity'])}`, 'powerPlant1FuelQuantity', ['red-disabled-text', 'fuel-quantity', 'invisible']),
            `${getCurrencySymbol() + getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'price'])}`,
            '',
            'upgradeCheck',
            'energy',
            'powerPlant1',
            'cash',
            null,
            false,
            null,
            null,
            'building',
            [true, '25%', '70%']
        );
        optionContentElement.appendChild(powerPlant1Row);
    }

    else if (heading === 'Solar Power Plant') {
        const demoExtraClasses = getDemoBuild() ? ['electron-purple-demo-button'] : [];
        const activeStatus = getBuildingTypeOnOff('powerPlant2');
        if (activeStatus) {
            toggleButtonText = 'Deactivate';
        } else {
            toggleButtonText = 'Activate';
        }

        const powerPlant2Row = createOptionRow(
            'energyPowerPlant2Row',
            null,
            'Solar Power Plant:',
            createButton(`Sell 1`, ['option-button', 'red-disabled-text', 'sell-building-button', 'resource-cost-sell-check'], () => {
                sellBuilding(1, 'powerPlant2');
                addBuildingPotentialRate('powerPlant2');
            }, 'upgradeCheck', '', 'energy', 'powerPlant2', 'cash', true, null, 'building'),
            createButton(`Add (max) ${Math.round(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'rate']) * getOTypePowerPlantBoostMultiplierForCurrentSystem('powerPlant2') * getTimerRateRatio())} KW /s`, ['option-button', 'red-disabled-text', 'building-purchase-button', 'resource-cost-sell-check', ...demoExtraClasses], () => {
                gain(1, 'powerPlant2Quantity', 'powerPlant2', false, null, 'energy', 'resources');
                addToResourceAllTimeStat(1, 'allTimeSolarPowerPlantsBuilt');
                addBuildingPotentialRate('powerPlant2');
                if (getBuildingTypeOnOff('powerPlant2')) {
                    startUpdateTimersAndRates('powerPlant2', 'buy');
                }
            }, 'upgradeCheck', '', 'energy', 'powerPlant2', 'cash', true, null, 'building'),
            createButton(toggleButtonText, ['option-button', 'toggle-timer', 'fuel-check', 'invisible', 'id_powerPlant2Toggle'], (event) => {
                const activeState = addOrRemoveUsedPerSecForFuelRate('hydrogen', event.target, 'resources', null, false);
                toggleBuildingTypeOnOff('powerPlant2', activeState);
                startUpdateTimersAndRates('powerPlant2', 'toggle');
                if (!getInfinitePower()) {
                    setPowerOnOff(true);
                }
                sfxPlayer.playAudio('powerOn', 'powerOff');
            }, 'toggle', null, null, 'powerPlant2', null, true, null, 'building'),
            createTextElement(`${capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'fuel'])[0])}:`, 'powerPlant2FuelType', ['red-disabled-text', 'fuel-type', 'invisible']),
            createTextElement(`${getCurrentStarSystemWeatherEfficiency()[1]}%`, 'powerPlant2FuelQuantity', ['red-disabled-text', 'fuel-quantity', 'invisible']),
            `${getCurrencySymbol() + getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'price'])}`,
            '',
            'upgradeCheck',
            'energy',
            'powerPlant2',
            'cash',
            null,
            false,
            null,
            null,
            'building',
            [true, '25%', '75%']
        );
        optionContentElement.appendChild(powerPlant2Row);
    }

    else if (heading === 'Advanced Power Plant') {
        const demoExtraClasses = getDemoBuild() ? ['electron-purple-demo-button'] : [];
        const activeStatus = getBuildingTypeOnOff('powerPlant3');
        if (activeStatus) {
            toggleButtonText = 'Deactivate';
        } else {
            toggleButtonText = 'Activate';
        }

        const powerPlant3Row = createOptionRow(
            'energyPowerPlant3Row',
            null,
            'Advanced Power Plant:',
            createButton(`Sell 1`, ['option-button', 'red-disabled-text', 'sell-building-button', 'resource-cost-sell-check'], () => {
                sellBuilding(1, 'powerPlant3');
                addBuildingPotentialRate('powerPlant3');
            }, 'upgradeCheck', '', 'energy', 'powerPlant3', 'cash', true, null, 'building'),
            createButton(`Add ${Math.round(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'rate']) * getOTypePowerPlantBoostMultiplierForCurrentSystem('powerPlant3') * getTimerRateRatio())} KW /s`, ['option-button', 'red-disabled-text', 'building-purchase-button', 'resource-cost-sell-check', ...demoExtraClasses], () => {
                gain(1, 'powerPlant3Quantity', 'powerPlant3', false, null, 'energy', 'resources');
                addToResourceAllTimeStat(1, 'allTimeAdvancedPowerPlantsBuilt');
                addBuildingPotentialRate('powerPlant3');
                if (getBuildingTypeOnOff('powerPlant3')) {
                    startUpdateTimersAndRates('powerPlant3', 'buy');
                }
            }, 'upgradeCheck', '', 'energy', 'powerPlant3', 'cash', true, null, 'building'),
            createButton(toggleButtonText, ['option-button', 'toggle-timer', 'fuel-check', 'invisible', 'id_powerPlant3Toggle'], (event) => {
                const activeState = addOrRemoveUsedPerSecForFuelRate('diesel', event.target, 'compounds', null, false);
                toggleBuildingTypeOnOff('powerPlant3', activeState);
                startUpdateTimersAndRates('powerPlant3', 'toggle');
                if (!getInfinitePower()) {
                    setPowerOnOff(true);
                }
                sfxPlayer.playAudio('powerOn', 'powerOff');
            }, 'toggle', null, null, 'powerPlant3', null, true, null, 'building'),
            createTextElement(`${capitaliseString(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'fuel'])[0])}:`, 'powerPlant3FuelType', ['red-disabled-text', 'fuel-type', 'invisible']),
            createTextElement(`${getResourceDataObject(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'fuel'])[2], [getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'fuel'])[0], 'quantity'])}`, 'powerPlant3FuelQuantity', ['red-disabled-text', 'fuel-quantity', 'invisible']),
            `${getCurrencySymbol() + getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'price'])}`,
            '',
            'upgradeCheck',
            'energy',
            'powerPlant3',
            'cash',
            null,
            false,
            null,
            null,
            'building',
            [true, '25%', '75%']
        );
        optionContentElement.appendChild(powerPlant3Row);
    }
}
