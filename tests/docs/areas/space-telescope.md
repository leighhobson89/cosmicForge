# Space Telescope

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Medium |
| **Group** | Space Operations |
| **Spec folder** | `tests/e2e/space-telescope/` |
| **Existing coverage** | _none_ |

The three telescope actions - star study, asteroid search, void pillage - the one instrument they share, and their auto-repeat.

## What should be tested

- [ ] The telescope is bought through its own button and charges cash, iron, glass and silicon at the listed prices
- [ ] Buying it opens the Scan Asteroids and Study Stars rows on the pane the player is standing on (fails: known-issues #22)
- [ ] An unaffordable telescope is gated by red-disabled-text, and the gate lifts when the cash arrives
- [ ] A search run to completion adds a real asteroid record - name, distance, rarity, quantity - and reveals the Asteroids pane
- [ ] Every asteroid found makes the next search 7% longer, and a missed search costs nothing
- [ ] A search in flight makes no progress while the grid is down, and resumes when power returns
- [ ] A star study run to completion extends the vision range by one increment and puts more systems on the star map
- [ ] The three actions share one instrument: starting any of them shuts the gate on the other two
- [ ] Voidborn's Void Seers adds the pillage row and takes the same lock; without the ability the row stays hidden
- [ ] The auto-telescope perk's row repeats the selected mode with no further presses

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
