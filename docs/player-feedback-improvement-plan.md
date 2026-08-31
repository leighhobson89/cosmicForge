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
| 11 | P9 | Autosell → production allocation redesign — ✅ **COMPLETED** | 2 — important, large | Very high | High (25–40 h) |
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

- ~~**The compound Create path was still reading its own display back, and it cost the player the storage increase.** Selling was fixed above; crafting was not, and it is the same fault. `setCompoundCreatePreview()` computes the exact fill, renders it into the preview sentence, and the frame loop parsed that sentence back as the amount to craft. Preview elements carry the `notation` class, so in condensed notation - the shipped default - the ladder had already truncated the figure: a 132,432 "Fill To Capacity" rendered "132.4K" and crafted 132,400. Exactly 32 units short, on every compound, every time, which is why the store did not read as full, the Create button stayed enabled, and the storage increase the fill was *for* stayed locked until a second click. The figures are now recorded unrendered beside the sentence and the craft uses those.~~

- ~~**And the storage claim itself was a race against the game's own consumption.** `getIncreasableStorageKeys()` asks for `quantity >= capacity - 1` on an instantaneous reading. Production stops at the cap; a fuel burn does not. So diesel - the fuel the early power plants run on - is back under its cap the frame after it reaches it, and the increase could not be claimed at all without shutting the grid down, filling, claiming, and turning it back on. The offer now forgives one second of the material's own `usedForFuelPerSec`, which a store that never filled cannot reach, and `increaseResourceStorage()` quotes its charge against the stock as well as the cap - necessary because the cap increase is a deferred job that runs whether or not the charge settled, so loosening the offer alone would have started handing out doubled caps for free.~~

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
- The diesel micromanagement (pause consumption → hit cap → resume) is a direct symptom (although currently worked around by the rounding refactor not properly solved probably needs investigation).
- `rate` is written per-timer (`game.js:3048`), so the displayed net rate is computed per-subsystem, not per-resource.

**Change.**
- Create a single per-frame `resourceTick(deltaMs)` that, per resource: (1) sums all gains (auto-buyers, precipitation, manual), (2) sums all demands (fuel, compounds, autosell allocation, other consumers), (3) resolves net change against capacity in one write, (4) publishes `producedThisTick` / `consumedThisTick` for allocation (consumed by P9).
- Migrate existing per-subsystem timers to *contribute* to the tick instead of writing quantities directly. This is the largest refactor in the plan; do it resource-by-resource behind a feature flag if needed.
- Cap detection ("reached capacity this tick") becomes reliable, which fixes the storage-increase trigger and the diesel workaround.

**Effort:** ~30–50 h.
**Risk:** High. Every economy system touches this. Mitigate with the existing e2e suite as a golden-path regression net, plus new tick-invariant tests, and migrate one subsystem at a time.

**Integration test.** `tests/e2e/resource-tick/tick-invariants.spec.js`: with known gains/losses configured, assert over N ticks: `quantity == clamp(prev + net, 0, cap)` exactly (no intermediate-state artifacts); a resource with net-positive production **does** register cap-reached (the 1B-gain/100-spend case); diesel reaches cap with consumption running (measured: no manual pause/resume needed). Report before/after tick-accounting error.

---

## ~~P9 — Production allocation (autosell, compound automation and storage on one line)~~ ✅ DONE

~~**The player's ask, in his own words.** *"I want autosell to never prevent me from increasing my~~
~~resources, with rare exceptions. The need, I feel, is to choose the ratio of resource spending, so~~
~~basically I want 90% of future gains to go make $, and 10% increasing resources so that I don't have~~
~~anything to do until it reaches max. I just choose how to prioritise, not lose one to get the other."*~~
~~And on compounds: *"in practice what I want is 'spend at most x% of my resource production for that'.~~
~~Maybe, to not rethink and re-engineer too much, the Resource tab could have two spending settings:~~
~~I set 10% conversion to $, I set a max of 50% conversion for automated compound use, it displays as~~
~~a result that at least 40% stays in resource accumulation. Then on the compound side, it would use~~
~~for automation only the portion of production that is made available on the resource side, not the~~
~~rest — avoids cross-tabs settings management."*~~

~~That is the whole feature in two sentences. **Every allocation decision for a resource is made on~~
~~that resource's own pane, as percentages of its production. The compound pane only decides whether a~~
~~compound is being made at all.**~~

---

~~### Audit — what the code does today~~

~~**1. Autosell does not sell production. It permanently caps the stock at 100.**~~
~~`game.js:3328-3336` (resources) and `game.js:3548-3556` (compounds) are the entire autosell~~
~~implementation:~~

```js
if (getResourceDataObject('resources', [resource, 'autoSell'])) {
    const updatedQuantity = getResourceDataObject('resources', [resource, 'quantity']) || 0;
    if (updatedQuantity > 100) {
        const autoSellQuantity = updatedQuantity - 100;
        setResourceDataObject(100, 'resources', [resource, 'quantity']);
        processAutoSell(resource, autoSellQuantity, 'resources');
    }
}
```

~~The literal `100` is hardcoded in four places (two categories, each with a read and a write). This~~
~~runs inside the *tier-1 auto-buyer delta timer*, i.e. every frame, after production has been added.~~
~~So switching autosell on does not divert a share of income — it liquidates the entire store down to~~
~~a hundred units and then holds it there forever. This is precisely the complaint: autosell and~~
~~accumulation are mutually exclusive, and there is no dial between them. `processAutoSell`~~
~~(`game.js:11159`) is three lines — `cash += saleValue * quantityToSell` — with no notification, no~~
~~market bias and no statistic.~~

~~**2. Turning auto-create on force-disables autosell on every ingredient, silently.**~~
~~`game.js:3400-3404`, inside the compound tier-1 timer, runs *every frame while auto-create is on*:~~

