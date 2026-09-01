import { createButton, createRow, createSection, createPane, createPriceLabel, createTextElement, removeTabAttentionIfNoIndicators, setButtonState, showNotification, drawSharedSpaceBackdrop, callPopupModal, showHideModal, playWinCinematic2, setupInfoTooltips } from './ui.js';
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
    getCosmicRipRipFoundUiSequenceStarted,
    setCosmicRipRipFoundUiSequenceStarted,
} from './constantsAndGlobalVars.js';

import {
    getCurrencySymbol,
    getGalacticPointsSpent,
    setGalacticPointsSpent,
    setAchievementFlagArray
} from './constantsAndGlobalVars.js';

import { getResourceDataObject } from './resourceDataObject.js';
import { getOptionDescription } from './descriptions.js';

import { gain } from './game.js';
import { localize, localizeMaterialName } from './localization.js';
import { capitaliseString } from './utilityFunctions.js';
import { getLanguage } from './constantsAndGlobalVars.js';

// Cosmic Rip tech prerequisites are stored as English display names rather than
// as tech keys, so they need mapping back to a key before they can be localized.
const COSMIC_RIP_TECH_NAME_KEYS = {
    'Stabilizer Array': 'cosmicRipTechNameStabilizerArray',
    'Quantum Containment Field': 'cosmicRipTechNameQuantumContainmentField',
    'Dimensional Anchor Matrix': 'cosmicRipTechNameDimensionalAnchorMatrix',
    'Singularity Stabilizer': 'cosmicRipTechNameSingularityStabilizer',
    'Reality Weave Regulator': 'cosmicRipTechNameRealityWeaveRegulator'
};

const localizeCosmicRipPrereqs = (prereqs) => (prereqs || [])
    .filter((prereq) => prereq !== null)
    .map((prereq) => (COSMIC_RIP_TECH_NAME_KEYS[prereq] ? localize(COSMIC_RIP_TECH_NAME_KEYS[prereq], getLanguage()) : prereq))
    .join(', ');

// The cosmicRip upgrade price tuples are [quantity, key, section], so the
// material names in the cost lines resolve the same way as everywhere else.
const cosmicRipUpgradePriceName = (upgrade, slot) => {
    const price = getResourceDataObject('cosmicRip', ['upgrades', upgrade, `resource${slot}Price`]);
    return localizeMaterialName(price[1], price[2], getLanguage());
};

/**
 * The prose descriptions.js holds for a row, as the row's `detail`.
 *
 * The legacy renderer did this for every row without being asked: it looked the
 * row id up in descriptions.js and drew the sentence as a permanent band above
 * the row (ui.js:4201). `createRow` deliberately does not — a layout primitive
 * that reaches into a game data file is the coupling this refactor is removing —
 * so the call site has to hand the prose over, and the first migration of this
 * tab did not. Eight localised sentences (`optionDescCosmicRip…`) stopped being
 * drawn at all, which is the one thing this refactor may not do.
 *
 * They come back behind a disclosure rather than as a band, the same treatment
 * the Ascendency Perks pane established in Phase 3: the sentence explains a
 * purchase the row already names, so it is an aside rather than the row's point,
 * and the pane is dense enough that a fifth column would squeeze the progress
 * bars and prices that carry the row's live data.
 */
function rowDetail(rowId) {
    return getOptionDescription(rowId)?.content1 ?? null;
}

const DETAIL_LABEL = { key: 'uiRowDetailsLabel' };

