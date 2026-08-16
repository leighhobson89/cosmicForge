# Cloud Save & Load

| | |
|---|---|
| **Status** | 🟠 AMBER |
| **Risk if broken** | High |
| **Group** | Foundation |
| **Spec folder** | `tests/e2e/save-load-cloud/` |
| **Existing coverage** | `tests/legacy/autobuyer.test.js`, `tests/legacy/earlyLoop.test.js`, `tests/legacy/energyMid.test.js`, `tests/legacy/researchTech.test.js`, `tests/legacy/spaceAntimatter.test.js` |

Supabase-backed saves keyed on pioneer name. Legacy tests use this as a fixture mechanism but never test it as a feature.

## What should be tested

- [ ] Save to cloud then load in a fresh session restores identical state
- [ ] Pioneer name collision is handled predictably
- [ ] Destroying a cloud save moves it to the graveyard row and frees the name for reuse
- [ ] Network failure during save surfaces an error and does not lose the local state
- [ ] Load of a nonexistent pioneer name gives a clear message rather than a silent failure
- [ ] Region, hostSource and feedback columns are populated correctly

## Status meaning

🟠 **AMBER** — Partial coverage — a smoke test proves the path exists, but branches, failure modes and edge cases are unverified.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
