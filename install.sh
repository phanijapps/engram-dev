#!/usr/bin/env bash
# install.sh — the one-command harness install (install-paths T-2).
#
#   curl -fsSL https://raw.githubusercontent.com/phanijapps/engram-dev/main/install.sh | bash
#
# What it does (and why, honestly): the harness is a pnpm workspace whose
# packages speak `workspace:*` — every npm-based remote install mechanism
# (npm i -g <git>, folder installs, tarball inflation) breaks on npm's
# handling of that protocol; the mechanisms were tested and recorded in
# docs/specs/install-paths. The path that WORKS, proven by
# treadle/scripts/cleanroom-link.sh, is the native one: clone, pnpm
# install + build, pnpm link --global. This script wraps exactly that.
set -euo pipefail

REPO_URL="https://github.com/phanijapps/engram-dev"
SRC_DIR="${ENGRAM_SRC:-$HOME/.engram-dev}"

say() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }

command -v git >/dev/null || { echo "git is required" >&2; exit 1; }
command -v node >/dev/null || { echo "node 22+ is required" >&2; exit 1; }
command -v pnpm >/dev/null || { say "enabling corepack (pins pnpm)"; corepack enable; }

say "cloning $REPO_URL → $SRC_DIR"
if [ -d "$SRC_DIR/.git" ]; then
  git -C "$SRC_DIR" pull --ff-only
else
  git clone -q "$REPO_URL" "$SRC_DIR"
fi

say "installing dependencies (pnpm, frozen lockfile)"
( cd "$SRC_DIR/treadle" && pnpm install --frozen-lockfile )

say "building"
( cd "$SRC_DIR/treadle" && pnpm build )

say "linking the CLI globally (pnpm link)"
( cd "$SRC_DIR/treadle/packages/cli" && pnpm link --global )

say "verifying"
treadle --version
treadle do where / >/dev/null 2>&1 || true   # a report, exit 0 always; smoke only

say "installed. try: treadle init harness"
say "uninstall: (cd $SRC_DIR/treadle/packages/cli && pnpm unlink --global) && rm -rf $SRC_DIR"
