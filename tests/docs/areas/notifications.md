# Notifications

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Medium |
| **Group** | Presentation & Shell |
| **Spec folder** | `tests/e2e/notifications/` |
| **Existing coverage** | _none_ |

The notification stack: one bottom-right column of classification rows, the three multi-card rows that show a whole burst at once, Clear All, and an opaque card in every theme.

## What should be tested

- [ ] Classification rows share one right edge and differ only in height, so nothing spreads across the screen
- [ ] The oldest classification holds the bottom-right corner and later ones stack above it
- [ ] A row that times out lets the rows above it fall back into the corner
- [ ] Past the row cap the extra classifications keep their queue instead of drawing off-screen, and are promoted when a row frees up
- [ ] Only the notification card takes pointer events; the space beside it belongs to the game
- [ ] Three stores filled by real production give three storage cards sharing one row
- [ ] The newest card in a multi-card row sits on the right and the older ones slide left
- [ ] A multi-card row fills to its column cap and queues the rest, and a queued card slides in when one expires
- [ ] A burst of debug cheats fills the debug row rather than queueing behind a timer
- [ ] Achievements unlocked in the same frame are shown side by side
- [ ] Every other classification still shows one card at a time on its queue timer
- [ ] A storage claim taken from the header disables the card that names that store, not whichever card is showing
- [ ] Clear All takes one classification and leaves the others standing, and that classification can raise a notification again afterwards
- [ ] Clearing a row closes the column up, and lets a classification held behind the cap take the slot
- [ ] An earned storage increase survives having its notification cleared
- [ ] No shipped theme draws a see-through notification
- [ ] The success, warning and error types keep their colours

## Status meaning

🟢 **GREEN** — Done — added by P6 of the player-feedback plan when the notification stack was turned from a horizontal spread into one bottom-right column. The geometry is measured off real bounding boxes rather than read back off inline styles, storage cards are produced by running real tier 1 autobuyers into a real cap, and the cheat and achievement rows come from real debug-menu presses. Two live defects fell out of writing it: Clear All emptied a classification's queue instead of deleting it, which silently muted that classification for the rest of the run, and the routine that spends a storage claim only ever looked at the first card in the row.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
