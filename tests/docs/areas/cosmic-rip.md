# Cosmic Rip

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Medium |
| **Group** | Endgame |
| **Spec folder** | `tests/e2e/cosmic-rip/` |
| **Existing coverage** | _none_ |

The endgame chapter: galactic points earned from settled systems, the Near Space Scanner Array, sweeping the galactic telescope for the rip, the telemetry economy and the five stabilisation techs.

## What should be tested

- [ ] A galactic point is one settled system beyond the first, counted by the frame loop, and a repeat conquest earns nothing
- [ ] Spending points moves the balance down and the spent ledger up, and the balance never goes negative
- [ ] The restore button is dead without the points and lit with them, and needs Miaplacidus settled
- [ ] Restoring the array seeds the rip, clears the grid and opens the galactic telescope
- [ ] Restoring twice is refused and charges nothing the second time
- [ ] Every unscanned sector on the telescope is lit while there are points to spend
- [ ] Clicking a sector scans it, charges a point and lifts its fog
- [ ] Clicking a scanned sector again does nothing and costs nothing
- [ ] Sweeping the telescope finds the rip, in the seeded sector and nowhere else
- [ ] With the balance spent out the sectors go dark and a click does nothing
- [ ] Deploying sensor buoys makes telemetry actually accrue, at the rate they advertise
- [ ] A stabilisation tech reveals itself when the telemetry reaches its threshold
- [ ] Researching a tech charges its telemetry price and a galactic point up front, and unlocks only when its timer finishes
- [ ] All five techs researched fill the stability bar and reveal the Close The Rip row
- [ ] The Close The Rip button is lit with a point banked and blocked without one
- [ ] Cosmic rip techs unlock into their own array, independent of the main tech tree
- [ ] The chapter is gated by the cosmic rip build flag

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
