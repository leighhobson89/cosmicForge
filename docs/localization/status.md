# Localization Status

Status as of HEAD `275f034` + in-session fixes. Five languages: **en, es, de, it, fr**.

## Summary

| | Items | Share |
|---|---:|---:|
| 🟢 Done | 4 | 40% |
| 🟠 Partial | 0 | 0% |
| 🔴 Not started | 6 | 60% |
| **Total tracked items** | **10** | |

The catalogue itself is in good shape — **1,626 keys × 5 languages, complete parity, zero keys
referenced in code that are missing from the JSON**. What remains is finishing and wiring, tracked
as the 10 items below.

The area now has **67 automated specs** in `tests/e2e/localization/`, covering catalogue integrity,
the resolution chain, runtime switching, the reverse lookup, and a five-language sweep of every tab
at a late-game state. Several of the open items below are held in place by *ratchets* in those
specs — a recorded baseline that may fall but must never rise — so the remaining work can be done
incrementally without losing ground. See [Test coverage](#test-coverage) at the foot of this
document.

## Status at a glance

| # | Item | Status | Risk if left undone |
|---|---|:--:|---|
| 1 | [Language resolution & persistence](#1-language-resolution--persistence) | 🟢 Done | — |
| 2 | [Compound reverse-lookup performance](#2-compound-reverse-lookup-performance) | 🟢 Done | — |
| 3 | [Player-facing language selector](#3-player-facing-language-selector) | 🟢 Done | — |
| 4 | [Full redraw on language change](#4-full-redraw-on-language-change) | 🟢 Done | — |
| 5 | [Extract remaining hardcoded strings](#5-extract-remaining-hardcoded-strings-478) | 🔴 Not started | Medium — ~478 strings never translate |
| 6 | [Remove eval() from interpolation](#6-remove-eval-from-interpolation-path) | 🔴 Not started | Medium — latent code-injection surface |
| 7 | [Harden the key checker](#7-harden-the-key-checker) | 🔴 Not started | Medium — can't safely prune dead keys |
| 8 | [Translation quality pass](#8-translation-quality-pass) | 🔴 Not started | Low — a handful of possibly-untranslated values |
| 9 | [Layout under translation](#9-layout-under-translation) | 🔴 Not started | Medium — German runs 20–35% longer than English |
| 10 | [Frame-loop tab gates compare English names](#10-frame-loop-tab-gates-compare-english-names) | 🔴 Not started | **Critical — large parts of the UI stop updating outside English** |

> **Item 10 is now the highest-priority remaining item**, ahead of everything else on this list. It
> was found while building the test suite and is a regression introduced by the localization work:
> translating the tab labels silently disables ~19 per-frame gates that still compare against the
> English names.

---

## 1. Language resolution & persistence

**🟢 Done**

The game defaulted to Spanish (`let language = 'es'`) with no persistence — `initLocalization()`
ignored its own parameter and called `setLanguage(getLanguage())`, a no-op.

**Fixed:**

- `constantsAndGlobalVars.js` — default language changed to `'en'`.
- `localization.js` — added a validated resolution chain: explicit request → stored preference →
  browser/OS locale → English. Full locale tags normalise (`fr-CA` → `fr`), case-insensitively;
  unsupported and corrupt values fall through instead of reaching the lookup tables; a catalogue
  missing the resolved language degrades to English rather than blanking the UI; the resolved
  language persists to `localStorage` under `cosmicForgeLanguage`; `localStorage` failures
  (private browsing, locked-down Electron partitions) are swallowed rather than breaking boot.
- `ui.js` — the language switcher now calls `initLocalization(selected)` instead of
  `setLanguage(selected)` + a bare `initLocalization()`, so the resolution chain can't overwrite
  an explicit choice with the stored one.

New exports from `localization.js`: `getSupportedLanguages()`, `isSupportedLanguage()`,
`persistLanguage()`, `LANGUAGE_STORAGE_KEY`, `DEFAULT_LANGUAGE`.

Verified against 10 resolution cases (clean install per locale, stored-beats-browser,
explicit-beats-stored, corrupt values, tag normalisation, missing catalogue entry) — all pass.

---

## 2. Compound reverse-lookup performance

**🟢 Done**

`reverseLocalizeForCompounds()` walked `Object.entries()` over the full 1,626-key language table,
lower-casing both sides of every comparison, to map a translated compound name back to its
internal key. It was reached from `compoundCostSellCreateChecks()` →
`checkStatusAndSetTextClasses()`, which `gameLoop` runs over every cached element, **every frame**.

Both suggested options were taken, because they fix different halves of the problem — the first
removes the call from the hot path, the second makes the call cheap wherever else it is used.

**Fixed:**

- `ui.js` — the storage-row builder now resolves the parsed second compound name to its internal
  key **once, when the row is built**, and stores that in `dataset.argumentCheckQuantity2`. The
  stored key is language-independent, so the row also stays correct if it outlives a language
  change.
- `game.js` — `compoundCostSellCreateChecks()` reads `dataset.argumentCheckQuantity2` directly. The
  per-frame reverse mapping is gone, and `reverseLocalizeForCompounds` is no longer imported there
  at all.
- `game.js` — the secondary cost label now goes through a new `displayNameForCompoundKey()`, which
  localizes a real compound key via `compound${Name}` and falls back to the raw parsed word
  otherwise. Previously the label only rendered correctly because the stored value happened to
  already be the translated name; with an internal key stored, it needs a real lookup.
- `localization.js` — `reverseLocalizeForCompounds()` now consults a per-language `Map` built on
  first use by `getCompoundReverseIndex()`, and `setLocalization()` clears the cache whenever the
  catalogue is re-fetched. The index is keyed **by language**, not by "whatever language is
  currently active", because callers pass the language they want explicitly.

Behaviour is preserved exactly: only keys beginning `compound` are eligible, matching stays
case-insensitive, the first declaration wins on a duplicate value (as the linear scan did, by
returning on its first match), and an unresolved name is still returned unchanged.

**Measured**, 2,000 lookups in Chromium:

| | Before | After |
|---|--:|--:|
| Hit (`Glas` → `glass`) | 456ms | 0.2ms |
| Miss (unknown name) | 455ms | 0.2ms |

The miss was the worst case before — it walked all 1,626 keys — and is the common case in the live
caller, since most description lines name no second compound.

Guarded by `tests/e2e/localization/compound-reverse-lookup.spec.js`: twelve specs covering the
behavioural contract, a 150ms budget for 2,000 calls, and a DOM-level assertion that the storage
row stores `concrete` rather than `Beton` / `Hormigón` / `Cemento` / `Béton` in all five languages.

---

## 3. Player-facing language selector

**🟢 Done**

Previously the only switcher was the debug panel, reachable via Numpad `*` and gated to
non-Electron + non-demo + cheats-enabled (or a save name containing `Test1981`) — unreachable for
real players.

**Added:** a `Language:` row in **Settings → Game Options**, directly beneath *Toggle Full Screen*,
using the same custom `createDropdown` component as the theme switcher. Options display in their
own language (English, Español, Deutsch, Italiano, Français), and selecting one applies
immediately with no confirm button, matching the theme switcher's behaviour.

Two new keys were added across all five languages (`settingsLanguageRowLabel`,
`settingsLanguageRowDescription`), keeping parity at 1,626 keys each.

The debug panel switcher now routes through the same `relocalizeAll()` instead of duplicating the
redraw logic.

---

## 4. Full redraw on language change

**🟢 Done**

Added `relocalizeAll(language)` in `ui.js` as the single entry point for a runtime language change.
It calls `initLocalization(language)` (which resolves, sets and persists the choice), re-runs
`initialiseDescriptions()` and `initialiseStaticButtonLabels()`, calls `updateTabHotkeys()` so tab
labels and hotkey bindings stay in sync, rewrites the current pane's header and description, then
redraws the active tab via the appropriate `drawTabNContent()`.

Both the Settings dropdown and the debug panel call it, so the redraw sequence lives in exactly one
place.

Verified end-to-end in a real browser: switching to German updated the row label (`Language:` →
`Sprache:`), the dropdown text (`English` → `Deutsch`), the description, and the tab bar
(`Resources` → `Ressourcen`), with zero console errors, and the choice survived a reload.

**Still open:** other tabs are refreshed lazily when next visited rather than eagerly, and open
modals / the news ticker are not re-rendered mid-flight. Worth a tab-by-tab pass once item 5 lands.

---

## 5. Extract remaining hardcoded strings (~478)

**🔴 Not started**

~400 prose literals in JS plus ~78 visible text nodes in `index.html` (heuristic count, includes
some internal logging, but spot checks confirm plenty of genuine player-facing copy).

| Priority | Files | Approx | Why |
|---|---|--:|---|
| 1 | `onboarding.js`, `index.html` | ~105 | Every new player sees these first |
| 2 | `events.js`, `drawTab3/7/9Content.js` | ~92 | Random event outcomes, ability-unlock notifications |
| 3 | `game.js`, `ui.js` | ~130 | Fleet/diplomacy panels, scan results, dropdown labels |
| 4 | `saveLoadGame.js` | ~38 | Cloud save status and error messages |
| 5 | `resourceDataObject.js` | ~52 | Check display names vs internal keys first |
| — | `constantsAndGlobalVars.js` | ~35 | Debugger tooltips — fine to leave in English |

---

## 6. Remove eval() from interpolation path

**🔴 Not started**

`interpolateTemplateLiteral()` runs `eval()` on any localized string containing `${…}`. No value in
the current catalogue uses it — all 1,626 entries in all five languages checked, count is zero — so
the path is dead today. It re-arms the moment a translator types `${` into a string, and it
evaluates content from a data file. Delete the function and the branch that calls it.

`catalogue-integrity.spec.js` now fails the build if any value in any language contains `${`, so
the path cannot be re-armed silently while this item is open.

---

## 7. Harden the key checker

**🔴 Not started**

`validateLocalization.cjs` checks key parity across languages — why the integrity numbers are
clean — but can't see **dynamically constructed keys** (81 call sites): `autoBuyerName*` resolved
through the migration map in `patches.js`, and `resource${Name}` / `compound${Name}` built by
concatenation at `ui.js:1790` and `ui.js:1799`.

129 keys currently appear unreferenced as a result. Most are explained by the above. **Do not
delete any until the checker resolves these patterns** — removing a key that's actually built at
runtime is the hardest class of bug to spot in a language you don't read.

Widening the search from `localize('key')` call sites to *any* quoted string literal in shipped
source brings that number down from 129 to **21**, which is the number
`catalogue-integrity.spec.js` currently ratchets against. All 21 are explained: 14 menu and modal
keys wired through `index.html` element ids, and 7 `compoundCreateQty*` / `compoundRecipePattern`
keys built by concatenation. That broader scan is a reasonable basis for the hardened checker.

Also add: fail the check on any empty value (all five languages currently have 3, the casino
special-prize suffixes — pinned as an exact allowlist by the same spec). Then wire the checker into
the build so it runs before packaging. It already runs as an assertion in the E2E suite.

---

## 8. Translation quality pass

**🔴 Not started**

Values identical to English, per language: **es 35, de 41, it 37, fr 44**. Many will be
legitimately identical — proper nouns, star names, chemical symbols — but some may be untranslated
placeholders. The parity checker can't distinguish; needs one pass with a native reader per
language.

---

## 9. Layout under translation

**🔴 Not started**

German runs 20–35% longer than English. The UI uses fixed-width panels and hand-placed `<br>`
breaks throughout, so overflow and bad wrapping will surface there first. Needs a full session
played in German, checking modals, tooltips, sidebar labels and the tech tree.

The automated sweep gives a starting point and a floor. Across all five languages and all nine
tabs, at a late-game state:

- **No tab overflows the viewport horizontally** in any language. That is asserted absolutely.
- Exactly **two** controls are clipped by their translated label and are not clipped in English:
  `#sellAllResourcesButton` and `#sellAllCompoundsButton`, both laid out at a fixed 81px against
  103px of content in es/it/fr and 135px in de. See `tests/docs/known-issues.md` #7.

`tests/e2e/localization/translated-ui.spec.js` measures clipping as a diff against the English
layout of the same tab, so pre-existing layout bugs cancel out and only translation-caused overflow
is reported. The two known ids are allowlisted; anything else fails. Fixing them means deleting
them from that allowlist.

Note that this only catches *clipping* (`scrollWidth > clientWidth`). Bad wrapping, overlapping
absolute positioning and truncated modals still need a human pass.

---

## 10. Frame-loop tab gates compare English names

**🔴 Not started — highest priority remaining item**

`setCurrentTab` stores the tab's rendered text (`ui.js:10521`), and `localizeTabLabels()` /
`showTabsUponUnlock()` translate that text. At least **19 call sites** then gate per-frame work on
the English name — `getCurrentTab()[1].includes('Compounds')`, `…includes('Resources')`,
`…includes('Energy')`, `…includes('Space Mining')`, `…includes('Interstellar')`,
`…includes('Galactic')` — so all of them are false in Spanish, German, Italian and French.

The visible result is that price formatting, affordability colouring, star map updates and market
and casino refreshes silently stop outside English. Reproduce it on **Compounds → Water**: in
English the cost row reads `999.9M Water, 300.0M Concrete` and updates every frame; in German it
freezes on the raw draw output with the secondary cost missing entirely.

This is a regression introduced by the localization work, and it is larger in blast radius than
anything else left on this list.

The fix is small — store the canonical name the DOM already carries:

```js
setCurrentTab([dynamicIndex, tab.getAttribute('data-name') ?? tab.textContent]);
```

— followed by an audit of the 19 gates for any that intentionally wanted the localized value. Full
write-up, call-site list and regression-spec plan in
[`tests/docs/known-issues.md`](../../tests/docs/known-issues.md) #3.

---

## Suggested order

1. ~~Language resolution and persistence~~ 🟢
2. ~~Player-facing selector + `relocalizeAll()`~~ 🟢 (items 3 and 4)
3. ~~Compound reverse-lookup performance~~ 🟢 (item 2)
4. **Frame-loop tab gates (item 10)** — largest blast radius, smallest fix
5. Extract remaining strings by visibility priority (item 5)
6. Remove the `eval()` (item 6)
7. Harden the checker and wire it into the build (item 7)
8. Translation quality pass, then the German layout pass (items 8–9)

## Test coverage

67 specs in `tests/e2e/localization/`, all passing. Run them with
`node tests/run-e2e.mjs localization`.

| File | Specs | Covers |
|---|--:|---|
| `catalogue-integrity.spec.js` | 15 | Parity, value types, empty values, duplicate keys, dead `eval()` path, referenced vs. unreferenced keys, unbalanced HTML. No browser needed. |
| `language-resolution.spec.js` | 19 | The full resolution chain against real browser locales, regional tag normalisation, corrupt and unsupported values, persistence across restart, storage failure. |
| `language-switching.spec.js` | 14 | The Settings selector, the debug switcher, `relocalizeAll` return contract, round trips, category headers. |
| `compound-reverse-lookup.spec.js` | 12 | Item 2 — the behavioural contract, the frame budget, and the stored internal key. |
| `translated-ui.spec.js` | 7 | Five languages × nine tabs at a late-game state: raw-key leaks, viewport overflow, translation-caused clipping, constructed keys, frame-loop survival. |

### Ratchets

Four assertions are deliberately baselines rather than absolutes, so the remaining items can be
closed incrementally. Each may fall; none may rise.

| Ratchet | Baseline | Item |
|---|--:|---|
| Values identical to English | es 35, de 41, it 37, fr 44 | 8 |
| Keys not referenced anywhere in shipped source | 21 | 7 |
| Sanctioned empty values | 3 (the casino suffix keys) | 7 |
| Controls clipped by translation but not by English | 2 (the `Sell All` buttons) | 9 |

## Related

- Test coverage plan: [`tests/docs/areas/localization.md`](../../tests/docs/areas/localization.md)
- Live defects found while building the suite: [`tests/docs/known-issues.md`](../../tests/docs/known-issues.md) #3–#9
- Overall coverage report: [`tests/docs/coverage-report.md`](../../tests/docs/coverage-report.md)
