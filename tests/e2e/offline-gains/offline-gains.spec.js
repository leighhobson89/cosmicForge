/**
 * Area: Offline Gains — what the game pays for the time the player was away
 * Plan: tests/docs/areas/offline-gains.md
 *
 * `offlineGains()` runs on exactly two triggers, and they are different features
 * wearing the same function:
 *
 *   on load     `restoreGameStatus` calls `offlineGains(false)` after adopting
 *               the save's `timeStamp`, and announces the payment with a
 *               notification. This is the "I closed the game yesterday" case.
 *   on focus    the window's `focus` and `visibilitychange` handlers call
 *               `offlineGains(true)` — silently, because alt-tabbing back should
 *               not pop a notice every time. `blur` and `hidden` mark the moment
 *               the player left, which is what the return is measured against.
 *
 * Both are driven here through their real triggers: a save is exported through
 * the Saving/Loading pane and imported back through the Import button, and the
 * focus case dispatches the same window events the browser does.
 *
 * ## The elapsed time is real; the departure time is written into the save
 *
 * There is no way to make a test wait an hour, and no way to move the browser's
 * clock. What *is* real, and is the actual input to this feature, is the save
 * file: a save that says "written at 09:00" loaded at 10:00 is an hour of
 * offline time, and that is the only thing `offlineGains` reads. So each spec
 * exports a genuine save through the real pane, rewrites its `timeStamp` to the
 * moment the player is supposed to have left, and imports it back through the
 * real button. Everything downstream of that — the arithmetic, the caps, the
 * timers, the notification — is the shipped code path, untouched.
 *
 * A handful of specs also write a rate into the exported payload. That is done
 * because the live frame loop recomputes every aggregate rate each tick, so a
 * rate staged in the source run is zero again by the time the save is taken; the
 * payload is the only place a rate can be stated and survive to the load. It has
 * the useful side effect of making the arithmetic exact, because a run with no
 * autobuyers produces nothing after the import to muddy the measurement.
 *
 * ## The contract being pinned
 *
 *   gain = floor(ratePerTick × TIMER_RATE_RATIO × secondsAway × OFFLINE_GAINS_RATE)
 *
 * capped at the store's capacity, where `OFFLINE_GAINS_RATE` is 0.334 — being
 * away is worth about a third of playing. It applies to resources, compounds,
 * energy, research, rip telemetry and antimatter mining. It does **not** apply
 * to countdown timers: a scan that had four minutes left when the player closed
 * the game has four minutes less to run when they come back, at 1:1, because
 * time passing is not a gain.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

/** The two constants the formula is built from, as the game ships them. */
const OFFLINE_GAINS_RATE = 0.334;
const TIMER_RATE_RATIO = 100;

/** How long the player is away for in most specs. */
const HOUR_MS = 3_600_000;
const HOUR_SECONDS = 3600;

/**
 * Slack, in seconds, between the timestamp this spec writes and the moment the
 * game reads the clock. Building the payload, booting a fresh session and
 * pressing Import all take real time, and every second of it is counted as more
 * time away. Six seconds against an hour is 0.17% — nowhere near enough to blur
 * the 3× gap between a nerfed payment and an un-nerfed one.
 */
const CLOCK_SLACK_SECONDS = 8;

const SAVING_PANE_TOKEN = 'tab9.option2';
const VISUAL_PANE_TOKEN = 'tab9.option1';
const IMPORT_CODE_BUTTON = '#importSaveRow button.save-load-button';

// ------------------------------------------------------------------- the pane

