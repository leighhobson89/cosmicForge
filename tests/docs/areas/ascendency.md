# Ascendency Points & Perks

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Meta Progression |
| **Spec folder** | `tests/e2e/ascendency/` |
| **Existing coverage** | _none_ |

The AP economy and permanent perk purchases, played through the Ascendency Perks pane. Errors here permanently corrupt cross-run progress.

## What should be tested

- [ ] Every perk in the catalogue gets a row quoting its catalogue price, and a fresh save can afford none of them
- [ ] The pane lights up exactly the perks the balance can pay for, at every balance the run passes through
- [ ] Buying greedily until nothing is affordable never overdraws the balance and charges each quoted price exactly
- [ ] A rebuyable perk doubles in price each purchase, caps at timesRebuyable, and stays capped however rich the player is
- [ ] A one-shot perk can only ever be bought once
- [ ] Spending AP for the first time earns the Spend Ascendency Points achievement
- [ ] Smart Auto Buyers and Optimized Power Grids are measured — throughput and energy accrual move by the perk multiplier
- [ ] Compound Automation, Robotic Research Automation, Auto Space Telescope and Non Exhaustive Resources land their unlocks
- [ ] Every perk bought is still bought, still paid for and still applied after a rebirth taken through the real button
- [ ] The hydrogen bag and Non Exhaustive Resources pay their starting stock into the next run
- [ ] Every buff description resolves to real copy in every shipped language

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
