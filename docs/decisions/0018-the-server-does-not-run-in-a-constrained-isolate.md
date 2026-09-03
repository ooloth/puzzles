---
number: 0018
status: accepted
date: 2026-09-03
---

# 0018 — The server does not run in a constrained isolate

## Forced by

**[ADR-0011](0011-stored-play-data-can-be-analysed-not-just-retrieved.md) requires one store that can
answer questions spanning players**, without a migration. Its examples — which puzzles get finished,
where players stall, whether a difficulty grade predicts anything — each read play data and puzzle
metadata together, across players rather than within one.

**[ADR-0006](0006-one-language-across-every-deployable.md) rules out a second toolchain**, and
anticipated this tier by name: an edge runtime that only executes one language "would satisfy this by
accident rather than by fit."

**[../problem.md](../problem.md) makes the generator part of the point** rather than infrastructure
behind it, and ranks the interactive path over batch throughput. The generator is search-heavy batch
work.

## Decision

**The server runs in an ordinary runtime with full platform APIs, not a constrained V8 isolate.**

Concretely, what is ruled out is the tier where the runtime is a sandboxed isolate rather than a
process: Cloudflare Workers, Vercel's Edge Runtime, and their equivalents. What is ruled in is
anything that runs an ordinary server process — a machine, a micro-VM, or a container.

**This is about the runtime tier, not about a vendor.** Cloudflare Containers is generally available
and runs an ordinary container, so choosing Cloudflare does not mean choosing an isolate, and
rejecting the isolate does not reject Cloudflare. Any argument that reasons from a platform name to a
runtime constraint is making the error this record exists to stop.

**It does not settle where the server runs**, which is
[where does this run?](../questions/where-does-this-run.md), nor which ordinary runtime executes the
TypeScript, which is
[what runs TypeScript outside the browser?](../questions/what-runs-typescript-outside-the-browser.md).

## Rejected

- **Run the server in a constrained isolate.**

  **The case for it is stronger than it is usually given credit for, and it has to be stated before it
  is answered.** It is the cheapest tier at rest and the least to operate — no machine, no process
  manager, no patching. It is global by default. Crucially, it satisfies
  [ADR-0017](0017-nothing-on-the-request-path-scales-to-zero.md) for free rather than by paying: an
  isolate has no meaningful cold start, and Cloudflare's own documentation says one "can start around
  a hundred times faster than a Node process on a container or virtual machine." So the wake-up
  argument that eliminates scale-to-zero containers and functions does not reach this tier at all —
  it is the one option that gets always-warm behaviour without an always-on bill. And Cloudflare
  Containers, generally available since April 2026, would give the generator a first-class home on the
  same platform.

  **Rejected because the store cannot be at the edge, so edge compute adds a hop rather than removing
  one.** That is the single disqualifying reason and it is worth stating precisely, because it is not
  the reason usually given.

  The isolate tier's entire technical proposition is putting compute near the user to cut latency.
  For that to pay, two things must be true: the work must be latency-sensitive, and **the data the
  work needs must be near the user too**. The second is the one that fails here, and it fails because
  of a decision already made.

  [ADR-0011](0011-stored-play-data-can-be-analysed-not-just-retrieved.md) eliminates the
  edge-resident storage that would make this tier coherent. Workers KV and Deno KV have no query
  language at all. Durable Objects give each object its own isolated SQLite, so a question spanning
  players — which is the entire point of that record — needs a fan-out layer written by hand. Of the
  edge storage tier only D1 survives, and Cloudflare's own limits documentation says D1 "is designed
  for horizontal scale out across multiple, smaller (10 GB) databases, such as per-user, per-tenant or
  per-entity databases" — which is precisely the sharded shape [ADR-0011](0011-stored-play-data-can-be-analysed-not-just-retrieved.md) rules out. Its ceiling is
  500 MB on the free plan and 10 GB paid.

  So an isolate server would hold its data in one region and execute everywhere else. Every request
  that touches the store becomes client → nearest edge, then edge → the region the store is in, and
  back. Moving the compute outward without the data **adds** a network hop to the path rather than
  removing one. The tier's advantage is not merely unused here; it is inverted, and it is inverted by
  a record already in force rather than by anything about this project's taste.

  **Reverses if** [ADR-0011](0011-stored-play-data-can-be-analysed-not-just-retrieved.md) is reversed
  or narrowed so that cross-player analysis no longer needs one queryable store, or if an edge
  platform ships storage that answers cross-entity queries without a hand-built fan-out. Either would
  restore the tier's coherence and this would need re-arguing rather than merely re-checking.

  Two further costs exist and neither is load-bearing, so neither is doing work here. The generator
  cannot run in an isolate, so this arrangement needs a container beside it — real, and survivable,
  because Cloudflare Containers exists. And the tier is narrowing: Vercel's own documentation
  recommends migrating off its Edge Runtime and Next.js 16.3 dropped `runtime = 'edge'`, while Deno
  Deploy Classic shut down in July 2026, leaving Cloudflare Workers as the one healthy option. Also
  real, and also not disqualifying — one healthy vendor is a vendor.

