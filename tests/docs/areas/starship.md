# Starship

| | |
|---|---|
| **Status** | 🔴 RED |
| **Risk if broken** | High |
| **Group** | Interstellar |
| **Spec folder** | `tests/e2e/starship/` |
| **Existing coverage** | _none_ |

Starship construction, fitting, fuelling and interstellar travel to a chosen destination.

## What should be tested

- [ ] Starship build consumes correct materials and reports completion
- [ ] Component fitting (including Stellar Scanner) applies its effects
- [ ] Launch is blocked without a valid destination and sufficient fuel
- [ ] Travel timer runs to completion and triggers arrival
- [ ] Arrival at an O-type star fires the correct modal and grants the tech
- [ ] Expansionist philosophy speed and cost effects apply
- [ ] Travel survives save/load mid-flight

## Status meaning

🔴 **RED** — No spec file exists for this area at all. A regression here ships unnoticed.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
