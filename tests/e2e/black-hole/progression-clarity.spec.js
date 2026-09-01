/**
 * Area: Black Hole — progression clarity
 * Plan: tests/docs/areas/black-hole.md
 * Improvement plan item: P11 (docs/player-feedback-improvement-plan.md)
 *
 * The two other black hole specs ask whether the feature *works*. This one asks
 * whether the panel tells the truth about what buying the next level does — the
 * complaint P11 exists for.
 *
 * There were two ways it did not.
 *
 * The Recharge upgrade multiplies the charge time by 0.88 a level and floors it
 * at `MINIMUM_BLACK_HOLE_CHARGE_TIME`. With the shipped 300s base that floor is
 * reached on the nineteenth purchase, and the eighteenth sits at 30.048s. Both
 * of those render "30.0" at one decimal, so the last rung of the ladder read
 *
 *     Recharge
 *     30.0s -> 30.0s
 *     9.9M Research Points
 *
 * — a purchase that appeared to buy nothing. It is in fact the most valuable
 * purchase in the panel: reaching the floor sets `blackHoleAlwaysOn`, and the
 * warp stops being something you charge up and start again and becomes
 * permanent. The player who read that label and refused it read it correctly and
 * was told the wrong thing.
 *
 * And nothing anywhere said what the black hole was *for* before it was bought.
 * The unresearched pane offered a seven-figure research price against a button
 * labelled "Research Black Hole" and no statement of what the time warp does,
 * which is why players left it until late.
 *
 * So the assertions here are about the panel's text, and they are made by
 * playing the ladder: research the black hole through its own button, then buy
 * Recharge over and over through its own button, reading the label the frame
 * loop paints before each purchase. The invariant is the one P11 names — the
 * panel must never render `X -> X` — and the escape from it is a qualitative
 * note, not a rounder number.
 *
 * `MEASURED GAIN` annotations record, per test, how many rungs of the real
 * ladder the old one-decimal rendering would have shown as a no-change purchase.
 */
import { test, expect } from '../_harness/game-fixture.mjs';
import {
  blackHoleButtonLabel,
  clickBlackHoleButton,
  grantResearch,
  openBlackHolePane,
  openOptionById,
  researchBlackHole
} from './_black-hole-helpers.mjs';

/** The upgrade buttons paint a three-line label; this is the middle line. */
function arrowLine(label) {
  return (label ?? '').split('\n').map((l) => l.trim()).find((l) => l.includes('->')) ?? null;
}

/**
 * Split an upgrade label's `current -> next` line into its two halves.
 *
 * Returns null when the label carries no arrow at all, which is a legitimate
 * state rather than a parse failure: the maxed Recharge button and the
 * always-active Duration button both quote a single value.
 */
function parseStep(label) {
  const line = arrowLine(label);
  if (line === null) return null;
  const [current, next] = line.split('->').map((part) => part.trim());
  return { line, current, next };
}

/** True when a label half is a bare number (with an optional x prefix or s suffix). */
function isNumericHalf(half) {
  return /^x?\d+(?:\.\d+)?s?$/.test(half);
}

/** Decimal places shown by a label half, so both sides can be compared for precision. */
function decimalsOf(half) {
  const dot = half.indexOf('.');
  if (dot === -1) return 0;
  return half.slice(dot + 1).replace(/\D+$/, '').length;
}

/**
 * What the pre-P11 formatter would have painted for the Recharge button at the
 * current state: both sides at a fixed one decimal, with no escalation and no
 * qualitative escape.
 *
 * Read from the game's own numbers rather than hard-coded, so the count it
 * produces stays true if the base charge time or the floor is ever rebalanced.
 */
async function legacyRechargeRendering(game) {
  return game.withMods((m) => {
    const base = Number(m.cg.getBaseBlackHoleChargeTimerDuration());
    const min = Number(m.cg.getMinimumBlackHoleChargeTime());
    const multiplier = Number(m.rdo.getBlackHoleRechargeMultiplier());
    const minMultiplier = base > 0 ? min / base : 0;
    const currentMs = Math.round(base * multiplier);
    const nextMs = Math.max(min, Math.round(base * Math.max(minMultiplier, multiplier * 0.88)));
    return {
      current: (currentMs / 1000).toFixed(1),
      next: (nextMs / 1000).toFixed(1)
    };
  });
}

