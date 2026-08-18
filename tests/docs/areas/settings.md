# Settings & Preferences

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Medium |
| **Group** | Foundation |
| **Spec folder** | `tests/e2e/settings/` |
| **Existing coverage** | _none_ |

Every control on the three Options panes — currency, notation, notifications, custom pointer, mouse trail, theme, weather effects, full screen, language, news ticker, background audio, SFX and autosave — driven through the real toggles and dropdowns.

## What should be tested

- [ ] The Visual pane renders all seven of its rows, each with its own input
- [ ] The Game Options pane renders all five of its rows
- [ ] The Saving / Loading pane renders its autosave, export and import rows
- [ ] Every control opens showing the value the game currently holds
- [ ] The custom pointer toggle drives the body classes and builds or tears down the pointer
- [ ] The mouse trail toggle stops and starts particles actually spawning
- [ ] Choosing a theme repaints the document and records it as tried
- [ ] Every theme in the dropdown is selectable and paints the body
- [ ] Switching notation changes how figures are rendered on screen
- [ ] The currency symbol carries through to what a sale is quoted in
- [ ] Switching notifications off actually stops them appearing
- [ ] The news ticker toggle adds and removes the real ticker timer
- [ ] The weather effects toggle gates the overlay animation
- [ ] The background audio toggle drives the player, not just the flag
- [ ] The sfx toggle silences the effects player
- [ ] Switching language relocalizes the running game, not just the flag
- [ ] Every language in the dropdown round-trips without stranding the UI
- [ ] The full screen button reaches the fullscreen API
- [ ] Choosing an autosave frequency stores it and reschedules the timer
- [ ] Turning autosave off warns the player, and turning it back on is silent

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
