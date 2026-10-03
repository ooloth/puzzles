---
opened: 2026-08-30
status: open
resolves_into: decision
---

# How much downtime is acceptable?

## Why it matters

The server and its store share one machine, a DigitalOcean Droplet, per
[ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md) and
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md), so the machine failing
takes the app down until it is replaced, and nothing gives redundancy without paying for it. Backups
protect data rather than availability, which is why
[ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)
needs a copy off the machine for the data and says nothing about uptime. Accepting that is entirely
reasonable for a project this size, but it should be accepted explicitly, with a tolerable outage
length attached, rather than discovered during one.

## What would settle it

...

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

Finding drawn from legacy ADR-12, which put the host on Fly.io. The host is now a DigitalOcean
Droplet, per [ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md).

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Backups cover data loss, not downtime.** Restoring from a backup returns the data and says nothing
about how long the app was unreachable while it happened. Accepting no redundancy is reasonable at
this size; accepting it without naming a tolerable outage length is how the number gets discovered
during an outage instead.

**One Droplet with its disk inside it gives no hardware redundancy, and nothing in the settled
arrangement adds any.**
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md) puts the server on one
Droplet, and [ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md) puts the
process and its store on the same machine, so the machine running the process and the machine
holding the data are one object, and its failure is an outage of both. No arrangement names a
tolerable outage length; that is what this question is for.

*Reasoned — from the two records named.*

**Fly.io states the single-disk case in its own words**:
"If your app needs a volume to function, and the NVMe drive hosting your volume fails, then that
instance of your app goes down. There's no way around that." That describes Fly, and the same holds
for a Droplet's disk.

*Sourced — [fly.io/docs/volumes/overview](https://fly.io/docs/volumes/overview/), read 2026-09-02.*

**An outage does not stop play, and it does stop everything else.** This is the finding that makes
this question a product question rather than an operational one. Solving continues, because
[ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) puts the board on the
client and four promises describe the app working while the server is unreachable. But every moment
in [../problem.md](../problem.md) under "Where a player waits" needs the server, and the most frequent
of them is opening a puzzle whose content has never reached the device.

> So the honest statement of the cost is: an outage is invisible to somebody mid-puzzle and total for
> somebody arriving. If the product is a daily puzzle played on a commute, which
> [is there one puzzle a day, or unlimited play?](is-there-one-puzzle-a-day-or-unlimited-play.md)
> has not settled, a failure at eight in the morning means nobody starts that day's puzzle.

**Two things would shrink that cost without shortening the outage**, which is why this question should
not be answered as though recovery speed were the only lever. Prefetching a puzzle before it is needed
would make an outage invisible to returning players — see
[is a puzzle fetched before it is needed?](is-a-puzzle-fetched-before-it-is-needed.md). Holding a
signed-in session locally with a lifetime would stop an outage ejecting people who were already
signed in.

*Reasoned — from [../problem.md](../problem.md) and the records named, 2026-09-03.*

*Mined 2026-09-30 from where does this run? (read with `git show ed7f54e:docs/questions/where-does-this-run.md`) as it was at commit `11ac964`. These are observations for this question to weigh, not answers.*

- **The maintainer's weighing, stated 2026-09-29:** "a system that stays up while i'm sleeping is
  obviously much more reliable than one that waits for me to react but the price is so appealing that
  it's not enough by itself to decide". Staying up without a person was scored as a property that
  counts but does not disqualify.
- **What each recovery design costs in downtime** is in
  [how is the store recovered when the machine is lost?](how-is-the-store-recovered-when-the-machine-is-lost.md):
  minutes for an automated rebuild, seconds for a warm standby.
- **Published uptime commitments.**
  - DigitalOcean: "Monthly Uptime Percentage of 99.99% for each individual Droplet instance",
    excluding "Scheduled maintenance". *Sourced —
    [SLA](https://www.digitalocean.com/sla/cpu-droplets), opened 2026-09-29.*
  - Linode: 99.99%.
  - Fly: 99.9%, for Enterprise only.
- **A deploy need not cost downtime.** A deploy that dropped no request was observed on a Droplet,
  per the twelfth pass.
- **A reboot for a kernel patch** is a brief outage, unless Livepatch covers the fix.
