---
opened: 2026-08-30
status: open
resolves_into: decision
---

# How would we learn that a real player lost progress?

## Why it matters

There is no error to report, and the player may simply never come back. A failure this severe
with no detection path is worth designing for deliberately rather than hoping someone
complains.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

Findings drawn from legacy ADR-18 (use Sentry for error tracking and alerting).

## Options

...

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Server-side error tracking cannot see this failure.** A service-side error tracker sees errors
the server produces, which is the right instrument only when the server holds the state. The client
holds it, so the failures that destroy a player's work — a rejected
write to local storage, an evicted origin, a stale worker that never updated — happen on the
device and produce no server-side event at all. Client-side reporting was not rejected; it was
never raised.

**Liveness is not health.** Platform health checks restart a crashed process and say nothing
about a disk filling up, a cache silently failing, or a write path that returns success without
persisting. A green check answers "is it running", which is a different question from "is it
working".
