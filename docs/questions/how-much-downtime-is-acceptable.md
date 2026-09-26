---
opened: 2026-08-30
status: open
resolves_into: decision
---

# How much downtime is acceptable?

## Why it matters

The server and its store share one machine, per
[ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md), so the machine failing
takes the app down until it is replaced, and nothing gives redundancy without paying for it. Backups
protect data rather than availability, which is why
[ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)
needs a copy off the machine for the data and says nothing about uptime. Accepting that is entirely
reasonable for a project this size, but it should be accepted explicitly, with a tolerable outage
length attached, rather than discovered during one.

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

**One machine and one volume give no hardware redundancy, and nothing in the settled arrangement adds
any.** [ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md) puts the process and
its store on the same machine, so the machine running the process and the machine holding the data
are one object, and its failure is an outage of both. No arrangement names a tolerable outage length;
that is what this question is for.

*Reasoned — from the two records named.*

**Fly.io states the single-volume case in its own words**:
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
