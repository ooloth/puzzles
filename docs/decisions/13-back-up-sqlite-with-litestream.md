# Back up SQLite with Litestream

> This ADR is being re-evaluated as part of a pivot from a server-first to a local-first
> architecture to support better offline UX. It may not reflect current thinking and should not be
> treated as guidance. See `docs/brainstorming/` (especially
> `ruthless-rearchitecture-for-mobile-first-offline-ux.md`) for the reasoning behind that pivot.

Status: Re-evaluating

## Context

- `docs/decisions/03-use-sqlite-as-the-data-store.md` makes the SQLite file the one copy of everyone's progress — it needs a real, host-independent backup/disaster-recovery mechanism.
- Considered: Litestream (continuous WAL streaming to object storage) vs a simpler periodic file-copy cron job vs relying solely on the hosting platform's own volume snapshots.
- `docs/decisions/12-host-on-fly-io.md` explicitly disables Fly's own billed volume snapshots in favor of this decision.

## Decision

- Litestream, continuously streaming the SQLite file's WAL to an S3-compatible object store (e.g. Cloudflare R2).

## Rationale

- Standard, mature, dependency-free tool built specifically for this job, with sub-second replication lag.
- R2's free tier (10GB storage + 1M write-ops + 10M read-ops/month) should cover a hobby-scale write volume at $0/mo.
- Decouples backup/disaster-recovery from whichever hosting platform is in use — survives the Fly-to-VPS upgrade path in ADR-12 unchanged, unlike a platform-native snapshot feature.

## Tradeoffs accepted

- One more moving part (a Litestream process) to run and monitor, though it's a single static binary with minimal operational surface.
- Known integration gotcha to handle at implementation time: R2's endpoint needs an environment-variable workaround for Litestream's `replica_endpoint` config.

## Rejected

- **Relying solely on host-provider volume snapshots** (e.g. Fly's automatic snapshots): couples the backup strategy to the hosting platform, and Fly's snapshots are billed with compounding retention costs — actively worse than Litestream+R2's likely-free cost, and wouldn't survive a future hosting migration.
- **Simple periodic file-copy cron job**: viable, but a coarser recovery point objective (potential data loss between copies) with no real simplicity advantage over Litestream, which is equally low-effort to set up.
