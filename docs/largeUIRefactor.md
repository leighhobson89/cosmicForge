# Large UI Refactor — Audit & Phased Plan

> **Scope.** Replace the row-by-row "mini-table" layout system (`createOptionRow`) with a
> section-level grid + card system that aligns, breathes, and scales — without losing a single
> field of information, without dropping a localisation key, and without breaking any of the
> **9 existing themes**.
>
> **Status.** This document supersedes and expands **P12** ("UI row/layout refactor") and **P13**
> ("Spacing / visual hierarchy") in [player-feedback-improvement-plan.md](player-feedback-improvement-plan.md).
> Those two items were scoped at ~40–56 h combined on the assumption that the problem was
> *layout*. The audit below shows the layout is the *symptom*; the cause is that **the DOM is the
> state store**, and the plan is re-scoped accordingly.
>
> Every claim carries a `file:line` reference verified against the working tree at the time of
> writing (branch `main`, after `9b3da5c`).

---

## 1. Executive summary

The option row is the single most-used UI primitive in the game: **277 call sites** of
`createOptionRow` across nine `drawTabNContent.js` files. It is also the least structured. Each
row is an independent flex container that computes its own column widths, so rows do not align
with their neighbours; and the numbers inside those rows are **stored as display text and
re-parsed out of the DOM with regular expressions on every animation frame**.

That second fact is what makes the system "temperamental". A row is not a view of a model — it
*is* the model. Reformatting is therefore a string-rewriting operation over live markup, and it
breaks whenever the text does not look the way the parser expects: a different word order in a
translation, a currency symbol on the wrong side, a comma inside a number, a span that some other
feature added. The codebase already carries scar tissue proving this — `complexPurchaseBuildingFormatter`
opens with an explicit early-return for Cosmic Rip rows because *"the walk below would mangle them
in either mode"* ([game.js:12686-12689](../game.js#L12686-L12689)).

**The refactor therefore has to happen in this order:** give rows a model, *then* give them a
layout. Doing layout first means re-migrating everything once the model lands.

### What is genuinely good and must be preserved

The audit found three assets worth building on rather than replacing:

