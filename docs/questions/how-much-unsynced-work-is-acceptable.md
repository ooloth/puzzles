---
opened: 2026-08-30
status: open
resolves_into: decision
---

# How much unsynced work is acceptable?

## Why it matters

Turns "progress is never lost" from a slogan into something testable. It also sets the sync
cadence, which trades directly against battery — mobile radios are expensive to wake regardless
of how little data moves.

## What would settle it

...

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**A write the server has acknowledged can still be lost, and then neither side holds it.** Litestream
copies each write off the machine about once a second by default, so a machine that dies loses the
last second or so of writes it had already acknowledged. If the client deletes its own copy of a
write as soon as the server acknowledges it, a write inside that window survives nowhere. Whether that
can happen depends on what the client treats as "synced": the server's acknowledgement, or
confirmation that the write has left the machine. Nothing records which it is. This question owns
that choice for the client. [How is the store backed up?](how-is-the-store-backed-up.md) owns the
size of the window. It applies in production only, since a local run has no machine to lose.

*Reasoned 2026-10-05 from the one-second default quoted in
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) and
[how is the store backed up?](how-is-the-store-backed-up.md). Not observed.*
