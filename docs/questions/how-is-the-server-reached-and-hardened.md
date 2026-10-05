---
opened: 2026-09-03
status: open
resolves_into: decision
---

# How is the server reached and hardened?

## Why it matters

**[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) put the last copy of a
player's work on a machine we operate.** Reaching that machine, and stopping anyone else from
reaching it, is now our problem rather than a vendor's.

**Access is needed to check a change, not only to survive an incident.** A restore drill, a look at a
log, confirming what actually shipped, running an integrity check by hand — all of it needs a way
onto the box. That is why this sits with creating the machine, at slice 4 of M1, rather than with
the questions about surviving failure: the machine is on the public internet from that slice.

**The hardening half is small and unskippable.** A machine on the public internet with a weak
configuration is compromised by scanners rather than by anyone interested in this project. The
baseline is well known and the cost of it is an afternoon, which is exactly the shape of task that
gets deferred indefinitely because it never feels urgent.

**And there is a trap specific to being one person.** Locking yourself out of a machine you alone can
reach is unrecoverable in a way that has nothing to do with attackers.
[../brainstorming/](../brainstorming/) contains lockout-recovery routes for a VPS of this shape,
which suggests somebody had already thought about it and that it is worth keeping. They are written
for RackNerd and Hetzner rather than DigitalOcean, so none of them is known to apply here.

## What would settle it

Deciding how a person and an automated deploy each get onto the machine, and what the baseline
configuration is. What any answer has to cover:

- **How a human reaches it** — keys, what holds them, and what happens when they are lost.
- **How a deploy reaches it**, which is a different credential with a different lifetime and is where
  [how do secrets reach the running system?](how-do-secrets-reach-the-running-system.md) meets this.
- **The baseline**: what is exposed, what is not, and what watches for the obvious. Whether updates
  apply themselves is settled: they install daily at one hour, per
  [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md),
  from the sources [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md)
  allows.
- **The lockout route**, because it is the failure with no remote fix.

**The host supplies none of it.**
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md) puts the server on a bare
DigitalOcean Droplet, which gives neither a baseline nor access through tooling of its own. So all
four items above are ours, and the question is fully scoped.

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/), and content in
[../../CONTRIBUTING.md](../../CONTRIBUTING.md) about how to get onto the machine and what to look at.

## Source

Split from [how is the server operated?](how-is-the-server-operated.md) on 2026-09-03. That question
covered access, hardening, restarting, patching and noticing an outage as one thing, and sat at M16 on
the assumption that a managed platform would supply most of it.
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) removed that
assumption, and [ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md) put the
server on a bare Droplet.
The half about reaching the machine is needed to check a change; the half about surviving one is not,
and stays where it was.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The operational inventory this inherits is long and was written down once already.** A volume and
its failure mode, a process manager, boot persistence, a reverse proxy, TLS issuance and renewal,
firewall and SSH hardening, unattended security updates, log rotation before a disk fills, external
uptime monitoring because a machine cannot watch itself, and an alerting channel. Roughly half of that
list belongs to this question and half to
[how is the server operated?](how-is-the-server-operated.md).

**No single item on it is hard, and the list is long enough that something falls off.** The same
inventory omitted any backup or restore procedure for the data, which is the shape of the risk here.

*Reasoned — from [../brainstorming/](../brainstorming/), which is non-authoritative and cited for what
it enumerates rather than for anything it concludes.*

*Mined 2026-09-30 from where does this run? (read with `git show ed7f54e:docs/questions/where-does-this-run.md`) as it was at commit `11ac964`. These are observations for this question to weigh, not answers.*

**On the Droplet [ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md)
chose, running the systemd services of
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md):**

