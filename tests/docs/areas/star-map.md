# Star Map & Star Data

| | |
|---|---|
| **Status** | 🔴 RED |
| **Risk if broken** | Medium |
| **Group** | Interstellar |
| **Spec folder** | `tests/e2e/star-map/` |
| **Existing coverage** | _none_ |

Galaxy map rendering, star selection, study results and the star data panel.

## What should be tested

- [ ] Map renders all stars with correct types and positions
- [ ] Selecting a star populates the data panel
- [ ] Unstudied stars show unknown values; studied stars reveal them progressively
- [ ] Stellar Scanner presence changes what can be determined
- [ ] Destination selection gates on study completeness

## Status meaning

🔴 **RED** — No automated coverage. A regression here ships unnoticed.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
