# Cosmic Rip

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | Medium |
| **Group** | Endgame |
| **Spec folder** | `tests/e2e/cosmic-rip/` |
| **Existing coverage** | _none_ |

Sector scanning, the near-space scanner array and the galactic point economy.

## What should be tested

- [ ] Cosmic rip location seeds deterministically and only once
- [ ] Scanner array restoration costs the correct GP and enables scanning
- [ ] Each sector scan resolves and reveals or eliminates the rip
- [ ] Galactic points derive correctly from settled stars minus spent
- [ ] GP cannot go negative
- [ ] The __COSMIC_RIP_ENABLED__ build flag correctly hides the whole feature
- [ ] Cosmic rip tech tree monitors independently of the main tree

## Status meaning

🟢 **GREEN** — Comprehensive coverage — happy path, branches, boundaries and failure modes all asserted.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
