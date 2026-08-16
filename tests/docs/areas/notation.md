# Number Notation

| | |
|---|---|
| **Status** | 🔴 RED |
| **Risk if broken** | Medium |
| **Group** | Presentation & Shell |
| **Spec folder** | `tests/e2e/notation/` |
| **Existing coverage** | _none_ |

Formatting of every displayed number across notation modes — touches every screen in the game.

## What should be tested

- [ ] Each notation type formats correctly across magnitudes from 1 to 1e300
- [ ] Switching notation immediately reformats all visible values
- [ ] Specialised formatters (sell-fuse-money, building-purchase) produce correct output
- [ ] Negative, zero and fractional values format sanely
- [ ] Notation preference persists
- [ ] No NaN or Infinity ever reaches the DOM

## Status meaning

🔴 **RED** — No automated coverage. A regression here ships unnoticed.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
