# P9 — Production Allocation: how it works, and what happens to existing players

A plain-English guide to the autosell / compound-automation rework, written to be
read before manual testing. Everything here describes what the code now does, not
what was planned.

The design decisions and the full audit live in
[`player-feedback-improvement-plan.md`](player-feedback-improvement-plan.md) under
**P9**. This file is the "what will I actually see" version.

---

## 1. The one-paragraph summary

Autosell used to empty a resource down to 100 units and hold it there forever, so
turning it on meant giving up on ever growing that resource. It now takes a
**percentage of what you produce each second** and never touches what is already
in the store. The same slider also decides how much of that production your
compound recipes are allowed to draw on. One control, on each resource's own
screen, decides everything — there is no separate on/off switch, and no state the
bar does not show you.

---

## 2. How the split works

Every second, for each resource:

- **Fuel comes off the top first.** Whatever your power plants burn of that
  resource is taken before anything else. You cannot black out your own grid by
  setting a high cash percentage — that was a deliberate safety decision. In
  practice this only bites on **carbon** (the basic power plant) and **diesel**
  (the advanced one); every other material has its whole production to divide.
- What is left is the **allocatable** amount. The slider divides *that*, not your
  gross production and not your stored stock.
- **Section 1 — cash.** This percentage is sold every second. The money arrives
  whether or not your store is full.
- **Section 2 — compounds.** This is a **ceiling**, not a reservation. It is the
  most that auto-creating compounds may take. If they want less, or they are
  switched off, the leftover goes into storage — it never turns into cash.
- **Section 3 — storage.** Everything else accumulates, exactly as it would with
  no automation at all.

One subtlety worth knowing before testing at a full store: the cash share is
computed from what you **produced**, not from what fitted into the store. That is
what makes "the money keeps coming at the cap" work. The store is only ever asked
to give back units that actually landed in it, so a full store pays out without
ever going backwards.

### Worked example

Iron producing 1000/s, no fuel burn, slider set to 10% cash / 40% compounds:

- Allocatable: **1000/s**
- Sold for cash: **100/s** worth of iron
- Offered to steel and titanium: up to **400/s**
- Accumulating in the iron store: **500/s**, plus any of the 400 the compounds
  could not use

### The three figures beside the bar

They are **destinations**, and all three move as you drag:

| Colour (terminal theme) | Figure |
|---|---|
| green | what is accumulating in this material's store, per second |
| blue | what is being sold, per second, in cash |
| magenta | what auto-creating compounds are actually taking, per second |

Every theme uses its own variables for these, so the pairing holds throughout;
the colours above are the terminal theme's.

Two things follow from "destinations":

- The green figure equals your full production only when the slider is at 0%
  cash and 0% compounds. Otherwise it is the remainder, and it moves whenever a
  handle does.
- The magenta figure is what is being **taken**, not what is being offered. A
  40% band with auto-create switched off reads **zero**, and the 40% shows up in
  the green figure instead — because that is genuinely where the material is
  going.

The **allocatable** total is deliberately not one of the three: it does not move
when a handle moves, so beside three figures that do it read as a fourth band
that never changed. It is quoted in the breakdown tooltip on the production
figure in the left pane, which is where a total belongs.

**Hovering the bar itself** explains all of this in place, with your own numbers
in the sentences, and grows with what you own — one handle gets the cash
paragraph alone, and the compound paragraphs appear only once you have a second
handle to use them on.

### Things worth knowing

- **Your store never goes down** because of the allocation. If you see a resource
  falling, something is wrong — that is the single most important thing to watch
  for in manual testing.
- **At a full store, cash keeps coming.** The bar stops moving because there is
  nowhere to put the units, but the cash percentage keeps paying. This is
  intentional and was agreed with the player who raised the original issue.
- **There is no autosell on/off switch.** Buying Nano Brokers once turns the
  slider on for good. To stop selling a material, drag its cash handle back to
  the storage end — that is what "off" means now, and unlike a toggle it is
  visible on the bar without hovering anything.
- **Auto-create is independent of selling.** Compounds draw their share whatever
  the cash handle is doing — by default the whole of production is available to
  them.
- **Anything a diversion cannot use falls back into storage.** Compounds switched
  off, a recipe bottlenecked on some other ingredient, a share nothing wants —
  all of it accumulates in the material's own store. The one exception is a store
  that is already full: there is nowhere for it to fall, so it is lost.

---

## 3. How compounds share a resource

Six of the eight resources feed more than one recipe:

| Resource | Feeds |
|---|---|
| hydrogen | diesel, concrete, water |
| sodium | glass, concrete, titanium |
| carbon | diesel, steel |
| silicon | glass, concrete |
| oxygen | glass, water |
| iron | steel, titanium |
| neon | titanium only |
| helium | nothing |

The rule is now:

- The resource's compound ceiling is split **equally** between however many
  auto-creating compounds draw on it. Two compounds means half each, three means
  a third each — regardless of how big their recipes are.
