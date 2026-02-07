import { spawn } from 'node:child_process';

function run(command, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
      windowsHide: false,
      ...opts,
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

async function buildChain(label, steps) {
  for (const step of steps) {
    // Keep it verbose in terminal output without adding comments to repo files.
    process.stdout.write(`\n=== ${label}: ${step.join(' ')} ===\n`);
    await run(step[0], step.slice(1));
  }
}

const winSteps = [
  ['bun', 'run', 'build:win:demo'],
  ['bun', 'run', 'build:win:full'],
];

const linuxSteps = [
  ['bun', 'run', 'build:linux:demo'],
  ['bun', 'run', 'build:linux:full'],
];

try {
  await Promise.all([
    buildChain('WIN', winSteps),
    buildChain('LINUX', linuxSteps),
  ]);
  process.stdout.write('\nAll builds completed successfully.\n');
} catch (err) {
  console.error('\nBuild-all failed:', err?.message || err);
  process.exit(1);
}
