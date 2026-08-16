# Philosophies

| | |
|---|---|
| **Status** | 🔴 RED |
| **Risk if broken** | High |
| **Group** | Meta Progression |
| **Spec folder** | `tests/e2e/philosophies/` |
| **Existing coverage** | _none_ |

The four permanent player paths chosen once and affecting the whole account thereafter.

## What should be tested

- [ ] The choice modal appears at the correct trigger and only once
- [ ] Each of Constructor, Supremacist, Voidborn, Expansionist applies its full documented effect set
- [ ] Effects activate only after the first rebirth, as documented
- [ ] The choice is irreversible and survives save/load and rebirth
- [ ] Philosophy modifiers stack correctly with ascendency perks and star types

## Status meaning

🔴 **RED** — No automated coverage. A regression here ships unnoticed.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
