# Test Axum routes with a mixed strategy

Status: Decided

## Context

- Datastar's core interaction pattern is a long-lived SSE stream (`GET` that stays open), not simple request/response — this doesn't fit a single uniform testing approach well.
- Considered: in-process `tower::ServiceExt::oneshot` against the Router (fast, no real network) vs a fully spawned server tested via `reqwest` (realistic, but slower, and needed to exercise an actual open stream).

## Decision

- `tower::ServiceExt::oneshot` for ordinary request/response routes.
- A spawned server + `reqwest` specifically for SSE streaming endpoints, since `oneshot` can't exercise a genuine long-lived stream.

## Rationale

- Matches the testing tool to what's actually being tested rather than forcing one approach everywhere: most routes are simple request/response and don't need the overhead of a real server; SSE routes genuinely need one to be tested meaningfully.

## Tradeoffs accepted

- Two testing patterns to maintain instead of one, though each is applied to a distinct, easily-identified class of route.
