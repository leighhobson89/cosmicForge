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

The audit moved several items vs. the original review order: **P3** (power toggle) turned out *harder* than assumed (power is auto-managed, see its section), **P10** (automation persistence) turned out *more independent* and *smaller* than assumed — no save-format work at all — and is promoted to a quick win, **P11**'s audit numbers were corrected (×0.88 per level, not −10%; an "Always Active" maxed state already exists), and **P15** (balance) belongs with the important medium-size items rather than last.

### Execution order (priority × size)

| Exec # | ID | Item | Tier | Value | Effort |
|--------|----|------|------|-------|--------|
| 1 | P3 | Powered On/Off toggle — ✅ **COMPLETED** | 1 — quick win | Medium | Very low (3–5 h) |
| 2 | P1 | Buy Max / bulk purchase — ✅ **COMPLETED** | 1 — quick win | Very high | Low (8–12 h) |
| 3 | P2 | AP list sorting + alignment + maxed-state cleanup — ✅ **COMPLETED** | 1 — quick win | High | Low (6–10 h) |
| 4 | P4 | Star list: name sort + direct travel target — ✅ **COMPLETED** | 1 — quick win | High | Low (6–10 h) |
| 5 | P10 | Automation toggles survive rebirth — ✅ **COMPLETED** | 1 — quick win | High | Very low (3–5 h) |
| 6 | P5 | Increase All Storage + persistent earned increases — ✅ **COMPLETED** | 2 — important | Very high | Medium (10–16 h) |
| 7 | P6 | Notification layout + Clear-All safety | 2 — important | High | Medium (8–12 h) |
| 8 | P7 | Precision / rounding / affordability consistency — ✅ **COMPLETED** | 2 — important | High | Medium (12–18 h) |
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

## ~~P2 — AP list: sorting, maxed state~~ ✅ DONE

~~**Audit.** The Ascendency Perks section (`drawTab7Content.js:1737–1818`) iterates `Object.keys(ascendencyBuffsArray)` — **insertion order, no sorting** (line 1750). Every buff renders a Buy button unconditionally (lines 1771–1779) with the `red-disabled-text` class — the same red used elsewhere for "can't afford", so "maxed" and "broke" look identical. Each row shows a buy-status text (line 1794) *and* a cost text (lines 1796–1800), so a maxed non-rebuyable perk displays its completion info twice.~~

~~**Change.**~~
~~- Sort perks: not-purchased → partially purchased → fully purchased (stable secondary sort by cost).~~
~~- Maxed perks: hide the Buy button entirely, show a single "Maxed" badge in the far right slot with a class of green-ready-text, and remove the duplicated text.~~

~~**Effort:** ~4–8 h.~~
~~**Risk:** Low. Pure presentation + one sort comparator.~~

~~**Integration test.** `tests/e2e/ascendency/ascendency-ui.spec.js`: grant AP, buy one perk to max via `purchaseBuff` calls, reload tab 7, assert (a) DOM order groups unmaxed before maxed, (b) maxed row has no buy button, (c) maxed row contains exactly one "maxed" indicator (preferably the one on the far right and the other one replaced with blank string but not affecting layout).~~

~~**As built.** Four notes on where the implementation differs from, or goes past, the sketch above:~~

- ~~**The button is replaced, not simply hidden.** The Buy button carries the `margin-left: auto` that pushes the price slot to the row's right-hand edge, so dropping it collapses the whole right-hand column back to the left. It is swapped for `createAscendencyMaxedSpacer()` (`ui.js`) — the same box, the same word, `visibility: hidden` — and the spec measures the badge's right edge against an unmaxed row's price to prove the column does not move.~~
- ~~**The frame loop does the swap, not just the redraw.** `checkAscendencyButtons()` removes the button the instant the last purchase lands, so the player never sees a red "finished" button waiting for a redraw. Sorting, by contrast, is deliberately settled only at draw time: re-sorting live would slide a row out from under the pointer at the moment the player finishes a perk.~~
- ~~**"Maxed" is one wording for both kinds of perk.** The old code had a separate branch and a separate phrase for a capped rebuyable ("Bought Max") and a spent one-shot ("Bought") — and the latter was the same word the status slot beside it was already showing. Both now show a single new `textMaxed` key, translated into all six shipped languages; the now-unreachable `textBoughtMax` was deleted, which `validateLocalization.cjs` confirms.~~
- ~~**Two incidental defects in the same rows were fixed.** The far-right container was created with the literal id `buffCost` on *every* perk row, so the pane emitted one duplicate DOM id per perk; it is now keyed by the perk. And the price was drawn with `Math.floor` while `purchaseBuff` charges `Math.round`, so a fractional price (any perk with a non-integer `rebuyableIncreaseMultiple`) was quoted a point below what it charged until the first frame overwrote it.~~

