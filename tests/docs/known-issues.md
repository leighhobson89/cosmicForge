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

## 22. Buying the Space Telescope or the Launch Pad aborted its own click handler — ✅ FIXED

**The original write-up of this entry was wrong and has been rewritten.** It
claimed the pane never showed the building as bought. It does: the frame loop's
`handleVisibilityOfOneOffPurchaseButtonsAndDescriptions` hides the Build button,
reveals the **Bought** text and hides the price label a fraction of a second
after the purchase, whatever the click handler managed to do. Leigh could not
reproduce the reported symptom, and he was right not to — buying either building
looks correct on screen.

What was genuinely wrong was narrower, and only visible in the console and in one
missing step.

### Reproduction (before the fix)

With the intended setup — *Give $1B*, *Give 1M of all Resources and Compounds*,
*Grant All Techs*, then the Space Mining tab — build the Space Telescope:

- the purchase is charged correctly and the row settles to **Bought**;
- but `PAGEERROR: Cannot read properties of null (reading 'classList')` is
  written to the console;
- and the **Scan Asteroids** and **Study Stars** rows do not appear until the
  pane is next drawn, because the throw aborted the rest of the click handler
  before it reached them.

The Launch Pad had the identical fault, with its four rocket build rows.

### Cause

`buildSpaceMiningBuilding` (`game.js`) looked up three elements and dereferenced
all three unguarded. The middle one never exists: `createOptionRow` names the
description container after the **row**, not the building, so the element in the
DOM is `spaceBuildTelescopeRowDescription`, not `spaceTelescopeDescription`.

The throw escaped into the build button's own `onClick`, which is what reveals
the newly bought building's action rows.

### Fix — applied

All three lookups are now optional, with a comment recording that the frame loop
does the same tidy-up regardless, so none of them is worth losing the rest of the
handler over:

```js
buySpaceMiningBuildingButtonElement?.classList.add('invisible');
spaceMiningBuildingDescriptionElement?.classList.add('invisible');
spaceMiningBuildingAlreadyBoughtTextElement?.classList.remove('invisible');
```

### Coverage

`tests/e2e/space-telescope/space-telescope.spec.js` → *"the build button charges
cash, iron, glass and silicon, and opens the two actions"*, which now runs on the
minimal setup above and reads the pane **without** reopening it, so it would
catch the handler aborting again. The whole area passes.

---

## 23. Four Void Seer statistics are permanently stuck on "NoData" — ✅ FIXED

**Severity: low — four cells on the Statistics page never show a value, in every
run, for every player.**

### Reproduction

1. Start a game.
2. Open **Settings → Statistics**.
3. Scroll to the **Galactic Casino** section.
4. The four Void Seer rows — played and won, this run and all time — read
   `NoData` rather than a number. Playing Void Seer in the casino does not
   change them.

Every other cell on the page renders. These four never do.

### Cause

The page and the getter table disagree about how to capitalise "Void Seer".

`createHtmlTableStatistics()` builds each cell's id from
`getStatKeyFromLocalizedName()`, whose casino key list uses a capital S
(`descriptions.js`):

```js
const casinoKeys = ['casinoPointsSpent', 'doubleOrNothingPlayed', ...,
                    'voidSeerPlayed', 'voidSeerWon'];
```

so the ids in the DOM are `stat_voidSeerPlayed`, `stat_voidSeerPlayedThisRun`,
`stat_voidSeerWon`, `stat_voidSeerWonThisRun`.

`getStats()` then walks `statFunctionsGets` and writes into
`document.getElementById(stat)` — but that table spells the same four keys with a
lower-case s (`constantsAndGlobalVars.js`):

```js
"stat_voidseerPlayedThisRun": () => getGalacticCasinoStatValue('game4_voidSeerPlayed', 'currentRun'),
"stat_voidseerPlayed":        () => getGalacticCasinoStatValue('game4_voidSeerPlayed', 'allTime'),
"stat_voidseerWonThisRun":    () => getGalacticCasinoStatValue('game4_voidSeerWon', 'currentRun'),
"stat_voidseerWon":           () => getGalacticCasinoStatValue('game4_voidSeerWon', 'allTime'),
```

`getElementById('stat_voidseerPlayed')` finds nothing, the getter's value is
thrown away, and the cell keeps the `"NoData"` placeholder every statistics cell
is built with. Note the *underlying* casino keys passed to
`getGalacticCasinoStatValue` are correct — the numbers are being tracked
faithfully, they are simply never rendered.

The eight other casino statistics on the same page work, which is why this reads
as a typo rather than a missing feature.

### Suggested fix

Rename the four getter-table keys to match the ids the page builds:

```js
"stat_voidSeerPlayedThisRun": () => getGalacticCasinoStatValue('game4_voidSeerPlayed', 'currentRun'),
"stat_voidSeerPlayed":        () => getGalacticCasinoStatValue('game4_voidSeerPlayed', 'allTime'),
"stat_voidSeerWonThisRun":    () => getGalacticCasinoStatValue('game4_voidSeerWon', 'currentRun'),
"stat_voidSeerWon":           () => getGalacticCasinoStatValue('game4_voidSeerWon', 'allTime'),
```

Nothing else reads these four keys, so the rename is contained.

**Fix applied** in `constantsAndGlobalVars.js`. All four cells now render their
value, and the sweeping spec passes.

### Coverage

`tests/e2e/statistics/statistics.spec.js` → *"every statistic on the page renders
a real value"*. It sweeps every `#stat_…` cell for the `NoData` placeholder
rather than naming the four, so the same spec catches any future cell that loses
its getter.

---

## 24. A rebirth zeroed fourteen "All Time" statistics — ✅ FIXED

**Severity: medium — the Statistics page shows a player a lifetime total, then
silently resets it to zero the first time they rebirth.**

### Reproduction

