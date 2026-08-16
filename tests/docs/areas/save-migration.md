# Save Migration

| | |
|---|---|
| **Status** | 🔴 RED |
| **Risk if broken** | High |
| **Group** | Foundation |
| **Spec folder** | `tests/e2e/save-migration/` |
| **Existing coverage** | _none_ |

The patches.js version ladder that upgrades old saves. The best-engineered code in the project and entirely untested.

## What should be tested

- [ ] A save at each historical version migrates cleanly to current
- [ ] Migration is idempotent — running it twice changes nothing the second time
- [ ] Version below minimum is clamped, version above current is left alone
- [ ] The blackHoleNerfPatched flag prevents double-application of the power rescale
- [ ] Autobuyer display-name to localization-key migration converts every old name (this one guards the entire localization release for returning players)
- [ ] A save with missing or malformed sections migrates without throwing

## Status meaning

🔴 **RED** — No automated coverage. A regression here ships unnoticed.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
