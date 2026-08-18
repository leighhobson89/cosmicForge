# Research

| | |
|---|---|
| **Status** | 🟠 AMBER |
| **Risk if broken** | High |
| **Group** | Core Economy |
| **Spec folder** | `tests/e2e/research/` |
| **Existing coverage** | `tests/legacy/researchTech.test.js` |

Research point generation, the three research buildings, and how research is spent on the tech tree.

## What should be tested

- [ ] All three research buildings exist with the documented rate, price and energy cost
- [ ] Each building is both dearer and faster than the one below it
- [ ] The rate is the sum of rate × quantity across every active building
- [ ] The Science Lab stops contributing when the power is off, but the Kit and Club do not
- [ ] Research accrues over a sampled interval when powered, and does not move with no buildings
- [ ] The displayed rate is a real formatted number, never NaN or a raw key
- [ ] Buying a tech deducts exactly its price, and research never goes negative
- [ ] Every tech declares a positive price and a unique render position
- [ ] Every tech prerequisite names a tech that exists
- [ ] The research autobuyer starts inactive and disabled
- [ ] Research quantity and building counts survive serialisation
- [ ] Granting every tech through the debug menu leaves the console clean

## Status meaning

🟠 **AMBER** — A spec file exists, but the area has not yet been through the integration upgrade — some of its coverage is still function-level rather than played through the UI.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
