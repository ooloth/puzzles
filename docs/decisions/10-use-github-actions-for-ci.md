# Use GitHub Actions for CI

> This ADR is being re-evaluated as part of a pivot from a server-first to a local-first
> architecture to support better offline UX. It may not reflect current thinking and should not be
> treated as guidance. See `docs/brainstorming/` (especially
> `ruthless-rearchitecture-for-mobile-first-offline-ux.md`) for the reasoning behind that pivot.

Status: Re-evaluating

## Context

- Repo is already hosted on GitHub.
- Need automated checks on push/PR: formatting, linting, tests.

## Decision

- GitHub Actions running `cargo fmt --check`, `cargo clippy`, and `cargo test` on every push and PR.

## Rationale

- Standard, low-effort default that requires no additional hosting/account setup beyond what's already in place.

## Tradeoffs accepted

- None significant.