/** Attach a PNG of the black hole panel to the report. */
async function snapshotPanel(game, testInfo, name) {
  const panel = game.page.locator('#optionContentTab7');
  await expect(panel).toBeVisible();
  await testInfo.attach(name, { body: await panel.screenshot(), contentType: 'image/png' });
}

test.describe('Black Hole — the upgrade panel never advertises a purchase that changes nothing', () => {
  test.setTimeout(240000);

  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await openBlackHolePane(game);
  });

  test('every rung of the real Recharge ladder reads as a change', async ({ game }, testInfo) => {
    await researchBlackHole(game);
    await snapshotPanel(game, testInfo, 'recharge-ladder-before.png');

    // Walk the whole ladder through the button, reading the label the frame loop
    // has painted before each purchase. The bound is a safety net, not the
    // expected length: the shipped ladder is nineteen rungs and the loop exits
    // when the button stops offering a step.
    const MAX_RUNGS = 40;
    let rungs = 0;
    let qualitativeRungs = 0;
    let legacyCollisions = 0;
    let finalLabel = null;

    for (let i = 0; i < MAX_RUNGS; i++) {
      // Re-granted each rung so the ladder is never cut short by the price
      // curve; affordability is `black-hole-live.spec.js`'s subject, not this
      // spec's.
      await grantResearch(game);
      await game.page.waitForTimeout(150);

      const label = await blackHoleButtonLabel(game, 'blackHoleButton4');
      const step = parseStep(label);

      if (step === null) {
        finalLabel = label;
        break;
      }

      const legacy = await legacyRechargeRendering(game);
      if (legacy.current === legacy.next) legacyCollisions++;

      expect(
        step.current,
        `rung ${rungs + 1} advertised a purchase that changes nothing: "${step.line}"`
      ).not.toBe(step.next);

      if (!isNumericHalf(step.next)) {
        // The one sanctioned escape from a number pair: the rung says what it
        // does instead of quoting a value it cannot distinguish.
        qualitativeRungs++;
        expect(
          step.next.length,
          `rung ${rungs + 1} replaced the next value with an empty note`
        ).toBeGreaterThan(0);
      }

      rungs++;
      await clickBlackHoleButton(game, 'blackHoleButton4', { settleMs: 300 });
    }

    await snapshotPanel(game, testInfo, 'recharge-ladder-after.png');

    // The ladder must actually have been walked, and walked to its end.
    expect(rungs, 'the Recharge ladder should be several rungs long').toBeGreaterThan(5);
    expect(rungs, 'the ladder should have ended before the safety bound').toBeLessThan(MAX_RUNGS);

    const cappedState = await game.withMods((m) => ({
      alwaysOn: m.cg.getBlackHoleAlwaysOn(),
      multiplier: Number(m.rdo.getBlackHoleRechargeMultiplier()),
      base: Number(m.cg.getBaseBlackHoleChargeTimerDuration()),
      min: Number(m.cg.getMinimumBlackHoleChargeTime())
    }));

    expect(
      Math.round(cappedState.base * cappedState.multiplier),
      'walking the ladder to its end should reach the charge-time floor'
    ).toBeLessThanOrEqual(cappedState.min);
    expect(
      cappedState.alwaysOn,
      'reaching the floor is what turns the warp permanently on — that is the reward the last rung sells'
    ).toBe(true);

    // Exactly one rung reaches the threshold, so exactly one rung may use the
    // note. More than one would mean the panel had stopped quoting numbers it
    // could perfectly well quote.
    expect(
      qualitativeRungs,
      'only the rung that reaches the floor should replace its next value with a note'
    ).toBe(1);

    // And the ladder ends on the maxed label, which quotes the floor.
    expect(finalLabel, 'the exhausted Recharge button should still say something').toBeTruthy();
    expect(arrowLine(finalLabel), 'a maxed upgrade has no next step to advertise').toBeNull();
    expect(finalLabel).toContain(String((cappedState.min / 1000).toFixed(0)));

    testInfo.annotations.push({
      type: 'MEASURED GAIN',
      description:
        `Recharge ladder: ${rungs} rungs walked to the always-active floor. `
        + `${legacyCollisions} of them rendered an identical before/after pair under the previous `
        + `fixed one-decimal formatter (e.g. "30.0s -> 30.0s"); ${0} do now. `
        + `${qualitativeRungs} rung states its outcome instead of a number pair.`
    });
  });

  test('the rung that reaches the floor names its outcome, and the outcome is real', async ({ game }, testInfo) => {
    await researchBlackHole(game);

    // Stage the exact collision the shipped ladder produces, through the game's
    // own variable debugger rather than by clicking eighteen times, so the case
    // is reached deterministically and does not depend on the ladder's length.
    //
    // 0.10016 puts the charge at 30.048s against a 30s floor: the next purchase
    // clamps to the floor, and at one decimal both sides read "30.0". That is
    // the rendering P11 was raised for.
    const staged = await game.withMods((m) => {
      const base = Number(m.cg.getBaseBlackHoleChargeTimerDuration());
      const min = Number(m.cg.getMinimumBlackHoleChargeTime());
      return { base, min, multiplier: (min * 1.0016) / base };
    });
    await game.setDebugVariable('blackHoleRechargeMultiplier', staged.multiplier);
    await game.closeVariableDebugger();
    await openOptionById(game, 'blackholeOption');
    await game.page.waitForTimeout(600);

    const legacy = await legacyRechargeRendering(game);
    expect(
      legacy.current,
      'this staging is only meaningful if the old formatter would have collided here'
    ).toBe(legacy.next);

    await snapshotPanel(game, testInfo, 'final-rung-before.png');

    const label = await blackHoleButtonLabel(game, 'blackHoleButton4');
    const step = parseStep(label);

    expect(step, `the button should still be offering a purchase: "${label}"`).not.toBeNull();
    expect(
      step.current,
      `the final rung must not quote the same value twice: "${step.line}"`
    ).not.toBe(step.next);

    // The current value is still quoted — the player is told where they are, not
    // merely that something good happens.
    expect(step.current, `the label should still say where the charge time is now: "${step.line}"`)
      .toBe(`${legacy.current}s`);
    expect(isNumericHalf(step.next), `the next value should be a note, not a number: "${step.line}"`)
      .toBe(false);

    // The note must be the game's own always-active wording in the player's
    // language, not an English literal baked into the display code.
    const alwaysActiveWord = await game.withMods((m) => {
      const raw = m.loc.localizeRaw('buttonBlackHoleRechargeFinalUpgrade', m.cg.getLanguage());
      return raw.split('\n').find((line) => line.includes('->'))?.split('->')[1]?.trim() ?? null;
    });
    expect(alwaysActiveWord, 'the final-rung key should carry a note after its arrow').toBeTruthy();
    expect(step.next).toBe(alwaysActiveWord);

    // And the note has to be true. Buy it, and the black hole must actually
    // become permanent rather than merely claiming it will.
    const before = await game.withMods((m) => m.cg.getBlackHoleAlwaysOn());
    expect(before, 'the black hole should not already be always-on before this purchase').toBeFalsy();

    await grantResearch(game);
    await clickBlackHoleButton(game, 'blackHoleButton4');
    await game.page.waitForTimeout(600);

    const after = await game.withMods((m) => ({
      alwaysOn: m.cg.getBlackHoleAlwaysOn(),
      multiplier: m.cg.getTimeWarpMultiplier(),
      power: Number(m.rdo.getBlackHolePower())
    }));

    expect(after.alwaysOn, 'the rung promised permanent activation and must deliver it').toBe(true);
    expect(
      after.multiplier,
      'permanently active means the warp multiplier is the black hole power, not 1'
    ).toBe(after.power);

    await snapshotPanel(game, testInfo, 'final-rung-after.png');

    const maxedLabel = await blackHoleButtonLabel(game, 'blackHoleButton4');
    expect(arrowLine(maxedLabel), 'a maxed upgrade has no next step to advertise').toBeNull();

    testInfo.annotations.push({
      type: 'MEASURED GAIN',
      description:
        `The floor rung previously rendered "${legacy.current}s -> ${legacy.next}s" — an apparently `
        + `pointless ${'purchase'} that in fact sets blackHoleAlwaysOn and holds the warp at x${after.power} `
        + `for the rest of the run. It now reads "${step.current} -> ${step.next}".`
    });
  });

  test('Power and Duration quote both halves at the same precision, across the half-step boundary', async ({ game }, testInfo) => {
    await researchBlackHole(game);

    // Power steps by 2 up to x50 and by 0.5 above it, so the boundary is where a
    // whole-number pair becomes a half-step pair. Staged through the variable
    // debugger to reach it without twenty-two identical clicks; the purchases
    // either side of it are real.
    await game.setDebugVariable('blackHolePower', 49);
    await game.closeVariableDebugger();
    await openOptionById(game, 'blackholeOption');
    await game.page.waitForTimeout(600);

    const observed = [];
    for (let i = 0; i < 3; i++) {
      await grantResearch(game);
      await game.page.waitForTimeout(150);

      const label = await blackHoleButtonLabel(game, 'blackHoleButton2');
      const step = parseStep(label);
      expect(step, `the Power button should be offering a purchase: "${label}"`).not.toBeNull();

      expect(step.current, `Power advertised no change: "${step.line}"`).not.toBe(step.next);
      expect(
        decimalsOf(step.current),
        `Power quoted its two halves at different precisions: "${step.line}"`
      ).toBe(decimalsOf(step.next));

      observed.push(step.line);
      await clickBlackHoleButton(game, 'blackHoleButton2', { settleMs: 300 });
    }

    // The walk must actually have crossed the boundary, or it proved nothing
    // about the half-step tier.
    expect(
      observed.some((line) => decimalsOf(line.split('->')[0].trim()) > 0),
      `the walk should have crossed the x50 half-step boundary: ${JSON.stringify(observed)}`
    ).toBe(true);

    // Duration steps by a constant, and is only offered while the recharge is
    // still below its floor — which it is here, untouched.
    const durationLines = [];
    for (let i = 0; i < 3; i++) {
      await grantResearch(game);
      await game.page.waitForTimeout(150);

      const label = await blackHoleButtonLabel(game, 'blackHoleButton3');
      const step = parseStep(label);
      expect(step, `the Duration button should be offering a purchase: "${label}"`).not.toBeNull();

      expect(step.current, `Duration advertised no change: "${step.line}"`).not.toBe(step.next);
      expect(
        decimalsOf(step.current),
        `Duration quoted its two halves at different precisions: "${step.line}"`
      ).toBe(decimalsOf(step.next));

      durationLines.push(step.line);
      await clickBlackHoleButton(game, 'blackHoleButton3', { settleMs: 300 });
    }

    expect(game.significantErrors()).toEqual([]);

    testInfo.annotations.push({
      type: 'MEASURED GAIN',
      description:
        `Power across the half-step boundary: ${observed.join(' | ')}. `
        + `Duration: ${durationLines.join(' | ')}. `
        + 'Both halves of every pair now carry the same precision; the raw rendering '
        + 'previously mixed them (x50 -> x50.5).'
    });
  });
});

