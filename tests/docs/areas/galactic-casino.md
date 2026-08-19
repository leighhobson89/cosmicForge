# Galactic Casino

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Medium |
| **Group** | Meta Progression |
| **Spec folder** | `tests/e2e/galactic-casino/` |
| **Existing coverage** | _none_ |

CP economy and four risk games with a shared special-prize architecture.

## What should be tested

- [ ] CP is bought through the dropdown, field and Buy button, and charges cpBaseCost / valueOfOneCP of the chosen material
- [ ] An unaffordable amount is clamped, and a material the run has not unlocked is offered greyed out
- [ ] Game 1 Double or Nothing is staked in its own field and spun on its own button, settling both outcomes
- [ ] Game 2 Wheel of Fortune is spun on its button and reaches its special, losing and regular-prize segments; no winning segment can pay nothing
- [ ] The wheel special prize is chosen in the real dropdown and paid by the real Claim button, and a prize with no target is greyed out
- [ ] Game 3 Higher or Lower is dealt, guessed and cashed out on its buttons, and each tier prize is checked against the balance it names
- [ ] Game 4 Visiting Void Seer charges its prize cost, pays out on a match and stays dead without the chips for the chosen prize
- [ ] Invalid and unaffordable stakes are refused with a localized message, and a disabled button really does nothing
- [ ] Every special prize applies to the right target, including the five timer-finishing prizes
- [ ] Casino statistics track plays, wins and CP spend in both scopes
- [ ] The sub-0.93 cpBaseCost patch is pinned as unreachable

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