~~`isAscendencyBuffMaxed()` and `getAscendencyBuffCost()` now live in `resourceDataObject.js` beside the catalogue, because the "maxed" and "next price" rules had been worked out inline in three places that did not agree — notably several *non*-rebuyable perks carry a `timesRebuyable` of 100000, which only means "no cap" for a rebuyable one.~~

~~Two existing assertions in `ascendency-perks-live.spec.js` were updated rather than worked around: they pinned the old wording (`'Bought Max'`, `'Bought'`) and the old gate (a red button made unclickable by `pointer-events: none`). They now assert the new, strictly stronger gate — that there is no button at all — and that no button is drawn back in on a redraw.~~

---

## ~~P4 — Star list: alphabetical sort + direct travel targeting~~ ✅ DONE

~~**Audit.** `sortStarMethod` (default `'distance'`, `constantsAndGlobalVars.js:393`) supports `distance, type, weather, precipitationType, fuel, ascendencyPoints` — **no `name` sort**. The comparator in `sortStarTable` (`ui.js:11858+`) has no `name` case, and the sort headers are wired in `drawTab5Content.js:618–648` via `handleSortStarClick(...)`. The text list rows are built by `createStarDestinationRow` (`ui.js:5906`); the targeted-star highlight path already exists (`ui.js:5873–5880` calls `createStarDestinationRow(destinationStarData || star.name, !!destinationStarData)` and `setDestinationStar(...)`), but clicking a row in the *list* does not set the travel target or highlight the star on the graphical map.~~

~~**Change.**~~
- ~~~~Add a `'name'` case to the `sortStarTable` comparator and a clickable "Name" header in `drawTab5Content.js` to replace the column header "Sort By" which when clicked sorts stars alphabetically by their name.~~~~
- ~~~~Make each list row have a clickable button with a globe or wireframe globe icon which when clicked will set `setDestinationStar(...)` (or the equivalent targeting state), navigate the user to the star map in normal mode, and highlight the star on the map canvas (reuse the existing search star map feature functionality and pass in the star name from the clicked button so we see the star map and the star "pinged" like we have used the search feature.)~~~~

~~**Effort:** ~6–10 h (comparator trivial; map-highlight + state plumbing is the bulk).~~
~~**Risk:** Low-Medium. Must not break the travel-in-progress guards (`getStarShipTravelling`).  Needs to think about any situations that could behave differently ie settled stars dont need the button and check we dont have an issue clicking a star where the starship is on route to or orbiting, may or may not have any issue, investigate.~~

~~**Integration test.** `tests/e2e/star-map/star-list.spec.js` (extends the existing `star-map/` suite): open star list, sort by name, assert first row is alphabetically first; click a known distant star row, assert `getDestinationStar()` matches and the map highlights it by the search functionality.~~

~~**As built.** Five notes on where the implementation differs from, or goes past, the sketch above:~~

- ~~**The globe shows a star; it does not choose one.** The sketch had the button call `setDestinationStar` and highlight the star. It does not: it switches the map to normal mode, navigates to the pane and drops the search box's ping, and leaves the destination exactly as the player left it. Choosing a destination stays the map's own job, one click away once the player can see where the star is. That also disposes of the whole travel-guard question the sketch raised — nothing here cares whether the ship is in flight or in orbit, because looking at a star cannot go wrong, and `star-list.spec.js` pins that rather than the refusal it replaced.~~
- ~~**The Name header is the row's own label, not a seventh cell.** `createOptionRow` renders the left-hand slot as a `<label>` and puts the star's colour class on the container around it; the six value headers live in `.star-table-cells` to its right. The Name header is that label, given `id="starLegendName"` after the row is built so `sortStarTable` can find it by id like the other six. It carries an `info-emoji` (`infoTooltipStarLegendName`) explaining both that the header sorts and that the globe shows a star on the map, since a globe glyph explains neither; clicking the icon is guarded so that reading the tip does not re-sort the table under the player.~~
- ~~**A CSS gate the button had to opt out of.** `createOptionRow` copies the star's colour class onto the whole name column, and for any star the run cannot fuel that class is `red-disabled-text` — which is `pointer-events: none` throughout this game. Every globe was therefore dead on exactly the stars a player is most likely to be planning towards, and dead on every star early in a run. `.star-target-button` sets `pointer-events: auto` to escape it. Affordability is the Travel button's gate, not this one's.~~
- ~~**The globe leads the name, and glows.** A trailing button ends up painted over: the name column is a fixed fraction of the row, a long star name overflows it, and the value cells are later siblings. At the head of the column it is always inside its own box, and a megastructure star's icon still sits where it always did, after the name. The game hides the real cursor behind a custom pointer, so `cursor: pointer` cannot signal that the globe is live — it is drawn in `--ready-text` with a `drop-shadow` glow instead (a `drop-shadow`, not the `text-shadow` `.green-ready-text` uses, because the mark is an SVG stroke). The trailing `:` was dropped from every star name in the column at the same time: this is a sortable header over a list of names now, not a label introducing the cells beside it.~~
- ~~**The ping was leaking past the map.** It is a viewport-positioned element on `document.body` that repeats for four seconds, and nothing took it down when the map stopped being the pane on screen — so it could still be flashing over another tab entirely. `clearStarMapSelectionPing()` is now called from `updateContent` on every pane change and from the map-mode buttons, which throw the field away and rebuild it. This was a pre-existing defect in the search box, fixed for both entry points at once, and `star-map-live.spec.js` gained a spec for the search half.~~

