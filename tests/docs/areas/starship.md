# Starship

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Interstellar |
| **Spec folder** | `tests/e2e/starship/` |
| **Existing coverage** | _none_ |

Starship construction module by module, the optional Stellar Scanner, antimatter fuelling and interstellar travel to a chosen destination.

## What should be tested

- [ ] Every part is bought one at a time, charges its own cash and three materials, and makes the next part dearer
- [ ] A module is finished by the frame loop from its rendered row, and cannot be built past its part count
- [ ] The four mandatory modules finishing is what makes the ship exist and moves it to readyForTravel
- [ ] The Stellar Scanner is optional: without it the ship still flies, still arrives and still scans
- [ ] With the scanner the system scan names the civilization and population; without it both read ???
- [ ] A star's fuel and its flight time are both functions of its distance and nothing else
- [ ] The launch is lit only while the antimatter is on hand, and spends exactly the star's fuel
- [ ] Cancelling the launch warning spends nothing and leaves the ship on the pad
- [ ] The flight clock runs down at the rate the distance set, and arrival puts the ship in orbit
- [ ] Orbit opens the system scan, closes the travel row, and on run 1 grants the AP-awarding tech

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
