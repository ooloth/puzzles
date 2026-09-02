---
opened: 2026-09-01
status: open
resolves_into: decision
---

# Can failure conditions be injected deliberately?

## Why it matters

[../constraints.md](../constraints.md) records several failures that will not happen in ordinary
testing: a write that fails and misidentifies its own cause, IndexedDB absent entirely under
Lockdown Mode, a connection that stalls for seconds during cell-tower handoff while still
reporting as connected. Each of these is a real path through the code, and none of them will
execute unless something forces it to, because they depend on conditions — a specific OS setting,
a specific radio state — that a development machine on office wifi never produces.

A path that never executes in testing is a path whose first real run is in front of a player. This
asks whether these conditions can be simulated or injected on demand, so the code that handles
them gets exercised before it matters — including by an agent verifying a fix for one of these
failures without needing the physical device and network conditions that produced it.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-01, extending the maintainer tooling milestone past the loops that were already
obvious.

## Options

**Deterministic simulation testing.** Replay the whole system against a seeded schedule of events
and failures, so a run that finds a bug can be reproduced exactly rather than chased as a flake.
This is a large commitment, usually reserved for databases and distributed systems where the cost
is justified by the blast radius of getting it wrong. Whether it fits a single-player puzzle app,
where the state machine is far smaller, is the open part.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**TigerBeetle's VOPR stubs out every source of non-determinism, then runs the whole cluster in one
process against mocked I/O.** "All non-deterministic parts of the system are stubbed out. This
includes the clock, network, and disk operations." It injects dropped and reordered packets,
partitions, corrupt reads and writes, and crashes.

*Sourced — TigerBeetle internals docs,
https://github.com/tigerbeetle/tigerbeetle/blob/main/docs/internals/vopr.md.*

**A failing run is reproducible from two numbers.** "When a simulation causes any type of failure, the
seed and Git commit hash can be used to replay back the exact simulation and bug."

*Sourced — same as above.*

**The precondition is what transfers here, not the harness.** The logic under test has to be a pure
deterministic function of `(state, event)`, with the wall clock, randomness, network and disk pushed
to the edges as injected arguments. For a hand-rolled sync reconciler, writing the merge step as
`(state, event, seed) -> state'` with no `Date.now()` and no I/O inside it buys replayable bug reports
and offline fuzzing over reordered, dropped and duplicated events.

*Reasoned — an inference from the VOPR's design, not a claim TigerBeetle makes about applicability
outside their own system.*

**A VOPR-grade harness is not worth building here.** It is a multi-person-year investment reserved for
a distributed database. The part that fits a solo maintainer is much smaller: a seedable pure reducer
plus a fuzzer over event orderings.

**Time-compression figures for the VOPR and its FoundationDB lineage could not be verified.** The
source blog post 404'd during this research. No numbers from it should be repeated here.

*Unverified — no source recorded.*
