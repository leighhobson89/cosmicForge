# Rebirth

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Meta Progression |
| **Spec folder** | `tests/e2e/rebirth/` |
| **Existing coverage** | _none_ |

The prestige reset. The single most destructive operation in the game if it misbehaves.

## What should be tested

- [ ] Three whole rebirths are played through the Rebirth pane's own button and confirmation modal
- [ ] Every rebirth is audited against a fresh-boot baseline: stores, prices, techs, built things and flags all return to their starting position
- [ ] Nothing earned across runs is lost - the run counter moves by exactly one and no perk, achievement, philosophy or settled star goes backwards
- [ ] The run is playable immediately afterwards: the frame loop ticks, production accrues, every unlocked tab draws and the console stays clean
- [ ] The run-1 rebirth is the one that reveals the Philosophy pane
- [ ] An ascendency perk bought on run 2 is still owned and still applied on run 3
- [ ] The destination record is consumed, so a second rebirth without a fresh scan is refused and the button goes genuinely disabled
- [ ] The endgame is played to the point where the rip is one press from closed, and a rebirth is taken instead - the credits are a terminal state by design, so that is the furthest a spec can go
- [ ] A rebirth taken at that point keeps the whole rip chapter: the five techs, the restored scanner array and the located rip all survive
- [ ] The refusal is reported through the catalogue in the active language, and cancelling the modal changes nothing

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
