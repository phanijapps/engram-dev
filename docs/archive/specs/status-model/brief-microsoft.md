# Research brief: Microsoft Developer Blog, "From Spec-First to Enterprise-Ready: Extending GitHub Spec Kit"

Source: https://developer.microsoft.com/blog/from-spec-first-to-enterprise-ready-extending-github-spec-kit/
Author: Apoorv Gupta (Principal Software Engineer, Microsoft). Date: 2026-10-07.
Fetched and read in full by a reviewer agent, 2026-10-09.

## Key facts

- The extension model is a customization layer around a workflow the
  article treats as given: "a stable core with explicit extension
  points."
- The artifact chain: "a traceable artifact chain - from project
  principles and feature specifications to plans, tasks, code, and
  tests." No containment relations are stated anywhere.
- Four extension layers: "presets change existing behavior, extensions
  add capabilities, bundles package reusable stacks, and workflows
  automate repeatable processes."
- Governance is layered precedence: "Organization baseline... Domain
  and technology overlay... Team customization." Precedence, not state
  machines.
- The only runtime states named anywhere: workflows "pause or resume
  when review is required."

## What is absent

- No status vocabulary for spec, plan, or task entities. The words
  proposed, approved, in-progress, done, superseded never appear as
  artifact states. The only lifecycle verb for any document is
  "drafted" (constitution).
- "The built-in lifecycle" is deferred to a prior article and never
  enumerated.
- No containment or cardinality among spec, plan, task.
- No failure or rollback semantics, no artifact versioning, no roles.

## Verdict (reviewer agent)

The article contributes a taxonomy of artifact levels and a
layered-precedence governance pattern, and is evidence by omission on
states: an enterprise-readiness article that names no spec, plan, or
task status. Any concrete status model must be imported or invented;
the extension layers will not conflict with one.
