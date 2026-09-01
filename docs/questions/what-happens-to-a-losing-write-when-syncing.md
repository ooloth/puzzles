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
[what the server does with puzzle state](what-does-the-server-do-with-puzzle-state.md)
settles that merges are deterministic and per cell, which means two devices that edited different
cells both keep their work — the union is the answer, and nothing is discarded. A write is only
lost where both devices changed the *same* cell, and then only the older one, which is a single
value rather than a session.

What remains open is narrower than the title suggests: whether losing one cell's value silently is
acceptable, or whether that case deserves surfacing somehow — bearing in mind that
[offline.md](../guarantees/offline.md) forbids asking the player to choose.
