# Use SQLite as the data store

Status: Decided

## Context

- Solo maintainer, ops-complexity-averse (dislikes k8s-grade infra, fine with lightweight/GitOps-able scripting).
- Launch scale: small, genuinely public, not designing for growth yet (see `docs/vision.md`).
- Vision principle: add infrastructure because the app requires it now, not because it might someday.

## Decision

- SQLite.

## Rationale

- Zero server process to run/patch/monitor — the DB is a file next to the app.
- Trivial local dev — nothing to install or start.
- Matches current expected scale; SQLite's single-writer-at-a-time model (WAL mode) is not a real constraint for infrequent, small per-user progress writes at this audience size.
- Clean, well-understood upgrade path to Postgres if the "real product" branch in the vision ever actually materializes and demands concurrent writers or multiple app instances.

## Tradeoffs accepted

- Backups need explicit tooling (e.g. Litestream, periodic file copy) rather than "standard" managed-DB backups — a solved, well-trodden pattern, just not zero-effort.
- No native multi-instance/concurrent-writer support — acceptable now, revisit if/when scale demands it.

## Rejected

- **Postgres now**: avoids a future migration and adds native multi-instance support, but pays real ops complexity today for a scale scenario that's currently hypothetical.
