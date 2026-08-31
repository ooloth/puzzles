---
updated: 2026-08-30
update_when: a document is added to or removed from docs/
decays: slow
status: active
---

# Start here

A web app for solving grid logic puzzles, paired with its own generation pipeline.
Full context: [problem.md](problem.md).

## What's in here

| Path                            | What you'll find                        |
| ------------------------------- | --------------------------------------- |
| [decisions/](decisions/)        | Choices already made, and why           |
| [guarantees/](guarantees/)      | Promises to players we must never break |
| [questions/](questions/)        | Open questions, one per file            |
| [standards/](standards/)        | What correct work looks like here       |
| [architecture](architecture.md) | Where code lives and what calls what    |
| [constraints](constraints.md)   | Limits from browsers, networks and law  |
| [glossary](glossary.md)         | Domain terms and their code names       |
| [gotchas](gotchas.md)           | Non-obvious traps in this codebase      |
| [problem](problem.md)           | Who this is for and what success means  |
| [unfinished](unfinished.md)     | Code that's mid-change or misleading    |
| [verification](verification.md) | How to run the system and check changes |

## Where a new fact goes

Three of these are easy to confuse:

- Can't change it → [constraints](constraints.md)
- Chose it, could choose otherwise → [decisions/](decisions/)
- Promised it, and breaking it is our bug → [guarantees/](guarantees/)

A constraint forces a decision; a decision commits us to a guarantee; a guarantee is only
real once something checks it.

## Conventions

- Every file's frontmatter carries `update_when` — the event that obligates a change to it.
- `decays: fast` means the content describes now and expires. Verify before trusting.
- Docs are for what can't be executed. If it can be a type, a lint rule, or a test — make it
  that, and link to it from here.
- Before treating any entry as finished, ask what a sharp reader with none of this context
  would immediately push back on — and check the entry already answers it.
- No tables except short lookups whose rows don't wrap. Prose and lists everywhere else.

## Not part of this structure

- [`@legacy/`](@legacy/) — the previous docs layout, kept for reference. Not authoritative.
- [`brainstorming/`](brainstorming/) — unfiltered thinking. Nothing here is decided.
