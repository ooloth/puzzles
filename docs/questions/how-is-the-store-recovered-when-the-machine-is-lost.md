---
opened: 2026-09-03
status: open
resolves_into: decision
---

# How is the store recovered when the machine is lost?

## Why it matters

**[ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)
commits to surviving host replacement, and the machine cannot deliver that alone.** The host is a
DigitalOcean Droplet, per
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md), and the store's disk
is inside it, so a failed disk takes the store with the machine. The third of that record's three events is
kept by whatever exists off the machine, and by the procedure that puts it back.

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

- **The sequence**, concretely enough to follow while stressed: provision, restore, verify,
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
rather than annually. Provisioning needs a token that can create a Droplet, and
[ADR-0046](../decisions/0046-no-standing-digitalocean-token-can-create-billed-resources.md) keeps no
such token in a pipeline, so this option needs a record accepting that token's cost, as the finding
on it below says.

*A warm standby holding a continuously restored copy.* The only option that gets recovery under a few
minutes, and the most to build and pay for. Needed only if the downtime answer demands it.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**A provider that reschedules a failed machine does not rescue this.** Fly can move a Machine to a
healthy host, but a volume is pinned to a physical drive and does not follow. So automatic
rescheduling, which looks like it should solve host loss, does not solve it for a store held on a
volume. This describes Fly. On the Droplet chosen in
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md) the disk is inside the
machine, and what DigitalOcean does when a host dies outright is in
[../constraints.md](../constraints.md).

*Sourced — second-hand from a research agent reading Fly's volumes documentation, 2026-09-03.*

**The client absorbs the outage for play, and not for entry** — and the second half of that
sentence is what makes outage length a product question rather than only an operational one. Solving
continues, because the client owns the board. Everything in
[../problem.md](../problem.md) under "Where a player waits" fails, including the most frequent moment
in the product: opening a puzzle whose content has never reached the device. An outage during a
morning commute means nobody starts that day's puzzle.

So this is a downtime bet rather than a data-loss bet — the data-loss half is
[how is the store backed up?](how-is-the-store-backed-up.md) — and the downtime is not free.

*Mined 2026-09-30 from where does this run? (read with `git show ed7f54e:docs/questions/where-does-this-run.md`) as it was at commit `11ac964`. These are observations for this question to weigh, not answers.*

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

**A no-person recovery needs a standing token that can create a Droplet, and
[ADR-0046](../decisions/0046-no-standing-digitalocean-token-can-create-billed-resources.md) does not
allow one yet.** Whatever runs the recovery would hold it. DigitalOcean's scopes are per product and
action, never per resource, so a `droplet:create` token can create as many Droplets as the team's
limit allows: ten of up to $84 at tier 2, about $840 a month, and the tier rises by itself with payment
history. A token that can delete, which a recovery replacing a machine may also need, can delete the
production Droplet, since Droplets have no deletion protection. So an automated recovery is chosen
here only together with a record that names its token and accepts that cost, per [ADR-0046](../decisions/0046-no-standing-digitalocean-token-can-create-billed-resources.md)'s third
bullet. A runbook followed by hand, with a token created for the occasion, needs no such record. See
[../constraints.md](../constraints.md), "Hosting — DigitalOcean has no spending cap".

*Moved here 2026-09-30 from the hosting-account question when [ADR-0046](../decisions/0046-no-standing-digitalocean-token-can-create-billed-resources.md) resolved it.*

**Two more places a watchdog could run, and why each is weak.** GitHub Actions: "In a public
repository, scheduled workflows are automatically disabled when no repository activity has occurred in
60 days", and this repository is public. *Sourced —
[disabling a workflow](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/disabling-and-enabling-a-workflow),
opened 2026-09-30.* DigitalOcean Functions: scheduled triggers "are currently in private preview",
with "a maximum of 3 triggers" and no charge "during private preview but this is subject to change".
*Agent's reading of
[schedule functions](https://docs.digitalocean.com/products/functions/how-to/schedule-functions/),
2026-09-30, not opened.*

*Moved here 2026-09-30 from the hosting-account question, where they were weighed for a kill switch
that [ADR-0047](../decisions/0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md)
rejected.*

**A rebuild from the control panel runs the original user-data again.** On a spike Droplet on
2026-10-06, a rebuild onto `debian-13-x64` booted on the same address, and within about 20 seconds
the user and files from the original user-data were back with new timestamps, while everything
written since was gone. The host key changed. So a rebuild reproduces what cloud-init configures and
nothing else, which is the half of recovery this question does not have to supply.

*Measured, one run. Moved here on 2026-10-06 from
how is the server reached and hardened? (read with `git show 5dc67af:docs/questions/how-is-the-server-reached-and-hardened.md`).*
