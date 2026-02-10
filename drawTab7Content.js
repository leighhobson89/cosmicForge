import { removeTabAttentionIfNoIndicators, createOptionRow, createButton, createDropdown, createTextElement, createTextFieldArea, createSpinningDropdown, callPopupModal, showHideModal, createMegaStructureDiagram, createMegaStructureTable, createBlackHole, setButtonState } from './ui.js';
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
    getCurrentBlackHoleChargeTimerDurationTotal,
    getBaseBlackHoleChargeTimerDuration,
    getGameCostMultiplier,
    getBlackHoleDurationUpgradeIncrementMs,
    getBlackHolePowerUpgradeIncrement,
    deferredActions,
    setAchievementFlagArray,
    getMinimumBlackHoleChargeTime,
    getBlackHoleAlwaysOn,
    setGalacticCasinoPurchaseItem
} from './constantsAndGlobalVars.js';
import { purchaseBuff, buyCasinoPoints, galacticMarketLiquidateForAp, galacticMarketSellApForCash, galacticMarketTrade, rebirth, startBlackHoleChargeTimer, timeWarp } from './game.js';
import { trackAnalyticsEvent } from './analytics.js';
import {
    getAscendencyBuffDataObject,
    getResourceDataObject,
    setResourceDataObject,
    getGalacticCasinoDataObject,
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
    setBlackHoleDurationPrice,
    getBlackHoleRechargePrice,
    setBlackHoleRechargePrice,
    getBlackHoleRechargeMultiplier,
    setBlackHoleRechargeMultiplier
} from './resourceDataObject.js';
import { sfxPlayer } from './audioManager.js';
import { capitaliseString } from './utilityFunctions.js';
import { modalRebirthText, modalRebirthHeader } from './descriptions.js';
import { timerManagerDelta } from './timerManagerDelta.js';
import { playDoubleOrNothing } from './casino.js';

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

    if (heading === 'Galactic Casino') {
        const purchaseCpRow = createOptionRow(
            'galacticCasinoPurchaseCpRow',
            null,
            'Purchase CP:',
            createDropdown('galacticCasinoPurchaseItemDropDown', [
                { value: 'select', text: 'Select Currency', type: 'select' },
                { value: 'cash', text: '<strong>Cash</strong>', type: 'currency' },
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
                setGalacticCasinoPurchaseItem(value);
            }, ['galactic-casino-dropdown']),
            null,
            createTextFieldArea('galacticCasinoPurchaseQuantityTextArea', ['galactic-market-textarea', 'galactic-casino-quantity-textarea'], 'Buy CP Quantity', ''),
            createButton(`BUY`, ['option-button', 'red-disabled-text', 'galactic-casino-buy-cp-button'], () => {
                buyCasinoPoints();
            }, null, null, null, null, null, true, null, 'galacticCasinoBuyCp'),
            createTextElement(`Cost: <span id="galacticCasinoPurchaseCpPreview" class="green-ready-text notation">0</span>`, 'galacticCasinoPurchaseCpPreviewText', ['galactic-market-summary-text'], null),
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
            'galacticCasinoPurchaseCp',
            [true, '20%', '80%'],
            ['no-left-margin', 'galactic-casino-input-container']
        );
        optionContentElement.appendChild(purchaseCpRow);

        document.getElementById('galacticCasinoPurchaseQuantityTextArea').addEventListener('input', (event) => {
            if (event.target.value.startsWith('0') && event.target.value.length > 1) {
                event.target.value = event.target.value.replace(/^0+/, '');
            }

            document.getElementById('galacticCasinoPurchaseQuantityTextArea').value = event.target.value;
        });

        const game1StakeInput = createTextFieldArea('galacticCasinoGame1StakeTextArea', ['galactic-market-textarea', 'galactic-casino-stake-textarea'], 'Stake', '');
        const game1Spinner = createSpinningDropdown(
            'galacticCasinoGame1Spinner',
            [
                { value: 'win', text: 'WIN WIN WIN WIN', className: 'green-ready-text' },
                { value: 'lose', text: 'LOSE LOSE LOSE LOSE', className: 'red-disabled-text' }
            ],
            'win',
            ['galactic-casino-spinner']
        );
        const game1SpinButton = createButton('SPIN', ['id_galacticCasinoGame1SpinButton', 'option-button', 'red-disabled-text', 'galactic-casino-spin-button'], () => {
            const stakeEl = document.getElementById('galacticCasinoGame1StakeTextArea');
            playDoubleOrNothing({
                stake: stakeEl?.value,
                spinnerId: 'galacticCasinoGame1Spinner'
            });
        }, null, null, null, null, null, true, null, 'galacticCasinoGame1');

        const game1Row = createOptionRow(
            'galacticCasinoGame1Row',
            null,
            'Double Or Nothing:',
            game1StakeInput,
            null,
            game1Spinner,
            game1SpinButton,
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
            'galacticCasinoGame1',
            [true, '20%', '80%'],
            ['no-left-margin', 'galactic-casino-input-container'],
            false
        );

        
        const game2Row = createOptionRow('galacticCasinoGame2Row', null, 'Game 2:', null, null, null, null, null, null, null, null, '', '', null, null, null, null, null, null, 'galacticCasinoGame2', null, false);
        const game3Row = createOptionRow('galacticCasinoGame3Row', null, 'Game 3:', null, null, null, null, null, null, null, null, '', '', null, null, null, null, null, null, 'galacticCasinoGame3', null, false);
        optionContentElement.appendChild(game1Row);
        optionContentElement.appendChild(game2Row);
        optionContentElement.appendChild(game3Row);

        const spinButton = document.getElementById('galacticCasinoGame1SpinButton');
        if (spinButton) {
            setButtonState(spinButton, { enabled: false, ready: false });
        }

        const stakeTextArea = document.getElementById('galacticCasinoGame1StakeTextArea');
        if (stakeTextArea) {
            stakeTextArea.addEventListener('input', (event) => {
                const raw = String(event.target.value ?? '');
                let cleaned = raw.replace(/[^0-9]/g, '');
                if (cleaned.startsWith('0') && cleaned.length > 1) {
                    cleaned = cleaned.replace(/^0+/, '');
                }

                const cpBalance = getGalacticCasinoDataObject('casinoPoints', ['quantity']) ?? 0;
                const n = cleaned === '' ? 0 : parseInt(cleaned, 10);
                if (Number.isFinite(n) && n > cpBalance) {
                    cleaned = cpBalance > 0 ? String(cpBalance) : '';
                }

                stakeTextArea.value = cleaned;

                const stakeValue = cleaned === '' ? 0 : parseInt(cleaned, 10);
                const canSpin = Number.isFinite(stakeValue) && stakeValue > 0;
                const spinButtonEl = document.getElementById('galacticCasinoGame1SpinButton');
                if (spinButtonEl) {
                    setButtonState(spinButtonEl, { enabled: canSpin, ready: canSpin });
                }
            });
        }

        document.getElementById('galacticCasinoPurchaseCpPreview').textContent = '0';
    }

    if (heading === 'Ascendency Perks') {
        const ascendencyBuffsArray = Object.fromEntries(Object.entries(getAscendencyBuffDataObject()).filter(([key]) => key !== "version"));
    
        if (Object.keys(ascendencyBuffsArray).length === 0) {
            return;
        }
    
        Object.keys(ascendencyBuffsArray).forEach(buffKey => {
            const buff = ascendencyBuffsArray[buffKey];
    
            const buffRowDescription = `buff${capitaliseString(buffKey)}Row`;
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
            '<span id="blackHoleChargeProgressRowDescription">BLACK HOLE CHARGING</span>',
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
        blackHoleRow2Container.style.display = 'flex';
        blackHoleRow2Container.style.flexDirection = 'column';
        blackHoleRow2Container.style.width = '100%';
        blackHoleRow2Container.style.minHeight = '220px';
        blackHoleRow2Container.style.padding = '0px 60px 0px 60px';

        const blackHoleResearchGateContainer = document.createElement('div');
        blackHoleResearchGateContainer.id = 'blackHoleResearchGateContainer';
        blackHoleResearchGateContainer.style.display = 'flex';
        blackHoleResearchGateContainer.style.alignItems = 'center';
        blackHoleResearchGateContainer.style.justifyContent = 'center';
        blackHoleResearchGateContainer.style.width = '100%';
        blackHoleResearchGateContainer.style.height = '100%';
        blackHoleResearchGateContainer.style.minHeight = '220px';
        blackHoleResearchGateContainer.style.flex = '1 0 auto';

        const blackHoleUnlockedContainer = document.createElement('div');
        blackHoleUnlockedContainer.id = 'blackHoleUnlockedContainer';
        blackHoleUnlockedContainer.style.display = 'flex';
        blackHoleUnlockedContainer.style.alignItems = 'center';
        blackHoleUnlockedContainer.style.justifyContent = 'space-between';
        blackHoleUnlockedContainer.style.gap = '18px';
        blackHoleUnlockedContainer.style.width = '100%';

        const blackHoleRow2LeftButtons = document.createElement('div');
        blackHoleRow2LeftButtons.id = 'blackHoleRow2LeftButtons';
        blackHoleRow2LeftButtons.style.display = 'flex';
        blackHoleRow2LeftButtons.style.flexDirection = 'column';
        blackHoleRow2LeftButtons.style.justifyContent = 'space-evenly';
        blackHoleRow2LeftButtons.style.gap = '20%';
        blackHoleRow2LeftButtons.style.alignItems = 'flex-start';
        blackHoleRow2LeftButtons.style.height = '220px';
        blackHoleRow2LeftButtons.style.width = '240px';

        const blackHoleChargeButtonContainer = document.createElement('div');
        blackHoleChargeButtonContainer.id = 'blackHoleChargeButtonContainer';
        blackHoleChargeButtonContainer.style.display = 'flex';
        blackHoleChargeButtonContainer.style.alignItems = 'center';
        blackHoleChargeButtonContainer.style.justifyContent = 'flex-end';
        blackHoleChargeButtonContainer.style.height = '220px';
        blackHoleChargeButtonContainer.style.width = '240px';

        const blackHoleCanvasContainer = document.createElement('div');
        blackHoleCanvasContainer.id = 'blackHoleCanvasContainer';
        blackHoleCanvasContainer.style.display = 'flex';
        blackHoleCanvasContainer.style.alignItems = 'center';
        blackHoleCanvasContainer.style.justifyContent = 'center';
        blackHoleCanvasContainer.style.width = '220px';
        blackHoleCanvasContainer.style.height = '220px';
        blackHoleCanvasContainer.style.flex = '0 0 auto';

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

            trackAnalyticsEvent('black_hole_research_completed', {
                price,
                research_before: currentResearch,
                research_after: currentResearch - price
            }, { immediate: true, flushReason: 'black_hole' });

            setAchievementFlagArray('discoverBlackHole', 'add');

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
        const blackHoleButton2 = createButton('Power', ['id_blackHoleButton2', 'option-button', 'wide-option-button'], () => {
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
            setBlackHolePower(getBlackHolePower() + getBlackHolePowerUpgradeIncrement());
        });
        const blackHoleButton3 = createButton('Duration', ['id_blackHoleButton3', 'option-button', 'wide-option-button'], () => {
            if (!getBlackHoleResearchDone()) {
                return;
            }

            const minChargeMs = getMinimumBlackHoleChargeTime();
            const baseChargeMs = getBaseBlackHoleChargeTimerDuration();
            const currentChargeMs = Math.round(baseChargeMs * getBlackHoleRechargeMultiplier());
            const rechargeCapped = currentChargeMs <= minChargeMs;
            if (rechargeCapped) {
                return;
            }

            const price = getBlackHoleDurationPrice();
            const currentResearch = getResourceDataObject('research', ['quantity']);
            if (currentResearch < price) {
                return;
            }

            setResourceDataObject(currentResearch - price, 'research', ['quantity']);
            setBlackHoleDurationPrice(Math.ceil(price * getGameCostMultiplier()));
            setBlackHoleDuration(getBlackHoleDuration() + getBlackHoleDurationUpgradeIncrementMs());
        });
        const blackHoleButton4 = createButton('Recharge', ['id_blackHoleButton4', 'option-button', 'wide-option-button'], () => {
            if (!getBlackHoleResearchDone()) {
                return;
            }

            const minChargeMs = getMinimumBlackHoleChargeTime();
            const baseChargeMs = getBaseBlackHoleChargeTimerDuration();
            const previousMultiplier = getBlackHoleRechargeMultiplier();
            const minMultiplier = baseChargeMs > 0 ? (minChargeMs / baseChargeMs) : 0;
            const nextMultiplier = Math.max(minMultiplier, previousMultiplier * 0.88);

            const currentChargeMs = Math.round(baseChargeMs * previousMultiplier);
            if (currentChargeMs <= minChargeMs) {
                return;
            }

            const price = getBlackHoleRechargePrice();
            const currentResearch = getResourceDataObject('research', ['quantity']);
            if (currentResearch < price) {
                return;
            }

            setResourceDataObject(currentResearch - price, 'research', ['quantity']);
            setBlackHoleRechargePrice(Math.ceil(price * getGameCostMultiplier()));

            setBlackHoleRechargeMultiplier(nextMultiplier);

            if (getCurrentlyChargingBlackHole()) {
                const timerName = 'blackHoleChargeTimer';
                if (timerManagerDelta.hasTimer(timerName)) {
                    const previousTotal = getCurrentBlackHoleChargeTimerDurationTotal();
                    const previousRemaining = getTimeLeftUntilBlackHoleChargeTimerFinishes();
                    const elapsed = previousTotal - previousRemaining;
                    const progress = previousTotal > 0 ? Math.max(0, Math.min(1, elapsed / previousTotal)) : 0;

                    timerManagerDelta.removeTimer(timerName);
                    setCurrentlyChargingBlackHole(false);

                    const scale = previousMultiplier > 0 ? (nextMultiplier / previousMultiplier) : 1;
                    const newTotal = Math.round(previousTotal * scale);
                    const newRemaining = Math.round(newTotal * (1 - progress));
                    setCurrentBlackHoleChargeTimerDurationTotal(newTotal);
                    setTimeLeftUntilBlackHoleChargeTimerFinishes(newRemaining);
                    startBlackHoleChargeTimer([newRemaining, 'rechargeUpgrade']);
                }
            }
        });
        const blackHoleActivateChargeButton = createButton('Charge', ['id_blackHoleChargeButton', 'option-button'], () => {
            if (getBlackHoleAlwaysOn()) {
                return;
            }
            if (getCurrentlyChargingBlackHole() || getCurrentlyTimeWarpingBlackHole()) {
                return;
            }

            if (getBlackHoleChargeReady()) {
                setBlackHoleChargeReady(false);

                sfxPlayer.playAudio('blackHoleActivated', false);

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

        [blackHoleButton2, blackHoleButton3, blackHoleButton4, blackHoleActivateChargeButton].forEach(button => {
            setButtonState(button, { enabled: false, ready: false });
        });

        blackHoleActivateChargeButton.style.width = '120px';

        blackHoleResearchGateContainer.appendChild(blackHoleButton1);
        blackHoleRow2LeftButtons.appendChild(blackHoleButton3);
        blackHoleRow2LeftButtons.appendChild(blackHoleButton2);
        blackHoleRow2LeftButtons.appendChild(blackHoleButton4);
        blackHoleChargeButtonContainer.appendChild(blackHoleActivateChargeButton);

        const blackHoleCanvas = createBlackHole(0);
        blackHoleCanvas.id = 'blackHoleCanvas';
        blackHoleCanvas.dataset.chargePercent = '0';
        blackHoleCanvas.dataset.timeWarping = 'false';
        blackHoleCanvas.dataset.timeWarpRemainingMs = '0';
        blackHoleCanvas.dataset.timeWarpDurationMs = '0';
        blackHoleCanvas.dataset.renderSizePx = '220';

        blackHoleCanvasContainer.appendChild(blackHoleCanvas);

        blackHoleUnlockedContainer.appendChild(blackHoleRow2LeftButtons);
        blackHoleUnlockedContainer.appendChild(blackHoleCanvasContainer);
        blackHoleUnlockedContainer.appendChild(blackHoleChargeButtonContainer);

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
