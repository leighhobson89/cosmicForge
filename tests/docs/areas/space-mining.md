# Space Mining & Asteroids

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Medium |
| **Group** | Space Operations |
| **Spec folder** | `tests/e2e/space-mining/` |
| **Existing coverage** | _none_ |

The asteroid survey the telescope creates, the Asteroids and Mining panels that display it, the boost gesture, and a rocket flown out, mined dry and brought home.

## What should be tested

- [ ] A real telescope scan run to completion adds a complete asteroid record, keyed by its own name and full to its original quantity
- [ ] Ordinary asteroids are named for the star system that found them; legendaries are named for the commander
- [ ] Every rock holds antimatter inside the band its rarity promises, with complexity 1-6 and distance 30,000-570,000, each coloured by its own band
- [ ] The antimatter colour never promises more than the rarity can deliver, and the Asteroid Scanner Boost raises the floor of the rarity table
- [ ] Each find compounds the base scan duration by 7%, and the survey caps uninteracted rocks at 100 without ever pruning one being mined
- [ ] The Asteroids panel shows one row per rock with the record's own numbers, and draws nothing at all before the first find
- [ ] All four legend columns sort, only one at a time, and the table orders nearest-first and richest-first on demand
- [ ] A rock being mined is coloured active and sorts last; an exhausted one is dimmed, greyed in every column and sorts last of all
- [ ] The Mining panel draws a box per rocket, an arrow labelled with the rate that rock's complexity implies, and the rate bar
- [ ] The side-menu readouts report the rate per second and the stock whole, green while producing and orange when idle
- [ ] Holding the rate bar doubles extraction and releasing it restores it, measured off the rock rather than read off a flag
- [ ] The bar doubles its fill and recolours while held, the caption appears on hover, sliding off releases it, and a dead mine cannot be boosted
- [ ] The boost sound loops only while the boost is held, and stays silent when sound effects are off
- [ ] Two rockets on two rocks add up to one total; the last tick is clamped to what is left; originalQuantity is never touched
- [ ] The megastructure contribution adds to mining rather than replacing it
- [ ] A rocket flies out on its own Travel button, over a flight as long as the distance makes it, and mines where it lands
- [ ] A rock worked dry turns its rocket round, drops the boost, earns its achievement, and the return leg leaves the rocket empty and ready to fly again
- [ ] A spent rock, and one another rocket has already claimed, are both dropped from the destination dropdown

## Status meaning

🟢 **GREEN** — Done — the survey, both panels, the boost gesture and a full outbound-and-home journey driven through their own controls, 44 specs passing. Found and closed known-issues #31 and #34.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
