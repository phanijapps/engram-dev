# Design: specpack/0.3 — handoff-complete tasks

Owner-synced design, 2026-10-08. Sources: owner sessions (context block
endorsed; links and plain-text notes requested; "spec this and loop
through it"), specpack.py:220-318, specpack.schema.json (0.2).

## Problem

A pack built by one team must be executable by a fresh session with
zero conversation memory. The 0.2 handout (`slice_for`) fails this six
ways, all verified in source:

- G1 slice flattens every node to one text line; prereq `detail`,
  `produces`, `evidence` are dropped (`specpack.py:253-275`).
- G2 decisions and questions are structurally unreachable: the slice
  stack seeds only from needs/satisfies/implements/accepts/honors
  (`specpack.py:227`), so D and Q never enter.
- G3 trace expansion is one hop: a task implements a DES; the FRs the
  DES addresses do not follow.
- G4 nothing anchors the pack to code: `produces` is bare strings, no
  digests, no drift detection.
- G5 verify is one command with free-text expect.
- G6 no environment contract: build/test commands live outside the pack.

## Design: three layers

1. TRACE links (0.2, unchanged): implements/satisfies/accepts/honors.
2. Slice expansion (machine): full node bodies; designs expand one hop
   through `addresses` with a `via` marker; accepted decisions always
   in; prereq tasks contribute detail, produces, evidence; plan prelude
   (approach, stack, env).
3. Context block (new, per task): `touch` (pinned files + sha256 +
   why), `read` (advisory files), `wiki` (local cids), `links`
   (external URLs or repo-relative docs; sha256 optional, verified at
   handout when present), `notes` (plain strings; provenance is git
   blame), `commands` (precise check commands).

## Enforcement levels

| Field                                    | Enforcement                                                        |
| ---------------------------------------- | ------------------------------------------------------------------ |
| touch                                    | pinned by machine at handout; drift refuses handout (needs_rebase) |
| read, wiki, links without sha256         | advisory                                                           |
| links with sha256, artifacts with sha256 | verified at handout; mismatch refuses                              |
| notes                                    | none; promote-to-node rule when load-bearing                       |

Paths in touch/read are relative to the git root containing the pack.
Artifact paths stay relative to the pack file (0.2 rule).

## Machine behavior

- `loom next`: pin-or-verify touch digests; drift since last pin
  returns `{"status": "needs_rebase", "drift": [...]}` and does not
  hand out. First handout writes the pins.
- `loom rebase <dir> --task T-x`: re-pins touch, local-link, and artifact digests. Provenance
  is git history of the pack (no clock fields outside evidence rows;
  determinism rule kept).
- `loom check`: coverage report (never violations) adds
  context-completeness (missing detail/touch), long notes, env
  absence, open questions while tasks are ready.
- A1 to A7 semantics unchanged. A6 unchanged (record-time, every
  command exit 0).

## Compatibility

One schema file; `format` becomes enum ["specpack/0.2", "specpack/0.3"];
all new fields optional; every 0.2 pack remains valid. New loom refuses
unknown format tags at load (KNOWN_FORMATS gate). Old loom (before this
initiative) accepted any `specpack/*` tag and discarded schema errors,
so it half-handles 0.3 packs silently: mixed-version tooling must
upgrade loom before opening 0.3 packs.

## Rejected

- Embedding content in the pack (duplicates, drifts, waterfall trap;
  the 0.2 schema description already says "referenced, never embedded").
- Pinning every reference (digest churn trains workers to ignore
  rebase).
- A unified sources[{kind}] array (erases enforcement levels).
- New task->Q or task->D link kinds (open questions gate via blocked
  status; decisions are few and always included).
- Machine-written event rows with clocks (violates the determinism
  rule; git is the provenance).

## Open questions

- Q-1 freeze moment: recommendation D-6 (pin at next).
- Q-2 who re-pins: recommendation D-7 (any agent, git provenance).
