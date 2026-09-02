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

## Where work lives, and where thinking lives

**Work is GitHub Issues in this repository.** One issue per delivery slice, grouped by a GitHub
milestone matching M1, M2 and so on. The title is the slice's observable and the definition of done
is that the observable is true. The tracker is where you read what exists and what state it is in.

**Thinking is `docs/`.** `docs/questions/README.md` holds why each slice exists, what it rests on and
which questions block it. `docs/decisions/` holds what has been settled and why.

**Neither restates the other.** No reasoning in an issue — an issue that turns out to need a decision
stops and points at the question. No status in the docs — no checkboxes, no "in progress". The slice
title appears in both as the join key, and where they disagree the tracker is right about what work
exists and the docs are right about why.

**Which one to open, by what you are doing:**

- Deciding what to work on next, or why something is blocked → `docs/questions/README.md`
- Building the thing you already chose → the issue
- Wondering why a slice exists, or what it rests on → `docs/questions/README.md`
- Recording that something is done, or how far along it is → the issue
- Answering a question → `docs/decisions/`, then update `docs/questions/README.md`

**Before opening an issue, check the slice exists in `docs/questions/README.md`.** If it does not,
either it is not a slice or that file is behind — and the second is the more likely, since work tends
to get invented at the keyboard.

Set by [ADR-0015](docs/decisions/0015-the-issue-tracker-is-github-issues.md) and
[ADR-0016](docs/decisions/0016-a-delivery-slice-is-an-issue-and-its-derivation-stays-in-docs.md).

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
| `docs/guarantees/`     | Promises to players we must never break, one per file |
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
