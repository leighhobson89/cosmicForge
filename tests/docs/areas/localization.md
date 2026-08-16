# Localization

| | |
|---|---|
| **Status** | 🔴 RED |
| **Risk if broken** | High |
| **Group** | Foundation |
| **Spec folder** | `tests/e2e/localization/` |
| **Existing coverage** | _none_ |

Language resolution, switching, persistence and full-catalogue integrity across five languages.

## What should be tested

- [ ] Boot resolves language in the correct order: explicit > stored > navigator > English
- [ ] Chosen language persists across a full restart
- [ ] Switching language redraws every tab, not only the active one
- [ ] No raw localization key (camelCase identifier) is ever visible on screen, in any language, on any tab
- [ ] validateLocalization.cjs passes — run it as an assertion, not just a manual script
- [ ] Dynamically constructed keys resolve: resource*, compound*, autoBuyerName*
- [ ] German playthrough produces no clipped or overflowing panels
- [ ] An unsupported or corrupt stored language falls back without breaking boot

## Status meaning

🔴 **RED** — No automated coverage. A regression here ships unnoticed.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
