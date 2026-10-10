# Research: the reading order of the spec file

Owner direction, 2026-10-09: JSON is not the problem; the organization
is. The file must read chronologically: id, name, description, date,
status, metadata, then spec, design, tasks, review, additional.

## Why the file reads like a phone book today

The writer serializes with sorted keys (determinism habit). The frozen
status-model file proves it: artifacts, closed_at, closed_by,
deliverable, format, name, plan, review, revision, spec, status,
tasks, title. Alphabetical, not authored. RFC 8259 ascribes no meaning
to member order, so the only value order can carry is human — and we
spent it on the alphabet.

## What the standards and the field do

- JSON:API resource objects: id, type, then attributes,
  relationships, links, and meta LAST. Meta is defined as the residual
  bucket: what "can not be represented as an attribute".
- GitHub REST payloads: id first, name second, description at seven.
  Status flags (private, fork) sit early; derived timestamps and
  counts sit late.
- package.json (npm docs and express as the real sample): name,
  description, version, author, license first; dependencies last.
  Order is reading guidance; npm never reads it semantically.
- OpenAPI 3.1: version and info (title, description, version) before
  paths. The spec endorses front-loaded identity metadata for humans.
- RFC 8785 (JCS): sorted order exists only for hashing and signing;
  the wire keeps the authored order. Two orders, two jobs.

## The consensus, and the one tension

Consensus: identity first (id, name, description), then chronology
(dates), then status (identity-adjacent, early-middle), then content
in production order, then pointers and plumbing.

Tension: the precedents put the residual metadata bucket LAST
(JSON:API defines meta as overflow). The owner's list puts metadata
sixth, before the content. Both defensible: precedent's meta is a
junk drawer; ours would be tight (format, revision, artifacts, env).
This is Q-1 for the owner.

## The mechanical facts

1. Pure reorder is free: the writer controls emission order; nothing
   in the ecosystem ascribes meaning to it.
2. Renames are not cosmetic: title to description, plan to design,
   and moving format, revision, artifacts, env into metadata change
   what the loader reads. Dual-read solves it: accept both shapes at
   load, normalize in memory, emit the new layout on save. Frozen
   specs never rewrite; they load forever.
3. Digests are a separate job: keep sorted-key hashing for digests
   (the RFC 8785 pattern), authored order for the file.
4. A machine-stamped date.updated introduces a clock at save time.
   Precedent: okf stamps generated.at. This amends the no-clocks rule
   for document metadata; loop event data (evidence rows) keeps its
   caller-supplied clock. This is D-3.
