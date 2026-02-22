import { createButton, createOptionRow, setButtonState, showNotification } from './ui.js';
import {
    getSpaceRipGalacticPoints,
    getSpaceRipGalacticTelescopeRestored,
    getSpaceRipRipFound,
    getSpaceRipScanResultsBySectorIndex,
} from './resourceDataObject.js';

import {
    getSectorScanCostGp,
    getSpaceRipSectorCount,
    getTelescopeRestoreCostGp,
    restoreGalacticTelescope,
    scanRipSector,
} from './spaceRip.js';

export function drawTab8Content(heading, optionContentElement) {
    if (heading === 'Overview') {
        const restored = getSpaceRipGalacticTelescopeRestored?.() === true;
        const gp = Number(getSpaceRipGalacticPoints?.()) || 0;
        const restoreCost = Number(getTelescopeRestoreCostGp?.()) || 10;

        const restoreRow = createOptionRow(
            'spaceRipRestoreGalacticTelescopeRow',
            null,
            'Galactic Telescope:',
            createButton(
                'RESTORE',
                ['option-button', 'red-disabled-text', 'space-rip-restore-telescope-button'],
                () => {
                    const result = restoreGalacticTelescope?.();
                    if (!result?.ok) {
                        showNotification('Unable to restore Galactic Telescope.', 'warning', 3000, 'spaceRip');
                        return;
                    }
                    showNotification('Galactic Telescope restored.', 'info', 3000, 'spaceRip');
                },
                null,
                null,
                null,
                null,
                null,
                true,
                null,
                'spaceRipRestoreGalacticTelescope'
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
            'spaceRipRestoreGalacticTelescope'
        );

        const restoredRow = createOptionRow(
            'spaceRipGalacticTelescopeRestoredStatusRow',
            null,
            'Galactic Telescope:',
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
            const btn = optionContentElement.querySelector?.('.space-rip-restore-telescope-button');
            if (btn) {
                const canRestore = gp >= restoreCost;
                setButtonState(btn, { enabled: canRestore, ready: canRestore });
            }
        } else {
            optionContentElement.appendChild(restoredRow);
        }
        return;
    }

    if (heading === 'Galactic Telescope') {
        const restored = getSpaceRipGalacticTelescopeRestored?.() === true;
        const found = getSpaceRipRipFound?.() === true;
        const gp = Number(getSpaceRipGalacticPoints?.()) || 0;
        const scanCost = Number(getSectorScanCostGp?.()) || 1;
        const sectorCount = Number(getSpaceRipSectorCount?.()) || 9;

        const statusRow = createOptionRow(
            'spaceRipGalacticTelescopeStatusRow',
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

        const gridContainer = document.createElement('div');
        gridContainer.id = 'spaceRipGalacticTelescopeGridContainer';
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
        gridContainer.style.gap = '8px';
        gridContainer.style.width = '100%';
        gridContainer.style.maxWidth = '520px';
        gridContainer.style.marginTop = '10px';

        const scanResults = Array.isArray(getSpaceRipScanResultsBySectorIndex?.())
            ? getSpaceRipScanResultsBySectorIndex()
            : Array(sectorCount).fill(false);

        for (let i = 0; i < sectorCount; i += 1) {
            const scanned = scanResults?.[i] === true;
            const label = scanned ? `SECTOR ${i + 1} - SCANNED` : `SCAN SECTOR ${i + 1}`;
            const btn = createButton(
                label,
                ['option-button', scanned ? 'green-ready-text' : 'red-disabled-text', 'space-rip-scan-sector-button'],
                () => {
                    const result = scanRipSector?.(i);
                    if (!result?.ok) {
                        if (result?.reason === 'not_enough_gp') {
                            showNotification('Not enough Galactic Points to scan.', 'warning', 3000, 'spaceRip');
                        } else if (result?.reason === 'already_scanned') {
                            showNotification('Sector already scanned.', 'info', 2500, 'spaceRip');
                        } else {
                            showNotification('Unable to scan sector.', 'warning', 3000, 'spaceRip');
                        }
                        return;
                    }

                    if (result?.found) {
                        showNotification('Rip signature found!', 'info', 4000, 'spaceRip');
                    } else {
                        showNotification('Scan complete. No signature detected.', 'info', 2500, 'spaceRip');
                    }
                },
                null,
                null,
                null,
                null,
                null,
                true,
                null,
                'spaceRipSectorScan'
            );

            const canScan = restored && !scanned && gp >= scanCost;
            setButtonState(btn, { enabled: canScan, ready: canScan });
            gridContainer.appendChild(btn);
        }

        optionContentElement.appendChild(gridContainer);
        return;
    }

    if (heading === 'Cosmic Rip') {
        const row = createOptionRow(
            'spaceRipCosmicRipStubRow',
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
            'spaceRipRipcraftStubRow',
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
            'spaceRipExpeditionsStubRow',
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
