# Player Feedback Improvement Plan

> Source: end-game player review + UI/UX review (summarised in the master plan), validated against a deep code audit of the current codebase (v0.98 data version, commit `939d6d9`). Every audit claim below was re-verified against the source; corrections found during the audit are folded into each section.

> Each item lists: **audit findings** (what the code actually does today, with file:line references), **proposed change**, **estimated effort** (man-hours, including tests), **risk**, and **integration test plan** (each item ships with a Playwright e2e test that demonstrates the measured gain).
>
> Test harness note: the project already has a mature Playwright e2e suite (`tests/e2e/**` — 85 specs organised as `<area>/<name>.spec.js`, plus `playwright.config.js` and `tests/run-e2e.mjs`) with debug helpers (`game.debugClick(...)`, `readState(...)`) — every item below follows the same pattern so results are comparable. Where an area folder already exists (`ascendency/`, `black-hole/`, `star-map/`, `megastructures/`, `energy/`, `resources/`), new specs extend that folder.

---

## How this plan is ordered

Item IDs (**P1–P15**) are stable labels carried over from the original review so cross-references stay valid; **the sections below are physically ordered by execution priority**, grouped into four tiers:

1. **Tier 1 — High-value quick wins** (high player value, low effort, mostly independent).
2. **Tier 2 — Important** (high value, medium-to-large effort; ordered by size, respecting dependencies).
3. **Tier 3 — Other quick wins** (medium value, low effort; good fillers between waves).
4. **Tier 4 — The rest** (large UI refactors with lower value-per-hour).

The audit moved several items vs. the original review order: **P3** (power toggle) turned out *harder* than assumed (power is auto-managed, see its section), **P10** (automation persistence) turned out *more independent* than assumed and is promoted to a quick win, **P11**'s audit numbers were corrected (×0.88 per level, not −10%; an "Always Active" maxed state already exists), and **P15** (balance) belongs with the important medium-size items rather than last.

### Execution order (priority × size)

| Exec # | ID | Item | Tier | Value | Effort |
|--------|----|------|------|-------|--------|
| 1 | P3 | Powered On/Off toggle — ✅ **COMPLETED** | 1 — quick win | Medium | Very low (3–5 h) |
| 2 | P1 | Buy Max / bulk purchase — ✅ **COMPLETED** | 1 — quick win | Very high | Low (8–12 h) |
| 3 | P2 | AP list sorting + alignment + maxed-state cleanup | 1 — quick win | High | Low (6–10 h) |
| 4 | P4 | Star list: name sort + direct travel target | 1 — quick win | High | Low (6–10 h) |
| 5 | P10 | Persistent automation across rebirths | 1 — quick win | High | Low-Med (6–10 h) |
| 6 | P5 | Increase All Storage + persistent earned increases | 2 — important | Very high | Medium (10–16 h) |
| 7 | P6 | Notification layout + Clear-All safety | 2 — important | High | Medium (8–12 h) |
| 8 | P7 | Precision / rounding / affordability consistency | 2 — important | High | Medium (12–18 h) |
| 9 | P15 | Megastructure balance pass | 2 — important | High | Medium (12–20 h) |
| 10 | P8 | Resource tick unification (foundational refactor) | 2 — important, large | Very high | High (30–50 h) |
| 11 | P9 | Autosell → production allocation redesign | 2 — important, large | Very high | High (25–40 h) |
| 12 | P14 | Gain button merge | 3 — quick win | Medium | Low (4–8 h) |
| 13 | P11 | Progression clarity (black hole & upgrade displays) | 3 — quick win | Medium | Low-Med (8–12 h) |
| 14 | P12 | UI row/layout refactor (`createOptionRow` mini-tables) | 4 — the rest | Medium | High (30–40 h) |
| 15 | P13 | Spacing / visual hierarchy | 4 — the rest | Medium | Medium (10–16 h) |

---

# Tier 1 — High-value quick wins

## ~~P3 — Powered On/Off becomes a toggle~~ ✅ DONE

