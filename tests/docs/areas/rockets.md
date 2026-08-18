# Rockets & Launch Pad

| | |
|---|---|
| **Status** | 🟠 AMBER |
| **Risk if broken** | Medium |
| **Group** | Space Operations |
| **Spec folder** | `tests/e2e/rockets/` |
| **Existing coverage** | _none_ |

Rocket construction, fuelling, naming and the launch lifecycle across all four rockets.

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
- [ ] Launch notifications resolve from the catalogue in all five languages with a {rocketName} placeholder

## Status meaning

🟠 **AMBER** — A spec file exists, but the area has not yet been through the integration upgrade — some of its coverage is still function-level rather than played through the UI.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
