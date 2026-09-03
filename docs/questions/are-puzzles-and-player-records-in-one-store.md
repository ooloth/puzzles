---
opened: 2026-09-02
status: open
resolves_into: decision
---

# Are puzzles and player records in one store?

## Why it matters

Two records establish two bodies of server-side data without saying whether they live together.
[ADR-0009](../decisions/0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md) puts a
durable per-player record off the device.
[ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md) puts puzzle
content behind a runtime that can decide whether to serve it. They have almost nothing in common:
the catalogue is written rarely by the generator and read by everyone, and the player record is
written constantly by one player and read by that player.

**Whether this is an input to
[what execution shape does the server have?](what-execution-shape-does-the-server-have.md) depends on
how that question lands, which is why the milestone it belongs to is not yet fixed.** It was filed at
M1 on the strength of one claim: that a store the process opens as a file pins the generator to the
server's machine. That holds if the generator writes puzzles into the same file, and not if the
catalogue is somewhere it can reach over a network. So this matters at M1 only in the branch where
the store is a local file — and in that branch it matters a great deal, because it decides whether a
class of hybrid arrangement exists that nothing has enumerated: a local file for one body of data and
a network service for the other.

In the other branch it is an M3 question and nothing at M1 waits on it. The Findings below record
that reasoning; until a record settles the branch, this file stays where the more demanding of the
two readings puts it.

It also decides where a join happens, and that is the part most likely to be discovered late.

## What would settle it

Naming what each body of data is for, who writes it and how often, and — the part that discriminates
— whether any question anyone wants to ask has to read both at once.

Worth checking rather than assuming: whether
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md)'s requirement
applies equally to both. It says "anything the server stores", which reads as covering the catalogue
as well as the player record, and a catalogue that only ever needs fetching by key would otherwise be
a candidate for something much simpler.

This cannot be deferred past M3, because that milestone writes the first row and reads it back, and
a row has to be written somewhere.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-02, during the foreclosure analysis on
[what execution shape does the server have?](what-execution-shape-does-the-server-have.md). The
claim that an embedded store pins the generator to the server's machine turned out to rest on this,
and nothing asked it.

## Options

*One store, holding both.* Joins are a query rather than application code. One thing to operate, one
backup, one schema to keep coherent. The generator must be able to reach whatever the server's store
is, which is the coupling that matters if that store is a file.

*Two stores.* Each is sized, deployed and operated on its own terms, and the catalogue can be
read-mostly and cached hard. Any question spanning both becomes application-level work, and there are
two things to back up and two schemas to keep in step.

*One store, split later if a reason appears.* Cheapest now and honest about what is unknown. The cost
of being wrong is a migration of whichever half moves, at a point where both halves have data in
them.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

### The questions already committed to require reading both

**Every example [ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md)
gives spans the two bodies.** It names "which puzzles get finished, where players stall, and whether
a difficulty grade predicts anything" as questions that must be answerable without a migration. Each
one reads play data and puzzle metadata together — a difficulty grade is a property of the puzzle,
and whether it was finished is a property of the play.

> So separating the stores does not remove that requirement, it relocates it. The join has to happen
> somewhere, and application-level joins across two services are the version most likely to be
> written badly and slowly, by one person, later.

*Reasoned — per the examples in
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md), read
2026-09-02.*

### What it changes about the execution shape field

**A "two stores" answer creates hybrid cells nobody has enumerated.** The field in
[what execution shape does the server have?](what-execution-shape-does-the-server-have.md) crosses
process lifetime with a single store locality. If there are two stores, they can have different
localities — a player record in a network service and a catalogue served from files on disk, or the
reverse — and the foreclosure analysis for each cell would need redoing.

**It is the difference between the generator being pinned and being free.** A generator writing to a
network-attached catalogue can run anywhere, including a laptop.
[ADR-0006](../decisions/0006-one-language-across-every-deployable.md) already names a second
toolchain as the cost it exists to avoid, and being pinned to the server's machine is a related cost
arriving by a different route.

*Reasoned — from the records named.*

### What is not yet known

**Nothing has established what the catalogue actually holds**, and
[what is a puzzle, across game types?](what-is-a-puzzle-across-game-types.md) is open until M3 for
the minimum and M7 for the whole answer. A store decision that assumes a shape which has not been
argued would be resting on an inference.

**This question's urgency is entirely borrowed, and it can be given back.** It was raised at M1
because of one claim — that a store opened as a file pins the generator to the server's machine — and
that claim only exists in the local-file world. Settle
[what execution shape does the server have?](what-execution-shape-does-the-server-have.md) toward a
store reached over a network and the pinning disappears, the hybrid arrangements it warned about stop
existing, and nothing at M1 needs this answered. It then belongs at M3, where the first row is
written and where the catalogue's shape is argued.

> So the two questions are not circular, though they look it. This one is downstream. It was
> promoted on the strength of a consequence that turns out to hold in only one branch.

*Reasoned — 2026-09-02, on re-examining why this was filed against M1 at all.*

**Nothing has established how often the catalogue is written.** That depends on
[is there one puzzle a day, or unlimited play?](is-there-one-puzzle-a-day-or-unlimited-play.md) and
[are puzzles generated ahead of time or on demand?](are-puzzles-generated-ahead-of-time-or-on-demand.md),
both open. A catalogue written once a day and a catalogue written per request are different
problems.
