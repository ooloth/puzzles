# Organize the codebase by domain concept, not technical layer

Status: Decided

## Context

- `docs/decisions/04-separate-puzzle-generation-from-serving.md` settled the process-level split (web app binary + generator binary sharing a SQLite file) but deliberately left internal workspace/crate organization as a separate decision, to avoid presupposing an answer before it was actually explored.
- Wanted folders to tell the story of what the codebase does — organized by domain concept (what a puzzle is, what a player is, how storage works) rather than by technical layer (a single `routes/`, `views/`, `models/` spanning every game).
- Considered: one shared "core" domain crate with per-game modules inside it, vs. a separate Cargo crate per game, vs. splitting further into per-game domain crates plus per-game "web" crates.
- Reconsidered introducing a shared `Puzzle` trait for cross-game polymorphism — found no actual use site needing it. Both `app`'s router assembly and `generator`'s CLI dispatch just call known functions from known crates directly; a trait would have been exactly the kind of premature abstraction "Easy Mode Rust" (`docs/decisions/02-use-rust-for-the-backend.md`) and this project's broader engineering standards warn against.
- Reconsidered where SQLite/sqlx access should live — game crates staying I/O-free keeps them trivially testable without a database, and centralizes the one thing that's genuinely uniform across every game (how player progress gets persisted) in a single place.
- Reconsidered whether each game's web-facing routes/views need their own crate — found they don't, since `app` already depends on Axum/hypertext regardless and is the only binary that ever uses them; splitting them out would add crate ceremony with no compile-isolation benefit.

## Decision

One Cargo workspace, organized as:

- `app` (binary) — the website. HTTP routes/views for each game live as modules within `app` (e.g. `app/src/sudoku/{routes.rs, views.rs}`), not as separate crates.
- `generator` (binary) — the puzzle-generation CLI. Each game's generation entrypoint lives as a module within `generator` (e.g. `generator/src/sudoku.rs`).
- `player` (library crate) — the domain concept of a session and its progress. No I/O.
- `storage` (library crate) — the one place that knows SQLite exists. Persists player/progress; stores puzzle content as opaque bytes it doesn't need to understand structurally.
- One domain crate per game (`sudoku`, `star_battle`, ...) — that game's rules: grid representation, validation, solving, generation. No I/O, no web dependencies.

No shared `Puzzle` trait. Cross-game dispatch (router assembly in `app`, CLI dispatch in `generator`) uses ordinary function calls per game, not trait objects.

## Rationale

- Every folder/crate name directly answers a "where would I find X" question, rather than requiring someone to know which technical layer a concept happens to live in.
- A crate boundary is reserved for the one distinction that actually matters structurally: domain logic shared by two different binaries (worth compile isolation as more games are added) versus binary-specific glue (which only ever has one consumer, so a separate crate buys nothing).
- Avoiding the trait keeps the codebase's abstractions driven by actual duplicated-code pain rather than anticipated-but-unconfirmed need.

## Tradeoffs accepted

- A new `Cargo.toml` and workspace-member entry per game, growing mechanically as the puzzle catalog grows — accepted since it matches the project's own stated "gradual rollout" model (`docs/vision.md`, `docs/decisions/21-launch-with-sudoku-then-star-battle.md`) rather than fighting it.
- The exact wiring between `storage` and `player`/game crates (function signatures, serialization format, schema shape) is deliberately left unspecified here — that's implementation detail for an actual `/design` pass, not a layout decision.

## Rejected

- **A single shared "core" crate with per-game modules inside**: keeps the workspace smaller, but means editing any one game's domain logic recompiles every other game sharing that crate, and gives no real API boundary between games — nothing but convention stops one game's code from reaching into another's internals.
- **A `Puzzle` trait for cross-game polymorphism**: no actual use site needs it yet; would have been introduced speculatively rather than in response to real duplicated code.
- **A separate crate per game for web-facing routes/views** (e.g. `sudoku_web`): `app` is the only consumer of that code and already depends on Axum/hypertext regardless, so a separate crate would add ceremony without any compile-isolation or dependency-hygiene benefit.
