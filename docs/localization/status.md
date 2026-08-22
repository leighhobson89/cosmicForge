# Localization Status

Status as of HEAD `a193a44` + in-session work. Six languages: **en, es, de, it, fr**.

## Summary

| | Items | Share |
|---|---:|---:|
| 🟢 Done | 10 | 91% |
| 🟠 Partial | 1 | 9% |
| 🔴 Not started | 0 | 0% |
| **Total tracked items** | **11** | |

The catalogue is **2,591 keys × 5 languages, complete parity, zero keys referenced in code that are
missing from the JSON, and zero keys that nothing in the source can reach**. Item 5 — the string
extraction — is **done**: every player-facing literal in every shipped source file resolves through
the catalogue. Item 7 — the checker — is **done** too: `validateLocalization.cjs` now resolves the
six constructed key families from source, which is what finally made the 20 genuinely dead keys
safe to delete, and it gates every build.

Item 9, the layout pass, moved from 🔴 to 🟠 this session: the measurable half is closed — **no
control anywhere is clipped by its translated label in any language**, which was six controls
before, and the ratchet that tracked them is now an absolute. What is left is the part no automated
measure catches: wrapping quality, overlapping absolute positioning and truncated modals, which
still want a human play-through in German.

The area has **114 automated specs** in `tests/e2e/localization/`, covering catalogue integrity, the
resolution chain, runtime switching, tab identity and intro pages, the reverse lookup, the extraction
backlog, the frame-loop cost labels, the welcome-modal flag selector, and a six-language sweep of
every tab at a late-game state. All 114 pass. The remaining open item is held in place by *ratchets* in those specs — a recorded baseline
that may fall but must never rise. See [Test coverage](#test-coverage) at the foot of this document.

## Status at a glance

| # | Item | Status | Risk if left undone |
|---|---|:--:|---|
| 1 | [Language resolution & persistence](#1-language-resolution--persistence) | 🟢 Done | — |
| 2 | [Compound reverse-lookup performance](#2-compound-reverse-lookup-performance) | 🟢 Done | — |
| 3 | [Player-facing language selector](#3-player-facing-language-selector) | 🟢 Done | — |
| 4 | [Full redraw on language change](#4-full-redraw-on-language-change) | 🟢 Done | — |
| 5 | [Extract remaining hardcoded strings](#5-extract-remaining-hardcoded-strings) | 🟢 Done | — |
| 6 | [Remove eval() from interpolation](#6-remove-eval-from-interpolation-path) | 🟢 Done | — |
| 7 | [Harden the key checker](#7-harden-the-key-checker) | 🟢 Done | — |
| 8 | [Translation quality pass](#8-translation-quality-pass) | 🟢 Done | — |
| 9 | [Layout under translation](#9-layout-under-translation) | 🟠 Partial | Low — no control is clipped in any language; wrapping quality still wants a human pass |
| 10 | [Frame-loop tab gates compare English names](#10-frame-loop-tab-gates-compare-english-names) | 🟢 Done | — |
| 11 | [Language chosen on the welcome modal](#11-language-chosen-on-the-welcome-modal) | 🟢 Done | — |

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
row stores `concrete` rather than `Beton` / `Hormigón` / `Cemento` / `Béton` in all six languages.

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

Two new keys were added across all six languages (`settingsLanguageRowLabel`,
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

979 keys were added by the extraction pass (1,626 → 2,605): 60 for the static shell and tutorial, 467
for the nine `drawTab*Content.js` files, and **452 for the support files** — `ui.js`, `game.js`,
`events.js`, `constantsAndGlobalVars.js`, `resourceDataObject.js` and `saveLoadGame.js`. One more —
`textResearchedState` — was added afterwards for the researched-row fix described below, giving the
current 2,606.

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

### Four misses found in play, after the sweep

All four were reported from a translated session and are now closed. None was a string the extraction
sweep could have caught by reading the draw functions, which is why they survived it — three were
written by the frame loop over the top of the draw function's work, and the fourth was authored data
that predates the key slot beside it.

**The researched state of a technology row rendered in English on every language.** `game.js` wrote
the literal `'Researched'` onto the row's button *and* onto its description label from the frame
loop, at eight sites across the core research tab (`handleTechnologyScreenButtonAndDescriptionStates`
and `setSellFuseCreateTextDescriptionClassesBasedOnButtonStates`) and the cosmic-rip technology
screen. All eight now resolve `textResearchedState`, a new key added in all six languages
(`Researched` / `Investigado` / `Erforscht` / `Ricercato` / `Recherché`). It is deliberately separate
from the existing `textResearched`, which is the tech tree's uppercase status tag.

**A third English-text comparison was removed with it**, the same class as item 10:
`sortRowsByRenderPosition()` pushed researched rows to the bottom of the research tab by testing
`researchButton.textContent === "Researched"`, so translating the label would have silently stopped
the sort in four languages. The state now rides on `dataset.researched`, written by the same handler
that writes the text.

**Alien lifeform traits stayed English on the Miaplacidus system.** Generated traits carry their
catalogue key in a third slot (see the pattern note above), but the two *authored* systems in
`resourceDataObject.js` predate that slot and only had `[value, class]`, so `localizeTraitName()` fell
through to its English fallback for the hard-mode destination — the one system whose traits are fixed
rather than rolled. The authored tuples now carry their keys. `drawTab5Content.js` also gained
`TRAIT_NAME_KEYS`, which maps the eleven canonical trait values back to their keys, so a save written
before the third slot existed translates as well instead of being frozen in English forever.

**Anomalies and their effects had the same two gaps.** Generated anomalies carry `nameKey` and
`effectKey` beside the canonical English strings, so a freshly rolled one translated — but an anomaly
rolled *before* those slots existed is stored with only `name` and `effect`, and there was no way back
from either. The generator's catalogue is now `GENERATED_ANOMALY_CATALOGUE`, exported from `game.js`,
and `drawTab5Content.js` builds a name-to-key and an effect-to-key map from it on first use, so one
declaration remains the single source of truth for which English string belongs to which key. The maps
are built lazily rather than at module scope, because the two files import each other and the
catalogue is still in its temporal dead zone at load time.

Separately, `generateAnomalies()` returns the bare string `"Stalwart"` for any hard-mode destination,
and that word had no key at all — so the anomaly line on the Miaplacidus scan panel read English in
every language. `anomalyStalwart` was added across all five, and `Stalwart` joins the two authored
Miaplacidus anomalies in the string-anomaly map.

**The purchase-row cost labels were not being rewritten at all**, which broke three things at once
and hid two of them. `createOptionRow` gives a row's flavour-text container the id
`<labelId>Description`, and `generateElementId` gives the row's *cost label* the very same id; the
flavour container is appended first, so `getElementById('<labelId>Description')` always returns the
wrong element. Every builder in `game.js` — `getBuildingResourceDescriptionElements`,
`getScienceResourceDescriptionElements`, `getSpaceMiningResourceDescriptionElements`,
`getStarShipResourceDescriptionElements`, `getFleetResourceDescriptionElements` and
`getPhilosophyTechElements` — addressed its label that way, through 45 ids that had also drifted out
of date with the `createOptionRow` refactor. So:

- the labels were never rewritten, so a price that had risen kept showing its draw-time value;
- they never gained the `currency-price` / `resource-priceN` spans that
  `complexPurchaseBuildingFormatter` formats, so `normalCondensed` rendered `8100` where it owed
  `8.1K` — the symptom that was actually reported;
- and the material names in them, which the rewrite is what supplies, could not follow a language
  change either.

All 45 lookups now go through `getRowMainDescriptionLabel(rowId)`, hoisted to module scope from inside
`getAllDynamicDescriptionElements` where the resource and compound rows were already using it — the
row's id is `labelId` and is unique. The material names in the fleet, star ship, space mining and
science builders went through `capitaliseString(key)` and are now resolved by two new helpers,
`spaceUpgradePriceName` and `scienceUpgradePriceName`, matching the `energyUpgradePriceName` that item
5 added for the energy buildings; the philosophy rows' `string1: 'Research'` became
`textResearchPointsSuffix`.

Two side effects worth knowing: the tab 2 power-plant rows now show their resource cost as well as
their cash cost, because the draw function's static description omitted the 100 Carbon that
`powerPlant1` genuinely charges; and the four philosophy special-ability rows in
`checkStatusAndSetTextClasses` were gated on ids that did not exist, so that branch had been dead and
is now live. `tests/e2e/localization/cost-labels.spec.js` covers all three failures — address
resolution, the rewrite, and the notation — because the first one failing makes the other two
unobservable.

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
the catalogue used it — all 2,587 entries in all six languages checked, count was zero — so the
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

**🟢 Done**

`validateLocalization.cjs` checked key parity across languages and nothing else. It could not see
**dynamically constructed keys** — the families built by concatenation at the call site, for which no
quoted literal exists anywhere — so it reported 59 live-looking keys as unused. That false signal was
the blocker: with live and dead keys indistinguishable, deleting any of them risked removing a string
that is built at runtime, which is the hardest class of bug to spot in a language you do not read.

**The families are now resolved rather than excused.** Each one enumerates the exact key set its
construction can produce, read from the same source the game builds it from, which gives both
directions: a key a family *can* produce but the catalogue lacks is a missing translation, and a key
that matches a family's shape but that the family *cannot* produce is dead. A prefix allowlist gives
neither.

| Family | Keys | Resolved from |
|---|--:|---|
| `starShipModule*` | 5 | the `{ id: 'ss…' }` module list in `drawTab5Content.js` |
| `fleetShip*` | 5 | the `{ id: 'fleet…' }` ship list in `drawTab5Content.js` |
| `buffName*` | 15 | the top-level keys of `ascendencyBuffs` in `resourceDataObject.js` |
| `eventName*` | 13 | the top-level keys of `randomEventDefinitions` in `events.js` |
| `resource*` / `compound*` | 15 | the `[quantity, key, section]` price tuples **and** the `[key, rate, section]` fuel tuples |

The fuel tuples were the piece the previous revision of this document missed. It listed
`resourceSolar` as reached through `localizeMaterialName` but not *how*: `solar` never appears in a
price tuple, only as `fuel: ['solar', 0, 'resources']` on the solar power plant, so a resolver that
read price tuples alone still reported the key as dead.

**Twenty keys turned out to be genuinely dead, and were deleted** (2,607 → 2,587; four keys have been
added since — one for the rebirth precondition notice and three for the Black Hole charge button's
frame-loop states — giving the current 2,591). The previous
revision assumed all 59 were explained; resolving the families showed that two of the six listed
"families" were not constructions at all:

- **The thirteen menu and modal keys** — `clickAgainToStartNewGame`, `loadGame`, `saveGame`,
  `resumeGame`, `pause`, `begin`, `copyButton`, `importFromFileButton`, `loadButton`, `closeButton`,
  `headerStringSave`, `headerStringLoad`, `textAreaLabel`. These were described as wired through
  `index.html` element ids. None of those ids exists in `index.html`, and no shipped file names any of
  the keys: they are leftovers from the hand-written id-to-key blocks the `data-loc` sweep replaced
  under item 5.
- **`compoundCreateQty*` and `compoundRecipePattern`** — described as built by concatenation in the
  recipe-text builder. `buildCompoundCreateDropdownRecipeText()` composes those option labels inline
  from `resourceShort*` keys and never asks for these seven at all.

Deleting them closed `tests/docs/known-issues.md` #8 as a side effect: the compound reverse lookup
considers every key beginning `compound`, and `compoundCreateQty500`'s value was the bare string
`"500"`, so `reverseLocalizeForCompounds('500')` resolved to a data-object path that does not exist.
With the family gone there is nothing left to collide with. The lookup itself was **not** narrowed, so
the spec still pins the behaviour — a future `compound*` key whose value is a bare number re-opens it.

**Empty values now fail the check**, with the three casino special-prize suffixes as an exact
allowlist rather than a convention. The spec doctors a catalogue and asserts the checker rejects it,
so the check cannot pass by doing nothing.

**The checker gates the build.** `bun run check:localization` runs it directly; `build:mac`,
`build:win` and `build:linux` run it before `electron-builder`; `tools/build-stamp.mjs` runs it before
stamping, so all four `build:{win,linux}:{demo,full}` chains and `build:all` are covered; and
`create_build.py` runs it before packaging the web/itch.io build, with `--skip-localization-check` as
a deliberate override. A failing catalogue aborts the build rather than shipping a raw key to a player
in a language nobody on the team reads.

**The ratchet became an absolute.** `catalogue-integrity.spec.js` no longer carries an unreferenced-key
ceiling; it asserts the audit is empty in both directions, and separately asserts each family still
resolves the expected number of keys — because a family that silently resolved to nothing (a renamed
declaration, a changed literal shape) would report every key it covers as dead and invite exactly the
deletion this item exists to prevent.

---

## 8. Translation quality pass

**🟢 Done**

Values identical to English, per language: **es 35, de 41, it 37, fr 44**, against a ratchet
baseline of es 48 / de 60 / it 46 / fr 72. Reviewed and confirmed legitimate — proper nouns, star
names, chemical symbols, and other terms that are the same across these languages — rather than
untranslated placeholders.

---

## 9. Layout under translation

**🟠 Partial**

German runs 20–35% longer than English, and the UI is built from fixed-width panels and fixed
percentage columns, so overflow and bad wrapping surface there first.

Across all six languages and all nine tabs, at a late-game state:

- **No tab overflows the viewport horizontally** in any language.
- **No control is clipped by its translated label.** This was five controls; all five are fixed and
  `KNOWN_TRANSLATION_OVERFLOW` in `translated-ui.spec.js` is now an empty list, which is itself the
  assertion. See `tests/docs/known-issues.md` #7.

### What was fixed

Four causes, none of them specific to German — in each case English was living inside the same
mistake with just enough room to get away with it.

**The `<br>` tags visible on the Black Hole buttons.** `localize()` substitutes `\n` → `<br>` for
its `innerHTML` callers, and six frame-loop writes in `blackHoleUIChecks` put that result into
`textContent`, so the players saw the literal tag. `localizeRaw()` now returns the catalogue value
untouched and those six sites use it, which also makes the `white-space: pre-wrap` already on
`.option-button--wrap` mean something: the buttons render as real multi-line labels. The research
button gained that class, because `.option-button` is `nowrap` and the frame loop swaps its label
for a two-line one.

**Three columns adding up to 105%.** An option row is `label 20% + input 50% + description 35%`,
plus a 30px margin and a 10% left padding on the description. The row absorbed the excess by letting
the input column's children spill out of their own box and slide under the description text — which
is the price label sitting on top of the auto-buy switch on the resource sell rows, reported in
German and equally present in English. The description inset is now a fixed 20px, and the input
column is `flex-wrap`, so anything still too wide drops to a second line inside its own column
rather than over its neighbour.

**A header that could be squashed.** `.container-item-menu-header` holds the heading and the pane
description, is `overflow: hidden`, and was shrinkable: the scrollable body below pushed it from its
147px of content down to ~85px and silently cut the description in half — in every language, with
German simply losing more of itself. It is now `flex: 0 0 auto`; the body, which is `overflow:
auto`, absorbs the shortfall as it was always meant to.

**Two fixed shares that ignored their content.** The `Sell All` buttons were pinned to 20% of their
header row (81px against the 135px "Alles Verkaufen" needs) and now size to their label, with the
heading taking the remainder. Side-menu rows were an even 33/33/33 while only the first column
carries a name; it now takes 44% to the numbers' 28%.

### The two ideas from the layout review

Both were worth doing, and both are in.

**The attention marker is now out of the layout flow.** `.attention-indicator` was an inline glyph
appended to the label text, so it counted as part of the string being laid out — a translated tab
name plus the glyph no longer fitted, the glyph wrapped to a second line, and the marker ended up
visually detached from the label it belongs to (German tabs 4, 5 and 6 all did this). It is now
`position: absolute` in the host's top-right corner, with `appendAttentionIndicator()` adding a
`has-attention-indicator` class so the host is positioned whatever it happens to be. Every label
gets the full width of its control back, which is where most of the recovered space came from.

**Automatic text shrinking, where structure cannot help.** `fitLabelToWidth()` in `ui.js` steps a
label's font down until it fits its own box, with an 11px floor, restoring the authored size first
so repeated calls do not ratchet. It is applied to side-menu labels by `fitSideMenuLabels()`, called
from `initialiseStaticButtonLabels()` (boot and every language change) and on a tab change, which is
when a label's text or its visibility can have changed. This is deliberately the *last* resort, used
only where the box cannot grow and the text cannot wrap out of trouble: German supplies single
unbreakable words — "Energiespeicher", "Solarkraftwerk" — that no column width makes wrap, and a
slightly smaller word reads better than one broken in half.

### What is left

The sweep only catches *clipping* (`scrollWidth > clientWidth`). Wrapping quality, overlapping
absolute positioning and truncated modals still need a human play-through in German, checking
modals, tooltips and the tech tree. That is what keeps this item 🟠 rather than 🟢.

The category-header stranding described under item 5 is closed: those headers are now keyed by
`data-loc`, and a walk over all twenty ordered language pairs passes.

### Four more untranslated frame-loop literals, found in the same pass

The Black Hole charge button is written by the frame loop in four states, and all four were English
literals — `ACTIVE`, `Charging...`, `ACTIVATE`, `Charge`. They are the same class the four
"misses found in play" under item 5 belong to: written over the draw function's work a frame later,
so no sweep of the draw functions could have caught them. `buttonBlackHoleChargeActive`,
`buttonBlackHoleCharging` and `buttonBlackHoleActivate` were added across all six languages, and
the fourth state now reuses the existing `buttonBlackHoleCharge`.

Two more layout bugs went with them, both on the Black Hole interaction description:

- It ran `baseText.replace(/ /g, '&nbsp;')`, making the whole sentence a single unbreakable token
  that overflowed the panel in every language. Only the gap before the number needs to be
  non-breaking.
- That element carries `option-row-description d-flex`, so the sentence and the research-point value
  were two *flex items*, not inline text. Once the sentence was long enough to wrap — which German
  is — the value was laid out beside the wrapped text rather than after it, reading
  "…und verbessern 1.0B — Forschungspunkte:". Wrapping both in one `<span>` restores inline flow.

Separately, `#activateGridButton` — the power-grid toggle in tab 2's 8% centre column — was
`nowrap` with `overflow: hidden` in about 82px. "Power On" fitted by a hair and every other language
was cut mid-word ("Strom A", "Désactiv", "Alimenta"). It now wraps at its space. This one is *not*
counted by the clipping sweep, because it clipped in English too and the sweep measures each
language against English.

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

## 11. Language chosen on the welcome modal

**🟢 Done**

Until now the only way to pick a language was Settings → Game Options, which a new player reaches
several minutes after their first screen. Everything before that — the welcome modal, the intro
text, and the whole onboarding tutorial — was drawn in whatever the resolution chain produced, and
a player who wanted German had to sit through the tutorial in English first.

**Added:** a row of five flags on the welcome modal, directly above the pioneer-name field.

- `descriptions.js` — `buildLanguageFlagBar()` emits the row into `gameSaveNameCollect`. It is one
  grid of **nine columns over two rows**: flag, spacer, flag, spacer … on the first row and the
  language code under each flag on the second. The spacers are real grid cells rather than a `gap`,
  because the gaps are part of the measured width — the whole run adds up to **40% of the modal**.
- `styles.css` — `.language-flag-bar` and friends. Flags are **50px tall** and the images are
  `object-fit: fill`, so each stretches to its cell rather than letterboxing inside it.
- `ui.js` — `initialiseLanguageFlagSelector()` records a **pending** choice only. The player may
  click every flag in turn; nothing relocalizes under them. `getUserSaveName()`'s confirm handler
  commits the choice **once**, before it does anything else, so the intro modal, the cloud-load
  notifications and the onboarding prompt are all already in the chosen language.
- `ui.js` — the intro modal now reads `gameIntroHeader` at the point it is shown instead of a
  `const` snapshotted before the choice, which would otherwise have stranded that one header in the
  previous language.

Two deliberate limits, both as specified:

- **The starting selection is whatever `initLocalization()` already resolved** — English for a new
  player, and a returning player's stored preference otherwise. Highlighting English unconditionally
  would silently reset a returning Italian player who confirmed the modal without looking.
- **The feature is for new games.** A save that carries its own language still wins when it loads;
  the flags choose the language the *game* starts in, not the language a loaded save is displayed in.

Guarded by `tests/e2e/localization/welcome-language-flags.spec.js`: the bar's geometry measured
against the modal, the images actually decoding, one-at-a-time selection across repeated clicks, the
language staying put until confirm, and a full boot in each of the six languages through to the
onboarding prompt.

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
10. ~~Harden the checker and wire it into the build~~ 🟢 (item 7)
11. ~~Translation quality pass~~ 🟢 (item 8)
12. ~~The measurable half of the layout pass~~ 🟢 (item 9 — clipping is now zero and asserted absolutely)
13. ~~Language chosen on the welcome modal~~ 🟢 (item 11)

What is left of item 9 is not an engineering task: it is a human play-through in German checking
wrapping and truncation. Item 4's remaining note — eagerly refreshing inactive tabs and open modals on
a language change — is the natural companion to it.

## Test coverage

114 specs in `tests/e2e/localization/`, all passing. Run them with
`node tests/run-e2e.mjs localization`. Run the whole E2E suite with `node tests/run-e2e.mjs`. The
catalogue checker can also be run on its own, without Playwright, with `bun run check:localization`
(add `:report` for the full key classification).

| File | Specs | Covers |
|---|--:|---|
| `catalogue-integrity.spec.js` | 18 | Parity, value types, empty values, duplicate keys, dead `eval()` path, key reachability in both directions, constructed-family resolution, unbalanced HTML. No browser needed. |
| `language-resolution.spec.js` | 19 | The full resolution chain against real browser locales, regional tag normalisation, corrupt and unsupported values, persistence across restart, storage failure. |
| `language-switching.spec.js` | 15 | The Settings selector, the debug switcher, `relocalizeAll` return contract, round trips, all twenty category-header transitions, the `data-loc` sweep. |
| `compound-reverse-lookup.spec.js` | 12 | Item 2 — the behavioural contract, the frame budget, and the stored internal key. |
| `tab-intro.spec.js` | 8 | Item 10 — every tab's intro page in all six languages, canonical tab identity, the `???` marker. |
| `hardcoded-strings.spec.js` | 12 | Item 5 — the `data-loc` annotations, the tutorial, the needle map, the extraction ratchet, and the four controls whose *state* used to ride on their English label (known-issues #40–#42). |
| `translated-ui.spec.js` | 7 | six languages × nine tabs at a late-game state: raw-key leaks, viewport overflow, translation-caused clipping, constructed keys, frame-loop survival. |
| `cost-labels.spec.js` | 4 | The purchase-row cost labels the frame loop rewrites: address resolution past the id collision, the rewrite itself, `normalCondensed` reaching them, and their material names following a language change. |
| `welcome-language-flags.spec.js` | 19 | Item 11 — the flag bar on the welcome modal: its nine-column geometry against the modal width, the flag images decoding, deferred selection across repeated clicks, and a real boot in each of the six languages. |

### Ratchets

Two assertions are deliberately baselines rather than absolutes, so the remaining item can be closed
incrementally. Each may fall; none may rise without a reason recorded in the spec.

| Ratchet | Baseline | Item |
|---|--:|---|
| Values identical to English | es 50, de 66, it 50, fr 79 | 8 |
| Unannotated visible text in `index.html` | 74 (debug windows and modal placeholders) | 5 |

**The clipping ratchet became an absolute this session.** It peaked at 5 —
`sellAllResourcesButton`, `sellAllCompoundsButton`, `energyOption`, `powerPlant2Option`,
`powerPlant3Option` — and `KNOWN_TRANSLATION_OVERFLOW` in `translated-ui.spec.js` is now an empty
list. All five were fixed rather than tolerated; see item 9 and `tests/docs/known-issues.md` #7. A
control appearing there again is a regression, not a backlog item.

**Two ratchets became absolutes when item 7 landed**, and are recorded here so the change is not
mistaken for a lost assertion:

- **Keys not referenced anywhere in shipped source** peaked at 59 and is now asserted as empty. The
  ceiling only ever existed because the checker could not see constructed keys; once it could, 39 of
  the 59 resolved and the other 20 were deleted. A new constructed family now means teaching the
  checker that family, not raising a number.
- **Sanctioned empty values** is no longer a count but an exact allowlist of the three casino suffix
  keys, enforced by `checkEmptyValues()` — which the spec also feeds a doctored catalogue to prove it
  rejects one.

The surviving *identical to English* ratchet rose once with the support-file extraction, with the
reason recorded in `catalogue-integrity.spec.js` beside the constant: the additions are terms that
genuinely coincide — `BOOST`, `Stock`, `Instant`, `stable`, `Hypercharge`, `Opinion: 0%`, and the
credit lines, which are proper nouns.

### Residual English in shipped source

An audit over the 22 shipped `.js` files finds roughly **680** remaining English prose literals,
concentrated in `ui.js` (~174, mostly the `headingToLocalizationKey` map keys and the status class
maps), `resourceDataObject.js` (165, tech prerequisite lists and unused `name` fallbacks),
`drawTab3Content.js` (77, the tech prereq arrays), `patches.js` (73, legacy migration values) and
`constantsAndGlobalVars.js` (46, variable-debugger *variable names*, which name code identifiers and
must stay as written). Those are canonical identifiers, exactly as the civilization-level and
threat-level maps beside them are, and they stay as written.

**A sweep in this session corrected the claim this section used to make.** It said none of the
remainder was player-facing. Eighteen of them were, and four of those were not merely untranslated
but *load-bearing* — the game read its own rendered English back to decide what to do:

| What | Where | Now |
|---|---|---|
| The power-plant toggle | `game.js` `addOrRemoveUsedPerSecForFuelRate` | State on `dataset.toggleState`; known-issues #40 |
| The Settle button | `game.js` `checkDiplomacyButtons` | State on `dataset.conquestMode`, label from `buttonSettle`; #41 |
| The trade summary's `N/A` | `game.js` galactic market checks | State on `dataset.notApplicable`, label from `textNotApplicable`; #41 |
| The statistics colour coding | `ui.js` `determineStatClassColor` | Comparison set built from the catalogue; #42 |

The other fourteen were straight swaps onto keys that already existed — `textBought`,
`buttonActivate`/`buttonDeactivate`, `textOn`/`textOff`, `buttonBlackHoleCharge`,
`buttonBlackHoleCharging`, `textOrbitingStar`, `textStarTagMegastructure`, sixteen
`confirmLabel: 'CONFIRM'` sites — plus six new keys: `buttonSettle`, `textOrbitingEllipsis`,
`textRestored`, `buttonOk`, `textFeedbackPlaceholder` and `gameSaveNameLoadHint`.

The 21 `CHEAT!` notifications in the debug handlers are **deliberately left in English**: they are
only reachable through the debug menu, which is gated on a `Test1981` pioneer name or the cheats
flag, and translating developer tooling buys nothing.

## Related

- Test coverage plan: [`tests/docs/areas/localization.md`](../../tests/docs/areas/localization.md)
- Live defects found while building the suite: [`tests/docs/known-issues.md`](../../tests/docs/known-issues.md) #3–#9
- Overall coverage report: [`tests/docs/coverage-report.md`](../../tests/docs/coverage-report.md)
