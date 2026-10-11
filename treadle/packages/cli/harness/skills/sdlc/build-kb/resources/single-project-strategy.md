# Single-project strategy

Read the entry points, manifests, existing documents, important tests, and
configuration. Trace a representative user or library operation from its caller
through the component and its external interactions. Use the coverage contract;
a fixed number of pages does not establish completeness.

Suggested topics, adapted to the existing knowledge structure:

- Product purpose, users, capabilities, and the domain vocabulary.
- System boundary, entry points, internal responsibilities, and runtime topology.
- Inbound consumers, outbound dependencies, and exchanged contracts.
- Domain entities, interface and event contracts, storage, and important flows.
- Operations and evidenced decisions, linked to chronological navigation.

A library can have public symbols and consumers without REST routes or a
database. A command-line tool can use files rather than tables. Record those
distinctions instead of inventing infrastructure to fill a template.

Use existing documents as evidence and preserve their authority. Mark partial
access or unknown context explicitly. Keep changes bounded to the requested
knowledge pass; initial documentation does not require an engine code index.