- **A compound that cannot use its whole share does not pass it on.** The unused
  part falls into the resource's own store.
- Switching one compound off **widens nobody else's share** — it just returns
  that share to storage.

This was chosen on purpose over a "proportional to demand" split, so that a
compound's speed depends only on its own settings and the resource sliders, never
on what some unrelated compound happens to be doing.

- A recipe needs several ingredients, so a compound makes only as much as its
  **scarcest** ingredient's share allows.
- It then **gives back** what it could not use. Titanium starved of neon does not
  also swallow the iron and sodium it cannot turn into anything.
- The compound's tooltip **names** whichever ingredient is holding it back.

---

## 4. What the controls look like

The screen changes as you buy the perk, so that you are never shown a decision
that does nothing.

| You own | A **resource** sell row shows |
|---|---|
| Nothing | Today's quantity dropdown + **Sell** button. Unchanged. |
| Nano Brokers ×1 | A slider with **one handle**: cash vs storage |
| Nano Brokers ×2 | A slider with **two handles**: cash / compounds / storage — but only on resources a recipe actually draws on |

- **Compound sell rows never change.** They keep the quantity dropdown and the
  **Sell** button for the whole game, and get no slider at any level. Compounds
  are not ingredients for anything, so there is nothing for a slider to balance.
- **Compounds are never autosold**, and their production tooltip says so by
  omission: the allocation block on a compound is a single **Accumulating** line
  and nothing about cash. In particular the game-wide **Autosell income** line is
  resources-only — it is earned entirely by the resource sliders, and printing it
  under a compound's production read as though the compound were contributing to
  it. **Allocatable** is resources-only for the same reason: it is the pool the
  handles divide, and a compound has no handles.
- **A compound's Accumulating line is the headline figure**, not a figure derived
  from the allocation breakdown. The breakdown's gross counts autobuyer output
  only, so a compound made by auto-creation or falling as rain reported `0`
  accumulating while its store visibly filled. Nothing is diverted from a
  compound, so its whole net rate is what accumulates.
- **Helium never gets a second handle**, at any level — nothing is made from it.
- **Auto-create stays a plain on/off toggle.** By the time you reach the compound
  screen, the resource screens have already decided how much material it may have.
  It is the *only* on/off switch left in this feature: the resource side's own
  autosell toggle has been removed, because the bar already says what is being
  sold and a switch that could contradict it was the confusion, not the cure.
- **Manual selling on a resource goes away** once you own level 1. The **Sell All**
  button in the header is untouched and is how you deliberately empty things.
- **The Fuse button becomes "Fuse All".** Fusing took its amount from the same
  quantity dropdown that selling did, so with the dropdown gone there is nothing
  left to choose — it now always fuses the whole stock, and the button says so.
- Handles snap to **5%**, cannot cross, and work with the arrow keys as well as
  by dragging. Dragging one handle past another pushes it along rather than
  inverting the bands.
- The row stays **one line tall**, the slider taking the width the dropdown and
  Sell button used to, so the Fuse button and the toggle stay in line with it.
