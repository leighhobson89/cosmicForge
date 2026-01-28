$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$jest = Join-Path $projectRoot 'node_modules\jest\bin\jest.js'

if (-not (Test-Path $jest)) {
  Write-Error "Jest not found at: $jest. Run npm install first."
}

# Run all tests under tests/smoke
& node --experimental-vm-modules $jest "tests/smoke" @args
exit $LASTEXITCODE
