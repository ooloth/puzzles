---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Is puzzle state a snapshot or an event log?

## Why it matters

Shapes the sync protocol, how undo works, and what "the same board" means when two copies have
to be reconciled.

## What would settle it

Writing both for one board and seeing which is smaller. The pair that matters is applying a move and
restoring from cold, and the honest comparison includes undo, since
[how far back it goes](is-undo-in-scope-and-how-far-back.md) is what makes a log pay for itself or
not.

Two things to size while doing it: what a session's worth of actions costs in bytes under each, and
what replay costs at the upper end of a game's length. Both are cheap to measure and neither has
been.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Finding drawn from legacy ADR-11 (track progress via anonymous server-side sessions).

## Options

*Versioned snapshot with last-write-wins.* Small and simple; right-sized for roughly 81
independent scalar values.

*Event log.* Undo falls out for free and replay is cheap at 50-300 actions per game, but it
is more moving parts to build and keep correct.

*An event log adopted as part of [LiveStore](https://livestore.dev/)*, which builds on one and does
not offer the alternative. It is recorded as a candidate under
[which client storage mechanism?](which-client-storage-mechanism.md), where what it bundles and what
it costs are set out. It matters here because choosing it settles this question as a side effect
rather than on the merits below, and this question also constrains
[how far back undo goes](is-undo-in-scope-and-how-far-back.md). If the event log wins on its own
terms, that is an argument for LiveStore. The reverse is not an argument for the event log.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

The two options start from opposite defaults on derived state. An event log makes every visible
value — the current board, whether a puzzle is complete, how many cells remain — derived by
construction, because the log holds moves rather than conclusions. A snapshot stores the board
directly, and every additional value kept beside it is a second thing that can disagree with the
first.

That matters because deriving rather than storing is the default the portable standards prefer,
and denormalisation is the case that has to be argued. An event log satisfies it without effort;
a snapshot satisfies it as long as nothing accumulates around it, which is a discipline rather
than a property. See [../standards/README.md](../standards/README.md) for where those live.
