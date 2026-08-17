# Rebirth

| | |
|---|---|
| **Status** | 🟢 GREEN |
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
- [ ] The run counter increments by exactly one
- [ ] Resources and compounds are emptied back to their starting stock
- [ ] The destination record is consumed, so a second rebirth without a fresh scan is refused
- [ ] Ascendency points carry over and are never reduced
- [ ] Achievements, perks and the chosen philosophy survive the reset
- [ ] Settled stars accumulate rather than resetting, since galactic points derive from that list
- [ ] Cancelling the rebirth modal changes nothing, and confirming it performs the rebirth
- [ ] Closing the cosmic rip does not block a later rebirth
- [ ] The frame loop, resource production and the current tab are all live immediately afterwards

## Status meaning

🟢 **GREEN** — Comprehensive coverage — happy path, branches, boundaries and failure modes all asserted.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
