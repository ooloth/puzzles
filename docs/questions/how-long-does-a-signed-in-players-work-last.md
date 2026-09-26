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

No guarantee bounds this, and that absence is deliberate: nothing promises how long a player's
work lasts. What exists is an intention in [../problem.md](../problem.md),
stated with no bound and no device named. For a signed-in player, this question is what turns that
unbounded sentence into an actual promise instead of a claim two people could read two different
ways.

This bound does not run into the client-storage eviction problem
[../constraints.md](../constraints.md) records for guests — a signed-in player's record lives off the
device, so Safari's thirty-day window and Chrome's origin eviction do not apply to it directly. What
this question has to settle is not "how do we survive eviction" but "what do we actually promise,
and to which devices."

Answering this in the affirmative — any bound at all beyond the current session — forces a
consequence: something off-device has to hold the record. That consequence is decided separately, in
[ADR-0010](../decisions/0010-the-store-needs-a-host-so-this-system-has-a-server.md), "a server
exists." That record rests entirely on a signed-in bound that nothing now states, and it says
explicitly that if the bound is ever dropped it has no independent basis and should be superseded in
the same change. The bound is not a decided fact; it is this open question. So whether
[ADR-0010](../decisions/0010-the-store-needs-a-host-so-this-system-has-a-server.md) should also be
revisited is live, and it is flagged here rather than settled, because this file does not settle it.

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
[how long does a guest's work last?](how-long-does-a-guests-work-last.md) for the durability record's
reasoning against this: it either abandons what [../problem.md](../problem.md) asks for, or it cannot
be kept for a player with nothing to attach work to. If this question and that one are ever answered
the same way, they collapse into a single question.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**This bound, once set to anything beyond the current session, forces a server.** The signed-in half
cannot be delivered without something off-device. That consequence is already acted on —
[ADR-0010](../decisions/0010-the-store-needs-a-host-so-this-system-has-a-server.md) records that a
server exists — so nothing about answering this question re-opens whether to build one. What remains
open is what that server holds and how it is operated, and
[how is the server operated?](how-is-the-server-operated.md) is the latter half.

**No answer here can remove the server.**
[ADR-0010](../decisions/0010-the-store-needs-a-host-so-this-system-has-a-server.md) rests on two
records rather than on this bound: the store, from [ADR-0009](../decisions/0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md),
and withholdable content, from
[ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md). Its Revisit-when
section needs both superseded before it falls.

**Two bounds, one per persona, are a standing cost, not a one-time edit.** Every promise in
[../guarantees/](../guarantees/) now has to name which persona it covers, and a promise that quietly
generalises from this bound to the guest one will read as true and be false for half the players.
This holds regardless of where this bound lands, as long as it differs from the guest one.
