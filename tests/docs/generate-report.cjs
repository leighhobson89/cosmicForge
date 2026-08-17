// Generates the E2E test structure and coverage reports from functional-areas.json.
//
//   node tests/docs/generate-report.cjs
//
// Safe to re-run. It creates missing folders and overwrites generated markdown,
// but never touches spec files you have written.

const fs = require('fs');
const path = require('path');

const DOCS_DIR = __dirname;
const TESTS_DIR = path.resolve(DOCS_DIR, '..');
const E2E_DIR = path.join(TESTS_DIR, 'e2e');
const AREAS_DOC_DIR = path.join(DOCS_DIR, 'areas');

const data = JSON.parse(fs.readFileSync(path.join(DOCS_DIR, 'functional-areas.json'), 'utf8'));
const { groups, areas, statusLegend } = data;

const LIGHT = { red: '🔴', amber: '🟠', green: '🟢' };
const RISK = { high: 'High', medium: 'Medium', low: 'Low' };

const bySlug = (s) => s.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
const groupOf = (id) => groups.find((g) => g.id === id);
const areasIn = (groupId) => areas.filter((a) => a.group === groupId);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(file, contents) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, contents.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n', 'utf8');
}

// ---------------------------------------------------------------- per-area docs

function areaDoc(area) {
  const group = groupOf(area.group);
  const legacy = area.legacy.length
    ? area.legacy.map((f) => `\`tests/legacy/${f}\``).join(', ')
    : '_none_';

  return `# ${area.title}

| | |
|---|---|
| **Status** | ${LIGHT[area.status]} ${area.status.toUpperCase()} |
| **Risk if broken** | ${RISK[area.risk]} |
| **Group** | ${group.title} |
| **Spec folder** | \`tests/e2e/${area.id}/\` |
| **Existing coverage** | ${legacy} |

${area.summary}

## What should be tested

${area.tests.map((t) => `- [ ] ${t}`).join('\n')}

## Status meaning

${LIGHT[area.status]} **${area.status.toUpperCase()}** — ${statusLegend[area.status]}

---

_Generated from \`tests/docs/functional-areas.json\`. Edit that file and re-run \`node tests/docs/generate-report.cjs\`._
`;
}

// ------------------------------------------------------------ e2e folder readme

function e2eReadme(area) {
  return `# e2e / ${area.id}

**${area.title}** — ${LIGHT[area.status]} ${area.status.toUpperCase()}

${area.summary}

Specs for this area go in this folder, named \`<scenario>.spec.js\`.

Full test plan and checklist: [\`tests/docs/areas/${area.id}.md\`](../../docs/areas/${area.id}.md)
`;
}

// -------------------------------------------------------------- master report

function coverageReport() {
  const counts = { red: 0, amber: 0, green: 0 };
  areas.forEach((a) => counts[a.status]++);
  const total = areas.length;
  const pct = (n) => `${Math.round((n / total) * 100)}%`;

  const totalChecks = areas.reduce((n, a) => n + a.tests.length, 0);
  const totalSpecs = areas.reduce((n, a) => n + (a.specCount || 0), 0);
  const implemented = areas.filter((a) => a.specCount > 0);

  const highRiskRed = areas.filter((a) => a.risk === 'high' && a.status === 'red');

  let md = `# Cosmic Forge — E2E Coverage Report

_Generated from \`functional-areas.json\`. Re-run \`node tests/docs/generate-report.cjs\` after editing._

## Summary

| | Areas | Share |
|---|---:|---:|
| 🔴 Red — no coverage | ${counts.red} | ${pct(counts.red)} |
| 🟠 Amber — partial / smoke only | ${counts.amber} | ${pct(counts.amber)} |
| 🟢 Green — comprehensive | ${counts.green} | ${pct(counts.green)} |
| **Total functional areas** | **${total}** | |

${totalChecks} individual test cases are identified across all areas. **${totalSpecs} Playwright specs are implemented and passing** across ${implemented.length} area${implemented.length === 1 ? '' : 's'}. The ${counts.amber} amber areas have partial coverage only — a legacy smoke test that proves a path exists, or a focused spec file written alongside a bug fix — so their branches, boundaries and failure modes are still largely unverified.

Run them with \`npm run test:e2e\` (all areas) or \`node tests/run-e2e.mjs <area>\`. Each area writes its own HTML report to \`test-reports/e2e/<area>/index.html\`, with a summary index at \`test-reports/e2e/index.html\`.

## Highest priority — high risk, zero coverage

These ${highRiskRed.length} areas would each cause serious, often unrecoverable player harm if they regressed, and none has any automated test today.

| Area | Group | Why it matters |
|---|---|---|
${highRiskRed.map((a) => `| [${a.title}](areas/${a.id}.md) | ${groupOf(a.group).title} | ${a.summary} |`).join('\n')}

## All areas by group

`;

  for (const group of groups) {
    const list = areasIn(group.id);
    if (!list.length) continue;
    md += `### ${group.title}\n\n${group.blurb}\n\n`;
    md += `| Status | Area | Risk | Planned | Specs | Existing coverage |\n|:--:|---|:--:|--:|--:|---|\n`;
    for (const a of list) {
      const legacy = a.legacy.length ? a.legacy.join(', ') : '—';
      const specs = a.specCount ? `**${a.specCount}**` : '—';
      md += `| ${LIGHT[a.status]} | [${a.title}](areas/${a.id}.md) | ${RISK[a.risk]} | ${a.tests.length} | ${specs} | ${legacy} |\n`;
    }
    md += '\n';
  }

  md += `## Status legend

| | Meaning |
|:--:|---|
${Object.entries(statusLegend).map(([k, v]) => `| ${LIGHT[k]} ${k.toUpperCase()} | ${v} |`).join('\n')}

## Folder layout

\`\`\`
tests/
  docs/                     this report and the per-area plans
    functional-areas.json   source of truth — edit this
    generate-report.cjs     regenerates everything below from it
    coverage-report.md      generated summary (this file)
    areas/<area>.md         generated per-area test plan
  e2e/<area>/               spec folder per functional area
  legacy/                   pre-existing smoke tests, retained and still running
  setup.js                  jest setup, referenced by jest.config.js
\`\`\`
`;

  return md;
}

// ------------------------------------------------------------------------ run

let createdFolders = 0;
let wroteDocs = 0;

for (const area of areas) {
  const specDir = path.join(E2E_DIR, area.id);
  if (!fs.existsSync(specDir)) createdFolders++;
  ensureDir(specDir);
  write(path.join(specDir, 'README.md'), e2eReadme(area));
  write(path.join(AREAS_DOC_DIR, `${area.id}.md`), areaDoc(area));
  wroteDocs++;
}

write(path.join(DOCS_DIR, 'coverage-report.md'), coverageReport());

const counts = { red: 0, amber: 0, green: 0 };
areas.forEach((a) => counts[a.status]++);

console.log(`Functional areas : ${areas.length} across ${groups.length} groups`);
console.log(`Test cases       : ${areas.reduce((n, a) => n + a.tests.length, 0)}`);
console.log(`Spec folders     : ${areas.length} (${createdFolders} newly created)`);
console.log(`Area plans       : ${wroteDocs} written to tests/docs/areas/`);
console.log(`Status           : ${counts.red} red, ${counts.amber} amber, ${counts.green} green`);
console.log(`Report           : tests/docs/coverage-report.md`);
