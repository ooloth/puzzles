---
opened: 2026-08-30
status: open
resolves_into: decision
---

# How much downtime is acceptable?

## Why it matters

No candidate arrangement gives hardware redundancy without paying for it, and backups protect data
rather than availability. Accepting that is entirely reasonable for a project this size — but it
should be accepted explicitly, with a tolerable outage length attached, rather than discovered during
one. How much redundancy is even in question depends on the arrangement, which is why this cannot be
answered before the store's shape is.

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

*Reasoned — 2026-09-02, from the failure-domain enumeration across the four candidate arrangements
that [ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) reasons from.*

**Fly.io states the single-volume case in its own words**, for whichever arrangement ends up on one:
"If your app needs a volume to function, and the NVMe drive hosting your volume fails, then that
instance of your app goes down. There's no way around that." Volumes are not replicated among
themselves, and Fly's own docs say daily snapshots "shouldn't be your primary backup method."

*Sourced — [fly.io/docs/volumes/overview](https://fly.io/docs/volumes/overview/), read 2026-09-02.*

**An outage does not stop play, and it does stop everything else.** This is the finding that makes
this question a product question rather than an operational one. Solving continues, because
[ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) puts the board on the
client and four promises describe the app working while the server is unreachable. But every moment
in [../problem.md](../problem.md) under "Where a player waits" needs the server, and the most frequent
of them is opening a puzzle whose content has never reached the device.

> So the honest statement of the cost is: an outage is invisible to somebody mid-puzzle and total for
> somebody arriving. A failure at eight in the morning means nobody starts that day's puzzle, on a
> product whose whole shape is a daily puzzle played on a commute.

**Two things would shrink that cost without shortening the outage**, which is why this question should
not be answered as though recovery speed were the only lever. Prefetching a puzzle before it is needed
would make an outage invisible to returning players — see
[is a puzzle fetched before it is needed?](is-a-puzzle-fetched-before-it-is-needed.md). Holding a
signed-in session locally with a lifetime would stop an outage ejecting people who were already
signed in.

*Reasoned — from [../problem.md](../problem.md) and the records named, 2026-09-03.*
