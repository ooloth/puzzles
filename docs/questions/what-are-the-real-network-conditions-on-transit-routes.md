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

## What would settle it

Carrying a phone on the actual commute with something logging.

## Resolves into

`constraints.md`.

## Source

Ported from the legacy documentation review, 2026-08-30.

## Options

N/A — this resolves into a fact, not a choice.

## Findings

No duration is recorded anywhere, and the figures that circulate — dropouts of "seconds to a
couple of minutes" — trace to unnamed "subway/transit connectivity research" with no citation, so
they are not usable. `constraints.md` carries only the qualitative fact, which is uncontroversial:
connectivity drops entirely in tunnels and stalls during tower handoff while still reporting as
connected.
