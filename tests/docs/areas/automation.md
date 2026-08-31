# Automation Persistence

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Medium |
| **Group** | Meta Progression |
| **Spec folder** | `tests/e2e/automation/` |
| **Existing coverage** | _none_ |

The automation settings a player has already paid an AP perk for, and which of them survive a rebirth: the space telescope automation and its chosen mode, and the research auto-buyer.

## What should be tested

- [ ] The telescope automation, its chosen mode and the research auto-buyer all survive a real rebirth
- [ ] A setting the player deliberately turned off comes back off — persistence means "as they left it", not "on"
- [ ] The restored settings are what the panes redraw with, so the player sees the automation already on
- [ ] The telescope automation starts a study on its own in the new run, on the mode that was chosen rather than the default
- [ ] The research auto-buyer unlocks a tech on its own in the new run, with nothing clicked
- [ ] A run that never bought the perks inherits nothing, even if the settings were forced on behind the game
- [ ] The automation left out of scope still resets: the autobuyer tier flags (autoSell is retired, and the P9 shares are carried deliberately)

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
