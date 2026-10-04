---
number: 0051
status: accepted
date: 2026-10-03
---

# 0051 — Updates, and the reboots they need, are applied daily at an hour we set

## Forced by

- [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md), property 3:
  everything beneath the app is patched without a recurring manual step. It does not say when.
- [ADR-0049](0049-the-droplet-runs-debian-13.md): Debian 13, which offers no live kernel patching of
  its own, so a kernel fix takes effect only after a reboot of the one machine.
- [ADR-0050](0050-caddy-terminates-tls-in-front-of-the-app.md): Caddy from its own repository,
  which Debian's automatic updates leave alone until its origin is allowed, and whose package
  restarts it on every upgrade.
- "Where a player waits" in [../problem.md](../problem.md): an outage takes away session starts,
  not solving.

## Scored against

Derived from the moments an update touches the system: a fix is published, the package installs on
the running machine, a service restarts because of it, a reboot applies a kernel or C library fix,
an update fails or brings a regression, the machine is rebuilt, the production-like local run
updates, and the maintainer finds out what changed.

1. A security fix reaches the running system within a bounded time, scored as each option's exposure
   window
   ([ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md) property 3).
2. Patched on disk is patched in memory
   ([ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md) property 3).
3. One policy covers every source: Debian, Caddy's repository, and Node if it comes from the host
   ([ADR-0049](0049-the-droplet-runs-debian-13.md),
   [ADR-0050](0050-caddy-terminates-tls-in-front-of-the-app.md)).
4. No step recurs by hand
   ([ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md) property 3).
5. A regression an update introduces can be traced to that update and undone
   ([ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md), Risk).
