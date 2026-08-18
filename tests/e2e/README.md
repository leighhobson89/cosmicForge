# E2E Test Suite

Playwright-based end-to-end suite, one folder per functional area.

## Running

Full guide, including headed mode and running a single area:
**[`tests/docs/running-tests.md`](../docs/running-tests.md)**.

```bash
node tests/run-e2e.mjs            # everything, headless, full report
node tests/run-e2e.mjs audio      # one area
node tests/run-e2e.mjs --headed   # everything, headed
```

## Reports

| Path | What |
|---|---|
| `test-reports/e2e/index.html` | Summary across all areas — pass/fail totals, per-area breakdown, expandable case lists |
| `test-reports/e2e/<area>/index.html` | Full Playwright report for that area, with trace, screenshot and video on failure |
| `test-reports/e2e/<area>/results.json` | Machine-readable results, used to build the summary |

Reports are gitignored. Traces are retained on failure only — open one with
`npx playwright show-trace test-results/<...>/trace.zip`.

## Writing a spec

Specs live in `tests/e2e/<area>/<name>.spec.js` and import the shared fixture:

```js
import { test, expect } from '../_harness/game-fixture.mjs';

test.describe('My Area', () => {
  test.beforeEach(async ({ game }) => {
    await game.boot();
  });

  test('does the thing', async ({ game }) => {
    const value = await game.withMods((m) => m.cg.getAscendencyPoints());
    expect(value).toBe(0);
  });
});
```

### The `game` fixture

| Method | Purpose |
|---|---|
| `boot({ pioneer, acceptOnboarding, language })` | Fresh game, onboarding declined (or accepted), modules exposed |
| `withMods(fn, arg)` | Run `fn(mods, arg)` in page context with the game's real modules bound |
| `openTab(n)` | Click tab `n` |
| `openPane(label)` | Reveal and open a side-menu pane by its visible label |
| `notifications(cls?)` | Text of visible notifications, optionally filtered by classification |
| `advanceTimers(ms, mult)` | Drive `timerManagerDelta` forward without real waiting |
| `significantErrors()` | Console/page errors captured, minus known-noisy entries |

### Use the game's own debug tooling for scenario setup

**This is the preferred way to reach any non-trivial game state.** The game ships
two debug surfaces, and the harness drives both:

| Method | Purpose |
|---|---|
| `openDebugMenu()` | Opens `#debugWindow` via its real hotkey, **Numpad -** |
| `openVariableDebugger()` | Opens `#variableDebuggerWindow` via **Numpad \*** |
| `debugClick(id, {times})` | Click any debug-menu button by id |
| `debugSelect(id, value)` | Set a debug `<select>` |
| `setDebugVariable(label, value)` | Edit a variable through the variable debugger's own search, inline editor and submit button |
| `closeVariableDebugger()` | Close it again so it stops repainting every frame |
| `debugTimeWarp({durationMs, multiplier})` | Trigger the debug time warp |
| `prepareRunForStarshipLaunch()` | The game's full late-game scenario chain |

`boot()` always uses a pioneer name containing **`Test1981`**, which is the game's
own sanctioned test backdoor — both hotkey handlers accept it as an alternative to
the non-Electron + non-demo + cheats-enabled gate, so debug tooling works
regardless of how `buildFlags.js` is currently set.

`boot({ acceptOnboarding: true })` takes the Yes branch of the real tutorial
prompt instead of declining it; `boot({ language: 'de' })` seeds the stored
language before navigation, so the whole boot — including the onboarding prompt
— renders in that language. The prompt is recognised by its *cancel* button
reading some form of "no", because `#modalConfirm` is reused by the two earlier
boot modals and is already on screen.

`prepareRunForStarshipLaunch()` runs the game's own chain and yields: $1B cash,
1B of every resource and compound, all 39 techs, launch pad + scanner + all
rockets, 10 asteroids, 5 studied stars, 80k antimatter, a built starship, 30 fleets
+ envoy, and a default philosophy. That covers most "needs late-game state" cases
without a line of bespoke setup.

Useful individual buttons: `give1BButton`, `give1MAllResourcesAndCompounds`,
`grantAllTechsButton`, `add10AsteroidsButton`, `addStarButton`,
`buildLaunchPadScannerAndAllRocketsButton`, `gain10000AntimatterButton`,
`add100ApButton`, `addFleetsAndEnvoyButton`, `buildStarshipDebugButton`,
`unlockAllTabsButton`, `add10000CpButton`, `resetGpSpentButton`,
`clearWeatherButton`, `triggerRandomEventButton`, `setNewsTickerDebugButton`.

Selects worth knowing: `debugRandomEventSelect` (pair with
`triggerRandomEventButton` to fire one named random event, e.g.
`galacticMarketLockdown`), and `debugNewsTickerCategorySelect` /
`debugNewsTickerIntervalSelect` (pair with `setNewsTickerDebugButton`).

