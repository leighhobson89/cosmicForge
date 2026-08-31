# Rounding

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Presentation & Shell |
| **Spec folder** | `tests/e2e/rounding/` |
| **Existing coverage** | _none_ |

One spec asking every part of the game that rounds a single question: does the rounding ever move a number in a direction that makes two parts of the game disagree?

## What should be tested

- [ ] The tolerance never falls below its floor, grows with the value, and always exceeds the float representation gap
- [ ] Affordability forgives drift at every scale and refuses a shortfall the player can see
- [ ] Holdings round down and costs round up, swept over thousands of values
- [ ] Settling a purchase can never leave a negative balance
- [ ] Cash truncates to the cent and never rounds up
- [ ] Truncating survives the divide the abbreviation ladder performs first
- [ ] Every helper is total: a non-finite input never becomes a rendered NaN
- [ ] No value anywhere on the notation ladder abbreviates upward
- [ ] A held value re-formatted every frame does not drift
- [ ] The production-rate formatter rounds, deliberately, because a rate is not a holding
- [ ] Every price on the escalation ladder is a whole number and strictly increasing
- [ ] Buying N units charges the sum of N ladder steps, not N times the first
- [ ] A balance an ulp under a price still buys and is not left overdrawn
- [ ] Buy Max stops on the last affordable unit, not one before or after
- [ ] A gate that says yes is always followed by a charge that succeeds
- [ ] A building whose every cost is met exactly is buyable and charges in full
- [ ] Storage claims, the reservoir's 30% concrete share, and repeated cap doubling stay exact
- [ ] A sub-unit production rate accumulates instead of rounding away to nothing
- [ ] A hundred small ticks accrue exactly what one large tick does
- [ ] Sell All pays exactly quantity x sale value and leaves no store overdrawn
- [ ] Fuel consumption deducts the published rate rather than a rounded one
- [ ] A save/load round trip preserves every fractional balance exactly
- [ ] No balance anywhere is negative after buying to exhaustion
- [ ] The affordability rule holds for every real price the game ships
- [ ] A sale pays for every whole unit it quotes, and sweeps the sub-unit remainder by design
- [ ] The one-off structures - the launch pad and the space telescope - charge exactly what they quote, cents included

## Status meaning

🟢 **GREEN** — Added by P7 of the player-feedback plan as a dedicated regression net for the seams between subsystems that round differently. It found three live defects: the abbreviation ladder overstating a value scaled down by a billion, the sale preview quoting a fractional quantity that the sell path then re-parsed as a whole number, and both sell paths reading their payment back out of a two-decimal rendered label instead of computing it. One behaviour it pins is deliberate rather than a defect: a single sale sweeps up whatever sub-unit remainder is left, so a 12.7 stock that sells 12 ends empty and the 0.7 is not paid for. Sell All differs - it sells the whole float and pays for all of it - and the two routes are meant to differ, so nothing should try to reconcile them.

A fourth live defect was found later, when scenario 67 was reworked. `space.upgrades` holds two members that are not `gain()` purchases at all - the launch pad and the space telescope, the one-off structures bought through `buildSpaceMiningBuilding()`. That function settles its charge immediately instead of queueing into `itemsToDeduct`, so it never reaches `checkAndDeductResources()` and was the last charge in the game outside the P7 policy. It wrote `Math.floor(balance - price)`, which does not charge the price: it charges the price plus whatever fraction the balance was carrying. A purse holding $5,000,000.75 paid $40,000.75 for a $40,000 launch pad, and gave up a quarter of a unit extra from each of its three material stores as well. It now settles through `settleSpend()` like every other purchase, and scenario 67b buys both structures from a deliberately fractional purse to keep it that way.

Two of the scenarios were themselves at fault rather than the game, and both are worth recording because the failures did not look like spec bugs:

- **Scenario 67 drove two surfaces that do not exist.** Its sweep filtered `space.upgrades` on `price > 0`, which picks up the two one-off structures, and pushed them through `gain()` - a call the game never makes for them. They carry no `setPrice`, because their price never escalates, so the purchase queued a price rise whose target was `undefined` and `checkAndIncreasePrices()` dereferenced it, taking the frame loop down. The failure therefore arrived as a ten-second timeout waiting for a charge that could no longer settle, which reads like a hung game rather than a mis-scoped filter. It now filters on `setPrice` instead, and the one-off structures are covered by 67b through the path they actually have.
- **Scenario 64 was measuring the weather.** It reads a compound autobuyer's charge as `holding before - holding after`, which is exact for every material except the one the current star system precipitates: `addPrecipitationResource()` pays into that store every frame it is raining. So water reported "charged 94999.8798828125, quoted 95000" on a rainy run and passed on a dry one. `freezeEconomy()` exists to stop exactly this class of interference and did not cover precipitation; it now zeroes the precipitation rate and forces the weather to sunny, and `refillPurse()` re-applies that per member, because a weather window is one to three minutes and these sweeps run for longer than that.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
