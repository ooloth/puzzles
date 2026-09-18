---
number: 0021
status: accepted
date: 2026-09-03
---

# 0021 — The server and its store share a machine

## Forced by

**[ADR-0019](0019-the-store-is-a-file-the-server-process-opens.md) makes the store a file the process
opens.** A file has to be on a filesystem the process can reach.

**SQLite's own documentation rules out reaching it over a network.** Its locking page states:
"POSIX advisory locking is known to be buggy or even unimplemented on many NFS implementations... Your
best defense is to not use SQLite for files on a network filesystem."

## Decision

**The server process and the file it opens are on the same machine, on a local filesystem.**

**Recorded as its own claim rather than left inside
[ADR-0019](0019-the-store-is-a-file-the-server-process-opens.md)'s reasoning**, because it is what
constrains hosting, and a hosting choice made without it is the failure that record exists to prevent.
[Where does this run?](../questions/where-does-this-run.md) inherits this: any candidate must run an
ordinary process with a local disk beside it.

**What is ruled out is a network filesystem**, in every form — NFS, a FUSE mount over object storage,
or a network block device presented as local. Cloud Run's Cloud Storage FUSE and NFS mounts and AWS
Lambda with EFS are all specific instances.

**It says nothing about redundancy or replication.** Copies of the file may exist elsewhere, and
[how is the store backed up?](../questions/how-is-the-store-backed-up.md) is where that is designed.
What binds here is that the copy the process *writes* is local to it.

## Enforced by

**Nothing. Asserted only, and nothing is deployed.** What would make it true is a deployment placing
the process and the file on one machine with a local filesystem. It is settled at M1 slice 4 by
[where does this run?](../questions/where-does-this-run.md), and the failure it rules out is
corruption rather than an error, per [../constraints.md](../constraints.md).

## Rejected

- **A network filesystem, so that compute and storage can scale independently.** The arrangement that
  would preserve the file-shaped store while removing its co-location constraint, and the one that
  makes an embedded database work on platforms with no local disk. Rejected on the single reason that
  SQLite's own maintainers advise against it, in the documentation, because the locking primitives it
  depends on are unreliable there — and the failure mode is corruption rather than an error.
  **Reverses if** SQLite's position on network filesystems changes, which would require the underlying
  locking behaviour to change rather than the advice.

  *Sourced for the disqualifying reason — [SQLite on a network filesystem](https://www.sqlite.org/useovernet.html):
  "SQLite relies on exclusive locks for write operations, and those have been known to operate
  incorrectly for some network filesystems. This has led to database corruption." That page names no
  vendor. **No vendor documentation confirms the failure on any specific network filesystem**: the
  nearest thing found for Lambda over EFS is a single user report on AWS re:Post, with no AWS or
  SQLite reply, so a claim that a named provider has documented reports of it is unsourced wherever it
  turns up. The general warning disqualifies the option on its own and needs no such claim.*

- **Multiple application machines sharing one file.** The horizontal-scaling version of the above, and
  rejected for the same reason plus a second: even with reliable locking, a single writer across
  machines needs a coordination layer that does not exist here. **Reverses if** the store becomes a
  service, which is [ADR-0019](0019-the-store-is-a-file-the-server-process-opens.md)'s reversal rather
  than this one's.

## Risk

**Compute and storage now share a fate.** The machine failing takes both, and there is no arrangement
in which the server is up while the store is elsewhere and fine. That is one fewer failure mode to
reason about and one fewer recovery path to have.

**Horizontal scaling of the server is foreclosed while this holds.** A second application machine
cannot share the file, so growth has to come from a bigger machine rather than more of them. Nothing
in [../problem.md](../problem.md) needs more than one machine — it rules out designing for scale that
does not exist — and the scoring that led here found no plausible feature reaching a limit a single
machine clears. It is still a door being closed, and reopening it means reversing
[ADR-0019](0019-the-store-is-a-file-the-server-process-opens.md).

**It narrows the hosting field before that question is asked.** Any platform without a local disk
beside the process is now out, which removes the cheapest tiers. That is a real reduction in options
and it is the point of recording this separately rather than discovering it during a deployment.

## Revisit when

- **[ADR-0019](0019-the-store-is-a-file-the-server-process-opens.md) is reversed.** This has no
  independent life.
- **More than one application machine becomes necessary**, which under this record means the store has
  to move first.
- **A network filesystem gains locking SQLite's maintainers trust.** The advice above is about
  behaviour rather than preference, so this is a claim about the filesystems rather than about SQLite.

## Also update

- [x] `questions/where-does-this-run.md` — its field is narrowed to platforms offering an ordinary
      process with a local disk; the question stays open
- [x] `constraints.md` — the network-filesystem fact is imported alongside the volume-redundancy one
- [x] Nothing in `guarantees/` — this promises a player nothing
- [x] `architecture.md` — still a stub with nothing built; this is the first recorded constraint on
      the eventual topology and belongs there once there is a system to describe

Deliberately not decided here: which machine, which provider, whether copies of the file exist
elsewhere, and how the machine is recovered when it fails.
