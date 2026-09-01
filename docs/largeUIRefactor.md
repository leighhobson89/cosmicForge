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

This is enforced mechanically by `tools/check-row-parity.mjs`, which landed with Phase 3 — see §6.1.

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
as tests; per the no-tests instruction they were deferred to Phase 3, where they became useful for
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

### ~~Phase 3 — `createRow` v2 alongside the old one~~ ✅ DONE

~~**Goal.** The new primitive exists and is proven on one real section.~~

~~- Implement `createRow(spec)` per §3.1 on the Phase 1 grid.~~
~~- Extract `reveal` predicates: tech unlock, Cosmic Rip telemetry, `'launch pad'`,
  `'space telescope'` + Voidborn move **out** of the factory (F1) into a registry the panes
  populate.~~
~~- Write `createOptionRow` as a **thin adapter** that maps the legacy 21-option bag onto a
  `createRow` spec. All 277 call sites keep working untouched.~~
~~- Migrate **one** section end-to-end as the reference: **Ascendency Perks** (`drawTab7Content.js`)
  — small, self-contained, and the section whose misalignment motivated P2.~~

**As built.** Three new files under `newUI/`, one new tool, and a rewrite of `createOptionRow` into
two halves. The 277 call sites are untouched.

| File | What it is |
|---|---|
| `newUI/rowSpec.js` | The schema that was missing. `createRowSpec()` normalises a described row — `title`, `subtitle`, `stat`, `cost[]`, `actions[]`, `detail`, `gate`, `reveal` — and reports unknown fields instead of silently swallowing them, which is what the 21-option bag does with a typo today |
| `newUI/reveal.js` | The predicate registry. `registerReveal(kind, fn)` / `applyReveal(el, reveal)`. A predicate returns `true` / `false` / **`null`** — see below |
| `newUI/createRow.js` | `createRow(spec)` — renders a spec into the Phase 1 section grid, applies the gate to the cost cell and stamps each chip through the Phase 2 raw-value channel |
| `tools/check-row-parity.mjs` | The information-parity fixture, delivered as a tool. Measures parity, alignment and reclaimed space, and opens every other tab to prove the adapter still draws |

**`createOptionRow` is now two functions.** `legacyOptionsToRowSpec()` maps the option bag onto a
spec; `renderLegacyOptionRow()` draws that spec as the `.option-row` mini-table, byte-for-byte as
before. Both renderers now read one description of a row, which is what makes a migration a change
of renderer rather than a rewrite. It also, finally, reads the positional names out loud:
`objectSectionArgument1` is the resource-or-tech key, `objectSectionArgument2` the fuse-to target or
pane action.

**The reveal predicates are out of the layout function.** `techUnlock`, `cosmicRipTechUnlock`,
`tech` and `debugHidden` are registered by `ui.js`, which already imports the tech accessors;
`launchPadRocket` and `spaceTelescopeAction` — including the Voidborn philosophy and run-count check
— are registered at module scope by **`drawTab6Content.js`**, the file that draws those two panes.
`createOptionRow` no longer names a pane.

