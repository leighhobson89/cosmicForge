/**
 * Area: Localization
 * Plan: tests/docs/areas/localization.md
 * Feature status: docs/localization/status.md (item 5)
 *
 * Extraction of hardcoded strings. Item 5 is a long tail rather than a single
 * change, so this file does two things: it asserts that the parts already
 * extracted really do render from the catalogue, and it ratchets the size of the
 * remaining tail so the work can only move in one direction.
 */
import { test, expect } from '../_harness/game-fixture.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const CATALOGUE = JSON.parse(fs.readFileSync(path.join(ROOT, 'localization.json'), 'utf8'));

const LANGUAGES = ['en', 'es', 'pt', 'de', 'it', 'fr'];

/**
 * Ratchet for the remaining tail. Visible text nodes in `index.html` that are
 * neither annotated with `data-loc` nor a pure number/symbol placeholder.
 *
 * What is left is the debug windows (Numpad `-` and `*`), which are dev-only and
 * documented as fine to leave in English, plus the modal template's placeholder
 * text, which is replaced at runtime before a player ever sees it.
 */
const UNANNOTATED_HTML_TEXT_CEILING = 74;

/** The onboarding tutorial: every instruction the player is shown. */
const ONBOARDING_STEP_KEYS = Object.keys(CATALOGUE.en).filter((k) => k.startsWith('onboardingStep'));

function indexHtml() {
  return fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
}

