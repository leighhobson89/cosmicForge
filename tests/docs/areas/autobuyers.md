# Auto Buyers

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Core Economy |
| **Spec folder** | `tests/e2e/autobuyers/` |
| **Existing coverage** | `tests/legacy/autobuyer.test.js` |

Automation for all resources and compounds across four tiers, measured as throughput: the power rule, the compound perk gate, the diesel exception and B-type star boosts.

## What should be tested

- [ ] With the grid down, tier 1 produces and tiers 2, 3 and 4 do not
- [ ] With the grid up, all four tiers produce
- [ ] The power rule holds for every one of the eight resources
- [ ] A higher tier out-produces a lower one at equal quantity
- [ ] An inactive tier produces nothing
- [ ] The compoundAutomation perk is unowned on a fresh run and unlocks compoundMachining
- [ ] All six compounds carry four priced tiers behind the perk
- [ ] Diesel tier 1 ships active, priced and energy-free
- [ ] Diesel tier 1 measurably produces with the grid down while tier 2 does not
- [ ] Only tier 1 of each compound is free of an energy cost
- [ ] B-type boosts match the shipped table and climb with tier
- [ ] The B-type boost is all-or-nothing for the current system
- [ ] getTotalAutoBuyerRateWithBTypeBoost is additive, not multiplicative
- [ ] Energy use is non-decreasing across tiers for every resource
- [ ] Owning tier 4 autobuyers raises total energy use
- [ ] The displayed production rate never renders NaN
- [ ] Quantities and toggle states survive serialisation
- [ ] Autobuyer names localize in all five languages

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
