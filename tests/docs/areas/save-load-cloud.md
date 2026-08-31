# Cloud Save & Load

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Foundation |
| **Spec folder** | `tests/e2e/save-load-cloud/` |
| **Existing coverage** | `tests/legacy/autobuyer.test.js`, `tests/legacy/earlyLoop.test.js`, `tests/legacy/energyMid.test.js`, `tests/legacy/researchTech.test.js`, `tests/legacy/spaceAntimatter.test.js` |

Supabase-backed saves keyed on pioneer name, exercised as a feature: uploaded through the real button, loaded back in a fresh session, and destroyed through the real Hard Reset. All writes land on one reserved test row.

## What should be tested

- [ ] Save to cloud then load in a fresh session restores the run field for field
- [ ] Saving again under an existing pioneer name updates that row rather than inserting a second
- [ ] Destroying a cloud save archives it to the graveyard row and frees the name for reuse
- [ ] Network failure during save surfaces an error and does not lose the local run
- [ ] Load of a nonexistent pioneer name gives a clear message rather than a silent failure
- [ ] A blank pioneer name is refused before any write is attempted
- [ ] Autosave reaches the cloud on its configured interval with no player action
- [ ] Region, hostSource and feedback columns are populated correctly on the outgoing write
- [ ] `time_playing_this_save` carries the pioneer's active play time, formatted as the game formats a duration ("14m 34s", "44h 12m 11s"), on both the insert and the overwrite

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
