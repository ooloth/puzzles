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

[Is cross-device resume in scope for v1?](is-cross-device-resume-in-scope-for-v1.md) — a losing
write requires two writers, so with one device this never arises. Also
[is puzzle state a snapshot or an event log?](is-puzzle-state-a-snapshot-or-an-event-log.md), and
[who is authoritative over puzzle state?](who-is-authoritative-over-puzzle-state.md).

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
