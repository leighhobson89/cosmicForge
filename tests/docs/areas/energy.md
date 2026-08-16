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

## Status meaning

🟢 **GREEN** — Comprehensive coverage — happy path, branches, boundaries and failure modes all asserted.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
