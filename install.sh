#!/usr/bin/env bash
# install.sh — the one-command harness install (install-paths T-2).
#
#   curl -LsSf https://raw.githubusercontent.com/phanijapps/wukong/codex/background-harness/install.sh | bash
#
# Source bootstrap: builds the workspace and bundled browser assets, then
# links the CLI. A portable runtime is also available from `pnpm package:runtime`;
# its dependencies and assets are self-contained outside this checkout.
# Windows users can use install.ps1 without Bash.
set -euo pipefail

REPO_URL="${HARNESS_REPO_URL:-https://github.com/phanijapps/wukong.git}"
# The published preview and its source must use the same ref until merge.
INSTALL_REF="${HARNESS_REF:-codex/background-harness}"
SRC_DIR="${ENGRAM_SRC:-$HOME/.engram-dev}"

say() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }

command -v git >/dev/null || { echo "git is required" >&2; exit 1; }
command -v node >/dev/null || { echo "node 22+ is required" >&2; exit 1; }
INSTALL_NODE_MAJOR="$(node -p "Number(process.versions.node.split('.')[0])")"
case "$INSTALL_NODE_MAJOR" in
  ''|*[!0-9]*) echo "Could not determine the Node version" >&2; exit 1 ;;
esac
if [ "$INSTALL_NODE_MAJOR" -lt 22 ]; then
  echo "node 22+ is required" >&2
  exit 1
fi
command -v pnpm >/dev/null || { say "enabling corepack (pins pnpm)"; corepack enable; }

say "cloning $REPO_URL → $SRC_DIR"
if [ -d "$SRC_DIR/.git" ]; then
  CURRENT_REF="$(git -C "$SRC_DIR" symbolic-ref --quiet --short HEAD || true)"
  if [ "$CURRENT_REF" != "$INSTALL_REF" ]; then
    echo "Source checkout is not on $INSTALL_REF. Use ENGRAM_SRC for a new directory; existing files were left unchanged." >&2
    exit 1
  fi
  git -C "$SRC_DIR" pull --ff-only origin "$INSTALL_REF"
else
  git clone -q --branch "$INSTALL_REF" --single-branch "$REPO_URL" "$SRC_DIR"
fi

say "installing dependencies (pnpm, frozen lockfile)"
( cd "$SRC_DIR/treadle" && pnpm install --frozen-lockfile )

say "building"
( cd "$SRC_DIR/treadle" && pnpm build )

say "linking the CLI globally (pnpm link)"
( cd "$SRC_DIR/treadle/packages/cli" && pnpm link --global )

say "verifying"
node "$SRC_DIR/treadle/packages/cli/dist/src/main.js" --version
wukong --version

say "installed. try: wukong init harness"
say "uninstall: (cd $SRC_DIR/treadle/packages/cli && pnpm unlink --global) && rm -rf $SRC_DIR"
