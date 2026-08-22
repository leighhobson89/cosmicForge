# Random Events

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Medium |
| **Group** | Simulation & Ambience |
| **Spec folder** | `tests/e2e/random-events/` |
| **Existing coverage** | _none_ |

Instant and timed events, their probability model, effects and history tracking.

## What should be tested

- [ ] Every event is fired against a run that cannot take it and one that can, so both halves of its guard are exercised
- [ ] An open guard is distinguished from an event that happens: stockLoss is offered on a bare run but declines when there is nothing to take
- [ ] Instant effects are measured, not read back: one plant lost, the highest battery, half the research, a doubled pile, one stock down 40-80%
- [ ] An antimatter reaction returns exactly what that rocket had mined, destroys the rock and unbuilds the rocket
- [ ] Losing the starship clears the ship, its five modules, the fleet and the destination
- [ ] A broken-down miner stops that rocket dead and no other, measured per rocket
- [ ] A supply chain disruption names a material the run automates and throttles its production by the percentage it advertised
- [ ] Black hole instability shifts the power by a stored 0.5-1.5 roll and hands the original values back on expiry
- [ ] Timed effects run their advertised duration, count down, refuse to restart, and expire through the frame loop into the completed log
- [ ] Probability decays 0.9 per trigger to a 0.01 floor, for that event only, and survives a save with the running effect
- [ ] The Events screen lists running effects with a live countdown, colours good and bad, and orders by what ends soonest
- [ ] The completed log shows instant events as "Instant" with the figures they moved, newest first
- [ ] Every event renders a real name and effect line on the screen in all six languages

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
