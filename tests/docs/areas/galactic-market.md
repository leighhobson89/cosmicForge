# Galactic Market

| | |
|---|---|
| **Status** | 🟠 AMBER |
| **Risk if broken** | Medium |
| **Group** | Meta Progression |
| **Spec folder** | `tests/e2e/galactic-market/` |
| **Existing coverage** | _none_ |

Material-for-material trading, bias-driven pricing, AP liquidation and the lockdown event.

## What should be tested

- [ ] Trades move exactly the quantities the summary previewed
- [ ] Prices move as designed: bias shifts in proportion to trade volume and commission climbs 6-13 points per trade to a cap of 80
- [ ] Quantity selection is gated, clamped to holdings and reset after a trade
- [ ] A material cannot be traded for itself
- [ ] Selling AP for cash and liquidating the run both settle correctly
- [ ] A Galactic Market lockdown greys the side-menu row and blocks the pane
- [ ] Holdings, bias and commission survive save/load

## Status meaning

🟠 **AMBER** — A spec file exists, but the area has not yet been through the integration upgrade — some of its coverage is still function-level rather than played through the UI.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
