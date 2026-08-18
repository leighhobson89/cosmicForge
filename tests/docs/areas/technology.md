# Tech Tree

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Core Economy |
| **Spec folder** | `tests/e2e/technology/` |
| **Existing coverage** | `tests/legacy/researchTech.test.js` |

Tech reveal thresholds, prerequisites, what each purchase unlocks, repeatable techs and the tech tree's rendering.

## What should be tested

- [ ] A tech is hidden below its appearsAt threshold and revealed by the pool crossing it, without reopening the pane
- [ ] A tech is flagged upcoming at 40% of its threshold, well before it is revealed
- [ ] A revealed tech whose prerequisite is unmet is visible but gated
- [ ] Buying a tech through its row deducts exactly its price
- [ ] A researched tech retires its own button so it cannot be bought again
- [ ] Researching a tech raises a localized notification naming it
- [ ] Spending the pool down re-gates the techs it can no longer buy
- [ ] Basic Power Generation is what puts the power plant in the Energy pane
- [ ] Glass Manufacture unlocks glass and reveals its row in the Compounds tab
- [ ] Quantum Computing lifts every normal-progression resource autobuyer to tier 2
- [ ] Rocket Composites is what puts the Launch Pad in the Space Mining tab
- [ ] The tree draws a node per tech the run has met, tagged with its state
- [ ] Every node has a distinct position, so no two techs draw on top of each other
- [ ] A node the player can afford is marked ready, and one they cannot is not
- [ ] Revealing a tech redraws the tree while the player is looking at it
- [ ] Research points buy the main tree only: a million of them opens nothing in the Cosmic Rip pane
- [ ] Unlocked, revealed and upcoming techs all survive a save round trip
- [ ] Granting every tech grants the whole ordinary tree and leaves a clean console

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
