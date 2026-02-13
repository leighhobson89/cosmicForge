# Cosmic Forge — Game Design Document (GDD)

**Project:** Cosmic Forge  
**Build target:** v0.81 (save versioning via `GAME_VERSION_FOR_SAVES` in `constantsAndGlobalVars.js`)  
**Genre:** Single‑player incremental / idle + strategy meta-progression  
**Platform:** Web (HTML/JS). (Project structure supports packaging; see repo tooling.)  

---

## 1) High Concept

### 1.1 Elevator pitch
Cosmic Forge is an incremental game about rebuilding a civilization from a single atom of Hydrogen into a galaxy‑spanning empire. You automate industry, master energy and research, mine antimatter, build a starship, expand to new star systems, navigate diplomacy or conquest, and repeatedly **Rebirth** into new systems—carrying forward permanent power until you can dismantle the Miaplacidus force field and reclaim your lost homeland.

### 1.2 Player fantasy
- Start with nothing and build a self‑sustaining industrial machine.
- Push into space, discover the unknown, and make meaningful strategic choices.
- Become “The Cosmic Forger”: the architect of a multi-run, galaxy‑wide plan.

### 1.3 Design pillars
- **Compounding momentum:** manual actions quickly become automation; automation becomes infrastructure; infrastructure becomes interstellar capability.
- **Readable complexity:** many systems, but surfaced via tabs/options, modals, and clear readiness states.
- **Strategic runs:** each run has a destination, a build strategy, and a payoff (Ascendency Points, buffs, new systems).
- **Discovery + narrative:** news ticker hints, ancient manuscripts, black hole, O‑type stars, megastructures.

---

## 2) Target Audience & Experience Goals

### 2.1 Audience
- Players who enjoy idle/incremental games with deeper mid/late‑game systems.
- Players who like optimization (automation, energy balance, efficiency upgrades).
- Players who like light strategy/RPG elements (diplomacy, fleets, philosophies, permanent perks).

### 2.2 Experience goals
- **Early game:** clarity and satisfaction from rapid growth and first automation.
- **Mid game:** meaningful planning around energy, research, compounds, and mining.
- **Late game:** multi-system strategy: travel, diplomacy/war, AP optimization, time warp.
- **Endgame:** long-term objective with unique content (megastructures, force field, Miaplacidus).

---

## 3) Narrative, Setting, and Tone

### 3.1 Setting
You are Miaplacidean—survivor of a civilization destroyed by an invading AI species. After an experimental warp jump, you awaken in the **Spica** system, far from your homeland **Miaplacidus**.

### 3.2 Premise
The Spicites—a native sentient species—accept you as a leader ("Mia’Plac"). You rebuild using your knowledge, chase rumors of hostile systems and megastructures, and work toward returning to Miaplacidus.

### 3.3 Tone
- Hopeful rebuilding → tense expansion → epic endgame reclamation.

---

## 4) Game Structure Overview

### 4.1 Tabs (primary UX structure)
The game is organized into tabbed domains:
- **Tab 1: Resources** — gather, sell, store, automate resources.
- **Tab 2: Energy** — power generation and storage; consumption gates automation.
- **Tab 3: Research** — generate research, unlock technologies, philosophies, megastructure tech.
- **Tab 4: Compounds** — craft advanced materials.
- **Tab 5: Interstellar** — star map, starship, travel, diplomacy/colonization.
- **Tab 6: Space Mining** — telescope scanning, rockets, asteroid mining (antimatter).
- **Tab 7: Galactic** — rebirth, galactic market, ascendency perks, megastructures, black hole.
- **Tab 8: Menu/Settings** — configuration, help, themes, etc.

### 4.2 Runs & meta-progression
- A **run** starts in a star system, builds economy/tech, then expands and/or conquers.
- **Rebirth** resets most run progress while carrying permanent progression (Ascendency Points and other persistent unlocks).
- Long-term goal: **weaken and collapse the Miaplacidus force field** by conquering and researching megastructures.

