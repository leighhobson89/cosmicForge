// Live progress reporter for the Cosmic Forge E2E suite.
//
// Replaces Playwright's built-in `list` reporter, which prints a result line per
// test but never says how many there are, so a long run gives no sense of how
// far through it is. This prints the functional area, a running index against the
// area's total, and the outcome as each test settles:
//
//   ── resources ─ 21 tests ──────────────────────────────────────
//     [resources]   1/21  ▶  the Increase Storage button multiplies the cap …
//     [resources]   1/21  ✓  the Increase Storage button multiplies the cap …   2.1s
//     [resources]   2/21  ✕  a second increase costs the new, larger cap        1.8s
//
// Output is flushed per line, so it appears while the run is in progress rather
// than at the end.
//
// The index is assigned in *start* order. With more than one worker several
// tests are in flight at once, so `▶` lines and `✓`/`✕` lines interleave — that
// is what "currently running" looks like in a parallel run, and the index on
// each line ties a result back to the start line it belongs to.

import path from 'node:path';

// The escape byte, built rather than typed so no invisible control character
// ends up in this source file.
const ESC = String.fromCharCode(27);
const COLOURS = {
  reset: `${ESC}[0m`,
  dim: `${ESC}[2m`,
  bold: `${ESC}[1m`,
  green: `${ESC}[32m`,
  red: `${ESC}[31m`,
  yellow: `${ESC}[33m`,
  grey: `${ESC}[90m`,
  cyan: `${ESC}[36m`
};

/** Colour is only emitted to a real terminal, so piped output stays clean. */
const useColour = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
const paint = (colour, text) => (useColour ? `${COLOURS[colour]}${text}${COLOURS.reset}` : String(text));

/** Longest title we print before eliding, so lines do not wrap on a narrow terminal. */
const MAX_TITLE = 78;

function truncate(text, max = MAX_TITLE) {
  const value = String(text ?? '');
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

/**
 * Which functional area a test belongs to.
 *
 * `E2E_AREA` is set by tests/run-e2e.mjs, which runs one area per invocation.
 * A direct `playwright test` run has no such variable and may span every area,
 * so fall back to the folder under tests/e2e that the spec file lives in.
 */
function areaOf(test) {
  if (process.env.E2E_AREA) return process.env.E2E_AREA;

  const file = test?.location?.file || '';
  const parts = file.split(/[\\/]+/);
  const index = parts.lastIndexOf('e2e');
  return index !== -1 && parts[index + 1] ? parts[index + 1] : path.basename(path.dirname(file)) || 'e2e';
}

export default class ProgressReporter {
  constructor(options = {}) {
    this.quiet = Boolean(options.quiet);
    this.total = 0;
    this.started = 0;
    this.finished = 0;
    this.failures = [];
    this.startedAt = 0;
    this.indexByTest = new Map();
  }

  write(line) {
    process.stdout.write(`${line}\n`);
  }

  onBegin(config, suite) {
    this.total = suite.allTests().length;
    this.startedAt = Date.now();

    const area = process.env.E2E_AREA || 'all areas';
    const workers = config.workers;
    const slow = process.env.E2E_SLOWMO ? ` · slow ${process.env.E2E_SLOWMO}ms/step` : '';
    const heading = `── ${area} ─ ${this.total} test${this.total === 1 ? '' : 's'} · ${workers} worker${workers === 1 ? '' : 's'}${slow} `;

    this.write('');
    this.write(paint('bold', heading.padEnd(72, '─')));
  }

  onTestBegin(test) {
    const index = ++this.started;
    this.indexByTest.set(test.id, index);
    if (this.quiet) return;

    this.write(
      `  ${paint('cyan', `[${areaOf(test)}]`)} ` +
      `${paint('grey', String(index).padStart(3))}/${this.total}  ` +
      `${paint('dim', '▶')}  ${paint('dim', truncate(test.title))}`
    );
  }

  onTestEnd(test, result) {
    this.finished++;
    const index = this.indexByTest.get(test.id) ?? this.finished;
    const seconds = `${(result.duration / 1000).toFixed(1)}s`;

    let mark = paint('green', '✓');
    if (result.status === 'skipped') {
      mark = paint('yellow', '○');
    } else if (result.status !== 'expected' && result.status !== test.expectedStatus) {
      mark = paint('red', '✕');
      this.failures.push({ area: areaOf(test), index, title: test.title, result });
    } else if (result.retry > 0) {
      mark = paint('yellow', '✓');
    }

    // Two numbers, because they answer different questions: `index/total` ties
    // this line back to the ▶ line it belongs to, and `done` is how far through
    // the area the run actually is — which is not the same thing once several
    // workers are in flight.
    this.write(
      `  ${paint('cyan', `[${areaOf(test)}]`)} ` +
      `${String(index).padStart(3)}/${this.total}  ` +
      `${mark}  ${truncate(test.title)}  ${paint('grey', seconds)}` +
      `  ${paint('grey', `· ${this.finished}/${this.total} done`)}`
    );
  }

  // Playwright routes anything a test writes to the reporter rather than to the
  // terminal, so without these a `console.log` inside a spec vanishes. The
  // built-in `list` reporter forwards them; this one has to as well, or
  // debugging a spec by printing stops working.
  onStdOut(chunk) {
    process.stdout.write(chunk);
  }

  onStdErr(chunk) {
    process.stderr.write(chunk);
  }

  onError(error) {
    this.write(paint('red', `  [error] ${error.message || error}`));
  }

  onEnd(result) {
    const elapsed = ((Date.now() - this.startedAt) / 1000).toFixed(1);
    const passed = this.finished - this.failures.length;

    if (this.failures.length) {
      this.write('');
      this.write(paint('red', `  ${this.failures.length} failed:`));
      for (const failure of this.failures) {
        this.write(paint('red', `    ${failure.index}/${this.total}  ${failure.title}`));
        // The whole message, not just its first line: this is where a failing
        // run is actually diagnosed, and truncating the diff makes the reporter
        // worse than the built-in `list` it replaces. Traces, screenshots and
        // video are still in the area's HTML report.
        const errors = failure.result.errors?.length ? failure.result.errors : [failure.result.error];
        for (const error of errors) {
          const message = error?.message || error?.value;
          if (!message) continue;
          for (const line of String(message).split('\n')) {
            this.write(paint('grey', `        ${line}`));
          }
        }
      }
    }

    const summary = `  ${passed}/${this.total} passed in ${elapsed}s`;
    this.write('');
    this.write(this.failures.length ? paint('red', summary) : paint('green', summary));
    this.write('');

    return { status: result.status };
  }
}
