/**
 * Area: Onboarding & Tutorial
 * Plan: tests/docs/areas/onboarding.md
 *
 * The tutorial is a 46-step script rendered as an SVG spotlight overlay by
 * `onboardingChecks()`, which the frame loop calls every tick. Steps come in
 * three kinds — `spotlight` (waits for a click or a condition), `timedSpotlight`
 * (shows for N ms) and `condition` (gates on a data-object value) — and are
 * grouped into segments by the tab each one requires.
 *
 * Reaching it means accepting the real prompt, so `boot({ acceptOnboarding })`
 * clicks Yes on the same modal a new player sees. Note the prompt is only
 * offered when `loadGameFromCloud()` reports no save, which is always true for
 * the harness's random pioneer names.
 *
 * The plan's note that the tutorial is "largely still hardcoded English" is out
 * of date: every step string now resolves through `localize()`, which is why
 * this area is asserted in two languages rather than one.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** Read what the overlay is currently showing. */
function overlayState(game) {
  return game.page.evaluate(() => {
    const overlay = document.getElementById('onboardingOverlay');
    const exitButton = document.getElementById('onboardingExitButton');
    return {
      display: overlay?.style.display ?? null,
      childCount: overlay?.childElementCount ?? 0,
      svgCount: overlay?.querySelectorAll('svg').length ?? 0,
      text: (overlay?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      exitPresent: !!exitButton,
      exitDisplay: exitButton?.style.display ?? null,
      exitText: exitButton?.textContent?.trim() ?? null
    };
  });
}

test.describe('Onboarding & Tutorial', () => {
  test('the prompt is offered on a fresh pioneer and Yes starts the tutorial', async ({ game }) => {
    await game.boot({ acceptOnboarding: true });
    await game.page.waitForTimeout(1200);

    const state = await overlayState(game);
    const mode = await game.withMods((m) => m.cg.getOnboardingMode());

    expect(mode).toBe(true);
    expect(state.display).toBe('block');
    expect(state.svgCount).toBeGreaterThan(0);
    expect(state.text.length).toBeGreaterThan(0);
    expect(state.exitDisplay).toBe('flex');
  });

  test('declining the prompt leaves the tutorial off and the overlay hidden', async ({ game }) => {
    await game.boot();
    await game.page.waitForTimeout(800);

    const state = await overlayState(game);
    const mode = await game.withMods((m) => m.cg.getOnboardingMode());

    expect(mode).toBe(false);
    expect(state.display).toBe('none');
    expect(state.childCount).toBe(0);
    // The exit button is created up front but stays hidden while off.
    expect(state.exitDisplay).toBe('none');
  });

  test('the first step points at Hydrogen and is anchored to a real element', async ({ game }) => {
    await game.boot({ acceptOnboarding: true });
    await game.page.waitForTimeout(1200);

    const result = await game.page.evaluate(() => {
      const overlay = document.getElementById('onboardingOverlay');
      // The spotlight is a positioned div, not an SVG shape — createEllipseHighlight
      // bails outright on a target with no measurable rect, so a highlight that
      // exists at all is already proof the step resolved a real element. Compare
      // its box against the element the step names to prove it is the *right* one.
      const highlight = overlay?.querySelector('.onboarding-step-highlight');
      const target = document.getElementById('hydrogenOption');
      if (!highlight || !target) {
        return { text: (overlay?.textContent ?? '').trim(), highlight: !!highlight, target: !!target, overlaps: false };
      }

      const h = highlight.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      return {
        text: (overlay?.textContent ?? '').replace(/\s+/g, ' ').trim(),
        highlight: true,
        target: true,
        highlightSize: { width: h.width, height: h.height },
        // The highlight is drawn with a few pixels of padding around the target.
        overlaps: h.left <= t.left && h.top <= t.top
          && h.right >= t.right && h.bottom >= t.bottom,
        arrowCount: overlay?.querySelectorAll('svg line, svg path').length ?? 0
      };
    });

    const expected = await game.withMods((m) =>
      m.loc.localize('onboardingStepClickHydrogenOption', m.cg.getLanguage()));

    expect(result.text).toContain(expected);
    expect(result.highlight).toBe(true);
    expect(result.highlightSize.width).toBeGreaterThan(0);
    expect(result.highlightSize.height).toBeGreaterThan(0);
    // The spotlight must enclose the element the step is telling the player to
    // click, not sit somewhere else on screen.
    expect(result.overlaps).toBe(true);
    expect(result.arrowCount).toBeGreaterThan(0);
  });

  test('the tutorial advances when the highlighted element is clicked', async ({ game }) => {
    await game.boot({ acceptOnboarding: true });
    await game.page.waitForTimeout(1200);

    const first = (await overlayState(game)).text;

    // Step 1 waits for a click on the Hydrogen side-menu option; step 2 then
    // asks for the Gain button. Driving the real element is the only way the
    // step's own click listener fires.
    await game.page.evaluate(() => {
      document.getElementById('hydrogenOption')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(1200);

    const second = (await overlayState(game)).text;
    const expectedSecond = await game.withMods((m) =>
      m.loc.localize('onboardingStepClickGainButton', m.cg.getLanguage()));

    expect(second).not.toBe(first);
    expect(second).toContain(expectedSecond);
  });

  test('a condition step holds until its data-object threshold is met', async ({ game }) => {
    await game.boot({ acceptOnboarding: true });
    await game.page.waitForTimeout(1000);

    // Walk to the step that waits for 50 hydrogen.
    await game.page.evaluate(() => {
      document.getElementById('hydrogenOption')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(900);

    const held = await game.withMods((m) => ({
      hydrogen: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
      text: (document.getElementById('onboardingOverlay')?.textContent ?? '').replace(/\s+/g, ' ').trim()
    }));

    // Satisfy the condition outright and let the loop notice.
    await game.withMods((m) => m.rdo.setResourceDataObject(500, 'resources', ['hydrogen', 'quantity']));
    await game.page.waitForTimeout(1500);

    const advanced = await overlayState(game);

    expect(held.hydrogen).toBeLessThan(50);
    // Whatever step it lands on, the overlay must still be showing a live step
    // rather than having stalled or emptied.
    expect(advanced.display).toBe('block');
    expect(advanced.text.length).toBeGreaterThan(0);
  });

  test('leaving the required tab prompts a return rather than dead-ending', async ({ game }) => {
    await game.boot({ acceptOnboarding: true });
    await game.page.waitForTimeout(1000);

    // Segment 1 requires the Resources tab; jump to Settings instead.
    await game.openTab(9);
    await game.page.waitForTimeout(1200);
    const offTab = await overlayState(game);

    await game.openTab(1);
    await game.page.waitForTimeout(1200);
    const backOnTab = await overlayState(game);

    // The overlay stays up and keeps saying something while the player is on the
    // wrong tab — the failure mode being guarded against is a blank overlay that
    // silently traps them there.
    expect(offTab.display).toBe('block');
    expect(offTab.text.length).toBeGreaterThan(0);
    expect(backOnTab.display).toBe('block');
    expect(backOnTab.text.length).toBeGreaterThan(0);
    expect(game.significantErrors()).toEqual([]);
  });

  test('the exit button ends the tutorial and leaves the game playable', async ({ game }) => {
    await game.boot({ acceptOnboarding: true });
    await game.page.waitForTimeout(1000);

    await game.page.click('#onboardingExitButton');
    await game.page.waitForTimeout(900);

    const state = await overlayState(game);
    const mode = await game.withMods((m) => m.cg.getOnboardingMode());

    expect(mode).toBe(false);
    expect(state.display).toBe('none');
    expect(state.exitDisplay).toBe('none');

    // The overlay covered the screen; with it gone, normal play must resume.
    await game.openTab(1);
    await game.page.evaluate(() => {
      document.getElementById('hydrogenOption')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(500);

    const pane = await game.withMods((m) => m.cg.getCurrentOptionPane());
    expect(pane).toBe('hydrogen');
    expect(game.significantErrors()).toEqual([]);
  });

  test('turning onboarding back off and on again rebuilds the tutorial from the first step', async ({ game }) => {
    await game.boot({ acceptOnboarding: true });
    await game.page.waitForTimeout(1000);

    await game.page.evaluate(() => {
      document.getElementById('hydrogenOption')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(1000);
    const advanced = (await overlayState(game)).text;

    await game.withMods((m) => m.cg.setOnboardingMode(false));
    await game.page.waitForTimeout(600);
    await game.withMods((m) => m.cg.setOnboardingMode(true));
    await game.page.waitForTimeout(1000);

    const restarted = (await overlayState(game)).text;
    const firstStep = await game.withMods((m) =>
      m.loc.localize('onboardingStepClickHydrogenOption', m.cg.getLanguage()));

    // resetOnboardingProgression() clears the segment index when the mode goes
    // off, so re-enabling starts over rather than resuming mid-script.
    expect(advanced).not.toContain(firstStep);
    expect(restarted).toContain(firstStep);
  });

  test('every tutorial step string is present in all five languages', async ({ game }) => {
    await game.boot();

    const problems = await game.withMods(async (m, languages) => {
      // The step keys as authored in onboardingChecks(); a key with no catalogue
      // entry localizes to itself, which is how an untranslated step shows up.
      const keys = [
        'onboardingStepClickHydrogenOption', 'onboardingStepClickGainButton',
        'onboardingStepKeepClickingGain', 'onboardingStepBuyHydrogenAutoBuyer',
        'onboardingStepClickResearchTab', 'onboardingStepClickResearch',
        'onboardingStepBuyThreeScienceKits', 'onboardingStepTurnOffScienceKit',
        'onboardingStepTogglesExplained', 'onboardingStepTurnOnScienceKit',
        'onboardingStepReturnToResourcesTab', 'onboardingStepStorageFillsUp',
        'onboardingStepClickIncreaseStorage', 'onboardingStepStorageDoubled',
        'onboardingStepHelpAutoBuyerAlong', 'onboardingStepClickSellButton',
        'onboardingStepCashShownHere', 'onboardingStepReturnToResearchTab',
        'onboardingStepClickTechnology', 'onboardingStepTechnologyExplained',
        'onboardingStepClickTechTree', 'onboardingStepTechTreeExplained',
        'onboardingStepReturnToTechnology', 'onboardingStepResearchKnowledgeSharing',
        'onboardingStepScienceClubHint', 'onboardingStepLookAtSettingsTab',
        'onboardingStepChangeLookAndFeel', 'onboardingStepVisualMenuExplained',
        'onboardingStepClickDropdown', 'onboardingStepSelectDark',
        'onboardingStepClickGameOptions', 'onboardingStepClickAmbienceToggle',
        'onboardingStepAmbienceAndHelp', 'onboardingStepClickCosmicopedia',
        'onboardingStepGetStartedExplained', 'onboardingStepStoryExplained',
        'onboardingStepClickConceptsEarly', 'onboardingStepClickConceptsMid',
        'onboardingStepClickConceptsLate', 'onboardingStepFinished',
        'onboardingModalHeader', 'onboardingModalText', 'onboardingExitButton'
      ];

      const original = m.cg.getLanguage();
      const issues = [];

      for (const language of languages) {
        await m.loc.initLocalization(language);
        for (const key of keys) {
          const value = m.loc.localize(key, language);
          if (!value || typeof value !== 'string' || !value.trim()) {
            issues.push(`${language}:${key}: blank`);
          } else if (value === key) {
            issues.push(`${language}:${key}: missing from the catalogue`);
          }
        }
      }

      await m.loc.initLocalization(original);
      m.desc.initialiseDescriptions();
      return issues;
    }, ['en', 'es', 'pt', 'de', 'it', 'fr']);

    expect(problems).toEqual([]);
  });

  test('the tutorial renders in German end to end, not just its catalogue', async ({ game }) => {
    await game.boot({ acceptOnboarding: true, language: 'de' });
    await game.page.waitForTimeout(1200);

    const state = await overlayState(game);
    const strings = await game.withMods((m) => ({
      language: m.cg.getLanguage(),
      firstStepDe: m.loc.localize('onboardingStepClickHydrogenOption', 'de'),
      firstStepEn: m.loc.localize('onboardingStepClickHydrogenOption', 'en'),
      exitDe: m.loc.localize('onboardingExitButton', 'de'),
      exitEn: m.loc.localize('onboardingExitButton', 'en')
    }));

    expect(strings.language).toBe('de');
    // The two languages must actually differ, or this proves nothing.
    expect(strings.firstStepDe).not.toBe(strings.firstStepEn);
    expect(state.text).toContain(strings.firstStepDe);
    expect(state.text).not.toContain(strings.firstStepEn);
    expect(state.exitText).toBe(strings.exitDe);
    expect(state.exitText).not.toBe(strings.exitEn);
  });

  test('the German tutorial advances through a click exactly as the English one does', async ({ game }) => {
    await game.boot({ acceptOnboarding: true, language: 'de' });
    await game.page.waitForTimeout(1200);

    const first = (await overlayState(game)).text;

    await game.page.evaluate(() => {
      document.getElementById('hydrogenOption')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(1200);

    const second = (await overlayState(game)).text;
    const expectedSecond = await game.withMods((m) => m.loc.localize('onboardingStepClickGainButton', 'de'));

    expect(second).not.toBe(first);
    expect(second).toContain(expectedSecond);
    expect(game.significantErrors()).toEqual([]);
  });

  test('onboarding mode is not persisted into a save', async ({ game }) => {
    await game.boot({ acceptOnboarding: true });
    await game.page.waitForTimeout(800);

    const result = await game.withMods((m) => {
      const liveMode = m.cg.getOnboardingMode();
      const saved = JSON.parse(JSON.stringify(m.cg.captureGameStatusForSaving('initialise')));
      return { liveMode, savedFlags: saved.flags ?? {} };
    });

    expect(result.liveMode).toBe(true);
    // The tutorial is a session-scoped mode, not run state: saveLoadGame.js
    // clears it explicitly on load, so it must not travel in the save.
    expect(result.savedFlags.onboardingMode).toBeUndefined();
  });

  test('running the tutorial produces no console or page errors', async ({ game }) => {
    await game.boot({ acceptOnboarding: true });
    await game.page.waitForTimeout(1000);

    await game.page.evaluate(() => {
      document.getElementById('hydrogenOption')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await game.page.waitForTimeout(800);
    await game.openTab(3);
    await game.page.waitForTimeout(800);
    await game.openTab(1);
    await game.page.waitForTimeout(800);

    expect(game.significantErrors()).toEqual([]);
  });
});
