# Galactic Casino

| | |
|---|---|
| **Status** | 🔴 RED |
| **Risk if broken** | Medium |
| **Group** | Meta Progression |
| **Spec folder** | `tests/e2e/galactic-casino/` |
| **Existing coverage** | _none_ |

CP economy and three risk games with a shared prize architecture.

## What should be tested

- [ ] CP purchase cost scales as designed (including the cpBaseCost migration)
- [ ] Game 1 Double or Nothing resolves both outcomes and settles CP correctly
- [ ] Game 2 Wheel of Fortune awards each special prize type
- [ ] Game 3 Higher or Lower awards correct tier prizes
- [ ] Invalid and unaffordable stakes are rejected with a localized message
- [ ] Every timer-finishing prize (rocket, starship, telescope x3) applies to the right target
- [ ] Casino statistics track correctly

## Status meaning

🔴 **RED** — No automated coverage. A regression here ships unnoticed.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
