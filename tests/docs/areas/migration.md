# Migration

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Foundation |
| **Spec folder** | `tests/e2e/migration/` |
| **Existing coverage** | _none_ |

Replay any historical save version against today's build on demand — `node tests/run-e2e.mjs migration 0.97`. A real save is aged down through the inverse of every patches.js rung above the target, imported through the real button, and then played on.

## What should be tested

- [ ] The ladder catalogue and patches.js agree, rung for rung, so a new version cannot be added without updating this area
- [ ] The top rung is GAME_VERSION_FOR_SAVES, and every resourceDataObject.js template carries that same version
- [ ] A save aged to any requested version climbs to the current version in every versioned section
- [ ] Every rung above the target is proven to have run by its own effect, not by the version number the loop assigns
- [ ] The run survives the climb — name, techs, unlocked resources and compounds, asteroids, star system
- [ ] Loading the migrated save a second time changes nothing further
- [ ] After migrating, the tabs still render, a real purchase button still buys and still charges, and the timers still advance
- [ ] A save written after a migration is stamped with the current version and keeps the migrated run

## How to run it

```bash
node tests/run-e2e.mjs migration 0.97        # one version
node tests/run-e2e.mjs migration 0.93 0.99   # several
node tests/run-e2e.mjs migration             # every rung below current
```

A bare number is read as a save version rather than an area name, so naming the
area is optional. The runner passes the versions through as `E2E_MIGRATION_VERSIONS`,
which the spec reads at collection time to build one test per version.

## Adding a version to the ladder

This area has to be updated whenever the save version is bumped. Three steps:

1. Add the rung to `patches.js`.
2. Bump `GAME_VERSION_FOR_SAVES` in `constantsAndGlobalVars.js` **and** the
   `version:` literals on the templates in `resourceDataObject.js`.
3. Add the matching entry to `tests/e2e/migration/version-ladder.mjs` — a
   `downgrade` that strips whatever the rung adds, and a `check` that proves the
   rung's work landed.

Step 3 cannot be skipped quietly: the first test in the spec parses the real
`patches.js` and fails by name if the catalogue has fallen behind. The template
check in the same group covers the half of step 2 that is easiest to miss — a
template left at the old number means every *new* save is born stale and climbs
the ladder on every single load, which no test on old saves would ever notice.

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

Distinct from [Save Migration](save-migration.md), which covers the ladder's edge
cases — a save below the minimum version, a save from the future, missing
sections, and a brand-new rung served by route interception. This area covers the
ordinary case for a specific version, on demand, and is the one to run at release
time. Neither area writes to the game source: the save is aged in memory and
pushed through the game's own import box.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
