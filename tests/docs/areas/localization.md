# Localization

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Foundation |
| **Spec folder** | `tests/e2e/localization/` |
| **Existing coverage** | _none_ |

Language resolution, switching, persistence and full-catalogue integrity across five languages.

## What should be tested

- [ ] Boot resolves language in the correct order: explicit > stored > navigator > English
- [ ] Chosen language persists across a full restart
- [ ] An unsupported or corrupt stored language falls back without breaking boot
- [ ] localStorage being unavailable degrades the preference instead of breaking boot
- [ ] The Settings language selector and the debug switcher share one redraw path
- [ ] Switching language refreshes every tab, not only the active one
- [ ] A tab is identified by its canonical English name, not its translated label
- [ ] Opening a tab for the first time renders a real intro page in every language
- [ ] No raw localization key (camelCase identifier) is ever visible on screen, in any language, on any tab
- [ ] validateLocalization.cjs passes — run it as an assertion, not just a manual script
- [ ] The catalogue has key parity, string-only values, no duplicates and no armed ${} template literals
- [ ] Dynamically constructed keys resolve: resource*, compound*, autoBuyerName*, eventName*, buffName*, starShipModule*, fleetShip*
- [ ] Every statically-authored label in index.html renders from its data-loc key
- [ ] The onboarding tutorial, including its text-matched targets, works in every language
- [ ] No language overflows the viewport horizontally on any tab
- [ ] Translation clips no control that English does not already clip
- [ ] The compound reverse lookup honours its language argument and stays within the frame budget
- [ ] Event history rows render their name from the canonical event id, not the name stored in the save
- [ ] Nothing calls localize() before initLocalization() has fetched the catalogue
- [ ] Every constructed key family resolves from source, so no catalogue key is unreachable and none the source asks for is missing
- [ ] No catalogue value is empty except the three sanctioned casino suffixes
- [ ] Purchase-row cost labels resolve to the label rather than the flavour-text container that shares their id
- [ ] Cost labels are rewritten into priced spans, so the notation formatter reaches them and their material names follow a language change
- [ ] The welcome modal offers five clickable flags above the pioneer-name field, drawn from images/flags/
- [ ] The flag bar is nine grid columns over two rows, 40% of the modal wide, with each flag 50px tall and its code centred beneath it
- [ ] Clicking flags is free: the language is committed once, when the welcome modal is confirmed
- [ ] A new game started from a flag runs in that language throughout, onboarding prompt included
- [ ] The flag bar opens on the language already resolved for a returning player, and English by default
- [ ] A power plant can still be switched on when the game is in a language other than English
- [ ] Controls that carry state do so on the element, not in their own rendered text
- [ ] The trade summary's not-applicable marker is translated and still drives the summary
- [ ] The pioneer-name modal's load hint is translated

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
