/**
 * Area: Localization
 * Plan: tests/docs/areas/localization.md
 * Feature status: docs/localization/status.md (item 1)
 *
 * The resolution chain — explicit request > stored preference > browser/OS
 * locale > English — and its persistence across a full restart.
 *
 * Browser locale is set through Playwright's real context `locale` option rather
 * than by monkey-patching `navigator`, so these specs exercise the same
 * `navigator.languages` the shipped game reads on a player's machine.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

const STORAGE_KEY = 'cosmicForgeLanguage';
const SUPPORTED = ['en', 'es', 'pt', 'de', 'it', 'fr'];

/** Seed a stored language preference before any page script runs. */
async function seedStoredLanguage(page, value) {
  await page.addInitScript(
    ([key, val]) => {
      try {
        window.localStorage.setItem(key, val);
      } catch {
        /* the spec that breaks localStorage on purpose expects this to fail */
      }
    },
    [STORAGE_KEY, value]
  );
}

test.describe('Localization — language resolution', () => {
  test.describe('module contract', () => {
    test.beforeEach(async ({ game }) => {
      await game.boot();
    });

    test('the supported-language list is exactly the five shipped languages', async ({ game }) => {
      const supported = await game.withMods((m) => m.loc.getSupportedLanguages());
      expect([...supported].sort()).toEqual([...SUPPORTED].sort());
    });

    test('getSupportedLanguages hands back a copy, not the live array', async ({ game }) => {
      // A caller mutating the returned array must not be able to add or remove a
      // language from the game's own validation set.
      const stillIntact = await game.withMods((m) => {
        const first = m.loc.getSupportedLanguages();
        first.push('xx');
        first.length = 1;
        return m.loc.getSupportedLanguages();
      });
      expect([...stillIntact].sort()).toEqual([...SUPPORTED].sort());
    });

    test('the default language is English, not the historical Spanish default', async ({ game }) => {
      // The game shipped with `let language = 'es'` and no persistence. That is
      // the exact regression this constant guards.
      const dflt = await game.withMods((m) => m.loc.DEFAULT_LANGUAGE);
      expect(dflt).toBe('en');
    });

    test('the storage key is stable', async ({ game }) => {
      // Changing it silently orphans every existing player's saved preference.
      const key = await game.withMods((m) => m.loc.LANGUAGE_STORAGE_KEY);
      expect(key).toBe(STORAGE_KEY);
    });

    test('isSupportedLanguage accepts tags case-insensitively and rejects junk', async ({ game }) => {
      const verdicts = await game.withMods((m) => ({
        en: m.loc.isSupportedLanguage('en'),
        upper: m.loc.isSupportedLanguage('DE'),
        padded: m.loc.isSupportedLanguage('  fr  '),
        // isSupportedLanguage matches whole tags only — normalisation of
        // 'fr-CA' happens inside resolution, not here.
        regional: m.loc.isSupportedLanguage('fr-CA'),
        unsupported: m.loc.isSupportedLanguage('ja'),
        empty: m.loc.isSupportedLanguage(''),
        nullish: m.loc.isSupportedLanguage(null),
        numeric: m.loc.isSupportedLanguage(42),
        object: m.loc.isSupportedLanguage({ toString: () => 'en' })
      }));

      expect(verdicts.en).toBe(true);
      expect(verdicts.upper).toBe(true);
      expect(verdicts.padded).toBe(true);
      expect(verdicts.regional).toBe(false);
      expect(verdicts.unsupported).toBe(false);
      expect(verdicts.empty).toBe(false);
      expect(verdicts.nullish).toBe(false);
      expect(verdicts.numeric).toBe(false);
      expect(verdicts.object).toBe(false);
    });

    test('persistLanguage normalises what it stores and refuses what it cannot', async ({ game }) => {
      const results = await game.withMods((m, key) => {
        const out = {};

        out.regional = m.loc.persistLanguage('fr-CA');
        out.regionalStored = localStorage.getItem(key);

        out.upper = m.loc.persistLanguage('DE');
        out.upperStored = localStorage.getItem(key);

        out.rejected = m.loc.persistLanguage('klingon');
        out.rejectedStored = localStorage.getItem(key);

        out.nullish = m.loc.persistLanguage(null);
        return out;
      }, STORAGE_KEY);

      // A regional tag is stored as its primary subtag, so the stored value is
      // always something resolveLanguage can consume on the next boot.
      expect(results.regional).toBe(true);
      expect(results.regionalStored).toBe('fr');

      expect(results.upper).toBe(true);
      expect(results.upperStored).toBe('de');

      // A rejected value must leave the previous good value untouched.
      expect(results.rejected).toBe(false);
      expect(results.rejectedStored).toBe('de');
      expect(results.nullish).toBe(false);
    });

    test('an explicit request beats a stored preference', async ({ game }) => {
      const result = await game.withMods(async (m, key) => {
        localStorage.setItem(key, 'it');
        const resolved = await m.loc.initLocalization('fr');
        return { resolved, active: m.cg.getLanguage(), stored: localStorage.getItem(key) };
      }, STORAGE_KEY);

      expect(result.resolved).toBe('fr');
      expect(result.active).toBe('fr');
      // The explicit choice also becomes the new stored preference.
      expect(result.stored).toBe('fr');
    });

    test('an explicit regional tag normalises before it is applied', async ({ game }) => {
      const result = await game.withMods(async (m, key) => {
        const resolved = await m.loc.initLocalization('de-AT');
        return { resolved, active: m.cg.getLanguage(), stored: localStorage.getItem(key) };
      }, STORAGE_KEY);

      expect(result.resolved).toBe('de');
      expect(result.active).toBe('de');
      expect(result.stored).toBe('de');
    });

    test('an unsupported explicit request falls through to the stored preference', async ({ game }) => {
      const result = await game.withMods(async (m, key) => {
        localStorage.setItem(key, 'es');
        const resolved = await m.loc.initLocalization('ja');
        return { resolved, active: m.cg.getLanguage() };
      }, STORAGE_KEY);

      // 'ja' must never reach the lookup tables; the stored choice stands.
      expect(result.resolved).toBe('es');
      expect(result.active).toBe('es');
    });

    test('a corrupt stored value is discarded rather than applied', async ({ game }) => {
      const outcomes = await game.withMods(async (m, key) => {
        const corrupt = ['', '   ', '{{{', 'null', 'undefined', '[object Object]', 'en;DROP', '../../en'];
        const seen = [];
        for (const value of corrupt) {
          localStorage.setItem(key, value);
          seen.push({ value, resolved: await m.loc.initLocalization() });
        }
        return seen;
      }, STORAGE_KEY);

      for (const { value, resolved } of outcomes) {
        expect(SUPPORTED, `corrupt stored value ${JSON.stringify(value)} resolved to ${resolved}`)
          .toContain(resolved);
      }
    });

    test('a catalogue missing the resolved language degrades to English', async ({ game, page }) => {
      // Guards the branch that stops a malformed localization.json from blanking
      // every label on screen. Served only for this one call, then removed.
      await page.route('**/localization.json', async (route) => {
        const response = await route.fetch();
        const body = await response.json();
        delete body.de;
        await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
      });

      const resolved = await game.withMods((m) => m.loc.initLocalization('de'));
      expect(resolved).toBe('en');

      await page.unroute('**/localization.json');

      // And the game is still usable afterwards, in English.
      const restored = await game.withMods(async (m) => {
        const back = await m.loc.initLocalization('en');
        return { back, sample: m.loc.localize('tabHeaderResources', 'en') };
      });
      expect(restored.back).toBe('en');
      expect(restored.sample).toBe('Resources');
    });

    test('a language change survives a full restart', async ({ game, page }) => {
      await game.withMods((m) => m.loc.initLocalization('it'));

      const storedBefore = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
      expect(storedBefore).toBe('it');

      // Full reload: the DOMContentLoaded handler calls initLocalization() with
      // no argument, so only the stored value can produce Italian here.
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#pioneerCodeName', { timeout: 60000 });
      await game.exposeModules();

      const after = await game.withMods((m) => m.cg.getLanguage());
      expect(after).toBe('it');
    });
  });

  test.describe('with a German browser locale', () => {
    test.use({ locale: 'de-DE' });

    test('a clean install adopts the browser locale', async ({ game, page }) => {
      await game.boot();

      const state = await game.page.evaluate((key) => ({
        stored: localStorage.getItem(key),
        tabLabel: document.getElementById('tab1Intro')?.innerText?.trim()
      }), STORAGE_KEY);
      const active = await game.withMods((m) => m.cg.getLanguage());

      expect(active).toBe('de');
      // Resolution must also persist, or every boot re-derives from the browser
      // and an explicit choice can never stick.
      expect(state.stored).toBe('de');
      expect(state.tabLabel).toBe('Ressourcen');
      expect(page.url()).toContain('127.0.0.1');
    });

    test('a stored preference beats the browser locale', async ({ game }) => {
      await seedStoredLanguage(game.page, 'fr');
      await game.boot();

      const active = await game.withMods((m) => m.cg.getLanguage());
      expect(active).toBe('fr');
    });
  });

  test.describe('with a French-Canadian browser locale', () => {
    test.use({ locale: 'fr-CA' });

    test('a full locale tag resolves on its primary subtag', async ({ game }) => {
      await game.boot();

      const state = await game.page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
      const active = await game.withMods((m) => m.cg.getLanguage());

      expect(active).toBe('fr');
      expect(state).toBe('fr');
    });
  });

  test.describe('with an unsupported browser locale', () => {
    test.use({ locale: 'ja-JP' });

    test('boot falls back to English without breaking', async ({ game }) => {
      await game.boot();

      const active = await game.withMods((m) => m.cg.getLanguage());
      const tabLabel = await game.page.evaluate(() => document.getElementById('tab1Intro')?.innerText?.trim());

      expect(active).toBe('en');
      expect(tabLabel).toBe('Resources');
      expect(game.significantErrors()).toEqual([]);
    });

    test('an unsupported stored value also falls through to English', async ({ game }) => {
      await seedStoredLanguage(game.page, 'ja');
      await game.boot();

      const active = await game.withMods((m) => m.cg.getLanguage());
      expect(active).toBe('en');
    });
  });

  test.describe('with language storage unavailable', () => {
    /**
     * Make only the language key throw, leaving the rest of localStorage alone.
     *
     * Scoped deliberately: `analytics.js` reads and writes localStorage with no
     * guard at all (`getOrCreateId`, `loadEnabledFromStorage`, `hydrateQueue`),
     * so disabling storage wholesale kills boot before the pioneer prompt ever
     * renders — see tests/docs/known-issues.md #4. That is a real defect, but it
     * is not localization's, and letting it fail here would only mask the
     * behaviour these specs exist to pin: localization degrading gracefully when
     * *its own* persistence is unavailable.
     */
    async function breakLanguageStorage(page, key) {
      await page.addInitScript((storageKey) => {
        const nativeGet = Storage.prototype.getItem;
        const nativeSet = Storage.prototype.setItem;
        Storage.prototype.getItem = function (k) {
          if (k === storageKey) throw new Error('localStorage disabled');
          return nativeGet.call(this, k);
        };
        Storage.prototype.setItem = function (k, v) {
          if (k === storageKey) throw new Error('localStorage disabled');
          return nativeSet.call(this, k, v);
        };
      }, key);
    }

    test('boot completes and the game stays playable', async ({ game, page }) => {
      // Private browsing and locked-down Electron partitions both throw here. A
      // non-persisted language is a degraded experience, not a broken boot.
      await breakLanguageStorage(page, STORAGE_KEY);
      await game.boot();

      const active = await game.withMods((m) => m.cg.getLanguage());
      const tabCount = await page.evaluate(() => document.querySelectorAll('.tab').length);
      const tabLabel = await page.evaluate(() => document.getElementById('tab1Intro')?.innerText?.trim());

      expect(SUPPORTED).toContain(active);
      expect(tabCount).toBe(9);
      // Labels still resolve — an unreadable preference must not blank the UI.
      expect(tabLabel).toBeTruthy();
      expect(tabLabel).not.toBe('tabHeaderResources');
    });

    test('persistLanguage reports failure instead of throwing', async ({ game, page }) => {
      await breakLanguageStorage(page, STORAGE_KEY);
      await game.boot();

      const result = await game.withMods(async (m) => ({
        persisted: m.loc.persistLanguage('de'),
        // initLocalization must still set the language even when it cannot save it.
        resolved: await m.loc.initLocalization('de'),
        active: m.cg.getLanguage()
      }));

      expect(result.persisted).toBe(false);
      expect(result.resolved).toBe('de');
      expect(result.active).toBe('de');
    });
  });
});
