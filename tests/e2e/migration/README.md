# e2e / migration

**Migration** — 🟢 GREEN

Replay any historical save version against today's build on demand.

```bash
node tests/run-e2e.mjs migration 0.97        # one version
node tests/run-e2e.mjs migration 0.93 0.99   # several
node tests/run-e2e.mjs migration             # every rung below current
```

A bare number on the command line is read as a save version, not an area name, so
naming the area is optional: `node tests/run-e2e.mjs 0.97` does the same thing.

## What it does

For each version asked for, the spec plays a run in the **current** build, exports
the save the game itself writes through the real Saving pane, and then *ages* that
save down to the target version. Ageing is the inverse of `patches.js`: the
catalogue in [`version-ladder.mjs`](version-ladder.mjs) records, for every rung,
how to strip out what that rung adds, and ageing to 0.97 applies the inverse of
every rung above 0.97 — newest first, so 0.976's undo can rebuild the 0.969-era
rip section before 0.969's undo strips its fields.

The aged code goes back in through the real **Import** button, which is where the
ladder actually runs. Then the spec checks five things:

1. every versioned section of the save arrives at the current version;
2. every rung above the target genuinely did its work — asserted from the
   catalogue, not from the version number the `while` loop assigns either way;
3. the run survived — name, techs, unlocked resources and compounds, asteroids,
   star system;
4. loading the migrated save again changes nothing further;
5. **the game keeps playing** — tabs render, a real purchase button still buys and
   still charges, the timers still advance, and the save round-trips.

No fixture files, and nothing is written to the game source. A checked-in 0.97
save would be frozen the day it was written; a save aged out of today's build
always has today's structure minus exactly the fields that era lacked.

## Adding a version

Three steps, and the third is not optional:

1. Add the rung to `patches.js`.
2. Bump `GAME_VERSION_FOR_SAVES` in `constantsAndGlobalVars.js` **and** the
   `version:` literals on the templates in `resourceDataObject.js`.
3. Add the matching entry to [`version-ladder.mjs`](version-ladder.mjs) — a
   `downgrade` that strips what the rung adds, and a `check` that proves it ran.

The first test in the spec parses the real `patches.js` and fails by name if the
catalogue has fallen behind, so step 3 cannot be skipped quietly. The template
check in the same group covers the half of step 2 that is easiest to miss: a
template left at the old number means every *new* save is born stale and climbs
the ladder on every load.

## Relationship to `save-migration`

[`tests/e2e/save-migration/`](../save-migration/) covers the ladder's edge cases —
a save below the minimum version, a save from the future, missing sections, and a
brand-new rung served by route interception. This area covers the ordinary case
for a specific version, on demand, and is the one to run at release time.

Full test plan and checklist: [`tests/docs/areas/migration.md`](../../docs/areas/migration.md)
