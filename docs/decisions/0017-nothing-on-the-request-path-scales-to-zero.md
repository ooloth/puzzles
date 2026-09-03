---
number: 0017
status: accepted
date: 2026-09-03
---

# 0017 — Nothing on the request path scales to zero

## Forced by

**[../problem.md](../problem.md) records where a player waits, and the shape of that list is the whole
argument.** Under "Where a player waits" it names the moments the client is blocked on a response, and
states that they "cluster at the start of a session rather than running through it" — a consequence of
[ADR-0004](0004-the-client-holds-and-mutates-puzzle-state.md) keeping solving local, so the server is
reached only at session edges. It adds that this "does not change as the audience grows".

**The same file makes the gaps between those moments long.** Sessions "resume anywhere from seconds to
days later", and launch is "sized small". Idle is the normal state rather than an exception, so a
component that sleeps after minutes of inactivity is asleep for almost every first touch.

**[../constraints.md](../constraints.md) sets the budget a wake-up is added to**: a 3g RTT floor near
270ms, and three to four round trips before payload moves on a fresh connection.

> Put together: anything that sleeps pays its wake-up on the moments a player actually waits, rather
> than on a minority of requests. That is not a property of how much traffic there is. It is a
> property of where the waits sit, and it gets worse rather than better as sessions become more
> spread out.

## Decision

**Nothing on the path that answers a player's request is configured to scale to zero** — not the
compute that serves the request, and not the store it reads.

What binds is the sentence above, stated as a property of the system rather than as a platform
setting: a player-facing wait may not include waking something up.

**It does not settle where any of it runs**, which is
[where does this run?](../questions/where-does-this-run.md), or what the store is, which is
[are puzzles and player records in one store?](../questions/are-puzzles-and-player-records-in-one-store.md)
and [ADR-0020](0020-the-stores-engine-is-sqlite.md). It constrains those choices without making
them.

**Work that is not on the request path is untouched.** The generator may sleep, stop, or run nowhere
at all between runs — [../problem.md](../problem.md) ranks "the interactive path over batch
throughput" and says generation "can be as slow as it needs to be". This record is about the path a
player is blocked on and nothing else.

## Rejected

- **Scale-to-zero compute.** The strongest rejected option by some distance. It is free at rest, it is
  the default on Cloud Run, Fly with auto-stop, Render and Railway, and it is what a competent person
  picks for an app with almost no traffic — paying for an idle machine looks like waste. Rejected
  because the wake-up lands on the moments a player waits rather than on a minority of requests: the
  waits cluster at session edges, so nearly every one of them is a first touch after a gap. Fly
  documents ~2+ seconds from stopped and a few hundred milliseconds from suspend; Cloud Run publishes
  no figure at all. Against a 270ms floor, that roughly triples or doubles the smallest plausible
  wait. **Reverses if** the cold touches are removed — see
  [is a puzzle fetched before it is needed?](../questions/is-a-puzzle-fetched-before-it-is-needed.md),
  whose answer would change the premise — or if a platform's wake-up drops below the noise floor of
  the network.

- **A store on a free tier that sleeps.** Neon suspends after five minutes of inactivity and free
  plans cannot disable it; Supabase pauses free projects after seven days. Rejected for the same
  reason as above, sharpened by stacking: a sleeping store behind sleeping compute pays the wake-up
  twice on the first touch of the day, and free tiers are where both defaults live. **Reverses if** a
  free tier stops sleeping, or if the store leaves the request path entirely.

- **Not yet — leave it to whatever the first deployment happens to do.** The honest "not yet", and
  cheap to reverse on most platforms, since auto-stop is usually a flag. Rejected because the failure
  is silent: a player who waits three seconds for today's puzzle files no bug, and nothing in the
  system reports a wait. So the default would never be revisited, and
  [../questions/README.md](../questions/README.md) states that everything a milestone installs is
  permanent and that placeholder choices are not a category. **Reverses if** something exists that
  would report a slow first touch, at which point this could safely be left to measurement.

## Risk

**This is the worst ratio of cost to utilisation the system will ever have.** An always-on machine for
an audience of almost nobody is capacity paid for and unused, and the argument gets *weaker* as
traffic grows, because a busy service is warm anyway. About $5.17/month on Fly with a volume and an
address, or €6.59–8.09 on Hetzner — small, and it is a standing cost rather than a one-off.

**It forecloses the free tiers**, which is where the cheapest options live, and combined with
[ADR-0006](0006-one-language-across-every-deployable.md)'s one-toolchain constraint it narrows the
platform field before [where does this run?](../questions/where-does-this-run.md) is asked.

**It is cheap to reverse per platform and is recorded anyway.** Auto-stop is a config flag. What the
record buys is not irreversibility but visibility: sleeping becomes a choice somebody makes rather
than a default nobody notices, and the thing it protects against is a degradation that nothing reports
and no player complains about.

**The numbers behind it are vendor-published rather than measured here.** Fly's figures are from its
documentation; Cloud Run publishes none, so "no figure at all" is the honest state rather than a bad
one. Nothing in this project has been timed, because nothing in this project exists.

## Revisit when

- **No blocking moment is a cold touch any more.** If
  [is a puzzle fetched before it is needed?](../questions/is-a-puzzle-fetched-before-it-is-needed.md)
  lands on prefetching far enough ahead, the waits this record protects stop being first-touch, and
  the argument dissolves.
- **A platform's measured wake-up falls below the network noise floor** — under roughly a tenth of the
  270ms RTT floor in [../constraints.md](../constraints.md), where it would stop being detectable.
- **Something reports a slow first touch.** Once
  [how is a slow request diagnosed after the fact?](../questions/how-is-a-slow-request-diagnosed-after-the-fact.md)
  has an answer, this can be settled by measurement rather than by argument.

## Also update

- [x] `questions/README.md` — this is one of the records
      [ADR-0019](0019-the-store-is-a-file-the-server-process-opens.md)
      resolves into; that question stays open for store locality
- [x] `constraints.md` — nothing to import. The wake-up figures are vendor claims about specific
      platforms rather than facts about the world, and they belong with
      [where does this run?](../questions/where-does-this-run.md)
- [x] Nothing in `guarantees/` — this promises a player no duration, and deliberately does not.
      A bound on a wait is
      [what latency budget makes "immediately" checkable?](../questions/what-latency-budget-makes-immediately-checkable.md)
- [x] `architecture.md` — still a stub with nothing built; this is recorded here until there is a
      system to describe

Deliberately not decided here: where anything runs, what the store is, whether the store is a file or
a service, how much downtime is acceptable, and what any wait is allowed to cost.
