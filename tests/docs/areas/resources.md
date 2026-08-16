# Resources

| | |
|---|---|
| **Status** | 🟠 AMBER |
| **Risk if broken** | High |
| **Group** | Core Economy |
| **Spec folder** | `tests/e2e/resources/` |
| **Existing coverage** | `tests/legacy/earlyLoop.test.js` |

The eight base resources: manual extraction, tiered buildings, storage caps and selling.

## What should be tested

- [ ] Each of the eight resources extracts manually and accrues correctly
- [ ] Each of four building tiers increases rate by the documented amount
- [ ] Storage cap is enforced — quantity never exceeds capacity
- [ ] Sell and sell-all produce the correct cash at the current price
- [ ] Price scaling on repeat purchase matches the cost multiplier
- [ ] Resources reveal in the UI only once their unlock condition is met
- [ ] Rate displays match actual accrual over a sampled interval

## Status meaning

🟠 **AMBER** — Partial coverage — a smoke test proves the path exists, but branches, failure modes and edge cases are unverified.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
