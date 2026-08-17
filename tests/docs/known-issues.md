# Known Issues Found by the E2E Suite

Live defects discovered while building the test suite. Each is reproducible.
Entries marked ✅ FIXED have been resolved and carry a regression spec; the rest
are worked around in the harness so they do not mask unrelated failures.

---

## 1. Discovering an asteroid permanently freezes the game on run 1

**Severity: critical — silent, unrecoverable freeze during normal play.**

### Reproduction

1. Start a new game (run 1, no rebirth has ever happened).
2. Discover your first asteroid — in normal play via the Space Telescope, or
   instantly via the debug menu's **Add 10 Asteroids**.
3. The game freezes. No error is shown. The UI stops updating entirely and only a
   page reload recovers it.

The debug menu's own **Prepare run for Starship Launch** also triggers this,
because it clicks *Add 10 Asteroids* as part of its chain.

### Cause

```
TypeError: Cannot read properties of undefined (reading 'max')
    at addAchievementBonus   (achievements.js:233)
    at grantAchievement      (achievements.js:175)
    at achievementDiscoverAsteroid (achievements.js:413)
    at checkForAchievements  (achievements.js:96)
    at gameLoop              (game.js:2240)
```

Three things combine:

1. **`compoundCreateDropdownRecipeText` is never initialised on run 1.**
   It is declared as an *arrow function* at `constantsAndGlobalVars.js:227` and is
   only replaced with a real object at `constantsAndGlobalVars.js:1517`, inside
   `resetAllVariablesOnRebirth()` — which is only called from `rebirth()`
   (`game.js:15147`). Before a first rebirth it is still a function, so
   `getCompoundCreateDropdownRecipeText(key)` returns `undefined`.

2. **`addAchievementBonus` dereferences it unguarded.** The `discoverAsteroid`
   achievement gives `{ gives1: 'multiplier', type: 'createCostCompounds' }`, which
   enters the compound branch at `achievements.js:229-235` and does
   `originalCompoundText[key]` with no null check.

3. **`gameLoop` has no restart path.** `requestAnimationFrame(gameLoop)` sits at the
   *end* of the loop body (`game.js:2380`), so any throw skips it. `gameLoop` is
   `async` and nothing awaits it, so the rejection surfaces only as an unhandled
   promise rejection — the game just stops.

### Suggested fixes

Any one of these stops the freeze; doing all three is better:

- **Guard the dereference** (smallest fix):
  ```js
  const originalCompoundText = getCompoundCreateDropdownRecipeText(compoundKey) ?? {};
  ```
- **Initialise `compoundCreateDropdownRecipeText` at new-game start**, not only on
  rebirth. Right now a brand-new run has a function where an object is expected,
  which is a latent hazard for every other consumer — including
  `drawTab4Content.js:48`, which does
  `getCompoundCreateDropdownRecipeText('diesel').max.text` unguarded.
- **Make the frame loop crash-resistant**: wrap the body in `try/finally` and move
  `requestAnimationFrame(gameLoop)` outside the `gameState` check, so a single bad
  frame cannot end the game permanently.

### Related

`addAchievementBonus` also iterates `getResourceDataObject('compounds')` with a
`for...in`, which includes the `version` key alongside real compounds.

### Harness workaround

`GameHarness.ensureCompoundRecipeTextInitialised()` seeds the structure before any
scenario setup runs. Remove it once this is fixed, and add a regression spec:

```js
test('discovering an asteroid does not stop the frame loop', async ({ game }) => {
  await game.boot();
  await game.debugClick('add10AsteroidsButton');
  const a = await game.withMods((m) => m.cg.getGameActiveCountTime());
  await game.page.waitForTimeout(1000);
  const b = await game.withMods((m) => m.cg.getGameActiveCountTime());
  expect(JSON.stringify(b)).not.toBe(JSON.stringify(a));
  expect(game.significantErrors()).toEqual([]);
});
```

---

