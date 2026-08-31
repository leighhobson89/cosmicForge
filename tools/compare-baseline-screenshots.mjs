/**
 * Compare a fresh capture against the Phase 0 baseline in `backupScreenshots/`.
 *
 * See docs/largeUIRefactor.md. Phases 1 to 5 must not change how the game looks;
 * this is how that is checked, since those phases ship no tests. Phase 6 changes
 * the look deliberately, and is the point at which the baseline is re-approved
 * rather than silently replaced.
 *
 * WHY A TOLERANCE, AND WHY A MASK
 * -------------------------------
 * Two screenshots of this game are never byte-identical: the stat bar carries a
 * live clock, and resources tick every frame. So a raw byte comparison reports
 * "everything changed" and tells you nothing. This tool instead:
 *
 *   · compares pixels with a small per-channel tolerance, and
 *   · ignores the top strip of the viewport by default, which is where the clock
 *     and the running totals live.
 *
 * What survives that is a real rendering change. A formatting regression shows up
 * as whole rows of differing pixels; frame-to-frame drift shows up as a fraction
 * of a percent scattered over the numbers that happened to tick.
 *
 * Usage
 *   node tools/compare-baseline-screenshots.mjs --against backupScreenshots/_phase2
 *   node tools/compare-baseline-screenshots.mjs --against <dir> --worst 12 --write-diffs
 *
 * Flags
 *   --against <dir>  Directory of the new capture (required).
 *   --baseline <dir> Baseline directory (default: backupScreenshots).
 *   --tolerance <n>  Per-channel tolerance, 0-255 (default: 12).
 *   --mask-top <n>   Ignore the top N pixel rows (default: 34, the stat bar).
 *   --threshold <n>  Percent of differing pixels above which a pane is FLAGGED
 *                    (default: 1.0).
 *   --worst <n>      How many worst panes to list (default: 15).
 *   --write-diffs    Write a diff PNG per flagged pane into <against>/_diff/.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

function parseArgs(argv) {
    const a = { against: null, baseline: 'backupScreenshots', tolerance: 12, maskTop: 34, threshold: 1.0, worst: 15, writeDiffs: false };
    for (let i = 0; i < argv.length; i++) {
        const f = argv[i];
        const next = () => argv[++i];
        if (f === '--against') a.against = next();
        else if (f === '--baseline') a.baseline = next();
        else if (f === '--tolerance') a.tolerance = Number(next());
        else if (f === '--mask-top') a.maskTop = Number(next());
        else if (f === '--threshold') a.threshold = Number(next());
        else if (f === '--worst') a.worst = Number(next());
        else if (f === '--write-diffs') a.writeDiffs = true;
        else { console.error(`Unknown flag: ${f}`); process.exit(1); }
    }
    if (!a.against) { console.error('--against <dir> is required'); process.exit(1); }
    return a;
}

function readPng(file) {
    try { return PNG.sync.read(fs.readFileSync(file)); } catch { return null; }
}

/**
 * Fraction of pixels that differ by more than `tolerance` on any channel,
 * ignoring the first `maskTop` rows. Returns null when the two images are not
 * the same size, which is itself a finding rather than a comparison failure.
 */
