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
