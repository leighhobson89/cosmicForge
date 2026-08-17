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
- [ ] Dynamically constructed keys resolve: resource*, compound*, autoBuyerName*
- [ ] Every statically-authored label in index.html renders from its data-loc key
- [ ] The onboarding tutorial, including its text-matched targets, works in every language
- [ ] No language overflows the viewport horizontally on any tab
- [ ] Translation clips no control that English does not already clip
- [ ] The compound reverse lookup honours its language argument and stays within the frame budget

## Status meaning

🟢 **GREEN** — Comprehensive coverage — happy path, branches, boundaries and failure modes all asserted.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
