---
opened: 2026-10-12
status: open
resolves_into: decision
---

# What detects a process left running on a replaced library?

## Why it matters

[ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md)
reboots the machine at the chosen hour for two triggers: a kernel install, or "any process left
running on a replaced library". Debian 13 marks only the first. Per "Debian 13 updates itself on its
own clock" in [../constraints.md](../constraints.md), only a kernel install creates
`/var/run/reboot-required`, and nothing notices a process still using a replaced `libc6` unless
something like `needrestart` is installed. That record's **Enforced by** names the timers and the apt
configuration and nothing that detects the second trigger, so M1 slice 4, which makes that record
true, would otherwise pick a detector by default or build only the first trigger.

Without a detector, a fix to a shared library is on disk within a day and in memory only at the next
kernel reboot, which fails property 1 of that record. The same record forbids restarting a service
for a library, because a restart of the app's unit bypasses the deploy's drain-then-switch, so
whatever detects it feeds the reboot rather than restarting anything.

**Environments:** production, and the production-like local run, which carries the same update
configuration per
[ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)
and [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md).

## What would settle it

A run on the local Debian 13 VM in which each candidate is shown a process using a replaced library
and a process running a replaced executable, and either reports both to the reboot or does not.

## Properties the answer is scored against

Seeded on 2026-10-12 with one row, before any option was researched. The rest of the list is derived
when this question is worked.

1. A process running a replaced executable is caught, as well as one using a replaced shared
   library. If [is Node installed on the host or carried in each
   release?](is-node-installed-on-the-host-or-carried-in-each-release.md) puts Node on the host, an
   upgrade from NodeSource replaces `/usr/bin/node` under the running app, and only this detector can
   bring the app onto the patched binary, per property 2 of
   [ADR-0051](../decisions/0051-updates-and-the-reboots-they-need-are-applied-daily-at-an-hour-we-set.md).
   This row keeps that candidate open whatever is chosen here. If a candidate here fails it, the two
   questions depend on each other and are worked together.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-10-12 while checking the claims in
[is Node installed on the host or carried in each
release?](is-node-installed-on-the-host-or-carried-in-each-release.md), whose host candidate depends
on it. Ordered ahead of that question on the same day, because it is cheaper to undo and the Node
question is an input only through property 1 above. Four mechanisms were named in passing and none
was researched: `needrestart` in list mode, `checkrestart` from `debian-goodies`, a script reading
`/proc/*/maps` for deleted files, and an unconditional daily reboot.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

...
