# Documentation coverage contract

Account for each area below. Adapt the page layout to the repository; these are
coverage requirements, not mandatory directories or one page per code symbol.

| Area              | Questions the knowledge must answer                                                                                                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product context   | What purpose, users, capabilities, journeys, constraints, and domain vocabulary do product evidence establish?                                                                                        |
| Related documents | Which briefs, requirements, READMEs, architecture records, interface specifications, runbooks, and migration records exist? Which are authoritative, dated, historical, or in conflict?               |
| Architecture      | Where is the system boundary? What are the components, responsibilities, entry points, deployment units, and important request and data flows?                                                        |
| Dependencies      | Who calls or consumes this component? Which providers does it call or depend on? What contracts, ownership, versions, and failure behavior are evidenced?                                             |
| Domain entities   | What identifies each entity? What are its lifecycle, relationships, invariants, and enforcement points?                                                                                               |
| Interfaces        | What are the REST routes, RPC operations, public library interfaces, CLI commands, or other boundaries? What inputs, outputs, authentication, errors, compatibility rules, and callers are evidenced? |
| Events            | Who produces and consumes each event? What are its channel, payload, version, delivery behavior, retries, ordering, and idempotency guarantees?                                                       |
| Storage           | What tables, collections, files, or caches exist? What are their fields, keys, relationships, constraints, migrations, and read or write paths?                                                       |
| Operations        | How do configuration, build, tests, deployment, diagnostics, and recovery work?                                                                                                                       |
| History           | Which dated changes and decisions explain the observed evolution? Where are their evidence and current explanations?                                                                                  |

Give each area a result: **evidenced**, **absent**, **inaccessible**, **unresolved**,
or **not applicable**, with a source or reason. Use these results in the knowledge
coverage page or the pass report; they are not executable task states or concept
`status` values. Record a partial result with its actual extent and open gaps.
Do not silently omit a required area because its evidence is missing.

## Relationships and contracts

Define dependency direction relative to the documented component. An inbound
caller or consumer depends on the component; an outbound provider supplies it.
Prefer named roles and arrows when upstream or downstream terminology is ambiguous.

For each important relationship, record the endpoints, direction, exchanged
contract, evidence, and accessible side of the boundary. A manifest dependency
does not prove a deployed integration. A source import does not identify every
runtime consumer. Record external ownership only when evidence supplies it.

Keep domain entities separate from REST resources, event payloads, and persisted
models. Link their mappings. For example, a domain order can have an HTTP
representation, a creation event, and a database row with different fields.
Trace representative flows through those mappings and their invariants.

## Sources and current explanations

For document sources, record the path or accessible URL, authority, source date
when known, and relation to current code. Preserve original documents rather than
copying them into a new competing authority. Note explicit supersession.

For code sources, cite observed paths and lines, plus revision or dirty source
hash when material. Tests support specific behavior; test success does not prove
every product claim. Mark inferred explanations as inferences.

For harness bundles, use frontmatter `sources` resources and inline repository
paths for source evidence. Markdown links to other Markdown files are concept
edges and must stay in the bundle; an existing source document outside it can
otherwise be reported as a broken link. Preserve and cite that source without
turning it into an out-of-bundle concept edge. Other formats can use their own
source-link conventions.

Use current topic pages for the system readers work with today. Link source
documents, related concepts, flows, and [chronological records](chronological-records.md).
Choose diagrams when they explain interactions more clearly than prose.
Never invent entities, delivery guarantees, product users, owners, or decisions
to complete the matrix.