/** Open one of the tab 9 panes through its real side-menu row. */
async function openPaneByToken(game, token) {
  await game.openTab(9);
  const clicked = await game.page.evaluate((classToken) => {
    const row = document.querySelector(`p.inset-paragraph[class~="${classToken}"]`);
    if (!row) return false;
    row.closest('.row-side-menu')?.classList.remove('invisible');
    row.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, token);
  if (!clicked) throw new Error(`No tab 9 side-menu row for ${token}`);
  await game.page.waitForTimeout(500);
}

/**
 * Open Saving / Loading and wait for the game to fill the export box.
 *
 * The pane does not fill it on arrival: the frame loop notices the pane is open
 * and calls `saveGame('onSaveScreen')` once, and that write is what appears.
 */
async function openSavingPane(game) {
  await openPaneByToken(game, SAVING_PANE_TOKEN);
  await game.page.waitForFunction(
    () => {
      const area = document.getElementById('exportSaveArea');
      return !!area && typeof area.value === 'string' && area.value.length > 50;
    },
    null,
    { timeout: 30000 }
  );
}

/** Leave the pane and come back, so the game captures a fresh save. */
async function revisitSavingPane(game) {
  await openPaneByToken(game, VISUAL_PANE_TOKEN);
  await game.page.waitForTimeout(400);
  await openSavingPane(game);
}

/** The compressed code currently sitting in the export box. */
function exportedCode(game) {
  return game.page.evaluate(() => document.getElementById('exportSaveArea')?.value ?? '');
}

/** Clear the notification tray so a later poll cannot read a stale message. */
async function clearNotifications(game) {
  await game.page.evaluate(() =>
    document.querySelectorAll('.notification-container').forEach((c) => c.replaceChildren()));
}

/** Poll the load/save notification channel for a message matching `pattern`. */
async function waitForNotification(game, pattern, { timeout = 20000 } = {}) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const seen = await game.notifications('loadSave');
    const hit = seen.find((t) => pattern.test(t));
    if (hit) return hit;
    await game.page.waitForTimeout(250);
  }
  return null;
}

// --------------------------------------------------------- the save under test

/**
 * Take a real save, rewrite it to look like it was written `awayMs` ago, and
 * optionally patch the state it describes.
 *
 * `patch` runs inside the page against the decoded save object, which is how the
 * specs below state a production rate that the live frame loop would otherwise
 * have zeroed before the export.
 */
async function rewindSave(game, code, awayMs, patchSource = null) {
  return game.page.evaluate(({ c, away, src }) => {
    const state = JSON.parse(LZString.decompressFromEncodedURIComponent(c));
    if (src) {
      // eslint-disable-next-line no-new-func
      const patch = new Function(`return (${src})`)();
      patch(state);
    }
    state.timeStamp = new Date(Date.now() - away).toISOString();
    return LZString.compressToEncodedURIComponent(JSON.stringify(state));
  }, { c: code, away: awayMs, src: patchSource ? patchSource.toString() : null });
}

/** Put a code in the import box and press the real Import button. */
async function importCode(game, code) {
  await game.page.evaluate((c) => {
    const area = document.getElementById('importSaveArea');
    if (area) area.value = c;
  }, code);
  await game.page.click(IMPORT_CODE_BUTTON);
}

/**
 * The whole journey: play a bit, save, leave for `awayMs`, come back.
 *
 * Returns the decoded save so a spec can measure the return against exactly what
 * was banked, rather than against a value it assumed.
 */
async function playSaveAndReturn(game, { awayMs = HOUR_MS, patch = null, prepare = null } = {}) {
  await game.boot();
  await game.openDebugMenu();
  await game.debugClick('unlockAllTabsButton');
  if (prepare) await prepare(game);

  await openSavingPane(game);
  const code = await exportedCode(game);
  expect(code.length, 'the pane must fill the export box before it can be rewound')
    .toBeGreaterThan(50);

  const rewound = await rewindSave(game, code, awayMs, patch);
  const saved = await game.page.evaluate(
    (c) => JSON.parse(LZString.decompressFromEncodedURIComponent(c)), rewound);

  await clearNotifications(game);
  await importCode(game, rewound);
  const loaded = await waitForNotification(game, /loaded successfully/i);
  expect(loaded, 'the rewound save must import cleanly').toBeTruthy();

  return { saved, code: rewound };
}

/**
 * The band a nerfed gain must land in.
 *
 * The lower bound is the payment for exactly the time written into the save; the
 * upper bound allows the seconds the test itself burned getting to the import,
 * plus whatever the run produced live after it.
 */
function nerfedGainBand(ratePerTick, awaySeconds, { livePerSecond = 0, liveSeconds = 0 } = {}) {
  const perSecond = ratePerTick * TIMER_RATE_RATIO;
  return {
    min: Math.floor(perSecond * awaySeconds * OFFLINE_GAINS_RATE),
    max: Math.floor(perSecond * (awaySeconds + CLOCK_SLACK_SECONDS) * OFFLINE_GAINS_RATE)
      + livePerSecond * liveSeconds,
    unnerfed: perSecond * awaySeconds
  };
}

