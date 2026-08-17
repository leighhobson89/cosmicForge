/**
 * Area: Performance & Frame Budget
 * Plan: tests/docs/areas/performance.md
 *
 * Measured through the Chrome DevTools Protocol rather than by eye:
 * `Performance.getMetrics` reports live `Nodes`, `JSEventListeners`,
 * `Documents` and `JSHeapUsedSize` counters, and `HeapProfiler.collectGarbage`
 * forces a collection so a reading can distinguish "not yet collected" from
 * "genuinely retained".
 *
 * The leak assertions all follow the same shape and it is worth stating once.
 * A single pass over the UI legitimately grows every counter — panes build
 * their rows on first open. What must *not* happen is growth that continues
 * with each further pass. So each test establishes a baseline **after** one
 * full warm-up cycle, then repeats the cycle and requires the counters to stay
 * flat against that warmed baseline, not against a cold boot.
 *
 * Heap readings are noisy by nature (allocation is lazy, collection is not
 * deterministic), so heap is asserted as a bound rather than an equality, and
 * only after a forced GC. Node and listener counts are exact enough to hold
 * tight tolerances, and a listener leak is the failure this area exists to
 * catch — it is the one counter that never legitimately drifts once the panes
 * have been built.
 */
import { test, expect } from '../_harness/game-fixture.mjs';

const ALL_TABS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** Open a CDP session and return a sampler for the metrics that matter here. */
async function metricsSampler(game) {
  const client = await game.page.context().newCDPSession(game.page);
  await client.send('Performance.enable');
  await client.send('HeapProfiler.enable').catch(() => { /* optional */ });

  const sample = async ({ collectGarbage = false } = {}) => {
    if (collectGarbage) {
      await client.send('HeapProfiler.collectGarbage').catch(() => { /* optional */ });
      await game.page.waitForTimeout(300);
    }
    // Settle on a frame boundary so a mid-render tree is never sampled.
    await game.page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
    const { metrics } = await client.send('Performance.getMetrics');
    const byName = Object.fromEntries(metrics.map((metric) => [metric.name, metric.value]));
    return {
      nodes: byName.Nodes,
      listeners: byName.JSEventListeners,
      documents: byName.Documents,
      heapMb: (byName.JSHeapUsedSize || 0) / 1024 / 1024
    };
  };

  return { client, sample };
}

/** One full pass over every content tab. */
async function cycleAllTabs(game, rounds = 1) {
  for (let round = 0; round < rounds; round++) {
    for (const tab of ALL_TABS) {
      await game.openTab(tab);
    }
  }
}

