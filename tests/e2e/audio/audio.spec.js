/**
 * Area: Audio
 * Plan: tests/docs/areas/audio.md
 *
 * Covers background music, SFX and weather ambience, their settings toggles, and
 * that muted audio genuinely stays silent. Playback is asserted through the
 * managers' own state rather than by listening, since headless Chromium has no
 * audio device and browser autoplay policy blocks unprompted playback.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe('Audio', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('audio managers are constructed and exposed', async ({ game }) => {
    const shape = await game.withMods((m) => ({
      hasBackground: Boolean(m.audio.backgroundAudio),
      hasSfxPlayer: Boolean(m.audio.sfxPlayer),
      hasWeatherAmbience: Boolean(m.audio.weatherAmbienceManager),
      hasBoostSound: Boolean(m.audio.boostSoundManager),
      hasPlayClickSfx: typeof m.audio.playClickSfx === 'function',
      hasPlaySwipeSfx: typeof m.audio.playSwipeSfx === 'function'
    }));

    expect(shape).toEqual({
      hasBackground: true,
      hasSfxPlayer: true,
      hasWeatherAmbience: true,
      hasBoostSound: true,
      hasPlayClickSfx: true,
      hasPlaySwipeSfx: true
    });
  });

  test('background audio exposes the full playback lifecycle', async ({ game }) => {
    const methods = await game.withMods((m) =>
      ['update', 'play', 'pause', 'resume'].filter(
        (fn) => typeof m.audio.backgroundAudio[fn] === 'function'
      )
    );

    expect(methods).toEqual(['update', 'play', 'pause', 'resume']);
  });

  test('background audio is not playing on a fresh boot', async ({ game }) => {
    const state = await game.withMods((m) => ({
      isPlaying: m.audio.backgroundAudio.isPlaying,
      settingEnabled: m.cg.getBackgroundAudio()
    }));

    // Nothing should start before the player opts in.
    expect(state.isPlaying).toBeFalsy();
    expect(state.settingEnabled).toBe(false);
  });

  test('the background audio setting round-trips', async ({ game }) => {
    const result = await game.withMods((m) => {
      const original = m.cg.getBackgroundAudio();
      m.cg.setBackgroundAudio(true);
      const enabled = m.cg.getBackgroundAudio();
      m.cg.setBackgroundAudio(false);
      const disabled = m.cg.getBackgroundAudio();
      m.cg.setBackgroundAudio(original);
      return { original, enabled, disabled };
    });

    expect(result.enabled).toBe(true);
    expect(result.disabled).toBe(false);
  });

  test('the SFX setting round-trips', async ({ game }) => {
    const result = await game.withMods((m) => {
      const original = m.cg.getSfx();
      m.cg.setSfx(true);
      const enabled = m.cg.getSfx();
      m.cg.setSfx(false);
      const disabled = m.cg.getSfx();
      m.cg.setSfx(original);
      return { original, enabled, disabled };
    });

    expect(result.enabled).toBe(true);
    expect(result.disabled).toBe(false);
  });

  test('update() is safe to call repeatedly while audio is disabled', async ({ game }) => {
    // gameLoop calls backgroundAudio.update() and weatherAmbienceManager.update()
    // every frame, so these must never throw regardless of settings state.
    const outcome = await game.withMods((m) => {
      m.cg.setBackgroundAudio(false);
      try {
        for (let i = 0; i < 200; i++) {
          m.audio.backgroundAudio.update();
          m.audio.weatherAmbienceManager.update();
        }
        return { threw: false, isPlaying: m.audio.backgroundAudio.isPlaying };
      } catch (e) {
        return { threw: true, message: e.message };
      }
    });

    expect(outcome.threw).toBe(false);
    // Disabled audio must not start itself from the frame loop.
    expect(outcome.isPlaying).toBeFalsy();
  });

  test('playing click and swipe SFX never throws while muted', async ({ game }) => {
    const outcome = await game.withMods((m) => {
      m.cg.setSfx(false);
      try {
        for (let i = 0; i < 25; i++) {
          m.audio.playClickSfx();
          m.audio.playSwipeSfx();
        }
        return { threw: false };
      } catch (e) {
        return { threw: true, message: e.message };
      }
    });

    expect(outcome.threw).toBe(false);
  });

  test('muted SFX registers no active sounds', async ({ game }) => {
    const active = await game.withMods((m) => {
      m.cg.setSfx(false);
      m.audio.sfxPlayer.stopAll?.();
      for (let i = 0; i < 10; i++) m.audio.playClickSfx();

      const activeSounds = m.audio.sfxPlayer.activeSounds;
      if (!activeSounds) return 0;
      if (Array.isArray(activeSounds)) return activeSounds.length;
      if (activeSounds instanceof Map || activeSounds instanceof Set) return activeSounds.size;
      return Object.keys(activeSounds).length;
    });

    expect(active).toBe(0);
  });

  test('pause and resume are safe when nothing is playing', async ({ game }) => {
    const outcome = await game.withMods((m) => {
      try {
        m.audio.backgroundAudio.pause();
        const afterPause = m.audio.backgroundAudio.isPlaying;
        m.audio.backgroundAudio.resume();
        const afterResume = m.audio.backgroundAudio.isPlaying;
        m.audio.backgroundAudio.pause();
        return { threw: false, afterPause, afterResume };
      } catch (e) {
        return { threw: true, message: e.message };
      }
    });

    expect(outcome.threw).toBe(false);
  });

  test('stopAll clears any active SFX', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.cg.setSfx(true);
      for (let i = 0; i < 5; i++) m.audio.playClickSfx();
      m.audio.sfxPlayer.stopAll?.();

      const activeSounds = m.audio.sfxPlayer.activeSounds;
      let count = 0;
      if (Array.isArray(activeSounds)) count = activeSounds.length;
      else if (activeSounds instanceof Map || activeSounds instanceof Set) count = activeSounds.size;
      else if (activeSounds) count = Object.keys(activeSounds).length;

      m.cg.setSfx(false);
      return count;
    });

    expect(result).toBe(0);
  });

  test('weather ambience lazily creates tracks and updates safely', async ({ game }) => {
    const result = await game.withMods((m) => {
      const mgr = m.audio.weatherAmbienceManager;
      // Tracks are created on first play, so a fresh boot starts with none.
      const initialCount = Object.keys(mgr.tracks).length;

      let threw = false;
      try {
        for (let i = 0; i < 50; i++) mgr.update();
        mgr.pauseAll();
      } catch {
        threw = true;
      }

      return {
        hasTracksObject: mgr.tracks && typeof mgr.tracks === 'object',
        initialCount,
        threw,
        hasPauseAll: typeof mgr.pauseAll === 'function',
        hasResumeAll: typeof mgr.resumeAll === 'function'
      };
    });

    expect(result.hasTracksObject).toBe(true);
    expect(result.initialCount).toBe(0);
    expect(result.threw).toBe(false);
    expect(result.hasPauseAll).toBe(true);
    expect(result.hasResumeAll).toBe(true);
  });

  test('audio settings survive a save/load round trip', async ({ game }) => {
    const result = await game.withMods((m) => {
      m.cg.setBackgroundAudio(true);
      m.cg.setSfx(false);

      const captured = m.cg.captureGameStatusForSaving('initialise');
      const restored = JSON.parse(JSON.stringify(captured));

      // Reset live state so we are reading the captured values, not the globals.
      m.cg.setBackgroundAudio(false);

      // Audio settings are persisted under gameState.flags, which is also where
      // restoreGameStatus reads them back from.
      return {
        backgroundAudio: restored.flags?.backgroundAudio,
        sfx: restored.flags?.sfx
      };
    });

    expect(result.backgroundAudio).toBe(true);
    expect(result.sfx).toBe(false);
  });

  test('no audio element autoplays without user opt-in', async ({ game }) => {
    // Browser autoplay policy aside, the game must not leave a media element
    // playing on a fresh boot — that is what produces the "sound on load" bug.
    const playing = await game.page.evaluate(() =>
      Array.from(document.querySelectorAll('audio, video'))
        .filter((el) => !el.paused && !el.ended && el.currentTime > 0)
        .map((el) => el.currentSrc || el.src || '(no src)')
    );

    expect(playing).toEqual([]);
  });
});