~~**Audit.** The Powered status lives only in the stat-bar tooltip (`ui.js:7426–7430`, `tooltipPowerStatusLabel` → `stat3Text`/`stat3Class`); it is display-only. The stat bar already has click/tooltip plumbing (`setupStatTooltips` at `ui.js:2045`, `attachSharedTooltip` at `ui.js:1196`). There is **no single master-switch button**: power is *auto-managed* — `game.js:2860–2895` force-flips `setPowerOnOff(...)` whenever the energy balance or battery charge demands it, and the "Power All" handler (`game.js:13045–13087`) plus per-building toggles (`drawTab2Content.js:206–226`) drive the same setter. `powerOn`/`powerOff` SFX already exist and are played by those paths.~~

~~**Change.** Make the stat-bar Powered entry a clickable toggle that drives the same `setPowerOnOff` path as buttons within the energy UI, keeping the existing tooltip on hover, and play `powerOn`/`powerOff` SFX.  The button design should utilise the same function createButton() as all other buttons in the drawTabXContent.js etc files.  The buttons label should show the status right now of the power, ie ON OFF TRIPPED.  When clicked it will behave like the Toggle All Button, always switchin ON if tripped or OFF and OFF if ON.  If DYSON sphere is present, this button is disabled (not visually disabled) and always shows the status but cannot be clicked.~~

~~**Effort:** ~3–5 h.~~

~~**Integration test.** `tests/e2e/energy/power-toggle.spec.js` (extends the existing `energy/` suite): click the stat-bar Powered control, assert the state flips **and stays flipped across ticks**, the tooltip still renders, and the state survives a tab switch and re-render.~~

---

## ~~P1 — Bulk purchase (Buy Max) everywhere~~ ✅ DONE

~~**Audit.** `buyMax` / "Buy Max" appears **nowhere** in the codebase. Every purchase is a single-quantity click handler (`createButton` → `onClick` in `drawTab1Content.js`, `drawTab3Content.js`, etc.). autobuyers (both resource and compound), batteries, power buildings, rocket miners, starship building modules, repeatable philosophy technologies, research buildings, and fleet hangar are all one-click-one-unit. Sell All exists (`sellAllUnlockedResources` / `sellAllUnlockedCompounds` in `game.js`, wired via the `sellAllResourcesButton` listener at `ui.js:1805–1808`) but there is no Buy Max for anything — not even autogenerators, which the player specifically flagged.~~

