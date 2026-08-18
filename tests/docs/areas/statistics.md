# Statistics

| | |
|---|---|
| **Status** | 🔴 RED |
| **Risk if broken** | Low |
| **Group** | Simulation & Ambience |
| **Spec folder** | `tests/e2e/statistics/` |
| **Existing coverage** | _none_ |

Tracked lifetime and per-run statistics, including casino, cosmic rip and event stats.

## What should be tested

- [ ] Each tracked statistic increments on the right trigger
- [ ] Per-run statistics reset on rebirth; lifetime statistics do not
- [ ] Elapsed active game time excludes inactive periods
- [ ] Statistics display formats correctly under every notation setting
- [ ] Statistics survive save/load

## Status meaning

🔴 **RED** — No spec file exists for this area at all. A regression here ships unnoticed.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
