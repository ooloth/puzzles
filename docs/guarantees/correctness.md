---
updated: 2026-08-30
update_when: a promise about the program behaving as specified is made
decays: slow
status: stub
---

# Correctness

The program does what it says across all inputs, states and callers — determinism,
idempotency, and agreement between what is stored and what is shown.

Not to be confused with two neighbours. Whether a *puzzle* is sound is
[puzzles.md](puzzles.md). How code is *written* — assertions, edge-case handling, complete
implementations — is a standard rather than a promise, and lives in
[../standards/](../standards/). This file holds only observable properties a player could in
principle catch us breaking.

_No promises yet._

Likely candidates once there is code: applying the same move twice has the effect of applying
it once; a partial write is never observable; the board on screen always matches the board in
storage. The first of those is already implicated by
[What happens to a losing write when syncing?](../questions/what-happens-to-a-losing-write-when-syncing.md).
