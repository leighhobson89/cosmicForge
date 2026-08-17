# Cosmic Forge — E2E Coverage Report

_Generated from `functional-areas.json`. Re-run `node tests/docs/generate-report.cjs` after editing._

## Summary

| | Areas | Share |
|---|---:|---:|
| 🔴 Red — no coverage | 20 | 47% |
| 🟠 Amber — partial / smoke only | 7 | 16% |
| 🟢 Green — comprehensive | 16 | 37% |
| **Total functional areas** | **43** | |

277 individual test cases are identified across all areas. **264 Playwright specs are implemented and passing** across 16 areas. The 7 amber areas are covered only by legacy smoke tests, which prove a path exists but assert almost nothing about branches, boundaries or failure modes.

Run them with `npm run test:e2e` (all areas) or `node tests/run-e2e.mjs <area>`. Each area writes its own HTML report to `test-reports/e2e/<area>/index.html`, with a summary index at `test-reports/e2e/index.html`.

## Highest priority — high risk, zero coverage

These 7 areas would each cause serious, often unrecoverable player harm if they regressed, and none has any automated test today.

| Area | Group | Why it matters |
|---|---|---|
| [Local Save & Load](areas/save-load-local.md) | Foundation | Export/import of save strings, autosave scheduling, and round-trip fidelity of every persisted field. |
| [Save Migration](areas/save-migration.md) | Foundation | The patches.js version ladder that upgrades old saves. The best-engineered code in the project and entirely untested. |
| [Starship](areas/starship.md) | Interstellar | Starship construction, fitting, fuelling and interstellar travel to a chosen destination. |
| [Fleet Hangar](areas/fleet-hangar.md) | Interstellar | Fleet construction, ship classes and the aggregate strength calculation that feeds battle. |
| [Rebirth](areas/rebirth.md) | Meta Progression | The prestige reset. The single most destructive operation in the game if it misbehaves. |
| [Philosophies](areas/philosophies.md) | Meta Progression | The four permanent player paths chosen once and affecting the whole account thereafter. |
| [Performance & Frame Budget](areas/performance.md) | Presentation & Shell | Frame-loop cost and long-session stability. Not a feature, but the area most likely to degrade silently as content grows. |

## All areas by group

### Foundation

Boot, persistence and the machinery every other area depends on. A failure here is total, not partial.

| Status | Area | Risk | Planned | Specs | Existing coverage |
|:--:|---|:--:|--:|--:|---|
| 🟢 | [Application Boot](areas/app-boot.md) | High | 6 | **11** | launch-app.test.js |
| 🔴 | [Local Save & Load](areas/save-load-local.md) | High | 7 | — | — |
| 🟠 | [Cloud Save & Load](areas/save-load-cloud.md) | High | 6 | — | autobuyer.test.js, earlyLoop.test.js, energyMid.test.js, researchTech.test.js, spaceAntimatter.test.js |
| 🔴 | [Save Migration](areas/save-migration.md) | High | 6 | — | — |
| 🟢 | [Localization](areas/localization.md) | High | 23 | **91** | — |
| 🔴 | [Settings & Preferences](areas/settings.md) | Medium | 6 | — | — |

### Core Economy

The minute-to-minute loop: extract, craft, power, research. Where players spend most of their time.

| Status | Area | Risk | Planned | Specs | Existing coverage |
|:--:|---|:--:|--:|--:|---|
| 🟠 | [Resources](areas/resources.md) | High | 7 | — | earlyLoop.test.js |
| 🟢 | [Compounds & Crafting](areas/compounds.md) | High | 6 | **11** | — |
| 🟢 | [Auto Buyers](areas/autobuyers.md) | High | 7 | **10** | autobuyer.test.js |
| 🟢 | [Energy & Power Grid](areas/energy.md) | High | 7 | **15** | energyMid.test.js |
| 🟠 | [Research](areas/research.md) | High | 5 | — | researchTech.test.js |
| 🟠 | [Tech Tree](areas/technology.md) | High | 6 | — | researchTech.test.js |

### Space Operations

Mid-game expansion off-planet — asteroids, rockets, antimatter and the telescope.

| Status | Area | Risk | Planned | Specs | Existing coverage |
|:--:|---|:--:|--:|--:|---|
| 🔴 | [Space Mining & Asteroids](areas/space-mining.md) | Medium | 6 | — | — |
| 🔴 | [Rockets & Launch Pad](areas/rockets.md) | Medium | 6 | — | — |
| 🟢 | [Antimatter](areas/antimatter.md) | Medium | 5 | **12** | spaceAntimatter.test.js |
| 🔴 | [Space Telescope](areas/space-telescope.md) | Medium | 6 | — | — |

