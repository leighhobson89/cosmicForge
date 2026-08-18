# Cosmic Forge — E2E Coverage Report

_Generated from `functional-areas.json`. Re-run `node tests/docs/generate-report.cjs` after editing._

## Coverage at a glance

One line per functional area, worst first. 26 green, 13 amber, 4 red, out of 43.

| | Area | Group | Risk | Specs | Where it stands |
|:--:|---|---|:--:|--:|---|
| 🔴 | [Space Mining & Asteroids](areas/space-mining.md) | Space Operations | Medium | — | No spec file yet. |
| 🔴 | [Star Map & Star Data](areas/star-map.md) | Interstellar | Medium | — | No spec file yet. |
| 🔴 | [Star Type Bonuses](areas/star-types.md) | Interstellar | Medium | — | No spec file yet. |
| 🔴 | [Weather](areas/weather.md) | Simulation & Ambience | Low | — | No spec file yet. |
| 🟠 | [Achievements](areas/achievements.md) | Meta Progression | Low | 12 | 12 specs written; not yet upgraded to integration. |
| 🟠 | [Ascendency Points & Perks](areas/ascendency.md) | Meta Progression | High | 12 | 12 specs written; not yet upgraded to integration. |
| 🟠 | [Colonisation](areas/colonise.md) | Interstellar | High | 19 | 19 specs written; not yet upgraded to integration. |
| 🟠 | [Diplomacy](areas/diplomacy.md) | Interstellar | High | 12 | 12 specs written; not yet upgraded to integration. |
| 🟠 | [Fleet Hangar](areas/fleet-hangar.md) | Interstellar | High | 14 | 14 specs written; not yet upgraded to integration. |
| 🟠 | [Galactic Casino](areas/galactic-casino.md) | Meta Progression | Medium | 46 | 46 specs written; not yet upgraded to integration. |
| 🟠 | [Galactic Market](areas/galactic-market.md) | Meta Progression | Medium | 17 | 17 specs written; not yet upgraded to integration. |
| 🟠 | [Megastructures](areas/megastructures.md) | Endgame | Medium | 18 | 18 specs written; not yet upgraded to integration. |
| 🟠 | [News Ticker](areas/news-ticker.md) | Simulation & Ambience | Low | 18 | 18 specs written; not yet upgraded to integration. |
| 🟠 | [Number Notation](areas/notation.md) | Presentation & Shell | Medium | 11 | 11 specs written; not yet upgraded to integration. |
| 🟠 | [Random Events](areas/random-events.md) | Simulation & Ambience | Medium | 21 | 21 specs written; not yet upgraded to integration. |
| 🟠 | [Rockets & Launch Pad](areas/rockets.md) | Space Operations | Medium | 20 | 20 specs written; not yet upgraded to integration. |
| 🟠 | [UI Navigation](areas/ui-navigation.md) | Presentation & Shell | Medium | 5 | 5 specs written; not yet upgraded to integration. |
| 🟢 | [Antimatter](areas/antimatter.md) | Space Operations | Medium | 26 | Done — driven through its own controls, 26 specs passing. |
| 🟢 | [Application Boot](areas/app-boot.md) | Foundation | High | 11 | Done — driven through its own controls, 11 specs passing. |
| 🟢 | [Audio](areas/audio.md) | Simulation & Ambience | Low | 13 | Done — driven through its own controls, 13 specs passing. |
| 🟢 | [Auto Buyers](areas/autobuyers.md) | Core Economy | High | 19 | Done — driven through its own controls, 19 specs passing. |
| 🟢 | [Battle & Conquest](areas/battle.md) | Interstellar | High | 17 | Done — driven through its own controls, 17 specs passing. |
| 🟢 | [Black Hole Time Warp](areas/black-hole.md) | Endgame | High | 19 | Done — driven through its own controls, 19 specs passing. |
| 🟢 | [Cloud Save & Load](areas/save-load-cloud.md) | Foundation | High | 8 | Done — driven through its own controls, 8 specs passing. |
| 🟢 | [Compounds & Crafting](areas/compounds.md) | Core Economy | High | 31 | Done — driven through its own controls, 31 specs passing. |
| 🟢 | [Cosmic Rip](areas/cosmic-rip.md) | Endgame | Medium | 28 | Done — driven through its own controls, 28 specs passing. |
| 🟢 | [Cosmicopedia & Help](areas/cosmicopedia.md) | Presentation & Shell | Low | 6 | Done — driven through its own controls, 6 specs passing. |
| 🟢 | [Demo Build Lockdowns](areas/demo-build.md) | Presentation & Shell | High | 19 | Done — driven through its own controls, 19 specs passing. |
| 🟢 | [Energy & Power Grid](areas/energy.md) | Core Economy | High | 26 | Done — driven through its own controls, 26 specs passing. |
| 🟢 | [Local Save & Load](areas/save-load-local.md) | Foundation | High | 10 | Done — driven through its own controls, 10 specs passing. |
| 🟢 | [Localization](areas/localization.md) | Foundation | High | 91 | Done — driven through its own controls, 91 specs passing. |
| 🟢 | [Onboarding & Tutorial](areas/onboarding.md) | Presentation & Shell | High | 13 | Done — driven through its own controls, 13 specs passing. |
| 🟢 | [Performance & Frame Budget](areas/performance.md) | Presentation & Shell | High | 10 | Done — driven through its own controls, 10 specs passing. |
| 🟢 | [Philosophies](areas/philosophies.md) | Meta Progression | High | 42 | Done — driven through its own controls, 42 specs passing. |
| 🟢 | [Rebirth](areas/rebirth.md) | Meta Progression | High | 10 | Done — driven through its own controls, 10 specs passing. |
| 🟢 | [Research](areas/research.md) | Core Economy | High | 25 | Done — driven through its own controls, 25 specs passing. |
| 🟢 | [Resources](areas/resources.md) | Core Economy | High | 21 | Done — driven through its own controls, 21 specs passing. |
| 🟢 | [Save Migration](areas/save-migration.md) | Foundation | High | 11 | Done — driven through its own controls, 11 specs passing. |
| 🟢 | [Settings & Preferences](areas/settings.md) | Foundation | Medium | 20 | Done — driven through its own controls, 20 specs passing. |
| 🟢 | [Space Telescope](areas/space-telescope.md) | Space Operations | Medium | 10 | Done — driven through its own controls, 10 specs passing. |
| 🟢 | [Starship](areas/starship.md) | Interstellar | High | 8 | Done — driven through its own controls, 8 specs passing. |
| 🟢 | [Statistics](areas/statistics.md) | Simulation & Ambience | Low | 16 | Done — driven through its own controls, 16 specs passing. |
| 🟢 | [Tech Tree](areas/technology.md) | Core Economy | High | 18 | Done — driven through its own controls, 18 specs passing. |

