---
opened: 2026-09-01
status: open
resolves_into: decision
---

# What invariants hold over stored data, and how are they audited?

## Why it matters

This is distinct from
[what invariants hold at runtime, and what checks them?](what-invariants-hold-at-runtime-and-what-checks-them.md):
that question asks what one operation asserts about itself as it runs. This one asks what remains
true across every row after the fact, which a single operation's assertions cannot catch.

A board can reference a puzzle that was deleted. A play record can survive the player it belongs
to. Each write that produced these can be valid at the moment it runs, and the corruption exists
only in the relationship between rows written at different times. A request path checks only the
rows it touches, so it will never find this — a periodic audit that scans the whole store is the
only thing that can.

The same audit is what lets an agent confirm a change hasn't left orphaned data behind, without
the maintainer checking by hand.

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
