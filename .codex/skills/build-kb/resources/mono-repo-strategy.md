# Monorepo and multiple-root strategy

Start with workspace manifests and build configuration. Identify packages,
services, shared contracts, deployment units, and external systems. Do not infer
a runtime service boundary from a package directory alone.

Use the existing repository knowledge home for the system overview. Give each
important component a linked account of its role, public contracts, dependencies,
and entities. Keep cross-component contracts in a shared reading location rather
than duplicating conflicting descriptions in every package.

Read local READMEs and interface or migration records as well as central docs.
Trace representative interactions across package boundaries and deployment units.
Package imports establish code relationships; inspect configuration and runtime
calls for network, event, database, and operational relationships.

For each shared contract, identify its producers or providers and its callers or
consumers. Check both sides where accessible. Record unavailable external roots
as gaps rather than guessing their behavior. For a small set of repositories,
identify the root in every evidence location and preserve each root's authority.
Do not create an unrequested coordinating repository.

Apply the coverage contract at system level and at important component boundaries.
For refresh, trace changed shared contracts into affected consumers and their
documentation. A root-level change can affect more than the package that contains
the edited file. Report the extent actually inspected and unresolved consumers.

Optional external graphs can help find cross-package relationships. Verify their
claims against sources and record their source revision or content snapshot.
There is no built-in managed code-index pass in the current harness.