function comparePng(a, b, tolerance, maskTop, wantDiff) {
    if (a.width !== b.width || a.height !== b.height) return null;

    let differing = 0;
    let counted = 0;
    const diff = wantDiff ? new PNG({ width: a.width, height: a.height }) : null;

    for (let y = 0; y < a.height; y++) {
        for (let x = 0; x < a.width; x++) {
            const i = (a.width * y + x) << 2;

            if (y < maskTop) {
                if (diff) { diff.data[i] = 40; diff.data[i + 1] = 40; diff.data[i + 2] = 40; diff.data[i + 3] = 255; }
                continue;
            }
            counted++;

            const dr = Math.abs(a.data[i] - b.data[i]);
            const dg = Math.abs(a.data[i + 1] - b.data[i + 1]);
            const db = Math.abs(a.data[i + 2] - b.data[i + 2]);
            const changed = dr > tolerance || dg > tolerance || db > tolerance;
            if (changed) differing++;

            if (diff) {
                // Differences in magenta over a dimmed copy of the baseline, so a
                // changed row is obvious at a glance.
                if (changed) { diff.data[i] = 255; diff.data[i + 1] = 0; diff.data[i + 2] = 255; }
                else { diff.data[i] = a.data[i] >> 2; diff.data[i + 1] = a.data[i + 1] >> 2; diff.data[i + 2] = a.data[i + 2] >> 2; }
                diff.data[i + 3] = 255;
            }
        }
    }

    return { percent: counted ? (differing / counted) * 100 : 0, differing, counted, diff };
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const baseDir = path.resolve(ROOT, args.baseline);
    const newDir = path.resolve(ROOT, args.against);

    if (!fs.existsSync(baseDir)) { console.error(`Baseline not found: ${baseDir}`); process.exit(1); }
    if (!fs.existsSync(newDir)) { console.error(`Capture not found: ${newDir}`); process.exit(1); }

    const diffDir = path.join(newDir, '_diff');
    if (args.writeDiffs) fs.mkdirSync(diffDir, { recursive: true });

    const themes = fs.readdirSync(baseDir).filter((d) =>
        fs.statSync(path.join(baseDir, d)).isDirectory() && !d.startsWith('_'));

    const results = [];
    let missing = 0;
    let sizeMismatch = 0;

    for (const theme of themes) {
        const files = fs.readdirSync(path.join(baseDir, theme)).filter((f) => f.endsWith('.png'));
        for (const file of files) {
            const aPath = path.join(baseDir, theme, file);
            const bPath = path.join(newDir, theme, file);
            if (!fs.existsSync(bPath)) { missing++; continue; }

            const a = readPng(aPath);
            const b = readPng(bPath);
            if (!a || !b) { missing++; continue; }

            const cmp = comparePng(a, b, args.tolerance, args.maskTop, args.writeDiffs);
            if (!cmp) { sizeMismatch++; results.push({ theme, file, percent: 100, note: 'size mismatch' }); continue; }

            results.push({ theme, file, percent: cmp.percent });

            if (args.writeDiffs && cmp.diff && cmp.percent >= args.threshold) {
                fs.mkdirSync(path.join(diffDir, theme), { recursive: true });
                fs.writeFileSync(path.join(diffDir, theme, file), PNG.sync.write(cmp.diff));
            }
        }
    }

    results.sort((x, y) => y.percent - x.percent);
    const flagged = results.filter((r) => r.percent >= args.threshold);
    const mean = results.length ? results.reduce((s, r) => s + r.percent, 0) / results.length : 0;

    console.log(`\nBaseline comparison`);
    console.log(`  baseline : ${path.relative(ROOT, baseDir)}`);
    console.log(`  capture  : ${path.relative(ROOT, newDir)}`);
    console.log(`  settings : tolerance ${args.tolerance}/255 · top ${args.maskTop}px masked · flag at ${args.threshold}%\n`);
    console.log(`  compared : ${results.length} images`);
    if (missing) console.log(`  missing  : ${missing} (not in the new capture)`);
    if (sizeMismatch) console.log(`  size differs: ${sizeMismatch}`);
    console.log(`  mean diff: ${mean.toFixed(3)}%`);
    console.log(`  flagged  : ${flagged.length} at or above ${args.threshold}%\n`);

    console.log(`  Worst ${Math.min(args.worst, results.length)}:`);
    results.slice(0, args.worst).forEach((r) => {
        const mark = r.percent >= args.threshold ? '!' : ' ';
        console.log(`   ${mark} ${r.percent.toFixed(3).padStart(7)}%  ${r.theme}/${r.file}${r.note ? '  (' + r.note + ')' : ''}`);
    });

    if (args.writeDiffs && flagged.length) {
        console.log(`\n  diff images -> ${path.relative(ROOT, diffDir)}`);
    }
    console.log('');
}

main();