```js
const resources = [1,2,3,4].map(i => getResourceDataObject('compounds', [compound, `createsFrom${i}`])?.[0]);
resources.forEach(resourceName => {
    if (resourceName !== '' && resourceName !== undefined) {
        setResourceDataObject(false, 'resources', [resourceName, 'autoSell']);
    }
});
```

~~Auto-creating diesel therefore pins hydrogen's and carbon's autosell toggles off permanently, and a~~
~~player's click on those toggles is reverted within a frame with no explanation. This is a hard mutual~~
~~exclusion between the two automations, and it disappears entirely under the new model — the whole~~
~~point of the allocation line is that a resource can feed cash *and* compounds *and* storage at once.~~

~~**3. Auto-create draws from *stock*, not from production, and takes all of it.**~~
~~`game.js:3409` calls `calculateCreatableCompoundAmount(compound, { buffer: 0 })`~~
~~(`game.js:10947`), which computes `Math.floor((quantity - buffer) / ratio)` against the **current~~
~~stored quantity** of each ingredient and converts that much, bounded only by the compound's own~~
~~storage headroom. With `buffer: 0` the auto path empties the ingredient stores to the last unit,~~
~~every frame. (The manual Create path uses the default `buffer: 100`; the auto path deliberately~~
~~passes `0`.) Consequences, all read out of the code rather than inferred:~~

- ~~**Compounds starve each other, and the winner is decided by timer order.** Six recipes draw on~~
  ~~eight resources, and six of those resources feed more than one compound:~~

  ~~| Resource | Feeds | Ratios |~~
  ~~|---|---|---|~~
  ~~| hydrogen | diesel, concrete, water | 26 / 3 / 20 |~~
  ~~| sodium | glass, concrete, titanium | 1 / 2 / 18 |~~
  ~~| carbon | diesel, steel | 12 / 1 |~~
  ~~| silicon | glass, concrete | 4 / 5 |~~
  ~~| oxygen | glass, water | 2 / 10 |~~
  ~~| iron | steel, titanium | 4 / 22 |~~
  ~~| neon | titanium | 40 |~~
  ~~| helium | *(nothing)* | — |~~

  ~~Whichever compound's `${compound}AB1` timer fires first that frame consumes the shared ingredient~~
  ~~down to zero; the ones after it create nothing. There is no arbitration anywhere in the code.~~
- ~~**A resource with any auto-creating consumer can never accumulate** — the same defect as autosell,~~
  ~~wearing a different hat, and the reason automation currently feels like "I stop growing".~~
- ~~**Storage-increase claims become unreachable** for any ingredient, for exactly the reason diesel's~~
  ~~were before P7: the store is emptied the frame after it fills.~~

~~**4. The displays are all downstream of these two behaviours, and all need reworking.**~~
- ~~`game.js:10225-10241` — when autosell is on and capacity > 100, the quantity readout is forced to~~
  ~~`stats-text` and stripped of `green-ready-text`. The game *deliberately suppresses* the storage-full~~
  ~~colour, because under today's semantics the store can never legitimately fill. Under the new model~~
  ~~it can, so the suppression must go or the storage-increase claim stays invisible.~~
- ~~`ui.js:3002` `buildAutoCreateDiversionLines` — the resource tooltip says only *"diverted to create~~
  ~~{compound}"*, with no quantity, because today the honest answer is "all of it".~~
- ~~`ui.js:3029` `calculateAutoCreateRatePerSecond` and `ui.js:2930` `buildAutoCreateGenerationLine` —~~
  ~~the compound tooltip estimates its creation rate as `min(ingredient gross rate / ratio)` across~~
  ~~ingredients, i.e. it assumes the compound has the *entire* gross production of every ingredient to~~
  ~~itself. Already wrong for any shared ingredient, and wrong by construction under allocation.~~
- ~~`game.js:3448-3479` — a compound's `rate` adds `autoCreateRate` to its auto-buyer tiers, while a~~
  ~~resource's `rate` (`game.js:3293`, `3321`) subtracts only *fuel*, never the compound draw. So the~~
  ~~headline "/s" on a resource pane is a lie the moment auto-create is on. This is the single most~~
  ~~visible display fix in the item.~~
- ~~`constantsAndGlobalVars.js:3127` `getResourceSalePreview` feeds the sell row's description — the~~
  ~~row the allocation line replaces.~~

~~**5. The two capability gates as they stand, and what they cost to move.**~~

~~*Autosell* is gated on the **`nanoBrokers` tech** — `resourceDataObject.js:851`, price 19000 research~~
~~points, prereqs Nano Tube Technology / Steel Foundries / Compounds, `idForRenderPosition: 498`,~~
~~`path: 4`. It is checked in `autoSellerChecks` (`game.js:8778`) and `setAutoSellToggleState`~~
~~(`game.js:16275`). **It is a leaf: no other tech names it as a prereq**, so it can be removed from the~~
~~tree without disturbing anything downstream. Its other references are the tech row in~~
~~`drawTab3Content.js` (lines 28, 785, 794, 797, 803, 806, 3791), the unlock notification in~~
~~`descriptions.js:562`, and four localisation keys (`techNotifyNanoBrokers`,~~
~~`optionDescTechNanoBrokersContent1`, `optionDescTechNanoBrokersContent2`, `techNameNanoBrokers`).~~

~~*Compound automation* is gated on the **`compoundAutomation` ascendency perk**~~
~~(`resourceDataObject.js:1250`, 15 AP, non-rebuyable). At run start,~~
~~`if (getBuffCompoundAutomationData()['boughtYet'] > 0) setTechUnlockedArray('compoundMachining')`~~
~~(`game.js:16015`) pushes a pseudo-tech into `techUnlockedArray`. **`compoundMachining` gates more than~~
~~auto-create**: it makes the compound *auto-buyer tier rows* visible (`game.js:7185`) as well as the~~
~~auto-create toggle (`game.js:8747`) and `setAutoCreateToggleState` (`game.js:16296`). Anything~~
~~inheriting this gate inherits the whole compound-automation unlock, not just auto-create.~~

