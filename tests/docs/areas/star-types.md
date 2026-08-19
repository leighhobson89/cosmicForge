# Star Type Bonuses

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Medium |
| **Group** | Interstellar |
| **Spec folder** | `tests/e2e/star-types/` |
| **Existing coverage** | _none_ |

Per-star-type effects: the flat autobuyer bonus of a B-type system, the antimatter multiplier of an F-type, the power-plant amplification of a settled O-type, and the six types that do nothing at all.

## What should be tested

- [ ] Every star in the galaxy carries a type from the published set, and an unknown name falls back to A rather than throwing
- [ ] A star studied into the data object records the type its name carries
- [ ] A B-type system adds a flat rate to every resource autobuyer tier — +2/s, +8/s, +25/s, +80/s — measured off the stores
- [ ] The B-type bonus is per autobuyer owned, sits on top of the tier's own rate, and reaches resources but never compounds
- [ ] The B-type bonus is gone the moment the run is in another system
- [ ] The production tooltip names the B-type contribution as its own line, and says nothing about it elsewhere
- [ ] An F-type system multiplies antimatter extraction by half as much again, and every other type mines at the plain rate
- [ ] The F-type bonus does not touch resource production
- [ ] Settling an O-type star amplifies exactly one power plant type eight-fold, and leaves the other two alone
- [ ] The O-type boost needs the star settled rather than merely recorded, and is carried between systems once it is
- [ ] The O-type boost does nothing while the mechanic is switched off for the save
- [ ] An O-type destination is hard mode: life is certain and the traits are the hostile set
- [ ] O-type stars are never chosen as manuscript or expansion targets
- [ ] A, G, K and M change resource production, antimatter extraction and power generation not at all
- [ ] Standing in an O-type system is not the same as owning one

## Status meaning

🟢 **GREEN** — Done — the B, F and O effects are measured off the stores, the grid and the rocks rather than read off a multiplier, and A, G, K and M are each proven inert against the same three measurements. K has no mechanic in the game; the specs pin that rather than leave it unsaid.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
