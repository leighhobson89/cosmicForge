# Colonisation

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Interstellar |
| **Spec folder** | `tests/e2e/colonise/` |
| **Existing coverage** | _none_ |

Settling a conquered system and the state transition into the new run context.

## What should be tested

- [ ] Settlement adds the system to settled stars
- [ ] Settled count correctly drives cosmic rip galactic points
- [ ] Galactic tab unlocks on first qualifying settlement
- [ ] New system's star type bonuses take effect immediately
- [ ] Settlement is idempotent — a system cannot be settled twice
- [ ] Settling the same star twice, or under different casing, awards only one galactic point
- [ ] Blank and non-string values are refused rather than counted
- [ ] A save carrying duplicate settled stars is normalised on restore
- [ ] A battle won settles the system, and the win is real on the canvas rather than a flag
- [ ] The victory grants settleSystem and conquerEnemy, and a hive-mind defender grants its own
- [ ] A conquest pays twice the star's ascendency points, plus whatever the achievements it unlocked pay
- [ ] Winning the run is what makes rebirth possible
- [ ] The rebirth is what grows the settled list, moves the run to the conquered system and turns it into a galactic point
- [ ] The system left behind is drawn on the star map as a settled star and tagged as owned

## Status meaning

🟢 **GREEN** — Upgraded to integration: a real battle is won on the canvas and followed all the way through a rebirth — the achievements granted, the ascendency points paid (twice the star's, plus what the achievements it unlocked pay), the settled list growing at rebirth rather than at victory, the galactic point earned, and the system left behind drawn on the star map as settled. 23 specs passing.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
