---
opened: 2026-09-02
status: answered
resolves_into: decision
---

# Do the client and the API share an origin?

**Answered, by [ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md): one origin in production.** This file
is kept only until it has been committed with its findings, then deleted. Do not work it.

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

**The answer covers production only, and local runs are derived from it afterwards.** Per the
maintainer on 2026-09-26, the local arrangements are worked out from whatever production turns out to
be, and they are not a factor in choosing it.
[ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)
already binds the production-like run to production's arrangement. How the fast loop joins the two
processes follows once this is answered.

## Properties the answer is scored against

Derived from the moments the browser talks to the server, before any arrangement is named. Each
names what it rests on.

The moments: the first visit fetches the document and assets and then calls the API; every later
visit has the service worker answer the navigation
([ADR-0023](../decisions/0023-a-service-worker-answers-every-navigation-after-the-first.md)) and
calls the API for content not yet on the device, which [../problem.md](../problem.md) names as the
ordinary wait; play writes state back to the server, and the last chance to do so is a
fire-and-forget send on `visibilitychange` ([../constraints.md](../constraints.md)); the server may
set a cookie; the service worker may fetch and hold API responses ahead of need; a deploy ships both
halves; the server can be down.

1. **A cookie the API sets keeps its declared lifetime in Safari.** Keeps the only unaided recovery
   mechanism reachable, per [../constraints.md](../constraints.md). Whether it is used is open at
   M12 and M13; whether it can be is decided here.
2. **An API call adds no round trip beyond the request itself.** A wait at the start of a session is
   counted in round trips on the links [../constraints.md](../constraints.md) records, where one
   costs 270ms to 2s.
3. **An API call after the page loads needs no new connection.** A fresh connection costs three to
   four round trips, per [../constraints.md](../constraints.md).
4. **The send on `visibilitychange` reaches the server with nothing ahead of it.** Nothing guarantees
   the page is still running to complete a second step, per [../constraints.md](../constraints.md).
5. **The service worker can fetch, hold and replay API responses.** Needed by
   [is a puzzle fetched before it is needed?](is-a-puzzle-fetched-before-it-is-needed.md) and by
   offline play at M9.
6. **The server does no work production does not need**, so no cross-origin policy exists unless an
   arrangement requires one. A policy that is wrong fails in the browser and not on the server.
7. **The first visit's assets can be cached immutably and delivered without revalidation**, per
   [../constraints.md](../constraints.md). Checked for whether any arrangement prevents it.
8. **Reversal cost in each direction**, named as concrete work.

**Resources.** Network is where this binds: properties 2 to 4 are round trips. CPU does not bind,
because serving static bytes is far below the capacity recorded in
[../constraints.md](../constraints.md). Memory and storage do not bind, because no arrangement
changes what is held.

**Checked for and found binding on nothing:** deploying the halves on separate schedules. The
service worker keeps an old client running against a new API whatever the arrangement, so the API
has to tolerate older clients either way, and nothing recorded asks for separate schedules.
*Reasoned — from [ADR-0023](../decisions/0023-a-service-worker-answers-every-navigation-after-the-first.md), 2026-09-26.*

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

**It was read in WebKit's own source on 2026-09-02, re-read at trunk on 2026-09-26, and is recorded
in [../constraints.md](../constraints.md) at the *Sourced* tier.**

**The answer to "same registrable domain or genuinely third-party?" is: neither framing is the one
that matters.** The cap is applied to a same-site subresource request whose CNAME target or IP address
does not match what Safari recorded for the page's host. So `api.example.com` on a different
provider *is* caught, and being on the same registrable domain does not save it. The API on the
**same hostname** as the app, path-routed, passes because it is compared with itself. Two subdomains
CNAMEd to the same provider's registrable domain also pass, so one hostname is sufficient for this
test but not the only arrangement that passes it.

**One hostname may not be enough on its own.** Safari records what it compares against only from a
network response to a top-level navigation, in memory. Where a service worker answers the navigation,
per [ADR-0023](../decisions/0023-a-service-worker-answers-every-navigation-after-the-first.md), and
the hostname is a CNAME to a provider's domain, even a same-hostname API's cookie may be capped. This
is reasoned from source and unobserved; [../constraints.md](../constraints.md) carries the detail.

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

**Whether a CDN or reverse proxy in front of two different backends rescues a split topology.** The
source now says what the comparison is: a CNAME target's registrable domain, or an IP within /16. So
two hostnames fronted by one proxy that answers both from the same addresses would pass Safari's
cookie test. It rescues only that property. The round trips below still apply to a split.

*Reasoned from source — WebKit trunk, read 2026-09-26, per [../constraints.md](../constraints.md). No
proxy was observed doing this.*

**Being forced into one origin and choosing it are different outcomes.** Both may end with the client
and the API together, and only one of them constrains every later hosting decision. Which one this is
should be explicit in the record.

**Nothing here yet says the cookie mechanism will be used.** The constraint decides what stays
reachable. Whether sessions are carried this way is
[how does a second device recognise the same person?](how-does-a-second-device-recognise-the-same-person.md)
and [is guest recovery worth building?](is-guest-recovery-worth-building.md), both open.

### What each arrangement costs in round trips and server behaviour

Researched 2026-09-26 by four agents, each opening primary sources. The claims marked *opened by the
maintainer's agent* were re-opened by the agent working this question; the rest are the research
agents' readings, passed on.

