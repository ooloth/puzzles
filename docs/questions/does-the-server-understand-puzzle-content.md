---
opened: 2026-09-01
status: open
resolves_into: decision
---

# Does the server understand puzzle content?

## Why it matters

[ADR-0002](../decisions/0002-the-client-holds-and-mutates-puzzle-state.md) makes the client
authoritative over puzzle state, and
[ADR-0006](../decisions/0006-what-a-players-work-survives.md) makes a server hold a durable copy of
it. Neither says whether the server can read what it is holding.

The two ends are far apart. A **store** accepts whatever the client sends, keyed by player and
puzzle, and never looks inside — it cannot tell a board from a shopping list. A **participant**
knows what a board is, checks that what arrives has the right shape and types, and refuses what does
not. Everything in between is a choice about how much of the domain lives in two places.

It decides three things that are expensive to change later. Whether the puzzle rules run on the
server, which [ADR-0005](../decisions/0005-typescript-across-every-deployable.md) says forces the
server's language only if it needs them. Whether the database has a schema describing puzzles or a
column holding bytes. And what the client does when the server disagrees with it, which is where the
hard part is.

## What would settle it

Naming what the server would *do* with a rejection, and what the client would do with it in turn.
Validation that only logs is observability. Validation that refuses a write is a second authority
over state, which is what ADR-0002 exists to prevent.

The sharp case is not rejection but acceptance: the server stores something malformed and later
returns it to a client that will not accept it. See Findings.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-01 while working out what the server is for, on noticing that a decision record
already specifies how the server validates puzzle state without anything having established that it
can read it.

## Options

*A dumb store.* Bytes under a key. The server never parses puzzle content and cannot reject it. No
rules on the server, no schema describing puzzles, no second authority. Corruption written by the
client is stored faithfully and handed back.

*Shape and type validation only.* The server checks that what arrives is structurally a board of a
known game type — the right fields, the right types, plausible bounds — without judging whether the
position is legal or the solution correct. Catches a class of client bug and protects the database
from data it cannot describe. Requires a schema, not the rules.

*Full rules validation.* The server runs the rules module and refuses anything illegal. Requires the
rules on the server, which forces its language, and puts a second authority over state next to a
client that ADR-0002 made authoritative.

## Findings

**The failure mode is not a rejected write, it is an accepted one.** Recorded as
[the server hands back state the client will not accept](../failure-modes/the-server-hands-back-state-the-client-will-not-accept.md).
Whatever is decided here has to answer what the client does in that moment, because every option
above leaves some malformed state reachable — the dumb store by never checking, and the validating
options by checking against a version of the schema that was current when the data was written.

**Rejecting a write cannot be the answer on its own.** The client is authoritative and works
offline, so a write it cannot deliver is a write it keeps. A server that refuses one produces a
client holding state it cannot sync, indefinitely, with
[../guarantees/offline.md](../guarantees/offline.md) forbidding that from becoming the player's
problem.

**Validation and arbitration are different powers and only one is ruled out.** A previous record
concluded the server validates puzzle state but does not arbitrate it. Checking a shape is not the
same as deciding which of two boards is correct, and ADR-0002 forbids the second rather than the
first.
