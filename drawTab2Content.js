import { getImageUrls, getTimerRateRatio, getCurrencySymbol, getBuildingTypeOnOff, setPowerOnOff, getCurrentStarSystemWeatherEfficiency, getInfinitePower, getDemoBuild, getLanguage } from './constantsAndGlobalVars.js';
import { localize, localizeMaterialName } from './localization.js';
import { sellBuilding, toggleBuildingTypeOnOff, addOrRemoveUsedPerSecForFuelRate, setEnergyCapacity, gain, startUpdateTimersAndRates, addBuildingPotentialRate, addToResourceAllTimeStat, getOTypePowerPlantBoostMultiplierForCurrentSystem } from './game.js';
import { setResourceDataObject, getResourceDataObject } from './resourceDataObject.js';
import { removeTabAttentionIfNoIndicators, switchBatteryStatBarWhenBatteryBought, createTextElement, createOptionRow, createButton } from './ui.js';
import { sfxPlayer, playClickSfx } from './audioManager.js';

// The resource a building costs, and the fuel it burns, are stored as internal
// keys plus the section they live in. Both render as display names.
const energyUpgradePriceName = (upgrade, slot) => {
    const price = getResourceDataObject('buildings', ['energy', 'upgrades', upgrade, `resource${slot}Price`]);
    return localizeMaterialName(price[1], price[2], getLanguage());
};

const energyUpgradeFuelName = (upgrade) => {
    const fuel = getResourceDataObject('buildings', ['energy', 'upgrades', upgrade, 'fuel']);
    return localizeMaterialName(fuel[0], fuel[2], getLanguage());
};

