---
opened: 2026-08-30
status: open
resolves_into: decision
---

# What makes a puzzle a joy to solve?

## Why it matters

This is the stated point of the whole project and it currently has a one-line answer.
Uniqueness and logical solvability are the floor, not the goal. The shape of the solving path,
variety of technique, and the absence of long tedious stretches are all plausible components,
and none is written down.

Until this is answered, the generator has no target beyond correctness — which means it can be
finished and still produce puzzles nobody enjoys.

## Blocked by

[Does v1 ship generated or seeded puzzles](does-v1-ship-generated-or-seeded-puzzles.md).

## Blocks

[is difficulty graded](is-difficulty-graded-and-does-a-grade-promise-anything.md),
[does v1 ship generated or seeded puzzles](does-v1-ship-generated-or-seeded-puzzles.md).

## What would settle it

Probably by solving a lot of puzzles and noticing what separates the good ones, rather than by
reasoning.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

Finding drawn from legacy ADR-22 (seed sudoku puzzles statically).

## Options

...

## Findings

One concrete component, from a library evaluation that rejected a candidate partly for lacking
it: **symmetric clue removal.** Where the given cells sit in a symmetric pattern rather than
scattered, the puzzle reads as composed rather than generated. It is an aesthetic property with
no bearing on solvability, which makes it exactly the kind of thing a generator optimising only
for uniqueness will never produce — and exactly the kind of thing this question exists to find.