~~**6. What already exists and should be reused.**~~
- ~~`REBIRTH_PERSISTED_AUTOMATION` (`resourceDataObject.js:3718`) is the P10 mechanism for carrying an~~
  ~~automation setting through a rebirth, with an `ownedBy` capability flag. The new percentages hook~~
  ~~straight into it; its own comment already nominates `compounds.<c>.autoCreate` as the next~~
  ~~candidate.~~
- ~~New per-resource fields inherit their defaults on old saves through the template-merge in the~~
  ~~`restoreResourceDataObject` family, so no bespoke migration is needed for *fields* — but the data~~
  ~~object `version` (`resourceDataObject.js:17`, currently `0.98`) must still be bumped, and the perk~~
  ~~change below *does* need real migration code.~~
- ~~`sellAllUnlockedResources` / `sellAllUnlockedCompounds` (`game.js:5188`, `5340`) are wired to the~~
  ~~**global** `sellAllResourcesButton` / `sellAllCompoundsButton` (`ui.js:1893`), not to the~~
  ~~per-resource rows. So *"if you just want to sell all you still have that option"* is already true~~
  ~~and survives this change untouched.~~

---

~~### Unlock rework — Nano Brokers becomes one ascendency perk, bought twice~~

~~The `nanoBrokers` **tech is removed from the tree entirely**, and the `compoundAutomation` **perk is~~
~~removed**. In their place, a single rebuyable ascendency perk named **Nano Brokers**, buyable twice:~~

| | ~~Grants~~ | ~~Cost~~ |
|---|---|---|
| ~~**Level 1** (`boughtYet >= 1`)~~ | ~~Autosell — i.e. the allocation line, in its one-handle form, on every resource and compound pane~~ | ~~**15 AP**~~ |
| ~~**Level 2** (`boughtYet >= 2`)~~ | ~~Compound auto-create, and with it the compound band on the allocation line of every resource a recipe draws on~~ | ~~**30 AP**~~ |
| ~~**Level 3** (`boughtYet >= 3`)~~ | ~~The compound auto-buyer tier rows — split out of the old `compoundMachining` gate, which granted them together with auto-create~~ | ~~**50 AP**~~ |

```js
"nanoBrokers": {
    name: "Nano Brokers",
    description: "buffNanoBrokersRow",
    rebuyable: true,
    rebuyableIncreaseMultiple: 2,
    // Not geometric - 15/30/60 would price the third rung out of reach of the
    // run that needs it - so the ladder is written out in full.
    costLadderAp: [15, 30, 50],
    baseCostAp: 15,
    effectCategoryMagnitude: 1,
    boughtYet: 0,
    timesRebuyable: 3
}
```

~~**Why this is simpler than what it replaces.** There is now exactly one capability axis with three~~
~~values (`boughtYet` 0, 1, 2), and it is permanent across rebirths by the nature of ascendency perks.~~
~~The previous plan needed an in-run tech gate layered on top of a permanent perk gate, plus copy~~
~~explaining to the player why a perk they owned was temporarily inert. All of that disappears: level 2~~
~~cannot be reached without level 1, so "compound automation implies autosell is available" is~~
~~structurally true rather than something to enforce and explain.~~

~~**Capability must be read live, not snapshotted at run start.** Today `compoundMachining` is pushed~~
~~into `techUnlockedArray` once, at run start (`game.js:16015`), so a perk bought at any other moment~~
~~would not take effect until the next run. The new gates read `boughtYet` directly wherever the~~
~~capability is checked. Keep the run-start `setTechUnlockedArray('compoundMachining')` — now driven by~~
~~`boughtYet >= 2` — so the existing `compoundMachining` consumers at `game.js:7185`, `8747` and `16296`~~
~~keep working unchanged, but *also* re-run that grant on purchase so level 2 applies immediately.~~

~~**Removals, in full:**~~
- ~~`resourceDataObject.js:851` — the `nanoBrokers` tech entry.~~
- ~~`resourceDataObject.js:1250` — the `compoundAutomation` perk entry, and~~
  ~~`getBuffCompoundAutomationData` (`resourceDataObject.js:3126`).~~
- ~~`drawTab3Content.js` lines 28, 785-806 and case `'nanoBrokers'` at 3791 — the tech row and its~~
  ~~handler.~~
- ~~`descriptions.js:562` — the research notification.~~
- ~~`game.js:11208-11231` — the `compoundAutomation` branch of `purchaseBuff`, re-homed onto the new~~
  ~~perk's level 2 (the first-run explanatory modal is worth keeping, fired on level 2).~~
- ~~Localisation: retire `techNotifyNanoBrokers`, `optionDescTechNanoBrokersContent1/2` and~~
  ~~`techNameNanoBrokers`; add `buffNanoBrokersRow` and its level-specific copy.~~

~~**Migration is required and must be written explicitly** — this is the one part of P9 that cannot ride~~
~~on the template merge:~~
- ~~A save with `'nanoBrokers'` in `techUnlockedArray` → grant `boughtYet = 1` at no AP cost. The player~~
  ~~paid 19000 research points for it; they must not lose the capability or be charged again.~~
- ~~A save with `compoundAutomation.boughtYet > 0` → grant `boughtYet = 3` at no AP cost. **Level 3,~~
  ~~not level 2**: the old perk granted `compoundMachining`, and that pseudo-tech gated the compound~~
  ~~*auto-buyer tier rows* as well as auto-create. Mapping such a player to level 2 would take the~~
  ~~tiers away from them and put a 50 AP bill on getting back what they had already paid for. A save~~
  ~~with both retired unlocks still gets 3, not 4 — the levels are a ladder, not a tally.~~
