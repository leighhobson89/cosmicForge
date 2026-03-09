import { createButton, createOptionRow, createTextElement, setButtonState, showNotification, drawSharedSpaceBackdrop, callPopupModal, showHideModal, playWinCinematic2, setupInfoTooltips } from './ui.js';
import {
    modalCosmicRipLocatedHeader,
    modalCosmicRipLocatedText,
    modalNearSpaceScannerArrayRestoredHeader,
    modalNearSpaceScannerArrayRestoredText,
    modalCosmicRipClosedHeader,
    modalCosmicRipClosedText
} from './descriptions.js';
import {
    getCosmicRipGalacticPoints,
    getCosmicRipNearSpaceScannerArrayRestored,
    getCosmicRipRipFound,
} from './resourceDataObject.js';

import {
    getCosmicRipSectorScanCostGp,
    getCosmicRipSectorCount,
    getNearSpaceScannerArrayRestoreCostGp,
    restoreNearSpaceScannerArray,
    scanCosmicRipSector,
} from './cosmicRip.js';

import {
    getCosmicRipNearSpaceScannerArrayInteractiveOverlayEl,
    getCosmicRipTechUnlockedArray,
    getCosmicRipNearSpaceScannerArrayFogEls,
    setCosmicRipNearSpaceScannerArraySectorNames,
    getCosmicRipNearSpaceScannerArraySectorNames,
    setCosmicRipNearSpaceScannerArrayOneSectorState,
    getCosmicRipNearSpaceScannerArrayOneSectorState,
    setCosmicRipFoundSectorIndexForZoom,
    getCosmicRipFoundSectorIndexForZoom,
    setCosmicRipNearSpaceScannerArrayCanvasEl,
    setCosmicRipNearSpaceScannerArrayGridOverlayEl,
    setCosmicRipNearSpaceScannerArrayFogOverlayEl,
    setCosmicRipNearSpaceScannerArrayInteractiveOverlayEl,
    setCosmicRipNearSpaceScannerArrayScanLabelOverlayEl,
    setCosmicRipNearSpaceScannerArrayScanLabelEls,
    getCosmicRipNearSpaceScannerArrayScanLabelEls,
    setCosmicRipNearSpaceScannerArrayFogEls,
    setCosmicRipNearSpaceScannerArrayLabelFadeOverlayEl,
    setCosmicRipNearSpaceScannerArrayZoomCanvasEl,
    setCosmicRipLocatedModalShown,
    getCosmicRipLocatedModalShown,
    setCosmicRipScanResultsBySectorIndex,
    getCosmicRipScanResultsBySectorIndex,
    setCosmicRipGpForUi,
    getCosmicRipGpForUi,
    setCosmicRipScannerRestoredForUi,
    getCosmicRipScannerRestoredForUi,
    setCosmicRipRipSpriteImgCache,
    getCosmicRipRipSpriteImgCache,
    setCosmicRipNearSpaceScannerArrayDrawCanvas,
    getCosmicRipNearSpaceScannerArrayDrawCanvas,
    setCosmicRipNearSpaceScannerArrayResizeAttached,
    getCosmicRipNearSpaceScannerArrayResizeAttached,
    getCosmicRipTechTimeLeftUntilResearchFinishes,
    getCosmicRipTechResearchDurations,
} from './constantsAndGlobalVars.js';

import {
    getCurrencySymbol,
    getGalacticPointsSpent,
    setGalacticPointsSpent,
    setAchievementFlagArray
} from './constantsAndGlobalVars.js';

import { getResourceDataObject } from './resourceDataObject.js';

import { gain } from './game.js';

