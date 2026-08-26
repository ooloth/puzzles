# Use GitHub Actions for CI

Status: Decided

## Context

- Repo is already hosted on GitHub.
- Need automated checks on push/PR: formatting, linting, tests.

## Decision

- GitHub Actions running `cargo fmt --check`, `cargo clippy`, and `cargo test` on every push and PR.

## Rationale

- Standard, low-effort default that requires no additional hosting/account setup beyond what's already in place.

## Tradeoffs accepted

- None significant.
