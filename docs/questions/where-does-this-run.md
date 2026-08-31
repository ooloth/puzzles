---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Where does this run?

## Why it matters

Previously settled and now reopened. If the client owns state, the persistent-local-disk
requirement that disqualified several platforms may no longer apply, which puts them back in
contention.

## Blocked by

[where puzzle state lives](does-puzzle-state-live-on-the-client-or-the-server.md) and
[what the server stores](what-does-the-server-store-if-anything.md). Don't decide this one
first — it was decided first last time.

[Are puzzles generated ahead of time or on demand?](are-puzzles-generated-ahead-of-time-or-on-demand.md).

## Blocks

[how much downtime is acceptable](how-much-downtime-is-acceptable.md),
[what the acceptable running cost is](what-is-the-acceptable-running-cost.md), backup and
recovery approach.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

Finding drawn from legacy ADR-03 (use SQLite as the data store).

## Options

...

## Findings

SQLite on a local disk is what disqualified the serverless platforms considered previously —
they offer no persistent filesystem, so a database file has nowhere to live. That disqualification
is contingent on a data-store choice nobody has made: see
[what does the server store](what-does-the-server-store-if-anything.md). If the server turns out
to need less than a database, the platforms ruled out on this basis come back into contention
before pricing is even discussed.