- The figures beside the bar are **storage**, **cash** and (where there is a
  compound band) **the amount compounds are actually taking**. See
  [§2](#the-three-figures-beside-the-bar) — all three move with the handles.
- **Hovering the bar** brings up a tooltip explaining the handles and the
  figures, with the live values written into it.

---

## 5. The new perk

`nanoBrokers` is now a single **ascendency perk bought up to three times**. The
old **Nano Brokers tech** (19000 research points) and the old **Compound
Automation perk** (15 AP) are both gone.

| Level | Cost | What it unlocks |
|---|---|---|
| 1 | **15 AP** | Autosell — the allocation slider, one handle, on every **resource**. This is the only gate: once bought, the slider is always live |
| 2 | **30 AP** | Compound auto-create, and the compound band on the slider |
| 3 | **50 AP** | The compound auto-buyer tier rows |

- Because the levels are bought **in order**, "you can auto-create compounds"
  always implies "you have an allocation slider to feed them from". That is why
  they were merged — it removes a whole class of confusing half-states.
- A purchase takes effect **immediately**, mid-run. It no longer waits for the
  next rebirth. (The old Compound Automation perk did wait, which was a bug.)
- The perk is permanent across rebirths, like every ascendency perk.
- **Your slider settings now survive rebirth too**, including the auto-create
  toggles. A material you left selling nothing comes back selling nothing, with
  the rest of its split exactly as you set it.

---

## 6. What happens to an existing save — the migration

**Short version: nobody loses anything, nobody is charged again, and nobody gets
a refund.** Capability is preserved; the AP ledger is not rewritten.

### The rules, exactly

| What your save had | What you get | Cost to you |
|---|---|---|
| The old **Nano Brokers tech** researched | Nano Brokers **level 1** | **Free** |
| The old **Compound Automation perk** | Nano Brokers **level 3** | **Free** |
| **Both** of the above | Nano Brokers **level 3** | **Free** |
| Neither | Level 0 — nothing changes | — |

### Answering your questions directly

- **Do they get an AP balance to buy back what they lost?** No — and they do not
  need one. Nothing is lost. The levels are **granted outright**, already bought.
  No AP is added, deducted, or refunded.
- **Will the options just appear to be bought?** Yes. On the Ascendency screen the
  Nano Brokers row will show as already purchased to the level they earned, with
  the "bought ×N" status, exactly as if they had paid for it.
- **Will they be auto-granted if they had the old perks?** Yes, automatically on
  load. There is no prompt, no claim step, and nothing for the player to do.

### Why the old perk maps to level **3** and not level 2

This is the part most easily got wrong, and it was corrected during
implementation.

- The old Compound Automation perk set a hidden flag called `compoundMachining`.
- That flag gated **two** things: the auto-create toggle **and** the compound
  auto-buyer tier rows.
- P9 split those into separate rungs (2 and 3).
- So a player who bought the old perk **already had both**. Mapping them to level
  2 would have quietly removed their compound auto-buyers and put a 50 AP bill on
  getting back something they had already paid 15 AP for.
- Level 3 preserves exactly what they had.

### One thing that is deliberately reset

- If a save has **autosell switched on** for any resource, that flag is **cleared**
  on load.
- This is on purpose. The old flag meant "drain this store to 100 units forever",
  which the new engine has no equivalent for. Leaving it set would either do
  nothing (confusing) or hand the player an allocation they never chose.
- Nothing sells until the player moves a handle: every material's cash share
  starts at **0%**, so a migrated save behaves exactly as it did before until its
  owner chooses otherwise. Their old *intent* is not carried across, because the
  setting no longer means the same thing.

### Other tidying done automatically

- The stale `nanoBrokers` entry is removed from the researched-tech list, so no
  orphan row appears in the technology tree.
- The retired `compoundAutomation` perk is dropped from the saved perk list, so it
  cannot render as a row or be read as capability again.
- The save data version goes from **0.98 to 0.99**. Older saves are carried
  forward by the normal patch chain in `patches.js`.

---

## 7. What to look at during manual testing

In rough order of how much it would matter if it were wrong:

1. **Load an existing save with Compound Automation.** Confirm compound
   auto-buyer rows are still there, auto-create still works, AP is unchanged, and
   the Ascendency screen shows Nano Brokers as bought ×3.
2. **Watch a resource under allocation for a minute.** It must never fall. Set
   50% cash and confirm the number only ever climbs.
3. **Fill a store while allocation is on.** It should reach the cap, go green, and
   offer the storage increase. Cash should keep arriving after it is full.
4. **Set 90% cash on hydrogen with power plant 1 running.** The grid must stay up.
5. **Auto-create steel and titanium together.** Both must produce. Then cap steel
   and confirm titanium's rate is *unchanged* and iron starts climbing faster.
6. **Buy the perk mid-run.** Level 2 should open the auto-create toggles without a
   reload.
7. **Rebirth with distinctive splits set.** They should come back exactly as left,
   including any you deliberately switched off.
8. **Check the slider in every theme**, and that the row still lines up with the
   rows above and below it.
9. **Turn auto-create on and then go back to the ingredient's resource screen.**
   The row must stay clickable and the handles must still move — a legacy rule
   used to grey out and lock the whole row whenever a compound was drawing on it.
10. **Set a compound band with auto-create switched off.** The magenta figure
    must read zero and the green one must absorb the band — the material really
    is going to storage, and the figures have to say so. Switch auto-create on
    and the two must move in opposite directions by the same amount.
11. **Hover the bar.** The tooltip must name the three figures, explain the
    handles you actually have, and quote your own percentages and rates. At one
    Nano Brokers level it must say nothing about compounds.
12. **Drag the cash handle** and watch the green figure move with it. A green
    figure that sits still is the bug this pass fixed.

---

## 8. Where the code lives

| Thing | Where |
|---|---|
| The allocation engine | `game.js` — `runProductionAllocation`, `runCompoundAutoCreation` |
| What the displays read | `game.js` — `getAllocationBreakdown` |
| The generic slider control | `ui.js` — `createSlider` |
| The allocation line built on it | `ui.js` — `createAllocationLine` |
| The three figures beside the bar | `ui.js` — `updateAllocationReadout` |
| The how-to tooltip on the bar | `ui.js` — `buildAllocationSliderTooltip`, `attachAllocationSliderTooltip` |
| Which form the row takes | `game.js` — `setAutoSellToggleState` (historic name; there is no toggle any more) |
| The perk and its cost ladder | `resourceDataObject.js` — `ascendencyBuffs.nanoBrokers` |
| The capability gates | `resourceDataObject.js` — `getNanoBrokersLevel` and friends |
| The migration | `resourceDataObject.js` — `migrateRetiredAutomationUnlocks`, plus the 0.99 rung in `patches.js` |
| Tests | `tests/e2e/autosell/` |
