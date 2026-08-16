# Test Documentation

Analysis and planning for the Cosmic Forge test suite. **No specs have been written yet** — this
is the structure and the plan they will be written into.

## Start here

- **[coverage-report.md](coverage-report.md)** — every functional area, its traffic-light status,
  risk rating and existing coverage. This is the report to read first.
- **[areas/](areas/)** — one detailed test plan per functional area, with a checklist of what
  should be tested.

## How this is maintained

Everything in `areas/` and `coverage-report.md` is **generated**. The source of truth is a single
file:

```
tests/docs/functional-areas.json
```

To change an area's status, risk, summary or test list, edit that file and regenerate:

```bash
node tests/docs/generate-report.cjs
```

The generator creates any missing `tests/e2e/<area>/` folders and rewrites the markdown. It never
touches spec files you have written.

Keeping the traffic lights in a data file rather than hand-maintained prose is deliberate: the
status of 43 areas will change continuously as specs land, and a hand-edited table goes stale
within a week.

## Folder layout

```
tests/
  docs/                     this folder — planning and reporting only
    functional-areas.json     source of truth, edit this
    generate-report.cjs       regenerates the reports and folders
    coverage-report.md        generated summary
    areas/<area>.md           generated per-area test plan
  e2e/<area>/               spec folder per functional area (43 of them)
  legacy/                   pre-existing smoke tests — retained, still running
  setup.js                  jest setup, referenced by jest.config.js
```

## Conventions for specs

- One folder per functional area, named exactly as in `functional-areas.json`.
- Spec files named `<scenario>.spec.js` — several small specs per area beats one large one, so a
  failure names the behaviour that broke.
- Fixtures (cloud-loaded saves at a known progression point) are the established pattern in
  `tests/legacy/cloudLoadUtils.js`. Reuse that approach rather than driving the game from zero.
- Assert on **behaviour and values**, not on DOM structure, wherever a value is available. The
  legacy tests get this right: they sample production rates over an interval and assert within a
  tolerance rather than pinning exact numbers.

## About the legacy tests

The eight suites in `tests/legacy/` still run and still pass through the same jest config — they
were moved, not disabled. They are classified as **amber** coverage for the areas they touch,
because they prove a path exists without asserting much about branches, boundaries or failure
modes.

They should be treated as a source of technique rather than a coverage baseline. Once an area has
real specs under `tests/e2e/`, the corresponding legacy suite can be retired.

## Status definitions

| | Meaning |
|:--:|---|
| 🔴 RED | No automated coverage. A regression here ships unnoticed. |
| 🟠 AMBER | Partial — a smoke test proves the path exists, but branches, failure modes and edge cases are unverified. |
| 🟢 GREEN | Comprehensive — happy path, branches, boundaries and failure modes all asserted. |
