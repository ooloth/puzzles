# Puzzles

This will evolve eventually into an app serving logic puzzles (think grid-filling games like
sudoku, star battle, etc) plus a pipeline for generating them. The site will eventually have
users whose progress must be reliably saved and restored.

The stack and codebase layout is currently being decided, which is why nothing is installed yet.

## Uphold requirements

Before designing, writing, or editing any code, documentation or decisions, invoke the
`uphold-project-requirements` skill. Re-invoke the skill repeatedly each time it applies (not just
once per session). Do not merely refer to your memory of the skill.

## Decisions

Before making any technical decisions or deciding which decisions to prioritize, invoke the
`make-next-decision` skill. Re-invoke the skill repeatedly each time it applies (not just
once per session). Do not merely refer to your memory of the skill.

Before prioritising anything, read `docs/problem.md` and `docs/guarantees/` in full. Everything
downstream is derived from them, and a sequence argued without them is argued from the wrong end.

## Handing over

Invoke the `prep-for-codebase-handoff` skill as a session nears its end, and before moving to a topic
unrelated to what came before. If the conversation has accumulated (or is about to accumulate)
multiple unrelated topics, **warn the user** and recommend cleaning up and starting a fresh session
rather than carrying the mixed context forward.

The handoff prep skill uses parallel subagents to scan for known sources of staleness and drift that
can't be programmatically detected. It also sends a fresh agent into the repo with no briefing to
report its impressions of what it found confusing or misleading.

By ensuring the codebase is in an easily understood state (particularly its docs) before handing it
off, all future visitors benefit from prompt resolution of stale and confusing states and claims.
In contrast, one-off handoff narratives would allow those risks to linger unresolved.

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

Code here is also governed by a portable set of user-level engineering standards kept outside the
repo; see `docs/standards/README.md` for what they cover and where they live.
