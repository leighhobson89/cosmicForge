import { removeTabAttentionIfNoIndicators, createOptionRow, createButton, createDropdown, createTextElement, createTextFieldArea, callPopupModal, showHideModal, createMegaStructureDiagram, createMegaStructureTable, createBlackHole } from './ui.js';
import {
    setApLiquidationQuantity,
    setGalacticMarketIncomingQuantity,
    setHasClickedOutgoingOptionGalacticMarket,
    setGalacticMarketOutgoingStockType,
    setGalacticMarketIncomingStockType,
    setGalacticMarketOutgoingQuantitySelectionType,
    setGalacticMarketOutgoingQuantitySelectionTypeDisabledStatus,
    setGalacticMarketSellApForCashQuantity,
    getGalacticMarketSellApForCashQuantity,
    setGalacticMarketLiquidationAuthorization,
    getApLiquidationQuantity,
    getCurrentlyChargingBlackHole,
    getCurrentlyTimeWarpingBlackHole,
    setCurrentlyTimeWarpingBlackHole,
    setCurrentlyChargingBlackHole,
    setCurrentBlackHoleTimeWarpDurationTotal,
    getBlackHoleTimeWarpEndTimestampMs,
    setBlackHoleTimeWarpEndTimestampMs,
    getTimeLeftUntilBlackHoleChargeTimerFinishes,
    setTimeLeftUntilBlackHoleChargeTimerFinishes,
    getBlackHoleChargeReady,
    setBlackHoleChargeReady,
    setCurrentBlackHoleChargeTimerDurationTotal,
    getGameCostMultiplier,
    deferredActions
} from './constantsAndGlobalVars.js';
import { purchaseBuff, galacticMarketLiquidateForAp, galacticMarketSellApForCash, galacticMarketTrade, rebirth, startBlackHoleChargeTimer, timeWarp } from './game.js';
import {
    getAscendencyBuffDataObject,
    getResourceDataObject,
    setResourceDataObject,
    getBlackHoleResearchDone,
    getBlackHoleResearchPrice,
    setBlackHoleResearchDone,
    getBlackHoleDuration,
    setBlackHoleDuration,
    getBlackHolePower,
    setBlackHolePower,
    getBlackHolePowerPrice,
    setBlackHolePowerPrice,
    getBlackHoleDurationPrice,
    setBlackHoleDurationPrice
} from './resourceDataObject.js';
import { capitaliseString } from './utilityFunctions.js';
import { modalRebirthText, modalRebirthHeader } from './descriptions.js';
import { timerManagerDelta } from './timerManagerDelta.js';

