---
opened: 2026-09-01
status: open
resolves_into: decision
---

# What is worth being woken up for?

## Why it matters

This is alerting, not monitoring: which conditions justify interrupting the maintainer
immediately, and which belong in something looked at deliberately instead. An alert that fires for
a condition nobody needs to act on right then trains the maintainer to ignore the next one too,
and the next real incident gets the same shrug as the noise before it.

[../problem.md](../problem.md) names the solo maintainer as a stakeholder, and a solo maintainer
has no rotation to hand an alert off to — every alert that fires is one interruption to one
person, with no floor under how bad a condition has to get before it costs someone something. Left
undecided, everything either alerts or nothing does, and both are wrong for different reasons.

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
