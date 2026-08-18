# Space Mining & Asteroids

| | |
|---|---|
| **Status** | 🔴 RED |
| **Risk if broken** | Medium |
| **Group** | Space Operations |
| **Spec folder** | `tests/e2e/space-mining/` |
| **Existing coverage** | _none_ |

Asteroid discovery, mining rockets, extraction rates and star-type bonuses.

## What should be tested

- [ ] Asteroid search finds asteroids and populates their composition
- [ ] Mining rockets can be assigned, launched and recalled
- [ ] Extraction rate matches the displayed value, including the Type F star 50% bonus
- [ ] Asteroid depletion ends mining and frees the rocket
- [ ] Multiple concurrent mining operations do not interfere
- [ ] Mining state survives save/load mid-operation

## Status meaning

🔴 **RED** — No spec file exists for this area at all. A regression here ships unnoticed.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
