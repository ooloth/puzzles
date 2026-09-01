---
opened: 2026-08-30
status: open
resolves_into: problem
---

# Does craft enjoyment ever outrank user experience?

## Why it matters

Enjoying the build is a legitimate and stated motive for this project. It's also the kind of
motive that quietly justifies technical choices on other grounds. Better answered openly, once,
than smuggled into individual decisions as a performance or architecture argument.

## What would settle it

...

## Resolves into

[../problem.md](../problem.md).

## Source

Ported from the legacy documentation review, 2026-08-30.

Finding drawn from legacy ADR-01 (render with server-driven hypermedia).

Finding drawn from legacy ADR-02 (use Rust for the backend).

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

Legacy ADR-01 answered a version of this question, and chose craft. It accepted writing grid
interaction in an unfamiliar expression DSL rather than the maintainer's stronger TypeScript,
calling it "a deliberate investment, made with eyes open". The interface was priority one at the
time, so the trade was made at the highest-stakes surface in the product rather than a peripheral
one.

Legacy ADR-02 answers this question the opposite way to ADR-01. It explicitly denies craft was
the driver — "not a learning goal, not inertia from earlier brainstorming" — and grounds the
choice in performance and reliability instead. ADR-01, meanwhile, accepted an unfamiliar tool at
the highest-stakes surface as "a deliberate investment, made with eyes open". Both were written
by the same person about the same stack, and they disagree about whether enjoyment is a
legitimate input.