## 2. `setSettledStars()` is an unguarded push

**Severity: low — latent.**

`constantsAndGlobalVars.js:5854` is simply `settledStars.push(value)`. It does not
deduplicate and does not normalise case, while the gating logic elsewhere compares
lowercase names and galactic points are derived from `settledStars.length`.

Callers currently lowercase before calling (`game.js:15136`), so this is not a live
bug — but a single caller that forgets would silently inflate galactic points and
AP with no validation to catch it. Worth normalising and deduplicating inside the
setter.

The colonise specs assert the invariants that must hold on the real list rather
than on the setter, so they will keep passing if this is tightened.

---

## 3. Every frame-loop tab gate breaks outside English — ✅ FIXED

**Severity was: critical — large parts of the UI stopped updating in four of the
five shipped languages.**

### Reproduction

1. Start a game and switch the language to anything but English.
2. Open **Compounds → Water** and look at the *Enlarge Reservoir* cost row.
3. The row keeps whatever the initial draw wrote — an unformatted price, the
   secondary Concrete cost missing entirely, and affordability colouring frozen.
   In English the same row reads `999.9M Water, 300.0M Concrete` and updates
   every frame.

### Cause

`setCurrentTab` stores the tab's **rendered text**:

```js
// ui.js:10521
setCurrentTab([dynamicIndex, document.getElementById('tab' + dynamicIndex).textContent]);
```

`localizeTabLabels()` and `showTabsUponUnlock()` (`ui.js:9489`, `ui.js:9513`)
both overwrite that text with `localize('tabHeader…')`, so from the first
language switch onwards `getCurrentTab()[1]` holds a translated string.

At least 19 call sites then gate behaviour on the **English** name:

```js
game.js:8054   if (getCurrentTab()[1].includes('Compounds'))       // compound cost/sell/create checks
game.js:6654   else if (getCurrentTab()[1].includes('Compounds'))
game.js:6644   if (getCurrentTab()[1].includes('Resources'))
game.js:4369   if (getCurrentTab()[1].includes('Energy'))
game.js:2304   if (… && getCurrentTab()[1].includes('Space Mining'))
game.js:4525   if (… && getCurrentTab()[1].includes('Interstellar'))
game.js:8570   if (getCurrentTab()[1].includes('Galactic') && …)
…
```

Every one of those is false in Spanish, German, Italian and French, so the
corresponding per-frame work — price formatting, affordability classes, star map
updates, market and casino refreshes — silently stops.

There is a second-order effect: `getCurrentTab()` is only written on a tab
*click*, while `relocalizeAll()` rewrites the tab labels immediately. The stored
name therefore lags one language behind, which is why the value observed during a
sweep is often the *previous* language's translation.

### Suggested fix

Store the canonical name, which the DOM already carries and which
`localizeTabLabels()` uses as its lookup key:

```js
setCurrentTab([dynamicIndex, tab.getAttribute('data-name') ?? tab.textContent]);
```

`highlightActiveTab(tab.textContent)` on the next line legitimately wants the
rendered text and should be left alone. After the change, audit the 19 gates for
any that were relying on the localized value.

### Resolution

Fixed in `ui.js`: the tab click handler now identifies the tab by its canonical
`data-name`, passing `???` through unchanged so `manageTabSpecificUi` keeps its
locked-tab marker. `highlightActiveTab` still receives the rendered text, which
is what it compares against.

Two symptoms went with it, both reported from play:

- **`[object Object]` on the Compounds → Water storage row.** This had a second,
  independent cause: `getAllDynamicDescriptionElements()` in `game.js` had a
  misplaced closing parenthesis —
  `getResourceDataObject('compounds', [name, 'storageCapacity'] - 1)` rather than
  `getResourceDataObject('compounds', [name, 'storageCapacity']) - 1`. The array
  minus one is `NaN`, `NaN` is falsy, so the sub-key walk was skipped and the
  whole compounds object came back as the price. English never showed it because
  the frame loop overwrote the row a moment later — which is precisely what this
  gate had stopped doing everywhere else. Both are fixed.
