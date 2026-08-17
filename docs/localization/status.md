# Localization Status

Status as of HEAD `0a11c3b` + in-session work. Five languages: **en, es, de, it, fr**.

## Summary

| | Items | Share |
|---|---:|---:|
| 🟢 Done | 8 | 80% |
| 🟠 Partial | 0 | 0% |
| 🔴 Not started | 2 | 20% |
| **Total tracked items** | **10** | |

The catalogue is **2,605 keys × 5 languages, complete parity, zero keys referenced in code that are
missing from the JSON**. Item 5 — the string extraction — is now **done**: every player-facing
literal in every shipped source file resolves through the catalogue. What remains is the checker
hardening (item 7) and the German layout pass (item 9), neither of which is an extraction task.

The area has **84 automated specs** in `tests/e2e/localization/`, covering catalogue integrity, the
resolution chain, runtime switching, tab identity and intro pages, the reverse lookup, the extraction
backlog, and a five-language sweep of every tab at a late-game state. All 84 pass, as does the whole
**257-spec** E2E suite. Two of the open items are held in place by *ratchets* in those specs — a
recorded baseline that may fall but must never rise. See
[Test coverage](#test-coverage) at the foot of this document.

## Status at a glance

| # | Item | Status | Risk if left undone |
|---|---|:--:|---|
| 1 | [Language resolution & persistence](#1-language-resolution--persistence) | 🟢 Done | — |
| 2 | [Compound reverse-lookup performance](#2-compound-reverse-lookup-performance) | 🟢 Done | — |
| 3 | [Player-facing language selector](#3-player-facing-language-selector) | 🟢 Done | — |
| 4 | [Full redraw on language change](#4-full-redraw-on-language-change) | 🟢 Done | — |
| 5 | [Extract remaining hardcoded strings](#5-extract-remaining-hardcoded-strings) | 🟢 Done | — |
| 6 | [Remove eval() from interpolation](#6-remove-eval-from-interpolation-path) | 🟢 Done | — |
| 7 | [Harden the key checker](#7-harden-the-key-checker) | 🔴 Not started | Medium — can't safely prune dead keys |
| 8 | [Translation quality pass](#8-translation-quality-pass) | 🟢 Done | — |
| 9 | [Layout under translation](#9-layout-under-translation) | 🔴 Not started | Medium — German runs 20–35% longer than English |
| 10 | [Frame-loop tab gates compare English names](#10-frame-loop-tab-gates-compare-english-names) | 🟢 Done | — |

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
modals / the news ticker are not re-rendered mid-flight. Item 5 has since landed, so this is now the
natural next tab-by-tab pass.

Note that the events-history tables and the rocket / starship status rows *do* follow a language
change now — they resolve their display name from the canonical id rather than from the value stored
in the save. See item 5's "Patterns that recur in this half".

---

## 5. Extract remaining hardcoded strings

**🟢 Done**

979 keys were added in total (1,626 → 2,605): 60 for the static shell and tutorial, 467 for the nine
`drawTab*Content.js` files, and **452 for the support files** — `ui.js`, `game.js`, `events.js`,
`constantsAndGlobalVars.js`, `resourceDataObject.js` and `saveLoadGame.js`.

### Done

**`index.html` — the static shell, 83 elements.** Every statically-authored player-facing label now
carries a `data-loc="<key>"` attribute, and `initialiseStaticButtonLabels()` is a single sweep over
those elements. That replaced ~200 lines of hand-written id-to-key blocks and fixed two bugs with
them:

- **~20 of those ids did not exist in `index.html`** — `energyStorageOption` for what is actually
  `energyOption`, `contactOption` for `tab9ContactDevOption`, and *every* tab-9 entry — so those
  side-menu labels were never translated in any language. Three of the tab-9 entries
  (`Visual`, `Game Options`, `Saving / Loading`) had no id at all.
- **The category headers relocalized by text matching**, which stranded them permanently. That is
  closed; see item 9's note and `tests/docs/known-issues.md` #6.

New keys: the five stat-bar labels, `categoryAchievementsAndStats`, `categoryOptions`,
`headerMainPower`, `headerMainSettings`, `modalStartFullScreenLabel`.

`tab9Intro` also now reads *Settings* / *Einstellungen* rather than the ☰ glyph — it was pointed at
`tabHeaderSettings`, which is the tab *button's* label.

**`onboarding.js` — the whole tutorial.** 40 instruction strings, the exit button, the completion
modal and the YES/NO prompt labels.

The step table addresses some targets by the text the player can see rather than by id. Those
needles are authored in English, so a translated build stalled the tutorial on its first step.
`localizeOnboardingNeedle()` now maps each authored needle to the catalogue key the UI renders it
from — including the three auto-buyer buttons, which are rebuilt from the `buttonAddPerSecond`
template. The step table stays readable in English; matching happens in the active language.

**`drawTab3Content.js` — 77 button labels.** The 74 identical `Research` buttons (new key
`buttonResearch`) and the three `Add N Research /s` science upgrades, which now reuse the existing
`buttonAddPerSecond` template rather than composing the string inline.

**`game.js` — 5 frame-loop labels.** The power-grid button's three states
(`Power On` / `Power Off` / `Dyson Sphere`), the AP stat label and the antimatter stat label. These
are written by the frame loop, so they stayed English while everything around them translated.

**The nine `drawTab*Content.js` files — 467 keys.** Every player-facing literal in the draw
functions now resolves through the catalogue. By tab:

| File | Keys | Covers |
|---|--:|---|
| `drawTab1Content.js` | 1 | Only the *Already Increased!* storage tooltip was left; the rest was already done |
| `drawTab2Content.js` | 13 | Battery and power-plant rows, the *Add N MWh* / *Add N KW /s* buttons, Activate/Deactivate |
| `drawTab3Content.js` | 89 | **The `techName*` family** — all 58 tech display names — plus the megastructure rows, the Research pane, the philosophy abilities and their 19 effect notifications |
| `drawTab4Content.js` | — | Reused tab 1's keys; two stragglers fixed |
| `drawTab5Content.js` | 76 | Star map modes and search, the star table, star-ship modules, the lifeform scan panel, fleet hangar, diplomacy |
| `drawTab6Content.js` | 50 | Space telescope, launch pad, rocket miners, the asteroid table, fuelling and travel |
| `drawTab7Content.js` | 124 | Rebirth, the market, all four casino games and their prize tables, ascendency perks, the black hole |
| `drawTab8Content.js` | 30 | Sector scanning, the deployables and the five cosmic-rip techs |
| `drawTab9Content.js` | 84 | Every settings row and description, the currency/notation/theme/auto-save dropdowns, the exit and hard-reset modals, the events tables |

The tech display names were the block called out above as the only non-mechanical part, and they
are now done: 58 names × 4 languages, as one pass.

Three patterns recur and are worth knowing before touching this area again:

- **Composed names beat duplicated ones.** Megastructure rows read `<structure> <stage>`; the four
  structure names already existed as `megaStructureTTName*`, so only five stage words were added
  rather than twenty full labels. The same reasoning gives one `casinoPrizeDoubleMaterial` template
  instead of six *Double your quantity of X* strings.
- **Names that live in game data are looked up from the key, not carried beside it.** New
  `localizeMaterialName(name, section, language)` in `localization.js` turns the `[quantity, key,
  section]` price tuples the data files use into a display name, and the same idea keys star-ship
  modules off their element id and ascendency perks off their buff key. This is why the
  unreferenced-key ratchet rose — see below.
- **A stored value is not a label.** Asteroid rarity, civilization level, attitude, threat level and
  the cosmic-rip prerequisite lists are all English words held in the save and branched on in code.
  Each is now rendered through a small map at the point of display while the stored value stays
  canonical, which is the same separation item 10 established for tab names.

**Three English-text comparisons were removed** in passing — the same class of latent bug as item 10,
each of which would have been false in four languages:

- `drawTab8Content.js` gated a sector click on `labelEl.textContent !== 'SCANNED!'`. The state now
  rides on `dataset.scanned`, which `game.js` sets alongside the text.
- `drawTab5Content.js` chose the active star-map mode button with
  `buttonElement.innerHTML.toLowerCase() === getStarMapMode()`. The button list now carries its
  canonical mode next to its label key.
- `drawTab7Content.js` decided whether to append a prize detail line by looking for the words
  "double" and the material name inside the rendered label. It now branches on the shape of the
  award object.

**Outside the draw functions**, three files needed a matching change or the extraction would have
been invisible:

- `game.js` — the frame loop rewrites the energy-building cost lines every tick, so it was
  overwriting the translated material names a frame after `drawTab2Content` wrote them. It now uses
  the same `localizeMaterialName` mapping. It also writes the cosmic-rip sector scan labels.
- `ui.js` — `disableStorageNotificationActionIfShowing` had the *Already Increased!* tooltip as a
  default parameter value; it now resolves through the catalogue per call, so it follows a runtime
  language change, and the seventeen call sites no longer pass the literal at all.
- `localization.js` — gained the exported `localizeMaterialName` described above.

### The support files — 452 keys

The estimate in the previous revision of this document was ~155 literals across five files. The real
figure was about three times that, because the estimate counted only bare prose and missed the
composed strings — every `${...} storage is full.`, every `Quantity: ${n}`, every tooltip line built
from a label and a value. By file:

| File | Keys | Covers |
|---|--:|---|
| `ui.js` | ~190 | Every stat and energy tooltip, the market and megastructure tooltips, rocket and starship status labels, weather notices, battle and diplomacy result lines, the star map warnings, the two end-game cinematics |
| `game.js` | ~120 | Battle and colonisation outcomes, travel and fuelling status, the Black Hole panel, sell/create/fuse notifications, the tech-researched notice, the generated battle anomalies and lifeform traits |
| `events.js` | 71 | The thirteen random-event names, every timed-effect and instant-event description, the expiry notices, the stock-loss reasons, the debug triggers |
| `constantsAndGlobalVars.js` | 31 | The variable debugger's eighteen section headings and its ten interaction strings, the Void Seer prize labels, the stats-panel `Yes`/`No`/`N/A`/`ly` values |
| `saveLoadGame.js` | 15 | Cloud-save status, load and import failures, the clipboard notices |
| `resourceDataObject.js` | 3 | One save-too-old notice, plus the two fixed Miaplacidus anomaly names |
| `patches.js` | 0 | Nothing player-facing — see below |

**`patches.js` needed no changes at all.** Every string in it is either a legacy value being matched
during a save migration (the `old:` side of the `autoBuyerName*` map, which must stay English
verbatim or the migration stops matching), a canonical `prereqs` entry rendered through
`localizeCosmicRipPrereqs` at display time, or an achievement `name` field that no code path
displays — achievement tooltips render from the `achievement<Id>` key family instead. Its estimated
~25 literals were all internal.

`resourceDataObject.js` was the same story at a larger scale: of the ~165 prose literals in it, only
one is player-facing. The rest are tech `prereqs` lists (rendered through `localizeTechName` in
`drawTab3Content`), ascendency buff `name` fields (an English fallback behind `buffName*`) and
achievement `name` fields (unused for display).

### Patterns that recur in this half

The three patterns from the draw-function pass all held. Three more were needed here:

- **A stored label is not a label — resolve it from the id at read time.** The tab 9 events tables
  rendered `entry.name`, the event name recorded into the save when the event fired, so history rows
  were frozen in whatever language was active at the time. `eventDisplayName()` in `events.js` and
  `localizedEventName()` in `ui.js` both build `eventName<Id>` from the canonical event id instead.
  The same change gives the rocket default name (`getRocketUserName`), the destination dropdown
  default (`getCurrentDestinationDropdownText`) and the megastructure tooltip their own resolution.
- **Where a value is both compared and displayed, keep the stored value and add a key beside it.**
  The generated battle anomalies carry `nameKey`/`effectKey` next to their canonical `name`/`effect`,
  lifeform traits gained a third slot, `VOID_SEER_PRIZE_CATALOG` swapped `label` for `labelKey`, and
  the megastructure tooltip list carries `nameKey`/`techKeys` while `name` stays the string matched
  against the possession array. `rocketStatusClassMap` and `starShipStatusClassMap` stay keyed by the
  canonical English status; only the rendered text goes through the catalogue.
- **Nothing may call `localize()` before the catalogue is fetched.** `initLocalization()` is async, so
  anything evaluated at module load or in a `DOMContentLoaded` handler runs first and gets the key
  echoed back plus a console error. Three sites had to become lazy: the compound-recipe dropdown
  table in `constantsAndGlobalVars.js` (now built on first read via
  `ensureCompoundCreateDropdownRecipeText()`), `fuelConsumptionMap` in `ui.js` (now stores
  `labelKey`), and the debug event list (`getRandomEventDebugOptions()` now returns a `titleKey` that
  the `data-loc` sweep resolves). The hold-Enter debug toggle is written from the boot sequence
  instead of at module scope.

**Two more English-text comparisons were removed**, the same class as item 10:

- `game.js` gated the philosophy special-ability rows on `element.innerHTML === 'UNLOCKED'`. The
  frame loop rewrites that element, so in any other language the row never latched. The state now
  rides on `dataset.abilityUnlocked`, and the legacy English form is still accepted for elements
  drawn before the change.
- `game.js` compared a build button against `'Built!'` / `'Launched!'`. Both sides of the comparison
  now go through the catalogue together.

**One pre-existing runtime bug was fixed in passing.** `resourceDataObject.js` used `localize`,
`getLanguage` and `capitaliseString` when rebuilding the compound-recipe dropdown text, but imported
none of them — that path threw a `ReferenceError`. Adding the imports the extraction needed fixed it.

### Sanctioned exclusions

Three groups are deliberately left in English, and the audit script counts them as residue rather
than debt:

- **Console output** — `console.log` / `warn` / `error`, `new Error(...)` messages and Promise
  rejection reasons. These are for the developer, never rendered.
- **Canonical identifiers** — option-pane names (`'star map'`, `'fleet hangar'`), the
  `headingToLocalizationKey` map's own keys, `updateContent()` heading arguments, the status class
  maps, analytics event names, and the stored values the save file round-trips (`factoryStar`,
  lifeform traits, asteroid rarity, timezone abbreviations). Translating any of these breaks a
  comparison rather than a label.
- **The cheat panel** — the ~22 `CHEAT! …` notifications behind the Numpad debug window. The variable
  debugger *was* localized (its eighteen section headings and ten interaction strings), because it is
  the surface a curious player is most likely to open; the cheat messages are not reachable outside a
  cheats-enabled build.

---

## 6. Remove eval() from interpolation path

**🟢 Done**

`interpolateTemplateLiteral()` ran `eval()` on any localized string containing `${…}`. No value in
the catalogue used it — all 2,605 entries in all five languages checked, count was zero — so the
path was dead, but it re-armed the moment a translator typed `${` into a string, and it evaluated
content from a data file.

**Fixed:** `localization.js` — deleted `interpolateTemplateLiteral()` and the branch in `localize()`
that called it. `localize()` now always returns the looked-up string after the `\n` → `<br>`
substitution; there is no path left that can reach `eval()`.

`catalogue-integrity.spec.js` still fails the build if any value in any language contains `${`, so
the path cannot be re-armed silently. All 84 specs in `tests/e2e/localization/` pass after the
change.

---

## 7. Harden the key checker

**🔴 Not started**

`validateLocalization.cjs` checks key parity across languages — why the integrity numbers are
clean — but can't see **dynamically constructed keys** (81 call sites): `autoBuyerName*` resolved
through the migration map in `patches.js`, and `resource${Name}` / `compound${Name}` built by
concatenation at `ui.js:1790` and `ui.js:1799`.

129 keys appeared unreferenced when this was written. Most are explained by the above. **Do not
delete any until the checker resolves these patterns** — removing a key that's actually built at
runtime is the hardest class of bug to spot in a language you don't read.

Widening the search from `localize('key')` call sites to *any* quoted string literal in shipped
source brings that number down sharply; **59** is what `catalogue-integrity.spec.js` now ratchets
against. All 59 are explained, and the extraction work has made the list of constructed-key families
the hardened checker must understand explicit:

| Family | Count | Built from |
|---|--:|---|
| menu and modal keys | 14 | `index.html` element ids |
| `compoundCreateQty*` / `compoundRecipePattern` | 7 | concatenation in the recipe-text builder |
| `starShipModule*` / `fleetShip*` | 10 | the module or ship id in `drawTab5Content` |
| `buffName*` | 15 | the ascendency buff key in `drawTab7Content` |
| `resourceSolar` | 1 | `localizeMaterialName`'s section prefix + key |
| `eventName*` | 13 | the canonical random-event id, in `events.js` and `ui.js` |

Teaching the checker those six construction shapes is what closes this item.

Also add: fail the check on any empty value (all five languages currently have 3, the casino
special-prize suffixes — pinned as an exact allowlist by the same spec). Then wire the checker into
the build so it runs before packaging. It already runs as an assertion in the E2E suite.

---

## 8. Translation quality pass

**🟢 Done**

Values identical to English, per language: **es 35, de 41, it 37, fr 44**, against a ratchet
baseline of es 48 / de 60 / it 46 / fr 72. Reviewed and confirmed legitimate — proper nouns, star
names, chemical symbols, and other terms that are the same across these languages — rather than
untranslated placeholders.

---

## 9. Layout under translation

**🔴 Not started**

German runs 20–35% longer than English. The UI uses fixed-width panels and hand-placed `<br>`
breaks throughout, so overflow and bad wrapping will surface there first. Needs a full session
played in German, checking modals, tooltips, sidebar labels and the tech tree.

The automated sweep gives a starting point and a floor. Across all five languages and all nine
tabs, at a late-game state:

- **No tab overflows the viewport horizontally** in any language. That is asserted absolutely.
- **Five** controls are clipped by their translated label and are not clipped in English:
  - `#sellAllResourcesButton` and `#sellAllCompoundsButton`, both laid out at a fixed 81px against
    103px of content in es/it/fr and 135px in de.
  - `#energyOption`, `#powerPlant2Option` and `#powerPlant3Option` in tab 2's side menu. These are
    new to the list only because they now translate at all — they were among the ~20 labels the old
    relocalization block looked up under ids that do not exist, so they rendered in English and
    always fitted. "Energiespeicher", "Solarkraftwerk" and "Fortschrittliches Kraftwerk" all
    overflow the fixed side-menu width.

  See `tests/docs/known-issues.md` #7.

The category-header stranding described under item 5 is closed: those headers are now keyed by
`data-loc`, and a walk over all twenty ordered language pairs passes.

`tests/e2e/localization/translated-ui.spec.js` measures clipping as a diff against the English
layout of the same tab, so pre-existing layout bugs cancel out and only translation-caused overflow
is reported. The two known ids are allowlisted; anything else fails. Fixing them means deleting
them from that allowlist.

Note that this only catches *clipping* (`scrollWidth > clientWidth`). Bad wrapping, overlapping
absolute positioning and truncated modals still need a human pass.

---

## 10. Frame-loop tab gates compare English names

**🟢 Done**

`setCurrentTab` stored the tab's *rendered* text (`ui.js:10521`), and `localizeTabLabels()` /
`showTabsUponUnlock()` translate that text. At least **19 call sites** then gated per-frame work on
the English name — `getCurrentTab()[1].includes('Compounds')`, `…includes('Resources')`,
`…includes('Energy')`, `…includes('Space Mining')`, `…includes('Interstellar')`,
`…includes('Galactic')` — so every one of them was false in Spanish, German, Italian and French.

Two visible symptoms, both reported from play:

- **`[object Object]` on the Compounds → Water storage row.** Price formatting, affordability
  colouring and the secondary Concrete cost all stopped updating outside English, leaving the row
  frozen on whatever the initial draw wrote.
- **`undefined` on a tab's intro page.** The first time a tab is opened, `updateContent(..., 'intro')`
  looks the tab up in `headerDescriptions` and in the ASCII-art table, both keyed by the English
  name. Outside English both missed, and assigning an undefined lookup to `innerHTML` renders the
  literal word "undefined" — for the description *and* the artwork, on every tab.

**Fixed:**

- `ui.js` — the tab click handler identifies the tab by its canonical `data-name` and stores that.
  `???` is passed through unchanged, because it is a locked-tab state marker that
  `manageTabSpecificUi` tests for, not a name. `highlightActiveTab` still receives the rendered
  text, which is what it actually compares against.
- `ui.js` — the nine tab names were added to `headingToLocalizationKey`, so the intro heading is
  still *displayed* translated even though identity is now canonical. `updateContent`'s intro
  branch also guards both lookups with `?? ''`, so a future miss renders nothing rather than the
  word "undefined".
- A new key, `headerMainSettings`, gives tab 9 an intro heading; it previously shared
  `tabHeaderSettings` with the tab button and rendered the ☰ glyph as a heading.

The `[object Object]` had a second, independent cause, fixed at the same time: `game.js`
`getAllDynamicDescriptionElements()` had a misplaced closing parenthesis —
`getResourceDataObject('compounds', [name, 'storageCapacity'] - 1)` instead of
`getResourceDataObject('compounds', [name, 'storageCapacity']) - 1`. The array minus one is `NaN`,
`NaN` is falsy, so `getResourceDataObject` skipped its sub-key walk and returned the entire
compounds object as the price. English never showed it because the frame loop overwrote the row a
moment later — which is exactly what the tab gate had stopped doing in other languages.

Guarded by `tests/e2e/localization/tab-intro.spec.js`: every tab's intro page in all five
languages, the stored identity, the preserved `???` marker, and that the rendered label stays
translated.

---

## Suggested order

1. ~~Language resolution and persistence~~ 🟢
2. ~~Player-facing selector + `relocalizeAll()`~~ 🟢 (items 3 and 4)
3. ~~Compound reverse-lookup performance~~ 🟢 (item 2)
4. ~~Frame-loop tab gates~~ 🟢 (item 10)
5. ~~Static shell, tutorial, tech buttons~~ 🟢 (item 5, first half)
6. ~~Tech display names~~ 🟢 (item 5 — the `techName*` family, 58 names)
7. ~~All nine `drawTab*Content.js` files~~ 🟢 (item 5)
8. ~~`ui.js`, `game.js` and the support files~~ 🟢 (item 5, second half — 452 keys)
9. ~~Remove the `eval()`~~ 🟢 (item 6)
10. Harden the checker and wire it into the build (item 7)
11. ~~Translation quality pass~~ 🟢 (item 8), then the German layout pass (item 9).

Only items 7 and 9 are left. Neither is an extraction task: 7 teaches
`validateLocalization.cjs` to resolve constructed keys so dead keys can safely be pruned, and 9 is a
human play-through in German checking wrapping and truncation. Item 4's remaining note — eagerly
refreshing inactive tabs and open modals on a language change — is the natural companion to 9.

## Test coverage

84 specs in `tests/e2e/localization/`, all passing. Run them with
`node tests/run-e2e.mjs localization`. The whole E2E suite — 257 specs across 16 areas — also passes
after the extraction; run it with `node tests/run-e2e.mjs`.

| File | Specs | Covers |
|---|--:|---|
| `catalogue-integrity.spec.js` | 15 | Parity, value types, empty values, duplicate keys, dead `eval()` path, referenced vs. unreferenced keys, unbalanced HTML. No browser needed. |
| `language-resolution.spec.js` | 19 | The full resolution chain against real browser locales, regional tag normalisation, corrupt and unsupported values, persistence across restart, storage failure. |
| `language-switching.spec.js` | 15 | The Settings selector, the debug switcher, `relocalizeAll` return contract, round trips, all twenty category-header transitions, the `data-loc` sweep. |
| `compound-reverse-lookup.spec.js` | 12 | Item 2 — the behavioural contract, the frame budget, and the stored internal key. |
| `tab-intro.spec.js` | 8 | Item 10 — every tab's intro page in all five languages, canonical tab identity, the `???` marker. |
| `hardcoded-strings.spec.js` | 8 | Item 5 — the `data-loc` annotations, the tutorial, the needle map, and the extraction ratchet. |
| `translated-ui.spec.js` | 7 | Five languages × nine tabs at a late-game state: raw-key leaks, viewport overflow, translation-caused clipping, constructed keys, frame-loop survival. |

### Ratchets

Five assertions are deliberately baselines rather than absolutes, so the remaining items can be
closed incrementally. Each may fall; none may rise without a reason recorded in the spec.

| Ratchet | Baseline | Item |
|---|--:|---|
| Values identical to English | es 50, de 66, it 50, fr 79 | 8 |
| Keys not referenced anywhere in shipped source | 59 | 7 |
| Sanctioned empty values | 3 (the casino suffix keys) | 7 |
| Unannotated visible text in `index.html` | 74 (debug windows and modal placeholders) | 5 |
| Controls clipped by translation but not by English | 5 | 9 |

Two of these rose with the support-file extraction, each with the reason recorded in
`catalogue-integrity.spec.js` beside the constant:

- **Identical to English** rose by 2–7 per language. The additions are terms that genuinely coincide
  — `BOOST`, `Stock`, `Instant`, `stable`, `Hypercharge`, `Opinion: 0%`, and the credit lines, which
  are proper nouns.
- **Unreferenced keys** rose from 46 to 59. All thirteen additions are the `eventName*` family, built
  from the canonical event id at the call site (`'eventName' + id[0].toUpperCase() + id.slice(1)`),
  so no quoted literal for any of them exists to be found. They are what makes the tab 9 events
  tables follow a language change.

### Residual English in shipped source

An audit over the 22 shipped `.js` files finds **695** remaining English prose literals. None are
player-facing; they break down as the three sanctioned groups under item 5, concentrated in
`ui.js` (~174, mostly the `headingToLocalizationKey` map keys and the status class maps),
`resourceDataObject.js` (165, tech prerequisite lists and unused `name` fallbacks),
`drawTab3Content.js` (77, the tech prereq arrays), `patches.js` (73, legacy migration values) and
`constantsAndGlobalVars.js` (46, variable-debugger *variable names*, which name code identifiers and
must stay as written).

## Related

- Test coverage plan: [`tests/docs/areas/localization.md`](../../tests/docs/areas/localization.md)
- Live defects found while building the suite: [`tests/docs/known-issues.md`](../../tests/docs/known-issues.md) #3–#9
- Overall coverage report: [`tests/docs/coverage-report.md`](../../tests/docs/coverage-report.md)