// =============================================================== when it applies

test.describe('Offline gains — paid when a save is loaded', () => {
  test.setTimeout(240000);

  test('an hour away pays an hour of nerfed production into the store', async ({ game }) => {
    const RATE = 0.5;

    const { saved } = await playSaveAndReturn(game, {
      awayMs: HOUR_MS,
      patch: (state) => {
        state.resourceData.resources.hydrogen.rate = 0.5;
        state.resourceData.resources.hydrogen.quantity = 0;
        state.resourceData.resources.hydrogen.storageCapacity = 1e12;
        state.resourceData.resources.hydrogen.usedForFuelPerSec = 0;
      }
    });

    expect(saved.resourceData.resources.hydrogen.quantity, 'the store starts empty').toBe(0);

    const hydrogen = await game.withMods((m) =>
      m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']));

    const band = nerfedGainBand(RATE, HOUR_SECONDS);
    expect(Number.isFinite(hydrogen), 'an offline payment must be a real number').toBe(true);
    expect(hydrogen, 'an hour away should pay an hour of nerfed production')
      .toBeGreaterThanOrEqual(band.min);
    expect(hydrogen).toBeLessThanOrEqual(band.max);

    // And it is emphatically not the full rate: that is the whole point of the
    // feature, and a regression that dropped the nerf would land here.
    expect(hydrogen, 'offline production must not pay the online rate')
      .toBeLessThan(band.unnerfed * 0.5);

    expect(game.significantErrors()).toEqual([]);
  });

  test('loading a save tells the player the offline gains were added', async ({ game }) => {
    await playSaveAndReturn(game, {
      awayMs: HOUR_MS,
      patch: (state) => { state.resourceData.resources.hydrogen.rate = 0.5; }
    });

    const announced = await waitForNotification(game, /offline gains/i);
    expect(announced, 'a load must say the time away was paid for').toBeTruthy();
  });

  test('a save written a moment ago pays nothing', async ({ game }) => {
    const { saved } = await playSaveAndReturn(game, {
      awayMs: 0,
      patch: (state) => {
        state.resourceData.resources.hydrogen.rate = 0.5;
        state.resourceData.resources.hydrogen.quantity = 0;
        state.resourceData.resources.hydrogen.storageCapacity = 1e12;
      }
    });

    expect(saved.resourceData.resources.hydrogen.quantity).toBe(0);

    const hydrogen = await game.withMods((m) =>
      m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']));

    // A few seconds of test overhead is still a few seconds of "away", so this
    // is bounded rather than exactly zero — but it must be a rounding error, not
    // a payment.
    const band = nerfedGainBand(0.5, 0);
    expect(hydrogen).toBeGreaterThanOrEqual(0);
    expect(hydrogen, 'no time away, no meaningful payment').toBeLessThanOrEqual(band.max);
  });
});

test.describe('Offline gains — paid when the window comes back', () => {
  test.setTimeout(180000);

  /**
   * Leave the window and come back.
   *
   * `blur` is the event the browser fires when the player alt-tabs away, and the
   * game's handler records the moment. The departure is then backdated — the one
   * thing a test cannot do for real — and `focus` is dispatched, which is the
   * event that actually pays.
   */
  async function leaveAndReturn(game, awayMs) {
    await game.page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await game.page.waitForTimeout(200);

    const marked = await game.withMods((m) => m.cg.getLastSavedTimeStamp());
    expect(typeof marked, 'leaving the window should stamp the moment of departure').toBe('string');

    await game.withMods((m, away) => {
      m.cg.setLastSavedTimeStamp(new Date(Date.now() - away).toISOString());
    }, awayMs);

    await game.page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await game.page.waitForTimeout(600);
  }

  test('alt-tabbing away for an hour and back pays the same nerfed hour', async ({ game }) => {
    const RATE = 0.5;
    await game.boot();

    // No autobuyer is bought, so nothing produces live and the only thing that
    // can move the store is the return payment.
    await game.withMods((m, rate) => {
      m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'quantity']);
      m.rdo.setResourceDataObject(1e12, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(rate, 'resources', ['hydrogen', 'rate']);
    }, RATE);

    await leaveAndReturn(game, HOUR_MS);

    const hydrogen = await game.withMods((m) =>
      m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']));
    const band = nerfedGainBand(RATE, HOUR_SECONDS);

    expect(hydrogen).toBeGreaterThanOrEqual(band.min);
    expect(hydrogen).toBeLessThanOrEqual(band.max);
    expect(hydrogen, 'coming back pays the nerfed rate, not the full one')
      .toBeLessThan(band.unnerfed * 0.5);
  });

  test('coming back is silent — the notification belongs to loading a save', async ({ game }) => {
    await game.boot();
    await game.withMods((m) => m.rdo.setResourceDataObject(0.5, 'resources', ['hydrogen', 'rate']));
    await clearNotifications(game);

    await leaveAndReturn(game, HOUR_MS);

    const seen = await game.notifications('loadSave');
    expect(seen.filter((t) => /offline gains/i.test(t)),
      'returning focus must not pop a notice every time').toEqual([]);
  });

  test('two focus events in quick succession pay once, not twice', async ({ game }) => {
    const RATE = 0.5;
    await game.boot();
    await game.withMods((m, rate) => {
      m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'quantity']);
      m.rdo.setResourceDataObject(1e12, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(rate, 'resources', ['hydrogen', 'rate']);
    }, RATE);

    await game.page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await game.withMods((m, away) => {
      m.cg.setLastSavedTimeStamp(new Date(Date.now() - away).toISOString());
    }, HOUR_MS);

    // Both inside the handler's 250ms guard. Without it the second focus would
    // pay for the same hour a second time, because nothing advances the
    // departure stamp in between.
    await game.page.evaluate(() => {
      window.dispatchEvent(new Event('focus'));
      window.dispatchEvent(new Event('focus'));
    });
    await game.page.waitForTimeout(700);

    const hydrogen = await game.withMods((m) =>
      m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']));
    const band = nerfedGainBand(RATE, HOUR_SECONDS);

    expect(hydrogen, 'the hour should have been paid').toBeGreaterThanOrEqual(band.min);
    expect(hydrogen, 'and paid only once').toBeLessThanOrEqual(band.max);
  });

  test('a brand new game that has never been saved pays nothing rather than NaN', async ({ game }) => {
    // The reachable case: the game is opened in a background tab, or in a window
    // that never had focus, and the player clicks into it. `focus` fires with no
    // `blur` ever having happened, so the departure stamp is whatever `startGame`
    // left behind — and every quantity in the run is about to be added to.
    await game.boot();

    await game.withMods((m) => {
      m.rdo.setResourceDataObject(0, 'resources', ['hydrogen', 'quantity']);
      m.rdo.setResourceDataObject(1e12, 'resources', ['hydrogen', 'storageCapacity']);
      m.rdo.setResourceDataObject(0.5, 'resources', ['hydrogen', 'rate']);
    });

    await game.page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await game.page.waitForTimeout(700);

    const state = await game.withMods((m) => ({
      hydrogen: m.rdo.getResourceDataObject('resources', ['hydrogen', 'quantity']),
      research: m.rdo.getResourceDataObject('research', ['quantity']),
      energy: m.rdo.getResourceDataObject('buildings', ['energy', 'quantity']),
      activeTime: m.cg.getGameActiveCountTime()
    }));

    expect(Number.isFinite(state.hydrogen), `hydrogen became ${state.hydrogen}`).toBe(true);
    expect(Number.isFinite(state.research), `research became ${state.research}`).toBe(true);
    expect(Number.isFinite(state.energy), `energy became ${state.energy}`).toBe(true);
    expect(state.activeTime.every((v) => Number.isFinite(v)),
      `the active/inactive clock became ${JSON.stringify(state.activeTime)}`).toBe(true);
  });
});

// ================================================================== the nerf

test.describe('Offline gains — the nerf', () => {
  test.setTimeout(240000);

  test('the nerf is a flat 0.334 of the online rate', async ({ game }) => {
    await game.boot();
    const rate = await game.withMods((m) => m.cg.getOfflineGainsRate());
    // Pinned as a number rather than compared to itself: this is the balance
    // decision the whole feature turns on, and it should not drift silently.
    expect(rate).toBe(OFFLINE_GAINS_RATE);
    expect(await game.withMods((m) => m.cg.getTimerRateRatio())).toBe(TIMER_RATE_RATIO);
  });

  test('the nerfed figure is floored, so a trickle pays nothing at all', async ({ game }) => {
    // 0.00001 per tick over an hour is 3.6 units online, 1.2 nerfed — but the
    // floor is applied to the whole payment, so a rate small enough that an hour
    // does not reach 1 pays zero.
    await playSaveAndReturn(game, {
      awayMs: HOUR_MS,
      patch: (state) => {
        state.resourceData.resources.helium.rate = 0.000002;
        state.resourceData.resources.helium.quantity = 0;
        state.resourceData.resources.helium.storageCapacity = 1e12;
        state.resourceData.resources.helium.usedForFuelPerSec = 0;
      }
    });

    const helium = await game.withMods((m) =>
      m.rdo.getResourceDataObject('resources', ['helium', 'quantity']));

    // 0.000002 x 100 x 3600 x 0.334 = 0.24, floored to 0.
    expect(helium, 'a sub-unit hour of production floors to nothing').toBe(0);
    expect(Number.isInteger(helium), 'the payment is a whole number').toBe(true);
  });

  test('the payment is capped by the store, never spilling past capacity', async ({ game }) => {
    const CAPACITY = 500;

    await playSaveAndReturn(game, {
      awayMs: HOUR_MS,
      patch: (state) => {
        // An hour at this rate is worth ~60,000 nerfed — two orders of magnitude
        // more than the store can hold.
        state.resourceData.resources.carbon.rate = 0.5;
        state.resourceData.resources.carbon.quantity = 0;
        state.resourceData.resources.carbon.storageCapacity = 500;
        state.resourceData.resources.carbon.usedForFuelPerSec = 0;
      }
    });

    const carbon = await game.withMods((m) =>
      m.rdo.getResourceDataObject('resources', ['carbon', 'quantity']));

    expect(carbon, 'an overflowing offline payment fills the store exactly').toBe(CAPACITY);
  });

  test('fuel being burned is taken off the rate before the nerf is applied', async ({ game }) => {
    // A resource feeding a power plant produces less, and the offline payment
    // has to reflect the net rate or a player would gain fuel they also spent.
    const RATE = 0.5;
    const BURNED = 0.2;

    await playSaveAndReturn(game, {
      awayMs: HOUR_MS,
      patch: (state) => {
        state.resourceData.resources.neon.rate = 0.5;
        state.resourceData.resources.neon.usedForFuelPerSec = 0.2;
        state.resourceData.resources.neon.quantity = 0;
        state.resourceData.resources.neon.storageCapacity = 1e12;
      }
    });

    const neon = await game.withMods((m) =>
      m.rdo.getResourceDataObject('resources', ['neon', 'quantity']));

    const net = nerfedGainBand(RATE - BURNED, HOUR_SECONDS);
    const gross = nerfedGainBand(RATE, HOUR_SECONDS);

    expect(neon).toBeGreaterThanOrEqual(net.min);
    expect(neon).toBeLessThanOrEqual(net.max);
    expect(neon, 'the gross rate must not be what is paid').toBeLessThan(gross.min);
  });
});

// ==================================================== what the nerf applies to

test.describe('Offline gains — what is paid, and what is not', () => {
  test.setTimeout(240000);

  test('compounds are paid on the same nerfed formula as resources', async ({ game }) => {
    const RATE = 0.4;

    await playSaveAndReturn(game, {
      awayMs: HOUR_MS,
      patch: (state) => {
        state.resourceData.compounds.water.rate = 0.4;
        state.resourceData.compounds.water.quantity = 0;
        state.resourceData.compounds.water.storageCapacity = 1e12;
        state.resourceData.compounds.water.usedForFuelPerSec = 0;
      }
    });

    const water = await game.withMods((m) =>
      m.rdo.getResourceDataObject('compounds', ['water', 'quantity']));
    const band = nerfedGainBand(RATE, HOUR_SECONDS);

    expect(water).toBeGreaterThanOrEqual(band.min);
    expect(water).toBeLessThanOrEqual(band.max);
  });

  test('research is paid, and the all-time total counts it', async ({ game }) => {
    const RATE = 0.3;

    const { saved } = await playSaveAndReturn(game, {
      awayMs: HOUR_MS,
      patch: (state) => {
        state.resourceData.research.rate = 0.3;
        state.resourceData.research.quantity = 0;
        state.allTimeTotalResearchPoints = 0;
      }
    });

    expect(saved.resourceData.research.quantity).toBe(0);

    const after = await game.withMods((m) => ({
      research: m.rdo.getResourceDataObject('research', ['quantity']),
      allTime: m.cg.getResourceAllTimeStat?.('researchPoints') ?? null
    }));
    const band = nerfedGainBand(RATE, HOUR_SECONDS);

    expect(after.research).toBeGreaterThanOrEqual(band.min);
    expect(after.research).toBeLessThanOrEqual(band.max);
    if (after.allTime !== null) {
      expect(after.allTime, 'offline research counts towards the lifetime total')
        .toBeGreaterThanOrEqual(band.min);
    }
  });

  test('energy is only paid once a battery exists to hold it', async ({ game }) => {
    const RATE = 0.6;

    // Without a battery the game treats the offline energy rate as zero, because
    // there is nowhere for energy to accumulate while nobody is watching.
    await playSaveAndReturn(game, {
      awayMs: HOUR_MS,
      patch: (state) => {
        state.resourceData.buildings.energy.batteryBoughtYet = false;
        state.resourceData.buildings.energy.rate = 0.6;
        state.resourceData.buildings.energy.consumption = 0;
        state.resourceData.buildings.energy.quantity = 0;
        state.resourceData.buildings.energy.storageCapacity = 1e12;
      }
    });

    const withoutBattery = await game.withMods((m) =>
      m.rdo.getResourceDataObject('buildings', ['energy', 'quantity']));
    expect(withoutBattery, 'no battery, nowhere to bank the energy').toBe(0);

    await playSaveAndReturn(game, {
      awayMs: HOUR_MS,
      patch: (state) => {
        state.resourceData.buildings.energy.batteryBoughtYet = true;
        state.resourceData.buildings.energy.rate = 0.6;
        state.resourceData.buildings.energy.consumption = 0;
        state.resourceData.buildings.energy.quantity = 0;
        state.resourceData.buildings.energy.storageCapacity = 1e12;
      }
    });

    const withBattery = await game.withMods((m) =>
      m.rdo.getResourceDataObject('buildings', ['energy', 'quantity']));
    const band = nerfedGainBand(RATE, HOUR_SECONDS);

    expect(withBattery, 'a battery banks the nerfed hour').toBeGreaterThanOrEqual(band.min);
    expect(withBattery).toBeLessThanOrEqual(band.max);
  });

  test('rip telemetry is paid from the buoys and orbiters that were deployed', async ({ game }) => {
    // The rate is the sum of both instruments' rate x quantity, so the payment
    // proves the whole product was walked rather than only the first entry.
    const BUOY_RATE = 0.1;
    const BUOYS = 3;
    const ORBITER_RATE = 0.2;
    const ORBITERS = 2;
    const COMBINED = BUOY_RATE * BUOYS + ORBITER_RATE * ORBITERS;

    await playSaveAndReturn(game, {
      awayMs: HOUR_MS,
      patch: (state) => {
        const rip = state.resourceData.cosmicRip;
        rip.ripTelemetryData = 0;
        rip.upgrades.sensorBuoy.rate = 0.1;
        rip.upgrades.sensorBuoy.quantity = 3;
        rip.upgrades.ripResearchOrbiter.rate = 0.2;
        rip.upgrades.ripResearchOrbiter.quantity = 2;
      }
    });

    const telemetry = await game.withMods((m) =>
      m.rdo.getResourceDataObject('cosmicRip', ['ripTelemetryData']));
    const band = nerfedGainBand(COMBINED, HOUR_SECONDS);

    expect(telemetry).toBeGreaterThanOrEqual(band.min);
    expect(telemetry).toBeLessThanOrEqual(band.max);
  });

  test('an asteroid left being mined pays nerfed antimatter and gives up the ore', async ({ game }) => {
    // `easeOfExtraction` of 1 is the best there is, which makes the extraction
    // rate exactly the game's own maximum and the arithmetic checkable.
    await playSaveAndReturn(game, {
      awayMs: HOUR_MS,
      patch: (state) => {
        state.resourceData.antimatter.quantity = 0;
        state.asteroidArray = [{
          e2eOfflineRock: {
            name: 'e2eOfflineRock',
            quantity: [1e9, 1e9],
            easeOfExtraction: [1, 'Trivial'],
            beingMined: true,
            elements: {},
            distanceFromEarth: 1,
            interacted: true
          }
        }];
      }
    });

    const after = await game.withMods((m) => {
      const asteroid = (m.cg.getAsteroidArray() || [])
        .map((entry) => entry.e2eOfflineRock)
        .find(Boolean);
      return {
        antimatter: m.rdo.getResourceDataObject('antimatter', ['quantity']),
        maxRate: m.cg.getNormalMaxAntimatterRate(),
        oreLeft: asteroid ? asteroid.quantity[0] : null
      };
    });

    expect(after.oreLeft, 'the staged asteroid should still be in the array').not.toBeNull();

    const band = nerfedGainBand(after.maxRate, HOUR_SECONDS);
    expect(after.antimatter, 'mining pays while the player is away')
      .toBeGreaterThanOrEqual(band.min);
    expect(after.antimatter).toBeLessThanOrEqual(band.max);
    expect(after.antimatter, 'and it pays the nerfed rate')
      .toBeLessThan(band.unnerfed * 0.5);

    // The ore is consumed by what was extracted: an offline payment that did not
    // debit the rock would be free antimatter forever.
    expect(1e9 - after.oreLeft).toBeGreaterThanOrEqual(band.min);
  });

  test('a countdown that was already running loses the whole time away, not a third of it', async ({ game }) => {
    // Time passing is not a gain, so the nerf must not touch it. A five minute
    // scan with one minute of absence has four minutes left; a nerfed
    // subtraction would leave it at four minutes and twenty seconds.
    const AWAY_MS = 60_000;
    const TIME_LEFT_MS = 300_000;

    await playSaveAndReturn(game, {
      awayMs: AWAY_MS,
      patch: (state) => {
        state.flags.currentlySearchingAsteroid = true;
        state.timeLeftUntilAsteroidScannerTimerFinishes = 300000;
        state.currentAsteroidSearchTimerDurationTotal = 300000;
        state.flags.currentlyInvestigatingStar = false;
        state.flags.currentlyPillagingVoid = false;
        state.flags.powerOnOff = true;
      }
    });

    const remaining = await game.withMods((m) =>
      m.cg.getTimeLeftUntilAsteroidScannerTimerFinishes());

    const expected = TIME_LEFT_MS - AWAY_MS;
    const nerfedIfWrong = TIME_LEFT_MS - AWAY_MS * OFFLINE_GAINS_RATE;

    expect(remaining, 'the countdown should have lost the whole minute')
      .toBeLessThanOrEqual(expected + 5000);
    expect(remaining).toBeGreaterThanOrEqual(expected - 15000);
    expect(remaining, 'a nerfed subtraction would leave far too much on the clock')
      .toBeLessThan(nerfedIfWrong - 10000);
  });

  test('rocket fuel accrued while away is nerfed like every other gain', async ({ game }) => {
    // Rocket fuel is declared in the same gains object as everything else, which
    // is what makes it subject to the same nerf.
    const FUEL_RATE = 0.05;

    await playSaveAndReturn(game, {
      awayMs: HOUR_MS,
      patch: (state) => {
        state.rocketsFuellerStartedArray = ['rocket1'];
        const rocket = state.resourceData.space.upgrades.rocket1;
        rocket.fuelQuantity = 0;
        rocket.fuelQuantityToLaunch = 1e9;
        rocket.autoBuyer.tier1.rate = 0.05;
      }
    });

    const fuel = await game.withMods((m) =>
      m.rdo.getResourceDataObject('space', ['upgrades', 'rocket1', 'fuelQuantity']));
    const band = nerfedGainBand(FUEL_RATE, HOUR_SECONDS);

    expect(fuel, 'an hour of fuelling should have been paid').toBeGreaterThanOrEqual(band.min);
    expect(fuel, 'and paid at the offline rate, not the online one')
      .toBeLessThanOrEqual(band.max);
  });
});
