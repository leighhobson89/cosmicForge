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
