# Tech Tree

| | |
|---|---|
| **Status** | 🟠 AMBER |
| **Risk if broken** | High |
| **Group** | Core Economy |
| **Spec folder** | `tests/e2e/technology/` |
| **Existing coverage** | `tests/legacy/researchTech.test.js` |

Tech prerequisites, unlock effects, repeatable techs and the tree's deferred rendering.

## What should be tested

- [ ] Every tech unlocks only when its prerequisites are met
- [ ] Each tech applies its stated effect on purchase
- [ ] Repeatable techs scale cost and effect correctly across many purchases
- [ ] Tech unlock notifications fire once and are localized
- [ ] The 150-frame deferred tree re-render completes and produces correct ordering
- [ ] Unlocked tech state survives save/load and is correctly restored on rebirth

## Status meaning

🟠 **AMBER** — Partial coverage — a smoke test proves the path exists, but branches, failure modes and edge cases are unverified.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