test.describe('Black Hole — the panel says what the warp is worth before it is bought', () => {
  test.setTimeout(180000);

  test('the unresearched pane carries a value hint, and loses it once bought', async ({ game }, testInfo) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await openBlackHolePane(game);

    const researched = await game.withMods((m) => m.rdo.getBlackHoleResearchDone());
    expect(researched, 'this test is about the pane before the feature is bought').toBeFalsy();

    const hint = game.page.locator('#blackHoleValueHint');
    await expect(hint, 'the unresearched pane should say what the black hole is for').toBeVisible();

    const hintText = (await hint.textContent())?.trim() ?? '';
    expect(hintText.length, 'the hint should not be empty').toBeGreaterThan(40);

    // It must come from the catalogue, not from a literal in the draw code.
    const catalogueHint = await game.withMods((m) =>
      m.loc.localizeRaw('blackHoleValueHint', m.cg.getLanguage()));
    expect(hintText).toBe(catalogueHint.trim());

    // The header description is the lasting half of the same information: it
    // stays on the pane for the rest of the run.
    const header = game.page.locator('#descriptionContentTab7');
    const headerText = (await header.textContent())?.trim() ?? '';
    const catalogueHeader = await game.withMods((m) =>
      m.loc.localizeRaw('headerDescBlackHole', m.cg.getLanguage()));
    expect(headerText).toBe(catalogueHeader.trim());
    expect(
      headerText.length,
      'the header should do more than say the feature exists — it should say what it does'
    ).toBeGreaterThan(120);

    await snapshotPanel(game, testInfo, 'value-hint-unresearched.png');

    await researchBlackHole(game);

    await expect(
      hint,
      'once the feature is owned the pitch for buying it is clutter'
    ).toBeHidden();
    const headerAfter = (await header.textContent())?.trim() ?? '';
    expect(headerAfter, 'the lasting explanation should survive the purchase').toBe(headerText);

    await snapshotPanel(game, testInfo, 'value-hint-researched.png');

    testInfo.annotations.push({
      type: 'MEASURED GAIN',
      description:
        `Unresearched pane: ${hintText.length} characters of value communication where there were 0. `
        + `Header description: ${headerText.length} characters, up from the 58 of `
        + '"This shows the Black Hole time warp feature, once unlocked."'
    });
  });

  test('the value hint and header description are translated into all six languages', async ({ game }) => {
    await game.boot({ language: 'de' });

    const languages = await game.withMods((m) => m.loc.getSupportedLanguages());
    expect(languages.length, 'the catalogue should carry six languages').toBe(6);

    const catalogue = await game.withMods((m, langs) => langs.map((lang) => ({
      lang,
      hint: m.loc.localizeRaw('blackHoleValueHint', lang),
      header: m.loc.localizeRaw('headerDescBlackHole', lang),
      finalRung: m.loc.localizeRaw('buttonBlackHoleRechargeFinalUpgrade', lang)
    })), languages);

    for (const entry of catalogue) {
      for (const key of ['hint', 'header', 'finalRung']) {
        // localizeRaw returns the key itself when the catalogue has no value for
        // it, so a missing translation shows up as the key name.
        expect(entry[key], `${entry.lang} is missing a ${key} translation`).not.toBe(key);
        expect(entry[key].length, `${entry.lang} ${key} is empty`).toBeGreaterThan(0);
      }
      expect(
        entry.finalRung,
        `${entry.lang} final-rung label should keep both placeholders`
      ).toContain('{current}');
      expect(entry.finalRung).toContain('{price}');
    }

    // Six distinct translations, not the English string copied six times.
    for (const key of ['hint', 'header']) {
      const distinct = new Set(catalogue.map((entry) => entry[key]));
      expect(distinct.size, `${key} should differ across the six languages`).toBe(6);
    }

    // And the German boot really is showing German, so the wiring is exercised
    // and not merely the catalogue.
    await game.prepareRunForStarshipLaunch();
    await openBlackHolePane(game);

    const shown = (await game.page.locator('#blackHoleValueHint').textContent())?.trim();
    const german = catalogue.find((entry) => entry.lang === 'de');
    const english = catalogue.find((entry) => entry.lang === 'en');
    expect(shown).toBe(german.hint.trim());
    expect(shown, 'a German boot must not show the English hint').not.toBe(english.hint.trim());
  });
});
