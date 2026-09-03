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

## What is fixed, and by what

- **The client owns puzzle state and mutates it locally.** The server is not on the path from input
  to paint. [ADR-0004](decisions/0004-the-client-holds-and-mutates-puzzle-state.md),
  [ADR-0010](decisions/0010-the-store-needs-a-host-so-this-system-has-a-server.md)
- **Puzzle content is served by a runtime rather than shipped as static files.**
  [ADR-0012](decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md)
- **The durable copy of a player's work is off their device.**
  [ADR-0009](decisions/0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md)
- **Anything the server stores is queryable later, across players, without a migration.**
  [ADR-0011](decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md)
- **Nothing on the request path scales to zero** — not the compute, not the store.
  [ADR-0017](decisions/0017-nothing-on-the-request-path-scales-to-zero.md)
- **The server runs in an ordinary runtime, not a constrained isolate.**
  [ADR-0018](decisions/0018-the-server-does-not-run-in-a-constrained-isolate.md)
- **The store is a SQLite file the server process opens**, on the same machine, on a disk that
  survives restart and redeploy. [ADR-0019](decisions/0019-the-store-is-a-file-the-server-process-opens.md),
  [ADR-0020](decisions/0020-the-stores-engine-is-sqlite.md),
  [ADR-0021](decisions/0021-the-server-and-its-store-share-a-machine.md),
  [ADR-0022](decisions/0022-the-machines-disk-survives-restart-redeploy-and-host-replacement.md)
- **One language across every deployable, and it is TypeScript.**
  [ADR-0006](decisions/0006-one-language-across-every-deployable.md),
  [ADR-0007](decisions/0007-that-language-is-typescript.md)
- **The puzzle rules are defined once and shared rather than reimplemented.**
  [ADR-0005](decisions/0005-the-puzzle-rules-are-defined-once-and-shared-not-reimplemented.md)

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
