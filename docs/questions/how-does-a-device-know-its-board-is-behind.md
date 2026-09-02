---
opened: 2026-09-02
status: open
resolves_into: decision
---

# How does a device know its board is behind?

## Why it matters

**A device holding an older board cannot tell that it is older.** A player solves on a phone, which
syncs. They continue on a laptop, which syncs. They pick the phone up again with no network, and the
phone shows the board as the phone last knew it — some moves behind. Play continues from there, and
the two copies diverge from a point the player never chose.

This is not
[what happens to a losing write when syncing?](what-happens-to-a-losing-write-when-syncing.md).
Nothing here is a losing write and nothing is lost by a bug: both copies are legitimate, both were
made by the same person, and each device did exactly what it was asked. The damage is that the
player experiences their own progress going backwards, which reads as data loss whatever the store
actually did.

It is the cost of the arrangement rather than a defect in it.
[ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) makes the client
authoritative so that play survives a dead connection, which is the right trade against
[../problem.md](../problem.md)'s modal case. Client authority means the device answers from what it
holds without asking. The moment a second device exists, "what it holds" and "what is current" come
apart, and nothing on an offline device can close the gap.

## What would settle it

Deciding what the app owes a player whose device is behind, and then what is technically required to
deliver it. Three separable things, and only the first is a product question:

Whether the player is told at all, and when — on opening a board the server has moved past, or only
once a divergence has actually been created.

Whether an offline device can detect it at all. It cannot, without contacting something, which means
any detection happens at the moment connectivity returns and is therefore after the fact.

Whether the two copies can be reconciled without asking the player, which
[conflicts are reconciled without asking the player](../guarantees/conflicts-are-reconciled-without-asking-the-player.md)
already promises. If the answer to
[is puzzle state a snapshot or an event log?](is-puzzle-state-a-snapshot-or-an-event-log.md) is an
event log, two divergent histories over one board may merge without a choice being presented. If it
is a snapshot, one of them is being discarded and the promise is under strain.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-02, while establishing what a server can and cannot know about a client's board. The
four states a server's copy can be in — absent, equal, behind, ahead — were being worked through for
a rendering decision, and the "ahead" case turned out to describe a failure nothing was tracking.

## Options

*Say nothing and let it reconcile.* The player continues, the copies merge or one wins when the
network returns, and nothing is surfaced. Keeps
[conflicts are reconciled without asking the player](../guarantees/conflicts-are-reconciled-without-asking-the-player.md)'s
promise that the player is never asked to
arbitrate. Whether it is honest depends entirely on whether the merge actually preserves both.

*Tell the player when it is detected.* Not a prompt and not a choice — an indicator that this board
has newer work elsewhere. Honest, and it arrives too late to prevent the divergence it describes.

*Prevent it.* Refuse to open a board the device cannot confirm is current. Directly contradicts
[the board in play continues through a loss of connectivity](../guarantees/the-board-in-play-continues-through-a-loss-of-connectivity.md)
and
[ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md), and is recorded here to
be rejected explicitly rather than left as an unexamined option.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**A server's copy of a board is in one of four states, and the server cannot tell which.** It may
have nothing, a copy equal to the device's, a copy the device has moved past, or a copy that has
moved past the device. Which one it is depends on what has happened on hardware the server has not
heard from. So any board the server supplies is a proposal that the client has to check against what
it holds, and the check has to happen in every case — including the case where the two agree, since
agreeing is not observable without comparing.

*Reasoned — from [ADR-0004](../decisions/0004-the-client-holds-and-mutates-puzzle-state.md) making
the client authoritative, plus the absence of any channel that reports a device's state while it is
offline.*

**Client authority is what makes this possible, and it is still the right trade.** A server-
authoritative design does not have this failure, because there is one copy. It fails the offline
promise instead, for every player, all the time. This failure affects one player with two devices
where one has been offline, which is strictly smaller — but it is invisible where the other is
obvious, and invisible failures are the ones that need writing down.

**Nothing before multi-device makes this reachable.** One device cannot be behind itself. This
becomes real with [is cross-device resume in scope for v1?](is-cross-device-resume-in-scope-for-v1.md)
and not before, which is why it sits at M14.