- ~~Strip `'nanoBrokers'` from `techUnlockedArray` on load so no stale entry lingers, and drop the~~
  ~~`compoundAutomation` key from the buffs object.~~
- ~~**No AP is refunded and none is charged.** Capability is preserved; the ledger is not rewritten.~~

---

~~### The model~~

~~**One resource's gross production per tick is divided in this order.**~~

1. ~~**Fuel comes off the top.** Whatever the power plants burn of this resource is taken before any~~
   ~~percentage applies. A player who sets 90% to cash must not be able to black out their own grid~~
   ~~without understanding why. The split therefore operates on **allocatable production** =~~
   ~~`gross production − fuel burn`, and the pane says so in as many words.~~
2. ~~**`cashShare` %** of allocatable production is sold. Never stock — only the flow. Cash accrues at~~
   ~~this rate *whether or not the store is full*: at the cap the bar stops moving but the money keeps~~
   ~~coming, which is the behaviour agreed explicitly in the Discord exchange.~~
3. ~~**`compoundShare` %** of allocatable production is offered to auto-creating compounds as a~~
   ~~**ceiling, not a reservation**. If the compounds drawing on this resource want less than their~~
   ~~share, or are switched off, or are at their own storage cap, the unused remainder **falls through~~
   ~~to storage**. It never becomes cash. This is the "at most x%" the player asked for.~~
4. ~~**The remainder accumulates**, exactly as production does with no automation at all, clamped at~~
   ~~`storageCapacity`.~~

~~**Splitting the compound share — an equal split, `n` ways.** A resource's compound allocation is~~
~~divided **equally between however many auto-creating compounds draw on it**, regardless of recipe~~
~~size. Iron with steel and titanium both auto-creating gives each exactly half of iron's compound~~
~~allocation. A compound that cannot use its full share **does not pass the surplus on** — the unused~~
~~part falls through to the resource's own storage, exactly like an unused ceiling.~~

~~This is deliberately chosen over a demand-proportional split for predictability: **a compound's~~
~~throughput depends only on its own settings and the resource sliders, never on what an unrelated~~
~~compound is doing.** Toggling steel off does not silently change titanium's rate; it just returns~~
~~steel's half to iron storage. Proportional sharing and player-set priority ordering are both~~
~~explicitly out of scope.~~

~~Because a recipe needs *several* resources, the per-resource shares are reconciled into one creatable~~
~~amount per compound: **a compound creates `min` over its ingredients of~~
~~`grantedShare(c, r) / ratio(c, r)`**, and then *returns* the ingredient amounts it did not need rather~~
~~than consuming its full grant — so a compound bottlenecked on neon does not also swallow the iron it~~
~~cannot use. One reconciliation pass per tick, ordered resource-shares → per-compound minimum → actual~~
~~consumption, removes the timer-order dependence of audit point 3 as a side effect.~~

~~**Compound panes get a one-handle line, and auto-create stays a plain on/off toggle.** Compounds are~~
~~not ingredients for anything, so a compound's line is `cashShare % → $` with the remainder to storage~~
~~— the same widget helium gets. Diesel's power-plant-3 burn is handled exactly as a resource's fuel~~
~~burn is: off the top, before the split. Auto-create is unchanged as a control: on or off, nothing~~
~~else, because by the time the game reaches the compound pane the resource panes have already decided~~
~~how much material it may have. That is exactly the *"avoids cross-tabs settings management"* property~~
~~the player was after.~~

~~**Manual sell retires on a pane the moment Nano Brokers level 1 is owned.** Before the perk, the row~~
~~is what it is today (quantity dropdown + Sell button) and nothing about the early game moves. After~~
~~it, the row *becomes* the allocation line plus its on/off toggle. Deliberate emptying is the global~~
~~Sell All button, which already exists and is untouched.~~

~~**The off state must be a true bypass.** With the toggle off, the resource behaves exactly as a~~
~~resource with no automation at all: no cash, no compound ceiling, everything accumulates. That is the~~
~~player's *"if you want to grow your storage you toggle it off, and turn it back on when you want funds~~
~~again"*, and it is also the safety net for the whole feature — one click returns any resource to~~
~~known-good behaviour.~~

---

~~### The control — three states, and which pane is in which~~

~~One horizontal bar representing 100% of allocatable production, cut into labelled sections by~~
~~draggable handles. Which state a pane is in is a pure function of `nanoBrokers.boughtYet` and whether~~
~~any compound recipe names that resource — no run state, no tech array, no timing.~~

~~**State A — `boughtYet === 0`: no line.** Today's manual sell row, unchanged, on every resource and~~
~~compound pane.~~

```
Iron   Sell [All Stock v] [Sell]
```

~~**State B — `boughtYet >= 1`: two sections, one handle.** Cash versus storage. This is the terminal~~
~~state for **helium** (no compound draws on it) and for **every compound pane**.~~

```
Helium  [========== 30% $ ==========|==================== 70% storage ====================]  Auto [x]
                        handle A ---^
         allocatable: 800 /s   ($240 /s  ·  560 /s stored)
```

~~**State C — `boughtYet === 2` and at least one compound recipe names this resource: three sections,~~
~~two handles.** The seven ingredient resources — hydrogen, carbon, silicon, oxygen, sodium, iron, neon.~~

```
Iron    [==== 10% $ ====|============ 40% compounds ============|======== 50% storage ========]  Auto [x]
         handle A ------^                       handle B -------^
         allocatable: 800 /s   ($80 /s  ·  320 /s to compounds  ·  400 /s stored)
```

- ~~**Handle A** sets `cashShare`. **Handle B** sets the far edge of the compound band, so~~
  ~~`compoundShare = B − A` and storage is `100 − B`. Handles cannot cross; dragging A past B pushes B~~
  ~~ahead of it.~~
