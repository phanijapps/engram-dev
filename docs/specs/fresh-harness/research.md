# fresh-harness — research (analysis)

Round A1. Bounded: what exists today (read from the repo), what the
owner asked for, where the gaps are. Every claim carries a status:
**implementation-supported** (a command or file proves it now),
**declared** (a repo document says so), **inferred** (reasoned from
evidence), **unknown** (to verify before build).

## 1. What the owner asked

Two deliverables, one wave:

1. **The installer.** Package `agents/` and `skills/` (root) as part
   of `treadle/harness`. Install interactively like speckkit's
   `specify` CLI: `treadle init harness` → pick a coding agent
   (Claude Code, Codex, PI, GitHub Copilot) → pick project or global
   → install skills, agents, hooks where the surface wants them.
2. **The fresh repo.** Clean `docs/`, `engine/`, `wiki/` of old
   links. Everything reads as new.

Also observed: the owner moved `.github/` to the repo root.

## 2. What exists — evidence

| Fact | Status | Evidence |
|---|---|---|
| `agents/` at root: one persona, three surfaces (pi/claude/codex), README names install targets | implementation-supported | `agents/README.md`, `agents/{pi,claude,codex}/red-foreman.*` |
| `skills/` at root: `sdlc/` (7: analyze, build-kb, implement, new-project, plan, review, roadmap — last two stubs), `node/` (3), `productivity/writer` | implementation-supported | `find skills -type d` |
| Installed copies live in `.pi/skills/` (9) and `.pi/agents/`; `AGENTS.md` says installed copies must sync | implementation-supported | `.pi/` listing; `AGENTS.md` repo map |
| `engine/` still on disk: 246 files, all `__pycache__`/`.pytest_cache`/graphify caches; **zero tracked by git** | implementation-supported | `find engine -type f \| wc -l` = 246; `git ls-files engine \| wc -l` = 0 |
| `graphify-out/` at root: one stale merged-graph.json, untracked | implementation-supported | `git ls-files graphify-out` = empty |
| `.github/workflows/ci.yml` at root has **no `working-directory`**; root has no package.json → CI would fail on push | implementation-supported | ci.yml read; root listing |
| 8 wiki pages reference `engine/(okf\|loom)` paths that no longer exist in HEAD | implementation-supported | `grep -rlE "engine/(okf\|loom)" wiki` |
| Root README mentions loom once (lineage note); treadle/README twice (lineage, metaphor) | implementation-supported | grep hits |
| CLI today: `do`, `know`; deps = commander + workspace pkgs; bin `treadle` | implementation-supported | `packages/cli/package.json` |
| Spec packs are born through `do init` + room interview + `approve` | implementation-supported | stitch-ui precedent, rev 37 |
| Claude Code: skills `.claude/skills/<n>/SKILL.md`, agents `.claude/agents/*.md`, hooks in `.claude/settings.json`, global `~/.claude/` | declared (industry docs; verify paths at build) |
| Codex: skills/agents under `~/.codex/` (our own README says `~/.codex/agents/`), notify hook in `~/.codex/config.toml` | declared (our README) + unknown (project-scope skill dir — verify) |
| PI: skills `.pi/skills/` (project) or `~/.pi/agent/skills/` (user), agents same pattern; **no native hooks file** (extensions are the mechanism, out of scope) | implementation-supported (this repo + user dir) |
| Copilot: `.github/copilot-instructions.md`, prompt files `.github/prompts/*.prompt.md`; agents are cloud/org-level; no user-global file | declared; verify format volatility at build |

## 3. The shape of the answer

- **Source of truth moves.** `git mv agents skills → treadle/harness/`.
  A manifest (`harness.json`) describes every component: id, kind
  (skill/agent/hook), source path, per-surface transform (identity
  for pi/claude/codex; SKILL.md→prompt conversion for Copilot).
  Versioned data, additive-only like every frozen vocabulary here.
- **Plan before write.** The installer compiles manifest + choices →
  an explicit plan (destination, transform, mode) → `--dry-run`
  prints it, `--json` emits it, apply replays it deterministically.
  Idempotent: content-hash compare; re-run changes nothing unless
  `--force`. Never deletes unknown files.
- **Flags are the engine; the TUI is skin.** Every choice has a
  flag (`--agent --scope --skills --yes`). No TTY and no flags →
  exit 2 with the exact command to run. Tests drive flags; the TUI
  is thin.
- **Hooks: native-only, honest nos** (Q-1). Claude settings.json
  JSON-merge that preserves unknown keys; codex `notify` line; pi
  and Copilot print "not supported" in the plan — no pretending.
- **Cleanup is a sweep with a checker.** Delete untracked residue
  (`engine/`, `graphify-out/`), fix ci.yml (`working-directory:
  treadle`), then a `links` gate script: every markdown link in live
  surfaces (README, AGENTS.md, treadle/README, docs/product, wiki,
  CONTRIBUTING, SECURITY) must resolve. Archive stays untouched —
  history is evidence, clearly banner-ed.