---

## 5) Core Loops

### 5.1 Core loop (minute-to-minute)
1. Gain resources (manual → automated)
2. Manage storage / sell for cash
3. Spend cash/resources on upgrades
4. Generate research → unlock technologies
5. Repeat with compounding rates

### 5.2 Mid-game loop (session-to-session)
1. Stabilize energy generation and batteries
2. Unlock compounds and automated compound creation
3. Build telescope and launchpad
4. Scan asteroids → build rockets → mine antimatter
5. Convert antimatter into starship progress

### 5.3 Late-game loop (run-to-run)
1. Study stars / expand star map knowledge
2. Build & launch starship; choose destination
3. Travel; encounter diplomacy or war
4. Earn AP (distance + bonuses)
5. Rebirth into a new system
6. Spend AP in Galactic Market / Ascendency perks

---

## 6) Progression & Gating

### 6.1 Primary gates
- **Storage** as a hard limiter early.
- **Energy availability** as the main mid-game limiter.
- **Research points** as the main tech limiter.
- **Antimatter supply** as the late-game travel fuel limiter.

### 6.2 Unlock cadence (high level)
- Start: Hydrogen, manual gain + selling + storage upgrades.
- Early: Auto Buyers for resource gain.
- Research unlocks: new mechanics, tabs, tiers.
- Mid: Energy tab unlock; power plants & batteries.
- Mid: Compounds unlock; advanced build requirements.
- Mid: Space Mining unlock; telescope, rockets.
- Late: Interstellar unlock; star map and star studies.
- Late: Starship construction and launch.
- Endgame: Ancient Manuscripts → Megastructures → Force Field → Miaplacidus.

---

## 7) Systems (Design Details)

## 7.1 Resources & Cash Economy
**Concept:** Resources are the foundational “atoms” of progress.

**Key mechanics:**
- **Manual gain:** add 1 unit while under storage cap.
- **Storage cap:** blocks additional gain when full.
- **Storage upgrade:** consumes “all but 1” of that resource/compound to increase storage.
- **Sell:** exchange selected quantities for **Cash**.

**Design goal:** create early satisfaction through fast cycles and clear next upgrades.

---

## 7.2 Automation (Auto Buyers)
- Auto Buyers generate resources passively until storage fills.
- Advanced automation tiers exist (gated by tech such as Quantum Computing, etc.).
- Many automation features require **Energy**.

**Design goal:** shift player focus from clicking to planning.

---

## 7.3 Research & Technology
**Research points** are produced by research upgrades (Science Kit/Club/Lab, etc.).

**Technology**:
- Purchased with research points.
- Most techs have prerequisites.
- Tech unlocks include new tabs, automation tiers, starship parts, interstellar systems, black hole research, etc.

**UI convention:** research actions often prompt a modal confirm and produce a notification.

---

## 7.4 Compounds & Crafting
- Compounds are advanced materials built from multiple resources.
- Compounds gate major infrastructure (launchpad, rockets, starship modules).
- Later systems enable automated compound creation.

**Design goal:** provide an “economy step-up” that forces production line thinking.

---

## 7.5 Energy System
**Energy** is both:
- A requirement for automation/research features.
- A balancing system to prevent runaway early automation.

**Components:**
- **Power buildings:** generate energy, often consuming fuel.
- **Batteries:** store energy for when generation dips.

**Failure state:** insufficient energy limits or disables features that require it.

---

## 7.6 Weather
Weather affects:
- Energy production (depending on building types and system).
- Rocket launch conditions.
- Precipitation yields (extra resources).

**Design goal:** add variability and system identity between star systems.

---

## 7.7 Random Events
Random events provide occasional:
- Positive spikes (e.g., research breakthroughs).
- Negative setbacks (e.g., stock loss, explosions).
- Timed effects (e.g., market lockdown, endless summer, black hole instability).

**Design goal:** keep long runs lively without undermining player agency.

---

