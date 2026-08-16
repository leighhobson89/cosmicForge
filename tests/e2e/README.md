# E2E Test Suite

Playwright-based end-to-end suite, one folder per functional area.

## Running

```bash
npm run test:e2e                  # every area, one HTML report each
npm run test:e2e:list             # which areas currently have specs
node tests/run-e2e.mjs audio      # a single area
node tests/run-e2e.mjs audio app-boot
npx playwright test tests/e2e/audio --headed   # watch it run
npx playwright test tests/e2e/audio --debug    # step through
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
| `boot({ pioneer })` | Fresh game, onboarding declined, modules exposed |
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
| `debugTimeWarp({durationMs, multiplier})` | Trigger the debug time warp |
| `prepareRunForStarshipLaunch()` | The game's full late-game scenario chain |

`boot()` always uses a pioneer name containing **`Test1981`**, which is the game's
own sanctioned test backdoor — both hotkey handlers accept it as an alternative to
the non-Electron + non-demo + cheats-enabled gate, so debug tooling works
regardless of how `buildFlags.js` is currently set.

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
`clearWeatherButton`, `triggerRandomEventButton`.

Modules available inside `withMods`: `cg` (constantsAndGlobalVars), `rdo`
(resourceDataObject), `game`, `ach` (achievements), `audio`, `loc` (localization),
`desc` (descriptions), `timers` (timerManagerDelta), `ui`.

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

**Known live bugs are worked around in the harness, not hidden.** See
[`tests/docs/known-issues.md`](../docs/known-issues.md). Notably,
`ensureCompoundRecipeTextInitialised()` exists because discovering an asteroid on
run 1 currently kills the frame loop permanently; without it that crash would mask
every later assertion in the spec.

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
