# Demo Build Lockdowns

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Presentation & Shell |
| **Spec folder** | `tests/e2e/demo-build/` |
| **Existing coverage** | _none_ |

Feature gating for the demo variant. A leak here gives away the full game.

## What should be tested

- [ ] Demo build blocks the galactic market and interstellar sidebar
- [ ] Demo build disables autosave and cloud save
- [ ] Demo tooltips explain each lockdown
- [ ] Debugger and cheats are unreachable in a demo build
- [ ] A full build has none of the lockdowns applied
- [ ] build-stamp.mjs produces the flags each variant expects (guards the current build-script bypass)

## Status meaning

🟢 **GREEN** — Comprehensive coverage — happy path, branches, boundaries and failure modes all asserted.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
