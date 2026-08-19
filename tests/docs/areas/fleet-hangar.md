# Fleet Hangar

| | |
|---|---|
| **Status** | 🟢 GREEN |
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
- [ ] The Fleet Hangar is unreachable, and no ship can be built, until the hangar module is finished
- [ ] Every ship class charges its advertised cash and all three of its advertised materials, to the unit
- [ ] Every purchase makes that class 13% dearer in every line, and three bought in a row are charged three times
- [ ] The envoy is capped at one, and the frame loop disables its own Build button once it exists
- [ ] The five classes are five different jobs: the envoy fights nothing, and the combat classes cover air, land and sea at different speeds and prices
- [ ] A hand-built mixed fleet reports the attack and defense it was bought, and the pane agrees with the data object

## Status meaning

🟢 **GREEN** — Upgraded to integration: the hangar module is proved to be the gate on shipbuilding by finishing the other three starship modules and leaving it out, then every class is bought through its own Build button and its bill and price escalation measured to the unit. The envoy cap is asserted as the CSS gate it is rather than by clicking a disabled button. 29 specs passing.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
