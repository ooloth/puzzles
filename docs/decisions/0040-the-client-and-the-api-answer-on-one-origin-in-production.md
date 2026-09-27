---
number: 40
status: accepted
date: 2026-09-26
---

# 40 — The client and the API answer on one origin in production

## Forced by

- [ADR-0023](0023-a-service-worker-answers-every-navigation-after-the-first.md) has a service worker
  answer every navigation after the first, so a returning player's first network request is an API
  call for content not yet on the device. [../problem.md](../problem.md) names that as the ordinary
  wait, the one every active player meets at least daily.
- [../constraints.md](../constraints.md), "Mobile networks — setup cost, not bandwidth": a round trip
  costs 270ms to 2s on the links this is built for, a fresh connection costs three to four of them,
  and the last chance to persist is a fire-and-forget send on `visibilitychange`.
- [../constraints.md](../constraints.md), "Browsers — a second origin costs round trips": a
  cross-origin JSON request waits for a preflight, Safari caches one for at most ten minutes per URL,
  a beacon carrying JSON preflights, and a second hostname needs its own connection unless coalesced.
- [../constraints.md](../constraints.md), "Browsers — client-side storage is not durable": a
  server-set cookie is the only mechanism there that carries an identifier across Safari's storage
  wipe unaided, and it is capped to seven days when the API resolves to a different provider from the
  page, or blocked outright when the API is on another site.
- [ADR-0028](0028-the-client-build-and-the-http-server-are-separate-tools.md) makes the client build
  and the HTTP server separate tools, so the two halves are two things to arrange rather than one
  process by default.

## Decision

**In production the browser reaches the client's files and the API on one origin: one scheme, one
hostname, one port.**

The properties this was scored against were derived from the moments the browser talks to the
server, and written into the question before any arrangement was named:

1. A cookie the API sets keeps its declared lifetime in Safari.
2. An API call adds no round trip beyond the request itself.
3. An API call after the page loads needs no new connection.
4. The send on `visibilitychange` reaches the server with nothing ahead of it.
5. The service worker can fetch, hold and replay API responses.
6. The server carries no cross-origin policy unless an arrangement requires one.

One origin satisfies all six by construction. Every split fails 2, 3, 4 and 6, and a split across
providers or sites also fails 1. Property 5 holds either way.

**The reason is the round trips, and the cookie is kept reachable rather than relied on.** Properties
2 to 4 hold whether or not any cookie is ever set. Whether sessions or recovery are carried by a
cookie is still open at
[how does a second device recognise the same person?](../questions/how-does-a-second-device-recognise-the-same-person.md)
and [is guest recovery worth building?](../questions/is-guest-recovery-worth-building.md). This record
keeps that mechanism available and does not commit to it.

**This settles the origin and nothing about how it is served.** Whether the API process also serves
the files, a proxy routes by path, or a platform or CDN does, is
[what serves the client's files in production?](../questions/what-serves-the-clients-files-in-production.md).
How API paths and client paths are kept apart on the one origin is settled by
[ADR-0041](0041-api-paths-live-under-api-and-every-other-path-is-the-clients.md).
How the local runs join the two processes is derived from this record afterwards; the production-like
run matches it per
[ADR-0039](0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md).

**Resources.** Network is where this binds, as round trips rather than bytes: a split adds a preflight
to every JSON write and a connection setup to the first call. CPU does not bind: whichever process
serves the files, static bytes at this audience sit far below the capacity recorded in
[../constraints.md](../constraints.md). Memory and storage do not bind, because no arrangement
changes what is held on the server or the device.

**Checked and found binding on nothing:** deploying the halves on separate schedules. The service
worker keeps an old client running against a new API under any arrangement, so the API tolerates
older clients either way, and nothing recorded asks for separate schedules.

## Enforced by

**Nothing. Asserted only.** Nothing is deployed. It becomes true when M1's fourth slice deploys both
halves behind one hostname, and the client calls the API by a path relative to its own origin rather
than by an absolute URL. A check that the built client contains no absolute API URL could enforce the
second half once
[what runs the checks on every change?](../questions/what-runs-the-checks-on-every-change.md) is
answered at M2.

## Rejected

- **Two hostnames on one provider**, such as `app.` and `api.` both served by the same platform. Its
  case is real: each half is hosted and deployed on its own terms, a CDN can sit in front of the
  files alone, and the cookie still passes Safari's test because both CNAMEs share a registrable
  domain. It is rejected because the send on `visibilitychange`, the one send with no second chance,
  carries a preflight ahead of its data when it crosses origins, per
  [../constraints.md](../constraints.md). The only way around that is an API that never accepts a
  non-safelisted header, which lets the topology set the write contract. **Reverses if** the client
  stops needing a fire-and-forget send at page hide, for instance because iOS gains background sync,
  and something recorded asks for separately hosted halves.
- **Two hostnames on different providers**, such as a static host for the files and a machine
  elsewhere for the API. Its case: each half goes to the host best at it, which is the most common
  shape for a static client with an API. It is rejected for the same reason as the option above, the
  preflight ahead of the send at page hide. It would stay rejected if that reason reversed, because a
  cookie the API sets is then capped to seven days in Safari, silently, per
  [../constraints.md](../constraints.md), which removes the only unaided recovery mechanism before
  anything has decided whether to use it. **Reverses if** the option above reverses and the recovery
  and session questions both settle on something other than a server-set cookie.
- **Different sites**, the API on a registrable domain of its own. Its case: complete independence,
  including of domains. It is rejected because the API's cookies are then third-party and blocked
  outright by Safari's ordinary cookie blocking, per [../constraints.md](../constraints.md).
  **Reverses if** no feature ever needs a cookie from the API and both rejections above have
  reversed.
- **Not yet.** It is rejected because M1's third slice has the client call the API and needs to know
  where the request goes, and the fourth slice chooses a host that has to support whatever this says.
  Wiring the local call first is the direction that hides the fault, per
  [ADR-0039](0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md).

## Risk

**One origin puts API paths and client paths in one namespace.** A catch-all that returns
`index.html` for unknown paths answers an unknown API path with 200 and HTML, and a CDN in front can
cache API responses or strip `Set-Cookie` if its rules are written for the files. How the two are
kept apart is settled by the record named above.

**One hostname may not be enough to keep the cookie.** Safari records what it compares a request
against only from a network response to a top-level navigation, in memory. Where the service worker
answers the navigation and the hostname is a CNAME to a provider's domain, even a same-origin API's
cookie may be capped, per [../constraints.md](../constraints.md). That is reasoned from source and
unobserved, and it applies to every arrangement this record weighed, so it belongs to
[how does the domain reach the deployment?](../questions/how-does-the-domain-reach-the-deployment.md).

**The host must be able to present both halves on one hostname.** Most can, through one process, a
proxy or a routing rule, but a host that can only serve static files and functions from separate
hostnames is out.

## Revisit when

- Safari raises its preflight cache cap, or the Fetch spec safelists `application/json`, so that a
  split stops costing a round trip per write.
- A requirement appears that one origin cannot meet, such as the files needing a host that cannot
  route API paths to the server.

## Also update

- [x] questions/README.md — the origin question becomes a **Given** for M1's third and fourth slices;
      the path-split question is added to the third slice as a **Must answer**
- [x] architecture.md — says the browser reaches both halves on one origin
- [x] constraints.md — "Browsers — a second origin costs round trips" added, and the Safari cookie
      rule corrected against WebKit trunk
- [x] glossary.md — nothing introduced
- [x] guarantees/ — no new promise; the record keeps a mechanism reachable and promises nothing
