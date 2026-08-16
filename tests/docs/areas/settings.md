# Settings & Preferences

| | |
|---|---|
| **Status** | 🔴 RED |
| **Risk if broken** | Medium |
| **Group** | Foundation |
| **Spec folder** | `tests/e2e/settings/` |
| **Existing coverage** | _none_ |

Themes, audio toggles, autosave frequency, pointer style, notation preference and their persistence.

## What should be tested

- [ ] Every theme applies and persists across reload
- [ ] Audio toggles mute/unmute background music and SFX independently
- [ ] Autosave frequency change takes effect on the next cycle
- [ ] Custom pointer setting applies
- [ ] Collapsible panel open/closed states persist
- [ ] Settings survive a save/load round trip

## Status meaning

🔴 **RED** — No automated coverage. A regression here ships unnoticed.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
