---
opened: 2026-09-01
status: open
resolves_into: decision
---

# How is the server operated?

## Why it matters

Running a server is not the same as choosing one. Something has to restart it when it dies, and tell
someone when it stops answering.

**When it is patched is settled.** [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md) installs updates daily at an
hour we set and reboots then when anything needs it. What it leaves here is noticing a failed update:
a run that fails is silent until something alerts on it.

**Getting onto the machine is not this question.** Access, hardening and the lockout route are
settled by [ADR-0054](../decisions/0054-the-maintainers-ssh-key-is-held-in-1passwords-agent.md) to [ADR-0059](../decisions/0059-the-maintainer-logs-in-as-a-named-user-whose-sudo-asks-for-no-password.md), at slice 4 of M1,
because the machine is on the public internet from then, and this half is needed to *survive* a
change rather than to reach the machine at all. What is left here
is the ongoing operation of a machine that already exists and can already be reached.

None of it is covered by [ADR-0035](../decisions/0035-the-http-handler-is-fastify.md). The host is
a bare DigitalOcean Droplet per
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md), so no platform
supplies any of it. The app and Litestream run on it as systemd services per
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md),
which restarts them, starts them at boot and keeps their logs. The rest is open here.

It bears directly on an intention nothing can currently keep.
[../problem.md](../problem.md) says a record of a player's play is theirs to keep and outlives any
one device — and no guarantee has been made of it yet: nothing promises how long a player's work
lasts. There is no version of that intention where nobody notices the server has been down for a
week.

## What would settle it

Naming, for each thing that can go wrong, what notices and what happens next. A monitor that runs on
the machine it monitors notices nothing when the machine dies, which is the mistake this question
exists to avoid.

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-01, on finding that [../brainstorming/](../brainstorming/) contained a worked
operational plan for a single virtual machine and that no question in this folder covered any of it.

## Options

N/A — this resolves into a set of arrangements rather than a choice between alternatives. What each
covers: process supervision and restart, health checking from outside the machine, alerting to
somewhere the maintainer actually reads, and
backups, and alerting when a security update fails. When updates are applied is
[ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md).

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Two update failures leave no error at all, and the mechanism here has to catch both.** A
repository that cannot be downloaded is logged by Debian's daily script at debug level only, and the
upgrade runs on the old lists, per "Debian 13 updates itself on its own clock" in
[../constraints.md](../constraints.md). And a package pinned to its major version per
[ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md) gets no fixes once upstream supports only a newer line, while every run
succeeds: [a pinned package outlives its supported major version](../failure-modes/a-pinned-package-outlives-its-supported-major-version.md).
The maintainer wants a mechanism for noticing the second, whenever this question is answered.

*Reasoned from [ADR-0052](../decisions/0052-the-machine-installs-from-debians-archive-and-only-vetted-pinned-apt-repositories-beside-it.md) and the constraint above.*

**What a failed update leaves to find it by, on Debian 13.** `/var/log/apt/history.log` and
`/var/log/dpkg.log` rotate monthly and keep 12; `/var/log/unattended-upgrades/` keeps 6 and records
each run's errors. Syslog output from `unattended-upgrades` is off by default. Nothing is sent
anywhere a person reads, which is
[a security update fails and nobody knows](../failure-modes/a-security-update-fails-and-nobody-knows.md).

*Sourced by a research agent on 2026-10-03 from the logrotate files of apt 3.0.3, dpkg 1.22.22 and
unattended-upgrades 2.12, in the working for
[ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md) (read with
`git show cb8e751:docs/questions/when-are-updates-applied-to-the-machine.md`). Not opened by me.*

**A health check that only proves the process is listening proves very little.** The failure this
project cares about is a write that does not land, so the check has to exercise the storage path
rather than return a constant.

**Backing up a live SQLite file by copying it is unsafe.** In write-ahead-log mode an ordinary file
copy can capture a torn write; the database's own online backup interface exists for this. Recorded
here rather than in [../constraints.md](../constraints.md) because it only applies if
[ADR-0020](../decisions/0020-the-stores-engine-is-sqlite.md) lands on an embedded one.

*Unverified — no source recorded.*

**None of this disappears, because the host is a bare virtual machine** per
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md).

### The operational comparison this inherits, and why this question got bigger

*Reasoned — from the operational comparison behind
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md), 2026-09-03.*

**This question is at its largest, because the host is a bare machine.** The store records require
an ordinary process with a local disk beside it, which removes the serverless and edge tiers. A
managed platform with a persistent volume would have satisfied them too, but the host is a bare
DigitalOcean Droplet per
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md), which supplies
none of what follows.

**Setup effort is a wash between an embedded store and a database server, which is the opposite of
the folklore.** Standing up continuous replication plus a restore drill is about as much work as
standing up a daemon plus its backup story — roughly 9–14 hours against 8–16, both including the base
machine work. Day-to-day attention is near-identical, within about fifteen minutes a month.

**The real operational difference is annual and singular**: a database server has major-version
upgrades, two to six hours with downtime, roughly yearly to stay current. A file has no equivalent,
because the library version travels with the runtime.

*Reasoned — 2026-09-03. Estimates for someone competent who does not do this daily; nobody has run
either.*

**What a machine we operate owns, enumerated**: the disk inside it and its failure mode, a backup
mechanism, a restore procedure and the discipline of rehearsing it, a process manager, boot
persistence, a reverse proxy, TLS issuance and renewal, firewall and SSH hardening, unattended
security updates, log rotation before a disk fills, external uptime monitoring because a machine
cannot watch itself, and an alerting channel.
[ADR-0044](../decisions/0044-the-server-runs-as-systemd-services-without-containers.md) makes
systemd the process manager and what brings the app back after a reboot.

**The same inventory, written out in [../brainstorming/](../brainstorming/) for exactly this
architecture, contained no backup or restore procedure.** Somebody described crash recovery, reboot
survival and three separate SSH-lockout recovery routes and omitted the step protecting a player's
work. That is the shape of the risk here: no single task is hard, and the list is long enough that
something falls off it.

**On Debian 13, logins are read from the journal.** Debian 13 removed `last`, `lastb` and `lastlog`:
"The util-linux package no longer provides the last or lastb commands". On a `debian-13-x64` Droplet
on 2026-10-05 there was no `rsyslog` and no `/var/log/auth.log`, the journal was persistent, and every
accepted and refused SSH login, console login and `sudo` command was in it. journald caps itself at
10% of the disk, at most 4G, when `SystemMaxUse` is unset, per Debian's journald.conf(5).

*Measured on a spike Droplet for the journal, one run; sourced from Debian's trixie release notes and
journald.conf(5). Moved here on 2026-10-05 from
how is the server reached and hardened? (read with `git show 5dc67af:docs/questions/how-is-the-server-reached-and-hardened.md`).*

**Illegitimate traffic is shed by limiting it per client at the front**, not by cutting outbound
traffic, which [ADR-0047](../decisions/0047-nothing-automated-deletes-or-stops-resources-to-cap-spending.md)
rejects because it stops the site.

*Reasoned, 2026-09-30. Moved here on 2026-10-05 from the hardening question, which
[ADR-0057](../decisions/0057-ssh-accepts-only-keys-and-a-firewall-on-the-machine-admits-only-ssh-http-and-https.md)
answered without settling it.*