- ~~The middle band's appearance is one-way in practice — perks are never lost — but `compoundShare` is~~
  ~~stored per resource from the start and simply becomes visible at level 2, so nothing is reset or~~
  ~~re-derived at the transition.~~
- ~~Sections are colour-coded using classes already in the stylesheet, and each carries its **live~~
  ~~per-second figure**, so intent and effect read in one glance.~~
- ~~**Keyboard and coarse input:** each handle is a real focusable control stepping in **5%** increments~~
  ~~with arrow keys, and clicking a section's percentage label opens numeric entry. The slider is the~~
  ~~presentation, not the only way in — this matters for the localisation suite and for touch devices.~~
- ~~**Fallback, if the drag interaction proves unworkable inside `createOptionRow`:** dropdowns —~~
  ~~`% to $`, then (in state C) `max % to compounds` populated with only the values still available~~
  ~~after the first, with the remainder stated as text. That is the player's own first suggestion and is~~
  ~~functionally identical. Decide after the widget spike, which is task 1 below, not before.~~
- ~~The line lives inside `createOptionRow`, so it inherits the P12 grid work when that lands rather~~
  ~~than needing to be redone.~~

---

~~### Displays that must change (this is the bulk of the work)~~

| ~~Where~~ | ~~Today~~ | ~~Must become~~ |
|---|---|---|
| ~~Resource pane rate (`game.js:3293`, `3321`)~~ | ~~gross − fuel~~ | ~~gross − fuel − cash share − actual compound draw: the **net accumulation rate**, matching what the bar is doing~~ |
| ~~Resource tooltip generation block (`ui.js:2535`)~~ | ~~auto-buyer tiers only~~ | ~~tiers, then an allocation breakdown — allocatable, to $, to each compound by name, to storage~~ |
| ~~`buildAutoCreateDiversionLines` (`ui.js:3002`)~~ | ~~"diverted to create {compound}"~~ | ~~"{n} /s to {compound}" per consumer, plus the ceiling, the equal share each consumer receives, and how much of it is actually taken~~ |
| ~~`calculateAutoCreateRatePerSecond` (`ui.js:3029`)~~ | ~~`min(gross / ratio)` — assumes sole ownership~~ | ~~`min(grantedShare / ratio)` — the real equal-split allocation~~ |
| ~~Compound tooltip auto-create line (`ui.js:2930`)~~ | ~~smoothed observed rate~~ | ~~keep the smoothed rate, and add *why* it is what it is when the compound is throttled by an ingredient's share, **naming the ingredient**~~ |
| ~~Quantity colour (`game.js:10225-10241`)~~ | ~~autosell suppresses the storage-full green~~ | ~~remove the suppression: a store under allocation **can** legitimately fill, and its storage-increase claim must be offered when it does~~ |
| ~~Sell row description (`getResourceSalePreview`, `constantsAndGlobalVars.js:3127`)~~ | ~~"sell N for $X"~~ | ~~replaced by the allocation line's own live figures once level 1 is owned~~ |
| ~~Ascendency perk row~~ | ~~two perks, one of them a tech's silent partner~~ | ~~one **Nano Brokers** row stating both levels and what each grants, with the next level's cost and effect visible before purchase~~ |
| ~~Technology tree~~ | ~~a Nano Brokers tech row at 19000 RP~~ | ~~removed; check the `path: 4` column still reads sensibly with the leaf gone~~ |
| ~~Per-compound "i" tooltip~~ | ~~*(does not exist)*~~ | ~~localised note that automated creation draws from the compound share set on each ingredient's resource pane, and that the share is split equally between the compounds using it~~ |
| ~~Cash-per-second readout~~ | ~~*(does not exist)*~~ | ~~total autosell income across all resources and compounds, so the player can see what the setting is buying them~~ |
| ~~Localisation~~ | ~~—~~ | ~~every new label, section name, perk string and tooltip added to `localization.json` for all supported languages, with `validateLocalization.cjs` kept clean, and the four retired `nanoBrokers` tech keys removed~~ |

---

~~### Change — implementation sequence~~

1. ~~**Widget spike (do first).** Build the allocation line as a standalone control inside~~
   ~~`createOptionRow` on one resource, in both its two-section and three-section forms, and confirm it~~
   ~~works in all five themes and at the narrowest supported width. This decides slider-vs-dropdown for~~
   ~~the rest of the item.~~
2. ~~**Unlock rework.** Add the `nanoBrokers` perk; remove the `nanoBrokers` tech and the~~
   ~~`compoundAutomation` perk with all references listed above; point the `compoundMachining` grant at~~
   ~~`boughtYet >= 2` and make it apply on purchase as well as at run start; write the save migration~~
   ~~and its tests. **Do this before the engine** — every later gate reads `boughtYet`.~~
3. ~~**Data model.** Add `cashShare`, `compoundShare` and `allocationEnabled` per resource, and~~
   ~~`cashShare` / `allocationEnabled` per compound, to `resourceDataObject.js`; bump `version` from~~
   ~~`0.98`. Defaults `cashShare: 0`, `compoundShare: 100`, `allocationEnabled: false` — a save loading~~
   ~~into the new build behaves exactly as it did, with automation off.~~
4. ~~**Allocation engine.** A single per-tick reconciliation pass: fuel off the top, then shares, then~~
   ~~the equal `n`-way split, then the per-compound `min` and the return of unused grants. Replace the~~
   ~~`> 100` autosell blocks at `game.js:3328` and `game.js:3548` with it, and delete the force-disable~~
   ~~at `game.js:3400-3404`.~~
5. ~~**Rewire auto-create** to consume its granted share instead of calling~~
   ~~`calculateCreatableCompoundAmount(..., { buffer: 0 })` against raw stock. Leave the manual Create~~
   ~~path (`buffer: 100`) alone.~~
