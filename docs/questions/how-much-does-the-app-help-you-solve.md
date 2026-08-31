---
opened: 2026-08-31
status: open
resolves_into: decision
---

# How much does the app help you solve?

## Why it matters

At one end the app is a tool: it flags a digit that conflicts, keeps candidate marks current as
you eliminate, and offers a nudge when you stall. At the other it is a surface: it takes input
and gets out of the way, exactly as paper does, and being wrong is something you discover
yourself. Both are real products with real audiences, and the difference is not a setting bolted
on later — it decides what the interface is.

It also reaches further into the stack than it looks.
[ADR-0005](../decisions/0005-one-implementation-of-the-puzzle-rules.md) justifies putting the
puzzle rules on the client by saying the client must "tell a player their move conflicts and
recognise a completed board". The second half survives any answer here; **the first half is this
question**. An austere app needs completion detection and little else, which weakens the forcing
ADR-0005 rests on — and
[ADR-0006](../decisions/0006-typescript-everywhere-with-the-rules-shared-as-source.md) was forced
by ADR-0005 in turn. Two decision records sit above an unanswered product question.

## Blocked by

N/A — nothing needs to be answered first. It is a product choice, not a derivation.

## Blocks

What the interface has to do, and therefore
[what interactions must the grid support?](what-interactions-must-the-grid-support.md),
[are hints in scope?](are-hints-in-scope.md) and
[is undo in scope, and how far back?](is-undo-in-scope-and-how-far-back.md) — each of which is a
fragment of this one. Also what state exists per cell, which reaches
[is puzzle state a snapshot or an event log?](is-puzzle-state-a-snapshot-or-an-event-log.md) and
every storage question below it.

## What would settle it

A stated intent, then a played prototype. The intent is cheap and should come first, because it
is a taste question about the kind of thing being made rather than a finding. Playing it is what
catches the answer being wrong.

Worth being explicit that the two ends are not equally safe defaults. Assistance is much easier
to add later than to remove: a player who has been told when they are wrong for a year will
experience its removal as a loss. Starting austere and adding help preserves the option; starting
helpful and withdrawing it does not.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-08-31 while working backward from stack choices to the product truths they rest on.
It was the shortest path from "which language" to something nobody had asked.

## Options

*Austere.* Input goes in, nothing is checked, completion is recognised. Closest to paper, cheapest
to build, and the client barely needs the rules.

*Assistive on request.* Nothing is flagged until the player asks — a check button, a reveal. Keeps
the solve honest while making the app useful when someone is stuck. The rules run on the client
but only when invoked.

*Assistive by default.* Conflicts highlighted as they are entered, candidates maintained
automatically. What most mainstream sudoku apps do. Most work, most opinionated, and the hardest
to walk back.

*Configurable.* Defer by making it a setting. Attractive and usually a trap: it doubles the
interaction surface, and the default still has to be chosen, which is this question again.

## Findings

...
