# Running the E2E Suite

How to run the tests: the whole suite, a single area, and headed vs. headless.
This covers `tests/e2e/*` only — the functional-area coverage plan lives in
[`coverage-report.md`](coverage-report.md), and the debug tooling specs are built
on is documented in [`../e2e/README.md`](../e2e/README.md).

Two ways to run things, and they answer different questions:

| | `node tests/run-e2e.mjs` | `npx playwright test` |
|---|---|---|
| Use it to... | get a full pass/fail report to look at afterwards | watch or step through a run right now |
| Output | one HTML report **per area** + a summary index | Playwright's own single report |
| Headless by default | yes | yes |
| Supports `--headed`, `-g`, `--debug`, `--ui` | `--headed` yes; others via `--` (see below) | all of them, natively |

If you just want to see it running or debug one failing spec, reach for
`npx playwright test` directly. If you want a record of what passed, use
`node tests/run-e2e.mjs`.

---

## Run everything

```bash
node tests/run-e2e.mjs
```

Runs every area under `tests/e2e/` that has at least one `.spec.js` file (currently
`achievements`, `antimatter`, `app-boot`, `ascendency`, `audio`, `autobuyers`,
`battle`, `black-hole`, `colonise`, `compounds` — see `--list` below for the live
list). Each area runs as its own Playwright invocation, so one area crashing
outright can't take the others down with it.

Same thing via npm:

```bash
npm test
# or
npm run test:e2e
```

## Run just one folder

```bash
node tests/run-e2e.mjs audio
```

Or several:

```bash
node tests/run-e2e.mjs audio app-boot black-hole
```

Only those areas run; the summary report reflects only the areas you ran (it does
not merge with results from a previous run).

To run one folder without going through the report-writing wrapper at all — e.g.
while actively writing a spec — call Playwright directly:

```bash
npx playwright test tests/e2e/audio
```

## Run a migration from a specific save version

The `migration` area takes an argument the other areas don't: a save version.

```bash
node tests/run-e2e.mjs migration 0.97        # one version
node tests/run-e2e.mjs migration 0.93 0.99   # several
node tests/run-e2e.mjs migration             # every rung below current
```

A bare number is read as a version rather than an area name — no area folder could
be called `0.97` — and passing one implies the `migration` area, so
`node tests/run-e2e.mjs 0.97` is the same command.

What it does: plays a run in the current build, exports the save the game writes,
ages that save back to the version you asked for by undoing every `patches.js`
rung above it, imports it through the real Import button, and then checks it
climbed back to current, kept the run, and is still playable. Run it at release
time, and add the new rung to `tests/e2e/migration/version-ladder.mjs` whenever the
save version is bumped — the suite fails by name if that catalogue falls behind
`patches.js`. See [`areas/migration.md`](areas/migration.md).

Note this is a different area from `save-migration`, which covers the ladder's edge
cases (below minimum, from the future, missing sections) rather than one nominated
version.

## See what's available

```bash
node tests/run-e2e.mjs --list
```

Lists every area folder under `tests/e2e/` that currently has specs. An area
folder with only a `README.md` and no `.spec.js` file yet won't show up here —
check [`coverage-report.md`](coverage-report.md) for the full planned taxonomy,
specced or not.

---

## Headed vs. headless

**Headless** (no visible browser window) is the default for both run styles —
right for CI, right for "just tell me if it's green."

**Headed** (a real Chromium window you can watch) is for when you want to see what
the test is actually doing.

### Via the report runner

```bash
node tests/run-e2e.mjs --headed                  # every area, headed
node tests/run-e2e.mjs audio --headed             # one area, headed
```

`--headed` also forces `--workers=1`, so browser windows run one at a time
instead of stacking on top of each other.

Add `--slow` to put a **700ms pause before every step**, for when a headed run
moves too fast to follow:

```bash
node tests/run-e2e.mjs audio --headed --slow      # one area, headed, paced
```

`--slow` only applies **together with `--headed`** — it exists to make a run
watchable, and pacing a headless run just burns time. On its own it prints a
warning and is ignored.

Two mechanisms are involved, because one alone is not enough:

- Playwright's `launchOptions.slowMo` paces *input* operations — clicks, fills,
  key presses, locator waits.
