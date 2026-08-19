# Offline Gains

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Foundation |
| **Spec folder** | `tests/e2e/offline-gains/` |
| **Existing coverage** | _none_ |

What the game pays a player for the time they were away: the nerfed catch-up applied when a save is loaded and when the window regains focus.

## What should be tested

- [ ] An hour away pays floor(rate x TIMER_RATE_RATIO x seconds x OFFLINE_GAINS_RATE) into the store
- [ ] The nerf is a flat 0.334, applied to the whole payment and floored, so a trickle pays nothing
- [ ] The payment is capped by the store, and fuel already burned is netted off the rate first
- [ ] Resources, compounds, research, rip telemetry and mined antimatter are all paid on the same formula
- [ ] Energy is only paid once a battery exists to hold it
- [ ] Countdown timers lose the whole time away at 1:1 — time passing is not a gain, so it is not nerfed
- [ ] Loading a save announces the payment; returning focus applies it silently
- [ ] Leaving and returning pays once, and a save written a moment ago pays nothing
- [ ] A run that has never been saved does not pay NaN into every store when the window is focused

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