~~The comparator itself was the trivial part the sketch promised: a `name` case in `sortStarTable` reading each record's own `name` and falling back to the object key, so a settled star stubbed into the table without one still sorts. Settled stars continue to sink to the bottom whatever the sort, as they did before.~~

~~New coverage lives in `tests/e2e/star-map/star-list.spec.js` — twenty specs across the Name column, the globe and the in-flight case.~~

---

## ~~P10 — Automation toggles survive rebirth~~ ✅ DONE

> ~~*"The automation settings should stay from one rebirth to the next, it's a bit of a bother to be~~
> ~~slowed down by having to go and activate again the telescope automation, the research~~
> ~~automation… It's not a lot of clicks, but it gets in the way of the acceleration of rebirths when~~
> ~~it's clear that of course, there is basically no reason to not automate once we've reached enough~~
> ~~of an endgame that we can actually afford to buy the automation."* — player reviewer~~

~~**Audit.** Rebirth wipes `resourceData` back to a pristine module-load snapshot —~~
~~`resetResourceDataObjectOnRebirthAndAddApAndPermanentBuffsBack()` (`resourceDataObject.js:3700`)~~
~~deletes every key and re-assigns `structuredClone(resourceDataRebirthCopy)`, then hand-restores a~~
~~named list: AP, the black hole's six fields, the whole `cosmicRip` sub-object, philosophy~~
~~repeatable prices, megastructure techs, and exactly one automation flag —~~
~~`research.upgrades.autoBuyer.active`.~~

~~Every automation control in the game is a **pair**: an *ownership* flag saying the player has the~~
~~capability, and an *enabled* flag holding the player's own on/off choice. Rebirth restores the~~
~~ownership half and drops the enabled half on the floor. That asymmetry is the whole bug, and it is~~
~~exactly what the reviewer is describing.~~

~~Verified by driving the reset function directly and diffing every flag either side of it:~~

| ~~Field~~ | ~~Owner-gate~~ | ~~Gate is~~ | ~~Enabled flag after rebirth~~ |
|---|---|---|---|
| ~~`space.upgrades.spaceTelescope.autoSpaceTelescopeEnabled`~~ | ~~`autoSpaceTelescopeRowEnabled`, set by the `autoSpaceTelescope` AP perk (40 AP)~~ | ~~**permanent** — restored by `addPermanentBuffsBackInAfterRebirth()` (`game.js:15662`)~~ | ~~**reset to `false`**~~ |
| ~~`space.upgrades.spaceTelescope.autoSpaceTelescopeMode`~~ | ~~same perk~~ | ~~**permanent**~~ | ~~**reset to `'studyAsteroid'`** — the player's chosen mode (asteroid / star / void) is lost too~~ |
| ~~`research.upgrades.autoBuyer.enabled`~~ | ~~`research.upgrades.autoBuyer.active`, set by the `roboticResearchAutomation` AP perk (20 AP)~~ | ~~**permanent** — hand-restored at `resourceDataObject.js:3746`~~ | ~~**reset to `false`**~~ |

~~**Scope: those three fields, and nothing else.** They are the two the reviewer named, plus the~~
~~telescope's mode dropdown, which is part of the same control — re-ticking the telescope box without~~
~~it puts the player back on the wrong job.~~

~~**Deliberately excluded.** The audit turned up two more families that reset, both left alone:~~

- ~~**`compounds.<c>.autoCreate` × 6.** Its capability *is* permanent (pseudo-tech~~
  ~~`compoundMachining`, granted only by the `compoundAutomation` AP perk), so it would qualify on the~~
  ~~same rule — excluded by explicit decision, not by oversight. Persisting it later is a one-line~~
  ~~addition to the list this item introduces.~~
- ~~**`autoSell` × 14** (8 resources, 6 compounds). Gated on tech `nanoBrokers` (`game.js:15903`), a~~
  ~~19 000-point tech — above `jumpstartResearch`'s ≤ 4200 re-grant threshold, so it is genuinely~~
  ~~re-researched every run. A remembered toggle would sit inert until then. Reconsider only if that~~
  ~~tech is ever made permanent.~~

