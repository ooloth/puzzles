---
opened: 2026-09-01
status: open
resolves_into: decision
---

# What invariants hold at runtime, and what checks them?

## Why it matters

The rules module and the store both have properties that must always be true: a board never has
two values in one cell, a stored puzzle always has exactly one solution, a player's record always
parses. Nothing today asserts any of these. Without an assertion, a bug that produces an invalid
board fails silently — the corrupted state gets read back, rendered, and played on top of, and
nobody finds out until much later, if ever.

[../guarantees/correctness.md](../guarantees/correctness.md) names "a partial write is never
observable" and "the board on screen always matches the board in storage" as candidate promises.
Neither is checkable without something asserting it — a promise with no assertion behind it is a
claim, not a guarantee.

The same assertions are what let an agent verify a change without the maintainer watching. A test
that only checks the happy path can pass while quietly producing an invalid board; an assertion
that runs on every write catches it regardless of which test exercised the path.

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
