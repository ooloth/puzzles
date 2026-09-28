---
number: 41
status: accepted
date: 2026-09-26
amended: 2026-09-27
---

# 41 — API paths live under `/api/` and every other path is the client's

## Forced by

- [ADR-0040](0040-the-client-and-the-api-answer-on-one-origin-in-production.md) puts the client's
  files and the API on one origin, and its Risk names what that costs: one namespace, where a
  fallback to the entry document answers an unknown API path with 200 and HTML, and a cache rule
  written for the files can reach the API.
- [ADR-0028](0028-the-client-build-and-the-http-server-are-separate-tools.md) makes the client build
  and the server two processes, so something has to route between them in every environment.
- [ADR-0039](0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md)
  has the local runs follow production's arrangement, so the rule is the same in each.
- [ADR-0023](0023-a-service-worker-answers-every-navigation-after-the-first.md) has a service worker
  answer navigations, which is one more layer that has to apply the rule.
- M1's third slice is the first time the client calls the API, per
  [../questions/README.md](../questions/README.md).

## Scored against

Derived from the moments a request on the one origin is routed, before any option was named: the
client calling the API in the fast loop, the production-like run and production; a first navigation,
before a service worker exists; later navigations, which it answers; the send on
`visibilitychange`; an API path with no route; a route being added; and a cache or cookie rule
written for the files.

1. Every layer that routes the origin assigns a given request to the same half: the dev server, the
   production-like run, whatever serves production and the service worker
   ([ADR-0028](0028-the-client-build-and-the-http-server-are-separate-tools.md),
   [ADR-0039](0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md),
   [ADR-0040](0040-the-client-and-the-api-answer-on-one-origin-in-production.md),
   [ADR-0023](0023-a-service-worker-answers-every-navigation-after-the-first.md)).
2. A request that belongs to the API and matches no route gets the API's own 404, not the entry
   document with a 200 ([ADR-0040](0040-the-client-and-the-api-answer-on-one-origin-in-production.md),
   Risk).
3. A route added to or removed from the server needs no edit to any other layer
   ([ADR-0040](0040-the-client-and-the-api-answer-on-one-origin-in-production.md), Risk: a layer that
   misses one serves the client there).
4. The first navigation to the app's address gets the entry document with no redirect
   ([../problem.md](../problem.md), "Where a player waits"; [../constraints.md](../constraints.md),
   "Mobile networks — setup cost, not bandwidth").
5. What the rule matches on is sent by every browser at the declared floor
   ([ADR-0026](0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md);
   [the app runs on any device still receiving security updates](../guarantees/the-app-runs-on-any-device-still-receiving-security-updates.md)).
6. A caching or cookie rule in front of the server can be scoped to the client's files with the same
   match ([ADR-0040](0040-the-client-and-the-api-answer-on-one-origin-in-production.md), Risk).
7. Every serving arrangement still open in M1's fourth slice can apply the rule, so this record does
   not settle part of that slice ([../questions/README.md](../questions/README.md)).
8. No path the client could use is claimed by the API
   ([ADR-0040](0040-the-client-and-the-api-answer-on-one-origin-in-production.md), Risk: one
   namespace).
9. A cache in front keeps the two halves apart without keying on a request header
   ([ADR-0040](0040-the-client-and-the-api-answer-on-one-origin-in-production.md), Risk: a CDN can
   cache an API response).

**Left out, because their inputs belong to later milestones:** whether any API path is reached by a
navigation, such as a sign-in callback, which depends on
[are there user accounts?](../questions/are-there-user-accounts.md); and what a player's URLs look
like, which depends on the client's routing, open per [ADR-0038](0038-the-renderer-is-react.md), and
on [do content and puzzle routes share an origin?](../questions/do-content-and-puzzle-routes-share-an-origin.md).

## Decision

**A path belongs to the API if and only if it starts with `/api/`. Every other path belongs to the
client.** The match is on the whole segment, so `/apidocs` is the client's, and so is `/api` with no
trailing slash. Every layer applies this one match: the dev server's proxy sends `/api/` to the
server, whatever serves production does the same, and the service worker's fallback to the entry
document excludes it.

It satisfies all nine properties. Every layer examined can match a path prefix, which is 1, 5 and 7.
Everything under `/api/` reaches the server, which answers what it has no route for with its own 404,
which is 2 and 3. The root is the client's, so the first navigation gets the entry document directly,
which is 4. A cache rule scoped to "not `/api/`" never reaches an API response and needs no header in
its key, which is 6 and 9. Matching the whole segment is 8.

