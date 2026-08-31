---
opened: 2026-08-30
status: open
resolves_into: decision
---

# What does the server store, if anything?

## Why it matters

If the client owns state, the server's job may be small enough that the choice of data store
barely matters — or that there is nothing to store beyond a sync record.

## Blocked by

[where puzzle state lives](who-is-authoritative-over-puzzle-state.md).

[Are puzzles generated ahead of time or on demand?](are-puzzles-generated-ahead-of-time-or-on-demand.md).

[What load should the server handle?](what-load-should-the-server-handle.md).

## Blocks

[where this runs](where-does-this-run.md).

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

Options and findings ported from legacy ADR-03 (use SQLite as the data store).

Finding drawn from legacy ADR-13 (back up SQLite with Litestream).

## Options

*SQLite as a file beside the app.* No database process to run, patch or monitor, and trivial
local development with nothing to install or start. Costs explicit backup tooling rather than a
managed service's, and gives no concurrent writers or multiple instances.

*A managed relational database.* Native multi-instance support, standard backups, and no future
migration to plan. Costs real operational complexity now, for a scale scenario legacy ADR-03
itself described as hypothetical.

*Less than a database.* Never enumerated by ADR-03, because under server-owned state it wasn't
viable. If the client owns state and the server is only a sync target for opaque per-player
blobs, object storage or a key-value store may be sufficient — which would also reopen hosting
options that a local database file rules out.

## Findings

**SQLite permits one writing process at a time, and multiple instances cannot share a local
file** without corrupting it. This is what couples the data store to hosting: under SQLite,
single-instance deployment stops being a preference and becomes a correctness requirement. It is
also why serverless platforms were previously disqualified, so a different store reopens them.

**In WAL mode a filesystem copy is not a valid backup.** It can capture a partial write and
produce a silently corrupt file, which is worse than no backup because it looks like one. Any
backup must use SQLite's online backup API or WAL-aware streaming.

Both of the above are facts nobody controls, but they only apply if SQLite is chosen. They move
to [../constraints.md](../constraints.md) with the decision that adopts it, and are deleted with
the decision that doesn't.

ADR-03's dismissal of the single-writer limit — "not a real constraint for infrequent, small
per-user progress writes at this audience size" — is reasoning from expected scale rather than
measurement. The write pattern depends on the sync model, which is undecided, so the dismissal
can't be evaluated yet.

ADR-03 compared two relational databases and nothing else. Both assume the server holds
meaningful relational data, which was true under server-owned state and may not be now. The
missing option is listed above; note that it wasn't rejected, it was never raised.

**Anything stored server-side brings a recovery point with it.** How much recent work disappears
when that storage is gone is decided by the backup mechanism, not discovered during the incident —
continuous replication and a periodic copy differ by exactly that amount. It is one more cost on
the side of the server holding state, and it disappears entirely if it holds nothing.

**The smallest useful server is smaller than "a database".** Storing one opaque blob per
anonymous token — written on change, read on open — keeps the durability promise without accounts,
sessions, or any understanding of what a puzzle is. That is the middle option in this question's
list, and it is what most of the durability argument actually needs. See the layer decomposition in
[is cross-device resume in scope for v1?](is-cross-device-resume-in-scope-for-v1.md).
