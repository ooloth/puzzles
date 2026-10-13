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
3. Read (or re-read) all files with a theme that may be relevant to the current task, including the
   sections of `docs/constraints.md` that bear on it. A slice in `docs/questions/README.md` no longer
   lists the records and constraints it rests on, so finding them is this step's job
4. **List every choice your task will make, and name the record or constraint that settles each one.**
   Include choices that look small and choices about local runs: a wiring detail, a default
   behaviour, what a page shows when something fails. For an issue, check each Ideal-state bullet,
   and each verification step once implementation writes the plan. Triage each choice you cannot
   trace to a record, per "When a choice surfaces mid-work" in `CLAUDE.md`. One that holds none of
   its three tests is decided on the spot, with the reason each test fails stated in the status
   report and the commit message. One that holds any test is an open question, however
   conventional its usual answer: **stop and follow that section** rather than recommending an
   answer and carrying on. An untraced choice presented as a recommendation reads as reasoned
   whether or not anything was reasoned.
5. If you notice a gap in the decisions, guarantees or standards guidance that would help you with
   your task, feel free to mention what should be added (if no gap, say nothing)
6. Proactively uphold all prior decisions and current guarantees and proactively apply the standards
   to your task