**A cross-origin `fetch` preflights when it sends JSON, and a same-origin one never does.**
`Content-Type: application/json` is not a CORS-safelisted value, so a cross-origin POST carrying it
sends an `OPTIONS` request first and waits for the answer. A GET with no custom headers does not
preflight, and `credentials: 'include'` alone does not either. A same-origin request never reaches
the preflight step.

*Sourced — WHATWG Fetch `fetch.bs` (whatwg/fetch), CORS-safelisted request-header and HTTP fetch
algorithms, read 2026-09-26.*

**A preflight is cached per exact URL, and Safari keeps it at most ten minutes.** The cache entry is
keyed on the request's URL, not its origin, so `/puzzle/2026-09-26` and `/puzzle/2026-09-27` each
preflight. The caps are 600 seconds in WebKit, 2 hours in Chromium and 24 hours in Firefox, and 5
seconds when the server sends no `Access-Control-Max-Age`.

*Sourced — `fetch.bs` cache entry definition (URL is a field), opened by the maintainer's agent;
WebKit `Source/WebCore/loader/CrossOriginPreflightResultCache.cpp` lines 42 to 43,
`maxPreflightCacheTimeout = 600_s`, opened by the maintainer's agent; Chromium
`services/network/cors/preflight_result.cc` `kMaxTimeout = base::Hours(2)` and Firefox
`nsCORSListenerProxy.cpp` cap of 86400, read by a research agent. All 2026-09-26.*

**The send on `visibilitychange` preflights when it is cross-origin and carries JSON.** A beacon
always sends credentials, and switches to CORS mode when its body's type is not safelisted, so a JSON
beacon to another origin waits for a preflight before the data leaves. `fetch` with `keepalive` does
the same. Both survive the page going away in Chromium and WebKit, because the load moves to the
browser's network process, so the preflight is an added round trip rather than a lost send. Chromium
before version 81 and Safari before an unrecorded version refused a keepalive request that needed a
preflight.

*Sourced — W3C Beacon `index.bs`; WebKit `Source/WebCore/Modules/beacon/NavigatorBeacon.cpp` lines 138
to 157, opened by the maintainer's agent; WebKit `NetworkResourceLoader::abort` and Chromium
`keep_alive_url_loader.h`, read by a research agent, 2026-09-26. The Chromium 81 figure rests on one
comment in mdn/browser-compat-data#16414 and was not confirmed in the bug tracker.*

**The preflight can be avoided cross-origin only by never sending a non-safelisted header.** Sending
JSON as `text/plain` and carrying no custom headers keeps a cross-origin request simple. That is a
rule on every write the API accepts, set by the topology rather than by what the write carries.

*Reasoned — from the safelist in `fetch.bs`, 2026-09-26.*

**A second hostname needs its own connection unless the browser coalesces it.** HTTP/2 and HTTP/3
allow reusing a connection for another hostname when the certificate covers both, and Chrome and
Firefox also require the addresses to overlap. Chromium keys connections on credentials mode, and the
Fetch spec keys its connection pool on credentials too, so an uncredentialed cross-origin `fetch`,
the default, does not share the document's connection even when coalescing applies. Safari coalesces
by Apple's account and publishes no conditions. A same-origin `fetch` uses the document's
connection. Chromium keeps a used idle connection 5 minutes; Safari publishes no figure.

*Sourced — RFC 9113 §9.1.1 wording via httpwg/http2-spec, RFC 9114 §3.3, Chromium
`net/base/privacy_mode.h`, `net/spdy/spdy_session_key.h` and `net/socket/client_socket_pool.cc`,
Firefox `StaticPrefList.yaml`, WWDC 2020 session 10111, read by a research agent 2026-09-26. That a
same-origin fetch reuses the document's connection is the agent's inference from the pool key.*

**A cross-origin API that reads cookies needs an exact-origin CORS policy.** With credentials the
server must echo the requesting origin and send `Access-Control-Allow-Credentials: true`; a wildcard
fails. A same-site request still carries `SameSite=Lax` and `Strict` cookies.

*Sourced — `fetch.bs` CORS check and same-site mode algorithms, read by a research agent 2026-09-26.*

**One hostname has its own traps, and none of them is a round trip.** A catch-all that returns
`index.html` for unknown paths answers an unknown API path with 200 and HTML. A CDN in front can
cache API responses or strip `Set-Cookie`, per Cloudflare's cache-behaviour documentation, and Vercel
caches external rewrites by default for projects created on or after 2026-04-06. A service worker's
navigation fallback matches only requests whose mode is `navigate`, so `fetch` calls to the API are
unaffected, per Workbox's routing reference. How API paths and client paths are kept apart on one
hostname is not tracked by any question yet.

*Sourced — `@fastify/static` README, Cloudflare and Vercel documentation, Workbox `workbox-routing`
reference, read by a research agent 2026-09-26. Not opened by the maintainer's agent.*

**No spike is run, because nothing left would separate the arrangements.** Every property that
discriminates is documented behaviour read in specifications and engine source. The one unobserved
risk, Safari's CNAME comparison after a service-worker navigation, applies to every arrangement
equally, so it belongs to
[how does the domain reach the deployment?](how-does-the-domain-reach-the-deployment.md).

*Reasoned — 2026-09-26.*

**What this did not examine:** Safari's idle connection lifetime, Caddy's and AWS's routing, and each
candidate host's own routing features, which belong to slice 4.
