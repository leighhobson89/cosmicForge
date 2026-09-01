# Black Hole Time Warp

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Endgame |
| **Spec folder** | `tests/e2e/black-hole/` |
| **Existing coverage** | _none_ |

Time multiplication affecting every rate in the game — the widest blast radius of any system.

## What should be tested

- [ ] Warp multiplier applies uniformly to all timers and rates
- [ ] Always-on mode holds the multiplier at black hole power and clears end timestamps
- [ ] Timed warp expires correctly and restores multiplier 1
- [ ] Multiplier is forced to 1 when the window is hidden or unfocused
- [ ] Autosave is deferred during warp unless always-on
- [ ] Black hole power purchases scale correctly post-nerf-migration
- [ ] No accumulator drift or double-counting across a long warp
- [ ] No upgrade row ever renders an unchanged before/after pair — the rung that reaches the always-active floor names its outcome instead of quoting the same number twice
- [ ] The unresearched pane states what the time warp is worth, in all six languages, and drops the pitch once the feature is owned

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
