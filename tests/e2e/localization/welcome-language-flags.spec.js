/**
 * Area: Localization
 * Plan: tests/docs/areas/localization.md
 * Feature status: docs/localization/status.md (item 11)
 *
 * The five-flag language selector on the welcome modal — the row of flags above
 * the pioneer-name field that lets a new player choose their language before the
 * game starts.
 *
 * These specs never touch `relocalizeAll` or `initLocalization`: the whole point
 * of the feature is the wiring between a real click on a real flag, the deferred
 * commit at confirm time, and the language the game then boots in. Every spec
 * therefore drives the modal the way a player does — click flags, type a name,
 * press the button — and only reads state back through the modules.
 *
 * The bar's contract, as specified:
 *   - five flags (en, es, de, it, fr) drawn from images/flags/<code>.png,
 *   - laid out as nine grid columns, four of which are spacers,
 *   - over two rows, the second carrying the language code centred under its flag,
 *   - the whole run 40% of the width of the modal, each flag 50px tall,
 *   - clicking is free and repeatable; the language is applied exactly once, on confirm.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

const STORAGE_KEY = 'cosmicForgeLanguage';
const CODES = ['en', 'es', 'pt', 'de', 'it', 'fr'];

// The bar's authored geometry, kept here so a deliberate retune is one edit in the
// spec rather than a hunt through assertions: the nine columns together occupy this
// share of the modal's content width, and each flag is this tall.
const BAR_WIDTH_FRACTION = 0.4;
const FLAG_HEIGHT_PX = 50;

/** Header of the welcome modal in each language — the proof a choice landed. */
const INTRO_HEADER = {
  en: 'Welcome to the Cosmic Forge!',
  es: '¡Bienvenido a la Fragua Cósmica!',
  de: 'Willkommen in der Kosmischen Schmiede!',
  it: 'Benvenuto nella Forgia Cosmica!',
  fr: 'Bienvenue à la Forge Cosmique!'
};

/** A statically-authored label that rides the `data-loc` sweep on the same modal. */
const FULLSCREEN_LABEL = {
  de: 'Spiel im Vollbild starten'
};

/** The first side-menu entry, once the game itself is up. */
const HYDROGEN = { en: 'Hydrogen', de: 'Wasserstoff', fr: 'Hydrogène' };

/**
 * Navigate and stop on the welcome modal, before any choice has been made.
 *
 * `game.boot()` clicks straight through this modal, which is the one screen
 * these specs are about, so they drive the sequence by hand instead.
 */
async function openWelcomeModal(page, { storedLanguage = null } = {}) {
  if (storedLanguage) {
    await page.addInitScript(
      ([key, val]) => {
        try { window.localStorage.setItem(key, val); } catch { /* storage blocked */ }
      },
      [STORAGE_KEY, storedLanguage]
    );
  }
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#languageFlagBar', { timeout: 60000 });
  await page.waitForSelector('#pioneerCodeName', { timeout: 60000 });
}

/** Click one flag, exactly as a player would. */
async function clickFlag(page, code) {
  await page.click(`.language-flag-cell[data-language="${code}"]`);
}

/** Which flag is currently showing as chosen, by code. */
async function selectedFlag(page) {
  return page.evaluate(() =>
    document.querySelector('.language-flag-cell.language-flag-selected')?.dataset.language ?? null);
}

/** The language the game is actually running in. */
async function activeLanguage(page) {
  return page.evaluate(async () => (await import('/constantsAndGlobalVars.js')).getLanguage());
}

/** Fill in the pioneer name and confirm, which is what commits the flag choice. */
async function confirmPioneerName(page, pioneer) {
  await page.fill('#pioneerCodeName', pioneer);
  await page.click('#modalConfirm');
  await page.waitForSelector('#fullScreenCheckBox', { state: 'visible', timeout: 60000 });
}

