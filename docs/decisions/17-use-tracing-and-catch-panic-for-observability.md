# Use tracing + TraceLayer + CatchPanicLayer for logging and panic handling

Status: Decided

## Context

- Needed a baseline for production observability at the application level: structured logs and safety against a single handler panic crashing the whole process.
- Considered `tracing` + `tracing-subscriber` + `tower_http::trace::TraceLayer` vs a simpler approach (plain `println!`/the `log` crate).

## Decision

- `tracing` + `tracing-subscriber` (`EnvFilter` driven by `RUST_LOG`) for structured, request-scoped logs, via `tower_http::trace::TraceLayer`.
- `tower_http::catch_panic::CatchPanicLayer` to convert a panicking request handler into a 500 response instead of crashing the process.

## Rationale

- This is the standard, idiomatic 2026 pattern for a production Axum app — not a novel choice.
- `TraceLayer` gives request-scoped spans for free rather than hand-rolling per-handler logging.
- `CatchPanicLayer` is cheap insurance: one bad request shouldn't take down every concurrent user's session.

## Tradeoffs accepted

- None significant — this is close to the path of least resistance for Axum.

## Rejected

- **Plain `println!`/the `log` crate**: less structured, no span-based request tracing, no clean integration path to the error-tracking tool chosen in `18-use-sentry-for-error-tracking-and-alerting.md`.
