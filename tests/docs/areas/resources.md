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
- [ ] Every resource name resolves to real copy in all five languages
- [ ] Driving every resource pane raises no console or page errors

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
