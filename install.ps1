# Native Windows source bootstrap. Requires Git, Node >=22 and pnpm 9.
param([string]$Source = "$env:LOCALAPPDATA\engram-dev")
$ErrorActionPreference = "Stop"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Install Node 22+ first" }
if (-not (Test-Path "$Source\.git")) {
  git clone https://github.com/phanijapps/engram-dev "$Source"
  if ($LASTEXITCODE -ne 0) { throw "Git clone failed" }
}
Push-Location "$Source\treadle"
try {
  pnpm install --frozen-lockfile
  if ($LASTEXITCODE -ne 0) { throw "Dependency installation failed" }
  pnpm build
  if ($LASTEXITCODE -ne 0) { throw "Build failed" }
  Push-Location packages\cli
  try { pnpm link --global; if ($LASTEXITCODE -ne 0) { throw "Global link failed" } }
  finally { Pop-Location }
} finally { Pop-Location }
Write-Host "Installed. Run: treadle init harness"
