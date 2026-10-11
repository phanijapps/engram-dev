# Native Windows source bootstrap. Requires Git, Node >=22 and pnpm 9.
# powershell -NoProfile -Command "irm https://raw.githubusercontent.com/phanijapps/wukong/codex/background-harness/install.ps1 | iex"
param([string]$Source = "$env:LOCALAPPDATA\engram-dev",
      [string]$Repository = "https://github.com/phanijapps/wukong.git",
      [string]$Ref = "codex/background-harness")
$ErrorActionPreference = "Stop"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Install Node 22+ first" }
$NodeMajor = node -p "Number(process.versions.node.split('.')[0])"
if ($LASTEXITCODE -ne 0 -or $NodeMajor -notmatch '^\d+$') { throw "Could not determine the Node version" }
if ([int]$NodeMajor -lt 22) { throw "Install Node 22+ first" }
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw "Install Git first" }
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) { throw "Install pnpm 9.15.9 first" }
if (Test-Path "$Source\.git") {
  $CurrentRef = git -C "$Source" symbolic-ref --quiet --short HEAD
  if ($LASTEXITCODE -ne 0 -or $CurrentRef -cne $Ref) {
    throw "Source checkout is not on $Ref. Use -Source for a new directory; existing files were left unchanged."
  }
  git -C "$Source" pull --ff-only origin "$Ref"
  if ($LASTEXITCODE -ne 0) { throw "Source update failed" }
} else {
  git clone --branch "$Ref" --single-branch "$Repository" "$Source"
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
node "$Source\treadle\packages\cli\dist\src\main.js" --version
if ($LASTEXITCODE -ne 0) { throw "CLI verification failed" }
wukong --version
if ($LASTEXITCODE -ne 0) { throw "Global command verification failed" }
Write-Host "Installed. Run: wukong init harness"
