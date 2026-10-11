# Optional graph evidence

An available code graph can help find symbols, callers, dependencies, and paths
across components. It complements source inspection and existing documents.

Check the installed tool's help and available integration before using it.
Use its supported query or extraction operations; do not assume a version,
command grammar, per-package merge feature, or language coverage. If no suitable
tool is available, continue with source searches and representative flow traces.
Installing a tool or changing its configuration is not part of this skill.

Record which repository roots and source revision or content snapshot the graph
covers. Check whether changed, new, renamed, or deleted files are represented.
A matching wiki HEAD stamp does not establish that the graph covers dirty files.

Verify important graph relationships against source. Import edges do not prove
runtime REST, event, database, or external-service relationships. Inspect those
contracts and their providers or consumers separately. Label ambiguous edges
and inaccessible roots as unresolved evidence.

Preserve generated artifacts according to the repository's rules. Cite the
underlying verified source in curated pages rather than relying only on an
ephemeral graph output. Do not hand-edit frozen `wiki/code/**` pages.
