---
opened: 2026-08-30
status: open
resolves_into: decision
---

# What happens to a losing write when syncing?

## Why it matters

Last-write-wins discards the losing write. Whether silently discarding a player's moves is
compatible with promising their progress is never lost is unresolved — and both claims
currently appear in our own documents.

## Blocked by

[snapshot or event log](is-puzzle-state-a-snapshot-or-an-event-log.md), and
[whether cross-device resume is in scope](is-cross-device-resume-in-scope-for-v1.md) — with one
writer at a time, this may never arise in practice.

## Blocks

the exact wording of the durability guarantee.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

## Options

...

## Findings

...
