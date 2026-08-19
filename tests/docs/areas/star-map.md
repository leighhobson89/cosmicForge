# Star Map & Star Data

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Medium |
| **Group** | Interstellar |
| **Spec folder** | `tests/e2e/star-map/` |
| **Existing coverage** | _none_ |

The seeded starfield and how each star is drawn, the four map modes, the search and its ping, the connection lines, orbits and arrows, the travel gate, and the Star Data table with its six sortable columns.

## What should be tested

- [ ] The starfield is a pure function of its fixed seed: the same star is in the same place on every draw
- [ ] Every drawn star is one the name table knows, none is drawn twice, and the current system is marked
- [ ] Distance is measured in three dimensions from the current system, and matches the figure each star record was built from
- [ ] A star inside the study range is drawn solid, one outside only twinkles, and studying further promotes more of them
- [ ] A studied O-type is marked out, a settled star gets its own id, colour and tag, and a reported megastructure star is drawn as one
- [ ] An unreported megastructure star is not drawn on the map, offered by the search, or listed in the table
- [ ] Miaplacidus is locked and unselectable until the final milestone, then turns ready-coloured and can be chosen
- [ ] Each mode button lights itself and dims the others, and a mode change clears any connection drawing
- [ ] Distance mode tints every star along the published ramp, nearest keeping the most blue
- [ ] In-range mode colours by whether the antimatter on hand covers the fuel; studied and in-range hide what is out of reach and normal shows it again
- [ ] The search needs two characters, says so when nothing matches, and is switched off with an explanation in the two modes it cannot work in
- [ ] Choosing a result selects that star, pings it on the map, and the ping clears itself
- [ ] Search results colour a studied star, an O-type and the locked home star differently
- [ ] Selecting a studied star draws a line and a label carrying its real antimatter and AP cost, coloured by affordability
- [ ] The line runs between the two stars: its length is the gap and its rotation the bearing
- [ ] An unstudied star draws the line with ??? for its costs; a settled star draws nothing at all
- [ ] A travelling starship draws a dashed line and an arrowhead that moves along it; an orbiting one draws an orbit circle three star-widths across, centred on the star
- [ ] The Travel button is refused one unit short of the fuel, accepted at exactly enough, and refused again without FTL Travel Theory
- [ ] The destination row reports the star, its distance and its fuel, and greys both while the trip is out of reach
- [ ] Every star in range carries a complete four-state weather table whose probabilities total one hundred
- [ ] The tendency a star advertises is its most likely state, and every star precipitates a real compound
- [ ] A star's weather and precipitation survive repeated redraws of the map, ordinary and megastructure alike
- [ ] The Star Data table lists one row per star with all six columns drawn from the record behind it
- [ ] All six legend columns sort, one at a time; distance, fuel and AP ascend, type and precipitation are alphabetical
- [ ] Weather sorts by forecast quality then likelihood, and settled stars sink to the bottom whatever the sort
- [ ] Name colour follows a strict precedence, with affordability outranking the O-type and megastructure colours
- [ ] A settled star is dimmed, named in the settled colour and has its planning cells blanked

## Status meaning

🟢 **GREEN** — Done — the map, the search, the drawings and the Star Data table are all driven through their own controls, and the drawings are checked as geometry rather than as presence. The distance spec found known-issues #35, which is now fixed at source: star coordinates come from a fixed nominal field instead of the measured container, so the drawn map and the calculation path agree.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
