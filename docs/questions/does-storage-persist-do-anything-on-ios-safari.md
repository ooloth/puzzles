---
opened: 2026-08-30
status: open
resolves_into: constraint
---

# Does `navigator.storage.persist()` do anything on iOS Safari?

## Why it matters

It's the commonly recommended API for durable storage and it appears nowhere in WebKit's
tracking-prevention documentation. If it works, it's a second mitigation for the seven-day
wipe. If it doesn't, code that calls it is false reassurance.

## Blocked by

N/A — nothing needs to be answered first.

## Blocks

N/A — nothing waits on this.

## What would settle it

Testing on a real device. An afternoon's work.

## Resolves into

`constraints.md`.

## Source

Ported from the legacy documentation review, 2026-08-30.

## Options

N/A — this resolves into a fact, not a choice.

## Findings

...
