# E2E Integration Upgrade — playing the game, not calling its functions

Status of the work to convert specs from *function-level* tests into *integration*
tests that drive the game the way a player does.

## Why this was needed

A spec that reaches into `withMods` and calls an exported function proves the
function works. It proves nothing about the wiring between the UI, the frame loop
and the data object — and that wiring is where nearly every defect this suite has
found actually lives.

The battle area was the clearest example. It had thirteen passing specs and not
one of them fought a battle. They set `setBattleOngoing(true)` and read it back;
they set `setBattleResolved(true, 'player')` and asserted the tuple shape. All
thirteen would have passed with the battle engine deleted.

Rewriting one of them to fight an actual battle found a live crash within an hour.

## Legend

| | Meaning |
|:--:|---|
| 🟢 | Upgraded and green |
| 🟡 | Upgraded, some specs still failing |
| 🟠 | Upgraded, failing only on live defects that are open in known-issues.md |
| ⚪ | Not started |

---

## 🟢 Battle — `battle-live.spec.js`, 4 specs, all passing

**What is different.** The new file fights a real engagement. It opens the
Colonise pane, rolls a sentient armed destination, calls the same dispatcher every
Colonise button calls, clicks through the real war-entry modal, presses **Attack**,
and then lets the frame loop run the battle to its conclusion — typically 20–30
seconds of real combat.

The chain exercised end to end:

```
updateDiplomacySituation('conquest')  the dispatcher behind the Colonise buttons
  -> setEnemyFleetPower()             enemy power from air/land/sea counts
  -> colonisePrepareWarUI()           the real war-entry modal
  -> setWarUI(true)                   war mode on, diplomacy closed
  -> createBattleCanvas()/drawFleets()  both sides built, setBattleOngoing(true)
  -> #battleButton click              setBattleTriggeredByPlayer(true)
  -> gameLoop: moveBattleUnits() + assignGoalToUnits()   fought frame by frame
  -> checkBattleOutcome()/initiateBattleFadeOut()        resolved and settled
```

**Handling the randomness.** Enemy fleet counts are randomised per star by
design, so who wins is not knowable in advance and is never asserted. Every
assertion holds for either outcome:

- the battle reaches a *decision*, and the winner is one of exactly two values;
- the decision agrees with the field — the loser's units are all disabled, which
  is what makes the result real rather than a flag someone set;
- consequences match the outcome: a win flags the AP award, a loss does not and
  costs fleet power;
- enemy fleet counts never *grow* during a battle, and are zeroed on a win;
- autosave is suppressed while the battle is genuinely in progress, and resumes.

One battle per spec is enough because the verification is written against the
rules rather than against particular numbers.

**Three things this found that the old specs could not.**

1. **A live crash (fixed).** After a battle resolves, redrawing the Colonise pane
   threw `Cannot read properties of undefined (reading 'civilizationLevel')` —
   four unhandled promise rejections per battle. `drawTab5Content` dereferenced
   the destination-star record with no null check, and because it is `async` and
   called unawaited from the pane click handler, the throw surfaced as an
   unhandled rejection and left the pane half-drawn. Now guarded by an early
   return; see known-issues.md.
2. **The pane gate.** `coloniseChecks()` only runs when
   `getCurrentOptionPane() === 'colonise'`. With any other pane open the battle
   is *built but never fought* — both fleets sit at their starting coordinates
   indefinitely. No function-level test could have surfaced this.
3. **A wrong assumption about settling.** A victory does **not** append to
   `settledStars`; the only two callers of `setSettledStars` are inside
   `rebirth()`, so the settled list grows when the run moves, not when the battle
   is won.

---

## 🟢 Black Hole — `black-hole-live.spec.js`, 7 specs, all passing

**What is different.** The old specs asserted that `getTimeWarpMultiplier()`
returned a bigger number. That proves a field was written; it does not prove a
single extra tick of production happened.

The new file **measures throughput**: it stages a steadily-producing resource
with storage headroom, then compares quantity gained per second of wall-clock
time, warped versus unwarped. That is the thing a player would actually notice,
and a change that raised the multiplier without raising throughput now fails.

Passing:

- production runs measurably faster while warped (>3× baseline) and falls back
  once the warp expires;
- a higher multiplier warps harder than a lower one — compared by measurement,
  not by reading the field;
- Research is bought through the real `#blackHoleResearchButton`, unlocks the
  feature, and the price is actually deducted;
- the Power and Duration upgrades each raise their own value *and* their own
  price, and buying one does not move the other;
- an unaffordable upgrade is refused without going into debt;
- warping raises no console errors.

**Two useful discoveries about the UI**, both of which read as "the feature is
broken" until understood:

- `createButton` turns the `id_blackHoleButton2` entry in its `classNames` list
  into the element's **id**. Selecting on `button.id_blackHoleButton2` matches
  nothing.
- Reopening the pane that is already current is a no-op, so the upgrade section
  is not rebuilt after Research completes. The pane has to be bounced off another
  one to force a genuine redraw.

### Two things resolved since the first draft

- **The charge gate is by design.** The black hole is deliberately unusable until
  its 300-second charge completes; the only route to permanent availability is the
  always-on upgrade. The spec now advances *game time* with the debug warp
  (5s of wall clock at ×200 is ~1000s of game time) and waits for the real timer
  to finish, rather than poking the timer's internals.
- **The Recharge button was never receiving the click.** `#blackHoleButton4` is
  visible, enabled and carries `green-ready-text`, but a real click at its
  coordinates never reaches its handler — something in the panel sits over it, and
  `force: true` skips the actionability wait rather than hit-testing. A counter
  installed on the element recorded zero invocations, which is what distinguished
  "the click is not landing" from "the handler is early-returning". All black hole
  buttons are now dispatched directly at the element. Buttons 2 and 3 sit clear and
  worked either way, which is why the problem looked like a Recharge-specific bug.

The Recharge spec accounts for both legitimate branches: the multiplier falls by
0.88, or the purchase is refused without charging once the charge time is already
at `MINIMUM_BLACK_HOLE_CHARGE_TIME`.

---

## 🟢 Energy — `energy-live.spec.js`, 10 specs, all passing

**What is different.** Plants are bought with the real
`button.building-purchase-button`, panes are opened by clicking their side-menu
rows, and the grid is driven through `#activateGridButton`, the per-plant toggle
buttons and `toggleAllPower()`. Where the spec cares whether the grid *does*
anything, it measures resource throughput per real second across the transition
rather than reading `getPowerOnOff()`.

### The rule that made this area hard

**Tier 1 autobuyers do not need power. Tiers 2, 3 and 4 do — for every resource.**

`gainResource` is shaped as:

```js
if (getPowerOnOff()) {
    …production for the tier being processed…
} else if (tier === 1) {
    …production from tier 1's own rate and quantity…
}
```

Every power measurement in this file was staged on tier 1 to begin with, so
production continued at full rate with the grid down. That is correct behaviour,
and it looked exactly like a broken power gate. The specs now stage **tier 2**
when they mean to prove the grid stops production, and there is a dedicated spec
pinning both halves of the rule: with the grid down a tier 1 autobuyer keeps
producing and a tier 2 autobuyer yields exactly zero.

### Affordability is not a bug

An earlier draft filed the missing affordability guard as a defect. It is the
intended design — see known-issues #17, now a design note precisely so it is not
re-reported. The spec asserts the *gate* (the frame loop applying
`red-disabled-text`, whose CSS is `pointer-events: none`) rather than a `disabled`
attribute, and deliberately does **not** dispatch a synthetic click to "prove" a
refusal, because dispatching bypasses pointer-events and the purchase would go
through by design.

### Three traps worth knowing

- `prepareRunForStarshipLaunch()` leaves the run with infinite power and fuelled
  plants, and the frame loop re-derives the grid from those every tick — so "the
  grid is down" cannot be staged after that chain. The grid specs boot plain.
- `toggleBuildingTypeOnOff` is exported from **game.js**, not from
  constantsAndGlobalVars. Written as `m.cg.toggleBuildingTypeOnOff?.(...)` it
  silently does nothing and the plant is never running. Prefer a plain call over
  `?.` on module functions: a wrong module should throw, not no-op.
- A power plant needs **fuel** to stay running. Staging a plant with a token
  amount of carbon reads as "the toggle does not work".

---

## 🟢 Autobuyers — `autobuyers.spec.js`, 19 specs, all passing

**What is different.** The eleven specs this replaced asserted that tier data had
the right shape. None of them ever watched a resource accrue, so all eleven would
have passed with the production loop deleted. Every rule in the new file is pinned
by **measuring throughput** instead.

- **The power rule across all four tiers.** With the grid down tier 1 produces and
  tiers 2, 3 and 4 yield exactly zero; with it up all four produce. Verified for
  every one of the eight resources, not a sample of one.
- **Compound gating.** `compoundAutomation` is unowned on a fresh run, and buying
  it unlocks `compoundMachining`, which is the tech the rows actually check.
- **The diesel exception.** Tier 1 ships `active`, priced and `energyUse: 0`, and
  is proven to *produce* with the grid down while diesel tier 2 yields zero. A
  sweep then shows the shape generalises: tier 1 of every compound is energy-free,
  every higher tier is not.
- **B-type star effects.** The boost table matches `{0.02, 0.08, 0.25, 0.8}`,
  climbs with tier, and is **additive rather than multiplicative** — a distinction
  that matters, because a multiplier would scale with the tier's own rate and make
  late-game B-type runs far better than designed.

**One trap worth recording.** The star-type spec originally branched on
`m.game.getStarTypeByName`, which is not on the module surface the harness binds.
It returned `undefined` and sent the test silently down the wrong branch. It now
derives the branch from the boost values themselves, so it cannot be fooled that
way whichever system the run starts in.

---

## 🟢 Resources — `resources.spec.js`, 21 specs, all passing

**What is different.** Everything a player does to a resource happens on one pane,
and the old specs pressed none of it — they set autobuyer fields directly and read
them back. The new file drives all six controls for real: Sell, Fuse, the quantity
dropdown, Increase Storage, the four autobuyer tier buttons, and Sell All.

Two pieces of wiring make this worth doing through the DOM, and neither is
reachable from a function-level test:

1. **The sale/fusion preview is only recomputed for the pane that is open** —
   `updateAllSalePricePreviews()` runs `if (resource === currentScreen)` — and
   both `sellResource()` and `fuseResource()` then *parse that string* to decide
   how much to move. The quantity dropdown is not a display detail; it is the
   input to both transactions. That is why the selector is covered against both.
2. **Autobuyer tier rows are shown and hidden every frame** from
   `getAutoBuyerTierLevel()`, which techs raise: `quantumComputing` to 2,
   `rocketComposites` to 4. A fresh run is asserted to offer tier 1 only, and a
   granted run all four.

Covered end to end:

- storage upgrades charge the cap that was just outgrown, less one, and the
  *second* upgrade costs the *new* cap — which is what proves the price tracks
  capacity rather than a constant;
- production stops dead at the cap and a full store gains nothing further;
- hitting the cap raises the storage-full notification, and its **action button**
  performs the same upgrade as the pane's;
- selling moves exactly the previewed amount, for all eight dropdown options;
- fusing discovers its product at a quarter yield on the first press, converts at
  the full ratio afterwards with Fusion Efficiency III, is clipped by the target's
  storage, and charges the source once when fusing to two targets at a time;
- buying a tier through its own button charges the resource, raises the price and
  measurably starts extraction.

**A randomness trap, and how it is handled.** The rate assertion first pinned
2 hydrogen/second and failed at 4.01. The starting star is randomised and a B-type
adds a flat 0.02 to every tier 1 rate, doubling it. The expectation is now derived
from `getBTypeAutoBuyerBoostForTier(1)` rather than hardcoded — the same treatment
the battle specs give randomised fleet counts.

**A live bug found and fixed** — known-issues #18. Researching a fusion tech while
standing on the resource's pane never revealed the Fuse button:
`setStateOfFuseResourceButton` only cleared `invisible` when the fusion *product*
was already discovered, and the only thing that discovers a product is fusing to
it, so the branch could never fire before a player's first fusion. The button
became visible solely because reopening the pane rebuilt it. The spec asserted
what should happen, was brought to Leigh red, and the source was fixed.

---

## 🟢 Settings — `settings.spec.js`, 20 specs, all passing

**What is different.** Settings is the area where "the control exists" and "the
control works" come apart most easily: every row is one toggle or dropdown wired
to one setter, and a row that renders but is wired to nothing looks completely
normal on screen. Each spec therefore does three things — the row and its input
are on the pane, driving the real control reaches the game's setter, and the
setting has its **downstream effect**.

The third part is what makes these more than accessor tests:

- the mouse trail is switched off and the pointer moved, and **no `.mouse-particle`
  elements spawn**; switched back on, they do;
- the custom pointer adds and removes the two body classes and builds or tears
  down the pointer element;
- every theme in the dropdown is selected in turn and each must land on
  `body[data-theme]`, because that attribute is the entire theming mechanism;
- notifications are switched off and a fresh one is then proven **not to appear**;
- the news-ticker toggle adds and removes the real `newsTicker` timer in
  `timerManager`;
- notation is compared as rendered text — `1.0M/1.0M` against `1,000,000/1,000,000`;
- the currency symbol has to reach the live sale preview without a reload;
- every language round-trips, and after each one no `[data-loc]` element is left
  showing its own key or nothing at all;
- turning autosave off must warn the player, because losing autosave silently is
  only noticed after a crash.

**Two traps.** `.toggle-container input[type="checkbox"]` is `display: none`, so
the label is the only thing a player can hit and the only thing a spec should
click. And a control is populated from its accessor when the pane is **drawn**, so
staging a setting under an already-open pane leaves the checkbox showing the old
value — the pane has to be reopened, or the flip goes the wrong way.

---

## 🟢 Antimatter — `antimatter.spec.js`, 26 specs, all passing

**What is different.** The previous file proved the delta timer's arithmetic and
that a flag could be written and read back. Not one spec sent a rocket to an
asteroid, so nothing in it touched the calculation that actually produces
antimatter. The new file drives the journey — destination chosen in the real
dropdown, **Travel** pressed, the travel timer run to arrival — and then asserts
the extraction maths against measured output.

Two properties make that exact rather than approximate, and both are used heavily:

1. **Conservation.** Every unit mined leaves the asteroid, so *antimatter gained
   equals asteroid quantity lost* whenever the megastructure contribution is zero.
   That identity holds however many ticks ran, which makes it immune to the frame
   loop ticking in the background — the thing that forces tolerances everywhere
   else.
2. **`advanceTimers(ms)` drives the real delta manager**, so 100,000ms of game
   time is 10,000 ticks on demand. At an ease of 1 that is a predicted 40
   antimatter, and the spec asserts the figure rather than the direction.

Every multiplier in the chain is measured as a ratio of two identical runs:
Enhanced Mining at 1.5×, the antimatter boost at 2×, the F-type star bonus, a
broken-down miner at 0× for that rocket and no other, and two rockets summing to
one total.

