---
opened: 2026-09-01
status: open
resolves_into: decision
---

# How long does a signed-in player's work last?

## Why it matters

[../problem.md](../problem.md) says a record of a player's play is theirs to keep and outlives any
one device: the board left on a phone is waiting on a laptop later, and a puzzle from any past day is
still where they left it, with nothing reconciled by hand. Signing in is the one mechanism that can
actually deliver that — nothing on a device can reach a second device that has never seen the first.

[../guarantees/durability.md](../guarantees/durability.md) currently promises a player's work
survives the session that made it, with no bound and no device named. For a signed-in player, this
question is what turns that unbounded sentence into an actual promise instead of a claim two people
could read two different ways.

This bound does not run into the client-storage eviction problem
[../constraints.md](../constraints.md) records for guests — a signed-in player's record lives off the
device, so Safari's thirty-day window and Chrome's origin eviction do not apply to it directly. What
this question has to settle is not "how do we survive eviction" but "what do we actually promise,
and to which devices."

Answering this in the affirmative — any bound at all beyond the current session — has already forced
a consequence: something off-device has to hold the record. That consequence was decided separately,
in [ADR-0010](../decisions/0010-the-store-needs-a-host-so-this-system-has-a-server.md), "a server
exists." [ADR-0010](../decisions/0010-the-store-needs-a-host-so-this-system-has-a-server.md) was reasoned entirely from the durability record demoted on 2026-09-01's signed-in bound and says explicitly that if
that bound is ever dropped, [ADR-0010](../decisions/0010-the-store-needs-a-host-so-this-system-has-a-server.md) has no independent basis and should be superseded in the same
change. Demoting the durability record does drop it — the signed-in bound is no longer a decided fact, it is this
open question. Whether [ADR-0010](../decisions/0010-the-store-needs-a-host-so-this-system-has-a-server.md) should therefore also be revisited is a live question this record
does not resolve; it is out of scope for this file, and is flagged here so it is not lost.

## What would settle it

Nothing external blocks an answer — this is a product and cost call, not a research gap. It is
settled once [are there user accounts?](are-there-user-accounts.md) fixes what a player signs into,
what the server holds fixes what an account can actually store,
and [is cross-device resume in scope for v1?](is-cross-device-resume-in-scope-for-v1.md) decides
whether "any device" ships in the first release or later.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Opened 2026-09-01 by demoting the durability record, "What a player's work survives" (the decision record itself
is deleted; this question, its two siblings —
[how long does a guest's work last?](how-long-does-a-guests-work-last.md) and
[is the guest record the same shape as the account record?](is-the-guest-record-the-same-shape-as-the-account-record.md)
— and the Findings below carry forward everything in it). the durability record lost its standing because its
guest-side reasoning was argued from a rejection that does not hold up. Nothing was found wrong with
its signed-in reasoning on its own terms — it is opened here anyway, because demoting a decision
record demotes the whole thing, not the flawed half of it. Its reasoning for this bound is preserved
below as an option rather than a settled answer.

## Options

*Indefinitely, on any device.* What the durability record chose. The board in progress, every board a player has
finished, and their whole play record are all there when they return — on any device they sign in
from, however long they have been away, and however the last session ended. the durability record's reasoning was
that this is what an account is for: a player who takes the action of signing in specifically to
protect their work should get the strongest promise the product makes, not a slightly better version
of the guest one.

*One bound for everyone.* Give a signed-in player only what a guest gets, or give a guest what a
signed-in player gets. See
[how long does a guest's work last?](how-long-does-a-guests-work-last.md#options) for the durability record's
reasoning against this: it either abandons what [../problem.md](../problem.md) asks for, or it cannot
be kept for a player with nothing to attach work to. If this question and that one are ever answered
the same way, they collapse into a single question.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**This bound, once set to anything beyond the current session, forces a server.** the durability record's Risk
section said so directly: the signed-in half cannot be delivered without something off-device, and
that consequence was real enough that it was recorded before what the server holds had been argued.
That consequence is
already acted on — [ADR-0010](../decisions/0010-the-store-needs-a-host-so-this-system-has-a-server.md)
records that a server exists — so nothing about answering this question re-opens whether to build
one. What remains open is what that server holds and how it is operated, and
[how is the server operated?](how-is-the-server-operated.md) is the latter half.

**[ADR-0010](../decisions/0010-the-store-needs-a-host-so-this-system-has-a-server.md) was reasoned entirely from the signed-in bound this question now reopens, and says so
itself.** Its own Risk section: "its whole basis is one promise in one record. If the durability record's
signed-in bound is ever revised, this goes with it." Its own Revisit-when section: "the durability record is
superseded and the signed-in bound is dropped... should be superseded in the same change." Demoting
the durability record is exactly that event. This is recorded as a finding rather than acted on, because
superseding a decision record is outside what this question can do on its own — it needs its own
decision, made with the full inventory of what the server holds in view, not made as a side effect
of opening this file.

**Two bounds, one per persona, are a standing cost, not a one-time edit.** Every promise in
[../guarantees/](../guarantees/) now has to name which persona it covers, and a promise that quietly
generalises from this bound to the guest one will read as true and be false for half the players.
This holds regardless of where this bound lands, as long as it differs from the guest one.
