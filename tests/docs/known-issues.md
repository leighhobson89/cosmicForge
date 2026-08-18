# Known Issues Found by the E2E Suite

Live defects discovered while building the test suite. Each is reproducible.
Entries marked ✅ FIXED have been resolved and carry a regression spec.

**Open entries are not worked around.** A live bug makes the tests that meet it
fail, by design — a suite that routes around its own findings is not measuring
anything. Where an entry below still describes a harness workaround, that is a
record of how it used to be handled and is removed as the entry is closed.

---

## 1. Discovering an asteroid permanently freezes the game on run 1 — ✅ FIXED

**Severity was: critical — silent, unrecoverable freeze during normal play.**

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

### Resolution

Closed by the first of the three suggested fixes, in `constantsAndGlobalVars.js`:
`compoundCreateDropdownRecipeText` is now `null` until
`ensureCompoundCreateDropdownRecipeText()` builds it on first read, and every
accessor goes through that. A run-1 read therefore returns a real table rather
than a function, so `addAchievementBonus` has an object to walk and the frame
loop survives.

The harness workaround, `GameHarness.ensureCompoundRecipeTextInitialised()`, has
been **deleted** — it was seeding state the game now initialises itself, and
leaving it in place would have hidden a re-regression.

Note the other two suggested fixes were not taken: `addAchievementBonus` still
dereferences the table unguarded, and `gameLoop` still re-arms
`requestAnimationFrame` only at the end of its body. Any future throw inside
`checkForAchievements` will therefore still end the frame loop permanently. That
is worth closing on its own merits, and is why the regression cover below asserts
frame-loop liveness rather than just the table's type.

Covered by `tests/e2e/achievements/run1-frame-loop.spec.js` (3 specs): the table
is a real object on run 1, discovering an asteroid leaves the frame loop
advancing with a clean console, and the achievement that triggered the freeze
still grants. The run counter is asserted to be 1 first, so the spec cannot
quietly pass by running after a rebirth.

---

## 2. `setSettledStars()` is an unguarded push — ✅ FIXED

**Severity was: low — latent, but the blast radius was permanent upgrades.**

`setSettledStars` was simply `settledStars.push(value)`: no deduplication, no
case normalisation, no type check. Galactic points are `settledStars.length - 1`
and galactic points buy permanent upgrades, so anything reaching that list
awarded a point that nothing downstream could tell from an earned one.

Callers lowercased before calling (`game.js:15136`), so no live path inflated the
count — but that was a convention rather than a guarantee, and the tell was that
**every** read site lowercased defensively before comparing. Fifteen or so call
sites each worked around the same missing invariant separately.

### Resolution

The invariant now lives in one place. `setSettledStars` normalises (trim +
lowercase), rejects non-strings and blanks, refuses duplicates, and returns
whether the list actually grew:

```js
export function setSettledStars(value) {
    const name = normaliseSettledStarName(value);
    if (name === null) return false;
    if (settledStars.some((existing) => normaliseSettledStarName(existing) === name)) return false;
    settledStars.push(name);
    return true;
}
```

The save-restore path was fixed with it. `restoreGameStatus` assigned
`gameState.settledStars` directly and so bypassed the setter entirely, meaning a
save written before this change could carry duplicates and keep paying out on
every load. It now runs through `normaliseSettledStarsList`, which applies the
same rules and falls back to the starting system if nothing survives.

The defensive lowercasing at the read sites was left in place: it is harmless,
and removing fifteen call sites' worth of it is a separate change with its own
risk.

Covered by `tests/e2e/colonise/settled-stars.spec.js` (8 specs): duplicates,
casing variants, surrounding whitespace, blanks and non-strings are each refused
without moving the count; the stored form is normalised; galactic points track
distinct systems only; and a list rebuilt from a duplicate-carrying save
collapses to `['spica', 'vega']`.

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

## 9. Stray `</span>` in `modalPlayerLeaderPhilosophyContentText` — ✅ FIXED

