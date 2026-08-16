# Localization Status

Status as of HEAD `114260c` + in-session fixes. Five languages: **en, es, de, it, fr**.

## Summary

| | Items | Share |
|---|---:|---:|
| 🟢 Done | 3 | 33% |
| 🟠 Partial | 0 | 0% |
| 🔴 Not started | 6 | 67% |
| **Total tracked items** | **9** | |

The catalogue itself is in good shape — **1,624 keys × 5 languages, complete parity, zero keys
referenced in code that are missing from the JSON**. What remains is finishing, wiring and one
performance fix, tracked as the 9 items below.

## Status at a glance

| # | Item | Status | Risk if left undone |
|---|---|:--:|---|
| 1 | [Language resolution & persistence](#1-language-resolution--persistence) | 🟢 Done | — |
| 2 | [Compound reverse-lookup performance](#2-compound-reverse-lookup-performance) | 🔴 Not started | High — runs in the 60fps frame loop |
| 3 | [Player-facing language selector](#3-player-facing-language-selector) | 🟢 Done | — |
| 4 | [Full redraw on language change](#4-full-redraw-on-language-change) | 🟢 Done | — |
| 5 | [Extract remaining hardcoded strings](#5-extract-remaining-hardcoded-strings-478) | 🔴 Not started | Medium — ~478 strings never translate |
| 6 | [Remove eval() from interpolation](#6-remove-eval-from-interpolation-path) | 🔴 Not started | Medium — latent code-injection surface |
| 7 | [Harden the key checker](#7-harden-the-key-checker) | 🔴 Not started | Medium — can't safely prune dead keys |
| 8 | [Translation quality pass](#8-translation-quality-pass) | 🔴 Not started | Low — a handful of possibly-untranslated values |
| 9 | [Layout under translation](#9-layout-under-translation) | 🔴 Not started | Medium — German runs 20–35% longer than English |

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

**🔴 Not started — highest priority remaining item**

`reverseLocalizeForCompounds()` walks `Object.entries()` over the full 1,624-key language table,
lower-casing both sides of every comparison, to map a translated compound name back to its
internal key.

It is reached from `compoundCostSellCreateChecks()` → `checkStatusAndSetTextClasses()`, which
`gameLoop` runs over every cached element, **every frame**. This is a regression introduced by the
localization work, not a pre-existing issue.

Two options, best first:

1. Store the internal key in a `data-` attribute on the element — no reverse mapping needed at all.
2. Build a reverse map once inside `initLocalization()`, look up in O(1).

Do this before item 5 — the cost grows with the catalogue.

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
the current catalogue uses it — all 1,624 English entries checked, count is zero — so the path is
dead today. It re-arms the moment a translator types `${` into a string, and it evaluates content
from a data file. Delete the function and the branch that calls it.

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

Also add: fail the check on any empty value (all five languages currently have 3). Then wire the
checker into the build so it runs before packaging.

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

---

## Suggested order

1. ~~Language resolution and persistence~~ 🟢
2. ~~Player-facing selector + `relocalizeAll()`~~ 🟢 (items 3 and 4)
3. Compound reverse-lookup performance (item 2 — grows worse with time, do before item 5)
4. Extract remaining strings by visibility priority (item 5)
5. Remove the `eval()` (item 6)
6. Harden the checker and wire it into the build (item 7)
7. Translation quality pass, then the German layout pass (items 8–9)

## Related

- Test coverage plan: [`tests/docs/areas/localization.md`](../../tests/docs/areas/localization.md)
- Overall coverage report: [`tests/docs/coverage-report.md`](../../tests/docs/coverage-report.md)
