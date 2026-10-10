# The golden conformance suite — design

**Date:** 2026-10-10
**Kind:** research → suite design. The prerequisite the port research names: the corpus that turns any future port (or any refactor) from brave into boring.
**Status:** design only. Building it is a candidate wave; no code changes here.

## 1. What it is, in one sentence

A versioned corpus of inputs and expected outputs — every frozen pack, every malformed pack, every event sequence — that any implementation of the `specpack/0.x` contract must reproduce **byte for byte** (with time made deterministic) to claim conformance.

## 2. Why it exists

Three waves of review history say the same thing: the engine's real mass is its *earned behavior* — the normalizer's dual-read, the canonical writer's ordering, the admission refusals' exact vocabulary, the checksum discipline. Tests protect the current implementation; the golden suite protects the **contract**, independent of implementation, independent of language. It is the migration insurance the Python-vs-Node research demands, and it pays rent even if the port never happens (every refactor, every schema addition gets diffed against truth).

## 3. Layers

### L1 — Canonical goldens (load → emit)
For each of the seven frozen packs (`specpack-context`, `status-vocabulary`, `status-model`, `spec-layout`, `spec-web`, `spec-library`, and any born after):
- input: the pack exactly as frozen;
- expected: the canonical emission (the chronological layout, key order preserved, `sort_keys=False` equivalent) as bytes;
- also expected: `check` verdict (violations/gaps = 0/0), derived stage, revision.

Adds: born packs in the *old* root shape (pre-spec-layout files) proving dual-read; packs at every lifecycle point (born, planning, awaiting_owner, approved, complete).

### L2 — Malformed corpus (refuse, with the exact words)
Every refusal the machine owns, with its **exact message** — the refusal vocabulary is a contract:
- hand-edited stage lie (`deliverable: in_review` without evidence) → the specific refusal;
- choice answer outside options; repeated unknown; answer after resolve; approval with open questions; approval of a frozen pack; record on a done task;
- broken JSON, wrong format tag, unknown folder names, path traversal (including the symlink case), non-`.md` artifact requests;
- each case: input + operation → expected exit code + expected stderr/JSON text.

### L3 — Event transcripts (sequences → states)
Event sequences in `specweb-events/0.1` shape and the pack state each yields:
- happy: answer → answer → choice → approve (born → awaiting_owner → approved);
- honest: unknown kept open, unknown cleared by a real answer;
- illegal: every refused sequence and its refusal (double approve, approve-then-answer, edit-after-freeze);
- derivation coverage: the seven stages × their inputs (the branch matrix the suite already enumerates, now as fixtures).

### L4 — Round-trip and idempotence
- load → emit → load → emit: byte-equal on the second emit (normalizer never drifts);
- revision monotonicity across a scripted admission series;
- checksums/fingerprints stable across re-runs on identical trees.

## 4. Determinism rules (the hard part, solved once)

1. **No wall clock in goldens.** Expected outputs are scrubbed of `at`/`updated` fields, or produced with a fixed injected clock (`--at` flags already exist on every admission command — the machine's own discipline makes this nearly free).
2. **No environment.** Paths scrubbed to `«root»`; ports ephemeral; temp dirs normalized.
3. **Byte-level, not structural.** Key order is part of the contract (the spec-layout wave froze it). Comparisons are on bytes after scrubbing.
4. **Generation is explicit and rare:** one command regenerates a golden; CI fails on drift; changing a golden requires an ADR titled "contract change" and a version bump of the format tag. Goldens are never edited by hand.

## 5. The runner contract (language-agnostic by design)

The corpus is plain files:

```
conformance/
  L1-canonical/<case>/input/…  expected.emit.json  expected.check.json
  L2-refusals/<case>/input/…  op.json  expected.err
  L3-events/<case>/input/…  events.jsonl  expected.state.json
  L4-roundtrip/<case>/input/…
  runner.schema.json      ← the operations vocabulary, versioned
```

`runner.schema.json` defines the ~12 operations (`load`, `emit`, `check`, `answer`, `unknown`, `choice`, `approve`, `record`, `close`, `read-events`, `artifact`, `traverse`) with their I/O shapes. The Python engine ships the first runner; a Node runner implements the same twelve ops against the same corpus. **Conformance = corpus green, regardless of runner.**

## 6. Sizing (estimate, honest)

| Layer | Cases | Source |
|---|---|---|
| L1 | ~10 (7 frozen + 2 historical shapes + 1 born) | exists |
| L2 | ~30 | enumerating the refusal paths already tested, transcribed to fixtures |
| L3 | ~25 (≈15 happy/legal, ~10 illegal) | the branch matrix + review history |
| L4 | ~5 | cheap |

Effort: one small wave — 3 tasks (corpus transcription, runner + scrubber, CI gate). No schema changes. No engine behavior changes expected; any drift found during transcription is a defect disclosure, not a silent fix (house rule).

## 7. What it deliberately does not cover

- Performance (benchmarks are a separate CI concern, R38 of the standards doc).
- The web pages' rendering (behavior tests cover those; they are not format contracts).
- Help-text prose ( UI copy churns; the *vocabulary* is covered via L2).

## 8. Open questions for the owner

1. Build it now as a Python wave (recommended — it is the port's prerequisite and pays immediately), or fold it into a Node pilot?
2. Does the corpus live in-repo (`conformance/` at the root, versioned with the engine) or as its own published package (the OSS world could then port against it independently)?
3. Should `loom`/`treadle` refusal messages be frozen as contract in L2 exactly as worded today (my assumption: yes — the adapter contract already publishes them verbatim)?