test.describe('Localization — hardcoded string extraction', () => {
  test('the static shell is annotated rather than hand-wired', async () => {
    // `initialiseStaticButtonLabels` is now a single `[data-loc]` sweep. If the
    // annotations disappear the sweep silently does nothing, so assert both the
    // count and that every key it names actually exists.
    const html = indexHtml();
    const keys = [...html.matchAll(/data-loc="([^"]+)"/g)].map((m) => m[1]);

    expect(keys.length).toBeGreaterThanOrEqual(80);

    const dangling = [...new Set(keys)].filter((k) => !(k in CATALOGUE.en));
    expect(dangling).toEqual([]);
  });

  test('unannotated visible text in index.html does not grow', async () => {
    const html = indexHtml()
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<style[\s\S]*?<\/style>/g, '');

    const leftover = [];
    for (const match of html.matchAll(/<([a-z0-9]+)([^>]*)>([^<>]+)</gi)) {
      const [, , attrs, text] = match;
      const trimmed = text.trim();
      if (!trimmed) continue;
      // Numbers, units and symbol-only nodes are placeholders, not copy.
      if (/^[\W\d\s]+$/.test(trimmed)) continue;
      if (/\bdata-loc="/.test(attrs)) continue;
      leftover.push(trimmed);
    }

    expect(
      leftover.length,
      `unannotated visible text grew to ${leftover.length}: ${[...new Set(leftover)].slice(0, 12).join(' | ')}`
    ).toBeLessThanOrEqual(UNANNOTATED_HTML_TEXT_CEILING);
  });

  test('every onboarding instruction is translated in all six languages', async () => {
    // The tutorial is the first thing a new player reads, which is why it sits
    // at the top of the item 5 priority list.
    expect(ONBOARDING_STEP_KEYS.length).toBeGreaterThanOrEqual(40);

    const missing = [];
    for (const language of LANGUAGES) {
      for (const key of ONBOARDING_STEP_KEYS) {
        const value = CATALOGUE[language][key];
        if (!value || !String(value).trim()) missing.push(`${language}:${key}`);
      }
    }
    expect(missing).toEqual([]);
  });

  test('onboarding.js holds no instruction literals of its own', async () => {
    // Every step's text must come through localize(); a literal left behind
    // would render in English inside an otherwise translated tutorial.
    const source = fs.readFileSync(path.join(ROOT, 'onboarding.js'), 'utf8');

    const stepTable = source.slice(source.indexOf('setOnboardingSteps(['));
    const literals = [...stepTable.matchAll(/,\s*(['"])((?:(?!\1)[^\\]|\\.){12,})\1\s*,/g)]
      .map((m) => m[2])
      // Tab names and option keys are identifiers, not player-facing copy.
      .filter((t) => /\s/.test(t) && !/^[a-z][A-Za-z]*$/.test(t));

    expect(literals).toEqual([]);
  });

  test('onboarding targets resolve through the catalogue, not English text', async ({ game }) => {
    // Steps address some elements by the text the player can see. Those needles
    // are authored in English, so without translation the tutorial stalls on its
    // very first step in any other language.
    const source = fs.readFileSync(path.join(ROOT, 'onboarding.js'), 'utf8');
    const needleKeys = [...source.matchAll(/^\s+'([^']+)':\s*'([A-Za-z][A-Za-z0-9]*)'/gm)]
      .filter(([, , key]) => key in CATALOGUE.en);

    expect(needleKeys.length).toBeGreaterThanOrEqual(15);

    await game.boot();
    await game.withMods((m) => m.ui.relocalizeAll('de'));
    await game.page.waitForTimeout(400);

    // The needle for each of these keys is matched against rendered text, so
    // the element the step aims at must actually carry the German form. Read the
    // annotated elements directly rather than scanning the page: most of these
    // live on tabs that are not open yet.
    const rendered = await game.page.evaluate((keys) => {
      const out = {};
      for (const key of keys) {
        const el = document.querySelector(`[data-loc="${key}"]`);
        out[key] = el ? el.textContent.replace(/⚠️|🌀/g, '').trim() : null;
      }
      return out;
    }, [...new Set(needleKeys.map(([, , key]) => key))]);

    const wrong = Object.entries(rendered)
      .filter(([key, text]) => text !== null && text !== CATALOGUE.de[key])
      .map(([key, text]) => `${key}: "${text}" != "${CATALOGUE.de[key]}"`);

    expect(wrong).toEqual([]);

    // And the ones the tutorial's very first steps depend on must be present at
    // all, or the needle has nothing to match.
    for (const key of ['resourceHydrogen', 'headerMainResearch', 'headerMainTechnology', 'cosmicopedia']) {
      expect(rendered[key], `${key} has no annotated element to match against`).toBe(CATALOGUE.de[key]);
    }
  });

  test('the power grid button is translated in every language', async ({ game, page }) => {
    // Its three states were written inline in the frame loop, so they used to
    // stay English forever while everything around them translated.
    await game.boot();
    await game.debugClick('unlockAllTabsButton');
    await game.openTab(2);
    await page.waitForTimeout(300);

    const observed = [];
    for (const language of LANGUAGES) {
      await game.withMods((m, l) => m.ui.relocalizeAll(l), language);
      await page.waitForTimeout(300);
      observed.push({
        language,
        text: await page.evaluate(() => document.getElementById('activateGridButton')?.textContent?.trim())
      });
    }

    const wrong = observed.filter(
      ({ language, text }) => ![CATALOGUE[language].buttonPowerOn, CATALOGUE[language].buttonPowerOff,
        CATALOGUE[language].megaStructureTTNameDysonSphere].includes(text)
    );

    expect(wrong.map((w) => `${w.language}: "${w.text}"`)).toEqual([]);
  });

  test('the stat bar labels are translated', async ({ game, page }) => {
    await game.boot();
    await game.withMods((m) => m.ui.relocalizeAll('de'));
    await page.waitForTimeout(300);

    const labels = await page.evaluate(() =>
      Array.from(document.querySelectorAll('#statsContainer .stat-label')).map((el) => el.textContent.trim()));

    for (const key of ['statLabelCash', 'statLabelEnergy', 'statLabelPowered', 'statLabelBattery']) {
      expect(labels, `${key} missing from the stat bar`).toContain(CATALOGUE.de[key]);
    }
  });

  test('the tech research buttons are translated', async ({ game, page }) => {
    // 74 identical `Research` buttons in drawTab3Content, all inline literals.
    await game.boot();
    await game.debugClick('unlockAllTabsButton');
    await game.openTab(3);
    await page.evaluate(() => {
      const target = document.querySelector('[class~="tab3.option2"]');
      target?.classList.remove('invisible');
      target?.closest('.row-side-menu')?.classList.remove('invisible');
      target?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await page.waitForTimeout(400);
    await game.withMods((m) => m.ui.relocalizeAll('de'));
    await page.waitForTimeout(500);

    const buttonTexts = await page.evaluate(() =>
      Array.from(document.querySelectorAll('#optionContentTab3 button')).map((el) => el.textContent.trim()));

    expect(buttonTexts.length).toBeGreaterThan(0);
    expect(buttonTexts).toContain(CATALOGUE.de.buttonResearch);
    expect(buttonTexts).not.toContain('Research');
  });
  test('a power plant can still be switched on in a language other than English', async ({ game, page }) => {
    // The regression this guards is known-issues #40, and it was reachable by
    // any non-English player from their first power plant: the toggle's state
    // rode on its own label, and `addOrRemoveUsedPerSecForFuelRate` read it back
    // with `switch (button.textContent)` against the English words. The row is
    // drawn with `localize('buttonActivate')`, so outside English the switch
    // matched neither case, the click fell through, and the plant stayed off.
    await game.boot();
    await game.debugClick('unlockAllTabsButton');
    await game.debugClick('give1BButton');
    await game.debugClick('give1MAllResourcesAndCompounds');
    await game.debugClick('grantAllTechsButton');
    await page.waitForTimeout(500);

    await game.openTab(2);
    await page.evaluate(() => {
      const target = document.getElementById('powerPlant1Option');
      target?.classList.remove('invisible');
      target?.closest('.row-side-menu')?.classList.remove('invisible');
      target?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await page.waitForTimeout(500);

    // Buy one through its own Build button, so the toggle is drawn the way a
    // player's first plant draws it.
    await page.evaluate(() => {
      document.querySelector('#energyPowerPlant1Row button.building-purchase-button')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await page.waitForTimeout(600);

    expect(await game.withMods((m) => m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity'])),
      'a plant should have been bought').toBeGreaterThan(0);
    expect(await game.withMods((m) => m.cg.getBuildingTypeOnOff('powerPlant1')),
      'a freshly bought plant is off').toBeFalsy();

    await game.withMods((m) => m.ui.relocalizeAll('de'));
    await page.waitForTimeout(600);

    const toggle = await page.evaluate(() => {
      const button = document.querySelector('#optionContentTab2 button.toggle-timer');
      return button ? { text: button.textContent.trim(), found: true } : { found: false };
    });
    expect(toggle.found, 'the plant should have a toggle button').toBe(true);
    expect(toggle.text, 'and it should be asking, in German, to be switched on')
      .toBe(CATALOGUE.de.buttonActivate);

    await page.evaluate(() => {
      document.querySelector('#optionContentTab2 button.toggle-timer')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await page.waitForTimeout(600);

    expect(await game.withMods((m) => m.cg.getBuildingTypeOnOff('powerPlant1')),
      'clicking Aktivieren must switch the plant on, exactly as Activate does').toBe(true);
    expect(await page.evaluate(() =>
      document.querySelector('#optionContentTab2 button.toggle-timer')?.textContent?.trim()),
      'and the button must now offer to switch it back off').toBe(CATALOGUE.de.buttonDeactivate);
  });

  test('the power indicator reads ON and OFF in the player\'s language', async ({ game, page }) => {
    await game.boot();
    await game.debugClick('unlockAllTabsButton');
    await page.waitForTimeout(300);

    for (const language of ['de', 'fr']) {
      await game.withMods((m, l) => m.ui.relocalizeAll(l), language);
      await page.waitForTimeout(400);

      const indicator = await page.evaluate(() =>
        document.getElementById('stat3')?.textContent?.trim() ?? '');

      // The indicator is a bullet plus one of three words. Whichever state the
      // grid is in, the word has to be that language's word.
      const expected = [
        CATALOGUE[language].textOn,
        CATALOGUE[language].textOff,
        CATALOGUE[language].textTrippedIndicator.replace(/^•\s*/, '')
      ];
      expect(expected.some((word) => indicator.includes(word)),
        `${language}: power indicator read "${indicator}"`).toBe(true);
    }
  });

  test('the trade summary keeps working when its not-applicable marker is translated', async ({ game, page }) => {
    // The three summary lines used to hold the literal 'N/A' and be compared
    // back as text. Translating the marker without moving the state onto the
    // element would leave the comparison matching nothing, and the summary
    // stuck on whichever figures were last typed.
    await game.boot();
    await game.debugClick('unlockAllTabsButton');
    await game.debugClick('give1BButton');
    await page.waitForTimeout(400);

    await game.openTab(7);
    await page.evaluate(() => {
      const target = document.getElementById('galacticMarketOption');
      target?.classList.remove('invisible');
      target?.closest('.row-side-menu')?.classList.remove('invisible');
      target?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await page.waitForTimeout(700);

    await game.withMods((m) => m.ui.relocalizeAll('de'));
    await page.waitForTimeout(700);

    const summary = await page.evaluate(() => {
      const ids = ['galacticMarketOutgoingQuantityText', 'galacticMarketIncomingQuantityText',
        'galacticMarketComissionQuantitySummaryText'];
      return ids.map((id) => {
        const el = document.getElementById(id);
        return el ? { id, text: el.textContent.trim(), flagged: el.dataset.notApplicable === 'true' } : null;
      }).filter(Boolean);
    });

    expect(summary.length, 'the trade summary should be on screen').toBe(3);
    for (const line of summary) {
      // Nothing has been selected yet, so every line is not-applicable — and the
      // state is on the element, with the German wording as its display.
      expect(line.flagged, `${line.id} should carry the not-applicable flag`).toBe(true);
      expect(line.text, `${line.id} should read the German marker`).toBe(CATALOGUE.de.textNotApplicable);
      expect(line.text, 'and not the English one').not.toBe(CATALOGUE.en.textNotApplicable);
    }
  });

  test('the pioneer-name modal explains itself in the chosen language', async ({ page }) => {
    // Boot only as far as the welcome modal: this hint sits under the name field
    // and was the last hardcoded sentence on the first screen a player sees.
    await page.addInitScript(() => {
      try { window.localStorage.setItem('cosmicForgeLanguage', 'fr'); } catch { /* storage blocked */ }
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#pioneerCodeName', { timeout: 60000 });

    const text = await page.evaluate(() =>
      (document.querySelector('.modal-content p')?.innerText ?? '').trim());

    expect(text).toContain(CATALOGUE.fr.gameSaveNameLoadHint);
    expect(text).not.toContain(CATALOGUE.en.gameSaveNameLoadHint);
  });
});
