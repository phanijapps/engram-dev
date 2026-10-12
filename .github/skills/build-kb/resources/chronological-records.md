# Chronological records

Keep current explanations by topic and provide a linked account of their
evolution. Follow existing repository history conventions. For a new ascending
chronological view, create a normal history concept, such as `project/history.md`,
and link dated changes and decisions from earliest to latest.

An OKF `log.md` has a different contract: ISO date groups in **newest-first**
order, without concept frontmatter. Preserve that order. An ascending history
concept and a scope log can link the same evidence without changing the log
format. Index pages enumerate linked concepts; they are not task ledgers.

## Entry evidence

For each entry, record the known event date, observation date, affected
components or contracts, factual change, source reference, and current pages.
Use a commit, release, migration, or decision reference when available. For
uncommitted observations, include the relevant source hash and state that the
change is uncommitted.

An observation date does not establish when a historical event occurred. Put
undated events in an explicit undated group and order them by observation date.
Preserve original document dates, and use dates with timezone or explicit date
precision where needed. Do not invent dates to make the sequence look complete.

A commit can establish changed source content. It does not establish the
author's intent, an accepted decision, owner approval, or a session experience.
Record rationale only from actual decision evidence. Mark inferred explanations
as inferences and keep them distinct from decisions.

## Retention and navigation

Link chronological entries to current topic pages and original evidence.
Keep accepted decisions and closed records intact. Corrections and new
conclusions use dated supplements or superseding records with reciprocal links
where appropriate. Historical sources remain historical; do not present their
old commands or architecture as current instructions.

Use existing history as evidence when it exists. Do not reconstruct
retrospectives from commits or task statuses. A retrospective needs actual
session observations or participant accounts. A chronological source-change
record does not require a fabricated retrospective.
