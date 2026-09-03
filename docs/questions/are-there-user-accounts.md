---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Are there user accounts?

## Why it matters

Progress is currently promised without one. Cross-device resume may be impossible to do well
without one.

## What would settle it

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30.

Options and findings ported from legacy ADR-11 (track progress via anonymous server-side sessions).

## Options

*No accounts.* An opaque identifier issued on first visit, with progress bound to it. Nothing to
build, nothing for a player to do, and no credentials to store or protect. Progress binds to one
browser on one device.

*Accounts from the start.* Solves cross-device continuity and abuse resistance immediately, at
the cost of building signup, recovery and credential storage before anything needs them.

*No accounts, but an anchor that can later claim one.* A stable per-player record exists from the
first visit purely so that a later "claim this progress with an account" upgrade has somewhere to
attach without restructuring what came before. Defers the work without foreclosing it.

*Accounts as the boundary between tiers of the product.* Guests play the current puzzle with
progress held locally and no sync. Signing in — through Google, Apple, or email — unlocks
cross-device sync, a durable play record, streaks and stats. A paid tier would sit above that, over
the archive, advanced hints, or additional variants. The account is not built to serve
authentication; it is built because several things the product wants to offer have to attach to a
person rather than to a browser, and because it is the natural place to put a payment boundary if
one is ever wanted.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**What an account is for is not settled, but the leading candidate is durability: a signed-in
player's work surviving on every device** — see
[how long does a signed-in player's work last?](how-long-does-a-signed-in-players-work-last.md),
which is still open.
[Is cross-device resume in scope for v1?](is-cross-device-resume-in-scope-for-v1.md) asks when
that ships, not whether accounts exist, and [is there a paid tier?](is-there-a-paid-tier.md) is a
use an account can be put to rather than a reason to have one.

**This may not be a separate question.** Every identity mechanism catalogued in
[how does a second device recognise the same person?](how-does-a-second-device-recognise-the-same-person.md)
answers both at once — whether a player signs up falls out of which mechanism is chosen, rather
than being decided first and constraining it. Worth resolving whether these merge before either
is answered, since keeping both invites answering the same thing twice and differently.

Deferring accounts looks free on one reading: without them there is no abuse resistance — an
identifier anchored in browser storage can be discarded and reissued at will — but the fix for that
is accounts, which is the same fix that would be built anyway.

*Reasoned — a property of client-side storage under the user's control.*

That reading holds only while nothing needs to attach to a person, and two things do. A durable play
record is one — see
[how long does a signed-in player's work last?](how-long-does-a-signed-in-players-work-last.md). A
paid tier would be the other, so [is there a paid tier?](is-there-a-paid-tier.md) staying answered no
is a condition of it rather than a detail: the moment something is worth gating, abuse resistance
stops being free to defer.

**Accounts are Layer 2 of three, and most durability arguments are about Layer 1.** An anonymous
server copy keyed to a cookie keeps the same-device durability promise with no signup at all;
accounts extend it across devices and carry a subscription. Deferring them is cheap as long as the
anonymous layer exists to attach to later — see
[is cross-device resume in scope for v1?](is-cross-device-resume-in-scope-for-v1.md).

**The maintainer leans toward accounts, for what they make possible rather than for what they
authenticate.** Recorded from the maintainer as a lean rather than a decision. Three reasons, and
the first is the one that carries weight on its own: a play record that outlives any single device
has to attach to a person, and [../problem.md](../problem.md) now states that record as part of the
vision. Cross-device sync becomes a lookup rather than a transfer problem. And an account is where a
payment boundary would go if [a paid tier](is-there-a-paid-tier.md) is ever wanted, which makes
building one early an option-preserving move rather than speculative work.

**A paid tier's entitlement and identity is not held open by any record.** Withholding content
itself is [ADR-0012](../decisions/0012-puzzle-content-is-served-by-a-runtime-not-bundled.md)'s job
and that is settled. What is not settled is knowing who is entitled, and the threat is a paid tier
that ends up enforceable only by a rescue operation bolted on after the fact rather than an account
able to carry entitlement from the start. [../problem.md](../problem.md) records that the tier
itself is uncommitted and deliberately not ruled out; [is there a paid
tier?](is-there-a-paid-tier.md) is where that commitment gets made, and this question is what it
would depend on.

**Signing in is a cost to the player and the vision minimises it, not the reverse.**
`../problem.md` asks that work follow the player with nothing reconciled by hand. An account that
gates the first puzzle behind a signup form contradicts the audience it describes: casual solvers,
no assumed technical sophistication, found rather than marketed. Whatever is decided here, the first
play has to work without one, which is what makes the guest tier above a requirement rather than a
tier.

**Signing in is a blocking wait, and it is a cold one.** The waiting-moment enumeration
(2026-09-02, mined into [../problem.md](../problem.md) under "Where a player waits") found nine
moments where the client is blocked on a server response. Signing in is one of them, and it is
first-contact-after-a-gap rather than mid-session, so it lands on whatever wake-up cost the
infrastructure carries. It is listed as conditional there rather than committed to, because it exists
only if this question answers yes.

*Reasoned — from that enumeration, 2026-09-02.*

**Signing in is also what an outage takes away, and staying signed in need not be.** Every moment in
[../problem.md](../problem.md) under "Where a player waits" needs the server, so a player cannot sign
in while it is down. Whether an *already* signed-in player is ejected is a design choice this question
should make rather than inherit: a session held locally with a lifetime survives an outage, and one
revalidated on every load does not.

*Reasoned — 2026-09-03.*
