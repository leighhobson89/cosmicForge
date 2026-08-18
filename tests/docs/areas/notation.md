# Number Notation

| | |
|---|---|
| **Status** | 🟠 AMBER |
| **Risk if broken** | Medium |
| **Group** | Presentation & Shell |
| **Spec folder** | `tests/e2e/notation/` |
| **Existing coverage** | _none_ |

Formatting of every displayed number across notation modes — touches every screen in the game.

## What should be tested

- [ ] The condensed formatter picks the right suffix at every magnitude from 1 to 1e300, and truncates rather than rounds
- [ ] Switching notation immediately reformats all visible values
- [ ] The production-rate formatter keeps the sign and scales its precision
- [ ] Negative, zero and unparseable values format sanely
- [ ] Notation preference persists across save/load
- [ ] No NaN, Infinity or undefined ever reaches the DOM in either mode
- [ ] Formatting is idempotent, so the per-frame reformat cannot compound its own output

## Status meaning

🟠 **AMBER** — A spec file exists, but the area has not yet been through the integration upgrade — some of its coverage is still function-level rather than played through the UI.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
