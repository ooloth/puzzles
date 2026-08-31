This will evolve eventually into a web app, serving logic puzzles (think grid-filling games like
sudoku, star battle, etc).

So, two overall concerns: a delightful UI / app for solving puzzles; and a clever pipeline
generating puzzles that are a joy to solve. The site will eventually have users whose progress
must be reliably saved and restored.

The stack is being reconsidered from first principles. Nothing about it is settled:
`docs/questions/` tracks what's still open, and `docs/decisions/` is empty until those are answered.

## Current priorities

1. Make good decisions about overall scaffold, including tech stack and feedback loops
2. Establish great documentation patterns, with useful docs referenced in lookup tables in the
   right places
3. Choose the simplest stack that can robustly achieve the project's UX goals without unnecessarily
   complicating maintenance for a solo maintainer

## Key docs

Index and conventions: `docs/README.md`. Keep this table in step with the one there.

| Path                   | What you'll find                        |
| ---------------------- | --------------------------------------- |
| `docs/decisions/`      | Choices already made, and why           |
| `docs/guarantees/`     | Promises to players we must never break |
| `docs/questions/`      | Open questions, one per file            |
| `docs/standards/`      | What correct work looks like here       |
| `docs/architecture.md` | Where code lives and what calls what    |
| `docs/constraints.md`  | Limits from browsers, networks and law  |
| `docs/glossary.md`     | Domain terms and their code names       |
| `docs/gotchas.md`      | Non-obvious traps in this codebase      |
| `docs/problem.md`      | Who this is for and what success means  |
| `docs/unfinished.md`   | Code that's mid-change or misleading    |
| `docs/verification.md` | How to run the system and check changes |

Read `docs/unfinished.md` before extending any existing pattern — it records where the codebase
would currently mislead you.

`docs/@legacy/` and `docs/brainstorming/` are archival. Nothing in either is authoritative.
