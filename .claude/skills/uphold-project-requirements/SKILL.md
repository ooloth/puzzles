---
name: uphold-project-requirements
description: Load relevant project-level decisions, guarantees and standards and apply them to the current task. ALWAYS invoke before ANY technical decision, design, documentation or code change.
---

## Your task

1. Read (or re-read) `docs/guarantees/README.md` and `docs/standards/README.md` to understand the framing and tier definitions
2. List (or re-list) `docs/decisions/`, `docs/guarantees/` and `docs/standards/`. In the first two,
   every filename states what is binding — a decision by what it settled, a guarantee by the promise
   it makes — so the listings are checklists you filter rather than folders you read. Run
   `rg -l 'kind: non-promise' docs/guarantees/` too: those files exist to stop a promise being
   inferred where none was made, and they are invisible if you only read the ones that promise
   something
3. Read (or re-read) all files with a theme that may be relevant to the current task
4. If you notice a gap in the decisions, guarantees or standards guidance that would help you with
   your task, feel free to mention what should be added (if no gap, say nothing)
5. Proactively uphold all prior decisions and current guarantees and proactively apply the standards
   to your task
