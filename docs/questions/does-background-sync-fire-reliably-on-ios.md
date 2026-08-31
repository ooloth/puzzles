---
opened: 2026-08-30
status: open
resolves_into: constraint
---

# Does service worker background sync fire reliably on iOS?

## Why it matters

Any plan that syncs progress after connectivity returns without the app being open depends on
it. If it doesn't fire reliably, sync only happens when the player comes back — which changes
what durability can be promised.

## Blocked by

N/A — nothing needs to be answered first.

## Blocks

N/A — nothing waits on this.

## What would settle it

Documentation plus a real-device test.

## Resolves into

`constraints.md`.

## Source

Ported from the legacy documentation review, 2026-08-30.

## Options

N/A — this resolves into a fact, not a choice.

## Findings

...