1. Start a game and build two power plants.
2. Open **Settings → Statistics** and read the **Basic Power Plants** row: the
   *All Time* column shows 2.
3. Play the run to a completed rebirth and take it.
4. Read the same row again. Both columns now show 0.

The same happens to asteroids discovered, rockets launched, starships launched,
antimatter mined and the rest of the list below. Research points, science
buildings and every resource and compound total behave correctly and survive.

### Cause

`resetAllVariablesOnRebirth()` (`constantsAndGlobalVars.js`) clears the per-run
counters, which is its job — and then went on to clear fourteen all-time ones
alongside them:

```js
researchPointsThisRun = 0;      // correct: a per-run counter
scienceKitsThisRun = 0;         // correct
...
allTimeTotalRocketsLaunched = 0;          // <- lifetime
allTimeTotalStarShipsLaunched = 0;        // <- lifetime
allTimeTotalAsteroidsDiscovered = 0;      // <- lifetime
allTimeTotalLegendaryAsteroidsDiscovered = 0;
starStudyRange = 0;
allTimeTotalAntimatterMined = 0;
allTimeTotalApGain = 0;
totalNewsTickerPrizesCollected = 0;
allTimeStarShipsBuilt = 0;
allTimesTripped = 0;
allTimeBasicPowerPlantsBuilt = 0;
allTimeAdvancedPowerPlantsBuilt = 0;
allTimeSolarPowerPlantsBuilt = 0;
allTimeSodiumIonBatteriesBuilt = 0;
allTimeBattery2Built = 0;
allTimeBattery3Built = 0;
```

The resource, compound and research families are handled correctly a few lines
above — only their `…ThisRun` twins are zeroed — so the file already knows the
distinction. These fifteen look like per-run counters that were given all-time
names, or all-time counters that drifted into the per-run block.

The consequence is visible rather than theoretical: the statistics table renders
these under a heading that says **All Time**, next to families that genuinely are
all-time, so the page contradicts itself from the second run onward.

### Fix — applied

The fourteen assignments have been taken out of `resetAllVariablesOnRebirth()`,
with a comment in their place recording what was removed and why. Every one of
them either has a `…ThisRun` counterpart that is still reset
(`timesTrippedThisRun`, `basicPowerPlantsBuiltThisRun`, `asteroidsMinedThisRun`,
`antimatterMinedThisRun` and the rest) or has no run column at all, so the
two-column contract is restored without any new state. Each was checked for
gameplay readers first: all fourteen are read only by their statistics getter,
the save/load serialisation and the variable debugger, so nothing depends on them
starting a run at zero.

**Three that look like they belong on the list stay reset, and now say so in a
comment**, because despite their names they are the *current run* figure:

| Variable | Why it still resets |
|---|---|
| `starStudyRange` | `stat_starStudyRangeThisRun` reads it; the all-time column renders "N/A" |
| `starShipTravelDistance` | both of its statistics keys map to the same run getter |
| `allTimeStarShipsBuilt` | no statistics getter reads it at all; `starShipBuilt` is the run flag the page uses |

That is why this entry now says fourteen where it first said fifteen.

### Coverage

`tests/e2e/statistics/statistics.spec.js` → *"a rebirth clears the run column and
leaves the all-time column standing"*. The spec plays a run, earns something in
each family, takes the rebirth through the real Rebirth button, and then asserts
both halves of the contract. Both halves now pass, and the all-time half names
any statistic that is lost if this regresses.

---

## 25. Pressing Import with an empty box did nothing at all — ✅ FIXED

**Severity: low — a dead button. No data loss, but the player is given no reason
why nothing happened, and every click left an unhandled rejection behind.**

### Reproduction

1. Open **Settings → Saving / Loading**.
2. Leave the **Import** box empty — or paste in nothing but whitespace.
3. Press **Import**.
4. Nothing happens. No notification, no modal, no change on screen. The console
   gains `Uncaught (in promise) No valid save data found in the import area.`

### Cause

Two independent halves, which is why the fix is in two places.

`loadGame()` (`saveLoadGame.js`) rejected before reaching any of its user-facing
messages:

```js
const textArea = document.getElementById('importSaveArea');
if (!textArea || !textArea.value.trim()) {
    return reject('No valid save data found in the import area.');   // silent
}
```

Every *other* refusal path in the same function does tell the player — a
truncated code and arbitrary text both raise `notificationInvalidSaveString`
through `validateSaveString()` a few lines below. The empty box was the one
branch that returned before any of that, so the button behaved as though it were
not wired up at all.

The second half was the caller. The Import row's handler
(`drawTab9Content.js`) was `onClick: () => { loadGame(); }` — the returned
promise was never caught, so the rejection surfaced as an unhandled rejection on
every click.

### Fix — applied

**`saveLoadGame.js`** — the empty branch now notifies before rejecting, so every
caller of `loadGame()` is covered rather than just the one button:

```js
if (!textArea || !textArea.value.trim()) {
    showNotification(localize('notificationInvalidSaveString', getLanguage()), 'warning', 3000, 'loadSave');
    return reject('No valid save data found in the import area.');
}
```

**`drawTab9Content.js`** — the handler absorbs the rejection, which it can now do
safely because the message no longer depends on the caller:

```js
onClick: () => {
    // loadGame() notifies the player itself on every refusal path, so this
    // catch only stops the rejection surfacing as an unhandled error.
    loadGame().catch(() => {});
},
```

Keeping the rejection rather than resolving was deliberate: callers that want to
know an import did not happen — `importSaveStringFileFromComputer()` logs it —
can still tell the difference between "nothing to load" and success.

### Coverage

`tests/e2e/save-load-local/save-load-local.spec.js` → *"pressing Import with an
empty box tells the player rather than failing silently"*. The spec presses the
real button with an empty box and asserts three things: a notification appears,
the live run is untouched, and `significantErrors()` is empty — that last
assertion is what pins the unhandled rejection, and it is the one that stayed red
after the first half of the fix was applied.

