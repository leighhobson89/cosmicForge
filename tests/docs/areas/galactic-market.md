# Galactic Market

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Medium |
| **Group** | Meta Progression |
| **Spec folder** | `tests/e2e/galactic-market/` |
| **Existing coverage** | _none_ |

Material-for-material trading, bias-driven pricing, AP liquidation and the lockdown event.

## What should be tested

- [ ] All fourteen tradeable materials are traded through the real dropdowns, and each trade moves exactly what the summary previewed
- [ ] The previewed incoming quantity is the bias-adjusted price ratio less the commission share, read off the pane
- [ ] Demand moves the price: a dear incoming material returns less and a cheap one more, in proportion to the price ratio
- [ ] A trade shifts the outgoing bias down and the incoming bias up by the traded quantity over that material trade volume
- [ ] Market bias decays back towards zero on its own ten-second clock, in a step sized by its own magnitude
- [ ] The sidebar bias line reports both sides and colours each by severity, and its tooltip carries base price, adjusted price and trade volume
- [ ] Quantity selection is gated until both sides are chosen, fills from the holding on "all stock", and clamps a manual entry
- [ ] A material cannot be traded for itself, and the incoming dropdown is rebuilt when the outgoing side changes
- [ ] Commission climbs 6-13 points per confirmed trade and is capped at 80, walked to the cap through real trades
- [ ] All three AP sale quantities preview a cash figure and pay exactly that on the Sell button; a ten-point sale also earns its achievement
- [ ] Liquidation is authorised, quoted, pressed and refused a second time, from the Rebirth pane
- [ ] A Galactic Market lockdown greys the row, refuses the pane, says so in the sidebar, and hands the market back on expiry
- [ ] Holdings, bias and commission survive save/load

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
