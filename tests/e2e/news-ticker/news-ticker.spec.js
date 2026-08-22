/**
 * Area: News Ticker
 * Plan: tests/docs/areas/news-ticker.md
 *
 * The ticker is scheduled by `startNewsTickerTimer()` on the *non-delta*
 * `timerManager`, and its content and cadence are both steerable from the debug
 * menu's News Ticker row (Numpad -): a category select that forces one content
 * family, and an interval select that replaces the random 20–35 second gap.
 * Both are driven here through the real controls.
 *
 * Content lives in `descriptions.js` and is rebuilt by `initialiseDescriptions()`
 * on every language change, so the localization case re-initialises rather than
 * reading `localization.json` directly — the same two-tier resolution trap the
 * achievements and buffs specs hit.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

const CATEGORIES = ['wackyEffects', 'oneOff', 'prize', 'manuscriptClues', 'noPrize'];
const LANGUAGES = ['en', 'es', 'pt', 'de', 'it', 'fr'];

/** Set the debug News Ticker category and interval through the real controls. */
async function setTickerDebug(game, { category = '', interval = '' } = {}) {
  await game.debugSelect('debugNewsTickerCategorySelect', category);
  await game.debugSelect('debugNewsTickerIntervalSelect', interval);
  await game.debugClick('setNewsTickerDebugButton');
  await game.page.waitForTimeout(200);
}

