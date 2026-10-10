# BusinessRule

- [A concept path must never escape the bundle root](rule-concept-paths-stay-in-bundle.md) - Every write and resolution of a concept path checks bundle containment — symlinks and hostile ids cannot move writes outside the wiki, even through parent traversal.
- [A declined finding is never re-proposed; terminal states are immutable](rule-declined-findings-immutable.md) - The findings ledger refuses proposals at a declined (source, destination, kind) key, and accepted/declined findings can never change state again — the suggestion box cannot be worn down.

# Domain

- [The specpack status vocabulary: one table, machine-maintained](specpack-status-vocabulary.md) - Every status a specpack carries or reports: level, statuses, who sets them, stored or reported, terminality. Complete packs are read-only reference for future loops.
- [The wiki contract — bundle rules every harness repo follows](wiki-contract.md) - The concrete rules an okf wiki bundle follows: location, state dir, freshness stamp, findings ledger, managed vs curated sections.

# Pattern

- [The anti-waterfall loop — bounded artifacts, interleaved work](pattern-anti-waterfall-loop.md) - The SDD loop pattern: knowledge first, then the smallest analysis/design that unblocks the next slice; uncertainty recorded as a deliverable; unblocked work proceeds while questions run.
- [Content hashes drive change detection everywhere](pattern-content-hash-change-detection.md) - Every extracted artifact carries a sha256 of the bytes it came from — modules, rule candidates, freshness stamps — so change detection is always byte-comparison, never timestamps.

# Policy

- [The engine never captures sessions, transcripts, or tokens](policy-no-session-capture-in-engine.md) - Hooks, session capture, and token accounting are a declared non-goal of the okf engine — knowledge comes from repositories, not from surveilling agent runs.
