---
opened: 2026-09-03
status: open
resolves_into: decision
---

# How do analysis and play share one store?

## Why it matters

**A long read blocks housekeeping, and the analysis this project committed to is a long read.**
SQLite's own documentation: "a long-running read transaction can prevent a checkpointer from making
progress", and where "there is always at least one active reader, then no checkpoints will be able to
complete and hence the WAL file will grow without bound".
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md) exists to
preserve exactly the queries that behave this way.

**And it is not only analysis.** Opening a shell against the live database to look at something,
running a one-off query while debugging, exporting a copy — all of it is reading the same file the
server is writing to. These are the ordinary things somebody does at a keyboard, and under a file
store they touch production directly in a way a network store's separate connection does not make
feel so immediate.

**So the question is how these coexist**, not whether they are allowed. Making them good neighbours is
the goal: play should never be degraded by somebody looking at data, and looking at data should never
require asking permission or waiting for a quiet hour.

## What would settle it

Deciding where a read that is not serving a player's request actually runs. The candidates are not
exclusive and the answer is likely more than one of them.

Three things any answer has to cover:

- **The analytical scans** [ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md)
  preserves — offline, maintainer-facing, and the ones most likely to be long.
- **Ad-hoc inspection and debugging** — smaller, unplanned, and the ones most likely to happen without
  thinking about it.
- **Whatever the health checks read**, since
  [how is the store backed up?](how-is-the-store-backed-up.md) will want an integrity check running on
  something, and running it against the live file is the naive choice.

## Resolves into

A decision record in [../decisions/](../decisions/), and probably a line in
[../verification.md](../verification.md) about how to look at data safely.

## Source

Raised 2026-09-03, from the checkpoint-blocking finding established while settling
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md), and from the
maintainer's framing that transactions and analysis workflows should be made good neighbours rather
than kept apart by discipline.

## Options

*Read the live file, and keep transactions short.* Simplest, and it relies on the person at the
keyboard remembering. The WAL growth is bounded and self-resolving at this write rate, so the failure
is untidy rather than dangerous.

*Read a copy.* `VACUUM INTO` or a restored replica, refreshed on some cadence. Removes the
interaction entirely at the cost of staleness and a second file.

*Read a replica maintained continuously.* Whatever the backup answer produces may already be one, in
which case this is nearly free — which is why the two questions should be answered with each other in
view.

*Chunk long scans into many short transactions.* Keeps them on the live file without holding a read
open. More code, and it changes what a scan can express.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The pathological case needs a reader always present, which an occasional scan is not.** The
unbounded WAL growth SQLite describes requires overlapping readers with no gap. One scan, however
long, ends — and the checkpoint then proceeds. So this is a wrinkle to design around rather than a
capability gap, and any answer that treats it as an emergency has overread the documentation.

*Sourced — [sqlite.org/wal.html](https://www.sqlite.org/wal.html), read 2026-09-03.*

**Neither SQLite nor Postgres is an analytics engine past tens of millions of rows.** Whatever is
decided here is a way of running modest scans safely, not a plan for analytics at volume. If the
analysis outgrows the store, the answer is a different engine reading a copy rather than a different
arrangement of this one.
