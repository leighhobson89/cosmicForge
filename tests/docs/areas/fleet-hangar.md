# Fleet Hangar

| | |
|---|---|
| **Status** | 🔴 RED |
| **Risk if broken** | High |
| **Group** | Interstellar |
| **Spec folder** | `tests/e2e/fleet-hangar/` |
| **Existing coverage** | _none_ |

Fleet construction, ship classes and the aggregate strength calculation that feeds battle.

## What should be tested

- [ ] Each ship class builds with correct cost and build time
- [ ] Fleet strength aggregates correctly across mixed compositions
- [ ] Supremacist philosophy cost and strength modifiers apply
- [ ] Ascendency fleet buffs (armor, speed, attack) apply and stack correctly
- [ ] Attack power buffs apply only to newly built ships, as documented
- [ ] Fleet composition survives save/load

## Status meaning

🔴 **RED** — No automated coverage. A regression here ships unnoticed.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
