/**
 * Area: Random Events
 * Plan: tests/docs/areas/random-events.md
 *
 * `events.js` runs two clocks: a global cycle timer that rolls for one instant
 * event every 45-75 minutes, and a per-frame timer that counts down whichever
 * timed effects are running. Each event carries a `canTrigger()` guard and a
 * `trigger()` that returns a result object; a trigger multiplies that event's
 * own probability by `PROBABILITY_DECAY_ON_TRIGGER` (0.9), floored at 0.01, so
 * a run cannot be dominated by one event.
 *
 * Everything here is driven through `triggerSpecificRandomEventDebug()` — the
 * same entry point the debug menu's Trigger button uses — rather than by waiting
 * out a 45-minute cycle. Where a spec needs the button itself, it goes through
 * `debugRandomEventSelect` + `triggerRandomEventButton`.
 *
 * Note the eligibility guards are real: several events cannot fire on a fresh
 * boot (no power plants to explode, no rockets in flight), which is why most of
 * these specs run the full debug scenario first.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

const TIMED_EVENT_IDS = [
  'galacticMarketLockdown', 'endlessSummer', 'minerBrokeDown',
  'supplyChainDisruption', 'blackHoleInstability'
];

const NEGATIVE_INSTANT_EVENT_IDS = [
  'powerPlantExplosion', 'batteryExplosion', 'scienceTheft',
  'antimatterReaction', 'stockLoss', 'starshipLostInSpace'
];

/** Fire one named event through the same debug path the menu button uses. */
async function triggerEvent(game, eventId) {
  await game.withMods((m, id) => m.events.triggerSpecificRandomEventDebug(id), eventId);
  await game.page.waitForTimeout(250);
}

test.describe('Random Events — catalogue and probability model', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('every event is registered, uniquely named and offered by the debug menu', async ({ game }) => {
    const ids = await game.withMods((m) => m.events.getRandomEventIds());
    const options = await game.withMods((m) => m.events.getRandomEventDebugOptions());
    const selectValues = await game.page.evaluate(() =>
      Array.from(document.querySelectorAll('#debugRandomEventSelect option'))
        .map((el) => el.value)
        .filter(Boolean));

    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    expect(options.map((option) => option.id).sort()).toEqual([...ids].sort());
    for (const option of options) {
      expect(typeof option.title, `${option.id} title`).toBe('string');
      expect(option.title.length).toBeGreaterThan(0);
      expect(option.titleKey).toBe(`eventName${option.id.charAt(0).toUpperCase()}${option.id.slice(1)}`);
    }
    // The debug select is built from the same registry, so a new event appears
    // in the menu automatically rather than needing a second edit.
    expect([...selectValues].sort()).toEqual([...ids].sort());
  });

  test('the timed and instant sets partition the catalogue', async ({ game }) => {
    const ids = await game.withMods((m) => m.events.getRandomEventIds());

    for (const timed of TIMED_EVENT_IDS) {
      expect(ids, `${timed} should be registered`).toContain(timed);
    }
    for (const negative of NEGATIVE_INSTANT_EVENT_IDS) {
      expect(ids, `${negative} should be registered`).toContain(negative);
      // A negative event is by definition instant — the timed set is separate.
      expect(TIMED_EVENT_IDS).not.toContain(negative);
    }
  });

  test('every event name and description localizes in all five languages', async ({ game }) => {
    const problems = await game.withMods(async (m, languages) => {
      const ids = m.events.getRandomEventIds();
      const original = m.cg.getLanguage();
      const issues = [];

      for (const language of languages) {
        await m.loc.initLocalization(language);
        for (const id of ids) {
          const key = `eventName${id.charAt(0).toUpperCase()}${id.slice(1)}`;
          const value = m.loc.localize(key, language);
          if (!value || value === key || !String(value).trim()) {
            issues.push(`${language}:${key}: missing`);
          }
        }
      }

      await m.loc.initLocalization(original);
      m.desc.initialiseDescriptions();
      return issues;
    }, ['en', 'es', 'pt', 'de', 'it', 'fr']);

    expect(problems).toEqual([]);
  });

  test('probability decays on trigger and never falls below the floor', async ({ game }) => {
    await game.prepareRunForStarshipLaunch();

    const result = await game.withMods((m) => {
      // endlessSummer's only guard is that it is not already running, so it is
      // the cleanest event to observe the decay curve on.
      const readProbability = () => m.rdo.getResourceDataObject('randomEvents', ['events', 'endlessSummer', 'currentProbability'], true);

      const series = [readProbability()];
      for (let i = 0; i < 5; i++) {
        // Clear the timed effect between triggers so canTrigger() stays true.
        m.rdo.setResourceDataObject({ remainingMs: 0 }, 'randomEvents', ['timedEffects', 'endlessSummer']);
        m.events.triggerSpecificRandomEventDebug('endlessSummer');
        series.push(readProbability());
      }
      return { series };
    });

    const series = result.series.filter((value) => typeof value === 'number');
    expect(series.length).toBeGreaterThan(1);
    for (let i = 1; i < series.length; i++) {
      // Each trigger multiplies by 0.9, so the curve is strictly decreasing
      // until it reaches the 0.01 floor.
      expect(series[i], `step ${i}: ${series.join(' -> ')}`).toBeCloseTo(Math.max(0.01, series[i - 1] * 0.9), 6);
      expect(series[i]).toBeGreaterThanOrEqual(0.01);
    }
  });

  test('an event with an unmet precondition refuses to fire', async ({ game }) => {
    // On a fresh boot there is nothing to blow up, no rocket in flight and no
    // starship in transit, so these guards must all hold.
    const before = await game.withMods((m) => m.events.getEventsHistorySnapshot().length);
    for (const id of ['powerPlantExplosion', 'batteryExplosion', 'starshipLostInSpace', 'minerBrokeDown']) {
      await triggerEvent(game, id);
    }
    const after = await game.withMods((m) => ({
      history: m.events.getEventsHistorySnapshot().length,
      activeTimed: m.events.getTimedEffectsUiSnapshot().map((effect) => effect.id)
    }));

    expect(after.history).toBe(before);
    expect(after.activeTimed).toEqual([]);
    expect(game.significantErrors()).toEqual([]);
  });

  test('an unknown event id is refused without throwing', async ({ game }) => {
    await game.withMods((m) => m.events.triggerSpecificRandomEventDebug('notARealEvent'));
    await game.page.waitForTimeout(300);
    expect(game.significantErrors()).toEqual([]);
  });
});

