# Diplomacy

| | |
|---|---|
| **Status** | 🔴 RED |
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

## Status meaning

🔴 **RED** — No automated coverage. A regression here ships unnoticed.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
