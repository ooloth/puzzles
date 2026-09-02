---
opened: 2026-09-01
status: open
resolves_into: decision
---

# Is guest recovery worth building?

## Why it matters

**It decides whether same-origin hosting is forced or merely preferred**, which reaches the platform
choice at the first milestone.
The leading option for a guest's durability bound accepts that a guest can lose everything when the
browser clears its storage, on the grounds that a guest wanting durability should get an account —
see [how long does a guest's work last?](how-long-does-a-guests-work-last.md), still open. That
reasoning has a premise: an account exists to be offered. If the first release ships guests only, it
does not, and the only persona in the product has no recovery at all.

There is exactly one mechanism that restores a lapsed guest's work without asking them for anything,
and whether it works is decided by where the client and the API are deployed relative to each other —
see [../constraints.md](../constraints.md). So this cannot be settled after the hosting choice. It is
an input to it.

## What would settle it

Knowing what a guest stands to lose, which is
[does a guest see anything that accumulates?](does-a-guest-see-anything-that-accumulates.md), and
then weighing the mechanism's three standing costs against it.

The mechanism is cheap to keep available and not free to build. Keeping it available costs one
hosting constraint. Building it means rows accumulating against tokens nobody will present again,
data about people who cannot be identified and therefore cannot be deleted on request, and an
endpoint that will accept writes from anyone — [the recorded failure
mode](../failure-modes/the-write-endpoint-becomes-free-storage.md).

The second of those depends on
[do privacy regulations apply?](do-privacy-regulations-apply.md), which is unresearched.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-01. the durability record demoted on 2026-09-01 rejected an anonymous server copy for guests, giving three reasons. One
of them — that the mechanism silently degrades to seven days when the API is not judged first-party —
is a consequence of a hosting topology nobody has chosen yet, which means an option was rejected
partly on grounds a later decision could remove.

## Options

*Do not build it.* A guest's work lives and dies in the browser that made it, which is what the durability record
records today. Nothing to operate, nothing stored about anyone, no endpoint to abuse. The cost falls
entirely on returning lapsed players.

*Build it, and hold the hosting constraint that makes it work.* The server sets an `HttpOnly` cookie
on first visit and keeps a copy of the guest's record against it. Local storage is cleared, the
cookie survives, the server hands the state back, and the player is never told any of it happened.

*Do not build it, but hold the constraint anyway.* Same-origin costs nothing when a server exists, so
the door can be held open for a milestone or two while the product question above is answered. The
risk is that a door held open indefinitely is a tax paid for nothing.

*Offer accounts early instead.* Skip the anonymous tier and make the first durable thing a sign-in.
Honest and expensive: it introduces identity to an audience [../problem.md](../problem.md) describes
as casual and found rather than marketed, and the first play has to work without one regardless.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**There are exactly three things that can carry a player's work across a wipe, and only one asks
nothing of them.** Work is recoverable only if something can be presented from a fresh starting
state, and there are three candidates for what holds it:

| Carrier | Survives the wipe? | Asks the player for anything? |
| --- | --- | --- |
| Anything the browser holds — IndexedDB, `localStorage`, a locally-minted identifier | No, by definition | No |
| A **server-set** `HttpOnly` cookie | Yes, to a 400-day ceiling | No |
| Something the player holds — an email address, a passkey, a code | Yes | Yes, and that is an account |

The list is exhaustive, which is what makes the middle row load-bearing: it is the only mechanism
that protects a lapsed guest for free, and it is the one the durability record rejected.

*Sourced — the wipe covers non-cookie website data only, and server-set cookies follow their declared
lifetime to a 400-day ceiling, per [../constraints.md](../constraints.md).*

**None of the durability record's three rejection reasons stands unconditionally.** It listed orphan rows,
undeletable data about unidentifiable people, and silent degradation to seven days when the API is
not judged first-party. The seven-day degradation is contingent on
[where does this run?](where-does-this-run.md) — same-origin removes it, and nobody has chosen a
hosting topology yet. The undeletable-data problem is contingent on
[do privacy regulations apply?](do-privacy-regulations-apply.md), which is unresearched. The
orphan-rows cost is overstated: a TTL or a cleanup job on unclaimed rows handles it.

**Home-screen install is the only confirmed mitigation and it is not a substitute.** An installed web
app is exempt from the clearing mechanism entirely. Three things stop it being an answer: install
cannot be required, its store starts empty so progress must be carried across deliberately, and since
Safari 26 the player can decline the isolated store while still adding the icon.

*Sourced — WebKit trunk and the Safari 26 release notes, per [../constraints.md](../constraints.md).*

**Whether a player is actually in the protected store is testable at runtime.**
`navigator.storage.persisted()` reports the same membership that governs deletion, which makes it a
better signal than `display-mode: standalone`. Whatever is decided here, that test is what a decision
about a given player should branch on.

*Sourced — WebKit trunk, `NetworkStorageManager::persistOrigin`, per
[../constraints.md](../constraints.md).*

**The cookie buys one narrow thing.** It recovers the same browser after a wipe. It does not survive a
device change, a browser change, or a player clearing their own data, and it expires at 400 days. So
it is not a weaker form of cross-device sync; it covers a case sync does not, and sync covers cases it
does not.

*Sourced — a consequence of the cookie lifetime ceiling in [../constraints.md](../constraints.md).*

**Signing in does not have to depend on a locally-minted identifier surviving the wipe.** A
locally-minted identifier is script-writable, so the browser's eviction takes it along with
everything else — and takes it from exactly the lapsed players who would need it. The leading option
in
[is the guest record the same shape as the account record?](is-the-guest-record-the-same-shape-as-the-account-record.md)
closes that gap a different way: the guest record and the account record are one shape, so signing in
promotes what is already there instead of needing an identifier to have carried over. That is
separate from the middle row of the table above: the cookie recovers the same browser after a wipe,
and an account promotes the same record from any browser at all.
