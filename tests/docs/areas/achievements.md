# Achievements

| | |
|---|---|
| **Status** | 🟠 AMBER |
| **Risk if broken** | Low |
| **Group** | Meta Progression |
| **Spec folder** | `tests/e2e/achievements/` |
| **Existing coverage** | _none_ |

Unlock conditions, notifications, icons and tooltip descriptions across the full achievement set.

## What should be tested

- [ ] Each achievement fires exactly once when its condition is met
- [ ] No achievement fires prematurely on a fresh save
- [ ] Notifications are localized and show the correct icon
- [ ] Tooltip descriptions refresh with live values
- [ ] Achievement state survives rebirth and save/load
- [ ] The achievement flag array does not grow unbounded
- [ ] Discovering an asteroid on run 1 does not stop the frame loop
- [ ] The compound recipe table is a real object before any rebirth

## Status meaning

🟠 **AMBER** — A spec file exists, but the area has not yet been through the integration upgrade — some of its coverage is still function-level rather than played through the UI.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
