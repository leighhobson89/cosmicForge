# Audio

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Low |
| **Group** | Simulation & Ambience |
| **Spec folder** | `tests/e2e/audio/` |
| **Existing coverage** | _none_ |

Background music, ambience and SFX, and their interaction with settings.

## What should be tested

- [ ] Background audio starts and loops
- [ ] Weather ambience follows the weather state
- [ ] Click SFX fire on interactive elements
- [ ] Mute toggles take effect immediately and persist
- [ ] Audio does not resume when muted after a tab change

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
