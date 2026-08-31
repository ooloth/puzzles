---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Is puzzle state a snapshot or an event log?

## Why it matters

Shapes the sync protocol, how undo works, and what "the same board" means when two copies have
to be reconciled.

## Blocked by

[Does puzzle state live on the client or the server](does-puzzle-state-live-on-the-client-or-the-server.md),
[Is undo in scope, and how far back](is-undo-in-scope-and-how-far-back.md).

## Blocks

[what happens to a losing write](what-happens-to-a-losing-write-when-syncing.md),
[is undo in scope](is-undo-in-scope-and-how-far-back.md).

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

## Options

*Versioned snapshot with last-write-wins.* Small and simple; right-sized for roughly 81
independent scalar values.

*Event log.* Undo falls out for free and replay is cheap at 50-300 actions per game, but it
is more moving parts to build and keep correct.

## Findings

...
