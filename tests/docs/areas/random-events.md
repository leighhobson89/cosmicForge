# Random Events

| | |
|---|---|
| **Status** | 🔴 RED |
| **Risk if broken** | Medium |
| **Group** | Simulation & Ambience |
| **Spec folder** | `tests/e2e/random-events/` |
| **Existing coverage** | _none_ |

Instant and timed events, their probability model, effects and history tracking.

## What should be tested

- [ ] Every instant event triggers and applies its effect exactly once
- [ ] Every timed effect applies, persists for its duration and cleanly expires
- [ ] Probability decays after a trigger and the cycle window stays within bounds
- [ ] Negative events are correctly classified and communicated
- [ ] Event history records accurately and does not grow unbounded
- [ ] Supply chain disruption picks a valid candidate
- [ ] Black hole instability shift applies correctly
- [ ] Active timed effects survive save/load with correct remaining time

## Status meaning

🔴 **RED** — No automated coverage. A regression here ships unnoticed.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
