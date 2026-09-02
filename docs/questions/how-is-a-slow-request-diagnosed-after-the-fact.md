---
opened: 2026-09-01
status: open
resolves_into: decision
---

# How is a slow request diagnosed after the fact?

## Why it matters

[../guarantees/latency.md](../guarantees/latency.md) promises that input registers without
waiting for the network, and [../constraints.md](../constraints.md) records that a stalled
connection produces no thrown error — it just sits there, still reporting as connected. Put
together: a slow request is exactly the failure this app is built to hide from the player, which
means it is also hidden from whoever is trying to find out why it happened.

Nothing about a request's timing survives past the moment it finishes unless something recorded
it while it was happening. Without that, a report that the app felt slow yesterday has no data
behind it and cannot be diagnosed, only guessed at. This is also what lets an agent investigate a
performance regression from evidence, instead of asking the maintainer to reproduce it.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-01, extending the maintainer tooling milestone past the loops that were already
obvious.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*