~~**Correctly resetting, do not touch.** These look like automation but are per-run purchases whose~~
~~"on" state is already the default: autobuyer tier `active` flags across all resources and compounds~~
~~(default `true`; the machines themselves reset to `quantity: 0`), the three science-building~~
~~`active` flags (default `true`), `buildingTypeOnOff` for the three power plants (you own none at~~
~~rebirth), and the rocket fueller arrays. `activatedFuelBurnObject` is derived state, not a choice.~~

~~**The plumbing already exists.** `captureGameStatusForSaving` serialises `resourceData` wholesale~~
~~(`constantsAndGlobalVars.js:1727`), so all three fields already round-trip through save/load and~~
~~through the cloud save. Nothing about the save schema changes — **no data-version bump and no~~
~~`migrateResourceData` entry is needed.** The only thing that destroys these values is the rebirth~~
~~reset itself.~~

~~**Change.** Snapshot the three values before the wipe and write them back after it, in~~
~~`resetResourceDataObjectOnRebirthAndAddApAndPermanentBuffsBack()` — the same shape as the existing~~
~~`researchAutoBuyerEnabled` line, which is the pattern this item generalises. Rather than three more~~
~~hand-written locals, declare them as a list (`REBIRTH_PERSISTED_AUTOMATION`) pairing each setting~~
~~with its owner-gate, so adding the fourth is one entry rather than a bug report.~~

~~Restore each setting **only when its owner-gate survived**: a player who reaches a run without the~~
~~perk must not inherit an enabled toggle for a capability they no longer have. The restore therefore~~
~~has to run *after* the ownership flags are put back, which for the telescope means after~~
~~`addPermanentBuffsBackInAfterRebirth()`.~~

~~There is no need for an opt-out setting: these are ordinary toggles the player can still switch off~~
~~at any time, and the reviewer's point is precisely that nobody switches them off once bought.~~

~~**Effort:** ~3–5 h. Smaller than first estimated — one function, one declared list, no schema work.~~
~~**Risk:** Low. No save-format change; the fields already persist. The only real trap is restoring a~~
~~setting whose capability did not survive, which the owner-gate check above closes.~~

~~**Integration test.** `tests/e2e/automation/persistence.spec.js`: buy the two AP perks, turn both~~
~~controls on through their real UI controls, set the telescope to a non-default mode, rebirth through~~
~~the real rebirth flow, then assert all three values survived **and** that the automation actually~~
~~runs in the new run rather than merely reading as enabled. Assert the negatives in the same suite: a~~
~~run that never bought the perks comes back with both unowned and disabled, an `autoSell` toggle~~
~~still resets (deliberately out of scope), and autobuyer tier flags come back `true`.~~

~~**As built.** Four notes on where the implementation differs from, or goes past, the sketch above:~~

- ~~**One declared list, not three hand-written locals.** `REBIRTH_PERSISTED_AUTOMATION` (`resourceDataObject.js`, immediately above the reset it serves) pairs each setting with the `ownedBy` flag it depends on. The reset maps the list to a snapshot before the wipe and walks it again after, so adding the fourth setting is one entry. `compounds.<c>.autoCreate` is the obvious next candidate and the comment says so, since it was scoped out by decision rather than because it would not work.~~
- ~~**Order inside the reset turned out to be load-bearing.** The restore has to be the last thing the function does, because both owner-gates are themselves put back earlier in it — the research auto-buyer's by the explicit line near the top, the telescope's by `addPermanentBuffsBackInAfterRebirth()` two-thirds of the way down. Checking either gate any earlier reads the freshly-wiped `false` and silently drops every setting, which is a failure that looks exactly like the bug being fixed.~~
- ~~**Snapshots read with `noWarning`.** A save old enough to predate one of these fields would otherwise log a `Missing subKey` warning on every rebirth. A missing field comes back `undefined`, which the restore skips, leaving the fresh default — the same outcome, without the console noise. That matters here because the original rebirth bug report *was* a stream of `Missing subKey` warnings.~~
- ~~**The specs prove the work, not the flag.** Two of the seven wait for the automation to actually do something in the new run with nothing clicked: the telescope starts a real star study (and it is asserted to be studying a *star*, not scanning asteroids, which is what a fix that restored the switch but not the mode would produce), and the research auto-buyer unlocks a tech on its own. Three more pin the shape of the promise — that a toggle left **off** comes back off, that the panes redraw with the restored state, and that a run without the perks inherits nothing even when the settings are forced on behind the game's back.~~

~~Two findings from the audit corrected the item before any code was written. The old text said research auto-buyer persistence was missing; in fact `autoBuyer.active` was already restored and the forgotten field was `autoBuyer.enabled`, a different flag. And it called for a save-version bump with a `migrateResourceData` entry, which is not needed at all — `captureGameStatusForSaving` serialises `resourceData` wholesale, so these fields always round-tripped through save and cloud save, and only the rebirth reset destroyed them.~~

~~New coverage lives in `tests/e2e/automation/persistence.spec.js` — seven specs in a new `automation` area.~~

