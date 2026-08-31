---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Are puzzles generated ahead of time or on demand?

## Why it matters

Decides whether generation ever sits on a path a player is waiting on. Ahead of time means it
never competes with play and can be as slow as it likes; on demand means its cost becomes a
latency budget. It also decides whether the server needs to run the generator at all, which
shapes what the server is for.

This covers process topology as well as timing — whether generation is its own program or a task
inside the server is part of the same decision.

Currently assumed rather than decided. Nothing in the documentation records the choice or its
reasoning, while several arguments already lean on generation being batch work nobody waits on.

## Blocked by

[How expensive is puzzle generation?](how-expensive-is-puzzle-generation.md) — if generation is
genuinely cheap, on demand stays viable and the question is open; if it isn't, it settles itself.

## Blocks

[Where does this run?](where-does-this-run.md),
[What does the server store, if anything?](what-does-the-server-store-if-anything.md).

## What would settle it

The cost question above, plus whether the product model needs an unbounded supply of distinct
puzzles or a curated finite set.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised in conversation, 2026-08-30, on noticing that arguments elsewhere already assume
ahead-of-time generation without it having been decided.

Options and findings ported from legacy ADR-04 (separate puzzle generation from serving).

## Options

*Ahead of time, as a separate program run on a schedule.* Never competes with request handling,
and can be developed, run and tested without starting the server at all — which is the argument
that holds regardless of how expensive generation turns out to be. Costs a scheduling mechanism,
a store both processes can reach, and some structure existing before any generation code does.

*Ahead of time, as a background task inside the server.* Nothing extra to deploy or schedule.
Puts batch work in the same process as request handling, and makes generation impossible to
exercise without booting the server. This is the arrangement legacy ADR-04 specifically rejected.

*On demand, in the request path.* No pool to maintain and no supply question. Generation's worst
case — not its average — becomes a player's wait.

*On demand, via a job queue.* Keeps generation off the request path without a schedule, but adds
infrastructure for a problem that may not exist at this scale.

Note that two processes sharing a store constrains deployment: under the previous design, the web
app and the generator sharing one database file is what forced them onto a single machine.

## Findings

Several arguments in the corpus already assume the ahead-of-time answer. The legacy analysis
treats generation as "an offline batch job with no latency requirement", and that assumption is
load-bearing in the argument that a compiled language isn't needed. If it were reversed, the
performance question would matter considerably more.

Legacy ADR-04 settled this at the process level — one workspace, two binaries, generation as a
standalone program rather than a background task — while explicitly declining to decide module
organisation, which it said "deserves its own dedicated discussion". Its stack-specific parts are
dead; the stance that generation is a separate process is not.

It accepted, honestly, that this puts some structure in place before any generation code exists,
and noted the tension with adding complexity only when required.
