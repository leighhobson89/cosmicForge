# Fleet Hangar

| | |
|---|---|
| **Status** | 🟠 AMBER |
| **Risk if broken** | High |
| **Group** | Interstellar |
| **Spec folder** | `tests/e2e/fleet-hangar/` |
| **Existing coverage** | _none_ |

Fleet construction, ship classes and the aggregate strength calculation that feeds battle.

## What should be tested

- [ ] Each ship class builds with the correct cash and material cost
- [ ] Fleet strength aggregates correctly across mixed compositions
- [ ] Only the combat classes join attack and defense; the envoy is capped at one and contributes nothing
- [ ] Losing a unit in battle removes it and its strength from the aggregate
- [ ] Supremacist hangar automation cuts every fleet cost by 5% and leaves other space upgrades alone
- [ ] Supremacist laser intensity, engine miniaturization and synthetic plating raise attack, speed and unit health by 5% each
- [ ] Attack power buffs apply only to newly built ships, as documented
- [ ] Building a ship flags the fleet as changed for diplomacy
- [ ] Fleet composition survives save/load

## Status meaning

🟠 **AMBER** — A spec file exists, but the area has not yet been through the integration upgrade — some of its coverage is still function-level rather than played through the UI.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
