# Rockets & Launch Pad

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Medium |
| **Group** | Space Operations |
| **Spec folder** | `tests/e2e/rockets/` |
| **Existing coverage** | _none_ |

The launch pad and the four rockets from purchase to landing: module pricing, assembly, naming, fuelling, launch, destination choice, the travel timer and the reset that lets a rocket fly again.

## What should be tested

- [ ] All four rockets exist with parts, price and a fuel requirement
- [ ] Every rocket is paid for in three real compounds
- [ ] Later rockets need more parts than earlier ones
- [ ] Every rocket has a fuel autobuyer with a rate, price and energy cost
- [ ] No rocket is built, fuelling or launched on a fresh game
- [ ] getFuelLevel reports the exact percentage loaded and clamps to 0..100
- [ ] Every rocket reports a full tank at its own capacity, not a shared one
- [ ] The debug chain builds the launch pad, scanner and all four rockets to completion
- [ ] Launching records the rocket, sets the achievement flag and announces it by the player’s name for it
- [ ] Launching succeeds regardless of which option pane is open
- [ ] Each rocket launches independently of the others
- [ ] A renamed rocket keeps its name, renaming one does not rename another, and names survive serialisation
- [ ] Resetting a rocket for its next journey empties its tank
- [ ] The rocket direction flag round-trips per rocket
- [ ] Launch notifications resolve from the catalogue in all six languages with a {rocketName} placeholder
- [ ] The Launch Pad quotes four prices, is unbuilt on a fresh run, and its row is on offer
- [ ] Building the pad pays cash, iron, titanium and concrete out of the run, marks it bought and withdraws the offer
- [ ] The pad announces itself and is what puts the four airframe rows on the workbench
- [ ] The pad's Build button is colour-gated while the run cannot afford it, and the gate lifts when it can
- [ ] Each airframe needs its own strictly larger number of parts, and its row counter says so
- [ ] Every part is paid for in cash and three real compounds, deducted by the frame loop
- [ ] Each part fitted multiplies all four prices by the game cost multiplier, compounding rather than stepping
- [ ] One rocket getting dearer leaves the other three on their opening price
- [ ] Fitting the last part completes the rocket, closes the row and registers it in the fleet
- [ ] A rocket cannot be built past its part count, and is registered once rather than repeatedly
- [ ] A finished rocket gets a side-menu pane of its own; an unfinished one does not
- [ ] All four can be built by hand, and each costs the geometric total its part count implies
- [ ] A rocket pane is headed by an editable name field capped at twelve characters, plus a Rename button
- [ ] Renaming through the button or with Enter reaches the record, the side menu and the redrawn pane
- [ ] Renaming one rocket leaves the other three alone
- [ ] Each rocket has its own tank size, pump price, pump rate and energy draw, all ascending
- [ ] Pressing Fuel starts the pump, hides the button, and the Launch button reports the level loaded
- [ ] The pump is colour-gated on holding its price in cash, and stops with an explanation when the grid goes down
- [ ] A full tank turns the Launch button green, says Ready For Launch, and stops at its own capacity
- [ ] Launching hides the fuel row, records the flight and announces it by the player's chosen name
- [ ] Each rocket is fuelled and launched on its own rather than as a fleet
- [ ] The destination dropdown offers the free rocks nearest first, carrying each one's real distance, rarity and antimatter
- [ ] Choosing a rock records it as the rocket's destination
- [ ] The flight is timed by distance over speed, and the row counts it down in seconds while the bar fills in proportion
- [ ] Arriving names the rock in the row and announces the rocket by name
- [ ] The return leg reports itself differently from the outbound one, and landing empties the tank
- [ ] A rocket that has come home can be fuelled, launched and flown to a second rock
- [ ] Two rockets fly independent journeys with their own timers, destinations and arrivals

## Status meaning

🟢 **GREEN** — Done — the launch pad and all four rockets are bought part by part through their own buttons, renamed in the header field, fuelled by pressing Fuel and flown twice over, so the reset is proved by the second journey rather than by reading state back. The area found known-issues #36, now fixed at source: the notation formatter was rewriting the digits inside an asteroid's name.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