---

# Tier 2 — Important (high value, larger effort)

## ~~P5 — Increase All Storage + earned-increase persistence~~ ✅ DONE

~~**Audit.** Storage increase is per-resource: `increaseResourceStorage` (`game.js:10097–10100`), charged at the old cap, ×`increaseStorageFactor` × (Efficient Storage perk `boughtYet` + 1) — see existing tests `tests/e2e/resources/resources.spec.js`. The **storage-increase action currently lives inside a notification**: `showNotificationWithAction(...)` (`ui.js:5128`) and `disableStorageNotificationActionIfShowing` (`ui.js:5432–5470`, which matches the visible message text `"${key} storage is full"`) mutate the *visible DOM button* — if the notification times out or is cleared, the earned increase's afford-action is gone until a new notification fires or until  the player manually opens the resource or ompound pane and clicks the increase storage option there. This exactly matches the player's complaint. Sell All is wired at `ui.js:1805–1808`, giving a proven home for a sibling button.~~

~~**Change.**~~
- ~~Add an **"Increase All Storage"** button next to Sell All in the main resource header (`ui.js`, near `sellAllResourcesButton`), and main compounds header which iterates unlocked resources/compounds and calls `increaseResourceStorage` for every one whose quantity ≥ its cap; skip the rest and report a count ("Increased Storage of Hydrogen, Oxygen, Iron") as notification (localised).~~
- ~~The Increase All button becomes the primary claim mechanism; individual notification buttons remain as a convenience and remains working as does the increase storage button in the resource or compound pane.~~

~~**Effort:** ~3–6 h (button + eligibility sweep + notification regression + other tests).~~
~~**Risk:** Medium. Must handle partial eligibility. (some resources full, some not)~~

~~**Integration test.** `tests/e2e/resources/storage-increase-all.spec.js`: fill 5 resources to cap via debug, leave 3 others partial; click Increase All; assert exactly the 5 full ones doubled (cap ×2, cash reduced by sum of old caps), partial ones untouched. **Persistence test:** ensure can still be increase individually by clicking the notification or the storage increase button inside the resource or compounds pane~~

~~**As built.** Ten notes on where the implementation differs from, or goes past, the sketch above:~~

- ~~**The claim is charged in the material, not in cash.** The sketch's test plan expected "cash reduced by sum of old caps"; `increaseResourceStorage` has never touched cash. A claim costs the store's own capacity less one — the game deliberately leaves a single unit behind so an upgrade cannot black out the grid — and the reservoir additionally costs 30% of the water cap in concrete. The specs assert that shape instead.~~
- ~~**One eligibility rule, asked in two places.** `getIncreasableStorageKeys(category)` (`game.js`) is the whole definition of "what is claimable right now": unlocked, capacity above zero, `quantity >= capacity - 1`, and the secondary charge covered. `increaseAllStorage()` sweeps it, and `updateIncreaseAllStorageButtonStates()` (`ui.js`) lights the header button from it every frame. The button therefore cannot offer a claim the sweep would decline, and the claim survives any notification because it was never held in one.~~
- ~~**The reservoir is claimed before concrete's own increase, by decision.** Water and concrete can both be full at once, and one press can only ever pay for one of them: enlarging the reservoir charges 30% of the water cap in concrete, while concrete's own increase spends all but one unit of the concrete store. The sweep therefore considers any material that charges a *second* material first (`STORAGE_INCREASE_SECONDARY_COSTS` and `storageClaimOrder()`), rather than in the data object's own order, which happens to put concrete first. Claiming the reservoir spends 30% rather than 100% of the concrete, and concrete's own claim comes back by itself the moment it refills; the other way round the reservoir is starved on every sweep.~~
- ~~**Solar is excluded explicitly.** It is unlocked like any other resource, has no Increase Storage row and no `solarQuantity` element for the deferred job to clear, and ships with `quantity === storageCapacity` — so a sweep that did not skip it would read it as permanently claimable and then throw.~~
- ~~**One live defect in the existing claim paths was fixed rather than worked around.** It is not new to P5, but P5 makes it trivially reachable. Notifications are queued one at a time per classification, so filling eight stores at once leaves seven toasts waiting their turn, each still offering a live claim long after the store was drained — and honouring one doubled the cap for nothing, because `increaseResourceStorage` queues the charge while the cap increase is a deferred job that ran whether or not `checkAndDeductResources()` could collect it. The notification's action button is the one purchase control in the game that the frame loop's `red-disabled-text` pass never reaches, which is why it needs an explicit check: `performIncreaseStorageForKey()` — the route both the notification and the sweep take — now re-checks the claim against live state before honouring it. The pane buttons need no such check and did not get one; they are CSS-gated like every other purchase, including the reservoir's concrete cost, which the button inherits from its own description label. An earlier draft of this note claimed otherwise, and the spec that was written to prove it is what showed the gate was already there.~~
- ~~**The summary notification needed its own classification.** Posted under `storage`, as the storage-full toasts are, it was never seen: notifications are queued one at a time per classification, and every store the sweep had just claimed already had a storage-full toast sitting in that queue at eight seconds apiece, so the summary surfaced roughly a minute after the press that caused it. It is raised under `storageIncreased` instead, which gives it its own column and puts it on screen with the press. Classifications are created on demand, so nothing had to be registered for it.~~

