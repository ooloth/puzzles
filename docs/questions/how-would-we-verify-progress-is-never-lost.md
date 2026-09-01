---
opened: 2026-08-30
status: open
resolves_into: decision
---

# How would we verify progress is never lost?

## Why it matters

This can't be checked by unit tests. Backgrounding, tab kill, and OS memory purge need real
devices or an instrumented harness, and no approach has been proposed. Until one exists, the
most consequential guarantee in the product is enforced by nothing.

## Blocked by

[How much unsynced work is acceptable](how-much-unsynced-work-is-acceptable.md).

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

## Options

...

## Findings

...
