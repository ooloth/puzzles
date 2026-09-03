---
opened: 2026-09-03
status: open
resolves_into: decision
---

# What happens after a sync gives up?

## Why it matters

**A wait that ends has to end in something, and nothing says what.** The obvious promise to make about
a network wait is that it always terminates — no spinner runs forever, especially since
[../constraints.md](../constraints.md) records that a stalled connection reports as connected, so the
default behaviour of a naive fetch is to hang indefinitely. But terminating is only half a design. The
interesting half is what the system does next.

**The player cannot be the answer, and that is what makes this hard.**
[The player is never asked to retry or reconnect](../guarantees/the-player-is-never-asked-to-retry-or-reconnect.md)
forbids handing the problem to them. So a give-up cannot surface as "try again", which is what almost
every system does. Whatever happens next happens without them.

**That leaves a write nobody is holding.** If a sync abandons an attempt, either something remembers to
try again, or the write is gone. If something remembers, that queue has a size, a lifetime, an
ordering, and a behaviour when it overflows — none of which anything has decided. If nothing
remembers, then
[the durable copy stops being written](../failure-modes/the-durable-copy-stops-being-written.md)
happens by design rather than by fault.

**And the knowledge has nowhere to go.** The player is not told, because there is nothing they can do.
So the fact that a write failed exists only inside the client, where nothing is watching. That is the
same shape as the observability gap named in
[the guarantees README](../guarantees/README.md), reached from the client side rather than the server
side.

## What would settle it

Deciding the behaviour, not the duration. Four things have to be true of any answer:

- **What happens to the abandoned write.** Retained, retried, merged into a later write, or dropped.
- **What bounds the retention**, if it is retained — a count, an age, a byte budget, or nothing.
- **What happens when that bound is reached.** This is the question that is easy to skip and is where
  work actually gets lost.
- **Who learns.** If not the player, then either nobody or something reporting home. "Nobody" is a
  legitimate answer and has to be chosen rather than defaulted into.

The duration before giving up is a separate and smaller question, and it belongs with
[what latency budget makes "immediately" checkable?](what-latency-budget-makes-immediately-checkable.md)
rather than here.

## Resolves into

A decision record in [../decisions/](../decisions/), and probably a promise in
[../guarantees/](../guarantees/) — a bounded wait is the kind of claim that is worth making to a
player even when they never see it, because it is what stops an interface hanging.

It should also close the gap that
[the durable copy stops being written](../failure-modes/the-durable-copy-stops-being-written.md)
describes, or say explicitly that it does not.

## Source

Raised 2026-09-03 by the maintainer, on being offered "a wait for the network always ends" as a
candidate promise. The observation that produced this question: ending a wait is easy, and the
promise is close to meaningless without saying what the system does afterwards — particularly given
that telling the player is forbidden and there is nothing they could do with the information.

The waiting-moment enumeration that raised the promise candidate is in [../problem.md](../problem.md)
under "Where a player waits".

## Options

*Retry forever, in the background.* The write is never dropped. Costs an unbounded queue and a battery
budget, and [what wins when battery and durability conflict?](what-wins-when-battery-and-durability-conflict.md)
is where that trade is asked.

*Retry with a bound, then drop.* Honest and finite. The question becomes what the bound is and whether
anyone learns when it is hit.

*Retry with a bound, then keep the work locally and stop trying.* The write survives on the device and
the sync is abandoned. Whether that helps depends on whether the device is what is failing.

*Fold the abandoned write into the next successful one.* Possible only if state is a snapshot rather
than a log — see [is puzzle state a snapshot or an event log?](is-puzzle-state-a-snapshot-or-an-event-log.md),
which this depends on and which is answered earlier.

*Give up silently and do nothing.* The current implicit answer, and worth stating as an option so that
choosing it is a choice.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**A stalled connection reports as connected**, per [../constraints.md](../constraints.md), so nothing
surfaces a hung request without something built to time it out. This is why the question exists at all
rather than being handled by whatever the platform does.

**Four promises describe the app working while the server is unreachable, and none describes it
working while the server is slow.** Absence is covered and degradation is not, which makes the
degraded case both the most likely and the least described.

*Reasoned — from [../guarantees/](../guarantees/) and [../constraints.md](../constraints.md),
2026-09-02.*

**This question is upstream of a promise rather than downstream of one.** The candidate promise —
that a network wait always ends — cannot be written until this is answered, because a promise that a
wait terminates while saying nothing about what terminating means would be satisfied by dropping the
write silently.