### Interstellar

Travel, conquest and settlement. The most stateful and branch-heavy part of the game.

| Status | Area | Risk | Planned | Specs | Existing coverage |
|:--:|---|:--:|--:|--:|---|
| 🔴 | [Star Map & Star Data](areas/star-map.md) | Medium | 5 | — | — |
| 🔴 | [Star Type Bonuses](areas/star-types.md) | Medium | 6 | — | — |
| 🔴 | [Starship](areas/starship.md) | High | 7 | — | — |
| 🔴 | [Fleet Hangar](areas/fleet-hangar.md) | High | 6 | — | — |
| 🟢 | [Diplomacy](areas/diplomacy.md) | High | 6 | **12** | — |
| 🟢 | [Battle & Conquest](areas/battle.md) | High | 6 | **13** | — |
| 🟢 | [Colonisation](areas/colonise.md) | High | 5 | **11** | — |

### Meta Progression

Cross-run systems. Bugs here destroy player progress permanently, which makes them the highest-consequence area in the game.

| Status | Area | Risk | Planned | Specs | Existing coverage |
|:--:|---|:--:|--:|--:|---|
| 🔴 | [Galactic Market](areas/galactic-market.md) | Medium | 6 | — | — |
| 🟢 | [Ascendency Points & Perks](areas/ascendency.md) | High | 6 | **12** | — |
| 🔴 | [Galactic Casino](areas/galactic-casino.md) | Medium | 7 | — | — |
| 🔴 | [Rebirth](areas/rebirth.md) | High | 6 | — | — |
| 🔴 | [Philosophies](areas/philosophies.md) | High | 5 | — | — |
| 🟢 | [Achievements](areas/achievements.md) | Low | 6 | **9** | — |

### Endgame

Late systems reached by few players but heavily interlinked with everything before them.

| Status | Area | Risk | Planned | Specs | Existing coverage |
|:--:|---|:--:|--:|--:|---|
| 🟢 | [Black Hole Time Warp](areas/black-hole.md) | High | 7 | **12** | — |
| 🟠 | [Megastructures](areas/megastructures.md) | Medium | 6 | — | captureMegaStructureTest.test.js |
| 🟢 | [Cosmic Rip](areas/cosmic-rip.md) | Medium | 7 | **13** | — |

### Simulation & Ambience

Background systems that modify the economy or the presentation without direct player input.

| Status | Area | Risk | Planned | Specs | Existing coverage |
|:--:|---|:--:|--:|--:|---|
| 🔴 | [Weather](areas/weather.md) | Low | 6 | — | — |
| 🔴 | [Random Events](areas/random-events.md) | Medium | 8 | — | — |
| 🔴 | [News Ticker](areas/news-ticker.md) | Low | 4 | — | — |
| 🟢 | [Audio](areas/audio.md) | Low | 5 | **13** | — |
| 🔴 | [Statistics](areas/statistics.md) | Low | 5 | — | — |

### Presentation & Shell

Navigation, tutorial, formatting and build variants. Highly visible, cheap to test, currently untested.

| Status | Area | Risk | Planned | Specs | Existing coverage |
|:--:|---|:--:|--:|--:|---|
| 🔴 | [Number Notation](areas/notation.md) | Medium | 6 | — | — |
| 🟠 | [UI Navigation](areas/ui-navigation.md) | Medium | 7 | — | launch-app.test.js |
| 🟠 | [Onboarding & Tutorial](areas/onboarding.md) | High | 7 | — | launchAndOnboard.test.js |
| 🟢 | [Cosmicopedia & Help](areas/cosmicopedia.md) | Low | 5 | **6** | — |
| 🟢 | [Demo Build Lockdowns](areas/demo-build.md) | High | 6 | **13** | — |
| 🔴 | [Performance & Frame Budget](areas/performance.md) | High | 6 | — | — |

## Status legend

| | Meaning |
|:--:|---|
| 🔴 RED | No automated coverage. A regression here ships unnoticed. |
| 🟠 AMBER | Partial coverage — a smoke test proves the path exists, but branches, failure modes and edge cases are unverified. |
| 🟢 GREEN | Comprehensive coverage — happy path, branches, boundaries and failure modes all asserted. |

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
