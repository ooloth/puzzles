---
opened: 2026-08-30
status: open
resolves_into: decision
---

# How much downtime is acceptable?

## Why it matters

A single machine has no hardware redundancy, and backups protect data, not availability.
Accepting that is entirely reasonable for a project this size — but it should be accepted
explicitly, with a tolerable outage length attached, rather than discovered during one.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

Finding drawn from legacy ADR-12 (host on Fly.io).

## Options

...

## Findings

**Backups cover data loss, not downtime.** A single machine with a single volume has no
hardware-failure redundancy, and that is equally true of a bare VPS and of a managed platform —
neither gives redundancy without paying for it. Restoring from a backup returns the data and says
nothing about how long the app was unreachable while it happened. Accepting no redundancy is
reasonable at this size; accepting it without naming a tolerable outage length is how the number
gets discovered during an outage instead.
