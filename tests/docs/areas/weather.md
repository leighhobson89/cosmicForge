# Weather

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Low |
| **Group** | Simulation & Ambience |
| **Spec folder** | `tests/e2e/weather/` |
| **Existing coverage** | _none_ |

The weather cycle, the solar penalty each state applies, the particle overlay and ambience, the precipitation path and the launch hold.

## What should be tested

- [ ] A run always holds a live [system, efficiency, type] state drawn from its own system's table
- [ ] Each state carries the efficiency its star publishes: sunny 1, cloudy 0.6, rain 0.4, volcano 0.05
- [ ] A window that runs out rolls the next state by itself and clears the effect the old one was running
- [ ] The debug Clear Weather button forces full sun, and Endless Summer overrides the draw however the table is weighted
- [ ] The system stat shows the output percentage and the state's symbol, coloured by severity, labelled with the system
- [ ] Each state scales solar generation by exactly its efficiency, measured off the grid rate with the other plants switched off
- [ ] The penalty is applied once per window rather than compounded every frame, and plants bought mid-window are rained on too
- [ ] Only the solar plant is affected — the carbon plant burns on unchanged under a volcano
- [ ] The solar row reports the efficiency as a percentage with the state's symbol, coloured by severity
- [ ] Rain runs the raindrop overlay and the rain ambience, and a volcano runs the lava overlay and the eruption ambience, never both
- [ ] Rain accrues the system's own precipitation compound at a rolled 0.01-0.04 rate; a clear sky accrues nothing
- [ ] Rain and volcano ground a fuelled rocket and say why, and the same rocket is cleared the moment the sky clears
- [ ] Both severe states announce themselves to the player
- [ ] Turning the particle setting off stops the effect at once without stopping the weather, and back on resumes it
- [ ] The overlay is emptied when the weather turns fair, and no ambience plays at all with background audio off
- [ ] The variable debugger's weather row survives a no-op edit
- [ ] Three severe windows may run back to back; the fourth severe draw is turned into a cloudy window of a fixed one minute, and the streak restarts
- [ ] The severe-weather streak is kept across a focus change and comes back with a saved game, and still grants the launch window it was owed
- [ ] The run's collected-precipitation total moves only while it is raining, and by exactly what fell into the store

## Status meaning

🟢 **GREEN** — Done — every state reached through the game's own weighted draw and the solar penalty measured off the grid, 36 specs passing. Found and closed known-issues #31, #33, #46 and #48.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
