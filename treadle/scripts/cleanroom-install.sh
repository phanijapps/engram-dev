#!/usr/bin/env bash
# cleanroom-install.sh — the falsifiable proof of the remote install path
# (install-paths T-2): runs install.sh's exact mechanism against a CLEAN
# source dir and isolated PATH, asserts from an arbitrary directory on
# both node floors. Transcript: /tmp/cleanroom-install.transcript
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TRANSCRIPT=/tmp/cleanroom-install.transcript
log() { printf '%s\n' "$*" | tee -a "$TRANSCRIPT"; }
: > "$TRANSCRIPT"
log "cleanroom-install $(date -u +%Y-%m-%dT%H:%M:%SZ)"

export ENGRAM_SRC="$(mktemp -d /tmp/engram-src.XXXXXX)"
trap 'rm -rf "$ENGRAM_SRC"' EXIT

log "0. remove stale experiments (a broken prior install must never shadow)"
npm rm -g engram-dev >/dev/null 2>&1 || true
rm -f "$HOME/.local/node-v24.19.0/bin/treadle" || true

log "1. install.sh mechanism against a clean source dir + isolated PATH"
export PATH="$HOME/.local/node-v24.19.0/bin:$HOME/.local/share/pnpm:/usr/local/bin:/usr/bin:/bin"; hash -r  # pnpm's own bin dir must be on PATH for link
bash "$REPO_ROOT/install.sh" >>"$TRANSCRIPT" 2>&1
log "   install exit: 0"

log "2. assertions from an arbitrary directory (isolated PATH — no pnpm shadow)"
cd /tmp
treadle --version >>"$TRANSCRIPT" 2>&1
treadle --help >/dev/null
log "   treadle --help: ok"
treadle do where /tmp >/dev/null
log "   treadle do where: ok"
treadle init harness --agent pi --scope project --root /tmp/cleanroom-proj --dry-run >/dev/null
log "   treadle init harness --dry-run: ok"

log "3. the floor check: the linked entry under BOTH node binaries"
MAINJS="$ENGRAM_SRC/treadle/packages/cli/dist/src/main.js"
/usr/local/bin/node "$MAINJS" --help >/dev/null
log "   node 22.14: ok"
node "$MAINJS" --help >/dev/null
log "   node $(node --version): ok"

log "CLEANROOM INSTALL PASS"

# restore the working repo's link (the temp source dies with the trap)
( cd "$REPO_ROOT/treadle/packages/cli" && pnpm link --global ) >>"$TRANSCRIPT" 2>&1
log "working-repo link restored"
