# News Ticker

| | |
|---|---|
| **Status** | 🟠 AMBER |
| **Risk if broken** | Low |
| **Group** | Simulation & Ambience |
| **Spec folder** | `tests/e2e/news-ticker/` |
| **Existing coverage** | _none_ |

Rotating flavour content by category and interval.

## What should be tested

- [ ] Ticker cycles at the configured interval and replaces rather than stacks its timer
- [ ] Each category produces only its own content
- [ ] Content is localized in all five languages and rebuilt on a language change
- [ ] Ticker does not leak timers when the setting is toggled

## Status meaning

🟠 **AMBER** — A spec file exists, but the area has not yet been through the integration upgrade — some of its coverage is still function-level rather than played through the UI.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