6. ~~**UI.** The allocation line on all eight resource panes and six compound panes; the row swap at~~
   ~~level 1; the state B / state C rule; the perk row copy; the per-compound "i" tooltip; all~~
   ~~localisation strings.~~
7. ~~**Displays.** Everything in the table above.~~
8. ~~**Rebirth persistence.** Add the new fields to `REBIRTH_PERSISTED_AUTOMATION` with `ownedBy` the~~
   ~~`nanoBrokers` perk level, so a returning player's tuned splits survive — and take~~
   ~~`compounds.<c>.autoCreate` along with them, since that entry's own comment says it was left out~~
   ~~only for scope.~~

~~**Relationship to P8.** P8's unified `resourceTick` publishes `producedThisTick` / `consumedThisTick`,~~
~~which is exactly the input this engine wants, and its single clamped write is what makes "the store~~
~~legitimately fills under allocation" true rather than approximately true. **P9 does not require P8 and~~
~~is being built first.** The allocation pass computes gross production itself by summing the tier~~
~~contributions (the same sum `calculateGrossAutoBuyerGenerationPerInterval`, `game.js:3557`, already~~
~~produces) and becomes one of the subsystems P8 later absorbs.~~

~~**Explicitly out of scope.** Market bias and commission on autosold goods (autosell keeps paying flat~~
~~`saleValue`, as today); demand-proportional or priority-ordered compound sharing; redistributing a~~
~~compound's unused share to other compounds; refunding the research points or AP spent on the retired~~
~~unlocks; and any change to the Sell All buttons or to pre-perk behaviour.~~

~~**Effort:** ~35-50 h. Unlock rework and migration ~6 h; engine ~10 h; the fourteen panes' UI ~10 h;~~
~~the display table ~10-15 h; localisation ~3 h; tests ~8 h. The displays, not the arithmetic, are the~~
~~bulk — as the table shows.~~
~~**Risk:** High. It changes the economy's core loop, it touches every resource and compound pane, it~~
~~adds saved settings, and it migrates two unlocks. Mitigations: the toggle-off bypass is a true no-op~~
~~path; defaults keep every existing save behaving as before; the engine is one function with a pure,~~
~~directly testable core; and the migration is covered by its own spec against a real pre-P9 save.~~

---

~~### Integration tests~~

~~All specs play the game through its own controls and debug tooling, staging state directly only to~~
~~set preconditions and to read state back for assertions.~~

~~**`tests/e2e/autosell/allocation.spec.js`** — the core model, on iron.~~

1. ~~*The split holds.* Stage iron production, buy Nano Brokers to level 2, set the line to 10% $ / 0%~~
   ~~compounds by dragging the handles, run 10 s of frames. Assert stored iron grew by ≈90% of~~
   ~~production and cash by ≈10% × `saleValue`, both within tolerance for frame jitter.~~
2. ~~*Stock is never drained.* Same run, sampling iron every 500 ms: **monotonic non-decreasing**. This~~
   ~~is the regression test for the whole complaint, and it fails hard against today's build.~~
3. ~~*Cash keeps flowing at the cap.* Fill iron to `storageCapacity`, then run 10 s. Assert quantity~~
   ~~stays pinned at the cap and cash still rises at the 10% rate.~~
4. ~~*Fuel comes off the top.* With power plant 1 burning hydrogen, set hydrogen to 90% $ and run.~~
   ~~Assert the grid stays up, hydrogen's burn is unaffected, and the pane's stated allocatable figure~~
   ~~equals gross − burn.~~
5. ~~*Off is a true bypass.* Toggle the line off mid-run. Assert cash stops accruing from iron, the~~
   ~~compound ceiling stops applying, and the accumulation rate returns to the no-automation rate.~~
6. ~~*Settings survive a rebirth.* Set a distinctive split, rebirth, assert the handles come back where~~
   ~~they were **and that the behaviour matches** — a reward is verified by its effect, not its flag.~~

~~**`tests/e2e/autosell/nano-brokers-perk.spec.js`** — the unlock rework.~~

7. ~~*The tech is gone.* Assert no Nano Brokers row exists anywhere in the technology tree, that no tech~~
   ~~is left with a dangling prereq, and that the `path: 4` column renders without a gap.~~
8. ~~*State A.* With `boughtYet === 0`, assert every resource and compound pane shows the manual sell~~
   ~~row and no allocation line — this is today's early game, unchanged.~~
9. ~~*Level 1 buys autosell and nothing else.* Buy once. Assert every pane gains the one-handle line and~~
   ~~loses its manual sell controls, **and** that the auto-create toggle and the compound auto-buyer tier~~
   ~~rows are still unavailable.~~
10. ~~*Level 2 buys compound automation.* Buy again. Assert the compound auto-buyer rows and the~~
    ~~auto-create toggle become available, and that iron's line gains its third section and second~~
    ~~handle.~~
11. ~~*Level 2 applies immediately, without a reload or a rebirth.* The direct regression test for the~~
    ~~run-start-only grant at `game.js:16015`.~~
12. ~~*Terminal states.* Assert helium's line stays two-section at level 2, and that no compound pane~~
    ~~ever renders a third band.~~
13. ~~*Cost ladder.* Assert level 1 costs 15 AP, level 2 costs 30 AP, that a player with insufficient AP~~
    ~~cannot buy, and that the perk cannot be bought a third time.~~
14. ~~*Perk copy.* Assert the row states what each level grants and what the next level costs, in a~~
    ~~non-English language as well as English, so the strings are proven localised.~~

~~**`tests/e2e/autosell/unlock-migration.spec.js`** — the save migration.~~

15. ~~*A save that researched the old tech* loads with `boughtYet >= 1`, gets the one-handle line, spends~~
    ~~no AP, and has `'nanoBrokers'` stripped from `techUnlockedArray`.~~
