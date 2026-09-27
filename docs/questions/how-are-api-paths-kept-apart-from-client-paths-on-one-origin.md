---
opened: 2026-09-26
status: open
resolves_into: decision
---

# How are API paths kept apart from client paths on one origin?

## Why it matters

[ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md) puts the
client's files and the API on one origin, so every path on that origin belongs to one of them and
something has to tell which. That rule is what every client call is written against, what a proxy,
platform or CDN routes on, and what the service worker's navigation fallback excludes at M9.

It fails silently when it is wrong. A catch-all that returns `index.html` for unknown paths answers a
mistyped or removed API path with 200 and HTML, so the client sees a parse error rather than a 404. A
CDN rule written for the files can cache an API response or strip its `Set-Cookie`. Neither produces
an error on the server.

It shows up in production, where whatever serves the origin routes on it, and in local runs, where the
fast loop has to send API paths to the server process and everything else to the dev server. The
local rule is derived from the production one, per
[ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md).

## What would settle it

Knowing which routing layers have to apply the rule, which is partly
[what serves the client's files in production?](what-serves-the-clients-files-in-production.md), and
what each can match on: a path prefix, an explicit list of routes, or a request property such as
`Sec-Fetch-Mode`. Then which rule every layer can apply the same way, so a path cannot be the API's in
one layer and the client's in another.

## Properties the answer is scored against

Derived from the moments a request on the one origin is routed: the client calling an API route by a
relative path, in the fast loop, the production-like run and production; a browser's first
navigation to the app, before any service worker exists; every later navigation, which the service
worker answers; the send on `visibilitychange`; a request for an API path that has no route, whether
mistyped, removed, or sent by an older client the service worker kept running; a route being added
to the server; and a caching or cookie rule, in whatever sits in front, written with the client's
files in mind.

1. **Every layer that routes the origin assigns a given request to the same half.** The layers are
   the fast loop's dev server, which joins two processes on two ports
   ([ADR-0028](../decisions/0028-the-client-build-and-the-http-server-are-separate-tools.md)); the
   production-like run, which follows production
   ([ADR-0039](../decisions/0039-changes-are-verified-in-a-production-like-local-run-and-only-the-fast-loop-may-differ.md));
   whatever serves production
   ([ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md)); and
   the service worker, which answers navigations after the first
   ([ADR-0023](../decisions/0023-a-service-worker-answers-every-navigation-after-the-first.md)).
2. **A request that belongs to the API and matches no route gets the API's own 404**, not the entry
   document with a 200. The failure otherwise is silent, per the Risk in
   [ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md).
3. **A route added to or removed from the server needs no edit to any other layer to be routed
   correctly.** A route missing from one layer is served the client in that layer, which is the same
   silent failure as property 2
   ([ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md), Risk).
4. **The first navigation to the app's address gets the entry document with no redirect.** That is
   the first-open wait in [../problem.md](../problem.md) under "Where a player waits", and a redirect
   adds a round trip, which costs 270ms to 2s on the links this is built for, per "Mobile networks —
   setup cost, not bandwidth" in [../constraints.md](../constraints.md). The document is a build
   output ([ADR-0024](../decisions/0024-the-entry-document-is-a-build-output-not-a-per-request-render.md)).
5. **What the rule matches on is sent by every browser at the declared floor.** The floor is Safari
   and iOS 15 and their contemporaries, declared in `vite.config.ts` per
   [ADR-0026](../decisions/0026-one-config-declares-the-browser-floor-for-the-build-and-the-checks.md),
   and it exists for [the app runs on any device still receiving security
   updates](../guarantees/the-app-runs-on-any-device-still-receiving-security-updates.md).
6. **A caching or cookie rule in front of the server can be scoped to the client's files with the
   same match**, so it cannot cache an API response or strip its `Set-Cookie`
   ([ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md), Risk).
7. **Every serving arrangement still open can apply the rule.** What serves the files and where this
   runs are Must answers in M1's fourth slice, per [README.md](README.md). A rule only some
   arrangements can apply would settle part of that slice from this one.
8. **No path the client could use is claimed by the API.** A prefix matched as a substring, such as
   `/api`, also takes `/apidocs` and `/api-keys`, so a client route there never renders. Added after
   research, from the finding below
   ([ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md), Risk:
   one namespace).
9. **A cache in front keeps the two halves apart without keying on a request header.** A rule that
   gives one URL different answers by header needs `Vary` on that header at every cache, and a CDN
   that ignores it serves one half's response to the other. Added after research, from the finding
   below ([ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md),
   Risk: a CDN can cache an API response).

**Checked and binding on nothing as a property of the rule:** that a routing layer preserves the HTTP
method. A platform redirect that turns a `POST` into a `GET` breaks every rule equally, so it
belongs to [what serves the client's files in production?](what-serves-the-clients-files-in-production.md).

**Resources.** None of the four binds. Network: no rule adds a request or a round trip once property
4 holds, and a prefix adds a few bytes to a URL. CPU: matching a request is a string or header
comparison per request, far below the capacity in "Servers — framework throughput is three orders of
magnitude above this workload" in [../constraints.md](../constraints.md). Memory and storage: no rule
changes what is held on the server or the device.

**Left out, because the inputs belong to later milestones:**

- Whether any API path is ever reached by a navigation, such as a sign-in callback. That depends on
  [are there user accounts?](are-there-user-accounts.md). It would separate the options, because a
  rule that sends every navigation to the client cannot serve one.
- What a player's URLs look like, and whether they are shared. The client's routing is open per
  [ADR-0038](../decisions/0038-the-renderer-is-react.md), and whether other content shares the
  origin is [do content and puzzle routes share an origin?](do-content-and-puzzle-routes-share-an-origin.md).

**Checked and binding on nothing as a property:** that API paths stay valid for older clients across
deploys. Every option keeps its own paths stable once chosen. What differs is what changing the rule
later would cost, which is weighed by what each option forecloses rather than scored here.

## Resolves into

A decision record in [../decisions/](../decisions/).

## Source

Raised 2026-09-26 while working
[ADR-0040](../decisions/0040-the-client-and-the-api-answer-on-one-origin-in-production.md), whose
research found the single-origin traps and no question covering them. The server answers `/hello` at
the root today, which is the first instance.

## Options

*A prefix for the API*, such as `/api/`. Every layer matches one string, and anything under it that
has no route is a 404 from the server. Every API URL carries the prefix, and a client route can never
use it.

*A prefix for the client*, with the API at the root. The same mechanism turned around. A player's URLs
all carry the prefix, which is the part they see and share.

*An explicit list of API routes.* No prefix on anything. Every layer holds the list, so adding a
route means updating each of them, and a route missing from one is served the client.

*Split by request mode.* A navigation, whose `Sec-Fetch-Mode` is `navigate`, gets the client and
everything else gets the API. Needs no naming rule. Every layer has to be able to match on a request
header, and a static file host or CDN may not.

*Content negotiation on `Accept`.* One URL answers HTML to a request that accepts `text/html` and JSON
otherwise. Every cache has to key on `Accept`, and `fetch` sends `*/*` unless told otherwise.

*Route existence first.* Whichever half has a match for the path answers, and anything neither
matches falls back to the entry document. Vercel's `handle: filesystem` and Cloudflare Pages'
fallback to static assets work this way.

*Not yet.* Leave `/hello` at the root and choose when M3 adds real routes. The pattern M3 copies is
then whatever `/hello` happened to be.

**Considered and not options here:** a versioned prefix such as `/api/v1/` is the API prefix with a
versioning scheme attached, and whether the API is versioned in its path belongs to
[what crosses the client/server boundary?](what-crosses-the-client-server-boundary.md). A
file-extension rule separates files from navigations rather than the API from the client. A
framework's file convention, such as Next.js `pages/api` or SvelteKit `+server.js`, needs one tool
owning both halves, which [ADR-0028](../decisions/0028-the-client-build-and-the-http-server-are-separate-tools.md)
rules out.

## Findings

*Findings are working evidence, not settled fact. Nothing here binds a decision until it graduates to [../constraints.md](../constraints.md) or into a decision record.*

**Safari and iOS Safari before 16.4 send no `Sec-Fetch-Mode` header.** browser-compat-data gives
`version_added` as 76 for Chrome, 90 for Firefox and 16.4 for Safari, with iOS mirroring Safari. The
declared floor includes Safari and iOS 15, so a split on that header sees no header at all from those
browsers, and a navigation from one is routed as whatever "no header" means.

*Sourced — [`Sec-Fetch-Mode.json`](https://raw.githubusercontent.com/mdn/browser-compat-data/main/http/headers/Sec-Fetch-Mode.json)
in mdn/browser-compat-data, opened by the main session 2026-09-26, after a research agent reported it.
A tool claim; re-check if the floor moves.*

**The Vite dev server's proxy runs before its fallback to the entry document, and the fallback
answers any other path with 200 and HTML.** With `server.proxy` set to `{ "/api/": … }` and a target
that was not listening, `/`, `/nope`, `/hello` and `/apidocs` each returned `200 text/html`, and
`/api/nope` returned `502 text/plain` from the proxy. So an API route the proxy does not cover is
answered by the client silently, and a key of `/api/` does not take `/apidocs`.

*Measured — Vite 8.3.1 as pinned in `package.json`, default `appType: 'spa'`, one run of `curl -w
'%{http_code} %{content_type}'` per path on macOS, by the main session 2026-09-26. A research agent
got the same ordering independently with a key of `/api`.*

**Vite's proxy matches on a path prefix or, for a key starting with `^`, a regular expression, and a
`bypass(req, res, options)` function can read request headers.** The docs say: "Any requests whose
request path starts with that key will be proxied to the specified target. If the key starts with
`^`, it will be interpreted as a `RegExp`." `bypass` is present in the v8.3.1 source. A research
agent's spike used a catch-all key whose `bypass` returned the URL for `Sec-Fetch-Mode: navigate`,
and got the entry document for `/` and a proxied request for `/hello`.

*Sourced and measured by a research agent 2026-09-26, from [vite.dev server options](https://vite.dev/config/server-options.html)
and `packages/vite/src/node/server/middlewares/proxy.ts` at tag v8.3.1. Not re-opened.*

**Workbox's `NavigationRoute` allowlist and denylist are regular expressions over path and query,
and it has no header hook.** The docs say they "are matched against the concatenated `pathname` and
`search` portions of the requested URL". Matching on a header needs a plain `Route` with a custom
match function.

*Sourced by a research agent 2026-09-26, from [workbox-routing](https://developer.chrome.com/docs/workbox/modules/workbox-routing/)
and `NavigationRoute.ts` at Workbox v7.3.0. Not re-opened.*

**Every production layer examined routes on a path prefix and on a list of paths, and two cannot
route on a header.** Fastify, nginx, Caddy, Vercel rewrites, Cloudflare Pages `_routes.json`, the
Cloudflare ruleset engine and CloudFront path patterns all match on path. Cloudflare Pages
`_routes.json` has no header field, and CloudFront chooses an origin by path pattern only, so
choosing by header there needs a CloudFront Function or Lambda@Edge. nginx can route on a header
through `map` and a variable in `proxy_pass`, which then needs a `resolver`.

*Sourced by a research agent 2026-09-26 from each vendor's documentation, which it names. Not
re-opened.*

**Cloudflare Pages falls back to the entry document for a path nothing else matches.** Its routing
docs say an unmatched request "will fall back to a static asset if there is one. Otherwise, the
Function will fall back to the default routing behavior for Pages' static assets", and with no
top-level `404.html` Pages treats the project as a single-page app. So on that platform an unknown
API path is answered with the entry document unless the rule sends the whole API prefix to the
server.

*Sourced by a research agent 2026-09-26 from [Pages Functions routing](https://developers.cloudflare.com/pages/functions/routing/)
and [serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/). Not
re-opened.*

**A split on a request header needs `Vary` on that header, and Cloudflare ignores `Vary` other than
`Accept-Encoding` by default.** MDN: "Including a `Vary` header ensures that responses are separately
cached based on the headers listed in the `Vary` field." Cloudflare's cache documentation says it
does not consider `Vary` values in caching decisions by default.

*Sourced by a research agent 2026-09-26 from [MDN Vary](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Vary)
and [Cloudflare cache-control](https://developers.cloudflare.com/cache/concepts/cache-control/).
Not re-opened, and the Cloudflare quote came through a summarising fetch.*

**A prefix matched as a substring takes client paths.** A project that tested `startsWith("/api")`
found `/apidocs`, `/apis` and `/api-keys` sent to the API.

*Sourced by a research agent 2026-09-26 from [nstfkc/gemi PR #540](https://github.com/nstfkc/gemi/pull/540).
Not re-opened. The Vite measurement above shows a key of `/api/` avoids it there.*

**The service worker's navigation fallback only matches navigations.** Workbox's `NavigationRoute`
"will only match incoming Requests whose `mode` is set to `navigate`", so `fetch` calls to the API
are not intercepted by it. An API URL opened as a navigation, such as a download link, would be.

*Sourced — Workbox `workbox-routing` reference, read by a research agent 2026-09-26 and re-opened by
the main session the same day.*

**`@fastify/static` hands a path with no file to Fastify's 404 handler.** Its README says: "If a
request matches the URL `prefix` but no file is found, Fastify's 404 handler is called." So serving
the files from the API process does not by itself answer unknown paths with `index.html`; a fallback
to the document is something added on top, and that is where the silent 200 would come from.

The README documents `wildcard: false` for something else: it globs the served folder at startup
and creates a route per file, and it is recommended inside an encapsulated context "to support index
resolution and nested not-found-handler". An earlier version of this finding said the README
documents `wildcard: false` plus a not-found handler as the way to keep unknown API paths out of the
files. It does not describe that combination.

*Sourced — [`@fastify/static` README](https://github.com/fastify/fastify-static), opened by the
main session 2026-09-26. Replaces a finding a research agent read the same day.*