**Severity was: low — cosmetic.**

All five languages ended this value with a `</span>` that had no opening tag,
left behind when the string was extracted out of a hardcoded literal. The value
is rendered through `innerHTML` in the philosophy-choice modal; browsers discard
an unmatched closing tag, so nothing was visibly broken.

### Resolution

The seven stray characters are removed from all five values in
`localization.json`. `KNOWN_UNBALANCED_KEYS` in
`tests/e2e/localization/catalogue-integrity.spec.js` is now **empty**, and
keeping it empty is itself the assertion: any key whose markup does not balance
is a regression to fix in the catalogue rather than an entry to add to a list.

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

## 13. The philosophy choice modal's four buttons are hardcoded English — ✅ FIXED

**Severity was: low — cosmetic, but on the one screen that makes a permanent
choice.**

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

### Resolution

Four keys — `philosophyNameConstructor`, `philosophyNameSupremacist`,
`philosophyNameVoidborn`, `philosophyNameExpansionist` — were added to all five
language sections, and `game.js` now passes `localize(...)` for each of the four
labels instead of a literal. The names are genuinely translated rather than
routed through the catalogue in English:

| Key | en | es | de | it | fr |
|---|---|---|---|---|---|
| Constructor | CONSTRUCTOR | CONSTRUCTOR | KONSTRUKTEUR | COSTRUTTORE | CONSTRUCTEUR |
| Supremacist | SUPREMACIST | SUPREMACISTA | SUPREMATIST | SUPREMATISTA | SUPRÉMACISTE |
| Voidborn | VOIDBORN | NACIDO DEL VACÍO | LEERGEBOREN | NATO DAL VUOTO | NÉ DU VIDE |
| Expansionist | EXPANSIONIST | EXPANSIONISTA | EXPANSIONIST | ESPANSIONISTA | EXPANSIONNISTE |

`LEERGEBOREN` and `NACIDO DEL VACÍO` are coinages for a term the source language
invented, and are the two most worth a native reviewer's eye.

### Coverage

`tests/e2e/philosophies/philosophies.spec.js`:

- every name resolves from the catalogue in all five languages;
- the **real** modal — raised through `startInvestigateStarTimer` rather than by
  calling `callPopupModal` with labels of the spec's own — renders the French
  names, French being the only language where all four differ from English, so
  an untranslated label cannot pass by coincidence. German would not do:
  "Expansionist" is the same word in both;
- no button clips its label in any language, which is the failure mode
  known-issues #7 covered and the one these longer strings could have
  reintroduced.

---

## 14. `launchRocket()` mutates state, then dereferences a possibly-absent element — ✅ FIXED

**Severity was: low in practice, but the ordering was the real fault.**

### Reproduction

Call `launchRocket('rocket1')` while any option pane other than that rocket's is
open — which is every pane, on a fresh game, until the player navigates to it.

```
TypeError: Cannot read properties of null (reading 'classList')
    at launchRocket (game.js:12769)
```

### Cause

```js
export function launchRocket(rocket) {
    setAchievementFlagArray('launchRocket', 'add');
    setLaunchedRockets(rocket, 'add');
    document.getElementById(`space${capitaliseString(rocket)}AutoBuyerRow`).classList.add('invisible');
    showNotification(…);   // never reached
}
```

The fuel autobuyer row is built per pane by `drawTab6Content.js:1404`, so it
exists only while that rocket's pane is the one on screen. The lookup is
unguarded, and it sits **after** both state mutations and **before** the
notification. So a throw leaves the rocket recorded as launched and the
achievement flag set, while the player is never told it happened.

The only caller is the launch button on that very row (`drawTab6Content.js:1456`),
so a player cannot reach this today — the row must exist for the button to be
clickable. It is the ordering that makes it worth fixing rather than the
reachability: a presentation detail was placed where it could abort a completed
state change.

### Resolution

The notification now fires before the DOM work, and the lookup is optional-chained:

