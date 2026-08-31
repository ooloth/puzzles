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
[ADR-0003](../decisions/0003-the-server-validates-puzzle-state-but-does-not-arbitrate-it.md), which settles that no party arbitrates.

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

**There may be no losing write.**
[ADR-0003](../decisions/0003-the-server-validates-puzzle-state-but-does-not-arbitrate-it.md)
settles that merges are deterministic and per cell, which means two devices that edited different
cells both keep their work — the union is the answer, and nothing is discarded. A write is only
lost where both devices changed the *same* cell, and then only the older one, which is a single
value rather than a session.

What remains open is narrower than the title suggests: whether losing one cell's value silently is
acceptable, or whether that case deserves surfacing somehow — bearing in mind that
[offline.md](../guarantees/offline.md) forbids asking the player to choose.
