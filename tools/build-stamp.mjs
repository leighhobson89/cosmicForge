import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

function usage() {
  console.error('Usage: node tools/build-stamp.mjs <win|linux> <demo|full>');
  process.exit(1);
}

const platform = process.argv[2];
const flavor = process.argv[3];

if (!platform || !flavor) usage();
if (!['win', 'linux'].includes(platform)) usage();
if (!['demo', 'full'].includes(flavor)) usage();

const isDemo = flavor === 'demo';
const suffix = isDemo ? 'Demo' : 'Full';

const repoRootPackageJsonPath = new URL('../package.json', import.meta.url);
const buildFlagsPath = new URL('../buildFlags.js', import.meta.url);

const originalPackageJsonRaw = fs.readFileSync(repoRootPackageJsonPath, 'utf8');
let packageJson;
try {
  packageJson = JSON.parse(originalPackageJsonRaw);
} catch (err) {
  console.error('Failed to parse package.json');
  throw err;
}

function readSpaceRipEnabledFlag() {
  try {
    const existing = fs.readFileSync(buildFlagsPath, 'utf8');
    const match = existing.match(/window\.__SPACE_RIP_ENABLED__\s*=\s*(true|false)\s*;/);
    if (match && match[1]) {
      return match[1] === 'true';
    }
  } catch {
  }
  return false;
}

function writePackageJson(obj) {
  fs.writeFileSync(repoRootPackageJsonPath, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

try {
  const spaceRipEnabled = readSpaceRipEnabledFlag();
  fs.writeFileSync(
    buildFlagsPath,
    `window.__DEMO_BUILD__ = ${isDemo ? 'true' : 'false'};\n\nwindow.__SPACE_RIP_ENABLED__ = ${spaceRipEnabled ? 'true' : 'false'};\n`,
    'utf8'
  );

  packageJson.build = packageJson.build || {};

  // Windows portable target name
  packageJson.build.portable = packageJson.build.portable || {};
  packageJson.build.portable.artifactName = `Cosmic Forge ${suffix}.exe`;

  // Linux zip target name
  packageJson.build.linux = packageJson.build.linux || {};
  packageJson.build.linux.artifactName = `Cosmic Forge ${suffix}.${'${ext}'}`;

  writePackageJson(packageJson);

  const scriptName = platform === 'win' ? 'build:win' : 'build:linux';
  const result = spawnSync('bun', ['run', scriptName], {
    stdio: 'inherit',
    shell: false,
    windowsHide: false,
  });

  process.exit(result.status ?? 1);
} finally {
  fs.writeFileSync(repoRootPackageJsonPath, originalPackageJsonRaw, 'utf8');
}
