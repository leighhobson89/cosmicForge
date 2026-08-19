# Megastructures

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Medium |
| **Group** | Endgame |
| **Spec folder** | `tests/e2e/megastructures/` |
| **Existing coverage** | `tests/legacy/captureMegaStructureTest.test.js` |

Ancient manuscripts and the factory stars they point at, conquering those stars, the five research stages of each structure and the bonuses they stack, the diagram and force field, the table that fills in, and Miaplacidus at the end.

## What should be tested

- [ ] Manuscripts are discoverable at the documented vision thresholds and cap at four
- [ ] Manuscript stars never repeat and never fall on Miaplacidus, a settled star, the home system or an O-type
- [ ] Activating a factory star marks its manuscript reported and registers the star
- [ ] Each megastructure gates on a five-stage prerequisite chain with rising prices
- [ ] Each stage applies its documented bonus: batteries, power plants, autobuyer rates, storage and infinite power
- [ ] Stage 3 of every structure lowers the force field one level and permanently unlocks antimatter
- [ ] Progress survives save/load
- [ ] Studying stars out to five light years turns up the first manuscript through the game's own roll
- [ ] A manuscript records its star, the star it points at, its position and that nobody has read it
- [ ] The four manuscripts point at four different stars, are numbered one to four, and there is never a fifth
- [ ] Settling the manuscript star is what flips it to reported and registers the factory star for real
- [ ] Reading a manuscript sets the achievement that records the find
- [ ] A read manuscript is no longer a subject the news ticker will hint at
- [ ] Conquering a factory star takes possession of exactly one structure and unlocks the Megastructures pane
- [ ] The Megastructures side-menu row appears only once a structure is held
- [ ] A factory star pays double the ascendency an ordinary conquest does
- [ ] Holding a structure is not enough: the run has to be standing in that system for its stages to be offered
- [ ] A megastructure run offers its own structure's five stages and no other structure's
- [ ] Dyson Sphere stage 1 doubles every battery and the energy store; stage 2 raises every power plant a quarter
- [ ] Dyson Sphere stage 3 lowers the field, unlocks antimatter for good and starts the structure producing it
- [ ] Dyson Sphere stages 4 and 5 switch the grid on permanently
- [ ] Plasma Forge stages multiply every resource autobuyer tier cumulatively to 6.5625x, skipping solar
- [ ] The Plasma Forge multiplier is measured in the store, not read off a rate
- [ ] Galactic Memory Archive stages add 100K, 1M, 1B and 10B of storage on top of one another
- [ ] The Celestial Processing Core grants nothing but its stage 3, and its stages are still recorded
- [ ] The diagram draws the field, the home system and all four structures, each with an image
- [ ] A structure lights up when its own stage 3 is taken, and only that structure
- [ ] The force field image is indexed by how many structures are disconnected, zero through four
- [ ] The home system only lights up when all four are disconnected
- [ ] Every diagram image follows the theme the player has chosen, and re-swaps when it changes
- [ ] The table lists four structures with five stages and five effects each, drawn from the catalogue
- [ ] A table cell is red until it is earned and green afterwards, name cells following possession
- [ ] A structure finished outright has its whole row tinted
- [ ] The force field falls one level per structure and no faster, whatever the other stages do
- [ ] Taking the field to its last level flags the endgame achievement
- [ ] Miaplacidus stays locked at three structures and becomes a destination at four

## Status meaning

🟢 **GREEN** — Done — the manuscripts are rolled by studying stars through the game's own tooling, the stages are bought through the real Technology rows, and every bonus is measured off the store, the grid or the rock rather than read back off a multiplier. The battle at a factory star is not re-fought here; that belongs to the Battle area, and this file drives the conquest handler every access point funnels into.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
