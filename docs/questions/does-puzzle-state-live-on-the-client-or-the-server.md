---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Does puzzle state live on the client or the server?

## Why it matters

This determines almost every other technical choice. Two guarantees — instant feedback under
any network condition, and staying interactive through minutes of no connectivity — both
require the client to act without a round trip.

## Blocked by

N/A — nothing needs to be answered first.

## Blocks

[what renders the client](what-renders-the-client.md),
[what runs the server](what-runs-the-server-and-in-what-language.md),
[what the server stores](what-does-the-server-store-if-anything.md),
[where this runs](where-does-this-run.md),
[snapshot or event log](is-puzzle-state-a-snapshot-or-an-event-log.md).

## What would settle it

Possibly already settled by `problem.md` and `constraints.md` as written. Worth confirming
deliberately rather than assuming it fell out.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

Findings drawn from legacy ADR-01 (render with server-driven hypermedia).

## Options

*Client-first, server as sync target.* Satisfies both guarantees by construction. Costs a
real client application and a sync mechanism to build and maintain.

*Server owns state.* One place for logic and a simpler client, but a server round trip is
required for every state change. That fails the offline guarantee by construction — and it's
a property of the whole category, not of any particular framework.

## Findings

Puzzle logic — generating, solving, validating — should be pure and deterministic: no clock, no
I/O, and randomness only from an explicit seed. Pure logic runs anywhere, so it doesn't
constrain this choice by itself, but it does remove one argument commonly made for server
ownership: keeping the rules in a single trusted place. A pure module is a single trusted place
regardless of where it executes.

Legacy ADR-01 argued that a hypermedia framework's local signals can do zero-round-trip drag and
keyboard interaction without giving up server-owned state — that "instant feel" and "server-owned
state" are not actually in conflict. That claim is about interaction *latency*, and the offline
argument against server-owned state is about state *persistence*. Both can hold at once: local
signals could make a drag feel instant while the board still can't be played in a tunnel. This
question has to answer the persistence half on its own terms rather than treating the latency
argument as settling it.

Both of ADR-01's rejections rested on preference rather than evidence. Hybrid islands were
rejected partly for breaking a "no custom JS" goal, and a client-heavy application for abandoning
"the server-owned-state philosophy the project wants from v1". Neither is a constraint, and the
pivot reverses that philosophy — so the option now favoured was never evaluated on its merits,
only excluded by a premise that has since been dropped.
