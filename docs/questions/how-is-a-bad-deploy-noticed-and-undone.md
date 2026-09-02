---
opened: 2026-09-01
status: open
resolves_into: decision
---

# How is a bad deploy noticed and undone?

## Why it matters

The deploy is the moment a working system becomes a broken one, and nothing right now watches that
moment or reverses it. Without a way to notice a bad deploy quickly and roll it back, a broken
deploy stays broken until a player notices and says something, or until the maintainer happens to
look.

[../problem.md](../problem.md) names the solo maintainer as a stakeholder, and this gap applies to
an agent as much as to a person: an agent that deploys a change has no way to confirm the deploy
succeeded, or to undo it if it did not, without the maintainer watching the outcome. A loop that runs
after every deploy and depends on someone watching is a loop that will eventually not get watched.

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
