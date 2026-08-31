---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Is cross-device resume in scope for v1?

## Why it matters

It is the single largest fork in the app's complexity. Saying yes brings identity, a server copy,
a sync protocol and a conflict rule; saying no removes all four and lets hosting collapse toward
static files. It also decides whether a promise already made — that in-progress work is never
lost — can be kept at all, for reasons that turn out to have little to do with second devices.

## Blocked by

[Is there one puzzle a day, or unlimited play?](is-there-one-puzzle-a-day-or-unlimited-play.md) —
how often a player returns decides whether browser storage is ever evicted, which is most of what
this question turns on.

## Blocks

[Are there user accounts?](are-there-user-accounts.md),
[How does a second device recognise the same person?](how-does-a-second-device-recognise-the-same-person.md),
[What happens to a losing write when syncing?](what-happens-to-a-losing-write-when-syncing.md),
[Who is authoritative over puzzle state?](who-is-authoritative-over-puzzle-state.md).

## What would settle it

Two things, and the first is research rather than judgement.

[What resets Safari's seven-day storage clock?](what-resets-safaris-seven-day-storage-clock.md)
decides whether a returning player ever loses local data in practice. If any visit resets it and
players return weekly, eviction almost never fires and the local-only branch is far stronger than
it looks. If the clock is stricter, the durability promise cannot be kept on-device.

The rest is a product call: whether progress following a player is part of what this is, or a
convenience that can wait.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30. Analysed in depth 2026-08-31.

## Options

*No — progress is per device.* Nothing to build. No identity, no server state, no sync protocol,
no conflict rule, no privacy obligations beyond what a static site incurs. A player who switches
devices starts over, and a player whose browser clears storage loses everything with no recovery.

*Yes, via accounts.* Email and a password or a magic link. Solves transfer and recovery together,
and is the only option that also carries a subscription between devices. Costs a signup flow,
session handling, password reset or an email provider, account deletion for privacy compliance,
and a support burden when someone loses access — all of it ongoing, for one maintainer, for an
audience assumed to have no technical sophistication.

*Yes, via a transfer code.* The first device shows a code; typing it into a second device links
them. No email, no password, no reset, no support flow — and no account to delete. Losing the code
loses the link, which is a real limitation but an understandable one. This sits between the other
two and is usually missed because the debate is framed as accounts-or-nothing.

*Not in v1, but keep the door cheap.* Progress stays local, and a stable identifier is minted on
first visit and stored server-side against nothing in particular, so that a later account or code
can claim it rather than starting from zero. Costs almost nothing now and preserves the option.

## Findings

**Recovery is cheaper than transfer, but only by one specific mechanism.** Both need a copy
elsewhere and a way to know it is the right player's. What separates them is that recovery can use
an identifier the *browser* still holds, while transfer needs one the *player* holds.

Safari's seven-day wipe deletes non-cookie website data, and a server-set `HttpOnly` cookie is not
covered by it — see [../constraints.md](../constraints.md). So an anonymous session cookie can
outlive the progress it points at: local data is wiped, the cookie survives, the server returns
the last synced state, and the player never learns anything happened. No account, no code, no
signup, no support burden.

This is the cheapest recovery available and it is invisible to the player, which is the strongest
argument for storing anything server-side at all — independent of second devices.

**Three things break it, and they are worth stating plainly.** The exemption depends on
deployment topology: since Safari 16.4 a server-set cookie is capped back to seven days if the
setting server looks third-party by CNAME or by IP, which is exactly the shape of a static host
with its API elsewhere. It must be set by the server, never by JavaScript, and the two are
indistinguishable at the point of reading. And it survives a storage wipe but not a deliberate
cookie clear, a private window, or a browser reinstall.

**A new device is never helped by it.** A second browser has no cookie, so there is nothing to
present and nothing to recover. This is the gap that separates recovery from transfer, and no
amount of anonymous-session machinery closes it — transfer requires something the player carries
between browsers, which means an account or a code they can retype.

**Anonymous recovery also fails in a way account-based recovery does not.** If the cookie is
capped or cleared, an account holder signs in again and their work returns. An anonymous holder
has no route back: the row exists on the server, keyed to a token nobody can produce. Same data,
same server, permanently unreachable.

**And it accumulates orphans.** Progress keyed to tokens nobody will present again piles up
indefinitely, which needs a retention policy and raises a privacy question with no easy answer:
data about people who cannot be identified also cannot be deleted on request.

**Which puts an existing promise in question.**
[../guarantees/durability.md](../guarantees/durability.md) says in-progress work is never lost,
however a session is interrupted. Safari clears all script-writable storage after seven days
without interaction. A player returning after eight days finds nothing, and that is an
interruption by any ordinary reading. So the durability promise as written may already require
what cross-device resume requires — in which case the expensive machinery is not optional and
this question is only about whether to also get transfer, which by then is nearly free.

**There are exactly two ways to keep that promise.** A server copy with durable identity, or
preventing eviction by requiring home-screen installation, which is the one confirmed exemption —
see [is home-screen install required for durability?](is-home-screen-install-required-for-durability.md).
The second is cheaper to build and puts friction on an audience `../problem.md` describes as
having no assumed technical sophistication, and it only works for players who accept the prompt.
Those are the alternatives; there is no third.

**The expensive part is identity, not sync.** Sync between one writer's devices is a push on
change and a pull on open. What costs is durable identity: signup, recovery, deletion, support.
This is why the transfer-code option matters — it buys identity that survives a device change
without buying an account, and most of the cost of "yes" is in the part it skips.

**Conflict is far smaller than the category suggests, because of the data shape.** A board is
about 81 independent cells. Merging two divergent copies cell by cell — taking the later value
per cell — leaves a genuine conflict only where both devices edited the *same* cell, which is
rare when one person plays sequentially. That is a timestamp per cell, roughly a few hundred
bytes per board, not conflict-resolution machinery.

Two honest caveats. A merged board can be a state neither device ever displayed, holding progress
from both — usually a pleasant surprise, occasionally confusing. And if a player cleared a wrong
answer on one device and re-derived it on another, a naive merge can reintroduce the cleared
value. Both are edge cases; neither is a reason to avoid merging, and both are worth knowing
before promising that no conflict prompt ever appears.

**A paid tier eventually forces cross-device identity regardless.** Someone who subscribes on
their phone and opens the app on their laptop must not be asked to pay again. So if
[a paid tier](is-there-a-paid-tier.md) ever ships, durable identity ships with it — which means
"no" is a decision about v1 scope rather than about the app's permanent shape, and the machinery
arrives later either way.

**Engagement frequency decides how much of this is real.** If the product is a daily puzzle,
players return often, the seven-day clock rarely expires, and local-only storage is far safer than
it sounds. If play is sporadic, gaps of a week are ordinary and eviction becomes routine. That is
why this question is blocked by
[one puzzle a day or unlimited play](is-there-one-puzzle-a-day-or-unlimited-play.md) — the product
model changes the durability risk by an order of magnitude.

**Saying no is cheap to reverse, but only with one precaution.** Adding sync later to an app that
never had identity means existing players either abandon their progress or go through a claim
flow that has to be built anyway. Minting a stable identifier on first visit — even with no server
and nothing to claim — makes the later migration a lookup rather than a rescue. That is the fourth
option above, and it costs almost nothing today.
