---
updated: 2026-09-30
update_when: a module boundary moves, or something new starts talking to something else
decays: fast
status: active
---

# Architecture

Where things live, what talks to what. Deliberately thin — the code describes itself, and
prose about structure rots faster than anyone updates it. A diagram and a short list, never
an essay.

**Almost nothing is built.** The server answers `/api/hello` from `src/server/`, a client under
`src/client/` shows its answer, and nothing else exists. What follows is the shape the decision
records have already fixed, not a description of running software. Every line here cites the record
that fixed it, so a reader can tell constraint from intention. The parts still open are listed at
the end and are the larger half.

## The shape so far

```
        ┌─────────────────────────────────────────┐
        │  browser                                │
        │  ┌───────────────────────────────────┐  │
        │  │ service worker — answers every    │  │   not the HTTP cache,
        │  │ navigation after the first        │  │   which cannot be
        │  │ from a document on the device     │  │   inspected  ADR-0023
        │  │                         ADR-0023  │  │   (holds 30 idle days
        │  └───────────────────────────────────┘  │    on Safari)
        │  ┌───────────────────────────────────┐  │
        │  │ entry document — produced by the  │  │   so a renderer is not
        │  │ build, not per request  ADR-0024  │  │   also a server
        │  └───────────────────────────────────┘  │
        │  ┌───────────────────────────────────┐  │
        │  │ client — owns board state,        │  │   solving never
        │  │ mutates it locally      ADR-0004  │  │   touches the network
        │  │ src/client/state holds it; the    │  │
        │  │ React only draws it  ADR-0037, 38 │  │
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
                             │  files and API on one origin  ADR-0040
                             │  /api/ is the API, the rest the client
                             │                               ADR-0041
                             ▼
        ┌─────────────────────────────────────────┐
        │  one machine                    ADR-0021│
        │  a DigitalOcean Droplet         ADR-0043│
        │                                         │
        │  ┌───────────────────────────────────┐  │
        │  │ server — Fastify on Node,         │  │   not an isolate  ADR-0018
        │  │ always on, never scales to zero   │  │   on the request path ADR-0017
        │  └────────────────┬──────────────────┘  │   the handler     ADR-0035
        │                   │                     │   systemd, no containers ADR-0044
        │                   │ opens as a file     │
        │                   ▼         ADR-0019    │
        │  ┌───────────────────────────────────┐  │
        │  │ SQLite — the durable copy of a    │  │   queryable across
        │  │ player's state, and the catalogue │  │   players       ADR-0011
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

        generator — batch, search-heavy, runs on Node.
        Writes the catalogue either directly or through the
        server's API; which is open.        problem.md, ADR-0012
```

## Where the code lives

One package, by [ADR-0034](decisions/0034-the-repository-is-one-package.md). One `package.json` at
the root and no workspace, with each part of the system a directory beneath `src/`:

```
package.json        one manifest, every dependency
tsconfig.base.json  the compiler options
tsconfig.json       the build's own files, run by Node        lib esnext   types node
vite.config.ts      the client build and its browser floor    ADR-0029
src/rules/          shared by the client and the generator   lib esnext   types none; not built yet
src/client/         bundled by Vite                 ADR-0029  lib esnext + dom   jsx
src/server/         run by Node                     ADR-0030  lib esnext   types node
src/generator/      run by Node; not built yet, nothing here until M8
```

Each directory carries a short `tsconfig.json` differing in `lib` and `types`, which is what
keeps DOM globals out of the server and Node globals out of the client. Nothing else enforces the
boundary between these four: a cross-boundary import is refused by the type check and waved through
by the bundler with a warning, and nothing runs the type check until M2.

How the rules module is reached, what is inside `src/rules/`, and whether the generator is a
deployable of its own are open at
[how is the codebase laid out?](questions/how-is-the-codebase-laid-out.md).

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

Larger than the list above, and deliberately. Which region the machine is in, what the domain
resolves to, what deploys the code, how the schema migrates, what the store is backed up by, which
client storage mechanism holds a board, and what a puzzle actually looks like. All of it is in
[questions/](questions/), ordered by the milestone that first needs it.
