import { getLastSellResourceCompoundDropdownOption, setLastSellResourceCompoundDropdownOption, getResourceSalePreview, getTimerRateRatio, getLanguage } from './constantsAndGlobalVars.js';
import { sellResource, fuseResource, gain, increaseResourceStorage, getBTypeAutoBuyerBoostForTier } from './game.js';
import { getResourceDataObject, setResourceDataObject } from './resourceDataObject.js';
import { removeTabAttentionIfNoIndicators, createTextElement, createToggleSwitch, createOptionRow, createDropdown, createButton, disableStorageNotificationActionIfShowing } from './ui.js';
import { localize } from './localization.js';

const TAB1_HEADING_RESOURCES = ['hydrogen', 'helium', 'carbon', 'neon', 'oxygen', 'sodium', 'silicon', 'iron'];

function drawResourceGainHeaderButton(heading) {
    const headerActionsElement = document.getElementById('headerActionsTab1');
    if (!headerActionsElement) {
        return;
    }

    headerActionsElement.innerHTML = '';

    const resource = String(heading).toLowerCase();
    if (!TAB1_HEADING_RESOURCES.includes(resource)) {
        return;
    }

    headerActionsElement.appendChild(createButton({
        text: localize('buttonGainOne', getLanguage()),
        classNames: [`id_${resource}GainButton`, 'option-button', 'pane-header-button'],
        onClick: () => {
            gain(1, `${resource}Quantity`, null, false, null, resource, 'resources');
        },
        dataConditionCheck: null,
        resourcePriceObject: null,
        objectSectionArgument1: null,
        objectSectionArgument2: null,
        quantityArgument: null,
        disableKeyboardForButton: true,
        autoBuyerTier: null,
        rowCategory: 'resource'
    }));
}