- **`undefined` on a tab's intro page.** The first time a tab is opened,
  `updateContent(..., 'intro')` looks the tab up in `headerDescriptions` and in
  the ASCII-art table, both keyed by the English name. Outside English both
  missed, and assigning an undefined lookup to `innerHTML` renders the literal
  word "undefined" — for the description *and* the artwork, on every tab. The
  nine tab names were added to `headingToLocalizationKey` so the heading is still
  displayed translated, and both lookups now fall back to `''`.

Regression specs: `tests/e2e/localization/tab-intro.spec.js` (identity, the `???`
marker, the rendered label) and the secondary-cost assertion in
`compound-reverse-lookup.spec.js`, now widened to all five languages.

---

## 4. `analytics.js` uses localStorage unguarded, so boot dies without it

**Severity: high — the game does not start in private browsing.**

### Reproduction

Make `localStorage` throw (private browsing, a locked-down Electron partition, or
a Chromium profile with site data blocked) and load the game. Boot never reaches
the pioneer prompt; the page errors with the storage exception.

### Cause

`analytics.js` reads and writes storage with no try/catch in `getOrCreateId`
(line 65), `loadEnabledFromStorage` (74), `persistEnabledToStorage` (82),
`loadQueueFromStorage` (88), `persistQueueToStorage` (94) and `setSessionId`
(107). `ui.js:385` imports and initialises analytics during boot, so the first
throw happens before the UI is built.

`localization.js` already does this correctly — `readStoredLanguage()` and
`persistLanguage()` both swallow the exception and degrade to a non-persisted
preference. The same treatment applied to `analytics.js` fixes it.

### Harness workaround

`tests/e2e/localization/language-resolution.spec.js` breaks storage for the
`cosmicForgeLanguage` key only, so it can assert localization's own graceful
degradation without tripping over this. Once analytics is guarded, that spec can
disable storage wholesale.

---

## 5. `relocalizeAll()` throws when no pane has been opened yet — ✅ FIXED

**Severity was: medium — latent; not reachable through the Settings selector.**

### Reproduction

