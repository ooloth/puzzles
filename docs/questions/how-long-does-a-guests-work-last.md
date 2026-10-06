---
opened: 2026-09-01
status: open
resolves_into: decision
---

# How long does a guest's work last?

## Why it matters

A guest has not signed in. [../constraints.md](../constraints.md) records that eviction of
client-side storage is all-or-nothing: Safari deletes every script-writable store after thirty days
without interaction, and Chrome evicts a whole origin, least-recently-used first, when it is over
its disk budget. There is no arrangement where the board is lost and something else about the guest
survives — whatever bound this question settles on, the mechanism that enforces it is binary.

No guarantee bounds this, and that absence is deliberate: nothing promises how long a player's
work lasts. What exists is an intention in [../problem.md](../problem.md)
that a player's record is theirs to keep. Read one way that means "until the tab closes"; read the
other it means "forever, anywhere". For a guest specifically, neither reading is true today, and the
gap between them is this question.

[../problem.md](../problem.md) says a record of a player's play is theirs to keep and outlives any
one device. A guest's work today lives and dies in the one browser that made it. Whatever this
question settles on, it settles how far short of that ask a guest falls.

A guest can lose work with no error, no crash and no report — see
[the recorded failure mode](../failure-modes/a-players-progress-vanishes-after-a-month-away.md). That
is accepted as a cost of whichever bound is chosen, not a bug in how the bound is enforced.

This also matters because of what stops being true if the answer changes. If the guest tier stops
being where new players start, the case for keeping this bound cheap and device-local weakens. If a
guest is ever shown anything that accumulates — see
[does a guest see anything that accumulates?](does-a-guest-see-anything-that-accumulates.md) — the
cost of a narrow bound stops being "an unfinished board" and starts being "a forty-day streak", which
is a different question with a different answer. And if a shipped browser turns out not to match the
thirty-day figure in [../constraints.md](../constraints.md) — see
[how long does Safari really keep our storage?](how-long-does-safari-really-keep-our-storage.md) — a
much shorter real window makes a browser-only bound weak enough to reconsider on its own.

## What would settle it

The client and the API answer on one origin in production, per
[ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md), which is what a server-set cookie needs to pass Safari's first-party
test — see [../constraints.md](../constraints.md). So the anonymous-server-copy option below is
available at full strength, subject to how the domain resolves, which is
[how does the domain reach the deployment?](how-does-the-domain-reach-the-deployment.md).

[Do privacy regulations apply?](do-privacy-regulations-apply.md) settles whether data about a person
who cannot be identified — no login, no email, nothing but a cookie — can lawfully be kept without
being deletable on request. That determines whether the same option's second cost is real.

[Does a guest see anything that accumulates?](does-a-guest-see-anything-that-accumulates.md) sizes
what is actually at stake. A guest shown nothing that accumulates has an unfinished board to lose,
which costs little. A guest shown a streak has something worth protecting, which changes what a
narrow bound is worth accepting.

## Properties the answer is scored against

...

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Opened 2026-09-01 by demoting the durability record, "What a player's work survives" (deleted; this
question, its two siblings, and the Findings below carry forward everything in it). Its guest bound
rested on rejecting an anonymous server copy for guests on three costs, and those costs do not all
hold. See Findings. The hosting costs are settled by
[ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md) and
[ADR-0043](../decisions/0043-the-server-runs-on-a-digitalocean-droplet.md). Everything the record
argued about the guest bound is kept below as options and findings rather than as a settled answer.

## Options

*Browser-only, no recovery, kept until finished.* A guest's work survives in the
browser that made it, for as long as that browser keeps it — no second device, no recovery once it is
gone. Today that means the board a guest is working on is kept until they finish it, rather than
discarded when the day changes. Cheapest to build: nothing to operate, nothing stored about anyone,
no endpoint to abuse. The cost falls entirely on a guest who lapses past the eviction window.

