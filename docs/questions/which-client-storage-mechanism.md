---
opened: 2026-08-31
status: open
resolves_into: decision
---

# Which client storage mechanism holds a player's work?

## Why it matters

It is where the promises in [../guarantees/durability.md](../guarantees/durability.md) are actually
kept or broken, and it is the one stack choice with no clean migration path: changing it later means
moving every existing player's data with code that has to run in their browser, once, correctly.
A guest has no copy anywhere to restore from if that goes wrong.

Nothing has chosen a mechanism. IndexedDB is the reflex answer and gets named in passing often
enough to look settled.

## Blocked by

Volume, shape and lifetime, in that order, and all three are open.

[What can a player do with no network?](what-can-a-player-do-with-no-network.md) sets volume, and
the range is orders of magnitude. [Is puzzle state a snapshot or an event log?](is-puzzle-state-a-snapshot-or-an-event-log.md)
and [is undo in scope, and how far back?](is-undo-in-scope-and-how-far-back.md) set shape.
Lifetime is settled: [ADR-0006](../decisions/0006-what-a-players-work-survives.md) bounds a guest's
work at what the browser keeps and a signed-in player's at indefinitely, and requires both to be one
record shape so signing in promotes rather than converts. That shape requirement is a constraint on
any answer here.

## Blocks

[Which database, if any?](which-database-if-any.md) in part — if the client format is a blob the
server never reads, the server's store barely matters.

## What would settle it

The three answers above, then a table of the candidates against them: how much each holds, whether
it survives the platform's eviction, what it costs to query, and what it costs to get wrong. The
last column is the one that usually decides it.

A prototype writing and reading real board state on a real iPhone is worth more than any of it,
because the failure modes recorded in [../constraints.md](../constraints.md) do not reproduce on a
desktop browser.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-08-31, after the language record was found asserting an answer no question had asked.

## Options

*`localStorage`.* Synchronous, roughly five megabytes, string values only. What SudokuPad,
puzz.link and the New York Times games all use. Sufficient for one board and its history; not for
a cached archive. Its synchronous API is a real advantage — none of the rejected-write failure
modes below apply in the same way — and a real hazard, since it blocks the main thread.

*IndexedDB.* Asynchronous, large, structured, indexable. The default recommendation, and the
source of every storage failure recorded in `../constraints.md`.

*The Cache API.* Built for responses rather than records. A natural fit for cached puzzle content
even if player progress lives elsewhere, which makes this possibly not an either-or.

*Origin Private File System.* Newer, fast, and reached through a less-travelled path on WebKit.
Worth considering only if volume rules the first two out.

*SQLite compiled to WebAssembly, over OPFS.* Real queries on the client. Considerable weight on a
cold load, and it inherits the OPFS risks rather than escaping them.

*[LiveStore](https://livestore.dev/).* A local-first data layer rather than a storage mechanism:
SQLite in the browser, an event-sourced state model, reactive queries, and sync to a backend, as one
package. Named here so it is not overlooked, not because it is favoured.

Three things about it need weighing against this project specifically, and the first two are
independent of how good it is.

It is a **bundle**, so adopting it answers several open questions at once — this one, whether state
is [a snapshot or an event log](is-puzzle-state-a-snapshot-or-an-event-log.md), much of
[which database](which-database-if-any.md), and part of
[what the server holds](what-does-the-server-hold.md), since its sync backend is one. Those
answers may each be right, but a tool that supplies them is not an argument for them, and
[../standards/decisions.md](../standards/decisions.md) is about the order in which they are reached.
It is a candidate for this question once the others are settled, and a way of skipping them before.

It **sits across the storage boundary rather than behind it**.
[ADR-0003](../decisions/0003-this-is-delivered-over-the-web.md) names one narrow storage interface,
with a single implementation behind it and nothing reaching around it, as what keeps a native shell
cheap to add. A package that also owns reactivity and sync spans that line, so adopting it spends a
door that record deliberately holds open.

It carries **SQLite as WebAssembly**, which is weight on a cold load that
[../constraints.md](../constraints.md) already describes as several seconds of round trips before
any bytes move.
[ADR-0005](../decisions/0005-typescript-across-every-deployable.md) weighed bundle size against that
when rejecting a WebAssembly client, so adding a WebAssembly database needs an argument rather than
an exception.

What to establish when it is evaluated, none of which is recorded here yet: release status and
maintenance activity, measured bundle size, whether the sync backend is self-hostable or a hosted
service, the licence, and whether event sourcing is required or merely idiomatic.

## Findings

**A library is a separate and much smaller decision.** Whether to use `idb`, Dexie or nothing over
the chosen API is contained behind a persistence module and cheap to reverse, so it does not need
a record of its own.

**Two constraints already bound any answer.** Keys must be assigned rather than generated by the
store, because letting IndexedDB mint them triggers a live WebKit defect on iOS. And writes are
rejected in ordinary operation for reasons unrelated to quota, with error names that misreport the
cause — so the write path needs care under every option here. Both are in
[../constraints.md](../constraints.md).

**The obvious default may not be the right one.** IndexedDB is what everyone reaches for, and the
incumbent puzzle apps use `localStorage`. That is not decisive — none of them is offline-first in
the way this intends — but it is enough that the smaller option deserves a real hearing rather
than an assumption.