## 7.8 Space Mining (Asteroids, Rockets, Antimatter)
**Telescope:**
- Scans for asteroids (and later studies stars).
- Expensive and energy-intensive.

**Launch pad & rockets:**
- Build up to 4 rocket miners.
- Fueling requires energy and time.
- Launching requires favorable weather.

**Asteroids:**
- Contain antimatter.
- Vary by class/quality.
- Legendary asteroids can be discovered and named.

**Antimatter:**
- Core late-game resource.
- Used for starship fuel and endgame progression.

---

## 7.9 Interstellar (Star Map, Star Studies, Starship)
**Star Map:**
- Represents known universe.
- Becomes strategically important when planning travel and rebirth.

**Starship:**
- Major milestone.
- Built from advanced resources/compounds.
- Once launched, it cannot be retrieved that run (point of no return warning).

**Travel:**
- Choose destination star.
- New systems have different weather/resources/challenges.

---

## 7.10 Diplomacy & Conquest
When arriving at a system:
- You can scan, send envoys, and interact.
- Choices influence outcomes (impression, willingness to vassalize, etc.).
- If diplomacy fails or is skipped, **war** is required.

**Design goal:** add strategic variation and roleplay.

---

## 7.11 Fleets & Battle
- Build fleet units via fleet hangar systems.
- Battles can be initiated when ready.
- Losing a battle destroys fleets but does not destroy the starship; the player can rebuild and retry.

---

## 7.12 Ascendency Points (AP), Galactic Market, and Ascendency Perks
**AP earning:**
- Primarily from traveling to stars (distance-based).
- Additional sources include run liquidation and certain colonization methods.

**Spending:**
- Galactic Market trades resources/cash/AP.
- Ascendency perks provide permanent buffs.

**Design goal:** ensure each run meaningfully advances the meta-layer.

---

## 7.12.1 Galactic Casino (CP, Risk Games, and Utility Prizes)

**Concept:** The Galactic Casino is a CP-driven (Casino Points) risk/reward + utility system in Tab 7 (Galactic). Players can buy CP by trading resources/compounds/cash, then spend CP across three mini-games that award CP back, grant resources/cash/research, or “finish” active travel/telescope timers.

**Where it lives (code entry points):**
- `resourceDataObject.js`: persistent casino state (`galacticCasino`, `getGalacticCasinoDataObject`, `setGalacticCasinoDataObject`).
- `constantsAndGlobalVars.js`: global unlock + pricing (`getGalacticCasinoUnlocked`, `getPriceCasinoGame2`, `getPriceCasinoGame3`).
- `drawTab7Content.js`: renders the Galactic Casino UI (CP purchase row + Game 1/2/3 UI blocks).
- `game.js`: `galacticCasinoChecks()` runs every tick to enable/disable casino UI and keep it safe/consistent.
- `casino.js`: authoritative game logic for playing/animating games and awarding prizes.
- `descriptions.js`: in-game help strings for the casino rows.
- `ui.js`: displays CP balance in the option header when the casino option is open.

### A) CP (Casino Points) economy

**Persistent state:**
- `galacticCasino.settings.baseProbabilityCasino` (default `0.4`): base win probability for chance-based outcomes.
- `galacticCasino.casinoPoints.quantity`: player CP balance.
- `galacticCasino.casinoPoints.cpBaseCost`: baseline exchange rate multiplier.
- `galacticCasino.casinoPoints.valueOfOneCP.resources|compounds`: relative values used to price CP purchases.

**CP purchase:**
- UI: “Purchase CP” row in Galactic Casino (dropdown for currency + quantity input + BUY button).
- Logic: computed each tick in `galacticCasinoChecks()` to show the preview cost and enable BUY only when affordable.
- Cost model: `costPerCp = cpBaseCost / valueOfOneCP[selectionType][selection]` (cash is treated as a currency with base value `1`).

### B) Game 1 — Double or Nothing

**Pitch:** Stake CP and spin a win/lose outcome. Win awards 2× stake, lose forfeits stake.

