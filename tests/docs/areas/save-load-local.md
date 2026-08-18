# Local Save & Load

| | |
|---|---|
| **Status** | 🔴 RED |
| **Risk if broken** | High |
| **Group** | Foundation |
| **Spec folder** | `tests/e2e/save-load-local/` |
| **Existing coverage** | _none_ |

Export/import of save strings, autosave scheduling, and round-trip fidelity of every persisted field.

## What should be tested

- [ ] Export produces a string that imports back to an identical game state (full round-trip deep-equal)
- [ ] Autosave fires on the configured frequency and respects the autosave toggle
- [ ] Autosave is suppressed during battle and during time warp (unless black hole always-on)
- [ ] Import rejects malformed, truncated and empty strings without corrupting live state
- [ ] Import from file and paste-from-clipboard paths both work
- [ ] Save on entering the save/load pane happens exactly once per visit
- [ ] Demo build does not autosave

## Status meaning

🔴 **RED** — No spec file exists for this area at all. A regression here ships unnoticed.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
