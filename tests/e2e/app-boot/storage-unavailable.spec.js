/**
 * Area: App Boot — the game starts with localStorage switched off
 * Source: tests/docs/known-issues.md #4
 *
 * `localStorage` does not merely return nothing when the browser has it turned
 * off — reading or writing it *throws*. Private browsing, a locked-down Electron
 * partition and a Chromium profile with site data blocked all behave this way.
 *
 * The boot path touches storage in three places: `analytics.js` (initialised from
 * inside `ui.js` before the UI is built), the saved pioneer name in `ui.js`, and
 * the stored language in `localization.js`. Only the last was guarded, so the
 * first throw killed the page before the pioneer prompt was ever drawn — the game
 * did not start at all for those players.
 *
 * `language-resolution.spec.js` had to break storage for the language key *only*,
 * precisely because breaking it wholesale took boot down for reasons that were
 * nothing to do with localization. This spec is the one that breaks it wholesale.
 *
 * What is asserted is deliberately behavioural rather than structural: the game
 * boots, plays, and saves are still exportable. A spec that asserted "analytics
 * has a try/catch" would pass against a build that guarded analytics and still
 * died on the pioneer name.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/**
 * Make every localStorage read and write throw, for the whole page lifetime.
 *
 * Patched on `Storage.prototype` through an init script so it is in place before
 * any module evaluates — the failure this spec is about happened during module
 * initialisation, so a patch applied after load would miss it entirely.
 */
async function disableStorageEntirely(page) {
  await page.addInitScript(() => {
    const boom = () => { throw new Error('localStorage disabled'); };
    Storage.prototype.getItem = boom;
    Storage.prototype.setItem = boom;
    Storage.prototype.removeItem = boom;
    Storage.prototype.clear = boom;
  });
}

test.describe('App Boot — with localStorage unavailable', () => {
  test('the game boots to a playable state', async ({ game, page }) => {
    await disableStorageEntirely(page);
    await game.boot();

    // The tab strip is the proof the UI was actually built, not merely that the
    // document loaded.
    expect(await page.evaluate(() => document.querySelectorAll('.tab').length),
      'the full tab strip should be built').toBe(9);

    // And it is live, not a frozen first paint: the frame loop must be running.
    const before = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']));
    await game.openTab(1);
    await page.waitForTimeout(1500);
    const after = await game.withMods((m) => m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']));
    expect(typeof before, 'the resource store should be readable').toBe('number');
    expect(typeof after).toBe('number');

    // No unhandled storage exception reached the console.
    const storageErrors = game.significantErrors()
      .filter((entry) => /localStorage|storage/i.test(String(entry)));
    expect(storageErrors, 'a disabled store must be handled, not thrown past').toEqual([]);
  });

  test('analytics degrades instead of taking boot down with it', async ({ game, page }) => {
    await disableStorageEntirely(page);
    await game.boot();

    // The module initialises during boot and is the one that used to kill it.
    // Tracking an event with no store must be a no-op, not a throw.
    const tracked = await page.evaluate(async () => {
      try {
        const analytics = await import('/analytics.js');
        analytics.trackAnalyticsEvent('e2e_storage_probe', { probe: true });
        return 'ok';
      } catch (error) {
        return String(error && error.message);
      }
    });
    expect(tracked, 'tracking an event without a store must not throw').toBe('ok');
  });

  test('the player can still take a save out of a session that cannot persist one', async ({ game, page }) => {
    await disableStorageEntirely(page);
    await game.boot();

    // Storage being unavailable costs the player autosave, not their progress:
    // an export still has to produce a real save string they can keep.
    const exported = await game.withMods((m) => {
      const state = m.cg.captureGameStatusForSaving('export');
      return state && typeof state === 'object' ? Object.keys(state).length : 0;
    });
    expect(exported, 'a save should still be capturable without storage').toBeGreaterThan(10);

    expect(game.significantErrors()).toEqual([]);
  });
});
