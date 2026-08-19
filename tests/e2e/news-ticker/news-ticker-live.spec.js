/**
 * Area: News Ticker — the ticker left to run, and read off the screen
 * Plan: tests/docs/areas/news-ticker.md
 *
 * `news-ticker.spec.js` covers the catalogue and the timer's contract: that each
 * family has entries, that the ids the seen-tracking needs are present, that a
 * forced category with nothing to say falls back rather than recursing. Most of
 * it calls `showNewsTickerMessage()` directly.
 *
 * This file never calls it. Every message here arrives because the ticker's own
 * timer fired:
 *
 *   1. the **News Ticker** row in the debug menu (Numpad -) sets the forced
 *      category and drops the interval to ten seconds;
 *   2. the **news ticker toggle** on the Game Options pane is switched off and
 *      back on, which is what `setNewsTickerSetting` uses to rebuild the timer —
 *      the debug row only stores the values, it does not reschedule anything;
 *   3. the spec waits for a headline to scroll in and reads it off the screen.
 *
 * That distinction matters. `startNewsTickerTimer` runs on the *non-delta*
 * `timerManager`, which is a plain `setInterval` on the wall clock, so there is
 * no way to fast-forward it — a cycle costs a real ten seconds and the specs
 * here are paced accordingly.
 *
 * ## Reading the right message
 *
 * `displayNewsTickerMessage` replaces `.news-ticker-text` wholesale each time,
 * and leaves the old one on screen for the forty seconds it takes to scroll. So
 * before each cycle the current headline is stamped, and the spec waits for one
 * that has not been stamped. Nothing is cleared or faked: the element the game
 * builds is the element that gets read.
 *
 * ## The four content families, and how each is recognised
 *
 *   wackyEffects    body text rewritten with a `data-effect-item` span you click
 *   prize           a `data-prize-type` span that pays out when clicked
 *   manuscriptClues a template with {STAR} replaced by an outstanding manuscript
 *   noPrize         plain localized text, no interactive span at all
 *
 * Only the first three can be forced from the debug menu. `noPrize` is the
 * fallback the roll lands on roughly three times in four, so it is reached by
 * leaving the category unforced and cycling until it turns up.
 */
import { test, expect } from '../_harness/game-fixture.mjs';
import { openOptionRow } from '../_harness/navigation.mjs';

/** Every cycle costs a real ten seconds, and some specs run five of them. */
test.describe.configure({ timeout: 300_000 });

/** The shortest interval the debug row offers. */
const DEBUG_INTERVAL_MS = 10000;

/** How long to wait for a headline the timer has been asked to produce. */
const MESSAGE_TIMEOUT_MS = 30000;

/** The five shipped languages, in the order the debug select lists them. */
const LANGUAGES = ['en', 'es', 'pt', 'de', 'it', 'fr'];

// --------------------------------------------------------------------- helpers

/** Set the forced category and interval through the debug menu's own controls. */
async function setTickerDebug(game, { category = '', interval = String(DEBUG_INTERVAL_MS) } = {}) {
  await game.debugSelect('debugNewsTickerCategorySelect', category);
  await game.debugSelect('debugNewsTickerIntervalSelect', interval);
  await game.debugClick('setNewsTickerDebugButton');
  await game.page.waitForTimeout(250);
}

/** Open the Game Options pane, where the news ticker toggle lives. */
async function openGameOptions(game) {
  await game.openTab(9);
  const opened = await openOptionRow(game, 9, 'tab9.option3');
  if (!opened) throw new Error('The Game Options row is not on the settings menu');
}

/**
 * Rebuild the ticker's timer by switching the setting off and on again.
 *
 * This is the only control a player has that reschedules the ticker, and it is
 * the reason the debug interval takes effect at all: `setNewsTickerDebugButton`
 * stores the override but leaves the running timer alone, while
 * `setNewsTickerSetting` tears the timer down and starts a fresh one that reads
 * the override.
 */
async function rescheduleTicker(game) {
  await openGameOptions(game);
  const label = game.page.locator('label[for="newsTickerSettingToggle"]');
  await label.click();
  await game.page.waitForTimeout(400);
  await label.click();
  await game.page.waitForTimeout(400);

  const state = await game.withMods((m) => ({
    setting: m.cg.getNewsTickerSetting(),
    scheduled: Boolean(m.clockTimers.timerManager?.getTimer?.('newsTicker'))
  }));
  expect(state.setting, 'the toggle should be back on').toBe(true);
  expect(state.scheduled, 'switching the setting back on should schedule a ticker').toBe(true);
}

