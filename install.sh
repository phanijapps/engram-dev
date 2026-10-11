#!/usr/bin/env bash
# install.sh — the one-command harness install (install-paths T-2).
#
#   curl -fsSL https://raw.githubusercontent.com/phanijapps/engram-dev/main/install.sh | bash
#
# Source bootstrap: builds the workspace and bundled browser assets, then
# links the CLI. A portable runtime is also available from `pnpm package:runtime`;
# its dependencies and assets are self-contained outside this checkout.
# Windows users can use install.ps1 without Bash.
set -euo pipefail

REPO_URL="${HARNESS_REPO_URL:-https://github.com/phanijapps/engram-dev}"
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
wukong --version

say "installed. try: wukong init harness"
say "uninstall: (cd $SRC_DIR/treadle/packages/cli && pnpm unlink --global) && rm -rf $SRC_DIR"
