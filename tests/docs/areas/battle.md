# Battle & Conquest

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Interstellar |
| **Spec folder** | `tests/e2e/battle/` |
| **Existing coverage** | _none_ |

Combat resolution, win/loss consequences and the AP award. High branch count, zero coverage.

## What should be tested

- [ ] Battle resolves deterministically given fixed fleet strengths
- [ ] Victory grants the correct AP and unlocks settlement
- [ ] Defeat destroys the fleet and leaves the system conquerable again
- [ ] Systems with no sentient life skip battle and settle directly
- [ ] Autosave is correctly suppressed while a battle is ongoing
- [ ] Battle outcome modals display correct localized text and substituted values

## Status meaning

🟢 **GREEN** — Comprehensive coverage — happy path, branches, boundaries and failure modes all asserted.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