**Implementation notes:**
- Uses animated spinner UI (track + easing) and a probabilistic result driven by `baseProbabilityCasino`.
- Primary functions live in `casino.js` (spin logic + stake resolution).

### C) Game 2 — Wheel Of Fortune (special prize claim)

**Pitch:** Spend CP to spin a wheel. If a “special” outcome is hit, the player chooses a *special prize* from a dropdown and must press **CLAIM**.

**Key behavior / safety invariants:**
- The dropdown and claim button are only enabled when the wheel has `data-special-ready=true` and is not spinning.
- The selected dropdown option is revalidated every tick in `game.js`:
  - If a timer-finishing prize becomes invalid (e.g., the underlying timer completed while the player had it selected), that option is marked `red-disabled-text`, selection is reset back to `select`, and **CLAIM** becomes disabled.
  - This prevents claiming stale/ineligible specials.

**Special prize keys (examples):**
- CP flat grants: `special_100cp`.
- Research grant: `special_100k_research`.
- Double stock: `special_double_*` (e.g. `special_double_titanium`).
- Timer utilities:
  - `special_starship_warp` (shorten starship travel to 2s).
  - `special_rocket_warp` (shorten a rocket travel/return to 2s).
  - `special_telescope_finish_asteroid_search`
  - `special_telescope_finish_star_study`
  - `special_telescope_finish_void_pillage` (VoidBorn only)

**Analytics:**
- On successful claim, `casino_prize_won` is emitted with `game_id: game2_wheel_special` and `prize_key` plus award details.

### D) Game 3 — Higher Or Lower (tier prizes)

**Pitch:** A staged risk ladder. The player chooses Higher/Lower repeatedly and can cash out at any stage for the currently displayed tier prize.

**Tier 7 “finish” / utility prizes:**
- `special_finish_rocket_journey`
- `special_finish_starship_journey`
- `special_telescope_finish_asteroid_search`
- `special_telescope_finish_star_study`
- `special_telescope_finish_void_pillage` (VoidBorn)

**Unification note:** Tier 7 utility prizes call the same authoritative prize-claim handler as Game 2 via `claimCasinoSpecialPrizeByKey(...)`.

### E) Timer-finishing prize architecture (single shared helper)

Timer-finishing specials should share one completion/checking mechanism so Game 2 and Game 3 behave identically.

**Central helper:**
- `finishTimerPrize({...})` in `casino.js`
  - Validates “active” + ms remaining.
  - Removes the timer by name.
  - Applies the finish side-effect.
  - Sets remaining time to `0`.

**Telescope/void/star timers:**
- `finishAsteroidSearchInstantly()` (removes `searchAsteroidTimer`, discovers asteroid, resets telescope state)
- `finishStarStudyInstantly()` (removes `investigateStarTimer`, finalizes star study)
- `finishVoidPillageInstantly()` (removes `pillageVoidTimer`, grants pillage rewards)

**Travel/warp timers (2-second settle pattern):**
- Starship warp/finish uses a “reduce to 2 seconds then restart the normal timer” approach so the normal completion logic runs:
  - remove `starShipTravelToDestinationStarTimer`
  - set remaining to `2000ms`
  - call `startTravelToDestinationStarTimer([2000, 'wheelPrize'])`
- Rocket finish uses the same pattern via `startTravelToAndFromAsteroidTimer([2000, 'wheelPrize'], rocketKey, returning)`.

**Design goal:** Timer prizes should never desync state/UI; they should converge by letting the normal timer completion code finish the journey.

---

## 7.13 Rebirth
Rebirth:
- Resets run progress.
- Starts a new run in the conquered system.
- Carries forward AP and other permanent progression.

**Design goal:** convert “completion of a run” into long-term momentum.

---

## 7.14 Philosophies (Permanent Player Path)
Players permanently choose one philosophy, shaping their long-term strategy.

