# Philosophies

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Meta Progression |
| **Spec folder** | `tests/e2e/philosophies/` |
| **Existing coverage** | _none_ |

The four permanent player paths chosen once and affecting the whole account thereafter.

## What should be tested

- [ ] All twenty upgrades - four repeatables and one special ability on each of the four paths - are bought through their own buttons on the Philosophy pane, on run 2
- [ ] Each purchase charges its price from research and raises it by the cost multiplier
- [ ] Each repeatable moves only its own slot and has only its own documented effect, leaving every other path's board untouched
- [ ] The special ability unlocks once, reports itself spent and stops accepting clicks
- [ ] Constructor's ability takes a storage upgrade from doubling to quintupling, measured on the real button
- [ ] Supremacist's ability turns the 75% vassalize roll into a certainty, with the ability off as the control
- [ ] Voidborn's ability reveals the telescope pillage row and a pillage actually pays out
- [ ] Expansionist's ability settles the neighbours a conquest earned, one galactic point each
- [ ] The choice modal appears at its real trigger and only while no philosophy is set
- [ ] The Philosophy row is hidden on run 1 and revealed by the run-1 rebirth; repeatables bought on run 2 are replayed into run 3
- [ ] The Voidborn AP bonus applies only from run 2, as documented
- [ ] Every philosophy name resolves from the catalogue in all six languages and no button clips its translated label
- [ ] The choice survives save/load, and the debug scenario defaults run 1 to Voidborn

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
