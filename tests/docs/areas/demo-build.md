# Demo Build Lockdowns

| | |
|---|---|
| **Status** | 🟢 GREEN |
| **Risk if broken** | High |
| **Group** | Presentation & Shell |
| **Spec folder** | `tests/e2e/demo-build/` |
| **Existing coverage** | _none_ |

Feature gating for the demo variant. A leak here gives away the full game. Driven by booting a spoofed Electron demo, because nearly every lockdown is baked in at draw time and cannot be reached by toggling the flag on a running page.

## What should be tested

- [ ] Demo build blocks the galactic market and interstellar sidebar
- [ ] Demo build disables autosave, cloud save and the save export, and never contacts the cloud at boot
- [ ] Demo tooltips explain each lockdown, in the player's language, on a real hover
- [ ] Debugger and cheats are unreachable in a demo build, except through the Test1981 backdoor
- [ ] Every gated purchase is locked — batteries, the two better power plants, the science lab, orbital construction, rockets 2-4, Study Stars, autobuyer tiers 3 and 4
- [ ] The rows the demo has to leave playable stay playable — the basic power plant, the science kit, rocket 1, autobuyer tiers 1 and 2
- [ ] The lock is enforced by the stylesheet's pointer-events rule, not merely coloured by it
- [ ] A full build has none of the lockdowns applied
- [ ] build-stamp.mjs produces the flags each variant expects, and always forces the debugger off

## Status meaning

🟢 **GREEN** — Signed off as done: the area is driven through its real controls, its rules are asserted by measurement rather than by field reads, and the whole suite passes.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
