# Research

| | |
|---|---|
| **Status** | 🟠 AMBER |
| **Risk if broken** | High |
| **Group** | Core Economy |
| **Spec folder** | `tests/e2e/research/` |
| **Existing coverage** | `tests/legacy/researchTech.test.js` |

Research point generation, research buildings and the research autobuyer.

## What should be tested

- [ ] Research accrues at the displayed rate
- [ ] Research buildings increase the rate as documented
- [ ] Research autobuyer appears at the right gate and purchases correctly
- [ ] Research is spent correctly on tech purchase and cannot go negative
- [ ] Rate responds to power availability

## Status meaning

🟠 **AMBER** — Partial coverage — a smoke test proves the path exists, but branches, failure modes and edge cases are unverified.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
