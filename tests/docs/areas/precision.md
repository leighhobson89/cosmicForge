# Precision & Rounding

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Presentation & Shell |
| **Spec folder** | `tests/e2e/precision/` |
| **Existing coverage** | _none_ |

The one rounding and tolerance policy the whole economy shares, so that what a figure reads on screen and what a purchase gate charges can never disagree.

## What should be tested

- [ ] Affordability and the displayed figures agree at every scale, across the boundary cases that produced the reports
- [ ] A holding is never displayed as more than it is, and a cost never as less
- [ ] The tolerance forgives float drift and refuses a shortfall the player can see
- [ ] The stat bar's cash figure is never rounded up past a price the game then refuses
- [ ] A building whose secondary resource is held at exactly its quoted price is buyable
- [ ] A store an ulp under its cap reads as full and still earns its storage increase
- [ ] Buy Max buys every unit the balance covers and leaves no phantom remainder or overdraft
- [ ] A live production line never reads as 0 / s, and the displayed rate matches the measured delta
- [ ] An abbreviated rate keeps the decimal that distinguishes 1.2K from 1.9K
- [ ] Neither notation mode ever renders a holding of 999.6 as 1000

## Status meaning

🟢 **GREEN** — Added by P7 of the player-feedback plan. `precision.js` is the single policy: holdings round down, costs round up, and one tolerance is shared between every gate, every charge and every display, which makes "it looks affordable but the button is red" impossible by construction rather than by luck.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
