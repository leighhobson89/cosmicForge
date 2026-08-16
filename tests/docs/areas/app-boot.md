# Application Boot

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Foundation |
| **Spec folder** | `tests/e2e/app-boot/` |
| **Existing coverage** | `tests/legacy/launch-app.test.js` |

The game reaches a playable state from a cold start, in both browser and Electron shells.

## What should be tested

- [ ] Cold boot reaches the start modal with no uncaught console errors
- [ ] All five CDN dependencies resolve, and the game still boots when they do not (currently it will not — assert the failure explicitly so the vendoring fix is provable)
- [ ] buildFlags are honoured: demo vs full, cosmic rip on/off, debugger gated correctly
- [ ] gameLoop starts and continues running across at least several seconds of frames
- [ ] Module-level top-level await in ui.js completes before first paint
- [ ] No raw localization keys visible anywhere on the first screen

## Status meaning

🟢 **GREEN** — Comprehensive coverage — happy path, branches, boundaries and failure modes all asserted.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
