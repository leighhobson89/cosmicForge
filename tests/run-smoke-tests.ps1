$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$jest = Join-Path $projectRoot 'node_modules\jest\bin\jest.js'

if (-not (Test-Path $jest)) {
  Write-Error "Jest not found at: $jest. Run npm install first."
}

# Run all tests under tests/smoke
$tests = @(
  'tests/smoke/launchAndOnboard.test.js',
  'tests/smoke/launch-app.test.js',
  'tests/smoke/cloudSave_earlyLoop.test.js',
  'tests/smoke/cloudSave_autobuyer.test.js',
  'tests/smoke/cloudSave_researchTech.test.js',
  'tests/smoke/cloudSave_energyMid.test.js',
  'tests/smoke/cloudSave_spaceAntimatter.test.js'
)

$anyFailed = $false

foreach ($testFile in $tests) {
  $testName = [System.IO.Path]::GetFileNameWithoutExtension($testFile)
  $reportDir = Join-Path $projectRoot (Join-Path 'html-report' $testName)
  New-Item -ItemType Directory -Force -Path $reportDir | Out-Null

  $env:JEST_HTML_REPORT_PATH = $reportDir
  $env:JEST_HTML_REPORT_FILENAME = 'report.html'
  $env:JEST_HTML_REPORT_TITLE = "CosmicForge Smoke Report - $testName"

  Write-Host "\n=== Running: $testFile ===\n"
  & node --experimental-vm-modules $jest $testFile @args
  $exitCode = $LASTEXITCODE

  $reportFile = Join-Path $reportDir 'report.html'
  if (Test-Path $reportFile) {
    Start-Process $reportFile
  }

  if ($exitCode -ne 0) {
    $anyFailed = $true
  }
}

if ($anyFailed) {
  exit 1
}

exit 0
