---
opened: 2026-09-01
status: open
resolves_into: decision
---

# What proves a vertical slice works end to end?

## Why it matters

Every milestone in [README.md](README.md) is described as a thin vertical slice: something that
"can be run and looked at end to end." That claim is only as real as what "looked at" actually
consists of — which command, which URL, which output counts as proof the slice works, as opposed to
proof its pieces individually compile or its tests pass in isolation.

[../verification.md](../verification.md) is currently a stub, and it is supposed to get its content
from answering this question, not the other way around. Without a concrete answer, each milestone's
observability claim is asserted rather than checkable. [../problem.md](../problem.md) names the solo
maintainer as a stakeholder, and this is the loop that runs after every milestone and every smaller
change inside one — an agent that finishes a slice has no way to confirm it actually works without
the maintainer watching it happen, unless this question has already been settled.

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
