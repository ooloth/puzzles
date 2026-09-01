---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Is difficulty graded, and does a grade promise anything?

## Why it matters

"Every puzzle is solvable by logic alone" is already a guarantee. Whether an *Easy* is
guaranteed to be easier than a *Hard* is a separate and much harder claim to make good on — it
needs a difficulty model, not just a solver.

## Blocked by

[What makes a puzzle a joy to solve](what-makes-a-puzzle-a-joy-to-solve.md).

## Blocks

What the generator has to measure while generating, and
[what must we know about how the app is used?](what-must-we-know-about-how-the-app-is-used.md),
which cannot be answered until this is.

A grade that promises the player something can only be kept honest by checking it against real
solves, which is a demand for a server and a queryable store. A grade that promises nothing removes
that demand entirely. The same question therefore decides whether one of the strongest arguments
for a database exists at all.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

## Options

...

## Findings

...
