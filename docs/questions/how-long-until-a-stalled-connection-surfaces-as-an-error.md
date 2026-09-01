---
opened: 2026-08-30
status: open
resolves_into: constraint
---

# How long until a stalled connection surfaces as an error?

## Why it matters

A connection that is nominally up but stalled is the modal failure in a tunnel, and it is the
one most network code handles worst — retry logic typically fires on a thrown error, which a
silent stall never produces. No timeout figure exists anywhere.

## Blocked by

N/A — nothing needs to be answered first.

## What would settle it

Measurement on a real device on a real degraded link.

## Resolves into

`constraints.md`.

## Source

Ported from the legacy documentation review, 2026-08-30.

## Options

N/A — this resolves into a fact, not a choice.

## Findings

...
