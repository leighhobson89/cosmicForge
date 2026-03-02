import { createButton, createOptionRow, createTextElement, setButtonState, showNotification, drawSharedSpaceBackdrop, callPopupModal, showHideModal } from './ui.js';
import {
    modalCosmicRipLocatedHeader,
    modalCosmicRipLocatedText,
    modalNearSpaceScannerArrayRestoredHeader,
    modalNearSpaceScannerArrayRestoredText,
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
    getCosmicRipNearSpaceScannerArrayFogEls,
    setCosmicRipNearSpaceScannerArraySectorNames,
    getCosmicRipNearSpaceScannerArraySectorNames,
    setCosmicRipNearSpaceScannerArrayOneSectorState,
    getCosmicRipNearSpaceScannerArrayOneSectorState,
    setCosmicRipFoundSectorIndexForZoom,
    getCosmicRipFoundSectorIndexForZoom,
    setCosmicRipNearSpaceScannerArrayCanvasEl,
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
} from './constantsAndGlobalVars.js';

import { getCurrencySymbol } from './constantsAndGlobalVars.js';

import { getResourceDataObject } from './resourceDataObject.js';

import { gain } from './game.js';

export function drawTab8Content(heading, optionContentElement) {
    if (heading === 'Situation') {
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
                        callPopupModal(
                            modalNearSpaceScannerArrayRestoredHeader,
                            modalNearSpaceScannerArrayRestoredText,
                            true,
                            false,
                            false,
                            false,
                            () => {
                                showHideModal();
                            },
                            null,
                            null,
                            null,
                            'CONFIRM',
                            '',
                            '',
                            ''
                        );
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

        const cosmicRipResearchRow = createOptionRow({
            labelId: 'cosmicRipSituationResearchRow',
            renderNameABs: null,
            labelText: 'Cosmic Rip Research:',
            inputElements: [
                createTextElement('0 pts (L0)', 'cosmicRipSituationResearchText', []),
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
        cosmicRipResearchRow.classList.add('invisible');

        optionContentElement.appendChild(restoreRow);
        optionContentElement.appendChild(restoredRow);
        optionContentElement.appendChild(cosmicRipStatusRow);
        optionContentElement.appendChild(cosmicRipObjectiveRow);
        optionContentElement.appendChild(cosmicRipResearchRow);

        const btn = optionContentElement.querySelector?.('.cosmic-rip-restore-scanner-array-button');
        if (btn) {
            const canRestore = gp >= restoreCost;
            setButtonState(btn, { enabled: canRestore, ready: canRestore });
        }
        return;
    }

    if (heading === 'Near Space Scanner Array') {
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
                        showNotification(`Scan complete! Cosmic Rip located in sector ${name}`, 'info', 4000, 'cosmicRip');
                        if (getCosmicRipLocatedModalShown() !== true) {
                            setCosmicRipLocatedModalShown(true);
                            window.setTimeout(() => {
                                callPopupModal(
                                    modalCosmicRipLocatedHeader,
                                    modalCosmicRipLocatedText,
                                    true,
                                    false,
                                    false,
                                    false,
                                    () => {
                                        showHideModal();
                                    },
                                    null,
                                    null,
                                    null,
                                    'CONFIRM',
                                    '',
                                    '',
                                    ''
                                );
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

        telescopeContainer.appendChild(canvas);
        telescopeContainer.appendChild(labelFadeOverlay);
        telescopeContainer.appendChild(fogOverlay);
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

                const idx = Number(getCosmicRipFoundSectorIndexForZoom());
                const safeIdx = Number.isFinite(idx) ? Math.max(0, Math.min(8, Math.floor(idx))) : 0;
                const sectorLabel = sectorNames?.[safeIdx] || '';

                ctx.save();
                ctx.fillStyle = readyColor;
                ctx.font = 'bold 22px sans-serif';
                ctx.textBaseline = 'top';
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

        setCosmicRipNearSpaceScannerArrayDrawCanvas(drawCanvas);

        drawCanvas();
        if (!getCosmicRipNearSpaceScannerArrayResizeAttached()) {
            setCosmicRipNearSpaceScannerArrayResizeAttached(true);
            window.addEventListener('resize', drawCanvas);
        }
        return;
    }

    if (heading === 'Cosmic Rip') {
        const restored = getCosmicRipNearSpaceScannerArrayRestored?.() === true;
        const found = getCosmicRipRipFound?.() === true;

        const statusRow = createOptionRow({
            labelId: 'cosmicRipCosmicRipStatusRow',
            renderNameABs: null,
            labelText: 'Cosmic Rip:',
            inputElements: null,
            descriptionText: `<span id="cosmicRipCosmicRipStageText" class="warning-orange-text">Unknown</span>`,
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
        statusRow.classList.add('invisible');
        optionContentElement.appendChild(statusRow);

        const stabilizerProjectRow = createOptionRow({
            labelId: 'cosmicRipCosmicRipStabilizerProjectRow',
            renderNameABs: null,
            labelText: 'Stabilizer Array:',
            inputElements: [
                createButton({
                    text: 'BUILD',
                    classNames: ['option-button', 'red-disabled-text', 'cosmic-rip-build-stabilizer-array-button'],
                    onClick: () => {
                        showNotification('Coming soon', 'info', 2500, 'cosmicRip');
                    },
                    disableKeyboardForButton: true,
                    rowCategory: 'cosmicRipBuildStabilizerArray'
                }),
            ],
            descriptionText: 'Construct stabilizers to reduce instability and unlock safe operations.',
            resourcePriceObject: '',
            dataConditionCheck: null,
            objectSectionArgument1: null,
            objectSectionArgument2: null,
            quantityArgument: null,
            autoBuyerTier: null,
            startInvisibleValue: false,
            resourceString: null,
            optionalIterationParam: null,
            rowCategory: 'cosmicRipBuildStabilizerArray',
            noDescriptionContainer: false,
            specialInputContainerClasses: null,
            hideMainDescriptionRow: false
        });
        stabilizerProjectRow.classList.add('invisible');
        optionContentElement.appendChild(stabilizerProjectRow);

        if (restored) {
            statusRow.classList.remove('invisible');
        }
        if (restored && found) {
            stabilizerProjectRow.classList.remove('invisible');
        }
        return;
    }
}
