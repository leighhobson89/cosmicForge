# Test Documentation

Planning, reporting and how-to for the Cosmic Forge E2E test suite.

## Start here

- **[running-tests.md](running-tests.md)** — how to run the suite: everything, one
  folder, headed or headless.
- **[coverage-report.md](coverage-report.md)** — every functional area, its
  traffic-light status, risk rating and spec count. Read this to see what's
  covered and what isn't.
- **[areas/](areas/)** — one detailed test plan per functional area, with a
  checklist of what should be tested.
- **[known-issues.md](known-issues.md)** — live game bugs the suite found, with
  root cause and the harness workaround in place until each is fixed.

## Current state

26 of 43 functional areas are green — **753 specs**: `antimatter`, `app-boot`,
`audio`, `autobuyers`, `battle`, `black-hole`, `compounds`, `cosmic-rip`,
`cosmicopedia`, `demo-build`, `energy`, `localization`, `onboarding`,
`performance`, `philosophies`, `rebirth`, `research`, `resources`,
`save-load-cloud`, `save-load-local`, `save-migration`, `settings`,
`space-telescope`, `starship`, `statistics`, `technology`.

The three save areas are the most recent to land, and together they close the
last of the Foundation group's high-risk gaps: `save-load-local` (10 specs),
`save-load-cloud` (8) and `save-migration` (11). What is different about them is
written up in
[integration-upgrade-report.md](integration-upgrade-report.md) — in particular
`save-migration`, which reaches the version ladder by *ageing* saves the game
itself produced and importing them through the real button, and which covers
adding a new version by serving a rewritten module through route interception
rather than editing the source on disk.

Thirteen areas are amber — partial coverage, or specs that are still
function-level rather than driven through the game's own controls. Four are red:
`space-mining`, `star-map`, `star-types` and `weather`. The remaining high-risk
gaps are all amber rather than red — `ascendency`, `colonise`, `diplomacy` and
`fleet-hangar` — and all are tracked in
[coverage-report.md](coverage-report.md).

**A live bug is expected to make the suite fail.** Specs are written against the
behaviour the game should have, not the behaviour it currently has, and defects
found this way are fixed in the source rather than absorbed by the test.
Twenty-three have been found and fixed, two entries record behaviour that turned
out to be by design, and one remains open; see
[known-issues.md](known-issues.md), where each closed entry names the regression
spec that now guards it.

`localization` is the one green area covering a feature that is still only half
built. Its specs deliberately mix absolute assertions with *ratchets* — recorded
baselines that may fall but must never rise — so the outstanding localization
work can land incrementally without losing ground. The feature's own roadmap and
the current ratchet values live in
[`docs/localization/status.md`](../../docs/localization/status.md).

## How the coverage plan is maintained

Everything in `areas/` and `coverage-report.md` is **generated**. The source of
truth is a single file:

```
tests/docs/functional-areas.json
```

To change an area's status, risk, summary or test list, edit that file and
regenerate:

```bash
node tests/docs/generate-report.cjs
```

The generator creates any missing `tests/e2e/<area>/` folders and rewrites the
markdown. It never touches spec files you have written.

Keeping the traffic lights in a data file rather than hand-maintained prose is
deliberate: the status of 43 areas changes continuously as specs land, and a
hand-edited table goes stale within a week. When an area's specs are written and
passing, update its `status` and `specCount` in `functional-areas.json` and
regenerate.

## Folder layout

```
tests/
  docs/                     this folder — planning, reporting, how-to
    functional-areas.json     source of truth, edit this
    generate-report.cjs       regenerates the reports and folders
    coverage-report.md        generated summary
    running-tests.md          how to run the suite
    known-issues.md           live bugs the suite found
    areas/<area>.md           generated per-area test plan
  e2e/
    _harness/                 shared Playwright fixture, static server
    <area>/                   spec folder per functional area
  run-e2e.mjs                 per-area runner + summary report builder
```

## Writing specs

Full conventions, the shared `game` fixture API, and — most importantly — how to
use the game's own debug tooling for scenario setup, are documented in
**[`../e2e/README.md`](../e2e/README.md)**. Read that before writing a new area's
specs; it covers real pitfalls already hit (localization keys resolve through
`descriptions.js`, not `localization.json`; don't assert on the live
`timerManagerDelta` while `gameLoop` is driving it; use the debug menu instead of
hand-seeding state wherever it covers the scenario).

## Status definitions

| | Meaning |
|:--:|---|
| 🔴 RED | No automated coverage. A regression here ships unnoticed. |
| 🟠 AMBER | Partial — a smoke test proves the path exists, but branches, failure modes and edge cases are unverified. |
| 🟢 GREEN | Comprehensive — happy path, branches, boundaries and failure modes all asserted. |
