# Superseded consolidation approach

Independent review found that the open consolidation pack's approach still
names the rejected docs/specs root and that its wiki approval paragraph reads
a revision-15 observation as current state.

T-6 preserves the exact revision-23 JSON as an archived snapshot before changing
the open pack. The relocation map points the original source path to that
snapshot, retaining its original hash. The live pack receives a supersession
annotation and a new revision; decisions, approval, task evidence, and closure
are unchanged. Closed initiative packs remain byte-identical.

Verification: the migration verifier checks all 321 originals, current source
references, snapshot versus live owner/evidence fields, the new supersession
annotation, active discovery, and the current library handoff.
