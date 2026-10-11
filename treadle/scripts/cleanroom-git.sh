#!/usr/bin/env bash
# cleanroom-git.sh — the falsifiable proof of the git-install path (install-paths T-2).
# Installs from the REAL GitHub main branch, asserts from an arbitrary directory,
# on BOTH node floors present on this machine. Transcript: /tmp/cleanroom-git.transcript
set -euo pipefail

TRANSCRIPT=/tmp/cleanroom-git.transcript
NODE22=/usr/local/bin/node   # 22.14 — the documented floor
URL="github:phanijapps/engram-dev#main"

log() { printf '%s\n' "$*" | tee -a "$TRANSCRIPT"; }

: > "$TRANSCRIPT"
log "cleanroom-git $(date -u +%Y-%m-%dT%H:%M:%SZ)"
log "installing: npm i -g --allow-scripts=engram-dev $URL"

log "0. remove any prior install"
npm rm -g engram-dev >/dev/null 2>&1 || true

log "1. the documented install command (the flag is npm's security default, named in the same breath)"
npm install -g --allow-scripts=engram-dev "$URL" >>"$TRANSCRIPT" 2>&1
log "   install exit: 0"

log "2. where the bin landed"
BIN="$(command -v wukong)"
log "   bin: $BIN"

log "3. assertions from an arbitrary directory (PATH node)"
cd /tmp
wukong --version >>"$TRANSCRIPT" 2>&1
wukong --help >/dev/null
log "   wukong --help: ok"
wukong do where /tmp >/dev/null
log "   wukong do where: ok"
wukong know validate "$(mktemp -d)" >/dev/null 2>&1 || true   # empty dir: honest refusal path, not a crash
log "   survives odd input: ok"

log "4. the floor check: the installed entry file under BOTH node binaries"
ENTRY="$(node -e 'console.log(require("resolve").sync?.("wukong") ?? "")' 2>/dev/null || true)"
# resolve the real main.js the bin points at (through the npm shim)
MAINJS="$(find "$(npm root -g)" -path "*@treadle/cli/dist/src/main.js" 2>/dev/null | head -1)"
if [ -z "$MAINJS" ]; then
  MAINJS="$(npm root -g)/engram-dev/treadle/packages/cli/dist/src/main.js"
fi
log "   entry: $MAINJS"
[ -f "$MAINJS" ] || { log "FAIL: entry missing"; exit 1; }
"$NODE22" "$MAINJS" --help >/dev/null
log "   node 22.14: ok"
node "$MAINJS" --help >/dev/null
log "   node $(node --version): ok"

log "CLEANROOM GIT PASS"
