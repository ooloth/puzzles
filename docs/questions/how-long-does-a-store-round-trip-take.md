---
opened: 2026-09-02
status: open
resolves_into: constraint
---

# How long does a store round trip take?

## Why it matters

**Less than it first appeared, and that is the finding rather than a reason to drop it.** This was
opened as the blocking measurement for
[is the store a file or a service?](is-the-store-a-file-or-a-service.md). Asking
what the number would actually change moved it off that path within a day, and the reasoning is
recorded below so nobody re-promotes it.

**What it is still good for**: turning a *Reasoned* claim in [../constraints.md](../constraints.md)
into a *Measured* one, cheaply, and falsifying an arithmetic argument that several decisions now lean
on. That is worth a short session at some point. It is not worth blocking a milestone for.

**What it is not good for**: choosing between a store in the process and a store over a network. The
difference does not reach a player, and the workloads where it would compound turn out to be
avoidable by writing the code differently rather than by choosing a locality.

## What would settle it

Running it, on this hardware, with the method recorded. What to measure and how:

**Configurations.** `node:sqlite` against a local file; `bun:sqlite` against a local file; Postgres
in a local container; and a managed Postgres both warm and after it has been left idle long enough to
suspend.

**Workloads shaped like the real thing rather than like a benchmark.** A single row read and written,
which is the sync path. A loop resembling the generator validating a candidate. An aggregate scan
over a synthetic solve history, resembling the questions
[ADR-0011](../decisions/0011-stored-play-data-can-be-analysed-not-just-retrieved.md) preserves. A
tight insert loop measures none of these and is the shape most likely to be run by accident.

**A baseline, so the numbers mean something.** Every figure reported both per operation and as a
fraction of the 3g RTT floor in [../constraints.md](../constraints.md), because a difference that
disappears into the network is not a difference a player can experience.

**Method, so the numbers survive.** Configurations interleaved rather than run in blocks, so thermal
drift and boost behaviour affect all of them equally. Many iterations, reported as a distribution
rather than a median. Warm-up runs reported separately rather than silently discarded. SQLite run
with both a warm and a cold page cache, labelled.

### What this machine cannot answer, stated so it is not answered badly

**A real same-region network hop.** A local container talks over loopback with no network interface,
no switch and no cable, so it *understates* the wire cost — plausibly by five to twenty times. It is
a lower bound, not a proxy, and calling it one was an error made while designing this. What it is
genuinely good for is separating protocol and driver cost — serialising, parsing, planning — from
wire cost, which is a useful split because only one of the two can be optimised.

**A managed store measured from a laptop** travels the maintainer's home connection, which is tens of
milliseconds rather than the fraction of a millisecond a deployed server would pay. Reporting that as
the network penalty would be measuring the wrong thing.

**What the laptop can answer honestly**: the ratio between embedded engines, the protocol overhead,
and — because a scale-to-zero wake is server-side work rather than a network property — the
cold-start penalty, by measuring warm and cold over the same path and subtracting.

The same-region figure needs a throwaway deployment beside a managed database. That is the only
honest source for it.

## Resolves into

Entries in [../constraints.md](../constraints.md) at the *Measured* tier, carrying their method. The
spike is deleted afterwards; the observation is the artifact.

## Source

Raised 2026-09-02. The store decision had a spike designed for it and no question file to put the
result in, which would have left a measurement living in a conversation.

## Options

N/A — this resolves into facts rather than a choice. What is open is only whether the measurement is
run, and the portable decision-making standard answers that: where an observation is available, it is
what settles the question.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

### Why this stopped blocking the store decision

**Each measurement was checked against the question "what would this result change?", and almost
nothing survived.** Recorded in full because the reasoning is what stops it being re-promoted by
somebody who finds a plausible-looking spike design in a question file.

**The embedded-engine comparison discriminates between runtimes, not between localities.** It only
applies if the store is a file, and even then it is an input to
[what runs TypeScript outside the browser?](what-runs-typescript-outside-the-browser.md) rather than
to the shape.

**The in-process versus warm-network comparison cannot cross a threshold.** For it to change
anything the prediction below would have to be wrong by roughly a hundredfold, because the client
sits behind the RTT floor in [../constraints.md](../constraints.md) and the store difference is about
a millisecond. That file's own warning names this shape of error first: "measuring what does not
bind."

**The cold-start penalty is real and still does not discriminate.** The conclusion it supports — do
not let the store sleep — is satisfiable at both ends, since a file never sleeps and an always-on
managed store never sleeps.

**The "many operations compound" argument was overstated.** An analytical scan is one query: the
store runs it internally and returns a small result, so the network hop is paid once rather than per
row. A generator that touches the store per candidate is a design flaw rather than a property of the
architecture, and it is batchable under either locality. So the second regime is mostly a shape of
code rather than a shape of system.

*Reasoned — 2026-09-02, by working through what each result would move.*

### The predictions this is testing, recorded before the run

Written down first so the spike cannot quietly become a search for the expected answer.

**An in-process read is expected to be single-digit microseconds and a warm same-region network read
0.3 to 2 milliseconds** — a ratio of roughly one hundred to one thousand. If the measured ratio is far
smaller, the case for an embedded store weakens sharply; if far larger, the loop and scan workloads
matter more than assumed.

*Reasoned — from the steps each path involves, not from any measurement.*

**The client-visible difference between in-process and a warm network store is expected to be under
one percent of the smallest plausible wait.** If it is not, the store's locality becomes a
player-facing concern rather than a maintainer-facing one, which would change the decision.

*Reasoned — arithmetic against the RTT floor in [../constraints.md](../constraints.md).*

**A scale-to-zero wake is expected to dominate everything else on this list.** Neon's documentation
says a compute suspends after five minutes of inactivity and reactivates "within a few hundred
milliseconds", which is the same order as the entire network cost rather than a fraction of it.

*Sourced — Neon's scale-to-zero documentation, read 2026-09-02.*

**`bun:sqlite` versus `node:sqlite` is genuinely unknown.** Both are in-process native bindings, and
the published figures comparing them are Bun's own, against Deno, without method. Whether the
difference is material for these workloads has never been established here, and the earlier reasoning
that dismissed it was pointing at a budget that does not constrain the loop and scan cases.

*Unverified — no source recorded.*
