# Rebirth

| | |
|---|---|
| **Status** | 🟠 AMBER |
| **Risk if broken** | High |
| **Group** | Meta Progression |
| **Spec folder** | `tests/e2e/rebirth/` |
| **Existing coverage** | _none_ |

The prestige reset. The single most destructive operation in the game if it misbehaves.

## What should be tested

- [ ] Rebirth refuses a state it cannot complete rather than throwing part-way through the reset
- [ ] A rebirth with a scanned destination completes, increments the run and rebuilds the star system around it
- [ ] A refused rebirth leaves the run byte-for-byte unchanged and writes nothing to the console
- [ ] The refusal is reported to the player through the catalogue, in the active language
- [ ] The rebirth button is genuinely disabled — not merely coloured red — until a rebirth is both earned and completable
- [ ] Rebirth resets exactly the intended state and nothing more
- [ ] AP carryover matches the amount shown in the warning modal
- [ ] Achievements, perks and philosophy survive rebirth
- [ ] Run counter increments and statRun-gated content behaves correctly on run 1 vs later
- [ ] Cancelling the rebirth modal changes nothing, and confirming it performs the rebirth
- [ ] Closing the cosmic rip does not block a later rebirth
- [ ] Post-rebirth state is immediately playable with no stale UI

## Status meaning

🟠 **AMBER** — Partial coverage — a smoke test proves the path exists, but branches, failure modes and edge cases are unverified.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