- ~~**Each claim in a sweep settles as it is made.** A purchase in this game does not pay for itself when it is made: it queues into `itemsToDeduct`, a keyed map the frame loop settles on its next pass. The sweep calls `checkAndDeductResources()` after every claim, the same thing `buyMaxForRow` does and for the same reason — otherwise a second press landing inside the same frame would queue the identical claim again and overwrite the first, giving one payment and two doublings.~~

~~The buttons themselves are `#increaseAllStorageResourcesButton` and `#increaseAllStorageCompoundsButton`, sharing each sidebar header's right-hand slot with Sell All. Both were shrunk and the new label kept short — "Storage All", and similarly short phrases in the other five languages — so the pair fits beside the pane title without crowding it.~~

~~New coverage lives in `tests/e2e/resources/storage-increase-all.spec.js` — nineteen specs across the header button's gate, partial eligibility, the reservoir ordering, solar, and the two regressions above.~~

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

## ~~P7 — Precision, rounding, affordability consistency~~ ✅ DONE

~~**Audit.** Resource quantities are floats updated by delta timers (`updatedQuantity = Math.min(currentQuantity + productionAmount, storageCapacity)`, `game.js:3041`). Affordability checks compare raw floats against costs while the UI displays rounded values — `ui.js` alone has 18 `toFixed` call sites, plus `Math.round` sites across `drawTab*`. `processAutoSell` and purchases write back floats. No central formatting/precision policy exists — each display site rounds independently. Buy Max doesn't exist yet (P1), but a naive max-buy on floats will reproduce the "stops 0.01% short" bug, so the affordability helper should land first or together.~~

~~**Change.**~~
- ~~Introduce one utility module (e.g. `precision.js`): `canAfford(cost)`, `formatDisplay(value)` (single rounding policy), and an epsilon-tolerant comparison (`value >= cost - 1e-9`).~~
- ~~Route all affordability checks and all display formatting through it. Fix Buy Max to compute the exact max via the closed-form geometric series rather than click-looping where possible.~~
- ~~Audit bonus application paths (production multipliers, moving-banner "double production") for intermediate rounding; round only at display.~~

~~**Effort:** ~12–18 h (many call sites; mechanical but broad).~~
~~**Risk:** Medium. Touches economy everywhere — needs the e2e suite run as a regression gate (it already covers storage pricing, sell, compounds).~~

~~**Integration test.** `tests/e2e/precision/precision.spec.js`: set a resource to `cap - 0.0000001` via `page.evaluate`, assert the displayed value and the Buy button's enabled state agree (no "looks affordable but fails"); Buy Max at near-cap fills to within epsilon of cap in **one** click; apply the double-production banner and assert displayed rate == actual delta over a measured tick window (no rounding drift).~~

~~**As built.** Ten notes on where the implementation differs from, or goes past, the sketch above:~~

