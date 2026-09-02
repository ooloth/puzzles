---
number: 0004
status: accepted
date: 2026-08-31
---

# 0004 — One implementation of the puzzle rules

## Forced by

**[../guarantees/puzzles.md](../guarantees/puzzles.md) promises every puzzle has exactly one
solution and is solvable by deduction alone, and records that both are enforced by nothing.** They
are assertions today. Whatever eventually enforces them is code that decides whether a board is
legal, whether it is complete, and whether its solution is unique.

**Two implementations of that code can disagree, and the disagreement produces no error anywhere.**
The generator concludes it has produced a sound puzzle. The client concludes the player is looking
at an unsound one. Both are behaving correctly by their own lights, and neither is in a position to
notice the other. A promise that can be broken with nothing raised anywhere is not one this project
keeps by intending to.

**[ADR-0002](0002-the-client-holds-and-mutates-puzzle-state.md) put puzzle state on the client, and
[../guarantees/offline.md](../guarantees/offline.md) promises play continues with no connection.**
So the client cannot delegate these judgements. It holds them locally or it cannot tell a player
their board is finished.

## Decision

One implementation of the puzzle rules, used by everything that needs them.

"The rules" covers grid representation, legality of a move or a board, completeness, and two
distinct solving capabilities. A **decision procedure** answers whether a board has exactly one
solution; backtracking search does this well and says nothing about how a person would get there. A
**human-method engine** enumerates the techniques that apply at a given board state and orders them
by difficulty. Both belong here, and both must agree about what a legal board is — which is the
whole reason they share a representation rather than each carrying their own.

Two consumers need it. The **generator** needs all of it — it cannot produce a puzzle without
solving and uniqueness checking. The **client** needs legality and completeness now, and the
technique engine once hints ship.

The client's eventual share is larger than it first appears. The intended hint system offers the
easiest available technique first — hints that solve the way a person does — which needs the
human-method engine rather than the decision procedure. See
[are hints in scope?](../questions/are-hints-in-scope.md). The generator needs that same engine to
confirm a puzzle is reachable by deduction and to grade it, so the two consumers converge on the
most expensive part of the module rather than overlapping at its edges.

That convergence is a second instance of the failure above. A hint ranking and a difficulty grade
computed by different code would let a puzzle graded as needing only simple techniques offer a hint
the grade said would never be needed, with nothing raised anywhere.

This does not decide *how* the sharing happens. Sharing by source means one language everywhere;
sharing a compiled artifact means an interop boundary and, in a browser, a WebAssembly bundle on
first load. That is [0005](0005-typescript-across-every-deployable-rules-shared-as-source.md), and this record
is the constraint it inherits: the rules must run in a browser and in a batch process, from one
source.

## Rejected

- **Two implementations kept in agreement by differential testing.** The strongest rejected option,
  and not a straw one — property-based differential testing is a real mitigation rather than a
  hopeful one, and it frees each deployable to use whatever suits it. Rejected because the cost is
  an obligation with no end date, because it only protects the cases someone thought to generate,
  and because it protects nothing until it is built. The freedom it buys has no use here: there is
  one maintainer and no second team wanting a different language.

- **No rules on the client at all.** The client renders a board and reports moves; everything is
  judged elsewhere. Rejected because recognising a completed board means checking that it is full
  and satisfies the constraints, which *is* the rules — so the client needs them even in a version
  of the product that never flags a wrong move. ADR-0002 and the offline guarantee then rule out
  asking anyone else.

- **Decide when the generator is built.** Deferring costs nothing today, since nothing is
  implemented and a single client implementation is trivially the only one. Rejected because
  [0005](0005-typescript-across-every-deployable-rules-shared-as-source.md) has no input without it — the
  question of which language the deployables share only exists if something is shared — and 0005
  gates every remaining client decision. Deferring this defers the stack.

## Risk

**One implementation is one place to be wrong.** Shared code concentrates correctness as well as
effort: a subtle error in uniqueness checking is wrong in the generator and the client identically,
which removes the accidental cross-check two implementations would have given. The uniqueness
property therefore needs testing directly — against its definition, with generated inputs — rather
than by agreement between components. This is a real loss and the mitigation is not free.

**The client will carry the technique engine before it runs it.** A module serving both consumers
puts technique detection and difficulty ordering into a browser bundle that has no caller until
hints ship. This is the module's most expensive component, not an incidental extra, so the cost is
larger than "a solver in the bundle" suggests. Hints being intended rather than hypothetical makes
it deferred weight rather than permanent dead weight, and the mitigation — splitting the module so
consumers take only what they call — is a structuring choice available at any time. It is weight in
the meantime.

**This constrains 0005 more than it looks.** The language must run in a browser and in a batch
process from one source, or produce an artifact portable to both. That rules out choosing a language
for the generator on the generator's merits alone.

**It creates a shape that must stay general.**
[ADR-0001](0001-launch-with-sudoku-then-star-battle.md) sequences star battle after sudoku, and
[which doors must stay open?](../questions/which-doors-must-stay-open.md) names a data model that
hard-codes a nine-by-nine grid of digits as the threat. A shared rules module is exactly where that
mistake would be made once and inherited everywhere.

## Revisit when

- **A deployable needs the rules in a context where sharing is impossible** — a platform with no
  path to the chosen language or artifact. The web-only scope in
  [ADR-0003](0003-this-is-delivered-over-the-web.md) makes this unlikely while it holds.
- **The unused solver's contribution to the client bundle is measured and found to matter** before
  hints ship. This is a reason to split the module by export, not to keep two implementations.
- **A second maintainer joins with a standing reason to work in another language.** The freedom the
  rejected option buys becomes worth something at that point.

## Also update

- [x] Nothing in `constraints.md` — this imports no new facts about the world
- [x] Nothing in `guarantees/` — `puzzles.md` still records both promises as enforced by nothing.
      This decision makes enforcement possible in one place rather than two; it does not enforce
      anything, and no code exists yet.

Deliberately not decided here: which language, whether the sharing is by source or by compiled
artifact, how the module is split between its consumers, and whether hints ship in v1.
