# Brief: owner control from requirement to completed delivery

Declared problem: the agent implemented design choices before the owner accepted
them. Later browser approval left an evidenced loop active. The owner wants an
explicit flow through brief, spec, design decisions, task start, implementation,
and independent red-foreman review.
Source: owner-flow.md; bug-owner-gates.md; probe.json.

Outcome: owner acts control execution; task completion and delivery are distinct.
The browser explains the current gate and offers the corresponding owner action.
Implementation executes the approved task sequence without repeated approval
for each task. New decisions and amended scope return to the owner.

Scope: versioned machine gates, CLI and browser acts, the review surface, and the
four SDD skills. Closed records remain frozen. Existing documentation decisions
are neither accepted nor closed by this work.

The concrete contract and acceptance scenarios are proposed in spec.md.
The design and task plan require owner acceptance and start permission.
