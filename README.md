# Cosmic Forge Project Documentation

> Build target: **v0.81** (see `GAME_VERSION_FOR_SAVES` in `constantsAndGlobalVars.js`).@constantsAndGlobalVars.js#24-30

---

## Table of Contents

1. [Project Overview & File Checklist](#project-overview--file-checklist)
2. [Getting Started & Setup](#getting-started--setup)
3. [Core Game Architecture](#core-game-architecture)
    - [UI System](#ui-system-ui-js--drawtabxcontentjs)
    - [Audio System](#audio-system-audiomanagerjs)
    - [Core Game Logic](#core-game-logic-gamejs)
4. [Data Models](#data-models)
    - [Resource Data Model](#resource-data-model-resourcedataobjectjs)
    - [Achievements System](#achievements-system-achievementsjs)
5. [Core Systems](#core-systems)
    - [Save and Load System](#save-and-load-system-saveloadgamejs--constantsandglobalvarsjs)
    - [Timer, Event, and Automation System](#timer-event-and-automation-system-timermanagerjs)
6. [Gameplay Overview & Concepts](#gameplay-overview--concepts-descriptionsjs)
7. [Extending & Best Practices](#extending--best-practices)
8. [References & Cross-References](#references--cross-references)

---

## 1. Project Overview & File Checklist

This section provides a checklist of all source files in the project, marking off those that have been fully documented in this file. Use this as a quick reference for file coverage and to locate documentation for each module.

### JavaScript Files
- [x] achievements.js
- [x] audioManager.js
- [x] constantsAndGlobalVars.js
- [x] descriptions.js
- [x] drawTab1Content.js
- [x] drawTab2Content.js
- [x] drawTab3Content.js
- [x] drawTab4Content.js
- [x] drawTab5Content.js
- [x] drawTab6Content.js
- [x] drawTab7Content.js
- [x] drawTab8Content.js
- [x] game.js
- [x] resourceDataObject.js
- [x] saveLoadGame.js
- [x] timerManager.js
- [x] ui.js

### CSS Files
- [x] styles.css

### HTML Files
- [x] index.html

---

## 2. Getting Started & Setup

> **Note:** [Add setup, build, and deployment instructions here for new developers.]

- **Project Structure:** All source files are located in the project root. Entry point is `index.html`.
- **Dependencies:** Uses Bootstrap 4 for UI, LZString for save compression, and Supabase for cloud saves. [Expand with npm/CDN install steps if needed.]
- **Running Locally:** [Add instructions for running a local server, e.g., with `npm start`, or opening `index.html` in a browser.]
- **Deployment:** [Add deployment instructions if relevant.]

---

## 3. Core Game Architecture

### UI System (`ui.js`, `drawTabXContent.js`)
- Modular tab rendering system, with each tab's content in its own file (e.g., `drawTab1Content.js`).
- Central UI logic in `ui.js` manages tab switching, rendering, notifications, tooltips, and event listeners.
- Achievement grid, dynamic content, and notifications are handled here.
- UI helpers and integration with the audio system for sound effects.

### Audio System (`audioManager.js`)
- Manages background music, weather ambience, sound effects, and boost sounds.
- Key classes:
  - `WeatherAmbienceManager`: Controls looping weather sounds.
  - `BackgroundAudioPlayer`: Handles background music playback.
  - `SfxPlayer`: Plays short sound effects for UI/gameplay events.
  - `BoostSoundManager`: Manages the antimatter boost sound effect.
- Audio is paused/resumed based on window focus and player settings.

### Core Game Logic (`game.js`)
- Contains all core gameplay logic, state management, and progression systems.
- Imports/exports state accessors, manages main game loop, timers, resource/upgrades, star systems, fleets, diplomacy, battles, achievements, rebirth, and UI integration.
- Central entry point for gameplay and player interaction.

---

## 4. Data Models

### Resource Data Model (`resourceDataObject.js`)

This section documents the structure and central role of `resourceDataObject.js`, which defines, stores, and manages all resource, compound, and star system data for Cosmic Forge.

**Overview:**
- `resourceDataObject.js` contains the master data objects for all resources, compounds, and related upgrades in the game.
- The main export is `resourceData`, a deeply nested object that holds the state and configuration for every resource and compound, including their quantities, rates, storage, upgrades, fusion paths, and more.
- The file also manages star system data, rocket/starship parts, fleet ships, and compound creation recipes.

**Structure of `resourceData`:**
- The `resourceData` object has a `version` property for migration/versioning.
- The `resources` property is an object keyed by resource name (e.g., `hydrogen`, `helium`, `carbon`, etc.). Each resource defines:
  - `autoSell`: Whether the resource is set to auto-sell.
  - `nameResource`, `screenName`: Display and reference names.
  - `saleValue`, `salePreviewElement`: Economy and UI integration.
  - `quantity`, `rate`, `usedForFuelPerSec`, `storageCapacity`, `currentSecondaryIncreasePrice`, etc.: State and progression variables.
  - `revealedYet`: Whether the resource is visible to the player.
  - `upgrades`: Nested objects for auto-buyers and other upgrade tiers, including tier levels, rates, prices, energy use, and activation status.
  - `canFuseTech`, `fuseTo1`, `fuseTo2`, `fuseToRatio1`, `fuseToRatio2`: Fusion mechanics for creating advanced resources.
- Compounds and advanced resources follow a similar structure, supporting extensibility.

**Star System and Space Data:**
- The file also defines and manages data for star systems, rocket miners, starships, and fleet units, using similar nested object structures.
- Functions like `getStarSystemDataObject` and `setStarSystemDataObject` provide safe access and mutation for star system data.

**Getter/Setter Functions:**
- All access to resource and star system data is routed through exported getter/setter functions (e.g., `getResourceDataObject`, `setResourceDataObject`, `getStarSystemDataObject`, `setStarSystemDataObject`).
- This encapsulation ensures safe, consistent data access and supports save/load and migration operations.
- Additional helpers exist for managing upgrades, auto-buyer tiers, part counts, and more.

**Integration with Game Logic and UI:**
- The resource data model underpins all core gameplay systems:
  - **Game Logic:** Resource production, consumption, upgrades, automation, fusion, and progression all read from and write to `resourceData`.
  - **UI Rendering:** Tab content, resource panels, upgrade buttons, and tooltips dynamically reflect the current state of `resourceData`.
  - **Automation:** Auto-buyers, auto-sell, and fusion logic operate directly on this data model.
  - **Save/Load:** The entire `resourceData` object is serialized as part of the save system, ensuring player progress is preserved.

**Extensibility:**
- To add a new resource or compound, developers simply extend the `resources` object in `resourceData` with a new entry, specifying all required properties and upgrade definitions.
- Fusion paths, upgrades, and UI integration are handled automatically if the structure is followed.
- Star systems, rockets, ships, and fleet units can be extended in a similar fashion.

**Cross-References:**
- **Save/Load System:** All resource and star system data is included in saves and restored on load.
- **UI System:** DrawTabXContent files and UI helpers read from `resourceData` to render the correct state.
- **Game Logic:** Functions in `game.js` and related modules manipulate this data for all gameplay mechanics.

**Summary:**
- `resourceDataObject.js` is the backbone of Cosmic Forge’s data model, providing a structured, extensible, and robust foundation for all resource, compound, and star system logic. Its getter/setter pattern ensures safe integration with the UI, core logic, automation, and persistence systems, making it easy to maintain and extend as the game evolves.

### Achievements System (`achievements.js`)

- Achievements are defined in a central data object, with unique keys, descriptions, rewards, and unlock conditions.
- The system supports both cumulative and event-based achievements, with progress tracked via flags and counters.
- Achievements can be reset on rebirth or persist across runs, depending on their configuration.
- UI integration: Achievements are shown in a grid with icons, tooltips, and notifications.
- Asset management: Each achievement has a themed icon, and notifications use text from `descriptions.js`.
- See also: [UI System](#ui-system-ui-js--drawtabxcontentjs), [Save/Load System](#save-and-load-system-saveloadgamejs--constantsandglobalvarsjs)

---

## 5. Core Systems

### Save and Load System (`saveLoadGame.js`, `constantsAndGlobalVars.js`)

This section details how Cosmic Forge manages game persistence, including what is saved, how state is stored and restored, migration/versioning, and the technical mechanisms behind local and cloud saves.

**What is Saved:**
- The entire game state is serialized, including all player progress, resources, upgrades, achievements, star systems, automation settings, fleets, philosophies, and meta-progression variables.
- Key objects and variables are defined in `constantsAndGlobalVars.js` and include resource data, star systems, achievements, galactic market, ascendency buffs, player state, and more.
- Arrays and objects track unlocked technologies, resources, compounds, automation status, timers, and statistics (e.g., allTimeTotalStarShipsLaunched, antimatter mined, run number).

**How State is Captured and Restored:**
- The function `captureGameStatusForSaving(type)` (from `constantsAndGlobalVars.js`) collects all relevant state variables into a single object for serialization.
- When loading, `restoreGameStatus(gameState, type)` unpacks the saved state and restores all variables, arrays, and objects to their correct in-memory locations.
- Getter and setter methods are used extensively to encapsulate access to global state, ensuring consistency and modularity.

**Variable Storage and Access:**
- Most game state is stored in exported variables and objects in `constantsAndGlobalVars.js`, which acts as the central repository for all persistent and runtime data.
- The save system serializes these variables, including nested objects for resources, achievements, star systems, and more.
- Data is accessed and updated via dedicated getter/setter functions to maintain encapsulation and facilitate migration.

**Local Save Options:**
- **Autosave:**
  - The game features an autosave system managed by `initializeAutoSave()` in `saveLoadGame.js`.
  - Autosave frequency is configurable. When enabled, the game periodically serializes state and updates the local save.
- **Manual Save:**
  - Players can trigger a manual save at any time, which serializes the current state and stores it locally.
- **Export/Import:**
  - Players can export their save as a compressed string (using LZString compression) to copy to clipboard or download as a `.txt` file.
  - Saves can be imported by pasting into an input area or uploading a file, restoring the game state.

**Cloud Save Options:**
- The game supports saving and loading from the cloud using Supabase as a backend (see `saveGameToCloud` and `loadGameFromCloud` in `saveLoadGame.js`).
- Cloud saves are linked to a unique pioneer name (player ID) and can be backed up, restored, or deleted.
- When autosave is enabled, the game can automatically push the latest save to the cloud.
- Cloud saves are compressed and stored as encoded strings, just like local saves.

**Save Data Format:**
- Saves are serialized to JSON, then compressed via LZString and encoded for storage/transmission.
- The save string contains all game variables, arrays, and objects required to fully reconstruct the game state.
- Both local and cloud saves use the same format for compatibility.

**Versioning and Migration:**
- Each save contains a version number (`saveData.version`). The minimum and current supported versions are defined in `constantsAndGlobalVars.js`.
- On load, the game checks the version of the save and, if outdated, runs migration logic to update the save structure and add any missing fields or objects.
- The function `migrateResourceData(saveData, objectType)` (in `saveLoadGame.js`) handles upgrading old saves to the latest schema by applying incremental changes for each version step.
- This ensures backward compatibility and prevents save corruption when new features or resources are introduced.

**Error Handling and Validation:**
- The system validates imported/compressed save strings before attempting to load them, preventing invalid or corrupted data from breaking the game.
- Notifications inform the player of successful saves/loads or errors during the process.

**Summary of Save/Load Functions:**
- `saveGame(type)`: Serializes and compresses the game state for saving.
- `loadGame()`: Decompresses and restores game state from a provided save string.
- `initializeAutoSave()`: Sets up periodic autosaving.
- `saveGameToCloud(gameData, type)`: Uploads the save to the cloud.
- `loadGameFromCloud()`: Downloads and restores a cloud save.
- `importSaveStringFileFromComputer()`: Loads a save from a local file.
- `downloadSaveStringToComputer()`: Exports the current save as a file.
- `copySaveStringToClipBoard()`: Copies the save string to the clipboard.
- `migrateResourceData(saveData, objectType)`: Handles migration of old save data to the latest version.

**Best Practices:**
- Players are encouraged to regularly export and back up their saves, especially before major updates.
- The migration system ensures that even very old saves remain compatible as the game evolves.

This robust save/load system ensures that player progress is reliably preserved, portable, and future-proofed against updates and new gameplay features.

### Timer, Event, and Automation System (`timerManagerDelta.js`, `timerManager.js`)

Cosmic Forge v0.81 now drives the majority of recurring logic with **delta timers** that advance based on real frame time instead of fixed setInterval loops. This section explains how both timer utilities work together in production.

**Overview:**
- `timerManagerDelta` owns a collection of `DeltaTimer` objects that tick through `requestAnimationFrame` via `timerManagerDelta.updateWithTimestamp(...)`. Each timer receives the true frame delta (optionally multiplied by Black Hole time-warp power) so that automation remains consistent regardless of frame rate or lag spikes.@timerManagerDelta.js#1-177 @game.js#595-719
- The older `timerManager` still exists for low-frequency, fire-and-forget intervals such as the news ticker and other UI macros where a simple setInterval is sufficient.@game.js#8644-8654

**Delta Timer Lifecycle:**
- `addTimer(id, { durationMs, repeat, onUpdate, onTick, onComplete, metadata })` registers a timer that advances every frame. Timers can be paused/resumed, removed, or automatically restarted if `repeat` is true.@timerManagerDelta.js#1-177
- `update()` accumulates elapsed real time so that resource production, automation, rocket travel, Black Hole charging, and other systems can consume as many "ticks" as their accumulator warrants. This is how the v0.81 conversion eliminated drift from chained setIntervals.@game.js#596-8363
- Multipliers such as the Black Hole time warp work by passing a higher multiplier into `updateWithTimestamp`, effectively speeding all delta timers without re-authoring individual systems.@game.js#710-719

**Division of Responsibilities:**
- **Delta-driven systems:** resource/compound auto-buyers, energy and research production, antimatter mining, rocket fuel consumption, travel timers, Black Hole charge loops, and starship travel timers all run through `timerManagerDelta` to gain pause/resume support during modals, rebirth, or when the tab loses focus.@game.js#596-8409
- **Interval-driven systems:** the legacy `timerManager` is intentionally scoped to rare UI-background loops (e.g., rotating news ticker) to avoid bloating the delta loop with long idle timers.@game.js#8644-8654

**Integration Notes:**
- The main game loop (see `gameLoop()` in `game.js`) calls `timerManagerDelta.updateWithTimestamp(performance.now(), effectiveMultiplier)` each frame. If the window is unfocused, the multiplier falls back to 1 to avoid runaway progression while hidden.@game.js#710-719
- Both managers expose helpers (`hasTimer`, `removeTimer`, `pauseTimer`, etc.) so UI modules such as `drawTab7Content` can safely tear down timers when the user navigates away from a screen or upgrades a system that changes timer parameters.@drawTab7Content.js#428-769 @game.js#4666-4723

**Extending the System:**
- Prefer `timerManagerDelta` for anything that needs deterministic catch-up (e.g., offline accumulation, multiplicative boosts, pausing). Allocate a unique `id`, store any metadata you need for callbacks, and let the shared loop handle cadence.
- Use `timerManager` only for isolated UI timers that do not need delta awareness.

This hybrid approach keeps legacy simple intervals where they make sense while ensuring gameplay-critical systems benefit from the new delta-based engine.


### UI Structure and Styling (index.html & styles.css)
- The UI consists of a notification area, news ticker, stats bar, tab navigation for game sections, a main content container with resource menus, and debug tools.
- Styling is handled via styles.css, using Bootstrap 4, CSS variables for themes, responsive layouts, and animations. Multiple color themes are defined (terminal, light, frosty, summer, forest, dark).

---

### Core Game Logic and Player Interaction (game.js)

---

### Gameplay Overview and Concepts (In-Game Help)

---

### Save and Load System

---

### Resource Data Model (`resourceDataObject.js`)

This section documents the structure and central role of `resourceDataObject.js`, which defines, stores, and manages all resource, compound, and star system data for Cosmic Forge.

---

### Timer, Event, and Automation System (`timerManagerDelta.js`, `timerManager.js`)

See the authoritative description earlier in this document. This second mention remains only as an anchor target for existing inbound links.


This section summarizes the gameplay, progression, and thematic concepts of Cosmic Forge, as presented in the in-game help file (`descriptions.js`). It provides a player-facing perspective on how the game works and what to expect throughout a playthrough.

**Story and Setting:**
- You play as a Miaplacidean, a survivor of a peaceful civilization destroyed by an invading AI species. After escaping via experimental warp technology, you awaken in the Spica system, where you must rebuild, guide a new colony, and ultimately seek to reclaim your lost home.

**Getting Started:**
- The game begins with minimal resources—primarily Hydrogen. Players gather Hydrogen, sell it for Cash, and use these basics to unlock further mechanics.
- The Resources Tab is the starting point: you can manually gain Hydrogen, sell it, and upgrade storage. Once storage is full, you can trade most of your Hydrogen for a storage upgrade, doubling your capacity.
- Automation is introduced early: building a Hydrogen Generator (Auto Buyer) allows resources to be gathered automatically.
- Research and Technology are unlocked via the Research Tab. Building a Science Kit generates Research Points, which are spent on unlocking technologies and new game features.

**Core Concepts:**
- **Resources:** The foundation of all progress. Gathered manually or automatically, sold for Cash, used for upgrades and fusion.
- **Manual Gain:** Each resource can be manually increased by clicking its button (until storage is full).
- **Selling:** Sell resources or compounds for Cash using dropdowns and buttons in the UI.
- **Storage:** Each resource/compound has a storage limit. Upgrading storage is key for progression.
- **Auto Buyers:** Automate resource collection once unlocked. Some require Energy to operate.
- **Research Points/Upgrades:** Generated by research buildings; spent to unlock technologies and new mechanics.
- **Technology:** Unlocks upgrades, automation, new resources, and advanced systems. Most have prerequisites and require Research Points.
- **Compounds:** Advanced materials created from multiple resources, needed for mid/late-game mechanics.
- **Fusion:** Combine basic resources to create more advanced ones.
- **News Ticker:** Displays important information and sometimes grants secret buffs.

**Mid-Game Systems:**
- **Energy Generation & Consumption:** Many upgrades and automation require energy, produced by power buildings and stored in batteries.
- **Power Buildings:** Generate energy, consuming fuel (compounds or solar).
- **Batteries:** Store excess energy for later use. Upgrading battery capacity is crucial for stability.
- **Weather:** Influences energy production, rocket launches, and can yield extra resources. Weather varies by star system.
- **Space Mining:** Extract rare Antimatter from asteroids using Rocket Miners.
- **Space Telescope:** Scans for asteroids and, later, studies stars. Requires significant energy and resources to build and operate.
- **Asteroids:** Contain Antimatter. Discovered via telescope, mined by rockets. Asteroids vary in quality and yield.
- **Rocket Miners:** Built at the Launch Pad using compounds and cash. Require fueling, launching, and can be renamed. Travel to asteroids to mine Antimatter, then return for refueling. Mining can be boosted for speed.

**Late-Game and Advanced Mechanics:**
- **Star Map:** Reveals the known universe and helps plan post-rebirth strategies. Becomes more important as you progress.
- **Antimatter:** Advanced resource, mined from asteroids, used as starship fuel and for late-game progression.
- **Starships:** Major milestone. Built from advanced resources, allow travel to new star systems and enable rebirth mechanics.
- **Starship Travel:** Travel to studied star systems, each with unique weather, resources, and challenges for new runs.
- **Diplomacy:** Many star systems contain alien civilizations. Players can scan, send envoys, and choose between diplomacy or war. Interactions affect fleet size, defense, and future options. Leader traits and player choices influence outcomes.
- **Battle:** Some systems require combat to conquer. Players build fleets and initiate battles, risking fleet loss on defeat but not losing their starship.
- **Ascendency Points (AP):** Earned by traveling to distant stars, liquidating resources, or through colonization. Used in the Galactic Market for permanent upgrades.
- **Rebirth:** Resets progress but conquers a new system, unlocking new challenges and rewards.
- **Galactic Market:** Unlocked after reaching a new system; allows trading of resources, cash, and AP.
- **Ascendency Perks:** Permanent buffs purchased with AP, making future runs easier and more varied.

**Philosophies:**
- Players choose one of four permanent philosophies during their first run, each offering unique abilities and repeatable techs:
  - **Constructor:** Cheaper upgrades, better automation and storage, reduced compound costs.
  - **Supremacist:** Military-focused, stronger fleets, vassalization options.
  - **VoidBorn:** Improved diplomacy, asteroid/star search, AP gain, and special resource events.
  - **Expansionist:** Faster, cheaper travel and colonization, with the ability to conquer multiple systems at once.
- Each philosophy grants a unique special ability and permanent, stacking tech bonuses.

**Progression and Replayability:**
- The game is designed for incremental progression, with each run unlocking new mechanics, resources, and strategies.
- Permanent upgrades and philosophies ensure replayability and evolving gameplay across multiple rebirths.

This help content provides both a narrative and mechanical guide for new and returning players, ensuring clarity on objectives, systems, and the overall journey in Cosmic Forge.


### Black Hole Time Warp System

- **Discovery & Research Gate:** The Black Hole is first encountered while running stellar studies with the Space Telescope. A modal in the Galactic tab guides players to research it before any interaction is possible, matching the in-game narrative that you "stumbled upon" the anomaly and must study it further before harnessing it.@descriptions.js#230-235
- **Dedicated Galactic UI:** Tab 7's "Black Hole" heading renders a bespoke layout with charge/activation progress bars, a canvas animation, and control buttons for research, Power, Duration, Recharge, and Charge/Activate actions. Until research is purchased with Research Points, the unlocked controls remain hidden.@drawTab7Content.js#428-769
- **Charging Loop:** Once researched, the feature alternates between charging and activation phases. Charging can be triggered manually; its timer can be shortened by Recharge upgrades, and progress is visualized through the charge bar. When charging completes, the system becomes "Charge Ready" and the Activate button swaps into an "ACTIVATE" state visually in UI (handled via `blackHoleUIChecks`).@game.js#1875-2068
- **Activation & Time Warp:** Activating the Black Hole consumes the stored charge, sets `currentlyTimeWarpingBlackHole`, and invokes `timeWarp(durationMs, multiplyRateBy)` which applies a temporary multiplier to production, travel, and other timer-driven systems. Achievements track both discovering the Black Hole and reaching >10× multipliers during activation.@game.js#523-532 @resourceDataObject.js#2318-2357
- **Upgrades & Persistence:** Power upgrades increase the time-warp multiplier, Duration extends active time, and Recharge reduces the charge timer by 10% multiplicatively, all purchased with Research Points and subject to cost scaling via `getGameCostMultiplier()`. Research completion and upgrade levels persist across rebirths, so once unlocked the Black Hole becomes a permanent part of every run.@drawTab7Content.js#568-639 @resourceDataObject.js#2825-2922

### Additional Late-Game Feature Notes

- **Ancient Manuscripts:** Late in the campaign you can uncover Ancient Manuscripts that reveal clues pointing toward hidden MegaStructure star systems. These discoveries are tied to News Ticker hints and serve as breadcrumbs toward the endgame objective of dismantling the Miaplacidean force field.@descriptions.js#2529-2537
- **Megastructures & Force Field:** MegaStructures (Dyson Sphere, Celestial Processing Core, Plasma Forge, Galactic Memory Archive) are scattered across the galaxy. Studying and ultimately connecting each one grants massive bonuses and chips away at the Miaplacidean defensive grid, culminating in the final battle to reclaim your homeland.@descriptions.js#3330-3377 @descriptions.js#2532-2540


- **Overview:**
  - `game.js` is the central orchestrator of Cosmic Forge, managing the main game loop, all gameplay systems, and the integration of UI, resources, upgrades, events, and player actions. It acts as the bridge between the player's inputs and the evolving game world, ensuring all systems update and interact cohesively.

- **Game Initialization and State Management:**
  - The game starts with `startGame()`, which initializes game variables, sets up the UI, loads or creates save data, and prepares timers and event listeners.
  - State is tracked using a combination of getter/setter functions for resources, upgrades, achievements, and player progress (imported from supporting modules).
  - The game supports multiple states: active play, rebirth, loading, and special modes (e.g., debug, automation).

- **Main Game Loop:**
  - The `gameLoop()` function is the heartbeat of the game, running continuously (typically via `requestAnimationFrame` or timer) while the game is active.
  - Responsibilities include:
    - Updating resource and compound production, consumption, and storage.
    - Advancing timers for automation, research, rockets, starship travel, and events.
    - Checking and triggering achievements, notifications, and UI updates.
    - Managing deferred actions and queued events.
    - Refreshing dynamic UI elements, progress bars, and tooltips.
    - Handling background and ambient audio updates.

- **Resource and Upgrade Systems:**
  - Resources (e.g., Hydrogen, Iron) and compounds (e.g., Diesel, Titanium) are managed with getter/setter functions and updated each loop tick.
  - Players can collect, sell, fuse, and upgrade resources, with prices and quantities dynamically calculated.
  - Upgrades (buildings, storage, efficiency, automation) are purchased via UI actions, with checks on affordability and prerequisites.
  - The game supports automation (autobuyers), which can be toggled and configured for various resources and processes.

- **Player Actions and Interactions:**
  - All player actions—button clicks, toggles, dropdowns, modal confirmations—are routed through functions in `game.js` or supporting modules.
  - Functions check preconditions (e.g., resource amounts, unlocks), update the game state, and trigger UI and audio feedback.
  - Special actions include rebirth (resetting progress for permanent bonuses), launching rockets, traveling to stars, engaging in diplomacy, and trading on the galactic market.

- **Automation and Timers:**
  - `timerManagerDelta` now manages all recurring and delayed actions that need deterministic catch-up, including resource production, research, rocket travel, and automation cycles, while `timerManager` is kept for a handful of low-frequency UI loops.@game.js#595-8654
  - Timers can trigger UI updates, resource changes, and event completions.
  - Automation systems allow for autobuying, auto-selling, and auto-fusing, reducing manual micromanagement for the player.

- **Star, Space, and Exploration Mechanics:**
  - The game features a galaxy map with multiple stars, each with unique properties and events.
  - Players can build and launch rockets, travel to asteroids, scan for resources, and settle new star systems.
  - Starship travel, asteroid mining, and space exploration are managed with timers, UI updates, and resource checks.
  - Diplomacy and fleet combat are supported, with functions for managing fleets, initiating battles, and resolving outcomes.

- **Research, Technology, and Philosophy:**
  - Players unlock new technologies and abilities through research, which is tracked and updated in the game loop.
  - Philosophies (player-selected traits) grant unique bonuses and change available upgrades and repeatable techs.
  - Research progress is displayed in the UI and can unlock new tabs, buildings, and automation options.

- **Rebirth and Ascendency:**
  - The rebirth system allows players to reset progress in exchange for ascendency points and permanent bonuses.
  - Achievements and certain unlocks persist or reset based on their configuration.
  - Rebirth triggers a cascade of state resets, UI updates, and reward applications.

- **Achievements and Progression:**
  - Achievement checks are integrated into the main loop, with functions for evaluating, granting, and rewarding achievements.
  - Achievements provide rewards, unlocks, and visual feedback in the UI.

- **Notifications, Modals, and Feedback:**
  - The game uses notifications and modal dialogs to inform the player of important events, confirmations, and rewards.
  - Functions manage the display, timing, and content of these elements, ensuring the player is kept informed and engaged.

- **Saving, Loading, and Persistence:**
  - Game state is saved and loaded via dedicated functions, supporting both local and cloud saves.
  - Autosave and manual save options are provided, with regular save intervals managed by timers.

- **Integration with UI and Other Modules:**
  - `game.js` imports and coordinates with `ui.js`, `resourceDataObject.js`, `achievements.js`, `audioManager.js`, and others.
  - It exposes key functions for UI event handlers and tab content renderers, ensuring seamless player interaction.
  - All major gameplay systems—resources, upgrades, automation, research, space, diplomacy, rebirth—are integrated through `game.js`.

- **Summary of Key Functions:**
  - `startGame()`: Initializes the game, loads data, sets up UI and timers.
  - `gameLoop()`: Main update loop, advances all systems and UI.
  - `checkAndDeductResources()`: Handles resource spending for actions and upgrades.
  - `startInitialTimers()`: Sets up recurring timers for automation, rockets, research, etc.
  - `addOrRemoveUsedPerSecForFuelRate()`: Manages fuel consumption for buildings and rockets.
  - `startInvestigateStarTimer()`: Begins star/asteroid scanning and exploration timers.
  - `checkRepeatables()`: Applies repeatable tech bonuses and updates.
  - `trackEnemyAndAdjustHealth()`: Manages fleet combat and battle outcomes.
  - `setGameState()`: Changes the main state of the game (active, rebirth, etc.).
  - `monitorRevealResourcesCheck()`, `setRevealedResources()`: Unlock new resources and UI elements as the player progresses.
  - Many more functions for handling upgrades, achievements, notifications, fleet management, rebirth, diplomacy, and more.

- **Player Experience:**
  - The player interacts with the game primarily through the UI, which is tightly coupled to `game.js` for all core actions.
  - Every button, toggle, and modal is ultimately routed through the logic in this file, ensuring a responsive and interactive experience.
  - The game is designed to be incremental and rewarding, with automation, upgrades, and exploration providing a sense of progression and discovery.

---

### Audio System (audioManager.js)

- **Overview:**
  - The game's audio is managed through `audioManager.js`, which defines and exports four main classes/objects for handling all background music, ambient sounds, sound effects (SFX), and boost/looped audio.
  - Audio can be toggled by player settings (background and SFX on/off). All audio playback is paused when the window loses focus and resumed when focus returns.

- **Main Audio Manager Classes:**
  - **WeatherAmbienceManager:**
    - Handles looping ambient weather sounds (e.g., rain, volcano) based on the current star system's weather.
    - Methods: `play(key, filePath)`, `pause(key)`, `pauseAll()`, `resumeAll()`, `update()`.
    - Only one weather ambience plays at a time; updates dynamically as weather changes.
  - **BackgroundAudioPlayer:**
    - Plays the main background music (`bgAmbience.mp3`) in a loop.
    - Methods: `play()`, `pause()`, `resume()`, `update()`.
    - Responds to player settings and pauses/resumes with window focus.
  - **SfxPlayer:**
    - Manages all short sound effects (button clicks, upgrades, events, etc.).
    - Predefined SFX keys: `swipe`, `click`, `increaseStorage`, `goodPrize`, `asteroidScan`, `powerOff`, `powerOn`, `powerTripped`, `rocketLaunch`, `rocketLand`, `starStudy`, `buildTelescope`, `buildLaunchPad`, `fuelRocket`.
    - Methods: `playAudio(audioKey, stopTarget)`, `stop(audioKey)`, `stopAll()`.
    - Used throughout the UI and gameplay to provide immediate feedback for actions.
  - **BoostSoundManager:**
    - Handles the special looping sound effect for antimatter boost (`boostAntimatter.mp3`).
    - Methods: `startBoostLoop()`, `stopBoostLoop()`.
    - Only plays when the antimatter boost is active; stops automatically when boost ends.

- **How Audio is Triggered Throughout the Game:**
  - **UI Interactions:**
    - `playClickSfx()` and `playSwipeSfx()` are called in UI event handlers (e.g., tab changes, button presses, dropdowns) to play click or swipe sounds.
    - Calls to `sfxPlayer.playAudio('increaseStorage')`, `sfxPlayer.playAudio('goodPrize')`, etc., are used to give feedback for specific upgrades, rewards, or actions.
  - **Gameplay Events:**
    - Rocket launches, landings, power toggles, and other gameplay milestones trigger corresponding SFX (e.g., `rocketLaunch`, `rocketLand`, `powerOn`, `powerOff`).
    - Ambient weather sounds and background music update dynamically as the player moves between star systems or changes settings.
    - The antimatter boost sound loops during boost mode and stops automatically.
  - **Focus/Blur Handling:**
    - All audio is paused when the game window loses focus and resumes if enabled when focus returns.

- **Integration Points:**
  - Audio manager functions are imported and called in UI rendering (`ui.js`), gameplay logic (`game.js`), and tab content files (e.g., `drawTab2Content.js`, `drawTab6Content.js`).
  - The system ensures that only one instance of each sound effect plays at a time and cleans up finished audio.

- **Player Control:**
  - Players can toggle background and SFX audio in the settings tab. The game respects these preferences for all playback.

---

### Modular Tab Rendering System (UI Overview)

- **Tab System Architecture:**
  - The UI is organized into 8 main tabs, each representing a major gameplay area (e.g., Resources, Energy, Research, Compounds, Star Map, Space/Asteroids, Ascendency, Settings/Help).
  - Each tab has a dedicated JavaScript file: `drawTab1Content.js` through `drawTab8Content.js`.
  - Each file exports a main function: `drawTabXContent(heading, optionContentElement)`, responsible for rendering the tab's content.

- **Tab Rendering Flow:**
  - When a user selects a tab, the main UI controller (`ui.js`) calls `updateContent(heading, tab, type)`.
  - `updateContent` determines which tab is active and invokes the corresponding `drawTabXContent` function, passing the current heading and the DOM element to populate.
  - This system allows each tab to be highly modular and independently responsible for its own UI logic.

- **Structure of drawTabXContent Files:**
  - Each `drawTabXContent.js` file:
    - Imports shared UI helpers and relevant game logic/data accessors.
    - Defines a single main function (`drawTabXContent`) that:
      - Clears or updates the content container for its tab.
      - Removes warning/attention indicators as needed.
      - Dynamically creates option rows, buttons, toggles, dropdowns, and other UI elements based on current game state.
      - Attaches event listeners for all interactive elements.
      - Updates UI state (e.g., enabling/disabling actions, showing/hiding options) based on game logic and progression.
    - Some tabs contain additional helper functions for specialized UI (e.g., star map rendering, fleet diagrams, modal dialogs).

- **Shared UI Element Creation Helpers:**
  - The following functions (defined in `ui.js`) are used throughout all tab content files to standardize UI construction:
    - `createOptionRow`: Creates a labeled row containing one or more interactive elements (buttons, toggles, dropdowns, etc.).
    - `createButton`: Generates a styled button with attached click handler and optional state logic.
    - `createDropdown`: Creates a dropdown/select element with options and onChange handler.
    - `createToggleSwitch`: Generates a toggle switch (on/off) with state binding.
    - `createTextElement`: Creates a styled text or label element.
  - These helpers ensure consistency across all tabs and simplify the process of updating or expanding UI functionality.

- **Data and State Integration:**
  - All tab content functions interact with the game's data model via accessor functions (e.g., `getResourceDataObject`, `setResourceDataObject`).
  - UI elements are dynamically enabled, disabled, or updated based on resource amounts, unlocks, achievements, and other game state variables.
  - Event handlers propagate user actions back to the game logic, ensuring real-time updates and feedback.

---

### Game Text, Tech Notifications, and Option Descriptions (descriptions.js)
- **Tech Notification Messages:** Each researchable technology in the game has a unique notification message explaining what is unlocked or improved, covering everything from basic fusion to advanced megastructures. Technologies unlock new gameplay mechanics, buildings, automation features, and progression systems.
- **Option Descriptions:** Every actionable UI row (selling, gaining, upgrading storage, creating compounds, using autobuyers) has a description that guides the player. Descriptions are context-sensitive and may change as new technologies are unlocked. Automation options for each resource are described, including power usage and upgrade tiers.
- **Advanced Technologies and Megastructures:** Special rows and notifications describe the process and benefits of unlocking and upgrading megastructures (Dyson Sphere, Celestial Processing Core, Plasma Forge, Galactic Memory Archive), emphasizing their galaxy-wide impact and new powers or efficiencies.
- **Philosophy/Leader Abilities:** Certain research options are tied to player "philosophies" or leader traits, granting unique bonuses (e.g., increased storage, faster expansion, cheaper construction, improved diplomacy). Each philosophy ability is described in terms of its gameplay effect.
- **Space and Fleet Mechanics:** Descriptions for building and using rockets, starships, and fleet units, including automation and special missions (diplomacy, scouting, combat). Explanations for space mining, asteroid travel, and scanning for alien life.
- **Rebirth/Reset:** The rebirth mechanic is described, clarifying what progress is lost and what permanent bonuses are retained.

---

### Achievement System (achievements.js, descriptions.js, UI)

- **Achievement Data Structure:**
  - Achievements are defined in `achievementsData` as objects with unique IDs, names, requirements, rewards, and flags indicating if they reset on rebirth or persist.
  - Rewards can include ascendency points, multipliers, cash, or other benefits.

- **Checking and Triggering:**
  - The game regularly checks for achievements using `checkForAchievements()`, which evaluates both generic and special conditions.
  - Special achievements use custom functions for their logic; generic ones check resource amounts, unlocks, or other standard goals.

- **Granting and Rewards:**
  - When an achievement is earned, `grantAchievement()` marks it as active and calls `addAchievementBonus()` to apply the reward.
  - A notification is displayed, and the UI updates to reflect the new status.

- **UI Representation:**
  - Achievements are shown in a grid, with icons and opacity indicating earned (active) or locked (inactive).
  - Tooltips provide descriptions, rewards, and rebirth reset status, updating dynamically.
  - Notifications appear when achievements are earned, using text from `descriptions.js`.

- **Resetting on Rebirth:**
  - Achievements with `resetOnRebirth: true` are reset on rebirth; others persist across runs.

- **Flags and Progress:**
  - Achievement flags track incremental or one-off progress, supporting both cumulative and event-based achievements.

- **Assets:**
  - Each achievement has a themed icon.
