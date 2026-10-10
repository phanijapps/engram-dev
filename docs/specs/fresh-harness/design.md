# fresh-harness — design

Draft round 1. Decisions DES-1..8. Each names its alternative and
how reversible it is. Answers Q-1..Q-5 fold in as recorded; the
defaults below assume the recommendations stand.

## Approach

One wave, two deliverables, one contract each:

- **D-1 the installer.** `treadle init harness` — an interactive
  installer over a manifest. Content moves to `treadle/harness/`
  (agents + skills + manifest). The CLI compiles choices into a
  plan, shows it, applies it, and can re-run with zero drift.
- **D-2 the fresh repo.** Residue deleted, CI unbroken, every live
  link resolving, the wiki telling the TS truth.

```
treadle/harness/
  harness.json          ← the manifest (versioned, additive-only)
  agents/{pi,claude,codex}/red-foreman.*
  skills/sdlc/…  skills/node/…  skills/productivity/writer/…
packages/cli/src/commands/init.ts     ← the installer command
packages/cli/src/harness/             ← manifest types, plan compiler, adapters
```

### The manifest (harness.json)

```json
{
  "format": "harness/0.1",
  "components": [
    {
      "id": "sdlc-analyze", "kind": "skill", "source": "skills/sdlc/analyze",
      "surfaces": ["pi", "claude", "codex", "copilot"],
      "transform": { "pi": "identity", "claude": "identity",
                     "codex": "identity", "copilot": "skill-to-prompt" }
    },
    { "id": "red-foreman", "kind": "agent", "source": "agents/pi/red-foreman.md",
      "surfaces": ["pi"], "transform": { "pi": "identity" } }
  ],
  "hooks": {
    "claude": [ { "id": "post-tool-use-check", "merge": "settings-hooks" } ],
    "codex":  [ { "id": "notify", "merge": "config-notify" } ],
    "pi": [], "copilot": []
  }
}
```

Empty hook arrays are the honest "not supported" — the plan prints
them, the user sees the truth.

### The plan (the contract between user and disk)

`{ component, surface, source, destination, transform, bytes, mode:
create|same|update|refuse }`. `--dry-run` prints a table;
`--json` emits the machine form; apply writes exactly the plan,
nothing else. Re-run: content-hash compare; `same` unless `--force`.

### The command surface

```
treadle init harness [--agent <a>] [--scope project|global]
                     [--skills <ids…>] [--no-agents] [--no-hooks]
                     [--dry-run] [--json] [--yes] [--force]
```

Interactive when a TTY exists and a choice is missing; otherwise the
flags are required and the error shows the exact command.

## Decisions

- **DES-1 content moves under `treadle/harness/`, manifest-driven.**
  Alternative: keep content at root (rejected — the owner asked for
  the package; root noise). Alternative: publish per-surface npm
  packages (rejected — one repo, one truth, later for engram-dev).
  Reversible: high (git mv back).
- **DES-2 plan-then-apply.** No write before an inspectable plan.
  Alternative: copy-as-you-go (rejected — unreviewable, untestable).
  Reversible: high.
- **DES-3 flags are the engine, TUI is skin.** @clack/prompts (Q-2
  default) renders choices and returns flags; zero logic above the
  flag layer. Alternative: zero-dep selector (~150 owned lines).
  Reversible: medium (UX swap only — engine unchanged either way).
- **DES-4 adapters are manifest rows + two tiny transforms.**
  identity (pi/claude/codex) and skill-to-prompt (Copilot: frontmatter
  `description` + body). A new surface = manifest row; a new
  transform = one function in a registry. Alternative: per-surface
  script directories (rejected — speckkit's sprawl, our constraint
  is few moving parts). Reversible: high.
- **DES-5 hooks native-only, honest nos.** (Q-1 default.) Claude:
  merge `hooks` into `.claude/settings.json` preserving unknown keys;
  Codex: `notify` line in config.toml; pi/copilot: plan prints
  `not supported` — refuse to fake. Alternative: ship emulated hooks
  everywhere (rejected — lies break trust). Reversible: high.
- **DES-6 idempotency by content hash; never delete.** Re-run = `same`.
  `--force` overwrites; unknown files in destinations are never
  touched. Alternative: rsync-style mirror (rejected — destructive
  in shared dirs like `.claude/`). Reversible: high.
- **DES-7 globals need the absolute-path confirm.** (Q-5 default.)
  Writes outside the repo print each absolute path and require
  `--yes` (or interactive confirm). Alternative: project-only v1.
  Reversible: high.
- **DES-8 the cleanup is checked, not vibes.** A `links` gate script
  walks live surfaces and fails on unresolved links; the wiki pass
  ends in the know ritual green. Archive untouched (history is
  evidence). Alternative: manual sweep (rejected — rots back).
  Reversible: high.

## Portability / brand

- Installer output carries no engine brand strings beyond the CLI's
  own name; the brand fence and portability tests extend to cover
  `init.ts` + harness files.
- Corpus untouched: installer code adds no admission/emit paths;
  `pnpm corpus:check` stays the byte-stable gate.

## Open by design

Q-1..Q-5 recorded in the pack; defaults assumed above. If an owner
answer contradicts a DES, the DES rewrites before build.
