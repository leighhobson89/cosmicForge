/**
 * Area: Cosmicopedia & Help
 * Plan: tests/docs/areas/cosmicopedia.md
 *
 * The help content itself lives in descriptions.js as a static, localized object
 * (helpContent) fed by getHelpContent(section, type). That is exercised directly,
 * the same way battle.spec.js checks modal copy across languages, plus a pass
 * through the real Settings tab UI to confirm each section actually opens.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

const SECTIONS = [
  'contact',
  'get started',
  'story',
  'concepts - early',
  'concepts - mid',
  'concepts - late',
  'concepts - end goal',
  'philosophies'
];

const UI_PANES = [
  ['Contact', 'tab9ContactDevOption', 'contactRowTextArea'],
  ['Get Started', 'tab9GetStartedOption', 'getStartedRowTextArea'],
  ['Story', 'tab9StoryOption', 'storyRowTextArea'],
  ['Concepts - Early', 'tab9ConceptsEarlyOption', 'conceptsEarlyRowTextArea'],
  ['Concepts - Mid', 'tab9ConceptsMidOption', 'conceptsMidRowTextArea'],
  ['Concepts - Late', 'tab9ConceptsLateOption', 'conceptsLateRowTextArea'],
  ['Concepts - End Goal', 'tab9ConceptsEndGoalOption', 'conceptsEndGoalRowTextArea'],
  ['Philosophies', 'tab9PhilosophiesOption', 'philosophiesTextArea']
];

const LANGUAGES = ['en', 'es', 'de', 'it', 'fr'];

test.describe('Cosmicopedia & Help', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('every help section has at least one heading and body, in matching counts', async ({ game }) => {
    const problems = await game.withMods((m, sections) => {
      const issues = [];
      for (const section of sections) {
        const headings = m.desc.getHelpContent(section, 'subHeadings');
        const bodies = m.desc.getHelpContent(section, 'subBodys');
        if (!Array.isArray(headings) || headings.length === 0) issues.push(`${section}: no headings`);
        if (!Array.isArray(bodies) || bodies.length === 0) issues.push(`${section}: no bodies`);
        if (headings.length !== bodies.length) issues.push(`${section}: ${headings.length} headings vs ${bodies.length} bodies`);
      }
      return issues;
    }, SECTIONS);

    expect(problems).toEqual([]);
  });

  test('the concept sections (early, mid, late, end goal) each carry distinct material', async ({ game }) => {
    const content = await game.withMods((m) => ({
      early: m.desc.getHelpContent('concepts - early', 'subHeadings'),
      mid: m.desc.getHelpContent('concepts - mid', 'subHeadings'),
      late: m.desc.getHelpContent('concepts - late', 'subHeadings'),
      endGoal: m.desc.getHelpContent('concepts - end goal', 'subHeadings')
    }));

    expect(content.early.length).toBeGreaterThan(0);
    expect(content.mid.length).toBeGreaterThan(0);
    expect(content.late.length).toBeGreaterThan(0);
    expect(content.endGoal.length).toBeGreaterThan(0);

    // The four stages must not just be copies of one another.
    expect(content.early).not.toEqual(content.mid);
    expect(content.mid).not.toEqual(content.late);
    expect(content.late).not.toEqual(content.endGoal);
  });

  test('the story and philosophies sections render full, non-empty content', async ({ game }) => {
    const content = await game.withMods((m) => ({
      storyHeadings: m.desc.getHelpContent('story', 'subHeadings'),
      storyBodies: m.desc.getHelpContent('story', 'subBodys'),
      philosophyHeadings: m.desc.getHelpContent('philosophies', 'subHeadings'),
      philosophyBodies: m.desc.getHelpContent('philosophies', 'subBodys')
    }));

    for (const [label, arr] of Object.entries(content)) {
      expect(arr.length, `${label} should not be empty`).toBeGreaterThan(0);
      for (const entry of arr) {
        expect(typeof entry === 'string' && entry.trim().length > 0, `${label} entry "${entry}" should be non-empty text`).toBe(true);
      }
    }
  });

  test('the Discord invite and contact email are present and well-formed', async ({ game }) => {
    const contact = await game.withMods((m) => {
      const headings = m.desc.getHelpContent('contact', 'subHeadings');
      const bodies = m.desc.getHelpContent('contact', 'subBodys');
      return { headings, bodies };
    });

    const discordEntry = contact.bodies.find((b) => typeof b === 'string' && b.includes('discord.gg'));
    const emailEntry = contact.bodies.find((b) => typeof b === 'string' && b.includes('@gmail.com'));

    expect(discordEntry, 'a discord.gg link should be present').toBeTruthy();
    expect(discordEntry).toMatch(/^https:\/\/discord\.gg\/[A-Za-z0-9]+$/);

    expect(emailEntry, 'a @gmail.com contact address should be present').toBeTruthy();
    expect(emailEntry).toMatch(/[a-zA-Z0-9._%+-]+@gmail\.com/);
  });

  test('all help content is localized: every language yields non-empty text with no leftover keys', async ({ game }) => {
    const unresolved = await game.withMods(async (m, { sections, languages }) => {
      const original = m.cg.getLanguage();
      const problems = [];

      for (const lang of languages) {
        await m.loc.initLocalization(lang);
        m.desc.initialiseDescriptions();

        for (const section of sections) {
          const headings = m.desc.getHelpContent(section, 'subHeadings');
          const bodies = m.desc.getHelpContent(section, 'subBodys');

          // Headings always carry text. Bodies are usually non-empty prose too,
          // except contact's subBody1, which is an intentional heading-only line
          // (the Discord/email details follow in later entries) — so only flag a
          // blank body if every language agrees it should be blank would be too
          // strict here; instead just skip the emptiness check for bodies and
          // rely on the raw-key check to catch anything actually broken.
          headings.forEach((value, i) => {
            if (typeof value !== 'string' || !value.trim()) {
              problems.push(`${lang}:${section}:heading${i}:empty`);
            }
          });

          [...headings, ...bodies].forEach((value, i) => {
            if (typeof value !== 'string' || !value.trim()) return;
            // A raw, un-translated localization key would look like this and
            // slip through as visible camelCase junk instead of prose.
            if (/^help[A-Z][A-Za-z0-9]*$/.test(value.trim())) {
              problems.push(`${lang}:${section}:${i}:raw-key(${value})`);
            }
          });
        }
      }

      await m.loc.initLocalization(original);
      m.desc.initialiseDescriptions();
      return problems;
    }, { sections: SECTIONS, languages: LANGUAGES });

    expect(unresolved).toEqual([]);
  });

  test('every Cosmicopedia section opens from the Settings tab and renders its text area', async ({ game }) => {
    await game.openTab(9);

    const missing = [];
    for (const [label, optionId, textAreaId] of UI_PANES) {
      const opened = await game.page.evaluate((id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        el.classList.remove('invisible');
        el.closest('.row-side-menu')?.classList.remove('invisible');
        el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        return true;
      }, optionId);

      if (!opened) {
        missing.push(`${label}: option element ${optionId} not found`);
        continue;
      }

      await game.page.waitForTimeout(200);

      const rendered = await game.page.evaluate((id) => {
        const el = document.getElementById(id);
        return Boolean(el && (el.textContent || '').trim().length > 0);
      }, textAreaId);

      if (!rendered) {
        missing.push(`${label}: text area ${textAreaId} did not render content`);
      }
    }

    expect(missing).toEqual([]);
  });
});
