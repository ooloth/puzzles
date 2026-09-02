---
opened: 2026-09-01
status: open
resolves_into: decision
---

# How does anyone load an arbitrary board state?

## Why it matters

Reaching a nearly-finished grid, a specific rule violation, or a particular puzzle by playing
through the game to get there is slow, and most checks of a change need exactly one of those states
rather than a fresh board. It is the main thing standing between someone and checking whether a
change actually works.

[../problem.md](../problem.md) names the solving experience as the thing this project is judged on,
so checking a change to the grid, the rules, or completion is one of the most common loops there is.
Without a way to jump straight to a state, verifying a change means re-solving a puzzle by hand every
time, and that cost falls on the maintainer and on any agent trying to confirm a change works
without asking the maintainer to watch.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-01, when a milestone for maintainer tooling was added and the feedback loops nobody
had asked about were enumerated.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*