### Forcing an outcome with `setDebugVariable`

The variable debugger is the only way to reach several deliberately random
outcomes. The casino specs lean on three of them:

| Variable | Effect |
|---|---|
| `wheelForceSpecial` | Wheel of Fortune always lands segment 0, the special prize |
| `casinoGame4AlwaysWin` | Higher or Lower never loses — note the name is one ahead of the game number used everywhere else |
| `casinoGame5VoidSeerAlwaysMatch` | The Void Seer's two reels always match |

`setDebugVariable` drives the real editor, and its shape is dictated by two
things worth knowing before writing your own:

- **`populateVariableDebugger()` rebuilds every row on every frame** while the
  window is open, so a resolved element handle is detached before a normal
  Playwright click lands. The helper clicks a *screen coordinate* instead, where
  whichever freshly built row occupies that spot carries the same handler. It
  uses the debugger's own search bar to scroll the row into view first, because
  the scrolling container is an ancestor of the rebuilt rows and so keeps its
  scroll position.
- **The click has to be a real one.** The row handlers call
  `setPointerCapture(e.pointerId)`, which throws `NotFoundError` for a synthetic
  pointer id and aborts the handler before it opens the editor — so a dispatched
  `PointerEvent` silently does nothing.

Call `closeVariableDebugger()` when done; leaving it open costs a full DOM
rebuild every frame for the rest of the test.

Modules available inside `withMods`: `cg` (constantsAndGlobalVars), `rdo`
(resourceDataObject), `game`, `ach` (achievements), `audio`, `loc` (localization),
`desc` (descriptions), `timers` (timerManagerDelta), `clockTimers` (timerManager —
the wall-clock manager behind the news ticker, a different instance from
`timers`), `ui`, `rip` (cosmicRip), `saveLoad`, `casino`, `onboarding`, `events`.

## Conventions learned the hard way

**Boot fresh; do not use the legacy cloud fixtures.** The `smoke_save_*` saves in
Supabase have `resourceData.version` below `MINIMUM_GAME_VERSION_FOR_SAVES`, so
`restoreGameStatus` rejects them outright. They also make every test depend on a
live network round trip. Booting fresh and seeding state via `withMods` is faster,
hermetic, and touches no production data.

**Do not assert on the live `timerManagerDelta` arithmetic.** The running
`gameLoop` drives it every frame, so exact accumulator maths against the shared
instance is racy. Construct an isolated `new m.timers.TimerManagerDelta()` for
deterministic timing assertions, and keep live-instance checks to robust facts.

**Localization keys are two-tier.** An achievement's `notification` field and a
buff's `description` field are keys into `descriptions.js` maps
(`achievementNotifications`, `optionDescriptions`), *not* into `localization.json`.
Resolve them with `m.desc.getAchievementNotification(...)` /
`m.desc.getOptionDescription(...)` after `initialiseDescriptions()`, not with
`m.loc.localize(...)`.

**Assert documented behaviour, not invented invariants.** Several first-draft
assertions failed against perfectly intentional data conventions — for example
`timesRebuyable: 100000` is how "effectively unlimited" is expressed, and a
rebuyable perk may legitimately have a flat cost if it has a low purchase cap.
When a test fails, establish whether the game or the assumption is wrong before
changing either.

**Reach for the debug menu before writing setup code.** Anything the debug window
can do, it should do — that exercises the real wiring and keeps specs short. Only
seed state directly via `withMods` when no debug action covers it.

**Several getters hand back the live array, and their setters only push.**
`getStarsWithAncientManuscripts()`, `getUnlockedResourcesArray()` and
`getUnlockedCompoundsArray()` all return the real object, while the matching
`set…` functions append rather than replace. To clear one, drain it in place
(`arr.length = 0`) and refill afterwards. `setFactoryStarsArray` and
`setMegaStructureTechsResearched` take an explicit `override` second argument
instead.

**Values rendered through the notation formatter cannot be compared exactly.**
Any element carrying the `notation` class is rewritten to `54.3K`, `300.0K` and
so on, so a summary line is not a precise figure. Assert against the underlying
data object, or against a raw input field, and use the displayed value only to
prove that a *preview matches execution* — which is what the market specs do.

**Notifications are queued per classification and shown one at a time.** A
message triggered while an earlier one from the same classification is still on
screen appears up to 3.5s later, so reading the notification list immediately
after an action returns the *previous* message. Poll for the expected text
rather than snapshotting once, and match anywhere in the visible set rather than
at a fixed position.

**`locator.isVisible()` does not wait, whatever timeout you pass it.** It
answers against the DOM as it stands. Anything that appears after an async step
— the onboarding prompt, which waits on `loadGameFromCloud()` — needs
`waitFor({ state: 'visible' })`. `boot()` raced this for a long time and
intermittently left the tutorial prompt on screen.

