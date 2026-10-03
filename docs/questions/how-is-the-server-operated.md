---
opened: 2026-09-01
status: open
resolves_into: decision
---

# How is the server operated?

## Why it matters

Running a server is not the same as choosing one. Something has to restart it when it dies, and tell
someone when it stops answering.

**When it is patched is a separate question.** [When are updates applied to the
machine?](when-are-updates-applied-to-the-machine.md) was split out on 2026-10-03 and sits at M1 slice
4, because how Node is carried cannot be answered without it. This question no longer covers
patching.

**Getting onto the machine is a separate question.** Access, hardening and the lockout route are
[how is the server reached and hardened?](how-is-the-server-reached-and-hardened.md), at M2, because
that half is needed to *check* a change and this half is needed to *survive* one. What is left here
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
somewhere the maintainer actually reads, remote access that survives a broken SSH configuration, and
backups. Security updates moved to
[when are updates applied to the machine?](when-are-updates-applied-to-the-machine.md) on
2026-10-03.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

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
