# Rockets & Launch Pad

| | |
|---|---|
| **Status** | 🔴 RED |
| **Risk if broken** | Medium |
| **Group** | Space Operations |
| **Spec folder** | `tests/e2e/rockets/` |
| **Existing coverage** | _none_ |

Rocket construction, fuelling, naming and launch lifecycle.

## What should be tested

- [ ] Rocket build consumes correct materials and completes on schedule
- [ ] Fuelling consumes the right fuel type and rate
- [ ] Rocket renaming persists and displays everywhere
- [ ] Launch requires sufficient fuel and blocks otherwise
- [ ] In-flight rockets resume correctly after save/load
- [ ] Casino rocket-warp prize correctly fast-forwards a rocket

## Status meaning

🔴 **RED** — No automated coverage. A regression here ships unnoticed.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
