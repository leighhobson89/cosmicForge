# Performance & Frame Budget

| | |
|---|---|
| **Status** | 🔴 RED |
| **Risk if broken** | High |
| **Group** | Presentation & Shell |
| **Spec folder** | `tests/e2e/performance/` |
| **Existing coverage** | _none_ |

Frame-loop cost and long-session stability. Not a feature, but the area most likely to degrade silently as content grows.

## What should be tested

- [ ] Frame time stays within budget on a late-game save with many elements
- [ ] No unbounded growth in DOM node count or listener count over a long session
- [ ] The compound reverse-lookup does not scale with catalogue size (guards the O(n) hot-path finding)
- [ ] Timers do not drift measurably over an extended window
- [ ] Memory does not grow monotonically across repeated tab switches
- [ ] gameLoop continues running after every state transition (guards the rAF-inside-conditional finding)

## Status meaning

🔴 **RED** — No automated coverage. A regression here ships unnoticed.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
