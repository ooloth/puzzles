---
opened: 2026-09-03
status: open
resolves_into: decision
---

# How is the store backed up?

## Why it matters

**The store holds the last copy of a player's work.** That is what
[ADR-0009](../decisions/0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md) makes it
for: the copy that survives when the device does not. So the backup is not an operational detail
beneath the store decision — it is the mechanism by which that record's whole purpose is kept.

**A store opened as a file concentrates the risk on one disk.** Fly states the consequence in its own
words: "If your app needs a volume to function, and the NVMe drive hosting your volume fails, then
that instance of your app goes down. There's no way around that." Volumes are not replicated among
themselves, and Fly's own documentation says daily snapshots "shouldn't be your primary backup
method."

**The thing that would make a file store regrettable is not the engine.** SQLite is about as
battle-tested as software gets. The replication tooling is not: it is a much smaller project, and
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) records a report of a
critical data-loss bug in a 2025 Litestream release and an unexplained corruption-after-restore issue,
both second-hand and neither re-checked. A single recovery path resting on a single small dependency
is the weakest link in the chain, and it is worth designing around rather than hoping about.

**The failure this guards against is silent and already described.**
[The backup turns out not to restore](../failure-modes/the-backup-turns-out-not-to-restore.md) and
[the durable copy stops being written](../failure-modes/the-durable-copy-stops-being-written.md) are
both entries with "we wouldn't notice" as their answer.

## What would settle it

Designing the recovery paths and saying how many there are, what each one costs, and what each one
fails to protect against. The leading shape — recorded here as a candidate rather than an answer — is
**more than one independent path, chosen so that they fail for different reasons**: continuous
replication to object storage, the platform's own volume snapshots, and a periodic independent dump
(`VACUUM INTO` to a second file, shipped elsewhere) that shares no code with the replication tool.

Three cheap mechanisms that fail independently are worth more here than one good mechanism, because
the failure being guarded against is precisely that the one good mechanism was quietly not working.

**That shape has not been researched and should not be adopted because it sounds sensible.** It needs
the same pass as everything else: what each mechanism actually guarantees, what its recovery point
and recovery time are, what it costs, whether the paths are genuinely independent, and what the
documented failure reports against each one are.

**This is the design, not the verification.**
[Is the store's backup restorable?](is-the-stores-backup-restorable.md) asks whether a restore has
actually been rehearsed, and stays separate — a design nobody has tested and a design that does not
work are indistinguishable from outside.

## Resolves into

A decision record in [../decisions/](../decisions/), and the thing that makes
[ADR-0022](../decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)
true rather than owed.

**That record commits to surviving host replacement, and a volume cannot deliver it.** Surviving the
machine needs a copy that is not on the machine, so until this question is answered *and built*, the
third of that record's three events is an obligation rather than a property. Answering this is what
closes the gap, and it is also what would make a promise about how long a player's work lasts
possible — see [how long does a guest's work last?](how-long-does-a-guests-work-last.md) and
[how long does a signed-in player's work last?](how-long-does-a-signed-in-players-work-last.md),
neither of which can be answered while the last copy sits on one disk.

## Source

Raised 2026-09-03, while settling
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md). The analysis found no
technical winner between the engines and no operational winner large enough to decide it, which left
the durability of the last copy as the thing actually being chosen between. Separated into its own
question so that it gets a research pass rather than riding along inside a record about something
else.

## Options

*One continuous replication path.* Litestream to object storage, roughly a one-second recovery point.
Simplest, and it is the single-dependency case this question exists to examine.

*Replication plus the platform's snapshots.* Adds a path that fails for unrelated reasons, at the cost
of a coarser recovery point on the second path and a restore that produces a new volume to reattach.

*Replication, snapshots, and an independent dump.* Three paths sharing no code. The candidate shape
above.

*Not yet — decide it when the store exists.* The honest deferral, and the one with a named precedent
against it: [../brainstorming/](../brainstorming/) contains a full operational inventory for exactly
this architecture, running to roughly twenty-five tasks, with no backup or restore procedure in it at
all. Somebody described crash recovery, reboot survival and three separate SSH-lockout recovery routes
and omitted the step that protects a player's work.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**No vendor examined documents test-restoring customer backups**, and Railway's own guide states the
principle: "A backup you have never restored is unverified." This holds at both ends of the store
question — a managed service changes who runs the storage, not who verifies the restore.

*Sourced — second-hand from a research agent, 2026-09-02.*

**Litestream is actively maintained**, shipping v0.5.17 on 2026-08-31 with releases every two to four
weeks. It is disaster recovery rather than high availability, replicating asynchronously with a
one-second default sync interval. LiteFS is the deprioritised sibling and LiteFS Cloud was sunset in
October 2024.

*Sourced — [Litestream releases](https://github.com/benbjohnson/litestream/releases), read 2026-09-03.*

**Copying a live SQLite file is conditionally unsafe**, and the condition is easy to summarise
wrongly. The WAL file "is part of the persistent state of the database and should be kept with the
database if the database is copied or moved." SQLite names `sqlite3_rsync`, `VACUUM INTO` and the C
backup API as the sanctioned alternatives. An atomic block-level snapshot that captures the database
and its WAL together is equivalent to surviving a power cut, which SQLite is built to do.

*Sourced — [sqlite.org/wal.html](https://www.sqlite.org/wal.html) §4 and
[howtocorrupt.html](https://www.sqlite.org/howtocorrupt.html), read 2026-09-02. The snapshot-safety
claim is second-hand.*

**A backup can be correct and unreachable at the same time.** In May 2026 a cloud provider suspended
Railway's production account, taking down its control plane; customer databases went offline and
customers could not retrieve their backups, because backup storage sat behind the same control plane.
Independence of recovery paths has to mean independence of the things they depend on, not just
independence of the mechanisms.

*Sourced — second-hand from a research agent, 2026-09-02.*

**Fly's own documentation says not to combine LiteFS with autostop**, because the proxy can stop and
restart machines with no awareness of LiteFS lease state. Not directly binding —
[ADR-0017](../decisions/0017-nothing-on-the-request-path-scales-to-zero.md) already rules out
autostop on the request path — but it is the kind of interaction between two platform features that
this question has to check for whatever combination it lands on.

*Sourced — second-hand from a research agent reading Fly's documentation, 2026-09-03.*

**Server-side storage brings a recovery point with it, and it is a number somebody has to choose.**
How much recent work disappears when the machine does is set by the replication interval, not by the
engine. Litestream's default is one second. Nothing has said what is acceptable, and
[how much unsynced work is acceptable?](how-much-unsynced-work-is-acceptable.md) asks the
client-side half of the same question.
