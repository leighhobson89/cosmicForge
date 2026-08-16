# Star Type Bonuses

| | |
|---|---|
| **Status** | 🔴 RED |
| **Risk if broken** | Medium |
| **Group** | Interstellar |
| **Spec folder** | `tests/e2e/star-types/` |
| **Existing coverage** | _none_ |

Per-star-type passive bonuses — the most recently changed area of the game and entirely uncovered.

## What should be tested

- [ ] Type B grants the resource autobuyer bonus at the documented magnitude
- [ ] Type F grants the 50% asteroid extraction bonus
- [ ] Type O grants its technology and is correctly gated
- [ ] Each remaining star type applies its own bonus and no others
- [ ] Bonuses apply on arrival and are removed when leaving the system
- [ ] Bonuses stack correctly with philosophy and ascendency effects

## Status meaning

🔴 **RED** — No automated coverage. A regression here ships unnoticed.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