```js
const autoBuyerRow = document.getElementById(`space${capitaliseString(rocket)}AutoBuyerRow`);
autoBuyerRow?.classList.add('invisible');
```

Covered by `tests/e2e/rockets/rockets.spec.js`, which launches from a state with
no pane open — four specs failed on this before the fix.

---

## 15. Two pairs of techs shared a tech-tree render position — ✅ FIXED

**Severity was: low — ambiguous ordering, not a visual collision.**

### Reproduction

Inspect `idForRenderPosition` across `resourceDataObject.js`'s `techs` table.

| Path | Slot | Techs |
|---|--:|---|
| 1 | 70 | `oxygenFusion`, `compounds` |
| 4 | 700 | `glassManufacture`, `atmosphericTelescopes` |

### Cause

`sortRowsByRenderPosition` (`game.js:11732`) uses the value as a **sort key**,
offsetting it by ±10000 for researched and affordable rows. Two techs sharing a
value do not draw on top of each other; their relative order simply falls back
to whatever order the sort received them in. `Array.prototype.sort` is stable,
so the result is deterministic today — but it is decided by declaration order
rather than by design, and it would change if the table were ever reordered.

### Resolution

`compounds` moved to 75 and `atmosphericTelescopes` to 750. Both sit between
their neighbours, so the rendered order is unchanged apart from the tie being
broken deliberately. `tests/e2e/research/research.spec.js` now asserts that no
two techs share a render position, which catches the next one at the point it is
introduced.

### Related, and deliberately *not* changed

Three techs cost less than their own prerequisite — `carbonFusion` (4300) after
Noble Gas Collection (4500), `planetaryNavigation` (29000) after Rocket
Composites (34000), and `hydroCarbons` (3800) after Basic Power Generation
(4200). This is intended: a tech gated behind an expensive prerequisite may
legitimately be cheap, and the game never promises monotonic pricing. The spec
that assumed otherwise was withdrawn and replaced with one asserting that every
prerequisite names a tech that actually exists — an invariant the game does rely
on, since a mistyped prerequisite would leave its dependent permanently
unreachable.

---

## 16. The Colonise pane throws for every battle fought — ✅ FIXED

**Severity was: medium — four unhandled promise rejections per battle, and a
half-drawn pane.**

### Reproduction

Fight any battle to a conclusion with the Colonise pane open. On resolution:

```
TypeError: Cannot read properties of undefined (reading 'civilizationLevel')
    at drawTab5Content (drawTab5Content.js:1346)
    at updateContent   (ui.js:3492)
```

Four of them, per battle.

### Cause

`drawTab5Content`'s Colonise branch read the destination-star record without a
guard:

```js
const starData = getStarSystemDataObject('stars', ['destinationStar']);
if (… && starData.civilizationLevel !== 'Unsentient' && …) {
```

That record is legitimately absent at points in the run, notably just after a
battle resolves and the pane is redrawn. Two things made it worse than a stray
warning:

- `drawTab5Content` is `async` and is called **unawaited** from the pane click
  handler, so the throw surfaced as an unhandled promise rejection rather than a
  caught error, and the pane was left half-drawn;
- guarding only that line moved the throw one line down, into
  `calculateModifiedAttitude(starData)`, which reads `starData.currentImpression`
  just as unguardedly. The whole branch — the opinion bar, the diplomacy rows,
  the enemy-fleet readout, and the click handlers that close over `starData` —
  is built from that record.

### Resolution

An early return, rather than optional-chaining each read in turn:

```js
if (!starData) {
    return;
}
```

The Colonise branch is the last thing in the function, so returning skips nothing
else, and every downstream read is covered by the one guard. Drawing a pane full
of `undefined` was never the better outcome.

Found by `tests/e2e/battle/battle-live.spec.js`, which fights a real battle and
asserts a clean console — the thirteen pre-existing battle specs all passed
throughout, because none of them fought one.

---

## 17. Affordability gating is CSS-only — **BY DESIGN, not a defect**

**Recorded so it is not re-reported.** This entry exists to close the question,
not to track a fix.

