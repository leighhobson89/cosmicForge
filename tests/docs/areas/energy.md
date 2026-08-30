# Energy & Power Grid

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Core Economy |
| **Spec folder** | `tests/e2e/energy/` |
| **Existing coverage** | `tests/legacy/energyMid.test.js` |

Power plants, fuel consumption, storage, grid capacity and the consequences of a deficit.

## What should be tested

- [ ] Each power plant type generates its rated output
- [ ] Fuel is consumed at the documented rate and generation stops when fuel runs out
- [ ] Battery storage charges and discharges correctly
- [ ] Consumption exceeding generation triggers the deficit behaviour (not a silent stall)
- [ ] Power All button correctly toggles the whole grid
- [ ] Per-building on/off toggles are independent and persist
- [ ] Solar output responds to star type
- [ ] The stat-bar Powered entry is a toggle that drives the grid, and is inert with a Dyson Sphere or no plants built
- [ ] Selling the last plant of a type switches that type off in the state, the fuel books and the stat-bar tooltip
- [ ] Buy Max builds every power plant the run can afford, charging each at its own price, and the generation follows
- [ ] After the grid auto-trips, ONE click on the plant toggle restarts it - the label and its dataset flag can no longer disagree
- [ ] The toggle flag tracks the plant it belongs to at every step of a trip-and-restart cycle
- [ ] A save carrying a plant type flagged on at quantity zero is normalised to off on load
- [ ] A plant type the player does own is left switched on by that normalisation

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
