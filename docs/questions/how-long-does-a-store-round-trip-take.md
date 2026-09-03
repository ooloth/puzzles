---
opened: 2026-09-02
status: open
resolves_into: constraint
---

# How long does a store round trip take?

## Why it matters

**The store decision has been argued from estimates, and estimates are what this project's own
standards say not to decide on.** Whether the store sits in the process or across a network is the
hub of [what execution shape does the server have?](what-execution-shape-does-the-server-have.md),
and every latency claim made about it so far is an order-of-magnitude guess. A measurement is
available, so a guess is not good enough.

**There are two regimes and they give opposite answers, which is exactly why this needs numbers.**
One store operation with a player waiting is judged against a network floor of hundreds of
milliseconds, so a difference of a millisecond disappears. Many operations with nobody waiting — the
generator validating a candidate, an analytical scan over solve history — compound the same ratio
until it is minutes. Any single number that does not say which regime it belongs to is misleading.

## What would settle it

Running it, on this hardware, with the method recorded. What to measure and how:

**Configurations.** `node:sqlite` against a local file; `bun:sqlite` against a local file; PGlite
in-process; Postgres in a local container; and a managed Postgres both warm and after it has been
left idle long enough to suspend.

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
