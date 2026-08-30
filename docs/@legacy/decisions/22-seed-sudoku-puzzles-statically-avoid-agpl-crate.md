# Seed Sudoku puzzles statically at first; avoid the AGPL `sudoku` crate

> This ADR is being re-evaluated as part of a pivot from a server-first to a local-first
> architecture to support better offline UX. It may not reflect current thinking and should not be
> treated as guidance. See `docs/brainstorming/` (especially
> `ruthless-rearchitecture-for-mobile-first-offline-ux.md`) for the reasoning behind that pivot.

Status: Re-evaluating

## Context

- `docs/decisions/21-launch-with-sudoku-then-star-battle.md` established Sudoku as the launch puzzle type.
- Needed a small amount of puzzle content immediately to validate rendering, session/progress persistence, and hosting end-to-end — before any sourcing-vs-generation strategy is settled.
- Individual Sudoku grids are not copyrightable — legal consensus via the merger doctrine and idea/expression dichotomy treats a valid, unique-solution number arrangement as a functional fact, not creative expression. What can carry compilation copyright is a specific curated collection (a publisher's book, its ordering/branding), not raw grids. This removes licensing risk from using a small handful of puzzles from anywhere, or hand-crafting them, for this immediate need.
- Investigated the `sudoku` crate (crates.io) as a possible shortcut for generating puzzle content in volume later. Found it disqualifying regardless of how launch content ultimately gets sourced: it's **AGPL-3.0 licensed**, whose network-use clause would generally require making this project's complete running-service source available under AGPL-3.0 to any user — a real conflict with the "real product" branch in `docs/vision.md` if that ever materializes. It also has neither difficulty grading nor symmetric clue-removal implemented (both listed as the crate's own future goals).
- Whether real launch content ultimately comes from sourcing puzzles externally or from self-generating them is a separate, still-open question (see `docs/vision.md`) — not resolved by this decision.

## Decision

- Seed a small, hand-picked static set of Sudoku puzzles (roughly 5-10), hardcoded or in a seed file, with zero generation logic, purely to validate the pipeline end-to-end.
- If and when custom Sudoku generation is built — regardless of whether that ends up gating launch or arriving after it — it will be in-house logic, not the `sudoku` crate, since the underlying algorithm (fill via randomized backtracking, remove cells while checking unique solvability) is simple and well-understood enough to build directly, with difficulty grading and symmetric clue-removal designed in from the start.

## Rationale

- Unblocks pipeline/UI work immediately without waiting on a sourcing-vs-generation decision that doesn't need to be made yet.
- Avoids the AGPL-3.0 network-use clause entirely, independent of whatever the eventual launch-content strategy turns out to be.
- The in-house-generation default, if it's ever built, is a small, contained effort — meaningfully different from the deliberately-deferred generation R&D needed for harder future types like Star Battle, which lack a single known algorithm.

## Tradeoffs accepted

- The static seed set won't scale as real content — explicitly a throwaway bridging step, not a launch content source.
- Custom generation logic, if built, means maintaining that code rather than depending on a library — accepted since the one library candidate evaluated failed on both licensing and features.

## Rejected

- **The `sudoku` crate**: AGPL-3.0 licensing risk, plus missing difficulty grading and symmetric clue-removal.
- **Deciding the sourced-vs-generated launch strategy now**: unnecessary — this decision only needed to unblock immediate pipeline work, not settle launch content strategy.
