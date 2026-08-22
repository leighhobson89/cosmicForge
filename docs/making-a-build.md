# Making a build

Cosmic Forge ships through two entirely separate pipelines, and they do not share
a single line of code:

| | Web / itch.io | Desktop |
|---|---|---|
| Driven by | `create_build.py` (Python) | `tools/build-stamp.mjs` (Node), via the `build:*` npm scripts |
| Produces | a minified zip in `builds/` | a portable `.exe` (Windows) or a `.zip` (Linux) in `dist/` |
| Packager | `zipfile`, after `terser` + `html-minifier` | `electron-builder` |
| Publishes to | itch.io (via `butler`) and/or InfinityFree (via FTP) | nothing — the artifact is left on disk |
| Sets `buildFlags.js` | **no** — ships whatever is in the working tree | **yes** — rewrites it before packaging |
| Demo variant | only by editing `buildFlags.js` by hand first | `build:win:demo` / `build:linux:demo` |

That last-but-one row is the single most important thing on this page. The Python
script is a *packager*: it copies the working tree as it finds it. The Node script
is a *stamper and packager*: it rewrites `buildFlags.js` first. Skip to
[Build flags](#build-flags) before running either one.

---

## Before any build

1. **Bump the game version.** `GAME_VERSION_FOR_SAVES` in
   `constantsAndGlobalVars.js` is what a save is stamped with, and
   `MINIMUM_GAME_VERSION_FOR_SAVES` is the oldest save the game will still load.
   Raise the former for a release; raise the latter only when a save format
   change makes old saves genuinely unloadable.

2. **Check the localization catalogue.**

   ```bash
   npm run check:localization          # pass/fail
   npm run check:localization:report   # full classification of every key
   ```

   Both build pipelines run this for you and abort on failure, so this step is
   only about finding out early. A missing key does not throw at runtime —
   `localize()` returns the key itself, so the player sees `headerMainDiesel` on
   screen, and only in a language you are unlikely to be playing in. That is why
   the check gates the build rather than merely reporting after the fact.

3. **Run the suite**, or at least the areas you touched:

   ```bash
   node tests/run-e2e.mjs                # everything, one HTML report per area
   node tests/run-e2e.mjs demo-build     # just the lockdown area
   ```

   See [`../tests/docs/running-tests.md`](../tests/docs/running-tests.md).

---

## Build flags

`buildFlags.js` at the repository root is three lines, read by the page before
anything else runs:

```js
window.__DEMO_BUILD__ = false;
window.__COSMIC_RIP_ENABLED__ = true;
window.__VARIABLE_DEBUGGER_AND_CHEATS__ = true;
```

| Flag | Read by | Effect |
|---|---|---|
| `__DEMO_BUILD__` | `initialiseStaticButtonLabels()` in `ui.js`, which does `setDemoBuild(isElectron ? window.__DEMO_BUILD__ === true : false)` | Turns on every demo lockdown — see [Demo vs full](#demo-vs-full). |
| `__COSMIC_RIP_ENABLED__` | `constantsAndGlobalVars.js` and `ui.js` directly | When false, the Cosmic Rip tab (tab 8) is removed from the UI entirely. |
| `__VARIABLE_DEBUGGER_AND_CHEATS__` | `getVariableDebuggerAndCheats()`, checked by the two debug hotkeys | When true, **Numpad −** opens the scenario debug menu and **Numpad ✱** opens the variable debugger. |

### The demo flag only works in Electron

Note the `isElectron ?` in the line above. The user agent is sniffed for
`electron`, and in a plain browser the demo flag is **ignored** — `setDemoBuild`
is handed `false` regardless of what `buildFlags.js` says. Shipping a demo to the
web therefore takes more than flipping the flag; today the web pipeline has no
demo variant at all.

### The cheat flag is the one that can leak

The hotkey gate is:

```js
(!isElectron && !getDemoBuild() && getVariableDebuggerAndCheats() && event.code === 'NumpadSubtract')
  || (getSaveName()?.includes('Test1981') && event.code === 'NumpadSubtract')
```

Read that first clause carefully: in a **browser** build with
`__VARIABLE_DEBUGGER_AND_CHEATS__ = true`, any player at all can press Numpad −
and open the debug menu. The desktop pipeline protects you from this — 
`build-stamp.mjs` hard-codes the flag to `false` on every build, demo and full
alike, and there is a test pinning that. The Python pipeline does not: it copies
`buildFlags.js` verbatim, and the checked-in default is `true`.

**So before running `create_build.py`, set the flag to `false` by hand.** The
second clause is the deliberate exception: a pioneer named with `Test1981` in it
keeps the hotkeys in any build, which is the backdoor the e2e suite boots
through.

---

## Demo vs full

A demo build is the full game with a wall built across it. Every lockdown is
applied by adding the `electron-purple-demo-button` class, whose CSS is
`pointer-events: none` — the class *is* the enforcement, so the handler behind a
locked control is still attached and would still fire if the rule stopped
applying. Hovering any locked control raises a purple tooltip explaining why.

Most locks are baked in at **draw** time: `drawTab2Content` and friends read
`getDemoBuild()` as they build each option row. Toggling the flag on a running
page therefore locks nothing that has already been drawn.

What the demo withholds:

| Area | Locked | Left playable |
|---|---|---|
| Energy | all three battery tiers, Solar Power Plant, Advanced Power Plant | the basic Power Plant |
| Research | Science Lab | Science Kit, Science Club |
| Technology | `orbitalConstruction` — the gate to the starship, and the wall the demo stops at | every other tech |
| Space mining | rockets 2, 3 and 4; Study Stars on the telescope | rocket 1 |
| Autobuyers | tier 3 and tier 4, on every resource and compound | tiers 1 and 2 |
| Interstellar | Star Data, Star Ship, Fleet Hangar, Colonise, Galactic Casino | Star Map |
| Galactic | the whole tab 7 | — |
| Saving | autosave dropdown and toggle, export/import save, cloud save; `saveGame()` discards, and no cloud request is made at boot | — |
| Debug | both hotkeys | the `Test1981` backdoor |

All of the above is asserted by [`tests/e2e/demo-build/demo-build.spec.js`](../tests/e2e/demo-build/demo-build.spec.js),
which boots a spoofed Electron demo rather than toggling the flag, for the
draw-time reason above.

---

## Desktop builds (Electron)

```bash
npm run build:win:demo      # Cosmic Forge Demo.exe
npm run build:win:full      # Cosmic Forge Full.exe
npm run build:linux:demo    # Cosmic Forge Demo.zip
npm run build:linux:full    # Cosmic Forge Full.zip
npm run build:all           # all four, Windows and Linux chains in parallel
```

Each of the four forwards to the stamper:

```bash
node tools/build-stamp.mjs <win|linux> <demo|full>
```

Both arguments are required and validated; anything else prints usage and exits 1.
The script then, in order:

1. Runs `validateLocalization.cjs` and **aborts the build** if it fails.
2. Rewrites `buildFlags.js` with `__DEMO_BUILD__` set from the flavour,
   `__COSMIC_RIP_ENABLED__` set to `true`, and `__VARIABLE_DEBUGGER_AND_CHEATS__`
   forced to `false` — always, both flavours.
3. Patches `package.json` so the artifact is named `Cosmic Forge Demo` or
   `Cosmic Forge Full` for the target platform.
4. Runs `bun run build:win` / `build:linux`, which re-checks localization,
   regenerates the icons via `icon-gen`, and calls `electron-builder`.
5. Restores the original `package.json` in a `finally` block — so an interrupted
   build leaves `package.json` clean.

Two wrinkles worth knowing. `buildFlags.js` is **not** restored afterwards, so
after a demo build your working tree is left with `__DEMO_BUILD__ = true` and
cheats off; check it before you run the game locally or run the Python packager.
And `readCosmicRipEnabledFlag()` / `readVariableDebuggerAndCheatsFlag()` exist in
the script but are not called — the two values are hard-coded — so editing them
in `buildFlags.js` has no effect on a desktop build.

`bun` is required: `build:all` and the `build:*` scripts invoke it directly.

---

## Web and itch.io builds

```bash
python create_build.py <build_name> [--skip-localization-check]
```

| Argument | Meaning |
|---|---|
| `build_name` | Required, positional. Names the zip — `cosmicForge_Build_<build_name>.zip` in `builds/` — and doubles as the **itch.io channel** the build is pushed to. Convention is `cosmicForge_vx.xx`. |
| `--skip-localization-check` | Package without running `validateLocalization.cjs` first. Without it, a catalogue failure aborts the build. Use it only when you already know the state of the catalogue. |

What it does:

1. **Validates localization** unless skipped.
2. **Copies the working tree** to `temp_build/`, skipping everything in
   `IGNORE_LIST` — `.git`, `node_modules`, `tests`, `tools`, `builds`, `dist`,
   `icons`, `package.json`, the Python scripts themselves, the graph and
   spreadsheet working files, and the trailer video.
3. **Minifies** every `.js` with `npx terser --compress --mangle` and every
   `.html` with `npx html-minifier`, in place. Neither tool is a declared
   dependency, so `npx` fetches them on first run — expect a pause, and a working
   network connection.
4. **Zips** `temp_build/` into `builds/`.
5. **Asks whether to push to itch.io.** Answering `Y` runs
   `butler push <zip> leighhobson89/cosmic-forge:<build_name>`. `butler` must be
   installed and logged in (`butler login`).
6. **Asks whether to push to InfinityFree.** Answering `Y` uploads `temp_build/`
   over FTP to `ftpupload.net:/htdocs`. The upload is incremental: a
   `.ftp_manifest.json` at the repo root records the size and mtime of every file
   uploaded, and unchanged files are skipped. Files missing from the manifest are
   compared against the server's own `SIZE`/`MDTM` before being sent.
   The password comes from the `COSMICFORGE_FTP_PASSWORD` environment variable,
   or is prompted for if that is unset.
7. **Deletes `temp_build/`** in a `finally` block, whether or not the build
   succeeded.

Both prompts are interactive, so this script cannot run unattended as written.

The minification is destructive but confined to `temp_build/`; your working tree
is never minified.

---

## The other Python scripts

None of these are part of a build, but they live alongside `create_build.py` and
are easy to mistake for build tooling.

| Script | Usage | What it does |
|---|---|---|
| `addLocKeys.py` | `python addLocKeys.py key1 "en" "es" "de" "it" "fr" [key2 ...]` | Adds one or more keys to all language sections of `localization.json` at once, keeping them in parity. Arguments come in groups of six: the key, then its value in English, Spanish, German, Italian and French. |
| `graph.py` | `python graph.py` | Renders `resources/techData.json` as a Graphviz tech-tree diagram (`resources/graph.png`). Needs the `graphviz` Python package **and** the Graphviz binaries on `PATH`. |
| `watch_and_run.py` | `python watch_and_run.py` | Watches `resources/techData.json` and re-runs `graph.py` whenever it changes. Runs until interrupted. |

---

## Release checklist

```
[ ] Bump GAME_VERSION_FOR_SAVES (and MINIMUM_GAME_VERSION_FOR_SAVES if saves broke)
[ ] npm run check:localization
[ ] node tests/run-e2e.mjs
[ ] Desktop:
      npm run build:all
      -> dist/Cosmic Forge {Demo,Full}.{exe,zip}
      -> check buildFlags.js afterwards; the stamper leaves it stamped
[ ] Web / itch:
      set __VARIABLE_DEBUGGER_AND_CHEATS__ = false in buildFlags.js BY HAND
      python create_build.py cosmicForge_vx.xx
      -> builds/cosmicForge_Build_cosmicForge_vx.xx.zip
      -> answer the itch.io and InfinityFree prompts
[ ] git checkout buildFlags.js
```
