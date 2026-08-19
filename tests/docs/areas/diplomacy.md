# Diplomacy

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Interstellar |
| **Spec folder** | `tests/e2e/diplomacy/` |
| **Existing coverage** | _none_ |

Impression mechanics and every negotiation outcome branch before conquest.

## What should be tested

- [ ] Each diplomacy action shifts impression in the documented direction
- [ ] All outcome branches reachable and correct: surrender, vassalize, insulted, scared, laugh, neutral, reserved, patience
- [ ] Disengaging diplomacy permanently closes it for that system
- [ ] Voidborn philosophy improves diplomatic outcomes
- [ ] Fleet-strength ratio correctly enables guaranteed vassalization where the ascendency perk is owned
- [ ] Diplomacy state survives save/load
- [ ] The system scan is offered at three quarters of the journey and not before, and again on arrival
- [ ] Scanning is what unlocks the Colonise pane; without the scanner module the life signs read ??? 
- [ ] Every civilization level gets the reception it should: empty and unsentient systems are settled, inhabited ones negotiated with
- [ ] A disarmed system is settled rather than fought
- [ ] Every documented outcome of Bully, Passive, Harmony and Vassalize is reachable, and each one has the consequence it promises
- [ ] An aggressive race is never offered vassalage, however strong the fleet or high the admiration
- [ ] Courting a system into admiration is what unlocks vassalization at all
- [ ] Running a system out of patience ends the talking and puts the fleet on offer instead
- [ ] The conquest button reads Settle in the player's own language, and records that mode on the element

## Status meaning

🟢 **GREEN** — Upgraded to integration: a real starship flies to a real star, the scan gate is crossed at three quarters of the journey, and every conversation is held through the pane's own buttons. The outcome coverage is written as sweeps that repeat a press until every documented outcome is reached and assert the consequences of each one along the way. The area found known-issues #38 and #39, both fixed at source: the vassalize gate compared a trait array to a trait name, and taking offence at a passive approach never actually ended the system's patience. 29 specs passing.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
