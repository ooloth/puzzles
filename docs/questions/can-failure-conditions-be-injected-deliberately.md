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