- **DigitalOcean's Cloud Firewall** is "a network-based, stateful firewall service for Droplets
  provided at no additional cost. Cloud firewalls block all traffic that isn't expressly permitted by
  a rule." It is separate from any firewall on the machine, such as ufw. *Sourced: the first two
  sentences read from the raw HTML of
  [the firewalls page](https://docs.digitalocean.com/products/networking/firewalls/), 2026-10-05.
  That it is separate from ufw came from a research agent reading
  [configure rules](https://docs.digitalocean.com/products/networking/firewalls/how-to/configure-rules/)
  through a summariser on 2026-10-05; that page was not opened directly.*
- **Automatic updates skip third-party repositories.** "Just adding another package repository to an
  Ubuntu system WILL NOT make `unattended-upgrades` consider it for updates!" Debian 13, the OS per
  [ADR-0049](../decisions/0049-the-droplet-runs-debian-13.md), uses the same `unattended-upgrades`. So Caddy's repository,
  or NodeSource's if Node comes from it, is patched automatically only once its origin is added.
  *Sourced —
  [automatic updates](https://ubuntu.com/server/docs/how-to/software/automatic-updates/), read by an
  agent. That source is Ubuntu's. Debian's [wiki page](https://wiki.debian.org/UnattendedUpgrades),
  read by an agent on 2026-10-05, says only that "the default configuration auto-installs security
  updates" and that more origins are enabled in `Unattended-Upgrade::Origins-Pattern`. It does not
  mention third-party repositories, and Debian's default `50unattended-upgrades` could not be
  fetched, so the claim is not re-established for Debian.*
- **Live kernel patching does not apply.** Livepatch is Ubuntu's, and the Droplet runs Debian 13 per
  [ADR-0049](../decisions/0049-the-droplet-runs-debian-13.md), so kernel fixes take a reboot. When
  that happens is set by [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md).
  *A research agent on 2026-10-05 found a Debian intent-to-package for live patching,
  [bug 1070494](https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=1070494), from May 2024 and still
  described as a prototype, but read it only through a search summary.*
- **A fresh Droplet has no swap**, per [../constraints.md](../constraints.md), where it was measured
  with `swapon --show` on a real Droplet. The spike capped the
  app with `MemoryMax` and hardened its unit with `NoNewPrivileges`, `ProtectSystem=strict`,
  `ReadWritePaths` and `PrivateTmp`. The unit is in the question's twelfth pass.
- **journald keeps logs until its own cap**, so `SystemMaxUse` bounds their disk use. A full disk
  fails the store's writes. *Reasoned.* Unset, the cap is a share of the disk: "The first pair
  defaults to 10% and the second to 15% of the size of the respective file system, but each of the
  calculated default values is capped to 4G." *Sourced: Debian trixie's
  [journald.conf(5)](https://manpages.debian.org/trixie/systemd/journald.conf.5.en.html), read by a
  research agent on 2026-10-05.*
- **Deploy tools default to SSH as root.** Kamal does, which is moot with no Kamal. A non-root user in
  a group that controls the services is still close to root. *Sourced from Kamal's
  [ssh docs](https://kamal-deploy.org/docs/configuration/ssh/) by an agent.*
- **A compromised Droplet can run up a bill through the traffic it sends out.** "Additional outbound
  transfer is billed at $0.01 per GiB", pooled across the team's Droplets. *Sourced:
  [Droplet pricing](https://docs.digitalocean.com/products/droplets/details/pricing/), read by a
  research agent on 2026-10-05.*
  [ADR-0047](../decisions/0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md)
  reports traffic rather than cutting it, so hardening is what keeps this cause from starting. This
  entry used to say a compromised Droplet is the *most-reported* cause of a surprise bill. A research
  agent looked for a source on 2026-10-05 and found only anecdotes, so that ranking was found
  unsourced and removed.
- **Illegitimate traffic is shed without taking the site down by limiting it per client at the
  front**, not by cutting outbound traffic, which
  [ADR-0047](../decisions/0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md) rejects because it stops the site.
  *Reasoned, 2026-09-30.*
- **A Droplet's metadata service lists no DigitalOcean API token**, so root on the machine does not by
  itself give API access, though it does read `user-data` and any secret put there. *Agent's reading
  of [metadata](https://docs.digitalocean.com/products/droplets/how-to/retrieve-droplet-metadata/),
  2026-09-30; not opened.* A second agent read the page on 2026-10-05 and confirmed that `user-data`
  is among the paths served at `169.254.169.254`. The page says nothing about tokens either way, so
  the claim that no token is listed is still *Unverified*.

*The three entries above moved here 2026-09-30 from the hosting-account question.*

**DigitalOcean has two browser consoles, and only one of them works when SSH does not.** The Droplet
Console "connects to Droplets using the network, like other SSH-based clients", and it fetches keys
from `169.254.169.254`, so it fails where SSH or outbound traffic to that address is blocked. The
Recovery Console "is available even if a Droplet has lost network access or the sshd process has
failed", but "it requires password authentication on the Droplet". So a machine with no password
set for any user has no console route back after a lockout.

*Sourced: read from the raw HTML of
[connect with console](https://docs.digitalocean.com/products/droplets/how-to/connect-with-console/),
2026-10-05.*
