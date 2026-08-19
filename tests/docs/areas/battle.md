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
- [ ] Every tab, Settings included, is locked for the duration of a battle and unlocked when it ends

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
