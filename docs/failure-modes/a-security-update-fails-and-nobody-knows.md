---
updated: 2026-10-03
update_when: alerting on the machine lands, or how updates are applied changes
decays: slow
status: active
---

# A security update fails and nobody knows

## Threatens

No promise to players directly. It threatens the machine that every session start depends on, per
[nobody can start today's puzzle](nobody-can-start-todays-puzzle.md), and property 1 of
[ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md):
a security fix reaches the running system within a day.

## How it happens

1. Updates install unattended each day at a set hour, per [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md).
2. A run fails: a package's maintainer script errors, dpkg is left half-configured, the disk is full,
   or a repository's signing key changes. Each is ordinary. A repository that cannot be downloaded
   does not even fail the run: Debian's daily script logs it at debug level and upgrades from the
   lists already on disk, per "Debian 13 updates itself on its own clock" in
   [../constraints.md](../constraints.md).
3. The failure is written to `/var/log/unattended-upgrades/` and nowhere a person reads.
4. Each later run meets the same failure, or skips the packages held back by it. The machine keeps
   serving, on fixes that are days, then weeks, old.

## Why here specifically

**One machine, updated by nobody watching.** [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md) chose to apply updates with no step by hand,
so no person looks at a run. In a spike on 2026-10-03 a run ended with `E:Sub-process returned an
error code`, from a cause the spike itself introduced, and nothing outside the log recorded it.

**The app does not notice.** It runs on whatever is installed. A failed update changes nothing it
can observe.

## How we'd notice

**Nothing would tell us, today.** No alerting exists.
[How is the server operated?](../questions/how-is-the-server-operated.md) at M11 is where alerting on
a failed update is decided. Until then this is found only by reading the log on the machine.

## What reduces it

**Alerting on the outcome of each run**, which is M11's. **A local rehearsal of the same
configuration**, per
[ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md),
catches a failure caused by configuration but not one caused by a package published later. Nothing
yet.