- ~~**The policy is one rule with a direction, not just an epsilon.** `precision.js` rounds **holdings down and costs up**, and shares **one tolerance** between every gate, every charge and every display. Because prices are always integral — `setNewItemPrice()` puts each one through `Math.ceil` — those two choices together make an equivalence hold exactly: `canAfford(quantity, cost)` is true if and only if `displayQuantity(quantity) >= displayCost(cost)`. That is the whole point. "It looks affordable but the button is red" is now impossible by construction rather than avoided by luck, and the spec asserts that equivalence directly over the boundary cases rather than spot-checking a few values.~~
- ~~**The tolerance is relative as well as absolute.** A flat `1e-9` stops being a tolerance at all at the scale a late run reaches: past about 1e6 the gap between adjacent doubles approaches it, and past 1e15 it is smaller than one representable step, so an absolute-only epsilon vanishes exactly where accumulated drift is worst. `toleranceFor(value)` is `max(1e-9, |value| * 1e-13)` — roughly 450 ulps of headroom at every scale, and never more than a tenth of a unit at a price of 1e12. The share was tuned down from an initial 1e-12 for exactly one reason: at that size the tolerance at 1e12 is a *whole unit*, which `displayCurrency` then rounded a full unit upward, reintroducing at the top of the range the very overstatement the module exists to remove. For the same reason `displayCurrency` clamps its own slack to half a cent — a display's tolerance must never exceed half its own quantum, or the margin meant to absorb invisible drift starts moving the last digit the player can see. And for the same reason again, `truncateToDecimals` takes a **relative-only** slack rather than `toleranceFor`: the abbreviation ladder divides before it truncates, and an absolute floor calibrated for a raw balance is nonsense once the value has been scaled down by a billion. 9,999,999,999 divides to 9.999999999, exactly 1e-9 short of ten, so the floor pushed it over and rendered `10.0B` — a tenth of a billion more than the player held, in the one function whose entire purpose is to never overstate. A share of the value survives the division; a fixed floor does not.~~
- ~~**The gate and the charge had to move together, and that was the real risk.** Loosening only the button's condition would have handed out free units: `gain()` grants the item before the charge settles, and a failed settle in `checkAndDeductResources()` also suppresses the matching price rise in `checkAndIncreasePrices()`, so a purchase allowed by the gate but refused by the charge is one unit given away at the old price. Both now call the same `canAfford`, and `settleSpend()` snaps the residue to zero so the tolerance cannot become a route to a negative balance.~~
- ~~**A live off-by-epsilon defect was found and fixed, not merely tightened.** The frame loop coloured a building's *secondary* resource costs with a strict `>` while the charge settles on `>=`. Holding exactly the 100 carbon a `powerPlant1` asks for therefore showed carbon in red and killed the button — on a purchase the game would have honoured had the click reached it. Those spans are not decoration: `setStateOfButtonsBasedOnDescriptionStateForBuildingPurchases()` reads the classes back off them to decide whether the Buy button is enabled, so the colour of a span *is* the gate. The two copies of that block were collapsed into `setPriceSpanAffordabilityClasses()`, so there is now one place where it can go wrong.~~
- ~~**The condensed notation was destroying live production rates.** Rate elements carry `class="notation"`, so the frame's formatting sweep re-parsed the already-rendered rate text as a bare number and put it back through the ladder: `"0.42 / s"` came out as **`"0 / s"`** — a running production line reading as stopped — and `"1.2K / s"` came out as `"1K / s"`. `formatProductionRateValue()` is now notation-aware and marks its output `data-notation-preformatted`, which the sweep honours. This is what the sketch's "displayed rate == actual delta" test was pointing at; the drift was in the re-format pass rather than in the accrual, which is already float-clean (`Math.min(current + amount, capacity)`, no intermediate rounding).~~
- ~~**Buy Max keeps its loop; the closed-form geometric series was deliberately not written.** `buyMaxForRow` owns no pricing logic on purpose — it drives the row's real single-purchase handler and reads the game's own per-frame gate, which is what makes it honour every cost curve, every secondary-resource cost and every completion cap for free. A closed form would duplicate the pricing and could only ever cover single-cash rows, not the multi-resource building rows. The precision problem in Buy Max was never the loop, it was the *stop condition* — the same gate everything else uses — and fixing that fixed it. The loop is O(log cash) in practice, because at a 1.13 multiplier the price passes any balance within a few dozen iterations.~~
- ~~**Three copies of the abbreviation ladder became one.** `formatNumber`, the condensed branch of `formatAllNotationElements` and `formatSellStringCondensed` each carried their own copy, and they disagreed at the bottom of the range: all three truncated correctly above 1000 but rounded *up* below it with `toFixed(0)`, and `formatGroupedNumber` used `Math.round`. So a store holding 999.6 read "1000" in both notation modes, beside a 1000 price the game refused. `formatAbbreviatedNumber()` is now the single ladder and truncates at every magnitude. Negatives keep exactly the path they had — every branch tests `>=`, so they were never given a suffix — because a negative here is a net production rate rather than a holding, and the rounding direction that protects the affordability invariant does not apply to it. For the same reason rates still *round* below 1000: truncating a live 0.005 / s trickle to "0.00 / s" would read as stopped, and no rate is ever compared against a price.~~

~~The module is `precision.js`, dependency-free like `utilityFunctions.js` — it is imported by `game.js`, which `constantsAndGlobalVars.js` in turn imports, so taking a dependency would close a cycle around the module that owns boot state. It holds no mutable game state, which is why nothing in it sits behind a getter/setter in the constants file. The local `1e-9` in `onboarding.js` was folded into it as well, so there is genuinely one tolerance in the game.~~

