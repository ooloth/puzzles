---
opened: 2026-09-01
status: open
resolves_into: decision
---

# How is the server operated?

## Why it matters

Running a server is not the same as choosing one. Something has to restart it when it dies, tell
someone when it stops answering, keep it patched, and let the maintainer back in when they lock
themselves out. None of that is covered by
[what runs the server?](what-runs-the-server.md) or
[where does this run?](where-does-this-run.md), and the amount of it needed varies enormously with
the answer to the second.

It bears directly on a promise nobody can currently keep.
[../guarantees/durability.md](../guarantees/durability.md) says a signed-in player's work survives
on every device they use, and there is no version of that where nobody notices the server has been
down for a week.

## What would settle it

Naming, for each thing that can go wrong, what notices and what happens next. A monitor that runs on
the machine it monitors notices nothing when the machine dies, which is the mistake this question
exists to avoid.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-01, on finding that [../brainstorming/](../brainstorming/) contained a worked
operational plan for a single virtual machine and that no question in this folder covered any of it.

## Options

N/A — this resolves into a set of arrangements rather than a choice between alternatives. What each
covers: process supervision and restart, health checking from outside the machine, alerting to
somewhere the maintainer actually reads, unattended security updates, remote access that survives a
broken SSH configuration, and backups.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**A health check that only proves the process is listening proves very little.** The failure this
project cares about is a write that does not land, so the check has to exercise the storage path
rather than return a constant.

**Backing up a live SQLite file by copying it is unsafe.** In write-ahead-log mode an ordinary file
copy can capture a torn write; the database's own online backup interface exists for this. Recorded
here rather than in [../constraints.md](../constraints.md) because it only applies if
[which database, if any?](which-database.md) lands on an embedded one.

*Unverified — no source recorded.*

**Most of this disappears on a managed platform and none of it disappears on a virtual machine.**
