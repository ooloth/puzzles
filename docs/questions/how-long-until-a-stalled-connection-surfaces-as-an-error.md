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

## What would settle it

Measurement on a real device on a real degraded link.

## Resolves into

`constraints.md`.

## Source

Ported from the legacy documentation review, 2026-08-30.

## Options

N/A — this resolves into a fact, not a choice.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**A library's built-in retry usually hangs off a thrown fetch error, which the tunnel case never
produces.** Recorded of Datastar specifically: its retry and backoff fire only on a thrown fetch
error, not on a silent stall, with no idle-timeout detection and no default reconnect behaviour. The
observation generalises — any reconnect logic built on `fetch` rejecting is blind to a connection
that is up and delivering nothing, which is exactly what [../constraints.md](../constraints.md)
records happens during cell-tower handoff. Detecting a stall needs a timer the application owns, not
an error handler.

*Unverified — no source recorded. Ported from a brainstorming document on 2026-09-01.*

**The same shape appears in a real protocol's design.** TigerBeetle's client protocol states
"Requests do not time out. Clients will continuously retry requests until they receive a reply from
the cluster," on the grounds that during a partition, silence is ambiguous between "never arrived"
and "reply lost" — so they refuse to guess and make the request idempotent instead. The limit for
us: retrying forever is wrong for a browser tab a player can close, so the idempotency half
transfers and the never-give-up half does not.

*Sourced — TigerBeetle client requests docs, https://docs.tigerbeetle.com/coding/requests/.*