**The research is in the question this record answers**, which was committed before it was
deleted: `git show 4e052ac:docs/questions/how-are-api-paths-kept-apart-from-client-paths-on-one-origin.md`.
The vendor findings behind properties 5 to 9 are there with their sources, and the ones a later
question needs have moved: the Safari and Vite facts, and the path-only routing of Cloudflare Pages
and CloudFront, to [../constraints.md](../constraints.md), and Cloudflare Pages' fallback and
CloudFront's `Set-Cookie` caching to
[what serves the client's files in production?](../questions/what-serves-the-clients-files-in-production.md).

**This does not decide whether the API is versioned in its path.** `/api/v1/` would be this rule with
a versioning scheme on top, and that belongs to
[what crosses the client/server boundary?](../questions/what-crosses-the-client-server-boundary.md)
at M3.

**Resources.** None binds. Network: no request or round trip is added, and the prefix adds four bytes
to a URL. CPU: one string comparison per request, far below the capacity in "Servers — framework
throughput is three orders of magnitude above this workload" in
[../constraints.md](../constraints.md). Memory and storage: nothing held on the server or the device
changes.

**What it closes:** a client URL can never start with `/api/`. Reopening that means renaming every
API route in every layer, and the server answering the old paths for as long as the service worker
keeps older clients running.

## Enforced by

**Partly, and the rest lands at two later points.** The rule holds in three places:

- The server's half is enforced. `buildServer` in `src/server/app.ts` asserts in an `onRoute` hook
  that every route starts with `/api/`, so a route registered anywhere else stops the server, and
  `src/server/app.test.ts` checks that with a property test. The dev server and `pnpm preview` send
  `/api/` to the server through the one key `proxyApiTo` builds in `vite.config.ts`, and
  `vite.config.test.ts` checks that `/api/…` reaches the server while `/`, `/apidocs` and `/api` get
  the entry document.
- Nothing yet sends `/api/` to the server in production. M1's fourth slice does, through whatever
  serves production.
- M9's service worker lists `^/api/` in the denylist of its fallback to the entry document, per
  [how does the app itself stay available offline?](../questions/how-does-the-app-itself-stay-available-offline.md).

The part that lands last is the service worker's, and nothing breaks without it until an API URL is
opened as a navigation.

## Rejected

- **A prefix for the client, with the API at the root** — fails property 4. Its case: API routes need
  no prefix, and every client URL sits under one segment, which is one match for the files. But the
  app's own address, `/`, is then outside the client, so the first navigation is redirected to the
  prefix, which costs a round trip on the first open. Serving `/` directly as well makes the rule a
  list. **Reverses if** players never enter at the root, for instance because every entry is an
  installed app's start URL under the prefix.
- **An explicit list of API routes** — fails property 3. Its case: no prefix on anything. But every
  layer holds its own copy of the list, and a route missing from one is served the client there, with
  a 200 and no error. **Reverses if** every layer's list is generated from the server's routes, so
  there is one copy.
- **Split by request mode**, a navigation to the client and everything else to the API — fails
  property 5. Its case: no naming rule and nothing to keep in step, and Workbox already routes on the
  request's mode. But Safari and iOS Safari before 16.4 send no `Sec-Fetch-Mode` header, per
  [../constraints.md](../constraints.md), and the floor includes Safari 15, so the server cannot tell
  their navigations from API calls. **Reverses if** the floor rises to Safari 16.4; properties 7 and 9
  would then decide it, because Cloudflare Pages and CloudFront cannot route on a header and every
  cache would need `Vary: Sec-Fetch-Mode`.
- **Content negotiation on `Accept`** — fails property 7. Its case: one URL can answer a page to a
  browser and data to the client. But Cloudflare Pages' `_routes.json` has no header field and
  CloudFront chooses an origin by path only, so some serving arrangements still open cannot apply it,
  per "Hosting — some routing layers choose a backend by path alone" in
  [../constraints.md](../constraints.md). **Reverses if** every serving arrangement
  left open can route on a header, and every cache in front keys on `Accept`.
- **Route existence first**, where whichever half has a match answers and everything else falls back
  to the entry document — fails property 2. Its case: there is no rule to maintain, and platforms such
  as Vercel and Cloudflare Pages do it natively. But an API path with no route matches nothing, so it
  gets the entry document with a 200 by construction. **Reverses if** the client stops needing a
  fallback to the entry document, because every client URL is a real file.
- **Not yet** — because M1's third slice needs a proxy rule for the client's first call, and the
  Vite dev server already answers any path it does not proxy with the entry document and a 200, per
  [../constraints.md](../constraints.md). Leaving `/hello` at the root makes it the pattern M3 copies.

## Risk

**Anything the server has to answer outside `/api/` needs an exception, and an exception is a
list.** A host that probes a fixed health-check path, a `/.well-known/` entry the server must
generate, or a sign-in callback registered at a fixed URL would each need one. Most hosts let the
health-check path be configured, and `/.well-known/` files can be static, but neither has been
checked against a chosen host.

**Unknown client paths still get the entry document with a 200.** This record keeps unknown *API*
paths loud. What a mistyped client URL shows is the client's routing, which is open.

## Revisit when

- A path outside `/api/` has to reach the server, and it cannot be moved under the prefix.
- A client URL needs to start with `/api/`.
- A routing layer is adopted that cannot match on a path prefix.

## Also update

- [x] questions/README.md — the path question becomes a **Given** for M1's third slice, which then
      has no **Must answer** left; the fourth slice gains a **Given** that the host sends `/api/` to
      the server; M9's offline question notes the denylist
- [x] architecture.md — the path rule, on the line that already cites
      [ADR-0040](0040-the-client-and-the-api-answer-on-one-origin-in-production.md)
- [x] constraints.md — Safari before 16.4 sends no fetch metadata headers, and Vite's dev server falls
      back to the entry document for any path it does not proxy
- [x] glossary.md — nothing introduced
- [x] guarantees/ — no new promise
- [x] unfinished.md — the server answers `/hello` at the root until the third slice moves it
