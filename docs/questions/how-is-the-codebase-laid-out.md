---
opened: 2026-08-30
status: open
resolves_into: decision
---

# How is the codebase laid out?

## Why it matters

How modules are organised inside the repo: what a directory is named for, and whether a reader can
answer "where would I find X" without knowing which technical layer X lives in.

**This does not cover how many packages there are.** That is
[what is the repo's top-level shape?](what-is-the-repos-top-level-shape.md), which blocks
scaffolding and is answered separately. What is left here is the tree inside whatever that decides,
and it is not blocking anything, because there are no modules yet.

## Blocked by

[What is the repo's top-level shape?](what-is-the-repos-top-level-shape.md) and
[what renders the client?](what-renders-the-client.md). Mostly, though, it waits on there being
enough code for the shape of it to be visible.

## Blocks

N/A — nothing waits on this.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Options ported from legacy ADR-23 (organize by domain concept, not technical layer).

## Options

*By domain concept.* Folders named for what the code is about — a player and their progress, one
game's rules, storage — so a name answers "where would I find X" without the reader knowing which
technical layer a concept lives in.

*By technical layer.* One `routes/`, `views/`, `models/` spanning every game.

Within domain organisation, a second choice: one shared module holding every game's rules, or a
module per game. A shared module keeps the tree smaller, but editing one game recompiles the
others and nothing but convention stops one game reaching into another's internals.

## Findings

The number of consumers of a game's rules changes with the architecture, and that is what decides
whether a common interface across games is worth having. A server-rendered design had two — a web
binary and a generator — which was too few to justify one. A local-first design has three,
generator, client and possibly a server, across two runtimes. Three consumers across a runtime
boundary is the pressure that actually produces a shared interface, so the answer here follows
from [ADR-0002](../decisions/0002-the-client-holds-and-mutates-puzzle-state.md) and the runtimes it implies
more than from taste.

The structural criteria this answer has to satisfy — where a package boundary is earned, when
repetition is acceptable, and domain logic staying free of I/O — hold whichever option wins, so
they aren't inputs to the choice. They live in the portable standards described in
[../standards/README.md](../standards/README.md).
