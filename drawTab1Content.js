import { getLastSellResourceCompoundDropdownOption, setLastSellResourceCompoundDropdownOption, getResourceSalePreview, getTimerRateRatio } from './constantsAndGlobalVars.js';
import { sellResource, fuseResource, gain, increaseResourceStorage } from './game.js';
import { getResourceDataObject, setResourceDataObject } from './resourceDataObject.js';
import { createToggleSwitch, createTextElement, createOptionRow, createDropdown, createButton, removeTabAttentionIfNoIndicators, disableStorageNotificationActionIfShowing } from './ui.js';

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

        const hydrogenSellRow = createOptionRow(
            'hydrogenSellRow',
            null,
            'Sell Hydrogen:',
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
            createButton('Sell', ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'sell'], () => {
                sellResource('hydrogen');
            }, 'sellResource', null, null, null, 'hydrogen', true, null, 'resource'),
            createButton('Fuse', ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'fuse'], (event) => {
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
            }, 'fuseResource', null, 'hydrogen', 'helium', 'hydrogen', true, null, 'resource'),
            createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
            createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['hydrogen', 'autoSell']);
            }, ['toggle-switch-spacing']),
            `${getResourceSalePreview('hydrogen')}`,
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(hydrogenSellRow);
        const toggleSwitch = hydrogenSellRow.querySelector('#autoSellToggle');
        if (toggleSwitch) {
            toggleSwitch.setAttribute('data-type', 'resources');
        }

        const hydrogenGainRow = createOptionRow(
            'hydrogenGainRow',
            null,
            'Gain 1 Hydrogen:',
            createButton('Gain', ['option-button'], () => {
                gain(1, 'hydrogenQuantity', null, false, null, 'hydrogen', 'resources');
            }, null, null, null, null, null, true, null, 'resource'), //set false to true out of development to stop fast gains by holding enter
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(hydrogenGainRow);

        const hydrogenIncreaseStorageRow = createOptionRow(
            'hydrogenIncreaseStorageRow',
            null,
            'Increase Storage:',
            createButton('Increase Storage', ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                increaseResourceStorage(['hydrogenQuantity'], ['hydrogen'], ['resources']);
                disableStorageNotificationActionIfShowing('hydrogen', 'Already Increased!');
                storagePrice = getResourceDataObject('resources', ['hydrogen', 'storageCapacity']) - 1;
            }, 'upgradeCheck', '', 'storage', null, 'hydrogen', true, null, 'resource'),
            null,
            null,
            null,
            null,
            `${storagePrice + " " + getResourceDataObject('resources', ['hydrogen', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'storage',
            null,
            'hydrogen',
            null,
            false,
            'hydrogen',
            null,
            'resource'
        );
        optionContentElement.appendChild(hydrogenIncreaseStorageRow);

        const hydrogenAutoBuyer1Row = createOptionRow(
            'hydrogenAutoBuyer1Row',
            getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
            'Hydrogen Auto Buyer Tier 1:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio())} Hydrogen /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'hydrogenAB1Quantity', 'autoBuyer', true, 'tier1', 'hydrogen', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'hydrogen', true, 'tier1', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'hydrogenAB1Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('hydrogen1Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer1Price + " " + getResourceDataObject('resources', ['hydrogen', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'hydrogen',
            'tier1',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(hydrogenAutoBuyer1Row);

        const hydrogenAutoBuyer2Row = createOptionRow(
            'hydrogenAutoBuyer2Row',
            getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
            'Hydrogen Auto Buyer Tier 2:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio())} Hydrogen /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'hydrogenAB2Quantity', 'autoBuyer', true, 'tier2', 'hydrogen', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'hydrogen', true, 'tier2', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'hydrogenAB2Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('hydrogen2Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier2', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer2Price + " " + getResourceDataObject('resources', ['hydrogen', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'hydrogen',
            'tier2',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(hydrogenAutoBuyer2Row);

        const hydrogenAutoBuyer3Row = createOptionRow(
            'hydrogenAutoBuyer3Row',
            getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
            'Hydrogen Auto Buyer Tier 3:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio())} Hydrogen /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'hydrogenAB3Quantity', 'autoBuyer', true, 'tier3', 'hydrogen', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'hydrogen', true, 'tier3', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'hydrogenAB3Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('hydrogen3Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier3', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer3Price + " " + getResourceDataObject('resources', ['hydrogen', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'hydrogen',
            'tier3',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(hydrogenAutoBuyer3Row);

        const hydrogenAutoBuyer4Row = createOptionRow(
            'hydrogenAutoBuyer4Row',
            getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
            'Hydrogen Auto Buyer Tier 4:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio())} Hydrogen /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'hydrogenAB4Quantity', 'autoBuyer', true, 'tier4', 'hydrogen', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'hydrogen', true, 'tier4', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'hydrogenAB4Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('hydrogen4Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier4', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer4Price + " " + getResourceDataObject('resources', ['hydrogen', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'hydrogen',
            'tier4',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(hydrogenAutoBuyer4Row);
    }
    else if (heading === 'Helium') {
        let storagePrice = getResourceDataObject('resources', ['helium', 'storageCapacity']);
        let autobuyer1Price = getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier1', 'price']);
        let autobuyer2Price = getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier2', 'price']);
        let autobuyer3Price = getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier3', 'price']);
        let autobuyer4Price = getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier4', 'price']);

        const heliumSellRow = createOptionRow(
            'heliumSellRow',
            null,
            'Sell Helium:',
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
            createButton('Sell', ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'sell'], () => {
                sellResource('helium');
            }, 'sellResource', null, null, null, 'helium', true, null, 'resource'),
            createButton('Fuse', ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'fuse'], (event) => {
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
            }, 'fuseResource', null, 'helium', 'carbon', 'helium', true, null, 'resource'),
            createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
            createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['helium', 'autoSell']);
            }, ['toggle-switch-spacing']),
            null,
            `${getResourceSalePreview('helium')}`,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(heliumSellRow);
        const toggleSwitch = heliumSellRow.querySelector('#autoSellToggle');
        if (toggleSwitch) {
            toggleSwitch.setAttribute('data-type', 'resources');
        }

        const heliumGainRow = createOptionRow(
            'heliumGainRow',
            null,
            'Gain 1 Helium:',
            createButton('Gain', ['option-button'], () => {
                gain(1, 'heliumQuantity', null, false, null, 'helium', 'resources');
            }, null, null, null, null, null, true, null, 'resource'), //set false to true out of development to stop fast gains by holding enter
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(heliumGainRow);

        const heliumIncreaseStorageRow = createOptionRow(
            'heliumIncreaseStorageRow',
            null,
            'Increase Storage:',
            createButton('Increase Storage', ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                increaseResourceStorage(['heliumQuantity'], ['helium'], ['resources']);
                disableStorageNotificationActionIfShowing('helium', 'Already Increased!');
                storagePrice = getResourceDataObject('resources', ['helium', 'storageCapacity']) - 1;
            }, 'upgradeCheck', '', 'storage', null, 'helium', true, null, 'resource'),
            null,
            null,
            null,
            null,
            `${storagePrice + " " + getResourceDataObject('resources', ['helium', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'storage',
            null,
            'helium',
            null,
            false,
            'helium',
            null,
            'resource'
        );
        optionContentElement.appendChild(heliumIncreaseStorageRow);

        const heliumAutoBuyer1Row = createOptionRow(
            'heliumAutoBuyer1Row',
            getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
            'Helium Auto Buyer Tier 1:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio())} Helium /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'heliumAB1Quantity', 'autoBuyer', true, 'tier1', 'helium', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'helium', true, 'tier1', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'heliumAB1Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('helium1Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['helium', 'upgrades', 'autoBuyer', 'tier1', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer1Price + " " + getResourceDataObject('resources', ['helium', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'helium',
            'tier1',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(heliumAutoBuyer1Row);

        const heliumAutoBuyer2Row = createOptionRow(
            'heliumAutoBuyer2Row',
            getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
            'Helium Auto Buyer Tier 2:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio())} Helium /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'heliumAB2Quantity', 'autoBuyer', true, 'tier2', 'helium', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'helium', true, 'tier2', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'heliumAB2Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('helium2Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['helium', 'upgrades', 'autoBuyer', 'tier2', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer2Price + " " + getResourceDataObject('resources', ['helium', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'helium',
            'tier2',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(heliumAutoBuyer2Row);

        const heliumAutoBuyer3Row = createOptionRow(
            'heliumAutoBuyer3Row',
            getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
            'Helium Auto Buyer Tier 3:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio())} Helium /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'heliumAB3Quantity', 'autoBuyer', true, 'tier3', 'helium', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'helium', true, 'tier3', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'heliumAB3Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('helium3Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['helium', 'upgrades', 'autoBuyer', 'tier3', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer3Price + " " + getResourceDataObject('resources', ['helium', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'helium',
            'tier3',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(heliumAutoBuyer3Row);

        const heliumAutoBuyer4Row = createOptionRow(
            'heliumAutoBuyer4Row',
            getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
            'Helium Auto Buyer Tier 4:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio())} Helium /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'heliumAB4Quantity', 'autoBuyer', true, 'tier4', 'helium', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'helium', true, 'tier4', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['helium', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'heliumAB4Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('helium4Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['helium', 'upgrades', 'autoBuyer', 'tier4', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer4Price + " " + getResourceDataObject('resources', ['helium', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'helium',
            'tier4',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(heliumAutoBuyer4Row);
    }

    else if (heading === 'Carbon') {
        let storagePrice = getResourceDataObject('resources', ['carbon', 'storageCapacity']);
        let autobuyer1Price = getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier1', 'price']);
        let autobuyer2Price = getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier2', 'price']);
        let autobuyer3Price = getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier3', 'price']);
        let autobuyer4Price = getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier4', 'price']);

        const carbonSellRow = createOptionRow(
            'carbonSellRow',
            null,
            'Sell Carbon:',
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
            createButton('Sell', ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'sell'], () => {
                sellResource('carbon');
            }, 'sellResource', null, null, null, 'carbon', true, null, 'resource'),
            createButton('Fuse', ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'fuse'], (event) => {
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
            }, 'fuseResource', null, 'carbon', 'neon', 'carbon', true, null, 'resource'),
            createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
            createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['carbon', 'autoSell']);
            }, ['toggle-switch-spacing']),
            null,
            `${getResourceSalePreview('neon')}`,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(carbonSellRow);
        const toggleSwitch = carbonSellRow.querySelector('#autoSellToggle');
        if (toggleSwitch) {
            toggleSwitch.setAttribute('data-type', 'resources');
        }

        const carbonGainRow = createOptionRow(
            'carbonGainRow',
            null,
            'Gain 1 Carbon:',
            createButton('Gain', ['option-button'], () => {
                gain(1, 'carbonQuantity', null, false, null, 'carbon', 'resources');
            }, null, null, null, null, null, true, null, 'resource'),
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(carbonGainRow);

        const carbonIncreaseStorageRow = createOptionRow(
            'carbonIncreaseStorageRow',
            null,
            'Increase Storage:',
            createButton('Increase Storage', ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                increaseResourceStorage(['carbonQuantity'], ['carbon'], ['resources']);
                disableStorageNotificationActionIfShowing('carbon', 'Already Increased!');
                storagePrice = getResourceDataObject('resources', ['carbon', 'storageCapacity']) - 1;
            }, 'upgradeCheck', '', 'storage', null, 'carbon', true, null, 'resource'),
            null,
            null,
            null,
            null,
            `${storagePrice + " " + getResourceDataObject('resources', ['carbon', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'storage',
            null,
            'carbon',
            null,
            false,
            'carbon',
            null,
            'resource'
        );
        optionContentElement.appendChild(carbonIncreaseStorageRow);

        const carbonAutoBuyer1Row = createOptionRow(
            'carbonAutoBuyer1Row',
            getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
            'Carbon Auto Buyer Tier 1:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio())} Carbon /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'carbonAB1Quantity', 'autoBuyer', true, 'tier1', 'carbon', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'carbon', true, 'tier1', 'resource'),            
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'carbonAB1Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('carbon1Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['carbon', 'upgrades', 'autoBuyer', 'tier1', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer1Price + " " + getResourceDataObject('resources', ['carbon', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'carbon',
            'tier1',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(carbonAutoBuyer1Row);

        const carbonAutoBuyer2Row = createOptionRow(
            'carbonAutoBuyer2Row',
            getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
            'Carbon Auto Buyer Tier 2:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio())} Carbon /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'carbonAB2Quantity', 'autoBuyer', true, 'tier2', 'carbon', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'carbon', true, 'tier2', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'carbonAB2Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('carbon2Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['carbon', 'upgrades', 'autoBuyer', 'tier2', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer2Price + " " + getResourceDataObject('resources', ['carbon', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'carbon',
            'tier2',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(carbonAutoBuyer2Row);

        const carbonAutoBuyer3Row = createOptionRow(
            'carbonAutoBuyer3Row',
            getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
            'Carbon Auto Buyer Tier 3:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio())} Carbon /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'carbonAB3Quantity', 'autoBuyer', true, 'tier3', 'carbon', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'carbon', true, 'tier3', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'carbonAB3Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('carbon3Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['carbon', 'upgrades', 'autoBuyer', 'tier3', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer3Price + " " + getResourceDataObject('resources', ['carbon', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'carbon',
            'tier3',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(carbonAutoBuyer3Row);

        const carbonAutoBuyer4Row = createOptionRow(
            'carbonAutoBuyer4Row',
            getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
            'Carbon Auto Buyer Tier 4:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio())} Carbon /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'carbonAB4Quantity', 'autoBuyer', true, 'tier4', 'carbon', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'carbon', true, 'tier4', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['carbon', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'carbonAB4Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('carbon4Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['carbon', 'upgrades', 'autoBuyer', 'tier4', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer4Price + " " + getResourceDataObject('resources', ['carbon', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'carbon',
            'tier4',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(carbonAutoBuyer4Row);
    } 
    
    else if (heading === 'Neon') {
        let storagePrice = getResourceDataObject('resources', ['neon', 'storageCapacity']);
        let autobuyer1Price = getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier1', 'price']);
        let autobuyer2Price = getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier2', 'price']);
        let autobuyer3Price = getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier3', 'price']);
        let autobuyer4Price = getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier4', 'price']);

        const neonSellRow = createOptionRow(
            'neonSellRow',
            null,
            'Sell Neon:',
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
            createButton('Sell', ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'sell'], () => {
                sellResource('neon');
            }, 'sellResource', null, null, null, 'neon', true, null, 'resource'),
            createButton('Fuse', ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'fuse'], (event) => {
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
            }, 'fuseResource', null, 'neon', 'oxygen', 'neon', true, null, 'resource'),
            createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
            createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['neon', 'autoSell']);
            }, ['toggle-switch-spacing']),
            null,
            `${getResourceSalePreview('neon')}`,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(neonSellRow);
        const toggleSwitch = neonSellRow.querySelector('#autoSellToggle');
        if (toggleSwitch) {
            toggleSwitch.setAttribute('data-type', 'resources');
        }

        const neonGainRow = createOptionRow(
            'neonGainRow',
            null,
            'Gain 1 Neon:',
            createButton('Gain', ['option-button'], () => {
                gain(1, 'neonQuantity', null, false, null, 'neon', 'resources');
            }, null, null, null, null, null, true, null, 'resource'),
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(neonGainRow);

        const neonIncreaseStorageRow = createOptionRow(
            'neonIncreaseStorageRow',
            null,
            'Increase Storage:',
            createButton('Increase Storage', ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                increaseResourceStorage(['neonQuantity'], ['neon'], ['resources']);
                disableStorageNotificationActionIfShowing('neon', 'Already Increased!');
                storagePrice = getResourceDataObject('resources', ['neon', 'storageCapacity']) - 1;
            }, 'upgradeCheck', '', 'storage', null, 'neon', true, null, 'resource'),
            null,
            null,
            null,
            null,
            `${storagePrice + " " + getResourceDataObject('resources', ['neon', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'storage',
            null,
            'neon',
            null,
            false,
            'neon',
            null,
            'resource'
        );
        optionContentElement.appendChild(neonIncreaseStorageRow);

        const neonAutoBuyer1Row = createOptionRow(
            'neonAutoBuyer1Row',
            getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
            'Neon Auto Buyer Tier 1:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio())} Neon /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'neonAB1Quantity', 'autoBuyer', true, 'tier1', 'neon', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'neon', true, 'tier1', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'neonAB1Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('neon1Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['neon', 'upgrades', 'autoBuyer', 'tier1', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer1Price + " " + getResourceDataObject('resources', ['neon', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'neon',
            'tier1',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(neonAutoBuyer1Row);

        const neonAutoBuyer2Row = createOptionRow(
            'neonAutoBuyer2Row',
            getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
            'Neon Auto Buyer Tier 2:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio())} Neon /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'neonAB2Quantity', 'autoBuyer', true, 'tier2', 'neon', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'neon', true, 'tier2', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'neonAB2Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('neon2Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['neon', 'upgrades', 'autoBuyer', 'tier2', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer2Price + " " + getResourceDataObject('resources', ['neon', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'neon',
            'tier2',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(neonAutoBuyer2Row);

        const neonAutoBuyer3Row = createOptionRow(
            'neonAutoBuyer3Row',
            getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
            'Neon Auto Buyer Tier 3:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio())} Neon /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'neonAB3Quantity', 'autoBuyer', true, 'tier3', 'neon', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'neon', true, 'tier3', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'neonAB3Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('neon3Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['neon', 'upgrades', 'autoBuyer', 'tier3', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer3Price + " " + getResourceDataObject('resources', ['neon', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'neon',
            'tier3',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(neonAutoBuyer3Row);

        const neonAutoBuyer4Row = createOptionRow(
            'neonAutoBuyer4Row',
            getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
            'Neon Auto Buyer Tier 4:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio())} Neon /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'neonAB4Quantity', 'autoBuyer', true, 'tier4', 'neon', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'neon', true, 'tier4', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['neon', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'neonAB4Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('neon4Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['neon', 'upgrades', 'autoBuyer', 'tier4', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer4Price + " " + getResourceDataObject('resources', ['neon', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'neon',
            'tier4',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(neonAutoBuyer4Row);
    }
    
    else if (heading === 'Oxygen') {
        let storagePrice = getResourceDataObject('resources', ['oxygen', 'storageCapacity']);
        let autobuyer1Price = getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier1', 'price']);
        let autobuyer2Price = getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier2', 'price']);
        let autobuyer3Price = getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier3', 'price']);
        let autobuyer4Price = getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier4', 'price']);

        const oxygenSellRow = createOptionRow(
            'oxygenSellRow',
            null,
            'Sell Oxygen:',
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
            createButton('Sell', ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'sell'], () => {
                sellResource('oxygen');
            }, 'sellResource', null, null, null, 'oxygen', true, null, 'resource'),
            createButton('Fuse', ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'fuse'], (event) => {
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
            }, 'fuseResource', null, 'oxygen', 'silicon', 'oxygen', true, null, 'resource'),
            createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
            createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['oxygen', 'autoSell']);
            }, ['toggle-switch-spacing']),
            null,
            `${getResourceSalePreview('oxygen')}`,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(oxygenSellRow);
        const toggleSwitch = oxygenSellRow.querySelector('#autoSellToggle');
        if (toggleSwitch) {
            toggleSwitch.setAttribute('data-type', 'resources');
        }

        const oxygenGainRow = createOptionRow(
            'oxygenGainRow',
            null,
            'Gain 1 Oxygen:',
            createButton('Gain', ['option-button'], () => {
                gain(1, 'oxygenQuantity', null, false, null, 'oxygen', 'resources');
            }, null, null, null, null, null, true, null, 'resource'), //set false to true out of development to stop fast gains by holding enter
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(oxygenGainRow);

        const oxygenIncreaseStorageRow = createOptionRow(
            'oxygenIncreaseStorageRow',
            null,
            'Increase Storage:',
            createButton('Increase Storage', ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                increaseResourceStorage(['oxygenQuantity'], ['oxygen'], ['resources']);
                disableStorageNotificationActionIfShowing('oxygen', 'Already Increased!');
                storagePrice = getResourceDataObject('resources', ['oxygen', 'storageCapacity']) - 1;
            }, 'upgradeCheck', '', 'storage', null, 'oxygen', true, null, 'resource'),
            null,
            null,
            null,
            null,
            `${storagePrice + " " + getResourceDataObject('resources', ['oxygen', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'storage',
            null,
            'oxygen',
            null,
            false,
            'oxygen',
            null,
            'resource'
        );
        optionContentElement.appendChild(oxygenIncreaseStorageRow);

        const oxygenAutoBuyer1Row = createOptionRow(
            'oxygenAutoBuyer1Row',
            getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
            'Oxygen Auto Buyer Tier 1:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio())} Oxygen /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'oxygenAB1Quantity', 'autoBuyer', true, 'tier1', 'oxygen', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'oxygen', true, 'tier1', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'oxygenAB1Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('oxygen1Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier1', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer1Price + " " + getResourceDataObject('resources', ['oxygen', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'oxygen',
            'tier1',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(oxygenAutoBuyer1Row);

        const oxygenAutoBuyer2Row = createOptionRow(
            'oxygenAutoBuyer2Row',
            getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
            'Oxygen Auto Buyer Tier 2:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio())} Oxygen /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'oxygenAB2Quantity', 'autoBuyer', true, 'tier2', 'oxygen', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'oxygen', true, 'tier2', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'oxygenAB2Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('oxygen2Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier2', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer2Price + " " + getResourceDataObject('resources', ['oxygen', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'oxygen',
            'tier2',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(oxygenAutoBuyer2Row);

        const oxygenAutoBuyer3Row = createOptionRow(
            'oxygenAutoBuyer3Row',
            getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
            'Oxygen Auto Buyer Tier 3:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio())} Oxygen /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'oxygenAB3Quantity', 'autoBuyer', true, 'tier3', 'oxygen', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'oxygen', true, 'tier3', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'oxygenAB3Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('oxygen3Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier3', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer3Price + " " + getResourceDataObject('resources', ['oxygen', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'oxygen',
            'tier3',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(oxygenAutoBuyer3Row);

        const oxygenAutoBuyer4Row = createOptionRow(
            'oxygenAutoBuyer4Row',
            getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
            'Oxygen Auto Buyer Tier 4:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio())} Oxygen /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'oxygenAB4Quantity', 'autoBuyer', true, 'tier4', 'oxygen', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'oxygen', true, 'tier4', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'oxygenAB4Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('oxygen4Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['oxygen', 'upgrades', 'autoBuyer', 'tier4', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer4Price + " " + getResourceDataObject('resources', ['oxygen', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'oxygen',
            'tier4',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(oxygenAutoBuyer4Row);
    }
    
    else if (heading === 'Sodium') {
        let storagePrice = getResourceDataObject('resources', ['sodium', 'storageCapacity']);
        let autobuyer1Price = getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier1', 'price']);
        let autobuyer2Price = getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier2', 'price']);
        let autobuyer3Price = getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier3', 'price']);
        let autobuyer4Price = getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier4', 'price']);

        const sodiumSellRow = createOptionRow(
            'sodiumSellRow',
            null,
            'Sell Sodium:',
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
            createButton('Sell', ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'sell'], () => {
                sellResource('sodium');
            }, 'sellResource', null, null, null, 'sodium', true, null, 'resource'),
            createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
            createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['sodium', 'autoSell']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${getResourceSalePreview('sodium')}`,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(sodiumSellRow);
        const toggleSwitch = sodiumSellRow.querySelector('#autoSellToggle');
        if (toggleSwitch) {
            toggleSwitch.setAttribute('data-type', 'resources');
        }

        const sodiumGainRow = createOptionRow(
            'sodiumGainRow',
            null,
            'Gain 1 Sodium:',
            createButton('Gain', ['option-button'], () => {
                gain(1, 'sodiumQuantity', null, false, null, 'sodium', 'resources');
            }, null, null, null, null, null, true, null, 'resource'), //set false to true out of development to stop fast gains by holding enter
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(sodiumGainRow);

        const sodiumIncreaseStorageRow = createOptionRow(
            'sodiumIncreaseStorageRow',
            null,
            'Increase Storage:',
            createButton('Increase Storage', ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                increaseResourceStorage(['sodiumQuantity'], ['sodium'], ['resources']);
                disableStorageNotificationActionIfShowing('sodium', 'Already Increased!');
                storagePrice = getResourceDataObject('resources', ['sodium', 'storageCapacity']) - 1;
            }, 'upgradeCheck', '', 'storage', null, 'sodium', true, null, 'resource'),
            null,
            null,
            null,
            null,
            `${storagePrice + " " + getResourceDataObject('resources', ['sodium', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'storage',
            null,
            'sodium',
            null,
            false,
            'sodium',
            null,
            'resource'
        );
        optionContentElement.appendChild(sodiumIncreaseStorageRow);

        const sodiumAutoBuyer1Row = createOptionRow(
            'sodiumAutoBuyer1Row',
            getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
            'Sodium Auto Buyer Tier 1:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio())} Sodium /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'sodiumAB1Quantity', 'autoBuyer', true, 'tier1', 'sodium', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'sodium', true, 'tier1', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'sodiumAB1Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('sodium1Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['sodium', 'upgrades', 'autoBuyer', 'tier1', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer1Price + " " + getResourceDataObject('resources', ['sodium', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'sodium',
            'tier1',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(sodiumAutoBuyer1Row);

        const sodiumAutoBuyer2Row = createOptionRow(
            'sodiumAutoBuyer2Row',
            getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
            'Sodium Auto Buyer Tier 2:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio())} Sodium /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'sodiumAB2Quantity', 'autoBuyer', true, 'tier2', 'sodium', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'sodium', true, 'tier2', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'sodiumAB2Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('sodium2Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['sodium', 'upgrades', 'autoBuyer', 'tier2', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer2Price + " " + getResourceDataObject('resources', ['sodium', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'sodium',
            'tier2',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(sodiumAutoBuyer2Row);

        const sodiumAutoBuyer3Row = createOptionRow(
            'sodiumAutoBuyer3Row',
            getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
            'Sodium Auto Buyer Tier 3:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio())} Sodium /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'sodiumAB3Quantity', 'autoBuyer', true, 'tier3', 'sodium', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'sodium', true, 'tier3', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'sodiumAB3Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('sodium3Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['sodium', 'upgrades', 'autoBuyer', 'tier3', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer3Price + " " + getResourceDataObject('resources', ['sodium', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'sodium',
            'tier3',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(sodiumAutoBuyer3Row);

        const sodiumAutoBuyer4Row = createOptionRow(
            'sodiumAutoBuyer4Row',
            getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
            'Sodium Auto Buyer Tier 4:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio())} Sodium /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'sodiumAB4Quantity', 'autoBuyer', true, 'tier4', 'sodium', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'sodium', true, 'tier4', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['sodium', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'sodiumAB4Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('sodium4Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['sodium', 'upgrades', 'autoBuyer', 'tier4', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer4Price + " " + getResourceDataObject('resources', ['sodium', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'sodium',
            'tier4',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(sodiumAutoBuyer4Row);
    } 
    
    else if (heading === 'Silicon') {
        let storagePrice = getResourceDataObject('resources', ['silicon', 'storageCapacity']);
        let autobuyer1Price = getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier1', 'price']);
        let autobuyer2Price = getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier2', 'price']);
        let autobuyer3Price = getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier3', 'price']);
        let autobuyer4Price = getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier4', 'price']);

        const siliconSellRow = createOptionRow(
            'siliconSellRow',
            null,
            'Sell Silicon:',
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
            createButton('Sell', ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'sell'], () => {
                sellResource('silicon');
            }, 'sellResource', null, null, null, 'silicon', true, null, 'resource'),
            createButton('Fuse', ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'fuse'], (event) => {
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
            }, 'fuseResource', null, 'silicon', 'iron', 'silicon', true, null, 'resource'),
            createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
            createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['silicon', 'autoSell']);
            }, ['toggle-switch-spacing']),
            null,
            `${getResourceSalePreview('silicon')}`,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(siliconSellRow);
        const toggleSwitch = siliconSellRow.querySelector('#autoSellToggle');
        if (toggleSwitch) {
            toggleSwitch.setAttribute('data-type', 'resources');
        }

        const siliconGainRow = createOptionRow(
            'siliconGainRow',
            null,
            'Gain 1 Silicon:',
            createButton('Gain', ['option-button'], () => {
                gain(1, 'siliconQuantity', null, false, null, 'silicon', 'resources');
            }, null, null, null, null, null, true, null, 'resource'), //set false to true out of development to stop fast gains by holding enter
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(siliconGainRow);

        const siliconIncreaseStorageRow = createOptionRow(
            'siliconIncreaseStorageRow',
            null,
            'Increase Storage:',
            createButton('Increase Storage', ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                increaseResourceStorage(['siliconQuantity'], ['silicon'], ['resources']);
                disableStorageNotificationActionIfShowing('silicon', 'Already Increased!');
                storagePrice = getResourceDataObject('resources', ['silicon', 'storageCapacity']) - 1;
            }, 'upgradeCheck', '', 'storage', null, 'silicon', true, null, 'resource'),
            null,
            null,
            null,
            null,
            `${storagePrice + " " + getResourceDataObject('resources', ['silicon', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'storage',
            null,
            'silicon',
            null,
            false,
            'silicon',
            null,
            'resource'
        );
        optionContentElement.appendChild(siliconIncreaseStorageRow);

        const siliconAutoBuyer1Row = createOptionRow(
            'siliconAutoBuyer1Row',
            getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
            'Silicon Auto Buyer Tier 1:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio())} Silicon /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'siliconAB1Quantity', 'autoBuyer', true, 'tier1', 'silicon', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'silicon', true, 'tier1', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'siliconAB1Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('silicon1Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['silicon', 'upgrades', 'autoBuyer', 'tier1', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer1Price + " " + getResourceDataObject('resources', ['silicon', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'silicon',
            'tier1',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(siliconAutoBuyer1Row);

        const siliconAutoBuyer2Row = createOptionRow(
            'siliconAutoBuyer2Row',
            getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
            'Silicon Auto Buyer Tier 2:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio())} Silicon /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'siliconAB2Quantity', 'autoBuyer', true, 'tier2', 'silicon', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'silicon', true, 'tier2', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'siliconAB2Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('silicon2Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['silicon', 'upgrades', 'autoBuyer', 'tier2', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer2Price + " " + getResourceDataObject('resources', ['silicon', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'silicon',
            'tier2',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(siliconAutoBuyer2Row);

        const siliconAutoBuyer3Row = createOptionRow(
            'siliconAutoBuyer3Row',
            getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
            'Silicon Auto Buyer Tier 3:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio())} Silicon /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'siliconAB3Quantity', 'autoBuyer', true, 'tier3', 'silicon', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'silicon', true, 'tier3', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'siliconAB3Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('silicon3Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['silicon', 'upgrades', 'autoBuyer', 'tier3', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer3Price + " " + getResourceDataObject('resources', ['silicon', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'silicon',
            'tier3',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(siliconAutoBuyer3Row);

        const siliconAutoBuyer4Row = createOptionRow(
            'siliconAutoBuyer4Row',
            getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
            'Silicon Auto Buyer Tier 4:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio())} Silicon /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'siliconAB4Quantity', 'autoBuyer', true, 'tier4', 'silicon', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'silicon', true, 'tier4', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['silicon', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'siliconAB4Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('silicon4Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['silicon', 'upgrades', 'autoBuyer', 'tier4', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer4Price + " " + getResourceDataObject('resources', ['silicon', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'silicon',
            'tier4',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(siliconAutoBuyer4Row);
    }

    else if (heading === 'Iron') {
        let storagePrice = getResourceDataObject('resources', ['iron', 'storageCapacity']);
        let autobuyer1Price = getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'price']);
        let autobuyer2Price = getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier2', 'price']);
        let autobuyer3Price = getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier3', 'price']);
        let autobuyer4Price = getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier4', 'price']);

        const ironSellRow = createOptionRow(
            'ironSellRow',
            null,
            'Sell Iron:',
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
            createButton('Sell', ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'sell'], () => {
                sellResource('iron');
            }, 'sellResource', null, null, null, 'iron', true, null, 'resource'),
            createTextElement(`Auto:`, '', ['autoBuyer-building-quantity']),
            createToggleSwitch('autoSellToggle', false, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['iron', 'autoSell']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${getResourceSalePreview('iron')}`,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(ironSellRow);
        const toggleSwitch = ironSellRow.querySelector('#autoSellToggle');
        if (toggleSwitch) {
            toggleSwitch.setAttribute('data-type', 'resources');
        }

        const ironGainRow = createOptionRow(
            'ironGainRow',
            null,
            'Gain 1 Iron:',
            createButton('Gain', ['option-button'], () => {
                gain(1, 'ironQuantity', null, false, null, 'iron', 'resources');
            }, null, null, null, null, null, true, null, 'resource'), //set false to true out of development to stop fast gains by holding enter
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(ironGainRow);

        const ironIncreaseStorageRow = createOptionRow(
            'ironIncreaseStorageRow',
            null,
            'Increase Storage:',
            createButton('Increase Storage', ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                increaseResourceStorage(['ironQuantity'], ['iron'], ['resources']);
                disableStorageNotificationActionIfShowing('iron', 'Already Increased!');
                storagePrice = getResourceDataObject('resources', ['iron', 'storageCapacity']) - 1;
            }, 'upgradeCheck', '', 'storage', null, 'iron', true, null, 'resource'),
            null,
            null,
            null,
            null,
            `${storagePrice + " " + getResourceDataObject('resources', ['iron', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'storage',
            null,
            'iron',
            null,
            false,
            'iron',
            null,
            'resource'
        );
        optionContentElement.appendChild(ironIncreaseStorageRow);

        const ironAutoBuyer1Row = createOptionRow(
            'ironAutoBuyer1Row',
            getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'nameUpgrade']),
            'Iron Auto Buyer Tier 1:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'rate']) * getTimerRateRatio())} Iron /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'ironAB1Quantity', 'autoBuyer', true, 'tier1', 'iron', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'iron', true, 'tier1', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'quantity'])}`, 'ironAB1Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('iron1Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier1', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer1Price + " " + getResourceDataObject('resources', ['iron', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'iron',
            'tier1',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(ironAutoBuyer1Row);

        const ironAutoBuyer2Row = createOptionRow(
            'ironAutoBuyer2Row',
            getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier2', 'nameUpgrade']),
            'Iron Auto Buyer Tier 2:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier2', 'rate']) * getTimerRateRatio())} Iron /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'ironAB2Quantity', 'autoBuyer', true, 'tier2', 'iron', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'iron', true, 'tier2', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier2', 'quantity'])}`, 'ironAB2Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('iron2Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier2', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer2Price + " " + getResourceDataObject('resources', ['iron', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'iron',
            'tier2',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(ironAutoBuyer2Row);

        const ironAutoBuyer3Row = createOptionRow(
            'ironAutoBuyer3Row',
            getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier3', 'nameUpgrade']),
            'Iron Auto Buyer Tier 3:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier3', 'rate']) * getTimerRateRatio())} Iron /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'ironAB3Quantity', 'autoBuyer', true, 'tier3', 'iron', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'iron', true, 'tier3', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier3', 'quantity'])}`, 'ironAB3Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('iron3Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier3', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer3Price + " " + getResourceDataObject('resources', ['iron', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'iron',
            'tier3',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(ironAutoBuyer3Row);

        const ironAutoBuyer4Row = createOptionRow(
            'ironAutoBuyer4Row',
            getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier4', 'nameUpgrade']),
            'Iron Auto Buyer Tier 4:',
            createButton(`Add ${Math.floor(getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier4', 'rate']) * getTimerRateRatio())} Iron /s`, ['option-button', 'red-disabled-text', 'resource-cost-sell-check'], () => {
                gain(1, 'ironAB4Quantity', 'autoBuyer', true, 'tier4', 'iron', 'resources')
            }, 'upgradeCheck', '', 'autoBuyer', null, 'iron', true, 'tier4', 'resource'),
            createTextElement(`Quantity: ${getResourceDataObject('resources', ['iron', 'upgrades', 'autoBuyer', 'tier4', 'quantity'])}`, 'ironAB4Quantity', ['autoBuyer-building-quantity']),
            createToggleSwitch('iron4Toggle', true, (isEnabled) => {
                setResourceDataObject(isEnabled, 'resources', ['iron', 'upgrades', 'autoBuyer', 'tier4', 'active']);
            }, ['toggle-switch-spacing']),
            null,
            null,
            `${autobuyer4Price + " " + getResourceDataObject('resources', ['iron', 'nameResource'])}`,
            '',
            'upgradeCheck',
            'autoBuyer',
            null,
            'iron',
            'tier4',
            false,
            null,
            null,
            'resource'
        );
        optionContentElement.appendChild(ironAutoBuyer4Row);
    }
}