---

## What the lights mean

| | Meaning |
|:--:|---|
| 🔴 RED | No spec file exists for this area at all. A regression here ships unnoticed. |
| 🟠 AMBER | A spec file exists, but the area has not yet been through the integration upgrade — some of its coverage is still function-level rather than played through the UI. |
| 🟢 GREEN | Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes. |

**Green is a sign-off, not a spec count.** An area goes green only once it is played
through its real controls rather than by calling its exported functions, its rules
are asserted by measurement rather than by reading fields back, and the whole area
passes. An area with plenty of specs that still reaches into `withMods` to do its
work stays amber — that is exactly the state the integration upgrade exists to fix.
See [integration-upgrade-report.md](integration-upgrade-report.md) for what changes
when an area is upgraded.

## Totals

| | Areas | Share |
|---|---:|---:|
| 🔴 Red — no spec file | 4 | 9% |
| 🟠 Amber — spec written, not yet upgraded | 13 | 30% |
| 🟢 Green — signed off | 26 | 60% |
| **Total functional areas** | **43** | |

464 individual test cases are identified across all areas. **753 Playwright specs are implemented** across 39 areas, and all of them pass except where an area's note says otherwise — a spec that fails on a live defect is left failing on purpose, and the defect is written up in [known-issues.md](known-issues.md).

Run them with `npm run test:e2e` (all areas) or `node tests/run-e2e.mjs <area>`. Each area writes its own HTML report to `test-reports/e2e/<area>/index.html`, with a summary index at `test-reports/e2e/index.html`.

## Highest priority — high risk, no spec file

These 0 areas would each cause serious, often unrecoverable player harm if they regressed, and none has any automated test today.

| Area | Group | Why it matters |
|---|---|---|

## All areas by group

### Foundation

Boot, persistence and the machinery every other area depends on. A failure here is total, not partial.

| Status | Area | Risk | Planned | Specs | Existing coverage |
|:--:|---|:--:|--:|--:|---|
| 🟢 | [Application Boot](areas/app-boot.md) | High | 6 | **11** | launch-app.test.js |
| 🟢 | [Local Save & Load](areas/save-load-local.md) | High | 8 | **10** | — |
| 🟢 | [Cloud Save & Load](areas/save-load-cloud.md) | High | 8 | **8** | autobuyer.test.js, earlyLoop.test.js, energyMid.test.js, researchTech.test.js, spaceAntimatter.test.js |
| 🟢 | [Save Migration](areas/save-migration.md) | High | 9 | **11** | — |
| 🟢 | [Localization](areas/localization.md) | High | 23 | **91** | — |
| 🟢 | [Settings & Preferences](areas/settings.md) | Medium | 20 | **20** | — |

### Core Economy

The minute-to-minute loop: extract, craft, power, research. Where players spend most of their time.

| Status | Area | Risk | Planned | Specs | Existing coverage |
|:--:|---|:--:|--:|--:|---|
| 🟢 | [Resources](areas/resources.md) | High | 21 | **21** | earlyLoop.test.js |
| 🟢 | [Compounds & Crafting](areas/compounds.md) | High | 30 | **31** | — |
| 🟢 | [Auto Buyers](areas/autobuyers.md) | High | 18 | **19** | autobuyer.test.js |
| 🟢 | [Energy & Power Grid](areas/energy.md) | High | 7 | **26** | energyMid.test.js |
| 🟢 | [Research](areas/research.md) | High | 21 | **25** | researchTech.test.js |
| 🟢 | [Tech Tree](areas/technology.md) | High | 18 | **18** | researchTech.test.js |

