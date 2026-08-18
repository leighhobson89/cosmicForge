# Ascendency Points & Perks

| | |
|---|---|
| **Status** | 🟠 AMBER |
| **Risk if broken** | High |
| **Group** | Meta Progression |
| **Spec folder** | `tests/e2e/ascendency/` |
| **Existing coverage** | _none_ |

The AP economy and permanent perk purchases. Errors here permanently corrupt cross-run progress.

## What should be tested

- [ ] AP awarded on conquest and settlement matches the documented formula
- [ ] Each perk applies its stated effect and cannot be bought twice
- [ ] AP spend is atomic — a failed purchase refunds fully
- [ ] AP cannot go negative under any sequence of purchases
- [ ] Perks persist across rebirth (they are the point of rebirth)
- [ ] Buff stacking with philosophies and star types produces documented totals

## Status meaning

🟠 **AMBER** — A spec file exists, but the area has not yet been through the integration upgrade — some of its coverage is still function-level rather than played through the UI.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