---

## 26. Purchase price descriptions ignore the Normal notation setting — ✅ FIXED

**Severity was: medium — cosmetic, but it is the one place a player reads a price
before spending, and it was wrong on every purchase row in the game whenever the
Normal notation mode was chosen.**

### Reproduction

1. Open **Settings → Visual** and set **Notation** to **Normal**.
2. Open **Energy → Energy Storage**.
3. The three battery rows read

   ```
   $5000, 500 Sodium, 1000 Carbon
   $50000, 3000 Steel, 1500 Glass, 2000 Sodium
   $500000, 25000 Titanium, 12000 Neon, 18000 Silicon
   ```

   while the cash figure in the stat bar directly above them reads
   `$1,999,952,765`. Every number on screen is grouped except the prices.

4. The same rows in **Normal Condensed** read `$5.0K`, `$50.0K`, `$500.0K`, so
   the condensed mode is fine. It is only the plain mode that is untouched.

Also affected: the four **Fleet Hangar** build rows, the **Solar Power Plant**
row, and every other row whose `rowCategory` is `building`,
`spaceMiningPurchase`, `starShipPurchase`, `fleetPurchase` or `cosmicRipPurchase`
— those are the categories `createOptionRow` gives the `building-purchase` class.

### Cause

The per-frame notation sweep in `gameLoop` (`game.js`) routes `.notation`
elements three ways, and the purchase branch has no plain-mode path:

```js
if (element.classList.contains('sell-fuse-money')) {
    complexSellStringFormatter(element, getNotationType());
} else if (element.classList.contains('building-purchase')) {
    complexPurchaseBuildingFormatter(element, getNotationType());
} else {
    formatAllNotationElements(element, getNotationType());
}
```

`complexPurchaseBuildingFormatter` (`game.js`) opens with

```js
function complexPurchaseBuildingFormatter(element, notationType) {
    if (notationType === 'normalCondensed') {
        ...
    }
}
```

so in `normal` it returns having done nothing at all. Because the `else if`
already claimed the element, it never reaches `formatAllNotationElements`, which
is where `formatNormalNumber`'s `toLocaleString('en-US')` grouping lives. The
result is not "formatted differently" but "never formatted": the raw description
text is what the player sees.

### Suggested fix

The condensed branch exists because a price row is not one number — it is a cash
cost that has to keep its currency symbol on the correct side, followed by a
comma-separated list of resource costs, each split across its own `<span>`. Plain
mode needs the same span walk with a different formatter, not a fall-through.

The smallest change that keeps that structure is to hoist the per-number
formatting out of the condensed branch:

```js
function complexPurchaseBuildingFormatter(element, notationType) {
    if (element?.dataset?.type === 'cosmicRip') return;

    // Both modes walk the same spans; only the number formatter differs.
    const formatValue = notationType === 'normal'
        ? (raw) => {
            const n = Number(String(raw).replace(/,/g, ''));
            return Number.isFinite(n) ? n.toLocaleString('en-US') : raw;
        }
        : formatNumber;

    const spans = element.querySelectorAll('span');
    ...   // unchanged, calling formatValue(numberPart) instead of formatNumber(numberPart)
}
```

Note the guard order: the existing `cosmicRip` early return sits *inside* the
condensed branch today, so it has to move out with the rest, or cosmic-rip
purchase rows would start being rewritten in plain mode when they are
deliberately left alone in condensed.

### Resolution

Closed by the suggested fix, in `game.js`. `complexPurchaseBuildingFormatter` no
longer has a mode-shaped body: the `cosmicRip` early return moved out to the top
of the function, the span walk moved out of the condensed branch, and the mode now
chooses only which formatter each number goes through —

```js
let formatValue;
if (notationType === 'normalCondensed') {
    formatValue = formatNumber;
} else if (notationType === 'normal') {
    formatValue = formatGroupedNumber;
} else {
    return;
}
```

`formatGroupedNumber()` is new, and sits beside `formatNumber()` as its plain
counterpart: grouped in thousands, with a pointless decimal tail dropped. It is
the *same* function `formatAllNotationElements` now uses for its own plain path —
that grammar was previously duplicated inside that function, and hoisting it is
what stops one screen grouping while another shows a raw run of digits.

Two related paths were fixed alongside it, because leaving them would have moved
the defect rather than closed it:

- `handleCosmicRipUpgradeResourceType` builds its own price labels, and is the
  reason the `cosmicRip` guard exists at all. Its plain branch returned
  `String(Math.floor(num))` — ungrouped — so cosmic rip rows would have become the
  last unformatted price rows in the game. It goes through `formatGroupedNumber`
  too now.
- The `else { return; }` arm is deliberate. A mode this function does not know how
  to render leaves the row alone rather than rewriting its spans with `undefined`.

### Coverage

`tests/e2e/notation/notation-live.spec.js`, both of the specs that were failing:
*"plain: every value past a thousand is grouped, and nothing is abbreviated"* (the
whole-game sweep, which reported all 26 offending numbers across the Energy and
Fleet Hangar panes) and *"plain: every cost on a purchase row is grouped in
thousands"*. Both pass, and the matching condensed specs still pass — which is
what proves the shared span walk did not regress the mode that already worked.

---

## 27. The Statistics screen never applies the notation setting at all — ✅ FIXED

**Severity was: medium — the screen whose entire job is showing the player their
numbers was the one screen that showed them unformatted, in both modes.**

### Reproduction

1. Play far enough to hold a large amount of cash — the debug menu's **Give $1B**
   is enough.
2. Open **Settings → Statistics**.
3. The Cash row reads

   ```
   Cash: $1999952765.00
   ```

