# Research

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Core Economy |
| **Spec folder** | `tests/e2e/research/` |
| **Existing coverage** | `tests/legacy/researchTech.test.js` |

Research point generation, the three research buildings and the power they draw, and how research is spent on the tech tree.

## What should be tested

- [ ] All three research buildings exist with the documented rate, price and energy cost
- [ ] Each building is both dearer and faster than the one below it
- [ ] The rate is the sum of rate x quantity across every active building
- [ ] Buying a Science Kit through its own button charges the advertised price in cash and adds one building
- [ ] Each building bought raises the research the pool actually gains per second
- [ ] The rate shown in the side menu agrees with the rate the pool is really gaining
- [ ] A building the player cannot afford is gated by its colour class, and un-gated when they can
- [ ] The Science Club appears only once Knowledge Sharing is researched, and then buys
- [ ] The Science Lab appears only once Science Laboratories is researched, and then buys
- [ ] Kits draw no power and labs do, measured on the grid consumption figure
- [ ] Switching a lab off through its toggle stops it drawing power
- [ ] With the grid down the labs stop producing and the kits carry on
- [ ] The Science Lab stops contributing when the power is off, but the Kit and Club do not
- [ ] Research accrues over a sampled interval when powered, and does not move with no buildings
- [ ] The displayed rate is a real formatted number, never NaN or a raw key
- [ ] Buying a tech deducts exactly its price, and research never goes negative
- [ ] Every tech declares a positive price and a unique render position
- [ ] Every tech prerequisite names a tech that exists
- [ ] The research autobuyer is revealed by the Robotic Research Automation perk and then researches techs on its own
- [ ] Research quantity and building counts survive serialisation
- [ ] Granting every tech through the debug menu leaves the console clean

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
