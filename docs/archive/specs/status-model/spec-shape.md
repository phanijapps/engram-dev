# The codified spec-section shape

Research output, 2026-10-09. Sources: Atlassian user stories (3 C's; the story and its AC are one unit), GitHub Spec Kit templates/spec-template.md (stories P1-P3 with Independent Test and Acceptance Scenarios; FR-NNN plain MUST; Success Criteria; Assumptions; Edge Cases), Kiro docs (EARS, phases, human gates).

```json
{
  "why": "The problem, in two sentences: who hurts, how, and what changes when this ships.",
  "stories": [
    {
      "id": "US-1",
      "title": "one line, the story named",
      "as": "WHO",
      "want": "WHAT",
      "so": "WHY",
      "priority": "P1",
      "independent_test": "How to test this story alone; per Spec Kit, P1 alone must be a viable MVP.",
      "acceptance": [
        {
          "id": "AC-1",
          "given": "initial state",
          "when": "action",
          "then": "observable outcome"
        }
      ]
    }
  ],
  "edge_cases": [
    "boundary and error conditions, plain sentences"
  ],
  "requirements": [
    {
      "id": "FR-1",
      "text": "The system MUST one capability, RFC-2119 wording.",
      "serves": [
        "US-1"
      ]
    }
  ],
  "success_criteria": [
    {
      "id": "SC-1",
      "text": "A measurable outcome, not a restatement of a requirement."
    }
  ],
  "constraints": [
    {
      "id": "CON-1",
      "text": "A hard limit."
    }
  ],
  "questions": [
    {
      "id": "Q-1",
      "question": "An open question.",
      "status": "open",
      "owner": "human:owner"
    }
  ],
  "assumptions": [
    "Stated beliefs the spec depends on."
  ],
  "out_of_scope": [
    "Explicit exclusions."
  ]
}
```

## Rules

- Acceptance criteria live on the story (Atlassian Confirmation; Spec Kit Acceptance Scenarios). A story is done when its ACs are met by done tasks.
- Requirements are plain MUST statements with no scenarios; each serves at least one story.
- Priority lives on the story (P1 alone must be a viable MVP; Spec Kit).
- Success criteria are measurable outcomes at the feature level (Spec Kit SC-NNN).
- Old packs keep requirement.scenarios (legacy, valid, never canonical for new authoring).
