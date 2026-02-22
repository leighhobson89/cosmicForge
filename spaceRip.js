import {
    getSpaceRipGalacticTelescopeRestored,
    setSpaceRipGalacticTelescopeRestored,
    getSpaceRipRipLocationSectorIndex,
    setSpaceRipRipLocationSectorIndex,
    getSpaceRipScanResultsBySectorIndex,
    setSpaceRipScanResultsBySectorIndex,
    getSpaceRipRipFound,
    setSpaceRipRipFound,
    getSpaceRipGalacticPoints,
    setSpaceRipGalacticPoints,
} from './resourceDataObject.js';

import { getGalacticPointsSpent, setGalacticPointsSpent } from './constantsAndGlobalVars.js';

const TELESCOPE_RESTORE_COST_GP = 10;
const SECTOR_SCAN_COST_GP = 1;
const SECTOR_COUNT = 9;

export function getSpaceRipSectorCount() {
    return SECTOR_COUNT;
}

export function getTelescopeRestoreCostGp() {
    return TELESCOPE_RESTORE_COST_GP;
}

export function getSectorScanCostGp() {
    return SECTOR_SCAN_COST_GP;
}

export function ensureRipLocationSeeded() {
    const current = Number(getSpaceRipRipLocationSectorIndex?.()) ?? -1;
    if (Number.isFinite(current) && current >= 0 && current < SECTOR_COUNT) {
        return current;
    }

    const seeded = Math.floor(Math.random() * SECTOR_COUNT);
    setSpaceRipRipLocationSectorIndex(seeded);
    return seeded;
}

export function restoreGalacticTelescope() {
    if (getSpaceRipGalacticTelescopeRestored?.() === true) {
        return { ok: false, reason: 'already_restored' };
    }

    const gp = Number(getSpaceRipGalacticPoints?.()) || 0;
    if (gp < TELESCOPE_RESTORE_COST_GP) {
        return { ok: false, reason: 'not_enough_gp' };
    }

    setSpaceRipGalacticPoints(Math.max(0, gp - TELESCOPE_RESTORE_COST_GP));
    const spent = Number(getGalacticPointsSpent?.()) || 0;
    setGalacticPointsSpent(spent + TELESCOPE_RESTORE_COST_GP);

    setSpaceRipGalacticTelescopeRestored(true);

    ensureRipLocationSeeded();

    const scanArr = Array(SECTOR_COUNT).fill(false);
    setSpaceRipScanResultsBySectorIndex(scanArr);
    setSpaceRipRipFound(false);

    return { ok: true };
}

export function scanRipSector(sectorIndex) {
    const restored = getSpaceRipGalacticTelescopeRestored?.() === true;
    if (!restored) {
        return { ok: false, reason: 'telescope_not_restored' };
    }

    const idx = Math.floor(Number(sectorIndex));
    if (!Number.isFinite(idx) || idx < 0 || idx >= SECTOR_COUNT) {
        return { ok: false, reason: 'invalid_sector' };
    }

    const gp = Number(getSpaceRipGalacticPoints?.()) || 0;
    if (gp < SECTOR_SCAN_COST_GP) {
        return { ok: false, reason: 'not_enough_gp' };
    }

    const scanArr = Array.isArray(getSpaceRipScanResultsBySectorIndex?.())
        ? [...getSpaceRipScanResultsBySectorIndex()]
        : Array(SECTOR_COUNT).fill(false);

    if (scanArr[idx] === true) {
        return { ok: false, reason: 'already_scanned' };
    }

    setSpaceRipGalacticPoints(Math.max(0, gp - SECTOR_SCAN_COST_GP));
    const spent = Number(getGalacticPointsSpent?.()) || 0;
    setGalacticPointsSpent(spent + SECTOR_SCAN_COST_GP);

    scanArr[idx] = true;
    setSpaceRipScanResultsBySectorIndex(scanArr);

    const ripIdx = ensureRipLocationSeeded();
    const found = idx === ripIdx;
    if (found) {
        setSpaceRipRipFound(true);
    }

    return { ok: true, found, sectorIndex: idx };
}
