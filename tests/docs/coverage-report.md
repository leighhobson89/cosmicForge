# Cosmic Forge — E2E Coverage Report

_Generated from `functional-areas.json`. Re-run `node tests/docs/generate-report.cjs` after editing._

## Coverage at a glance

One line per functional area, worst first. 44 green, 0 amber, 0 red, out of 44.

| | Area | Group | Risk | Specs | Where it stands |
|:--:|---|---|:--:|--:|---|
| 🟢 | [Achievements](areas/achievements.md) | Meta Progression | Low | 33 | Upgraded to integration and swept end to end: all seventy achievements are earned at their own condition and their reward audited against the arithmetic the data promises, the playable scenarios are played and granted by the frame loop, two rebirths audit what persists, and the pane is checked across 630 artwork files and six languages. The area found known-issues #37, now fixed at source: the pane installed a fresh tooltip element and three more document listeners on every visit. |
| 🟢 | [Antimatter](areas/antimatter.md) | Space Operations | Medium | 26 | Done — driven through its own controls, 26 specs passing. |
| 🟢 | [Application Boot](areas/app-boot.md) | Foundation | High | 11 | Done — driven through its own controls, 11 specs passing. |
| 🟢 | [Ascendency Points & Perks](areas/ascendency.md) | Meta Progression | High | 20 | Done — driven through its own controls, 20 specs passing. |
| 🟢 | [Audio](areas/audio.md) | Simulation & Ambience | Low | 13 | Done — driven through its own controls, 13 specs passing. |
| 🟢 | [Auto Buyers](areas/autobuyers.md) | Core Economy | High | 19 | Done — driven through its own controls, 19 specs passing. |
| 🟢 | [Battle & Conquest](areas/battle.md) | Interstellar | High | 18 | Done — driven through its own controls, 18 specs passing. |
| 🟢 | [Black Hole Time Warp](areas/black-hole.md) | Endgame | High | 19 | Done — driven through its own controls, 19 specs passing. |
| 🟢 | [Cloud Save & Load](areas/save-load-cloud.md) | Foundation | High | 8 | Done — driven through its own controls, 8 specs passing. |
| 🟢 | [Colonisation](areas/colonise.md) | Interstellar | High | 23 | Upgraded to integration: a real battle is won on the canvas and followed all the way through a rebirth — the achievements granted, the ascendency points paid (twice the star's, plus what the achievements it unlocked pay), the settled list growing at rebirth rather than at victory, the galactic point earned, and the system left behind drawn on the star map as settled. 23 specs passing. |
| 🟢 | [Compounds & Crafting](areas/compounds.md) | Core Economy | High | 31 | Done — driven through its own controls, 31 specs passing. |
| 🟢 | [Cosmic Rip](areas/cosmic-rip.md) | Endgame | Medium | 28 | Done — driven through its own controls, 28 specs passing. |
| 🟢 | [Cosmicopedia & Help](areas/cosmicopedia.md) | Presentation & Shell | Low | 6 | Done — driven through its own controls, 6 specs passing. |
| 🟢 | [Demo Build Lockdowns](areas/demo-build.md) | Presentation & Shell | High | 19 | Done — driven through its own controls, 19 specs passing. |
| 🟢 | [Diplomacy](areas/diplomacy.md) | Interstellar | High | 30 | Upgraded to integration: a real starship flies to a real star, the scan gate is crossed at three quarters of the journey, and every conversation is held through the pane's own buttons. The outcome coverage is written as sweeps that repeat a press until every documented outcome is reached and assert the consequences of each one along the way. The area found known-issues #38 and #39, both fixed at source: the vassalize gate compared a trait array to a trait name, and taking offence at a passive approach never actually ended the system's patience. 29 specs passing. |
| 🟢 | [Energy & Power Grid](areas/energy.md) | Core Economy | High | 26 | Done — driven through its own controls, 26 specs passing. |
| 🟢 | [Fleet Hangar](areas/fleet-hangar.md) | Interstellar | High | 29 | Upgraded to integration: the hangar module is proved to be the gate on shipbuilding by finishing the other three starship modules and leaving it out, then every class is bought through its own Build button and its bill and price escalation measured to the unit. The envoy cap is asserted as the CSS gate it is rather than by clicking a disabled button. 29 specs passing. |
| 🟢 | [Galactic Casino](areas/galactic-casino.md) | Meta Progression | Medium | 69 | Done — driven through its own controls, 69 specs passing. |
| 🟢 | [Galactic Market](areas/galactic-market.md) | Meta Progression | Medium | 35 | Done — driven through its own controls, 35 specs passing. |
| 🟢 | [Local Save & Load](areas/save-load-local.md) | Foundation | High | 10 | Done — driven through its own controls, 10 specs passing. |
| 🟢 | [Localization](areas/localization.md) | Foundation | High | 114 | Done — driven through its own controls, 114 specs passing. |
| 🟢 | [Megastructures](areas/megastructures.md) | Endgame | Medium | 51 | Done — the manuscripts are rolled by studying stars through the game's own tooling, the stages are bought through the real Technology rows, and every bonus is measured off the store, the grid or the rock rather than read back off a multiplier. The battle at a factory star is not re-fought here; that belongs to the Battle area, and this file drives the conquest handler every access point funnels into. |
| 🟢 | [News Ticker](areas/news-ticker.md) | Simulation & Ambience | Low | 26 | Done — driven through its own controls, 26 specs passing. |
| 🟢 | [Number Notation](areas/notation.md) | Presentation & Shell | Medium | 22 | Upgraded to integration — the setting is driven through its own dropdown and every screen is swept in both modes. The 3 specs that were failing found known-issues #26 and #27, both now fixed at source. |
| 🟢 | [Offline Gains](areas/offline-gains.md) | Foundation | High | 18 | Done — driven through its own controls, 18 specs passing. |
| 🟢 | [Onboarding & Tutorial](areas/onboarding.md) | Presentation & Shell | High | 13 | Done — driven through its own controls, 13 specs passing. |
| 🟢 | [Performance & Frame Budget](areas/performance.md) | Presentation & Shell | High | 10 | Done — driven through its own controls, 10 specs passing. |
| 🟢 | [Philosophies](areas/philosophies.md) | Meta Progression | High | 42 | Done — driven through its own controls, 42 specs passing. |
| 🟢 | [Random Events](areas/random-events.md) | Simulation & Ambience | Medium | 52 | Done — driven through its own controls, 52 specs passing. |
| 🟢 | [Rebirth](areas/rebirth.md) | Meta Progression | High | 10 | Done — driven through its own controls, 10 specs passing. |
| 🟢 | [Research](areas/research.md) | Core Economy | High | 25 | Done — driven through its own controls, 25 specs passing. |
| 🟢 | [Resources](areas/resources.md) | Core Economy | High | 21 | Done — driven through its own controls, 21 specs passing. |
| 🟢 | [Rockets & Launch Pad](areas/rockets.md) | Space Operations | Medium | 57 | Done — the launch pad and all four rockets are bought part by part through their own buttons, renamed in the header field, fuelled by pressing Fuel and flown twice over, so the reset is proved by the second journey rather than by reading state back. The area found known-issues #36, now fixed at source: the notation formatter was rewriting the digits inside an asteroid's name. |
| 🟢 | [Save Migration](areas/save-migration.md) | Foundation | High | 11 | Done — driven through its own controls, 11 specs passing. |
| 🟢 | [Settings & Preferences](areas/settings.md) | Foundation | Medium | 20 | Done — driven through its own controls, 20 specs passing. |
| 🟢 | [Space Mining & Asteroids](areas/space-mining.md) | Space Operations | Medium | 44 | Done — the survey, both panels, the boost gesture and a full outbound-and-home journey driven through their own controls, 44 specs passing. Found and closed known-issues #31 and #34. |
| 🟢 | [Space Telescope](areas/space-telescope.md) | Space Operations | Medium | 10 | Done — driven through its own controls, 10 specs passing. |
| 🟢 | [Star Map & Star Data](areas/star-map.md) | Interstellar | Medium | 62 | Done — the map, the search, the drawings and the Star Data table are all driven through their own controls, and the drawings are checked as geometry rather than as presence. The distance spec found known-issues #35, which is now fixed at source: star coordinates come from a fixed nominal field instead of the measured container, so the drawn map and the calculation path agree. |
| 🟢 | [Star Type Bonuses](areas/star-types.md) | Interstellar | Medium | 25 | Done — the B, F and O effects are measured off the stores, the grid and the rocks rather than read off a multiplier, and A, G, K and M are each proven inert against the same three measurements so a future bonus cannot be wired to the wrong letter unnoticed. |
| 🟢 | [Starship](areas/starship.md) | Interstellar | High | 8 | Done — driven through its own controls, 8 specs passing. |
| 🟢 | [Statistics](areas/statistics.md) | Simulation & Ambience | Low | 16 | Done — driven through its own controls, 16 specs passing. |
| 🟢 | [Tech Tree](areas/technology.md) | Core Economy | High | 18 | Done — driven through its own controls, 18 specs passing. |
| 🟢 | [UI Navigation](areas/ui-navigation.md) | Presentation & Shell | Medium | 24 | Done — driven through its own controls, 24 specs passing. |
| 🟢 | [Weather](areas/weather.md) | Simulation & Ambience | Low | 34 | Done — every state reached through the game's own weighted draw and the solar penalty measured off the grid, 34 specs passing. Found and closed known-issues #31, #33 and #46. |

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
| 🔴 Red — no spec file | 0 | 0% |
| 🟠 Amber — spec written, not yet upgraded | 0 | 0% |
| 🟢 Green — signed off | 44 | 100% |
| **Total functional areas** | **44** | |

667 individual test cases are identified across all areas. **1206 Playwright specs are implemented** across 44 areas, and all of them pass except where an area's note says otherwise — a spec that fails on a live defect is left failing on purpose, and the defect is written up in [known-issues.md](known-issues.md).

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
| 🟢 | [Offline Gains](areas/offline-gains.md) | High | 9 | **18** | — |
| 🟢 | [Localization](areas/localization.md) | High | 32 | **114** | — |
| 🟢 | [Settings & Preferences](areas/settings.md) | Medium | 20 | **20** | — |

### Core Economy

The minute-to-minute loop: extract, craft, power, research. Where players spend most of their time.

| Status | Area | Risk | Planned | Specs | Existing coverage |
|:--:|---|:--:|--:|--:|---|
| 🟢 | [Resources](areas/resources.md) | High | 21 | **21** | earlyLoop.test.js |
| 🟢 | [Compounds & Crafting](areas/compounds.md) | High | 32 | **31** | — |
| 🟢 | [Auto Buyers](areas/autobuyers.md) | High | 18 | **19** | autobuyer.test.js |
| 🟢 | [Energy & Power Grid](areas/energy.md) | High | 7 | **26** | energyMid.test.js |
| 🟢 | [Research](areas/research.md) | High | 21 | **25** | researchTech.test.js |
| 🟢 | [Tech Tree](areas/technology.md) | High | 18 | **18** | researchTech.test.js |

### Space Operations

Mid-game expansion off-planet — asteroids, rockets, antimatter and the telescope.

| Status | Area | Risk | Planned | Specs | Existing coverage |
|:--:|---|:--:|--:|--:|---|
| 🟢 | [Space Mining & Asteroids](areas/space-mining.md) | Medium | 18 | **44** | — |
| 🟢 | [Rockets & Launch Pad](areas/rockets.md) | Medium | 43 | **57** | — |
| 🟢 | [Antimatter](areas/antimatter.md) | Medium | 26 | **26** | spaceAntimatter.test.js |
| 🟢 | [Space Telescope](areas/space-telescope.md) | Medium | 10 | **10** | — |

### Interstellar

Travel, conquest and settlement. The most stateful and branch-heavy part of the game.

| Status | Area | Risk | Planned | Specs | Existing coverage |
|:--:|---|:--:|--:|--:|---|
| 🟢 | [Star Map & Star Data](areas/star-map.md) | Medium | 27 | **62** | — |
| 🟢 | [Star Type Bonuses](areas/star-types.md) | Medium | 15 | **25** | — |
| 🟢 | [Starship](areas/starship.md) | High | 10 | **8** | — |
| 🟢 | [Fleet Hangar](areas/fleet-hangar.md) | High | 15 | **29** | — |
| 🟢 | [Diplomacy](areas/diplomacy.md) | High | 15 | **30** | — |
| 🟢 | [Battle & Conquest](areas/battle.md) | High | 7 | **18** | — |
| 🟢 | [Colonisation](areas/colonise.md) | High | 14 | **23** | — |

### Meta Progression

Cross-run systems. Bugs here destroy player progress permanently, which makes them the highest-consequence area in the game.

| Status | Area | Risk | Planned | Specs | Existing coverage |
|:--:|---|:--:|--:|--:|---|
| 🟢 | [Galactic Market](areas/galactic-market.md) | Medium | 13 | **35** | — |
| 🟢 | [Ascendency Points & Perks](areas/ascendency.md) | High | 11 | **20** | — |
| 🟢 | [Galactic Casino](areas/galactic-casino.md) | Medium | 11 | **69** | — |
| 🟢 | [Rebirth](areas/rebirth.md) | High | 10 | **10** | — |
| 🟢 | [Philosophies](areas/philosophies.md) | High | 13 | **42** | — |
| 🟢 | [Achievements](areas/achievements.md) | Low | 14 | **33** | — |

### Endgame

Late systems reached by few players but heavily interlinked with everything before them.

| Status | Area | Risk | Planned | Specs | Existing coverage |
|:--:|---|:--:|--:|--:|---|
| 🟢 | [Black Hole Time Warp](areas/black-hole.md) | High | 7 | **19** | — |
| 🟢 | [Megastructures](areas/megastructures.md) | Medium | 36 | **51** | captureMegaStructureTest.test.js |
| 🟢 | [Cosmic Rip](areas/cosmic-rip.md) | Medium | 17 | **28** | — |

### Simulation & Ambience

Background systems that modify the economy or the presentation without direct player input.

| Status | Area | Risk | Planned | Specs | Existing coverage |
|:--:|---|:--:|--:|--:|---|
| 🟢 | [Weather](areas/weather.md) | Low | 18 | **34** | — |
| 🟢 | [Random Events](areas/random-events.md) | Medium | 13 | **52** | — |
| 🟢 | [News Ticker](areas/news-ticker.md) | Low | 12 | **26** | — |
| 🟢 | [Audio](areas/audio.md) | Low | 5 | **13** | — |
| 🟢 | [Statistics](areas/statistics.md) | Low | 16 | **16** | — |

### Presentation & Shell

Navigation, tutorial, formatting and build variants. Highly visible, cheap to test, currently untested.

| Status | Area | Risk | Planned | Specs | Existing coverage |
|:--:|---|:--:|--:|--:|---|
| 🟢 | [Number Notation](areas/notation.md) | Medium | 16 | **22** | — |
| 🟢 | [UI Navigation](areas/ui-navigation.md) | Medium | 18 | **24** | launch-app.test.js |
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
