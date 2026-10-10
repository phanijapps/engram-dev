# install-paths — research (analysis)

Round A1, and this one is EXPERIMENTAL: every load-bearing claim below
was tested live before it was written. Statuses:
**proven** (the experiment ran and the output is quoted), **declared**
(reliable docs, verified in-wave), **broken** (observed failure).

## 1. The question

Two installs must each be ONE truth:

- **The dev link**: from a fresh clone, `pnpm link` puts `treadle` on
  the PATH in one command — no hand-made symlinks, no launcher file.
- **The git install**: `npm i -g <git-url>#main` (or the pnpm
  equivalent) installs a working `treadle` from the main branch.

Then the guide's section 03 shrinks to match reality.

## 2. What the experiments proved

### EXP A — pnpm link, today's shape (PROVEN, with a lucky crutch)

```
cd treadle/packages/cli && pnpm link --global
→ + @treadle/cli 0.1.0 <- …/treadle/packages/cli     (exit 0)
treadle do where …  → works.  know validate … → works.
init harness --dry-run → works.
```

The link itself is clean — BUT it works only because this machine's
Node is **24**, whose native type-stripping runs the `.ts` bin:

- `packages/cli/package.json` `bin` points at `./src/main.ts`
  (implementation-supported).
- **Node 22.14 (present at /usr/local/bin/node) refuses it**:
  `ERR_UNKNOWN_FILE_EXTENSION` — proven by running the same file under 22. The guide documents "Node 22+"; the current bin breaks that
  floor on every machine that takes the docs at their word.
- **The fix is proven too**: `bin → ./dist/src/main.js` (tsc already
  emits it WITH the `#!/usr/bin/env node` shebang, because main.ts
  carries it). Re-linked that way, `treadle --help` ran green under
  Node 22.14 AND 24. The dist bin resolves workspace deps through the
  pnpm link target's own node_modules — no launcher file needed.
- Consequence: the checked-in `bin/treadle.mjs` launcher retires (it
  exists only because the bin shape was wrong); `pnpm build` becomes a
  prerequisite of linking (or the link command chains it — see tasks).

### EXP B — npm install -g from a git-shaped repo (BLOCKED BY DEFAULT)

Simulated: a repo root `package.json` with
`workspaces: ["treadle"]` and a `prepare` that installs and builds:

```
npm install -g /tmp/gitsim
→ warn allow-scripts … prepare not run        (exit 0 — FALSE green)
npm install -g --allow-scripts=engram-root /tmp/gitsim
→ prepare ran; but the root declares no bin → no treadle appears
```

Two hard facts:

1. **npm's allow-scripts security default SKIPS `prepare` on global
   installs** unless the user passes `--allow-scripts=<name>`. A
   design that leans on prepare MUST document that flag — or avoid
   install scripts entirely (impossible here: TypeScript needs a
   build).
2. The root orchestrator must also declare the `bin` (→
   `treadle/packages/cli/dist/src/main.js`); without it the install
   succeeds and delivers nothing.

### EXP C — pnpm's git workspace syntax (BROKEN, observed)

```
pnpm add -g "git+file:///tmp/gitsim.git#main&workspace=treadle&name=@treadle/cli"
→ crash inside pnpm's resolveGit (stack trace), partial install left behind
```

The `#workspace=` fragment is not dependable in pnpm 9.15.9
(proven on this machine). The git path rides **npm**, and pnpm gets a
documented fallback only if it survives a clean-room test in-wave;
otherwise the guide says npm for git installs, pnpm for the dev link.

## 3. The shape of the answer

- **bin → dist** (Q-2 default): the one-line contract fix that makes
  the Node floor real. Linking gains a build step; `pnpm link --global`
  from `packages/cli` after `pnpm build` is the whole dev path.
- **The root orchestrator** (Q-1 default): repo-root `package.json` —
  `private`, `workspaces: ["treadle"]`, `bin` pointing at the cli dist,
  `prepare` building the workspace. The guide teaches
  `npm i -g --allow-scripts=… github:<repo>#main` with the flag named
  and explained (it is a security default, not an obstacle).
- **files/prepublish hygiene**: the root ships only what the bin needs
  (no corpus, no coverage); workspace deps install via the root's
  prepare, not as workspace-protocol links into the global tree.
- **Clean-room verification**: every path proves itself in a temp
  clone (`git clone` → link / install → `treadle do where` → exit 0)
  on BOTH node floors present on this machine (22.14, 24.19).
- **The guide rewrites section 03** to the two one-command truths and
  retires the launcher-symlink dance; README follows.

## 4. Risks (named)

- **allow-scripts friction**: some environments pin npm config against
  any install scripts. The guide names the flag; a no-script fallback
  is impossible with a build requirement — recorded, not hidden.
- **Global tree pollution**: npm -g of the root installs workspace
  sibling packages as real deps; a future registry publish (one
  package, bundled) supersedes the whole question — recorded as the
  successor, not this wave.
- **Windows**: bins become `.cmd` shims via npm; the clean-room test
  adds a windows-labeled manual check (CI matrix already includes it).
- **The engram-dev shape** (Q-1 alternative): when the code split
  lands, the orchestrator layer disappears; the bin→dist and
  clean-room verifications carry over unchanged.

## 5. Questions for the owner

Q-1 (git target shape) and Q-2 (Node floor) — recorded in the pack,
each with a recommended default.
