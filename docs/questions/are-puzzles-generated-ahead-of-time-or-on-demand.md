---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Are puzzles generated ahead of time or on demand?

## Why it matters

Decides whether generation ever sits on a path a player is waiting on. Ahead-of-time means it
never competes with play and can be as slow as it likes; on demand means its cost becomes a
latency budget. It also decides whether the server needs to run the generator at all, which
shapes what the server is for.

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

## Options

*Ahead of time.* Generation never competes with the interactive path and can take as long as it
needs. Costs storage for a pool, and a decision about how large a pool has to be before it can't
run dry.

*On demand.* No pool to maintain and no supply question. Puts generation cost directly in front
of a waiting player, and makes its worst case — not its average — the thing that matters.

## Findings

Several arguments in the corpus already assume the ahead-of-time answer. The legacy analysis
treats generation as "an offline batch job with no latency requirement", and that assumption is
load-bearing in the argument that a compiled language isn't needed. If it were reversed, the
performance question would matter considerably more.