*One bound for everyone.* Give a guest the same durability a signed-in player gets, or give a
signed-in player only what a guest gets. Against it: the signed-in bound cannot be kept for a
player with nothing to attach work to, and the guest bound abandons what
[../problem.md](../problem.md) asks for. A single bound therefore looks either dishonest or
expensive, which is why the question is split into two personas. If
this question and
[how long does a signed-in player's work last?](how-long-does-a-signed-in-players-work-last.md) are
ever answered the same way, the two questions collapse into one.

*Guests keep only the current day; an unfinished board is discarded.* A board stale after twenty-four
hours makes eviction irrelevant to guests entirely — the thirty-day figure stops being load-bearing
for this tier at all. It is also what circle9puzzle and inkwellgames do, so it is a known pattern
rather than a strawman. Against it: it contradicts the two things
[../problem.md](../problem.md) lists first — work is never lost however the session is interrupted,
and reopening finds the exact board a player left — and because being unable to finish yesterday's
puzzle is a known annoyance in the products that do it. Keeping one unfinished board past midnight
costs almost nothing.

*An anonymous server copy, recovered through a server-set cookie.* The cheapest recovery available
and invisible to the player: local data is wiped, an `HttpOnly` cookie set by the server survives
(cookies are exempt from the non-cookie storage wipe, per [../constraints.md](../constraints.md)),
the server hands the state back, and nothing is ever said. Three costs count against it. See Findings for which of them are
settled.

*Answer only what a guest-only first release needs.* The intended sequence ships guests first, so
answering only what that phase needs would be the cheapest thing to do today. Against it:
[which client storage mechanism](which-client-storage-mechanism.md) holds a guest's work is
the one stack choice with no clean migration path: changing it later means moving every existing
player's data with code that runs once, in their browser, correctly, with no server to retry from.
The end state has to be decided regardless of which phase decides what gets built first.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Three costs count against the anonymous server copy, and two of them are not settled facts.**
They are rows keyed to tokens nobody will present again accumulating indefinitely; data about people
who cannot be identified also not being deletable on request; and the mechanism silently degrading
to a seven-day cookie lifetime if the API is not judged first-party by Safari. The third is a
property of hosting topology. One origin, per
[ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md), removes
it, except where the hostname is a CNAME to a provider's domain and a service worker answered the
navigation, which [../constraints.md](../constraints.md) records as reasoned from source and
unobserved. The second depends on [do privacy regulations apply?](do-privacy-regulations-apply.md),
which is unresearched. Only the first cost, orphan rows accumulating, is a property of the mechanism
itself, and a TTL on the row, or a periodic cleanup job keyed to the cookie's own expiry, bounds it
to a known, small amount of dead data. None of this means the option should be built. It means the
costs do not rule it out.

**A guest can still lose work silently, and every option above except full recovery accepts that.**
Whether a guest is ever told the limit is a separate, unanswered question. Saying nothing keeps the
loss silent; saying it on the first visit is a warning before there is anything to lose. Nothing
found tracks this as its own question yet.

**Home-screen install is the only confirmed mitigation, and it is not a substitute for a bound.** An
installed web app is exempt from the clearing mechanism entirely, but install cannot be required of
anyone, its store starts empty so progress has to be carried across deliberately, and since Safari 26
a player can decline the isolated store while still adding the icon. See
[is home-screen install required for durability?](is-home-screen-install-required-for-durability.md).

**If a guest's storage is shaped as a record rather than a single board** — see
[is the guest record the same shape as the account record?](is-the-guest-record-the-same-shape-as-the-account-record.md)
— then whatever this question settles on is a bound on that whole record, not on the board alone. If
a play record, streaks or stats are ever shown to a guest, they sit inside whichever bound this
question picks and are promised nothing more by that shape choice alone.

**Two bounds, one per persona, are a standing cost, not a one-time edit.** Every promise in
[../guarantees/](../guarantees/) now has to name which persona it covers, and a promise that quietly
generalises from the signed-in case to the guest case will read as true and be false for half the
players. This holds regardless of where the guest bound above lands, as long as it differs from the
signed-in one.
