# Use anyhow for error handling

> This ADR is being re-evaluated as part of a pivot from a server-first to a local-first
> architecture to support better offline UX. It may not reflect current thinking and should not be
> treated as guidance. See `docs/brainstorming/` (especially
> `ruthless-rearchitecture-for-mobile-first-offline-ux.md`) for the reasoning behind that pivot.

Status: Re-evaluating

## Context

- `docs/decisions/02-use-rust-for-the-backend.md` commits to "Easy Mode" Rust: owned data, minimal ceremony.
- Considered: `anyhow` (simple, `.context()`-based error bubbling) vs `thiserror` (explicit error enums per module, more structured/matchable).

## Decision

- `anyhow` throughout the app.

## Rationale

- Matches the Easy Mode philosophy — minimal ceremony, error bubbling via `.context()` without defining enums for errors nothing needs to match on.
- `thiserror` remains an option later at a specific boundary, if callers ever genuinely need to match on error variants (e.g. a public library crate) — not needed now.

## Tradeoffs accepted

- Less structured errors app-wide; acceptable since nothing in this app currently needs callers to branch on specific error variants.