function pioneerName() {
  return `Test1981_flags_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

test.describe('Localization — welcome-modal language flags', () => {
  test.describe('the bar as drawn', () => {
    test.beforeEach(async ({ page }) => {
      await openWelcomeModal(page);
    });

    test('the bar sits above the pioneer-name field and offers all five languages', async ({ page }) => {
      const layout = await page.evaluate(() => {
        const bar = document.getElementById('languageFlagBar');
        const field = document.getElementById('pioneerCodeName');
        return {
          codes: Array.from(bar.querySelectorAll('[data-language]')).map((el) => el.dataset.language),
          labels: Array.from(bar.querySelectorAll('[data-language-label]')).map((el) => ({
            code: el.dataset.languageLabel,
            text: el.textContent.trim()
          })),
          barBottom: bar.getBoundingClientRect().bottom,
          fieldTop: field.getBoundingClientRect().top
        };
      });

      expect(layout.codes).toEqual(CODES);
      // The second row is the code, lower-cased, under the flag it belongs to.
      expect(layout.labels).toEqual(CODES.map((code) => ({ code, text: code })));
      expect(layout.barBottom).toBeLessThanOrEqual(layout.fieldTop);
    });

    test('each flag renders its own image file, and every one of them loads', async ({ page }) => {
      // A missing PNG shows as an empty box rather than an error, so the decoded
      // width is the only thing that distinguishes a drawn flag from a hole.
      const images = await page.evaluate(() =>
        Array.from(document.querySelectorAll('.language-flag-cell')).map((cell) => ({
          code: cell.dataset.language,
          src: cell.querySelector('img')?.getAttribute('src'),
          loaded: (cell.querySelector('img')?.naturalWidth ?? 0) > 0
        })));

      expect(images.map((i) => i.src)).toEqual(CODES.map((c) => `images/flags/${c}.png`));
      expect(images.filter((i) => !i.loaded)).toEqual([]);
    });

    test('the bar is nine columns over two rows, four of the columns spacers', async ({ page }) => {
      const grid = await page.evaluate(() => {
        const bar = document.getElementById('languageFlagBar');
        const style = getComputedStyle(bar);
        return {
          display: style.display,
          columns: style.gridTemplateColumns.split(/\s+/).filter(Boolean).length,
          rows: style.gridTemplateRows.split(/\s+/).filter(Boolean).length,
          flags: bar.querySelectorAll('.language-flag-cell').length,
          labels: bar.querySelectorAll('.language-flag-label').length,
          spacers: bar.querySelectorAll('.language-flag-spacer').length,
          children: bar.children.length
        };
      });

      expect(grid.display).toBe('grid');
      expect(grid.columns).toBe(9);
      expect(grid.rows).toBe(2);
      // Nine cells per row: five of content and four spacers between them.
      expect(grid.flags).toBe(5);
      expect(grid.labels).toBe(5);
      expect(grid.spacers).toBe(8);
      expect(grid.children).toBe(18);
    });

    test('flag, gap, flag … spans 40% of the modal, and each flag is 50px tall', async ({ page }) => {
      const measured = await page.evaluate(() => {
        const bar = document.getElementById('languageFlagBar');
        const cells = Array.from(bar.querySelectorAll('.language-flag-cell'));
        const rects = cells.map((c) => c.getBoundingClientRect());
        const barRect = bar.getBoundingClientRect();
        const parent = bar.parentElement;
        const parentStyle = getComputedStyle(parent);
        const parentContentWidth = parent.getBoundingClientRect().width
          - parseFloat(parentStyle.paddingLeft) - parseFloat(parentStyle.paddingRight);
        return {
          barWidth: barRect.width,
          parentContentWidth,
          // The measured run is the first flag's left edge to the last flag's right
          // edge: exactly flag + gap + flag + gap + flag + gap + flag + gap + flag.
          runWidth: rects[rects.length - 1].right - rects[0].left,
          heights: rects.map((r) => Math.round(r.height)),
          // The image must fill its cell's *content* box: the cell is border-box
          // 50px with a 2px selection border, so a flag that fills it is 46px tall
          // and the numbers only line up if the stretch is real.
          imageBoxes: cells.map((c) => {
            const img = c.querySelector('img').getBoundingClientRect();
            return {
              gapX: +(c.clientWidth - img.width).toFixed(2),
              gapY: +(c.clientHeight - img.height).toFixed(2)
            };
          })
        };
      });

      expect(measured.barWidth).toBeCloseTo(measured.parentContentWidth * BAR_WIDTH_FRACTION, 0);
      // No leftover: the nine columns tile the whole width they were given.
      expect(measured.runWidth).toBeCloseTo(measured.barWidth, 0);
      expect(measured.heights).toEqual(Array(5).fill(FLAG_HEIGHT_PX));
      // The flags stretch to their holding container rather than letterboxing:
      // no slack in either axis, whatever the source image's aspect ratio is.
      for (const box of measured.imageBoxes) {
        expect(Math.abs(box.gapX)).toBeLessThanOrEqual(0.5);
        expect(Math.abs(box.gapY)).toBeLessThanOrEqual(0.5);
      }
    });

    test('each language code is centred under the flag it belongs to, on the row below', async ({ page }) => {
      const pairs = await page.evaluate(() =>
        Array.from(document.querySelectorAll('.language-flag-cell')).map((cell) => {
          const label = document.querySelector(
            `.language-flag-label[data-language-label="${cell.dataset.language}"]`);
          const c = cell.getBoundingClientRect();
          const l = label.getBoundingClientRect();
          return {
            code: cell.dataset.language,
            centreOffset: Math.abs((c.left + c.width / 2) - (l.left + l.width / 2)),
            belowFlag: l.top >= c.bottom - 1
          };
        }));

      for (const pair of pairs) {
        expect(pair.centreOffset, `${pair.code} label is not centred under its flag`).toBeLessThanOrEqual(1);
        expect(pair.belowFlag, `${pair.code} label is not on the second row`).toBe(true);
      }
    });
  });

  test.describe('choosing, but not yet applying', () => {
    test('English is the default choice on a first-ever boot', async ({ page }) => {
      await openWelcomeModal(page);

      expect(await selectedFlag(page)).toBe('en');
      expect(await activeLanguage(page)).toBe('en');
      expect((await page.textContent('.modal-header h4')).trim()).toBe(INTRO_HEADER.en);
    });

    test('the player can click every flag, and only the last one stays chosen', async ({ page }) => {
      await openWelcomeModal(page);

      const seen = [];
      for (const code of ['es', 'pt', 'de', 'it', 'fr', 'en', 'de']) {
        await clickFlag(page, code);
        seen.push(await selectedFlag(page));
        // Exactly one flag is ever marked, so a mis-wired handler that adds
        // without removing is caught here rather than by eye.
        expect(await page.locator('.language-flag-cell.language-flag-selected').count()).toBe(1);
      }

      expect(seen).toEqual(['es', 'pt', 'de', 'it', 'fr', 'en', 'de']);
    });

    test('clicking flags does not change the language until the modal is confirmed', async ({ page }) => {
      await openWelcomeModal(page);

      await clickFlag(page, 'de');
      await clickFlag(page, 'fr');

      // This is the whole design: the language is set once, at confirm time, so
      // the modal must still be reading English while the player deliberates.
      expect(await activeLanguage(page)).toBe('en');
      expect((await page.textContent('.modal-header h4')).trim()).toBe(INTRO_HEADER.en);
      expect(await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY)).not.toBe('fr');
    });
  });

  test.describe('applying the choice on confirm', () => {
    for (const code of CODES) {
      test(`confirming after choosing ${code} starts the game in ${code}`, async ({ page }) => {
        await openWelcomeModal(page);
        await clickFlag(page, code);
        await confirmPioneerName(page, pioneerName());

        expect(await activeLanguage(page)).toBe(code);
        // The intro modal that follows is drawn from the freshly chosen language,
        // header included — the header used to be snapshotted before the choice.
        expect((await page.textContent('.modal-header h4')).trim()).toBe(INTRO_HEADER[code]);
        expect(await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY)).toBe(code);
      });
    }

    test('confirming without touching the flags leaves the game in English', async ({ page }) => {
      await openWelcomeModal(page);
      await confirmPioneerName(page, pioneerName());

      expect(await activeLanguage(page)).toBe('en');
      expect((await page.textContent('.modal-header h4')).trim()).toBe(INTRO_HEADER.en);
    });

    test('the choice reaches the static shell, not just the modal text', async ({ page }) => {
      await openWelcomeModal(page);
      await clickFlag(page, 'de');
      await confirmPioneerName(page, pioneerName());

      // The full-screen label is a `data-loc` element on this same modal, so it
      // only follows if the static-label sweep was re-run for the new language.
      expect((await page.textContent('.fullScreenLabel')).trim()).toBe(FULLSCREEN_LABEL.de);
      expect((await page.textContent('#hydrogenOption')).trim()).toBe(HYDROGEN.de);
    });

    test('the chosen language carries through into the running game and the onboarding prompt', async ({ page }) => {
      await openWelcomeModal(page);
      await clickFlag(page, 'fr');
      await confirmPioneerName(page, pioneerName());

      await page.click('#modalConfirm');
      await page.waitForSelector('#tab1', { timeout: 60000 });

      // A brand new game offers the tutorial; its decline button is the first
      // piece of post-boot text a player sees, and it must be in their language.
      const cancel = page.locator('#modalCancel');
      const prompted = await cancel
        .waitFor({ state: 'visible', timeout: 15000 })
        .then(() => true)
        .catch(() => false);
      expect(prompted, 'the onboarding prompt did not appear for a new game').toBe(true);
      expect((await cancel.textContent()).trim().toUpperCase()).toBe('NON');

      await page.click('#modalCancel');

      expect(await activeLanguage(page)).toBe('fr');
      expect((await page.textContent('#hydrogenOption')).trim()).toBe(HYDROGEN.fr);
    });
  });

  test.describe('a returning player', () => {
    test('the bar opens on the stored language rather than resetting to English', async ({ page }) => {
      await openWelcomeModal(page, { storedLanguage: 'it' });

      // The selector must show what the game actually resolved, otherwise a
      // returning Italian player is silently reset by confirming the modal.
      expect(await selectedFlag(page)).toBe('it');
      expect(await activeLanguage(page)).toBe('it');
      expect((await page.textContent('.modal-header h4')).trim()).toBe(INTRO_HEADER.it);
    });

    test('confirming without touching the flags keeps the stored language', async ({ page }) => {
      await openWelcomeModal(page, { storedLanguage: 'it' });
      await confirmPioneerName(page, pioneerName());

      expect(await activeLanguage(page)).toBe('it');
      expect(await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY)).toBe('it');
    });

    test('a stored language can still be overridden from the flags', async ({ page }) => {
      await openWelcomeModal(page, { storedLanguage: 'it' });
      await clickFlag(page, 'es');
      await confirmPioneerName(page, pioneerName());

      expect(await activeLanguage(page)).toBe('es');
      expect(await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY)).toBe('es');
    });
  });
});
