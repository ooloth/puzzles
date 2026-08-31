---
opened: 2026-08-30
status: open
resolves_into: decision
---

# What load should the server handle?

## Why it matters

Every performance argument made so far has been made without a number — framework throughput,
generation cost, database write capacity. A stated load target turns those from opinions into
checks, and until one exists, no benchmark can be shown to matter or not matter.

It also decides *which* measurement is the relevant one. Throughput only becomes interesting
above some level of concurrency; latency at the tail is what a player experiences at any level,
because they feel the slow request rather than the average one. Choosing a target is what makes
that distinction concrete instead of rhetorical.

## Blocked by

[ADR-0002](../decisions/0002-the-client-holds-and-mutates-puzzle-state.md) settled that the client holds state, but
— the architecture decides whether one player input becomes one request or none.

## Blocks

[ADR-0006](../decisions/0006-typescript-everywhere-with-the-rules-shared-as-source.md),
[What does the server store, if anything?](what-does-the-server-store-if-anything.md),
[Where does this run?](where-does-this-run.md),
[What is the acceptable running cost?](what-is-the-acceptable-running-cost.md).

## What would settle it

Picking a concurrent-player target, then deriving a request rate from it using the input rhythm
already recorded in [../constraints.md](../constraints.md) and whichever sync model gets chosen.
The derivation is arithmetic once those two are known; the target is a choice.

## Resolves into

A decision record in [../decisions/](../decisions/). The derived figures then become facts in
[../constraints.md](../constraints.md).

## Source

Raised while migrating legacy ADR-05, which asserted that a framework's throughput advantage
"doesn't matter for an I/O-bound, low-traffic, SSE-heavy workload" without ever quantifying
low-traffic.

## Options

...

## Findings

**The input rhythm is the one solid input.** A player makes a discrete input — cell select, digit
entry, note toggle, undo — roughly every one to three seconds while actively solving. That is
recorded in [../constraints.md](../constraints.md) and is the basis any derivation would start
from.

**Whether an input becomes a request depends entirely on the architecture.** Under server-owned
state it is roughly one request per input per active player. Under a client-first design with
batched sync it is far fewer, and bursty rather than steady. The same audience produces request
rates that differ by orders of magnitude depending on a decision nobody has made.

**The audience expectation is not a number.** `problem.md` says a public v1 "found by a few
people, not many", which cannot be cited in a calculation. Turning it into a figure is a choice
about what to design for, and making that choice is most of this question.

**ADR-05's claim is plausible but unchecked.** It held that a 10-15% raw throughput difference
between two web frameworks "doesn't matter for an I/O-bound, low-traffic, SSE-heavy workload".
The conclusion may well be right; "low-traffic" was never quantified, so it isn't checkable, and
it shouldn't be repeated as established.

**Raw throughput may be the wrong measurement either way.** What a player notices is the slow
interaction, not the mean request rate, so tail latency is the figure that maps to the
experience. Under a batched-sync design the server's job is durable writes in bursts, where
contention and durability matter more than requests per second. Deciding what to measure is
downstream of the architecture, not of a benchmark table.

The same unquantified-scale pattern shows up in the progress model: recomputing whether a puzzle
is complete on every read was judged "fine at this project's scale", with the scale never stated.
The conclusion is probably right and is unverifiable as written.
