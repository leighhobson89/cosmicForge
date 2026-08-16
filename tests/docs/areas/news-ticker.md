# News Ticker

| | |
|---|---|
| **Status** | 🔴 RED |
| **Risk if broken** | Low |
| **Group** | Simulation & Ambience |
| **Spec folder** | `tests/e2e/news-ticker/` |
| **Existing coverage** | _none_ |

Rotating flavour content by category and interval.

## What should be tested

- [ ] Ticker cycles at the configured interval
- [ ] Each category produces only its own content
- [ ] Content is localized in all five languages
- [ ] Ticker does not leak timers when the tab changes

## Status meaning

🔴 **RED** — No automated coverage. A regression here ships unnoticed.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