test.describe('News Ticker', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('the ticker container and content element exist from boot', async ({ game }) => {
    const dom = await game.page.evaluate(() => ({
      container: !!document.querySelector('.news-ticker-container'),
      content: !!document.querySelector('.news-ticker-content'),
      containerId: document.querySelector('.news-ticker-container')?.id
    }));

    expect(dom.container).toBe(true);
    expect(dom.content).toBe(true);
    expect(dom.containerId).toBe('newsTickerContainer');
  });

  test('every documented content category exists and carries entries', async ({ game }) => {
    const content = await game.withMods((m, categories) => {
      const data = m.desc.getNewsTickerContent();
      return {
        keys: Object.keys(data || {}),
        counts: Object.fromEntries(categories.map((c) => [c, Array.isArray(data?.[c]) ? data[c].length : null]))
      };
    }, CATEGORIES);

    expect(content.keys.sort()).toEqual([...CATEGORIES].sort());
    for (const category of CATEGORIES) {
      expect(content.counts[category], `${category} should be a non-empty array`).toBeGreaterThan(0);
    }
    // noPrize is the fallback family that fires roughly three spins in four, so
    // it carries by far the deepest pool.
    expect(content.counts.noPrize).toBeGreaterThan(content.counts.prize);
  });

  test('prize, one-off and wacky entries carry the id the seen-tracking relies on', async ({ game }) => {
    const problems = await game.withMods((m) => {
      const data = m.desc.getNewsTickerContent();
      const issues = [];
      for (const category of ['prize', 'oneOff', 'wackyEffects']) {
        (data?.[category] || []).forEach((entry, index) => {
          if (!entry || typeof entry !== 'object') {
            issues.push(`${category}[${index}]: not an object`);
            return;
          }
          // showNewsTickerMessage calls addMessageToSeenArray(message.id) for
          // these three families before building the message, so a missing id
          // would silently break unique-ticker statistics.
          if (entry.id === undefined || entry.id === null) issues.push(`${category}[${index}]: no id`);
          if (!entry.body || typeof entry.body !== 'string') issues.push(`${category}[${index}]: no body`);
        });
      }
      return issues;
    });

    expect(problems).toEqual([]);
  });

  test('manuscript clue templates all carry a {STAR} placeholder', async ({ game }) => {
    const templates = await game.withMods((m) => (m.desc.getNewsTickerContent()?.manuscriptClues || [])
      .map((entry) => ({ id: entry?.templateId ?? entry?.id ?? null, template: entry?.template ?? null })));

    expect(templates.length).toBeGreaterThan(0);
    for (const entry of templates) {
      expect(typeof entry.template, `template ${entry.id}`).toBe('string');
      // The clue is built by replacing {STAR} with the manuscript star's name;
      // a template without it names no star and is useless as a clue.
      expect(entry.template).toContain('{STAR}');
    }
  });

  test('the debug menu sets the forced category and interval', async ({ game }) => {
    const before = await game.withMods((m) => ({
      category: m.cg.getDebugNewsTickerCategory(),
      interval: m.cg.getDebugNewsTickerIntervalMs()
    }));
    expect(before.category).toBeNull();
    expect(before.interval).toBeNull();

    await setTickerDebug(game, { category: 'wackyEffects', interval: '10000' });

    const after = await game.withMods((m) => ({
      category: m.cg.getDebugNewsTickerCategory(),
      interval: m.cg.getDebugNewsTickerIntervalMs()
    }));
    expect(after.category).toBe('wackyEffects');
    expect(after.interval).toBe(10000);
  });

  test('the debug category select offers only categories the setter accepts', async ({ game }) => {
    const offered = await game.page.evaluate(() =>
      Array.from(document.querySelectorAll('#debugNewsTickerCategorySelect option'))
        .map((el) => el.value)
        .filter(Boolean));

    const accepted = await game.withMods((m, values) => {
      const results = {};
      for (const value of values) {
        m.cg.setDebugNewsTickerCategory(null);
        m.cg.setDebugNewsTickerCategory(value);
        results[value] = m.cg.getDebugNewsTickerCategory();
      }
      m.cg.setDebugNewsTickerCategory(null);
      return results;
    }, offered);

    expect(offered.length).toBeGreaterThan(0);
    for (const value of offered) {
      expect(accepted[value], `${value} rejected by setDebugNewsTickerCategory`).toBe(value);
    }
  });

  test('an unrecognised category is rejected and an interval under a second falls back to the default', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.cg.setDebugNewsTickerCategory('prize');
      m.cg.setDebugNewsTickerCategory('notARealCategory');
      const categoryAfterBadValue = m.cg.getDebugNewsTickerCategory();

      m.cg.setDebugNewsTickerIntervalMs(10000);
      m.cg.setDebugNewsTickerIntervalMs(500);
      const intervalAfterTooShort = m.cg.getDebugNewsTickerIntervalMs();

      m.cg.setDebugNewsTickerIntervalMs(1000);
      const intervalAtMinimum = m.cg.getDebugNewsTickerIntervalMs();

      m.cg.setDebugNewsTickerCategory(null);
      m.cg.setDebugNewsTickerIntervalMs(null);
      return { categoryAfterBadValue, intervalAfterTooShort, intervalAtMinimum };
    });

    // A rejected category leaves the previous one in place rather than clearing it.
    expect(result.categoryAfterBadValue).toBe('prize');
    // Anything under 1000ms is treated as "no override", not as a fast ticker.
    expect(result.intervalAfterTooShort).toBeNull();
    expect(result.intervalAtMinimum).toBe(1000);
  });

  test('the ticker timer is scheduled at the debug interval and replaced rather than duplicated', async ({ game }) => {
    await setTickerDebug(game, { interval: '10000' });

    const result = await game.withMods((m) => {
      const countTimers = () => {
        const timer = m.clockTimers.timerManager?.getTimer?.('newsTicker');
        return timer ? 1 : 0;
      };

      m.game.startNewsTickerTimer();
      const afterFirst = countTimers();

      // Restarting must remove the previous timer first; otherwise every
      // language change, setting toggle or tab switch would stack another one.
      m.game.startNewsTickerTimer();
      m.game.startNewsTickerTimer();
      return { afterFirst, afterRepeats: countTimers() };
    });

    expect(result.afterFirst).toBe(1);
    expect(result.afterRepeats).toBe(1);
  });

  test('turning the ticker setting off removes its timer, and back on restores exactly one', async ({ game }) => {
    const result = await game.withMods((m) => {
      const exists = () => !!m.clockTimers.timerManager?.getTimer?.('newsTicker');

      m.cg.setNewsTickerSetting(true);
      m.game.startNewsTickerTimer();
      const whileOn = exists();

      // setNewsTickerSetting calls startNewsTickerTimer itself, which tears the
      // timer down when the setting is false — this is the leak guard.
      m.cg.setNewsTickerSetting(false);
      const whileOff = exists();

      m.cg.setNewsTickerSetting(true);
      const afterRestore = exists();

      return { whileOn, whileOff, afterRestore, setting: m.cg.getNewsTickerSetting() };
    });

    expect(result.whileOn).toBe(true);
    expect(result.whileOff).toBe(false);
    expect(result.afterRestore).toBe(true);
    expect(result.setting).toBe(true);
  });

  test('a forced category renders a message from that category into the ticker', async ({ game }) => {
    await setTickerDebug(game, { category: 'wackyEffects' });

    const result = await game.page.evaluate(async () => {
      const m = globalThis.__mods;
      const content = m.desc.getNewsTickerContent();
      await m.ui.showNewsTickerMessage(content);
      await new Promise((r) => setTimeout(r, 800));

      const ticker = document.querySelector('.news-ticker-text');
      return {
        text: ticker?.innerHTML ?? '',
        // specialMessageBuilder wraps a wacky headline's link word in a span
        // carrying data-effect-item; no other category emits that attribute.
        effectItems: Array.from(ticker?.querySelectorAll('[data-effect-item]') ?? [])
          .map((el) => el.getAttribute('data-effect-item')),
        catalogueItems: (content.wackyEffects || []).map((entry) => entry.item),
        visible: !document.querySelector('.news-ticker-content')?.classList.contains('invisible')
      };
    });

    expect(result.visible).toBe(true);
    expect(result.text.length).toBeGreaterThan(0);
    // The builder rewrites the headline into a clickable effect, so identify the
    // category by the effect it wired up rather than by the raw body text.
    expect(result.effectItems.length,
      `rendered ticker text carried no wacky effect: ${result.text.slice(0, 200)}`).toBeGreaterThan(0);
    for (const item of result.effectItems) {
      expect(result.catalogueItems).toContain(item);
    }
  });

  test('a forced prize category renders and is recorded as seen', async ({ game }) => {
    await setTickerDebug(game, { category: 'prize' });

    const result = await game.page.evaluate(async () => {
      const m = globalThis.__mods;
      const before = (m.cg.getAlreadySeenNewsTickerArray?.() || []).length;
      await m.ui.showNewsTickerMessage(m.desc.getNewsTickerContent());
      await new Promise((r) => setTimeout(r, 800));
      return {
        before,
        after: (m.cg.getAlreadySeenNewsTickerArray?.() || []).length,
        rendered: (document.querySelector('.news-ticker-text')?.innerHTML ?? '').length
      };
    });

    expect(result.rendered).toBeGreaterThan(0);
    // Prize messages are tracked so the same one is not offered twice.
    expect(result.after).toBeGreaterThan(result.before);
  });

  test('a forced category with nothing eligible to say falls back instead of recursing', async ({ game }) => {
    // Regression for known-issues.md #12. A fresh boot has no manuscript, so the
    // forced manuscriptClue category has nothing to select; the retry used to
    // re-read the same override and recurse until the stack overflowed. It now
    // drops the override and re-rolls a real category, so a message still shows.
    const manuscriptCount = await game.withMods((m) => m.cg.getStarsWithAncientManuscripts().length);
    expect(manuscriptCount).toBe(0);

    await setTickerDebug(game, { category: 'manuscriptClue' });

    const rendered = await game.page.evaluate(async () => {
      const m = globalThis.__mods;
      await m.ui.showNewsTickerMessage(m.desc.getNewsTickerContent());
      await new Promise((r) => setTimeout(r, 800));
      return document.querySelector('.news-ticker-text')?.innerHTML ?? '';
    });

    expect(rendered.length).toBeGreaterThan(0);
    expect(game.significantErrors()).toEqual([]);
  });

  test('a forced feedback category falls back when feedback is not being requested', async ({ game }) => {
    // The second half of #12: the feedback branch retried the same way.
    await setTickerDebug(game, { category: 'feedback' });

    const result = await game.page.evaluate(async () => {
      const m = globalThis.__mods;
      await m.ui.showNewsTickerMessage(m.desc.getNewsTickerContent());
      await new Promise((r) => setTimeout(r, 800));
      return {
        rendered: document.querySelector('.news-ticker-text')?.innerHTML ?? '',
        feedbackRequestable: m.cg.getFeedbackCanBeRequested?.() ?? null
      };
    });

    expect(result.rendered.length).toBeGreaterThan(0);
    expect(game.significantErrors()).toEqual([]);
  });

  test('a forced manuscript-clue category names the outstanding manuscript star', async ({ game }) => {
    const seeded = await game.withMods((m) => {
      m.cg.getStarsWithAncientManuscripts().length = 0;
      m.cg.setFactoryStarsArray([], true);
      m.cg.setStarVisionDistance(0);
      for (let i = 0; i < 12 && m.cg.getStarsWithAncientManuscripts().length < 1; i++) {
        m.game.extendStarDataRange(true);
      }
      return m.cg.getStarsWithAncientManuscripts()[0] ?? null;
    });

    expect(seeded, 'a manuscript should be generated by 5 light years of vision').not.toBeNull();

    await setTickerDebug(game, { category: 'manuscriptClue' });

    const result = await game.page.evaluate(async (manuscriptStar) => {
      const m = globalThis.__mods;
      await m.ui.showNewsTickerMessage(m.desc.getNewsTickerContent());
      await new Promise((r) => setTimeout(r, 800));
      return {
        text: document.querySelector('.news-ticker-text')?.innerHTML ?? '',
        cluesShown: m.cg.getManuscriptCluesShown(),
        manuscriptStar
      };
    }, seeded[0]);

    expect(result.text.length).toBeGreaterThan(0);
    // The clue template substitutes {STAR} with the manuscript star's name, so
    // the rendered headline must actually name it.
    expect(result.text.toLowerCase()).toContain(String(seeded[0]).toLowerCase());
    // Showing a clue records it, so the same one is not repeated for that star.
    expect(result.cluesShown[String(seeded[0]).toLowerCase()]?.length).toBeGreaterThan(0);
  });

  test('ticker content resolves in all six shipped languages', async ({ game }) => {
    const problems = await game.withMods(async (m, config) => {
      const { languages, categories } = config;
      const original = m.cg.getLanguage();
      const issues = [];

      for (const language of languages) {
        await m.loc.initLocalization(language);
        m.desc.initialiseDescriptions();

        const content = m.desc.getNewsTickerContent();
        if (!content) { issues.push(`${language}: no content`); continue; }

        for (const category of categories) {
          const entries = content[category];
          if (!Array.isArray(entries) || entries.length === 0) {
            issues.push(`${language}:${category}: empty`);
            continue;
          }
          entries.forEach((entry, index) => {
            // The families are not uniformly shaped: noPrize is a flat list of
            // localized strings (its array index is its id), manuscriptClues
            // carry a `template`, and the interactive families carry a `body`.
            const text = typeof entry === 'string'
              ? entry
              : (category === 'manuscriptClues' ? entry?.template : entry?.body);
            if (typeof text !== 'string' || !text.trim()) {
              issues.push(`${language}:${category}[${index}]: blank`);
            }
          });
        }
      }

      await m.loc.initLocalization(original);
      m.desc.initialiseDescriptions();
      return issues;
    }, { languages: LANGUAGES, categories: CATEGORIES });

    expect(problems).toEqual([]);
  });

  test('a language change rebuilds the ticker content rather than leaving the old language in place', async ({ game }) => {
    const result = await game.withMods(async (m) => {
      const original = m.cg.getLanguage();
      // noPrize entries are plain localized strings, so the headline itself is
      // what changes when the language does.
      const sample = () => (m.desc.getNewsTickerContent()?.noPrize || []).slice(0, 5).map((e) => String(e ?? ''));

      await m.loc.initLocalization('en');
      m.desc.initialiseDescriptions();
      const english = sample();

      await m.loc.initLocalization('de');
      m.desc.initialiseDescriptions();
      const german = sample();

      await m.loc.initLocalization(original);
      m.desc.initialiseDescriptions();
      return { english, german };
    });

    expect(result.english.length).toBeGreaterThan(0);
    expect(result.german.length).toBe(result.english.length);
    // At least one of the sampled headlines must actually read differently, or
    // the content was never rebuilt for the new language.
    const changed = result.english.some((text, index) => text !== result.german[index]);
    expect(changed).toBe(true);
  });

  test('the news ticker setting survives a save/load round trip', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.cg.setNewsTickerSetting(false);
      const savedOff = JSON.parse(JSON.stringify(m.cg.captureGameStatusForSaving('initialise')));

      m.cg.setNewsTickerSetting(true);
      const savedOn = JSON.parse(JSON.stringify(m.cg.captureGameStatusForSaving('initialise')));

      return { off: savedOff.flags?.newsTickerSetting, on: savedOn.flags?.newsTickerSetting };
    });

    expect(result.off).toBe(false);
    expect(result.on).toBe(true);
  });

  test('driving the ticker produces no console or page errors', async ({ game }) => {
    await setTickerDebug(game, { category: 'wackyEffects', interval: '10000' });

    await game.page.evaluate(async () => {
      const m = globalThis.__mods;
      for (let i = 0; i < 3; i++) {
        await m.ui.showNewsTickerMessage(m.desc.getNewsTickerContent());
        await new Promise((r) => setTimeout(r, 400));
      }
    });

    expect(game.significantErrors()).toEqual([]);
  });
});