On a freshly booted game, before clicking any side-menu pane, call
`relocalizeAll('de')` (this is what the debug panel's language switcher does).

```
TypeError: Cannot read properties of null (reading 'toLowerCase')
    at drawTab1Content (drawTab1Content.js:8)
    at relocalizeAll  (ui.js:14808)
```

### Cause

`getCurrentOptionPane()` is `null` until the player opens their first pane
(`constantsAndGlobalVars.js:585`). `relocalizeAll` guards its own use of it
(`getCurrentOptionPane?.() ?? ''`, `ui.js:14775`) but then hands control to
`drawTabNContent()`, and all eight of those start with an unguarded
`getCurrentOptionPane().toLowerCase()` — `drawTab1Content.js:8`,
`drawTab2Content.js:9`, `drawTab3Content.js:10`, `drawTab4Content.js:22`,
`drawTab5Content.js:34`, `drawTab6Content.js:25`, `drawTab7Content.js:89`,
`drawTab8Content.js:77`.

The normal tab-click path always sets a pane first, so only `relocalizeAll` can
reach the null. The Settings selector is itself inside a pane (`game options`),
which is why players cannot hit it today — but the debug switcher can, and the
throw is swallowed by the click handler, leaving the redraw half-applied.

### Resolution

Fixed: all eight `drawTabNContent()` functions now read
`(getCurrentOptionPane() ?? '').toLowerCase()`. The specs no longer need to open
a pane before calling `relocalizeAll`, though most still do because that is what
a real language change looks like.

---

## 6. Category headers relocalize by text matching and get permanently stranded — ✅ FIXED

**Severity was: medium — visible stale text on the Resources tab.**

### Reproduction

1. Start in English, open **Resources**.
2. Switch to German. Headers correctly become `Gase` / `Flüssigkeiten` /
   `Feststoffe`.
3. Switch back to English. `Gase` and `Feststoffe` return, but the liquids header
   stays `Flüssigkeiten` — for the rest of the session, in every language.

Switching to French strands all three: `Gaz`, `Liquides` and `Solides` never
change again.

### Cause

`initialiseStaticButtonLabels()` (`ui.js:1773-1783`) relocalizes these three
headers by comparing their **current text** against a hardcoded list of forms,
rather than remembering which key each element came from:

```js
if (text === 'Gases' || text === 'Gas' || text === 'Gase') { … }
else if (text === 'Liquids' || text === 'Liquidi' || text === 'Líquidos') { … }
else if (text === 'Solids' || text === 'Solidi' || text === 'Sólidos' || text === 'Feststoffe') { … }
```

The lists are incomplete. Measured against the catalogue, the unrecognised forms
are:

| Key | Recognised | Missing |
|---|---|---|
| `categoryGases` | Gases, Gas, Gase | `fr: Gaz` |
| `categoryLiquids` | Liquids, Liquidi, Líquidos | `de: Flüssigkeiten`, `fr: Liquides` |
| `categorySolids` | Solids, Solidi, Sólidos, Feststoffe | `fr: Solides` |

Once a header holds an unlisted form, no branch matches and it is never updated
again. A full 20-transition sweep produces 43 stranded headers.

### Suggested fix

Stop matching on text. Give each header a `data-localization-key` (or a stable
id) when it is created and read that:

```js
document.querySelectorAll('.main-category-text').forEach(el => {
    const key = el.dataset.localizationKey;
    if (key) el.innerText = localize(key, getLanguage());
});
```

That also removes the need to extend a hardcoded list every time a language is
added.

### Resolution

Fixed by the `data-loc` mechanism described under
[`docs/localization/status.md`](../../docs/localization/status.md) item 5: every
statically-authored label in `index.html` names its own catalogue key, and
`initialiseStaticButtonLabels()` is a single sweep over those elements. Text
matching is gone, so the whole class of problem is gone with it.

`tests/e2e/localization/language-switching.spec.js` walks all twenty ordered
language pairs and asserts the expected form after each.

---

## 7. Five controls clip their translated label — ✅ FIXED

**Severity: low — cosmetic, but present in four of five languages.**

All five are fixed and the allowlist in
`tests/e2e/localization/translated-ui.spec.js` is now **empty**, which is itself
the assertion: any control clipped by a translation is a regression rather than a
backlog item.

- **`Sell All`** — the button and the heading beside it were split 20/80 of the
  header row. The button now takes the width its label needs (`flex: 0 0 auto`,
  capped at 45%) and the heading takes the remainder.
- **Tab 2's side menu** — the three side-menu columns were an even 33/33/33 while
  only the first carries a name; the other two are short right-aligned numbers.
  The name column now takes 44% to the numbers' 28%, and `fitSideMenuLabels()` in
  `ui.js` shrinks the few labels that still do not fit. German supplies single
  unbreakable words — "Energiespeicher", "Solarkraftwerk" — that no column width
  makes wrap, so a font step-down is the only thing short of breaking mid-word.

The original description follows.

### `Sell All`

`#sellAllResourcesButton` (Resources) and `#sellAllCompoundsButton` (Compounds)
are laid out at a fixed 81px. English fits; every other language overflows:

| Language | Content width | Button width |
|---|--:|--:|
| en | 81 | 81 |
| es / it / fr | 103 | 81 |
| de | 135 | 81 |

### Tab 2's side menu

`#energyOption`, `#powerPlant2Option` and `#powerPlant3Option` overflow the fixed
side-menu width in German and, for the first of them, Spanish —
"Energiespeicher", "Solarkraftwerk", "Fortschrittliches Kraftwerk".

These are new to the list only because they now translate at all. They were among
the ~20 labels the old relocalization block looked up under ids that do not exist
in `index.html` (`energyStorageOption` for what is really `energyOption`, and so
on), so they rendered in English in every language and always fitted. Fixing the
wiring exposed the layout.

### Not translation's fault

`#activateGridButton` also clips, but it clips in English too, so it is a
pre-existing layout bug rather than a translation one — which is why the spec
measures clipping as a diff against the English layout of the same tab rather
than in absolute terms.

`tests/e2e/localization/translated-ui.spec.js` used to allowlist exactly these
five ids and fail on any *other* control that a translation clips. The allowlist
is now empty; see the note at the head of this entry.

---

## 8. `reverseLocalizeForCompounds` collides with the `compoundCreateQty` family — ✅ FIXED

**Severity: low — latent.**

The lookup considers every key beginning `compound`, which includes
`compoundCreateQty1`, `compoundCreateQty5` … `compoundCreateQty50000`, whose
values are the bare strings `"1"`, `"5"` … `"50000"`. So:

```js
reverseLocalizeForCompounds('500', 'en')  // -> 'createqty500'
```

The live caller feeds it the last whitespace-separated word of a description
line, so a cost line ending in a bare number would resolve to a data-object path
that does not exist, and the quantity read would be `undefined`. No current
description does that, which is why this is latent.

Narrowing the eligible keys to the six real compounds — or better, tagging
compound *name* keys distinctly from other `compound*` keys — closes it.

### Resolution

Closed from the other end, by status.md item 7. The hardened
`validateLocalization.cjs` resolves every constructed key family from source and
so could finally tell a live key from a dead one; the whole `compoundCreateQty*`
family turned out to be unreachable — `buildCompoundCreateDropdownRecipeText()`
composes those option labels inline and never asks for the keys — so all seven
were deleted along with `compoundRecipePattern`. With no `compound*` key left
whose value is a bare number, the collision has nothing to collide with:

```js
reverseLocalizeForCompounds('500', 'en')  // -> '500'
```

Note that the *lookup* was not narrowed, so the class of bug is still reachable:
a future `compound*` key whose value is a bare number would re-open it. The spec
in `tests/e2e/localization/compound-reverse-lookup.spec.js` now pins the fixed
behaviour and would fail if one were added.

---

## 9. Stray `</span>` in `modalPlayerLeaderPhilosophyContentText`

**Severity: low — cosmetic.**

All five languages end this value with a `</span>` that has no opening tag,
left behind when the string was extracted out of a hardcoded literal. The value
is rendered through `innerHTML` in the philosophy-choice modal
(`game.js:10956`); browsers discard an unmatched closing tag, so nothing is
visibly broken today.

Removing the four characters from each of the five values closes it. The
catalogue-integrity spec allowlists this one key and fails on any other
unbalanced tag; the allowlist does not need to be emptied when the fix lands.

---

## 10. `rebirth()` tears the run down before checking it can finish — ✅ FIXED

**Severity: high — corrupts the save, and the corrupted state invites a repeat.**

### Reproduction

1. Reach a state where a rebirth is possible and perform one.
2. Without travelling to and scanning a new destination system, invoke
   `rebirth()` again.

```
warning: Missing subKey: destinationStar        (resourceDataObject.js:3925)
TypeError: Cannot read properties of undefined (reading 'mapSize')
    at setupNewRunStarSystem  (resourceDataObject.js:3970)
    at rebirth                (game.js:15253)
```

Thousands of follow-up `Missing subKey: undefined` warnings then stream from the
frame loop, because the run is left half-reset.

### Cause

`rebirth()` rebuilds the new run from `starSystems.stars.destinationStar` — the
record the tab 5 system scan copies in via `copyStarDataToDestinationStarField`.
`setRebirthStarSystemToStarSystemDataObject`, at the end of every rebirth,
replaces `starSystems.stars` wholesale, so that record is deleted by the very
operation that consumes it. A second rebirth before a fresh scan therefore has
nothing to build from.

The throw lands *part-way through the teardown*: after `stopAutoSave()`, the tab
reset and `setCurrentStarSystem(undefined)`, but before the run counter, the AP
grant and `setRebirthPossible(false)`. So the save is left inconsistent **and**
`rebirthPossible` is still true, which leaves the button green and every
subsequent click repeating the damage.

The button was also only cosmetically disabled: `rebirthChecks()` toggled the
`red-disabled-text` class, whose `pointer-events: none` stops a mouse click but
leaves `element.click()` and every non-pointer path working, and it keyed on
`getRebirthPossible()` alone rather than on whether the rebirth could actually
complete.

### Fix

- `rebirthDestinationSystem()` and `rebirthPreconditionsMet()` in `game.js` state
  the precondition once.
- `rebirth()` checks it before touching anything, shows
  `notificationRebirthNoDestination` and returns `false`.
- `rebirthChecks()` uses `setButtonState`, so the button carries a real
  `disabled` attribute and reflects both halves of the precondition.

Covered by `tests/e2e/rebirth/rebirth.spec.js` (10 specs), including that a
refused rebirth leaves the run byte-for-byte unchanged and writes nothing to the
console.

---

## 11. 25 of 59 side-menu options never cleared their attention marker — ✅ FIXED

**Severity: medium — the ⚠️ "something new here" marker is the game's only
prompt to visit an option, and a marker that never clears trains the player to
ignore it.**

### Reproduction

Open any Cosmic Rip option (tab 8). Its ⚠️ stays, and so does the tab's badge,
however many times the option is opened.

### Cause

Every `drawTab*Content` cleared the marker by rebuilding the row's element id
from the current pane name:

```js
document.getElementById(
    getCurrentOptionPane().toLowerCase()
        .replace(/\s(.)/g, (m, g) => g.toUpperCase())
        .replace(/\s+/g, '') + 'Option'
)
```

That only works while every pane name camel-cases into its own id, and 25 of the
59 pane names no longer did — the real ids are `#cosmicRipSituationOption`,
`#cosmicRipNearSpaceScannerArrayOption`, `#cosmicRipCosmicRipOption`,
`#blackholeOption`, `#tab9StoryOption`, `#powerPlant1Option` and so on. This is
the same drift, in the same direction, as the ~20 broken relocalization ids that
`docs/localization/status.md` item 5 found in `index.html`.

Tabs 2, 4, 5, 6 and 7 hid the problem because `updateAttentionIndicators()` in the
frame loop independently clears markers whose condition has gone false. Tabs 1, 3
and 8 have no such sweep, so those were the tabs the bug was visible on. Tab 8
also had no `removeTabAttentionIfNoIndicators` call at all, so its badge never
cleared even once every row had.

### Fix

`clearOptionRowAttentionIndicator(clickedItem)` in `ui.js`, called from
`selectRowCss` — which already receives the element that was clicked — removes the
derivation entirely. The whole `.row-side-menu` is swept, because a row's label
and its notation paragraphs share one click handler and the marker may sit on any
of them. `🌀` is left alone: it reports the black hole's charge state rather than
novelty, and `blackHoleUIChecks` re-derives it every frame.

Covered by `tests/e2e/ui-navigation/attention-indicators.spec.js` (12 specs),
which drives the real click path over every reachable option row on all eight
content tabs rather than checking a list of ids — so a future row whose id does
not match its pane name is caught rather than silently joining the backlog.

---

## 12. Forcing a news-ticker category with no eligible content recurses until the stack overflows — ✅ FIXED

**Severity was: low — debug-only, but it took the page down.**

### Reproduction

1. Open the debug menu (**Numpad -**) and set **News Ticker Category** to
   *Always Manuscript Clue*.
2. Trigger a ticker message before any ancient manuscript has been discovered —
   which is the state of every fresh run.

```
PAGEERROR: Maximum call stack size exceeded
```

### Cause

`showNewsTickerMessage()` (`ui.js:10641`) resolves the category once at the top:

```js
const debugCategory = getDebugNewsTickerCategory();
if (debugCategory) category = debugCategory;
```

and then, when the chosen category yields nothing, retries by calling itself:

```js
} else if (category === 'manuscriptClue') {
    manuscriptClueSelection = getEligibleManuscriptClue(newsTickerContainer);
    if (manuscriptClueSelection) { … } else {
        showNewsTickerMessage(newsTickerContainer);   // same forced category
        return;
    }
}
```

The retry re-reads the same debug override, so it takes the identical branch and
recurses without bound. There is no random re-roll to escape through, and the
call is not on a timer, so the whole chain runs synchronously until the stack is
exhausted. `feedback` has the same shape: if `getFeedbackCanBeRequested()` is
false, the retry re-selects `feedback` forever.

Three retry sites share the fault — the `manuscriptClue` branch, the `feedback`
branch, and the trailing `if (message === false || message === undefined …)`
fallback.

### Resolution

Fixed in `ui.js`. `showNewsTickerMessage` now takes an options bag carrying a
`retryDepth`, and the three retry sites call a local `retryWithRandomCategory()`
instead of re-entering blind:

```js
const debugCategory = retryDepth === 0 ? getDebugNewsTickerCategory() : null;
```

Only the first attempt honours the override, so a retry re-rolls a real category
and always has content to show. `NEWS_TICKER_MAX_RETRIES` (10) bounds the chain
as a backstop for any future branch that can fail repeatedly — the reachable
case, an exhausted `oneOff` pool, needs one or two retries at most. The retries
are also `await`ed now, which they were not before; previously the outer promise
resolved before the replacement message had been chosen.

Covered by `tests/e2e/news-ticker/news-ticker.spec.js`: a forced `manuscriptClue`
with no manuscript outstanding and a forced `feedback` when feedback is not being
requested both render a message and leave the console clean, and the positive
path still asserts that a forced clue names the manuscript's star.

---

## 13. The philosophy choice modal's four buttons are hardcoded English

**Severity: low — cosmetic, but on the one screen that makes a permanent choice.**

### Reproduction

Play in any language other than English and complete the star study that offers
the philosophy choice. The modal's body copy is translated; its four buttons
read `CONSTRUCTOR`, `SUPREMACIST`, `VOIDBORN`, `EXPANSIONIST` in every language.

### Cause

`game.js` passes the labels as literals rather than catalogue lookups:

```js
confirmLabel: 'CONSTRUCTOR',
cancelLabel:  'SUPREMACIST',
extra1Label:  'VOIDBORN',
extra2Label:  'EXPANSIONIST',
```

Everything else about the modal is localized — `modalPlayerLeaderPhilosophyHeaderText`,
`modalPlayerLeaderPhilosophyContentText`, and the four
`notificationPhilosophy*` confirmations that follow the choice all resolve
through the catalogue in all five languages. Only the button labels were missed,
and there is no key for them: searching the catalogue for a philosophy *name*
returns descriptions and tech content but nothing that renders as a bare label.

This is the same class of gap as the `data-loc` sweep in
[`docs/localization/status.md`](../../docs/localization/status.md) item 5 —
a statically-authored label with no key behind it.

### Suggested fix

Add four keys (`philosophyNameConstructor` and so on) across the five language
files and swap the literals for `localize(...)` calls. Whether the four names
should translate at all or stay as proper nouns is a content decision, which is
why this is reported rather than fixed here — but either way the labels should
come from the catalogue so the decision lives in one place.

### Coverage

`tests/e2e/philosophies/philosophies.spec.js` pins the current state from both
ends: the modal body does *not* name the four paths, and no catalogue key exists
for them under any of the obvious names. Adding a key fails the second spec,
which is the prompt to wire it into the modal and delete that spec.