16. ~~*A save that owned Compound Automation* loads with `boughtYet === 2` — never 3 — keeps its~~
    ~~compound auto-buyer rows and auto-create, and spends no AP.~~
17. ~~*A save with neither* loads at `boughtYet === 0` in state A, behaving exactly as before.~~
18. ~~*A save with a stale `autoSell: true`* does not reproduce the old drain-to-100 behaviour; the~~
    ~~resource accumulates.~~

~~**`tests/e2e/autosell/compound-allocation.spec.js`** — sharing.~~

19. ~~*Equal split.* Auto-create steel and titanium, both drawing iron, both demanding more than iron's~~
    ~~compound share. Assert each receives exactly half of the allocation, sampled per tick. **Today one~~
    ~~of the two creates nothing** — that is the baseline this test records.~~
20. ~~*A third consumer re-divides.* Switch on a third compound drawing the same resource and assert the~~
    ~~shares become thirds, immediately and without a reload.~~
21. ~~*An unused share falls to storage, not to another compound.* Give steel far more than it needs.~~
    ~~Assert titanium's rate is **unchanged** by steel's surplus and that the surplus lands in iron~~
    ~~storage — the defining property of the equal-split choice.~~
22. ~~*The ceiling is a ceiling.* Set iron's compound share to 30% against demand far above it. Assert~~
    ~~the total compound draw never exceeds 30% of allocatable, sampled per tick.~~
23. ~~*Nothing to spend it on.* Set 50% to compounds with every consumer switched off. Assert storage~~
    ~~receives the full 50% and cash receives nothing beyond `cashShare`.~~
24. ~~*Multi-ingredient reconciliation.* Starve titanium's neon while leaving iron and sodium generous.~~
    ~~Assert titanium throttles to the neon bound and that the iron and sodium it could not use are~~
    ~~**returned** — visible as those two stores continuing to grow.~~
25. ~~*No timer-order dependence.* Run the same shared-ingredient scenario across repeated loads and~~
    ~~assert the outcome is stable, not decided by which compound's timer fired first.~~
26. ~~*Auto-create no longer force-disables anything.* Switch on diesel auto-create, then set hydrogen's~~
    ~~cash share. Assert it is still set several seconds later — the direct regression test for~~
    ~~`game.js:3400-3404`.~~

~~**`tests/e2e/autosell/allocation-displays.spec.js`** — the displays, which are most of the item.~~

27. ~~*The rate readout tells the truth.* With 10% $ / 40% compounds live, assert the pane's `/s` figure~~
    ~~equals the measured accumulation rate, not the gross.~~
28. ~~*The tooltip accounts for 100%.* Assert the breakdown's four figures (fuel, $, compounds, storage)~~
    ~~sum to gross within tolerance, and that each named compound consumer appears with its own figure~~
    ~~and its equal share.~~
29. ~~*Storage-full colour is restored.* Fill an allocated resource with `storageCapacity > 100` and~~
    ~~assert `green-ready-text` appears and the storage-increase claim is offered — the direct~~
    ~~regression test for the suppression at `game.js:10225-10241`.~~
30. ~~*Throttle attribution.* With titanium throttled on neon, assert the compound tooltip names neon.~~
31. ~~*The per-compound "i" tooltip* explains the equal split and points at the ingredient panes, in~~
    ~~every supported language.~~
32. ~~*Localisation.* Every new string resolves in each supported language, no raw keys render, and the~~
    ~~four retired `nanoBrokers` tech keys are gone from `localization.json` with~~
    ~~`validateLocalization.cjs` clean.~~

~~**As built — the follow-up pass.** Four changes came out of playing the finished feature, all of~~
~~them narrowing it rather than adding to it:~~

- ~~**The autosell toggle is gone.** It was a second control that could contradict the bar: a slider~~
  ~~set to 40% cash while the switch beside it said "off" is two answers to one question. Buying Nano~~
  ~~Brokers once is now the only gate, the slider is always live after that, and dragging the cash~~
  ~~handle back to the storage end is how a material is left alone. `getAllocationShares()` no longer~~
  ~~reads `allocationEnabled`, `setAutoSellToggleState()` no longer renders or reads a switch, the~~
  ~~toggle is removed from all fourteen sell-row templates, and the dead `autoSellerChecks()` frame~~
  ~~path went with it. The `allocationEnabled` field stays in `resourceData` so old saves round-trip,~~
  ~~but nothing reads it any more.~~
- ~~**The readout is three destinations, and all three move.** It used to lead with the *allocatable*~~
  ~~total, which does not change when a handle does — a fixed number sitting beside a slider the~~
  ~~player was dragging, which read as a band that never moved. The first figure is now **storage**~~
  ~~(`toStorage`), and the compound figure is what the recipes are actually **drawing**~~
  ~~(`toCompounds`) rather than the ceiling they were offered. The total is quoted once, in the~~
  ~~breakdown tooltip on the production figure in the left pane. This also fixes the honesty problem~~
  ~~the ceiling created: a 40% band with auto-create off now reads zero in magenta and shows up in~~
  ~~green, which is genuinely where the material is going.~~
- ~~**The bar explains itself.** A two-handle partition is not self-evident, so hovering the slider~~
  ~~now brings up a tooltip that names the three figures in their own colours, says what each handle~~
  ~~does, and states the fall-back rules — a share set but not used goes to storage; a recipe held~~
  ~~back by another ingredient takes only what it can use; a full store loses what it cannot hold. It~~
  ~~is built from the live breakdown, so the player's own percentages and rates are written into the~~
  ~~sentences, and it grows with the ladder: at level 1 it says nothing about compounds.~~
