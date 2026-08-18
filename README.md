# Cosmic Forge

A single-player incremental / idle game with strategy meta-progression, built as a
web app in plain HTML, CSS and JavaScript modules.

Documentation lives in **[`docs/`](docs/)**:

- **[docs/project-documentation.md](docs/project-documentation.md)** — the main
  reference: layout, setup, architecture, the UI system, the data object, saving
  and loading, and the systems behind each tab.
- **[docs/GDD.md](docs/GDD.md)** — the game design document.
- **[docs/buildUpgradeable.md](docs/buildUpgradeable.md)** — how to add a
  repeatable or upgradable item end to end.

Test documentation stays with the tests, in **[`tests/docs/`](tests/docs/)** —
coverage, known issues and how to run the suite.

## Running

```
bun install          # or npm install
node server.js       # serve the game
npm run test:e2e     # run every E2E area
node tests/run-e2e.mjs <area> [--headed] [--slow]
```
