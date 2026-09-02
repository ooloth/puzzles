---
opened: 2026-08-31
status: open
resolves_into: decision
---

# What runs the tests?

## Why it matters

The puzzle rules and the merge are pure modules whose correctness is the whole argument for
[one implementation of the puzzle rules](../decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md), and the portable
standards ask for branch coverage on exactly that kind of code. A runner that cannot measure it is
the wrong instrument regardless of how fast it is.

The interface half has a different requirement: an 81-cell grid, exercised through keyboard and
pointer input, in something that behaves enough like a browser to be worth trusting.

## What would settle it

Running the two shapes of test that matter — a pure module with branch coverage, and a rendered
grid driven by simulated input — and comparing watch-mode latency and the quality of a failure
message. The second matters more than it sounds: a runner that reports a failed assertion as a
timeout costs an afternoon every time it happens.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-08-31, filling in the stack decisions that had no question of their own.

## Options

*Vitest.* Shares configuration and transforms with Vite, has watch mode, branch coverage, and a
real-browser mode. The default if the build question lands where its research points.

*`bun test`.* Fast, and measured during the Bun research as materially weaker for this app
specifically.

*Node's built-in test runner.* No extra dependency; least support for component testing.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Four gaps in `bun test` were measured, and all four land on this app's shape.** No watch mode.
No branch coverage at all — and it reported full line coverage for a component whose keyboard
handler never ran, which is worse than reporting nothing. Snapshots of a rendered grid were
unusable. And a failing assertion against an 81-cell grid took six seconds and surfaced as a
timeout with the diff never printed.

*Measured — `bun test` run against this app's components.*

**Vitest under Bun is not a hedge.** It was shipped broken at the time of the research and is not
covered by Vitest's own test matrix.

*Sourced — Vitest's own test matrix.*