~~**Change.**~~
~~- Add a shared `buyMax` helper in `game.js` that loops the existing single-purchase function until affordability fails (with a hard iteration cap for safety), reusing each item's existing cost-scaling function so no pricing logic is duplicated.~~
~~- Add a "Max" button next to the button that buys each of: autobuyers (both resource and compound), batteries, power buildings, rocket miners, starship building modules, repeatable philosophy technologies, research buildings, fleet hangar (except envoy).~~
~~- Gate behind an AP perk costing 1 AP (player's primary goal is eliminating clicks).~~

~~**Effort:** ~8–12 h (helper + wiring across ~6 drawTab files + tests).~~
~~**Risk:** Low. Cost curves are already per-purchase; max-buy is just iteration. Watch for float drift (see P7 — do P7's affordability helper first if drift appears).~~

~~**Integration test.** `tests/e2e/resources/bulk-purchase.spec.js`: grant cash via debug, click Buy Max once on an autobuyer row, assert quantity jumps to the exact affordable maximum (compare against a JS-computed geometric-series expectation), assert cash remainder < cost of one more unit. Measure clicks-before vs clicks-after in the test report (e.g. "10 autobuyers: 10 clicks → 1 click").~~

---

## P2 — AP list: sorting, maxed state

**Audit.** The Ascendency Perks section (`drawTab7Content.js:1737–1818`) iterates `Object.keys(ascendencyBuffsArray)` — **insertion order, no sorting** (line 1750). Every buff renders a Buy button unconditionally (lines 1771–1779) with the `red-disabled-text` class — the same red used elsewhere for "can't afford", so "maxed" and "broke" look identical. Each row shows a buy-status text (line 1794) *and* a cost text (lines 1796–1800), so a maxed non-rebuyable perk displays its completion info twice.

**Change.**
- Sort perks: not-purchased → partially purchased → fully purchased (stable secondary sort by cost).
- Maxed perks: hide the Buy button entirely, show a single "Maxed" badge in the far right slot with a class of green-ready-text, and remove the duplicated text.

**Effort:** ~4–8 h.
**Risk:** Low. Pure presentation + one sort comparator.

**Integration test.** `tests/e2e/ascendency/ascendency-ui.spec.js`: grant AP, buy one perk to max via `purchaseBuff` calls, reload tab 7, assert (a) DOM order groups unmaxed before maxed, (b) maxed row has no buy button, (c) maxed row contains exactly one "maxed" indicator (preferably the one on the far right and the other one replaced with blank string but not affecting layout).

---

## P4 — Star list: alphabetical sort + direct travel targeting

**Audit.** `sortStarMethod` (default `'distance'`, `constantsAndGlobalVars.js:393`) supports `distance, type, weather, precipitationType, fuel, ascendencyPoints` — **no `name` sort**. The comparator in `sortStarTable` (`ui.js:11858+`) has no `name` case, and the sort headers are wired in `drawTab5Content.js:618–648` via `handleSortStarClick(...)`. The text list rows are built by `createStarDestinationRow` (`ui.js:5906`); the targeted-star highlight path already exists (`ui.js:5873–5880` calls `createStarDestinationRow(destinationStarData || star.name, !!destinationStarData)` and `setDestinationStar(...)`), but clicking a row in the *list* does not set the travel target or highlight the star on the graphical map.

**Change.**
- Add a `'name'` case to the `sortStarTable` comparator and a clickable "Name" header in `drawTab5Content.js` to replace the column header "Sort By" which when clicked sorts stars alphabetically by their name.
- Make each list row have a clickable button with a globe or wireframe globe icon which when clicked will set `setDestinationStar(...)` (or the equivalent targeting state), navigate the user to the star map in normal mode, and highlight the star on the map canvas (reuse the existing search star map feature functionality and pass in the star name from the clicked button so we see the star map and the star "pinged" like we have used the search feature.)

**Effort:** ~6–10 h (comparator trivial; map-highlight + state plumbing is the bulk).
**Risk:** Low-Medium. Must not break the travel-in-progress guards (`getStarShipTravelling`).  Needs to think about any situations that could behave differently ie settled stars dont need the button and check we dont have an issue clicking a star where the starship is on route to or orbiting, may or may not have any issue, investigate.

**Integration test.** `tests/e2e/star-map/star-list.spec.js` (extends the existing `star-map/` suite): open star list, sort by name, assert first row is alphabetically first; click a known distant star row, assert `getDestinationStar()` matches and the map highlights it by the search functionality.

---

## P10 — Persistent automation across rebirths

**Audit.** Rebirth resets resource data wholesale via `resetResourceDataObjectOnRebirthAndAddApAndPermanentBuffsBack()` (`game.js:15578`), which clears per-resource `autoSell` flags, autobuyer `active` flags, telescope automation (`space.upgrades.spaceTelescope.autoSpaceTelescopeRowEnabled`), research automation, etc. Some are re-granted by perks on purchase (`purchaseBuff` sets them), but per-rebirth toggles default off. Save/load already round-trips these fields, and a migration path exists (`migrateResourceData` in `patches.js`, data version `0.98` at `resourceDataObject.js:17`), so persistence plumbing is in place. **Key audit finding:** only the autosell-*allocation-settings* sub-part depends on P9 — research auto-buyer, telescope automation, and compound automation persistence are fully independent, which is why this item is a Tier-1 quick win.

**Change.** Split "owned/unlocked" (persist) from "enabled this run" (persist by default, player can disable). On rebirth, restore enabled-state for: research auto-buyer, telescope automation, autosell + its allocation settings (the P9-dependent part lands with P9), compound automation. Audit for any setting that genuinely *should* reset (e.g. ones tied to per-run resources that start locked).

**Effort:** ~6–10 h.
**Risk:** Low-Medium. Save-version bump + migration (`migrateResourceData`) for the new persisted fields.

**Integration test.** `tests/e2e/automation/persistence.spec.js`: enable all automations, rebirth via the real rebirth flow, assert each automation is still unlocked **and enabled**, and that its settings survived. Assert a deliberately-resettable control (if any is chosen) did reset.

---

# Tier 2 — Important (high value, larger effort)

## P5 — Increase All Storage + earned-increase persistence

**Audit.** Storage increase is per-resource: `increaseResourceStorage` (`game.js:10097–10100`), charged at the old cap, ×`increaseStorageFactor` × (Efficient Storage perk `boughtYet` + 1) — see existing tests `tests/e2e/resources/resources.spec.js`. The **storage-increase action currently lives inside a notification**: `showNotificationWithAction(...)` (`ui.js:5128`) and `disableStorageNotificationActionIfShowing` (`ui.js:5432–5470`, which matches the visible message text `"${key} storage is full"`) mutate the *visible DOM button* — if the notification times out or is cleared, the earned increase's afford-action is gone until a new notification fires. This exactly matches the player's complaint. Sell All is wired at `ui.js:1805–1808`, giving a proven home for a sibling button.

**Change.**
- Add an **"Increase All Storage"** button next to Sell All in the main resource header (`ui.js`, near `sellAllResourcesButton`), which iterates unlocked resources/compounds and calls `increaseResourceStorage` for every one whose quantity ≥ its cap and which is affordable; skip the rest and report a count ("Increased 5 storages").
- Make earned increases **persistent state**, not notification state: add a per-resource `storageIncreasePending` flag (or reuse "quantity ≥ capacity" as the source of truth — preferred, zero migration). The notification becomes purely informational; its action button simply calls the same claim function. Clearing notifications can never lose an earned increase because eligibility is derived from state, not from notification lifetime.
- The Increase All button becomes the primary claim mechanism; individual notification buttons remain as a convenience.

**Effort:** ~10–16 h (button + eligibility sweep + notification decoupling + tests).
**Risk:** Medium. Must handle partial eligibility (some resources full, some not) and cash affordability per item; must not double-charge.

**Integration test.** `tests/e2e/resources/storage-increase-all.spec.js`: fill 5 resources to cap via debug, leave 3 others partial; click Increase All; assert exactly the 5 full ones doubled (cap ×2, cash reduced by sum of old caps), partial ones untouched. **Persistence test:** fill a resource, wait for the storage notification to expire naturally, assert the resource can still be increased (eligibility survived notification death) — this is the measured fix for the "lost earned increase" bug.

---

## P6 — Notification layout & Clear-All safety

**Audit.** `ui.js:5100–5470`: one container per classification, positioned **horizontally** — `MAX_STACKS`/`STACK_WIDTH`/`BASE_RIGHT` constants (`ui.js:145–147`) feed `updateContainerPositions()` (`ui.js:5190`), which sets `container.style.right = BASE_RIGHT + index * STACK_WIDTH` (line 5198) — confirming the multi-column overlap/misclick complaint. Queues are per-classification (`getNotificationQueues`), one visible notification per column at a time; `hideNotification` (`ui.js:5422`) destroys action bindings with the DOM element. Clear-All (settings) clears queues wholesale — combined with P5's finding, clearing can orphan earned actions. The container CSS is at `styles.css:2255`.

**Change.**
- Restyle containers to a **single vertical stack** (top-right, below the stat bar), preserving per-classification queueing/colours. This is a CSS + `updateContainerPositions()` change; the queue architecture stays.
- Cap visible notifications (e.g. 4) with the rest queued; ensure containers have `pointer-events` only on the notification card itself, never a full-width invisible strip (verify at `styles.css:2255`).
- After P5, Clear-All is safe by construction (eligibility is state-derived). Add a regression test regardless.

**Effort:** ~8–12 h.
**Risk:** Medium. Visual change touches every notification type; needs a visual pass across themes.

**Integration test.** `tests/e2e/notifications/notification-layout.spec.js`: fire 6 notifications of mixed classifications, assert all containers share the same `right` offset and differ only in `top` (vertical stack), and assert none of their bounding boxes intersect the Sell All / tab buttons (measured "misclick surface" gain in the report). Clear-All test: queue an actionable storage notification, Clear All, then assert Increase All Storage still claims the increase.

---

## P7 — Precision, rounding, affordability consistency

**Audit.** Resource quantities are floats updated by delta timers (`updatedQuantity = Math.min(currentQuantity + productionAmount, storageCapacity)`, `game.js:3041`). Affordability checks compare raw floats against costs while the UI displays rounded values — `ui.js` alone has 18 `toFixed` call sites, plus `Math.round` sites across `drawTab*`. `processAutoSell` and purchases write back floats. No central formatting/precision policy exists — each display site rounds independently. Buy Max doesn't exist yet (P1), but a naive max-buy on floats will reproduce the "stops 0.01% short" bug, so the affordability helper should land first or together.

**Change.**
- Introduce one utility module (e.g. `precision.js`): `canAfford(cost)`, `formatDisplay(value)` (single rounding policy), and an epsilon-tolerant comparison (`value >= cost - 1e-9`).
- Route all affordability checks and all display formatting through it. Fix Buy Max to compute the exact max via the closed-form geometric series rather than click-looping where possible.
- Audit bonus application paths (production multipliers, moving-banner "double production") for intermediate rounding; round only at display.

**Effort:** ~12–18 h (many call sites; mechanical but broad).
**Risk:** Medium. Touches economy everywhere — needs the e2e suite run as a regression gate (it already covers storage pricing, sell, compounds).

**Integration test.** `tests/e2e/precision/precision.spec.js`: set a resource to `cap - 0.0000001` via `page.evaluate`, assert the displayed value and the Buy button's enabled state agree (no "looks affordable but fails"); Buy Max at near-cap fills to within epsilon of cap in **one** click; apply the double-production banner and assert displayed rate == actual delta over a measured tick window (no rounding drift).

---

## P15 — Megastructure combat balance

**Audit.** Defense generation (`generateDefenseRating`, `game.js:14195–14220`) is **hard-capped**: `defenseRating = Math.min(100, defenseRating + 25)` (line 14216) and anomaly rolls bounded to `defenseRating ± 10` (lines 14219–14220, max ~110). Megastructure guardians use the same pipeline as normal stars, so a late-game fleet (thousands of strength) trivially overruns them — matching the player's "3–4× required strength, difficulty = click count" report. Battle resolution (`trackEnemyAndAdjustHealth`, `replaceBattleUnits`) is click/attrition based. Existing specs: `tests/e2e/megastructures/megastructures.spec.js` and `megastructures-live.spec.js`.

**Change (balance pass, needs design numbers):**
- Give megastructure guardians a separate defense tier that scales with progression position (e.g. defense derived from the megastructure index and the player's expected military at that point, uncapped or capped far higher).
- Add non-click difficulty axes: composition requirements (shield types), preparation resources, or a multi-phase encounter — not just more clicks.
- Ship-count requirements for megastructures raised so ~100–150 ships per class is genuinely needed.

**Effort:** ~12–20 h (tuning + encounter changes; the code hook is small, the *balancing* is the work).
**Risk:** Medium — could soft-block players who arrive under-strength; gate with clear in-UI strength comparison (ties into P11 clarity rules).

**Integration test.** `tests/e2e/megastructures/balance.spec.js`: simulate a battle at the intended progression point with the "typical" fleet the player described; assert victory requires ≥ the designed ship counts and that a deliberately under-built fleet **loses** (currently it wins — this failing test is the baseline that demonstrates the balance gain). Report required-strength vs available-strength ratio before/after.

---

## P8 — Unified resource tick (foundational refactor)

**Audit.** There is **no single resource tick**. Each resource × tier has its own delta timer (compound auto-buyers: `${compound}AB${tier}` timers registered in `initialiseCompoundAutoBuyerDeltaTimers`, `game.js:3065–3088`), each independently doing read → add production → write with its own clamp (`game.js:3040–3044`), then separately applying fuel consumption, autosell (hardcoded "drain everything above 100", inline at `game.js:3054–3062`), compound draws, etc. Consequences confirmed in code:
- Order-dependence: whichever timer fires first wins; a resource gaining 1B/s and spending 100/s may never register as cap-reached because each writer clamps independently.
- The diesel micromanagement (pause consumption → hit cap → resume) is a direct symptom.
- `rate` is written per-timer (`game.js:3048`), so the displayed net rate is computed per-subsystem, not per-resource.

**Change.**
- Create a single per-frame `resourceTick(deltaMs)` that, per resource: (1) sums all gains (auto-buyers, precipitation, manual), (2) sums all demands (fuel, compounds, autosell allocation, other consumers), (3) resolves net change against capacity in one write, (4) publishes `producedThisTick` / `consumedThisTick` for allocation (consumed by P9).
- Migrate existing per-subsystem timers to *contribute* to the tick instead of writing quantities directly. This is the largest refactor in the plan; do it resource-by-resource behind a feature flag if needed.
- Cap detection ("reached capacity this tick") becomes reliable, which fixes the storage-increase trigger and the diesel workaround.

**Effort:** ~30–50 h.
**Risk:** High. Every economy system touches this. Mitigate with the existing e2e suite as a golden-path regression net, plus new tick-invariant tests, and migrate one subsystem at a time.

**Integration test.** `tests/e2e/resource-tick/tick-invariants.spec.js`: with known gains/losses configured, assert over N ticks: `quantity == clamp(prev + net, 0, cap)` exactly (no intermediate-state artifacts); a resource with net-positive production **does** register cap-reached (the 1B-gain/100-spend case); diesel reaches cap with consumption running (measured: no manual pause/resume needed). Report before/after tick-accounting error.

---

## P9 — Autosell & compound automation → production allocation

**Audit.** Current autosell (`game.js:3054–3062` resources, `3274–3281` compounds): if `autoSell` is on and quantity > **100** (hardcoded), set quantity to 100 and sell the rest. So autosell *permanently caps the resource at 100* — it can never accumulate. `processAutoSell` (`game.js:10641`) is just `cash += price * qty`. Compound auto-create similarly draws ingredients with no allocation awareness (one compound can starve another; `calculateAutoCreateRatePerSecond` in `ui.js:2881` shows the draw model). This confirms the player's core complaint precisely.

**Change (design decision required — two options, both preserve the QoL goal):**
- **Option A (recommended, builds on P8):** Resource-tab allocation model. Per resource: `% of production → cash`, `max % of production → compound automation`, remainder accumulates. The tick (P8) already computes `producedThisTick`; allocation splits it. Stored stock is never drained by autosell. Compound automation consumes only its allocation, distributed across compounds (proportional with per-compound cap as the default).
- **Option B (smaller):** Keep autosell but change semantics to "sell X% of *new production* only" (using `producedThisTick`), never touching stored quantity. Doesn't solve compound competition but removes the drain problem.
- Either way: make the percentage direction unambiguous in the UI ("X% to $"), keep Sell All for deliberate emptying, and evaluate the "Nano Brokers on rebirth" ascendency perk if manual selling is retired from the main interface.

**Effort:** Option B ~10–15 h; Option A ~25–40 h (incl. Resource-tab UI, compound distribution algorithm, rebirth persistence hooks).
**Risk:** High for A (gameplay balance + save migration for new settings), Medium for B.

**Integration test.** `tests/e2e/autosell/allocation.spec.js`: configure 10% to $, 50% max to compounds on iron at 1000/s; run 10 s of ticks; assert iron accumulated ≈ 40% of production (within tolerance), cash grew ≈ 10% of production value, compound consumption never exceeded 50%, and **stored iron was never drained** (monotonic increase). Competing-compounds test: two compounds demanding more than the allocation — assert proportional sharing, neither starved to zero by the other.

---

# Tier 3 — Other quick wins

## P14 — Gain button merge / space reclaim

**Audit.** Every resource pane renders a dedicated Gain row (`hydrogenGainRow`, `drawTab1Content.js:104–137`, repeated per resource) calling `gain(1, ...)`. There is already a hold-Enter rapid-click system (`startHoldEnterRapidClick`, `ui.js:1037`) indicating manual gain matters mainly early-game. This item is fully standalone — it can ship any time; if the Tab-1 grid migration (P12) happens later, the merged row simply rides along.

**Change.** Merge Gain into the Sell row as a single compact control group (e.g. one row: `[Gain ×1] [Sell dropdown] [Sell]`), or collapse Gain behind an early-game-only visibility rule (hide once auto-buyer tier 1 exists — the point where manual gain stops mattering). Keep the tooltip explaining the rare late-game uses.

**Effort:** ~4–8 h.
**Risk:** Low. Pure UI; `gain()` logic untouched.

**Integration test.** `tests/e2e/resources/gain-row.spec.js`: fresh run — Gain visible and functional (+1 per click, capped at storage); after unlocking auto-buyer tier 1 — Gain row hidden/merged, vertical height of the resource pane measured before/after in the report (the "scroll reduction" gain).

---

## P11 — Progression clarity: black hole & misleading upgrade displays

**Audit.** *(Numbers corrected by the audit.)* The black hole recharge upgrade multiplies charge time by **0.88 per level (−12%)**, not −10% (`drawTab7Content.js:2085`, `game.js:3967`), clamped at `getMinimumBlackHoleChargeTime()` with the purchase blocked once capped (`drawTab7Content.js:2088–2090`). A maxed **"Always Active"** state already exists and is communicated (`buttonBlackHoleRechargeMaxed` / `buttonBlackHoleDurationAlwaysActive` labels; `getBlackHoleAlwaysOn` auto-set at `game.js:3940–3943` and `3972–3975`) — so the real gap is communicating *progress toward* the threshold, not the maxed state itself. Display precision: the recharge button uses `toFixed(1)` seconds (`game.js:3981–3983`), so identical before/after can only render within <0.05 s of a step near the minimum; the **duration** upgrade uses `Math.round` seconds (`game.js:3952–3954`) and is the likelier "30 → 30" collision site. `blackHoleUIChecks` lives at `game.js:3641` (display logic 3934–3988). Existing specs: `tests/e2e/black-hole/black-hole.spec.js` and `black-hole-live.spec.js`.

**Change.**
- Recharge: show the underlying precise value (or a progress bar toward the minimum) alongside the rounded `current → next`, and state the ×0.88-per-level effect explicitly.
- When the next upgrade reaches the Always-Active threshold, say so ("Next level: charging becomes effectively continuous").
- Duration (and any other upgrade row): never render identical before/after values — show decimals or a qualitative note instead. Sweep all `current → next` displays for rounding-induced "no change" renderings (search `→`/`->` formatting in `drawTab*Content.js` and the `blackHoleUIChecks` display block).
- Add black-hole value communication to the help/descriptions (`descriptions.js`) and a hint encouraging early pursuit.

**Effort:** ~8–12 h (display fixes ~4 h; the audit sweep across all upgrade rows ~4–8 h).
**Risk:** Low.

**Integration test.** `tests/e2e/black-hole/progression-clarity.spec.js` (extends the existing `black-hole/` suite): set recharge/duration levels such that rounded displays would collide; assert the UI never renders `X → X` (parse the label, assert before ≠ after OR a "continuous"/precise-value note is present). Snapshot the black hole panel before/after for the report.

---

# Tier 4 — The rest (large UI refactors)

## P12 — UI row/layout refactor (the `createOptionRow` mini-table problem)

**Audit.** The legacy row builder is `createOptionRow` (`ui.js:3495`, exported; used by every drawTab file — e.g. `drawTab7Content.js` `megastructureTableRow` at 1844, the Ascendency Perks rows at 1782, `drawTab9Content.js` statistics rows). Each row lays out its own label/description/controls with its own width logic (ad-hoc `noDescriptionContainer: [true, '30%', '70%']`-style percentages throughout), so rows behave as independent mini-tables — the root cause of the AP misalignment (P2) and inconsistent spacing (P13).

**Change.**
- Introduce a shared section-level CSS grid: sections declare column templates; rows place cells into named columns (`label | description | price | action`). `createOptionRow` gains a `section` concept or a thin `createSection(rows, columns)` wrapper. No speculative abstraction — only what the existing rows need.
- Migrate section-by-section, starting with Ascendency Perks (already touched in P2) and Resources (touched in P5/P9; Tab 1's migration also absorbs the P14 merged row).

**Effort:** ~30–40 h for a meaningful migration (the helper itself ~8 h; migrating 9 tabs is the bulk). Can be incremental — old and new rows coexist.
**Risk:** Medium-High visually; low functionally. Theme/regression screenshots needed.

**Integration test.** `tests/e2e/ui-layout/alignment.spec.js`: for migrated sections, assert all rows' action-column cells share the same `getBoundingClientRect().left` within 1px (the measurable alignment gain), and that no row overflows its section container. Per-section screenshot baselines.

---

## P13 — Spacing / visual hierarchy (separators → grouping)

**Audit.** Rows are separated by lines with uniform spacing (`styles.css` `.option-row` / `.option-row-main` / `.description-container` at 2117–2143), so a separator reads as belonging to the item below. No card/block component exists.

**Change.** Adopt the **cards/blocks** option (player-preferred): wrap each option group in a bordered/padded card within the P12 grid system. Where cards are too heavy (dense lists), fall back to the improved-spacing rule: tight below the owning item, generous before the next title. Apply globally via the shared row component so it's one fix, not per-tab patches.

**Effort:** ~10–16 h (CSS + template changes inside the P12 component; do after P12 starts).
**Risk:** Low-Medium (purely visual; theme coverage needed).

**Integration test.** Visual regression screenshots per theme (terminal/light/frosty/summer/dark) before/after; DOM assertion that each option group is wrapped in a single container element whose bounding box contains both its title and action text.

---

## Cross-cutting implementation order (dependency-aware)

```
Tier 1 (quick wins, independent — any order):
  P3 power ── P1 bulk buy ── P2 AP UI ── P4 stars ── P10 persistence*
      (*P10's autosell-allocation-settings sub-part lands with P9; the rest is independent)

Tier 2 (important):
  P5 storage ──► P6 notifications (P6 depends on P5's state-derived eligibility)
  P7 precision ──► P8 tick (P7's helpers are prerequisites for trustworthy tick tests)
  P15 balance (independent)
  P8 tick ──► P9 allocation ──► (P9's allocation settings feed P10's persistence hook)

Tier 3 (quick wins, slot in any time as fillers):
  P14 gain merge (standalone; Tab-1 grid migration can ride P12 later)
  P11 clarity (independent)

Tier 4 (the rest):
  P12 layout ──► P13 spacing (P13 rides P12's components)
```

**Recommended execution waves:**
1. **Wave 1 (Tier 1 quick wins, ~30–45 h):** P3, P1, P2, P4, P10 — each with its e2e test; immediate visible improvement.
2. **Wave 2 (storage & notifications, ~20–30 h):** P5 → P6.
3. **Wave 3 (correctness & balance, ~25–40 h):** P7, P15.
4. **Wave 4 (foundational, ~55–90 h):** P8 → P9 (highest-risk; golden-path e2e suite must be green before/after each subsystem migration).
5. **Wave 5 (Tier 3 fillers, ~12–20 h):** P14, P11 — can be slotted between any waves when capacity allows.
6. **Wave 6 (UI architecture, ~40–56 h):** P12 → P13.

**Total rough estimate:** ~180–280 man-hours across all waves, with Waves 1–2 (~50–75 h) delivering the majority of the player-perceived improvement.

## Test & reporting conventions (for every item)

- One Playwright spec file per item under `tests/e2e/<area>/`, following existing patterns (`game.debugClick`, `readState`, `page.evaluate` for internals). Reuse existing area folders (`ascendency/`, `black-hole/`, `star-map/`, `megastructures/`, `energy/`, `resources/`) where they exist; create a new folder only for genuinely new areas (`notifications/`, `precision/`, `resource-tick/`, `autosell/`, `automation/`, `ui-layout/`).
- Each test prints a **measured gain** to the report (clicks saved, ms saved, alignment px, accounting error, balance ratio) so the post-implementation report shows quantified improvement, not just pass/fail.
- Run the full existing suite before starting each wave to establish the baseline (`node tests/run-e2e.mjs`).
- Save-migration items (P9, P10) additionally need a load-old-save e2e case using `tools/save-inspector/` fixtures.