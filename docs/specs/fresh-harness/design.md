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
                     "codex": "identity", "copilot": "identity" }
    },
    { "id": "red-foreman", "kind": "agent", "source": "agents/pi/red-foreman.md",
      "surfaces": ["pi", "claude", "codex", "copilot"], "transform": { "pi": "identity" } }
  ],
  "hooks": [
    { "id": "post-tool-check", "file": "hooks/post-tool-check.js",
      "wiring": { "pi": "extension", "claude": "settings-hooks",
                  "codex": "config-notify", "copilot": null } }
  ]
}
```

`null` wiring is the honest "not supported" — the plan prints it,
the user sees the truth. Copilot skills are SKILL.md natively
(Agent Skills format): identity transform, no conversion.

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
- **DES-5 hooks ship as JS files, wired per surface; copilot honestly none.**
  (Q-1 answer.) The harness carries `harness/hooks/*.js`; pi gets them as
  extension files (`.pi/extensions/` — local-documented), Claude Code
  gets settings.json wiring that invokes them, Codex gets a config
  notify line that invokes them; Copilot has no hooks or extensions —
  the plan prints the no. They dogfood in this repo like everything
  else. Alternative: emulated hooks everywhere (rejected — lies).
  Reversible: high.
- **DES-6 idempotency by content hash; never delete.** Re-run = `same`.
  `--force` overwrites; unknown files in destinations are never
  touched. Alternative: rsync-style mirror (rejected — destructive
  in shared dirs like `.claude/`). Reversible: high.
- **DES-7 dogfood-first; globals later.** (Q-5 answer.) The installer
  lands content in project-level `.pi/` and `.codex/` in this repo;
  real work exercises it; what passes is promoted back into the
  harness — hooks and extensions included. Global (`$HOME`) installs
  are a later wave; when they come, the absolute-path confirm applies.
  Reversible: high.
- **DES-8 the cleanup is checked, not vibes.** A `links` gate script
  walks live surfaces and fails on unresolved links; the wiki pass
  ends in the know ritual green. Archive untouched (history is
  evidence). Alternative: manual sweep (rejected — rots back).
  Reversible: high.
- **DES-9 Copilot is a full adapter: instructions + agents + skills,
  no hooks.** (Q-3 answer.) `.github/copilot-instructions.md`,
  `.github/agents/*.md` (frontmatter), `.github/skills/<n>/SKILL.md`
  (the Agent Skills format — identity transform, not conversion).
  Every path verified against live docs at T-3; refusal over guessing.
  The earlier "prompt-file conversion" design is superseded.
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
