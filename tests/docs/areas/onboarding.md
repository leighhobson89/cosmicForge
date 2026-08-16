# Onboarding & Tutorial

| | |
|---|---|
| **Status** | 🟠 AMBER |
| **Risk if broken** | High |
| **Group** | Presentation & Shell |
| **Spec folder** | `tests/e2e/onboarding/` |
| **Existing coverage** | `tests/legacy/launchAndOnboard.test.js` |

The guided first-run tutorial. Every new player's first experience, and largely still hardcoded English.

## What should be tested

- [ ] The full tutorial runs start to finish without a dead end
- [ ] Each step's condition correctly gates progression
- [ ] Callouts and overlays anchor to the right elements
- [ ] Leaving the required tab prompts a return and recovers correctly
- [ ] Onboarding can be exited early and the game remains playable
- [ ] Completion sets the flag and never re-triggers
- [ ] All tutorial text is localized in all five languages

## Status meaning

🟠 **AMBER** — Partial coverage — a smoke test proves the path exists, but branches, failure modes and edge cases are unverified.

---

_Generated from `tests/docs/functional-areas.json`. Edit that file and re-run `node tests/docs/generate-report.cjs`._
