# Galactic Market

| | |
|---|---|
| **Status** | 🔴 RED |
| **Risk if broken** | Medium |
| **Group** | Meta Progression |
| **Spec folder** | `tests/e2e/galactic-market/` |
| **Existing coverage** | _none_ |

AP-denominated trading, stock pricing and the demo-build lockdown.

## What should be tested

- [ ] Buy and sell adjust AP and holdings correctly
- [ ] Prices move as designed and previews match execution
- [ ] Insufficient AP blocks purchase cleanly
- [ ] Demo build lockdown UI applies and blocks interaction
- [ ] Casino stock-doubling prize applies to the correct stock
- [ ] Holdings survive save/load and rebirth as designed

## Status meaning

🔴 **RED** — No automated coverage. A regression here ships unnoticed.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
