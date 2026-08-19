# UI Navigation

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Medium |
| **Group** | Presentation & Shell |
| **Spec folder** | `tests/e2e/ui-navigation/` |
| **Existing coverage** | `tests/legacy/launch-app.test.js` |

Tabs, side-menu panes, hotkeys, tab ordering, collapsibles and attention markers, walked end to end across a full run.

## What should be tested

- [ ] A fresh run shows only the tabs it has unlocked, and the locked ones read ???
- [ ] Playing the run out unlocks every tab, each with its own name
- [ ] Clicking a tab brings its container group forward and puts the others away
- [ ] The number keys open the tab in that position, whatever order the tabs are in
- [ ] The tab order follows the game’s own priority table once chapters unlock
- [ ] Every option row opens a pane whose heading names it, and which actually draws content
- [ ] No two rows on a tab land on the same pane
- [ ] Walking every pane raises no console or page error
- [ ] Coming back to a tab reopens the pane you left it on
- [ ] Side-menu collapsibles open and close on their headers, and the section really collapses
- [ ] A megastructure run reveals its row, and the pane draws the diagram and all four structures
- [ ] Restoring the scanner array adds the two remaining Cosmic Rip panes, and all three draw
- [ ] The Cosmic Rip tab keeps working after the chapter opens it up
- [ ] Attention indicators highlight the right tabs and clear when addressed
- [ ] Every option row on every tab clears its attention marker when opened, driven through the real click path rather than a list of ids
- [ ] The tab badge clears once no option row on that tab still carries a marker
- [ ] The black hole 🌀 state marker is left alone by the novelty sweep
- [ ] The marker is positioned out of the layout flow, so a translated label keeps the full width of its control

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