export function drawTab8Content(heading, optionContentElement) {
    if (heading === 'Situation') {
        const headerRow = document.getElementById('headerContentTab8');
        if (headerRow) {
            headerRow.innerHTML = `Situation <p id="info_situationHeader" class="info-emoji">ℹ️</p>`;
        }
        setupInfoTooltips();

        const restored = getCosmicRipNearSpaceScannerArrayRestored?.() === true;
        const gp = Number(getCosmicRipGalacticPoints?.()) || 0;
        const restoreCost = Number(getNearSpaceScannerArrayRestoreCostGp?.()) || 10;

        const restoreRow = createOptionRow({
            labelId: 'cosmicRipRestoreNearSpaceScannerArrayRow',
            renderNameABs: null,
            labelText: 'Near Space Scanner Array:',
            inputElements: [
                createButton({
                    text: 'RESTORE',
                    classNames: ['option-button', 'red-disabled-text', 'cosmic-rip-restore-scanner-array-button'],
                    onClick: () => {
                        const result = restoreNearSpaceScannerArray?.();
                        if (!result?.ok) {
                            showNotification('Unable to restore Near Space Scanner Array.', 'warning', 3000, 'cosmicRip');
                            return;
                        }
                        showNotification('Near Space Scanner Array restored.', 'info', 3000, 'cosmicRip');
                        callPopupModal({
                            header: modalNearSpaceScannerArrayRestoredHeader,
                            content: modalNearSpaceScannerArrayRestoredText,
                            showConfirm: true,
                            showCancel: false,
                            showExtra1: false,
                            showExtra2: false,
                            onConfirm: () => {
                                showHideModal();
                            },
                            onCancel: null,
                            onExtra1: null,
                            onExtra2: null,
                            confirmLabel: 'CONFIRM',
                            cancelLabel: '',
                            extra1Label: '',
                            extra2Label: '',
                        });
                    },
                    disableKeyboardForButton: true,
                    rowCategory: 'cosmicRipRestoreNearSpaceScannerArray'
                }),
            ],
            descriptionText: `Cost: <span class="warning-orange-text">${restoreCost}</span> GP`,
            resourcePriceObject: '',
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'cosmicRipRestoreNearSpaceScannerArray',
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });

        if (restored) {
            restoreRow.classList.add('invisible');
        }

        const restoredRow = createOptionRow({
            labelId: 'cosmicRipNearSpaceScannerArrayRestoredStatusRow',
            renderNameABs: null,
            labelText: 'Near Space Scanner Array:',
            inputElements: [
                createTextElement('Requires Restoration', 'cosmicRipNearSpaceScannerArraySituationStatusText', ['red-disabled-text']),
            ],
            descriptionText: '',
            resourcePriceObject: '',
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });

        const cosmicRipStatusRow = createOptionRow({
            labelId: 'cosmicRipSituationStatusRow',
            renderNameABs: null,
            labelText: 'Cosmic Rip Status:',
            inputElements: [
                createTextElement('Not Located', 'cosmicRipSituationStatusText', ['red-disabled-text']),
            ],
            descriptionText: '',
            resourcePriceObject: '',
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        cosmicRipStatusRow.classList.add('invisible');

        const cosmicRipObjectiveRow = createOptionRow({
            labelId: 'cosmicRipSituationObjectiveRow',
            renderNameABs: null,
            labelText: 'Next Objective:',
            inputElements: [
                createTextElement('Scan Local Sectors for the Cosmic Rip', 'cosmicRipSituationObjectiveText', ['green-ready-text']),
            ],
            descriptionText: '',
            resourcePriceObject: '',
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        cosmicRipObjectiveRow.classList.add('invisible');

        const closeCosmicRipRow = createOptionRow({
            labelId: 'closeCosmicRipRow',
            renderNameABs: null,
            labelText: 'Close Rip:',
            inputElements: [
                createButton({
                    text: 'CLOSE COSMIC RIP',
                    classNames: ['option-button', 'cosmic-rip-close-rip-button'],
                    onClick: () => {
                        const currentGPSpent = Number(getGalacticPointsSpent?.()) || 0;
                        setGalacticPointsSpent(currentGPSpent + 1);

                        setAchievementFlagArray('closeCosmicRip', 'add');
                        setAchievementFlagArray('completeGame', 'add');
                        callPopupModal({
                            header: modalCosmicRipClosedHeader,
                            content: modalCosmicRipClosedText,
                                    showConfirm: true,
                                    showCancel: false,
                                    showExtra1: false,
                                    showExtra2: false,
                                    onConfirm: function() {
                                        showHideModal();
                                        playWinCinematic2();
                                    },
                                    onCancel: null,
                                    onExtra1: null,
                                    onExtra2: null,
                                    confirmLabel: 'END GAME COSMIC FORGER',
                                    cancelLabel: null,
                                    extra1Label: null,
                                    extra2Label: null,
                                    setupToolTips: false
                        });
                    },
                    disableKeyboardForButton: true,
                    rowCategory: null
                }),
            ],
            descriptionText: '<span id="closeCosmicRipCostGP">1GP</span>',
            resourcePriceObject: '',
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: true,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });

        optionContentElement.appendChild(restoreRow);
        optionContentElement.appendChild(restoredRow);
        optionContentElement.appendChild(cosmicRipStatusRow);
        optionContentElement.appendChild(cosmicRipObjectiveRow);
        optionContentElement.appendChild(closeCosmicRipRow);

        const btn = optionContentElement.querySelector?.('.cosmic-rip-restore-scanner-array-button');
        if (btn) {
            const canRestore = gp >= restoreCost;
            setButtonState(btn, { enabled: canRestore, ready: canRestore });
        }
        return;
    }

    if (heading === 'Near Space Scanner Array') {
        const headerRow = document.getElementById('headerContentTab8');
        if (headerRow) {
            headerRow.innerHTML = `Near Space Scanner Array <p id="info_nearSpaceScannerArrayHeader" class="info-emoji">ℹ️</p>`;
        }
        setupInfoTooltips();

        const restored = getCosmicRipNearSpaceScannerArrayRestored?.() === true;
        const found = getCosmicRipRipFound?.() === true;
        const gp = Number(getCosmicRipGalacticPoints?.()) || 0;
        const scanCost = Number(getCosmicRipSectorScanCostGp?.()) || 1;
        const sectorCount = Number(getCosmicRipSectorCount?.()) || 9;

        const statusRow = createOptionRow({
            labelId: 'cosmicRipNearSpaceScannerArrayStatusRow',
            renderNameABs: null,
            labelText: 'Miaplacidus Sectors Map:',
            inputElements: null,
            descriptionText: '',
            resourcePriceObject: '',
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        optionContentElement.appendChild(statusRow);

        const telescopeContainer = document.createElement('div');
        telescopeContainer.id = 'cosmicRipNearSpaceScannerArrayCanvasContainer';
        telescopeContainer.style.position = 'relative';
        telescopeContainer.style.width = '90%';
        telescopeContainer.style.margin = '20px auto';
        telescopeContainer.style.height = '100%';
        telescopeContainer.classList.add('container-bg');

        const canvas = document.createElement('canvas');
        canvas.id = 'cosmicRipNearSpaceScannerArrayCanvas';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        canvas.style.opacity = '1';

        const labelFadeOverlay = document.createElement('div');
        labelFadeOverlay.id = 'cosmicRipNearSpaceScannerArrayLabelFadeOverlay';
        labelFadeOverlay.style.position = 'absolute';
        labelFadeOverlay.style.left = '0';
        labelFadeOverlay.style.top = '0';
        labelFadeOverlay.style.width = '100%';
        labelFadeOverlay.style.height = '100%';
        labelFadeOverlay.style.pointerEvents = 'none';
        labelFadeOverlay.style.background = 'var(--container-bg-color)';
        labelFadeOverlay.style.opacity = '0';
        labelFadeOverlay.style.transition = 'opacity 2s ease';

        const fogOverlay = document.createElement('div');
        fogOverlay.id = 'cosmicRipNearSpaceScannerArrayFogOverlay';
        fogOverlay.style.position = 'absolute';
        fogOverlay.style.left = '0';
        fogOverlay.style.top = '0';
        fogOverlay.style.width = '100%';
        fogOverlay.style.height = '100%';
        fogOverlay.style.display = 'grid';
        fogOverlay.style.gridTemplateColumns = 'repeat(3, 1fr)';
        fogOverlay.style.gridTemplateRows = 'repeat(3, 1fr)';
        fogOverlay.style.pointerEvents = 'none';

        const overlay = document.createElement('div');
        overlay.id = 'cosmicRipNearSpaceScannerArrayOverlay';
        overlay.style.position = 'absolute';
        overlay.style.left = '0';
        overlay.style.top = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.display = 'grid';
        overlay.style.gridTemplateColumns = 'repeat(3, 1fr)';
        overlay.style.gridTemplateRows = 'repeat(3, 1fr)';
        overlay.style.pointerEvents = 'auto';

        const scanLabelOverlay = document.createElement('div');
        scanLabelOverlay.id = 'cosmicRipNearSpaceScannerArrayScanLabelOverlay';
        scanLabelOverlay.style.position = 'absolute';
        scanLabelOverlay.style.left = '0';
        scanLabelOverlay.style.top = '0';
        scanLabelOverlay.style.width = '100%';
        scanLabelOverlay.style.height = '100%';
        scanLabelOverlay.style.display = 'grid';
        scanLabelOverlay.style.gridTemplateColumns = 'repeat(3, 1fr)';
        scanLabelOverlay.style.gridTemplateRows = 'repeat(3, 1fr)';
        scanLabelOverlay.style.pointerEvents = 'none';
        scanLabelOverlay.style.opacity = '1';
        scanLabelOverlay.style.willChange = 'opacity';

        const tooltip = document.createElement('div');
        tooltip.id = 'cosmicRipNearSpaceScannerArrayTooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.zIndex = '2';
        tooltip.style.left = '0';
        tooltip.style.top = '0';
        tooltip.style.transform = 'translate(-9999px, -9999px)';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.padding = '2px 6px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.background = 'var(--container-bg-color)';
        tooltip.style.border = '1px solid rgba(var(--text-color-rgb), 0.25)';
        tooltip.style.color = 'var(--text-color)';
        tooltip.style.fontSize = '0.75rem';

        const sectorNames = [
            'MIAPLAC-7411', 'MIAPLAC-7412', 'MIAPLAC-7413',
            'MIAPLAC-7422', 'MIAPLAC-7423', 'MIAPLAC-7424',
            'MIAPLAC-7432', 'MIAPLAC-7433', 'MIAPLAC-7434'
        ];

        setCosmicRipNearSpaceScannerArraySectorNames(sectorNames);

        for (let i = 0; i < 9; i += 1) {
            const sector = document.createElement('div');
            sector.id = `cosmicRipNearSpaceScannerArraySector${i}`;
            sector.dataset.sectorId = sectorNames[i];
            sector.style.cursor = 'pointer';
            sector.style.pointerEvents = 'auto';
            sector.addEventListener('mouseenter', () => {
                if (getCosmicRipNearSpaceScannerArrayOneSectorState() === true) {
                    return;
                }
                tooltip.textContent = sector.dataset.sectorId || '';
            });
            sector.addEventListener('mousemove', (event) => {
                if (getCosmicRipNearSpaceScannerArrayOneSectorState() === true) {
                    return;
                }
                const rect = telescopeContainer.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                tooltip.style.transform = `translate(${x + 12}px, ${y + 12}px)`;
            });
            sector.addEventListener('mouseleave', () => {
                tooltip.style.transform = 'translate(-9999px, -9999px)';
            });
            sector.addEventListener('click', () => {
                const name = sector.dataset.sectorId;
                const scanLabels = getCosmicRipNearSpaceScannerArrayScanLabelEls();
                const labelEl = Array.isArray(scanLabels) ? scanLabels[i] : null;
                const isActive = !!labelEl && labelEl.classList.contains('green-ready-text') && labelEl.textContent !== 'SCANNED!';
                if (!isActive) {
                    return;
                }

                const result = scanCosmicRipSector?.(i);
                if (result?.ok) {
                    if (result.found) {
                        const interactiveOverlay = getCosmicRipNearSpaceScannerArrayInteractiveOverlayEl?.();
                        if (interactiveOverlay) {
                            interactiveOverlay.style.pointerEvents = 'none';
                        }
                        showNotification(`Scan complete! Cosmic Rip located in sector ${name}`, 'info', 4000, 'cosmicRip');
                        if (getCosmicRipLocatedModalShown() !== true) {
                            setCosmicRipLocatedModalShown(true);
                            window.setTimeout(() => {
                                callPopupModal({
                                    header: modalCosmicRipLocatedHeader,
                                    content: modalCosmicRipLocatedText,
                                    showConfirm: true,
                                    showCancel: false,
                                    showExtra1: false,
                                    showExtra2: false,
                                    onConfirm: () => {
                                        showHideModal();
                                    },
                                    onCancel: null,
                                    onExtra1: null,
                                    onExtra2: null,
                                    confirmLabel: 'CONFIRM',
                                    cancelLabel: '',
                                    extra1Label: '',
                                    extra2Label: '',
                                });
                            }, 2000);
                        }
                    } else {
                        showNotification(`Scan complete! Nothing significant found in sector ${name}`, 'info', 3500, 'cosmicRip');
                    }
                }
            });
            overlay.appendChild(sector);

            const fogCell = document.createElement('div');
            fogCell.id = `cosmicRipNearSpaceScannerArrayFogCell${i}`;
            fogCell.style.background = 'rgba(0, 0, 0, 0.80)';
            fogCell.style.opacity = '1';
            fogCell.style.transition = '';
            fogCell.style.willChange = 'opacity';
            fogCell.style.width = '100%';
            fogCell.style.height = '100%';
            fogOverlay.appendChild(fogCell);

            const scanLabel = document.createElement('div');
            scanLabel.id = `cosmicRipNearSpaceScannerArrayScanLabel${i}`;
            scanLabel.textContent = `Scan ${scanCost} GP`;
            scanLabel.classList.add('red-disabled-text');
            scanLabel.style.display = 'flex';
            scanLabel.style.alignItems = 'center';
            scanLabel.style.justifyContent = 'center';
            scanLabel.style.fontSize = '0.85rem';
            scanLabel.style.fontWeight = '700';
            scanLabel.style.textTransform = 'uppercase';
            scanLabel.style.userSelect = 'none';
            scanLabelOverlay.appendChild(scanLabel);
        }

        const gridOverlay = document.createElement('canvas');
        gridOverlay.id = 'cosmicRipNearSpaceScannerArrayGridOverlay';
        gridOverlay.style.position = 'absolute';
        gridOverlay.style.left = '0';
        gridOverlay.style.top = '0';
        gridOverlay.style.width = '100%';
        gridOverlay.style.height = '100%';
        gridOverlay.style.pointerEvents = 'none';
        gridOverlay.style.zIndex = '10';

        telescopeContainer.appendChild(canvas);
        telescopeContainer.appendChild(labelFadeOverlay);
        telescopeContainer.appendChild(fogOverlay);
        telescopeContainer.appendChild(gridOverlay);
        telescopeContainer.appendChild(overlay);
        telescopeContainer.appendChild(scanLabelOverlay);
        telescopeContainer.appendChild(tooltip);

        const zoomCanvas = document.createElement('canvas');
        zoomCanvas.id = 'cosmicRipNearSpaceScannerArrayZoomCanvas';
        zoomCanvas.style.position = 'absolute';
        zoomCanvas.style.left = '0';
        zoomCanvas.style.top = '0';
        zoomCanvas.style.width = '100%';
        zoomCanvas.style.height = '100%';
        zoomCanvas.style.pointerEvents = 'none';
        zoomCanvas.style.opacity = '0';
        zoomCanvas.style.transformOrigin = '0 0';
        zoomCanvas.style.transform = 'scale(1)';
        zoomCanvas.style.transition = '';
        telescopeContainer.appendChild(zoomCanvas);
        optionContentElement.appendChild(telescopeContainer);

        const deploySensorBuoyRow = createOptionRow({
            labelId: 'cosmicRipNearSpaceScannerArrayDeploySensorBuoyRow',
            renderNameABs: null,
            labelText: 'Sensor Buoy:',
            inputElements: [
                createButton({
                    text: 'DEPLOY',
                    classNames: ['option-button', 'red-disabled-text', 'building-purchase-button', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'sensorBuoyQuantity', 'sensorBuoy', false, null, 'cosmicRip', 'cosmicRip');
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'cosmicRip',
                    objectSectionArgument2: 'sensorBuoy',
                    quantityArgument: 'cash',
                    autoBuyerTier: null,
                    disableKeyboardForButton: true,
                    rowCategory: 'cosmicRipPurchase'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('cosmicRip', ['upgrades', 'sensorBuoy', 'quantity'])}`, 'sensorBuoyQuantity', ['science-building-quantity']),
            ],
            descriptionText: `${getCurrencySymbol() + getResourceDataObject('cosmicRip', ['upgrades', 'sensorBuoy', 'price'])}, ` +
                `${getResourceDataObject('cosmicRip', ['upgrades', 'sensorBuoy', 'resource1Price'])[0]} Titanium, ` +
                `${getResourceDataObject('cosmicRip', ['upgrades', 'sensorBuoy', 'resource2Price'])[0]} Silicon`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'cosmicRip',
            objectSectionArgument2: 'sensorBuoy',
            quantityArgument: 'cash',
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'cosmicRipPurchase',
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        deploySensorBuoyRow.classList.add('invisible');
        optionContentElement.appendChild(deploySensorBuoyRow);

        const deployRipResearchOrbiterRow = createOptionRow({
            labelId: 'cosmicRipNearSpaceScannerArrayDeployRipResearchOrbiterRow',
            renderNameABs: null,
            labelText: 'Rip Research Orbiter:',
            inputElements: [
                createButton({
                    text: 'DEPLOY',
                    classNames: ['option-button', 'red-disabled-text', 'building-purchase-button', 'resource-cost-sell-check'],
                    onClick: () => {
                        gain(1, 'ripResearchOrbiterQuantity', 'ripResearchOrbiter', false, null, 'cosmicRip', 'cosmicRip');
                    },
                    dataConditionCheck: 'upgradeCheck',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'cosmicRip',
                    objectSectionArgument2: 'ripResearchOrbiter',
                    quantityArgument: 'cash',
                    autoBuyerTier: null,
                    disableKeyboardForButton: true,
                    rowCategory: 'cosmicRipPurchase'
                }),
                createTextElement(`Quantity: ${getResourceDataObject('cosmicRip', ['upgrades', 'ripResearchOrbiter', 'quantity'])}`, 'ripResearchOrbiterQuantity', ['science-building-quantity']),
            ],
            descriptionText: `${getCurrencySymbol() + getResourceDataObject('cosmicRip', ['upgrades', 'ripResearchOrbiter', 'price'])}, ` +
                `${getResourceDataObject('cosmicRip', ['upgrades', 'ripResearchOrbiter', 'resource1Price'])[0]} Helium, ` +
                `${getResourceDataObject('cosmicRip', ['upgrades', 'ripResearchOrbiter', 'resource2Price'])[0]} Sodium, ` +
                `${getResourceDataObject('cosmicRip', ['upgrades', 'ripResearchOrbiter', 'resource3Price'])[0]} Steel`,
            resourcePriceObject: '',
            dataConditionCheck: 'upgradeCheck',
            objectSectionArgument1: 'cosmicRip',
            objectSectionArgument2: 'ripResearchOrbiter',
            quantityArgument: 'cash',
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'cosmicRipPurchase',
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        deployRipResearchOrbiterRow.classList.add('invisible');
        optionContentElement.appendChild(deployRipResearchOrbiterRow);

        if (restored && found) {
            deploySensorBuoyRow.classList.remove('invisible');
            deployRipResearchOrbiterRow.classList.remove('invisible');
        }

        setCosmicRipNearSpaceScannerArrayCanvasEl(canvas);
        setCosmicRipNearSpaceScannerArrayGridOverlayEl(gridOverlay);
        setCosmicRipNearSpaceScannerArrayFogOverlayEl(fogOverlay);
        setCosmicRipNearSpaceScannerArrayInteractiveOverlayEl(overlay);
        setCosmicRipNearSpaceScannerArrayScanLabelOverlayEl(scanLabelOverlay);

        setCosmicRipNearSpaceScannerArrayScanLabelEls(Array.from(
            scanLabelOverlay.querySelectorAll('[id^="cosmicRipNearSpaceScannerArrayScanLabel"]')
        ));

        setCosmicRipNearSpaceScannerArrayFogEls(Array.from(
            fogOverlay.querySelectorAll('[id^="cosmicRipNearSpaceScannerArrayFogCell"]')
        ));

        setCosmicRipNearSpaceScannerArrayLabelFadeOverlayEl(labelFadeOverlay);
        setCosmicRipNearSpaceScannerArrayZoomCanvasEl(zoomCanvas);

        const drawCanvas = () => {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const w = canvas.offsetWidth;
            const h = canvas.offsetHeight;
            if (!w || !h) return;

            canvas.width = w;
            canvas.height = h;

            drawSharedSpaceBackdrop(ctx, canvas, { forceBackdropStarBottomRight: true }, 200);
        };

        const drawGridOverlay = () => {
            const ctx = gridOverlay.getContext('2d');
            if (!ctx) return;

            const w = gridOverlay.offsetWidth;
            const h = gridOverlay.offsetHeight;
            if (!w || !h) return;

            gridOverlay.width = w;
            gridOverlay.height = h;

            ctx.clearRect(0, 0, w, h);

            const themeElement = document.querySelector('[data-theme]');
            const disabledColor = themeElement
                ? getComputedStyle(themeElement).getPropertyValue('--disabled-text').trim()
                : 'rgba(255, 0, 0, 0.6)';

            const readyColor = themeElement
                ? getComputedStyle(themeElement).getPropertyValue('--ready-text').trim()
                : 'rgba(0, 255, 0, 0.8)';

            const borderColor = readyColor;

            const scanResults = Array.isArray(getCosmicRipScanResultsBySectorIndex())
                ? getCosmicRipScanResultsBySectorIndex()
                : Array(9).fill(false);
            const gpForUi = Number(getCosmicRipGpForUi()) || 0;
            const scannerRestoredForUi = getCosmicRipScannerRestoredForUi() === true;

            const isOneSectorState = getCosmicRipNearSpaceScannerArrayOneSectorState() === true;

            const drawRoundedRectStroke = (x, y, width, height, radius) => {
                const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2));
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + width - r, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + r);
                ctx.lineTo(x + width, y + height - r);
                ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
                ctx.lineTo(x + r, y + height);
                ctx.quadraticCurveTo(x, y + height, x, y + height - r);
                ctx.lineTo(x, y + r);
                ctx.quadraticCurveTo(x, y, x + r, y);
                ctx.closePath();
                ctx.stroke();
            };

            const drawRipSprite = () => {
                const spriteW = 191;
                const spriteH = 271;
                const themeName = String(document.querySelector('[data-theme]')?.getAttribute?.('data-theme') || '').trim();
                const spriteKey = themeName || 'default';
                if (!getCosmicRipRipSpriteImgCache()) {
                    setCosmicRipRipSpriteImgCache({});
                }
                let spriteImg = getCosmicRipRipSpriteImgCache()?.[spriteKey];
                if (!spriteImg) {
                    spriteImg = new Image();
                    spriteImg.src = `images/ripSprite/rip_${spriteKey}.png`;
                    const cache = getCosmicRipRipSpriteImgCache();
                    if (cache && typeof cache === 'object') {
                        cache[spriteKey] = spriteImg;
                    }
                }

                const candidateSpriteY = 7;

                const spriteX = 100; // position along x row
                const spriteY = candidateSpriteY;
                if (spriteImg && spriteImg.complete && spriteImg.naturalWidth > 0) {
                    ctx.drawImage(spriteImg, spriteX, spriteY, spriteW, spriteH);
                } else if (spriteImg) {
                    spriteImg.onload = () => {
                        try {
                            getCosmicRipNearSpaceScannerArrayDrawCanvas()?.();
                        } catch {
                            // ignore
                        }
                    };
                }
            };

            if (isOneSectorState) {
                drawSharedSpaceBackdrop(ctx, canvas, { forceBackdropStarBottomRight: true }, 260);

                drawRipSprite();

                ctx.save();
                ctx.fillStyle = readyColor;
                ctx.font = 'bold 22px sans-serif';
                ctx.textBaseline = 'top';

                const idx = Number(getCosmicRipFoundSectorIndexForZoom());
                const safeIdx = Number.isFinite(idx) ? Math.max(0, Math.min(8, Math.floor(idx))) : 0;
                const sectorLabel = sectorNames?.[safeIdx] || '';
                ctx.fillText(String(sectorLabel).toUpperCase(), 14, 12);

                ctx.strokeStyle = borderColor;
                ctx.lineWidth = 3;
                drawRoundedRectStroke(6, 6, w - 12, h - 12, 14);
                ctx.restore();
                return;
            }

            ctx.save();
            ctx.strokeStyle = readyColor;
            ctx.lineWidth = 1;

            const cellW = w / 3;
            const cellH = h / 3;

            for (let col = 1; col <= 2; col += 1) {
                const x = Math.round(col * cellW) + 0.5;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }

            for (let row = 1; row <= 2; row += 1) {
                const y = Math.round(row * cellH) + 0.5;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }

            ctx.font = 'bold 11px sans-serif';
            ctx.textBaseline = 'top';

            for (let i = 0; i < 9; i += 1) {
                const col = i % 3;
                const row = Math.floor(i / 3);
                const label = sectorNames[i];
                const x = col * cellW + 6;
                const y = row * cellH + 6;
                const scanned = scanResults?.[i] === true;
                const ready = scanned || (scannerRestoredForUi && gpForUi > 0);
                ctx.fillStyle = ready ? readyColor : disabledColor;
                ctx.fillText(String(label).toUpperCase(), x, y);
            }

            ctx.restore();
        };

        setCosmicRipNearSpaceScannerArrayDrawCanvas(() => {
            drawCanvas();
            drawGridOverlay();
        });

        drawCanvas();
        drawGridOverlay();
        if (!getCosmicRipNearSpaceScannerArrayResizeAttached()) {
            setCosmicRipNearSpaceScannerArrayResizeAttached(true);
            window.addEventListener('resize', () => {
                drawCanvas();
                drawGridOverlay();
            });
        }
        return;
    }

    if (heading === 'Cosmic Rip') {
        const headerRow = document.getElementById('headerContentTab8');
        if (headerRow) {
            headerRow.innerHTML = `Cosmic Rip <p id="info_cosmicRipHeader" class="info-emoji">ℹ️</p>`;
        }
        setupInfoTooltips();

        const restored = getCosmicRipNearSpaceScannerArrayRestored?.() === true;
        const found = getCosmicRipRipFound?.() === true;

        const statusRow = createOptionRow({
            labelId: 'cosmicRipCosmicRipStatusRow',
            renderNameABs: null,
            labelText: 'Cosmic Rip:',
            inputElements: [
                createTextElement(`<div id="cosmicRipStabilityProgressBar">`, `cosmicRipStabilityProgressBarContainer`, ['progress-bar-container']),
                createButton({
                    text: '0%',
                    classNames: ['no-interaction', 'option-button', 'cosmic-rip-progress-bar-button-margin', 'id_cosmicRipStabilityPercentageText'],
                    onClick: () => {},
                    disableKeyboardForButton: true,
                    rowCategory: null
                }),
            ],
            descriptionText: '',
            resourcePriceObject: '',
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: null,
            noDescriptionContainer: [true, '15%', '70%'],
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        statusRow.classList.remove('invisible');
        optionContentElement.appendChild(statusRow);

        setTimeout(() => {
            const progressBar = document.getElementById('cosmicRipStabilityProgressBar');
            const percentageText = document.getElementById('cosmicRipStabilityPercentageText');
            if (progressBar && percentageText) {
                const cosmicRipTechs = getResourceDataObject('cosmicRip', ['techs']);
                if (cosmicRipTechs) {
                    const totalTechs = Object.keys(cosmicRipTechs).length;
                    const unlockedTechs = getCosmicRipTechUnlockedArray().length;
                    const percentage = totalTechs > 0 ? Math.round((unlockedTechs / totalTechs) * 100) : 0;
                    progressBar.style.width = `${percentage}%`;
                    percentageText.textContent = `${percentage}% Stabilised`;
                }
            }
        }, 0);

        const stabilizerArrayRow = createOptionRow({
            labelId: 'cosmicRipStabilizerArrayRow',
            renderNameABs: null,
            labelText: 'Stabilizer Array:',
            inputElements: [
                createTextElement(`<div id="cosmicRipTechProgressBar_stabilizerArray">`, `cosmicRipTechProgressBarContainer_stabilizerArray`, ['progress-bar-container', 'invisible']),
                createButton({
                    text: 'Research',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'cosmic-rip-tech-unlock', 'cosmic-rip-build-stabilizer-array-button', 'id_cosmicRipTechResearchButton_stabilizerArray'],
                    onClick: () => {
                        gain(1, null, 'stabilizerArray', true, null, 'cosmicRipTech', 'tech');
                        const btn = document.getElementById('cosmicRipTechResearchButton_stabilizerArray');
                        const progressBarContainer = document.getElementById('cosmicRipTechProgressBarContainer_stabilizerArray');
                        if (btn) btn.classList.add('invisible');
                        if (progressBarContainer) progressBarContainer.classList.remove('invisible');
                    },
                    dataConditionCheck: 'cosmicRipTechUnlock',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'stabilizerArray',
                    quantityArgument: 'ripTelemetryData',
                    disableKeyboardForButton: true,
                    rowCategory: 'cosmicRipBuildStabilizerArray'
                }),
            ],
            descriptionText: `<span id="cosmicRipTechDescription_stabilizerArray"><span id="stabilizerArrayTelemetry">${getResourceDataObject('cosmicRip', ['techs', 'stabilizerArray', 'price'])} Telemetry Data<span id="stabilizerArrayComma1">, </span></span><span id="stabilizerArrayGP">1GP<span id="stabilizerArrayComma2">, </span></span>${getResourceDataObject('cosmicRip', ['techs', 'stabilizerArray', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? '' : ''}<span id="stabilizerArrayPrereq">${getResourceDataObject('cosmicRip', ['techs', 'stabilizerArray', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span></span>`,
            resourcePriceObject: '',
            dataConditionCheck: 'cosmicRipTechUnlock',
            objectSectionArgument1: 'stabilizerArray',
            objectSectionArgument2: null,
            quantityArgument: 'ripTelemetryData',
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'tech',
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        stabilizerArrayRow.classList.add('invisible');
        optionContentElement.appendChild(stabilizerArrayRow);

        const quantumContainmentFieldRow = createOptionRow({
            labelId: 'cosmicRipQuantumContainmentFieldRow',
            renderNameABs: null,
            labelText: 'Quantum Containment Field:',
            inputElements: [
                createTextElement(`<div id="cosmicRipTechProgressBar_quantumContainmentField">`, `cosmicRipTechProgressBarContainer_quantumContainmentField`, ['progress-bar-container', 'invisible']),
                createButton({
                    text: 'Research',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'cosmic-rip-tech-unlock', 'cosmic-rip-build-stabilizer-array-button', 'id_cosmicRipTechResearchButton_quantumContainmentField'],
                    onClick: () => {
                        gain(1, null, 'quantumContainmentField', true, null, 'cosmicRipTech', 'tech');
                        const btn = document.getElementById('cosmicRipTechResearchButton_quantumContainmentField');
                        const progressBarContainer = document.getElementById('cosmicRipTechProgressBarContainer_quantumContainmentField');
                        if (btn) btn.classList.add('invisible');
                        if (progressBarContainer) progressBarContainer.classList.remove('invisible');
                    },
                    dataConditionCheck: 'cosmicRipTechUnlock',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'quantumContainmentField',
                    quantityArgument: 'ripTelemetryData',
                    disableKeyboardForButton: true,
                    rowCategory: 'cosmicRipBuildStabilizerArray'
                }),
            ],
            descriptionText: `<span id="cosmicRipTechDescription_quantumContainmentField"><span id="quantumContainmentFieldTelemetry">${getResourceDataObject('cosmicRip', ['techs', 'quantumContainmentField', 'price'])} Telemetry Data<span id="quantumContainmentFieldComma1">, </span></span><span id="quantumContainmentFieldGP">1GP<span id="quantumContainmentFieldComma2">, </span></span>${getResourceDataObject('cosmicRip', ['techs', 'quantumContainmentField', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? '' : ''}<span id="quantumContainmentFieldPrereq">${getResourceDataObject('cosmicRip', ['techs', 'quantumContainmentField', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span></span>`,
            resourcePriceObject: '',
            dataConditionCheck: 'cosmicRipTechUnlock',
            objectSectionArgument1: 'quantumContainmentField',
            objectSectionArgument2: null,
            quantityArgument: 'ripTelemetryData',
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'tech',
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        quantumContainmentFieldRow.classList.add('invisible');
        optionContentElement.appendChild(quantumContainmentFieldRow);

        const dimensionalAnchorMatrixRow = createOptionRow({
            labelId: 'cosmicRipDimensionalAnchorMatrixRow',
            renderNameABs: null,
            labelText: 'Dimensional Anchor Matrix:',
            inputElements: [
                createTextElement(`<div id="cosmicRipTechProgressBar_dimensionalAnchorMatrix">`, `cosmicRipTechProgressBarContainer_dimensionalAnchorMatrix`, ['progress-bar-container', 'invisible']),
                createButton({
                    text: 'Research',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'cosmic-rip-tech-unlock', 'cosmic-rip-build-stabilizer-array-button', 'id_cosmicRipTechResearchButton_dimensionalAnchorMatrix'],
                    onClick: () => {
                        gain(1, null, 'dimensionalAnchorMatrix', true, null, 'cosmicRipTech', 'tech');
                        const btn = document.getElementById('cosmicRipTechResearchButton_dimensionalAnchorMatrix');
                        const progressBarContainer = document.getElementById('cosmicRipTechProgressBarContainer_dimensionalAnchorMatrix');
                        if (btn) btn.classList.add('invisible');
                        if (progressBarContainer) progressBarContainer.classList.remove('invisible');
                    },
                    dataConditionCheck: 'cosmicRipTechUnlock',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'dimensionalAnchorMatrix',
                    quantityArgument: 'ripTelemetryData',
                    disableKeyboardForButton: true,
                    rowCategory: 'cosmicRipBuildStabilizerArray'
                }),
            ],
            descriptionText: `<span id="cosmicRipTechDescription_dimensionalAnchorMatrix"><span id="dimensionalAnchorMatrixTelemetry">${getResourceDataObject('cosmicRip', ['techs', 'dimensionalAnchorMatrix', 'price'])} Telemetry Data<span id="dimensionalAnchorMatrixComma1">, </span></span><span id="dimensionalAnchorMatrixGP">1GP<span id="dimensionalAnchorMatrixComma2">, </span></span>${getResourceDataObject('cosmicRip', ['techs', 'dimensionalAnchorMatrix', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? '' : ''}<span id="dimensionalAnchorMatrixPrereq">${getResourceDataObject('cosmicRip', ['techs', 'dimensionalAnchorMatrix', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span></span>`,
            resourcePriceObject: '',
            dataConditionCheck: 'cosmicRipTechUnlock',
            objectSectionArgument1: 'dimensionalAnchorMatrix',
            objectSectionArgument2: null,
            quantityArgument: 'ripTelemetryData',
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'tech',
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        dimensionalAnchorMatrixRow.classList.add('invisible');
        optionContentElement.appendChild(dimensionalAnchorMatrixRow);

        const singularityStabilizerRow = createOptionRow({
            labelId: 'cosmicRipSingularityStabilizerRow',
            renderNameABs: null,
            labelText: 'Singularity Stabilizer:',
            inputElements: [
                createTextElement(`<div id="cosmicRipTechProgressBar_singularityStabilizer">`, `cosmicRipTechProgressBarContainer_singularityStabilizer`, ['progress-bar-container', 'invisible']),
                createButton({
                    text: 'Research',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'cosmic-rip-tech-unlock', 'cosmic-rip-build-stabilizer-array-button', 'id_cosmicRipTechResearchButton_singularityStabilizer'],
                    onClick: () => {
                        gain(1, null, 'singularityStabilizer', true, null, 'cosmicRipTech', 'tech');
                        const btn = document.getElementById('cosmicRipTechResearchButton_singularityStabilizer');
                        const progressBarContainer = document.getElementById('cosmicRipTechProgressBarContainer_singularityStabilizer');
                        if (btn) btn.classList.add('invisible');
                        if (progressBarContainer) progressBarContainer.classList.remove('invisible');
                    },
                    dataConditionCheck: 'cosmicRipTechUnlock',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'singularityStabilizer',
                    quantityArgument: 'ripTelemetryData',
                    disableKeyboardForButton: true,
                    rowCategory: 'cosmicRipBuildStabilizerArray'
                }),
            ],
            descriptionText: `<span id="cosmicRipTechDescription_singularityStabilizer"><span id="singularityStabilizerTelemetry">${getResourceDataObject('cosmicRip', ['techs', 'singularityStabilizer', 'price'])} Telemetry Data<span id="singularityStabilizerComma1">, </span></span><span id="singularityStabilizerGP">1GP<span id="singularityStabilizerComma2">, </span></span>${getResourceDataObject('cosmicRip', ['techs', 'singularityStabilizer', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? '' : ''}<span id="singularityStabilizerPrereq">${getResourceDataObject('cosmicRip', ['techs', 'singularityStabilizer', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span></span>`,
            resourcePriceObject: '',
            dataConditionCheck: 'cosmicRipTechUnlock',
            objectSectionArgument1: 'singularityStabilizer',
            objectSectionArgument2: null,
            quantityArgument: 'ripTelemetryData',
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'tech',
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        singularityStabilizerRow.classList.add('invisible');
        optionContentElement.appendChild(singularityStabilizerRow);

        const realityWeaveRegulatorRow = createOptionRow({
            labelId: 'cosmicRipRealityWeaveRegulatorRow',
            renderNameABs: null,
            labelText: 'Reality Weave Regulator:',
            inputElements: [
                createTextElement(`<div id="cosmicRipTechProgressBar_realityWeaveRegulator">`, `cosmicRipTechProgressBarContainer_realityWeaveRegulator`, ['progress-bar-container', 'invisible']),
                createButton({
                    text: 'Research',
                    classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'cosmic-rip-tech-unlock', 'cosmic-rip-build-stabilizer-array-button', 'id_cosmicRipTechResearchButton_realityWeaveRegulator'],
                    onClick: () => {
                        gain(1, null, 'realityWeaveRegulator', true, null, 'cosmicRipTech', 'tech');
                        const btn = document.getElementById('cosmicRipTechResearchButton_realityWeaveRegulator');
                        const progressBarContainer = document.getElementById('cosmicRipTechProgressBarContainer_realityWeaveRegulator');
                        if (btn) btn.classList.add('invisible');
                        if (progressBarContainer) progressBarContainer.classList.remove('invisible');
                    },
                    dataConditionCheck: 'cosmicRipTechUnlock',
                    resourcePriceObject: '',
                    objectSectionArgument1: 'realityWeaveRegulator',
                    quantityArgument: 'ripTelemetryData',
                    disableKeyboardForButton: true,
                    rowCategory: 'cosmicRipBuildStabilizerArray'
                }),
            ],
            descriptionText: `<span id="cosmicRipTechDescription_realityWeaveRegulator"><span id="realityWeaveRegulatorTelemetry">${getResourceDataObject('cosmicRip', ['techs', 'realityWeaveRegulator', 'price'])} Telemetry Data<span id="realityWeaveRegulatorComma1">, </span></span><span id="realityWeaveRegulatorGP">1GP<span id="realityWeaveRegulatorComma2">, </span></span>${getResourceDataObject('cosmicRip', ['techs', 'realityWeaveRegulator', 'prereqs']).filter(prereq => prereq !== null).length > 0 ? '' : ''}<span id="realityWeaveRegulatorPrereq">${getResourceDataObject('cosmicRip', ['techs', 'realityWeaveRegulator', 'prereqs']).filter(prereq => prereq !== null).join(', ') || ''}</span></span>`,
            resourcePriceObject: '',
            dataConditionCheck: 'cosmicRipTechUnlock',
            objectSectionArgument1: 'realityWeaveRegulator',
            objectSectionArgument2: null,
            quantityArgument: 'ripTelemetryData',
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'tech',
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        realityWeaveRegulatorRow.classList.add('invisible');
        optionContentElement.appendChild(realityWeaveRegulatorRow);
        return;
    }
}