4. Switch **Notation** to **Normal** and reopen the screen. It still reads
   `$1999952765.00`. Switch back to **Normal Condensed**: still
   `$1999952765.00`, where the stat bar at the top of the same screen reads
   `$2.0B`.

Antimatter behaves the same way, showing `80000` rather than `80.0K` or `80,000`.

### Cause

`createHtmlTableStatistics` (`ui.js`) means to tag the numeric stats with the
`notation` class, which is the only thing the frame-loop sweep looks for. The
tag is never applied, because the check compares a capitalised — and localized —
heading against a list of lowercase English keys:

```js
const notationHeaders = ['cash', 'hydrogen', 'helium', ... , 'researchPoints'];
...
let header = capitaliseString(subHeadings[i][j] || '');
...
if (notationHeaders.includes(header)) {   // 'Cash' is never === 'cash'
    bodyClasses.push('notation');
}
```

`'Cash'` is not in the list, and in any non-English run the heading is not even
English, so the branch is dead in every language including this one. Confirming
that this is an unfinished change rather than a deliberate omission: the function
already builds

```js
const localizedNotationHeaders = notationHeaders.map(key => { ... });
```

directly above — a table that resolves each key to its localized heading — and
then never reads it.

A DOM check makes the consequence concrete: the Statistics pane renders 111 rows
and `document.querySelectorAll('#statisticsRowTextArea .notation')` returns **0**.

### Suggested fix

Use the lookup that is already being built, and compare on the resolved English
key rather than on display text:

```js
const englishKey = getStatKeyFromLocalizedName(header.replace(':', '').trim());
if (notationHeaders.includes(englishKey)) {
    bodyClasses.push('notation');
}
```

`englishKey` is already computed a few lines below for the row's `data-stat-key`,
so this needs it hoisted above the class list rather than introducing anything
new, and `localizedNotationHeaders` can then be deleted.

Worth checking alongside the fix: `Cash` is rendered as `$1999952765.00`, so the
underlying value reaches the DOM with two decimal places. Once the `notation`
class is applied, `formatAllNotationElements` will condense that to `$2.0B`, but
in plain mode it becomes `$1,999,952,765.00` — grouped, and still carrying the
cents. Whether the stat screen should show cents at all is a separate question
from whether it should be formatted.

### Resolution

Closed by the suggested fix, in `ui.js`. `createHtmlTableStatistics` now resolves
the English stat key **once**, above the class list rather than twice below it, and
matches `notationHeaders` against that instead of against the displayed heading:

```js
const englishKey = getStatKeyFromLocalizedName(header.replace(':', '').trim());

if (header) {
    if (notationHeaders.includes(englishKey)) {
        bodyClasses.push('notation');
    }
    header += ':';
}
```

The unread `localizedNotationHeaders` table is deleted, along with the now-unused
`statisticsContent` import it was the only consumer of. Because the match is on
the resolved key rather than on display text, the branch works in every language
rather than in none.

`notationHeaders` also grew. The original list covered cash, the resources, the
compounds and research points; `antimatter` and `antimatterMined` were added
because they are named in the reproduction above, and then the unit-free counters
that can pass ten thousand in a long save — the science buildings, techs unlocked,
casino points spent, rip telemetry, galactic points, and the thirteen random-event
counters.

What was deliberately **not** added, and why the list stays a whitelist rather
than "every numeric stat":

- stats carrying a unit — `starShipDistanceTravelled` renders `12 ly`,
  `totalProduction` renders `450 KW / s` — where condensing the number is
  defensible but is a separate decision;
- yes/no and name stats, which have no number to format;
- `totalEnergy`, which is the interesting one: `getStatTotalEnergy()` returns
  `document.getElementById('stat2').textContent`, and that cell has *already* been
  through the notation sweep. Tagging it would condense `1.5K` a second time into
  `2K`, every frame. Formatting it correctly means giving it a real getter first.

Left open on purpose: the underlying value still reaches the DOM with two decimal
places. Plain mode reads `$1,999,952,765` rather than `$1,999,952,765.00` only
because the shared formatter drops a fractional tail below 1e-6. Whether the stat
screen should carry cents at all is a display question rather than a notation one.

### Coverage

`tests/e2e/notation/notation-live.spec.js` → *"the statistics screen follows the
notation setting"*. It opens the screen through its real side-menu row in both
modes and reports each offender by its row label.

The fix changed that spec, and the change is worth recording. Its cell filter
accepted only cells that were *wholly digits*, which is the shape the screen had
while it was broken — so the moment the formatter reached it, `$1.0B` stopped
matching and the sweep's own floor assertion became unsatisfiable. The filter now
accepts a magnitude suffix as part of a figure, and counts a cell as large enough
if it carries four digits *or* a suffix. Two positive assertions were added
underneath so the sweep cannot pass vacuously: cash must abbreviate in condensed
and be grouped in plain.

One spec in another area was written against the same broken rendering.
`tests/e2e/statistics/statistics.spec.js` → *"the cash figure follows the run's
actual cash"* stripped every non-digit, so `$1.0B` read as `1` and a granted
billion looked like a loss. Its `asNumber()` helper now expands the magnitude
suffix instead of discarding it.

A DOM check makes the fix as concrete as the defect was: the pane renders the same
111 rows, and `document.querySelectorAll('#statisticsRowTextArea .notation')` now
returns **33** where it returned 0. `stat_cash` reads `$1.0B` in condensed and
`$1,000,000,010` in plain.

---

## 28. A supply chain disruption always cut production by 75%, whatever the modal promised — ✅ FIXED

**Severity was: moderate — the number the player was shown was not the number applied.**

### Reproduction

1. Reach a run with at least one autobuyer tier owned for some material.
2. Trigger **Supply Chain Disruption** from the debug menu.
3. Read the modal, or the Events screen's effect column. Both say
   *"{itemName} production reduced by -{percentDown}%"*, where `percentDown` is a
   fresh roll between 60 and 80.
