# Local Save & Load

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Foundation |
| **Spec folder** | `tests/e2e/save-load-local/` |
| **Existing coverage** | _none_ |

The save code and the save file: export, import, download and file-picker load, driven through the real buttons, with full round-trip fidelity into a fresh session.

## What should be tested

- [ ] A run exported as a code restores into a brand new session, field for field
- [ ] A downloaded .txt file loads back into a brand new session through the real file picker
- [ ] The exported code is compressed rather than readable JSON, and matches the downloaded file byte for byte
- [ ] The Export button copies the code to the clipboard
- [ ] A local import keeps the importing player as the pioneer rather than adopting the name in the save
- [ ] Import rejects malformed, truncated and empty strings without corrupting live state
- [ ] The save pane captures exactly once per visit, and captures afresh on the next visit
- [ ] Autosave suppression during battle, time warp and demo builds is covered in those areas

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