Purchase handlers in this game contain no affordability check of their own. For
example the power-plant button in `drawTab2Content.js`:

```js
onClick: () => {
    gain(1, 'powerPlant1Quantity', 'powerPlant1', false, null, 'energy', 'resources');
    addToResourceAllTimeStat(1, 'allTimeBasicPowerPlantsBuilt');
    addBuildingPotentialRate('powerPlant1');
    …
}
```

The gate is the `red-disabled-text` class that the frame loop adds and removes:

```css
.red-disabled-text {
    color: var(--disabled-text);
    font-weight: bold;
    pointer-events: none;
}
```

**This is the intended mechanism for every affordability check in the game.** A
purchase handler without a guard is therefore correct, and must not be filed as a
bug.

### What this means for tests

A synthetic click dispatched straight at an element — which integration specs here
often need, because several controls sit underneath others and a real click lands
on the coverer — **bypasses `pointer-events: none`**. The purchase then goes
through with no funds. That is expected, not a finding.

So keep the two concerns apart:

- to exercise a *handler*, dispatch the event at the element;
- to check the *gate*, assert that the frame loop has applied `red-disabled-text`
  while the player cannot afford the item.

Never assert that a purchase button carries a real `disabled` attribute.

### Not to be confused with #10

Known-issues #10 *was* a genuine defect, and the difference is worth keeping
straight. There the CSS-only gate sat on **Rebirth** — not an affordability check,
but a precondition on whether the operation could complete at all, and one that
corrupted the save when it proceeded regardless. A CSS-only gate on an ordinary,
repeatable purchase is fine; on a destructive, non-idempotent operation it was not.

### Coverage

`tests/e2e/energy/energy-live.spec.js` asserts the design: the button gains
`red-disabled-text` when the plant is unaffordable and loses it when it is not.

---

## 18. The Fuse button can never reveal itself before the first fusion — ✅ FIXED

**Severity:** medium — the control is reachable, but only by accident of a redraw.

**Found by:** `tests/e2e/resources/resources.spec.js` →
*"the Fuse button is hidden until the fusion tech is researched"*.

### What happens

Research Hydrogen Fusion while standing on the Hydrogen pane and the Fuse button
does not appear. It stays hidden until the pane is closed and reopened, at which
point it is rebuilt from scratch and shows normally.

Observed class lists across the transition, with the Hydrogen pane open throughout:

| moment | `#hydrogenSellRow button.fuse` classes |
|---|---|
| before the tech | `option-button red-disabled-text … fuse invisible` |
| after Grant All Techs | `option-button … fuse invisible` |
| after reopening the pane | `option-button … fuse` |

Note the middle row: the tech has been applied — the button has lost
`red-disabled-text`, so it is *enabled* — but it is still `invisible`.

### Why

`setStateOfFuseResourceButton` in `game.js`:

```js
function setStateOfFuseResourceButton(element, quantity, resource, resourceToFuseTo) {
    if (getTechUnlockedArray().includes(resource + 'Fusion') && getUnlockedResourcesArray().includes(resourceToFuseTo)) {
        element.classList.remove('invisible');
    }

    if (getTechUnlockedArray().includes(resource + 'Fusion') && quantity > 0) {
        element.classList.remove('red-disabled-text');
        …
    } else if (!getTechUnlockedArray().includes(resource + 'Fusion')) {
        element.classList.add('invisible');
    } else {
        …
    }
}
```

Only the **first** branch removes `invisible`, and it additionally requires
`getUnlockedResourcesArray().includes(resourceToFuseTo)` — the fusion *product*
to be already discovered. But the only thing that ever discovers a fusion product
is fusing to it: `fuseResource()` calls `setUnlockedResourcesArray(fuseTo)` in its
discovery branch. Before a player's first fusion of a given element the condition
is therefore unsatisfiable, so that branch can never fire.

