# Use Axum with the official Datastar Rust SDK

Status: Decided

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