- The `game` fixture also paces `page.evaluate`, which slowMo does not touch.
  That matters here because most of this suite's steps go through `evaluate`:
  every `withMods` call, every class-list read, every dispatched click. With only
  slowMo, `--slow` looked like it barely did anything.

Slow mode also **lifts the time budgets** — the per-test timeout, the action
timeout and the expect timeout — including the `test.setTimeout(...)` values
specs set for themselves. Without that a paced run simply times out, which is the
other half of why it used to be unusable. A slow run is being watched by hand, so
stop it with Ctrl-C when you have seen enough.

## Live progress

Both the runner and a direct `playwright test` invocation print progress as it
happens, from `tests/e2e/_harness/progress-reporter.mjs`:

```
── resources ─ 21 tests · 8 workers ────────────────────────────────
  [resources]   5/21  ▶  the Sell button sells exactly the previewed amount
  [resources]   5/21  ✓  the Sell button sells exactly the previewed amount  1.4s  · 3/21 done
  [resources]   6/21  ✕  a second increase costs the new, larger cap         1.8s  · 4/21 done
```

- `▶` is a test starting, `✓`/`✕`/`○` is one finishing.
- `5/21` is the test's index **in start order**, which ties a result line back to
  the `▶` line it belongs to.
- `· 3/21 done` is how far through the area the run actually is. The two numbers
  differ once more than one worker is in flight, which is why both are shown.

Failures are repeated at the end of the area with the first line of the error;
the full diff, trace, screenshot and video are in that area's HTML report.

### Via Playwright directly

```bash
npx playwright test tests/e2e/audio --headed
```

Playwright also has two step-through modes, useful when a spec is actually
failing and you need to see why:

```bash
npx playwright test tests/e2e/audio --debug   # opens the Playwright Inspector, step by step
npx playwright test tests/e2e/audio --ui      # opens the interactive UI runner
```

`--debug` and `--ui` aren't wired through `run-e2e.mjs` — use the direct
Playwright command for those.

---

## Passing extra Playwright flags through the report runner

Anything after a literal `--` is forwarded as-is to `playwright test` for each
area that runs. This is the standard separator convention (same as `npm run
<script> -- --flag`), needed because a flag like `-g` takes a value that doesn't
itself start with `-` and would otherwise be mistaken for an area name.

Run only tests matching a title, inside one area:

```bash
node tests/run-e2e.mjs audio -- -g "background audio"
```

Combine with `--headed` (which is *not* after the `--`, since it's handled by the
runner itself, not forwarded):

```bash
node tests/run-e2e.mjs audio --headed -- -g "background audio"
```

---

## Reports

| Path | What |
|---|---|
| `test-reports/e2e/index.html` | Summary across every area that ran: pass/fail totals, per-area breakdown, an expandable list of every case and whether it passed |
| `test-reports/e2e/<area>/index.html` | The full Playwright HTML report for that area — trace, screenshot and video on failure |
| `test-reports/e2e/<area>/results.json` | Machine-readable results the summary index is built from |

Open the summary after a run:

```bash
npm run test:e2e:report
```

Reports are gitignored and overwritten by the next run of the areas they cover —
running only `audio` does not touch the `achievements` report already on disk, but
the top-level summary index reflects only the most recent invocation's selection.

A failed spec keeps its trace. Open one with:

```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```

(the exact path is printed in the failure output, and linked from the area's own
HTML report).

---

## Quick reference

```bash
node tests/run-e2e.mjs                                   # everything, headless, full report
node tests/run-e2e.mjs audio                              # one area, headless, full report
node tests/run-e2e.mjs audio black-hole                   # several areas
node tests/run-e2e.mjs --headed                           # everything, headed (1 worker)
node tests/run-e2e.mjs audio --headed                     # one area, headed (1 worker)
node tests/run-e2e.mjs audio --headed --slow              # one area, headed, 700ms before each step
node tests/run-e2e.mjs audio -- -g "some title"           # one area, filtered by title
node tests/run-e2e.mjs --list                             # what's available to run

npx playwright test tests/e2e/audio                       # one area, no report wrapper
npx playwright test tests/e2e/audio --headed               # one area, headed, no report wrapper
npx playwright test tests/e2e/audio --debug                # step through interactively
npx playwright test tests/e2e/audio --ui                   # interactive UI runner
```
