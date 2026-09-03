---
updated: 2026-09-03
update_when: a module boundary moves, or something new starts talking to something else
decays: fast
status: active
---

# Architecture

Where things live, what talks to what. Deliberately thin — the code describes itself, and
prose about structure rots faster than anyone updates it. A diagram and a short list, never
an essay.

**Nothing is built.** What follows is the shape the decision records have already fixed, not a
description of running software. Every line here cites the record that fixed it, so a reader can tell
constraint from intention. The parts still open are listed at the end and are the larger half.

## The shape so far

```
        ┌─────────────────────────────────────────┐
        │  browser                                │
        │  ┌───────────────────────────────────┐  │
        │  │ client — owns board state,        │  │   solving never
        │  │ mutates it locally      ADR-0004  │  │   touches the network
        │  └───────────────────────────────────┘  │
        │  ┌───────────────────────────────────┐  │
        │  │ client storage — the board in     │  │   mechanism open
        │  │ progress, notes, selection        │  │   (M6)
        │  └───────────────────────────────────┘  │
        └────────────────────┬────────────────────┘
                             │  only at the edges of a session:
                             │  first load, a puzzle not yet on the
                             │  device, a second device, recovery
                             │  after eviction        problem.md
                             ▼
        ┌─────────────────────────────────────────┐
        │  one machine                    ADR-0021│
        │                                         │
        │  ┌───────────────────────────────────┐  │
        │  │ server — ordinary runtime,        │  │   not an isolate  ADR-0018
        │  │ always on, never scales to zero   │  │   on the request path ADR-0017
        │  └────────────────┬──────────────────┘  │
        │                   │ opens as a file     │
        │                   ▼         ADR-0019    │
        │  ┌───────────────────────────────────┐  │
        │  │ SQLite — the durable copy of a    │  │   queryable across
        │  │ player's work, and the catalogue  │  │   players       ADR-0011
        │  └───────────────────────────────────┘  │   (co-location of the two
        │                   │                     │    is open, M3)
        │  ┌────────────────▼──────────────────┐  │
        │  │ local disk — survives restart and │  │   ADR-0022
        │  │ redeploy, not the machine         │  │
        │  └───────────────────────────────────┘  │
        └────────────────────┬────────────────────┘
                             │  must exist; nothing built
                             ▼
                   ┌───────────────────┐
                   │ a copy off the    │   how-is-the-store-backed-up
                   │ machine           │   (M3, open)
                   └───────────────────┘

        generator — batch, search-heavy, runs anywhere.
        Writes the catalogue either directly or through the
        server's API; which is open.        problem.md, ADR-0012
```

## What fixed it

Every box above names the record that fixed it, and
[decisions/](decisions/) is the list of what is settled — every record titled by what it settled, so
the listing is the checklist. It is not repeated here, because a second copy of it would be one more
thing to keep in step and the folder is already scannable.

## Two consequences worth stating, because neither is obvious from the diagram

**Compute and storage share a fate.** The machine failing takes both. There is no arrangement where
the server is up and the store is elsewhere and fine, and recovery is a rebuild rather than a
failover. [ADR-0021](decisions/0021-the-server-and-its-store-share-a-machine.md),
[ADR-0022](decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)

**The client absorbs that for play, and not for entry.** Solving continues through a server outage
because the client owns the board. Everything at the *edges* of a session — a first load, a puzzle
never fetched, a second device, signing in, an entitlement check — needs the server and fails while it
is down. [problem.md](problem.md) lists those moments under "Where a player waits", and they are the
reason outage length is a product question rather than only an operational one.

## What is not decided

Larger than the list above, and deliberately. The runtime that executes TypeScript, what handles HTTP,
what renders the client, what builds it, where the machine is, what the domain resolves to, what
deploys the code, how the schema migrates, what the store is backed up by, which client storage
mechanism holds a board, and what a puzzle actually looks like. All of it is in
[questions/](questions/), ordered by the milestone that first needs it.
