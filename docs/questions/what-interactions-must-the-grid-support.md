---
opened: 2026-08-30
status: open
resolves_into: decision
---

# What interactions must the grid support?

## Why it matters

Sets what the interface has to do, which in turn sets what "instant" has to cover and how capable
the client has to be. Three interactions have been asserted as requirements with nothing
corroborating them, and building for the wrong set is expensive at the highest-stakes surface in
the product.

## Blocked by

N/A — nothing needs to be answered first.

## Blocks

[What renders the client?](what-renders-the-client.md),
[What latency budget makes "immediately" checkable?](what-latency-budget-makes-immediately-checkable.md),
[Is accessibility in scope for v1?](is-accessibility-in-scope-for-v1.md).

## What would settle it

Solving puzzles on paper and in existing apps, and noticing which interactions carry the
experience and which are decoration.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Legacy ADR-01 (render with server-driven hypermedia), which asserted three interactions as
requirements.

## Options

...

## Findings

Legacy ADR-01 states that puzzle grids "need zero-lag drag-select, keyboard nav, live
highlighting". Nothing else in the corpus corroborates any of the three, and no user research
exists anywhere in this project's history. Treat them as the previous author's judgement rather
than as established requirements.

Live highlighting carries a cost nobody costed: highlighting the cells related to the current
selection means recomputing those relationships on every cursor move, which is exactly the
per-input work a latency budget has to accommodate.
