---
opened: 2026-08-31
status: open
resolves_into: decision
---

# Is there one implementation of the puzzle rules?

## Why it matters

[../guarantees/puzzles.md](../guarantees/puzzles.md) promises every puzzle has exactly one
solution and is reachable by deduction alone. Two implementations of the rules can disagree about
whether a board satisfies that, and when they do **nothing surfaces the disagreement**. The
generator concludes it produced a sound puzzle; the client concludes the player is looking at an
unsound one; both behave correctly by their own lights. A promise that can be broken with no error
anywhere is not one this project keeps by intending to.

## Blocked by

N/A — settled. [ADR-0003](../decisions/0003-this-is-delivered-over-the-web.md) chose web delivery,
so "browser" is the right constraint and the argument has its force: one language must serve both a
browser and a batch process. Ready to work on now.

## Blocks

[Which language do the deployables share?](which-language-do-the-deployables-share.md), which
exists only if this resolves to yes.

## What would settle it

Very little beyond the platform question. The argument below is complete and was not what made
the record unsafe.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Demoted from ADR-0005 on 2026-08-31, as part of unwinding a chain of decisions recorded above
their own foundations.

## Options

*One implementation, shared.* Grid representation, legality, solving and uniqueness checking
written once and used by everything that needs them. Two things need them today: the **generator**
cannot produce a puzzle without them, and the **client** needs them to recognise a completed board
and to give feedback on a move.

*Two implementations kept in agreement by differential testing.* The strongest rejected option:
it frees each deployable to use whatever suits it, and property-based differential testing is a
real mitigation rather than a hopeful one. Its cost is an obligation with no end date, it only
protects the cases someone thought to generate, and it has to be built before it protects
anything.

*No rules on the client at all.* Rejected in the record because the client could then not tell a
player a digit conflicts or that a board is finished, and could not work with no network at all.

## Findings

**A correction to how this record was read.** A review on 2026-08-31 suggested that an app which
never flags a wrong move would barely need the rules on the client, weakening the case. That is
wrong: recognising a completed board means checking that it is full and satisfies the constraints,
which *is* the rules. The client needs the module either way. Only the sentence in the record
citing conflict-flagging as the reason needs rewriting.

**One implementation means one place to be wrong.** Shared code concentrates correctness as well
as effort — a subtle error in uniqueness checking is wrong in the generator and the client
identically, removing the accidental cross-check two implementations would have given. This is why
the uniqueness property deserves testing directly rather than by agreement between components.

**How the sharing happens is a second decision.** Sharing by source means one language everywhere.
Sharing a compiled artifact means an interop boundary and, in a browser, a WebAssembly bundle on
the initial load. That is [its own question](which-language-do-the-deployables-share.md).

**A portable standard points the same way.** A value derivable from one source should not be
maintained separately alongside it, and the rules of sudoku are that kind of value: there is one
right answer to whether a board is legal.
