import { getCompoundCreateDropdownRecipeText, getLastSellResourceCompoundDropdownOption, setLastSellResourceCompoundDropdownOption, getImageUrls, getTimerRateRatio, getCompoundSalePreview, getCompoundCreatePreview, setCreateCompoundPreview, setAchievementFlagArray, getCurrencySymbol } from './constantsAndGlobalVars.js';

import { increaseResourceStorage, createCompound, sellCompound, gain, addToResourceAllTimeStat } from './game.js';

import { setResourceDataObject, getResourceDataObject } from './resourceDataObject.js';
import { removeTabAttentionIfNoIndicators, createTextElement, createToggleSwitch, createOptionRow, createDropdown, createButton, disableStorageNotificationActionIfShowing } from './ui.js';

export function drawTab4Content(heading, optionContentElement) {
    const handleCompoundCreate = (compound) => {
        const beforeQuantity = getResourceDataObject('compounds', [compound, 'quantity']) || 0;
        createCompound(compound);
        const afterQuantity = getResourceDataObject('compounds', [compound, 'quantity']) || 0;
        const createdAmount = afterQuantity - beforeQuantity;

        if (createdAmount > 0) {
            addToResourceAllTimeStat(createdAmount, compound);
        }
    };

    const optionElement = document.getElementById(heading.toLowerCase().replace(/\s(.)/g, (match, group1) => group1.toUpperCase()).replace(/\s+/g, '') + 'Option');
        if (optionElement) {
            const warningIcon = optionElement.querySelector('span.attention-indicator');
            if (warningIcon && warningIcon.innerHTML.includes('⚠️')) {
                warningIcon.remove();
            }
        }
        removeTabAttentionIfNoIndicators('tab4');

        if (heading === 'Diesel') {
            const dieselTier1BaseCashCost = getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier1', 'price']);
            const dieselTier1CashCostDisplay = `${getCurrencySymbol()}${dieselTier1BaseCashCost.toLocaleString()} Cash`;
            let storagePrice = getResourceDataObject('compounds', ['diesel', 'storageCapacity']);
            let autobuyer1Price = getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier1', 'price']);

            let autobuyer2Price = getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier2', 'price']);
            let autobuyer3Price = getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier3', 'price']);
            let autobuyer4Price = getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier4', 'price']);
    
            const dieselCreateRow = createOptionRow({
                labelId: 'dieselCreateRow',
                renderNameABs: null,
                labelText: 'Create Diesel:',
                inputElements: [
                    createDropdown('dieselCreateSelectQuantity', [
                        { value: 'fillToCapacity', text: getCompoundCreateDropdownRecipeText('diesel').fillToCapacity?.text || 'Fill To Capacity' },
                        { value: 'max', text: getCompoundCreateDropdownRecipeText('diesel').max.text },
                        { value: 'threeQuarters', text: getCompoundCreateDropdownRecipeText('diesel').threeQuarters.text },
                        { value: 'twoThirds', text: getCompoundCreateDropdownRecipeText('diesel').twoThirds.text },
                        { value: 'half', text: getCompoundCreateDropdownRecipeText('diesel').half.text },
                        { value: 'oneThird', text: getCompoundCreateDropdownRecipeText('diesel').oneThird.text },
                        { value: '50000', text: getCompoundCreateDropdownRecipeText('diesel')[50000].text },
                        { value: '5000', text: getCompoundCreateDropdownRecipeText('diesel')[5000].text },
                        { value: '500', text: getCompoundCreateDropdownRecipeText('diesel')[500].text },
                        { value: '50', text: getCompoundCreateDropdownRecipeText('diesel')[50].text },
                        { value: '5', text: getCompoundCreateDropdownRecipeText('diesel')[5].text },
                        { value: '1', text: getCompoundCreateDropdownRecipeText('diesel')[1].text },
                    ], 'fillToCapacity', (value) => {
                        setCreateCompoundPreview('diesel', value);
                    }),
                    createButton({
                        text: 'Create',
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'create'],
                        onClick: () => {
                            handleCompoundCreate('diesel');
                        },
                        dataConditionCheck: 'createCompound',
                        quantityArgument: 'diesel',
                        disableKeyboardForButton: true,
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                    createToggleSwitch('autoCreateToggle', false, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['diesel', 'autoCreate']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${getCompoundCreatePreview('diesel')}`,
                resourcePriceObject: null,
                dataConditionCheck: null,
                objectSectionArgument1: null,
                objectSectionArgument2: null,
                quantityArgument: null,
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(dieselCreateRow);
    
            const dieselSellRow = createOptionRow({
                labelId: 'dieselSellRow',
                renderNameABs: null,
                labelText: 'Sell Diesel:',
                inputElements: [
                    createDropdown('dieselSellSelectQuantity', [
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
                    ], getLastSellResourceCompoundDropdownOption('compounds', 'diesel'), (value) => {
                        setLastSellResourceCompoundDropdownOption('compounds', 'diesel', value);
                    }),
                    createButton({
                        text: 'Sell',
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'sell'],
                        onClick: () => {
                            sellCompound('diesel');
                        },
                        dataConditionCheck: 'sellCompound',
                        quantityArgument: 'diesel',
                        disableKeyboardForButton: true,
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                    createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['diesel', 'autoSell']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${getCompoundSalePreview('diesel')}`,
                resourcePriceObject: null,
                dataConditionCheck: null,
                objectSectionArgument1: null,
                objectSectionArgument2: null,
                quantityArgument: null,
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(dieselSellRow);
            const toggleSwitch = dieselSellRow.querySelector('#autoSellToggle');
            if (toggleSwitch) {
                toggleSwitch.setAttribute('data-type', 'compounds');
            }
    
            const dieselIncreaseStorageRow = createOptionRow({
                labelId: 'dieselIncreaseStorageRow',
                renderNameABs: null,
                labelText: 'Increase Storage:',
                inputElements: [
                    createButton({
                        text: 'Increase Storage',
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            increaseResourceStorage(['dieselQuantity'], ['diesel'], ['compounds']);
                            disableStorageNotificationActionIfShowing('diesel', 'Already Increased!');
                            storagePrice = getResourceDataObject('compounds', ['diesel', 'storageCapacity']) - 1;
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'storage',
                        quantityArgument: 'diesel',
                        disableKeyboardForButton: true,
                        rowCategory: 'compound'
                    })
                ],
                descriptionText: `${storagePrice + " " + getResourceDataObject('compounds', ['diesel', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'storage',
                objectSectionArgument2: null,
                quantityArgument: 'diesel',
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: 'diesel',
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(dieselIncreaseStorageRow);
    
            const dieselAutoBuyer1Row = createOptionRow({
                labelId: 'dieselAutoBuyer1Row',
                renderNameABs: getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
                labelText: 'Diesel Auto Buyer Tier 1:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio())} Diesel /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'dieselAB1Quantity', 'autoBuyer', true, 'tier1', 'diesel', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'diesel',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier1',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'dieselAB1Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('diesel1Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${dieselTier1CashCostDisplay}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'diesel',
                autoBuyerTier: 'tier1',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(dieselAutoBuyer1Row);
            const dieselTier1Button = dieselAutoBuyer1Row.querySelector('button[data-auto-buyer-tier="tier1"]');
            const dieselTier1Description = dieselAutoBuyer1Row.querySelector('.description-container .notation');
            [dieselTier1Button, dieselTier1Description].forEach(element => {
                if (element) {
                    element.dataset.cashOverride = 'true';
                    element.dataset.cashOverrideAmount = dieselTier1BaseCashCost;
                    element.dataset.cashOverrideResource = 'cash';
                }
            });
    
            const dieselAutoBuyer2Row = createOptionRow({
                labelId: 'dieselAutoBuyer2Row',
                renderNameABs: getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
                labelText: 'Diesel Auto Buyer Tier 2:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio())} Diesel /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'dieselAB2Quantity', 'autoBuyer', true, 'tier2', 'diesel', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'diesel',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier2',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'dieselAB2Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('diesel2Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${autobuyer2Price + " " + getResourceDataObject('compounds', ['diesel', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'diesel',
                autoBuyerTier: 'tier2',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(dieselAutoBuyer2Row);
    
            const dieselAutoBuyer3Row = createOptionRow({
                labelId: 'dieselAutoBuyer3Row',
                renderNameABs: getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
                labelText: 'Diesel Auto Buyer Tier 3:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio())} Diesel /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'dieselAB3Quantity', 'autoBuyer', true, 'tier3', 'diesel', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'diesel',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier3',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'dieselAB3Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('diesel3Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${autobuyer3Price + " " + getResourceDataObject('compounds', ['diesel', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'diesel',
                autoBuyerTier: 'tier3',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(dieselAutoBuyer3Row);
    
            const dieselAutoBuyer4Row = createOptionRow({
                labelId: 'dieselAutoBuyer4Row',
                renderNameABs: getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
                labelText: 'Diesel Auto Buyer Tier 4:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio())} Diesel /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'dieselAB4Quantity', 'autoBuyer', true, 'tier4', 'diesel', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'diesel',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier4',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'dieselAB4Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('diesel4Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${autobuyer4Price + " " + getResourceDataObject('compounds', ['diesel', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'diesel',
                autoBuyerTier: 'tier4',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(dieselAutoBuyer4Row);
        }

        if (heading === 'Glass') {
            let storagePrice = getResourceDataObject('compounds', ['glass', 'storageCapacity']);
            let autobuyer1Price = getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier1', 'price']);
            let autobuyer2Price = getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier2', 'price']);
            let autobuyer3Price = getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier3', 'price']);
            let autobuyer4Price = getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier4', 'price']);
    
            const glassCreateRow = createOptionRow({
                labelId: 'glassCreateRow',
                renderNameABs: null,
                labelText: 'Create Glass:',
                inputElements: [
                    createDropdown('glassCreateSelectQuantity', [
                        { value: 'fillToCapacity', text: getCompoundCreateDropdownRecipeText('glass').fillToCapacity?.text || 'Fill To Capacity' },
                        { value: 'max', text: getCompoundCreateDropdownRecipeText('glass').max.text },
                        { value: 'threeQuarters', text: getCompoundCreateDropdownRecipeText('glass').threeQuarters.text },
                        { value: 'twoThirds', text: getCompoundCreateDropdownRecipeText('glass').twoThirds.text },
                        { value: 'half', text: getCompoundCreateDropdownRecipeText('glass').half.text },
                        { value: 'oneThird', text: getCompoundCreateDropdownRecipeText('glass').oneThird.text },
                        { value: '50000', text: getCompoundCreateDropdownRecipeText('glass')[50000].text },
                        { value: '5000', text: getCompoundCreateDropdownRecipeText('glass')[5000].text },
                        { value: '500', text: getCompoundCreateDropdownRecipeText('glass')[500].text },
                        { value: '50', text: getCompoundCreateDropdownRecipeText('glass')[50].text },
                        { value: '5', text: getCompoundCreateDropdownRecipeText('glass')[5].text },
                        { value: '1', text: getCompoundCreateDropdownRecipeText('glass')[1].text },
                    ], 'fillToCapacity', (value) => {
                        setCreateCompoundPreview('glass', value);
                    }),
                    createButton({
                        text: 'Create',
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'create'],
                        onClick: () => {
                            handleCompoundCreate('glass');
                        },
                        dataConditionCheck: 'createCompound',
                        quantityArgument: 'glass',
                        disableKeyboardForButton: true,
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                    createToggleSwitch('autoCreateToggle', false, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['glass', 'autoCreate']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${getCompoundCreatePreview('glass')}`,
                resourcePriceObject: null,
                dataConditionCheck: null,
                objectSectionArgument1: null,
                objectSectionArgument2: null,
                quantityArgument: null,
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(glassCreateRow);
    
            const glassSellRow = createOptionRow({
                labelId: 'glassSellRow',
                renderNameABs: null,
                labelText: 'Sell Glass:',
                inputElements: [
                    createDropdown('glassSellSelectQuantity', [
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
                    ], getLastSellResourceCompoundDropdownOption('compounds', 'glass'), (value) => {
                        setLastSellResourceCompoundDropdownOption('compounds', 'glass', value);
                    }),
                    createButton({
                        text: 'Sell',
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'sell'],
                        onClick: () => {
                            sellCompound('glass');
                        },
                        dataConditionCheck: 'sellCompound',
                        quantityArgument: 'glass',
                        disableKeyboardForButton: true,
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                    createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['glass', 'autoSell']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${getCompoundSalePreview('glass')}`,
                resourcePriceObject: null,
                dataConditionCheck: null,
                objectSectionArgument1: null,
                objectSectionArgument2: null,
                quantityArgument: null,
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(glassSellRow);
            const toggleSwitch = glassSellRow.querySelector('#autoSellToggle');
            if (toggleSwitch) {
                toggleSwitch.setAttribute('data-type', 'compounds');
            }
    
            const glassIncreaseStorageRow = createOptionRow({
                labelId: 'glassIncreaseStorageRow',
                renderNameABs: null,
                labelText: 'Increase Storage:',
                inputElements: [
                    createButton({
                        text: 'Increase Storage',
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            increaseResourceStorage(['glassQuantity'], ['glass'], ['compounds']);
                            disableStorageNotificationActionIfShowing('glass', 'Already Increased!');
                            storagePrice = getResourceDataObject('compounds', ['glass', 'storageCapacity']) - 1;
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'storage',
                        quantityArgument: 'glass',
                        disableKeyboardForButton: true,
                        rowCategory: 'compound'
                    })
                ],
                descriptionText: `${storagePrice + " " + getResourceDataObject('compounds', ['glass', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'storage',
                objectSectionArgument2: null,
                quantityArgument: 'glass',
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: 'glass',
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(glassIncreaseStorageRow);
    
            const glassAutoBuyer1Row = createOptionRow({
                labelId: 'glassAutoBuyer1Row',
                renderNameABs: getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
                labelText: 'Glass Auto Buyer Tier 1:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio())} Glass /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'glassAB1Quantity', 'autoBuyer', true, 'tier1', 'glass', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'glass',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier1',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'glassAB1Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('glass1Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['glass', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${autobuyer1Price + " " + getResourceDataObject('compounds', ['glass', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'glass',
                autoBuyerTier: 'tier1',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(glassAutoBuyer1Row);
    
            const glassAutoBuyer2Row = createOptionRow({
                labelId: 'glassAutoBuyer2Row',
                renderNameABs: getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
                labelText: 'Glass Auto Buyer Tier 2:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio())} Glass /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'glassAB2Quantity', 'autoBuyer', true, 'tier2', 'glass', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'glass',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier2',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'glassAB2Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('glass2Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['glass', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${autobuyer2Price + " " + getResourceDataObject('compounds', ['glass', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'glass',
                autoBuyerTier: 'tier2',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(glassAutoBuyer2Row);
    
            const glassAutoBuyer3Row = createOptionRow({
                labelId: 'glassAutoBuyer3Row',
                renderNameABs: getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
                labelText: 'Glass Auto Buyer Tier 3:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio())} Glass /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'glassAB3Quantity', 'autoBuyer', true, 'tier3', 'glass', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'glass',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier3',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'glassAB3Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('glass3Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['glass', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${autobuyer3Price + " " + getResourceDataObject('compounds', ['glass', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'glass',
                autoBuyerTier: 'tier3',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(glassAutoBuyer3Row);
    
            const glassAutoBuyer4Row = createOptionRow({
                labelId: 'glassAutoBuyer4Row',
                renderNameABs: getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
                labelText: 'Glass Auto Buyer Tier 4:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio())} Glass /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'glassAB4Quantity', 'autoBuyer', true, 'tier4', 'glass', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'glass',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier4',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'glassAB4Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('glass4Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['glass', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${autobuyer4Price + " " + getResourceDataObject('compounds', ['glass', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'glass',
                autoBuyerTier: 'tier4',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(glassAutoBuyer4Row);
        }

        if (heading === 'Steel') {
            let storagePrice = getResourceDataObject('compounds', ['steel', 'storageCapacity']);
            let autobuyer1Price = getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier1', 'price']);
            let autobuyer2Price = getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier2', 'price']);
            let autobuyer3Price = getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier3', 'price']);
            let autobuyer4Price = getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier4', 'price']);
        
            const steelCreateRow = createOptionRow({
                labelId: 'steelCreateRow',
                renderNameABs: null,
                labelText: 'Create Steel:',
                inputElements: [
                    createDropdown('steelCreateSelectQuantity', [
                        { value: 'fillToCapacity', text: getCompoundCreateDropdownRecipeText('steel').fillToCapacity?.text || 'Fill To Capacity' },
                        { value: 'max', text: getCompoundCreateDropdownRecipeText('steel').max.text },
                        { value: 'threeQuarters', text: getCompoundCreateDropdownRecipeText('steel').threeQuarters.text },
                        { value: 'twoThirds', text: getCompoundCreateDropdownRecipeText('steel').twoThirds.text },
                        { value: 'half', text: getCompoundCreateDropdownRecipeText('steel').half.text },
                        { value: 'oneThird', text: getCompoundCreateDropdownRecipeText('steel').oneThird.text },
                        { value: '50000', text: getCompoundCreateDropdownRecipeText('steel')[50000].text },
                        { value: '5000', text: getCompoundCreateDropdownRecipeText('steel')[5000].text },
                        { value: '500', text: getCompoundCreateDropdownRecipeText('steel')[500].text },
                        { value: '50', text: getCompoundCreateDropdownRecipeText('steel')[50].text },
                        { value: '5', text: getCompoundCreateDropdownRecipeText('steel')[5].text },
                        { value: '1', text: getCompoundCreateDropdownRecipeText('steel')[1].text },
                    ], 'fillToCapacity', (value) => {
                        setCreateCompoundPreview('steel', value);
                    }),
                    createButton({
                        text: 'Create',
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'create'],
                        onClick: () => {
                            handleCompoundCreate('steel');
                            setAchievementFlagArray('createSteel', 'add');
                        },
                        dataConditionCheck: 'createCompound',
                        quantityArgument: 'steel',
                        disableKeyboardForButton: true,
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                    createToggleSwitch('autoCreateToggle', false, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['steel', 'autoCreate']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${getCompoundCreatePreview('steel')}`,
                resourcePriceObject: null,
                dataConditionCheck: null,
                objectSectionArgument1: null,
                objectSectionArgument2: null,
                quantityArgument: null,
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(steelCreateRow);
        
            const steelSellRow = createOptionRow({
                labelId: 'steelSellRow',
                renderNameABs: null,
                labelText: 'Sell Steel:',
                inputElements: [
                    createDropdown('steelSellSelectQuantity', [
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
                    ], getLastSellResourceCompoundDropdownOption('compounds', 'steel'), (value) => {
                        setLastSellResourceCompoundDropdownOption('compounds', 'steel', value);
                    }),
                    createButton({
                        text: 'Sell',
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'sell'],
                        onClick: () => {
                            sellCompound('steel');
                        },
                        dataConditionCheck: 'sellCompound',
                        quantityArgument: 'steel',
                        disableKeyboardForButton: true,
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                    createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['steel', 'autoSell']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${getCompoundSalePreview('steel')}`,
                resourcePriceObject: null,
                dataConditionCheck: null,
                objectSectionArgument1: null,
                objectSectionArgument2: null,
                quantityArgument: null,
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(steelSellRow);
            const toggleSwitch = steelSellRow.querySelector('#autoSellToggle');
            if (toggleSwitch) {
                toggleSwitch.setAttribute('data-type', 'compounds');
            }
        
            const steelIncreaseStorageRow = createOptionRow({
                labelId: 'steelIncreaseStorageRow',
                renderNameABs: null,
                labelText: 'Increase Storage:',
                inputElements: [
                    createButton({
                        text: 'Increase Storage',
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            increaseResourceStorage(['steelQuantity'], ['steel'], ['compounds']);
                            disableStorageNotificationActionIfShowing('steel', 'Already Increased!');
                            storagePrice = getResourceDataObject('compounds', ['steel', 'storageCapacity']) - 1;
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'storage',
                        quantityArgument: 'steel',
                        disableKeyboardForButton: true,
                        rowCategory: 'compound'
                    })
                ],
                descriptionText: `${storagePrice + " " + getResourceDataObject('compounds', ['steel', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'storage',
                objectSectionArgument2: null,
                quantityArgument: 'steel',
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: 'steel',
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(steelIncreaseStorageRow);
        
            const steelAutoBuyer1Row = createOptionRow({
                labelId: 'steelAutoBuyer1Row',
                renderNameABs: getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
                labelText: 'Steel Auto Buyer Tier 1:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio())} Steel /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'steelAB1Quantity', 'autoBuyer', true, 'tier1', 'steel', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'steel',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier1',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'steelAB1Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('steel1Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['steel', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${autobuyer1Price + " " + getResourceDataObject('compounds', ['steel', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'steel',
                autoBuyerTier: 'tier1',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(steelAutoBuyer1Row);

            const steelAutoBuyer2Row = createOptionRow({
                labelId: 'steelAutoBuyer2Row',
                renderNameABs: getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
                labelText: 'Steel Auto Buyer Tier 2:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio())} Steel /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'steelAB2Quantity', 'autoBuyer', true, 'tier2', 'steel', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'steel',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier2',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'steelAB2Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('steel2Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['steel', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${autobuyer2Price + " " + getResourceDataObject('compounds', ['steel', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'steel',
                autoBuyerTier: 'tier2',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(steelAutoBuyer2Row);

            const steelAutoBuyer3Row = createOptionRow({
                labelId: 'steelAutoBuyer3Row',
                renderNameABs: getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
                labelText: 'Steel Auto Buyer Tier 3:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio())} Steel /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'steelAB3Quantity', 'autoBuyer', true, 'tier3', 'steel', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'steel',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier3',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'steelAB3Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('steel3Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['steel', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${autobuyer3Price + " " + getResourceDataObject('compounds', ['steel', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'steel',
                autoBuyerTier: 'tier3',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(steelAutoBuyer3Row);

            const steelAutoBuyer4Row = createOptionRow({
                labelId: 'steelAutoBuyer4Row',
                renderNameABs: getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
                labelText: 'Steel Auto Buyer Tier 4:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio())} Steel /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'steelAB4Quantity', 'autoBuyer', true, 'tier4', 'steel', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'steel',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier4',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'steelAB4Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('steel4Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['steel', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${autobuyer4Price + " " + getResourceDataObject('compounds', ['steel', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'steel',
                autoBuyerTier: 'tier4',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(steelAutoBuyer4Row);
        }

        if (heading === 'Concrete') {
            let storagePrice = getResourceDataObject('compounds', ['concrete', 'storageCapacity']);
            let autobuyer1Price = getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier1', 'price']);
            let autobuyer2Price = getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier2', 'price']);
            let autobuyer3Price = getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier3', 'price']);
            let autobuyer4Price = getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier4', 'price']);

            const concreteCreateRow = createOptionRow({
                labelId: 'concreteCreateRow',
                renderNameABs: null,
                labelText: 'Create Concrete:',
                inputElements: [
                    createDropdown('concreteCreateSelectQuantity', [
                        { value: 'fillToCapacity', text: getCompoundCreateDropdownRecipeText('concrete').fillToCapacity?.text || 'Fill To Capacity' },
                        { value: 'max', text: getCompoundCreateDropdownRecipeText('concrete').max.text },
                        { value: 'threeQuarters', text: getCompoundCreateDropdownRecipeText('concrete').threeQuarters.text },
                        { value: 'twoThirds', text: getCompoundCreateDropdownRecipeText('concrete').twoThirds.text },
                        { value: 'half', text: getCompoundCreateDropdownRecipeText('concrete').half.text },
                        { value: 'oneThird', text: getCompoundCreateDropdownRecipeText('concrete').oneThird.text },
                        { value: '50000', text: getCompoundCreateDropdownRecipeText('concrete')[50000].text },
                        { value: '5000', text: getCompoundCreateDropdownRecipeText('concrete')[5000].text },
                        { value: '500', text: getCompoundCreateDropdownRecipeText('concrete')[500].text },
                        { value: '50', text: getCompoundCreateDropdownRecipeText('concrete')[50].text },
                        { value: '5', text: getCompoundCreateDropdownRecipeText('concrete')[5].text },
                        { value: '1', text: getCompoundCreateDropdownRecipeText('concrete')[1].text },
                    ], 'fillToCapacity', (value) => {
                        setCreateCompoundPreview('concrete', value);
                    }),
                    createButton({
                        text: 'Create',
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'create'],
                        onClick: () => {
                            handleCompoundCreate('concrete');
                        },
                        dataConditionCheck: 'createCompound',
                        quantityArgument: 'concrete',
                        disableKeyboardForButton: true,
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                    createToggleSwitch('autoCreateToggle', false, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['concrete', 'autoCreate']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${getCompoundCreatePreview('concrete')}`,
                resourcePriceObject: null,
                dataConditionCheck: null,
                objectSectionArgument1: null,
                objectSectionArgument2: null,
                quantityArgument: null,
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(concreteCreateRow);

            const concreteSellRow = createOptionRow({
                labelId: 'concreteSellRow',
                renderNameABs: null,
                labelText: 'Sell Concrete:',
                inputElements: [
                    createDropdown('concreteSellSelectQuantity', [
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
                    ], getLastSellResourceCompoundDropdownOption('compounds', 'concrete'), (value) => {
                        setLastSellResourceCompoundDropdownOption('compounds', 'concrete', value);
                    }),
                    createButton({
                        text: 'Sell',
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'sell'],
                        onClick: () => {
                            sellCompound('concrete');
                        },
                        dataConditionCheck: 'sellCompound',
                        quantityArgument: 'concrete',
                        disableKeyboardForButton: true,
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                    createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['concrete', 'autoSell']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${getCompoundSalePreview('concrete')}`,
                resourcePriceObject: null,
                dataConditionCheck: null,
                objectSectionArgument1: null,
                objectSectionArgument2: null,
                quantityArgument: null,
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(concreteSellRow);
            const toggleSwitch = concreteSellRow.querySelector('#autoSellToggle');
            if (toggleSwitch) {
                toggleSwitch.setAttribute('data-type', 'compounds');
            }

            const concreteIncreaseStorageRow = createOptionRow({
                labelId: 'concreteIncreaseStorageRow',
                renderNameABs: null,
                labelText: 'Increase Storage:',
                inputElements: [
                    createButton({
                        text: 'Increase Storage',
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            increaseResourceStorage(['concreteQuantity'], ['concrete'], ['compounds']);
                            disableStorageNotificationActionIfShowing('concrete', 'Already Increased!');
                            storagePrice = getResourceDataObject('compounds', ['concrete', 'storageCapacity']) - 1;
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'storage',
                        quantityArgument: 'concrete',
                        disableKeyboardForButton: true,
                        rowCategory: 'compound'
                    })
                ],
                descriptionText: `${storagePrice + " " + getResourceDataObject('compounds', ['concrete', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'storage',
                objectSectionArgument2: null,
                quantityArgument: 'concrete',
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: 'concrete',
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(concreteIncreaseStorageRow);

            const concreteAutoBuyer1Row = createOptionRow({
                labelId: 'concreteAutoBuyer1Row',
                renderNameABs: getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
                labelText: 'Concrete Auto Buyer Tier 1:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio())} Concrete /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'concreteAB1Quantity', 'autoBuyer', true, 'tier1', 'concrete', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'concrete',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier1',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'concreteAB1Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('concrete1Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${autobuyer1Price + " " + getResourceDataObject('compounds', ['concrete', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'concrete',
                autoBuyerTier: 'tier1',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(concreteAutoBuyer1Row);

            const concreteAutoBuyer2Row = createOptionRow({
                labelId: 'concreteAutoBuyer2Row',
                renderNameABs: getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
                labelText: 'Concrete Auto Buyer Tier 2:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio())} Concrete /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'concreteAB2Quantity', 'autoBuyer', true, 'tier2', 'concrete', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'concrete',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier2',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'concreteAB2Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('concrete2Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${autobuyer2Price + " " + getResourceDataObject('compounds', ['concrete', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'concrete',
                autoBuyerTier: 'tier2',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(concreteAutoBuyer2Row);

            const concreteAutoBuyer3Row = createOptionRow({
                labelId: 'concreteAutoBuyer3Row',
                renderNameABs: getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
                labelText: 'Concrete Auto Buyer Tier 3:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio())} Concrete /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'concreteAB3Quantity', 'autoBuyer', true, 'tier3', 'concrete', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'concrete',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier3',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'concreteAB3Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('concrete3Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${autobuyer3Price + " " + getResourceDataObject('compounds', ['concrete', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'concrete',
                autoBuyerTier: 'tier3',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(concreteAutoBuyer3Row);

            const concreteAutoBuyer4Row = createOptionRow({
                labelId: 'concreteAutoBuyer4Row',
                renderNameABs: getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
                labelText: 'Concrete Auto Buyer Tier 4:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio())} Concrete /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'concreteAB4Quantity', 'autoBuyer', true, 'tier4', 'concrete', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'concrete',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier4',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'concreteAB4Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('concrete4Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${autobuyer4Price + " " + getResourceDataObject('compounds', ['concrete', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'concrete',
                autoBuyerTier: 'tier4',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(concreteAutoBuyer4Row);
        }

        if (heading === 'Water') {
            let storagePrice = getResourceDataObject('compounds', ['water', 'storageCapacity']);
            let extraResourceName;

            let autobuyer1Price = getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier1', 'price']);
            let autobuyer2Price = getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier2', 'price']);
            let autobuyer3Price = getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier3', 'price']);
            let autobuyer4Price = getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier4', 'price']);

            const waterCreateRow = createOptionRow({
                labelId: 'waterCreateRow',
                renderNameABs: null,
                labelText: 'Create Water:',
                inputElements: [
                    createDropdown('waterCreateSelectQuantity', [
                        { value: 'fillToCapacity', text: getCompoundCreateDropdownRecipeText('water').fillToCapacity?.text || 'Fill To Capacity' },
                        { value: 'max', text: getCompoundCreateDropdownRecipeText('water').max.text },
                        { value: 'threeQuarters', text: getCompoundCreateDropdownRecipeText('water').threeQuarters.text },
                        { value: 'twoThirds', text: getCompoundCreateDropdownRecipeText('water').twoThirds.text },
                        { value: 'half', text: getCompoundCreateDropdownRecipeText('water').half.text },
                        { value: 'oneThird', text: getCompoundCreateDropdownRecipeText('water').oneThird.text },
                        { value: '50000', text: getCompoundCreateDropdownRecipeText('water')[50000].text },
                        { value: '5000', text: getCompoundCreateDropdownRecipeText('water')[5000].text },
                        { value: '500', text: getCompoundCreateDropdownRecipeText('water')[500].text },
                        { value: '50', text: getCompoundCreateDropdownRecipeText('water')[50].text },
                        { value: '5', text: getCompoundCreateDropdownRecipeText('water')[5].text },
                        { value: '1', text: getCompoundCreateDropdownRecipeText('water')[1].text },
                    ], 'fillToCapacity', (value) => {
                        setCreateCompoundPreview('water', value);
                    }),
                    createButton({
                        text: 'Create',
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'create'],
                        onClick: () => {
                            handleCompoundCreate('water');
                        },
                        dataConditionCheck: 'createCompound',
                        quantityArgument: 'water',
                        disableKeyboardForButton: true,
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                    createToggleSwitch('autoCreateToggle', false, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['water', 'autoCreate']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${getCompoundCreatePreview('water')}`,
                resourcePriceObject: null,
                dataConditionCheck: null,
                objectSectionArgument1: null,
                objectSectionArgument2: null,
                quantityArgument: null,
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(waterCreateRow);

            const waterSellRow = createOptionRow({
                labelId: 'waterSellRow',
                renderNameABs: null,
                labelText: 'Sell Water:',
                inputElements: [
                    createDropdown('waterSellSelectQuantity', [
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
                    ], getLastSellResourceCompoundDropdownOption('compounds', 'water'), (value) => {
                        setLastSellResourceCompoundDropdownOption('compounds', 'water', value);
                    }),
                    createButton({
                        text: 'Sell',
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'sell'],
                        onClick: () => {
                            sellCompound('water');
                        },
                        dataConditionCheck: 'sellCompound',
                        quantityArgument: 'water',
                        disableKeyboardForButton: true,
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                    createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['water', 'autoSell']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${getCompoundSalePreview('water')}`,
                resourcePriceObject: null,
                dataConditionCheck: null,
                objectSectionArgument1: null,
                objectSectionArgument2: null,
                quantityArgument: null,
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(waterSellRow);
            const toggleSwitch = waterSellRow.querySelector('#autoSellToggle');
            if (toggleSwitch) {
                toggleSwitch.setAttribute('data-type', 'compounds');
            }

            const waterIncreaseStorageRow = createOptionRow({
                labelId: 'waterIncreaseStorageRow',
                renderNameABs: null,
                labelText: 'Enlarge Reservoir:',
                inputElements: [
                    createButton({
                        text: 'Enlarge Reservoir',
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            increaseResourceStorage(['waterQuantity', 'concreteQuantity'], ['water', 'concrete'], ['compounds', 'compounds']);
                            disableStorageNotificationActionIfShowing('water', 'Already Increased!');
                            storagePrice = getResourceDataObject('compounds', ['water', 'storageCapacity']) - 1;
                            extraResourceName = 'Concrete';
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'storage',
                        quantityArgument: 'water',
                        disableKeyboardForButton: true,
                        rowCategory: 'compound'
                    })
                ],
                descriptionText: `${storagePrice + " " + getResourceDataObject('compounds', ['water', 'nameResource'])}, ${getResourceDataObject('compounds', ['concrete', 'currentSecondaryIncreasePrice'])} ${getResourceDataObject('compounds', ['concrete', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'storage',
                objectSectionArgument2: null,
                quantityArgument: 'water',
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: 'water',
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(waterIncreaseStorageRow);

            const waterAutoBuyer1Row = createOptionRow({
                labelId: 'waterAutoBuyer1Row',
                renderNameABs: getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
                labelText: 'Water Auto Buyer Tier 1:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio())} Water /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'waterAB1Quantity', 'autoBuyer', true, 'tier1', 'water', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'water',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier1',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'waterAB1Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('water1Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['water', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${autobuyer1Price + " " + getResourceDataObject('compounds', ['water', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'water',
                autoBuyerTier: 'tier1',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(waterAutoBuyer1Row);

            const waterAutoBuyer2Row = createOptionRow({
                labelId: 'waterAutoBuyer2Row',
                renderNameABs: getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
                labelText: 'Water Auto Buyer Tier 2:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio())} Water /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'waterAB2Quantity', 'autoBuyer', true, 'tier2', 'water', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'water',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier2',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'waterAB2Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('water2Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['water', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${autobuyer2Price + " " + getResourceDataObject('compounds', ['water', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'water',
                autoBuyerTier: 'tier2',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(waterAutoBuyer2Row);

            const waterAutoBuyer3Row = createOptionRow({
                labelId: 'waterAutoBuyer3Row',
                renderNameABs: getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
                labelText: 'Water Auto Buyer Tier 3:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio())} Water /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'waterAB3Quantity', 'autoBuyer', true, 'tier3', 'water', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'water',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier3',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'waterAB3Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('water3Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['water', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${autobuyer3Price + " " + getResourceDataObject('compounds', ['water', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'water',
                autoBuyerTier: 'tier3',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(waterAutoBuyer3Row);

            const waterAutoBuyer4Row = createOptionRow({
                labelId: 'waterAutoBuyer4Row',
                renderNameABs: getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
                labelText: 'Water Auto Buyer Tier 4:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio())} Water /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'waterAB4Quantity', 'autoBuyer', true, 'tier4', 'water', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'water',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier4',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'waterAB4Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('water4Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['water', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${autobuyer4Price + " " + getResourceDataObject('compounds', ['water', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'water',
                autoBuyerTier: 'tier4',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(waterAutoBuyer4Row);
        }
        if (heading === 'Titanium') {
            let storagePrice = getResourceDataObject('compounds', ['titanium', 'storageCapacity']);
            let autobuyer1Price = getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier1', 'price']);
            let autobuyer2Price = getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier2', 'price']);
            let autobuyer3Price = getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier3', 'price']);
            let autobuyer4Price = getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier4', 'price']);
        
            const titaniumCreateRow = createOptionRow({
                labelId: 'titaniumCreateRow',
                renderNameABs: null,
                labelText: 'Create Titanium:',
                inputElements: [
                    createDropdown('titaniumCreateSelectQuantity', [
                        { value: 'fillToCapacity', text: getCompoundCreateDropdownRecipeText('titanium').fillToCapacity?.text || 'Fill To Capacity' },
                        { value: 'max', text: getCompoundCreateDropdownRecipeText('titanium').max.text },
                        { value: 'threeQuarters', text: getCompoundCreateDropdownRecipeText('titanium').threeQuarters.text },
                        { value: 'twoThirds', text: getCompoundCreateDropdownRecipeText('titanium').twoThirds.text },
                        { value: 'half', text: getCompoundCreateDropdownRecipeText('titanium').half.text },
                        { value: 'oneThird', text: getCompoundCreateDropdownRecipeText('titanium').oneThird.text },
                        { value: '50000', text: getCompoundCreateDropdownRecipeText('titanium')[50000].text },
                        { value: '5000', text: getCompoundCreateDropdownRecipeText('titanium')[5000].text },
                        { value: '500', text: getCompoundCreateDropdownRecipeText('titanium')[500].text },
                        { value: '50', text: getCompoundCreateDropdownRecipeText('titanium')[50].text },
                        { value: '5', text: getCompoundCreateDropdownRecipeText('titanium')[5].text },
                        { value: '1', text: getCompoundCreateDropdownRecipeText('titanium')[1].text },
                    ], 'fillToCapacity', (value) => {
                        setCreateCompoundPreview('titanium', value);
                    }),
                    createButton({
                        text: 'Create',
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'create'],
                        onClick: () => {
                            handleCompoundCreate('titanium');
                            setAchievementFlagArray('createTitanium', 'add');
                        },
                        dataConditionCheck: 'createCompound',
                        quantityArgument: 'titanium',
                        disableKeyboardForButton: true,
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                    createToggleSwitch('autoCreateToggle', false, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['titanium', 'autoCreate']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${getCompoundCreatePreview('titanium')}`,
                resourcePriceObject: null,
                dataConditionCheck: null,
                objectSectionArgument1: null,
                objectSectionArgument2: null,
                quantityArgument: null,
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(titaniumCreateRow);
        
            const titaniumSellRow = createOptionRow({
                labelId: 'titaniumSellRow',
                renderNameABs: null,
                labelText: 'Sell Titanium:',
                inputElements: [
                    createDropdown('titaniumSellSelectQuantity', [
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
                    ], getLastSellResourceCompoundDropdownOption('compounds', 'titanium'), (value) => {
                        setLastSellResourceCompoundDropdownOption('compounds', 'titanium', value);
                    }),
                    createButton({
                        text: 'Sell',
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'sell'],
                        onClick: () => {
                            sellCompound('titanium');
                        },
                        dataConditionCheck: 'sellCompound',
                        quantityArgument: 'titanium',
                        disableKeyboardForButton: true,
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                    createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['titanium', 'autoSell']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${getCompoundSalePreview('titanium')}`,
                resourcePriceObject: null,
                dataConditionCheck: null,
                objectSectionArgument1: null,
                objectSectionArgument2: null,
                quantityArgument: null,
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(titaniumSellRow);
            const toggleSwitch = titaniumSellRow.querySelector('#autoSellToggle');
            if (toggleSwitch) {
                toggleSwitch.setAttribute('data-type', 'compounds');
            }
        
            const titaniumIncreaseStorageRow = createOptionRow({
                labelId: 'titaniumIncreaseStorageRow',
                renderNameABs: null,
                labelText: 'Increase Storage:',
                inputElements: [
                    createButton({
                        text: 'Increase Storage',
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            increaseResourceStorage(['titaniumQuantity'], ['titanium'], ['compounds']);
                            disableStorageNotificationActionIfShowing('titanium', 'Already Increased!');
                            storagePrice = getResourceDataObject('compounds', ['titanium', 'storageCapacity']) - 1;
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'storage',
                        quantityArgument: 'titanium',
                        disableKeyboardForButton: true,
                        rowCategory: 'compound'
                    })
                ],
                descriptionText: `${storagePrice + " " + getResourceDataObject('compounds', ['titanium', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'storage',
                objectSectionArgument2: null,
                quantityArgument: 'titanium',
                autoBuyerTier: null,
                startInvisibleValue: false,
                resourceString: 'titanium',
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(titaniumIncreaseStorageRow);
        
            const titaniumAutoBuyer1Row = createOptionRow({
                labelId: 'titaniumAutoBuyer1Row',
                renderNameABs: getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
                labelText: 'Titanium Auto Buyer Tier 1:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio())} Titanium /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'titaniumAB1Quantity', 'autoBuyer', true, 'tier1', 'titanium', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'titanium',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier1',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'titaniumAB1Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('titanium1Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${autobuyer1Price + " " + getResourceDataObject('compounds', ['titanium', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'titanium',
                autoBuyerTier: 'tier1',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(titaniumAutoBuyer1Row);
        
            const titaniumAutoBuyer2Row = createOptionRow({
                labelId: 'titaniumAutoBuyer2Row',
                renderNameABs: getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
                labelText: 'Titanium Auto Buyer Tier 2:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio())} Titanium /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'titaniumAB2Quantity', 'autoBuyer', true, 'tier2', 'titanium', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'titanium',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier2',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'titaniumAB2Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('titanium2Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${autobuyer2Price + " " + getResourceDataObject('compounds', ['titanium', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'titanium',
                autoBuyerTier: 'tier2',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(titaniumAutoBuyer2Row);
        
            const titaniumAutoBuyer3Row = createOptionRow({
                labelId: 'titaniumAutoBuyer3Row',
                renderNameABs: getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
                labelText: 'Titanium Auto Buyer Tier 3:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio())} Titanium /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'titaniumAB3Quantity', 'autoBuyer', true, 'tier3', 'titanium', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'titanium',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier3',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'titaniumAB3Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('titanium3Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${autobuyer3Price + " " + getResourceDataObject('compounds', ['titanium', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'titanium',
                autoBuyerTier: 'tier3',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(titaniumAutoBuyer3Row);
        
            const titaniumAutoBuyer4Row = createOptionRow({
                labelId: 'titaniumAutoBuyer4Row',
                renderNameABs: getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
                labelText: 'Titanium Auto Buyer Tier 4:',
                inputElements: [
                    createButton({
                        text: `Add ${Math.floor(getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio())} Titanium /s`,
                        classNames: ['option-button', 'red-disabled-text', 'compound-cost-sell-check'],
                        onClick: () => {
                            gain(1, 'titaniumAB4Quantity', 'autoBuyer', true, 'tier4', 'titanium', 'compounds')
                        },
                        dataConditionCheck: 'upgradeCheck',
                        resourcePriceObject: '',
                        objectSectionArgument1: 'autoBuyer',
                        quantityArgument: 'titanium',
                        disableKeyboardForButton: true,
                        autoBuyerTier: 'tier4',
                        rowCategory: 'compound'
                    }),
                    createTextElement(`Quantity: ${getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'titaniumAB4Quantity', ['autoBuyer-building-quantity']),
                    createToggleSwitch('titanium4Toggle', true, (isEnabled) => {
                        setResourceDataObject(isEnabled, 'compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                    }, ['toggle-switch-spacing']),
                ],
                descriptionText: `${autobuyer4Price + " " + getResourceDataObject('compounds', ['titanium', 'nameResource'])}`,
                resourcePriceObject: '',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'autoBuyer',
                objectSectionArgument2: null,
                quantityArgument: 'titanium',
                autoBuyerTier: 'tier4',
                startInvisibleValue: false,
                resourceString: null,
                optionalIterationParam: null,
                rowCategory: 'compound'
            });
            optionContentElement.appendChild(titaniumAutoBuyer4Row);
        }        
}