# Start here

<one line: what this repo is>. Full context: [problem.md](problem.md).

## The three kinds of truth

- **[constraints.md](constraints.md)** — true whether we like it or not.
  Test: would the *environment* break us?
- **[decisions/](decisions/)** — we chose it, reversible at a cost.
  Test: could we decide differently?
- **[guarantees.md](guarantees.md)** — we uphold it.
  Test: would violating it be *our* bug?

Chain: **constraint → forces → decision → promises → guarantee → enforced by → test.**
An ADR citing neither a constraint nor a user need was made on vibes.

## What's in here

| Path                            | What you'll find                        |
| ------------------------------- | --------------------------------------- |
| [decisions/](decisions/)        | Choices already made, and why           |
| [questions/](questions/)        | Open questions, one per file            |
| [architecture](architecture.md) | Where code lives and what calls what    |
| [constraints](constraints.md)   | Limits from browsers, networks and law  |
| [glossary](glossary.md)         | Domain terms and their code names       |
| [gotchas](gotchas.md)           | Non-obvious traps in this codebase      |
| [guarantees](guarantees.md)     | Promises to players we must never break |
| [problem](problem.md)           | Who this is for and what success means  |
| [standards](standards.md)       | Coding and documentation conventions    |
| [unfinished](unfinished.md)     | Code that's mid-change or misleading    |
| [verification](verification.md) | How to run the system and check changes |

## Conventions

- Every file's frontmatter carries `update_when` — the event that obligates a change to it.
- `decays: fast` means the content describes now and expires. Verify before trusting.
- Docs are for what can't be executed. If it can be a type, a lint rule, or a test — make it
  that, and link to it from here.
- Before treating any entry as finished, ask what a sharp reader with none of this context
  would immediately push back on — and check the entry already answers it.
- No tables except short lookups like the one above. See [standards.md](standards.md).

## Not part of this structure

- [`@legacy/`](@legacy/) — the previous docs layout, kept for reference. Not authoritative.
- [`brainstorming/`](brainstorming/) — unfiltered thinking. Nothing here is decided.
