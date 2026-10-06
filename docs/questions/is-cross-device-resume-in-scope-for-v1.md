---
opened: 2026-08-30
status: open
resolves_into: decision
---

# Is cross-device resume in scope for v1?

## Why it matters

It is the single largest fork in the app's complexity. Saying yes brings identity across devices, a
sync protocol and a conflict rule; saying no removes all three. The server copy stays either way:
[ADR-0009](../decisions/0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md) keeps
one because a player never loses in-progress work and play is recorded from the first player, and
neither reason involves a second device.

## What would settle it

Two things, and the first is research rather than judgement.

[How long does Safari really keep our storage?](how-long-does-safari-really-keep-our-storage.md)
decides whether a returning player ever loses local data in practice. Any interaction with the page
resets the clock, so active play holds it open indefinitely and the answer turns entirely on the
length of the gap a lapsed player can take. The recorded figure is thirty days. What remains
unconfirmed is whether a shipped browser matches the source. The answer sizes how often a lapsed
player depends on the server copy, which is the copy a second device would read.

The rest is a product call: whether progress following a player is part of what this is, or a
convenience that can wait.

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Ported from the legacy documentation review, 2026-08-30. Analysed in depth 2026-08-31.

## Options

*No — progress is per device.*
[ADR-0009](../decisions/0009-the-durable-copy-of-a-players-state-is-not-on-their-device.md) rules
out keeping everything on the device, and
[ADR-0010](../decisions/0010-the-store-needs-a-host-so-this-system-has-a-server.md) gives the durable
copy a server, but neither rests on second devices, so neither rules this out. Saying no keeps the
server and the server copy, which recover a player's work on the same device. What it removes is
identity across devices, the sync protocol and the conflict rule. What it costs a player is that
switching devices starts over.

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

**The maintainer has said cross-device resume comes after v1** (2026-10-04). That answers the
product call under "What would settle it" and leaves two things open. The first is which of "No"
and "Not in v1, but keep the door cheap" v1 ships with. The second is the decision record this
question resolves into, which has not been written.

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

This is the cheapest recovery available and it is invisible to the player.

**Three things break it, and they are worth stating plainly.** The exemption depends on how the
hostname reaches the server: since Safari 16.4 a server-set cookie is capped back to seven days if
the setting server looks third-party by CNAME or by IP.
[ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md) puts the
API on the page's own origin, which passes that test, except where the hostname is a CNAME to a
provider's domain and a service worker answered the navigation (see
[../constraints.md](../constraints.md)). Whether the domain avoids that is
[how does the domain reach the deployment?](how-does-the-domain-reach-the-deployment.md). The cookie
must be set by the server, never by JavaScript, and the two are indistinguishable at the point of
reading. And it survives a storage wipe but not a deliberate cookie clear, a private window, or a
browser reinstall.

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

**Whether a lapsed player finds their work depends on a bound nobody has set.**
[../problem.md](../problem.md) intends that a player's record is theirs to keep and outlives any one
device, and no guarantee has committed to it: nothing promises how long a player's work lasts.
Safari clears all script-writable storage after thirty days without interaction, so a player
returning after five weeks finds nothing on the device. What they find on the server depends on
whether the server copy can be reached again, which is the anonymous server copy below for a guest
and signing in for a signed-in player. How long each persona's work lasts is open. See
[how long does a guest's work last?](how-long-does-a-guests-work-last.md) and
[how long does a signed-in player's work last?](how-long-does-a-signed-in-players-work-last.md).
The durability half of this question waits on those, which leaves this question's release timing
as the only part that can be worked now.

**Every option here needs the same careful write path.** The dominant storage failure is not
eviction and not quota; it is ordinary rejected writes whose error names misidentify their own
cause. Careful write handling — no swallowed rejections, no branching on the error, no immediate
retry against a dead connection — is required under every option. That work does not count as a cost of
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
flow that has to be built anyway. Minting a stable identifier on first visit, even with nothing to claim, makes the later migration a lookup rather than a rescue. That is the fourth
option above, and it costs almost nothing today.

**Two things, usually discussed as one, with completely different costs.** Separating them
dissolves most of this question.

*An anonymous server copy.* The server mints an opaque token, sets it as an `HttpOnly` cookie, and
stores a blob against it. No signup, no email, no sessions beyond the cookie, no password anything.
One endpoint to write and one to read.

*Durable identity.* Accounts, magic links, passkeys or codes. Signup, recovery, deletion, support,
and an email provider.

**Almost everything meant by "accounts are needed for durability" is the anonymous server copy, and
that is not accounts.** The durability promise as written is scoped to the same device, and the
anonymous copy keeps it without any of durable identity's cost. Durable identity extends it to
other devices, which is a promise nobody has made yet.

**Durable identity is additive rather than migratory, provided the anonymous copy exists.** The
anonymous token is the claimable anchor: adding accounts later becomes "attach this account to the
token you already hold" rather than a rescue operation for stranded players. Skipping the anonymous
copy is what makes durable identity expensive later, not deferring durable identity itself.

**One argument does pull durable identity earlier, and it is commercial rather than technical.** A free
account exists partly to capture an address, which is the only channel for telling existing
players about anything paid. If accounts arrive at the same moment as a paid tier, the players
accumulated before it — the ones most likely to buy — cannot be reached. That argues for identity
shipping some months ahead of monetisation rather than alongside it.

**An opaque token that singles out an individual is likely personal data under GDPR even with no
name attached**, so the anonymous copy does not escape
[do privacy regulations apply?](do-privacy-regulations-apply.md) — it only makes the answer
smaller.

*Unverified — no source recorded.*