- **Wiki tells the TS truth.** systems/treadle.md +
  sdd-harness-architecture.md rewritten to the current engines;
  okf-engine/loom-engine superseded into docs/archive (Q-4);
  domain pages de-python'd; indexes regenerated; the know ritual
  (validate 0/0, anchors 0, fresh) proves it.

## 4. Risks (named, not hidden)

- **Surface-format volatility.** Copilot prompt format and codex
  skill dirs move fast. Mitigation: adapters are manifest rows;
  formats verified at build time; failures refuse, never guess.
- **Global writes touch `$HOME`.** Mitigation: the plan shows
  absolute paths; apply requires `--yes` or an explicit confirm;
  nothing outside the manifest is written (Q-5).
- **The TTY lie.** TUIs test badly. Mitigation: the TUI only
  produces flags; all logic below it is flag-driven and tested.
- **Cross-platform paths.** CI matrix includes windows. Mitigation:
  `path.join` everywhere; no shell strings in the installer.
- **Self-hosting drift.** This repo's `.pi/` installs by hand.
  Mitigation: running the installer in this repo with
  `--agent pi --scope project` must converge `.pi/` to the manifest
  — the installer's own dogfood test.
- **The engine must not move.** Installer lives in `@treadle/cli`;
  admission/emit/core untouched; corpus stays byte-stable (the
  gate proves it every run).

## 5. Out of scope (bounded)

- `new-project` / `roadmap` skills stay stubs.
- Pack birth stays `do init`; no `treadle init spec` (naming room
  held for later).
- Copilot org-level agents, pi extensions, remote installs.
- engram-dev brand split (recorded in DEBT.md, separate wave).

## 6. Round A2 — the owner's answers, folded in

Answered 2026-10-10, in-thread, by human:owner. Recorded in the
pack (Q-1..Q-5, revision-gated). What they change:

### Q-1 — hooks are JS files; pi has extensions; copilot has neither

- **pi extensions are real and local-documented**:
  `.pi/extensions/` (project) and `<agent-dir>/extensions/` =
  `~/.pi/agent/extensions/` (user); Pi loads direct `.ts`/`.js` files
  or directories with an entry point. Status: **implementation-
  supported** (pi's own docs, configuration.md lines 21/34; the user
  dir exists on this machine with `extensions/`).
- Therefore pi hooks ship as **extension JS files** from the harness.
- Claude Code hooks: `settings.json` wiring that invokes **JS hook
  files** (commands run `node <hook>.js`).
- Codex: `config.toml` `notify` invoking a **JS file**.
- Copilot: no hooks and no extensions mechanism — the plan prints
  the honest no. Status: **declared** (owner) — verify at build.
- All hooks ship as JS files in the harness (`harness/hooks/`),
  wired per surface. They dogfood with everything else.

### Q-3 — Copilot supports all three (research)

The owner's correction stands against my earlier "cloud-only agents"
claim. The current Copilot surface (late-2025/2026 GitHub docs):

| Capability | Location | Status |
|---|---|---|
| Custom instructions | `.github/copilot-instructions.md` (repo); org via org `.github` repo; personal via settings text (not files) | **declared** — stable, well known |
| Custom agents | `.github/agents/<name>.md`, YAML frontmatter (name, description, when-to-use, tools, model); used by the Copilot coding agent and agent-mode clients | **declared** — verify frontmatter keys at build against live docs |
| Skills | `.github/skills/<name>/SKILL.md` — the Agent Skills format announced at GitHub Universe 2025; same SKILL.md progressive-disclosure shape Claude and pi use | **declared** — verify at build |
| Hooks / extensions | none | **declared** (owner) |

No web access from this session — statuses are declared, not
verified-against-live-docs; **T-3 verifies each path against current
documentation before the adapter lands, and refuses what it cannot
verify.** The earlier research table row "agents are cloud/org-only"
was **wrong** and is superseded by this round.

### Q-4 — sweep and retire the wiki

Old pages leave the live bundle (superseded copies to
`docs/archive/wiki-systems/`); the live wiki tells the TS truth only.

### Q-5 — dogfood-first

The named dogfood targets are **project-level `.pi/agents`,
`.pi/skills`, `.codex/agents`, `.codex/skills` in this repo**. The
loop: harness content installs there → it is used and evaluated in
real work → what passes is promoted back into the harness — **hooks
and extensions included**. Global installs wait; the confirm design
(Q-5 original) stays recorded for when they arrive.

## 7. Questions for the owner

Q-1..Q-5 are answered and recorded. New questions surfaced by this
round are held as build-time verifications (T-3), not owner
questions — the owner answers direction, the build verifies facts.