4. Measure the material's actual production. It is reduced by exactly 75%, every
   time, whatever number was shown.

### Cause

The trigger rolls a percentage and stores it on the effect:

```js
// events.js — supplyChainDisruption.trigger()
const percentDown = Math.floor(Math.random() * (80 - 60 + 1)) + 60;
startTimedEffect('supplyChainDisruption', 15 * 60 * 1000, { category, key, percentDown });
```

`percentDown` is then used for display only — by `buildTimedEffectUiDescription`
for the Events screen and by `showEventModal` for the popup. The production path
never reads it:

```js
// game.js
function getSupplyChainDisruptionMultiplier(category, key) {
    …
    return 0.25;
}
```

That constant is applied in `gainResource`, `gainCompound`, the compound rate
calculation and `addPrecipitationResource`. So the effect is always ×0.25 — a flat
75% cut — while the player is told anything from 60% to 80%.

### Fix

`getSupplyChainDisruptionMultiplier()` in `game.js` now derives the cut from the
effect's own roll, which was already being stored and already travelling with the
save:

```js
const percentDown = Number(state.percentDown);
if (!Number.isFinite(percentDown)) {
    // Effects restored from a save written before the roll was stored keep
    // the original flat 75% cut.
    return 0.25;
}

return Math.max(0, 1 - (Math.min(100, Math.max(0, percentDown)) / 100));
```

The `0.25` survives as the fallback for effects restored from a save written
before the roll was stored, so a mid-flight disruption loaded from an older save
behaves exactly as it did rather than silently becoming a no-op.

The alternative — stop rolling and tell the player a flat -75% — was a design
decision rather than a bug fix, and would have made the roll dead code.

### Coverage

`tests/e2e/random-events/random-events-live.spec.js` → *"a supply chain
disruption names a material the run automates and throttles its production"*. It
automates exactly one material so the event has one possible target, measures
production over a driven window before and after, and compares the measured drop
against the percentage the effect advertised.

---

## 29. Zeroing the trade quantity left a stale summary and a live Confirm button — ✅ FIXED

**Severity was: low — misleading UI; the trade itself moved nothing.**

### Reproduction

1. Open the Galactic Market and choose both sides of a trade.
2. Set the quantity selector to **Enter quantity** and type a real amount. The
   summary fills in and **Confirm** turns green.
3. Clear the field, or type `0`.
4. The outgoing line correctly drops to `0` — but the incoming line and the
   commission line keep the figures from the previous amount, and Confirm stays
   green and clickable.

Pressing Confirm in that state moves nothing (the commission-adjusted quantity
works out to zero through an `Infinity` division), so there is no loss. The pane
is simply showing a trade that is not on offer.

### Cause

`galacticMarketChecks()` only refreshes the summary while the outgoing quantity is
positive:

```js
if (document.getElementById('galacticMarketOutgoingQuantityText').innerHTML !== 'N/A'
    && parseNumber(document.getElementById('galacticMarketOutgoingQuantityText').innerHTML) > 0) {
    calculateIncomingQuantity();
    …
    document.getElementById('galacticMarketComissionQuantitySummaryText').innerHTML = …;
    document.getElementById('galacticMarketIncomingQuantityText').innerHTML = …;
}
```

With the quantity at zero the block is skipped, so both figures keep their last
values and `galacticMarketIncomingQuantity` keeps its last value too. The Confirm
button is armed from exactly that stale variable:

```js
if (getGalacticMarketIncomingQuantity() !== null && getGalacticMarketIncomingQuantity() > 0) {
    galacticMarketTradeConfirmButton.classList.add('green-ready-text');
```

### Fix

The `> 0` test in `galacticMarketChecks()` gained an `else` that clears what the
block would otherwise have written, so the summary and the button both track an
emptied field:

```js
} else if (document.getElementById('galacticMarketOutgoingQuantityText').innerHTML !== 'N/A') {
    setGalacticMarketIncomingQuantity(0);
    document.getElementById('galacticMarketIncomingQuantityText').innerHTML = 0;
    document.getElementById('galacticMarketComissionQuantitySummaryText').innerHTML = 0;
}
```

The `!== 'N/A'` guard keeps the branch off the "nothing selected yet" state, which
the lines just above deliberately render as `N/A` rather than as zero.

### Coverage

`tests/e2e/galactic-market/galactic-market-live.spec.js` → *"the Confirm button is
armed only while the staged trade would actually return something"*.

---

## 30. A severe market bias made the market status tooltip unreachable — ✅ FIXED

**Severity was: low — information was withheld exactly when it mattered most.**

### Reproduction

1. Open the Galactic Market and choose both sides of a trade.
2. While the bias on either side is inside ±10, hover the **Bias** line in the
   side menu. The shared tooltip appears with the item, its bias, its base price,
   its bias-adjusted price and its trade volume.
3. Trade enough to push a bias past ±10 — or set one directly — so the line turns
   red.
4. Hover it again. Nothing appears.

### Cause

`buildGalacticMarketSidebarStatus()` returns a severity class and
`updateSidebarStatusDisplays()` applies it to `#galacticMarketOption2`. Past a
magnitude of 10 that class is `red-disabled-text`, and the stylesheet says:

```css
.red-disabled-text {
    color: var(--disabled-text);
    font-weight: bold;
    pointer-events: none;
}
```

The tooltip is bound with `mouseenter` / `mousemove` on that same element, so the
colour that signals "this bias is serious" also stops the element receiving the
pointer.

The intent is visible elsewhere in the same file: the lockdown path explicitly
re-enables this one element after adding the very same class —
`el.style.pointerEvents = (option2 && el === option2) ? 'auto' : 'none'` — and the
stylesheet already carries a `.notation.red-disabled-text { pointer-events: auto
!important }` escape hatch for the same collision.

