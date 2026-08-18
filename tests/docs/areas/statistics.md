# Statistics

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Low |
| **Group** | Simulation & Ambience |
| **Spec folder** | `tests/e2e/statistics/` |
| **Existing coverage** | _none_ |

Tracked lifetime and per-run statistics, including research, energy, casino, cosmic rip and event stats, and the page that renders them.

## What should be tested

- [ ] Every statistic on the page renders a real value, never the NoData placeholder
- [ ] The page refreshes while it is open
- [ ] Opening and re-opening the page writes nothing to the console
- [ ] Each research building bought adds exactly one to its own statistic
- [ ] Research produced is added to the research statistic, to the point earned
- [ ] Researching a tech adds one to the techs-unlocked statistic
- [ ] Gaining a resource by hand adds exactly what was gained
- [ ] A gain refused because the store is full is not counted
- [ ] Resources an autobuyer produces are counted as they accrue
- [ ] Buying a power plant adds one to the basic power plant statistic
- [ ] Overloading the grid trips it, and the trip is counted
- [ ] The overview reports this run's own pioneer, run number and system
- [ ] The cash figure follows the run's actual cash
- [ ] Elapsed time figures are formatted durations, not raw milliseconds
- [ ] Within one run the this-run and all-time columns move together
- [ ] A rebirth clears the run column and leaves the all-time column standing

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
