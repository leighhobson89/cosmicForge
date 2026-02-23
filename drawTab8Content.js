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
        telescopeContainer.style.maxWidth = '520px';
        telescopeContainer.style.marginTop = '10px';
        telescopeContainer.style.marginLeft = 'auto';
        telescopeContainer.style.marginRight = 'auto';
        telescopeContainer.style.aspectRatio = '1 / 1';

        const canvas = document.createElement('canvas');
        canvas.id = 'cosmicRipNearSpaceScannerArrayCanvas';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';

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
        overlay.style.pointerEvents = 'none';

        const sectorNames = [
            'MI-7411', 'MI-7412', 'MI-7413',
            'MI-7411', 'MI-7412', 'MI-7413',
            'MI-7411', 'MI-7412', 'MI-7413'
        ];

        for (let i = 0; i < 9; i += 1) {
            const sector = document.createElement('div');
            sector.id = `cosmicRipNearSpaceScannerArraySector${i}`;
            sector.dataset.sectorId = sectorNames[i];
            sector.addEventListener('click', () => {
                // handler placeholder
            });
            overlay.appendChild(sector);
        }

        telescopeContainer.appendChild(canvas);
        telescopeContainer.appendChild(overlay);
        optionContentElement.appendChild(telescopeContainer);

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

            ctx.save();
            ctx.strokeStyle = 'rgba(255,255,255,0.12)';
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

            ctx.fillStyle = disabledColor;
            ctx.font = 'bold 11px sans-serif';
            ctx.textBaseline = 'top';

            for (let i = 0; i < 9; i += 1) {
                const col = i % 3;
                const row = Math.floor(i / 3);
                const label = sectorNames[i];
                const x = col * cellW + 6;
                const y = row * cellH + 6;
                ctx.fillText(String(label).toUpperCase(), x, y);
            }

            ctx.restore();
        };

        drawCanvas();
        if (!globalThis.__cosmicRipNearSpaceScannerArrayResizeAttached) {
            globalThis.__cosmicRipNearSpaceScannerArrayResizeAttached = true;
            window.addEventListener('resize', () => {
                const el = document.getElementById('cosmicRipNearSpaceScannerArrayCanvas');
                if (el) {
                    const ctx = el.getContext('2d');
                    if (ctx) {
                        const w = el.offsetWidth;
                        const h = el.offsetHeight;
                        el.width = w;
                        el.height = h;
                        drawSharedSpaceBackdrop(ctx, el, null, 200);
                    }
                }
            });
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
