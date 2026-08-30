# Use Axum with the official Datastar Rust SDK

> This ADR is being re-evaluated as part of a pivot from a server-first to a local-first
> architecture to support better offline UX. It may not reflect current thinking and should not be
> treated as guidance. See `docs/brainstorming/` (especially
> `ruthless-rearchitecture-for-mobile-first-offline-ux.md`) for the reasoning behind that pivot.

Status: Re-evaluating

## Context

- `docs/decisions/01-render-with-datastar-hypermedia.md` already commits to Datastar for rendering; this decides the web framework and how Datastar integrates with it.
- Considered: Axum vs Actix-web as the async web framework.
- Datastar has an official Rust SDK (`datastar` crate on crates.io, feature-gated integrations for Axum/Rocket/Warp) providing `PatchElements`/`PatchSignals`/`ExecuteScript` helpers. It doesn't own the SSE stream lifecycle — that's driven directly via Tokio channels in the handler.

## Decision

- Axum as the web framework.
- The official `datastar` crate with its `axum` feature for SSE patch helpers.

## Rationale

- Axum is the ecosystem-recommended default and has first-party Datastar SDK support; Actix-web's ~10-15% raw throughput edge doesn't matter for an I/O-bound, low-traffic, SSE-heavy workload.
- Using the official SDK avoids hand-rolling the Datastar SSE event-format protocol (`event: datastar-patch-elements\ndata: ...`) ourselves.

## Tradeoffs accepted

- None significant — this is close to the path of least resistance for this stack.

## Rejected

- **Actix-web**: faster in raw benchmarks, but no real benefit for this workload and weaker Datastar-ecosystem precedent.

## Reference implementation

- [Axum + SQLite/sqlx + Datastar tutorial](https://hamy.xyz/blog/2026-03_datastar-rust-todo) (March 2026) — a close sibling of this stack, not an exact match: it uses Maud for templating, not hypertext (`docs/decisions/06-use-hypertext-for-html-templating.md`). Useful for the Axum/sqlx/Datastar wiring; don't expect hypertext syntax from it.