**Read-modify-read against live game state belongs in one `withMods` call.**
The frame loop cannot interleave with a synchronous block, so snapshotting,
triggering and re-snapshotting inside a single evaluation removes production
ticks from the measurement. Split across three round trips, a resource that the
game is actively producing will drift between them and mask the change under
test — this is what makes the `stockLoss` assertion in `random-events` exact
rather than approximate.

**Stage state relative to the game's own limits, not to a flat number.** Setting
every resource to the same quantity looks tidy and is wrong: `helium`'s storage
cap is 120, so a staged 137 is silently clamped and the assertion that follows
compares against a figure the game already overwrote. Read the cap and stage a
fraction of it.

**Reach a modal through the code that raises it.** Calling `callPopupModal` with
labels of the spec's own proves only that the modal renders strings. The
philosophy specs drive `startInvestigateStarTimer` with a short remainder
instead, so what `game.js` passes as the four button labels is what gets
asserted. The same applies to any handler-built UI: build it the way the game
does, or the wiring between the two goes untested.

**Pick the check language so a bug cannot pass by coincidence.** Asserting that
a German label differs from its English form proves nothing for
"Expansionist" — the word is identical in both. French was chosen for the
philosophy-name specs because all four names differ there, and the spec asserts
that they differ *before* comparing against the rendered modal, so it fails loudly
if a future catalogue edit makes it vacuous.

### Measuring performance

`tests/e2e/performance/` opens a CDP session for the counters that matter:

```js
const client = await game.page.context().newCDPSession(game.page);
await client.send('Performance.enable');
const { metrics } = await client.send('Performance.getMetrics'); // Nodes, JSEventListeners, JSHeapUsedSize, Documents
await client.send('HeapProfiler.collectGarbage');                // force a GC before a heap reading
```

Four rules make those assertions meaningful.

**Baseline after a warm-up, not at boot** — and not straight after
`prepareRunForStarshipLaunch()` either. That chain unlocks every tab and
building, and the frame loop then spends several seconds drawing all of those
rows. A baseline taken before that finishes charges ordinary construction to
whatever the spec is measuring.

**Assert the shape of heap growth, not its direction** — caches make the heap
creep up and then flatten, so a leak is distinguished by the second half of a
run growing as much as the first, not by the series rising at all.

**Measure the control window before the window under test.** Warm-up is not
reliably finished at a fixed timeout — under eight parallel workers the game
builds far more slowly in wall-clock terms — so whichever window runs first
absorbs whatever construction is left. Putting the *control* first charges that
residue to the control, and any excess the test window shows over it is real.
Measured the other way round, the notification-burst spec reported a 1600-node
leak that did not exist.

**Confirm a suspected leak in isolation before believing it.** A single-worker
run of the same burst showed cdpNodes −1, elements 0, text nodes 0 and listeners
0 across 60 messages. `npx playwright test <file> --reporter=line` runs one
worker and is the quickest way to separate a real finding from a scheduling
artefact. Counting `document.querySelectorAll('*')` alongside the CDP metric is
worth doing too: CDP `Nodes` includes text nodes and detached-but-referenced
nodes, so the two disagreeing is itself informative.

**A live bug must make the test fail. Never work around one.** This is the
suite's governing rule. Do not weaken an assertion so a buggy path passes, do not
add a harness helper whose job is to paper over a crash, and do not "pin both
ends" of known-broken behaviour so the spec goes green either way. All three
produce a suite that reports on itself rather than on the game.

When a spec fails, first establish whether the game or the assumption is wrong —
several first-draft assertions here have failed against perfectly intentional
design, and tech prices dipping below their own prerequisite is one of them. If
the assumption was wrong, withdraw it and say why in a comment. If the *game* is
wrong, raise it with the maintainer with the evidence and a proposed source fix,
and leave the spec failing until it is decided. Recording the defect in
[`tests/docs/known-issues.md`](../docs/known-issues.md) is worth doing, but it is
not a substitute for the failure: documenting a bug and then making the test pass
anyway is the exact pattern this rule exists to prevent.

The harness carries no bug workarounds today.
`ensureCompoundRecipeTextInitialised()` used to seed state around known-issues #1
and has been deleted now that the game initialises the table itself — leaving it
in would have hidden a re-regression.

## Layout

```
tests/
  e2e/
    _harness/
      game-fixture.mjs      shared Playwright fixture + GameHarness
      static-server.mjs     static file server used as the Playwright webServer
    <area>/
      README.md             pointer to the area's test plan
      *.spec.js             the specs
  legacy/                   pre-existing jest+playwright smoke tests
  docs/                     coverage taxonomy and per-area plans
  run-e2e.mjs               per-area runner and summary report builder
```
