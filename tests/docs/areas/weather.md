# Weather

| | |
|---|---|
| **Status** | 🔴 RED |
| **Risk if broken** | Low |
| **Group** | Simulation & Ambience |
| **Spec folder** | `tests/e2e/weather/` |
| **Existing coverage** | _none_ |

Per-system weather states, their efficiency modifiers and the precipitation resource path.

## What should be tested

- [ ] Each weather state applies its documented efficiency modifier
- [ ] Rain adds precipitation resource at the correct rate
- [ ] Volcano state behaves as designed
- [ ] Weather effects stop and clear when the state no longer qualifies
- [ ] Weather ambience audio follows the state
- [ ] Weather is per-system and resets on travel

## Status meaning

🔴 **RED** — No spec file exists for this area at all. A regression here ships unnoticed.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
