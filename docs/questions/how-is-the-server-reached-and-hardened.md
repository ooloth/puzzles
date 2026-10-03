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
onto the box. That is why this sits with the tooling that makes a change checkable rather than with
the questions about surviving failure.

**The hardening half is small and unskippable.** A machine on the public internet with a weak
configuration is compromised by scanners rather than by anyone interested in this project. The
baseline is well known and the cost of it is an afternoon, which is exactly the shape of task that
gets deferred indefinitely because it never feels urgent.

**And there is a trap specific to being one person.** Locking yourself out of a machine you alone can
reach is unrecoverable in a way that has nothing to do with attackers.
[../brainstorming/](../brainstorming/) contains three separate lockout-recovery routes for exactly
this architecture, which suggests somebody had already thought about it and that it is worth keeping.

## What would settle it

Deciding how a person and an automated deploy each get onto the machine, and what the baseline
configuration is. What any answer has to cover:

- **How a human reaches it** — keys, what holds them, and what happens when they are lost.
- **How a deploy reaches it**, which is a different credential with a different lifetime and is where
  [how do secrets reach the running system?](how-do-secrets-reach-the-running-system.md) meets this.
- **The baseline**: what is exposed, what is not, whether updates apply themselves, and what watches
  for the obvious.
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
  provided at no additional cost". It is separate from any firewall on the machine, such as ufw. It
  was read through a summariser, from
  [configure rules](https://docs.digitalocean.com/products/networking/firewalls/how-to/configure-rules/).
- **Automatic updates skip third-party repositories.** "Just adding another package repository to an
  Ubuntu system WILL NOT make `unattended-upgrades` consider it for updates!" So Caddy's repository,
  or NodeSource's if Node comes from it, is patched automatically only once its origin is added.
  *Sourced —
  [automatic updates](https://ubuntu.com/server/docs/how-to/software/automatic-updates/), read by an
  agent.*
- **Livepatch** "is available free for up to 5 machines, for personal use", and it "is not a
  replacement for rebooting". `pro status` on a fresh Droplet reports it as available, per
  [../constraints.md](../constraints.md). Using it means attaching an Ubuntu Pro token.
- **A fresh Droplet has no swap**, per [../constraints.md](../constraints.md). The spike capped the
  app with `MemoryMax` and hardened its unit with `NoNewPrivileges`, `ProtectSystem=strict`,
  `ReadWritePaths` and `PrivateTmp`. The unit is in the question's twelfth pass.
- **journald keeps logs until its own cap**, so `SystemMaxUse` bounds their disk use. A full disk
  fails the store's writes. *Reasoned.*
- **Deploy tools default to SSH as root.** Kamal does, which is moot with no Kamal. A non-root user in
  a group that controls the services is still close to root. *Sourced from Kamal's
  [ssh docs](https://kamal-deploy.org/docs/configuration/ssh/) by an agent.*
- **A compromised Droplet is the most-reported cause of a surprise DigitalOcean bill**, through the
  traffic it sends out, often after an exposed service or a weak SSH password. The other common cause
  is a forgotten resource. *Weak: an agent's reading of secondhand sources and one community thread
  title, 2026-09-30.* Outbound transfer beyond the pool costs $0.01 per GiB, and
  [ADR-0047](../decisions/0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md)
  reports traffic rather than cutting it, so hardening is what keeps this cause from starting.
- **Illegitimate traffic is shed without taking the site down by limiting it per client at the
  front**, not by cutting outbound traffic, which
  [ADR-0047](../decisions/0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md) rejects because it stops the site.
  *Reasoned, 2026-09-30.*
- **A Droplet's metadata service lists no DigitalOcean API token**, so root on the machine does not by
  itself give API access, though it does read `user-data` and any secret put there. *Agent's reading
  of [metadata](https://docs.digitalocean.com/products/droplets/how-to/retrieve-droplet-metadata/),
  2026-09-30; not opened.*

*The three entries above moved here 2026-09-30 from the hosting-account question.*