### Fix

The existing escape hatch was extended to the status line in `styles.css`, beside
the `.notation.red-disabled-text` rule it mirrors:

```css
#galacticMarketOption2.red-disabled-text,
#galacticMarketOption2.warning-orange-text {
    pointer-events: auto;
}
```

The orange band is listed too, so the rule holds whichever severity the line is
currently showing rather than only the one that happened to be broken. The
lockdown path still sets `pointerEvents = 'auto'` inline on this element, and an
inline style outranks the rule, so that behaviour is unchanged.

### Coverage

`tests/e2e/galactic-market/galactic-market-live.spec.js` → *"hovering the market
status shows the base price, the bias-adjusted price and the trade volume"*. It
hovers with a real pointer at a calm bias and again at a severe one, and asserts
the computed `pointer-events` on the element as well as the tooltip appearing —
so the rule being dropped from the stylesheet fails the spec, not just the tooltip
happening to be missing.

Closing this changed the spec once. It had pinned the rendered figures (`+2.0%`,
`6.12`), and the ten-second bias decay walks a pinned bias towards zero, so a
single tick landing mid-spec turned `+2.0%` into `+1.9%`. It now parses the
tooltip's own numbers and checks them against each other — adjusted price is base
price scaled by the bias printed beside it — which is the relationship the tooltip
exists to show and cannot drift. The sidebar severity spec next to it was pinned
the same way and got the same treatment, deriving its expected text from the live
bias through the pane's own formatting rule.

---

## 31. Six description labels lost their ids in the localisation refactor — ✅ FIXED

**Severity was: high — one of the six was dereferenced unguarded on every frame,
and the rest silently stopped several progress readouts from ever updating.**

### Reproduction

1. Start a run with the Launch Pad and a rocket built.
2. Open a rocket's pane in the Space Mining tab and press **Fuel Rocket**.
3. Watch the "Fuel:" row. It never changed to *Fuelling…*, and when the tank
   filled it never changed to *Ready For Launch…* — the Launch button never
   turned green either.
4. With that pane still open once the rocket was fuelled,
   `handleRocketFuellingChecksAndOneOffPurchases` — which the frame loop calls
   from its cost-check sweep — threw on every frame.

The same shape was visible elsewhere without the throw:

- the asteroid scan's progress bar never advanced, and its row never counted down;
- the star study and Void Seers rows never counted down either;
- a rocket's Travel row never showed *Ready To Travel*, *Mining Antimatter at …*,
  *Not Launched* or its travel progress bar;
- the starship's *Travelling To:* row never counted down.

### Cause

`createOptionRow` used to give the description label an id derived from the
**visible label text**:

```js
description.id = generateElementId(labelText, resourceString, null);
```

`generateElementId` strips a trailing colon and camel-cases what is left, so
`"Fuel:"` became `#fuelDescription` and `"Travel To:"` became
`#travelToDescription`. Commit `6930310`, during the localisation work, changed
the argument to the row's **id** instead — the label text is now translated, so
deriving a DOM id from it was no longer safe:

```js
description.id = generateElementId(labelId, resourceString, null);
```

That was the right call. What did not happen alongside it was renaming the
consumers. Six lookups then returned `null` for the whole life of a run:

| Id asked for | The row it belongs to |
|---|---|
| `fuelDescription` | `space<Rocket>AutoBuyerRow` |
| `travelToDescription` | `space<Rocket>TravelRow` |
| `travellingToDescription` | `spaceStarShipTravelRow` |
| `scanAsteroidsDescription` | `spaceTelescopeSearchAsteroidRow` |
| `studyStarsDescription` | `spaceTelescopeInvestigateStarRow` |
| `pillageTheVoidDescription` | `spaceTelescopePhilosophyBoostResourcesAndCompoundsRow` |

The `*RowDescription` names in the same family — `receptionStatusRowDescription`,
the three black hole ones, `galacticMarketLiquidateForAPRowDescription` — were
already written as row ids, which is why those still resolved and the breakage
went unnoticed. `#starDestinationDescription` looks like one of these but is not:
it is written by hand into `elementRow.innerHTML` in `ui.js`, and was never
affected.

Most of the dead lookups were stored into a variable and guarded, so they failed
silently — and took whatever else was inside the same guard with them:

```js
const searchTimerDescriptionElement = document.getElementById('scanAsteroidsDescription');
...
} else if (searchTimerDescriptionElement) {
    searchTimerDescriptionElement.innerText = ...;
    document.getElementById('spaceTelescopeSearchAsteroidProgressBar').style.width = `${pct}%`;
}
```

which is why the scan bar never moved. `travelToAsteroidChecks` returned early
from its whole first block for the same reason.

Two sites were **not** guarded, and both threw:

- `game.js`, in `handleRocketFuellingChecksAndOneOffPurchases`, called from the
  frame loop for every cost-checked element;
- `drawTab6Content.js`, in `setFuellingVisibility`. Because it threw at the top of
  the function, the `fuelledUpState` block below it never ran, so the Launch
  button kept the `red-disabled-text` it was created with and a real click on it
  was swallowed by `pointer-events: none`.

### Fix — applied

`getRowMainDescriptionLabel(rowId)` already existed in `game.js` for exactly this
problem, with a comment explaining that a row's cost label cannot be addressed by
its own id (the row's flavour container claims the same `<labelId>Description`
name and comes first in document order). It is now exported, with two wrappers for
the per-rocket rows:

```js
export const getRocketFuelDescriptionLabel = (rocket) =>
    getRowMainDescriptionLabel(`space${capitaliseString(rocket)}AutoBuyerRow`);

export const getRocketTravelDescriptionLabel = (rocket) =>
    getRowMainDescriptionLabel(`space${capitaliseString(rocket)}TravelRow`);
```

