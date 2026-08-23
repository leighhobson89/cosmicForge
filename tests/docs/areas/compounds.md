# Compounds & Crafting

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Core Economy |
| **Spec folder** | `tests/e2e/compounds/` |
| **Existing coverage** | _none_ |

Crafting driven through the Compounds tab: the create dropdown and what it actually charges, localization of the recipe list, automatic creation behind the ascendency perk, storage upgrades including the water reservoir's second material, selling, and the precipitation that fills one compound out of the sky.

## What should be tested

- [ ] The shipped diesel recipe is 26 hydrogen and 12 carbon per unit
- [ ] Each fixed quantity in the dropdown crafts that many and charges the exact ratio
- [ ] The preview is the contract: what it says is exactly what the button does
- [ ] 'max' crafts everything the ingredients allow, limited by the scarcest one
- [ ] 'fill to capacity' stops at the storage cap rather than overfilling it
- [ ] Crafting past the cap is clamped and the waste is called out
- [ ] Crafting with too few ingredients makes nothing and takes nothing
- [ ] Every compound can be crafted through its own pane
- [ ] Every phrase the create dropdown is built from resolves in all six languages
- [ ] Every compound offers the full set of create options, each with text
- [ ] Switching language relabels the create dropdown on screen
- [ ] Crafting in another language still charges the right resources
- [ ] The Create button crafts diesel and deducts its ingredients in every supported language
- [ ] Every compound crafts in every language, whatever letters its ingredients are spelled with
- [ ] The auto-create toggle is hidden until the compoundAutomation perk is bought
- [ ] Switching auto-create on crafts continuously and consumes the ingredients
- [ ] Auto-create needs the grid, and stops at the storage cap
- [ ] Auto-create switches off auto-sell on the resources it eats
- [ ] Increase Storage doubles the cap and charges the old cap for every simple compound
- [ ] The water reservoir charges water and concrete together
- [ ] A second reservoir costs the new, larger amounts of both materials
- [ ] Filling a compound to its cap raises a storage-full notification
- [ ] The Sell button sells exactly the previewed amount and pays for it
- [ ] The quantity selector decides how much the Sell button sells
- [ ] Sell All empties every unlocked compound and then disables itself
- [ ] Every compound name is localized in all six languages
- [ ] Driving every compound pane raises no console or page errors
- [ ] The star system rains one compound, drawn from the shipped weighted table
- [ ] With the weather clear, nothing arrives from the sky
- [ ] While it rains, the precipitation type fills up and no other compound does
- [ ] Clearing the weather stops the compound filling
- [ ] Precipitation stops at the storage cap rather than overfilling it

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
