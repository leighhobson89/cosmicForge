# Number Notation

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Medium |
| **Group** | Presentation & Shell |
| **Spec folder** | `tests/e2e/notation/` |
| **Existing coverage** | _none_ |

Formatting of every displayed number across notation modes — touches every screen in the game.

## What should be tested

- [ ] The condensed formatter picks the right suffix at every magnitude from 1 to 1e300, and truncates rather than rounds
- [ ] The production-rate formatter keeps the sign and scales its precision
- [ ] Negative, zero and unparseable values format sanely
- [ ] Notation preference persists across save/load
- [ ] Formatting is idempotent, so the per-frame reformat cannot compound its own output
- [ ] The Visual pane offers exactly the two shipped modes, and opens on the one the game is in
- [ ] Choosing a mode from the real dropdown reformats what is already on screen, both ways
- [ ] The chosen mode survives leaving the settings pane and coming back
- [ ] Condensed: no screen in the game renders an un-abbreviated number
- [ ] Plain: every value past a thousand is grouped, and nothing is abbreviated
- [ ] No screen in either mode leaks NaN, Infinity, undefined or [object Object]
- [ ] Purchase price descriptions abbreviate every cost and keep the currency symbol in condensed mode
- [ ] Purchase price descriptions group their thousands in plain mode
- [ ] The sell row shows a condensed sale value on every resource and compound
- [ ] The stat bar follows the notation setting on whichever tab is open
- [ ] The statistics screen follows the notation setting

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
