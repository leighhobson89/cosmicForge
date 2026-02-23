import { createButton, createOptionRow, setButtonState, showNotification, drawSharedSpaceBackdrop } from './ui.js';
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

export function drawTab8Content(heading, optionContentElement) {
    if (heading === 'Overview') {
        const restored = getCosmicRipNearSpaceScannerArrayRestored?.() === true;
        const gp = Number(getCosmicRipGalacticPoints?.()) || 0;
        const restoreCost = Number(getNearSpaceScannerArrayRestoreCostGp?.()) || 10;

        const restoreRow = createOptionRow(
            'cosmicRipRestoreNearSpaceScannerArrayRow',
            null,
            'Near Space Scanner Array:',
            createButton(
                'RESTORE',
                ['option-button', 'red-disabled-text', 'cosmic-rip-restore-scanner-array-button'],
                () => {
                    const result = restoreNearSpaceScannerArray?.();
                    if (!result?.ok) {
                        showNotification('Unable to restore Near Space Scanner Array.', 'warning', 3000, 'cosmicRip');
                        return;
                    }
                    showNotification('Near Space Scanner Array restored.', 'info', 3000, 'cosmicRip');
                },
                null,
                null,
                null,
                null,
                null,
                true,
                null,
                'cosmicRipRestoreNearSpaceScannerArray'
            ),
            null,
            null,
            null,
            null,
            `Cost: <span class="warning-orange-text">${restoreCost}</span> GP`,
            '',
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
            null,
            null,
            null,
            null,
            'cosmicRipRestoreNearSpaceScannerArray'
        );

        const restoredRow = createOptionRow(
            'cosmicRipNearSpaceScannerArrayRestoredStatusRow',
            null,
            'Near Space Scanner Array:',
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
            null,
            `<span class="green-ready-text">Restored</span>`,
            '',
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
            null
        );

        if (!restored) {
            optionContentElement.appendChild(restoreRow);
            const btn = optionContentElement.querySelector?.('.cosmic-rip-restore-scanner-array-button');
            if (btn) {
                const canRestore = gp >= restoreCost;
                setButtonState(btn, { enabled: canRestore, ready: canRestore });
            }
        } else {
            optionContentElement.appendChild(restoredRow);
        }
        return;
    }

    if (heading === 'Near Space Scanner Array') {
        const restored = getCosmicRipNearSpaceScannerArrayRestored?.() === true;
        const found = getCosmicRipRipFound?.() === true;
        const gp = Number(getCosmicRipGalacticPoints?.()) || 0;
        const scanCost = Number(getCosmicRipSectorScanCostGp?.()) || 1;
        const sectorCount = Number(getCosmicRipSectorCount?.()) || 9;

        const statusRow = createOptionRow(
            'cosmicRipNearSpaceScannerArrayStatusRow',
            null,
            'Status:',
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
            null,
            restored
                ? (found ? `<span class="green-ready-text">Rip Located</span>` : `<span class="warning-orange-text">Scanning</span>`)
                : `<span class="red-disabled-text">Offline</span>`,
            '',
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
            null
        );
        optionContentElement.appendChild(statusRow);

        const telescopeContainer = document.createElement('div');
        telescopeContainer.id = 'cosmicRipNearSpaceScannerArrayCanvasContainer';
        telescopeContainer.style.position = 'relative';
        telescopeContainer.style.width = '90%';
        telescopeContainer.style.marginTop = '10px';
        telescopeContainer.style.marginLeft = 'auto';
        telescopeContainer.style.marginRight = 'auto';
        telescopeContainer.style.aspectRatio = '1 / 1';
        telescopeContainer.classList.add('container-bg');

        const canvas = document.createElement('canvas');
        canvas.id = 'cosmicRipNearSpaceScannerArrayCanvas';
        canvas.style.width = '100%';
        canvas.style.height = '50%';
        canvas.style.display = 'block';
        canvas.style.opacity = '1';

        const labelFadeOverlay = document.createElement('div');
        labelFadeOverlay.id = 'cosmicRipNearSpaceScannerArrayLabelFadeOverlay';
        labelFadeOverlay.style.position = 'absolute';
        labelFadeOverlay.style.left = '0';
        labelFadeOverlay.style.top = '0';
        labelFadeOverlay.style.width = '100%';
        labelFadeOverlay.style.height = canvas.style.height;
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
        fogOverlay.style.height = canvas.style.height;
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
        overlay.style.height = canvas.style.height;
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
        scanLabelOverlay.style.height = canvas.style.height;
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
            'MI-7411', 'MI-7412', 'MI-7413',
            'MI-7422', 'MI-7423', 'MI-7424',
            'MI-7432', 'MI-7433', 'MI-7434'
        ];

        globalThis.__cosmicRipNearSpaceScannerArraySectorNames = sectorNames;

        for (let i = 0; i < 9; i += 1) {
            const sector = document.createElement('div');
            sector.id = `cosmicRipNearSpaceScannerArraySector${i}`;
            sector.dataset.sectorId = sectorNames[i];
            sector.style.cursor = 'pointer';
            sector.style.pointerEvents = 'auto';
            sector.addEventListener('mouseenter', () => {
                tooltip.textContent = sector.dataset.sectorId || '';
            });
            sector.addEventListener('mousemove', (event) => {
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
                const scanLabels = globalThis.__cosmicRipNearSpaceScannerArrayScanLabelEls;
                const labelEl = Array.isArray(scanLabels) ? scanLabels[i] : null;
                const isActive = !!labelEl && labelEl.classList.contains('green-ready-text') && labelEl.textContent !== 'SCANNED!';
                if (!isActive) {
                    return;
                }

                const result = scanCosmicRipSector?.(i);
                if (result?.ok) {
                    console.log(`[CosmicRip] Sector clicked: ${name} (index ${i})`);
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
        zoomCanvas.style.height = canvas.style.height;
        zoomCanvas.style.pointerEvents = 'none';
        zoomCanvas.style.opacity = '0';
        zoomCanvas.style.transformOrigin = '0 0';
        zoomCanvas.style.transform = 'scale(1)';
        zoomCanvas.style.transition = '';
        telescopeContainer.appendChild(zoomCanvas);
        optionContentElement.appendChild(telescopeContainer);

        globalThis.__cosmicRipNearSpaceScannerArrayCanvasEl = canvas;
        globalThis.__cosmicRipNearSpaceScannerArrayFogOverlayEl = fogOverlay;
        globalThis.__cosmicRipNearSpaceScannerArrayInteractiveOverlayEl = overlay;
        globalThis.__cosmicRipNearSpaceScannerArrayScanLabelOverlayEl = scanLabelOverlay;

        globalThis.__cosmicRipNearSpaceScannerArrayScanLabelEls = Array.from(
            scanLabelOverlay.querySelectorAll('[id^="cosmicRipNearSpaceScannerArrayScanLabel"]')
        );

        globalThis.__cosmicRipNearSpaceScannerArrayFogEls = Array.from(
            fogOverlay.querySelectorAll('[id^="cosmicRipNearSpaceScannerArrayFogCell"]')
        );

        globalThis.__cosmicRipNearSpaceScannerArrayLabelFadeOverlayEl = labelFadeOverlay;
        globalThis.__cosmicRipNearSpaceScannerArrayZoomCanvasEl = zoomCanvas;

        const drawCanvas = () => {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const w = canvas.offsetWidth;
            const h = canvas.offsetHeight;
            if (!w || !h) return;

            canvas.width = w;
            canvas.height = h;

            drawSharedSpaceBackdrop(ctx, canvas, null, 200);

            const themeElement = document.querySelector('[data-theme]');
            const disabledColor = themeElement
                ? getComputedStyle(themeElement).getPropertyValue('--disabled-text').trim()
                : 'rgba(255, 0, 0, 0.6)';

            const readyColor = themeElement
                ? getComputedStyle(themeElement).getPropertyValue('--ready-text').trim()
                : 'rgba(0, 255, 0, 0.8)';

            const borderColor = readyColor;

            const scanResults = Array.isArray(globalThis.__cosmicRipScanResultsBySectorIndex)
                ? globalThis.__cosmicRipScanResultsBySectorIndex
                : Array(9).fill(false);
            const gpForUi = Number(globalThis.__cosmicRipGpForUi) || 0;
            const scannerRestoredForUi = globalThis.__cosmicRipScannerRestoredForUi === true;

            const isOneSectorState = globalThis.__cosmicRipNearSpaceScannerArrayOneSectorState === true;

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

            if (isOneSectorState) {
                drawSharedSpaceBackdrop(ctx, canvas, null, 260);

                const idx = Number(globalThis.__cosmicRipFoundSectorIndexForZoom);
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

        globalThis.__cosmicRipNearSpaceScannerArrayDrawCanvas = drawCanvas;

        drawCanvas();
        if (!globalThis.__cosmicRipNearSpaceScannerArrayResizeAttached) {
            globalThis.__cosmicRipNearSpaceScannerArrayResizeAttached = true;
            window.addEventListener('resize', drawCanvas);
        }
        return;
    }

    if (heading === 'Cosmic Rip') {
        const row = createOptionRow(
            'cosmicRipCosmicRipStubRow',
            null,
            'Cosmic Rip:',
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
            null,
            'Coming soon',
            '',
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
            null
        );
        optionContentElement.appendChild(row);
        return;
    }

    if (heading === 'Ripcraft') {
        const row = createOptionRow(
            'cosmicRipRipcraftStubRow',
            null,
            'Ripcraft:',
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
            null,
            'Coming soon',
            '',
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
            null
        );
        optionContentElement.appendChild(row);
        return;
    }

    if (heading === 'Expeditions') {
        const row = createOptionRow(
            'cosmicRipExpeditionsStubRow',
            null,
            'Expeditions:',
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
            null,
            'Coming soon',
            '',
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
            null
        );
        optionContentElement.appendChild(row);
        return;
    }
}
