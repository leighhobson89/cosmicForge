import { getCompoundCreateDropdownRecipeText, getLastSellResourceCompoundDropdownOption, setLastSellResourceCompoundDropdownOption, getImageUrls, getTimerRateRatio, getCompoundSalePreview, getCompoundCreatePreview, setCreateCompoundPreview, setAchievementFlagArray, getCurrencySymbol } from './constantsAndGlobalVars.js';

import { increaseResourceStorage, createCompound, sellCompound, gain, addToResourceAllTimeStat } from './game.js';

import { setResourceDataObject, getResourceDataObject } from './resourceDataObject.js';
import { removeTabAttentionIfNoIndicators, createTextElement, createToggleSwitch, createOptionRow, createDropdown, createButton } from './ui.js';

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
    
            const dieselCreateRow = createOptionRow(
                'dieselCreateRow',
                null,
                'Create Diesel:',
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
                createButton('Create', ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'create'], () => {
                    handleCompoundCreate('diesel');
                }, 'createCompound', null, null, null, 'diesel', true, null, 'compound'),
                createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                createToggleSwitch('autoCreateToggle', false, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['diesel', 'autoCreate']);
                }, ['toggle-switch-spacing']),
                null,
                `${getCompoundCreatePreview('diesel')}`,
                null,
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(dieselCreateRow);
    
            const dieselSellRow = createOptionRow(
                'dieselSellRow',
                null,
                'Sell Diesel:',
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
                createButton('Sell', ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'sell'], () => {
                    sellCompound('diesel');
                }, 'sellCompound', null, null, null, 'diesel', true, null, 'compound'),
                createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['diesel', 'autoSell']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${getCompoundSalePreview('diesel')}`,
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(dieselSellRow);
            const toggleSwitch = dieselSellRow.querySelector('#autoSellToggle');
            if (toggleSwitch) {
                toggleSwitch.setAttribute('data-type', 'compounds');
            }
    
            const dieselIncreaseStorageRow = createOptionRow(
                'dieselIncreaseStorageRow',
                null,
                'Increase Storage:',
                createButton('Increase Storage', ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    increaseResourceStorage(['dieselQuantity'], ['diesel'], ['compounds']);
                    storagePrice = getResourceDataObject('compounds', ['diesel', 'storageCapacity']) - 1;
                }, 'upgradeCheck', '', 'storage', null, 'diesel', true, null, 'compound'),
                null,
                null,
                null,
                null,
                `${storagePrice + " " + getResourceDataObject('compounds', ['diesel', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'storage',
                null,
                'diesel',
                null,
                false,
                'diesel',
                null,
                'compound'
            );
            optionContentElement.appendChild(dieselIncreaseStorageRow);
    
            const dieselAutoBuyer1Row = createOptionRow(
                'dieselAutoBuyer1Row',
                getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
                'Diesel Auto Buyer Tier 1:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio())} Diesel /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'dieselAB1Quantity', 'autoBuyer', true, 'tier1', 'diesel', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'diesel', true, 'tier1', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'dieselAB1Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('diesel1Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${dieselTier1CashCostDisplay}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'diesel',
                'tier1',
                false,
                null,
                null,
                'compound'
            );
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
    
            const dieselAutoBuyer2Row = createOptionRow(
                'dieselAutoBuyer2Row',
                getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
                'Diesel Auto Buyer Tier 2:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio())} Diesel /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'dieselAB2Quantity', 'autoBuyer', true, 'tier2', 'diesel', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'diesel', true, 'tier2', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'dieselAB2Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('diesel2Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${autobuyer2Price + " " + getResourceDataObject('compounds', ['diesel', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'diesel',
                'tier2',
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(dieselAutoBuyer2Row);
    
            const dieselAutoBuyer3Row = createOptionRow(
                'dieselAutoBuyer3Row',
                getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
                'Diesel Auto Buyer Tier 3:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio())} Diesel /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'dieselAB3Quantity', 'autoBuyer', true, 'tier3', 'diesel', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'diesel', true, 'tier3', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'dieselAB3Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('diesel3Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${autobuyer3Price + " " + getResourceDataObject('compounds', ['diesel', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'diesel',
                'tier3',
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(dieselAutoBuyer3Row);
    
            const dieselAutoBuyer4Row = createOptionRow(
                'dieselAutoBuyer4Row',
                getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
                'Diesel Auto Buyer Tier 4:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio())} Diesel /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'dieselAB4Quantity', 'autoBuyer', true, 'tier4', 'diesel', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'diesel', true, 'tier4', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'dieselAB4Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('diesel4Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['diesel', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${autobuyer4Price + " " + getResourceDataObject('compounds', ['diesel', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'diesel',
                'tier4',
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(dieselAutoBuyer4Row);
        }

        if (heading === 'Glass') {
            let storagePrice = getResourceDataObject('compounds', ['glass', 'storageCapacity']);
            let autobuyer1Price = getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier1', 'price']);
            let autobuyer2Price = getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier2', 'price']);
            let autobuyer3Price = getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier3', 'price']);
            let autobuyer4Price = getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier4', 'price']);
    
            const glassCreateRow = createOptionRow(
                'glassCreateRow',
                null,
                'Create Glass:',
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
                createButton('Create', ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'create'], () => {
                    handleCompoundCreate('glass');
                }, 'createCompound', null, null, null, 'glass', true, null, 'compound'),
                createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                createToggleSwitch('autoCreateToggle', false, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['glass', 'autoCreate']);
                }, ['toggle-switch-spacing']),
                null,
                `${getCompoundCreatePreview('glass')}`,
                null,
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(glassCreateRow);
    
            const glassSellRow = createOptionRow(
                'glassSellRow',
                null,
                'Sell Glass:',
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
                createButton('Sell', ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'sell'], () => {
                    sellCompound('glass');
                }, 'sellCompound', null, null, null, 'glass', true, null, 'compound'),
                createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['glass', 'autoSell']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${getCompoundSalePreview('glass')}`,
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(glassSellRow);
            const toggleSwitch = glassSellRow.querySelector('#autoSellToggle');
            if (toggleSwitch) {
                toggleSwitch.setAttribute('data-type', 'compounds');
            }
    
            const glassIncreaseStorageRow = createOptionRow(
                'glassIncreaseStorageRow',
                null,
                'Increase Storage:',
                createButton('Increase Storage', ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    increaseResourceStorage(['glassQuantity'], ['glass'], ['compounds']);
                    storagePrice = getResourceDataObject('compounds', ['glass', 'storageCapacity']) - 1;
                }, 'upgradeCheck', '', 'storage', null, 'glass', true, null, 'compound'),
                null,
                null,
                null,
                null,
                `${storagePrice + " " + getResourceDataObject('compounds', ['glass', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'storage',
                null,
                'glass',
                null,
                false,
                'glass',
                null,
                'compound'
            );
            optionContentElement.appendChild(glassIncreaseStorageRow);
    
            const glassAutoBuyer1Row = createOptionRow(
                'glassAutoBuyer1Row',
                getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
                'Glass Auto Buyer Tier 1:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio())} Glass /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'glassAB1Quantity', 'autoBuyer', true, 'tier1', 'glass', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'glass', true, 'tier1', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'glassAB1Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('glass1Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['glass', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${autobuyer1Price + " " + getResourceDataObject('compounds', ['glass', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'glass',
                'tier1',
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(glassAutoBuyer1Row);
    
            const glassAutoBuyer2Row = createOptionRow(
                'glassAutoBuyer2Row',
                getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
                'Glass Auto Buyer Tier 2:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio())} Glass /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'glassAB2Quantity', 'autoBuyer', true, 'tier2', 'glass', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'glass', true, 'tier2', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'glassAB2Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('glass2Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['glass', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${autobuyer2Price + " " + getResourceDataObject('compounds', ['glass', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'glass',
                'tier2',
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(glassAutoBuyer2Row);
    
            const glassAutoBuyer3Row = createOptionRow(
                'glassAutoBuyer3Row',
                getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
                'Glass Auto Buyer Tier 3:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio())} Glass /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'glassAB3Quantity', 'autoBuyer', true, 'tier3', 'glass', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'glass', true, 'tier3', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'glassAB3Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('glass3Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['glass', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${autobuyer3Price + " " + getResourceDataObject('compounds', ['glass', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'glass',
                'tier3',
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(glassAutoBuyer3Row);
    
            const glassAutoBuyer4Row = createOptionRow(
                'glassAutoBuyer4Row',
                getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
                'Glass Auto Buyer Tier 4:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio())} Glass /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'glassAB4Quantity', 'autoBuyer', true, 'tier4', 'glass', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'glass', true, 'tier4', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['glass', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'glassAB4Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('glass4Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['glass', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${autobuyer4Price + " " + getResourceDataObject('compounds', ['glass', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'glass',
                'tier4',
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(glassAutoBuyer4Row);
        }

        if (heading === 'Steel') {
            let storagePrice = getResourceDataObject('compounds', ['steel', 'storageCapacity']);
            let autobuyer1Price = getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier1', 'price']);
            let autobuyer2Price = getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier2', 'price']);
            let autobuyer3Price = getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier3', 'price']);
            let autobuyer4Price = getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier4', 'price']);
        
            const steelCreateRow = createOptionRow(
                'steelCreateRow',
                null,
                'Create Steel:',
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
                createButton('Create', ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'create'], () => {
                    handleCompoundCreate('steel');
                    setAchievementFlagArray('createSteel', 'add');
                }, 'createCompound', null, null, null, 'steel', true, null, 'compound'),
                createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                createToggleSwitch('autoCreateToggle', false, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['steel', 'autoCreate']);
                }, ['toggle-switch-spacing']),
                null,
                `${getCompoundCreatePreview('steel')}`,
                null,
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(steelCreateRow);
        
            const steelSellRow = createOptionRow(
                'steelSellRow',
                null,
                'Sell Steel:',
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
                createButton('Sell', ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'sell'], () => {
                    sellCompound('steel');
                }, 'sellCompound', null, null, null, 'steel', true, null, 'compound'),
                createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['steel', 'autoSell']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${getCompoundSalePreview('steel')}`,
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(steelSellRow);
            const toggleSwitch = steelSellRow.querySelector('#autoSellToggle');
            if (toggleSwitch) {
                toggleSwitch.setAttribute('data-type', 'compounds');
            }
        
            const steelIncreaseStorageRow = createOptionRow(
                'steelIncreaseStorageRow',
                null,
                'Increase Storage:',
                createButton('Increase Storage', ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    increaseResourceStorage(['steelQuantity'], ['steel'], ['compounds']);
                    storagePrice = getResourceDataObject('compounds', ['steel', 'storageCapacity']) - 1;
                }, 'upgradeCheck', '', 'storage', null, 'steel', true, null, 'compound'),
                null,
                null,
                null,
                null,
                `${storagePrice + " " + getResourceDataObject('compounds', ['steel', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'storage',
                null,
                'steel',
                null,
                false,
                'steel',
                null,
                'compound'
            );
            optionContentElement.appendChild(steelIncreaseStorageRow);
        
            const steelAutoBuyer1Row = createOptionRow(
                'steelAutoBuyer1Row',
                getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
                'Steel Auto Buyer Tier 1:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio())} Steel /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'steelAB1Quantity', 'autoBuyer', true, 'tier1', 'steel', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'steel', true, 'tier1', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'steelAB1Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('steel1Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['steel', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${autobuyer1Price + " " + getResourceDataObject('compounds', ['steel', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'steel',
                'tier1',
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(steelAutoBuyer1Row);
        
            const steelAutoBuyer2Row = createOptionRow(
                'steelAutoBuyer2Row',
                getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
                'Steel Auto Buyer Tier 2:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio())} Steel /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'steelAB2Quantity', 'autoBuyer', true, 'tier2', 'steel', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'steel', true, 'tier2', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'steelAB2Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('steel2Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['steel', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${autobuyer2Price + " " + getResourceDataObject('compounds', ['steel', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'steel',
                'tier2',
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(steelAutoBuyer2Row);
        
            const steelAutoBuyer3Row = createOptionRow(
                'steelAutoBuyer3Row',
                getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
                'Steel Auto Buyer Tier 3:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio())} Steel /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'steelAB3Quantity', 'autoBuyer', true, 'tier3', 'steel', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'steel', true, 'tier3', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'steelAB3Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('steel3Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['steel', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${autobuyer3Price + " " + getResourceDataObject('compounds', ['steel', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'steel',
                'tier3',
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(steelAutoBuyer3Row);
        
            const steelAutoBuyer4Row = createOptionRow(
                'steelAutoBuyer4Row',
                getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
                'Steel Auto Buyer Tier 4:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio())} Steel /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'steelAB4Quantity', 'autoBuyer', true, 'tier4', 'steel', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'steel', true, 'tier4', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['steel', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'steelAB4Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('steel4Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['steel', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${autobuyer4Price + " " + getResourceDataObject('compounds', ['steel', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'steel',
                'tier4',
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(steelAutoBuyer4Row);
        } 
        
        if (heading === 'Concrete') {
            let storagePrice = getResourceDataObject('compounds', ['concrete', 'storageCapacity']);
            let autobuyer1Price = getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier1', 'price']);
            let autobuyer2Price = getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier2', 'price']);
            let autobuyer3Price = getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier3', 'price']);
            let autobuyer4Price = getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier4', 'price']);
        
            const concreteCreateRow = createOptionRow(
                'concreteCreateRow',
                null,
                'Create Concrete:',
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
                createButton('Create', ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'create'], () => {
                    handleCompoundCreate('concrete');
                }, 'createCompound', null, null, null, 'concrete', true, null, 'compound'),
                createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                createToggleSwitch('autoCreateToggle', false, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['concrete', 'autoCreate']);
                }, ['toggle-switch-spacing']),
                null,
                `${getCompoundCreatePreview('concrete')}`,
                null,
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(concreteCreateRow);
        
            const concreteSellRow = createOptionRow(
                'concreteSellRow',
                null,
                'Sell Concrete:',
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
                createButton('Sell', ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'sell'], () => {
                    sellCompound('concrete');
                }, 'sellCompound', null, null, null, 'concrete', true, null, 'compound'),
                createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['concrete', 'autoSell']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${getCompoundSalePreview('concrete')}`,
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(concreteSellRow);
            const toggleSwitch = concreteSellRow.querySelector('#autoSellToggle');
            if (toggleSwitch) {
                toggleSwitch.setAttribute('data-type', 'compounds');
            }
        
            const concreteIncreaseStorageRow = createOptionRow(
                'concreteIncreaseStorageRow',
                null,
                'Increase Storage:',
                createButton('Increase Storage', ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    increaseResourceStorage(['concreteQuantity'], ['concrete'], ['compounds']);
                    storagePrice = getResourceDataObject('compounds', ['concrete', 'storageCapacity']) - 1;
                }, 'upgradeCheck', '', 'storage', null, 'concrete', true, null, 'compound'),
                null,
                null,
                null,
                null,
                `${storagePrice + " " + getResourceDataObject('compounds', ['concrete', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'storage',
                null,
                'concrete',
                null,
                false,
                'concrete',
                null,
                'compound'
            );
            optionContentElement.appendChild(concreteIncreaseStorageRow);
        
            const concreteAutoBuyer1Row = createOptionRow(
                'concreteAutoBuyer1Row',
                getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
                'Concrete Auto Buyer Tier 1:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio())} Concrete /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'concreteAB1Quantity', 'autoBuyer', true, 'tier1', 'concrete', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'concrete', true, 'tier1', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'concreteAB1Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('concrete1Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${autobuyer1Price + " " + getResourceDataObject('compounds', ['concrete', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'concrete',
                'tier1',
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(concreteAutoBuyer1Row);
        
            const concreteAutoBuyer2Row = createOptionRow(
                'concreteAutoBuyer2Row',
                getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
                'Concrete Auto Buyer Tier 2:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio())} Concrete /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'concreteAB2Quantity', 'autoBuyer', true, 'tier2', 'concrete', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'concrete', true, 'tier2', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'concreteAB2Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('concrete2Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${autobuyer2Price + " " + getResourceDataObject('compounds', ['concrete', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'concrete',
                'tier2',
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(concreteAutoBuyer2Row);
        
            const concreteAutoBuyer3Row = createOptionRow(
                'concreteAutoBuyer3Row',
                getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
                'Concrete Auto Buyer Tier 3:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio())} Concrete /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'concreteAB3Quantity', 'autoBuyer', true, 'tier3', 'concrete', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'concrete', true, 'tier3', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'concreteAB3Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('concrete3Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${autobuyer3Price + " " + getResourceDataObject('compounds', ['concrete', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'concrete',
                'tier3',
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(concreteAutoBuyer3Row);
        
            const concreteAutoBuyer4Row = createOptionRow(
                'concreteAutoBuyer4Row',
                getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
                'Concrete Auto Buyer Tier 4:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio())} Concrete /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'concreteAB4Quantity', 'autoBuyer', true, 'tier4', 'concrete', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'concrete', true, 'tier4', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'concreteAB4Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('concrete4Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['concrete', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${autobuyer4Price + " " + getResourceDataObject('compounds', ['concrete', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'concrete',
                'tier4',
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(concreteAutoBuyer4Row);
        }
        
        if (heading === 'Water') {
            let storagePrice = getResourceDataObject('compounds', ['water', 'storageCapacity']);
            let extraResourceName;

            let autobuyer1Price = getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier1', 'price']);
            let autobuyer2Price = getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier2', 'price']);
            let autobuyer3Price = getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier3', 'price']);
            let autobuyer4Price = getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier4', 'price']);
        
            const waterCreateRow = createOptionRow(
                'waterCreateRow',
                null,
                'Create Water:',
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
                createButton('Create', ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'create'], () => {
                    handleCompoundCreate('water');
                }, 'createCompound', null, null, null, 'water', true, null, 'compound'),
                createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                createToggleSwitch('autoCreateToggle', false, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['water', 'autoCreate']);
                }, ['toggle-switch-spacing']),
                null,
                `${getCompoundCreatePreview('water')}`,
                null,
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(waterCreateRow);
        
            const waterSellRow = createOptionRow(
                'waterSellRow',
                null,
                'Sell Water:',
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
                createButton('Sell', ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'sell'], () => {
                    sellCompound('water');
                }, 'sellCompound', null, null, null, 'water', true, null, 'compound'),
                createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['water', 'autoSell']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${getCompoundSalePreview('water')}`,
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(waterSellRow);
            const toggleSwitch = waterSellRow.querySelector('#autoSellToggle');
            if (toggleSwitch) {
                toggleSwitch.setAttribute('data-type', 'compounds');
            }
        
            const waterIncreaseStorageRow = createOptionRow(
                'waterIncreaseStorageRow',
                null,
                'Enlarge Reservoir:',
                createButton('Enlarge Reservoir', ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    increaseResourceStorage(['waterQuantity', 'concreteQuantity'], ['water', 'concrete'], ['compounds', 'compounds']);
                    storagePrice = getResourceDataObject('compounds', ['water', 'storageCapacity']) - 1;
                    extraResourceName = 'Concrete';
                }, 'upgradeCheck', '', 'storage', null, 'water', true, null, 'compound'),
                null,
                null,
                null,
                null,
                `${storagePrice + " " + getResourceDataObject('compounds', ['water', 'nameResource'])}, ${getResourceDataObject('compounds', ['concrete', 'currentSecondaryIncreasePrice'])} ${getResourceDataObject('compounds', ['concrete', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'storage',
                null,
                'water',
                null,
                false,
                'water',
                null,
                'compound'
            );
            optionContentElement.appendChild(waterIncreaseStorageRow);
        
            const waterAutoBuyer1Row = createOptionRow(
                'waterAutoBuyer1Row',
                getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
                'Water Auto Buyer Tier 1:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio())} Water /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'waterAB1Quantity', 'autoBuyer', true, 'tier1', 'water', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'water', true, 'tier1', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'waterAB1Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('water1Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['water', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${autobuyer1Price + " " + getResourceDataObject('compounds', ['water', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'water',
                'tier1',
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(waterAutoBuyer1Row);
        
            const waterAutoBuyer2Row = createOptionRow(
                'waterAutoBuyer2Row',
                getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
                'Water Auto Buyer Tier 2:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio())} Water /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'waterAB2Quantity', 'autoBuyer', true, 'tier2', 'water', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'water', true, 'tier2', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'waterAB2Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('water2Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['water', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${autobuyer2Price + " " + getResourceDataObject('compounds', ['water', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'water',
                'tier2',
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(waterAutoBuyer2Row);
        
            const waterAutoBuyer3Row = createOptionRow(
                'waterAutoBuyer3Row',
                getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
                'Water Auto Buyer Tier 3:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio())} Water /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'waterAB3Quantity', 'autoBuyer', true, 'tier3', 'water', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'water', true, 'tier3', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'waterAB3Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('water3Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['water', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${autobuyer3Price + " " + getResourceDataObject('compounds', ['water', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'water',
                'tier3',
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(waterAutoBuyer3Row);
        
            const waterAutoBuyer4Row = createOptionRow(
                'waterAutoBuyer4Row',
                getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
                'Water Auto Buyer Tier 4:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio())} Water /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'waterAB4Quantity', 'autoBuyer', true, 'tier4', 'water', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'water', true, 'tier4', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['water', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'waterAB4Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('water4Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['water', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${autobuyer4Price + " " + getResourceDataObject('compounds', ['water', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'water',
                'tier4',
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(waterAutoBuyer4Row);
        }
        if (heading === 'Titanium') {
            let storagePrice = getResourceDataObject('compounds', ['titanium', 'storageCapacity']);
            let autobuyer1Price = getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier1', 'price']);
            let autobuyer2Price = getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier2', 'price']);
            let autobuyer3Price = getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier3', 'price']);
            let autobuyer4Price = getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier4', 'price']);
        
            const titaniumCreateRow = createOptionRow(
                'titaniumCreateRow',
                null,
                'Create Titanium:',
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
                createButton('Create', ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'create'], () => {
                    handleCompoundCreate('titanium');
                    setAchievementFlagArray('createTitanium', 'add');
                }, 'createCompound', null, null, null, 'titanium', true, null, 'compound'),
                createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                createToggleSwitch('autoCreateToggle', false, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['titanium', 'autoCreate']);
                }, ['toggle-switch-spacing']),
                null,
                `${getCompoundCreatePreview('titanium')}`,
                null,
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(titaniumCreateRow);
        
            const titaniumSellRow = createOptionRow(
                'titaniumSellRow',
                null,
                'Sell Titanium:',
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
                createButton('Sell', ['option-button', 'red-disabled-text', 'compound-cost-sell-check', 'sell'], () => {
                    sellCompound('titanium');
                }, 'sellCompound', null, null, null, 'titanium', true, null, 'compound'),
                createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
                createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['titanium', 'autoSell']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${getCompoundSalePreview('titanium')}`,
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(titaniumSellRow);
            const toggleSwitch = titaniumSellRow.querySelector('#autoSellToggle');
            if (toggleSwitch) {
                toggleSwitch.setAttribute('data-type', 'compounds');
            }
        
            const titaniumIncreaseStorageRow = createOptionRow(
                'titaniumIncreaseStorageRow',
                null,
                'Increase Storage:',
                createButton('Increase Storage', ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    increaseResourceStorage(['titaniumQuantity'], ['titanium'], ['compounds']);
                    storagePrice = getResourceDataObject('compounds', ['titanium', 'storageCapacity']) - 1;
                }, 'upgradeCheck', '', 'storage', null, 'titanium', true, null, 'compound'),
                null,
                null,
                null,
                null,
                `${storagePrice + " " + getResourceDataObject('compounds', ['titanium', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'storage',
                null,
                'titanium',
                null,
                false,
                'titanium',
                null,
                'compound'
            );
            optionContentElement.appendChild(titaniumIncreaseStorageRow);
        
            const titaniumAutoBuyer1Row = createOptionRow(
                'titaniumAutoBuyer1Row',
                getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
                'Titanium Auto Buyer Tier 1:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio())} Titanium /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'titaniumAB1Quantity', 'autoBuyer', true, 'tier1', 'titanium', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'titanium', true, 'tier1', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'titaniumAB1Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('titanium1Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier1', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${autobuyer1Price + " " + getResourceDataObject('compounds', ['titanium', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'titanium',
                'tier1',
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(titaniumAutoBuyer1Row);
        
            const titaniumAutoBuyer2Row = createOptionRow(
                'titaniumAutoBuyer2Row',
                getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
                'Titanium Auto Buyer Tier 2:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio())} Titanium /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'titaniumAB2Quantity', 'autoBuyer', true, 'tier2', 'titanium', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'titanium', true, 'tier2', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'titaniumAB2Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('titanium2Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier2', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${autobuyer2Price + " " + getResourceDataObject('compounds', ['titanium', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'titanium',
                'tier2',
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(titaniumAutoBuyer2Row);
        
            const titaniumAutoBuyer3Row = createOptionRow(
                'titaniumAutoBuyer3Row',
                getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
                'Titanium Auto Buyer Tier 3:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio())} Titanium /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'titaniumAB3Quantity', 'autoBuyer', true, 'tier3', 'titanium', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'titanium', true, 'tier3', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'titaniumAB3Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('titanium3Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier3', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${autobuyer3Price + " " + getResourceDataObject('compounds', ['titanium', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'titanium',
                'tier3',
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(titaniumAutoBuyer3Row);
        
            const titaniumAutoBuyer4Row = createOptionRow(
                'titaniumAutoBuyer4Row',
                getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
                'Titanium Auto Buyer Tier 4:',
                createButton(`Add ${Math.floor(getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio())} Titanium /s`, ['option-button', 'red-disabled-text', 'compound-cost-sell-check'], () => {
                    gain(1, 'titaniumAB4Quantity', 'autoBuyer', true, 'tier4', 'titanium', 'compounds')
                }, 'upgradeCheck', '', 'autoBuyer', null, 'titanium', true, 'tier4', 'compound'),
                createTextElement(`Quantity: ${getResourceDataObject('compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'titaniumAB4Quantity', ['autoBuyer-building-quantity']),
                createToggleSwitch('titanium4Toggle', true, (isEnabled) => {
                    setResourceDataObject(isEnabled, 'compounds', ['titanium', 'upgrades', 'autoBuyer', 'tier4', 'active']);
                }, ['toggle-switch-spacing']),
                null,
                null,
                `${autobuyer4Price + " " + getResourceDataObject('compounds', ['titanium', 'nameResource'])}`,
                '',
                'upgradeCheck',
                'autoBuyer',
                null,
                'titanium',
                'tier4',
                false,
                null,
                null,
                'compound'
            );
            optionContentElement.appendChild(titaniumAutoBuyer4Row);
        }        
}