# Cosmic Forge — documentation

Everything written about the game itself lives in this folder.

| Document | What it covers |
|---|---|
| [project-documentation.md](project-documentation.md) | The main reference: project layout, setup, core architecture, the UI system, the data object, saving and loading, and the systems behind each tab. Start here. |
| [GDD.md](GDD.md) | The game design document — the high-level design, progression arc and system write-ups, including the Tab 7 systems (Galactic Market, Galactic Casino). |
| [making-a-build.md](making-a-build.md) | How to produce a release: the Python web/itch packager and the Electron stamper, every parameter each takes, what the three build flags do, and what a demo build withholds. |
| [buildUpgradeable.md](buildUpgradeable.md) | Step-by-step guide to adding a repeatable or upgradable item (autobuyers, batteries, power plants) end to end. |
| [localization/status.md](localization/status.md) | State of all the shipped languages and what is outstanding. |

## What is *not* here

Test documentation stays with the tests, in [`../tests/docs/`](../tests/docs/):

- `coverage-report.md` — per-area traffic-light coverage, generated
- `known-issues.md` — defects the suite has found, and their fixes
- `integration-upgrade-report.md` — which areas have been upgraded to real integration tests, and what changed
- `running-tests.md` — how to run the suite
- `areas/<area>.md` — generated per-area test plans

The conventions for writing a spec are in [`../tests/e2e/README.md`](../tests/e2e/README.md).
