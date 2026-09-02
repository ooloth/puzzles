---
opened: 2026-09-01
status: open
resolves_into: decision
---

# What is a puzzle, across game types?

## Why it matters

It is the one thing every part of the system touches. The generator produces it, the database stores
it, the server holds a copy, the rules module operates on it, and the client renders it.
[ADR-0004](../decisions/0004-one-implementation-of-the-puzzle-rules.md) committed to one
implementation of the rules without saying what shape those rules operate on.

**It is also the decision that forces deletion when it is wrong.** A framework can be swapped by
rewriting the interface. A representation that assumes a nine-by-nine grid of digits cannot: adding
star battle then means migrating every stored puzzle, every player record, the generator's output,
the rules module and the client at once.
[Which doors must stay open?](which-doors-must-stay-open.md) names exactly this as the threat, and
[ADR-0001](../decisions/0001-launch-with-sudoku-then-star-battle.md) guarantees a second game type
arrives.

Sudoku and star battle differ in ways a naive model hides. Sudoku is a fixed square grid with digits
and three constraint families. Star battle has irregular regions whose boundaries are part of the
puzzle, a variable star count, and adjacency rules. A model that fits both is not obviously the same
as a model that fits either.

## What would settle it

Writing the representation for sudoku and for star battle, and seeing what is genuinely shared
rather than assuming. This is cheap to prototype and expensive to guess, which makes it a candidate
for building rather than deciding on paper.

The useful test is a third game type nobody has planned for — see
[which games come after sudoku and star battle?](which-games-come-after-sudoku-and-star-battle.md).
A model that fits two is often a model that fits two.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-01, on noticing that no question asked what the rules module in ADR-0004 operates on,
while several downstream questions described moving and storing it.

## Options

*One generic model.* Cells, regions, constraints, and a game type naming which rules apply. Every
game type is data. Costs generality nobody may need and a model harder to reason about than either
concrete one.

*Per-type models with a shared envelope.* Each game type defines its own shape; a common wrapper
carries identity, type and versioning. Storage and transport are generic, the domain is not.

*Sudoku only, generalised when the second type arrives.* **Ruled out** by
[ADR-0010](../decisions/0010-nothing-about-a-puzzle-is-inferred-from-it-being-sudoku.md). It was the honest "not
yet" and the cheapest thing available now, and the migration it risks reaches client storage, where
migrations run once in somebody's browser with no server to retry from.

The two options above both satisfy ADR-0010, which settles what a shape may not assume and nothing
about what it should contain. Choosing between them is still this question's job.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**[Is puzzle state a snapshot or an event log?](is-puzzle-state-a-snapshot-or-an-event-log.md) and
[what crosses the client/server boundary?](what-crosses-the-client-server-boundary.md) both
describe the movement of something this defines.** [Which client storage
mechanism?](which-client-storage-mechanism.md) takes its volume and shape inputs from here.

**Nothing is recorded yet.** The representation has never been written down in any form.
