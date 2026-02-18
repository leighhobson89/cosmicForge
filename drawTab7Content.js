import { removeTabAttentionIfNoIndicators, createOptionRow, createButton, createDropdown, createTextElement, createTextFieldArea, createSpinningDropdown, callPopupModal, showHideModal, createMegaStructureDiagram, createMegaStructureTable, createBlackHole, setButtonState, showNotification } from './ui.js';
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
    setGalacticCasinoPurchaseItem,
    getCurrentTheme,
    getPlayerPhilosophy,
    getUnlockedResourcesArray,
    getUnlockedCompoundsArray
} from './constantsAndGlobalVars.js';
import { purchaseBuff, buyCasinoPoints, galacticMarketLiquidateForAp, galacticMarketSellApForCash, galacticMarketTrade, rebirth, startBlackHoleChargeTimer, timeWarp } from './game.js';
import { claimCasinoSpecialPrizeByKey } from './casino.js';
import { trackAnalyticsEvent } from './analytics.js';
import {
    getAscendencyBuffDataObject,
    getResourceDataObject,
    setResourceDataObject,
    getGalacticCasinoDataObject,
    setGalacticCasinoDataObject,
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

import { playDoubleOrNothing, playWheelOfFortune, claimWheelSpecialPrize } from './casino.js';
import { sfxPlayer } from './audioManager.js';
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

        const wheel = document.createElement('div');
        wheel.id = 'galacticCasinoGame2Wheel';
        wheel.classList.add('galactic-casino-roulette-wheel');
        wheel.setAttribute('data-rotation', '0');
        wheel.setAttribute('data-spinning', 'false');
        wheel.setAttribute('data-special-ready', 'false');
        wheel.setAttribute('data-prize-selection', 'select');

        const wheelFace = document.createElement('div');
        wheelFace.classList.add('galactic-casino-roulette-face');
        wheel.appendChild(wheelFace);

        const wheelIndicator = document.createElement('div');
        wheelIndicator.classList.add('galactic-casino-roulette-indicator');
        wheel.appendChild(wheelIndicator);

        const game2SpinButton = createButton(
            'SPIN WHEEL',
            ['id_galacticCasinoGame2SpinWheelButton', 'option-button', 'red-disabled-text', 'galactic-casino-spin-button', 'galactic-casino-wheel-spin-button'],
            () => {
                playWheelOfFortune({ wheelId: 'galacticCasinoGame2Wheel' });
            },
            null,
            null,
            null,
            null,
            null,
            true,
            null,
            'galacticCasinoGame2'
        );

        const wheelStack = document.createElement('div');
        wheelStack.classList.add('galactic-casino-wheel-stack');
        wheelStack.appendChild(wheel);
        wheelStack.appendChild(game2SpinButton);

        const prizeDropdown = createDropdown(
            'galacticCasinoGame2PrizeDropdown',
            [
                { value: 'select', text: 'Select Special Prize', type: 'select' },
                { value: 'special_rocket_warp', text: 'Rocket Warp To Asteroid / Base', type: 'special' },
                { value: 'special_starship_warp', text: 'Starship Warp Instantly', type: 'special' },
                { value: 'special_telescope_finish_asteroid_search', text: 'Space Telescope Finished Asteroid Search!', type: 'special' },
                { value: 'special_telescope_finish_star_study', text: 'Space Telescope Finished Star Study!', type: 'special' },
                { value: 'special_telescope_finish_void_pillage', text: 'Space Telescope Finished Pillaging The Void!', type: 'special' },
                { value: 'special_100cp', text: '100CP', type: 'special' },
                { value: 'special_double_titanium', text: 'Double your quantity of Titanium', type: 'special' },
                { value: 'special_double_steel', text: 'Double your quantity of Steel', type: 'special' },
                { value: 'special_double_silicon', text: 'Double your quantity of Silicon', type: 'special' },
                { value: 'special_double_iron', text: 'Double your quantity of Iron', type: 'special' },
                { value: 'special_double_sodium', text: 'Double your quantity of Sodium', type: 'special' },
                { value: 'special_100k_research', text: '100,000 Research Points', type: 'special' }
            ],
            'select',
            (value) => {
                const w = document.getElementById('galacticCasinoGame2Wheel');
                if (w) {
                    w.setAttribute('data-prize-selection', String(value || 'select'));
                }
            },
            ['galactic-casino-wheel-prize-dropdown']
        );

        prizeDropdown.classList.add('red-disabled-text');
        prizeDropdown.style.pointerEvents = 'none';

        const claimButton = createButton(
            'CLAIM',
            ['id_galacticCasinoGame2ClaimButton', 'option-button', 'red-disabled-text', 'galactic-casino-spin-button'],
            () => {
                const w = document.getElementById('galacticCasinoGame2Wheel');
                const dd = document.getElementById('galacticCasinoGame2PrizeDropdown');
                const claimBtn = document.getElementById('galacticCasinoGame2ClaimButton');
                const spinBtn = document.getElementById('galacticCasinoGame2SpinWheelButton');

                const claimed = claimWheelSpecialPrize({ wheelId: 'galacticCasinoGame2Wheel' });
                if (!claimed) {
                    return;
                }

                if (w) {
                    w.setAttribute('data-special-ready', 'false');
                    w.setAttribute('data-prize-selection', 'select');
                }

                if (dd) {
                    dd.classList.add('red-disabled-text');
                    dd.style.pointerEvents = 'none';

                    const dropdownTextEl = dd.querySelector('.dropdown-text');
                    if (dropdownTextEl) {
                        dropdownTextEl.textContent = 'Select Special Prize';
                    }
                }

                if (claimBtn) {
                    setButtonState(claimBtn, { enabled: false, ready: false });
                }

                if (spinBtn) {
                    const cpBalance = getGalacticCasinoDataObject('casinoPoints', ['quantity']) ?? 0;
                    const canSpin = cpBalance >= 1;
                    setButtonState(spinBtn, { enabled: canSpin, ready: canSpin });
                }
            },
            null,
            null,
            null,
            null,
            null,
            true,
            null,
            'galacticCasinoGame2'
        );

        const game2Row = createOptionRow(
            'galacticCasinoGame2Row',
            null,
            'Wheel Of Fortune:',
            wheelStack,
            null,
            null,
            prizeDropdown,
            claimButton,
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
            'galacticCasinoGame2',
            [true, '20%', '80%'],
            ['no-left-margin', 'galactic-casino-input-container'],
            false
        );

        const game3CardRow = document.createElement('div');
        game3CardRow.id = 'galacticCasinoGame3CardRow';
        game3CardRow.classList.add('galactic-casino-hilo-card-row');

        for (let i = 0; i < 9; i += 1) {
            const card = document.createElement('div');
            card.classList.add('galactic-casino-hilo-card');
            card.setAttribute('data-card-index', String(i));

            if (i < 3) {
                const valueEl = document.createElement('div');
                valueEl.classList.add('galactic-casino-hilo-card-value');
                const rank = i === 0 ? '2' : (i === 1 ? '8' : 'K');
                const suit = i === 0 ? '♦' : (i === 1 ? '♠' : '♣');
                valueEl.innerHTML = `<span class="galactic-casino-hilo-card-rank">${rank}</span><span class="galactic-casino-hilo-card-suit">${suit}</span>`;
                card.appendChild(valueEl);
            } else {
                card.classList.add('galactic-casino-hilo-card-back');
            }

            game3CardRow.appendChild(card);
        }

        const game3LowerButton = createButton(
            'LOWER',
            ['id_galacticCasinoGame3LowerButton', 'option-button', 'red-disabled-text', 'galactic-casino-spin-button'],
            () => {
            },
            null,
            null,
            null,
            null,
            null,
            true,
            null,
            'galacticCasinoGame3'
        );

        const game3HigherButton = createButton(
            'HIGHER',
            ['id_galacticCasinoGame3HigherButton', 'option-button', 'red-disabled-text', 'galactic-casino-spin-button'],
            () => {
            },
            null,
            null,
            null,
            null,
            null,
            true,
            null,
            'galacticCasinoGame3'
        );

        const game3HiloContainer = document.createElement('div');
        game3HiloContainer.id = 'galacticCasinoGame3HiloContainer';
        game3HiloContainer.classList.add('galactic-casino-hilo-container');

        // Debug: set true to force every Higher/Lower guess to be treated as correct.
        const DEBUG_HILO_ALWAYS_WIN = false;

        let hiloEndResetTimeoutId = null;

        const hiloPrizeTiers = {
            1: [
                { label: '+5 CP', key: 'hilo_cp_5' },
                { label: 'Cash Boost', key: 'hilo_cash_boost_small' },
                { label: 'Research Boost', key: 'hilo_research_boost_small' },
                { label: 'Resource Top-Up', key: 'hilo_resource_topup' },
                { label: 'Compound Top-Up', key: 'hilo_compound_topup' }
            ],
            2: [
                { label: '+10 CP', key: 'hilo_cp_10' },
                { label: 'Cash Boost', key: 'hilo_cash_boost_medium' },
                { label: 'Research Boost', key: 'hilo_research_boost_medium' },
                { label: 'Double Hydrogen', key: 'special_double_hydrogen' },
                { label: 'Double Carbon', key: 'special_double_carbon' }
            ],
            3: [
                { label: '+20 CP', key: 'hilo_cp_20' },
                { label: 'Cash Boost', key: 'hilo_cash_boost_large' },
                { label: 'Research Boost', key: 'hilo_research_boost_large' },
                { label: 'Double Iron', key: 'special_double_iron' },
                { label: 'Double Silicon', key: 'special_double_silicon' }
            ],
            4: [
                { label: '+40 CP', key: 'hilo_cp_40' },
                { label: 'Research Grant', key: 'hilo_research_flat' },
                { label: 'Cash Grant', key: 'hilo_cash_flat' },
                { label: 'Double Steel', key: 'special_double_steel' },
                { label: 'Double Concrete', key: 'special_double_concrete' }
            ],
            5: [
                { label: '+70 CP', key: 'hilo_cp_70' },
                { label: 'Research Grant+', key: 'hilo_research_big_flat' },
                { label: 'Double Titanium', key: 'special_double_titanium' },
                { label: 'TimeWarp x25', key: 'hilo_timewarp_25_20000' },
                { label: 'TimeWarp x50', key: 'hilo_timewarp_50_15000' }
            ],
            6: [
                { label: '+100 CP', key: 'hilo_cp_100' },
                { label: 'Research Mega', key: 'hilo_research_mega' },
                { label: 'Cash Mega', key: 'hilo_cash_mega' },
                { label: 'TimeWarp x75', key: 'hilo_timewarp_75_15000' },
                { label: 'TimeWarp x100', key: 'hilo_timewarp_100_12000' }
            ]
        };

        const getTier7PrizeList = () => {
            const list = [
                { label: 'Finish Rocket', key: 'special_finish_rocket_journey' },
                { label: 'Finish Starship', key: 'special_finish_starship_journey' },
                { label: 'Finish Asteroid', key: 'special_telescope_finish_asteroid_search' },
                { label: 'Finish Star Study', key: 'special_telescope_finish_star_study' },
                { label: 'TimeWarp x200', key: 'hilo_timewarp_200_20000' }
            ];

            const philosophy = String(getPlayerPhilosophy?.() || '');
            if (philosophy === 'voidborn') {
                list[3] = { label: 'Finish Void', key: 'special_telescope_finish_void_pillage' };
            }
            return list;
        };

        const pickRandomTierPrize = (tier) => {
            const t = Number(tier);
            const list = t === 7 ? getTier7PrizeList() : hiloPrizeTiers[t];
            if (!Array.isArray(list) || list.length === 0) return null;
            return list[Math.floor(Math.random() * list.length)] || null;
        };

        const awardHiloPrize = ({ key } = {}) => {
            const prizeKey = String(key || '');
            if (!prizeKey) return null;

            const awardCp = (amount) => {
                const add = Number(amount);
                if (!Number.isFinite(add) || add <= 0) return null;
                const current = getGalacticCasinoDataObject('casinoPoints', ['quantity']) ?? 0;
                setGalacticCasinoDataObject(Math.max(0, current + add), 'casinoPoints', ['quantity']);
                return { type: 'cp', amount: add };
            };

            const awardStockTopUp = (category) => {
                const cat = String(category || '').toLowerCase();
                if (cat !== 'resources' && cat !== 'compounds') return null;

                const unlockedRaw = cat === 'resources'
                    ? (getUnlockedResourcesArray?.() || [])
                    : (getUnlockedCompoundsArray?.() || []);

                const unlocked = Array.from(new Set((unlockedRaw || []).map((v) => String(v || '').toLowerCase())));
                if (cat === 'resources' && !unlocked.includes('hydrogen')) {
                    unlocked.unshift('hydrogen');
                }

                const eligible = unlocked.filter((stockKey) => {
                    const qty = Number(getResourceDataObject(cat, [stockKey, 'quantity']) ?? 0);
                    const cap = Number(getResourceDataObject(cat, [stockKey, 'storageCapacity']) ?? 0);
                    return Number.isFinite(cap) && cap > qty;
                });

                if (eligible.length === 0) return null;
                const chosenKey = eligible[Math.floor(Math.random() * eligible.length)];
                const currentQty = Number(getResourceDataObject(cat, [chosenKey, 'quantity']) ?? 0);
                const cap = Number(getResourceDataObject(cat, [chosenKey, 'storageCapacity']) ?? 0);
                const headroom = Math.max(0, cap - currentQty);
                const maxInc = Math.max(1, Math.floor(currentQty * 0.1));
                const maxAward = Math.min(headroom, maxInc);
                if (!Number.isFinite(maxAward) || maxAward <= 0) return null;
                const amount = 1 + Math.floor(Math.random() * maxAward);
                setResourceDataObject(Math.max(0, currentQty + amount), cat, [chosenKey, 'quantity']);
                return { type: cat, key: chosenKey, amount };
            };

            if (prizeKey === 'hilo_resource_topup') {
                return awardStockTopUp('resources') || awardCp(5);
            }

            if (prizeKey === 'hilo_compound_topup') {
                return awardStockTopUp('compounds') || awardCp(5);
            }

            const cpAddMatch = prizeKey.match(/^hilo_cp_(\d+)$/);
            if (cpAddMatch) {
                const amount = parseInt(cpAddMatch[1], 10);
                return awardCp(amount);
            }

            if (prizeKey === 'hilo_cash_boost_small' || prizeKey === 'hilo_cash_boost_medium' || prizeKey === 'hilo_cash_boost_large') {
                const pct = prizeKey === 'hilo_cash_boost_small' ? 0.02 : (prizeKey === 'hilo_cash_boost_medium' ? 0.05 : 0.1);
                const currentCash = Number(getResourceDataObject('currency', ['cash']) ?? 0);
                const amount = Math.max(0, Math.floor(currentCash * pct));
                if (amount > 0) {
                    setResourceDataObject(Math.max(0, currentCash + amount), 'currency', ['cash']);
                    return { type: 'cash', amount };
                }
                return null;
            }

            if (prizeKey === 'hilo_research_boost_small' || prizeKey === 'hilo_research_boost_medium' || prizeKey === 'hilo_research_boost_large') {
                const pct = prizeKey === 'hilo_research_boost_small' ? 0.02 : (prizeKey === 'hilo_research_boost_medium' ? 0.05 : 0.1);
                const current = Number(getResourceDataObject('research', ['quantity']) ?? 0);
                const amount = Math.max(0, Math.floor(current * pct));
                if (amount > 0) {
                    setResourceDataObject(Math.max(0, current + amount), 'research', ['quantity']);
                    return { type: 'research', amount };
                }
                return null;
            }

            if (prizeKey === 'hilo_research_flat' || prizeKey === 'hilo_research_big_flat' || prizeKey === 'hilo_research_mega') {
                const amount = prizeKey === 'hilo_research_flat' ? 5000 : (prizeKey === 'hilo_research_big_flat' ? 100000 : 500000);
                const current = Number(getResourceDataObject('research', ['quantity']) ?? 0);
                setResourceDataObject(Math.max(0, current + amount), 'research', ['quantity']);
                return { type: 'research', amount };
            }

            if (prizeKey === 'hilo_cash_flat' || prizeKey === 'hilo_cash_mega') {
                const amount = prizeKey === 'hilo_cash_flat' ? 5000 : 250000;
                const currentCash = Number(getResourceDataObject('currency', ['cash']) ?? 0);
                setResourceDataObject(Math.max(0, currentCash + amount), 'currency', ['cash']);
                return { type: 'cash', amount };
            }

            if (prizeKey.startsWith('hilo_timewarp_')) {
                const parts = prizeKey.split('_');
                const mult = Number(parts[2]);
                const ms = Number(parts[3]);
                if (Number.isFinite(mult) && mult > 0 && Number.isFinite(ms) && ms > 0) {
                    return { type: 'timewarp', multiplier: mult, durationMs: ms };
                }
                return null;
            }

            const special = claimCasinoSpecialPrizeByKey(prizeKey, { notify: false });
            if (special) return special;

            const tier7FinishKeys = new Set([
                'special_finish_rocket_journey',
                'special_finish_starship_journey',
                'special_telescope_finish_asteroid_search',
                'special_telescope_finish_star_study',
                'special_telescope_finish_void_pillage'
            ]);

            if (tier7FinishKeys.has(prizeKey)) {
                const fallback = awardCp(150);
                return fallback;
            }

            return awardCp(5);
        };

        const formatHiloAwardDetails = (awarded) => {
            if (!awarded || typeof awarded !== 'object') {
                return '';
            }

            const titleCaseFromKey = (value) => {
                return String(value || '')
                    .replace(/[_-]+/g, ' ')
                    .split(' ')
                    .filter(Boolean)
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
            };

            const type = String(awarded.type || '').toLowerCase();

            if (type === 'cp' && Number.isFinite(Number(awarded.amount))) {
                return `${Math.floor(Number(awarded.amount))} CP`;
            }

            if (type === 'cash' && Number.isFinite(Number(awarded.amount))) {
                return `${Math.floor(Number(awarded.amount))} Cash`;
            }

            if (type === 'research' && Number.isFinite(Number(awarded.amount))) {
                return `${Math.floor(Number(awarded.amount))} Research Points`;
            }

            if ((type === 'resources' || type === 'compounds') && awarded.key && Number.isFinite(Number(awarded.amount))) {
                return `${Math.floor(Number(awarded.amount))} ${titleCaseFromKey(awarded.key)}`;
            }

            if ((type === 'resources' || type === 'compounds') && awarded.key && Number.isFinite(Number(awarded.oldQuantity)) && Number.isFinite(Number(awarded.newQuantity))) {
                return `${titleCaseFromKey(awarded.key)} doubled`;
            }

            if (type === 'timewarp' && Number.isFinite(Number(awarded.multiplier)) && Number.isFinite(Number(awarded.durationMs))) {
                const seconds = Math.max(0, Math.round(Number(awarded.durationMs) / 1000));
                return `TimeWarp x${Number(awarded.multiplier)} for ${seconds}s`;
            }

            if (type === 'telescope_finish_asteroid_search') {
                const asteroid = awarded.asteroid ? ` (${String(awarded.asteroid)})` : '';
                return `Finished Asteroid Search${asteroid}`;
            }

            if (type === 'telescope_finish_star_study') {
                return 'Finished Star Study';
            }

            if (type === 'telescope_finish_void_pillage') {
                return 'Finished Void Pillage';
            }

            if (type === 'finish_starship_journey' && awarded.destinationStar) {
                return `Finished Starship Journey (${String(awarded.destinationStar)})`;
            }

            if (type === 'finish_rocket_journey') {
                const name = awarded.name ? ` ${String(awarded.name)}` : '';
                return `Finished Rocket Journey${name}`;
            }

            return '';
        };

        const getHiloNotificationPrizeName = (defaultPrizeName, awarded) => {
            if (awarded && typeof awarded === 'object') {
                const type = String(awarded.type || '').toLowerCase();
                if (type === 'cp' && Number.isFinite(Number(awarded.amount))) {
                    return `${Math.floor(Number(awarded.amount))}CP`;
                }
            }
            if (awarded && typeof awarded === 'object' && awarded.hiloOverridePrizeName) {
                return String(awarded.hiloOverridePrizeName);
            }
            return String(defaultPrizeName || '---') || '---';
        };

        const shouldAppendHiloAwardDetails = (prizeName, awarded, details) => {
            if (!details) {
                return false;
            }
            if (!awarded || typeof awarded !== 'object') {
                return true;
            }

            const type = String(awarded.type || '').toLowerCase();

            if (type === 'cp') {
                return false;
            }
            if ((type === 'resources' || type === 'compounds')
                && awarded.key
                && Number.isFinite(Number(awarded.oldQuantity))
                && Number.isFinite(Number(awarded.newQuantity))) {
                const keyName = String(awarded.key || '');
                const keyTitle = keyName
                    .replace(/[_-]+/g, ' ')
                    .split(' ')
                    .filter(Boolean)
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');

                const name = String(prizeName || '').toLowerCase();
                if (name.includes('double') && name.includes(keyTitle.toLowerCase())) {
                    return false;
                }
            }

            return true;
        };

        const updateHiloPrizePreview = (text) => {
            const prizePreview = document.getElementById('galacticCasinoGame3PrizePreview');
            if (prizePreview) {
                prizePreview.textContent = text || '---';
            }
        };

        const updatePrizeTierForRevealedCount = (revealedCount) => {
            const count = Number(revealedCount);
            if (!Number.isFinite(count) || count < 3) {
                game3HiloContainer.setAttribute('data-hilo-tier', '0');
                game3HiloContainer.setAttribute('data-hilo-tier-prize', '');
                game3HiloContainer.setAttribute('data-hilo-tier-prize-key', '');
                updateHiloPrizePreview('---');

                const cashOutBtn = document.getElementById('galacticCasinoGame3CashOutButton');
                setButtonState(cashOutBtn, { enabled: false, ready: false });
                return;
            }

            const cashOutBtn = document.getElementById('galacticCasinoGame3CashOutButton');
            setButtonState(cashOutBtn, { enabled: true, ready: true });

            const tier = Math.min(7, Math.max(1, count - 2));
            const currentTier = parseInt(game3HiloContainer.getAttribute('data-hilo-tier') || '0', 10);
            if (currentTier === tier) {
                const existingPrize = String(game3HiloContainer.getAttribute('data-hilo-tier-prize') || '');
                updateHiloPrizePreview(existingPrize || '---');
                return;
            }

            const prize = pickRandomTierPrize(tier);
            const label = String(prize?.label || '---');
            const key = String(prize?.key || '');
            game3HiloContainer.setAttribute('data-hilo-tier', String(tier));
            game3HiloContainer.setAttribute('data-hilo-tier-prize', label);
            game3HiloContainer.setAttribute('data-hilo-tier-prize-key', key);
            updateHiloPrizePreview(label || '---');
        };

        document.documentElement.style.setProperty(
            '--hilo-card-back-image',
            `url(./images/achievements/${getCurrentTheme()}/images/studyAllStarsInOneRun.png)`
        );

        const game3ButtonRow = document.createElement('div');
        game3ButtonRow.id = 'galacticCasinoGame3ButtonRow';
        game3ButtonRow.classList.add('galactic-casino-hilo-button-row');
        game3ButtonRow.appendChild(game3LowerButton);
        game3ButtonRow.appendChild(game3HigherButton);

        game3HiloContainer.appendChild(game3CardRow);
        game3HiloContainer.appendChild(game3ButtonRow);

        const rankLabelFromValue = (value) => {
            const v = Number(value);
            if (v === 11) return 'J';
            if (v === 12) return 'Q';
            if (v === 13) return 'K';
            if (v === 14) return 'A';
            return String(v);
        };

        const createRandomHiloDeck = (count) => {
            const suits = ['♦', '♠', '♣', '♥'];
            const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

            const pool = [];
            suits.forEach((suit) => {
                values.forEach((value) => {
                    pool.push({ value, suit });
                });
            });

            const deck = [];
            const desired = Math.min(Math.max(0, Number(count) || 0), pool.length);
            for (let i = 0; i < desired; i += 1) {
                const prev = deck[i - 1];
                const eligible = prev
                    ? pool.filter((c) => c.value !== prev.value)
                    : pool;

                const source = eligible.length > 0 ? eligible : pool;
                const chosen = source[Math.floor(Math.random() * source.length)];
                if (!chosen) {
                    break;
                }

                deck.push(chosen);

                const idx = pool.findIndex((c) => c.value === chosen.value && c.suit === chosen.suit);
                if (idx >= 0) {
                    pool.splice(idx, 1);
                }
            }

            return deck;
        };

        const setCardHidden = (cardEl) => {
            if (!cardEl) return;
            cardEl.classList.add('galactic-casino-hilo-card-back');
            const valueEl = cardEl.querySelector('.galactic-casino-hilo-card-value');
            if (valueEl) {
                valueEl.remove();
            }
        };

        const setCardRevealed = (cardEl, card) => {
            if (!cardEl || !card) return;
            cardEl.classList.remove('galactic-casino-hilo-card-back');

            const existing = cardEl.querySelector('.galactic-casino-hilo-card-value');
            if (existing) {
                existing.remove();
            }

            const valueEl = document.createElement('div');
            valueEl.classList.add('galactic-casino-hilo-card-value');
            const rank = rankLabelFromValue(card.value);
            const suit = card.suit;

            const isRed = suit === '♦' || suit === '♥';
            if (isRed) {
                valueEl.style.color = 'red';
            } else {
                valueEl.classList.add('green-ready-text');
            }

            valueEl.innerHTML = `<span class="galactic-casino-hilo-card-rank">${rank}</span><span class="galactic-casino-hilo-card-suit">${suit}</span>`;
            cardEl.appendChild(valueEl);
        };

        const setHiloIdleUi = () => {
            if (hiloEndResetTimeoutId) {
                clearTimeout(hiloEndResetTimeoutId);
                hiloEndResetTimeoutId = null;
            }
            game3HiloContainer.setAttribute('data-hilo-state', 'idle');
            game3HiloContainer.setAttribute('data-hilo-index', '0');
            game3HiloContainer.setAttribute('data-hilo-deck', '');
            game3HiloContainer.setAttribute('data-hilo-has-guessed', 'false');
            game3HiloContainer.setAttribute('data-hilo-tier', '0');
            game3HiloContainer.setAttribute('data-hilo-tier-prize', '');
            game3HiloContainer.setAttribute('data-hilo-tier-prize-key', '');

            updateHiloPrizePreview('---');

            const cards = Array.from(game3CardRow.querySelectorAll('.galactic-casino-hilo-card'));
            cards.forEach(setCardHidden);

            const cashOutBtn = document.getElementById('galacticCasinoGame3CashOutButton');
            if (cashOutBtn) {
                cashOutBtn.textContent = 'PLAY';
                setButtonState(cashOutBtn, { enabled: true, ready: true });
            }

            const lowerBtn = document.getElementById('galacticCasinoGame3LowerButton');
            const higherBtn = document.getElementById('galacticCasinoGame3HigherButton');
            setButtonState(lowerBtn, { enabled: false, ready: false });
            setButtonState(higherBtn, { enabled: false, ready: false });
        };

        const setHiloActiveUi = (deck) => {
            game3HiloContainer.setAttribute('data-hilo-state', 'active');
            game3HiloContainer.setAttribute('data-hilo-index', '0');
            game3HiloContainer.setAttribute('data-hilo-deck', JSON.stringify(deck || []));
            game3HiloContainer.setAttribute('data-hilo-has-guessed', 'false');
            game3HiloContainer.setAttribute('data-hilo-tier', '0');
            game3HiloContainer.setAttribute('data-hilo-tier-prize', '');
            game3HiloContainer.setAttribute('data-hilo-tier-prize-key', '');

            updateHiloPrizePreview('---');

            const cashOutBtn = document.getElementById('galacticCasinoGame3CashOutButton');
            if (cashOutBtn) {
                cashOutBtn.textContent = 'CASH OUT';
                setButtonState(cashOutBtn, { enabled: false, ready: false });
            }

            const lowerBtn = document.getElementById('galacticCasinoGame3LowerButton');
            const higherBtn = document.getElementById('galacticCasinoGame3HigherButton');
            setButtonState(lowerBtn, { enabled: true, ready: true });
            setButtonState(higherBtn, { enabled: true, ready: true });

            const cards = Array.from(game3CardRow.querySelectorAll('.galactic-casino-hilo-card'));
            cards.forEach(setCardHidden);
            if (cards[0]) {
                setCardRevealed(cards[0], deck?.[0]);
            }
        };

        const hiloResetImmediate = () => {
            if (hiloEndResetTimeoutId) {
                clearTimeout(hiloEndResetTimeoutId);
                hiloEndResetTimeoutId = null;
            }
            setHiloIdleUi();
        };

        const hiloResetAfterDelay = (delayMs = 2000) => {
            if (hiloEndResetTimeoutId) {
                clearTimeout(hiloEndResetTimeoutId);
                hiloEndResetTimeoutId = null;
            }

            setHiloEndingUi();
            hiloEndResetTimeoutId = setTimeout(() => {
                hiloResetImmediate();
            }, delayMs);
        };

        const setHiloEndingUi = () => {
            game3HiloContainer.setAttribute('data-hilo-state', 'ending');
            const lowerBtn = document.getElementById('galacticCasinoGame3LowerButton');
            const higherBtn = document.getElementById('galacticCasinoGame3HigherButton');
            const cashOutBtn = document.getElementById('galacticCasinoGame3CashOutButton');
            setButtonState(lowerBtn, { enabled: false, ready: false });
            setButtonState(higherBtn, { enabled: false, ready: false });
            setButtonState(cashOutBtn, { enabled: false, ready: false });
        };

        const hiloRevealNextCard = (guess) => {
            const deckRaw = game3HiloContainer.getAttribute('data-hilo-deck') || '';
            let deck = [];
            try {
                deck = JSON.parse(deckRaw || '[]');
            } catch (e) {
                deck = [];
            }

            const idx = parseInt(game3HiloContainer.getAttribute('data-hilo-index') || '0', 10);
            const nextIndex = Number.isFinite(idx) ? idx + 1 : 1;
            const cards = Array.from(game3CardRow.querySelectorAll('.galactic-casino-hilo-card'));

            const currentCard = deck[idx];
            const nextCard = deck[nextIndex];
            if (!currentCard || !nextCard) {
                hiloResetImmediate();
                return;
            }

            const currentValue = Number(currentCard.value);
            const nextValue = Number(nextCard.value);
            const isHigher = nextValue > currentValue;
            const isLower = nextValue < currentValue;

            if (!DEBUG_HILO_ALWAYS_WIN && guess === 'higher' && !isHigher) {
                if (cards[nextIndex]) {
                    setCardRevealed(cards[nextIndex], nextCard);
                    game3HiloContainer.setAttribute('data-hilo-index', String(nextIndex));
                }
                showNotification('LOSE! Better luck next time.', 'error', 2500, 'galacticCasino');
                hiloResetAfterDelay(2000);
                return;
            }

            if (!DEBUG_HILO_ALWAYS_WIN && guess === 'lower' && !isLower) {
                if (cards[nextIndex]) {
                    setCardRevealed(cards[nextIndex], nextCard);
                    game3HiloContainer.setAttribute('data-hilo-index', String(nextIndex));
                }
                showNotification('LOSE! Better luck next time.', 'error', 2500, 'galacticCasino');
                hiloResetAfterDelay(2000);
                return;
            }

            if (!deck[nextIndex] || !cards[nextIndex]) {
                hiloResetImmediate();
                return;
            }

            setCardRevealed(cards[nextIndex], deck[nextIndex]);
            game3HiloContainer.setAttribute('data-hilo-index', String(nextIndex));

            const revealedCount = nextIndex + 1;
            updatePrizeTierForRevealedCount(revealedCount);

            if (nextIndex >= cards.length - 1) {
                const prizeNameRaw = String(game3HiloContainer.getAttribute('data-hilo-tier-prize') || '---') || '---';
                const prizeKey = String(game3HiloContainer.getAttribute('data-hilo-tier-prize-key') || '');
                const awarded = awardHiloPrize({ key: prizeKey });
                const prizeName = getHiloNotificationPrizeName(prizeNameRaw, awarded);
                const details = formatHiloAwardDetails(awarded);
                const suffix = shouldAppendHiloAwardDetails(prizeName, awarded, details) ? ` - ${details}` : '';
                showNotification(`WON! Well done you guessed all Cards! ${prizeName}${suffix}`, 'info', 2500, 'galacticCasino');
                if (awarded?.type === 'timewarp') {
                    setTimeout(() => {
                        timeWarp(awarded.durationMs, awarded.multiplier);
                    }, 3000);
                }
                hiloResetAfterDelay(2000);
            }
        };

        const game3CashOutButton = createButton(
            'PLAY',
            ['id_galacticCasinoGame3CashOutButton', 'option-button', 'green-ready-text', 'galactic-casino-spin-button'],
            () => {
                const state = String(game3HiloContainer.getAttribute('data-hilo-state') || 'idle');
                if (state === 'idle') {
                    const cpBalance = getGalacticCasinoDataObject('casinoPoints', ['quantity']) ?? 0;
                    if (cpBalance < 5) {
                        showNotification('Not enough CP to play.', 'info', 2500, 'galacticCasino');
                        return;
                    }

                    trackAnalyticsEvent('casino_game_played', {
                        game_id: 'game3_hilo'
                    }, { immediate: true, flushReason: 'casino' });

                    setGalacticCasinoDataObject(Math.max(0, cpBalance - 5), 'casinoPoints', ['quantity']);
                    const deck = createRandomHiloDeck(9);
                    setHiloActiveUi(deck);
                    return;
                }

                if (state === 'active') {
                    const idx = parseInt(game3HiloContainer.getAttribute('data-hilo-index') || '0', 10);
                    const revealedCount = Number.isFinite(idx) ? (idx + 1) : 1;
                    if (revealedCount < 3) {
                        return;
                    }
                    const prizeNameRaw = String(game3HiloContainer.getAttribute('data-hilo-tier-prize') || '---') || '---';
                    const prizeKey = String(game3HiloContainer.getAttribute('data-hilo-tier-prize-key') || '');
                    const awarded = awardHiloPrize({ key: prizeKey });

                    if (awarded) {
                        trackAnalyticsEvent('casino_prize_won', {
                            game_id: 'game3_hilo',
                            prize_key: prizeKey || prizeNameRaw,
                            awarded_type: awarded.type ?? null,
                            awarded_key: awarded.key ?? null,
                            amount: awarded.amount ?? null,
                            multiplier: awarded.multiplier ?? null,
                            duration_ms: awarded.durationMs ?? null,
                        }, { immediate: true, flushReason: 'casino' });
                    }
                    const prizeName = getHiloNotificationPrizeName(prizeNameRaw, awarded);
                    const details = formatHiloAwardDetails(awarded);
                    const suffix = shouldAppendHiloAwardDetails(prizeName, awarded, details) ? ` - ${details}` : '';
                    showNotification(`You cashed out at ${revealedCount} cards - ${prizeName}${suffix}`, 'info', 2500, 'galacticCasino');
                    if (awarded?.type === 'timewarp') {
                        setTimeout(() => {
                            timeWarp(awarded.durationMs, awarded.multiplier);
                        }, 3000);
                    }
                    hiloResetImmediate();
                }
            },
            null,
            null,
            null,
            null,
            null,
            true,
            null,
            'galacticCasinoGame3'
        );

        const game3PrizeInfo = createTextElement(
            `Prize: <span id="galacticCasinoGame3PrizePreview" class="green-ready-text notation">---</span>`,
            'galacticCasinoGame3PrizePreviewText',
            ['galactic-market-summary-text'],
            null
        );

        game3LowerButton.addEventListener('click', () => {
            const state = String(game3HiloContainer.getAttribute('data-hilo-state') || 'idle');
            if (state !== 'active') return;
            const hasGuessed = String(game3HiloContainer.getAttribute('data-hilo-has-guessed') || 'false') === 'true';
            if (!hasGuessed) {
                game3HiloContainer.setAttribute('data-hilo-has-guessed', 'true');
            }
            hiloRevealNextCard('lower');
        });

        game3HigherButton.addEventListener('click', () => {
            const state = String(game3HiloContainer.getAttribute('data-hilo-state') || 'idle');
            if (state !== 'active') return;
            const hasGuessed = String(game3HiloContainer.getAttribute('data-hilo-has-guessed') || 'false') === 'true';
            if (!hasGuessed) {
                game3HiloContainer.setAttribute('data-hilo-has-guessed', 'true');
            }
            hiloRevealNextCard('higher');
        });

        const game3Row = createOptionRow(
            'galacticCasinoGame3Row',
            null,
            'Higher Or Lower:',
            game3HiloContainer,
            null,
            null,
            game3CashOutButton,
            game3PrizeInfo,
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
            'galacticCasinoGame3',
            [true, '20%', '80%'],
            ['no-left-margin', 'galactic-casino-input-container'],
            false
        );
        optionContentElement.appendChild(game1Row);
        optionContentElement.appendChild(game2Row);
        optionContentElement.appendChild(game3Row);

        setHiloIdleUi();

        const spinButton = document.getElementById('galacticCasinoGame1SpinButton');
        if (spinButton) {
            setButtonState(spinButton, { enabled: false, ready: false });
        }

        const spinWheelButton = document.getElementById('galacticCasinoGame2SpinWheelButton');
        if (spinWheelButton) {
            setButtonState(spinWheelButton, { enabled: false, ready: false });
        }

        const claimBtn = document.getElementById('galacticCasinoGame2ClaimButton');
        if (claimBtn) {
            setButtonState(claimBtn, { enabled: false, ready: false });
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
            const buffName = typeof buff?.name === 'string' ? buff.name : capitaliseString(buffKey);
            const buffNameSlug = buffName.replace(/\s+/g, '-').toLowerCase();
            const buffNameId = buffName.replace(/\s+/g, '').replace(/^./, str => str.toLowerCase());
    
            const buffRowDescription = `buff${capitaliseString(buffKey)}Row`;
            const cost = buff.rebuyable ? buff.baseCostAp * Math.pow(buff.rebuyableIncreaseMultiple, buff.boughtYet) : buff.baseCostAp;
            const buyStatus = buff.boughtYet > 0 ? (buff.rebuyable ? `Bought ${buff.boughtYet} times` : "Purchased") : "Not Bought";
    
            const buffRow = createOptionRow(
                buffRowDescription,
                null,
                `${buffName}:`,
                createTextElement(
                    `Rebuyable: <span class="green-ready-text">
                    ${buff.rebuyable ? (buff.timesRebuyable === 100000 ? "Yes" : buff.timesRebuyable) : "No"}
                  </span>`,                  
                    `buff${capitaliseString(buffKey)}RebuyableText`,
                    ['buff-value']
                ),                
                createTextElement(buyStatus, `buff${capitaliseString(buffKey)}BuyStatusText`, ['buff-value']),
                createButton(`BUY`, ['option-button', 'red-disabled-text', 'ascendency-buff-button', `buff-class-${buffNameSlug}`], () => {
                    purchaseBuff(buffKey, cost);
                }, null, null, null, null, null, true, null, 'ascendency'),
                createTextElement(
                    `<span id="${buffNameId}CostText" class="green-ready-text">${Math.floor(cost)} AP</span>`,
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

            const currentPower = Number(getBlackHolePower());
            const baseIncrement = Number(getBlackHolePowerUpgradeIncrement());
            const increment = currentPower >= 50 ? 0.5 : baseIncrement;
            setBlackHolePower(currentPower + increment);
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
