# Random Events

| | |
|---|---|
| **Status** | 🟠 AMBER |
| **Risk if broken** | Medium |
| **Group** | Simulation & Ambience |
| **Spec folder** | `tests/e2e/random-events/` |
| **Existing coverage** | _none_ |

Instant and timed events, their probability model, effects and history tracking.

## What should be tested

- [ ] Every event is registered, uniquely named, localized and offered by the debug menu
- [ ] Every instant event applies its effect exactly once and is recorded in history
- [ ] Every timed effect applies, counts down, cannot restart while running and cleanly expires
- [ ] Probability decays by 0.9 per trigger and never falls below the 0.01 floor
- [ ] Events with unmet preconditions refuse to fire, and an unknown id is refused without throwing
- [ ] Supply chain disruption only fires once an autobuyer exists and targets one the player owns
- [ ] Stock loss removes 40-80% of exactly one held stock
- [ ] Event history is capped, ordered newest first, and active timed effects survive save/load with their remaining time

## Status meaning

🟠 **AMBER** — A spec file exists, but the area has not yet been through the integration upgrade — some of its coverage is still function-level rather than played through the UI.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
