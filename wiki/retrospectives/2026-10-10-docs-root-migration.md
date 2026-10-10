---
title: "Root specs migration: observed session retrospective"
type: Retrospective
description: "Observed migration outcomes, verification defects, repairs, and evidence limits from this session."
status: stable
created: 2026-10-10
updated: 2026-10-10
sources:
  - { id: intent, resource: specs/docs-root-migration/feature.md }
  - {
      id: evidence,
      resource: specs/docs-root-migration/docs-root-migration.json,
    }
  - { id: gates, resource: specs/docs-root-migration/gates.json }
  - { id: relocation, resource: specs/docs-root-migration/relocations.json }
  - {
      id: fixture,
      resource: specs/docs-root-migration/bug-shared-workspace-gate.md,
    }
  - {
      id: coverage,
      resource: specs/docs-root-migration/bug-coverage-source-resolution.md,
    }
---

# Intent and observed result

The owner requested root `./specs` and complete removal of `docs/`.
The migration preserves 321 original files at their mapped destinations;
current research pages contain all four complete historical research texts.
Current knowledge and contract assets live in the wiki, while frozen history
lives under `specs/archive`.
Sources: `specs/docs-root-migration/feature.md:1`;
`specs/docs-root-migration/relocations.json:1`.

# What verification exposed

Discovery and recall tests assumed a particular live workspace state. The
migration made those assumptions fail. Isolated fixtures now test canonical
root precedence and zero, one, and two open initiative reports. Runtime recall
behavior remains unchanged.
Sources: `treadle/packages/cli/test/where.test.ts:1`;
`specs/docs-root-migration/bug-shared-workspace-gate.md:1`.

The coverage run executed compiled package exports while measuring source
modules. Vitest now resolves the four runtime packages to their source entry
points. The original coverage thresholds and include scope remain in place;
production package exports still target compiled output.
Sources: `specs/docs-root-migration/bug-coverage-source-resolution.md:1`;
`treadle/vitest.config.ts:1`.

The final gate record contains actual results. The library serves the current
root, and 72 installed skill files match their shipped counterparts across
Pi, Codex, and Claude.
Sources: `specs/docs-root-migration/gates.json:1`;
`specs/docs-root-migration/T-3-verification.json:1`.

Independent review found stale task counts, a historical approval paragraph
presented as current, and a superseded root approach in the open consolidation
pack. The prose was corrected. The exact revision-23 JSON was archived before
a supersession annotation created live revision 24; the verifier checks that
owner acts and prior evidence remain unchanged.
Sources: `specs/docs-root-migration/review-findings.md:1`;
`specs/docs-root-migration/bug-superseded-consolidation-approach.md:1`.

# Limits and remaining decisions

This retrospective covers observations from this session. It does not infer
past sessions or restore the four withdrawn historical interpretations.
Source: `specs/docs-root-migration/feature.md:1`.

The owner explicitly selected root specs and removal of docs. Asset/archive
placement and the legacy-only discovery fallback remain proposed decisions in
the machine pack; owner approval and closure remain unset.
Source: `specs/docs-root-migration/docs-root-migration.json:1`.

Wiki freshness still compares HEAD, and its fingerprint scanner still selects
Python files. The migration verifier separately records hashes of current
wiki source resources. Historical embedded paths remain historical and can be
resolved through the relocation map.
Sources: `treadle/packages/knowledge/src/fingerprints.ts:54`;
`specs/docs-root-migration/verify-migration.mjs:1`.

Read [the initiative](/initiatives/docs-root-migration.md) and
[the authority map](/project/documentation-map.md).
