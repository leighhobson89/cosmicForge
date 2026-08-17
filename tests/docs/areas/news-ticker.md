# News Ticker

| | |
|---|---|
| **Status** | 🟢 GREEN |
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

🟢 **GREEN** — Comprehensive coverage — happy path, branches, boundaries and failure modes all asserted.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