**The megastructure contribution** is covered on its own terms. `setMegaStructureAntimatterAmount`
**accumulates** rather than replaces, so four Disconnect stages are worth 0.6
between them and not 0.15 with three thrown away. The contribution is proven to
produce antimatter with no asteroid being mined at all, at `amount / 100` per
tick, and to *add to* mining output rather than change the mining rate — checked
by confirming the rock is still being worked at the same pace alongside it.

**Two things the failures taught.**

- Emptying an asteroid also earns the "Mine All Antimatter from an Asteroid"
  achievement, which pays a flat **150** on top. The first draft asserted only the
  rock's own contents and was 150 short. The spec now asserts the two separately,
  which is a better test than the one originally written.
- The permanent antimatter unlock is *not* re-derived mid-run. The branch in
  `updateAntimatterAndDiagram` that would do it sits behind
  `updateAntimatterDelta`'s early return on `!getAntimatterUnlocked()`, so it can
  never fire. It is redundant rather than broken: the real contract lives in
  `resetAllVariablesOnRebirth`, which keeps the unlock when the permanent grant is
  held. The spec asserts that contract — both the keeping and the losing.

---

## 🟢 Compounds & Crafting — `compounds.spec.js`, 31 specs, all passing

**What is different.** The old specs checked the data shape and called
`sellCompound()` directly. Nothing ever pressed **Create**, which is the only
thing the tab is for.

Crafting has to be tested through the DOM because **the rendered text is the
contract**:

```
dropdown option -> setCreateCompoundPreview()   how many, and from what
                -> setCompoundCreatePreview()   "5 Diesel (130 Hydrogen, 60 Carbon)"
                -> frame loop renders it into #createDieselDescription
                -> getConstituentComponents()   parses that string back out
                -> createCompound()             moves the quantities
```

The amount crafted and the resources spent are recovered from a *localized
sentence*. A spec that calls `createCompound()` proves almost nothing, and
crafting in German is a genuinely different test from crafting in English.

Covered end to end: every fixed quantity charges its exact ratio; `max` is limited
by the scarcest ingredient; `fill to capacity` stops at the cap; an over-large
craft is clamped and the waste announced; too few ingredients moves nothing;
storage upgrades double the cap for all five simple compounds; **the water
reservoir bills a second material** — 30% of the cap in concrete, and re-quotes
against the *new* cap for the next one; selling matches the preview across all
eight dropdown options. Autobuyers are deliberately out of scope; they belong to
the autobuyers area.

### Two live bugs, both found and fixed