6. Reboots and service restarts land at a time we choose, outside the hours players start sessions
   ([../problem.md](../problem.md),
   [nobody can start today's puzzle](../failure-modes/nobody-can-start-todays-puzzle.md)).
7. Players can see as few interruptions a year as possible ([../problem.md](../problem.md), item
   5).
8. The production-like local run updates the same way
   ([ADR-0039](0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)).
9. A machine rebuilt from scratch comes up patched
   ([ADR-0022](0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md),
   [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md) property 3).
10. Old kernels and the package cache do not fill the disk without bound
    ([ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md) property 4).
11. The maintainer has the least to configure and keep in mind over years
    ([../problem.md](../problem.md);
    [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md) property 6).

**Resources.** Memory was the one that might bind, and does not: an upgrade of libc6, OpenSSL and a
kernel drew about 114 MB on a 1 GB VM, leaving about 470 MB beside the app, Caddy and Litestream.
Disk is property 10. CPU and network do not bind for an occasional upgrade.

**Not weighed.** How long an outage may last is
[how much downtime is acceptable?](../questions/how-much-downtime-is-acceptable.md) at M16. The
verdict holds for any tolerance above a few minutes a year, and one of zero fails every option.
Alerting on a failed update is [how is the server operated?](../questions/how-is-the-server-operated.md)
at M11.

**Maximums.** Maximum safety is every fix in force the moment it is published. Maximum performance
is no reboot a player ever meets. Maximum experience is nothing to do by hand. Applying fixes daily
and rebooting at a quiet hour comes within a day of the first and meets the other two, at the cost
of more reboots than batching would need. Each applied kernel fix needs one reboot of the one
machine, so applying fewer means waiting longer.

## Decision

**Every day, at one hour we set, the machine installs what has been released, from every repository
it uses, and reboots then if anything installed needs it.**

- **Sources.** Debian's archive and security archive as Debian ships them, plus Caddy's repository
  (`o=cloudsmith/caddy/stable`). Node's repository is added if
  [what shape is the deployable?](../questions/what-shape-is-the-deployable.md) puts Node on the
  host.
- **The hour.** Both apt timers run at the hour, and the reboot waits for the same hour. Which hour
  is [at what hour does the machine apply updates and reboot?](../questions/at-what-hour-does-the-machine-apply-updates-and-reboot.md).
- **What triggers the reboot.** A kernel install, which Debian 13's `unattended-upgrades` marks in
  `/var/run/reboot-required`, or any process left running on a replaced library. **Services are never
  restarted for a library; the machine reboots instead.** A restart of the app's unit bypasses the
  drain-then-switch deploy that property 1 of
  [ADR-0044](0044-the-server-runs-as-systemd-services-without-containers.md) rests on, which a spike
  observed with `needrestart` set to restart.
- **A new machine** applies every update before it serves.
- **The production-like local run** carries the same configuration.

The working, including a spike on a local Debian 13 VM, is in the question this record resolved,
read with `git show cb8e751:docs/questions/when-are-updates-applied-to-the-machine.md`.

## Enforced by

**Nothing yet.** It is true once M1 slice 4's setup writes the timer drop-ins and apt configuration.
Nothing checks that the Droplet still carries them. A rehearsal in the local VM that compares
`apt-config dump` and the timers against the expected values would, and does not exist.

## Rejected

- **A weekly or monthly window.** Its case is real: at most 12 reboots a year instead of about 20,
  and one predictable moment of change. It fails property 1: a critical kernel fix waits up to 7
  days under a weekly window and up to 30 under a monthly one, against about a day, or is applied by
  hand between windows. **Reverses if** an update applied as released takes
  the app down and staging updates becomes worth the exposure.
- **Security fixes as released, the rest on a schedule.** It fails property 1 for kernel fixes that
  arrive in point releases, which wait for the schedule. Caddy's repository has no security label,
  so for the front it collapses into one of the other options anyway. **Reverses if** Debian's point
  releases stop carrying fixes that matter to this machine.
- **Pinning the machine and the local run to one archive snapshot, advanced deliberately.** It gives
  identical package sets in both places. It fails property 3: apt's snapshot addresses are built in
  for Debian's archive, so Caddy's and NodeSource's repositories, which publish none, could not be
  pinned with it (reasoned from apt 3.0.3's source, read by a research agent). **Reverses if** everything on the machine comes from Debian's archive.
- **Rebuilding the Droplet from a freshly patched image.** It fails property 4: each rebuild needs a
  token that [ADR-0046](0046-no-standing-digitalocean-token-can-create-billed-resources.md) keeps
  out of standing use. **Reverses if** [ADR-0046](0046-no-standing-digitalocean-token-can-create-billed-resources.md) is.
- **Applying updates with each deploy.** It fails property 1: the window is unbounded while nothing
  is deployed. **Reverses if** deploys run on a daily schedule regardless of changes.
- **Not yet, leaving Debian's default.** It fails property 3: Caddy is never updated, and nothing
  reboots, so a kernel fix never takes effect. Rejected because slice 4 installs Caddy.

## Risk

- **A regression lands unrehearsed.** An update installs on the Droplet the day it is released,
  with no run in the local VM first. Undo is a downgrade from the package cache or
  `snapshot.debian.org`, by hand.
- **About 20 reboots a year**, each about 18 seconds, at the chosen hour.
- **Up to a day exposed** between a fix's release and the hour.
- **A failed run is silent** until [how is the server operated?](../questions/how-is-the-server-operated.md)
  at M11 adds alerting.
- **A NodeSource origin pattern matches every major line**, since all share the codename `nodistro`.

## Revisit when

- An update applied this way takes the app down.
- A tolerance for planned outage tighter than a few minutes a year is set.
- Players are found to start sessions at the chosen hour.
- Debian, or a service covering Debian 13, offers live kernel patching worth its cost.

## Also update

- [x] questions/README.md: slice 4's Must answer moves from this question to the hour question
- [x] questions/when-are-updates-applied-to-the-machine.md: mined and deleted
- [x] questions/at-what-hour-does-the-machine-apply-updates-and-reboot.md: opened
- [x] questions/what-shape-is-the-deployable.md: what this means for Node from the host
- [x] questions/how-is-the-server-operated.md, how-does-a-deploy-switch-between-versions.md and
  how-is-the-server-reached-and-hardened.md: link this record
- [x] [ADR-0049](0049-the-droplet-runs-debian-13.md) and [ADR-0050](0050-caddy-terminates-tls-in-front-of-the-app.md): their links to the deleted question point here
- [x] constraints.md: Debian 13's update timers, reboot marker and snapshot expiry
- [x] failure-modes/: a security update fails and nobody knows
- [x] architecture.md: nothing; no boundary changes
- [x] guarantees/: no new promise
- [x] glossary.md: nothing introduced
- [x] ../CONTRIBUTING.md: nothing yet; the local VM arrives with the deploy script
