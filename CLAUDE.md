# Puzzles

This will evolve eventually into an app serving logic puzzles (think grid-filling games like
sudoku, star battle, etc) plus a pipeline for generating them. The site will eventually have
users whose progress must be reliably saved and restored.

The stack and codebase layout is currently being decided, which is why nothing is installed yet.

## Decisions

**Before any technical decision, read `docs/questions/README.md`.** It is the ordered queue of
decisions still to be made, each naming what it derives from. Make the next one whose inputs are
answered — not the one you happen to be near. If what you need to decide rests on something
nobody has asked, write that question and work it instead; a decision recorded above its own
foundations reads as reasoned for months and has already had to be undone four times here.

**Before prioritising anything, read `docs/problem.md` and `docs/guarantees/` in full.** They
answer more than the open questions imply.

See `docs/standards/decisions.md` for instructions regarding building from foundational
decisions upwards.

## Key docs

Index and conventions: `docs/README.md`. Keep this table in step with the one there.

| Path                   | What you'll find                        |
| ---------------------- | --------------------------------------- |
| `docs/decisions/`      | Choices already made, and why           |
| `docs/failure-modes/`  | Ways it can fail, and whether we'd know |
| `docs/guarantees/`     | Promises to players we must never break |
| `docs/questions/`      | Decisions not yet made, in order        |
| `docs/standards/`      | What correct work looks like here       |
| `docs/architecture.md` | Where code lives and what calls what    |
| `docs/constraints.md`  | Limits from browsers, networks and law  |
| `docs/glossary.md`     | Domain terms and their code names       |
| `docs/gotchas.md`      | Non-obvious traps in this codebase      |
| `docs/problem.md`      | Who this is for and what success means  |
| `docs/unfinished.md`   | What's mid-change and would mislead you |
| `docs/verification.md` | How to run the system and check changes |

Proactively read and update these files as you go. Be sure to read `docs/unfinished.md` before
extending any existing pattern — it records where the codebase might currently mislead you.

Code here is also governed by a portable set of engineering standards kept outside the repo; see
`docs/standards/README.md` for what they cover and where they live.

`docs/@legacy/` and `docs/brainstorming/` are archival. Nothing in either is authoritative.
