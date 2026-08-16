# Compounds & Crafting

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Core Economy |
| **Spec folder** | `tests/e2e/compounds/` |
| **Existing coverage** | _none_ |

The six compounds, their ingredient recipes, crafting rates and sale values.

## What should be tested

- [ ] Each compound consumes the correct ingredients in the correct ratio
- [ ] Crafting halts when an ingredient is exhausted and resumes when resupplied
- [ ] Create previews match what is actually produced
- [ ] Sale price previews match realised cash
- [ ] Compound storage caps enforced
- [ ] Reverse name lookup resolves correctly in every language (guards the hot-path lookup)

## Status meaning

🟢 **GREEN** — Comprehensive coverage — happy path, branches, boundaries and failure modes all asserted.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