Every one of the six lookups now goes through a row id, which is the one
identifier that is stable across languages, and every site is null-guarded —
including the two that were not, so that a future id change degrades to a stale
label rather than to a dead frame loop.

Two consequences of the block in `travelToAsteroidChecks` becoming reachable
again had to be handled:

- the block is now `break`-ed out of by label rather than `return`-ed from, because
  the Travel button's own colour gate lives below it in the same function and had
  been working all along — an early return would have broken it;
- `getRocketTravelDuration()` takes no key and returns the whole map, but the
  progress-bar maths inside the block called it as `getRocketTravelDuration(rocketName)`
  and subtracted a number from an object. That had been latent for as long as the
  block was dead; it now reads `getRocketTravelDuration()[rocketName]` and guards
  against a zero total.

### Coverage

- `tests/e2e/weather/weather-live.spec.js` → *"rain grounds a fuelled rocket and
  says why"*, *"the same rocket is cleared for launch the moment the sky clears"*
  and *"a volcano grounds a fuelled rocket just as rain does"*. All three read the
  Fuel row's label and the Launch button's colour class, which is exactly what a
  player looks at before pressing Launch.

---

## 32. A megastructure star's weather was re-rolled every time the star map was drawn — ✅ FIXED

**Severity was: medium — silently rewrote a forecast and a precipitation compound
the player had already planned around.**

### Reproduction

1. Study stars until a manuscript is generated and travel to it, so a factory star
   is revealed on the map.
2. Open the **Star Data** pane and note the megastructure star's weather tendency
   and precipitation type.
3. Open the **Star Map** pane, then the Star Data pane again.
4. Both had changed. Repeating the two clicks changed them again, every time.

### Cause

`generateStarfield` in `ui.js` creates star data down two branches, and only one
of them checked whether the star had been recorded already:

```js
} else if (isFactoryStar) {
    ...
    generateStarDataAndAddToDataObject(starElement, distance);   // unconditional
} else if (isInteresting) {
    ...
    if (!checkIfInterestingStarIsInStarDataAlready(starElement.id.toLowerCase())) {
        generateStarDataAndAddToDataObject(starElement, distance);   // guarded
    }
```

`generateStarDataAndAddToDataObject` builds a whole new record — four fresh
weather probabilities, a fresh tendency, a fresh `calculatePrecipitationType()`
roll — and writes it with `setStarSystemDataObject(newStarData, 'stars', [id])`,
which replaces the entry rather than merging into it.

This was not cosmetic. `changeWeather()` draws every weather window for a system
out of that table, and `addPrecipitationResource()` reads `precipitationType` from
it, so once a player settled a megastructure star the numbers they researched were
not the numbers they got — and they changed again each time the map was opened.
The branch is reached on any draw where the star is a known factory star with a
reported manuscript, which is every draw after the manuscript is found.

### Fix — applied

The factory-star branch now carries the same guard as the interesting-star branch
beside it, so the record is created once and left alone thereafter.

### Coverage

- `tests/e2e/star-map/star-data-weather.spec.js` → *"a revealed megastructure star
  keeps its weather across repeated redraws"*, *"a redraw never changes what a
  system precipitates"* and *"a star that is already recorded is not regenerated at
  all"*. The last of those stamps each existing record with a marker the generator
  does not write, so it fails on the regeneration itself rather than on two random
  rolls happening to differ.

---

## 33. The variable debugger destroyed the live weather when its row was edited — ✅ FIXED

**Severity was: low — debug tooling only, but it corrupted state the whole energy
economy reads.**

### Reproduction

1. Open the variable debugger (Numpad `*`) and search for
   `currentStarSystemWeatherEfficiency`. It shows the live triple, for example
   `spica,0.4,rain`.
2. Click the value and submit it unchanged.
3. The weather became `NaN`. Solar generation became `NaN`, the system stat stopped
   resolving, and nothing recovered it short of the next weather window.

### Cause

`currentStarSystemWeatherEfficiency` is an array — `[system, efficiency, type]` —
but the debugger's setter map coerced it to a number:

```js
currentStarSystemWeatherEfficiency: (v) => { currentStarSystemWeatherEfficiency = Number(v); },
```

The matching reader does `String(currentStarSystemWeatherEfficiency)`, which
renders the array as `"spica,0.4,rain"`, so what the editor showed back could not
be parsed by the setter that received it. Every consumer then indexed into a
number: `getCurrentStarSystemWeatherEfficiency()[1]` is `undefined`, and
`purchasedRate * undefined` is `NaN`.

### Fix — applied

The setter parses the triple back, accepts an array as well as the rendered
string, and **rejects** anything that does not parse rather than writing a broken
value — which matters because the energy tick reads this variable on every frame.

### Coverage

- `tests/e2e/weather/weather-live.spec.js` → *"editing the live weather through the
  debugger keeps it a usable triple"*. It writes the row back at exactly the value
  it was already showing, which is the weakest thing that can be asked of an
  editor, and asserts the state is still an array naming a state with an
  efficiency.

---

## 34. The antimatter boost sound never played — ✅ FIXED

**Severity was: low — audio only, but the feature was completely dead rather than
quiet.**

### Reproduction

1. Turn sound effects on in Settings.
2. Reach a run with a rocket mining an asteroid, and open the **Mining** pane.
3. Press and hold the rate bar on the right of the diagram. The boost applies —
   extraction doubles and the bar recolours — but no sound plays, ever.

### Cause

An ordering bug in `setIsAntimatterBoostActive`:

```js
export function setIsAntimatterBoostActive(value) {
    if (getSfx() && value) {
        boostSoundManager.startBoostLoop();
    }
    if (!value) {
        boostSoundManager.stopBoostLoop();
    }
    isAntimatterBoostActive = value;   // written last
}
```