/** Stamp whatever is on the ticker now, so the next headline can be told apart. */
async function stampCurrentHeadline(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.news-ticker-text').forEach((el) => { el.dataset.specSeen = 'true'; });
  });
}

/** Wait for the ticker to produce a headline that has not been read yet. */
async function nextHeadline(page, timeout = MESSAGE_TIMEOUT_MS) {
  await page.waitForSelector('.news-ticker-text:not([data-spec-seen])', { timeout });
  return page.evaluate(() => {
    const el = document.querySelector('.news-ticker-text:not([data-spec-seen])');
    const prize = el.querySelector('#prizeTickerSpan');
    return {
      html: el.innerHTML,
      text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
      visible: !document.querySelector('.news-ticker-content')?.classList.contains('invisible'),
      effectItem: prize?.getAttribute('data-effect-item') ?? null,
      prizeType: prize?.getAttribute('data-prize-type') ?? null,
      prizeCategory: prize?.getAttribute('data-category') ?? null,
      prizeItem: prize?.getAttribute('data-item') ?? null,
      prizeAmount: prize?.getAttribute('data-data1') ?? null,
      oneOffId: prize?.getAttribute('data-oneoff-id') ?? null
    };
  });
}

/** Force a category, reschedule the timer, and read the headline it produces. */
async function runTickerCycle(game, { category = '' } = {}) {
  await stampCurrentHeadline(game.page);
  await setTickerDebug(game, { category });
  await rescheduleTicker(game);
  return nextHeadline(game.page);
}