| Asset | Evidence | Why it matters |
|---|---|---|
| **A real design-token system** | `:root` + a generic `[data-theme]` baseline + 8 per-theme blocks ([styles.css:1526](../styles.css#L1526), [:590](../styles.css#L590), [:679](../styles.css#L679)) | Themes are already variables, not hardcoded colours, and `[data-theme]` gives *every* theme a `--ui-radius` / `--ui-shadow` / `--ui-glow` / `--ui-surface-*` baseline that the four newest themes then enrich. The grid system can be built entirely on tokens, and only needs a spacing scale added. |
| **Disciplined localisation** | **2,611 keys × 6 languages, all six in exact sync** (`localization.json`) | No string is hardcoded at the row level. Migration is a layout change, not a translation project — provided the new row keeps taking *localised strings* rather than parsing them. |
| **A proven caching pattern** | `getCachedElementsToCheck` + MutationObserver ([game.js:2714-2795](../game.js#L2714)) | Someone has already solved "stop re-querying the DOM every frame" once, correctly, in this codebase. Phase 5 generalises that exact pattern rather than inventing one. |

---

## 2. Audit findings

### F1 — `createOptionRow` is a 250-line god-factory with 21 options

[`ui.js:3851-4100`](../ui.js#L3851). Its option bag is:

```
labelId, renderNameABs, labelText, inputElements, descriptionText, resourcePriceObject,
dataConditionCheck, objectSectionArgument1, objectSectionArgument2, quantityArgument,
autoBuyerTier, startInvisibleValue, resourceString, optionalIterationParam, rowCategory,
noDescriptionContainer, specialInputContainerClasses, hideMainDescriptionRow
```

Names like `objectSectionArgument1` / `objectSectionArgument2` are positional leftovers: depending
on `rowCategory` they mean *resource key*, *tech key*, *fuse-to target*, or *storage type*. There
is no schema, so a call site cannot be validated and an IDE cannot help.

**Presentation and game rules are fused.** The factory itself decides tech-tree visibility
([ui.js:3892-3908](../ui.js#L3892)), Cosmic Rip telemetry visibility ([:3910-3927](../ui.js#L3910)),
and then hardcodes knowledge of three specific panes by name:

```js
if (getCurrentOptionPane() === 'launch pad') { ... }          // ui.js:3929
if (getCurrentOptionPane() === 'space telescope') { ... }     // ui.js:3937
//   ...including a Voidborn-philosophy + run-count check, inside a layout function
```

A layout primitive that must be edited whenever a new pane is added is not a primitive.

### F2 — The column widths sum to 105%, and every row is its own table

[styles.css:2191-2210](../styles.css#L2191):

| Element | Width | Extra |
|---|---|---|
| `.label-container` | `20%` | — |
| `.input-container` | `50%` | `margin: 10px 0 10px 30px` |
| `.description-container` | `35%` | `padding-left: 10%` |
| **Total** | **105%** | **+30px +10%** |

Because `.option-row-main` is a plain `display: flex` with no shared track definition, each row
resolves that overflow independently against its own content. Two rows with different label
lengths produce **two different column positions**. This is the mechanical root cause of the
Ascendency Perks misalignment recorded as P2, and of the inconsistent spacing recorded as P13 —
they are the same defect seen from two angles.

### F3 — 44 hardcoded per-row width escape hatches

`noDescriptionContainer: [true, '<labelWidth>', '<inputWidth>']` sets `style.width` **inline**,
bypassing the stylesheet entirely ([ui.js:3977-3985](../ui.js#L3977), [:4013](../ui.js#L4013)).
There are **44** of them, and they disagree:

```
drawTab2Content.js:241   [true, '25%', '70%']     drawTab5Content.js:817   [true, '15%', '85%']
drawTab2Content.js:331   [true, '25%', '75%']     drawTab3Content.js:2711  [true, 'invisible', '100%']
```

Note `'25%','70%'` and `'25%','75%'` sitting 90 lines apart in one file. These are not design
decisions; they are per-row nudges that happened to look acceptable once.

### F4 — The DOM is the state store (the core defect)

This is the finding that reorders the whole plan.

Numbers are written into `textContent`/`innerHTML` when a row is built, and thereafter the
**only** copy of that number lives in the markup. Every frame, the game reads it back out by
string surgery, reformats it, and writes it back:

`complexPurchaseBuildingFormatter` ([game.js:12683](../game.js#L12683)):

```js
const spans = element.querySelectorAll("span");
spans.forEach((span, index) => {
    const parts = span.textContent.trim().split(' ');
    let numberPart = index !== 0 ? parts[1]?.replace(/[^0-9.]/g, '')
                                 : parts[0].replace(/[^0-9.]/g, '');
    ...
    const prefix = content.startsWith(",") ? ", " : "";   // word order is load-bearing
```

`complexSellStringFormatter` ([game.js:12804](../game.js#L12804)) goes further and regexes raw
markup: `sellRowQuantityElement.innerHTML.match(/>(.*?)</)`.

State comparisons are done against **localised display text**
([game.js:9094-9101](../game.js#L9094)):

```js
if (element.dataset.abilityUnlocked === 'true'
    || element.innerHTML === 'UNLOCKED' || element.innerHTML === unlockedText   // ...
```

The `dataset` flag beside it is the previous attempt to escape this trap, kept alongside the
English literal for rows drawn before the fix — an unfinished migration of exactly the kind this
plan intends to finish.

**Consequences.** Formatting is lossy and order-dependent; a translation whose grammar puts the
unit before the number silently mangles; `red-disabled-text` affordability state (which is by
design the game's whole gating mechanism) rides on classes applied to elements whose text is being
rewritten underneath it; and no row can be unit-tested without a DOM.

### F5 — The frame loop rescans the entire document, several times

`gameLoop` ([game.js:2466-2710](../game.js#L2466)) runs on `requestAnimationFrame` and performs,
**every frame**:

| Work | Line | Cost |
|---|---|---|
| `document.querySelectorAll('.notation')` | [2521](../game.js#L2521) | every notation node in the document, then a per-node string reformat |
| `getAllElements(...)` rebuilt from scratch | [2565](../game.js#L2565), [6409](../game.js#L6409) | ~75+ `getElementById` calls (9 resources + 6 compounds × 5 tiers, + energy/battery/plants/rockets) |
| `getAllDynamicDescriptionElements(...)` | [2566](../game.js#L2566), [6564](../game.js#L6564) | a second full map rebuild |
| `document.querySelectorAll('.option-row')` → per-row check | [2622](../game.js#L2622) | every row in the document |
| ~30 discrete `*Checks()` passes | [2594-2618](../game.js#L2594) | each with its own queries |

`getAllElements` is called *fresh each frame* and simply rebuilds the same map — the elements have
not moved. The one place that got this right is `getCachedElementsToCheck`, which caches behind a
MutationObserver and only invalidates on relevant `childList` mutations
([game.js:2714-2795](../game.js#L2714)).

### F6 — There is no responsive design at all

**One `@media` query in 4,835 lines of CSS**, and it is `prefers-reduced-motion`
([styles.css:2682](../styles.css#L2682)). The shell is fixed-proportion:
`.container-item-menu { flex: 1 }` beside `.container-item-content { width: 65% }`
([styles.css:1902](../styles.css#L1902), [:1923](../styles.css#L1923)), under a
`.main-container` with a hardcoded `margin-top: 110px` ([:1830](../styles.css#L1830)). There are
**58 `!important`** declarations. The game is effectively single-viewport.

### F7 — Pane switching nukes and rebuilds

`optionContentElement.innerHTML = ''` followed by a full `drawTabNContent(...)`
([ui.js:3647](../ui.js#L3647)); **16** such teardown sites in `ui.js`. Because state lives in the
markup (F4), a teardown is a state loss, which is why so much logic re-derives itself every frame
instead of trusting what it built.

### F8 — Nine themes, unevenly provisioned

`requiredThemes = ['terminal','dark','misty','light','frosty','summer','supernova','galaxy','space']`
([ui.js:5996](../ui.js#L5996)); default is `terminal` ([index.html:13](../index.html#L13)).

The generic `[data-theme]` block ([styles.css:590](../styles.css#L590)) already gives **every** theme
a baseline of the modern surface tokens — `--ui-radius: 10px`, `--ui-radius-sm: 8px`, shadows and
glows set to `none`, and `--ui-surface-*` mapped onto the container colour variables. The four
newest themes (`light`, `supernova`, `galaxy`, `space`) then override that baseline with real radii,
shadows and glows; the older four (`terminal`, `dark`, `frosty`, `summer`) keep the flat defaults,
which for `terminal` in particular is a reasonable look rather than an omission.

So the surface tokens are in better shape than a first pass suggests. Two genuine gaps remain:

1. **No theme defines a spacing scale.** All spacing is literal px scattered through the stylesheet.
   This is the one the grid system actually needs, and it is Phase 1's real deliverable.
2. **`--accent-strong` / `--accent-soft` / `--accent-strong-rgb` are defined only under
   `[data-theme="light"]`** ([styles.css:1600-1602](../styles.css#L1600)), yet they are *used* in two
   rules — `.factory-star::after` ([:3504](../styles.css#L3504)) and `.factory-star-text`
   ([:4476](../styles.css#L4476)) — with a literal `yellow` fallback. On the other eight themes those
   two rules therefore render plain yellow rather than a themed accent. Cosmetic rather than broken,
   but it means there is no accent token a new component can rely on.

> **Live gap found during this audit — `misty` had no colour palette.** ✅ **FIXED.** It was listed
> in `requiredThemes` ([ui.js:5996](../ui.js#L5996)), offered in the theme dropdown
> ([drawTab9Content.js:143](../drawTab9Content.js#L143)) and shipped a complete megastructure image
> set — but `grep -c misty styles.css` returned **0**, so every colour fell through to `:root`. That
> made it the one theme whose appearance was an accident of the cascade, and it meant any future edit
> to `:root` would have changed Misty without anyone intending it.
>
> A `[data-theme="misty"]` block now exists in `styles.css` alongside its siblings, holding exactly
> the values it was already resolving to. Nothing about how Misty looks changes — that is the point,
> and the baseline comparison confirms it — but it is now a decision rather than a fallback, and there
> is somewhere to edit when its palette is designed.

### Findings → phases

| # | Finding | Severity | Addressed in |
|---|---|---|---|
| F4 | DOM is the state store; numbers re-parsed by regex per frame | **Critical** | Phase 2 |
| F1 | `createOptionRow` fuses layout with game rules; 21 opts, 277 sites | High | Phase 3 |
| F2 | Columns sum to 105%; each row is an independent table | High | Phase 3–4 |
| F5 | Whole-document rescans every frame | High | Phase 5 |
| F3 | 44 conflicting inline width overrides | Medium | Phase 4 |
| F8 | 5 of 9 themes lack modern tokens; no spacing scale | Medium | Phase 1 |
| F6 | No responsive design (1 media query) | Medium | Phase 6 |
| F7 | Pane switch = full teardown | Medium | Phase 5 |

---

## 3. Design target

### 3.1 The row becomes a view of a model

A row is declared as data and rendered from it. Numbers stay numbers until the moment they are
printed:

```js
createRow({
    id: 'hydrogenAutoBuyer1Row',
    section: 'resource.automation',
    title:  { key: 'tab1HydrogenAutoBuyer1RowLabel' },   // localisation key, never a built string
    subtitle: { key: 'upgradeNameHydrogenAB1' },
    cost:   [ { resource: 'hydrogen', amount: 250 } ],   // numbers, not text
    stat:   { key: 'textQuantity', value: 3 },
    actions: [ buyButton, maxButton ],
    toggle: { id: 'hydrogen1Toggle', on: true },
    gate:   { kind: 'affordability', category: 'resource' },
    reveal: { kind: 'tech', requires: 'hydrogenFusion' }
});
```

Formatting reads `cost[].amount` — a `Number` — and writes the display span. **Nothing ever parses
display text back into a number.** The regex formatters (F4) are deleted, not fixed.

`reveal` and `gate` are declarative, which lifts the pane-name special-casing (F1) out of the
layout function: `'launch pad'` and `'space telescope'` become reveal predicates registered by
those panes.

### 3.2 The section owns the columns

Rows stop declaring widths. A **section** declares one grid, and every row in it places cells into
named tracks — so alignment is structural, not coincidental:

```css
.ui-section {
  display: grid;
  grid-template-columns:
    [title]  minmax(12ch, 1.4fr)
    [stat]   minmax(8ch, .8fr)
    [cost]   minmax(14ch, 1.2fr)
    [action] auto;
  gap: var(--sp-2) var(--sp-4);
}
```

`subgrid` is the natural fit and is available in all current evergreen browsers; the fallback is a
single grid with rows as contents-only wrappers. Either way the 105% overflow (F2) and the 44
inline overrides (F3) disappear by construction.

### 3.3 Information parity is a hard requirement, and is enforced

**No field may be dropped.** Every field the current row renders gets an explicit destination:

| Today | Tomorrow | Notes |
|---|---|---|
| `labelText` | `title` cell | unchanged text, same loc key |
| `renderNameABs` (`"Name:"`) | `subtitle`, under title | colon becomes typographic hierarchy |
| `descriptionText` (cost string) | `cost` cell, one chip per component | `"250 hydrogen, 10 water"` → two chips |
| currency portion of the cost | `cost` chip with `--accent-strong` | symbol side stays locale-correct |
| `inputElements[0..4]` | `action` cell | 5-element cap becomes a real overflow rule |
| toggle switch | `action` cell, trailing | unchanged control |
| `AB{n}Quantity` text | `stat` cell | promoted out of the button blob |
| `option-row-description` (long prose) | expandable detail row, spanning all tracks | collapsed by default → the space win |
| `red-disabled-text` on description | same class on `cost` cell | **gating mechanism unchanged** (see §5) |

The **space win** comes from three places, not from removing anything: collapsing the long prose
description row behind a disclosure, replacing the 10% padding + 30px margin dead zone with a real
grid `gap`, and letting the `action` track size to content instead of a 50% reservation.

A Phase 0 test enforces this mechanically — see §4.

### 3.4 Tokens gain a spacing scale, on all nine themes

```css
:root {
  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px; --sp-4: 16px; --sp-6: 24px; --sp-8: 32px;
  --ui-radius: 10px; --ui-radius-sm: 8px;          /* backfilled where missing */
  --ui-surface-bg: var(--container-bg-color);
  --ui-surface-border: var(--container-border-color);
  --density: 1;                                     /* comfortable | compact */
}
```

Backfilling the five older themes (F8) is mechanical and is Phase 1's main deliverable. `--density`
multiplies the spacing scale, giving the compact mode Phase 6 needs for free.

---

## 4. The phases

Each phase is independently shippable, independently valuable, and leaves the game in a working
state. Old and new rows coexist from Phase 3 to Phase 7.

---

### ~~Phase 0 — Safety net (before touching anything)~~ ✅ DONE

~~**Goal.** Make it impossible to lose information or break a theme without a test going red.~~

~~- **Visual regression harness.** Playwright screenshots across **9 themes × ~12 representative
  panes**, committed as baselines.~~
~~- **The information-parity fixture.** Walk every `createOptionRow` call site, snapshot the rendered
  row's complete text content and control inventory to JSON.~~
~~- **Localisation guard.** Extend `validateLocalization.cjs` to fail if a migrated row introduces a
  literal user-facing string instead of a loc key.~~

**As built.** Delivered as a *tool*, not a spec suite — Leigh's instruction was that these additive
phases need no tests, so the safety net is a backup you can look at rather than a harness that can
fail a build.

- **`tools/capture-baseline-screenshots.mjs`** (new) — boots the game and photographs every pane it
  can reach, in all nine themes, into `backupScreenshots/`.
- **`backupScreenshots/`** (new, git-ignored) — **522 screenshots · 58 panes · 286 `.option-row`
  elements**, ~55 MB, plus a `manifest.json` and a generated `README.md` recording the commit,
  viewport and what was captured.
- Captured from **Leigh's real save (`Leigh1981`)**, not a fresh game. A fresh boot has almost
  nothing unlocked, so its panes are not a picture of the UI this refactor has to fix.

**Read-only guarantee.** A real save must never be written to, so the guard is enforced at the
network layer rather than by trusting a flag: every `*.supabase.co` request is intercepted and
POST/PATCH/PUT/DELETE aborted, while GET passes so the save can load. Supabase maps `.select()` onto
GET and `.insert()`/`.update()`/`.delete()` onto the write verbs, so that single cut blocks every
cloud write in `saveLoadGame.js` — the autosave at [:91](../saveLoadGame.js#L91) included. On top of
that, `stopAutoSave()` is called after boot, and the **saving / loading** pane is skipped entirely
because the frame loop calls `saveGame(...)` every frame while it is open
([game.js:2690](../game.js#L2690)). The run reported **no cloud write was even attempted**. No game
source and no build flag was touched.

**Not done, deliberately.** The information-parity fixture and the localisation guard were specced
as tests; per the no-tests instruction they are deferred to Phase 3, where they become useful for
the first time (there is nothing to compare a migrated row against until one exists).

**Effort:** ~4 h · **Risk:** None (additive) · **Exit:** ✅ baselines exist for all 9 themes.

---

### ~~Phase 1 — Token completion & the grid primitive~~ ✅ DONE

~~**Goal.** Make the design system able to express the target, with nothing migrated yet.~~

**As built.** Four new files under `newUI/`, plus three lines in `index.html`. Everything is additive:
`tokens.css` only *defines* custom properties and `components.css` only defines `.ui-*` classes that
nothing in the game carries yet.

| File | What it is |
|---|---|
| `newUI/tokens.css` | The `--ui-sp-*` spacing scale and `--ui-density` multiplier (neither existed anywhere); `--accent-strong` / `--accent-soft` / `--accent-strong-rgb` for the eight themes that lacked them; and `--ui-section-*` / `--ui-row-*` / `--ui-chip-*` surfaces derived from the existing `--ui-surface-*` baseline and `--text-color-rgb` |
| `newUI/components.css` | `.ui-pane` / `.ui-section` / `.ui-grid` / `.ui-row` / `.ui-cell-*` — the named-track grid, the chips, the collapsible detail, and a first responsive fold |
| `newUI/createSection.js` | `createPane()`, `createSection()`, `createUiRow()`, `createCostChips()`, `createDisclosure()`, `appendUiRow()`, `setUiLocaliser()` — generic `create*()` factories, per project convention |
| `newUI/demo.html` | The throwaway demo pane. Loads the **real** `styles.css` first, so it proves the new components inherit the actual themes rather than a copy of them |

**A real defect the demo caught.** The first build had each section owning its own grid. Because the
action track is content-sized, a section with wider buttons resolved *all* its tracks differently —
two sections, two action-column edges, 35px apart. That is the same defect as F2, one level up.
Fixed by adding `.ui-pane`, which hoists the track definition to the top of the screen and has each
section re-use it via CSS `subgrid`, so every row on the pane shares one column definition. The demo
now reports **5 action cells across 2 sections · 1 distinct left edge · ALIGNED**. Note the
constraint this imposes: a subgrid item's own horizontal padding would inset its tracks and bring
the drift back, so sections inside a pane are drawn bare, and card treatment becomes a Phase 6
concern to be drawn *behind* the grid.

**Verified, not assumed.** Diffing `getComputedStyle` across all 773 elements of a loaded game with
the two new stylesheets enabled vs disabled, in a single pass so the frame loop cannot mutate the DOM
between snapshots: **0 elements differ**. The one rule the accent tokens do affect —
`.factory-star::after` / `.factory-star-text`, which currently fall back to literal `yellow` on eight
themes — matches **0 elements** in the captured state, so the improvement is latent rather than
visible. `light` is deliberately untouched, as it already defines its own accent.

**Packaging.** Wiring the stylesheets into `index.html` meant teaching both build paths about the
folder: `newUI/**/*` added to `package.json`'s `build.files` allow-list (with `!newUI/demo.html`), and
`backupScreenshots` + `demo.html` added to `create_build.py`'s `IGNORE_LIST` deny-list — without
that, 55 MB of screenshots would have been FTP'd to the live site.

**Not done, deliberately.**
- **The `misty` palette.** It needs a colour decision from Leigh, not an invented one. It currently
  picks up a neutral `:root` accent from `tokens.css` and is otherwise unchanged.
- **A `uiRowDetailsLabel` catalogue entry.** `validateLocalization.cjs` rightly fails on a key
  nothing can reach, and it runs as part of `build:win`. So `createDisclosure` takes its label from
  the caller and Phase 3 adds the key and passes it in the same change.

**Effort:** ~6 h · **Risk:** Low · **Exit:** ✅ demo renders on all 9 themes, no console errors,
alignment measured; ✅ game rendering provably unchanged.

---

### ~~Phase 2 — Break the DOM-as-state coupling~~ ✅ MOSTLY DONE

~~**Goal.** Numbers stop being strings. This is what makes every later phase safe.~~

**As built.** A raw-value channel in a new file, `newUI/notation.js`, plus the writers and formatters
that use it. A writer stamps the raw number(s) and the literal text either side of them onto the
element; the formatter rebuilds the display from those and never looks at rendered text.

The stamp is an interleaved parts/values pair rather than a `{0}` template, because a localised
label can itself contain braces and there would be no safe escape:

```
parts  = ["$", ""]        values = [4500]      ->  "$" + format(4500) + ""
parts  = [", ", " Steel"] values = [611]       ->  ", " + format(611) + " Steel"
```

**Migrated — these no longer parse anything:**

| Path | Was | Now |
|---|---|---|
| Cost/price rows (`updateQuantityDisplays` description branch → `complexPurchaseBuildingFormatter`) | `textContent.split(' ')` then `parts[1]`, with word order load-bearing | each span carries its own amount; the positional walk never runs |
| Quantities (`updateQuantityDisplays` quantity branch → `formatAllNotationElements`) | whole-innerHTML digit regex | two stamped values, `{qty}` and `{storage}` |
| Cosmic Rip costs (`handleCosmicRipUpgradeResourceType`) | a pre-formatted HTML string the formatter had to skip | spans built as elements carrying their raw amount |
| Philosophy "unlocked" state (`checkStatusAndSetTextClasses`) | `innerHTML === 'UNLOCKED'` **and** a comparison against its translation | a dataset flag set where the state is decided, backed by `getPhilosophyAbilityActive()` |

**The Cosmic Rip exemption is gone.** It existed only because those spans put their `", "` separator
*outside* the span, so the positional walk recovered the wrong token — the scar tissue quoted in §1.
With the amount stamped, position stops mattering, and the early return has been deleted.

**Deliberately incremental.** `renderStamped()` returns false for an unstamped element and every
formatter then falls back to its legacy path unchanged. That is what let this land in pieces and be
checked against the Phase 0 screenshots at each step, rather than as one all-or-nothing rewrite of a
775k-line file.

**NOT done — the sell/fuse preview.** `complexSellStringFormatter` ([game.js:12804](../game.js#L12804))
and the preview builders in `constantsAndGlobalVars.js` (`setResourceSalePreview` /
`setCompoundSalePreview`, ~[:3090](../constantsAndGlobalVars.js#L3090)) still work by string surgery,
including the `innerHTML.match(/>(.*?)</)` that is the single worst line in the audit. It was left
alone on purpose: that preview is built as one HTML string combining a money span, a parenthesised
quantity and a fusion clause, and three separate passes format overlapping parts of it in a specific
order — the parent is formatted by `formatAllNotationElements` *before* the child span is handled.
Restructuring it is a bigger change than everything above combined, it lands on the most-used
interaction in the game, and with no tests in these phases there is no oracle beyond a screenshot.
It should be its own change with a spec behind it.

**So the regex formatters are bypassed on the main paths but not yet deleted.** Deletion needs the
remaining writers migrated; the mechanism they need now exists.

**Verified against the Phase 0 baseline** — 522 images, 58 panes, 9 themes. See §6.1.

**Effort:** ~8 h · **Risk:** was High; carried by the fallback design and the baseline comparison.

---

### Phase 3 — `createRow` v2 alongside the old one

**Goal.** The new primitive exists and is proven on one real section.

- Implement `createRow(spec)` per §3.1 on the Phase 1 grid.
- Extract `reveal` predicates: tech unlock, Cosmic Rip telemetry, `'launch pad'`,
  `'space telescope'` + Voidborn move **out** of the factory (F1) into a registry the panes
  populate.
- Write `createOptionRow` as a **thin adapter** that maps the legacy 21-option bag onto a
  `createRow` spec. All 277 call sites keep working untouched.
- Migrate **one** section end-to-end as the reference: **Ascendency Perks** (`drawTab7Content.js`)
  — small, self-contained, and the section whose misalignment motivated P2.

**Effort:** 20–28 h · **Risk:** Medium · **Exit:** every action cell in the migrated section shares
a `getBoundingClientRect().left` within 1px; parity fixture green; the other 8 tabs are visually
unchanged through the adapter.

---

### Phase 4 — Tab-by-tab migration (nine independent increments)

**Goal.** Convert call sites, one tab per increment, each shippable on its own.

Ordered by value-per-risk:

| Order | Tab | Sites | Why here |
|---|---|---|---|
| 1 | Tab 7 Galactic (remainder) | 18 | continues Phase 3's reference section |
| 2 | Tab 2 Energy | 7 | smallest; exercises the `forceShowDescription` special case ([ui.js:4025](../ui.js#L4025)) |
| 3 | Tab 1 Resources | 49 | **highest visibility**; the repeated sell/storage/AB1-4 pattern becomes one section template |
| 4 | Tab 4 Compounds | 43 | same shape as Tab 1, reuses its template |
| 5 | Tab 5 Interstellar | 18 | most `'15%','85%'` overrides (F3) |
| 6 | Tab 6 Space Mining | 14 | `'launch pad'` / `'space telescope'` reveal predicates land here |
| 7 | Tab 3 Research | 83 | largest; tech-tree sort + render-throttle interplay ([game.js:2645-2668](../game.js#L2645)) |
| 8 | Tab 8 Cosmic Rip | 15 | benefits most from Phase 2 (its rows were the mangled ones) |
| 9 | Tab 9 Menu/Stats | 24 | includes the two genuine `<table>`s ([drawTab9Content.js:1009](../drawTab9Content.js#L1009), [:1033](../drawTab9Content.js#L1033)), which stay tables — they are real tabular data |

Each increment: convert call sites → delete that tab's `noDescriptionContainer` overrides → parity
fixture + screenshots green → ship.

**Effort:** 55–75 h total, ~4–12 h per tab · **Risk:** Medium visually, low functionally · **Exit:**
per-tab parity + alignment specs green on 9 themes.

---

### Phase 5 — Frame-loop diffing

**Goal.** Stop rescanning the document 60 times a second (F5). Now safe, because Phase 2 gave rows
a model to diff against.

- Generalise the `getCachedElementsToCheck` MutationObserver pattern
  ([game.js:2714](../game.js#L2714)) into a single row registry. `getAllElements` /
  `getAllDynamicDescriptionElements` stop rebuilding per frame ([game.js:6409](../game.js#L6409),
  [:6564](../game.js#L6564)).
- Rows subscribe to the values they display; only rows whose inputs changed re-render. The
  `querySelectorAll('.notation')` and `querySelectorAll('.option-row')` sweeps
  ([game.js:2521](../game.js#L2521), [:2622](../game.js#L2622)) are replaced by registry iteration.
- Pane switch stops being a full teardown where the section is unchanged (F7).

**Effort:** 25–35 h · **Risk:** Medium (perf work can mask staleness — mitigated by a spec that
asserts a value change reaches the DOM within one frame) · **Exit:** measured frame-time reduction
on the Research pane (the 83-row worst case) reported in the test output; no visual change.

---

### Phase 6 — Space, density & responsiveness (the visible payoff)

**Goal.** The phase the player actually sees — and the one the mockup shows.

- **Cards.** Option groups become bordered, padded cards on the section grid (P13's intent,
  now cheap because the grid exists).
- **Collapsible detail.** The long prose description moves behind a disclosure — the single
  largest vertical-space reclamation.
- **Density toggle.** `--density` switches comfortable ↔ compact; a localised setting beside the
  existing theme picker.
- **Responsiveness.** Real breakpoints at last (F6): the 65%/flex shell
  ([styles.css:1902](../styles.css#L1902), [:1923](../styles.css#L1923)) becomes a grid that
  collapses the sidebar under ~1100px and stacks cost-under-title under ~700px. Retire the
  `margin-top: 110px` ([:1830](../styles.css#L1830)) in favour of grid rows.
- Begin retiring the 58 `!important` declarations, which specificity fights made necessary.

**Effort:** 30–40 h · **Risk:** Medium-High visually (this is the phase that *intends* to look
different — Phase 0 baselines are re-approved here deliberately, not silently) · **Exit:** parity
fixture still green (**information preserved even though layout changed** — the key assertion);
new baselines at 3 viewport widths × 9 themes.

---

### Phase 7 — Retire the legacy path

- Delete the `createOptionRow` adapter once all 277 sites are migrated.
- Delete the dead width-override plumbing (`noDescriptionContainer`,
  `specialInputContainerClasses`, `hideMainDescriptionRow`).
- Fold `drawTabNContent.js` duplication into section templates — Tab 1 and Tab 4 are the same
  shape repeated ~15 times each.

**Effort:** 10–15 h · **Risk:** Low · **Exit:** `createOptionRow` absent from the codebase; suite green.

---

### Totals

| Phase | Deliverable | Effort | Risk | Player-visible |
|---|---|---|---|---|
| 0 | ~~Safety net~~ ✅ | ~~12–16 h~~ · **~4 h actual** | None | No |
| 1 | ~~Tokens + grid primitive~~ ✅ | ~~14–20 h~~ · **~6 h actual** | Low | No |
| 2 | ~~**Break DOM-as-state**~~ ✅ mostly | ~~25–35 h~~ · **~8 h actual** | High | No |
| 3 | `createRow` v2 + adapter | 20–28 h | Medium | One section |
| 4 | Migrate 9 tabs | 55–75 h | Medium | Progressively |
| 5 | Frame-loop diffing | 25–35 h | Medium | Smoothness |
| 6 | **Space, density, responsive** | 30–40 h | Med-High | **Yes — the payoff** |
| 7 | Retire legacy | 10–15 h | Low | No |
| | **Total** | **191–264 h** | | |

Larger than P12+P13's original 40–56 h — because that estimate treated the problem as layout. The
first genuinely player-visible win lands at the end of Phase 3 (one aligned section) and the full
payoff at Phase 6. Phases 0–2 are 51–71 h of foundation with no visible change; that is the honest
cost of the row system currently having no model beneath it.

**A viable reduced scope:** Phases 0 → 1 → 2 → 3 → Tab 1 and Tab 7 only → Phase 6 restricted to
those two tabs. ~110–140 h, and it delivers the mockup's look on the game's most-viewed pane while
leaving the rest working through the adapter indefinitely.

---

## 5. Constraints this refactor must respect

These are established project rules; the refactor does not get to relax them.

1. **Affordability gating stays CSS-class-based.** `red-disabled-text` (`pointer-events: none`)
   applied by the frame loop **is** the gating mechanism, by design. The new `cost` cell carries
   the same class on the same schedule. Purchase handlers still contain no affordability guard, and
   that must not be "fixed".
2. **Every user-facing string comes from `localization.json` in all six languages** — including
   unit suffixes like `/s`. New cells (subtitle, stat, disclosure label) need keys added to all six.
3. **New controls are generic `create*()` factories in `ui.js`**, beside `createButton` /
   `createDropdown` — not bespoke one-off widgets.
4. **Tests must not permanently edit game source**, and must restore any build flag they touch
   (`buildFlags.js` is operated by hand: cheats ship `false`, cosmic rip `true`, demo build `false`).
5. **Tests fail on live bugs.** If a migration surfaces a real defect, the spec goes red and is
   raised — it is not softened or worked around.
6. **Documentation is part of finishing**: `tests/docs/coverage-report.md`,
   `tests/docs/functional-areas.json` and this file are updated as each phase lands, and completed
   phases are struck through with a ✅ on the heading.

---

## 6. Mockup

**→ [Forge Row System — interactive mockup](https://claude.ai/code/artifact/979c7ba2-373d-446a-9853-07024e978738)**

It renders the real Tab 1 → Hydrogen pane twice — once in a faithful reproduction of the current
`createOptionRow` layout (the 105% columns included), once in the proposed section grid — from the
same row data and the real strings in `localization.json`. What it demonstrates:

- **All nine themes**, driven by the actual token values transcribed from `styles.css`. Selecting
  *Misty* shows the fallback warning described in F8.
- **Alignment guides** (toggle in the control bar) draw a vertical line at each row's first action
  control. Before: several scattered edges. After: one. This is literally the Phase 3 exit
  criterion, made visible.
- **Live space measurement** — both panels' heights and the percentage reclaimed, recalculated as
  you change theme, language, density, or expand a detail disclosure.
- **Localisation stress** — switch to Deutsch or Français and watch the fixed-percentage columns
  fail on strings that the grid tracks absorb without moving anything.
- **The information-parity map** — hovering a row highlights that field in *both* panels, so
  "nothing was dropped" can be checked by eye before Phase 0 automates it.
- A **density toggle** (comfortable / compact) previewing the `--density` token from §3.4.

---

## 6.1 How Phases 1–5 are verified

These phases ship no tests, so the oracle is the Phase 0 baseline: they must not change how the game
looks. `tools/compare-baseline-screenshots.mjs` does the comparison.

Two screenshots of this game are never byte-identical — the stat bar carries a live clock, resources
tick every frame, and several panes animate — so the tool compares with a per-channel tolerance and
masks the animated header strip. What survives that is a real rendering change.

**Phase 2 result** (522 images · 58 panes · 9 themes, tolerance 12/255, top 115px masked):

```
mean diff: 0.214%
flagged  : 28 of 522 at or above 1%
```

Every flagged image is one of four panes, and every one of them animates:

| Pane | Why it differs |
|---|---|
| `tab8-near-space-scanner-array` (9 themes) | the animated nebula/starfield canvas |
| `tab7-black-hole` (9 themes) | the black hole animation |
| `tab7-galactic-casino` (9 themes) | the spinner / roulette animation |
| `tab6-mining`, `tab7-galactic-market` | animated pane content |

**Not one resource, compound, energy, research or cost pane is flagged** — and those are exactly the
panes whose cost and quantity rendering Phase 2 rewrote. The 29th-worst image is already down at
0.358%.

Spot checks behind the numbers:

- `terminal/tab8-near-space-scanner-array` reads `$1.6M, 339.4K Titanium, 2.0M Silicon` and
  `$3.3M, 3.3M Helium, 3.3M Sodium, 1.6M Steel` in both captures. Only the canvas behind them moved.
- `light/tab1-oxygen`: sampling the cost text, the buttons and the sidebar rows gives identical RGB
  in both. The differing pixels are a 14-row band at y=68–81 — the animated banner behind the tabs,
  which is why the mask starts at 115px.
- The Cosmic Rip rows above are confirmed to be rendering through the *new* stamped path
  (`data-ui-cost-signature` present), i.e. through the formatter that previously had to skip them.

Regenerate and re-check with:

```
node tools/capture-baseline-screenshots.mjs --pioneer Leigh1981 --panes all --out backupScreenshots/_check --keep
node tools/compare-baseline-screenshots.mjs --against backupScreenshots/_check --mask-top 115 --write-diffs
```

---

## 7. Where this stands

**Phases 0, 1 and 2 are done** (~18 h against the 51–71 h estimated). Phase 2 is the one that
mattered, and its mechanism — the raw-value channel — is in place with the main cost, quantity and
Cosmic Rip paths migrated off string parsing.

**The one piece of Phase 2 still outstanding** is the sell/fuse preview, which is the single worst
parser in the audit and also the riskiest to change without a spec behind it. It should be its own
change. Everything else in Phase 2 no longer parses rendered text.

**Next is Phase 3**: `createRow` v2 with `createOptionRow` rewritten as a thin adapter onto it, so
all 277 call sites keep working while one reference section migrates. Phase 3 is also where the
`uiRowDetailsLabel` localisation key and the information-parity fixture land, both of which were
deferred out of Phases 0 and 1 because nothing referenced them yet.

Both open questions from the last pass are now settled:

1. **`misty`** is defined explicitly in `styles.css`, holding the values it was already falling
   through to. Its palette can now be designed by editing one block instead of discovering that
   editing `:root` moves it.
2. **`backupScreenshots/` is not committed** and stays in `.gitignore` — 55 MB of PNGs, regenerable
   at any time with `node tools/capture-baseline-screenshots.mjs --pioneer Leigh1981`.
