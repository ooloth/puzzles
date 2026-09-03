---
updated: 2026-09-02
update_when: a restore is actually rehearsed, or the store arrangement is settled
decays: slow
status: active
---

# The backup turns out not to restore

## Threatens

The same intent as
[the durable copy stops being written](the-durable-copy-stops-being-written.md) — that a player's
work outlives any one device — at the moment it is being relied on most.

## How it happens

1. A backup mechanism exists and reports success. It may be a managed provider's automatic backups, a
   replication tool, or a scheduled dump.
2. Nobody restores from it, because there has been no reason to.
3. Something is lost — a disk, a region, a mistaken migration, a deleted row.
4. The restore is attempted for the first time under pressure, and fails, or succeeds into data that
   is incomplete, corrupt, or older than expected.

## Why here specifically

**No vendor examined claims to test-restore customer data**, and one states plainly that it is the
customer's job: Railway's backup guide says "A backup you have never restored is unverified."
Neon, Supabase, Render and PlanetScale make no claim either way. So the rehearsal is the maintainer's
work at both ends of the arrangement question, not only at the self-operated end.

**A backup can be correct and still unreachable.** In May 2026 Google Cloud auto-suspended Railway's
production account, taking down Railway's control plane; customer databases went offline and
customers could not retrieve their backups, because backup storage sat behind the same control plane.
The backup was not wrong. It was on the other side of the failure.

**A file-based store adds a way to take a backup that looks complete and is not.** SQLite's
documentation states that the WAL file "is part of the persistent state of the database and should be
kept with the database if the database is copied or moved. If a database file is separated from its
WAL file, then transactions that were previously committed to the database might be lost, or the
database file might become corrupted." A naive file copy produces exactly this, and it produces it
silently.

**There is no reliable industry figure for how often this happens**, and the widely repeated one is
folklore. The Gartner statistic usually cited does not trace to any Gartner publication. Real numbers
exist only in vendor-commissioned self-report surveys ranging from 31% to 58%, which is a spread wide
enough to be useless for planning. This entry exists because the failure is real, not because its
rate is known.

## How we'd notice

**Only by trying it.** A backup that has never been restored and a backup that cannot be restored are
indistinguishable from outside. Every dashboard reads the same in both cases, which is what makes
this worth writing down rather than assuming.

## What reduces it

A rehearsed restore, on a schedule, into somewhere other than production — and a record of when it
was last done. [Is the store's backup restorable?](../questions/is-the-stores-backup-restorable.md)
is where that gets decided; it currently sits at M11.

Nothing about the arrangement removes the need for it. A managed provider changes who runs the
storage, not who verifies the restore.