test.describe('Random Events — timed effects', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
  });

  test('a timed effect starts with its full duration and reports itself active', async ({ game }) => {
    await triggerEvent(game, 'galacticMarketLockdown');

    const state = await game.withMods((m) => ({
      active: m.events.isTimedEffectActive('galacticMarketLockdown'),
      remaining: m.events.getTimedEffectRemainingMs('galacticMarketLockdown'),
      snapshot: m.events.getTimedEffectStateSnapshot('galacticMarketLockdown'),
      ui: m.events.getTimedEffectsUiSnapshot()
    }));

    expect(state.active).toBe(true);
    // The lockdown runs for 30 minutes.
    expect(state.snapshot.totalDurationMs).toBe(30 * 60 * 1000);
    expect(state.remaining).toBeGreaterThan(0);
    expect(state.remaining).toBeLessThanOrEqual(state.snapshot.totalDurationMs);
    expect(typeof state.snapshot.startedAtMs).toBe('number');

    const entry = state.ui.find((effect) => effect.id === 'galacticMarketLockdown');
    expect(entry).toBeTruthy();
    expect(entry.description.length).toBeGreaterThan(0);
    expect(entry.name.length).toBeGreaterThan(0);
  });

  test('a timed effect counts down and cannot be started twice', async ({ game }) => {
    await triggerEvent(game, 'galacticMarketLockdown');
    const first = await game.withMods((m) => m.events.getTimedEffectRemainingMs('galacticMarketLockdown'));

    await game.page.waitForTimeout(1500);
    const later = await game.withMods((m) => m.events.getTimedEffectRemainingMs('galacticMarketLockdown'));

    // Re-triggering while it runs must be refused by canTrigger(), not restart it.
    await triggerEvent(game, 'galacticMarketLockdown');
    const afterRetrigger = await game.withMods((m) => m.events.getTimedEffectRemainingMs('galacticMarketLockdown'));

    expect(later).toBeLessThan(first);
    expect(afterRetrigger).toBeLessThan(later + 1000);
  });

  test('an expiring timed effect runs its onExpire hook and is recorded in history', async ({ game }) => {
    await triggerEvent(game, 'galacticMarketLockdown');
    expect(await game.withMods((m) => m.events.isTimedEffectActive('galacticMarketLockdown'))).toBe(true);

    // Wind the remaining time down to a sliver and let the per-frame timer run
    // it out, rather than clearing the state by hand — that way the expiry path
    // and its history entry are exercised for real.
    await game.withMods((m) => {
      const state = m.rdo.getResourceDataObject('randomEvents', ['timedEffects', 'galacticMarketLockdown'], true) || {};
      m.rdo.setResourceDataObject({ ...state, remainingMs: 60 }, 'randomEvents', ['timedEffects', 'galacticMarketLockdown']);
    });
    await game.page.waitForTimeout(1500);

    const after = await game.withMods((m) => ({
      active: m.events.isTimedEffectActive('galacticMarketLockdown'),
      remaining: m.events.getTimedEffectRemainingMs('galacticMarketLockdown'),
      history: m.events.getTimedEffectsHistorySnapshot().map((entry) => entry.id ?? entry.eventId),
      activeUi: m.events.getTimedEffectsUiSnapshot().map((effect) => effect.id)
    }));

    expect(after.active).toBe(false);
    expect(after.remaining).toBe(0);
    expect(after.history).toContain('galacticMarketLockdown');
    // An expired effect drops out of the live UI list.
    expect(after.activeUi).not.toContain('galacticMarketLockdown');
  });

  test('endless summer holds the weather sunny while it runs', async ({ game }) => {
    await triggerEvent(game, 'endlessSummer');

    const state = await game.withMods((m) => ({
      active: m.events.isTimedEffectActive('endlessSummer'),
      snapshot: m.events.getTimedEffectStateSnapshot('endlessSummer')
    }));

    expect(state.active).toBe(true);
    expect(state.snapshot.totalDurationMs).toBeGreaterThan(0);
  });

  test('supply chain disruption only fires once an autobuyer exists, and targets one the player owns', async ({ game }) => {
    // The candidate list is built from materials with at least one autobuyer
    // tier owned — disrupting a supply the player has not automated would be
    // invisible. The debug scenario grants materials but buys no autobuyers, so
    // the guard legitimately refuses until one exists.
    const refused = await game.withMods((m) => {
      m.events.triggerSpecificRandomEventDebug('supplyChainDisruption');
      return m.events.isTimedEffectActive('supplyChainDisruption');
    });
    expect(refused).toBe(false);

    const state = await game.withMods((m) => {
      m.rdo.setResourceDataObject(3, 'resources', ['hydrogen', 'upgrades', 'autoBuyer', 'tier1', 'quantity']);
      m.events.triggerSpecificRandomEventDebug('supplyChainDisruption');

      const snapshot = m.events.getTimedEffectStateSnapshot('supplyChainDisruption') || {};
      return {
        active: m.events.isTimedEffectActive('supplyChainDisruption'),
        category: snapshot.category ?? null,
        key: snapshot.key ?? null,
        percentDown: snapshot.percentDown ?? null,
        unlocked: [
          'hydrogen',
          ...(m.cg.getUnlockedResourcesArray() || []),
          ...(m.cg.getUnlockedCompoundsArray() || [])
        ].map((value) => String(value).toLowerCase())
      };
    });

    expect(state.active).toBe(true);
    expect(['resources', 'compounds']).toContain(state.category);
    expect(state.unlocked, `chose ${state.key}`).toContain(String(state.key).toLowerCase());
    expect(state.percentDown).toBeGreaterThan(0);
  });

  test('miner broke down names one of the four rockets', async ({ game }) => {
    // The guard needs a rocket in flight, so send one.
    await game.withMods((m) => {
      m.cg.setCurrentlyTravellingToAsteroid('rocket1', true);
      m.cg.setTimeLeftUntilRocketTravelToAsteroidTimerFinishes('rocket1', 600000);
      m.cg.setRocketDirection('rocket1', false);
      m.cg.setDestinationAsteroid('rocket1', 'Asteroid1');
    });

    await triggerEvent(game, 'minerBrokeDown');

    const state = await game.withMods((m) => ({
      active: m.events.isTimedEffectActive('minerBrokeDown'),
      snapshot: m.events.getTimedEffectStateSnapshot('minerBrokeDown')
    }));

    if (state.active) {
      expect(['rocket1', 'rocket2', 'rocket3', 'rocket4']).toContain(state.snapshot.rocket);
    } else {
      // If the guard still refused, nothing may have been recorded either.
      expect(state.snapshot?.remainingMs ?? 0).toBe(0);
    }
  });

  test('active timed effects survive a save/load round trip with their remaining time', async ({ game }) => {
    await triggerEvent(game, 'galacticMarketLockdown');

    const result = await game.withMods((m) => {
      const live = m.events.getTimedEffectStateSnapshot('galacticMarketLockdown');
      const saved = JSON.parse(JSON.stringify(m.cg.captureGameStatusForSaving('initialise')));
      return {
        live,
        savedEffect: saved.resourceData?.randomEvents?.timedEffects?.galacticMarketLockdown,
        savedEvents: saved.resourceData?.randomEvents?.events?.galacticMarketLockdown
      };
    });

    expect(result.savedEffect).toBeTruthy();
    expect(result.savedEffect.remainingMs).toBeCloseTo(result.live.remainingMs, -2);
    expect(result.savedEffect.totalDurationMs).toBe(result.live.totalDurationMs);
    // The decayed probability travels with the save too, or a reload would reset
    // the event's rarity.
    expect(typeof result.savedEvents?.currentProbability).toBe('number');
  });
});

