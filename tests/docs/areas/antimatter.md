# Antimatter

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Medium |
| **Group** | Space Operations |
| **Spec folder** | `tests/e2e/antimatter/` |
| **Existing coverage** | `tests/legacy/spaceAntimatter.test.js` |

Antimatter unlock gate, generation via the delta timer, and the antimatter diagram.

## What should be tested

- [ ] Antimatter unlocks at the correct gate and the mining option becomes visible
- [ ] Generation accumulates via the delta accumulator without drift over a long window
- [ ] The diagram updates in step with quantity
- [ ] Time warp multiplies antimatter accrual correctly
- [ ] Accumulator leftover is preserved across save/load (no lost or duplicated ticks)

## Status meaning

🟢 **GREEN** — Comprehensive coverage — happy path, branches, boundaries and failure modes all asserted.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
