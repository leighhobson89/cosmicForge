# News Ticker

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Low |
| **Group** | Simulation & Ambience |
| **Spec folder** | `tests/e2e/news-ticker/` |
| **Existing coverage** | _none_ |

Rotating flavour content by category and interval, left to fire on its own timer and read off the screen.

## What should be tested

- [ ] The ticker fires by itself at the debug interval and scrolls a headline
- [ ] Turning the ticker off through Settings stops it, and turning it back on restarts exactly one timer
- [ ] A forced wacky headline arrives with a clickable effect, and clicking it changes the ticker
- [ ] A forced prize can be collected off the ticker, and the collection is recorded and cannot be repeated
- [ ] Left unforced, the ticker falls to a no-prize headline and records it as seen
- [ ] A forced manuscript clue names the outstanding star and never repeats a template
- [ ] A wacky headline arrives in whichever of the five languages the game is set to
- [ ] A manuscript clue is told in the current language and still names its star
- [ ] Each category produces only its own content
- [ ] Content is localized in all five languages and rebuilt on a language change
- [ ] The ticker does not leak timers when the setting is toggled
- [ ] A forced category with nothing eligible to say falls back instead of recursing

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
