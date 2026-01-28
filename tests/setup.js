import fs from "node:fs";
import path from "node:path";

// Global setup for Allure reporting
beforeAll(async () => {
  // Add global test metadata
});

beforeEach(() => {
  const testName = (globalThis.expect?.getState?.().currentTestName) || "(unknown test)";
  globalThis.__smokeStepReport = globalThis.__smokeStepReport ?? { startedAt: Date.now(), tests: {} };
  globalThis.__smokeStepReport.tests[testName] = globalThis.__smokeStepReport.tests[testName] ?? {
    name: testName,
    startedAt: Date.now(),
    durationMs: 0,
    status: "running",
    error: null,
    steps: []
  };
});

// Helper to add steps to Allure reports
global.allureStep = (name, fn) => {
  return fn();
};

function safeStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    try {
      return JSON.stringify(String(value));
    } catch {
      return '"[unserializable]"';
    }
  }
}

global.smokeStep = async (name, fn, meta = {}) => {
  const start = Date.now();
  const input = Object.prototype.hasOwnProperty.call(meta, 'input') ? meta.input : undefined;
  const testName = (globalThis.expect?.getState?.().currentTestName) || "(unknown test)";
  globalThis.__smokeStepReport = globalThis.__smokeStepReport ?? { startedAt: Date.now(), tests: {} };
  globalThis.__smokeStepReport.tests[testName] = globalThis.__smokeStepReport.tests[testName] ?? {
    name: testName,
    startedAt: Date.now(),
    durationMs: 0,
    status: "running",
    error: null,
    steps: []
  };

  const stepRecord = {
    name,
    startedAt: start,
    durationMs: 0,
    status: "running",
    input,
    output: null,
    error: null
  };
  globalThis.__smokeStepReport.tests[testName].steps.push(stepRecord);

  console.log(`[SMOKE_STEP_START] ${name} input=${safeStringify(input)}`);

  try {
    const result = await fn();
    const durationMs = Date.now() - start;
    const output = Object.prototype.hasOwnProperty.call(meta, 'output') ? meta.output : result;
    stepRecord.status = "passed";
    stepRecord.durationMs = durationMs;
    stepRecord.output = output;
    console.log(
      `[SMOKE_STEP_END] ${name} durationMs=${durationMs} output=${safeStringify(output)}`
    );
    return result;
  } catch (error) {
    const durationMs = Date.now() - start;
    stepRecord.status = "failed";
    stepRecord.durationMs = durationMs;
    stepRecord.error = { message: error?.message, stack: error?.stack };
    console.log(
      `[SMOKE_STEP_FAIL] ${name} durationMs=${durationMs} error=${safeStringify({ message: error?.message, stack: error?.stack })}`
    );
    throw error;
  }
};

globalThis.smokeTest = (name, fn, timeout) => {
  test(
    name,
    async () => {
      globalThis.__smokeStepReport = globalThis.__smokeStepReport ?? { startedAt: Date.now(), tests: {} };
      const startedAt = Date.now();
      const testName = (globalThis.expect?.getState?.().currentTestName) || name;

      globalThis.__smokeStepReport.tests[testName] = globalThis.__smokeStepReport.tests[testName] ?? {
        name: testName,
        startedAt,
        durationMs: 0,
        status: "running",
        error: null,
        steps: []
      };

      try {
        await fn();
        globalThis.__smokeStepReport.tests[testName].status = "passed";
      } catch (error) {
        globalThis.__smokeStepReport.tests[testName].status = "failed";
        globalThis.__smokeStepReport.tests[testName].error = { message: error?.message, stack: error?.stack };
        throw error;
      } finally {
        globalThis.__smokeStepReport.tests[testName].durationMs = Date.now() - startedAt;
      }
    },
    timeout
  );
};

