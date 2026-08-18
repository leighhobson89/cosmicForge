# Onboarding & Tutorial

| | |
|---|---|
| **Status** | 🟠 AMBER |
| **Risk if broken** | High |
| **Group** | Presentation & Shell |
| **Spec folder** | `tests/e2e/onboarding/` |
| **Existing coverage** | `tests/legacy/launchAndOnboard.test.js` |

The guided first-run tutorial. Every new player’s first experience, and fully localized.

## What should be tested

- [ ] The prompt is offered on a fresh pioneer, and Yes starts the tutorial while No leaves it off
- [ ] Each step’s condition correctly gates progression
- [ ] Callouts and overlays anchor to the element the step names
- [ ] Leaving the required tab prompts a return and recovers correctly
- [ ] Onboarding can be exited early and the game remains playable
- [ ] Re-enabling the tutorial restarts it from the first step
- [ ] All tutorial text is localized in all five languages, and the tutorial runs end to end in a second language

## Status meaning

🟠 **AMBER** — A spec file exists, but the area has not yet been through the integration upgrade — some of its coverage is still function-level rather than played through the UI.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
