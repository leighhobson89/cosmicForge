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

## Status meaning

🟢 **GREEN** — Comprehensive coverage — happy path, branches, boundaries and failure modes all asserted.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
