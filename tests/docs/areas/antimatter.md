# Antimatter

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Medium |
| **Group** | Space Operations |
| **Spec folder** | `tests/e2e/antimatter/` |
| **Existing coverage** | `tests/legacy/spaceAntimatter.test.js` |

Asteroid mining end to end: the extraction formula, its ascendency, star-type and boost modifiers, asteroid depletion, the megastructure contribution and the delta timer that drives all of it.

## What should be tested

- [ ] Choosing a destination and pressing Travel flies the rocket out and starts it mining
- [ ] Every unit of antimatter gained is a unit taken off the asteroid
- [ ] Extraction follows the ease-of-extraction formula at both ends of the scale
- [ ] An asteroid mines out exactly, never past zero, and sends the rocket home
- [ ] Depleting an asteroid pays the flat 150 achievement award on top of the rock
- [ ] The asteroid's remaining-quantity colour tracks how much is left
- [ ] The Enhanced Mining perk multiplies extraction by a quarter per purchase
- [ ] The antimatter boost doubles extraction while it is active
- [ ] The F-type star bonus applies in an F-type system and nowhere else
- [ ] A broken-down miner stops that rocket and only that rocket
- [ ] Two rockets on two asteroids both contribute to one total
- [ ] Each megastructure adds its 0.15 on top rather than replacing the last
- [ ] A megastructure produces antimatter with no asteroid being mined at all
- [ ] Megastructure output adds to mining output instead of replacing it
- [ ] A megastructure unlock survives the rebirth reset that otherwise clears it
- [ ] Antimatter starts locked with zero quantity on a fresh save
- [ ] Nothing accrues while antimatter is locked, however much time passes
- [ ] The reported rate is per tick, and the displayed rate is per second
- [ ] The all-time stat tracks what was actually gained
- [ ] Quantity and the megastructure grant survive a save/load round trip
- [ ] The mining option becomes reachable once antimatter is unlocked
- [ ] The antimatter delta timer is registered and repeating
- [ ] The accumulator banks sub-interval remainder rather than discarding it
- [ ] Elapsed time is conserved exactly across many small updates
- [ ] The time warp multiplier scales elapsed time proportionally
- [ ] An invalid or negative multiplier falls back to 1x instead of corrupting time

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