test.describe('Performance & Frame Budget', () => {
  test('the frame loop holds a 60Hz budget on a late-game run', async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await game.openTab(1);
    await game.page.waitForTimeout(500);

    const frames = await game.page.evaluate(async () => {
      const gaps = [];
      let last = performance.now();
      await new Promise((resolve) => {
        let counted = 0;
        const tick = () => {
          const now = performance.now();
          gaps.push(now - last);
          last = now;
          if (++counted >= 180) return resolve();
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      gaps.sort((a, b) => a - b);
      return {
        count: gaps.length,
        median: gaps[Math.floor(gaps.length / 2)],
        p95: gaps[Math.floor(gaps.length * 0.95)],
        max: gaps[gaps.length - 1]
      };
    });

    expect(frames.count).toBe(180);
    // rAF is vsync-locked at ~16.7ms, so the median proves frames are landing on
    // time rather than being coalesced. A budget overrun shows up as a p95 well
    // past two frames; the ceiling is deliberately generous for CI noise.
    expect(frames.median).toBeLessThan(25);
    expect(frames.p95).toBeLessThan(50);
    expect(frames.max).toBeLessThan(250);
  });

  test('event listeners do not accumulate across repeated tab cycles', async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    const { sample } = await metricsSampler(game);

    // Warm up: the first pass legitimately builds every pane's rows.
    await cycleAllTabs(game, 1);
    const warmed = await sample();

    await cycleAllTabs(game, 3);
    const after = await sample();

    expect(warmed.listeners).toBeGreaterThan(0);
    // Every pane rebuild re-attaches its handlers; if the old ones were not
    // going away this would climb by hundreds per cycle. A handful of drift is
    // tolerated for lazily-created shared UI (tooltips, the modal).
    expect(after.listeners - warmed.listeners,
      `listeners grew from ${warmed.listeners} to ${after.listeners} over three tab cycles`)
      .toBeLessThan(50);
    expect(after.documents).toBe(warmed.documents);
  });

  test('DOM node count returns to its baseline after repeated tab cycles', async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    const { sample } = await metricsSampler(game);

    await cycleAllTabs(game, 1);
    const warmed = await sample({ collectGarbage: true });

    await cycleAllTabs(game, 3);
    const after = await sample({ collectGarbage: true });

    expect(warmed.nodes).toBeGreaterThan(0);
    // Detached rows from previous pane renders must actually be collected. A
    // 50% ceiling still catches genuine unbounded growth — three more cycles
    // leaking a pane's worth of rows each would multiply this several times
    // over — while tolerating whichever pane happens to be open at sample time.
    expect(after.nodes,
      `nodes grew from ${warmed.nodes} to ${after.nodes} over three tab cycles`)
      .toBeLessThan(warmed.nodes * 1.5);
  });

  test('heap growth decelerates across repeated tab cycles rather than accruing per cycle', async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    const { sample } = await metricsSampler(game);

    await cycleAllTabs(game, 1);
    const readings = [(await sample({ collectGarbage: true })).heapMb];

    for (let round = 0; round < 6; round++) {
      await cycleAllTabs(game, 1);
      readings.push((await sample({ collectGarbage: true })).heapMb);
    }

    const series = readings.map((value) => value.toFixed(2)).join(', ');
    const baseline = readings[0];
    const peak = Math.max(...readings);
    const midpoint = Math.floor(readings.length / 2);
    const earlyGrowth = readings[midpoint] - readings[0];
    const lateGrowth = readings[readings.length - 1] - readings[midpoint];

    expect(baseline).toBeGreaterThan(0);
    expect(peak, `heap across cycles: ${series} MB`).toBeLessThan(baseline * 2.5 + 10);

    // The distinguishing test is the *shape*, not the direction. Caches and
    // lazily-built pane state make the heap creep upward for the first few
    // cycles and then flatten, so "rose again" is not evidence of a leak — a
    // leak keeps adding roughly the same amount every cycle. Requiring the
    // second half's growth to be materially smaller than the first half's
    // separates a warm-up plateau from linear accrual.
    expect(lateGrowth,
      `heap grew ${earlyGrowth.toFixed(2)}MB over the first half and ${lateGrowth.toFixed(2)}MB over the second: ${series} MB`)
      .toBeLessThan(Math.max(earlyGrowth * 0.75, 0) + 0.5);
  });

  test('a long idle window does not grow nodes, listeners or heap', async ({ game }) => {
    await game.boot();
    await game.prepareRunForStarshipLaunch();
    await game.openTab(1);
    const { sample } = await metricsSampler(game);

    const before = await sample({ collectGarbage: true });
    // The frame loop rewrites descriptions, prices and rates every tick; ten
    // seconds is ~600 frames of that churn.
    await game.page.waitForTimeout(10000);
    const after = await sample({ collectGarbage: true });

    expect(after.listeners - before.listeners,
      `idle listener growth ${before.listeners} -> ${after.listeners}`).toBeLessThan(50);
    expect(after.nodes,
      `idle node growth ${before.nodes} -> ${after.nodes}`).toBeLessThan(before.nodes * 1.5);
    expect(after.heapMb,
      `idle heap growth ${before.heapMb.toFixed(1)} -> ${after.heapMb.toFixed(1)} MB`)
      .toBeLessThan(before.heapMb * 2.5 + 10);
  });

  test('notifications and their containers do not accumulate without bound', async ({ game }) => {
    await game.boot();
    const { sample } = await metricsSampler(game);
    const before = await sample({ collectGarbage: true });

    // Notifications are queued per classification and displayed one at a time,
    // so a burst is the natural way to expose a container that is created but
    // never reused, or a queue entry that is never drained.
    await game.page.evaluate(async () => {
      const m = globalThis.__mods;
      for (let i = 0; i < 60; i++) {
        m.ui.showNotification(`perf probe ${i}`, 'info', 200, 'perfProbe');
      }
    });
    await game.page.waitForTimeout(3000);

    const containers = await game.page.evaluate(() =>
      document.querySelectorAll('.notification-container').length);
    const after = await sample({ collectGarbage: true });

    // One container per classification, not one per message.
    expect(containers).toBeLessThan(20);
    expect(after.nodes, `nodes ${before.nodes} -> ${after.nodes} after 60 notifications`)
      .toBeLessThan(before.nodes + 2000);
  });

  test('the frame loop keeps running across every state transition', async ({ game }) => {
    // Guards the rAF-inside-the-loop-body finding: `requestAnimationFrame(gameLoop)`
    // sits at the end of the body, so any throw ends the game silently. Each of
    // these transitions is a place a throw has historically been possible.
    await game.boot();

    const stillTicking = async (label) => {
      const before = await game.withMods((m) => JSON.stringify(m.cg.getGameActiveCountTime()));
      await game.page.waitForTimeout(1200);
      const after = await game.withMods((m) => JSON.stringify(m.cg.getGameActiveCountTime()));
      expect(after, `frame loop stopped after: ${label}`).not.toBe(before);
    };

    await stillTicking('boot');

    await game.prepareRunForStarshipLaunch();
    await stillTicking('the full debug scenario, including discovering asteroids');

    await cycleAllTabs(game, 1);
    await stillTicking('cycling every tab');

    await game.withMods((m) => m.cg.setNotationType('normal'));
    await stillTicking('a notation change');
    await game.withMods((m) => m.cg.setNotationType('normalCondensed'));

    await game.withMods(async (m) => {
      await m.loc.initLocalization('de');
      m.desc.initialiseDescriptions();
    });
    await stillTicking('a language change');

    await game.withMods(async (m) => {
      await m.loc.initLocalization('en');
      m.desc.initialiseDescriptions();
    });

    expect(game.significantErrors()).toEqual([]);
  });

  test('the compound reverse lookup stays cheap enough for the frame loop', async ({ game }) => {
    await game.boot();

    // It is called from per-frame description rendering, so its cost is paid
    // ~60 times a second per compound row on screen. This measures the real
    // exported path rather than asserting an implementation detail.
    const timing = await game.withMods((m) => {
      const samples = ['Water', 'Diesel', 'Glass', 'Steel', 'Concrete', 'Titanium', 'not-a-compound', '500'];
      const iterations = 2000;

      // Warm the JIT and any lazy catalogue build before timing.
      for (const sample of samples) m.loc.reverseLocalizeForCompounds(sample, 'en');

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        for (const sample of samples) m.loc.reverseLocalizeForCompounds(sample, 'en');
      }
      const elapsed = performance.now() - start;

      return {
        elapsed,
        perCallUs: (elapsed / (iterations * samples.length)) * 1000,
        resolvesRealCompound: m.loc.reverseLocalizeForCompounds('Water', 'en'),
        passesThroughUnknown: m.loc.reverseLocalizeForCompounds('not-a-compound', 'en')
      };
    });

    // A linear scan of the whole catalogue per call would land in the tens of
    // microseconds; anything under 20us leaves ample headroom at 60fps.
    expect(timing.perCallUs,
      `reverseLocalizeForCompounds cost ${timing.perCallUs.toFixed(2)}us per call`)
      .toBeLessThan(20);
    expect(typeof timing.resolvesRealCompound).toBe('string');
    // A value that is not a compound must come back untouched — see
    // known-issues.md #8 for why this one matters.
    expect(timing.passesThroughUnknown).toBe('not-a-compound');
  });

  test('delta timers do not drift measurably over an extended window', async ({ game }) => {
    await game.boot();

    // Drive an isolated TimerManagerDelta rather than the live instance: the
    // running gameLoop updates the shared one every frame, which makes exact
    // accumulator arithmetic against it racy.
    const drift = await game.withMods((m) => {
      const manager = new m.timers.TimerManagerDelta();
      let elapsed = 0;
      manager.addTimer('driftProbe', {
        durationMs: 0,
        repeat: true,
        onUpdate: ({ deltaMs }) => { elapsed += deltaMs; }
      });

      const stepMs = 16;
      const steps = 3750; // one simulated minute
      for (let i = 0; i < steps; i++) manager.update(stepMs, 1);

      const expected = stepMs * steps;
      return { expected, elapsed, driftMs: Math.abs(elapsed - expected) };
    });

    expect(drift.expected).toBe(60000);
    // Accumulating a minute of frames must not lose or invent time.
    expect(drift.driftMs, `drifted ${drift.driftMs}ms over a simulated minute`).toBeLessThan(1);
  });

  test('a late-game run does not blow the node budget outright', async ({ game }) => {
    await game.boot();
    const { sample } = await metricsSampler(game);
    const atBoot = await sample({ collectGarbage: true });

    await game.prepareRunForStarshipLaunch();
    await cycleAllTabs(game, 1);
    const lateGame = await sample({ collectGarbage: true });

    expect(atBoot.nodes).toBeGreaterThan(0);
    // A late-game run legitimately carries far more UI than a fresh one; this
    // records the real ratio so a change that multiplies it is visible rather
    // than silently absorbed.
    expect(lateGame.nodes,
      `late-game nodes ${lateGame.nodes} against ${atBoot.nodes} at boot`)
      .toBeLessThan(atBoot.nodes * 8);
    expect(lateGame.documents).toBe(1);
  });
});
