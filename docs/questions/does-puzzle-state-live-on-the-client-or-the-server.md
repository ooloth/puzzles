---
opened: 2026-08-30
status: open
---

# Does puzzle state live on the client or the server?

**Why it matters** This determines almost every other technical choice. Two guarantees —
instant feedback under any network condition, and staying interactive through minutes of no
connectivity — both require the client to act without a round trip.

**Gates** [what renders the client](what-renders-the-client.md),
[what runs the server](what-runs-the-server-and-in-what-language.md),
[what the server stores](what-does-the-server-store-if-anything.md),
[where this runs](where-does-this-run.md),
[snapshot or event log](is-puzzle-state-a-snapshot-or-an-event-log.md).

**Options so far**

*Client-first, server as sync target.* Satisfies both guarantees by construction. Costs a
real client application and a sync mechanism to build and maintain.

*Server owns state.* One place for logic and a simpler client, but a server round trip is
required for every state change. That fails the offline guarantee by construction — and it's
a property of the whole category, not of any particular framework.

**Bearing on this** Puzzle logic — generating, solving, validating — should be pure and
deterministic: no clock, no I/O, and randomness only from an explicit seed. Pure logic runs
anywhere, so it doesn't constrain this choice by itself, but it does remove one argument
commonly made for server ownership: keeping the rules in a single trusted place. A pure module
is a single trusted place regardless of where it executes.

**Settled by** Possibly already settled by `problem.md` and `constraints.md` as written.
Worth confirming deliberately rather than assuming it fell out.
