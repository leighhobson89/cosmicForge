# Megastructures

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Medium |
| **Group** | Endgame |
| **Spec folder** | `tests/e2e/megastructures/` |
| **Existing coverage** | `tests/legacy/captureMegaStructureTest.test.js` |

Ancient manuscripts, megastructure capture and the Miaplacidean force field.

## What should be tested

- [ ] Manuscripts are discoverable at the documented vision thresholds and cap at four
- [ ] Manuscript stars never repeat and never fall on Miaplacidus, a settled star, the home system or an O-type
- [ ] Activating a factory star marks its manuscript reported and registers the star
- [ ] Each megastructure gates on a five-stage prerequisite chain with rising prices
- [ ] Each stage applies its documented bonus: batteries, power plants, autobuyer rates, storage and infinite power
- [ ] Stage 3 of every structure lowers the force field one level and permanently unlocks antimatter
- [ ] Progress survives save/load

## Status meaning

🟢 **GREEN** — Comprehensive coverage — happy path, branches, boundaries and failure modes all asserted.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