**The three-state predicate is not decoration.** The legacy branches are asymmetric: the two tech
checks only ever *added* `invisible` and never removed it, because
`resourceAndCompoundMonitorRevealRowsChecks` in the frame loop ([game.js:7620](../game.js#L7620))
owns the un-hiding; the launch-pad branch did both. Collapsing that to a boolean would have quietly
changed which rows the frame loop is allowed to reveal. So a predicate returns `true`, `false`, or
`null` for "no opinion", and reveals are applied in the legacy branch order so a later opinion still
overrides an earlier one.

**The reference section: Ascendency Perks.** Its rows are now `.ui-row` cells on a `.ui-pane` grid,
with `PERK / REBUYABLE / COST` written once as column headings instead of being implied inside every
row, the purchase status promoted to a subtitle under the perk name, and the description prose moved
behind a disclosure.

What did **not** change is everything the frame loop reaches for: the row ids, the
`buff{Key}BuyStatusText` and `{buffKey}CostText` elements it writes into every tick, the
`.ascendency-buff-button` class and its `buff-class-*` slug, and the `option-row` class the reveal
sweep selects on ([game.js:2634](../game.js#L2634)). Those two live elements are passed into the row
**as elements**, not as text, so the row never holds a stale copy of a figure something else owns —
`createSection.js` gained `fillTextField` for exactly that.

**Two width hacks stopped being load-bearing.** `.ascendency-buff-button` carries
`margin-left: auto; margin-right: 100px` ([styles.css:2974](../styles.css#L2974)) purely to shove the
price to the right-hand edge, and a finished perk therefore needed an *invisible copy of the button*
to hold the price at the same x as the row above it. On a grid the cost track holds that position by
itself. Both are neutralised inside `.ui-cell-*` rather than deleted, because the unmigrated rows
still need them; the spacer stays, because the frame loop creates one when a perk is finished
mid-session and the action cell should not change height under the pointer.

**Localisation.** `uiRowDetailsLabel`, `uiColheadPerk`, `uiColheadRebuyable` and `uiColheadCost`
added in all six languages; `labelRebuyable` removed, because the section prints that word once as a
column heading and the per-row prefix no longer exists. Note the constraint discovered here:
`validateLocalization.cjs` only scans root-level sources, so a key named only inside `newUI/` reads
as unreachable and fails `build:win`. Keys are therefore named at the call site and arrive as
`{ key: '…' }`. The catalogue validates clean at 2,614 keys × 6.

**Measured, not asserted** — `node tools/check-row-parity.mjs`:

```
Information parity — Ascendency Perks
  perks in catalogue : 16      rows rendered: 16      complete rows: 16
  ✅ every perk renders title, rebuyable, status, price, control and description

Alignment — the Phase 3 exit criterion
  action cells: 16   distinct left edges: 1 (within 1px)   spread: 0.00px
  ✅ ALIGNED

Space — the collapsed description
  collapsed 1685px · expanded 2334px · reclaimed 27.8%

The adapter — tabs 1,2,3,4,5,6,8,9 all draw · ✅ no script errors
```

Note what parity is measured *against*: the perk catalogue and live game state, not a photograph of
the previous render. Comparing renders would only prove the new one looks like the old one, and the
layout is meant to change. What must not change is what the player can find out.

**27.8% of the pane's height** came back from collapsing the prose — on a pane whose descriptions
are short. The tabs with long descriptions will give back more.

**Not done, deliberately.** The reveal registry is populated and used, but only the ascendency
section renders through `createRow`; every other row still reaches it through the adapter, which is
the whole point of shipping the adapter. `subgrid` is exercised for real for the first time here and
behaved.

**Effort:** ~20–28 h estimated · **~7 h actual** · **Risk:** Medium · **Exit:** ✅ one distinct
action-cell edge at 0.00px spread; ✅ parity 16/16; ✅ all eight other tabs draw through the adapter
with no script errors.

---

### Phase 4 — Tab-by-tab migration (nine independent increments) — **IN PROGRESS**

**Goal.** Convert call sites, one tab per increment, each shippable on its own.

**Done so far: tabs 9 and 8, both in their entirety** — 37 call sites, 0 left on either. The order
below was reordered on request: the two settings-and-endgame tabs went first because they are
self-contained, they exercise the two row shapes the mockup does *not* cover, and neither is on the
critical path of a run.

| Order | Tab | Sites | Status |
|---|---|---|---|
| 1 | Tab 7 Galactic (remainder) | 16 | Ascendency Perks done in Phase 3; the rest pending |
| 2 | Tab 2 Energy | 6 | pending — exercises the `forceShowDescription` special case ([ui.js:4190](../ui.js#L4190)) |
| 3 | Tab 1 Resources | 48 | pending — **highest visibility**; the repeated sell/storage/AB1-4 pattern becomes one section template |
| 4 | Tab 4 Compounds | 42 | pending — same shape as Tab 1, reuses its template |
| 5 | Tab 5 Interstellar | 17 | pending — most `'15%','85%'` overrides (F3) |
| 6 | Tab 6 Space Mining | 12 | pending — its two reveal predicates already landed in Phase 3 |
| 7 | Tab 3 Research | 82 | pending — largest; tech-tree sort + render-throttle interplay ([game.js:2645-2668](../game.js#L2645)) |
| — | ~~Tab 8 Cosmic Rip~~ ✅ | ~~14~~ **0** | **done** — 3 panes, 14 rows |
| — | ~~Tab 9 Menu/Stats~~ ✅ | ~~23~~ **0** | **done** — 10 panes, 23 rows |

Each increment: convert call sites → delete that tab's `noDescriptionContainer` overrides → add the
tab's panes to `tools/check-row-parity.mjs` → run it → ship.

---

#### As built — tab 9 (Menu / Stats / Settings)

23 call sites, 0 left. Nineteen `noDescriptionContainer` overrides deleted — `'25%'/'80%'`,
`'17%'/'83%'`, `'invisible'/'100%'`, `'0%'/'100%'` — replaced by nothing at all: the pane owns the
tracks.

**Two new row shapes came out of this tab, and both were needed rather than nice to have.**

- **`variant: 'full'`** — a row that is one cell spanning every track. The achievements grid, the
  statistics table, the help prose and the two events tables are not rows with too many fields; they
  are single objects that want the whole width, and the legacy call sites said so with a width hack
  (`noDescriptionContainer: [true, 'invisible', '100%']`). Pushing them through four tracks would
  truncate them, and truncating information to fit a layout is the one thing this refactor may not
  do. **The two genuine `<table>`s stay tables**, as §4 said they must — they sit inside the
  full-bleed cell untouched.
- **`detailCollapsible: false`** — prose that is always visible, with no caret. Phase 3 put the
  perk's flavour text behind a disclosure and reclaimed 28% of the pane's height doing it. A
  settings row is the opposite case: the sentence under a control explains what the control does,
  so collapsing it would buy vertical space at the cost of the row's entire purpose. Sixteen
  settings rows use it, and the prose gets the full width instead of the old 35% column.

Every screen opens one pane and rows are appended into its section as they are built, rather than
collected and appended at the end — several screens read a control back out of the document by id
*between* two row builds, and deferring the appends would break those lookups.

#### As built — tab 8 (Cosmic Rip)

14 call sites, 0 left. Three panes: Situation, Near Space Scanner Array, Cosmic Rip.

**The five technology rows became one template.** They were five copies of the same forty lines
differing only in a key and a display name. That is the `drawTabNContent.js` duplication Phase 7 was
scheduled to fold away, and the row spec made it cheap enough to do here instead.

**Progress bars moved into the `stat` track, and that is not cosmetic.**
`.progress-bar-container` is `width: 100%`, which resolves to nothing inside a content-sized action
cell and resolves properly inside a real grid track. The Cosmic Rip pane widens that track once, for
all six of its rows, with `tracks: { stat: 'minmax(16ch, 1.1fr)' }` — which is precisely the
substitution this phase exists to make, in place of the `[true, '15%', '70%']` the status row used
to carry.

**`createPriceLabel` was extracted, and it is the piece that makes purchase rows migratable.** The
price label is the single most load-bearing element in the row system: the frame loop finds it by
class (`.resource-cost-sell-check`, collected in `buildElementsToCheck`,
[game.js:2787](../game.js#L2787)), by id (it ends in `Description`, the other half of that same
query), and by `data-*` (`checkStatusAndSetTextClasses` reads six attributes off it), and it wears
the `red-disabled-text` whose `pointer-events: none` **is** this game's affordability gate. So a
migrated purchase row does not rebuild its price as chips — it puts *that element* into the cost
track. The legacy renderer now calls the same factory, so the two cannot drift.

**A live defect was found and fixed, not worked around.** The map caption on the Near Space Scanner
Array pane was located by `document.querySelector('.option-row-main div label')`
([game.js:1805](../game.js#L1805)) — the **first** label inside any option row anywhere in the
document, which merely happened to be that one while the pane was open. It would have silently
retargeted if any row above it ever gained a label, it dereferenced the result with no null check,
and it threw outright the moment the pane stopped using `.option-row-main`. It is an id lookup now,
with a real null check, and the label carries its own id.

#### What the migrated rows still carry, deliberately

Everything the frame loop reaches for. Row ids are unchanged; `.option-row` stays on every migrated
row because the reveal sweep selects on it ([game.js:2634](../game.js#L2634)); the
`conditionCheck` / `type` / `rowCategory` dataset attributes are unchanged, so
`resourceAndCompoundMonitorRevealRowsChecks` still reveals a Cosmic Rip technology when its telemetry
threshold is crossed; and every element the loop writes into by id — the three Situation status
texts, the two owned counts, the two GP costs, the five tech progress bars — is passed into the row
**as an element** rather than rebuilt from text the row would then hold a stale copy of.

#### Measured

`node tools/check-row-parity.mjs`, which grew a `MIGRATED_PANES` contract listing every migrated
row and the cells it must still fill:

```
Information parity — the other migrated panes (Phase 4)
  ✅ situation                   5 rows complete · action column: 1 edge(s), 0.00px spread
  ✅ near space scanner array    3 rows complete · action column: 1 edge(s), 0.00px spread
  ✅ cosmic rip                  6 rows complete · action column: n/a
  ✅ visual                      6 rows complete · action column: 1 edge(s), 0.00px spread
  ✅ game options                5 rows complete · action column: 1 edge(s), 0.00px spread
  ✅ saving / loading            6 rows complete · action column: 1 edge(s), 0.00px spread
  ✅ statistics                  1 rows complete · action column: n/a
  ✅ achievements                1 rows complete · action column: n/a
  ✅ events                      1 rows complete · action column: n/a
  ✅ get started                 1 rows complete · action column: n/a

The adapter — tabs 1,2,3,4,5,6 all draw · ✅ no script errors
```

`n/a` where a pane has fewer than two visible action cells — the Cosmic Rip technologies are hidden
until their telemetry threshold is crossed, and a full-bleed row has no action cell at all. The tool
says so rather than claiming an alignment it did not measure.

**Two grid fixes came out of driving real panes through it.**

- `--ui-track-action` is `minmax(0, auto)` rather than bare `auto`, so the action column can be
  squeezed below its max-content width and let its controls wrap. With a bare `auto` the save pane's
  Pioneer Name field — a button, a label and a text field side by side — pushed the row off the
  right of the screen.
- The cells now zero their own children's horizontal margins. A great many controls carry a margin
  that exists only to fake a column in the old flex row (`.save-load-button` and `.save-name-margin`
  have `margin-left: 50px`, `.buff-value` has `margin-right: 30px`, the ascendency Buy button has
  `margin-left: auto; margin-right: 100px`), and inside a grid every one of them is harmful. Rather
  than chase the list class by class as each tab lands, the cell zeroes them; the grid's `gap` is
  what spaces controls now.

#### Correction — the first build of tabs 8 and 9 was worse than what it replaced

Reviewed against `backupScreenshots/`, the migration had produced a **worse layout than the legacy
rows**, and the parity tool was green throughout. Three defects, one root cause and two consequences
of it.

**D1 — a grid track costs its share of the pane whether or not anything is in it.** The four tracks
are `1.5fr / 0.55fr / 1fr / auto`. A settings row fills `title` and `action` and nothing else, so
40% of the pane went to two permanently empty columns and every dropdown and toggle was thrown ~700px
from its own label. The same arithmetic ran the other way on the Situation pane, whose live status
sentence sits in `stat` — the *narrowest* track — and wrapped onto three lines next to 250px of empty
`cost`. Both are the same bug, and neither could be fixed at the call site without reintroducing
exactly the per-row width overrides (F3) this refactor exists to delete.

*Fix:* the pane measures itself. `syncPaneTracks` (newUI/createSection.js) walks the rows, keeps only
the tracks that have content, writes a template listing those, and writes `--ui-col-*` so cells are
placed **by name** — auto-placement would slide every cell one column left for each track dropped.
`data-ui-tracks` names the survivors so the stylesheet can hide the empty cells. A track the caller
sized through `tracks` is always kept: asking for a width states the column is wanted even if the row
that fills it is revealed later.

**D2 — `detailCollapsible: false` put the settings prose on a full-width band under the row.** The
legacy row gave the description a 35% right-hand column and a settings row read in one line: name,
control, sentence. The band cost a line of height per row *and* left the right two-thirds empty, so
the migration made the pane both taller and emptier — the opposite of the whole exercise.

*Fix:* `detailInline: true` renders the prose as a cell in a fifth `detail` track. All fourteen tab-9
settings rows use it. The band remains right for prose too long to sit in a column.

**D3 — tab 8 silently lost eight localised sentences.** The legacy renderer looked a row's id up in
`descriptions.js` and drew the prose *without being asked* ([ui.js:4201](../ui.js#L4201)).
`createRow` deliberately does not — a layout primitive that reaches into a game data file is the
coupling being removed — so the call site must hand it over, and tab 8's did not. Every
`optionDescCosmicRip…` string stopped being drawn.

*Why nothing caught it:* parity was measured **spec → DOM**, so a field the spec never claimed could
not be reported lost. `check-row-parity.mjs` now also measures **descriptions.js → DOM**, which is the
only direction that can see an omission at the call site. It also measures dead space: the widest run
of empty pane between two filled cells of one row, capped at a third of the pane's width. The broken
settings panes were sitting at two thirds.

*Fix:* tab 8's eight rows pass `detail` from `descriptions.js`, behind a disclosure — the treatment
Phase 3 established on the perks pane, since the sentence explains a purchase the row already names.

**Also changed:** `.ui-cell-action` aligns its controls to the **start** of the track, not the end.
The track is content-sized, so right-aligning pushed every narrower control away from the column edge
the section exists to guarantee — a 300px dropdown and a 52px toggle in one column read as two
columns flushed right and as one flushed left. And the `900px` / `620px` media queries, which
re-declared three- and two-track templates, now simply stack: with placement by name and the track
list decided at build time, a stylesheet and the JS would otherwise each be describing a different
grid.

**The lesson for the seven tabs still to migrate:** a green parity report is not evidence the pane
looks right. Compare the migrated pane against `backupScreenshots/` by eye before calling a tab done —
the tool can only check what the spec claims, and both of the layout defects above were invisible to
every check that asks "did the field reach the DOM".

**Effort:** 55–75 h total estimated, ~4–12 h per tab · **~6 h actual for tabs 8 and 9 together, plus
~3 h for the correction above** · **Risk:** Medium visually, low functionally · **Exit per tab:**
parity + alignment + prose + dead space green, no script errors, adapter tabs still drawing, **and a
screenshot comparison against the Phase 0 baseline**.

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
| 3 | ~~`createRow` v2 + adapter~~ ✅ | ~~20–28 h~~ · **~7 h actual** | Medium | One section |
| 4 | Migrate 9 tabs — **2 of 9 done** (tabs 8, 9) | 55–75 h · **~6 h for the first two** | Medium | Progressively |
| 5 | Frame-loop diffing | 25–35 h | Medium | Smoothness |
| 6 | **Space, density, responsive** | 30–40 h | Med-High | **Yes — the payoff** |
| 7 | Retire legacy | 10–15 h | Low | No |
| | **Total** | **191–264 h** | | |

Larger than P12+P13's original 40–56 h — because that estimate treated the problem as layout. The
first genuinely player-visible win landed at the end of Phase 3 (one aligned section) and the full
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

**Phase 3 is verified differently, and deliberately so.** The screenshot oracle asks "does it still
look the same", which is the right question for a phase that changes no markup — Phases 1, 2, 4 and 5
— and the wrong one for the section Phase 3 migrates, which is *supposed* to look different. The
migrated section is therefore checked against the game's own data instead:

```
node tools/check-row-parity.mjs
```

It boots a throwaway game behind the same read-only network guard, opens Ascendency Perks, and asks
three questions: does every perk in the catalogue render every one of its six fields (parity), do all
sixteen action cells share one left edge (the exit criterion), and how much vertical space did
collapsing the prose give back. It then opens the other eight tabs — which still draw through the
adapter — and fails if any of them raises a script error. It exits non-zero on a failure but is not
part of any suite, exactly as the Phase 0 tools are not.

The screenshot comparison remains the right check for the *unmigrated* eight tabs, since the adapter
is meant to leave them pixel-identical.

Regenerate and re-check with:

```
node tools/capture-baseline-screenshots.mjs --pioneer Leigh1981 --panes all --out backupScreenshots/_check --keep
node tools/compare-baseline-screenshots.mjs --against backupScreenshots/_check --mask-top 115 --write-diffs
```

---

## 7. Where this stands

**Phases 0–3 are done, and Phase 4 is two tabs in** (~31 h against the 71–99 h estimated for 0–3
alone). Phase 2 was the one that mattered structurally — the raw-value channel, with the main cost,
quantity and Cosmic Rip paths migrated off string parsing. Phase 3 turned that into something you can
see: one section, sixteen rows, one action-column edge, 27.8% of its height back. Phase 4 is now
doing the same, tab by tab.

**Migrated so far:** Ascendency Perks (Phase 3), then **tab 9** and **tab 8** in their entirety —
37 call sites and 19 inline width overrides gone, across 13 panes.

**The one piece of Phase 2 still outstanding** is the sell/fuse preview, which is the single worst
parser in the audit and also the riskiest to change without a spec behind it. It should be its own
change. Everything else in Phase 2 no longer parses rendered text.

### Continuing this work in a new session

The shorthand is **"large refactor - tab N"**. It means: migrate that tab's `createOptionRow` call
sites to `createRow`, delete its `noDescriptionContainer` overrides, add its panes to
`tools/check-row-parity.mjs`, run the tool, and update this document. Read, in this order:

1. **This file**, for status — the Phase 4 table above says what is done and what is next, and each
   completed phase carries an "As built" block that is usually more useful than its original bullets.
2. **`newUI/rowSpec.js`**, for the schema a row is described with.
3. **`newUI/createRow.js`** and **`newUI/createSection.js`**, for the renderer and the
   `createPane` / `createSection` / `createUiRow` / `fillTextField` factories — all re-exported from
   `ui.js`, so a draw file imports them alongside `createButton`.
4. **`newUI/reveal.js`**, for the visibility predicates. Game rules live in the file that owns them,
   never in the layout code.

### What the first three migrated tabs established

- **Not every pane fits four columns, and that is fine.** `variant: 'full'` exists because the
  achievements grid, the statistics table, the help prose and the events tables are single objects
  that want the whole width. The rule that survives is information parity, not the column count: a
  pane that does not fit gets a shape that does, and **no field is ever dropped to make one fit**.
- **Collapsing prose is a choice, not a default.** A perk's flavour text belongs behind a
  disclosure; a settings row's sentence explains what its control does and stays visible
  (`detailCollapsible: false`).
- **`tools/check-row-parity.mjs` grows a `MIGRATED_PANES` entry per tab.** That list is the parity
  contract written down, and it is the one thing each tab has to add by hand.
- **Passing live elements into a row is normal, not an escape hatch.** Many rows hold a span the
  frame loop writes into by id; `fillTextField` and `createCostChips` take those intact. Rebuilding
  them as text would give the row a stale copy of a figure something else owns.
- **`createPriceLabel` is how a purchase row migrates.** The price label is found by the frame loop
  three separate ways and carries the affordability gate; a migrated row moves that element into the
  cost track rather than rebuilding it.
- **Migrations surface real defects, and they get fixed.** Tab 8's map caption was located with
  `document.querySelector('.option-row-main div label')` — the first such element in the entire
  document — and dereferenced with no null check. It is an id lookup now.

Both open questions from the earlier passes remain settled:

1. **`misty`** is defined explicitly in `styles.css`, holding the values it was already falling
   through to. Its palette can now be designed by editing one block instead of discovering that
   editing `:root` moves it.
2. **`backupScreenshots/` is not committed** and stays in `.gitignore` — 55 MB of PNGs, regenerable
   at any time with `node tools/capture-baseline-screenshots.mjs --pioneer Leigh1981`.