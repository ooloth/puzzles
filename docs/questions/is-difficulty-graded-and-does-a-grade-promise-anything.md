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

**This gates puzzle quality, not the stack.** It decides whether the puzzles are good. What the
generator is built with follows from the shared language — see the order in [README.md](README.md).
Nothing on the road to a tech stack waits on this.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Grading decides what the generator has to measure while it generates a puzzle.**

A grade that promises the player something can only be kept honest by checking it against real
solves, which is a demand for a server and a queryable store. A grade that promises nothing removes
that demand entirely. The same question therefore decides whether one of the strongest arguments
for a database exists at all.

...
