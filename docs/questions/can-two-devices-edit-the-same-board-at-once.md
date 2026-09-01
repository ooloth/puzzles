---
opened: 2026-08-31
status: open
resolves_into: decision
---

# Can two devices edit the same board at once?

## Why it matters

It is the line between a merge and a collaboration system. If two devices never hold the same
board open simultaneously, divergence is rare, per-cell and last-writer-wins is sufficient, and
reconciliation is a few hundred bytes of timestamps. If they can, the problem becomes concurrent
editing with all that implies — intention preservation, causal ordering, and a class of
correctness bug that only appears under real-world timing.

The gap in cost is large enough that assuming the answer either way is expensive. Assuming no
means shipping a merge that silently mangles a case that does happen. Assuming yes means building
machinery for a case that never does.

## What would settle it

Deciding whether it is *possible* and whether it is *supported*, which are different questions
often collapsed into one.

A single player can leave a board open on a phone, pick up a laptop, and edit the same puzzle —
nothing prevents it, so it is possible whatever we intend. What is open is whether the app
behaves correctly when it happens, or whether it is allowed to produce a confusing result on the
grounds that the player did something unusual.

The honest test is what a player would experience in the case: not whether the data structure is
theoretically sound, but whether the board they see afterwards makes sense to them.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-08-31, on finding this ruled out permanently in a sentence of
[../problem.md](../problem.md) that also carried a positive scope claim. Ruling something out
forever is a decision, and this one had never been argued — least of all against the fact that the
app cannot prevent it.

## Options

*Not supported, and it cannot happen.* Only defensible with an explicit lock — one device holds
the board, others are read-only until it releases. Requires a server, adds a failure mode when the
holding device disappears, and would break the offline promise the moment the lock cannot be
reached.

*Not supported, and it can happen anyway.* What the design currently assumes. Divergence is
merged per cell, last writer wins, and the rare simultaneous case produces a board neither device
displayed. Cheapest, and it accepts that the rare case is handled crudely rather than correctly.

*Supported, with per-cell merge.* The same machinery, but the case is treated as normal rather
than as an edge. The difference is not in the code so much as in what is tested and what is
promised.

*Supported, with a convergent replicated data type.* Correct under any interleaving, and
substantially more machinery than a grid of independent scalars warrants.

## Findings

**A sudoku board is unusually forgiving of the naive answer.** Roughly 81 independent scalar
values, no ordered lists, no counters, no text spans. Last-writer-wins per cell does the right
thing for every case except two devices editing *the same cell*, which is a much narrower target
than "editing the same board".

**The strongest general objection to last-writer-wins does not apply here.** It is usually raised
against counters and ordered collections, where a lost update changes meaning rather than one
value. Neither exists in this data.

**Two known bad outcomes survive whatever is decided**, both recorded in
[what does the server do with puzzle state?](what-does-the-server-do-with-puzzle-state.md): a
merged board can hold progress from both devices and be a state neither ever displayed, and a
naive merge can reintroduce a value the player deliberately cleared.

**Ruling it out does not prevent it.** No option except an explicit lock stops a player opening
the same puzzle twice, and the lock costs the offline guarantee. So "out of scope" here can only
mean "not handled well", never "cannot occur" — and saying so plainly is what this question exists
to force.
