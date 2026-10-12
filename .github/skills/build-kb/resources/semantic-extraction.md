# Domain rules and logic from source

Inspect guards, state transitions, validators, schemas, authorization checks,
algorithms, and the tests that exercise them. The current harness does not supply
a `code rules` scanner or a concept-template command. Use source inspection or an
available external extractor; candidate syntax alone establishes no domain claim.

Group related observations by the domain idea rather than by every function.
Distinguish:

- **BusinessRule:** an evidenced domain constraint and its enforcement points.
- **EncapsulatedLogic:** an algorithm, preconditions, guarantees, and failure cases.
- **Pattern:** an evidenced recurring structure, with its actual instances.
- **Policy:** a constraint on future work, whose acceptance must be explicit.

Read each enforcement point and representative tests before describing behavior.
Record the entity or state involved, inputs, allowed transitions, errors, and
affected callers. Keep inferred domain meaning separate from observed code.
Use existing vocabulary or mark unknown intent; a guard can be a technical check
rather than a business rule.

Author descriptive pages in the existing domain section. Cite source paths and
observed lines; attach revisions or hashes when needed. For harness concepts,
use normal frontmatter and `sources`, then verify with the supported CLI forms
in [cli.md](cli.md).

Existing enforced behavior can be documented as current behavior. A proposal
that binds future work remains `status: draft`; propose it through the findings
ledger when available. Acceptance and declined-key rules remain human authority.
Do not convert a descriptive observation into an accepted policy.

During refresh, recheck changed enforcement points, related schemas, state
definitions, and callers. Keep previous decisions intact and link evidenced
changes through chronological records.
