import {
    getCosmicRipNearSpaceScannerArrayRestored,
    setCosmicRipNearSpaceScannerArrayRestored,
    getCosmicRipRipLocationSectorIndex,
    setCosmicRipRipLocationSectorIndex,
    getCosmicRipScanResultsBySectorIndex,
    setCosmicRipScanResultsBySectorIndex,
    getCosmicRipRipFound,
    setCosmicRipRipFound,
    getCosmicRipGalacticPoints,
    setCosmicRipGalacticPoints,
} from './resourceDataObject.js';

import { getGalacticPointsSpent, setGalacticPointsSpent } from './constantsAndGlobalVars.js';

const TELESCOPE_RESTORE_COST_GP = 10;
const SECTOR_SCAN_COST_GP = 1;
const SECTOR_COUNT = 9;

export function getCosmicRipSectorCount() {
    return SECTOR_COUNT;
}

export function getNearSpaceScannerArrayRestoreCostGp() {
    return TELESCOPE_RESTORE_COST_GP;
}

export function getCosmicRipSectorScanCostGp() {
    return SECTOR_SCAN_COST_GP;
}

export function ensureCosmicRipLocationSeeded() {
    const current = Number(getCosmicRipRipLocationSectorIndex?.()) ?? -1;
    if (Number.isFinite(current) && current >= 0 && current < SECTOR_COUNT) {
        return current;
    }

    const seeded = Math.floor(Math.random() * SECTOR_COUNT);
    setCosmicRipRipLocationSectorIndex(seeded);
    return seeded;
}

export function restoreNearSpaceScannerArray() {
    if (getCosmicRipNearSpaceScannerArrayRestored?.() === true) {
        return { ok: false, reason: 'already_restored' };
    }

    const gp = Number(getCosmicRipGalacticPoints?.()) || 0;
    if (gp < TELESCOPE_RESTORE_COST_GP) {
        return { ok: false, reason: 'not_enough_gp' };
    }

    setCosmicRipGalacticPoints(Math.max(0, gp - TELESCOPE_RESTORE_COST_GP));
    const spent = Number(getGalacticPointsSpent?.()) || 0;
    setGalacticPointsSpent(spent + TELESCOPE_RESTORE_COST_GP);

    setCosmicRipNearSpaceScannerArrayRestored(true);

    ensureCosmicRipLocationSeeded();

    const scanArr = Array(SECTOR_COUNT).fill(false);
    setCosmicRipScanResultsBySectorIndex(scanArr);
    setCosmicRipRipFound(false);

    return { ok: true };
}

export function scanCosmicRipSector(sectorIndex) {
    const restored = getCosmicRipNearSpaceScannerArrayRestored?.() === true;
    if (!restored) {
        return { ok: false, reason: 'telescope_not_restored' };
    }

    const idx = Math.floor(Number(sectorIndex));
    if (!Number.isFinite(idx) || idx < 0 || idx >= SECTOR_COUNT) {
        return { ok: false, reason: 'invalid_sector' };
    }

    const gp = Number(getCosmicRipGalacticPoints?.()) || 0;
    if (gp < SECTOR_SCAN_COST_GP) {
        return { ok: false, reason: 'not_enough_gp' };
    }

    const scanArr = Array.isArray(getCosmicRipScanResultsBySectorIndex?.())
        ? [...getCosmicRipScanResultsBySectorIndex()]
        : Array(SECTOR_COUNT).fill(false);

    if (scanArr[idx] === true) {
        return { ok: false, reason: 'already_scanned' };
    }

    setCosmicRipGalacticPoints(Math.max(0, gp - SECTOR_SCAN_COST_GP));
    const spent = Number(getGalacticPointsSpent?.()) || 0;
    setGalacticPointsSpent(spent + SECTOR_SCAN_COST_GP);

    scanArr[idx] = true;
    setCosmicRipScanResultsBySectorIndex(scanArr);

    const ripIdx = ensureCosmicRipLocationSeeded();
    const found = idx === ripIdx;
    if (found) {
        setCosmicRipRipFound(true);
    }

    return { ok: true, found, sectorIndex: idx };
}
