---
opened: 2026-09-01
status: open
resolves_into: decision
---

# How is the system reset to a known state?

## Why it matters

A check that starts from whatever state the last check left behind is not repeatable, and comparing
two runs only means something if they started from the same place. Seed data and a reset that is
fast and repeatable are what let a check be run the same way twice — before and after a change, or
once now and once next week.

[../problem.md](../problem.md) names the solo maintainer as a stakeholder, and a reset that takes
real effort to perform is a reset that gets skipped. That is exactly the moment an agent verifying a
change on its own most needs a clean, known starting point, and without one it cannot tell whether a
result changed because of the change under test or because of leftover state.

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
