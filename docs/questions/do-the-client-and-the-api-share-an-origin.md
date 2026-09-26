---
opened: 2026-09-02
status: open
resolves_into: decision
---

# Do the client and the API share an origin?

## Why it matters

It decides which hosts are candidates at all. A host that cannot serve both halves under one origin
is out if the answer is yes, and a host chosen while the answer is unsettled may have to be replaced
once it is — which moves both halves, not one.

It also decides whether a mechanism recorded in [../constraints.md](../constraints.md) is available.
Safari withdraws the first-party exemption for a server-set cookie when it judges the setting server
not genuinely first-party, and a server-set cookie is the only mechanism recorded there that carries
an identifier across Safari's storage wipe without the player being asked to do anything. Whether
that mechanism is ever used is a later question; whether it can be is decided here.

## What would settle it

Establishing what separating them would actually cost and what it would buy, rather than assuming
either. Three things to check rather than assume: whether Safari's test is failed by a same-registrable-domain
arrangement or only by a genuinely third-party one, whether any candidate host makes serving both
halves under one origin awkward, and whether anything wants them separate — independent deploy
cadence, different tooling, a CDN in front of one and not the other.

The answer may also be "one origin, and nothing rests on it", which is different from "one origin,
because the cookie needs it". The second commits us to a recovery mechanism the first leaves open.

**The answer covers local runs as well as production, and settles both together.** M1's third slice
is the first to call the API from the client, so it needs the local half before any host exists.
[ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)
requires the production-like local run to match production's arrangement, so that half follows from
the production answer. What this question still has to say is how the fast loop joins the two
processes, and whether that is allowed to differ from production.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-02. Same-origin serving had been asserted in
[README.md](README.md)'s M1 preamble as "a constraint rather than a question of its own", with a
rationale attached — a decision that forecloses hosting options, recorded nowhere, in a file whose
stated job is sequencing. Nothing in [../decisions/](../decisions/) settles it.

## Options

*One origin.* The client and the API answer on the same scheme, host and port. Keeps the server-set
cookie inside Safari's first-party exemption without further argument, and removes cross-origin
request handling entirely. Constrains the host to one that can serve both.

*Separate origins.* The client on one host, the API on another. Frees each to be hosted and deployed
on its own terms. Puts the cookie mechanism at risk in a way that fails silently, and adds
cross-origin handling to every request the client makes.

*One origin, without depending on it.* Serve both together because it is simple, and carry sessions
by something that does not rely on the arrangement. Keeps the topology cheap to change later, at the
cost of not getting the free recovery mechanism.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

### The Safari rule has been established, and it answers this file's first open item

**It was read in WebKit's own source on 2026-09-02 and is now recorded in
[../constraints.md](../constraints.md) at the *Sourced* tier.**

**The answer to "same registrable domain or genuinely third-party?" is: neither framing is the one
that matters.** The cap is applied to a request that looks first-party by hostname and resolves
elsewhere — so `api.example.com` on a different provider *is* caught, and being on the same
registrable domain does not save it. What escapes the test is the API answering on the **same
hostname** as the app, path-routed, because then no second host is resolved and there is nothing to
compare.

*Sourced — per [../constraints.md](../constraints.md), which carries the code and its provenance.*

**A genuinely separate origin is worse than capped, not exempt.** The cap check returns early for
requests that are third-party, because those are already handled by ordinary third-party cookie
blocking. Reading "the cap does not apply" as safety is the trap this entry exists to prevent.

*Sourced — per [../constraints.md](../constraints.md).*

### What the local setup can settle by accident

**Development can answer this question before production does, in the direction that hides the
mistake.** M1's third slice has the client calling the API locally, where they are separate
processes on separate ports unless something proxies them into one origin, a cost
[ADR-0028](../decisions/0028-the-client-build-and-the-http-server-are-separate-tools.md) records and
accepts. Proxy locally and split in production, and nothing cross-origin fails until it is deployed.
So whichever answer this question takes, the local arrangement matches it rather than being wired for
convenience. The mechanism is
[how is the app run locally the way it runs deployed?](how-is-the-app-run-locally-the-way-it-runs-deployed.md).

*Reasoned — 2026-09-20.*

**[ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md) has since made this binding for the production-like run and not for the fast loop.** A
fault the fast loop hides is caught when the slice is verified in the production-like run, so the
fast loop's arrangement is a question of how early a cross-origin fault shows, not whether it shows.
That holds once M2 has built the production-like run. Until then the fast loop is the closest mode
M1's slices are verified in, so its arrangement is the only local check on this answer.

*Reasoned — from [ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md), 2026-09-26.*

### What is still open

**Whether a CDN or reverse proxy in front of two different backends rescues a split topology.** If
one proxy fronts both hostnames and presents the browser the same address for each, the comparison
would pass — but no primary source states that a proxied zone guarantees matching addresses across
hostnames, and the one source asserting it fails sells the remedy. Unresolved, and it only matters if
a split topology is wanted at all.

*Unverified — no source recorded either way.*

**Being forced into one origin and choosing it are different outcomes.** Both may end with the client
and the API together, and only one of them constrains every later hosting decision. Which one this is
should be explicit in the record.

**Nothing here yet says the cookie mechanism will be used.** The constraint decides what stays
reachable. Whether sessions are carried this way is
[how does a second device recognise the same person?](how-does-a-second-device-recognise-the-same-person.md)
and [is guest recovery worth building?](is-guest-recovery-worth-building.md), both open.
