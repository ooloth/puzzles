---
opened: 2026-08-30
status: open
resolves_into: decision
---

# What renders the client?

## Why it matters

Sets the build tooling, the testing approach, and the speed of the inner development loop.

## Blocked by

[Does puzzle state live on the client or the server?](does-puzzle-state-live-on-the-client-or-the-server.md),
[What interactions must the grid support?](what-interactions-must-the-grid-support.md).

## Blocks

build tooling, [how the codebase is laid out](how-is-the-codebase-laid-out.md).

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

Options ported from legacy ADR-01 (render with server-driven hypermedia).

Criteria drawn from legacy ADR-06 (use hypertext for HTML templating).

## Options

*Pure server-driven hypermedia.* One rendering paradigm for the whole app, with no second UI
model to maintain beside it. Costs writing grid interaction in an expression DSL rather than in
the maintainer's stronger TypeScript, on a smaller-community tool with less prior art to lean on
when debugging fiddly interactions.

*Hybrid islands* — server-rendered pages with a hand-written TypeScript component for the grid
alone. Puts the maintainer's strongest skill at the highest-stakes surface. Costs a second UI
paradigm to maintain, and was previously rejected partly for breaking a "no custom JS" goal that
was itself a preference rather than a requirement.

*Client-heavy application with a data API.* Previously rejected for abandoning a
server-owned-state philosophy the project no longer holds.

## Findings

Two properties are worth testing each option against, and both hold whichever one wins, so they
are standards rather than inputs to the choice: whether the approach escapes output by default,
and whether it validates markup when the code is built rather than when a page is served. Both
are in the portable standards described in [../standards/README.md](../standards/README.md).
