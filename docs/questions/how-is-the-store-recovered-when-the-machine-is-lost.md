---
opened: 2026-09-03
status: open
resolves_into: decision
---

# How is the store recovered when the machine is lost?

## Why it matters

**[ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)
commits to surviving host replacement, and the machine cannot deliver that alone.** Fly's own words:
"If your app needs a volume to function, and the NVMe drive hosting your volume fails, then that
instance of your app goes down. There's no way around that." The third of that record's three events
is kept by whatever exists off the machine, and by the procedure that puts it back.

**This is the difference between an outage measured in minutes and one measured in hours**, and it is
almost entirely under our control rather than the provider's. Providers differ by a couple of minutes
on provisioning; a rehearsed script and an improvisation differ by hours. So this question, not the
hosting choice, is the main lever on
[how much downtime is acceptable?](how-much-downtime-is-acceptable.md).

**A procedure nobody has run is a belief.** That is the same point
[is the store's backup restorable?](is-the-stores-backup-restorable.md) makes about the data; this
question is about the steps around it.

## What would settle it

Writing the procedure down and running it, on a real machine, from nothing. Any answer has to cover:

- **The sequence**, concretely enough to follow while stressed: provision, attach, restore, verify,
  redeploy, cut over.
- **How much of it is automated** rather than typed. This is the variable that sets the outage length.
- **What "verified" means** before traffic is sent back — row counts, an integrity check, a known
  record present.
- **Where the credentials and configuration come from**, since the machine holding them is the one
  that just disappeared. This meets
  [how do secrets reach the running system?](how-do-secrets-reach-the-running-system.md).
- **How the procedure is kept working** as the system changes, which is the same rehearsal problem as
  the backup itself.

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/), and content in
[../../CONTRIBUTING.md](../../CONTRIBUTING.md).

## Source

Raised 2026-09-03, alongside
[ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md).
That record commits to surviving host replacement and names the gap: between it landing and this being
built, the system has a durability claim it cannot honour.

## Options

*A written runbook, executed by hand.* Cheapest to produce and the slowest to run, and it degrades
silently as the system changes around it.

*A script that rebuilds from nothing.* Slower to write, and it is the version that can be rehearsed
cheaply enough to actually be rehearsed.

*The ordinary deploy pipeline, with restore as a step.* If a deploy already provisions and configures,
recovery is a deploy plus a restore — which makes the recovery path something exercised continuously
rather than annually.

*A warm standby holding a continuously restored copy.* The only option that gets recovery under a few
minutes, and the most to build and pay for. Needed only if the downtime answer demands it.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**A provider that reschedules a failed machine does not rescue this.** Fly can move a Machine to a
healthy host, but a volume is pinned to a physical drive and does not follow. So automatic
rescheduling, which looks like it should solve host loss, does not solve it for a store held on a
volume.

*Sourced — second-hand from a research agent reading Fly's volumes documentation, 2026-09-03.*

**The client absorbs the outage for play, and not for entry** — and the second half of that
sentence is what makes outage length a product question rather than only an operational one. Solving
continues, because the client owns the board. Everything in
[../problem.md](../problem.md) under "Where a player waits" fails, including the most frequent moment
in the product: opening a puzzle whose content has never reached the device. An outage during a
morning commute means nobody starts that day's puzzle.

So this is a downtime bet rather than a data-loss bet — the data-loss half is
[how is the store backed up?](how-is-the-store-backed-up.md) — and the downtime is not free.

*Mined 2026-09-30 from [where does this run?](where-does-this-run.md) as it was at commit `11ac964`. These are observations for this question to weigh, not answers.*

**Two designs recover without a person.**

- **An automated rebuild.** Litestream streams each write off the machine every second by default. A
  watchdog running elsewhere sees the machine gone, creates a replacement through the provider's API,
  restores the store, and moves the address. The outage lasts minutes, and about a second of writes
  is lost.
- **A warm standby.** A second machine keeps a copy current with `litestream restore -f`, which
  "Continuously restores new data as it becomes available", opened read-only. It is promoted when the
  primary is lost. The outage lasts seconds, and the compute costs twice as much. *Sourced —
  [restore](https://litestream.io/reference/restore/), opened 2026-09-29.*

**What makes either safe: fencing.**

- A machine that is cut off rather than dead can keep writing.
- Moving the address first, then starting a new replica path, keeps two machines from writing one
  replica.
- Litestream says "It is _your_ responsibility to ensure you do not have multiple applications
  replicating concurrently". *Sourced — [tips](https://litestream.io/tips/), opened 2026-09-30.*

**The pieces on the chosen host.**

- DigitalOcean's API creates a Droplet with cloud-init user data and SSH keys.
- A reserved IP moves with one API call, and costs nothing while assigned.
- DigitalOcean live-migrates a Droplet off a failing host, but does not state what happens when a
  host dies outright. See [../constraints.md](../constraints.md).

**Where a watchdog could run.** Cloudflare Workers' free cron is reported to fire every five minutes
but not every minute.
