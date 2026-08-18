# Audio

| | |
|---|---|
| **Status** | 🟠 AMBER |
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

🟠 **AMBER** — A spec file exists, but the area has not yet been through the integration upgrade — some of its coverage is still function-level rather than played through the UI.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
