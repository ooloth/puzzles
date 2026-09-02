---
opened: 2026-09-01
status: open
resolves_into: decision
---

# What crosses the client/server boundary?

## Why it matters

The API shape and the database shape are usually decided together and then discovered to disagree.
Naming what actually moves — and in which direction, and how often — is what stops that.

Several things are already fixed and they constrain this more than it looks.
[ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) makes the client
authoritative, so nothing crossing this boundary is a request for permission.
[../guarantees/offline.md](../guarantees/offline.md) means every crossing is opportunistic and
nothing waits on one. And [../constraints.md](../constraints.md) records that iOS gives web apps no
background execution and no reliable session-end hook, so **the only moment anything can be sent is
while the app is on screen**, fire-and-forget.

## What would settle it

Listing each thing that moves, its direction, its trigger, and its size. A player makes an input
every one to three seconds while solving, per `../constraints.md`, so the difference between sending
each one and sending a batch on `visibilitychange` is three orders of magnitude in request volume.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-01 while separating what a server holds from what it does, on finding that no
question described the traffic between them.

## Options

*Whole-record replacement.* The client sends its current state; the server stores it. Simplest, and
it makes divergence between two devices a last-write-wins problem.

*Deltas or events.* The client sends what changed. Smaller, orders naturally, and pairs with an
event log if
[that is what state is](is-puzzle-state-a-snapshot-or-an-event-log.md). More moving parts and
requires the server to apply them in order.

*Whole record up, deltas down*, or the reverse. Worth considering because the two directions have
different frequencies and different failure costs.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Payload size is not the constraint; connection setup is.** `../constraints.md` records that a
fresh connection costs three to four round trips before any payload moves, that a degraded link
sits at or below the 2g tier, and that mobile radios are expensive to wake. So the design pressure
is toward few, batched crossings rather than small ones.

**A crossing that fails must not become visible.** `../guarantees/offline.md` allows the interface
to show that something is pending, and forbids the network blocking, delaying or interrupting play.
A failed send is retried later or dropped; it is never surfaced as an error the player must act on.

**A server answering in HTML fragments narrows [ADR-0003](../decisions/0003-this-is-delivered-over-the-web.md)'s
native recovery path to a webview wrapper.** ADR-0003 names wrapping this web client in a native
shell as what keeps the web choice reversible. A server that returns markup for the client to insert
can only be consumed by something that renders HTML, which forecloses every non-webview native
client.

**The client state layer exists regardless of what crosses this boundary.**
[ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) already puts authoritative
state on the client for latency and offline reasons. A hypermedia-style crossing would add a second
rendering path on top of that layer rather than remove the one that already exists.

**[../guarantees/offline.md](../guarantees/offline.md) requires the client to render a board it
already holds.** A server that returns markup for the client to insert is a server the client cannot
do without, which the offline guarantee rules out regardless of what shape this boundary settles on.

**Deciding this now would bind with no server, no schema and no endpoint in existence.** Nothing
here has been designed yet, so an early answer constrains a thing that does not exist. That gap is
exactly why the previous attempt to settle this — naming JSON specifically — was withdrawn rather
than kept.

**Naming one serialisation format specifically would also rule out formats the same reasoning
allows.** A binary or schema-first format would satisfy client-authoritative, offline-first
reasoning as well as JSON does; picking JSON by name would foreclose them on convenience rather than
necessity.
