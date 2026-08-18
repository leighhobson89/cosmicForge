# Galactic Casino

| | |
|---|---|
| **Status** | 🟠 AMBER |
| **Risk if broken** | Medium |
| **Group** | Meta Progression |
| **Spec folder** | `tests/e2e/galactic-casino/` |
| **Existing coverage** | _none_ |

CP economy and four risk games with a shared special-prize architecture.

## What should be tested

- [ ] CP purchase cost scales as designed, and the sub-0.93 cpBaseCost patch is pinned as unreachable
- [ ] Game 1 Double or Nothing resolves both outcomes and settles CP correctly
- [ ] Game 2 Wheel of Fortune reaches its special, losing and regular-prize segments
- [ ] Game 3 Higher or Lower awards correct tier prizes and ends on a wrong guess
- [ ] Game 4 Visiting Void Seer charges its prize cost and pays out on a match
- [ ] Invalid and unaffordable stakes are rejected with a localized message
- [ ] Every special prize applies to the right target, including the five timer-finishing prizes
- [ ] Casino statistics track plays, wins and CP spend in both scopes

## Status meaning

🟠 **AMBER** — A spec file exists, but the area has not yet been through the integration upgrade — some of its coverage is still function-level rather than played through the UI.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
