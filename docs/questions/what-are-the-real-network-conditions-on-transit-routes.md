---
opened: 2026-08-30
status: open
resolves_into: constraint
---

# What are the real network conditions on the transit routes this is designed for?

## Why it matters

The architecture pivots on dropout durations and round-trip times currently taken from a
specification's classification thresholds and generic research, not from measurement. If actual
conditions are milder or harsher than assumed, the offline design is either over-built or
under-built.

## Blocked by

N/A — nothing needs to be answered first.

## Blocks

N/A — nothing waits on this.

## What would settle it

Carrying a phone on the actual commute with something logging.

## Resolves into

`constraints.md`.

## Source

Ported from the legacy documentation review, 2026-08-30.

## Options

N/A — this resolves into a fact, not a choice.

## Findings

The durations previously carried in `constraints.md` — dropouts of "seconds to a couple of
minutes" — trace to unnamed "subway/transit connectivity research" with no citation. They have
been removed from that file. What survives there is the qualitative fact, which is
uncontroversial: connectivity drops entirely in tunnels and stalls during tower handoff while
still reporting as connected.
