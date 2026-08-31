---
number: 0003
status: accepted
date: 2026-08-31
---

# 0003 — The server validates puzzle state but does not arbitrate it

## Forced by

[durability.md](../guarantees/durability.md) promises a player's work is never lost, and
[offline.md](../guarantees/offline.md) promises no merge or conflict prompt is ever shown. A
server able to reject a client's state leaves exactly two outcomes when it exercises that power:
the work disappears, or the player is asked to choose between versions. Both are already
forbidden.

Validation is forced from the other direction. `../standards/README.md` points at a portable
standard requiring inputs to be validated at system boundaries, and the server copy exists to be
recovered from — a store that faithfully preserves whatever it is handed is not durable in any
sense that matters.

## Decision

**The server does not arbitrate.** It never rejects a client's state on the grounds that another
version is more correct, and it never asks a player to choose between versions. Where copies
diverge, the merge is deterministic: computable identically by any party from the data alone,
per cell, so no party has to be the one that decides.

**The server does validate.** It refuses what is not a well-formed board of the right shape, with
values in range, for a puzzle that exists, from someone entitled to write to that key, within
sane size and rate limits.

The distinction is that the server checks whether the payload is *a board it should be holding*,
never whether the player's *play* was correct. It does not replay moves and has no opinion about
whether a move was legal.

Validating the *position* against the rules of the game — whether the grid actually obeys sudoku's
constraints — is deliberately deferred. It requires the rules to run on the server as well as the
client, which is only affordable if one pure module serves both, and nothing currently depends on
a puzzle being genuinely finished.

This is scoped to puzzle state. The server may arbitrate other things, and should: which content a
player may receive is exactly the kind of decision it ought to own, and gating an archive has
nothing to do with the digits in today's grid.

## Rejected

- **The server rejects divergent state.** Forbidden by both promises above.
- **The server computes the canonical merge and clients adopt it.** Not harmful — a union-style
  merge loses nothing — but it buys nothing either. Agreement between clients comes from the merge
  being *deterministic*, not from it being *central*. This would make the server load-bearing for
  a case that resolves without it, and would put reconciliation out of reach whenever the server
  is unreachable, which is the condition the app is built for.
- **The server stores whatever it is given.** The position this decision started from, and wrong.
  A client bug that writes a corrupt board would have that corruption stored faithfully, made
  canonical, and propagated to every device that syncs — with the player's local copy having been
  salvageable right up until the server accepted the bad version. An unauthenticated write
  endpoint accepting arbitrary payloads is also free storage for anyone who finds it.

## Risk

**Ordering is the weak point.** A deterministic merge needs consistent ordering across devices,
and wall-clock skew can invert it: a write made earlier can carry a later timestamp and win. For
one person editing the same cell on two devices within minutes, skew would have to be substantial
— but "unlikely" is not "impossible", and the failure is silent. A monotonic per-device counter
alongside the timestamp bounds it.

**A merged board can be a state neither device ever displayed**, holding progress from both. Usually
a pleasant surprise, occasionally confusing, and never seen by anyone during testing on one device.

**A naive merge can reintroduce a value the player deliberately cleared**, if the clearing happened
on the device whose write is older.

**Deferring rules validation has a trigger nobody will notice.** It is fine while nothing depends
on a puzzle being finished. The moment a streak, an unlock, or anything gated does, an unvalidated
completion becomes something worth faking — and the decision to defer will have been made long
enough ago that nobody connects the two.

**Accepting progress against any puzzle identifier lets a client probe which ones exist.** Harmless
while the catalogue is public; an information leak once an archive is gated.

## Revisit when

- Anything ranked, competitive, or gated depends on a puzzle being genuinely complete.
- Two devices editing the same board simultaneously stops being out of scope.
- Clock skew is observed causing a visible wrong result, rather than reasoned about.

## Also update

- [x] Nothing new in `constraints.md`
- [x] Nothing new in `guarantees/` — this is derived from two existing promises
- [ ] `failure-modes/` — the silent merge inversion and the corrupt-board propagation are both
      chains worth recording once that folder starts filling

Deliberately not decided here: whether a server exists at all, what it stores it in, or how sync
is triggered.
