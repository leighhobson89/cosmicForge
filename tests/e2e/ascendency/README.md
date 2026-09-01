# e2e / ascendency

**Ascendency Points & Perks** — 🟢 GREEN

The AP economy and permanent perk purchases, played through the Ascendency Perks pane, plus how the perk list reads once perks start being finished. Errors here permanently corrupt cross-run progress. The pane itself is the reference section of the large UI refactor (docs/largeUIRefactor.md, Phase 3): since that phase it is drawn by createRow on the newUI section grid rather than by createOptionRow, so its rows are .ui-row elements that also still carry the option-row class. Every id the frame loop writes into is unchanged, and tools/check-row-parity.mjs measures that nothing was dropped.

Specs for this area go in this folder, named `<scenario>.spec.js`.

Full test plan and checklist: [`tests/docs/areas/ascendency.md`](../../docs/areas/ascendency.md)