Meanwhile the third branch adds `invisible` on every frame while the tech is
missing. The class is added long before the tech arrives and nothing removes it
afterwards. Only `updateContent()` rebuilding the row — which happens when the
pane is reopened — produces a fresh button without the class.

### Suggested fix

Reveal on the tech alone, and let the second condition govern only whether the
button is enabled:

```js
if (getTechUnlockedArray().includes(resource + 'Fusion')) {
    element.classList.remove('invisible');
}
```

The extra `resourceToFuseTo` clause guards nothing useful: the product is
unlocked *by* the action the button performs.

### Coverage

The spec asserts the behaviour that should happen — grant the tech, and the Fuse
button becomes visible and enabled without a redraw. It failed on first write,
was brought to Leigh with the class-list evidence above, and the source was fixed
rather than the test.

---

## 19. Crafting a compound in any language but English is free — ✅ FIXED

**Severity:** high — an economy exploit, live in four of the five shipped languages.

**Found by:** `tests/e2e/compounds/compounds.spec.js` →
*"crafting in another language still charges the right resources"*.

### What happens

Switch the game to German (or Spanish, Italian, French), open a compound pane,
pick any amount and press **Create**. The compound is added. **No ingredients are
deducted.** The player gets the goods for nothing, and can repeat it forever.

Probe output, German, asking for 5 diesel:

```
language          de
create preview    "5 Diesel (130 Wasserstoff, 60 Kohlenstoff)"
parsed parts      { compoundToCreateQuantity: 5,
                    constituentPartQuantity1: 130, constituentPartName1: "wasserstoff",
                    constituentPartQuantity2: 60,  constituentPartName2: "kohlenstoff" }
before            diesel 0,  hydrogen 100000
after             diesel 5,  hydrogen 100000     <-- unchanged
```

In English the same sequence charges 130 hydrogen and 60 carbon correctly.

### Cause

The amount to craft and the ingredients to spend are recovered by **parsing the
rendered preview sentence**:

```
setCompoundCreatePreview()   ->  "5 Diesel (130 Wasserstoff, 60 Kohlenstoff)"
getConstituentComponents()   ->  { constituentPartName1: "Wasserstoff", … }
unpackConstituentPartsObject()->  lowercases the names, and nothing more
createCompound()             ->  looks the name up as a data-object key
```

`createCompound` then does:

```js
if (getResourceDataObject('resources')[partName]) {
    type = 'resources';
} else if (getResourceDataObject('compounds')[partName]) {
    type = 'compounds';
} else {
    type = 'error';
}

setResourceDataObject(
    getResourceDataObject(type, [partName, 'quantity']) - partQuantity,
    type,
    [partName, 'quantity']
);
```

The names in the sentence are **display names**, but the data object is keyed by
**internal keys**. `resourceData.resources['wasserstoff']` does not exist, so
`type` becomes `'error'` and the write goes nowhere. It works in English only
because there the display name and the internal key happen to coincide once
lowercased (`Hydrogen` -> `hydrogen`).

The compound quantity is added before that loop runs, so the credit lands and the
charge does not.

### Suggested fix

### The fix

A reverse lookup existed already — `reverseLocalizeForCompounds` — but it was not
usable here: `getCompoundReverseIndex` indexes only `compound*` catalogue keys,
and a recipe's ingredients are almost always **resources**. Feeding it
"Wasserstoff" returned the input unchanged, which is exactly the failure.

Two changes, plus a guard:

