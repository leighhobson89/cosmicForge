# Auto Buyers

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Core Economy |
| **Spec folder** | `tests/e2e/autobuyers/` |
| **Existing coverage** | `tests/legacy/autobuyer.test.js` |

Automation for all resources and compounds across four tiers, with per-buyer toggles.

## What should be tested

- [ ] Every resource and compound autobuyer can be purchased at every tier
- [ ] Toggling a buyer off halts its contribution immediately
- [ ] Combined rate equals the sum of active buyers within tolerance
- [ ] Energy consumption scales with active buyer count
- [ ] Buyers stop when input resources or power are unavailable
- [ ] Autobuyer names display localized in all five languages
- [ ] Purchased quantities and toggle states survive save/load

## Status meaning

🟢 **GREEN** — Comprehensive coverage — happy path, branches, boundaries and failure modes all asserted.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
