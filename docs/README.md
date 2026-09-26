---
updated: 2026-09-19
update_when: this file's own content changes — a row is added to or removed from the table below
decays: slow
status: active
---

# Start here

A web app for solving grid logic puzzles, paired with its own generation pipeline.
Full context: [problem.md](problem.md).

## What's in here

| Path                             | What you'll find                        |
| -------------------------------- | --------------------------------------- |
| [decisions/](decisions/)         | Choices already made, and why           |
| [failure-modes/](failure-modes/) | Ways it can fail, and whether we'd know |
| [guarantees/](guarantees/)       | Promises to players we must never break, one per file |
| [invariants/](invariants/)       | What holds without exception, one per file |
| [questions/](questions/)         | Decisions not yet made, in order        |
| [standards/](standards/)         | What correct work looks like here       |
| [architecture](architecture.md)  | Where code lives and what calls what    |
| [constraints](constraints.md)    | Limits from browsers, networks and law  |
| [glossary](glossary.md)          | Domain terms and their code names       |
| [gotchas](gotchas.md)            | Non-obvious traps in this codebase      |
| [problem](problem.md)            | Who this is for and what success means  |
| [unfinished](unfinished.md)      | What's mid-change and would mislead you |
| [verification](verification.md)  | How to run the system and check changes |

## Read these two first

[problem.md](problem.md) and [guarantees/](guarantees/) are the inputs everything else is derived
from. Read both in full before deciding anything, before ranking what to work on, and before
concluding a question is open — several already have answers there. Knowing the files exist is not
the same as having read them, and the difference has cost this project real work.

## Decisions and questions are one system

[questions/](questions/) and [decisions/](decisions/) hold the same set of choices at two stages.
A question is a decision not yet made; a decision is a question answered. What matters is that
they are worked **in order**: [questions/README.md](questions/README.md) holds that order, with
each entry naming what it derives from. That file is too large to read in one pass, so find the
milestone you need with `grep -n '^## ' docs/questions/README.md` and read that section.

A decision recorded before the things it derives from are settled does not stay visible as a
guess. It becomes an assumption nobody remembers making, and it keeps looking right because the
reasoning built on top of it is sound. When a question turns out to rest on something nobody
asked, the move is to write that question and work it — never to answer the one in front of you
and hope.

## Where a new fact goes

**Answer this from the list below before asking anyone.** It covers every home in `docs/`, and each
line is the question that sorts a fact into it:

- Can't change it → [constraints](constraints.md)
- Chose it, could choose otherwise → [decisions/](decisions/)
- Not chosen yet, and something will be built on the answer → [questions/](questions/)
- Promised it, and breaking it is our bug → [guarantees/](guarantees/)
- Always true, and a player would never see it break → [invariants/](invariants/)
- A claim about work that a reviewer can mark true or false, with stated exceptions →
  [standards/](standards/)
- A way the system can fail, and whether we would know → [failure-modes/](failure-modes/)
- A trap in this repo that surprised you → [gotchas](gotchas.md)
- True for now and misleading until a change finishes → [unfinished](unfinished.md)
- How to run something and what correct looks like → [verification](verification.md)
- A domain word and its code name → [glossary](glossary.md)
- Where code lives and what calls what → [architecture](architecture.md)

The first five are the easiest to confuse. A constraint forces a decision; a decision commits us to
a guarantee; a guarantee is only real once something checks it. An invariant usually falls out of a
decision rather than being chosen, and the difference from a guarantee is who notices: a guarantee
is what a player would see break, an invariant is what only the system would.

**One thing learned often has several homes, each for its own reader.** A choice goes in a decision
record with its reasoning and rejected options. What it commits us to goes where that commitment is
checked: a promise to players in `guarantees/`, a rule for reviewers in `standards/`, a state that
misleads until finished in `unfinished`, a new way to run something in `verification`. Each home
links to the record rather than restating its reasoning. So the question is never only "which
file?" but "which readers now need to know, and where does each of them look?"

## Conventions

- Every file's frontmatter carries `update_when` — the event that obligates a change to it.
- `decays: fast` means the content describes now and expires. Verify before trusting.
- Docs are for what can't be executed. If it can be a type, a lint rule, or a test — make it
  that, and link to it from here.
- Before treating any entry as finished, ask what a sharp reader with none of this context
  would immediately push back on — and check the entry already answers it.
- No tables except short lookups whose rows don't wrap. Prose and lists everywhere else.

## Not part of this structure

- [`brainstorming/`](brainstorming/) — unfiltered thinking. Nothing here is decided.
