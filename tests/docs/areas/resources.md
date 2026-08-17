# Resources

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Core Economy |
| **Spec folder** | `tests/e2e/resources/` |
| **Existing coverage** | `tests/legacy/earlyLoop.test.js` |

The eight extractable base resources plus solar: accrual, four autobuyer tiers, storage caps and selling.

## What should be tested

- [ ] Every resource declares the fields the frame loop reads
- [ ] Every resource has four autobuyer tiers with a rate, price and DOM anchor
- [ ] Each tier extracts faster and costs more than the one below it
- [ ] Production never carries a resource past its storage cap, for any resource or all at once
- [ ] A resource sitting exactly at capacity gains nothing further
- [ ] The accrual rate is the sum of rate × quantity across every active tier
- [ ] An inactive tier contributes nothing
- [ ] Production stops entirely when the power is off
- [ ] A stocked, powered resource actually accrues over a sampled interval
- [ ] Selling all unlocked resources pays exactly quantity × saleValue and zeroes the stock
- [ ] Selling ignores resources the player has not unlocked
- [ ] Selling with nothing in stock changes neither cash nor stock
- [ ] Solar has no sale value and so cannot be sold
- [ ] Every resource name resolves to real copy in all five languages
- [ ] Quantities, caps and tier purchases survive a save/load round trip

## Status meaning

🟢 **GREEN** — Comprehensive coverage — happy path, branches, boundaries and failure modes all asserted.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