- ~~**The fuel deduction was a hundredth of the real burn.** `usedForFuelPerSec` is misnamed: it~~
  ~~accumulates a power building's `fuel` tuple, whose second element is a per-*tick* figure~~
  ~~(`['carbon', 0.03, 'resources']` is 3 carbon a second at a hundred ticks to the second).~~
  ~~`getAllocationBreakdown` subtracted it straight from a per-second gross, so "allocatable" was the~~
  ~~gross in all but name — the tooltip said "after anything burned as fuel" and quoted a figure that~~
  ~~was not. It was also only maintained on the *purchase* path, so a save or a staged scenario that~~
  ~~set a plant's quantity directly had it at zero while the tick burned fuel regardless. The~~
  ~~breakdown now computes the burn the way the tick does — `fuel[1] x quantity x timerRatio`, gated~~
  ~~on the same `getBuildingTypeOnOff` — so the figure the tooltip quotes and the figure the left~~
  ~~pane's rate is net of are the same number. Carbon with a basic power plant is the case that shows~~
  ~~it, and is what the two new specs use.~~
- ~~**The per-second suffix in this feature is localised.** The readout, the slider tooltip and the~~
  ~~allocation lines in the production tooltip take it from `textPerSecond` rather than a hardcoded~~
  ~~`/ s`. The tooltip's opening sentence also lost its own "each second", which said the same thing~~
  ~~twice next to a figure that already carries the unit.~~
- ~~**The engine already did what the tooltip claims**, which was checked rather than assumed:~~
  ~~`runCompoundAutoCreation` consumes only `perUnitDraw × ratio` of each ingredient, so a compound~~
  ~~bottlenecked elsewhere leaves the rest in the store, and with auto-create off the budget is never~~
  ~~spent at all. The only thing that was wrong was the display, and that is what changed.~~

~~Thirteen new localisation keys (`tooltipSlider*`), in all six languages. New specs:~~
~~`allocation-row.spec.js` 11–15 (no toggle survives anywhere; the storage figure tracks the cash~~
~~handle and agrees with the engine; the tooltip explains itself with live values; it stays quiet~~
~~about compounds at level 1; and it quotes the fuel-net total on carbon with a basic power plant),~~
~~plus `allocation-displays.spec.js` 4c on the per-second fuel arithmetic. Existing specs that pinned~~
~~the old shapes were updated rather than worked around — the "switching the line off is a true~~
~~bypass" spec now drives the handle to zero, and the persistence spec pins the shares rather than the~~
~~retired flag. One existing spec was found to be testing nothing: "fuel comes off the top" staged~~
~~**hydrogen**, which no power building burns, so it passed without ever exercising the path it names.~~
~~It now stages carbon and asserts the burn is non-zero before drawing any conclusion from it.~~

~~**As built — the second follow-up pass.** Five more changes from playing the finished feature. Like~~
~~the pass above, every one of them narrows the feature rather than adding to it:~~

- ~~**Compounds are never autosold, and the guard is in the engine rather than the data.** The sketch~~
  ~~put every compound pane permanently in state B — a one-handle cash-versus-storage line. That was~~
  ~~dropped: a compound is an end-of-the-line product, made to be spent, and the pane keeps its~~
  ~~quantity dropdown and **Sell** button for the whole game. `getAllocationShares()` now returns~~
  ~~zeroes for any compound outright instead of reading its stored `cashShare`, and that is~~
  ~~load-bearing rather than tidy: a save written while the compound panes still carried a slider~~
  ~~holds a non-zero share, is *already* at schema 0.99, and so meets no migration rung. Trusting the~~
  ~~field would have left that compound quietly selling itself for the life of the save, with no~~
  ~~slider to turn it off and nothing on screen to say it was happening.~~
- ~~**The compound production tooltip lost the whole selling half.** No "Sold for cash", and no~~
  ~~game-wide **Autosell income** — that total is earned entirely by the resource sliders, and~~
  ~~printing it under a compound's own production read as though the compound were contributing to~~
  ~~it. **Allocatable** went too: it is the pool the handles divide, and a compound has no handles.~~
- ~~**A compound's Accumulating figure was always zero, and is now the headline figure itself.** The~~
  ~~breakdown's gross counts *auto-buyer* output only, so a compound made by auto-creation or falling~~
  ~~as rain had a gross of nothing and reported nothing accumulating while its store visibly filled.~~
  ~~Nothing is diverted from a compound, so its whole net rate is what accumulates; quoting the~~
  ~~hovered figure back makes the two agree by construction rather than by coincidence.~~
- ~~**The generation lines were printing localisation keys.** `nameUpgrade` holds a *key*, and every~~
  ~~pane that draws an auto-buyer row runs it through `localize` first — the tooltip did not, so it~~
  ~~read `autoBuyerNameDieselBackyard`. This was never compounds-only: the same builder feeds the~~
  ~~resource tooltips, which were leaking their keys the same way. A key with no catalogue entry now~~
  ~~falls back to the generic tier label rather than leaking by a second route.~~
- ~~**The compound auto-buyer rows are gated on rung 3 alone.** The visibility sweep checked the rung~~
  ~~first but then *fell through* to the per-tier progression rule, which is the resource rule:~~
  ~~`currentTierLevel` is saved per material and survives whatever put it there — a save predating~~
  ~~the ladder, or the debug menu's grant-all — so any compound carrying a level above zero had its~~
  ~~whole auto-buyer ladder on display at Nano Brokers 0, 1 or 2. Diesel's tier 1 remains the one~~
  ~~deliberate exception, because the early game needs it to fuel the first power plants long before~~
  ~~any perk exists.~~
- ~~**The bar itself is slimmer.** 30px to 20px, with the segments and handles rounded to a pill~~
  ~~rather than to the theme's corner radius — a bar this short needs a radius of exactly half its~~
  ~~height to read as a pill in every theme instead of a rectangle in the sharp ones. The slider's~~
  ~~hover tooltip also sits 8px lower, clear of the pointer.~~

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
