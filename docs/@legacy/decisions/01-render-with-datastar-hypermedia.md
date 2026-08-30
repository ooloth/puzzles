# Render with server-driven hypermedia (Datastar)

> This ADR is being re-evaluated as part of a pivot from a server-first to a local-first
> architecture to support better offline UX. It may not reflect current thinking and should not be
> treated as guidance. See `docs/brainstorming/` (especially
> `ruthless-rearchitecture-for-mobile-first-offline-ux.md`) for the reasoning behind that pivot.

Status: Re-evaluating

## Context

- Priority #1 is world-class solving UX (see `docs/vision.md`) — puzzle grids need zero-lag drag-select, keyboard nav, live highlighting.
- Author has strong TS/React experience, only moderate Rust experience.
- Considered: pure hypermedia (Datastar), client-heavy SPA + JSON API, hybrid (hypermedia + hand-written JS/TS island for the grid).

## Decision

- Server-rendered HTML via Datastar. No hand-written JS/TS anywhere, including the puzzle grid.
- Server owns state; ephemeral UI-only interaction (drag-in-progress, hover) uses Datastar's local signals, not round-trips.

## Rationale

- Datastar's local signal/expression system can do zero-round-trip drag/keyboard interactions without abandoning server-owned state — the "instant feel" and "server-owned state" goals aren't actually in conflict.
- Keeps one rendering paradigm for the whole app rather than mixing hypermedia pages with a separate JS component model.

## Tradeoffs accepted

- Grid interaction logic will be written in Datastar's expression/signal DSL, not the author's stronger TS/React skillset — a deliberate investment, made with eyes open after discussion.
- Datastar is a newer, smaller-community tool than React — less tooling/prior art to lean on when debugging fiddly interactions.

## Rejected

- **Hybrid islands** (hand-written TS component for the grid only): would have leveraged existing TS strength at the highest-stakes UI surface, but introduces a second UI paradigm to maintain and breaks the "no custom JS" goal.
- **Client-heavy SPA + API**: would abandon the server-owned-state philosophy the project wants from v1.
