---
opened: 2026-08-30
status: open
resolves_into: decision
---

# How much downtime is acceptable?

## Why it matters

A single machine has no hardware redundancy, and backups protect data, not availability.
Accepting that is entirely reasonable for a project this size — but it should be accepted
explicitly, with a tolerable outage length attached, rather than discovered during one.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

Finding drawn from legacy ADR-12 (host on Fly.io).

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Backups cover data loss, not downtime.** Restoring from a backup returns the data and says nothing
about how long the app was unreachable while it happened. Accepting no redundancy is reasonable at
this size; accepting it without naming a tolerable outage length is how the number gets discovered
during an outage instead.

**The redundancy claim below it was arrangement-specific and was stated as though it were general.**
It read: "A single machine with a single volume has no hardware-failure redundancy, and that is
equally true of a bare VPS and of a managed platform — neither gives redundancy without paying for
it." That describes one arrangement — a process and its store sharing a machine — accurately, and
approximately describes an always-on container with a network store. It does not describe a
scale-to-zero container or ephemeral functions, where compute is rescheduled across instances by the
platform and the store is a separately hosted service rather than a volume under the same machine.

The error was collapsing "the machine running our process" and "the machine holding our data" into
one object, which is true of only one candidate, and then generalising a conclusion drawn from it.

> So this question cannot be answered before the store arrangement is, and the entry that assumed
> otherwise is why it looked answerable. What remains true regardless: no arrangement gives
> redundancy without paying for it, and none of them names a tolerable outage length for you.

*Reasoned — corrected 2026-09-02 while enumerating failure domains across the four candidate
arrangements. That question is resolved and deleted; the per-arrangement comparison now sits in the
Findings of
[what execution shape does the server have?](what-execution-shape-does-the-server-have.md).*

**Fly.io states the single-volume case in its own words**, for whichever arrangement ends up on one:
"If your app needs a volume to function, and the NVMe drive hosting your volume fails, then that
instance of your app goes down. There's no way around that." Volumes are not replicated among
themselves, and Fly's own docs say daily snapshots "shouldn't be your primary backup method."

*Sourced — [fly.io/docs/volumes/overview](https://fly.io/docs/volumes/overview/), read 2026-09-02.*
