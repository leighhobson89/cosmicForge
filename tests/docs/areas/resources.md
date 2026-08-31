# Resources

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Core Economy |
| **Spec folder** | `tests/e2e/resources/` |
| **Existing coverage** | `tests/legacy/earlyLoop.test.js` |

The eight extractable base resources plus solar, driven through the Resources tab: storage caps and upgrades, selling, fusing, the quantity selector that feeds both, and the tech-gated autobuyer tiers.

## What should be tested

- [ ] The Increase Storage button multiplies the cap and charges the cap that was outgrown
- [ ] A second increase costs the new, larger cap rather than the starting one
- [ ] Production stops dead at the cap instead of overflowing it
- [ ] Hitting the cap raises a storage-full notification whose action increases storage
- [ ] The Sell button sells exactly the previewed amount and pays for it
- [ ] The quantity selector decides how much the Sell button sells, across all eight options
- [ ] Selling more than is in stock sells the stock and no more
- [ ] Sell All empties every unlocked resource and then disables itself
- [ ] The Fuse button is hidden until the fusion tech is researched (FAILING — known-issues #18)
- [ ] The first fusion discovers the target resource at a quarter yield
- [ ] Once discovered, fusing converts at the full ratio with Fusion Efficiency III
- [ ] The quantity selector decides how much is fused, and the preview shows the yield
- [ ] Fusion is limited by the target resource's storage, and warns about it
- [ ] Carbon fuses to both of its targets in a single press, charged once
- [ ] A fresh run offers tier 1 only; tiers 2-4 are not on the pane
- [ ] Researching the techs raises the tier level to 4 and reveals every tier row
- [ ] Buying a tier 1 autobuyer charges the resource, raises the price and starts extraction
- [ ] A higher tier bought through its own button out-produces tier 1
- [ ] Each tier extracts faster and costs more than the one below it
- [ ] Every resource name resolves to real copy in all six languages
- [ ] Driving every resource pane raises no console or page errors
- [ ] Buy Max: rows carry no Max button until the Bulk Purchasing ascendency perk is bought
- [ ] Buy Max: one press lands on exactly the state that clicking Buy until it greys out lands on
- [ ] Buy Max: every unit is charged at its own price, so the batch cannot be had at the opening price
- [ ] Buy Max: the run stops at the last affordable unit and never overdraws
- [ ] Buy Max: a Max button appears on every purchase the plan names and on none of the one-off ones
- [ ] Buy Max: the extra button does not push any row out of its container
- [ ] Buy Max: Max is greyed out exactly when Buy is, including at a completion cap
- [ ] Buy Max: a bulk run does not raise one notification per unit bought
- [ ] Buy Max: a compound autobuyer bulk-buys through its own cost path, including the cash-priced diesel tier 1
- [ ] Buy Max: a part-built rocket is finished exactly, and a finished one costs nothing to press again
- [ ] Increase All Storage: a Storage All button sits beside Sell All in both sidebar headers
- [ ] Increase All Storage: the button is dark on a fresh run and lights the moment a store tops out
- [ ] Increase All Storage: the button goes dark again once every claim has been taken
- [ ] Increase All Storage: a press with nothing earned changes nothing and says nothing
- [ ] Increase All Storage: one press claims every full store, doubling the cap and charging the old one
- [ ] Increase All Storage: partial stores are left alone, at their own cap and their own price
- [ ] Increase All Storage: the notification names exactly the stores that were claimed
- [ ] Increase All Storage: solar is never swept, having no storage to increase
- [ ] Increase All Storage: a full store the player has not unlocked yet is not claimed
- [ ] Increase All Storage: the resources button never touches compounds, and vice versa
- [ ] Increase All Storage: the compounds header claims compounds
- [ ] Increase All Storage: the water reservoir is claimed before concrete's own increase
- [ ] Increase All Storage: concrete's own claim comes back once its store refills
- [ ] Increase All Storage: a full reservoir with too little concrete is not claimed, and nothing is charged
- [ ] Increase All Storage: a claim survives its storage-full notification expiring
- [ ] Increase All Storage: the pane's own Increase Storage button still works after a sweep
- [ ] Increase All Storage: the storage-full notification action still works after a sweep
- [ ] Increase All Storage: a storage-full notification cannot be claimed after a sweep already claimed it
- [ ] Increase All Storage: the reservoir button goes red when the concrete cannot be paid
- [ ] Gain 1: every resource pane carries its own Gain button in the header, and no Gain row in the body
- [ ] Gain 1: the button sits on the title line rather than above or below it
- [ ] Gain 1: one press gains exactly one unit, and a full store refuses the press
- [ ] Gain 1: switching panes swaps the button, so a press can never gain the previous resource
- [ ] Gain 1: the tab intro page has no Gain button, and leaving the tab and returning restores exactly one

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
