---
updated: 2026-08-31
update_when: the merge or ordering design changes
decays: slow
status: active
---

# A cell edit is overwritten by an older one

## Threatens

[durability.md](../guarantees/durability.md) — a player's work disappearing without their
involvement.

## How it happens

Merging is per cell, later write wins, and "later" is decided by a timestamp the writing device
supplies. Device clocks disagree. A player edits a cell on a phone whose clock runs slow, edits
the same cell on a laptop, and the phone's write carries a timestamp that appears later. The
laptop's value is replaced by the phone's older one. Both devices then agree on the wrong answer,
which is worse than disagreeing.

## Why here specifically

The merge is deliberately deterministic and unsupervised, per
[what the server does with puzzle state](../questions/what-does-the-server-do-with-puzzle-state.md), so
nothing is watching for an implausible ordering. And because
[offline.md](../guarantees/offline.md) forbids ever asking the player to choose, there is no path
by which a suspicious merge surfaces for a human to look at.

## How we'd notice

**We wouldn't, and neither would the player in most cases** — a single cell reverting looks like
having mistyped it. It becomes visible only when the reverted value was load-bearing for a chain
of deductions, at which point the puzzle stops making sense and the player blames themselves.

## What reduces it

A monotonic per-device counter alongside the wall clock, so ordering does not rest on clocks
agreeing. Recording *when a cell changed* rather than when the board was written, so an untouched
cell never carries a fresh timestamp and cannot clobber a remote edit. Server-assigned arrival
ordering is a partial answer — it removes clock skew but introduces the opposite error, since a
device that was offline all day arrives last while having written first.