afterAll(async () => {
  const report = globalThis.__smokeStepReport;
  if (!report) {
    return;
  }

  const reportDir = process.env.SMOKE_STEP_REPORT_PATH ?? process.env.JEST_HTML_REPORT_PATH ?? "./html-report";
  const reportFilename = process.env.SMOKE_STEP_REPORT_FILENAME ?? "steps.html";
  const reportJsonFilename = process.env.SMOKE_STEP_REPORT_JSON_FILENAME ?? "steps.json";
  const title = process.env.SMOKE_STEP_REPORT_TITLE ?? "CosmicForge Smoke Step Report";

  fs.mkdirSync(reportDir, { recursive: true });

  const sortedTests = Object.values(report.tests)
    .sort((a, b) => (a.startedAt ?? 0) - (b.startedAt ?? 0));

  const payload = {
    title,
    startedAt: report.startedAt,
    generatedAt: Date.now(),
    tests: sortedTests
  };

  fs.writeFileSync(path.join(reportDir, reportJsonFilename), JSON.stringify(payload, null, 2));

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title.replaceAll("<", "&lt;")}</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 16px; }
    h1 { margin: 0 0 12px 0; font-size: 20px; }
    .meta { color: #555; margin-bottom: 16px; font-size: 13px; }
    details { border: 1px solid #ddd; border-radius: 8px; padding: 10px; margin-bottom: 10px; }
    summary { cursor: pointer; font-weight: 600; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; margin-left: 8px; }
    .passed { background: #e7f7ec; color: #137333; }
    .failed { background: #fde7e9; color: #b00020; }
    .running { background: #eef2ff; color: #334155; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border-bottom: 1px solid #eee; padding: 8px; vertical-align: top; text-align: left; font-size: 13px; }
    th { color: #333; font-weight: 600; }
    pre { background: #fafafa; border: 1px solid #eee; padding: 8px; border-radius: 6px; overflow: auto; max-height: 240px; }
    .step-name { font-weight: 600; }
  </style>
</head>
<body>
  <h1>${title.replaceAll("<", "&lt;")}</h1>
  <div class="meta">Generated: <span id="generatedAt"></span></div>
  <div id="root"></div>

  <script id="payload" type="application/json">${JSON.stringify(payload).replaceAll("<", "\\u003c")}</script>
  <script>
    const payload = JSON.parse(document.getElementById('payload').textContent);
    document.getElementById('generatedAt').textContent = new Date(payload.generatedAt).toLocaleString();

    const root = document.getElementById('root');

    const formatMs = (ms) => (typeof ms === 'number' ? (ms + ' ms') : '');
    const safe = (v) => (v == null ? '' : String(v));
    const pretty = (v) => {
      try { return JSON.stringify(v, null, 2); } catch { return safe(v); }
    };

    for (const t of payload.tests) {
      const details = document.createElement('details');
      details.open = true;

      const summary = document.createElement('summary');
      const badge = document.createElement('span');
      badge.className = 'badge ' + t.status;
      badge.textContent = t.status;
      summary.textContent = t.name + ' (' + formatMs(t.durationMs) + ')';
      summary.appendChild(badge);
      details.appendChild(summary);

      if (t.error) {
        const pre = document.createElement('pre');
        pre.textContent = pretty(t.error);
        details.appendChild(pre);
      }

      const table = document.createElement('table');
      table.innerHTML =
        '<thead>' +
        '  <tr>' +
        '    <th style="width: 24%">Step</th>' +
        '    <th style="width: 10%">Status</th>' +
        '    <th style="width: 10%">Time</th>' +
        '    <th style="width: 28%">Input</th>' +
        '    <th style="width: 28%">Output / Error</th>' +
        '  </tr>' +
        '</thead>' +
        '<tbody></tbody>';
      const tbody = table.querySelector('tbody');

      for (const s of (t.steps || [])) {
        const tr = document.createElement('tr');

        const tdName = document.createElement('td');
        tdName.className = 'step-name';
        tdName.textContent = s.name;

        const tdStatus = document.createElement('td');
        tdStatus.innerHTML = '<span class="badge ' + s.status + '">' + s.status + '</span>';

        const tdTime = document.createElement('td');
        tdTime.textContent = formatMs(s.durationMs);

        const tdInput = document.createElement('td');
        const preIn = document.createElement('pre');
        preIn.textContent = pretty(s.input);
        tdInput.appendChild(preIn);

        const tdOut = document.createElement('td');
        const preOut = document.createElement('pre');
        preOut.textContent = pretty(s.status === 'failed' ? s.error : s.output);
        tdOut.appendChild(preOut);

        tr.appendChild(tdName);
        tr.appendChild(tdStatus);
        tr.appendChild(tdTime);
        tr.appendChild(tdInput);
        tr.appendChild(tdOut);
        tbody.appendChild(tr);
      }

      details.appendChild(table);
      root.appendChild(details);
    }
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(reportDir, reportFilename), html);
});
