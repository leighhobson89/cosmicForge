# Rebirth

| | |
|---|---|
| **Status** | 🔴 RED |
| **Risk if broken** | High |
| **Group** | Meta Progression |
| **Spec folder** | `tests/e2e/rebirth/` |
| **Existing coverage** | _none_ |

The prestige reset. The single most destructive operation in the game if it misbehaves.

## What should be tested

- [ ] Rebirth resets exactly the intended state and nothing more
- [ ] AP carryover matches the amount shown in the warning modal
- [ ] Achievements, perks and philosophy survive rebirth
- [ ] Run counter increments and statRun-gated content behaves correctly on run 1 vs later
- [ ] Cancelling the rebirth modal changes nothing
- [ ] Post-rebirth state is immediately playable with no stale UI

## Status meaning

🔴 **RED** — No automated coverage. A regression here ships unnoticed.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
