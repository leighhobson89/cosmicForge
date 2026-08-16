# UI Navigation

| | |
|---|---|
| **Status** | 🟠 AMBER |
| **Risk if broken** | Medium |
| **Group** | Presentation & Shell |
| **Spec folder** | `tests/e2e/ui-navigation/` |
| **Existing coverage** | `tests/legacy/launch-app.test.js` |

Tabs, side-menu panes, hotkeys, tab ordering, collapsibles and tooltips.

## What should be tested

- [ ] All nine tabs open and render their default pane
- [ ] Every side-menu option opens its pane without error
- [ ] Tab hotkeys map to the right tabs and update when tab order changes
- [ ] Tabs appear only once unlocked, in the correct order
- [ ] Collapsible sections toggle and persist state
- [ ] Tooltips appear with correct localized content
- [ ] Attention indicators highlight the right tabs and clear when addressed

## Status meaning

🟠 **AMBER** — Partial coverage — a smoke test proves the path exists, but branches, failure modes and edge cases are unverified.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
