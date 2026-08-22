# Achievements

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Low |
| **Group** | Meta Progression |
| **Spec folder** | `tests/e2e/achievements/` |
| **Existing coverage** | _none_ |

Unlock conditions, rewards, notifications, artwork and tooltips across all seventy achievements, plus what a rebirth clears and what it must never clear.

## What should be tested

- [ ] All seventy achievements fire on their own condition and none fires early
- [ ] Each achievement pays exactly the reward its gives block describes, and pays it once
- [ ] Repeated frame-loop checks never re-apply a reward
- [ ] Every achievement raises its own resolved notification
- [ ] Scenarios that can be played are played, and the frame loop does the granting
- [ ] Every achievement that is not reset on rebirth survives every rebirth
- [ ] Every achievement that is reset on rebirth is handed back, bar the three auto-granted with infinite power
- [ ] A permanent multiplier belongs to a permanent achievement, and is re-applied to the board after every rebirth
- [ ] Achievement state and its special checkers survive a real export/import round trip
- [ ] The pane draws one tile per achievement, each in its own grid cell
- [ ] Every achievement has artwork on disk for all nine themes, and the grid repaints when the theme changes
- [ ] Tooltips resolve in all six languages and their status line flips live
- [ ] Reopening the pane does not stack tooltips or listeners (known-issues #37, fixed)
- [ ] Discovering an asteroid on run 1 does not stop the frame loop

## Status meaning

🟢 **GREEN** — Upgraded to integration and swept end to end: all seventy achievements are earned at their own condition and their reward audited against the arithmetic the data promises, the playable scenarios are played and granted by the frame loop, two rebirths audit what persists, and the pane is checked across 630 artwork files and six languages. The area found known-issues #37, now fixed at source: the pane installed a fresh tooltip element and three more document listeners on every visit.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
