---
name: new-project
description: This skill is used when starting a new project. This is specifically used to scaffold a greefield project. The goal of this skill is to get the shape of your project right. Trigger "Create a new Project". The skill will interview and grill the user to get product details, okr, audience to get the functional and techincal shape accurate.
---

CLI examples below use `do` and `know` subcommands. Prefix them with the installed
harness executable; check its `--help` output or use the documented Node entry.

## Roadmap handoff

When the user requests product sequencing or a roadmap, pass the known product
context to `roadmap`. Read its `resources/new-project-handoff.md` when available.
Include the audience, problem, objectives, smallest useful product, exclusions,
constraints, capacity, dependencies, actual decisions, and unresolved questions.
Reference the source conversation or artifacts. Mark missing inputs as unknown.
Reuse prior answers; do not repeat the product interview.
If the skill is unavailable, provide the same context as a written handoff.
Roadmap selection does not authorize scaffolding or implementation.
