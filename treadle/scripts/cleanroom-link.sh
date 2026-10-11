#!/usr/bin/env bash
# cleanroom-link.sh — the falsifiable proof of the dev-link path (install-paths T-1).
# A fresh clone, the documented commands, assertions from an arbitrary directory.
# Transcript: /tmp/cleanroom-link.transcript (the evidence artifact).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"   # treadle/scripts → the repository root
WORK="$(mktemp -d /tmp/cleanroom-link.XXXXXX)"
TRANSCRIPT=/tmp/cleanroom-link.transcript

cleanup() {
  # leave the machine as we found it: unlink the temp package, drop the clone
  (cd "$WORK/h/treadle/packages/cli" && pnpm unlink --global) >/dev/null 2>&1 || true
  rm -rf "$WORK"
}
trap cleanup EXIT

log() { printf '%s\n' "$*" | tee -a "$TRANSCRIPT"; }

: > "$TRANSCRIPT"
log "cleanroom-link $(date -u +%Y-%m-%dT%H:%M:%SZ)"
log "repo: $REPO_ROOT"

log "1. fresh clone"
git clone -q "$REPO_ROOT" "$WORK/h"
cd "$WORK/h/treadle"

log "2. corepack enable"
corepack enable

log "3. pnpm install --frozen-lockfile"
pnpm install --frozen-lockfile >>"$TRANSCRIPT" 2>&1

log "4. pnpm build"
pnpm build >>"$TRANSCRIPT" 2>&1

log "5. pnpm link --global (from packages/cli)"
( cd packages/cli && pnpm link --global ) >>"$TRANSCRIPT" 2>&1

log "6. assertions from an arbitrary directory"
cd /tmp
wukong --version >>"$TRANSCRIPT" 2>&1
wukong --help >/dev/null
log "   wukong --help: ok"
wukong do where /tmp >/dev/null
log "   wukong do where: ok"
wukong know validate "$REPO_ROOT/wiki" >/dev/null
log "   wukong know validate: ok"

log "CLEANROOM LINK PASS"
