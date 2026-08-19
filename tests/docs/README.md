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
- **[known-issues.md](known-issues.md)** — live game bugs the suite found, each
  with a reproduction, the root cause, and the fix or the reason it is by design.
  Open entries are *not* worked around: the spec that meets a live bug fails.

## Current state

**42 of 43 functional areas are green, across 80 spec files and 1,177 specs.**
The one exception is `ascendency`, which is amber: its 12 specs are written and
passing but are still function-level rather than driven through the perk screen.
No area is red.

The suite is maintained area by area, and every green area has been through the
*integration upgrade* — the rule that a spec should play the game rather than
call its functions. What changed in each area, and what each upgrade found, is
written up in [integration-upgrade-report.md](integration-upgrade-report.md).

The most recent work was the interstellar endgame — `fleet-hangar` (29),
`diplomacy` (29) and `colonise` (23) — which are one continuous journey in the
game and are now tested as one: build the hangar, buy the ships, fly to a star,
scan it three quarters of the way there, negotiate with whoever lives in it and,
if that fails, take it, settle it and rebirth into it. Before that, `achievements`
(33) earned all seventy achievements at their own conditions and audited every
reward.

**A live bug is expected to make the suite fail.** Specs are written against the
behaviour the game should have, not the behaviour it currently has, and defects
found this way are fixed in the source rather than absorbed by the test. Of the
42 entries in [known-issues.md](known-issues.md), **39 are fixed** and each names
the regression spec that now guards it, **2 record behaviour that turned out to
be by design** (CSS-only affordability gating, and the terminal end-credits
overlay), and **1 remains open** — `analytics.js` reading localStorage unguarded.

The most severe of the recent finds is #40: a power plant could not be switched
on in any language but English, because the toggle's state rode on its own label
text and the handler read that text back against the English words. Three
defects in that family were closed together — see #40, #41 and #42 — and the
lesson they share is the one #6 first taught: **never key behaviour off rendered
text.** State belongs on the element.

`localization` is the one green area covering a feature that is still only half
built. Its specs deliberately mix absolute assertions with *ratchets* — recorded
baselines that may fall but must never rise — so the outstanding localization
work can land incrementally without losing ground. The feature's own roadmap and
the current ratchet values live in
[`docs/localization/status.md`](../../docs/localization/status.md).

### Where the specs are

| Group | Areas | Green | Specs |
|---|--:|--:|--:|
| Foundation | 6 | 6 | 174 |
| Core Economy | 6 | 6 | 140 |
| Space Operations | 4 | 4 | 137 |
| Interstellar | 7 | 7 | 195 |
| Meta Progression | 6 | 5 | 201 |
| Endgame | 3 | 3 | 98 |
| Simulation & Ambience | 5 | 5 | 138 |
| Presentation & Shell | 6 | 6 | 94 |
| **Total** | **43** | **42** | **1,177** |

[coverage-report.md](coverage-report.md) carries the per-area breakdown: status,
risk, spec count, and a one-line note on what each area's specs actually do. It
is generated from `functional-areas.json`, so it is never out of step with the
source of truth — but the totals in this section are hand-written and want
refreshing whenever an area's `specCount` changes.

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