1. **Crafting outside English was free** (known-issues #19). The parsed ingredient
   names are display names; the data object is keyed by internal names. Outside
   English the lookup missed, `type` fell through to `'error'`, the deduction
   wrote nowhere — and the compound had already been credited. Fixed with a new
   `reverseLocalizeMaterialName` covering **both** `resource*` and `compound*`
   keys (the existing reverse index was compound-only, and recipe ingredients are
   almost always resources), plus a guard so an unresolvable ingredient abandons
   the craft instead of paying out.
2. **The create dropdown never changed language** (known-issues #20). Its recipe
   table caches localized strings for the lifetime of the run and was only cleared
   on rebirth. Fixed by invalidating it in `relocalizeAll()`.

### Two traps

- **Grant All Techs does not unlock auto-create.** `compoundMachining` is not a
  researchable tech; it comes only from the `compoundAutomation` ascendency perk.
  The spec buys it through `purchaseBuff`, the function the ascendency buttons
  call, and asserts that a fully teched run *still* has the toggle hidden — which
  is the part that makes the gate meaningful.
- **Something falls from the sky, and it is not always water.** The first pass at
  this area treated water as the one compound that drifts, and bounded its
  assertions instead of pinning them. That was wrong twice over, and the second
  pass replaced it — see the section below.

---

## 🟢 Compounds — second pass: precipitation

**What was wrong.** The first pass allowed water, and only water, to drift: a
craft asserted `made >= 5` instead of `made === 5` for it, a reservoir upgrade
accepted a spend "between 95 and 99", and Sell All excused a non-zero water
balance. The comment explaining this said rainfall collects into the reservoir
continuously.

Rainfall does collect — but into whichever compound *this star system* rains, and
only while it is actually raining. `calculatePrecipitationType()` draws the type
once per star system from a weighted table over the compounds: water at 40% is
merely the likeliest, with diesel 30%, glass 19%, steel 7% and titanium 4% all
real outcomes, and concrete in the table at weight 0 so it can never be drawn.
`addPrecipitationResource()` then adds to it every frame, but only while
`getCurrentStarSystemWeatherEfficiency()[2] === 'rain'`, and only at
`getCurrentPrecipitationRate()` — which the weather countdown re-rolls to 1-4 per
second when a shower starts and pins to 0 the rest of the time.

So the old exception was both too generous and too strict. On a system that rains
diesel it forgave drift in a compound that was perfectly still, while holding
diesel — the compound the numbers actually depend on — to a figure it could not
meet. It also passed for the wrong reason most of the time: a spec only rains at
all one weather roll in five.

**What is different.** The spec stops guessing and turns the rain off.
`clearWeather()` presses the debug menu's own **Sunny** button — the same
`forceClearWeather()` a developer clicks, which zeroes the rate and forces the
weather to sunny — and then reads the state back and throws if it did not take.
`prepareCraftingRun()` calls it for every test, and the loops that walk all six
compounds call it again before each measurement, because weather re-rolls itself
every one to three minutes and a six-compound walk outlives that.

With nothing falling, every assertion in the file is exact again, for every
compound alike: `made === 5` for all six, the reservoir spends exactly 99, the
second reservoir leaves exactly 1, and Sell All empties every unlocked compound
to zero with no exceptions.

**And the rules themselves are now tested**, in a new `Compounds — precipitation`
block of 5 specs that puts the rain back deliberately. `forceRain()` calls
`forceWeatherCycle()` — the game's own re-roll, the one the `endlessSummer` event
calls when it expires — until the roll comes up rain, then waits for the shower to
set a rate. What that block pins:

- the star system's `precipitationType` is one of the compounds in the shipped
  table, its weight is greater than zero, its category is `compounds`, and the
  compound it names has a real pane that opens;
- with the weather clear, no compound gains anything at all;
- while it rains, that compound gains and **no other compound does**;
- clearing the weather stops it dead — an equality, not a comparison, because the
  rate is pinned to zero rather than merely reduced;
- precipitation respects the storage cap and does not overfill it.

**The trap this replaces.** Never hard-code a compound name as "the one that
drifts". Either clear the weather, or read `precipitationType` off the current
star system and reason about that.

---

## 🟢 Demo Build Lockdowns — `demo-build.spec.js`, 19 specs, all passing

**The reason this area could not be tested the easy way.** `setDemoBuild()` is
exported, so the obvious move is to flip it on a running page and look at the UI.
That proves almost nothing. Nearly every lockdown in the game is applied at *draw*
time: `drawTab2Content` and friends read `getDemoBuild()` as they build each
option row and bake `electron-purple-demo-button` into the class list there and
then. Flipping the flag afterwards locks nothing that has already been drawn, and
re-drawing is not something a spec can ask for directly.

Worse, the flag is not even honoured in a browser. `initialiseStaticButtonLabels()`
derives it itself, at DOMContentLoaded, with
`setDemoBuild(isElectron ? window.__DEMO_BUILD__ === true : false)`.

**What is different.** `bootVariant()` boots the game as the packaged Electron app
presents itself: an `addInitScript` spoofs `navigator.userAgent` to look like
Electron, and a route serves a `buildFlags.js` already carrying the flavour, both
before any page script runs. The spec then asserts `getDemoBuild()` itself, so a
spoof that failed to take reports as a broken spoof rather than as a puzzling
"nothing was locked", and drives the real debug menu (through the `Test1981`
backdoor, which a demo build keeps on purpose) to unlock the tabs it needs.

`surveyLockdowns()` then walks every pane that carries a lock and returns one
object, so the demo and full builds are compared whole. A lockdown added to the
game but not to the survey shows up as a difference between the two runs rather
than as silence.

**What it proves the demo actually withholds** — all confirmed passing against the
live game:

| Locked | Left playable |
|---|---|
| all three battery tiers | the basic power plant |
| Solar and Advanced power plants | the science kit and science club |
| the science lab | rocket 1 |
| `orbitalConstruction` | every other tech |
| rockets 2, 3 and 4 | autobuyer tiers 1 and 2 |
| Study Stars on the telescope | Star Map |
| autobuyer tiers 3 and 4 on every resource and compound | |
| autosave dropdown and toggle, save export | |
| the whole Galactic tab, and five interstellar sidebar options | |

**Three things the survey cannot see, tested separately.**

- **The lock is a stylesheet rule, not a disabled attribute.**
  `.electron-purple-demo-button { pointer-events: none }` is the entire
  enforcement — the click handler behind a locked button is still attached and
  would still fire. One spec reads the *computed* `pointer-events` of every locked
  element on screen, because if that rule ever stopped applying, every lockdown in
  the game would become cosmetic at once and nothing else in the file would
  notice.
- **The tooltip explains the lock.** A real `page.mouse.move` over a locked
  button, rather than a synthetic event, because `setupDemoTooltips()` watches
  document mousemove and uses `elementFromPoint` — temporarily restoring
  pointer-events so it can see through the very rule that makes the control inert.
  The text is asserted against `localize('notificationNotAvailableInDemo', ...)`,
  so it is checked in the player's language rather than against an English string.
- **A demo build never contacts the cloud.** The name prompt branches on
  `getDemoBuild()`: a full build calls `loadGameFromCloud()`, a demo build sets the
  onboarding flag instead. There is no accessor for that flag by the time a spec
  can read it, but the branch is observable from outside — the spec counts
  requests to the save backend during boot and expects none.

**One thing worth knowing for release, not a test failure.** The two pipelines
treat `buildFlags.js` differently. `tools/build-stamp.mjs` rewrites it and forces
`__VARIABLE_DEBUGGER_AND_CHEATS__` to false on every desktop build, and a spec
pins that. `create_build.py` does not — it copies the working tree as it finds
it, and the checked-in default is `true`, which in a browser build lets any player
open the debug menu. That is a procedural hazard rather than a code defect, and it
is written up in [`docs/making-a-build.md`](../../docs/making-a-build.md).

---

## 🟢 Rebirth & Philosophies — the second pass: deduplication and the endgame

The two `-live` files had already been written. This pass finished the job in two
ways.

### The endgame rebirth, and where a spec has to stop

`rebirth-live.spec.js` gained a third scenario: **the run played to the point
where the rip is one button-press from closed, and a rebirth taken instead.**

That boundary is deliberate and it is a design fact, not a limitation of the
harness. Closing the rip hands the page to the end-credits cinematic, and that
cinematic is *designed* to leave its overlay up for ever — the run is over and
only a browser refresh gets the game back. So the last thing any spec can assert
about the endgame is the state immediately before the press. The rebirth specs
are therefore the right place for it, and the shape of the test is: prove the
button is genuinely lit, deliberately do not press it, and rebirth instead.

What it plays, in order:

```
run 1 -> conquest -> Rebirth pane -> run 2         galactic points start accruing
  -> restore the Near Space Scanner Array          its own button, 10 GP
  -> locate the rip                                scanCosmicRipSector, the fn the grid calls
  -> research all five stabilisation techs         their own buttons, one delta timer each
  -> assert Close The Rip is green and clickable   pointer-events: auto, row visible
  -> press Rebirth instead                         run 3
```

The payload is what survives. `resetResourceDataObjectOnRebirthAndAddApAndPermanentBuffsBack`
snapshots the whole `cosmicRip` branch and lays it back over the fresh state, and
`cosmicRipTechUnlockedArray` is never cleared at all — so the spec asserts that
after the rebirth the five techs, the restored array and the located rip are all
still there, and the button is still lit on run 3. That is what makes taking the
rebirth a *deferral* rather than a forfeit, and it is the kind of claim only a
played test can make.

One thing the spec had to learn the hard way: the restore button's real gate is
`!scannerRestored && gp >= 10 && miaplacidusSettled`. Galactic points alone are
not enough — settling the home system is what opens the chapter, which is also
the event that plays the win cinematic and grants the `cosmicRip` tech.

### Removing the duplicates the `-live` files made redundant

With the `-live` files playing the same ground through the UI, the older specs
were asserting the same facts twice — the weaker way. Removed:

| Removed from | Cases | Why |
|---|---|---|
| `rebirth-reset.spec.js` | the whole file, 13 specs | every one of them called `m.game.rebirth()` and re-read a field. `rebirth-live` audits three whole rebirths against a fresh-boot baseline, which is a strictly stronger claim than "smaller than it was" |
| `rebirth.spec.js` | 6 of 10 specs | the completion path, the console cleanliness, the refusal, the consumed destination record, the confirm branch and the perk/philosophy survival are all played through the pane in `rebirth-live` |
| `philosophies.spec.js` | 5 of 20 specs | the four per-path effect specs called `set…AfterRepeatables()` directly; `philosophies-live` buys the upgrade through its button and then measures the effect. The Supremacist vassalization spec was superseded by the live one, which uses the ability toggle as its own control |

What deliberately stayed: the localized refusal notice, the button's transition
from disabled to ready, the cancel branch of the confirmation modal, a rebirth
with the rip already closed, the catalogue's shape, the choice modal and its five
languages, the run-1 gate on the Voidborn AP bonus, the casino route into the
void prize, and the save/load round trip. None of those is reachable from the
`-live` files.

Net: 24 specs removed, 1 added, no coverage lost.

---

## 🟢 Space Telescope — `space-telescope.spec.js`, 10 specs, all passing

A new area. There was no spec file at all before this.

**What is different from what a function-level version would have been.** The
telescope is one building with three jobs, and the interlock between them is not
a property of any handler — `setAsteroidTimerCanContinue`,
`setStarInvestigationTimerCanContinue` and `setPillageVoidTimerCanContinue` are
all re-derived on **every frame** from the same three facts: the grid is up, and
neither of the other two actions is running. A spec that called
`startSearchAsteroidTimer()` and `startInvestigateStarTimer()` in turn would find
both "working" and would never touch the rule that actually matters.

So the specs press the buttons and let the loop decide:

- with a search running, pressing **Study Stars** does nothing at all, and the
  study gate reopens by itself the moment the search completes;
- with the grid down, a search in flight makes *no* progress across 200 seconds
  of driven time, is held open rather than cancelled, and resumes on power;
- Voidborn's **Void Seers** adds a third job to the same instrument, and a
  pillage locks out both of the others until it finishes.

**Two measured rules rather than field reads.** A search that finds an asteroid
raises the base search duration by 7% — so the spec runs five searches, counts
the asteroids that actually appeared, and asserts
`base × 1.07^found`, bounded above by `base × 1.07^searches`. A star study
extends the vision range by one increment — so the spec counts `.star` against
`.star-uninteresting` on the real star map before and after, which is the player's
own view of "more stars are in reach now".

**Two things that shape every spec in the file.** `discoverAsteroid` rolls a 7%
miss by design, so nothing here demands a find from one press; and both durations
carry a ±20% random offset, so every assertion is about the *base* duration and
every timer is driven well past its widest roll.

**The staging is deliberately small, and that mattered.** The two build specs use
exactly three debug buttons — *Give $1B*, *Give 1M of all Resources and
Compounds*, *Grant All Techs* — and then go to the Space Mining tab. An earlier
draft stocked them with the full starship scenario, which builds the telescope
outright and discovers ten asteroids on the way, and the resulting failure was
written up as a product defect (known-issues #22) when the reported symptom — the
pane never showing the building as bought — was not real: the frame loop's
`handleVisibilityOfOneOffPurchaseButtonsAndDescriptions` tidies the row a moment
after any purchase.

Re-running on the minimal setup showed the genuine fault, which was narrower: an
unguarded null lookup in `buildSpaceMiningBuilding` threw and aborted the rest of
the build button's `onClick`, so the **Scan Asteroids** and **Study Stars** rows
did not appear until the pane was next drawn. That is now fixed in the source with
optional chaining, and the whole area passes.

The lesson is worth keeping: use the smallest debug setup that makes the thing
under test reachable. A heavy scenario puts the run in a state the interaction was
never meant to be made from, and the failure it produces looks like a product bug.

---

## 🟢 Starship — `starship.spec.js`, 8 specs, all passing

Also a new area, and the one with the most wiring hidden between the click and
the result.

**Three facts about the build path that only an integration test can reach.**

1. **`gain` does not deduct anything.** It writes the bill into `itemsToDeduct`
   and the frame loop settles it — and `setItemsToDeduct` *overwrites* a
   resource's entry rather than adding to it. Twenty clicks inside one frame are
   charged once. Every build loop here waits two `requestAnimationFrame` hops
   between presses, which is also what a real player's fastest clicking does.
2. **A module is `finished` by the pane, not by the purchase.** Nothing in the
   click handler sets it; `handleSpaceUpgradeResourceType` does, on the frame
   loop, and only for rows that are currently rendered. The Star Ship pane has to
   stay open for a module to complete at all.
3. **The ship deciding it exists is a frame-loop decision too.**
   `starShipUiChecks` sets `readyForTravel` once every `ss` module except the
   scanner reports `finished`, and moves the sidebar to the Star Ship pane itself.

The spec builds all 47 mandatory parts through their own buttons, checks the
first part of each module against its exact advertised bill, and then checks the
price rise — `Math.ceil(price × 1.13)` — that makes the next one dearer.

**The optional module, tested both ways.** The Stellar Scanner is the fifth
module and the ship flies without it. Two specs fly the same journey with and
without it: with it, the system scan names the civilization and the population;
without it, both read `???` and the pane says so in the game's own words
(`tab5ScanResultsNoScanner` rather than `tab5ScanResultsAnalyse`). The point the
pair makes together is that its absence never stopped the journey — only the
knowledge.

**Distance is the only input.** A star's antimatter cost and its flight time are
both functions of its distance and nothing else, so the spec re-runs
`calculateAntimatterRequired` and `calculateAscendencyPoints` against the record
the star map generated and asserts they agree — if the record ever drifts from
the formula, that is where it shows. It also walks the curve at 1, 10, 25, 50, 75
and 100 light years to pin that it is monotonic and bounded at 5,000 and 155,000
antimatter.

**Fuel is the real constraint on where a run can reach**, because antimatter is
the one resource that cannot be bought. One unit short of a star's fuel leaves
the Travel button red; exactly the fuel lights it green; and launching spends
exactly that much and not a unit more, so the tank is empty on arrival.

**The flight, driven rather than skipped.** The clock is asserted to be set from
`calculateStarTravelDurationWithModifiers` rather than from a constant, advanced
a tenth of the way and checked to have moved by exactly that much — allowing for
the page's own frame loop still driving the same timer in real time — and then
run out. Arrival puts the ship in `['orbiting', destination]`, opens the system
scan row, closes the travel row, and on run 1 grants `apAwardedThisRun`, which is
what unlocks the Galactic tab.

**One staging note worth keeping.** Materials cannot be measured to the unit
without first emptying every autobuyer, and even then exactly one compound still
drifts: whichever the current system rains. Precipitation accrues on its own,
outside the autobuyers, and it is drawn per star system — so the spec reads
`precipitationType` from the current star and gives that one bill a bounded
window while every other bill is asserted to the unit.

---

## 🟢 Research — `research-live.spec.js`, 10 specs, all passing

**What is different.** `research.spec.js` was the clearest surviving example of
the problem this document exists for. It had fifteen passing specs, and its rate
tests worked by re-implementing `calculateResearchRatePerTick` inside a
`withMods` call and asserting that the test's own arithmetic came out right. That
proves the tester can multiply. It would have passed with the research timer
deleted.

The new file buys the buildings. Every purchase goes through the row's own button
in the Research pane, and every claim about rate is settled by measuring how much
the pool actually gained over a wall-clock window.

The chain exercised end to end:

```
#researchScienceKitRow button
  -> gain(1, ..., 'scienceUpgrade', 'resources')   quantity up, cash down
  -> addToResourceAllTimeStat(1, 'scienceKits')    the statistic
  -> deferredActions -> startUpdateTimersAndRates  the rate fields
  -> updateResearchDelta on the frame loop         the pool actually growing
```

**What it settled.** Three things the old file could not have told us:

- A research building costs **cash**, not research points, despite the Science
  Kit's row being built with a `textResearchPointsSuffix` label. The frame loop
  rewrites the cost label to `$5` before a player ever sees it, so the label is
  right on screen — but the only way to know that was to buy one and watch which
  balance moved.
- The rate the side menu shows is **rounded** by the `notation` class, so a true
  0.5/s displays as `1 / s`. Any spec comparing display against truth has to
  stage enough buildings for the rounding to be noise; this one buys forty.
- One Science Kit is **0.5/s**, not 0.005/s. The data says `rate: 0.005` and the
  tick is 10ms, so the per-second figure is a hundred times the per-tick figure.
  The first draft of the measurement spec asserted the wrong number and failed,
  which is exactly what a measured spec is for.

**Where `withMods` is still used, and why.** To stage cash and to read the pool,
the building counts and `getTotalEnergyUse()` back. The power tests flip
`setPowerOnOff` directly rather than starving a plant, because what is under test
there is the research side of the rule, and energy-live already plays the grid
going down through its own controls.

---

## 🟢 Tech Tree — `technology.spec.js`, 18 specs, all passing

**What is different.** The area had no spec file at all. It is written as an
integration file from the start: it earns research, watches techs appear as the
pool grows, buys them from their rows, and then goes and looks at the part of the
game each purchase was supposed to open.

The reveal specs are the ones worth describing. A threshold test could be written
by setting the pool above `appearsAt` and reading `getRevealedTechArray()` back —
and would pass whether or not the monitor that watches the pool still ran. So
instead the pool is staged *just under* the threshold, twenty science kits are
bought in the Research pane, and the crossing is produced by the game's own
production while the spec waits for `monitorTechTree()` to notice and for the
frame loop to un-hide the row. Same for the tree redraw: the tree is left open
on screen and the node has to change state under it.

**What it settled.**

- The tech tree's "already bought" gate is **not** a colour class. The frame loop
  relabels the button to *Researched*, sets `data-researched`, and takes its
  pointer events away outright — which is what makes it safe that
  `setTechUnlockedArray` does not de-duplicate. The first draft of that spec
  pressed the button twice and found the tech in the array twice; the correct
  reading is that a player cannot press it twice, and the spec now asserts the
  gate rather than the bypass.
- **Grant All Techs deliberately skips megastructure techs.** They belong to a
  megastructure run and are filtered out of the tree on any other run, so
  granting them would leave the tree in a state the game cannot reach. The spec
  now states that as the rule instead of reporting it as a gap.
- **Research points do not buy the cosmic rip.** A million research points
  reveals and unlocks nothing in the Cosmic Rip pane, whose techs are priced in
  rip telemetry data plus a galactic point. Confusing the two currencies would
  hand the whole endgame chapter to any player with a research surplus, so the
  separation is pinned explicitly.

---

## 🟢 Statistics — `statistics.spec.js`, 16 specs, all passing

**What is different.** The area had no spec file. Statistics are written from
exactly one place — `addToResourceAllTimeStat(amount, item)` — and rendered from
one other, `getStats(statFunctionsGets)`, which the frame loop calls only while
the Statistics pane is the open one. Both halves are played: the pane is opened
through its real side-menu option, and every statistic is asserted as a **delta**
produced by doing the thing that is supposed to move it.

Where a statistic counts a quantity rather than an event, the delta is compared
against the quantity the run actually gained — so a statistic that counted the
button press rather than the gain fails. The at-capacity spec is the sharp end of
that: five presses of a gain button on a full store must add nothing, because
nothing was gained.

**A measurement note that cost two failures.** Reading the statistic and the
resource quantity in two separate `page.evaluate` round trips lets the frame loop
run between them, and at a few hundred units a second that skew is larger than
the tolerance. `readStatsAndQuantity()` samples both sides inside one evaluation,
so a failure now means the statistic really has drifted from the thing it counts.

**What it found.** Two live defects, both since fixed in the source:

- [known-issues #23](known-issues.md) — four **Void Seer** cells were permanently
  stuck on the `NoData` placeholder, because the getter table spelled the keys
  `stat_voidseer…` while the page builds the ids `stat_voidSeer…`. The spec sweeps
  every cell for the placeholder rather than naming those four, so it will catch
  the next one too.
- [known-issues #24](known-issues.md) — a rebirth zeroed **fourteen "All Time"
  statistics**, while the research, resource and compound families correctly
  survived. The spec plays a run, earns something in each family, takes the
  rebirth through the real Rebirth button, and asserts both halves of the
  two-column contract.

Neither was reachable without playing: the first needs the pane open and rendering,
the second needs a real rebirth taken between two readings.

---

## 🟢 Cosmic Rip — `cosmic-rip-live.spec.js`, 15 specs, all passing

**What is different.** `cosmic-rip.spec.js` tested the module: what
`scanCosmicRipSector` returns for a bad index, what `restoreNearSpaceScannerArray`
refuses, that the location seeds once. Useful, and none of it touches the chapter
a player actually plays. The new file plays it end to end — points earned off the
settled ledger, the array restored with its own button, the **galactic telescope
swept sector by sector** until the rip turns up, buoys deployed, telemetry
gathered, all five stabilisation techs researched through their buttons and their
timers — and stops with the Close The Rip button lit.

**The galactic telescope is not the Space Telescope.** They are different
instruments in different chapters, and this file touches only the first: the
nine-sector grid the Near Space Scanner Array gives you, which is the only thing
that can find the rip.

**Sweeping the grid is the point.** The rebirth suite's endgame spec reaches the
rip by calling `scanCosmicRipSector(ripIndex)` directly, with a comment explaining
that the sector grid is a canvas overlay whose handler only fires for a sector its
own scan label has lit. That is exactly the wiring worth testing, so this file
dispatches clicks at the real `cosmicRipNearSpaceScannerArraySector*` divs and
asserts the gate separately: every unscanned sector lit while there are points,
every sector dark when the balance runs out, a click on a dark sector doing
nothing, and a click on a scanned one charging nothing.

**Galactic points cannot be staged, and that turned out to be a feature.** The
frame loop recomputes the balance every frame from
`settledStars.length - 1 - galacticPointsSpent`, so writing it is overwritten
within a frame. The only way to have points is to settle systems, which means the
economy is measured rather than asserted: six systems settled earn exactly six
points, a repeat conquest earns nothing, the restoration takes ten, each scan
takes one, each tech takes one, and the balance stops at zero rather than going
through it. The "short of a full sweep" spec funds twelve conquests, restores the
array, clicks all nine sectors and asserts that exactly as many landed as there
were points to pay for.

**The research is a timer, not a purchase.** Each stabilisation tech charges its
telemetry price and a galactic point **up front**, swaps its button for a progress
bar, and unlocks only when one to five minutes of delta time has run out. The spec
asserts all four of those per tech, driving the delta manager rather than waiting.

**Where it stops, and why.** Pressing Close The Rip starts the end-game cinematic,
whose overlay is designed never to hand the game back. So the file asserts the
state immediately before the press — stability bar at 100%, the row revealed, the
button lit and genuinely pressable — and does not press it. A companion spec spends
the last point and shows the same row revealed but blocked, which is the other half
of that gate.

**Two preconditions are staged, both the work of previous runs**: the `cosmicRip`
tech, which the Miaplacidus win cinematic grants, and the settled ledger the points
are counted from. Everything after those is played.

---

## 🟢 Save Migration — `save-migration.spec.js`, 11 specs, all passing

**What is different.** There were no specs at all before this, and the obvious way
to write them would have been to import `migrateResourceData` and call it with
hand-built objects. None of these do that. Every spec plays a run, takes the save
**the game itself produced**, *ages* it — rewinds `version` and strips out the
sections a historical rung is supposed to rebuild — pastes it into the real import
box and presses **Import**. The ladder then runs where it really runs:

```
Import click
  -> loadGame()                     validate, decompress, parse
  -> restoreGameStatus()            minimum-version gate
  -> restoreResourceDataObject()    and its six sibling restorers
  -> migrateResourceData()          the ladder, one rung at a time
  -> live game                      asserted by re-exporting on the next pane visit
```

Ageing a save the current build just made, rather than checking in a fixture, is
deliberate. A checked-in 0.93 save is frozen the day it is written and slowly
stops resembling anything the migration is asked to handle; a rewound live save
always has today's shape with yesterday's version number.

**Coverage of the ladder itself.** One spec walks a save in at *every* version the
ladder branches on — 0.93, 0.94, 0.95, 0.967, 0.969, 0.976, 0.978, 0.979 — and
asserts all eight arrive at the current version with the run intact. Covering only
the oldest would have left the common case untested: a player who last played two
releases ago enters the ladder half way up.

**The autobuyer rung gets the strongest assertion in the file**, because it guards
the entire localization release for returning players. The spec puts all sixty
pre-localization display names back — nine resources and six compounds, four tiers
each — imports, and then checks two things: that every migrated `nameUpgrade`
resolves through `localize()` to something other than itself, and that the hydrogen
pane *renders* "Hydrogen Compressor" with no `autoBuyerName…` key anywhere in the
row. A name left unconverted fails both.

**Idempotence is tested the way it can actually break.** Re-importing an
already-current save is trivially a no-op, because the `while` loop never runs.
So the spec rewinds *only the version field*, leaving every migrated value in
place, and sends it through again — which is what an interrupted or replayed
upgrade looks like. The black hole rescale is the specific thing this protects:
90 power becomes 60 on the first pass, and a save that arrives old *and* already
carrying `blackHoleNerfPatched` must come out still at 90 rather than being halved
a second time.

### Adding a version without touching the source

The case the ladder exists for is someone adding a rung and bumping the version,
and that cannot be reached from inside the page — `GAME_VERSION_FOR_SAVES` is a
`const` export, so the modified module has to be what the browser receives.

The three specs that cover it use **Playwright route interception**: they intercept
the requests for `constantsAndGlobalVars.js` and `patches.js`, rewrite the response
bodies in memory, and fulfil the request with the rewritten text. The game then
boots genuinely believing the current save version is `0.9995` and genuinely
carrying an extra rung, and the import path exercises it for real.

```js
await game.page.route('**/patches.js', async (route) => {
  const body = await (await route.fetch()).text();
  const patched = body.replace(/\n(\s*)\}(\r?\n)(\s*)return saveData;/, ...);
  rewritten.patches = patched !== body;      // asserted, so a silent miss cannot pass
  await route.fulfill({ body: patched, ... });
});
```

The alternative — writing the files, running, and restoring them in `afterAll` —
was rejected. A run that is killed, times out or crashes between the edit and its
restore leaves the repository holding a version number nobody chose, and for this
particular constant that silently changes how every player's save is migrated.
With interception the files are only ever *read*, so there is nothing to restore
and no window in which to fail.

Two details make the interception trustworthy rather than merely clever:

- **The rewrite asserts that it matched.** Both `replace` calls compare before and
  after and the spec fails if either was a no-op. Without that, a future edit to
  either file would leave the specs passing against the unmodified game.
- **The guarantee is asserted, not claimed.** `beforeAll` snapshots both files,
  `afterAll` asserts byte-equality, and a third spec boots *without* the routes and
  confirms an ordinary boot is still the real build. After the full run,
  `git status` showed no modification to either file.

---

## 🟢 Local Save & Load — `save-load-local.spec.js`, 10 specs, all passing

**What is different.** Local saving is two features sharing a payload, and the
specs treat them separately: **the code** (the compressed string in the export box,
Export to clipboard, Import from the box) and **the file** (Manual Save's real
browser download, Manual Load's real file picker). Nothing calls `saveGame()` or
`loadGame()` — the interesting failures are not in the compression, they are in the
pane's once-per-visit `onSaveScreen` hook, the blob download, the `FileReader`
path and the validate-before-parse guard.

**Every round trip lands in a brand new run.** The spec plays, takes the artifact,
then calls `boot()` again — which navigates, so it is a genuinely fresh session
with a different pioneer — and only then imports. Loading back into the same
session would pass even if `restoreGameStatus` did nothing at all, which is
precisely the failure mode worth catching.

**Two comparison sets, because they have different tolerances.** `structural()` —
identity, unlock arrays, tech list, asteroid count, nested data-object values — is
compared exactly, since none of it drifts. `totals()` — cash, antimatter,
hydrogen, research — is compared with `>=`, because the frame loop keeps producing
between the export and the comparison and an exact match would be racy by
construction.

### One assumption withdrawn, and what replaced it

The first draft folded `saveName` into `structural()` and both round trips failed
on it. The game is right and the assertion was wrong:
`setSaveName(gameState.saveName)` in `restoreGameStatus` is guarded by
`if (type === 'cloud')`, so a **local** import deliberately keeps the importing
player's own pioneer name. That is not an oversight — adopting the name would
point this player's autosave at the cloud slot of whoever wrote the code they
pasted in, and quietly overwrite that person's game.

So `saveName` came out of the comparison and became an assertion in its own right,
in both round trips: the restored run must carry the importer's pioneer name and
*not* the one in the save. The rule is now pinned rather than merely not violated.

---

## 🟢 Cloud Save & Load — `save-load-cloud.spec.js`, 8 specs, all passing

**What is different.** The legacy suites used cloud saves as a *fixture mechanism*
and never tested the feature. These specs upload through the real **Save To Cloud**
button, load back by booting as the saved pioneer so the game calls
`loadGameFromCloud()` on its own during boot, and destroy through the real **Hard
Reset** button and its confirmation modal.

**This is the only area in the suite that writes to production infrastructure**, so
the footprint is fixed by design. Every write lands on one reserved row:

```
---000test_Test1981_cosmicForge_e2e
```

The leading dashes sort it above every real pioneer in the table, so it is obvious
at a glance that it is not a player; the embedded `Test1981` is the game's own
debug backdoor, so the same pioneer can still reach the debug menu. The row is
**reused on every run** rather than uniquely named — a unique name would grow the
table by a row every time the suite executes, forever — and reuse has the side
benefit of exercising the UPDATE branch, which is the branch a returning player
actually hits. Nothing is ever deleted. Total permanent additions: that row, and
the `graveyard_` copy the hard-reset spec creates once.

**The two write branches are separable from outside the database.** `INSERT` raises
"Game saved to the cloud!" and `UPDATE` raises "Game updated in the cloud!", so the
spec that saves a second time under an existing name can assert it updated rather
than inserted — and then loads the row back to prove exactly one row exists,
because a duplicate would make Supabase's `.single()` error outright.

**The specs are serial.** They share one row, so `mode: 'serial'` stops a parallel
autosave overwriting a round trip mid-flight, and fixes the order so the
hard-reset spec — which nulls the row and then re-saves — leaves it holding data
for the next run.

### Three things worth knowing

**Autosave is driven, not simulated.** The frequency dropdown's shortest option is
two minutes, which is too long to sit through, so the spec sets `autoSaveFrequency`
through the game's own variable debugger and then flips the autosave toggle off and
on — the toggle's handler is what calls `initializeAutoSave()`, so the timer is
rescheduled by a real control rather than a direct call. The upload then happens
with nothing pressed, which is the whole point of the feature.

**A network failure is a route abort, not a mock.** Aborting `*.supabase.co`
requests leaves the client library — which comes from a different host — perfectly
healthy, so the spec exercises a failed request rather than a broken page. The
assertion that matters is the second one: losing the network must not cost the
player the run they were trying to protect.

That spec also cost a second withdrawn assumption. It first asserted the pioneer
name was unchanged by a failed upload, and it is not: `captureGameStatusForSaving`
adopts whatever is in the pane's name field *before* the upload is attempted. That
rename is the player's own action in that click rather than damage from the
failure, and keeping it is right — a retry then goes to the slot they chose. The
comparison now excludes the name and asserts it separately.

**The analytics columns are read on the way past.** `region`, `hostSource`,
`feedback` and `feedback_content` are written on every save and never read back by
the game, so nothing would notice them going null. Rather than reading the table
back — which needs credentials the suite does not have — the spec intercepts the
outgoing `PATCH`/`POST` and inspects its body, which asserts what the game actually
sends. Worth knowing: `region` is a three-part tuple `[platform, userAgent, data]`,
not a string, and `platform` is only ever `github` or `itch`, decided from the
hostname — so `unknown` is the correct answer anywhere else, including a local test
server. The spec asserts the shape and that the user agent is genuinely captured,
rather than pinning a value that is environment-dependent.

---

## 🟢 UI Navigation — `ui-navigation-live.spec.js`, 12 specs, all passing

**What is different.** The area previously had one file covering one behaviour —
the ⚠️ marker clearing when a row is opened. Nothing walked the shell. The new
file plays the run out with the debug scenario and then navigates all of it:
nine tabs, fifty-nine option rows, the two endgame chapters, and the hotkeys.

The claim it makes about a pane is deliberately stronger than "a click handler
ran". Every row in the sweep has to satisfy four things at once:

1. the pane name changed, and no two rows on a tab land on the same pane;
2. `#headerContentTabN` **names the row** — every heading in the game either is
   the row's label or begins with it, so a row wired to the wrong pane is caught
   by name rather than by id;
3. `#optionContentTabN` has children, which separates "routed correctly" from
   "routed correctly and drew nothing";
4. the clicked row is the one carrying `row-side-menu-selected`.

**The two endgame chapters are reached the way the game reaches them.**
Megastructures is opened by flipping `currentRunIsMegaStructureRun` through the
game's own variable debugger and then letting `megastructureUIChecks` reveal the
row on the next frame — the assertion is that the row was hidden before and is
offered after, not that a flag was written. The Cosmic Rip is opened by staging
the settled ledger and then paying ten galactic points through the real **Restore
Near Space Scanner Array** button, after which the spec checks that the two
previously hidden rows are on the menu and that the telescope really built its
nine-sector grid rather than an empty shell. As everywhere else in the suite, it
stops short of **Close The Rip**, which starts a cinematic that never hands the
game back.

**Three things worth knowing, found while writing it.**

1. **`unlockAllTabsButton` deliberately leaves `cosmicRip` out.** It unlocks the
   other five tab techs, and the frame loop's `showTabsUponUnlock` re-locks tab 8
   within a frame and relabels it `???`. The tech is granted by the Miaplacidus
   win cinematic, so the spec stages it the same way `cosmic-rip-live.spec.js`
   does and navigates everything downstream for real.
2. **Ten rows are legitimately still off the menu on a fully progressed run**,
   and they are listed by name in the spec with a reason each — Colonise wants a
   destination star, Rebirth wants a rebirth to be possible, Exit Game is Electron
   only, and so on. Routing and heading are still checked for those rows; only
   the "drew content" claim is not made, because the game is not offering them.
   Writing the list out rather than counting it means a row *newly* falling off
   the menu fails the spec.
3. **The tab order is not the markup order.** `checkOrderOfTabs` sorts unlocked
   tabs by a priority table, so a fully unlocked run reads
   `1, 4, 3, 2, 6, 5, 7, 8, 9` and the number-key hotkeys address *positions*,
   not tab ids. The hotkey spec is written against position for that reason, and
   it is the assertion that would catch the ordering and the hotkey binding
   drifting apart.

---

## 🟢 News Ticker — `news-ticker-live.spec.js`, 8 specs, all passing

**What is different.** The existing file calls `showNewsTickerMessage()` directly.
The new one never does. Every headline in it arrives because the ticker's own
timer fired:

```
debug menu -> News Ticker row      forced category + 10s interval override
Settings -> Game Options toggle    off, then on
  -> setNewsTickerSetting(false/true)
  -> startNewsTickerTimer()        removes the old timer, schedules at the override
  -> timerManager fires            showNewsTickerMessage()
  -> displayNewsTickerMessage()    .news-ticker-text built and scrolled
```

That middle step is the part that is easy to get wrong and is worth recording:
**the debug row does not reschedule anything.** `setNewsTickerDebugButton` stores
the category and interval and nothing else, so a spec that sets a ten-second
interval and waits will sit through the 20–35 seconds the boot-time timer was
already scheduled for. The toggle on the Game Options pane is the only control a
player has that rebuilds the timer, and it is what the specs use.

`startNewsTickerTimer` runs on the **non-delta** `timerManager`, which is a plain
`setInterval` on the wall clock. There is no fast-forwarding it: a cycle costs a
real ten seconds and these specs are paced accordingly.

**Reading the right message.** `displayNewsTickerMessage` replaces
`.news-ticker-text` wholesale and leaves the previous one on screen for the forty
seconds it takes to scroll. Each cycle therefore stamps the current headline and
waits for one that has not been stamped. Nothing is cleared or synthesised — the
element the game builds is the element that gets read.

**All four families, each recognised by what it puts on screen.**

- **wackyEffects** — forced from the debug menu. The spec asserts the headline is
  one of the current language's wacky bodies, then clicks the `data-effect-item`
  span and asserts the ticker changed. Which effect fires is random and each one
  reaches for a different target, so the assertion is that *something* moved
  rather than which animation was added.
- **prize** — forced. The spec first empties the stores through the real **Sell
  All** button, because a prize is only offered when the resource it gifts has
  room for it and the debug scenario fills every store to its cap. It then clicks
  the prize, asserts the resource grew by at least the promised amount and that
  `newsTickerPrizesCollected` went up by exactly one, and clicks again to prove a
  claimed prize pays nothing the second time.
- **manuscriptClues** — forced, after surveying stars with the **Study a Star**
  debug button until the guaranteed manuscript at five light years appears. Two
  cycles: the first must name the star, the second must name it too and must use
  a different template.
- **noPrize** — *cannot* be forced; there is no debug option for it, because it is
  the fallback the roll lands on past 0.28. It is reached by leaving the category
  unforced and cycling up to six times, identifying it by the absence of any
  interactive span, and checking the headline against the no-prize catalogue.

**Languages are asserted by catalogue membership, not by string inequality.** The
language is changed through the debug menu's own **Set** button, which runs
`relocalizeAll` and rebuilds `descriptions.js`. The spec then requires the
rendered headline to be in *that language's* catalogue. That is the assertion
that would fail if the change never reached the ticker: an English headline is
not in the German catalogue. Comparing two renderings for inequality would prove
nothing, because the family picks a different entry each spin anyway.

One wrinkle that cost a first red run: `specialMessageBuilder` splices a
multi-line `<span>` around the link word, so `textContent` carries whitespace the
catalogue entry does not — the Spanish wacky line reads `¡ Boo!` on screen and
`¡Boo!` in `descriptions.js`. The comparison drops whitespace entirely and keeps
every other character.

---

## 🟠 Number Notation — `notation-live.spec.js`, 11 specs, 8 passing

**What is different.** `notation.spec.js` proves what `formatNumber()` returns.
All eleven of its specs would still pass if the frame loop never applied the
formatter to a single element on screen. The new file checks the screen: it
changes the mode through the real dropdown on the Visual pane and then walks
every option row on all nine tabs, reading back what each pane renders.

**The grammar is stated as a rule, not a value list.** A pane's numbers move
while it is open — production ticks, autobuyers spend — so pinning exact strings
would be flaky by construction. What does not move is the shape the formatter
owes:

| Mode | Rule |
|---|---|
| `normalCondensed` | no thousands separator anywhere, and nothing past four integer digits without a K/M/B/e suffix |
| `normal` | no `1.5K`-style abbreviation, and every value past a thousand comma-grouped |

Both rules can only be broken by a number the formatter never reached, which is
exactly what the file exists to catch. Two details keep it honest: the number
token requires `,\d{3}` for grouping, because several cost rows read
`$300, 100 Carbon` and a looser pattern reads the list separator as a thousands
separator; and a plain-mode suffix only counts as an abbreviation when a decimal
precedes it, because some descriptions carry a literal `$5K` in their authored
text.

**Three surfaces, three code paths.** The frame loop routes `.notation` elements
three ways and they share no code, so each is covered separately:
`.sell-fuse-money` → `complexSellStringFormatter`, `.building-purchase` →
`complexPurchaseBuildingFormatter`, everything else →
`formatAllNotationElements`. That split is what localised both defects below.

**Two live defects, found by three specs — both now fixed at source.**

1. **Price descriptions ignored the plain mode** (known-issues #26, closed).
   `complexPurchaseBuildingFormatter` returned immediately unless the mode was
   `normalCondensed`, and because the `else if` had already claimed the element it
   never reached `formatAllNotationElements`. So in Normal every purchase row in
   the game showed raw, ungrouped costs — `$500000, 25000 Titanium` — under a stat
   bar reading `$1,999,952,765`. Found by: *"plain: every value past a thousand is
   grouped"* (the whole-game sweep, which named all 26 offending numbers) and
   *"plain: every cost on a purchase row is grouped in thousands"*. The span walk
   is now shared by both modes and only the number formatter differs.
2. **The Statistics screen was never formatted at all** (known-issues #27, closed).
   `createHtmlTableStatistics` compared a capitalised, localized heading against a
   list of lowercase English keys, so the `notation` class was never added: the
   pane rendered 111 rows and zero `.notation` elements, and cash read
   `$1999952765.00` in both modes. A `localizedNotationHeaders` table was built
   directly above the check and never read, which is what marked it as an
   unfinished change rather than an omission. Found by: *"the statistics screen
   follows the notation setting"*. The match is now on the resolved English key,
   and the same DOM check returns 33 `.notation` elements rather than 0.

Both were left failing until they were fixed in the game rather than in the test,
per the suite's standing rule. The matching **condensed** specs passed throughout,
which is what localised the first defect to the plain-mode path rather than to
price rows generally — and what proved, once the walk became shared, that the mode
which already worked had not regressed.

Closing #27 also changed two specs, because both had been written against the
un-formatted screen. The statistics sweep in this file counted only cells that
were *wholly digits*, a shape that disappears the moment condensed mode
abbreviates, so its own floor assertion became unsatisfiable; it now accepts a
magnitude suffix as part of a figure and asserts positively that cash abbreviates
in condensed and groups in plain. `tests/e2e/statistics/statistics.spec.js` read
the cash cell by stripping every non-digit, so `$1.0B` came back as `1`; its
`asNumber()` helper now expands the suffix.

**One thing the file deliberately does not do.** The truncation rule — that
condensed floors rather than rounds, so 1999 reads `1.9K` — stays in the contract
file. Proving it on screen needs a value whose two renderings differ, and every
figure a run can be driven to deterministically is round. Asserting it against a
live, moving number would be pinning a race rather than a rule.

---

## 🟢 Galactic Market — `galactic-market-live.spec.js`, 18 specs, all passing

**What is different.** The old file already drove the dropdowns, but it called
`galacticMarketSellApForCash()` and `galacticMarketLiquidateForAp()` outright and
never pressed the **Liquidate** button at all. The new file calls no market
function: every trade, both AP routes and the whole liquidation go through the
controls, and each assertion is made against what the pane rendered.

Why that matters here more than in most areas: **the trade reads its own inputs
back out of the DOM.**

```
galacticMarketChecks()      outgoing text  <- the quantity field
  -> calculateIncomingQuantity()           incoming <- bias-adjusted price ratio
  -> commission text        <- floor(commission% x outgoing)
  -> incoming text          <- incoming less its share of the commission
Confirm -> galacticMarketTrade()
  -> parseNumber(outgoing text)            the rendered string is the input
  -> moves both holdings, shifts both biases
```

`galacticMarketChecks()` only runs while the Galactic tab is open *and* the market
pane is current, so a trade staged from anywhere else has no summary and moves
nothing. No function-level test can see that interlock.

**Covered.** All fourteen materials traded in one sweep, each paired with the next
round the ring so every material appears on both sides; the incoming quantity
pinned to the bias-adjusted ratio less the commission share; demand proven to move
the price in both directions; the bias shift after a trade pinned to the traded
quantity over that material's `tradeVolume`; the ten-second decay watched walking
a bias back towards zero from both signs; the sidebar bias line and its three
severity colours; the tooltip's base price, adjusted price and trade volume; the
quantity selector's lock, "all stock" and clamp; the self-trade exclusion; the
commission walked from 10 to its 80 cap over a dozen real trades; all three AP
sale quantities; and the liquidation authorised, quoted, pressed and refused a
second time.

**Two things about time that shaped every spec in the file.**

- **Plain notation is staged, deliberately.** The trade parses the *rendered*
  string, so in condensed mode entering 12345 deducts 12300, and the incoming line
  is a rounded-down version of the exact figure credited. "The pane's promise
  equals the transaction" is not checkable in that mode — the two legitimately
  differ by the rounding. Plain notation groups in thousands and loses nothing.
- **Read and press in the same synchronous block.** Three clocks move underneath
  a split read: production adds stock, the ten-second bias decay moves the
  conversion, and a trade's own commission rise changes the next frame's summary.
  Every quantity comparison here snapshots, dispatches and re-snapshots inside one
  `page.evaluate`, which is the only way the sweep is exact rather than
  approximately right. The same fix was applied to the pre-existing bias spec in
  `galactic-market.spec.js`, which had been flaking by exactly one 0.05 decay step.

**And never pin a bias in the expectation.** The decay makes any figure derived
from one a moving target, which cost three separate red runs: the demand spec
pinned `3999`, the sidebar spec pinned `O:+1.5%`, and the tooltip spec pinned
`+2.0%`. All three now read the live bias in the same round trip as the rendering
and derive the expectation from it — through the pane's own formatting rule for
the sidebar, and by checking the tooltip's numbers against each other (adjusted
price is base price scaled by the bias printed beside it) for the tooltip. Those
are the relationships the pane exists to show, and unlike a pinned figure they
cannot drift.

Also worth recording: **both sides of a trade are floored on write** —
`Math.floor(held - previewed)` going out, `Math.floor(held + previewed)` coming in
— so a holding carrying a fraction of a unit loses it to the trade. The sweep
compares against the floored post-state rather than chasing that remainder with a
tolerance.

**Two live defects, both found and fixed** (known-issues #29 and #30):

1. **Zeroing the quantity left a stale summary and a live Confirm button.** The
   summary was only refreshed while the outgoing quantity was positive, so at zero
   the incoming and commission lines kept the previous amount and the button
   stayed green off a stale `galacticMarketIncomingQuantity`. Pressing it moved
   nothing, so it was misleading rather than harmful. `galacticMarketChecks()` now
   has an `else` that zeroes both lines and the stored quantity.
2. **A severe bias made the market status tooltip unhoverable.** Past ±10 the
   status line is painted `red-disabled-text`, whose CSS is `pointer-events: none`
   — and the tooltip carrying the base price, adjusted price and trade volume is
   bound to that element's own mouse events, so the reading vanished exactly when
   the bias was worth looking at. The stylesheet's existing
   `.notation.red-disabled-text` escape hatch now covers `#galacticMarketOption2`
   in both the red and orange bands. The spec asserts the computed
   `pointer-events` as well as the tooltip appearing, so removing the rule fails
   it rather than merely making the tooltip absent.

---

## 🟢 Galactic Casino — `galactic-casino-live.spec.js`, 23 specs, all passing

**What is different.** `games.spec.js` and `cp-economy.spec.js` reach into the
module and call `playDoubleOrNothing()`, `playWheelOfFortune()` and
`claimCasinoSpecialPrizeByKey()`. That proves the payout maths and nothing else.
The intricate part of the casino is not the maths — it is that **all four games
are armed and disarmed by `galacticCasinoChecks()` on the frame loop**, and each
game is armed by a different rule:

| Game | What decides whether it can be played |
|---|---|
| 1 Double or Nothing | the stake field's *own input handler*, not the loop; the field clamps to the CP balance |
| 2 Wheel of Fortune | the loop refuses to arm Spin while an unclaimed special waits, and greys each prize whose target does not exist |
| 3 Higher or Lower | one button in three states — Play, Cash Out, dead — with the prize tier re-rolled from the reveal count |
| 4 Visiting Void Seer | the loop arms Spin from the selected prize's cost against the balance, and greys prizes with nothing to point at |

The new file calls no casino function. Every game is played by typing into its
field, choosing in its dropdown and pressing its buttons.

**Determinism without stubbing.** Five shipped levers do the work —
`setBaseProbabilityCasino()`, the `wheelForceSpecial`, `casinoGame4AlwaysWin` and
`casinoGame5VoidSeerAlwaysMatch` variable-debugger flags, and the wheel's own
`globalThis.__wheelForceIndex` hook. `Math.random` is never patched, so every path
taken is a path the game can genuinely take.

**Disabled means disabled here**, unlike everywhere else in the game. The casino's
controls go through `setButtonState`, which sets a real `disabled` attribute, and
a disabled `<button>` swallows even a dispatched click. So refusals are tested by
*pressing the button* rather than only by reading a class — which is the stronger
claim, and is not available in areas gated by `red-disabled-text` alone.

**What the payouts are checked against.** Every prize is measured on the balance it
is supposed to move: CP purchases against `cpBaseCost / valueOfOneCP` for cash,
hydrogen and titanium; a Double or Nothing win as +stake on an already-debited
balance; the wheel's flat 100 CP, its 100,000 research and a doubling, each
claimed through the real dropdown and Claim button; ten forced winning segments
proving no winning segment can pay nothing and that more than one prize family
comes up; and five Higher or Lower hands cashed out at five different depths, each
one's offered prize key resolved to the balance it names and checked there —
exact for the flat CP tiers, positive for the percentage and top-up families.

**Three traps found while writing it.**

- **The spinner strips render every face they can show, forty times over.** Reading
  `textContent` off the two Void Seer reels returns the whole strip, so comparing
  them "proves" a match on every spin including losses. Win and loss are read from
  the `voidSeerWon` stat instead, and the reel's size is its count of *distinct*
  `data-value`s.
- **Four casino statistics were being read under names that do not exist.**
  `stat_voidseerWon`, `stat_voidseerWonThisRun` and `stat_voidseerPlayedThisRun`
  are `stat_voidSeerWon`, `stat_voidSeerWonThisRun` and `stat_voidSeerPlayedThisRun`
  — capital S. Two pre-existing specs threw a `TypeError` on them, and are fixed.
- **The CP cost preview carries the `notation` class**, so the quoted cost is
  abbreviated before it can be compared with the charge. That spec stages plain
  notation for the same reason the market specs do.

**One pre-existing spec was de-flaked on the way.** *"the asteroid-search prize
finishes the scan and yields an asteroid"* demanded a find from a single claim,
but `discoverAsteroid` rolls a **7% miss by design** — so it failed roughly one
run in fourteen. The prize's own contract is that the scan *finishes*, and that
half is now asserted on every one of five claims; the finding half only has to
come good once, which turns a 1-in-14 flake into a 1-in-600,000 one without
weakening the claim.

---

## 🟢 Random Events — `random-events-live.spec.js` (21 specs) and `events-screen-live.spec.js` (10 specs), all passing

**What is different.** The existing file covers the registry, the probability curve
and the history plumbing, largely by setting state and reading a field back. The
new pair plays the run into the state each event needs and then measures what the
event did.

### Every event tested from both sides of its own guard

Each event carries a `canTrigger()` and a `trigger()`, so each is fired twice:

1. **when it cannot occur** — against a run that does not satisfy the guard, and
   nothing must happen: no history entry, no effect, no balance moved;
2. **when it can occur** — after the run has been played into shape, and the bonus
   or penalty is measured.

Both halves are needed, and they fail differently: a guard stuck open fires an
event on a run it has no business touching, a guard stuck shut means the event
never happens at all. On a fresh boot nine events are proven to refuse.

The preconditions are reached by playing: power plants and batteries bought on
their own purchase buttons, rockets sent from the Space Mining pane's dropdown and
**Travel** button and flown by running the real travel timer, the black hole
researched on `#blackHoleResearchButton`.

**One distinction worth its own spec.** `stockLoss` declares `canTrigger: () =>
true`, so it is always *offered* — but its trigger looks for a stock to take and
gives up when the stores are empty, and an event that gives up is not logged. The
guard being open is not the same as the event happening, and a bare run is exactly
where that shows.

**What each effect is measured against**, rather than asserted as a flag:

- a power plant explosion takes exactly one unit, and only from a type the run
  owns; a battery explosion takes the highest tier held;
- science theft takes `ceil(current / 2)`, a breakthrough doubles;
- stock loss hits exactly one stock, in the 40-80% band, and the percentage in the
  log matches the percentage actually taken;
- an antimatter reaction gives back exactly what that rocket had mined, destroys
  the rock and unbuilds the rocket;
- losing the starship clears the ship, all five modules, the fleet and the
  destination;
- a broken-down miner stops **that** rocket dead and no other — measured per
  rocket, off the rock each one is parked on;
- black hole instability multiplies the power by a stored 0.5-1.5 roll and hands
  the original value back on expiry.

**Timer mechanics** are driven, never shortcut: a spec that wants an expiry seeds a
short remainder and lets the per-frame effects timer run it out, which is what puts
the restoration handlers and the history entry under test. Durations are pinned —
30 minutes for the lockdown, 40-50 for endless summer, 15 for the miner and the
supply chain, 15-25 for the black hole — and re-triggering a running effect is
proven to be refused rather than to restart it. The logged duration is the effect's
full advertised length, not the sliver it was wound down to.

**Two traps.** Flying two rockets one after the other leaves the first mining
through the second one's whole journey, and three million milliseconds of game
time is enough to empty a rock — which ends its mining and leaves nothing to
compare against; both journeys are launched before either is flown. And the
antimatter figures are accumulated in fractional ticks, so conservation holds to
floating-point noise rather than to the bit.

### The log and the screen a player reads it on

`events-screen-live.spec.js` asserts nothing against a snapshot function. Every
claim is made against the two tables the Events pane renders on the Help tab, and
the pane is left open while events fire, because `updateTimedEventsPanel()` runs
from the frame loop and the tables are supposed to be live.

What it pins: the localized empty state for both tables; a row appearing *without
the pane being reopened*, carrying the event's localized name, its effect line and
an `mm:ss` countdown that is then watched ticking down on screen; good and bad
events coloured green and red on the same table; the active table ordered by what
ends soonest; an instant event logged with duration "Instant" and the figure it
moved; a finished effect moving from the active table to the completed one with
its full duration; the completed log ordered newest first; and every event in the
catalogue rendering a real name and a real effect line **in all six languages** —
which is the assertion that would catch a row rendering its own localization key.

**A live defect, found and fixed** (known-issues #28): **a supply chain disruption
always cut production by 75%, whatever the modal said.** The trigger rolls
`percentDown` between 60 and 80 and stores it, and both the modal and the Events
screen render that roll — while `getSupplyChainDisruptionMultiplier()` returned a
hardcoded `0.25`. So the player was told -64% and got -75%. The multiplier is now
derived from the stored roll, with the old constant kept as the fallback for
effects restored from a save written before the roll was stored.

This was found only because the penalty was **measured** rather than read off the
effect's own state. A spec that asserted `percentDown` was between 60 and 80 would
have passed against the broken game, because the field it checked was the field
that was right — it was the field nothing downstream read.

---

## 🟢 Space Mining, Weather and Star Data — three new files, 86 specs, all passing

**Four live defects, all fixed at source** (known-issues #31 to #34) — three found
by reading the code while writing the specs, and one, a dead boost sound, found
only by running them. The largest of the three had been sitting in
plain sight since the localisation work: six description labels were being looked
up by ids that no element had carried since `createOptionRow` stopped deriving
them from the visible label text, and one of those lookups was dereferenced
unguarded from the frame loop. That is written up in full in known-issues #31; the
short version is that the rocket Fuel row never updated, the Launch button never
turned green, and several progress readouts had been dead for as long.

### `space-mining/space-mining-live.spec.js`, 44 specs

**What is different.** The area had no spec file at all. The arithmetic of
extraction already lives in `antimatter/antimatter.spec.js` — the complexity
formula, conservation between rock and store, the F-type and Enhanced Mining
multipliers — so this file deliberately covers everything *around* it: the objects
the telescope creates, the two panels that display them, the gesture the player
makes to boost, and the far end of a rocket's journey.

**The survey is tested as a distribution, not a sample.** Rarity, distance,
complexity and antimatter are all rolls, and the *bands* they fall into are the
contract. Each of those specs discovers sixty rocks through the game's own
discovery path and asserts every one of them lands inside its documented band —
Common 700-1200, Uncommon 1200-2000, Rare 2000-4000, Legendary 4000-10000,
complexity an integer 1-6, distance 30,000-570,000 — and that the colour class
each field carries is the one its own percentile implies. A single sample would
pass against a band that had been widened by a digit.

Two properties are asserted that are easy to lose and hard to notice:

- **the colour never oversells the rock.** `generateAsteroidData` demotes a
  green quantity class on Common and Uncommon rocks after computing it, so a
  Common rock can never read as a good haul however high in its own band it fell;
- **the survey is capped.** 150 discoveries leave exactly 100 records, and a rock
  under a drill is never the one culled to make room.

**The panels are read as a player reads them.** The Asteroids pane is asserted row
by row against the records behind it, including the flooring — a player is never
shown a fractional rock — and all four legend columns are clicked, with the
`sort-by`/`no-sort` pair checked on every column each time so that "sorting by
distance" cannot quietly leave two columns claiming to sort. Rocks being mined and
rocks worked out are asserted to be labelled, coloured, dimmed and sorted last.
The Mining pane's SVG is asserted to draw a box per rocket and to label each
rocket's arrow with the rate its rock's complexity implies — `0.004` per tick at
complexity 1, `× 100` for the per-second figure, `×` whatever the star system
contributes — which is the same number the player uses to choose between rocks.

**The boost is a gesture, and it found a fourth defect** (known-issues #34: the
boost sound never played, because `setIsAntimatterBoostActive` started the sound
loop before writing the flag that loop immediately checks). `boostAntimatterRate`
is not called anywhere in the file. The boost is started by dispatching `mousedown` at `#svgRateBarOuter` and
ended by `mouseup` or by `mouseleave`, because those are the three listeners on
`document` that actually decide whether the boost happens, and all three refuse
while `antimatter.rate` is zero — which is its own spec. The doubling is
**measured off the rock** across a hundred thousand milliseconds of driven game
time, boosted against unboosted, rather than read off `getIsAntimatterBoostActive`;
the bar's fill is asserted to double and recolour while held; and the boost sound
loop is asserted to run only while held and to stay silent with sound effects off.

**The journey is flown.** A rocket is sent from its own destination dropdown and
**Travel** button, the flight is asserted to be exactly `distance / speed` long,
and the delta manager is driven until it lands. A rock is then worked dry and the
turn for home is asserted as a *sequence* — the rock reaches exactly zero, the
direction flips, the mining slot clears, a real return timer exists, the boost is
dropped — and the return leg is flown out too, so that `resetRocketForNextJourney`
is under test rather than assumed: empty tank, unlaunched, no destination held
over, ready to travel, timer torn down. Afterwards the spent rock is asserted to
have dropped out of the destination dropdown, as is a rock another rocket has
already claimed.

### `weather/weather-live.spec.js`, 31 specs

**What is different.** The area had no spec file. Weather is a background
simulation, so the temptation is to set `currentStarSystemWeatherEfficiency` and
read it back — which would prove nothing, because the interesting part is the
*draw* and the *consequences*.

**States are reached through the game's own draw.** To land on a state, the file
rewrites that star's weather **probabilities** so only the state under test can be
drawn, then runs the game's own `forceWeatherCycle()`. The efficiencies, symbols
and colour classes are left exactly as the star published them — those are the
contract being tested, and a spec that wrote them would be asserting its own
input. Every spec then waits a beat of real time, because `changeWeather()` arms a
one-second interval and it is that interval, not the draw, which starts the
particles and rolls the precipitation rate.

**The solar penalty is measured, not read.** Ten solar plants are bought through
the plant's own purchase button, the other two plants are switched off so that
`buildings.energy.rate` is pure solar generation, and the grid rate is then read
under each of the four states. The assertion is the absolute figure —
`quantity × 0.2 × efficiency × the O-type multiplier the run reports` — *and* the
ratios between the four, so a broken efficiency table and a broken multiplication
fail differently. Two further specs pin the two ways this is easy to get wrong:

- **applied once per window, not per frame.** `weatherEfficiencyApplied` is a
  latch, and the rate after sixty seconds of driven frames must equal the rate
  after one tick. Without this spec a compounding bug would look like weather
  simply being harsh.
- **plants bought mid-window are rained on too.** `addBuildingPotentialRate`
  applies the multiplier itself for exactly this case; five more plants bought
  during a shower must land at the rainy rate, not the fair-weather one.

And the control: the carbon plant's output is asserted to be identical under a
volcano and a clear sky, so "weather affects power" cannot pass by affecting
everything.

**One trap worth writing down.** Marking a rocket fuelled by pushing
`rocket1FuelledUp` into the fueller array is *not* the same as filling its tank.
`fuelRockets()` runs every frame over the rockets not yet marked fuelled, and if
the tank is empty it puts the Launch button back into its "NN% loaded" state —
`no-interaction`, neither red nor green — which masks the bad-weather gate
entirely. The three launch-hold specs fill the tank through the row's own **Fuel
Rocket** button and run the fuel timer out, which is both more honest and the only
way the assertion means anything.

**Presentation and consequence are separated.** Rain is asserted to run raindrops
and the rain ambience with no lava and no other track; a volcano the mirror image.
The particle setting is turned off mid-shower and the overlay asserted empty and
hidden — while the *weather itself* is asserted to keep running, still collecting
precipitation and still cutting solar, because a display toggle that silently
turned the simulation off would otherwise look identical. Precipitation is read
from the star's own `precipitationType` rather than assumed to be water, because
what falls is a property of the system.

### `star-map/star-data-weather.spec.js`, 11 specs

**What is different.** This is a slice of a red area, not the whole of it: it
covers where a system's weather comes from, and whether looking at the map again
rewrites it. Map rendering, star selection and destination gating remain
uncovered.

A star's weather is decided the first time the star map draws that star.
`generateStarDataAndAddToDataObject` rolls four probabilities, scales them to 100,
takes the most likely as the star's *tendency*, rolls a precipitation compound and
writes the record; `changeWeather()` then draws every weather window for that
system out of exactly that table. So the star data is the **source** of the
weather, and the property that matters most is that it survives being looked at
again — the map is redrawn on every pane open, every mode change and every
completed study.

The file asserts the property rather than the branch: whatever kind of star it is,
a redraw must not change what the star said last time. The sharpest of the three
redraw specs stamps every existing record with a marker the generator does not
write and asserts the marker survives — which fails on the regeneration itself
rather than on two random rolls happening to differ.

**A live defect, found and fixed** (known-issues #32): `generateStarfield` guarded
the interesting-star branch with `checkIfInterestingStarIsInStarDataAlready` but
called `generateStarDataAndAddToDataObject` **unconditionally** in the factory-star
branch. Every draw of the map re-rolled a revealed megastructure star's weather
table and its precipitation compound — so once a player settled one, the forecast
they researched was not the forecast they got, and it changed again each time they
opened the map. The factory-star branch now carries the same guard.

---

## 🟢 Star Map, Star Data and Star Types — the rest of the interstellar shell

Three more files finishing what the weather pass started: the map itself, the
table a run is planned from, and what a star's spectral type is worth.

### `star-map/star-map-live.spec.js` — the field, the modes, the search, the drawings

**The map is a pure function of a constant seed**, and the first spec exists to
keep it that way. `generateStarfield` places all hundred stars with
`getSeededRandomInRange(seed + i, …)` over `STAR_FIELD_SEED = 80`, taking names
from a fresh copy of the name table each call, so the same star is in the same
place on every draw forever. The spec fingerprints every star's id, position and
size, bounces through the Star Data pane three times, and requires the
fingerprint to be identical — a map that quietly re-rolled would move a player's
studied stars around between visits.

**How a star is drawn is a precedence, and it is tested as one.** Miaplacidus
first, then a reported megastructure star, then settled, then in-study-range with
`o-star` for an O-type, then out of range. Each branch has a spec, including the
two negative cases that are easy to lose: an *unreported* megastructure star is
not drawn at all, and Miaplacidus refuses selection outright until the final
milestone — clicking it must leave no destination row behind.

**The four modes are pressed, not set.** Each mode button is clicked by its
localized label and asserted to light itself while dimming the other three.
Distance mode is checked against the published ramp — every tint is a full-red
`rgb(255, …)` triple, and the nearest star keeps more blue than the furthest,
which is the direction the ramp drains. In-range mode is checked by moving the
antimatter on hand across a star's fuel cost and requiring the tint to change.
Studied and in-range are checked to hide the out-of-reach stars and normal to
show them again.

**The search is driven through its own input.** Two characters to open, a
localized "no matches" line, result colouring per star kind, and the mode gate —
the box is live only in normal and distance, and says so in the other two. The
selection ping is asserted to appear on the map and then to clear itself, which is
the half a snapshot test would miss.

**The drawings are checked as geometry, not as presence.** The connection line's
width has to equal the pixel gap between the two stars' centres and its rotation
the bearing between them; the label has to carry the star's real antimatter and AP
cost, coloured by whether the run can afford it; a travelling ship draws a dashed
line with an arrowhead that measurably moves along it as the progress fraction
changes; an orbiting ship draws a circle three star-widths across, centred on the
star it is orbiting.

**Two traps, both worth recording.**

The **Interstellar tab has to be selected, not just the pane**. Several frame-loop
gates test `getCurrentTab()[1].includes('Interstellar')` — the orbit circle is one
— and `checkOrderOfTabs` rearranges the tab bar at runtime, so `#tab5` is not a
reliable handle. The specs select the tab by its `data-name` and assert the
selection took.

**A ship in orbit is still flagged as travelling.** `setStarShipTravelling(true)`
is called in exactly one place and nothing ever sets it back, and that is
load-bearing: `starShipUiChecks` forces the status back to `readyForTravel` on the
next frame whenever the ship is *not* travelling and its modules are all finished.
Staging orbit without the travelling flag is a state the game cannot hold for even
one frame, which is why the orbit spec sets both.

### `star-map/star-data-table.spec.js` — six columns and a colour precedence

Every column is asserted against the record behind it, every one of the six sorts
is pressed and checked (including the compound weather sort: forecast quality
first, then likelihood), and the name-colour precedence is pinned in the order the
code applies it. The sharpest of those is **affordability outranking everything
else**: a megastructure star the run cannot fuel is drawn as unreachable rather
than as a prize, and the spec proves that by moving the antimatter across the fuel
cost and watching the same row change colour.

The settled row is checked to be dimmed, sorted last under every sort, and to have
its planning cells blanked; the unreported megastructure star is checked to be
absent from the table entirely, the same rule the map and the search apply.

**One trap:** the fuel and AP cells carry the `notation` class, so the frame loop
abbreviates them — `5000` renders as `5K`, or `5,000` in plain mode. The specs set
plain notation and strip the separators, and check sort *order* against the
records the sort actually reads. The abbreviations themselves belong to the
notation area.

### `star-types/star-types.spec.js` — three types that do something, four that do not

The game implements exactly three star-type effects, and its own help text
publishes all three: a B-type system adds a flat rate to every *resource*
autobuyer tier (+2/s, +8/s, +25/s, +80/s), an F-type multiplies antimatter
extraction by 1.5, and a settled O-type amplifies one power-plant type eightfold.

The condition differs between them, and that is what most of the file is about. B
and F are properties of *where the run currently is* and vanish on leaving; O is a
property of *what the run owns* and is carried between systems.
`getOTypePowerPlantBoostMultiplierForCurrentSystem` is named as though it were the
former and reads `getSettledStars()`, which is the latter — that matches the help
text ("each one you control"), so it is pinned as designed rather than reported.

**Nothing is asserted as a multiplier.** Every claim is a measurement: resource
throughput off the stores, extraction off the rock, generation off the grid, in
one system and then another.

**A, G, K and M grant nothing, and that is asserted rather than left unsaid.**
Each inert type goes through the same three measurements the live types do and has
to come back at the neutral figure — the alternative to a spec here is a future
bonus being wired to the wrong letter and nobody noticing.

**The measurement trap this file ran into twice.** The frame loop keeps producing
between the driven windows, so *dividing one measured window by another* turns
that shared overhead into an apparent shortfall in the multiplier under test: the
F-type bonus measured 1.467 instead of 1.5, and a four-times-the-autobuyers case
measured 3.75 instead of 4. Worse, subtracting two large windows to isolate a small
bonus puts the answer inside the noise entirely — a tier-1 bonus is a twenty-fifth
of its base rate. Every throughput assertion now compares a window against what the
formula says that window should produce, and the one case that genuinely needs to
separate "added" from "replaced" uses a span ten times longer so the driven ticks
dominate. That is a stronger statement than the ratio was, not a weaker one.

### The live defect this pass found, now fixed at source

[known-issues #35](known-issues.md) — **a star was two different distances away
depending on which code path asked.** `generateStarfield` derived x and y from the
measured size of the container it drew into; the Star Map pane passes a real panel
and everything in `calculationMode` passes a detached `div` whose width and height
are zero, so the planar term collapsed and only z survived. The drawn map decides
whether a star is studied and writes the record the player's fuel and AP come
from, while the calculation path is read by the search colouring, manuscript
placement, the rapid-expansion filter and an achievement gate — so a star could be
in range for one and out of range for the other. It also meant a star's distance
depended on the size of the browser window.

The fix stops deriving simulation coordinates from layout. `x` and `y` are now
generated over a fixed nominal field — `STAR_FIELD_NOMINAL_WIDTH` and
`STAR_FIELD_NOMINAL_HEIGHT`, the shipped panel at a 1280x720 desktop viewport —
and the real container is used only to scale `left`/`top` for placement.
`calculate3DDistance` reads `x`/`y` rather than `left`/`top`, so both callers get
the same figure. Star records are generated once and never regenerated, so saves
already in flight keep the fuel costs they were planned around.

The spec that found it, *“a star is the same distance away whichever code path
asks”*, is what proves the fix: it compares every studied star's recorded distance
against the calculated one and names any that disagree.

---

## 🟢 Rockets & Launch Pad, and 🟢 Megastructures — the two chapters either side of the interstellar shell

Two more files, and both deliberately narrow: each area already had a
neighbouring live suite covering half its ground, so the new work is what those
neighbours do *not* touch.

### `rockets/rockets-live.spec.js` — the machine, not the mining run

`space-mining/space-mining-live.spec.js` already flies rockets: it proves a rocket
parks on the rock it was sent to, that a rock worked dry turns its rocket round,
that the return leg leaves the run's state clean, and that a claimed or spent rock
drops out of the dropdown. None of that is repeated. This file owns **what the
machine costs, what it is called, and what it says while it is working.**

**The pad and the airframes are bought by hand.** `prepareRunForStarshipLaunch`
is deliberately not used, because its chain includes
`buildLaunchPadScannerAndAllRocketsButton` — the very purchase under test. The run
is stocked with money, materials and the ordinary techs, and then the launch pad
is built with its own button, and all seventy-eight rocket parts are fitted one
press at a time.

That is what makes the pricing provable. Each part costs $1,000, 1,000 glass, 700
titanium and 3,000 steel to begin with, and every purchase multiplies **all four**
by `GAME_COST_MULTIPLIER`. A rocket's true cost is therefore a geometric series
over its own part count, and the specs compare what the run actually spent
against that series rather than against a hard-coded total. Rockets differ only
in part count — 12, 17, 22, 27 — but the 1.13 curve turns that into rocket 4
costing over four times rocket 1.

**Purchases are deferred and the specs respect it.** A rocket part calls `gain()`,
which spends nothing: it files the bill with `setItemsToDeduct` and the price rise
with `setItemsToIncreasePrice`, and the frame loop settles both on its next pass.
Every purchase here is followed by real time rather than an immediate read. The
launch pad is the exception — `buildSpaceMiningBuilding` spends on the spot.

**Naming is typed, not set.** The pane's header is a `contenteditable` field with
a twelve-character cap enforced by an `input` listener, and a Rename button beside
it. The specs type into the field, commit with the button *and* with Enter, and
then check the name reached three places: the record, the side-menu row the frame
loop repaints, and the redrawn pane — that last one matters because
`drawTab6Content` selects a rocket's pane by matching the heading against the
rocket's *user* name, so a rename that failed to reach the draw path would open an
empty pane.

**Fuel is a rate.** `handleRocketFuelTick` adds `rate x (deltaMs / 10) x 100` per
driven tick while the grid is up — 0.2 units a millisecond, so 50,000ms fills
rocket 1's 10,000-unit tank. The specs press Fuel and drive the timer: part-full
gives a `no-interaction` Launch button captioned with the percentage, full turns
it green and the row reads *Ready For Launch*, and pulling the grid down stops the
pump dead and says *Requires Power!*.

**The second journey is the point of the reset.** Space Mining proves the state is
clean when a rocket lands. Nothing anywhere proved a landed rocket could be flown
again — so this file refuels it, launches it, picks a different rock and flies it
there.

**Three measurement traps, all the same shape.** The frame loop keeps running
between a driven span and the read that follows it, so any two figures fetched in
separate round trips disagree slightly: the fuel level against the percentage on
the button, the countdown against the timer behind it, the gauge against both.
Each is now read in the *same* `page.evaluate` as the control it is checked
against, reaching into `globalThis.__mods` for the record. Where a value genuinely
cannot be co-read, the assertion allows the one second or one percent the gap can
cost, and says so.

**A fourth trap worth naming: notifications queue.** `showNotification` shows one
entry per classification at a time for its full duration, so the message a spec
raised is routinely sitting behind another one when the action returns. Reading
the container once misses it. There is now an `expectNotification` helper that
polls, and it is not papering over anything — the notification really does appear,
just later.

**A fifth trap: the weather is a roll.** Rain and a volcano both hold a fuelled
rocket on the pad — correctly, and the Weather area proves it — so a run that
happened to roll one left the Launch button reading *Bad Weather!* and every
readiness assertion measuring the wrong hold. The helper that fills a tank now
clears the weather through the game's own debug control first, so the state under
test is set deliberately rather than hoped for.

**One live defect, found and fixed at source.** [known-issues
#36](known-issues.md) — the notation formatter was rewriting the digits inside an
asteroid's *name*. Every description label carries the `notation` class, and
`formatAllNotationElements` rewrites every digit run inside one, so the Travel
row's *"Mining Antimatter at SPC-6154R"* rendered as `SPC-6.1KR` under the shipped
abbreviated notation and `SPC-4,811D` under plain — and a name with a leading zero
lost the character altogether, `SPC-0278T` becoming `SPC-278T`, because
`Number('0278')` is `278`.

The fix skips a digit run that is glued to a letter, which is what separates a
name from a figure; every real figure in a notation element is preceded by a
space, a currency symbol, a tag boundary or the start of the string. Because that
formatter is on the path of every priced, rated and stored figure in the game, the
whole Number Notation area was re-run beside Rockets and still passes 22 of 22 —
including the two sweeps that walk every screen in both modes. The spec that found
it reads the label under *both* notation modes, so a regression prints the mangled
name beside the real one.

### `megastructures/megastructures-live.spec.js` — the whole chapter

`megastructures.spec.js` covers the data and the accessors. This file plays the
chapter end to end, and its structure follows the chapter's own:

**Manuscripts are rolled, not written.** The run studies stars through the game's
own Add Star button — which is `extendStarDataRange`, the same call the Space
Telescope's Study Stars timer makes — and the specs watch the manuscripts arrive.
The first is guaranteed the moment vision reaches five light years, the second at
twenty, the third at thirty-five, the fourth at forty-five, and there is never a
fifth. Each record is checked to be `[star, factoryStar, position, false]`, and
every manuscript star is checked against all four exclusions: never Miaplacidus,
never the system the run is standing in, never one already settled, never an
O-type, and never the same star twice.

This is also why the file does **not** use `prepareRunForStarshipLaunch`: its
chain clicks Add Star five times, which takes vision to exactly five light years
and hands the run its first manuscript before a single spec has run.

**A factory star is a rumour until the manuscript is read.** Settling the
manuscript star is what flips `reported` and registers the star for real, and the
specs prove the sequence rather than asserting the end state. Which structure sits
at that star turns out to be decided at *conquest* rather than at reveal —
`activateFactoryStar` can only stamp a star that already has a record, and
`ensureFactoryStarMegaStructureAssigned` fills the gap when the run arrives. That
is recorded as behaviour rather than reported as a bug, because both routes end at
the same four names.

**Conquest is driven, the battle is not re-fought.** Factory stars are hard mode
by design — `isHardModeDestinationStar` forces life, an aggressive/mechanized/
armored trait set and a real fleet — so who wins is a roll, and
`battle/battle-live.spec.js` already fights a real engagement to a decision. This
file drives `settleSystemAfterBattle`, the single handler all three access points
funnel into once the fighting is over, and then plays everything after that moment
for real. The AP spec measures the doubling that a factory star adds on top of the
doubling a won battle already pays: two times base against four.

One thing that shaped the helper: `settleSystemAfterBattle` **awaits real
confirmation modals**, so awaiting its promise from inside `page.evaluate` would
block the very round trip that has to click Confirm. The call is fired rather than
awaited, a flag is set on completion, and the modals are cleared from outside.

**The stages are bought on the Technology pane, and only from inside the system.**
The five stage rows are *built* in `drawTab3Content`'s Research branch but appended
to the **Technology** pane's container — opening Research shows the science
upgrades and none of the stages, which cost this file a debugging pass. And they
appear only when `getCurrentRunIsMegaStructureRun()` is set *and* the current
system's `factoryStar` matches: holding a structure is not enough, the run has to
be standing in it. Both halves have their own spec, including that a Plasma Forge
run is offered five Plasma Forge rows and no Dyson Sphere row at all.

**Every bonus is measured off the thing it changes.**

| Structure | What the specs measure |
|---|---|
| Dyson Sphere | battery capacities and the energy store before and after; the three power plants' rate, purchased rate and ceiling; `infinitePower` with the grid deliberately switched off first |
| Plasma Forge | every resource autobuyer tier, and separately the hydrogen that actually lands in the store over a driven window |
| Galactic Memory Archive | total storage summed across every resource and compound, stage by stage |
| Celestial Processing Core | the three measurements the others move, proved *unmoved* |

The Forge and the Archive are where "more conquered, better bonuses" is pinned:
their stages compound rather than replace, so the specs carry a running expectation
through the chain — x1.25, then x1.5 on top, then x1.75, then x2, arriving at
6.5625 times the rate a run starts with. The Archive does the same additively.
Both skip `solar`, which is generation rather than production, and that exclusion
is asserted rather than assumed.

**The pane is checked as a picture.** The diagram's five boxes are read image by
image: a structure switches to its Active art when *its own* stage 3 is taken and
not before, the force field is indexed `ForceField0` through `ForceField4` by how
many are disconnected, the home system only lights at four, and every image is
checked to come from the folder of the theme the player has chosen — and to
re-swap when the theme changes. The table is read cell by cell: red until earned,
green afterwards, name cells following possession rather than research, and a
structure finished outright getting its whole row tinted.

**Miaplacidus is approached and not entered.** Three structures leaves the home
star drawn `home-star`; the fourth turns it `home-star-accessible` and selecting it
produces a real destination row. The journey is deliberately not taken — arriving
plays the end-credits cinematic, which blocks interaction permanently by design.

---

## 🟢 Achievements — four files, 33 specs, all passing

**What is different.** The old file had nine specs. Eight of them were about
`collect50Hydrogen`: it fired at fifty, it did not pay twice, its notification
was not a raw key. The other sixty-nine achievements were covered by one spec
that checked they all had an `id` and a `gives` block. Nothing anywhere asserted
that an achievement's *reward* was the reward its data promised.

The area is now four files with distinct jobs.

### `achievement-catalogue.spec.js` — the whole catalogue, condition by condition

Walks all seventy. For each it establishes the real condition the game's own code
establishes when the player earns it, lets `checkForAchievements()` — the exact
entry point `gameLoop` calls every frame — grant it, and then audits the reward
against the arithmetic `addAchievementBonus` is supposed to perform:

| `gives1` | Asserted |
|---|---|
| `cash` / `antimatter` / `ascendencyPoints` | the balance rose by exactly `floor(before + quantity)` |
| `compound` | the named compound rose by the quantity, clamped at its own cap |
| `multiplier` + `allResources` | every resource's four tier rates scaled, `solar` untouched |
| `multiplierPermanent` + `allResources` | the same, and the permanent multiplier advanced by the quantity |
| `…` + `createCostCompounds` | every recipe ratio rescaled, at least one genuinely cheaper, and the dropdown recipe text rebuilt to match |
| `multiplier` + `cash` | every resource *and* compound sale value scaled |
| `doubleAll…ToStorageCap` | every stock doubled, clamped at its cap |
| `rewardString` | nothing in the economy moved at all |

Three things about its shape are worth knowing before editing it.

- **The order of the catalogue is load-bearing.** `checkForAchievements()`
  re-tests every inactive achievement on every call, so a stage satisfying more
  than one condition grants several at once and the reward measurement stops
  being about any of them. Threshold families ascend, and cash and stock
  thresholds come first because fifteen later rewards pay cash and two double
  every stock. The sweep *asserts* that held rather than assuming it: any step
  that turns on more than one achievement is reported as an ordering failure.
- **Each achievement is measured inside one synchronous evaluation.** `gameLoop`
  moves cash, stock and rates every frame, so a reward measured across three
  round trips is a measurement of production. Stage, snapshot, check, snapshot —
  all in one block the frame loop cannot interleave with.
- **Two of the seventy are staged outside that block**, because `runNumber` has
  no exported setter and the variable debugger is the game's own way in. Driving
  that editor takes about a second of real time and the frame loop grants the
  achievement while it is still being driven — so those two capture their
  baseline *before* the debugger opens, or the reward would be measured against a
  board that already contains it. That was the first thing this file found about
  itself, and it is why the phase argument exists.

**A guard against passing vacuously.** A multiplier reward applied to a board of
zeroes satisfies every `0 * 1.1 === 0` check while nothing has happened, so the
sweep also requires that at least one rate, sale value or recipe ratio genuinely
moved.

### `achievements-live.spec.js` — earned by playing, granted by the frame loop

Never calls `checkForAchievements()` at all. It buys a tier 1 hydrogen autobuyer
and waits for *real extraction* to carry the stock past fifty; buys a power plant
through `button.building-purchase-button`; researches Knowledge Sharing from its
row; and cycles all nine themes through the Settings dropdown, asserting after
each of the first eight that `tryAllThemes` has **not** fired. What is under test
is that `gameLoop` notices — which no spec that calls the checker itself can
show.

**What it found.** `grantAllTechsButton` deliberately skips the megastructure
techs, so it cannot earn `researchAllTechnologies`, whose checker requires every
key in `techs`. The first draft asserted it did, and failed. That is the debug
button's design rather than a defect, and the spec now asserts the more
interesting thing: the ordinary tree earns the other three tech achievements and
leaves "all technologies" correctly outstanding — with the outstanding list
asserted non-empty, so the claim cannot go vacuous.

### `achievements-rebirth.spec.js` — what survives, over two rebirths

Takes two rebirths through the Rebirth pane's own button and confirmation modal,
having earned the whole catalogue before each, and audits the `resetOnRebirth`
split *read from the game* rather than hard-coded. Two rebirths rather than one,
because a reset that only spared the permanent achievements on the first pass
would pass a one-rebirth test and still erase a player's record on their third
run.

It also pins the design invariant the reset depends on, which nothing had stated
anywhere: **every achievement paying a per-run `multiplier` is
`resetOnRebirth: true`, and every `multiplierPermanent` is `false`.** A per-run
multiplier acts on rates the reset throws away, so its achievement has to be
re-earnable; a permanent one is re-applied to the new board by
`addPermanentResourcesModifiersBackIn()`, so its achievement must never be
re-earnable or the player compounds it. An achievement added on the wrong side of
that line silently either loses a permanent bonus or hands one out twice.

The permanent multipliers are then followed *through* a rebirth: earned at
exactly 1.5 (1 + 0.2 from See All News Tickers + 0.3 from Rebirth) and 0.8 for
compounds, carried across unchanged, and — the part that matters — actually
applied to the rebuilt board rather than merely remembered.

The three achievements `autoGrantAchievementsOnRebirth()` hands straight back on
a run with infinite power are accounted for explicitly, because they are
`resetOnRebirth: true` and are cleared and re-earned within the same rebirth. A
naive "everything resettable is off afterwards" check reports that as a defect.

### `achievements-pane.spec.js` — the grid, the artwork and the tooltips

The only place an achievement is *visible*. Seventy tiles, each asserted into its
own grid cell against `achievementPositionDataLinker` — two sharing a cell means
one is drawn underneath the other and can never be hovered, the same class of
defect as known-issues #15. All **630** artwork files (nine themes × seventy) are
requested over HTTP and required to answer 200, with the URLs asked of the game
rather than assembled by the spec, so a change to the naming scheme is caught
instead of silently mirrored. The theme is then changed through the Settings
dropdown and the grid required to repaint from the new folder.

The tooltips are hovered for real. One spec asserts all four things a tooltip
promises — the description, the reward line with the currency symbol, the
rebirth policy and the status — and another earns the achievement *while the
pointer is still on the tile* and requires the status to flip from "not achieved"
to "achieved" without the pane being reopened, which is what
`refreshAchievementTooltipDescriptions()` running every frame is for.

**What it found.** `setupAchievementTooltip()` was called unconditionally every
time the pane was drawn, and it appended a fresh element and bound three more
document-level listeners each time. Three extra visits left four elements sharing
the id `achievement-tooltip`, and document listeners up 163 against a control of
149 for the same number of redraws of another tab 9 pane. That is known-issues
**#37**, now fixed at source with a one-line idempotence guard — safe because the
handlers already bound close over the element that stays in the document, and
because nothing anywhere removes it: `achievement-tooltip` appears in exactly two
places in the codebase, both inside that function.

### Two things about notification text

Both cost a debugging pass and are worth writing down.

- **An achievement notification is HTML.** It is written with `<br>` separators
  and rendered with `innerHTML`, so the raw string sitting in the queue and the
  `textContent` of the rendered element are not the same characters — and `<br>`
  contributes **no** whitespace, so `ACHIEVEMENT:<br>You have…` reads back as
  `ACHIEVEMENT:You have…`. Comparisons strip tags *without* substituting a space
  and then drop whitespace entirely, so one expectation matches either.
- **One notification per burst does not queue.** With an empty tray
  `showNotification` shifts the message straight back out and renders it, so a
  synchronous read of the queue finds every message except that one. The sweep
  checks the queue first and the tray second.

---

## 🟢 Fleet Hangar, Diplomacy and Colonisation — the interstellar endgame, played end to end

Three new files, 36 specs, all passing:
`fleet-hangar/fleet-hangar-live.spec.js` (15), `diplomacy/diplomacy-journey.spec.js` (17),
`colonise/colonise-live.spec.js` (4). Each area's original file stays: those cover the
data shapes and the buff maths cheaply, and the new files cover the wiring.

**What is different.** The three areas are one continuous journey in the game, and
they are now tested as one: build the hangar, buy the ships, fly to a star, scan it
three quarters of the way there, talk to whoever is living in it, and — if the talking
fails — take it, settle it and rebirth into it.

### Fleet Hangar — the gate, the bill and the roster

The gate is the headline. The spec finishes the three *other* mandatory starship
modules and leaves `ssFleetHangar` alone, then asserts that the Fleet Hangar row is
still hidden and no build row exists anywhere on the page; finishing the hangar is
what makes `checkIfStarShipBuilt()` conclude the ship exists and the pane appear.
That is a claim about the hangar specifically, which "build the ship and check the
pane opens" never was.

Every class is then bought through its own Build button and checked twice: the cash
and all three materials that left the stores match the advertised bill to the unit,
and the next one is dearer by `GAME_COST_MULTIPLIER` in every line. Two details make
those measurements possible at all, and both are lessons the starship pass learned:

- **Purchases must be a frame apart.** `gain()` only queues a bill, and the queue
  holds one entry per resource — so three clicks in one frame are charged once.
  There is a spec whose whole job is that three bought in a row cost three prices.
- **Production has to be silenced first.** The autobuyers are emptied *and* the
  weather is forced sunny through the debug menu, because titanium is a possible
  precipitation compound and is a bill line for every ship class.

The envoy cap is asserted as what it is: a CSS gate. Nothing in `gain()` enforces
`maxCanBuild`; the frame loop puts `red-disabled-text` on the button and its
`pointer-events: none` is the whole mechanism. The spec reads the class and the
computed `pointer-events` rather than dispatching a second click, which would bypass
the gate and buy a second envoy.

### Diplomacy — the journey, and a sweep over every outcome

The journey half flies a real starship. It launches through the star map, advances
the game's own travel timer to 40% and asserts the scan control is hidden, crosses
`STELLAR_SCANNER_RANGE` and asserts it is offered, and scans. It then does the flight
again without the stellar scanner module to show the same scan reading `???` where
the life signs should be — which is the distinction the "conquered without scanning"
achievement is keyed on.

The conversation half is written as **sweeps**. Who lives at a star and how a
conversation goes are both rolled, so a spec that expected one outcome from one press
would fail whenever the dice went the other way. Instead each sweep repeats a real
button press until every documented outcome for that button has been seen, and
asserts the consequences of whichever outcome came up on *every* iteration — the
halved fleet of a scared defender, the 10% defense bolster of an insult, the
impression band each attitude names. A sweep that never reaches an outcome fails
naming the one it missed.

Two live defects fell out of this, both fixed at source:

1. **The vassalize gate compared a trait array to a trait name** (known-issues #38),
   so its "not an aggressive people" clause had never been evaluated and aggressive
   races could be vassalized.
2. **Taking offence at a passive approach did not end their patience**
   (known-issues #39): the branch wrote zero and the unconditional tail below it
   overwrote the zero, so the one reply meant to close the conversation left the
   system willing to keep talking.

A third finding was left alone deliberately and is recorded in the spec rather than
in known-issues: re-entering the Colonise pane during a war runs `setWarUI` (which
clears `diplomacyPossible`) and then `calculateModifiedAttitude` (which recomputes it
and sets it back), so the flag is stale for a returning player. It is inert — the row
it would enable is hidden by the same `setWarUI` call — so the spec pins the row
rather than the flag.

### Colonisation — a battle won, and everything downstream of it

`battle-live.spec.js` fights a randomly-composed defender and asserts only what holds
for either outcome. These specs need a *win* to have anything to follow, so they
choose the engagement: the destination is rolled until its garrison is small, trimmed
to a dozen ships if it is not, and the debug scenario's hundred and twenty go up
against it. The battle is entirely real — same canvas, same frame loop, same Attack
button — only the matchup is chosen, exactly as a player picking a soft target does.

What the win is then followed through:

- **The achievements are read as granted, not flagged.** The flag array is a queue
  the frame loop empties as it awards, so a flag assertion passes or fails on timing.
  A hive-mind defender is rolled separately to show `conquerHiveMindEnemy` is added
  on top of `conquerEnemy`.
- **The payment is checked in both halves.** A conquest pays twice the star's own
  ascendency points, *plus* whatever the achievements it unlocked pay — `conquerEnemy`
  carries an AP reward of its own. The total is the only observable, so both halves
  are computed; asserting the settlement alone silently absorbed the achievement's
  contribution, which is how the first version of the spec went wrong. Factory stars
  and O-types are excluded when picking the destination, because both double the
  payout again and pull the megastructure branch in with them.
- **The settled list does not move on a victory.** Both callers of `setSettledStars`
  are inside `rebirth()`. The spec asserts the list is unchanged after the win and
  grows by exactly the conquered system after the rebirth.
- **The rebirth is driven through its real button**, confirmation modal included, and
  the run afterwards is checked all the way out: the conquered system is the current
  one, ascendency points carried over, the conquest is worth one galactic point, and
  the `rebirth` achievement is granted.
- **The star map is checked, not assumed.** The system the run came from is drawn
  with the `settled-star` class and a `settledStar…` id, its hover label carries the
  localized SETTLED tag, and the conquered system now carries `current-star`.

One thing the colonise specs cannot shortcut: `rebirth()` refuses to run without a
destination record carrying a `starCode`, and only the scan writes that field. A run
that pointed `destinationStar` at a name without flying there settles happily and
then fails to rebirth — which is precisely the half of the flow these specs exist to
follow, so they fly.

---

## The shared navigation helper

All three of these walk the same structure, so the walk was factored into
`tests/e2e/_harness/navigation.mjs` rather than written three times. It exposes
`listOptionRows`, `openOptionRow`, `paneRender` and `walkAllPanes`, and three
details about the shell drive its shape:

- **The class token is the identity, not the id.** Several rows have no id at all
  — the three settings panes are `tab9.option1` … `tab9.option3` — and
  `querySelector('[class~="tab9.option1"]')` is the only selector that will not
  also match `option10` upwards.
- **Rows are hidden by unlock state, and the walk reveals them.** That is a test
  affordance, not a claim about unlocks: `listOptionRows` reports `hidden` so a
  spec can assert unlock rules explicitly, which is what the ui-navigation sweep
  does.
- **Clicks are dispatched rather than driven through the mouse**, because rows sit
  under overlays on several tabs. That bypasses CSS gating, which is safe here —
  none of these rows are gated on affordability — but it is the reason a spec that
  wants to test a gate must assert the class rather than dispatch a click.

---

## 🟢 Ascendency Perks — `ascendency-perks-live.spec.js`, 15 specs, all passing

**What is different.** The old file settled purchases by hand. Its "a purchase
deducts exactly the advertised cost" test read `baseCostAp`, subtracted it from
the balance itself, wrote `boughtYet` itself, and then asserted on the two values
it had just written — inside a single `withMods` block. It would have passed with
`purchaseBuff` deleted from the game. Six cases in that shape have been removed
rather than kept alongside the new ones.

The new file opens **tab 7 → Ascendency Perks** and plays it:

- **AP is earned through the debug menu's own grant button**, not written into the
  data object.
- **Perks are bought by pressing their Buy buttons**, and the balance is checked
  to the point after each press.
- **"How many can I buy" is answered by buying them.** One spec walks the pane
  cheapest-first until nothing is affordable, asserting each purchase charges
  exactly the price the row was quoting and that the balance never goes negative;
  another compares the frame loop's own green/red classification, perk by perk,
  against the affordability rule at three balances the run genuinely passes
  through.
- **Price escalation is walked up the ladder.** Efficient Storage is bought to its
  cap — 10, 20, 40 AP — with the quoted price, the charged price and
  `baseCost × multiple^boughtYet` held equal at each step, then proved to stay
  capped however much AP is thrown at it afterwards.
- **Effects are measured, not read.** Smart Auto Buyers is checked by timing a
  resource's accrual before and after the purchase; Optimized Power Grids by
  timing energy accrual from a plant that is actually burning fuel. Reading
  `effectCategoryMagnitude` back would pass with the whole effect chain deleted.
- **The carry-over is a real rebirth.** A basket of six perks — a rate multiplier,
  a grid multiplier, a tech unlock, a flag, a starting-stock grant and a rebuyable
  bought twice — is bought, then the Rebirth button is pressed and its
  confirmation answered, and each perk is checked to have been re-applied to the
  new run rather than merely remembered.

**Two traps this area sets, both now documented in the spec.**

*The first spend pays an achievement.* `spendAP` grants a permanent 1.1× on every
resource, a frame or two after the purchase. Timing throughput across a *first*
purchase therefore measures the perk and the achievement together, which is how a
1.5× perk reads as 1.65×. The effect specs bank that achievement up front so the
baseline already carries it.

*The reset applies two multipliers, not one.* After a rebirth an autobuyer's rate
is `pristine × perk × permanentResourceMultiplier`, because
`addPermanentBuffsBackInAfterRebirth()` and `addPermanentResourcesModifiersBackIn()`
both run. Comparing against the perk alone reads 1.95× and looks like compounding.

**Refusals are asserted as the class, never as a click.** Affordability and the
purchase cap are both enforced by `red-disabled-text` and its
`pointer-events: none`, which is by design in this game. A dispatched click goes
straight through that gate and *will* buy a second copy of a one-shot perk — so
the spec asserts the gate is up and the computed `pointer-events` is `none`,
rather than clicking and asserting nothing happened.

What is left in `ascendency.spec.js` is the part with no UI to drive: catalogue
shape, copy resolving in every shipped language, and the two structural rules that
let perks survive a rebirth at all.

---

## 🟢 Offline Gains — `offline-gains/offline-gains.spec.js`, 18 specs, all passing

A new area rather than an upgrade. `offlineGains()` had no coverage at all,
despite being the one function in the game that writes to every store at once.

**How it is driven.** Both of the function's triggers are exercised through the
real thing. The load path exports a genuine save through the **Saving / Loading**
pane, rewrites its `timeStamp` to the moment the player is supposed to have left,
and imports it back through the **Import** button. The focus path dispatches the
window's own `blur` and `focus` events — the same ones the browser fires when a
player alt-tabs — and backdates the departure stamp between them.

Rewriting the timestamp is the one concession, and it is not a workaround: the
save file *is* this feature's input, and a save that says it was written an hour
ago is exactly what an hour offline looks like. Everything downstream — the
arithmetic, the caps, the timers, the notification — is the shipped path.

A few specs also state a production rate in the exported payload. That is forced:
the frame loop recomputes every aggregate rate each tick, so a rate staged in the
source run is zero again by the time the save is taken. Where a rate can be
*earned* instead — the focus specs stage a tier-1 autobuyer and read back the rate
the game settles on — it is.

**What is pinned.** The formula
`floor(rate × TIMER_RATE_RATIO × seconds × OFFLINE_GAINS_RATE)` at the shipped
0.334; the floor, so a trickle pays nothing; the storage cap; fuel already burned
netted off the rate first; resources, compounds, research, rip telemetry, battery
energy and mined antimatter all paid on the same formula; energy paid only once a
battery exists; countdown timers losing the whole time away at 1:1, because time
passing is not a gain and must not be nerfed; the notification on load and the
silence on focus; and paying once rather than twice for one absence.

**Two live defects found, both fixed at source rather than worked around.**
Known-issues #43: rocket fuel escaped the nerf entirely, because the fuel was
accumulated one step *after* `nerfOfflineGains` had already walked the zeroed
`rocket1..4` placeholders — an hour of fuelling paid 18000 where every other gain
in the same payment paid 6012. Known-issues #44: `startGame()` seeded the
departure stamp with `getGameStartTime().toISOString`, missing both the call
parentheses and the fact that the getter returns a `Date.now()` number, so the
stamp stayed `undefined` and a first focus on a never-saved run put `NaN` into the
play-time clock — which is then captured into every save. Resource quantities
escaped that one only because `setResourceDataObject` refuses non-finite writes.

---

## The general rule this establishes

Drive the game's own buttons, panes and debug menu. Reserve direct `withMods`
calls for two jobs: staging preconditions, and reading state back to assert on.
Where a behaviour sits behind a long timer, drive the timer — seed a short
remainder and let the frame loop run it — rather than calling the completion
handler directly.

Function-level specs are not worthless and do not all need deleting; they are
cheap and they catch data-shape regressions. But an area whose specs are *only*
function-level should not be called green, because the integration is exactly
what is untested.

---

_Companion documents: [known-issues.md](known-issues.md) for the defects this
work found, [coverage-report.md](coverage-report.md) for per-area status, and
[`tests/e2e/README.md`](../e2e/README.md) for the conventions._