- **Constructor:** cheaper upgrades; efficiency/storage/automation focus.
- **Supremacist:** stronger/cheaper fleets; intimidation; conquest focus.
- **VoidBorn:** better diplomacy; better asteroid/study outcomes; AP-focused.
- **Expansionist:** cheaper/faster travel; multi-system expansion.

Each philosophy unlocks a special ability and repeatable techs after the first rebirth.

---

## 7.15 Black Hole Time Warp
- Discovered via star studies.
- Must be researched before use.
- Has charge/activate loop.
- Upgrades: power (multiplier), duration, recharge.
- Applies a time warp multiplier to systems driven by delta timers.

**Design goal:** create a late-game “tempo control” tool.

---

## 7.16 O-type Stars
- Rare, violent stars.
- Each provides dramatic amplification to a power building type.
- Expected to have hardened defenses.

---

## 7.17 Ancient Manuscripts → Megastructures → Force Field (Endgame)
**Ancient manuscripts:**
- Breadcrumb system pointing toward hidden megastructure star systems.
- Clues can appear in the news ticker.

**Megastructures (examples):**
- Dyson Sphere
- Celestial Processing Core
- Plasma Forge
- Galactic Memory Archive

Megastructure research provides powerful bonuses and reduces the Miaplacidus force field.

**End goal:**
- Collapse the force field.
- Attack the Master AI.
- Reclaim Miaplacidus.

---

## 8) UI/UX Guidelines

### 8.1 Readiness feedback
- Use `green-ready-text` and disabled/red states to communicate actionability.
- Use modals for “point of no return” decisions (starship launch, rebirth, etc.).

### 8.2 Information channels
- **Notifications:** immediate feedback on actions, unlocks, and events.
- **News ticker:** lore, hints, and occasional buffs.
- **Help content:** structured by sections (Get Started, Concepts, End Goal, etc.).

### 8.3 Settings and themes
- Multiple themes (terminal, dark, misty, light, frosty, summer, supernova, galaxy, space).
- Settings include audio toggles and other UX preferences.

---

## 9) Persistence & Save/Load

### 9.1 Local saves
- Full game state serialization.
- Export/import of save strings (compressed).

### 9.2 Cloud saves
- Supabase-backed cloud storage by “Pioneer name” identity.

### 9.3 Migration/versioning
- Save data includes a version.
- Patch/migration steps run on restore to maintain compatibility.

---

## 10) Content Inventory (High-Level)

### 10.1 Resources & compounds
- Core resources (Hydrogen and beyond), fusion outputs, and compound recipes.

### 10.2 Technologies
- Large technology tree with prerequisites.
- Repeatable tech tracks (especially philosophies).
- Megastructure tech tracks (5 steps per structure).

### 10.3 Stars and systems
- Named star list (with star types) supports starfield generation.
- System identity via weather, encounters, and late-game structures.

### 10.4 Achievements
- Wide achievement set reinforcing all major systems (research, energy, rockets, diplomacy, rebirth, megastructures, black hole, etc.).

---

## 11) Balance Notes (Principles)

- **Storage upgrades** should feel like meaningful leaps early.
- **Energy** should be a controllable constraint: players can plan around it.
- **Automation** should relieve tedium but introduce new planning layers.
- **Antimatter** should be scarce enough to make travel choices meaningful.
- **AP** should reward exploration distance and smart run routing.

---

## 12) Production Notes / Roadmap (Optional)

- Polish onboarding steps and pacing to reduce early overwhelm.
- Expand star system identity (unique event weights, diplomacy traits, and weather patterns).
- Endgame tuning: megastructure discoverability, force field pacing, final battle cadence.

---

## Appendix A — Glossary
- **AP (Ascendency Points):** permanent currency earned via travel/rebirth.
- **Rebirth:** run reset + new system start + permanent progression.
- **Auto Buyer:** automation building that generates resources.
- **Time Warp:** black hole multiplier that accelerates multiple timers/systems.
- **Megastructure:** rare endgame structure providing multi-step research bonuses.
