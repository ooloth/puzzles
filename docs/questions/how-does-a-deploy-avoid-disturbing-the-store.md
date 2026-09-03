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
Two processes opening the same file during an overlapping restart is the specific arrangement to avoid,
and a deploy is when it is most likely to happen.

**This is the routine operation that runs most often.** Backups run on a schedule and migrations run
rarely; deploys run whenever there is a change. A hazard that fires one time in fifty is a hazard that
will fire.

**And it interacts with the promise to be up.** [ADR-0017](../decisions/0017-nothing-on-the-request-path-scales-to-zero.md)
keeps the request path warm, which means the deploy strategy cannot be "stop everything for a minute"
without saying so.

## What would settle it

Deciding the sequence, and stating what must never overlap. Any answer has to say:

- **Whether two processes can ever hold the file at once**, and what prevents it. The safe answer is
  that they cannot, and the mechanism matters more than the intention.
- **What the old process does before it exits** — finishing in-flight writes, checkpointing the WAL,
  closing cleanly rather than being killed.
- **What happens when it does not exit cleanly**, because sometimes it will not. SQLite is built to
  survive this; the question is whether anything else in the arrangement is.
- **How the replication path behaves across the restart**, since whatever
  [how is the store backed up?](how-is-the-store-backed-up.md) lands on will also be holding the file.
- **Whether a deploy can be rolled back** once a migration has run, which is
  [how is the schema migrated?](how-is-the-schema-migrated.md) meeting this question.

## Resolves into

A decision record in [../decisions/](../decisions/), and content in
[../verification.md](../verification.md) about what a safe deploy looks like.

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
