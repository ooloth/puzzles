---
opened: 2026-09-03
status: open
resolves_into: decision
---

# How does a deploy avoid disturbing the store?

## Why it matters

**A deploy replaces the process that is holding the database open.** Under
[ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md) and
[ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md) the store is a file on the
same machine as the server, so shipping a change means stopping something that has a write lock and a
WAL and starting something else that wants both.

**The failure modes here are the ones SQLite's own documentation warns about.** Its list of ways to
corrupt a database includes writes interrupted in the wrong place and files separated from their WAL.
Two processes on one machine may open the same file, since SQLite requires only that "All processes
using a database must be on the same host computer", with one writer at a time. What must never
overlap is the replicator: two Litestream processes writing one replica can leave it impossible to
restore. A deploy is when either is most likely to go wrong.

**This is the routine operation that runs most often.** Backups run on a schedule and migrations run
rarely; deploys run whenever there is a change. A hazard that fires one time in fifty is a hazard that
will fire.

**And it interacts with the promise to be up.** [ADR-0017](../decisions/0017-nothing-on-the-request-path-scales-to-zero.md)
keeps the request path warm, which means the deploy strategy cannot be "stop everything for a minute"
without saying so.

## What would settle it

Deciding the sequence, and stating what must never overlap. Any answer has to say:

- **How the old and new processes share the file while a deploy overlaps them**, and what keeps the
  replicator single through it. The mechanism matters more than the intention.
- **What the old process does before it exits** — finishing in-flight writes, checkpointing the WAL,
  closing cleanly rather than being killed.
- **What happens when it does not exit cleanly**, because sometimes it will not. SQLite is built to
  survive this; the question is whether anything else in the arrangement is.
- **How the replication path behaves across the restart**, since whatever
  [how is the store backed up?](how-is-the-store-backed-up.md) lands on will also be holding the file.
- **Whether a deploy can be rolled back** once a migration has run, which is
  [how is the schema migrated?](how-is-the-schema-migrated.md) meeting this question.

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/), and content in
[../../CONTRIBUTING.md](../../CONTRIBUTING.md) about what a safe deploy looks like.

## Source

Raised 2026-09-03, from [ADR-0019](../decisions/0019-the-store-is-a-file-the-server-process-opens.md)
and [ADR-0021](../decisions/0021-the-server-and-its-store-share-a-machine.md). Nothing tracked the
interaction between replacing a process and the file it holds;
[what deploys the code?](what-deploys-the-code.md) asks what runs a deploy rather than what a deploy
must not do.

## Options

*Stop, then start.* The old process exits fully before the new one begins. Safest for the file and it
means a gap in service, which has to be reconciled with the warm-path commitment.

*Overlap, with the file handed over explicitly.* Shorter or no gap, and it introduces the window where
two processes could hold the database. Needs a mechanism rather than a convention.

*Overlap, with the new process waiting for the lock.* SQLite's `busy_timeout` turns the race into a
wait. Simple, and it depends on settings
[what durability settings does the store run with?](what-durability-settings-does-the-store-run-with.md)
has not chosen yet.

*Accept a short outage on every deploy.* Honest, cheap, and defensible for a product whose client
absorbs server unavailability — which four promises describe.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**SQLite is built to survive a process dying mid-write**, which is what its journalling exists for. So
an unclean exit is not by itself a corruption risk. The risks are elsewhere: two writers, a file
separated from its WAL, or a replication tool interrupted in the middle of its own work.

*Reasoned — from [sqlite.org/howtocorrupt.html](https://www.sqlite.org/howtocorrupt.html), read
2026-09-02, which enumerates the causes and does not list ordinary process termination among them.*

**The client absorbs server unavailability by design.** Four promises describe play continuing while
the server is unreachable, so a deploy gap is cheap for this product in a way it would not be for a
server-driven one. That widens the field of acceptable answers considerably.

*Mined 2026-09-30 from [where does this run?](where-does-this-run.md), eighth and twelfth passes.
These are observations for this question to weigh, not answers.*

**Overlapping deploys with a shared file lost nothing when measured.**

- **The arrangement.** Two app processes shared one SQLite file in WAL mode, with `busy_timeout=5000`
  and `synchronous=FULL`. One Litestream process ran beside them. A deploy started the new process,
  waited for its health check, drained the old one and then stopped it.
- **The runs.** Three runs of five deploys under load in a Linux container, and one run of five on a
  real Droplet.
- **The result.** No acknowledged write was lost, and every Litestream restore passed
  `integrity_check`.
- **The same deploy with the old process stopped before it drained** failed POSTs that were already
  queued on its socket.
- **A crash**, as opposed to a deploy, can still commit a write whose acknowledgement never arrives.
  See [what happens to a losing write when syncing?](what-happens-to-a-losing-write-when-syncing.md).

*Measured, 2026-09-30. The scripts are in [where does this run?](where-does-this-run.md). Not
measured: the real Fastify server, and a migration during a deploy.*
