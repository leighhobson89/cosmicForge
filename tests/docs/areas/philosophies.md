# Philosophies

| | |
|---|---|
| **Status** | 🟠 AMBER |
| **Risk if broken** | High |
| **Group** | Meta Progression |
| **Spec folder** | `tests/e2e/philosophies/` |
| **Existing coverage** | _none_ |

The four permanent player paths chosen once and affecting the whole account thereafter.

## What should be tested

- [ ] The choice modal appears at the correct trigger and only while no philosophy is set
- [ ] All four paths carry one special ability and four non-overlapping repeatables
- [ ] Each of Constructor, Supremacist, Voidborn, Expansionist applies its own documented effect set and no other path’s
- [ ] The Voidborn AP bonus applies only from run 2, as documented
- [ ] The Supremacist ability guarantees vassalization where other paths must roll
- [ ] The choice survives save/load, and the debug scenario defaults run 1 to Voidborn
- [ ] The four choice-button labels are hardcoded English (known-issues #13)
- [ ] Every philosophy name resolves from the catalogue in all five languages
- [ ] The modal renders localized names and no button clips its translated label

## Status meaning

🟠 **AMBER** — A spec file exists, but the area has not yet been through the integration upgrade — some of its coverage is still function-level rather than played through the UI.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