export function drawTab7Content(heading, optionContentElement) {
    const optionElement = document.getElementById(heading.toLowerCase().replace(/\s(.)/g, (match, group1) => group1.toUpperCase()).replace(/\s+/g, '') + 'Option');
    if (optionElement) {
        const warningIcon = optionElement.querySelector('span.attention-indicator');
        if (warningIcon && warningIcon.innerHTML.includes('⚠️')) {
            warningIcon.remove();
        }
    }
    removeTabAttentionIfNoIndicators('tab7');

    if (heading === 'Rebirth') {
        const rebirthRow = createOptionRow(
            'rebirthRow',
            null,
            'Rebirth:',
            createButton(`REBIRTH`, ['option-button', 'red-disabled-text', 'rebirth-check'], () => {
                const currentAp = getResourceDataObject('ascendencyPoints', ['quantity']);
                const spanClass = currentAp === 0 ? "red-disabled-text" : "green-ready-text";

                const content = modalRebirthText.replace(
                    /<span class="green-ready-text">.*?<\/span>/,
                    `<span class="${spanClass}">You will carry over ${currentAp} AP!</span>`
                );

                callPopupModal(
                    modalRebirthHeader,
                    content,
                    true,
                    true,
                    false,
                    false,
                    function () {
                        rebirth();
                        showHideModal();
                    },
                    function () {
                        showHideModal();
                    },
                    null,
                    null,
                    'RESET ALL PROGRESS AND KEEP AP',
                    'CANCEL',
                    null,
                    null,
                    false
                );

            }, null, null, null, null, null, true, null, 'rebirth'),
            null,
            null,
            null,
            null,
            `RESET ALL PROGRESS AND KEEP AWARDED AP`,
            '',
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            'rebirth'
        );
        
        optionContentElement.appendChild(rebirthRow);
    }

    if (heading === 'Galactic Market') {
        setGalacticMarketOutgoingStockType('select');
        setGalacticMarketIncomingStockType('select');
        setGalacticMarketOutgoingQuantitySelectionType('select');
        setGalacticMarketIncomingQuantity(0);
        setGalacticMarketLiquidationAuthorization('no');
        setGalacticMarketSellApForCashQuantity('select');
        setApLiquidationQuantity(0);
        const galacticMarketItemSelectRow = createOptionRow(
            'galacticMarketItemSelectRow',
            null,
            'Trade:',
            createDropdown('galacticMarketOutgoingStockTypeDropDown', [
                { value: 'select', text: 'Select Resource / Compound', type: 'select' },
                { value: 'hydrogen', text: 'Hydrogen', type: 'resources' },
                { value: 'helium', text: 'Helium', type: 'resources' },
                { value: 'carbon', text: 'Carbon', type: 'resources' },
                { value: 'neon', text: 'Neon', type: 'resources' },
                { value: 'oxygen', text: 'Oxygen', type: 'resources' },
                { value: 'sodium', text: 'Sodium', type: 'resources' },
                { value: 'silicon', text: 'Silicon', type: 'resources' },
                { value: 'iron', text: 'Iron', type: 'resources' },
                { value: 'diesel', text: 'Diesel', type: 'compounds' },
                { value: 'glass', text: 'Glass', type: 'compounds' },
                { value: 'steel', text: 'Steel', type: 'compounds' },
                { value: 'concrete', text: 'Concrete', type: 'compounds' },
                { value: 'water', text: 'Water', type: 'compounds' },
                { value: 'titanium', text: 'Titanium', type: 'compounds' }
            ], 'select', (value) => {
                setGalacticMarketOutgoingStockType(value);
                setHasClickedOutgoingOptionGalacticMarket(true);
            }),
            createTextElement(`For:`, 'galacticMarketForText', '', null),
            createDropdown('galacticMarketIncomingStockTypeDropDown', [
                { value: 'select', text: 'Select Resource / Compound', type: 'select'},
                { value: 'hydrogen', text: 'Hydrogen', type: 'resources' },
                { value: 'helium', text: 'Helium', type: 'resources' },
                { value: 'carbon', text: 'Carbon', type: 'resources' },
                { value: 'neon', text: 'Neon', type: 'resources' },
                { value: 'oxygen', text: 'Oxygen', type: 'resources' },
                { value: 'sodium', text: 'Sodium', type: 'resources' },
                { value: 'silicon', text: 'Silicon', type: 'resources' },
                { value: 'iron', text: 'Iron', type: 'resources' },
                { value: 'diesel', text: 'Diesel', type: 'compounds' },
                { value: 'glass', text: 'Glass', type: 'compounds' },
                { value: 'steel', text: 'Steel', type: 'compounds' },
                { value: 'concrete', text: 'Concrete', type: 'compounds' },
                { value: 'water', text: 'Water', type: 'compounds' },
                { value: 'titanium', text: 'Titanium', type: 'compounds' }
            ], 'select', (value) => {
                setGalacticMarketIncomingStockType(value);
            }),
            null,
            null,
            null,
            '',
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            'galacticMarketResourceTradeTypes',
            [true, '20%', '80%']
        );
        optionContentElement.appendChild(galacticMarketItemSelectRow);

        const galacticMarketQuantitySelectorRow = createOptionRow(
            'galacticMarketQuantitySelectorRow',
            null,
            'Quantity:',
            createDropdown('galacticMarketQuantityToTradeDropDown', [
                { value: 'select', text: 'Select Quantity' },
                { value: 'all', text: 'All Stock' },
                { value: 'enter', text: 'Enter Quantity' },
            ], 'select', (value) => {
                setGalacticMarketOutgoingQuantitySelectionType(value);
                setGalacticMarketOutgoingQuantitySelectionTypeDisabledStatus(value);
            }, ['dropdown-disabled']),
            createTextFieldArea('galacticMarketQuantityTextArea', ['galactic-market-textarea', 'invisible'], '', '0'),
            null,
            null,
            null,
            null,
            '',
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            'galacticMarketResourceTradeQuantity',
            [true, '20%', '80%']
        );

        optionContentElement.appendChild(galacticMarketQuantitySelectorRow);
        document.getElementById('galacticMarketQuantityTextArea').addEventListener('input', (event) => {
            if (event.target.value.startsWith('0') && event.target.value.length > 1) {
                event.target.value = event.target.value.replace(/^0+/, '');
            }
            
            document.getElementById('galacticMarketQuantityTextArea').value = event.target.value;
        });

        const galacticMarketTradeSummaryAndConfirmRow = createOptionRow(
            'galacticMarketTradeSummaryAndConfirmRow',
            null,
            'Confirm:',
            createTextElement(`Trade <span id="galacticMarketOutgoingQuantityText" class="green-ready-text notation">999</span> <span id="galacticMarketOutgoingStockTypeText" class="green-ready-text">Hydrogen</span>`, 'galacticMarketSummaryOutgoing', ['galactic-market-summary-text'], null),            
            createTextElement(`for <span id="galacticMarketIncomingQuantityText" class="green-ready-text notation">12</span> <span id="galacticMarketIncomingStockTypeText" class="green-ready-text">Diesel</span>`, 'galacticMarketSummaryIncoming', ['galactic-market-summary-text'], null),            
            createTextElement(`Commission: <span id="galacticMarketComissionQuantitySummaryText" class="warning-orange-text">49</span> <span id="galacticMarketComissionQuantityStockTypeText" class="warning-orange-text">Hydrogen</span>`, 'galacticMarketSummaryCommission', ['galactic-market-summary-text-wide'], null),
            createButton(`CONFIRM`, ['option-button', 'red-disabled-text', 'galactic-market-confirm-trade-button'], () => {
                galacticMarketTrade();
            }, null, null, null, null, null, true, null, 'galacticMarketTradeConfirm'),
            null,
            null,
            null,
            '',
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            'galacticMarketTradeConfirm',
            [true, '20%', '80%']
        );
        optionContentElement.appendChild(galacticMarketTradeSummaryAndConfirmRow);

        const galacticMarketSellApForCashRow = createOptionRow(
            'galacticMarketSellApForCashRow',
            null,
            'Sell AP:',
            createDropdown('galacticMarketSellApForCashDropDown', [
                { value: 'select', text: 'Select Quantity' },
                { value: '1', text: 'Sell 1 AP' },
                { value: '5', text: 'Sell 5 AP' },
                { value: '10', text: 'Sell 10 AP' },
            ], 'select', (value) => {
                setGalacticMarketSellApForCashQuantity(value);
            }),
            createButton(`SELL`, ['option-button', 'red-disabled-text', 'galactic-market-confirm-sell-ap-button'], () => {
                galacticMarketSellApForCash(getGalacticMarketSellApForCashQuantity());
            }, null, null, null, null, null, true, null, 'galacticMarketSellApForCashConfirm'),
            null,
            null,
            null,
            `Cash Gain: <span id ="galacticMarketCashGainQuantity" class="green-ready-text notation">0</span>`,
            '',
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            'galacticMarketSellApForCashConfirm'
        );
        optionContentElement.appendChild(galacticMarketSellApForCashRow);

        const galacticMarketLiquidateForAPRow = createOptionRow(
            'galacticMarketLiquidateForAPRow',
            null,
            'Liquidate:',
            createDropdown('galacticMarketLiquidateDropDown', [
                { value: 'no', text: 'I DO NOT WANT TO LIQUIDATE' },
                { value: 'yes', text: 'I WANT TO LIQUIDATE' },
            ], 'no', (value) => {
                setGalacticMarketLiquidationAuthorization(value);
            }),
            createButton(`LIQUIDATE`, ['option-button', 'red-disabled-text', 'galactic-market-confirm-liquidate-button'], () => {
                galacticMarketLiquidateForAp(getApLiquidationQuantity());
            }, null, null, null, null, null, true, null, 'galacticMarketLiquidateForApConfirm'),
            null,
            null,
            null,
            `AP GAIN: <span id ="galacticMarketApLiquidationQuantity" class="green-ready-text">0</span>`, //updateDescriptionRow('galacticMarketLiquidateForAPRow', 'content2'); when user has used this up
            '',
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            'galacticMarketLiquidateForApConfirm'
        );
        optionContentElement.appendChild(galacticMarketLiquidateForAPRow);
    }

    if (heading === 'Ascendency Perks') {
        const ascendencyBuffsArray = Object.fromEntries(Object.entries(getAscendencyBuffDataObject()).filter(([key]) => key !== "version"));
    
        if (Object.keys(ascendencyBuffsArray).length === 0) {
            return;
        }
    
        Object.keys(ascendencyBuffsArray).forEach(buffKey => {
            const buff = ascendencyBuffsArray[buffKey];
    
            const buffRowDescription = `${buff.description}`;
            const cost = buff.rebuyable ? buff.baseCostAp * Math.pow(buff.rebuyableIncreaseMultiple, buff.boughtYet) : buff.baseCostAp;
            const buyStatus = buff.boughtYet > 0 ? (buff.rebuyable ? `Bought ${buff.boughtYet} times` : "Purchased") : "Not Bought";
    
            const buffRow = createOptionRow(
                buffRowDescription,
                null,
                `${buff.name}:`,
                createTextElement(
                    `Rebuyable: <span class="green-ready-text">
                    ${buff.rebuyable ? (buff.timesRebuyable === 100000 ? "Yes" : buff.timesRebuyable) : "No"}
                  </span>`,                  
                    `buff${capitaliseString(buffKey)}RebuyableText`,
                    ['buff-value']
                ),                
                createTextElement(buyStatus, `buff${capitaliseString(buffKey)}BuyStatusText`, ['buff-value']),
                createButton(`BUY`, ['option-button', 'red-disabled-text', 'ascendency-buff-button', `buff-class-${buff.name.replace(/\s+/g, '-').toLowerCase()}`], () => {
                    purchaseBuff(buffKey, cost);
                }, null, null, null, null, null, true, null, 'ascendency'),
                createTextElement(
                    `<span id="${buff.name.replace(/\s+/g, '').replace(/^./, str => str.toLowerCase())}CostText" class="green-ready-text">${Math.floor(cost)} AP</span>`,
                    'buffCost',
                    ['buff-value']
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
                'ascendency',
                [true, '30%', '70%']
            );
    
            optionContentElement.appendChild(buffRow);
        });
    }  
    
    if (heading === 'Megastructures') {
        const megastructureDiagramRow = createOptionRow(
            'megastructureDiagramRow',
            null,
            '',
            createMegaStructureDiagram(),
            null,
            null,
            null,
            null,
            '',
            '',
            '',
            '',
            '',
            '',
            null,
            false,
            null,
            null,
            '',
            [true, 'invisible', '100%']
        );
    
        optionContentElement.appendChild(megastructureDiagramRow);

        const megastructureTableRow = createOptionRow(
            'megastructureTableRow',
            null,
            '',
            createMegaStructureTable(),
            null,
            null,
            null,
            null,
            '',
            '',
            '',
            '',
            '',
            '',
            null,
            false,
            null,
            null,
            '',
            [true, 'invisible', '100%'],
            null,
            true
        );
    
        optionContentElement.appendChild(megastructureTableRow);
    }
    
    if (heading === 'Black Hole') {
        const blackHoleTimeWarpProgressRow = createOptionRow(
            'blackHoleTimeWarpProgressRow',
            null,
            null,
            createTextElement(
                `<div id="blackHoleTimeWarpProgressBar">`,
                'blackHoleTimeWarpProgressBarContainer',
                ['progress-bar-container', 'invisible']
            ),
            null,
            null,
            null,
            null,
            '',
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            '',
            [true, '0', '100%'],
            ['no-left-margin']
        );
        optionContentElement.appendChild(blackHoleTimeWarpProgressRow);

        const blackHoleChargeProgressRow = createOptionRow(
            'blackHoleChargeProgressRow',
            null,
            null,
            createTextElement(
                `<div id="blackHoleChargeProgressBar">`,
                'blackHoleChargeProgressBarContainer',
                ['progress-bar-container', 'invisible']
            ),
            null,
            null,
            null,
            null,
            '',
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            '',
            [true, '0', '100%'],
            ['no-left-margin']
        );
        optionContentElement.appendChild(blackHoleChargeProgressRow);

        if (getCurrentlyChargingBlackHole()) {
            timerManagerDelta.removeTimer('blackHoleChargeTimer');
            deferredActions.push(() => {
                const timeRemaining = getTimeLeftUntilBlackHoleChargeTimerFinishes();
                startBlackHoleChargeTimer([timeRemaining, 'reEnterBlackHoleScreen']);
            });
        }

        const blackHoleRow2Container = document.createElement('div');
        blackHoleRow2Container.style.width = '100%';
        blackHoleRow2Container.style.padding = '40px 60px';

        const blackHoleResearchGateContainer = document.createElement('div');
        blackHoleResearchGateContainer.id = 'blackHoleResearchGateContainer';
        blackHoleResearchGateContainer.style.display = 'flex';
        blackHoleResearchGateContainer.style.alignItems = 'center';
        blackHoleResearchGateContainer.style.justifyContent = 'center';
        blackHoleResearchGateContainer.style.width = '100%';
        blackHoleResearchGateContainer.style.height = '220px';

        const blackHoleUnlockedContainer = document.createElement('div');
        blackHoleUnlockedContainer.id = 'blackHoleUnlockedContainer';
        blackHoleUnlockedContainer.style.display = 'flex';
        blackHoleUnlockedContainer.style.alignItems = 'center';
        blackHoleUnlockedContainer.style.justifyContent = 'space-between';
        blackHoleUnlockedContainer.style.gap = '18px';
        blackHoleUnlockedContainer.style.width = '100%';

        const blackHoleRow2LeftButtons = document.createElement('div');
        blackHoleRow2LeftButtons.style.display = 'flex';
        blackHoleRow2LeftButtons.style.flexDirection = 'column';
        blackHoleRow2LeftButtons.style.justifyContent = 'space-between';
        blackHoleRow2LeftButtons.style.alignItems = 'flex-start';
        blackHoleRow2LeftButtons.style.height = '220px';
        blackHoleRow2LeftButtons.style.width = '240px';

        const blackHoleRow2RightButtons = document.createElement('div');
        blackHoleRow2RightButtons.style.display = 'flex';
        blackHoleRow2RightButtons.style.flexDirection = 'column';
        blackHoleRow2RightButtons.style.justifyContent = 'center';
        blackHoleRow2RightButtons.style.alignItems = 'flex-end';
        blackHoleRow2RightButtons.style.height = '220px';
        blackHoleRow2RightButtons.style.width = '120px';

        const blackHoleButton1 = createButton('Research Black Hole', ['id_blackHoleResearchButton', 'option-button', 'red-disabled-text', 'wide-option-button'], () => {
            if (getBlackHoleResearchDone()) {
                return;
            }

            const price = getBlackHoleResearchPrice();
            const currentResearch = getResourceDataObject('research', ['quantity']);
            if (currentResearch < price) {
                return;
            }

            setResourceDataObject(currentResearch - price, 'research', ['quantity']);
            setBlackHoleResearchDone(true);

            const chargeTimerName = 'blackHoleChargeTimer';
            if (timerManagerDelta.hasTimer(chargeTimerName)) {
                timerManagerDelta.removeTimer(chargeTimerName);
            }

            setBlackHoleChargeReady(false);
            setCurrentlyChargingBlackHole(false);
            setCurrentBlackHoleChargeTimerDurationTotal(0);
            setTimeLeftUntilBlackHoleChargeTimerFinishes(0);
            startBlackHoleChargeTimer([0, 'researchComplete']);
        });
        const blackHoleButton2 = createButton('Power +', ['id_blackHoleButton2', 'option-button', 'wide-option-button'], () => {
            if (!getBlackHoleResearchDone()) {
                return;
            }

            const price = getBlackHolePowerPrice();
            const currentResearch = getResourceDataObject('research', ['quantity']);
            if (currentResearch < price) {
                return;
            }

            setResourceDataObject(currentResearch - price, 'research', ['quantity']);
            setBlackHolePowerPrice(Math.ceil(price * getGameCostMultiplier()));
            setBlackHolePower(getBlackHolePower() + 2);
        });
        const blackHoleButton3 = createButton('Duration +', ['id_blackHoleButton3', 'option-button', 'wide-option-button'], () => {
            if (!getBlackHoleResearchDone()) {
                return;
            }

            const price = getBlackHoleDurationPrice();
            const currentResearch = getResourceDataObject('research', ['quantity']);
            if (currentResearch < price) {
                return;
            }

            setResourceDataObject(currentResearch - price, 'research', ['quantity']);
            setBlackHoleDurationPrice(Math.ceil(price * getGameCostMultiplier()));
            setBlackHoleDuration(getBlackHoleDuration() + 3000);
        });
        const blackHoleActivateChargeButton = createButton('Charge', ['id_blackHoleChargeButton', 'option-button'], () => {
            if (getCurrentlyChargingBlackHole() || getCurrentlyTimeWarpingBlackHole()) {
                return;
            }

            if (getBlackHoleChargeReady()) {
                setBlackHoleChargeReady(false);

                const progressBar = document.getElementById('blackHoleChargeProgressBar');
                if (progressBar) {
                    progressBar.style.width = '0%';
                }

                const chargeProgressBarContainer = document.getElementById('blackHoleChargeProgressBarContainer');
                if (chargeProgressBarContainer) {
                    chargeProgressBarContainer.classList.add('invisible');
                }

                const timeWarpProgressBarContainer = document.getElementById('blackHoleTimeWarpProgressBarContainer');
                if (timeWarpProgressBarContainer) {
                    timeWarpProgressBarContainer.classList.remove('invisible');
                }

                const timeWarpProgressBar = document.getElementById('blackHoleTimeWarpProgressBar');
                if (timeWarpProgressBar) {
                    timeWarpProgressBar.style.width = '100%';
                }

                const durationMs = getBlackHoleDuration();
                const endTimestampMs = Date.now() + durationMs;
                setCurrentlyTimeWarpingBlackHole(true);
                setCurrentBlackHoleTimeWarpDurationTotal(durationMs);
                setBlackHoleTimeWarpEndTimestampMs(endTimestampMs);

                const blackHoleCanvas = document.getElementById('blackHoleCanvas');
                if (blackHoleCanvas) {
                    blackHoleCanvas.dataset.timeWarping = 'true';
                    blackHoleCanvas.dataset.timeWarpRemainingMs = String(durationMs);
                    blackHoleCanvas.dataset.timeWarpDurationMs = String(durationMs);
                }

                setTimeout(() => {
                    if (!getCurrentlyTimeWarpingBlackHole()) {
                        return;
                    }
                    if (getBlackHoleTimeWarpEndTimestampMs() !== endTimestampMs) {
                        return;
                    }

                    setCurrentlyTimeWarpingBlackHole(false);
                    setCurrentBlackHoleTimeWarpDurationTotal(0);
                    setBlackHoleTimeWarpEndTimestampMs(0);

                    const blackHoleCanvas = document.getElementById('blackHoleCanvas');
                    if (blackHoleCanvas) {
                        blackHoleCanvas.dataset.timeWarping = 'false';
                        blackHoleCanvas.dataset.timeWarpRemainingMs = '0';
                    }

                    if (!getCurrentlyChargingBlackHole() && !getBlackHoleChargeReady()) {
                        startBlackHoleChargeTimer([0, 'timeWarpFinished']);
                    }
                }, durationMs);

                timeWarp(durationMs, getBlackHolePower());
                return;
            }

            startBlackHoleChargeTimer([0, 'buttonClick']);
        });

        [blackHoleButton2, blackHoleButton3, blackHoleActivateChargeButton].forEach(button => {
            button.disabled = true;
            button.style.pointerEvents = 'none';
            button.classList.add('red-disabled-text');
        });

        blackHoleActivateChargeButton.style.width = '120px';

        blackHoleResearchGateContainer.appendChild(blackHoleButton1);
        blackHoleRow2LeftButtons.appendChild(blackHoleButton3);
        blackHoleRow2LeftButtons.appendChild(blackHoleButton2);
        blackHoleRow2RightButtons.appendChild(blackHoleActivateChargeButton);

        const blackHoleCanvas = createBlackHole(0);
        blackHoleCanvas.id = 'blackHoleCanvas';
        blackHoleCanvas.dataset.chargePercent = '0';
        blackHoleCanvas.dataset.timeWarping = 'false';
        blackHoleCanvas.dataset.timeWarpRemainingMs = '0';
        blackHoleCanvas.dataset.timeWarpDurationMs = '0';

        blackHoleUnlockedContainer.appendChild(blackHoleRow2LeftButtons);
        blackHoleUnlockedContainer.appendChild(blackHoleCanvas);
        blackHoleUnlockedContainer.appendChild(blackHoleRow2RightButtons);

        if (getBlackHoleResearchDone()) {
            blackHoleResearchGateContainer.classList.add('invisible');
        } else {
            blackHoleUnlockedContainer.classList.add('invisible');
        }

        blackHoleRow2Container.appendChild(blackHoleResearchGateContainer);
        blackHoleRow2Container.appendChild(blackHoleUnlockedContainer);

        optionContentElement.appendChild(createOptionRow(
            'blackHoleInteractionRow',
            null,
            null,
            blackHoleRow2Container,
            null,
            null,
            null,
            null,
            '',
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            null,
            null,
            '',
            [true, '0', '100%'],
            ['no-left-margin']
        ));
    }

}
