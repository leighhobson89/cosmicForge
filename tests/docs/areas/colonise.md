# Colonisation

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Interstellar |
| **Spec folder** | `tests/e2e/colonise/` |
| **Existing coverage** | _none_ |

Settling a conquered system and the state transition into the new run context.

## What should be tested

- [ ] Settlement adds the system to settled stars
- [ ] Settled count correctly drives cosmic rip galactic points
- [ ] Galactic tab unlocks on first qualifying settlement
- [ ] New system's star type bonuses take effect immediately
- [ ] Settlement is idempotent — a system cannot be settled twice
- [ ] Settling the same star twice, or under different casing, awards only one galactic point
- [ ] Blank and non-string values are refused rather than counted
- [ ] A save carrying duplicate settled stars is normalised on restore

## Status meaning

🟢 **GREEN** — Comprehensive coverage — happy path, branches, boundaries and failure modes all asserted.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