`startBoostLoop()` plays its first sound synchronously, and that first play opens
with a guard against the boost having already ended:

```js
const playBoostSound = () => {
    if (!getIsAntimatterBoostActive()) {
        this.stopBoostLoop();
        return;
    }
    ...
};
playBoostSound();
this.boostInterval = setInterval(playBoostSound, 500);
```

Because the flag was assigned *after* the loop was started, that first call read
the old value — `false` — concluded the boost was over, and stopped the loop it
had just started. `boostSoundStarted` went back to `false` before the caller's
next statement, so the interval never fired either.

The guard itself is right: it is what stops the loop when the player releases the
bar. It was the write order around it that was wrong.

### Fix — applied

`isAntimatterBoostActive = value;` now happens first, before either the start or
the stop, so the loop's own guard sees the state it is being started for.

### Coverage

- `tests/e2e/space-mining/space-mining-live.spec.js` → *"the boost sound loops
  while the boost is held and stops when it ends"* and *"the boost stays silent
  when sound effects are turned off"*. The first is what failed; the second is its
  companion, and proves the fix did not simply make the loop unconditional.

This one was found by the spec run rather than by reading the code — the boost
gesture is driven for real, and the sound is asserted separately from the effect,
so "the boost works but is silent" was distinguishable from "the boost does not
work".

---

## 35. A star is two different distances away depending on which code path asks — 🔴 OPEN

**Severity: low-medium — no crash and no lost progress, but "is this star studied"
can be answered two ways, and star distances depend on the size of a DOM element.**

### Reproduction

1. Play into a run with stars studied, and open the **Star Map** so the star data
   is populated.
2. Read a star's `distance` out of the star data object — that is the figure its
   fuel and AP were computed from.
3. Call `getStarDataAndDistancesToAllStarsFromSettledStar(getCurrentStarSystem())`
   and read the same star's distance out of the result.
4. They differ. In a sample run, Avior was recorded at `0.87` ly and calculated at
   `0.84` ly.

### Cause

`generateStarfield` derives each star's coordinates from the **measured size of
the container it is being drawn into**:

```js
const containerRect = starfieldContainer.getBoundingClientRect();
const containerWidth = containerRect.width;
const containerHeight = containerRect.height;
...
const x = getSeededRandomInRange(seed + i + numberOfStars, 0, containerWidth - 30) + containerLeft;
const y = getSeededRandomInRange(seed + i + numberOfStars * 2, 0, containerHeight) + containerTop;
const z = getSeededRandomInRange(seed + i + numberOfStars * 3, 10, 100000);
```

and `calculate3DDistance` then combines all three axes.

The seed makes the *proportions* reproducible, but not the *scale*: `x` and `y`
are in pixels of whatever box the field was drawn into. Two callers draw into
different boxes:

| Caller | Container | Effect on x and y |
|---|---|---|
| The Star Map pane | `#optionContentTab5`, a real panel | spread across the panel |
| Everything in `calculationMode` | `document.createElement('div')`, never attached | width and height are `0`, so **every star collapses to the same x and y** |

`containerLeft` / `containerTop` cancel out in a difference, so they do not
matter — but the width and height do. In the dummy container the x/y term
vanishes entirely and only `z` survives, which is why the calculated distance is
always the smaller of the two. The gap is bounded by
`sqrt(width² + height²) / 1000`, roughly 1.3 ly at the shipped panel size.

The two paths are not interchangeable, but they are used interchangeably. The
drawn map decides whether a star is *studied* (`distance <= getStarVisionDistance()`)
and writes the record the player's fuel and AP come from. The dummy-container
path is read by:

- the star-map search's result colouring (`isStudied`);
- `rollForAncientManuscriptGeneration`, which picks a manuscript star by
  `distance > oldRange && distance <= newRange`;
- the rapid-expansion filter after a conquest (`distanceFromSettledStar <= 10`);
- `hasStudiedAllOTypeStars`, which gates an achievement.

So a star can be inside the range for one and outside it for the other: a search
result coloured as studied that the map still draws as a faint twinkle, a
manuscript placed on a star the map has not revealed, or the "studied every
O-type" achievement granted early.

There is a second consequence of the same line: because the panel is measured
rather than fixed, **a star's distance depends on the window size**. Existing
records are not regenerated, so a resize does not rewrite a run's fuel costs —
but a star first studied after a resize gets a different distance than it would
have before.

### Suggested fix — needs a decision, not applied

The clean fix is to stop deriving simulation coordinates from layout: generate
`x` and `y` over a **fixed nominal field** and use the real container only to
place the elements on screen. That makes a star's distance one number, stable
across window size, tab state and calculation mode.

It is not applied here because it is a balance decision as much as a bug fix:
changing the x/y scale moves every newly generated star's distance, and distance
feeds fuel cost and AP reward. The options, in increasing order of disruption:

1. **Leave the records canonical and fix the calculation path** — have
   `calculationMode` use the same measured container as the drawn map when one is
   available. Smallest change, keeps every existing number, but the fallback when
   the Interstellar tab has never been drawn is still wrong.
2. **Fix the scale to a constant** (the shipped panel size), so both paths agree
   and nothing depends on layout. Existing star records are untouched — they are
   only generated once — so live saves keep their fuel costs, and only newly
   studied stars use the stable figure.
3. **Normalise coordinates to 0..1** and drop the pixel scale from the distance
   maths entirely. Cleanest, but rescales every distance in the game.

Option 2 looks like the best trade: one stable number per star, no change to any
save already in flight, and the shift for new stars is under 1.3 ly.

### Coverage

- `tests/e2e/star-map/star-map-live.spec.js` → *"a star is the same distance away
  whichever code path asks"*. It compares every studied star's recorded distance
  against the calculated one and lists the ones that disagree, so the failure
  names the stars rather than just asserting a number.

---
