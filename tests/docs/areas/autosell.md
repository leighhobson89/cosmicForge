# Autosell & Production Allocation

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Core Economy |
| **Spec folder** | `tests/e2e/autosell/` |
| **Existing coverage** | _none_ |

P9's production allocation: one slider on each resource's own pane divides that material's allocatable production (gross less fuel burn) between cash, a ceiling offered to auto-creating compounds, and storage. Covers the split arithmetic, the equal division of a ceiling between competing recipes, the Nano Brokers perk ladder that unlocks it, the migration of saves holding the retired tech and perk, the row the slider replaces, and the displays and tooltips that have to agree with the engine.

## What should be tested

- [ ] The split holds: 10% to cash leaves 90% accumulating
- [ ] Stored stock is never drained - the regression test for the whole complaint
- [ ] Cash keeps flowing once the store is full
- [ ] Fuel comes off the top, so a cash setting cannot black out the grid
- [ ] Dragging the cash handle back to zero is a true bypass - there is no toggle to do it with
- [ ] The shares are a partition: cash and compounds can never exceed 100%
- [ ] Both compounds create - neither is starved by the other
- [ ] The split is equal, not proportional to what each recipe wants
- [ ] A surplus falls through to storage, and does not reach the other compound
- [ ] The compound share is a ceiling the draw never exceeds
- [ ] An unused ceiling becomes storage, never cash
- [ ] A compound bottlenecked elsewhere returns the ingredients it cannot use
- [ ] Auto-create no longer overwrites an ingredient's allocation
- [ ] The outcome does not depend on which timer fired first
- [ ] The retired Nano Brokers tech is gone from the tree, and nothing depends on it
- [ ] A fresh run owns nothing, and the sell rows are the manual ones
- [ ] Level 1 buys autosell and nothing more
- [ ] Level 2 buys auto-create but not the autobuyer tiers
- [ ] A level applies immediately, without a reload or a rebirth
- [ ] The ladder cannot be bought past its cap, or without the AP
- [ ] The perk row states what each level grants, in every language
- [ ] At level 1 the line has one handle; at level 2, two - but only where a recipe draws
- [ ] The compound share is remembered while the band is not shown
- [ ] A save that researched the old tech comes back at level 1, free
- [ ] A save that owned the old perk comes back at level 3, free - it keeps everything it had
- [ ] A save holding both maps to 3, not 4
- [ ] A save already on the ladder is left exactly as it is
- [ ] A save with neither unlock opens at level 0, behaving as before
- [ ] A stale autoSell flag does not reproduce the old drain-to-100
- [ ] The 0.99 patch rung clears autoSell out of an old save
- [ ] An auto-creating compound no longer locks its ingredient's sell row
- [ ] The handles actually move the stored shares
- [ ] The compound band does not exist at level 1
- [ ] Helium never gets a compound band, even at level 3
- [ ] Compounds keep manual selling and get no slider
- [ ] The row stays one line - the Fuse button keeps its alignment
- [ ] The Fuse button says Fuse All once the quantity dropdown is gone
- [ ] Fusing takes the whole stock, since there is no amount to choose
- [ ] The readout is three destinations and no total
- [ ] The compound Create row carries the shared info marker
- [ ] There is no autosell toggle left to find, on a resource row or a compound one
- [ ] The storage figure moves with the cash handle, and agrees with the engine
- [ ] Hovering the bar explains it, in the player's own numbers
- [ ] At level 1 the tooltip says nothing about compounds
- [ ] The breakdown accounts for every unit produced
- [ ] The pane rate is the net accumulation rate, not the gross
- [ ] A store under allocation can fill, and says so
- [ ] The compound tooltip names the ingredient holding it back
- [ ] The compound figure is the draw, and the storage figure absorbs the rest
- [ ] Every new string resolves in every supported language
- [ ] The retired tech strings are gone from the catalogue

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
