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
not genuinely first-party, and a server-set cookie is the only identifier that survives Safari's
storage wipe without asking the player for anything. Whether that mechanism is ever used is a later
question; whether it can be is decided here.

## What would settle it

Establishing what separating them would actually cost and what it would buy, rather than assuming
either. Three things to check rather than assume: whether Safari's test is failed by a same-registrable-domain
arrangement or only by a genuinely third-party one, whether any candidate host makes serving both
halves under one origin awkward, and whether anything wants them separate — independent deploy
cadence, different tooling, a CDN in front of one and not the other.

The answer may also be "one origin, and nothing rests on it", which is different from "one origin,
because the cookie needs it". The second commits us to a recovery mechanism the first leaves open.

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

**The Safari rule this turns on is the weakest-sourced entry in [../constraints.md](../constraints.md).**
That file records the IP-matching clause as described by third parties rather than by Apple. It
should not decide a topology until somebody establishes it. See
[how does the domain reach the deployment?](how-does-the-domain-reach-the-deployment.md), which asks
the same underlying thing about what the browser resolves.

**Being forced into one origin and choosing it are different outcomes.** Both may end with the client
and the API together, and only one of them constrains every later hosting decision. Which one this is
should be explicit in the record.
