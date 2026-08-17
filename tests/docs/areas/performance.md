# Performance & Frame Budget

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Presentation & Shell |
| **Spec folder** | `tests/e2e/performance/` |
| **Existing coverage** | _none_ |

Frame-loop cost and long-session stability. Not a feature, but the area most likely to degrade silently as content grows.

## What should be tested

- [ ] Frame time stays within budget on a late-game run
- [ ] Event listeners and DOM nodes do not accumulate across repeated tab cycles or a long idle window
- [ ] Heap growth decelerates rather than accruing per cycle, measured after a forced GC
- [ ] Notification containers are pooled per classification rather than per message
- [ ] The compound reverse-lookup stays cheap enough for the frame loop (guards the O(n) hot-path finding)
- [ ] Delta timers do not drift measurably over an extended window
- [ ] gameLoop continues running after every state transition (guards the rAF-inside-conditional finding)

## Status meaning

🟢 **GREEN** — Comprehensive coverage — happy path, branches, boundaries and failure modes all asserted.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