export function drawTab8Content(heading, optionContentElement) {
    // The row's own marker is cleared by the click that opened this pane — see
    // clearOptionRowAttentionIndicator in ui.js. This tab was also the only one
    // with no tab-badge sweep at all, so tab 8 kept its badge after every option
    // had been visited.
    removeTabAttentionIfNoIndicators('tab8');

    if (heading === 'Situation') {
        const headerRow = document.getElementById('headerContentTab8');
        if (headerRow) {
            headerRow.innerHTML = `${localize('headerMainSituation', getLanguage())} <p id="info_situationHeader" class="info-emoji">ℹ️</p>`;
        }
        setupInfoTooltips();

        const restored = getCosmicRipNearSpaceScannerArrayRestored?.() === true;
        const gp = Number(getCosmicRipGalacticPoints?.()) || 0;
        const restoreCost = Number(getNearSpaceScannerArrayRestoreCostGp?.()) || 10;

        // Large UI refactor, Phase 4 — tab 8 (docs/largeUIRefactor.md).
        //
        // This pane is five heterogeneous rows: one purchase and four status
        // readouts. It is drawn with NO column headings on purpose — a heading is
        // written once per section and earns its line when every row means the
        // same thing by that column, which is true of the perk list and false
        // here. "Cost" over a column only one row fills is a caption for a single
        // cell.
        //
        // Every id the frame loop reaches for is unchanged: cosmicRipSituationStatusRow
        // and cosmicRipSituationObjectiveRow are toggled by id (game.js:1760),
        // closeCosmicRipRow by id with its button found inside it, and the three
        // status texts by their own ids.
        const restoreRow = createRow({
            id: 'cosmicRipRestoreNearSpaceScannerArrayRow',
            title: localize('tab8NearSpaceScannerArrayRowLabel', getLanguage()),
            actions: [
                createButton({
                    text: localize('buttonRestore', getLanguage()),
                    classNames: ['option-button', 'red-disabled-text', 'cosmic-rip-restore-scanner-array-button'],
                    onClick: () => {
                        const result = restoreNearSpaceScannerArray?.();
                        if (!result?.ok) {
                            showNotification(localize('notificationScannerArrayRestoreFailed', getLanguage()), 'warning', 3000, 'cosmicRip');
                            return;
                        }
                        showNotification(localize('notificationScannerArrayRestored', getLanguage()), 'info', 3000, 'cosmicRip');
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
                            confirmLabel: localize('buttonConfirm', getLanguage()),
                            cancelLabel: '',
                            extra1Label: '',
                            extra2Label: '',
                        });
                    },
                    disableKeyboardForButton: true,
                    rowCategory: 'cosmicRipRestoreNearSpaceScannerArray'
                }),
            ],
            // No `dataConditionCheck`, so nothing in the frame loop reads this
            // cell — it is a plain price, and it goes in the cost track as one.
            cost: [createTextElement(
                `${localize('labelCost', getLanguage())} <span class="warning-orange-text">${restoreCost}</span> GP`,
                'cosmicRipRestoreNearSpaceScannerArrayCostText',
                []
            )],
            dataset: { rowCategory: 'cosmicRipRestoreNearSpaceScannerArray' }
        });

        if (restored) {
            restoreRow.classList.add('invisible');
        }

        const restoredRow = createRow({
            id: 'cosmicRipNearSpaceScannerArrayRestoredStatusRow',
            title: localize('tab8NearSpaceScannerArrayRowLabel', getLanguage()),
            // The status readout is the row's one live field, rewritten by id on
            // every tick (game.js:1676), so it is passed through as an element
            // rather than rebuilt from text the row would then hold a stale copy of.
            stat: createTextElement(localize('textRequiresRestoration', getLanguage()), 'cosmicRipNearSpaceScannerArraySituationStatusText', ['red-disabled-text'])
        });

        const cosmicRipStatusRow = createRow({
            id: 'cosmicRipSituationStatusRow',
            title: localize('tab8CosmicRipStatusRowLabel', getLanguage()),
            stat: createTextElement(localize('textNotLocated', getLanguage()), 'cosmicRipSituationStatusText', ['red-disabled-text']),
            hidden: true
        });

        const cosmicRipObjectiveRow = createRow({
            id: 'cosmicRipSituationObjectiveRow',
            title: localize('tab8NextObjectiveRowLabel', getLanguage()),
            stat: createTextElement(localize('textObjectiveScanLocalSectors', getLanguage()), 'cosmicRipSituationObjectiveText', ['green-ready-text']),
            hidden: true
        });

        const closeCosmicRipRow = createRow({
            id: 'closeCosmicRipRow',
            title: localize('tab8CloseRipRowLabel', getLanguage()),
            actions: [
                createButton({
                    text: localize('buttonCloseCosmicRip', getLanguage()),
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
                                    confirmLabel: localize('modalEndGameConfirmLabel', getLanguage()),
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
            // The frame loop colours this span green or red by id every tick to
            // say whether the galactic point can be afforded (game.js:1776), so
            // it is handed over as an element too.
            cost: [createTextElement('<span id="closeCosmicRipCostGP">1GP</span>', 'closeCosmicRipCostContainer', [])]
        });

        optionContentElement.appendChild(createPane({
            id: 'cosmicRipSituationPane',
            // Three of this pane's five rows are a label and a live status
            // sentence, and the sentence is the row. At the default
            // `minmax(6ch, 0.55fr)` — a track sized for a quantity — "Cosmic Rip
            // Fully Stabilised and Secured" wrapped onto three lines beside 250px
            // of empty cost track. The stat track is the widest thing on this
            // pane, so the pane says so once for all five rows.
            tracks: { title: 'minmax(11ch, 0.85fr)', stat: 'minmax(28ch, 2.4fr)' },
            sections: [createSection({
                id: 'cosmicRipSituationSection',
                bare: true,
                rows: [restoreRow, restoredRow, cosmicRipStatusRow, cosmicRipObjectiveRow, closeCosmicRipRow]
            })]
        }));

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
            headerRow.innerHTML = `${localize('headerMainNearSpaceScannerArray', getLanguage())} <p id="info_nearSpaceScannerArrayHeader" class="info-emoji">ℹ️</p>`;
        }
        setupInfoTooltips();

        const restored = getCosmicRipNearSpaceScannerArrayRestored?.() === true;
        const found = getCosmicRipRipFound?.() === true;
        const gp = Number(getCosmicRipGalacticPoints?.()) || 0;
        const scanCost = Number(getCosmicRipSectorScanCostGp?.()) || 1;
        const sectorCount = Number(getCosmicRipSectorCount?.()) || 9;

        // Large UI refactor, Phase 4 — tab 8.
        //
        // The map's caption is a title-only row, and it is a `full` variant
        // because there is nothing on screen to line it up with: the sector
        // canvas beneath it is not a row at all, and the two deploy rows below
        // the canvas are their own group. Four tracks would put its label in a
        // column no other row shares.
        //
        // The label carries its own id now. The frame loop used to find it with
        // `document.querySelector('.option-row-main div label')` (game.js:1805) —
        // the FIRST such element anywhere in the document, which merely happened
        // to be this one. That selector could not survive a migration and was
        // never safe; it is an id lookup now, with a real null check.
        const statusRowLabel = createTextElement(
            localize('tab8SectorsMapRowLabel', getLanguage()),
            'cosmicRipNearSpaceScannerArrayStatusLabel',
            []
        );

        optionContentElement.appendChild(createPane({
            id: 'cosmicRipNearSpaceScannerArrayCaptionPane',
            sections: [createSection({
                id: 'cosmicRipNearSpaceScannerArrayCaptionSection',
                bare: true,
                rows: [createRow({
                    id: 'cosmicRipNearSpaceScannerArrayStatusRow',
                    variant: 'full',
                    actions: [statusRowLabel]
                })]
            })]
        }));

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
                const isActive = !!labelEl && labelEl.classList.contains('green-ready-text') && labelEl.dataset.scanned !== 'true';
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
                        showNotification(localize('notificationSectorScanFound', getLanguage()).replace('{sector}', name), 'info', 4000, 'cosmicRip');
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
                                    confirmLabel: localize('buttonConfirm', getLanguage()),
                                    cancelLabel: '',
                                    extra1Label: '',
                                    extra2Label: '',
                                });
                            }, 2000);
                        }
                    } else {
                        showNotification(localize('notificationSectorScanEmpty', getLanguage()).replace('{sector}', name), 'info', 3500, 'cosmicRip');
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
            scanLabel.textContent = localize('textSectorScanCost', getLanguage()).replace('{cost}', scanCost);
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

        // The two deploy rows share one pane so their Deploy buttons share one
        // left edge. The canvas above them is not a row and is deliberately left
        // outside it: the container sizes itself with `height: 100%` against the
        // flex column, which is a real dependency on the shell and not something
        // to change while migrating a row system.
        const deploySensorBuoyRow = createRow({
            id: 'cosmicRipNearSpaceScannerArrayDeploySensorBuoyRow',
            title: localize('tab8SensorBuoyRowLabel', getLanguage()),
            detail: rowDetail('cosmicRipNearSpaceScannerArrayDeploySensorBuoyRow'),
            detailLabel: DETAIL_LABEL,
            actions: [
                createButton({
                    text: localize('buttonDeploy', getLanguage()),
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
            ],
            // The owned count is its own field now, in the stat track. It used to
            // be a fourth thing crammed into the 50% input container beside the
            // Deploy button. The frame loop rewrites it every tick as
            // "Quantity: N" (game.js:2159), so it labels itself.
            stat: createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('cosmicRip', ['upgrades', 'sensorBuoy', 'quantity'])}`, 'sensorBuoyQuantity', ['science-building-quantity']),
            // The price label is the element the frame loop finds by class, by id
            // and by data-*, and it wears the `red-disabled-text` that IS this
            // game's affordability gate. It is built by the same factory the
            // legacy renderer uses and simply placed in the cost track.
            cost: [createPriceLabel({
                labelId: 'cosmicRipNearSpaceScannerArrayDeploySensorBuoyRow',
                html: `${getCurrencySymbol() + getResourceDataObject('cosmicRip', ['upgrades', 'sensorBuoy', 'price'])}, ` +
                    `${getResourceDataObject('cosmicRip', ['upgrades', 'sensorBuoy', 'resource1Price'])[0]} ${cosmicRipUpgradePriceName('sensorBuoy', 1)}, ` +
                    `${getResourceDataObject('cosmicRip', ['upgrades', 'sensorBuoy', 'resource2Price'])[0]} ${cosmicRipUpgradePriceName('sensorBuoy', 2)}`,
                rowCategory: 'cosmicRipPurchase',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'cosmicRip',
                objectSectionArgument2: 'sensorBuoy',
                quantityArgument: 'cash'
            })],
            dataset: {
                conditionCheck: 'upgradeCheck',
                type: 'cosmicRip',
                rowCategory: 'cosmicRipPurchase'
            },
            hidden: true
        });

        const deployRipResearchOrbiterRow = createRow({
            id: 'cosmicRipNearSpaceScannerArrayDeployRipResearchOrbiterRow',
            title: localize('tab8RipResearchOrbiterRowLabel', getLanguage()),
            detail: rowDetail('cosmicRipNearSpaceScannerArrayDeployRipResearchOrbiterRow'),
            detailLabel: DETAIL_LABEL,
            actions: [
                createButton({
                    text: localize('buttonDeploy', getLanguage()),
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
            ],
            stat: createTextElement(`${localize('textQuantity', getLanguage())}: ${getResourceDataObject('cosmicRip', ['upgrades', 'ripResearchOrbiter', 'quantity'])}`, 'ripResearchOrbiterQuantity', ['science-building-quantity']),
            cost: [createPriceLabel({
                labelId: 'cosmicRipNearSpaceScannerArrayDeployRipResearchOrbiterRow',
                html: `${getCurrencySymbol() + getResourceDataObject('cosmicRip', ['upgrades', 'ripResearchOrbiter', 'price'])}, ` +
                    `${getResourceDataObject('cosmicRip', ['upgrades', 'ripResearchOrbiter', 'resource1Price'])[0]} ${cosmicRipUpgradePriceName('ripResearchOrbiter', 1)}, ` +
                    `${getResourceDataObject('cosmicRip', ['upgrades', 'ripResearchOrbiter', 'resource2Price'])[0]} ${cosmicRipUpgradePriceName('ripResearchOrbiter', 2)}, ` +
                    `${getResourceDataObject('cosmicRip', ['upgrades', 'ripResearchOrbiter', 'resource3Price'])[0]} ${cosmicRipUpgradePriceName('ripResearchOrbiter', 3)}`,
                rowCategory: 'cosmicRipPurchase',
                dataConditionCheck: 'upgradeCheck',
                objectSectionArgument1: 'cosmicRip',
                objectSectionArgument2: 'ripResearchOrbiter',
                quantityArgument: 'cash'
            })],
            dataset: {
                conditionCheck: 'upgradeCheck',
                type: 'cosmicRip',
                rowCategory: 'cosmicRipPurchase'
            },
            hidden: true
        });

        optionContentElement.appendChild(createPane({
            id: 'cosmicRipNearSpaceScannerArrayDeployPane',
            sections: [createSection({
                id: 'cosmicRipNearSpaceScannerArrayDeploySection',
                bare: true,
                // No column headings: the quantity field labels itself, and a
                // "Cost" caption over a two-row section earns less than the line
                // it costs.
                rows: [deploySensorBuoyRow, deployRipResearchOrbiterRow]
            })]
        }));

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
            headerRow.innerHTML = `${localize('headerMainCosmicRipTab', getLanguage())} <p id="info_cosmicRipHeader" class="info-emoji">ℹ️</p>`;
        }
        setupInfoTooltips();

        const restored = getCosmicRipNearSpaceScannerArrayRestored?.() === true;
        const found = getCosmicRipRipFound?.() === true;

        // Large UI refactor, Phase 4 — tab 8 (docs/largeUIRefactor.md).
        //
        // The five tech rows were five copies of the same forty lines, differing
        // only in a key and a display name. They are one template now, which is
        // the duplication Phase 7 was scheduled to fold away and which the row
        // spec makes cheap enough to do here instead.
        //
        // Every row places its progress bar in the `stat` track rather than
        // beside the button. That is not cosmetic: `.progress-bar-container` is
        // `width: 100%`, which resolves to nothing inside a content-sized action
        // cell and resolves properly inside a real grid track. The section
        // widens that track once, for all six rows, instead of each row
        // declaring its own percentage — which is exactly the substitution this
        // phase exists to make.
        const stabilityRow = createRow({
            id: 'cosmicRipCosmicRipStatusRow',
            title: localize('tab8CosmicRipRowLabel', getLanguage()),
            detail: rowDetail('cosmicRipCosmicRipStatusRow'),
            detailLabel: DETAIL_LABEL,
            stat: createTextElement(`<div id="cosmicRipStabilityProgressBar">`, `cosmicRipStabilityProgressBarContainer`, ['progress-bar-container']),
            actions: [
                createButton({
                    text: '0%',
                    classNames: ['no-interaction', 'option-button', 'cosmic-rip-progress-bar-button-margin', 'id_cosmicRipStabilityPercentageText'],
                    onClick: () => {},
                    disableKeyboardForButton: true,
                    rowCategory: null
                }),
            ]
        });

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
                    percentageText.textContent = localize('textPercentStabilised', getLanguage()).replace('{percentage}', percentage);
                }
            }
        }, 0);

        /**
         * One Cosmic Rip technology row.
         *
         * `techKey` is the catalogue key and is what every id, dataset value and
         * reveal predicate is built from; `nameKey` is its localisation key. The
         * row starts hidden and is revealed by the frame loop's own tech sweep
         * (resourceAndCompoundMonitorRevealRowsChecks, game.js:7629), which finds
         * it through the `option-row` class and the `conditionCheck` / `type`
         * dataset pair — all three of which the migrated row still carries.
         *
         * The price label is built by `createPriceLabel`, the same factory the
         * legacy renderer uses, so its class, its generated `…Description` id,
         * its `data-*` attributes and its `red-disabled-text` affordability gate
         * are identical to before. Its inner spans are the ones Phase 2 taught to
         * carry their own raw amounts, so the notation formatter still rebuilds
         * them without parsing any rendered text.
         */
        const createCosmicRipTechRow = (techKey, nameKey) => {
            const prereqs = getResourceDataObject('cosmicRip', ['techs', techKey, 'prereqs']);

            const researchButton = createButton({
                text: localize('buttonResearch', getLanguage()),
                classNames: ['option-button', 'red-disabled-text', 'resource-cost-sell-check', 'cosmic-rip-tech-unlock', 'cosmic-rip-build-stabilizer-array-button', `id_cosmicRipTechResearchButton_${techKey}`],
                onClick: () => {
                    gain(1, null, techKey, true, null, 'cosmicRipTech', 'tech');
                    const btn = document.getElementById(`cosmicRipTechResearchButton_${techKey}`);
                    const progressBarContainer = document.getElementById(`cosmicRipTechProgressBarContainer_${techKey}`);
                    if (btn) btn.classList.add('invisible');
                    if (progressBarContainer) progressBarContainer.classList.remove('invisible');
                },
                dataConditionCheck: 'cosmicRipTechUnlock',
                resourcePriceObject: '',
                objectSectionArgument1: techKey,
                quantityArgument: 'ripTelemetryData',
                disableKeyboardForButton: true,
                rowCategory: 'cosmicRipBuildStabilizerArray'
            });

            const rowId = `cosmicRip${capitaliseString(techKey)}Row`;

            return createRow({
                id: rowId,
                title: localize(nameKey, getLanguage()),
                detail: rowDetail(rowId),
                detailLabel: DETAIL_LABEL,
                stat: createTextElement(`<div id="cosmicRipTechProgressBar_${techKey}">`, `cosmicRipTechProgressBarContainer_${techKey}`, ['progress-bar-container', 'invisible']),
                actions: [researchButton],
                cost: [createPriceLabel({
                    labelId: rowId,
                    html: `<span id="cosmicRipTechDescription_${techKey}"><span id="${techKey}Telemetry">${getResourceDataObject('cosmicRip', ['techs', techKey, 'price'])} ${localize('textTelemetryData', getLanguage())}<span id="${techKey}Comma1">, </span></span><span id="${techKey}GP">1GP<span id="${techKey}Comma2">, </span></span><span id="${techKey}Prereq">${localizeCosmicRipPrereqs(prereqs)}</span></span>`,
                    rowCategory: 'tech',
                    dataConditionCheck: 'cosmicRipTechUnlock',
                    objectSectionArgument1: techKey,
                    quantityArgument: 'ripTelemetryData'
                })],
                reveal: [{ kind: 'cosmicRipTechUnlock', tech: techKey }],
                dataset: {
                    conditionCheck: 'cosmicRipTechUnlock',
                    type: techKey,
                    rowCategory: 'tech'
                },
                hidden: true
            });
        };

        const techRows = [
            ['stabilizerArray', 'cosmicRipTechNameStabilizerArray'],
            ['quantumContainmentField', 'cosmicRipTechNameQuantumContainmentField'],
            ['dimensionalAnchorMatrix', 'cosmicRipTechNameDimensionalAnchorMatrix'],
            ['singularityStabilizer', 'cosmicRipTechNameSingularityStabilizer'],
            ['realityWeaveRegulator', 'cosmicRipTechNameRealityWeaveRegulator']
        ].map(([techKey, nameKey]) => createCosmicRipTechRow(techKey, nameKey));

        optionContentElement.appendChild(createPane({
            id: 'cosmicRipTechPane',
            // The progress bars want a real column, so the pane widens the stat
            // track once for every row on the screen. This is the replacement for
            // the per-row `[true, '15%', '70%']` the status row used to carry.
            tracks: { title: 'minmax(11ch, 1.4fr)', stat: 'minmax(16ch, 1.8fr)' },
            sections: [createSection({
                id: 'cosmicRipTechSection',
                bare: true,
                rows: [stabilityRow, ...techRows]
            })]
        }));
        return;
    }
}