- **Run the server in an isolate and accept D1 as the store.** The version of the above that keeps the
  data local to the compute, which is the only arrangement where edge compute pays. Rejected because
  D1's stated design point is per-user, per-tenant or per-entity sharding, and a question spanning
  players is exactly what a shard boundary makes expensive — so satisfying
  [ADR-0011](0011-stored-play-data-can-be-analysed-not-just-retrieved.md) means either one D1 used
  against its design or a fan-out layer built by hand. **Reverses if** D1 gains cross-database query,
  or [ADR-0011](0011-stored-play-data-can-be-analysed-not-just-retrieved.md) is withdrawn.

- **Decide the runtime tier when something forces it.** The honest "not yet". Rejected because the
  first deployment picks the tier, and picking the isolate settles the storage class silently — the
  argument
  [ADR-0019](0019-the-store-is-a-file-the-server-process-opens.md)
  opens with. Nothing about deploying a hello world to an edge platform announces that a database
  class has just been chosen, which is what makes this the kind of door worth closing deliberately.
  **Reverses if** the store class is settled first, at which point the runtime tier follows from it
  and needs no separate argument.

## Risk

**Genuinely lower latency for distant players is given up, and nothing here knows where the players
are.** [../problem.md](../problem.md) states an audience size and never a geography. Edge presence
reduces per-round-trip time, and [../constraints.md](../constraints.md) records three to four round
trips before payload — so for someone on another continent the tier would buy something real on the
moments that are not store reads. If the audience turns out to be spread, this decision has a cost
that this reasoning cannot see.

**The cheapest-at-rest tier is given up**, and stacked with
[ADR-0017](0017-nothing-on-the-request-path-scales-to-zero.md) that means a standing monthly bill
where there could have been none.

**The whole argument rests on one record that preserves an option nobody has exercised.**
[ADR-0011](0011-stored-play-data-can-be-analysed-not-just-retrieved.md) is itself an
option-preserving decision — it collects nothing and builds no analysis. So this record declines a
whole runtime tier on the strength of a future that may never arrive. That is the honest shape of it,
and it is why the reversal condition above is written against [ADR-0011](0011-stored-play-data-can-be-analysed-not-just-retrieved.md) rather than against anything
observable about the edge.

## Revisit when

- **[ADR-0011](0011-stored-play-data-can-be-analysed-not-just-retrieved.md) is reversed or narrowed**,
  which is the premise this rests on entirely.
- **An edge platform ships a store that answers questions spanning entities** without a fan-out layer
  written by hand — the specific gap that makes edge compute add a hop here.
- **The audience turns out to be geographically spread**, such that per-round-trip time dominates the
  waits recorded in [../problem.md](../problem.md) under "Where a player waits".

## Also update

- [x] `questions/README.md` — this is one of the records
      [ADR-0019](0019-the-store-is-a-file-the-server-process-opens.md)
      resolves into; that question stays open for store locality
- [x] `questions/what-runs-typescript-outside-the-browser.md` — the isolate tier is out of its field,
      which leaves ordinary runtimes only
- [x] `constraints.md` — nothing to import. The D1 limits and the Vercel and Deno retreats are facts
      about specific vendors rather than about the world, and they sit with
      [where does this run?](../questions/where-does-this-run.md)
- [x] Nothing in `guarantees/` — this promises a player nothing

Deliberately not decided here: where the server runs, which ordinary runtime executes the TypeScript,
whether the store is a file or a service, which database, and whether Cloudflare is used at all.
