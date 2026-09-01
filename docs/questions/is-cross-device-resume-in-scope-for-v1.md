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

## What would settle it

Two things, and the first is research rather than judgement.

[How long does Safari really keep our storage?](how-long-does-safari-really-keep-our-storage.md)
decides whether a returning player ever loses local data in practice. Any interaction with the page
resets the clock, so active play holds it open indefinitely and the answer turns entirely on the
length of the gap a lapsed player can take. The recorded figure is thirty days, which makes the
local-only branch considerably stronger than a seven-day window would. What remains unconfirmed is
whether a shipped browser matches the source.

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

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**A "no" here makes most of the sync design vacuous.** Divergence requires two writers. With one
device ever writing a board, the deterministic merge in
[what the server does with puzzle state](what-does-the-server-do-with-puzzle-state.md) never
runs, per-cell timestamps never matter, and clock skew cannot invert anything. All of that
machinery exists to serve this answer being yes — which is worth knowing before costing it.

**Recovery is cheaper than transfer, but only by one specific mechanism.** Both need a copy
elsewhere and a way to know it is the right player's. What separates them is that recovery can use
an identifier the *browser* still holds, while transfer needs one the *player* holds.

Safari's storage wipe deletes non-cookie website data, and a server-set `HttpOnly` cookie is not
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
however a session is interrupted. Safari clears all script-writable storage after thirty days
without interaction. A player returning after five weeks finds nothing, and that is an interruption
by any ordinary reading. So the durability promise as written may already require what cross-device
resume requires — in which case the expensive machinery is not optional and this question is only
about whether to also get transfer, which by then is nearly free.

The thirty-day figure weakens this argument without removing it. The promise is unbounded, so it is
broken by a lapse of any length, and a month is well within what "life intervened" covers. What
changes is the size of the affected group: a month of absence is far rarer than a week, so the
question becomes whether the promise should be bounded rather than whether it can be kept.
[ADR-0006](../decisions/0006-what-a-players-work-survives.md) bounds it per persona: a
guest's work lasts as long as the browser keeps it, and a signed-in player's survives on every
device. That settles the durability half of this question and leaves only its release timing.

**There are exactly two ways to keep that promise, and the cheap one is worse than it looked.**
A server copy with durable identity, or preventing eviction by requiring home-screen
installation, which is the one confirmed exemption — see
[is home-screen install required for durability?](is-home-screen-install-required-for-durability.md).
The second is cheaper to build and puts friction on an audience `../problem.md` describes as
having no assumed technical sophistication, and it only works for players who accept the prompt.
Those are the alternatives; there is no third.

Two later findings weakened the second one specifically. **Installing starts an empty store** —
tab and installed storage are separate — so prompting a player who has already been playing
destroys the progress the prompt was meant to protect, unless something carries it across, and
the only place to carry it through is the server copy this branch was avoiding. And **install
does not address the failure that actually dominates**: writes rejected because WebKit killed
the network process under memory pressure, which install has no bearing on. Both are recorded in
[../constraints.md](../constraints.md). The install-only branch is therefore narrower than the
straight comparison above suggests: it protects new players who install immediately, against one
of two failure modes.

**A local-only answer does not avoid the hard part of the write path.** The dominant storage
failure is not eviction and not quota; it is ordinary rejected writes whose error names
misidentify their own cause. Careful write handling — no swallowed rejections, no branching on
the error, no immediate retry against a dead connection — is required under every option here,
including the one where nothing is ever sent anywhere. That work does not count as a cost of
saying yes, which slightly narrows the gap between the branches.

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

**Engagement frequency changes who is exposed, not whether anyone is.** A daily release creates
the *opportunity* for daily play; it does not produce it. Whether the clock fires depends on
retention, which is unknown and which a small new audience is unlikely to have much of. A month is
long enough that most lapses never reach it, which narrows this exposure without closing it.

And the exposure inverts in the worst possible way. **The daily model protects the players who need
protection least.** Someone playing every morning was never at risk; someone who lapses for eight
days and comes back is the one who loses their board — and they are simultaneously the most
valuable recovery case, because finding their progress gone confirms the decision to drift away.

Durability is a property of the tail, not the median, so a favourable shift in the distribution of
gaps is worth something and settles nothing.

**Saying no is cheap to reverse, but only with one precaution.** Adding sync later to an app that
never had identity means existing players either abandon their progress or go through a claim
flow that has to be built anyway. Minting a stable identifier on first visit — even with no server
and nothing to claim — makes the later migration a lookup rather than a rescue. That is the fourth
option above, and it costs almost nothing today.

**Three layers, usually discussed as one, with completely different costs.** Separating them
dissolves most of this question.

*Layer 0 — local only.* Progress in the browser, no server. What a static build gives you.

*Layer 1 — an anonymous server copy.* The server mints an opaque token, sets it as an `HttpOnly`
cookie, and stores a blob against it. No signup, no email, no sessions beyond the cookie, no
password anything. One endpoint to write and one to read.

*Layer 2 — durable identity.* Accounts, magic links, passkeys or codes. Signup, recovery,
deletion, support, and an email provider.

**Almost everything meant by "accounts are needed for durability" is Layer 1, and Layer 1 is not
accounts.** The durability promise as written is scoped to the same device, and Layer 1 keeps it
without any of Layer 2's cost. Layer 2 extends it to other devices, which is a promise nobody has
made yet.

**Layer 2 is additive rather than migratory, provided Layer 1 exists.** The anonymous token is
the claimable anchor: adding accounts later becomes "attach this account to the token you already
hold" rather than a rescue operation for stranded players. Skipping Layer 1 is what makes Layer 2
expensive later, not deferring Layer 2 itself.

**Layer 1 only works if Safari judges the cookie-setting server genuinely first-party.** A
static host with its API on another provider is exactly the shape that fails, and it fails
silently — see [../constraints.md](../constraints.md). Adding accounts later is cheap; moving
hosting later because the recovery mechanism does not work is not.

**One argument does pull Layer 2 earlier, and it is commercial rather than technical.** A free
account exists partly to capture an address, which is the only channel for telling existing
players about anything paid. If accounts arrive at the same moment as a paid tier, the players
accumulated before it — the ones most likely to buy — cannot be reached. That argues for identity
shipping some months ahead of monetisation rather than alongside it.

**An opaque token that singles out an individual is likely personal data under GDPR even with no
name attached**, so Layer 1 does not escape
[do privacy regulations apply?](do-privacy-regulations-apply.md) — it only makes the answer
smaller.

*Unverified — no source recorded.*