export function drawTab1Content(heading, optionContentElement) {
    removeTabAttentionIfNoIndicators('tab1');

    drawResourceGainHeaderButton(heading);

    if (heading === 'Hydrogen') {
        let storagePrice = getResourceDataObject('resources', ['hydrogen', 'storageCapacity']);
        let autobuyer1Price = getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'price']);
        let autobuyer2Price = getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier2', 'price']);
        let autobuyer3Price = getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier3', 'price']);
        let autobuyer4Price = getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier4', 'price']);

        const hydrogenSellRow = createOptionRow({
            labelId: 'hydrogenSellRow',
            renderNameABs: null,
            labelText: localize('tab1HydrogenSellRowLabel', getLanguage()),
            inputElements: [
                createDropdown('hydrogenSellSelectQuantity', [
                    { value: 'all', text: localize('dropdownOptionAllStock', getLanguage()) },
                    { value: 'threeQuarters', text: localize('dropdownOption75Stock', getLanguage()) },
                    { value: 'twoThirds', text: localize('dropdownOption67Stock', getLanguage()) },
                    { value: 'half', text: localize('dropdownOption50Stock', getLanguage()) },
                    { value: 'oneThird', text: localize('dropdownOption33Stock', getLanguage()) },
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
                    text: localize('buttonSell', getLanguage()),
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
                    text: localize('buttonFuse', getLanguage()),
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

        const hydrogenIncreaseStorageRow = createOptionRow({
            labelId: 'hydrogenIncreaseStorageRow',
            renderNameABs: null,
            labelText: localize('tab1IncreaseStorageRowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: localize('buttonIncreaseStorage', getLanguage()),
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        increaseResourceStorage(['hydrogenQuantity'], ['hydrogen'], ['resources']);
                        disableStorageNotificationActionIfShowing('hydrogen');
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
            descriptionText: `${storagePrice + " " + localize('resourceHydrogen', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1HydrogenAutoBuyer1RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(1) * getTimerRateRatio()))).replace('{resource}', localize('resourceHydrogen', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'hydrogenAB1Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('hydrogen1Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer1Price + " " + localize('resourceHydrogen', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1HydrogenAutoBuyer2RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(2) * getTimerRateRatio()))).replace('{resource}', localize('resourceHydrogen', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'hydrogenAB2Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('hydrogen2Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer2Price + " " + localize('resourceHydrogen', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1HydrogenAutoBuyer3RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(3) * getTimerRateRatio()))).replace('{resource}', localize('resourceHydrogen', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'hydrogenAB3Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('hydrogen3Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer3Price + " " + localize('resourceHydrogen', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1HydrogenAutoBuyer4RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(4) * getTimerRateRatio()))).replace('{resource}', localize('resourceHydrogen', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'hydrogenAB4Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('hydrogen4Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer4Price + " " + localize('resourceHydrogen', getLanguage())}`,
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
            labelText: localize('tab1HeliumSellRowLabel', getLanguage()),
            inputElements: [
                createDropdown('heliumSellSelectQuantity', [
                    { value: 'all', text: localize('dropdownOptionAllStock', getLanguage()) },
                    { value: 'threeQuarters', text: localize('dropdownOption75Stock', getLanguage()) },
                    { value: 'twoThirds', text: localize('dropdownOption67Stock', getLanguage()) },
                    { value: 'half', text: localize('dropdownOption50Stock', getLanguage()) },
                    { value: 'oneThird', text: localize('dropdownOption33Stock', getLanguage()) },
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
                    text: localize('buttonSell', getLanguage()),
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
                    text: localize('buttonFuse', getLanguage()),
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

        const heliumIncreaseStorageRow = createOptionRow({
            labelId: 'heliumIncreaseStorageRow',
            renderNameABs: null,
            labelText: localize('tab1IncreaseStorageRowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: localize('buttonIncreaseStorage', getLanguage()),
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        increaseResourceStorage(['heliumQuantity'], ['helium'], ['resources']);
                        disableStorageNotificationActionIfShowing('helium');
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
            descriptionText: `${storagePrice + " " + localize('resourceHelium', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1HeliumAutoBuyer1RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(1) * getTimerRateRatio()))).replace('{resource}', localize('resourceHelium', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'heliumAB1Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('helium1Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['helium', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer1Price + " " + localize('resourceHelium', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1HeliumAutoBuyer2RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(2) * getTimerRateRatio()))).replace('{resource}', localize('resourceHelium', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'heliumAB2Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('helium2Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['helium', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer2Price + " " + localize('resourceHelium', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1HeliumAutoBuyer3RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(3) * getTimerRateRatio()))).replace('{resource}', localize('resourceHelium', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'heliumAB3Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('helium3Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['helium', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer3Price + " " + localize('resourceHelium', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1HeliumAutoBuyer4RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(4) * getTimerRateRatio()))).replace('{resource}', localize('resourceHelium', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'heliumAB4Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('helium4Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['helium', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer4Price + " " + localize('resourceHelium', getLanguage())}`,
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
            labelText: localize('tab1CarbonSellRowLabel', getLanguage()),
            inputElements: [
                createDropdown('carbonSellSelectQuantity', [
                    { value: 'all', text: localize('dropdownOptionAllStock', getLanguage()) },
                    { value: 'threeQuarters', text: localize('dropdownOption75Stock', getLanguage()) },
                    { value: 'twoThirds', text: localize('dropdownOption67Stock', getLanguage()) },
                    { value: 'half', text: localize('dropdownOption50Stock', getLanguage()) },
                    { value: 'oneThird', text: localize('dropdownOption33Stock', getLanguage()) },
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
                    text: localize('buttonSell', getLanguage()),
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
                    text: localize('buttonFuse', getLanguage()),
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

        const carbonIncreaseStorageRow = createOptionRow({
            labelId: 'carbonIncreaseStorageRow',
            renderNameABs: null,
            labelText: localize('tab1IncreaseStorageRowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: localize('buttonIncreaseStorage', getLanguage()),
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        increaseResourceStorage(['carbonQuantity'], ['carbon'], ['resources']);
                        disableStorageNotificationActionIfShowing('carbon');
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
            descriptionText: `${storagePrice + " " + localize('resourceCarbon', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1CarbonAutoBuyer1RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(1) * getTimerRateRatio()))).replace('{resource}', localize('resourceCarbon', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'carbonAB1Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('carbon1Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['carbon', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer1Price + " " + localize('resourceCarbon', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1CarbonAutoBuyer2RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(2) * getTimerRateRatio()))).replace('{resource}', localize('resourceCarbon', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'carbonAB2Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('carbon2Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['carbon', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer2Price + " " + localize('resourceCarbon', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1CarbonAutoBuyer3RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(3) * getTimerRateRatio()))).replace('{resource}', localize('resourceCarbon', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'carbonAB3Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('carbon3Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['carbon', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer3Price + " " + localize('resourceCarbon', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1CarbonAutoBuyer4RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(4) * getTimerRateRatio()))).replace('{resource}', localize('resourceCarbon', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'carbonAB4Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('carbon4Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['carbon', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer4Price + " " + localize('resourceCarbon', getLanguage())}`,
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
            labelText: localize('tab1NeonSellRowLabel', getLanguage()),
            inputElements: [
                createDropdown('neonSellSelectQuantity', [
                    { value: 'all', text: localize('dropdownOptionAllStock', getLanguage()) },
                    { value: 'threeQuarters', text: localize('dropdownOption75Stock', getLanguage()) },
                    { value: 'twoThirds', text: localize('dropdownOption67Stock', getLanguage()) },
                    { value: 'half', text: localize('dropdownOption50Stock', getLanguage()) },
                    { value: 'oneThird', text: localize('dropdownOption33Stock', getLanguage()) },
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
                    text: localize('buttonSell', getLanguage()),
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
                    text: localize('buttonFuse', getLanguage()),
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

        const neonIncreaseStorageRow = createOptionRow({
            labelId: 'neonIncreaseStorageRow',
            renderNameABs: null,
            labelText: localize('tab1IncreaseStorageRowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: localize('buttonIncreaseStorage', getLanguage()),
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        increaseResourceStorage(['neonQuantity'], ['neon'], ['resources']);
                        disableStorageNotificationActionIfShowing('neon');
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
            descriptionText: `${storagePrice + " " + localize('resourceNeon', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1NeonAutoBuyer1RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(1) * getTimerRateRatio()))).replace('{resource}', localize('resourceNeon', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'neonAB1Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('neon1Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['neon', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer1Price + " " + localize('resourceNeon', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1NeonAutoBuyer2RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(2) * getTimerRateRatio()))).replace('{resource}', localize('resourceNeon', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'neonAB2Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('neon2Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['neon', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer2Price + " " + localize('resourceNeon', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1NeonAutoBuyer3RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(3) * getTimerRateRatio()))).replace('{resource}', localize('resourceNeon', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'neonAB3Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('neon3Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['neon', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer3Price + " " + localize('resourceNeon', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1NeonAutoBuyer4RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(4) * getTimerRateRatio()))).replace('{resource}', localize('resourceNeon', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'neonAB4Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('neon4Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['neon', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer4Price + " " + localize('resourceNeon', getLanguage())}`,
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
            labelText: localize('tab1OxygenSellRowLabel', getLanguage()),
            inputElements: [
                createDropdown('oxygenSellSelectQuantity', [
                    { value: 'all', text: localize('dropdownOptionAllStock', getLanguage()) },
                    { value: 'threeQuarters', text: localize('dropdownOption75Stock', getLanguage()) },
                    { value: 'twoThirds', text: localize('dropdownOption67Stock', getLanguage()) },
                    { value: 'half', text: localize('dropdownOption50Stock', getLanguage()) },
                    { value: 'oneThird', text: localize('dropdownOption33Stock', getLanguage()) },
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
                    text: localize('buttonSell', getLanguage()),
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
                    text: localize('buttonFuse', getLanguage()),
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

        const oxygenIncreaseStorageRow = createOptionRow({
            labelId: 'oxygenIncreaseStorageRow',
            renderNameABs: null,
            labelText: localize('tab1IncreaseStorageRowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: localize('buttonIncreaseStorage', getLanguage()),
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        increaseResourceStorage(['oxygenQuantity'], ['oxygen'], ['resources']);
                        disableStorageNotificationActionIfShowing('oxygen');
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
            descriptionText: `${storagePrice + " " + localize('resourceOxygen', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1OxygenAutoBuyer1RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(1) * getTimerRateRatio()))).replace('{resource}', localize('resourceOxygen', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'oxygenAB1Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('oxygen1Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer1Price + " " + localize('resourceOxygen', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1OxygenAutoBuyer2RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(2) * getTimerRateRatio()))).replace('{resource}', localize('resourceOxygen', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'oxygenAB2Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('oxygen2Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer2Price + " " + localize('resourceOxygen', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1OxygenAutoBuyer3RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(3) * getTimerRateRatio()))).replace('{resource}', localize('resourceOxygen', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'oxygenAB3Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('oxygen3Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer3Price + " " + localize('resourceOxygen', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1OxygenAutoBuyer4RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(4) * getTimerRateRatio()))).replace('{resource}', localize('resourceOxygen', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'oxygenAB4Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('oxygen4Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer4Price + " " + localize('resourceOxygen', getLanguage())}`,
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
            labelText: localize('tab1SodiumSellRowLabel', getLanguage()),
            inputElements: [
                createDropdown('sodiumSellSelectQuantity', [
                    { value: 'all', text: localize('dropdownOptionAllStock', getLanguage()) },
                    { value: 'threeQuarters', text: localize('dropdownOption75Stock', getLanguage()) },
                    { value: 'twoThirds', text: localize('dropdownOption67Stock', getLanguage()) },
                    { value: 'half', text: localize('dropdownOption50Stock', getLanguage()) },
                    { value: 'oneThird', text: localize('dropdownOption33Stock', getLanguage()) },
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
                    text: localize('buttonSell', getLanguage()),
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

        const sodiumIncreaseStorageRow = createOptionRow({
            labelId: 'sodiumIncreaseStorageRow',
            renderNameABs: null,
            labelText: localize('tab1IncreaseStorageRowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: localize('buttonIncreaseStorage', getLanguage()),
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        increaseResourceStorage(['sodiumQuantity'], ['sodium'], ['resources']);
                        disableStorageNotificationActionIfShowing('sodium');
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
            descriptionText: `${storagePrice + " " + localize('resourceSodium', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1SodiumAutoBuyer1RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(1) * getTimerRateRatio()))).replace('{resource}', localize('resourceSodium', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'sodiumAB1Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('sodium1Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['sodium', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer1Price + " " + localize('resourceSodium', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1SodiumAutoBuyer2RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(2) * getTimerRateRatio()))).replace('{resource}', localize('resourceSodium', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'sodiumAB2Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('sodium2Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['sodium', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer2Price + " " + localize('resourceSodium', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1SodiumAutoBuyer3RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(3) * getTimerRateRatio()))).replace('{resource}', localize('resourceSodium', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'sodiumAB3Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('sodium3Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['sodium', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer3Price + " " + localize('resourceSodium', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1SodiumAutoBuyer4RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(4) * getTimerRateRatio()))).replace('{resource}', localize('resourceSodium', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'sodiumAB4Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('sodium4Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['sodium', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer4Price + " " + localize('resourceSodium', getLanguage())}`,
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
            labelText: localize('tab1SiliconSellRowLabel', getLanguage()),
            inputElements: [
                createDropdown('siliconSellSelectQuantity', [
                    { value: 'all', text: localize('dropdownOptionAllStock', getLanguage()) },
                    { value: 'threeQuarters', text: localize('dropdownOption75Stock', getLanguage()) },
                    { value: 'twoThirds', text: localize('dropdownOption67Stock', getLanguage()) },
                    { value: 'half', text: localize('dropdownOption50Stock', getLanguage()) },
                    { value: 'oneThird', text: localize('dropdownOption33Stock', getLanguage()) },
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
                    text: localize('buttonSell', getLanguage()),
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
                    text: localize('buttonFuse', getLanguage()),
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

        const siliconIncreaseStorageRow = createOptionRow({
            labelId: 'siliconIncreaseStorageRow',
            renderNameABs: null,
            labelText: localize('tab1IncreaseStorageRowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: localize('buttonIncreaseStorage', getLanguage()),
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        increaseResourceStorage(['siliconQuantity'], ['silicon'], ['resources']);
                        disableStorageNotificationActionIfShowing('silicon');
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
            descriptionText: `${storagePrice + " " + localize('resourceSilicon', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1SiliconAutoBuyer1RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(1) * getTimerRateRatio()))).replace('{resource}', localize('resourceSilicon', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'siliconAB1Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('silicon1Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['silicon', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer1Price + " " + localize('resourceSilicon', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1SiliconAutoBuyer2RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(2) * getTimerRateRatio()))).replace('{resource}', localize('resourceSilicon', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'siliconAB2Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('silicon2Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['silicon', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer2Price + " " + localize('resourceSilicon', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1SiliconAutoBuyer3RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(3) * getTimerRateRatio()))).replace('{resource}', localize('resourceSilicon', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'siliconAB3Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('silicon3Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['silicon', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer3Price + " " + localize('resourceSilicon', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1SiliconAutoBuyer4RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(4) * getTimerRateRatio()))).replace('{resource}', localize('resourceSilicon', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'siliconAB4Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('silicon4Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['silicon', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer4Price + " " + localize('resourceSilicon', getLanguage())}`,
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
            labelText: localize('tab1IronSellRowLabel', getLanguage()),
            inputElements: [
                createDropdown('ironSellSelectQuantity', [
                    { value: 'all', text: localize('dropdownOptionAllStock', getLanguage()) },
                    { value: 'threeQuarters', text: localize('dropdownOption75Stock', getLanguage()) },
                    { value: 'twoThirds', text: localize('dropdownOption67Stock', getLanguage()) },
                    { value: 'half', text: localize('dropdownOption50Stock', getLanguage()) },
                    { value: 'oneThird', text: localize('dropdownOption33Stock', getLanguage()) },
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
                    text: localize('buttonSell', getLanguage()),
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

        const ironIncreaseStorageRow = createOptionRow({
            labelId: 'ironIncreaseStorageRow',
            renderNameABs: null,
            labelText: localize('tab1IncreaseStorageRowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: localize('buttonIncreaseStorage', getLanguage()),
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check'],
                    onClick: () => {
                        increaseResourceStorage(['ironQuantity'], ['iron'], ['resources']);
                        disableStorageNotificationActionIfShowing('iron');
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
            descriptionText: `${storagePrice + " " + localize('resourceIron', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1IronAutoBuyer1RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(1) * getTimerRateRatio()))).replace('{resource}', localize('resourceIron', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'ironAB1Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('iron1Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer1Price + " " + localize('resourceIron', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1IronAutoBuyer2RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(2) * getTimerRateRatio()))).replace('{resource}', localize('resourceIron', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'ironAB2Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('iron2Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer2Price + " " + localize('resourceIron', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1IronAutoBuyer3RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(3) * getTimerRateRatio()))).replace('{resource}', localize('resourceIron', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'ironAB3Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('iron3Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer3Price + " " + localize('resourceIron', getLanguage())}`,
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
            renderNameABs: localize(getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']), getLanguage()),
            labelText: localize('tab1IronAutoBuyer4RowLabel', getLanguage()),
            inputElements: [
                createButton({
                    text: `${localize('buttonAddPerSecond', getLanguage()).replace('{rate}', Math.floor((getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio()) + (getBTypeAutoBuyerBoostForTier(4) * getTimerRateRatio()))).replace('{resource}', localize('resourceIron', getLanguage()))}`,
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
                createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'ironAB4Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('iron4Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                }, ['toggle-switch-spacing']),
            ],
            descriptionText: `${autobuyer4Price + " " + localize('resourceIron', getLanguage())}`,
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
