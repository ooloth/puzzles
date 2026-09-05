---
opened: 2026-09-02
status: open
resolves_into: decision
---

# How does the domain reach the deployment?

## Why it matters

**This is the one piece of deployment plumbing that can foreclose something, and it does it
silently.** [../constraints.md](../constraints.md) records that Safari withdraws the first-party
exemption for a server-set cookie in two cases: the setting server sits behind a CNAME resolving to a
third-party host, or its A/AAAA record resolves to an IP address whose first half does not match the
first half of the IP serving the site. A server-set cookie is the only identifier that survives
Safari's storage wipe without asking the player for anything, which makes it the whole basis of the
recovery mechanism [is guest recovery worth building?](is-guest-recovery-worth-building.md) turns on.

A reverse proxy in front of the origin is exactly the topology that rule describes. So how the domain
resolves is not cosmetic: it can cap the cookie at seven days, and the failure produces no error and
no log line — the cookie simply expires alongside the storage it was meant to outlive.

Whether the system serves both halves from one origin is open, at
[do the client and the API share an origin?](do-the-client-and-the-api-share-an-origin.md). Either way
this question still bites: same-origin does not rescue a cookie that fails the resolution test, so
what the domain resolves to has to be settled with the hosting choice rather than after it.

The rest of it is ordinary and still has to be decided: whether the app answers on the apex or a
subdomain, and where the certificate comes from.

## What would settle it

Establishing what Safari actually does with a proxied domain, rather than reasoning from a rule
Apple has not published. The rule as recorded is described by third parties, so the first task is to
find out whether it is real and how it is evaluated. A same-origin deployment behind one proxy is the
case that matters: the cookie-setting server and the site-serving server are then the same host at
the same address, which may satisfy both tests trivially, or may not survive the CNAME clause
depending on what the browser resolves.

This is testable. A deployed skeleton with a server-set cookie, opened on a real iOS device and left
for the window to elapse, answers it directly — and
[../constraints.md](../constraints.md) already records that this class of behaviour does not
reproduce in a desktop browser.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-02, on finding that no question covered how a browser reaches the deployment at all,
and that a Cloudflare-registered domain puts a candidate proxy directly into the path of the one
mechanism [../constraints.md](../constraints.md) identifies as free recovery.

## Options

*Proxied.* The domain resolves to the proxy's anycast addresses and the proxy forwards to the origin.
Brings TLS, caching and a shield in front of the origin's real address without configuring any of it.
Puts a third party in the path of every request, and is the topology the Safari rule above is
written about.

*DNS-only.* The domain resolves straight to the origin's own address. Nothing sits between the
browser and the server, so the resolution test is whatever the host's own addressing makes it. The
origin then owns TLS — issuance, renewal and the failure when renewal does not happen.

*The platform's default hostname, with no custom domain.* The honest "not yet". Every candidate host
issues a working URL, which is enough to see M1 running. It defers the question rather than answering
it, and defers it past the point where a cookie would be set.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**The domain is registered with Cloudflare and nothing else is settled by that.** A registrar is not
a host and not a proxy. Cloudflare's own platform is a candidate for hosting on its merits like any
other, and using their registrar creates no obligation to use their proxy or their compute.

*Sourced — stated by the maintainer, 2026-09-02.*

**The rule this question turns on is the weakest-sourced entry in
[../constraints.md](../constraints.md).** That file records the IP-matching clause as described by
third parties rather than by Apple, and notes the behaviour was widely reported in 2023 and is absent
from Apple's release notes. It should not decide a topology until somebody establishes it.

*Sourced — per [../constraints.md](../constraints.md), which carries the caveat itself.*

**A same-origin deployment may pass both tests by construction.** If the client and the API are one
origin behind one proxy, the address serving the site and the address setting the cookie are the same
address, so the first-half comparison is trivially satisfied. Whether the CNAME clause also passes
depends on what the browser resolves rather than on what is configured upstream. This is a
plausible reading of the rule, not a finding, and it is the specific thing to go and check.

*Reasoned — from the rule as recorded, which is itself unverified.*

**Certificate ownership follows from the topology rather than being a separate choice.** A proxy
terminates TLS with its own certificate; a DNS-only arrangement leaves issuance and renewal with the
origin, which is work a managed platform absorbs and a bare machine does not. That connects this to
[how is the server operated?](how-is-the-server-operated.md), where an expired certificate is an
outage nobody is watching for.