export function drawTab2Content(heading, optionContentElement) {
    // The row's own marker is cleared by the click that opened this pane — see
    // clearOptionRowAttentionIndicator in ui.js.
    removeTabAttentionIfNoIndicators('tab2');
    
    let toggleButtonText;
    if (heading === 'Energy Storage') {

        const demoExtraClasses = getDemoBuild() ? ['electron-purple-demo-button'] : [];

        const battery1Row = createOptionRow({
            labelId: 'energyBattery1Row',
            renderNameABs: null,
            labelText: localize('tab2Battery1RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: localize('buttonAddCapacityMwh', getLanguage()).replace('{capacity}', Math.floor(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'capacity']) / 1000)),
                    classNames: ['option-button', 'red-disabled-text', 'building-purchase-button', 'resource-cost-sell-check', ...demoExtraClasses],
                    onClick: () => {
                        gain(1, 'battery1Quantity', 'battery1', false, null, 'energy', 'resources');
                        addToResourceAllTimeStat(1, 'allTimeSodiumIonBatteriesBuilt');
                        setResourceDataObject(true, 'buildings', ['energy', 'batteryBoughtYet']);
                        switchBatteryStatBarWhenBatteryBought();
                        setEnergyCapacity('battery1');
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'energy',
                    objectSectionArgument2: 'battery1',
                    quantityArgument: 'cash',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'building'
                }),
            ],
            descriptionText: `${getCurrencySymbol() + getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'price'])}, 
            ${getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource1Price'])[0]} ${energyUpgradePriceName('battery1', 1)}, 
            ${getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource2Price'])[0]} ${energyUpgradePriceName('battery1', 2)}, 
            ${getResourceDataObject('buildings', ['energy', 'upgrades', 'battery1', 'resource3Price'])[0]} ${energyUpgradePriceName('battery1', 3)}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'energy',
            objectSectionArgument2: 'battery1',
            quantityArgument: 'cash',
            autoBuyerTier: null,
            startInvisibleValue: ['tech', 'sodiumIonPowerStorage'],
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'building',
        });
        optionContentElement.appendChild(battery1Row);

        const battery2Row = createOptionRow({
            labelId: 'energyBattery2Row',
            renderNameABs: null,
            labelText: localize('tab2Battery2RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: localize('buttonAddCapacityMwh', getLanguage()).replace('{capacity}', Math.floor(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery2', 'capacity']) / 1000)),
                    classNames: ['option-button', 'red-disabled-text', 'building-purchase-button', 'resource-cost-sell-check', ...demoExtraClasses],
                    onClick: () => {
                        gain(1, 'battery2Quantity', 'battery2', false, null, 'energy', 'resources');
                        addToResourceAllTimeStat(1, 'allTimeBattery2Built');
                        setResourceDataObject(true, 'buildings', ['energy', 'batteryBoughtYet']);
                        switchBatteryStatBarWhenBatteryBought();
                        setEnergyCapacity('battery2');
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'energy',
                    objectSectionArgument2: 'battery2',
                    quantityArgument: 'cash',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'building'
                }),
            ],
            descriptionText: `${getCurrencySymbol() + getResourceDataObject('buildings', ['energy', 'upgrades', 'battery2', 'price'])}, 
            ${getResourceDataObject('buildings', ['energy', 'upgrades', 'battery2', 'resource1Price'])[0]} ${energyUpgradePriceName('battery2', 1)}, 
            ${getResourceDataObject('buildings', ['energy', 'upgrades', 'battery2', 'resource2Price'])[0]} ${energyUpgradePriceName('battery2', 2)}, 
            ${getResourceDataObject('buildings', ['energy', 'upgrades', 'battery2', 'resource3Price'])[0]} ${energyUpgradePriceName('battery2', 3)}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'energy',
            objectSectionArgument2: 'battery2',
            quantityArgument: 'cash',
            autoBuyerTier: null,
            startInvisibleValue: ['tech', 'advancedPowerGeneration'],
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'building',
        });
        optionContentElement.appendChild(battery2Row);

        const battery3Row = createOptionRow({
            labelId: 'energyBattery3Row',
            renderNameABs: null,
            labelText: localize('tab2Battery3RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: localize('buttonAddCapacityMwh', getLanguage()).replace('{capacity}', Math.floor(getResourceDataObject('buildings', ['energy', 'upgrades', 'battery3', 'capacity']) / 1000)),
                    classNames: ['option-button', 'red-disabled-text', 'building-purchase-button', 'resource-cost-sell-check', ...demoExtraClasses],
                    onClick: () => {
                        gain(1, 'battery3Quantity', 'battery3', false, null, 'energy', 'resources');
                        addToResourceAllTimeStat(1, 'allTimeBattery3Built');
                        setResourceDataObject(true, 'buildings', ['energy', 'batteryBoughtYet']);
                        switchBatteryStatBarWhenBatteryBought();
                        setEnergyCapacity('battery3');
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'energy',
                    objectSectionArgument2: 'battery3',
                    quantityArgument: 'cash',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'building'
                }),
            ],
            descriptionText: `${getCurrencySymbol() + getResourceDataObject('buildings', ['energy', 'upgrades', 'battery3', 'price'])}, 
            ${getResourceDataObject('buildings', ['energy', 'upgrades', 'battery3', 'resource1Price'])[0]} ${energyUpgradePriceName('battery3', 1)}, 
            ${getResourceDataObject('buildings', ['energy', 'upgrades', 'battery3', 'resource2Price'])[0]} ${energyUpgradePriceName('battery3', 2)}, 
            ${getResourceDataObject('buildings', ['energy', 'upgrades', 'battery3', 'resource3Price'])[0]} ${energyUpgradePriceName('battery3', 3)}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'energy',
            objectSectionArgument2: 'battery3',
            quantityArgument: 'cash',
            autoBuyerTier: null,
            startInvisibleValue: ['tech', 'orbitalConstruction'],
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'building',
        });
        optionContentElement.appendChild(battery3Row);
    }
    
    if (heading === 'Power Plant') {
        const activeStatus = getBuildingTypeOnOff('powerPlant1');
        if (activeStatus) {
            toggleButtonText = localize('buttonDeactivate', getLanguage());
        } else {
            toggleButtonText = localize('buttonActivate', getLanguage());
        }

        const powerPlant1Row = createOptionRow({
            labelId: 'energyPowerPlant1Row',
            renderNameABs: null,
            labelText: localize('tab2PowerPlant1RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: localize('buttonSellOne', getLanguage()),
                    classNames: ['option-button', 'red-disabled-text', 'sell-building-button', 'resource-cost-sell-check'],
                    onClick: () => {
                        sellBuilding(1, 'powerPlant1');
                        addBuildingPotentialRate('powerPlant1');
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'energy',
                    objectSectionArgument2: 'powerPlant1',
                    quantityArgument: 'cash',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'building'
                }),
                createButton({
                    text: localize('buttonAddRateKwPerSecond', getLanguage()).replace('{rate}', Math.round(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'rate']) * getOTypePowerPlantBoostMultiplierForCurrentSystem('powerPlant1') * getTimerRateRatio())),
                    classNames: ['option-button', 'building-purchase-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'powerPlant1Quantity', 'powerPlant1', false, null, 'energy', 'resources');
                        addToResourceAllTimeStat(1, 'allTimeBasicPowerPlantsBuilt');
                        addBuildingPotentialRate('powerPlant1');
                        if (getBuildingTypeOnOff('powerPlant1')) {
                            startUpdateTimersAndRates('powerPlant1', 'buy');
                        }
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'energy',
                    objectSectionArgument2: 'powerPlant1',
                    quantityArgument: 'cash',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'building'
                }),
                createButton({
                    text: toggleButtonText,
                    classNames: ['option-button', 'toggle-timer', 'fuel-check', 'invisible', 'id_powerPlant1Toggle'],
                    onClick: (event) => {
                        const activeState = addOrRemoveUsedPerSecForFuelRate('carbon', event.target, 'resources', null, false);
                        toggleBuildingTypeOnOff('powerPlant1', activeState);
                        startUpdateTimersAndRates('powerPlant1', 'toggle');
                        if (!getInfinitePower()) {
                            setPowerOnOff(true);
                        }
                        sfxPlayer.playAudio('powerOn', 'powerOff');
                    },
                    dataConditionCheck: 'toggle',
                    resourcePriceObject: '',
                    objectSectionArgument1: null,
                    objectSectionArgument2: 'powerPlant1',
                    quantityArgument: null,
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'building'
                }),
                createTextElement(`${energyUpgradeFuelName('powerPlant1')}:`, 'powerPlant1FuelType', ['red-disabled-text', 'fuel-type', 'invisible']),
                createTextElement(`${getResourceDataObject(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'fuel'])[2], [getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'fuel'])[0], 'quantity'])}`, 'powerPlant1FuelQuantity', ['red-disabled-text', 'fuel-quantity', 'invisible']),
            ],
            descriptionText: `${getCurrencySymbol() + getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'price'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'energy',
            objectSectionArgument2: 'powerPlant1',
            quantityArgument: 'cash',
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'building',
            noDescriptionContainer: [true, '25%', '70%']
        });
        optionContentElement.appendChild(powerPlant1Row);
    }

    else if (heading === 'Solar Power Plant') {
        const demoExtraClasses = getDemoBuild() ? ['electron-purple-demo-button'] : [];
        const activeStatus = getBuildingTypeOnOff('powerPlant2');
        if (activeStatus) {
            toggleButtonText = localize('buttonDeactivate', getLanguage());
        } else {
            toggleButtonText = localize('buttonActivate', getLanguage());
        }

        const powerPlant2Row = createOptionRow({
            labelId: 'energyPowerPlant2Row',
            renderNameABs: null,
            labelText: localize('tab2PowerPlant2RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: localize('buttonSellOne', getLanguage()),
                    classNames: ['option-button', 'red-disabled-text', 'sell-building-button', 'resource-cost-sell-check'],
                    onClick: () => {
                        sellBuilding(1, 'powerPlant2');
                        addBuildingPotentialRate('powerPlant2');
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'energy',
                    objectSectionArgument2: 'powerPlant2',
                    quantityArgument: 'cash',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'building'
                }),
                createButton({
                    text: localize('buttonAddMaxRateKwPerSecond', getLanguage()).replace('{rate}', Math.round(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'rate']) * getOTypePowerPlantBoostMultiplierForCurrentSystem('powerPlant2') * getTimerRateRatio())),
                    classNames: ['option-button', 'red-disabled-text', 'building-purchase-button', 'resource-cost-sell-check', ...demoExtraClasses],
                    onClick: () => {
                        gain(1, 'powerPlant2Quantity', 'powerPlant2', false, null, 'energy', 'resources');
                        addToResourceAllTimeStat(1, 'allTimeSolarPowerPlantsBuilt');
                        addBuildingPotentialRate('powerPlant2');
                        if (getBuildingTypeOnOff('powerPlant2')) {
                            startUpdateTimersAndRates('powerPlant2', 'buy');
                        }
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'energy',
                    objectSectionArgument2: 'powerPlant2',
                    quantityArgument: 'cash',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'building'
                }),
                createButton({
                    text: toggleButtonText,
                    classNames: ['option-button', 'toggle-timer', 'fuel-check', 'invisible', 'id_powerPlant2Toggle'],
                    onClick: (event) => {
                        const activeState = addOrRemoveUsedPerSecForFuelRate('hydrogen', event.target, 'resources', null, false);
                        toggleBuildingTypeOnOff('powerPlant2', activeState);
                        startUpdateTimersAndRates('powerPlant2', 'toggle');
                        if (!getInfinitePower()) {
                            setPowerOnOff(true);
                        }
                        sfxPlayer.playAudio('powerOn', 'powerOff');
                    },
                    dataConditionCheck: 'toggle',
                    resourcePriceObject: '',
                    objectSectionArgument1: null,
                    objectSectionArgument2: 'powerPlant2',
                    quantityArgument: null,
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'building'
                }),
                createTextElement(`${energyUpgradeFuelName('powerPlant2')}:`, 'powerPlant2FuelType', ['red-disabled-text', 'fuel-type', 'invisible']),
                createTextElement(`${getCurrentStarSystemWeatherEfficiency()[1]}%`, 'powerPlant2FuelQuantity', ['red-disabled-text', 'fuel-quantity', 'invisible']),
            ],
            descriptionText: `${getCurrencySymbol() + getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant2', 'price'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'energy',
            objectSectionArgument2: 'powerPlant2',
            quantityArgument: 'cash',
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'building',
            noDescriptionContainer: [true, '25%', '75%']
        });
        optionContentElement.appendChild(powerPlant2Row);
    }

    else if (heading === 'Advanced Power Plant') {
        const demoExtraClasses = getDemoBuild() ? ['electron-purple-demo-button'] : [];
        const activeStatus = getBuildingTypeOnOff('powerPlant3');
        if (activeStatus) {
            toggleButtonText = localize('buttonDeactivate', getLanguage());
        } else {
            toggleButtonText = localize('buttonActivate', getLanguage());
        }

        const powerPlant3Row = createOptionRow({
            labelId: 'energyPowerPlant3Row',
            renderNameABs: null,
            labelText: localize('tab2PowerPlant3RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: localize('buttonSellOne', getLanguage()),
                    classNames: ['option-button', 'red-disabled-text', 'sell-building-button', 'resource-cost-sell-check'],
                    onClick: () => {
                        sellBuilding(1, 'powerPlant3');
                        addBuildingPotentialRate('powerPlant3');
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'energy',
                    objectSectionArgument2: 'powerPlant3',
                    quantityArgument: 'cash',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'building'
                }),
                createButton({
                    text: localize('buttonAddRateKwPerSecond', getLanguage()).replace('{rate}', Math.round(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'rate']) * getOTypePowerPlantBoostMultiplierForCurrentSystem('powerPlant3') * getTimerRateRatio())),
                    classNames: ['option-button', 'red-disabled-text', 'building-purchase-button', 'resource-cost-sell-check', ...demoExtraClasses],
                    onClick: () => {
                        gain(1, 'powerPlant3Quantity', 'powerPlant3', false, null, 'energy', 'resources');
                        addToResourceAllTimeStat(1, 'allTimeAdvancedPowerPlantsBuilt');
                        addBuildingPotentialRate('powerPlant3');
                        if (getBuildingTypeOnOff('powerPlant3')) {
                            startUpdateTimersAndRates('powerPlant3', 'buy');
                        }
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'energy',
                    objectSectionArgument2: 'powerPlant3',
                    quantityArgument: 'cash',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'building'
                }),
                createButton({
                    text: toggleButtonText,
                    classNames: ['option-button', 'toggle-timer', 'fuel-check', 'invisible', 'id_powerPlant3Toggle'],
                    onClick: (event) => {
                        const activeState = addOrRemoveUsedPerSecForFuelRate('diesel', event.target, 'compounds', null, false);
                        toggleBuildingTypeOnOff('powerPlant3', activeState);
                        startUpdateTimersAndRates('powerPlant3', 'toggle');
                        if (!getInfinitePower()) {
                            setPowerOnOff(true);
                        }
                        sfxPlayer.playAudio('powerOn', 'powerOff');
                    },
                    dataConditionCheck: 'toggle',
                    resourcePriceObject: '',
                    objectSectionArgument1: null,
                    objectSectionArgument2: 'powerPlant3',
                    quantityArgument: null,
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'building'
                }),
                createTextElement(`${energyUpgradeFuelName('powerPlant3')}:`, 'powerPlant3FuelType', ['red-disabled-text', 'fuel-type', 'invisible']),
                createTextElement(`${getResourceDataObject(getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'fuel'])[2], [getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'fuel'])[0], 'quantity'])}`, 'powerPlant3FuelQuantity', ['red-disabled-text', 'fuel-quantity', 'invisible']),
            ],
            descriptionText: `${getCurrencySymbol() + getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant3', 'price'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'energy',
            objectSectionArgument2: 'powerPlant3',
            quantityArgument: 'cash',
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'building',
            noDescriptionContainer: [true, '25%', '75%']
        });
        optionContentElement.appendChild(powerPlant3Row);
    }
}
