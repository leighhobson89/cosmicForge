# Save Migration

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Foundation |
| **Spec folder** | `tests/e2e/save-migration/` |
| **Existing coverage** | _none_ |

The patches.js version ladder that upgrades old saves. Driven through the real Import button on aged saves, including a version bump and an extra rung served by route interception.

## What should be tested

- [ ] A save at each historical version in the ladder migrates cleanly to current
- [ ] Migration is idempotent — re-running the ladder over migrated data changes nothing
- [ ] Version below the minimum is refused outright and the live run is untouched
- [ ] Version above current is passed through unchanged rather than re-migrated
- [ ] The blackHoleNerfPatched flag prevents double-application of the power rescale
- [ ] Autobuyer display-name to localization-key migration converts every old name, and the pane renders the localized name
- [ ] A save with missing or malformed sections migrates without throwing
- [ ] A newly added rung carries a previous-version save up, and leaves an already-current save alone
- [ ] Adding a version never modifies the source files on disk

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