/** Strip markup and collapse whitespace, for quoting a headline in a failure. */
function normalise(value) {
  return String(value ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * The key a headline is matched against its catalogue entry by.
 *
 * `specialMessageBuilder` splices a multi-line `<span>` around the headline's
 * link word, so the rendered `textContent` carries whitespace the catalogue
 * entry does not — the Spanish wacky line reads "¡ Boo!" on screen and "¡Boo!"
 * in `descriptions.js`. That whitespace is a product of the wrapper's markup,
 * not of the content, so it comes out of the comparison entirely. Every other
 * character still has to match.
 */
function compareKey(value) {
  return normalise(value).replace(/\s+/g, '').toLowerCase();
}

/** The live ticker catalogue, in whatever language the game is currently in. */
async function tickerCatalogue(game) {
  return game.withMods((m) => {
    const content = m.desc.getNewsTickerContent() || {};
    return {
      wackyBodies: (content.wackyEffects || []).map((entry) => entry?.body ?? ''),
      noPrize: (content.noPrize || []).map((entry) => String(entry ?? '')),
      clueTemplates: (content.manuscriptClues || []).map((entry) => entry?.template ?? '')
    };
  });
}

/** A run with every resource visible, which is what the prize builder requires. */
async function stageVisibleResources(game) {
  await game.prepareRunForStarshipLaunch();
  await game.debugClick('give1MAllResourcesAndCompounds');
  await game.page.waitForTimeout(800);
}

// -------------------------------------------------------------- the timer runs

test.describe('News Ticker — the ticker running on its own', () => {
  test('the ticker fires by itself at the debug interval and scrolls a headline', async ({ game, page }) => {
    await game.boot();

    const before = await game.withMods((m) => ({
      interval: m.cg.getDebugNewsTickerIntervalMs(),
      scheduled: Boolean(m.clockTimers.timerManager?.getTimer?.('newsTicker'))
    }));
    // A fresh run schedules its own ticker at a random 20–35 seconds.
    expect(before.interval, 'nothing has been overridden yet').toBeNull();
    expect(before.scheduled, 'the ticker is running from boot').toBe(true);

    await stampCurrentHeadline(page);
    await setTickerDebug(game, {});
    expect(await game.withMods((m) => m.cg.getDebugNewsTickerIntervalMs())).toBe(DEBUG_INTERVAL_MS);

    const started = Date.now();
    await rescheduleTicker(game);
    const headline = await nextHeadline(page);
    const elapsed = Date.now() - started;

    expect(headline.text.length, 'the ticker should have something to say').toBeGreaterThan(0);
    expect(headline.visible, 'the ticker content must be on screen while it scrolls').toBe(true);
    // The point of the override is that it is honoured: a headline arriving in
    // well under the shipped 20-second floor can only have come from it.
    expect(elapsed, 'the ten-second override should be what fired').toBeLessThan(19000);
    expect(game.significantErrors()).toEqual([]);
  });

  test('turning the ticker off through Settings stops it, and turning it back on restarts it', async ({ game, page }) => {
    await game.boot();
    await setTickerDebug(game, {});
    await openGameOptions(game);

    const label = page.locator('label[for="newsTickerSettingToggle"]');
    await label.click();
    await page.waitForTimeout(600);

    const off = await game.withMods((m) => ({
      setting: m.cg.getNewsTickerSetting(),
      scheduled: Boolean(m.clockTimers.timerManager?.getTimer?.('newsTicker')),
      containerHidden: document.getElementById('newsTickerContainer')?.classList.contains('invisible')
    }));
    expect(off.setting).toBe(false);
    expect(off.scheduled, 'switching it off must remove the timer, not just hide the bar').toBe(false);
    expect(off.containerHidden, 'the bar comes off the screen too').toBe(true);

    // Nothing may arrive while it is off, over more than a full debug interval.
    await stampCurrentHeadline(page);
    await page.waitForTimeout(DEBUG_INTERVAL_MS + 4000);
    const appeared = await page.locator('.news-ticker-text:not([data-spec-seen])').count();
    expect(appeared, 'a switched-off ticker must stay silent').toBe(0);

    await label.click();
    await page.waitForTimeout(600);
    const on = await game.withMods((m) => ({
      setting: m.cg.getNewsTickerSetting(),
      scheduled: Boolean(m.clockTimers.timerManager?.getTimer?.('newsTicker')),
      containerHidden: document.getElementById('newsTickerContainer')?.classList.contains('invisible')
    }));
    expect(on.setting).toBe(true);
    expect(on.scheduled, 'and exactly one timer comes back').toBe(true);
    expect(on.containerHidden).toBe(false);

    const headline = await nextHeadline(page);
    expect(headline.text.length).toBeGreaterThan(0);
  });
});

// ------------------------------------------------------------ the four families

test.describe('News Ticker — what the families put on screen', () => {
  test('a forced wacky headline arrives with a clickable effect, and clicking it does something', async ({ game, page }) => {
    await game.boot();

    const headline = await runTickerCycle(game, { category: 'wackyEffects' });

    expect(headline.effectItem, `no wacky effect in "${headline.text.slice(0, 120)}"`).not.toBeNull();
    const catalogue = await tickerCatalogue(game);
    expect(catalogue.wackyBodies.map(compareKey),
      `"${normalise(headline.text)}" is not one of the wacky bodies`)
      .toContain(compareKey(headline.text));

    // The effect is the whole point of the family: the word is clickable and
    // starts an animation on the ticker rather than being decoration.
    const before = await page.evaluate(() => {
      const span = document.getElementById('prizeTickerSpan');
      return {
        classes: span.className,
        opacity: span.style.opacity,
        parentAnimation: span.parentElement?.style.animation ?? '',
        grandparentAnimation: span.parentElement?.parentElement?.style.animation ?? ''
      };
    });

    await page.evaluate(() => document.getElementById('prizeTickerSpan').click());
    await page.waitForTimeout(400);

    const after = await page.evaluate(() => {
      const span = document.getElementById('prizeTickerSpan');
      return {
        classes: span.className,
        opacity: span.style.opacity,
        parentAnimation: span.parentElement?.style.animation ?? '',
        grandparentAnimation: span.parentElement?.parentElement?.style.animation ?? ''
      };
    });

    // Which effect fires is random, and each one reaches for a different target,
    // so the assertion is that *something* on the ticker changed rather than
    // which particular animation was added.
    const changed = Object.keys(after).some((key) => after[key] !== before[key]);
    expect(changed, `clicking the "${headline.effectItem}" effect changed nothing: ${JSON.stringify(after)}`).toBe(true);
    expect(game.significantErrors()).toEqual([]);
  });

  test('a forced prize can be collected off the ticker, and the collection is recorded', async ({ game, page }) => {
    await game.boot();
    await stageVisibleResources(game);

    // A prize is only offered when the resource it gifts has room for it, and
    // the debug scenario fills every store to its cap. Selling the lot through
    // the real Sell All button is how a player makes room — and it leaves the
    // resource rows on screen, which the prize builder also requires.
    await game.openTab(1);
    await page.evaluate(() => document.getElementById('sellAllResourcesButton')?.click());
    await page.waitForTimeout(800);

    const headline = await runTickerCycle(game, { category: 'prize' });

    expect(headline.prizeType, `no prize offered in "${headline.text.slice(0, 120)}"`).toBe('giftResource');
    expect(headline.prizeItem).toBeTruthy();
    expect(Number(headline.prizeAmount), 'a prize worth collecting').toBeGreaterThan(0);

    const before = await game.withMods((m, prize) => ({
      quantity: m.rdo.getResourceDataObject(prize.category, [prize.item, 'quantity']),
      collected: m.cg.statFunctionsGets.stat_newsTickerPrizesCollected()
    }), { category: headline.prizeCategory, item: headline.prizeItem });

    await page.evaluate(() => document.getElementById('prizeTickerSpan').click());
    await page.waitForTimeout(600);

    const after = await game.withMods((m, prize) => ({
      quantity: m.rdo.getResourceDataObject(prize.category, [prize.item, 'quantity']),
      collected: m.cg.statFunctionsGets.stat_newsTickerPrizesCollected()
    }), { category: headline.prizeCategory, item: headline.prizeItem });

    expect(after.collected - before.collected, 'collecting a prize is counted once').toBe(1);
    // Production is also running, so the gift is a floor rather than an exact
    // delta — but it has to be at least the amount the ticker promised.
    expect(after.quantity - before.quantity,
      `the ticker promised ${headline.prizeAmount} ${headline.prizeItem}`)
      .toBeGreaterThanOrEqual(Number(headline.prizeAmount));

    // A claimed prize cannot be claimed twice.
    await page.evaluate(() => document.getElementById('prizeTickerSpan').click());
    await page.waitForTimeout(400);
    const afterSecondClick = await game.withMods((m) => m.cg.statFunctionsGets.stat_newsTickerPrizesCollected());
    expect(afterSecondClick, 'clicking a claimed prize again pays nothing').toBe(after.collected);
  });

  test('left unforced, the ticker falls to a no-prize headline and records it as seen', async ({ game }) => {
    await game.boot();

    // noPrize is the roll's fallback — it takes everything past 0.28, so a
    // little over seven spins in ten. There is no debug override for it, which
    // is exactly why it is reached by cycling rather than by forcing.
    const catalogue = await tickerCatalogue(game);
    const noPrizeTexts = catalogue.noPrize.map(compareKey);
    expect(noPrizeTexts.length, 'the no-prize family should be the deepest pool').toBeGreaterThan(0);

    const seenBefore = await game.withMods((m) => (m.cg.getAlreadySeenNewsTickerArray() || []).length);
    const headlines = [];
    let noPrizeHeadline = null;

    for (let attempt = 0; attempt < 6 && !noPrizeHeadline; attempt++) {
      const headline = await runTickerCycle(game, { category: '' });
      headlines.push(headline.text.slice(0, 60));
      // A no-prize headline is plain text: no effect span, no prize span.
      if (!headline.effectItem && !headline.prizeType && !headline.oneOffId) {
        noPrizeHeadline = headline;
      }
    }

    expect(noPrizeHeadline,
      `six unforced spins produced no plain headline: ${headlines.join(' | ')}`).not.toBeNull();
    expect(noPrizeTexts, 'a plain headline must come from the no-prize catalogue')
      .toContain(compareKey(noPrizeHeadline.text));

    const seenAfter = await game.withMods((m) => (m.cg.getAlreadySeenNewsTickerArray() || []).length);
    // Every family records what it showed, so the unique-tickers statistic can
    // count it and the same line is not offered twice.
    expect(seenAfter, 'showing headlines has to grow the seen list').toBeGreaterThan(seenBefore);
  });
});

// ---------------------------------------------------------- manuscript clues

test.describe('News Ticker — manuscript clues', () => {
  /**
   * Survey stars until the game hands out an ancient manuscript.
   *
   * The **Study a Star** debug button is the real thing: it calls the same
   * `extendStarDataRange` a completed telescope study calls, and the first
   * manuscript is guaranteed once star vision passes five light years.
   */
  async function surveyUntilManuscript(game) {
    for (let i = 0; i < 20; i++) {
      await game.debugClick('addStarButton');
      const manuscripts = await game.withMods((m) => m.cg.getStarsWithAncientManuscripts());
      if (manuscripts.length > 0) return manuscripts[0];
    }
    return null;
  }

  test('a forced clue names the outstanding manuscript star and is not repeated', async ({ game }) => {
    await game.boot();
    const manuscript = await surveyUntilManuscript(game);

    expect(manuscript, 'surveying should turn up a manuscript within twenty studies').not.toBeNull();
    const starName = String(manuscript[0]);

    const first = await runTickerCycle(game, { category: 'manuscriptClue' });
    expect(first.text.toLowerCase(),
      `the clue should name ${starName}: "${first.text}"`).toContain(starName.toLowerCase());

    const catalogue = await tickerCatalogue(game);
    const asTemplate = (text) => catalogue.clueTemplates.some((template) =>
      compareKey(template.replace('{STAR}', starName)) === compareKey(text));
    expect(asTemplate(first.text),
      `"${normalise(first.text)}" is not one of this language's clue templates`).toBe(true);

    const shownAfterFirst = await game.withMods((m, star) =>
      (m.cg.getManuscriptCluesShown() ?? {})[star.toLowerCase()] ?? [], starName);
    expect(shownAfterFirst.length, 'showing a clue records which template was used').toBe(1);

    // A second clue for the same star must pick a template it has not used.
    const second = await runTickerCycle(game, { category: 'manuscriptClue' });
    expect(second.text.toLowerCase()).toContain(starName.toLowerCase());
    expect(compareKey(second.text), 'the same clue must not be told twice')
      .not.toBe(compareKey(first.text));

    const shownAfterSecond = await game.withMods((m, star) =>
      (m.cg.getManuscriptCluesShown() ?? {})[star.toLowerCase()] ?? [], starName);
    expect(shownAfterSecond.length).toBe(2);
    expect(new Set(shownAfterSecond).size, 'two different templates were used').toBe(2);
    expect(game.significantErrors()).toEqual([]);
  });
});

// ------------------------------------------------------------------ languages

test.describe('News Ticker — the language the ticker speaks', () => {
  /** Change the game's language through the debug menu's own Set button. */
  async function setLanguage(game, language) {
    await game.debugSelect('debugLanguageSelect', language);
    await game.debugClick('debugSetLanguageButton');
    await game.page.waitForTimeout(900);
    const applied = await game.withMods((m) => m.cg.getLanguage());
    expect(applied, `the debug menu should have switched to ${language}`).toBe(language);
  }

  test('a wacky headline arrives in whichever of the five languages the game is set to', async ({ game }) => {
    await game.boot();

    const rendered = {};
    for (const language of LANGUAGES) {
      await setLanguage(game, language);

      const headline = await runTickerCycle(game, { category: 'wackyEffects' });
      const catalogue = await tickerCatalogue(game);

      expect(headline.text.length, `${language}: the ticker said nothing`).toBeGreaterThan(0);
      // This is the assertion that proves the change reached the ticker: if the
      // catalogue had not been rebuilt, an English headline would be on screen
      // and it would not be in the German or Italian catalogue.
      expect(catalogue.wackyBodies.map(compareKey),
        `${language}: "${normalise(headline.text)}" is not in that language's wacky catalogue`)
        .toContain(compareKey(headline.text));

      rendered[language] = compareKey(headline.text);
    }

    // And the five are not all the same string, which would mean the catalogue
    // is one language wearing five labels.
    expect(new Set(Object.values(rendered)).size,
      `every language produced the same headline: ${JSON.stringify(rendered)}`).toBeGreaterThan(1);
    expect(game.significantErrors()).toEqual([]);
  });

  test('a manuscript clue is told in the current language and still names its star', async ({ game }) => {
    await game.boot();

    // One manuscript, so the clue always points at the same star whatever the
    // language — the star's name is data, not translated text.
    let manuscript = null;
    for (let i = 0; i < 20 && !manuscript; i++) {
      await game.debugClick('addStarButton');
      const manuscripts = await game.withMods((m) => m.cg.getStarsWithAncientManuscripts());
      manuscript = manuscripts[0] ?? null;
    }
    expect(manuscript, 'surveying should turn up a manuscript').not.toBeNull();
    const starName = String(manuscript[0]);

    for (const language of ['de', 'fr']) {
      await setLanguage(game, language);
      const headline = await runTickerCycle(game, { category: 'manuscriptClue' });
      const catalogue = await tickerCatalogue(game);

      expect(headline.text.toLowerCase(),
        `${language}: the clue should still name ${starName}`).toContain(starName.toLowerCase());

      const matchesATemplate = catalogue.clueTemplates.some((template) =>
        compareKey(template.replace('{STAR}', starName)) === compareKey(headline.text));
      expect(matchesATemplate,
        `${language}: "${normalise(headline.text)}" is not one of that language's clue templates`).toBe(true);
    }
  });
});
