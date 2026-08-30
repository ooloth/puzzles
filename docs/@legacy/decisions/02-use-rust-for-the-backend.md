# Use Rust for the backend

> This ADR is being re-evaluated as part of a pivot from a server-first to a local-first
> architecture to support better offline UX. It may not reflect current thinking and should not be
> treated as guidance. See `docs/brainstorming/` (especially
> `ruthless-rearchitecture-for-mobile-first-offline-ux.md`) for the reasoning behind that pivot.

Status: Re-evaluating

## Context

- Author has strong TS/JS experience, only moderate Rust experience — language was reopened for reconsideration rather than inherited.
- Puzzle generation (deferred, but planned) is expected to be CPU-bound: backtracking search, uniqueness verification. Grid/answer validation logic may also be perf-sensitive.
- Rendering approach (Datastar) is backend-language-agnostic, so it didn't force this choice either way.

## Decision

- Rust for the backend, written "Easy Mode": owned data, liberal `.clone()`, avoid lifetimes/generics/trait complexity where a simpler owned-data approach works.

## Rationale

- The real driver is performance/reliability for future compute-heavy puzzle-generation and validation workloads — not a learning goal, not inertia from earlier brainstorming.
- "Easy Mode" style keeps day-to-day velocity close to what a GC'd language would give, while keeping the performance ceiling available for generation work later.

## Tradeoffs accepted

- Slower to write than TS today, given moderate (not deep) Rust fluency — mitigated by deliberately avoiding Rust's hardest features.

## Rejected

- **TypeScript/Node backend**: would fully leverage existing strength and unify the stack on one language, but forgoes the performance/reliability upside wanted specifically for generation workloads.
