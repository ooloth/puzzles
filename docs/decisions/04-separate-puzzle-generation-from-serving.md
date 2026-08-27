# Separate puzzle generation from serving

Status: Decided (process shape only — generation itself is not yet built, per `docs/vision.md`; internal workspace/crate organization is a separate, later decision)

## Context

- The project has two concerns: solving UX (priority now) and puzzle generation (deferred, later, expected to be CPU-bound).
- Wanted to settle the process-level relationship between them now, lightly, so the web app's structure doesn't accidentally paint us into a corner later — without building anything generation-related yet, and without prescribing internal workspace/crate organization, which deserves its own dedicated discussion rather than being decided as a side detail here.

## Decision

- One Cargo workspace, two binaries:
  - the web app (Axum + Datastar rendering)
  - a separate puzzle-generator binary
- Both read/write the same SQLite file.
- Generation is a standalone process, not a background task inside the web server.

## Rationale

- Keeps a long, CPU-bound generation run from ever competing with request-handling in the same process.
- Generation can be developed, run, and tested standalone (`cargo run --bin generate`) without spinning up the web server.

## Tradeoffs accepted

- Small amount of upfront workspace/binary structure exists before any generation code does — judged lightweight enough not to conflict with "add complexity only when needed."
