---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Are hints in scope?

## Why it matters

A technique-aware hint system — naked singles, hidden pairs, X-wing — has been sketched in
passing and even used as an argument in stack discussions, but has never been stated as
something the product actually does.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Hints require a solver that can explain its steps, not merely decide the puzzle has one
solution.** Also the bundle cost accepted in
[ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md): until hints ship, the
client carries solving code it does not run.

**The maintainer intends to ship hints, after the core solving interface is solid.** This is a
statement of intent rather than a decision: it settles that hints are wanted, not which techniques
they cover, how they are surfaced, or whether they appear in v1. Recorded from the maintainer.

> So the client eventually needs the solver, not only legality and completeness checking. That
> shrinks the cost accepted in ADR-0004 from permanent dead weight to deferred weight, and it means
> the client's share of the rules module converges with the generator's rather than staying a
> subset.

**The intended shape is technique-driven, offering the easiest available technique first — hints
that solve the way a person does, methodically and by named technique.** Recorded from the
maintainer, who describes it as something they have not seen elsewhere. This is a much larger claim
than "hints exist".

It also names a distinction the word "solver" hides. A **decision procedure** answers whether a
board has exactly one solution, and backtracking search answers that well while saying nothing about
how a person would get there. A **human-method engine** enumerates the techniques that apply at the
current board state — naked single, hidden pair, X-wing — and orders them by difficulty. Only the
second can produce a hint of this kind, and a puzzle it cannot solve by technique alone is one that
requires guessing, which [../guarantees/puzzles.md](../guarantees/puzzles.md) already forbids.

> So the generator needs both: the decision procedure to check uniqueness, and the human-method
> engine to confirm the puzzle is reachable by deduction and to grade it. The client needs the
> human-method engine for hints. They are two capabilities in one module rather than one capability
> shared, and both have to agree about what a legal board is.

> So the client's share of the rules module is not a subset of the generator's — it converges with
> the hardest part of it. The technique engine is the expensive component, and both consumers need
> the same one.

**A hint system and difficulty grading are the same judgement made twice.** Grading a puzzle means
deciding which techniques it requires. Hinting means telling a player which technique applies next.
Both rest on the same two things: detecting applicable techniques, and ordering them by difficulty.
Two implementations of that ordering would let a puzzle graded as needing only simple techniques
offer a hint the grade said would never be needed, with nothing surfacing the contradiction — the
silent-disagreement failure [ADR-0005](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md)
exists to prevent.

> So a technique difficulty ordering is needed for hints whether or not a grade is ever shown to a
> player. That is an input to
> [is difficulty graded?](is-difficulty-graded-and-does-a-grade-promise-anything.md), which can
> answer "grades promise the player nothing" while the ordering still has to exist.
