$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$jest = Join-Path $projectRoot 'node_modules\jest\bin\jest.js'

if (-not (Test-Path $jest)) {
  Write-Error "Jest not found at: $jest. Run npm install first."
}

# Force headless mode for Playwright smoke tests
$env:HEADLESS = '1'

# Run all tests under tests/smoke
$tests = @(
  'tests/smoke/launchAndOnboard.test.js',
  'tests/smoke/launch-app.test.js',
  'tests/smoke/earlyLoop.test.js',
  'tests/smoke/autobuyer.test.js',
  'tests/smoke/researchTech.test.js'
  'tests/smoke/energyMid.test.js',
  'tests/smoke/spaceAntimatter.test.js'
)

$expectedFailures = @(
)

$anyUnexpectedFailed = $false

foreach ($testFile in $tests) {
  $testName = [System.IO.Path]::GetFileNameWithoutExtension($testFile)
  $reportDir = Join-Path $projectRoot (Join-Path 'html-report' $testName)
  New-Item -ItemType Directory -Force -Path $reportDir | Out-Null

  $env:JEST_HTML_REPORT_PATH = $reportDir
  $env:JEST_HTML_REPORT_FILENAME = 'report.html'
  $env:JEST_HTML_REPORT_TITLE = "CosmicForge Smoke Report - $testName"
  $env:SMOKE_STEP_REPORT_PATH = $reportDir
  $env:SMOKE_STEP_REPORT_FILENAME = 'steps.html'
  $env:SMOKE_STEP_REPORT_TITLE = "CosmicForge Smoke Step Report - $testName"

  Write-Host "\n=== Running: $testFile ===\n"
  & node --experimental-vm-modules $jest $testFile @args
  $exitCode = $LASTEXITCODE

  $stepsReportFile = Join-Path $reportDir 'steps.html'
  if (Test-Path $stepsReportFile) {
    Start-Process $stepsReportFile
  }

  if ($exitCode -ne 0) {
    if ($expectedFailures -contains $testFile) {
      Write-Host "Expected failure: $testFile" -ForegroundColor Yellow
    } else {
      $anyUnexpectedFailed = $true
    }
  }
}

if ($anyUnexpectedFailed) {
  exit 1
}

exit 0