- ~~**A second spec, `tests/e2e/rounding/rounding.spec.js`, sweeps the seams.** Fifty-two scenarios organised by *seam* rather than by feature, each naming the two things that have to agree: the policy primitives, the notation ladder, the price escalation, every purchase gate against its own charge, storage claims and the reservoir's 30% share, production accrual, sales and conversions, energy and fuel, and a whole-run pass over persistence and the rendered screen. It exists because the rounding faults in this game are never inside one function — they are always a value rounded one way for display and compared another way for a purchase, or a total computed twice by two routes that round differently. It found three live defects that the P7 work above had not.~~
- ~~**Selling read its own price tag.** `sellResource()` and `sellCompound()` computed the payment by parsing the cash back out of the rendered preview — a string `setResourceSalePreview()` writes through `toFixed(2)`. So a sale paid whatever two decimal places rounded to rather than what the goods were worth: 12.7 units at 0.04752 quoted "$0.60" and paid 0.60 against a true 0.6035. Worse, the quantity was parsed with `\((\d+)`, which stops at a decimal point, while the fixed sell amounts clamped with `Math.min(100, quantity)` against the raw float — so a partial stock was quoted "(12.7 Hydrogen)", deducted as 12, and paid for as 12.7. The clamps now floor, so the label round-trips exactly, and both sell paths compute `quantity * saleValue` directly — the same arithmetic `sellAllUnlockedResources()` has always used, so the two routes to a sale can no longer disagree about what a stock is worth. **Not** changed, on Leigh's ruling: the sub-unit remainder left after a sale is deliberately swept to zero rather than kept or paid for. The spec pins that as intended so it is not re-reported.~~
- ~~**The truncation slack had to shrink twice before it was right, and the reason is worth keeping.** `truncateToDecimals` is the twin of `toleranceFor`, but it is called *after a division* — the abbreviation ladder divides by up to 1e12 before it truncates. A tolerance that is invisible drift at the original magnitude is enormous at the scaled one. At the absolute 1e-9 floor it rendered 9,999,999,999 as "10.0B"; at a relative 1e-13 it still rendered 9,999,999,999,999 as "10.0e12" — each a whole tenth of a suffix more than the player held, in the one function whose entire purpose is to never overstate. The only error it actually has to absorb is binary representation across a divide and a multiply, which is at most two ulps, so the slack is four ulps of the value. That is a thousand times smaller than the smallest difference a one-decimal display can show, so it can never move a rendered digit, and it still fixes the case it exists for: binary cannot hold 2.9, so `2.9 * 10` is 28.999999999999996 and a bare floor would render it "2.8".~~

- ~~**The last two charges outside the policy were the one-off structures.** The launch pad and the space telescope are bought by `buildSpaceMiningBuilding()`, which settles its charge on the spot rather than queueing into `itemsToDeduct` - so it is the only purchase path in the game that never reaches `checkAndDeductResources()`, and it was missed by the original sweep for exactly that reason. It deducted with `Math.floor(balance - price)`, which does not charge the price at all: it charges the price *plus* whatever fraction the balance happened to be carrying. A purse holding $5,000,000.75 paid $40,000.75 for a $40,000 launch pad, and surrendered a quarter of a unit extra from each of its three material stores. Both now go through `settleSpend()`, so the claim that there is one tolerance in the game is finally true of every charge rather than of every *queued* charge. The graveyard archive in `destroySaveGameOnCloud()` was not involved; it copies columns rather than charging anything.~~

~~New coverage lives in `tests/e2e/precision/precision.spec.js` — eight specs across the equivalence itself, the stat bar against a real purchase gate, the exact-secondary-price building, a store an ulp under its cap, Buy Max at the affordability edge, the rate display in both directions, and holdings in both notation modes — and in `tests/e2e/rounding/rounding.spec.js`, fifty-two scenarios across every seam in the game where two subsystems round differently. `tests/e2e/notation/notation.spec.js` also has one expectation deliberately changed: it asserted `formatNumber(999.9) === '1000'`, which *was* the defect, and now expects `'999'`.~~

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

**Audit.** No card/block component exists.

**Change.** Adopt the **cards/blocks** option (player-preferred): wrap each option group in a bordered/padded card within the P12 grid system. Where cards are too heavy (dense lists), fall back to the improved-spacing rule: tight below the owning item, generous before the next title. Apply globally via the shared row component so it's one fix, not per-tab patches.

**Effort:** ~10–16 h (CSS + template changes inside the P12 component; do after P12 starts).
**Risk:** Low-Medium (purely visual; theme coverage needed).

**Integration test.** Visual regression screenshots per theme (terminal/light/frosty/summer/dark) before/after; DOM assertion that each option group is wrapped in a single container element whose bounding box contains both its title and action text.

---

## Cross-cutting implementation order (dependency-aware)

```
Tier 1 (quick wins, independent — any order):
  P3 power ── P1 bulk buy ── P2 AP UI ── P4 stars ── P10 persistence
      (P10 is fully independent: the nine controls it covers are all gated on AP perks,
       and autosell is out of its scope because its tech is re-earned every run)

Tier 2 (important):
  P5 storage ──► P6 notifications (P6 depends on P5's state-derived eligibility)
  P7 precision ──► P8 tick (P7's helpers are prerequisites for trustworthy tick tests)
  P15 balance (independent)
  P8 tick ──► P9 allocation

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
- Save-migration items (P9) additionally need a load-old-save e2e case using `tools/save-inspector/` fixtures. P10 is **not** one: `resourceData` is serialised wholesale, so the fields it persists already round-trip and the save format does not change.