1. **`localization.js`** — a new `reverseLocalizeMaterialName(value, language)`
   built on a `getMaterialReverseIndex` that indexes `compound*` *and*
   `resource*` keys. Compounds are indexed first, so a name shared by both
   sections still resolves the way it always has (known-issues #8).
2. **`game.js`, `unpackConstituentPartsObject`** — the parsed names now go
   through that lookup before being lowercased. English is unaffected, because
   the index maps an English display name to the key it already produced.
3. **`game.js`, `createCompound`** — every ingredient is now resolved *before*
   anything is credited, and an unresolvable name abandons the whole craft with a
   `console.warn` instead of adding the compound and silently skipping the
   charge. The old `type = 'error'` branch is gone.

### Coverage

The spec crafts in German and asserts the ingredients are charged. It failed on
first write, was brought to Leigh with the probe output above, and the source was
fixed rather than the test.

---

## 20. The compound create dropdown never changes language — ✅ FIXED

**Severity:** low — cosmetic, but it strands one control in a language the player
has just left.

**Found by:** `tests/e2e/compounds/compounds.spec.js` →
*"switching language relabels the create dropdown on screen"*.

### What happens

Switch language in Settings, reopen a compound pane, and the **create** dropdown
still reads in the previous language:

```
["Fill To Capacity", "Max Possible", "Up to 75%", …, "5000 - 130K Hyd, 60K Crb", …]
```

Everything else on the pane relocalizes, including the sell dropdown right beside
it and the create *preview* underneath it.

### Cause

The recipe table is built once and cached for the lifetime of the run:

```js
let compoundCreateDropdownRecipeText = null;

function ensureCompoundCreateDropdownRecipeText() {
    if (!compoundCreateDropdownRecipeText) {
        compoundCreateDropdownRecipeText = buildCompoundCreateDropdownRecipeText();
    }
    return compoundCreateDropdownRecipeText;
}
```

`buildCompoundCreateDropdownRecipeText()` calls `localize(..., getLanguage())` for
every entry, so the table is frozen in whatever language was current the first
time anything read it. The only thing that clears the cache is
`resetAllVariablesOnRebirth`. `relocalizeAll()` redraws the pane, but the redraw
reads the same stale table.

The sell dropdown differs because it calls `localize` inline at draw time.

### The fix

`constantsAndGlobalVars.js` gained an exported
`invalidateCompoundCreateDropdownRecipeText()` — the same one-line invalidation
the rebirth reset already performs — and `relocalizeAll()` in `ui.js` now calls
it straight after `initLocalization` resolves, before anything redraws. The next
read rebuilds the table in the new language.

An exported invalidator was needed because the variable is module-private and the
existing `setCompoundCreateDropdownRecipeText` takes a single compound rather than
the whole table; passing `undefined` through it destroys that compound's entry
without triggering a rebuild.

### Coverage

The spec reads the rendered option list, switches language through
`relocalizeAll`, reopens the pane and asserts the list changed.

---

## 21. The end-credits overlay never lifts — **BY DESIGN, not a defect**

Entry withdrawn. The end-credits cinematic is *meant* to run and then leave its
overlay in place for ever, blocking further interaction until the browser is
refreshed: closing the cosmic rip ends the run, and there is nothing after it to
hand the game back to.

The consequence for the suite is a hard boundary rather than a bug to fix. The
furthest an endgame spec may play is the point at which the game is *ready* for
the player to close the rip; at that point it must rebirth instead. That is what
`tests/e2e/rebirth/rebirth-live.spec.js` →
*"the rip is left one button-press from closed, and the rebirth taken instead
keeps it there"* does. Do not add teardown or refresh workarounds whose only
purpose is to escape the overlay.

The number is kept so the entries after it do not shift.

---

## 22. Buying the Space Telescope or the Launch Pad throws, and the pane never updates — 🔴 OPEN

**Severity:** high — the purchase is charged in full and the pane shows no sign of
it. Nothing on screen tells the player the building exists.

**Found by:** `tests/e2e/space-telescope/space-telescope.spec.js` →
*"the build button charges cash, iron, glass and silicon, and opens the two actions"*.

### What happens

Build the Space Telescope from the Space Mining tab. Cash, iron, glass and silicon
all come off correctly and `spaceTelescopeBoughtYet` is set — but:

- the build row stays on screen with its Build button still showing;
- the **Bought** text never appears;
- the **Scan Asteroids** and **Study Stars** rows never appear;
- no build sound plays and no "telescope built" notification is shown;
- `PAGEERROR: Cannot read properties of null (reading 'classList')` lands in the
  console.

The only way to see the telescope is to leave the pane and come back, at which
point `drawTab6Content` rebuilds it from `spaceTelescopeBoughtYet` and everything
is where it should be. A player who does not do that has apparently spent 10,000
cash and 52,000 units of material on nothing.

### Cause

`buildSpaceMiningBuilding` (`game.js:12571`) looks up three elements and then
dereferences all three unguarded:

```js
const buySpaceMiningBuildingButtonElement = document.querySelector(`button[data-resource-to-fuse-to="${spaceMiningBuilding}"]`);
const spaceMiningBuildingDescriptionElement = document.getElementById(`${spaceMiningBuilding}Description`);
const spaceMiningBuildingAlreadyBoughtTextElement = document.getElementById(`${spaceMiningBuilding}AlreadyBoughtText`);
...
if (!debug) {
    buySpaceMiningBuildingButtonElement.classList.add('invisible');
    spaceMiningBuildingDescriptionElement.classList.add('invisible');   // <- null
    spaceMiningBuildingAlreadyBoughtTextElement.classList.remove('invisible');
}
```

`spaceTelescopeDescription` does not exist. `createOptionRow` names the
description container after the **row**, not the building — `ui.js:3561`:

```js
descriptionRowContainer.id = labelId + 'Description';
```

and the row's `labelId` is `spaceBuildTelescopeRow`, so the element in the DOM is
`spaceBuildTelescopeRowDescription`. The lookup therefore returns `null` and the
second line throws.

The throw escapes `buildSpaceMiningBuilding` into the build button's own
`onClick` (`drawTab6Content.js:118`), which is why everything after the call is
skipped:

```js
onClick: () => {
    buildSpaceMiningBuilding('spaceTelescope', false);          // throws here
    sfxPlayer.playAudio('buildTelescope', false);               // never runs
    document.getElementById('spaceTelescopeSearchAsteroidRow').classList.remove('invisible');
    document.getElementById('spaceTelescopeInvestigateStarRow').classList.remove('invisible');
    ...
    showNotification(localize('notificationSpaceTelescopeBuilt', ...));
}
```

**The Launch Pad has the identical defect.** Its row's `labelId` is
`spaceBuildLaunchPadRow`, so `launchPadDescription` is null too, and
`drawTab6Content.js:652` calls `buildSpaceMiningBuilding('launchPad', false)` the
same way — the four rocket build rows it means to reveal on the next lines never
appear either.

### Why it has never been seen in a test before

Every existing spec and the whole debug menu reach these buildings through
`buildSpaceMiningBuilding(name, true)`. The `debug` argument is exactly what
skips the block that throws, so the fault is only reachable by pressing the real
button.

### Proposed fix

Either look the element up by the id it actually has:

```js
const spaceMiningBuildingDescriptionElement = document.getElementById(
    spaceMiningBuilding === 'spaceTelescope' ? 'spaceBuildTelescopeRowDescription' : 'spaceBuildLaunchPadRowDescription');
```

— or, better, guard all three, since none of them is essential to the purchase
and a missing one should never cost the player the rest of the handler:

```js
if (!debug) {
    buySpaceMiningBuildingButtonElement?.classList.add('invisible');
    spaceMiningBuildingDescriptionElement?.classList.add('invisible');
    spaceMiningBuildingAlreadyBoughtTextElement?.classList.remove('invisible');
}
```

The optional-chaining version alone fixes the visible symptom — the rest of the
`onClick` runs, the action rows appear and the notification shows — and leaves
only the description row still on screen, which the next redraw tidies.

**Not yet applied — awaiting a decision on whether to change the game source.**

### Coverage

The spec presses the real Build button and then reads the pane *without*
reopening it, because "the pane the player is standing on updates" is the claim.
It currently fails at the first of those assertions, which is the correct place
to fail. Every other spec in the file stages the telescope through the debug
menu's *Build Launch Pad, Scanner and All Rockets*, so the failure stays pointed
at the defect instead of spreading across the file.

---
