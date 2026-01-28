$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$jest = Join-Path $projectRoot 'node_modules\jest\bin\jest.js'

if (-not (Test-Path $jest)) {
  Write-Error "Jest not found at: $jest. Run npm install first."
}

# Force headless mode for Playwright smoke tests
$env:HEADLESS = '1'

# Run all tests under tests
$tests = @(
  #'tests/launchAndOnboard.test.js',
  #'tests/launch-app.test.js',
  #'tests/earlyLoop.test.js',
  'tests/autobuyer.test.js'
  #'tests/researchTech.test.js',
  #'tests/energyMid.test.js',
  #'tests/spaceAntimatter.test.js'
)

$expectedFailures = @(
)

$anyUnexpectedFailed = $false

$suiteResults = @()

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

  $jestJsonFile = Join-Path $reportDir 'jest-results.json'

  Write-Host "\n=== Running: $testFile ===\n"
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  & node --experimental-vm-modules $jest $testFile --json --outputFile $jestJsonFile @args
  $sw.Stop()
  $exitCode = $LASTEXITCODE

  $status = 'unknown'
  $passedCount = 0
  $failedCount = 0
  $skippedCount = 0

  if (Test-Path $jestJsonFile) {
    try {
      $jestPayload = Get-Content -Raw -Path $jestJsonFile | ConvertFrom-Json
      $passedCount = [int]($jestPayload.numPassedTests)
      $failedCount = [int]($jestPayload.numFailedTests)
      $skippedCount = [int]($jestPayload.numPendingTests) + [int]($jestPayload.numTodoTests)

      if ($failedCount -gt 0 -or [int]($jestPayload.numFailedTestSuites) -gt 0) {
        $status = 'failed'
      } elseif ($passedCount -eq 0 -and $skippedCount -gt 0) {
        $status = 'skipped'
      } else {
        $status = 'passed'
      }
    } catch {
      if ($exitCode -eq 0) { $status = 'passed' } else { $status = 'failed' }
    }
  } else {
    if ($exitCode -eq 0) { $status = 'passed' } else { $status = 'failed' }
  }

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

  $suiteResults += [PSCustomObject]@{
    TestFile = $testFile
    TestName = $testName
    Status = $status
    DurationMs = [int]$sw.ElapsedMilliseconds
    Passed = $passedCount
    Failed = $failedCount
    Skipped = $skippedCount
    ReportDir = $reportDir
  }
}

$suiteReportDir = Join-Path $projectRoot 'html-report'
$suiteReportFile = Join-Path $suiteReportDir 'suite-summary.html'
$suiteReportJsonFile = Join-Path $suiteReportDir 'suite-summary.json'

New-Item -ItemType Directory -Force -Path $suiteReportDir | Out-Null

$passedTotal = @($suiteResults | Where-Object { $_.Status -eq 'passed' }).Count
$failedTotal = @($suiteResults | Where-Object { $_.Status -eq 'failed' }).Count
$skippedTotal = @($suiteResults | Where-Object { $_.Status -eq 'skipped' }).Count
$suiteTotal = [Math]::Max(1, $suiteResults.Count)

$suiteSummaryPayload = [PSCustomObject]@{
  generatedAt = (Get-Date).ToString('o')
  totals = [PSCustomObject]@{
    passed = $passedTotal
    failed = $failedTotal
    skipped = $skippedTotal
    total = $suiteResults.Count
  }
  tests = $suiteResults
}

$suiteSummaryPayload | ConvertTo-Json -Depth 10 | Set-Content -Path $suiteReportJsonFile -Encoding UTF8

$piePassed = [Math]::Round(($passedTotal / $suiteTotal) * 360)
$pieFailed = [Math]::Round(($failedTotal / $suiteTotal) * 360)

$suiteHtml = @"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>CosmicForge Smoke Suite Summary</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 16px; }
    h1 { margin: 0 0 12px 0; font-size: 20px; }
    .meta { color: #555; margin-bottom: 16px; font-size: 13px; }
    .grid { display: grid; grid-template-columns: 160px 1fr; gap: 16px; align-items: center; margin-bottom: 16px; }
    .pie { width: 140px; height: 140px; border-radius: 999px; background: conic-gradient(#22c55e 0deg $($piePassed)deg, #ef4444 $($piePassed)deg $($piePassed + $pieFailed)deg, #f59e0b $($piePassed + $pieFailed)deg 360deg); border: 1px solid #e5e7eb; }
    .legend { font-size: 13px; }
    .legend div { margin: 4px 0; display: flex; align-items: center; gap: 8px; }
    .swatch { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid #eee; font-size: 13px; }
    th { font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: #444; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; }
    .passed { background: #dcfce7; color: #166534; }
    .failed { background: #fee2e2; color: #991b1b; }
    .skipped { background: #ffedd5; color: #9a3412; }
    .unknown { background: #e5e7eb; color: #111827; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; }
  </style>
</head>
<body>
  <h1>CosmicForge Smoke Suite Summary</h1>
  <div class="meta">Generated at ${((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))}</div>

  <div class="grid">
    <div class="pie" aria-label="Passed vs Failed vs Skipped"></div>
    <div class="legend">
      <div><span class="swatch" style="background:#22c55e"></span> Passed: ${passedTotal}</div>
      <div><span class="swatch" style="background:#ef4444"></span> Failed: ${failedTotal}</div>
      <div><span class="swatch" style="background:#f59e0b"></span> Skipped: ${skippedTotal}</div>
      <div style="margin-top:8px;color:#555">Total: ${($suiteResults.Count)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Test</th>
        <th>Status</th>
        <th>Duration</th>
      </tr>
    </thead>
    <tbody>
"@

foreach ($r in $suiteResults) {
  $dur = [TimeSpan]::FromMilliseconds([int]$r.DurationMs)
  $durText = "{0:mm\:ss\.fff}" -f $dur
  $badgeClass = $r.Status
  if ($badgeClass -ne 'passed' -and $badgeClass -ne 'failed' -and $badgeClass -ne 'skipped') {
    $badgeClass = 'unknown'
  }

  $suiteHtml += "<tr><td class='mono'>$($r.TestName)</td><td><span class='badge $badgeClass'>$($r.Status)</span></td><td class='mono'>$durText</td></tr>`n"
}

$suiteHtml += @"
    </tbody>
  </table>
</body>
</html>
"@

$suiteHtml | Set-Content -Path $suiteReportFile -Encoding UTF8

if (Test-Path $suiteReportFile) {
  Start-Process $suiteReportFile
}

if ($anyUnexpectedFailed) {
  exit 1
}

exit 0
