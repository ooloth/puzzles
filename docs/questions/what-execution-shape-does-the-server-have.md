---
opened: 2026-09-01
status: open
resolves_into: decision
---

# What execution shape does the server have?

## Why it matters

**This is the hub three separate decisions all turn on, and deciding any of them without it means
regretting one of them later.** A long-lived process on a machine with a persistent local disk can
hold an embedded database, run background work and keep things in memory between requests. An
ephemeral or edge runtime can do none of those and needs its state over a network.

The foreclosure runs one way and is invisible at the moment it happens.
[Where does this run?](where-does-this-run.md) already records the consequences: an embedded
database on local disk is what disqualifies serverless platforms, Cloudflare Workers with D1 has no
persistent process and no real database file, and Fly volumes are single-attach. So deploying a
hello world to an edge platform quietly settles
[which database, if any?](which-database-if-any.md) — and nothing about that deployment announces
that a database class has just been chosen.

It reaches the runtime too. Node, Bun and Deno on a machine can all embed a database; an edge
runtime cannot, which removes a whole tier of candidates from
[what runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md).

**The first deployment is not a throwaway.** Same-origin is the shape that keeps a session cookie
alive under Safari's first-party test — see [../constraints.md](../constraints.md) — so where the
client lives and where the API lives are one choice, made once. Getting it wrong is not a redeploy;
it is a redeploy plus whichever of the three above has to move with it.

## What would settle it

Naming what the server must do between requests, and what it must keep. Everything else follows.
Three things to check rather than assume: whether anything has to run on a schedule, whether
anything has to be held in memory across requests, and whether the store is a file the process opens
or a service it connects to.

[../problem.md](../problem.md) supplies the scale — a deliberately small audience — so nothing here
is decided by throughput, and any argument that reaches for requests per second is answering a
question this project does not have.

The generator is worth checking separately rather than assuming it colocates. If puzzles are
produced ahead of time, generation is a batch job that can run anywhere, including a machine that is
not the server, which removes it as a constraint entirely — see
[are puzzles generated ahead of time or on demand?](are-puzzles-generated-ahead-of-time-or-on-demand.md).

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-01, after a check found that the first milestone contained
[where does this run?](where-does-this-run.md) while five of the questions it names as blockers sat
in later milestones. The coupling between database, platform and runtime had no owner, so each was
positioned as though the other two were independent.

## Options

*A long-lived process with a persistent local disk.* An embedded database is a file the process
opens. No network hop to storage, background work is possible, and the machine is yours to operate —
which is the cost, and it is recurring. See
[how is the server operated?](how-is-the-server-operated.md).

*A long-lived process with a network-attached database.* Keeps background work and in-memory state,
gives up the local file, and hands operations of the store to somebody else. Hosting stays open in a
way the first option closes.

*Ephemeral functions with a network-attached database.* No process between requests, so no
background work and no local anything. Cheapest at rest and the least to operate. Every request pays
a connection to the store.

*An edge runtime with an edge database.* The same as above with a narrower runtime and a store
shaped to match it. The most constrained, and the hardest to reverse, because both the runtime and
the storage layer are specific to the platform.

## Findings

**What makes this answerable now.**
[ADR-0006](../decisions/0006-what-a-players-work-survives.md) establishes that a server exists and
holds a durable per-player record, so there is server-side state whatever else is true.
[ADR-0008](../decisions/0008-the-option-to-analyse-play-is-preserved.md) establishes that the store
has to be queryable rather than opaque. Together those are enough: the remaining candidates in
[what does the server hold?](what-does-the-server-hold.md) — entitlement, the catalogue, push,
observability — are each satisfied by any shape below and so do not discriminate.

**Nothing has been measured, and at this scale performance is unlikely to decide it.** What should
decide it is what has to be true between requests, and how much operational surface one maintainer
should own.

**One thing that looks like an input is not.** Whether the generator runs on the same infrastructure
is a real question, and it stops being a constraint here the moment generation is batch work — which
is what [../problem.md](../problem.md) already implies by ranking the interactive path over batch
throughput and saying generation can be as slow as it needs to be.
