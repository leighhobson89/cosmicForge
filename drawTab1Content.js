import { getLastSellResourceCompoundDropdownOption, setLastSellResourceCompoundDropdownOption, getResourceSalePreview, getTimerRateRatio } from './constantsAndGlobalVars.js';
import { sellResource, fuseResource, gain, increaseResourceStorage, getBTypeAutoBuyerBoostForTier } from './game.js';
import { getResourceDataObject, setResourceDataObject } from './resourceDataObject.js';
import { removeTabAttentionIfNoIndicators, createTextElement, createToggleSwitch, createOptionRow, createDropdown, createButton, disableStorageNotificationActionIfShowing } from './ui.js';

export function drawTab1Content(heading, optionContentElement) {
    const optionElement = document.getElementById(heading.toLowerCase().replace(/\s(.)/g, (match, group1) => group1.toUpperCase()).replace(/\s+/g, '') + 'Option');
    if (optionElement) {
        const warningIcon = optionElement.querySelector('span.attention-indicator');
        if (warningIcon && warningIcon.innerHTML.includes('⚠️')) {
            warningIcon.remove();
        }
    }
    removeTabAttentionIfNoIndicators('tab1');   

    if (heading === 'Hydrogen') {
        let storagePrice = getResourceDataObject('resources', ['hydrogen', 'storageCapacity']);
        let autobuyer1Price = getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'price']);
        let autobuyer2Price = getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier2', 'price']);
        let autobuyer3Price = getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier3', 'price']);
        let autobuyer4Price = getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier4', 'price']);

        const hydrogenSellRow = createOptionRow({
            labelId: 'hydrogenSellRow',
            renderNameABs: null,
            labelText: 'Sell Hydrogen:',
            inputElements: [
                createDropdown('hydrogenSellSelectQuantity', [
                    { value: 'all', text: 'All Stock' },
                    { value: 'threeQuarters', text: '75% Stock' },
                    { value: 'twoThirds', text: '67% Stock' },
                    { value: 'half', text: '50% Stock' },
                    { value: 'oneThird', text: '33% Stock' },
                    { value: '100000', text: '100000' },
                    { value: '10000', text: '10000' },
                    { value: '1000', text: '1000' },
                    { value: '100', text: '100' },
                    { value: '10', text: '10' },
                    { value: '1', text: '1' },
                ], getLastSellResourceCompoundDropdownOption('resources', 'hydrogen'), (value) => {
                    setLastSellResourceCompoundDropdownOption('resources', 'hydrogen', value);
                }),
                createButton({
                    text: 'Sell',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'sell'],
                    onClick: () => {
                        sellResource('hydrogen');
                    },
                    dataConditionCheck: 'sellResource',
                    resourcePriceObject: null,
                    objectSectionArgument1: null,
                    objectSectionArgument2: null,
                    quantityArgument: 'hydrogen',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
                createButton({
                    text: 'Fuse',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'fuse'],
                    onClick: (event) => {
                        fuseResource("hydrogen", [
                            {
                                fuseTo: getResourceDataObject('resources', ['hydrogen', 'fuseTo1']),
                                ratio: getResourceDataObject('resources', ['hydrogen', 'fuseToRatio1']),
                                resourceRowToShow: document.querySelector('#gases .collapsible-content .row-side-menu:nth-child(2)'),
                                categoryToShow: document.getElementById('gases'),
                                mainCategoryToShow: document.getElementById('gas')
                            }
                        ]);
                        event.currentTarget.classList.remove('warning-orange-text', 'disabled-red-text');
                        event.currentTarget.parentElement.nextElementSibling.querySelector('label').classList.remove('warning-orange-text', 'disabled-red-text');
                    },
                    dataConditionCheck: 'fuseResource',
                    resourcePriceObject: null,
                    objectSectionArgument1: 'hydrogen',
                    objectSectionArgument2: 'helium',
                    quantityArgument: 'hydrogen',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
                createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['hydrogen', 'autoSell']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${getResourceSalePreview('hydrogen')}`,
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(hydrogenSellRow);
        const toggleSwitch = hydrogenSellRow.querySelector('#autoSellToggle');
        if (toggleSwitch) {
            toggleSwitch.setAttribute('data-type', 'resources');
        }

        const hydrogenGainRow = createOptionRow({
            labelId: 'hydrogenGainRow',
            renderNameABs: null,
            labelText: 'Gain 1 Hydrogen:',
            inputElements: [
                createButton({
                    text: 'Gain',
                    classNames: ['option-button'],
                    onClick: () => {
                        gain(1, 'hydrogenQuantity', null, false, null, 'hydrogen', 'resources');
                    },
                    dataConditionCheck: null,
                    resourcePriceObject: null,
                    objectSectionArgument1: null,
                    objectSectionArgument2: null,
                    quantityArgument: null,
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
            ],
            descriptionText: null,
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(hydrogenGainRow);

        const hydrogenIncreaseStorageRow = createOptionRow({
            labelId: 'hydrogenIncreaseStorageRow',
            renderNameABs: null,
            labelText: 'Increase Storage:',
            inputElements: [
                createButton({
                    text: 'Increase Storage',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        increaseResourceStorage(['hydrogenQuantity'], ['hydrogen'], ['resources']);
                        disableStorageNotificationActionIfShowing('hydrogen', 'Already Increased!');
                        storagePrice = getResourceDataObject('resources', ['hydrogen', 'storageCapacity']) - 1;
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'storage',
                    objectSectionArgument2: null,
                    quantityArgument: 'hydrogen',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
            ],
            descriptionText: `${storagePrice + " " + getResourceDataObject('resources', ['hydrogen', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'storage',
            objectSectionArgument2: null,
            quantityArgument: 'hydrogen',
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: 'hydrogen',
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(hydrogenIncreaseStorageRow);

        const hydrogenAutoBuyer1Row = createOptionRow({
            labelId: 'hydrogenAutoBuyer1Row',
            renderNameABs: getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
            labelText: 'Hydrogen Auto Buyer Tier 1:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(1) * getTimerRateRatio()))} Hydrogen /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'hydrogenAB1Quantity', 'autoBuyer', true, 'tier1', 'hydrogen', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'hydrogen',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier1',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'hydrogenAB1Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('hydrogen1Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer1Price + " " + getResourceDataObject('resources', ['hydrogen', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'hydrogen',
            autoBuyerTier: 'tier1',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(hydrogenAutoBuyer1Row);

        const hydrogenAutoBuyer2Row = createOptionRow({
            labelId: 'hydrogenAutoBuyer2Row',
            renderNameABs: getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
            labelText: 'Hydrogen Auto Buyer Tier 2:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(2) * getTimerRateRatio()))} Hydrogen /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'hydrogenAB2Quantity', 'autoBuyer', true, 'tier2', 'hydrogen', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'hydrogen',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier2',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'hydrogenAB2Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('hydrogen2Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer2Price + " " + getResourceDataObject('resources', ['hydrogen', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'hydrogen',
            autoBuyerTier: 'tier2',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(hydrogenAutoBuyer2Row);

        const hydrogenAutoBuyer3Row = createOptionRow({
            labelId: 'hydrogenAutoBuyer3Row',
            renderNameABs: getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
            labelText: 'Hydrogen Auto Buyer Tier 3:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(3) * getTimerRateRatio()))} Hydrogen /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'hydrogenAB3Quantity', 'autoBuyer', true, 'tier3', 'hydrogen', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'hydrogen',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier3',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'hydrogenAB3Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('hydrogen3Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer3Price + " " + getResourceDataObject('resources', ['hydrogen', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'hydrogen',
            autoBuyerTier: 'tier3',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(hydrogenAutoBuyer3Row);

        const hydrogenAutoBuyer4Row = createOptionRow({
            labelId: 'hydrogenAutoBuyer4Row',
            renderNameABs: getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
            labelText: 'Hydrogen Auto Buyer Tier 4:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(4) * getTimerRateRatio()))} Hydrogen /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'hydrogenAB4Quantity', 'autoBuyer', true, 'tier4', 'hydrogen', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'hydrogen',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier4',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'hydrogenAB4Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('hydrogen4Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer4Price + " " + getResourceDataObject('resources', ['hydrogen', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'hydrogen',
            autoBuyerTier: 'tier4',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(hydrogenAutoBuyer4Row);
    }
    else if (heading === 'Helium') {
        let storagePrice = getResourceDataObject('resources', ['helium', 'storageCapacity']);
        let autobuyer1Price = getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier1', 'price']);
        let autobuyer2Price = getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier2', 'price']);
        let autobuyer3Price = getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier3', 'price']);
        let autobuyer4Price = getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier4', 'price']);

        const heliumSellRow = createOptionRow({
            labelId: 'heliumSellRow',
            renderNameABs: null,
            labelText: 'Sell Helium:',
            inputElements: [
                createDropdown('heliumSellSelectQuantity', [
                    { value: 'all', text: 'All Stock' },
                    { value: 'threeQuarters', text: '75% Stock' },
                    { value: 'twoThirds', text: '67% Stock' },
                    { value: 'half', text: '50% Stock' },
                    { value: 'oneThird', text: '33% Stock' },
                    { value: '100000', text: '100000' },
                    { value: '10000', text: '10000' },
                    { value: '1000', text: '1000' },
                    { value: '100', text: '100' },
                    { value: '10', text: '10' },
                    { value: '1', text: '1' },
                ], getLastSellResourceCompoundDropdownOption('resources', 'helium'), (value) => {
                    setLastSellResourceCompoundDropdownOption('resources', 'helium', value);
                }),
                createButton({
                    text: 'Sell',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'sell'],
                    onClick: () => {
                        sellResource('helium');
                    },
                    dataConditionCheck: 'sellResource',
                    resourcePriceObject: null,
                    objectSectionArgument1: null,
                    objectSectionArgument2: null,
                    quantityArgument: 'helium',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
                createButton({
                    text: 'Fuse',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'fuse'],
                    onClick: (event) => {
                        fuseResource("helium", [
                            {
                                fuseTo: getResourceDataObject('resources', ['helium', 'fuseTo1']),
                                ratio: getResourceDataObject('resources', ['helium', 'fuseToRatio1']),
                                resourceRowToShow: document.querySelector('#nonFerrous .collapsible-content .row-side-menu:nth-child(1)'),
                                categoryToShow: document.getElementById('nonFerrous'),
                                mainCategoryToShow: document.getElementById('solids')
                            }
                        ]);
                        event.currentTarget.classList.remove('warning-orange-text', 'disabled-red-text');
                        event.currentTarget.parentElement.nextElementSibling.querySelector('label').classList.remove('warning-orange-text', 'disabled-red-text');
                    },
                    dataConditionCheck: 'fuseResource',
                    resourcePriceObject: null,
                    objectSectionArgument1: 'helium',
                    objectSectionArgument2: 'carbon',
                    quantityArgument: 'helium',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
                createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['helium', 'autoSell']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${getResourceSalePreview('helium')}`,
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(heliumSellRow);
        const toggleSwitch = heliumSellRow.querySelector('#autoSellToggle');
        if (toggleSwitch) {
            toggleSwitch.setAttribute('data-type', 'resources');
        }

        const heliumGainRow = createOptionRow({
            labelId: 'heliumGainRow',
            renderNameABs: null,
            labelText: 'Gain 1 Helium:',
            inputElements: [
                createButton({
                    text: 'Gain',
                    classNames: ['option-button'],
                    onClick: () => {
                        gain(1, 'heliumQuantity', null, false, null, 'helium', 'resources');
                    },
                    dataConditionCheck: null,
                    resourcePriceObject: null,
                    objectSectionArgument1: null,
                    objectSectionArgument2: null,
                    quantityArgument: null,
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
            ],
            descriptionText: null,
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(heliumGainRow);

        const heliumIncreaseStorageRow = createOptionRow({
            labelId: 'heliumIncreaseStorageRow',
            renderNameABs: null,
            labelText: 'Increase Storage:',
            inputElements: [
                createButton({
                    text: 'Increase Storage',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        increaseResourceStorage(['heliumQuantity'], ['helium'], ['resources']);
                        disableStorageNotificationActionIfShowing('helium', 'Already Increased!');
                        storagePrice = getResourceDataObject('resources', ['helium', 'storageCapacity']) - 1;
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'storage',
                    objectSectionArgument2: null,
                    quantityArgument: 'helium',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
            ],
            descriptionText: `${storagePrice + " " + getResourceDataObject('resources', ['helium', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'storage',
            objectSectionArgument2: null,
            quantityArgument: 'helium',
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: 'helium',
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(heliumIncreaseStorageRow);

        const heliumAutoBuyer1Row = createOptionRow({
            labelId: 'heliumAutoBuyer1Row',
            renderNameABs: getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
            labelText: 'Helium Auto Buyer Tier 1:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(1) * getTimerRateRatio()))} Helium /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'heliumAB1Quantity', 'autoBuyer', true, 'tier1', 'helium', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'helium',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier1',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'heliumAB1Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('helium1Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['helium', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer1Price + " " + getResourceDataObject('resources', ['helium', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'helium',
            autoBuyerTier: 'tier1',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(heliumAutoBuyer1Row);

        const heliumAutoBuyer2Row = createOptionRow({
            labelId: 'heliumAutoBuyer2Row',
            renderNameABs: getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
            labelText: 'Helium Auto Buyer Tier 2:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(2) * getTimerRateRatio()))} Helium /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'heliumAB2Quantity', 'autoBuyer', true, 'tier2', 'helium', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'helium',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier2',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'heliumAB2Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('helium2Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['helium', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer2Price + " " + getResourceDataObject('resources', ['helium', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'helium',
            autoBuyerTier: 'tier2',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(heliumAutoBuyer2Row);

        const heliumAutoBuyer3Row = createOptionRow({
            labelId: 'heliumAutoBuyer3Row',
            renderNameABs: getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
            labelText: 'Helium Auto Buyer Tier 3:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(3) * getTimerRateRatio()))} Helium /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'heliumAB3Quantity', 'autoBuyer', true, 'tier3', 'helium', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'helium',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier3',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'heliumAB3Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('helium3Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['helium', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer3Price + " " + getResourceDataObject('resources', ['helium', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'helium',
            autoBuyerTier: 'tier3',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(heliumAutoBuyer3Row);

        const heliumAutoBuyer4Row = createOptionRow({
            labelId: 'heliumAutoBuyer4Row',
            renderNameABs: getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
            labelText: 'Helium Auto Buyer Tier 4:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(4) * getTimerRateRatio()))} Helium /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'heliumAB4Quantity', 'autoBuyer', true, 'tier4', 'helium', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'helium',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier4',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'heliumAB4Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('helium4Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['helium', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer4Price + " " + getResourceDataObject('resources', ['helium', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'helium',
            autoBuyerTier: 'tier4',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(heliumAutoBuyer4Row);
    }

    else if (heading === 'Carbon') {
        let storagePrice = getResourceDataObject('resources', ['carbon', 'storageCapacity']);
        let autobuyer1Price = getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier1', 'price']);
        let autobuyer2Price = getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier2', 'price']);
        let autobuyer3Price = getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier3', 'price']);
        let autobuyer4Price = getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier4', 'price']);

        const carbonSellRow = createOptionRow({
            labelId: 'carbonSellRow',
            renderNameABs: null,
            labelText: 'Sell Carbon:',
            inputElements: [
                createDropdown('carbonSellSelectQuantity', [
                    { value: 'all', text: 'All Stock' },
                    { value: 'threeQuarters', text: '75% Stock' },
                    { value: 'twoThirds', text: '67% Stock' },
                    { value: 'half', text: '50% Stock' },
                    { value: 'oneThird', text: '33% Stock' },
                    { value: '100000', text: '100000' },
                    { value: '10000', text: '10000' },
                    { value: '1000', text: '1000' },
                    { value: '100', text: '100' },
                    { value: '10', text: '10' },
                    { value: '1', text: '1' },
                ], getLastSellResourceCompoundDropdownOption('resources', 'carbon'), (value) => {
                    setLastSellResourceCompoundDropdownOption('resources', 'carbon', value);
                }),
                createButton({
                    text: 'Sell',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'sell'],
                    onClick: () => {
                        sellResource('carbon');
                    },
                    dataConditionCheck: 'sellResource',
                    resourcePriceObject: null,
                    objectSectionArgument1: null,
                    objectSectionArgument2: null,
                    quantityArgument: 'carbon',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
                createButton({
                    text: 'Fuse',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'fuse'],
                    onClick: (event) => {
                        fuseResource("carbon", [
                            {
                                fuseTo: getResourceDataObject('resources', ['carbon', 'fuseTo1']),
                                ratio: getResourceDataObject('resources', ['carbon', 'fuseToRatio1']),
                                resourceRowToShow: document.querySelector('#gases .collapsible-content .row-side-menu:nth-child(1)'),
                                categoryToShow: document.getElementById('gases'),
                                mainCategoryToShow: document.getElementById('gas')
                            },
                            {
                                fuseTo: getResourceDataObject('resources', ['carbon', 'fuseTo2']),
                                ratio: getResourceDataObject('resources', ['sodium', 'fuseToRatio2']),
                                resourceRowToShow: document.querySelector('#metals .collapsible-content .row-side-menu:nth-child(1)'),
                                categoryToShow: document.getElementById('metals'),
                                mainCategoryToShow: document.getElementById('solids')
                            }
                        ]);
                        event.currentTarget.classList.remove('warning-orange-text', 'disabled-red-text');
                        event.currentTarget.parentElement.nextElementSibling.querySelector('label').classList.remove('warning-orange-text', 'disabled-red-text');
                    },
                    dataConditionCheck: 'fuseResource',
                    resourcePriceObject: null,
                    objectSectionArgument1: 'carbon',
                    objectSectionArgument2: 'neon',
                    quantityArgument: 'carbon',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
                createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['carbon', 'autoSell']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${getResourceSalePreview('neon')}`,
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(carbonSellRow);
        const toggleSwitch = carbonSellRow.querySelector('#autoSellToggle');
        if (toggleSwitch) {
            toggleSwitch.setAttribute('data-type', 'resources');
        }

        const carbonGainRow = createOptionRow({
            labelId: 'carbonGainRow',
            renderNameABs: null,
            labelText: 'Gain 1 Carbon:',
            inputElements: [
                createButton({
                    text: 'Gain',
                    classNames: ['option-button'],
                    onClick: () => {
                        gain(1, 'carbonQuantity', null, false, null, 'carbon', 'resources');
                    },
                    dataConditionCheck: null,
                    resourcePriceObject: null,
                    objectSectionArgument1: null,
                    objectSectionArgument2: null,
                    quantityArgument: null,
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
            ],
            descriptionText: null,
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(carbonGainRow);

        const carbonIncreaseStorageRow = createOptionRow({
            labelId: 'carbonIncreaseStorageRow',
            renderNameABs: null,
            labelText: 'Increase Storage:',
            inputElements: [
                createButton({
                    text: 'Increase Storage',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        increaseResourceStorage(['carbonQuantity'], ['carbon'], ['resources']);
                        disableStorageNotificationActionIfShowing('carbon', 'Already Increased!');
                        storagePrice = getResourceDataObject('resources', ['carbon', 'storageCapacity']) - 1;
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'storage',
                    objectSectionArgument2: null,
                    quantityArgument: 'carbon',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
            ],
            descriptionText: `${storagePrice + " " + getResourceDataObject('resources', ['carbon', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'storage',
            objectSectionArgument2: null,
            quantityArgument: 'carbon',
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: 'carbon',
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(carbonIncreaseStorageRow);

        const carbonAutoBuyer1Row = createOptionRow({
            labelId: 'carbonAutoBuyer1Row',
            renderNameABs: getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
            labelText: 'Carbon Auto Buyer Tier 1:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(1) * getTimerRateRatio()))} Carbon /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'carbonAB1Quantity', 'autoBuyer', true, 'tier1', 'carbon', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'carbon',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier1',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'carbonAB1Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('carbon1Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['carbon', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer1Price + " " + getResourceDataObject('resources', ['carbon', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'carbon',
            autoBuyerTier: 'tier1',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(carbonAutoBuyer1Row);

        const carbonAutoBuyer2Row = createOptionRow({
            labelId: 'carbonAutoBuyer2Row',
            renderNameABs: getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
            labelText: 'Carbon Auto Buyer Tier 2:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(2) * getTimerRateRatio()))} Carbon /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'carbonAB2Quantity', 'autoBuyer', true, 'tier2', 'carbon', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'carbon',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier2',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'carbonAB2Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('carbon2Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['carbon', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer2Price + " " + getResourceDataObject('resources', ['carbon', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'carbon',
            autoBuyerTier: 'tier2',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(carbonAutoBuyer2Row);

        const carbonAutoBuyer3Row = createOptionRow({
            labelId: 'carbonAutoBuyer3Row',
            renderNameABs: getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
            labelText: 'Carbon Auto Buyer Tier 3:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(3) * getTimerRateRatio()))} Carbon /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'carbonAB3Quantity', 'autoBuyer', true, 'tier3', 'carbon', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'carbon',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier3',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'carbonAB3Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('carbon3Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['carbon', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer3Price + " " + getResourceDataObject('resources', ['carbon', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'carbon',
            autoBuyerTier: 'tier3',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(carbonAutoBuyer3Row);

        const carbonAutoBuyer4Row = createOptionRow({
            labelId: 'carbonAutoBuyer4Row',
            renderNameABs: getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
            labelText: 'Carbon Auto Buyer Tier 4:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(4) * getTimerRateRatio()))} Carbon /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'carbonAB4Quantity', 'autoBuyer', true, 'tier4', 'carbon', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'carbon',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier4',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'carbonAB4Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('carbon4Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['carbon', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer4Price + " " + getResourceDataObject('resources', ['carbon', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'carbon',
            autoBuyerTier: 'tier4',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(carbonAutoBuyer4Row);
    } 
    
    else if (heading === 'Neon') {
        let storagePrice = getResourceDataObject('resources', ['neon', 'storageCapacity']);
        let autobuyer1Price = getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier1', 'price']);
        let autobuyer2Price = getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier2', 'price']);
        let autobuyer3Price = getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier3', 'price']);
        let autobuyer4Price = getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier4', 'price']);

        const neonSellRow = createOptionRow({
            labelId: 'neonSellRow',
            renderNameABs: null,
            labelText: 'Sell Neon:',
            inputElements: [
                createDropdown('neonSellSelectQuantity', [
                    { value: 'all', text: 'All Stock' },
                    { value: 'threeQuarters', text: '75% Stock' },
                    { value: 'twoThirds', text: '67% Stock' },
                    { value: 'half', text: '50% Stock' },
                    { value: 'oneThird', text: '33% Stock' },
                    { value: '100000', text: '100000' },
                    { value: '10000', text: '10000' },
                    { value: '1000', text: '1000' },
                    { value: '100', text: '100' },
                    { value: '10', text: '10' },
                    { value: '1', text: '1' },
                ], getLastSellResourceCompoundDropdownOption('resources', 'neon'), (value) => {
                    setLastSellResourceCompoundDropdownOption('resources', 'neon', value);
                }),
                createButton({
                    text: 'Sell',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'sell'],
                    onClick: () => {
                        sellResource('neon');
                    },
                    dataConditionCheck: 'sellResource',
                    resourcePriceObject: null,
                    objectSectionArgument1: null,
                    objectSectionArgument2: null,
                    quantityArgument: 'neon',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
                createButton({
                    text: 'Fuse',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'fuse'],
                    onClick: (event) => {
                        fuseResource("neon", [
                            {
                                fuseTo: getResourceDataObject('resources', ['neon', 'fuseTo1']),
                                ratio: getResourceDataObject('resources', ['neon', 'fuseToRatio1']),
                                resourceRowToShow: document.querySelector('#gases .collapsible-content .row-side-menu:nth-child(3)'),
                                categoryToShow: document.getElementById('gases'),
                                mainCategoryToShow: document.getElementById('gas')
                            }
                        ]);
                        event.currentTarget.classList.remove('warning-orange-text', 'disabled-red-text');
                        event.currentTarget.parentElement.nextElementSibling.querySelector('label').classList.remove('warning-orange-text', 'disabled-red-text');
                    },
                    dataConditionCheck: 'fuseResource',
                    resourcePriceObject: null,
                    objectSectionArgument1: 'neon',
                    objectSectionArgument2: 'oxygen',
                    quantityArgument: 'neon',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
                createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['neon', 'autoSell']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${getResourceSalePreview('neon')}`,
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(neonSellRow);
        const toggleSwitch = neonSellRow.querySelector('#autoSellToggle');
        if (toggleSwitch) {
            toggleSwitch.setAttribute('data-type', 'resources');
        }

        const neonGainRow = createOptionRow({
            labelId: 'neonGainRow',
            renderNameABs: null,
            labelText: 'Gain 1 Neon:',
            inputElements: [
                createButton({
                    text: 'Gain',
                    classNames: ['option-button'],
                    onClick: () => {
                        gain(1, 'neonQuantity', null, false, null, 'neon', 'resources');
                    },
                    dataConditionCheck: null,
                    resourcePriceObject: null,
                    objectSectionArgument1: null,
                    objectSectionArgument2: null,
                    quantityArgument: null,
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
            ],
            descriptionText: null,
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(neonGainRow);

        const neonIncreaseStorageRow = createOptionRow({
            labelId: 'neonIncreaseStorageRow',
            renderNameABs: null,
            labelText: 'Increase Storage:',
            inputElements: [
                createButton({
                    text: 'Increase Storage',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        increaseResourceStorage(['neonQuantity'], ['neon'], ['resources']);
                        disableStorageNotificationActionIfShowing('neon', 'Already Increased!');
                        storagePrice = getResourceDataObject('resources', ['neon', 'storageCapacity']) - 1;
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'storage',
                    objectSectionArgument2: null,
                    quantityArgument: 'neon',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
            ],
            descriptionText: `${storagePrice + " " + getResourceDataObject('resources', ['neon', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'storage',
            objectSectionArgument2: null,
            quantityArgument: 'neon',
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: 'neon',
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(neonIncreaseStorageRow);

        const neonAutoBuyer1Row = createOptionRow({
            labelId: 'neonAutoBuyer1Row',
            renderNameABs: getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
            labelText: 'Neon Auto Buyer Tier 1:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(1) * getTimerRateRatio()))} Neon /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'neonAB1Quantity', 'autoBuyer', true, 'tier1', 'neon', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'neon',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier1',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'neonAB1Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('neon1Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['neon', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer1Price + " " + getResourceDataObject('resources', ['neon', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'neon',
            autoBuyerTier: 'tier1',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(neonAutoBuyer1Row);

        const neonAutoBuyer2Row = createOptionRow({
            labelId: 'neonAutoBuyer2Row',
            renderNameABs: getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
            labelText: 'Neon Auto Buyer Tier 2:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(2) * getTimerRateRatio()))} Neon /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'neonAB2Quantity', 'autoBuyer', true, 'tier2', 'neon', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'neon',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier2',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'neonAB2Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('neon2Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['neon', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer2Price + " " + getResourceDataObject('resources', ['neon', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'neon',
            autoBuyerTier: 'tier2',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(neonAutoBuyer2Row);

        const neonAutoBuyer3Row = createOptionRow({
            labelId: 'neonAutoBuyer3Row',
            renderNameABs: getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
            labelText: 'Neon Auto Buyer Tier 3:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(3) * getTimerRateRatio()))} Neon /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'neonAB3Quantity', 'autoBuyer', true, 'tier3', 'neon', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'neon',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier3',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'neonAB3Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('neon3Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['neon', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer3Price + " " + getResourceDataObject('resources', ['neon', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'neon',
            autoBuyerTier: 'tier3',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(neonAutoBuyer3Row);

        const neonAutoBuyer4Row = createOptionRow({
            labelId: 'neonAutoBuyer4Row',
            renderNameABs: getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
            labelText: 'Neon Auto Buyer Tier 4:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(4) * getTimerRateRatio()))} Neon /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'neonAB4Quantity', 'autoBuyer', true, 'tier4', 'neon', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'neon',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier4',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'neonAB4Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('neon4Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['neon', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer4Price + " " + getResourceDataObject('resources', ['neon', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'neon',
            autoBuyerTier: 'tier4',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(neonAutoBuyer4Row);
    }
    
    else if (heading === 'Oxygen') {
        let storagePrice = getResourceDataObject('resources', ['oxygen', 'storageCapacity']);
        let autobuyer1Price = getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier1', 'price']);
        let autobuyer2Price = getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier2', 'price']);
        let autobuyer3Price = getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier3', 'price']);
        let autobuyer4Price = getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier4', 'price']);

        const oxygenSellRow = createOptionRow({
            labelId: 'oxygenSellRow',
            renderNameABs: null,
            labelText: 'Sell Oxygen:',
            inputElements: [
                createDropdown('oxygenSellSelectQuantity', [
                    { value: 'all', text: 'All Stock' },
                    { value: 'threeQuarters', text: '75% Stock' },
                    { value: 'twoThirds', text: '67% Stock' },
                    { value: 'half', text: '50% Stock' },
                    { value: 'oneThird', text: '33% Stock' },
                    { value: '100000', text: '100000' },
                    { value: '10000', text: '10000' },
                    { value: '1000', text: '1000' },
                    { value: '100', text: '100' },
                    { value: '10', text: '10' },
                    { value: '1', text: '1' },
                ], getLastSellResourceCompoundDropdownOption('resources', 'oxygen'), (value) => {
                    setLastSellResourceCompoundDropdownOption('resources', 'oxygen', value);
                }),
                createButton({
                    text: 'Sell',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'sell'],
                    onClick: () => {
                        sellResource('oxygen');
                    },
                    dataConditionCheck: 'sellResource',
                    resourcePriceObject: null,
                    objectSectionArgument1: null,
                    objectSectionArgument2: null,
                    quantityArgument: 'oxygen',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
                createButton({
                    text: 'Fuse',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'fuse'],
                    onClick: (event) => {
                        fuseResource("oxygen", [
                            {
                                fuseTo: getResourceDataObject('resources', ['oxygen', 'fuseTo1']),
                                ratio: getResourceDataObject('resources', ['oxygen', 'fuseToRatio1']),
                                resourceRowToShow: document.querySelector('#nonFerrous .collapsible-content .row-side-menu:nth-child(2)'),
                                categoryToShow: document.getElementById('nonFerrous'),
                                mainCategoryToShow: document.getElementById('solids')
                            }
                        ]);
                        event.currentTarget.classList.remove('warning-orange-text', 'disabled-red-text');
                        event.currentTarget.parentElement.nextElementSibling.querySelector('label').classList.remove('warning-orange-text', 'disabled-red-text');
                    },
                    dataConditionCheck: 'fuseResource',
                    resourcePriceObject: null,
                    objectSectionArgument1: 'oxygen',
                    objectSectionArgument2: 'silicon',
                    quantityArgument: 'oxygen',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
                createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['oxygen', 'autoSell']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${getResourceSalePreview('oxygen')}`,
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(oxygenSellRow);
        const toggleSwitch = oxygenSellRow.querySelector('#autoSellToggle');
        if (toggleSwitch) {
            toggleSwitch.setAttribute('data-type', 'resources');
        }

        const oxygenGainRow = createOptionRow({
            labelId: 'oxygenGainRow',
            renderNameABs: null,
            labelText: 'Gain 1 Oxygen:',
            inputElements: [
                createButton({
                    text: 'Gain',
                    classNames: ['option-button'],
                    onClick: () => {
                        gain(1, 'oxygenQuantity', null, false, null, 'oxygen', 'resources');
                    },
                    dataConditionCheck: null,
                    resourcePriceObject: null,
                    objectSectionArgument1: null,
                    objectSectionArgument2: null,
                    quantityArgument: null,
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
            ],
            descriptionText: null,
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(oxygenGainRow);

        const oxygenIncreaseStorageRow = createOptionRow({
            labelId: 'oxygenIncreaseStorageRow',
            renderNameABs: null,
            labelText: 'Increase Storage:',
            inputElements: [
                createButton({
                    text: 'Increase Storage',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        increaseResourceStorage(['oxygenQuantity'], ['oxygen'], ['resources']);
                        disableStorageNotificationActionIfShowing('oxygen', 'Already Increased!');
                        storagePrice = getResourceDataObject('resources', ['oxygen', 'storageCapacity']) - 1;
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'storage',
                    objectSectionArgument2: null,
                    quantityArgument: 'oxygen',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
            ],
            descriptionText: `${storagePrice + " " + getResourceDataObject('resources', ['oxygen', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'storage',
            objectSectionArgument2: null,
            quantityArgument: 'oxygen',
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: 'oxygen',
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(oxygenIncreaseStorageRow);

        const oxygenAutoBuyer1Row = createOptionRow({
            labelId: 'oxygenAutoBuyer1Row',
            renderNameABs: getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
            labelText: 'Oxygen Auto Buyer Tier 1:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(1) * getTimerRateRatio()))} Oxygen /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'oxygenAB1Quantity', 'autoBuyer', true, 'tier1', 'oxygen', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'oxygen',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier1',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'oxygenAB1Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('oxygen1Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer1Price + " " + getResourceDataObject('resources', ['oxygen', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'oxygen',
            autoBuyerTier: 'tier1',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(oxygenAutoBuyer1Row);

        const oxygenAutoBuyer2Row = createOptionRow({
            labelId: 'oxygenAutoBuyer2Row',
            renderNameABs: getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
            labelText: 'Oxygen Auto Buyer Tier 2:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(2) * getTimerRateRatio()))} Oxygen /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'oxygenAB2Quantity', 'autoBuyer', true, 'tier2', 'oxygen', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'oxygen',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier2',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'oxygenAB2Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('oxygen2Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer2Price + " " + getResourceDataObject('resources', ['oxygen', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'oxygen',
            autoBuyerTier: 'tier2',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(oxygenAutoBuyer2Row);

        const oxygenAutoBuyer3Row = createOptionRow({
            labelId: 'oxygenAutoBuyer3Row',
            renderNameABs: getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
            labelText: 'Oxygen Auto Buyer Tier 3:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(3) * getTimerRateRatio()))} Oxygen /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'oxygenAB3Quantity', 'autoBuyer', true, 'tier3', 'oxygen', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'oxygen',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier3',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'oxygenAB3Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('oxygen3Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer3Price + " " + getResourceDataObject('resources', ['oxygen', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'oxygen',
            autoBuyerTier: 'tier3',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(oxygenAutoBuyer3Row);

        const oxygenAutoBuyer4Row = createOptionRow({
            labelId: 'oxygenAutoBuyer4Row',
            renderNameABs: getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
            labelText: 'Oxygen Auto Buyer Tier 4:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(4) * getTimerRateRatio()))} Oxygen /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'oxygenAB4Quantity', 'autoBuyer', true, 'tier4', 'oxygen', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'oxygen',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier4',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'oxygenAB4Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('oxygen4Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer4Price + " " + getResourceDataObject('resources', ['oxygen', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'oxygen',
            autoBuyerTier: 'tier4',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(oxygenAutoBuyer4Row);
    }
    
    else if (heading === 'Sodium') {
        let storagePrice = getResourceDataObject('resources', ['sodium', 'storageCapacity']);
        let autobuyer1Price = getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier1', 'price']);
        let autobuyer2Price = getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier2', 'price']);
        let autobuyer3Price = getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier3', 'price']);
        let autobuyer4Price = getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier4', 'price']);

        const sodiumSellRow = createOptionRow({
            labelId: 'sodiumSellRow',
            renderNameABs: null,
            labelText: 'Sell Sodium:',
            inputElements: [
                createDropdown('sodiumSellSelectQuantity', [
                    { value: 'all', text: 'All Stock' },
                    { value: 'threeQuarters', text: '75% Stock' },
                    { value: 'twoThirds', text: '67% Stock' },
                    { value: 'half', text: '50% Stock' },
                    { value: 'oneThird', text: '33% Stock' },
                    { value: '100000', text: '100000' },
                    { value: '10000', text: '10000' },
                    { value: '1000', text: '1000' },
                    { value: '100', text: '100' },
                    { value: '10', text: '10' },
                    { value: '1', text: '1' },
                ], getLastSellResourceCompoundDropdownOption('resources', 'sodium'), (value) => {
                    setLastSellResourceCompoundDropdownOption('resources', 'sodium', value);
                }),
                createButton({
                    text: 'Sell',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'sell'],
                    onClick: () => {
                        sellResource('sodium');
                    },
                    dataConditionCheck: 'sellResource',
                    resourcePriceObject: null,
                    objectSectionArgument1: null,
                    objectSectionArgument2: null,
                    quantityArgument: 'sodium',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
                createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['sodium', 'autoSell']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${getResourceSalePreview('sodium')}`,
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(sodiumSellRow);
        const toggleSwitch = sodiumSellRow.querySelector('#autoSellToggle');
        if (toggleSwitch) {
            toggleSwitch.setAttribute('data-type', 'resources');
        }

        const sodiumGainRow = createOptionRow({
            labelId: 'sodiumGainRow',
            renderNameABs: null,
            labelText: 'Gain 1 Sodium:',
            inputElements: [
                createButton({
                    text: 'Gain',
                    classNames: ['option-button'],
                    onClick: () => {
                        gain(1, 'sodiumQuantity', null, false, null, 'sodium', 'resources');
                    },
                    dataConditionCheck: null,
                    resourcePriceObject: null,
                    objectSectionArgument1: null,
                    objectSectionArgument2: null,
                    quantityArgument: null,
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
            ],
            descriptionText: null,
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(sodiumGainRow);

        const sodiumIncreaseStorageRow = createOptionRow({
            labelId: 'sodiumIncreaseStorageRow',
            renderNameABs: null,
            labelText: 'Increase Storage:',
            inputElements: [
                createButton({
                    text: 'Increase Storage',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        increaseResourceStorage(['sodiumQuantity'], ['sodium'], ['resources']);
                        disableStorageNotificationActionIfShowing('sodium', 'Already Increased!');
                        storagePrice = getResourceDataObject('resources', ['sodium', 'storageCapacity']) - 1;
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'storage',
                    objectSectionArgument2: null,
                    quantityArgument: 'sodium',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
            ],
            descriptionText: `${storagePrice + " " + getResourceDataObject('resources', ['sodium', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'storage',
            objectSectionArgument2: null,
            quantityArgument: 'sodium',
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: 'sodium',
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(sodiumIncreaseStorageRow);

        const sodiumAutoBuyer1Row = createOptionRow({
            labelId: 'sodiumAutoBuyer1Row',
            renderNameABs: getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
            labelText: 'Sodium Auto Buyer Tier 1:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(1) * getTimerRateRatio()))} Sodium /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'sodiumAB1Quantity', 'autoBuyer', true, 'tier1', 'sodium', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'sodium',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier1',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'sodiumAB1Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('sodium1Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['sodium', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer1Price + " " + getResourceDataObject('resources', ['sodium', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'sodium',
            autoBuyerTier: 'tier1',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(sodiumAutoBuyer1Row);

        const sodiumAutoBuyer2Row = createOptionRow({
            labelId: 'sodiumAutoBuyer2Row',
            renderNameABs: getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
            labelText: 'Sodium Auto Buyer Tier 2:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(2) * getTimerRateRatio()))} Sodium /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'sodiumAB2Quantity', 'autoBuyer', true, 'tier2', 'sodium', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'sodium',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier2',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'sodiumAB2Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('sodium2Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['sodium', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer2Price + " " + getResourceDataObject('resources', ['sodium', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'sodium',
            autoBuyerTier: 'tier2',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(sodiumAutoBuyer2Row);

        const sodiumAutoBuyer3Row = createOptionRow({
            labelId: 'sodiumAutoBuyer3Row',
            renderNameABs: getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
            labelText: 'Sodium Auto Buyer Tier 3:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(3) * getTimerRateRatio()))} Sodium /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'sodiumAB3Quantity', 'autoBuyer', true, 'tier3', 'sodium', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'sodium',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier3',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'sodiumAB3Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('sodium3Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['sodium', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer3Price + " " + getResourceDataObject('resources', ['sodium', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'sodium',
            autoBuyerTier: 'tier3',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(sodiumAutoBuyer3Row);

        const sodiumAutoBuyer4Row = createOptionRow({
            labelId: 'sodiumAutoBuyer4Row',
            renderNameABs: getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
            labelText: 'Sodium Auto Buyer Tier 4:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(4) * getTimerRateRatio()))} Sodium /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'sodiumAB4Quantity', 'autoBuyer', true, 'tier4', 'sodium', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'sodium',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier4',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'sodiumAB4Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('sodium4Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['sodium', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer4Price + " " + getResourceDataObject('resources', ['sodium', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'sodium',
            autoBuyerTier: 'tier4',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(sodiumAutoBuyer4Row);
    } 
    
    else if (heading === 'Silicon') {
        let storagePrice = getResourceDataObject('resources', ['silicon', 'storageCapacity']);
        let autobuyer1Price = getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier1', 'price']);
        let autobuyer2Price = getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier2', 'price']);
        let autobuyer3Price = getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier3', 'price']);
        let autobuyer4Price = getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier4', 'price']);

        const siliconSellRow = createOptionRow({
            labelId: 'siliconSellRow',
            renderNameABs: null,
            labelText: 'Sell Silicon:',
            inputElements: [
                createDropdown('siliconSellSelectQuantity', [
                    { value: 'all', text: 'All Stock' },
                    { value: 'threeQuarters', text: '75% Stock' },
                    { value: 'twoThirds', text: '67% Stock' },
                    { value: 'half', text: '50% Stock' },
                    { value: 'oneThird', text: '33% Stock' },
                    { value: '100000', text: '100000' },
                    { value: '10000', text: '10000' },
                    { value: '1000', text: '1000' },
                    { value: '100', text: '100' },
                    { value: '10', text: '10' },
                    { value: '1', text: '1' },
                ], getLastSellResourceCompoundDropdownOption('resources', 'silicon'), (value) => {
                    setLastSellResourceCompoundDropdownOption('resources', 'silicon', value);
                }),
                createButton({
                    text: 'Sell',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'sell'],
                    onClick: () => {
                        sellResource('silicon');
                    },
                    dataConditionCheck: 'sellResource',
                    resourcePriceObject: null,
                    objectSectionArgument1: null,
                    objectSectionArgument2: null,
                    quantityArgument: 'silicon',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
                createButton({
                    text: 'Fuse',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'fuse'],
                    onClick: (event) => {
                        fuseResource("silicon", [
                            {
                                fuseTo: getResourceDataObject('resources', ['silicon', 'fuseTo1']),
                                ratio: getResourceDataObject('resources', ['silicon', 'fuseToRatio1']),
                                resourceRowToShow: document.querySelector('#metals .collapsible-content .row-side-menu:nth-child(2)'),
                                categoryToShow: document.getElementById('metals'),
                                mainCategoryToShow: document.getElementById('solids')
                            }
                        ]);
                        event.currentTarget.classList.remove('warning-orange-text', 'disabled-red-text');
                        event.currentTarget.parentElement.nextElementSibling.querySelector('label').classList.remove('warning-orange-text', 'disabled-red-text');
                    },
                    dataConditionCheck: 'fuseResource',
                    resourcePriceObject: null,
                    objectSectionArgument1: 'silicon',
                    objectSectionArgument2: 'iron',
                    quantityArgument: 'silicon',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
                createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['silicon', 'autoSell']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${getResourceSalePreview('silicon')}`,
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(siliconSellRow);
        const toggleSwitch = siliconSellRow.querySelector('#autoSellToggle');
        if (toggleSwitch) {
            toggleSwitch.setAttribute('data-type', 'resources');
        }

        const siliconGainRow = createOptionRow({
            labelId: 'siliconGainRow',
            renderNameABs: null,
            labelText: 'Gain 1 Silicon:',
            inputElements: [
                createButton({
                    text: 'Gain',
                    classNames: ['option-button'],
                    onClick: () => {
                        gain(1, 'siliconQuantity', null, false, null, 'silicon', 'resources');
                    },
                    dataConditionCheck: null,
                    resourcePriceObject: null,
                    objectSectionArgument1: null,
                    objectSectionArgument2: null,
                    quantityArgument: null,
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
            ],
            descriptionText: null,
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(siliconGainRow);

        const siliconIncreaseStorageRow = createOptionRow({
            labelId: 'siliconIncreaseStorageRow',
            renderNameABs: null,
            labelText: 'Increase Storage:',
            inputElements: [
                createButton({
                    text: 'Increase Storage',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        increaseResourceStorage(['siliconQuantity'], ['silicon'], ['resources']);
                        disableStorageNotificationActionIfShowing('silicon', 'Already Increased!');
                        storagePrice = getResourceDataObject('resources', ['silicon', 'storageCapacity']) - 1;
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'storage',
                    objectSectionArgument2: null,
                    quantityArgument: 'silicon',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
            ],
            descriptionText: `${storagePrice + " " + getResourceDataObject('resources', ['silicon', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'storage',
            objectSectionArgument2: null,
            quantityArgument: 'silicon',
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: 'silicon',
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(siliconIncreaseStorageRow);

        const siliconAutoBuyer1Row = createOptionRow({
            labelId: 'siliconAutoBuyer1Row',
            renderNameABs: getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
            labelText: 'Silicon Auto Buyer Tier 1:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(1) * getTimerRateRatio()))} Silicon /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'siliconAB1Quantity', 'autoBuyer', true, 'tier1', 'silicon', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'silicon',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier1',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'siliconAB1Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('silicon1Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['silicon', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer1Price + " " + getResourceDataObject('resources', ['silicon', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'silicon',
            autoBuyerTier: 'tier1',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(siliconAutoBuyer1Row);

        const siliconAutoBuyer2Row = createOptionRow({
            labelId: 'siliconAutoBuyer2Row',
            renderNameABs: getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
            labelText: 'Silicon Auto Buyer Tier 2:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(2) * getTimerRateRatio()))} Silicon /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'siliconAB2Quantity', 'autoBuyer', true, 'tier2', 'silicon', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'silicon',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier2',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'siliconAB2Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('silicon2Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['silicon', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer2Price + " " + getResourceDataObject('resources', ['silicon', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'silicon',
            autoBuyerTier: 'tier2',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(siliconAutoBuyer2Row);

        const siliconAutoBuyer3Row = createOptionRow({
            labelId: 'siliconAutoBuyer3Row',
            renderNameABs: getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
            labelText: 'Silicon Auto Buyer Tier 3:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(3) * getTimerRateRatio()))} Silicon /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'siliconAB3Quantity', 'autoBuyer', true, 'tier3', 'silicon', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'silicon',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier3',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'siliconAB3Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('silicon3Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['silicon', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer3Price + " " + getResourceDataObject('resources', ['silicon', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'silicon',
            autoBuyerTier: 'tier3',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(siliconAutoBuyer3Row);

        const siliconAutoBuyer4Row = createOptionRow({
            labelId: 'siliconAutoBuyer4Row',
            renderNameABs: getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
            labelText: 'Silicon Auto Buyer Tier 4:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(4) * getTimerRateRatio()))} Silicon /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'siliconAB4Quantity', 'autoBuyer', true, 'tier4', 'silicon', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'silicon',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier4',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'siliconAB4Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('silicon4Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['silicon', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer4Price + " " + getResourceDataObject('resources', ['silicon', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'silicon',
            autoBuyerTier: 'tier4',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(siliconAutoBuyer4Row);
    }

    else if (heading === 'Iron') {
        let storagePrice = getResourceDataObject('resources', ['iron', 'storageCapacity']);
        let autobuyer1Price = getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'price']);
        let autobuyer2Price = getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier2', 'price']);
        let autobuyer3Price = getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier3', 'price']);
        let autobuyer4Price = getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier4', 'price']);

        const ironSellRow = createOptionRow({
            labelId: 'ironSellRow',
            renderNameABs: null,
            labelText: 'Sell Iron:',
            inputElements: [
                createDropdown('ironSellSelectQuantity', [
                    { value: 'all', text: 'All Stock' },
                    { value: 'threeQuarters', text: '75% Stock' },
                    { value: 'twoThirds', text: '67% Stock' },
                    { value: 'half', text: '50% Stock' },
                    { value: 'oneThird', text: '33% Stock' },
                    { value: '100000', text: '100000' },
                    { value: '10000', text: '10000' },
                    { value: '1000', text: '1000' },
                    { value: '100', text: '100' },
                    { value: '10', text: '10' },
                    { value: '1', text: '1' },
                ], getLastSellResourceCompoundDropdownOption('resources', 'iron'), (value) => {
                    setLastSellResourceCompoundDropdownOption('resources', 'iron', value);
                }),
                createButton({
                    text: 'Sell',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'sell'],
                    onClick: () => {
                        sellResource('iron');
                    },
                    dataConditionCheck: 'sellResource',
                    resourcePriceObject: null,
                    objectSectionArgument1: null,
                    objectSectionArgument2: null,
                    quantityArgument: 'iron',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
                createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['iron', 'autoSell']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${getResourceSalePreview('iron')}`,
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(ironSellRow);
        const toggleSwitch = ironSellRow.querySelector('#autoSellToggle');
        if (toggleSwitch) {
            toggleSwitch.setAttribute('data-type', 'resources');
        }

        const ironGainRow = createOptionRow({
            labelId: 'ironGainRow',
            renderNameABs: null,
            labelText: 'Gain 1 Iron:',
            inputElements: [
                createButton({
                    text: 'Gain',
                    classNames: ['option-button'],
                    onClick: () => {
                        gain(1, 'ironQuantity', null, false, null, 'iron', 'resources');
                    },
                    dataConditionCheck: null,
                    resourcePriceObject: null,
                    objectSectionArgument1: null,
                    objectSectionArgument2: null,
                    quantityArgument: null,
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
            ],
            descriptionText: null,
            resourcePriceObject: null,
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(ironGainRow);

        const ironIncreaseStorageRow = createOptionRow({
            labelId: 'ironIncreaseStorageRow',
            renderNameABs: null,
            labelText: 'Increase Storage:',
            inputElements: [
                createButton({
                    text: 'Increase Storage',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        increaseResourceStorage(['ironQuantity'], ['iron'], ['resources']);
                        disableStorageNotificationActionIfShowing('iron', 'Already Increased!');
                        storagePrice = getResourceDataObject('resources', ['iron', 'storageCapacity']) - 1;
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'storage',
                    objectSectionArgument2: null,
                    quantityArgument: 'iron',
                    disableKeyboardForButton: true,
                    autoBuyerTier: null,
                    rowCategory: 'resource'
                }),
            ],
            descriptionText: `${storagePrice + " " + getResourceDataObject('resources', ['iron', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'storage',
            objectSectionArgument2: null,
            quantityArgument: 'iron',
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: 'iron',
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(ironIncreaseStorageRow);

        const ironAutoBuyer1Row = createOptionRow({
            labelId: 'ironAutoBuyer1Row',
            renderNameABs: getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
            labelText: 'Iron Auto Buyer Tier 1:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(1) * getTimerRateRatio()))} Iron /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'ironAB1Quantity', 'autoBuyer', true, 'tier1', 'iron', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'iron',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier1',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'ironAB1Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('iron1Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer1Price + " " + getResourceDataObject('resources', ['iron', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'iron',
            autoBuyerTier: 'tier1',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(ironAutoBuyer1Row);

        const ironAutoBuyer2Row = createOptionRow({
            labelId: 'ironAutoBuyer2Row',
            renderNameABs: getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
            labelText: 'Iron Auto Buyer Tier 2:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(2) * getTimerRateRatio()))} Iron /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'ironAB2Quantity', 'autoBuyer', true, 'tier2', 'iron', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'iron',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier2',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'ironAB2Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('iron2Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer2Price + " " + getResourceDataObject('resources', ['iron', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'iron',
            autoBuyerTier: 'tier2',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(ironAutoBuyer2Row);

        const ironAutoBuyer3Row = createOptionRow({
            labelId: 'ironAutoBuyer3Row',
            renderNameABs: getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
            labelText: 'Iron Auto Buyer Tier 3:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(3) * getTimerRateRatio()))} Iron /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'ironAB3Quantity', 'autoBuyer', true, 'tier3', 'iron', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'iron',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier3',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'ironAB3Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('iron3Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer3Price + " " + getResourceDataObject('resources', ['iron', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'iron',
            autoBuyerTier: 'tier3',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(ironAutoBuyer3Row);

        const ironAutoBuyer4Row = createOptionRow({
            labelId: 'ironAutoBuyer4Row',
            renderNameABs: getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
            labelText: 'Iron Auto Buyer Tier 4:',
            inputElements: [
                createButton({
                    text: `Add ${Math.floor((getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(4) * getTimerRateRatio()))} Iron /s`,
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'ironAB4Quantity', 'autoBuyer', true, 'tier4', 'iron', 'resources')
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'autoBuyer',
                    objectSectionArgument2: null,
                    quantityArgument: 'iron',
                    disableKeyboardForButton: true,
                    autoBuyerTier: 'tier4',
                    rowCategory: 'resource'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'ironAB4Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('iron4Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer4Price + " " + getResourceDataObject('resources', ['iron', 'nameResource'])}`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'autoBuyer',
            objectSectionArgument2: null,
            quantityArgument: 'iron',
            autoBuyerTier: 'tier4',
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'resource'
        });
        optionContentElement.appendChild(ironAutoBuyer4Row);
    }
}
