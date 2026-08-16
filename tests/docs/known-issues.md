# Known Issues Found by the E2E Suite

Live defects discovered while building the test suite. Each is reproducible and
currently worked around in the harness so it does not mask unrelated failures.

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

## 3. Every frame-loop tab gate breaks outside English

**Severity: critical — large parts of the UI stop updating in four of the five
shipped languages.**

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

### Regression spec to add once fixed

`tests/e2e/localization/compound-reverse-lookup.spec.js` already measures this
row in all five languages; its secondary-cost assertion is currently scoped to
English with a comment pointing here. Widening that assertion to `LANGUAGES` is
the regression test.

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

## 5. `relocalizeAll()` throws when no pane has been opened yet

**Severity: medium — latent; not reachable through the Settings selector.**

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

### Suggested fix

`const pane = getCurrentOptionPane() ?? '';` at the top of each
`drawTabNContent()`, or resolve it once in `relocalizeAll` and pass it down.

### Harness workaround

Every spec that calls `relocalizeAll` directly opens a pane first.

---

## 6. Category headers relocalize by text matching and get permanently stranded

**Severity: medium — visible stale text on the Resources tab.**

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

### Regression spec to add once fixed

`tests/e2e/localization/language-switching.spec.js` currently asserts only the
first switch out of English. Replace it with a walk over all 20 ordered language
pairs, asserting the expected form after each.

---

## 7. `Sell All` buttons clip their translated label

**Severity: low — cosmetic, but present in four of five languages.**

`#sellAllResourcesButton` (Resources) and `#sellAllCompoundsButton` (Compounds)
are laid out at a fixed 81px. English fits; every other language overflows:

| Language | Content width | Button width |
|---|--:|--:|
| en | 81 | 81 |
| es / it / fr | 103 | 81 |
| de | 135 | 81 |

This is the first concrete instance of `docs/localization/status.md` item 9
(layout under translation). `#activateGridButton` also clips, but it clips in
English too, so it is a pre-existing layout bug rather than a translation one.

`tests/e2e/localization/translated-ui.spec.js` allowlists exactly these two ids
and fails on any *other* control that a translation clips, measured as a diff
against the English layout of the same tab.

---

## 8. `reverseLocalizeForCompounds` collides with the `compoundCreateQty` family

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

The behaviour is pinned by a spec in
`tests/e2e/localization/compound-reverse-lookup.spec.js` so that reshaping the
lookup cannot change it by accident.

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