### Space Operations

Mid-game expansion off-planet — asteroids, rockets, antimatter and the telescope.

| Status | Area | Risk | Planned | Specs | Existing coverage |
|:--:|---|:--:|--:|--:|---|
| 🔴 | [Space Mining & Asteroids](areas/space-mining.md) | Medium | 6 | — | — |
| 🟠 | [Rockets & Launch Pad](areas/rockets.md) | Medium | 15 | **20** | — |
| 🟢 | [Antimatter](areas/antimatter.md) | Medium | 26 | **26** | spaceAntimatter.test.js |
| 🟢 | [Space Telescope](areas/space-telescope.md) | Medium | 10 | **10** | — |

### Interstellar

Travel, conquest and settlement. The most stateful and branch-heavy part of the game.

| Status | Area | Risk | Planned | Specs | Existing coverage |
|:--:|---|:--:|--:|--:|---|
| 🔴 | [Star Map & Star Data](areas/star-map.md) | Medium | 5 | — | — |
| 🔴 | [Star Type Bonuses](areas/star-types.md) | Medium | 6 | — | — |
| 🟢 | [Starship](areas/starship.md) | High | 10 | **8** | — |
| 🟠 | [Fleet Hangar](areas/fleet-hangar.md) | High | 9 | **14** | — |
| 🟠 | [Diplomacy](areas/diplomacy.md) | High | 6 | **12** | — |
| 🟢 | [Battle & Conquest](areas/battle.md) | High | 6 | **17** | — |
| 🟠 | [Colonisation](areas/colonise.md) | High | 8 | **19** | — |

### Meta Progression

Cross-run systems. Bugs here destroy player progress permanently, which makes them the highest-consequence area in the game.

| Status | Area | Risk | Planned | Specs | Existing coverage |
|:--:|---|:--:|--:|--:|---|
| 🟠 | [Galactic Market](areas/galactic-market.md) | Medium | 7 | **17** | — |
| 🟠 | [Ascendency Points & Perks](areas/ascendency.md) | High | 6 | **12** | — |
| 🟠 | [Galactic Casino](areas/galactic-casino.md) | Medium | 8 | **46** | — |
| 🟢 | [Rebirth](areas/rebirth.md) | High | 10 | **10** | — |
| 🟢 | [Philosophies](areas/philosophies.md) | High | 13 | **42** | — |
| 🟠 | [Achievements](areas/achievements.md) | Low | 8 | **12** | — |

### Endgame

Late systems reached by few players but heavily interlinked with everything before them.

| Status | Area | Risk | Planned | Specs | Existing coverage |
|:--:|---|:--:|--:|--:|---|
| 🟢 | [Black Hole Time Warp](areas/black-hole.md) | High | 7 | **19** | — |
| 🟠 | [Megastructures](areas/megastructures.md) | Medium | 7 | **18** | captureMegaStructureTest.test.js |
| 🟢 | [Cosmic Rip](areas/cosmic-rip.md) | Medium | 17 | **28** | — |

### Simulation & Ambience

Background systems that modify the economy or the presentation without direct player input.

| Status | Area | Risk | Planned | Specs | Existing coverage |
|:--:|---|:--:|--:|--:|---|
| 🔴 | [Weather](areas/weather.md) | Low | 6 | — | — |
| 🟠 | [Random Events](areas/random-events.md) | Medium | 8 | **21** | — |
| 🟠 | [News Ticker](areas/news-ticker.md) | Low | 4 | **18** | — |
| 🟢 | [Audio](areas/audio.md) | Low | 5 | **13** | — |
| 🟢 | [Statistics](areas/statistics.md) | Low | 16 | **16** | — |

### Presentation & Shell

Navigation, tutorial, formatting and build variants. Highly visible, cheap to test, currently untested.

| Status | Area | Risk | Planned | Specs | Existing coverage |
|:--:|---|:--:|--:|--:|---|
| 🟠 | [Number Notation](areas/notation.md) | Medium | 7 | **11** | — |
| 🟠 | [UI Navigation](areas/ui-navigation.md) | Medium | 11 | **5** | launch-app.test.js |
| 🟢 | [Onboarding & Tutorial](areas/onboarding.md) | High | 7 | **13** | launchAndOnboard.test.js |
| 🟢 | [Cosmicopedia & Help](areas/cosmicopedia.md) | Low | 5 | **6** | — |
| 🟢 | [Demo Build Lockdowns](areas/demo-build.md) | High | 9 | **19** | — |
| 🟢 | [Performance & Frame Budget](areas/performance.md) | High | 7 | **10** | — |

## Folder layout

```
tests/
  docs/                     this report and the per-area plans
    functional-areas.json   source of truth — edit this
    generate-report.cjs     regenerates everything below from it
    coverage-report.md      generated summary (this file)
    areas/<area>.md         generated per-area test plan
  e2e/<area>/               spec folder per functional area
  legacy/                   pre-existing smoke tests, retained and still running
  setup.js                  jest setup, referenced by jest.config.js
```
