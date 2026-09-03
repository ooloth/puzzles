---
opened: 2026-09-02
status: open
resolves_into: problem
---

# What does a player wait for?

## Why it matters

**Everything downstream of it is judged against this list, and the list does not exist.** Whether the
store may sleep, whether compute may scale to zero, whether a network hop to the store is affordable
— each is an argument about latency, and each has so far been made against an imagined workload
rather than an enumerated one.

[../guarantees/](../guarantees/) covers the path where a player waits for *nothing*:
[input registers without waiting for the network](../guarantees/input-registers-without-waiting-for-the-network.md),
[the board in play continues through a loss of connectivity](../guarantees/the-board-in-play-continues-through-a-loss-of-connectivity.md),
and [the app never opens to a blank screen after the first visit](../guarantees/the-app-never-opens-to-a-blank-screen-after-the-first-visit.md).
Those are the moments that are covered. **Nothing enumerates the moments that are not**, and they
exist: a second device that has to fetch state newer than its own, an archive refreshed after
reconnecting, and signing in.

**"The server is not on the interaction path" has been doing work it cannot do.**
[ADR-0010](../decisions/0010-the-store-needs-a-host-so-this-system-has-a-server.md) says everything
the server does is a background copy or a background check, and that is true of *solving*. It is not
true of every moment a player experiences, and reading it as though it were is how a latency budget
gets assumed away rather than argued.

## What would settle it

Enumerating the moments, derived from the architecture rather than guessed.
[ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) puts state on the client,
so the list should be short by construction — which is the point, because a short list is one that
can be checked.

For each moment, three things worth recording rather than assuming: what is on the screen while the
wait happens, whether the wait is avoidable by fetching earlier or by showing something stale, and
whether it happens on a first visit or a return. The third matters because
[../constraints.md](../constraints.md) records that a fresh connection costs three to four round
trips before any payload moves, so a first touch is expensive independently of anything we build.

**It does not need a duration attached.** A budget is a second question — see
[what latency budget makes "immediately" checkable?](what-latency-budget-makes-immediately-checkable.md),
which asks it for the input path. This one asks which paths there are.

## Resolves into

Content in [../problem.md](../problem.md), and possibly promises in [../guarantees/](../guarantees/)
if any of the moments turn out to deserve one.

## Source

Raised 2026-09-02, while arguing about whether a store reached over a network is affordable. Three
waiting moments were named in conversation to make that argument and none of them was written down
anywhere, which meant the argument was resting on an list nobody could check.

## Options

Not a choice about which moments exist — that follows from the architecture. The choice is what to do
about each once enumerated.

*Accept the wait and show something honest.* A spinner, a stale board marked as stale, a sign-in that
takes as long as it takes. Cheapest, and it is what
[the player is never asked to retry or reconnect](../guarantees/the-player-is-never-asked-to-retry-or-reconnect.md)
already constrains: showing the state of the network is permitted, requiring the player to act on it
is not.

*Design the wait away.* Fetch earlier, cache more, show the stale thing immediately and reconcile
behind it. Removes the latency question from that moment entirely, and costs whatever the prefetching
costs.

*Promise a duration.* Turns a moment into a guarantee with a number, which is the strongest and most
expensive answer, and needs a measurement behind it rather than a hope.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

### Three moments identified so far, and none is enumerated anywhere

**A second device holding older state.** A player picks up a device that has been away, and it must
fetch what the other device wrote before showing a board that is not wrong.
[A player resumes from a board another device moved past](../failure-modes/a-player-resumes-from-a-board-another-device-moved-past.md)
describes the failure when it *does not* fetch; the wait is what happens when it does.

**An archive refreshed after reconnecting.** Live only if
[can a player explore past puzzles?](can-a-player-explore-past-puzzles.md) says an archive exists.

**Signing in.** Live only if [are there user accounts?](are-there-user-accounts.md) says accounts
exist.

> So two of the three are conditional on questions that are open, and the list will not be complete
> until they close. That is an argument for enumerating what is known now and revisiting, not for
> waiting.

*Reasoned — from the records and questions named, 2026-09-02.*

### The network floor dwarfs anything the server adds

**[../constraints.md](../constraints.md) records a 3g RTT floor near 270ms and three to four round
trips before payload on a fresh connection.** Any moment on this list already costs hundreds of
milliseconds before the server does anything at all. That is what makes the store's contribution hard
to feel — and it is also why a store that has to be woken from sleep is different in kind rather than
in degree, since a wake-up is the same order of magnitude as the whole network cost rather than a
fraction of it.

*Sourced — per [../constraints.md](../constraints.md).*

**Slow is not the same as absent, and only absence is covered.** Four promises describe the app
working while the server is unreachable. None of them describes the app working while the server is
merely slow, and [../constraints.md](../constraints.md) records that a stalled connection reports as
connected — so the degraded case is both the most likely and the least described.