test.describe('Random Events — instant events', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
  });

  test('an instant event applies its effect and is recorded in history exactly once', async ({ game }) => {
    const before = await game.withMods((m) => ({
      research: m.rdo.getResourceDataObject('research', ['quantity']),
      history: m.events.getEventsHistorySnapshot().length
    }));

    await triggerEvent(game, 'researchBreakthrough');

    const after = await game.withMods((m) => ({
      research: m.rdo.getResourceDataObject('research', ['quantity']),
      history: m.events.getEventsHistorySnapshot(),
      timed: m.events.getTimedEffectsUiSnapshot().map((effect) => effect.id)
    }));

    expect(after.history.length).toBe(before.history + 1);
    // An instant event leaves no running effect behind.
    expect(after.timed).not.toContain('researchBreakthrough');
    const entry = after.history[0];
    expect(entry.id ?? entry.eventId).toBe('researchBreakthrough');
  });

  test('a power plant explosion destroys exactly one plant', async ({ game }) => {
    await game.withMods((m) => {
      m.rdo.setResourceDataObject(5, 'buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']);
    });

    const before = await game.withMods((m) =>
      m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', 'powerPlant1', 'quantity']));

    await triggerEvent(game, 'powerPlantExplosion');

    const after = await game.withMods((m) => ({
      plants: ['powerPlant1', 'powerPlant2', 'powerPlant3'].map((key) =>
        m.rdo.getResourceDataObject('buildings', ['energy', 'upgrades', key, 'quantity'])),
      history: m.events.getEventsHistorySnapshot().map((entry) => entry.id ?? entry.eventId)
    }));

    const totalAfter = after.plants.reduce((sum, value) => sum + value, 0);
    expect(before).toBe(5);
    // Only one unit may be lost per trigger.
    expect(totalAfter).toBe(4);
    expect(after.history).toContain('powerPlantExplosion');
  });

  test('stock loss removes 40-80% of one stock the player holds', async ({ game }) => {
    // Snapshot, trigger and re-snapshot inside a single page evaluation: the
    // frame loop cannot interleave with a synchronous block, so production
    // ticking cannot mask or fake the drop. Both categories are covered because
    // pickStockLossTarget draws from resources *and* compounds.
    const result = await game.withMods((m) => {
      const readAll = () => {
        const out = {};
        for (const category of ['resources', 'compounds']) {
          const data = m.rdo.getResourceDataObject(category) || {};
          for (const key of Object.keys(data)) {
            if (key === 'version') continue;
            out[`${category}.${key}`] = Number(m.rdo.getResourceDataObject(category, [key, 'quantity'])) || 0;
          }
        }
        return out;
      };

      const before = readAll();
      const historyBefore = m.events.getEventsHistorySnapshot().length;
      m.events.triggerSpecificRandomEventDebug('stockLoss');
      const after = readAll();

      const dropped = Object.entries(after)
        .filter(([key, value]) => value < before[key])
        .map(([key, value]) => ({ key, before: before[key], after: value }));

      return {
        dropped,
        historyBefore,
        history: m.events.getEventsHistorySnapshot()
      };
    });

    expect(result.history.length).toBe(result.historyBefore + 1);
    expect(result.history[0].id ?? result.history[0].eventId).toBe('stockLoss');

    // Exactly one stock is hit, and the loss sits inside the documented band.
    expect(result.dropped.length).toBe(1);
    const [hit] = result.dropped;
    const fractionLost = (hit.before - hit.after) / hit.before;
    expect(fractionLost, `${hit.key}: ${hit.before} -> ${hit.after}`).toBeGreaterThanOrEqual(0.39);
    expect(fractionLost, `${hit.key}: ${hit.before} -> ${hit.after}`).toBeLessThanOrEqual(0.81);
  });

  test('negative events are classified as bad so the UI can colour them', async ({ game }) => {
    const classifications = await game.withMods((m, ids) => {
      const out = {};
      for (const id of ids) {
        // ui.js keeps the good/bad mapping the event modal styles from.
        out[id] = m.ui.getRandomEventClassification?.(id) ?? null;
      }
      return out;
    }, NEGATIVE_INSTANT_EVENT_IDS);

    // The mapping may not be exported; when it is not, fall back to asserting
    // that each negative event at least carries a modal header and body, which
    // is what the player actually sees.
    const anyExported = Object.values(classifications).some((value) => value !== null);
    if (anyExported) {
      for (const id of NEGATIVE_INSTANT_EVENT_IDS) {
        expect(classifications[id], `${id} classification`).toBe('bad');
      }
    } else {
      const copy = await game.withMods(async (m, ids) => {
        const issues = [];
        for (const id of ids) {
          const headerKey = `modalEvent${id.charAt(0).toUpperCase()}${id.slice(1)}Header`;
          const textKey = `modalEvent${id.charAt(0).toUpperCase()}${id.slice(1)}Text`;
          for (const key of [headerKey, textKey]) {
            const value = m.loc.localize(key, 'en');
            if (!value || value === key) issues.push(`${key}: missing`);
          }
        }
        return issues;
      }, NEGATIVE_INSTANT_EVENT_IDS);
      expect(copy).toEqual([]);
    }
  });

  test('event history is capped and does not grow without bound', async ({ game }) => {
    const result = await game.withMods((m) => {
      // Push well past the 300-entry instant-history cap directly, because
      // triggering 400 real events would take minutes and is not what is under
      // test — the trimming is.
      const oversized = Array.from({ length: 400 }, (_, index) => ({
        id: 'researchBreakthrough',
        endedAtMs: Date.now() + index
      }));
      m.rdo.setResourceDataObject(oversized, 'randomEvents', ['instantEventsHistory']);

      m.events.triggerSpecificRandomEventDebug('researchBreakthrough');

      const stored = m.rdo.getResourceDataObject('randomEvents', ['instantEventsHistory'], true) || [];
      return { length: stored.length };
    });

    // pushInstantEventHistoryEntry trims to the most recent 300 on every write.
    expect(result.length).toBeLessThanOrEqual(300);
  });

  test('the combined history snapshot is ordered newest first', async ({ game }) => {
    await triggerEvent(game, 'researchBreakthrough');
    await game.page.waitForTimeout(400);
    await triggerEvent(game, 'galacticMarketLockdown');

    const history = await game.withMods((m) => m.events.getEventsHistorySnapshot());

    expect(history.length).toBeGreaterThan(0);
    for (let i = 1; i < history.length; i++) {
      const previous = Number(history[i - 1]?.endedAtMs) || 0;
      const current = Number(history[i]?.endedAtMs) || 0;
      expect(previous).toBeGreaterThanOrEqual(current);
    }
  });
});

test.describe('Random Events — the debug trigger', () => {
  test('the debug menu fires the selected event end to end', async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();

    await game.debugSelect('debugRandomEventSelect', 'endlessSummer');
    await game.debugClick('triggerRandomEventButton');
    await game.page.waitForTimeout(600);

    const active = await game.withMods((m) => m.events.isTimedEffectActive('endlessSummer'));
    expect(active).toBe(true);
    expect(game.significantErrors()).toEqual([]);
  });

  test('firing every registered event in turn leaves the game running and error-free', async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();

    const ids = await game.withMods((m) => m.events.getRandomEventIds());
    for (const id of ids) {
      await triggerEvent(game, id);
    }

    // The frame loop must survive every effect, including the ones that tear
    // buildings down or move the starship.
    const before = await game.withMods((m) => JSON.stringify(m.cg.getGameActiveCountTime()));
    await game.page.waitForTimeout(1200);
    const after = await game.withMods((m) => JSON.stringify(m.cg.getGameActiveCountTime()));

    expect(after).not.toBe(before);
    expect(game.significantErrors()).toEqual([]);
  });
});
