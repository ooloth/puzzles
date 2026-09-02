---
number: 0006
status: accepted
date: 2026-09-01
---

# 0006 — One language across every deployable

## Forced by

**[ADR-0005](0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md) puts the puzzle
rules in one module that more than one deployable uses.** The client checks legality as a player
types; the generator checks it while producing puzzles. Both import the same module.

**A module imported by two programs is written in a language both of them run**, unless it is
compiled into something neither of them is written in — which is the option this record rejects, and
which has to be rejected here rather than assumed away.

**[../problem.md](../problem.md) ranks clarity over cleverness because one person maintains this**,
and names the maintainer losing interest as the top project risk in
[ADR-0002](0002-launch-with-sudoku-then-star-battle.md). Every additional toolchain is a second set
of build failures, a second dependency story and a second set of habits, paid by one person.

## Decision

**Every deployable in this project is written in the same language.** The client, the generator, and
a server if there is one.

**The reason is the shared rules module and nothing else.** A deployable that never touches the rules
could in principle be written in anything, and this record still covers it — because the cost being
avoided is a second toolchain for one maintainer, not a technical incompatibility.

**Which language is [ADR-0007](0007-that-language-is-typescript.md).** This record settles that
there is one, which is a different question and the one that has to be answered first: the argument
for sharing source rather than compiling an artifact is what makes any single language mandatory, and
it holds whichever language wins.

## Rejected

- **Share the rules as a compiled artifact, and let each deployable pick its own language.** The
  serious alternative, and the one that makes this a real decision rather than a formality: compile
  the rules to WebAssembly, and the client can be TypeScript while the generator is Rust or Go. The
  rules module is pure computation — it touches neither the DOM nor storage — so the usual objections
  to WebAssembly in a browser do not apply to it.

  It loses because the marshalling sits on the interactive path rather than in a batch job.
  [ADR-0005](0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md) puts the client
  and the generator on the same engine, and [../constraints.md](../constraints.md) records a player
  making a discrete input every one to three seconds, so board state crosses the boundary constantly
  rather than occasionally. What the arrangement buys is generator speed, and
  [../problem.md](../problem.md) has already declined to want it: the interactive path outranks batch
  throughput, and generation may be as slow as it needs to be.

- **A different language per deployable, with the rules reimplemented in each.** Rejected at
  [ADR-0005](0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md) rather than
  here. Two implementations of one ruleset disagree eventually, and the disagreement surfaces as a
  player being told a legal move is illegal.

- **Decide it per deployable, as each one is built.** The honest "not yet". It fails on the same
  ground the portable decision-making standard names for any deferred structural
  choice that narrows everything downstream without announcing it: by the time a second deployable
  exists, the first has a toolchain, and matching it is no longer a decision but an accommodation.

## Risk

**The right tool for the generator may not be the right tool for a browser.** Puzzle generation is
search — the one part of this system where a faster language would genuinely show — and this record
rules out using one. The defence is `../problem.md`'s ranking, which is a stated preference rather
than a measurement, and
[how expensive is puzzle generation?](../questions/how-expensive-is-puzzle-generation.md) is
unanswered. If generation turns out to be far more expensive than expected, this is the record that
made it awkward to fix.

**One language means one ecosystem's failure modes, everywhere.** A weakness in the language chosen
by [ADR-0007](0007-that-language-is-typescript.md) is inherited by every deployable at once, with no
part of the system unaffected. That is the cost of the simplification, and it is not recoverable
without reopening this.

**It reaches a server that does not exist yet.**
[ADR-0010](0010-the-store-needs-a-host-so-this-system-has-a-server.md) establishes that one will, and
this constrains what runs on it before
[what execution shape does the server have?](../questions/what-execution-shape-does-the-server-have.md)
has been worked. An edge runtime that only executes one language would satisfy this by accident
rather than by fit.

## Revisit when

- **Generation is measured and found to be the binding cost**, per
  [how expensive is puzzle generation?](../questions/how-expensive-is-puzzle-generation.md). A batch
  process that runs for hours is the one case where a second toolchain pays for itself.
- **A deployable appears that has no relationship to the rules and no relationship to the client** —
  an operational tool, say. The cost this avoids is a second toolchain, so a deployable that would
  not add one is outside the reason for this record.

## Also update

- [x] Nothing in `constraints.md` — this imports no facts about the world
- [x] Nothing in `guarantees/` — this promises a player nothing

Deliberately not decided here: which language, what runs it outside the browser, what the package
manager is, and whether the server needs the rules at all.
