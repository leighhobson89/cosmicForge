# Space Telescope

| | |
|---|---|
| **Status** | 🔴 RED |
| **Risk if broken** | Medium |
| **Group** | Space Operations |
| **Spec folder** | `tests/e2e/space-telescope/` |
| **Existing coverage** | _none_ |

The three telescope actions — star study, asteroid search, void pillage — and their auto-repeat.

## What should be tested

- [ ] Each of the three actions starts, runs its timer and delivers its reward
- [ ] Actions are blocked when power is insufficient
- [ ] Auto-telescope repeats the selected action indefinitely
- [ ] Voidborn philosophy improves study speed and yield as documented
- [ ] Casino prizes that instantly finish a telescope action work for all three
- [ ] Timer state survives save/load mid-action

## Status meaning

🔴 **RED** — No automated coverage. A regression here ships unnoticed.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
